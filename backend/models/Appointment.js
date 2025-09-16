const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  secretario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // só será preenchido quando um secretário estiver vinculado à consulta
  },
  data: {
    type: Date,
    required: true
  },
  horario: {
    type: String,
    required: true
  },
  endereco: {
    rua: { type: String, required: true },
    bairro: { type: String, required: true },
    cidade: { type: String, required: true },
    estado: { type: String, required: true }
  },
  clima: {
    previsao: { type: String },
    icone: { type: String },
    alertaChuva: { type: Boolean, default: false }
  },
  descricao: {
    type: String
  }
}, {
  timestamps: true
});

/**
 * Índice único para evitar agendamentos duplicados no mesmo dia/horário.
 * O índice é criado considerando a data e o horário.
 * 
 * Observação: se no futuro houver múltiplos médicos/salas, 
 * adicione o campo correspondente no índice para permitir horários iguais em recursos diferentes.
 */
appointmentSchema.index({ data: 1, horario: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
