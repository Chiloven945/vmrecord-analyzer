<script setup lang="ts">
import {useRecordsStore} from '~/stores/records'

const {t} = useI18n()
const {formatDateTime, formatNumber} = useLocaleFormatting()
const store = useRecordsStore()

const servers = computed(() => store.servers)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-highlighted">{{ t('server.listTitle') }}</h1>
        <p class="mt-2 text-sm text-toned">{{ t('server.listDescription') }}</p>
      </div>
      <UButton to="/" color="primary" variant="soft" icon="i-lucide-layout-dashboard">{{
          t('common.backToOverview')
        }}
      </UButton>
    </div>

    <UAlert
        v-if="!store.records.length"
        color="warning"
        variant="subtle"
        :title="t('server.emptyTitle')"
        :description="t('server.emptyDescription')"
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
                <UBadge color="info" variant="subtle">
                  {{ t('server.activePeopleCount', {count: formatNumber(Object.keys(server.players).length)}) }}
                </UBadge>
              </div>
              <p class="mt-2 text-sm text-toned">
                {{ t('server.lastActivity') }}：{{ formatDateTime(server.lastSeen) }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('stats.totalRecords') }}</div>
                <div class="mt-1 font-semibold text-highlighted">{{ formatNumber(server.totalRecords) }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('server.messages') }}</div>
                <div class="mt-1 font-semibold text-highlighted">
                  {{ formatNumber(server.publicMessages + server.privateMessages) }}
                </div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('server.joinLeave') }}</div>
                <div class="mt-1 font-semibold text-highlighted">{{ formatNumber(server.joins) }} /
                  {{ formatNumber(server.leaves) }}
                </div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('server.transferInOut') }}</div>
                <div class="mt-1 font-semibold text-highlighted">{{ formatNumber(server.transfersIn) }} /
                  {{ formatNumber(server.transfersOut) }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
