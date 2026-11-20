<template>
  <div class="min-h-screen bg-ambient-mesh flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
    
    <!-- Top Bar: Back to Home -->
    <div class="max-w-md w-full mx-auto">
      <router-link
        to="/"
        class="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali ke Beranda</span>
      </router-link>
    </div>

    <!-- Center Login Container -->
    <div class="max-w-md w-full mx-auto my-auto pt-6 pb-8">
      
      <!-- Brand Header (NO version badge) -->
      <div class="text-center mb-6 space-y-1">
        <div class="w-12 h-12 rounded-xl bg-slate-900 mx-auto flex items-center justify-center text-white mb-3">
          <svg class="w-7 h-7 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Masuk Portal SiReDo</h1>
        <p class="text-xs text-slate-500">
          Pilih portal yang sesuai dengan hak akses peran Anda di sistem.
        </p>
      </div>

      <!-- Main Login Card -->
      <div class="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
        
        <!-- Role-Switcher Tab Header (tabs-border) -->
        <div class="flex border-b border-slate-200 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            @click="activeRole = 'dosen'"
            class="flex-1 pb-3 text-center border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            :class="activeRole === 'dosen' ? 'border-teal-700 text-teal-800' : 'border-transparent text-slate-400 hover:text-slate-700'"
          >
            <IconUserGraduate customClass="w-4 h-4" />
            <span>Portal Dosen</span>
          </button>

          <button
            type="button"
            @click="activeRole = 'admin'"
            class="flex-1 pb-3 text-center border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            :class="activeRole === 'admin' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'"
          >
            <IconShieldCheck customClass="w-4 h-4" />
            <span>Administrator</span>
          </button>
        </div>

        <!-- Role Description Banner -->
        <div class="p-3 rounded-lg text-xs" :class="activeRole === 'dosen' ? 'bg-teal-50/70 border border-teal-200 text-teal-900' : 'bg-slate-50 border border-slate-200 text-slate-700'">
          <template v-if="activeRole === 'dosen'">
            <strong>Akses Dosen:</strong> Kelola portofolio kepakaran riset, pantau kuota, dan tanggapi permohonan bimbingan mahasiswa.
          </template>
          <template v-else>
            <strong>Akses Administrator:</strong> Atur konfigurasi parameter algoritma, kelola basis data dosen, dan otomasi penjadwalan sidang.
          </template>
        </div>

        <!-- Form Dosen -->
        <form v-if="activeRole === 'dosen'" @submit.prevent="handleLoginDosen" class="space-y-4">
          <div class="space-y-1">
            <label for="nidn" class="block text-xs font-semibold text-slate-700">
              NIDN atau Email Institusi
            </label>
            <input
              id="nidn"
              v-model="dosenForm.identifier"
              type="text"
              required
              placeholder="Contoh: 0012058001 / dosen@polibatam.ac.id"
              class="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 transition-colors"
            />
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label for="dosen_pwd" class="block text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <a href="#" class="text-[11px] text-teal-700 hover:underline">Lupa Sandi?</a>
            </div>
            <input
              id="dosen_pwd"
              v-model="dosenForm.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 transition-colors"
            />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            <IconLock customClass="w-4 h-4 text-teal-200" />
            <span>Masuk sebagai Dosen</span>
          </button>
        </form>

        <!-- Form Administrator -->
        <form v-if="activeRole === 'admin'" @submit.prevent="handleLoginAdmin" class="space-y-4">
          <div class="space-y-1">
            <label for="admin_user" class="block text-xs font-semibold text-slate-700">
              Username Administrator
            </label>
            <input
              id="admin_user"
              v-model="adminForm.username"
              type="text"
              required
              placeholder="Masukkan username admin..."
              class="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>

          <div class="space-y-1">
            <label for="admin_pwd" class="block text-xs font-semibold text-slate-700">
              Kata Sandi
            </label>
            <input
              id="admin_pwd"
              v-model="adminForm.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            <IconShieldCheck customClass="w-4 h-4 text-slate-300" />
            <span>Masuk sebagai Administrator</span>
          </button>
        </form>

        <!-- Status / Notice for Future Milestone -->
        <div v-if="noticeMessage" class="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
          {{ noticeMessage }}
        </div>
      </div>
    </div>

    <!-- Bottom Footer Attribution -->
    <div class="max-w-md w-full mx-auto text-center text-xs text-slate-400">
      SiReDo &copy; 2026 Jurusan Teknik Informatika Polibatam.
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import IconUserGraduate from '../components/icons/IconUserGraduate.vue'
import IconShieldCheck from '../components/icons/IconShieldCheck.vue'
import IconLock from '../components/icons/IconLock.vue'

const activeRole = ref('dosen')
const isSubmitting = ref(false)
const noticeMessage = ref('')

const dosenForm = reactive({
  identifier: '',
  password: ''
})

const adminForm = reactive({
  username: '',
  password: ''
})

const handleLoginDosen = () => {
  isSubmitting.value = true
  noticeMessage.value = ''

  setTimeout(() => {
    isSubmitting.value = false
    noticeMessage.value = 'Portal Portofolio & Bimbingan Dosen akan diintegrasikan pada tahap berikutnya.'
  }, 400)
}

const handleLoginAdmin = () => {
  isSubmitting.value = true
  noticeMessage.value = ''

  setTimeout(() => {
    isSubmitting.value = false
    noticeMessage.value = 'Autentikasi sesi Administrator akan diintegrasikan dengan database admins pada tahap berikutnya.'
  }, 400)
}
</script>
