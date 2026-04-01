-- Script de inicialización para DistricolBD
-- Esquema exacto de Plaxtilineas

CREATE DATABASE IF NOT EXISTS districolbd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE districolbd;

-- products
CREATE TABLE IF NOT EXISTS products (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT NULL,
    material VARCHAR(255) NULL,
    category VARCHAR(100) NULL,
    options LONGTEXT NULL,
    isNew TINYINT(1) DEFAULT 1,
    isFeatured TINYINT(1) DEFAULT 0,
    marca VARCHAR(255) NULL,
    gramaje VARCHAR(100) NULL,
    brandIconUrl LONGTEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

-- product_colors
CREATE TABLE IF NOT EXISTS product_colors (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    product_id INT(11) NOT NULL,
    color VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- product_images
CREATE TABLE IF NOT EXISTS product_images (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    product_id INT(11) NOT NULL,
    url LONGTEXT NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    product_id INT(11) NOT NULL,
    name VARCHAR(255) NOT NULL,
    available TINYINT(1) DEFAULT 1,
    price DECIMAL(10,2) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- users (Admin)
CREATE TABLE IF NOT EXISTS users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','user') DEFAULT 'user',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserta un usuario administrador por defecto
-- Pass: Districol-123
INSERT IGNORE INTO users (username, email, password, role) 
VALUES ('admindistricol', 'mateo.moreno@plaxtilineas.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
