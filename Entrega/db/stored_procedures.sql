-- SP 1: registrar_venta
CREATE OR REPLACE PROCEDURE registrar_venta(
    p_id_cliente   INT,
    p_id_empleado  INT,
    p_productos    INT[],  
    p_cantidades   INT[],   
    INOUT p_id_venta INT,   
    INOUT p_total   NUMERIC 
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_precio        NUMERIC(10,2);
    v_stock         INT;
    v_subtotal      NUMERIC(10,2);
    v_id_producto   INT;
    v_cantidad      INT;
    i               INT;
BEGIN
    p_id_venta := 0;
    p_total    := 0;
    IF array_length(p_productos, 1) IS NULL OR
        array_length(p_productos, 1) <> array_length(p_cantidades, 1) THEN
        RAISE EXCEPTION 'Arrays de productos y cantidades deben tener la misma longitud';
    END IF;

    FOR i IN 1 .. array_length(p_productos, 1) LOOP
        v_id_producto := p_productos[i];
        v_cantidad    := p_cantidades[i];
        SELECT precio, stock
            INTO v_precio, v_stock
            FROM producto
            WHERE id_producto = v_id_producto
            FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto % no existe', v_id_producto;
        END IF;
        IF v_cantidad <= 0 THEN
            RAISE EXCEPTION 'Cantidad debe ser mayor a 0 para producto %', v_id_producto;
        END IF;
        IF v_stock < v_cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para producto %. Disponible: %, Solicitado: %',
                v_id_producto, v_stock, v_cantidad;
        END IF;
        p_total := p_total + v_precio * v_cantidad;
    END LOOP;

    INSERT INTO venta (fecha, total, id_cliente, id_empleado)
    VALUES (NOW(), p_total, p_id_cliente, p_id_empleado)
    RETURNING id_venta INTO p_id_venta;

    FOR i IN 1 .. array_length(p_productos, 1) LOOP
        v_id_producto := p_productos[i];
        v_cantidad    := p_cantidades[i];
        SELECT precio INTO v_precio FROM producto WHERE id_producto = v_id_producto;
        v_subtotal := v_precio * v_cantidad;
        INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (p_id_venta, v_id_producto, v_cantidad, v_precio, v_subtotal);
        UPDATE producto
            SET stock = stock - v_cantidad
            WHERE id_producto = v_id_producto;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- SP 2: actualizar_stock
CREATE OR REPLACE PROCEDURE actualizar_stock(
    p_id_producto   INT,
    p_nuevo_stock   INT,
    INOUT p_stock_anterior INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    p_stock_anterior := -1;
    IF p_nuevo_stock < 0 THEN
        RAISE EXCEPTION 'El stock no puede ser negativo. Valor recibido: %', p_nuevo_stock;
    END IF;
    SELECT stock INTO p_stock_anterior
        FROM producto
        WHERE id_producto = p_id_producto
        FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto con id % no existe', p_id_producto;
    END IF;
    UPDATE producto
        SET stock = p_nuevo_stock
        WHERE id_producto = p_id_producto;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- SP 3: crear_producto
CREATE OR REPLACE PROCEDURE crear_producto(
    p_nombre        VARCHAR(50),
    p_descripcion   TEXT,
    p_precio        NUMERIC(10,2),
    p_stock         INT,
    p_id_categoria  INT,
    INOUT p_id_producto INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_existe INT;
BEGIN
    p_id_producto := 0;
    IF p_precio <= 0 THEN
        RAISE EXCEPTION 'El precio debe ser mayor a 0. Recibido: %', p_precio;
    END IF;
    IF p_stock < 0 THEN
        RAISE EXCEPTION 'El stock inicial no puede ser negativo';
    END IF;
    SELECT COUNT(*) INTO v_existe
        FROM categoria
        WHERE id_categoria = p_id_categoria;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'La categoría % no existe', p_id_categoria;
    END IF;
    INSERT INTO producto (nombre, descripcion, precio, stock, id_categoria)
    VALUES (p_nombre, p_descripcion, p_precio, p_stock, p_id_categoria)
    RETURNING id_producto INTO p_id_producto;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Ya existe un producto con ese nombre: %', p_nombre;
    WHEN OTHERS THEN
        RAISE;
END;
$$;

-- SP 4: eliminar_cliente
CREATE OR REPLACE PROCEDURE eliminar_cliente(
    p_id_cliente  INT,
    INOUT p_eliminado BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_ventas INT;
    v_existe INT;
BEGIN
    p_eliminado := FALSE;
    SELECT COUNT(*) INTO v_existe
        FROM cliente
        WHERE id_cliente = p_id_cliente;
    IF v_existe = 0 THEN
        RAISE EXCEPTION 'Cliente % no existe', p_id_cliente;
    END IF;
    SELECT COUNT(*) INTO v_ventas
        FROM venta
        WHERE id_cliente = p_id_cliente;
    IF v_ventas > 0 THEN
        RAISE EXCEPTION 'No se puede eliminar el cliente % porque tiene % venta(s) registrada(s)',
            p_id_cliente, v_ventas;
    END IF;
    DELETE FROM cliente WHERE id_cliente = p_id_cliente;
    p_eliminado := TRUE;
EXCEPTION
    WHEN OTHERS THEN
        p_eliminado := FALSE;
        RAISE;
END;
$$;

-- SP 5: reporte_ventas_periodo
CREATE OR REPLACE PROCEDURE reporte_ventas_periodo(
    p_fecha_inicio  TIMESTAMP,
    p_fecha_fin     TIMESTAMP,
    INOUT p_total_ventas  INT,
    INOUT p_monto_total   NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    p_total_ventas := 0;
    p_monto_total  := 0;
    IF p_fecha_inicio > p_fecha_fin THEN
        RAISE EXCEPTION 'La fecha de inicio (%) no puede ser mayor a la fecha fin (%)',
            p_fecha_inicio, p_fecha_fin;
    END IF;
    SELECT COUNT(*), COALESCE(SUM(total), 0)
        INTO p_total_ventas, p_monto_total
        FROM venta
        WHERE fecha BETWEEN p_fecha_inicio AND p_fecha_fin;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;