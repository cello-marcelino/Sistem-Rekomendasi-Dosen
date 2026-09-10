<script setup>
import { ref, computed } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import XaiModal from '../components/recommendation/XaiModal.vue'
import ProgressStepper from '../components/recommendation/ProgressStepper.vue'

const router = useRouter()
const form = ref({
  judul: '',
  abstrak: ''
})
const loading = ref(false)
const result = ref(null)
const error = ref(null)

const steps = ref([
  { title: 'Preprocessing Teks', status: 'idle', open: false },
  { title: 'Ekspansi Ontologi Sinonim', status: 'idle', open: false },
  { title: 'BM25 Lexical Filter', status: 'idle', open: false },
  { title: 'SBERT Semantic Scoring', status: 'idle', open: false },
  { title: 'Hybrid Ranking & Penalti', status: 'idle', open: false }
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
  steps.value.forEach(s => { s.status = 'idle'; s.open = false })
  
  let currentStep = 0
  steps.value[currentStep].status = 'running'
  steps.value[currentStep].open = true

  const interval = setInterval(() => {
    if (currentStep < steps.value.length - 1) {
      steps.value[currentStep].status = 'done'
      steps.value[currentStep].open = false
      currentStep++
      steps.value[currentStep].status = 'running'
      steps.value[currentStep].open = true
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
    error.value = err.response?.data?.error || 'Gagal mendapatkan rekomendasi. Pastikan API key valid.'
  } finally {
    loading.value = false
    // Ensure visually all steps complete if API is faster
    clearInterval(interval)
    steps.value.forEach(s => { s.status = 'done'; s.open = false })
    // Keep the last step open for review if successful
    if (result.value) {
      steps.value[steps.value.length - 1].open = true
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
  <div class="flex flex-col min-h-full">
    <!-- Header -->
    <div class="px-6 py-8 border-b border-gray-200 shrink-0">
      <div class="max-w-[1400px] mx-auto">
        <h1 class="text-[1.85rem] font-bold tracking-tight text-gray-900 mb-2">Single Recommendation</h1>
        <p class="text-[1rem] text-gray-500 leading-relaxed max-w-[800px] m-0">
          Analisis satu topik penelitian secara real-time  lihat skor <strong>BM25</strong>, <strong>SBERT</strong>, dan <strong>Hybrid</strong> beserta penjelasan XAI Explanation.
        </p>
      </div>
    </div>

    <!-- Body Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 p-6 sm:p-8 max-w-[1400px] w-full mx-auto items-start box-border">
      
      <!-- Left: Input Panel -->
      <aside class="sticky top-24">
        <div class="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm relative overflow-hidden" :class="{ 'opacity-80 pointer-events-none': loading }">
          
          <div v-if="loading" class="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10"></div>
          
          <div class="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-gray-400 mb-4">Data Topik / Rencana Penelitian</div>

          <form @submit.prevent="submitForm" class="space-y-5">
            <!-- Judul -->
            <div>
              <label class="block text-[0.8rem] font-semibold text-gray-700 mb-1.5">Judul Penelitian</label>
              <input
                v-model="form.judul"
                required
                class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Contoh: Sistem Rekomendasi..."
                :disabled="loading"
              />
            </div>

            <!-- Abstrak -->
            <div>
              <label class="block text-[0.8rem] font-semibold text-gray-700 mb-1.5">Abstrak / Rencana Penelitian</label>
              <textarea
                v-model="form.abstrak"
                required
                rows="6"
                class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors resize-y leading-relaxed"
                placeholder="Latar belakang, metode, dan tujuan penelitian..."
                :disabled="loading"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-[0.9rem]"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ loading ? 'Memproses NLP...' : 'Mulai Analisis' }}
            </button>
          </form>

          <div class="mt-6 pt-5 border-t border-gray-100">
            <div class="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-gray-400 mb-3">Load Preset Example</div>
            <div class="flex flex-col gap-2">
              <button
                v-for="(preset, idx) in presetExamples"
                :key="idx"
                @click="loadPreset(preset)"
                :disabled="loading"
                class="text-left px-3 py-2 bg-gray-50 border border-gray-200 hover:border-emerald-300 rounded-md text-[0.75rem] text-gray-600 transition-colors truncate"
              >
                {{ preset.title }}
              </button>
            </div>
          </div>
          
          <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-[0.8rem] border border-red-100 font-medium">
            {{ error }}
          </div>
        </div>
      </aside>

      <!-- Right: Results Panel -->
      <main class="flex flex-col gap-8 min-w-0">
        
        <!-- Empty State -->
        <div v-if="!loading && !result" class="flex flex-col items-center justify-center min-h-[320px] border-2 border-dashed border-gray-200 rounded-[14px] bg-gray-50 text-center p-12">
          <div class="w-14 h-14 text-gray-300 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p class="text-[0.95rem] font-bold text-gray-500 mb-1">Panel Analisis AI</p>
          <p class="text-[0.825rem] text-gray-400">Isi data penelitian di sebelah kiri, lalu klik <em>Mulai Analisis</em>.</p>
        </div>

                <div v-else-if="loading || result" class="flex flex-col gap-6 animate-in">
          <!-- Pipeline Log section (Legacy Visual Style) -->
          <div class="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm">
            <div class="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-gray-400 mb-4">Pipeline Log</div>
            <ProgressStepper :steps="steps">
              <!-- Step 0: Preprocessing -->
              <template #step-0>
                <div v-if="result?.pipeline?.preprocessing" class="plog-body">
                  <div class="plog-block">
                    <div class="plog-block-label">Input Query</div>
                    <code class="plog-code">{{ result.pipeline.preprocessing.raw_query }}</code>
                  </div>
                  <div class="plog-row">
                    <div class="plog-block">
                      <div class="plog-block-label plog-label--gray"> Setelah Case Fold <span class="plog-count">{{ result.pipeline.preprocessing.after_case_fold?.length || 0 }} kata</span></div>
                      <div class="plog-tags">
                        <span v-for="t in result.pipeline.preprocessing.after_case_fold" :key="t" class="plog-tag plog-tag--gray">{{ t }}</span>
                      </div>
                    </div>
                    <div class="plog-block">
                      <div class="plog-block-label plog-label--red"> Setelah Stopword <span class="plog-count">{{ result.pipeline.preprocessing.after_stopword?.length || 0 }} tersisa</span></div>
                      <div class="plog-tags">
                        <span v-for="t in result.pipeline.preprocessing.after_stopword" :key="t" class="plog-tag plog-tag--red">{{ t }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="result.pipeline.preprocessing.bigrams?.length > 0" class="plog-block">
                    <div class="plog-block-label plog-label--blue"> Bigram Terbentuk</div>
                    <div class="plog-tags">
                      <span v-for="t in result.pipeline.preprocessing.bigrams" :key="t" class="plog-tag plog-tag--blue">{{ t }}</span>
                    </div>
                  </div>
                  <div class="plog-footer">Total token BM25: <strong>{{ result.pipeline.preprocessing.total_tokens }}</strong></div>
                </div>
                <div v-else class="plog-wait">Menunggu data...</div>
              </template>

              <!-- Step 1: Ekspansi -->
              <template #step-1>
                <div v-if="result?.pipeline?.ekspansi" class="plog-body">
                  <div v-if="result.pipeline.ekspansi.num_frasa_ditemukan > 0">
                    <div class="plog-section-title">{{ result.pipeline.ekspansi.num_frasa_ditemukan }} frasa ditemukan dalam kamus</div>
                    <div class="plog-expand-list">
                      <div v-for="(sinonim, frasa) in result.pipeline.ekspansi.log" :key="frasa" class="plog-expand-row">
                        <span class="plog-tag plog-tag--amber plog-tag--bold">{{ frasa }}</span>
                        <span class="plog-arrow"></span>
                        <template v-for="s in sinonim.split(' ')" :key="s">
                          <span class="plog-tag plog-tag--green">+ {{ s }}</span>
                        </template>
                      </div>
                    </div>
                  </div>
                  <div v-else class="plog-empty-msg">
                    <div class="plog-empty-icon"></div>
                    <p>Tidak ada frasa yang cocok dengan kamus ontologi.</p>
                    <p class="plog-empty-sub">Query diproses tanpa ekspansi sinonim.</p>
                  </div>
                </div>
                <div v-else class="plog-wait">Menunggu data...</div>
              </template>

              <!-- Step 2: BM25 -->
              <template #step-2>
                <div v-if="result?.pipeline?.bm25" class="plog-body">
                  <div class="plog-stats-row">
                    <div class="plog-stat plog-stat--blue">
                      <div class="plog-stat-val">{{ result.pipeline.bm25.num_candidates }}</div>
                      <div class="plog-stat-lbl">dosen lolos filter</div>
                    </div>
                    <div class="plog-stat plog-stat--gray">
                      <div class="plog-stat-val">{{ result.pipeline.bm25.num_total_dosen - result.pipeline.bm25.num_candidates }}</div>
                      <div class="plog-stat-lbl">BM25 = 0 (difilter)</div>
                    </div>
                  </div>
                  <div v-if="result.pipeline.bm25.top_candidates?.length > 0" class="plog-ranklist">
                    <div class="plog-ranklist-header">Top Kandidat BM25</div>
                    <div v-for="(c, i) in result.pipeline.bm25.top_candidates" :key="i" class="plog-rankrow">
                      <span class="plog-rank-num">{{ i + 1 }}</span>
                      <span class="plog-rank-name">{{ c.nama }}</span>
                      <div class="plog-score-bar">
                        <div class="plog-score-fill plog-score-fill--blue" :style="'width:' + (c.skor * 100) + '%'"></div>
                      </div>
                      <span class="plog-score-val plog-score-val--blue">{{ c.skor.toFixed(4) }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="plog-wait">Menunggu data...</div>
              </template>

              <!-- Step 3: SBERT -->
              <template #step-3>
                <div v-if="result?.pipeline?.sbert" class="plog-body">
                  <div class="plog-block plog-block--fuchsia">
                    <div class="plog-block-label plog-label--fuchsia">Teks Query yang Di-encode SBERT</div>
                    <code class="plog-code plog-code--fuchsia">{{ result.pipeline.sbert.query_text || '-' }}</code>
                  </div>
                  <div class="plog-info-row">
                    Cosine Similarity dihitung untuk <strong>{{ result.pipeline.sbert.num_computed }} dosen</strong> yang lolos BM25 filter.
                  </div>
                  <div v-if="result.pipeline.sbert.top_candidates?.length > 0" class="plog-ranklist">
                    <div class="plog-ranklist-header">Top Kandidat SBERT</div>
                    <div v-for="(c, i) in result.pipeline.sbert.top_candidates" :key="i" class="plog-rankrow">
                      <span class="plog-rank-num">{{ i + 1 }}</span>
                      <span class="plog-rank-name">{{ c.nama }}</span>
                      <div class="plog-score-bar">
                        <div class="plog-score-fill plog-score-fill--fuchsia" :style="'width:' + (c.skor * 100) + '%'"></div>
                      </div>
                      <span class="plog-score-val plog-score-val--fuchsia">{{ c.skor.toFixed(4) }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="plog-wait">Menunggu data...</div>
              </template>

              <!-- Step 4: Hybrid -->
              <template #step-4>
                <div v-if="result?.pipeline?.hybrid" class="plog-body">
                  <div class="plog-stats-row plog-stats-row--3">
                    <div class="plog-stat plog-stat--blue">
                      <div class="plog-stat-val">{{ Math.round(result.pipeline.hybrid.alpha * 100) }}%</div>
                      <div class="plog-stat-lbl">Bobot BM25 (Alpha)</div>
                    </div>
                    <div class="plog-stat plog-stat--fuchsia">
                      <div class="plog-stat-val">{{ Math.round(result.pipeline.hybrid.beta * 100) }}%</div>
                      <div class="plog-stat-lbl">Bobot SBERT (Beta)</div>
                    </div>
                    <div class="plog-stat plog-stat--green">
                      <div class="plog-stat-val">{{ result.pipeline.hybrid.num_results }}</div>
                      <div class="plog-stat-lbl">Hasil Final</div>
                    </div>
                  </div>
                  <div class="plog-formula">
                    <span class="plog-formula-blue">{{ Math.round(result.pipeline.hybrid.alpha * 100) }}%</span> * BM25
                    + <span class="plog-formula-fuchsia">{{ Math.round(result.pipeline.hybrid.beta * 100) }}%</span> * SBERT
                    = <span class="plog-formula-brand">Hybrid Score</span>
                  </div>
                  <div class="plog-mode-badge" :class="result.pipeline.hybrid.mode === 'manual' ? 'plog-mode--manual' : (result.pipeline.hybrid.mode === 'keyword' ? 'plog-mode--blue' : 'plog-mode--fuchsia')">
                    {{ result.pipeline.hybrid.mode === 'manual' ? '- Manual Mode' : (result.pipeline.hybrid.mode === 'keyword' ? '- Keyword Mode (BM25 dominan)' : '- Abstrak Mode (SBERT dominan)') }}
                  </div>
                </div>
                <div v-else class="plog-wait">Menunggu data...</div>
              </template>
            </ProgressStepper>
          </div>

          <!-- Results View -->
          <div v-if="result" class="bg-white border border-gray-200 rounded-[14px] p-6 shadow-sm animate-in" style="animation-delay: 200ms">
            <div class="flex justify-between items-center mb-4">
              <div class="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-gray-400">Hasil Rekomendasi</div>
              <div class="text-xs font-mono bg-emerald-50 px-2.5 py-1 rounded-md text-emerald-700 border border-emerald-100">
                Mode: {{ result.metadata?.mode || 'Hybrid' }}
              </div>
            </div>
            
            <div class="overflow-x-auto rounded-lg border border-gray-200">
              <table class="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16 text-center">Rank</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dosen & Analisis</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 text-center">BM25</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 text-center">SBERT</th>
                    <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-40 text-center">Hybrid</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr v-for="(rec, index) in result.recommendations" :key="index" class="hover:bg-gray-50/50 transition-colors">
                    
                    <!-- Rank -->
                    <td class="py-4 px-4 text-center">
                      <span v-if="index === 0" class="inline-flex items-center justify-center w-7 h-7 bg-amber-100 text-amber-700 font-bold rounded-full text-sm">1</span>
                      <span v-else class="text-gray-400 font-bold text-sm">{{ index + 1 }}</span>
                    </td>
                    
                    <!-- Dosen Info -->
                    <td class="py-4 px-4">
                      <div class="font-bold text-gray-900 text-[14px] cursor-pointer hover:text-emerald-600 transition-colors" @click="router.push(/dosen/)">
                        {{ rec.dosen?.nama || rec.nama_dosen }}
                      </div>
                      <div class="text-[11px] text-gray-500 mt-1 mb-2">
                        {{ rec.dosen?.program_studi || '-' }}
                      </div>
                      <div class="text-[11px] text-gray-400 leading-relaxed truncate max-w-sm">
                        Kata irisan: {{ rec.xai?.irisan_kata?.slice(0,5).join(', ') || '-' }}
                      </div>
                      <button @click="openXai(rec)" class="mt-2 text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors">
                        Lihat Penjelasan XAI
                      </button>
                    </td>
                    
                    <!-- BM25 -->
                    <td class="py-4 px-4">
                      <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 border border-blue-100">
                        <div class="font-mono font-bold text-blue-700 text-sm">{{ (rec.scores?.bm25 || 0).toFixed(3) }}</div>
                        <div class="text-[10px] text-blue-500 mt-0.5">{{ Math.round((rec.scores?.bm25 || 0) * 100) }}%</div>
                      </div>
                    </td>
                    
                    <!-- SBERT -->
                    <td class="py-4 px-4">
                      <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-fuchsia-50 border border-fuchsia-100">
                        <div class="font-mono font-bold text-fuchsia-700 text-sm">{{ (rec.scores?.sbert || 0).toFixed(3) }}</div>
                        <div class="text-[10px] text-fuchsia-500 mt-0.5">{{ Math.round((rec.scores?.sbert || 0) * 100) }}%</div>
                      </div>
                    </td>
                    
                    <!-- Hybrid -->
                    <td class="py-4 px-4">
                      <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-50 border border-emerald-200 shadow-sm relative overflow-hidden">
                        <div class="font-mono font-bold text-emerald-700 text-lg relative z-10">{{ (rec.scores?.hybrid || 0).toFixed(3) }}</div>
                        <div class="absolute bottom-0 left-0 h-1 bg-emerald-400" :style="'width: ' + Math.round((rec.scores?.hybrid || 0) * 100) + '%'"></div>
                      </div>
                    </td>

                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        </main>
    </div>

    <!-- XAI Modal dari design siredo-v3.2 -->
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

.animate-in-zoom {
  animation: zoom-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/*  Pipeline Log content (Legacy Styling)  */
.plog-body { display: flex; flex-direction: column; gap: 0.75rem; }
.plog-wait { font-size: 0.8rem; color: #6b7280; padding: 0.25rem 0; }
.plog-block { display: flex; flex-direction: column; gap: 0.4rem; }
.plog-block--fuchsia { background: #fdf4ff; border: 1px solid #f0abfc; border-radius: 8px; padding: 0.65rem 0.85rem; }
.plog-block-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #6b7280; display: flex; align-items: center; gap: 0.5rem; }
.plog-label--gray { color: #6b7280; }
.plog-label--red { color: #ef4444; }
.plog-label--blue { color: #3b82f6; }
.plog-label--fuchsia { color: #d946ef; }
.plog-count { font-weight: 400; font-size: 0.65rem; color: #6b7280; }
.plog-code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.78rem; background: #f3f4f6; border: 1px solid #e5e7eb; word-break: break-all; line-height: 1.5; color: #111827; }
.plog-code--fuchsia { background: white; border-color: #f0abfc; color: #7e22ce; }
.plog-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
.plog-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.plog-tag { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; border: 1px solid; }
.plog-tag--gray { background: #f3f4f6; border-color: #e5e7eb; color: #374151; }
.plog-tag--red { background: #fee2e2; border-color: #fecaca; color: #ef4444; }
.plog-tag--blue { background: #dbeafe; border-color: #bfdbfe; color: #3b82f6; }
.plog-tag--amber { background: #fef3c7; border-color: #fde68a; color: #f59e0b; }
.plog-tag--amber.plog-tag--bold { font-weight: 700; }
.plog-tag--green { background: #d1fae5; border-color: #a7f3d0; color: #10b981; }
.plog-footer { font-size: 0.72rem; color: #6b7280; text-align: right; font-family: ui-monospace, SFMono-Regular, monospace; }
.plog-footer strong { color: #10b981; }
.plog-section-title { font-size: 0.78rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
.plog-expand-list { display: flex; flex-direction: column; gap: 0.5rem; }
.plog-expand-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.5rem 0.75rem; }
.plog-arrow { font-size: 0.8rem; color: #d1d5db; }
.plog-empty-msg { text-align: center; padding: 1rem; }
.plog-empty-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
.plog-empty-msg p { font-size: 0.8rem; color: #6b7280; margin: 0 0 0.25rem; }
.plog-empty-sub { font-size: 0.72rem !important; }
.plog-info-row { font-size: 0.8rem; color: #374151; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.6rem 0.85rem; }
.plog-info-row strong { color: #d946ef; }
.plog-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
.plog-stats-row--3 { grid-template-columns: 1fr 1fr 1fr; }
.plog-stat { border: 1px solid; border-radius: 8px; padding: 0.65rem; text-align: center; }
.plog-stat--blue { background: #dbeafe; border-color: #bfdbfe; }
.plog-stat--fuchsia { background: #fae8ff; border-color: #f5d0fe; }
.plog-stat--gray { background: #f9fafb; border-color: #e5e7eb; }
.plog-stat--green { background: #d1fae5; border-color: #a7f3d0; }
.plog-stat-val { font-size: 1.25rem; font-weight: 800; }
.plog-stat--blue .plog-stat-val { color: #3b82f6; }
.plog-stat--fuchsia .plog-stat-val { color: #d946ef; }
.plog-stat--gray .plog-stat-val { color: #6b7280; }
.plog-stat--green .plog-stat-val { color: #10b981; }
.plog-stat-lbl { font-size: 0.68rem; color: #6b7280; margin-top: 2px; }
.plog-ranklist { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.plog-ranklist-header { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; padding: 0.5rem 0.75rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
.plog-rankrow { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; }
.plog-rankrow:last-child { border-bottom: none; }
.plog-rank-num { font-size: 0.72rem; font-weight: 700; color: #6b7280; width: 14px; text-align: center; flex-shrink: 0; }
.plog-rank-name { font-size: 0.82rem; font-weight: 500; color: #111827; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.plog-score-bar { width: 64px; height: 5px; background: #f3f4f6; border-radius: 99px; overflow: hidden; flex-shrink: 0; }
.plog-score-fill { height: 100%; border-radius: 99px; }
.plog-score-fill--blue { background: #3b82f6; }
.plog-score-fill--fuchsia { background: #d946ef; }
.plog-score-val { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.75rem; font-weight: 700; width: 46px; text-align: right; flex-shrink: 0; }
.plog-score-val--blue { color: #3b82f6; }
.plog-score-val--fuchsia { color: #d946ef; }
.plog-formula { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.85rem; background: #0f0f14; color: #e4e4f0; text-align: center; border-radius: 8px; padding: 8px; }
.plog-formula-blue { color: #60a5fa; font-weight: 700; }
.plog-formula-fuchsia { color: #e879f9; font-weight: 700; }
.plog-formula-brand { color: #a78bfa; font-weight: 700; }
.plog-mode-badge { font-size: 0.8rem; font-weight: 600; padding: 0.5rem 0.85rem; text-align: center; border-radius: 8px; border: 1px solid; }
.plog-mode--blue { background: #dbeafe; border-color: #bfdbfe; color: #3b82f6; }
.plog-mode--fuchsia { background: #fae8ff; border-color: #f5d0fe; color: #d946ef; }
.plog-mode--manual { background: #f3f4f6; border-color: #d1d5db; color: #111827; }
</style>





