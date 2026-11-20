<template>
  <div class="relative min-h-screen bg-ambient-mesh">
    <!-- 1. Top Navigation Bar -->
    <Navbar />

    <!-- 2. Clean Editorial Hero Section (Zero Navigation) -->
    <section id="hero" class="relative pt-10 pb-16 sm:pt-16 sm:pb-20 overflow-hidden scroll-mt-20">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        <!-- Micro-Badge: System Philosophy (NO version badge) -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/90 border border-slate-200 text-slate-800 shadow-2xs">
          <span class="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
          <span>Sistem Rekomendasi Akademik Cerdas</span>
        </div>

        <!-- Main Headline -->
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-3xl mx-auto">
          Pencocokan Tepat <br class="hidden sm:inline" />
          <span class="text-teal-700">Dosen Pembimbing</span> <br class="hidden sm:inline" />
          Berdasarkan Analisis Topik
        </h1>

        <!-- Subtitle -->
        <p class="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Memadukan pendekatan leksikal dan kecocokan semantik untuk menemukan dosen pembimbing tugas akhir yang paling relevan dengan arah penelitian mahasiswa secara objektif dan akurat.
        </p>

        <!-- 3 Core Value Items (Horizontal Grid, No Buttons/Links) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 pt-4 text-left">
          <div class="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5 shadow-xs">
            <div class="p-1.5 w-fit rounded-lg bg-teal-50 border border-teal-200/80 text-teal-800">
              <IconCheckCircle customClass="w-5 h-5" />
            </div>
            <h2 class="text-sm font-bold text-slate-900">Pencocokan Tepat Istilah & Konteks</h2>
            <p class="text-xs text-slate-500 leading-relaxed">
              Evaluasi ganda pada akronim teknis, kata kunci spesifik, serta konteks kalimat abstrak penelitian.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5 shadow-xs">
            <div class="p-1.5 w-fit rounded-lg bg-teal-50 border border-teal-200/80 text-teal-800">
              <IconClock customClass="w-5 h-5" />
            </div>
            <h2 class="text-sm font-bold text-slate-900">Efisiensi Penentuan Topik</h2>
            <p class="text-xs text-slate-500 leading-relaxed">
              Menghilangkan ketidakpastian pengajuan judul dengan rekomendasi instan berbobot proporsional.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5 shadow-xs">
            <div class="p-1.5 w-fit rounded-lg bg-teal-50 border border-teal-200/80 text-teal-800">
              <IconCpuChip customClass="w-5 h-5" />
            </div>
            <h2 class="text-sm font-bold text-slate-900">Transparansi Irisan Kata Kunci</h2>
            <p class="text-xs text-slate-500 leading-relaxed">
              Setiap hasil rekomendasi menyajikan irisan istilah kepakaran yang mendasari perhitungan skor.
            </p>
          </div>
        </div>

        <!-- Live Institutional Counter (High Contrast Tabular) -->
        <div class="pt-6 border-t border-slate-200/80 max-w-2xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <div class="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900">86</div>
            <div class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Dosen Aktif</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900">350+</div>
            <div class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Publikasi Riset</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900">2.6k+</div>
            <div class="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Riwayat Bimbingan</div>
          </div>
        </div>

      </div>
    </section>

    <!-- 3. Methodology Section: Dual-Engine Hybrid NLP (Side-by-Side: Diagram | Narasi) -->
    <section id="metodologi" class="py-12 sm:py-16 bg-white border-y border-slate-200/80 scroll-mt-20">
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
            <div class="text-[11px] text-slate-400 text-center font-mono">
              Diagram Alur BM25 Leksikal, SBERT Semantik, dan Penggabungan Skor
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
    <section id="ekosistem" class="py-16 scroll-mt-20">
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
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import IconBookOpen from '../components/icons/IconBookOpen.vue'
import IconClock from '../components/icons/IconClock.vue'
import IconCheckCircle from '../components/icons/IconCheckCircle.vue'
import IconCpuChip from '../components/icons/IconCpuChip.vue'
import IconUsers from '../components/icons/IconUsers.vue'
import IconUserGraduate from '../components/icons/IconUserGraduate.vue'
import IconShieldCheck from '../components/icons/IconShieldCheck.vue'
import diagramImg from '../assets/diagram-alur.png'
</script>
