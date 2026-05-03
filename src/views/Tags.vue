<template>
  <AppLayout>
    <div class="flex flex-col h-full">

      <!-- ── Header ── -->
      <div class="flex items-center justify-between px-4 md:px-8 pt-6 md:pt-8 pb-4 shrink-0">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Tags</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {{ store.tags.length }} {{ store.tags.length === 1 ? 'tag' : 'tags' }}
          </p>
        </div>
        <button
          @click="showAddForm = true"
          class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
          </svg>
          New tag
        </button>
      </div>

      <!-- ── Scrollable content ── -->
      <div class="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 pb-8">

        <!-- ── Loading skeleton ── -->
        <div v-if="store.loading" class="flex flex-col gap-3">
          <div v-for="i in 4" :key="i" class="h-14 rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse" />
        </div>

        <template v-else>

          <!-- ── Inline add form ── -->
          <div v-if="showAddForm" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-3">New tag</p>
            <div class="flex items-center gap-3">
              <!-- Color picker -->
              <div class="relative shrink-0">
                <input
                  v-model="newColor"
                  type="color"
                  class="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5 bg-white dark:bg-gray-800"
                />
              </div>
              <!-- Name -->
              <input
                v-model="newName"
                type="text"
                placeholder="Tag name"
                class="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @keydown.enter="submitAdd"
              />
            </div>
            <!-- Preview -->
            <div class="mt-3 flex items-center gap-2">
              <span class="text-xs text-gray-400">Preview:</span>
              <span
                class="text-xs font-medium px-2.5 py-1 rounded-full"
                :style="{ backgroundColor: newColor + '33', color: newColor }"
              >
                {{ newName || 'Tag name' }}
              </span>
            </div>
            <div class="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                @click="cancelAdd"
                class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                @click="submitAdd"
                :disabled="!newName.trim() || saving"
                class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ saving ? 'Saving...' : 'Create tag' }}
              </button>
            </div>
          </div>

          <!-- ── Empty state ── -->
          <div
            v-if="store.tags.length === 0 && !showAddForm"
            class="flex flex-col items-center justify-center py-24 text-center"
          >
            <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                <path d="M2 8c0-2 1.5-4 4-4h4c2.5 0 4 2 4 4s-1.5 4-4 4H6c-2.5 0-4-2-4-4z"/>
                <circle cx="5.5" cy="8" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">No tags yet</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Create tags to organise your projects and tasks</p>
            <button
              @click="showAddForm = true"
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
            >
              New tag
            </button>
          </div>

          <!-- ── Tag list ── -->
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="tag in store.tags"
              :key="tag.id"
              class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3"
            >

              <!-- View mode -->
              <template v-if="editingId !== tag.id">
                <div class="flex items-center gap-3">
                  <!-- Color dot -->
                  <div
                    class="w-3 h-3 rounded-full shrink-0"
                    :style="{ backgroundColor: tag.color }"
                  />
                  <!-- Tag chip -->
                  <span
                    class="text-xs font-medium px-2.5 py-1 rounded-full"
                    :style="{ backgroundColor: tag.color + '33', color: tag.color }"
                  >
                    {{ tag.name }}
                  </span>
                  <!-- Usage counts -->
                  <span class="text-xs text-gray-400 ml-1">
                    {{ usageLabel(tag) }}
                  </span>
                  <!-- Actions -->
                  <div class="ml-auto flex items-center gap-3">
                    <button
                      @click="startEdit(tag)"
                      class="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      @click="handleDelete(tag)"
                      class="text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </template>

              <!-- Edit mode -->
              <template v-else>
                <div class="flex items-center gap-3">
                  <input
                    v-model="editColor"
                    type="color"
                    class="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5 bg-white dark:bg-gray-800 shrink-0"
                  />
                  <input
                    v-model="editName"
                    type="text"
                    class="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @keydown.enter="submitEdit(tag.id)"
                  />
                </div>
                <!-- Preview -->
                <div class="mt-2 flex items-center gap-2">
                  <span class="text-xs text-gray-400">Preview:</span>
                  <span
                    class="text-xs font-medium px-2.5 py-1 rounded-full"
                    :style="{ backgroundColor: editColor + '33', color: editColor }"
                  >
                    {{ editName || 'Tag name' }}
                  </span>
                </div>
                <div class="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    @click="cancelEdit"
                    class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    @click="submitEdit(tag.id)"
                    :disabled="!editName.trim() || saving"
                    class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ saving ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </template>

            </div>
          </div>

        </template>
      </div>

    </div>
  </AppLayout>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { useTagsStore } from '../stores/tagsStore'

const store = useTagsStore()
const { proxy } = getCurrentInstance()

onMounted(() => store.fetchTags())

// ── Add tag ──
const showAddForm = ref(false)
const newName     = ref('')
const newColor    = ref('#3B82F6')
const saving      = ref(false)

function cancelAdd() {
  showAddForm.value = false
  newName.value     = ''
  newColor.value    = '#3B82F6'
}

async function submitAdd() {
  if (!newName.value.trim()) return
  saving.value = true
  await store.createTag(newName.value, newColor.value)
  saving.value = false
  cancelAdd()
}

// ── Edit tag ──
const editingId = ref(null)
const editName  = ref('')
const editColor = ref('#3B82F6')

function startEdit(tag) {
  editingId.value = tag.id
  editName.value  = tag.name
  editColor.value = tag.color
}

function cancelEdit() {
  editingId.value = null
  editName.value  = ''
  editColor.value = '#3B82F6'
}

async function submitEdit(id) {
  if (!editName.value.trim()) return
  saving.value = true
  await store.updateTag(id, editName.value, editColor.value)
  saving.value = false
  cancelEdit()
}

// ── Delete tag ──
async function handleDelete(tag) {
  const result = await proxy.$swal({
    title: `Delete "${tag.name}"?`,
    text: 'This will remove the tag from all projects and tasks.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  })
  if (result.isConfirmed) await store.deleteTag(tag.id)
}

// ── Usage label ──
function usageLabel(tag) {
  const parts = []
  if (tag.projectCount > 0) parts.push(`${tag.projectCount} ${tag.projectCount === 1 ? 'project' : 'projects'}`)
  if (tag.taskCount > 0)    parts.push(`${tag.taskCount} ${tag.taskCount === 1 ? 'task' : 'tasks'}`)
  return parts.length > 0 ? parts.join(', ') : 'Not used'
}
</script>
