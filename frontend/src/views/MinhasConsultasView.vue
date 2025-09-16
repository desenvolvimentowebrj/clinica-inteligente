<template>
  <div class="layout">
    <NavBar />
    <main class="content">
      <div class="card-consultas">
        <h2>📅 Minhas Consultas</h2>

        <div v-if="consultas.length === 0">
          <p>Você ainda não tem consultas agendadas.</p>
        </div>

        <div v-else>
          <ul>
            <li v-for="consulta in consultas" :key="consulta._id">
              <strong>{{ formatarDataUTC(consulta.data) }} às {{ consulta.horario }}</strong><br />
              {{ consulta.endereco.rua }}, {{ consulta.endereco.bairro }} - {{ consulta.endereco.cidade }}/{{ consulta.endereco.estado }}<br />

              <div class="clima">
                <span><strong>Clima:</strong> {{ consulta.clima?.previsao ?? 'Não disponível' }}</span>
                <img
                  v-if="consulta.clima?.icone"
                  :src="`https://openweathermap.org/img/wn/${consulta.clima.icone}@2x.png`"
                  :alt="consulta.clima.previsao"
                  width="40"
                  height="40"
                  style="vertical-align: middle; margin-left: 8px;" />
                <span v-if="consulta.clima?.alertaChuva" style="color: red;">⚠️ Chuva</span>
              </div>
            </li>
          </ul>
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
      consultas: [],
      erro: ''
    }
  },
  async mounted() {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5000/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      this.consultas = res.data
    } catch (err) {
      this.erro = 'Erro ao carregar suas consultas'
      console.error('Erro ao buscar consultas:', err.message)
    }
  },
  methods: {
    formatarDataUTC(data) {
      const d = new Date(data)
      const dia = String(d.getUTCDate()).padStart(2, '0')
      const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
      const ano = d.getUTCFullYear()
      return `${dia}/${mes}/${ano}`
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

.card-consultas {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 600px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.6em;
  color: #333;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 16px;
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 6px;
}

.erro {
  color: red;
  text-align: center;
  margin-top: 10px;
}

/* ===== Melhorias de responsividade ===== */

/* Tablets */
@media (max-width: 768px) {
  .card-consultas {
    padding: 20px;
  }
  h2 {
    font-size: 1.4em;
  }
  li {
    padding: 10px;
    font-size: 0.95em;
  }
}

/* Celulares */
@media (max-width: 480px) {
  .content {
    padding: 20px 10px;
  }
  .card-consultas {
    padding: 15px;
  }
  h2 {
    font-size: 1.2em;
  }
  li {
    font-size: 0.9em;
    padding: 8px;
  }
  .clima {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .clima img {
    margin-left: 0 !important;
  }
}
</style>
