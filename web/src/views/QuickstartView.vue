<template>
  <div class="max-w-4xl space-y-8 animate-fade-in pb-12">
    <!-- Header -->
    <div class="border-b border-gray-200 dark:border-gray-800 pb-5">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quickstart Developer Guide
      </h1>
      <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Panduan cepat untuk mengintegrasikan SiReDo API ke dalam aplikasi Anda.
      </p>
    </div>

    <!-- Step 1 -->
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-bold">1</span>
        Dapatkan API Key
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Untuk menggunakan endpoint yang dilindungi, Anda memerlukan API Key. Silakan mendaftar sebagai developer kampus.
      </p>
      <router-link to="/register" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
        Daftar & Dapatkan API Key
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </router-link>
    </div>

    <!-- Step 2 -->
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-bold">2</span>
        Konfigurasi Environment
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Simpan API Key Anda dengan aman di file <code>.env</code> aplikasi Anda. Jangan pernah mengekspos API Key ini di kode frontend publik.
      </p>
      <div class="relative group">
        <pre class="bg-gray-50 dark:bg-gray-950 rounded-lg p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto border border-gray-200 dark:border-gray-800">
# .env
SIREDO_API_URL=http://localhost:5000/api
SIREDO_API_KEY=srd_live_your_api_key_here</pre>
      </div>
    </div>

    <!-- Step 3 -->
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-bold">3</span>
        Kirim Request Pertama
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Sertakan API Key di header <code>X-API-Key</code> pada setiap request.
      </p>
      
      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Menggunakan cURL</h3>
          <pre class="bg-gray-50 dark:bg-gray-950 rounded-lg p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto border border-gray-200 dark:border-gray-800">
curl -X GET "http://localhost:5000/api/dosen" \
     -H "X-API-Key: srd_live_your_api_key_here"</pre>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Menggunakan JavaScript (Axios)</h3>
          <pre class="bg-gray-50 dark:bg-gray-950 rounded-lg p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto border border-gray-200 dark:border-gray-800">
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SIREDO_API_URL,
  headers: {
    'X-API-Key': import.meta.env.VITE_SIREDO_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Mengambil daftar dosen
const response = await api.get('/dosen');</pre>
        </div>
      </div>
    </div>
  </div>
</template>
