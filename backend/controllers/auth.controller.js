const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 LOGIN
exports.login = async (req, res) => {
    try {
        let { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
        }

        correo = correo.toLowerCase().trim();

        // Note: ensure 'usuarios' table exists in database or create it
        const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = rows[0];
        const passwordValida = await bcrypt.compare(password, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                correo: usuario.correo,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                correo: usuario.correo,
                rol: usuario.rol,
                nombre: usuario.nombre
            }
        });
    } catch (err) {
        console.error('❌ Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 🟢 REGISTER (vacío por ahora)
exports.register = (req, res) => {
    res.status(501).json({ error: 'Funcionalidad no implementada' });
};

// 🔴 LOGOUT 
exports.logout = (req, res) => {
    res.json({ mensaje: 'Logout exitoso (solo frontend)' });
};

// 🔁 REFRESH TOKEN (vacío si no se implementa)
exports.refreshToken = (req, res) => {
    res.status(501).json({ error: 'Funcionalidad no implementada' });
};
