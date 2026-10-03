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
  <div class="space-y-6 pb-12 animate-in font-sans">
    <!-- Header Section (Canvas-First) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-h1 font-bold text-gray-900 tracking-tight font-sans">Batch Recommendation</h1>
        <p class="text-base text-gray-700 mt-1 font-normal">
          Pemrosesan massal proposal tugas akhir via Excel untuk rekomendasi dosen otomatis.
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button 
          @click="downloadTemplate" 
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-[4px] hover:bg-gray-50 transition-colors shadow-sm font-sans"
        >
          <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Unduh Template Excel
        </button>
      </div>
    </div>

    <!-- Metrics Row (Elevated Card) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 bg-white border border-gray-200/90 rounded-lg shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-gray-200/80 overflow-hidden">
      <div class="p-5">
        <div class="text-tiny font-sans font-bold text-gray-500 uppercase tracking-wider mb-1.5">Format Berkas</div>
        <div class="text-h2 font-sans font-bold text-gray-900">Excel (.xlsx)</div>
      </div>
      <div class="p-5">
        <div class="text-tiny font-sans font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kapasitas Proses</div>
        <div class="text-h2 font-sans font-bold text-gray-900">Ratusan Data</div>
      </div>
      <div class="p-5">
        <div class="text-tiny font-sans font-bold text-gray-500 uppercase tracking-wider mb-1.5">Kandidat</div>
        <div class="text-h2 font-sans font-bold text-gray-900">Top-3 Dosen</div>
      </div>
      <div class="p-5">
        <div class="text-tiny font-sans font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sistem Skor</div>
        <div class="text-h2 font-sans font-bold text-gray-900">Hybrid Scoring</div>
      </div>
    </div>

    <!-- Main Workspace (Elevated Card) -->
    <div class="bg-white border border-gray-200/90 rounded-lg shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 w-full items-stretch">
      
      <!-- Upload Panel -->
      <div class="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50 p-6 lg:p-8 flex flex-col gap-6">
        
        <h2 class="text-h2 font-sans font-bold text-gray-900">Unggah Berkas Proposal</h2>
        
        <div 
          @click="triggerUpload"
          class="border border-dashed border-gray-300 bg-white rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-600 transition-colors text-center shadow-2xs"
        >
          <div class="text-h3 font-bold text-gray-900 mb-1 font-sans">
            {{ fileName ? fileName : 'Pilih Berkas Excel' }}
          </div>
          <div v-if="!fileName" class="text-base text-gray-500 font-sans">Klik atau seret berkas ke area ini</div>
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileChange">
        </div>

        <button 
          @click="uploadFile" 
          :disabled="!fileName || loading"
          class="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-base font-semibold rounded-[4px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm font-sans"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Memproses Berkas...' : 'Mulai Proses Batch' }}
        </button>
        
        <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-[4px] text-base border border-red-200 font-sans">
          {{ error }}
        </div>

        <div class="mt-4 pt-6 border-t border-gray-200">
          <div class="text-tiny font-sans font-bold uppercase tracking-wider text-gray-500 mb-3">Format Kolom Spreadsheet</div>
          <div class="border border-gray-200 rounded-[4px] divide-y divide-gray-100 bg-white text-base">
            <div class="flex justify-between p-3 font-sans"><span class="font-mono font-bold text-teal-800">id</span><span class="text-gray-600">NIM Mahasiswa</span></div>
            <div class="flex justify-between p-3 font-sans"><span class="font-mono font-bold text-teal-800">nama</span><span class="text-gray-600">Nama Lengkap</span></div>
            <div class="flex justify-between p-3 font-sans"><span class="font-mono font-bold text-teal-800">judul</span><span class="text-gray-600">Judul Tugas Akhir</span></div>
            <div class="flex justify-between p-3 font-sans"><span class="font-mono font-bold text-teal-800">abstrak</span><span class="text-gray-600">Ringkasan Proposal</span></div>
          </div>
        </div>

      </div>

      <!-- Results Panel -->
      <div class="lg:col-span-8 p-6 lg:p-8 flex flex-col">
        
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-h2 font-sans font-bold text-gray-900">Status & Hasil Pemrosesan</h2>
          <div v-if="result" class="text-tiny font-sans font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 border border-teal-200/80 rounded-[4px]">Selesai Diproses</div>
          <div v-else-if="loading" class="text-tiny font-sans font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 border border-amber-200/80 rounded-[4px] flex items-center gap-2">
             <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Memproses Data
          </div>
        </div>

        <!-- Empty / Loading State -->
        <div v-if="!result" class="flex-1 border border-dashed border-gray-300 bg-gray-50/50 rounded-lg flex flex-col items-center justify-center p-12 min-h-[400px]">
          <div v-if="loading" class="w-full max-w-md space-y-4">
             <div class="flex justify-between text-base font-bold text-gray-700 font-sans">
               <span>Inferensi Model NLP...</span>
               <span class="font-mono tabular-nums">{{ progress }}%</span>
             </div>
             <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
               <div class="bg-teal-600 h-full transition-all" :style="{ width: progress + '%' }"></div>
             </div>
          </div>
          <div v-else class="text-base font-sans font-bold text-gray-400">
            Unggah berkas Excel di panel kiri untuk memulai plotting batch
          </div>
        </div>

        <!-- Result Data -->
        <div v-else class="space-y-6">
          <div class="flex border border-gray-200/90 rounded-lg divide-x divide-gray-200 bg-white overflow-hidden shadow-2xs">
            <div class="flex-1 p-4 bg-gray-50/70 text-center">
              <div class="text-h1 font-mono font-bold text-gray-900 tabular-nums">{{ result.results?.length || 0 }}</div>
              <div class="text-tiny font-sans font-semibold uppercase tracking-wider text-gray-500 mt-1">Data Diproses</div>
            </div>
            <div class="flex-1 p-4 bg-gray-50/70 text-center">
              <div class="text-h1 font-mono font-bold text-gray-900 tabular-nums">{{ (((result.processing_time_ms || 0) / 1000)).toFixed(1) }}s</div>
              <div class="text-tiny font-sans font-semibold uppercase tracking-wider text-gray-500 mt-1">Waktu Total</div>
            </div>
            <div class="flex-1 p-4 bg-gray-50/70 text-center flex flex-col justify-center items-center">
              <button @click="downloadResult" class="text-base font-semibold bg-teal-700 text-white px-4 py-2 rounded-[4px] hover:bg-teal-800 transition-colors shadow-sm font-sans">
                Unduh Hasil (.xlsx)
              </button>
            </div>
          </div>

          <div>
             <h3 class="text-h3 font-sans font-bold text-gray-900 mb-3">Pratinjau Hasil Rekomendasi</h3>
             <div class="border border-gray-200/90 rounded-lg bg-white overflow-x-auto shadow-sm">
               <table class="w-full text-left text-base border-collapse">
                 <thead class="bg-gray-50/80 border-b border-gray-200/90 font-sans text-h3 uppercase tracking-wider text-gray-700 font-bold">
                   <tr>
                     <th class="p-3.5 border-r border-gray-200/80">NIM & Mahasiswa</th>
                     <th class="p-3.5 border-r border-gray-200/80">Judul Tugas Akhir</th>
                     <th class="p-3.5 border-r border-gray-200/80">Rekomendasi Utama</th>
                     <th class="p-3.5 text-right">Skor</th>
                   </tr>
                 </thead>
                 <tbody class="divide-y divide-gray-100">
                   <tr v-for="(item, idx) in (result.results || []).slice(0, 10)" :key="idx" class="hover:bg-slate-50 transition-colors">
                     <td class="p-3.5 border-r border-gray-100">
                       <div class="font-bold text-gray-900 font-sans text-h3">{{ item.nama || item.nama_mahasiswa || '-' }}</div>
                       <div class="font-mono text-base text-gray-500">{{ item.id || item.mahasiswa_id || '-' }}</div>
                     </td>
                     <td class="p-3.5 border-r border-gray-100 text-gray-700 max-w-[240px] truncate font-sans text-base" :title="item.judul || item.judul_tugas_akhir">
                       {{ item.judul || item.judul_tugas_akhir || '-' }}
                     </td>
                     <td class="p-3.5 border-r border-gray-100 font-semibold text-teal-800 font-sans text-h3">
                       {{ (item.rekomendasi?.recommendations?.[0] || item.recommendations?.[0])?.dosen?.nama || (item.rekomendasi?.recommendations?.[0] || item.recommendations?.[0])?.nama_dosen || '-' }}
                     </td>
                     <td class="p-3.5 text-right font-mono font-bold text-gray-900 tabular-nums text-h3">
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
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
