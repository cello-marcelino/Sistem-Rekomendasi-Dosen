<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const dosens = ref([])
const loading = ref(true)
const showForm = ref(false)
const formMode = ref('add') // 'add' or 'edit'
const form = ref({
  id: null,
  nidn: '',
  nama: '',
  program_studi: '',
  pendidikan: '',
  bidang_keahlian: '',
  publikasi: '',
  riwayat_bimbingan: ''
})

const fetchDosen = async () => {
  loading.value = true
  try {
    const res = await api.get('/dosen')
    dosens.value = res.data.data
  } catch (error) {
    console.error('Failed to fetch dosen', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDosen()
})

const editDosen = (d) => {
  formMode.value = 'edit'
  form.value = {
    id: d.id,
    nidn: d.nidn || '',
    nama: d.nama || '',
    program_studi: d.program_studi || '',
    pendidikan: d.pendidikan || '',
    bidang_keahlian: d.bidang_keahlian || '',
    publikasi: d.publikasi ? d.publikasi.join('\n') : '',
    riwayat_bimbingan: d.riwayat_bimbingan ? d.riwayat_bimbingan.join('\n') : ''
  }
  showForm.value = true
}

const addDosen = () => {
  formMode.value = 'add'
  form.value = {
    id: null, nidn: '', nama: '', program_studi: '', pendidikan: '', bidang_keahlian: '', publikasi: '', riwayat_bimbingan: ''
  }
  showForm.value = true
}

const submitForm = async () => {
  const payload = {
    nidn: form.value.nidn,
    nama: form.value.nama,
    program_studi: form.value.program_studi,
    pendidikan: form.value.pendidikan,
    bidang_keahlian: form.value.bidang_keahlian,
    publikasi: form.value.publikasi.split('\n').filter(x => x.trim()),
    riwayat_bimbingan: form.value.riwayat_bimbingan.split('\n').filter(x => x.trim())
  }
  
  try {
    if (formMode.value === 'add') {
      await api.post('/admin/dosen', payload)
    } else {
      await api.put(`/admin/dosen/${form.value.id}`, payload)
    }
    showForm.value = false
    fetchDosen()
  } catch (err) {
    alert('Gagal menyimpan dosen: ' + (err.response?.data?.error || err.message))
  }
}

const deleteDosen = async (id) => {
  if (confirm('Yakin ingin menghapus dosen ini?')) {
    try {
      await api.delete(`/admin/dosen/${id}`)
      fetchDosen()
    } catch (err) {
      alert('Gagal menghapus dosen')
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kelola Data Dosen</h1>
        <p class="text-gray-500">Dashboard Admin TA</p>
      </div>
      <button @click="addDosen" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
        + Tambah Dosen
      </button>
    </div>

    <!-- Modal Form -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 dark:text-white">{{ formMode === 'add' ? 'Tambah' : 'Edit' }} Dosen</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 dark:text-gray-300">NIDN</label>
              <input v-model="form.nidn" type="text" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 dark:text-gray-300">Nama Lengkap</label>
              <input v-model="form.nama" type="text" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 dark:text-gray-300">Program Studi</label>
              <input v-model="form.program_studi" type="text" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 dark:text-gray-300">Pendidikan</label>
              <input v-model="form.pendidikan" type="text" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1 dark:text-gray-300">Bidang Keahlian</label>
              <textarea v-model="form.bidang_keahlian" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="2" required></textarea>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1 dark:text-gray-300">Publikasi (1 per baris)</label>
              <textarea v-model="form.publikasi" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3"></textarea>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1 dark:text-gray-300">Riwayat Bimbingan (1 per baris)</label>
              <textarea v-model="form.riwayat_bimbingan" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showForm = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Batal</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            <th class="px-6 py-3">Nama</th>
            <th class="px-6 py-3">NIDN</th>
            <th class="px-6 py-3">Prodi</th>
            <th class="px-6 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="4" class="text-center py-4">Memuat data...</td></tr>
          <tr v-for="d in dosens" :key="d.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ d.nama }}</td>
            <td class="px-6 py-4">{{ d.nidn }}</td>
            <td class="px-6 py-4">{{ d.program_studi }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="editDosen(d)" class="text-blue-600 hover:underline mr-3">Edit</button>
              <button @click="deleteDosen(d.id)" class="text-red-600 hover:underline">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
