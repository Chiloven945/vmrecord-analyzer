<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  description?: string
  icon?: string
}>()
</script>

<template>
  <UCard :ui="{ body: 'p-5 sm:p-5' }">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm text-muted">{{ title }}</p>
        <p class="mt-2 text-3xl font-semibold text-highlighted">{{ value }}</p>
        <p v-if="description" class="mt-2 text-xs text-toned">{{ description }}</p>
      </div>
      <div v-if="icon" class="rounded-xl bg-primary/10 p-2 text-primary ring-1 ring-primary/15">
        <UIcon :name="icon" class="size-5"/>
      </div>
    </div>
  </UCard>
</template>
