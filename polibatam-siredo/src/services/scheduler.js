/**
 * Engine Penjadwalan Otomatis Sidang Tugas Akhir Polibatam
 * 
 * Aturan & Batasan Berdasarkan Instruksi Koordinator Sidang (Buk Alena Uperiati):
 * 1. Tidak ada batas maksimal pendaftaran judul per periode (semua judul diproses).
 * 2. 1 dosen dalam sehari menguji maksimal 2 sesi (Sesi Pagi dan Sesi Siang).
 * 3. 1 sesi menampung 2 - 5 mahasiswa.
 * 4. 1 mahasiswa diuji oleh 2 orang dosen penguji (Penguji 1 & Penguji 2).
 * 5. Mahasiswa yang mengulang di periode berikutnya diperbolehkan diuji oleh dosen penguji yang sama.
 * 6. Kapasitas judul per hari ditentukan oleh ketersediaan ruangan & kesediaan penguji.
 * 7. Pemerataan Sesi per Periode (Workload Fairness / Round-Robin):
 *    Prioritaskan SEMUA dosen yang eligible mendapatkan minimal 1 sesi menguji terlebih dahulu.
 *    Jika semua dosen sudah mendapatkan sesi dan masih ada sesi tersisa, baru "muter lagi"
 *    memberikan sesi ke-2, ke-3, dst.
 */

export const DEFAULT_PERIODS = [
  {
    id: 'periode-1',
    name: 'Sidang Periode 1',
    title: 'Oktober 2026 (Periode September 2026)',
    academicYear: 'Ganjil 2026-2027',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    description: 'Pelaksanaan Sidang: 05 Oktober – 09 Oktober 2026'
  },
  {
    id: 'periode-2',
    name: 'Sidang Periode 2',
    title: 'November 2026 (Periode Oktober 2026)',
    academicYear: 'Ganjil 2026-2027',
    startDate: '2026-11-09',
    endDate: '2026-11-13',
    description: 'Pelaksanaan Sidang: 09 November – 13 November 2026'
  }
]

export const PERIOD_PRESETS = DEFAULT_PERIODS

/**
 * Konfigurasi Sesi Standar (2 Sesi per Hari: Pagi & Siang)
 * Setiap sesi dapat menampung 2 s/d 5 mahasiswa dengan sub-slot waktu @45 menit.
 */
export const DEFAULT_SESSIONS = [
  {
    id: 1,
    code: 'pagi',
    label: 'Sesi Pagi',
    time: '08:30 - 11:45',
    subTimes: [
      '08:30 - 09:15',
      '09:15 - 10:00',
      '10:15 - 11:00',
      '11:00 - 11:45',
      '11:45 - 12:30'
    ]
  },
  {
    id: 2,
    code: 'siang',
    label: 'Sesi Siang',
    time: '13:30 - 16:45',
    subTimes: [
      '13:30 - 14:15',
      '14:15 - 15:00',
      '15:15 - 16:00',
      '16:00 - 16:45',
      '16:45 - 17:30'
    ]
  }
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
 * Mengelompokkan proposal mahasiswa ke dalam batch sesi berkapasitas 2 - 5 orang.
 * Mengutamakan ukuran ideal 3-4 mahasiswa per sesi secara seimbang.
 */
export function createSessionBatches(proposals = [], minStudents = 2, maxStudents = 5, targetStudents = 4) {
  const n = proposals.length
  if (n === 0) return []
  if (n <= maxStudents) {
    return [proposals]
  }

  // Hitung jumlah batch optimal
  let k = Math.ceil(n / targetStudents)
  if (Math.floor(n / k) < minStudents) {
    k = Math.max(1, Math.floor(n / minStudents))
  }
  if (Math.ceil(n / k) > maxStudents) {
    k = Math.ceil(n / maxStudents)
  }

  // Bagi rata mahasiswa ke dalam k batch
  const batches = []
  const base = Math.floor(n / k)
  const rem = n % k
  let currentIdx = 0

  for (let i = 0; i < k; i++) {
    const batchSize = base + (i < rem ? 1 : 0)
    const batch = proposals.slice(currentIdx, currentIdx + batchSize)
    batches.push(batch)
    currentIdx += batchSize
  }

  return batches
}

/**
 * Algoritma Penjadwalan Sidang TA Cerdas Berbasis Sesi & Pemerataan Round-Robin
 * 
 * @param {Array} proposals Daftar proposal / mahasiswa dengan rekomendasi penguji
 * @param {Object} options Konfigurasi penjadwalan
 * @returns {Object} Hasil jadwal, workload dosen, dan unassigned list
 */
export function scheduleDefenses(proposals = [], options = {}) {
  const {
    periodId = 'periode-1',
    periodName = 'Sidang Periode 1',
    periodTitle = 'Oktober 2026 (Periode September 2026)',
    academicYear = 'Ganjil 2026-2027',
    jenisSidang = 'Sidang TA2',
    startDate = '2026-10-05',
    endDate = '2026-10-09',
    sessions = DEFAULT_SESSIONS,
    rooms = DEFAULT_ROOMS,
    minStudentsPerSession = 2,
    maxStudentsPerSession = 5,
    targetStudentsPerSession = 4,
    maxSessionsPerDay = 2, // Maksimal 2 sesi per hari (Pagi & Siang)
    availableExaminers = [] // Daftar master dosen penguji prodi jika tersedia
  } = options

  const workingDays = getWorkingDays(startDate, endDate)
  if (workingDays.length === 0) {
    throw new Error("Rentang tanggal tidak memiliki hari kerja (Senin-Jumat).")
  }

  // Kumpulkan seluruh nama dosen penguji yang dikenal
  const allExaminersSet = new Set(availableExaminers.map(e => String(e).trim()).filter(Boolean))

  // 1. Parsing & Normalisasi Setiap Proposal Mahasiswa
  const normalizedProposals = proposals.map((item, pIdx) => {
    const keys = Object.keys(item)
    const idKey = keys.find(k => ['id', 'nim', 'no', 'nomorinduk', 'nomor'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
    const namaKey = keys.find(k => ['nama', 'namamahasiswa', 'mahasiswa', 'name'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
    const judulKey = keys.find(k => ['judul', 'judultugasakhir', 'judulta', 'title', 'topik'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
    const pembimbingKey = keys.find(k => ['pembimbing', 'dosenpembimbing', 'pembimbing1', 'dosbing'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
    const waKey = keys.find(k => ['nowa', 'wa', 'nohp', 'hp', 'telepon', 'notelp', 'telp', 'phone', 'whatsapp', 'handphone'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))
    const usulanKey = keys.find(k => ['jenisusulan', 'jenis_usulan', 'jenissidang', 'jenis_sidang', 'usulan', 'tipe'].includes(k.toLowerCase().replace(/[^a-z0-9]/g, '')))

    const mhsId = idKey && item[idKey] ? item[idKey] : (item.id || item.mahasiswa_id || item.nim || `MHS${1001 + pIdx}`)
    const mhsNama = namaKey && item[namaKey] ? item[namaKey] : (item.nama || item.nama_mahasiswa || `Mahasiswa #${pIdx + 1}`)
    const judul = judulKey && item[judulKey] ? item[judulKey] : (item.judul || item.judul_tugas_akhir || 'Topik Tugas Akhir')
    const pembimbing = pembimbingKey && item[pembimbingKey] ? item[pembimbingKey] : (item.pembimbing || item.dosen_pembimbing || '')
    const noWa = (waKey && item[waKey] != null && String(item[waKey]).trim() !== '-') ? String(item[waKey]).trim() : (item.no_wa || item.no_hp || '')
    const jenisUsulan = (usulanKey && item[usulanKey] && String(item[usulanKey]).trim() !== '-') ? String(item[usulanKey]).trim() : (item.jenis_usulan || jenisSidang || 'Sidang TA2')

    // Ekstrak rekomendasi penguji (S-BERT / BM25 / Excel)
    let recList = []
    if (item.rekomendasi?.recommendations) {
      recList = item.rekomendasi.recommendations
    } else if (item.recommendations) {
      recList = item.recommendations
    }

    if (recList.length === 0) {
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

    // Normalisasi kandidat dosen (buang duplikat & jangan sampai pembimbing jadi penguji)
    const seenCand = new Set()
    const candidateList = []
    for (let rIdx = 0; rIdx < recList.length; rIdx++) {
      const r = recList[rIdx]
      const name = String(r.dosen?.nama || r.nama_dosen || r.nama || '').trim()
      if (name && name !== '-' && !seenCand.has(name.toLowerCase()) && name.toLowerCase() !== String(pembimbing).toLowerCase()) {
        seenCand.add(name.toLowerCase())
        candidateList.push({
          nama: name,
          rank: rIdx + 1,
          score: r.scores?.hybrid ?? r.hybrid_score ?? (1 - (rIdx * 0.05))
        })
        allExaminersSet.add(name)
      }
    }

    return {
      index: pIdx,
      id: mhsId,
      nama: mhsNama,
      judul,
      pembimbing: String(pembimbing).trim() || '-',
      noWa,
      jenisUsulan,
      candidates: candidateList,
      topCandidate: candidateList[0]?.nama || ''
    }
  })

  // Pengurutan awal agar mahasiswa yang memiliki dosen pembimbing atau topik serumpun berkumpul
  normalizedProposals.sort((a, b) => {
    if (a.pembimbing !== b.pembimbing) return a.pembimbing.localeCompare(b.pembimbing)
    return a.topCandidate.localeCompare(b.topCandidate)
  })

  // 2. Bagi Proposal ke Dalam Batch Sesi (2 - 5 Mahasiswa per Sesi)
  const sessionBatches = createSessionBatches(
    normalizedProposals, 
    minStudentsPerSession, 
    maxStudentsPerSession, 
    targetStudentsPerSession
  )

  // 3. Susun Seluruh Slot Sesi yang Tersedia (Tanggal x Sesi [Pagi/Siang] x Ruangan)
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

  // 4. State Pelacak Batasan & Workload Sesi
  // dailySessions[date][dosen] -> Jumlah sesi yang diuji dosen di tanggal tertentu (Maks 2 sesi/hari)
  const dailySessions = {}
  workingDays.forEach(d => { dailySessions[d] = {} })

  // periodSessions[dosen] -> Total sesi yang diuji dosen di periode ini (Untuk Pemerataan Round-Robin)
  const periodSessions = {}

  // dailyStudents[date][dosen] -> Total mahasiswa/judul yang diuji per hari
  const dailyStudents = {}
  workingDays.forEach(d => { dailyStudents[d] = {} })

  // periodStudents[dosen] -> Total mahasiswa/judul yang diuji dalam periode ini
  const periodStudents = {}

  // slotOccupancy[date_sessionId] -> Set dosen yang sedang menguji di slot jam tersebut (Bebas Bentrok Ruangan)
  const slotOccupancy = {}

  // roomOccupancy[date_sessionId_room] -> Penanda ruangan sudah terisi
  const roomOccupancy = {}

  const scheduled = []
  const unassigned = []
  const allExaminersList = Array.from(allExaminersSet)

  // Helper untuk mendapatkan skor kecocokan dosen terhadap satu mahasiswa
  const getExaminerScoreForStudent = (dosenName, student) => {
    const cand = student.candidates.find(c => c.nama.toLowerCase() === dosenName.toLowerCase())
    if (cand) {
      return (cand.score || 0.5) + (10 - Math.min(10, cand.rank)) * 0.05
    }
    return 0.1 // Skor dasar jika dosen adalah dosen prodi namun tidak masuk top-k rekomendasi
  }

  // 5. Alokasi Setiap Batch Sesi ke Slot & Pasangan Penguji Optimal
  let slotIndex = 0

  for (let bIdx = 0; bIdx < sessionBatches.length; bIdx++) {
    const batch = sessionBatches[bIdx]
    const batchPembimbings = new Set(
      batch.map(m => m.pembimbing.toLowerCase().trim()).filter(p => p && p !== '-')
    )

    let isBatchAssigned = false

    // Cari slot yang kosong
    while (slotIndex < availableSlots.length) {
      const slot = availableSlots[slotIndex]
      slotIndex++

      if (roomOccupancy[slot.roomKey]) continue

      const date = slot.date
      const slotKey = slot.slotKey
      if (!slotOccupancy[slotKey]) slotOccupancy[slotKey] = new Set()

      // Cari kandidat dosen yang memenuhi Hard Constraints untuk slot ini
      const eligibleExaminers = allExaminersList.filter(dosenName => {
        const dLower = dosenName.toLowerCase().trim()
        
        // 1. Bukan pembimbing dari mahasiswa mana pun di sesi ini
        if (batchPembimbings.has(dLower)) return false

        // 2. Tidak sedang menguji di ruangan lain pada sesi jam yang sama
        if (slotOccupancy[slotKey].has(dosenName)) return false

        // 3. Belum melebihi batas 2 sesi per hari (Maks Sesi Pagi & Sesi Siang)
        if ((dailySessions[date][dosenName] || 0) >= maxSessionsPerDay) return false

        return true
      })

      if (eligibleExaminers.length < 2) {
        // Tidak cukup dosen yang memenuhi syarat untuk slot ini, coba slot berikutnya
        continue
      }

      // Bangun pasangan penguji yang mungkin & terapkan Aturan Pemerataan Round-Robin Buk Alena
      const candidatePairs = []
      for (let i = 0; i < eligibleExaminers.length; i++) {
        for (let j = i + 1; j < eligibleExaminers.length; j++) {
          const d1 = eligibleExaminers[i]
          const d2 = eligibleExaminers[j]

          const s1 = periodSessions[d1] || 0
          const s2 = periodSessions[d2] || 0

          // Aturan Inti Buk Alena:
          // "tiap periode,,,prioritaskan semua dosen dapat sesi...kalau masih ad sisa baru muter lgi dosen dapat 2 sesi"
          // Dosen dengan jumlah sesi paling sedikit selalu diprioritaskan terlebih dahulu.
          const fairnessCost = (s1 + s2) * 1000 + Math.max(s1, s2) * 500

          // Skor relevansi keahlian NLP dosen terhadap seluruh mahasiswa di batch ini
          let batchNLPScore = 0
          for (const mhs of batch) {
            batchNLPScore += getExaminerScoreForStudent(d1, mhs)
            batchNLPScore += getExaminerScoreForStudent(d2, mhs)
          }

          candidatePairs.push({
            p1: d1,
            p2: d2,
            fairnessCost,
            batchNLPScore,
            // Nilai total: Minimalkan fairnessCost, maksimalkan batchNLPScore
            totalPriority: fairnessCost - batchNLPScore
          })
        }
      }

      // Urutkan pasangan penguji: Yang paling sedikit dapat sesi berada di urutan teratas!
      candidatePairs.sort((a, b) => a.totalPriority - b.totalPriority)

      if (candidatePairs.length === 0) continue

      // Ambil pasangan penguji terbaik
      const bestPair = candidatePairs[0]
      const p1Name = bestPair.p1
      const p2Name = bestPair.p2

      // Tetapkan alokasi ke slot ini
      roomOccupancy[slot.roomKey] = `BATCH-${bIdx + 1}`
      slotOccupancy[slotKey].add(p1Name)
      slotOccupancy[slotKey].add(p2Name)

      dailySessions[date][p1Name] = (dailySessions[date][p1Name] || 0) + 1
      dailySessions[date][p2Name] = (dailySessions[date][p2Name] || 0) + 1

      periodSessions[p1Name] = (periodSessions[p1Name] || 0) + 1
      periodSessions[p2Name] = (periodSessions[p2Name] || 0) + 1

      // Jadwalkan setiap mahasiswa di dalam batch ini
      batch.forEach((mhs, mIdx) => {
        const subTime = slot.session.subTimes?.[mIdx] || slot.session.time

        dailyStudents[date][p1Name] = (dailyStudents[date][p1Name] || 0) + 1
        dailyStudents[date][p2Name] = (dailyStudents[date][p2Name] || 0) + 1

        periodStudents[p1Name] = (periodStudents[p1Name] || 0) + 1
        periodStudents[p2Name] = (periodStudents[p2Name] || 0) + 1

        const p1Cand = mhs.candidates.find(c => c.nama.toLowerCase() === p1Name.toLowerCase())
        const p2Cand = mhs.candidates.find(c => c.nama.toLowerCase() === p2Name.toLowerCase())

        scheduled.push({
          id: `SCH-${1000 + mhs.index}`,
          mahasiswa_id: mhs.id,
          nama_mahasiswa: mhs.nama,
          no_wa: mhs.noWa,
          jenis_usulan: mhs.jenisUsulan,
          judul_tugas_akhir: mhs.judul,
          pembimbing: mhs.pembimbing,
          penguji_1: p1Name,
          penguji_2: p2Name,
          penguji_1_rank: p1Cand?.rank || '-',
          penguji_2_rank: p2Cand?.rank || '-',
          candidates: mhs.candidates,
          tanggal: date,
          tanggal_indo: formatIndoDate(date),
          sesi_id: slot.session.id,
          sesi_label: `${slot.session.label} (Mhs ${mIdx + 1})`,
          sesi_utama: slot.session.label,
          waktu: subTime,
          ruangan: slot.room,
          period_id: periodId,
          batch_id: `B-${bIdx + 1}`,
          batch_size: batch.length
        })
      })

      isBatchAssigned = true
      break
    }

    if (!isBatchAssigned) {
      batch.forEach(mhs => {
        unassigned.push({
          mahasiswa_id: mhs.id,
          nama_mahasiswa: mhs.nama,
          no_wa: mhs.noWa,
          jenis_usulan: mhs.jenisUsulan,
          judul_tugas_akhir: mhs.judul,
          candidates: mhs.candidates,
          reason: 'Kapasitas slot ruangan sidang habis atau seluruh dosen penguji yang memenuhi kriteria telah mencapai batas 2 sesi per hari.'
        })
      })
    }
  }

  // Urutkan jadwal berdasarkan Tanggal ASC, Sesi ASC, Ruangan ASC
  scheduled.sort((a, b) => {
    if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal)
    if (a.sesi_id !== b.sesi_id) return a.sesi_id - b.sesi_id
    if (a.ruangan !== b.ruangan) return a.ruangan.localeCompare(b.ruangan)
    return a.waktu.localeCompare(b.waktu)
  })

  // 6. Format Rekapitulasi Beban Penguji (Workload Fairness Summary)
  const examinerWorkload = allExaminersList.map(nama => {
    const totalSesi = periodSessions[nama] || 0
    const totalJudul = periodStudents[nama] || 0

    const perDaySessions = {}
    const perDayTitles = {}
    workingDays.forEach(d => {
      perDaySessions[d] = dailySessions[d][nama] || 0
      perDayTitles[d] = dailyStudents[d][nama] || 0
    })

    let roundStatus = 'Belum Ada Sesi'
    if (totalSesi === 1) roundStatus = 'Putaran 1 (1 Sesi)'
    else if (totalSesi === 2) roundStatus = 'Putaran 2 (2 Sesi)'
    else if (totalSesi > 2) roundStatus = `Putaran ${totalSesi} (${totalSesi} Sesi)`

    return {
      nama,
      totalSessions: totalSesi,
      totalTitles: totalJudul,
      total: totalJudul, // backward compatibility
      roundStatus,
      perDaySessions,
      perDayTitles,
      perDay: perDayTitles // backward compatibility
    }
  }).sort((a, b) => {
    if (b.totalSessions !== a.totalSessions) return b.totalSessions - a.totalSessions
    return b.totalTitles - a.totalTitles
  })

  return {
    period: {
      id: periodId,
      name: periodName,
      title: periodTitle,
      academicYear,
      startDate,
      endDate,
      totalDays: workingDays.length,
      workingDays
    },
    jenisSidang,
    totalRequested: proposals.length,
    totalScheduled: scheduled.length,
    totalUnassigned: unassigned.length,
    totalSessionsScheduled: sessionBatches.length,
    scheduled,
    unassigned,
    examinerWorkload,
    allExaminers: allExaminersList,
    constraints: {
      maxSessionsPerDay,
      minStudentsPerSession,
      maxStudentsPerSession,
      targetStudentsPerSession,
      ruleSummary: 'Maks. 2 Sesi/Hari (Pagi & Siang), 1 Sesi 2-5 Mhs, 1 Mhs 2 Penguji, Pemerataan Sesi (Round-Robin)'
    }
  }
}
