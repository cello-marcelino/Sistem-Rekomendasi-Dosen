<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-border-mist transition-colors shadow-2xs">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand & Campus Emblem -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-lg bg-academic-navy flex items-center justify-center text-white font-bold text-base tracking-wider shadow-none group-hover:bg-academic-hover transition-colors">
            <!-- Academic Monoline Emblem SVG -->
            <svg class="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-base font-bold tracking-tight text-academic-navy group-hover:text-academic-hover transition-colors">SiReDo</span>
            <span class="text-[11px] text-text-muted font-normal leading-tight">Sistem Rekomendasi Dosen</span>
          </div>
        </router-link>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-text-muted">
          <router-link
            to="/"
            class="hover:text-academic-navy transition-colors py-1"
            :class="{ 'text-academic-navy font-bold': $route.path === '/' && !$route.hash }"
          >
            Beranda
          </router-link>
          <a
            href="#metodologi"
            @click.prevent="scrollTo('#metodologi')"
            class="hover:text-academic-navy transition-colors cursor-pointer py-1"
          >
            Metodologi
          </a>
          <a
            href="#ekosistem"
            @click.prevent="scrollTo('#ekosistem')"
            class="hover:text-academic-navy transition-colors cursor-pointer py-1"
          >
            Ekosistem Peran
          </a>
        </nav>

        <!-- Right Action Buttons -->
        <div class="flex items-center gap-2.5 sm:gap-3">
          <!-- Button Masuk Portal (Secondary Variant: White with Border) -->
          <router-link
            to="/login"
            class="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-white hover:bg-bg-subtle text-academic-navy transition-all border border-[#CBD5E1]"
          >
            <!-- Flowbite Outline Icon Lock -->
            <svg class="w-4 h-4 text-academic-navy" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
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
