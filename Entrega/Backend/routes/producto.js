const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all productos
router.get('/', async (req, res) => {
    try {
    const result = await pool.query(
        `SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
                c.nombre AS categoria
        FROM producto p
        JOIN categoria c ON p.id_categoria = c.id_categoria
        ORDER BY p.id_producto`
    );
    res.json(result.rows);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// GET producto by id
router.get('/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const result = await pool.query(
        `SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
                p.id_categoria, c.nombre AS categoria
        FROM producto p
        JOIN categoria c ON p.id_categoria = c.id_categoria
        WHERE p.id_producto = $1`,
        [id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// POST crear producto
router.post('/', async (req, res) => {
    try {
    const { nombre, descripcion, precio, stock, id_categoria } = req.body;
    if (!nombre || !descripcion || !precio || stock === undefined || !id_categoria) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const result = await pool.query(
        `INSERT INTO producto (nombre, descripcion, precio, stock, id_categoria)
        VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
        [nombre, descripcion, precio, stock, id_categoria]
    );
    res.status(201).json(result.rows[0]);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
    }
});

// PUT actualizar producto
router.put('/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, id_categoria } = req.body;
    if (!nombre || !descripcion || !precio || stock === undefined || !id_categoria) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const result = await pool.query(
        `UPDATE producto
        SET nombre = $1, descripcion = $2, precio = $3, stock = $4, id_categoria = $5
        WHERE id_producto = $6
       RETURNING *`,
        [nombre, descripcion, precio, stock, id_categoria, id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// DELETE producto
router.delete('/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM producto WHERE id_producto = $1 RETURNING *',
        [id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado', producto: result.rows[0] });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;