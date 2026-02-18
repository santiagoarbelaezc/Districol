const express = require('express');
const router = express.Router();

// 🔐 Middleware
const verifyToken = require('../middleware/auth.middleware');
const { productsMultipleUpload } = require('../middleware/upload.middleware');
const controller = require('../controllers/producto.controller');

// =====================
// 📂 Rutas públicas
// =====================
router.get('/', controller.obtenerProductos);
router.get('/random', controller.obtenerProductosAleatorios);
router.get('/buscar', controller.buscarProductosPorNombre);
router.get('/categoria/:categoria_id', controller.obtenerProductosPorCategoria);
router.get('/:id', controller.obtenerProductoPorId);

// ============================
// 🔒 Rutas protegidas
// ============================
router.post(
    '/',
    verifyToken,
    productsMultipleUpload,
    controller.crearProductoDesdeRuta
);

router.put(
    '/:id',
    verifyToken,
    productsMultipleUpload,
    controller.actualizarProducto
);

router.delete('/:id', verifyToken, controller.eliminarProducto);

module.exports = router;
