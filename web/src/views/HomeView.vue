<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import SingleRecommendationView from './SingleRecommendationView.vue'

const router = useRouter()
const serverStatus = ref('checking')
const cacheReady = ref(false)

const checkStatus = async () => {
  try {
    const res = await api.get('/status')
    serverStatus.value = 'online'
    cacheReady.value = res.data.data.cache_ready
  } catch {
    serverStatus.value = 'offline'
  }
}
onMounted(checkStatus)
</script>

<template>
  <div class="home">
    <!-- Top bar -->
    <header class="home-topbar">
      <div class="topbar-brand">
        <div class="topbar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <span class="topbar-name">SiReDo<span class="topbar-api"> API</span></span>
      </div>
      <div class="topbar-links">
        <span class="topbar-status">
          <span :class="['status-dot', serverStatus === 'online' && cacheReady ? 'dot-green' : serverStatus === 'online' ? 'dot-amber' : 'dot-red']"></span>
          {{ serverStatus === 'online' && cacheReady ? 'Online' : serverStatus === 'online' ? 'Warming Up' : 'Offline' }}
        </span>
        <router-link to="/docs/quickstart" class="tl tl-btn">Mulai Integrasi</router-link>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero-section">
      <div class="hero-inner">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          REST API ENGINE REKOMENDASI TUGAS AKHIR
        </div>

        <h1 class="hero-title">
          Sistem Rekomendasi Dosen<br>
          <span class="hero-highlight">Berbasis Hybrid AI</span>
        </h1>
        <p class="hero-desc">
          SiReDo API menjembatani sistem informasi akademik (SIAKAD) dengan engine <strong>BM25</strong> (lexical) dan <strong>SBERT</strong> (semantic) untuk mencocokkan dosen pembimbing dan penguji secara otomatis.
        </p>
        <div class="hero-actions">
          <router-link to="/docs/quickstart" class="btn-primary">Mulai Integrasi →</router-link>
          <a href="#demo" class="btn-ghost">Simulasi Langsung ↓</a>
        </div>

        <!-- Quick stats -->
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-val">BM25</span>
            <span class="stat-lbl">Lexical Scoring</span>
          </div>
          <div class="stat-div"></div>
          <div class="stat">
            <span class="stat-val">SBERT</span>
            <span class="stat-lbl">Semantic Scoring</span>
          </div>
          <div class="stat-div"></div>
          <div class="stat">
            <span class="stat-val">Hybrid</span>
            <span class="stat-lbl">Adaptive Ranking</span>
          </div>
          <div class="stat-div"></div>
          <div class="stat">
            <span class="stat-val">XAI</span>
            <span class="stat-lbl">Explainability</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Masalah & Solusi Section -->
    <section class="story-section">
      <div class="story-inner">
        <div class="section-label">Tantangan &amp; Solusi</div>
        <h2 class="section-title">Mengapa Kampus Membutuhkan SiReDo API?</h2>
        <p class="section-desc">Mengubah proses alokasi manual yang memakan waktu menjadi pencocokan berbasis data yang instan dan objektif.</p>

        <div class="story-grid">
          <!-- Problem Card -->
          <div class="story-card story-card--problem">
            <div class="story-header">
              <span class="story-dot dot-red"></span>
              <span class="story-tag tag-red">Tantangan Konvensional</span>
            </div>
            <ul class="story-list">
              <li>
                <span class="list-bullet text-red">✕</span>
                <span><strong>Sortir Manual:</strong> Membaca ratusan proposal skripsi satu per satu di setiap awal semester memakan waktu 1–2 minggu.</span>
              </li>
              <li>
                <span class="list-bullet text-red">✕</span>
                <span><strong>Pencarian Kata Kunci Biasa:</strong> Istilah riset baru atau bahasa Inggris sering luput dari pencarian teks statis.</span>
              </li>
              <li>
                <span class="list-bullet text-red">✕</span>
                <span><strong>Risiko Mismatch:</strong> Beban bimbingan menumpuk dan dosen sering ditugaskan di luar kepakaran utamanya.</span>
              </li>
            </ul>
          </div>

          <!-- Solution Card -->
          <div class="story-card story-card--solution">
            <div class="story-header">
              <span class="story-dot dot-green"></span>
              <span class="story-tag tag-green">Solusi SiReDo API</span>
            </div>
            <ul class="story-list">
              <li>
                <span class="list-bullet text-green">✓</span>
                <span><strong>Hybrid BM25 + SBERT:</strong> Menggabungkan kata kunci publikasi ilmiah dengan pemahaman makna topik riset terkini.</span>
              </li>
              <li>
                <span class="list-bullet text-green">✓</span>
                <span><strong>REST API Plug &amp; Play:</strong> Terintegrasi ke portal tugas akhir atau SIAKAD kampus mana pun hanya via HTTP JSON.</span>
              </li>
              <li>
                <span class="list-bullet text-green">✓</span>
                <span><strong>Transparansi Skor (XAI):</strong> Setiap rekomendasi disertai skor numerik terukur dan irisan kata kunci untuk audit prodi.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Possibilities Section (Fitur yang Bisa Dibangun) -->
    <section class="possibilities-section">
      <div class="possibilities-inner">
        <div class="section-label">Kapabilitas Integrasi</div>
        <h2 class="section-title">Fitur yang Dapat Anda Bangun dengan SiReDo API</h2>
        <p class="section-desc">Satu set endpoint REST terpadu untuk membuka beragam automasi cerdas di sistem informasi akademik Anda.</p>

        <div class="possibilities-grid">
          <!-- Possibility 1 -->
          <div class="possibility-card">
            <div class="possibility-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3>1. Rekomendasi Pembimbing Real-time</h3>
            <p>Tampilkan saran calon pembimbing langsung di portal saat mahasiswa mengetik draf judul dan proposal skripsi.</p>
            <div class="possibility-footer">
              <code>POST /api/rekomendasi/single</code>
            </div>
          </div>

          <!-- Possibility 2 -->
          <div class="possibility-card">
            <div class="possibility-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h3>2. Penugasan Penguji Sidang Otomatis</h3>
            <p>Hubungkan ke jadwal sidang untuk mencocokkan mahasiswa dengan dosen penguji yang paling kompeten tanpa bentrok topik.</p>
            <div class="possibility-footer">
              <code>POST /api/rekomendasi/batch</code>
            </div>
          </div>

          <!-- Possibility 3 -->
          <div class="possibility-card">
            <div class="possibility-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
            </div>
            <h3>3. Audit Riset Angkatan via Spreadsheet</h3>
            <p>Unggah satu berkas Excel berisi 100+ proposal untuk memetakan sebaran topik riset mahasiswa terhadap kapasitas dosen.</p>
            <div class="possibility-footer">
              <code>POST /api/batch/upload</code>
            </div>
          </div>

          <!-- Possibility 4 -->
          <div class="possibility-card">
            <div class="possibility-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3>4. Bukti Akreditasi &amp; Transparansi Skor</h3>
            <p>Dapatkan data irisan kata kunci dan riwayat publikasi sebagai dasar objektif penetapan dosen tugas akhir prodi.</p>
            <div class="possibility-footer">
              <code>scores.hybrid &amp; xai</code>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Docs cards grid (5 Halaman Dokumentasi Sesuai Urutan) -->
    <section class="docs-section">
      <div class="docs-inner">

        <div class="section-label">Dokumentasi & Integrasi</div>

        <div class="cards-grid">
          <!-- 1. Quickstart -->
          <router-link to="/docs/quickstart" class="doc-card">
            <div class="card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h3>1. Quickstart</h3>
            <p>Panduan cepat 3 langkah untuk mengintegrasikan SiReDo API ke dalam aplikasi frontend atau backend.</p>
            <span class="card-cta">Mulai integrasi →</span>
          </router-link>

          <!-- 2. Dokumentasi API -->
          <router-link to="/docs/api" class="doc-card">
            <div class="card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3>2. Dokumentasi API</h3>
            <p>Spesifikasi endpoint REST lengkap untuk single, batch JSON, batch Excel upload, config, dan status.</p>
            <span class="card-cta">Lihat endpoint REST →</span>
          </router-link>

          <!-- 3. Pipeline NLP -->
          <router-link to="/docs/pipeline" class="doc-card">
            <div class="card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <h3>3. Pipeline NLP</h3>
            <p>Pelajari tahapan pengolahan teks dari preprocessing, ekspansi sinonim, BM25, SBERT, hingga Hybrid Ranking.</p>
            <span class="card-cta">Pelajari pipeline →</span>
          </router-link>

          <!-- 4. Caching & Indexing Method -->
          <router-link to="/docs/caching" class="doc-card">
            <div class="card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zM9 12h6M9 8h6M9 16h4"/></svg>
            </div>
            <h3>4. Caching & Indexing Method</h3>
            <p>Arsitektur penyimpanan indeks memori dan sinkronisasi data dosen secara konsisten di latar belakang.</p>
            <span class="card-cta">Baca arsitektur →</span>
          </router-link>

          <!-- 5. API Key -->
          <router-link to="/docs/api-key" class="doc-card">
            <div class="card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            </div>
            <h3>5. API Key</h3>
            <p>Daftar sebagai developer institusi untuk mendapatkan kredensial API Key yang aman untuk setiap request.</p>
            <span class="card-cta">Kelola API Key →</span>
          </router-link>

          <!-- Client App Link -->
          <a href="http://localhost:5174" target="_blank" class="doc-card">
            <div class="card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h3>Polibatam SiReDo</h3>
            <p>Portal web contoh kampus yang mengonsumsi API ini untuk direktori dosen, penjadwalan, dan batch.</p>
            <span class="card-cta">Buka aplikasi (:5174) →</span>
          </a>
        </div>

        <!-- Quick install / base URL info -->
        <div class="quickstart">
          <div class="qs-label">Base URL</div>
          <pre class="qs-code"><span class="tok-key">POST</span>  http://localhost:5000/api/rekomendasi/single
<span class="tok-key">POST</span>  http://localhost:5000/api/rekomendasi/batch
<span class="tok-key">GET</span>   http://localhost:5000/api/config
<span class="tok-key">GET</span>   http://localhost:5000/api/status</pre>
        </div>
      </div>
    </section>

    <!-- Demo Section (Single Recommendation) -->
    <section id="demo" class="demo-section">
      <div class="demo-inner">
        <SingleRecommendationView />
      </div>
    </section>

    <footer class="home-footer">
      <p>SiReDo v3 · Sistem Rekomendasi Dosen · Hybrid BM25 + SBERT</p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  background: var(--bg);
}

/* Top bar */
.home-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.5rem;
  height: 60px;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 10;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
}
.topbar-brand { display: flex; align-items: center; gap: 0.6rem; }
.topbar-logo {
  width: 28px; height: 28px;
  background: var(--brand);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: white;
}
.topbar-logo svg { width: 15px; height: 15px; }
.topbar-name { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.topbar-api { color: var(--brand); }
.topbar-links { display: flex; align-items: center; gap: 0.25rem; }
.tl {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius);
  transition: background 0.15s, color 0.15s;
}
.tl:hover { background: var(--bg-muted); color: var(--text-primary); }
.tl-btn {
  background: var(--brand);
  color: white !important;
  font-weight: 600;
  margin-left: 0.25rem;
}
.tl-btn:hover { background: var(--brand-dim); }

/* Hero */
.hero-section {
  border-bottom: 1px solid var(--border);
  background: linear-gradient(160deg, oklch(97.8% 0.018 292.581) 0%, #ffffff 60%);
}
.hero-inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 5rem 2rem 4rem;
  text-align: center;
}
.topbar-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  padding-right: 1rem;
  border-right: 1px solid var(--border);
  margin-right: 0.5rem;
}
.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
.dot-green { background: var(--green); }
.dot-amber { background: var(--amber); }
.dot-red   { background: var(--red); }

@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.15;
  color: var(--text-primary);
  margin: 0 0 1.25rem;
}
.hero-highlight {
  color: var(--brand);
}
.hero-desc {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.75;
  max-width: 580px;
  margin: 0 auto 2rem;
}
.hero-desc strong { color: var(--text-primary); font-weight: 600; }
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 3.5rem;
}
.btn-primary {
  background: var(--brand);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 1.5rem;
  border-radius: var(--radius);
  text-decoration: none;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  border: 1px solid var(--brand);
  box-shadow: 0 4px 14px oklch(49.1% 0.27 292.581 / 0.22);
}
.btn-primary:hover { background: var(--brand-dark); transform: translateY(-1px); box-shadow: 0 6px 18px oklch(49.1% 0.27 292.581 / 0.3); }
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.65rem 1.5rem;
  border-radius: var(--radius);
  text-decoration: none;
  border: 1px solid var(--border);
  transition: background 0.15s, color 0.15s;
}
.btn-ghost:hover { background: var(--bg-muted); color: var(--text-primary); }

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.stat { text-align: center; }
.stat-val { display: block; font-size: 0.9rem; font-weight: 700; font-family: var(--font-mono); color: var(--brand); }
.stat-lbl { display: block; font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }
.stat-div { width: 1px; height: 28px; background: var(--border); }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  padding: 0.35rem 0.85rem;
  border-radius: 99px;
  margin-bottom: 1.5rem;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
}

/* Story section (Masalah & Solusi) */
.story-section {
  border-bottom: 1px solid var(--border);
  background: var(--bg-subtle);
  padding: 4.5rem 0;
}
.story-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}
.section-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin: 0 0 0.4rem;
}
.section-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 2rem;
  line-height: 1.6;
}
.story-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
.story-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}
.story-card--problem {
  border-top: 3px solid var(--red);
}
.story-card--solution {
  border-top: 3px solid var(--green);
}
.story-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.story-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.story-tag {
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.tag-red { color: var(--red); }
.tag-green { color: var(--green); }
.story-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.story-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.83rem;
  line-height: 1.55;
  color: var(--text-secondary);
}
.story-list strong {
  color: var(--text-primary);
}
.list-bullet {
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1.2;
  flex-shrink: 0;
}
.text-red { color: var(--red); }
.text-green { color: var(--green); }

/* Possibilities section */
.possibilities-section {
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  padding: 4.5rem 0;
}
.possibilities-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}
.possibilities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}
.possibility-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.possibility-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand);
  margin-bottom: 0.25rem;
}
.possibility-icon svg {
  width: 22px;
  height: 22px;
}
.possibility-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}
.possibility-card p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}
.possibility-footer {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}
.possibility-footer code {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg-muted);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .story-grid, .possibilities-grid {
    grid-template-columns: 1fr;
  }
}

/* Docs section */
.docs-section {
  flex: 1;
  padding: 3.5rem 0 4rem;
}
.docs-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}
.section-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}
.doc-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.4rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.doc-card:hover {
  border-color: var(--brand-border);
  box-shadow: 0 8px 24px oklch(49.1% 0.27 292.581 / 0.08);
  transform: translateY(-2px);
}
.doc-card-feature {
  grid-column: span 2;
  background: linear-gradient(150deg, var(--bg) 0%, oklch(98.5% 0.01 292.581) 100%);
  border-color: var(--brand-border);
}
.card-icon {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}
.doc-card:hover .card-icon {
  color: var(--brand);
}
.card-icon svg { width: 20px; height: 20px; }
.doc-card h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.doc-card p {
  font-size: 0.83rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}
.card-cta {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--brand);
  margin-top: 0.5rem;
}

/* Quickstart */
.quickstart {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.qs-label {
  padding: 0.65rem 1rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
.qs-code {
  margin: 0;
  padding: 1.25rem 1.5rem;
  background: #0f0f14;
  color: #e4e4f0;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.9;
  overflow-x: auto;
}

/* Demo section */
.demo-section {
  background: var(--bg-subtle);
  border-top: 1px solid var(--border);
  padding: 0;
}
.demo-inner {
  max-width: 1400px;
  margin: 0 auto;
}

/* Footer */
.home-footer {
  border-top: 1px solid var(--border);
  padding: 1.25rem 2rem;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-muted);
}
.home-footer p { margin: 0; }

@media (max-width: 640px) {
  .home-topbar { padding: 0 1rem; }
  .hero-inner { padding: 3rem 1rem 2.5rem; }
  .doc-card-feature { grid-column: span 1; }
  .topbar-links .tl:not(.tl-btn) { display: none; }
}
</style>
