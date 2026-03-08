<?php
/**
 * routes/subcategorias.php
 * Rutas de subcategorías → /api/subcategorias/*
 * Públicas: GET /
 * Protegidas (JWT): POST / PUT /:id DELETE /:id
 */

require_once __DIR__ . '/../controllers/SubcategoriaController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method  = $_SERVER['REQUEST_METHOD'];
$segment = $routeSegments[3] ?? ''; // subcategorias/<segment> e.g. '5'
$id      = is_numeric($segment) ? (int) $segment : null;

// GET /api/subcategorias
if ($method === 'GET' && $segment === '') {
    SubcategoriaController::obtenerSubcategorias();

// POST /api/subcategorias  🔒
} elseif ($method === 'POST' && $segment === '') {
    verifyToken();
    SubcategoriaController::crearSubcategoria();

// PUT /api/subcategorias/:id  🔒
} elseif ($method === 'PUT' && $id !== null) {
    verifyToken();
    SubcategoriaController::actualizarSubcategoria($id);

// DELETE /api/subcategorias/:id  🔒
} elseif ($method === 'DELETE' && $id !== null) {
    verifyToken();
    SubcategoriaController::eliminarSubcategoria($id);

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Ruta de subcategorías no encontrada']);
}
