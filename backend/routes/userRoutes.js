// /backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { cadastrarUsuario, loginUsuario } = require('../controllers/userController');

// Rota para cadastro
router.post('/register', cadastrarUsuario);

// Rota para login
router.post('/login', loginUsuario);

// rota para testes
router.get('/teste', (req, res) => {
  res.send('Rota de teste funcionando!');
});


module.exports = router;
