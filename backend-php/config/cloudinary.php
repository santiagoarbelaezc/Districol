<?php
/**
 * config/cloudinary.php
 * Configuración y helpers de Cloudinary usando la SDK PHP v2
 * Equivalente a config/cloudinary.js del backend Node.js
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Api\Admin\AdminApi;

/**
 * Inicializa la configuración de Cloudinary desde .env
 */
function initCloudinary(): void {
    static $initialized = false;
    if ($initialized) return;

    $cloudName  = $_ENV['CLOUDINARY_CLOUD_NAME'] ?? '';
    $apiKey     = $_ENV['CLOUDINARY_API_KEY'] ?? '';
    $apiSecret  = $_ENV['CLOUDINARY_API_SECRET'] ?? '';

    if (!$cloudName || !$apiKey || !$apiSecret) {
        http_response_code(500);
        echo json_encode(['error' => 'Variables de entorno de Cloudinary no configuradas']);
        exit();
    }

    Configuration::instance([
        'cloud' => [
            'cloud_name' => $cloudName,
            'api_key'    => $apiKey,
            'api_secret' => $apiSecret,
        ],
        'url' => [
            'secure' => true,
        ],
    ]);

    $initialized = true;
}

/**
 * Sube una imagen a Cloudinary desde un archivo temporal PHP ($_FILES)
 *
 * @param string $tmpPath  Ruta temporal del archivo (desde $_FILES['campo']['tmp_name'])
 * @param string $folder   Carpeta destino en Cloudinary
 * @return array           ['url' => ..., 'publicId' => ...]
 */
function uploadToCloudinary(string $tmpPath, string $folder): array {
    initCloudinary();

    $publicId = $folder . '/' . time() . '-' . bin2hex(random_bytes(4));

    $uploadApi = new UploadApi();
    $result = $uploadApi->upload($tmpPath, [
        'folder'               => $folder,
        'public_id'            => basename($publicId),
        'allowed_formats'      => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        'transformation'       => [['width' => 800, 'height' => 600, 'crop' => 'limit']],
        'overwrite'            => true,
    ]);

    return [
        'url'      => $result['secure_url'],
        'publicId' => $result['public_id'],
    ];
}

/**
 * Elimina una imagen de Cloudinary por su public_id
 *
 * @param string $publicId
 * @return bool
 */
function deleteFromCloudinary(string $publicId): bool {
    if (!$publicId) return false;

    initCloudinary();

    try {
        $uploadApi = new UploadApi();
        $result = $uploadApi->destroy($publicId);
        return ($result['result'] ?? '') === 'ok';
    } catch (Throwable $e) {
        error_log('Error eliminando de Cloudinary: ' . $e->getMessage());
        return false;
    }
}
