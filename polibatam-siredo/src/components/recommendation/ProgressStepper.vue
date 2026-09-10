<script setup>
defineProps({
  steps: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="stepper-wrap">
    <div v-for="(step, index) in steps" :key="index"
      class="stepper-item"
      :class="{
        'stepper-item--running': step.status === 'running',
        'stepper-item--done': step.status === 'done',
        'stepper-item--error': step.status === 'error'
      }"
      v-show="step.status !== 'idle'"
    >
      
      <!-- Progress Line (top of card when running) -->
      <div v-if="step.status === 'running'" class="stepper-progress-line" :class="`spl-color-${index}`"></div>

      <div class="stepper-header" @click="step.open = !step.open">
        <div class="stepper-header-left">
          <div class="stepper-icon" :class="[
            step.status === 'running' && index === 2 ? 'icon-blue' :
            step.status === 'running' && index === 3 ? 'icon-fuchsia' :
            step.status === 'running' ? 'icon-brand' :
            step.status === 'done' ? 'icon-green' :
            'icon-gray'
          ]">
            <svg v-if="step.status === 'done'" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="step.status === 'error'" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="stepper-texts">
            <h3 class="stepper-title">{{ step.title }}</h3>
            <p class="stepper-desc">{{ step.desc }}</p>
          </div>
        </div>
        
        <div class="stepper-header-right">
          <span class="stepper-badge" :class="[
            step.status === 'running' && index === 2 ? 'badge-blue' :
            step.status === 'running' && index === 3 ? 'badge-fuchsia' :
            step.status === 'running' ? 'badge-brand' :
            step.status === 'error' ? 'badge-red' :
            'badge-gray'
          ]">
            {{ step.status === 'running' ? 'Proses' : step.status === 'error' ? 'Gagal' : 'Selesai' }}
          </span>
          <svg class="stepper-chevron" :class="{ 'stepper-chevron--open': step.open }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div v-if="step.open" class="stepper-body">
        <slot :name="'step-' + index"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stepper-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stepper-item {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.85;
}
.stepper-item:hover {
  opacity: 1;
}

.stepper-item--running {
  border-color: var(--brand-dim);
  box-shadow: 0 4px 12px rgba(91, 75, 219, 0.12);
  transform: scale(1.01);
  opacity: 1;
}

.stepper-item--error {
  border-color: #ef4444;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.12);
  opacity: 1;
}

.stepper-progress-line {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 3px;
  background: #10b981;
  animation: pulse-line 1.5s infinite;
}
.spl-color-2 { background: #3b82f6; }
.spl-color-3 { background: #d946ef; }

@keyframes pulse-line {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

.stepper-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.stepper-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stepper-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 700;
  transition: all 0.3s;
}
.icon-brand { background: var(--brand-light); color: #10b981; animation: pulse-bg 2s infinite; }
.icon-blue { background: #dbeafe; color: #3b82f6; animation: pulse-bg 2s infinite; }
.icon-fuchsia { background: #fae8ff; color: #d946ef; animation: pulse-bg 2s infinite; }
.icon-green { background: #d1fae5; color: #10b981; }
.icon-red { background: var(--red-bg); color: #ef4444; }
.icon-gray { background: #f3f4f6; color: #6b7280; }

@keyframes pulse-bg {
  0% { transform: scale(0.95); }
  50% { transform: scale(1.05); }
  100% { transform: scale(0.95); }
}

.stepper-texts {
  display: flex; flex-direction: column; gap: 0.15rem;
}
.stepper-title {
  font-size: 0.9rem; font-weight: 700; color: #111827; margin: 0;
}
.stepper-desc {
  font-size: 0.78rem; font-weight: 500; color: #374151; margin: 0;
}

.stepper-header-right {
  display: flex; align-items: center; gap: 0.75rem;
}

.stepper-badge {
  font-size: 0.65rem; font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.badge-brand { background: var(--brand-light); color: #10b981; }
.badge-blue { background: #dbeafe; color: #3b82f6; }
.badge-fuchsia { background: #fae8ff; color: #d946ef; }
.badge-red { background: var(--red-bg); color: #ef4444; }
.badge-gray { background: #f3f4f6; color: #6b7280; }

.stepper-chevron {
  width: 16px; height: 16px;
  color: #6b7280;
  transition: transform 0.3s;
}
.stepper-chevron--open {
  transform: rotate(180deg);
}

.stepper-body {
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .stepper-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .stepper-header-right { align-self: flex-end; }
}
</style>


