const express = require('express');
const router  = express.Router();
const { requireAuth, requireRol } = require('../middleware/auth');
const { Cliente } = require('../orm/sequelize');
const pool = require('../db');

const PUEDE_VER    = ['admin', 'gerente', 'vendedor', 'cajero'];
const PUEDE_EDITAR = ['admin', 'gerente', 'vendedor', 'cajero'];
const PUEDE_BORRAR = ['admin', 'gerente'];

// GET all clientes  
router.get('/', requireAuth, requireRol(...PUEDE_VER), async (req, res) => {
    try {
        const clientes = await Cliente.findAll({ order: [['id_cliente', 'ASC']] });
        res.json(clientes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

// GET cliente by id 
router.get('/:id', requireAuth, requireRol(...PUEDE_VER), async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener cliente' });
    }
});

router.post('/', requireAuth, requireRol(...PUEDE_EDITAR), async (req, res) => {
    try {
        const { nombre, telefono, email } = req.body;
        if (!nombre || !telefono || !email) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const cliente = await Cliente.create({ nombre, telefono, email });
        res.status(201).json(cliente);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
});

router.put('/:id', requireAuth, requireRol(...PUEDE_EDITAR), async (req, res) => {
    try {
        const { nombre, telefono, email } = req.body;
        if (!nombre || !telefono || !email) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

        await cliente.update({ nombre, telefono, email });
        res.json(cliente);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});

router.delete('/:id', requireAuth, requireRol(...PUEDE_BORRAR), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            'CALL eliminar_cliente($1, $2)',
            [req.params.id, false]
        );

        await client.query('COMMIT');
        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(400).json({ error: err.message || 'Error al eliminar cliente' });
    } finally {
        client.release();
    }
});

module.exports = router;