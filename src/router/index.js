// Import the routing functions from Vue Router
import { createRouter, createWebHistory } from 'vue-router'

// Import the Supabase client (we'll create this file next)
import { supabase } from '../lib/supabase'

// Define all the routes in your app
// Each route maps a URL path to a Vue component (page)
const routes = [
    {
        path: '/',
        redirect: '/projects'},
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/auth/Login.vue'),
        meta: {requiresGuest: true}
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../views/auth/ResetPassword.vue')
        // No meta guard — must be reachable via the email link without a full session
    },
    {
        path: '/projects',
        name: 'Projects',
        component: () => import('../views/projects/Projects.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/projects/:id',
        name: 'ProjectDetail',
        component: () => import('../views/projects/ProjectDetail.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/tasks',
        name: 'Tasks',
        component: () => import('../views/Tasks.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/notes',
        name: 'Notes',
        component: () => import('../views/Notes.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/tags',
        name: 'Tags',
        component: () => import('../views/Tags.vue'),
        meta: { requiresAuth: true }
    }
]

// Create the router instance
const router = createRouter({
    history: createWebHistory(),          // Uses clean URLs (no # in the URL)
    routes                                // Pass in our routes defined above
})

// Navigation guard — runs before every route change
// This is what protects pages from unauthenticated access
router.beforeEach(async (to) => {
    // Get the current logged in user from Supabase
    const { data: { user } } = await supabase.auth.getUser()

    // If the route requires auth and user is not logged in
    // redirect them to the login page
    if (to.meta.requiresAuth && !user) {
        return { name: 'Login' }
    }

    // If the route requires guest (like login page) and user IS logged in
    // redirect them to projects page instead
    if (to.meta.requiresGuest && user) {
        return { name: 'Projects' }
    }
})

// Export the router so it can be used in main.js
export default router