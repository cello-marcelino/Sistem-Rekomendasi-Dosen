<script setup>
import { ref, computed } from 'vue'
import api from '../services/api'
import * as XLSX from 'xlsx'

const fileInput = ref(null)
const loading = ref(false)
const resultData = ref(null)
const error = ref(null)
const fileName = ref('')
const step = ref(1) // 1: upload, 2: processing, 3: result
const searchQuery = ref('')
const selectedRoom = ref('')

const triggerUpload = () => {
  fileInput.value.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  fileName.value = file.name
  error.value = null
}

const processScheduling = async () => {
  const file = fileInput.value?.files[0]
  if (!file) {
    error.value = "Pilih file Excel jadwal mahasiswa terlebih dahulu."
    return
  }
  
  step.value = 2
  loading.value = true
  error.value = null
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('top_k', 5)
  
  try {
    const response = await api.post('/rekomendasi/batch/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    const rawData = response.data?.data
    const batchResults = Array.isArray(rawData) ? rawData : (rawData?.results || [])
    
    const scheduled = batchResults.map((row, index) => {
      const recs = row.rekomendasi?.recommendations || row.recommendations || []
      let penguji1 = recs[0]?.dosen?.nama || recs[0]?.nama_dosen || "Dosen Penguji 1"
      let penguji2 = recs[1]?.dosen?.nama || recs[1]?.nama_dosen || "Dosen Penguji 2"
      
      const date = new Date()
      date.setDate(date.getDate() + 7 + Math.floor(index / 4))
      
      const hours = [8, 10, 13, 15]
      const timeStr = `${hours[index % 4].toString().padStart(2, '0')}:00 - ${(hours[index % 4] + 1).toString().padStart(2, '0')}:30`
      
      return {
        mahasiswa_id: row.id || row.mahasiswa_id || `MHS${1001 + index}`,
        nama_mahasiswa: row.nama || row.nama_mahasiswa || `Mahasiswa #${index + 1}`,
        judul_tugas_akhir: row.judul || row.judul_tugas_akhir || 'Topik Penelitian Tugas Akhir',
        penguji_1: penguji1,
        penguji_2: penguji2,
        tanggal: date.toISOString().split('T')[0],
        waktu: timeStr,
        ruangan: `R. PBL ${101 + (index % 3)}`
      }
    })
    
    resultData.value = scheduled
    step.value = 3
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || 'Terjadi kesalahan saat memproses data. Pastikan format kolom sesuai template.'
    step.value = 1
  } finally {
    loading.value = false
  }
}

const filteredSchedule = computed(() => {
  if (!resultData.value) return []
  return resultData.value.filter(row => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchQuery = !q || 
      row.nama_mahasiswa.toLowerCase().includes(q) ||
      row.mahasiswa_id.toLowerCase().includes(q) ||
      row.penguji_1.toLowerCase().includes(q) ||
      row.penguji_2.toLowerCase().includes(q) ||
      row.judul_tugas_akhir.toLowerCase().includes(q)
    
    const matchRoom = !selectedRoom.value || row.ruangan === selectedRoom.value
    return matchQuery && matchRoom
  })
})

const downloadSchedule = () => {
  if (!resultData.value) return
  
  const data = resultData.value.map(row => ({
    'NIM': row.mahasiswa_id,
    'Nama Mahasiswa': row.nama_mahasiswa,
    'Judul TA': row.judul_tugas_akhir,
    'Penguji 1': row.penguji_1,
    'Penguji 2': row.penguji_2,
    'Tanggal Ujian': row.tanggal,
    'Waktu': row.waktu,
    'Ruangan': row.ruangan
  }))
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Jadwal Ujian")
  XLSX.writeFile(wb, `Jadwal_Ujian_Sidang_Polibatam.xlsx`)
}

const downloadTemplate = () => {
  const data = [
    { id: '3312011001', nama: 'Budi Santoso', judul: 'Penerapan AI untuk Klasifikasi Gambar', abstrak: 'Penelitian ini menggunakan CNN...' },
    { id: '3312011002', nama: 'Siti Aminah', judul: 'Sistem Informasi Akademik Berbasis Web', abstrak: 'Membangun SIAKAD menggunakan Vue...' }
  ]
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data Peserta Ujian")
  XLSX.writeFile(wb, "Template_Jadwal_Ujian.xlsx")
}
</script>

<template>
  <div class="space-y-6 pb-12 animate-in">
    <!-- Header Section (Canvas-First) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-sans">Jadwal Sidang & Penguji</h1>
        <p class="text-sm text-gray-600 mt-1">
          Penetapan jadwal sidang dan dosen penguji otomatis tanpa bentrok berbasis kecocokan topik NLP.
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button 
          @click="downloadTemplate" 
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Template
        </button>
      </div>
    </div>

    <!-- KPI Metrics (Elevated Card) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 bg-white border border-gray-200 rounded shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Slot Sesi</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">4 Sesi / Hari</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kapasitas Ruang</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">3 Ruang PBL</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Dosen Penguji</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">2 Dosen / Mhs</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Jadwal Sidang</div>
        <div class="text-2xl font-mono font-bold text-teal-800 tabular-nums">Bebas Bentrok</div>
      </div>
    </div>

    <!-- Main Workspace (Elevated Card with Stepper) -->
    <div class="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
      <!-- Stepper Bar -->
      <div class="flex border-b border-gray-200 bg-gray-50 w-full divide-x divide-gray-200">
        <div class="flex-1 p-3.5 flex items-center gap-3" :class="step === 1 ? 'bg-white' : ''">
          <div class="text-xs font-mono font-bold uppercase tracking-widest" :class="step === 1 ? 'text-teal-700' : 'text-gray-400'">01. Upload</div>
        </div>
        <div class="flex-1 p-3.5 flex items-center gap-3" :class="step === 2 ? 'bg-white' : ''">
          <div class="text-xs font-mono font-bold uppercase tracking-widest" :class="step === 2 ? 'text-teal-700' : 'text-gray-400'">02. Alokasi NLP</div>
        </div>
        <div class="flex-1 p-3.5 flex items-center gap-3" :class="step === 3 ? 'bg-white' : ''">
          <div class="text-xs font-mono font-bold uppercase tracking-widest" :class="step === 3 ? 'text-teal-700' : 'text-gray-400'">03. Jadwal Final</div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="w-full bg-white relative">
      
      <!-- Step 1 -->
      <div v-if="step === 1" class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 h-full">
        <!-- Upload Box -->
        <div class="p-8 flex flex-col justify-center">
          <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-4">Berkas Excel (.xlsx)</div>
          <div 
            @click="triggerUpload"
            class="border border-dashed border-gray-400 bg-gray-50 rounded-[4px] p-12 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors text-center"
          >
            <div class="text-sm font-bold text-gray-900 mb-2">{{ fileName ? fileName : 'Pilih File Jadwal' }}</div>
            <div v-if="!fileName" class="text-xs text-gray-500">Pilih file yang berisi data daftar mahasiswa</div>
            <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileChange">
          </div>
          <button 
            @click="processScheduling" 
            :disabled="!fileName"
            class="mt-6 w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-[4px] transition-colors disabled:opacity-50 shadow-sm"
          >
            Mulai Penjadwalan
          </button>
          <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-700 rounded-[4px] text-sm border border-red-200">{{ error }}</div>
        </div>

        <!-- Constraints Rule (Clean list, primary points only) -->
        <div class="p-8 bg-gray-50 flex flex-col">
          <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700 mb-4">Ketentuan Penjadwalan</div>
          <div class="bg-white border border-gray-200 divide-y divide-gray-100 rounded-sm">
            <div class="p-4">
              <div class="font-bold text-sm text-gray-900 mb-0.5">Kesesuaian Bidang Penguji</div>
              <div class="text-xs text-gray-600">Dipilih otomatis berdasarkan ranking kecocokan topik NLP (BM25 & SBERT).</div>
            </div>
            <div class="p-4">
              <div class="font-bold text-sm text-gray-900 mb-0.5">Pencegahan Jadwal Bentrok</div>
              <div class="text-xs text-gray-600">Dosen tidak akan dijadwalkan pada jam sidang yang bersamaan.</div>
            </div>
            <div class="p-4">
              <div class="font-bold text-sm text-gray-900 mb-0.5">Alokasi Ruangan Sidang</div>
              <div class="text-xs text-gray-600">Didistribusikan merata ke ruang sidang PBL 101, 102, dan 103.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2 -->
      <div v-if="step === 2" class="p-20 flex flex-col items-center justify-center text-center">
        <div class="w-12 h-12 border-2 border-gray-200 border-t-teal-600 rounded-full animate-spin mb-6"></div>
        <div class="text-xl font-bold text-gray-900 mb-2">Menyusun Jadwal Sidang...</div>
        <div class="text-sm text-gray-600 max-w-sm">Mencocokkan kepakaran dosen dengan topik proposal dan mengalokasikan slot waktu bebas bentrok.</div>
      </div>

      <!-- Step 3 -->
      <div v-if="step === 3" class="flex flex-col h-full">
        <div class="p-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center bg-gray-50">
          <div class="flex gap-4">
            <input v-model="searchQuery" type="text" placeholder="Cari..." class="px-3 py-2 border border-gray-300 rounded-[4px] text-xs focus:border-teal-500 focus:outline-none w-64" />
            <select v-model="selectedRoom" class="px-3 py-2 border border-gray-300 rounded-[4px] text-xs focus:border-teal-500 focus:outline-none bg-white">
              <option value="">Semua Ruangan</option>
              <option value="R. PBL 101">R. PBL 101</option>
              <option value="R. PBL 102">R. PBL 102</option>
              <option value="R. PBL 103">R. PBL 103</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button @click="step = 1" class="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-[4px] text-xs font-bold hover:bg-gray-100">Ulangi</button>
            <button @click="downloadSchedule" class="px-4 py-2 bg-teal-600 text-white rounded-[4px] text-xs font-bold hover:bg-teal-700">Download Excel</button>
          </div>
        </div>
        
        <div class="flex-1 overflow-auto bg-white">
          <table class="w-full text-left text-xs">
            <thead class="bg-white border-b border-gray-200 font-mono text-[10px] uppercase tracking-widest text-gray-500 sticky top-0">
              <tr>
                <th class="p-4 border-b border-gray-200">Mahasiswa</th>
                <th class="p-4 border-b border-gray-200">Topik</th>
                <th class="p-4 border-b border-gray-200">Penguji 1</th>
                <th class="p-4 border-b border-gray-200">Penguji 2</th>
                <th class="p-4 border-b border-gray-200">Waktu</th>
                <th class="p-4 border-b border-gray-200">Ruangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(row, idx) in filteredSchedule" :key="idx" class="hover:bg-gray-50">
                <td class="p-4 align-top">
                  <div class="font-bold text-gray-900 mb-0.5">{{ row.nama_mahasiswa }}</div>
                  <div class="font-mono text-[10px] text-gray-500">{{ row.mahasiswa_id }}</div>
                </td>
                <td class="p-4 text-gray-600 max-w-xs align-top">
                  <div class="line-clamp-2" :title="row.judul_tugas_akhir">{{ row.judul_tugas_akhir }}</div>
                </td>
                <td class="p-4 font-bold text-gray-900 align-top">{{ row.penguji_1 }}</td>
                <td class="p-4 font-bold text-gray-900 align-top">{{ row.penguji_2 }}</td>
                <td class="p-4 font-mono align-top">
                  <div class="text-gray-900 font-bold mb-0.5">{{ row.tanggal }}</div>
                  <div class="text-[10px] text-gray-500">{{ row.waktu }}</div>
                </td>
                <td class="p-4 align-top">
                  <span class="border border-gray-300 px-2 py-1 font-mono text-[10px] font-bold text-gray-700 bg-white">{{ row.ruangan }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
