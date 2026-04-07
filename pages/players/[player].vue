<script setup lang="ts">
import type {NormalizedRecord} from '~/types/record'
import {usePlayerProfile} from '~/composables/usePlayerProfile'

const {t} = useI18n()
const {formatDateTime, formatNumber} = useLocaleFormatting()
const route = useRoute()
const playerName = computed(() => decodeURIComponent(String(route.params.player || '')))
const {profile, records, privateContacts} = usePlayerProfile(playerName)

const dominantServer = computed(() =>
    Object.entries(profile.value?.servers || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || t('common.unknown')
)

const selectedRecord = ref<NormalizedRecord | null>(null)
const recentRecords = computed(() => [...records.value].sort((a, b) => b.timeMs - a.timeMs).slice(0, 50))

function openRecord(record: NormalizedRecord) {
  selectedRecord.value = record
}

function closeRecord() {
  selectedRecord.value = null
}
</script>

<template>
  <div class="space-y-6">
    <UButton to="/players" color="neutral" variant="ghost" icon="i-lucide-arrow-left">{{
        t('player.backToList')
      }}
    </UButton>

    <UAlert
        v-if="!profile"
        color="warning"
        variant="subtle"
        :title="t('player.notFoundTitle')"
        :description="t('player.notFoundDescription')"
    />

    <template v-else>
      <div class="grid gap-6 xl:grid-cols-[360px_1fr]">
        <UCard>
          <div class="space-y-5">
            <div>
              <h1 class="text-2xl font-semibold text-highlighted">{{ profile.name }}</h1>
              <p class="mt-2 text-sm text-toned">{{ t('player.dominantServer', {server: dominantServer}) }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('stats.totalRecords') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">{{ formatNumber(profile.totalRecords) }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('player.publicChat') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">{{
                    formatNumber(profile.publicMessages)
                  }}
                </div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('player.privateSent') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">{{
                    formatNumber(profile.privateMessagesSent)
                  }}
                </div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">{{ t('player.privateReceived') }}</div>
                <div class="mt-1 text-xl font-semibold text-highlighted">
                  {{ formatNumber(profile.privateMessagesReceived) }}
                </div>
              </div>
            </div>

            <div class="space-y-1 text-sm text-toned">
              <p>{{ t('player.firstSeen') }}：{{ formatDateTime(profile.firstSeen) }}</p>
              <p>{{ t('player.lastSeen') }}：{{ formatDateTime(profile.lastSeen) }}</p>
            </div>

            <div>
              <h2 class="text-sm font-medium text-highlighted">{{ t('player.frequentContacts') }}</h2>
              <div class="mt-3 space-y-2">
                <NuxtLink
                    v-for="[name, count] in privateContacts.slice(0, 8)"
                    :key="name"
                    :to="`/conversations/${encodeURIComponent([profile.name.toLowerCase(), name.toLowerCase()].sort().join('::'))}`"
                    class="flex items-center justify-between rounded-xl border border-default bg-elevated px-3 py-2 text-sm hover:ring-1 hover:ring-primary/15"
                >
                  <span class="text-highlighted">{{ name }}</span>
                  <UBadge color="secondary" variant="subtle">{{ formatNumber(count) }}</UBadge>
                </NuxtLink>
                <div v-if="!privateContacts.length" class="text-sm text-muted">{{ t('player.noContacts') }}</div>
              </div>
            </div>
          </div>
        </UCard>

        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-highlighted">{{ t('player.recentActivity') }}</h2>
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
