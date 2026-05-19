-- Se crean los 5 roles para 

CREATE ROLE rol_admin;  -- control general de todo
CREATE ROLE rol_gerente; -- No puede eliminar ventas pero controla todo 
CREATE ROLE rol_vendedor;  -- tiene control de producto detalle producto y lectura del cliente 
CREATE ROLE rol_cajero; --Cajero Puede ver ventas, clientes y productos. Puede insertar y modificar ventas sin eliminar ventas y no ver ventas 
CREATE ROLE rol_inventario; -- puede ver proveedores y trabaja con productos y stock edita y crea productos no tiene para ver clientes ni ventas ni empleados

-- se otorgan los permisos 

GRANT USAGE ON SCHEMA public TO rol_admin;
GRANT USAGE ON SCHEMA public TO rol_gerente;
GRANT USAGE ON SCHEMA public TO rol_vendedor;
GRANT USAGE ON SCHEMA public TO rol_cajero;
GRANT USAGE ON SCHEMA public TO rol_inventario;

-- rol admin = todos los permisos posibles 
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public to rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public to rol_admin;

-- rol de gerente = leer todos modificar productos y empleados 
GRANT SELECT ON ALL TABLES IN SCHEMA public to rol_gerente;
GRANT INSERT, UPDATE, DELETE ON producto, categoria, empleado, proveedor, suministra to rol_gerente;
GRANT USAGE, SELECT ON SEQUENCE venta_id_venta_seq, detalle_venta_id_detalle_seq TO rol_vendedor;

-- rol_vendedor = registrar ventas y ver los productos y tambien a los clientes
GRANT SELECT ON producto, categoria, cliente, empleado TO rol_vendedor;
GRANT SELECT, INSERT ON venta, detalle_venta TO rol_vendedor;
GRANT USAGE, SELECT ON SEQUENCE venta_id_venta_seq, detalle_venta_id_detalle_seq TO rol_vendedor;

-- rol de cajero = ver y manejar ventas y ver clientes 
GRANT SELECT ON venta, detalle_venta, cliente, producto TO rol_cajero;
GRANT INSERT, UPDATE ON venta TO rol_cajero;
GRANT INSERT ON detalle_venta TO rol_cajero;
GRANT USAGE, SELECT ON SEQUENCE venta_id_venta_seq, detalle_venta_id_detalle_seq TO rol_cajero;

-- rol de inventario = ver todos los productos junto a sus stocks y a los proveedores 
GRANT SELECT ON producto, categoria, proveedor, suministra TO rol_inventario;
GRANT INSERT, UPDATE ON producto TO rol_inventario;
GRANT SELECT ON detalle_venta TO rol_inventario;
GRANT USAGE, SELECT ON SEQUENCE producto_id_producto_seq TO rol_inventario;

 
-- aseguramos de no dar permisos peligrosos o de alto impacto a roles no idicados 
REVOKE DELETE ON venta, detalle_venta FROM rol_cajero;
REVOKE DELETE ON venta, detalle_venta FROM rol_vendedor;
REVOKE ALL ON empleado FROM rol_vendedor;
REVOKE ALL ON empleado FROM rol_cajero;
REVOKE ALL ON empleado FROM rol_inventario;

-- se tiene que generar un tipo de usuario para la app 

CREATE TABLE app_usuario (
	id_usuario  SERIAL,
    username    VARCHAR(50) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,  -- bcrypt hash
    rol         VARCHAR(20) NOT NULL CHECK (rol IN ('admin','gerente','vendedor','cajero','inventario')),
    activo      BOOLEAN DEFAULT TRUE,
    CONSTRAINT pk_app_usuario PRIMARY KEY (id_usuario)
);


-- algunos usuarios para probar contrase;a secret pero se usa un hash

INSERT INTO app_usuario (username, password, rol) VALUES
('admin1', 'secret', 'admin'),
('gerente1', 'secret', 'gerente'),
('vendedor1', 'secret', 'vendedor'),
('cajero1',  'secret', 'cajero'),
('inventario1', '$secret', 'inventario')
ON CONFLICT (username) DO NOTHING;
