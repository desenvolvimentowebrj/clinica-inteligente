// /backend/controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ mensagem: 'Usuário já cadastrado' });

    const novoUsuario = await User.create({ nome, email, senha, tipo });
    const token = gerarToken(novoUsuario._id);

    res.status(201).json({ usuario: novoUsuario, token });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
  }
};

exports.loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log('Login iniciado para:', email);

    const usuario = await User.findOne({ email });
    if (!usuario) {
      console.log('Usuário não encontrado');
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    console.log('Usuário encontrado. Comparando senha...');
    console.log('Senha digitada:', senha);
    console.log('Senha armazenada:', usuario.senha);

    const senhaValida = await usuario.compararSenha(senha);
    console.log('Resultado da comparação:', senhaValida);

    if (!senhaValida) {
      console.log('Senha incorreta');
      return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Login bem-sucedido');
    res.status(200).json({ usuario, token });
  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
};


