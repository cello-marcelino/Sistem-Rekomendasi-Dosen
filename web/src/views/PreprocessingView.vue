<template>
  <div class="docs-page animate-in">
    <div class="prose docs-prose">

      <!-- Page Header -->
      <div class="page-header">
        <span class="page-badge">DOKUMENTASI PIPELINE</span>
        <h1 class="page-title">Pipeline NLP &amp; Scoring</h1>
        <p class="page-lead">
          Tahapan pemrosesan teks dari judul dan abstrak skripsi menjadi rekomendasi dosen terukur berbasis BM25 dan SBERT.
        </p>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="nlp-metrics-ribbon">
        <div class="metric-item">
          <span class="metric-val">Hybrid Retrieval</span>
          <span class="metric-desc">BM25 Leksikal + SBERT Semantik</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-item">
          <span class="metric-val">384 Dimensi</span>
          <span class="metric-desc">Vektor Dense Representation</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-item">
          <span class="metric-val">Adaptive α</span>
          <span class="metric-desc">Dinamis Berdasarkan Panjang Query</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-item">
          <span class="metric-val">Explainable AI</span>
          <span class="metric-desc">Irisan Kata & Topik Relevansi</span>
        </div>
      </div>

      <!-- Arsitektur Visual -->
      <section id="arsitektur">
        <h2>Arsitektur Sistem</h2>
        <p>
          SiReDo menggabungkan dua paradigma pencarian komplementer: <strong>BM25</strong> untuk menangkap kecocokan kata kunci eksak (lexical matching) dan <strong>Sentence-BERT</strong> untuk memahami konteks dan kemiripan makna (semantic matching).
        </p>

        <div class="pipeline-visual-box">
          <div class="pv-step">
            <div class="pv-icon-wrap">
              <svg class="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="pv-label">Input Query</div>
            <div class="pv-desc">Judul & Abstrak</div>
          </div>

          <div class="pv-arrow">→</div>

          <div class="pv-step">
            <div class="pv-icon-wrap">
              <svg class="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div class="pv-label">Preprocessing</div>
            <div class="pv-desc">Cleaning & N-Gram</div>
          </div>

          <div class="pv-arrow">→</div>

          <!-- Dual Paradigm Fork -->
          <div class="pv-fork-wrap">
            <div class="pv-fork-step pv-fork-step--bm25">
              <div class="pv-fork-badge">Jalur 1 · Leksikal</div>
              <strong>BM25 Scoring</strong>
              <span>Exact keyword frequency & IDF</span>
            </div>
            <div class="pv-fork-step pv-fork-step--sbert">
              <div class="pv-fork-badge">Jalur 2 · Semantik</div>
              <strong>SBERT Encoding</strong>
              <span>Cosine similarity 384-D vector</span>
            </div>
          </div>

          <div class="pv-arrow">→</div>

          <div class="pv-step pv-step--highlight">
            <div class="pv-icon-wrap pv-icon-wrap--brand">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="pv-label">Hybrid Ranking</div>
            <div class="pv-desc">α·BM25 + β·SBERT</div>
          </div>

          <div class="pv-arrow">→</div>

          <div class="pv-step">
            <div class="pv-icon-wrap">
              <svg class="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="pv-label">XAI Layer</div>
            <div class="pv-desc">Penjelasan Bukti</div>
          </div>
        </div>
      </section>

      <!-- Section 1: Preprocessing Teks -->
      <section id="preprocessing">
        <h2>1. Preprocessing Teks</h2>
        <p>
          Setiap teks query distandarisasi melalui serangkaian filter pembersihan terstruktur sebelum masuk ke tahap pencocokan:
        </p>

        <div class="transform-grid">
          <!-- Transform Card 1 -->
          <div class="transform-card">
            <div class="tc-header">
              <span class="tc-step-num">Step A</span>
              <h4>Case Folding & Cleaning</h4>
            </div>
            <p class="tc-desc">Konversi huruf kecil, pembersihan tanda baca khusus, dan pemfilteran karakter tunggal.</p>
            <div class="token-flow">
              <div class="token-row">
                <span class="token-label">Input</span>
                <span class="token-sample">"Penerapan Deep Learning untuk Deteksi Penyakit Daun!"</span>
              </div>
              <div class="token-arrow">↓</div>
              <div class="token-row token-row--clean">
                <span class="token-label">Output</span>
                <span class="token-sample">"penerapan deep learning untuk deteksi penyakit daun"</span>
              </div>
            </div>
          </div>

          <!-- Transform Card 2 -->
          <div class="transform-card">
            <div class="tc-header">
              <span class="tc-step-num">Step B</span>
              <h4>Stopword Removal & Bigram</h4>
            </div>
            <p class="tc-desc">Menghilangkan kata non-informatif (stopword) serta mengekstrak n-gram untuk menjaga kesatuan frasa.</p>
            <div class="token-chips-wrap">
              <div class="chips-group">
                <span class="chips-title">Unigrams:</span>
                <div class="chips-list">
                  <span class="chip chip--blue">deep</span>
                  <span class="chip chip--blue">learning</span>
                  <span class="chip chip--blue">deteksi</span>
                  <span class="chip chip--blue">penyakit</span>
                  <span class="chip chip--blue">daun</span>
                </div>
              </div>
              <div class="chips-group">
                <span class="chips-title">Bigrams (Frasa 2 Kata):</span>
                <div class="chips-list">
                  <span class="chip chip--brand">deep_learning</span>
                  <span class="chip chip--brand">deteksi_penyakit</span>
                  <span class="chip chip--brand">penyakit_daun</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bobot Repetisi Profil Dosen -->
        <h3>Struktur Pembobotan Profil Dosen (Corpus)</h3>
        <p>
          Data dosen diekstraksi dengan pembobotan repetisi bertingkat agar kata kunci keahlian utama memiliki pengaruh lebih kuat pada BM25:
        </p>

        <div class="weight-pills-grid">
          <div class="weight-pill">
            <div class="wp-badge">5x Bobot</div>
            <div class="wp-info">
              <strong>Bidang Keahlian Dosen</strong>
              <span>Topik kompetensi spesifik (paling dominan)</span>
            </div>
          </div>
          <div class="weight-pill">
            <div class="wp-badge wp-badge--2x">2x Bobot</div>
            <div class="wp-info">
              <strong>Judul Publikasi / Jurnal</strong>
              <span>Riwayat artikel ilmiah dosen yang pernah diterbitkan</span>
            </div>
          </div>
          <div class="weight-pill">
            <div class="wp-badge wp-badge--1x">1x Bobot</div>
            <div class="wp-info">
              <strong>Riwayat Bimbingan & Uji</strong>
              <span>Judul skripsi dan tesis mahasiswa terdahulu</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: Ekspansi Sinonim -->
      <section id="ekspansi">
        <h2>2. Ekspansi Sinonim (Query Expansion)</h2>
        <p>
          Untuk menjembatani perbedaan kosakata antara mahasiswa dan dosen (<em>vocabulary gap</em>), query diperluas dengan istilah sinonim domain akademik sebelum diproses oleh model SBERT:
        </p>

        <div class="expansion-visual-card">
          <div class="ev-header">
            <span class="ev-tag">Ontologi Domain Komputer & Informatika</span>
            <strong>Pencocokan Frasa Otomatis</strong>
          </div>
          <div class="ev-body">
            <div class="ev-source">
              <span class="ev-label">Query Pengguna:</span>
              <div class="ev-query-box">
                "Penelitian tentang <mark class="ev-mark">deep learning</mark> untuk klasifikasi gambar"
              </div>
            </div>
            <div class="ev-arrow-row">
              <span class="ev-arrow-text">↳ Terdeteksi frasa ontologi: <code>deep learning</code></span>
            </div>
            <div class="ev-expanded">
              <span class="ev-label">Query Setelah Ekspansi SBERT:</span>
              <div class="ev-chips-list">
                <span class="chip-plain">deep learning</span>
                <span class="chip-plain">klasifikasi gambar</span>
                <span class="chip-added">+ dl</span>
                <span class="chip-added">+ neural network</span>
                <span class="chip-added">+ cnn</span>
                <span class="chip-added">+ rnn</span>
                <span class="chip-added">+ transformer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: BM25 Lexical Scoring -->
      <section id="bm25">
        <h2>3. BM25 — Lexical Scoring</h2>
        <p>
          BM25 menghitung relevansi berdasarkan kecocokan kata kunci dan frekuensi kemunculan istilah dalam korpus dosen:
        </p>

        <div class="formula-visual-card">
          <div class="fvc-title">Formula BM25Okapi & Normalisasi Sigmoid</div>
          <div class="formula-box">
            <div class="formula-text">
              BM25(q, d) = Σ IDF(qᵢ) · <span class="fr-frac"><span class="fr-num">f(qᵢ, d) · (k₁ + 1)</span><span class="fr-den">f(qᵢ, d) + k₁ · (1 - b + b · |d|/avgdl)</span></span>
            </div>
            <div class="formula-legend">
              <span><code>k₁ = 1.5</code>, <code>b = 0.75</code></span>
              <span><code>score_norm = 1 / (1 + e^(−z/2))</code></span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: SBERT Semantic Scoring -->
      <section id="sbert">
        <h2>4. SBERT — Semantic Scoring</h2>
        <p>
          Sentence-BERT memetakan teks ke dalam ruang vektor multidimensi (384 dimensi), mengukur kedekatan konsep bahkan ketika kata kunci yang digunakan berbeda:
        </p>

        <div class="cosine-visual-card">
          <div class="cvc-header">
            <strong>Cosine Similarity Vector Space</strong>
            <span class="cvc-badge">Rentang 0.0 — 1.0</span>
          </div>
          <div class="cvc-body">
            <div class="vector-compare-row">
              <div class="vector-item">
                <span class="vi-name">Vektor Query Mahasiswa</span>
                <span class="vi-sub">[0.042, -0.185, 0.923, ... 384-D]</span>
              </div>
              <div class="vi-math">× Cosine Dot Product</div>
              <div class="vector-item">
                <span class="vi-name">Vektor Profil Dosen</span>
                <span class="vi-sub">[0.038, -0.190, 0.910, ... 384-D]</span>
              </div>
              <div class="vi-result">
                <span class="vi-score">0.914</span>
                <span class="vi-status">Sangat Cocok</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5: Hybrid Ranking & Adaptive Alpha -->
      <section id="hybrid">
        <h2>5. Hybrid Ranking & Adaptive Alpha</h2>
        <p>
          Skor BM25 dan SBERT digabungkan secara dinamis. Proporsi bobot disesuaikan secara otomatis berdasarkan panjang query:
        </p>

        <!-- Visual Adaptive Gauge -->
        <div class="adaptive-visual-container">
          <div class="adaptive-card">
            <div class="ac-header">
              <span class="ac-badge">Mode Kata Kunci (Query Pendek &lt; 15 Token)</span>
              <strong>Prioritas Presisi Leksikal</strong>
            </div>
            <div class="gauge-bar">
              <div class="gb-segment gb-segment--bm25" style="width: 70%">BM25 · 70% (α = 0.70)</div>
              <div class="gb-segment gb-segment--sbert" style="width: 30%">SBERT · 30% (β = 0.30)</div>
            </div>
            <p class="ac-note">Cocok untuk pencarian cepat judul ringkas atau kata kunci topik tunggal.</p>
          </div>

          <div class="adaptive-card">
            <div class="ac-header">
              <span class="ac-badge ac-badge--purple">Mode Abstrak (Query Panjang ≥ 15 Token)</span>
              <strong>Prioritas Pemahaman Konteks</strong>
            </div>
            <div class="gauge-bar">
              <div class="gb-segment gb-segment--bm25" style="width: 35%">BM25 · 35%</div>
              <div class="gb-segment gb-segment--sbert" style="width: 65%">SBERT · 65% (β = 0.65)</div>
            </div>
            <p class="ac-note">Cocok untuk paragraf latar belakang dan abstrak lengkap penelitian.</p>
          </div>
        </div>
      </section>

      <!-- Section 6: Explainability (XAI) -->
      <section id="xai">
        <h2>6. Explainability (XAI)</h2>
        <p>
          Setiap rekomendasi dilengkapi kartu penjelasan visual yang transparan, memudahkan reviewer dan mahasiswa memverifikasi alasan di balik rekomendasi dosen:
        </p>

        <!-- XAI Mockup Result Card -->
        <div class="xai-mockup-card">
          <div class="xm-header">
            <div class="xm-profile">
              <div class="xm-avatar">DG</div>
              <div class="xm-info">
                <h4>Dr. Ir. Hendra Gunawan, M.T.</h4>
                <span>Program Studi Teknik Informatika · NIDN 041208xxxx</span>
              </div>
            </div>
            <div class="xm-score-badge">
              <span class="xm-score-num">89.4%</span>
              <span class="xm-score-label">Skor Hybrid</span>
            </div>
          </div>

          <div class="xm-bars-breakdown">
            <div class="xm-bar-item">
              <div class="xm-bar-meta">
                <span>BM25 Leksikal</span>
                <strong>86.2%</strong>
              </div>
              <div class="xm-progress-track">
                <div class="xm-progress-fill xm-progress-fill--blue" style="width: 86.2%"></div>
              </div>
            </div>
            <div class="xm-bar-item">
              <div class="xm-bar-meta">
                <span>SBERT Semantik</span>
                <strong>92.1%</strong>
              </div>
              <div class="xm-progress-track">
                <div class="xm-progress-fill xm-progress-fill--brand" style="width: 92.1%"></div>
              </div>
            </div>
          </div>

          <div class="xm-tags-section">
            <div class="xm-tag-group">
              <span class="xm-tag-title">Irisan Kata Kunci (BM25 Match):</span>
              <div class="xm-pills">
                <span class="x-pill x-pill--green">deep_learning</span>
                <span class="x-pill x-pill--green">deteksi_penyakit</span>
                <span class="x-pill x-pill--green">daun</span>
                <span class="x-pill x-pill--green">cnn</span>
              </div>
            </div>

            <div class="xm-tag-group">
              <span class="xm-tag-title">Topik Semantik Terkait (KeyBERT):</span>
              <div class="xm-pills">
                <span class="x-pill x-pill--purple">computer vision</span>
                <span class="x-pill x-pill--purple">convolutional network</span>
                <span class="x-pill x-pill--purple">plant pathology</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Skenario Mitigasi -->
      <section id="skenario">
        <h2>Skenario Mitigasi</h2>
        <div class="scenario-grid">
          <div class="scenario-card-modern">
            <div class="scm-header">
              <span class="scm-badge scm-badge--red">Hard Filter</span>
              <h4>Pencegahan Out-of-Domain</h4>
            </div>
            <p>
              Dosen tanpa satu pun kecocokan kata kunci (BM25 = 0) langsung dieliminasi, menjamin tidak ada dosen lintas bidang yang muncul secara keliru.
            </p>
          </div>

          <div class="scenario-card-modern">
            <div class="scm-header">
              <span class="scm-badge scm-badge--brand">Adaptive Alpha</span>
              <h4>Keseimbangan Fleksibel</h4>
            </div>
            <p>
              Skema bobot beradaptasi secara otomatis dengan gaya input pengguna, baik berupa kata kunci pendek maupun paragraf abstrak panjang.
            </p>
          </div>

          <div class="scenario-card-modern">
            <div class="scm-header">
              <span class="scm-badge scm-badge--blue">Ekspansi Sinonim</span>
              <h4>Jembatan Terminologi</h4>
            </div>
            <p>
              Kamus ontologi domain menambahkan istilah alternatif sehingga pencarian semantik tetap akurat meskipun istilah penulisan berbeda.
            </p>
          </div>

          <div class="scenario-card-modern">
            <div class="scm-header">
              <span class="scm-badge scm-badge--green">Incremental Indexing</span>
              <h4>Pembaruan Otomatis Latar Belakang</h4>
            </div>
            <p>
              Pembaruan data dosen via panel admin diproses secara lokal di memori dalam hitungan detik tanpa mengganggu sesi pengguna yang sedang aktif.
            </p>
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

.page-header {
  margin-bottom: 1.5rem;
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
  margin-bottom: 0 !important;
}

/* NLP Metrics Ribbon */
.nlp-metrics-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.75rem;
  margin: 1.75rem 0 2.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.metric-item {
  display: flex;
  flex-direction: column;
}
.metric-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
}
.metric-desc {
  font-size: 0.74rem;
  color: var(--text-muted);
}
.metric-divider {
  width: 1px;
  height: 28px;
  background: var(--border);
}

/* Pipeline Visual Box */
.pipeline-visual-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.75rem 1.5rem;
  margin: 1.5rem 0 2.5rem;
  gap: 0.75rem;
  overflow-x: auto;
}
.pv-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 90px;
}
.pv-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.45rem;
}
.pv-icon-wrap--brand {
  background: var(--brand);
  border-color: var(--brand);
}
.pv-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
}
.pv-desc {
  font-size: 0.68rem;
  color: var(--text-muted);
}
.pv-arrow {
  color: var(--border-strong);
  font-size: 1.1rem;
  font-weight: 700;
  user-select: none;
}
.pv-fork-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 170px;
}
.pv-fork-step {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: left;
}
.pv-fork-step--bm25 {
  background: var(--blue-bg);
  border: 1px solid var(--blue-border);
}
.pv-fork-step--sbert {
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
}
.pv-fork-badge {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}
.pv-fork-step strong {
  font-size: 0.78rem;
  color: var(--text-primary);
}
.pv-fork-step span {
  font-size: 0.68rem;
  color: var(--text-secondary);
}

/* Transform Grid */
.transform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.25rem;
  margin: 1.25rem 0 2rem;
  width: 100%;
}
.transform-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}
.tc-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.4rem;
}
.tc-step-num {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  background: var(--brand-light);
  color: var(--brand);
  border: 1px solid var(--brand-border);
  padding: 2px 7px;
  border-radius: 99px;
}
.tc-header h4 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}
.tc-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 1rem !important;
}
.token-flow {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.9rem;
}
.token-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.token-label {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
.token-sample {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-primary);
}
.token-arrow {
  font-size: 0.75rem;
  color: var(--border-strong);
  text-align: center;
}
.token-chips-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chips-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.chips-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
}
.chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.chip {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}
.chip--blue {
  background: var(--blue-bg);
  color: var(--blue);
  border: 1px solid var(--blue-border);
}
.chip--brand {
  background: var(--brand-light);
  color: var(--brand);
  border: 1px solid var(--brand-border);
}

/* Weight Pills Grid */
.weight-pills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0 2rem;
  width: 100%;
}
.weight-pill {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.wp-badge {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
.wp-badge--2x {
  color: var(--blue);
  background: var(--blue-bg);
  border-color: var(--blue-border);
}
.wp-badge--1x {
  color: var(--text-secondary);
  background: var(--bg-subtle);
  border-color: var(--border);
}
.wp-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wp-info strong {
  font-size: 0.85rem;
  color: var(--text-primary);
}
.wp-info span {
  font-size: 0.74rem;
  color: var(--text-muted);
}

/* Expansion Visual Card */
.expansion-visual-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.35rem;
  margin: 1.25rem 0 2rem;
}
.ev-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.ev-tag {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  padding: 2px 8px;
  border-radius: 99px;
}
.ev-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.ev-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.25rem;
}
.ev-query-box {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.85rem;
  font-size: 0.85rem;
  color: var(--text-primary);
}
.ev-mark {
  background: var(--brand-light);
  color: var(--brand);
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
}
.ev-arrow-row {
  font-size: 0.78rem;
  color: var(--brand);
  font-weight: 600;
  padding-left: 0.5rem;
}
.ev-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chip-plain {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.chip-added {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--brand-light);
  color: var(--brand);
  border: 1px solid var(--brand-border);
}

/* Formula box */
.formula-visual-card {
  background: #0f0f14;
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  margin: 1.25rem 0 2rem;
}
.fvc-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
}
.formula-text {
  font-family: var(--font-mono);
  font-size: 0.92rem;
  color: #e4e4f0;
  line-height: 1.8;
  margin-bottom: 0.75rem;
}
.fr-frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 0.25rem; }
.fr-num { border-bottom: 1px solid #6b7280; padding: 0 0.25rem 2px; }
.fr-den { padding: 2px 0.25rem 0; }
.formula-legend { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.formula-legend span { font-size: 0.75rem; color: #9ca3af; }
.formula-legend code { background: #1e1e2e; color: #a6e3a1; border: none; font-size: 0.75rem; padding: 1px 4px; border-radius: 3px; }

/* Cosine visual card */
.cosine-visual-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin: 1.25rem 0 2rem;
}
.cvc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}
.cvc-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
}
.vector-compare-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.85rem 1.1rem;
  gap: 1rem;
  flex-wrap: wrap;
}
.vector-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vi-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
}
.vi-sub {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
}
.vi-math {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--border-strong);
}
.vi-result {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.vi-score {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--green);
}
.vi-status {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--green);
}

/* Adaptive visual container */
.adaptive-visual-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin: 1.25rem 0 2rem;
}
.adaptive-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.ac-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.ac-badge {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--blue);
}
.ac-badge--purple {
  color: var(--brand);
}
.gauge-bar {
  display: flex;
  height: 28px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 28px;
  text-align: center;
}
.gb-segment--bm25 {
  background: var(--blue-bg);
  color: var(--blue);
  border: 1px solid var(--blue-border);
}
.gb-segment--sbert {
  background: var(--brand-light);
  color: var(--brand);
  border: 1px solid var(--brand-border);
}
.ac-note {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0 !important;
}

/* XAI Mockup Card */
.xai-mockup-card {
  background: var(--bg-base);
  border: 1.5px solid var(--brand-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin: 1.25rem 0 2rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
}
.xm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.1rem;
  border-bottom: 1px solid var(--border);
}
.xm-profile {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.xm-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--brand-light);
  color: var(--brand);
  font-weight: 800;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--brand-border);
}
.xm-info h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}
.xm-info span {
  font-size: 0.78rem;
  color: var(--text-muted);
}
.xm-score-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.xm-score-num {
  font-family: var(--font-mono);
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--brand);
  line-height: 1.1;
}
.xm-score-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
}
.xm-bars-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--border);
}
.xm-bar-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.xm-bar-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--text-secondary);
}
.xm-progress-track {
  height: 8px;
  background: var(--bg-muted);
  border-radius: 99px;
  overflow: hidden;
}
.xm-progress-fill {
  height: 100%;
  border-radius: 99px;
}
.xm-progress-fill--blue { background: var(--blue); }
.xm-progress-fill--brand { background: var(--brand); }
.xm-tags-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-top: 1.1rem;
}
.xm-tag-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.xm-tag-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}
.xm-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.x-pill {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}
.x-pill--green {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid var(--green-border);
}
.x-pill--purple {
  background: var(--brand-light);
  color: var(--brand);
  border: 1px solid var(--brand-border);
}

/* Scenario Grid */
.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.25rem;
  margin: 1.25rem 0 2rem;
  width: 100%;
}
.scenario-card-modern {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.scm-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.scm-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 99px;
  width: fit-content;
}
.scm-badge--red {
  background: #fee2e2;
  color: var(--red);
  border: 1px solid #fecaca;
}
.scm-badge--brand {
  background: var(--brand-light);
  color: var(--brand);
  border: 1px solid var(--brand-border);
}
.scm-badge--blue {
  background: var(--blue-bg);
  color: var(--blue);
  border: 1px solid var(--blue-border);
}
.scm-badge--green {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid var(--green-border);
}
.scm-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}
.scenario-card-modern p {
  margin: 0 !important;
  font-size: 0.83rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 992px) {
  .nlp-metrics-ribbon { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .metric-divider { display: none; }
  .transform-grid { grid-template-columns: 1fr; }
  .weight-pills-grid { grid-template-columns: 1fr; }
  .adaptive-visual-container { grid-template-columns: 1fr; }
  .scenario-grid { grid-template-columns: 1fr; }
  .pipeline-visual-box { flex-direction: column; align-items: stretch; }
  .pv-arrow { transform: rotate(90deg); text-align: center; }
}

@media (max-width: 768px) {
  .docs-page { padding: 1.75rem 1.25rem 4rem; }
  .xm-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .xm-bars-breakdown { grid-template-columns: 1fr; }
}
</style>

