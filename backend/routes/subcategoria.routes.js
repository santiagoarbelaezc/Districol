const express = require('express');
const router = express.Router();

// 🔐 Middleware
const verifyToken = require('../middleware/auth.middleware');
const controller = require('../controllers/subcategoria.controller');

// =====================
// 📂 Rutas públicas
// =====================
router.get('/', controller.obtenerSubcategorias);

// ============================
// 🔒 Rutas protegidas
// ============================
router.post('/', verifyToken, controller.crearSubcategoria);
router.put('/:id', verifyToken, controller.actualizarSubcategoria);
router.delete('/:id', verifyToken, controller.eliminarSubcategoria);

module.exports = router;
