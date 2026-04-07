<script setup lang="ts">
const {t} = useI18n()
const {formatNumber} = useLocaleFormatting()

const props = defineProps<{
  items: Array<{ label: string; value: number }>
  emptyText?: string
}>()

const maxValue = computed(() => Math.max(...props.items.map((item) => item.value), 1))
</script>

<template>
  <div v-if="items.length" class="space-y-3">
    <div v-for="item in items" :key="item.label" class="space-y-1.5">
      <div class="flex items-center justify-between gap-4 text-sm">
        <span class="truncate text-highlighted">{{ item.label }}</span>
        <span class="text-toned">{{ formatNumber(item.value) }}</span>
      </div>
      <div class="h-2 rounded-full bg-elevated">
        <div
            class="h-2 rounded-full bg-primary transition-all"
            :style="{ width: `${(item.value / maxValue) * 100}%` }"
        />
      </div>
    </div>
  </div>
  <div v-else class="py-6 text-sm text-muted">
    {{ emptyText || t('common.noData') }}
  </div>
</template>
