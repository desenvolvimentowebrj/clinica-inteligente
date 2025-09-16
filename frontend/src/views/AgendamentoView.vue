<template>
  <div class="layout">
    <NavBar />
    <main class="content">
      <div class="card-agendamento">
        <h2>🗓️ Agendar Consulta</h2>

        <!-- Formulário de agendamento -->
        <form v-if="!resultado" @submit.prevent="agendarConsulta">
          
          <!-- Data -->
          <div class="form-group">
            <label>Data:</label>
            <input v-model="data" type="date" @change="carregarHorariosDisponiveis" />
            <p v-if="erros.data" class="erro">{{ erros.data }}</p>
          </div>

          <!-- Horário -->
          <div class="form-group">
            <label>Horário:</label>
            <div class="grade-horarios">
              <div
                v-for="hora in horarios"
                :key="hora"
                class="tooltip-wrapper"
                @mouseenter="mostrarTooltip(hora)"
                @mouseleave="ocultarTooltip"
                @click="mostrarTooltip(hora)"
              >
                <button
                  :class="{ ativo: horario === hora, ocupado: ocupados.includes(hora) }"
                  :disabled="ocupados.includes(hora)"
                  @click.prevent="!ocupados.includes(hora) && (horario = hora)"
                >
                  {{ hora }}
                </button>
                <span
                  v-if="ocupados.includes(hora) && tooltipVisivel === hora"
                  class="tooltip-text"
                >
                  Horário já reservado
                </span>
              </div>
            </div>
            <p v-if="erros.horario" class="erro">{{ erros.horario }}</p>
          </div>

          <!-- CEP -->
          <div class="form-group destaque-cep">
            <label>📍 Localize pelo CEP o local da consulta de sua preferência</label>
            <small class="aviso-cep">
              * Ao final do agendamento anote dia, hora e o local da consulta
            </small>
            <input
              v-model="cep"
              type="text"
              placeholder="00000-000"
              @input="formatarCep"
              @blur="buscarEndereco"
            />
            <p v-if="erros.cep" class="erro">{{ erros.cep }}</p>
          </div>

          <!-- Endereço -->
          <div class="form-group">
            <label>Rua:</label>
            <input v-model="endereco.rua" type="text" disabled />
          </div>

          <div class="form-group">
            <label>Bairro:</label>
            <input v-model="endereco.bairro" type="text" disabled />
          </div>

          <div class="form-group">
            <label>Cidade:</label>
            <input v-model="endereco.cidade" type="text" disabled />
          </div>

          <div class="form-group">
            <label>Estado:</label>
            <input v-model="endereco.estado" type="text" disabled />
          </div>

          <!-- Botão de envio -->
          <button type="submit" :disabled="carregando">
            {{ carregando ? 'Agendando...' : 'Agendar Consulta' }}
          </button>
        </form>

        <!-- Resultado após agendamento -->
        <div v-if="resultado" class="resultado">
          <h3>✅ Consulta Agendada com Sucesso</h3>

          <p><strong>Data:</strong> {{ formatarData(resultado.data) }}</p>
          <p><strong>Horário:</strong> {{ resultado.horario }}</p>

          <p><strong>Endereço:</strong>
            {{ resultado.endereco.rua }},
            {{ resultado.endereco.bairro }} -
            {{ resultado.endereco.cidade }}/{{ resultado.endereco.estado }}
          </p>

          <div class="clima-info">
            <p>
              <strong>Clima:</strong> {{ resultado.clima?.previsao ?? 'Não disponível' }}
              <img
                v-if="resultado.clima?.icone"
                :src="`https://openweathermap.org/img/wn/${resultado.clima.icone}@2x.png`"
                :alt="resultado.clima.previsao"
                width="50"
                height="50"
                style="vertical-align: middle; margin-left: 10px;"
              />
            </p>
            <p v-if="resultado.clima?.alertaChuva" style="color: red;">⚠️ Atenção: previsão de chuva!</p>
          </div>

          <button @click="limparFormulario">🔁 Agendar outra consulta</button>
          <router-link to="/minhas-consultas">📅 Ver minhas consultas</router-link>
        </div>

        <p v-if="erro" class="erro">{{ erro }}</p>
      </div>
    </main>
  </div>
</template>






<script>
import axios from 'axios'
import NavBar from '../components/NavBar.vue'

export default {
  components: { NavBar },
  data() {
    return {
      pacienteId: '',
      data: '',
      horario: '',
      cep: '',
      endereco: {
        rua: '',
        bairro: '',
        cidade: '',
        estado: ''
      },
      erros: {},
      resultado: null,
      erro: '',
      carregando: false,
      horarios: [],
      ocupados: [],
      tooltipVisivel: null // controla qual horário mostra o tooltip
    }
  },
  mounted() {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (usuario?._id) {
      this.pacienteId = usuario._id
    }

    const hoje = new Date()
    const yyyy = hoje.getFullYear()
    const mm = String(hoje.getMonth() + 1).padStart(2, '0')
    const dd = String(hoje.getDate()).padStart(2, '0')
    this.data = `${yyyy}-${mm}-${dd}`
    this.carregarHorariosDisponiveis()
  },
  methods: {
    formatarCep() {
      this.cep = this.cep.replace(/\D/g, '').replace(/^(\d{5})(\d{0,3})/, '$1-$2')
    },
    async buscarEndereco() {
      if (!/^\d{5}-\d{3}$/.test(this.cep)) {
        this.erros.cep = 'CEP inválido'
        return
      }

      try {
        const res = await fetch(`https://viacep.com.br/ws/${this.cep}/json/`)
        const data = await res.json()

        if (data.erro) {
          this.erros.cep = 'CEP não encontrado'
          return
        }

        this.endereco = {
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        }
        this.erros.cep = ''
      } catch (err) {
        this.erros.cep = 'Erro ao consultar CEP'
      }
    },
    async carregarHorariosDisponiveis() {
      if (!this.data) {
        this.horarios = []
        this.ocupados = []
        return
      }

      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(
          `http://localhost:5000/api/appointments/horarios?data=${this.data}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        // Lista fixa de horários (mesma do backend)
        const todosHorarios = [
          '08:00', '08:30', '09:00', '09:30',
          '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30',
          '16:00', '16:30', '17:00', '17:30'
        ]
        this.horarios = todosHorarios
        this.ocupados = res.data.ocupados || []
      } catch (err) {
        console.error(err)
        this.erro = 'Erro ao carregar horários disponíveis'
      }
    },
    validarFormulario() {
      const erros = {}

      if (!this.data) {
        erros.data = 'Informe a data'
      } else {
        const hoje = new Date()
        const [ano, mes, dia] = this.data.split('-')
        const dataSelecionada = new Date(ano, mes - 1, dia)
        if (dataSelecionada < hoje) {
          erros.data = 'A data deve ser futura'
        }
      }

      if (!this.horario) erros.horario = 'Selecione um horário'
      if (!this.cep) erros.cep = 'Informe o CEP'
      else if (!/^\d{5}-\d{3}$/.test(this.cep)) erros.cep = 'CEP inválido'

      this.erros = erros
      return Object.keys(erros).length === 0
    },
    async agendarConsulta() {
      if (!this.validarFormulario()) return
      this.carregando = true
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(
          'http://localhost:5000/api/appointments',
          {
            data: this.data,
            horario: this.horario,
            cep: this.cep
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        this.resultado = res.data.consulta || res.data
        this.erro = ''
      } catch (err) {
        if (err.response?.status === 409) {
          this.erro = 'Este horário já está ocupado. Escolha outro.'
        } else {
          this.erro = err.response?.data?.erro || 'Erro ao agendar consulta'
        }
      } finally {
        this.carregando = false
      }
    },
    limparFormulario() {
      const hoje = new Date()
      const yyyy = hoje.getFullYear()
      const mm = String(hoje.getMonth() + 1).padStart(2, '0')
      const dd = String(hoje.getDate()).padStart(2, '0')
      this.data = `${yyyy}-${mm}-${dd}`

      this.horario = ''
      this.cep = ''
      this.endereco = {
        rua: '',
        bairro: '',
        cidade: '',
        estado: ''
      }
      this.resultado = null
      this.erros = {}
      this.horarios = []
      this.ocupados = []
      this.tooltipVisivel = null
      this.carregarHorariosDisponiveis()
    },
    formatarData(dataUtc) {
      const data = new Date(dataUtc)
      const dia = data.getUTCDate().toString().padStart(2, '0')
      const mes = (data.getUTCMonth() + 1).toString().padStart(2, '0')
      const ano = data.getUTCFullYear()
      return `${dia}/${mes}/${ano}`
    },
    mostrarTooltip(hora) {
      if (this.ocupados.includes(hora)) {
        this.tooltipVisivel = hora
        // No mobile, esconde automaticamente após 2 segundos
        setTimeout(() => {
          this.tooltipVisivel = null
        }, 2000)
      }
    },
    ocultarTooltip() {
      this.tooltipVisivel = null
    }
  }
}
</script>



<style scoped>
/* ===== Estilos existentes ===== */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f2f2f2;
}

.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.card-agendamento {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.6em;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 6px;
  color: #444;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
}

.grade-horarios {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.grade-horarios button {
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  color: #333;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.grade-horarios button:hover {
  background-color: #e0e0e0;
}

.grade-horarios button.ativo {
  background-color: #42b983;
  color: white;
  font-weight: bold;
}

.grade-horarios button.ocupado {
  background-color: #eee;
  color: #999;
  cursor: not-allowed;
  text-decoration: line-through;
}

button {
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.resultado {
  margin-top: 20px;
  background-color: #f6f6f6;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
}

.resultado h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.resultado p {
  margin: 6px 0;
  font-size: 0.95em;
}

.clima-info {
  margin-top: 10px;
}

.erro {
  color: red;
  font-size: 0.9em;
  margin-top: 4px;
  text-align: center;
}

.legenda-horarios {
  margin-top: 10px;
  font-size: 0.9em;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicador {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.indicador.indisponivel {
  background-color: #ddd;
  border: 1px solid #aaa;
}

.destaque-cep {
  border: 2px solid #ff9800;
  padding: 10px;
  border-radius: 6px;
  background-color: #fff8e1;
}

.aviso-cep {
  display: block;
  color: #e65100;
  font-weight: bold;
  margin-bottom: 6px;
}

/* ===== Tooltip ===== */
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  animation: fadeIn 0.2s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* ===== Melhorias de responsividade ===== */

/* Tablets e celulares */
@media (max-width: 768px) {
  .card-agendamento {
    padding: 20px;
  }
  h2 {
    font-size: 1.4em;
  }
  .grade-horarios {
    grid-template-columns: repeat(2, 1fr);
  }
  .grade-horarios button {
    padding: 8px;
    font-size: 0.9em;
  }
  button {
    font-size: 0.95em;
  }
  .legenda-horarios {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Celulares pequenos */
@media (max-width: 480px) {
  .content {
    padding: 20px 10px;
  }
  h2 {
    font-size: 1.2em;
  }
  input {
    font-size: 0.9em;
    padding: 8px;
  }
  .grade-horarios {
    grid-template-columns: 1fr;
  }
  .grade-horarios button {
    font-size: 0.85em;
    padding: 8px;
  }
  .aviso-cep {
    font-size: 0.85em;
  }
  .resultado img {
    display: block;
    margin: 10px auto 0;
  }
}
</style>
