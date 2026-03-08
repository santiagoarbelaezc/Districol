<?php
/**
 * routes/categorias.php
 * Rutas de categorías → /api/categorias/*
 * Públicas: GET /  y GET /con-subcategorias
 * Protegidas (JWT): POST / PUT /:id DELETE /:id
 */

require_once __DIR__ . '/../controllers/CategoriaController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method  = $_SERVER['REQUEST_METHOD'];
$segment = $routeSegments[3] ?? ''; // categorias/<segment> e.g. '5', 'con-subcategorias'
$id      = is_numeric($segment) ? (int) $segment : null;

// GET /api/categorias
if ($method === 'GET' && $segment === '') {
    CategoriaController::obtenerCategorias();

// GET /api/categorias/con-subcategorias
} elseif ($method === 'GET' && $segment === 'con-subcategorias') {
    CategoriaController::obtenerCategoriasConSubcategorias();

// POST /api/categorias  🔒
} elseif ($method === 'POST' && $segment === '') {
    verifyToken();
    CategoriaController::crearCategoria();

// PUT /api/categorias/:id  🔒
} elseif ($method === 'PUT' && $id !== null) {
    verifyToken();
    CategoriaController::actualizarCategoria($id);

// DELETE /api/categorias/:id  🔒
} elseif ($method === 'DELETE' && $id !== null) {
    verifyToken();
    CategoriaController::eliminarCategoria($id);

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Ruta de categorías no encontrada']);
}
