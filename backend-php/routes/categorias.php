<?php
/**
 * routes/categorias.php
 * Rutas de categorías → /api/categorias/* (Solo Lectura)
 */

require_once __DIR__ . '/../controllers/CategoriaController.php';

$method  = $_SERVER['REQUEST_METHOD'];
$segment = $routeSegments[3] ?? '';

if ($method === 'GET' && $segment === '') {
    CategoriaController::obtenerCategorias();
} elseif ($method === 'GET' && $segment === 'con-subcategorias') {
    CategoriaController::obtenerCategoriasConSubcategorias();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Operación no permitida: las categorías son de solo lectura']);
}
