<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  dosen: Object,
  xai: Object
})

defineEmits(['close'])

const showAllRecords = ref(false)

const parseListItems = (str) => {
  if (!str || typeof str !== 'string') return []
  const trimmed = str.trim()
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null') {
    return []
  }
  const matches = trimmed.match(/"([^"]+)"/g)
  if (matches && matches.length > 0) {
    return matches
      .map(m => m.replace(/(^"|"$)/g, '').trim())
      .filter(j => j.length > 0 && j !== '-')
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed.replace(/'/g, '"'))
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    } catch {}
  }
  return trimmed
    .split(/\n|;|•|\r/)
    .map(s => s.replace(/^[0-9]+[.)]\s*/, '').trim())
    .filter(s => s.length > 0 && s !== '-')
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

const matchTerms = computed(() => {
  const terms = new Set()
  if (Array.isArray(props.xai?.irisan_kata)) {
    props.xai.irisan_kata.forEach(k => {
      if (k && k.trim().length >= 3) terms.add(k.trim().toLowerCase())
    })
  }
  if (Array.isArray(props.xai?.topik_dosen)) {
    props.xai.topik_dosen.forEach(t => {
      if (t && t.trim().length >= 3) {
        t.trim().toLowerCase().split(/\s+/).forEach(word => {
          if (word.length >= 3) terms.add(word)
        })
      }
    })
  }
  return Array.from(terms)
})

const filterRelevant = (items) => {
  if (matchTerms.value.length === 0) return items
  return items.filter(item => {
    const lower = item.toLowerCase()
    return matchTerms.value.some(term => lower.includes(term))
  })
}

const allJurnalList = computed(() => parseListItems(props.dosen?.jurnal))
const allBimbinganList = computed(() => parseListItems(props.dosen?.judul_bimbing))
const allUjiList = computed(() => parseListItems(props.dosen?.judul_uji))
const pendidikanList = computed(() => parseEducationList(props.dosen?.pendidikan))

const displayJurnalList = computed(() => {
  if (showAllRecords.value) return allJurnalList.value
  return filterRelevant(allJurnalList.value)
})

const displayBimbinganList = computed(() => {
  if (showAllRecords.value) return allBimbinganList.value
  return filterRelevant(allBimbinganList.value)
})

const displayUjiList = computed(() => {
  if (showAllRecords.value) return allUjiList.value
  return filterRelevant(allUjiList.value)
})
</script>

<template>
  <div v-if="isOpen && dosen" class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in" @click.self="$emit('close')">
    <div class="bg-white border border-gray-300 w-full max-w-5xl max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-start shrink-0">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5">{{ dosen.program_studi }}</span>
            <span v-if="dosen.nidn" class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5">NIDN: {{ dosen.nidn }}</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 font-sans tracking-tight">{{ dosen.nama }}</h3>
        </div>
        <button @click="$emit('close')" class="p-1 hover:bg-gray-200 text-gray-500 transition-colors">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto flex-1 bg-white flex flex-col gap-8">
        
        <!-- 1. Bidang Keahlian & Pendidikan -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border border-gray-200">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Bidang Keahlian</div>
            <div class="p-4 text-sm font-bold text-gray-900">{{ dosen.bidang_keahlian || '-' }}</div>
          </div>
          <div class="border border-gray-200">
            <div class="bg-gray-50 border-b border-gray-200 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Riwayat Pendidikan</div>
            <div class="p-0 divide-y divide-gray-200">
              <div v-for="(edu, idx) in pendidikanList" :key="idx" class="px-4 py-3 text-xs font-mono text-gray-700 leading-relaxed">{{ edu }}</div>
              <div v-if="!pendidikanList.length" class="p-4 text-xs italic text-gray-400">Belum ada data pendidikan.</div>
            </div>
          </div>
        </div>

        <!-- 2. Alasan Kesesuaian Rekomendasi -->
        <div class="border border-teal-200">
          <div class="bg-teal-50 border-b border-teal-200 px-4 py-2 flex justify-between items-center">
            <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-800">Alasan Kesesuaian Rekomendasi</span>
            <button @click="showAllRecords = !showAllRecords" class="text-[10px] font-mono font-bold uppercase text-teal-700 hover:underline">
              {{ showAllRecords ? 'Tampilkan Yang Relevan Saja' : 'Tampilkan Semua Riwayat' }}
            </button>
          </div>
          
          <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
            <div class="flex flex-col gap-2">
              <div class="text-[11px] font-bold text-gray-700 font-mono">Kecocokan Kata Kunci (BM25):</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="kata in xai?.irisan_kata" :key="kata" class="text-[10px] font-mono font-bold border border-gray-300 bg-gray-50 px-2 py-1 text-gray-900">
                  {{ kata }}
                </span>
                <span v-if="!xai?.irisan_kata?.length" class="text-xs text-gray-500 italic">Tidak ada kata kunci yang cocok secara langsung.</span>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <div class="text-[11px] font-bold text-gray-700 font-mono">Kecocokan Makna Topik (SBERT):</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="topik in xai?.topik_dosen" :key="topik" class="text-[10px] font-mono font-bold border border-teal-200 bg-teal-50 px-2 py-1 text-teal-800">
                  {{ topik }}
                </span>
                <span v-if="!xai?.topik_dosen?.length" class="text-xs text-gray-500 italic">Belum ada topik semantik terdeteksi.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Riwayat Publikasi Jurnal -->
        <div class="border border-gray-200 bg-white">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-700">
              {{ showAllRecords ? 'Seluruh Riwayat Publikasi Jurnal' : 'Riwayat Publikasi Jurnal Relevan' }}
            </span>
            <span class="text-[10px] font-mono font-bold bg-white border border-gray-200 px-2 py-0.5">
              {{ displayJurnalList.length }} / {{ allJurnalList.length }}
            </span>
          </div>
          <div class="p-0 divide-y divide-gray-200">
            <div v-for="(jurnal, idx) in displayJurnalList" :key="idx" class="px-4 py-3 flex items-start gap-4 hover:bg-gray-50">
              <span class="text-[10px] font-mono font-bold text-gray-400 w-6">#{{ idx + 1 }}</span>
              <span class="text-sm text-gray-900 leading-relaxed">{{ jurnal }}</span>
            </div>
            <div v-if="!displayJurnalList.length" class="p-6 text-xs text-gray-400 italic text-center">Tidak ada riwayat publikasi jurnal yang memuat kata kunci topik input.</div>
          </div>
        </div>

        <!-- 4. Riwayat Bimbingan Mahasiswa -->
        <div class="border border-gray-200 bg-white">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-700">
              {{ showAllRecords ? 'Seluruh Riwayat Bimbingan' : 'Riwayat Bimbingan Mahasiswa Relevan' }}
            </span>
            <span class="text-[10px] font-mono font-bold bg-white border border-gray-200 px-2 py-0.5">
              {{ displayBimbinganList.length }} / {{ allBimbinganList.length }}
            </span>
          </div>
          <div class="p-0 divide-y divide-gray-200">
            <div v-for="(bimbing, idx) in displayBimbinganList" :key="idx" class="px-4 py-3 flex items-start gap-4 hover:bg-gray-50">
              <span class="text-[10px] font-mono font-bold text-gray-400 w-6">#{{ idx + 1 }}</span>
              <span class="text-sm text-gray-900 leading-relaxed">{{ bimbing }}</span>
            </div>
            <div v-if="!displayBimbinganList.length" class="p-6 text-xs text-gray-400 italic text-center">Tidak ada riwayat bimbingan mahasiswa yang memuat kata kunci topik input.</div>
          </div>
        </div>

        <!-- 5. Riwayat Pengujian Mahasiswa -->
        <div class="border border-gray-200 bg-white">
          <div class="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-700">
              {{ showAllRecords ? 'Seluruh Riwayat Pengujian' : 'Riwayat Pengujian Sidang Relevan' }}
            </span>
            <span class="text-[10px] font-mono font-bold bg-white border border-gray-200 px-2 py-0.5">
              {{ displayUjiList.length }} / {{ allUjiList.length }}
            </span>
          </div>
          <div class="p-0 divide-y divide-gray-200">
            <div v-for="(uji, idx) in displayUjiList" :key="idx" class="px-4 py-3 flex items-start gap-4 hover:bg-gray-50">
              <span class="text-[10px] font-mono font-bold text-gray-400 w-6">#{{ idx + 1 }}</span>
              <span class="text-sm text-gray-900 leading-relaxed">{{ uji }}</span>
            </div>
            <div v-if="!displayUjiList.length" class="p-6 text-xs text-gray-400 italic text-center">Tidak ada riwayat pengujian sidang yang memuat kata kunci topik input.</div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fade-in 0.2s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
