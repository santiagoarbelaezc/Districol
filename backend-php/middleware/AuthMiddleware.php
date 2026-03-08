<?php
/**
 * middleware/AuthMiddleware.php
 * Verificación de JWT en rutas protegidas
 * Equivalente a middleware/auth.middleware.js del backend Node.js
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

/**
 * Verifica el token JWT de la cabecera Authorization: Bearer <token>
 * Si es válido, retorna el payload decodificado.
 * Si no, envía respuesta JSON de error y detiene la ejecución.
 *
 * @return object  Payload decodificado del JWT
 */
function verifyToken(): object {
    $headers = getallheaders();

    // Normalizar claves del header a minúsculas (compatibilidad server)
    $headers = array_change_key_case($headers, CASE_LOWER);

    $authHeader = $headers['authorization'] ?? '';

    if (!$authHeader) {
        http_response_code(401);
        echo json_encode(['error' => 'Token no proporcionado']);
        exit();
    }

    $parts = explode(' ', $authHeader);

    if (count($parts) !== 2 || $parts[0] !== 'Bearer') {
        http_response_code(400);
        echo json_encode(['error' => 'Formato de token inválido']);
        exit();
    }

    $token = $parts[1];
    $secret = $_ENV['JWT_SECRET'] ?? '';

    try {
        $decoded = JWT::decode($token, new Key($secret, 'HS256'));
        return $decoded;
    } catch (ExpiredException $e) {
        http_response_code(403);
        echo json_encode(['error' => 'Token inválido o expirado']);
        exit();
    } catch (SignatureInvalidException $e) {
        http_response_code(403);
        echo json_encode(['error' => 'Token inválido o expirado']);
        exit();
    } catch (Throwable $e) {
        http_response_code(403);
        echo json_encode(['error' => 'Token inválido o expirado']);
        exit();
    }
}
