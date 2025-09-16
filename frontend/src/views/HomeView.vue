<template>
  <div class="layout">
    <main class="content">
      <div class="card-home">
        <h2>🏥 Bem-vindo à Clínica</h2>

        <!-- Botões para pacientes -->
        <div v-if="usuario?.tipo === 'paciente'">
          <router-link to="/agendar">
            <button class="btn-destaque">🗓️ Agendar Consulta</button>
          </router-link>

          <router-link to="/minhas-consultas">
            <button class="btn-secundario">📅 Minhas Consultas</button>
          </router-link>
        </div>

        <!-- Botão exclusivo para secretários -->
        <div v-else-if="usuario?.tipo === 'secretario'">
          <router-link to="/painel">
            <button class="btn-discreto">🔐 Painel Administrativo</button>
          </router-link>
        </div>

        <!-- Botão comum para todos -->
        <router-link to="/login" @click.native="trocarUsuario">
          <button class="btn-trocar">🔄 Trocar Usuário</button>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      usuario: null
    }
  },
  mounted() {
    const token = localStorage.getItem('token')
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (!token || !usuario) {
      this.$router.push('/login')
    } else {
      this.usuario = usuario
    }
  },
  methods: {
    trocarUsuario() {
      localStorage.clear()
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

.card-home {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h2 {
  margin-bottom: 20px;
  font-size: 1.6em;
  color: #333;
}

button {
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
}

.btn-destaque {
  background-color: #42b983;
  color: white;
  font-weight: bold;
}

.btn-secundario {
  background-color: #3498db;
  color: white;
}

.btn-discreto {
  background-color: #ccc;
  color: #333;
}

.btn-trocar {
  background-color: #e67e22;
  color: white;
}

/* ===== Melhorias de responsividade ===== */
@media (max-width: 768px) {
  .card-home {
    padding: 20px;
  }
  h2 {
    font-size: 1.4em;
  }
  button {
    font-size: 0.95em;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 20px 10px;
  }
  .card-home {
    padding: 15px;
  }
  h2 {
    font-size: 1.2em;
  }
  button {
    font-size: 0.9em;
    padding: 8px;
  }
}
</style>
