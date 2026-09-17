<script setup>
import { ref, computed } from 'vue'
import api from '../services/api'
import * as XLSX from 'xlsx'
import { PERIOD_PRESETS, DEFAULT_SESSIONS, DEFAULT_ROOMS, scheduleDefenses, formatIndoDate } from '../services/scheduler'

// State
const fileInput = ref(null)
const loading = ref(false)
const error = ref(null)
const fileName = ref('')
const step = ref(1) // 1: Konfigurasi & Upload, 2: Processing, 3: Hasil Jadwal
const activeTab = ref('table') // 'table' | 'matrix' | 'workload'

// Periode Configuration State
const selectedPreset = ref('periode-1')
const isCustomDate = ref(false)
const customStartDate = ref('2026-10-05')
const customEndDate = ref('2026-10-09')
const maxPerDay = ref(2)
const maxPerPeriod = ref(10)

// Search & Filter State
const searchQuery = ref('')
const selectedRoomFilter = ref('')
const selectedDateFilter = ref('')
const selectedExaminerFilter = ref('')

// Result State
const scheduleResult = ref(null)

const activePeriod = computed(() => {
  if (isCustomDate.value) {
    return {
      id: 'custom',
      name: 'Periode Kustom',
      startDate: customStartDate.value,
      endDate: customEndDate.value,
      description: `Pelaksanaan: ${formatIndoDate(customStartDate.value)} – ${formatIndoDate(customEndDate.value)}`
    }
  }
  return PERIOD_PRESETS.find(p => p.id === selectedPreset.value) || PERIOD_PRESETS[0]
})

const handlePresetChange = (presetId) => {
  selectedPreset.value = presetId
  isCustomDate.value = false
  const p = PERIOD_PRESETS.find(x => x.id === presetId)
  if (p) {
    customStartDate.value = p.startDate
    customEndDate.value = p.endDate
  }
}

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
    error.value = "Pilih file Excel daftar mahasiswa / proposal terlebih dahulu."
    return
  }

  step.value = 2
  loading.value = true
  error.value = null

  try {
    // 1. Kirim file ke backend untuk scoring rekomendasi NLP batch jika belum ada rekomendasi
    const formData = new FormData()
    formData.append('file', file)
    formData.append('top_k', 8) // Ambil 8 kandidat teratas untuk fleksibilitas constraint

    const response = await api.post('/rekomendasi/batch/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const rawData = response.data?.data
    const batchProposals = Array.isArray(rawData) ? rawData : (rawData?.results || [])

    if (batchProposals.length === 0) {
      throw new Error("Tidak ada data proposal yang valid ditemukan dalam file Excel.")
    }

    // 2. Jalankan algoritma penjadwalan cerdas berbasis kuota (Max 2 TA/hari & Max 10 TA/periode)
    const result = scheduleDefenses(batchProposals, {
      periodId: activePeriod.value.id,
      startDate: activePeriod.value.startDate,
      endDate: activePeriod.value.endDate,
      sessions: DEFAULT_SESSIONS,
      rooms: DEFAULT_ROOMS,
      maxPerDay: maxPerDay.value,
      maxPerPeriod: maxPerPeriod.value
    })

    scheduleResult.value = result
    step.value = 3
  } catch (err) {
    console.error("Scheduling error:", err)
    error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses penjadwalan.'
    step.value = 1
  } finally {
    loading.value = false
  }
}

// Filtered Schedule
const filteredSchedule = computed(() => {
  if (!scheduleResult.value?.scheduled) return []
  return scheduleResult.value.scheduled.filter(row => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchQuery = !q ||
      row.nama_mahasiswa.toLowerCase().includes(q) ||
      row.mahasiswa_id.toLowerCase().includes(q) ||
      row.penguji_1.toLowerCase().includes(q) ||
      row.penguji_2.toLowerCase().includes(q) ||
      row.judul_tugas_akhir.toLowerCase().includes(q)

    const matchRoom = !selectedRoomFilter.value || row.ruangan === selectedRoomFilter.value
    const matchDate = !selectedDateFilter.value || row.tanggal === selectedDateFilter.value
    const matchExaminer = !selectedExaminerFilter.value ||
      row.penguji_1 === selectedExaminerFilter.value ||
      row.penguji_2 === selectedExaminerFilter.value

    return matchQuery && matchRoom && matchDate && matchExaminer
  })
})

// Unique Examiners list for filter dropdown
const uniqueExaminers = computed(() => {
  if (!scheduleResult.value?.examinerWorkload) return []
  return scheduleResult.value.examinerWorkload.map(e => e.nama)
})

// Download Schedule Excel
const downloadSchedule = () => {
  if (!scheduleResult.value?.scheduled) return

  const dataJadwal = scheduleResult.value.scheduled.map((row, idx) => ({
    'No': idx + 1,
    'NIM': row.mahasiswa_id,
    'Nama Mahasiswa': row.nama_mahasiswa,
    'Judul Tugas Akhir': row.judul_tugas_akhir,
    'Dosen Pembimbing': row.pembimbing,
    'Penguji 1': row.penguji_1,
    'Penguji 2': row.penguji_2,
    'Tanggal Sidang': row.tanggal,
    'Hari': row.tanggal_indo,
    'Sesi': row.sesi_label,
    'Jam': row.waktu,
    'Ruangan': row.ruangan,
    'Periode': activePeriod.value.name
  }))

  const dataWorkload = scheduleResult.value.examinerWorkload.map((w, idx) => ({
    'No': idx + 1,
    'Nama Dosen': w.nama,
    'Total Menguji (Periode Ini)': w.total,
    'Batas Maksimal Periode': w.maxPeriod,
    'Persentase Beban': `${w.percentage}%`
  }))

  const wb = XLSX.utils.book_new()
  const ws1 = XLSX.utils.json_to_sheet(dataJadwal)
  const ws2 = XLSX.utils.json_to_sheet(dataWorkload)

  XLSX.utils.book_append_sheet(wb, ws1, "Jadwal Sidang TA")
  XLSX.utils.book_append_sheet(wb, ws2, "Rekap Beban Penguji")

  const safeFileName = `Jadwal_Sidang_${activePeriod.value.name.replace(/\s+/g, '_')}.xlsx`
  XLSX.writeFile(wb, safeFileName)
}

// Download Sample Template
const downloadTemplate = () => {
  const templateData = [
    {
      id: '3312011001',
      nama: 'Budi Santoso',
      judul: 'Penerapan Deep Learning Convolutional Neural Network untuk Klasifikasi Cacat PCB Elektronik',
      abstrak: 'Penelitian ini mengembangkan arsitektur CNN ResNet-50 untuk mendeteksi cacat soldering pada manufaktur PCB.'
    },
    {
      id: '3312011002',
      nama: 'Siti Aminah',
      judul: 'Sistem Monitoring Kualitas Udara Ruang Laboratorium Berbasis ESP32 dan Protokol MQTT',
      abstrak: 'Implementasi IoT untuk pemantauan suhu, kelembaban, dan partikulat debu secara real-time terintegrasi dashboard.'
    },
    {
      id: '3312011003',
      nama: 'Rian Pratama',
      judul: 'Rancang Bangun Sistem Informasi Pengelolaan Logistik Gudang Berbasis Web Menggunakan Node.js',
      abstrak: 'Membangun aplikasi manajemen inventory dengan pelacakan barcode dan estimasi restock otomatis.'
    }
  ]
  const ws = XLSX.utils.json_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data Peserta Sidang")
  XLSX.writeFile(wb, "Template_Peserta_Sidang_Polibatam.xlsx")
}
</script>

<template>
  <div class="space-y-6 pb-12 animate-in">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-sans">Penjadwalan Otomatis Sidang TA</h1>
        <p class="text-sm text-gray-600 mt-1">
          Penetapan jadwal sidang dan alokasi 2 dosen penguji otomatis tanpa bentrok berbasis kecocokan NLP serta batasan kuota.
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button 
          @click="downloadTemplate" 
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Unduh Template Excel
        </button>
      </div>
    </div>

    <!-- KPI & Constraint Indicators -->
    <div class="grid grid-cols-2 lg:grid-cols-4 bg-white border border-gray-200 rounded shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Maks. Uji Harian</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">{{ maxPerDay }} Judul / Hari</div>
        <div class="text-[11px] text-gray-500 mt-1">Batas beban 1 dosen per tanggal</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Maks. Uji Periode</div>
        <div class="text-2xl font-mono font-bold text-teal-800 tabular-nums">{{ maxPerPeriod }} Judul / Periode</div>
        <div class="text-[11px] text-gray-500 mt-1">Reset kuota pada periode baru</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Kapasitas Sesi</div>
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">4 Sesi × 3 Ruangan</div>
        <div class="text-[11px] text-gray-500 mt-1">12 Slot Sidang per Hari</div>
      </div>
      <div class="p-5">
        <div class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Jadwal Penguji</div>
        <div class="text-2xl font-mono font-bold text-teal-700 tabular-nums">Bebas Bentrok</div>
        <div class="text-[11px] text-gray-500 mt-1">Penguji 1 ≠ Penguji 2 & Bebas Ruang</div>
      </div>
    </div>

    <!-- Stepper Navigation Header -->
    <div class="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
      <div class="flex border-b border-gray-200 bg-gray-50 w-full divide-x divide-gray-200">
        <button 
          @click="step = 1" 
          type="button"
          class="flex-1 p-3.5 flex items-center justify-center gap-2 transition-colors text-left" 
          :class="step === 1 ? 'bg-white font-bold text-teal-700' : 'text-gray-500 hover:bg-gray-100'"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono" :class="step === 1 ? 'bg-teal-100 text-teal-800' : 'bg-gray-200 text-gray-600'">1</span>
          <span class="text-xs font-mono uppercase tracking-wider">Konfigurasi & Berkas</span>
        </button>
        <div 
          class="flex-1 p-3.5 flex items-center justify-center gap-2 text-left" 
          :class="step === 2 ? 'bg-white font-bold text-teal-700' : 'text-gray-400'"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono" :class="step === 2 ? 'bg-teal-100 text-teal-800' : 'bg-gray-200 text-gray-400'">2</span>
          <span class="text-xs font-mono uppercase tracking-wider">Alokasi Jadwal & NLP</span>
        </div>
        <button 
          :disabled="!scheduleResult"
          @click="scheduleResult && (step = 3)" 
          type="button"
          class="flex-1 p-3.5 flex items-center justify-center gap-2 transition-colors text-left disabled:cursor-not-allowed" 
          :class="step === 3 ? 'bg-white font-bold text-teal-700' : 'text-gray-500 hover:bg-gray-100'"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono" :class="step === 3 ? 'bg-teal-100 text-teal-800' : 'bg-gray-200 text-gray-600'">3</span>
          <span class="text-xs font-mono uppercase tracking-wider">Jadwal Sidang Final</span>
        </button>
      </div>

      <!-- Step 1: Configuration & File Upload -->
      <div v-if="step === 1" class="p-6 md:p-8 space-y-8">
        <!-- 1. Periode Sidang Selection -->
        <div>
          <h2 class="text-sm font-mono font-bold text-gray-900 uppercase tracking-wider mb-3">1. Pilih Periode Pelaksanaan Sidang</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="preset in PERIOD_PRESETS" 
              :key="preset.id"
              @click="handlePresetChange(preset.id)"
              class="p-4 rounded border-2 cursor-pointer transition-all flex flex-col justify-between"
              :class="selectedPreset === preset.id && !isCustomDate ? 'border-teal-600 bg-teal-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm text-gray-900">{{ preset.name }}</span>
                <span v-if="selectedPreset === preset.id && !isCustomDate" class="text-xs font-mono font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">Aktif</span>
              </div>
              <p class="text-xs text-gray-600 mb-3">{{ preset.description }}</p>
              <div class="text-[11px] font-mono text-gray-500">5 Hari Kerja (Senin – Jumat)</div>
            </div>
          </div>
        </div>

        <!-- 2. File Upload Box -->
        <div>
          <h2 class="text-sm font-mono font-bold text-gray-900 uppercase tracking-wider mb-3">2. Unggah Berkas Peserta Sidang (.xlsx)</h2>
          <div 
            @click="triggerUpload"
            class="border-2 border-dashed border-gray-300 bg-gray-50 rounded p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all text-center group"
          >
            <svg class="w-10 h-10 text-gray-400 group-hover:text-teal-600 transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="text-sm font-bold text-gray-900 mb-1">{{ fileName || 'Klik untuk memilih file Excel peserta sidang' }}</div>
            <div class="text-xs text-gray-500">Format kolom: <code>id / nim</code>, <code>nama</code>, <code>judul</code>, <code>abstrak</code></div>
            <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileChange">
          </div>

          <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-700 rounded text-xs border border-red-200">
            <strong>Error:</strong> {{ error }}
          </div>

          <div class="mt-6 flex justify-end">
            <button 
              @click="processScheduling" 
              :disabled="!fileName || loading"
              type="button"
              class="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded transition-colors disabled:opacity-50 shadow-sm inline-flex items-center gap-2"
            >
              <span>Jalankan Penjadwalan Otomatis</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Processing Spinner -->
      <div v-if="step === 2" class="p-16 flex flex-col items-center justify-center text-center">
        <div class="w-12 h-12 border-3 border-gray-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">Menyusun Jadwal Sidang Bebas Bentrok...</h3>
        <p class="text-xs text-gray-600 max-w-md">
          Mengevaluasi kecocokan topik dengan kepakaran dosen, membatasi kuota harian (max 2 TA) & kuota periode (max 10 TA), serta menempatkan ruangan sidang.
        </p>
      </div>

      <!-- Step 3: Result Workspace -->
      <div v-if="step === 3 && scheduleResult" class="flex flex-col h-full">
        <!-- Sub-Navigation Tabs & Actions -->
        <div class="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
          <!-- View Tabs -->
          <div class="flex items-center gap-1 bg-gray-200/80 p-1 rounded">
            <button 
              @click="activeTab = 'table'" 
              type="button"
              class="px-3 py-1.5 text-xs font-semibold rounded transition-all"
              :class="activeTab === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            >
              Tabel Jadwal ({{ filteredSchedule.length }})
            </button>
            <button 
              @click="activeTab = 'workload'" 
              type="button"
              class="px-3 py-1.5 text-xs font-semibold rounded transition-all"
              :class="activeTab === 'workload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            >
              Beban Penguji ({{ scheduleResult.examinerWorkload.length }})
            </button>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-2">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari NIM, Nama, Penguji, Judul..." 
              class="px-3 py-1.5 border border-gray-300 rounded text-xs focus:border-teal-500 focus:outline-none w-52 bg-white" 
            />

            <select v-model="selectedDateFilter" class="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:border-teal-500 focus:outline-none bg-white">
              <option value="">Semua Tanggal</option>
              <option v-for="d in scheduleResult.period.workingDays" :key="d" :value="d">{{ formatIndoDate(d) }}</option>
            </select>

            <select v-model="selectedRoomFilter" class="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:border-teal-500 focus:outline-none bg-white">
              <option value="">Semua Ruang</option>
              <option value="R. PBL 101">R. PBL 101</option>
              <option value="R. PBL 102">R. PBL 102</option>
              <option value="R. PBL 103">R. PBL 103</option>
            </select>

            <button 
              @click="downloadSchedule" 
              type="button"
              class="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Ekspor Excel
            </button>
          </div>
        </div>

        <!-- Summary Banner -->
        <div class="px-6 py-3 bg-teal-50 border-b border-teal-100 flex flex-wrap items-center justify-between text-xs text-teal-900 font-mono">
          <div>
            <strong>Periode:</strong> {{ activePeriod.name }} ({{ formatIndoDate(activePeriod.startDate) }} s.d. {{ formatIndoDate(activePeriod.endDate) }})
          </div>
          <div>
            <strong>Total Berhasil Dijadwalkan:</strong> {{ scheduleResult.totalScheduled }} / {{ scheduleResult.totalRequested }} Mahasiswa
          </div>
        </div>

        <!-- View 1: Tabel Jadwal -->
        <div v-if="activeTab === 'table'" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 border-b border-gray-200 font-mono text-[10px] uppercase tracking-widest text-gray-500 sticky top-0">
              <tr>
                <th class="p-3.5 border-b border-gray-200">No</th>
                <th class="p-3.5 border-b border-gray-200">Mahasiswa</th>
                <th class="p-3.5 border-b border-gray-200">Topik Tugas Akhir</th>
                <th class="p-3.5 border-b border-gray-200">Penguji 1</th>
                <th class="p-3.5 border-b border-gray-200">Penguji 2</th>
                <th class="p-3.5 border-b border-gray-200">Jadwal & Waktu</th>
                <th class="p-3.5 border-b border-gray-200">Ruangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="(row, idx) in filteredSchedule" :key="row.id || idx" class="hover:bg-gray-50/80 transition-colors">
                <td class="p-3.5 font-mono text-gray-500 align-top">{{ idx + 1 }}</td>
                <td class="p-3.5 align-top">
                  <div class="font-bold text-gray-900">{{ row.nama_mahasiswa }}</div>
                  <div class="font-mono text-[11px] text-gray-500">{{ row.mahasiswa_id }}</div>
                </td>
                <td class="p-3.5 text-gray-700 max-w-sm align-top">
                  <div class="line-clamp-2" :title="row.judul_tugas_akhir">{{ row.judul_tugas_akhir }}</div>
                </td>
                <td class="p-3.5 align-top">
                  <div class="font-semibold text-gray-900">{{ row.penguji_1 }}</div>
                  <div class="text-[10px] font-mono text-teal-700">Rank Rekomendasi #{{ row.penguji_1_rank || 1 }}</div>
                </td>
                <td class="p-3.5 align-top">
                  <div class="font-semibold text-gray-900">{{ row.penguji_2 }}</div>
                  <div class="text-[10px] font-mono text-teal-700">Rank Rekomendasi #{{ row.penguji_2_rank || 2 }}</div>
                </td>
                <td class="p-3.5 font-mono align-top whitespace-nowrap">
                  <div class="font-bold text-gray-900">{{ row.tanggal_indo }}</div>
                  <div class="text-[11px] text-gray-500">{{ row.sesi_label }} ({{ row.waktu }})</div>
                </td>
                <td class="p-3.5 align-top whitespace-nowrap">
                  <span class="inline-block px-2.5 py-1 font-mono text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded">
                    {{ row.ruangan }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredSchedule.length === 0">
                <td colspan="7" class="p-8 text-center text-gray-500 text-xs font-mono">
                  Tidak ada jadwal yang sesuai dengan filter pencarian.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- View 2: Workload Dosen Tracker -->
        <div v-if="activeTab === 'workload'" class="p-6 overflow-x-auto">
          <div class="mb-4">
            <h3 class="text-sm font-bold text-gray-900">Rekap Beban Menguji Dosen (Periode Ini)</h3>
            <p class="text-xs text-gray-500 mt-0.5">Memastikan tidak ada dosen yang melebihi kuota 10 TA per periode dan 2 TA per hari.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="w in scheduleResult.examinerWorkload" 
              :key="w.nama"
              class="p-4 bg-white border border-gray-200 rounded shadow-sm flex flex-col justify-between"
            >
              <div>
                <div class="flex items-start justify-between gap-2 mb-2">
                  <span class="font-bold text-xs text-gray-900 line-clamp-1" :title="w.nama">{{ w.nama }}</span>
                  <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded shrink-0" :class="w.total >= w.maxPeriod ? 'bg-amber-100 text-amber-800' : 'bg-teal-50 text-teal-700'">
                    {{ w.total }} / {{ w.maxPeriod }} TA
                  </span>
                </div>

                <!-- Progress bar -->
                <div class="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div 
                    class="h-1.5 rounded-full transition-all" 
                    :class="w.total >= w.maxPeriod ? 'bg-amber-500' : 'bg-teal-600'"
                    :style="{ width: `${w.percentage}%` }"
                  ></div>
                </div>

                <!-- Daily Breakdown -->
                <div class="text-[10px] font-mono text-gray-500 space-y-1">
                  <div v-for="(cnt, d) in w.perDay" :key="d" class="flex justify-between">
                    <span>{{ formatIndoDate(d) }}:</span>
                    <span class="font-bold" :class="cnt >= 2 ? 'text-teal-800' : 'text-gray-700'">{{ cnt }} TA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
