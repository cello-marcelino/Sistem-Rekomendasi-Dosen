<template>
  <svg :class="customClass" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 12M15 17h4a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05A2.5 2.5 0 1 0 15 12m-6 5h6a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1Zm3-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
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
