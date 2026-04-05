<script setup lang="ts">
import type {NormalizedRecord} from '~/types/record'
import {useRecordsStore} from '~/stores/records'
import {useRecordFilters} from '~/composables/useRecordFilters'

const store = useRecordsStore()
const {filters, filtered, reset} = useRecordFilters(computed(() => store.records))

const page = ref(1)
const itemsPerPage = 50
const selectedRecord = ref<NormalizedRecord | null>(null)

const paginatedRecords = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.value.slice(start, end)
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
  <div class="space-y-6">
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
