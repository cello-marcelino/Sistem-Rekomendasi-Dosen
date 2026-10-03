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
</script>

<template>
  <div class="space-y-6 pb-12 animate-in font-sans">
    <!-- Header Section (Canvas-First) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-h1 font-bold text-gray-900 tracking-tight font-sans">Direktori Dosen</h1>
        <p class="text-base text-gray-700 mt-1 font-normal">
          Daftar profil, bidang keahlian, dan riwayat akademik dosen pembimbing dan penguji.
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="inline-flex items-center px-3 py-1 text-tiny font-sans font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 rounded-[4px]">
          <span class="font-mono font-bold tabular-nums mr-1">{{ filteredDosen.length }} / {{ stats.totalDosen }}</span> Dosen
        </span>
      </div>
    </div>

    <!-- Metrics Row (Elevated Card) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 bg-white border border-gray-200/90 rounded-lg shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-gray-200/80 overflow-hidden">
      <div class="p-5">
        <div class="text-tiny font-sans font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Dosen</div>
        <div class="text-h1 font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalDosen }}</div>
      </div>
      <div class="p-5">
        <div class="text-tiny font-sans font-bold text-gray-500 uppercase tracking-wider mb-1.5">Publikasi Terindeks</div>
        <div class="text-h1 font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalPub }}</div>
      </div>
      <div class="p-5">
        <div class="text-tiny font-sans font-bold text-gray-500 uppercase tracking-wider mb-1.5">Riwayat Bimbingan</div>
        <div class="text-h1 font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalBimb }}</div>
      </div>
      <div class="p-5">
        <div class="text-tiny font-sans font-bold text-gray-500 uppercase tracking-wider mb-1.5">Riwayat Pengujian</div>
        <div class="text-h1 font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalUji }}</div>
      </div>
    </div>

    <!-- Filter & Search Bar (Elevated Card) -->
    <div class="bg-white border border-gray-200/90 rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 max-w-2xl">
        <div class="relative flex-1">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari nama, NIDN, atau keahlian dosen..." 
            class="w-full bg-white border border-gray-300 rounded-[4px] px-3.5 py-2 text-base text-gray-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-sans"
          />
        </div>
        <select 
          v-model="selectedProdi" 
          class="w-full sm:w-56 bg-white border border-gray-300 rounded-[4px] px-3.5 py-2 text-base text-gray-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-sans"
        >
          <option value="">Semua Program Studi</option>
          <option v-for="p in prodiOptions" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>

      <div class="flex border border-gray-300 rounded-[4px] bg-white overflow-hidden shrink-0">
        <button 
          @click="viewMode = 'grid'" 
          class="px-3.5 py-2 text-base font-semibold font-sans transition-colors"
          :class="viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'"
        >
          GRID
        </button>
        <div class="w-px bg-gray-300"></div>
        <button 
          @click="viewMode = 'table'" 
          class="px-3.5 py-2 text-base font-semibold font-sans transition-colors"
          :class="viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'"
        >
          TABLE
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-20 min-h-[360px] bg-white border border-gray-200/90 rounded-lg shadow-sm">
      <div class="w-8 h-8 border-2 border-gray-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      <span class="text-base font-sans font-semibold uppercase tracking-wider text-gray-500">Memuat Katalog Dosen...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredDosen.length === 0" class="flex-1 border border-dashed border-gray-300 bg-white rounded-lg flex items-center justify-center p-20 text-center">
      <span class="text-base font-sans font-bold text-gray-400">Tidak ada dosen yang cocok dengan pencarian</span>
    </div>

    <!-- Content: Grid View -->
    <div v-else-if="viewMode === 'grid'">
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
                  class="w-10 h-10 rounded-[4px] text-white font-bold flex items-center justify-center shrink-0 text-h3 shadow-sm font-sans"
                  :style="{ backgroundColor: getAvatarBg(dosen.nama) }"
                >
                  {{ dosen.nama ? dosen.nama.charAt(0).toUpperCase() : 'D' }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-bold text-gray-900 text-h3 group-hover:text-teal-700 transition-colors leading-snug font-sans" :title="dosen.nama">
                    {{ dosen.nama }}
                  </h3>
                  <div class="text-tiny text-gray-500 mt-1 font-sans">
                    NIDN: <span class="font-mono">{{ dosen.nidn || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Program Studi -->
              <div class="mb-3.5 pt-3 border-t border-gray-100">
                <div class="text-tiny font-sans font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Program Studi
                </div>
                <div class="text-tiny font-semibold text-teal-800 bg-teal-50/80 border border-teal-200/80 px-2 py-0.5 inline-block rounded-[3px] font-sans">
                  {{ dosen.program_studi || 'Teknik Informatika' }}
                </div>
              </div>

              <!-- Bidang Keahlian -->
              <div class="pt-3 border-t border-gray-100">
                <div class="text-tiny font-sans font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Bidang Keahlian
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="(tag, tidx) in parseList(dosen.bidang_keahlian).slice(0, 3)" 
                    :key="tidx"
                    class="px-2 py-0.5 border border-gray-200 bg-gray-50 text-tiny text-gray-800 rounded-[3px] font-medium font-sans"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="parseList(dosen.bidang_keahlian).length > 3" class="text-tiny font-sans font-semibold text-teal-700 self-center px-1">
                    +{{ parseList(dosen.bidang_keahlian).length - 3 }} lainnya
                  </span>
                  <span v-if="!parseList(dosen.bidang_keahlian).length" class="text-tiny text-gray-400 italic font-sans">
                    Belum terdata
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Statistics Footer (3 Columns, Clean Division) -->
          <div class="border-t border-gray-200/90 bg-gray-50/80 grid grid-cols-3 divide-x divide-gray-200 text-center py-3">
            <div class="px-2">
              <div class="text-h3 font-mono font-bold text-gray-900 tabular-nums">
                {{ parseList(dosen.jurnal || dosen.publikasi).length }}
              </div>
              <div class="text-tiny font-sans text-gray-600 font-medium uppercase tracking-wider mt-0.5">
                Publikasi
              </div>
            </div>
            <div class="px-2">
              <div class="text-h3 font-mono font-bold text-gray-900 tabular-nums">
                {{ parseList(dosen.judul_bimbing || dosen.riwayat_bimbingan).length }}
              </div>
              <div class="text-tiny font-sans text-gray-600 font-medium uppercase tracking-wider mt-0.5">
                Bimbingan
              </div>
            </div>
            <div class="px-2">
              <div class="text-h3 font-mono font-bold text-gray-900 tabular-nums">
                {{ parseList(dosen.judul_uji || dosen.riwayat_pengujian).length }}
              </div>
              <div class="text-tiny font-sans text-gray-600 font-medium uppercase tracking-wider mt-0.5">
                Pengujian
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content: Table View -->
    <div v-else class="bg-white border border-gray-200/90 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-base border-collapse">
          <thead class="bg-gray-50/80 border-b border-gray-200/90 font-sans text-tiny uppercase tracking-wider text-gray-700 font-bold">
            <tr>
              <th class="p-4 border-r border-gray-200/80 w-12 text-center">No</th>
              <th class="p-4 border-r border-gray-200/80">Nama Dosen & NIDN</th>
              <th class="p-4 border-r border-gray-200/80">Program Studi</th>
              <th class="p-4 border-r border-gray-200/80">Bidang Keahlian</th>
              <th class="p-4 text-right">Rekam Akademik</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(dosen, idx) in filteredDosen" :key="dosen.id" class="hover:bg-slate-50 transition-colors">
              <td class="p-4 border-r border-gray-100 text-center font-mono text-gray-500 font-bold">{{ idx + 1 }}</td>
              <td class="p-4 border-r border-gray-100">
                <router-link :to="`/dosen/${dosen.id}`" class="font-bold text-gray-900 text-base hover:text-teal-700 hover:underline block mb-0.5 font-sans">
                  {{ dosen.nama }}
                </router-link>
                <div class="text-tiny text-gray-500 font-sans">NIDN: <span class="font-mono">{{ dosen.nidn || '-' }}</span></div>
              </td>
              <td class="p-4 border-r border-gray-100 text-teal-800 font-semibold font-sans">
                {{ dosen.program_studi || 'Teknik Informatika' }}
              </td>
              <td class="p-4 border-r border-gray-100">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(tag, tidx) in parseList(dosen.bidang_keahlian).slice(0, 3)" :key="tidx" class="px-2 py-0.5 border border-gray-200 bg-gray-50 text-tiny text-gray-700 rounded-[2px] font-sans">
                    {{ tag }}
                  </span>
                  <span v-if="parseList(dosen.bidang_keahlian).length > 3" class="text-tiny text-gray-400 self-center font-sans">+{{ parseList(dosen.bidang_keahlian).length - 3 }}</span>
                </div>
              </td>
              <td class="p-4 text-base text-right whitespace-nowrap font-sans">
                <div class="font-bold text-gray-900"><span class="font-mono tabular-nums">{{ parseList(dosen.jurnal || dosen.publikasi).length }}</span> <span class="text-tiny text-gray-500 font-normal">Publikasi</span></div>
                <div class="font-bold text-gray-900"><span class="font-mono tabular-nums">{{ parseList(dosen.judul_bimbing || dosen.riwayat_bimbingan).length }}</span> <span class="text-tiny text-gray-500 font-normal">Bimbingan</span></div>
                <div class="font-bold text-gray-900"><span class="font-mono tabular-nums">{{ parseList(dosen.judul_uji || dosen.riwayat_pengujian).length }}</span> <span class="text-tiny text-gray-500 font-normal">Pengujian</span></div>
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
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
