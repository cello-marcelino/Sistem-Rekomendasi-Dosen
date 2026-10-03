# Dokumen Analisis Sistem & Rekayasa Kebutuhan SIREDO v3

Dokumen ini berisi analisis komprehensif dari sistem **SiReDo v3 (Sistem Rekomendasi Dosen)**. Inventarisasi dan klasifikasi requirement digali berdasarkan analisis statik terhadap *source code* (Flask Backend, Vue 3 Frontend), struktur direktori, dokumentasi internal (`docs/`), rute API, struktur basis data, serta komponen UI (web utama & polibatam-siredo).

---

## 1. Feature Inventory (Inventarisasi Fitur)

Berdasarkan eksplorasi arsitektur, seluruh fitur sistem terkelompok ke dalam 7 domain utama:

1. **Autentikasi & Keamanan (Security Domain)**
   - Registrasi dan manajemen `API Key` untuk aplikasi Klien (*Client System*).
   - Login autentikasi berjenjang (JWT/Session) untuk Administrator.
   - Middlewares Otorisasi: Proteksi *Role-Based Access Control* (RBAC) pada *endpoint* privat.
2. **Manajemen Data Induk Dosen (Master Data Domain)**
   - CRUD (Create, Read, Update, Delete) Profil Dosen.
   - Manajemen relasi sub-entitas: Daftar Publikasi, Riwayat Bimbingan, dan Riwayat Pengujian.
   - Update inkremental (*incremental cache update*) ke dalam memori AI setiap ada perubahan data tanpa perlu *restart*.
3. **Core NLP & Rekomendasi (Artificial Intelligence Domain)**
   - Preprocessing Teks (Normalisasi Regex, *Stopword Removal*, *N-Grams*).
   - Semantic Expansion (Penambahan sinonim dari kamus IT/Data *greedy matching*).
   - Lexical Search BM25 Okapi dengan *Sigmoid Z-Score Normalization*.
   - Pemangkasan Kandidat (*Hard Constraint Pruning*) untuk efisiensi matriks.
   - Semantic Search Sentence-BERT (SBERT) Multilingual (Kalkulasi *Cosine Similarity* pada vektor Dense 768-D).
   - Adaptive Hybrid Scoring (Pembobotan dinamis $\alpha, \beta$ berdasarkan panjang *query* token masukan).
   - Explainable AI (XAI) melalui ekstraksi *KeyBERT* dan irisan kata kunci proposal-dosen.
4. **Layanan Eksekusi Rekomendasi (Service Execution Domain)**
   - *Single Recommendation* Endpoint (1 Proposal $\rightarrow$ Top K Dosen).
   - *Batch Recommendation* Endpoint (Array Proposal $\rightarrow$ Array Output).
   - *Excel Upload Pipeline* (Impor .xlsx $\rightarrow$ Ekspor hasil .xlsx).
   - *Server-Sent Events* (SSE) Stream untuk animasi pipeline *real-time* di UI.
5. **Konfigurasi Mesin & Monitor Sistem (System/Monitoring Domain)**
   - Sandbox & Live Config Tuning (Pengubahan batas *threshold*, koefisien hibrida secara *runtime*).
   - Async Hot Reload / Re-indexing *zero-downtime* via *background thread*.
   - Endpoint *Health Check* & *Startup Warm-up Progress*.
6. **Alat Operasional & Basis Data (CLI Automation Domain)**
   - Automasi migrasi DDL Database (`db:migrate`).
   - Eksekutor Data Seeder & Excel Importer/Exporter (`db:seed`, `db:import`, `db:export`).
   - Logging sistem terstruktur & Cache manager (`logs -f`, `cache:clear`).
7. **Antarmuka Aplikasi (User Interface Domain)**
   - **Klien Web (`web/`)**: Landing page promosi, *sandbox* pengujian pipeline, dokumentasi integrasi API interaktif.
   - **Admin Web (`polibatam-siredo/`)**: Dashboard pengelolaan Master Dosen, tuning *Hyperparameter* NLP, simulasi batch, dan fitur Penjadwalan Sidang TA otomatis di pihak *client-side*.

---

## 2. Functional Requirements (FR)

Tabel Kebutuhan Fungsional sistem diuraikan menggunakan standar *Input-Proses-Output*.

| ID | Modul | Requirement | Aktor/Komponen | Input | Proses | Output | Status | Bukti |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **FR-001** | Auth Client | Registrasi Klien API | Klien SIAKAD / Umum | Email, Nama, Organisasi, Password | Hash password, catat DB, hasilkan *API Key* 64-karakter unik. | Profil Klien & API Key Baru | `implemented` | `ClientRegisterView.vue`, `client_auth_controller.py`, tabel `clients` |
| **FR-002** | Auth Admin | Autentikasi Admin | Administrator | Username, Password | Pengecekan *bcrypt hash* di DB, terbitkan Token Sesi JWT/HMAC. | Status Login & Token Sesi | `implemented` | `LoginView.vue`, `admin_auth_controller.py`, tabel `admins` |
| **FR-003** | Auth Global | Proteksi *Endpoint* | Security Middleware | Header HTTP `Authorization` / `X-API-Key` | Cegat *request*, validasi token HMAC / API Key ke basis data/konfigurasi. | Hak akses rute dikabulkan / HTTP 401 | `implemented` | `@require_api_key`, `@require_admin_auth` decorators |
| **FR-004** | Master Dosen | CRUD Profil Dosen & Riwayat | Administrator | JSON Data (Biodata, Publikasi, TA, Sidang) | Operasi transaksi *relational database* (SQLite/MySQL), terapkan perubahan *in-memory cache* SBERT/BM25. | HTTP 200/201 (Detail Profil) | `implemented` | `AdminDosenController`, `DosenFormView.vue`, `incremental_update` di cache |
| **FR-005** | NLP Engine | Preprocessing Teks Proposal | NLP Pipeline | Teks Judul & Abstrak | *Cleansing regex*, hapus imbuhan & *stopword*, tokenisasi *n-gram*. | Daftar Token Bersih | `implemented` | Tampilan `PreprocessingView.vue`, dokumen `nlp-pipeline.md` |
| **FR-006** | NLP Engine | Ekspansi Semantik (*Synonym*) | NLP Pipeline | Token Preprocessing | Membandingkan term dengan kamus statis domain IT secara *greedy matching*. | Token Tambahan (Ekspansi) | `implemented` | Deskripsi Kamus Sinonim di `nlp-pipeline.md` |
| **FR-007** | NLP Engine | *Lexical Scoring* & Normalisasi | NLP Pipeline | Token Terekspansi | Penilaian matriks skor Okapi BM25 terhadap Inverted Index, diakhiri dengan Z-Score Sigmoid Transform. | Skor Leksikal (0.0 - 1.0) | `implemented` | `bm25_engine.py` |
| **FR-008** | NLP Engine | *Hard Constraint Pruning* | NLP Pipeline | Skor Leksikal | Eliminasi mutlak / *filter-out* seluruh dosen dengan skor leksikal 0. | Array Target Dosen (Terfilter) | `implemented` | Dokumen *Pruning* `nlp-pipeline.md` |
| **FR-009** | NLP Engine | *Semantic Scoring* (Sentence-BERT) | NLP Pipeline | Teks Abstrak Mentah | Encoding SBERT Multilingual, kalkulasi *Cosine Similarity* menggunakan SIMD/Vektorisasi NumPy pada RAM. | Skor Semantik (0.0 - 1.0) | `implemented` | `sbert_engine.py`, Load `.npy` cache |
| **FR-010** | NLP Engine | *Adaptive Hybrid Scoring* & Top-K | NLP Pipeline | Skor Leksikal, Semantik, *Query Length* | Pemilihan pembobotan (mode abstrak / mode kata kunci), gabungkan skor, urutkan dengan algoritma `np.argpartition` $O(N+K\log K)$. | *Array* Terurut Top-K | `implemented` | `hybrid_scorer.py`, `nlp-pipeline.md` |
| **FR-011** | NLP Engine | Ekstraksi *Explainable AI* (XAI) | NLP Pipeline | Dosen Kandidat (Top-K) | Ekstraksi `irisan_kata` (murni) & `topik_dosen` (via KeyBERT Cache). | Metadata XAI pada respon JSON | `implemented` | Komponen `XaiModal.vue`, respons `/api/recommendations` |
| **FR-012** | Servis Rec. | *Single Recommendation* | Web Klien / API | JSON {judul, abstrak} | Menjalankan Pipeline NLP Leksikal & Semantik (Endpoint). | 5 Top Dosen (JSON) | `implemented` | `POST /api/recommendations/single`, `SingleRecommendationView.vue` |
| **FR-013** | Servis Rec. | *Batch* & *Excel Upload Recommendation* | API / Web Admin | JSON Array / File `.xlsx` | Iterasi *Single Rec* secara rekursif terhadap batch, konversi hasil ke *file* laporan Excel. | Array Result / Stream `.xlsx` | `implemented` | `POST /api/recommendations/upload`, `BatchRecommendationView.vue` |
| **FR-014** | Servis Rec. | *Real-Time Pipeline Stream* (SSE) | Web Klien | Teks Judul/Abstrak | Memecah tahap komputasi menjadi *event stream* Server-Sent Events. | *Progress Event Stream* HTTP | `implemented` | `POST /api/recommendations/stream` |
| **FR-015** | Konfigurasi | *Hot Reload & Zero-Downtime Cache* | Administrator | Endpoint Trigger | *Spawning background thread* untuk memuat ulang indeks dan embedding dari *disk* $\rightarrow$ RAM. | Status progres persentase | `implemented` | `POST /api/system/reload`, arsitektur di `system-design.md` |
| **FR-016** | CLI System | Administrasi *Database Automation* | Developer / SysAdmin | Terminal (*Command* CLI) | Eksekusi file SQL DDL (Migrasi), ekstraksi Excel ke DB (*Import*). | Basis Data Ternormalisasi | `implemented` | `cli/` framework (python siredo db:migrate) |
| **FR-017** | Penjadwalan | *Auto-Scheduling* Sidang TA | Administrator | Data TA & Dosen, Form Pengaturan (Tgl) | Algoritma *Constraint-based* di Javascript (Maks 2 TA/hari/dosen, 10/periode). | Tabel Penjadwalan Visual | `implemented` | `SchedulingView.vue`, fungsi `scheduleDefenses()` |

---

## 3. Non-Functional Requirements (NFR)

Pengukuran kualitas sistem (*Quality Attributes*), batasan teknis, dan SLA kinerja.

| ID | Kategori | Requirement | Target / Metric | Status | Bukti / Konteks |
|:---|:---|:---|:---|:---|:---|
| **NFR-001** | *Performance* | Latensi Operasi CRUD & Fetch Dosen | Respon API Katalog di bawah $< 10 \text{ ms}$. | `implemented` | Serialisasi JSON *In-Memory* (`system-design.md`) |
| **NFR-002** | *Performance* | Latensi Servis Rekomendasi NLP | Eksekusi penuh algoritma *Hybrid* selesai dalam $20 \text{--} 40 \text{ ms}$ per dokumen. | `implemented` | Toleransi *SIMD Array operations* (`system-design.md`) |
| **NFR-003** | *Performance* | Kompleksitas *Ranking Algorithm* | Pengurutan kandidat harus beroperasi pada kompleksitas waktu linear logaritmik $O(N + K \log K)$. | `implemented` | Implementasi Numpy `argpartition` (`nlp-pipeline.md`) |
| **NFR-004** | *Availability* | *Zero-Downtime Reload Tolerance* | Sinkronisasi data model AI / konfigurasi via `POST /system/reload` harus dikerjakan secara *asynchronous* tanpa memberhentikan trafik servis klien. | `implemented` | Thread asinkron `CacheService` / Status API 200 polling (`system-design.md`) |
| **NFR-005** | *Data Integrity*| Integritas Transaksional (*ACID*) | Manipulasi *batch import dataset* Excel harus dibungkus dalam *Atomic Transaction* SQL (sukses seluruhnya atau gagal seluruhnya / *Rollback*). | `implemented` | `SQLDosenRepository.save_batch()` |
| **NFR-006** | *Security* | Proteksi & Manajemen *Secrets* | Variabel *port*, target API, dan kata sandi DB tidak boleh *hardcode* dalam repositori, wajib disuplai via *Environment Variable* UTF-8 `.env` murni. | `implemented` | Skrip `vite.config.js`, integrasi `loadEnv` Node.js, config Flask. |
| **NFR-007** | *Security* | Sentralisasi Proteksi Autentikasi | Pencegahan akses sirkumventif wajib diaplikasikan dengan anotasi dekorator Python (`@require_api_key`) pada *routing blueprint*. | `implemented` | Modul `security_middleware.py` |
| **NFR-008** | *Reliability* | Sentralisasi *Error Handling* | Seluruh interupsi dan *exception* wajib diseragamkan (*intercepted*) ke format respons *envelope* JSON standar. Mencegah *stack trace* terekspos. | `implemented` | Registrasi `@app.errorhandler` pada `app.py` |
| **NFR-009** | *Maintainability*| Separasi *Frontend - Backend* | Arsitektur harus patuh terhadap asas *Decoupled Fullstack*: Lapisan UI Vue 3 tidak menempel/ber-iterferensi dengan logika *Routing/Services* Flask API. | `implemented` | Struktur `web/`, `polibatam-siredo/`, `server/` (lihat `README.md`) |
| **NFR-010** | *Usability* | Transparansi *Explainable AI* | Output mesin *black-box* SBERT wajib disertakan metrik irisan logika bahasa agar rekomendasi memiliki justifikasi yang dapat dipahami pengguna awam. | `implemented` | Komponen popup `XaiModal.vue` |

---

## 4. Requirement Traceability (Keterlacakan)

Alur verifikasi asal usul fitur dengan kebutuhan fungsional/non-fungsional dan implementasinya.

- **Feature: Sistem API Berperforma Tinggi** $\rightarrow$ [FR-013, NFR-002, NFR-003, NFR-006] $\rightarrow$ *Bukti*: `server/src/services/nlp/hybrid_scorer.py`, `docs/system-design.md`.
- **Feature: Hot-Reload & Caching AI** $\rightarrow$ [FR-018, NFR-004] $\rightarrow$ *Bukti*: `POST /api/system/reload`, file cache `sbert_embeddings.npy` di direktori storage, background worker di Flask.
- **Feature: XAI (Explainable AI) Layer** $\rightarrow$ [FR-012, NFR-010] $\rightarrow$ *Bukti*: `XaiModal.vue`, `nlp-pipeline.md`, JSON metadata *irisan_kata* / *topik_dosen* dari KeyBERT.
- **Feature: Operasional Database & CLI** $\rightarrow$ [FR-019, FR-020, NFR-005] $\rightarrow$ *Bukti*: Direktori `server/cli/`, fungsi transaksi di modul `connection/` dan skema SQL.
- **Feature: Manajemen Otomatis Penjadwalan Sidang TA** $\rightarrow$ [FR-021] $\rightarrow$ *Bukti*: Logika pembatasan kalender di `scheduler.js` dan visualisasi pada `SchedulingView.vue`.

---

## 5. Gap Analysis (Analisis Kesenjangan & Konflik)

Dari proses inspeksi forensik arsitektur, ditemukan beberapa kesenjangan fungsional maupun struktural:

1. **Frontend *Feature* Tanpa Integrasi Backend (Penjadwalan TA)**
   - **Gap**: Terdapat modul antarmuka `SchedulingView.vue` yang menggunakan *engine* algoritma penjadwalan `scheduler.js` di dalam direktori `polibatam-siredo/src/services/`. Engine ini sukses menghitung jadwal berdasarkan limitasi (2/hari, 10/periode) secara proyektif pada *client-side*.
   - **Isu**: Belum ada titik temu (*endpoint* API) untuk menyimpan (*persistence*), membaca ulang, maupun mengeksekusi *CRUD* jadwal sidang ini ke dalam tabel relasional database server.

2. **Ketiadaan Parameter Uji Numerik (*Testability Metric*) pada Dokumentasi**
   - **Gap**: Dokumentasi `README.md` dan struktur repositori mengindikasikan adanya unit test dan pipeline pengujian (via Pytest di direktori `server/tests/`).
   - **Isu**: Belum ada dokumen, laporan liputan kode (*Code Coverage Report*), maupun matrik NFR yang menjelaskan secara eksplisit ambang batas minimal metrik pengujian yang wajib terpenuhi (misal: "Minimum Test Coverage 80% pada `hybrid_scorer.py`").

3. **Duplikasi Pengaturan UI untuk Konfigurasi Engine NLP**
   - **Gap**: *Tuning parameter* skor (*Alpha, Threshold*) memiliki *interface* administratif penuh di `AdminConfigView.vue`. Pada saat yang bersamaan, *web klien utama* juga memfasilitasi interaksi *sandbox configuration* di `SingleRecommendationView.vue`.
   - **Isu**: Perlu dokumentasi batas izin yang jelas: interaksi klien murni dikemas sebagai "Sandbox Simulation", sedangkan interaksi Administrator bersifat "Runtime DB Update". Endpoint `/api/config/simulate` di-otorisasi secara berbeda dari `PATCH /api/config`. Hal ini telah diimplementasikan dalam struktur rute, namun rentan membingungkan (*UI context overload*) jika tidak dibedakan pelabelannya secara masif di Frontend.

4. **Karakteristik *In-Memory Database* & Risiko RAM**
   - **Gap**: NFR Performa tinggi ($<40 \text{ ms}$) dicapai melalui pencatatan mutlak *In-Memory matrix array* dari SBERT model `.npy`. 
   - **Isu**: Jika dataset master Dosen (`n`) membengkak hingga puluhan ribu profil (contoh: deployment skala nasional), *Resource Utilization* (RAM) sistem akan ikut terikat secara proporsional. NFR mengenai batasan batas memori maksimal saat ini masih absen/inferred, sehingga memicu ancaman kelayakan skalabilitas raksasa di masa depan.
