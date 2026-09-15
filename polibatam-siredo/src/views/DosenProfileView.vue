<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const dosenId = computed(() => route.params.id)
const dosen = ref(null)
const isLoading = ref(true)
const errorMessage = ref(null)
const activePortfolioTab = ref('jurnal') // 'jurnal' | 'bimbingan' | 'pengujian'

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

const parseEducationList = (str) => {
  if (!str || typeof str !== 'string') return []
  const trimmed = str.trim()
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null') return []
  
  const regex = /(?=Sarjana|Magister|Doktor|Diploma|S1|S2|S3|D3|D4)/i
  let items = []
  if (trimmed.includes('\n')) {
    items = trimmed.split('\n')
  } else if (trimmed.includes(', ') && regex.test(trimmed)) {
    items = trimmed.split(/,\s*(?=Sarjana|Magister|Doktor|Diploma|S1|S2|S3|D3|D4)/i)
  } else {
    items = trimmed.split(/,|;/)
  }
  return items.map(s => s.trim()).filter(Boolean)
}

const fetchDetail = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const res = await api.get(`/admin/dosen/${dosenId.value}`)
    dosen.value = res.data.data
  } catch (err) {
    try {
      const fallback = await api.get(`/dosen/${dosenId.value}`)
      dosen.value = fallback.data.data
    } catch (fallbackErr) {
      errorMessage.value = err.response?.data?.message || err.message || 'Gagal memuat detail data dosen'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})

const getAvatarBg = (nama) => {
  if (!nama) return '#0d9488'
  const colors = ['#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash += nama.charCodeAt(i)
  return colors[hash % colors.length]
}

const goBack = () => {
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    router.push('/dosen')
  }
}

const educationList = computed(() => parseEducationList(dosen.value?.pendidikan))
const jurnalList = computed(() => parseListItems(dosen.value?.jurnal || dosen.value?.publikasi))
const bimbinganList = computed(() => parseListItems(dosen.value?.judul_bimbing || dosen.value?.riwayat_bimbingan))
const pengujianList = computed(() => parseListItems(dosen.value?.judul_uji || dosen.value?.riwayat_pengujian))
</script>

<template>
  <div class="w-full min-h-full flex flex-col animate-in">
    <!-- Header -->
    <div class="py-6 lg:py-10 border-b border-gray-200 px-6 lg:px-8 bg-white flex flex-col lg:flex-row justify-between lg:items-end gap-6 shrink-0">
      <div class="max-w-4xl">
        <button 
          @click="goBack" 
          class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1"
        >
          &larr; KEMBALI
        </button>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-2 font-sans line-clamp-2">
          {{ dosen ? dosen.nama : 'Profil Dosen' }}
        </h1>
        <div class="flex items-center gap-3 text-sm text-gray-500 font-mono">
           <span v-if="dosen?.nidn">NIDN: {{ dosen.nidn }}</span>
           <span v-if="dosen?.program_studi" class="border-l border-gray-300 pl-3 text-teal-700">{{ dosen.program_studi }}</span>
        </div>
      </div>
    </div>

    <!-- State: Loading / Error -->
    <div v-if="isLoading" class="flex-1 p-20 flex flex-col items-center justify-center bg-gray-50">
      <div class="w-8 h-8 border-2 border-gray-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      <span class="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">Memuat Profil...</span>
    </div>

    <div v-else-if="errorMessage" class="flex-1 p-12 bg-red-50 text-red-700 flex flex-col items-center justify-center">
      <p class="font-bold text-sm mb-4">{{ errorMessage }}</p>
      <button @click="goBack" class="px-4 py-2 border border-red-200 bg-white text-xs font-bold hover:bg-gray-50">Kembali</button>
    </div>

    <!-- Split View Layout -->
    <div v-else-if="dosen" class="flex-1 grid grid-cols-1 lg:grid-cols-12 bg-white">
      
      <!-- Left: Identity & Metadata (4 Cols) -->
      <aside class="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50/50 p-6 lg:p-8 flex flex-col gap-10">
        
        <div>
          <div class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-4">Bidang Keahlian</div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(tag, idx) in (dosen.bidang_keahlian ? dosen.bidang_keahlian.split(',') : [])" 
              :key="idx" 
              class="px-2.5 py-1 border border-teal-200 bg-teal-50 text-teal-800 text-[11px] font-bold"
            >
              {{ tag.trim() }}
            </span>
            <span v-if="!dosen.bidang_keahlian" class="text-xs text-gray-400 italic">Belum terdata</span>
          </div>
        </div>

        <div>
          <div class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-4">Riwayat Pendidikan</div>
          <div class="border border-gray-200 rounded-sm divide-y divide-gray-200 bg-white text-xs">
             <div v-for="(edu, idx) in educationList" :key="idx" class="p-3 text-gray-700 leading-relaxed font-mono">
               {{ edu }}
             </div>
             <div v-if="!educationList.length" class="p-3 text-gray-400 italic">Kosong</div>
          </div>
        </div>

      </aside>

      <!-- Right: Portfolios (8 Cols) -->
      <main class="lg:col-span-8 flex flex-col min-h-0">
        <!-- Tabs -->
        <div class="flex border-b border-gray-200 bg-gray-50 w-full divide-x divide-gray-200">
          <button 
            @click="activePortfolioTab = 'jurnal'"
            class="flex-1 p-4 flex items-center justify-center gap-2 hover:bg-white transition-colors"
            :class="activePortfolioTab === 'jurnal' ? 'bg-white border-b-2 border-b-teal-600' : ''"
          >
            <span class="text-xs font-mono font-bold uppercase tracking-widest" :class="activePortfolioTab === 'jurnal' ? 'text-teal-600' : 'text-gray-500'">Publikasi</span>
            <span class="bg-gray-200 text-gray-700 px-1.5 py-0.5 text-[10px] font-mono font-bold tabular-nums">{{ jurnalList.length }}</span>
          </button>
          <button 
            @click="activePortfolioTab = 'bimbingan'"
            class="flex-1 p-4 flex items-center justify-center gap-2 hover:bg-white transition-colors"
            :class="activePortfolioTab === 'bimbingan' ? 'bg-white border-b-2 border-b-teal-600' : ''"
          >
            <span class="text-xs font-mono font-bold uppercase tracking-widest" :class="activePortfolioTab === 'bimbingan' ? 'text-teal-600' : 'text-gray-500'">Bimbingan</span>
            <span class="bg-gray-200 text-gray-700 px-1.5 py-0.5 text-[10px] font-mono font-bold tabular-nums">{{ bimbinganList.length }}</span>
          </button>
          <button 
            @click="activePortfolioTab = 'pengujian'"
            class="flex-1 p-4 flex items-center justify-center gap-2 hover:bg-white transition-colors"
            :class="activePortfolioTab === 'pengujian' ? 'bg-white border-b-2 border-b-teal-600' : ''"
          >
            <span class="text-xs font-mono font-bold uppercase tracking-widest" :class="activePortfolioTab === 'pengujian' ? 'text-teal-600' : 'text-gray-500'">Pengujian</span>
            <span class="bg-gray-200 text-gray-700 px-1.5 py-0.5 text-[10px] font-mono font-bold tabular-nums">{{ pengujianList.length }}</span>
          </button>
        </div>

        <!-- Lists -->
        <div class="flex-1 overflow-y-auto bg-white">
           <table v-if="activePortfolioTab === 'jurnal' && jurnalList.length" class="w-full text-left text-xs">
             <tbody class="divide-y divide-gray-200">
               <tr v-for="(j, idx) in jurnalList" :key="idx" class="hover:bg-gray-50">
                 <td class="p-4 align-top w-12 text-center font-mono text-gray-400">{{ idx + 1 }}</td>
                 <td class="p-4 text-gray-900 leading-relaxed font-medium">{{ j }}</td>
               </tr>
             </tbody>
           </table>
           <table v-else-if="activePortfolioTab === 'bimbingan' && bimbinganList.length" class="w-full text-left text-xs">
             <tbody class="divide-y divide-gray-200">
               <tr v-for="(b, idx) in bimbinganList" :key="idx" class="hover:bg-gray-50">
                 <td class="p-4 align-top w-12 text-center font-mono text-gray-400">{{ idx + 1 }}</td>
                 <td class="p-4 text-gray-900 leading-relaxed font-medium">{{ b }}</td>
               </tr>
             </tbody>
           </table>
           <table v-else-if="activePortfolioTab === 'pengujian' && pengujianList.length" class="w-full text-left text-xs">
             <tbody class="divide-y divide-gray-200">
               <tr v-for="(u, idx) in pengujianList" :key="idx" class="hover:bg-gray-50">
                 <td class="p-4 align-top w-12 text-center font-mono text-gray-400">{{ idx + 1 }}</td>
                 <td class="p-4 text-gray-900 leading-relaxed font-medium">{{ u }}</td>
               </tr>
             </tbody>
           </table>

           <div v-else class="flex items-center justify-center h-48 text-[11px] font-mono uppercase tracking-widest text-gray-400">
             Kosong / Tidak Ada Data
           </div>
        </div>

      </main>
    </div>
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
