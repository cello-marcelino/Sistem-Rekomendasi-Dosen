<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const dosens = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedProdi = ref('')
const viewMode = ref('grid') // 'grid' | 'table'

const parseList = (str) => {
  if (!str) return []
  if (Array.isArray(str)) return str.filter(Boolean)
  if (typeof str !== 'string') return []
  if (str.includes('", "')) return str.split('", "').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean)
  if (str.includes('\n')) return str.split('\n').map(s => s.trim()).filter(Boolean)
  let cleaned = str.replace(/^"|"$/g, '').trim()
  if (cleaned && cleaned !== '-' && cleaned.toLowerCase() !== 'nan') return [cleaned]
  return []
}

const fetchDosen = async () => {
  loading.value = true
  try {
    const response = await api.get('/dosen')
    dosens.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch dosen', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDosen()
})

const getAvatarBg = (nama) => {
  if (!nama) return '#0d9488'
  const colors = ['#0d9488', '#0284c7', '#7c3aed', '#db2777', '#d97706', '#059669', '#2563eb']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash += nama.charCodeAt(i)
  return colors[hash % colors.length]
}

// Statistik Sistem Terpadu
const stats = computed(() => {
  const totalDosen = dosens.value.length
  let totalPub = 0
  let totalBimb = 0
  let totalUji = 0
  const dist = {}

  dosens.value.forEach(d => {
    const p = d.program_studi || 'Lainnya'
    dist[p] = (dist[p] || 0) + 1
    totalPub += parseList(d.jurnal || d.publikasi).length
    totalBimb += parseList(d.judul_bimbing || d.riwayat_bimbingan).length
    totalUji += parseList(d.judul_uji || d.riwayat_pengujian).length
  })

  return {
    totalDosen,
    totalPub,
    totalBimb,
    totalUji,
    prodiDist: dist
  }
})

const prodiOptions = computed(() => {
  const prodis = new Set()
  dosens.value.forEach(d => {
    if (d.program_studi) prodis.add(d.program_studi)
  })
  return Array.from(prodis).sort()
})

const filteredDosen = computed(() => {
  return dosens.value.filter(d => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchSearch = !query || 
      (d.nama && d.nama.toLowerCase().includes(query)) || 
      (d.nidn && d.nidn.includes(query)) ||
      (d.bidang_keahlian && d.bidang_keahlian.toLowerCase().includes(query)) ||
      (d.program_studi && d.program_studi.toLowerCase().includes(query))
    
    const matchProdi = !selectedProdi.value || d.program_studi === selectedProdi.value
    return matchSearch && matchProdi
  })
})

const toggleProdiFilter = (prodi) => {
  if (selectedProdi.value === prodi) {
    selectedProdi.value = ''
  } else {
    selectedProdi.value = prodi
  }
}
</script>

<template>
  <div class="space-y-6 animate-in">
    <!-- Header Page -->
    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Informasi & Statistik Dosen</h1>
        <p class="text-xs text-gray-500 mt-1">Eksplorasi direktori dosen pembimbing, distribusi per program studi, keahlian, dan metrik publikasi ilmiah Polibatam.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
          {{ filteredDosen.length }} / {{ stats.totalDosen }} Dosen Ditampilkan
        </span>
      </div>
    </div>

    <!-- Section 1: Dashboard Statistik Sistem -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      <!-- Dominant Hero Card: Total Dosen -->
      <div class="lg:col-span-4 bg-emerald-900 text-white rounded-xl shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <h2 class="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Total Populasi Dosen</h2>
            <div class="w-8 h-8 rounded-lg bg-emerald-800/80 flex items-center justify-center text-emerald-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="text-[3.25rem] font-bold mt-2 font-mono tabular-nums leading-none">{{ stats.totalDosen }}</div>
          <p class="text-xs text-emerald-300 mt-2">Dosen pembimbing & penguji terintegrasi di sistem SiReDo.</p>
        </div>
        <div class="mt-6 pt-4 border-t border-emerald-800 flex items-center justify-between text-xs text-emerald-200">
          <span>Program Studi Terdata:</span>
          <span class="font-mono font-bold">{{ prodiOptions.length }} Prodi</span>
        </div>
      </div>

      <!-- Secondary Metrics: Publikasi, Bimbingan, Pengujian -->
      <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 text-xs font-semibold uppercase tracking-wider">Karya Publikasi</span>
            <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div class="my-3">
            <div class="text-2xl font-bold text-gray-900 font-mono tabular-nums">{{ stats.totalPub }}</div>
            <div class="text-[11px] text-teal-700 font-medium mt-0.5">Jurnal & Makalah Ilmiah</div>
          </div>
          <div class="text-[10px] text-gray-400 pt-2 border-t border-gray-100">Dataset penelitian dosen</div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 text-xs font-semibold uppercase tracking-wider">Bimbingan Skripsi</span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div class="my-3">
            <div class="text-2xl font-bold text-gray-900 font-mono tabular-nums">{{ stats.totalBimb }}</div>
            <div class="text-[11px] text-blue-700 font-medium mt-0.5">Judul Tugas Akhir</div>
          </div>
          <div class="text-[10px] text-gray-400 pt-2 border-t border-gray-100">Riwayat mahasiswa bimbingan</div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pengujian Sidang</span>
            <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="my-3">
            <div class="text-2xl font-bold text-gray-900 font-mono tabular-nums">{{ stats.totalUji }}</div>
            <div class="text-[11px] text-purple-700 font-medium mt-0.5">Sidang Mahasiswa</div>
          </div>
          <div class="text-[10px] text-gray-400 pt-2 border-t border-gray-100">Riwayat penguji sidang</div>
        </div>

        <!-- Distribusi Program Studi Interaktif (Klik untuk filter) -->
        <div class="sm:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">Distribusi Dosen per Program Studi</span>
            <span class="text-[11px] text-gray-400 italic">Klik prodi untuk memfilter daftar di bawah</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            <button
              v-for="(count, prodi) in stats.prodiDist"
              :key="prodi"
              type="button"
              @click="toggleProdiFilter(prodi)"
              class="flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer"
              :class="selectedProdi === prodi 
                ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-400' 
                : 'bg-gray-50 hover:bg-gray-100/80 border-gray-200'"
            >
              <span class="text-xs font-medium text-gray-800 truncate pr-2" :title="prodi">{{ prodi }}</span>
              <span class="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono font-bold tabular-nums text-emerald-800">
                {{ count }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Filter & Search Controls -->
    <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <!-- Search Input -->
      <div class="relative w-full md:flex-1">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari berdasarkan nama dosen, NIDN, program studi, atau bidang keahlian..." 
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900 transition-all"
        />
      </div>

      <!-- Filter Dropdown & View Mode Switcher -->
      <div class="flex items-center gap-3 w-full md:w-auto">
        <select 
          v-model="selectedProdi" 
          class="flex-1 md:w-[220px] bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-xs font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
        >
          <option value="">Semua Program Studi</option>
          <option v-for="p in prodiOptions" :key="p" :value="p">{{ p }}</option>
        </select>

        <div class="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 shrink-0">
          <button 
            type="button" 
            @click="viewMode = 'grid'" 
            class="p-1.5 rounded text-xs font-medium transition-colors"
            :class="viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
            title="Tampilan Grid Kartu"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button 
            type="button" 
            @click="viewMode = 'table'" 
            class="p-1.5 rounded text-xs font-medium transition-colors"
            :class="viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
            title="Tampilan Tabel Rinci"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filter Indicator -->
    <div v-if="selectedProdi" class="flex items-center gap-2 text-xs">
      <span class="text-gray-500">Filter Aktif:</span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-medium">
        <span>Prodi: {{ selectedProdi }}</span>
        <button type="button" @click="selectedProdi = ''" class="hover:text-emerald-950 font-bold" title="Hapus filter">×</button>
      </span>
    </div>

    <!-- Section 3: Daftar Dosen (Loading / Empty / List) -->
    <div v-if="loading" class="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center min-h-[400px]">
      <div class="w-10 h-10 border-4 border-gray-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <span class="text-gray-500 text-sm font-medium">Memuat katalog direktori dosen...</span>
    </div>

    <div v-else-if="filteredDosen.length === 0" class="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
      <div class="w-12 h-12 text-gray-300 mx-auto mb-3">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-sm font-bold text-gray-900">Tidak ada dosen yang cocok</h3>
      <p class="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau bersihkan filter program studi.</p>
      <button 
        type="button" 
        @click="searchQuery = ''; selectedProdi = ''" 
        class="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
      >
        Reset Filter Pencarian
      </button>
    </div>

    <!-- Mode Grid Kartu Profil -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="dosen in filteredDosen" 
        :key="dosen.id" 
        @click="router.push(`/dosen/${dosen.id}`)"
        class="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
      >
        <div>
          <!-- Top Card Header -->
          <div class="flex items-start gap-3.5 mb-3.5">
            <div 
              class="w-11 h-11 rounded-full text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs"
              :style="{ backgroundColor: getAvatarBg(dosen.nama) }"
            >
              {{ dosen.nama ? dosen.nama.charAt(0).toUpperCase() : 'D' }}
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1" :title="dosen.nama">
                {{ dosen.nama }}
              </h3>
              <p class="text-[11px] font-mono text-gray-400 mt-0.5">NIDN: {{ dosen.nidn || '-' }}</p>
              <div class="mt-1.5">
                <span class="inline-block px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-semibold rounded border border-teal-200">
                  {{ dosen.program_studi || 'Teknik Informatika' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bidang Keahlian -->
          <div class="space-y-1 mt-3">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Keahlian:</span>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="(tag, tidx) in parseList(dosen.bidang_keahlian).slice(0, 3)" 
                :key="tidx"
                class="inline-block px-2 py-0.5 bg-gray-50 text-gray-700 text-[10px] font-medium rounded border border-gray-200"
              >
                {{ tag }}
              </span>
              <span v-if="parseList(dosen.bidang_keahlian).length > 3" class="text-[10px] text-gray-400 self-center">
                +{{ parseList(dosen.bidang_keahlian).length - 3 }} lainnya
              </span>
              <span v-if="!dosen.bidang_keahlian" class="text-xs text-gray-400 italic">Belum tercatat</span>
            </div>
          </div>
        </div>

        <!-- Footer Card -->
        <div class="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
          <div class="flex items-center gap-3 text-gray-500 font-mono text-[11px]">
            <span title="Jumlah Publikasi Jurnal">
              <strong class="text-teal-700">{{ parseList(dosen.jurnal || dosen.publikasi).length }}</strong> Pub
            </span>
            <span>•</span>
            <span title="Jumlah Bimbingan">
              <strong class="text-blue-700">{{ parseList(dosen.judul_bimbing || dosen.riwayat_bimbingan).length }}</strong> Bimb
            </span>
          </div>
          <span class="inline-flex items-center text-emerald-600 font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
            Profil & Detail →
          </span>
        </div>
      </div>
    </div>

    <!-- Mode Tabel Rinci -->
    <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr class="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider font-bold border-b border-gray-200">
              <th class="py-3.5 px-4 text-center w-12">No</th>
              <th class="py-3.5 px-4">Nama Dosen & NIDN</th>
              <th class="py-3.5 px-4">Program Studi</th>
              <th class="py-3.5 px-4">Bidang Keahlian</th>
              <th class="py-3.5 px-4 text-center">Publikasi</th>
              <th class="py-3.5 px-4 text-center">Bimbingan</th>
              <th class="py-3.5 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr 
              v-for="(dosen, idx) in filteredDosen" 
              :key="dosen.id" 
              class="hover:bg-gray-50/70 transition-colors"
            >
              <td class="py-3.5 px-4 text-center text-gray-400 font-medium text-xs">{{ idx + 1 }}</td>
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                    :style="{ backgroundColor: getAvatarBg(dosen.nama) }"
                  >
                    {{ dosen.nama ? dosen.nama.charAt(0).toUpperCase() : 'D' }}
                  </div>
                  <div>
                    <router-link :to="`/dosen/${dosen.id}`" class="font-bold text-gray-900 text-sm hover:text-emerald-700 transition-colors block">
                      {{ dosen.nama }}
                    </router-link>
                    <div class="text-gray-400 text-[11px] font-mono">NIDN: {{ dosen.nidn || '-' }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4">
                <span class="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-medium rounded border border-gray-200">
                  {{ dosen.program_studi || 'Teknik Informatika' }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <div class="flex flex-wrap gap-1 max-w-xs">
                  <span 
                    v-for="(tag, tidx) in parseList(dosen.bidang_keahlian).slice(0, 2)" 
                    :key="tidx"
                    class="inline-block px-1.5 py-0.5 bg-gray-50 text-gray-700 text-[10px] rounded border border-gray-200"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="parseList(dosen.bidang_keahlian).length > 2" class="text-[10px] text-gray-400">
                    +{{ parseList(dosen.bidang_keahlian).length - 2 }}
                  </span>
                </div>
              </td>
              <td class="py-3.5 px-4 text-center">
                <span class="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {{ parseList(dosen.jurnal || dosen.publikasi).length }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <span class="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {{ parseList(dosen.judul_bimbing || dosen.riwayat_bimbingan).length }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <router-link 
                  :to="`/dosen/${dosen.id}`" 
                  class="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded text-xs font-semibold transition-all"
                >
                  Lihat Profil
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
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
