import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuickstartView from '../views/QuickstartView.vue'
import ApiDocsView from '../views/ApiDocsView.vue'
import PreprocessingView from '../views/PreprocessingView.vue'
import CachingIndexingView from '../views/CachingIndexingView.vue'
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
    // Documentation Routes (Sesuai Urutan Dropdown Navigasi)
    {
      path: '/docs',
      redirect: '/docs/quickstart'
    },
    {
      path: '/docs/quickstart',
      name: 'Quickstart',
      component: QuickstartView
    },
    {
      path: '/docs/api',
      name: 'ApiDocs',
      component: ApiDocsView
    },
    {
      path: '/docs/pipeline',
      name: 'Pipeline',
      component: PreprocessingView
    },
    {
      path: '/docs/caching',
      name: 'CachingIndexing',
      component: CachingIndexingView
    },
    {
      path: '/docs/api-key',
      name: 'ClientRegister',
      component: ClientRegisterView
    },

    // Backward Compatibility & Alias Redirects
    { path: '/quickstart', redirect: '/docs/quickstart' },
    { path: '/preprocessing', redirect: '/docs/pipeline' },
    { path: '/register', redirect: '/docs/api-key' },
    { path: '/clients', redirect: '/docs/api-key' },
    { path: '/client/register', redirect: '/docs/api-key' },
    { path: '/install', redirect: '/docs/quickstart' },
    { path: '/single', redirect: '/' }
  ]
})

export default router
