<?php
/**
 * controllers/ImportarController.php
 * Sincronización exacta de productos (Plaxtilineas a Districol)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/ResponseHandler.php';
require_once __DIR__ . '/../utils/Logger.php';

class ImportarController
{
    public static function importarProductosPlaxtilineas(): void
    {
        set_time_limit(0);

        try {
            $dbLocal     = getDB();
            $dbHostinger = getHostingerDB();

            // Verificación previa: la base de datos local Districol debe tener la nueva estructura
            try {
                $dbLocal->query("SELECT 1 FROM products LIMIT 1");
            } catch (PDOException $e) {
                ResponseHandler::error('Error: La base de datos local de Districol no tiene la estructura correcta (falta la tabla "products"). Por favor, ejecuta el script districol_schema.sql en tu administrador de BD (phpMyAdmin, DBeaver, etc.) antes de sincronizar.', 400);
                return;
            }

            // 1. Obtener productos de Districol desde catálogo (Hostinger)
            $stmt = $dbHostinger->query("SELECT * FROM products WHERE deleted_at IS NULL AND category='Districol'");
            $productsHostinger = $stmt->fetchAll();

            if (empty($productsHostinger)) {
                ResponseHandler::success(['mensaje' => 'No hay productos nuevos para importar con la categoría Districol', 'importados' => 0, 'actualizados' => 0]);
                return;
            }

            // Datos relacionados en Hostinger
            $idsPlaceholders = implode(',', array_fill(0, count($productsHostinger), '?'));
            $ids = array_column($productsHostinger, 'id');

            $imgStmt = $dbHostinger->prepare("SELECT product_id, url, description FROM product_images WHERE product_id IN ($idsPlaceholders)");
            $imgStmt->execute($ids);
            $allImages = $imgStmt->fetchAll();

            $imageMap = [];
            foreach ($allImages as $img) {
                $imageMap[$img['product_id']][] = ['url' => $img['url'], 'description' => $img['description']];
            }

            $varStmt = $dbHostinger->prepare("SELECT product_id, name, available, price FROM product_variants WHERE product_id IN ($idsPlaceholders)");
            $varStmt->execute($ids);
            $allVars = $varStmt->fetchAll();

            $varMap = [];
            foreach ($allVars as $var) {
                $varMap[$var['product_id']][] = $var;
            }

            $importados   = 0;
            $actualizados = 0;

            $dbLocal->beginTransaction();

            foreach ($productsHostinger as $product) {
                $hostingerId = (int)$product['id'];
                
                // Buscar si ya existe por ID en la BD local
                $checkStmt = $dbLocal->prepare('SELECT id FROM products WHERE id = ?');
                $checkStmt->execute([$hostingerId]);
                $existe = $checkStmt->fetch();

                if ($existe) {
                    // Update
                    $updStmt = $dbLocal->prepare('
                        UPDATE products 
                        SET name=?, description=?, material=?, category=?, options=?, isNew=?, isFeatured=?, marca=?, gramaje=?, brandIconUrl=?
                        WHERE id=?
                    ');
                    $updStmt->execute([
                        $product['name'], $product['description'], $product['material'], $product['category'],
                        $product['options'], $product['isNew'], $product['isFeatured'], $product['marca'], 
                        $product['gramaje'], $product['brandIconUrl'], $hostingerId
                    ]);

                    $actualizados++;
                } else {
                    // Insert con ID explícito
                    $insStmt = $dbLocal->prepare('
                        INSERT INTO products (id, name, description, material, category, options, isNew, isFeatured, marca, gramaje, brandIconUrl, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ');
                    $insStmt->execute([
                        $hostingerId, $product['name'], $product['description'], $product['material'], $product['category'],
                        $product['options'], $product['isNew'], $product['isFeatured'], $product['marca'], 
                        $product['gramaje'], $product['brandIconUrl'], $product['created_at']
                    ]);
                    $importados++;
                }

                // Sincronizar imágenes
                if (isset($imageMap[$hostingerId])) {
                    $dbLocal->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$hostingerId]);
                    $imgIns = $dbLocal->prepare('INSERT INTO product_images (product_id, url, description) VALUES (?, ?, ?)');
                    foreach ($imageMap[$hostingerId] as $img) {
                        $imgIns->execute([$hostingerId, $img['url'], $img['description']]);
                    }
                }

                // Sincronizar variantes
                if (isset($varMap[$hostingerId])) {
                    $dbLocal->prepare('DELETE FROM product_variants WHERE product_id = ?')->execute([$hostingerId]);
                    $varIns = $dbLocal->prepare('INSERT INTO product_variants (product_id, name, available, price) VALUES (?, ?, ?, ?)');
                    foreach ($varMap[$hostingerId] as $var) {
                        $varIns->execute([$hostingerId, $var['name'], $var['available'], $var['price']]);
                    }
                }
            }

            $dbLocal->commit();
            Logger::info('ImportarController – importación OK', ['importados' => $importados, 'actualizados' => $actualizados]);

            ResponseHandler::success([
                'status'       => 'success',
                'mensaje'      => 'Importación completada',
                'importados'   => $importados,
                'actualizados' => $actualizados
            ]);

        } catch (Throwable $e) {
            if (isset($dbLocal) && $dbLocal->inTransaction()) {
                $dbLocal->rollBack();
            }
            Logger::error('ImportarController::importar – fatal', ['exception' => $e->getMessage()]);
            ResponseHandler::error('Error fatal durante la importación: ' . $e->getMessage(), 500);
        }
    }
}
