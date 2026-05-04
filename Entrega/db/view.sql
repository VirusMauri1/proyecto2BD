-- Vista: resumen de ventas por empleado
-- Usada por el backend en GET /api/reportes/resumen-empleados

CREATE OR REPLACE VIEW vista_ventas_empleado AS
SELECT
    e.id_empleado,
    e.nombre AS empleado,
    e.puesto,
    COUNT(v.id_venta)       AS total_ventas,
    COALESCE(SUM(v.total), 0) AS monto_total,
    COALESCE(AVG(v.total), 0) AS promedio_venta
FROM empleado e
LEFT JOIN venta v ON e.id_empleado = v.id_empleado
GROUP BY e.id_empleado, e.nombre, e.puesto;