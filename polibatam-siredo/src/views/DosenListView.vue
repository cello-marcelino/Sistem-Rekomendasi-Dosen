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
  const colors = ['#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash += nama.charCodeAt(i)
  return colors[hash % colors.length]
}

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
  <div class="space-y-6 pb-12 animate-in">
    <!-- Header Section (Canvas-First) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-sans">Direktori Dosen</h1>
        <p class="text-sm text-gray-600 mt-1">
          Daftar profil, bidang keahlian, dan riwayat akademik dosen pengajar.
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded">
          {{ filteredDosen.length }} / {{ stats.totalDosen }} Dosen
        </span>
      </div>
    </div>

    <!-- Metrics Row (Elevated Card) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 bg-white border border-gray-200 rounded shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Total Populasi</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalDosen }}</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Publikasi</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalPub }}</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Bimbingan</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalBimb }}</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pengujian</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalUji }}</div>
      </div>
    </div>

    <!-- Filter & Search Bar (Elevated Card) -->
    <div class="bg-white border border-gray-200 rounded p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="flex gap-4 w-full md:w-auto">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari nama, NIDN, atau keahlian..." 
          class="w-full md:w-64 bg-white border border-gray-300 rounded-[4px] px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-teal-500"
        />
        <select 
          v-model="selectedProdi" 
          class="w-full md:w-48 bg-white border border-gray-300 rounded-[4px] px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-teal-500"
        >
          <option value="">Semua Program Studi</option>
          <option v-for="p in prodiOptions" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>

      <div class="flex border border-gray-300 rounded-[4px] bg-white overflow-hidden">
        <button 
          @click="viewMode = 'grid'" 
          class="px-3 py-2 text-xs font-bold transition-colors"
          :class="viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'"
        >
          GRID
        </button>
        <div class="w-px bg-gray-300"></div>
        <button 
          @click="viewMode = 'table'" 
          class="px-3 py-2 text-xs font-bold transition-colors"
          :class="viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'"
        >
          TABLE
        </button>
      </div>
    </div>

    <!-- Loading / Empty -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-20 min-h-[400px]">
      <div class="w-8 h-8 border-2 border-gray-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      <span class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">Memuat Katalog...</span>
    </div>

    <div v-else-if="filteredDosen.length === 0" class="flex-1 border-t border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-20">
      <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Tidak ada dosen yang cocok</span>
    </div>

    <!-- Content: Grid View -->
    <div v-else-if="viewMode === 'grid'" class="p-6 lg:p-8 bg-slate-100/60 flex-1">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="dosen in filteredDosen" 
          :key="dosen.id" 
          @click="router.push(`/dosen/${dosen.id}`)"
          class="bg-white border border-gray-200/90 rounded-lg shadow-sm flex flex-col justify-between cursor-pointer hover:border-teal-500 hover:shadow-md transition-all group overflow-hidden"
        >
          <!-- Card Body -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <!-- Identity Header -->
              <div class="flex items-start gap-3.5 mb-4">
                <div 
                  class="w-10 h-10 rounded-[4px] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm"
                  :style="{ backgroundColor: getAvatarBg(dosen.nama) }"
                >
                  {{ dosen.nama ? dosen.nama.charAt(0).toUpperCase() : 'D' }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-bold text-gray-900 text-sm group-hover:text-teal-700 transition-colors leading-snug" :title="dosen.nama">
                    {{ dosen.nama }}
                  </h3>
                  <div class="text-[11px] font-mono text-gray-500 mt-1">
                    NIDN: {{ dosen.nidn || '-' }}
                  </div>
                </div>
              </div>

              <!-- Hierarchy: Program Studi -->
              <div class="mb-3.5 pt-3 border-t border-gray-100">
                <div class="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Program Studi
                </div>
                <div class="text-xs font-semibold text-teal-800 bg-teal-50/80 border border-teal-200/80 px-2 py-0.5 inline-block rounded-sm">
                  {{ dosen.program_studi || 'Teknik Informatika' }}
                </div>
              </div>

              <!-- Hierarchy: Bidang Keahlian -->
              <div class="pt-3 border-t border-gray-100">
                <div class="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Bidang Keahlian
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="(tag, tidx) in parseList(dosen.bidang_keahlian).slice(0, 3)" 
                    :key="tidx"
                    class="px-2 py-0.5 border border-gray-200 bg-gray-50 text-[11px] text-gray-800 rounded-sm font-medium"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="parseList(dosen.bidang_keahlian).length > 3" class="text-[10px] font-mono font-bold text-teal-700 self-center px-1">
                    +{{ parseList(dosen.bidang_keahlian).length - 3 }} lainnya
                  </span>
                  <span v-if="!parseList(dosen.bidang_keahlian).length" class="text-xs text-gray-400 italic">
                    Belum terdata
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Statistics Footer (3 Columns, Unabbreviated, Clear Division) -->
          <div class="border-t border-gray-200 bg-gray-50/80 grid grid-cols-3 divide-x divide-gray-200 text-center py-3">
            <div class="px-2">
              <div class="text-sm font-mono font-bold text-gray-900 tabular-nums">
                {{ parseList(dosen.jurnal || dosen.publikasi).length }}
              </div>
              <div class="text-[10px] font-mono text-gray-600 font-semibold uppercase tracking-wider mt-0.5">
                Publikasi
              </div>
            </div>
            <div class="px-2">
              <div class="text-sm font-mono font-bold text-gray-900 tabular-nums">
                {{ parseList(dosen.judul_bimbing || dosen.riwayat_bimbingan).length }}
              </div>
              <div class="text-[10px] font-mono text-gray-600 font-semibold uppercase tracking-wider mt-0.5">
                Bimbingan
              </div>
            </div>
            <div class="px-2">
              <div class="text-sm font-mono font-bold text-gray-900 tabular-nums">
                {{ parseList(dosen.judul_uji || dosen.riwayat_pengujian).length }}
              </div>
              <div class="text-[10px] font-mono text-gray-600 font-semibold uppercase tracking-wider mt-0.5">
                Pengujian
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content: Table View -->
    <div v-else class="flex-1 bg-white">
      <table class="w-full text-left text-xs">
        <thead class="bg-gray-50 border-b border-gray-200 font-mono text-[10px] uppercase tracking-widest text-gray-700 font-bold">
          <tr>
            <th class="p-4 border-r border-gray-200 w-12 text-center">No</th>
            <th class="p-4 border-r border-gray-200">Nama Dosen & NIDN</th>
            <th class="p-4 border-r border-gray-200">Program Studi</th>
            <th class="p-4 border-r border-gray-200">Keahlian</th>
            <th class="p-4 text-right">Metrik</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="(dosen, idx) in filteredDosen" :key="dosen.id" class="hover:bg-gray-50">
            <td class="p-4 border-r border-gray-200 text-center font-mono text-gray-400">{{ idx + 1 }}</td>
            <td class="p-4 border-r border-gray-200">
              <router-link :to="`/dosen/${dosen.id}`" class="font-bold text-gray-900 text-sm hover:text-teal-600 hover:underline block mb-1">
                {{ dosen.nama }}
              </router-link>
              <div class="text-[10px] font-mono text-gray-500">NIDN: {{ dosen.nidn || '-' }}</div>
            </td>
            <td class="p-4 border-r border-gray-200 text-teal-700 font-bold">
              {{ dosen.program_studi || 'Teknik Informatika' }}
            </td>
            <td class="p-4 border-r border-gray-200">
              <div class="flex flex-wrap gap-1">
                <span v-for="(tag, tidx) in parseList(dosen.bidang_keahlian).slice(0, 3)" :key="tidx" class="px-2 py-0.5 border border-gray-200 bg-gray-50 text-[10px] text-gray-700">
                  {{ tag }}
                </span>
                <span v-if="parseList(dosen.bidang_keahlian).length > 3" class="text-[10px] text-gray-400">+{{ parseList(dosen.bidang_keahlian).length - 3 }}</span>
              </div>
            </td>
            <td class="p-4 font-mono text-xs text-right whitespace-nowrap">
              <div class="font-bold text-gray-900">{{ parseList(dosen.jurnal || dosen.publikasi).length }} <span class="text-[10px] text-gray-500 font-normal">Publikasi</span></div>
              <div class="font-bold text-gray-900">{{ parseList(dosen.judul_bimbing || dosen.riwayat_bimbingan).length }} <span class="text-[10px] text-gray-500 font-normal">Bimbingan</span></div>
              <div class="font-bold text-gray-900">{{ parseList(dosen.judul_uji || dosen.riwayat_pengujian).length }} <span class="text-[10px] text-gray-500 font-normal">Pengujian</span></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fade-in 0.3s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
