<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

    <!-- ── Sidebar ── -->
    <aside class="w-72 shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5">
        <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#3B82F6"/>
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.6"/>
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.6"/>
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.3"/>
          </svg>
        </div>
        <span class="text-base font-semibold text-gray-900 dark:text-white">proyekto</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-1 flex flex-col gap-0.5">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="isActive(item.path)
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'"
        >
          <!-- Icon slot -->
          <span class="w-4 h-4 flex items-center justify-center shrink-0" v-html="item.icon" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- User + actions -->
      <div class="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <!-- Avatar + name -->
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
          {{ userInitials }}
        </div>
        <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{{ displayName }}</span>

        <!-- Theme toggle -->
        <ThemeToggle />

        <!-- Sign out -->
        <button
          @click="handleSignOut"
          title="Sign out"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>

    </aside>

    <!-- ── Main content ── -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

async function handleSignOut() {
  await authStore.signOut()
  router.push('/login')
}

// Nav items with inline SVG icons
const navItems = [
  {
    path: '/projects',
    label: 'Projects',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1"/>
      <rect x="9" y="1" width="6" height="6" rx="1"/>
      <rect x="1" y="9" width="6" height="6" rx="1"/>
      <rect x="9" y="9" width="6" height="6" rx="1"/>
    </svg>`,
  },
  {
    path: '/tasks',
    label: 'Tasks',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <line x1="3" y1="4" x2="13" y2="4"/>
      <line x1="3" y1="8" x2="13" y2="8"/>
      <line x1="3" y1="12" x2="10" y2="12"/>
    </svg>`,
  },
  {
    path: '/notes',
    label: 'Notes',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <rect x="2" y="1" width="12" height="14" rx="1.5"/>
      <line x1="5" y1="5" x2="11" y2="5"/>
      <line x1="5" y1="8" x2="11" y2="8"/>
      <line x1="5" y1="11" x2="8" y2="11"/>
    </svg>`,
  },
  {
    path: '/tags',
    label: 'Tags',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 8c0-2 1.5-4 4-4h4c2.5 0 4 2 4 4s-1.5 4-4 4H6c-2.5 0-4-2-4-4z"/>
      <circle cx="5.5" cy="8" r="1" fill="currentColor" stroke="none"/>
    </svg>`,
  },
]

// Highlight the nav item whose path matches the current route
function isActive(path) {
  return route.path.startsWith(path)
}

// Build display name and initials from the Supabase user object
const displayName = computed(() => {
  const user = authStore.user
  if (!user) return ''
  return user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email?.split('@')[0]
    || 'User'
})

const userInitials = computed(() => {
  const name = displayName.value
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})
</script>
