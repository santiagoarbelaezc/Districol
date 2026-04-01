<?php
/**
 * controllers/CategoriaController.php
 * CRUD de categorías + gestión de íconos en Cloudinary
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cloudinary.php';
require_once __DIR__ . '/../utils/ResponseHandler.php';
require_once __DIR__ . '/../utils/Logger.php';

class CategoriaController
{
    // ─── GET /api/categorias ─────────────────────────────────────────────────
    public static function obtenerCategorias(): void
    {
        try {
            $db   = getDB();
            $stmt = $db->query('SELECT * FROM categorias ORDER BY nombre');
            ResponseHandler::success($stmt->fetchAll());
        } catch (PDOException $e) {
            Logger::error('CategoriaController::obtenerCategorias – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al obtener las categorías', 500);
        } catch (Throwable $e) {
            Logger::error('CategoriaController::obtenerCategorias – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al obtener categorías', 500);
        }
    }

    // ─── GET /api/categorias/con-subcategorias ───────────────────────────────
    public static function obtenerCategoriasConSubcategorias(): void
    {
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
                        'id'            => (int)$catId,
                        'nombre'        => $row['categoria_nombre'],
                        'icono_url'     => $row['icono_url'],
                        'subcategorias' => [],
                    ];
                }

                $categorias[$catId]['subcategorias'][] = [
                    'id'       => (int)$row['subcategoria_id'],
                    'nombre'   => $row['subcategoria_nombre'],
                    'cantidad' => (int)$row['cantidad_productos'],
                ];
            }

            ResponseHandler::success(array_values($categorias));

        } catch (PDOException $e) {
            Logger::error('CategoriaController::obtenerCategoriasConSubcategorias – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al obtener categorías con subcategorías', 500);
        } catch (Throwable $e) {
            Logger::error('CategoriaController::obtenerCategoriasConSubcategorias – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al obtener categorías', 500);
        }
    }

    // ─── POST /api/categorias ────────────────────────────────────────────────
    public static function crearCategoria(): void
    {
        try {
            $nombre = ResponseHandler::sanitize($_POST['nombre'] ?? '');

            if (!$nombre) {
                throw new InvalidArgumentException('El nombre de la categoría es obligatorio');
            }

            $icono_url       = null;
            $icono_public_id = null;

            if (!empty($_FILES['icono']['tmp_name'])) {
                $uploaded        = uploadToCloudinary($_FILES['icono']['tmp_name'], 'districol_categorias');
                $icono_url       = $uploaded['url'];
                $icono_public_id = $uploaded['publicId'];
            }

            $db = getDB();

            if ($icono_url) {
                $stmt = $db->prepare('INSERT INTO categorias (nombre, icono_url, icono_public_id) VALUES (?, ?, ?)');
                $stmt->execute([$nombre, $icono_url, $icono_public_id]);
            } else {
                $stmt = $db->prepare('INSERT INTO categorias (nombre) VALUES (?)');
                $stmt->execute([$nombre]);
            }

            Logger::info('CategoriaController::crearCategoria – OK', ['nombre' => $nombre]);
            ResponseHandler::success([
                'mensaje'   => 'Categoría creada con éxito',
                'id'        => (int)$db->lastInsertId(),
                'icono_url' => $icono_url,
            ], 201);

        } catch (PDOException $e) {
            Logger::error('CategoriaController::crearCategoria – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al crear la categoría', 500);
        } catch (InvalidArgumentException $e) {
            ResponseHandler::error($e->getMessage(), 400);
        } catch (Throwable $e) {
            Logger::error('CategoriaController::crearCategoria – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al crear categoría', 500);
        }
    }

    // ─── PUT /api/categorias/:id ─────────────────────────────────────────────
    public static function actualizarCategoria(int $id): void
    {
        try {
            if ($id <= 0) {
                throw new InvalidArgumentException('El ID de categoría debe ser un entero positivo');
            }

            $nombre = ResponseHandler::sanitize($_POST['nombre'] ?? '');

            if (!$nombre) {
                throw new InvalidArgumentException('El nombre de la categoría es obligatorio');
            }

            $db   = getDB();
            $stmt = $db->prepare('SELECT icono_public_id FROM categorias WHERE id = ?');
            $stmt->execute([$id]);
            $row  = $stmt->fetch();

            if (!$row) {
                ResponseHandler::error('Categoría no encontrada', 404);
                return;
            }

            $nuevoIcono    = null;
            $nuevoPublicId = null;

            if (!empty($_FILES['icono']['tmp_name'])) {
                if ($row['icono_public_id']) {
                    try { deleteFromCloudinary($row['icono_public_id']); } catch (Throwable $ignored) {}
                }
                $uploaded      = uploadToCloudinary($_FILES['icono']['tmp_name'], 'districol_categorias');
                $nuevoIcono    = $uploaded['url'];
                $nuevoPublicId = $uploaded['publicId'];
            }

            if ($nuevoIcono) {
                $db->prepare('UPDATE categorias SET nombre = ?, icono_url = ?, icono_public_id = ? WHERE id = ?')
                   ->execute([$nombre, $nuevoIcono, $nuevoPublicId, $id]);
            } else {
                $db->prepare('UPDATE categorias SET nombre = ? WHERE id = ?')
                   ->execute([$nombre, $id]);
            }

            Logger::info('CategoriaController::actualizarCategoria – OK', ['id' => $id]);
            ResponseHandler::success(['mensaje' => 'Categoría actualizada correctamente']);

        } catch (PDOException $e) {
            Logger::error('CategoriaController::actualizarCategoria – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al actualizar la categoría', 500);
        } catch (InvalidArgumentException $e) {
            ResponseHandler::error($e->getMessage(), 400);
        } catch (Throwable $e) {
            Logger::error('CategoriaController::actualizarCategoria – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al actualizar categoría', 500);
        }
    }

    // ─── DELETE /api/categorias/:id ─────────────────────────────────────────
    public static function eliminarCategoria(int $id): void
    {
        try {
            if ($id <= 0) {
                throw new InvalidArgumentException('El ID de categoría debe ser un entero positivo');
            }

            $db   = getDB();
            $stmt = $db->prepare('SELECT icono_public_id FROM categorias WHERE id = ?');
            $stmt->execute([$id]);
            $row  = $stmt->fetch();

            if (!$row) {
                ResponseHandler::error('Categoría no encontrada', 404);
                return;
            }

            if ($row['icono_public_id']) {
                try { deleteFromCloudinary($row['icono_public_id']); } catch (Throwable $ignored) {}
            }

            $db->prepare('DELETE FROM categorias WHERE id = ?')->execute([$id]);

            Logger::info('CategoriaController::eliminarCategoria – OK', ['id' => $id]);
            ResponseHandler::success(['mensaje' => 'Categoría eliminada correctamente']);

        } catch (PDOException $e) {
            Logger::error('CategoriaController::eliminarCategoria – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al eliminar la categoría', 500);
        } catch (InvalidArgumentException $e) {
            ResponseHandler::error($e->getMessage(), 400);
        } catch (Throwable $e) {
            Logger::error('CategoriaController::eliminarCategoria – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al eliminar categoría', 500);
        }
    }
}
