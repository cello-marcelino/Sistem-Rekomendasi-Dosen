/**
 * Benchmark Samples dari pipeline-lab/samples/benchmark_samples.json
 * Digunakan untuk menghasilkan topik penelitian cepat secara acak pada formulir rekomendasi dosen.
 */
export const allBenchmarkSamples = [
  {
    id: "SAMPLE-1",
    label: "Smart Agri & IoT",
    category: "Smart Agri / IoT / Machine Learning",
    judul: "Rancang Bangun Sistem Smart Agriculture Berbasis Internet of Things (IoT) dengan Prediksi Kebutuhan Air Tanaman Menggunakan Machine Learning dan Monitoring Berbasis Web",
    abstrak: "Perkembangan teknologi Internet of Things (IoT), Machine Learning (ML), dan Web Development membuka peluang dalam pengembangan sistem pertanian cerdas yang mampu meningkatkan efisiensi pengelolaan sumber daya dan produktivitas tanaman. Penelitian ini bertujuan untuk merancang dan membangun sistem Smart Agriculture yang dapat melakukan pemantauan kondisi lingkungan tanaman secara real-time serta memprediksi kebutuhan penyiraman secara otomatis menggunakan algoritma Machine Learning. Sistem memanfaatkan mikrokontroler ESP32 yang terintegrasi dengan sensor kelembapan tanah, suhu, dan kelembapan udara untuk mengumpulkan data lingkungan secara berkala. Data tersebut kemudian dikirimkan ke server melalui jaringan internet untuk diproses menggunakan algoritma Random Forest dalam memprediksi kebutuhan penyiraman berdasarkan kondisi lingkungan yang terukur. Hasil pemantauan dan prediksi ditampilkan melalui aplikasi berbasis web yang menyediakan fitur visualisasi data sensor, riwayat kondisi lingkungan, status perangkat, serta rekomendasi penyiraman. Sistem ini diharapkan mampu membantu pengguna dalam mengambil keputusan penyiraman secara lebih akurat, mengurangi penggunaan air yang tidak efisien, dan meningkatkan efektivitas pemeliharaan tanaman. Pengujian dilakukan melalui pengukuran akurasi model Machine Learning, respons komunikasi IoT, serta fungsionalitas aplikasi web. Penelitian ini mengintegrasikan tiga bidang teknologi, yaitu IoT sebagai sistem akuisisi data, Machine Learning sebagai mekanisme analisis dan prediksi, serta Web Development sebagai media monitoring dan pengelolaan informasi."
  },
  {
    id: "SAMPLE-2",
    label: "DevOps & Web Security",
    category: "Web Infrastructure / DevOps & Security",
    judul: "Optimalisasi Performa dan Keamanan Infrastruktur Aplikasi Web melalui Implementasi Database Indexing, CI/CD Pipeline, dan Zero Trust Security Architecture",
    abstrak: "Penelitian ini bertujuan untuk mengoptimalkan performa, efisiensi deployment, dan keamanan infrastruktur aplikasi web melalui integrasi optimalisasi database, DevOps, dan Cybersecurity. Optimalisasi database dilakukan menggunakan indexing, query optimization, dan connection pooling untuk meningkatkan efisiensi pemrosesan data. Pada aspek DevOps, diterapkan CI/CD pipeline menggunakan Docker dan GitHub Actions untuk mengotomatisasi proses build, testing, dan deployment aplikasi. Sementara itu, aspek Cybersecurity menerapkan pendekatan Zero Trust Security, API authentication, serta vulnerability testing untuk meminimalkan risiko akses tidak sah dan kerentanan sistem. Evaluasi dilakukan berdasarkan query execution time, response time, deployment efficiency, serta hasil pengujian keamanan. Penelitian ini diharapkan menghasilkan infrastruktur aplikasi web yang lebih optimal, otomatis, dan aman."
  },
  {
    id: "SAMPLE-3",
    label: "SPK E-Commerce (AHP-TOPSIS)",
    category: "E-Commerce / Decision Support System / Web Analytics",
    judul: "Pengembangan Platform E-Commerce B2B dengan Sistem Pendukung Keputusan Pemilihan Supplier Menggunakan Integrasi Metode AHP-TOPSIS dan Analisis Transaksi",
    abstrak: "Pertumbuhan transaksi digital menuntut platform E-Commerce tidak hanya berfungsi sebagai media jual beli, tetapi juga mampu membantu pelaku usaha dalam mengambil keputusan pengadaan barang secara objektif dan terukur. Penelitian ini bertujuan untuk merancang dan membangun platform E-Commerce berbasis web yang terintegrasi dengan Sistem Pendukung Keputusan (SPK) untuk mengevaluasi dan merekomendasikan supplier terbaik. Sistem menggabungkan metode Analytical Hierarchy Process (AHP) untuk menentukan bobot prioritas kriteria—seperti harga, kualitas produk, ketepatan pengiriman, dan kapasitas stok—serta metode Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS) untuk melakukan perangkingan alternatif supplier secara akurat. Selain itu, sistem dilengkapi modul analitik transaksi untuk memantau performa penjualan dan riwayat pemenuhan pesanan secara real-time. Pengujian dilakukan melalui validasi konsistensi perhitungan SPK, pengujian fungsionalitas transaksi e-commerce, serta evaluasi performa sistem. Integrasi E-Commerce, Decision Support System, dan Web Analytics ini diharapkan mampu meningkatkan efisiensi rantai pasok dan akurasi pengambilan keputusan bisnis."
  },
  {
    id: "SAMPLE-4",
    label: "Cloud Security & AES-256",
    category: "Cyber Security / Cloud Computing / Network Engineering",
    judul: "Analisis Keamanan Jaringan dan Proteksi Pertukaran Dokumen pada Infrastruktur Cloud Menggunakan Kombinasi Algoritma Enkripsi AES-256, Steganografi LSB, dan Intrusion Detection System",
    abstrak: "Meningkatnya pertukaran data sensitif melalui jaringan publik dan infrastruktur cloud menuntut mekanisme perlindungan berlapis untuk mencegah penyadapan serta kebocoran informasi. Penelitian ini bertujuan untuk merancang dan menganalisis sistem pengamanan transmisi dokumen rahasia dengan mengombinasikan kriptografi, steganografi, dan pemantauan keamanan jaringan. Dokumen terlebih dahulu dienkripsi menggunakan algoritma Advanced Encryption Standard 256-bit (AES-256) untuk menjaga kerahasiaan isi data, kemudian ciphertext yang dihasilkan disisipkan ke dalam media citra digital menggunakan metode Least Significant Bit (LSB) agar keberadaan pesan tidak mudah terdeteksi. Proses transmisi dijalankan di atas server cloud yang dilengkapi Intrusion Detection System (IDS) untuk mendeteksi anomali lalu lintas jaringan secara real-time. Evaluasi dilakukan berdasarkan waktu komputasi enkripsi-dekripsi, kualitas citra stego menggunakan parameter Peak Signal-to-Noise Ratio (PSNR), serta akurasi deteksi serangan jaringan. Penelitian ini memadukan domain Cyber Security, Cloud Computing, dan Network Engineering untuk menghasilkan mekanisme komunikasi data yang aman dan andal."
  },
  {
    id: "SAMPLE-5",
    label: "IoT & 3D Digital Twin",
    category: "Internet of Things / 3D Design / Digital Twin",
    judul: "Rancang Bangun Sistem Monitoring Kualitas Udara Berbasis Internet of Things (IoT) dan Mikrokontroler ESP32 dengan Visualisasi Digital Twin Desain 3D Interaktif",
    abstrak: "Pemantauan kualitas udara pada area industri maupun ruang publik memerlukan penyajian data spasial yang intuitif agar sumber polusi dapat diidentifikasi secara cepat dan akurat. Penelitian ini bertujuan untuk mengembangkan sistem monitoring kualitas udara berbasis Internet of Things (IoT) yang dipadukan dengan visualisasi Digital Twin dalam bentuk lingkungan Desain 3D interaktif berbasis web. Sistem perangkat keras memanfaatkan mikrokontroler ESP32 yang terhubung dengan sensor gas MQ-135 dan sensor partikulat PM2.5 untuk mengakuisisi data konsentrasi polutan secara berkala dan mengirimkannya ke platform cloud melalui protokol MQTT. Data sensor kemudian dipetakan secara real-time ke dalam model aset 3D ruangan yang dirancang menggunakan Blender dan dirender pada browser menggunakan Three.js lengkap dengan indikator gradasi warna dan peringatan dini. Pengujian dilakukan terhadap akurasi pembacaan sensor, latensi pengiriman data IoT, serta performa rendering grafis 3D pada berbagai perangkat. Integrasi IoT, Desain 3D, dan Digital Twin ini diharapkan mempermudah analisis sebaran polusi udara secara visual dan interaktif."
  },
  {
    id: "SAMPLE-6",
    label: "Game 3D & AI Pathfinding",
    category: "Game Development / Artificial Intelligence / 3D Design",
    judul: "Pengembangan Game Simulasi Strategi dan Manajemen Lingkungan 3D Menggunakan Unity Engine dengan Penerapan Finite State Machine (FSM) dan Algoritma Pathfinding A*",
    abstrak: "Pengembangan game simulasi modern membutuhkan perpaduan antara perancangan aset visual yang imersif dan perilaku karakter non-pemain (NPC) yang adaptif untuk meningkatkan pengalaman bermain. Penelitian ini bertujuan untuk merancang dan membangun game simulasi strategi 3D bertema pengelolaan ekosistem dan tata kota menggunakan Unity Engine serta pemodelan aset 3D low-poly. Untuk menciptakan interaksi agen yang dinamis, diterapkan metode Finite State Machine (FSM) dalam mengatur transisi perilaku NPC—seperti mengumpulkan sumber daya, membangun infrastruktur, dan merespons bencana—yang dikombinasikan dengan algoritma Pathfinding A* untuk pencarian rute terpendek secara real-time di atas medan 3D yang dinamis. Evaluasi dilakukan melalui pengujian frame rate (FPS) dan optimasi rendering, akurasi navigasi pathfinding pada berbagai rintangan, serta pengujian kelayakan gameplay kepada pengguna. Penelitian ini mengintegrasikan domain Game Development, Artificial Intelligence, dan Desain 3D dalam satu ekosistem perangkat lunak interaktif."
  }
]

/**
 * Mengambil 4 sampel topik secara acak dari kumpulan benchmark samples
 * @param {number} count Jumlah sampel yang diambil (default 4)
 * @returns {Array} Array berisi objek sampel terpilih
 */
export const getRandomBenchmarkSamples = (count = 4) => {
  const shuffled = [...allBenchmarkSamples].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
