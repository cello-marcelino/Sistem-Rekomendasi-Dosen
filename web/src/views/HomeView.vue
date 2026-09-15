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
    <!-- Top Bar Navigation -->
    <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200/90 px-4 sm:px-8 h-14 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link to="/" class="flex items-center gap-2.5 text-gray-900 no-underline">
          <div class="w-7 h-7 bg-teal-700 rounded-[4px] flex items-center justify-center text-white shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span class="font-bold text-sm tracking-tight text-gray-900">
            SiReDo <span class="text-[10px] font-mono font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-1.5 py-0.5 rounded ml-1">API</span>
          </span>
        </router-link>

        <nav class="hidden md:flex items-center gap-1 ml-6 border-l border-gray-200 pl-6 text-xs font-medium text-gray-600">
          <router-link to="/docs/quickstart" class="px-2.5 py-1 rounded hover:text-teal-800 hover:bg-gray-100 transition-colors">Quickstart</router-link>
          <router-link to="/docs/api" class="px-2.5 py-1 rounded hover:text-teal-800 hover:bg-gray-100 transition-colors">Endpoint REST</router-link>
          <router-link to="/docs/pipeline" class="px-2.5 py-1 rounded hover:text-teal-800 hover:bg-gray-100 transition-colors">Pipeline NLP</router-link>
          <router-link to="/docs/api-key" class="px-2.5 py-1 rounded hover:text-teal-800 hover:bg-gray-100 transition-colors">API Key</router-link>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <!-- Live Server Status Indicator -->
        <div class="flex items-center gap-1.5 text-xs text-gray-600 font-mono bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-[4px]">
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :class="[
              serverStatus === 'online' && cacheReady ? 'bg-emerald-500 animate-pulse' :
              serverStatus === 'online' ? 'bg-amber-500 animate-pulse' :
              serverStatus === 'checking' ? 'bg-gray-400' : 'bg-rose-500'
            ]"
          ></span>
          <span class="text-[11px] font-medium text-gray-700">
            {{ serverStatus === 'online' && cacheReady ? 'API Siap' : serverStatus === 'online' ? 'Sinkronisasi' : serverStatus === 'checking' ? 'Memeriksa' : 'Offline' }}
          </span>
        </div>

        <router-link
          to="/docs/quickstart"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-[4px] transition-colors shadow-sm no-underline"
        >
          Mulai Integrasi
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </router-link>
      </div>
    </header>

    <!-- Hero Section (Bebas Gradient Slop) -->
    <section class="border-b border-gray-200/90 bg-white py-14 sm:py-18">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200/80">
          <span class="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
          REST API &amp; Mesin Rekomendasi Dosen
        </div>

        <h1 class="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight font-sans">
          Layanan REST API Rekomendasi<br class="hidden sm:inline" />
          Pembimbing &amp; Penguji Skripsi
        </h1>

        <p class="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Hubungkan sistem informasi akademik kampus Anda dengan engine pencocokan topik skripsi mahasiswa berbasis algoritma leksikal <strong class="text-gray-900 font-semibold">BM25</strong> dan semantik <strong class="text-gray-900 font-semibold">SBERT</strong>.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <router-link
            to="/docs/quickstart"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-[4px] transition-colors shadow-sm no-underline"
          >
            Mulai Integrasi (Quickstart)
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </router-link>

          <router-link
            to="/docs/api"
            class="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-[4px] transition-colors shadow-sm no-underline"
          >
            Lihat Spesifikasi Endpoint
          </router-link>

          <a
            href="#demo"
            class="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline transition-colors"
          >
            Uji Coba Langsung ↓
          </a>
        </div>

        <!-- 4 Algorithmic Pillars (Structured Hairline Bar) -->
        <div class="pt-8">
          <div class="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 border border-gray-200 rounded-lg bg-gray-50/50 shadow-sm text-left">
            <div class="p-4">
              <div class="font-mono text-xs font-bold text-teal-800">BM25</div>
              <div class="text-xs font-semibold text-gray-900 mt-0.5">Pencocokan Kata Kunci</div>
              <div class="text-[11px] text-gray-500 mt-0.5">Penyaringan leksikal korpus keahlian &amp; publikasi</div>
            </div>

            <div class="p-4">
              <div class="font-mono text-xs font-bold text-teal-800">SBERT</div>
              <div class="text-xs font-semibold text-gray-900 mt-0.5">Pencocokan Semantik</div>
              <div class="text-[11px] text-gray-500 mt-0.5">Pemahaman makna kontekstual IndoBERT</div>
            </div>

            <div class="p-4">
              <div class="font-mono text-xs font-bold text-teal-800">Hybrid Score</div>
              <div class="text-xs font-semibold text-gray-900 mt-0.5">Perankingan Terpadu</div>
              <div class="text-[11px] text-gray-500 mt-0.5">Pembobotan adaptif rasio kata kunci &amp; abstrak</div>
            </div>

            <div class="p-4">
              <div class="font-mono text-xs font-bold text-teal-800">Transparansi Skor</div>
              <div class="text-xs font-semibold text-gray-900 mt-0.5">Penjelasan Kesesuaian</div>
              <div class="text-[11px] text-gray-500 mt-0.5">Rincian kata kunci relevan dan topik dosen</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Section: Documentation & Integrations -->
    <section class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-gray-200 pb-3">
          <div>
            <h2 class="text-lg font-bold text-gray-900 font-sans tracking-tight">Katalog Dokumentasi &amp; Integrasi API</h2>
            <p class="text-xs text-gray-600 mt-0.5">
              Spesifikasi teknis dan panduan langkah demi langkah untuk developer sistem informasi akademik.
            </p>
          </div>
          <span class="text-xs font-mono text-gray-400">v3.0 · REST JSON</span>
        </div>

        <!-- Cards Grid (Single-Layer Clean Cards) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <!-- 1. Quickstart -->
          <router-link
            to="/docs/quickstart"
            class="group bg-white border border-gray-200/90 rounded-lg p-5 shadow-sm hover:border-teal-600/70 transition-all flex flex-col justify-between no-underline"
          >
            <div>
              <div class="w-8 h-8 rounded-[4px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-800 transition-colors mt-3">
                1. Panduan Quickstart
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed mt-1.5">
                Integrasi cepat 3 langkah untuk mendaftarkan kredensial API Key dan memanggil rekomendasi pertama Anda.
              </p>
            </div>
            <div class="text-xs font-semibold text-teal-700 group-hover:text-teal-800 flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
              Mulai integrasi →
            </div>
          </router-link>

          <!-- 2. Dokumentasi REST API -->
          <router-link
            to="/docs/api"
            class="group bg-white border border-gray-200/90 rounded-lg p-5 shadow-sm hover:border-teal-600/70 transition-all flex flex-col justify-between no-underline"
          >
            <div>
              <div class="w-8 h-8 rounded-[4px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-800 transition-colors mt-3">
                2. Spesifikasi Endpoint REST
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed mt-1.5">
                Kontrak endpoint lengkap untuk single proposal, batch JSON, batch Excel upload, konfigurasi, dan status.
              </p>
            </div>
            <div class="text-xs font-semibold text-teal-700 group-hover:text-teal-800 flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
              Lihat spesifikasi endpoint →
            </div>
          </router-link>

          <!-- 3. Pipeline NLP -->
          <router-link
            to="/docs/pipeline"
            class="group bg-white border border-gray-200/90 rounded-lg p-5 shadow-sm hover:border-teal-600/70 transition-all flex flex-col justify-between no-underline"
          >
            <div>
              <div class="w-8 h-8 rounded-[4px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-800 transition-colors mt-3">
                3. Alur Pipeline NLP &amp; Skoring
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed mt-1.5">
                Tahapan pengolahan teks dari preprocessing, kamus sinonim, perhitungan BM25, SBERT, hingga hybrid rank.
              </p>
            </div>
            <div class="text-xs font-semibold text-teal-700 group-hover:text-teal-800 flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
              Pelajari pipeline NLP →
            </div>
          </router-link>

          <!-- 4. Arsitektur Cache & Indeks -->
          <router-link
            to="/docs/caching"
            class="group bg-white border border-gray-200/90 rounded-lg p-5 shadow-sm hover:border-teal-600/70 transition-all flex flex-col justify-between no-underline"
          >
            <div>
              <div class="w-8 h-8 rounded-[4px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zM9 12h6M9 8h6M9 16h4" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-800 transition-colors mt-3">
                4. Arsitektur Indeks &amp; Cache
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed mt-1.5">
                Struktur penyimpanan korpus dosen di memori dan proses sinkronisasi latar belakang tanpa mengganggu request aktif.
              </p>
            </div>
            <div class="text-xs font-semibold text-teal-700 group-hover:text-teal-800 flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
              Baca arsitektur indeks →
            </div>
          </router-link>

          <!-- 5. Kredensial API Key -->
          <router-link
            to="/docs/api-key"
            class="group bg-white border border-gray-200/90 rounded-lg p-5 shadow-sm hover:border-teal-600/70 transition-all flex flex-col justify-between no-underline"
          >
            <div>
              <div class="w-8 h-8 rounded-[4px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-800 transition-colors mt-3">
                5. Manajemen API Key
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed mt-1.5">
                Registrasi institusi untuk menerbitkan token API Key dan otentikasi header request secara aman.
              </p>
            </div>
            <div class="text-xs font-semibold text-teal-700 group-hover:text-teal-800 flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
              Kelola kredensial →
            </div>
          </router-link>

          <!-- 6. Aplikasi Kampus Referensi -->
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            class="group bg-white border border-gray-200/90 rounded-lg p-5 shadow-sm hover:border-teal-600/70 transition-all flex flex-col justify-between no-underline"
          >
            <div>
              <div class="w-8 h-8 rounded-[4px] bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-800 transition-colors mt-3">
                Aplikasi Referensi (Polibatam)
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed mt-1.5">
                Lihat antarmuka web percontohan kampus yang mengonsumsi endpoint API ini untuk penjadwalan sidang &amp; direktori dosen.
              </p>
            </div>
            <div class="text-xs font-semibold text-teal-700 group-hover:text-teal-800 flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
              Buka aplikasi (:5174) ↗
            </div>
          </a>
        </div>
      </div>

      <!-- Quick Reference Terminal Card -->
      <div class="bg-[#0f172a] border border-slate-800 rounded-lg p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div class="text-[10px] font-mono uppercase tracking-widest text-teal-400">Quick Reference</div>
            <div class="text-sm font-bold font-mono text-slate-100 mt-0.5">Ringkasan Endpoint Utama</div>
          </div>
          <router-link
            to="/docs/api"
            class="text-xs font-semibold text-teal-400 hover:text-teal-300 hover:underline inline-flex items-center gap-1"
          >
            Buka Dokumentasi REST Lengkap →
          </router-link>
        </div>

        <div class="space-y-2.5 font-mono text-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-2 rounded bg-slate-900/80 border border-slate-800/80">
            <div class="flex items-center gap-2.5">
              <span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-teal-900/70 text-teal-300 border border-teal-700/50">POST</span>
              <span class="text-slate-100">/api/rekomendasi/single</span>
            </div>
            <span class="text-slate-400 text-[11px]">Rekomendasi 1 proposal (judul &amp; abstrak)</span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-2 rounded bg-slate-900/80 border border-slate-800/80">
            <div class="flex items-center gap-2.5">
              <span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-teal-900/70 text-teal-300 border border-teal-700/50">POST</span>
              <span class="text-slate-100">/api/rekomendasi/batch</span>
            </div>
            <span class="text-slate-400 text-[11px]">Rekomendasi massal array proposal JSON</span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-2 rounded bg-slate-900/80 border border-slate-800/80">
            <div class="flex items-center gap-2.5">
              <span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-teal-900/70 text-teal-300 border border-teal-700/50">POST</span>
              <span class="text-slate-100">/api/batch/upload</span>
            </div>
            <span class="text-slate-400 text-[11px]">Unggah berkas spreadsheet Excel (.xlsx)</span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-2 rounded bg-slate-900/80 border border-slate-800/80">
            <div class="flex items-center gap-2.5">
              <span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-900/70 text-blue-300 border border-blue-700/50">GET</span>
              <span class="text-slate-100">/api/system/status</span>
            </div>
            <span class="text-slate-400 text-[11px]">Status kesiapan engine dan jumlah dosen</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Tester / Demo Section -->
    <section id="demo" class="border-t border-gray-200 bg-slate-100/70 py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="mb-6">
          <div class="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200">
            Interactive Sandbox
          </div>
          <h2 class="text-xl font-bold text-gray-900 font-sans tracking-tight mt-1">
            Uji Coba Langsung Rekomendasi
          </h2>
          <p class="text-xs text-gray-600 mt-0.5">
            Simulasikan query proposal tugas akhir dan amati kalkulasi skor hibrida secara interaktif.
          </p>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <SingleRecommendationView />
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white py-6">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 font-mono">
        <div>SiReDo REST API · Sistem Rekomendasi Dosen</div>
        <div>Hybrid BM25 + SBERT · Polibatam</div>
      </div>
    </footer>
  </div>
</template>
