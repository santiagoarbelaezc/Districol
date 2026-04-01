-- ============================================================
-- districol_alter_add_categorias.sql
-- Compatible con MySQL 8.0
-- Agrega categorias y subcategorias al esquema existente
-- ============================================================

USE districolbd;

-- 1. Tabla de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    icono_url LONGTEXT NULL,
    icono_public_id VARCHAR(255) NULL,
    creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de subcategorias
CREATE TABLE IF NOT EXISTS subcategorias (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria_id INT(11) NOT NULL,
    creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- 3. Agregar columna subcategoria_id a products (solo si no existe)
SET @dbname = DATABASE();
SET @tblname = 'products';
SET @colname = 'subcategoria_id';

SET @query = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = @dbname
       AND TABLE_NAME = @tblname
       AND COLUMN_NAME = @colname) = 0,
    'ALTER TABLE products ADD COLUMN subcategoria_id INT(11) NULL DEFAULT NULL',
    'SELECT 1'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Poblar categorias desde los 'category' existentes en products
INSERT IGNORE INTO categorias (nombre)
SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '';

-- 5. Crear subcategoria "General" para cada categoria si no existe
INSERT IGNORE INTO subcategorias (nombre, categoria_id)
SELECT 'General', c.id
FROM categorias c
WHERE NOT EXISTS (
    SELECT 1 FROM subcategorias s WHERE s.nombre = 'General' AND s.categoria_id = c.id
);

-- 6. Vincular los products ya importados a su subcategoria "General"
UPDATE products p
JOIN categorias c ON p.category = c.nombre
JOIN subcategorias s ON s.categoria_id = c.id AND s.nombre = 'General'
SET p.subcategoria_id = s.id
WHERE p.subcategoria_id IS NULL;
