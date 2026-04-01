<?php
/**
 * controllers/SubcategoriaController.php
 * CRUD de subcategorías con manejo de errores estructurado
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/ResponseHandler.php';
require_once __DIR__ . '/../utils/Logger.php';

class SubcategoriaController
{
    // ─── GET /api/subcategorias ──────────────────────────────────────────────
    public static function obtenerSubcategorias(): void
    {
        try {
            $db   = getDB();
            $stmt = $db->query('
                SELECT s.id, s.nombre, s.categoria_id, c.nombre AS categoria
                FROM subcategorias s
                JOIN categorias c ON s.categoria_id = c.id
                ORDER BY c.nombre, s.nombre
            ');
            ResponseHandler::success($stmt->fetchAll());
        } catch (PDOException $e) {
            Logger::error('SubcategoriaController::obtenerSubcategorias – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al obtener las subcategorías', 500);
        } catch (Throwable $e) {
            Logger::error('SubcategoriaController::obtenerSubcategorias – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al obtener subcategorías', 500);
        }
    }

    // ─── POST /api/subcategorias ─────────────────────────────────────────────
    public static function crearSubcategoria(): void
    {
        try {
            $body         = ResponseHandler::getBody();
            $nombre       = ResponseHandler::sanitize($body['nombre'] ?? '');
            $categoria_id = (int)($body['categoria_id'] ?? 0);

            if (!$nombre) {
                throw new InvalidArgumentException("El campo 'nombre' es requerido");
            }
            if ($categoria_id <= 0) {
                throw new InvalidArgumentException("El campo 'categoria_id' es requerido");
            }

            $db   = getDB();
            $stmt = $db->prepare('INSERT INTO subcategorias (nombre, categoria_id) VALUES (?, ?)');
            $stmt->execute([$nombre, $categoria_id]);

            Logger::info('SubcategoriaController::crearSubcategoria – OK', ['nombre' => $nombre]);
            ResponseHandler::success([
                'mensaje' => 'Subcategoría creada con éxito',
                'id'      => (int)$db->lastInsertId(),
            ], 201);

        } catch (PDOException $e) {
            Logger::error('SubcategoriaController::crearSubcategoria – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al crear la subcategoría', 500);
        } catch (InvalidArgumentException $e) {
            ResponseHandler::error($e->getMessage(), 400);
        } catch (Throwable $e) {
            Logger::error('SubcategoriaController::crearSubcategoria – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al crear subcategoría', 500);
        }
    }

    // ─── PUT /api/subcategorias/:id ──────────────────────────────────────────
    public static function actualizarSubcategoria(int $id): void
    {
        try {
            if ($id <= 0) {
                throw new InvalidArgumentException('El ID debe ser un entero positivo');
            }

            $body         = ResponseHandler::getBody();
            $nombre       = ResponseHandler::sanitize($body['nombre'] ?? '');
            $categoria_id = (int)($body['categoria_id'] ?? 0);

            if (!$nombre) {
                throw new InvalidArgumentException("El campo 'nombre' es requerido");
            }
            if ($categoria_id <= 0) {
                throw new InvalidArgumentException("El campo 'categoria_id' es requerido");
            }

            $db = getDB();
            $db->prepare('UPDATE subcategorias SET nombre = ?, categoria_id = ? WHERE id = ?')
               ->execute([$nombre, $categoria_id, $id]);

            Logger::info('SubcategoriaController::actualizarSubcategoria – OK', ['id' => $id]);
            ResponseHandler::success(['mensaje' => 'Subcategoría actualizada con éxito']);

        } catch (PDOException $e) {
            Logger::error('SubcategoriaController::actualizarSubcategoria – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al actualizar la subcategoría', 500);
        } catch (InvalidArgumentException $e) {
            ResponseHandler::error($e->getMessage(), 400);
        } catch (Throwable $e) {
            Logger::error('SubcategoriaController::actualizarSubcategoria – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al actualizar subcategoría', 500);
        }
    }

    // ─── DELETE /api/subcategorias/:id ───────────────────────────────────────
    public static function eliminarSubcategoria(int $id): void
    {
        try {
            if ($id <= 0) {
                throw new InvalidArgumentException('El ID debe ser un entero positivo');
            }

            $db = getDB();
            $db->prepare('DELETE FROM subcategorias WHERE id = ?')->execute([$id]);

            Logger::info('SubcategoriaController::eliminarSubcategoria – OK', ['id' => $id]);
            ResponseHandler::success(['mensaje' => 'Subcategoría eliminada correctamente']);

        } catch (PDOException $e) {
            Logger::error('SubcategoriaController::eliminarSubcategoria – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al eliminar la subcategoría', 500);
        } catch (InvalidArgumentException $e) {
            ResponseHandler::error($e->getMessage(), 400);
        } catch (Throwable $e) {
            Logger::error('SubcategoriaController::eliminarSubcategoria – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error inesperado al eliminar subcategoría', 500);
        }
    }
}
