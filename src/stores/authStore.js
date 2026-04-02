// Import the defineStore function from Pinia
import { defineStore } from 'pinia'

// Import ref for reactive variables
import { ref } from 'vue'

// Import our Supabase client
import { supabase } from '../lib/supabase'

// Define and export the auth store
// 'auth' is the unique ID for this store
export const useAuthStore = defineStore('auth', () => {

    // Reactive variable that holds the current user
    // null means no user is logged in
    const user = ref(null)

    // Reactive variable that tracks if auth is still being checked
    // true initially because we don't know the auth state yet on page load
    const loading = ref(true)

    // Function to initialize the auth state when the app loads
    async function init() {
        // Get the current session from Supabase
        const { data: { session } } = await supabase.auth.getSession()

        // Set the user from the session if one exists
        user.value = session?.user ?? null

        // Mark loading as done
        loading.value = false

        // Listen for any auth changes (login, logout, token refresh)
        // This keeps the user state in sync automatically
        supabase.auth.onAuthStateChange((_event, session) => {
            user.value = session?.user ?? null
        })
    }

    // Function to sign in with Google
    async function signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Redirect back to the app after Google login
                redirectTo: `${window.location.origin}/projects`
            }
        })
        if (error) console.error('Google sign in error:', error)
    }

    // Function to sign in with email and password
    async function signInWithEmail(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error }
    }

    // Function to create a new account with email and password
    async function signUpWithEmail(email, password) {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Redirect to projects after confirming email
                emailRedirectTo: `${window.location.origin}/projects`
            }
        })
        return { error }
    }

    // Function to send a password reset email
    async function sendPasswordReset(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // Redirect to the reset password page after clicking the link
            redirectTo: `${window.location.origin}/reset-password`
        })
        return { error }
    }

    // Function to update the user's password (used on the reset password page)
    async function updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        return { error }
    }

    // Function to sign out
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) console.error('Sign out error:', error)

        // Clear the user from the store
        user.value = null
    }

    // Expose these so components can use them
    return { user, loading, init, signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, updatePassword, signOut }
})