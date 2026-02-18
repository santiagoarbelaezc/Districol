const db = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

// ====================
// 🔍 Obtener productos con sus imágenes asociadas
// ====================
exports.obtenerProductos = async (req, res) => {
    try {
        const { subcategoria_id } = req.query;

        // 1️⃣ Consulta de productos con subcategoría y categoría
        let query = `
      SELECT p.id, p.nombre, p.descripcion, p.cantidad, p.precio,
        p.subcategoria_id,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      JOIN subcategorias s ON p.subcategoria_id = s.id
      JOIN categorias c ON s.categoria_id = c.id
    `;
        const params = [];

        if (subcategoria_id) {
            query += ' WHERE p.subcategoria_id = ?';
            params.push(subcategoria_id);
        }

        const [productos] = await db.query(query, params);

        if (productos.length === 0) {
            return res.json([]); // No hay productos
        }

        const productoIds = productos.map(p => p.id);

        // 2️⃣ Obtener todas las imágenes asociadas a esos productos
        const [imagenes] = await db.query(`
      SELECT producto_id, imagen_url
      FROM producto_imagenes
      WHERE producto_id IN (?)
    `, [productoIds]);

        // 3️⃣ Asociar imágenes a su respectivo producto
        const productosConImagenes = productos.map(prod => {
            const imagenesDelProducto = imagenes
                .filter(img => img.producto_id === prod.id)
                .map(img => img.imagen_url);

            return {
                ...prod,
                imagenes: imagenesDelProducto
            };
        });

        res.json(productosConImagenes);
    } catch (err) {
        console.error('❌ Error al obtener productos:', err);
        res.status(500).json({ error: 'No se pudieron obtener los productos' });
    }
};


// ====================
// 🎲 Obtener productos aleatorios
// ====================
exports.obtenerProductosAleatorios = async (req, res) => {
    try {
        // Puedes pasar ?cantidad=5 para obtener 5 productos aleatorios
        const cantidad = parseInt(req.query.cantidad, 10) || 5;
        // Consulta productos aleatorios
        const [productos] = await db.query(`
      SELECT p.id, p.nombre, p.descripcion, p.cantidad, p.precio,
        p.subcategoria_id,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      JOIN subcategorias s ON p.subcategoria_id = s.id
      JOIN categorias c ON s.categoria_id = c.id
      ORDER BY RAND()
      LIMIT ?
    `, [cantidad]);

        if (productos.length === 0) {
            return res.json([]);
        }
        const productoIds = productos.map(p => p.id);
        const [imagenes] = await db.query(`
      SELECT producto_id, imagen_url
      FROM producto_imagenes
      WHERE producto_id IN (?)
    `, [productoIds]);
        const productosConImagenes = productos.map(prod => {
            const imagenesDelProducto = imagenes
                .filter(img => img.producto_id === prod.id)
                .map(img => img.imagen_url);
            return {
                ...prod,
                imagenes: imagenesDelProducto
            };
        });
        res.json(productosConImagenes);
    } catch (err) {
        console.error('❌ Error al obtener productos aleatorios:', err);
        res.status(500).json({ error: 'No se pudieron obtener productos aleatorios' });
    }
};

// ====================
// 📦 Obtener productos por categoría
// ====================
exports.obtenerProductosPorCategoria = async (req, res) => {
    try {
        const { categoria_id } = req.params;
        // Consulta productos que pertenecen a una categoría específica
        const [productos] = await db.query(`
      SELECT p.id, p.nombre, p.descripcion, p.cantidad, p.precio,
        p.subcategoria_id,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      JOIN subcategorias s ON p.subcategoria_id = s.id
      JOIN categorias c ON s.categoria_id = c.id
      WHERE c.id = ?
    `, [categoria_id]);

        if (productos.length === 0) {
            return res.json([]);
        }
        const productoIds = productos.map(p => p.id);
        const [imagenes] = await db.query(`
      SELECT producto_id, imagen_url
      FROM producto_imagenes
      WHERE producto_id IN (?)
    `, [productoIds]);
        const productosConImagenes = productos.map(prod => {
            const imagenesDelProducto = imagenes
                .filter(img => img.producto_id === prod.id)
                .map(img => img.imagen_url);
            return {
                ...prod,
                imagenes: imagenesDelProducto
            };
        });
        res.json(productosConImagenes);
    } catch (err) {
        console.error('❌ Error al obtener productos por categoría:', err);
        res.status(500).json({ error: 'No se pudieron obtener productos por categoría' });
    }
};

// ================================
// 📦 Crear producto con múltiples imágenes (mínimo 1)
// ================================
exports.crearProductoDesdeRuta = async (req, res) => {
    const connection = await db.getConnection(); // Usamos transacción para consistencia

    try {
        const nombre = req.body.nombre?.trim() || '';
        const descripcion = req.body.descripcion?.trim() || '';
        const cantidad = parseInt(req.body.cantidad, 10);
        const precio = parseFloat(req.body.precio);
        const subcategoria_id = parseInt(req.body.subcategoria_id, 10);

        // ✅ Validación básica
        if (!nombre || isNaN(precio) || isNaN(cantidad) || isNaN(subcategoria_id)) {
            return res.status(400).json({ error: 'Datos inválidos. Verifica los campos del formulario.' });
        }

        // ✅ Validación de imágenes (mínimo 1)
        if (!req.imagesInfo || req.imagesInfo.length === 0) {
            return res.status(400).json({ error: 'Debes subir al menos una imagen del producto.' });
        }

        await connection.beginTransaction();

        // 1️⃣ Crear el producto y obtener el ID generado
        const [result] = await connection.query(`
      INSERT INTO productos (nombre, descripcion, cantidad, precio, subcategoria_id)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, descripcion, cantidad, precio, subcategoria_id]);

        const productoId = result.insertId;

        // 2️⃣ Insertar las imágenes en la tabla producto_imagenes
        const insertImagenes = req.imagesInfo.map(imageInfo => {
            const imagen_url = imageInfo.url;
            const public_id = imageInfo.publicId;

            return connection.query(
                `INSERT INTO producto_imagenes (producto_id, imagen_url, public_id)
         VALUES (?, ?, ?)`,
                [productoId, imagen_url, public_id]
            );
        });

        await Promise.all(insertImagenes); // Ejecutar inserciones en paralelo
        await connection.commit();

        res.status(201).json({
            mensaje: 'Producto creado exitosamente con sus imágenes',
            productoId
        });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Error al crear producto con múltiples imágenes:', err);
        res.status(500).json({ error: 'Error interno al crear el producto' });
    } finally {
        connection.release(); // Liberar conexión
    }
};

// ============================
// 🔎 Buscar productos por nombre o similares
// ============================
exports.buscarProductosPorNombre = async (req, res) => {
    try {
        const { nombre } = req.query;
        if (!nombre || nombre.trim().length === 0) {
            return res.status(400).json({ error: 'Debes proporcionar un nombre para buscar.' });
        }
        // Buscar productos cuyo nombre contenga el término (case-insensitive)
        const [productos] = await db.query(`
      SELECT p.id, p.nombre, p.descripcion, p.cantidad, p.precio,
        p.subcategoria_id,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      JOIN subcategorias s ON p.subcategoria_id = s.id
      JOIN categorias c ON s.categoria_id = c.id
      WHERE p.nombre LIKE ?
    `, [`%${nombre}%`]);

        if (productos.length === 0) {
            return res.json([]);
        }
        const productoIds = productos.map(p => p.id);
        const [imagenes] = await db.query(`
      SELECT producto_id, imagen_url
      FROM producto_imagenes
      WHERE producto_id IN (?)
    `, [productoIds]);
        const productosConImagenes = productos.map(prod => {
            const imagenesDelProducto = imagenes
                .filter(img => img.producto_id === prod.id)
                .map(img => img.imagen_url);
            return {
                ...prod,
                imagenes: imagenesDelProducto
            };
        });
        res.json(productosConImagenes);
    } catch (err) {
        console.error('❌ Error al buscar productos por nombre:', err);
        res.status(500).json({ error: 'No se pudo realizar la búsqueda de productos' });
    }
};

// ======================
// ✏️ Actualizar producto con múltiples imágenes
// ======================
exports.actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, cantidad, precio, subcategoria_id } = req.body;

    const connection = await db.getConnection();

    try {
        // 🔍 1. Verificar existencia del producto
        const [producto] = await connection.query('SELECT id FROM productos WHERE id = ?', [id]);

        if (producto.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await connection.beginTransaction();

        // ✏️ 2. Actualizar datos del producto (sin tocar imágenes)
        await connection.query(
            'UPDATE productos SET nombre = ?, descripcion = ?, cantidad = ?, precio = ?, subcategoria_id = ? WHERE id = ?',
            [nombre, descripcion, cantidad, precio, subcategoria_id, id]
        );

        // 🔁 3. Si se subieron nuevas imágenes, reemplazamos las anteriores
        if (req.imagesInfo && req.imagesInfo.length > 0) {
            // 3.1 Obtener imágenes actuales
            const [imagenesActuales] = await connection.query(
                'SELECT public_id FROM producto_imagenes WHERE producto_id = ?',
                [id]
            );

            // 3.2 Eliminar de Cloudinary
            const eliminaciones = imagenesActuales.map(img =>
                cloudinary.uploader.destroy(img.public_id)
            );
            await Promise.all(eliminaciones);

            // 3.3 Eliminar de BD
            await connection.query('DELETE FROM producto_imagenes WHERE producto_id = ?', [id]);

            // 3.4 Insertar nuevas imágenes
            const nuevasImagenes = req.imagesInfo.map(imageInfo => {
                const imagen_url = imageInfo.url;
                const public_id = imageInfo.publicId;
                return connection.query(
                    `INSERT INTO producto_imagenes (producto_id, imagen_url, public_id) VALUES (?, ?, ?)`,
                    [id, imagen_url, public_id]
                );
            });
            await Promise.all(nuevasImagenes);
        }

        await connection.commit();
        res.json({ mensaje: 'Producto actualizado con éxito' });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Error al actualizar producto con imágenes:', err);
        res.status(500).json({ error: 'No se pudo actualizar el producto' });
    } finally {
        connection.release();
    }
};

// ====================
// 🗑️ Eliminar producto con múltiples imágenes
// ====================
exports.eliminarProducto = async (req, res) => {
    const { id } = req.params;

    const connection = await db.getConnection();

    try {
        // 🔍 1. Verificar existencia del producto
        const [producto] = await connection.query('SELECT id FROM productos WHERE id = ?', [id]);
        if (producto.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await connection.beginTransaction();

        // 🖼️ 2. Obtener public_ids de las imágenes asociadas
        const [imagenes] = await connection.query(
            'SELECT public_id FROM producto_imagenes WHERE producto_id = ?',
            [id]
        );

        // 🗑️ 3. Eliminar imágenes de Cloudinary
        const eliminaciones = imagenes.map(img => cloudinary.uploader.destroy(img.public_id));
        await Promise.all(eliminaciones);

        // 🗃️ 4. Eliminar el producto (las imágenes se eliminan automáticamente por ON DELETE CASCADE)
        const [resultado] = await connection.query('DELETE FROM productos WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(400).json({ error: 'No se pudo eliminar el producto' });
        }

        await connection.commit();

        res.json({ mensaje: 'Producto e imágenes eliminados correctamente de la base de datos y de Cloudinary' });
    } catch (err) {
        await connection.rollback();
        console.error('❌ Error al eliminar producto:', err);
        res.status(500).json({ error: 'Error interno al eliminar el producto' });
    } finally {
        connection.release();
    }
};

// ============================
// 🔍 Obtener un producto individual con imágenes
// ============================
exports.obtenerProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Obtener datos del producto
        const [productos] = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.cantidad, p.precio,
              p.subcategoria_id,
              s.nombre AS subcategoria,
              c.nombre AS categoria
       FROM productos p
       JOIN subcategorias s ON p.subcategoria_id = s.id
       JOIN categorias c ON s.categoria_id = c.id
       WHERE p.id = ?`,
            [id]
        );

        if (productos.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const producto = productos[0];

        // 2️⃣ Obtener imágenes del producto
        const [imagenes] = await db.query(
            'SELECT imagen_url FROM producto_imagenes WHERE producto_id = ?',
            [id]
        );

        producto.imagenes = imagenes.map(img => img.imagen_url);

        res.json(producto);
    } catch (err) {
        console.error('❌ Error al obtener producto por ID:', err);
        res.status(500).json({ error: 'No se pudo obtener el producto' });
    }
};
