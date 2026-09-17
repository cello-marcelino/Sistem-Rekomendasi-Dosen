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

  for (let pIdx = 0; pIdx < proposals.length; pIdx++) {
    const item = proposals[pIdx]
    const mhsId = item.id || item.mahasiswa_id || item.nim || item.ID || `MHS${1001 + pIdx}`
    const mhsNama = item.nama || item.nama_mahasiswa || item.Nama || `Mahasiswa #${pIdx + 1}`
    const judul = item.judul || item.judul_tugas_akhir || item['Judul TA'] || item.title || 'Topik Tugas Akhir'
    const pembimbing = item.pembimbing || item.dosen_pembimbing || item['Dosen Pembimbing'] || ''

    // 1. Ekstrak list rekomendasi dosen dari berbagai format (JSON / Excel hasil batch)
    let recList = []
    if (item.rekomendasi?.recommendations) {
      recList = item.rekomendasi.recommendations
    } else if (item.recommendations) {
      recList = item.recommendations
    }

    // Jika belum ada dari objek API, periksa kolom file Excel: 'Rekomendasi 1', 'Rekomendasi 2', dsb.
    if (recList.length === 0) {
      const keys = Object.keys(item)
      for (let i = 1; i <= 10; i++) {
        const rekKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === `rekomendasi${i}`)
        const skorKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === `skor${i}`)
        if (rekKey && item[rekKey] && String(item[rekKey]).trim() !== '-' && String(item[rekKey]).trim() !== '') {
          recList.push({
            dosen: { nama: String(item[rekKey]).trim() },
            scores: { hybrid: skorKey && item[skorKey] ? parseFloat(item[skorKey]) : (1 - (i * 0.05)) }
          })
        }
      }
    }

    if (recList.length === 0 && (item.penguji_1 || item.penguji_2)) {
      if (item.penguji_1) recList.push({ dosen: { nama: item.penguji_1 }, scores: { hybrid: 1.0 } })
      if (item.penguji_2) recList.push({ dosen: { nama: item.penguji_2 }, scores: { hybrid: 0.9 } })
    }

    // Normalisasi kandidat dosen (buang duplikat & pembimbing)
    const seenCand = new Set()
    const candidateList = []
    for (let rIdx = 0; rIdx < recList.length; rIdx++) {
      const r = recList[rIdx]
      const name = String(r.dosen?.nama || r.nama_dosen || r.nama || '').trim()
      if (name && name !== '-' && !seenCand.has(name.toLowerCase()) && name.toLowerCase() !== pembimbing.toLowerCase()) {
        seenCand.add(name.toLowerCase())
        candidateList.push({
          nama: name,
          rank: rIdx + 1,
          score: r.scores?.hybrid ?? r.hybrid_score ?? 1.0
        })
      }
    }

    let isAssigned = false

    // Bangun pasangan penguji berurutan berdasarkan prioritas ranking: (0,1), (0,2), (1,2), (0,3), (1,3)...
    const candidatePairs = []
    for (let i = 0; i < candidateList.length; i++) {
      for (let j = i + 1; j < candidateList.length; j++) {
        candidatePairs.push({
          p1: candidateList[i],
          p2: candidateList[j],
          combinedRank: candidateList[i].rank + candidateList[j].rank
        })
      }
    }
    // Urutkan pasangan penguji berdasarkan kombinasi rank terendah (terbaik)
    candidatePairs.sort((a, b) => a.combinedRank - b.combinedRank)

    // Cari slot waktu (Date x Session x Room) dan pasangan penguji terbaik
    for (const pair of candidatePairs) {
      const p1Name = pair.p1.nama
      const p2Name = pair.p2.nama

      // Cek kuota periode (max 10 TA per periode)
      if ((periodCount[p1Name] || 0) >= maxPerPeriod) continue
      if ((periodCount[p2Name] || 0) >= maxPerPeriod) continue

      // Cari slot ruangan & jam yang kosong di hari di mana kedua dosen belum mencapai max 2 TA/hari
      for (let sIdx = 0; sIdx < availableSlots.length; sIdx++) {
        const slot = availableSlots[sIdx]

        // Jika ruangan pada slot jam tersebut sudah dipakai
        if (roomOccupancy[slot.roomKey]) continue

        const date = slot.date
        const slotKey = slot.slotKey

        // Inisialisasi slot occupancy
        if (!slotOccupancy[slotKey]) {
          slotOccupancy[slotKey] = new Set()
        }

        // Cek apakah dosen sedang menguji di ruangan lain pada sesi jam yang sama (bentrok)
        if (slotOccupancy[slotKey].has(p1Name) || slotOccupancy[slotKey].has(p2Name)) continue

        // Cek kuota harian kedua dosen (max 2 TA/hari)
        if ((dailyCount[date][p1Name] || 0) >= maxPerDay) continue
        if ((dailyCount[date][p2Name] || 0) >= maxPerDay) continue

        // ALOKASI BERHASIL!
        roomOccupancy[slot.roomKey] = mhsId
        slotOccupancy[slotKey].add(p1Name)
        slotOccupancy[slotKey].add(p2Name)

        dailyCount[date][p1Name] = (dailyCount[date][p1Name] || 0) + 1
        dailyCount[date][p2Name] = (dailyCount[date][p2Name] || 0) + 1

        periodCount[p1Name] = (periodCount[p1Name] || 0) + 1
        periodCount[p2Name] = (periodCount[p2Name] || 0) + 1

        scheduled.push({
          id: `SCH-${1000 + pIdx}`,
          mahasiswa_id: mhsId,
          nama_mahasiswa: mhsNama,
          judul_tugas_akhir: judul,
          pembimbing: pembimbing || '-',
          penguji_1: p1Name,
          penguji_2: p2Name,
          penguji_1_rank: pair.p1.rank,
          penguji_2_rank: pair.p2.rank,
          tanggal: date,
          tanggal_indo: formatIndoDate(date),
          sesi_id: slot.session.id,
          sesi_label: slot.session.label,
          waktu: slot.session.time,
          ruangan: slot.room,
          period_id: periodId
        })

        isAssigned = true
        break
      }

      if (isAssigned) break
    }

    if (!isAssigned) {
      unassigned.push({
        mahasiswa_id: mhsId,
        nama_mahasiswa: mhsNama,
        judul_tugas_akhir: judul,
        reason: candidateList.length < 2 
          ? 'Jumlah dosen rekomendasi pada berkas kurang dari 2 orang.' 
          : 'Dosen rekomendasi telah mencapai kuota harian (2 TA) / periode (10 TA) atau semua slot ruangan penuh.'
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
