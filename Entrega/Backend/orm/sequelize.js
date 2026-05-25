const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME     || 'tienda',
    process.env.DB_USER     || 'proy3',
    process.env.DB_PASSWORD || 'secret',
    {
        host:    process.env.DB_HOST || 'db',
        port:    process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

const AppUsuario = sequelize.define('app_usuario', {
    id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:   { type: DataTypes.STRING(50),  allowNull: false },
    password:   { type: DataTypes.STRING(255), allowNull: false },
    rol:        { type: DataTypes.STRING(20),  allowNull: false },
    activo:     { type: DataTypes.BOOLEAN,     defaultValue: true },
}, { timestamps: false, freezeTableName: true });

const Categoria = sequelize.define('categoria', {
    id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre:       { type: DataTypes.STRING(50), allowNull: false },
    descripcion:  { type: DataTypes.TEXT,       allowNull: false },
}, { timestamps: false, freezeTableName: true });

const Producto = sequelize.define('producto', {
    id_producto:  { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
    nombre:       { type: DataTypes.STRING(50),   allowNull: false },
    descripcion:  { type: DataTypes.TEXT,         allowNull: false },
    precio:       { type: DataTypes.DECIMAL(10,2),allowNull: false },
    stock:        { type: DataTypes.INTEGER,      allowNull: false },
    id_categoria: { type: DataTypes.INTEGER,      allowNull: false },
}, { timestamps: false, freezeTableName: true });

const Cliente = sequelize.define('cliente', {
    id_cliente: { type: DataTypes.INTEGER,    primaryKey: true, autoIncrement: true },
    nombre:     { type: DataTypes.STRING(50), allowNull: false },
    telefono:   { type: DataTypes.STRING(12), allowNull: false },
    email:      { type: DataTypes.STRING(100),allowNull: false },
}, { timestamps: false, freezeTableName: true });

const Empleado = sequelize.define('empleado', {
    id_empleado: { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
    nombre:      { type: DataTypes.STRING(50),   allowNull: false },
    puesto:      { type: DataTypes.STRING(50),   allowNull: false },
    salario:     { type: DataTypes.DECIMAL(10,2),allowNull: false },
}, { timestamps: false, freezeTableName: true });

const Venta = sequelize.define('venta', {
    id_venta:    { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
    fecha:       { type: DataTypes.DATE,         allowNull: false },
    total:       { type: DataTypes.DECIMAL(10,2),allowNull: false },
    id_cliente:  { type: DataTypes.INTEGER,      allowNull: false },
    id_empleado: { type: DataTypes.INTEGER,      allowNull: false },
}, { timestamps: false, freezeTableName: true });

const DetalleVenta = sequelize.define('detalle_venta', {
    id_detalle:      { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
    id_venta:        { type: DataTypes.INTEGER,      allowNull: false },
    id_producto:     { type: DataTypes.INTEGER,      allowNull: false },
    cantidad:        { type: DataTypes.INTEGER,      allowNull: false },
    precio_unitario: { type: DataTypes.DECIMAL(10,2),allowNull: false },
    subtotal:        { type: DataTypes.DECIMAL(10,2),allowNull: false },
}, { timestamps: false, freezeTableName: true });

Producto.belongsTo(Categoria, { foreignKey: 'id_categoria' });
Categoria.hasMany(Producto,   { foreignKey: 'id_categoria' });

Venta.belongsTo(Cliente,  { foreignKey: 'id_cliente' });
Venta.belongsTo(Empleado, { foreignKey: 'id_empleado' });
Cliente.hasMany(Venta,    { foreignKey: 'id_cliente' });

DetalleVenta.belongsTo(Venta,   { foreignKey: 'id_venta' });
DetalleVenta.belongsTo(Producto,{ foreignKey: 'id_producto' });
Venta.hasMany(DetalleVenta,     { foreignKey: 'id_venta' });

module.exports = {
    sequelize,
    AppUsuario,
    Categoria,
    Producto,
    Cliente,
    Empleado,
    Venta,
    DetalleVenta,
};