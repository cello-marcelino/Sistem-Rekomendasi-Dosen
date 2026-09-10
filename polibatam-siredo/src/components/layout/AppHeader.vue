<script setup>
const emit = defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="h-[74px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 shadow-sm transition-colors">
    <div class="flex items-center gap-4">
      <button 
        @click="emit('toggle-sidebar')"
        class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      <div class="hidden sm:block">
        <h2 class="text-sm font-bold text-gray-800 tracking-wide">Sistem Rekomendasi Dosen Pembimbing</h2>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex flex-col items-end">
          <span class="text-sm font-bold text-gray-900">Admin Jurusan</span>
          <span class="text-xs text-gray-500 font-medium">Teknik Informatika</span>
        </div>
        <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200 shadow-sm">
          AJ
        </div>
      </div>
    </div>
  </header>
</template>