<?php
/**
 * routes/productos.php
 * Rutas de productos → /api/productos/*
 * Públicas: GET / GET /random GET /:id
 * Protegidas (JWT): POST / PUT /:id DELETE /:id
 */

require_once __DIR__ . '/../controllers/ProductoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Logger.php';

Logger::debug("📍 Ruta /api/productos cargada", ['method' => $_SERVER['REQUEST_METHOD']]);

$method  = $_SERVER['REQUEST_METHOD'];
$segment = $routeSegments[3] ?? '';   // productos/<segment> e.g. 'random', '5', 'buscar', 'categoria'
$sub     = $routeSegments[4] ?? '';   // productos/categoria/<sub> e.g. '3'
$id      = is_numeric($segment) ? (int) $segment : null;

Logger::debug("🔍 Routing analysis", ['segment' => $segment, 'sub' => $sub, 'id' => $id, 'method' => $method]);

try {
    // GET /api/productos
    if ($method === 'GET' && $segment === '') {
        Logger::info("📨 GET /api/productos - Obteniendo productos");
        ProductoController::obtenerProductos();

    // GET /api/productos/random
    } elseif ($method === 'GET' && $segment === 'random') {
        Logger::info("📨 GET /api/productos/random - Obteniendo productos aleatorios de interés");
        ProductoController::obtenerProductosDeInteres();

    // GET /api/productos/:id
    } elseif ($method === 'GET' && $id !== null) {
        Logger::info("📨 GET /api/productos/$id - Obteniendo producto específico");
        ProductoController::obtenerProductoPorId($id);

    // POST /api/productos 🔒
    } elseif ($method === 'POST' && $segment === '') {
        Logger::info("📨 POST /api/productos - Creando nuevo producto");
        Logger::debug("🔑 Verificando token JWT...");
        verifyToken();
        Logger::debug("✅ Token válido");
        ProductoController::crearProducto();

    // PUT or POST /api/productos/:id 🔒
    } elseif (($method === 'PUT' || $method === 'POST') && $id !== null) {
        Logger::info("📨 " . $method . " /api/productos/$id - Actualizando producto", ['id' => $id]);
        Logger::debug("🔑 Verificando token JWT...");
        verifyToken();
        Logger::debug("✅ Token válido, procesando actualización");
        ProductoController::actualizarProducto($id);

    // DELETE /api/productos/:id 🔒
    } elseif ($method === 'DELETE' && $id !== null) {
        Logger::info("📨 DELETE /api/productos/$id - Eliminando producto");
        Logger::debug("🔑 Verificando token JWT...");
        verifyToken();
        Logger::debug("✅ Token válido");
        ProductoController::eliminarProducto($id);

    } else {
        Logger::warning("❌ Ruta no encontrada", ['method' => $method, 'segment' => $segment, 'id' => $id]);
        http_response_code(404);
        echo json_encode(['error' => 'Ruta de productos no encontrada']);
    }

} catch (Throwable $e) {
    Logger::error("❌ Error no capturado en ruta productos", [
        'error' => $e->getMessage(),
        'class' => get_class($e),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    http_response_code(500);
    echo json_encode(['error' => 'Error interno en el servidor: ' . $e->getMessage()]);
}
