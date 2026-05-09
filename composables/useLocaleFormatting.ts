import {
    DURATION_UNIT_MS,
    type DurationDisplayUnit,
    type DurationFormatSettings,
    getDurationUnitsInRange,
    normalizeDurationFormatSettings,
    useDurationFormatSettings
} from '~/composables/useDurationFormatSettings'

export type DateTimeFormatKey = 'datetimeShort' | 'datetimeLong'
export type TimeFormatKey = 'timeShort' | 'timeMedium'
export type NumberFormatKey = 'integer' | 'decimal' | 'compact'

type DurationPart = {
    unit: DurationDisplayUnit
    value: number
}

type DurationFormatInput = {
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
}

type DurationFormatConstructor = new (
    locales?: string | string[],
    options?: { style?: 'long' | 'short' | 'narrow' }
) => {
    format(value: DurationFormatInput): string
}

const EMPTY_VALUE = '—'
const DURATION_UNIT_KEYS: Record<DurationDisplayUnit, keyof DurationFormatInput> = {
    day: 'days',
    hour: 'hours',
    minute: 'minutes',
    second: 'seconds'
}

const FALLBACK_DATE_TIME_FORMATS: Record<DateTimeFormatKey | TimeFormatKey, Intl.DateTimeFormatOptions> = {
    datetimeShort: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    },
    datetimeLong: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
    },
    timeShort: {
        hour: 'numeric',
        minute: '2-digit'
    },
    timeMedium: {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
    }
}

const FALLBACK_NUMBER_FORMATS: Record<NumberFormatKey, Intl.NumberFormatOptions> = {
    integer: {
        style: 'decimal',
        maximumFractionDigits: 0
    },
    decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    },
    compact: {
        notation: 'compact',
        maximumFractionDigits: 1
    }
}

function isInvalidNumber(value?: number | null): value is null | undefined {
    return value === null || value === undefined || Number.isNaN(value)
}

function normalizeDateValue(value: number | string | Date) {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

    if (typeof value === 'number') {
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date
    }

    if (typeof value === 'string') {
        const normalized = value.includes(' ') && !value.includes('T')
            ? value.replace(' ', 'T')
            : value
        const date = new Date(normalized)
        return Number.isNaN(date.getTime()) ? null : date
    }

    return null
}

function roundUpToUnit(value: number, unit: DurationDisplayUnit) {
    const unitMs = DURATION_UNIT_MS[unit]
    return Math.ceil(value / unitMs) * unitMs
}

function getDurationParts(value: number, settings: DurationFormatSettings) {
    const normalizedSettings = normalizeDurationFormatSettings(settings)
    const units = getDurationUnitsInRange(normalizedSettings.maxUnit, normalizedSettings.minUnit)
    let remaining = roundUpToUnit(value, normalizedSettings.minUnit)

    const parts = units.map<DurationPart>((unit) => {
        const unitMs = DURATION_UNIT_MS[unit]
        const partValue = Math.floor(remaining / unitMs)
        remaining -= partValue * unitMs
        return {
            unit,
            value: partValue
        }
    })

    const nonZeroParts = parts.filter((part) => part.value > 0)
    const visibleParts = nonZeroParts.slice(0, normalizedSettings.unitCount)

    return visibleParts.length
        ? visibleParts
        : [{unit: normalizedSettings.minUnit, value: 1}]
}

export function useLocaleFormatting() {
    const {d, n, locale} = useI18n()
    const {settings: durationFormatSettings} = useDurationFormatSettings()

    function currentLocale() {
        return locale.value || 'en-US'
    }

    function formatDateTime(value?: number | string | Date | null, format: DateTimeFormatKey = 'datetimeLong') {
        if (value === null || value === undefined || value === '') return EMPTY_VALUE

        const normalized = normalizeDateValue(value)
        if (!normalized) return typeof value === 'string' ? value : EMPTY_VALUE

        try {
            return d(normalized, format) || formatDateTimeWithIntl(normalized, format)
        } catch {
            return formatDateTimeWithIntl(normalized, format)
        }
    }

    function formatDateTimeWithIntl(value: Date, format: DateTimeFormatKey | TimeFormatKey) {
        return new Intl.DateTimeFormat(currentLocale(), FALLBACK_DATE_TIME_FORMATS[format]).format(value)
    }

    function formatTime(value?: number | string | Date | null, format: TimeFormatKey = 'timeMedium') {
        if (value === null || value === undefined || value === '') return EMPTY_VALUE

        const normalized = normalizeDateValue(value)
        if (!normalized) return typeof value === 'string' ? value : EMPTY_VALUE

        try {
            return d(normalized, format) || formatDateTimeWithIntl(normalized, format)
        } catch {
            return formatDateTimeWithIntl(normalized, format)
        }
    }

    function formatNumber(value?: number | null, format: NumberFormatKey = 'integer') {
        if (isInvalidNumber(value)) return EMPTY_VALUE

        try {
            return n(value, format) || formatNumberWithIntl(value, format)
        } catch {
            return formatNumberWithIntl(value, format)
        }
    }

    function formatNumberWithIntl(value: number, format: NumberFormatKey) {
        return new Intl.NumberFormat(currentLocale(), FALLBACK_NUMBER_FORMATS[format]).format(value)
    }

    function formatDuration(value?: number | null, overrideSettings?: Partial<DurationFormatSettings>) {
        if (isInvalidNumber(value) || value <= 0) return EMPTY_VALUE

        const settings = normalizeDurationFormatSettings({
            ...durationFormatSettings.value,
            ...overrideSettings
        })
        const parts = getDurationParts(value, settings)

        return settings.mode === 'colon'
            ? formatDurationAsColon(parts)
            : formatDurationAsLocalizedText(parts)
    }

    function formatDurationAsLocalizedText(parts: readonly DurationPart[]) {
        return formatDurationWithIntlDuration(parts) || formatDurationWithUnitParts(parts)
    }

    function formatDurationWithIntlDuration(parts: readonly DurationPart[]) {
        const DurationFormat = (Intl as typeof Intl & { DurationFormat?: DurationFormatConstructor }).DurationFormat
        if (!DurationFormat) return null

        try {
            const duration: DurationFormatInput = {}
            for (const part of parts) {
                duration[DURATION_UNIT_KEYS[part.unit]] = part.value
            }
            return new DurationFormat(currentLocale(), {style: 'long'}).format(duration)
        } catch {
            return null
        }
    }

    function formatDurationWithUnitParts(parts: readonly DurationPart[]) {
        const formattedParts = parts.map((part) => formatDurationUnit(part.value, part.unit))
        return joinDurationParts(formattedParts)
    }

    function formatDurationUnit(value: number, unit: DurationDisplayUnit) {
        try {
            return new Intl.NumberFormat(currentLocale(), {
                style: 'unit',
                unit,
                unitDisplay: 'long'
            }).format(value)
        } catch {
            return `${formatNumberWithIntl(value, 'integer')} ${unit}${value === 1 ? '' : 's'}`
        }
    }

    function formatDurationAsColon(parts: readonly DurationPart[]) {
        const [firstPart, ...restParts] = parts
        if (!firstPart) return EMPTY_VALUE

        const values = [String(firstPart.value), ...restParts.map((part) => String(part.value).padStart(2, '0'))]
        return values.join(':')
    }

    function joinDurationParts(parts: readonly string[]) {
        try {
            return new Intl.ListFormat(currentLocale(), {
                type: 'unit',
                style: 'short'
            }).format([...parts])
        } catch {
            return parts.join(' ')
        }
    }

    function compareText(a: string, b: string) {
        const compareLocale = locale.value === 'zh-CN'
            ? 'zh-Hans-CN'
            : locale.value === 'zh-TW'
                ? 'zh-Hant-TW'
                : currentLocale()
        return a.localeCompare(b, compareLocale, {numeric: true, sensitivity: 'base'})
    }

    return {
        formatDateTime,
        formatTime,
        formatNumber,
        formatDuration,
        compareText
    }
}
