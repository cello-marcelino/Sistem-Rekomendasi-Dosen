<template>
  <div class="max-w-[800px] mx-auto py-10 px-6 animate-in">
    <!-- Header -->
    <div class="border-b border-border pb-6 mb-8">
      <h1 class="text-[2rem] font-bold text-text-primary tracking-tight flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quickstart Developer Guide
      </h1>
      <p class="mt-2 text-text-secondary">
        Panduan cepat untuk mengintegrasikan SiReDo API ke dalam aplikasi Anda.
      </p>
    </div>

    <div class="space-y-8">
      <!-- Step 1 -->
      <div id="step-1" class="bg-bg-base rounded-[14px] shadow-sm border border-border p-6 sm:p-8">
        <h2 class="text-[1.25rem] font-bold text-text-primary mb-4 flex items-center gap-3">
          <span class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-light text-brand text-[0.9rem] font-bold">1</span>
          Dapatkan API Key
        </h2>
        <p class="text-text-secondary mb-5 leading-relaxed">
          Untuk menggunakan endpoint yang dilindungi, Anda memerlukan API Key. Silakan mendaftar sebagai developer kampus untuk mendapatkan akses.
        </p>
        <router-link to="/docs/api-key" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-[6px] font-medium transition-colors shadow-sm">
          Daftar & Dapatkan API Key
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </router-link>
      </div>

      <!-- Step 2 -->
      <div id="step-2" class="bg-bg-base rounded-[14px] shadow-sm border border-border p-6 sm:p-8">
        <h2 class="text-[1.25rem] font-bold text-text-primary mb-4 flex items-center gap-3">
          <span class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-light text-brand text-[0.9rem] font-bold">2</span>
          Lakukan Request API
        </h2>
        <p class="text-text-secondary mb-4 leading-relaxed">
          Sertakan API Key yang Anda dapatkan di dalam header <code class="font-mono text-[0.8rem] bg-bg-muted px-1.5 py-0.5 rounded text-text-primary border border-border">X-API-Key</code> pada setiap HTTP Request.
        </p>
        <div class="bg-[#0f0f14] rounded-[10px] overflow-hidden border border-[#1e1e2e]">
          <div class="bg-[#1e1e2e] px-4 py-2 flex items-center justify-between">
            <span class="text-xs font-mono text-gray-400">cURL Example</span>
          </div>
          <pre class="p-4 text-sm text-[#e4e4f0] font-mono overflow-x-auto"><code>curl -X POST http://localhost:5000/api/recommendations/single \
  -H <span class="text-[#a6e3a1]">"Content-Type: application/json"</span> \
  -H <span class="text-[#a6e3a1]">"X-API-Key: YOUR_API_KEY_HERE"</span> \
  -d <span class="text-[#fab387]">'{
    "judul": "Analisis Sentimen menggunakan NLP",
    "abstrak": "Penelitian ini menggunakan arsitektur Transformer..."
  }'</span></code></pre>
        </div>
      </div>

      <!-- Step 3 -->
      <div id="step-3" class="bg-bg-base rounded-[14px] shadow-sm border border-border p-6 sm:p-8">
        <h2 class="text-[1.25rem] font-bold text-text-primary mb-4 flex items-center gap-3">
          <span class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-light text-brand text-[0.9rem] font-bold">3</span>
          Gunakan di Aplikasi Frontend (Vue/React)
        </h2>
        <p class="text-text-secondary mb-4 leading-relaxed">
          Jika Anda memanggil API dari framework frontend seperti Vue atau React, pastikan Anda menggunakan library <i>HTTP Client</i> seperti Axios dan mengkonfigurasi <i>Interceptor</i>.
        </p>
        <div class="bg-[#0f0f14] rounded-[10px] overflow-hidden border border-[#1e1e2e]">
          <div class="bg-[#1e1e2e] px-4 py-2 flex items-center justify-between">
            <span class="text-xs font-mono text-gray-400">axios.js (Vue 3 / React)</span>
          </div>
          <pre class="p-4 text-sm text-[#e4e4f0] font-mono overflow-x-auto"><code><span class="text-[#cba6f7]">import</span> axios <span class="text-[#cba6f7]">from</span> <span class="text-[#a6e3a1]">'axios'</span>;

<span class="text-[#cba6f7]">const</span> api = axios.create({
  baseURL: <span class="text-[#a6e3a1]">'http://localhost:5000/api'</span>,
  headers: {
    <span class="text-[#a6e3a1]">'X-API-Key'</span>: import.meta.env.VITE_API_KEY,
    <span class="text-[#a6e3a1]">'Content-Type'</span>: <span class="text-[#a6e3a1]">'application/json'</span>
  }
});

<span class="text-[#cba6f7]">export default</span> api;</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>
