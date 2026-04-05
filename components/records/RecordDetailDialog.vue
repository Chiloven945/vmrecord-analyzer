<script setup lang="ts">
import type {NormalizedRecord} from '~/types/record'
import {getPrivateMessageServers, getRecordBadgeColor, parseTransferFlow} from '~/utils/recordPresentation'
import {useRecordsStore} from '~/stores/records'

const props = defineProps<{
  open: boolean
  record: NormalizedRecord | null
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useRecordsStore()

const transferFlow = computed(() => (props.record ? parseTransferFlow(props.record) : null))
const privateServers = computed(() => {
  if (!props.record) return null
  return getPrivateMessageServers(store.records, props.record)
})

function close() {
  emit('close')
}
</script>

<template>
  <div v-if="open && record"
       class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[1px]"
       @click.self="close">
    <UCard class="max-h-[90vh] w-full max-w-4xl overflow-auto">
      <template #header>
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <UBadge :color="getRecordBadgeColor(record.type)" variant="subtle">{{ record.type }}</UBadge>
              <span class="text-sm text-toned">{{ record.timestamp }}</span>
            </div>
            <h2 class="mt-3 text-xl font-semibold text-highlighted">记录详情</h2>
          </div>
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="close"/>
        </div>
      </template>

      <div class="space-y-5">
        <template v-if="record.type === 'JOIN'">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">玩家</div>
              <div class="mt-2 text-lg font-semibold text-highlighted">{{ record.senderName || 'Unknown' }}</div>
            </div>
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">加入的服务器</div>
              <div class="mt-2">
                <UBadge color="success" variant="soft">{{ record.server || 'Unknown' }}</UBadge>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="record.type === 'LEAVE'">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">玩家</div>
              <div class="mt-2 text-lg font-semibold text-highlighted">{{ record.senderName || 'Unknown' }}</div>
            </div>
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">离开的服务器</div>
              <div class="mt-2">
                <UBadge color="error" variant="soft">{{ record.server || 'Unknown' }}</UBadge>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="record.type === 'TRANSFER' && transferFlow">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">玩家</div>
              <div class="mt-2 text-lg font-semibold text-highlighted">{{ record.senderName || 'Unknown' }}</div>
            </div>
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">跨服流向</div>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <UBadge color="info" variant="soft">{{ transferFlow.from }}</UBadge>
                <UIcon name="i-lucide-arrow-right" class="size-4 text-primary"/>
                <UBadge color="warning" variant="soft">{{ transferFlow.to }}</UBadge>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="record.type === 'PRIVATE_MESSAGE' && privateServers">
          <div class="rounded-xl border border-default bg-elevated p-4">
            <div class="text-sm text-muted">双方信息</div>
            <div class="mt-2 flex flex-wrap items-center gap-2 text-base">
              <UBadge color="info" variant="soft">{{ privateServers.senderServer }}</UBadge>
              <span class="font-semibold text-highlighted">{{ record.senderName || 'Unknown' }}</span>
              <UIcon name="i-lucide-arrow-right" class="size-4 text-primary"/>
              <UBadge color="secondary" variant="soft">{{ privateServers.receiverServer }}</UBadge>
              <span class="font-semibold text-highlighted">{{ record.receiverName || 'Unknown' }}</span>
            </div>
          </div>

          <div class="rounded-xl border border-default bg-elevated p-4">
            <div class="text-sm text-muted">私聊内容</div>
            <div class="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-highlighted">
              {{ record.message || '-' }}
            </div>
          </div>

          <div class="flex justify-end">
            <UButton
                v-if="record.conversationKey"
                :to="`/conversations/${encodeURIComponent(record.conversationKey)}`"
                color="primary"
                icon="i-lucide-messages-square"
            >
              查看双方对话
            </UButton>
          </div>
        </template>

        <template v-else>
          <div class="grid gap-4 sm:grid-cols-[220px_1fr]">
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">玩家</div>
              <div class="mt-2 text-lg font-semibold text-highlighted">{{ record.senderName || 'Unknown' }}</div>
              <div class="mt-4 text-sm text-muted">服务器</div>
              <div class="mt-2">
                <UBadge color="info" variant="soft">{{ record.server || 'Unknown' }}</UBadge>
              </div>
            </div>
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">聊天内容</div>
              <div class="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-highlighted">
                {{ record.message || '-' }}
              </div>
            </div>
          </div>
        </template>

        <div class="grid gap-4 border-t border-default pt-5 sm:grid-cols-3">
          <div>
            <div class="text-sm text-muted">时间</div>
            <div class="mt-1 text-sm text-highlighted">{{ record.timestamp }}</div>
          </div>
          <div>
            <div class="text-sm text-muted">类型</div>
            <div class="mt-1 text-sm text-highlighted">{{ record.type }}</div>
          </div>
          <div v-if="record.command">
            <div class="text-sm text-muted">命令来源</div>
            <div class="mt-1 text-sm text-highlighted">{{ record.command }}</div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
