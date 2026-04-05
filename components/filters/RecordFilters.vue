<script setup lang="ts">
import type {NormalizedRecord, RecordFilterState} from '~/types/record'

const model = defineModel<RecordFilterState>({required: true})
const props = defineProps<{
  records: NormalizedRecord[]
}>()

const typeOptions = computed(() =>
    [...new Set(props.records.map((r) => r.type).filter(Boolean))].sort()
)

const serverOptions = computed(() =>
    [...new Set(props.records.map((r) => r.server).filter(Boolean))].sort()
)

const playerOptions = computed(() => {
  const names = new Set<string>()
  for (const record of props.records) {
    if (record.senderName) names.add(record.senderName)
    if (record.receiverName) names.add(record.receiverName)
  }
  return [...names].sort()
})

function clear() {
  model.value.q = ''
  model.value.types = []
  model.value.servers = []
  model.value.players = []
  model.value.start = undefined
  model.value.end = undefined
  model.value.onlyPrivate = false
  model.value.onlyPublic = false
}
</script>

<template>
  <UCard>
    <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <div class="xl:col-span-2">
        <label class="mb-2 block text-xs font-medium text-muted">搜索</label>
        <UInput v-model="model.q" icon="i-lucide-search" placeholder="消息 / 玩家 / UUID / 指令 / 服务器" size="lg"/>
      </div>

      <MultiSelectDropdown
          v-model="model.types"
          label="类型"
          :options="typeOptions"
          placeholder="全部类型"
      />

      <MultiSelectDropdown
          v-model="model.servers"
          label="服务器"
          :options="serverOptions"
          placeholder="全部服务器"
      />

      <MultiSelectDropdown
          v-model="model.players"
          label="玩家"
          :options="playerOptions"
          placeholder="全部玩家"
          searchable
      />

      <div>
        <label class="mb-2 block text-xs font-medium text-muted">开始日期</label>
        <UInput v-model="model.start" type="date"/>
      </div>

      <div>
        <label class="mb-2 block text-xs font-medium text-muted">结束日期</label>
        <UInput v-model="model.end" type="date"/>
      </div>

      <div class="flex items-end gap-4">
        <label class="flex items-center gap-2 text-sm text-toned">
          <UCheckbox v-model="model.onlyPrivate"/>
          <span>只看私聊</span>
        </label>
        <label class="flex items-center gap-2 text-sm text-toned">
          <UCheckbox v-model="model.onlyPublic"/>
          <span>只看公聊</span>
        </label>
      </div>

      <div class="flex items-end justify-end">
        <UButton color="neutral" variant="outline" icon="i-lucide-rotate-ccw" @click="clear">
          重置筛选
        </UButton>
      </div>
    </div>
  </UCard>
</template>
