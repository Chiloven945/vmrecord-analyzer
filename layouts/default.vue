<script setup lang="ts">
const {t} = useI18n()

const navigation = computed(() => [
  {label: t('nav.overview'), to: '/', icon: 'i-lucide-layout-dashboard'},
  {label: t('nav.records'), to: '/records', icon: 'i-lucide-scroll-text'},
  {label: t('nav.players'), to: '/players', icon: 'i-lucide-users'},
  {label: t('nav.servers'), to: '/servers', icon: 'i-lucide-server'}
])

const settingsOpen = ref(false)
const githubUrl = 'https://github.com/Chiloven945/vmrecord-analyzer'
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto grid min-h-screen max-w-425 lg:grid-cols-[260px_1fr]">
      <aside class="border-b border-default bg-default/70 backdrop-blur lg:border-b-0 lg:border-r">
        <div class="sticky top-0 flex min-h-screen flex-col p-4 lg:p-6">
          <div>
            <div class="mb-6 flex items-center gap-3">
              <div
                  class="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20"
              >
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

              <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-toned transition hover:bg-elevated hover:text-highlighted"
                  @click="settingsOpen = true"
              >
                <UIcon name="i-lucide-settings-2" class="size-4"/>
                <span>{{ t('nav.settings') }}</span>
              </button>
            </nav>
          </div>

          <div class="mt-auto pt-6">
            <div class="rounded-2xl border border-default bg-elevated/70 p-4">
              <p class="text-sm font-medium text-highlighted">{{ t('license.title') }}</p>
              <p class="mt-2 text-sm text-muted">AGPL-3.0</p>
              <p class="mt-2 text-xs leading-5 text-muted">
                {{ t('license.description') }}
              </p>

              <div class="mt-4 flex justify-start">
                <UButton
                    :to="githubUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-github"
                    :label="t('common.github')"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main class="min-w-0">
        <div class="p-4 lg:p-8">
          <slot/>
        </div>
      </main>
    </div>

    <SettingsDialog :open="settingsOpen" @close="settingsOpen = false"/>
  </div>
</template>
