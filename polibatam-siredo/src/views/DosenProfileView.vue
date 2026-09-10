<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const dosenId = computed(() => route.params.id)
const dosen = ref(null)
const isLoading = ref(true)
const errorMessage = ref(null)
const activePortfolioTab = ref('jurnal') // 'jurnal' | 'bimbingan' | 'pengujian'

const parseListItems = (str) => {
  if (!str) return []
  if (Array.isArray(str)) return str.filter(Boolean)
  if (typeof str !== 'string') return []
  const trimmed = str.trim()
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null') return []
  
  const matches = trimmed.match(/"([^"]+)"/g)
  if (matches && matches.length > 0) {
    return matches.map(m => m.replace(/(^"|"$)/g, '').trim()).filter(Boolean)
  }
  return trimmed.split(/\n|;|•|\r/).map(s => s.replace(/^[0-9]+[.)]\s*/, '').trim()).filter(Boolean)
}

const parseEducationList = (str) => {
  if (!str || typeof str !== 'string') return []
  const trimmed = str.trim()
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null') return []
  
  const regex = /(?=Sarjana|Magister|Doktor|Diploma|S1|S2|S3|D3|D4)/i
  let items = []
  if (trimmed.includes('\n')) {
    items = trimmed.split('\n')
  } else if (trimmed.includes(', ') && regex.test(trimmed)) {
    items = trimmed.split(/,\s*(?=Sarjana|Magister|Doktor|Diploma|S1|S2|S3|D3|D4)/i)
  } else {
    items = trimmed.split(/,|;/)
  }
  return items.map(s => s.trim()).filter(Boolean)
}

const fetchDetail = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const res = await api.get(`/admin/dosen/${dosenId.value}`)
    dosen.value = res.data.data
  } catch (err) {
    try {
      // Fallback ke endpoint publik
      const fallback = await api.get(`/dosen/${dosenId.value}`)
      dosen.value = fallback.data.data
    } catch (fallbackErr) {
      errorMessage.value = err.response?.data?.message || err.message || 'Gagal memuat detail data dosen'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})

const getAvatarBg = (nama) => {
  if (!nama) return '#0d9488'
  const colors = ['#0d9488', '#0284c7', '#7c3aed', '#db2777', '#d97706', '#059669']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash += nama.charCodeAt(i)
  return colors[hash % colors.length]
}

const goBack = () => {
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    router.push('/dosen')
  }
}

const educationList = computed(() => parseEducationList(dosen.value?.pendidikan))
const jurnalList = computed(() => parseListItems(dosen.value?.jurnal || dosen.value?.publikasi))
const bimbinganList = computed(() => parseListItems(dosen.value?.judul_bimbing || dosen.value?.riwayat_bimbingan))
const pengujianList = computed(() => parseListItems(dosen.value?.judul_uji || dosen.value?.riwayat_pengujian))
</script>

<template>
  <div class="space-y-6 animate-in">
    <!-- Header Navigation -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <button 
          type="button" 
          @click="goBack" 
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors mb-2 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Kembali</span>
        </button>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          {{ dosen ? dosen.nama : 'Profil Dosen' }}
        </h1>
        <p class="text-xs text-gray-500 mt-0.5">Rincian profil akademik, riwayat pendidikan, serta portfolio bimbingan & karya ilmiah.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center min-h-[400px]">
      <div class="w-10 h-10 border-4 border-gray-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <span class="text-gray-500 text-sm font-medium">Memuat rincian data dosen...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center">
      <p class="font-semibold text-sm">{{ errorMessage }}</p>
      <button type="button" @click="goBack" class="inline-block mt-3 text-xs font-bold text-red-800 underline cursor-pointer">
        Kembali ke Halaman Sebelumnya
      </button>
    </div>

    <!-- Detail View Card Grid -->
    <div v-else-if="dosen" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Profile Card & Keahlian -->
      <div class="lg:col-span-4 space-y-6">
        <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div class="flex flex-col items-center text-center">
            <div 
              class="w-20 h-20 rounded-full text-white text-2xl font-bold flex items-center justify-center shadow-md mb-4"
              :style="{ backgroundColor: getAvatarBg(dosen.nama) }"
            >
              {{ dosen.nama ? dosen.nama.charAt(0).toUpperCase() : 'D' }}
            </div>
            <h2 class="text-lg font-bold text-gray-900">{{ dosen.nama }}</h2>
            <div class="flex flex-wrap items-center justify-center gap-2 mt-2">
              <span class="px-2.5 py-0.5 bg-teal-50 text-teal-800 text-[11px] font-semibold rounded-full border border-teal-200">
                {{ dosen.program_studi || 'Teknik Informatika' }}
              </span>
              <span v-if="dosen.nidn" class="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-mono font-medium rounded-full border border-gray-200">
                NIDN: {{ dosen.nidn }}
              </span>
            </div>
          </div>

          <div class="h-px bg-gray-100 my-5"></div>

          <!-- Summary Metric Counts (Interactive) -->
          <div class="space-y-2">
            <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ringkasan Portfolio</div>
            <div 
              @click="activePortfolioTab = 'jurnal'"
              class="flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer"
              :class="activePortfolioTab === 'jurnal' ? 'bg-teal-50 border-teal-300 shadow-sm' : 'bg-gray-50/70 border-gray-200 hover:bg-gray-50'"
            >
              <span class="text-xs font-medium text-gray-700">Publikasi Jurnal</span>
              <span class="text-sm font-bold font-mono tabular-nums text-teal-700">{{ jurnalList.length }}</span>
            </div>
            <div 
              @click="activePortfolioTab = 'bimbingan'"
              class="flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer"
              :class="activePortfolioTab === 'bimbingan' ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-gray-50/70 border-gray-200 hover:bg-gray-50'"
            >
              <span class="text-xs font-medium text-gray-700">Judul Bimbingan</span>
              <span class="text-sm font-bold font-mono tabular-nums text-blue-700">{{ bimbinganList.length }}</span>
            </div>
            <div 
              @click="activePortfolioTab = 'pengujian'"
              class="flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer"
              :class="activePortfolioTab === 'pengujian' ? 'bg-purple-50 border-purple-300 shadow-sm' : 'bg-gray-50/70 border-gray-200 hover:bg-gray-50'"
            >
              <span class="text-xs font-medium text-gray-700">Judul Pengujian</span>
              <span class="text-sm font-bold font-mono tabular-nums text-purple-700">{{ pengujianList.length }}</span>
            </div>
          </div>

          <div class="h-px bg-gray-100 my-5"></div>

          <!-- Riwayat Pendidikan Timeline -->
          <div class="space-y-3">
            <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Riwayat Pendidikan</div>
            <div v-if="educationList.length" class="space-y-2.5">
              <div v-for="(edu, idx) in educationList" :key="idx" class="flex items-start gap-2.5">
                <div class="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0 ring-4 ring-emerald-100"></div>
                <div class="flex-1 bg-gray-50 border border-gray-200 rounded-md p-2">
                  <span class="text-xs font-medium text-gray-800 leading-relaxed block">{{ edu }}</span>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 italic">Belum ada riwayat pendidikan tercatat.</p>
          </div>

          <div class="h-px bg-gray-100 my-5"></div>

          <!-- Bidang Keahlian -->
          <div class="space-y-2.5">
            <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Bidang Keahlian</div>
            <div class="flex flex-wrap gap-1.5">
              <span 
                v-for="(tag, idx) in (dosen.bidang_keahlian ? dosen.bidang_keahlian.split(',') : [])" 
                :key="idx" 
                class="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-semibold rounded-md"
              >
                {{ tag.trim() }}
              </span>
              <span v-if="!dosen.bidang_keahlian" class="text-xs text-gray-400 italic">Belum diisi</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Portfolios with Tabs -->
      <div class="lg:col-span-8 space-y-4">
        <!-- Tab Navigation Bar -->
        <div class="bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-wrap gap-1.5">
          <button 
            type="button" 
            @click="activePortfolioTab = 'jurnal'"
            class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            :class="activePortfolioTab === 'jurnal' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'"
          >
            <span>Publikasi Jurnal</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums" :class="activePortfolioTab === 'jurnal' ? 'bg-teal-700 text-teal-100' : 'bg-gray-200 text-gray-700'">
              {{ jurnalList.length }}
            </span>
          </button>
          <button 
            type="button" 
            @click="activePortfolioTab = 'bimbingan'"
            class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            :class="activePortfolioTab === 'bimbingan' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'"
          >
            <span>Bimbingan Skripsi</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums" :class="activePortfolioTab === 'bimbingan' ? 'bg-blue-700 text-blue-100' : 'bg-gray-200 text-gray-700'">
              {{ bimbinganList.length }}
            </span>
          </button>
          <button 
            type="button" 
            @click="activePortfolioTab = 'pengujian'"
            class="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            :class="activePortfolioTab === 'pengujian' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'"
          >
            <span>Pengujian Sidang</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums" :class="activePortfolioTab === 'pengujian' ? 'bg-purple-700 text-purple-100' : 'bg-gray-200 text-gray-700'">
              {{ pengujianList.length }}
            </span>
          </button>
        </div>

        <!-- Section 1: Publikasi Jurnal -->
        <div v-if="activePortfolioTab === 'jurnal'" class="bg-white border-t-4 border-t-teal-600 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div class="p-5 border-b border-gray-100 bg-teal-50/40 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-teal-700">Kategori 1</span>
              <h3 class="text-sm font-bold text-gray-900 mt-0.5">Publikasi Jurnal & Makalah Ilmiah</h3>
            </div>
            <span class="px-2.5 py-1 bg-teal-100 text-teal-800 font-mono tabular-nums font-bold text-xs rounded-full border border-teal-200">
              {{ jurnalList.length }} Judul
            </span>
          </div>
          <div class="p-5">
            <div v-if="jurnalList.length" class="space-y-3">
              <div 
                v-for="(j, idx) in jurnalList" 
                :key="idx" 
                class="flex items-start gap-3 p-3.5 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/20 transition-all"
              >
                <span class="px-2 py-0.5 bg-teal-50 text-teal-700 font-mono font-bold text-xs rounded border border-teal-200 shrink-0">
                  #{{ idx + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 leading-relaxed">{{ j }}</p>
                  <span class="inline-block mt-1 text-[11px] text-teal-600 font-semibold">Publikasi Jurnal / Paper Ilmiah</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-gray-400 text-xs italic">
              Tidak ada data publikasi jurnal yang terdaftar.
            </div>
          </div>
        </div>

        <!-- Section 2: Riwayat Bimbingan Skripsi -->
        <div v-if="activePortfolioTab === 'bimbingan'" class="bg-white border-t-4 border-t-blue-600 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div class="p-5 border-b border-gray-100 bg-blue-50/40 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700">Kategori 2</span>
              <h3 class="text-sm font-bold text-gray-900 mt-0.5">Riwayat Bimbingan Tugas Akhir / Skripsi</h3>
            </div>
            <span class="px-2.5 py-1 bg-blue-100 text-blue-800 font-mono tabular-nums font-bold text-xs rounded-full border border-blue-200">
              {{ bimbinganList.length }} Judul
            </span>
          </div>
          <div class="p-5">
            <div v-if="bimbinganList.length" class="space-y-3">
              <div 
                v-for="(b, idx) in bimbinganList" 
                :key="idx" 
                class="flex items-start gap-3 p-3.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all"
              >
                <span class="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded border border-blue-200 shrink-0">
                  #{{ idx + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 leading-relaxed">{{ b }}</p>
                  <span class="inline-block mt-1 text-[11px] text-blue-600 font-semibold">Peran: Pembimbing Utama / Pendamping</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-gray-400 text-xs italic">
              Tidak ada riwayat bimbingan mahasiswa yang terdaftar.
            </div>
          </div>
        </div>

        <!-- Section 3: Riwayat Pengujian Sidang -->
        <div v-if="activePortfolioTab === 'pengujian'" class="bg-white border-t-4 border-t-purple-600 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div class="p-5 border-b border-gray-100 bg-purple-50/40 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-700">Kategori 3</span>
              <h3 class="text-sm font-bold text-gray-900 mt-0.5">Riwayat Pengujian Sidang Tugas Akhir / Skripsi</h3>
            </div>
            <span class="px-2.5 py-1 bg-purple-100 text-purple-800 font-mono tabular-nums font-bold text-xs rounded-full border border-purple-200">
              {{ pengujianList.length }} Judul
            </span>
          </div>
          <div class="p-5">
            <div v-if="pengujianList.length" class="space-y-3">
              <div 
                v-for="(u, idx) in pengujianList" 
                :key="idx" 
                class="flex items-start gap-3 p-3.5 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/20 transition-all"
              >
                <span class="px-2 py-0.5 bg-purple-50 text-purple-700 font-mono font-bold text-xs rounded border border-purple-200 shrink-0">
                  #{{ idx + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 leading-relaxed">{{ u }}</p>
                  <span class="inline-block mt-1 text-[11px] text-purple-600 font-semibold">Peran: Penguji Sidang Mahasiswa</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-gray-400 text-xs italic">
              Tidak ada riwayat pengujian sidang yang terdaftar.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fade-in 0.3s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
