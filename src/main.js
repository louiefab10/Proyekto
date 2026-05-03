// Import the createApp function to initialize the Vue app
import { createApp } from 'vue'

// Import the root App component
import App from './App.vue'

// Import the router we set up earlier
import router from './router'

// Import Pinia for global state management
import { createPinia } from 'pinia'

// Import our global CSS file which includes Tailwind
import './style.css'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'


// Prevent pinch-to-zoom on iOS Safari (ignores user-scalable=no since iOS 10)
document.addEventListener('gesturestart', e => e.preventDefault())
document.addEventListener('gesturechange', e => e.preventDefault())

// Apply dark mode class based on system preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
}

// Listen for system dark mode changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    document.documentElement.classList.toggle('dark', e.matches)
})

// Create the Vue app instance
const app = createApp(App)

// Create a Pinia instance
const pinia = createPinia()

// Register Pinia with the app
app.use(pinia)

// Register Vue Router with the app
app.use(router)

app.use(PrimeVue, { theme: { preset: Aura, options: { darkModeSelector: '.dark' } } })

// Mount the app to the #app div in index.html
// This is the entry point that makes everything visible in the browser
app.mount('#app')