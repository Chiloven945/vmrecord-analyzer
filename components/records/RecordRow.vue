<script setup lang="ts">
import type {NormalizedRecord} from '~/types/record'

const props = defineProps<{
  record: NormalizedRecord
  keyword?: string
}>()

function badgeColor(type: string) {
  switch (type) {
    case 'CHAT':
      return 'info'
    case 'PRIVATE_MESSAGE':
      return 'secondary'
    case 'JOIN':
      return 'success'
    case 'LEAVE':
      return 'error'
    case 'TRANSFER':
      return 'warning'
    default:
      return 'neutral'
  }
}

const detailText = computed(() => {
  if (props.record.message) return props.record.message
  if (props.record.command) return props.record.command
  return '-'
})
</script>

<template>
  <UCard>
    <div class="grid gap-4 lg:grid-cols-[190px_1fr]">
      <div class="space-y-2">
        <p class="text-sm font-medium text-highlighted">{{ record.timestamp }}</p>
        <UBadge :color="badgeColor(record.type)" variant="subtle">
          {{ record.type }}
        </UBadge>
        <div class="text-xs text-toned">
          <p>server: {{ record.server || 'Unknown' }}</p>
          <p v-if="record.command">cmd: {{ record.command }}</p>
        </div>
      </div>

      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2 text-sm text-toned">
          <PrefixSuffix :text="record.senderPrefix"/>
          <NuxtLink :to="`/players/${encodeURIComponent(record.senderName)}`"
                    class="font-semibold text-highlighted hover:text-primary">
            {{ record.senderName || 'Unknown' }}
          </NuxtLink>
          <PrefixSuffix :text="record.senderSuffix"/>

          <template v-if="record.receiverName">
            <UIcon name="i-lucide-arrow-right" class="size-4 text-muted"/>
            <PrefixSuffix :text="record.receiverPrefix"/>
            <NuxtLink :to="`/players/${encodeURIComponent(record.receiverName)}`"
                      class="font-semibold text-highlighted hover:text-primary">
              {{ record.receiverName }}
            </NuxtLink>
            <PrefixSuffix :text="record.receiverSuffix"/>
          </template>
        </div>

        <div class="mt-3 text-sm leading-6 text-highlighted">
          <MessageHighlighter :text="detailText" :keyword="keyword || ''"/>
        </div>

        <div class="mt-4 flex flex-wrap gap-2 text-xs text-muted">
          <span v-if="record.senderUuid">sender_uuid: {{ record.senderUuid }}</span>
          <span v-if="record.receiverUuid">receiver_uuid: {{ record.receiverUuid }}</span>
          <NuxtLink
              v-if="record.conversationKey"
              :to="`/conversations/${encodeURIComponent(record.conversationKey)}`"
              class="text-primary hover:underline"
          >
            查看双人会话
          </NuxtLink>
        </div>
      </div>
    </div>
  </UCard>
</template>
