<script setup lang="ts">
import type {PlayerProfile} from '~/types/record'

const {t} = useI18n()
const {formatDateTime, formatNumber} = useLocaleFormatting()

const props = defineProps<{
  player: PlayerProfile
}>()

const dominantServer = computed(() =>
    Object.entries(props.player.servers).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
)
</script>

<template>
  <NuxtLink :to="`/players/${encodeURIComponent(player.name)}`" class="block">
    <UCard class="transition hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/20">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h3 class="truncate text-lg font-semibold text-highlighted">{{ player.name }}</h3>
          <p class="mt-1 text-xs text-muted">{{
              t('player.totalActivities', {count: formatNumber(player.totalRecords)})
            }}</p>
        </div>
        <UBadge color="neutral" variant="subtle">{{ formatNumber(player.totalRecords) }}</UBadge>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-xl bg-elevated p-3">
          <div class="text-muted">{{ t('player.publicChat') }}</div>
          <div class="mt-1 font-semibold text-highlighted">{{ formatNumber(player.publicMessages) }}</div>
        </div>
        <div class="rounded-xl bg-elevated p-3">
          <div class="text-muted">{{ t('player.privateSent') }}</div>
          <div class="mt-1 font-semibold text-highlighted">{{ formatNumber(player.privateMessagesSent) }}</div>
        </div>
      </div>

      <div class="mt-4 space-y-1 text-xs text-toned">
        <p>{{ t('player.dominantServer', {server: dominantServer}) }}</p>
        <p>{{ t('player.lastSeen') }}：{{ formatDateTime(player.lastSeen) }}</p>
      </div>
    </UCard>
  </NuxtLink>
</template>
