<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const dosens = ref([])
const loading = ref(true)
const searchQuery = ref('')

const fetchDosen = async () => {
  loading.value = true
  try {
    const response = await api.get('/dosen')
    dosens.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch dosen', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDosen()
})

const filteredDosen = computed(() => {
  if (!searchQuery.value) return dosens.value
  const query = searchQuery.value.toLowerCase()
  return dosens.value.filter(d => 
    d.nama.toLowerCase().includes(query) || 
    d.bidang_keahlian.toLowerCase().includes(query) ||
    d.program_studi.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Daftar Dosen</h1>
        <p class="text-gray-500 dark:text-gray-400">Total: {{ filteredDosen.length }} dosen ditemukan</p>
      </div>
      
      <div class="relative max-w-sm w-full">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input v-model="searchQuery" type="text" class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Cari nama, prodi, atau keahlian...">
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="filteredDosen.length === 0" class="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Tidak ada dosen ditemukan</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Coba kata kunci pencarian yang lain.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="dosen in filteredDosen" :key="dosen.id" @click="router.push(`/dosen/${dosen.id}`)" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
        <div class="p-5 flex-grow">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg flex-shrink-0">
              {{ dosen.nama.charAt(0) }}
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2" :title="dosen.nama">{{ dosen.nama }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ dosen.nidn }}</p>
            </div>
          </div>
          
          <div class="space-y-2 text-sm">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              <span class="text-gray-600 dark:text-gray-300">{{ dosen.program_studi }}</span>
            </div>
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              <span class="text-gray-600 dark:text-gray-300 line-clamp-2" :title="dosen.bidang_keahlian">{{ dosen.bidang_keahlian }}</span>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 text-center">
          <span class="text-sm font-medium text-blue-600 dark:text-blue-400">Lihat Profil</span>
        </div>
      </div>
    </div>
  </div>
</template>

