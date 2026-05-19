require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const session     = require('express-session');

const { sequelize } = require('./orm/sequelize');
const productosRouter = require('./routes/producto');
const clientesRouter  = require('./routes/clientes');
const ventasRouter    = require('./routes/ventas');
const reportesRouter  = require('./routes/reportes');
const authRouter      = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(session({
    secret:            process.env.SESSION_SECRET || 'proy3_secret_key',
    resave:            false,
    saveUninitialized: false,
}));


app.use('/api/auth',     authRouter);
app.use('/api/productos', productosRouter);
app.use('/api/clientes',  clientesRouter);
app.use('/api/ventas',    ventasRouter);
app.use('/api/reportes',  reportesRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Arrancar: primero conectar ORM (sync:false), luego escuchar
sequelize.authenticate()
    .then(() => console.log('ORM conectado a PostgreSQL'))
    .catch(err => console.error('Error ORM:', err));

app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));