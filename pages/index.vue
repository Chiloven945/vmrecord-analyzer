<script setup lang="ts">
import {useRecordsStore} from '~/stores/records'
import {useCsvImport} from '~/composables/useCsvImport'

const store = useRecordsStore()
const {loading, error, importFile} = useCsvImport()

async function onFile(file: File) {
  const records = await importFile(file)
  store.setRecords(records, file.name)
}

const topServers = computed(() =>
    Object.entries(store.stats.serverCounts)
        .map(([label, value]) => ({label, value}))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
)

const typeDistribution = computed(() =>
    Object.entries(store.stats.typeCounts)
        .map(([label, value]) => ({label, value}))
        .sort((a, b) => b.value - a.value)
)

const latestRecords = computed(() => store.records.slice(-6).reverse())
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-sm text-primary">vMessageRecord Analyzer</p>
        <h1 class="mt-2 text-3xl font-semibold text-highlighted lg:text-4xl">本地分析 Minecraft Velocity 聊天记录</h1>
        <p class="mt-3 max-w-3xl text-sm leading-6 text-toned">
          导入 CSV 后查看总览、玩家画像、双人私聊、单人时间线、记录筛选与关键词高亮。
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3 text-sm text-toned">
        <span v-if="store.sourceFileName">当前文件：{{ store.sourceFileName }}</span>
        <span v-if="store.importedAt">共 {{ store.records.length }} 条</span>
        <UButton v-if="store.records.length" color="neutral" variant="outline" icon="i-lucide-trash-2"
                 @click="store.clearRecords()">
          清空数据
        </UButton>
      </div>
    </div>

    <CsvUploader :loading="loading" @file="onFile"/>

    <UAlert v-if="error" color="error" variant="subtle" title="导入失败" :description="error"/>

    <template v-if="store.records.length">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="总记录数" :value="store.stats.total" icon="i-lucide-chart-column"/>
        <StatCard title="公聊" :value="store.stats.chat" icon="i-lucide-message-square"/>
        <StatCard title="私聊" :value="store.stats.privateMessage" icon="i-lucide-messages-square"/>
        <StatCard title="活跃玩家" :value="store.stats.activePlayers" icon="i-lucide-users"/>
      </div>

      <div class="grid gap-6 xl:grid-cols-3">
        <SectionCard title="服务器分布" description="按 server 聚合记录数">
          <DistributionBars :items="topServers" empty-text="暂无服务器数据"/>
        </SectionCard>

        <SectionCard title="类型分布" description="CHAT / PRIVATE_MESSAGE / JOIN / LEAVE / TRANSFER">
          <DistributionBars :items="typeDistribution" empty-text="暂无类型数据"/>
        </SectionCard>

        <SectionCard title="热门私聊组合" description="按私聊消息量排序">
          <div v-if="store.topConversations.length" class="space-y-3">
            <NuxtLink
                v-for="item in store.topConversations.slice(0, 8)"
                :key="item.key"
                :to="`/conversations/${encodeURIComponent(item.key)}`"
                class="flex items-center justify-between gap-4 rounded-xl border border-default bg-elevated px-3 py-2.5 text-sm hover:ring-1 hover:ring-primary/15"
            >
              <span class="truncate text-highlighted">{{ item.key.replace('::', ' ↔ ') }}</span>
              <UBadge color="secondary" variant="subtle">{{ item.count }}</UBadge>
            </NuxtLink>
          </div>
          <div v-else class="py-6 text-sm text-muted">暂无私聊会话</div>
        </SectionCard>
      </div>

      <SectionCard title="最近记录" description="按时间倒序展示最近 6 条">
        <div class="space-y-3">
          <RecordRow v-for="record in latestRecords" :key="record.id" :record="record"/>
        </div>
      </SectionCard>
    </template>
  </div>
</template>
