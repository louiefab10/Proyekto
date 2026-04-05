<template>
  <AppLayout>

    <!-- ── Page header ── -->
    <div class="flex items-start justify-between px-8 pt-8 pb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Projects</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {{ activeCount }} active {{ activeCount === 1 ? 'project' : 'projects' }}
        </p>
      </div>
      <button
        @click="showModal = true"
        class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <i class="pi pi-folder-plus" />
        Add new project
      </button>
    </div>

    <!-- ── Loading skeleton ── -->
    <div v-if="projectsStore.loading" class="px-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-52 rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse" />
    </div>

    <!-- ── Empty state ── -->
    <div
      v-else-if="projectsStore.projects.length === 0"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gray-400">
          <rect x="1" y="1" width="8" height="8" rx="1.5"/>
          <rect x="13" y="1" width="8" height="8" rx="1.5"/>
          <rect x="1" y="13" width="8" height="8" rx="1.5"/>
          <rect x="13" y="13" width="8" height="8" rx="1.5"/>
        </svg>
      </div>
      <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">No projects yet</p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first project to get started</p>
      <button
        @click="showModal = true"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
      >
        <i class="pi pi-folder-plus" />
        Add new project
      </button>
    </div>

    <!-- ── Project grid ── -->
    <div v-else class="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="project in projectsStore.projects"
        :key="project.id"
        @click="router.push(`/projects/${project.id}`)"
        class="group flex flex-col gap-3 p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer transition-colors"
      >
        <!-- Name + status badge -->
        <div class="flex items-start justify-between gap-2">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white leading-snug">
            {{ project.name }}
          </h2>
          <span
            class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
            :class="statusStyle(project.status)"
          >
            {{ project.status }}
          </span>
        </div>

        <!-- Description -->
        <p
          v-if="project.description"
          class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2"
        >
          {{ project.description }}
        </p>

        <!-- Progress bar + stats -->
        <div class="flex flex-col gap-1.5">
          <div class="h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="progressColor(project.status)"
              :style="{ width: `${project.completionPct}%` }"
            />
          </div>
          <div class="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{{ project.completionPct }}% complete</span>
            <span>{{ project.completedTasks }}/{{ project.totalTasks }} tasks</span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="project.tags.length > 0" class="flex flex-wrap gap-1.5">
          <span
            v-for="tag in project.tags"
            :key="tag.id"
            class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── New project modal ── -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">

          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-5">New project</h2>

          <form @submit.prevent="handleCreate" class="flex flex-col gap-4">

            <!-- Name -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Name <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Project name"
                autofocus
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Description
              </label>
              <textarea
                v-model="form.description"
                placeholder="What's this project about?"
                rows="3"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <!-- Status + Due date -->
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</label>
                <select
                  v-model="form.status"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Due date</label>
                <input
                  v-model="form.due_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <!-- Error -->
            <p v-if="formError" class="text-xs text-red-400">{{ formError }}</p>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!form.name.trim() || creating"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ creating ? 'Creating...' : 'Create project' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Teleport>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useProjectsStore } from '../../stores/projectsStore'

const router = useRouter()
const projectsStore = useProjectsStore()

onMounted(() => projectsStore.fetchProjects())

const activeCount = computed(
  () => projectsStore.projects.filter(p => p.status === 'active').length
)

function statusStyle(status) {
  const map = {
    active:    'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    archived:  'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  }
  return map[status] ?? map.archived
}

function progressColor(status) {
  const map = {
    active:    'bg-blue-500',
    completed: 'bg-green-500',
    archived:  'bg-gray-400 dark:bg-gray-600',
  }
  return map[status] ?? map.archived
}

// ── New project modal ──
const showModal = ref(false)
const creating = ref(false)
const formError = ref('')
const defaultForm = () => ({ name: '', description: '', status: 'active', due_date: '' })
const form = ref(defaultForm())

function closeModal() {
  showModal.value = false
  form.value = defaultForm()
  formError.value = ''
}

async function handleCreate() {
  if (!form.value.name.trim()) return
  creating.value = true
  formError.value = ''

  const { error } = await projectsStore.createProject({
    name: form.value.name.trim(),
    description: form.value.description.trim() || null,
    status: form.value.status,
    due_date: form.value.due_date || null,
  })

  creating.value = false
  if (error) { formError.value = error.message; return }
  closeModal()
}
</script>
