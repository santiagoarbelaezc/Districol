<?php
/**
 * controllers/ProductoController.php
 * Consulta de productos (Solo Lectura)
 * La creación, edición y eliminación han sido retiradas.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/ResponseHandler.php';
require_once __DIR__ . '/../utils/Logger.php';

class ProductoController
{
    // ─── Query base reutilizable ─────────────────────────────────────────────
    private static string $baseSelect = "
        SELECT 
            p.id, p.name, p.description, p.material, p.category, p.options, 
            p.isNew, p.isFeatured, p.marca, p.gramaje, p.brandIconUrl,
            p.created_at, p.updated_at
        FROM products p
        WHERE p.deleted_at IS NULL
    ";

    // ─── Helper: adjuntar imágenes y variantes ──────────────────────────────
    private static function adjuntarRelaciones(PDO $db, array &$productos): array
    {
        if (empty($productos)) return $productos;

        $ids          = array_column($productos, 'id');
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        // Imágenes
        $stmtImg = $db->prepare("SELECT product_id, url FROM product_images WHERE product_id IN ($placeholders)");
        $stmtImg->execute($ids);
        $imagenes = $stmtImg->fetchAll();

        $mapaImagenes = [];
        foreach ($imagenes as $img) {
            $mapaImagenes[$img['product_id']][] = $img['url'];
        }

        // Variantes (para obtener precio)
        $stmtVar = $db->prepare("SELECT product_id, price FROM product_variants WHERE product_id IN ($placeholders) AND available = 1");
        $stmtVar->execute($ids);
        $variantes = $stmtVar->fetchAll();

        $mapaVariantes = [];
        foreach ($variantes as $var) {
            if (!isset($mapaVariantes[$var['product_id']])) {
                $mapaVariantes[$var['product_id']] = (float)$var['price'];
            }
        }

        foreach ($productos as &$prod) {
            $prod['imagenes'] = $mapaImagenes[$prod['id']] ?? [];
            $prod['precio']   = $mapaVariantes[$prod['id']] ?? 0;
            $prod['nombre']   = $prod['name'];
            $prod['descripcion'] = $prod['description'];
        }
        unset($prod);

        return $productos;
    }

    // ─── GET /api/productos ──────────────────────────────────────────────────
    public static function obtenerProductos(): void
    {
        try {
            $categoriaId = isset($_GET['categoria_id']) && is_numeric($_GET['categoria_id']) ? (int)$_GET['categoria_id'] : 0;
            $limit       = isset($_GET['limit']) && is_numeric($_GET['limit']) ? (int)$_GET['limit'] : 0;

            $db = getDB();
            $sql = self::$baseSelect;
            $params = [];

            if ($categoriaId > 0) {
                $sql .= " AND p.category_id = ?";
                $params[] = $categoriaId;
            }

            $sql .= " ORDER BY p.id DESC";

            if ($limit > 0) {
                $sql .= " LIMIT " . max(1, min(100, $limit));
            }

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $productos = $stmt->fetchAll();

            self::adjuntarRelaciones($db, $productos);
            ResponseHandler::success($productos);

        } catch (PDOException $e) {
            Logger::error('ProductoController::obtenerProductos – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al obtener productos', 500);
        } catch (Throwable $e) {
            Logger::error('ProductoController::obtenerProductos – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al obtener productos', 500);
        }
    }

    // ─── GET /api/productos/random ───────────────────────────────────────────
    public static function obtenerProductosDeInteres(): void
    {
        try {
            $cantidad  = isset($_GET['cantidad']) && is_numeric($_GET['cantidad']) ? (int)$_GET['cantidad'] : 6;
            $excludeId = isset($_GET['exclude_id']) && is_numeric($_GET['exclude_id']) ? (int)$_GET['exclude_id'] : 0;

            $db = getDB();
            $sql = self::$baseSelect;
            $params = [];

            if ($excludeId > 0) {
                $sql .= " AND p.id != ?";
                $params[] = $excludeId;
            }

            $sql .= " ORDER BY RAND() LIMIT " . max(1, min(20, $cantidad));

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $productos = $stmt->fetchAll();

            self::adjuntarRelaciones($db, $productos);
            ResponseHandler::success($productos);

        } catch (PDOException $e) {
            Logger::error('ProductoController::obtenerProductosDeInteres – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al obtener productos de interés', 500);
        } catch (Throwable $e) {
            Logger::error('ProductoController::obtenerProductosDeInteres – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al obtener productos de interés', 500);
        }
    }

    // ─── GET /api/productos/:id ──────────────────────────────────────────────
    public static function obtenerProductoPorId(int $id): void
    {
        try {
            $db = getDB();
            $stmt = $db->prepare(self::$baseSelect . ' AND p.id = ?');
            $stmt->execute([$id]);
            $producto = $stmt->fetchAll();

            if (empty($producto)) {
                ResponseHandler::error('Producto no encontrado', 404);
                return;
            }

            self::adjuntarRelaciones($db, $producto);
            ResponseHandler::success($producto[0]);

        } catch (PDOException $e) {
            Logger::error('ProductoController::obtenerProductoPorId – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al obtener el producto', 500);
        } catch (Throwable $e) {
            Logger::error('ProductoController::obtenerProductoPorId – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al obtener el producto', 500);
        }
    }
}
