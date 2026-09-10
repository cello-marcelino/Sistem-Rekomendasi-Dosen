<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => !!route.params.id)
const dosenId = computed(() => route.params.id)

const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref(null)

const formData = ref({
  nidn: '',
  nama: '',
  program_studi: 'Teknik Informatika',
  bidang_keahlian: '',
  pendidikan_d3: '',
  pendidikan_s1_d4: '',
  pendidikan_s2: '',
  pendidikan_s3: ''
})

const publikasiList = ref([''])
const bimbinganList = ref([''])
const pengujianList = ref([''])

const parseListItems = (str) => {
  if (!str) return []
  if (Array.isArray(str)) return str.filter(Boolean)
  if (typeof str !== 'string') return []
  const trimmed = str.trim()
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null') return []
  
  const matches = trimmed.match(/"([^"]+)"/g)
  if (matches && matches.length > 0) {
    return matches.map(m => m.replace(/(^"|"$)/g, '').trim()).filter(Boolean)
  }
  return trimmed.split(/\n|;|•|\r/).map(s => s.replace(/^[0-9]+[.)]\s*/, '').trim()).filter(Boolean)
}

const parseEducationToFields = (str) => {
  if (!str || typeof str !== 'string') return
  const trimmed = str.trim()
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'nan') return

  let items = []
  if (trimmed.includes('\n')) {
    items = trimmed.split('\n')
  } else if (trimmed.includes(', ') && /(?=Sarjana|Magister|Doktor|Diploma|S1|S2|S3|D3|D4)/i.test(trimmed)) {
    items = trimmed.split(/,\s*(?=Sarjana|Magister|Doktor|Diploma|S1|S2|S3|D3|D4)/i)
  } else {
    items = trimmed.split(/,|;/)
  }

  items.forEach(item => {
    const s = item.trim()
    if (/d3|diploma\s*(3|iii)/i.test(s)) {
      formData.value.pendidikan_d3 = s
    } else if (/s3|doktor|ph\.?d/i.test(s)) {
      formData.value.pendidikan_s3 = s
    } else if (/s2|magister|master/i.test(s)) {
      formData.value.pendidikan_s2 = s
    } else if (/s1|sarjana|d4|div|diploma\s*(4|iv)/i.test(s)) {
      formData.value.pendidikan_s1_d4 = s
    } else {
      if (!formData.value.pendidikan_s1_d4) {
        formData.value.pendidikan_s1_d4 = s
      } else if (!formData.value.pendidikan_s2) {
        formData.value.pendidikan_s2 = s
      }
    }
  })
}

const fetchLecturerForEdit = async () => {
  if (!isEditMode.value) return
  isLoading.value = true
  errorMessage.value = null
  try {
    let d = null
    try {
      const res = await api.get(`/admin/dosen/${dosenId.value}`)
      d = res.data.data
    } catch (adminErr) {
      const resFallback = await api.get(`/dosen/${dosenId.value}`)
      d = resFallback.data.data
    }

    if (d) {
      formData.value.nidn = d.nidn || ''
      formData.value.nama = d.nama || ''
      formData.value.program_studi = d.program_studi || 'Teknik Informatika'
      formData.value.bidang_keahlian = d.bidang_keahlian || ''
      
      parseEducationToFields(d.pendidikan)

      const pubs = parseListItems(d.jurnal || d.publikasi)
      publikasiList.value = pubs.length > 0 ? pubs : ['']

      const bimbs = parseListItems(d.judul_bimbing || d.riwayat_bimbingan)
      bimbinganList.value = bimbs.length > 0 ? bimbs : ['']

      const ujis = parseListItems(d.judul_uji || d.riwayat_pengujian)
      pengujianList.value = ujis.length > 0 ? ujis : ['']
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Gagal memuat data dosen untuk diedit'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchLecturerForEdit()
})

// Dynamic Array Helpers
const addPublikasi = () => publikasiList.value.push('')
const removePublikasi = (idx) => {
  publikasiList.value.splice(idx, 1)
  if (publikasiList.value.length === 0) publikasiList.value.push('')
}

const addBimbingan = () => bimbinganList.value.push('')
const removeBimbingan = (idx) => {
  bimbinganList.value.splice(idx, 1)
  if (bimbinganList.value.length === 0) bimbinganList.value.push('')
}

const addPengujian = () => pengujianList.value.push('')
const removePengujian = (idx) => {
  pengujianList.value.splice(idx, 1)
  if (pengujianList.value.length === 0) pengujianList.value.push('')
}

const handleSubmit = async () => {
  if (!formData.value.nama) {
    errorMessage.value = 'Nama lengkap dosen wajib diisi'
    return
  }

  isSaving.value = true
  errorMessage.value = null

  // Combine education levels
  const eduParts = []
  if (formData.value.pendidikan_d3?.trim()) eduParts.push(formData.value.pendidikan_d3.trim())
  if (formData.value.pendidikan_s1_d4?.trim()) eduParts.push(formData.value.pendidikan_s1_d4.trim())
  if (formData.value.pendidikan_s2?.trim()) eduParts.push(formData.value.pendidikan_s2.trim())
  if (formData.value.pendidikan_s3?.trim()) eduParts.push(formData.value.pendidikan_s3.trim())
  const combinedPendidikan = eduParts.join(', ')

  const cleanList = (arr) => arr.map(s => s.trim()).filter(Boolean)

  const payload = {
    nidn: formData.value.nidn,
    nama: formData.value.nama,
    program_studi: formData.value.program_studi,
    bidang_keahlian: formData.value.bidang_keahlian,
    pendidikan: combinedPendidikan,
    publikasi: cleanList(publikasiList.value),
    riwayat_bimbingan: cleanList(bimbinganList.value),
    riwayat_pengujian: cleanList(pengujianList.value)
  }

  try {
    if (isEditMode.value) {
      await api.put(`/admin/dosen/${dosenId.value}`, payload)
    } else {
      await api.post('/admin/dosen', payload)
    }
    router.push('/admin/dosen')
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Gagal menyimpan data dosen'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto animate-in">
    <!-- Page Header -->
    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <router-link to="/admin/dosen" class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors mb-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Manajemen Dosen
      </router-link>
      <h1 class="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
        {{ isEditMode ? 'Edit Data Dosen' : 'Tambah Dosen Pembimbing Baru' }}
      </h1>
      <p class="text-xs text-gray-500 mt-1">Lengkapi formulir di bawah ini untuk menyimpan data master dosen dan riwayat portfolio akademiknya.</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center min-h-[350px]">
      <div class="w-10 h-10 border-4 border-gray-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <span class="text-gray-500 text-sm font-medium">Memuat data formulir dosen...</span>
    </div>

    <!-- Form Body -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        {{ errorMessage }}
      </div>

      <!-- Section 1: Identitas & Keahlian Utama -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gray-50/70 border-b border-gray-200 font-bold text-sm text-gray-900 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">1</span>
          <span>Identitas & Keahlian Utama</span>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="nama" class="text-xs font-semibold text-gray-700">Nama Lengkap & Gelar *</label>
              <input 
                id="nama" 
                type="text" 
                v-model="formData.nama" 
                placeholder="Contoh: Dr. Supardianto, S.ST., M.Eng" 
                required 
                class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div class="space-y-1.5">
              <label for="nidn" class="text-xs font-semibold text-gray-700">NIDN / Kode Dosen</label>
              <input 
                id="nidn" 
                type="text" 
                v-model="formData.nidn" 
                placeholder="Contoh: 0012058901" 
                class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="prodi" class="text-xs font-semibold text-gray-700">Program Studi</label>
              <input 
                id="prodi" 
                type="text" 
                v-model="formData.program_studi" 
                placeholder="Contoh: Teknik Informatika / TRPL / Geomatika" 
                class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div class="space-y-1.5">
              <label for="keahlian" class="text-xs font-semibold text-gray-700">Bidang Keahlian Utama (Pisahkan dengan koma)</label>
              <input 
                id="keahlian" 
                type="text" 
                v-model="formData.bidang_keahlian" 
                placeholder="Contoh: Artificial Intelligence, Machine Learning, NLP" 
                class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Riwayat Pendidikan Formal -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gray-50/70 border-b border-gray-200 font-bold text-sm text-gray-900 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">2</span>
          <span>Riwayat Pendidikan Formal</span>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="edu-d3" class="text-xs font-semibold text-gray-700">Diploma 3 (D3)</label>
              <input 
                id="edu-d3" 
                type="text" 
                v-model="formData.pendidikan_d3" 
                placeholder="Contoh: D3 Teknik Informatika Politeknik Negeri Batam" 
                class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div class="space-y-1.5">
              <label for="edu-s1" class="text-xs font-semibold text-gray-700">Sarjana / Terapan (S1 / D4)</label>
              <input 
                id="edu-s1" 
                type="text" 
                v-model="formData.pendidikan_s1_d4" 
                placeholder="Contoh: S1 Ilmu Komputer Universitas Indonesia" 
                class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="edu-s2" class="text-xs font-semibold text-gray-700">Magister (S2)</label>
              <input 
                id="edu-s2" 
                type="text" 
                v-model="formData.pendidikan_s2" 
                placeholder="Contoh: S2 Teknik Elektro & Informatika Institut Teknologi Bandung" 
                class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div class="space-y-1.5">
              <label for="edu-s3" class="text-xs font-semibold text-gray-700">Doktor (S3 / Ph.D)</label>
              <input 
                id="edu-s3" 
                type="text" 
                v-model="formData.pendidikan_s3" 
                placeholder="Contoh: S3 Computer Science Universite Grenoble Alpes" 
                class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Publikasi Jurnal (Multi Field) -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden border-t-4 border-t-teal-600">
        <div class="px-6 py-4 bg-teal-50/40 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">3</span>
            <span class="font-bold text-sm text-gray-900">
              Publikasi Jurnal & Makalah Ilmiah ({{ publikasiList.filter(s => s.trim()).length }} Judul)
            </span>
          </div>
          <button 
            type="button" 
            @click="addPublikasi" 
            class="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Judul Jurnal</span>
          </button>
        </div>
        <div class="p-6 space-y-3">
          <div v-for="(item, idx) in publikasiList" :key="idx" class="flex items-center gap-2.5">
            <span class="px-2 py-1 bg-teal-50 text-teal-800 border border-teal-200 text-xs font-mono font-bold rounded shrink-0">
              #{{ idx + 1 }}
            </span>
            <input 
              type="text" 
              v-model="publikasiList[idx]" 
              placeholder="Masukkan judul publikasi jurnal atau paper ilmiah..." 
              class="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
            <button 
              type="button" 
              @click="removePublikasi(idx)" 
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus baris ini"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Section 4: Riwayat Bimbingan Skripsi (Multi Field) -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden border-t-4 border-t-blue-600">
        <div class="px-6 py-4 bg-blue-50/40 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">4</span>
            <span class="font-bold text-sm text-gray-900">
              Riwayat Bimbingan Tugas Akhir / Skripsi ({{ bimbinganList.filter(s => s.trim()).length }} Judul)
            </span>
          </div>
          <button 
            type="button" 
            @click="addBimbingan" 
            class="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Judul Bimbingan</span>
          </button>
        </div>
        <div class="p-6 space-y-3">
          <div v-for="(item, idx) in bimbinganList" :key="idx" class="flex items-center gap-2.5">
            <span class="px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-mono font-bold rounded shrink-0">
              #{{ idx + 1 }}
            </span>
            <input 
              type="text" 
              v-model="bimbinganList[idx]" 
              placeholder="Masukkan judul tugas akhir / skripsi mahasiswa yang dibimbing..." 
              class="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button 
              type="button" 
              @click="removeBimbingan(idx)" 
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus baris ini"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Section 5: Riwayat Pengujian Sidang (Multi Field) -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden border-t-4 border-t-purple-600">
        <div class="px-6 py-4 bg-purple-50/40 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs flex items-center justify-center font-bold">5</span>
            <span class="font-bold text-sm text-gray-900">
              Riwayat Pengujian Sidang Skripsi ({{ pengujianList.filter(s => s.trim()).length }} Judul)
            </span>
          </div>
          <button 
            type="button" 
            @click="addPengujian" 
            class="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah Judul Pengujian</span>
          </button>
        </div>
        <div class="p-6 space-y-3">
          <div v-for="(item, idx) in pengujianList" :key="idx" class="flex items-center gap-2.5">
            <span class="px-2 py-1 bg-purple-50 text-purple-800 border border-purple-200 text-xs font-mono font-bold rounded shrink-0">
              #{{ idx + 1 }}
            </span>
            <input 
              type="text" 
              v-model="pengujianList[idx]" 
              placeholder="Masukkan judul sidang skripsi yang diuji..." 
              class="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            />
            <button 
              type="button" 
              @click="removePengujian(idx)" 
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus baris ini"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <router-link 
          to="/admin/dosen" 
          class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors border border-gray-200"
        >
          Batal
        </router-link>
        <button 
          type="submit" 
          :disabled="isSaving" 
          class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
        >
          <div v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>{{ isSaving ? 'Menyimpan Data...' : (isEditMode ? 'Simpan Perubahan Dosen' : 'Tambah Data Dosen') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fade-in 0.3s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
