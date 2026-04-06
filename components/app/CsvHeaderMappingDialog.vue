<script setup lang="ts">
import type {CsvFieldName, CsvHeaderMapping} from '~/utils/csv.client'
import {CSV_FIELD_OPTIONS, REQUIRED_CSV_FIELDS} from '~/utils/csv.client'

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
      label: `${index + 1}`,
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
  <UModal
      :open="open"
      :ui="{
      overlay: 'bg-black/35 backdrop-blur-[2px]',
      content: 'bg-(--ui-bg)/90 backdrop-blur-[4px] sm:max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl'
    }"
      @update:open="value => { if (!value) emit('close') }"
  >
    <template #content>
      <div class="flex max-h-[90vh] flex-col">
        <div class="flex items-start justify-between gap-4 border-b border-default p-4 sm:p-6">
          <div>
            <div class="text-sm text-muted">CSV 导入</div>
            <h2 class="mt-1 text-lg font-semibold text-highlighted">没有检测到表头，请手动匹配字段</h2>
            <p class="mt-2 text-sm text-toned">
              无法将 CSV 第一行识别为 header。请匹配对应的字段，并确保至少映射
              <code class="rounded bg-elevated px-1.5 py-0.5 text-xs text-highlighted">type</code>
              和
              <code class="rounded bg-elevated px-1.5 py-0.5 text-xs text-highlighted">timestamp</code>。
            </p>
          </div>
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="emit('close')"/>
        </div>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div class="space-y-4">
              <div
                  v-if="missingRequired.length"
                  class="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
              >
                缺少必填字段：{{ missingRequired.join(', ') }}
              </div>

              <div
                  v-if="duplicateColumns.size"
                  class="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning"
              >
                同一列不能重复映射到多个字段。
              </div>

              <div
                  class="space-y-4 rounded-xl border border-default bg-elevated/60 p-3"
              >
                <div v-for="field in targetFields" :key="field">
                  <label class="mb-2 flex items-center gap-2 text-sm font-medium text-highlighted">
                    <span>{{ field }}</span>
                    <UBadge
                        v-if="REQUIRED_CSV_FIELDS.includes(field as 'type' | 'timestamp')"
                        color="error"
                        variant="subtle"
                    >
                      必填
                    </UBadge>
                  </label>

                  <select
                      v-model="draft[field]"
                      class="w-full rounded-xl border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">不映射</option>
                    <option
                        v-for="option in columnOptions"
                        :key="`${field}-${option.value}`"
                        :value="option.value"
                    >
                      {{ option.label }}{{ option.sample ? `：${option.sample}` : '' }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="min-w-0">
              <div class="mb-3 text-sm font-medium text-highlighted">预览前 5 行数据</div>
              <div class="overflow-auto rounded-xl border border-default bg-elevated/60">
                <table class="min-w-full border-collapse text-sm">
                  <thead class="bg-elevated/80">
                  <tr>
                    <th
                        v-for="columnIndex in columnCount"
                        :key="`head-${columnIndex}`"
                        class="border-b border-default px-3 py-2 text-left font-medium text-highlighted"
                    >
                      {{ columnIndex }}
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr
                      v-for="(row, rowIndex) in previewRows"
                      :key="`row-${rowIndex}`"
                      class="odd:bg-default/60 even:bg-elevated/40"
                  >
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
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-default p-4 sm:p-6">
          <UButton color="neutral" variant="outline" @click="emit('close')">取消</UButton>
          <UButton icon="i-lucide-check" :disabled="!canSubmit" @click="submit">
            导入并应用映射
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
