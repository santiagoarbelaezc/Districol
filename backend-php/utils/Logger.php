<?php
/**
 * utils/Logger.php
 * Logging estructurado para la API Districol - inspirado en Plaxtilineas
 */
class Logger
{
    /**
     * Registrar un error con contexto adicional
     */
    public static function error(string $context, array $data = []): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $extra     = !empty($data) ? ' | ' . json_encode($data, JSON_UNESCAPED_UNICODE) : '';
        error_log("[DISTRICOL ERROR] [{$timestamp}] {$context}{$extra}");
    }

    /**
     * Registrar información general
     */
    public static function info(string $context, array $data = []): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $extra     = !empty($data) ? ' | ' . json_encode($data, JSON_UNESCAPED_UNICODE) : '';
        error_log("[DISTRICOL INFO] [{$timestamp}] {$context}{$extra}");
    }

    /**
     * Registrar información de debug
     */
    public static function debug(string $context, array $data = []): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $extra     = !empty($data) ? ' | ' . json_encode($data, JSON_UNESCAPED_UNICODE) : '';
        error_log("[DISTRICOL DEBUG] [{$timestamp}] {$context}{$extra}");
    }

    /**
     * Registrar advertencias
     */
    public static function warning(string $context, array $data = []): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $extra     = !empty($data) ? ' | ' . json_encode($data, JSON_UNESCAPED_UNICODE) : '';
        error_log("[DISTRICOL WARNING] [{$timestamp}] {$context}{$extra}");
    }
}
