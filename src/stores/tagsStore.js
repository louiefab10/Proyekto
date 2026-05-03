import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useTagsStore = defineStore('tags', () => {

    const tags    = ref([])
    const loading = ref(false)

    // Fetch all tags for the user with project + task usage counts
    async function fetchTags() {
        loading.value = true
        const authStore = useAuthStore()

        const { data, error } = await supabase
            .from('tags')
            .select(`
                *,
                project_tags(count),
                task_tags(count)
            `)
            .eq('user_id', authStore.user.id)
            .order('name')

        if (error) console.error('Unable to fetch tags:', error)
        else tags.value = data.map(tag => ({
            ...tag,
            projectCount: tag.project_tags?.[0]?.count ?? 0,
            taskCount:    tag.task_tags?.[0]?.count ?? 0,
        }))

        loading.value = false
    }

    async function createTag(name, color) {
        const authStore = useAuthStore()

        const { data, error } = await supabase
            .from('tags')
            .insert({
                user_id: authStore.user.id,
                name:    name.trim(),
                color,
            })
            .select()
            .single()

        if (!error && data) {
            tags.value.push({ ...data, projectCount: 0, taskCount: 0 })
            tags.value.sort((a, b) => a.name.localeCompare(b.name))
        }
        return { data, error }
    }

    async function updateTag(id, name, color) {
        const { data, error } = await supabase
            .from('tags')
            .update({ name: name.trim(), color })
            .eq('id', id)
            .select()
            .single()

        if (!error && data) {
            const idx = tags.value.findIndex(t => t.id === id)
            if (idx !== -1) tags.value[idx] = {
                ...tags.value[idx],
                name:  data.name,
                color: data.color,
            }
            tags.value.sort((a, b) => a.name.localeCompare(b.name))
        }
        return { error }
    }

    async function deleteTag(id) {
        const { error } = await supabase
            .from('tags')
            .delete()
            .eq('id', id)

        if (!error) tags.value = tags.value.filter(t => t.id !== id)
        return { error }
    }

    return { tags, loading, fetchTags, createTag, updateTag, deleteTag }
})
