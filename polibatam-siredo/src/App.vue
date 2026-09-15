<script setup>
import { ref } from 'vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'

const sidebarRef = ref(null)

const handleToggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.toggleMobile()
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100/80 text-gray-900 font-sans flex">
    
    <AppSidebar ref="sidebarRef" />
    
    <div class="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-[260px]">
      <AppHeader @toggle-sidebar="handleToggleSidebar" />
      
      <main class="flex-grow p-4 sm:p-6 lg:p-8 w-full min-w-0 box-border">
        <div class="w-full min-w-0">
          <router-view v-slot="{ Component, route }">
            <component :is="Component" :key="route.fullPath" />
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
/* Global styles if needed */
</style>
