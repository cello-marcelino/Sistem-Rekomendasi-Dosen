<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="space-y-6 animate-in">
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 sm:p-10 text-white shadow-lg relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-20">
        <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ffffff" d="M45.7,-76.3C58.9,-69.3,68.9,-54.8,77.5,-40.4C86,-25.9,93,-11.4,91.8,2.5C90.6,16.5,81.1,30,71.2,42C61.3,54,51,64.4,38.1,72.1C25.2,79.7,9.7,84.5,-5.1,87.6C-19.9,90.6,-34.1,91.9,-47.1,86.2C-60.1,80.5,-72,67.7,-80.4,53.2C-88.8,38.6,-93.6,22.2,-93.6,6.3C-93.6,-9.7,-88.7,-25.3,-80.2,-38.7C-71.7,-52.1,-59.5,-63.3,-46.1,-70.3C-32.6,-77.3,-17.8,-80,-1.3,-77.9C15.2,-75.8,32.5,-83.4,45.7,-76.3Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      <div class="relative z-10 max-w-2xl">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Sistem Rekomendasi Dosen Pembimbing
        </h1>
        <p class="text-emerald-50 text-lg mb-8 leading-relaxed max-w-xl">
          Temukan dosen pembimbing yang paling relevan dengan topik penelitian Anda menggunakan algoritma Hybrid AI (BM25 & SBERT).
        </p>
        <div class="flex flex-wrap gap-4">
          <button @click="router.push('/rekomendasi')" class="px-6 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Cari Rekomendasi
          </button>
          <button @click="router.push('/dosen')" class="px-6 py-2.5 bg-emerald-800/40 text-white hover:bg-emerald-800/60 font-bold rounded-lg border border-emerald-400/30 transition-colors backdrop-blur-sm">
            Lihat Data Dosen
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats & Modules -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" @click="router.push('/admin/batch')">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Batch Recommendation</h3>
        <p class="text-sm text-gray-500 leading-relaxed">Proses pencarian rekomendasi massal menggunakan file Excel untuk puluhan mahasiswa sekaligus.</p>
      </div>

      <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" @click="router.push('/admin/penjadwalan')">
        <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Auto-Penjadwalan</h3>
        <p class="text-sm text-gray-500 leading-relaxed">Otomatiskan alokasi jadwal sidang dan plotting penguji berdasarkan relevansi topik tanpa bentrok.</p>
      </div>

      <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" @click="router.push('/statistik')">
        <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Statistik Sistem</h3>
        <p class="text-sm text-gray-500 leading-relaxed">Lihat sebaran topik penelitian mahasiswa dan beban kerja dosen secara visual dan real-time.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fade-in 0.4s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
