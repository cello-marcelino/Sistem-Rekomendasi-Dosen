<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import SingleRecommendationView from './SingleRecommendationView.vue'

const serverStatus = ref('checking')
const cacheReady = ref(false)

const checkStatus = async () => {
  try {
    const res = await api.get('/status')
    serverStatus.value = 'online'
    cacheReady.value = Boolean(res.data?.data?.cache_ready)
  } catch {
    serverStatus.value = 'offline'
  }
}

onMounted(checkStatus)
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-8 h-14 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div
          class="w-7 h-7 rounded-[4px] flex items-center justify-center text-white font-bold text-xs shadow-sm"
          style="background-color: oklch(54.1% 0.281 293.009)"
        >
          S
        </div>
        <span class="font-bold text-sm tracking-tight text-gray-900">
          SiReDo
          <span
            class="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ml-1"
            style="color: oklch(54.1% 0.281 293.009); background-color: oklch(96.5% 0.025 293.009); border-color: oklch(88% 0.08 293.009)"
          >
            API
          </span>
        </span>
      </div>

      <nav class="hidden md:flex items-center gap-5 text-xs font-medium text-gray-600">
        <a href="#masalah-solusi" class="hover:text-gray-900 transition-colors no-underline">Masalah &amp; Solusi</a>
        <a href="#kapabilitas" class="hover:text-gray-900 transition-colors no-underline">Potensi Integrasi</a>
        <a href="#demo" class="hover:text-gray-900 transition-colors no-underline">Uji Coba Langsung</a>
      </nav>

      <div class="flex items-center gap-3">
        <!-- Live Status Indicator -->
        <div class="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :class="[
              serverStatus === 'online' && cacheReady ? 'bg-emerald-500 animate-pulse' :
              serverStatus === 'online' ? 'bg-amber-500 animate-pulse' :
              serverStatus === 'checking' ? 'bg-gray-400' : 'bg-rose-500'
            ]"
          ></span>
          <span>{{ serverStatus === 'online' && cacheReady ? 'API Siap' : serverStatus === 'online' ? 'Sync' : serverStatus === 'checking' ? 'Checking' : 'Offline' }}</span>
        </div>

        <router-link
          to="/docs"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-[4px] shadow-sm transition-opacity hover:opacity-90 no-underline"
          style="background-color: oklch(54.1% 0.281 293.009)"
        >
          Dokumentasi
        </router-link>
      </div>
    </header>

    <!-- Hero Section (Product Hook) -->
    <section class="bg-white border-b border-gray-200 py-14 sm:py-20">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <div
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border"
          style="color: oklch(54.1% 0.281 293.009); background-color: oklch(96.5% 0.025 293.009); border-color: oklch(88% 0.08 293.009)"
        >
          REST API ENGINE REKOMENDASI TUGAS AKHIR
        </div>

        <h1 class="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight font-sans">
          Otomatiskan Penentuan Pembimbing &amp; Penguji Skripsi di Kampus Anda
        </h1>

        <p class="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          SiReDo API menjembatani sistem informasi akademik (SIAKAD) dengan AI hibrida. Kirim draf proposal mahasiswa, dapatkan rekomendasi dosen paling kompeten secara instan, objektif, dan transparan.
        </p>

        <div class="flex items-center justify-center gap-3 pt-2">
          <router-link
            to="/docs"
            class="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-[4px] shadow-sm transition-opacity hover:opacity-90 no-underline"
            style="background-color: oklch(54.1% 0.281 293.009)"
          >
            Buka Dokumentasi API →
          </router-link>

          <a
            href="#demo"
            class="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-[4px] shadow-sm transition-colors no-underline"
          >
            Uji Coba Langsung ↓
          </a>
        </div>
      </div>
    </section>

    <!-- Problem vs Solution Story Section -->
    <section id="masalah-solusi" class="py-14 sm:py-18 border-b border-gray-200 bg-slate-50/60">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div class="text-center max-w-2xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-900 font-sans tracking-tight">
            Tantangan Pengelolaan Skripsi &amp; Solusi SiReDo API
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
            Dari proses manual yang memakan waktu berminggu-minggu menjadi pencocokan cerdas berbasis data publikasi dan keahlian dosen.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Problem Box -->
          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-rose-700 font-mono">Tantangan Proses Konvensional</span>
              </div>

              <ul class="space-y-3 text-xs text-gray-600 leading-relaxed list-none p-0 m-0">
                <li class="flex items-start gap-2.5">
                  <span class="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Sortir manual ratusan proposal:</strong> Koordinator program studi harus membaca judul dan abstrak mahasiswa satu per satu di setiap awal semester.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Keterbatasan pencarian kata kunci:</strong> Query judul mahasiswa sering menggunakan istilah baru atau bahasa Inggris yang tidak cocok dengan kata kunci statis di profil dosen.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Mismatch keahlian &amp; beban bimbingan:</strong> Dosen sering ditugaskan di topik yang kurang relevan, sementara dosen yang kompeten terlewatkan.</span>
                </li>
              </ul>
            </div>

            <div class="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-mono">
              Dampak: Evaluasi proposal lambat &amp; kualitas bimbingan tidak optimal.
            </div>
          </div>

          <!-- Solution Box -->
          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">Solusi SiReDo API</span>
              </div>

              <ul class="space-y-3 text-xs text-gray-600 leading-relaxed list-none p-0 m-0">
                <li class="flex items-start gap-2.5">
                  <span class="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Kombinasi BM25 + SBERT:</strong> Menggabungkan ketepatan kata kunci publikasi ilmiah dengan pemahaman semantik makna topik secara mendalam.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Integrasi REST universal:</strong> Dapat dihubungkan ke portal tugas akhir kampus, SIAKAD, maupun bot notifikasi hanya via HTTP request JSON.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Transparansi skor akademik (XAI):</strong> Setiap rekomendasi disertai persentase kecocokan dan irisan topik riset sebagai dasar justifikasi prodi.</span>
                </li>
              </ul>
            </div>

            <div class="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-400 font-mono">
              Hasil: Penentuan pembimbing &amp; penguji adil, cepat, dan terukur.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Possibilities / What You Can Build Section -->
    <section id="kapabilitas" class="py-14 sm:py-18 bg-white border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div class="text-center max-w-2xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-900 font-sans tracking-tight">
            Fitur yang Dapat Anda Bangun dengan SiReDo API
          </h2>
          <p class="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
            Satu engine cerdas yang fleksibel untuk membuka beragam kapabilitas automasi di ekosistem digital kampus Anda.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- 1. Smart Advisor Matcher -->
          <div class="border border-gray-200 rounded-lg p-5 shadow-sm bg-slate-50/40 flex flex-col justify-between">
            <div class="space-y-2.5">
              <div class="w-8 h-8 rounded-[4px] flex items-center justify-center text-white" style="background-color: oklch(54.1% 0.281 293.009)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900">1. Rekomendasi Pembimbing Real-time</h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                Pasang saran otomatis di portal skripsi saat mahasiswa mengetik draf judul &amp; proposal. Mahasiswa dan koordinator langsung melihat daftar calon pembimbing yang paling linear dengan ide risetnya.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-200/80 text-[11px] font-mono text-gray-500">
              Endpoint: <code class="text-gray-800">POST /api/rekomendasi/single</code>
            </div>
          </div>

          <!-- 2. Automated Examiner Allocator -->
          <div class="border border-gray-200 rounded-lg p-5 shadow-sm bg-slate-50/40 flex flex-col justify-between">
            <div class="space-y-2.5">
              <div class="w-8 h-8 rounded-[4px] flex items-center justify-center text-white" style="background-color: oklch(54.1% 0.281 293.009)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900">2. Penentuan Penguji Sidang Otomatis</h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                Integrasikan engine ke algoritma penjadwalan sidang. Sistem dapat mencocokkan puluhan mahasiswa sidang dengan dosen penguji yang benar-benar menguasai topik pengujian tanpa bentrok jadwal.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-200/80 text-[11px] font-mono text-gray-500">
              Endpoint: <code class="text-gray-800">POST /api/rekomendasi/batch</code>
            </div>
          </div>

          <!-- 3. Batch Research Mapping -->
          <div class="border border-gray-200 rounded-lg p-5 shadow-sm bg-slate-50/40 flex flex-col justify-between">
            <div class="space-y-2.5">
              <div class="w-8 h-8 rounded-[4px] flex items-center justify-center text-white" style="background-color: oklch(54.1% 0.281 293.009)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900">3. Pemetaan Riset Angkatan via Spreadsheet</h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                Unggah satu berkas Excel berisi ratusan judul skripsi angkatan berjalan. Dapatkan rekap distribusi topik penelitian mahasiswa terhadap roadmap riset laboratorium dan kapasitas dosen prodi.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-200/80 text-[11px] font-mono text-gray-500">
              Endpoint: <code class="text-gray-800">POST /api/batch/upload</code>
            </div>
          </div>

          <!-- 4. Academic Justification & XAI Panel -->
          <div class="border border-gray-200 rounded-lg p-5 shadow-sm bg-slate-50/40 flex flex-col justify-between">
            <div class="space-y-2.5">
              <div class="w-8 h-8 rounded-[4px] flex items-center justify-center text-white" style="background-color: oklch(54.1% 0.281 293.009)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900">4. Justifikasi Akreditasi &amp; Transparansi Skor</h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                Tampilkan bukti kesesuaian bimbingan dosen berbasis riwayat publikasi ilmiah dan irisan kata kunci. Memenuhi standar evaluasi akreditasi prodi mengenai relevansi bimbingan tugas akhir.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-200/80 text-[11px] font-mono text-gray-500">
              Payload: <code class="text-gray-800">scores.hybrid &amp; xai_explanation</code>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Developer Quick Contract Preview -->
    <section class="max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2">
            <span
              class="px-1.5 py-0.5 text-[10px] font-bold text-white rounded"
              style="background-color: oklch(54.1% 0.281 293.009)"
            >
              POST
            </span>
            <span class="font-semibold text-gray-800">/api/rekomendasi/single</span>
          </div>
          <router-link to="/docs/api" class="text-[11px] text-gray-500 hover:text-gray-900 hover:underline">
            Lihat semua endpoint →
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 text-xs font-mono">
          <!-- Request -->
          <div class="p-4 bg-slate-900 text-slate-200 overflow-x-auto">
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-sans font-semibold">Input Payload (JSON)</div>
            <pre class="leading-relaxed text-[11px] font-mono"><code>{
  "judul": "Klasifikasi Teks dengan IndoBERT",
  "abstrak": "Analisis sentimen berbasis transformer...",
  "top_k": 5
}</code></pre>
          </div>

          <!-- Response -->
          <div class="p-4 bg-slate-950 text-slate-200 overflow-x-auto">
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-sans font-semibold">Response Hasil (200 OK)</div>
            <pre class="leading-relaxed text-[11px] font-mono"><code class="text-emerald-400">{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "dosen": { "nama": "Dr. Eng. ..." },
        "scores": { "hybrid": 0.842, "bm25": 0.79, "sbert": 0.89 },
        "xai": { "irisan_kata": ["indobert", "klasifikasi"] }
      }
    ]
  }
}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Live Sandbox -->
    <section id="demo" class="border-t border-gray-200 bg-slate-100/60 py-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="mb-4">
          <h2 class="text-sm font-bold text-gray-900 tracking-tight">Simulasi Langsung Rekomendasi</h2>
          <p class="text-xs text-gray-500">Uji respons algoritma dengan memasukkan draf judul dan abstrak skripsi.</p>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <SingleRecommendationView />
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white py-5 text-center text-xs text-gray-400 font-mono">
      SiReDo API · Hybrid BM25 + SBERT · Ready for Academic Integration
    </footer>
  </div>
</template>
