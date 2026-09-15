<script setup>
defineProps({
  steps: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-for="(step, index) in steps" :key="index"
      class="border border-gray-300 bg-white transition-opacity duration-300 relative"
      :class="{
        'border-teal-600 opacity-100 ring-1 ring-teal-600': step.status === 'running',
        'border-gray-200 opacity-70': step.status === 'done',
        'border-red-600 opacity-100': step.status === 'error'
      }"
      v-show="step.status !== 'idle'"
    >
      
      <!-- Progress Line (top of card when running) -->
      <div v-if="step.status === 'running'" class="absolute top-0 left-0 w-full h-[2px] bg-teal-600 animate-pulse"></div>

      <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" @click="step.open = !step.open">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 border border-gray-300 flex items-center justify-center font-mono font-bold text-sm bg-gray-50"
               :class="{
                 'border-teal-600 text-teal-600 bg-teal-50': step.status === 'running',
                 'border-gray-300 text-gray-500 bg-gray-50': step.status === 'done',
                 'border-red-600 text-red-600 bg-red-50': step.status === 'error'
               }">
            <svg v-if="step.status === 'done'" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="step.status === 'error'" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="flex flex-col">
            <h3 class="font-bold text-gray-900 text-sm mb-0.5">{{ step.title }}</h3>
            <p class="text-xs text-gray-500 font-mono tracking-tight">{{ step.desc }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 border"
            :class="[
              step.status === 'running' ? 'border-teal-200 text-teal-700 bg-teal-50' :
              step.status === 'error' ? 'border-red-200 text-red-700 bg-red-50' :
              'border-gray-200 text-gray-500 bg-gray-50'
            ]">
            {{ step.status === 'running' ? 'PROSES' : step.status === 'error' ? 'GAGAL' : 'SELESAI' }}
          </span>
          <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': step.open }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div v-if="step.open" class="p-4 border-t border-gray-200 bg-white">
        <slot :name="'step-' + index"></slot>
      </div>
    </div>
  </div>
</template>
