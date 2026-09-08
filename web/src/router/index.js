import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PreprocessingView from '../views/PreprocessingView.vue'
import ApiDocsView from '../views/ApiDocsView.vue'
import QuickstartView from '../views/QuickstartView.vue'
import ClientRegisterView from '../views/ClientRegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
      meta: { layout: 'none' }
    },
    {
      path: '/preprocessing',
      name: 'Pipeline',
      component: PreprocessingView
    },
    {
      path: '/docs',
      name: 'ApiDocs',
      component: ApiDocsView
    },
    {
      path: '/quickstart',
      name: 'Quickstart',
      component: QuickstartView
    },
    {
      path: '/register',
      name: 'ClientRegister',
      component: ClientRegisterView
    },
    // Redirects for old routes
    { path: '/install', redirect: '/quickstart' },
    { path: '/single', redirect: '/' },
    { path: '/clients', redirect: '/register' },
    { path: '/client/register', redirect: '/register' }
  ]
})

export default router

