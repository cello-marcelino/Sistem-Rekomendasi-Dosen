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
  formData.append('k_rank', 3)
  formData.append('top_k', 3)
  
  loading.value = true
  error.value = null
  progress.value = 0
  
  const interval = setInterval(() => {
    if (progress.value < 90) progress.value += 5
  }, 400)
  
  const startTime = performance.now()
  try {
    const response = await api.post('/rekomendasi/batch/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    const durationMs = Math.round(performance.now() - startTime)
    const rawData = response.data?.data
    const list = Array.isArray(rawData) ? rawData : (rawData?.results || [])

    result.value = {
      results: list,
      processing_time_ms: durationMs,
      meta: response.data?.meta || { total_processed: list.length }
    }
    progress.value = 100
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || 'Terjadi kesalahan saat memproses file. Pastikan format sesuai.'
  } finally {
    clearInterval(interval)
    loading.value = false
  }
}

const downloadResult = () => {
  const list = result.value?.results || (Array.isArray(result.value) ? result.value : [])
  if (!list.length) return
  
  const data = list.map((row, rowIdx) => {
    const flat = {
      ID: row.id || row.mahasiswa_id || (rowIdx + 1),
      Nama: row.nama || row.nama_mahasiswa || '-',
      'Judul TA': row.judul || row.judul_tugas_akhir || '-'
    }
    const recs = row.rekomendasi?.recommendations || row.recommendations || []
    recs.forEach((rec, idx) => {
      const namaDosen = rec.dosen?.nama || rec.nama_dosen || rec.nama || '-'
      const score = rec.scores?.hybrid ?? rec.hybrid_score ?? rec.skor ?? 0
      flat[`Rekomendasi ${idx + 1}`] = namaDosen
      flat[`Skor ${idx + 1}`] = typeof score === 'number' ? score.toFixed(4) : score
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
  <div class="space-y-6 pb-12 animate-in">
    <!-- Header Section (Canvas-First) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-sans">Batch Recommendation</h1>
        <p class="text-sm text-gray-600 mt-1">
          Pemrosesan massal proposal tugas akhir via Excel untuk rekomendasi dosen otomatis.
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

    <!-- Metrics Row (Elevated Card) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 bg-white border border-gray-200 rounded shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Format Berkas</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">Excel (.xlsx)</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kapasitas Proses</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">Ratusan Data</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kandidat</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">Top-3 Dosen</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Sistem Skor</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">Hybrid Scoring</div>
      </div>
    </div>

    <!-- Main Workspace (Elevated Card) -->
    <div class="bg-white border border-gray-200 rounded shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 w-full items-stretch">
      
      <!-- Upload Panel -->
      <div class="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50 p-6 lg:p-8 flex flex-col gap-6">
        
        <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">Unggah Berkas</div>
        
        <div 
          @click="triggerUpload"
          class="border border-dashed border-gray-400 bg-white rounded-[4px] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 transition-colors text-center"
        >
          <div class="text-sm font-bold text-gray-900 mb-1">
            {{ fileName ? fileName : 'Pilih File Excel' }}
          </div>
          <div v-if="!fileName" class="text-xs text-gray-500">Klik atau drag & drop file</div>
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileChange">
        </div>

        <button 
          @click="uploadFile" 
          :disabled="!fileName || loading"
          class="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-[4px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Memproses Batch...' : 'Mulai Proses Batch' }}
        </button>
        
        <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-[4px] text-sm border border-red-200">
          {{ error }}
        </div>

        <div class="mt-4 pt-6 border-t border-gray-200">
          <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-3">Format Kolom Wajib</div>
          <div class="border border-gray-200 rounded-sm divide-y divide-gray-200 bg-white text-xs">
            <div class="flex justify-between p-3"><span class="font-mono font-bold">id</span><span class="text-gray-500">NIM Mahasiswa</span></div>
            <div class="flex justify-between p-3"><span class="font-mono font-bold">nama</span><span class="text-gray-500">Nama Lengkap</span></div>
            <div class="flex justify-between p-3"><span class="font-mono font-bold">judul</span><span class="text-gray-500">Judul Skripsi</span></div>
            <div class="flex justify-between p-3"><span class="font-mono font-bold">abstrak</span><span class="text-gray-500">Ringkasan</span></div>
          </div>
        </div>

      </div>

      <!-- Results Panel -->
      <div class="lg:col-span-8 p-6 lg:p-8 flex flex-col">
        
        <div class="flex justify-between items-center mb-6">
          <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">Status & Hasil Pemrosesan</div>
          <div v-if="result" class="text-[11px] font-mono font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-2.5 py-1 border border-teal-200">Selesai</div>
          <div v-else-if="loading" class="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200 flex items-center gap-2">
             <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Memproses
          </div>
        </div>

        <!-- Empty / Loading State -->
        <div v-if="!result" class="flex-1 border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-12 min-h-[400px]">
          <div v-if="loading" class="w-full max-w-md space-y-4">
             <div class="flex justify-between text-xs font-bold text-gray-700 font-mono">
               <span>Inferensi Model...</span>
               <span>{{ progress }}%</span>
             </div>
             <div class="w-full h-1 bg-gray-200 overflow-hidden">
               <div class="bg-teal-500 h-full transition-all" :style="{ width: progress + '%' }"></div>
             </div>
          </div>
          <div v-else class="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Panel Hasil Batch Kosong
          </div>
        </div>

        <!-- Result Data -->
        <div v-else class="space-y-6">
          <div class="flex border border-gray-200 divide-x divide-gray-200">
            <div class="flex-1 p-4 bg-gray-50 text-center">
              <div class="text-3xl font-mono font-bold text-gray-900">{{ result.results?.length || 0 }}</div>
              <div class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mt-1">Data Diproses</div>
            </div>
            <div class="flex-1 p-4 bg-gray-50 text-center">
              <div class="text-3xl font-mono font-bold text-gray-900">{{ (((result.processing_time_ms || 0) / 1000)).toFixed(1) }}s</div>
              <div class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mt-1">Waktu Total</div>
            </div>
            <div class="flex-1 p-4 bg-gray-50 text-center flex flex-col justify-center items-center">
              <button @click="downloadResult" class="text-xs font-bold bg-teal-600 text-white px-4 py-2 hover:bg-teal-700 transition-colors">
                Unduh Hasil (.xlsx)
              </button>
            </div>
          </div>

          <div>
             <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-3">Preview Teratas</div>
             <div class="border border-gray-200 bg-white overflow-x-auto">
               <table class="w-full text-left text-xs">
                 <thead class="bg-gray-50 border-b border-gray-200 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                   <tr>
                     <th class="p-3">ID / Nama</th>
                     <th class="p-3">Judul Skripsi</th>
                     <th class="p-3">Rekomendasi #1</th>
                     <th class="p-3 text-right">Skor</th>
                   </tr>
                 </thead>
                 <tbody class="divide-y divide-gray-200">
                   <tr v-for="(item, idx) in (result.results || []).slice(0, 5)" :key="idx" class="hover:bg-gray-50">
                     <td class="p-3">
                       <div class="font-bold text-gray-900">{{ item.nama || item.nama_mahasiswa || '-' }}</div>
                       <div class="font-mono text-[10px] text-gray-500">{{ item.id || item.mahasiswa_id || '-' }}</div>
                     </td>
                     <td class="p-3 text-gray-600 max-w-[200px] truncate" :title="item.judul || item.judul_tugas_akhir">
                       {{ item.judul || item.judul_tugas_akhir || '-' }}
                     </td>
                     <td class="p-3 font-bold text-teal-700">
                       {{ (item.rekomendasi?.recommendations?.[0] || item.recommendations?.[0])?.dosen?.nama || (item.rekomendasi?.recommendations?.[0] || item.recommendations?.[0])?.nama_dosen || '-' }}
                     </td>
                     <td class="p-3 text-right font-mono font-bold text-gray-900 tabular-nums">
                       {{ (((item.rekomendasi?.recommendations?.[0] || item.recommendations?.[0])?.scores?.hybrid ?? (item.rekomendasi?.recommendations?.[0] || item.recommendations?.[0])?.hybrid_score ?? 0)).toFixed(3) }}
                     </td>
                   </tr>
                 </tbody>
               </table>
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
