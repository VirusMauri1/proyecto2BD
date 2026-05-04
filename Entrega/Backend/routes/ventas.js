const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all ventas
router.get('/', async (req, res) => {
    try {
    const result = await pool.query(
        `SELECT v.id_venta, v.fecha, v.total,
                c.nombre AS cliente,
                e.nombre AS empleado
        FROM venta v
        JOIN cliente c ON v.id_cliente = c.id_cliente
        JOIN empleado e ON v.id_empleado = e.id_empleado
        ORDER BY v.fecha DESC`
    );
    res.json(result.rows);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

// GET detalle de una venta
router.get('/:id/detalle', async (req, res) => {
    try {
    const { id } = req.params;
    const result = await pool.query(
        `SELECT dv.id_detalle, dv.cantidad, dv.precio_unitario, dv.subtotal,
                p.nombre AS producto
        FROM detalle_venta dv
        JOIN producto p ON dv.id_producto = p.id_producto
        WHERE dv.id_venta = $1`,
        [id]
    );
    res.json(result.rows);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener detalle de venta' });
    }
});

// POST registrar venta con transaccion explicita
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
    const { id_cliente, id_empleado, items } = req.body;

    if (!id_cliente || !id_empleado || !items || items.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos para registrar la venta' });
    }

    await client.query('BEGIN');

    // Verificar stock y calcular total
    let total = 0;
    for (const item of items) {
        const stockResult = await client.query(
        'SELECT stock, precio FROM producto WHERE id_producto = $1 FOR UPDATE',
        [item.id_producto]
        );
        if (stockResult.rows.length === 0) {
        throw new Error(`Producto ${item.id_producto} no encontrado`);
        }
        const producto = stockResult.rows[0];
        if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para producto ${item.id_producto}. Disponible: ${producto.stock}`);
        }
      total += parseFloat(producto.precio) * item.cantidad;
    }

    // INSERT venta
    const ventaResult = await client.query(
        `INSERT INTO venta (fecha, total, id_cliente, id_empleado)
        VALUES (NOW(), $1, $2, $3)
        RETURNING id_venta`,
        [total, id_cliente, id_empleado]
    );
    const id_venta = ventaResult.rows[0].id_venta;

    // INSERT detalle_venta y UPDATE stock por cada item
    for (const item of items) {
        const precioResult = await client.query(
        'SELECT precio FROM producto WHERE id_producto = $1',
        [item.id_producto]
        );
        const precio_unitario = parseFloat(precioResult.rows[0].precio);
        const subtotal = precio_unitario * item.cantidad;

        await client.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
            VALUES ($1, $2, $3, $4, $5)`,
        [id_venta, item.id_producto, item.cantidad, precio_unitario, subtotal]
        );

        await client.query(
        'UPDATE producto SET stock = stock - $1 WHERE id_producto = $2',
        [item.cantidad, item.id_producto]
        );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Venta registrada exitosamente', id_venta, total });
    } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message || 'Error al registrar la venta' });
    } finally {
    client.release();
    }
});

module.exports = router;