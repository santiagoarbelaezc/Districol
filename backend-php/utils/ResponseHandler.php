<?php
/**
 * utils/ResponseHandler.php
 * Respuestas JSON estandarizadas - inspirado en Plaxtilineas
 */
class ResponseHandler
{
    /**
     * Respuesta exitosa
     */
    public static function success(mixed $data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Respuesta de error estructurada
     */
    public static function error(string $message, int $code = 400, array $extra = []): void
    {
        http_response_code($code);
        $body = array_merge(['error' => $message], $extra);
        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Obtener el body JSON del request (equivalente a req.body en Express)
     */
    public static function getBody(): array
    {
        $raw = file_get_contents('php://input');
        if (!empty($raw)) {
            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }
        }
        return $_POST;
    }

    /**
     * Sanear string de entrada
     */
    public static function sanitize(?string $value): string
    {
        if ($value === null) return '';
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Obtener un parámetro de query string saneado
     */
    public static function query(string $key, mixed $default = null): mixed
    {
        return isset($_GET[$key]) ? self::sanitize($_GET[$key]) : $default;
    }
}
