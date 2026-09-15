<script setup>
const emit = defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="h-[74px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 sticky top-0 transition-colors">
    <div class="flex items-center gap-4">
      <button 
        @click="emit('toggle-sidebar')"
        class="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      <div>
        <h2 class="text-sm font-bold text-gray-900 tracking-wide font-sans">Sistem Rekomendasi Dosen Polibatam</h2>
      </div>
    </div>
  </header>
</template>