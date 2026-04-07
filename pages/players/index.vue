<script setup lang="ts">
import {CalendarDate} from '@internationalized/date'
import {useRecordsStore} from '~/stores/records'
import {resolvePlayerServerAt} from '~/utils/recordPresentation'

const {t} = useI18n()
const {formatNumber, compareText} = useLocaleFormatting()
const store = useRecordsStore()
const search = ref('')
const serverFilters = ref<string[]>([])
const typeFilters = ref<string[]>([])
const sort = ref<'recent-desc' | 'recent-asc' | 'name-asc' | 'name-desc' | 'records-desc' | 'records-asc'>('records-desc')
const start = ref<string | undefined>()
const end = ref<string | undefined>()
const page = ref(1)
const topAnchor = ref<HTMLElement | null>(null)
const itemsPerPage = 24

const sortOptions = computed(() => [
  {label: t('player.sort.recordsDesc'), value: 'records-desc'},
  {label: t('player.sort.recordsAsc'), value: 'records-asc'},
  {label: t('player.sort.recentDesc'), value: 'recent-desc'},
  {label: t('player.sort.recentAsc'), value: 'recent-asc'},
  {label: t('player.sort.nameAsc'), value: 'name-asc'},
  {label: t('player.sort.nameDesc'), value: 'name-desc'}
] as const)

function toCalendarDate(value?: string) {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new CalendarDate(year, month, day)
}

const dateRange = computed({
  get() {
    const rangeStart = toCalendarDate(start.value)
    const rangeEnd = toCalendarDate(end.value)
    if (!rangeStart && !rangeEnd) return undefined
    return {start: rangeStart, end: rangeEnd}
  },
  set(value: { start?: CalendarDate; end?: CalendarDate } | undefined) {
    start.value = value?.start?.toString() || undefined
    end.value = value?.end?.toString() || undefined
  }
})

const playerMeta = computed(() => {
  const latestTypeMap: Record<string, Set<string>> = {}

  for (const record of store.records) {
    const senderKey = record.senderName.trim().toLowerCase()
    const receiverKey = record.receiverName.trim().toLowerCase()

    if (senderKey) {
      if (!latestTypeMap[senderKey]) latestTypeMap[senderKey] = new Set<string>()
      latestTypeMap[senderKey].add(record.type)
    }

    if (receiverKey) {
      if (!latestTypeMap[receiverKey]) latestTypeMap[receiverKey] = new Set<string>()
      latestTypeMap[receiverKey].add(record.type)
    }
  }

  return store.players.map((player) => {
    const key = player.name.trim().toLowerCase()
    const lastServer = resolvePlayerServerAt(store.records, player.name, player.lastSeen || 0)
    return {
      player,
      lastServer,
      types: [...(latestTypeMap[key] || new Set<string>())]
    }
  })
})

const serverOptions = computed(() =>
    [...new Set(playerMeta.value.map((entry) => entry.lastServer).filter(Boolean))].sort(compareText)
)

const typeOptions = computed(() =>
    [...new Set(store.records.map((record) => record.type).filter(Boolean))].sort(compareText)
)

const filteredPlayers = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  const startMs = start.value ? new Date(`${start.value}T00:00:00`).getTime() : undefined
  const endMs = end.value ? new Date(`${end.value}T23:59:59`).getTime() : undefined

  const rows = playerMeta.value.filter(({player, lastServer, types}) => {
    if (serverFilters.value.length && !serverFilters.value.includes(lastServer)) return false
    if (typeFilters.value.length && !typeFilters.value.some((type) => types.includes(type))) return false
    if (startMs && (player.lastSeen ?? 0) < startMs) return false
    if (endMs && (player.lastSeen ?? 0) > endMs) return false

    if (keyword) {
      const haystack = [
        player.name,
        player.uuid,
        ...player.prefixes,
        ...player.suffixes,
        lastServer,
        ...types
      ].join(' ').toLowerCase()

      if (!haystack.includes(keyword)) return false
    }

    return true
  })

  return [...rows].sort((a, b) => {
    switch (sort.value) {
      case 'records-asc':
        return a.player.totalRecords - b.player.totalRecords || compareText(a.player.name, b.player.name)
      case 'recent-desc':
        return (b.player.lastSeen || 0) - (a.player.lastSeen || 0) || compareText(a.player.name, b.player.name)
      case 'recent-asc':
        return (a.player.lastSeen || 0) - (b.player.lastSeen || 0) || compareText(a.player.name, b.player.name)
      case 'name-asc':
        return compareText(a.player.name, b.player.name)
      case 'name-desc':
        return compareText(b.player.name, a.player.name)
      case 'records-desc':
      default:
        return b.player.totalRecords - a.player.totalRecords || compareText(a.player.name, b.player.name)
    }
  })
})

const paginatedPlayers = computed(() => {
  const startIndex = (page.value - 1) * itemsPerPage
  return filteredPlayers.value.slice(startIndex, startIndex + itemsPerPage)
})

function scrollToTopAnchor() {
  if (!import.meta.client) return
  const top = topAnchor.value
      ? topAnchor.value.getBoundingClientRect().top + window.scrollY - 24
      : 0

  window.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth'
  })
}

watch(page, async (value, oldValue) => {
  if (value === oldValue) return
  await nextTick()
  scrollToTopAnchor()
})

watch([search, serverFilters, typeFilters, sort, start, end], () => {
  page.value = 1
}, {deep: true})

function clearFilters() {
  search.value = ''
  serverFilters.value = []
  typeFilters.value = []
  sort.value = 'records-desc'
  start.value = undefined
  end.value = undefined
  page.value = 1
}
</script>

<template>
  <div ref="topAnchor" class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-highlighted">{{ t('player.listTitle') }}</h1>
        <p class="mt-2 text-sm text-toned">{{ t('player.listDescription') }}</p>
      </div>
    </div>

    <UAlert
        v-if="!store.records.length"
        color="warning"
        variant="subtle"
        :title="t('player.emptyTitle')"
        :description="t('player.emptyDescription')"
    />

    <template v-else>
      <UCard>
        <div class="space-y-4">
          <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <UInput
                v-model="search"
                icon="i-lucide-search"
                :placeholder="t('player.searchPlaceholder')"
                size="lg"
            />
            <UButton color="primary" size="lg" icon="i-lucide-search">{{ t('common.search') }}</UButton>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <MultiSelectDropdown
                v-model="serverFilters"
                :label="t('player.lastServer')"
                :options="serverOptions"
                :placeholder="t('filters.allServers')"
                searchable
            />

            <MultiSelectDropdown
                v-model="typeFilters"
                :label="t('common.type')"
                :options="typeOptions"
                :placeholder="t('filters.allTypes')"
            />
          </div>

          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)_auto] lg:items-end">
            <div>
              <label class="mb-2 block text-xs font-medium text-muted">{{ t('player.timeRangeByLastSeen') }}</label>
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
                  v-model="sort"
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
                @click="clearFilters"
            >
              {{ t('filters.reset') }}
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="flex flex-col gap-3 border-y border-default py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-muted">{{
            t('player.showingCount', {
              shown: formatNumber(filteredPlayers.length),
              total: formatNumber(playerMeta.length)
            })
          }}
        </div>
        <UPagination
            v-model:page="page"
            :total="filteredPlayers.length"
            :items-per-page="itemsPerPage"
            show-edges
            active-color="primary"
            active-variant="solid"
        />
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PlayerCard v-for="entry in paginatedPlayers" :key="entry.player.name" :player="entry.player"/>
      </div>

      <div class="flex flex-col gap-3 border-t border-default pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-muted">{{
            t('player.showingCount', {
              shown: formatNumber(filteredPlayers.length),
              total: formatNumber(playerMeta.length)
            })
          }}
        </div>
        <UPagination
            v-model:page="page"
            :total="filteredPlayers.length"
            :items-per-page="itemsPerPage"
            show-edges
            active-color="primary"
            active-variant="solid"
        />
      </div>
    </template>
  </div>
</template>
