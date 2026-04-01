<?php
/**
 * config/database.php
 * Conexión PDO a MySQL usando variables del .env
 * Equivalente a config/db.js del backend Node.js
 */

function getDB(): PDO {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $port = $_ENV['DB_PORT'] ?? '3306';
    $user = $_ENV['DB_USER'] ?? '';
    $pass = $_ENV['DB_PASSWORD'] ?? '';
    $name = $_ENV['DB_NAME'] ?? '';

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de conexión a la base de datos local: ' . $e->getMessage()]);
        exit();
    }
}

/**
 * Obtener conexión a la BD catálogo de Hostinger (para importación)
 */
function getHostingerDB(): PDO {
    static $hostingerPdo = null;

    if ($hostingerPdo !== null) {
        return $hostingerPdo;
    }

    $host = $_ENV['HOSTINGER_DB_HOST'] ?? 'localhost';
    $port = $_ENV['HOSTINGER_DB_PORT'] ?? '3306';
    $user = $_ENV['HOSTINGER_DB_USER'] ?? '';
    $pass = $_ENV['HOSTINGER_DB_PASSWORD'] ?? '';
    $name = $_ENV['HOSTINGER_DB_NAME'] ?? '';

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    try {
        $hostingerPdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $hostingerPdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de conexión a la base de datos de Hostinger: ' . $e->getMessage()]);
        exit();
    }
}
