<script setup lang="ts">
import {renderMinecraftMiniMessage} from '~/utils/minecraftFormat'

const props = defineProps<{
  text?: string
}>()

const html = computed(() => renderMinecraftMiniMessage(props.text))
</script>

<template>
  <span v-if="text" class="whitespace-pre-wrap" v-html="html"/>
</template>
