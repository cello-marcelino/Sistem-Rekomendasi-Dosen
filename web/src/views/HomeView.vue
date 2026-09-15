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
          <span>{{ serverStatus === 'online' && cacheReady ? 'Online' : serverStatus === 'online' ? 'Sync' : serverStatus === 'checking' ? 'Checking' : 'Offline' }}</span>
        </div>

        <a
          href="http://localhost:5174"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden sm:inline-flex text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors no-underline"
        >
          Web Kampus ↗
        </a>

        <router-link
          to="/docs"
          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-[4px] shadow-sm transition-opacity hover:opacity-90 no-underline"
          style="background-color: oklch(54.1% 0.281 293.009)"
        >
          Dokumentasi
        </router-link>
      </div>
    </header>

    <!-- Minimalist Hero -->
    <section class="bg-white border-b border-gray-200 py-12 sm:py-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-3">
        <h1 class="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
          REST API Rekomendasi Dosen
        </h1>

        <p class="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          Pencocokan judul dan abstrak skripsi mahasiswa dengan keahlian dosen menggunakan hybrid <strong class="text-gray-900 font-semibold">BM25</strong> dan <strong class="text-gray-900 font-semibold">SBERT</strong>.
        </p>

        <div class="flex items-center justify-center gap-3 pt-2">
          <router-link
            to="/docs"
            class="px-4 py-2 text-xs font-semibold text-white rounded-[4px] shadow-sm transition-opacity hover:opacity-90 no-underline"
            style="background-color: oklch(54.1% 0.281 293.009)"
          >
            Buka Dokumentasi →
          </router-link>

          <a
            href="#demo"
            class="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-[4px] shadow-sm transition-colors no-underline"
          >
            Uji Coba Langsung ↓
          </a>
        </div>
      </div>
    </section>

    <!-- Compact API Contract Preview -->
    <section class="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
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
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-sans font-semibold">Request Body (JSON)</div>
            <pre class="leading-relaxed text-[11px] font-mono"><code>{
  "judul": "Klasifikasi Teks dengan IndoBERT",
  "abstrak": "Analisis sentimen berbasis transformer...",
  "top_k": 5
}</code></pre>
          </div>

          <!-- Response -->
          <div class="p-4 bg-slate-950 text-slate-200 overflow-x-auto">
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-sans font-semibold">Response (200 OK)</div>
            <pre class="leading-relaxed text-[11px] font-mono"><code class="text-emerald-400">{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "dosen": { "nama": "Dr. Eng. ..." },
        "scores": { "hybrid": 0.842, "bm25": 0.79, "sbert": 0.89 }
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
      SiReDo API · Hybrid BM25 + SBERT
    </footer>
  </div>
</template>
