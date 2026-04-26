<template>
  <AppLayout>
    <div class="px-4 md:px-8 py-4 md:py-8 flex flex-col h-full">

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
          <button
            v-if="activeTab === 'tasks'"
            @click="openTaskModal()"
            class="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <i class="pi pi-plus" />
            Add new task
          </button>
        </div>

        <!-- ── Tasks tab ── -->
        <div v-if="activeTab === 'tasks'" class="flex-1 min-h-0 flex flex-col">

          <!-- ── Mobile filter bar ── -->
          <div v-if="isMobile" class="pb-3 flex flex-col gap-2">
            <div class="flex gap-2">
              <input
                v-model="filters['global'].value"
                type="search"
                placeholder="Search tasks..."
                class="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                @click="showFilterSheet = 'sort'"
                class="flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors shrink-0"
                :class="mobileSortField
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <line x1="1" y1="3" x2="13" y2="3"/>
                  <line x1="3" y1="7" x2="11" y2="7"/>
                  <line x1="5" y1="11" x2="9" y2="11"/>
                </svg>
                {{ mobileSortField === 'due_date' ? 'Date' : mobileSortField === 'priority' ? 'Priority' : 'Sort' }}
                <span v-if="mobileSortField">{{ mobileSortDir === 'asc' ? '↑' : '↓' }}</span>
              </button>
              <button
                @click="showFilterSheet = 'filter'"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors shrink-0"
                :class="activeFilterCount > 0
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <path d="M1 2h12l-4.5 5.5V12L5.5 10V7.5L1 2z"/>
                </svg>
                Filter
                <span
                  v-if="activeFilterCount > 0"
                  class="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-semibold"
                >{{ activeFilterCount }}</span>
              </button>
            </div>

            <!-- Active filter chips -->
            <div v-if="activeFilterCount > 0" class="flex flex-wrap gap-1.5">
              <span v-for="p in mobilePriority" :key="'p-' + p"
                class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {{ p }}
                <button @click="toggleFilter(mobilePriority, p)" class="opacity-60 hover:opacity-100">×</button>
              </span>
              <span v-for="s in mobileStatus" :key="'s-' + s"
                class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {{ s.replace('_', ' ') }}
                <button @click="toggleFilter(mobileStatus, s)" class="opacity-60 hover:opacity-100">×</button>
              </span>
              <button @click="clearMobileFilters"
                class="px-2.5 py-1 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >Clear all</button>
            </div>
          </div>

          <!-- Mobile card list -->
          <div v-if="isMobile" class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
            <div
                v-for="task in filteredTasks"
                :key="task.id"
                class="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
            >
              <!-- Checkbox -->
              <button
                  @click="store.toggleTaskComplete(task)"
                  class="mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors"
                  :class="task.status === 'completed'
          ? 'bg-blue-500 border-blue-500'
          : 'border-gray-300 dark:border-gray-600'"
              >
                <svg v-if="task.status === 'completed'" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <!-- Content — tapping here opens the edit modal -->
              <div class="flex-1 min-w-0" @click="openTaskModal(task)">
                <p
                    class="text-sm font-medium leading-snug"
                    :class="task.status === 'completed'
            ? 'line-through text-gray-400 dark:text-gray-500'
            : 'text-gray-900 dark:text-white'"
                >
                  {{ task.title }}
                </p>
                <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span class="text-xs font-medium px-2 py-0.5 rounded" :class="priorityClass(task.priority)">
            {{ task.priority }}
          </span>
                  <span class="text-xs font-medium px-2 py-0.5 rounded" :class="statusClass(task.status)">
            {{ task.status.replace('_', ' ') }}
          </span>
                  <span
                      v-if="task.due_date"
                      class="text-xs"
                      :class="task.status !== 'completed' && isOverdue(task.due_date) ? 'text-red-400' : 'text-gray-400'"
                  >
            {{ formatDate(task.due_date) }}
          </span>
                </div>
              </div>
            </div>

            <div v-if="filteredTasks.length === 0" class="py-12 text-center text-sm text-gray-400">
              {{ activeFilterCount > 0 || filters['global'].value
                ? 'No tasks match your filters.'
                : 'No tasks yet — add one to get started.' }}
            </div>
          </div>

          <!--Desktop datatable-->
          <div v-else class="flex-1 min-h-0">
            <DataTable
              v-model:filters="filters"
              :value="sortedTasks"
              sort-mode="single"
              class="h-full"
              scrollable
              scrollHeight="flex"
              filterDisplay="menu"
              :globalFilterFields="['title', 'priority', 'status']"
              :sort-field="sortField"
              :sort-order="sortOrder"
              @sort="handleSort"
              @row-click="openTaskModal($event.data)"
            >
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
              <!-- Checkbox -->
              <Column style="width: 3rem">
                <template #body="{ data }">
                  <button
                    @click.stop="store.toggleTaskComplete(data)"
                    class="w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0"
                    :class="data.status === 'completed'
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'"
                  >
                    <svg v-if="data.status === 'completed'" width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </template>
              </Column>

              <!-- Title -->
              <Column field="title" header="Task">

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

              <!-- Priority -->
              <Column field="priority" header="Priority" :showFilterMatchModes="false">
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="priorityOptions"
                    placeholder="Any"
                  />
                </template>
                <template #body="{ data }">
                  <span class="text-xs font-medium px-2 py-0.5 rounded" :class="priorityClass(data.priority)">
                    {{ data.priority }}
                  </span>
                </template>
              </Column>

              <!-- Status -->
              <Column field="status" header="Status" :showFilterMatchModes="false">
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="statusOptions"
                    placeholder="Any"
                    :maxSelectedLabels="1"
                  />
                </template>
                <template #body="{ data }">
                  <span class="text-xs font-medium px-2 py-0.5 rounded" :class="statusClass(data.status)">
                    {{ data.status.replace('_', ' ') }}
                  </span>
                </template>
              </Column>

              <!-- Due date -->
              <Column field="due_date" header="Due date" sortable >
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

              <!-- Empty state -->
              <template #empty>
                <div class="px-4 py-8 text-center text-sm text-gray-400">
                  No tasks yet — add one to get started.
                </div>
              </template>
            </DataTable>
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

    <!-- ── Task modal (create & edit) ── -->
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
                :disabled="!taskForm.title.trim()"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

              >
                <i class="pi pi-save" />
                {{ taskSaving ? 'Saving...' : (taskModal.task ? 'Save changes' : 'Add task')}}
              </button>
            </div>

          </form>
        </div>
      </div>
      <!-- ── Mobile filter/sort sheet ── -->
      <div
          v-if="showFilterSheet && isMobile"
          class="fixed inset-0 z-40 bg-black/40"
          @click="showFilterSheet = null"
      />
      <div
          v-if="showFilterSheet && isMobile"
          class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl border-t border-gray-100 dark:border-gray-800 shadow-xl"
      >
        <!-- Handle -->
        <div class="flex justify-center pt-3 pb-1">
          <div class="w-8 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <!-- Sort sheet -->
        <div v-if="showFilterSheet === 'sort'" class="p-4 pb-20">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Sort by</h3>
            <button
                v-if="mobileSortField"
                @click="mobileSortField = ''; mobileSortDir = 'asc'"
                class="text-xs text-red-500"
            >Clear</button>
          </div>
          <div class="flex flex-col gap-2">
            <button
                v-for="option in sortOptions"
                :key="option.value"
                @click="toggleSort(option.value)"
                class="flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
                :class="mobileSortField === option.value
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'"
            >
              <span class="text-sm font-medium">{{ option.label }}</span>
              <span v-if="mobileSortField === option.value" class="text-xs font-medium">
          {{ mobileSortDir === 'asc' ? '↑ Ascending' : '↓ Descending' }}
        </span>
            </button>
          </div>
        </div>

        <!-- Filter sheet -->
        <div v-else-if="showFilterSheet === 'filter'" class="p-4 pb-20 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Filter</h3>
            <button
                v-if="activeFilterCount > 0"
                @click="clearMobileFilters"
                class="text-xs text-red-500"
            >Clear all</button>
          </div>
          <!-- Priority -->
          <div>
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Priority</p>
            <div class="flex flex-wrap gap-2">
              <button
                  v-for="p in priorityOptions"
                  :key="p"
                  @click="toggleFilter(mobilePriority, p)"
                  class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                  :class="mobilePriority.includes(p)
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <!-- Status -->
          <div>
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Status</p>
            <div class="flex flex-wrap gap-2">
              <button
                  v-for="s in statusOptions"
                  :key="s"
                  @click="toggleFilter(mobileStatus, s)"
                  class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                  :class="mobileStatus.includes(s)
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'"
              >
                {{ s.replace('_', ' ') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppLayout from '../../components/AppLayout.vue'
import { useProjectDetailStore } from '../../stores/projectDetailStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { FilterMatchMode } from '@primevue/core/api'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import {useBreakpoint} from "../../composables/useBreakpoint.js";
const {isMobile} = useBreakpoint()

const route = useRoute()
const store = useProjectDetailStore()

onMounted(() => store.fetchProject(route.params.id))

// ── Tabs ──
const activeTab = ref('tasks')
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
const sortField     = ref(null)
const sortDirection = ref('desc')
const sortOrder     = computed(() => sortDirection.value === 'asc' ? 1 : -1)

const filters = ref({
  global:   { value: null, matchMode: FilterMatchMode.CONTAINS },
  title:    { value: null, matchMode: FilterMatchMode.CONTAINS },
  priority: { value: null, matchMode: FilterMatchMode.IN },
  status:   { value: null, matchMode: FilterMatchMode.IN },
})

const priorityOptions = ['low', 'medium', 'high', 'urgent']
const statusOptions   = ['not_started', 'in_progress', 'completed']

const PRIORITY_ORDER = { urgent: 4, high: 3, medium: 2, low: 1 }
const STATUS_ORDER   = { not_started: 1, in_progress: 2, completed: 3 }

const showFilterSheet  = ref(null)        // null | 'sort' | 'filter'
const mobileSortField  = ref('')          // '' | 'due_date' | 'priority'
const mobileSortDir    = ref('asc')       // 'asc' | 'desc'
const mobilePriority   = ref([])          // e.g. ['high', 'urgent']
const mobileStatus     = ref([])          // e.g. ['not_started']

const sortOptions = [
  { label: 'Due date', value: 'due_date' },
  { label: 'Priority', value: 'priority' },
]

const activeFilterCount = computed(() =>
    mobilePriority.value.length + mobileStatus.value.length
)


function handleSort(event) {
  sortField.value     = event.sortField
  sortDirection.value = event.sortOrder === 1 ? 'asc' : 'desc'
}

const filteredTasks = computed(() => {
  let tasks = [...store.tasks]

  const q = filters.value['global'].value?.toLowerCase() ?? ''
  if (q)
    tasks = tasks.filter(t => t.title?.toLowerCase().includes(q))

  if (mobilePriority.value.length > 0)
    tasks = tasks.filter(t => mobilePriority.value.includes(t.priority))

  if (mobileStatus.value.length > 0)
    tasks = tasks.filter(t => mobileStatus.value.includes(t.status))

  if (mobileSortField.value) {
    const dir = mobileSortDir.value === 'asc' ? 1 : -1
    tasks.sort((a, b) => {
      if (mobileSortField.value === 'priority')
        return ((PRIORITY_ORDER[a.priority] ?? 0) - (PRIORITY_ORDER[b.priority] ?? 0)) * dir
      if (mobileSortField.value === 'due_date') {
        const aD = a.due_date ? new Date(a.due_date).getTime() : Infinity
        const bD = b.due_date ? new Date(b.due_date).getTime() : Infinity
        return (aD - bD) * dir
      }
      return 0
    })
  }

  return tasks
})

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

// ── Date helpers ──
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

const taskSaving = ref(false)

// ── Task modal ──
const taskModal = ref({ open: false, task: null })
const taskForm  = ref({ title: '', priority: '', status: '', due_date: '', description: '', note: '' })

function openTaskModal(task = null) {
  taskModal.value = { open: true, task }
  taskForm.value = task
    ? { title: task.title, priority: task.priority, status: task.status, due_date: task.due_date ?? '', description: task.description ?? '', note: task.note ?? '' }
    : { title: '', priority: '', status: '', due_date: '', description: '', note: '' }
}

async function submitTaskModal() {
  if (!taskForm.value.title.trim()) return
  const payload = {
    title:       taskForm.value.title.trim(),
    priority:    taskForm.value.priority,
    status:      taskForm.value.status,
    due_date:    taskForm.value.due_date || null,
    description: taskForm.value.description.trim() || null,
    note:        taskForm.value.note.trim() || null,
  }
  taskSaving.value = true
  try {
    if (taskModal.value.task) {
      await store.updateTask(taskModal.value.task.id, payload)
    } else {
      await store.addTask(payload)
    }
    taskModal.value = { open: false, task: null }
  }
  finally{
    taskSaving.value = false
  }

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

// ── Available tags (not yet on this project) ──
const availableTags = computed(() =>
  store.allUserTags.filter(t => !store.projectTags.find(pt => pt.id === t.id))
)

function toggleFilter(arr, value) {
  const idx = arr.indexOf(value)
  if (idx === -1) arr.push(value)
  else arr.splice(idx, 1)
}

function toggleSort(field) {
  if (mobileSortField.value === field) {
    if (mobileSortDir.value === 'asc') mobileSortDir.value = 'desc'
    else { mobileSortField.value = ''; mobileSortDir.value = 'asc' }
  } else {
    mobileSortField.value = field
    mobileSortDir.value = 'asc'
  }
}

function clearMobileFilters() {
  mobilePriority.value = []
  mobileStatus.value   = []
}

</script>
