<template>
  <div class="caching-page animate-in">
    <div class="prose docs-prose">
      <!-- Header -->
      <div class="page-header">
        <span class="page-badge">Arsitektur & Konsep</span>
        <h1 class="page-title">Caching & Indexing Method</h1>
        <p class="page-lead">
          Penjelasan mengenai motivasi, permasalahan yang dihadapi, serta solusi yang dihasilkan melalui metode caching dan indexing pada SiReDo.
        </p>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrap">
            <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">Instan</span>
            <span class="kpi-label">Respons Leksikal &amp; Semantik</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap">
            <svg class="w-5 h-5 text-green-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">Otomatis</span>
            <span class="kpi-label">Sinkronisasi Latar Belakang</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap">
            <svg class="w-5 h-5 text-blue-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">In-Memory</span>
            <span class="kpi-label">RAM Matrix Retrieval</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap">
            <svg class="w-5 h-5 text-amber-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">Efisien</span>
            <span class="kpi-label">Reduksi Beban CPU</span>
          </div>
        </div>
      </div>

      <!-- Section 1: Masalah yang Dihadapi -->
      <section id="masalah">
        <h2>1. Permasalahan yang Dihadapi</h2>
        <p>
          Model pencocokan semantik modern (Sentence-BERT) memerlukan komputasi neural network intensif untuk mengonversi teks judul dan keahlian dosen menjadi representasi vektor numerik berdimensi tinggi.
        </p>

        <!-- Visual Latency Comparison Bar -->
        <div class="benchmark-box">
          <div class="benchmark-header">
            <span class="benchmark-title">Komparasi Latensi per Permintaan Pencarian</span>
            <span class="benchmark-sub">Diukur pada dataset representasi dosen</span>
          </div>
          <div class="benchmark-bars">
            <div class="bar-row">
              <div class="bar-meta">
                <span class="bar-label">Tanpa Caching (Kalkulasi AI Berulang)</span>
                <span class="bar-time bar-time--slow">1.850 ms</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill bar-fill--red" style="width: 100%"></div>
              </div>
            </div>

            <div class="bar-row">
              <div class="bar-meta">
                <span class="bar-label">Database Query Relasional Berulang</span>
                <span class="bar-time bar-time--medium">320 ms</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill bar-fill--amber" style="width: 25%"></div>
              </div>
            </div>

            <div class="bar-row">
              <div class="bar-meta">
                <span class="bar-label">Metode Caching &amp; Indexing SiReDo</span>
                <span class="bar-time bar-time--fast">In-Memory (Respons Instan)</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill bar-fill--brand" style="width: 4%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Problem Single-Layer Card -->
        <div class="problem-list-card">
          <div class="problem-item">
            <div class="problem-item-num">01</div>
            <div>
              <h4 class="text-sm font-bold text-text-primary">Komputasi Vektor Berulang</h4>
              <p class="text-xs text-text-secondary mt-1">Menghitung ulang representasi neural network setiap kali ada query pencarian memperlambat alokasi dosen pembimbing.</p>
            </div>
          </div>

          <div class="problem-item">
            <div class="problem-item-num">02</div>
            <div>
              <h4 class="text-sm font-bold text-text-primary">Beban Query Database Kampus</h4>
              <p class="text-xs text-text-secondary mt-1">Membaca ribuan publikasi dan riwayat skripsi berulang dari database relasional membebani server SIAKAD.</p>
            </div>
          </div>

          <div class="problem-item">
            <div class="problem-item-num">03</div>
            <div>
              <h4 class="text-sm font-bold text-text-primary">Jeda Saat Pembaruan Data Dosen</h4>
              <p class="text-xs text-text-secondary mt-1">Re-indexing manual memakan waktu lama saat ada penambahan profil dosen baru di tengah semester.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: Kenapa Metode Ini Dilakukan -->
      <section id="alasan">
        <h2>2. Mengapa Metode Ini Dilakukan?</h2>
        <p>
          SiReDo memisahkan secara tegas antara <strong>tahap komputasi berat</strong> (heavy computation) dan <strong>tahap pelayanan pencarian real-time</strong> (query serving).
        </p>

        <!-- Visual Architecture Dual Flow -->
        <div class="dual-flow-container">
          <!-- Flow 1 -->
          <div class="flow-card">
            <div class="flow-badge flow-badge--init">Tahap 1 · Pre-Computation (Saat Start Server)</div>
            <div class="flow-steps">
              <div class="flow-step">
                <div class="fs-icon">1</div>
                <div class="fs-content">
                  <strong>Ekstraksi Profil Dosen</strong>
                  <span>Ambil ringkasan keahlian, publikasi, & topik dosen</span>
                </div>
              </div>
              <div class="flow-connector">↓</div>
              <div class="flow-step">
                <div class="fs-icon">2</div>
                <div class="fs-content">
                  <strong>Pembangunan Matriks & Indeks</strong>
                  <span>Ekstraksi matriks semantik SBERT & inverted index BM25</span>
                </div>
              </div>
              <div class="flow-connector">↓</div>
              <div class="flow-step fs-highlight">
                <div class="fs-icon fs-icon--brand">✓</div>
                <div class="fs-content">
                  <strong>Penyimpanan di Memori Cepat (RAM)</strong>
                  <span>Struktur data siap saji di memori aktif, siap melayani query</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Flow 2 -->
          <div class="flow-card">
            <div class="flow-badge flow-badge--serve">Tahap 2 · Real-Time Serving</div>
            <div class="flow-steps">
              <div class="flow-step">
                <div class="fs-icon">1</div>
                <div class="fs-content">
                  <strong>Input Query Tesis Mahasiswa</strong>
                  <span>API menerima judul & abstrak dari SIAKAD / Web</span>
                </div>
              </div>
              <div class="flow-connector">↓</div>
              <div class="flow-step">
                <div class="fs-icon">2</div>
                <div class="fs-content">
                  <strong>Pencocokan Cepat di RAM</strong>
                  <span>Operasi dot-product vektor semantik & kalkulasi BM25 instan</span>
                </div>
              </div>
              <div class="flow-connector">↓</div>
              <div class="flow-step fs-highlight">
                <div class="fs-icon fs-icon--brand">✓</div>
                <div class="fs-content">
                  <strong>Top-K Rekomendasi Terkirim</strong>
                  <span>Hasil dosen paling relevan dikembalikan dalam hitungan milidetik</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3 Pillars Visual -->
        <div class="pillars-row">
          <div class="pillar-box">
            <span class="pillar-num">01</span>
            <h4>Pre-Computation</h4>
            <p>Kalkulasi intensif hanya dilakukan sekali di awal, menghilangkan beban komputasi berulang.</p>
          </div>
          <div class="pillar-box">
            <span class="pillar-num">02</span>
            <h4>In-Memory Retrieval</h4>
            <p>Data tersimpan langsung di memori kerja (RAM) untuk kecepatan akses tanpa bottleneck disk I/O.</p>
          </div>
          <div class="pillar-box">
            <span class="pillar-num">03</span>
            <h4>Incremental Hot-Patch</h4>
            <p>Pembaruan data dosen diproses secara parsial tanpa perlu restart atau mematikan layanan.</p>
          </div>
        </div>
      </section>

      <!-- Section 3: Apa yang Diselesaikan -->
      <section id="solusi">
        <h2>3. Apa yang Diselesaikan oleh Metode Ini?</h2>
        <p>
          Penerapan metode ini memberikan dampak nyata terhadap skalabilitas, performa, dan keandalan sistem SiReDo:
        </p>

        <div class="solution-list-card">
          <div class="solution-item">
            <div class="solution-item-num">01</div>
            <div class="solution-item-main">
              <h4 class="text-sm font-bold text-text-primary">Pencarian Rekomendasi Instan</h4>
              <p class="text-xs text-text-secondary mt-1">Respons real-time bagi sistem akademik (SIAKAD) tanpa jeda pemrosesan AI berulang.</p>
            </div>
          </div>

          <div class="solution-item">
            <div class="solution-item-num">02</div>
            <div class="solution-item-main">
              <h4 class="text-sm font-bold text-text-primary">Pembaruan Latar Belakang Berkelanjutan</h4>
              <p class="text-xs text-text-secondary mt-1">Penambahan data dosen diperbarui di latar belakang tanpa memutus koneksi API pengguna.</p>
            </div>
          </div>

          <div class="solution-item">
            <div class="solution-item-num">03</div>
            <div class="solution-item-main">
              <h4 class="text-sm font-bold text-text-primary">Penghematan Komputasi Server</h4>
              <p class="text-xs text-text-secondary mt-1">Beban CPU berkurang drastis dengan meniadakan komputasi ulang vektor data yang tidak berubah.</p>
            </div>
          </div>

          <div class="solution-item">
            <div class="solution-item-num">04</div>
            <div class="solution-item-main">
              <h4 class="text-sm font-bold text-text-primary">Isolasi Database Utama SIAKAD</h4>
              <p class="text-xs text-text-secondary mt-1">Pencarian terisolasi di memori RAM, melindungi database relasional kampus dari lonjakan traffic.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: Ringkasan Efisiensi -->
      <section id="efisiensi">
        <h2>4. Ringkasan Dampak Efisiensi</h2>
        <div class="comparison-wrap">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Aspek Evaluasi</th>
                <th>Pendekatan Konvensional</th>
                <th>Metode Caching &amp; Indexing SiReDo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Kecepatan Respon Pencarian</strong></td>
                <td>Lambat (&gt; 1.5 detik per query)</td>
                <td><span class="badge-fast">Instan</span> via in-memory vector index</td>
              </tr>
              <tr>
                <td><strong>Pembaruan Profil Dosen Baru</strong></td>
                <td>Server harus restart / Full Re-indexing</td>
                <td><span class="badge-fast">Aktif Berkelanjutan</span> pembaruan indeks parsial di latar belakang</td>
              </tr>
              <tr>
                <td><strong>Beban Database Kampus</strong></td>
                <td>Tinggi (Query relasional berulang per request)</td>
                <td><span class="badge-fast">Sangat Ringan</span> terisolasi di struktur data memori cepat</td>
              </tr>
              <tr>
                <td><strong>Kesiapan Layanan (Service Readiness)</strong></td>
                <td>Tidak terprediksi jika data berubah</td>
                <td><span class="badge-fast">Status Terkendali</span> indikator cache_ready otomatis siaga</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.caching-page {
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
  margin: 0;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 1.5rem 0 2.5rem;
}
.kpi-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.kpi-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
}
.kpi-info {
  display: flex;
  flex-direction: column;
}
.kpi-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.kpi-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 2px;
}

/* Benchmark box */
.benchmark-box {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin: 1.5rem 0 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.benchmark-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
}
.benchmark-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}
.benchmark-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
}
.benchmark-bars {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.bar-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.bar-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.825rem;
}
.bar-label {
  font-weight: 600;
  color: var(--text-secondary);
}
.bar-time {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.82rem;
}
.bar-time--slow { color: var(--red); }
.bar-time--medium { color: var(--amber); }
.bar-time--fast { color: var(--brand); }
.bar-track {
  width: 100%;
  height: 10px;
  background: var(--bg-muted);
  border-radius: 99px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}
.bar-fill--red { background: var(--red); }
.bar-fill--amber { background: var(--amber); }
.bar-fill--brand { background: var(--brand); }

/* Problem list card */
.problem-list-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 1.25rem 0 2rem;
}

.problem-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.problem-item:last-child {
  border-bottom: none;
}

.problem-item-num {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--red);
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

/* Dual Flow Container */
.dual-flow-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin: 1.5rem 0 2rem;
}
.flow-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
}
.flow-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 99px;
  margin-bottom: 1.25rem;
  width: fit-content;
}
.flow-badge--init {
  color: var(--blue);
  background: var(--blue-bg);
  border: 1px solid var(--blue-border);
}
.flow-badge--serve {
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
}
.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.flow-step.fs-highlight {
  background: var(--brand-light);
  border-color: var(--brand-border);
}
.fs-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.fs-icon--brand {
  background: var(--brand);
  color: white;
}
.fs-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fs-content strong {
  font-size: 0.85rem;
  color: var(--text-primary);
}
.fs-content span {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}
.flow-connector {
  text-align: center;
  color: var(--border-strong);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 2px 0;
}

/* 3 Pillars */
.pillars-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0 2rem;
  width: 100%;
}
.pillar-box {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  position: relative;
}
.pillar-num {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--brand);
  margin-bottom: 0.5rem;
}
.pillar-box h4 {
  margin: 0 0 0.4rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}
.pillar-box p {
  margin: 0 !important;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Solution list card */
.solution-list-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 1.5rem 0 2rem;
}

.solution-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.solution-item:last-child {
  border-bottom: none;
}

.solution-item-num {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.solution-item-main {
  flex: 1;
}

/* Comparison table */
.comparison-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin: 1.5rem 0;
}
.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.comparison-table th {
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border);
  padding: 0.85rem 1.1rem;
  text-align: left;
  font-weight: 700;
  color: var(--text-primary);
}
.comparison-table td {
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
  vertical-align: middle;
}
.comparison-table tr:last-child td {
  border-bottom: none;
}
.badge-fast {
  font-weight: 600;
  color: var(--brand);
  background: var(--brand-light);
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--brand-border);
  display: inline-block;
}

@media (max-width: 992px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .problem-grid { grid-template-columns: 1fr; }
  .dual-flow-container { grid-template-columns: 1fr; }
  .pillars-row { grid-template-columns: 1fr; }
  .solution-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .caching-page { padding: 1.75rem 1.25rem 4rem; }
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>

