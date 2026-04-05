<script setup lang="ts">
import dayjs from 'dayjs'
import {useRecordsStore} from '~/stores/records'

const store = useRecordsStore()

const servers = computed(() => store.servers)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-highlighted">服务器</h1>
        <p class="mt-2 text-sm text-toned">查看各个服务器的活跃度、消息量、加入离开次数与活跃玩家。</p>
      </div>
      <UButton to="/" color="primary" variant="soft" icon="i-lucide-layout-dashboard">返回总览</UButton>
    </div>

    <UAlert
        v-if="!store.records.length"
        color="warning"
        variant="subtle"
        title="还没有导入记录"
        description="先回到总览页导入一个 vMessageRecord CSV 文件。"
    />

    <div v-else class="space-y-3">
      <NuxtLink
          v-for="server in servers"
          :key="server.name"
          :to="`/servers/${encodeURIComponent(server.name)}`"
          class="block"
      >
        <UCard class="transition hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/20">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-xl font-semibold text-highlighted">{{ server.name }}</h2>
                <UBadge color="info" variant="subtle">{{ Object.keys(server.players).length }} 人</UBadge>
              </div>
              <p class="mt-2 text-sm text-toned">
                最后活动：{{ server.lastSeen ? dayjs(server.lastSeen).format('YYYY-MM-DD HH:mm:ss') : '-' }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">总记录</div>
                <div class="mt-1 font-semibold text-highlighted">{{ server.totalRecords }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">消息</div>
                <div class="mt-1 font-semibold text-highlighted">{{
                    server.publicMessages + server.privateMessages
                  }}
                </div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">加入 / 离开</div>
                <div class="mt-1 font-semibold text-highlighted">{{ server.joins }} / {{ server.leaves }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">跨服进 / 出</div>
                <div class="mt-1 font-semibold text-highlighted">{{ server.transfersIn }} / {{
                    server.transfersOut
                  }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
