<?php
/**
 * index.php — Punto de entrada de la API Districol en PHP
 * Equivalente a server.js del backend Node.js
 *
 * Para desarrollo local: php -S localhost:8000 index.php
 * Para producción (Hostinger): este archivo debe estar en la raíz de public_html
 */

require_once __DIR__ . '/vendor/autoload.php';

// ─── Cargar variables de entorno desde .env ───────────────────────────────────
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// ─── Cabeceras CORS y JSON ────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Responder pre-flight OPTIONS inmediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// ─── Router: parsear la URI ───────────────────────────────────────────────────
// Eliminar query string de la URL
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalizar: quitar barra final
$uri = rtrim($uri, '/');

// Dividir la ruta en segmentos: ['', 'api', 'categorias', '5']
$routeSegments = explode('/', $uri);

// El primer segmento real debe ser 'api'
$apiSegment    = $routeSegments[1] ?? '';
$resource      = $routeSegments[2] ?? ''; // 'auth' | 'categorias' | ...
// Reasignar desde el recurso en adelante para usarlo en los route files
// índice 0 = '' | 1 = 'api' | 2 = recurso | 3 = id o sub-recurso | ...
// En los route files se usa: $routeSegments[2], [3], etc.

if ($apiSegment !== 'api') {
    // Ruta raíz de bienvenida
    echo json_encode(['message' => 'Bienvenido a la API de Districol (PHP)']);
    exit();
}

// ─── Despachar al archivo de rutas correspondiente ───────────────────────────
switch ($resource) {
    case 'auth':
        require_once __DIR__ . '/routes/auth.php';
        break;

    case 'categorias':
        require_once __DIR__ . '/routes/categorias.php';
        break;

    case 'subcategorias':
        require_once __DIR__ . '/routes/subcategorias.php';
        break;

    case 'productos':
        require_once __DIR__ . '/routes/productos.php';
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Ruta no encontrada']);
}
