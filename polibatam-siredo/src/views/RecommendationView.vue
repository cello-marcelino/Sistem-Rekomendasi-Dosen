<script setup>
import { ref, computed } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import XaiModal from '../components/recommendation/XaiModal.vue'

const router = useRouter()
const form = ref({
  judul: '',
  abstrak: ''
})
const loading = ref(false)
const result = ref(null)
const error = ref(null)

const activeStepTab = ref(0)

const steps = ref([
  { title: 'Preprocessing Teks', shortTitle: 'Pembersihan Teks', subLabel: 'Ekstraksi kata kunci', status: 'idle' },
  { title: 'Ekspansi Ontologi Sinonim', shortTitle: 'Kamus Sinonim', subLabel: 'Pengayaan istilah', status: 'idle' },
  { title: 'BM25 Lexical Filter', shortTitle: 'Filter Kata Kunci', subLabel: 'Penyaringan leksikal', status: 'idle' },
  { title: 'SBERT Semantic Scoring', shortTitle: 'Pemahaman Makna', subLabel: 'Deep learning semantik', status: 'idle' },
  { title: 'Hybrid Ranking & Penalti', shortTitle: 'Skor Kombinasi', subLabel: 'Perangkingan akhir', status: 'idle' }
])

const presetExamples = [
  {
    title: 'Chatbot Akademik berbasis NLP BERT',
    abstract: 'Pengembangan asisten virtual mahasiswa dengan pemrosesan bahasa alami (NLP), ekstraksi intent, dan transformer BERT untuk menjawab pertanyaan akademik.'
  },
  {
    title: 'Deteksi Penyakit Daun Tanaman via Computer Vision',
    abstract: 'Klasifikasi citra daun tanaman menggunakan Convolutional Neural Network (CNN) dan YOLO untuk identifikasi penyakit secara otomatis pada sektor pertanian.'
  },
  {
    title: 'Sistem Pendukung Keputusan Pemilihan Supplier',
    abstract: 'Penerapan metode AHP dan TOPSIS untuk perangkingan dan seleksi pemasok bahan baku terbaik berdasarkan kriteria biaya, kualitas, dan waktu pengiriman.'
  }
]

const loadPreset = (preset) => {
  form.value.judul = preset.title
  form.value.abstrak = preset.abstract
}

const submitForm = async () => {
  if (!form.value.judul || !form.value.abstrak) return
  
  loading.value = true
  error.value = null
  result.value = null
  steps.value.forEach(s => { s.status = 'idle' })
  
  let currentStep = 0
  activeStepTab.value = 0
  steps.value[currentStep].status = 'running'

  const interval = setInterval(() => {
    if (currentStep < steps.value.length - 1) {
      steps.value[currentStep].status = 'done'
      currentStep++
      activeStepTab.value = currentStep
      steps.value[currentStep].status = 'running'
    } else {
      steps.value[currentStep].status = 'done'
      clearInterval(interval)
    }
  }, 400)
  
  try {
    const response = await api.post('/rekomendasi/single', {
      top_k: 5,
      judul_tugas_akhir: form.value.judul,
      abstrak: form.value.abstrak
    })
    result.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || 'Gagal mendapatkan rekomendasi. Pastikan API key valid.'
  } finally {
    loading.value = false
    clearInterval(interval)
    steps.value.forEach(s => { s.status = 'done' })
    if (result.value) {
      activeStepTab.value = 4
    }
  }
}

// XAI Modal Logic
const isXaiModalOpen = ref(false)
const selectedXai = ref(null)

const openXai = (rec) => {
  selectedXai.value = rec
  isXaiModalOpen.value = true
}

const closeXai = () => {
  isXaiModalOpen.value = false
  selectedXai.value = null
}
</script>

<template>
  <div class="space-y-6 pb-12 animate-in">
    <!-- Header Section (Canvas-First) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-sans">Rekomendasi Dosen</h1>
        <p class="text-sm text-gray-600 mt-1">
          Analisis kecocokan topik tugas akhir mahasiswa dengan kepakaran dosen berbasis model NLP (BM25 & SBERT).
        </p>
      </div>
    </div>

    <!-- Elevated Content Card (Input + Results) -->
    <div class="bg-white border border-gray-200 rounded shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 w-full items-start box-border">
      
      <!-- Left: Input Panel (4 Cols) -->
      <aside class="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50 p-6 lg:p-8 relative">
        <div :class="{ 'opacity-50 pointer-events-none': loading }" class="transition-opacity">
          
          <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-6">Data Penelitian</div>

          <form @submit.prevent="submitForm" class="space-y-6">
            <div>
              <label class="block text-[11px] font-mono font-bold text-gray-700 uppercase tracking-widest mb-2">Judul Penelitian</label>
              <input
                v-model="form.judul"
                required
                class="w-full bg-white border border-gray-300 rounded-[4px] px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                placeholder="Contoh: Sistem Rekomendasi..."
                :disabled="loading"
              />
            </div>

            <div>
              <label class="block text-[11px] font-mono font-bold text-gray-700 uppercase tracking-widest mb-2">Abstrak / Rencana</label>
              <textarea
                v-model="form.abstrak"
                required
                rows="8"
                class="w-full bg-white border border-gray-300 rounded-[4px] px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors resize-y leading-relaxed"
                placeholder="Latar belakang, metode, dan tujuan penelitian..."
                :disabled="loading"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-[4px] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Memproses NLP...' : 'Mulai Analisis' }}
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-gray-200">
            <div class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-3">Load Preset Example</div>
            <div class="flex flex-col gap-2">
              <button
                v-for="(preset, idx) in presetExamples"
                :key="idx"
                @click="loadPreset(preset)"
                :disabled="loading"
                class="text-left px-3 py-2.5 bg-white border border-gray-200 hover:border-gray-400 rounded-[4px] text-xs text-gray-600 transition-colors truncate"
              >
                {{ preset.title }}
              </button>
            </div>
          </div>
          
          <div v-if="error" class="mt-6 p-4 bg-red-50 text-red-700 rounded-[4px] text-sm border border-red-200 font-medium">
            {{ error }}
          </div>
        </div>
      </aside>

      <!-- Right: Results Panel (8 Cols) -->
      <main class="lg:col-span-8 p-6 lg:p-8">
        
        <!-- Empty State -->
        <div v-if="!loading && !result" class="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-gray-300 rounded-md bg-gray-50 text-center p-12">
          <div class="text-sm font-bold text-gray-900 mb-1 uppercase tracking-widest">Panel Analisis AI</div>
          <p class="text-sm text-gray-500 max-w-sm">Isi data penelitian di panel kiri untuk memulai proses NLP.</p>
        </div>

        <div v-else-if="loading || result" class="flex flex-col gap-8">
          
          <!-- Pipeline Log: Strict Tabular Style -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-900 uppercase tracking-widest">Log Pipeline NLP</h3>
              <span v-if="loading" class="text-[11px] font-mono font-bold text-teal-600 uppercase tracking-widest flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                Memproses Tahap 0{{ activeStepTab + 1 }}
              </span>
              <span v-else-if="result" class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                Selesai
              </span>
            </div>

            <!-- Steps Progress Line -->
            <div class="flex gap-1 mb-6">
              <div v-for="(st, idx) in steps" :key="idx" class="flex-1 h-1.5 rounded-full"
                   :class="activeStepTab > idx || st.status === 'done' ? 'bg-teal-500' : (st.status === 'running' ? 'bg-teal-400 animate-pulse' : 'bg-gray-200')">
              </div>
            </div>

            <!-- Active Stage Inspector Panel -->
            <div class="border border-gray-200 rounded-md p-5 bg-white">
              
              <!-- Tab 0: Preprocessing Teks -->
              <div v-if="activeStepTab === 0" class="flex flex-col gap-4">
                <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400">Tahap 01: Pembersihan Teks</div>
                <div class="text-sm text-gray-600 leading-relaxed">Ekstraksi kata kunci, penghapusan stopword, dan pembentukan n-grams.</div>
                
                <div v-if="result?.pipeline?.preprocessing" class="border border-gray-200 rounded-sm divide-y divide-gray-200">
                  <div class="p-3 bg-gray-50 flex justify-between items-center text-xs">
                    <span class="font-bold text-gray-700">Total Token</span>
                    <span class="font-mono font-bold text-gray-900">{{ result.pipeline.preprocessing.total_tokens || '-' }}</span>
                  </div>
                  <div class="p-3 bg-white flex justify-between items-center text-xs">
                    <span class="font-bold text-gray-700">Kata Lolos Filter</span>
                    <span class="font-mono font-bold text-teal-600">{{ result.pipeline.preprocessing.after_stopword?.length || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- Tab 1: Ekspansi Ontologi Sinonim -->
              <div v-else-if="activeStepTab === 1" class="flex flex-col gap-4">
                <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400">Tahap 02: Ekspansi Ontologi</div>
                <div class="text-sm text-gray-600 leading-relaxed">Penyelarasan istilah menggunakan kamus ontologi kampus.</div>
                
                <div v-if="result?.pipeline?.ekspansi" class="border border-gray-200 rounded-sm">
                  <div class="p-3 bg-gray-50 flex justify-between items-center text-xs border-b border-gray-200">
                    <span class="font-bold text-gray-700">Status</span>
                    <span class="font-mono font-bold text-gray-900">{{ result.pipeline.ekspansi.num_frasa_ditemukan > 0 ? 'Ekspansi Aktif' : 'Kosakata Baku' }}</span>
                  </div>
                  <div v-if="result.pipeline.ekspansi.num_frasa_ditemukan > 0" class="p-3 bg-white text-xs space-y-2">
                    <div v-for="(sinonim, frasa) in result.pipeline.ekspansi.log" :key="frasa" class="flex items-center gap-2">
                      <span class="font-mono font-bold text-gray-800">{{ frasa }}</span> &rarr; <span class="font-mono text-teal-600">{{ sinonim }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 2: BM25 Lexical Filter -->
              <div v-else-if="activeStepTab === 2" class="flex flex-col gap-4">
                <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400">Tahap 03: BM25 Lexical</div>
                <div class="text-sm text-gray-600 leading-relaxed">Penyaringan awal berdasar frekuensi eksak (TF-IDF varian).</div>
                
                <div v-if="result?.pipeline?.bm25?.top_candidates?.length > 0" class="border border-gray-200 rounded-sm">
                  <div class="p-3 bg-gray-50 flex justify-between items-center text-xs border-b border-gray-200">
                    <span class="font-bold text-gray-700">Top BM25</span>
                    <span class="font-mono text-gray-500">Skor Leksikal</span>
                  </div>
                  <div class="divide-y divide-gray-100">
                    <div v-for="(c, i) in result.pipeline.bm25.top_candidates" :key="i" class="p-2.5 flex justify-between items-center text-xs">
                      <span class="font-bold text-gray-800 truncate">{{ c.nama }}</span>
                      <span class="font-mono font-bold text-gray-900">{{ c.skor.toFixed(4) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 3: SBERT Semantic Scoring -->
              <div v-else-if="activeStepTab === 3" class="flex flex-col gap-4">
                <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400">Tahap 04: SBERT Semantic</div>
                <div class="text-sm text-gray-600 leading-relaxed">Pencocokan representasi vektor makna mendalam (Cosine Similarity).</div>
                
                <div v-if="result?.pipeline?.sbert?.top_candidates?.length > 0" class="border border-gray-200 rounded-sm">
                  <div class="p-3 bg-gray-50 flex justify-between items-center text-xs border-b border-gray-200">
                    <span class="font-bold text-gray-700">Top SBERT</span>
                    <span class="font-mono text-gray-500">Cosine Sim</span>
                  </div>
                  <div class="divide-y divide-gray-100">
                    <div v-for="(c, i) in result.pipeline.sbert.top_candidates" :key="i" class="p-2.5 flex justify-between items-center text-xs">
                      <span class="font-bold text-gray-800 truncate">{{ c.nama }}</span>
                      <span class="font-mono font-bold text-gray-900">{{ c.skor.toFixed(4) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 4: Hybrid Ranking -->
              <div v-else-if="activeStepTab === 4" class="flex flex-col gap-4">
                <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400">Tahap 05: Hybrid Ranking</div>
                <div class="text-sm text-gray-600 leading-relaxed">Kombinasi adaptif BM25 dan SBERT.</div>
                
                <div v-if="result?.pipeline?.hybrid" class="border border-gray-200 rounded-sm flex">
                  <div class="flex-1 p-4 border-r border-gray-200 text-center">
                    <div class="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Bobot Leksikal</div>
                    <div class="text-2xl font-mono font-bold text-gray-900">{{ Math.round(result.pipeline.hybrid.alpha * 100) }}%</div>
                  </div>
                  <div class="flex-1 p-4 text-center">
                    <div class="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Bobot Semantik</div>
                    <div class="text-2xl font-mono font-bold text-gray-900">{{ Math.round(result.pipeline.hybrid.beta * 100) }}%</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Results View: High-Density Table -->
          <div v-if="result" class="animate-in" style="animation-delay: 200ms">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Hasil Rekomendasi (Top 5)</h3>
            
            <div class="border border-gray-200 rounded-sm overflow-hidden bg-white">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="py-3 px-4 text-[10px] font-mono font-bold text-gray-700 uppercase tracking-widest w-12 text-center">Rnk</th>
                    <th class="py-3 px-4 text-[10px] font-mono font-bold text-gray-700 uppercase tracking-widest">Dosen & Analisis</th>
                    <th class="py-3 px-4 text-[10px] font-mono font-bold text-gray-700 uppercase tracking-widest w-24 text-right">BM25</th>
                    <th class="py-3 px-4 text-[10px] font-mono font-bold text-gray-700 uppercase tracking-widest w-24 text-right">SBERT</th>
                    <th class="py-3 px-4 text-[10px] font-mono font-bold text-gray-700 uppercase tracking-widest w-24 text-right">Hybrid</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(rec, index) in result.recommendations" :key="index" class="hover:bg-gray-50 transition-colors">
                    <td class="py-4 px-4 text-center">
                      <span class="text-sm font-mono font-bold text-gray-900">{{ index + 1 }}</span>
                    </td>
                    <td class="py-4 px-4">
                      <div class="font-bold text-gray-900 text-sm mb-1">{{ rec.dosen?.nama || rec.nama_dosen }}</div>
                      <div class="text-xs text-gray-600 mb-2 font-mono">{{ rec.dosen?.program_studi || '-' }}</div>
                      <div class="flex items-center gap-3">
                        <span class="text-[11px] font-mono text-gray-600">Irisan: {{ rec.xai?.irisan_kata?.slice(0,3).join(', ') || '-' }}</span>
                        <button @click="openXai(rec)" class="text-[11px] font-mono font-bold text-teal-700 hover:text-teal-800 uppercase tracking-widest underline decoration-teal-400">
                          Alasan Kecocokan
                        </button>
                      </div>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <div class="font-mono font-bold text-gray-600 text-xs">{{ (rec.scores?.bm25 || 0).toFixed(3) }}</div>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <div class="font-mono font-bold text-gray-600 text-xs">{{ (rec.scores?.sbert || 0).toFixed(3) }}</div>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <div class="font-mono font-bold text-gray-900 text-sm">{{ (rec.scores?.hybrid || 0).toFixed(3) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>
    </div>

    <!-- XAI Modal -->
    <XaiModal 
      :isOpen="isXaiModalOpen" 
      :dosen="selectedXai?.dosen" 
      :xai="selectedXai?.xai" 
      @close="closeXai" 
    />

  </div>
</template>

<style scoped>
.animate-in {
  animation: fade-in 0.3s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
