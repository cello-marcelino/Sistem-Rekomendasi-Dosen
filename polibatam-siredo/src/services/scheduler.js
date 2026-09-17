/**
 * Engine Penjadwalan Otomatis Sidang Tugas Akhir
 * Mematuhi batasan kuota harian (max 2 TA/hari) & kuota periode (max 10 TA/periode).
 */

export const PERIOD_PRESETS = [
  {
    id: 'periode-1',
    name: 'Sidang Periode 1',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    description: 'Pelaksanaan Sidang: 05 Oktober – 09 Oktober 2026'
  },
  {
    id: 'periode-2',
    name: 'Sidang Periode 2',
    startDate: '2026-11-09',
    endDate: '2026-11-13',
    description: 'Pelaksanaan Sidang: 09 November – 13 November 2026'
  }
]

export const DEFAULT_SESSIONS = [
  { id: 1, label: 'Sesi 1', time: '08:30 - 10:00' },
  { id: 2, label: 'Sesi 2', time: '10:15 - 11:45' },
  { id: 3, label: 'Sesi 3', time: '13:30 - 15:00' },
  { id: 4, label: 'Sesi 4', time: '15:15 - 16:45' }
]

export const DEFAULT_ROOMS = [
  'R. PBL 101',
  'R. PBL 102',
  'R. PBL 103'
]

/**
 * Generate daftar hari kerja (Senin - Jumat) antara startDate dan endDate.
 */
export function getWorkingDays(startDateStr, endDateStr) {
  const dates = []
  const current = new Date(startDateStr)
  const end = new Date(endDateStr)

  while (current <= end) {
    const day = current.getDay()
    // 0: Minggu, 6: Sabtu
    if (day !== 0 && day !== 6) {
      dates.push(current.toISOString().split('T')[0])
    }
    current.setDate(current.getDate() + 1)
  }
  return dates
}

/**
 * Format tanggal YYYY-MM-DD ke format Indonesia (misal: Senin, 05 Okt 2026)
 */
export function formatIndoDate(dateStr) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

/**
 * Algoritma Penjadwalan Berbasis Batasan Kuota & Ranking NLP
 * 
 * @param {Array} proposals Daftar proposal / mahasiswa dengan rekomendasi penguji
 * @param {Object} options Konfigurasi penjadwalan
 * @returns {Object} Hasil jadwal, workload dosen, dan unassigned list
 */
export function scheduleDefenses(proposals = [], options = {}) {
  const {
    periodId = 'periode-1',
    startDate = '2026-10-05',
    endDate = '2026-10-09',
    sessions = DEFAULT_SESSIONS,
    rooms = DEFAULT_ROOMS,
    maxPerDay = 2,
    maxPerPeriod = 10
  } = options

  const workingDays = getWorkingDays(startDate, endDate)
  if (workingDays.length === 0) {
    throw new Error("Rentang tanggal tidak memiliki hari kerja (Senin-Jumat).")
  }

  // State Pelacak Batasan (Constraint Trackers)
  // 1. dailyCount[date][dosenNama] -> jumlah menguji per hari
  const dailyCount = {}
  workingDays.forEach(d => { dailyCount[d] = {} })

  // 2. periodCount[dosenNama] -> total menguji dalam periode ini
  const periodCount = {}

  // 3. slotOccupancy[date_sessionId][dosenNama] -> penanda dosen sedang di ruangan lain pada sesi yang sama
  const slotOccupancy = {}

  // 4. roomOccupancy[date_sessionId_room] -> mahasiswa yang sudah terjadwal di ruangan tersebut
  const roomOccupancy = {}

  const scheduled = []
  const unassigned = []

  // Siapkan seluruh slot waktu berurutan (Date x Session x Room)
  const availableSlots = []
  for (const date of workingDays) {
    for (const session of sessions) {
      for (const room of rooms) {
        availableSlots.push({
          date,
          session,
          room,
          slotKey: `${date}_${session.id}`,
          roomKey: `${date}_${session.id}_${room}`
        })
      }
    }
  }

  let slotPointer = 0

  for (let pIdx = 0; pIdx < proposals.length; pIdx++) {
    const item = proposals[pIdx]
    const mhsId = item.id || item.mahasiswa_id || item.nim || `MHS${1001 + pIdx}`
    const mhsNama = item.nama || item.nama_mahasiswa || `Mahasiswa #${pIdx + 1}`
    const judul = item.judul || item.judul_tugas_akhir || item.title || 'Topik Tugas Akhir'
    const pembimbing = item.pembimbing || item.dosen_pembimbing || ''

    // Ambil list kandidat penguji dari hasil rekomendasi NLP
    let recList = []
    if (item.rekomendasi?.recommendations) {
      recList = item.rekomendasi.recommendations
    } else if (item.recommendations) {
      recList = item.recommendations
    } else if (item.penguji_1 && item.penguji_2) {
      recList = [
        { dosen: { nama: item.penguji_1 }, scores: { hybrid: 1.0 } },
        { dosen: { nama: item.penguji_2 }, scores: { hybrid: 0.9 } }
      ]
    }

    // Normalisasi nama-nama dosen kandidat
    const candidateList = recList.map((r, rankIdx) => ({
      nama: r.dosen?.nama || r.nama_dosen || r.nama || `Dosen Candidate ${rankIdx + 1}`,
      rank: rankIdx + 1,
      score: r.scores?.hybrid || 0
    })).filter(c => c.nama && c.nama.toLowerCase() !== pembimbing.toLowerCase())

    let isAssigned = false

    // Cari slot waktu dan pasangan penguji terbaik yang memenuhi constraint
    for (let sIdx = 0; sIdx < availableSlots.length; sIdx++) {
      const slot = availableSlots[(slotPointer + sIdx) % availableSlots.length]
      
      // Jika ruangan di slot ini sudah terisi, lewati
      if (roomOccupancy[slot.roomKey]) continue

      const date = slot.date
      const slotKey = slot.slotKey

      if (!slotOccupancy[slotKey]) {
        slotOccupancy[slotKey] = new Set()
      }

      // Cari 2 dosen dari kandidat yang valid pada slot ini
      let penguji1 = null
      let penguji2 = null

      for (let i = 0; i < candidateList.length; i++) {
        const cand = candidateList[i]
        const dName = cand.nama

        // Cek bentrok jam sesi yang sama
        if (slotOccupancy[slotKey].has(dName)) continue

        // Cek kuota harian (max 2 TA per hari)
        const curDaily = dailyCount[date][dName] || 0
        if (curDaily >= maxPerDay) continue

        // Cek kuota periode (max 10 TA per periode)
        const curPeriod = periodCount[dName] || 0
        if (curPeriod >= maxPerPeriod) continue

        if (!penguji1) {
          penguji1 = cand
        } else if (!penguji2 && cand.nama !== penguji1.nama) {
          penguji2 = cand
          break // Pasangan ditemukan!
        }
      }

      // Jika menemukan pasangan penguji 1 & penguji 2 yang valid
      if (penguji1 && penguji2) {
        // Alokasikan ke slot ini
        roomOccupancy[slot.roomKey] = mhsId
        slotOccupancy[slotKey].add(penguji1.nama)
        slotOccupancy[slotKey].add(penguji2.nama)

        dailyCount[date][penguji1.nama] = (dailyCount[date][penguji1.nama] || 0) + 1
        dailyCount[date][penguji2.nama] = (dailyCount[date][penguji2.nama] || 0) + 1

        periodCount[penguji1.nama] = (periodCount[penguji1.nama] || 0) + 1
        periodCount[penguji2.nama] = (periodCount[penguji2.nama] || 0) + 1

        scheduled.push({
          id: `SCH-${1000 + pIdx}`,
          mahasiswa_id: mhsId,
          nama_mahasiswa: mhsNama,
          judul_tugas_akhir: judul,
          pembimbing: pembimbing || '-',
          penguji_1: penguji1.nama,
          penguji_2: penguji2.nama,
          penguji_1_rank: penguji1.rank,
          penguji_2_rank: penguji2.rank,
          tanggal: date,
          tanggal_indo: formatIndoDate(date),
          sesi_id: slot.session.id,
          sesi_label: slot.session.label,
          waktu: slot.session.time,
          ruangan: slot.room,
          period_id: periodId
        })

        slotPointer = (slotPointer + sIdx + 1) % availableSlots.length
        isAssigned = true
        break
      }
    }

    if (!isAssigned) {
      unassigned.push({
        mahasiswa_id: mhsId,
        nama_mahasiswa: mhsNama,
        judul_tugas_akhir: judul,
        reason: 'Seluruh kandidat penguji telah mencapai batas kuota harian (2 TA) / periode (10 TA) atau slot waktu penuh.'
      })
    }
  }

  // Urutkan jadwal berdasarkan Tanggal ASC, Sesi ASC, Ruangan ASC
  scheduled.sort((a, b) => {
    if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal)
    if (a.sesi_id !== b.sesi_id) return a.sesi_id - b.sesi_id
    return a.ruangan.localeCompare(b.ruangan)
  })

  // Format statistik beban menguji dosen
  const examinerWorkload = Object.keys(periodCount).map(nama => {
    const total = periodCount[nama] || 0
    const perDay = {}
    workingDays.forEach(d => {
      perDay[d] = dailyCount[d][nama] || 0
    })

    return {
      nama,
      total,
      maxPeriod: maxPerPeriod,
      percentage: Math.min(100, Math.round((total / maxPerPeriod) * 100)),
      perDay
    }
  }).sort((a, b) => b.total - a.total)

  return {
    period: {
      id: periodId,
      startDate,
      endDate,
      totalDays: workingDays.length,
      workingDays
    },
    totalRequested: proposals.length,
    totalScheduled: scheduled.length,
    totalUnassigned: unassigned.length,
    scheduled,
    unassigned,
    examinerWorkload,
    constraints: {
      maxPerDay,
      maxPerPeriod
    }
  }
}
