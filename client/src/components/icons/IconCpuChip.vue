<template>
  <svg :class="customClass" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9h6v6H9V9Z"/>
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10V9a1 1 0 0 1 1-1h1m14 2V9a1 1 0 0 0-1-1h-1M4 14v1a1 1 0 0 0 1 1h1m14-2v1a1 1 0 0 1-1 1h-1M10 4h1a1 1 0 0 1 1 1v1m2-2h1a1 1 0 0 1 1 1v1M10 20h1a1 1 0 0 0 1-1v-1m2 2h1a1 1 0 0 0 1-1v-1"/>
  </svg>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: 'w-5 h-5'
  }
})
</script>
