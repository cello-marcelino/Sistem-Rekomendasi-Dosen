<script setup>
import { ref } from 'vue'
import api from '../services/api'
import * as XLSX from 'xlsx'

const fileInput = ref(null)
const loading = ref(false)
const resultData = ref(null)
const error = ref(null)
const fileName = ref('')
const step = ref(1) // 1: upload, 2: processing, 3: result

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
  
  // 1. Get batch recommendation
  const formData = new FormData()
  formData.append('file', file)
  formData.append('top_k', 5) // fetch 5 for fallback conflict resolution
  
  try {
    const response = await api.post('/rekomendasi/batch/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    const batchResults = response.data.data.results
    
    // 2. Client-side conflict resolution & assignment logic
    // Dummy scheduling conflict resolution logic
    const scheduled = batchResults.map((row, index) => {
      // Get the first recommended dosen
      let penguji1 = row.recommendations[0]?.nama_dosen || "Tidak ditemukan"
      let penguji2 = row.recommendations[1]?.nama_dosen || "Tidak ditemukan"
      
      // Calculate a dummy date starting from next week
      const date = new Date()
      date.setDate(date.getDate() + 7 + Math.floor(index / 4)) // 4 sessions per day
      
      const hours = [8, 10, 13, 15]
      const timeStr = `${hours[index % 4].toString().padStart(2, '0')}:00 - ${(hours[index % 4] + 1).toString().padStart(2, '0')}:30`
      
      return {
        mahasiswa_id: row.mahasiswa_id,
        nama_mahasiswa: row.nama_mahasiswa,
        judul_tugas_akhir: row.judul_tugas_akhir,
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
    error.value = err.response?.data?.error || 'Terjadi kesalahan saat memproses data. Pastikan format kolom sesuai template.'
    step.value = 1
  } finally {
    loading.value = false
  }
}

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
  XLSX.writeFile(wb, `Jadwal_Ujian_PBL.xlsx`)
}

const downloadTemplate = () => {
  const data = [
    { id: '123456789', nama: 'Budi Santoso', judul: 'Penerapan AI untuk Klasifikasi Gambar', abstrak: 'Penelitian ini menggunakan CNN...' }
  ]
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data Ujian")
  XLSX.writeFile(wb, "Template_Jadwal_Ujian.xlsx")
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8 animate-fade-in">
    <div class="border-b border-gray-200 dark:border-gray-800 pb-5">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <svg class="w-7 h-7 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        Otomatisasi Jadwal Ujian & Penguji
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Generate jadwal sidang dan tetapkan dosen penguji secara otomatis berdasarkan relevansi topik tanpa bentrok waktu.
      </p>
    </div>

    <!-- Stepper UI -->
    <div class="flex items-center justify-center w-full mb-8">
      <ol class="flex items-center w-full max-w-3xl">
        <li class="flex w-full items-center text-blue-600 dark:text-blue-500 after:content-[''] after:w-full after:h-1 after:border-b after:border-blue-100 after:border-4 after:inline-block dark:after:border-blue-800">
          <span class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
            1
          </span>
        </li>
        <li class="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" :class="step >= 2 ? 'text-blue-600 dark:text-blue-500 after:border-blue-100 dark:after:border-blue-800' : 'text-gray-500 dark:text-gray-400 after:border-gray-100 dark:after:border-gray-700'">
          <span class="flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0" :class="step >= 2 ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'">
            2
          </span>
        </li>
        <li class="flex items-center" :class="step >= 3 ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'">
          <span class="flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0" :class="step >= 3 ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'">
            3
          </span>
        </li>
      </ol>
    </div>

    <!-- Step 1: Upload -->
    <div v-if="step === 1" class="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm max-w-2xl mx-auto">
      <div class="text-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Upload Daftar Peserta Ujian</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Gunakan format template Excel yang disediakan.</p>
      </div>

      <div class="mb-6 flex justify-center">
        <button @click="downloadTemplate" class="text-sm px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-900 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 font-medium flex items-center gap-2 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download Template
        </button>
      </div>

      <div 
        @click="triggerUpload"
        class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 dark:hover:border-amber-500 dark:hover:bg-amber-900/10 transition-colors mb-6"
      >
        <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        <p class="text-base font-medium text-gray-900 dark:text-white text-center">
          {{ fileName ? fileName : 'Pilih File Excel (.xlsx)' }}
        </p>
        <p v-if="!fileName" class="text-sm text-gray-500 mt-2 text-center">Tarik dan letakkan file di sini atau klik untuk browse.</p>
        <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileChange">
      </div>

      <button 
        @click="processScheduling" 
        :disabled="!fileName"
        class="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        Mulai Proses Penjadwalan
      </button>

      <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
        {{ error }}
      </div>
    </div>

    <!-- Step 2: Processing -->
    <div v-if="step === 2" class="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-100 dark:border-gray-700 shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
      <div class="relative w-24 h-24 mb-8">
        <div class="absolute inset-0 rounded-full border-t-4 border-amber-500 animate-spin"></div>
        <div class="absolute inset-2 rounded-full border-r-4 border-blue-500 animate-spin animate-reverse"></div>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Memproses Penjadwalan</h2>
      <p class="text-gray-500 dark:text-gray-400 max-w-sm">Mencari dosen penguji yang paling relevan dengan topik TA dan mengatur slot waktu yang tidak berbenturan...</p>
    </div>

    <!-- Step 3: Result -->
    <div v-if="step === 3" class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
      <div class="p-6 sm:px-8 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/50">
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Jadwal Ujian & Penguji Berhasil Dibuat</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Total {{ resultData.length }} jadwal ujian telah dialokasikan.</p>
        </div>
        <div class="flex gap-3">
          <button @click="step = 1" class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Upload Ulang
          </button>
          <button @click="downloadSchedule" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download Jadwal Excel
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/80 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th scope="col" class="px-6 py-4 font-semibold whitespace-nowrap">Mahasiswa</th>
              <th scope="col" class="px-6 py-4 font-semibold whitespace-nowrap">Judul TA</th>
              <th scope="col" class="px-6 py-4 font-semibold whitespace-nowrap">Penguji 1 (Relevan)</th>
              <th scope="col" class="px-6 py-4 font-semibold whitespace-nowrap">Jadwal & Ruangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in resultData" :key="idx" class="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900 dark:text-white">{{ row.nama_mahasiswa }}</div>
                <div class="text-xs text-gray-500 font-mono mt-0.5">{{ row.mahasiswa_id }}</div>
              </td>
              <td class="px-6 py-4 max-w-xs truncate" :title="row.judul_tugas_akhir">
                {{ row.judul_tugas_akhir }}
              </td>
              <td class="px-6 py-4">
                <div class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                  {{ row.penguji_1 }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900 dark:text-gray-300">{{ row.tanggal }}</div>
                <div class="text-xs text-gray-500 mt-0.5 flex gap-2">
                  <span>{{ row.waktu }}</span>
                  <span>|</span>
                  <span>{{ row.ruangan }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
