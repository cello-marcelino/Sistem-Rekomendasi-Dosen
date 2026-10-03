<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  DEFAULT_PERIODS, 
  DEFAULT_SESSIONS, 
  DEFAULT_ROOMS, 
  scheduleDefenses, 
  formatIndoDate, 
  getWorkingDays 
} from '../services/scheduler'

// State
const fileInput = ref(null)
const loading = ref(false)
const error = ref(null)
const fileName = ref('')
const fileSize = ref('')
const isDragging = ref(false)
const step = ref(1) // 1: Konfigurasi & Upload, 2: Processing, 3: Hasil Jadwal
const activeTab = ref('table') // 'table' | 'workload'

// Pilihan Jenis Usulan Sidang (Sidang TA 1 atau Sidang TA 2)
const selectedJenisSidang = ref('Sidang TA2') // 'Sidang TA1' | 'Sidang TA2'

// Pengaturan Informasi Kop/Periode Laporan
const periodTitle = ref('Oktober 2026 (Periode September 2026)')
const academicYear = ref('Ganjil 2026-2027')
const showKopSettings = ref(false) // Toggle untuk membuka pengaturan lanjutan Kop Excel/PDF

// Daftar Periode (Bisa diubah, ditambah, atau dikurangi jumlah periodenya)
const periods = ref(JSON.parse(JSON.stringify(DEFAULT_PERIODS)))
const selectedPeriodId = ref('periode-1')

// Periode aktif
const activePeriod = computed(() => {
  return periods.value.find(p => p.id === selectedPeriodId.value) || periods.value[0] || {
    id: 'periode-1',
    name: 'Sidang Periode 1',
    startDate: '2026-10-05',
    endDate: '2026-10-09'
  }
})

// Hari kerja aktif untuk periode terpilih
const activeWorkingDays = computed(() => {
  if (!activePeriod.value?.startDate || !activePeriod.value?.endDate) return []
  try {
    return getWorkingDays(activePeriod.value.startDate, activePeriod.value.endDate)
  } catch {
    return []
  }
})

// Fungsi Tambah Periode Baru
const addPeriod = () => {
  const nextNum = periods.value.length + 1
  const newId = `periode-${Date.now()}`
  
  let nextStart = '2026-12-07'
  let nextEnd = '2026-12-11'
  if (periods.value.length > 0) {
    const lastP = periods.value[periods.value.length - 1]
    try {
      const d = new Date(lastP.endDate)
      d.setDate(d.getDate() + 28)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      nextStart = `${year}-${month}-07`
      nextEnd = `${year}-${month}-11`
    } catch {}
  }

  periods.value.push({
    id: newId,
    name: `Sidang Periode ${nextNum}`,
    title: `Periode Sidang ${nextNum}`,
    academicYear: academicYear.value,
    startDate: nextStart,
    endDate: nextEnd,
    description: `Pelaksanaan Sidang: Periode ${nextNum}`
  })
  selectedPeriodId.value = newId
}

// Fungsi Hapus Periode
const removePeriod = (id) => {
  if (periods.value.length <= 1) {
    error.value = 'Minimal harus ada 1 periode sidang aktif.'
    return
  }
  const idx = periods.value.findIndex(p => p.id === id)
  if (idx !== -1) {
    periods.value.splice(idx, 1)
    if (selectedPeriodId.value === id) {
      selectedPeriodId.value = periods.value[0].id
    }
  }
}

// Batas Beban Menguji Dosen
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
const selectedUsulanFilter = ref('')

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

  if (activeWorkingDays.value.length === 0) {
    error.value = "Periode sidang yang dipilih tidak memiliki hari kerja (Senin-Jumat). Silakan sesuaikan tanggal mulai dan selesai."
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

    // Cek apakah file sudah memiliki kolom hasil rekomendasi
    const firstRowKeys = Object.keys(jsonRows[0]).map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''))
    const hasExistingRecommendations = firstRowKeys.some(k => k.startsWith('rekomendasi'))

    let proposalsToSchedule = []

    if (hasExistingRecommendations) {
      proposalsToSchedule = jsonRows.map((row, index) => {
        const keys = Object.keys(row)
        const idKey = keys.find(k => ['id', 'nim', 'no', 'nomorinduk', 'nomor'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
        const namaKey = keys.find(k => ['nama', 'namamahasiswa', 'mahasiswa', 'name'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
        const judulKey = keys.find(k => ['judul', 'judultugasakhir', 'judulta', 'title', 'topik'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
        const pembimbingKey = keys.find(k => ['pembimbing', 'dosenpembimbing', 'pembimbing1', 'dosbing'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
        const waKey = keys.find(k => ['nowa', 'wa', 'nohp', 'hp', 'telepon', 'notelp', 'telp', 'phone', 'whatsapp', 'handphone'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
        const usulanKey = keys.find(k => ['jenisusulan', 'jenis_usulan', 'jenissidang', 'jenis_sidang', 'usulan', 'tipe'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))

        const noWa = (waKey && row[waKey] != null && String(row[waKey]).trim() !== '-') ? String(row[waKey]).trim() : (row.no_wa || '')
        const jenisUsulan = (usulanKey && row[usulanKey] && String(row[usulanKey]).trim() !== '-') ? String(row[usulanKey]).trim() : selectedJenisSidang.value

        return {
          ...row,
          id: idKey && row[idKey] ? row[idKey] : (row.id || index + 1),
          nama: namaKey && row[namaKey] ? row[namaKey] : (row.nama || `Mahasiswa #${index + 1}`),
          judul: judulKey && row[judulKey] ? row[judulKey] : (row.judul || 'Topik Tugas Akhir'),
          pembimbing: pembimbingKey && row[pembimbingKey] ? row[pembimbingKey] : (row.pembimbing || '-'),
          no_wa: noWa,
          jenis_usulan: jenisUsulan
        }
      })
    } else {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('top_k', 8)

      const response = await api.post('/rekomendasi/batch/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const rawData = response.data?.data
      const resultsFromApi = Array.isArray(rawData) ? rawData : (rawData?.results || [])

      proposalsToSchedule = resultsFromApi.map((p, idx) => {
        const origRow = jsonRows[idx] || {}
        const origKeys = Object.keys(origRow)
        const waKey = origKeys.find(k => ['nowa', 'wa', 'nohp', 'hp', 'telepon', 'notelp', 'telp', 'phone', 'whatsapp', 'handphone'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
        const usulanKey = origKeys.find(k => ['jenisusulan', 'jenis_usulan', 'jenissidang', 'jenis_sidang', 'usulan', 'tipe'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))

        return {
          ...p,
          no_wa: p.no_wa || (waKey && origRow[waKey] != null && String(origRow[waKey]).trim() !== '-' ? String(origRow[waKey]).trim() : ''),
          jenis_usulan: p.jenis_usulan || (usulanKey && origRow[usulanKey] && String(origRow[usulanKey]).trim() !== '-' ? String(origRow[usulanKey]).trim() : selectedJenisSidang.value)
        }
      })
    }

    if (proposalsToSchedule.length === 0) {
      throw new Error("Tidak ada data proposal yang valid ditemukan dalam file Excel.")
    }

    // 2. Jalankan algoritma penjadwalan cerdas
    const result = scheduleDefenses(proposalsToSchedule, {
      periodId: activePeriod.value.id,
      periodName: activePeriod.value.name,
      periodTitle: periodTitle.value || activePeriod.value.title,
      academicYear: academicYear.value,
      jenisSidang: selectedJenisSidang.value,
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
      (row.no_wa && row.no_wa.toLowerCase().includes(q)) ||
      (row.jenis_usulan && row.jenis_usulan.toLowerCase().includes(q)) ||
      row.penguji_1.toLowerCase().includes(q) ||
      row.penguji_2.toLowerCase().includes(q) ||
      row.judul_tugas_akhir.toLowerCase().includes(q)

    const matchRoom = !selectedRoomFilter.value || row.ruangan === selectedRoomFilter.value
    const matchDate = !selectedDateFilter.value || row.tanggal === selectedDateFilter.value
    const matchExaminer = !selectedExaminerFilter.value ||
      row.penguji_1 === selectedExaminerFilter.value ||
      row.penguji_2 === selectedExaminerFilter.value
    const matchUsulan = !selectedUsulanFilter.value || row.jenis_usulan === selectedUsulanFilter.value

    return matchQuery && matchRoom && matchDate && matchExaminer && matchUsulan
  })
})

// Real-Time Recalculated Examiner Workload
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
  selectedUsulanFilter.value = ''
}

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || selectedDateFilter.value || selectedRoomFilter.value || selectedExaminerFilter.value || selectedUsulanFilter.value)
})

// Download Schedule Excel
const downloadSchedule = () => {
  if (!scheduleResult.value?.scheduled) return

  const pTitle = periodTitle.value || activePeriod.value.title || 'Oktober 2026 (Periode September 2026)'
  const aYear = academicYear.value || 'Ganjil 2026-2027'

  const wsData = [
    [pTitle],
    [aYear],
    [],
    [
      'Hari dan Ruang Sidang',
      'Jam Sidang',
      'No',
      'Jenis Usulan',
      'NIM',
      'Nama Mahasiswa',
      'No WA',
      'Judul Tugas Akhir',
      'Penguji'
    ]
  ]

  scheduleResult.value.scheduled.forEach((row, idx) => {
    wsData.push([
      `${row.tanggal_indo} - ${row.ruangan}`,
      row.waktu,
      idx + 1,
      row.jenis_usulan || selectedJenisSidang.value,
      String(row.mahasiswa_id),
      row.nama_mahasiswa,
      row.no_wa || '',
      row.judul_tugas_akhir,
      `1. ${row.penguji_1}\n2. ${row.penguji_2}`
    ])
  })

  const ws1 = XLSX.utils.aoa_to_sheet(wsData)

  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }
  ]

  ws1['!cols'] = [
    { wch: 30 },
    { wch: 16 },
    { wch: 6 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 16 },
    { wch: 55 },
    { wch: 40 }
  ]

  const dataWorkload = currentWorkload.value.map((w, idx) => ({
    'No': idx + 1,
    'Nama Dosen': w.nama,
    'Total Menguji (Periode Ini)': w.total,
    'Batas Maksimal Periode': w.maxPeriod,
    'Persentase Beban': `${w.percentage}%`
  }))
  const ws2 = XLSX.utils.json_to_sheet(dataWorkload)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws1, "Jadwal Sidang TA")
  XLSX.utils.book_append_sheet(wb, ws2, "Rekap Beban Penguji")

  const safeFileName = `Jadwal_${selectedJenisSidang.value.replace(/\s+/g, '_')}_${activePeriod.value.name.replace(/\s+/g, '_')}.xlsx`
  XLSX.writeFile(wb, safeFileName)
}

// Download Schedule PDF (Landscape A4 dengan format resmi Polibatam)
const downloadPdfSchedule = () => {
  if (!scheduleResult.value?.scheduled) return

  const pTitle = periodTitle.value || activePeriod.value.title || 'Oktober 2026 (Periode September 2026)'
  const aYear = academicYear.value || 'Ganjil 2026-2027'

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  // Kop Header Judul (Center, Bold)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(pTitle, doc.internal.pageSize.getWidth() / 2, 11, { align: 'center' })

  doc.setFontSize(10.5)
  doc.text(aYear, doc.internal.pageSize.getWidth() / 2, 16.5, { align: 'center' })

  // Data rows
  const tableRows = scheduleResult.value.scheduled.map((row, idx) => [
    `${row.tanggal_indo}\n${row.ruangan}`,
    row.waktu,
    String(idx + 1),
    row.jenis_usulan || selectedJenisSidang.value,
    String(row.mahasiswa_id),
    row.nama_mahasiswa,
    row.no_wa || '',
    row.pembimbing && row.pembimbing !== '-' 
      ? `${row.judul_tugas_akhir}\n(Pembimbing: ${row.pembimbing})` 
      : row.judul_tugas_akhir,
    `1. ${row.penguji_1}\n2. ${row.penguji_2}`
  ])

  autoTable(doc, {
    startY: 20,
    margin: { top: 20, left: 10, right: 10, bottom: 12 },
    head: [[
      'Hari dan Ruang Sidang',
      'Jam Sidang',
      'No',
      'Jenis Usulan',
      'NIM',
      'Nama Mahasiswa',
      'No WA',
      'Judul Tugas Akhir',
      'Penguji'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      valign: 'top',
      overflow: 'linebreak',
      lineColor: [200, 200, 200],
      lineWidth: 0.15
    },
    headStyles: {
      fillColor: [243, 244, 246], // slate-100
      textColor: [30, 41, 59], // slate-800
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 32 }, // Hari dan Ruang Sidang
      1: { cellWidth: 23, halign: 'center' }, // Jam Sidang
      2: { cellWidth: 9, halign: 'center' }, // No
      3: { cellWidth: 20, halign: 'center' }, // Jenis Usulan
      4: { cellWidth: 22, halign: 'center' }, // NIM
      5: { cellWidth: 35 }, // Nama Mahasiswa
      6: { cellWidth: 25, halign: 'center' }, // No WA
      7: { cellWidth: 'auto' }, // Judul Tugas Akhir
      8: { cellWidth: 42 } // Penguji
    },
    didParseCell: (data) => {
      // Highlight kolom Hari dan Ruang Sidang serta Jam Sidang dengan warna kuning seperti format acuan
      if (data.section === 'head' && (data.column.index === 0 || data.column.index === 1)) {
        data.cell.styles.fillColor = [254, 240, 138] // yellow-200
        data.cell.styles.textColor = [113, 63, 18] // yellow-900
      }
    },
    didDrawPage: () => {
      // Footer Nomor Halaman
      const pageStr = `Halaman ${doc.internal.getNumberOfPages()}`
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(140)
      doc.text(pageStr, doc.internal.pageSize.getWidth() - 12, doc.internal.pageSize.getHeight() - 6, { align: 'right' })
      doc.text(
        `SiReDo Polibatam • Dicetak otomatis pada ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        12,
        doc.internal.pageSize.getHeight() - 6
      )
    }
  })

  // Halaman Lampiran: Rekap Beban Menguji Dosen
  if (currentWorkload.value && currentWorkload.value.length > 0) {
    doc.addPage()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    doc.text(`Rekap Beban Menguji Dosen - ${pTitle}`, doc.internal.pageSize.getWidth() / 2, 12, { align: 'center' })
    
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`${aYear} • Batas Beban: Maksimal ${maxPerPeriod.value} TA / Periode & ${maxPerDay.value} TA / Hari`, doc.internal.pageSize.getWidth() / 2, 17, { align: 'center' })

    const workloadRows = currentWorkload.value.map((w, idx) => [
      String(idx + 1),
      w.nama,
      `${w.total} TA`,
      `${w.maxPeriod} TA`,
      `${w.percentage}%`
    ])

    autoTable(doc, {
      startY: 21,
      margin: { left: 45, right: 45 },
      head: [['No', 'Nama Dosen Penguji', 'Total Menguji', 'Batas Maksimal Periode', 'Persentase Beban']],
      body: workloadRows,
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [15, 118, 110], // teal-700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 32, halign: 'center' },
        3: { cellWidth: 42, halign: 'center' },
        4: { cellWidth: 35, halign: 'center' }
      }
    })
  }

  const safeFileName = `Jadwal_${selectedJenisSidang.value.replace(/\s+/g, '_')}_${activePeriod.value.name.replace(/\s+/g, '_')}.pdf`
  doc.save(safeFileName)
}

// Download Sample Template
const downloadTemplate = () => {
  const templateData = [
    {
      'No': 1,
      'Jenis Usulan': selectedJenisSidang.value,
      'NIM': '3312311099',
      'Nama Mahasiswa': 'Henokh Iglessias Hutasoit',
      'No WA': '087763560323',
      'Judul Tugas Akhir': 'Sistem Pendukung Keputusan Penilaian Kinerja Karyawan Berbasis Web',
      'Dosen Pembimbing': 'Dosen Pembimbing, M.Kom',
      'Abstrak': 'Penelitian ini mengembangkan sistem pendukung keputusan penilaian kinerja karyawan...'
    },
    {
      'No': 2,
      'Jenis Usulan': selectedJenisSidang.value,
      'NIM': '3312311100',
      'Nama Mahasiswa': 'Siti Aminah',
      'No WA': '081234567890',
      'Judul Tugas Akhir': 'Sistem Monitoring Kualitas Udara Ruang Laboratorium Berbasis IoT dan MQTT',
      'Dosen Pembimbing': 'Dosen Pembimbing 2, M.T.',
      'Abstrak': 'Implementasi IoT untuk pemantauan suhu, kelembaban, dan partikulat debu secara real-time...'
    }
  ]
  const ws = XLSX.utils.json_to_sheet(templateData)
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 15 },
    { wch: 28 },
    { wch: 16 },
    { wch: 50 },
    { wch: 30 },
    { wch: 50 }
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data Peserta Sidang")
  XLSX.writeFile(wb, "Template_Peserta_Sidang_Polibatam.xlsx")
}
</script>

<template>
  <div class="space-y-6 pb-12 font-sans text-slate-800">
    <!-- Header Hero Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
      <div>
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
          <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          Modul Penjadwalan Sidang TA Cerdas
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Penjadwalan Otomatis Sidang TA
        </h1>
        <p class="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Alokasi jadwal sidang, ruangan, dan 2 penguji bebas bentrok dengan batasan kuota harian & periode serta format laporan resmi Polibatam.
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <button 
          v-if="step === 3" 
          @click="resetAll" 
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Jadwal Ulang Baru
        </button>

        <button 
          @click="downloadTemplate" 
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs group cursor-pointer"
        >
          <svg class="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Unduh Template Excel
        </button>
      </div>
    </div>

    <!-- KPI & Constraint Indicators -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maks. Uji Harian</div>
          <div class="text-lg font-bold text-slate-900 mt-0.5"><span class="font-mono tabular-nums">{{ maxPerDay }}</span> Judul / Hari</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maks. Uji Periode</div>
          <div class="text-lg font-bold text-emerald-900 mt-0.5"><span class="font-mono tabular-nums">{{ maxPerPeriod }}</span> Judul / Periode</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kapasitas Slot</div>
          <div class="text-lg font-bold text-slate-900 mt-0.5"><span class="font-mono tabular-nums">{{ 4 * customRooms.length }}</span> Slot / Hari</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Laporan</div>
          <div class="text-lg font-bold text-indigo-900 mt-0.5">{{ selectedJenisSidang }}</div>
        </div>
      </div>
    </div>

    <!-- Stepper Navigation Header -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div class="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50/60">
        <button 
          @click="step = 1" 
          type="button"
          class="p-4 flex items-center gap-3 transition-all text-left cursor-pointer" 
          :class="step === 1 ? 'bg-white font-bold text-teal-800 shadow-xs' : 'text-slate-500 hover:bg-slate-100/70'"
        >
          <span 
            class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors" 
            :class="step === 1 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'"
          >
            1
          </span>
          <div>
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tahap 1</div>
            <div class="text-sm font-semibold text-slate-800">Konfigurasi & Berkas</div>
          </div>
        </button>

        <div 
          class="p-4 flex items-center gap-3 text-left transition-all" 
          :class="step === 2 ? 'bg-white font-bold text-teal-800 shadow-xs' : 'text-slate-400'"
        >
          <span 
            class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors" 
            :class="step === 2 ? 'bg-teal-700 text-white animate-pulse' : 'bg-slate-200 text-slate-400'"
          >
            2
          </span>
          <div>
            <div class="text-[11px] font-bold uppercase tracking-wider">Tahap 2</div>
            <div class="text-sm font-semibold" :class="step === 2 ? 'text-teal-900' : 'text-slate-400'">Alokasi Cerdas & NLP</div>
          </div>
        </div>

        <button 
          :disabled="!scheduleResult"
          @click="scheduleResult && (step = 3)" 
          type="button"
          class="p-4 flex items-center gap-3 transition-all text-left disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer" 
          :class="step === 3 ? 'bg-white font-bold text-teal-800 shadow-xs' : 'text-slate-500 hover:bg-slate-100/70'"
        >
          <span 
            class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors" 
            :class="step === 3 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'"
          >
            3
          </span>
          <div>
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tahap 3</div>
            <div class="text-sm font-semibold text-slate-800">Jadwal Sidang Final</div>
          </div>
        </button>
      </div>

      <!-- Step 1 Content Container -->
      <div v-if="step === 1" class="p-6 md:p-8 space-y-8 bg-slate-50/30">
        
        <!-- Section 1: Jenis Usulan Sidang & Kop Laporan -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                1. Jenis Usulan Sidang
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Pilih tingkat ujian tugas akhir yang akan dijadwalkan.</p>
            </div>
            
            <!-- Toggle Pengaturan Lanjutan Kop -->
            <button
              type="button"
              @click="showKopSettings = !showKopSettings"
              class="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>{{ showKopSettings ? 'Tutup Pengaturan Kop' : 'Sesuaikan Judul Kop Excel/PDF' }}</span>
            </button>
          </div>

          <!-- Pilihan Sidang TA 1 vs Sidang TA 2 (Desain Visual Bersih) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            <div 
              @click="selectedJenisSidang = 'Sidang TA1'"
              class="p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group"
              :class="selectedJenisSidang === 'Sidang TA1' ? 'border-teal-600 bg-teal-50/60 shadow-xs ring-1 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'"
            >
              <div class="flex items-center gap-3">
                <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0" :class="selectedJenisSidang === 'Sidang TA1' ? 'border-teal-600 bg-teal-600' : 'border-slate-300 bg-white'">
                  <span v-if="selectedJenisSidang === 'Sidang TA1'" class="w-2 h-2 rounded-full bg-white"></span>
                </span>
                <div>
                  <div class="font-bold text-slate-900 group-hover:text-teal-800 transition-colors">Sidang TA 1</div>
                  <div class="text-xs text-slate-500 mt-0.5">Ujian Proposal / Progres TA</div>
                </div>
              </div>
              <span v-if="selectedJenisSidang === 'Sidang TA1'" class="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                Terpilih
              </span>
            </div>

            <div 
              @click="selectedJenisSidang = 'Sidang TA2'"
              class="p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group"
              :class="selectedJenisSidang === 'Sidang TA2' ? 'border-teal-600 bg-teal-50/60 shadow-xs ring-1 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'"
            >
              <div class="flex items-center gap-3">
                <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0" :class="selectedJenisSidang === 'Sidang TA2' ? 'border-teal-600 bg-teal-600' : 'border-slate-300 bg-white'">
                  <span v-if="selectedJenisSidang === 'Sidang TA2'" class="w-2 h-2 rounded-full bg-white"></span>
                </span>
                <div>
                  <div class="font-bold text-slate-900 group-hover:text-teal-800 transition-colors">Sidang TA 2</div>
                  <div class="text-xs text-slate-500 mt-0.5">Ujian Akhir Tugas Akhir</div>
                </div>
              </div>
              <span v-if="selectedJenisSidang === 'Sidang TA2'" class="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                Terpilih
              </span>
            </div>
          </div>

          <!-- Panel Pengaturan Kop Laporan (Opsional / Collapsible) -->
          <div v-if="showKopSettings" class="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Judul Periode (Baris 1 Kop Dokumen)
              </label>
              <input 
                v-model="periodTitle"
                type="text" 
                placeholder="Contoh: Oktober 2026 (Periode September 2026)" 
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white shadow-2xs"
              />
              <span class="text-[11px] text-slate-500 mt-1 block">Teks judul di bagian paling atas tabel Excel & PDF resmi</span>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tahun Akademik & Semester (Baris 2 Kop Dokumen)
              </label>
              <input 
                v-model="academicYear"
                type="text" 
                placeholder="Contoh: Ganjil 2026-2027" 
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white shadow-2xs"
              />
              <span class="text-[11px] text-slate-500 mt-1 block">Subjudul semester yang dicantumkan pada berkas laporan</span>
            </div>
          </div>
        </div>

        <!-- Section 2: Pilihan & Manajemen Waktu Periode Sidang -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                2. Pilihan & Waktu Periode Sidang
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                Pilih periode yang aktif atau ubah rentang tanggalnya sesuai jadwal operasional jurusan.
              </p>
            </div>

            <button 
              @click="addPeriod" 
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Tambah Periode Baru
            </button>
          </div>

          <!-- Daftar Pilihan Periode (Kartu Rapi & Bersih) -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div 
              v-for="preset in periods" 
              :key="preset.id"
              @click="selectedPeriodId = preset.id"
              class="p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between group relative"
              :class="selectedPeriodId === preset.id ? 'border-teal-600 bg-teal-50/40 shadow-xs ring-1 ring-teal-500/20' : 'border-slate-200 bg-white hover:border-slate-300'"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                  <div class="flex items-center gap-2.5">
                    <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" :class="selectedPeriodId === preset.id ? 'border-teal-600 bg-teal-600' : 'border-slate-300 bg-white'">
                      <span v-if="selectedPeriodId === preset.id" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </span>
                    <span class="font-bold text-slate-900 group-hover:text-teal-800 transition-colors text-sm sm:text-base">
                      {{ preset.name }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span v-if="selectedPeriodId === preset.id" class="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                    <button 
                      v-if="periods.length > 1"
                      @click.stop="removePeriod(preset.id)"
                      type="button"
                      class="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus periode"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                <!-- Rentang Hari -->
                <div class="pl-6 text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 font-medium mt-1">
                  <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>{{ formatIndoDate(preset.startDate) }} s.d. {{ formatIndoDate(preset.endDate) }}</span>
                </div>
              </div>

              <div class="pl-6 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Klik untuk aktifkan</span>
                <span class="font-mono tabular-nums font-bold text-teal-800">5 Hari Kerja</span>
              </div>
            </div>
          </div>

          <!-- Panel Pengaturan Tanggal untuk Periode Terpilih -->
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div class="flex items-center justify-between">
              <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Sesuaikan Waktu untuk: <strong class="text-teal-900 underline">{{ activePeriod.name }}</strong>
              </div>
              <div class="text-xs font-semibold text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-full">
                {{ activeWorkingDays.length }} Hari Kerja Terdeteksi (Senin–Jumat)
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Nama Periode:</label>
                <input 
                  v-model="activePeriod.name" 
                  type="text" 
                  class="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:border-teal-500 focus:outline-none shadow-2xs font-semibold"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Tanggal Mulai:</label>
                <input 
                  v-model="activePeriod.startDate" 
                  type="date" 
                  class="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:border-teal-500 focus:outline-none shadow-2xs font-mono font-medium"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Tanggal Selesai:</label>
                <input 
                  v-model="activePeriod.endDate" 
                  type="date" 
                  class="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:border-teal-500 focus:outline-none shadow-2xs font-mono font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Pengaturan Ruangan Sidang -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                3. Pengaturan Ruangan Sidang
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Tentukan ruangan sidang yang aktif untuk periode ini.</p>
            </div>

            <button 
              @click="resetRooms" 
              type="button"
              class="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Reset ke Ruangan Standar
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div 
              v-for="(room, idx) in customRooms" 
              :key="room" 
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs hover:border-teal-400 transition-all"
            >
              <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <span>{{ room }}</span>
              <button 
                @click="removeRoom(idx)" 
                type="button" 
                title="Hapus ruangan" 
                class="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-sm"
              >
                &times;
              </button>
            </div>
          </div>

          <!-- Tambah Ruangan Baru -->
          <div class="flex items-center gap-2 max-w-md pt-1">
            <input 
              v-model="newRoomInput" 
              @keyup.enter="addRoom"
              type="text" 
              placeholder="Tambah ruang baru (contoh: R. PBL 104, Lab AI)..." 
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white shadow-2xs" 
            />
            <button 
              @click="addRoom" 
              type="button"
              class="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold shadow-2xs transition-colors shrink-0 inline-flex items-center gap-1 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Tambah
            </button>
          </div>

          <div v-if="roomError" class="text-xs text-red-600 font-medium flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            {{ roomError }}
          </div>
        </div>

        <!-- Section 4: Unggah Berkas & Eksekusi -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                4. Unggah Berkas Peserta Sidang (.xlsx)
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Unggah berkas hasil batch rekomendasi atau berkas daftar mahasiswa.</p>
            </div>
            <span class="text-xs text-slate-400 font-mono">Format: .xlsx / .xls</span>
          </div>

          <div 
            @click="triggerUpload"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            class="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
            :class="isDragging ? 'border-teal-600 bg-teal-50/60' : 'border-slate-300 bg-slate-50/40 hover:border-teal-500 hover:bg-teal-50/20'"
          >
            <div class="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-all shadow-xs">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div v-if="!fileName">
              <div class="text-sm sm:text-base font-bold text-slate-800 mb-1">
                Tarik & letakkan berkas Excel di sini, atau <span class="text-teal-700 underline font-semibold">pilih dari komputer</span>
              </div>
              <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Mendukung berkas <strong>Hasil_Batch_Rekomendasi.xlsx</strong> atau template berkas peserta sidang.
              </p>
            </div>

            <div v-else class="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-teal-300 shadow-xs">
              <span class="text-sm font-bold text-teal-900">{{ fileName }}</span>
              <span v-if="fileSize" class="text-xs font-mono text-slate-500">({{ fileSize }})</span>
              <button 
                @click.stop="clearFile" 
                type="button" 
                class="text-slate-400 hover:text-red-600 text-sm p-1 cursor-pointer"
                title="Hapus berkas"
              >
                &times;
              </button>
            </div>

            <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls" @change="handleFileChange">
          </div>

          <div v-if="error" class="p-3.5 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-center gap-2">
            <svg class="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            <span><strong>Perhatian:</strong> {{ error }}</span>
          </div>

          <!-- Bottom Action Bar -->
          <div class="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100">
            <div class="text-xs text-slate-600 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>Siap menjadwalkan: <strong>{{ selectedJenisSidang }}</strong> • {{ activePeriod.name }} ({{ activeWorkingDays.length }} Hari Kerja)</span>
            </div>

            <button 
              @click="processScheduling" 
              :disabled="!fileName || loading"
              type="button"
              class="w-full sm:w-auto px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer hover:shadow-md active:scale-98"
            >
              <span>Jalankan Penjadwalan Otomatis</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Processing Spinner -->
      <div v-if="step === 2" class="p-16 sm:p-20 flex flex-col items-center justify-center text-center space-y-4">
        <div class="relative w-14 h-14">
          <div class="w-14 h-14 border-4 border-teal-100 rounded-full"></div>
          <div class="w-14 h-14 border-4 border-teal-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 mb-1">Menyusun Jadwal {{ selectedJenisSidang }} Bebas Bentrok...</h2>
          <p class="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Mengevaluasi kecocokan topik dosen NLP, membatasi kuota harian (max 2 TA) & kuota periode (max 10 TA), serta menempatkan ruangan sidang secara optimal.
          </p>
        </div>
        <div class="flex items-center gap-4 text-xs font-semibold text-teal-800 bg-teal-50 px-4 py-2 rounded-full border border-teal-200">
          <span>✓ Evaluasi NLP SBERT</span>
          <span>•</span>
          <span>✓ Batasan Kuota Dosen</span>
          <span>•</span>
          <span>✓ Alokasi Bebas Bentrok</span>
        </div>
      </div>

      <!-- Step 3: Result Workspace -->
      <div v-if="step === 3 && scheduleResult" class="flex flex-col h-full">
        
        <!-- Header Banner Resmi (Sesuai format gambar Polibatam) -->
        <div class="p-5 bg-gradient-to-r from-teal-800 to-slate-900 text-white border-b border-teal-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
          <div>
            <div class="text-[11px] uppercase tracking-widest text-teal-200 font-bold">
              HASIL PENJADWALAN RESMI POLIBATAM
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
              {{ periodTitle || activePeriod.title }}
            </h2>
            <div class="text-xs sm:text-sm text-teal-100 font-medium flex items-center gap-2 mt-1">
              <span>{{ academicYear }}</span>
              <span>•</span>
              <span class="px-2 py-0.5 rounded bg-teal-700/80 text-white font-bold text-xs">{{ selectedJenisSidang }}</span>
              <span>•</span>
              <span>{{ activePeriod.name }} ({{ formatIndoDate(activePeriod.startDate) }} s.d. {{ formatIndoDate(activePeriod.endDate) }})</span>
            </div>
          </div>

          <!-- Dual Export Buttons: Excel & PDF -->
          <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button 
              @click="downloadSchedule" 
              type="button"
              class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md active:scale-98"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Ekspor Excel (.xlsx)
            </button>
            <button 
              @click="downloadPdfSchedule" 
              type="button"
              class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-md active:scale-98"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6" /></svg>
              Ekspor PDF (.pdf)
            </button>
          </div>
        </div>

        <!-- Sub-Navigation Tabs & Actions -->
        <div class="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap gap-4 items-center justify-between">
          <!-- View Tabs -->
          <div class="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg">
            <button 
              @click="activeTab = 'table'" 
              type="button"
              class="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer inline-flex items-center gap-1.5"
              :class="activeTab === 'table' ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Tabel Jadwal ({{ filteredSchedule.length }})
            </button>
            <button 
              @click="activeTab = 'workload'" 
              type="button"
              class="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer inline-flex items-center gap-1.5"
              :class="activeTab === 'workload' ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Beban Penguji ({{ currentWorkload.length }})
            </button>
          </div>

          <!-- Filters & Quick Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Search Query -->
            <div class="relative">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Cari NIM, Nama, No WA..." 
                class="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none w-44 sm:w-52 bg-white shadow-2xs" 
              />
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <!-- Usulan Filter -->
            <select v-model="selectedUsulanFilter" class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm focus:border-teal-500 focus:outline-none bg-white shadow-2xs">
              <option value="">Semua Usulan</option>
              <option value="Sidang TA1">Sidang TA 1</option>
              <option value="Sidang TA2">Sidang TA 2</option>
            </select>

            <!-- Date Filter -->
            <select v-model="selectedDateFilter" class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm focus:border-teal-500 focus:outline-none bg-white shadow-2xs">
              <option value="">Semua Tanggal</option>
              <option v-for="d in scheduleResult.period.workingDays" :key="d" :value="d">{{ formatIndoDate(d) }}</option>
            </select>

            <!-- Room Filter -->
            <select v-model="selectedRoomFilter" class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm focus:border-teal-500 focus:outline-none bg-white shadow-2xs">
              <option value="">Semua Ruang</option>
              <option v-for="r in allRoomsList" :key="r" :value="r">{{ r }}</option>
            </select>

            <!-- Examiner Filter -->
            <select v-model="selectedExaminerFilter" class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs sm:text-sm focus:border-teal-500 focus:outline-none bg-white max-w-[140px] shadow-2xs">
              <option value="">Semua Dosen</option>
              <option v-for="ex in uniqueExaminers" :key="ex" :value="ex">{{ ex }}</option>
            </select>

            <!-- Clear Filter Button -->
            <button 
              v-if="hasActiveFilters" 
              @click="resetFilters" 
              type="button" 
              title="Reset Filter"
              class="px-2 py-1.5 text-xs text-slate-500 hover:text-red-600 bg-white border border-slate-300 rounded-lg hover:border-red-300 transition-colors shadow-2xs cursor-pointer"
            >
              Reset
            </button>

            <!-- Quick Export Buttons inside Bar -->
            <button 
              @click="downloadSchedule" 
              type="button" 
              title="Ekspor Jadwal ke Excel"
              class="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Excel
            </button>

            <button 
              @click="downloadPdfSchedule" 
              type="button" 
              title="Ekspor Jadwal ke PDF Resmi"
              class="px-2.5 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6" /></svg>
              PDF
            </button>
          </div>
        </div>

        <!-- Summary Banner -->
        <div class="px-6 py-3 bg-teal-50/80 border-b border-teal-200/70 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-teal-900">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-teal-600"></span>
            <span><strong class="font-semibold">Status:</strong> <span class="font-mono tabular-nums font-bold">{{ scheduleResult.totalScheduled }}</span> dari <span class="font-mono tabular-nums font-bold">{{ scheduleResult.totalRequested }}</span> Mahasiswa Berhasil Dijadwalkan</span>
          </div>
          <div class="flex items-center gap-4">
            <span><strong class="font-semibold">Ruangan:</strong> <span class="font-mono tabular-nums font-bold">{{ allRoomsList.length }}</span> Ruang Aktif</span>
            <span>•</span>
            <span><strong class="font-semibold">Jenis Usulan:</strong> <span class="font-bold">{{ selectedJenisSidang }}</span></span>
          </div>
        </div>

        <!-- Warning banner if any unassigned -->
        <div v-if="scheduleResult.totalUnassigned > 0" class="p-4 bg-amber-50 border-b border-amber-200 text-xs sm:text-sm text-amber-900">
          <div class="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span class="font-mono tabular-nums font-bold">{{ scheduleResult.totalUnassigned }}</span> Mahasiswa Belum Terjadwal
          </div>
          <ul class="list-disc list-inside space-y-0.5 text-amber-700 pl-1">
            <li v-for="u in scheduleResult.unassigned" :key="u.mahasiswa_id">
              <strong>{{ u.nama_mahasiswa }} (<span class="font-mono">{{ u.mahasiswa_id }}</span>):</strong> {{ u.reason }}
            </li>
          </ul>
        </div>

        <!-- View 1: Tabel Jadwal (Sesuai Kolom Gambar Resmi Polibatam) -->
        <div v-if="activeTab === 'table'" class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm border-collapse">
            <thead class="bg-slate-100 border-b border-slate-300 text-[11px] font-bold uppercase tracking-wider text-slate-800 sticky top-0 backdrop-blur-xs">
              <tr>
                <th class="p-3 border-r border-slate-300 min-w-[170px] bg-yellow-100/70 text-yellow-900">Hari dan Ruang Sidang</th>
                <th class="p-3 border-r border-slate-300 min-w-[130px] bg-yellow-100/70 text-yellow-900">Jam Sidang</th>
                <th class="p-3 border-r border-slate-300 w-12 text-center">No</th>
                <th class="p-3 border-r border-slate-300 min-w-[120px]">Jenis Usulan</th>
                <th class="p-3 border-r border-slate-300 min-w-[120px]">NIM</th>
                <th class="p-3 border-r border-slate-300 min-w-[180px]">Nama Mahasiswa</th>
                <th class="p-3 border-r border-slate-300 min-w-[130px]">No WA</th>
                <th class="p-3 border-r border-slate-300 min-w-[280px]">Judul Tugas Akhir</th>
                <th class="p-3 border-r border-slate-300 min-w-[230px]">Penguji 1 (Bisa Diganti)</th>
                <th class="p-3 min-w-[230px]">Penguji 2 (Bisa Diganti)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-for="(row, idx) in filteredSchedule" :key="row.id || idx" class="hover:bg-teal-50/30 transition-colors">
                <!-- Hari dan Ruang Sidang -->
                <td class="p-3 border-r border-slate-200 align-top">
                  <div class="font-bold text-slate-900">{{ row.tanggal_indo }}</div>
                  <div class="mt-1">
                    <select 
                      v-model="row.ruangan" 
                      class="px-2 py-1 text-xs font-bold text-teal-900 bg-teal-50/90 border border-teal-300 rounded hover:border-teal-500 focus:border-teal-600 focus:outline-none cursor-pointer shadow-2xs w-full"
                      title="Ubah ruangan sidang"
                    >
                      <option v-for="r in allRoomsList" :key="r" :value="r">{{ r }}</option>
                    </select>
                  </div>
                </td>

                <!-- Jam Sidang -->
                <td class="p-3 border-r border-slate-200 align-top whitespace-nowrap">
                  <div class="font-mono tabular-nums font-bold text-slate-900">{{ row.waktu }}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">{{ row.sesi_label }}</div>
                </td>

                <!-- No -->
                <td class="p-3 border-r border-slate-200 font-mono tabular-nums text-slate-700 align-top text-center font-bold">
                  {{ idx + 1 }}
                </td>

                <!-- Jenis Usulan -->
                <td class="p-3 border-r border-slate-200 align-top">
                  <span class="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    {{ row.jenis_usulan || selectedJenisSidang }}
                  </span>
                </td>

                <!-- NIM -->
                <td class="p-3 border-r border-slate-200 font-mono tabular-nums text-slate-800 align-top font-semibold">
                  {{ row.mahasiswa_id }}
                </td>

                <!-- Nama Mahasiswa -->
                <td class="p-3 border-r border-slate-200 align-top font-bold text-slate-900">
                  {{ row.nama_mahasiswa }}
                </td>

                <!-- No WA (Selalu tampil kolomnya walaupun kosong) -->
                <td class="p-3 border-r border-slate-200 font-mono tabular-nums align-top text-slate-700">
                  <span v-if="row.no_wa" class="text-teal-900 font-semibold">{{ row.no_wa }}</span>
                  <span v-else class="text-slate-400 italic text-[11px]">- (kosong) -</span>
                </td>

                <!-- Judul Tugas Akhir -->
                <td class="p-3 border-r border-slate-200 text-slate-800 align-top">
                  <div class="line-clamp-2 leading-relaxed font-medium" :title="row.judul_tugas_akhir">{{ row.judul_tugas_akhir }}</div>
                  <div v-if="row.pembimbing && row.pembimbing !== '-'" class="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <span class="text-slate-400">Pembimbing:</span>
                    <span class="font-semibold text-slate-700">{{ row.pembimbing }}</span>
                  </div>
                </td>
                
                <!-- Penguji 1: Editable Dropdown with Recommendations & Scores -->
                <td class="p-3 border-r border-slate-200 align-top">
                  <div class="space-y-1">
                    <select 
                      v-model="row.penguji_1" 
                      class="w-full text-xs sm:text-sm font-semibold px-2 py-1.5 bg-white border rounded-lg focus:ring-1 focus:outline-none transition-colors cursor-pointer shadow-2xs"
                      :class="row.penguji_1 === row.penguji_2 ? 'border-red-400 bg-red-50/50 text-red-900 focus:ring-red-400' : 'border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 hover:border-slate-400'"
                      title="Pilih Dosen Penguji 1"
                    >
                      <optgroup label="Rekomendasi Topik TA">
                        <option 
                          v-for="cand in (row.candidates || [])" 
                          :key="cand.nama" 
                          :value="cand.nama"
                        >
                          #{{ cand.rank }}: {{ cand.nama }} ({{ Math.round((cand.score || 0) * 100) }}% Cocok)
                        </option>
                      </optgroup>
                      <optgroup v-if="getNonCandidateDosens(row).length > 0" label="Dosen Lainnya (Pilihan Manual)">
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
                        class="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        Rank #<span class="font-mono tabular-nums font-semibold">{{ getCandidateInfo(row, row.penguji_1).rank }}</span> (<span class="font-mono tabular-nums font-semibold">{{ Math.round((getCandidateInfo(row, row.penguji_1).score || 0) * 100) }}%</span>)
                      </span>
                      <span 
                        v-else 
                        class="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pilihan Manual
                      </span>
                    </div>

                    <div v-if="row.penguji_1 === row.penguji_2" class="text-[11px] font-semibold text-red-600 flex items-center gap-1 pt-0.5">
                      <svg class="w-3 h-3 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                      Penguji 1 & 2 tidak boleh sama
                    </div>
                  </div>
                </td>

                <!-- Penguji 2: Editable Dropdown with Recommendations & Scores -->
                <td class="p-3 align-top">
                  <div class="space-y-1">
                    <select 
                      v-model="row.penguji_2" 
                      class="w-full text-xs sm:text-sm font-semibold px-2 py-1.5 bg-white border rounded-lg focus:ring-1 focus:outline-none transition-colors cursor-pointer shadow-2xs"
                      :class="row.penguji_1 === row.penguji_2 ? 'border-red-400 bg-red-50/50 text-red-900 focus:ring-red-400' : 'border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-500 hover:border-slate-400'"
                      title="Pilih Dosen Penguji 2"
                    >
                      <optgroup label="Rekomendasi Topik TA">
                        <option 
                          v-for="cand in (row.candidates || [])" 
                          :key="cand.nama" 
                          :value="cand.nama"
                        >
                          #{{ cand.rank }}: {{ cand.nama }} ({{ Math.round((cand.score || 0) * 100) }}% Cocok)
                        </option>
                      </optgroup>
                      <optgroup v-if="getNonCandidateDosens(row).length > 0" label="Dosen Lainnya (Pilihan Manual)">
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
                        class="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        Rank #<span class="font-mono tabular-nums font-semibold">{{ getCandidateInfo(row, row.penguji_2).rank }}</span> (<span class="font-mono tabular-nums font-semibold">{{ Math.round((getCandidateInfo(row, row.penguji_2).score || 0) * 100) }}%</span>)
                      </span>
                      <span 
                        v-else 
                        class="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pilihan Manual
                      </span>
                    </div>

                    <div v-if="row.penguji_1 === row.penguji_2" class="text-[11px] font-semibold text-red-600 flex items-center gap-1 pt-0.5">
                      <svg class="w-3 h-3 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                      Penguji 1 & 2 tidak boleh sama
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredSchedule.length === 0">
                <td colspan="10" class="p-12 text-center text-slate-500 text-sm">
                  <svg class="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Tidak ada jadwal yang sesuai dengan filter pencarian.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- View 2: Workload Dosen Tracker -->
        <div v-if="activeTab === 'workload'" class="p-6 sm:p-8 overflow-x-auto space-y-6">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Rekap Beban Menguji Dosen (Periode Ini)</h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Memastikan tidak ada dosen yang melebihi kuota 10 TA per periode dan 2 TA per hari.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="w in currentWorkload" 
              :key="w.nama"
              class="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between hover:shadow-sm hover:border-teal-300 transition-all"
            >
              <div>
                <div class="flex items-start justify-between gap-2 mb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center">
                      {{ w.nama.charAt(0) }}
                    </span>
                    <span class="font-bold text-sm text-slate-900 line-clamp-1" :title="w.nama">{{ w.nama }}</span>
                  </div>
                  <span class="text-xs font-mono tabular-nums font-bold px-2 py-0.5 rounded-full shrink-0" :class="w.total >= w.maxPeriod ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-teal-50 text-teal-700 border border-teal-200'">
                    {{ w.total }} / {{ w.maxPeriod }} TA
                  </span>
                </div>

                <!-- Progress bar -->
                <div class="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                  <div 
                    class="h-2 rounded-full transition-all" 
                    :class="w.total >= w.maxPeriod ? 'bg-amber-500' : 'bg-teal-600'"
                    :style="{ width: `${w.percentage}%` }"
                  ></div>
                </div>

                <!-- Daily Breakdown -->
                <div class="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div v-for="(cnt, d) in w.perDay" :key="d" class="flex justify-between items-center">
                    <span>{{ formatIndoDate(d) }}:</span>
                    <span class="font-mono tabular-nums font-bold px-1.5 py-0.5 rounded" :class="cnt >= 2 ? 'text-teal-900 bg-teal-50' : 'text-slate-700'">{{ cnt }} TA</span>
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
