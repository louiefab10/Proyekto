<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="flex items-center gap-3 mb-10">
        <div class="w-8 h-8 rounded-lg bg-blue-200 dark:bg-blue-950 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#3B82F6"/>
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.6"/>
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.6"/>
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.3"/>
          </svg>
        </div>
        <span class="text-base font-medium text-gray-900 dark:text-white">proyekto</span>
      </div>

      <!-- Heading -->
      <div class="mb-8">
        <h1 class="text-2xl font-medium text-gray-900 dark:text-white mb-1">Set new password</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Enter and confirm your new password below.</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleUpdatePassword" class="flex flex-col gap-3">
        <input
          v-model="password"
          type="password"
          placeholder="New password"
          autocomplete="new-password"
          :disabled="loading"
          class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          autocomplete="new-password"
          :disabled="loading"
          class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <!-- Inline error -->
        <p v-if="formError" class="text-xs text-red-400">{{ formError }}</p>

        <button
          type="submit"
          :disabled="loading || !password || !confirmPassword"
          class="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Updating...' : 'Update password' }}
        </button>
      </form>

      <p class="mt-4 text-sm text-center text-gray-400 dark:text-gray-500">
        <RouterLink to="/login" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline transition-colors">
          Back to sign in
        </RouterLink>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const formError = ref('')
const loading = ref(false)

async function handleUpdatePassword() {
  // Client-side validation
  if (password.value.length < 6) {
    formError.value = 'Password must be at least 6 characters'
    return
  }
  if (password.value !== confirmPassword.value) {
    formError.value = 'Passwords do not match'
    return
  }

  formError.value = ''
  loading.value = true
  const { error } = await authStore.updatePassword(password.value)
  loading.value = false

  if (error) {
    formError.value = error.message
    return
  }

  // Success — Supabase has updated the password, redirect to app
  router.push('/projects')
}
</script>
