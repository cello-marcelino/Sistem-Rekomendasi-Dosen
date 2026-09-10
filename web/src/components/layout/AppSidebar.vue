<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServerStatusBadge from './ServerStatusBadge.vue'

const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)

// State dropdown dokumentasi
const docsDropdownOpen = ref(true)
const activeAnchor = ref('')

// Daftar menu dokumentasi berurutan sesuai instruksi dengan sub-sections
const docItems = [
  {
    name: 'Quickstart',
    path: '/docs/quickstart',
    sections: []
  },
  {
    name: 'Dokumentasi API',
    path: '/docs/api',
    sections: [
      { id: 'overview', label: 'Overview' },
      { id: 'auth', label: 'Autentikasi' },
      { id: 'single', label: 'POST /rekomendasi/single' },
      { id: 'batch', label: 'POST /rekomendasi/batch' },
      { id: 'batch-upload', label: 'POST /batch/upload' },
      { id: 'config-get', label: 'GET & PATCH /config' },
      { id: 'status', label: 'GET /status' },
      { id: 'errors', label: 'Error Handling' },
    ]
  },
  {
    name: 'Pipeline NLP',
    path: '/docs/pipeline',
    sections: [
      { id: 'arsitektur', label: 'Arsitektur Sistem' },
      { id: 'preprocessing', label: '1. Preprocessing' },
      { id: 'ekspansi', label: '2. Ekspansi Sinonim' },
      { id: 'bm25', label: '3. BM25 Scoring' },
      { id: 'sbert', label: '4. SBERT Semantic' },
      { id: 'hybrid', label: '5. Hybrid Ranking' },
      { id: 'xai', label: '6. Explainability (XAI)' },
      { id: 'skenario', label: 'Skenario Mitigasi' },
    ]
  },
  {
    name: 'Caching & Indexing Method',
    path: '/docs/caching',
    sections: [
      { id: 'masalah', label: '1. Permasalahan' },
      { id: 'alasan', label: '2. Alasan Metode' },
      { id: 'solusi', label: '3. Solusi Dihasilkan' },
      { id: 'efisiensi', label: '4. Ringkasan Dampak' },
    ]
  },
  {
    name: 'API Key',
    path: '/docs/api-key',
    sections: []
  },
]

// Cek apakah route saat ini ada di dalam grup dokumentasi
const isDocsActive = computed(() => {
  return docItems.some(item => route.path === item.path) || route.path.startsWith('/docs')
})

let observer = null

const setupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }

  const currentDoc = docItems.find(item => item.path === route.path)
  if (!currentDoc || !currentDoc.sections || currentDoc.sections.length === 0) {
    activeAnchor.value = ''
    return
  }

  // Set default initial anchor
  if (window.location.hash) {
    activeAnchor.value = window.location.hash.replace('#', '')
  } else if (currentDoc.sections.length > 0) {
    activeAnchor.value = currentDoc.sections[0].id
  }

  observer = new IntersectionObserver((entries) => {
    const visibleEntries = entries.filter(e => e.isIntersecting)
    if (visibleEntries.length > 0) {
      activeAnchor.value = visibleEntries[0].target.id
    }
  }, {
    rootMargin: '-10% 0px -70% 0px'
  })

  currentDoc.sections.forEach(sec => {
    const el = document.getElementById(sec.id)
    if (el) observer.observe(el)
  })
}

// Auto buka dropdown jika route aktif berada di dokumentasi
watch(
  () => route.path,
  () => {
    if (isDocsActive.value) {
      docsDropdownOpen.value = true
    }
    setTimeout(() => {
      setupObserver()
    }, 150)
  },
  { immediate: true }
)

onUnmounted(() => {
  if (observer) observer.disconnect()
})

const navigateToSection = (itemPath, sectionId) => {
  mobileOpen.value = false
  activeAnchor.value = sectionId

  if (route.path === itemPath) {
    const el = document.getElementById(sectionId)
    if (el) {
      const yOffset = -70
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  } else {
    router.push({ path: itemPath, hash: `#${sectionId}` })
  }
}
</script>

<template>
  <!-- Mobile overlay -->
  <div v-if="mobileOpen" class="mobile-overlay" @click="mobileOpen = false" />

  <!-- Sidebar Utama (Minimal Text-Only Nested Dropdown) -->
  <aside class="sidebar" :class="{ 'mobile-open': mobileOpen }">
    <!-- Brand / Header -->
    <div class="sidebar-header">
      <router-link to="/" class="brand-link" @click="mobileOpen = false">
        <span class="brand-title">SiReDo <span class="brand-sub">API</span></span>
        <span class="brand-badge">v3.2</span>
      </router-link>
    </div>

    <!-- Navigation List (Text-Only Minimalist) -->
    <nav class="sidebar-nav">
      <!-- Section: Navigasi Utama -->
      <div class="nav-group">
        <div class="nav-group-label">Navigasi</div>
        <router-link
          to="/"
          class="nav-item"
          :class="{ active: route.path === '/' }"
          @click="mobileOpen = false"
        >
          <span class="nav-item-text">Beranda</span>
        </router-link>
      </div>

      <!-- Section: Dokumentasi (Nested Dropdown) -->
      <div class="nav-group">
        <!-- Dropdown Parent Header -->
        <button
          type="button"
          class="nav-dropdown-toggle"
          :class="{ 'nav-dropdown-toggle--active': isDocsActive }"
          @click="docsDropdownOpen = !docsDropdownOpen"
        >
          <span class="nav-group-label mb-0">Dokumentasi</span>
          <span class="dropdown-caret" :class="{ 'dropdown-caret--open': docsDropdownOpen }">
            {{ docsDropdownOpen ? '▾' : '▸' }}
          </span>
        </button>

        <!-- Nested Dropdown Menu Items (Teks Saja, Urutan Sesuai Spesifikasi) -->
        <div v-show="docsDropdownOpen" class="nav-nested-list">
          <div
            v-for="item in docItems"
            :key="item.path"
            class="nav-group-item-wrap"
          >
            <!-- Level 1 Item Link -->
            <router-link
              :to="item.path"
              class="nav-nested-item"
              :class="{ active: route.path === item.path }"
              @click="mobileOpen = false"
            >
              <span class="nav-item-text">{{ item.name }}</span>
            </router-link>

            <!-- Level 2 Sub-Sections (Teks Saja Minimalis, Muncul Saat Halaman Aktif) -->
            <div
              v-if="route.path === item.path && item.sections && item.sections.length > 0"
              class="nav-sub-list"
            >
              <button
                v-for="sec in item.sections"
                :key="sec.id"
                type="button"
                class="nav-sub-item"
                :class="{ active: activeAnchor === sec.id }"
                @click="navigateToSection(item.path, sec.id)"
              >
                <span class="nav-sub-text">{{ sec.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Footer Status -->
    <div class="sidebar-footer">
      <ServerStatusBadge />
    </div>
  </aside>

  <!-- Mobile toggle button -->
  <button class="mobile-toggle" @click="mobileOpen = !mobileOpen">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: var(--sidebar-w);
  background: var(--bg-subtle);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 100;
  transition: transform 0.25s ease;
}

/* Brand / Header */
.sidebar-header {
  padding: 1.25rem 1.1rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-base);
}
.brand-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
}
.brand-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}
.brand-sub {
  color: var(--brand);
  font-weight: 700;
}
.brand-badge {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--brand);
  background: var(--brand-light);
  border: 1px solid var(--brand-border);
  padding: 2px 7px;
  border-radius: 99px;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 1.25rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-group {
  display: flex;
  flex-direction: column;
}

.nav-group-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0 0.5rem;
  margin-bottom: 0.4rem;
}
.mb-0 {
  margin-bottom: 0 !important;
  padding: 0 !important;
}

/* Standalone Nav Item (Text Only) */
.nav-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 0.12s, color 0.12s;
  border-left: 2.5px solid transparent;
}
.nav-item:hover {
  background: var(--bg-muted);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--brand-light);
  color: var(--brand);
  font-weight: 600;
  border-left-color: var(--brand);
}

/* Dropdown Parent Toggle Header */
.nav-dropdown-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0.4rem 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}
.nav-dropdown-toggle:hover {
  background: var(--bg-muted);
}
.nav-dropdown-toggle--active .nav-group-label {
  color: var(--brand);
}

.dropdown-caret {
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: color 0.15s;
  user-select: none;
}
.nav-dropdown-toggle:hover .dropdown-caret,
.dropdown-caret--open {
  color: var(--brand);
}

/* Nested Sub-items (Dropdown Children) */
.nav-nested-list {
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1.5px solid var(--border);
  margin-top: 0.35rem;
  gap: 2px;
}

.nav-nested-item {
  display: flex;
  align-items: center;
  padding: 0.42rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.825rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 0.12s, color 0.12s, border-left-color 0.12s;
  border-left: 2px solid transparent;
  line-height: 1.35;
}
.nav-nested-item:hover {
  background: var(--bg-muted);
  color: var(--text-primary);
}
.nav-nested-item.active {
  background: var(--brand-light);
  color: var(--brand);
  font-weight: 600;
  border-left-color: var(--brand);
}

.nav-group-item-wrap {
  display: flex;
  flex-direction: column;
}

/* Level 2 Sub-Sections (Teks Saja Minimalis) */
.nav-sub-list {
  display: flex;
  flex-direction: column;
  margin-left: 0.65rem;
  padding-left: 0.55rem;
  border-left: 1.5px solid var(--border);
  margin-top: 0.15rem;
  margin-bottom: 0.35rem;
  gap: 1px;
}

.nav-sub-item {
  display: flex;
  align-items: center;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0.28rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.76rem;
  color: var(--text-muted);
  cursor: pointer;
  text-align: left;
  line-height: 1.35;
  transition: all 0.12s ease;
  border-left: 2px solid transparent;
}

.nav-sub-item:hover {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.nav-sub-item.active {
  background: var(--brand-light);
  color: var(--brand);
  font-weight: 600;
  border-left-color: var(--brand);
}

.nav-sub-text {
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item-text {
  letter-spacing: -0.01em;
}

/* Footer */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border);
  background: var(--bg-base);
}

/* Mobile */
.mobile-toggle {
  display: none;
  position: fixed;
  bottom: 1.25rem; right: 1.25rem;
  z-index: 200;
  width: 44px; height: 44px;
  background: var(--brand);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 16px oklch(49.1% 0.27 292.581 / 0.3);
  align-items: center; justify-content: center;
}
.mobile-toggle svg { width: 20px; height: 20px; }

.mobile-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 99;
}

@media (max-width: 900px) {
  .mobile-toggle { display: flex; }
  .mobile-overlay { display: block; }
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>
