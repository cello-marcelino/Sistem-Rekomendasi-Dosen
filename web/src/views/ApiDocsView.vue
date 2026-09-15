<script setup>
// ApiDocsView - Modern left-aligned layout with rich visualizations, request/response panels, and architecture diagrams
</script>

<template>
  <div class="docs-page animate-in">
    <div class="docs-prose">

      <!-- Page Header -->
      <div class="page-header">
        <span class="page-badge">REST API REFERENCE</span>
        <h1 class="page-title">Dokumentasi API SiReDo</h1>
        <p class="page-lead">
          Panduan integrasi teknis RESTful API SiReDo untuk menghubungkan Sistem Informasi Akademik (SIAKAD) atau aplikasi kampus dengan mesin rekomendasi dosen berbasis NLP.
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
            <span class="meta-label">AVG LATENCY</span>
            <span class="meta-val text-brand font-semibold">&lt; 50 ms (In-Memory)</span>
          </div>
        </div>
      </div>

      <!-- API Architecture Flow Diagram -->
      <section class="section-block" id="architecture-flow">
        <div class="section-header-compact">
          <h2 class="text-xl font-bold text-text-primary">Alur Interaksi API & Gateway</h2>
          <span class="section-tag">High-Level Flow</span>
        </div>
        <p class="text-sm text-text-secondary mb-4">
          Visualisasi bagaimana sistem akademik Anda berkomunikasi secara aman dan berlatensi rendah dengan SiReDo Engine.
        </p>

        <div class="api-flow-diagram">
          <!-- Step 1 -->
          <div class="flow-card">
            <div class="flow-card-icon bg-brand-light text-brand">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flow-card-step">01. KLIEN / SIAKAD</div>
            <h4 class="flow-card-title">HTTP Request</h4>
            <p class="flow-card-desc">Kirim payload JSON judul/abstrak tesis beserta header <code>X-API-Key</code>.</p>
          </div>

          <div class="flow-arrow">
            <svg class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          <!-- Step 2 -->
          <div class="flow-card">
            <div class="flow-card-icon bg-blue-bg text-blue-main">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="flow-card-step">02. SECURITY MIDDLEWARE</div>
            <h4 class="flow-card-title">HMAC Auth Verification</h4>
            <p class="flow-card-desc">Memvalidasi izin klien, rate-limiting, serta sanitasi payload input.</p>
          </div>

          <div class="flow-arrow">
            <svg class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          <!-- Step 3 -->
          <div class="flow-card">
            <div class="flow-card-icon bg-amber-bg text-amber">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="flow-card-step">03. IN-MEMORY ENGINE</div>
            <h4 class="flow-card-title">Hybrid NLP Inference</h4>
            <p class="flow-card-desc">Pencarian leksikal BM25 & semantik SBERT dari cache RAM dalam &lt; 50 ms.</p>
          </div>

          <div class="flow-arrow">
            <svg class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          <!-- Step 4 -->
          <div class="flow-card">
            <div class="flow-card-icon bg-green-bg text-green-main">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flow-card-step">04. ENVELOPE RESPONSE</div>
            <h4 class="flow-card-title">Top-K Dosen + XAI</h4>
            <p class="flow-card-desc">Output JSON terstruktur dengan skor transparansi XAI dan irisan kata kunci.</p>
          </div>
        </div>
      </section>

      <!-- Endpoint Directory Cards -->
      <section class="section-block" id="endpoints-overview">
        <div class="section-header-compact">
          <h2 class="text-xl font-bold text-text-primary">Katalog Endpoint</h2>
          <span class="section-tag">Summary</span>
        </div>
        <p class="text-sm text-text-secondary mb-4">
          Seluruh endpoint menggunakan format respons seragam (*envelope pattern*).
        </p>

        <div class="endpoint-cards-grid">
          <!-- Card 1 -->
          <a href="#single" class="endpoint-item-card group">
            <div class="endpoint-card-top">
              <span class="badge-post">POST</span>
              <span class="endpoint-speed-badge">&lt; 50 ms</span>
            </div>
            <div class="endpoint-path">/rekomendasi/single</div>
            <p class="endpoint-desc">Rekomendasi 1 dokumen tesis. Mengembalikan top-K dosen teratas beserta visual penjelasan XAI.</p>
          </a>

          <!-- Card 2 -->
          <a href="#batch" class="endpoint-item-card group">
            <div class="endpoint-card-top">
              <span class="badge-post">POST</span>
              <span class="endpoint-speed-badge">Batch JSON</span>
            </div>
            <div class="endpoint-path">/rekomendasi/batch</div>
            <p class="endpoint-desc">Pemrosesan massal banyak judul skripsi/tesis sekaligus dalam 1 request array JSON.</p>
          </a>

          <!-- Card 3 -->
          <a href="#batch-upload" class="endpoint-item-card group">
            <div class="endpoint-card-top">
              <span class="badge-post">POST</span>
              <span class="endpoint-speed-badge">File Upload</span>
            </div>
            <div class="endpoint-path">/rekomendasi/batch/upload</div>
            <p class="endpoint-desc">Upload spreadsheet Excel (.xlsx) untuk memproses ratusan draf skripsi mahasiswa sekaligus.</p>
          </a>

          <!-- Card 4 -->
          <a href="#status" class="endpoint-item-card group">
            <div class="endpoint-card-top">
              <span class="badge-get">GET</span>
              <span class="endpoint-speed-badge">Health Check</span>
            </div>
            <div class="endpoint-path">/status</div>
            <p class="endpoint-desc">Memeriksa ketersediaan model AI in-memory dan kesiapan cache server secara berkelanjutan.</p>
          </a>

          <!-- Card 5 -->
          <a href="#config-get" class="endpoint-item-card group">
            <div class="endpoint-card-top">
              <div class="flex gap-1">
                <span class="badge-get">GET</span>
                <span class="badge-patch">PATCH</span>
              </div>
              <span class="endpoint-speed-badge">Engine Tuning</span>
            </div>
            <div class="endpoint-path">/config</div>
            <p class="endpoint-desc">Membaca atau memperbarui parameter bobot adaptif, top-K, dan threshold skor.</p>
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
    <span class="tok-key">"cache_ready"</span>: <span class="tok-bool">true</span>,      <span class="tok-comment">// Siap melayani rekomendasi dalam &lt; 50ms</span>
    <span class="tok-key">"version"</span>: <span class="tok-str">"3.1.0"</span>,
    <span class="tok-key">"indexing_mode"</span>: <span class="tok-str">"hybrid_incremental"</span>
  }
}</code></pre>
        </div>
      </section>

      <!-- HTTP Status Codes & Error Handling Visual Grid -->
      <section class="section-block" id="errors">
        <div class="section-header-compact">
          <h2 class="text-xl font-bold text-text-primary">HTTP Status Matrix & Error Handling</h2>
          <span class="section-tag">Diagnostics</span>
        </div>
        <p class="text-sm text-text-secondary mb-4">
          Standar penanganan kesalahan HTTP yang digunakan oleh seluruh endpoint SiReDo API.
        </p>

        <div class="status-cards-grid">
          <!-- 200 OK -->
          <div class="status-card border-green-border bg-[#f0fdf4]">
            <div class="flex items-center justify-between mb-2">
              <span class="status-number text-green-main">200</span>
              <span class="status-pill bg-[#dcfce7] text-green-main">OK</span>
            </div>
            <h4 class="text-sm font-bold text-text-primary mb-1">Permintaan Berhasil</h4>
            <p class="text-xs text-text-secondary">Request sukses diproses dan rekomendasi berhasil digenerate.</p>
          </div>

          <!-- 400 Bad Request -->
          <div class="status-card border-amber-border bg-[#fffbeb]">
            <div class="flex items-center justify-between mb-2">
              <span class="status-number text-amber">400</span>
              <span class="status-pill bg-[#fef3c7] text-amber">Bad Request</span>
            </div>
            <h4 class="text-sm font-bold text-text-primary mb-1">Payload Tidak Lengkap</h4>
            <p class="text-xs text-text-secondary">Field judul dan abstrak sama-sama kosong, atau format JSON salah sintaks.</p>
          </div>

          <!-- 401 Unauthorized -->
          <div class="status-card border-red-border bg-[#fef2f2]">
            <div class="flex items-center justify-between mb-2">
              <span class="status-number text-red">401</span>
              <span class="status-pill bg-[#fee2e2] text-red">Unauthorized</span>
            </div>
            <h4 class="text-sm font-bold text-text-primary mb-1">API Key Tidak Sah</h4>
            <p class="text-xs text-text-secondary">Header <code>X-API-Key</code> tidak disertakan atau sudah dicabut (revoked).</p>
          </div>

          <!-- 422 Unprocessable Entity -->
          <div class="status-card border-brand-border bg-brand-light">
            <div class="flex items-center justify-between mb-2">
              <span class="status-number text-brand">422</span>
              <span class="status-pill bg-[#ede9fe] text-brand">Unprocessable</span>
            </div>
            <h4 class="text-sm font-bold text-text-primary mb-1">Validasi Schema Gagal</h4>
            <p class="text-xs text-text-secondary">Tipe data tidak valid (contoh: <code>k_rank</code> diisi string atau float negatif).</p>
          </div>

          <!-- 500 Internal Error -->
          <div class="status-card border-red-border bg-[#fef2f2]">
            <div class="flex items-center justify-between mb-2">
              <span class="status-number text-red">500</span>
              <span class="status-pill bg-[#fee2e2] text-red">Server Error</span>
            </div>
            <h4 class="text-sm font-bold text-text-primary mb-1">In-Memory Cache Loading</h4>
            <p class="text-xs text-text-secondary">Server sedang memuat model pertama kali. Cek status via <code>GET /status</code>.</p>
          </div>
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

.flow-card-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.flow-card-step {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-bottom: 0.2rem;
}

.flow-card-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.35rem;
}

.flow-card-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.flow-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Endpoint Directory Grid */
.endpoint-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
  width: 100%;
}

.endpoint-item-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.15rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.endpoint-item-card:hover {
  border-color: var(--brand-border);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(114, 9, 183, 0.06);
}

.endpoint-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.endpoint-speed-badge {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.endpoint-path {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
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

/* Status Matrix Grid */
.status-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
  width: 100%;
}

.status-card {
  border: 1px solid;
  border-radius: var(--radius-lg);
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
}

.status-number {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 800;
}

.status-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
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
  .api-flow-diagram {
    flex-direction: column;
    align-items: stretch;
  }
  .flow-arrow {
    transform: rotate(90deg);
    padding: 0.5rem 0;
  }
}
</style>
