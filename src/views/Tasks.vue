<template>
  <AppLayout>
    <div class="px-8 pt-8 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
      <button
        @click="openTaskModal()"
        class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <i class="pi pi-plus" />
        Add new task
      </button>
    </div>

    <div class="px-8 py-8">
      <!-- ── Loading ── -->
      <div v-if="store.loading" class="flex flex-col gap-4">
        <div class="h-6 w-48 rounded bg-gray-800 animate-pulse" />
        <div class="h-8 w-72 rounded bg-gray-800 animate-pulse" />
        <div class="h-2 w-full rounded bg-gray-800 animate-pulse mt-4" />
      </div>

      <template v-else>
        <div class="app-table rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <DataTable
            :value="store.tasks"
            unstyled
            sort-mode="single"
            :pt="{ table: { class: 'w-full' } }"
            @row-click="openTaskModal($event.data)"
          >
            <Column field="projects.name" header="Project">
              <template #body="{ data }">
                <span class="text-sm text-gray-900 dark:text-gray-100">
                  {{ data.projects?.name ?? '—' }}
                </span>
              </template>
            </Column>
            <Column field="title" header="Title">
              <template #body="{ data }">
                <span
                  class="text-sm"
                  :class="data.status === 'completed'
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-900 dark:text-gray-100'"
                >
                  {{ data.title }}
                </span>
              </template>
            </Column>
            <Column field="priority" header="Priority" sortable>
              <template #body="{ data }">
                <span class="text-xs font-medium px-2 py-0.5 rounded" :class="priorityClass(data.priority)">
                  {{ data.priority }}
                </span>
              </template>
            </Column>
            <Column field="status" header="Status" sortable>
              <template #body="{ data }">
                <span class="text-xs font-medium px-2 py-0.5 rounded" :class="statusClass(data.status)">
                  {{ data.status.replace('_', ' ') }}
                </span>
              </template>
            </Column>
            <Column field="due_date" header="Due Date" sortable>
              <template #body="{ data }">
                <span
                  class="text-sm"
                  :class="data.status !== 'completed' && isOverdue(data.due_date)
                    ? 'text-red-400'
                    : 'text-gray-400'"
                >
                  {{ data.due_date ? formatDate(data.due_date) : '—' }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>

    </div>

    <!-- ── Add task modal ── -->
    <Teleport to="body">
      <div
        v-if="taskModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="taskModal.open = false"
      >
        <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            {{ taskModal.task ? 'Edit task' : 'Add task' }}
          </h2>

          <form @submit.prevent="submitTaskModal" class="flex flex-col gap-4">

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Project <span class="text-red-400">*</span></label>
              <select
                v-model="taskForm.projectId"
                :disabled="!!taskModal.task"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select a project</option>
                <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Title <span class="text-red-400">*</span></label>
              <input
                v-model="taskForm.title"
                type="text"
                placeholder="Task title"
                autofocus
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Description <span class="text-gray-600">(optional)</span></label>
              <textarea
                v-model="taskForm.description"
                placeholder="Add a description..."
                rows="2"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Priority</label>
                <select
                  v-model="taskForm.priority"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  v-model="taskForm.status"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                v-model="taskForm.due_date"
                type="date"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-400 uppercase tracking-wide">Note <span class="text-gray-600">(optional)</span></label>
              <textarea
                v-model="taskForm.note"
                placeholder="Add a note..."
                rows="2"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                @click="taskModal.open = false"
                class="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!taskForm.title.trim() || !taskForm.projectId || taskSaving"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="pi pi-save" />
                {{ taskSaving ? 'Saving...' : (taskModal.task ? 'Save changes' : 'Add task') }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Teleport>

  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { ref, onMounted } from 'vue'
import { useTaskStore } from "../stores/taskStore.js"
import { useProjectsStore } from "../stores/projectsStore.js"
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const store = useTaskStore()
const projectsStore = useProjectsStore()

onMounted(() => {
  store.fetchTasks()
  projectsStore.fetchProjects()
})

// ── Task modal ──
const taskModal  = ref({ open: false, task: null })
const taskForm   = ref({ projectId: '', title: '', priority: 'medium', status: 'not_started', due_date: '', description: '', note: '' })
const taskSaving = ref(false)

function openTaskModal(task = null) {
  taskModal.value = { open: true, task }
  taskForm.value = task
    ? { projectId: task.project_id, title: task.title, priority: task.priority, status: task.status, due_date: task.due_date ?? '', description: task.description ?? '', note: task.note ?? '' }
    : { projectId: '', title: '', priority: 'medium', status: 'not_started', due_date: '', description: '', note: '' }
}

async function submitTaskModal() {
  if (!taskForm.value.title.trim() || !taskForm.value.projectId) return
  taskSaving.value = true
  try {
    if (taskModal.value.task) {
      await store.updateTask(taskModal.value.task.id, {
        title:       taskForm.value.title.trim(),
        priority:    taskForm.value.priority,
        status:      taskForm.value.status,
        due_date:    taskForm.value.due_date || null,
        description: taskForm.value.description.trim() || null,
        note:        taskForm.value.note.trim() || null,
      })
    } else {
      await store.addTask({
        projectId:   taskForm.value.projectId,
        title:       taskForm.value.title.trim(),
        priority:    taskForm.value.priority,
        status:      taskForm.value.status,
        due_date:    taskForm.value.due_date || null,
        description: taskForm.value.description.trim() || null,
        note:        taskForm.value.note.trim() || null,
      })
    }
    taskModal.value = { open: false, task: null }
  } finally {
    taskSaving.value = false
  }
}

function priorityClass(priority) {
  const map = {
    urgent: 'bg-red-950 text-red-300',
    high:   'bg-red-700 text-red-300',
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

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}
</script>
