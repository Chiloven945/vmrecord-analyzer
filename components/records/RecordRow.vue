<script setup lang="ts">
import type {NormalizedRecord} from '~/types/record'
import {getPrivateMessageServers, getRecordBadgeColor, parseTransferFlow} from '~/utils/recordPresentation'
import {useRecordsStore} from '~/stores/records'

const props = defineProps<{
  record: NormalizedRecord
  keyword?: string
}>()

const emit = defineEmits<{
  select: [record: NormalizedRecord]
}>()

const store = useRecordsStore()

const transferFlow = computed(() => parseTransferFlow(props.record))
const privateServers = computed(() => getPrivateMessageServers(store.records, props.record))

function openDetail() {
  emit('select', props.record)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openDetail()
  }
}

function recordTypeLink(type: string) {
  return {path: '/records', query: {type}}
}

function playerLink(name: string) {
  return `/players/${encodeURIComponent(name)}`
}

function serverLink(name: string) {
  return `/servers/${encodeURIComponent(name)}`
}
</script>

<template>
  <UCard
      class="cursor-pointer transition hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/20"
      tabindex="0"
      @click="openDetail"
      @keydown="onKeydown"
  >
    <div class="grid gap-4 lg:grid-cols-[180px_1fr]">
      <div class="space-y-2">
        <p class="text-sm font-medium text-highlighted">{{ record.timestamp }}</p>
        <NuxtLink :to="recordTypeLink(record.type)" class="inline-flex" @click.stop>
          <UBadge :color="getRecordBadgeColor(record.type)" variant="subtle">
            {{ record.type }}
          </UBadge>
        </NuxtLink>
      </div>

      <div class="min-w-0 space-y-3">
        <template v-if="record.type === 'JOIN'">
          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                      class="text-base font-semibold text-highlighted hover:text-primary" @click.stop>
              {{ record.senderName || 'Unknown' }}
            </NuxtLink>
            <span class="text-sm text-toned">加入了</span>
            <NuxtLink :to="serverLink(record.server || 'Unknown')" class="inline-flex" @click.stop>
              <UBadge color="success" variant="soft">{{ record.server || 'Unknown' }}</UBadge>
            </NuxtLink>
          </div>
        </template>

        <template v-else-if="record.type === 'LEAVE'">
          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                      class="text-base font-semibold text-highlighted hover:text-primary" @click.stop>
              {{ record.senderName || 'Unknown' }}
            </NuxtLink>
            <span class="text-sm text-toned">离开了</span>
            <NuxtLink :to="serverLink(record.server || 'Unknown')" class="inline-flex" @click.stop>
              <UBadge color="error" variant="soft">{{ record.server || 'Unknown' }}</UBadge>
            </NuxtLink>
          </div>
        </template>

        <template v-else-if="record.type === 'TRANSFER'">
          <div class="flex flex-wrap items-center gap-3">
            <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                      class="text-base font-semibold text-highlighted hover:text-primary" @click.stop>
              {{ record.senderName || 'Unknown' }}
            </NuxtLink>
            <div
                class="flex flex-wrap items-center gap-2 rounded-xl border border-default bg-elevated px-3 py-2 text-sm">
              <NuxtLink :to="serverLink(transferFlow.from)" class="inline-flex" @click.stop>
                <UBadge color="info" variant="soft">{{ transferFlow.from }}</UBadge>
              </NuxtLink>
              <UIcon name="i-lucide-arrow-right" class="size-4 text-primary"/>
              <NuxtLink :to="serverLink(transferFlow.to)" class="inline-flex" @click.stop>
                <UBadge color="warning" variant="soft">{{ transferFlow.to }}</UBadge>
              </NuxtLink>
            </div>
          </div>
        </template>

        <template v-else-if="record.type === 'PRIVATE_MESSAGE'">
          <div class="flex flex-wrap items-center gap-2 text-sm text-toned">
            <NuxtLink :to="serverLink(privateServers.senderServer)" class="inline-flex" @click.stop>
              <UBadge color="info" variant="soft">{{ privateServers.senderServer }}</UBadge>
            </NuxtLink>
            <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                      class="font-semibold text-highlighted hover:text-primary" @click.stop>
              {{ record.senderName || 'Unknown' }}
            </NuxtLink>
            <UIcon name="i-lucide-arrow-right" class="size-4 text-primary"/>
            <NuxtLink :to="serverLink(privateServers.receiverServer)" class="inline-flex" @click.stop>
              <UBadge color="secondary" variant="soft">{{ privateServers.receiverServer }}</UBadge>
            </NuxtLink>
            <NuxtLink :to="playerLink(record.receiverName || 'Unknown')"
                      class="font-semibold text-highlighted hover:text-primary" @click.stop>
              {{ record.receiverName || 'Unknown' }}
            </NuxtLink>
          </div>

          <div class="text-sm leading-6 text-highlighted">
            <MessageHighlighter :text="record.message || '-'" :keyword="keyword || ''"/>
          </div>
        </template>

        <template v-else>
          <div class="flex flex-wrap items-center gap-2 text-sm text-toned">
            <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                      class="text-base font-semibold text-highlighted hover:text-primary" @click.stop>
              {{ record.senderName || 'Unknown' }}
            </NuxtLink>
            <span class="text-muted">·</span>
            <NuxtLink :to="serverLink(record.server || 'Unknown')" class="inline-flex" @click.stop>
              <UBadge color="info" variant="soft">{{ record.server || 'Unknown' }}</UBadge>
            </NuxtLink>
          </div>

          <div class="text-sm leading-6 text-highlighted">
            <MessageHighlighter :text="record.message || '-'" :keyword="keyword || ''"/>
          </div>
        </template>
      </div>
    </div>
  </UCard>
</template>
