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
  if (session.apiKey) {
    navigator.clipboard.writeText(session.apiKey)
    alert("API Key berhasil disalin!")
  }
}
</script>

<template>
  <div class="max-w-[700px] mx-auto py-10 px-6">
    
    <!-- DASHBOARD MODE -->
    <div v-if="session.isAuthenticated" class="space-y-8 animate-in">
      <div class="bg-bg-base rounded-[14px] p-6 sm:p-8 border border-border shadow-sm">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-2xl font-bold text-text-primary mb-1 tracking-tight">Dashboard Developer</h1>
            <p class="text-text-secondary">Selamat datang, <strong class="text-text-primary">{{ session.client.name }}</strong> ({{ session.client.organization }})</p>
          </div>
          <button @click="session.logout()" class="text-sm px-4 py-2 bg-red-bg text-red hover:bg-red-border rounded-[6px] transition-colors font-medium">Logout</button>
        </div>

        <div class="bg-bg-subtle rounded-[10px] p-6 border border-border">
          <h2 class="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider mb-3">API Key Anda</h2>
          
          <div class="flex items-center gap-3">
            <input 
              :type="showKey ? 'text' : 'password'" 
              :value="session.apiKey" 
              readonly
              class="flex-1 bg-bg-base border border-border-strong rounded-[6px] px-4 py-2.5 font-mono text-sm text-text-primary focus:outline-none focus:border-brand"
            />
            <button @click="showKey = !showKey" class="p-2.5 text-text-muted hover:bg-bg-muted rounded-[6px]" :title="showKey ? 'Sembunyikan' : 'Tampilkan'">
              <svg v-if="!showKey" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </button>
            <button @click="copyToClipboard" class="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-[6px] font-medium transition-colors">
              Salin
            </button>
          </div>
          
          <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p class="text-[0.85rem] text-text-secondary">Gendengkan API Key ini pada header <code class="font-mono text-[0.8rem] bg-border px-1.5 py-0.5 rounded text-text-primary">X-API-Key</code> untuk setiap request.</p>
            <button @click="regenerate" class="text-[0.85rem] text-amber hover:text-amber-bg bg-amber-bg border border-amber-border px-3 py-1.5 rounded-[6px] font-medium transition-colors">
              Generate Ulang
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- LOGIN/REGISTER MODE -->
    <div v-else class="bg-bg-base rounded-[14px] p-8 border border-border shadow-sm animate-in">
      <div class="mb-8">
        <h1 class="text-[1.75rem] font-bold text-text-primary tracking-tight mb-2">
          {{ mode === 'register' ? 'Daftar Developer' : 'Login Developer' }}
        </h1>
        <p class="text-text-secondary">
          Dapatkan akses ke API SiReDo untuk mengembangkan aplikasi Anda sendiri.
        </p>
      </div>
      
      <div v-if="session.error" class="mb-6 p-4 bg-red-bg text-red rounded-[8px] text-[0.9rem] border border-red-border">
        {{ session.error }}
      </div>

      <form @submit.prevent="submitForm" class="space-y-5">
        <div v-if="mode === 'register'">
          <label class="block text-[0.85rem] font-semibold text-text-primary mb-1.5">Nama Lengkap</label>
          <input 
            v-model="form.name"
            type="text" 
            required 
            class="w-full bg-bg-base border border-border-strong rounded-[6px] px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand" 
          />
        </div>

        <div v-if="mode === 'register'">
          <label class="block text-[0.85rem] font-semibold text-text-primary mb-1.5">Organisasi / Kampus</label>
          <input 
            v-model="form.organization"
            type="text" 
            required 
            class="w-full bg-bg-base border border-border-strong rounded-[6px] px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand" 
          />
        </div>

        <div>
          <label class="block text-[0.85rem] font-semibold text-text-primary mb-1.5">Email</label>
          <input 
            v-model="form.email"
            type="email" 
            required 
            class="w-full bg-bg-base border border-border-strong rounded-[6px] px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand" 
          />
        </div>
        
        <div>
          <label class="block text-[0.85rem] font-semibold text-text-primary mb-1.5">Password</label>
          <input 
            v-model="form.password"
            type="password" 
            required 
            class="w-full bg-bg-base border border-border-strong rounded-[6px] px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand" 
          />
        </div>
        
        <button 
          type="submit" 
          :disabled="session.loading"
          class="w-full mt-2 py-3 bg-brand hover:bg-brand-dark text-white rounded-[6px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg v-if="session.loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ mode === 'register' ? 'Daftar Sekarang' : 'Login' }}
        </button>
      </form>
      
      <div class="mt-6 text-center text-[0.9rem] text-text-secondary pt-6 border-t border-border">
        {{ mode === 'register' ? 'Sudah punya akun?' : 'Belum punya API Key?' }}
        <button 
          @click="mode = mode === 'register' ? 'login' : 'register'" 
          class="text-brand font-semibold hover:underline ml-1 focus:outline-none"
        >
          {{ mode === 'register' ? 'Login di sini' : 'Daftar sekarang' }}
        </button>
      </div>
    </div>
  </div>
</template>
