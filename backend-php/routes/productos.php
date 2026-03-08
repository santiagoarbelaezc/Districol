<?php
/**
 * routes/productos.php
 * Rutas de productos → /api/productos/*
 * Públicas: GET / GET /random GET /buscar GET /categoria/:id GET /:id
 * Protegidas (JWT): POST / PUT /:id DELETE /:id
 */

require_once __DIR__ . '/../controllers/ProductoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method  = $_SERVER['REQUEST_METHOD'];
$segment = $routeSegments[3] ?? '';   // productos/<segment> e.g. 'random', '5', 'buscar', 'categoria'
$sub     = $routeSegments[4] ?? '';   // productos/categoria/<sub> e.g. '3'
$id      = is_numeric($segment) ? (int) $segment : null;

// GET /api/productos
if ($method === 'GET' && $segment === '') {
    ProductoController::obtenerProductos();

// GET /api/productos/random
} elseif ($method === 'GET' && $segment === 'random') {
    ProductoController::obtenerProductosAleatorios();

// GET /api/productos/buscar
} elseif ($method === 'GET' && $segment === 'buscar') {
    ProductoController::buscarProductosPorNombre();

// GET /api/productos/categoria/:id
} elseif ($method === 'GET' && $segment === 'categoria' && is_numeric($sub)) {
    ProductoController::obtenerProductosPorCategoria((int) $sub);

// GET /api/productos/:id
} elseif ($method === 'GET' && $id !== null) {
    ProductoController::obtenerProductoPorId($id);

// POST /api/productos  🔒
} elseif ($method === 'POST' && $segment === '') {
    verifyToken();
    ProductoController::crearProductoDesdeRuta();

// PUT /api/productos/:id  🔒
} elseif ($method === 'PUT' && $id !== null) {
    verifyToken();
    ProductoController::actualizarProducto($id);

// DELETE /api/productos/:id  🔒
} elseif ($method === 'DELETE' && $id !== null) {
    verifyToken();
    ProductoController::eliminarProducto($id);

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Ruta de productos no encontrada']);
}
