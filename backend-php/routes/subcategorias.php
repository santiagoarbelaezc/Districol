<?php
/**
 * routes/subcategorias.php
 * Rutas de subcategorías → /api/subcategorias/* (Solo Lectura)
 */

require_once __DIR__ . '/../controllers/SubcategoriaController.php';

$method  = $_SERVER['REQUEST_METHOD'];
$segment = $routeSegments[3] ?? '';

if ($method === 'GET' && $segment === '') {
    SubcategoriaController::obtenerSubcategorias();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Operación no permitida: las subcategorías son de solo lectura']);
}
