const express = require('express');
const router = express.Router();

const {
  agendarConsulta,
  listarConsultas,
  listarConsultasAdmin, // função para o painel administrativo
  horariosDisponiveis,
  cancelarConsulta // nova função para cancelamento de consultas
} = require('../controllers/appointmentController');

const authMiddleware = require('../middlewares/authMiddleware');
const permitirRoles = require('../middlewares/roleMiddleware');

// Aplica o middleware de autenticação em todas as rotas deste router
router.use(authMiddleware);

/**
 * @route POST /api/appointments
 * @desc Agendar nova consulta (apenas pacientes)
 */
router.post('/', permitirRoles('paciente'), agendarConsulta);

/**
 * @route GET /api/appointments
 * @desc Listar consultas (visão pessoal)
 * - Paciente: vê apenas as suas
 * - Secretário: vê apenas as que ele agendou (controlado no controller)
 */
router.get('/', listarConsultas);

/**
 * @route GET /api/appointments/horarios
 * @desc Listar horários disponíveis para uma data
 * - Qualquer usuário autenticado pode consultar
 */
router.get('/horarios', horariosDisponiveis);

/**
 * @route GET /api/appointments/admin
 * @desc Painel administrativo - apenas secretários
 * - Lista todas as consultas de todos os pacientes
 */
router.get('/admin', permitirRoles('secretario'), listarConsultasAdmin);

/**
 * @route DELETE /api/appointments/:id
 * @desc Cancelar uma consulta (apenas secretários)
 */
router.delete('/:id', permitirRoles('secretario'), cancelarConsulta);

module.exports = router;
