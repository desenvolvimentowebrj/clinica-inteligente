<template>
  <header class="navbar container" role="navigation" aria-label="Barra de navegação">
    <router-link to="/" class="logo">🏥 Clínica Médica</router-link>

    <button class="menu-toggle" @click="toggleMenu" :aria-expanded="menuOpen" aria-controls="mobile-menu" aria-label="Abrir menu">
      <span v-if="!menuOpen">☰</span>
      <span v-else>✕</span>
    </button>

    <nav class="links" v-if="menuOpen || desktop">
  <router-link v-if="usuario && mostrarVoltar" :to="voltarPara">← Voltar</router-link>

  <!-- Botões visíveis apenas para pacientes -->
  <router-link v-if="usuario?.tipo !== 'secretario'" to="/agendar">Agendar</router-link>
  <router-link v-if="usuario?.tipo !== 'secretario'" to="/minhas-consultas">Minhas Consultas</router-link>
</nav>


    <div class="usuario-info" v-if="usuario">
      <span aria-hidden="true">👤</span>
      <span class="sr-only">Usuário:</span>
      <span>{{ usuario.nome }}</span>
      <button class="btn" @click="logout">Sair</button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    mostrarVoltar: { type: Boolean, default: false },
    voltarPara: { type: String, default: '/' }
  },
  data() {
    return {
      menuOpen: false,
      desktop: false,
      usuario: JSON.parse(localStorage.getItem('usuario') || 'null')
    }
  },
  mounted() {
    // Simple resize watcher to detect desktop vs mobile (keeps component small & dependency-free)
    this.checkDesktop()
    window.addEventListener('resize', this.checkDesktop)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkDesktop)
  },
  methods: {
    checkDesktop() {
      this.desktop = window.innerWidth >= 768
      if (this.desktop) this.menuOpen = false
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen
    },
    logout() {
      localStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* Scoped styles for NavBar with responsive behavior */
.navbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding-top:8px;
  padding-bottom:8px;
}
.logo{ font-weight:700; text-decoration:none; color:var(--color-text); }
.links a{ margin-right:12px; text-decoration:none; color:var(--color-muted); font-weight:600; }
.usuario-info{ display:flex; gap:8px; align-items:center; color:var(--color-text); }

/* screen-reader only helper */
.sr-only{ position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden; }

/* mobile toggle */
.menu-toggle{
  background:transparent;
  border:1px solid transparent;
  padding:6px 8px;
  font-size:1.2rem;
  border-radius:8px;
}
.menu-toggle:focus{ outline: 2px solid rgba(44,110,242,0.2); }

/* Hide links on small screens, show via mobile menu toggle */
@media (max-width: 767px){
  .links{ display:block; position:absolute; left:0; right:0; top:60px; background:var(--color-surface); padding:12px; box-shadow:0 8px 24px rgba(16,24,40,0.08); border-radius:8px; }
}
@media (min-width: 768px){
  .links{ display:flex; position:static; box-shadow:none; padding:0; background:transparent; }
  .menu-toggle{ display:none; }
}
</style>
