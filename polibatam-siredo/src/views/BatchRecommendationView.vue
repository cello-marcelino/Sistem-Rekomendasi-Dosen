<script setup>
import { ref } from 'vue'
import api from '../services/api'
import * as XLSX from 'xlsx'

const fileInput = ref(null)
const loading = ref(false)
const result = ref(null)
const error = ref(null)
const progress = ref(0)
const fileName = ref('')

const triggerUpload = () => {
  fileInput.value.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  fileName.value = file.name
  error.value = null
  result.value = null
}

const uploadFile = async () => {
  const file = fileInput.value?.files[0]
  if (!file) {
    error.value = "Pilih file Excel terlebih dahulu."
    return
  }
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('top_k', 3)
  
  loading.value = true
  error.value = null
  progress.value = 0
  
  // Simulate progress
  const interval = setInterval(() => {
    if (progress.value < 90) progress.value += 5
  }, 500)
  
  try {
    const response = await api.post('/rekomendasi/batch/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    result.value = response.data.data
    progress.value = 100
  } catch (err) {
    error.value = err.response?.data?.error || 'Terjadi kesalahan saat memproses file. Pastikan format sesuai.'
  } finally {
    clearInterval(interval)
    loading.value = false
  }
}

const downloadResult = () => {
  if (!result.value || !result.value.results) return
  
  const data = result.value.results.map(row => {
    const flat = {
      ID: row.mahasiswa_id,
      Nama: row.nama_mahasiswa,
      'Judul TA': row.judul_tugas_akhir
    }
    row.recommendations.forEach((rec, idx) => {
      flat[`Rekomendasi ${idx + 1}`] = rec.nama_dosen
      flat[`Skor ${idx + 1}`] = rec.hybrid_score.toFixed(4)
    })
    return flat
  })
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Hasil Rekomendasi")
  XLSX.writeFile(wb, `Hasil_Batch_Rekomendasi.xlsx`)
}

const downloadTemplate = () => {
  const data = [
    { id: '123456789', nama: 'Budi Santoso', judul: 'Penerapan AI untuk Klasifikasi Gambar', abstrak: 'Penelitian ini menggunakan CNN...' },
    { id: '987654321', nama: 'Siti Aminah', judul: 'Sistem Informasi Akademik Berbasis Web', abstrak: 'Membangun SIAKAD menggunakan Vue...' }
  ]
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data Mahasiswa")
  XLSX.writeFile(wb, "Template_Batch_SiReDo.xlsx")
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8 animate-fade-in">
    <div class="border-b border-gray-200  pb-5">
      <h1 class="text-2xl font-bold text-gray-900  flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
        Batch Recommendation
      </h1>
      <p class="mt-2 text-gray-600 ">
        Fitur untuk Admin TA: proses puluhan atau ratusan data mahasiswa sekaligus menggunakan file Excel.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Upload Panel -->
      <div class="bg-white  rounded-xl p-6 border border-gray-100  shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900  mb-4">Upload File Excel</h2>
        
        <div class="mb-4">
          <button @click="downloadTemplate" class="text-sm text-blue-600 hover:text-blue-700  font-medium flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download Template Excel
          </button>
        </div>

        <div 
          @click="triggerUpload"
          class="border-2 border-dashed border-gray-300  rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 :border-blue-500 :bg-blue-900/10 transition-colors mb-6"
        >
          <svg class="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <p class="text-sm font-medium text-gray-900  text-center">
            {{ fileName ? fileName : 'Klik untuk memilih file Excel (.xlsx)' }}
          </p>
          <p v-if="!fileName" class="text-xs text-gray-500 mt-1 text-center">Pastikan format kolom sesuai template.</p>
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileChange">
        </div>

        <button 
          @click="uploadFile" 
          :disabled="!fileName || loading"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Memproses...' : 'Mulai Proses Batch' }}
        </button>

        <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100   ">
          {{ error }}
        </div>
      </div>

      <!-- Result Panel -->
      <div class="bg-gray-50  rounded-xl p-6 border border-gray-100 ">
        <h2 class="text-lg font-semibold text-gray-900  mb-4">Status & Hasil</h2>
        
        <div v-if="loading" class="space-y-4 py-8">
          <div class="flex justify-between text-sm font-medium text-gray-700 ">
            <span>Memproses dokumen...</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5  overflow-hidden">
            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
          </div>
          <p class="text-xs text-gray-500 text-center animate-pulse">Menjalankan inferensi SBERT dan perhitungan BM25. Mohon tunggu...</p>
        </div>
        
        <div v-else-if="result" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white  p-4 rounded-lg border border-gray-200  text-center">
              <div class="text-3xl font-bold text-gray-900 ">{{ result.results.length }}</div>
              <div class="text-xs text-gray-500 uppercase font-semibold mt-1">Data Diproses</div>
            </div>
            <div class="bg-white  p-4 rounded-lg border border-gray-200  text-center">
              <div class="text-3xl font-bold text-gray-900 ">{{ (result.processing_time_ms / 1000).toFixed(1) }}s</div>
              <div class="text-xs text-gray-500 uppercase font-semibold mt-1">Waktu Eksekusi</div>
            </div>
          </div>
          
          <div class="bg-green-50  p-4 rounded-lg border border-green-100  flex items-start gap-3">
            <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <h4 class="text-sm font-semibold text-green-800 ">Proses Selesai</h4>
              <p class="text-xs text-green-600  mt-1">Seluruh data telah berhasil dipetakan ke dosen pembimbing teratas.</p>
            </div>
          </div>

          <button @click="downloadResult" class="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download Hasil Excel
          </button>
        </div>
        
        <div v-else class="h-40 flex flex-col items-center justify-center text-center">
          <svg class="w-10 h-10 text-gray-300  mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <p class="text-sm text-gray-500 ">Belum ada proses berjalan.</p>
        </div>
      </div>
    </div>
  </div>
</template>
