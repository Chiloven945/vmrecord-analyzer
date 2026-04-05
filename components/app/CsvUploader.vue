<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  file: [file: File]
}>()

function pick(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('file', file)
}

function drop(event: DragEvent) {
  event.preventDefault()
  const file = event.dataTransfer?.files?.[0]
  if (file) emit('file', file)
}
</script>

<template>
  <UCard
      class="soft-grid border-dashed"
      :ui="{ body: 'p-0' }"
  >
    <label
        class="flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-[calc(var(--ui-radius)*1.1)] px-6 text-center"
        @dragover.prevent
        @drop="drop"
    >
      <input type="file" class="hidden" accept=".csv,text/csv" @change="pick"/>
      <div class="mx-auto max-w-2xl">
        <div
            class="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <UIcon :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-file-spreadsheet'" class="size-7"
                 :class="loading ? 'animate-spin' : ''"/>
        </div>
        <h2 class="mt-5 text-2xl font-semibold text-highlighted">导入 vMessageRecord CSV</h2>
        <p class="mt-3 text-sm leading-6 text-toned">
          拖拽文件到这里，或者点击选择。解析、索引、筛选全部在本地完成，不上传服务器。
        </p>
        <div class="mt-6 inline-flex rounded-full border border-default bg-elevated px-4 py-2 text-sm text-highlighted">
          {{ loading ? '正在解析...' : '选择 CSV 文件' }}
        </div>
      </div>
    </label>
  </UCard>
</template>
