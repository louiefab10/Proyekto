import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useProjectDetailStore = defineStore('projectDetail', () => {

    const project     = ref(null)
    const tasks       = ref([])
    const notes       = ref([])
    const projectTags = ref([])  // tags currently applied to this project
    const allUserTags = ref([])  // all tags the user owns (for the add-tag picker)
    const loading     = ref(false)

    // Fetch the project and all related data in parallel
    async function fetchProject(id) {
        loading.value = true
        const authStore = useAuthStore()

        const [
            { data: proj },
            { data: taskData },
            { data: noteData },
            { data: ptData },
            { data: tagData },
        ] = await Promise.all([
            supabase.from('projects').select('*').eq('id', id).single(),
            supabase.from('tasks').select('*, task_tags(tag_id, tags(*))').eq('project_id', id).order('created_at', { ascending: true }),
            supabase.from('notes').select('*, tasks(title)').eq('project_id', id).order('created_at', { ascending: false }),
            supabase.from('project_tags').select('tag_id, tags(*)').eq('project_id', id),
            supabase.from('tags').select('*').eq('user_id', authStore.user.id).order('name'),
        ])

        project.value     = proj ?? null
        tasks.value       = taskData ?? []
        notes.value       = noteData ?? []
        projectTags.value = (ptData ?? []).map(pt => pt.tags)
        allUserTags.value = tagData ?? []
        loading.value     = false
    }

    // ── Task functions ──

    async function addTask({ title, priority = 'medium', status = 'not_started', due_date = null, description = null }) {
        const authStore = useAuthStore()
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                project_id: project.value.id,
                user_id: authStore.user.id,
                title,
                priority,
                status,
                due_date,
                description,
            })
            .select('*, task_tags(tag_id, tags(*))')
            .single()

        if (!error && data) tasks.value.push(data)
        return { data, error }
    }

    // Optimistic update — mutate locally first, revert on error
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

    async function toggleTaskComplete(task) {
        const newStatus = task.status === 'completed' ? 'not_started' : 'completed'
        return updateTask(task.id, { status: newStatus })
    }

    async function deleteTask(id) {
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        if (!error) tasks.value = tasks.value.filter(t => t.id !== id)
        return { error }
    }

    // ── Note functions ──

    async function addNote(content, taskId = null) {
        const authStore = useAuthStore()
        const { data, error } = await supabase
            .from('notes')
            .insert({
                project_id: project.value.id,
                user_id: authStore.user.id,
                content,
                task_id: taskId,
            })
            .select('*, tasks(title)')
            .single()

        if (!error && data) notes.value.unshift(data)
        return { error }
    }

    async function updateNote(noteId, content) {
        const { data, error } = await supabase
            .from('notes')
            .update({ content })
            .eq('id', noteId)
            .select('*, tasks(title)')
            .single()

        if (!error && data) {
            const idx = notes.value.findIndex(n => n.id === noteId)
            if (idx !== -1) notes.value[idx] = data
        }
        return { error }
    }

    async function deleteNote(id) {
        const { error } = await supabase.from('notes').delete().eq('id', id)
        if (!error) notes.value = notes.value.filter(n => n.id !== id)
        return { error }
    }

    // ── Project tag functions ──

    async function addProjectTag(tagId) {
        const { error } = await supabase
            .from('project_tags')
            .insert({ project_id: project.value.id, tag_id: tagId })

        if (!error) {
            const tag = allUserTags.value.find(t => t.id === tagId)
            if (tag) projectTags.value.push(tag)
        }
        return { error }
    }

    async function removeProjectTag(tagId) {
        const { error } = await supabase
            .from('project_tags')
            .delete()
            .eq('project_id', project.value.id)
            .eq('tag_id', tagId)

        if (!error) projectTags.value = projectTags.value.filter(t => t.id !== tagId)
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

    return {
        project, tasks, notes, projectTags, allUserTags, loading,
        fetchProject,
        addTask, updateTask, toggleTaskComplete, deleteTask,
        addNote, updateNote, deleteNote,
        addProjectTag, removeProjectTag,
        addTaskTag, removeTaskTag,
    }
})
