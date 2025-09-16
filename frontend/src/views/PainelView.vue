<template>
  <div class="layout">
    <NavBar />
    <main class="content">
      <div class="card-painel">
        <h2>📋 Painel de Agendamentos</h2>

        <div v-if="usuario?.tipo !== 'secretario'">
          <p class="erro">Acesso restrito. Esta área é exclusiva para secretários.</p>
        </div>

        <div v-else>
          <!-- Campo de busca -->
          <div class="busca-container">
            <input
              v-model="termoBusca"
              type="text"
              placeholder="Buscar por paciente, data ou horário..."
            />
          </div>

          <div v-if="agendamentosFiltrados.length === 0">
            <p>Nenhum agendamento encontrado.</p>
          </div>

          <div v-else>
            <!-- Contêiner para rolagem horizontal -->
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Endereço</th>
                    <th>Clima</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="consulta in paginados" :key="consulta._id">
                    <td>{{ consulta.paciente?.nome ?? 'ID: ' + consulta.paciente }}</td>
                    <td>{{ consulta.dataFormatada }}</td>
                    <td>{{ consulta.horario }}</td>
                    <td>
                      {{ consulta.endereco.rua }}, {{ consulta.endereco.bairro }} -
                      {{ consulta.endereco.cidade }}/{{ consulta.endereco.estado }}
                    </td>
                    <td>
                      {{ consulta.clima?.previsao ?? 'Não disponível' }}
                      <span v-if="consulta.clima?.alertaChuva" style="color: red;">⚠️ Chuva</span>
                    </td>
                    <td>
                      <button class="btn-cancelar" @click="cancelarConsulta(consulta._id)">
                        ❌ Cancelar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginação -->
            <div class="paginacao">
              <button @click="paginaAtual--" :disabled="paginaAtual === 1">Anterior</button>
              <span>Página {{ paginaAtual }} de {{ totalPaginas }}</span>
              <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas">Próxima</button>
            </div>
          </div>
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
      usuario: null,
      agendamentos: [],
      erro: '',
      termoBusca: '',
      paginaAtual: 1,
      itensPorPagina: 5
    }
  },
  computed: {
    agendamentosFiltrados() {
      const termo = this.termoBusca.toLowerCase()
      return this.agendamentos.filter(c =>
        (c.paciente?.nome || '').toLowerCase().includes(termo) ||
        (c.dataFormatada || '').toLowerCase().includes(termo) ||
        (c.horario || '').toLowerCase().includes(termo)
      )
    },
    totalPaginas() {
      return Math.ceil(this.agendamentosFiltrados.length / this.itensPorPagina) || 1
    },
    paginados() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.agendamentosFiltrados.slice(inicio, inicio + this.itensPorPagina)
    }
  },
  watch: {
    termoBusca() {
      this.paginaAtual = 1
    }
  },
  async mounted() {
    const token = localStorage.getItem('token')
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    this.usuario = usuario

    if (usuario?.tipo !== 'secretario') {
      this.$router.push('/')
      return
    }

    await this.carregarAgendamentos()
  },
  methods: {
    async carregarAgendamentos() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('http://localhost:5000/api/appointments/admin', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.agendamentos = res.data
      } catch (err) {
        this.erro = err.response?.data?.erro || 'Erro ao carregar agendamentos'
      }
    },
    async cancelarConsulta(id) {
      if (!confirm('Tem certeza que deseja cancelar esta consulta?')) return

      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.agendamentos = this.agendamentos.filter(c => c._id !== id)
      } catch (err) {
        alert(err.response?.data?.erro || 'Erro ao cancelar consulta')
      }
    }
  }
}
</script>

<style scoped>
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

.card-painel {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 900px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.6em;
  color: #333;
}

.busca-container {
  margin-bottom: 15px;
}

.busca-container input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.table-container {
  overflow-x: auto;
}

.table-container table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  min-width: 600px;
}

th, td {
  padding: 12px;
  border-bottom: 1px solid #ccc;
  text-align: left;
  font-size: 0.95em;
}

th {
  background-color: #f0f0f0;
  font-weight: bold;
}

.paginacao {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.paginacao button {
  padding: 6px 12px;
  border: none;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.paginacao button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.btn-cancelar {
  background-color: #e53935;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancelar:hover {
  background-color: #c62828;
}

.erro {
  color: red;
  margin-top: 10px;
  text-align: center;
}

/* Tablets */
@media (max-width: 768px) {
  .card-painel {
    padding: 20px;
  }
  h2 {
    font-size: 1.4em;
  }
  th, td {
    padding: 8px;
    font-size: 0.9em;
  }
  .paginacao {
    flex-direction: column;
    gap: 10px;
  }
  .paginacao button {
    width: 100%;
  }
}

/* Celulares */
@media (max-width: 480px) {
  .content {
    padding: 20px 10px;
  }
  h2 {
    font-size: 1.2em;
  }
  .busca-container input {
    font-size: 0.9em;
    padding: 8px;
  }
  .btn-cancelar {
    padding: 4px 6px;
    font-size: 0.8em;
  }
  .table-container table {
    min-width: 400px;
  }
}
</style>
