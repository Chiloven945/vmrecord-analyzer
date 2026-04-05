<script setup lang="ts">
const navigation = [
  {label: '总览', to: '/', icon: 'i-lucide-layout-dashboard'},
  {label: '记录', to: '/records', icon: 'i-lucide-scroll-text'},
  {label: '玩家', to: '/players', icon: 'i-lucide-users'}
]
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto grid min-h-screen max-w-425 lg:grid-cols-[260px_1fr]">
      <aside class="border-b border-default bg-default/70 backdrop-blur lg:border-b-0 lg:border-r">
        <div class="sticky top-0 p-4 lg:p-6">
          <div class="mb-6 flex items-center gap-3">
            <div
                class="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <UIcon name="i-lucide-radio-tower" class="size-5"/>
            </div>
            <div>
              <p class="text-sm text-muted">vMessageRecord</p>
              <h1 class="text-lg font-semibold text-highlighted">vmrecord-analyzer</h1>
            </div>
          </div>

          <nav class="space-y-2">
            <NuxtLink
                v-for="item in navigation"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-toned transition hover:bg-elevated hover:text-highlighted"
                active-class="bg-elevated text-highlighted ring-1 ring-default"
            >
              <UIcon :name="item.icon" class="size-4"/>
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>

          <div class="mt-8 rounded-2xl border border-default bg-elevated/70 p-4 text-sm text-muted">
            <p class="font-medium text-highlighted">数据只在浏览器内分析</p>
            <p class="mt-2 leading-6">导入 vMessageRecord 的 CSV 导出文件，本地完成解析与索引。</p>
          </div>
        </div>
      </aside>

      <main class="min-w-0">
        <div class="p-4 lg:p-8">
          <slot/>
        </div>
      </main>
    </div>
  </div>
</template>
