<script lang="ts" setup>
import {appLocales} from '~/i18n/locales.config'
import type {DurationDisplayMode, DurationDisplayUnit} from '~/composables/useDurationFormatSettings'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const {t, locale, setLocale} = useI18n()
const {formatDuration} = useLocaleFormatting()
const {
  settings: durationSettings,
  updateSettings: updateDurationSettings,
  maxUnitOptions,
  minUnitOptions,
  unitCountOptions
} = useDurationFormatSettings()

const activeTab = ref<'language' | 'timeFormat'>('language')
// noinspection PointlessArithmeticExpressionJS
const durationPreviewMs = 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000 + 2 * 60 * 1000 + 21 * 1000

const selectedLocale = computed({
  get: () => locale.value,
  set: async (value: string) => {
    if (!value || value === locale.value) return
    await setLocale(value)
  }
})

const selectedDurationMaxUnit = computed({
  get: () => durationSettings.value.maxUnit,
  set: (value: DurationDisplayUnit) => updateDurationSettings({maxUnit: value})
})

const selectedDurationMinUnit = computed({
  get: () => durationSettings.value.minUnit,
  set: (value: DurationDisplayUnit) => updateDurationSettings({minUnit: value})
})

const selectedDurationUnitCount = computed({
  get: () => durationSettings.value.unitCount,
  set: (value: number) => updateDurationSettings({unitCount: Number(value)})
})

const selectedDurationMode = computed({
  get: () => durationSettings.value.mode,
  set: (value: DurationDisplayMode) => updateDurationSettings({mode: value})
})

const localeOptions = computed(() =>
    appLocales.map((item) => ({
      value: item.code,
      label: item.name
    }))
)

const tabOptions = computed(() => [
  {value: 'language' as const, label: t('settings.tabs.language')},
  {value: 'timeFormat' as const, label: t('settings.tabs.timeFormat')}
])

const durationUnitSelectOptions = computed(() => ({
  max: maxUnitOptions.value.map((item) => ({
    value: item.value,
    label: t(`settings.duration.units.${item.value}`)
  })),
  min: minUnitOptions.value.map((item) => ({
    value: item.value,
    label: t(`settings.duration.units.${item.value}`)
  }))
}))

const durationUnitCountSelectOptions = computed(() =>
    unitCountOptions.value.map((item) => ({
      value: item.value,
      label: t('settings.duration.unitCountOption', {count: item.value})
    }))
)

const durationModeOptions = computed(() => [
  {value: 'localized' as const, label: t('settings.duration.modes.localized')},
  {value: 'colon' as const, label: t('settings.duration.modes.colon')}
])

const durationPreview = computed(() => formatDuration(durationPreviewMs))
</script>

<template>
  <UModal
      :open="props.open"
      :ui="{
      overlay: 'bg-black/35 backdrop-blur-[2px]',
      content: 'bg-(--ui-bg)/90 backdrop-blur-[4px] sm:max-w-2xl rounded-2xl shadow-2xl'
    }"
      @update:open="value => { if (!value) emit('close') }"
  >
    <template #content>
      <div class="p-4 sm:p-6">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <div class="text-sm text-muted">{{ t('nav.settings') }}</div>
            <h2 class="mt-1 text-xl font-semibold text-highlighted">{{ t('settings.title') }}</h2>
            <p class="mt-2 text-sm text-toned">{{ t('settings.description') }}</p>
          </div>
          <UButton color="neutral" icon="i-lucide-x" variant="ghost" @click="emit('close')"/>
        </div>

        <div class="mb-4 grid grid-cols-2 rounded-xl border border-default bg-elevated p-1">
          <button
              v-for="tab in tabOptions"
              :key="tab.value"
              :class="activeTab === tab.value ? 'bg-default text-highlighted shadow-sm' : 'text-muted hover:text-highlighted'"
              class="rounded-lg px-3 py-2 text-sm font-medium transition"
              type="button"
              @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'language'" class="space-y-4 rounded-xl border border-default bg-elevated p-4">
          <div>
            <div class="text-sm font-medium text-highlighted">{{ t('settings.language') }}</div>
            <p class="mt-1 text-sm text-toned">{{ t('settings.languageDescription') }}</p>
          </div>

          <div>
            <USelect
                v-model="selectedLocale"
                :items="localeOptions"
                class="w-full"
                size="lg"
                value-key="value"
            />
          </div>
        </div>

        <div v-else class="space-y-4 rounded-xl border border-default bg-elevated p-4">
          <div>
            <div class="text-sm font-medium text-highlighted">{{ t('settings.duration.title') }}</div>
            <p class="mt-1 text-sm text-toned">{{ t('settings.duration.description') }}</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-2 block text-xs font-medium text-muted">{{ t('settings.duration.mode') }}</label>
              <USelect
                  v-model="selectedDurationMode"
                  :items="durationModeOptions"
                  class="w-full"
                  size="lg"
                  value-key="value"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-medium text-muted">{{ t('settings.duration.unitCount') }}</label>
              <USelect
                  v-model="selectedDurationUnitCount"
                  :items="durationUnitCountSelectOptions"
                  class="w-full"
                  size="lg"
                  value-key="value"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-medium text-muted">{{ t('settings.duration.maxUnit') }}</label>
              <USelect
                  v-model="selectedDurationMaxUnit"
                  :items="durationUnitSelectOptions.max"
                  class="w-full"
                  size="lg"
                  value-key="value"
              />
            </div>

            <div>
              <label class="mb-2 block text-xs font-medium text-muted">{{ t('settings.duration.minUnit') }}</label>
              <USelect
                  v-model="selectedDurationMinUnit"
                  :items="durationUnitSelectOptions.min"
                  class="w-full"
                  size="lg"
                  value-key="value"
              />
            </div>
          </div>

          <div class="rounded-xl border border-default bg-default p-3 text-sm">
            <div class="text-muted">{{ t('settings.duration.previewLabel') }}</div>
            <div class="mt-1 text-lg font-semibold text-highlighted">{{ durationPreview }}</div>
            <p class="mt-2 text-xs text-toned">{{ t('settings.duration.previewDescription') }}</p>
          </div>
        </div>

        <div class="mt-5 flex justify-end">
          <UButton color="neutral" variant="outline" @click="emit('close')">{{ t('common.close') }}</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
