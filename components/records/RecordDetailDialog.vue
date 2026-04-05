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

const transferFlow = computed(() => props.record ? parseTransferFlow(props.record) : null)
const privateServers = computed(() => props.record ? getPrivateMessageServers(store.records, props.record) : null)

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
  <UModal :open="open" :ui="{ overlay: 'bg-black/35 backdrop-blur-[2px]' }"
          @update:open="value => { if (!value) emit('close') }">
    <template #content>
      <div v-if="record" class="p-4 sm:p-6">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <div class="text-sm text-muted">记录详情</div>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <NuxtLink :to="recordTypeLink(record.type)" class="inline-flex">
                <UBadge :color="getRecordBadgeColor(record.type)" variant="subtle">{{ record.type }}</UBadge>
              </NuxtLink>
              <span class="text-sm text-toned">{{ record.timestamp }}</span>
            </div>
          </div>
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="emit('close')"/>
        </div>

        <template v-if="record.type === 'JOIN'">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">玩家</div>
              <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                        class="mt-2 block text-lg font-semibold text-highlighted hover:text-primary">
                {{ record.senderName || 'Unknown' }}
              </NuxtLink>
            </div>
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">加入的服务器</div>
              <div class="mt-2">
                <NuxtLink :to="serverLink(record.server || 'Unknown')" class="inline-flex">
                  <UBadge color="success" variant="soft">{{ record.server || 'Unknown' }}</UBadge>
                </NuxtLink>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="record.type === 'LEAVE'">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">玩家</div>
              <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                        class="mt-2 block text-lg font-semibold text-highlighted hover:text-primary">
                {{ record.senderName || 'Unknown' }}
              </NuxtLink>
            </div>
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">离开的服务器</div>
              <div class="mt-2">
                <NuxtLink :to="serverLink(record.server || 'Unknown')" class="inline-flex">
                  <UBadge color="error" variant="soft">{{ record.server || 'Unknown' }}</UBadge>
                </NuxtLink>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="record.type === 'TRANSFER' && transferFlow">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">玩家</div>
              <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                        class="mt-2 block text-lg font-semibold text-highlighted hover:text-primary">
                {{ record.senderName || 'Unknown' }}
              </NuxtLink>
            </div>
            <div class="rounded-xl border border-default bg-elevated p-4">
              <div class="text-sm text-muted">跨服流向</div>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <NuxtLink :to="serverLink(transferFlow.from)" class="inline-flex">
                  <UBadge color="info" variant="soft">{{ transferFlow.from }}</UBadge>
                </NuxtLink>
                <UIcon name="i-lucide-arrow-right" class="size-4 text-primary"/>
                <NuxtLink :to="serverLink(transferFlow.to)" class="inline-flex">
                  <UBadge color="warning" variant="soft">{{ transferFlow.to }}</UBadge>
                </NuxtLink>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="record.type === 'PRIVATE_MESSAGE' && privateServers">
          <div class="rounded-xl border border-default bg-elevated p-4">
            <div class="text-sm text-muted">双方信息</div>
            <div class="mt-2 flex flex-wrap items-center gap-2 text-base">
              <NuxtLink :to="serverLink(privateServers.senderServer)" class="inline-flex">
                <UBadge color="info" variant="soft">{{ privateServers.senderServer }}</UBadge>
              </NuxtLink>
              <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                        class="font-semibold text-highlighted hover:text-primary">
                {{ record.senderName || 'Unknown' }}
              </NuxtLink>
              <UIcon name="i-lucide-arrow-right" class="size-4 text-primary"/>
              <NuxtLink :to="serverLink(privateServers.receiverServer)" class="inline-flex">
                <UBadge color="secondary" variant="soft">{{ privateServers.receiverServer }}</UBadge>
              </NuxtLink>
              <NuxtLink :to="playerLink(record.receiverName || 'Unknown')"
                        class="font-semibold text-highlighted hover:text-primary">
                {{ record.receiverName || 'Unknown' }}
              </NuxtLink>
            </div>
          </div>

          <div class="mt-4 rounded-xl border border-default bg-elevated p-4">
            <div class="text-sm text-muted">私聊内容</div>
            <div class="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-highlighted">
              {{ record.message || '-' }}
            </div>
          </div>

          <div class="mt-4 flex justify-end">
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
              <NuxtLink :to="playerLink(record.senderName || 'Unknown')"
                        class="mt-2 block text-lg font-semibold text-highlighted hover:text-primary">
                {{ record.senderName || 'Unknown' }}
              </NuxtLink>
              <div class="mt-4 text-sm text-muted">服务器</div>
              <div class="mt-2">
                <NuxtLink :to="serverLink(record.server || 'Unknown')" class="inline-flex">
                  <UBadge color="info" variant="soft">{{ record.server || 'Unknown' }}</UBadge>
                </NuxtLink>
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

        <div class="mt-5 grid gap-4 border-t border-default pt-5 sm:grid-cols-3">
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
    </template>
  </UModal>
</template>
