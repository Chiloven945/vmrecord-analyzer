<script setup lang="ts">
import {useRecordsStore} from '~/stores/records'

const store = useRecordsStore()
const q = ref('')

const filteredPlayers = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  if (!keyword) return store.players
  return store.players.filter((player) => {
    return [player.name, player.uuid, ...player.prefixes, ...player.suffixes].join(' ').toLowerCase().includes(keyword)
  })
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-highlighted">玩家列表</h1>
        <p class="mt-2 text-sm text-toned">按总记录数排序，支持跳转到玩家画像页。</p>
      </div>
      <div class="w-full max-w-md">
        <UInput v-model="q" icon="i-lucide-search" placeholder="搜索玩家名 / UUID / 前后缀" size="lg"/>
      </div>
    </div>

    <UAlert
        v-if="!store.records.length"
        color="warning"
        variant="subtle"
        title="还没有导入记录"
        description="先去总览页导入 CSV，再回来查看玩家画像。"
    />

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <PlayerCard v-for="player in filteredPlayers" :key="player.name" :player="player"/>
    </div>
  </div>
</template>
