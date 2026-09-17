<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import * as XLSX from 'xlsx'
import { PERIOD_PRESETS, DEFAULT_SESSIONS, DEFAULT_ROOMS, scheduleDefenses, formatIndoDate } from '../services/scheduler'

// State
const fileInput = ref(null)
const loading = ref(false)
const error = ref(null)
const fileName = ref('')
const fileSize = ref('')
const isDragging = ref(false)
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
    roomError.value = 'Minimal harus ada 1 ruangan sidang aktif.'
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

// Master Dosen List from DB/API
const masterDosenList = ref([])
const fetchMasterDosen = async () => {
  try {
    const res = await api.get('/dosen')
    if (res.data?.data) {
      masterDosenList.value = res.data.data.map(d => d.nama).filter(Boolean)
    }
  } catch (e) {
    console.warn('Failed to fetch master dosen list, using local data', e)
  }
}

onMounted(() => {
  fetchMasterDosen()
})

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

// All available examiners list (master + results)
const allAvailableExaminers = computed(() => {
  const set = new Set(masterDosenList.value)
  if (scheduleResult.value?.allExaminers) {
    scheduleResult.value.allExaminers.forEach(name => set.add(name))
  }
  if (scheduleResult.value?.scheduled) {
    scheduleResult.value.scheduled.forEach(row => {
      if (row.penguji_1) set.add(row.penguji_1)
      if (row.penguji_2) set.add(row.penguji_2)
      if (row.candidates) row.candidates.forEach(c => set.add(c.nama))
    })
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})

// Helper to get candidate info for a specific dosen on a row
const getCandidateInfo = (row, dosenName) => {
  if (!row?.candidates || !dosenName) return null
  return row.candidates.find(c => c.nama.toLowerCase().trim() === dosenName.toLowerCase().trim()) || null
}

// Helper to get all lecturers not in the top recommendation list for a student
const getNonCandidateDosens = (row) => {
  if (!row?.candidates) return allAvailableExaminers.value
  const candidateNames = new Set(row.candidates.map(c => c.nama.toLowerCase().trim()))
  return allAvailableExaminers.value.filter(name => !candidateNames.has(name.toLowerCase().trim()))
}

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

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  fileName.value = file.name
  fileSize.value = formatBytes(file.size)
  error.value = null
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
    fileInput.value.files = e.dataTransfer.files
    fileName.value = file.name
    fileSize.value = formatBytes(file.size)
    error.value = null
  } else {
    error.value = "Silakan unggah file dengan format Excel (.xlsx atau .xls)"
  }
}

const clearFile = () => {
  fileName.value = ''
  fileSize.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const resetAll = () => {
  step.value = 1
  scheduleResult.value = null
  clearFile()
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
      throw new Error("File Excel kosong atau tidak memiliki baris data.")
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
      String(row.mahasiswa_id).toLowerCase().includes(q) ||
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

// Real-Time Recalculated Examiner Workload (Responds to inline examiner changes)
const currentWorkload = computed(() => {
  if (!scheduleResult.value?.scheduled || !scheduleResult.value?.period) return []

  const workingDays = scheduleResult.value.period.workingDays || []
  const periodCount = {}
  const dailyCount = {}
  workingDays.forEach(d => { dailyCount[d] = {} })

  scheduleResult.value.scheduled.forEach(row => {
    const date = row.tanggal
    const p1 = row.penguji_1
    const p2 = row.penguji_2

    if (p1) {
      periodCount[p1] = (periodCount[p1] || 0) + 1
      if (dailyCount[date]) dailyCount[date][p1] = (dailyCount[date][p1] || 0) + 1
    }
    if (p2) {
      periodCount[p2] = (periodCount[p2] || 0) + 1
      if (dailyCount[date]) dailyCount[date][p2] = (dailyCount[date][p2] || 0) + 1
    }
  })

  const allNames = new Set([
    ...Object.keys(periodCount),
    ...(scheduleResult.value.examinerWorkload || []).map(w => w.nama)
  ])

  return Array.from(allNames).map(nama => {
    const total = periodCount[nama] || 0
    const perDay = {}
    workingDays.forEach(d => {
      perDay[d] = dailyCount[d]?.[nama] || 0
    })

    return {
      nama,
      total,
      maxPeriod: maxPerPeriod.value,
      percentage: Math.min(100, Math.round((total / maxPerPeriod.value) * 100)),
      perDay
    }
  }).sort((a, b) => b.total - a.total)
})

// Unique Examiners list for filter dropdown
const uniqueExaminers = computed(() => {
  return currentWorkload.value.map(e => e.nama)
})

// Reset Filters
const resetFilters = () => {
  searchQuery.value = ''
  selectedDateFilter.value = ''
  selectedRoomFilter.value = ''
  selectedExaminerFilter.value = ''
}

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || selectedDateFilter.value || selectedRoomFilter.value || selectedExaminerFilter.value)
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

  const dataWorkload = currentWorkload.value.map((w, idx) => ({
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
  <div class="space-y-6 pb-12 animate-in font-sans">
    <!-- Header Hero Section -->
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-mono font-semibold mb-2">
          <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          Modul Penjadwalan Sidang TA Cerdas
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Penjadwalan Otomatis Sidang TA
        </h1>
        <p class="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
          Alokasi jadwal sidang, penempatan ruangan, dan 2 dosen penguji bebas bentrok berbasis kecocokan topik NLP serta batas kuota harian & periode.
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <button 
          v-if="step === 3" 
          @click="resetAll" 
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-xs"
        >
          <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Jadwal Ulang Baru
        </button>

        <button 
          @click="downloadTemplate" 
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-xs group"
        >
          <svg class="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Unduh Template Excel
        </button>
      </div>
    </div>

    <!-- KPI & Constraint Indicators -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest">Maks. Uji Harian</span>
          <span class="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
        </div>
        <div>
          <div class="text-2xl font-bold font-mono text-gray-900 tabular-nums">{{ maxPerDay }} Judul / Hari</div>
          <p class="text-[11px] text-gray-500 mt-1">Batas beban 1 dosen per tanggal</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest">Maks. Uji Periode</span>
          <span class="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </span>
        </div>
        <div>
          <div class="text-2xl font-bold font-mono text-teal-800 tabular-nums">{{ maxPerPeriod }} Judul / Periode</div>
          <p class="text-[11px] text-gray-500 mt-1">Reset kuota pada periode berikutnya</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest">Kapasitas Sesi</span>
          <span class="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </span>
        </div>
        <div>
          <div class="text-2xl font-bold font-mono text-gray-900 tabular-nums">4 Sesi × {{ customRooms.length }} Ruang</div>
          <p class="text-[11px] text-gray-500 mt-1">{{ 4 * customRooms.length }} Slot Sidang per Hari</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest">Integritas Jadwal</span>
          <span class="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </span>
        </div>
        <div>
          <div class="text-2xl font-bold font-mono text-teal-700 tabular-nums">Bebas Bentrok</div>
          <p class="text-[11px] text-gray-500 mt-1">Penguji 1 ≠ Penguji 2 & Ruang Unik</p>
        </div>
      </div>
    </div>

    <!-- Stepper Navigation Header -->
    <div class="bg-white border border-gray-200/90 rounded-xl shadow-xs overflow-hidden">
      <div class="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 bg-gray-50/50">
        <button 
          @click="step = 1" 
          type="button"
          class="p-4 flex items-center gap-3 transition-all text-left" 
          :class="step === 1 ? 'bg-white font-bold text-teal-800 shadow-xs ring-1 ring-inset ring-teal-500/20' : 'text-gray-500 hover:bg-gray-100/70'"
        >
          <span 
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors" 
            :class="step === 1 ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-600'"
          >
            1
          </span>
          <div>
            <div class="text-xs font-mono font-bold uppercase tracking-wider">Langkah 1</div>
            <div class="text-xs text-gray-700 font-semibold mt-0.5">Konfigurasi & Berkas</div>
          </div>
        </button>

        <div 
          class="p-4 flex items-center gap-3 text-left transition-all" 
          :class="step === 2 ? 'bg-white font-bold text-teal-800 shadow-xs ring-1 ring-inset ring-teal-500/20' : 'text-gray-400'"
        >
          <span 
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors" 
            :class="step === 2 ? 'bg-teal-700 text-white animate-pulse' : 'bg-gray-200 text-gray-400'"
          >
            2
          </span>
          <div>
            <div class="text-xs font-mono font-bold uppercase tracking-wider">Langkah 2</div>
            <div class="text-xs font-semibold mt-0.5" :class="step === 2 ? 'text-teal-900' : 'text-gray-400'">Alokasi Cerdas & NLP</div>
          </div>
        </div>

        <button 
          :disabled="!scheduleResult"
          @click="scheduleResult && (step = 3)" 
          type="button"
          class="p-4 flex items-center gap-3 transition-all text-left disabled:cursor-not-allowed disabled:opacity-60" 
          :class="step === 3 ? 'bg-white font-bold text-teal-800 shadow-xs ring-1 ring-inset ring-teal-500/20' : 'text-gray-500 hover:bg-gray-100/70'"
        >
          <span 
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors" 
            :class="step === 3 ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-600'"
          >
            3
          </span>
          <div>
            <div class="text-xs font-mono font-bold uppercase tracking-wider">Langkah 3</div>
            <div class="text-xs text-gray-700 font-semibold mt-0.5">Jadwal Sidang Final</div>
          </div>
        </button>
      </div>

      <!-- Step 1: Configuration & File Upload -->
      <div v-if="step === 1" class="p-6 md:p-8 space-y-8">
        <!-- 1. Periode Sidang Selection -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-mono font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-teal-600"></span>
              1. Pilih Periode Pelaksanaan Sidang
            </h2>
            <span class="text-xs text-gray-500 font-mono">5 Hari Kerja per Periode</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="preset in PERIOD_PRESETS" 
              :key="preset.id"
              @click="handlePresetChange(preset.id)"
              class="p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between group hover:shadow-xs"
              :class="selectedPreset === preset.id && !isCustomDate ? 'border-teal-600 bg-teal-50/40 shadow-xs ring-1 ring-teal-500/30' : 'border-gray-200 bg-white hover:border-gray-300'"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors" :class="selectedPreset === preset.id && !isCustomDate ? 'border-teal-600 bg-teal-600' : 'border-gray-300 bg-white'">
                    <span v-if="selectedPreset === preset.id && !isCustomDate" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </span>
                  <span class="font-bold text-sm text-gray-900 group-hover:text-teal-800 transition-colors">{{ preset.name }}</span>
                </div>
                <span v-if="selectedPreset === preset.id && !isCustomDate" class="text-[11px] font-mono font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full border border-teal-300/60">
                  Terpilih
                </span>
              </div>
              <p class="text-xs text-gray-600 pl-6 mb-3 leading-relaxed">{{ preset.description }}</p>
              <div class="text-[11px] font-mono text-gray-500 pl-6 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Senin – Jumat (4 Sesi / Hari)
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Pengaturan Ruangan Sidang (Manual / Fleksibel) -->
        <div class="bg-slate-50/70 border border-gray-200/90 rounded-xl p-5 sm:p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 class="text-sm font-mono font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-teal-600"></span>
                2. Pengaturan Ruangan Sidang (Setting Manual)
              </h2>
              <p class="text-xs text-gray-600 mt-0.5">Tentukan ruangan sidang yang aktif. Anda dapat menambah ruangan baru atau menghapus ruangan.</p>
            </div>
            <button 
              @click="resetRooms" 
              type="button"
              class="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-teal-700 hover:text-teal-900 underline self-start sm:self-auto cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Reset ke Default
            </button>
          </div>

          <!-- Chip list of active rooms -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <div 
              v-for="(room, idx) in customRooms" 
              :key="room" 
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-mono font-bold text-teal-900 shadow-2xs group hover:border-teal-400 transition-all"
            >
              <svg class="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <span>{{ room }}</span>
              <button 
                @click="removeRoom(idx)" 
                type="button" 
                title="Hapus ruangan" 
                class="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>
          </div>

          <!-- Add new room input -->
          <div class="flex items-center gap-2 max-w-md pt-1">
            <div class="relative flex-1">
              <input 
                v-model="newRoomInput" 
                @keyup.enter="addRoom"
                type="text" 
                placeholder="Tambah ruang baru (contoh: R. PBL 104, Lab AI)..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white font-sans shadow-2xs transition-all" 
              />
            </div>
            <button 
              @click="addRoom" 
              type="button"
              class="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0 inline-flex items-center gap-1 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Tambah
            </button>
          </div>

          <div v-if="roomError" class="text-xs text-red-600 font-medium flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            {{ roomError }}
          </div>

          <div class="text-[11px] font-mono text-gray-500 flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200/70">
            <span>Kapasitas Harian: <strong class="text-gray-900">{{ 4 * customRooms.length }} Slot</strong> (4 Sesi × {{ customRooms.length }} Ruangan)</span>
            <span>•</span>
            <span>Total Kapasitas Periode: <strong class="text-teal-800">{{ 4 * customRooms.length * 5 }} Slot</strong> (5 Hari)</span>
          </div>
        </div>

        <!-- 3. File Upload Box -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-mono font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-teal-600"></span>
              3. Unggah Berkas Peserta Sidang (.xlsx)
            </h2>
            <span class="text-xs text-gray-500">Mendukung berkas Excel batch rekomendasi</span>
          </div>

          <div 
            @click="triggerUpload"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            class="border-2 border-dashed rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
            :class="isDragging ? 'border-teal-600 bg-teal-50/50' : 'border-gray-300 bg-slate-50/50 hover:border-teal-500 hover:bg-teal-50/20'"
          >
            <div class="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-teal-100 transition-all shadow-xs">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div v-if="!fileName">
              <div class="text-sm font-bold text-gray-900 mb-1">
                Tarik & letakkan berkas Excel di sini, atau <span class="text-teal-700 underline">pilih dari komputer</span>
              </div>
              <p class="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Gunakan hasil berkas <strong>Hasil_Batch_Rekomendasi.xlsx</strong> atau template berkas proposal mahasiswa.
              </p>
            </div>

            <div v-else class="flex items-center gap-3 bg-white px-4 py-2.5 rounded-lg border border-teal-300 shadow-xs">
              <span class="text-xs font-mono font-bold text-teal-900">{{ fileName }}</span>
              <span v-if="fileSize" class="text-[10px] font-mono text-gray-500">({{ fileSize }})</span>
              <button 
                @click.stop="clearFile" 
                type="button" 
                class="text-gray-400 hover:text-red-600 text-xs p-1"
                title="Hapus berkas terpilih"
              >
                &times;
              </button>
            </div>

            <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileChange">
          </div>

          <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
            <svg class="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            <span><strong>Perhatian:</strong> {{ error }}</span>
          </div>

          <div class="pt-4 flex items-center justify-between">
            <div class="text-xs text-gray-500 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Format didukung: <code>.xlsx</code>, <code>.xls</code>
            </div>

            <button 
              @click="processScheduling" 
              :disabled="!fileName || loading"
              type="button"
              class="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm inline-flex items-center gap-2 cursor-pointer hover:shadow-md active:scale-98"
            >
              <span>Jalankan Penjadwalan Otomatis</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Processing Spinner -->
      <div v-if="step === 2" class="p-16 sm:p-20 flex flex-col items-center justify-center text-center space-y-4">
        <div class="relative w-16 h-16">
          <div class="w-16 h-16 border-4 border-teal-100 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-1">Menyusun Jadwal Sidang Bebas Bentrok...</h3>
          <p class="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Mengevaluasi kepakaran dosen, membatasi kuota harian (max 2 TA) & kuota periode (max 10 TA), serta menempatkan ruangan sidang yang telah diatur.
          </p>
        </div>
        <div class="flex items-center gap-4 text-[11px] font-mono text-teal-800 bg-teal-50/80 px-4 py-2 rounded-full border border-teal-200">
          <span>✓ Evaluasi NLP</span>
          <span>•</span>
          <span>✓ Validasi Kuota</span>
          <span>•</span>
          <span>✓ Alokasi Ruang</span>
        </div>
      </div>

      <!-- Step 3: Result Workspace -->
      <div v-if="step === 3 && scheduleResult" class="flex flex-col h-full">
        <!-- Sub-Navigation Tabs & Actions -->
        <div class="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70 flex flex-wrap gap-4 items-center justify-between">
          <!-- View Tabs -->
          <div class="flex items-center gap-1.5 bg-gray-200/80 p-1 rounded-lg">
            <button 
              @click="activeTab = 'table'" 
              type="button"
              class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer inline-flex items-center gap-1.5"
              :class="activeTab === 'table' ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Tabel Jadwal ({{ filteredSchedule.length }})
            </button>
            <button 
              @click="activeTab = 'workload'" 
              type="button"
              class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer inline-flex items-center gap-1.5"
              :class="activeTab === 'workload' ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Beban Penguji ({{ currentWorkload.length }})
            </button>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Search Query -->
            <div class="relative">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Cari NIM, Nama, Penguji..." 
                class="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none w-48 sm:w-56 bg-white shadow-2xs" 
              />
              <svg class="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <!-- Date Filter -->
            <select v-model="selectedDateFilter" class="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:border-teal-500 focus:outline-none bg-white font-mono shadow-2xs">
              <option value="">Semua Tanggal</option>
              <option v-for="d in scheduleResult.period.workingDays" :key="d" :value="d">{{ formatIndoDate(d) }}</option>
            </select>

            <!-- Room Filter -->
            <select v-model="selectedRoomFilter" class="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:border-teal-500 focus:outline-none bg-white font-mono shadow-2xs">
              <option value="">Semua Ruang</option>
              <option v-for="r in allRoomsList" :key="r" :value="r">{{ r }}</option>
            </select>

            <!-- Examiner Filter -->
            <select v-model="selectedExaminerFilter" class="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:border-teal-500 focus:outline-none bg-white max-w-[150px] shadow-2xs">
              <option value="">Semua Dosen</option>
              <option v-for="ex in uniqueExaminers" :key="ex" :value="ex">{{ ex }}</option>
            </select>

            <!-- Clear Filter Button -->
            <button 
              v-if="hasActiveFilters" 
              @click="resetFilters" 
              type="button" 
              title="Reset Filter"
              class="px-2 py-1.5 text-xs text-gray-500 hover:text-red-600 bg-white border border-gray-300 rounded-lg hover:border-red-300 transition-colors shadow-2xs"
            >
              Reset Filter
            </button>

            <!-- Export Button -->
            <button 
              @click="downloadSchedule" 
              type="button"
              class="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md active:scale-98"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Ekspor Excel
            </button>
          </div>
        </div>

        <!-- Summary Banner -->
        <div class="px-6 py-3.5 bg-teal-50/80 border-b border-teal-200/70 flex flex-wrap items-center justify-between gap-2 text-xs text-teal-900 font-mono">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-teal-600"></span>
            <span><strong>Periode:</strong> {{ activePeriod.name }} ({{ formatIndoDate(activePeriod.startDate) }} s.d. {{ formatIndoDate(activePeriod.endDate) }})</span>
          </div>
          <div class="flex items-center gap-4">
            <span><strong>Terjadwal:</strong> {{ scheduleResult.totalScheduled }} / {{ scheduleResult.totalRequested }} Mahasiswa</span>
            <span>•</span>
            <span><strong>Ruangan:</strong> {{ allRoomsList.length }} Ruang</span>
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
            <thead class="bg-gray-50/90 border-b border-gray-200 font-mono text-[10px] uppercase tracking-widest text-gray-500 sticky top-0 backdrop-blur-xs">
              <tr>
                <th class="p-3.5 border-b border-gray-200">No</th>
                <th class="p-3.5 border-b border-gray-200">Mahasiswa</th>
                <th class="p-3.5 border-b border-gray-200">Topik Tugas Akhir</th>
                <th class="p-3.5 border-b border-gray-200 min-w-[230px]">Penguji 1 (Bisa Diganti)</th>
                <th class="p-3.5 border-b border-gray-200 min-w-[230px]">Penguji 2 (Bisa Diganti)</th>
                <th class="p-3.5 border-b border-gray-200">Jadwal & Waktu</th>
                <th class="p-3.5 border-b border-gray-200">Ruangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200/90 bg-white">
              <tr v-for="(row, idx) in filteredSchedule" :key="row.id || idx" class="hover:bg-teal-50/30 transition-colors group">
                <td class="p-3.5 font-mono text-gray-500 align-top">
                  <span class="w-6 h-6 rounded-md bg-gray-100 group-hover:bg-teal-100 group-hover:text-teal-900 flex items-center justify-center font-bold text-[11px] transition-colors">
                    {{ idx + 1 }}
                  </span>
                </td>
                <td class="p-3.5 align-top">
                  <div class="font-bold text-gray-900 text-xs">{{ row.nama_mahasiswa }}</div>
                  <div class="font-mono text-[11px] text-gray-500 mt-0.5">{{ row.mahasiswa_id }}</div>
                </td>
                <td class="p-3.5 text-gray-700 max-w-sm align-top">
                  <div class="line-clamp-2 leading-relaxed font-medium" :title="row.judul_tugas_akhir">{{ row.judul_tugas_akhir }}</div>
                  <div v-if="row.pembimbing && row.pembimbing !== '-'" class="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    <span class="text-gray-400">Pembimbing:</span>
                    <span class="font-semibold text-gray-700">{{ row.pembimbing }}</span>
                  </div>
                </td>
                
                <!-- Penguji 1: Editable Dropdown with Recommendations & Scores -->
                <td class="p-3.5 align-top">
                  <div class="space-y-1 max-w-[240px]">
                    <select 
                      v-model="row.penguji_1" 
                      class="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border rounded-lg focus:ring-1 focus:outline-none transition-colors cursor-pointer shadow-2xs"
                      :class="row.penguji_1 === row.penguji_2 ? 'border-red-400 bg-red-50/50 text-red-900 focus:ring-red-400' : 'border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400'"
                      title="Pilih Dosen Penguji 1"
                    >
                      <optgroup label="🌟 Rekomendasi Topik TA">
                        <option 
                          v-for="cand in (row.candidates || [])" 
                          :key="cand.nama" 
                          :value="cand.nama"
                        >
                          #{{ cand.rank }}: {{ cand.nama }} ({{ Math.round((cand.score || 0) * 100) }}% Cocok)
                        </option>
                      </optgroup>
                      <optgroup v-if="getNonCandidateDosens(row).length > 0" label="📋 Dosen Lainnya (Pilihan Manual)">
                        <option 
                          v-for="dName in getNonCandidateDosens(row)" 
                          :key="dName" 
                          :value="dName"
                        >
                          {{ dName }}
                        </option>
                      </optgroup>
                    </select>

                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span 
                        v-if="getCandidateInfo(row, row.penguji_1)" 
                        class="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        Rank #{{ getCandidateInfo(row, row.penguji_1).rank }} ({{ Math.round((getCandidateInfo(row, row.penguji_1).score || 0) * 100) }}% Cocok)
                      </span>
                      <span 
                        v-else 
                        class="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pilihan Manual
                      </span>
                    </div>

                    <div v-if="row.penguji_1 === row.penguji_2" class="text-[10px] font-semibold text-red-600 flex items-center gap-1 pt-0.5">
                      <svg class="w-3 h-3 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                      Penguji 1 & 2 tidak boleh sama
                    </div>
                  </div>
                </td>

                <!-- Penguji 2: Editable Dropdown with Recommendations & Scores -->
                <td class="p-3.5 align-top">
                  <div class="space-y-1 max-w-[240px]">
                    <select 
                      v-model="row.penguji_2" 
                      class="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border rounded-lg focus:ring-1 focus:outline-none transition-colors cursor-pointer shadow-2xs"
                      :class="row.penguji_1 === row.penguji_2 ? 'border-red-400 bg-red-50/50 text-red-900 focus:ring-red-400' : 'border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500 hover:border-gray-400'"
                      title="Pilih Dosen Penguji 2"
                    >
                      <optgroup label="🌟 Rekomendasi Topik TA">
                        <option 
                          v-for="cand in (row.candidates || [])" 
                          :key="cand.nama" 
                          :value="cand.nama"
                        >
                          #{{ cand.rank }}: {{ cand.nama }} ({{ Math.round((cand.score || 0) * 100) }}% Cocok)
                        </option>
                      </optgroup>
                      <optgroup v-if="getNonCandidateDosens(row).length > 0" label="📋 Dosen Lainnya (Pilihan Manual)">
                        <option 
                          v-for="dName in getNonCandidateDosens(row)" 
                          :key="dName" 
                          :value="dName"
                        >
                          {{ dName }}
                        </option>
                      </optgroup>
                    </select>

                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span 
                        v-if="getCandidateInfo(row, row.penguji_2)" 
                        class="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        Rank #{{ getCandidateInfo(row, row.penguji_2).rank }} ({{ Math.round((getCandidateInfo(row, row.penguji_2).score || 0) * 100) }}% Cocok)
                      </span>
                      <span 
                        v-else 
                        class="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pilihan Manual
                      </span>
                    </div>

                    <div v-if="row.penguji_1 === row.penguji_2" class="text-[10px] font-semibold text-red-600 flex items-center gap-1 pt-0.5">
                      <svg class="w-3 h-3 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                      Penguji 1 & 2 tidak boleh sama
                    </div>
                  </div>
                </td>

                <td class="p-3.5 font-mono align-top whitespace-nowrap">
                  <div class="font-bold text-gray-900 text-xs">{{ row.tanggal_indo }}</div>
                  <div class="text-[11px] text-teal-800 font-semibold mt-0.5">{{ row.sesi_label }} ({{ row.waktu }})</div>
                </td>
                
                <td class="p-3.5 align-top whitespace-nowrap">
                  <select 
                    v-model="row.ruangan" 
                    class="px-2.5 py-1.5 font-mono text-[11px] font-bold text-teal-900 bg-teal-50/90 border border-teal-300 rounded-lg hover:border-teal-500 focus:border-teal-600 focus:outline-none cursor-pointer transition-colors shadow-2xs"
                    title="Ubah ruangan sidang untuk jadwal ini"
                  >
                    <option v-for="r in allRoomsList" :key="r" :value="r">{{ r }}</option>
                  </select>
                </td>
              </tr>
              <tr v-if="filteredSchedule.length === 0">
                <td colspan="7" class="p-12 text-center text-gray-500 text-xs font-mono">
                  <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Tidak ada jadwal yang sesuai dengan filter pencarian.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- View 2: Workload Dosen Tracker -->
        <div v-if="activeTab === 'workload'" class="p-6 sm:p-8 overflow-x-auto space-y-6">
          <div>
            <h3 class="text-sm font-bold text-gray-900">Rekap Beban Menguji Dosen (Periode Ini)</h3>
            <p class="text-xs text-gray-500 mt-0.5">Memastikan tidak ada dosen yang melebihi kuota 10 TA per periode dan 2 TA per hari.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="w in currentWorkload" 
              :key="w.nama"
              class="p-5 bg-white border border-gray-200/90 rounded-xl shadow-xs flex flex-col justify-between hover:shadow-sm hover:border-teal-300 transition-all"
            >
              <div>
                <div class="flex items-start justify-between gap-2 mb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center font-mono">
                      {{ w.nama.charAt(0) }}
                    </span>
                    <span class="font-bold text-xs text-gray-900 line-clamp-1" :title="w.nama">{{ w.nama }}</span>
                  </div>
                  <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0" :class="w.total >= w.maxPeriod ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-teal-50 text-teal-700 border border-teal-200'">
                    {{ w.total }} / {{ w.maxPeriod }} TA
                  </span>
                </div>

                <!-- Progress bar -->
                <div class="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                  <div 
                    class="h-2 rounded-full transition-all" 
                    :class="w.total >= w.maxPeriod ? 'bg-amber-500' : 'bg-teal-600'"
                    :style="{ width: `${w.percentage}%` }"
                  ></div>
                </div>

                <!-- Daily Breakdown -->
                <div class="text-[10px] font-mono text-gray-500 space-y-1.5 pt-2 border-t border-gray-100">
                  <div v-for="(cnt, d) in w.perDay" :key="d" class="flex justify-between items-center">
                    <span>{{ formatIndoDate(d) }}:</span>
                    <span class="font-bold px-1.5 py-0.5 rounded" :class="cnt >= 2 ? 'text-teal-900 bg-teal-50' : 'text-gray-700'">{{ cnt }} TA</span>
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
