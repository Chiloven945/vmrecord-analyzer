<script setup lang="ts">
import {CalendarDate} from '@internationalized/date'
import {useRecordsStore} from '~/stores/records'
import {resolvePlayerServerAt} from '~/utils/recordPresentation'

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

const sortOptions = [
  {label: '总记录（高到低）', value: 'records-desc'},
  {label: '总记录（低到高）', value: 'records-asc'},
  {label: '最近活动（最新在前）', value: 'recent-desc'},
  {label: '最近活动（最早在前）', value: 'recent-asc'},
  {label: '玩家名称（A-Z）', value: 'name-asc'},
  {label: '玩家名称（Z-A）', value: 'name-desc'}
] as const

function compareText(a: string, b: string) {
  return a.localeCompare(b, 'zh-Hans-CN', {numeric: true, sensitivity: 'base'})
}

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
        <h1 class="text-3xl font-semibold text-highlighted">玩家列表</h1>
        <p class="mt-2 text-sm text-toned">按总记录数排序，支持按最后服务器、时间、类型和关键字筛选。</p>
      </div>
    </div>

    <UAlert
        v-if="!store.records.length"
        color="warning"
        variant="subtle"
        title="还没有导入记录"
        description="先去总览页导入 CSV，再回来查看玩家画像。"
    />

    <template v-else>
      <UCard>
        <div class="space-y-4">
          <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <UInput
                v-model="search"
                icon="i-lucide-search"
                placeholder="搜索玩家名 / UUID / 前后缀 / 最后服务器 / 类型"
                size="lg"
            />
            <UButton color="primary" size="lg" icon="i-lucide-search">搜索</UButton>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <MultiSelectDropdown
                v-model="serverFilters"
                label="最后服务器"
                :options="serverOptions"
                placeholder="全部服务器"
                searchable
            />

            <MultiSelectDropdown
                v-model="typeFilters"
                label="类型"
                :options="typeOptions"
                placeholder="全部类型"
            />
          </div>

          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)_auto] lg:items-end">
            <div>
              <label class="mb-2 block text-xs font-medium text-muted">时间范围（按最后出现）</label>
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
              重置筛选
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-muted">当前显示 {{ filteredPlayers.length }} / {{ playerMeta.length }} 名玩家</div>
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
    </template>
  </div>
</template>
