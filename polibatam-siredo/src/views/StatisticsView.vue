<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const stats = ref({
  totalDosen: 0,
  prodiDist: {}
})
const loading = ref(true)

const fetchStats = async () => {
  try {
    const res = await api.get('/dosen')
    const dosenList = res.data.data
    
    stats.value.totalDosen = dosenList.length
    
    const dist = {}
    dosenList.forEach(d => {
      const p = d.program_studi
      dist[p] = (dist[p] || 0) + 1
    })
    stats.value.prodiDist = dist
  } catch (error) {
    console.error('Failed to fetch stats', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Statistik Dosen Polibatam</h1>
    
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Dosen Terdaftar</h3>
        <p class="text-4xl font-bold text-blue-600 dark:text-blue-400">{{ stats.totalDosen }}</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm md:col-span-2">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribusi per Program Studi</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(count, prodi) in stats.prodiDist" :key="prodi" class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <span class="text-sm text-gray-700 dark:text-gray-300 font-medium truncate pr-2" :title="prodi">{{ prodi }}</span>
            <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
