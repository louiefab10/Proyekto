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

// Create the Vue app instance
const app = createApp(App)

// Create a Pinia instance
const pinia = createPinia()

// Register Pinia with the app
app.use(pinia)

// Register Vue Router with the app
app.use(router)

// Mount the app to the #app div in index.html
// This is the entry point that makes everything visible in the browser
app.mount('#app')