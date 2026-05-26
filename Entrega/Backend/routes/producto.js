const express = require('express');
const router  = express.Router();
const { requireAuth, requireRol } = require('../middleware/auth');
const { Producto, Categoria } = require('../orm/sequelize');
const pool = require('../db');

const PUEDE_VER    = ['admin', 'gerente', 'vendedor', 'cajero', 'inventario'];
const PUEDE_EDITAR = ['admin', 'gerente', 'inventario'];
const PUEDE_BORRAR = ['admin', 'gerente'];

// GET all productos
router.get('/', requireAuth, requireRol(...PUEDE_VER), async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [{ model: Categoria, attributes: ['nombre'] }],
            order: [['id_producto', 'ASC']],
        });
        const data = productos.map(p => ({
            id_producto:  p.id_producto,
            nombre:       p.nombre,
            descripcion:  p.descripcion,
            precio:       p.precio,
            stock:        p.stock,
            id_categoria: p.id_categoria,
            categoria:    p.categoria?.nombre || '',
        }));
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// GET producto by id 
router.get('/:id', requireAuth, requireRol(...PUEDE_VER), async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id, {
            include: [{ model: Categoria, attributes: ['nombre'] }],
        });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({
            id_producto:  producto.id_producto,
            nombre:       producto.nombre,
            descripcion:  producto.descripcion,
            precio:       producto.precio,
            stock:        producto.stock,
            id_categoria: producto.id_categoria,
            categoria:    producto.categoria?.nombre || '',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

router.post('/', requireAuth, requireRol(...PUEDE_EDITAR), async (req, res) => {
    const client = await pool.connect();
    try {
        const { nombre, descripcion, precio, stock, id_categoria } = req.body;
        if (!nombre || !descripcion || !precio || stock === undefined || !id_categoria) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        await client.query('BEGIN');
        const result = await client.query(
            'CALL crear_producto($1, $2, $3, $4, $5, $6)',
            [nombre, descripcion, parseFloat(precio), parseInt(stock), parseInt(id_categoria), 0]
        );

        await client.query('COMMIT');
        const idCreado = result.rows[0]?.p_id_producto;
        if (idCreado) {
            const nuevo = await Producto.findByPk(idCreado);
            return res.status(201).json(nuevo);
        }
        res.status(201).json({ message: 'Producto creado' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(400).json({ error: err.message || 'Error al crear producto' });
    } finally {
        client.release();
    }
});

router.put('/:id', requireAuth, requireRol(...PUEDE_EDITAR), async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, id_categoria } = req.body;
        if (!nombre || !descripcion || !precio || stock === undefined || !id_categoria) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

        await producto.update({ nombre, descripcion, precio, stock, id_categoria });
        res.json(producto);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// DELETE producto 
router.delete('/:id', requireAuth, requireRol(...PUEDE_BORRAR), async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        await producto.destroy();
        res.json({ message: 'Producto eliminado', producto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});
router.patch('/:id/stock', requireAuth, requireRol(...PUEDE_EDITAR), async (req, res) => {
    const client = await pool.connect();
    try {
        const { stock } = req.body;
        if (stock === undefined) return res.status(400).json({ error: 'stock requerido' });
        await client.query('BEGIN');
        const result = await client.query(
            'CALL actualizar_stock($1, $2, $3)',
            [req.params.id, parseInt(stock), -1]
        );
        await client.query('COMMIT');
        const stockAnterior = result.rows[0]?.p_stock_anterior;
        res.json({ message: 'Stock actualizado', stock_anterior: stockAnterior, stock_nuevo: stock });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(400).json({ error: err.message || 'Error al actualizar stock' });
    } finally {
        client.release();
    }
});

module.exports = router;