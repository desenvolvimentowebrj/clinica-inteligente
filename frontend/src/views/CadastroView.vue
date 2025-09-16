<template>
  <div class="layout">
    <NavBar />
    <main class="content">
      <div class="card-cadastro">
        <h2>📝 Cadastro</h2>

        <form @submit.prevent="cadastrar">
          <div class="form-group">
            <label>Nome:</label>
            <input v-model="nome" type="text" placeholder="Seu nome completo" />
          </div>

          <div class="form-group">
            <label>Email:</label>
            <input v-model="email" type="email" placeholder="Seu email" />
          </div>

          <div class="form-group">
            <label>Senha:</label>
            <input v-model="senha" type="password" placeholder="Crie uma senha" />
          </div>

          <div class="form-group">
            <label>Tipo de usuário:</label>
            <select v-model="tipo">
              <option disabled value="">Selecione</option>
              <option value="paciente">Paciente</option>
              <option value="secretario">Secretário</option>
            </select>
          </div>

          <button type="submit">Cadastrar</button>
        </form>

        <p v-if="erro" class="erro">{{ erro }}</p>
      </div>
    </main>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import axios from 'axios'

export default {
  components: { NavBar },
  data() {
    return {
      nome: '',
      email: '',
      senha: '',
      tipo: '',
      erro: ''
    }
  },
  methods: {
    async cadastrar() {
      try {
        await axios.post('http://localhost:5000/api/users/register', {
          nome: this.nome,
          email: this.email,
          senha: this.senha,
          tipo: this.tipo
        })
        this.$router.push('/login')
      } catch (err) {
        this.erro = 'Erro ao cadastrar usuário'
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

.card-cadastro {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
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

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
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

.erro {
  color: red;
  margin-top: 10px;
  text-align: center;
}

/* ===== Melhorias de responsividade ===== */

/* Tablets */
@media (max-width: 768px) {
  .card-cadastro {
    padding: 20px;
  }
  h2 {
    font-size: 1.4em;
  }
  input, select, button {
    font-size: 0.95em;
    padding: 10px;
  }
}

/* Celulares */
@media (max-width: 480px) {
  .content {
    padding: 20px 10px;
  }
  .card-cadastro {
    padding: 15px;
  }
  h2 {
    font-size: 1.2em;
  }
  label {
    font-size: 0.9em;
  }
  input, select, button {
    font-size: 0.9em;
    padding: 8px;
  }
}
</style>
