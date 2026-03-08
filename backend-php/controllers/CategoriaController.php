<?php
/**
 * controllers/CategoriaController.php
 * CRUD de categorías + gestión de íconos en Cloudinary
 * Equivalente a controllers/categoria.controller.js del backend Node.js
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cloudinary.php';

class CategoriaController {

    // 🔍 Obtener todas las categorías simples
    public static function obtenerCategorias(): void {
        try {
            $db   = getDB();
            $stmt = $db->query('SELECT * FROM categorias');
            echo json_encode($stmt->fetchAll());
        } catch (Throwable $e) {
            error_log('Error al obtener categorías: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudieron obtener las categorías']);
        }
    }

    // ➕ Crear categoría (con ícono opcional en Cloudinary)
    public static function crearCategoria(): void {
        $nombre = trim($_POST['nombre'] ?? '');

        if (!$nombre) {
            http_response_code(400);
            echo json_encode(['error' => 'El nombre es obligatorio']);
            return;
        }

        $icono_url       = null;
        $icono_public_id = null;

        // Subir ícono a Cloudinary si se envió un archivo
        if (!empty($_FILES['icono']['tmp_name'])) {
            try {
                $uploaded        = uploadToCloudinary($_FILES['icono']['tmp_name'], 'districol_categorias');
                $icono_url       = $uploaded['url'];
                $icono_public_id = $uploaded['publicId'];
            } catch (Throwable $e) {
                error_log('Error subiendo ícono: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Error subiendo el ícono a Cloudinary']);
                return;
            }
        }

        try {
            $db = getDB();

            if ($icono_url) {
                $stmt = $db->prepare('INSERT INTO categorias (nombre, icono_url, icono_public_id) VALUES (?, ?, ?)');
                $stmt->execute([$nombre, $icono_url, $icono_public_id]);
            } else {
                $stmt = $db->prepare('INSERT INTO categorias (nombre) VALUES (?)');
                $stmt->execute([$nombre]);
            }

            http_response_code(201);
            echo json_encode([
                'mensaje'   => 'Categoría creada con éxito',
                'id'        => $db->lastInsertId(),
                'icono_url' => $icono_url,
            ]);
        } catch (Throwable $e) {
            error_log('Error al crear categoría: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo crear la categoría']);
        }
    }

    // ✏️ Actualizar categoría (nombre y/o ícono)
    public static function actualizarCategoria(int $id): void {
        // Parsear multipart/form-data en PUT manualmente
        $nombre = trim($_POST['nombre'] ?? '');

        if (!$nombre) {
            http_response_code(400);
            echo json_encode(['error' => 'El nombre es obligatorio']);
            return;
        }

        try {
            $db   = getDB();
            $stmt = $db->prepare('SELECT icono_public_id FROM categorias WHERE id = ?');
            $stmt->execute([$id]);
            $row  = $stmt->fetch();

            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'Categoría no encontrada']);
                return;
            }

            $oldPublicId     = $row['icono_public_id'];
            $nuevoIcono      = null;
            $nuevoPublicId   = null;

            // Subir nuevo ícono si se envió
            if (!empty($_FILES['icono']['tmp_name'])) {
                // Eliminar el anterior de Cloudinary
                if ($oldPublicId) {
                    deleteFromCloudinary($oldPublicId);
                }
                $uploaded      = uploadToCloudinary($_FILES['icono']['tmp_name'], 'districol_categorias');
                $nuevoIcono    = $uploaded['url'];
                $nuevoPublicId = $uploaded['publicId'];
            }

            if ($nuevoIcono) {
                $stmt = $db->prepare('UPDATE categorias SET nombre = ?, icono_url = ?, icono_public_id = ? WHERE id = ?');
                $stmt->execute([$nombre, $nuevoIcono, $nuevoPublicId, $id]);
            } else {
                $stmt = $db->prepare('UPDATE categorias SET nombre = ? WHERE id = ?');
                $stmt->execute([$nombre, $id]);
            }

            echo json_encode(['mensaje' => 'Categoría actualizada correctamente']);
        } catch (Throwable $e) {
            error_log('Error al actualizar categoría: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo actualizar la categoría']);
        }
    }

    // 🗑️ Eliminar categoría (e ícono de Cloudinary)
    public static function eliminarCategoria(int $id): void {
        try {
            $db   = getDB();
            $stmt = $db->prepare('SELECT icono_public_id FROM categorias WHERE id = ?');
            $stmt->execute([$id]);
            $row  = $stmt->fetch();

            if ($row && $row['icono_public_id']) {
                deleteFromCloudinary($row['icono_public_id']);
            }

            $stmt = $db->prepare('DELETE FROM categorias WHERE id = ?');
            $stmt->execute([$id]);

            echo json_encode(['mensaje' => 'Categoría eliminada correctamente']);
        } catch (Throwable $e) {
            error_log('Error al eliminar categoría: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo eliminar la categoría']);
        }
    }

    // 🌳 Categorías con subcategorías y conteo de productos
    public static function obtenerCategoriasConSubcategorias(): void {
        $sql = '
            SELECT
              c.id   AS categoria_id,
              c.nombre AS categoria_nombre,
              c.icono_url,
              s.id   AS subcategoria_id,
              s.nombre AS subcategoria_nombre,
              COUNT(p.id) AS cantidad_productos
            FROM categorias c
            LEFT JOIN subcategorias s ON s.categoria_id = c.id
            LEFT JOIN productos p ON p.subcategoria_id = s.id
            GROUP BY c.id, s.id
            ORDER BY c.nombre, s.nombre
        ';

        try {
            $db      = getDB();
            $results = $db->query($sql)->fetchAll();

            $categorias = [];
            foreach ($results as $row) {
                if (!$row['subcategoria_id']) continue;

                $catId = $row['categoria_id'];
                if (!isset($categorias[$catId])) {
                    $categorias[$catId] = [
                        'id'            => $catId,
                        'nombre'        => $row['categoria_nombre'],
                        'icono_url'     => $row['icono_url'],
                        'subcategorias' => [],
                    ];
                }

                $categorias[$catId]['subcategorias'][] = [
                    'id'       => $row['subcategoria_id'],
                    'nombre'   => $row['subcategoria_nombre'],
                    'cantidad' => (int) $row['cantidad_productos'],
                ];
            }

            echo json_encode(array_values($categorias));
        } catch (Throwable $e) {
            error_log('Error al obtener categorías con subcategorías: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error interno al procesar categorías']);
        }
    }
}
