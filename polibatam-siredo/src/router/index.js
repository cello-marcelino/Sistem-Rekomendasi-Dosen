import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DosenListView from '../views/DosenListView.vue'
import DosenProfileView from '../views/DosenProfileView.vue'
import DosenFormView from '../views/DosenFormView.vue'
import RecommendationView from '../views/RecommendationView.vue'
import BatchRecommendationView from '../views/BatchRecommendationView.vue'
import SchedulingView from '../views/SchedulingView.vue'
import AdminDosenListView from '../views/AdminDosenListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/dosen', name: 'DosenList', component: DosenListView },
    { path: '/dosen/:id', name: 'DosenProfile', component: DosenProfileView },
    { path: '/rekomendasi', name: 'Recommendation', component: RecommendationView },
    { path: '/admin/batch', name: 'BatchRec', component: BatchRecommendationView },
    { path: '/admin/penjadwalan', name: 'Scheduling', component: SchedulingView },
    { path: '/admin/dosen', name: 'AdminDosenList', component: AdminDosenListView },
    { path: '/admin/dosen/create', name: 'DosenCreate', component: DosenFormView },
    { path: '/admin/dosen/:id', redirect: '/admin/dosen' },
    { path: '/admin/dosen/:id/edit', name: 'DosenEdit', component: DosenFormView },
    { path: '/statistik', redirect: '/dosen' },
  ]
})

export default router

