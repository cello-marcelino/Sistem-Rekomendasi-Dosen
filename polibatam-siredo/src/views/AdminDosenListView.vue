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
</script>

<template>
  <div class="space-y-6 pb-12 animate-in">
    <!-- Header Section (Canvas-First) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-sans">Master Data Dosen</h1>
        <p class="text-sm text-gray-600 mt-1">
          Pengelolaan data profil, publikasi, dan keahlian dosen pengajar.
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <router-link 
          to="/admin/dosen/create" 
          class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded hover:bg-teal-800 transition-colors shadow-sm"
        >
          + Tambah Data
        </router-link>
      </div>
    </div>

    <!-- Metrics Row (Elevated Card) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 bg-white border border-gray-200 rounded shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Populasi Master</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalDosen }}</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Total Publikasi</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalPub }}</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Riwayat Bimbingan</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalBimb }}</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Riwayat Ujian</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">{{ stats.totalUji }}</div>
      </div>
    </div>

    <!-- Table Workspace (Elevated Card) -->
    <div class="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
      <!-- Filter & Search Bar -->
      <div class="border-b border-gray-200 bg-gray-50/70 px-6 py-3.5 flex flex-col sm:flex-row gap-3 items-center">
        <input 
          type="text" 
          v-model="search" 
          placeholder="Cari berdasarkan nama, NIDN, atau keahlian..." 
          class="w-full max-w-md bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
        />
        <select 
          v-model="selectedProdi" 
          class="w-full sm:w-52 bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
        >
          <option value="">Semua Prodi</option>
          <option v-for="p in prodiOptions" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
        <thead class="bg-white border-b border-gray-200 font-mono text-[10px] uppercase tracking-widest text-gray-700 font-bold sticky top-0">
          <tr>
            <th class="p-4 border-r border-gray-200 w-12 text-center">No</th>
            <th class="p-4 border-r border-gray-200">Identitas Dosen</th>
            <th class="p-4 border-r border-gray-200">Program Studi</th>
            <th class="p-4 border-r border-gray-200">Keahlian (Cuplikan)</th>
            <th class="p-4 text-center w-32">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
             <td colspan="5" class="p-12 text-center text-[11px] font-mono uppercase tracking-widest text-gray-500">Memuat Master Data...</td>
          </tr>
          <tr v-else-if="filteredDosen.length === 0">
             <td colspan="5" class="p-12 text-center text-[11px] font-mono uppercase tracking-widest text-gray-500">Kosong</td>
          </tr>
          <tr v-for="(dosen, idx) in filteredDosen" :key="dosen.id || idx" class="hover:bg-gray-50">
            <td class="p-4 border-r border-gray-200 text-center font-mono text-gray-400">{{ idx + 1 }}</td>
            <td class="p-4 border-r border-gray-200">
              <div class="font-bold text-gray-900 text-sm mb-0.5">{{ dosen.nama }}</div>
              <div class="font-mono text-[10px] text-gray-500">NIDN: {{ dosen.nidn || '-' }}</div>
            </td>
            <td class="p-4 border-r border-gray-200 font-bold text-teal-700">
              {{ dosen.program_studi || '-' }}
            </td>
            <td class="p-4 border-r border-gray-200">
               <div class="flex flex-wrap gap-1">
                 <span v-for="(tag, tidx) in parseList(dosen.bidang_keahlian).slice(0,2)" :key="tidx" class="px-2 py-0.5 border border-gray-200 bg-gray-50 text-[10px] text-gray-700">
                   {{ tag }}
                 </span>
                 <span v-if="parseList(dosen.bidang_keahlian).length > 2" class="text-[10px] text-gray-400">...</span>
               </div>
            </td>
            <td class="p-4 text-center font-mono font-bold text-[10px] uppercase tracking-widest">
              <div class="flex items-center justify-center gap-2">
                <router-link :to="`/admin/dosen/${dosen.nidn || dosen.id}/edit`" class="text-teal-700 hover:text-teal-800 hover:underline">Edit</router-link>
                <span class="text-gray-300">|</span>
                <button @click="handleDelete(dosen)" class="text-red-600 hover:underline">Hapus</button>
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
  animation: fade-in 0.3s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
