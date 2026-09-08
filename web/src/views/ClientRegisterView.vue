<script setup>
import { ref } from 'vue'
import { useClientSessionStore } from '../stores/clientSession'

const session = useClientSessionStore()
const mode = ref('login') // 'login' | 'register'
const showKey = ref(false)

const form = ref({
  name: '',
  email: '',
  organization: '',
  password: ''
})

const submitForm = async () => {
  let success = false
  if (mode.value === 'register') {
    success = await session.register(form.value)
  } else {
    success = await session.login(form.value.email, form.value.password)
  }
  if (success) {
    // Reset form
    form.value = { name: '', email: '', organization: '', password: '' }
  }
}

const regenerate = async () => {
  if (confirm("API Key lama akan tidak berlaku. Yakin?")) {
    await session.regenerateApiKey()
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(session.apiKey)
  alert("API Key disalin!")
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-8">
    
    <!-- DASHBOARD MODE -->
    <div v-if="session.isAuthenticated" class="space-y-8 animate-fade-in">
      <div class="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Developer</h1>
            <p class="text-gray-600 dark:text-gray-400">Selamat datang, {{ session.client.name }}</p>
          </div>
          <button @click="session.logout()" class="text-sm px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors font-medium">Logout</button>
        </div>

        <div class="bg-gray-50 dark:bg-gray-950 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">API Key Anda</h2>
          
          <div class="flex items-center gap-3">
            <input 
              :type="showKey ? 'text' : 'password'" 
              :value="session.apiKey" 
              readonly
              class="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <button @click="showKey = !showKey" class="p-2.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg" :title="showKey ? 'Sembunyikan' : 'Tampilkan'">
              <svg v-if="!showKey" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </button>
            <button @click="copyToClipboard" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Salin
            </button>
          </div>
          
          <div class="mt-4 flex items-center justify-between">
            <p class="text-sm text-gray-500 dark:text-gray-400">Gunakan key ini di <code>X-API-Key</code> header Anda.</p>
            <button @click="regenerate" class="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 font-medium">Generate Ulang Key</button>
          </div>
        </div>
      </div>
    </div>

    <!-- LOGIN/REGISTER MODE -->
    <div v-else class="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {{ mode === 'register' ? 'Daftar Developer' : 'Login Developer' }}
      </h1>
      
      <div v-if="session.error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
        {{ session.error }}
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <template v-if="mode === 'register'">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
            <input v-model="form.name" type="text" required class="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organisasi/Institusi</label>
            <input v-model="form.organization" type="text" required class="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
          </div>
        </template>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input v-model="form.email" type="email" required class="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input v-model="form.password" type="password" required class="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
        </div>

        <button type="submit" :disabled="session.loading" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 mt-6">
          {{ session.loading ? 'Memproses...' : (mode === 'register' ? 'Daftar Sekarang' : 'Login') }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <span v-if="mode === 'login'">Belum punya akun? <button @click="mode = 'register'" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Daftar sekarang</button></span>
        <span v-else>Sudah punya akun? <button @click="mode = 'login'" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Login di sini</button></span>
      </div>
    </div>
  </div>
</template>
