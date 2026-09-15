<script setup>
import { ref } from 'vue'

const activeLang = ref('vue') // 'vue' | 'fetch' | 'php'
</script>

<template>
  <div class="quickstart-page animate-in">
    <!-- Header -->
    <div class="page-header">
      <div class="flex items-center gap-2 mb-2">
        <span class="page-badge">PANDUAN INTEGRASI</span>
      </div>
      <h1 class="page-title">Quickstart Integrasi</h1>
      <p class="page-lead">
        Integrasikan mesin rekomendasi dosen SiReDo ke dalam portal akademik atau sistem kampus Anda dalam 3 langkah terstruktur.
      </p>
    </div>

    <!-- Stepper Tracker -->
    <div class="stepper-container">
      <a href="#step-1" class="step-nav-item">
        <div class="step-num bg-brand-light text-brand">1</div>
        <div class="step-info">
          <span class="step-title">Dapatkan API Key</span>
          <span class="step-sub">Registrasi &amp; Token</span>
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
            <h2 class="step-heading">Kredensial API Key</h2>
            <p class="step-desc">Semua endpoint rekomendasi SiReDo membutuhkan autentikasi header <code>X-API-Key</code>.</p>
          </div>
        </div>

        <div class="step-content-divided">
          <div class="token-summary">
            <div class="token-code-row">
              <span class="text-xs font-mono font-bold text-text-muted">TOKEN CONTOH:</span>
              <code class="text-sm font-mono text-brand font-semibold">srd_live_9b4e72ac01f89c4...</code>
            </div>
            <p class="text-xs text-text-secondary mt-1">
              Token autentikasi berbasis HMAC untuk memvalidasi request resmi dari sistem kampus Anda.
            </p>
          </div>
          <div class="token-cta-row">
            <span class="text-xs text-text-secondary">Belum memiliki token aktif?</span>
            <router-link to="/docs/api-key" class="btn-primary inline-flex items-center gap-2">
              Daftar &amp; Ambil API Key &rarr;
            </router-link>
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

    <!-- Next Actions -->
    <div class="next-steps-card">
      <div class="next-steps-header">Langkah Selanjutnya</div>
      <div class="next-steps-list">
        <router-link to="/docs/api" class="next-step-item">
          <div>
            <div class="next-step-title">Jelajahi API Reference &rarr;</div>
            <div class="next-step-desc">Daftar endpoint lengkap untuk batch processing dan tuning konfigurasi.</div>
          </div>
        </router-link>

        <router-link to="/docs/pipeline" class="next-step-item">
          <div>
            <div class="next-step-title">Pelajari Pipeline NLP &rarr;</div>
            <div class="next-step-desc">Pahami cara kerja BM25, representasi semantik SBERT, dan Explainable AI (XAI).</div>
          </div>
        </router-link>

        <router-link to="/docs/caching" class="next-step-item">
          <div>
            <div class="next-step-title">Metode Caching &amp; Indexing &rarr;</div>
            <div class="next-step-desc">Arsitektur penyimpanan indeks memori dan sinkronisasi data dosen secara konsisten.</div>
          </div>
        </router-link>
      </div>
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

/* Step 1 Divided Content */
.step-content-divided {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.token-code-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.token-cta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

/* Next Steps Card */
.next-steps-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-top: 2.5rem;
  overflow: hidden;
}

.next-steps-header {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-subtle);
}

.next-steps-list {
  display: flex;
  flex-direction: column;
}

.next-step-item {
  padding: 1rem 1.25rem;
  text-decoration: none;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}

.next-step-item:last-child {
  border-bottom: none;
}

.next-step-item:hover {
  background: var(--bg-subtle);
}

.next-step-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--brand);
  margin-bottom: 0.2rem;
}

.next-step-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.45;
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
