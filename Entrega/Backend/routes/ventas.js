const express = require('express');
const router  = express.Router();
const { requireAuth, requireRol } = require('../middleware/auth');
const pool = require('../db');

const PUEDE_VER    = ['admin', 'gerente', 'vendedor', 'cajero'];
const PUEDE_CREAR  = ['admin', 'vendedor', 'cajero'];

// GET all ventas
router.get('/', requireAuth, requireRol(...PUEDE_VER), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT v.id_venta, v.fecha, v.total,
                    c.nombre AS cliente,
                    e.nombre AS empleado
            FROM venta v
            JOIN cliente  c ON v.id_cliente  = c.id_cliente
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
router.get('/:id/detalle', requireAuth, requireRol(...PUEDE_VER), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT dv.id_detalle, dv.cantidad, dv.precio_unitario, dv.subtotal,
                    p.nombre AS producto
            FROM detalle_venta dv
            JOIN producto p ON dv.id_producto = p.id_producto
            WHERE dv.id_venta = $1`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener detalle de venta' });
    }
});

router.post('/', requireAuth, requireRol(...PUEDE_CREAR), async (req, res) => {
    const client = await pool.connect();
    try {
        const { id_cliente, id_empleado, items } = req.body;

        if (!id_cliente || !id_empleado || !items || items.length === 0) {
            return res.status(400).json({ error: 'Datos incompletos para registrar la venta' });
        }
        const productos   = items.map(i => i.id_producto);
        const cantidades  = items.map(i => i.cantidad);

        await client.query('BEGIN');

        const result = await client.query(
            'CALL registrar_venta($1, $2, $3, $4, $5, $6)',
            [id_cliente, id_empleado, productos, cantidades, 0, 0]
        );

        await client.query('COMMIT');
        const row = result.rows[0];
        res.status(201).json({
            message:   'Venta registrada exitosamente',
            id_venta:  row?.p_id_venta,
            total:     row?.p_total,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(400).json({ error: err.message || 'Error al registrar la venta' });
    } finally {
        client.release();
    }
});

router.get('/reporte/periodo', requireAuth, requireRol('admin', 'gerente'), async (req, res) => {
    const client = await pool.connect();
    try {
        const { fecha_inicio, fecha_fin } = req.query;
        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'fecha_inicio y fecha_fin son requeridos' });
        }

        await client.query('BEGIN');

        const result = await client.query(
            'CALL reporte_ventas_periodo($1, $2, $3, $4)',
            [fecha_inicio, fecha_fin, 0, 0]
        );

        await client.query('COMMIT');

        const row = result.rows[0];
        res.json({
            fecha_inicio,
            fecha_fin,
            total_ventas: row?.p_total_ventas,
            monto_total:  row?.p_monto_total,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(400).json({ error: err.message || 'Error al generar reporte' });
    } finally {
        client.release();
    }
});

module.exports = router;