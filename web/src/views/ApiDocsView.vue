<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const activeSection = ref('overview')
const searchQuery = ref('')
const mobileDocsNavOpen = ref(false)

const navGroups = ref([
  {
    id: 'getting-started',
    title: 'Panduan & Dasar',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    open: true,
    items: [
      { id: 'overview', label: 'Overview', type: 'guide' },
      { id: 'auth', label: 'Autentikasi Header', type: 'guide' },
      { id: 'errors', label: 'Error Handling', type: 'guide' },
    ]
  },
  {
    id: 'recommendation',
    title: 'Endpoint Rekomendasi',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    open: true,
    items: [
      { id: 'single', label: '/rekomendasi/single', method: 'POST', desc: 'Single Analysis' },
      { id: 'batch', label: '/rekomendasi/batch', method: 'POST', desc: 'Batch JSON' },
      { id: 'batch-upload', label: '/rekomendasi/batch/upload', method: 'POST', desc: 'Batch Excel' },
    ]
  },
  {
    id: 'configuration',
    title: 'Endpoint Konfigurasi',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    open: true,
    items: [
      { id: 'config-get', label: '/config', method: 'GET', desc: 'Ambil Config' },
      { id: 'config-patch', label: '/config', method: 'PATCH', desc: 'Update Config' },
    ]
  },
  {
    id: 'system',
    title: 'Sistem & Status',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    open: true,
    items: [
      { id: 'status', label: '/status', method: 'GET', desc: 'Health & Model' },
    ]
  }
])

const filteredGroups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return navGroups.value

  return navGroups.value.map(group => {
    const matchedItems = group.items.filter(item => 
      item.label.toLowerCase().includes(q) || 
      (item.desc && item.desc.toLowerCase().includes(q)) ||
      (item.method && item.method.toLowerCase().includes(q))
    )
    return {
      ...group,
      open: matchedItems.length > 0,
      items: matchedItems
    }
  }).filter(group => group.items.length > 0)
})

const toggleGroup = (groupId) => {
  const g = navGroups.value.find(group => group.id === groupId)
  if (g) {
    g.open = !g.open
  }
}

const scrollToSection = (id) => {
  activeSection.value = id
  mobileDocsNavOpen.value = false
  navGroups.value.forEach(group => {
    if (group.items.some(item => item.id === id)) {
      group.open = true
    }
  })
  const el = document.getElementById(id)
  if (el) {
    const yOffset = -70
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

let observer = null

onMounted(() => {
  const allSectionIds = []
  navGroups.value.forEach(g => g.items.forEach(i => allSectionIds.push(i.id)))

  observer = new IntersectionObserver((entries) => {
    const visibleEntries = entries.filter(e => e.isIntersecting)
    if (visibleEntries.length > 0) {
      const topEntry = visibleEntries[0]
      activeSection.value = topEntry.target.id
      navGroups.value.forEach(group => {
        if (group.items.some(item => item.id === topEntry.target.id)) {
          group.open = true
        }
      })
    }
  }, {
    rootMargin: '-10% 0px -70% 0px'
  })

  allSectionIds.forEach(id => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="docs-layout">
    <!-- Mobile Bar Trigger (<= 900px) -->
    <div class="docs-mobile-bar">
      <button class="docs-mobile-trigger" @click="mobileDocsNavOpen = true">
        <svg class="docs-mobile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
        </svg>
        <span class="docs-mobile-label">Daftar Isi API</span>
        <span class="docs-mobile-tag">#{{ activeSection }}</span>
      </button>
    </div>

    <!-- Mobile Backdrop -->
    <div v-if="mobileDocsNavOpen" class="docs-backdrop" @click="mobileDocsNavOpen = false" />

    <!-- Nested Dropdown Navigation Sidebar -->
    <aside class="toc-sidebar" :class="{ 'toc-sidebar--mobile-open': mobileDocsNavOpen }">
      <!-- Sidebar Header -->
      <div class="toc-header">
        <div class="toc-header-top">
          <div class="toc-brand-title">
            <span class="toc-title">Dokumentasi API</span>
            <span class="toc-badge-version">v3.2</span>
          </div>
          <button class="toc-mobile-close" @click="mobileDocsNavOpen = false">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Quick Filter / Search -->
        <div class="toc-search-wrap">
          <svg class="toc-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari endpoint..."
            class="toc-search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="toc-search-clear">×</button>
        </div>
      </div>

      <!-- Nested Dropdown Navigation List -->
      <nav class="toc-nav">
        <div v-for="group in filteredGroups" :key="group.id" class="toc-group">
          <!-- Parent Dropdown Header (Toggle) -->
          <button
            type="button"
            class="toc-group-header"
            :class="{ 'toc-group-header--expanded': group.open }"
            @click="toggleGroup(group.id)"
          >
            <div class="toc-group-left">
              <svg class="toc-group-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="group.icon"/>
              </svg>
              <span class="toc-group-title">{{ group.title }}</span>
            </div>
            <svg class="toc-chevron" :class="{ 'toc-chevron--open': group.open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <!-- Nested Sub-items (Dropdown Children) -->
          <div v-show="group.open" class="toc-sublist">
            <a
              v-for="item in group.items"
              :key="item.id"
              :href="`#${item.id}`"
              class="toc-subitem"
              :class="{ 'active': activeSection === item.id }"
              @click.prevent="scrollToSection(item.id)"
            >
              <div class="toc-subitem-inner">
                <span v-if="item.method" class="toc-method" :class="`toc-method--${item.method.toLowerCase()}`">
                  {{ item.method }}
                </span>
                <span v-else class="toc-dot" :class="{ 'toc-dot--active': activeSection === item.id }"></span>
                <span class="toc-subitem-label">{{ item.label }}</span>
              </div>
              <span v-if="item.desc" class="toc-subitem-desc">{{ item.desc }}</span>
            </a>
          </div>
        </div>

        <div v-if="filteredGroups.length === 0" class="toc-empty">
          Tidak ditemukan "{{ searchQuery }}"
        </div>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="docs-main">
      <div class="prose docs-prose">

        <!-- Page header -->
        <div class="page-header">
          <span class="page-badge">REST API</span>
          <h1>API Reference</h1>
          <p class="page-lead">
            SiReDo menyediakan REST API untuk integrasi dengan sistem akademik (SIAKAD) maupun aplikasi pihak ketiga.
            Semua request dan response menggunakan format <strong>JSON</strong>.
          </p>
          <div class="base-url-box">
            <span class="bu-label">BASE URL</span>
            <code class="bu-val">http://localhost:5000/api</code>
          </div>
        </div>

        <!-- Overview -->
        <section id="overview">
          <h2>Overview</h2>
          <p>
            API SiReDo dirancang mengikuti prinsip REST. Setiap endpoint mengembalikan respons
            dalam envelope JSON yang konsisten dengan format berikut:
          </p>
          <pre><code><span class="tok-comment">// Respons sukses</span>
{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"message"</span>: <span class="tok-str">"Success"</span>,
  <span class="tok-key">"data"</span>: { ... }
}

<span class="tok-comment">// Respons error</span>
{
  <span class="tok-key">"status"</span>: <span class="tok-str">"error"</span>,
  <span class="tok-key">"message"</span>: <span class="tok-str">"Deskripsi error"</span>
}</code></pre>

          <div class="info-table">
            <table>
              <thead><tr><th>Endpoint</th><th>Method</th><th>Deskripsi</th></tr></thead>
              <tbody>
                <tr><td><code>/rekomendasi/single</code></td><td><span class="badge-post">POST</span></td><td>Rekomendasi satu dokumen/penelitian</td></tr>
                <tr><td><code>/rekomendasi/batch</code></td><td><span class="badge-post">POST</span></td><td>Rekomendasi massal via JSON</td></tr>
                <tr><td><code>/rekomendasi/batch/upload</code></td><td><span class="badge-post">POST</span></td><td>Rekomendasi massal via Excel</td></tr>
                <tr><td><code>/config</code></td><td><span class="badge-get">GET</span></td><td>Ambil konfigurasi aktif</td></tr>
                <tr><td><code>/config</code></td><td><span class="badge-patch">PATCH</span></td><td>Update konfigurasi</td></tr>
                <tr><td><code>/status</code></td><td><span class="badge-get">GET</span></td><td>Status server & cache</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="auth">
          <h2>Autentikasi</h2>
          <p>
            Semua endpoint API SiReDo (kecuali <code>/health</code> dan <code>/status</code>) dilindungi dan memerlukan autentikasi menggunakan API Key.
            API Key harus disertakan di setiap request melalui HTTP header <code>X-API-Key</code>.
          </p>
          <pre><code><span class="tok-comment">// Contoh penyertaan Header API Key</span>
<span class="tok-key">GET</span> /api/dosen
<span class="tok-key">X-API-Key</span>: srd_live_xxxxxxxxxxxxxxxxxxxxxxxx</code></pre>
          <div class="note note-warn">
            <strong>Catatan Keamanan:</strong>
            Jangan pernah mempublikasikan API Key Anda di frontend publik (seperti di client-side React/Vue tanpa perlindungan).
            Jika aplikasi Anda adalah web publik, simpan API key di backend Anda.
          </div>
        </section>

        <!-- Single -->
        <section id="single">
          <h2>POST /rekomendasi/single</h2>
          <p>
            Menjalankan pipeline rekomendasi lengkap (Preprocessing → BM25 → SBERT → Hybrid Ranking)
            untuk satu dokumen penelitian. Mengembalikan top-K dosen beserta skor dan penjelasan XAI.
          </p>

          <h3>Request Body</h3>
          <div class="param-table">
            <table>
              <thead><tr><th>Parameter</th><th>Tipe</th><th>Wajib</th><th>Keterangan</th></tr></thead>
              <tbody>
                <tr><td><code>judul</code></td><td>string</td><td>✓*</td><td>Judul penelitian/dokumen</td></tr>
                <tr><td><code>abstrak</code></td><td>string</td><td>✓*</td><td>Abstrak penelitian (opsional jika judul diisi)</td></tr>
                <tr><td><code>k_rank</code></td><td>integer</td><td>—</td><td>Jumlah rekomendasi. Default: dari konfigurasi (5)</td></tr>
              </tbody>
            </table>
          </div>
          <p><small>*Minimal salah satu dari <code>judul</code> atau <code>abstrak</code> harus diisi.</small></p>

          <h3>Contoh Request</h3>
          <pre><code><span class="tok-comment">// curl</span>
curl -X POST http://localhost:5000/api/rekomendasi/single \
  -H <span class="tok-str">"Content-Type: application/json"</span> \
  -d '{
    <span class="tok-key">"judul"</span>: <span class="tok-str">"Penerapan Deep Learning untuk Deteksi Penyakit Tanaman"</span>,
    <span class="tok-key">"abstrak"</span>: <span class="tok-str">"Penelitian ini bertujuan mengklasifikasi penyakit daun menggunakan CNN..."</span>,
    <span class="tok-key">"k_rank"</span>: <span class="tok-num">5</span>
  }'</code></pre>

          <h3>Contoh Response</h3>
          <pre><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"data"</span>: {
    <span class="tok-key">"metadata"</span>: {
      <span class="tok-key">"alpha"</span>: <span class="tok-num">0.35</span>,          <span class="tok-comment">// bobot BM25</span>
      <span class="tok-key">"beta"</span>: <span class="tok-num">0.65</span>,           <span class="tok-comment">// bobot SBERT</span>
      <span class="tok-key">"num_query_tokens"</span>: <span class="tok-num">18</span>,  <span class="tok-comment">// panjang query → mode abstrak</span>
      <span class="tok-key">"k_rank"</span>: <span class="tok-num">5</span>
    },
    <span class="tok-key">"pipeline"</span>: {
      <span class="tok-key">"preprocessing"</span>: { <span class="tok-comment">/* token hasil preprocessing */</span> },
      <span class="tok-key">"ekspansi"</span>: { <span class="tok-comment">/* sinonim yang ditemukan */</span> },
      <span class="tok-key">"bm25"</span>: { <span class="tok-comment">/* kandidat & skor BM25 */</span> },
      <span class="tok-key">"sbert"</span>: { <span class="tok-comment">/* kandidat & cosine similarity */</span> },
      <span class="tok-key">"hybrid"</span>: { <span class="tok-comment">/* bobot & mode aktif */</span> }
    },
    <span class="tok-key">"recommendations"</span>: [
      {
        <span class="tok-key">"dosen"</span>: {
          <span class="tok-key">"nidn"</span>: <span class="tok-str">"0012345678"</span>,
          <span class="tok-key">"nama"</span>: <span class="tok-str">"Dr. Ahmad Farid, M.Kom"</span>,
          <span class="tok-key">"program_studi"</span>: <span class="tok-str">"Teknik Informatika"</span>,
          <span class="tok-key">"bidang_keahlian"</span>: <span class="tok-str">"Machine Learning, Computer Vision"</span>,
          <span class="tok-key">"jurnal"</span>: <span class="tok-str">"CNN for Plant Disease, ..."</span>,
          <span class="tok-key">"judul_bimbing"</span>: <span class="tok-str">"Deteksi Objek YOLO, ..."</span>
        },
        <span class="tok-key">"scores"</span>: {
          <span class="tok-key">"hybrid"</span>: <span class="tok-num">0.7821</span>,  <span class="tok-comment">// skor akhir</span>
          <span class="tok-key">"bm25"</span>: <span class="tok-num">0.6543</span>,    <span class="tok-comment">// skor leksikal (0–1)</span>
          <span class="tok-key">"sbert"</span>: <span class="tok-num">0.8712</span>   <span class="tok-comment">// cosine similarity (0–1)</span>
        },
        <span class="tok-key">"xai"</span>: {
          <span class="tok-key">"irisan_kata"</span>: [<span class="tok-str">"deep_learning"</span>, <span class="tok-str">"cnn"</span>, <span class="tok-str">"penyakit"</span>],
          <span class="tok-key">"topik_dosen"</span>: [<span class="tok-str">"image classification"</span>, <span class="tok-str">"neural network"</span>]
        }
      }
    ]
  }
}</code></pre>
        </section>

        <!-- Batch JSON -->
        <section id="batch">
          <h2>POST /rekomendasi/batch</h2>
          <p>
            Menjalankan pipeline rekomendasi untuk banyak data sekaligus melalui JSON payload.
            Cocok untuk integrasi programatik dengan sistem akademik.
          </p>

          <h3>Request Body</h3>
          <p>Array of objects. Setiap objek mewakili satu dokumen penelitian.</p>
          <div class="param-table">
            <table>
              <thead><tr><th>Field</th><th>Tipe</th><th>Wajib</th><th>Keterangan</th></tr></thead>
              <tbody>
                <tr><td><code>id</code></td><td>string</td><td>✓</td><td>Identifier unik dokumen (digunakan untuk mapping output)</td></tr>
                <tr><td><code>judul</code></td><td>string</td><td>✓*</td><td>Judul penelitian</td></tr>
                <tr><td><code>abstrak</code></td><td>string</td><td>—</td><td>Abstrak penelitian</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Contoh Request</h3>
          <pre><code>curl -X POST http://localhost:5000/api/rekomendasi/batch \
  -H <span class="tok-str">"Content-Type: application/json"</span> \
  -d '[
    {
      <span class="tok-key">"id"</span>: <span class="tok-str">"MHS-001"</span>,
      <span class="tok-key">"judul"</span>: <span class="tok-str">"Sistem Deteksi Fraud Menggunakan Random Forest"</span>,
      <span class="tok-key">"abstrak"</span>: <span class="tok-str">"Penelitian ini mengimplementasikan algoritma..."</span>
    },
    {
      <span class="tok-key">"id"</span>: <span class="tok-str">"MHS-002"</span>,
      <span class="tok-key">"judul"</span>: <span class="tok-str">"Analisis Sentimen Ulasan Produk dengan BERT"</span>
    }
  ]'</code></pre>

          <h3>Contoh Response</h3>
          <pre><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"data"</span>: [
    {
      <span class="tok-key">"id"</span>: <span class="tok-str">"MHS-001"</span>,
      <span class="tok-key">"judul"</span>: <span class="tok-str">"Sistem Deteksi Fraud..."</span>,
      <span class="tok-key">"rekomendasi"</span>: {
        <span class="tok-key">"metadata"</span>: { ... },
        <span class="tok-key">"recommendations"</span>: [ ... ]
      }
    }
  ]
}</code></pre>
        </section>

        <!-- Batch Upload -->
        <section id="batch-upload">
          <h2>POST /rekomendasi/batch/upload</h2>
          <p>
            Upload file Excel (<code>.xlsx</code>) untuk memproses banyak dokumen sekaligus.
            File harus mengandung kolom <code>id</code>, <code>judul</code>, dan opsional <code>abstrak</code>.
          </p>

          <h3>Content-Type</h3>
          <pre><code>Content-Type: <span class="tok-str">multipart/form-data</span></code></pre>

          <h3>Form Fields</h3>
          <div class="param-table">
            <table>
              <thead><tr><th>Field</th><th>Tipe</th><th>Keterangan</th></tr></thead>
              <tbody>
                <tr><td><code>file</code></td><td>File (.xlsx)</td><td>File Excel dengan kolom: id, judul, abstrak</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Template Kolom Excel</h3>
          <div class="excel-preview">
            <table>
              <thead><tr><th>id</th><th>judul</th><th>abstrak</th></tr></thead>
              <tbody>
                <tr><td>MHS-001</td><td>Sistem Deteksi Fraud...</td><td>Penelitian ini...</td></tr>
                <tr><td>MHS-002</td><td>Analisis Sentimen...</td><td>(opsional)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Config GET -->
        <section id="config-get">
          <h2>GET /config</h2>
          <p>Mengambil konfigurasi aktif mesin rekomendasi.</p>

          <h3>Response</h3>
          <pre><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"data"</span>: {
    <span class="tok-key">"k_rank"</span>: <span class="tok-num">5</span>,                        <span class="tok-comment">// jumlah top-K dosen</span>
    <span class="tok-key">"threshold"</span>: <span class="tok-num">0.0</span>,                   <span class="tok-comment">// BM25 hard filter minimum</span>
    <span class="tok-key">"adaptive_alpha_threshold"</span>: <span class="tok-num">15</span>     <span class="tok-comment">// batas token keyword vs abstrak</span>
  }
}</code></pre>
        </section>

        <!-- Config PATCH -->
        <section id="config-patch">
          <h2>PATCH /config</h2>
          <p>Memperbarui konfigurasi mesin rekomendasi. Field yang tidak disertakan tidak akan berubah.</p>

          <h3>Request Body</h3>
          <div class="param-table">
            <table>
              <thead><tr><th>Parameter</th><th>Tipe</th><th>Keterangan</th></tr></thead>
              <tbody>
                <tr><td><code>k_rank</code></td><td>integer (1–20)</td><td>Jumlah rekomendasi top-K</td></tr>
                <tr><td><code>threshold</code></td><td>float (0.0–5.0)</td><td>Minimum skor BM25 mentah untuk hard filter</td></tr>
                <tr><td><code>adaptive_alpha_threshold</code></td><td>integer</td><td>Batas token untuk switch mode keyword/abstrak</td></tr>
              </tbody>
            </table>
          </div>
          <pre><code>curl -X PATCH http://localhost:5000/api/config \
  -H <span class="tok-str">"Content-Type: application/json"</span> \
  -d '{ <span class="tok-key">"k_rank"</span>: <span class="tok-num">10</span> }'</code></pre>
        </section>

        <!-- Status -->
        <section id="status">
          <h2>GET /status</h2>
          <p>Memeriksa status server dan apakah model AI (BM25 + SBERT) sudah selesai di-load ke memori.</p>

          <h3>Response</h3>
          <pre><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"data"</span>: {
    <span class="tok-key">"cache_ready"</span>: <span class="tok-bool">true</span>,   <span class="tok-comment">// false = model masih loading</span>
    <span class="tok-key">"message"</span>: <span class="tok-str">"SiReDo v3 is running"</span>
  }
}</code></pre>
          <p>
            Gunakan endpoint ini sebagai <strong>health check</strong>. Tunggu hingga
            <code>cache_ready: true</code> sebelum mengirimkan request rekomendasi.
          </p>
          <blockquote>
            <strong>Update v3.1.0:</strong> Berkat sistem <em>Hybrid Incremental Indexing</em>, status <code>cache_ready</code> tidak akan lagi menjadi <code>false</code> saat terjadi perubahan data dosen (CRUD). Model AI akan di-update secara parsial (<em>on-the-fly</em>) dalam memori tanpa menghentikan layanan (zero downtime).
          </blockquote>
        </section>

        <!-- Errors -->
        <section id="errors">
          <h2>Error Handling</h2>
          <p>SiReDo menggunakan HTTP status code standar. Semua error dikembalikan dalam format JSON.</p>

          <div class="info-table">
            <table>
              <thead><tr><th>Status Code</th><th>Arti</th><th>Penyebab Umum</th></tr></thead>
              <tbody>
                <tr><td><code>200</code></td><td>OK</td><td>Request berhasil</td></tr>
                <tr><td><code>400</code></td><td>Bad Request</td><td>Field wajib kosong, format JSON salah</td></tr>
                <tr><td><code>422</code></td><td>Unprocessable</td><td>Tipe data tidak valid (mis. k_rank bukan integer)</td></tr>
                <tr><td><code>500</code></td><td>Server Error</td><td>Model belum ready, error internal</td></tr>
              </tbody>
            </table>
          </div>

          <pre><code><span class="tok-comment">// Contoh error 400</span>
{
  <span class="tok-key">"status"</span>: <span class="tok-str">"error"</span>,
  <span class="tok-key">"message"</span>: <span class="tok-str">"Judul atau abstrak harus diisi"</span>
}</code></pre>
        </section>

      </div>
    </main>
  </div>
</template>

<style scoped>
/* Two-column layout: page TOC + main content */
.docs-layout {
  display: flex;
  min-height: 100svh;
  position: relative;
}

/* Mobile Bar Trigger (<= 900px) */
.docs-mobile-bar {
  display: none;
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--bg-base);
  border-bottom: 1px solid var(--border);
  padding: 0.65rem 1rem;
}
.docs-mobile-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}
.docs-mobile-trigger:hover {
  background: var(--bg-muted);
}
.docs-mobile-icon {
  width: 18px;
  height: 18px;
  color: var(--brand);
}
.docs-mobile-label {
  flex: 1;
  text-align: left;
}
.docs-mobile-tag {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--brand);
  background: var(--brand-light);
  padding: 2px 7px;
  border-radius: 99px;
  border: 1px solid var(--brand-border);
}

.docs-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 90;
}

/* Nested Dropdown Sidebar */
.toc-sidebar {
  width: 270px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100svh;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  background: var(--bg-subtle);
  display: flex;
  flex-direction: column;
  z-index: 50;
}

/* Header inside sidebar */
.toc-header {
  padding: 1.25rem 1rem 0.85rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-base);
  position: sticky;
  top: 0;
  z-index: 10;
}
.toc-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.toc-brand-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.toc-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-primary);
}
.toc-badge-version {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  padding: 1px 6px;
  border-radius: 99px;
}
.toc-mobile-close {
  display: none;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}
.toc-mobile-close:hover {
  color: var(--text-primary);
}

/* Search input */
.toc-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.toc-search-icon {
  position: absolute;
  left: 0.65rem;
  width: 15px;
  height: 15px;
  color: var(--text-muted);
  pointer-events: none;
}
.toc-search-input {
  width: 100%;
  padding: 0.4rem 1.8rem 0.4rem 2rem;
  font-size: 0.78rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  outline: none;
  transition: all 0.15s;
}
.toc-search-input:focus {
  border-color: var(--brand);
  background: var(--bg-base);
  box-shadow: 0 0 0 2px var(--brand-ring);
}
.toc-search-clear {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
}

/* Nav list */
.toc-nav {
  padding: 0.85rem 0.65rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Group */
.toc-group {
  display: flex;
  flex-direction: column;
}

/* Parent Dropdown Header */
.toc-group-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.65rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  color: var(--text-primary);
}
.toc-group-header:hover {
  background: var(--bg-muted);
}
.toc-group-header--expanded {
  font-weight: 600;
}
.toc-group-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}
.toc-group-icon {
  width: 15px;
  height: 15px;
  color: var(--brand);
  flex-shrink: 0;
}
.toc-group-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.toc-chevron {
  width: 13px;
  height: 13px;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.toc-chevron--open {
  transform: rotate(90deg);
  color: var(--brand);
}

/* Sublist (Nested Children) */
.toc-sublist {
  display: flex;
  flex-direction: column;
  padding-left: 0.75rem;
  margin-left: 0.85rem;
  margin-top: 0.2rem;
  margin-bottom: 0.35rem;
  border-left: 1.5px solid var(--border);
  gap: 2px;
}

/* Subitem link */
.toc-subitem {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0.65rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  transition: background 0.12s, color 0.12s, border-left 0.12s;
  border-left: 2px solid transparent;
}
.toc-subitem:hover {
  background: var(--bg-muted);
  color: var(--text-primary);
}
.toc-subitem.active {
  background: var(--brand-light);
  color: var(--brand);
  font-weight: 600;
  border-left: 2.5px solid var(--brand);
}
.toc-subitem-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.toc-subitem-label {
  font-size: 0.77rem;
  font-family: var(--font-mono);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.toc-subitem-desc {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 1px;
  padding-left: 0;
  font-family: var(--font-sans);
}
.toc-subitem.active .toc-subitem-desc {
  color: var(--brand-dim);
}

/* Bullet Dot */
.toc-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
  opacity: 0.5;
  transition: all 0.15s;
}
.toc-dot--active {
  background: var(--brand);
  opacity: 1;
  transform: scale(1.3);
}

/* Method badge inside subitem */
.toc-method {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}
.toc-method--post {
  background: var(--brand-light);
  color: var(--brand);
  border: 1px solid var(--brand-border);
}
.toc-method--get {
  background: var(--blue-bg);
  color: var(--blue);
  border: 1px solid var(--blue-border);
}
.toc-method--patch {
  background: var(--amber-bg);
  color: var(--amber);
  border: 1px solid var(--amber-border);
}

.toc-empty {
  padding: 1.5rem 0.5rem;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-style: italic;
}

/* Main content */
.docs-main {
  flex: 1;
  min-width: 0;
  padding: 3rem 2.5rem 5rem;
}
.docs-prose {
  max-width: var(--content-max);
}

/* Page header */
.page-header { margin-bottom: 2rem; }
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
  margin-bottom: 1rem;
}
.page-lead {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.75;
  margin-bottom: 1.5rem !important;
}
.base-url-box {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: #0f0f14;
  border-radius: var(--radius-lg);
  padding: 0.65rem 1.25rem;
  margin-bottom: 0.5rem;
}
.bu-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  font-family: var(--font-mono);
}
.bu-val {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  color: #a6e3a1;
  background: none;
  border: none;
  padding: 0;
}

/* Tables */
.info-table, .param-table {
  margin: 1rem 0 1.5rem;
  overflow-x: auto;
}
.info-table table, .param-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.info-table th, .param-table th {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  padding: 0.6rem 0.9rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
}
.info-table td, .param-table td {
  border: 1px solid var(--border);
  padding: 0.6rem 0.9rem;
  color: var(--text-secondary);
  vertical-align: top;
  line-height: 1.5;
}
.info-table code, .param-table code {
  font-size: 0.8rem;
}

/* Excel preview */
.excel-preview {
  margin: 1rem 0 1.5rem;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.excel-preview table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.excel-preview th {
  background: #f0fdf4;
  color: var(--green);
  font-weight: 700;
  font-size: 0.75rem;
  border-bottom: 1px solid var(--green-border);
  padding: 0.5rem 0.85rem;
  text-align: left;
  font-family: var(--font-mono);
}
.excel-preview td {
  padding: 0.5rem 0.85rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.82rem;
}

/* HTTP Method badges */
.badge-post  { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-sm); background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
.badge-get   { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-sm); background: var(--blue-bg); color: var(--blue); border: 1px solid var(--blue-border); }
.badge-patch { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-sm); background: var(--amber-bg); color: var(--amber); border: 1px solid var(--amber-border); }

@media (max-width: 900px) {
  .docs-layout {
    flex-direction: column;
  }
  .docs-mobile-bar {
    display: block;
  }
  .toc-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 290px;
    height: 100svh;
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  .toc-sidebar--mobile-open {
    transform: translateX(0);
  }
  .toc-mobile-close {
    display: block;
  }
  .docs-main {
    padding: 2rem 1.25rem 4rem;
  }
}
</style>
