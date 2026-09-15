<script setup>
import { ref, computed } from 'vue'
import { useClientSessionStore } from '../stores/clientSession'

const session = useClientSessionStore()
const mode = ref('login') // 'login' | 'register'
const showKey = ref(false)
const copied = ref(false)

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
    form.value = { name: '', email: '', organization: '', password: '' }
  }
}

const regenerate = async () => {
  if (confirm("API Key lama Anda akan segera dinonaktifkan. Apakah Anda yakin ingin membuat kunci baru?")) {
    await session.regenerateApiKey()
  }
}

const copyToClipboard = () => {
  if (session.apiKey) {
    navigator.clipboard.writeText(session.apiKey)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  }
}

const maskedKey = computed(() => {
  if (!session.apiKey) return ''
  if (showKey.value) return session.apiKey
  const prefix = session.apiKey.substring(0, 9)
  return `${prefix}${'•'.repeat(24)}`
})
</script>

<template>
  <div class="client-auth-page animate-in">

    <!-- Header -->
    <div class="page-header">
      <div class="flex items-center gap-2 mb-2">
        <span class="page-badge">PORTAL DEVELOPER KAMPUS</span>
        <span class="badge-status">INTEGRASI SIAKAD</span>
      </div>
      <h1 class="page-title">
        {{ session.isAuthenticated ? 'Dashboard Kredensial Developer' : 'Manajemen Akses API' }}
      </h1>
      <p class="page-lead">
        {{ session.isAuthenticated 
          ? 'Kelola token autentikasi, pantau status hak akses, dan dapatkan cuplikan kode siap pakai untuk integrasi.'
          : 'Daftarkan akun pengembang atau login untuk mendapatkan API Key resmi SiReDo bagi portal akademik kampus Anda.' }}
      </p>
    </div>

    <!-- ============================================== -->
    <!-- DASHBOARD MODE (User Authenticated)            -->
    <!-- ============================================== -->
    <div v-if="session.isAuthenticated" class="space-y-8">
      <!-- Client Profile Summary -->
      <div class="dashboard-banner">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="client-avatar">
              <svg class="w-7 h-7 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-text-primary">{{ session.client?.name }}</h3>
                <span class="px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-green-bg text-green-main border border-green-border">Terverifikasi</span>
              </div>
              <p class="text-xs text-text-secondary mt-0.5">
                {{ session.client?.organization }} &bull; <span class="font-mono">{{ session.client?.email }}</span>
              </p>
            </div>
          </div>

          <button @click="session.logout()" class="btn-logout">
            Keluar Sesi
          </button>
        </div>
      </div>

      <!-- API Key Card -->
      <div class="api-key-card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-text-primary">API Key Aktif</h3>
            <p class="text-xs text-text-secondary">Gunakan token ini pada header <code>X-API-Key</code> di seluruh permintaan REST API.</p>
          </div>
          <span class="text-xs font-mono bg-bg-subtle border border-border px-2.5 py-1 rounded text-text-muted">HMAC-SHA256</span>
        </div>

        <div class="key-field-group">
          <div class="key-input-wrapper">
            <input 
              type="text" 
              :value="maskedKey" 
              readonly
              class="key-input font-mono"
            />
          </div>

          <button 
            @click="showKey = !showKey" 
            class="btn-icon" 
            :title="showKey ? 'Sembunyikan Key' : 'Tampilkan Key'"
          >
            <svg v-if="!showKey" class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>

          <button @click="copyToClipboard" class="btn-copy">
            <span v-if="copied" class="flex items-center gap-1 text-green-main">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Tersalin!
            </span>
            <span v-else class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Salin Key
            </span>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-border">
          <div class="flex items-center gap-2 text-xs text-text-muted">
            <svg class="w-4 h-4 text-amber flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Jika token Anda bocor, segera generate ulang untuk membatalkan akses lama.</span>
          </div>

          <button @click="regenerate" class="btn-regenerate">
            Regenerate Token Baru
          </button>
        </div>
      </div>

      <!-- Interactive Code Generator Widget -->
      <div class="code-widget-card">
        <h3 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">Cuplikan Kode Langsung (Dengan Token Anda)</h3>
        <p class="text-xs text-text-secondary mb-4">Salin perintah cURL berikut untuk menguji koneksi langsung ke server lokal SiReDo:</p>

        <div class="code-panel">
          <div class="code-panel-header">
            <span class="code-panel-title">Terminal Test Command</span>
          </div>
          <pre class="code-panel-body"><code>curl -X POST http://localhost:5000/api/rekomendasi/single \
  -H <span class="tok-str">"Content-Type: application/json"</span> \
  -H <span class="tok-str">"X-API-Key: {{ session.apiKey || 'srd_live_YOUR_KEY' }}"</span> \
  -d '{
    <span class="tok-key">"judul"</span>: <span class="tok-str">"Penerapan Algoritma Genetika untuk Optimasi Jadwal Kuliah"</span>,
    <span class="tok-key">"k_rank"</span>: <span class="tok-num">5</span>
  }'</code></pre>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- LOGIN & REGISTRATION SPLIT VIEW (Unauth)       -->
    <!-- ============================================== -->
    <div v-else class="split-auth-layout">
      <!-- Left: Form Card -->
      <div class="auth-form-card">
        <div class="auth-card-top mb-6">
          <h2 class="text-xl font-bold text-text-primary">
            {{ mode === 'register' ? 'Pendaftaran Developer SIAKAD' : 'Masuk ke Portal Developer' }}
          </h2>
          <p class="text-xs text-text-secondary mt-1">
            {{ mode === 'register' 
              ? 'Isi formulir berikut untuk membuat kredensial API Key resmi.' 
              : 'Masukkan email dan kata sandi yang telah terdaftar.' }}
          </p>
        </div>

        <div v-if="session.error" class="error-alert">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ session.error }}</span>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div v-if="mode === 'register'">
            <label class="form-label">Nama Lengkap Penanggung Jawab</label>
            <input 
              v-model="form.name"
              type="text" 
              required 
              placeholder="Contoh: Budi Pratama"
              class="form-input" 
            />
          </div>

          <div v-if="mode === 'register'">
            <label class="form-label">Nama Universitas / Institusi Kampus</label>
            <input 
              v-model="form.organization"
              type="text" 
              required 
              placeholder="Contoh: Universitas Dian Nuswantoro"
              class="form-input" 
            />
          </div>

          <div>
            <label class="form-label">Alamat Email Resmi</label>
            <input 
              v-model="form.email"
              type="email" 
              required 
              placeholder="developer@campus.ac.id"
              class="form-input" 
            />
          </div>

          <div>
            <label class="form-label">Kata Sandi</label>
            <input 
              v-model="form.password"
              type="password" 
              required 
              placeholder="••••••••"
              class="form-input" 
            />
          </div>

          <button 
            type="submit" 
            :disabled="session.loading"
            class="btn-submit"
          >
            <svg v-if="session.loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ mode === 'register' ? 'Daftar & Terbitkan API Key' : 'Masuk Developer' }}
          </button>
        </form>

        <div class="auth-toggle-footer">
          <span>{{ mode === 'register' ? 'Sudah memiliki akun pengembang?' : 'Belum memiliki API Key SiReDo?' }}</span>
          <button 
            @click="mode = mode === 'register' ? 'login' : 'register'" 
            class="text-brand font-semibold hover:underline ml-1.5 focus:outline-none"
          >
            {{ mode === 'register' ? 'Masuk di sini' : 'Daftar sekarang' }}
          </button>
        </div>
      </div>

      <!-- Right: Feature Perks Card -->
      <div class="perks-sidebar-card">
        <h3 class="text-base font-bold text-text-primary mb-3">Keuntungan Developer SIAKAD</h3>
        <p class="text-xs text-text-secondary leading-relaxed mb-5">
          Integrasikan sistem rekomendasi pembimbing skripsi yang akurat, transparan, dan berlatensi sangat rendah ke dalam ekosistem kampus Anda.
        </p>

        <div class="space-y-4">
          <div class="perk-item">
            <div class="perk-icon bg-brand-light text-brand">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-text-primary">Latensi Rendah &lt; 50 ms</h4>
              <p class="text-xs text-text-secondary">In-memory caching memastikan SIAKAD Anda tetap responsif tanpa jeda tunggu.</p>
            </div>
          </div>

          <div class="perk-item">
            <div class="perk-icon bg-blue-bg text-blue-main">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-text-primary">Explainable AI (XAI) Terbuka</h4>
              <p class="text-xs text-text-secondary">Menampilkan irisan kata kunci dan topik keahlian dosen agar keputusan dapat dipertanggungjawabkan.</p>
            </div>
          </div>

          <div class="perk-item">
            <div class="perk-icon bg-green-bg text-green-main">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-text-primary">Keamanan Token HMAC</h4>
              <p class="text-xs text-text-secondary">Setiap request diverifikasi dengan tanda tangan digital tanpa menyimpan kata sandi terbuka.</p>
            </div>
          </div>
        </div>

        <div class="api-reference-cta">
          <span class="text-xs font-semibold text-text-secondary">Butuh dokumentasi lengkap?</span>
          <router-link to="/docs/api" class="text-xs font-bold text-brand hover:underline">
            Baca API Reference &rarr;
          </router-link>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.client-auth-page {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 2.5rem 3.5rem 5rem 3.5rem;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 2.5rem;
}

.page-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  padding: 3px 10px;
  border-radius: 99px;
}

.badge-status {
  font-size: 0.68rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  padding: 3px 8px;
  border-radius: 99px;
}

.page-title {
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.page-lead {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* Dashboard Banner */
.dashboard-banner {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.client-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-logout {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--red);
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #fee2e2;
}

/* API Key Card */
.api-key-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.key-field-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.key-input-wrapper {
  flex: 1;
}

.key-input {
  width: 100%;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  font-size: 0.88rem;
  color: var(--text-primary);
  font-weight: 600;
  outline: none;
}

.key-input:focus {
  border-color: var(--brand);
}

.btn-icon {
  padding: 0.75rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-muted);
}

.btn-copy {
  padding: 0.75rem 1.25rem;
  background: var(--brand);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-copy:hover {
  background: var(--brand-dark);
}

.btn-regenerate {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--amber);
  background: var(--amber-bg);
  border: 1px solid var(--amber-border);
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-regenerate:hover {
  background: #fef3c7;
}

/* Code Widget */
.code-widget-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1.75rem;
}

.code-panel {
  background: #0f0f14;
  border: 1px solid #1e1e2e;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.code-panel-header {
  background: #181825;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #28283d;
}

.code-panel-title {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  color: #a6adc8;
}

.code-panel-body {
  padding: 1rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.6;
  color: #cdd6f4;
  overflow-x: auto;
}

/* Split Auth Layout */
.split-auth-layout {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 1.5rem;
  align-items: start;
}

.auth-form-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.perks-sidebar-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.form-input {
  width: 100%;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.9rem;
  font-size: 0.88rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: var(--brand);
}

.btn-submit {
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: var(--brand);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
  margin-top: 0.75rem;
}

.btn-submit:hover:not(:disabled) {
  background: var(--brand-dark);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-alert {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--red);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.auth-toggle-footer {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.perk-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.perk-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.api-reference-cta {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Syntax helpers */
.tok-key { color: #89b4fa; }
.tok-str { color: #a6e3a1; }
.tok-num { color: #fab387; }

@media (max-width: 1024px) {
  .split-auth-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .client-auth-page {
    padding: 2rem 1.25rem 4rem;
  }
  .key-field-group {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
