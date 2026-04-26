import { ref, onMounted, onUnmounted } from 'vue'

export function useBreakpoint(breakpoint = 768) {
    const isMobile = ref(window.innerWidth < breakpoint)

    function update() {
        isMobile.value = window.innerWidth < breakpoint
    }

    onMounted(() => window.addEventListener('resize', update))
    onUnmounted(() => window.removeEventListener('resize', update))

    return { isMobile }
}