<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navLinks = [
  { name: 'Beranda', path: '/' },
  { name: 'Daftar Dosen', path: '/dosen' },
  { name: 'Cari Rekomendasi', path: '/rekomendasi' },
  { name: 'Statistik', path: '/statistik' },
]

const adminLinks = [
  { name: 'Kelola Dosen', path: '/admin/dosen' },
  { name: 'Batch Recommendation', path: '/admin/batch' },
  { name: 'Penjadwalan TA', path: '/admin/penjadwalan' },
]

const isDropdownOpen = ref(false)
</script>

<template>
  <nav class="bg-white border-b border-gray-200 fixed w-full z-30 top-0 left-0 dark:bg-gray-900 dark:border-gray-800">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <router-link to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Polibatam SiReDo</span>
      </router-link>
      
      <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <!-- Status indicator (simulated for UI) -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Connected to API
        </div>
        <button @click="mobileMenuOpen = !mobileMenuOpen" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
          <span class="sr-only">Open main menu</span>
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
        </button>
      </div>
      
      <div :class="[mobileMenuOpen ? 'block' : 'hidden']" class="items-center justify-between w-full md:flex md:w-auto md:order-1">
        <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
          <li v-for="link in navLinks" :key="link.path">
            <router-link 
              :to="link.path" 
              class="block py-2 px-3 rounded md:p-0"
              :class="route.path === link.path ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:dark:text-blue-500' : 'text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'"
              @click="mobileMenuOpen = false"
            >
              {{ link.name }}
            </router-link>
          </li>
          
          <!-- Admin Dropdown -->
          <li class="relative" @mouseenter="isDropdownOpen = true" @mouseleave="isDropdownOpen = false">
            <button class="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
              Admin TA
              <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
              </svg>
            </button>
            <div v-show="isDropdownOpen" class="absolute z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600 left-0 md:-ml-12 mt-1">
              <ul class="py-2 text-sm text-gray-700 dark:text-gray-400">
                <li v-for="link in adminLinks" :key="link.path">
                  <router-link :to="link.path" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" @click="mobileMenuOpen = false; isDropdownOpen = false">
                    {{ link.name }}
                  </router-link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

