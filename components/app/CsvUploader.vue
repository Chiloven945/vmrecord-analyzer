<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  file: [file: File]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function emitFile(file?: File | null) {
  if (!file) return
  emit('file', file)
}

function pick(event: Event) {
  const input = event.target as HTMLInputElement
  emitFile(input.files?.[0])
}

function openPicker() {
  inputRef.value?.click()
}

function drop(event: DragEvent) {
  event.preventDefault()
  emitFile(event.dataTransfer?.files?.[0])
}
</script>

<template>
  <UCard class="border-dashed">
    <div
        class="flex min-h-[260px] flex-col items-center justify-center rounded-[calc(var(--ui-radius)*1.1)] px-6 py-8 text-center"
        @dragover.prevent
        @drop="drop"
    >
      <div
          class="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <UIcon :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-file-spreadsheet'" class="size-7"
               :class="loading ? 'animate-spin' : ''"/>
      </div>

      <h2 class="mt-5 text-2xl font-semibold text-highlighted">导入 vMessageRecord CSV</h2>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-toned">
        支持拖拽上传，也支持直接点击下面的上传框选择文件。解析、索引、筛选全部在本地完成，不上传服务器。
      </p>

      <div class="mt-6 w-full max-w-2xl rounded-2xl border border-default bg-elevated/60 p-4 text-left">
        <label for="csv-file-input" class="mb-2 block text-sm font-medium text-highlighted">上传 CSV 文件</label>
        <input
            id="csv-file-input"
            ref="inputRef"
            type="file"
            accept=".csv,text/csv"
            class="block w-full cursor-pointer rounded-xl border border-default bg-default px-3 py-2.5 text-sm text-highlighted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-inverted"
            @change="pick"
        >
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <span class="text-xs text-muted">如果拖拽没有反应，请直接点击上方上传框的按钮。</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
