<?php
/**
 * routes/auth.php
 * Rutas de autenticación → /api/auth/*
 */

require_once __DIR__ . '/../controllers/AuthController.php';

$method = $_SERVER['REQUEST_METHOD'];
$segment = $routeSegments[3] ?? ''; // auth/<segment> → e.g. 'login', 'register'

switch ("{$method} {$segment}") {
    case 'POST login':
        AuthController::login();
        break;
    case 'POST register':
        AuthController::register();
        break;
    case 'POST logout':
        AuthController::logout();
        break;
    case 'POST refresh-token':
        AuthController::refreshToken();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Ruta de autenticación no encontrada']);
}
