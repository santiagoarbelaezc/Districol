<?php
/**
 * controllers/SubcategoriaController.php
 * CRUD de subcategorías
 * Equivalente a controllers/subcategoria.controller.js del backend Node.js
 */

require_once __DIR__ . '/../config/database.php';

class SubcategoriaController {

    // 📋 Obtener todas las subcategorías con su categoría
    public static function obtenerSubcategorias(): void {
        try {
            $db   = getDB();
            $stmt = $db->query('
                SELECT s.id, s.nombre, s.categoria_id, c.nombre AS categoria
                FROM subcategorias s
                JOIN categorias c ON s.categoria_id = c.id
            ');
            echo json_encode($stmt->fetchAll());
        } catch (Throwable $e) {
            error_log('Error al obtener subcategorías: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudieron obtener las subcategorías']);
        }
    }

    // ➕ Crear subcategoría
    public static function crearSubcategoria(): void {
        $body        = json_decode(file_get_contents('php://input'), true);
        $nombre      = trim($body['nombre'] ?? '');
        $categoria_id = (int) ($body['categoria_id'] ?? 0);

        if (!$nombre || !$categoria_id) {
            http_response_code(400);
            echo json_encode(['error' => 'El nombre y la categoría son requeridos']);
            return;
        }

        try {
            $db   = getDB();
            $stmt = $db->prepare('INSERT INTO subcategorias (nombre, categoria_id) VALUES (?, ?)');
            $stmt->execute([$nombre, $categoria_id]);
            http_response_code(201);
            echo json_encode(['mensaje' => 'Subcategoría creada con éxito']);
        } catch (Throwable $e) {
            error_log('Error al crear subcategoría: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo crear la subcategoría']);
        }
    }

    // ✏️ Actualizar subcategoría
    public static function actualizarSubcategoria(int $id): void {
        $body        = json_decode(file_get_contents('php://input'), true);
        $nombre      = trim($body['nombre'] ?? '');
        $categoria_id = (int) ($body['categoria_id'] ?? 0);

        if (!$nombre || !$categoria_id) {
            http_response_code(400);
            echo json_encode(['error' => 'El nombre y la categoría son requeridos']);
            return;
        }

        try {
            $db   = getDB();
            $stmt = $db->prepare('UPDATE subcategorias SET nombre = ?, categoria_id = ? WHERE id = ?');
            $stmt->execute([$nombre, $categoria_id, $id]);
            echo json_encode(['mensaje' => 'Subcategoría actualizada con éxito']);
        } catch (Throwable $e) {
            error_log('Error al actualizar subcategoría: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo actualizar la subcategoría']);
        }
    }

    // 🗑️ Eliminar subcategoría
    public static function eliminarSubcategoria(int $id): void {
        try {
            $db   = getDB();
            $stmt = $db->prepare('DELETE FROM subcategorias WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['mensaje' => 'Subcategoría eliminada correctamente']);
        } catch (Throwable $e) {
            error_log('Error al eliminar subcategoría: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo eliminar la subcategoría']);
        }
    }
}
