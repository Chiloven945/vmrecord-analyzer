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

function setMulti(event: Event, key: 'types' | 'servers' | 'players') {
  const target = event.target as HTMLSelectElement
  model.value[key] = Array.from(target.selectedOptions).map((option) => option.value)
}

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

      <div>
        <label class="mb-2 block text-xs font-medium text-muted">类型</label>
        <select
            class="w-full rounded-[calc(var(--ui-radius)*0.9)] border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none"
            multiple
            :value="model.types"
            @change="setMulti($event, 'types')"
        >
          <option v-for="item in typeOptions" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <div>
        <label class="mb-2 block text-xs font-medium text-muted">服务器</label>
        <select
            class="w-full rounded-[calc(var(--ui-radius)*0.9)] border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none"
            multiple
            :value="model.servers"
            @change="setMulti($event, 'servers')"
        >
          <option v-for="item in serverOptions" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <div>
        <label class="mb-2 block text-xs font-medium text-muted">玩家</label>
        <select
            class="w-full rounded-[calc(var(--ui-radius)*0.9)] border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none"
            multiple
            :value="model.players"
            @change="setMulti($event, 'players')"
        >
          <option v-for="item in playerOptions" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

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
