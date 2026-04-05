<script setup lang="ts">
import {highlightText} from '~/utils/highlight'

const props = defineProps<{
  text: string
  keyword: string
}>()

const html = computed(() => highlightText(props.text || '', props.keyword || ''))
</script>

<template>
  <span class="whitespace-pre-wrap break-words" v-html="html"/>
</template>
