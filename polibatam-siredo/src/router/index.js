import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DosenListView from '../views/DosenListView.vue'
import DosenDetailView from '../views/DosenDetailView.vue'
import RecommendationView from '../views/RecommendationView.vue'
import BatchRecommendationView from '../views/BatchRecommendationView.vue'
import SchedulingView from '../views/SchedulingView.vue'
import StatisticsView from '../views/StatisticsView.vue'
import AdminDosenListView from '../views/AdminDosenListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/dosen', name: 'DosenList', component: DosenListView },
    { path: '/dosen/:id', name: 'DosenDetail', component: DosenDetailView },
    { path: '/rekomendasi', name: 'Recommendation', component: RecommendationView },
    { path: '/admin/batch', name: 'BatchRec', component: BatchRecommendationView },
    { path: '/admin/penjadwalan', name: 'Scheduling', component: SchedulingView },
    { path: '/admin/dosen', name: 'AdminDosenList', component: AdminDosenListView },
    { path: '/statistik', name: 'Statistics', component: StatisticsView },
  ]
})

export default router

