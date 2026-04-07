<script setup lang="ts">
import {useRecordsStore} from '~/stores/records'
import {type PreparedCsvImport, useCsvImport} from '~/composables/useCsvImport'
import type {CsvHeaderMapping} from '~/utils/csv.client'
import type {NormalizedRecord} from '~/types/record'

const {t} = useI18n()
const {formatNumber, formatDateTime} = useLocaleFormatting()
const store = useRecordsStore()
const {loading, error, prepareFile, importPrepared} = useCsvImport()

const showUploader = ref(store.records.length === 0)
const mappingDialogOpen = ref(false)
const pendingPrepared = ref<PreparedCsvImport | null>(null)
const selectedRecord = ref<NormalizedRecord | null>(null)

watch(
    () => store.records.length,
    (count) => {
      if (count === 0) {
        showUploader.value = true
      }
    }
)

async function applyPrepared(prepared: PreparedCsvImport, mapping?: CsvHeaderMapping) {
  const records = await importPrepared(prepared, mapping)
  store.setRecords(records, prepared.file.name)
  pendingPrepared.value = null
  mappingDialogOpen.value = false
  showUploader.value = false
}

async function onFile(file: File) {
  const prepared = await prepareFile(file)

  if (prepared.inspection.guessedHasHeader) {
    await applyPrepared(prepared)
    return
  }

  pendingPrepared.value = prepared
  mappingDialogOpen.value = true
}

async function onConfirmMapping(mapping: CsvHeaderMapping) {
  if (!pendingPrepared.value) return
  await applyPrepared(pendingPrepared.value, mapping)
}

function onCloseMapping() {
  mappingDialogOpen.value = false
  pendingPrepared.value = null
}

function replaceFile() {
  pendingPrepared.value = null
  mappingDialogOpen.value = false
  showUploader.value = true
}

function openRecord(record: NormalizedRecord) {
  selectedRecord.value = record
}

function closeRecord() {
  selectedRecord.value = null
}

const importedDescription = computed(() =>
    t('index.importedDescription', {
      file: store.sourceFileName || t('common.csvFile'),
      action: t('common.replaceFile')
    })
)

const topServers = computed(() =>
    Object.entries(store.stats.serverCounts)
        .map(([label, value]) => ({label, value}))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
)

const typeDistribution = computed(() =>
    Object.entries(store.stats.typeCounts)
        .map(([label, value]) => ({label, value}))
        .sort((a, b) => b.value - a.value)
)

const latestRecords = computed(() => store.records.slice(-10).reverse())
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-sm text-primary">vMessageRecord Chat History Analyzer</p>
        <h1 class="mt-2 text-3xl font-semibold text-highlighted lg:text-4xl">{{ t('index.title') }}</h1>
        <p class="mt-3 max-w-3xl text-sm leading-6 text-toned">
          {{ t('index.description') }}
        </p>
      </div>
      <div class="flex flex-col items-start gap-3 text-sm text-toned lg:ml-auto lg:items-end">
        <div class="flex flex-wrap items-center gap-3 lg:justify-end">
          <span v-if="store.sourceFileName">{{ t('index.currentFile', {file: store.sourceFileName}) }}</span>
          <span v-if="store.importedAt">{{ t('index.recordCount', {count: formatNumber(store.records.length)}) }}</span>
          <span v-if="store.importedAt">{{ formatDateTime(store.importedAt, 'datetimeShort') }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-3 lg:justify-end">
          <UButton
              v-if="store.records.length && !showUploader"
              color="primary"
              variant="subtle"
              icon="i-lucide-refresh-cw"
              @click="replaceFile"
          >
            {{ t('common.replaceFile') }}
          </UButton>
          <UButton
              v-if="store.records.length"
              color="neutral"
              variant="outline"
              icon="i-lucide-trash-2"
              @click="store.clearRecords()"
          >
            {{ t('common.clearData') }}
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="showUploader">
      <CsvUploader :loading="loading" @file="onFile"/>
    </div>

    <UAlert v-if="error" color="error" variant="subtle" :title="t('index.importFailed')" :description="error"/>

    <CsvHeaderMappingDialog
        :open="mappingDialogOpen"
        :preview-rows="pendingPrepared?.inspection.previewRows || []"
        @close="onCloseMapping"
        @confirm="onConfirmMapping"
    />

    <template v-if="store.records.length">
      <UAlert
          v-if="!showUploader"
          color="success"
          variant="subtle"
          :title="t('index.importedTitle')"
          :description="importedDescription"
      />

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard :title="t('stats.totalRecords')" :value="store.stats.total" icon="i-lucide-chart-column"/>
        <StatCard :title="t('stats.publicChat')" :value="store.stats.chat" icon="i-lucide-message-square"/>
        <StatCard :title="t('stats.privateChat')" :value="store.stats.privateMessage" icon="i-lucide-messages-square"/>
        <StatCard :title="t('stats.activePlayers')" :value="store.stats.activePlayers" icon="i-lucide-users"/>
      </div>

      <div class="grid gap-6 xl:grid-cols-3">
        <SectionCard :title="t('index.serverDistribution')" :description="t('index.serverDistributionDescription')">
          <template #actions>
            <UButton to="/servers" color="neutral" variant="ghost" size="sm" icon="i-lucide-arrow-right">
              {{ t('common.viewAll') }}
            </UButton>
          </template>
          <DistributionBars :items="topServers" :empty-text="t('common.noServerData')"/>
        </SectionCard>

        <SectionCard :title="t('index.typeDistribution')" :description="t('index.typeDistributionDescription')">
          <DistributionBars :items="typeDistribution" :empty-text="t('common.noTypeData')"/>
        </SectionCard>

        <SectionCard :title="t('index.topConversations')" :description="t('index.topConversationsDescription')">
          <div v-if="store.topConversations.length" class="space-y-3">
            <NuxtLink
                v-for="item in store.topConversations.slice(0, 8)"
                :key="item.key"
                :to="`/conversations/${encodeURIComponent(item.key)}`"
                class="flex items-center justify-between gap-4 rounded-xl border border-default bg-elevated px-3 py-2.5 text-sm hover:ring-1 hover:ring-primary/15"
            >
              <span class="truncate text-highlighted">{{ item.label }}</span>
              <UBadge color="secondary" variant="subtle">{{ formatNumber(item.count) }}</UBadge>
            </NuxtLink>
          </div>
          <div v-else class="py-6 text-sm text-muted">{{ t('index.noConversations') }}</div>
        </SectionCard>
      </div>

      <SectionCard :title="t('index.latestRecords')" :description="t('index.latestRecordsDescription')">
        <div class="space-y-3">
          <RecordRow v-for="record in latestRecords" :key="record.id" :record="record" @select="openRecord"/>
        </div>
      </SectionCard>
    </template>

    <RecordDetailDialog :open="!!selectedRecord" :record="selectedRecord" @close="closeRecord"/>
  </div>
</template>
