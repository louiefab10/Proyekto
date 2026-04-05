import {defineStore} from "pinia";
import {ref} from "vue";
import {supabase} from "../lib/supabase.js";
import {useAuthStore} from "./authStore.js";

export const useTaskStore = defineStore('tasks', () => {
    const tasks = ref([])
    const loading = ref(false)

    async function fetchTasks() {
        loading.value = true
        const authStore = useAuthStore()
        const {data, error} = await supabase
            .from('tasks')
            .select('*, projects(id, name)')
            .eq('user_id', authStore.user.id)
            .order('created_at', {ascending: true})
        if(error)
            console.error('Unable to fetch tasks: ', error)
        else tasks.value = data

        loading.value = false
    }

    async function addTask({ projectId, title, priority = 'medium', status = 'not_started', due_date = null, note = null }) {
        const authStore = useAuthStore()

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                project_id: projectId,
                user_id: authStore.user.id,
                title,
                priority,
                status,
                due_date,
                note,
            })
            .select('*, projects(id, name)')
            .single()

        if (!error && data) tasks.value.push(data)
        return { data, error }
    }

    async function updateTask(id, updates) {
        const idx = tasks.value.findIndex(t => t.id === id)
        const original = idx !== -1 ? { ...tasks.value[idx] } : null
        if (idx !== -1) Object.assign(tasks.value[idx], updates)

        const { error } = await supabase
            .from('tasks')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error && idx !== -1 && original) Object.assign(tasks.value[idx], original)
        return { error }
    }

    async function deleteTask(id) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

        if (!error) tasks.value = tasks.value.filter(t => t.id !== id)
        return { error }
    }

    return { tasks, loading, fetchTasks, addTask, updateTask, deleteTask }
})