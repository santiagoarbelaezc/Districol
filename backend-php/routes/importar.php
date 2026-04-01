<?php
/**
 * routes/importar.php
 */

require_once __DIR__ . '/../controllers/ImportarController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

// Solo permitimos POST para ejecutar la importación
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verificar token (ruta protegida)
    verifyToken();

    $action = $routeSegments[3] ?? ''; // /api/importar/ejecutar

    if ($action === 'ejecutar') {
        ImportarController::importarProductosPlaxtilineas();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Acción no encontrada en importar']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
