const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const { AppUsuario } = require('../orm/sequelize');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        const usuario = await AppUsuario.findOne({ where: { username, activo: true } });
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (password !== usuario.password) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
}

        req.session.usuario = {
            id:       usuario.id_usuario,
            username: usuario.username,
            rol:      usuario.rol,
        };

        res.json({ message: 'Login exitoso', usuario: req.session.usuario });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en login' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Sesión cerrada' });
    });
});

router.get('/me', (req, res) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    res.json(req.session.usuario);
});

module.exports = router;