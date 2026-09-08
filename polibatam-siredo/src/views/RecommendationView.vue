<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({
  judul: '',
  abstrak: ''
})
const loading = ref(false)
const result = ref(null)
const error = ref(null)

const submitForm = async () => {
  if (!form.value.judul || !form.value.abstrak) return
  
  loading.value = true
  error.value = null
  result.value = null
  
  try {
    const response = await api.post('/rekomendasi/single', {
      top_k: 5,
      judul_tugas_akhir: form.value.judul,
      abstrak: form.value.abstrak
    })
    result.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Gagal mendapatkan rekomendasi. Pastikan API key valid.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <div class="text-center max-w-2xl mx-auto mb-10">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cari Dosen Pembimbing</h1>
      <p class="text-gray-600 dark:text-gray-400">Masukkan judul dan abstrak rencana Tugas Akhir Anda, sistem AI akan merekomendasikan dosen yang paling relevan dengan topik tersebut.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Input Form -->
      <div class="lg:col-span-5">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
          <form @submit.prevent="submitForm" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Judul Tugas Akhir / Penelitian</label>
              <textarea v-model="form.judul" rows="2" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Contoh: Penerapan NLP untuk Analisis Sentimen..."></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Abstrak / Deskripsi Topik</label>
              <textarea v-model="form.abstrak" rows="6" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Jelaskan secara singkat latar belakang, metode, dan tujuan penelitian Anda..."></textarea>
              <p class="mt-2 text-xs text-gray-500">Minimal 15-20 kata agar hasil lebih akurat.</p>
            </div>

            <button type="submit" :disabled="loading" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              <svg v-if="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Menganalisis...' : 'Dapatkan Rekomendasi' }}
            </button>
            
            <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800">
              {{ error }}
            </div>
          </form>
        </div>
      </div>

      <!-- Results -->
      <div class="lg:col-span-7">
        <div v-if="loading" class="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 border-dashed">
          <div class="relative w-20 h-20 mb-6">
            <div class="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
            <div class="absolute inset-2 rounded-full border-r-2 border-amber-500 animate-spin animate-reverse"></div>
            <div class="absolute inset-4 rounded-full border-b-2 border-purple-500 animate-spin"></div>
          </div>
          <p class="text-gray-500 font-medium">Model AI sedang menghitung skor BM25 & SBERT...</p>
        </div>
        
        <div v-else-if="result" class="space-y-6 animate-fade-in">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Hasil Rekomendasi (Top {{ result.recommendations.length }})</h2>
            <div class="text-sm px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full font-medium">
              Waktu: {{ result.processing_time_ms.toFixed(0) }}ms
            </div>
          </div>
          
          <div v-for="(rec, index) in result.recommendations" :key="rec.dosen_id" class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
            
            <!-- Rank Badge -->
            <div class="absolute top-0 right-0 w-16 h-16">
              <div class="absolute transform rotate-45 bg-blue-600 text-white text-xs font-bold py-1 right-[-35px] top-[12px] w-[120px] text-center shadow-sm">
                Rank #{{ index + 1 }}
              </div>
            </div>
            
            <div class="flex items-start gap-4 mb-4 pr-10">
              <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg flex-shrink-0 cursor-pointer" @click="router.push(`/dosen/${rec.dosen_id}`)">
                {{ rec.nama_dosen.charAt(0) }}
              </div>
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-blue-600 transition-colors" @click="router.push(`/dosen/${rec.dosen_id}`)">{{ rec.nama_dosen }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ rec.program_studi }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-800">
                <div class="text-xs text-gray-500 mb-1">Hybrid Score</div>
                <div class="font-mono font-bold text-blue-600 dark:text-blue-400">{{ rec.hybrid_score.toFixed(4) }}</div>
              </div>
              <div class="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-800">
                <div class="text-xs text-gray-500 mb-1">BM25 (Lexical)</div>
                <div class="font-mono font-semibold text-gray-700 dark:text-gray-300">{{ rec.bm25_score.toFixed(4) }}</div>
              </div>
              <div class="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg text-center border border-gray-100 dark:border-gray-800">
                <div class="text-xs text-gray-500 mb-1">SBERT (Semantic)</div>
                <div class="font-mono font-semibold text-gray-700 dark:text-gray-300">{{ rec.semantic_score.toFixed(4) }}</div>
              </div>
            </div>
            
            <div class="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
              <div class="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Faktor Penentu (XAI)
              </div>
              <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc marker:text-blue-300">
                <li v-for="(reason, i) in rec.explainability" :key="i">{{ reason }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div v-else class="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed text-center p-8">
          <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada hasil</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm">Isi form di sebelah kiri dan klik "Dapatkan Rekomendasi" untuk melihat daftar dosen yang cocok.</p>
        </div>
      </div>
    </div>
  </div>
</template>
