<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMobileOpen = ref(false)

const navGroups = [
  {
    title: 'MENU UTAMA',
    items: [
      { name: 'Dashboard', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { name: 'Cari Rekomendasi', path: '/rekomendasi', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      { name: 'Informasi & Statistik', path: '/dosen', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ]
  },
  {
    title: 'ADMINISTRATOR',
    items: [
      { name: 'Manajemen Dosen', path: '/admin/dosen', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { name: 'Batch Recommendation', path: '/admin/batch', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { name: 'Penjadwalan Otomatis', path: '/admin/penjadwalan', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ]
  }
]

defineExpose({
  toggleMobile: () => isMobileOpen.value = !isMobileOpen.value
})
</script>

<template>
  <div class="relative z-40">
    <div 
      v-if="isMobileOpen"
      @click="isMobileOpen = false"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
    ></div>

    <aside 
      :class="isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      class="fixed inset-y-0 left-0 w-[260px] bg-[#24263b] text-white flex flex-col transition-transform duration-300 ease-in-out lg:z-0 z-50 border-r border-[#2f324d]"
    >
      <!-- Logo Header -->
      <div class="h-[74px] flex items-center px-6 border-b border-[#2f324d] shrink-0 bg-[#24263b]">
        <router-link to="/" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-[4px] bg-teal-500 flex items-center justify-center text-[#24263b] font-bold shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <div>
            <h1 class="font-bold text-white tracking-wide text-sm font-sans">Polibatam SiReDo</h1>
            <p class="text-[10px] text-teal-400 font-mono tracking-widest mt-0.5">ADMIN v3.2</p>
          </div>
        </router-link>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto py-8 custom-scrollbar">
        <nav class="px-4 space-y-8">
          <div v-for="(group, idx) in navGroups" :key="idx" class="space-y-3">
            <h3 class="px-3 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{{ group.title }}</h3>
            
            <div class="space-y-1">
              <router-link
                v-for="item in group.items"
                :key="item.path"
                :to="item.path"
                @click="isMobileOpen = false"
                class="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors group relative rounded-[3px]"
                :class="route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path)) 
                  ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'"
              >
                <svg 
                  class="w-4 h-4 transition-colors"
                  :class="route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path)) ? 'text-teal-400' : 'text-gray-400 group-hover:text-gray-200'"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
                </svg>
                {{ item.name }}
              </router-link>
            </div>
          </div>
        </nav>
      </div>

      <!-- User/Status Footer -->
      <div class="p-4 border-t border-[#2f324d] bg-[#1e2032]/60">
        <div class="flex items-center gap-3 px-3 py-2 border border-[#2f324d] bg-[#24263b]/80 rounded-[3px]">
          <div class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
          <div class="text-[11px] font-mono font-bold text-gray-300 truncate uppercase tracking-widest">Server Online</div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2f324d;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #3d4163;
}
</style>