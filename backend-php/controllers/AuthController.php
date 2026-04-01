<?php
/**
 * controllers/AuthController.php
 * Autenticación JWT con manejo de errores estructurado
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/ResponseHandler.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;

class AuthController
{
    // ─── POST /api/auth/login ────────────────────────────────────────────────
    public static function login(): void
    {
        try {
            $body = ResponseHandler::getBody();

            $correo   = isset($body['correo'])   ? strtolower(trim($body['correo']))   : '';
            $password = $body['password'] ?? '';

            if (!$correo || !$password) {
                throw new InvalidArgumentException('Correo y contraseña son requeridos');
            }

            $db      = getDB();
            $stmt    = $db->prepare('SELECT * FROM usuarios WHERE correo = ?');
            $stmt->execute([$correo]);
            $usuario = $stmt->fetch();

            if (!$usuario) {
                ResponseHandler::error('Usuario no encontrado', 401);
                return;
            }

            if (!password_verify($password, $usuario['password'])) {
                ResponseHandler::error('Contraseña incorrecta', 401);
                return;
            }

            $secret  = $_ENV['JWT_SECRET'] ?? 'secret';
            $payload = [
                'id'     => $usuario['id'],
                'correo' => $usuario['correo'],
                'rol'    => $usuario['rol'],
                'iat'    => time(),
                'exp'    => time() + 3600,
            ];

            $token = JWT::encode($payload, $secret, 'HS256');

            Logger::info('AuthController::login – OK', ['correo' => $correo]);
            ResponseHandler::success([
                'mensaje' => 'Login exitoso',
                'token'   => $token,
                'usuario' => [
                    'id'     => $usuario['id'],
                    'correo' => $usuario['correo'],
                    'rol'    => $usuario['rol'],
                    'nombre' => $usuario['nombre'],
                ],
            ]);

        } catch (PDOException $e) {
            Logger::error('AuthController::login – DB', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error al conectar con la base de datos', 500);
        } catch (InvalidArgumentException $e) {
            ResponseHandler::error($e->getMessage(), 400);
        } catch (Throwable $e) {
            Logger::error('AuthController::login – inesperado', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error interno del servidor', 500);
        }
    }

    // ─── POST /api/auth/logout ───────────────────────────────────────────────
    public static function logout(): void
    {
        ResponseHandler::success(['mensaje' => 'Logout exitoso (solo frontend)']);
    }

    // ─── POST /api/auth/register ─────────────────────────────────────────────
    public static function register(): void
    {
        ResponseHandler::error('Registro deshabilitado. Contacta al administrador.', 403);
    }

    // ─── POST /api/auth/refresh-token ────────────────────────────────────────
    public static function refreshToken(): void
    {
        ResponseHandler::error('Refresh token no implementado', 501);
    }
}
