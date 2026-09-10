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
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
    
    <AppSidebar ref="sidebarRef" />
    
    <div class="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-[260px]">
      <AppHeader @toggle-sidebar="handleToggleSidebar" />
      
      <main class="flex-grow p-4 sm:p-6 lg:p-8">
        <div class="max-w-7xl mx-auto">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
/* Page transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
