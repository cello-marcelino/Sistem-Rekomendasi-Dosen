<script setup>
// ApiDocsView - Modern left-aligned layout with rich visualizations, request/response panels, and architecture diagrams
</script>

<template>
  <div class="docs-page animate-in">
    <div class="docs-prose">

      <!-- Page Header -->
      <div class="page-header">
        <span class="page-badge">DOKUMENTASI TEKNIS</span>
        <h1 class="page-title">Dokumentasi API SiReDo</h1>
        <p class="page-lead">
          Spesifikasi endpoint RESTful SiReDo untuk menghubungkan Sistem Informasi Akademik (SIAKAD) dengan mesin rekomendasi pembimbing skripsi.
        </p>

        <!-- Base URL & Quick Info Ribbon -->
        <div class="meta-ribbon">
          <div class="meta-item">
            <span class="meta-label">BASE URL</span>
            <code class="meta-code">http://localhost:5000/api</code>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">AUTH HEADER</span>
            <code class="meta-code">X-API-Key: srd_live_***</code>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">FORMAT</span>
            <span class="meta-val">JSON (application/json)</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">RESPONS</span>
            <span class="meta-val text-brand font-semibold">Envelope Pattern</span>
          </div>
        </div>
      </div>

      <!-- API Architecture Flow Diagram -->
      <section class="section-block" id="architecture-flow">
        <div class="section-header-compact">
          <h2 class="text-xl font-bold text-text-primary">Alur Interaksi Gateway &amp; Engine</h2>
          <span class="section-tag">Alur Sistem</span>
        </div>
        <p class="text-sm text-text-secondary mb-4">
          Tahapan pemrosesan permintaan dari portal akademik kampus hingga penerbitan rekomendasi terukur.
        </p>

        <div class="api-flow-container">
          <div class="flow-step-item">
            <span class="flow-step-idx">01</span>
            <div class="flow-step-body">
              <h4 class="flow-step-title">Klien SIAKAD</h4>
              <p class="flow-step-desc">Kirim payload JSON judul/abstrak tesis beserta header <code>X-API-Key</code>.</p>
            </div>
          </div>

          <div class="flow-step-item">
            <span class="flow-step-idx">02</span>
            <div class="flow-step-body">
              <h4 class="flow-step-title">Auth Middleware</h4>
              <p class="flow-step-desc">Validasi tanda tangan token HMAC, rate-limiting, dan sanitasi payload input.</p>
            </div>
          </div>

          <div class="flow-step-item">
            <span class="flow-step-idx">03</span>
            <div class="flow-step-body">
              <h4 class="flow-step-title">In-Memory NLP</h4>
              <p class="flow-step-desc">Pencarian leksikal BM25 &amp; semantik SBERT dari matriks RAM secara instan.</p>
            </div>
          </div>

          <div class="flow-step-item">
            <span class="flow-step-idx">04</span>
            <div class="flow-step-body">
              <h4 class="flow-step-title">Envelope Response</h4>
              <p class="flow-step-desc">Output JSON terstruktur dengan skor transparansi XAI dan irisan kata kunci.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Endpoint Catalog Section -->
      <section class="section-block" id="endpoints-overview">
        <div class="section-header-compact">
          <h2 class="text-xl font-bold text-text-primary">Katalog Endpoint</h2>
          <span class="section-tag">Katalog</span>
        </div>
        <p class="text-sm text-text-secondary mb-4">
          Daftar seluruh endpoint yang tersedia dengan format respons envelope seragam.
        </p>

        <div class="endpoint-catalog-card">
          <!-- 1. Single -->
          <a href="#single" class="endpoint-catalog-row">
            <div class="endpoint-method-col">
              <span class="badge-post">POST</span>
            </div>
            <div class="endpoint-info-col">
              <div class="endpoint-path">/rekomendasi/single</div>
              <p class="endpoint-desc">Rekomendasi 1 dokumen tesis beserta metadata bobot dan rincian XAI.</p>
            </div>
            <div class="endpoint-meta-col">
              <span class="endpoint-type-badge">Single Document</span>
            </div>
          </a>

          <!-- 2. Batch JSON -->
          <a href="#batch" class="endpoint-catalog-row">
            <div class="endpoint-method-col">
              <span class="badge-post">POST</span>
            </div>
            <div class="endpoint-info-col">
              <div class="endpoint-path">/rekomendasi/batch</div>
              <p class="endpoint-desc">Pemrosesan massal banyak proposal sekaligus dalam satu array JSON.</p>
            </div>
            <div class="endpoint-meta-col">
              <span class="endpoint-type-badge">Batch JSON</span>
            </div>
          </a>

          <!-- 3. Batch Upload -->
          <a href="#batch-upload" class="endpoint-catalog-row">
            <div class="endpoint-method-col">
              <span class="badge-post">POST</span>
            </div>
            <div class="endpoint-info-col">
              <div class="endpoint-path">/rekomendasi/batch/upload</div>
              <p class="endpoint-desc">Unggah berkas spreadsheet Excel (.xlsx) untuk memproses proposal seangkatan.</p>
            </div>
            <div class="endpoint-meta-col">
              <span class="endpoint-type-badge">Excel Upload</span>
            </div>
          </a>

          <!-- 4. Status -->
          <a href="#status" class="endpoint-catalog-row">
            <div class="endpoint-method-col">
              <span class="badge-get">GET</span>
            </div>
            <div class="endpoint-info-col">
              <div class="endpoint-path">/status</div>
              <p class="endpoint-desc">Pemeriksaan kesiapan model in-memory dan status worker secara berkelanjutan.</p>
            </div>
            <div class="endpoint-meta-col">
              <span class="endpoint-type-badge">Health Check</span>
            </div>
          </a>

          <!-- 5. Config -->
          <a href="#config-get" class="endpoint-catalog-row">
            <div class="endpoint-method-col flex gap-1">
              <span class="badge-get">GET</span>
              <span class="badge-patch">PATCH</span>
            </div>
            <div class="endpoint-info-col">
              <div class="endpoint-path">/config</div>
              <p class="endpoint-desc">Membaca atau memperbarui parameter bobot adaptif, top-K, dan threshold.</p>
            </div>
            <div class="endpoint-meta-col">
              <span class="endpoint-type-badge">Engine Tuning</span>
            </div>
          </a>
        </div>
      </section>

      <!-- Autentikasi Section -->
      <section class="section-block" id="auth">
        <div class="section-header-compact">
          <h2 class="text-xl font-bold text-text-primary">Autentikasi & Keamanan</h2>
          <span class="section-tag">Security</span>
        </div>
        <p class="text-sm text-text-secondary mb-4">
          Semua endpoint API SiReDo (kecuali <code>/status</code>) dilindungi oleh sistem token HMAC API Key.
          Sertakan API Key pada HTTP Request Header <code>X-API-Key</code>.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
          <div class="code-panel">
            <div class="code-panel-header">
              <span class="code-panel-title">HTTP Request Header Format</span>
            </div>
            <pre class="code-panel-body"><code><span class="tok-key">POST</span> /api/rekomendasi/single HTTP/1.1
<span class="tok-key">Host</span>: localhost:5000
<span class="tok-key">Content-Type</span>: application/json
<span class="tok-key">X-API-Key</span>: <span class="text-brand font-semibold">srd_live_9b4e72ac01f89...</span></code></pre>
          </div>

          <div class="security-callout-card">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-amber-bg text-amber flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 class="text-sm font-bold text-text-primary mb-1">Prinsip Keamanan Klien</h4>
                <p class="text-xs text-text-secondary leading-relaxed">
                  Jangan pernah menaruh API Key di bundle JavaScript frontend publik tanpa proxy. Simpan key di backend SIAKAD atau file <code>.env</code> server Anda untuk mencegah kebocoran kuota.
                </p>
                <div class="mt-3">
                  <router-link to="/docs/api-key" class="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1">
                    Buat atau Kelola API Key Anda &rarr;
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Standard Envelope Structure -->
      <section class="section-block" id="envelope">
        <div class="section-header-compact">
          <h2 class="text-xl font-bold text-text-primary">Standard Envelope Pattern</h2>
          <span class="section-tag">Response Format</span>
        </div>
        <p class="text-sm text-text-secondary mb-4">
          Respon API selalu dibungkus dalam envelope terstandarisasi untuk memudahkan deserialisasi di semua bahasa pemrograman (PHP, Python, Java, JS).
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="code-panel">
            <div class="code-panel-header">
              <span class="code-panel-title text-green-main">Success Envelope (200 OK)</span>
            </div>
            <pre class="code-panel-body"><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"message"</span>: <span class="tok-str">"Rekomendasi berhasil digenerate"</span>,
  <span class="tok-key">"data"</span>: {
    <span class="tok-key">"metadata"</span>: { ... },
    <span class="tok-key">"recommendations"</span>: [ ... ]
  }
}</code></pre>
          </div>

          <div class="code-panel">
            <div class="code-panel-header">
              <span class="code-panel-title text-red">Error Envelope (4xx / 5xx)</span>
            </div>
            <pre class="code-panel-body"><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"error"</span>,
  <span class="tok-key">"message"</span>: <span class="tok-str">"Field 'judul' atau 'abstrak' wajib diisi"</span>,
  <span class="tok-key">"code"</span>: <span class="tok-num">400</span>
}</code></pre>
          </div>
        </div>
      </section>

      <!-- Endpoint Detail: POST /rekomendasi/single -->
      <section class="section-block" id="single">
        <div class="endpoint-header-banner">
          <div class="flex items-center gap-3">
            <span class="badge-post-lg">POST</span>
            <span class="endpoint-title-text">/rekomendasi/single</span>
          </div>
          <span class="text-xs text-text-muted font-mono">Content-Type: application/json</span>
        </div>

        <p class="text-sm text-text-secondary my-3 leading-relaxed">
          Menjalankan pipeline rekomendasi lengkap (Preprocessing &rarr; BM25 Leksikal &rarr; SBERT Semantik &rarr; Hybrid Scoring &rarr; XAI Generator) untuk satu dokumen penelitian mahasiswa.
        </p>

        <!-- Split 2-Column: Parameters vs Response Preview -->
        <div class="split-preview-grid">
          <!-- Column 1: Request Specification -->
          <div class="split-col">
            <h3 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-brand"></span> Request Parameters
            </h3>

            <div class="param-spec-card">
              <div class="param-row">
                <div class="param-header">
                  <span class="param-name">judul</span>
                  <span class="param-type">string</span>
                  <span class="param-req">Wajib*</span>
                </div>
                <p class="param-desc">Judul usulan skripsi atau tesis mahasiswa.</p>
              </div>

              <div class="param-row">
                <div class="param-header">
                  <span class="param-name">abstrak</span>
                  <span class="param-type">string</span>
                  <span class="param-req">Wajib*</span>
                </div>
                <p class="param-desc">Uraian abstrak penelitian. Jika diisi bersama judul, sistem otomatis mengaktifkan adaptive alpha mode abstrak.</p>
              </div>

              <div class="param-row">
                <div class="param-header">
                  <span class="param-name">k_rank</span>
                  <span class="param-type">integer</span>
                  <span class="param-opt">Opsional</span>
                </div>
                <p class="param-desc">Banyaknya calon dosen pembimbing yang diminta. Default: <code>5</code> (Range: 1–20).</p>
              </div>

              <div class="text-[0.72rem] text-text-muted mt-2">
                *Minimal salah satu dari <code>judul</code> atau <code>abstrak</code> harus disertakan.
              </div>
            </div>

            <!-- cURL Request Snippet -->
            <div class="code-panel mt-4">
              <div class="code-panel-header">
                <span class="code-panel-title">Contoh cURL Request</span>
              </div>
              <pre class="code-panel-body"><code>curl -X POST http://localhost:5000/api/rekomendasi/single \
  -H <span class="tok-str">"Content-Type: application/json"</span> \
  -H <span class="tok-str">"X-API-Key: YOUR_API_KEY"</span> \
  -d '{
    <span class="tok-key">"judul"</span>: <span class="tok-str">"Penerapan Deep Learning untuk Deteksi Penyakit Tanaman"</span>,
    <span class="tok-key">"abstrak"</span>: <span class="tok-str">"Penelitian ini mengklasifikasi citra daun menggunakan CNN..."</span>,
    <span class="tok-key">"k_rank"</span>: <span class="tok-num">5</span>
  }'</code></pre>
            </div>
          </div>

          <!-- Column 2: Response JSON with Highlighting -->
          <div class="split-col">
            <h3 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-main"></span> Response JSON Payload (200 OK)
            </h3>

            <div class="code-panel h-[calc(100%-2rem)]">
              <div class="code-panel-header">
                <span class="code-panel-title">Output Lengkap dengan Metadata & XAI</span>
              </div>
              <pre class="code-panel-body !max-h-[520px] overflow-y-auto"><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"data"</span>: {
    <span class="tok-key">"metadata"</span>: {
      <span class="tok-key">"alpha"</span>: <span class="tok-num">0.35</span>,           <span class="tok-comment">// Bobot BM25</span>
      <span class="tok-key">"beta"</span>: <span class="tok-num">0.65</span>,            <span class="tok-comment">// Bobot SBERT</span>
      <span class="tok-key">"mode"</span>: <span class="tok-str">"abstrak"</span>,       <span class="tok-comment">// Sesuai panjang query</span>
      <span class="tok-key">"num_query_tokens"</span>: <span class="tok-num">18</span>,
      <span class="tok-key">"k_rank"</span>: <span class="tok-num">5</span>
    },
    <span class="tok-key">"recommendations"</span>: [
      {
        <span class="tok-key">"dosen"</span>: {
          <span class="tok-key">"nidn"</span>: <span class="tok-str">"0012345678"</span>,
          <span class="tok-key">"nama"</span>: <span class="tok-str">"Dr. Ahmad Farid, M.Kom"</span>,
          <span class="tok-key">"program_studi"</span>: <span class="tok-str">"Teknik Informatika"</span>,
          <span class="tok-key">"bidang_keahlian"</span>: <span class="tok-str">"Computer Vision, AI"</span>
        },
        <span class="tok-key">"scores"</span>: {
          <span class="tok-key">"hybrid"</span>: <span class="tok-num">0.8245</span>,   <span class="tok-comment">// Skor akhir ranking</span>
          <span class="tok-key">"bm25"</span>: <span class="tok-num">0.7120</span>,     <span class="tok-comment">// Kecocokan leksikal</span>
          <span class="tok-key">"sbert"</span>: <span class="tok-num">0.8850</span>     <span class="tok-comment">// Cosine semantic</span>
        },
        <span class="tok-key">"xai"</span>: {
          <span class="tok-key">"irisan_kata"</span>: [<span class="tok-str">"deep_learning"</span>, <span class="tok-str">"cnn"</span>, <span class="tok-str">"deteksi"</span>],
          <span class="tok-key">"topik_dosen"</span>: [<span class="tok-str">"image classification"</span>, <span class="tok-str">"neural network"</span>]
        }
      }
    ]
  }
}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- Endpoint Detail: POST /rekomendasi/batch -->
      <section class="section-block" id="batch">
        <div class="endpoint-header-banner">
          <div class="flex items-center gap-3">
            <span class="badge-post-lg">POST</span>
            <span class="endpoint-title-text">/rekomendasi/batch</span>
          </div>
          <span class="text-xs text-text-muted font-mono">JSON Array Batch Processing</span>
        </div>

        <p class="text-sm text-text-secondary my-3 leading-relaxed">
          Mengirim banyak judul/abstrak sekaligus dalam satu koneksi HTTP. Sangat efisien untuk sinkronisasi batch semesteran dari SIAKAD tanpa terkena penalti network handshake berulang.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="code-panel">
            <div class="code-panel-header">
              <span class="code-panel-title">Request Payload (JSON Array)</span>
            </div>
            <pre class="code-panel-body"><code>[
  {
    <span class="tok-key">"id"</span>: <span class="tok-str">"MHS-2024-001"</span>,
    <span class="tok-key">"judul"</span>: <span class="tok-str">"Deteksi Penipuan Kartu Kredit dengan Random Forest"</span>,
    <span class="tok-key">"abstrak"</span>: <span class="tok-str">"Penelitian ini menganalisis transaksi..."</span>
  },
  {
    <span class="tok-key">"id"</span>: <span class="tok-str">"MHS-2024-002"</span>,
    <span class="tok-key">"judul"</span>: <span class="tok-str">"Analisis Sentimen Bahasa Indonesia pada Twitter"</span>
  }
]</code></pre>
          </div>

          <div class="code-panel">
            <div class="code-panel-header">
              <span class="code-panel-title text-green-main">Batch Response Array</span>
            </div>
            <pre class="code-panel-body"><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"data"</span>: [
    {
      <span class="tok-key">"id"</span>: <span class="tok-str">"MHS-2024-001"</span>,
      <span class="tok-key">"judul"</span>: <span class="tok-str">"Deteksi Penipuan..."</span>,
      <span class="tok-key">"recommendations"</span>: [ <span class="tok-comment">/* top-5 dosen */</span> ]
    },
    {
      <span class="tok-key">"id"</span>: <span class="tok-str">"MHS-2024-002"</span>,
      <span class="tok-key">"judul"</span>: <span class="tok-str">"Analisis Sentimen..."</span>,
      <span class="tok-key">"recommendations"</span>: [ <span class="tok-comment">/* top-5 dosen */</span> ]
    }
  ]
}</code></pre>
          </div>
        </div>
      </section>

      <!-- Endpoint Detail: POST /rekomendasi/batch/upload -->
      <section class="section-block" id="batch-upload">
        <div class="endpoint-header-banner">
          <div class="flex items-center gap-3">
            <span class="badge-post-lg">POST</span>
            <span class="endpoint-title-text">/rekomendasi/batch/upload</span>
          </div>
          <span class="text-xs text-text-muted font-mono">multipart/form-data (.xlsx)</span>
        </div>

        <p class="text-sm text-text-secondary my-3 leading-relaxed">
          Mengunggah berkas Excel langsung dari antarmuka pengguna atau integrasi file. Kolom wajib pada lembar pertama berkas Excel:
        </p>

        <div class="excel-visual-box">
          <div class="excel-header-row">
            <div class="excel-cell font-mono font-bold text-green-main">A (id)</div>
            <div class="excel-cell font-mono font-bold text-green-main">B (judul)</div>
            <div class="excel-cell font-mono font-bold text-green-main">C (abstrak)</div>
          </div>
          <div class="excel-data-row">
            <div class="excel-cell font-mono text-xs">MHS-001</div>
            <div class="excel-cell text-xs">Sistem Klasifikasi Sentimen BERT...</div>
            <div class="excel-cell text-xs text-text-muted">Penelitian ini menggunakan model transformer...</div>
          </div>
          <div class="excel-data-row">
            <div class="excel-cell font-mono text-xs">MHS-002</div>
            <div class="excel-cell text-xs">Deteksi Cacat Kain Tekstil dengan CNN...</div>
            <div class="excel-cell text-xs text-text-muted">(opsional jika judul sudah spesifik)</div>
          </div>
        </div>
      </section>

      <!-- Endpoint Detail: GET & PATCH /config -->
      <section class="section-block" id="config-get">
        <div class="endpoint-header-banner">
          <div class="flex items-center gap-3">
            <div class="flex gap-1">
              <span class="badge-get-lg">GET</span>
              <span class="badge-patch-lg">PATCH</span>
            </div>
            <span class="endpoint-title-text">/config</span>
          </div>
          <span class="text-xs text-text-muted font-mono">Engine Tuning Configuration</span>
        </div>

        <p class="text-sm text-text-secondary my-3 leading-relaxed">
          Menampilkan konfigurasi aktif atau melakukan pembaruan parameter mesin secara dinamis tanpa perlu restart aplikasi.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="code-panel">
            <div class="code-panel-header">
              <span class="code-panel-title">GET /config (Response)</span>
            </div>
            <pre class="code-panel-body"><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"data"</span>: {
    <span class="tok-key">"k_rank"</span>: <span class="tok-num">5</span>,
    <span class="tok-key">"threshold"</span>: <span class="tok-num">0.0</span>,
    <span class="tok-key">"adaptive_alpha_threshold"</span>: <span class="tok-num">15</span>
  }
}</code></pre>
          </div>

          <div class="code-panel">
            <div class="code-panel-header">
              <span class="code-panel-title">PATCH /config (Request)</span>
            </div>
            <pre class="code-panel-body"><code>curl -X PATCH http://localhost:5000/api/config \
  -H <span class="tok-str">"Content-Type: application/json"</span> \
  -H <span class="tok-str">"X-API-Key: YOUR_API_KEY"</span> \
  -d '{
    <span class="tok-key">"k_rank"</span>: <span class="tok-num">10</span>,
    <span class="tok-key">"adaptive_alpha_threshold"</span>: <span class="tok-num">20</span>
  }'</code></pre>
          </div>
        </div>
      </section>

      <!-- Endpoint Detail: GET /status -->
      <section class="section-block" id="status">
        <div class="endpoint-header-banner">
          <div class="flex items-center gap-3">
            <span class="badge-get-lg">GET</span>
            <span class="endpoint-title-text">/status</span>
          </div>
          <span class="text-xs text-text-muted font-mono">Health Check & Cache Probe</span>
        </div>

        <p class="text-sm text-text-secondary my-3 leading-relaxed">
          Endpoint publik tanpa autentikasi untuk mengecek kesiapan worker dan in-memory cache sebelum menerima request rekomendasi.
        </p>

        <div class="code-panel">
          <div class="code-panel-header">
            <span class="code-panel-title">Response JSON (Health Status)</span>
          </div>
          <pre class="code-panel-body"><code>{
  <span class="tok-key">"status"</span>: <span class="tok-str">"success"</span>,
  <span class="tok-key">"data"</span>: {
    <span class="tok-key">"cache_ready"</span>: <span class="tok-bool">true</span>,      <span class="tok-comment">// Siap melayani rekomendasi real-time</span>
    <span class="tok-key">"version"</span>: <span class="tok-str">"3.1.0"</span>,
    <span class="tok-key">"indexing_mode"</span>: <span class="tok-str">"hybrid_incremental"</span>
  }
}</code></pre>
        </div>
      </section>

      <!-- HTTP Status Matrix & Error Handling -->
      <section class="section-block" id="errors">
        <div class="section-header-compact">
          <h2 class="text-xl font-bold text-text-primary">HTTP Status Matrix &amp; Error Handling</h2>
          <span class="section-tag">Status &amp; Diagnostik</span>
        </div>
        <p class="text-sm text-text-secondary mb-4">
          Standar kode status HTTP dan format respons kesalahan yang digunakan oleh seluruh endpoint SiReDo API.
        </p>

        <div class="status-matrix-card">
          <table class="status-table">
            <thead>
              <tr>
                <th class="status-th w-28">Status</th>
                <th class="status-th w-44">Tipe Respon</th>
                <th class="status-th">Kondisi Terjadi</th>
                <th class="status-th">Solusi Penanganan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="status-td"><span class="badge-status-ok">200 OK</span></td>
                <td class="status-td font-semibold text-text-primary">Success</td>
                <td class="status-td text-text-secondary">Permintaan valid dan rekomendasi berhasil diproses.</td>
                <td class="status-td text-text-muted">Data siap dikonsumsi klien.</td>
              </tr>
              <tr>
                <td class="status-td"><span class="badge-status-warn">400</span></td>
                <td class="status-td font-semibold text-text-primary">Bad Request</td>
                <td class="status-td text-text-secondary">Field <code>judul</code> dan <code>abstrak</code> kosong, atau format JSON cacat.</td>
                <td class="status-td text-text-muted">Pastikan minimal salah satu field terisi teks yang valid.</td>
              </tr>
              <tr>
                <td class="status-td"><span class="badge-status-err">401</span></td>
                <td class="status-td font-semibold text-text-primary">Unauthorized</td>
                <td class="status-td text-text-secondary">Header <code>X-API-Key</code> tidak disertakan atau token tidak valid.</td>
                <td class="status-td text-text-muted">Periksa API Key di portal developer.</td>
              </tr>
              <tr>
                <td class="status-td"><span class="badge-status-warn">422</span></td>
                <td class="status-td font-semibold text-text-primary">Unprocessable Entity</td>
                <td class="status-td text-text-secondary">Nilai parameter berada di luar batasan (contoh: <code>k_rank</code> negatif).</td>
                <td class="status-td text-text-muted">Sesuaikan nilai dengan batas schema (1–20).</td>
              </tr>
              <tr>
                <td class="status-td"><span class="badge-status-err">500</span></td>
                <td class="status-td font-semibold text-text-primary">Server Error</td>
                <td class="status-td text-text-secondary">Cache engine sedang memuat model pertama kali (warming up).</td>
                <td class="status-td text-text-muted">Cek endpoint <code>GET /status</code> hingga <code>cache_ready: true</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.docs-page {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 2.5rem 3.5rem 5rem 3.5rem;
  box-sizing: border-box;
}

.docs-prose {
  width: 100%;
  max-width: 100%;
}

/* Page Header */
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
  margin-bottom: 0.75rem;
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
  margin: 0 0 1.5rem;
}

/* Meta Ribbon */
.meta-ribbon {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.meta-code {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  padding: 2px 7px;
  border-radius: var(--radius-sm);
}

.meta-val {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.meta-divider {
  width: 1px;
  height: 16px;
  background: var(--border);
}

/* Section block */
.section-block {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.section-header-compact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.section-tag {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--brand);
  background: var(--brand-light);
  padding: 2px 8px;
  border-radius: 99px;
  border: 1px solid var(--brand-border);
}

/* API Flow Diagram */
.api-flow-diagram {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.flow-card {
  flex: 1;
  min-width: 190px;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

/* API Flow Container */
.api-flow-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.flow-step-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding-right: 0.75rem;
  border-right: 1px solid var(--border);
}

.flow-step-item:last-child {
  border-right: none;
  padding-right: 0;
}

.flow-step-idx {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  padding: 0.2rem 0.45rem;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.flow-step-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.flow-step-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.flow-step-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

/* Endpoint Catalog Card */
.endpoint-catalog-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 1.25rem 0;
}

.endpoint-catalog-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 1.4rem;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--border);
  transition: background-color 0.15s;
}

.endpoint-catalog-row:last-child {
  border-bottom: none;
}

.endpoint-catalog-row:hover {
  background-color: var(--bg-subtle);
}

.endpoint-method-col {
  width: 70px;
  flex-shrink: 0;
}

.endpoint-info-col {
  flex: 1;
  min-width: 0;
}

.endpoint-info-col .endpoint-path {
  margin-bottom: 0.2rem;
}

.endpoint-meta-col {
  flex-shrink: 0;
}

.endpoint-type-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
}

.endpoint-path {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
}

.endpoint-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Security Callout */
.security-callout-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

/* Code Panel */
.code-panel {
  background: #0f0f14;
  border: 1px solid #1e1e2e;
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.code-panel-header {
  background: #181825;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #28283d;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Endpoint Header Banner */
.endpoint-header-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.25rem;
  margin-top: 1rem;
}

.endpoint-title-text {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Split 2-Column Grid */
.split-preview-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 1.25rem;
  margin: 1.25rem 0;
  align-items: start;
}

.param-spec-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.param-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.param-row:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.param-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.param-name {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.param-type {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: 1px 5px;
  border-radius: var(--radius-sm);
}

.param-req {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--red);
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 1px 6px;
  border-radius: 99px;
}

.param-opt {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: 1px 6px;
  border-radius: 99px;
}

.param-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Excel visual box */
.excel-visual-box {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 1.25rem 0;
}

.excel-header-row {
  display: grid;
  grid-template-columns: 120px 1.5fr 2fr;
  background: #f0fdf4;
  border-bottom: 1px solid var(--green-border);
}

.excel-data-row {
  display: grid;
  grid-template-columns: 120px 1.5fr 2fr;
  border-bottom: 1px solid var(--border);
}

.excel-data-row:last-child {
  border-bottom: none;
}

.excel-cell {
  padding: 0.65rem 0.9rem;
  border-right: 1px solid var(--border);
}

.excel-cell:last-child {
  border-right: none;
}

/* Status Matrix Table */
.status-matrix-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 1.25rem 0;
}

.status-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

.status-th {
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}

.status-td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.status-table tbody tr:last-child .status-td {
  border-bottom: none;
}

.status-td code {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  padding: 1px 4px;
  border-radius: var(--radius-sm);
}

.badge-status-ok {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid var(--green-border);
  display: inline-block;
}

.badge-status-warn {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--amber-bg);
  color: var(--amber);
  border: 1px solid var(--amber-border);
  display: inline-block;
}

.badge-status-err {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: #fef2f2;
  color: var(--red);
  border: 1px solid #fecaca;
  display: inline-block;
}

/* Badges */
.badge-post { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-sm); background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
.badge-get  { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-sm); background: var(--blue-bg); color: var(--blue); border: 1px solid var(--blue-border); }
.badge-patch { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-sm); background: var(--amber-bg); color: var(--amber); border: 1px solid var(--amber-border); }

.badge-post-lg { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-sm); background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
.badge-get-lg  { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-sm); background: var(--blue-bg); color: var(--blue); border: 1px solid var(--blue-border); }
.badge-patch-lg { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-sm); background: var(--amber-bg); color: var(--amber); border: 1px solid var(--amber-border); }

/* Syntax highlighting helpers */
.tok-key { color: #89b4fa; }
.tok-str { color: #a6e3a1; }
.tok-num { color: #fab387; }
.tok-bool { color: #f38ba8; }
.tok-comment { color: #6c7086; font-style: italic; }

@media (max-width: 1024px) {
  .split-preview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .docs-page {
    padding: 2rem 1.25rem 4rem;
  }
  .api-flow-container {
    grid-template-columns: 1fr;
  }
  .flow-step-item {
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding-right: 0;
    padding-bottom: 0.75rem;
  }
  .flow-step-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .endpoint-catalog-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .status-matrix-card {
    overflow-x: auto;
  }
}
</style>
