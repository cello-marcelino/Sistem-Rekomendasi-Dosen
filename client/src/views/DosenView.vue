<template>
  <div class="relative min-h-screen bg-hero-soft pb-20">
    <!-- Top Navigation Bar -->
    <Navbar />

    <!-- Page Header Container -->
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
      
      <!-- Breadcrumb & Header Title -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs text-[#5A6A85] font-medium">
          <router-link to="/" class="hover:text-[#1E3A6D] transition-colors">Beranda</router-link>
          <span>/</span>
          <span class="text-[#0F172A] font-semibold">Dosen & Pembimbing</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#1E3A6D] tracking-tight">
              Informasi & Rekomendasi Dosen
            </h1>
            <p class="text-xs sm:text-sm text-[#5A6A85] mt-1">
              Temukan dosen pembimbing tugas akhir melalui eksplorasi direktori manual atau rekomendasi cerdas berbasis analisis topik.
            </p>
          </div>

          <!-- Total Dosen Counter Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] self-start sm:self-auto shadow-[0_4px_20px_rgba(30,58,109,0.06)]">
            <IconUsers customClass="w-4 h-4 text-[#1E3A6D]" />
            <span class="text-xs font-semibold text-[#5A6A85]">Total Basis Data:</span>
            <span class="text-xs font-mono font-bold text-[#1E3A6D]">{{ dosenList.length || 86 }} Dosen</span>
          </div>
        </div>
      </div>

      <!-- Segmented Mode Switcher (Tab 1: Manual vs Tab 2: Rekomendasi) -->
      <div class="p-1.5 bg-[#F5F8FF] rounded-xl max-w-xl flex gap-1 border border-[#E2E8F0]">
        <button
          type="button"
          @click="activeMode = 'manual'"
          class="flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          :class="activeMode === 'manual'
            ? 'bg-white text-[#1E3A6D] shadow-xs'
            : 'text-[#5A6A85] hover:text-[#0F172A] hover:bg-white/50'"
        >
          <IconUsers customClass="w-4 h-4 text-[#1E3A6D]" />
          <span>Direktori Manual Dosen</span>
        </button>
        <button
          type="button"
          @click="activeMode = 'rekomendasi'"
          class="flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          :class="activeMode === 'rekomendasi'
            ? 'bg-white text-[#1E3A6D] shadow-xs'
            : 'text-[#5A6A85] hover:text-[#0F172A] hover:bg-white/50'"
        >
          <IconCpuChip customClass="w-4 h-4 text-[#1E3A6D]" />
          <span>Rekomendasi Cerdas Top-K</span>
        </button>
      </div>

      <!-- ========================================================================= -->
      <!-- MODE 1: CARI DOSEN MANUAL (Data Table Sederhana & Filter Domain IT)        -->
      <!-- ========================================================================= -->
      <section v-if="activeMode === 'manual'" class="space-y-5 animate-card-fade-in">
        
        <!-- Filter Controls Container -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_4px_20px_rgba(30,58,109,0.04)] space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            <!-- Real-Time Search Bar -->
            <div class="relative flex-1 max-w-md">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#5A6A85]">
                <IconSearch customClass="w-4 h-4 text-[#5A6A85]" />
              </span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama dosen, keahlian, atau prodi..."
                class="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#5A6A85] placeholder:opacity-50 focus:outline-none focus:border-[#4EA8DE] focus:ring-2 focus:ring-[#4EA8DE]/20 transition-colors"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5A6A85] hover:text-[#0F172A] cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <!-- Prodi Dropdown Filter -->
            <div class="flex items-center gap-2">
              <label for="prodiFilter" class="text-xs font-semibold text-[#5A6A85] whitespace-nowrap">Program Studi:</label>
              <select
                id="prodiFilter"
                v-model="selectedProdi"
                class="px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#4EA8DE] cursor-pointer"
              >
                <option value="all">Semua Program Studi</option>
                <option v-for="prodi in prodiOptions" :key="prodi" :value="prodi">
                  {{ prodi }}
                </option>
              </select>
            </div>
          </div>

          <!-- IT Domain Filter Pills -->
          <div class="space-y-1.5 pt-2 border-t border-slate-100">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-[#5A6A85]">Filter Rumpun Keahlian IT:</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                v-for="domain in itDomains"
                :key="domain.id"
                @click="selectedDomain = domain.id"
                :class="[
                  'px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                  selectedDomain === domain.id
                    ? 'border-[#1E3A6D] bg-[#1E3A6D] text-white font-semibold shadow-xs'
                    : 'border-[#E2E8F0] bg-[#F5F8FF] hover:bg-[#EBF4FF] text-[#1E3A6D]'
                ]"
              >
                {{ domain.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Count Summary & Quick Action Hint -->
        <div class="flex items-center justify-between text-xs text-[#5A6A85] px-1">
          <div>
            Menampilkan <span class="font-mono font-bold text-[#0F172A]">{{ filteredDosenList.length }}</span> dari
            <span class="font-mono">{{ dosenList.length }}</span> dosen
            <span v-if="selectedDomain !== 'all' || selectedProdi !== 'all' || searchQuery" class="text-[#1E3A6D] font-medium ml-1">
              (terfilter)
            </span>
          </div>
          <div class="text-[11px] text-[#5A6A85] hidden sm:block">
            Tip: Klik baris dosen atau tombol aksi untuk langsung mengajukan bimbingan.
          </div>
        </div>

        <!-- Data Table Dosen Sederhana -->
        <div class="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-[0_4px_20px_rgba(30,58,109,0.04)]">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#F5F8FF] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#1E3A6D]">
                  <th scope="col" class="py-3 px-4 w-12 text-center font-mono">No</th>
                  <th scope="col" class="py-3 px-4 min-w-[200px]">Dosen & NIDN</th>
                  <th scope="col" class="py-3 px-4 min-w-[180px]">Email Institusi</th>
                  <th scope="col" class="py-3 px-4 min-w-[160px]">Program Studi</th>
                  <th scope="col" class="py-3 px-4 min-w-[260px]">Bidang Keahlian</th>
                  <th scope="col" class="py-3 px-4 w-44 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                
                <!-- Loading State -->
                <tr v-if="isLoadingDosen">
                  <td colspan="6" class="py-12 text-center text-[#5A6A85] space-y-2">
                    <svg class="animate-spin h-6 w-6 text-[#1E3A6D] mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div>Memuat direktori data dosen...</div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-else-if="filteredDosenList.length === 0">
                  <td colspan="6" class="py-12 text-center text-[#5A6A85] space-y-2">
                    <div class="text-sm font-semibold text-[#0F172A]">Tidak Ada Dosen yang Sesuai</div>
                    <p class="text-xs text-[#5A6A85] max-w-sm mx-auto">
                      Tidak ditemukan dosen dengan filter "{{ itDomains.find(d => d.id === selectedDomain)?.label }}" atau kata kunci "{{ searchQuery }}".
                    </p>
                    <button
                      type="button"
                      @click="resetFilters"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F8FF] hover:bg-[#EBF4FF] text-[#1E3A6D] border border-[#CBD5E1] transition-colors cursor-pointer"
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
                  class="hover:bg-[#F5F8FF]/80 transition-colors cursor-pointer group"
                >
                  <!-- No -->
                  <td class="py-3 px-4 text-center font-mono text-[#5A6A85] text-xs">
                    {{ (currentPage - 1) * pageSize + idx + 1 }}
                  </td>

                  <!-- Nama & NIDN -->
                  <td class="py-3 px-4">
                    <div class="font-bold text-[#0F172A] group-hover:text-[#1E3A6D] transition-colors">
                      {{ dosen.nama }}
                    </div>
                    <div class="text-[11px] font-mono text-[#5A6A85] mt-0.5">
                      NIDN: {{ dosen.nidn || '—' }}
                    </div>
                  </td>

                  <!-- Email Institusi -->
                  <td class="py-3 px-4 font-mono text-xs">
                    <span v-if="dosen.email" class="text-[#0F172A]">
                      {{ dosen.email }}
                    </span>
                    <span v-else class="text-[#5A6A85] italic text-[11px]">
                      —
                    </span>
                  </td>

                  <!-- Program Studi -->
                  <td class="py-3 px-4 text-[#5A6A85]">
                    <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F5F8FF] text-[#1E3A6D] border border-[#E2E8F0]">
                      {{ dosen.program_studi || 'Informatika' }}
                    </span>
                  </td>

                  <!-- Bidang Keahlian -->
                  <td class="py-3 px-4 text-[#0F172A]">
                    <div class="line-clamp-2 text-xs leading-relaxed" :title="dosen.bidang_keahlian">
                      {{ dosen.bidang_keahlian || 'Keahlian Umum Informatika' }}
                    </div>
                  </td>

                  <!-- Aksi Cepat: > Ajukan Pembimbing -->
                  <td class="py-3 px-4 text-right">
                    <button
                      type="button"
                      @click.stop="openBimbinganModal(dosen)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#CBD5E1] group-hover:border-[#1E3A6D] text-[#0F172A] group-hover:text-[#1E3A6D] hover:bg-[#F5F8FF] transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-xs"
                    >
                      <IconPaperAirplane customClass="w-3.5 h-3.5 text-[#1E3A6D]" />
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
        <div class="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-8 shadow-[0_4px_20px_rgba(30,58,109,0.04)] space-y-6">
          <div class="border-b border-[#E2E8F0] pb-4">
            <h2 class="text-base sm:text-lg font-bold text-[#1E3A6D] flex items-center gap-2">
              <IconCpuChip customClass="w-5 h-5 text-[#1E3A6D]" />
              <span>Input Topik Proyek / Tugas Akhir</span>
            </h2>
          </div>

          <!-- Quick Sample Topics -->
          <div class="space-y-2">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-[#5A6A85]">Contoh Topik Cepat:</span>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                v-for="(sample, idx) in sampleTopics"
                :key="idx"
                @click="applySampleTopic(sample)"
                :class="[
                  'px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer text-left font-medium active:scale-95',
                  form.judul === sample.judul
                    ? 'border-[#1E3A6D] bg-[#1E3A6D] text-white font-semibold shadow-xs'
                    : 'border-[#CBD5E1] bg-[#F5F8FF] hover:bg-[#EBF4FF] text-[#1E3A6D]'
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
              <label for="judul" class="block text-xs font-semibold text-[#0F172A]">
                Judul Rencana Proyek
              </label>
              <input
                id="judul"
                v-model="form.judul"
                type="text"
                required
                placeholder="Contoh: Implementasi Deep Learning untuk Deteksi Objek..."
                class="w-full px-4 py-2.5 text-base sm:text-sm rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#5A6A85] placeholder:opacity-50 focus:outline-none focus:border-[#4EA8DE] focus:ring-2 focus:ring-[#4EA8DE]/20 transition-colors"
              />
            </div>

            <!-- Abstrak Input -->
            <div class="space-y-1.5">
              <label for="abstrak" class="block text-xs font-semibold text-[#0F172A]">
                Abstrak / Deskripsi Penelitian
              </label>
              <textarea
                id="abstrak"
                v-model="form.abstrak"
                rows="5"
                placeholder="Jelaskan latar belakang permasalahan, algoritma/metode yang diajukan, dataset, dan tujuan riset secara ringkas..."
                class="w-full px-4 py-2.5 text-base sm:text-sm rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] placeholder:text-[#5A6A85] placeholder:opacity-50 focus:outline-none focus:border-[#4EA8DE] focus:ring-2 focus:ring-[#4EA8DE]/20 transition-colors resize-y leading-relaxed"
              ></textarea>
            </div>

            <!-- Row Pengaturan Parameter & Tombol Aksi -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E2E8F0]">
              <!-- Parameter: Jumlah Rekomendasi (Segmented Control) -->
              <div class="flex flex-wrap items-center gap-2.5">
                <span class="text-xs font-semibold text-[#5A6A85] whitespace-nowrap">Jumlah Rekomendasi:</span>
                <div class="inline-flex p-1 bg-[#F5F8FF] border border-[#CBD5E1] rounded-lg">
                  <button
                    type="button"
                    v-for="k in [3, 5, 10]"
                    :key="k"
                    @click="form.k_rank = k"
                    :class="[
                      'px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer active:scale-95',
                      form.k_rank === k
                        ? 'bg-[#1E3A6D] text-white shadow-xs'
                        : 'text-[#5A6A85] hover:text-[#1E3A6D] hover:bg-white/60'
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
                  class="px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F5F8FF] text-[#1E3A6D] font-semibold text-xs sm:text-sm transition-colors cursor-pointer active:scale-95 shrink-0"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  :disabled="isLoadingRec"
                  class="flex-1 sm:flex-initial py-2.5 px-6 rounded-lg bg-[#1E3A6D] hover:bg-[#15294E] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] shadow-xs"
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
          <div v-if="recError" class="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs">
            {{ recError }}
          </div>
        </div>

        <!-- BAGIAN BAWAH: Hasil Rekomendasi Top-K (Full Width) -->
        <div id="recommendation-results" class="space-y-4 scroll-mt-24">
          
          <!-- Default Placeholder before search -->
          <div
            v-if="!recommendationResults && !isLoadingRec"
            class="p-8 sm:p-12 rounded-2xl bg-white border border-[#E2E8F0] text-center space-y-3 shadow-[0_4px_20px_rgba(30,58,109,0.04)]"
          >
            <div class="w-12 h-12 rounded-2xl bg-[#F5F8FF] border border-[#CBD5E1] text-[#1E3A6D] flex items-center justify-center mx-auto">
              <IconSearch customClass="w-6 h-6 text-[#1E3A6D]" />
            </div>
            <h3 class="text-base font-bold text-[#0F172A]">Menunggu Input Rencana Penelitian</h3>
            <p class="text-xs sm:text-sm text-[#5A6A85] max-w-md mx-auto leading-relaxed">
              Isi formulir judul dan abstrak di atas atau klik salah satu contoh topik untuk mengevaluasi rekomendasi dosen pembimbing terbaik.
            </p>
          </div>

          <!-- Empty Results Notice -->
          <div
            v-else-if="recommendationResults && recommendationResults.length === 0"
            class="p-5 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] text-xs space-y-1.5"
          >
            <div class="font-bold text-sm">Tidak Ada Dosen yang Memenuhi Ambang Batas</div>
            <p class="leading-relaxed text-[#B45309]">
              Kandidat tidak memiliki irisan kata kunci atau skor kecocokan berada di bawah ambang batas minimum. Cobalah menambahkan variasi istilah teknis pada judul atau abstrak penelitian Anda.
            </p>
          </div>

          <!-- Staggered Results List -->
          <div v-else-if="recommendationResults && recommendationResults.length > 0" class="space-y-4">
            <div class="flex items-center justify-between pb-1">
              <div class="flex items-center gap-2">
                <IconCpuChip customClass="w-4 h-4 text-[#1E3A6D]" />
                <span class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0F172A]">Hasil Rekomendasi Teratas:</span>
              </div>
              <span class="text-xs font-mono text-[#1E3A6D] font-bold bg-[#F5F8FF] px-3 py-1 rounded-full border border-[#CBD5E1]">
                {{ recommendationResults.length }} Dosen Cocok
              </span>
            </div>

            <!-- Recommendation Cards Grid (Responsive 2-column or 1-column) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(dosen, index) in recommendationResults"
                :key="dosen.id || index"
                class="animate-card-fade-in p-5 rounded-2xl border border-[#E2E8F0] bg-white hover:border-[#8E94F2] hover:shadow-[0_4px_20px_rgba(30,58,109,0.06)] transition-all duration-300 flex flex-col justify-between space-y-3"
                :style="{ animationDelay: `${index * 80}ms` }"
              >
                <div class="space-y-3">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-[#1E3A6D] text-white text-xs font-bold flex items-center justify-center font-mono shrink-0">
                          {{ index + 1 }}
                        </span>
                        <h3 class="text-sm sm:text-base font-bold text-[#0F172A]">
                          {{ dosen.nama }}
                        </h3>
                      </div>
                      <div class="text-xs text-[#5A6A85] font-mono flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>NIDN: {{ dosen.nidn || '—' }}</span>
                        <span>•</span>
                        <span>{{ dosen.program_studi }}</span>
                        <span v-if="dosen.email">•</span>
                        <span v-if="dosen.email" class="text-[#1E3A6D]">{{ dosen.email }}</span>
                      </div>
                    </div>

                    <!-- Skor Kecocokan Badge -->
                    <div class="text-right shrink-0">
                      <div class="text-base font-mono font-black text-[#1E3A6D]">
                        {{ Math.round((dosen.skor_akhir || 0) * 100) }}%
                      </div>
                      <div class="text-[10px] text-[#5A6A85] uppercase tracking-tight font-medium">Kecocokan</div>
                    </div>
                  </div>

                  <!-- Bidang Keahlian -->
                  <div v-if="dosen.bidang_keahlian" class="text-xs text-[#0F172A]">
                    <span class="text-[#5A6A85] font-medium">Keahlian:</span> {{ dosen.bidang_keahlian }}
                  </div>

                  <!-- Irisan Kata Kunci yang Cocok (NLP Badges) -->
                  <div v-if="dosen.irisan_kata && dosen.irisan_kata.length > 0" class="space-y-1 pt-1 border-t border-slate-100">
                    <div class="text-[11px] text-[#5A6A85] font-medium">Irisan Kata Kunci yang Cocok:</div>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="(kata, kIdx) in dosen.irisan_kata.slice(0, 6)"
                        :key="kIdx"
                        class="px-2 py-0.5 rounded text-[11px] font-mono bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1]"
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
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#CBD5E1] hover:border-[#1E3A6D] text-[#0F172A] hover:text-[#1E3A6D] hover:bg-[#F5F8FF] hover:shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <IconPaperAirplane customClass="w-3.5 h-3.5 text-[#1E3A6D]" />
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
          <div class="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
            <div class="flex items-center gap-2">
              <IconPaperAirplane customClass="w-5 h-5 text-[#1E3A6D]" />
              <h3 class="text-base font-bold text-[#0F172A]">Pengajuan Rencana Pembimbing</h3>
            </div>
            <button
              @click="closeBimbinganModal"
              class="text-[#5A6A85] hover:text-[#0F172A] cursor-pointer text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <!-- Dosen Info Card -->
          <div class="p-3.5 rounded-xl bg-[#F5F8FF] border border-[#E2E8F0] space-y-1.5">
            <div class="text-xs text-[#5A6A85] font-semibold uppercase tracking-wider">Dosen Dituju:</div>
            <div class="text-sm font-bold text-[#0F172A]">{{ selectedDosenModal.nama }}</div>
            <div class="text-xs text-[#5A6A85] font-mono">
              NIDN: {{ selectedDosenModal.nidn || '—' }} · {{ selectedDosenModal.program_studi }}
            </div>
            <div class="text-xs text-[#5A6A85] font-mono">
              Email: <span class="text-[#1E3A6D]">{{ selectedDosenModal.email || '— (Belum terdata)' }}</span>
            </div>
            <div v-if="selectedDosenModal.bidang_keahlian" class="text-xs text-[#5A6A85] pt-0.5">
              <span class="font-medium text-[#0F172A]">Keahlian:</span> {{ selectedDosenModal.bidang_keahlian }}
            </div>
          </div>

          <!-- Student Request Form -->
          <form @submit.prevent="submitBimbinganRequest" class="space-y-3 pt-1">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-[#0F172A]">Nama Mahasiswa</label>
                <input
                  v-model="bimbinganForm.nama_mahasiswa"
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#4EA8DE] focus:ring-2 focus:ring-[#4EA8DE]/20"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-semibold text-[#0F172A]">NIM Mahasiswa</label>
                <input
                  v-model="bimbinganForm.nim"
                  type="text"
                  required
                  placeholder="3312411xxx"
                  class="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#4EA8DE] focus:ring-2 focus:ring-[#4EA8DE]/20"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-semibold text-[#0F172A]">Judul Rencana Proyek / Tugas Akhir</label>
              <input
                v-model="bimbinganForm.judul_proyek"
                type="text"
                required
                placeholder="Judul topik penelitian yang diajukan"
                class="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#4EA8DE] focus:ring-2 focus:ring-[#4EA8DE]/20"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-semibold text-[#0F172A]">Catatan Pengantar (Opsional)</label>
              <textarea
                v-model="bimbinganForm.catatan"
                rows="3"
                placeholder="Jelaskan alasan memilih dosen dan ringkasan rencana..."
                class="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#4EA8DE] focus:ring-2 focus:ring-[#4EA8DE]/20"
              ></textarea>
            </div>

            <!-- Confirmation Notice -->
            <div v-if="requestSuccessNotice" class="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-medium">
              ✓ Pengajuan pembimbing kepada <strong>{{ selectedDosenModal.nama }}</strong> berhasil dicatat (Mode Simulasi). Notifikasi akan dikirimkan ke akun dosen.
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                @click="closeBimbinganModal"
                class="px-4 py-2 text-xs font-semibold rounded-lg border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F5F8FF] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isSubmittingBimbingan"
                class="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1E3A6D] hover:bg-[#15294E] text-white transition-all cursor-pointer shadow-xs disabled:opacity-60"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import IconUsers from '../components/icons/IconUsers.vue'
import IconCpuChip from '../components/icons/IconCpuChip.vue'
import IconSearch from '../components/icons/IconSearch.vue'
import IconPaperAirplane from '../components/icons/IconPaperAirplane.vue'
import { dosenService, recommendationService } from '../services/api.js'

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

// IT Domains Definition for Filtering
const itDomains = [
  { id: 'all', label: 'Semua Domain IT', keywords: [] },
  { id: 'rpl', label: 'Rekayasa Perangkat Lunak', keywords: ['software', 'perangkat lunak', 'web', 'mobile', 'agile', 'sdlc', 'devops', 'testing', 'aplikasi'] },
  { id: 'ai', label: 'Kecerdasan Buatan & Data', keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'computer vision', 'nlp', 'data mining', 'spk', 'decision support', 'intelligence', 'biometrik'] },
  { id: 'cyber', label: 'Keamanan Siber & Jaringan', keywords: ['security', 'keamanan', 'jaringan', 'network', 'kriptografi', 'operating system', 'cloud', 'infrastruktur', 'active directory'] },
  { id: 'iot', label: 'IoT & Sistem Tertanam', keywords: ['internet of things', 'iot', 'embedded', 'hardware', 'sensor', 'esp32', 'nodemcu', 'mikrokontroler', 'robotika', 'elektronika'] },
  { id: 'multimedia', label: 'Multimedia & Game', keywords: ['multimedia', 'game', 'grafik', 'animasi', 'vr', 'ar', 'visual', '3d', 'video', 'desain'] },
  { id: 'si', label: 'Sistem Informasi & Bisnis', keywords: ['sistem informasi', 'database', 'basis data', 'erp', 'e-government', 'manajemen', 'bisnis', 'informasi'] }
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
  fetchAllDosen()
  // Check URL query param ?mode=rekomendasi or ?mode=manual
  if (route.query.mode === 'rekomendasi') {
    activeMode.value = 'rekomendasi'
  } else if (route.query.mode === 'manual') {
    activeMode.value = 'manual'
  }
})
</script>
