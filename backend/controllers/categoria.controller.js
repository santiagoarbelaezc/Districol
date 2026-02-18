const db = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

// 🔍 Obtener todas las categorías simples
exports.obtenerCategorias = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias');
        res.json(rows);
    } catch (err) {
        console.error('❌ Error al obtener categorías:', err);
        res.status(500).json({ error: 'No se pudieron obtener las categorías' });
    }
};

exports.crearCategoria = async (req, res) => {
    const { nombre } = req.body;
    const icono_url = req.imageInfo?.url || null;
    const icono_public_id = req.imageInfo?.publicId || null;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    try {
        const query = icono_url
            ? 'INSERT INTO categorias (nombre, icono_url, icono_public_id) VALUES (?, ?, ?)'
            : 'INSERT INTO categorias (nombre) VALUES (?)';

        const params = icono_url
            ? [nombre, icono_url, icono_public_id]
            : [nombre];

        const [result] = await db.query(query, params);

        res.status(201).json({
            mensaje: 'Categoría creada con éxito',
            id: result.insertId,
            icono_url
        });
    } catch (err) {
        console.error('❌ Error al crear categoría:', err);
        res.status(500).json({ error: 'No se pudo crear la categoría' });
    }
};

// ✏️ Actualizar categoría (nombre y/o ícono)
exports.actualizarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const nuevoIcono = req.imageInfo?.url;
    const nuevoPublicId = req.imageInfo?.publicId;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    try {
        const [rows] = await db.query('SELECT icono_public_id FROM categorias WHERE id = ?', [id]);
        if (!rows.length) return res.status(404).json({ error: 'Categoría no encontrada' });

        const oldPublicId = rows[0].icono_public_id;

        if (nuevoIcono && oldPublicId) {
            const { cloudinary } = require('../config/cloudinary');
            await cloudinary.uploader.destroy(oldPublicId);
        }

        let query = 'UPDATE categorias SET nombre = ?';
        const values = [nombre];

        if (nuevoIcono) {
            query += ', icono_url = ?, icono_public_id = ?';
            values.push(nuevoIcono, nuevoPublicId);
        }

        query += ' WHERE id = ?';
        values.push(id);

        await db.query(query, values);

        res.json({ mensaje: '✅ Categoría actualizada correctamente' });
    } catch (err) {
        console.error('❌ Error al actualizar categoría:', err);
        res.status(500).json({ error: 'No se pudo actualizar la categoría' });
    }
};

// 🗑️ Eliminar categoría e ícono de Cloudinary
exports.eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT icono_public_id FROM categorias WHERE id = ?', [id]);
        const iconoPublicId = rows[0]?.icono_public_id;

        if (iconoPublicId) {
            await cloudinary.uploader.destroy(iconoPublicId);
        }

        await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (err) {
        console.error('❌ Error al eliminar categoría:', err);
        res.status(500).json({ error: 'No se pudo eliminar la categoría' });
    }
};

// 🌳 Obtener categorías con subcategorías y cantidad de productos
exports.obtenerCategoriasConSubcategorias = async (req, res) => {
    const sql = `
    SELECT 
      c.id AS categoria_id,
      c.nombre AS categoria_nombre,
      c.icono_url,
      s.id AS subcategoria_id,
      s.nombre AS subcategoria_nombre,
      COUNT(p.id) AS cantidad_productos
    FROM categorias c
    LEFT JOIN subcategorias s ON s.categoria_id = c.id
    LEFT JOIN productos p ON p.subcategoria_id = s.id
    GROUP BY c.id, s.id
    ORDER BY c.nombre, s.nombre;
  `;

    try {
        const [results] = await db.query(sql);

        const categorias = {};

        results.forEach(row => {
            if (!row.subcategoria_id) return;

            if (!categorias[row.categoria_id]) {
                categorias[row.categoria_id] = {
                    id: row.categoria_id,
                    nombre: row.categoria_nombre,
                    icono_url: row.icono_url,
                    subcategorias: []
                };
            }

            categorias[row.categoria_id].subcategorias.push({
                id: row.subcategoria_id,
                nombre: row.subcategoria_nombre,
                cantidad: row.cantidad_productos
            });
        });

        res.json(Object.values(categorias));
    } catch (err) {
        console.error('❌ Error al obtener categorías con subcategorías:', err);
        res.status(500).json({ error: 'Error interno al procesar categorías' });
    }
};
