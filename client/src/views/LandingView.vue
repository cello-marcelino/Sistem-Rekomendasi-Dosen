<template>
  <div class="relative min-h-screen bg-ambient-mesh">
    <!-- 1. Top Navigation Bar -->
    <Navbar />

    <!-- 2. Sided Hero Section -->
    <section id="hero" class="relative pt-8 pb-16 sm:pt-12 sm:pb-24 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <!-- LEFT COLUMN: Value Proposition & System Identity -->
          <div class="lg:col-span-6 space-y-6 lg:pt-4">
            <!-- Micro-Badge: System Philosophy (NO version badge) -->
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 border border-slate-200 text-slate-800">
              <span class="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              <span>Sistem Rekomendasi Akademik Cerdas</span>
            </div>

            <!-- Main Headline -->
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Pencocokan Tepat <br class="hidden sm:inline" />
              <span class="text-teal-700">Dosen Pembimbing</span> <br class="hidden sm:inline" />
              Berdasarkan Analisis Topik
            </h1>

            <!-- Subtitle -->
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Memadukan pendekatan leksikal dan kecocokan semantik untuk menemukan dosen pembimbing tugas akhir yang paling relevan dengan arah penelitian mahasiswa secara objektif dan akurat.
            </p>

            <!-- 3 Core Value Items (Flowbite Outline Icons) -->
            <div class="space-y-3 pt-2">
              <div class="flex items-start gap-3">
                <div class="mt-0.5 p-1 rounded-md bg-teal-50 border border-teal-200/80 text-teal-800 shrink-0">
                  <IconCheckCircle customClass="w-4 h-4" />
                </div>
                <div>
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900">Pencocokan Tepat Istilah & Konteks</h2>
                  <p class="text-xs text-slate-500">Evaluasi ganda pada akronim teknis, kata kunci spesifik, serta konteks kalimat abstrak penelitian.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="mt-0.5 p-1 rounded-md bg-teal-50 border border-teal-200/80 text-teal-800 shrink-0">
                  <IconClock customClass="w-4 h-4" />
                </div>
                <div>
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900">Efisiensi Penentuan Topik</h2>
                  <p class="text-xs text-slate-500">Menghilangkan ketidakpastian pengajuan judul dengan rekomendasi instan berbobot proporsional.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="mt-0.5 p-1 rounded-md bg-teal-50 border border-teal-200/80 text-teal-800 shrink-0">
                  <IconCpuChip customClass="w-4 h-4" />
                </div>
                <div>
                  <h2 class="text-xs sm:text-sm font-bold text-slate-900">Transparansi Irisan Kata Kunci</h2>
                  <p class="text-xs text-slate-500">Setiap hasil rekomendasi menyajikan irisan istilah kepakaran yang mendasari perhitungan skor.</p>
                </div>
              </div>
            </div>

            <!-- Live Institutional Counter (High Contrast Tabular) -->
            <div class="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-4">
              <div>
                <div class="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900">86</div>
                <div class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Dosen Aktif</div>
              </div>
              <div>
                <div class="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900">350+</div>
                <div class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Publikasi Riset</div>
              </div>
              <div>
                <div class="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900">2.6k+</div>
                <div class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Riwayat Bimbingan</div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Interactive Single Recommendation Widget -->
          <div id="rekomendasi" class="lg:col-span-6">
            <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-none space-y-5">
              
              <div class="border-b border-slate-100 pb-3">
                <div class="flex items-center justify-between">
                  <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <IconSearch customClass="w-5 h-5 text-teal-700" />
                    <span>Simulasi Rekomendasi Dosen</span>
                  </h2>
                  <span class="text-xs font-mono text-slate-400">Input Mandiri</span>
                </div>
                <p class="text-xs text-slate-500 mt-1">
                  Ketikkan rencana judul dan abstrak tugas akhir Anda untuk melihat kandidat dosen yang memiliki keselarasan kepakaran.
                </p>
              </div>

              <!-- Quick Topic Example Fillers (1-Click Fill) -->
              <div class="space-y-1.5">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gunakan Contoh Topik:</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    v-for="(sample, idx) in sampleTopics"
                    :key="idx"
                    @click="applySampleTopic(sample)"
                    class="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-900 transition-colors cursor-pointer text-left font-medium"
                  >
                    {{ sample.label }}
                  </button>
                </div>
              </div>

              <!-- Input Form -->
              <form @submit.prevent="handleSearch" class="space-y-4">
                <!-- Judul Input -->
                <div class="space-y-1">
                  <label for="judul" class="block text-xs font-semibold text-slate-700">
                    Judul Proyek / Tugas Akhir
                  </label>
                  <input
                    id="judul"
                    v-model="form.judul"
                    type="text"
                    required
                    placeholder="Contoh: Implementasi Deep Learning untuk Klasifikasi Citra Medis"
                    class="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 transition-colors"
                  />
                </div>

                <!-- Abstrak Input -->
                <div class="space-y-1">
                  <label for="abstrak" class="block text-xs font-semibold text-slate-700">
                    Abstrak / Uraian Rencana Penelitian
                  </label>
                  <textarea
                    id="abstrak"
                    v-model="form.abstrak"
                    rows="4"
                    required
                    placeholder="Jelaskan latar belakang, metode yang diajukan, dataset, dan tujuan utama penelitian secara ringkas..."
                    class="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 transition-colors resize-y"
                  ></textarea>
                </div>

                <!-- Action Button -->
                <div class="pt-1">
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <template v-if="isLoading">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Menganalisis Kecocokan Dosen...</span>
                    </template>
                    <template v-else>
                      <IconSearch customClass="w-4 h-4" />
                      <span>Analisis & Rekomendasikan Dosen</span>
                    </template>
                  </button>
                </div>
              </form>

              <!-- Error Alert -->
              <div v-if="errorMessage" class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {{ errorMessage }}
              </div>

              <!-- Empty Results Notice -->
              <div v-if="results && results.length === 0" class="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 text-xs space-y-1">
                <div class="font-bold">Tidak Ada Dosen yang Memenuhi Ambang Batas</div>
                <p class="text-amber-800 leading-relaxed">
                  Tidak ditemukan dosen dengan irisan kata kunci yang memenuhi skor minimum untuk topik ini. Silakan tambahkan istilah teknis atau bidang keahlian pada judul/abstrak Anda.
                </p>
              </div>

              <!-- Recommendation Results Area -->
              <div v-if="results && results.length > 0" class="pt-4 border-t border-slate-100 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Hasil Rekomendasi Teratas:</span>
                  <span class="text-xs font-mono text-teal-800 font-semibold">{{ results.length }} Dosen Cocok</span>
                </div>

                <!-- Result Cards List -->
                <div class="space-y-3">
                  <div
                    v-for="(dosen, index) in results"
                    :key="dosen.id || index"
                    class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                            {{ index + 1 }}
                          </span>
                          <h3 class="text-sm font-bold text-slate-900">{{ dosen.nama }}</h3>
                        </div>
                        <div class="text-xs text-slate-500 font-mono mt-0.5">
                          NIDN: {{ dosen.nidn || '-' }} · {{ dosen.program_studi }}
                        </div>
                      </div>

                      <!-- Skor Kecocokan -->
                      <div class="text-right shrink-0">
                        <div class="text-xs font-mono font-bold text-teal-800">
                          {{ Math.round((dosen.skor_akhir || dosen.skor || 0) * 100) }}%
                        </div>
                        <div class="text-[10px] text-slate-400 uppercase tracking-tight">Kecocokan</div>
                      </div>
                    </div>

                    <!-- Bidang Keahlian -->
                    <div v-if="dosen.bidang_keahlian" class="text-xs text-slate-700">
                      <span class="text-slate-400 font-medium">Keahlian:</span> {{ dosen.bidang_keahlian }}
                    </div>

                    <!-- Irisan Kata Kunci (NO XAI label) -->
                    <div v-if="dosen.irisan_kata && dosen.irisan_kata.length > 0" class="space-y-1 pt-1">
                      <div class="text-[11px] text-slate-500 font-medium">Irisan Kata Kunci yang Cocok:</div>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="(kata, kIdx) in dosen.irisan_kata.slice(0, 5)"
                          :key="kIdx"
                          class="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-50 border border-teal-200 text-teal-800"
                        >
                          {{ kata }}
                        </span>
                      </div>
                    </div>

                    <!-- CTA Pengajuan Bimbingan -->
                    <div class="pt-2 flex justify-end">
                      <button
                        type="button"
                        @click="handleRequestBimbingan(dosen)"
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white border border-slate-300 hover:border-teal-600 text-slate-800 hover:text-teal-700 transition-colors cursor-pointer"
                      >
                        <IconPaperAirplane customClass="w-3.5 h-3.5 text-teal-700" />
                        <span>Ajukan Rencana Bimbingan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 3. Methodology Section: Dual-Engine Hybrid NLP (Side-by-Side: Diagram | Narasi) -->
    <section id="metodologi" class="py-12 sm:py-16 bg-white border-y border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        <!-- Section Header -->
        <div class="text-center max-w-2xl mx-auto space-y-1.5">
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Metodologi Dual-Engine Ilmiah
          </h2>
          <p class="text-xs sm:text-sm text-slate-500">
            Kombinasi Information Retrieval untuk presisi istilah teknis dan kedalaman makna abstrak penelitian.
          </p>
        </div>

        <!-- Side-by-Side Grid: Diagram (Kiri) | Narasi (Kanan) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Sisi Kiri: Diagram Pipeline -->
          <div class="lg:col-span-7 space-y-2">
            <div class="rounded-xl border border-slate-200/90 overflow-hidden bg-slate-50/40 p-2 sm:p-3">
              <img
                :src="diagramImg"
                alt="Diagram Alur BM25, SBERT, dan Hybrid"
                class="w-full h-auto object-contain mx-auto max-h-[280px] sm:max-h-[320px]"
                loading="lazy"
              />
            </div>
          </div>

          <!-- Sisi Kanan: Narasi (Unboxed, Pure Flat, Zero Numbering, Zero Cards) -->
          <div class="lg:col-span-5 space-y-6">
            
            <!-- Pilar 1: Pendekatan Leksikal -->
            <div class="space-y-2">
              <div class="flex items-center gap-1.5 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <IconBookOpen customClass="w-4 h-4 text-teal-700" />
                <span>Pendekatan Leksikal</span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900">
                BM25Okapi & Pemangkasan Mutlak
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                BM25Okapi mengevaluasi kesesuaian kata kunci teknis dan istilah spesifik. Normalisasi Z-Score serta <span class="font-medium text-slate-800">Hard Constraint Pruning</span> mengeliminasi kandidat tanpa irisan kata kunci guna komputasi yang terarah.
              </p>
            </div>

            <!-- Divider Halus Antar Pilar -->
            <div class="border-t border-slate-100"></div>

            <!-- Pilar 2: Pendekatan Semantik -->
            <div class="space-y-2">
              <div class="flex items-center gap-1.5 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <IconCpuChip customClass="w-4 h-4 text-teal-700" />
                <span>Pendekatan Semantik</span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900">
                Sentence-BERT & Pemaknaan Konteks
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sentence-BERT merepresentasikan narasi abstrak ke dalam vektor 768 dimensi. Pengukuran <span class="font-medium text-slate-800">Cosine Similarity</span> mendeteksi keselarasan konteks dan esensi topik meskipun menggunakan variasi kosakata berbeda.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- 4. Three Roles Ecosystem Section -->
    <section id="ekosistem" class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ekosistem Terintegrasi Tiga Peran
          </h2>
          <p class="text-xs sm:text-sm text-slate-500">
            Menghubungkan mahasiswa, dosen pembimbing, dan pimpinan program studi dalam alur kerja tugas akhir yang terstruktur.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Role 1: Mahasiswa -->
          <div class="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
              <IconUserGraduate customClass="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-slate-900">Mahasiswa</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mengeksplorasi kecocokan topik tugas akhir secara mandiri, melihat transparansi irisan kata kunci relevan, dan mengajukan draf permohonan bimbingan secara tepat sasaran.
            </p>
          </div>

          <!-- Role 2: Dosen -->
          <div class="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div class="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
              <IconUsers customClass="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-slate-900">Dosen Pembimbing</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mengakses profil dan portofolio keahlian, mengatur batas kuota mahasiswa bimbingan, serta meninjau dan menerima atau menolak permohonan bimbingan yang masuk.
            </p>
          </div>

          <!-- Role 3: Admin SiReDo -->
          <div class="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div class="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
              <IconShieldCheck customClass="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-slate-900">Administrator</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mengatur konfigurasi parameter pembobotan algoritma, memelihara master data kepakaran dosen, dan menjalankan otomasi penjadwalan sidang tugas akhir bebas bentrok.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Academic Footer -->
    <footer class="py-10 bg-white border-t border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
        <div>
          <div class="text-sm font-bold text-slate-900">SiReDo — Sistem Rekomendasi Dosen</div>
          <div class="text-xs text-slate-500 mt-0.5">
            Dikembangkan oleh Hamdan Azmi (3312411004) & Chritsian Marcelino Sinaga (3312411008)
          </div>
        </div>
        <div class="text-xs text-slate-400">
          Hak Cipta Terpelihara &copy; 2026 Jurusan Teknik Informatika Polibatam.
        </div>
      </div>
    </footer>

    <!-- Informational Modal for Bimbingan Request in Demo Mode -->
    <div
      v-if="activeBimbinganModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div class="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <IconPaperAirplane customClass="w-5 h-5 text-teal-700" />
            <h3 class="text-base font-bold text-slate-900">Pengajuan Bimbingan</h3>
          </div>
          <button
            @click="activeBimbinganModal = null"
            class="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Anda akan mengajukan bimbingan kepada <strong class="text-slate-900">{{ activeBimbinganModal.nama }}</strong> untuk topik penelitian:
        </p>
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-800">
          "{{ form.judul || 'Judul Penelitian Belum Ditentukan' }}"
        </div>

        <p class="text-xs text-slate-500">
          Fitur autentikasi dan pengiriman bimbingan langsung ke akun dosen akan aktif pada rilis portal bimbingan.
        </p>

        <div class="flex justify-end gap-2 pt-2">
          <button
            @click="activeBimbinganModal = null"
            class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Navbar from '../components/Navbar.vue'
import IconSearch from '../components/icons/IconSearch.vue'
import IconBookOpen from '../components/icons/IconBookOpen.vue'
import IconClock from '../components/icons/IconClock.vue'
import IconCheckCircle from '../components/icons/IconCheckCircle.vue'
import IconCpuChip from '../components/icons/IconCpuChip.vue'
import IconUsers from '../components/icons/IconUsers.vue'
import IconUserGraduate from '../components/icons/IconUserGraduate.vue'
import IconShieldCheck from '../components/icons/IconShieldCheck.vue'
import IconPaperAirplane from '../components/icons/IconPaperAirplane.vue'
import { recommendationService } from '../services/api.js'
import diagramImg from '../assets/diagram-alur.png'

// Form State
const form = reactive({
  judul: '',
  abstrak: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const results = ref(null)
const activeBimbinganModal = ref(null)

// 1-Click Sample Topics
const sampleTopics = [
  {
    label: 'Computer Vision YOLO',
    judul: 'Deteksi Pelanggaran Helm Pengendara Motor Menggunakan Algoritma YOLOv8',
    abstrak: 'Penelitian ini mengembangkan sistem deteksi otomatis penggunaan helm pengendara sepeda motor berbasis pengolahan citra dan deep learning. Algoritma YOLOv8 dilatih dengan dataset rekaman CCTV jalan raya untuk mengenali pengendara tanpa helm secara real-time.'
  },
  {
    label: 'NLP IndoBERT',
    judul: 'Analisis Sentimen Opini Publik terhadap Layanan Transportasi Menggunakan IndoBERT',
    abstrak: 'Penelitian ini mengklasifikasikan sentimen pengguna media sosial terhadap efektivitas transportasi publik kota. Model IndoBERT digunakan untuk menangani variasi bahasa gaul dan konteks kalimat bahasa Indonesia dengan akurasi klasifikasi multi-kelas.'
  },
  {
    label: 'IoT Smart Agriculture',
    judul: 'Sistem Monitoring Kelembapan Tanah dan Penyiraman Otomatis Berbasis IoT dan NodeMCU',
    abstrak: 'Membangun purwarupa otomasi penyiraman tanaman dengan memanfaatkan sensor kelembapan tanah, mikrokontroler NodeMCU ESP8266, dan protokol MQTT untuk pemantauan data real-time pada dashboard web.'
  }
]

const applySampleTopic = (sample) => {
  form.judul = sample.judul
  form.abstrak = sample.abstrak
  errorMessage.value = ''
}

const handleSearch = async () => {
  if (!form.judul.trim() || !form.abstrak.trim()) {
    errorMessage.value = 'Harap isi judul dan abstrak penelitian terlebih dahulu.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  results.value = null

  try {
    const res = await recommendationService.getSingleRecommendation({
      judul: form.judul,
      abstrak: form.abstrak,
      k_rank: 5
    })

    if (res.success && res.data) {
      // Backend returns standard envelope: { metadata, pipeline, recommendations: [...] }
      const rawList = res.data.recommendations || res.data.rekomendasi || (Array.isArray(res.data) ? res.data : [])
      
      results.value = rawList.map((item, idx) => {
        const dosenData = item.dosen || item
        const hybridScore = item.scores?.hybrid ?? item.skor_akhir ?? item.skor ?? item.scores?.final ?? 0
        const irisan = item.xai?.irisan_kata || item.irisan_kata || []
        
        return {
          id: dosenData.id || `rec-${idx}`,
          rank: item.rank || idx + 1,
          nama: dosenData.nama || 'Nama Dosen',
          nidn: dosenData.nidn || '-',
          program_studi: dosenData.program_studi || '-',
          bidang_keahlian: dosenData.bidang_keahlian || '',
          skor_akhir: hybridScore,
          scores: item.scores || {},
          irisan_kata: irisan
        }
      })
    } else {
      errorMessage.value = res.message || 'Tidak ada rekomendasi yang ditemukan untuk topik ini.'
    }
  } catch (err) {
    errorMessage.value = err.userMessage || 'Gagal terhubung ke engine rekomendasi. Pastikan server aktif.'
  } finally {
    isLoading.value = false
  }
}

const handleRequestBimbingan = (dosen) => {
  activeBimbinganModal.value = dosen
}
</script>
