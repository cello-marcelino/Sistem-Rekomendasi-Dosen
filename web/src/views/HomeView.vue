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
        <a href="#perbandingan" class="hover:text-gray-900 transition-colors no-underline">Alur Kerja</a>
        <a href="#kapabilitas" class="hover:text-gray-900 transition-colors no-underline">Kapabilitas API</a>
        <a href="#demo" class="hover:text-gray-900 transition-colors no-underline">Uji Coba Live</a>
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

    <!-- Hero Section with Visual Pipeline Architecture -->
    <section class="bg-white border-b border-gray-200 py-12 sm:py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <div
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border"
          style="color: oklch(54.1% 0.281 293.009); background-color: oklch(96.5% 0.025 293.009); border-color: oklch(88% 0.08 293.009)"
        >
          REST API ENGINE REKOMENDASI TUGAS AKHIR
        </div>

        <h1 class="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight font-sans">
          Otomatiskan Penugasan Pembimbing &amp; Penguji Skripsi
        </h1>

        <p class="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          Hubungkan portal skripsi kampus dengan engine hybrid NLP (BM25 + SBERT) via REST API.
        </p>

        <div class="flex items-center justify-center gap-3 pt-1">
          <router-link
            to="/docs"
            class="px-4 py-2 text-xs font-semibold text-white rounded-[4px] shadow-sm transition-opacity hover:opacity-90 no-underline"
            style="background-color: oklch(54.1% 0.281 293.009)"
          >
            Buka Dokumentasi API →
          </router-link>

          <a
            href="#demo"
            class="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-[4px] shadow-sm transition-colors no-underline"
          >
            Uji Coba Langsung ↓
          </a>
        </div>

        <!-- Visual Integration Diagram (Visual Graphic Hook) -->
        <div class="pt-8">
          <div class="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-6 text-left shadow-sm">
            <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-3 mb-4">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                Topologi Integrasi REST API
              </span>
              <span class="text-slate-500">Latency &lt; 100ms</span>
            </div>

            <!-- Flow Nodes Graphic -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center font-mono">
              <!-- Node 1 -->
              <div class="p-3 bg-slate-800/80 border border-slate-700 rounded text-left space-y-1">
                <div class="text-[10px] text-slate-400 uppercase tracking-wider">Sumber Sistem</div>
                <div class="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  SIAKAD / Portal Kampus
                </div>
                <div class="text-[10px] text-slate-400 truncate">Payload: Judul &amp; Abstrak</div>
              </div>

              <!-- Node 2 (Engine) -->
              <div
                class="p-3 rounded text-left space-y-1 relative border"
                style="background-color: oklch(54.1% 0.281 293.009 / 0.15); border-color: oklch(54.1% 0.281 293.009 / 0.4)"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase tracking-wider font-bold" style="color: oklch(88% 0.08 293.009)">Engine AI</span>
                  <span class="px-1 py-0.2 text-[9px] font-bold rounded text-white" style="background-color: oklch(54.1% 0.281 293.009)">POST</span>
                </div>
                <div class="text-xs font-bold text-white flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-amber-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  SiReDo Hybrid Core
                </div>
                <div class="text-[10px] text-slate-300">BM25 (Leksikal) + SBERT</div>
              </div>

              <!-- Node 3 -->
              <div class="p-3 bg-slate-800/80 border border-slate-700 rounded text-left space-y-1">
                <div class="text-[10px] text-slate-400 uppercase tracking-wider">Hasil Rekomendasi</div>
                <div class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Top-K Dosen + XAI
                </div>
                <div class="text-[10px] text-slate-400 truncate">Skor Kecocokan &amp; Kata Kunci</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Visual Comparison: Manual vs SiReDo API Flow -->
    <section id="perbandingan" class="py-12 border-b border-gray-200 bg-slate-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div class="text-center">
          <h2 class="text-lg font-bold text-gray-900 tracking-tight font-sans">
            Perbandingan Alur Kerja: Manual vs SiReDo API
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">Transformasi proses alokasi dari 2 minggu menjadi sub-detik.</p>
        </div>

        <div class="space-y-4">
          <!-- Flow 1: Manual (Before) -->
          <div class="bg-white border border-rose-200 rounded-lg p-4 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 font-mono">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                Alur Manual (Konvensional)
              </span>
              <span class="text-[11px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Waktu: 1–2 Minggu · Rawan Mismatch
              </span>
            </div>

            <!-- Stepper Visual -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div class="p-2.5 rounded bg-rose-50/50 border border-rose-100 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span class="text-gray-700">100+ Proposal Masuk</span>
              </div>
              <div class="p-2.5 rounded bg-rose-50/50 border border-rose-100 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span class="text-gray-700">Sortir Judul Manual</span>
              </div>
              <div class="p-2.5 rounded bg-rose-50/50 border border-rose-100 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span class="text-gray-700">Tebakan Alokasi Dosen</span>
              </div>
            </div>
          </div>

          <!-- Flow 2: Automated (After) -->
          <div
            class="bg-white rounded-lg p-4 shadow-sm space-y-3 border"
            style="border-color: oklch(54.1% 0.281 293.009 / 0.4)"
          >
            <div class="flex items-center justify-between">
              <span
                class="inline-flex items-center gap-1.5 text-xs font-bold font-mono"
                style="color: oklch(54.1% 0.281 293.009)"
              >
                <span class="w-2 h-2 rounded-full" style="background-color: oklch(54.1% 0.281 293.009)"></span>
                Alur SiReDo API (Otomatis)
              </span>
              <span class="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Waktu: &lt; 1 Detik · Presisi &amp; Transparan
              </span>
            </div>

            <!-- Stepper Visual -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div class="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span class="text-gray-800">Kirim HTTP POST JSON</span>
              </div>
              <div
                class="p-2.5 rounded flex items-center gap-2 border"
                style="background-color: oklch(96.5% 0.025 293.009); border-color: oklch(88% 0.08 293.009)"
              >
                <span
                  class="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0"
                  style="background-color: oklch(54.1% 0.281 293.009)"
                >2</span>
                <span class="text-gray-900 font-semibold">BM25 + SBERT Matching</span>
              </div>
              <div class="p-2.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span class="text-emerald-900 font-bold">Top 5 Dosen + Bukti XAI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Visual Feature Capabilities: Interactive UI Widgets -->
    <section id="kapabilitas" class="py-14 bg-white border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div class="text-center max-w-xl mx-auto">
          <h2 class="text-lg font-bold text-gray-900 font-sans tracking-tight">
            Kapabilitas Sistem yang Dapat Anda Bangun
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">Pratinjau antarmuka yang dapat dihasilkan oleh sistem akademik Anda.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Widget 1: Advisor Matcher -->
          <div class="border border-gray-200 rounded-lg p-4 shadow-sm bg-slate-50/50 space-y-3">
            <div class="flex items-center justify-between border-b border-gray-200 pb-2">
              <span class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" style="background-color: oklch(54.1% 0.281 293.009)"></span>
                Rekomendasi Pembimbing Instan
              </span>
              <code class="text-[10px] font-mono text-gray-400">POST /rekomendasi/single</code>
            </div>

            <!-- Mini UI Mockup -->
            <div class="bg-white border border-gray-200 rounded p-3 space-y-2 text-xs">
              <div class="text-[11px] text-gray-500">Proposal: <strong class="text-gray-800">"Klasifikasi Teks dengan IndoBERT"</strong></div>
              <div class="flex items-center justify-between p-2 rounded bg-emerald-50/80 border border-emerald-200">
                <span class="font-semibold text-emerald-950">Dr. Eng. Ir. Dosen A</span>
                <span class="font-mono text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">94.2% Match</span>
              </div>
              <div class="text-[10px] text-gray-500 flex items-center gap-1">
                <span>Topik:</span>
                <span class="bg-gray-100 px-1 rounded text-gray-700">NLP</span>
                <span class="bg-gray-100 px-1 rounded text-gray-700">Deep Learning</span>
              </div>
            </div>
          </div>

          <!-- Widget 2: Examiner Allocation -->
          <div class="border border-gray-200 rounded-lg p-4 shadow-sm bg-slate-50/50 space-y-3">
            <div class="flex items-center justify-between border-b border-gray-200 pb-2">
              <span class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                Penugasan Penguji Sidang Otomatis
              </span>
              <code class="text-[10px] font-mono text-gray-400">POST /rekomendasi/batch</code>
            </div>

            <!-- Mini UI Mockup -->
            <div class="bg-white border border-gray-200 rounded p-3 space-y-2 text-xs">
              <div class="flex items-center justify-between text-[11px] text-gray-500">
                <span>Sidang Mahasiswa: <strong class="text-gray-800">Mhs. Budi (IoT Sensor)</strong></span>
                <span class="text-blue-600 font-mono">Bebas Konflik</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div class="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-950">
                  <div class="text-[9px] text-blue-500 font-bold">PENGUJI 1</div>
                  <div class="font-semibold truncate">Dr. Ir. Penguji A</div>
                </div>
                <div class="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-950">
                  <div class="text-[9px] text-blue-500 font-bold">PENGUJI 2</div>
                  <div class="font-semibold truncate">Dr. Penguji B, M.T.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Widget 3: Batch Research Mapping -->
          <div class="border border-gray-200 rounded-lg p-4 shadow-sm bg-slate-50/50 space-y-3">
            <div class="flex items-center justify-between border-b border-gray-200 pb-2">
              <span class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                Audit Riset Angkatan via Excel
              </span>
              <code class="text-[10px] font-mono text-gray-400">POST /batch/upload</code>
            </div>

            <!-- Mini UI Mockup -->
            <div class="bg-white border border-gray-200 rounded p-3 space-y-2 text-xs font-mono">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-gray-700 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  skripsi_angkatan_2026.xlsx
                </span>
                <span class="text-emerald-700 font-bold">142 Baris</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div class="bg-emerald-500 h-1.5 w-full"></div>
              </div>
              <div class="flex justify-between text-[10px] text-gray-500">
                <span>AI: 48</span>
                <span>IoT: 44</span>
                <span>Jaringan: 50</span>
              </div>
            </div>
          </div>

          <!-- Widget 4: XAI Akreditasi -->
          <div class="border border-gray-200 rounded-lg p-4 shadow-sm bg-slate-50/50 space-y-3">
            <div class="flex items-center justify-between border-b border-gray-200 pb-2">
              <span class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-teal-600"></span>
                Transparansi Skor &amp; Bukti Akreditasi
              </span>
              <code class="text-[10px] font-mono text-gray-400">payload.xai</code>
            </div>

            <!-- Mini UI Mockup -->
            <div class="bg-white border border-gray-200 rounded p-3 space-y-2 text-xs font-mono">
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-gray-600">Formula Skor Hibrida:</span>
                <span class="font-bold" style="color: oklch(54.1% 0.281 293.009)">0.4 BM25 + 0.6 SBERT</span>
              </div>
              <div class="flex flex-wrap gap-1 pt-1">
                <span class="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-sans">✓ irisan kata kunci cocok</span>
                <span class="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-sans">✓ publikasi relevan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Developer Compact Contract Box -->
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
            <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-sans font-semibold">Request Body (JSON)</div>
            <pre class="leading-relaxed text-[11px] font-mono"><code>{
  "judul": "Klasifikasi Teks dengan IndoBERT",
  "abstrak": "Analisis sentimen transformer...",
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
        "scores": { "hybrid": 0.942, "bm25": 0.88, "sbert": 0.96 }
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
