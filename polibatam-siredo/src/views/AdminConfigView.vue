<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../services/api'

const loading = ref(true)
const saving = ref(false)
const resetting = ref(false)
const simulating = ref(false)
const saveSuccess = ref(false)
const errorMessage = ref('')
const activeTab = ref('hybrid') // 'hybrid' | 'corpus' | 'bm25' | 'sandbox'

// Configuration state
const config = reactive({
  threshold: 0.3,
  adaptive_alpha_threshold: 15,
  is_adaptive: true,
  manual_alpha: 0.7,
  weight_keahlian: 5,
  weight_publikasi: 2,
  weight_bimbingan: 1,
  weight_pengujian: 1,
  bm25_k1: 1.5,
  bm25_b: 0.75,
  adaptive_short_alpha: 0.70,
  adaptive_long_alpha: 0.35,
  strict_prodi: false,
  top_k: 5
})

// Sandbox state
const sandbox = reactive({
  judul: 'Klasifikasi Keluhan Pelanggan Menggunakan IndoBERT dan Ekstraksi Fitur Leksikal',
  abstrak: 'Penelitian ini membandingkan kinerja model transformer IndoBERT dengan arsitektur LSTM untuk klasifikasi opini dan keluhan pelanggan berbahasa Indonesia. Evaluasi menggunakan metrik precision, recall, dan f1-score.',
  k_rank: 5
})

const simulationResult = ref(null)

const presets = [
  {
    label: 'NLP & IndoBERT',
    judul: 'Klasifikasi Keluhan Pelanggan Menggunakan IndoBERT dan Ekstraksi Fitur Leksikal',
    abstrak: 'Penelitian ini membandingkan kinerja model transformer IndoBERT dengan arsitektur LSTM untuk klasifikasi opini dan keluhan pelanggan berbahasa Indonesia.'
  },
  {
    label: 'Computer Vision YOLO',
    judul: 'Deteksi Cacat Pengelasan Logam Otomatis Berbasis YOLOv8 Nano',
    abstrak: 'Implementasi deep learning computer vision menggunakan algoritma YOLOv8 untuk mendeteksi retak dan porositas pada sambungan las industri galangan kapal.'
  },
  {
    label: 'IoT & ESP32 Sensor',
    judul: 'Sistem Monitoring Kualitas Udara Ruang Server Menggunakan ESP32 dan MQTT',
    abstrak: 'Rancang bangun perangkat Internet of Things terdistribusi untuk memantau suhu, kelembaban, dan partikulat debu secara real-time melalui dashboard grafis.'
  }
]

const loadConfig = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/system/config')
    if (res.data?.data) {
      Object.assign(config, res.data.data)
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Gagal memuat konfigurasi dari server.'
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  saveSuccess.value = false
  errorMessage.value = ''
  try {
    const res = await api.patch('/system/config', config)
    if (res.data?.data) {
      Object.assign(config, res.data.data)
      saveSuccess.value = true
      setTimeout(() => { saveSuccess.value = false }, 3000)
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Gagal menyimpan konfigurasi.'
  } finally {
    saving.value = false
  }
}

const resetConfig = async () => {
  if (!confirm('Kembalikan seluruh parameter konfigurasi NLP ke setelan awal default?')) {
    return
  }
  resetting.value = true
  errorMessage.value = ''
  try {
    const res = await api.post('/system/config/reset')
    if (res.data?.data) {
      Object.assign(config, res.data.data)
      saveSuccess.value = true
      setTimeout(() => { saveSuccess.value = false }, 3000)
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Gagal mereset konfigurasi.'
  } finally {
    resetting.value = false
  }
}

const runSimulation = async () => {
  if (!sandbox.judul && !sandbox.abstrak) {
    alert('Judul atau abstrak harus diisi untuk simulasi.')
    return
  }
  simulating.value = true
  errorMessage.value = ''
  try {
    const res = await api.post('/system/config/simulate', {
      judul: sandbox.judul,
      abstrak: sandbox.abstrak,
      k_rank: sandbox.k_rank,
      draft_config: { ...config }
    })
    simulationResult.value = res.data?.data || null
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Gagal menjalankan simulasi sandbox.'
  } finally {
    simulating.value = false
  }
}

const applyPreset = (preset) => {
  sandbox.judul = preset.judul
  sandbox.abstrak = preset.abstrak
  if (simulationResult.value) {
    runSimulation()
  }
}

// Comparison between current and simulated
const comparisonRows = computed(() => {
  if (!simulationResult.value?.simulated?.recommendations) return []
  const simRecs = simulationResult.value.simulated.recommendations
  const curRecs = simulationResult.value.current?.recommendations || []
  
  const curRankMap = new Map()
  curRecs.forEach((r, idx) => {
    curRankMap.set(r.dosen?.nama, { rank: idx + 1, score: r.scores?.hybrid || 0 })
  })
  
  return simRecs.map((r, idx) => {
    const simRank = idx + 1
    const simScore = r.scores?.hybrid || 0
    const curInfo = curRankMap.get(r.dosen?.nama)
    
    let rankDiff = 0
    let scoreDiff = 0
    let status = 'NEW'
    
    if (curInfo) {
      rankDiff = curInfo.rank - simRank
      scoreDiff = simScore - curInfo.score
      status = rankDiff > 0 ? 'UP' : (rankDiff < 0 ? 'DOWN' : 'SAME')
    }
    
    return {
      nama: r.dosen?.nama,
      keahlian: r.dosen?.bidang_keahlian,
      prodi: r.dosen?.program_studi,
      simRank,
      simScore,
      curRank: curInfo ? curInfo.rank : '-',
      curScore: curInfo ? curInfo.score : 0,
      rankDiff,
      scoreDiff,
      status
    }
  })
})

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-sans">Konfigurasi NLP Engine</h1>
        <p class="text-sm text-gray-600 mt-1">
          Pengaturan bobot skoring hibrida dan parameter indeks korpus dosen.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="resetConfig"
          :disabled="resetting || loading"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          {{ resetting ? 'Mereset...' : 'Reset Default' }}
        </button>

        <button
          @click="saveConfig"
          :disabled="saving || loading"
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded hover:bg-teal-800 transition-colors disabled:opacity-50 shadow-sm"
        >
          <svg v-if="!saving" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <svg v-else class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </div>

    <!-- Feedback Notice -->
    <div v-if="saveSuccess" class="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
      <span>Konfigurasi berhasil disimpan dan aktif di server.</span>
      <button @click="saveSuccess = false" class="text-emerald-700 hover:text-emerald-900 font-bold">&times;</button>
    </div>

    <div v-if="errorMessage" class="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = ''" class="text-rose-700 hover:text-rose-900 font-bold">&times;</button>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-1 border-b border-gray-200">
      <button
        @click="activeTab = 'hybrid'"
        class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors"
        :class="activeTab === 'hybrid' ? 'border-teal-700 text-teal-800' : 'border-transparent text-gray-600 hover:text-gray-900'"
      >
        Skoring Hibrida
      </button>

      <button
        @click="activeTab = 'corpus'"
        class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors"
        :class="activeTab === 'corpus' ? 'border-teal-700 text-teal-800' : 'border-transparent text-gray-600 hover:text-gray-900'"
      >
        Bobot Profil Korpus
      </button>

      <button
        @click="activeTab = 'bm25'"
        class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors"
        :class="activeTab === 'bm25' ? 'border-teal-700 text-teal-800' : 'border-transparent text-gray-600 hover:text-gray-900'"
      >
        Parameter BM25 & Prodi
      </button>

      <button
        @click="activeTab = 'sandbox'"
        class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors"
        :class="activeTab === 'sandbox' ? 'border-teal-700 text-teal-800' : 'border-transparent text-gray-600 hover:text-gray-900'"
      >
        Simulasi (Sandbox)
      </button>
    </div>

    <!-- TAB 1: SKORING HIBRIDA -->
    <div v-if="activeTab === 'hybrid'" class="space-y-6">
      <div class="bg-white border border-gray-200 rounded p-6 shadow-sm space-y-6">
        <div>
          <h2 class="text-sm font-bold text-gray-900">Metode Skoring Hibrida</h2>
          <p class="text-xs text-gray-600 mt-0.5">
            Pilih metode kalkulasi skor kombinasi antara kata kunci (BM25) dan semantik (SBERT).
          </p>
        </div>

        <!-- Segmented Mode Control (No nested cards) -->
        <div class="flex items-center p-1 bg-gray-100 rounded max-w-md">
          <button
            type="button"
            @click="config.is_adaptive = true"
            class="flex-1 py-1.5 text-xs font-semibold rounded transition-colors text-center"
            :class="config.is_adaptive ? 'bg-white text-teal-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            Mode Adaptif Otomatis
          </button>
          <button
            type="button"
            @click="config.is_adaptive = false"
            class="flex-1 py-1.5 text-xs font-semibold rounded transition-colors text-center"
            :class="!config.is_adaptive ? 'bg-white text-teal-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
          >
            Mode Manual Tetap
          </button>
        </div>

        <!-- Divided List for Sliders (No card soup) -->
        <div class="divide-y divide-gray-100 border-t border-gray-100 pt-4 space-y-5">
          <!-- Adaptive Settings -->
          <div v-if="config.is_adaptive" class="space-y-4 pt-2">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div class="max-w-md">
                <span class="text-xs font-semibold text-gray-900">Ambang Batas Kata (Threshold)</span>
                <p class="text-[11px] text-gray-500">Query di bawah nilai ini dianggap judul pendek, di atasnya dianggap abstrak lengkap.</p>
              </div>
              <div class="flex items-center gap-3 w-full sm:w-64">
                <input
                  type="range"
                  v-model.number="config.adaptive_alpha_threshold"
                  min="5"
                  max="30"
                  step="1"
                  class="w-full accent-teal-700"
                />
                <span class="text-xs font-mono font-bold text-teal-800 w-16 text-right tabular-nums">
                  {{ config.adaptive_alpha_threshold }} kata
                </span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div class="max-w-md">
                <span class="text-xs font-semibold text-gray-900">Bobot BM25 Query Pendek (&alpha;)</span>
                <p class="text-[11px] text-gray-500">Proporsi kata kunci leksikal saat proposal berupa judul singkat.</p>
              </div>
              <div class="flex items-center gap-3 w-full sm:w-64">
                <input
                  type="range"
                  v-model.number="config.adaptive_short_alpha"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  class="w-full accent-teal-700"
                />
                <span class="text-xs font-mono font-bold text-teal-800 w-16 text-right tabular-nums">
                  {{ Math.round(config.adaptive_short_alpha * 100) }}%
                </span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div class="max-w-md">
                <span class="text-xs font-semibold text-gray-900">Bobot BM25 Query Panjang (&alpha;)</span>
                <p class="text-[11px] text-gray-500">Proporsi kata kunci leksikal saat proposal berupa abstrak panjang.</p>
              </div>
              <div class="flex items-center gap-3 w-full sm:w-64">
                <input
                  type="range"
                  v-model.number="config.adaptive_long_alpha"
                  min="0.10"
                  max="0.60"
                  step="0.05"
                  class="w-full accent-teal-700"
                />
                <span class="text-xs font-mono font-bold text-teal-800 w-16 text-right tabular-nums">
                  {{ Math.round(config.adaptive_long_alpha * 100) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Manual Setting -->
          <div v-else class="space-y-4 pt-2">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div class="max-w-md">
                <span class="text-xs font-semibold text-gray-900">Rasio Bobot BM25 vs SBERT</span>
                <p class="text-[11px] text-gray-500">Kombinasi tetap yang berlaku untuk seluruh pencarian.</p>
              </div>
              <div class="flex items-center gap-3 w-full sm:w-64">
                <input
                  type="range"
                  v-model.number="config.manual_alpha"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  class="w-full accent-teal-700"
                />
                <span class="text-xs font-mono font-bold text-teal-800 w-24 text-right tabular-nums">
                  {{ Math.round(config.manual_alpha * 100) }}% : {{ Math.round((1 - config.manual_alpha) * 100) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Cutoff Threshold -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
            <div class="max-w-md">
              <span class="text-xs font-semibold text-gray-900">Ambang Batas Skor Minimal</span>
              <p class="text-[11px] text-gray-500">Dosen dengan skor kecocokan di bawah nilai ini tidak ditampilkan.</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-64">
              <input
                type="range"
                v-model.number="config.threshold"
                min="0.0"
                max="0.80"
                step="0.05"
                class="w-full accent-teal-700"
              />
              <span class="text-xs font-mono font-bold text-teal-800 w-16 text-right tabular-nums">
                {{ config.threshold.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Top-K -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
            <div class="max-w-md">
              <span class="text-xs font-semibold text-gray-900">Jumlah Rekomendasi Default</span>
              <p class="text-[11px] text-gray-500">Banyaknya kandidat dosen yang ditampilkan jika tidak ditentukan.</p>
            </div>
            <div class="w-full sm:w-64">
              <select
                v-model.number="config.top_k"
                class="w-full px-3 py-1.5 text-xs rounded border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option :value="3">Top 3 Dosen</option>
                <option :value="5">Top 5 Dosen (Standar)</option>
                <option :value="8">Top 8 Dosen</option>
                <option :value="10">Top 10 Dosen</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: BOBOT PROFIL KORPUS -->
    <div v-if="activeTab === 'corpus'" class="space-y-6">
      <div class="bg-white border border-gray-200 rounded p-6 shadow-sm space-y-6">
        <div>
          <h2 class="text-sm font-bold text-gray-900">Pembobotan Kolom Profil Korpus Dosen</h2>
          <p class="text-xs text-gray-600 mt-0.5">
            Tentukan bobot pengaruh setiap bagian rekam jejak dosen saat sistem membangun korpus leksikal.
          </p>
        </div>

        <div class="divide-y divide-gray-100 border-t border-gray-100 pt-2 space-y-4">
          <!-- Keahlian -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3">
            <div class="max-w-md">
              <span class="text-xs font-semibold text-gray-900">Bidang Keahlian Pokok</span>
              <p class="text-[11px] text-gray-500">Pengali frekuensi kata kunci keahlian utama dosen.</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-64">
              <input
                type="range"
                v-model.number="config.weight_keahlian"
                min="1"
                max="10"
                step="1"
                class="w-full accent-teal-700"
              />
              <span class="text-xs font-mono font-bold text-teal-800 w-12 text-right tabular-nums">
                {{ config.weight_keahlian }}x
              </span>
            </div>
          </div>

          <!-- Publikasi -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
            <div class="max-w-md">
              <span class="text-xs font-semibold text-gray-900">Judul Publikasi & Jurnal</span>
              <p class="text-[11px] text-gray-500">Pengali judul artikel riset ilmiah yang pernah diterbitkan.</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-64">
              <input
                type="range"
                v-model.number="config.weight_publikasi"
                min="0"
                max="5"
                step="1"
                class="w-full accent-teal-700"
              />
              <span class="text-xs font-mono font-bold text-teal-800 w-12 text-right tabular-nums">
                {{ config.weight_publikasi }}x
              </span>
            </div>
          </div>

          <!-- Bimbingan -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
            <div class="max-w-md">
              <span class="text-xs font-semibold text-gray-900">Riwayat Judul Bimbingan</span>
              <p class="text-[11px] text-gray-500">Pengali riwayat judul tugas akhir yang pernah dibimbing.</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-64">
              <input
                type="range"
                v-model.number="config.weight_bimbingan"
                min="0"
                max="4"
                step="1"
                class="w-full accent-teal-700"
              />
              <span class="text-xs font-mono font-bold text-teal-800 w-12 text-right tabular-nums">
                {{ config.weight_bimbingan }}x
              </span>
            </div>
          </div>

          <!-- Pengujian -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
            <div class="max-w-md">
              <span class="text-xs font-semibold text-gray-900">Riwayat Judul Pengujian Sidang</span>
              <p class="text-[11px] text-gray-500">Pengali riwayat judul sidang tugas akhir yang pernah diuji.</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-64">
              <input
                type="range"
                v-model.number="config.weight_pengujian"
                min="0"
                max="4"
                step="1"
                class="w-full accent-teal-700"
              />
              <span class="text-xs font-mono font-bold text-teal-800 w-12 text-right tabular-nums">
                {{ config.weight_pengujian }}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: BM25 PARAMETERS & PRODI -->
    <div v-if="activeTab === 'bm25'" class="space-y-6">
      <div class="bg-white border border-gray-200 rounded p-6 shadow-sm space-y-6">
        <div>
          <h2 class="text-sm font-bold text-gray-900">Parameter BM25 & Aturan Akademik</h2>
          <p class="text-xs text-gray-600 mt-0.5">
            Konfigurasi parameter Okapi BM25 dan aturan penyaringan program studi.
          </p>
        </div>

        <div class="divide-y divide-gray-100 border-t border-gray-100 pt-2 space-y-4">
          <!-- BM25 k1 -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3">
            <div class="max-w-md">
              <span class="text-xs font-semibold text-gray-900">Parameter k1 (Term Saturation)</span>
              <p class="text-[11px] text-gray-500">Sensitivitas terhadap pengulangan kata kunci yang sama (default: 1.50).</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-64">
              <input
                type="range"
                v-model.number="config.bm25_k1"
                min="0.5"
                max="3.0"
                step="0.1"
                class="w-full accent-teal-700"
              />
              <span class="text-xs font-mono font-bold text-teal-800 w-12 text-right tabular-nums">
                {{ config.bm25_k1.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- BM25 b -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
            <div class="max-w-md">
              <span class="text-xs font-semibold text-gray-900">Parameter b (Length Normalization)</span>
              <p class="text-[11px] text-gray-500">Penalti untuk profil dosen dengan korpus teks panjang (default: 0.75).</p>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-64">
              <input
                type="range"
                v-model.number="config.bm25_b"
                min="0.0"
                max="1.0"
                step="0.05"
                class="w-full accent-teal-700"
              />
              <span class="text-xs font-mono font-bold text-teal-800 w-12 text-right tabular-nums">
                {{ config.bm25_b.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Strict Prodi -->
          <div class="flex items-center justify-between gap-4 pt-4">
            <div class="max-w-md">
              <label for="strict_prodi" class="text-xs font-semibold text-gray-900 cursor-pointer">
                Penyaringan Program Studi Ketat
              </label>
              <p class="text-[11px] text-gray-500">
                Hanya tampilkan dosen yang memiliki program studi sama persis dengan mahasiswa.
              </p>
            </div>
            <input
              type="checkbox"
              id="strict_prodi"
              v-model="config.strict_prodi"
              class="h-4 w-4 rounded text-teal-700 focus:ring-teal-600 border-gray-300"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: SIMULASI (SANDBOX) -->
    <div v-if="activeTab === 'sandbox'" class="space-y-6">
      <div class="bg-white border border-gray-200 rounded p-6 shadow-sm space-y-5">
        <div>
          <h2 class="text-sm font-bold text-gray-900">Simulasi Parameter Draf</h2>
          <p class="text-xs text-gray-600 mt-0.5">
            Uji coba draf proposal untuk membandingkan peringkat dosen secara langsung sebelum disimpan ke database.
          </p>
        </div>

        <!-- Presets -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-gray-500">Contoh Cepat:</span>
          <button
            v-for="p in presets"
            :key="p.label"
            @click="applyPreset(p)"
            type="button"
            class="px-2.5 py-1 text-xs rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
          >
            {{ p.label }}
          </button>
        </div>

        <!-- Inputs -->
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Judul Proposal</label>
            <input
              type="text"
              v-model="sandbox.judul"
              class="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-700 text-gray-900"
              placeholder="Masukkan judul pengujian..."
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Abstrak Proposal</label>
            <textarea
              v-model="sandbox.abstrak"
              rows="3"
              class="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-700 text-gray-900"
              placeholder="Masukkan abstrak pengujian..."
            ></textarea>
          </div>

          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <span>Jumlah Dosen:</span>
              <select v-model.number="sandbox.k_rank" class="px-2 py-1 text-xs rounded border border-gray-300 bg-white">
                <option :value="3">3 Dosen</option>
                <option :value="5">5 Dosen</option>
                <option :value="8">8 Dosen</option>
              </select>
            </div>

            <button
              @click="runSimulation"
              :disabled="simulating"
              type="button"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              <svg v-if="!simulating" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
              <svg v-else class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
              {{ simulating ? 'Menghitung...' : 'Uji Draf Sekarang' }}
            </button>
          </div>
        </div>

        <!-- Simulation Comparison Results -->
        <div v-if="comparisonRows.length > 0" class="pt-4 border-t border-gray-200 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-gray-900">
              Perbandingan Peringkat (Aktif vs Draf Simulasi)
            </h3>
            <span class="text-[11px] text-gray-500 font-mono">
              {{ comparisonRows.length }} Kandidat
            </span>
          </div>

          <div class="overflow-x-auto border border-gray-200 rounded">
            <table class="min-w-full divide-y divide-gray-200 text-xs">
              <thead class="bg-gray-50 text-gray-700 font-semibold font-mono text-[11px]">
                <tr>
                  <th class="px-3 py-2 text-left">Draf</th>
                  <th class="px-3 py-2 text-left">Nama Dosen & Keahlian</th>
                  <th class="px-3 py-2 text-left">Prodi</th>
                  <th class="px-3 py-2 text-center">Skor Draf</th>
                  <th class="px-3 py-2 text-center">Peringkat Semula</th>
                  <th class="px-3 py-2 text-center">Perubahan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="row in comparisonRows" :key="row.nama" class="hover:bg-slate-50/70">
                  <td class="px-3 py-2 font-bold font-mono text-gray-900">
                    #{{ row.simRank }}
                  </td>
                  <td class="px-3 py-2">
                    <div class="font-semibold text-gray-900">{{ row.nama }}</div>
                    <div class="text-[11px] text-gray-500 truncate max-w-xs">{{ row.keahlian }}</div>
                  </td>
                  <td class="px-3 py-2 text-gray-600">
                    {{ row.prodi }}
                  </td>
                  <td class="px-3 py-2 text-center font-mono font-bold text-teal-800 tabular-nums">
                    {{ (row.simScore * 100).toFixed(1) }}%
                  </td>
                  <td class="px-3 py-2 text-center font-mono text-gray-600">
                    {{ row.curRank !== '-' ? '#' + row.curRank : '-' }}
                  </td>
                  <td class="px-3 py-2 text-center">
                    <span
                      v-if="row.status === 'UP'"
                      class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      &uarr; +{{ row.rankDiff }} Naik
                    </span>
                    <span
                      v-else-if="row.status === 'DOWN'"
                      class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-50 text-rose-800 border border-rose-200"
                    >
                      &darr; {{ row.rankDiff }} Turun
                    </span>
                    <span
                      v-else-if="row.status === 'SAME'"
                      class="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-200"
                    >
                      Tetap
                    </span>
                    <span
                      v-else
                      class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-800 border border-blue-200"
                    >
                      Baru Masuk
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
