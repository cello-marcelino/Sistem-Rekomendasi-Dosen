<script setup>
import { ref } from 'vue'

const activeLang = ref('vue') // 'vue' | 'fetch' | 'php'
</script>

<template>
  <div class="quickstart-page animate-in">
    <!-- Header -->
    <div class="page-header">
      <div class="flex items-center gap-2 mb-2">
        <span class="page-badge">PANDUAN CEPAT</span>
        <span class="badge-time">ESTIMASI: ~3 MENIT</span>
      </div>
      <h1 class="page-title">Quickstart Developer</h1>
      <p class="page-lead">
        Panduan langkah demi langkah untuk mengintegrasikan mesin rekomendasi dosen SiReDo ke dalam portal akademik atau sistem kampus Anda.
      </p>

      <!-- Highlights Ribbon -->
      <div class="tech-stack-ribbon">
        <span class="ribbon-label">KOMPATIBILITAS:</span>
        <span class="tech-pill">Vue 3 / React</span>
        <span class="tech-pill">Laravel / PHP</span>
        <span class="tech-pill">Node.js / Express</span>
        <span class="tech-pill">Python / FastAPI</span>
        <span class="tech-pill">REST cURL</span>
      </div>
    </div>

    <!-- Stepper Tracker -->
    <div class="stepper-container">
      <a href="#step-1" class="step-nav-item">
        <div class="step-num bg-brand-light text-brand">1</div>
        <div class="step-info">
          <span class="step-title">Dapatkan API Key</span>
          <span class="step-sub">Registrasi & Token</span>
        </div>
      </a>
      <div class="step-connector"></div>
      <a href="#step-2" class="step-nav-item">
        <div class="step-num bg-blue-bg text-blue-main">2</div>
        <div class="step-info">
          <span class="step-title">Request Pertama</span>
          <span class="step-sub">Uji coba cURL</span>
        </div>
      </a>
      <div class="step-connector"></div>
      <a href="#step-3" class="step-nav-item">
        <div class="step-num bg-green-bg text-green-main">3</div>
        <div class="step-info">
          <span class="step-title">Integrasi Klien</span>
          <span class="step-sub">Frontend / Backend</span>
        </div>
      </a>
    </div>

    <!-- Steps Flow -->
    <div class="space-y-8 mt-8">

      <!-- Step 1 Card -->
      <div id="step-1" class="step-card">
        <div class="step-header">
          <div class="step-badge-num">1</div>
          <div>
            <h2 class="step-heading">Dapatkan Kredensial API Key</h2>
            <p class="step-desc">Semua endpoint rekomendasi SiReDo membutuhkan autentikasi header <code>X-API-Key</code>.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div class="key-preview-box">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Mock Developer Token</span>
              <span class="px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-green-bg text-green-main border border-green-border">Active</span>
            </div>
            <div class="key-display-field">
              <code class="text-sm font-mono text-brand font-semibold">srd_live_9b4e72ac01f89c4...</code>
            </div>
            <p class="text-xs text-text-muted mt-3 leading-relaxed">
              Token unik berbasis HMAC untuk mengidentifikasi request sistem kampus Anda dan mencatat analitik rekomendasi.
            </p>
          </div>

          <div class="flex flex-col justify-center gap-3 p-5 bg-bg-subtle rounded-xl border border-border">
            <h4 class="text-sm font-bold text-text-primary">Belum memiliki API Key?</h4>
            <p class="text-xs text-text-secondary leading-relaxed">
              Daftarkan institusi atau nama pengembang Anda secara instan di portal developer SiReDo untuk memperoleh token aktif.
            </p>
            <div>
              <router-link to="/docs/api-key" class="btn-primary inline-flex items-center gap-2">
                Daftar & Ambil API Key
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2 Card -->
      <div id="step-2" class="step-card">
        <div class="step-header">
          <div class="step-badge-num">2</div>
          <div>
            <h2 class="step-heading">Kirim Permintaan Rekomendasi Pertama</h2>
            <p class="step-desc">Gunakan cURL atau REST client untuk menguji respon mesin rekomendasi secara langsung.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <!-- Request -->
          <div class="code-box">
            <div class="code-box-header">
              <span class="code-box-title">HTTP POST cURL</span>
              <span class="badge-post text-xs">POST</span>
            </div>
            <pre class="code-box-content"><code>curl -X POST http://localhost:5000/api/rekomendasi/single \
  -H <span class="tok-str">"Content-Type: application/json"</span> \
  -H <span class="tok-str">"X-API-Key: YOUR_API_KEY"</span> \
  -d '{
    <span class="tok-key">"judul"</span>: <span class="tok-str">"Analisis Sentimen Twitter Menggunakan IndoBERT"</span>,
    <span class="tok-key">"abstrak"</span>: <span class="tok-str">"Penelitian ini membandingkan akurasi IndoBERT dengan LSTM..."</span>,
    <span class="tok-key">"k_rank"</span>: <span class="tok-num">5</span>
  }'</code></pre>
          </div>

          <!-- Expected Response -->
          <div class="code-box">
            <div class="code-box-header">
              <span class="code-box-title text-green-main">Expected Response (200 OK)</span>
              <span class="text-xs font-mono text-text-muted">JSON Response</span>
            </div>
            <pre class="code-box-content"><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"data"</span>: {
    <span class="tok-key">"recommendations"</span>: [
      {
        <span class="tok-key">"dosen"</span>: {
          <span class="tok-key">"nama"</span>: <span class="tok-str">"Dr. Ahmad Farid, M.Kom"</span>,
          <span class="tok-key">"bidang_keahlian"</span>: <span class="tok-str">"Natural Language Processing"</span>
        },
        <span class="tok-key">"scores"</span>: {
          <span class="tok-key">"hybrid"</span>: <span class="tok-num">0.864</span>,
          <span class="tok-key">"bm25"</span>: <span class="tok-num">0.781</span>,
          <span class="tok-key">"sbert"</span>: <span class="tok-num">0.908</span>
        }
      }
    ]
  }
}</code></pre>
          </div>
        </div>
      </div>

      <!-- Step 3 Card -->
      <div id="step-3" class="step-card">
        <div class="step-header">
          <div class="step-badge-num">3</div>
          <div>
            <h2 class="step-heading">Integrasikan ke Aplikasi Klien</h2>
            <p class="step-desc">Pilih bahasa atau framework yang digunakan di sistem kampus Anda.</p>
          </div>
        </div>

        <!-- Language Selector Tabs -->
        <div class="flex gap-2 border-b border-border pb-3 mt-4">
          <button 
            @click="activeLang = 'vue'"
            :class="activeLang === 'vue' ? 'tab-btn-active' : 'tab-btn-inactive'"
          >
            Vue 3 / React (Axios)
          </button>
          <button 
            @click="activeLang = 'fetch'"
            :class="activeLang === 'fetch' ? 'tab-btn-active' : 'tab-btn-inactive'"
          >
            Fetch API (Modern JS)
          </button>
          <button 
            @click="activeLang = 'php'"
            :class="activeLang === 'php' ? 'tab-btn-active' : 'tab-btn-inactive'"
          >
            PHP / Laravel
          </button>
        </div>

        <!-- Code Snippet Container -->
        <div class="mt-4">
          <!-- Vue / Axios -->
          <div v-if="activeLang === 'vue'" class="code-box">
            <div class="code-box-header">
              <span class="code-box-title">services/api.js (Axios Instance)</span>
            </div>
            <pre class="code-box-content"><code><span class="tok-keyword">import</span> axios <span class="tok-keyword">from</span> <span class="tok-str">'axios'</span>;

<span class="tok-keyword">const</span> siredoClient = axios.create({
  baseURL: import.meta.env.VITE_SIREDO_URL || <span class="tok-str">'http://localhost:5000/api'</span>,
  headers: {
    <span class="tok-str">'X-API-Key'</span>: import.meta.env.VITE_SIREDO_API_KEY,
    <span class="tok-str">'Content-Type'</span>: <span class="tok-str">'application/json'</span>
  },
  timeout: <span class="tok-num">5000</span>
});

<span class="tok-keyword">export async function</span> <span class="tok-fn">getRecommendation</span>(judul, abstrak, k = <span class="tok-num">5</span>) {
  <span class="tok-keyword">const</span> res = <span class="tok-keyword">await</span> siredoClient.post(<span class="tok-str">'/rekomendasi/single'</span>, {
    judul,
    abstrak,
    k_rank: k
  });
  <span class="tok-keyword">return</span> res.data.data.recommendations;
}</code></pre>
          </div>

          <!-- Fetch API -->
          <div v-else-if="activeLang === 'fetch'" class="code-box">
            <div class="code-box-header">
              <span class="code-box-title">Vanilla JS / Node.js (fetch)</span>
            </div>
            <pre class="code-box-content"><code><span class="tok-keyword">async function</span> <span class="tok-fn">fetchRekomendasiDosen</span>(judul) {
  <span class="tok-keyword">const</span> response = <span class="tok-keyword">await</span> fetch(<span class="tok-str">'http://localhost:5000/api/rekomendasi/single'</span>, {
    method: <span class="tok-str">'POST'</span>,
    headers: {
      <span class="tok-str">'Content-Type'</span>: <span class="tok-str">'application/json'</span>,
      <span class="tok-str">'X-API-Key'</span>: process.env.SIREDO_API_KEY
    },
    body: JSON.stringify({ judul, k_rank: <span class="tok-num">5</span> })
  });

  <span class="tok-keyword">const</span> result = <span class="tok-keyword">await</span> response.json();
  <span class="tok-keyword">return</span> result.data.recommendations;
}</code></pre>
          </div>

          <!-- PHP / Laravel -->
          <div v-else-if="activeLang === 'php'" class="code-box">
            <div class="code-box-header">
              <span class="code-box-title">app/Services/SiReDoService.php (Laravel)</span>
            </div>
            <pre class="code-box-content"><code><span class="tok-keyword">&lt;?php</span>
<span class="tok-keyword">namespace</span> App\Services;

<span class="tok-keyword">use</span> Illuminate\Support\Facades\Http;

<span class="tok-keyword">class</span> <span class="tok-fn">SiReDoService</span> {
    <span class="tok-keyword">public function</span> <span class="tok-fn">getRekomendasi</span>(string $judul, string $abstrak = <span class="tok-str">''</span>) {
        $response = Http::withHeaders([
            <span class="tok-str">'X-API-Key'</span> => config(<span class="tok-str">'services.siredo.key'</span>),
            <span class="tok-str">'Content-Type'</span> => <span class="tok-str">'application/json'</span>,
        ])->post(<span class="tok-str">'http://localhost:5000/api/rekomendasi/single'</span>, [
            <span class="tok-str">'judul'</span> => $judul,
            <span class="tok-str">'abstrak'</span> => $abstrak,
            <span class="tok-str">'k_rank'</span> => <span class="tok-num">5</span>,
        ]);

        <span class="tok-keyword">return</span> $response->json()[<span class="tok-str">'data'</span>][<span class="tok-str">'recommendations'</span>] ?? [];
    }
}</code></pre>
          </div>
        </div>
      </div>

    </div>

    <!-- Next Actions Grid -->
    <div class="next-grid">
      <router-link to="/docs/api" class="next-card group">
        <div class="next-icon bg-brand-light text-brand">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <div>
          <h4 class="next-title">Jelajahi API Reference</h4>
          <p class="next-desc">Daftar endpoint lengkap untuk batch processing dan tuning konfigurasi.</p>
        </div>
      </router-link>

      <router-link to="/docs/pipeline" class="next-card group">
        <div class="next-icon bg-blue-bg text-blue-main">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div>
          <h4 class="next-title">Pelajari Pipeline NLP</h4>
          <p class="next-desc">Pahami cara kerja BM25, IndoBERT/SBERT, dan Explainable AI (XAI).</p>
        </div>
      </router-link>

      <router-link to="/docs/caching" class="next-card group">
        <div class="next-icon bg-green-bg text-green-main">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h4 class="next-title">Metode Caching & Indexing</h4>
          <p class="next-desc">Arsitektur penyimpanan indeks memori dan sinkronisasi data di latar belakang.</p>
        </div>
      </router-link>
    </div>

  </div>
</template>

<style scoped>
.quickstart-page {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 2.5rem 3.5rem 5rem 3.5rem;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 2rem;
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

.badge-time {
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
  margin: 0 0 1.25rem;
}

.tech-stack-ribbon {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.ribbon-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
}

.tech-pill {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-base);
  border: 1px solid var(--border);
  padding: 3px 9px;
  border-radius: var(--radius-sm);
}

/* Stepper */
.stepper-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow-x: auto;
}

.step-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  flex-shrink: 0;
}

.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
}

.step-info {
  display: flex;
  flex-direction: column;
}

.step-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

.step-sub {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.step-connector {
  flex: 1;
  min-width: 24px;
  height: 1px;
  background: var(--border);
}

/* Step Card */
.step-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.step-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-badge-num {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: var(--brand-light);
  color: var(--brand);
  border: 1px solid var(--brand-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.step-heading {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.step-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Key preview */
.key-preview-box {
  background: #0f0f14;
  border: 1px solid #1e1e2e;
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.key-display-field {
  background: #181825;
  border: 1px solid #28283d;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.btn-primary {
  background: var(--brand);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: var(--brand-dark);
}

/* Code box */
.code-box {
  background: #0f0f14;
  border: 1px solid #1e1e2e;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.code-box-header {
  background: #181825;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #28283d;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.code-box-title {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  color: #a6adc8;
}

.code-box-content {
  padding: 1rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.6;
  color: #cdd6f4;
  overflow-x: auto;
}

/* Tab button */
.tab-btn-active {
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.tab-btn-inactive {
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.tab-btn-inactive:hover {
  background: var(--bg-subtle);
}

/* Next Actions */
.next-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
  margin-top: 2.5rem;
  width: 100%;
}

.next-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  text-decoration: none;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.next-card:hover {
  border-color: var(--brand-border);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(114, 9, 183, 0.06);
}

.next-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.next-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.next-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Syntax colors */
.tok-key { color: #89b4fa; }
.tok-str { color: #a6e3a1; }
.tok-num { color: #fab387; }
.tok-keyword { color: #cba6f7; }
.tok-fn { color: #89dceb; }

.badge-post { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-sm); background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }

@media (max-width: 1024px) {
  .next-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .quickstart-page {
    padding: 2rem 1.25rem 4rem;
  }
  .stepper-container {
    flex-direction: column;
    align-items: stretch;
  }
  .step-connector {
    display: none;
  }
}
</style>
