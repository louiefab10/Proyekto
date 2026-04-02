<template>
  <!-- RouterView renders whichever view matches the current URL -->
  <RouterView />
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