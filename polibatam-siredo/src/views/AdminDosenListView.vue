<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'

const dosens = ref([])
const loading = ref(true)
const search = ref('')
const selectedProdi = ref('')

const fetchDosen = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/dosen')
    dosens.value = res.data.data || []
  } catch (error) {
    try {
      const resFallback = await api.get('/dosen')
      dosens.value = resFallback.data.data || []
    } catch (fallbackErr) {
      console.error('Failed to fetch dosen', error)
    }
  } finally {
    loading.value = false
  }
}

const handleDelete = async (dosen) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus data dosen "${dosen.nama}"?`)) return
  try {
    await api.delete(`/admin/dosen/${dosen.nidn || dosen.id}`)
    await fetchDosen()
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Gagal menghapus data dosen')
  }
}

onMounted(() => {
  fetchDosen()
})

const parseList = (str) => {
  if (!str) return []
  if (Array.isArray(str)) return str
  if (str.includes('", "')) return str.split('", "').map(s => s.replace(/^"|"$/g, '').trim()).filter(s => s)
  if (str.includes('\n')) return str.split('\n').map(s => s.trim()).filter(s => s)
  let cleaned = str.replace(/^"|"$/g, '').trim()
  if (cleaned) return [cleaned]
  return []
}

// Compute stats
const stats = computed(() => {
  let totalDosen = dosens.value.length
  let totalPub = 0
  let totalBimb = 0
  let totalUji = 0
  
  dosens.value.forEach(d => {
    totalPub += parseList(d.jurnal || d.publikasi).length
    totalBimb += parseList(d.judul_bimbing || d.riwayat_bimbingan).length
    totalUji += parseList(d.judul_uji || d.riwayat_pengujian).length
  })
  
  return { totalDosen, totalPub, totalBimb, totalUji }
})

// Filter
const prodiOptions = computed(() => {
  const prodis = new Set()
  dosens.value.forEach(d => {
    if (d.program_studi) prodis.add(d.program_studi)
  })
  return Array.from(prodis).sort()
})

const filteredDosen = computed(() => {
  let filtered = dosens.value
  if (selectedProdi.value) {
    filtered = filtered.filter(d => d.program_studi === selectedProdi.value)
  }
  if (search.value) {
    const s = search.value.toLowerCase()
    filtered = filtered.filter(d => 
      (d.nama && d.nama.toLowerCase().includes(s)) ||
      (d.nidn && d.nidn.toLowerCase().includes(s)) ||
      (d.bidang_keahlian && d.bidang_keahlian.toLowerCase().includes(s))
    )
  }
  return filtered
})

const getAvatarBg = (nama) => {
  const colors = ['#0d9488', '#059669', '#2563eb', '#7c3aed', '#dc2626', '#d97706', '#0284c7']
  if (!nama) return colors[0]
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = nama.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div class="space-y-6 animate-in">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h1 class="text-[1.35rem] font-bold text-gray-900 tracking-tight">Pengelolaan Data Dosen & Portfolio</h1>
        <p class="text-sm text-gray-500 mt-1">Pusat pengelolaan data dosen, keahlian, publikasi jurnal, serta riwayat bimbingan & pengujian sidang.</p>
      </div>
      <router-link to="/admin/dosen/create" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap text-sm">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Tambah Dosen Baru</span>
      </router-link>
    </div>

    <!-- Summary Stats Bar (Hero Metric + Stacked) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Dominant Hero Card -->
      <div class="md:col-span-1 bg-emerald-900 text-white rounded-xl shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h2 class="text-emerald-100 text-sm font-medium">Total Populasi Dosen</h2>
          <div class="text-[3rem] font-bold mt-2 font-mono tabular-nums leading-none">{{ stats.totalDosen }}</div>
        </div>
        <div class="mt-4 pt-4 border-t border-emerald-800">
          <p class="text-xs text-emerald-200">Berdasarkan sinkronisasi data master terbaru (Semester Berjalan)</p>
        </div>
      </div>
      
      <!-- 3 Secondary Cards Stacked/Grid -->
      <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-center">
          <div class="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Publikasi Jurnal</div>
          <div class="text-2xl font-bold text-gray-900 font-mono tabular-nums">{{ stats.totalPub }}</div>
          <div class="text-[10px] text-gray-400 mt-1">Seluruh Riwayat Historis</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-center">
          <div class="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Bimbingan</div>
          <div class="text-2xl font-bold text-gray-900 font-mono tabular-nums">{{ stats.totalBimb }}</div>
          <div class="text-[10px] text-gray-400 mt-1">Seluruh Riwayat Historis</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-center">
          <div class="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Pengujian</div>
          <div class="text-2xl font-bold text-gray-900 font-mono tabular-nums">{{ stats.totalUji }}</div>
          <div class="text-[10px] text-gray-400 mt-1">Seluruh Riwayat Historis</div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Controls Bar -->
    <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <!-- Search Field -->
        <div class="relative flex-1">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            v-model="search" 
            placeholder="Cari nama dosen, NIDN, atau bidang keahlian..." 
            class="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-900 transition-all placeholder:text-gray-400"
          />
          <button 
            v-if="search" 
            @click="search = ''" 
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
            title="Bersihkan pencarian"
          >
            ×
          </button>
        </div>

        <!-- Filter Prodi Dropdown -->
        <div class="flex items-center gap-2.5 w-full md:w-auto">
          <div class="relative flex-1 md:w-[260px]">
            <select 
              v-model="selectedProdi" 
              class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-8 text-xs font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer appearance-none"
            >
              <option value="">Semua Program Studi</option>
              <option v-for="p in prodiOptions" :key="p" :value="p">{{ p }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button 
            v-if="selectedProdi || search"
            type="button" 
            @click="selectedProdi = ''; search = ''" 
            class="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors border border-gray-200 whitespace-nowrap cursor-pointer"
            title="Reset semua filter"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-if="loading" class="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center min-h-[400px]">
      <div class="w-10 h-10 border-4 border-gray-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <span class="text-gray-500 text-sm font-medium">Memuat data dosen dan portfolio...</span>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr class="bg-gray-50/80 text-gray-500 text-[11px] uppercase tracking-wider font-bold border-b border-gray-200">
              <th class="py-4 px-5 text-center w-16">No</th>
              <th class="py-4 px-5">Profil Dosen</th>
              <th class="py-4 px-5">Program Studi</th>
              <th class="py-4 px-5">Bidang Keahlian</th>
              <th class="py-4 px-5 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="(dosen, idx) in filteredDosen" :key="dosen.id || idx" class="hover:bg-gray-50/80 transition-colors group">
              <td class="py-4 px-5 text-center text-gray-400 font-medium">{{ idx + 1 }}</td>
              <td class="py-4 px-5">
                <div class="flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm" :style="{ backgroundColor: getAvatarBg(dosen.nama) }">
                    {{ dosen.nama ? dosen.nama.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <div>
                    <div class="font-bold text-gray-900 text-[14px]">
                      {{ dosen.nama }}
                    </div>
                    <div class="text-gray-500 text-[11px] font-mono mt-0.5 tracking-wide">NIDN: {{ dosen.nidn || '-' }}</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-5">
                <span class="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded border border-gray-200">
                  {{ dosen.program_studi || '-' }}
                </span>
              </td>
              <td class="py-4 px-5">
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="(tag, tidx) in parseList(dosen.bidang_keahlian)" 
                    :key="tidx"
                    class="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded border border-blue-100/50"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="!dosen.bidang_keahlian" class="text-gray-400 text-xs italic">Belum diisi</span>
                </div>
              </td>
              <td class="py-4 px-5 text-center">
                <div class="flex items-center justify-center gap-2">
                  <router-link 
                    :to="`/admin/dosen/${dosen.nidn || dosen.id}/edit`" 
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg text-xs font-semibold transition-all shadow-2xs"
                    title="Edit Data Dosen"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </router-link>
                  <button 
                    type="button" 
                    @click="handleDelete(dosen)" 
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Hapus Dosen"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Hapus</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDosen.length === 0">
              <td colspan="5" class="py-16 text-center">
                <div class="flex flex-col items-center justify-center text-gray-400">
                  <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Data dosen tidak ditemukan</span>
                </div>
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
  animation: fade-in 0.4s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
