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

      <!-- Section 1: Masalah yang Dihadapi -->
      <section id="masalah">
        <h2>1. Permasalahan yang Dihadapi</h2>
        <p>
          Dalam membangun sistem rekomendasi cerdas berbasis kecerdasan buatan (*AI & NLP*), model pencocokan semantik (Sentence-BERT) memerlukan komputasi yang intensif untuk mengubah teks judul, abstrak, dan keahlian dosen menjadi representasi vektor numerik berdimensi tinggi.
        </p>
        <p>
          Tanpa perancangan arsitektur penyimpanan dan indeks yang tepat, sistem menghadapi kendala kritis berikut:
        </p>
        <div class="problem-card">
          <div class="problem-item">
            <strong>Latensi Tinggi pada Pencarian Real-Time</strong>
            <p>
              Jika vektor kecerdasan buatan harus dihitung ulang setiap kali mahasiswa atau admin mengirimkan judul penelitian, waktu tunggu pencarian akan melonjak hingga beberapa detik. Hal ini membuat pengalaman pengguna terasa lambat dan tidak memenuhi standar respon sistem informasi modern.
            </p>
          </div>
          <div class="problem-item">
            <strong>Ketergantungan Query Database yang Berulang</strong>
            <p>
              Membaca ribuan data publikasi dan riwayat bimbingan dosen dari database relasional secara terus-menerus pada setiap permintaan akan membebani database kampus secara berlebihan.
            </p>
          </div>
          <div class="problem-item">
            <strong>Gangguan Layanan Saat Data Diperbarui (Downtime)</strong>
            <p>
              Pada pendekatan konvensional, setiap kali ada satu profil dosen baru yang didaftarkan atau diubah keahliannya, sistem harus mengulang perhitungan seluruh dosen dari awal (*Full Re-indexing*). Selama proses berulang tersebut, layanan rekomendasi harus dimatikan atau dikunci sementara, sehingga sistem kampus lain tidak dapat terhubung.
            </p>
          </div>
        </div>
      </section>

      <!-- Section 2: Kenapa Metode Ini Dilakukan -->
      <section id="alasan">
        <h2>2. Mengapa Metode Ini Dilakukan?</h2>
        <p>
          Metode caching dan indexing diterapkan untuk memisahkan antara **proses komputasi berat** dengan **proses pelayanan pencarian langsung** (*Decoupling Heavy Computation from Query Serving*).
        </p>
        <p>
          Prinsip utama di balik penerapan metode ini:
        </p>
        <ul>
          <li>
            <strong>Hitung Sekali, Gunakan Selamanya (*Pre-Computation*)</strong>:
            Vektor pemahaman semantik untuk seluruh dosen cukup diekstraksi satu kali saja saat sistem pertama kali dinyalakan. Hasil pemahaman tersebut disimpan di tempat penyimpanan cepat agar dapat digunakan berkali-kali tanpa komputasi ulang.
          </li>
          <li>
            <strong>Pencarian Langsung di Memori Siap Saji (*In-Memory Retrieval*)</strong>:
            Dengan meletakkan indeks leksikal dan matriks vektor dosen langsung di memori kerja (RAM), proses pencarian hanya membutuhkan operasi pencocokan matematis sederhana yang berlangsung dalam hitungan milidetik.
          </li>
          <li>
            <strong>Pembaruan Terisolasi (*Incremental Indexing*)</strong>:
            Ketika data seorang dosen diperbarui, sistem hanya memproses perubahan dosen tersebut saja secara lokal tanpa perlu menyentuh atau menghitung ulang data dosen lainnya yang tidak berubah.
          </li>
        </ul>
      </section>

      <!-- Section 3: Apa yang Diselesaikan -->
      <section id="solusi">
        <h2>3. Apa yang Diselesaikan oleh Metode Ini?</h2>
        <p>
          Penerapan metode ini memberikan dampak signifikan terhadap performa, efisiensi, dan keandalan sistem SiReDo:
        </p>

        <div class="solution-grid">
          <div class="solution-card">
            <div class="solution-num">1</div>
            <h3>Pencarian Rekomendasi Instan</h3>
            <p>
              Waktu yang dibutuhkan untuk menemukan rekomendasi dosen terpangkas dari hitungan detik menjadi kurang dari 50 milidetik, memberikan respon instan bagi sistem akademik (SIAKAD) maupun pengguna portal.
            </p>
          </div>

          <div class="solution-card">
            <div class="solution-num">2</div>
            <h3>Layanan Tanpa Henti (Zero Downtime)</h3>
            <p>
              Penambahan, pengeditan, atau penghapusan data dosen dapat dilakukan kapan saja oleh staf akademik. Sistem memperbarui indeks secara langsung di latar belakang tanpa perlu mematikan aplikasi atau mengganggu pengguna yang sedang aktif.
            </p>
          </div>

          <div class="solution-card">
            <div class="solution-num">3</div>
            <h3>Penghematan Beban Komputasi Server</h3>
            <p>
              Beban kerja prosesor (CPU) berkurang drastis karena server tidak lagi melakukan inferensi neural network berulang untuk data yang sama, sehingga konsumsi daya dan biaya infrastruktur server menjadi jauh lebih hemat.
            </p>
          </div>

          <div class="solution-card">
            <div class="solution-num">4</div>
            <h3>Kesiapan Sistem yang Terjamin</h3>
            <p>
              Sistem dilengkapi indikator kesiapan otomatis yang memastikan setiap permintaan rekomendasi hanya akan diproses setelah struktur pencarian benar-benar siap dan konsisten, mencegah risiko hasil kosong atau kegagalan sistem.
            </p>
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
                <th>Aspek</th>
                <th>Pendekatan Tradisional</th>
                <th>Metode Caching & Indexing SiReDo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Waktu Respon Pencarian</strong></td>
                <td>Lambat (harus encode ulang seluruh dosen)</td>
                <td><span class="badge-fast">Instan (&lt; 50ms)</span> menggunakan vektor siap saji</td>
              </tr>
              <tr>
                <td><strong>Penambahan Dosen Baru</strong></td>
                <td>Layanan terkunci (Full Re-indexing)</td>
                <td><span class="badge-fast">Berjalan Otomatis</span> hanya memproses data dosen baru</td>
              </tr>
              <tr>
                <td><strong>Beban Database Kampus</strong></td>
                <td>Tinggi (query berulang setiap request)</td>
                <td><span class="badge-fast">Sangat Rendah</span> data terstruktur tersimpan di memori cepat</td>
              </tr>
              <tr>
                <td><strong>Ketersediaan Sistem</strong></td>
                <td>Sering terputus saat pemeliharaan data</td>
                <td><span class="badge-fast">100% Selalu Siaga</span> siap melayani integrasi API kampus</td>
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

/* Problem card */
.problem-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.25rem 0 2rem;
}
.problem-item {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: 4px solid var(--red);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}
.problem-item strong {
  color: var(--red);
  font-size: 0.92rem;
  display: block;
  margin-bottom: 0.25rem;
}
.problem-item p {
  font-size: 0.84rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Solution grid */
.solution-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin: 1.5rem 0 2rem;
}
.solution-card {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  transition: border-color 0.15s;
}
.solution-card:hover {
  border-color: var(--brand-border);
}
.solution-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--brand-light);
  color: var(--brand);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--brand-border);
}
.solution-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}
.solution-card p {
  font-size: 0.825rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.65;
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
}

@media (max-width: 768px) {
  .caching-page { padding: 2rem 1.25rem 4rem; }
  .solution-grid { grid-template-columns: 1fr; }
}
</style>
