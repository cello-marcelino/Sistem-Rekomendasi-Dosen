<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const form = ref({
  judul: '',
  abstrak: ''
})

onMounted(() => {
  if (route.query.judul) {
    form.value.judul = String(route.query.judul)
  }
  if (route.query.abstrak) {
    form.value.abstrak = String(route.query.abstrak)
  }
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

// XAI Modal State & Helpers
const isXaiModalOpen = ref(false)
const selectedXai = ref(null)
const showAllRecords = ref(false)

const openXai = (rec) => {
  selectedXai.value = rec
  showAllRecords.value = false
  isXaiModalOpen.value = true
}

const closeXai = () => {
  isXaiModalOpen.value = false
  selectedXai.value = null
  showAllRecords.value = false
}

const parseListItems = (str) => {
  if (!str || typeof str !== 'string') return []
  const trimmed = str.trim()
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null') {
    return []
  }
  const matches = trimmed.match(/"([^"]+)"/g)
  if (matches && matches.length > 0) {
    return matches
      .map(m => m.replace(/(^"|"$)/g, '').trim())
      .filter(j => j.length > 0 && j !== '-')
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed.replace(/'/g, '"'))
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    } catch {}
  }
  return trimmed
    .split(/\n|;|•|\r/)
    .map(s => s.replace(/^[0-9]+[.)]\s*/, '').trim())
    .filter(s => s.length > 0 && s !== '-')
}

const parseEducationList = (str) => {
  if (!str || typeof str !== 'string') return []
  const trimmed = str.trim()
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null') return []
  
  const regex = /(?=Sarjana|Magister|Doktor|Diploma|S1|S2|S3|D3|D4)/i
  let items = []
  if (trimmed.includes('\n')) {
    items = trimmed.split('\n')
  } else if (trimmed.includes(', ') && regex.test(trimmed)) {
    items = trimmed.split(/,\s*(?=Sarjana|Magister|Doktor|Diploma|S1|S2|S3|D3|D4)/i)
  } else {
    items = trimmed.split(/,|;/)
  }
  return items.map(s => s.trim()).filter(Boolean)
}

const matchTerms = computed(() => {
  const terms = new Set()
  const xai = selectedXai.value?.xai
  if (Array.isArray(xai?.irisan_kata)) {
    xai.irisan_kata.forEach(k => {
      if (k && k.trim().length >= 3) terms.add(k.trim().toLowerCase())
    })
  }
  if (Array.isArray(xai?.topik_dosen)) {
    xai.topik_dosen.forEach(t => {
      if (t && t.trim().length >= 3) {
        t.trim().toLowerCase().split(/\s+/).forEach(word => {
          if (word.length >= 3) terms.add(word)
        })
      }
    })
  }
  return Array.from(terms)
})

const filterRelevant = (items) => {
  if (matchTerms.value.length === 0) return items
  return items.filter(item => {
    const lower = item.toLowerCase()
    return matchTerms.value.some(term => lower.includes(term))
  })
}

const allJurnalList = computed(() => parseListItems(selectedXai.value?.dosen?.jurnal))
const allBimbinganList = computed(() => parseListItems(selectedXai.value?.dosen?.judul_bimbing))
const allUjiList = computed(() => parseListItems(selectedXai.value?.dosen?.judul_uji))
const pendidikanList = computed(() => parseEducationList(selectedXai.value?.dosen?.pendidikan))

const displayJurnalList = computed(() => {
  if (showAllRecords.value) return allJurnalList.value
  return filterRelevant(allJurnalList.value)
})

const displayBimbinganList = computed(() => {
  if (showAllRecords.value) return allBimbinganList.value
  return filterRelevant(allBimbinganList.value)
})

const displayUjiList = computed(() => {
  if (showAllRecords.value) return allUjiList.value
  return filterRelevant(allUjiList.value)
})
</script>

<template>
  <div class="space-y-6 pb-12 animate-in font-sans">
    <!-- Header Section (Canvas-First) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-h1 font-bold text-gray-900 tracking-tight font-sans">Rekomendasi Dosen</h1>
        <p class="text-base text-gray-700 mt-1 font-normal">
          Analisis kecocokan topik tugas akhir mahasiswa dengan kepakaran dosen berbasis model NLP (BM25 & SBERT).
        </p>
      </div>
    </div>

    <!-- Elevated Content Card (Input + Results) -->
    <div class="bg-white border border-gray-200/90 rounded-lg shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 w-full items-start box-border">
      
      <!-- Left: Input Panel (4 Cols) -->
      <aside class="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50 p-6 lg:p-8 relative">
        <div :class="{ 'opacity-50 pointer-events-none': loading }" class="transition-opacity">
          
          <h2 class="text-h2 font-sans font-bold text-gray-900 mb-5">Data Penelitian</h2>

          <form @submit.prevent="submitForm" class="space-y-5">
            <div>
              <label class="block text-base font-semibold text-gray-700 mb-1.5 font-sans">Judul Penelitian</label>
              <input
                v-model="form.judul"
                required
                class="w-full bg-white border border-gray-300 rounded-[4px] px-3.5 py-2.5 text-base text-gray-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-sans transition-colors"
                placeholder="Contoh: Sistem Rekomendasi..."
                :disabled="loading"
              />
            </div>

            <div>
              <label class="block text-base font-semibold text-gray-700 mb-1.5 font-sans">Abstrak / Rencana Proposal</label>
              <textarea
                v-model="form.abstrak"
                required
                rows="8"
                class="w-full bg-white border border-gray-300 rounded-[4px] px-3.5 py-2.5 text-base text-gray-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-sans transition-colors resize-y leading-relaxed"
                placeholder="Tuliskan latar belakang, metode yang digunakan, dan tujuan penelitian..."
                :disabled="loading"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-base font-semibold rounded-[4px] transition-colors flex items-center justify-center gap-2 shadow-sm font-sans"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Memproses Analisis NLP...' : 'Mulai Analisis Rekomendasi' }}
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-gray-200">
            <div class="text-tiny font-sans font-bold uppercase tracking-wider text-gray-500 mb-3">Gunakan Contoh Topik</div>
            <div class="flex flex-col gap-2">
              <button
                v-for="(preset, idx) in presetExamples"
                :key="idx"
                @click="loadPreset(preset)"
                :disabled="loading"
                class="text-left px-3 py-2 bg-white border border-gray-200 hover:border-teal-400 rounded-[4px] text-base text-gray-700 transition-colors truncate font-sans"
              >
                {{ preset.title }}
              </button>
            </div>
          </div>
          
          <div v-if="error" class="mt-6 p-4 bg-red-50 text-red-700 rounded-[4px] text-base border border-red-200 font-medium font-sans">
            {{ error }}
          </div>
        </div>
      </aside>

      <!-- Right: Results Panel (8 Cols) -->
      <main class="lg:col-span-8 p-6 lg:p-8">
        
        <!-- Empty State -->
        <div v-if="!loading && !result" class="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-gray-300 rounded-lg bg-gray-50/50 text-center p-12">
          <div class="text-h2 font-bold text-gray-900 mb-1 tracking-wide font-sans">Panel Hasil Analisis NLP</div>
          <p class="text-base text-gray-600 max-w-sm font-sans">Masukkan judul dan abstrak pada panel kiri untuk memetakan dosen pembimbing dan penguji yang sesuai.</p>
        </div>

        <div v-else-if="loading || result" class="flex flex-col gap-8">
          
          <!-- Pipeline Log: Strict Tabular Style -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-h2 font-bold text-gray-900 tracking-tight font-sans">Log Pipeline NLP</h2>
              <span v-if="loading" class="text-tiny font-sans font-semibold text-teal-700 uppercase tracking-wider flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                Memproses Tahap 0{{ activeStepTab + 1 }}
              </span>
              <span v-else-if="result" class="text-tiny font-sans font-semibold text-gray-500 uppercase tracking-wider">
                Analisis Selesai
              </span>
            </div>

            <!-- Steps Progress Line -->
            <div class="flex gap-1 mb-6">
              <div v-for="(st, idx) in steps" :key="idx" class="flex-1 h-1.5 rounded-full"
                   :class="activeStepTab > idx || st.status === 'done' ? 'bg-teal-600' : (st.status === 'running' ? 'bg-teal-400 animate-pulse' : 'bg-gray-200')">
              </div>
            </div>

            <!-- Active Stage Inspector Panel -->
            <div class="border border-gray-200 rounded-lg p-5 bg-white shadow-2xs">
              
              <!-- Tab 0: Preprocessing Teks -->
              <div v-if="activeStepTab === 0" class="flex flex-col gap-4">
                <div class="text-tiny font-sans font-bold uppercase tracking-wider text-gray-600">Tahap 01: Pembersihan Teks</div>
                <div class="text-base text-gray-700 leading-relaxed font-sans">Ekstraksi kata kunci, penghapusan stopword, dan normalisasi istilah.</div>
                
                <div v-if="result?.pipeline?.preprocessing" class="border border-gray-200 rounded-[4px] divide-y divide-gray-100">
                  <div class="p-3 bg-gray-50/70 flex justify-between items-center text-base font-sans">
                    <span class="font-bold text-gray-700">Total Token</span>
                    <span class="font-mono font-bold text-gray-900 tabular-nums">{{ result.pipeline.preprocessing.total_tokens || '-' }}</span>
                  </div>
                  <div class="p-3 bg-white flex justify-between items-center text-base font-sans">
                    <span class="font-bold text-gray-700">Kata Lolos Filter</span>
                    <span class="font-mono font-bold text-teal-700 tabular-nums">{{ result.pipeline.preprocessing.after_stopword?.length || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- Tab 1: Ekspansi Ontologi Sinonim -->
              <div v-else-if="activeStepTab === 1" class="flex flex-col gap-4">
                <div class="text-tiny font-sans font-bold uppercase tracking-wider text-gray-600">Tahap 02: Ekspansi Sinonim</div>
                <div class="text-base text-gray-700 leading-relaxed font-sans">Penyelarasan istilah menggunakan kamus padanan kata baku informatika.</div>
                
                <div v-if="result?.pipeline?.ekspansi" class="border border-gray-200 rounded-[4px]">
                  <div class="p-3 bg-gray-50/70 flex justify-between items-center text-base border-b border-gray-100 font-sans">
                    <span class="font-bold text-gray-700">Status</span>
                    <span class="font-sans font-semibold text-gray-900">{{ result.pipeline.ekspansi.num_frasa_ditemukan > 0 ? 'Ekspansi Aktif' : 'Kosakata Baku' }}</span>
                  </div>
                  <div v-if="result.pipeline.ekspansi.num_frasa_ditemukan > 0" class="p-3 bg-white text-base space-y-2">
                    <div v-for="(sinonim, frasa) in result.pipeline.ekspansi.log" :key="frasa" class="flex items-center gap-2">
                      <span class="font-mono font-bold text-gray-800">{{ frasa }}</span> &rarr; <span class="font-mono text-teal-700">{{ sinonim }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 2: BM25 Lexical Filter -->
              <div v-else-if="activeStepTab === 2" class="flex flex-col gap-4">
                <div class="text-tiny font-sans font-bold uppercase tracking-wider text-gray-600">Tahap 03: BM25 Lexical Filter</div>
                <div class="text-base text-gray-700 leading-relaxed font-sans">Penyaringan awal berdasar frekuensi kata kunci eksak.</div>
                
                <div v-if="result?.pipeline?.bm25?.top_candidates?.length > 0" class="border border-gray-200 rounded-[4px]">
                  <div class="p-3 bg-gray-50/70 flex justify-between items-center text-base border-b border-gray-100 font-sans">
                    <span class="font-bold text-gray-700">Top BM25</span>
                    <span class="font-sans text-gray-500 font-semibold">Skor Leksikal</span>
                  </div>
                  <div class="divide-y divide-gray-100">
                    <div v-for="(c, i) in result.pipeline.bm25.top_candidates" :key="i" class="p-2.5 flex justify-between items-center text-base">
                      <span class="font-bold text-gray-800 truncate font-sans">{{ c.nama }}</span>
                      <span class="font-mono font-bold text-gray-900 tabular-nums">{{ c.skor.toFixed(4) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 3: SBERT Semantic Scoring -->
              <div v-else-if="activeStepTab === 3" class="flex flex-col gap-4">
                <div class="text-tiny font-sans font-bold uppercase tracking-wider text-gray-600">Tahap 04: SBERT Semantic Scoring</div>
                <div class="text-base text-gray-700 leading-relaxed font-sans">Pencocokan representasi vektor makna mendalam (Cosine Similarity).</div>
                
                <div v-if="result?.pipeline?.sbert?.top_candidates?.length > 0" class="border border-gray-200 rounded-[4px]">
                  <div class="p-3 bg-gray-50/70 flex justify-between items-center text-base border-b border-gray-100 font-sans">
                    <span class="font-bold text-gray-700">Top SBERT</span>
                    <span class="font-sans text-gray-500 font-semibold">Cosine Sim</span>
                  </div>
                  <div class="divide-y divide-gray-100">
                    <div v-for="(c, i) in result.pipeline.sbert.top_candidates" :key="i" class="p-2.5 flex justify-between items-center text-base">
                      <span class="font-bold text-gray-800 truncate font-sans">{{ c.nama }}</span>
                      <span class="font-mono font-bold text-gray-900 tabular-nums">{{ c.skor.toFixed(4) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab 4: Hybrid Ranking -->
              <div v-else-if="activeStepTab === 4" class="flex flex-col gap-4">
                <div class="text-tiny font-sans font-bold uppercase tracking-wider text-gray-600">Tahap 05: Hybrid Ranking</div>
                <div class="text-base text-gray-700 leading-relaxed font-sans">Kombinasi berbobot leksikal BM25 dan semantik SBERT.</div>
                
                <div v-if="result?.pipeline?.hybrid" class="border border-gray-200 rounded-[4px] flex divide-x divide-gray-200">
                  <div class="flex-1 p-4 text-center">
                    <div class="text-tiny font-sans font-semibold text-gray-500 uppercase tracking-wider mb-1">Bobot Leksikal</div>
                    <div class="text-h1 font-mono font-bold text-gray-900 tabular-nums">{{ Math.round(result.pipeline.hybrid.alpha * 100) }}%</div>
                  </div>
                  <div class="flex-1 p-4 text-center">
                    <div class="text-tiny font-sans font-semibold text-gray-500 uppercase tracking-wider mb-1">Bobot Semantik</div>
                    <div class="text-h1 font-mono font-bold text-gray-900 tabular-nums">{{ Math.round(result.pipeline.hybrid.beta * 100) }}%</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Results View: High-Density Table -->
          <div v-if="result" class="animate-in" style="animation-delay: 150ms">
            <h2 class="text-h2 font-bold text-gray-900 tracking-tight mb-3 font-sans">Dosen Rekomendasi Teratas</h2>
            
            <div class="border border-gray-200/90 rounded-lg overflow-hidden bg-white shadow-sm">
              <table class="w-full text-left border-collapse text-base">
                <thead>
                  <tr class="bg-gray-50/80 border-b border-gray-200/90 text-h3 uppercase font-sans tracking-wider text-gray-700 font-bold">
                    <th class="py-3 px-4 w-12 text-center border-r border-gray-200/80">Rnk</th>
                    <th class="py-3 px-4 border-r border-gray-200/80">Identitas Dosen & Alasan</th>
                    <th class="py-3 px-4 text-right border-r border-gray-200/80 w-24">BM25</th>
                    <th class="py-3 px-4 text-right border-r border-gray-200/80 w-24">SBERT</th>
                    <th class="py-3 px-4 text-right w-24">Skor Akhir</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(rec, index) in result.recommendations" :key="index" class="hover:bg-slate-50 transition-colors">
                    <td class="py-4 px-4 text-center border-r border-gray-100">
                      <span class="text-h3 font-mono font-bold text-gray-900 tabular-nums">{{ index + 1 }}</span>
                    </td>
                    <td class="py-4 px-4 border-r border-gray-100">
                      <div class="font-bold text-gray-900 text-h3 mb-0.5 font-sans">{{ rec.dosen?.nama || rec.nama_dosen }}</div>
                      <div class="text-base text-teal-800 font-semibold mb-2 font-sans">{{ rec.dosen?.program_studi || 'Teknik Informatika' }}</div>
                      <div class="flex items-center gap-3">
                        <span class="text-base text-gray-600 font-sans">Irisan: <span class="font-mono text-gray-800">{{ rec.xai?.irisan_kata?.slice(0,3).join(', ') || '-' }}</span></span>
                        <button @click="openXai(rec)" class="text-base font-sans font-semibold text-teal-700 hover:text-teal-800 underline cursor-pointer">
                          Alasan Kecocokan
                        </button>
                      </div>
                    </td>
                    <td class="py-4 px-4 text-right border-r border-gray-100">
                      <div class="font-mono font-bold text-gray-600 text-base tabular-nums">{{ (rec.scores?.bm25 || 0).toFixed(3) }}</div>
                    </td>
                    <td class="py-4 px-4 text-right border-r border-gray-100">
                      <div class="font-mono font-bold text-gray-600 text-base tabular-nums">{{ (rec.scores?.sbert || 0).toFixed(3) }}</div>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <div class="font-mono font-bold text-teal-900 text-h3 tabular-nums">{{ (rec.scores?.hybrid || 0).toFixed(3) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>
    </div>

    <!-- XAI Modal (Inlined for single-page locality) -->
    <div 
      v-if="isXaiModalOpen && selectedXai?.dosen" 
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-50" 
      @click.self="closeXai"
    >
      <div class="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-start shrink-0">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-tiny font-sans font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded">
                {{ selectedXai.dosen.program_studi }}
              </span>
              <span v-if="selectedXai.dosen.nidn" class="text-tiny font-sans font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded">
                NIDN: <span class="font-mono tabular-nums font-semibold">{{ selectedXai.dosen.nidn }}</span>
              </span>
            </div>
            <h2 class="text-h2 font-bold text-gray-900 tracking-tight">{{ selectedXai.dosen.nama }}</h2>
          </div>
          <button 
            @click="closeXai" 
            class="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
            title="Tutup dialog"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto flex-1 bg-white flex flex-col gap-6">
          
          <!-- 1. Bidang Keahlian & Pendidikan -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-h3 font-bold uppercase tracking-wider text-gray-700">
                Bidang Keahlian
              </div>
              <div class="p-4 text-base font-semibold text-gray-900 leading-relaxed">
                {{ selectedXai.dosen.bidang_keahlian || '-' }}
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <div class="bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-h3 font-bold uppercase tracking-wider text-gray-700">
                Riwayat Pendidikan
              </div>
              <div class="divide-y divide-gray-100">
                <div 
                  v-for="(edu, idx) in pendidikanList" 
                  :key="idx" 
                  class="px-4 py-2.5 text-base text-gray-700 leading-relaxed"
                >
                  {{ edu }}
                </div>
                <div v-if="!pendidikanList.length" class="p-4 text-base italic text-gray-400">
                  Belum ada data pendidikan.
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Alasan Kesesuaian Rekomendasi -->
          <div class="border border-teal-200 rounded-lg overflow-hidden">
            <div class="bg-teal-50/80 border-b border-teal-200 px-4 py-2.5 flex justify-between items-center">
              <span class="text-h3 font-bold uppercase tracking-wider text-teal-900">
                Alasan Kesesuaian Rekomendasi
              </span>
              <button 
                @click="showAllRecords = !showAllRecords" 
                class="text-base font-semibold text-teal-700 hover:text-teal-900 hover:underline"
              >
                {{ showAllRecords ? 'Tampilkan Yang Relevan Saja' : 'Tampilkan Semua Riwayat' }}
              </button>
            </div>
            
            <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
              <div class="flex flex-col gap-2">
                <div class="text-base font-semibold text-gray-700">Kecocokan Kata Kunci (BM25):</div>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="kata in selectedXai?.xai?.irisan_kata" 
                    :key="kata" 
                    class="text-tiny font-medium border border-gray-300 bg-gray-50 px-2.5 py-1 rounded text-gray-800"
                  >
                    {{ kata }}
                  </span>
                  <span v-if="!selectedXai?.xai?.irisan_kata?.length" class="text-base text-gray-500 italic">
                    Tidak ada kata kunci yang cocok secara langsung.
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="text-base font-semibold text-gray-700">Kecocokan Makna Topik (SBERT):</div>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="topik in selectedXai?.xai?.topik_dosen" 
                    :key="topik" 
                    class="text-tiny font-medium border border-teal-200 bg-teal-50 px-2.5 py-1 rounded text-teal-800"
                  >
                    {{ topik }}
                  </span>
                  <span v-if="!selectedXai?.xai?.topik_dosen?.length" class="text-base text-gray-500 italic">
                    Belum ada topik semantik terdeteksi.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Riwayat Publikasi Jurnal -->
          <div class="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex justify-between items-center">
              <span class="text-h3 font-bold uppercase tracking-wider text-gray-700">
                {{ showAllRecords ? 'Seluruh Riwayat Publikasi Jurnal' : 'Riwayat Publikasi Jurnal Relevan' }}
              </span>
              <span class="text-tiny font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">
                <span class="font-mono tabular-nums font-semibold">{{ displayJurnalList.length }}</span> / <span class="font-mono tabular-nums font-semibold">{{ allJurnalList.length }}</span>
              </span>
            </div>
            <div class="divide-y divide-gray-100">
              <div 
                v-for="(jurnal, idx) in displayJurnalList" 
                :key="idx" 
                class="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
              >
                <span class="text-base font-mono tabular-nums font-bold text-gray-400 w-6 shrink-0">#{{ idx + 1 }}</span>
                <span class="text-base text-gray-900 leading-relaxed font-medium">{{ jurnal }}</span>
              </div>
              <div v-if="!displayJurnalList.length" class="p-6 text-base text-gray-400 italic text-center">
                Tidak ada riwayat publikasi jurnal yang memuat kata kunci topik input.
              </div>
            </div>
          </div>

          <!-- 4. Riwayat Bimbingan Mahasiswa -->
          <div class="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex justify-between items-center">
              <span class="text-h3 font-bold uppercase tracking-wider text-gray-700">
                {{ showAllRecords ? 'Seluruh Riwayat Bimbingan' : 'Riwayat Bimbingan Mahasiswa Relevan' }}
              </span>
              <span class="text-tiny font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">
                <span class="font-mono tabular-nums font-semibold">{{ displayBimbinganList.length }}</span> / <span class="font-mono tabular-nums font-semibold">{{ allBimbinganList.length }}</span>
              </span>
            </div>
            <div class="divide-y divide-gray-100">
              <div 
                v-for="(bimbing, idx) in displayBimbinganList" 
                :key="idx" 
                class="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
              >
                <span class="text-base font-mono tabular-nums font-bold text-gray-400 w-6 shrink-0">#{{ idx + 1 }}</span>
                <span class="text-base text-gray-900 leading-relaxed font-medium">{{ bimbing }}</span>
              </div>
              <div v-if="!displayBimbinganList.length" class="p-6 text-base text-gray-400 italic text-center">
                Tidak ada riwayat bimbingan mahasiswa yang memuat kata kunci topik input.
              </div>
            </div>
          </div>

          <!-- 5. Riwayat Pengujian Mahasiswa -->
          <div class="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex justify-between items-center">
              <span class="text-h3 font-bold uppercase tracking-wider text-gray-700">
                {{ showAllRecords ? 'Seluruh Riwayat Pengujian' : 'Riwayat Pengujian Sidang Relevan' }}
              </span>
              <span class="text-tiny font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">
                <span class="font-mono tabular-nums font-semibold">{{ displayUjiList.length }}</span> / <span class="font-mono tabular-nums font-semibold">{{ allUjiList.length }}</span>
              </span>
            </div>
            <div class="divide-y divide-gray-100">
              <div 
                v-for="(uji, idx) in displayUjiList" 
                :key="idx" 
                class="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
              >
                <span class="text-base font-mono tabular-nums font-bold text-gray-400 w-6 shrink-0">#{{ idx + 1 }}</span>
                <span class="text-base text-gray-900 leading-relaxed font-medium">{{ uji }}</span>
              </div>
              <div v-if="!displayUjiList.length" class="p-6 text-base text-gray-400 italic text-center">
                Tidak ada riwayat pengujian sidang yang memuat kata kunci topik input.
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-in {
  animation: fade-in 0.3s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
