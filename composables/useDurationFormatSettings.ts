import {useStorage} from '@vueuse/core'

export type DurationDisplayUnit = 'day' | 'hour' | 'minute' | 'second'
export type DurationDisplayMode = 'localized' | 'colon'

export interface DurationFormatSettings {
    maxUnit: DurationDisplayUnit
    minUnit: DurationDisplayUnit
    unitCount: number
    mode: DurationDisplayMode
}

export const DURATION_UNITS: readonly DurationDisplayUnit[] = ['day', 'hour', 'minute', 'second']
export const DURATION_UNIT_MS: Record<DurationDisplayUnit, number> = {
    day: 86_400_000,
    hour: 3_600_000,
    minute: 60_000,
    second: 1_000
}

export const DEFAULT_DURATION_FORMAT_SETTINGS: DurationFormatSettings = {
    maxUnit: 'day',
    minUnit: 'minute',
    unitCount: 2,
    mode: 'localized'
}

function unitIndex(unit: DurationDisplayUnit) {
    return DURATION_UNITS.indexOf(unit)
}

function isDurationUnit(value: unknown): value is DurationDisplayUnit {
    return typeof value === 'string' && DURATION_UNITS.includes(value as DurationDisplayUnit)
}

function isDurationMode(value: unknown): value is DurationDisplayMode {
    return value === 'localized' || value === 'colon'
}

export function getDurationUnitsInRange(maxUnit: DurationDisplayUnit, minUnit: DurationDisplayUnit) {
    const maxIndex = unitIndex(maxUnit)
    const minIndex = unitIndex(minUnit)
    return DURATION_UNITS.slice(maxIndex, minIndex + 1)
}

export function normalizeDurationFormatSettings(value?: Partial<DurationFormatSettings> | null): DurationFormatSettings {
    const maxUnit = isDurationUnit(value?.maxUnit) ? value.maxUnit : DEFAULT_DURATION_FORMAT_SETTINGS.maxUnit
    let minUnit = isDurationUnit(value?.minUnit) ? value.minUnit : DEFAULT_DURATION_FORMAT_SETTINGS.minUnit

    if (unitIndex(minUnit) < unitIndex(maxUnit)) {
        minUnit = maxUnit
    }

    const availableUnitCount = getDurationUnitsInRange(maxUnit, minUnit).length
    const parsedUnitCount = Number(value?.unitCount ?? DEFAULT_DURATION_FORMAT_SETTINGS.unitCount)
    const unitCount = Number.isFinite(parsedUnitCount)
        ? Math.min(Math.max(1, Math.trunc(parsedUnitCount)), availableUnitCount)
        : DEFAULT_DURATION_FORMAT_SETTINGS.unitCount

    const mode = isDurationMode(value?.mode) ? value.mode : DEFAULT_DURATION_FORMAT_SETTINGS.mode

    return {
        maxUnit,
        minUnit,
        unitCount,
        mode
    }
}

export function useDurationFormatSettings() {
    const storage = import.meta.client ? window.localStorage : undefined
    const rawSettings = useStorage<DurationFormatSettings>(
        'vmrecord-analyzer-duration-format-settings',
        DEFAULT_DURATION_FORMAT_SETTINGS,
        storage,
        {mergeDefaults: true}
    )

    const settings = computed({
        get: () => normalizeDurationFormatSettings(rawSettings.value),
        set: (value: Partial<DurationFormatSettings>) => {
            rawSettings.value = normalizeDurationFormatSettings({
                ...normalizeDurationFormatSettings(rawSettings.value),
                ...value
            })
        }
    })

    function updateSettings(next: Partial<DurationFormatSettings>) {
        settings.value = {
            ...settings.value,
            ...next
        }
    }

    const maxUnitOptions = computed(() => DURATION_UNITS.map((unit) => ({value: unit})))

    const minUnitOptions = computed(() => {
        const maxIndex = unitIndex(settings.value.maxUnit)
        return DURATION_UNITS.slice(maxIndex).map((unit) => ({value: unit}))
    })

    const unitCountOptions = computed(() => {
        const count = getDurationUnitsInRange(settings.value.maxUnit, settings.value.minUnit).length
        return Array.from({length: count}, (_, index) => ({value: index + 1}))
    })

    return {
        settings,
        updateSettings,
        maxUnitOptions,
        minUnitOptions,
        unitCountOptions
    }
}
