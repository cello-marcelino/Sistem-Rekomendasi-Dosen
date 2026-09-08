<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const dosen = ref(null)
const loading = ref(true)

const fetchDosenDetail = async () => {
  loading.value = true
  try {
    const response = await api.get(`/dosen/${route.params.id}`)
    dosen.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch dosen detail', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDosenDetail()
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <button @click="router.back()" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Kembali
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="!dosen" class="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Dosen tidak ditemukan</h3>
    </div>

    <div v-else class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-4xl sm:text-5xl flex-shrink-0">
          {{ dosen.nama.charAt(0) }}
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{{ dosen.nama }}</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1 font-mono">NIDN: {{ dosen.nidn }}</p>
          <div class="flex flex-wrap gap-2 mt-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {{ dosen.program_studi }}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              {{ dosen.pendidikan }}
            </span>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              Bidang Keahlian
            </h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ dosen.bidang_keahlian }}</p>
          </div>
        </div>

        <div class="md:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Riwayat Bimbingan
            </h3>
            <ul v-if="dosen.riwayat_bimbingan && dosen.riwayat_bimbingan.length > 0" class="space-y-3">
              <li v-for="(judul, idx) in dosen.riwayat_bimbingan" :key="idx" class="flex gap-3">
                <span class="text-blue-500 mt-1 flex-shrink-0">•</span>
                <span class="text-gray-600 dark:text-gray-300">{{ judul }}</span>
              </li>
            </ul>
            <p v-else class="text-gray-500 dark:text-gray-400 italic">Belum ada riwayat bimbingan.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              Publikasi / Penelitian
            </h3>
            <ul v-if="dosen.publikasi && dosen.publikasi.length > 0" class="space-y-3">
              <li v-for="(judul, idx) in dosen.publikasi" :key="idx" class="flex gap-3">
                <span class="text-green-500 mt-1 flex-shrink-0">•</span>
                <span class="text-gray-600 dark:text-gray-300">{{ judul }}</span>
              </li>
            </ul>
            <p v-else class="text-gray-500 dark:text-gray-400 italic">Belum ada publikasi terdaftar.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

