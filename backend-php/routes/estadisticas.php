<?php
/**
 * routes/estadisticas.php
 * Endpoint de estadísticas de productos exclusivas para el Dashboard
 */

require_once __DIR__ . '/../controllers/EstadisticasController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Proteger las estadísticas mediante token JWT de sesión iniciada
    verifyToken();
    EstadisticasController::obtenerEstadisticas();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido en estadísticas']);
}
