<script setup lang="ts">
import type {NormalizedRecord} from '~/types/record'
import {useRecordsStore} from '~/stores/records'

const {t} = useI18n()
const {formatDateTime, formatNumber} = useLocaleFormatting()
const route = useRoute()
const store = useRecordsStore()
const serverName = computed(() => decodeURIComponent(String(route.params.server || '')))
const serverKey = computed(() => serverName.value.trim().toLowerCase())

const profile = computed(() => store.serverProfiles[serverKey.value])
const records = computed(() => {
  const key = serverKey.value
  return store.records.filter((record) => {
    const current = record.server.trim().toLowerCase()
    const from = (record.transferSource || '').trim().toLowerCase()
    const to = (record.transferTarget || '').trim().toLowerCase()
    return current === key || from === key || to === key
  })
})

const recentRecords = computed(() => [...records.value].sort((a, b) => b.timeMs - a.timeMs).slice(0, 50))
const topPlayers = computed(() =>
    Object.entries(profile.value?.players || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
)

const selectedRecord = ref<NormalizedRecord | null>(null)

function openRecord(record: NormalizedRecord) {
  selectedRecord.value = record
}

function closeRecord() {
  selectedRecord.value = null
}
</script>

<template>
  <div class="space-y-6">
    <UButton to="/servers" color="neutral" variant="ghost" icon="i-lucide-arrow-left">{{
        t('server.backToList')
      }}
    </UButton>

    <UAlert
        v-if="!profile"
        color="warning"
        variant="subtle"
        :title="t('server.notFoundTitle')"
        :description="t('server.notFoundDescription')"
    />

    <template v-else>
      <div class="grid gap-6 xl:grid-cols-[360px_1fr]">
        <UCard>
          <div class="space-y-5">
            <div>
              <h1 class="text-2xl font-semibold text-highlighted">{{ profile.name }}</h1>
              <p class="mt-2 text-sm text-toned">
                {{ t('server.activePeopleCount', {count: formatNumber(Object.keys(profile.players).length)}) }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('stats.totalRecords') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">{{ formatNumber(profile.totalRecords) }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('server.messageCount') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">
                  {{ formatNumber(profile.publicMessages + profile.privateMessages) }}
                </div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('server.join') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">{{ formatNumber(profile.joins) }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('server.leave') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">{{ formatNumber(profile.leaves) }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('server.transferIn') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">{{ formatNumber(profile.transfersIn) }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('server.transferOut') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">{{ formatNumber(profile.transfersOut) }}</div>
              </div>
            </div>

            <div class="space-y-1 text-sm text-toned">
              <p>{{ t('server.firstActivity') }}：{{ formatDateTime(profile.firstSeen) }}</p>
              <p>{{ t('server.lastActivity') }}：{{ formatDateTime(profile.lastSeen) }}</p>
            </div>

            <div>
              <h2 class="text-sm font-medium text-highlighted">{{ t('server.activePlayers') }}</h2>
              <div class="mt-3 space-y-2">
                <NuxtLink
                    v-for="[name, count] in topPlayers"
                    :key="name"
                    :to="`/players/${encodeURIComponent(name)}`"
                    class="flex items-center justify-between rounded-xl border border-default bg-elevated px-3 py-2 text-sm hover:ring-1 hover:ring-primary/15"
                >
                  <span class="text-highlighted">{{ name }}</span>
                  <UBadge color="secondary" variant="subtle">{{ formatNumber(count) }}</UBadge>
                </NuxtLink>
                <div v-if="!topPlayers.length" class="text-sm text-muted">{{ t('server.noPlayerActivity') }}</div>
              </div>
            </div>
          </div>
        </UCard>

        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-highlighted">{{ t('server.recentActivity') }}</h2>
          <RecordRow
              v-for="record in recentRecords"
              :key="record.id"
              :record="record"
              @select="openRecord"
          />
        </div>
      </div>
    </template>

    <RecordDetailDialog :open="!!selectedRecord" :record="selectedRecord" @close="closeRecord"/>
  </div>
</template>
