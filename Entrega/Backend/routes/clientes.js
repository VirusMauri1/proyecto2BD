const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all clientes
router.get('/', async (req, res) => {
    try {
    const result = await pool.query(
      'SELECT * FROM cliente ORDER BY id_cliente'
    );
    res.json(result.rows);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

// GET cliente by id
router.get('/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM cliente WHERE id_cliente = $1',
        [id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cliente' });
    }
});

// POST crear cliente
router.post('/', async (req, res) => {
    try {
    const { nombre, telefono, email } = req.body;
    if (!nombre || !telefono || !email) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const result = await pool.query(
        `INSERT INTO cliente (nombre, telefono, email)
        VALUES ($1, $2, $3)
       RETURNING *`,
        [nombre, telefono, email]
    );
    res.status(201).json(result.rows[0]);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear cliente' });
    }
});

// PUT actualizar cliente
router.put('/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const { nombre, telefono, email } = req.body;
    if (!nombre || !telefono || !email) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const result = await pool.query(
        `UPDATE cliente
        SET nombre = $1, telefono = $2, email = $3
        WHERE id_cliente = $4
       RETURNING *`,
        [nombre, telefono, email, id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});

// DELETE cliente
router.delete('/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM cliente WHERE id_cliente = $1 RETURNING *',
        [id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado', cliente: result.rows[0] });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
    }
});

module.exports = router;