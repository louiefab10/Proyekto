<template>
  <AppLayout>
    <div class="px-8 py-8 max-w-5xl">

      <!-- ── Loading ── -->
      <div v-if="store.loading" class="flex flex-col gap-4">
        <div class="h-6 w-48 rounded bg-gray-800 animate-pulse" />
        <div class="h-8 w-72 rounded bg-gray-800 animate-pulse" />
        <div class="h-2 w-full rounded bg-gray-800 animate-pulse mt-4" />
      </div>

      <template v-else-if="store.project">

        <!-- ── Header ── -->
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <RouterLink to="/projects" class="hover:text-gray-300 transition-colors">Projects</RouterLink>
          <span>/</span>
          <span class="text-gray-300">{{ store.project.name }}</span>
        </nav>

        <div class="flex items-start justify-between gap-4 mb-2">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ store.project.name }}</h1>
          <span v-if="store.project.due_date" class="shrink-0 text-sm text-gray-400 mt-1">
            Due {{ formatDate(store.project.due_date) }}
          </span>
        </div>

        <p v-if="store.project.description" class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {{ store.project.description }}
        </p>

        <!-- Progress bar -->
        <div class="mb-8">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-gray-400 font-medium">Progress</span>
            <span class="text-gray-400">{{ progressPct }}% · {{ completedCount }}/{{ totalCount }} tasks done</span>
          </div>
          <div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              class="h-full rounded-full bg-blue-500 transition-all duration-300"
              :style="{ width: `${progressPct}%` }"
            />
          </div>
        </div>

        <!-- ── Tabs ── -->
        <div class="flex items-center gap-1 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="activeTab === tab.id
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- ── Tasks tab ── -->
        <div v-if="activeTab === 'tasks'">

          <!-- Toolbar -->
          <div class="flex items-center gap-2 mb-5 flex-wrap">
            <span class="text-sm text-gray-400">Sort by</span>

            <button
              v-for="sf in sortFields"
              :key="sf.value"
              @click="toggleSort(sf.value)"
              class="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border transition-colors"
              :class="sortField === sf.value
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'"
            >
              {{ sf.label }}
              <span v-if="sortField === sf.value">{{ sortDirection === 'desc' ? '↓' : '↑' }}</span>
            </button>

            <button
              @click="showAddTask = true"
              class="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
              </svg>
              Add task
            </button>
          </div>

          <!-- Table -->
          <div class="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <th class="w-12 px-4 py-3"></th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Task</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Priority</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                  <th class="px-3 py-3 text-left text-xs font-medium text-gray-400">Due date</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="task in sortedTasks"
                  :key="task.id"
                  @click="selectedTask = task"
                  class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                >
                  <!-- Checkbox -->
                  <td class="px-4 py-3.5">
                    <button
                      @click.stop="store.toggleTaskComplete(task)"
                      class="w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0"
                      :class="task.status === 'completed'
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'"
                    >
                      <svg v-if="task.status === 'completed'" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </td>

                  <!-- Title -->
                  <td class="px-3 py-3.5">
                    <span
                      class="text-sm"
                      :class="task.status === 'completed'
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-900 dark:text-gray-100'"
                    >
                      {{ task.title }}
                    </span>
                  </td>

                  <!-- Priority -->
                  <td class="px-3 py-3.5">
                    <span class="text-xs font-medium px-2 py-0.5 rounded" :class="priorityClass(task.priority)">
                      {{ task.priority }}
                    </span>
                  </td>

                  <!-- Status -->
                  <td class="px-3 py-3.5">
                    <span class="text-xs font-medium px-2 py-0.5 rounded" :class="statusClass(task.status)">
                      {{ task.status.replace('_', ' ') }}
                    </span>
                  </td>

                  <!-- Due date -->
                  <td class="px-3 py-3.5">
                    <span
                      class="text-sm"
                      :class="task.status !== 'completed' && isOverdue(task.due_date)
                        ? 'text-red-400'
                        : 'text-gray-400'"
                    >
                      {{ task.due_date ? formatDate(task.due_date) : '—' }}
                    </span>
                  </td>
                </tr>

                <!-- Empty state -->
                <tr v-if="sortedTasks.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-400">
                    No tasks yet — add one to get started.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ── Notes tab ── -->
        <div v-else-if="activeTab === 'notes'">
          <div class="flex justify-end mb-4">
            <button
              @click="showAddNote = !showAddNote"
              class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
              </svg>
              Add note
            </button>
          </div>

          <!-- Inline add note form -->
          <div v-if="showAddNote" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
            <textarea
              v-model="newNoteContent"
              placeholder="Write a note..."
              rows="3"
              class="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none focus:outline-none"
            />
            <div class="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                @click="showAddNote = false; newNoteContent = ''"
                class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                @click="submitAddNote"
                :disabled="!newNoteContent.trim()"
                class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save note
              </button>
            </div>
          </div>

          <!-- Notes list -->
          <div v-if="store.notes.length > 0" class="flex flex-col gap-3">
            <div
              v-for="note in store.notes"
              :key="note.id"
              class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4"
            >
              <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {{ note.content }}
              </p>
              <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-gray-400">
                  {{ new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                </span>
                <button
                  @click="store.deleteNote(note.id)"
                  class="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          <p v-else-if="!showAddNote" class="text-sm text-gray-400 text-center py-12">
            No notes yet.
          </p>
        </div>

        <!-- ── Tags tab ── -->
        <div v-else-if="activeTab === 'tags'">

          <!-- Applied tags -->
          <div class="mb-8">
            <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Applied tags</h3>
            <div v-if="store.projectTags.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="tag in store.projectTags"
                :key="tag.id"
                class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                :style="{ backgroundColor: tag.color + '33', color: tag.color }"
              >
                {{ tag.name }}
                <button
                  @click="store.removeProjectTag(tag.id)"
                  class="opacity-60 hover:opacity-100 transition-opacity leading-none"
                >
                  ×
                </button>
              </span>
            </div>
            <p v-else class="text-sm text-gray-400">No tags applied to this project.</p>
          </div>

          <!-- Available tags to add -->
          <div v-if="availableTags.length > 0">
            <h3 class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Add a tag</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in availableTags"
                :key="tag.id"
                @click="store.addProjectTag(tag.id)"
                class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-dashed transition-colors hover:opacity-80"
                :style="{ borderColor: tag.color, color: tag.color }"
              >
                + {{ tag.name }}
              </button>
            </div>
          </div>

          <p v-if="store.allUserTags.length === 0" class="text-sm text-gray-400 mt-4">
            You haven't created any tags yet.
          </p>
        </div>

      </template>

      <!-- Not found -->
      <div v-else class="text-center py-24">
        <p class="text-sm text-gray-400">Project not found.</p>
        <RouterLink to="/projects" class="text-sm text-blue-400 hover:text-blue-300 mt-2 block transition-colors">
          ← Back to projects
        </RouterLink>
      </div>

    </div>

    <!-- ── Add task modal ── -->
    <Teleport to="body">
      <div
        v-if="showAddTask"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showAddTask = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border
        border-gray-100 dark:border-gray-800 shadow-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-5">Add task</h2>

          <form @submit.prevent="submitAddTask" class="flex flex-col gap-4">

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Title <span class="text-red-400">*</span></label>
              <input
                v-model="newTaskTitle"
                type="text"
                placeholder="Task title"
                autofocus
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Priority</label>
                <select
                  v-model="newTaskPriority"
                  class="w-full rounded-lg border border-gray-200
                  dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm
                  text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</label>
                <select
                  v-model="newTaskStatus"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900
                  dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Due date</label>
              <input
                v-model="newTaskDueDate"
                type="date"
                class="w-full rounded-lg border border-gray-200
                dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm
                text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Note <span class="text-gray-600">(optional)</span></label>
              <textarea
                  v-model="newTaskNote"
                  placeholder="Add an initial note..."
                  rows="2"
                  class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>


            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                @click="showAddTask = false"
                class="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!newTaskTitle.trim()"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add task
              </button>
            </div>

          </form>
        </div>
      </div>
    </Teleport>

    <!--Show task modal -->
    <Teleport to="body">
      <div v-if="selectedTask"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
           @click.self="selectedTask = null">
        <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border
        border-gray-100 dark:border-gray-800 shadow-xl p-6">
          <h2 class="text-lg font-semibold text-white mb-5">{{ selectedTask.title }}</h2>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Priority</label>
              <select v-model="selectedTask.priority"
                      class="w-full rounded-lg border border-gray-200
                  dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm
                  text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @change="store.updateTask(selectedTask.id, { priority: selectedTask.priority })">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</label>
              <select v-model="selectedTask.status"
                      class="w-full rounded-lg border border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900
                  dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @change="store.updateTask(selectedTask.id, { status: selectedTask.status })">
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Due Date</label>
            <input type="date"
                   class="w-full rounded-lg border border-gray-200
                dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm
                text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                   v-model="selectedTask.due_date" @change="store.updateTask(selectedTask.id, { due_date: selectedTask.due_date })" />

          </div>


          <!-- Task-specific notes -->
          <div class="mt-4">
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-2">Notes</p>

            <textarea v-model="taskNoteContent" placeholder="Add a note..." class="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-white resize-none" rows="2" />
            <button @click="saveTaskNote" class="mt-2 px-3 py-1.5 bg-blue-600 rounded-lg text-sm text-white">Save</button>
          </div>

        </div>
      </div>
    </Teleport>


  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useProjectDetailStore } from '../../stores/projectDetailStore'

const route = useRoute()
const store = useProjectDetailStore()


onMounted(() => store.fetchProject(route.params.id))

// ── Tabs ──
const activeTab = ref('tasks')
const selectedTask = ref(null)
const tabs = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'notes', label: 'Notes' },
  { id: 'tags',  label: 'Tags'  },
]

// ── Progress ──
const completedCount = computed(() => store.tasks.filter(t => t.status === 'completed').length)
const totalCount     = computed(() => store.tasks.length)
const progressPct    = computed(() =>
  totalCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100)
)

// ── Sorting ──
const sortField     = ref('priority')
const sortDirection = ref('desc')

const sortFields = [
  { value: 'priority', label: 'Priority' },
  { value: 'due_date', label: 'Due date' },
  { value: 'status',   label: 'Status'   },
]

const PRIORITY_ORDER = { urgent: 4, high: 3, medium: 2, low: 1 }
const STATUS_ORDER   = { not_started: 1, in_progress: 2, completed: 3 }

function toggleSort(field) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const sortedTasks = computed(() => {
  return [...store.tasks].sort((a, b) => {
    let aVal, bVal
    if (sortField.value === 'priority') {
      aVal = PRIORITY_ORDER[a.priority] ?? 0
      bVal = PRIORITY_ORDER[b.priority] ?? 0
    } else if (sortField.value === 'due_date') {
      aVal = a.due_date ? new Date(a.due_date).getTime() : Infinity
      bVal = b.due_date ? new Date(b.due_date).getTime() : Infinity
    } else {
      aVal = STATUS_ORDER[a.status] ?? 0
      bVal = STATUS_ORDER[b.status] ?? 0
    }
    return sortDirection.value === 'desc' ? bVal - aVal : aVal - bVal
  })
})

// ── Badge helpers ──
function priorityClass(priority) {
  const map = {
    urgent: 'bg-red-950 text-red-300',
    high:   'bg-amber-900 text-amber-300',
    medium: 'bg-indigo-900 text-indigo-300',
    low:    'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  }
  return map[priority] ?? map.low
}

function statusClass(status) {
  const map = {
    completed:   'bg-green-900 text-green-300',
    in_progress: 'bg-yellow-900/60 text-yellow-300',
    not_started: 'text-gray-400 dark:text-gray-500',
  }
  return map[status] ?? map.not_started
}

// ── Date helpers ──
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

// ── Add task ──
const showAddTask     = ref(false)
const newTaskTitle    = ref('')
const newTaskPriority = ref('medium')
const newTaskStatus   = ref('not_started')
const newTaskDueDate  = ref('')
const newTaskNote = ref('')
async function submitAddTask() {
  if (!newTaskTitle.value.trim()) return
  await store.addTask({
    title:    newTaskTitle.value.trim(),
    priority: newTaskPriority.value,
    status:   newTaskStatus.value,
    due_date: newTaskDueDate.value || null,
    note: newTaskNote.value.trim() || null
  })

  showAddTask.value     = false
  newTaskTitle.value    = ''
  newTaskPriority.value = 'medium'
  newTaskStatus.value   = 'not_started'
  newTaskDueDate.value  = ''
  newTaskNote.value = ''
}

// ── Add note ──
const showAddNote    = ref(false)
const newNoteContent = ref('')

async function submitAddNote() {
  if (!newNoteContent.value.trim()) return
  await store.addNote(newNoteContent.value.trim())
  showAddNote.value    = false
  newNoteContent.value = ''
}

const taskNoteContent = ref('')



watch(selectedTask, (task) => {
  taskNoteContent.value = task?.note ?? ''
})

async function saveTaskNote() {
  await store.updateTask(selectedTask.value.id, { note: taskNoteContent.value })
}

// ── Available tags (not yet on this project) ──
const availableTags = computed(() =>
  store.allUserTags.filter(t => !store.projectTags.find(pt => pt.id === t.id))
)
</script>
