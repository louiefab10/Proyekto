import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useNotesStore = defineStore('notes', () => {

    const notes   = ref([])
    const loading = ref(false)

    // Fetch all notes for the user with project + task context
    async function fetchNotes() {
        loading.value = true
        const authStore = useAuthStore()

        const { data, error } = await supabase
            .from('notes')
            .select('*, projects(id, name), tasks(id, title)')
            .eq('user_id', authStore.user.id)
            .order('created_at', { ascending: false })

        if (error) console.error('Unable to fetch notes:', error)
        else notes.value = data

        loading.value = false
    }

    // Add a standalone note (no project or task)
    async function addNote(content) {
        const authStore = useAuthStore()

        const { data, error } = await supabase
            .from('notes')
            .insert({
                user_id: authStore.user.id,
                content,
                project_id: null,
                task_id: null,
            })
            .select('*, projects(id, name), tasks(id, title)')
            .single()

        if (!error && data) notes.value.unshift(data) // newest first
        return { error }
    }

    async function updateNote(id, content) {
        const { data, error } = await supabase
            .from('notes')
            .update({ content })
            .eq('id', id)
            .select('*, projects(id, name), tasks(id, title)')
            .single()

        if (!error && data) {
            const idx = notes.value.findIndex(n => n.id === id)
            if (idx !== -1) notes.value[idx] = data
        }
        return { error }
    }

    async function deleteNote(id) {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)

        if (!error) notes.value = notes.value.filter(n => n.id !== id)
        return { error }
    }

    return { notes, loading, fetchNotes, addNote, updateNote, deleteNote }
})
