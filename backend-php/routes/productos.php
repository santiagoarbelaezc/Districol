<?php
/**
 * routes/productos.php
 * Rutas de productos → /api/productos/*
 * Modo: SOLO LECTURA Y ESTADÍSTICAS
 * La edición y modificación de productos están estrictamente deshabilitadas.
 */

require_once __DIR__ . '/../controllers/ProductoController.php';
require_once __DIR__ . '/../controllers/EstadisticasController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Logger.php';

$method  = $_SERVER['REQUEST_METHOD'];
$segment = $routeSegments[3] ?? '';   // productos/<segment> e.g. 'estadisticas', 'random', '5'
$id      = is_numeric($segment) ? (int) $segment : null;

try {
    // GET /api/productos/estadisticas 🔒
    if ($method === 'GET' && $segment === 'estadisticas') {
        Logger::info("📨 GET /api/productos/estadisticas - Obteniendo métricas");
        verifyToken();
        EstadisticasController::obtenerEstadisticas();

    // GET /api/productos
    } elseif ($method === 'GET' && $segment === '') {
        Logger::info("📨 GET /api/productos - Obteniendo lista de productos");
        ProductoController::obtenerProductos();

    // GET /api/productos/random
    } elseif ($method === 'GET' && $segment === 'random') {
        Logger::info("📨 GET /api/productos/random - Obteniendo productos de interés");
        ProductoController::obtenerProductosDeInteres();

    // GET /api/productos/:id
    } elseif ($method === 'GET' && $id !== null) {
        Logger::info("📨 GET /api/productos/$id - Obteniendo producto por ID");
        ProductoController::obtenerProductoPorId($id);

    // BLOQUEO DE ESCRITURA: POST, PUT, DELETE
    } elseif (in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
        Logger::warning("🚫 Intento de modificación bloqueado: {$method} /api/productos/{$segment}");
        http_response_code(403);
        echo json_encode([
            'error' => 'Operación no permitida: el backend solo permite ver estadísticas y acceder al dashboard. No se permite crear, editar ni modificar productos.'
        ]);

    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Ruta de productos no encontrada']);
    }

} catch (Throwable $e) {
    Logger::error("❌ Error en ruta productos", ['error' => $e->getMessage()]);
    http_response_code(500);
    echo json_encode(['error' => 'Error interno en el servidor: ' . $e->getMessage()]);
}
