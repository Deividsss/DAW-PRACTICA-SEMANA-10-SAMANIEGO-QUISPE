const pool = require('../config/db');

// GET /api/productos - listar todos los productos
exports.listarProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(
      'SELECT id, nombre, descripcion, precio, stock FROM productos ORDER BY id'
    );
    return res.status(200).json(productos);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'No se pudieron listar los productos' });
  }
};

// GET /api/productos/:id - obtener un producto
exports.obtenerProducto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un entero positivo' });
    }

    const [filas] = await pool.execute(
      'SELECT id, nombre, descripcion, precio, stock FROM productos WHERE id = ?',
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json(filas[0]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'No se pudo obtener el producto' });
  }
};

// POST /api/productos - crear un producto
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion = '', precio, stock } = req.body;

    if (typeof nombre !== 'string' || nombre.trim() === '' ||
        precio === undefined || stock === undefined) {
      return res.status(400).json({
        error: 'Los campos nombre, precio y stock son obligatorios'
      });
    }

    const precioNum = Number(precio);
    const stockNum = Number(stock);

    if (!Number.isFinite(precioNum) || precioNum < 0 ||
        !Number.isInteger(stockNum) || stockNum < 0) {
      return res.status(400).json({
        error: 'El precio debe ser un número no negativo y el stock un entero no negativo'
      });
    }

    const [resultado] = await pool.execute(
      'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)',
      [nombre.trim(), String(descripcion), precioNum, stockNum]
    );

    return res.status(201).json({
      mensaje: 'Producto creado correctamente',
      id: resultado.insertId,
      producto: { id: resultado.insertId, nombre: nombre.trim(), descripcion, precio: precioNum, stock: stockNum }
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'No se pudo crear el producto' });
  }
};

// PUT /api/productos/:id - actualizar un producto
exports.actualizarProducto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion = '', precio, stock } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un entero positivo' });
    }

    if (typeof nombre !== 'string' || nombre.trim() === '' ||
        precio === undefined || stock === undefined) {
      return res.status(400).json({
        error: 'Los campos nombre, precio y stock son obligatorios'
      });
    }

    const precioNum = Number(precio);
    const stockNum = Number(stock);

    if (!Number.isFinite(precioNum) || precioNum < 0 ||
        !Number.isInteger(stockNum) || stockNum < 0) {
      return res.status(400).json({
        error: 'El precio debe ser un número no negativo y el stock un entero no negativo'
      });
    }

    const [resultado] = await pool.execute(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?',
      [nombre.trim(), String(descripcion), precioNum, stockNum, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json({ mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'No se pudo actualizar el producto' });
  }
};

// DELETE /api/productos/:id - eliminar un producto
exports.eliminarProducto = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID debe ser un entero positivo' });
    }

    const [resultado] = await pool.execute(
      'DELETE FROM productos WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'No se pudo eliminar el producto' });
  }
};