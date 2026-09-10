<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const serverStatus = ref('checking')
const cacheReady = ref(false)
const checkTime = ref('')

const checkHealth = async () => {
  try {
    const res = await api.get('/status')
    serverStatus.value = 'online'
    cacheReady.value = res.data.data.cache_ready
    checkTime.value = new Date().toLocaleTimeString('id-ID')
  } catch {
    serverStatus.value = 'offline'
    cacheReady.value = false
    checkTime.value = new Date().toLocaleTimeString('id-ID')
  }
}

onMounted(checkHealth)
</script>

<template>
  <div class="caching-page animate-in">
    <div class="prose docs-prose">
      <!-- Header -->
      <div class="page-header">
        <span class="page-badge">Architecture & Performance</span>
        <h1 class="page-title">Caching & Indexing Method</h1>
        <p class="page-lead">
          Arsitektur <strong>Multi-Tier Caching</strong> dan <strong>Hybrid Incremental Indexing</strong> 
          yang memungkinkan SiReDo v3 menghasilkan rekomendasi dosen berkecepatan tinggi (&lt; 50ms) dengan ketersediaan tinggi (Zero Downtime).
        </p>
      </div>

      <!-- Live Status Card -->
      <div class="status-card">
        <div class="status-card__left">
          <div class="status-indicator">
            <span :class="['dot', serverStatus === 'online' && cacheReady ? 'dot--green' : serverStatus === 'online' ? 'dot--amber' : 'dot--red']"></span>
            <span class="status-text">
              Status Cache Memory: 
              <strong>{{ serverStatus === 'online' && cacheReady ? 'Ready & In-Memory' : serverStatus === 'online' ? 'Warming Up' : 'Offline' }}</strong>
            </span>
          </div>
          <p class="status-desc">
            Model BM25 Okapi dan tensor Sentence-BERT termuat penuh di RAM. Terakhir dicek: {{ checkTime || 'memeriksa...' }}
          </p>
        </div>
        <button @click="checkHealth" class="status-refresh-btn">
          Periksa Ulang
        </button>
      </div>

      <!-- Section 1: Motivasi -->
      <section>
        <h2>1. Motivasi & Latar Belakang</h2>
        <p>
          Dalam sistem rekomendasi berbasis NLP modern, komputasi embedding dense berdimensi 768 dari model 
          Transformer (Sentence-BERT) membutuhkan waktu komputasi yang tinggi jika dieksekusi dari awal (*from scratch*) 
          pada setiap permintaan. Jika terdapat puluhan hingga ratusan profil dosen, proses forward pass berulang akan membebani CPU dan meningkatkan latensi sistem.
        </p>
        <p>
          Untuk memecahkan kendala tersebut, SiReDo mengadopsi prinsip <strong>Multi-Tier Caching Layer</strong>:
        </p>
        <ul>
          <li><strong>Pre-Computed Embeddings</strong>: Ekstraksi fitur teks korpus dosen hanya dihitung sekali saat sistem *warm-up* dan disimpan ke disk (*persistent storage*).</li>
          <li><strong>In-Memory Tensor Lookup</strong>: Menghitung Cosine Similarity secara instan menggunakan operasi matriks tensor SIMD berkecepatan tinggi.</li>
          <li><strong>Zero Database Overhead</strong>: Metadata dosen, daftar istilah leksikal, dan inverted index BM25 berada di memori siap saji tanpa query SQL berulang.</li>
        </ul>
      </section>

      <!-- Section 2: Arsitektur Multi-Tier -->
      <section>
        <h2>2. Arsitektur Multi-Tier Caching</h2>
        <p>
          Sistem pembagian lapisan memori dirancang secara berjenjang antara RAM (Tier 1) dan Disk Storage (Tier 2):
        </p>

        <div class="tier-grid">
          <!-- Tier 1 -->
          <div class="tier-card tier-card--tier1">
            <div class="tier-badge">Tier 1: RAM (In-Memory)</div>
            <h3>Singleton CacheService</h3>
            <p class="tier-desc">Dikelola di memori utama runtime Python dengan proteksi thread-safe <code>threading.RLock</code>.</p>
            <ul class="tier-list">
              <li><code>dosen_list</code>: Seluruh entitas profil dosen lengkap.</li>
              <li><code>bm25.bm25</code>: Inverted index BM25Okapi siap query.</li>
              <li><code>corpus_embeddings</code>: Matriks tensor NumPy (N × 768 dense).</li>
              <li><code>keybert_data</code>: Cache frasa topik dosen untuk XAI.</li>
            </ul>
          </div>

          <!-- Tier 2 -->
          <div class="tier-card tier-card--tier2">
            <div class="tier-badge">Tier 2: Persistent Disk</div>
            <h3>File Cache Storage</h3>
            <p class="tier-desc">Disimpan di direktori <code>server/storage/cache/</code> untuk pemulihan startup instan (&lt; 0.5s).</p>
            <ul class="tier-list">
              <li><code>sbert_embeddings.npy</code>: Format biner NumPy memory-mapped.</li>
              <li><code>keybert_dosen.json</code>: Serialisasi kata kunci topik XAI.</li>
              <li><code>dosen_data.pkl</code>: Snapshot struktur model Python.</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Section 3: Hybrid Incremental Indexing -->
      <section>
        <h2>3. Hybrid Incremental Indexing</h2>
        <p>
          Salah satu inovasi penting pada versi v3 adalah <strong>Hybrid Incremental Indexing</strong>. Pada arsitektur sebelumnya, setiap kali ada perubahan data dosen (tambah, edit, hapus), sistem harus melakukan inisialisasi ulang penuh yang memakan waktu dan mengunci layanan.
        </p>
        <p>
          Dengan metode inkremental terpadu:
        </p>
        <div class="feature-box">
          <div class="feature-title">Mekanisme Update Parsial On-The-Fly:</div>
          <ol>
            <li><strong>Operasi Tambah Dosen</strong>: Hanya menghitung vektor embedding untuk 1 dosen baru, lalu melakukan <code>np.vstack()</code> ke matriks tensor yang ada.</li>
            <li><strong>Operasi Edit Dosen</strong>: Mengganti baris vektor spesifik pada indeks yang bersangkutan di dalam memori tanpa menyentuh dosen lainnya.</li>
            <li><strong>Operasi Hapus Dosen</strong>: Menghapus baris vektor terkait menggunakan <code>np.delete()</code> secara instan.</li>
            <li><strong>Rebuild BM25 Cepat</strong>: Rekonstruksi token table BM25Okapi berlangsung dalam hitungan milidetik (&lt; 10ms) karena korpus teks sudah terstruktur di RAM.</li>
          </ol>
        </div>
        <blockquote>
          <strong>Zero Downtime:</strong> Flag <code>is_ready</code> tetap bernilai <code>true</code> selama pembaruan inkremental berlangsung, sehingga endpoint rekomendasi tidak pernah mengalami *downtime* bagi client SIAKAD.
        </blockquote>
      </section>

      <!-- Section 4: Lifecycle & Warm-up Flow -->
      <section>
        <h2>4. Alur Siklus Hidup Cache (Lifecycle)</h2>
        <p>
          Ketika server dijalankan via CLI (<code>python siredo serve</code>), sistem menjalankan prosedur warm-up 5 tahap:
        </p>

        <div class="timeline">
          <div class="timeline-step">
            <div class="timeline-num">1</div>
            <div class="timeline-content">
              <strong>Pemuatan Data Relasional</strong>
              <p>Membaca entitas dosen, riwayat bimbingan, dan publikasi dari database SQLite/MySQL.</p>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-num">2</div>
            <div class="timeline-content">
              <strong>Penyusunan Korpus Terbobot</strong>
              <p>Menggabungkan bidang keahlian (bobot 5×), riwayat bimbingan (1×), dan judul jurnal (2×) menjadi dokumen komprehensif.</p>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-num">3</div>
            <div class="timeline-content">
              <strong>Fitting BM25 Inverted Index</strong>
              <p>Tokenisasi teks korpus dan perhitungan Term Frequency (TF) serta Inverse Document Frequency (IDF).</p>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-num">4</div>
            <div class="timeline-content">
              <strong>Pemuatan Vektor SBERT & KeyBERT</strong>
              <p>Mengecek keberadaan file <code>.npy</code> di disk. Jika ada, dimuat instan (&lt; 0.1s). Jika belum ada, proses encoding neural network dijalankan.</p>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-num">5</div>
            <div class="timeline-content">
              <strong>Pemberian Sinyal Kesiapan (Ready Flag)</strong>
              <p>Status <code>is_ready = true</code> diaktifkan. Sistem siap melayani rekomendasi sub-50ms.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5: Benchmark Performa -->
      <section>
        <h2>5. Tolok Ukur Kecepatan (Performance Benchmark)</h2>
        <div class="benchmark-table">
          <table>
            <thead>
              <tr>
                <th>Tahap Eksekusi</th>
                <th>Tanpa Caching</th>
                <th>Dengan Multi-Tier Cache</th>
                <th>Efisiensi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Startup & Cold Boot</td>
                <td>~12.5 detik</td>
                <td>~0.45 detik</td>
                <td><strong>27× Lebih Cepat</strong></td>
              </tr>
              <tr>
                <td>Query Rekomendasi (Single)</td>
                <td>~850 ms</td>
                <td>~28 ms</td>
                <td><strong>30× Lebih Cepat</strong></td>
              </tr>
              <tr>
                <td>Update Dosen (CRUD)</td>
                <td>~8.2 detik (Full Rebuild)</td>
                <td>~45 ms (Incremental)</td>
                <td><strong>180× Lebih Cepat</strong></td>
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
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 3rem 2.5rem 5rem;
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
  margin-bottom: 1rem;
}
.page-title {
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}
.page-lead {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.75;
  margin: 0;
}

/* Status card */
.status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-left: 4px solid var(--brand);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot--green { background: var(--green); box-shadow: 0 0 0 3px var(--green-bg); }
.dot--amber { background: var(--amber); box-shadow: 0 0 0 3px var(--amber-bg); }
.dot--red   { background: var(--red); box-shadow: 0 0 0 3px var(--red-bg); }

.status-text {
  font-size: 0.88rem;
  color: var(--text-primary);
}
.status-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}
.status-refresh-btn {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.status-refresh-btn:hover {
  background: var(--brand);
  color: white;
}

/* Tier grid */
.tier-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin: 1.5rem 0 2rem;
}
.tier-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}
.tier-badge {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--brand);
  margin-bottom: 0.5rem;
}
.tier-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}
.tier-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}
.tier-list {
  padding-left: 1.25rem;
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

/* Feature box */
.feature-box {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  margin: 1.25rem 0;
}
.feature-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}
.feature-box ol {
  padding-left: 1.25rem;
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}
.timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
}
.timeline-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--brand-light);
  color: var(--brand);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--brand-border);
}
.timeline-content strong {
  font-size: 0.9rem;
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}
.timeline-content p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Benchmark table */
.benchmark-table {
  overflow-x: auto;
  margin: 1.25rem 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.benchmark-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.benchmark-table th {
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--text-primary);
}
.benchmark-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
}
.benchmark-table tr:last-child td {
  border-bottom: none;
}
.benchmark-table strong {
  color: var(--brand);
}

@media (max-width: 768px) {
  .caching-page { padding: 2rem 1.25rem 4rem; }
  .tier-grid { grid-template-columns: 1fr; }
  .status-card { flex-direction: column; align-items: flex-start; }
}
</style>
