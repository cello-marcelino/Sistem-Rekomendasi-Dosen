<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand & Campus Emblem -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-base tracking-wider shadow-none group-hover:bg-slate-800 transition-colors">
            <!-- Academic Monoline Emblem SVG -->
            <svg class="w-6 h-6 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-base font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">SiReDo</span>
            <span class="text-[11px] text-slate-500 font-normal leading-tight">Sistem Rekomendasi Dosen</span>
          </div>
        </router-link>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
          <router-link
            to="/"
            class="hover:text-teal-700 transition-colors py-1"
            :class="{ 'text-teal-800 font-semibold': $route.path === '/' && !$route.hash }"
          >
            Beranda
          </router-link>
          <router-link
            to="/dosen"
            class="hover:text-teal-700 transition-colors py-1"
            :class="{ 'text-teal-800 font-semibold': $route.path === '/dosen' }"
          >
            Dosen & Pembimbing
          </router-link>
          <a
            href="#metodologi"
            @click.prevent="scrollTo('#metodologi')"
            class="hover:text-teal-700 transition-colors cursor-pointer py-1"
          >
            Metodologi
          </a>
          <a
            href="#ekosistem"
            @click.prevent="scrollTo('#ekosistem')"
            class="hover:text-teal-700 transition-colors cursor-pointer py-1"
          >
            Ekosistem Peran
          </a>
        </nav>

        <!-- Right Action Button -->
        <div class="flex items-center gap-3">
          <router-link
            to="/login"
            class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all border border-slate-900"
          >
            <!-- Flowbite Outline Icon Lock -->
            <svg class="w-4 h-4 text-slate-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"/>
            </svg>
            <span>Masuk Portal</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const scrollTo = (hash) => {
  if (route.path !== '/') {
    router.push({ path: '/', hash }).then(() => {
      setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })
  } else {
    const el = document.querySelector(hash)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }
}
</script>
