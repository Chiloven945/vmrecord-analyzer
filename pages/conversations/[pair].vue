<script setup lang="ts">
import dayjs from 'dayjs'
import {useConversation} from '~/composables/useConversation'

const route = useRoute()
const pair = computed(() => String(route.params.pair))
const {records, participants, summary} = useConversation(pair)

const leftName = computed(() => participants.value[0] || '')
const rightName = computed(() => participants.value[1] || '')
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton to="/players" color="neutral" variant="ghost" icon="i-lucide-arrow-left">返回玩家列表</UButton>
    </div>

    <SectionCard :title="`${leftName} ↔ ${rightName}`" description="双玩家私聊记录，仅显示 PRIVATE_MESSAGE">
      <template #actions>
        <div class="text-right text-sm text-toned">
          <p>消息数：{{ summary.total }}</p>
          <p v-if="summary.first">{{ dayjs(summary.first).format('YYYY-MM-DD HH:mm:ss') }} ~
            {{ dayjs(summary.last).format('YYYY-MM-DD HH:mm:ss') }}</p>
        </div>
      </template>

      <div v-if="records.length" class="space-y-3">
        <div
            v-for="record in records"
            :key="record.id"
            class="rounded-2xl border border-default p-4"
            :class="record.senderName.toLowerCase() === leftName ? 'bg-primary/5' : 'bg-secondary/5'"
        >
          <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div class="font-semibold text-highlighted">{{ record.senderName }} → {{ record.receiverName }}</div>
            <div class="text-toned">{{ record.timestamp }}</div>
          </div>
          <div class="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-highlighted">
            {{ record.message || '-' }}
          </div>
          <div class="mt-3 text-xs text-muted">server: {{ record.server || 'Unknown' }}</div>
        </div>
      </div>
      <div v-else class="py-8 text-sm text-muted">当前导入的数据里没有这两个玩家的私聊记录。</div>
    </SectionCard>
  </div>
</template>
