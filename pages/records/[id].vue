<script setup lang="ts">
import {useRecordsStore} from '~/stores/records'
import {getPrivateMessageServers, getRecordBadgeColor, parseTransferFlow} from '~/utils/recordPresentation'

const {t} = useI18n()
const {formatDateTime} = useLocaleFormatting()
const route = useRoute()
const store = useRecordsStore()
const recordId = computed(() => decodeURIComponent(String(route.params.id || '')))
const record = computed(() => store.records.find((item) => item.id === recordId.value))
const transferFlow = computed(() => record.value ? parseTransferFlow(record.value) : null)
const privateServers = computed(() => record.value ? getPrivateMessageServers(store.records, record.value) : null)
</script>

<template>
  <div class="space-y-6">
    <UButton to="/records" color="neutral" variant="ghost" icon="i-lucide-arrow-left">{{
        t('conversation.backToRecords')
      }}
    </UButton>

    <UAlert
        v-if="!record"
        color="warning"
        variant="subtle"
        :title="t('recordPage.notFoundTitle')"
        :description="t('recordPage.notFoundDescription')"
    />

    <template v-else>
      <UCard>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl font-semibold text-highlighted">{{ t('recordDetail.title') }}</h1>
              <UBadge :color="getRecordBadgeColor(record.type)" variant="subtle">{{ record.type }}</UBadge>
            </div>
            <p class="mt-2 text-sm text-toned">{{ formatDateTime(record.timeMs) }}</p>
          </div>

          <UButton
              v-if="record.conversationKey"
              :to="`/conversations/${encodeURIComponent(record.conversationKey)}`"
              color="secondary"
              variant="soft"
              icon="i-lucide-messages-square"
          >
            {{ t('recordDetail.viewConversation') }}
          </UButton>
        </div>
      </UCard>

      <UCard v-if="record.type === 'JOIN'">
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-highlighted">{{ t('recordPage.joinEvent') }}</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-xl bg-elevated p-4">
              <div class="text-sm text-muted">{{ t('common.player') }}</div>
              <div class="mt-1 text-lg font-semibold text-highlighted">{{
                  record.senderName || t('common.unknown')
                }}
              </div>
            </div>
            <div class="rounded-xl bg-elevated p-4">
              <div class="text-sm text-muted">{{ t('recordDetail.joinServer') }}</div>
              <div class="mt-1">
                <UBadge color="success" variant="soft">{{ record.server || t('common.unknown') }}</UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard v-else-if="record.type === 'LEAVE'">
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-highlighted">{{ t('recordPage.leaveEvent') }}</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-xl bg-elevated p-4">
              <div class="text-sm text-muted">{{ t('common.player') }}</div>
              <div class="mt-1 text-lg font-semibold text-highlighted">{{
                  record.senderName || t('common.unknown')
                }}
              </div>
            </div>
            <div class="rounded-xl bg-elevated p-4">
              <div class="text-sm text-muted">{{ t('recordDetail.leaveServer') }}</div>
              <div class="mt-1">
                <UBadge color="error" variant="soft">{{ record.server || t('common.unknown') }}</UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard v-else-if="record.type === 'TRANSFER' && transferFlow">
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-highlighted">{{ t('recordPage.transferEvent') }}</h2>
          <div class="rounded-2xl border border-default bg-elevated p-5">
            <div class="mb-4 text-sm text-muted">{{ t('common.player') }}</div>
            <div class="text-lg font-semibold text-highlighted">{{ record.senderName || t('common.unknown') }}</div>
            <div class="mt-5 flex flex-wrap items-center gap-3">
              <UBadge color="neutral" variant="soft">{{ transferFlow.from }}</UBadge>
              <UIcon name="i-lucide-arrow-right" class="size-5 text-primary"/>
              <UBadge color="warning" variant="soft">{{ transferFlow.to }}</UBadge>
            </div>
          </div>
        </div>
      </UCard>

      <UCard v-else-if="record.type === 'PRIVATE_MESSAGE' && privateServers">
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-highlighted">{{ t('recordPage.privateMessage') }}</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-xl bg-elevated p-4">
              <div class="text-sm text-muted">{{ t('recordPage.sender') }}</div>
              <div class="mt-1 text-lg font-semibold text-highlighted">{{
                  record.senderName || t('common.unknown')
                }}
              </div>
              <div class="mt-3 text-sm text-muted">{{ t('recordPage.senderServer') }}</div>
              <div class="mt-1">
                <UBadge color="info" variant="soft">{{ privateServers.senderServer }}</UBadge>
              </div>
            </div>
            <div class="rounded-xl bg-elevated p-4">
              <div class="text-sm text-muted">{{ t('recordPage.receiver') }}</div>
              <div class="mt-1 text-lg font-semibold text-highlighted">{{
                  record.receiverName || t('common.unknown')
                }}
              </div>
              <div class="mt-3 text-sm text-muted">{{ t('recordPage.receiverServer') }}</div>
              <div class="mt-1">
                <UBadge color="secondary" variant="soft">{{ privateServers.receiverServer }}</UBadge>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-elevated p-4">
            <div class="text-sm text-muted">{{ t('recordDetail.messageContent') }}</div>
            <div class="mt-2 whitespace-pre-wrap break-words text-base leading-7 text-highlighted">
              {{ record.message || '-' }}
            </div>
          </div>
        </div>
      </UCard>

      <UCard v-else>
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-highlighted">{{ t('recordPage.publicChat') }}</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-xl bg-elevated p-4">
              <div class="text-sm text-muted">{{ t('common.player') }}</div>
              <div class="mt-1 text-lg font-semibold text-highlighted">{{
                  record.senderName || t('common.unknown')
                }}
              </div>
            </div>
            <div class="rounded-xl bg-elevated p-4">
              <div class="text-sm text-muted">{{ t('common.server') }}</div>
              <div class="mt-1">
                <UBadge color="info" variant="soft">{{ record.server || t('common.unknown') }}</UBadge>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-elevated p-4">
            <div class="text-sm text-muted">{{ t('recordPage.chatContent') }}</div>
            <div class="mt-2 whitespace-pre-wrap break-words text-base leading-7 text-highlighted">
              {{ record.message || '-' }}
            </div>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>
