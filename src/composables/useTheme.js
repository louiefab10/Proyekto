import { ref, watch } from 'vue'

// Module-level ref so all components share the same state
const isDark = ref(false)

function applyTheme() {
    if (isDark.value) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Sync the DOM whenever isDark changes
watch(isDark, applyTheme)

export function useTheme() {
    // Read saved preference on first call, fall back to system preference
    function initTheme() {
        const stored = localStorage.getItem('theme')
        if (stored) {
            isDark.value = stored === 'dark'
        } else {
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        // applyTheme is called by the watcher, but we also call it directly
        // here to avoid a flash of unstyled content on first load
        applyTheme()
    }

    function toggleTheme() {
        isDark.value = !isDark.value
    }

    return { isDark, initTheme, toggleTheme }
}
