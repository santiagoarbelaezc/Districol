<?php
/**
 * controllers/ProductoController.php
 * CRUD de productos + múltiples imágenes en Cloudinary, con transacciones PDO
 * Equivalente a controllers/producto.controller.js del backend Node.js
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cloudinary.php';

class ProductoController {

    // ─── Helper: cargar imágenes de productos dado un array de IDs ───────────
    private static function adjuntarImagenes(PDO $db, array &$productos): array {
        if (empty($productos)) return $productos;

        $ids          = array_column($productos, 'id');
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        $stmt = $db->prepare("SELECT producto_id, imagen_url FROM producto_imagenes WHERE producto_id IN ($placeholders)");
        $stmt->execute($ids);
        $imagenes = $stmt->fetchAll();

        // Agrupar URLs por producto_id
        $mapaImagenes = [];
        foreach ($imagenes as $img) {
            $mapaImagenes[$img['producto_id']][] = $img['imagen_url'];
        }

        foreach ($productos as &$prod) {
            $prod['imagenes'] = $mapaImagenes[$prod['id']] ?? [];
        }
        unset($prod);

        return $productos;
    }

    // ─── Query base de productos ──────────────────────────────────────────────
    private static function baseQuery(): string {
        return '
            SELECT p.id, p.nombre, p.descripcion, p.cantidad, p.precio,
                   p.subcategoria_id,
                   s.nombre AS subcategoria,
                   c.nombre AS categoria
            FROM productos p
            JOIN subcategorias s ON p.subcategoria_id = s.id
            JOIN categorias c ON s.categoria_id = c.id
        ';
    }

    // 🔍 Obtener productos (con filtro opcional por subcategoria_id)
    public static function obtenerProductos(): void {
        try {
            $db            = getDB();
            $subcategoriaId = $_GET['subcategoria_id'] ?? null;

            $sql    = self::baseQuery();
            $params = [];

            if ($subcategoriaId) {
                $sql    .= ' WHERE p.subcategoria_id = ?';
                $params[] = (int) $subcategoriaId;
            }

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $productos = $stmt->fetchAll();

            self::adjuntarImagenes($db, $productos);
            echo json_encode($productos);
        } catch (Throwable $e) {
            error_log('Error al obtener productos: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudieron obtener los productos']);
        }
    }

    // 🎲 Productos aleatorios
    public static function obtenerProductosAleatorios(): void {
        try {
            $cantidad = max(1, (int) ($_GET['cantidad'] ?? 5));
            $db       = getDB();

            $stmt = $db->prepare(self::baseQuery() . ' ORDER BY RAND() LIMIT ?');
            $stmt->bindValue(1, $cantidad, PDO::PARAM_INT);
            $stmt->execute();
            $productos = $stmt->fetchAll();

            self::adjuntarImagenes($db, $productos);
            echo json_encode($productos);
        } catch (Throwable $e) {
            error_log('Error al obtener productos aleatorios: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudieron obtener productos aleatorios']);
        }
    }

    // 📦 Productos por categoría
    public static function obtenerProductosPorCategoria(int $categoriaId): void {
        try {
            $db   = getDB();
            $stmt = $db->prepare(self::baseQuery() . ' WHERE c.id = ?');
            $stmt->execute([$categoriaId]);
            $productos = $stmt->fetchAll();

            self::adjuntarImagenes($db, $productos);
            echo json_encode($productos);
        } catch (Throwable $e) {
            error_log('Error al obtener productos por categoría: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudieron obtener productos por categoría']);
        }
    }

    // 🔎 Buscar productos por nombre
    public static function buscarProductosPorNombre(): void {
        $nombre = trim($_GET['nombre'] ?? '');

        if ($nombre === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Debes proporcionar un nombre para buscar.']);
            return;
        }

        try {
            $db   = getDB();
            $stmt = $db->prepare(self::baseQuery() . ' WHERE p.nombre LIKE ?');
            $stmt->execute(['%' . $nombre . '%']);
            $productos = $stmt->fetchAll();

            self::adjuntarImagenes($db, $productos);
            echo json_encode($productos);
        } catch (Throwable $e) {
            error_log('Error al buscar productos por nombre: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo realizar la búsqueda de productos']);
        }
    }

    // 🔍 Obtener un producto por ID
    public static function obtenerProductoPorId(int $id): void {
        try {
            $db   = getDB();
            $stmt = $db->prepare(self::baseQuery() . ' WHERE p.id = ?');
            $stmt->execute([$id]);
            $producto = $stmt->fetch();

            if (!$producto) {
                http_response_code(404);
                echo json_encode(['error' => 'Producto no encontrado']);
                return;
            }

            $imgStmt = $db->prepare('SELECT imagen_url FROM producto_imagenes WHERE producto_id = ?');
            $imgStmt->execute([$id]);
            $producto['imagenes'] = array_column($imgStmt->fetchAll(), 'imagen_url');

            echo json_encode($producto);
        } catch (Throwable $e) {
            error_log('Error al obtener producto por ID: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo obtener el producto']);
        }
    }

    // ─── Helper: subir archivos de $_FILES['imagenes'] a Cloudinary ──────────
    private static function subirImagenes(): array {
        if (empty($_FILES['imagenes'])) return [];

        $files = $_FILES['imagenes'];
        $uploadedImages = [];

        // Normalizar estructura de $_FILES cuando hay múltiples archivos
        $count = is_array($files['name']) ? count($files['name']) : 1;

        for ($i = 0; $i < $count; $i++) {
            $tmpName  = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
            $error    = is_array($files['error'])    ? $files['error'][$i]    : $files['error'];

            if ($error !== UPLOAD_ERR_OK || !$tmpName) continue;

            $result = uploadToCloudinary($tmpName, 'districol_productos');
            $uploadedImages[] = [
                'url'      => $result['url'],
                'publicId' => $result['publicId'],
            ];
        }

        return $uploadedImages;
    }

    // 📦 Crear producto con múltiples imágenes (mínimo 1)
    public static function crearProductoDesdeRuta(): void {
        $nombre        = trim($_POST['nombre'] ?? '');
        $descripcion   = trim($_POST['descripcion'] ?? '');
        $cantidad      = (int) ($_POST['cantidad'] ?? 0);
        $precio        = (float) ($_POST['precio'] ?? 0);
        $subcategoriaId = (int) ($_POST['subcategoria_id'] ?? 0);

        if (!$nombre || !$precio || !$cantidad || !$subcategoriaId) {
            http_response_code(400);
            echo json_encode(['error' => 'Datos inválidos. Verifica los campos del formulario.']);
            return;
        }

        // Subir imágenes a Cloudinary
        try {
            $imagesInfo = self::subirImagenes();
        } catch (Throwable $e) {
            error_log('Error subiendo imágenes: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al subir imágenes a Cloudinary']);
            return;
        }

        if (empty($imagesInfo)) {
            http_response_code(400);
            echo json_encode(['error' => 'Debes subir al menos una imagen del producto.']);
            return;
        }

        $db = getDB();
        try {
            $db->beginTransaction();

            // Insertar producto
            $stmt = $db->prepare('
                INSERT INTO productos (nombre, descripcion, cantidad, precio, subcategoria_id)
                VALUES (?, ?, ?, ?, ?)
            ');
            $stmt->execute([$nombre, $descripcion, $cantidad, $precio, $subcategoriaId]);
            $productoId = $db->lastInsertId();

            // Insertar imágenes
            $imgStmt = $db->prepare('
                INSERT INTO producto_imagenes (producto_id, imagen_url, public_id) VALUES (?, ?, ?)
            ');
            foreach ($imagesInfo as $img) {
                $imgStmt->execute([$productoId, $img['url'], $img['publicId']]);
            }

            $db->commit();

            http_response_code(201);
            echo json_encode([
                'mensaje'    => 'Producto creado exitosamente con sus imágenes',
                'productoId' => $productoId,
            ]);
        } catch (Throwable $e) {
            $db->rollBack();
            error_log('Error al crear producto: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al crear el producto']);
        }
    }

    // ✏️ Actualizar producto (datos + imágenes opcionales)
    public static function actualizarProducto(int $id): void {
        // Parsear multipart/form-data en PUT
        $nombre        = trim($_POST['nombre'] ?? '');
        $descripcion   = trim($_POST['descripcion'] ?? '');
        $cantidad      = (int) ($_POST['cantidad'] ?? 0);
        $precio        = (float) ($_POST['precio'] ?? 0);
        $subcategoriaId = (int) ($_POST['subcategoria_id'] ?? 0);

        $db = getDB();

        try {
            // Verificar existencia
            $check = $db->prepare('SELECT id FROM productos WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Producto no encontrado']);
                return;
            }

            $db->beginTransaction();

            // Actualizar datos del producto
            $db->prepare('
                UPDATE productos SET nombre = ?, descripcion = ?, cantidad = ?, precio = ?, subcategoria_id = ?
                WHERE id = ?
            ')->execute([$nombre, $descripcion, $cantidad, $precio, $subcategoriaId, $id]);

            // Si vienen nuevas imágenes, reemplazar las anteriores
            if (!empty($_FILES['imagenes']['name'][0]) || (!is_array($_FILES['imagenes']['name'] ?? null) && !empty($_FILES['imagenes']['tmp_name']))) {
                // Obtener imágenes actuales de BD
                $oldImgStmt = $db->prepare('SELECT public_id FROM producto_imagenes WHERE producto_id = ?');
                $oldImgStmt->execute([$id]);
                $oldImages = $oldImgStmt->fetchAll();

                // Eliminar de Cloudinary
                foreach ($oldImages as $img) {
                    if ($img['public_id']) {
                        deleteFromCloudinary($img['public_id']);
                    }
                }

                // Eliminar de BD
                $db->prepare('DELETE FROM producto_imagenes WHERE producto_id = ?')->execute([$id]);

                // Subir nuevas imágenes
                $newImages = self::subirImagenes();
                $imgStmt   = $db->prepare('INSERT INTO producto_imagenes (producto_id, imagen_url, public_id) VALUES (?, ?, ?)');
                foreach ($newImages as $img) {
                    $imgStmt->execute([$id, $img['url'], $img['publicId']]);
                }
            }

            $db->commit();
            echo json_encode(['mensaje' => 'Producto actualizado con éxito']);
        } catch (Throwable $e) {
            $db->rollBack();
            error_log('Error al actualizar producto: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo actualizar el producto']);
        }
    }

    // 🗑️ Eliminar producto + imágenes de Cloudinary
    public static function eliminarProducto(int $id): void {
        $db = getDB();

        try {
            // Verificar existencia
            $check = $db->prepare('SELECT id FROM productos WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Producto no encontrado']);
                return;
            }

            $db->beginTransaction();

            // Obtener public_ids de las imágenes
            $imgStmt = $db->prepare('SELECT public_id FROM producto_imagenes WHERE producto_id = ?');
            $imgStmt->execute([$id]);
            $imagenes = $imgStmt->fetchAll();

            // Eliminar de Cloudinary
            foreach ($imagenes as $img) {
                if ($img['public_id']) {
                    deleteFromCloudinary($img['public_id']);
                }
            }

            // Eliminar producto (ON DELETE CASCADE elimina imagen_imagenes también)
            $delStmt = $db->prepare('DELETE FROM productos WHERE id = ?');
            $delStmt->execute([$id]);

            if ($delStmt->rowCount() === 0) {
                $db->rollBack();
                http_response_code(400);
                echo json_encode(['error' => 'No se pudo eliminar el producto']);
                return;
            }

            $db->commit();
            echo json_encode(['mensaje' => 'Producto e imágenes eliminados correctamente de la base de datos y de Cloudinary']);
        } catch (Throwable $e) {
            $db->rollBack();
            error_log('Error al eliminar producto: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al eliminar el producto']);
        }
    }
}
