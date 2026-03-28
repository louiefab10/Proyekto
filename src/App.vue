<template>
  <!-- RouterView renders whichever view matches the current URL -->
  <RouterView />
</template>

<script setup>
// Import RouterView to render the current route's component
import { RouterView } from 'vue-router'

// Import the auth store
import { useAuthStore } from './stores/authStore'

// Import onMounted — runs code after the component is mounted to the DOM
import { onMounted } from 'vue'

// Get the auth store instance
const authStore = useAuthStore()

// When the app first loads, initialize the auth state
// This checks if the user is already logged in from a previous session
onMounted(() => {
  authStore.init()
})
</script>