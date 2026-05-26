const express = require('express');
const router  = express.Router();
const { requireAuth, requireRol } = require('../middleware/auth');
const pool = require('../db');

const PUEDE_REPORTES = ['admin', 'gerente', 'vendedor'];
router.get('/productos-proveedores', requireAuth, requireRol(...PUEDE_REPORTES), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.nombre AS producto,
                    c.nombre AS categoria,
                    pr.nombre AS proveedor,
                    s.precio_compra,
                    p.precio AS precio_venta
            FROM producto p
            JOIN categoria c  ON p.id_categoria  = c.id_categoria
            JOIN suministra s ON p.id_producto   = s.id_producto
            JOIN proveedor pr ON s.id_proveedor  = pr.id_proveedor
            ORDER BY p.nombre`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
});

// JOIN 2: Ventas con cliente y empleado
router.get('/ventas-detalle', requireAuth, requireRol(...PUEDE_REPORTES), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT v.id_venta, v.fecha,
                    c.nombre AS cliente,
                    e.nombre AS empleado, e.puesto,
                    v.total
            FROM venta v
            JOIN cliente  c ON v.id_cliente  = c.id_cliente
            JOIN empleado e ON v.id_empleado = e.id_empleado
            ORDER BY v.fecha DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener reporte de ventas' });
    }
});

router.get('/detalle-ventas-productos', requireAuth, requireRol(...PUEDE_REPORTES), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT v.id_venta, v.fecha,
                    p.nombre AS producto,
                    cat.nombre AS categoria,
                    dv.cantidad, dv.precio_unitario, dv.subtotal
            FROM detalle_venta dv
            JOIN venta v    ON dv.id_venta    = v.id_venta
            JOIN producto p ON dv.id_producto = p.id_producto
            JOIN categoria cat ON p.id_categoria = cat.id_categoria
            ORDER BY v.fecha DESC, dv.id_detalle`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener detalle de ventas' });
    }
});

router.get('/clientes-con-compras', requireAuth, requireRol(...PUEDE_REPORTES), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id_cliente, nombre, telefono, email
            FROM cliente
            WHERE id_cliente IN (SELECT DISTINCT id_cliente FROM venta)
            ORDER BY nombre`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener clientes con compras' });
    }
});

router.get('/productos-bajo-stock', requireAuth, requireRol('admin', 'gerente', 'inventario'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.id_producto, p.nombre, p.stock, p.precio, c.nombre AS categoria
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE EXISTS (
                SELECT 1 FROM detalle_venta dv WHERE dv.id_producto = p.id_producto
            )
            AND p.stock < (SELECT AVG(stock) FROM producto)
            ORDER BY p.stock ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener productos con bajo stock' });
    }
});

router.get('/categorias-resumen', requireAuth, requireRol(...PUEDE_REPORTES), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.nombre AS categoria,
                    COUNT(p.id_producto)  AS total_productos,
                    SUM(p.stock)          AS stock_total,
                    AVG(p.precio)         AS precio_promedio,
                    MAX(p.precio)         AS precio_maximo
            FROM categoria c
            JOIN producto p ON c.id_categoria = p.id_categoria
            GROUP BY c.id_categoria, c.nombre
            HAVING COUNT(p.id_producto) > 1
            ORDER BY total_productos DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener resumen por categoría' });
    }
});

router.get('/top-productos', requireAuth, requireRol(...PUEDE_REPORTES), async (req, res) => {
    try {
        const result = await pool.query(
            `WITH ventas_por_producto AS (
                SELECT dv.id_producto,
                    SUM(dv.cantidad) AS total_vendido,
                    SUM(dv.subtotal) AS ingresos_totales
                FROM detalle_venta dv
                GROUP BY dv.id_producto
            )
            SELECT p.nombre AS producto,
                c.nombre AS categoria,
                vpp.total_vendido,
                vpp.ingresos_totales
            FROM ventas_por_producto vpp
            JOIN producto p  ON vpp.id_producto  = p.id_producto
            JOIN categoria c ON p.id_categoria   = c.id_categoria
            ORDER BY vpp.total_vendido DESC
            LIMIT 10`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener top productos' });
    }
});

router.get('/resumen-empleados', requireAuth, requireRol('admin', 'gerente'), async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM vista_ventas_empleado ORDER BY total_ventas DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener resumen de empleados' });
    }
});

router.get('/categorias', requireAuth, requireRol(...PUEDE_REPORTES, 'cajero', 'inventario'), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categoria ORDER BY nombre');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

// GET empleados para formularios
router.get('/empleados', requireAuth, requireRol(...PUEDE_REPORTES, 'cajero'), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM empleado ORDER BY nombre');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener empleados' });
    }
});

module.exports = router;