<script setup lang="ts">
import type {NormalizedRecord, RecordFilterState} from '~/types/record'
import {useRecordsStore} from '~/stores/records'
import {useRecordFilters} from '~/composables/useRecordFilters'

const store = useRecordsStore()
const route = useRoute()
const router = useRouter()
const {filters, filtered, reset} = useRecordFilters(computed(() => store.records))

const page = ref(1)
const topAnchor = ref<HTMLElement | null>(null)
const itemsPerPage = 50
const selectedRecord = ref<NormalizedRecord | null>(null)
const applyingRoute = ref(false)

function readStringParam(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '')
  return typeof value === 'string' ? value : ''
}

function readArrayParam(value: unknown) {
  const text = readStringParam(value)
  return text ? text.split(',').map((item) => item.trim()).filter(Boolean) : []
}

function applyQueryToFilters(query: Record<string, unknown>) {
  applyingRoute.value = true
  filters.q = readStringParam(query.q)
  filters.types = readArrayParam(query.type)
  filters.servers = readArrayParam(query.server)
  filters.players = readArrayParam(query.player)
  filters.start = readStringParam(query.start) || undefined
  filters.end = readStringParam(query.end) || undefined
  filters.sort = (readStringParam(query.sort) || 'time-desc') as RecordFilterState['sort']
  page.value = 1
  nextTick(() => {
    applyingRoute.value = false
  })
}

function buildQueryFromFilters() {
  const query: Record<string, string> = {}
  if (filters.q.trim()) query.q = filters.q.trim()
  if (filters.types.length) query.type = filters.types.join(',')
  if (filters.servers.length) query.server = filters.servers.join(',')
  if (filters.players.length) query.player = filters.players.join(',')
  if (filters.start) query.start = filters.start
  if (filters.end) query.end = filters.end
  if (filters.sort !== 'time-desc') query.sort = filters.sort
  return query
}

watch(
    () => route.query,
    (query) => {
      applyQueryToFilters(query as Record<string, unknown>)
    },
    {immediate: true}
)

watch(
    filters,
    () => {
      if (applyingRoute.value) return
      router.replace({query: buildQueryFromFilters()})
    },
    {deep: true}
)

const paginatedRecords = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.value.slice(start, end)
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

watch(filtered, () => {
  page.value = 1
})

function openRecord(record: NormalizedRecord) {
  selectedRecord.value = record
}

function closeRecord() {
  selectedRecord.value = null
}
</script>

<template>
  <div ref="topAnchor" class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-highlighted">记录浏览</h1>
        <p class="mt-2 text-sm text-toned">当前显示 {{ filtered.length }} / {{ store.records.length }} 条记录</p>
      </div>
      <div class="flex gap-3">
        <UButton to="/" color="primary" variant="soft" icon="i-lucide-upload">重新导入</UButton>
      </div>
    </div>

    <UAlert
        v-if="!store.records.length"
        color="warning"
        variant="subtle"
        title="还没有导入记录"
        description="先回到总览页导入一个 vMessageRecord CSV 文件。"
    />

    <template v-else>
      <RecordFilters v-model="filters" :records="store.records"/>

      <div class="space-y-3">
        <RecordRow
            v-for="record in paginatedRecords"
            :key="record.id"
            :record="record"
            :keyword="filters.q"
            @select="openRecord"
        />
      </div>

      <div class="flex flex-col gap-3 border-t border-default pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-muted">
          第 {{ filtered.length ? (page - 1) * itemsPerPage + 1 : 0 }} -
          {{ Math.min(page * itemsPerPage, filtered.length) }} 条，
          共 {{ filtered.length }} 条
        </div>

        <div class="flex items-center gap-3">
          <UButton color="neutral" variant="ghost" icon="i-lucide-rotate-ccw" @click="reset">
            重置
          </UButton>

          <UPagination
              v-model:page="page"
              :total="filtered.length"
              :items-per-page="itemsPerPage"
              show-edges
              active-color="primary"
              active-variant="solid"
          />
        </div>
      </div>
    </template>

    <RecordDetailDialog :open="!!selectedRecord" :record="selectedRecord" @close="closeRecord"/>
  </div>
</template>
