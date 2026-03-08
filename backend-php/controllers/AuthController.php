<?php
/**
 * controllers/AuthController.php
 * Autenticación: login, register, logout, refresh-token
 * Equivalente a controllers/auth.controller.js del backend Node.js
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;

class AuthController {

    // 🔐 LOGIN
    public static function login(): void {
        $body = json_decode(file_get_contents('php://input'), true);

        $correo   = isset($body['correo']) ? strtolower(trim($body['correo'])) : '';
        $password = $body['password'] ?? '';

        if (!$correo || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Correo y contraseña son requeridos']);
            return;
        }

        try {
            $db   = getDB();
            $stmt = $db->prepare('SELECT * FROM usuarios WHERE correo = ?');
            $stmt->execute([$correo]);
            $usuario = $stmt->fetch();

            if (!$usuario) {
                http_response_code(401);
                echo json_encode(['error' => 'Usuario no encontrado']);
                return;
            }

            if (!password_verify($password, $usuario['password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Contraseña incorrecta']);
                return;
            }

            $secret = $_ENV['JWT_SECRET'] ?? '';
            $payload = [
                'id'     => $usuario['id'],
                'correo' => $usuario['correo'],
                'rol'    => $usuario['rol'],
                'iat'    => time(),
                'exp'    => time() + 3600, // 1 hora
            ];

            $token = JWT::encode($payload, $secret, 'HS256');

            echo json_encode([
                'mensaje' => 'Login exitoso',
                'token'   => $token,
                'usuario' => [
                    'id'     => $usuario['id'],
                    'correo' => $usuario['correo'],
                    'rol'    => $usuario['rol'],
                    'nombre' => $usuario['nombre'],
                ],
            ]);
        } catch (Throwable $e) {
            error_log('Error en login: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error interno del servidor']);
        }
    }

    // 🟢 REGISTER (no implementado)
    public static function register(): void {
        http_response_code(501);
        echo json_encode(['error' => 'Funcionalidad no implementada']);
    }

    // 🔴 LOGOUT (frontend-only)
    public static function logout(): void {
        echo json_encode(['mensaje' => 'Logout exitoso (solo frontend)']);
    }

    // 🔁 REFRESH TOKEN (no implementado)
    public static function refreshToken(): void {
        http_response_code(501);
        echo json_encode(['error' => 'Funcionalidad no implementada']);
    }
}
