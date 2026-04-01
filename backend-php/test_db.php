<?php
/**
 * Script de prueba rápida para verificar las conexiones a las bases de datos.
 * Ejecutar desde la terminal en la carpeta backend-php con: php test_db.php
 */

require_once __DIR__ . '/vendor/autoload.php';

// Cargar variables de entorno
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
} catch (Exception $e) {
    echo "❌ ERROR FATAL: No se pudo cargar el archivo .env. Asegúrate de que exista.\n";
    exit(1);
}

// Para prevenir que getDB() detenga el script con su exit() interno en caso de error, 
// reescribimos temporalmente la lógica de conexión aquí solo para la prueba limpia.

echo "=================================================\n";
echo "🔍  TEST DE CONEXIONES A BASE DE DATOS DISTRICOL  \n";
echo "=================================================\n\n";

// ----------------------------------------------------------------------------------
// 1. PROBAR CONEXIÓN LOCAL
// ----------------------------------------------------------------------------------
echo "[1] PROBANDO BD LOCAL (districolbd) ...\n";
$host = $_ENV['DB_HOST'] ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? '3306';
$user = $_ENV['DB_USER'] ?? '';
$pass = $_ENV['DB_PASSWORD'] ?? '';
$name = $_ENV['DB_NAME'] ?? '';

$dsnLocal = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

try {
    $pdoLocal = new PDO($dsnLocal, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "   ✅ CONECTADO! a {$name} en {$host}.\n";

    // Validar si la tabla products fue creada
    try {
        $pdoLocal->query("SELECT 1 FROM products LIMIT 1");
        echo "   ✅ OK: La tabla 'products' SÍ existe en tu base de datos local.\n";
    } catch (PDOException $tableError) {
        echo "   ❌ ERROR ESTRUCTURA: La tabla 'products' NO existe.\n";
        echo "      -> Debes crear las tablas. Ve a phpMyAdmin o DBeaver y ejecuta el contenido de districol_schema.sql\n";
    }

} catch (PDOException $e) {
    echo "   ❌ ERROR DE CONEXIÓN LOCAL:\n";
    echo "      Mensaje: " . $e->getMessage() . "\n";
    echo "      Verifica que el MySQL de Laragon/XAMPP esté encendido y las credenciales en el .env sean correctas.\n";
}

echo "\n-------------------------------------------------\n\n";

// ----------------------------------------------------------------------------------
// 2. PROBAR CONEXIÓN REMOTA (HOSTINGER)
// ----------------------------------------------------------------------------------
echo "[2] PROBANDO BD REMOTA CATALOGO (Hostinger) ...\n";
$host_remoto = $_ENV['HOSTINGER_DB_HOST'] ?? 'localhost';
$port_remoto = $_ENV['HOSTINGER_DB_PORT'] ?? '3306';
$user_remoto = $_ENV['HOSTINGER_DB_USER'] ?? '';
$pass_remoto = $_ENV['HOSTINGER_DB_PASSWORD'] ?? '';
$name_remoto = $_ENV['HOSTINGER_DB_NAME'] ?? '';

$dsnRemoto = "mysql:host={$host_remoto};port={$port_remoto};dbname={$name_remoto};charset=utf8mb4";

try {
    $pdoRemoto = new PDO($dsnRemoto, $user_remoto, $pass_remoto, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "   ✅ CONECTADO! a {$name_remoto} en {$host_remoto}.\n";

    // Validar cuántos productos va a importar
    try {
        $stmt = $pdoRemoto->query("SELECT COUNT(*) as total FROM products WHERE category='Districol' AND deleted_at IS NULL");
        $result = $stmt->fetch();
        echo "   ✅ OK: Se encontraron " . $result['total'] . " productos con categoría 'Districol' listos para ser importados.\n";
    } catch (PDOException $catError) {
        echo "   ❌ ERROR CATÁLOGO: No se pudo verificar la tabla de productos en Hostinger.\n";
        echo "      Mensaje: " . $catError->getMessage() . "\n";
    }

} catch (PDOException $e) {
    echo "   ❌ ERROR DE CONEXIÓN REMOTA:\n";
    echo "      Mensaje: " . $e->getMessage() . "\n";
    echo "      Verifica que tu IP esté permitida en los 'Remote MySQL' de Hostinger y que las credenciales sean correctas.\n";
}

echo "\n=================================================\n";
echo "FIN DEL TEST.\n";
echo "=================================================\n";
