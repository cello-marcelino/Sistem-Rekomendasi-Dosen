<template>
  <div class="relative min-h-screen bg-hero-soft">
    <!-- 1. Top Navigation Bar -->
    <Navbar />

    <!-- 2. Side-by-Side Hero Section with NLP Illustration Asset -->
    <section id="hero" class="relative pt-8 pb-14 sm:pt-12 sm:pb-18 overflow-hidden scroll-mt-20">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- LEFT COLUMN: Value Proposition & System Identity (Zero Navigation) -->
          <div class="lg:col-span-7 space-y-6">
            <!-- Main Headline -->
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1E3A6D] leading-[1.15]">
              Pencocokan Tepat <br class="hidden sm:inline" />
              <span class="text-ai-gradient">Dosen Pembimbing</span> <br class="hidden sm:inline" />
              Berdasarkan Analisis Topik
            </h1>

            <!-- Subtitle -->
            <p class="text-sm sm:text-base text-[#5A6A85] leading-relaxed max-w-xl">
              Memadukan pendekatan leksikal dan kecocokan semantik untuk menemukan dosen pembimbing tugas akhir yang paling relevan dengan arah penelitian mahasiswa secara objektif dan akurat.
            </p>

            <!-- Quick Recommendation Search Box & Relocated Navigation Button -->
            <form @submit.prevent="handleQuickRecommendation" class="pt-1">
              <div class="p-1.5 sm:p-2 rounded-2xl bg-white border border-[#CBD5E1] shadow-[0_4px_25px_rgba(30,58,109,0.08)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all focus-within:border-[#4EA8DE] focus-within:ring-3 focus-within:ring-[#4EA8DE]/20">
                <div class="relative flex-1 flex items-center pl-3">
                  <svg class="w-4 h-4 text-[#4EA8DE] shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                  <input
                    v-model="quickJudul"
                    type="text"
                    placeholder="Ketik draf judul tugas akhir (misal: Deteksi Objek YOLOv8)..."
                    class="w-full pl-2.5 pr-3 py-2 text-xs sm:text-sm text-[#0F172A] placeholder:text-[#5A6A85] placeholder:opacity-50 bg-transparent focus:outline-none"
                  />
                </div>
                
                <button
                  type="submit"
                  class="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#1E3A6D] hover:bg-[#15294E] text-white transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
                >
                  <svg class="w-4 h-4 text-[#4EA8DE]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
                  </svg>
                  <span>Cari Rekomendasi Dosen</span>
                </button>
              </div>

              <!-- Secondary Navigation Row -->
              <div class="flex items-center justify-between text-xs text-[#5A6A85] px-1.5 pt-2">
                <span class="text-[11px] sm:text-xs">💡 Evaluasi leksikal & semantik langsung dari judul penelitian.</span>
                <router-link
                  to="/dosen?mode=manual"
                  class="text-[11px] sm:text-xs text-[#1E3A6D] hover:underline font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Jelajahi Direktori Dosen Manual</span>
                  <span>&rarr;</span>
                </router-link>
              </div>
            </form>

            <!-- 3 Core Value Items (Unboxed Editorial List - Versi Lama) -->
            <div class="space-y-3 pt-3 border-t border-[#E2E8F0]">
              <div class="flex items-start gap-3">
                <div class="mt-0.5 p-1 rounded-md bg-[#F5F8FF] border border-[#CBD5E1] text-[#1E3A6D] shrink-0">
                  <IconCheckCircle customClass="w-4 h-4 text-[#1E3A6D]" />
                </div>
                <div>
                  <h2 class="text-xs sm:text-sm font-bold text-[#0F172A]">Pencocokan Tepat Istilah & Konteks</h2>
                  <p class="text-xs text-[#5A6A85] mt-0.5">Evaluasi ganda pada akronim teknis, kata kunci spesifik, serta konteks kalimat abstrak penelitian.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="mt-0.5 p-1 rounded-md bg-[#F5F8FF] border border-[#CBD5E1] text-[#1E3A6D] shrink-0">
                  <IconClock customClass="w-4 h-4 text-[#1E3A6D]" />
                </div>
                <div>
                  <h2 class="text-xs sm:text-sm font-bold text-[#0F172A]">Efisiensi Penentuan Topik</h2>
                  <p class="text-xs text-[#5A6A85] mt-0.5">Menghilangkan ketidakpastian pengajuan judul dengan rekomendasi instan berbobot proporsional.</p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="mt-0.5 p-1 rounded-md bg-[#F5F8FF] border border-[#CBD5E1] text-[#1E3A6D] shrink-0">
                  <IconCpuChip customClass="w-4 h-4 text-[#1E3A6D]" />
                </div>
                <div>
                  <h2 class="text-xs sm:text-sm font-bold text-[#0F172A]">Transparansi Irisan Kata Kunci</h2>
                  <p class="text-xs text-[#5A6A85] mt-0.5">Setiap hasil rekomendasi menyajikan irisan istilah kepakaran yang mendasari perhitungan skor.</p>
                </div>
              </div>
            </div>

            <!-- Live Institutional Counter (High Contrast Tabular) -->
            <div class="pt-4 border-t border-[#E2E8F0] grid grid-cols-3 gap-4">
              <div>
                <div class="text-xl sm:text-2xl font-black font-mono tabular-nums text-[#0F172A]">86</div>
                <div class="text-[11px] uppercase tracking-wider text-[#5A6A85] font-medium">Dosen Aktif</div>
              </div>
              <div>
                <div class="text-xl sm:text-2xl font-black font-mono tabular-nums text-[#0F172A]">350+</div>
                <div class="text-[11px] uppercase tracking-wider text-[#5A6A85] font-medium">Publikasi Riset</div>
              </div>
              <div>
                <div class="text-xl sm:text-2xl font-black font-mono tabular-nums text-[#0F172A]">2.6k+</div>
                <div class="text-[11px] uppercase tracking-wider text-[#5A6A85] font-medium">Riwayat Bimbingan</div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Visual Illustration Asset (Seamless Pure White Container) -->
          <div class="lg:col-span-5 flex items-center justify-center">
            <div class="w-full max-w-lg lg:max-w-none rounded-2xl bg-white p-3 sm:p-5 shadow-[0_4px_20px_rgba(30,58,109,0.06)] border border-[#E2E8F0] transition-all duration-300">
              <img
                :src="heroIllustration"
                alt="Ilustrasi Riset Dosen Hybrid NLP"
                class="w-full h-auto object-contain rounded-xl max-h-[380px] sm:max-h-[440px] lg:max-h-[480px] mx-auto bg-white"
                loading="eager"
              />
              <div class="text-[11px] text-[#5A6A85] text-center font-mono mt-2 pt-2 border-t border-slate-100">
                Pencocokan Topik & Portofolio Dosen
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 3. Methodology Section: Dual-Engine Hybrid NLP (Side-by-Side: Diagram | Narasi) -->
    <section id="metodologi" class="py-12 sm:py-16 bg-white border-y border-[#E2E8F0] scroll-mt-20">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        <!-- Section Header -->
        <div class="text-center max-w-2xl mx-auto space-y-1.5">
          <h2 class="text-xl sm:text-2xl font-extrabold text-[#1E3A6D] tracking-tight">
            Metodologi Dual-Engine Ilmiah
          </h2>
          <p class="text-xs sm:text-sm text-[#5A6A85]">
            Kombinasi Information Retrieval untuk presisi istilah teknis dan kedalaman makna abstrak penelitian.
          </p>
        </div>

        <!-- Side-by-Side Grid: Diagram (Kiri) | Narasi (Kanan) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Sisi Kiri: Diagram Pipeline -->
          <div class="lg:col-span-7 space-y-2">
            <div class="rounded-xl border border-[#E2E8F0] overflow-hidden bg-[#F5F8FF]/50 p-2 sm:p-3">
              <img
                :src="diagramImg"
                alt="Diagram Alur BM25, SBERT, dan Hybrid"
                class="w-full h-auto object-contain mx-auto max-h-[280px] sm:max-h-[320px]"
                loading="lazy"
              />
            </div>
            <div class="text-[11px] text-[#5A6A85] text-center font-mono">
              Diagram Alur BM25 Leksikal, SBERT Semantik, dan Penggabungan Skor
            </div>
          </div>

          <!-- Sisi Kanan: Narasi (Unboxed, Pure Flat, Zero Numbering, Zero Cards) -->
          <div class="lg:col-span-5 space-y-6">
            
            <!-- Pilar 1: Pendekatan Leksikal -->
            <div class="space-y-2">
              <div class="flex items-center gap-1.5 text-[#0369A1] text-xs font-bold uppercase tracking-wider">
                <IconBookOpen customClass="w-4 h-4 text-[#4EA8DE]" />
                <span>Pendekatan Leksikal</span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-[#0F172A]">
                BM25Okapi & Pemangkasan Mutlak
              </h3>
              <p class="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
                BM25Okapi mengevaluasi kesesuaian kata kunci teknis dan istilah spesifik. Normalisasi Z-Score serta <span class="font-medium text-[#0F172A]">Hard Constraint Pruning</span> mengeliminasi kandidat tanpa irisan kata kunci guna komputasi yang terarah.
              </p>
            </div>

            <!-- Divider Halus Antar Pilar -->
            <div class="border-t border-[#E2E8F0]"></div>

            <!-- Pilar 2: Pendekatan Semantik -->
            <div class="space-y-2">
              <div class="flex items-center gap-1.5 text-[#5B21B6] text-xs font-bold uppercase tracking-wider">
                <IconCpuChip customClass="w-4 h-4 text-[#8E94F2]" />
                <span>Pendekatan Semantik</span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-[#0F172A]">
                Sentence-BERT & Pemaknaan Konteks
              </h3>
              <p class="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
                Sentence-BERT merepresentasikan narasi abstrak ke dalam vektor 768 dimensi. Pengukuran <span class="font-medium text-[#0F172A]">Cosine Similarity</span> mendeteksi keselarasan konteks dan esensi topik meskipun menggunakan variasi kosakata berbeda.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- 4. Three Roles Ecosystem Section -->
    <section id="ekosistem" class="py-16 scroll-mt-20">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#1E3A6D] tracking-tight">
            Ekosistem Terintegrasi Tiga Peran
          </h2>
          <p class="text-xs sm:text-sm text-[#5A6A85]">
            Menghubungkan mahasiswa, dosen pembimbing, dan pimpinan program studi dalam alur kerja tugas akhir yang terstruktur.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Role 1: Mahasiswa -->
          <div class="p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(30,58,109,0.04)] space-y-3">
            <div class="w-10 h-10 rounded-lg bg-[#F5F8FF] border border-[#CBD5E1] text-[#1E3A6D] flex items-center justify-center">
              <IconUserGraduate customClass="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-[#0F172A]">Mahasiswa</h3>
            <p class="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
              Mengeksplorasi kecocokan topik tugas akhir secara mandiri, melihat transparansi irisan kata kunci relevan, dan mengajukan draf permohonan bimbingan secara tepat sasaran.
            </p>
          </div>

          <!-- Role 2: Dosen -->
          <div class="p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(30,58,109,0.04)] space-y-3">
            <div class="w-10 h-10 rounded-lg bg-[#EBF4FF] border border-[#CBD5E1] text-academic-navy flex items-center justify-center">
              <IconUsers customClass="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-[#0F172A]">Dosen Pembimbing</h3>
            <p class="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
              Mengakses profil dan portofolio keahlian, mengatur batas kuota mahasiswa bimbingan, serta meninjau dan menerima atau menolak permohonan bimbingan yang masuk.
            </p>
          </div>

          <!-- Role 3: Admin SiReDo -->
          <div class="p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-[0_4px_20px_rgba(30,58,109,0.04)] space-y-3">
            <div class="w-10 h-10 rounded-lg bg-[#F5F8FF] border border-[#CBD5E1] text-[#1E3A6D] flex items-center justify-center">
              <IconShieldCheck customClass="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-[#0F172A]">Administrator</h3>
            <p class="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
              Mengatur konfigurasi parameter pembobotan algoritma, memelihara master data kepakaran dosen, dan menjalankan otomasi penjadwalan sidang tugas akhir bebas bentrok.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Academic Footer -->
    <footer class="py-10 bg-white border-t border-[#E2E8F0]">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
        <div>
          <div class="text-sm font-bold text-[#1E3A6D]">SiReDo — Sistem Rekomendasi Dosen</div>
          <div class="text-xs text-[#5A6A85] mt-0.5">
            Dikembangkan oleh Hamdan Azmi (3312411004) & Chritsian Marcelino Sinaga (3312411008)
          </div>
        </div>
        <div class="text-xs text-[#5A6A85]">
          Hak Cipta Terpelihara &copy; 2026 Jurusan Teknik Informatika Polibatam.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import IconBookOpen from '../components/icons/IconBookOpen.vue'
import IconClock from '../components/icons/IconClock.vue'
import IconCheckCircle from '../components/icons/IconCheckCircle.vue'
import IconCpuChip from '../components/icons/IconCpuChip.vue'
import IconUsers from '../components/icons/IconUsers.vue'
import IconUserGraduate from '../components/icons/IconUserGraduate.vue'
import IconShieldCheck from '../components/icons/IconShieldCheck.vue'
import diagramImg from '../assets/diagram-alur.png'
import heroIllustration from '../assets/hero-nlp-illustration.jfif'

const router = useRouter()
const quickJudul = ref('')

const handleQuickRecommendation = () => {
  if (quickJudul.value.trim()) {
    router.push({
      path: '/dosen',
      query: {
        mode: 'rekomendasi',
        judul: quickJudul.value.trim()
      }
    })
  } else {
    router.push({
      path: '/dosen',
      query: {
        mode: 'rekomendasi'
      }
    })
  }
}
</script>
