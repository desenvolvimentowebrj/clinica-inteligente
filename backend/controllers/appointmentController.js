const Appointment = require('../models/Appointment');
const axios = require('axios');
const { formatInTimeZone } = require('date-fns-tz');

// ===============================
// Funções auxiliares
// ===============================

// Buscar endereço pelo CEP
async function buscarEnderecoPorCEP(cep) {
  try {
    const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (res.data.erro) return null;
    return {
      rua: res.data.logradouro,
      bairro: res.data.bairro,
      cidade: res.data.localidade,
      estado: res.data.uf
    };
  } catch (err) {
    console.error('Erro ao buscar CEP:', err.message);
    return null;
  }
}

// Buscar clima pela cidade
async function buscarClima(cidade) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`
    );

    const previsao = res.data.weather[0].description;
    const icone = res.data.weather[0].icon;
    const alertaChuva = previsao.toLowerCase().includes('chuva');

    return { previsao, icone, alertaChuva };
  } catch (err) {
    console.error('Erro ao buscar clima:', err.message);
    return null;
  }
}

// ===============================
// Controllers
// ===============================

// POST /api/appointments
// Agendar nova consulta (apenas pacientes)


exports.agendarConsulta = async (req, res) => {
  try {
    const usuario = req.usuario;

    //  Permitir pacientes
    if (usuario.tipo !== 'paciente') {
  return res.status(403).json({ erro: 'Apenas pacientes podem agendar consultas' });
	}

    const { data, horario, cep, descricao } = req.body;

    if (!data || !horario || !cep) {
      return res.status(400).json({ erro: 'Data, horário e CEP são obrigatórios' });
    }

    // Verificar conflito de horário
    const conflito = await Appointment.findOne({ data, horario });
    if (conflito) {
      return res.status(409).json({ erro: 'Horário já ocupado' });
    }

    // Buscar endereço
    const endereco = await buscarEnderecoPorCEP(cep);
    if (!endereco) {
      return res.status(400).json({ erro: 'CEP inválido ou não encontrado' });
    }

    // Buscar clima
    const clima = await buscarClima(endereco.cidade);

    // Criar consulta vinculada ao próprio usuário
    const novaConsulta = await Appointment.create({
      paciente: usuario._id, // sempre vincula ao próprio usuário
      data,
      horario,
      endereco,
      clima,
      descricao
    });

    return res.status(201).json({
      mensagem: 'Consulta agendada com sucesso',
      consulta: novaConsulta
    });
  } catch (err) {
    console.error('Erro ao agendar consulta:', err.message);
    return res.status(500).json({ erro: 'Erro ao agendar consulta' });
  }
};





// GET /api/appointments
// Listar consultas (visão pessoal)
exports.listarConsultas = async (req, res) => {
  try {
    const usuario = req.usuario;
    let consultas = [];

  if (usuario.tipo === 'paciente' || usuario.tipo === 'secretario') {
  consultas = await Appointment.find({ paciente: usuario._id }).populate('paciente');
} else {
  return res.status(403).json({ erro: 'Acesso negado' });
}

    const zona = 'America/Sao_Paulo';
    const consultasFormatadas = consultas.map(c => {
      const obj = c.toObject();
      obj.dataFormatada = formatInTimeZone(new Date(c.data), zona, 'dd/MM/yyyy');
      return obj;
    });

    return res.json(consultasFormatadas);
  } catch (err) {
    console.error('Erro ao listar consultas:', err.message);
    return res.status(500).json({ erro: 'Erro ao listar consultas' });
  }
};

// GET /api/appointments/admin
// Listar todas as consultas (painel administrativo - apenas secretários)
exports.listarConsultasAdmin = async (req, res) => {
  try {
    const usuario = req.usuario;

    if (usuario.tipo !== 'secretario') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const consultas = await Appointment.find().populate('paciente');

    const zona = 'America/Sao_Paulo';
    const consultasFormatadas = consultas.map(c => {
      const obj = c.toObject();
      obj.dataFormatada = formatInTimeZone(new Date(c.data), zona, 'dd/MM/yyyy');
      return obj;
    });

    return res.json(consultasFormatadas);
  } catch (err) {
    console.error('Erro ao listar consultas (admin):', err.message);
    return res.status(500).json({ erro: 'Erro ao listar consultas' });
  }
};

// GET /api/appointments/horarios
// Listar horários disponíveis para uma data
exports.horariosDisponiveis = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ erro: 'Data é obrigatória' });
    }

    const todosHorarios = [
      '08:00', '08:30', '09:00', '09:30',
      '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];

    const ocupadosDocs = await Appointment.find({ data }).select('horario');
    const horariosOcupados = ocupadosDocs.map(c => c.horario);

    const disponiveis = todosHorarios.filter(h => !horariosOcupados.includes(h));

    return res.json({
      data,
      disponiveis,
      ocupados: horariosOcupados
    });
  } catch (err) {
    console.error('Erro ao listar horários disponíveis:', err.message);
    return res.status(500).json({ erro: 'Erro ao listar horários' });
  }
};

// DELETE /api/appointments/:id
// Cancelar consulta (apenas secretários)
exports.cancelarConsulta = async (req, res) => {
  try {
    const usuario = req.usuario;

    if (usuario.tipo !== 'secretario') {
      return res.status(403).json({ erro: 'Apenas secretários podem cancelar consultas' });
    }

    const { id } = req.params;
    const consulta = await Appointment.findById(id);

    if (!consulta) {
      return res.status(404).json({ erro: 'Consulta não encontrada' });
    }

    await Appointment.findByIdAndDelete(id);

    return res.json({ mensagem: 'Consulta cancelada com sucesso' });
  } catch (err) {
    console.error('Erro ao cancelar consulta:', err.message);
    return res.status(500).json({ erro: 'Erro ao cancelar consulta' });
  }
};
