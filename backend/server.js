require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const Appointment = require('./models/Appointment');

const app = express();

// ===== Middlewares globais =====
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // ajuste para o domínio do frontend no deploy
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());

// Rate limiting básico (protege contra brute force no login)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de requisições por IP
  message: { erro: 'Muitas requisições deste IP, tente novamente mais tarde.' }
});
app.use(limiter);

// ===== Rotas =====
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// ===== Conexão com MongoDB =====

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Conectado ao MongoDB');

    // Sincroniza índices do Appointment
    try {
      await Appointment.syncIndexes();
      console.log('✅ Índices de Appointment sincronizados com sucesso');
    } catch (err) {
      console.error('❌ Erro ao sincronizar índices de Appointment:', err.message);
    }

    // Inicia o servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  });

// ===== Rota raiz para teste rápido =====
app.get('/', (req, res) => {
  res.json({ mensagem: 'API da Clínica Médica está online!' });
});
