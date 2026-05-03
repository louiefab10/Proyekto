<template>
  <AppLayout>
    <div class="flex flex-col h-full">

      <!-- ── Header ── -->
      <div class="flex items-center justify-between px-4 md:px-8 pt-6 md:pt-8 pb-4 shrink-0">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Notes</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {{ store.notes.length }} {{ store.notes.length === 1 ? 'note' : 'notes' }}
          </p>
        </div>
        <button
          @click="showAddForm = true"
          class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
          </svg>
          Add note
        </button>
      </div>

      <!-- ── Filter bar ── -->
      <div class="px-4 pb-2 md:px-8 pb-4 shrink-0 flex flex-wrap gap-2">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          @click="activeFilter = f.value"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="activeFilter === f.value
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
        >
          {{ f.label }}
        </button>

        <!-- Project filter dropdown -->
        <select
          v-if="activeFilter === 'project'"
          v-model="selectedProject"
          class="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All projects</option>
          <option
            v-for="project in uniqueProjects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </div>

      <!-- ── Scrollable content ── -->
      <div class="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 pb-8">

        <!-- ── Loading skeleton ── -->
        <div v-if="store.loading" class="flex flex-col gap-3">
          <div v-for="i in 4" :key="i" class="h-24 rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse" />
        </div>

        <template v-else>

          <!-- ── Inline add form ── -->
          <div v-if="showAddForm" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
            <textarea
              v-model="newNoteContent"
              placeholder="Write a note..."
              rows="3"
              autofocus
              class="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none focus:outline-none"
            />
            <div class="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                @click="showAddForm = false; newNoteContent = ''"
                class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                @click="submitAddNote"
                :disabled="!newNoteContent.trim() || saving"
                class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ saving ? 'Saving...' : 'Save note' }}
              </button>
            </div>
          </div>

          <!-- ── Empty state ── -->
          <div
            v-if="filteredNotes.length === 0 && !showAddForm"
            class="flex flex-col items-center justify-center py-24 text-center"
          >
            <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="text-gray-400">
                <rect x="2" y="1" width="12" height="14" rx="1.5"/>
                <line x1="5" y1="5" x2="11" y2="5"/>
                <line x1="5" y1="8" x2="11" y2="8"/>
                <line x1="5" y1="11" x2="8" y2="11"/>
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {{ activeFilter === 'all' ? 'No notes yet' : 'No notes match this filter' }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {{ activeFilter === 'all' ? 'Add your first note to get started' : 'Try a different filter' }}
            </p>
            <button
              v-if="activeFilter === 'all'"
              @click="showAddForm = true"
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
            >
              Add note
            </button>
          </div>

          <!-- ── Notes list ── -->
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="note in filteredNotes"
              :key="note.id"
              class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4"
            >
              <!-- Content — editable inline -->
              <template v-if="editingId === note.id">
                <textarea
                  v-model="editContent"
                  rows="3"
                  class="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
                />
                <div class="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    @click="cancelEdit"
                    class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    @click="submitEdit(note.id)"
                    :disabled="!editContent.trim() || saving"
                    class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ saving ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </template>

              <template v-else>
                <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {{ note.content }}
                </p>

                <!-- Context badges -->
                <div class="flex flex-wrap gap-2 mt-2">
                  <span
                    v-if="note.projects?.name"
                    class="text-xs text-blue-400"
                  >
                   <i class="pi pi-folder-open" />  {{ note.projects.name }}
                  </span>
                  <span
                    v-if="note.tasks?.title"
                    class="text-xs text-purple-400"
                  >
                    <i class="pi pi-link"/> {{ note.tasks.title }}
                  </span>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between mt-3">
                  <span class="text-xs text-gray-400">
                    {{ formatDate(note.created_at) }}
                  </span>
                  <div class="flex items-center gap-3">
                    <button
                      @click="startEdit(note)"
                      class="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      @click="store.deleteNote(note.id)"
                      class="text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { useNotesStore } from '../stores/notesStore'

const store = useNotesStore()

onMounted(() => store.fetchNotes())

// ── Filter ──
const activeFilter    = ref('all')
const selectedProject = ref('')

const filterOptions = [
  { label: 'All',        value: 'all'        },
  { label: 'Standalone', value: 'standalone' },
  { label: 'By project', value: 'project'    },
]

const uniqueProjects = computed(() => {
  const seen = new Set()
  return store.notes
    .filter(n => n.projects)
    .map(n => n.projects)
    .filter(p => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
})

const filteredNotes = computed(() => {
  if (activeFilter.value === 'standalone')
    return store.notes.filter(n => !n.project_id && !n.task_id)
  if (activeFilter.value === 'project') {
    if (selectedProject.value)
      return store.notes.filter(n => n.project_id === selectedProject.value)
    return store.notes.filter(n => !!n.project_id)
  }
  return store.notes
})

// ── Add note ──
const showAddForm    = ref(false)
const newNoteContent = ref('')
const saving         = ref(false)

async function submitAddNote() {
  if (!newNoteContent.value.trim()) return
  saving.value = true
  await store.addNote(newNoteContent.value.trim())
  saving.value        = false
  showAddForm.value   = false
  newNoteContent.value = ''
}

// ── Edit note ──
const editingId  = ref(null)
const editContent = ref('')

function startEdit(note) {
  editingId.value  = note.id
  editContent.value = note.content
}

function cancelEdit() {
  editingId.value  = null
  editContent.value = ''
}

async function submitEdit(id) {
  if (!editContent.value.trim()) return
  saving.value = true
  await store.updateNote(id, editContent.value.trim())
  saving.value = false
  cancelEdit()
}

// ── Helpers ──
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
</script>
