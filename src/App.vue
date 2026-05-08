<template>
  <div v-if="authStore.loading" class="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-3">
    <div class="w-14 h-14 rounded-[14px] bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
      <svg width="30" height="30" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#3B82F6"/>
        <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.6"/>
        <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.6"/>
        <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.3"/>
      </svg>
    </div>
    <span class="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">proyekto</span>
    <div class="flex gap-1.5 mt-1">
      <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style="animation-delay: 0ms" />
      <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style="animation-delay: 150ms" />
      <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style="animation-delay: 300ms" />
    </div>
  </div>
  <RouterView v-else />
</template>

<script setup>
// Import RouterView to render the current route's component
import { RouterView } from 'vue-router'

// Import the auth store
import { useAuthStore } from './stores/authStore'

// Import the theme composable
import { useTheme } from './composables/useTheme'

// Import onMounted — runs code after the component is mounted to the DOM
import { onMounted } from 'vue'

// Get the auth store instance
const authStore = useAuthStore()

// Get the theme initializer
const { initTheme } = useTheme()

// When the app first loads, initialize auth state and apply saved theme
onMounted(() => {
  authStore.init()
  initTheme()
})
</script>