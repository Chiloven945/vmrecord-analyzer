<script setup lang="ts">
const model = defineModel<string[]>({required: true})

const props = withDefaults(defineProps<{
  label: string
  options: string[]
  placeholder?: string
  searchable?: boolean
  emptyText?: string
}>(), {
  placeholder: '全部',
  searchable: false,
  emptyText: '没有可选项'
})

const query = ref('')

const filteredOptions = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return props.options
  return props.options.filter((option) => option.toLowerCase().includes(keyword))
})

const buttonText = computed(() => {
  const selected = model.value
  if (!selected.length) return props.placeholder
  if (selected.length === 1) return selected[0]
  if (selected.length === 2) return `${selected[0]}、${selected[1]}`
  return `${selected[0]} 等 ${selected.length} 项`
})

function isSelected(option: string) {
  return model.value.includes(option)
}

function toggle(option: string) {
  if (isSelected(option)) {
    model.value = model.value.filter((item) => item !== option)
    return
  }
  model.value = [...model.value, option]
}

function clearSelection() {
  model.value = []
}

function selectFiltered() {
  const set = new Set(model.value)
  for (const option of filteredOptions.value) {
    set.add(option)
  }
  model.value = [...set]
}
</script>

<template>
  <div>
    <label class="mb-2 block text-xs font-medium text-muted">{{ label }}</label>

    <UPopover>
      <UButton
          color="neutral"
          variant="outline"
          class="w-full justify-between rounded-[calc(var(--ui-radius)*0.9)] px-3 py-2.5"
          :ui="{
          base: 'w-full justify-between',
          label: 'truncate text-left',
          trailingIcon: 'shrink-0'
        }"
          trailing-icon="i-lucide-chevron-down"
      >
        <span class="truncate text-left">{{ buttonText }}</span>

        <template #trailing>
          <div class="ml-2 flex items-center gap-2">
            <UBadge v-if="model.length" color="primary" variant="soft" size="sm">
              {{ model.length }}
            </UBadge>
            <UIcon name="i-lucide-chevron-down" class="size-4 text-muted"/>
          </div>
        </template>
      </UButton>

      <template #content>
        <div class="w-80 max-w-[min(90vw,20rem)] rounded-xl bg-default p-3 shadow-lg ring ring-default">
          <div class="mb-3 flex items-center justify-between gap-2">
            <div class="text-sm font-medium text-highlighted">{{ label }}</div>
            <div class="flex items-center gap-2">
              <UButton color="neutral" variant="ghost" size="xs" @click="selectFiltered">
                全选
              </UButton>
              <UButton color="neutral" variant="ghost" size="xs" @click="clearSelection">
                清空
              </UButton>
            </div>
          </div>

          <UInput
              v-if="searchable"
              v-model="query"
              icon="i-lucide-search"
              size="sm"
              :placeholder="`搜索${label}`"
              class="mb-3"
          />

          <div class="max-h-64 space-y-1 overflow-y-auto pr-1">
            <label
                v-for="option in filteredOptions"
                :key="option"
                class="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-elevated"
            >
              <UCheckbox :model-value="isSelected(option)" @update:model-value="toggle(option)"/>
              <span class="min-w-0 flex-1 truncate text-sm text-toned">{{ option }}</span>
            </label>

            <div v-if="!filteredOptions.length" class="rounded-lg px-2 py-6 text-center text-sm text-muted">
              {{ emptyText }}
            </div>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
