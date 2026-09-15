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
  <div class="w-full flex flex-col animate-in bg-white h-full">
    <!-- Header -->
    <div class="py-6 lg:py-10 border-b border-gray-200 shrink-0 w-full px-6 lg:px-8 flex justify-between items-end bg-white">
      <div class="max-w-3xl">
        <router-link to="/admin/dosen" class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1">
          &larr; KEMBALI
        </router-link>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2 font-sans">
          {{ isEditMode ? 'Edit Data Dosen' : 'Registrasi Dosen' }}
        </h1>
        <p class="text-sm text-gray-600 m-0 font-mono">
          {{ isEditMode ? formData.nidn || 'ID: ' + dosenId : 'Penambahan master data dosen dan portfolio keahlian' }}
        </p>
      </div>
      <button 
        @click="handleSubmit"
        :disabled="isSaving" 
        class="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-semibold rounded-[4px] transition-colors shadow-sm hidden md:block"
      >
        {{ isSaving ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Data') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center p-20 min-h-[400px]">
      <div class="w-8 h-8 border-2 border-gray-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      <span class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">Memuat Data...</span>
    </div>

    <!-- Form Area -->
    <form v-else @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-6 lg:px-8 py-8 flex flex-col gap-8 bg-gray-50">
      
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[4px] text-xs font-bold font-mono">
        {{ errorMessage }}
      </div>

      <!-- Section: Identitas -->
      <section class="border border-gray-200 bg-white">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-4">
           <span class="text-[10px] font-mono font-bold text-gray-500">01</span>
           <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest font-mono">Identitas Utama</h2>
        </header>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700">Nama Lengkap & Gelar *</label>
            <input type="text" v-model="formData.nama" required class="border border-gray-300 rounded-[4px] px-3 py-2 text-sm focus:border-teal-500 focus:outline-none text-gray-900" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700">NIDN</label>
            <input type="text" v-model="formData.nidn" class="border border-gray-300 rounded-[4px] px-3 py-2 text-sm focus:border-teal-500 focus:outline-none font-mono text-gray-900" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700">Program Studi</label>
            <input type="text" v-model="formData.program_studi" class="border border-gray-300 rounded-[4px] px-3 py-2 text-sm focus:border-teal-500 focus:outline-none text-gray-900" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700">Bidang Keahlian (Koma)</label>
            <input type="text" v-model="formData.bidang_keahlian" class="border border-gray-300 rounded-[4px] px-3 py-2 text-sm focus:border-teal-500 focus:outline-none text-gray-900" />
          </div>
        </div>
      </section>

      <!-- Section: Pendidikan -->
      <section class="border border-gray-200 bg-white">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-4">
           <span class="text-[10px] font-mono font-bold text-gray-500">02</span>
           <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest font-mono">Riwayat Pendidikan</h2>
        </header>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700">Diploma 3 (D3)</label>
            <input type="text" v-model="formData.pendidikan_d3" class="border border-gray-300 rounded-[4px] px-3 py-2 text-sm focus:border-teal-500 focus:outline-none text-gray-900" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700">Sarjana (S1/D4)</label>
            <input type="text" v-model="formData.pendidikan_s1_d4" class="border border-gray-300 rounded-[4px] px-3 py-2 text-sm focus:border-teal-500 focus:outline-none text-gray-900" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700">Magister (S2)</label>
            <input type="text" v-model="formData.pendidikan_s2" class="border border-gray-300 rounded-[4px] px-3 py-2 text-sm focus:border-teal-500 focus:outline-none text-gray-900" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-700">Doktor (S3)</label>
            <input type="text" v-model="formData.pendidikan_s3" class="border border-gray-300 rounded-[4px] px-3 py-2 text-sm focus:border-teal-500 focus:outline-none text-gray-900" />
          </div>
        </div>
      </section>

      <!-- Section: Publikasi -->
      <section class="border border-gray-200 bg-white">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
           <div class="flex items-center gap-4">
             <span class="text-[10px] font-mono font-bold text-gray-500">03</span>
             <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest font-mono">Publikasi Jurnal</h2>
           </div>
           <button type="button" @click="addPublikasi" class="text-[10px] font-mono font-bold text-teal-600 border border-teal-200 px-3 py-1 hover:bg-teal-50 bg-white">
             + TAMBAH
           </button>
        </header>
        <div class="p-0 divide-y divide-gray-200">
           <div v-for="(item, idx) in publikasiList" :key="idx" class="flex items-center px-6 py-3 bg-white">
             <span class="w-8 text-[10px] font-mono text-gray-400">#{{ idx + 1 }}</span>
             <input type="text" v-model="publikasiList[idx]" class="flex-1 bg-transparent border-none text-sm focus:outline-none text-gray-900" placeholder="Judul Publikasi..." />
             <button type="button" @click="removePublikasi(idx)" class="text-red-500 hover:text-red-700 text-xs font-bold font-mono ml-4">HAPUS</button>
           </div>
        </div>
      </section>

      <!-- Section: Bimbingan -->
      <section class="border border-gray-200 bg-white">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
           <div class="flex items-center gap-4">
             <span class="text-[10px] font-mono font-bold text-gray-500">04</span>
             <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest font-mono">Riwayat Bimbingan</h2>
           </div>
           <button type="button" @click="addBimbingan" class="text-[10px] font-mono font-bold text-teal-600 border border-teal-200 px-3 py-1 hover:bg-teal-50 bg-white">
             + TAMBAH
           </button>
        </header>
        <div class="p-0 divide-y divide-gray-200">
           <div v-for="(item, idx) in bimbinganList" :key="idx" class="flex items-center px-6 py-3 bg-white">
             <span class="w-8 text-[10px] font-mono text-gray-400">#{{ idx + 1 }}</span>
             <input type="text" v-model="bimbinganList[idx]" class="flex-1 bg-transparent border-none text-sm focus:outline-none text-gray-900" placeholder="Judul Skripsi Bimbingan..." />
             <button type="button" @click="removeBimbingan(idx)" class="text-red-500 hover:text-red-700 text-xs font-bold font-mono ml-4">HAPUS</button>
           </div>
        </div>
      </section>

      <!-- Section: Pengujian -->
      <section class="border border-gray-200 bg-white mb-20">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
           <div class="flex items-center gap-4">
             <span class="text-[10px] font-mono font-bold text-gray-500">05</span>
             <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest font-mono">Riwayat Pengujian</h2>
           </div>
           <button type="button" @click="addPengujian" class="text-[10px] font-mono font-bold text-teal-600 border border-teal-200 px-3 py-1 hover:bg-teal-50 bg-white">
             + TAMBAH
           </button>
        </header>
        <div class="p-0 divide-y divide-gray-200">
           <div v-for="(item, idx) in pengujianList" :key="idx" class="flex items-center px-6 py-3 bg-white">
             <span class="w-8 text-[10px] font-mono text-gray-400">#{{ idx + 1 }}</span>
             <input type="text" v-model="pengujianList[idx]" class="flex-1 bg-transparent border-none text-sm focus:outline-none text-gray-900" placeholder="Judul Sidang Pengujian..." />
             <button type="button" @click="removePengujian(idx)" class="text-red-500 hover:text-red-700 text-xs font-bold font-mono ml-4">HAPUS</button>
           </div>
        </div>
      </section>
      
      <!-- Mobile Sticky Action -->
      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden z-10 flex gap-4">
        <router-link to="/admin/dosen" class="flex-1 text-center py-3 bg-gray-100 text-gray-700 font-bold text-xs rounded-[4px]">Batal</router-link>
        <button type="submit" :disabled="isSaving" class="flex-1 py-3 bg-teal-600 text-white font-bold text-xs rounded-[4px]">
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
