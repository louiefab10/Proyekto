<template>
  <AppLayout>
    <div class="flex flex-col h-full">
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

      <div class="flex-1 min-h-0 px-8 py-8">
        <DataTable
            v-model:filters="filters"
            class="h-full"
            :value="store.tasks"
            :loading="store.loading"
            sort-mode="single"
            filterDisplay="menu"
            :globalFilterFields="['projects.name', 'title', 'priority', 'status']"
            scrollable
            scrollHeight="flex"
            @row-click="openTaskModal($event.data)"
        >
          <template #loading>
            Loading tasks, please wait...
          </template>
          <template #header>
            <div class="flex justify-end">
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Search tasks..." />
              </IconField>
            </div>
          </template>
          <Column field="projects.name" header="Project">
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                  v-model="filterModel.value"
                  @change="filterCallback()"
                  :options="projectOptions"
                  optionLabel="name"
                  optionValue="name"
                  placeholder="Any"
                  :maxSelectedLabels="1"
              />
            </template>

            <template #body="{ data }">
                <span class="text-sm text-gray-900 dark:text-gray-100">
                  {{ data.projects?.name ?? '—' }}
                </span>
            </template>
          </Column>
          <Column field="title" header="Title" filterField="title" :showFilterMenu="false">

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
          <Column field="priority" header="Priority" sortable :showFilterMenu="true">
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                  v-model="filterModel.value"
                  @change="filterCallback()"
                  :options="priorityOptions"
                  placeholder="Any"
                  :showClear="true"
              />
            </template>
            <template #body="{ data }">
                <span class="text-xs font-medium px-2 py-0.5 rounded" :class="priorityClass(data.priority)">
                  {{ data.priority }}
                </span>
            </template>
          </Column>
          <Column field="status" header="Status" :showFilterMatchModes="false">
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                  v-model="filterModel.value"
                  @change="filterCallback()"
                  :options="statusOptions"
                  placeholder="Any"
                  :showClear="true"
              />
            </template>
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
          <template #empty>
            <div class="px-4 py-8 text-center text-sm text-gray-400">
              No tasks yet — add one to get started.
            </div>
          </template>
        </DataTable>
      </div>

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
                rows="5"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y overflow-auto"
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
                rows="5"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y overflow-auto"
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
import { ref, onMounted, computed } from 'vue'
import { useTaskStore } from "../stores/taskStore.js"
import { useProjectsStore } from "../stores/projectsStore.js"
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { FilterMatchMode } from '@primevue/core/api'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'


const store = useTaskStore()
const projectsStore = useProjectsStore()

const filters = ref({
  global:          { value: null, matchMode: FilterMatchMode.CONTAINS },
  'projects.name': { value: null, matchMode: FilterMatchMode.IN },
  title:           { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  priority:        { value: null, matchMode: FilterMatchMode.EQUALS },
  status:          { value: null, matchMode: FilterMatchMode.IN },
})

const priorityOptions = ['low', 'medium', 'high', 'urgent']
const statusOptions   = ['not_started', 'in_progress', 'completed']

const projectOptions = computed(() =>
    projectsStore.projects.map(p => ({ name: p.name }))
)

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
    high:   'bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-200',
    medium: 'bg-indigo-200 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100',
    low:    'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  }
  return map[priority] ?? map.low
}

function statusClass(status) {
  const map = {
    completed:   'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
    in_progress: 'bg-yellow-200/60 text-yellow-900 dark:bg-yellow-900/60 dark:text-yellow-300',
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
