<template>
  <div class="min-h-screen md:h-screen flex flex-col md:flex-row bg-blue-100 dark:bg-gray-950 relative">

    <!-- Theme toggle — top-right of the login page -->
    <div class="absolute top-4 right-4 z-10">
      <ThemeToggle />
    </div>

    <!-- Left panel: branding -->
    <div class="flex flex-col gap-8 md:gap-0 md:w-1/2 md:justify-between bg-blue-100 dark:bg-gray-950 md:bg-white md:dark:bg-gray-900 p-8 md:p-12">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#3B82F6"/>
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.6"/>
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.6"/>
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#3B82F6" opacity="0.3"/>
          </svg>
        </div>
        <span class="text-base font-medium text-gray-900 dark:text-white">proyekto</span>
      </div>

      <!-- Tagline -->
      <div>
        <h1 class="text-3xl font-medium text-gray-900 dark:text-white leading-snug mb-4">
          Your projects,<br/>always in sync.
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Track tasks, take notes, and stay organized. Whenever, wherever.
        </p>
      </div>

      <!-- Feature highlights -->
      <div class="flex flex-col gap-3">
        <div v-for="feature in features" :key="feature" class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3.5" stroke="#22C55E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ feature }}</span>
        </div>
      </div>
    </div>

    <!-- Mobile divider -->
    <div class="md:hidden h-px bg-gray-200 dark:bg-gray-800 mx-8" />

    <!-- Right panel: auth forms -->
    <div class="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
      <div class="max-w-sm mx-auto w-full">

        <!-- ── VIEW: login ── -->
        <template v-if="view === 'login'">
          <div class="mb-8">
            <h2 class="text-2xl font-medium text-gray-900 dark:text-white mb-1">Welcome back</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Sign in to continue to proyekto</p>
          </div>

          <!-- Google button -->
          <button
            @click="handleGoogleSignIn"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {{ loading ? 'Signing in...' : 'Continue with Google' }}
          </button>

          <!-- OR divider -->
          <div class="flex items-center gap-3 my-6">
            <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
            <span class="text-xs text-gray-400 dark:text-gray-600">or</span>
            <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
          </div>

          <!-- Email + password form -->
          <form @submit.prevent="handleSignIn" class="flex flex-col gap-3">
            <input
              v-model="email"
              type="email"
              placeholder="Email address"
              autocomplete="email"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              autocomplete="current-password"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <!-- Inline error -->
            <p v-if="formError" class="text-xs text-red-400">{{ formError }}</p>

            <button
              type="submit"
              :disabled="loading || !email.trim() || !password"
              class="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <!-- Footer links -->
          <div class="mt-4 flex items-center justify-between">
            <button @click="view = 'signup'" class="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              Create an account
            </button>
            <button @click="view = 'forgot-password'" class="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              Forgot password?
            </button>
          </div>
        </template>

        <!-- ── VIEW: signup ── -->
        <template v-else-if="view === 'signup'">
          <div class="mb-8">
            <h2 class="text-2xl font-medium text-gray-900 dark:text-white mb-1">Create an account</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Join proyekto and start organizing</p>
          </div>

          <form @submit.prevent="handleSignUp" class="flex flex-col gap-3">
            <input
              v-model="email"
              type="email"
              placeholder="Email address"
              autocomplete="email"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              autocomplete="new-password"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm password"
              autocomplete="new-password"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <!-- Inline error -->
            <p v-if="formError" class="text-xs text-red-400">{{ formError }}</p>

            <button
              type="submit"
              :disabled="loading || !email.trim() || !password || !confirmPassword"
              class="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </form>

          <p class="mt-4 text-sm text-center text-gray-400 dark:text-gray-500">
            Already have an account?
            <button @click="view = 'login'" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline transition-colors">
              Sign in
            </button>
          </p>
        </template>

        <!-- ── VIEW: forgot-password ── -->
        <template v-else-if="view === 'forgot-password'">
          <div class="mb-8">
            <h2 class="text-2xl font-medium text-gray-900 dark:text-white mb-1">Reset your password</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Enter your email and we'll send you a reset link.</p>
          </div>

          <form @submit.prevent="handleForgotPassword" class="flex flex-col gap-3">
            <input
              v-model="email"
              type="email"
              placeholder="Email address"
              autocomplete="email"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <!-- Inline error -->
            <p v-if="formError" class="text-xs text-red-400">{{ formError }}</p>

            <button
              type="submit"
              :disabled="loading || !email.trim()"
              class="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Sending...' : 'Send reset link' }}
            </button>
          </form>

          <p class="mt-4 text-sm text-center text-gray-400 dark:text-gray-500">
            <button @click="view = 'login'" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white underline transition-colors">
              Back to sign in
            </button>
          </p>
        </template>

        <!-- ── VIEW: check-email ── -->
        <template v-else-if="view === 'check-email'">
          <!-- Envelope icon -->
          <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>

          <h2 class="text-2xl font-medium text-gray-900 dark:text-white mb-2">Check your inbox</h2>

          <p v-if="checkEmailReason === 'signup'" class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            We sent a confirmation link to <span class="text-gray-900 dark:text-white font-medium">{{ email }}</span>.
            Click it to activate your account.
          </p>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            We sent a password reset link to <span class="text-gray-900 dark:text-white font-medium">{{ email }}</span>.
            Check your inbox.
          </p>

          <p class="text-xs text-gray-400 dark:text-gray-600 mb-8">The link expires in 1 hour.</p>

          <button @click="view = 'login'" class="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white underline transition-colors">
            ← Back to sign in
          </button>
        </template>

        <!-- Terms of service — shown on login and signup only -->
        <p v-if="view === 'login' || view === 'signup'" class="mt-6 text-xs text-gray-400 dark:text-gray-600 text-center leading-relaxed">
          By signing in, you agree to our
          <a href="#" class="text-gray-500 dark:text-gray-400 underline">Terms of Service</a>
          and
          <a href="#" class="text-gray-500 dark:text-gray-400 underline">Privacy Policy</a>
        </p>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import ThemeToggle from '../../components/ThemeToggle.vue'

const authStore = useAuthStore()
const router = useRouter()
const { proxy } = getCurrentInstance()

// ── View state ──
// Controls which panel is shown: 'login' | 'signup' | 'forgot-password' | 'check-email'
const view = ref('login')
const checkEmailReason = ref('') // 'signup' | 'reset'

// ── Form fields ──
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const formError = ref('')
const loading = ref(false)

// Clear error and password fields on view change, but keep email so users
// don't have to retype it when switching between login / signup / forgot-password
watch(view, () => {
  formError.value = ''
  password.value = ''
  confirmPassword.value = ''
})

// ── Left panel feature list ──
const features = [
  'Offline-first with automatic sync',
  'Works across all your devices',
  'Projects, tasks, notes & tags'
]

// ── Handlers ──

async function handleGoogleSignIn() {
  loading.value = true
  await authStore.signInWithGoogle()
  loading.value = false
}

async function handleSignIn() {
  formError.value = ''
  loading.value = true
  const { error } = await authStore.signInWithEmail(email.value, password.value)
  loading.value = false
  if (error) { formError.value = error.message; return }

  proxy.$swal({
    icon: 'success',
    title: 'Welcome back!',
    theme: 'auto',
    position: 'center',
    showConfirmButton: false,
    timer: 2000,
  })

  router.push('/projects')
}

async function handleSignUp() {
  if (password.value !== confirmPassword.value) {
    formError.value = 'Passwords do not match'
    return
  }
  formError.value = ''
  loading.value = true
  const { error } = await authStore.signUpWithEmail(email.value, password.value)
  loading.value = false
  if (error) { formError.value = error.message; return }
  checkEmailReason.value = 'signup'
  view.value = 'check-email'
}

async function handleForgotPassword() {
  formError.value = ''
  loading.value = true
  const { error } = await authStore.sendPasswordReset(email.value)
  loading.value = false
  if (error) { formError.value = error.message; return }
  checkEmailReason.value = 'reset'
  view.value = 'check-email'
}
</script>
