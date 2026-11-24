<template>
  <div class="relative min-h-screen bg-hero-soft pb-20">
    <!-- Top Navigation Bar -->
    <Navbar />

    <!-- Page Header Container -->
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      
      <!-- Breadcrumb & Header Title -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs text-text-muted font-medium">
          <router-link to="/" class="hover:text-academic-navy transition-colors">Beranda</router-link>
          <span>/</span>
          <span class="text-text-dark font-semibold">Dosen & Pembimbing</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-academic-navy tracking-tight">
              Informasi & Rekomendasi Dosen
            </h1>
            <p class="text-xs sm:text-sm text-text-muted mt-1">
              Temukan dosen pembimbing tugas akhir melalui eksplorasi direktori manual atau rekomendasi cerdas berbasis analisis topik.
            </p>
          </div>

          <!-- Total Dosen Counter Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-border-mist self-start sm:self-auto shadow-card">
            <IconUsers customClass="w-4 h-4 text-academic-navy" />
            <span class="text-xs font-semibold text-text-muted">Total Basis Data:</span>
            <span class="text-xs font-mono font-bold text-academic-navy">{{ dosenList.length || 86 }} Dosen</span>
          </div>
        </div>
      </div>

      <!-- Segmented Mode Switcher (Tab 1: Manual vs Tab 2: Rekomendasi) -->
      <div class="p-1.5 bg-bg-subtle rounded-xl max-w-xl flex gap-1 border border-border-mist">
        <button
          type="button"
          @click="activeMode = 'manual'"
          class="flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          :class="activeMode === 'manual'
            ? 'bg-white text-academic-navy shadow-xs'
            : 'text-text-muted hover:text-text-dark hover:bg-white/50'"
        >
          <IconUsers customClass="w-4 h-4 text-academic-navy" />
          <span>Direktori Manual Dosen</span>
        </button>
        <button
          type="button"
          @click="activeMode = 'rekomendasi'"
          class="flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          :class="activeMode === 'rekomendasi'
            ? 'bg-white text-academic-navy shadow-xs'
            : 'text-text-muted hover:text-text-dark hover:bg-white/50'"
        >
          <IconCpuChip customClass="w-4 h-4 text-academic-navy" />
          <span>Rekomendasi Cerdas Top-K</span>
        </button>
      </div>

      <!-- ========================================================================= -->
      <!-- MODE 1: CARI DOSEN MANUAL (Data Table Sederhana & Filter Domain IT)        -->
      <!-- ========================================================================= -->
      <section v-if="activeMode === 'manual'" class="space-y-5 animate-card-fade-in">
        
        <!-- Filter Controls Container -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-border-mist shadow-sm space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            <!-- Real-Time Search Bar -->
            <div class="relative flex-1 max-w-md">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
                <IconSearch customClass="w-4 h-4 text-text-muted" />
              </span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama dosen, keahlian, atau prodi..."
                class="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-border-subtle bg-white text-text-dark placeholder:text-text-muted placeholder:opacity-50 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-dark cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <!-- Flowbite Prodi Dropdown Filter Component -->
            <div class="relative w-full sm:w-auto" ref="prodiDropdownRef">
              <button
                id="dropdownProdiButton"
                type="button"
                @click="isProdiDropdownOpen = !isProdiDropdownOpen"
                class="w-full sm:w-auto text-text-dark bg-white hover:bg-bg-subtle hover:border-academic-navy border border-border-subtle focus:ring-2 focus:ring-accent-cyan/20 focus:outline-none font-medium rounded-lg text-xs sm:text-sm px-3.5 py-2 text-center inline-flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-xs min-w-50"
                :aria-expanded="isProdiDropdownOpen"
              >
                <span class="flex items-center gap-1.5 truncate">
                  <span class="text-text-muted text-xs font-normal">Prodi:</span>
                  <span class="font-semibold text-academic-navy truncate">
                    {{ selectedProdi === 'all' ? 'Semua Program Studi' : selectedProdi }}
                  </span>
                </span>
                <svg
                  :class="['w-2.5 h-2.5 text-text-muted transition-transform duration-200 shrink-0', isProdiDropdownOpen ? 'rotate-180' : '']"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                </svg>
              </button>

              <!-- Flowbite Dropdown Menu Popover -->
              <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isProdiDropdownOpen"
                  id="dropdownProdiMenu"
                  class="absolute left-0 sm:left-auto sm:right-0 z-30 mt-1.5 w-full sm:w-64 bg-white divide-y divide-border-mist rounded-xl shadow-md border border-border-mist focus:outline-none overflow-hidden"
                >
                  <div class="px-3.5 py-2 bg-bg-subtle border-b border-border-mist flex items-center justify-between">
                    <span class="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Pilih Program Studi</span>
                    <button
                      v-if="selectedProdi !== 'all'"
                      type="button"
                      @click="selectProdi('all')"
                      class="text-[11px] text-academic-navy hover:underline cursor-pointer font-medium"
                    >
                      Reset
                    </button>
                  </div>
                  <ul class="py-1 text-xs text-text-dark max-h-60 overflow-y-auto" aria-labelledby="dropdownProdiButton">
                    <li>
                      <button
                        type="button"
                        @click="selectProdi('all')"
                        :class="[
                          'w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer',
                          selectedProdi === 'all'
                            ? 'bg-bg-subtle text-academic-navy font-bold'
                            : 'text-text-dark hover:bg-bg-subtle'
                        ]"
                      >
                        <span>Semua Program Studi</span>
                        <span v-if="selectedProdi === 'all'" class="text-academic-navy font-bold">✓</span>
                      </button>
                    </li>
                    <li v-for="prodi in prodiOptions" :key="prodi">
                      <button
                        type="button"
                        @click="selectProdi(prodi)"
                        :class="[
                          'w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer',
                          selectedProdi === prodi
                            ? 'bg-bg-subtle text-academic-navy font-bold'
                            : 'text-text-dark hover:bg-bg-subtle'
                        ]"
                      >
                        <span class="truncate">{{ prodi }}</span>
                        <span v-if="selectedProdi === prodi" class="text-academic-navy font-bold shrink-0">✓</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </Transition>
            </div>
          </div>

          <!-- IT Domain Filter Pills -->
          <div class="space-y-1.5 pt-2 border-t border-slate-100">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Filter Rumpun Keahlian IT:</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                v-for="domain in itDomains"
                :key="domain.id"
                @click="selectedDomain = domain.id"
                :class="[
                  'px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                  selectedDomain === domain.id
                    ? 'border-academic-navy bg-academic-navy text-white font-semibold shadow-xs'
                    : 'border-border-mist bg-bg-subtle hover:bg-academic-soft text-academic-navy'
                ]"
              >
                {{ domain.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Count Summary & Quick Action Hint -->
        <div class="flex items-center justify-between text-xs text-text-muted px-1">
          <div>
            Menampilkan <span class="font-mono font-bold text-text-dark">{{ filteredDosenList.length }}</span> dari
            <span class="font-mono">{{ dosenList.length }}</span> dosen
            <span v-if="selectedDomain !== 'all' || selectedProdi !== 'all' || searchQuery" class="text-academic-navy font-medium ml-1">
              (terfilter)
            </span>
          </div>
          <div class="text-[11px] text-text-muted hidden sm:block">
            Tip: Klik baris dosen atau tombol aksi untuk langsung mengajukan bimbingan.
          </div>
        </div>

        <!-- Data Table Dosen Sederhana -->
        <div class="bg-white rounded-2xl border border-border-mist overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-bg-subtle border-b border-border-mist text-[11px] font-bold uppercase tracking-wider text-academic-navy">
                  <th scope="col" class="py-3 px-4 w-12 text-center font-mono whitespace-nowrap">No</th>
                  <th scope="col" class="py-3 px-4 min-w-50 whitespace-nowrap">Dosen & NIDN</th>
                  <th scope="col" class="py-3 px-4 min-w-45 whitespace-nowrap">Email Institusi</th>
                  <th scope="col" class="py-3 px-4 min-w-40 whitespace-nowrap">Program Studi</th>
                  <th scope="col" class="py-3 px-4 min-w-65">Bidang Keahlian</th>
                  <th scope="col" class="py-3 px-4 w-44 text-right whitespace-nowrap">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                
                <!-- Loading State -->
                <tr v-if="isLoadingDosen">
                  <td colspan="6" class="py-12 text-center text-text-muted space-y-2">
                    <svg class="animate-spin h-6 w-6 text-academic-navy mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div>Memuat direktori data dosen...</div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-else-if="filteredDosenList.length === 0">
                  <td colspan="6" class="py-12 text-center text-text-muted space-y-2">
                    <div class="text-sm font-semibold text-text-dark">Tidak Ada Dosen yang Sesuai</div>
                    <p class="text-xs text-text-muted max-w-sm mx-auto">
                      Tidak ditemukan dosen dengan filter "{{ itDomains.find(d => d.id === selectedDomain)?.label }}" atau kata kunci "{{ searchQuery }}".
                    </p>
                    <button
                      type="button"
                      @click="resetFilters"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg-subtle hover:bg-academic-soft text-academic-navy border border-border-subtle transition-colors cursor-pointer"
                    >
                      Reset Semua Filter
                    </button>
                  </td>
                </tr>

                <!-- Data Rows -->
                <tr
                  v-for="(dosen, idx) in paginatedDosenList"
                  :key="dosen.id || idx"
                  @click="openBimbinganModal(dosen)"
                  class="hover:bg-bg-subtle/80 transition-colors cursor-pointer group"
                >
                  <!-- No -->
                  <td class="py-3 px-4 text-center font-mono text-text-muted text-xs whitespace-nowrap">
                    {{ (currentPage - 1) * pageSize + idx + 1 }}
                  </td>

                  <!-- Nama & NIDN (Nowrap) -->
                  <td class="py-3 px-4 whitespace-nowrap">
                    <div class="font-bold text-text-dark group-hover:text-academic-navy transition-colors whitespace-nowrap">
                      {{ dosen.nama }}
                    </div>
                    <div class="text-[11px] font-mono text-text-muted mt-0.5 whitespace-nowrap">
                      NIDN: {{ dosen.nidn || '—' }}
                    </div>
                  </td>

                  <!-- Email Institusi (Nowrap) -->
                  <td class="py-3 px-4 font-mono text-xs whitespace-nowrap">
                    <span v-if="dosen.email" class="text-text-dark whitespace-nowrap">
                      {{ dosen.email }}
                    </span>
                    <span v-else class="text-text-muted italic text-[11px] whitespace-nowrap">
                      —
                    </span>
                  </td>

                  <!-- Program Studi (Nowrap) -->
                  <td class="py-3 px-4 text-text-muted whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-bg-subtle text-academic-navy border border-border-mist whitespace-nowrap">
                      {{ dosen.program_studi || 'Informatika' }}
                    </span>
                  </td>

                  <!-- Bidang Keahlian (Boleh Wrap) -->
                  <td class="py-3 px-4 text-text-dark min-w-65">
                    <div class="text-xs leading-relaxed" :title="dosen.bidang_keahlian">
                      {{ dosen.bidang_keahlian || 'Keahlian Umum Informatika' }}
                    </div>
                  </td>

                  <!-- Aksi Cepat: > Ajukan Pembimbing (Nowrap) -->
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      @click.stop="openBimbinganModal(dosen)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-border-subtle group-hover:border-academic-navy text-text-dark group-hover:text-academic-navy hover:bg-bg-subtle transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs"
                    >
                      <IconPaperAirplane customClass="w-3.5 h-3.5 text-academic-navy" />
                      <span>&gt; Ajukan Pembimbing</span>
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div v-if="totalPages > 1" class="p-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500">
              Halaman <span class="font-mono font-semibold text-slate-900">{{ currentPage }}</span> dari <span class="font-mono">{{ totalPages }}</span>
            </span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="px-2.5 py-1 text-xs rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="px-2.5 py-1 text-xs rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- MODE 2: CARI DOSEN REKOMENDASI TOP-K (Input Judul & Abstrak Proyek)       -->
      <!-- ========================================================================= -->
      <section v-else-if="activeMode === 'rekomendasi'" class="space-y-8 animate-card-fade-in">
        
        <!-- BAGIAN ATAS: Formulir Input Topik Proyek (Full Width) -->
        <div class="bg-white border border-border-mist rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
          <div class="border-b border-border-mist pb-4">
            <h2 class="text-base sm:text-lg font-bold text-academic-navy flex items-center gap-2">
              <IconCpuChip customClass="w-5 h-5 text-academic-navy" />
              <span>Input Topik Proyek / Tugas Akhir</span>
            </h2>
          </div>

          <!-- Quick Sample Topics -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Contoh Topik Cepat (Benchmark):
              </span>
              <button
                type="button"
                @click="refreshRandomSamples"
                class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-academic-navy hover:text-academic-hover hover:underline cursor-pointer transition-colors active:scale-95"
                title="Acak 4 topik baru dari benchmark samples"
              >
                <!-- Flowbite Outline Icon ArrowPath -->
                <svg class="w-3.5 h-3.5 text-accent-cyan" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                <span>Acak Topik Lain</span>
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                v-for="sample in sampleTopics"
                :key="sample.id"
                @click="applySampleTopic(sample)"
                :class="[
                  'px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer text-left font-medium active:scale-95',
                  form.judul === sample.judul
                    ? 'border-academic-navy bg-academic-navy text-white font-semibold shadow-xs'
                    : 'border-border-subtle bg-bg-subtle hover:bg-academic-soft text-academic-navy'
                ]"
              >
                {{ sample.label }}
              </button>
            </div>
          </div>

          <!-- Input Form -->
          <form @submit.prevent="handleSearchRecommendation" class="space-y-5">
            <!-- Judul Input -->
            <div class="space-y-1.5">
              <label for="judul" class="block text-xs font-semibold text-text-dark">
                Judul Rencana Proyek
              </label>
              <input
                id="judul"
                v-model="form.judul"
                type="text"
                required
                placeholder="Contoh: Implementasi Deep Learning untuk Deteksi Objek..."
                class="w-full px-4 py-2.5 text-base sm:text-sm rounded-lg border border-border-subtle bg-white text-text-dark placeholder:text-text-muted placeholder:opacity-50 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors"
              />
            </div>

            <!-- Abstrak Input -->
            <div class="space-y-1.5">
              <label for="abstrak" class="block text-xs font-semibold text-text-dark">
                Abstrak / Deskripsi Penelitian
              </label>
              <textarea
                id="abstrak"
                v-model="form.abstrak"
                rows="5"
                placeholder="Jelaskan latar belakang permasalahan, algoritma/metode yang diajukan, dataset, dan tujuan riset secara ringkas..."
                class="w-full px-4 py-2.5 text-base sm:text-sm rounded-lg border border-border-subtle bg-white text-text-dark placeholder:text-text-muted placeholder:opacity-50 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors resize-y leading-relaxed"
              ></textarea>
            </div>

            <!-- Row Pengaturan Parameter & Tombol Aksi -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border-mist">
              <!-- Parameter: Jumlah Rekomendasi (Segmented Control) -->
              <div class="flex flex-wrap items-center gap-2.5">
                <span class="text-xs font-semibold text-text-muted whitespace-nowrap">Jumlah Rekomendasi:</span>
                <div class="inline-flex p-1 bg-bg-subtle border border-border-subtle rounded-lg">
                  <button
                    type="button"
                    v-for="k in [3, 5, 10]"
                    :key="k"
                    @click="form.k_rank = k"
                    :class="[
                      'px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer active:scale-95',
                      form.k_rank === k
                        ? 'bg-academic-navy text-white shadow-xs'
                        : 'text-text-muted hover:text-academic-navy hover:bg-white/60'
                    ]"
                  >
                    Top {{ k }} Dosen
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  @click="resetRecForm"
                  title="Kosongkan form input dan hasil rekomendasi"
                  class="px-4 py-2.5 rounded-lg border border-border-subtle bg-white hover:bg-bg-subtle text-academic-navy font-semibold text-xs sm:text-sm transition-colors cursor-pointer active:scale-95 shrink-0"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  :disabled="isLoadingRec"
                  class="flex-1 sm:flex-initial py-2.5 px-6 rounded-lg bg-academic-navy hover:bg-academic-hover text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] shadow-xs"
                >
                  <template v-if="isLoadingRec">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Menganalisis Relevansi Dosen...</span>
                  </template>
                  <template v-else>
                    <IconSearch customClass="w-4 h-4 text-white" />
                    <span>Analisis & Rekomendasikan Dosen</span>
                  </template>
                </button>
              </div>
            </div>
          </form>

          <!-- Error Message -->
          <div v-if="recError" class="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
            {{ recError }}
          </div>
        </div>

        <!-- BAGIAN BAWAH: Hasil Rekomendasi Top-K (Full Width) -->
        <div id="recommendation-results" class="space-y-4 scroll-mt-24">
          
          <!-- Default Placeholder before search -->
          <div
            v-if="!recommendationResults && !isLoadingRec"
            class="p-8 sm:p-12 rounded-2xl bg-white border border-border-mist text-center space-y-3 shadow-sm"
          >
            <div class="w-12 h-12 rounded-2xl bg-bg-subtle border border-border-subtle text-academic-navy flex items-center justify-center mx-auto">
              <IconSearch customClass="w-6 h-6 text-academic-navy" />
            </div>
            <h3 class="text-base font-bold text-text-dark">Menunggu Input Rencana Penelitian</h3>
            <p class="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              Isi formulir judul dan abstrak di atas atau klik salah satu contoh topik untuk mengevaluasi rekomendasi dosen pembimbing terbaik.
            </p>
          </div>

          <!-- Empty Results Notice -->
          <div
            v-else-if="recommendationResults && recommendationResults.length === 0"
            class="p-5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-xs space-y-1.5"
          >
            <div class="font-bold text-sm">Tidak Ada Dosen yang Memenuhi Ambang Batas</div>
            <p class="leading-relaxed text-amber-700">
              Kandidat tidak memiliki irisan kata kunci atau skor kecocokan berada di bawah ambang batas minimum. Cobalah menambahkan variasi istilah teknis pada judul atau abstrak penelitian Anda.
            </p>
          </div>

          <!-- Staggered Results List -->
          <div v-else-if="recommendationResults && recommendationResults.length > 0" class="space-y-4">
            <div class="flex items-center justify-between pb-1">
              <div class="flex items-center gap-2">
                <IconCpuChip customClass="w-4 h-4 text-academic-navy" />
                <span class="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-dark">Hasil Rekomendasi Teratas:</span>
              </div>
              <span class="text-xs font-mono text-academic-navy font-bold bg-bg-subtle px-3 py-1 rounded-full border border-border-subtle">
                {{ recommendationResults.length }} Dosen Cocok
              </span>
            </div>

            <!-- Recommendation Cards Grid (Responsive 2-column or 1-column) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(dosen, index) in recommendationResults"
                :key="dosen.id || index"
                class="animate-card-fade-in p-5 rounded-2xl border border-border-mist bg-white hover:border-accent-purple hover:shadow-card transition-all duration-300 flex flex-col justify-between space-y-3"
                :style="{ animationDelay: `${index * 80}ms` }"
              >
                <div class="space-y-3">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-academic-navy text-white text-xs font-bold flex items-center justify-center font-mono shrink-0">
                          {{ index + 1 }}
                        </span>
                        <h3 class="text-sm sm:text-base font-bold text-text-dark">
                          {{ dosen.nama }}
                        </h3>
                      </div>
                      <div class="text-xs text-text-muted font-mono flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>NIDN: {{ dosen.nidn || '—' }}</span>
                        <span>•</span>
                        <span>{{ dosen.program_studi }}</span>
                        <span v-if="dosen.email">•</span>
                        <span v-if="dosen.email" class="text-academic-navy">{{ dosen.email }}</span>
                      </div>
                    </div>

                    <!-- Skor Kecocokan Badge -->
                    <div class="text-right shrink-0">
                      <div class="text-base font-mono font-black text-academic-navy">
                        {{ Math.round((dosen.skor_akhir || 0) * 100) }}%
                      </div>
                      <div class="text-[10px] text-text-muted uppercase tracking-tight font-medium">Kecocokan</div>
                    </div>
                  </div>

                  <!-- Bidang Keahlian -->
                  <div v-if="dosen.bidang_keahlian" class="text-xs text-text-dark">
                    <span class="text-text-muted font-medium">Keahlian:</span> {{ dosen.bidang_keahlian }}
                  </div>

                  <!-- Irisan Kata Kunci yang Cocok (NLP Badges) -->
                  <div v-if="dosen.irisan_kata && dosen.irisan_kata.length > 0" class="space-y-1 pt-1 border-t border-slate-100">
                    <div class="text-[11px] text-text-muted font-medium">Irisan Kata Kunci yang Cocok:</div>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="(kata, kIdx) in dosen.irisan_kata.slice(0, 6)"
                        :key="kIdx"
                        class="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-100 border border-sky-200 text-sky-700"
                      >
                        {{ kata }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- CTA Action Button -->
                <div class="pt-2 flex justify-end border-t border-slate-100">
                  <button
                    type="button"
                    @click="openBimbinganModal(dosen)"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-border-subtle hover:border-academic-navy text-text-dark hover:text-academic-navy hover:bg-bg-subtle hover:shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <IconPaperAirplane customClass="w-3.5 h-3.5 text-academic-navy" />
                    <span>&gt; Ajukan Pembimbing</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

    </main>

    <!-- ========================================================================= -->
    <!-- MODAL DIALOG PENGAJUAN PEMBIMBING                                         -->
    <!-- ========================================================================= -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selectedDosenModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        @click.self="closeBimbinganModal"
      >
        <div class="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
          <div class="flex items-start justify-between pb-3 border-b border-border-mist">
            <div class="flex items-center gap-2">
              <IconPaperAirplane customClass="w-5 h-5 text-academic-navy" />
              <h3 class="text-base font-bold text-text-dark">Pengajuan Rencana Pembimbing</h3>
            </div>
            <button
              @click="closeBimbinganModal"
              class="text-text-muted hover:text-text-dark cursor-pointer text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <!-- Dosen Info Card -->
          <div class="p-3.5 rounded-xl bg-bg-subtle border border-border-mist space-y-1.5">
            <div class="text-xs text-text-muted font-semibold uppercase tracking-wider">Dosen Dituju:</div>
            <div class="text-sm font-bold text-text-dark">{{ selectedDosenModal.nama }}</div>
            <div class="text-xs text-text-muted font-mono">
              NIDN: {{ selectedDosenModal.nidn || '—' }} · {{ selectedDosenModal.program_studi }}
            </div>
            <div class="text-xs text-text-muted font-mono">
              Email: <span class="text-academic-navy">{{ selectedDosenModal.email || '— (Belum terdata)' }}</span>
            </div>
            <div v-if="selectedDosenModal.bidang_keahlian" class="text-xs text-text-muted pt-0.5">
              <span class="font-medium text-text-dark">Keahlian:</span> {{ selectedDosenModal.bidang_keahlian }}
            </div>
          </div>

          <!-- Student Request Form -->
          <form @submit.prevent="submitBimbinganRequest" class="space-y-3 pt-1">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-text-dark">Nama Mahasiswa</label>
                <input
                  v-model="bimbinganForm.nama_mahasiswa"
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-white text-text-dark focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-text-dark">NIM Mahasiswa</label>
                <input
                  v-model="bimbinganForm.nim"
                  type="text"
                  required
                  placeholder="3312411xxx"
                  class="w-full px-3 py-2 text-xs font-mono rounded-lg border border-border-subtle bg-white text-text-dark focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-semibold text-text-dark">Judul Rencana Proyek / Tugas Akhir</label>
              <input
                v-model="bimbinganForm.judul_proyek"
                type="text"
                required
                placeholder="Judul topik penelitian yang diajukan"
                class="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-white text-text-dark focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-semibold text-text-dark">Catatan Pengantar (Opsional)</label>
              <textarea
                v-model="bimbinganForm.catatan"
                rows="3"
                placeholder="Jelaskan alasan memilih dosen dan ringkasan rencana..."
                class="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-white text-text-dark focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
              ></textarea>
            </div>

            <!-- Confirmation Notice -->
            <div v-if="requestSuccessNotice" class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              ✓ Pengajuan pembimbing kepada <strong>{{ selectedDosenModal.nama }}</strong> berhasil dicatat (Mode Simulasi). Notifikasi akan dikirimkan ke akun dosen.
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-border-mist">
              <button
                type="button"
                @click="closeBimbinganModal"
                class="px-4 py-2 text-xs font-semibold rounded-lg border border-border-subtle text-text-dark hover:bg-bg-subtle transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmittingBimbingan"
                class="px-4 py-2 text-xs font-semibold rounded-lg bg-academic-navy hover:bg-academic-hover text-white transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                <span v-if="isSubmittingBimbingan">Mengirim Pengajuan...</span>
                <span v-else>Kirim Pengajuan Pembimbing</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import IconUsers from '../components/icons/IconUsers.vue'
import IconCpuChip from '../components/icons/IconCpuChip.vue'
import IconSearch from '../components/icons/IconSearch.vue'
import IconPaperAirplane from '../components/icons/IconPaperAirplane.vue'
import { dosenService, recommendationService } from '../services/api.js'
import { getRandomBenchmarkSamples } from '../data/benchmarkSamples.js'

const route = useRoute()

// Active Mode State ('manual' | 'rekomendasi')
const activeMode = ref('manual')

// ---------------------------------------------------------------------------
// MODE 1: DIREKTORI MANUAL DOSEN STATE
// ---------------------------------------------------------------------------
const dosenList = ref([])
const isLoadingDosen = ref(false)
const searchQuery = ref('')
const selectedDomain = ref('all')
const selectedProdi = ref('all')
const currentPage = ref(1)
const pageSize = 15

// Flowbite Prodi Dropdown State
const isProdiDropdownOpen = ref(false)
const prodiDropdownRef = ref(null)

const selectProdi = (val) => {
  selectedProdi.value = val
  currentPage.value = 1
  isProdiDropdownOpen.value = false
}

const handleProdiDropdownClickOutside = (e) => {
  if (prodiDropdownRef.value && !prodiDropdownRef.value.contains(e.target)) {
    isProdiDropdownOpen.value = false
  }
}

// IT Domains Definition for Filtering (Domain-domain Tunggal)
const itDomains = [
  { id: 'all', label: 'Semua Domain IT', keywords: [] },
  { id: 'rpl', label: 'Rekayasa Perangkat Lunak', keywords: ['software', 'perangkat lunak', 'rpl', 'web', 'mobile', 'aplikasi', 'programming', 'agile', 'devops', 'testing', 'sdlc', 'frontend', 'backend'] },
  { id: 'ai', label: 'Kecerdasan Buatan', keywords: ['artificial intelligence', 'ai', 'machine learning', 'deep learning', 'computer vision', 'nlp', 'biometrik', 'decision support', 'expert system', 'intelligent system', 'spk'] },
  { id: 'data', label: 'Sains Data', keywords: ['data science', 'data mining', 'big data', 'database', 'basis data', 'analytics', 'forecasting'] },
  { id: 'cyber', label: 'Keamanan Siber', keywords: ['security', 'keamanan', 'siber', 'kriptografi', 'penetration testing', 'offensive security', 'penetration', 'app security', 'web security', 'data security'] },
  { id: 'jaringan', label: 'Jaringan Komputer', keywords: ['network', 'jaringan', 'networking', 'telecommunication', 'operating system', 'infrastruktur', 'cloud'] },
  { id: 'iot', label: 'Internet of Things', keywords: ['iot', 'internet of things', 'embedded', 'sensor', 'hardware technology', 'mikrokontroler', 'robotika', 'elektronika', 'esp32', 'nodemcu'] },
  { id: 'game', label: 'Game', keywords: ['game', 'game design', 'game development', 'gamification', 'game ui/ux'] },
  { id: 'animasi', label: 'Animasi', keywords: ['animasi', 'animation', 'rigging', '3d animation', 'render', 'compositing', '2d skeletal animation'] },
  { id: 'si', label: 'Sistem Informasi', keywords: ['sistem informasi', 'information system', 'it governance', 'e-government', 'erp', 'manajemen informasi'] }
]

const prodiOptions = computed(() => {
  const prodis = new Set()
  dosenList.value.forEach(d => {
    if (d.program_studi && d.program_studi.trim()) {
      prodis.add(d.program_studi.trim())
    }
  })
  return Array.from(prodis)
})

// Filtered Dosen List based on Search, IT Domain, and Prodi
const filteredDosenList = computed(() => {
  return dosenList.value.filter(dosen => {
    // 1. Prodi Filter
    if (selectedProdi.value !== 'all' && dosen.program_studi !== selectedProdi.value) {
      return false
    }

    // 2. IT Domain Filter
    if (selectedDomain.value !== 'all') {
      const domainObj = itDomains.find(d => d.id === selectedDomain.value)
      if (domainObj && domainObj.keywords.length > 0) {
        const fullProfile = `${dosen.bidang_keahlian || ''} ${dosen.program_studi || ''} ${dosen.jurnal || ''} ${dosen.judul_bimbing || ''}`.toLowerCase()
        const matchesDomain = domainObj.keywords.some(kw => fullProfile.includes(kw.toLowerCase()))
        if (!matchesDomain) return false
      }
    }

    // 3. Search Query Filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const searchable = `${dosen.nama || ''} ${dosen.nidn || ''} ${dosen.email || ''} ${dosen.bidang_keahlian || ''} ${dosen.program_studi || ''}`.toLowerCase()
      if (!searchable.includes(q)) return false
    }

    return true
  })
})

const totalPages = computed(() => Math.ceil(filteredDosenList.value.length / pageSize) || 1)

const paginatedDosenList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredDosenList.value.slice(start, start + pageSize)
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedDomain.value = 'all'
  selectedProdi.value = 'all'
  currentPage.value = 1
  isProdiDropdownOpen.value = false
}

const fetchAllDosen = async () => {
  isLoadingDosen.value = true
  try {
    const res = await dosenService.getAllDosen()
    if (res.success && Array.isArray(res.data)) {
      dosenList.value = res.data
    }
  } catch (err) {
    console.error('Gagal memuat data dosen:', err)
  } finally {
    isLoadingDosen.value = false
  }
}

// ---------------------------------------------------------------------------
// MODE 2: REKOMENDASI CERDAS TOP-K STATE
// ---------------------------------------------------------------------------
const form = reactive({
  judul: '',
  abstrak: '',
  k_rank: 5
})

const isLoadingRec = ref(false)
const recError = ref('')
const recommendationResults = ref(null)

const resetRecForm = () => {
  form.judul = ''
  form.abstrak = ''
  form.k_rank = 5
  recError.value = ''
  recommendationResults.value = null
}

const sampleTopics = ref(getRandomBenchmarkSamples(4))

const refreshRandomSamples = () => {
  sampleTopics.value = getRandomBenchmarkSamples(4)
}

const applySampleTopic = (sample) => {
  form.judul = sample.judul
  form.abstrak = sample.abstrak
  recError.value = ''
}

const handleSearchRecommendation = async () => {
  if (!form.judul.trim() && !form.abstrak.trim()) {
    recError.value = 'Harap isi setidaknya judul atau uraian rencana penelitian.'
    return
  }

  isLoadingRec.value = true
  recError.value = ''
  recommendationResults.value = null

  try {
    const res = await recommendationService.getSingleRecommendation({
      judul: form.judul,
      abstrak: form.abstrak,
      k_rank: form.k_rank
    })

    if (res.success && res.data) {
      const rawList = res.data.recommendations || res.data.rekomendasi || (Array.isArray(res.data) ? res.data : [])
      recommendationResults.value = rawList.map((item, idx) => {
        const dosenData = item.dosen || item
        const hybridScore = item.scores?.hybrid ?? item.skor_akhir ?? item.skor ?? 0
        const irisan = item.xai?.irisan_kata || item.irisan_kata || []
        return {
          id: dosenData.id || `rec-${idx}`,
          rank: item.rank || idx + 1,
          nama: dosenData.nama || 'Nama Dosen',
          nidn: dosenData.nidn || '—',
          email: dosenData.email || '',
          program_studi: dosenData.program_studi || '—',
          bidang_keahlian: dosenData.bidang_keahlian || '',
          skor_akhir: hybridScore,
          irisan_kata: irisan
        }
      })

      // Smooth scroll ke area hasil rekomendasi di bawah
      setTimeout(() => {
        const el = document.getElementById('recommendation-results')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      recError.value = res.message || 'Tidak ada rekomendasi yang ditemukan untuk topik ini.'
    }
  } catch (err) {
    recError.value = err.userMessage || 'Gagal terhubung ke engine rekomendasi. Pastikan backend aktif.'
  } finally {
    isLoadingRec.value = false
  }
}

// ---------------------------------------------------------------------------
// SHARED MODAL: PENGAJUAN PEMBIMBING
// ---------------------------------------------------------------------------
const selectedDosenModal = ref(null)
const isSubmittingBimbingan = ref(false)
const requestSuccessNotice = ref(false)

const bimbinganForm = reactive({
  nama_mahasiswa: '',
  nim: '',
  judul_proyek: '',
  catatan: ''
})

const openBimbinganModal = (dosen) => {
  selectedDosenModal.value = dosen
  requestSuccessNotice.value = false
  // Pre-fill judul if currently in recommendation mode
  if (form.judul && !bimbinganForm.judul_proyek) {
    bimbinganForm.judul_proyek = form.judul
  }
}

const closeBimbinganModal = () => {
  selectedDosenModal.value = null
  requestSuccessNotice.value = false
}

const submitBimbinganRequest = () => {
  isSubmittingBimbingan.value = true
  setTimeout(() => {
    isSubmittingBimbingan.value = false
    requestSuccessNotice.value = true
    setTimeout(() => {
      closeBimbinganModal()
    }, 2500)
  }, 600)
}

onMounted(() => {
  document.addEventListener('click', handleProdiDropdownClickOutside)
  fetchAllDosen()
  
  // Check URL query param ?mode=rekomendasi or ?mode=manual
  if (route.query.mode === 'rekomendasi') {
    activeMode.value = 'rekomendasi'
  } else if (route.query.mode === 'manual') {
    activeMode.value = 'manual'
  }

  // Quick recommendation handling from Hero section
  if (route.query.judul) {
    activeMode.value = 'rekomendasi'
    form.judul = String(route.query.judul)
    setTimeout(() => {
      handleSearchRecommendation()
    }, 150)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleProdiDropdownClickOutside)
})
</script>
