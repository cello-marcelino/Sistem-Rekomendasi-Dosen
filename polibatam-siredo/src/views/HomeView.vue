<template>
  <div class="space-y-6 pb-12 animate-in font-sans">
    <!-- Header Section (Canvas-First Hero) -->
    <div class="border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div class="max-w-3xl">
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2 leading-tight font-sans">
          Sistem Rekomendasi Dosen Pembimbing & Penguji
        </h1>
        <p class="text-sm text-gray-600 leading-relaxed m-0">
          Pemetaan topik tugas akhir mahasiswa dengan kepakaran dosen secara akurat, <span class="text-teal-800 font-semibold">objektif</span>, dan <span class="text-teal-800 font-semibold">transparan</span> berbasis NLP.
        </p>
      </div>
      
      <div class="flex flex-wrap items-center gap-2.5 shrink-0">
        <button 
          @click="router.push('/rekomendasi')" 
          class="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded shadow-sm transition-colors inline-flex items-center gap-1.5"
        >
          <span>Mulai Rekomendasi</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        <button 
          @click="router.push('/dosen')" 
          class="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded shadow-sm transition-colors"
        >
          Eksplorasi Direktori
        </button>
      </div>
    </div>

    <!-- CARD 2: USER SOLUTION METRICS (No latency, zero downtime, or XAI engine jargon) -->
    <div class="bg-white border border-gray-200/90 rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-3.5 border-b border-gray-200/90 bg-gray-50/60">
        <h2 class="text-xs font-mono font-bold uppercase tracking-widest text-gray-700">Ringkasan Kemampuan Sistem</h2>
      </div>
      
      <div class="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200/80">
        <div class="p-5 lg:p-6 flex flex-col justify-between">
          <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kecepatan Analisis</div>
          <div class="text-2xl lg:text-3xl font-bold font-mono text-gray-900">Instan</div>
          <div class="text-xs text-gray-600 mt-2">Hasil rekomendasi langsung siap</div>
        </div>

        <div class="p-5 lg:p-6 flex flex-col justify-between">
          <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Model NLP</div>
          <div class="text-2xl lg:text-3xl font-bold font-mono text-gray-900">BM25 + SBERT</div>
          <div class="text-xs text-gray-600 mt-2">Kecocokan kata kunci & makna topik</div>
        </div>

        <div class="p-5 lg:p-6 flex flex-col justify-between">
          <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Penilaian Dosen</div>
          <div class="text-2xl lg:text-3xl font-bold font-mono text-gray-900">Skor Terukur</div>
          <div class="text-xs text-gray-600 mt-2">Berdasarkan data publikasi & bimbingan</div>
        </div>

        <div class="p-5 lg:p-6 flex flex-col justify-between bg-teal-50/30">
          <div class="text-[11px] font-mono font-bold text-teal-700 uppercase tracking-widest mb-1.5">Transparansi Skor</div>
          <div class="text-2xl lg:text-3xl font-bold font-mono text-teal-900">Jelas & Terbuka</div>
          <div class="text-xs text-teal-800 mt-2">Alasan kecocokan dapat ditinjau</div>
        </div>
      </div>
    </div>

    <!-- CARDS 3 & 4: CORE MODULES & NLP PIPELINE -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      <!-- CARD 3: CORE MODULES (Direct, no fluff badges) -->
      <div class="lg:col-span-5 bg-white border border-gray-200/90 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200/90 bg-gray-50/60">
          <h2 class="text-sm font-bold text-gray-900 tracking-wide font-sans">Layanan Utama</h2>
        </div>
        
        <div class="divide-y divide-gray-100 flex-1">
          <div 
            @click="router.push('/admin/batch')" 
            class="p-5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start justify-between gap-4"
          >
            <div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-1">
                Batch Recommendation
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                Pemrosesan banyak proposal sekaligus via Excel dengan plotting dosen otomatis.
              </p>
            </div>
            <span class="text-xs font-mono font-bold text-gray-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all mt-0.5">&rarr;</span>
          </div>

          <div 
            @click="router.push('/admin/penjadwalan')" 
            class="p-5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start justify-between gap-4"
          >
            <div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-1">
                Auto-Penjadwalan Sidang
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                Penetapan slot waktu, ruang, dan susunan penguji sidang tanpa jadwal bentrok.
              </p>
            </div>
            <span class="text-xs font-mono font-bold text-gray-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all mt-0.5">&rarr;</span>
          </div>

          <div 
            @click="router.push('/dosen')" 
            class="p-5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start justify-between gap-4"
          >
            <div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-1">
                Direktori Dosen
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                Pencarian profil dosen, bidang keahlian, riwayat publikasi, dan bimbingan.
              </p>
            </div>
            <span class="text-xs font-mono font-bold text-gray-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all mt-0.5">&rarr;</span>
          </div>
        </div>
      </div>

      <!-- CARD 4: NLP PIPELINE (Concise, primary points only) -->
      <div class="lg:col-span-7 bg-white border border-gray-200/90 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200/90 bg-gray-50/60">
          <h2 class="text-sm font-bold text-gray-900 tracking-wide font-sans">Tahapan Analisis NLP</h2>
        </div>

        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/70 border-b border-gray-200/80 text-[10px] uppercase font-mono tracking-widest text-gray-700 font-bold">
                <th class="py-3 px-4 w-14 text-center border-r border-gray-200/80">Tahap</th>
                <th class="py-3 px-4 border-r border-gray-200/80">Komponen</th>
                <th class="py-3 px-4">Fungsi Utama</th>
              </tr>
            </thead>
            <tbody class="text-xs divide-y divide-gray-100">
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 text-center border-r border-gray-100 font-mono font-bold text-gray-500">01</td>
                <td class="py-3 px-4 font-bold text-gray-900 border-r border-gray-100 whitespace-nowrap">Pembersihan Teks</td>
                <td class="py-3 px-4 text-gray-600 leading-relaxed">Ekstraksi kata kunci dan pembersihan kata umum (stopwords).</td>
              </tr>
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 text-center border-r border-gray-100 font-mono font-bold text-gray-500">02</td>
                <td class="py-3 px-4 font-bold text-gray-900 border-r border-gray-100 whitespace-nowrap">Ekspansi Sinonim</td>
                <td class="py-3 px-4 text-gray-600 leading-relaxed">Penyelarasan istilah informatika dengan padanan kata baku.</td>
              </tr>
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 text-center border-r border-gray-100 font-mono font-bold text-gray-500">03</td>
                <td class="py-3 px-4 font-bold text-gray-900 border-r border-gray-100 whitespace-nowrap">Filter BM25</td>
                <td class="py-3 px-4 text-gray-600 leading-relaxed">Penyaringan awal berbasis kecocokan kata kunci eksak (skor leksikal).</td>
              </tr>
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 text-center border-r border-gray-100 font-mono font-bold text-gray-500">04</td>
                <td class="py-3 px-4 font-bold text-gray-900 border-r border-gray-100 whitespace-nowrap">SBERT Semantik</td>
                <td class="py-3 px-4 text-gray-600 leading-relaxed">Pencocokan makna kontekstual proposal dengan kepakaran dosen.</td>
              </tr>
              <tr class="bg-teal-50/40 hover:bg-teal-50/60 transition-colors">
                <td class="py-3 px-4 text-center border-r border-teal-200/80 font-mono font-bold text-teal-700">05</td>
                <td class="py-3 px-4 font-bold text-teal-900 border-r border-teal-200/80 whitespace-nowrap">Skor Rekomendasi</td>
                <td class="py-3 px-4 text-teal-900 leading-relaxed">Penggabungan skor akhir untuk rekomendasi dosen pembimbing & penguji terbaik.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.animate-in {
  animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
