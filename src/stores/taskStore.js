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
            .select('*, projects(id, name), notes(*), task_tags(tag_id, tags(*))')
            .eq('user_id', authStore.user.id)
            .order('created_at', {ascending: true})
        if(error)
            console.error('Unable to fetch tasks: ', error)
        else tasks.value = data

        loading.value = false
    }

    async function addTask({ projectId, title, priority = 'medium', status = 'not_started', due_date = null, description = null }) {
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
                description,
            })
            .select('*, projects(id, name), notes(*), task_tags(tag_id, tags(*))')
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

    // ── Note functions ──

    async function addNote(taskId, projectId, content) {
        const authStore = useAuthStore()
        const { data, error } = await supabase
            .from('notes')
            .insert({
                task_id: taskId,
                project_id: projectId,
                user_id: authStore.user.id,
                content,
            })
            .select()
            .single()

        if (!error && data) {
            const task = tasks.value.find(t => t.id === taskId)
            if (task) task.notes = [...(task.notes ?? []), data]
        }
        return { data, error }
    }

    async function updateNote(noteId, taskId, content) {
        const { data, error } = await supabase
            .from('notes')
            .update({ content })
            .eq('id', noteId)
            .select()
            .single()

        if (!error && data) {
            const task = tasks.value.find(t => t.id === taskId)
            if (task) {
                const idx = task.notes.findIndex(n => n.id === noteId)
                if (idx !== -1) task.notes[idx] = data
            }
        }
        return { error }
    }

    // ── Task tag functions ──

    async function addTaskTag(taskId, tag) {
        const { error } = await supabase
            .from('task_tags')
            .insert({ task_id: taskId, tag_id: tag.id })

        if (!error) {
            const task = tasks.value.find(t => t.id === taskId)
            if (task) task.task_tags = [...(task.task_tags ?? []), { tag_id: tag.id, tags: tag }]
        }
        return { error }
    }

    async function removeTaskTag(taskId, tagId) {
        const { error } = await supabase
            .from('task_tags')
            .delete()
            .eq('task_id', taskId)
            .eq('tag_id', tagId)

        if (!error) {
            const task = tasks.value.find(t => t.id === taskId)
            if (task) task.task_tags = task.task_tags.filter(tt => tt.tag_id !== tagId)
        }
        return { error }
    }

    return { tasks, loading, fetchTasks, addTask, updateTask, deleteTask, addNote, updateNote, addTaskTag, removeTaskTag }
})
