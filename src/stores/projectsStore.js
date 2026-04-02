import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useProjectsStore = defineStore('projects', () => {

    const projects = ref([])
    const loading = ref(false)

    // Fetch all projects for the current user, including their tags and tasks
    async function fetchProjects() {
        loading.value = true

        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                project_tags(tag_id, tags(id, name, color)),
                tasks(id, status)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching projects:', error)
        } else {
            // Flatten the nested data into a more convenient shape
            projects.value = data.map(project => {
                const totalTasks = project.tasks.length
                const completedTasks = project.tasks.filter(t => t.status === 'completed').length
                return {
                    ...project,
                    tags: project.project_tags.map(pt => pt.tags),
                    totalTasks,
                    completedTasks,
                    completionPct: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                }
            })
        }

        loading.value = false
    }

    // Create a new project
    async function createProject({ name, description, status, due_date }) {
        const authStore = useAuthStore()

        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: authStore.user.id,
                name,
                description: description || null,
                status: status || 'active',
                due_date: due_date || null,
            })
            .select()
            .single()

        if (error) return { error }

        // Refresh the list so the new project appears
        await fetchProjects()
        return { data }
    }

    // Update an existing project
    async function updateProject(id, updates) {
        const { error } = await supabase
            .from('projects')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) return { error }
        await fetchProjects()
        return {}
    }

    // Delete a project (cascades to tasks, notes, tags via DB constraints)
    async function deleteProject(id) {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) return { error }
        projects.value = projects.value.filter(p => p.id !== id)
        return {}
    }

    return { projects, loading, fetchProjects, createProject, updateProject, deleteProject }
})
