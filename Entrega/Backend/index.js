require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productosRouter = require('./routes/producto');
const clientesRouter = require('./routes/clientes');
const ventasRouter = require('./routes/ventas');
const reportesRouter = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/ventas', ventasRouter);
app.use('/api/reportes', reportesRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`Backend corriendo en puerto ${PORT}`);
});
