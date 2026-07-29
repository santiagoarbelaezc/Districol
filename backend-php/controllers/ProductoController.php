<?php
/**
 * controllers/ProductoController.php
 * CRUD de productos + imágenes en Cloudinary, con esquema exacto de Plaxtilineas
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cloudinary.php';
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
            
            // Compatibilidad con frontend Angular temporal
            $prod['nombre'] = $prod['name'];
            $prod['descripcion'] = $prod['description'];
        }
        unset($prod);

        return $productos;
    }

    // ─── Helper: subir imágenes de $_FILES['imagenes'] a Cloudinary ─────────
    private static function subirImagenes(): array
    {
        if (empty($_FILES) || empty($_FILES['imagenes'])) {
            Logger::debug("📁 No hay archivos en la petición");
            return [];
        }

        $files          = $_FILES['imagenes'];
        $uploadedImages = [];
        
        // Determinar si es un único archivo o múltiples
        $isMultiple = is_array($files['name']);
        $count      = $isMultiple ? count($files['name']) : 1;

        Logger::debug("📁 Procesando $count archivo(s) de imágenes");

        for ($i = 0; $i < $count; $i++) {
            $tmpName = $isMultiple ? $files['tmp_name'][$i] : $files['tmp_name'];
            $error   = $isMultiple ? $files['error'][$i]    : $files['error'];
            $name    = $isMultiple ? $files['name'][$i]     : $files['name'];

            if ($error !== UPLOAD_ERR_OK) {
                Logger::warning("⚠️ Error en upload de archivo", ['file' => $name, 'code' => $error]);
                continue;
            }

            if (!$tmpName || !file_exists($tmpName)) {
                Logger::warning("⚠️ Archivo temporal no encontrado", ['tmpName' => $tmpName]);
                continue;
            }

            if (!is_readable($tmpName)) {
                Logger::warning("⚠️ Archivo temporal no legible", ['tmpName' => $tmpName]);
                continue;
            }

            try {
                Logger::debug("📤 Iniciando upload a Cloudinary", ['file' => $name, 'size' => filesize($tmpName)]);
                $result           = uploadToCloudinary($tmpName, 'districol_productos');
                
                if (!isset($result['url']) || !isset($result['publicId'])) {
                    Logger::error("❌ Respuesta de Cloudinary incompleta", ['result' => json_encode($result)]);
                    continue;
                }
                
                $uploadedImages[] = ['url' => $result['url'], 'publicId' => $result['publicId']];
                Logger::info("✅ Imagen subida a Cloudinary exitosamente", ['url' => substr($result['url'], 0, 50)]);
            } catch (Throwable $e) {
                Logger::error("❌ Error al subir a Cloudinary", [
                    'file' => $name,
                    'error' => $e->getMessage(),
                    'class' => get_class($e)
                ]);
                continue;
            }
        }

        Logger::info("📸 Total de imágenes subidas: " . count($uploadedImages));
        return $uploadedImages;
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

    // ─── POST /api/productos ─────────────────────────────────────────────────
    public static function crearProducto(): void
    {
        try {
            $name        = ResponseHandler::sanitize($_POST['nombre'] ?? '');
            $description = ResponseHandler::sanitize($_POST['descripcion'] ?? '');
            $category    = ResponseHandler::sanitize($_POST['category'] ?? 'Districol');
            $precio      = (float)($_POST['precio'] ?? 0);

            if (!$name) {
                throw new InvalidArgumentException("El campo 'nombre' es requerido");
            }

            $imagesInfo = self::subirImagenes();

            $db = getDB();
            $db->beginTransaction();

            $stmt = $db->prepare('INSERT INTO products (name, description, category) VALUES (?, ?, ?)');
            $stmt->execute([$name, $description, $category]);
            $productId = $db->lastInsertId();

            if ($precio > 0) {
                $db->prepare('INSERT INTO product_variants (product_id, name, price) VALUES (?, ?, ?)')
                   ->execute([$productId, 'Única', $precio]);
            }

            $imgStmt = $db->prepare('INSERT INTO product_images (product_id, url, description) VALUES (?, ?, ?)');
            foreach ($imagesInfo as $img) {
                $imgStmt->execute([$productId, $img['url'], $img['publicId']]);
            }

            $db->commit();
            Logger::info('ProductoController::crearProducto – OK', ['id' => $productId]);
            ResponseHandler::success(['mensaje' => 'Producto creado', 'id' => $productId], 201);

        } catch (PDOException $e) {
            if (isset($db) && $db->inTransaction()) $db->rollBack();
            Logger::error('ProductoController::crearProducto – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al crear el producto', 500);
        } catch (InvalidArgumentException $e) {
            ResponseHandler::error($e->getMessage(), 400);
        } catch (Throwable $e) {
            if (isset($db) && $db->inTransaction()) $db->rollBack();
            Logger::error('ProductoController::crearProducto – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al crear el producto', 500);
        }
    }

    // ─── PUT /api/productos/:id ──────────────────────────────────────────────
    public static function actualizarProducto(int $id): void
    {
        try {
            Logger::info("━━━━━ INICIO actualizarProducto ━━━━━", ['id' => $id]);
            
            $name        = ResponseHandler::sanitize($_POST['nombre'] ?? '');
            $description = ResponseHandler::sanitize($_POST['descripcion'] ?? '');
            $category    = ResponseHandler::sanitize($_POST['category'] ?? 'Districol');
            $precio      = (float)($_POST['precio'] ?? 0);

            if (!$name) {
                throw new InvalidArgumentException("El campo 'nombre' es requerido");
            }

            $db = getDB();
            
            $checkStmt = $db->prepare('SELECT id FROM products WHERE id = ?');
            $checkStmt->execute([$id]);
            $existe = $checkStmt->fetch();
            
            if (!$existe) {
                throw new InvalidArgumentException("Producto con ID $id no encontrado");
            }

            $db->beginTransaction();

            $updateStmt = $db->prepare('UPDATE products SET name = ?, description = ?, category = ? WHERE id = ?');
            $updateStmt->execute([$name, $description, $category, $id]);

            if ($precio > 0) {
                $checkVar = $db->prepare('SELECT id FROM product_variants WHERE product_id = ?');
                $checkVar->execute([$id]);
                $variantExiste = $checkVar->fetch();
                
                if ($variantExiste) {
                    $db->prepare('UPDATE product_variants SET price = ? WHERE product_id = ?')
                       ->execute([$precio, $id]);
                } else {
                    $db->prepare('INSERT INTO product_variants (product_id, name, price, available) VALUES (?, ?, ?, 1)')
                       ->execute([$id, 'Única', $precio]);
                }
            }

            $hayNuevasImagenes = false;
            if (!empty($_FILES) && isset($_FILES['imagenes'])) {
                $files = $_FILES['imagenes'];
                if (is_array($files['name'])) {
                    $hayNuevasImagenes = !empty($files['name'][0]);
                } else {
                    $hayNuevasImagenes = !empty($files['name']);
                }
            }

            if ($hayNuevasImagenes) {
                $oldImgStmt = $db->prepare('SELECT description FROM product_images WHERE product_id = ?');
                $oldImgStmt->execute([$id]);
                $oldImages = $oldImgStmt->fetchAll();

                foreach ($oldImages as $img) {
                    if ($img['description']) {
                        try { deleteFromCloudinary($img['description']); } catch (Throwable $e) {}
                    }
                }

                $db->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$id]);

                $newImages = self::subirImagenes();
                
                if (count($newImages) > 0) {
                    $imgStmt   = $db->prepare('INSERT INTO product_images (product_id, url, description) VALUES (?, ?, ?)');
                    foreach ($newImages as $img) {
                        $imgStmt->execute([$id, $img['url'], $img['publicId']]);
                    }
                }
            }

            $db->commit();
            ResponseHandler::success(['mensaje' => 'Producto actualizado correctamente', 'id' => $id]);

        } catch (PDOException $e) {
            if (isset($db) && $db->inTransaction()) $db->rollBack();
            Logger::error('Error de base de datos en actualización', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error de base de datos: ' . $e->getMessage(), 500);
        } catch (InvalidArgumentException $e) {
            ResponseHandler::error($e->getMessage(), 400);
        } catch (Throwable $e) {
            if (isset($db) && $db->inTransaction()) $db->rollBack();
            Logger::error('Error inesperado en actualización', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error: ' . $e->getMessage(), 500);
        }
    }

    // ─── DELETE /api/productos/:id ───────────────────────────────────────────
    public static function eliminarProducto(int $id): void
    {
        try {
            $db = getDB();
            $db->beginTransaction();

            $imgStmt = $db->prepare('SELECT description FROM product_images WHERE product_id = ?');
            $imgStmt->execute([$id]);
            $imagenes = $imgStmt->fetchAll();

            foreach ($imagenes as $img) {
                if ($img['description']) {
                    try { deleteFromCloudinary($img['description']); } catch (Throwable $e) {}
                }
            }

            $db->prepare('UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?')->execute([$id]);

            $db->commit();
            Logger::info('ProductoController::eliminarProducto – OK', ['id' => $id]);
            ResponseHandler::success(['mensaje' => 'Producto eliminado (Soft Delete)']);

        } catch (PDOException $e) {
            if (isset($db) && $db->inTransaction()) $db->rollBack();
            Logger::error('ProductoController::eliminarProducto – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al eliminar', 500);
        } catch (Throwable $e) {
            if (isset($db) && $db->inTransaction()) $db->rollBack();
            Logger::error('ProductoController::eliminarProducto – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado', 500);
        }
    }
}
