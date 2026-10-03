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

      const parsedPub = parseListItems(d.jurnal || d.publikasi)
      publikasiList.value = parsedPub.length ? parsedPub : ['']

      const parsedBimb = parseListItems(d.judul_bimbing || d.riwayat_bimbingan)
      bimbinganList.value = parsedBimb.length ? parsedBimb : ['']

      const parsedUji = parseListItems(d.judul_uji || d.riwayat_pengujian)
      pengujianList.value = parsedUji.length ? parsedUji : ['']
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Gagal mengambil data dosen'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchLecturerForEdit()
})

const addRow = (list) => {
  list.push('')
}

const removeRow = (list, index) => {
  if (list.length > 1) {
    list.splice(index, 1)
  } else {
    list[0] = ''
  }
}

const handleSubmit = async () => {
  if (!formData.value.nama) {
    alert('Nama dosen wajib diisi')
    return
  }

  isSaving.value = true
  errorMessage.value = null

  const eduItems = []
  if (formData.value.pendidikan_d3.trim()) eduItems.push(formData.value.pendidikan_d3.trim())
  if (formData.value.pendidikan_s1_d4.trim()) eduItems.push(formData.value.pendidikan_s1_d4.trim())
  if (formData.value.pendidikan_s2.trim()) eduItems.push(formData.value.pendidikan_s2.trim())
  if (formData.value.pendidikan_s3.trim()) eduItems.push(formData.value.pendidikan_s3.trim())

  const cleanPub = publikasiList.value.map(s => s.trim()).filter(Boolean)
  const cleanBimb = bimbinganList.value.map(s => s.trim()).filter(Boolean)
  const cleanUji = pengujianList.value.map(s => s.trim()).filter(Boolean)

  const payload = {
    nidn: formData.value.nidn.trim(),
    nama: formData.value.nama.trim(),
    program_studi: formData.value.program_studi.trim(),
    bidang_keahlian: formData.value.bidang_keahlian.trim(),
    pendidikan: eduItems.join('\n'),
    publikasi: cleanPub,
    riwayat_bimbingan: cleanBimb,
    riwayat_pengujian: cleanUji
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
  <div class="space-y-6 pb-12 animate-in font-sans">
    <!-- Header Section (Canvas-First) -->
    <div class="border-b border-gray-200 pb-5">
      <router-link 
        to="/admin/dosen" 
        class="text-base font-sans font-semibold text-gray-500 hover:text-gray-900 mb-3 inline-flex items-center gap-1.5 transition-colors"
      >
        &larr; Kembali ke Master Data Dosen
      </router-link>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-h1 font-bold tracking-tight text-gray-900 font-sans">
            {{ isEditMode ? 'Edit Data Dosen' : 'Registrasi Dosen' }}
          </h1>
          <p class="text-base text-gray-600 font-sans mt-1">
            {{ isEditMode ? 'Memperbarui data dosen ID: ' + (formData.nidn || dosenId) : 'Penambahan master data dosen dan portofolio keahlian' }}
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button 
            @click="handleSubmit"
            :disabled="isSaving" 
            type="button"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-base font-semibold text-white bg-teal-700 rounded-[4px] hover:bg-teal-800 disabled:opacity-50 transition-colors shadow-sm font-sans"
          >
            {{ isSaving ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Data') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-16 flex flex-col items-center justify-center bg-white border border-gray-200/90 rounded-lg shadow-sm">
      <div class="w-8 h-8 border-2 border-gray-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      <span class="text-base font-sans font-semibold uppercase tracking-wider text-gray-500">Memuat Formulir Dosen...</span>
    </div>

    <!-- Form Area -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[4px] text-base font-medium font-sans">
        {{ errorMessage }}
      </div>

      <!-- Section: Identitas -->
      <section class="bg-white border border-gray-200/90 rounded-lg shadow-sm overflow-hidden">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-3">
           <span class="text-tiny font-mono font-bold text-gray-500">01</span>
           <h2 class="text-h2 font-bold text-gray-900 uppercase tracking-wider font-sans">Identitas Utama</h2>
        </header>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-base font-semibold text-gray-700 font-sans">Nama Lengkap & Gelar *</label>
            <input type="text" v-model="formData.nama" required class="border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-base font-semibold text-gray-700 font-sans">NIDN</label>
            <input type="text" v-model="formData.nidn" class="border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none font-mono text-gray-900" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-base font-semibold text-gray-700 font-sans">Program Studi</label>
            <input type="text" v-model="formData.program_studi" class="border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-base font-semibold text-gray-700 font-sans">Bidang Keahlian (Pisahkan dengan koma)</label>
            <input type="text" v-model="formData.bidang_keahlian" placeholder="NLP, Machine Learning, Web Engineering" class="border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
          </div>
        </div>
      </section>

      <!-- Section: Pendidikan -->
      <section class="bg-white border border-gray-200/90 rounded-lg shadow-sm overflow-hidden">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-3">
           <span class="text-tiny font-mono font-bold text-gray-500">02</span>
           <h2 class="text-h2 font-bold text-gray-900 uppercase tracking-wider font-sans">Riwayat Pendidikan</h2>
        </header>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-base font-semibold text-gray-700 font-sans">Diploma 3 (D3)</label>
            <input type="text" v-model="formData.pendidikan_d3" placeholder="Nama kampus / jurusan D3" class="border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-base font-semibold text-gray-700 font-sans">Sarjana (S1 / D4)</label>
            <input type="text" v-model="formData.pendidikan_s1_d4" placeholder="Nama kampus / jurusan S1/D4" class="border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-base font-semibold text-gray-700 font-sans">Magister (S2)</label>
            <input type="text" v-model="formData.pendidikan_s2" placeholder="Nama kampus / jurusan S2" class="border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-base font-semibold text-gray-700 font-sans">Doktor (S3)</label>
            <input type="text" v-model="formData.pendidikan_s3" placeholder="Nama kampus / jurusan S3" class="border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
          </div>
        </div>
      </section>

      <!-- Section: Publikasi -->
      <section class="bg-white border border-gray-200/90 rounded-lg shadow-sm overflow-hidden">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
           <div class="flex items-center gap-3">
             <span class="text-tiny font-mono font-bold text-gray-500">03</span>
             <h2 class="text-h2 font-bold text-gray-900 uppercase tracking-wider font-sans">Publikasi Ilmiah</h2>
           </div>
           <button type="button" @click="addRow(publikasiList)" class="text-base font-semibold text-teal-700 hover:text-teal-800 font-sans">+ Tambah Baris</button>
        </header>
        <div class="p-6 space-y-3">
          <div v-for="(pub, idx) in publikasiList" :key="idx" class="flex items-center gap-2">
            <span class="text-tiny font-mono text-gray-400 w-6 text-center font-bold">{{ idx + 1 }}</span>
            <input type="text" v-model="publikasiList[idx]" placeholder="Judul publikasi jurnal / konferensi ilmiah..." class="flex-1 border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
            <button type="button" @click="removeRow(publikasiList, idx)" class="text-base text-red-500 hover:text-red-700 px-2 font-sans font-semibold">Hapus</button>
          </div>
        </div>
      </section>

      <!-- Section: Riwayat Bimbingan -->
      <section class="bg-white border border-gray-200/90 rounded-lg shadow-sm overflow-hidden">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
           <div class="flex items-center gap-3">
             <span class="text-tiny font-mono font-bold text-gray-500">04</span>
             <h2 class="text-h2 font-bold text-gray-900 uppercase tracking-wider font-sans">Riwayat Bimbingan Tugas Akhir</h2>
           </div>
           <button type="button" @click="addRow(bimbinganList)" class="text-base font-semibold text-teal-700 hover:text-teal-800 font-sans">+ Tambah Baris</button>
        </header>
        <div class="p-6 space-y-3">
          <div v-for="(bimb, idx) in bimbinganList" :key="idx" class="flex items-center gap-2">
            <span class="text-tiny font-mono text-gray-400 w-6 text-center font-bold">{{ idx + 1 }}</span>
            <input type="text" v-model="bimbinganList[idx]" placeholder="Judul tugas akhir mahasiswa bimbingan..." class="flex-1 border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
            <button type="button" @click="removeRow(bimbinganList, idx)" class="text-base text-red-500 hover:text-red-700 px-2 font-sans font-semibold">Hapus</button>
          </div>
        </div>
      </section>

      <!-- Section: Riwayat Pengujian -->
      <section class="bg-white border border-gray-200/90 rounded-lg shadow-sm overflow-hidden">
        <header class="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
           <div class="flex items-center gap-3">
             <span class="text-tiny font-mono font-bold text-gray-500">05</span>
             <h2 class="text-h2 font-bold text-gray-900 uppercase tracking-wider font-sans">Riwayat Pengujian Sidang</h2>
           </div>
           <button type="button" @click="addRow(pengujianList)" class="text-base font-semibold text-teal-700 hover:text-teal-800 font-sans">+ Tambah Baris</button>
        </header>
        <div class="p-6 space-y-3">
          <div v-for="(uji, idx) in pengujianList" :key="idx" class="flex items-center gap-2">
            <span class="text-tiny font-mono text-gray-400 w-6 text-center font-bold">{{ idx + 1 }}</span>
            <input type="text" v-model="pengujianList[idx]" placeholder="Judul tugas akhir yang pernah diuji..." class="flex-1 border border-gray-300 rounded-[4px] px-3.5 py-2 text-base focus:border-teal-600 focus:outline-none text-gray-900 font-sans" />
            <button type="button" @click="removeRow(pengujianList, idx)" class="text-base text-red-500 hover:text-red-700 px-2 font-sans font-semibold">Hapus</button>
          </div>
        </div>
      </section>

      <!-- Bottom Save Action -->
      <div class="flex justify-end pt-4">
        <button 
          type="submit" 
          :disabled="isSaving" 
          class="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-base font-semibold rounded-[4px] shadow-sm transition-colors font-sans"
        >
          {{ isSaving ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Simpan Data Dosen') }}
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
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
