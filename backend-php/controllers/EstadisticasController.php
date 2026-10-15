<?php
/**
 * controllers/EstadisticasController.php
 * Provee métricas y estadísticas del catálogo de productos de Districol
 * Exclusivo para el Dashboard administrativo
 */

require_once __DIR__ . '/../utils/ResponseHandler.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../config/database.php';

class EstadisticasController
{
    private static string $catalogoApiUrl = 'https://catalogoplaxtilineas.sembradoresdevida.org/api/productos/categoria/Districol';

    /**
     * GET /api/estadisticas
     * Obtiene métricas completas y agregadas de los productos de Districol
     */
    public static function obtenerEstadisticas(): void
    {
        try {
            $productos = self::obtenerProductosDistricol();

            if (empty($productos)) {
                ResponseHandler::success([
                    'resumen' => [
                        'total_productos'     => 0,
                        'stock_total'         => 0,
                        'precio_promedio'     => 0,
                        'precio_minimo'       => 0,
                        'precio_maximo'       => 0,
                        'total_categorias'    => 0,
                        'destacados'          => 0,
                        'nuevos'              => 0,
                        'con_imagenes'        => 0,
                        'stock_bajo'          => 0,
                        'en_stock'            => 0,
                        'agotados'            => 0,
                    ],
                    'categorias'    => [],
                    'subcategorias' => [],
                    'rangos_precio' => [
                        'economico' => 0,
                        'medio'     => 0,
                        'premium'   => 0,
                        'lujo'      => 0,
                    ],
                    'productos'     => [],
                    'actualizado_en'=> date('Y-m-d H:i:s'),
                ]);
                return;
            }

            $totalProductos = count($productos);
            $stockTotal     = 0;
            $precios        = [];
            $destacados     = 0;
            $nuevos         = 0;
            $conImagenes    = 0;
            $stockBajo      = 0;
            $enStock        = 0;
            $agotados       = 0;

            $catMap = [
                'Colchones'    => ['cantidad' => 0, 'stock' => 0, 'suma_precios' => 0],
                'Almohadas'    => ['cantidad' => 0, 'stock' => 0, 'suma_precios' => 0],
                'Sábanas'      => ['cantidad' => 0, 'stock' => 0, 'suma_precios' => 0],
                'Complementos' => ['cantidad' => 0, 'stock' => 0, 'suma_precios' => 0],
                'Ambientes'    => ['cantidad' => 0, 'stock' => 0, 'suma_precios' => 0],
            ];

            $subcatMap = [];

            $rangosPrecio = [
                'economico' => 0, // < 500.000
                'medio'     => 0, // 500.000 - 1.500.000
                'premium'   => 0, // 1.500.000 - 3.000.000
                'lujo'      => 0, // > 3.000.000
            ];

            $productosLista = [];

            foreach ($productos as $p) {
                $stock = isset($p['stock']) ? (int)$p['stock'] : 0;
                $stockTotal += $stock;

                if ($stock > 0) {
                    $enStock++;
                    if ($stock <= 5) {
                        $stockBajo++;
                    }
                } else {
                    $agotados++;
                }

                if (!empty($p['isFeatured'])) $destacados++;
                if (!empty($p['isNew'])) $nuevos++;

                $images = $p['images'] ?? [];
                $hasImages = is_array($images) && count($images) > 0;
                if ($hasImages) $conImagenes++;

                // Precio de variantes
                $precio = 0;
                if (!empty($p['variants']) && is_array($p['variants'])) {
                    foreach ($p['variants'] as $v) {
                        $vPrice = isset($v['price']) ? (float)$v['price'] : 0;
                        if ($vPrice > 0) {
                            $precio = $vPrice;
                            break;
                        }
                    }
                }
                if ($precio > 0) {
                    $precios[] = $precio;
                    if ($precio < 500000) {
                        $rangosPrecio['economico']++;
                    } elseif ($precio <= 1500000) {
                        $rangosPrecio['medio']++;
                    } elseif ($precio <= 3000000) {
                        $rangosPrecio['premium']++;
                    } else {
                        $rangosPrecio['lujo']++;
                    }
                }

                // Categorización
                $name = $p['name'] ?? '';
                $options = $p['options'] ?? '';
                $subcategoria = 'General';

                if (is_string($options) && str_contains($options, 'Subcategoría:')) {
                    $subcategoria = trim(str_replace('Subcategoría:', '', $options));
                } elseif (!empty($p['subcategory_name'])) {
                    $subcategoria = $p['subcategory_name'];
                }

                $lowerInfo = strtolower($name . ' ' . $subcategoria);
                $categoria = 'Colchones';

                if (str_contains($lowerInfo, 'almohada')) {
                    $categoria = 'Almohadas';
                } elseif (str_contains($lowerInfo, 'sabana') || str_contains($lowerInfo, 'sábana')) {
                    $categoria = 'Sábanas';
                } elseif (str_contains($lowerInfo, 'protector') || str_contains($lowerInfo, 'base') || str_contains($lowerInfo, 'complemento')) {
                    $categoria = 'Complementos';
                } elseif (str_contains($lowerInfo, 'ambiente')) {
                    $categoria = 'Ambientes';
                }

                if (!isset($catMap[$categoria])) {
                    $catMap[$categoria] = ['cantidad' => 0, 'stock' => 0, 'suma_precios' => 0];
                }
                $catMap[$categoria]['cantidad']++;
                $catMap[$categoria]['stock'] += $stock;
                if ($precio > 0) {
                    $catMap[$categoria]['suma_precios'] += $precio;
                }

                if (!isset($subcatMap[$subcategoria])) {
                    $subcatMap[$subcategoria] = [
                        'nombre'    => $subcategoria,
                        'categoria' => $categoria,
                        'cantidad'  => 0,
                        'stock'     => 0
                    ];
                }
                $subcatMap[$subcategoria]['cantidad']++;
                $subcatMap[$subcategoria]['stock'] += $stock;

                $primaryImage = 'assets/img/placeholder.png';
                if ($hasImages) {
                    $primaryImage = is_string($images[0]) ? $images[0] : ($images[0]['url'] ?? 'assets/img/placeholder.png');
                }

                $imagenesArray = [];
                if ($hasImages) {
                    foreach ($images as $img) {
                        $imgUrl = is_string($img) ? $img : ($img['url'] ?? '');
                        if (!empty($imgUrl)) {
                            $imagenesArray[] = $imgUrl;
                        }
                    }
                }
                if (empty($imagenesArray)) {
                    $imagenesArray[] = $primaryImage;
                }

                $productosLista[] = [
                    'id'           => $p['id'] ?? 0,
                    'nombre'       => $name,
                    'descripcion'  => $p['description'] ?? '',
                    'categoria'    => $categoria,
                    'subcategoria' => $subcategoria,
                    'precio'       => $precio,
                    'stock'        => $stock,
                    'isNew'        => !empty($p['isNew']),
                    'isFeatured'   => !empty($p['isFeatured']),
                    'imagen'       => $primaryImage,
                    'imagenes'     => $imagenesArray,
                    'imagenes_num' => count($imagenesArray),
                    'sku'          => $p['sku'] ?? ('DIST-' . ($p['id'] ?? 0)),
                    'slug'         => $p['slug'] ?? '',
                ];
            }

            $precioPromedio = count($precios) > 0 ? (float)round(array_sum($precios) / count($precios), 2) : 0;
            $precioMinimo   = count($precios) > 0 ? (float)min($precios) : 0;
            $precioMaximo   = count($precios) > 0 ? (float)max($precios) : 0;

            $categoriasResumen = [];
            foreach ($catMap as $catNombre => $info) {
                if ($info['cantidad'] > 0) {
                    $categoriasResumen[] = [
                        'nombre'          => $catNombre,
                        'cantidad'        => $info['cantidad'],
                        'porcentaje'      => round(($info['cantidad'] / $totalProductos) * 100, 1),
                        'stock_total'     => $info['stock'],
                        'precio_promedio' => $info['cantidad'] > 0 ? round($info['suma_precios'] / $info['cantidad'], 2) : 0
                    ];
                }
            }

            usort($categoriasResumen, fn($a, $b) => $b['cantidad'] <=> $a['cantidad']);

            $subcategoriasResumen = array_values($subcatMap);
            usort($subcategoriasResumen, fn($a, $b) => $b['cantidad'] <=> $a['cantidad']);

            ResponseHandler::success([
                'resumen' => [
                    'total_productos'     => $totalProductos,
                    'stock_total'         => $stockTotal,
                    'precio_promedio'     => $precioPromedio,
                    'precio_minimo'       => $precioMinimo,
                    'precio_maximo'       => $precioMaximo,
                    'total_categorias'    => count($categoriasResumen),
                    'destacados'          => $destacados,
                    'nuevos'              => $nuevos,
                    'con_imagenes'        => $conImagenes,
                    'stock_bajo'          => $stockBajo,
                    'en_stock'            => $enStock,
                    'agotados'            => $agotados,
                ],
                'categorias'    => $categoriasResumen,
                'subcategorias' => $subcategoriasResumen,
                'rangos_precio' => $rangosPrecio,
                'productos'     => $productosLista,
                'actualizado_en'=> date('Y-m-d H:i:s'),
            ]);

        } catch (Throwable $e) {
            Logger::error('EstadisticasController::obtenerEstadisticas – Error', [
                'exception' => $e->getMessage(),
                'file'      => $e->getFile(),
                'line'      => $e->getLine()
            ]);
            ResponseHandler::error('Error al generar estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtiene los productos desde el catálogo central API (o fallback de base de datos)
     */
    private static function obtenerProductosDistricol(): array
    {
        // 1. Intentar consumir API central
        $ch = curl_init(self::$catalogoApiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $data = json_decode($response, true);
            if (!empty($data['success']) && !empty($data['data']) && is_array($data['data'])) {
                return $data['data'];
            }
        }

        // 2. Fallback: Base de datos local si la API externa no respondió
        try {
            $db = getDB();
            $stmt = $db->query("SELECT * FROM products WHERE deleted_at IS NULL ORDER BY id DESC");
            $localProducts = $stmt->fetchAll();
            return $localProducts ?: [];
        } catch (Throwable $e) {
            return [];
        }
    }
}
