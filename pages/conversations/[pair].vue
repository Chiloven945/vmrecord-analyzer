<script setup lang="ts">
import dayjs from 'dayjs'
import type {NormalizedRecord} from '~/types/record'
import {useConversation} from '~/composables/useConversation'
import {getPrivateMessageServers} from '~/utils/recordPresentation'
import {useRecordsStore} from '~/stores/records'

const route = useRoute()
const store = useRecordsStore()
const pair = computed(() => decodeURIComponent(String(route.params.pair || '')))
const {records, participants, summary} = useConversation(pair)

const itemsPerPage = 50
const page = ref(1)
const selectedRecord = ref<NormalizedRecord | null>(null)

const leftPlayer = computed(() => participants.value[0] || 'unknown')
const rightPlayer = computed(() => participants.value[1] || 'unknown')

function displayNameFor(target: string) {
  const normalized = target.trim().toLowerCase()
  const first = records.value.find((record) =>
      record.senderName.trim().toLowerCase() === normalized || record.receiverName.trim().toLowerCase() === normalized
  )

  if (!first) return target
  if (first.senderName.trim().toLowerCase() === normalized) return first.senderName
  if (first.receiverName.trim().toLowerCase() === normalized) return first.receiverName
  return target
}

const leftDisplay = computed(() => displayNameFor(leftPlayer.value))
const rightDisplay = computed(() => displayNameFor(rightPlayer.value))

function isLeft(recordSender: string) {
  return recordSender.trim().toLowerCase() === leftPlayer.value.trim().toLowerCase()
}

function servers(record: NormalizedRecord) {
  return getPrivateMessageServers(store.records, record)
}

const paginatedRecords = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return records.value.slice(start, start + itemsPerPage)
})

watch(records, () => {
  page.value = 1
})

function openRecord(record: NormalizedRecord) {
  selectedRecord.value = record
}

function closeRecord() {
  selectedRecord.value = null
}
</script>

<template>
  <div class="space-y-6">
    <UButton to="/records" color="neutral" variant="ghost" icon="i-lucide-arrow-left">返回记录列表</UButton>

    <UAlert
        v-if="!records.length"
        color="warning"
        variant="subtle"
        title="当前没有这组双方对话"
        description="请确认当前导入的数据中包含这两名玩家的 PRIVATE_MESSAGE 记录。"
    />

    <template v-else>
      <UCard>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-highlighted">双方对话</h1>
            <p class="mt-2 text-sm text-toned">{{ leftDisplay }} ↔ {{ rightDisplay }}</p>
          </div>
          <div class="flex flex-wrap gap-3 text-sm text-toned">
            <span>消息数：{{ summary.total }}</span>
            <span v-if="summary.first">开始：{{ dayjs(summary.first).format('YYYY-MM-DD HH:mm:ss') }}</span>
            <span v-if="summary.last">结束：{{ dayjs(summary.last).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-default pb-4">
          <div class="text-left text-lg font-semibold text-highlighted">{{ leftDisplay }}</div>
          <div class="text-xs uppercase tracking-[0.2em] text-muted">Sequence</div>
          <div class="text-right text-lg font-semibold text-highlighted">{{ rightDisplay }}</div>
        </div>

        <div class="relative mt-6 space-y-4">
          <div
              class="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-2 -translate-x-1/2 rounded-full bg-primary/12 md:block"/>

          <div
              v-for="record in paginatedRecords"
              :key="record.id"
              class="relative z-10 grid gap-3 md:grid-cols-[1fr_132px_1fr] md:items-start"
          >
            <div class="min-w-0">
              <button
                  v-if="isLeft(record.senderName)"
                  type="button"
                  class="block w-full rounded-2xl border border-primary/20 bg-primary/10 p-4 text-left transition hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/20"
                  @click="openRecord(record)"
              >
                <div class="mb-2 flex flex-wrap items-center gap-2 text-xs text-toned">
                  <UBadge color="info" variant="soft">{{ servers(record).senderServer }}</UBadge>
                  <span class="font-semibold text-highlighted">{{ record.senderName }}</span>
                  <UIcon name="i-lucide-arrow-right" class="size-3 text-primary"/>
                  <UBadge color="secondary" variant="soft">{{ servers(record).receiverServer }}</UBadge>
                  <span class="font-semibold text-highlighted">{{ record.receiverName }}</span>
                </div>
                <div class="whitespace-pre-wrap break-words text-sm leading-6 text-highlighted">{{
                    record.message || '-'
                  }}
                </div>
              </button>
            </div>

            <div class="relative z-10 flex justify-center pt-2">
              <div class="rounded-full border border-default bg-default/95 px-3 py-1 text-xs text-muted shadow-sm">
                {{ dayjs(record.timeMs).format('MM-DD HH:mm:ss') }}
              </div>
            </div>

            <div class="min-w-0">
              <button
                  v-if="!isLeft(record.senderName)"
                  type="button"
                  class="block w-full rounded-2xl border border-secondary/20 bg-secondary/10 p-4 text-left transition hover:-translate-y-0.5 hover:ring-1 hover:ring-secondary/20"
                  @click="openRecord(record)"
              >
                <div class="mb-2 flex flex-wrap items-center gap-2 text-xs text-toned">
                  <UBadge color="info" variant="soft">{{ servers(record).senderServer }}</UBadge>
                  <span class="font-semibold text-highlighted">{{ record.senderName }}</span>
                  <UIcon name="i-lucide-arrow-right" class="size-3 text-primary"/>
                  <UBadge color="secondary" variant="soft">{{ servers(record).receiverServer }}</UBadge>
                  <span class="font-semibold text-highlighted">{{ record.receiverName }}</span>
                </div>
                <div class="whitespace-pre-wrap break-words text-sm leading-6 text-highlighted">{{
                    record.message || '-'
                  }}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
            class="mt-6 flex flex-col gap-3 border-t border-default pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-sm text-muted">
            第 {{ records.length ? (page - 1) * itemsPerPage + 1 : 0 }} -
            {{ Math.min(page * itemsPerPage, records.length) }} 条，
            共 {{ records.length }} 条
          </div>

          <UPagination
              v-model:page="page"
              :total="records.length"
              :items-per-page="itemsPerPage"
              show-edges
              active-color="primary"
              active-variant="solid"
          />
        </div>
      </UCard>
    </template>

    <RecordDetailDialog :open="!!selectedRecord" :record="selectedRecord" @close="closeRecord"/>
  </div>
</template>
