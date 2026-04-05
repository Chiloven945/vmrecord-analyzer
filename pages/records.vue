<script setup lang="ts">
import {useRecordsStore} from '~/stores/records'
import {useRecordFilters} from '~/composables/useRecordFilters'

const store = useRecordsStore()
const {filters, filtered, reset} = useRecordFilters(computed(() => store.records))
const visibleCount = ref(100)

const visibleRecords = computed(() => filtered.value.slice(0, visibleCount.value))

watch(filtered, () => {
  visibleCount.value = 100
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-highlighted">记录浏览</h1>
        <p class="mt-2 text-sm text-toned">当前显示 {{ filtered.length }} / {{ store.records.length }} 条记录</p>
      </div>
      <div class="flex gap-3">
        <UButton color="neutral" variant="outline" icon="i-lucide-rotate-ccw" @click="reset">重置</UButton>
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
        <RecordRow v-for="record in visibleRecords" :key="record.id" :record="record" :keyword="filters.q"/>
      </div>

      <div v-if="visibleRecords.length < filtered.length" class="flex justify-center">
        <UButton color="neutral" variant="outline" icon="i-lucide-chevrons-down" @click="visibleCount += 100">
          加载更多 ({{ visibleRecords.length }}/{{ filtered.length }})
        </UButton>
      </div>
    </template>
  </div>
</template>
