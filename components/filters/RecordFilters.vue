<script setup lang="ts">
import {CalendarDate} from '@internationalized/date'
import type {SelectItem} from '@nuxt/ui'
import type {NormalizedRecord, RecordFilterState} from '~/types/record'

const {t} = useI18n()

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

const sortOptions = computed(() => [
  {label: t('filters.sort.timeDesc'), value: 'time-desc'},
  {label: t('filters.sort.timeAsc'), value: 'time-asc'},
  {label: t('filters.sort.playerAsc'), value: 'player-asc'},
  {label: t('filters.sort.playerDesc'), value: 'player-desc'},
  {label: t('filters.sort.serverAsc'), value: 'server-asc'},
  {label: t('filters.sort.serverDesc'), value: 'server-desc'}
] satisfies SelectItem[])

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
            :placeholder="t('filters.searchPlaceholder')"
            @keydown.enter="applySearch"
        />

        <UButton
            color="primary"
            size="lg"
            icon="i-lucide-search"
            class="justify-center"
            @click="applySearch"
        >
          {{ t('common.search') }}
        </UButton>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <MultiSelectDropdown
            v-model="model.types"
            :label="t('filters.type')"
            :options="typeOptions"
            :placeholder="t('filters.allTypes')"
        />

        <MultiSelectDropdown
            v-model="model.servers"
            :label="t('filters.server')"
            :options="serverOptions"
            :placeholder="t('filters.allServers')"
        />

        <MultiSelectDropdown
            v-model="model.players"
            :label="t('filters.player')"
            :options="playerOptions"
            :placeholder="t('filters.allPlayers')"
            searchable
        />
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)_auto] lg:items-end">
        <div>
          <label class="mb-2 block text-xs font-medium text-muted">{{ t('filters.dateRange') }}</label>
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
          <label class="mb-2 block text-xs font-medium text-muted">{{ t('filters.sortLabel') }}</label>
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
          {{ t('filters.reset') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>
