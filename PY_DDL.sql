CREATE TABLE categoria (
	id_categoria SERIAL,
	nombre VARCHAR(50) NOT NULL,
	descripcion TEXT NOT NULL,
	
	constraint pk_categoria PRIMARY KEY (id_categoria)
);

CREATE TABLE producto (
	id_producto SERIAL,
	nombre VARCHAR(50) NOT NULL,
	descripcion TEXT NOT NULL,
	precio DECIMAL(10,2) NOT NULL,
	stock INT NOT NULL,
	id_categoria INT NOT NULL,
	
	constraint pk_producto PRIMARY KEY (id_producto),

	constraint fk_producto_categoria 
		FOREIGN KEY (id_categoria) 
		REFERENCES categoria(id_categoria)
);

CREATE TABLE proveedor (
	id_proveedor SERIAL,
	nombre VARCHAR(50) NOT NULL,
	telefono VARCHAR(12) NOT NULL,
	email VARCHAR(100) NOT NULL,
	direccion VARCHAR(100) NOT NULL,

	constraint pk_proveedor PRIMARY KEY (id_proveedor)

);

CREATE TABLE suministra (
	id_producto INT NOT NULL,
	id_proveedor INT NOT NULL,
	precio_compra DECIMAL (10,2) NOT NULL,

	constraint pk_suministra PRIMARY KEY (id_producto, id_proveedor),

	constraint fk_suministra_producto 
		FOREIGN KEY (id_producto) 
		REFERENCES producto(id_producto),

	constraint fk_suministra_proveedor 
		FOREIGN KEY (id_proveedor) 
		REFERENCES producto(id_proveedor)

);

CREATE TABLE empleado (
	id_empleado SERIAL,
	nombre VARCHAR(50) NOT NULL,
	puesto  VARCHAR(50) NOT NULL,
	salario DECIMAL(10,2) NOT NULL,

	constraint pk_empleado PRIMARY KEY (id_empleado)
);

CREATE TABLE cliente (
	id_cliente SERIAL,
	nombre VARCHAR(50) NOT NULL,
	telefono VARCHAR(12) NOT NULL,
	email VARCHAR(100) NOT NULL,

	constraint pk_cliente PRIMARY KEY (id_cliente)

);

CREATE TABLE venta (
	id_venta SERIAL,
	fecha TIMESTAMP NOT NULL,
	total DECIMAL (10,2) NOT NULL,
	id_cliente int NOT NULL,
	id_empleado int NOT NULL,

	constraint pk_venta PRIMARY KEY (id_venta),

	constraint fk_venta_cliente 
		FOREIGN KEY (id_cliente)
		REFERENCES cliente(id_cliente),
		
	constraint fk_venta_empleado 
		FOREIGN KEY (id_empleado)
		REFERENCES empleado(id_empleado)
);

CREATE TABLE detalle_venta (
	id_detalle SERIAL,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    CONSTRAINT pk_detalle_venta PRIMARY KEY (id_detalle),

    CONSTRAINT fk_detalle_venta_venta
        FOREIGN KEY (id_venta)
        REFERENCES venta(id_venta),

    CONSTRAINT fk_detalle_venta_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
);

-- indices 

-- consultar producto por categoria
CREATE INDEX index_prod_categ
on producto(id_categoria);

-- buscar productos por nombre 
CREATE INDEX index_prod_nom
on producto(nombre);

-- reportes por dias 
CREATE INDEX index_venta_fecha
on venta(fecha);

