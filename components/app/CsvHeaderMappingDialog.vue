<script setup lang="ts">
import type {CsvFieldName, CsvHeaderMapping} from '~/utils/csv'
import {CSV_FIELD_OPTIONS, REQUIRED_CSV_FIELDS} from '~/utils/csv'

const props = defineProps<{
  open: boolean
  previewRows: string[][]
}>()

const emit = defineEmits<{
  close: []
  confirm: [mapping: CsvHeaderMapping]
}>()

const targetFields = CSV_FIELD_OPTIONS
const draft = reactive<Record<CsvFieldName, string>>(
    Object.fromEntries(targetFields.map((field) => [field, ''])) as Record<CsvFieldName, string>
)

const columnCount = computed(() => Math.max(0, ...props.previewRows.map((row) => row.length)))
const columnOptions = computed(() =>
    Array.from({length: columnCount.value}, (_, index) => ({
      value: String(index),
      label: `第 ${index + 1} 列`,
      sample: props.previewRows
          .map((row) => row[index] ?? '')
          .filter(Boolean)
          .slice(0, 2)
          .join(' | ')
    }))
)

const duplicateColumns = computed(() => {
  const used = new Map<string, number>()
  for (const value of Object.values(draft)) {
    if (!value) continue
    used.set(value, (used.get(value) || 0) + 1)
  }
  return new Set([...used.entries()].filter(([, count]) => count > 1).map(([value]) => value))
})

const missingRequired = computed(() => REQUIRED_CSV_FIELDS.filter((field) => !draft[field]))
const canSubmit = computed(() => missingRequired.value.length === 0 && duplicateColumns.value.size === 0)

watch(
    () => props.open,
    (open) => {
      if (!open) return
      for (const field of targetFields) {
        draft[field] = ''
      }
    }
)

function submit() {
  if (!canSubmit.value) return

  const mapping: CsvHeaderMapping = {}
  for (const field of targetFields) {
    const value = draft[field]
    if (value === '') continue
    mapping[field] = Number(value)
  }

  emit('confirm', mapping)
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <UCard class="max-h-[90vh] w-full max-w-6xl overflow-hidden">
      <template #header>
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-highlighted">没有检测到表头，请手动匹配字段</h2>
            <p class="mt-1 text-sm text-toned">
              你的 CSV 第一行看起来不像 header。请选择每个字段对应的是哪一列，至少要映射 <code>type</code> 和 <code>timestamp</code>。
            </p>
          </div>
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="emit('close')"/>
        </div>
      </template>

      <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div class="space-y-4 overflow-auto pr-1">
          <div v-if="missingRequired.length"
               class="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            缺少必填字段：{{ missingRequired.join(', ') }}
          </div>
          <div v-if="duplicateColumns.size"
               class="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            同一列不能重复映射到多个字段。
          </div>

          <div v-for="field in targetFields" :key="field">
            <label class="mb-2 flex items-center gap-2 text-sm font-medium text-highlighted">
              <span>{{ field }}</span>
              <UBadge v-if="REQUIRED_CSV_FIELDS.includes(field as 'type' | 'timestamp')" color="error" variant="subtle">
                必填
              </UBadge>
            </label>
            <select
                v-model="draft[field]"
                class="w-full rounded-xl border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none"
            >
              <option value="">不映射</option>
              <option v-for="option in columnOptions" :key="`${field}-${option.value}`" :value="option.value">
                {{ option.label }}{{ option.sample ? `：${option.sample}` : '' }}
              </option>
            </select>
          </div>
        </div>

        <div class="overflow-auto">
          <div class="mb-3 text-sm font-medium text-highlighted">预览前 5 行数据</div>
          <div class="overflow-auto rounded-xl border border-default">
            <table class="min-w-full border-collapse text-sm">
              <thead class="bg-elevated">
              <tr>
                <th
                    v-for="columnIndex in columnCount"
                    :key="`head-${columnIndex}`"
                    class="border-b border-default px-3 py-2 text-left font-medium text-highlighted"
                >
                  第 {{ columnIndex }} 列
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(row, rowIndex) in previewRows" :key="`row-${rowIndex}`"
                  class="odd:bg-default even:bg-elevated/40">
                <td
                    v-for="columnIndex in columnCount"
                    :key="`cell-${rowIndex}-${columnIndex}`"
                    class="max-w-[220px] border-b border-default px-3 py-2 align-top text-toned"
                >
                  <span class="whitespace-pre-wrap break-all">{{ row[columnIndex - 1] ?? '' }}</span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <UButton color="neutral" variant="outline" @click="emit('close')">取消</UButton>
          <UButton icon="i-lucide-check" :disabled="!canSubmit" @click="submit">导入并应用映射</UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
