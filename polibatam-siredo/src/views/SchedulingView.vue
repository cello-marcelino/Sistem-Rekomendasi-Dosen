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

// Ruangan Configuration State (Setting Manual)
const customRooms = ref([...DEFAULT_ROOMS])
const newRoomInput = ref('')
const roomError = ref('')

const addRoom = () => {
  const roomName = newRoomInput.value.trim()
  if (!roomName) return
  if (customRooms.value.some(r => r.toLowerCase() === roomName.toLowerCase())) {
    roomError.value = `Ruangan "${roomName}" sudah ada dalam daftar.`
    return
  }
  customRooms.value.push(roomName)
  newRoomInput.value = ''
  roomError.value = ''
}

const removeRoom = (index) => {
  if (customRooms.value.length <= 1) {
    roomError.value = 'Minimal harus ada 1 ruangan sidang.'
    return
  }
  customRooms.value.splice(index, 1)
  roomError.value = ''
}

const resetRooms = () => {
  customRooms.value = [...DEFAULT_ROOMS]
  roomError.value = ''
}

// Search & Filter State
const searchQuery = ref('')
const selectedRoomFilter = ref('')
const selectedDateFilter = ref('')
const selectedExaminerFilter = ref('')

// Result State
const scheduleResult = ref(null)

// All available rooms (from customRooms + any in scheduled results)
const allRoomsList = computed(() => {
  const set = new Set(customRooms.value)
  if (scheduleResult.value?.scheduled) {
    scheduleResult.value.scheduled.forEach(row => {
      if (row.ruangan) set.add(row.ruangan)
    })
  }
  return Array.from(set)
})

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

  if (customRooms.value.length === 0) {
    error.value = "Tentukan minimal 1 ruangan sidang terlebih dahulu."
    return
  }

  step.value = 2
  loading.value = true
  error.value = null

  try {
    // 1. Baca isi file Excel di frontend menggunakan library XLSX
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const jsonRows = XLSX.utils.sheet_to_json(worksheet)

    if (!jsonRows || jsonRows.length === 0) {
      throw new Error("File Excel kosong atau tidak memiliki data baris.")
    }

    // Cek apakah file sudah memiliki kolom hasil rekomendasi (seperti file Hasil_Batch_Rekomendasi.xlsx)
    const firstRowKeys = Object.keys(jsonRows[0]).map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''))
    const hasExistingRecommendations = firstRowKeys.some(k => k.startsWith('rekomendasi'))

    let proposalsToSchedule = []

    if (hasExistingRecommendations) {
      // Langsung gunakan data rekomendasi yang ada di dalam berkas Excel
      proposalsToSchedule = jsonRows.map((row, index) => {
        const keys = Object.keys(row)
        const idKey = keys.find(k => ['id', 'nim', 'no'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
        const namaKey = keys.find(k => ['nama', 'namamahasiswa', 'mahasiswa', 'name'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
        const judulKey = keys.find(k => ['judul', 'judultugasakhir', 'judulta', 'title', 'topik'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))

        return {
          ...row,
          id: idKey && row[idKey] ? row[idKey] : (index + 1),
          nama: namaKey && row[namaKey] ? row[namaKey] : `Mahasiswa #${index + 1}`,
          judul: judulKey && row[judulKey] ? row[judulKey] : 'Topik Tugas Akhir'
        }
      })
    } else {
      // Jika file masih berupa proposal mentah tanpa rekomendasi, kirim ke backend API untuk scoring batch
      const formData = new FormData()
      formData.append('file', file)
      formData.append('top_k', 8) // Ambil 8 kandidat teratas untuk fleksibilitas constraint

      const response = await api.post('/rekomendasi/batch/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const rawData = response.data?.data
      proposalsToSchedule = Array.isArray(rawData) ? rawData : (rawData?.results || [])
    }

    if (proposalsToSchedule.length === 0) {
      throw new Error("Tidak ada data proposal yang valid ditemukan dalam file Excel.")
    }

    // 2. Jalankan algoritma penjadwalan cerdas berbasis kuota & ruangan kustom
    const result = scheduleDefenses(proposalsToSchedule, {
      periodId: activePeriod.value.id,
      startDate: activePeriod.value.startDate,
      endDate: activePeriod.value.endDate,
      sessions: DEFAULT_SESSIONS,
      rooms: customRooms.value,
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
        <div class="text-2xl font-mono font-bold text-gray-900 tabular-nums">4 Sesi × {{ customRooms.length }} Ruang</div>
        <div class="text-[11px] text-gray-500 mt-1">{{ 4 * customRooms.length }} Slot Sidang per Hari</div>
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

        <!-- 2. Pengaturan Ruangan Sidang (Manual / Fleksibel) -->
        <div class="bg-gray-50/70 border border-gray-200 rounded p-5 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 class="text-sm font-mono font-bold text-gray-900 uppercase tracking-wider">2. Pengaturan Ruangan Sidang (Setting Manual)</h2>
              <p class="text-xs text-gray-600 mt-0.5">Tentukan ruangan sidang yang tersedia. Anda dapat menambah ruangan baru atau menghapus ruangan.</p>
            </div>
            <button 
              @click="resetRooms" 
              type="button"
              class="text-xs font-mono font-semibold text-teal-700 hover:text-teal-800 underline self-start sm:self-auto"
            >
              Reset ke Default
            </button>
          </div>

          <!-- Chip list of active rooms -->
          <div class="flex flex-wrap items-center gap-2">
            <div 
              v-for="(room, idx) in customRooms" 
              :key="room" 
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-teal-200 rounded text-xs font-mono font-bold text-teal-900 shadow-xs group"
            >
              <span>{{ room }}</span>
              <button 
                @click="removeRoom(idx)" 
                type="button" 
                title="Hapus ruangan" 
                class="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                &times;
              </button>
            </div>
          </div>

          <!-- Add new room input -->
          <div class="flex items-center gap-2 max-w-md pt-1">
            <input 
              v-model="newRoomInput" 
              @keyup.enter="addRoom"
              type="text" 
              placeholder="Tambah ruang baru (contoh: R. PBL 104, Lab AI)..." 
              class="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs focus:border-teal-500 focus:outline-none bg-white font-sans" 
            />
            <button 
              @click="addRoom" 
              type="button"
              class="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              + Tambah Ruangan
            </button>
          </div>

          <div v-if="roomError" class="text-xs text-red-600 font-medium">
            {{ roomError }}
          </div>

          <div class="text-[11px] font-mono text-gray-500 flex flex-wrap items-center gap-3 pt-1 border-t border-gray-200/60">
            <span>Kapasitas Harian: <strong>{{ 4 * customRooms.length }} Slot</strong> (4 Sesi × {{ customRooms.length }} Ruangan)</span>
            <span>•</span>
            <span>Total Kapasitas Periode: <strong>{{ 4 * customRooms.length * 5 }} Slot</strong> (5 Hari)</span>
          </div>
        </div>

        <!-- 3. File Upload Box -->
        <div>
          <h2 class="text-sm font-mono font-bold text-gray-900 uppercase tracking-wider mb-3">3. Unggah Berkas Peserta Sidang (.xlsx)</h2>
          <div 
            @click="triggerUpload"
            class="border-2 border-dashed border-gray-300 bg-gray-50 rounded p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all text-center group"
          >
            <svg class="w-10 h-10 text-gray-400 group-hover:text-teal-600 transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="text-sm font-bold text-gray-900 mb-1">{{ fileName || 'Klik untuk memilih file Excel peserta sidang' }}</div>
            <div class="text-xs text-gray-500">Format file: File hasil batch rekomendasi atau daftar proposal mahasiswa</div>
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
          Mengevaluasi kecocokan topik dengan kepakaran dosen, membatasi kuota harian (max 2 TA) & kuota periode (max 10 TA), serta menempatkan ruangan sidang yang telah diatur.
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

            <select v-model="selectedDateFilter" class="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:border-teal-500 focus:outline-none bg-white font-mono">
              <option value="">Semua Tanggal</option>
              <option v-for="d in scheduleResult.period.workingDays" :key="d" :value="d">{{ formatIndoDate(d) }}</option>
            </select>

            <select v-model="selectedRoomFilter" class="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:border-teal-500 focus:outline-none bg-white font-mono">
              <option value="">Semua Ruang</option>
              <option v-for="r in allRoomsList" :key="r" :value="r">{{ r }}</option>
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

        <!-- Warning banner if any unassigned -->
        <div v-if="scheduleResult.totalUnassigned > 0" class="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900">
          <div class="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {{ scheduleResult.totalUnassigned }} Mahasiswa Belum Terjadwal
          </div>
          <ul class="list-disc list-inside space-y-0.5 text-amber-700 pl-1">
            <li v-for="u in scheduleResult.unassigned" :key="u.mahasiswa_id">
              <strong>{{ u.nama_mahasiswa }} ({{ u.mahasiswa_id }}):</strong> {{ u.reason }}
            </li>
          </ul>
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
                <th class="p-3.5 border-b border-gray-200">Ruangan (Manual Edit)</th>
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
                  <select 
                    v-model="row.ruangan" 
                    class="px-2.5 py-1 font-mono text-[11px] font-bold text-teal-800 bg-teal-50/80 border border-teal-200 rounded hover:border-teal-400 focus:border-teal-600 focus:outline-none cursor-pointer transition-colors"
                    title="Ubah ruangan sidang untuk jadwal ini"
                  >
                    <option v-for="r in allRoomsList" :key="r" :value="r">{{ r }}</option>
                  </select>
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
