import { createRouter, createWebHistory } from 'vue-router'

// Importação das views
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CadastroView from '../views/CadastroView.vue'
import AgendamentoView from '../views/AgendamentoView.vue'
import PainelView from '../views/PainelView.vue'
import MinhasConsultasView from '../views/MinhasConsultasView.vue'

// Definição das rotas
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/cadastro',
    name: 'Cadastro',
    component: CadastroView
  },
  {
    path: '/agendar',
    name: 'Agendar',
    component: AgendamentoView,
    meta: { requiresAuth: true }
  },
  {
    path: '/minhas-consultas',
    name: 'MinhasConsultas',
    component: MinhasConsultasView,
    meta: { requiresAuth: true }
  },
  {
    path: '/painel',
    name: 'Painel',
    component: PainelView,
    meta: { requiresAuth: true, role: 'secretario' } // apenas secretários
  }
]

// Criação do router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Proteção de rotas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  // Bloqueia se a rota exigir login e não houver token
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  // Bloqueia se a rota exigir um perfil específico e o usuário não tiver
  if (to.meta.role && usuario?.tipo !== to.meta.role) {
    return next('/')
  }

  next()
})

export default router
