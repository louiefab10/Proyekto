<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showBanner"
        class="fixed bottom-[4.5rem] md:bottom-4 left-3 right-3 md:left-auto md:right-4 md:w-80 z-50"
      >
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-4">

          <div class="flex items-start gap-3">
            <!-- App icon -->
            <img src="/pwa-64x64.png" alt="Proyekto" class="w-12 h-12 rounded-xl shrink-0" />

            <!-- Text -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">Install Proyekto</p>

              <!-- Android/Chrome -->
              <p v-if="!isIos" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Add to your home screen for the best experience.
              </p>

              <!-- iOS -->
              <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Tap
                <svg class="inline w-3.5 h-3.5 mx-0.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                then <strong class="text-gray-700 dark:text-gray-300">"Add to Home Screen"</strong>
              </p>
            </div>

            <!-- Dismiss -->
            <button
              @click="dismiss"
              class="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors -mt-0.5"
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="3" y1="3" x2="13" y2="13"/>
                <line x1="13" y1="3" x2="3" y2="13"/>
              </svg>
            </button>
          </div>

          <!-- Install button (Android/Chrome only) -->
          <button
            v-if="!isIos"
            @click="install"
            class="mt-3 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
          >
            Install
          </button>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const DISMISSED_KEY = 'pwa-install-dismissed'

const showBanner    = ref(false)
const isIos         = ref(false)
const deferredPrompt = ref(null)

onMounted(() => {
  // Don't show if already installed (running in standalone mode)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  if (isStandalone) return

  // Don't show if previously dismissed
  if (localStorage.getItem(DISMISSED_KEY)) return

  // Detect iOS Safari
  isIos.value = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream

  if (isIos.value) {
    // iOS has no install event — show the manual instructions banner
    showBanner.value = true
    return
  }

  // Android/Chrome — wait for the browser's install event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showBanner.value = true
  })
})

async function install() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') showBanner.value = false
  deferredPrompt.value = null
}

function dismiss() {
  showBanner.value = false
  localStorage.setItem(DISMISSED_KEY, '1')
}
</script>
