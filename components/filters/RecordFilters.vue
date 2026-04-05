<script setup lang="ts">
import {CalendarDate} from '@internationalized/date'
import type {SelectItem} from '@nuxt/ui'
import type {NormalizedRecord, RecordFilterState} from '~/types/record'

const model = defineModel<RecordFilterState>({required: true})
const props = defineProps<{
  records: NormalizedRecord[]
}>()

const typeOptions = computed(() =>
    [...new Set(props.records.map((r) => r.type).filter(Boolean))].sort()
)

const serverOptions = computed(() =>
    [...new Set(props.records.map((r) => r.server).filter(Boolean))].sort()
)

const playerOptions = computed(() => {
  const names = new Set<string>()
  for (const record of props.records) {
    if (record.senderName) names.add(record.senderName)
    if (record.receiverName) names.add(record.receiverName)
  }
  return [...names].sort()
})

const localQuery = ref(model.value.q)

watch(() => model.value.q, (value) => {
  localQuery.value = value
})

function toCalendarDate(value?: string) {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new CalendarDate(year, month, day)
}

const dateRange = computed({
  get() {
    const start = toCalendarDate(model.value.start)
    const end = toCalendarDate(model.value.end)
    if (!start && !end) return undefined
    return {start, end}
  },
  set(value: { start?: CalendarDate; end?: CalendarDate } | undefined) {
    model.value.start = value?.start?.toString() || undefined
    model.value.end = value?.end?.toString() || undefined
  }
})

const sortOptions = [
  {label: '时间（最新在前）', value: 'time-desc'},
  {label: '时间（最早在前）', value: 'time-asc'},
  {label: '玩家（A-Z）', value: 'player-asc'},
  {label: '玩家（Z-A）', value: 'player-desc'},
  {label: '服务器（A-Z）', value: 'server-asc'},
  {label: '服务器（Z-A）', value: 'server-desc'}
] satisfies SelectItem[]

function applySearch() {
  model.value.q = localQuery.value
}

function clear() {
  localQuery.value = ''
  model.value.q = ''
  model.value.types = []
  model.value.servers = []
  model.value.players = []
  model.value.start = undefined
  model.value.end = undefined
  model.value.sort = 'time-desc'
}
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <UInput
            v-model="localQuery"
            icon="i-lucide-search"
            size="lg"
            placeholder="消息 / 玩家 / 指令 / 服务器"
            @keydown.enter="applySearch"
        />

        <UButton
            color="primary"
            size="lg"
            icon="i-lucide-search"
            class="justify-center"
            @click="applySearch"
        >
          搜索
        </UButton>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <MultiSelectDropdown
            v-model="model.types"
            label="类型"
            :options="typeOptions"
            placeholder="全部类型"
        />

        <MultiSelectDropdown
            v-model="model.servers"
            label="服务器"
            :options="serverOptions"
            placeholder="全部服务器"
        />

        <MultiSelectDropdown
            v-model="model.players"
            label="玩家"
            :options="playerOptions"
            placeholder="全部玩家"
            searchable
        />
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)_auto] lg:items-end">
        <div>
          <label class="mb-2 block text-xs font-medium text-muted">日期范围</label>
          <UInputDate
              v-model="dateRange"
              range
              size="lg"
              variant="outline"
              separator-icon="i-lucide-arrow-right"
              class="w-full"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-medium text-muted">排序方式</label>
          <USelect
              v-model="model.sort"
              :items="sortOptions"
              value-key="value"
              size="lg"
              class="w-full"
          />
        </div>

        <UButton
            color="neutral"
            variant="outline"
            size="lg"
            icon="i-lucide-rotate-ccw"
            class="justify-center"
            @click="clear"
        >
          重置筛选
        </UButton>
      </div>
    </div>
  </UCard>
</template>
