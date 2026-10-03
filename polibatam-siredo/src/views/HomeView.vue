<template>
  <div class="space-y-6 pb-12 animate-in font-sans">
    
    <!-- 1. Header & Realtime Telemetry Control Bar -->
    <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5 pt-1">
      <div>
        <div class="inline-flex items-center gap-2 mb-1.5">
          <span class="w-2 h-2 rounded-full" :class="stats.system.status === 'ready' ? 'bg-teal-600' : 'bg-amber-500 animate-pulse'"></span>
          <span class="text-tiny font-sans font-bold tracking-wider text-teal-800 uppercase">
            Sistem Informasi Operasional
          </span>
        </div>
        <h1 class="text-h1 font-bold tracking-tight text-gray-900 font-sans">
          Dashboard Operasional Sistem
        </h1>
        <p class="text-base text-gray-600 mt-1 max-w-2xl leading-relaxed font-normal">
          Pemantauan korpus kepakaran dosen, alokasi sidang, dan telemetri mesin rekomendasi secara waktu nyata.
        </p>
      </div>

      <!-- Realtime System Status Controls -->
      <div class="flex flex-wrap items-center gap-2 text-base font-sans">
        <!-- Engine Status Badge -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white shadow-2xs"
             :class="stats.system.status === 'ready' ? 'border-emerald-200 text-emerald-800' : 'border-amber-200 text-amber-800'">
          <span class="w-2 h-2 rounded-full" :class="stats.system.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'"></span>
          <span class="font-semibold">{{ stats.system.status === 'ready' ? 'Engine NLP: Siap' : 'Engine: Inisialisasi' }}</span>
        </div>

        <!-- Hardware Device -->
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-2xs">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <span>Device:</span>
          <span class="font-mono font-bold text-teal-800">{{ stats.system.device }}</span>
        </div>

        <!-- Last Sync Time -->
        <div class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 shadow-2xs">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Sinkronisasi:</span>
          <span class="font-mono font-semibold text-gray-800 tabular-nums">{{ lastSyncFormatted }}</span>
        </div>

        <!-- Refresh Button -->
        <button
          @click="refreshData"
          :disabled="loading"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          title="Segarkan data statistik dan status operasional"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ loading ? 'Memuat...' : 'Segarkan' }}</span>
        </button>
      </div>
    </header>

    <!-- 2. Primary KPI Grid: 4 Core Operational Dimensions -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- KPI 1: Dosen Aktif Terindeks -->
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-h3 font-bold font-sans text-gray-700 mb-2">
            <span>Dosen Terindeks</span>
            <span class="text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-tiny font-sans font-semibold">Aktif</span>
          </div>
          <div class="text-h1 font-bold font-mono text-gray-900 tabular-nums">
            {{ stats.totalDosen }} <span class="text-base font-sans font-normal text-gray-500">Dosen</span>
          </div>
          <p class="text-base text-gray-600 mt-1.5 font-sans">
            Tersebar di <span class="font-mono font-semibold">{{ stats.prodiDistribution.length }}</span> program studi aktif.
          </p>
        </div>
        <div class="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-base">
          <router-link to="/dosen" class="font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 transition-colors">
            <span>Lihat Direktori</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </router-link>
          <span class="text-tiny text-gray-500 font-sans"><span class="font-mono tabular-nums font-semibold">100%</span> Siap</span>
        </div>
      </div>

      <!-- KPI 2: Korpus Rekam Jejak Riset -->
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-h3 font-bold font-sans text-gray-700 mb-2">
            <span>Korpus Riset & TA</span>
            <span class="text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-tiny font-sans font-semibold">Leksikal</span>
          </div>
          <div class="text-h1 font-bold font-mono text-gray-900 tabular-nums">
            {{ stats.totalPublikasi + stats.totalBimbingan + stats.totalPengujian }} <span class="text-base font-sans font-normal text-gray-500">Karya</span>
          </div>
          <p class="text-base text-gray-600 mt-1.5 font-sans truncate">
            <span class="font-mono font-semibold">{{ stats.totalPublikasi }}</span> Jurnal · 
            <span class="font-mono font-semibold">{{ stats.totalBimbingan }}</span> Bimbingan · 
            <span class="font-mono font-semibold">{{ stats.totalPengujian }}</span> Sidang
          </p>
        </div>
        <div class="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-base">
          <router-link to="/admin/dosen" class="font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 transition-colors">
            <span>Kelola Profil</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </router-link>
          <span class="text-tiny text-gray-500 font-sans"><span class="font-mono tabular-nums font-semibold">{{ (stats.totalPublikasi / (stats.totalDosen || 1)).toFixed(1) }}</span> pub/dsn</span>
        </div>
      </div>

      <!-- KPI 3: Parameter Pembobotan Aktif -->
      <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-h3 font-bold font-sans text-gray-700 mb-2">
            <span>Bobot Korpus Dosen</span>
            <span class="text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-tiny font-sans font-semibold">Multipliers</span>
          </div>
          <div class="text-h1 font-bold font-mono text-gray-900 tabular-nums">
            {{ stats.config.weightKeahlian }}<span class="text-base text-gray-400">:</span>{{ stats.config.weightPublikasi }}<span class="text-base text-gray-400">:</span>{{ stats.config.weightBimbingan }}<span class="text-base text-gray-400">:</span>{{ stats.config.weightPengujian }}
          </div>
          <p class="text-base text-gray-600 mt-1.5 font-sans">
            Keahlian {{ stats.config.weightKeahlian }}x, Publikasi {{ stats.config.weightPublikasi }}x, Bimb/Uji {{ stats.config.weightBimbingan }}x.
          </p>
        </div>
        <div class="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-base">
          <router-link to="/admin/config" class="font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 transition-colors">
            <span>Konfigurasi Bobot</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </router-link>
          <span class="text-tiny text-gray-500 font-sans font-semibold">BM25 Okapi</span>
        </div>
      </div>

      <!-- KPI 4: Kapasitas Sidang Operasional -->
      <div class="bg-teal-50/50 border border-teal-200/80 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-h3 font-bold font-sans text-teal-900 mb-2">
            <span>Kapasitas Sidang TA</span>
            <span class="text-teal-800 bg-teal-100 px-2 py-0.5 rounded text-tiny font-sans font-bold">Penjadwalan</span>
          </div>
          <div class="text-h1 font-bold font-mono text-teal-950 tabular-nums">
            45 <span class="text-base font-sans font-normal text-teal-800">Slot / Periode</span>
          </div>
          <p class="text-base text-teal-900 mt-1.5 font-sans">
            3 Ruang Sidang aktif · 3 Sesi sidang/hari · 5 Hari kerja.
          </p>
        </div>
        <div class="pt-4 mt-3 border-t border-teal-200/70 flex items-center justify-between text-base">
          <router-link to="/admin/penjadwalan" class="font-semibold text-teal-900 hover:text-teal-950 inline-flex items-center gap-1 transition-colors">
            <span>Kelola Jadwal</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </router-link>
          <span class="text-tiny text-teal-800 font-sans font-semibold">Bebas Bentrok</span>
        </div>
      </div>

    </section>

    <!-- 3. Core Analytics Grid: Prodi Breakdown & Top Expertise Matrix -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Section A: Distribusi Dosen & Riset per Program Studi (7 Cols) -->
      <section class="lg:col-span-7 bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden flex flex-col">
        <div class="px-5 py-3.5 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
          <div>
            <h2 class="text-h2 font-sans font-bold tracking-tight text-gray-900">
              Distribusi Dosen per Program Studi
            </h2>
            <p class="text-base text-gray-600 font-sans mt-0.5">
              Visualisasi jumlah dosen aktif pada masing-masing prodi
            </p>
          </div>
          <span class="text-tiny font-sans font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-600">
            <strong class="font-mono tabular-nums font-semibold">{{ stats.prodiDistribution.length }}</strong> Prodi
          </span>
        </div>

        <div class="p-5 flex-1 min-h-[300px]">
          <Bar v-if="chartDataBar.labels.length" :data="chartDataBar" :options="chartOptionsBar" />
          <div v-else class="h-full flex items-center justify-center text-gray-400 text-base">
            Memuat data chart...
          </div>
        </div>
      </section>

      <!-- Section B: Klaster Bidang Keahlian Pokok (5 Cols) -->
      <section class="lg:col-span-5 bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden flex flex-col">
        <div class="px-5 py-3.5 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
          <div>
            <h2 class="text-h2 font-sans font-bold tracking-tight text-gray-900">
              Top 8 Klaster Keahlian
            </h2>
            <p class="text-base text-gray-600 font-sans mt-0.5">
              Distribusi domain riset berdasarkan korpus kepakaran
            </p>
          </div>
          <span class="text-tiny font-sans font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-600">
            Top <strong class="font-mono tabular-nums font-semibold">8</strong>
          </span>
        </div>

        <div class="p-5 flex-1 min-h-[300px] flex items-center justify-center">
          <Doughnut v-if="chartDataDoughnut.labels.length" :data="chartDataDoughnut" :options="chartOptionsDoughnut" />
          <div v-else class="h-full flex items-center justify-center text-gray-400 text-base">
            Memuat data chart...
          </div>
        </div>
      </section>

    </div>

    <!-- 4. Realtime NLP Pipeline Telemetry & Active Model Parameters -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Telemetry Pipeline Components (7 Cols) -->
      <section class="lg:col-span-7 bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
          <div>
            <h2 class="text-h2 font-sans font-bold tracking-tight text-gray-900">
              Telemetri Pipeline Komponen NLP
            </h2>
            <p class="text-base text-gray-600 font-sans mt-0.5">
              Status waktu eksekusi warm-up dan latensi tahapan inferensi
            </p>
          </div>
          <span class="inline-flex items-center gap-1 text-tiny font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {{ stats.system.elapsedSeconds }}s Total Warmup
          </span>
        </div>

        <div class="divide-y divide-gray-100 font-sans">
          <div 
            v-for="step in stats.system.steps" 
            :key="step.id"
            class="px-5 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors text-base"
          >
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-base font-mono font-bold shrink-0">
                <svg class="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <span class="font-semibold text-gray-900 font-sans">{{ step.title }}</span>
                <span class="text-base text-gray-500 ml-2 hidden sm:inline">{{ step.detail || step.desc }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-base font-mono font-bold text-teal-800 tabular-nums">
                {{ step.duration_ms }} ms
              </span>
              <span class="text-tiny font-sans font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                OK
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Active Model Configuration (5 Cols) -->
      <section class="lg:col-span-5 bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
          <div>
            <h2 class="text-h2 font-sans font-bold tracking-tight text-gray-900">
              Parameter Aktif Rekomendasi
            </h2>
            <p class="text-base text-gray-600 font-sans mt-0.5">
              Nilai operasional algoritma BM25 dan ambang batas
            </p>
          </div>
          <router-link to="/admin/config" class="text-base font-sans font-semibold text-teal-700 hover:text-teal-900 underline">
            Edit
          </router-link>
        </div>

        <div class="divide-y divide-gray-100 text-base font-sans">
          <div class="px-5 py-3 flex items-center justify-between">
            <span class="text-gray-600">Model Pencocokan Semantik</span>
            <span class="font-bold text-gray-900 font-sans">IndoBERT + KeyBERT</span>
          </div>

          <div class="px-5 py-3 flex items-center justify-between">
            <span class="text-gray-600">Parameter Okapi BM25</span>
            <span class="font-mono font-semibold text-teal-800">k1 = {{ stats.config.bm25K1.toFixed(2) }} · b = {{ stats.config.bm25B.toFixed(2) }}</span>
          </div>

          <div class="px-5 py-3 flex items-center justify-between">
            <span class="text-gray-600">Metode Bobot Alpha (&alpha;)</span>
            <span class="inline-flex items-center gap-1 font-semibold text-gray-900">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              {{ stats.config.isAdaptive ? 'Adaptive Threshold (' + stats.config.adaptiveThreshold + ' kata)' : 'Manual' }}
            </span>
          </div>

          <div class="px-5 py-3 flex items-center justify-between">
            <span class="text-gray-600">Ambang Batas Skor (Cutoff)</span>
            <span class="font-mono font-bold text-teal-800 tabular-nums">&ge; {{ stats.config.threshold.toFixed(2) }}</span>
          </div>

          <div class="px-5 py-3 flex items-center justify-between">
            <span class="text-gray-600">Default Kuota Top-K</span>
            <span class="font-mono font-bold text-gray-900 tabular-nums">{{ stats.config.topK }} Kandidat</span>
          </div>
        </div>
      </section>

    </div>

    <!-- 5. Fast Operational Actions (Direct System Shortcuts) -->
    <section class="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs">
      <div class="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <div>
          <h2 class="text-h2 font-sans font-bold tracking-tight text-gray-900">
            Aksi Cepat Operasional
          </h2>
          <p class="text-base text-gray-600 font-sans mt-0.5">
            Pintasan langsung menuju alur kerja dan administrasi sidang
          </p>
        </div>
        <span class="text-tiny font-sans font-semibold px-2 py-0.5 bg-gray-100 rounded text-gray-600">4 Modul Utama</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-sans">
        <!-- Shortcut 1 -->
        <router-link 
          to="/rekomendasi"
          class="p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/20 transition-all group flex flex-col justify-between shadow-2xs"
        >
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <div class="text-h3 font-bold text-gray-900 group-hover:text-teal-800 transition-colors font-sans">
                Rekomendasi Proposal
              </div>
              <p class="text-base text-gray-600 mt-1 line-clamp-2">
                Pencocokan judul dan abstrak mandiri dengan kepakaran dosen.
              </p>
            </div>
          </div>
          <div class="mt-3 pt-2 text-base font-semibold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Buka Modul</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </div>
        </router-link>

        <!-- Shortcut 2 -->
        <router-link 
          to="/admin/batch"
          class="p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/20 transition-all group flex flex-col justify-between shadow-2xs"
        >
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <div class="text-h3 font-bold text-gray-900 group-hover:text-teal-800 transition-colors font-sans">
                Batch Matching Excel
              </div>
              <p class="text-base text-gray-600 mt-1 line-clamp-2">
                Pemrosesan massal proposal prodi dengan sebaran kuota otomatis.
              </p>
            </div>
          </div>
          <div class="mt-3 pt-2 text-base font-semibold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Buka Modul</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </div>
        </router-link>

        <!-- Shortcut 3 -->
        <router-link 
          to="/admin/penjadwalan"
          class="p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/20 transition-all group flex flex-col justify-between shadow-2xs"
        >
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <div class="text-h3 font-bold text-gray-900 group-hover:text-teal-800 transition-colors font-sans">
                Auto-Penjadwalan Sidang
              </div>
              <p class="text-base text-gray-600 mt-1 line-clamp-2">
                Penetapan ruang, slot waktu, dan susunan penguji 1 & 2.
              </p>
            </div>
          </div>
          <div class="mt-3 pt-2 text-base font-semibold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Buka Modul</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </div>
        </router-link>

        <!-- Shortcut 4 -->
        <router-link 
          to="/admin/dosen"
          class="p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/20 transition-all group flex flex-col justify-between shadow-2xs"
        >
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <div>
              <div class="text-h3 font-bold text-gray-900 group-hover:text-teal-800 transition-colors font-sans">
                Kelola Database Dosen
              </div>
              <p class="text-base text-gray-600 mt-1 line-clamp-2">
                Pembaruan riwayat bimbingan, jurnal, dan sinkronisasi korpus.
              </p>
            </div>
          </div>
          <div class="mt-3 pt-2 text-base font-semibold text-teal-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Buka Modul</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </div>
        </router-link>
      </div>
    </section>

    <!-- 6. Operational Topic Tester Console (Quick Match Verification) -->
    <section class="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h2 class="text-h2 font-sans font-bold tracking-tight text-gray-900">
            Konsol Pengujian Cepat Topik Tugas Akhir
          </h2>
          <p class="text-base text-gray-600 font-sans mt-0.5">
            Verifikasi kesesuaian kata kunci atau draf proposal terhadap korpus dosen secara langsung
          </p>
        </div>
        <span class="text-tiny font-mono text-gray-500">Endpoint /api/recommend</span>
      </div>

      <div class="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-3">
        <form @submit.prevent="handleQuickSearch" class="flex flex-col sm:flex-row items-stretch gap-2">
          <div class="relative flex-1 flex items-center">
            <svg class="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Masukkan topik atau judul riset pengujian (contoh: Deteksi Intrusi Jaringan SIEM)..." 
              class="w-full pl-9 pr-3 py-2 text-base text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-md outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-sans shadow-2xs"
            />
          </div>
          <button 
            type="submit"
            class="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-base font-semibold rounded-md shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Uji Rekomendasi</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>

      <!-- Preset Chips -->
      <div class="flex flex-wrap items-center gap-y-2 gap-x-3 text-base">
        <span class="text-gray-500 font-sans text-tiny uppercase tracking-wider font-semibold">Uji Draf Cepat:</span>
        <div class="flex flex-wrap items-center gap-1.5">
          <button 
            v-for="chip in presetChips" 
            :key="chip"
            @click="selectPreset(chip)"
            type="button"
            class="px-3 py-1 bg-white hover:bg-teal-50 border border-gray-200 hover:border-teal-300 text-gray-700 hover:text-teal-900 rounded text-base transition-colors font-sans cursor-pointer shadow-2xs"
          >
            {{ chip }}
          </button>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchDashboardStats } from '../services/statsService.js'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')

const presetChips = [
  'Chatbot NLP BERT',
  'Computer Vision CNN',
  'Keamanan Siber SIEM',
  'Sistem Pendukung Keputusan'
]

const stats = ref({
  totalDosen: 86,
  totalPublikasi: 120,
  totalBimbingan: 250,
  totalPengujian: 180,
  prodiDistribution: [],
  topExpertise: [],
  system: {
    status: 'ready',
    device: 'CPU',
    cacheReady: true,
    elapsedSeconds: 10.22,
    completedAt: null,
    steps: []
  },
  config: {
    weightKeahlian: 5,
    weightPublikasi: 2,
    weightBimbingan: 1,
    weightPengujian: 1,
    bm25K1: 1.5,
    bm25B: 0.75,
    isAdaptive: true,
    adaptiveThreshold: 15,
    threshold: 0.3,
    topK: 5
  },
  lastFetchedAt: new Date().toISOString(),
  isLoaded: false
})

const lastSyncFormatted = computed(() => {
  if (!stats.value.lastFetchedAt) return '—'
  const d = new Date(stats.value.lastFetchedAt)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const loadStats = async () => {
  loading.value = true
  try {
    const data = await fetchDashboardStats()
    if (data) {
      stats.value = data
    }
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadStats()
}

// Chart Options & Data
const chartOptionsBar = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      titleFont: { size: 16, family: 'Inter, sans-serif' },
      bodyFont: { size: 16, family: 'Inter, sans-serif' }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        font: { size: 11, family: 'Inter, sans-serif' }
      }
    },
    x: {
      ticks: {
        font: { size: 11, family: 'Inter, sans-serif' }
      }
    }
  }
}

const chartDataBar = computed(() => {
  return {
    labels: stats.value.prodiDistribution.map(item => item.prodi),
    datasets: [
      {
        label: 'Jumlah Dosen',
        backgroundColor: '#0f766e',
        borderRadius: 4,
        data: stats.value.prodiDistribution.map(item => item.count)
      }
    ]
  }
})

const chartOptionsDoughnut = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        font: { size: 11, family: 'Inter, sans-serif' },
        usePointStyle: true,
        boxWidth: 8
      }
    },
    tooltip: {
      titleFont: { size: 16, family: 'Inter, sans-serif' },
      bodyFont: { size: 16, family: 'Inter, sans-serif' }
    }
  }
}

const chartDataDoughnut = computed(() => {
  return {
    labels: stats.value.topExpertise.map(item => item.name),
    datasets: [
      {
        backgroundColor: [
          '#0f766e', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1', '#042f2e', '#115e59'
        ],
        borderWidth: 0,
        data: stats.value.topExpertise.map(item => item.count)
      }
    ]
  }
})

const handleQuickSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    router.push({ path: '/rekomendasi', query: { judul: query } })
  } else {
    router.push('/rekomendasi')
  }
}

const selectPreset = (chip) => {
  searchQuery.value = chip
  router.push({ path: '/rekomendasi', query: { judul: chip } })
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.animate-in {
  animation: fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
