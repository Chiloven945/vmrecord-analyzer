export type DateTimeFormatKey = 'datetimeShort' | 'datetimeLong'
export type TimeFormatKey = 'timeShort' | 'timeMedium'
export type NumberFormatKey = 'integer' | 'decimal' | 'compact'

const DATE_TIME_FORMATS: Record<string, Record<DateTimeFormatKey | TimeFormatKey, Intl.DateTimeFormatOptions>> = {
    'zh-CN': {
        datetimeShort: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        },
        datetimeLong: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        },
        timeShort: {
            hour: '2-digit',
            minute: '2-digit'
        },
        timeMedium: {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }
    },
    'zh-TW': {
        datetimeShort: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        },
        datetimeLong: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        },
        timeShort: {
            hour: '2-digit',
            minute: '2-digit'
        },
        timeMedium: {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }
    },
    'ja-JP': {
        datetimeShort: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        },
        datetimeLong: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        },
        timeShort: {
            hour: '2-digit',
            minute: '2-digit'
        },
        timeMedium: {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }
    },
    'en-US': {
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
}

const NUMBER_FORMATS: Record<string, Record<NumberFormatKey, Intl.NumberFormatOptions>> = {
    'zh-CN': {
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
    },
    'zh-TW': {
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
    },
    'ja-JP': {
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
    },
    'en-US': {
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
}

export function useLocaleFormatting() {
    const {d, n, locale} = useI18n()

    function resolveLocale() {
        return DATE_TIME_FORMATS[locale.value] ? locale.value : 'en-US'
    }

    function normalizeDateValue(value: number | string | Date) {
        if (value instanceof Date) return value
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

    function fallbackDate(value: Date, format: DateTimeFormatKey | TimeFormatKey) {
        return new Intl.DateTimeFormat(resolveLocale(), DATE_TIME_FORMATS[resolveLocale()][format]).format(value)
    }

    function formatDateTime(value?: number | string | Date | null, format: DateTimeFormatKey = 'datetimeLong') {
        if (value === null || value === undefined || value === '') return '—'

        const normalized = normalizeDateValue(value)
        if (!normalized) {
            return typeof value === 'string' ? value : '—'
        }

        try {
            const formatted = d(normalized, format)
            return formatted || fallbackDate(normalized, format)
        } catch {
            return fallbackDate(normalized, format)
        }
    }

    function formatTime(value?: number | string | Date | null, format: TimeFormatKey = 'timeMedium') {
        if (value === null || value === undefined || value === '') return '—'

        const normalized = normalizeDateValue(value)
        if (!normalized) {
            return typeof value === 'string' ? value : '—'
        }

        try {
            const formatted = d(normalized, format)
            return formatted || fallbackDate(normalized, format)
        } catch {
            return fallbackDate(normalized, format)
        }
    }

    function formatNumber(value?: number | null, format: NumberFormatKey = 'integer') {
        if (value === null || value === undefined || Number.isNaN(value)) return '—'

        try {
            const formatted = n(value, format)
            return formatted || new Intl.NumberFormat(resolveLocale(), NUMBER_FORMATS[resolveLocale()][format]).format(value)
        } catch {
            return new Intl.NumberFormat(resolveLocale(), NUMBER_FORMATS[resolveLocale()][format]).format(value)
        }
    }

    function compareText(a: string, b: string) {
        const currentLocale = locale.value === 'zh-CN'
            ? 'zh-Hans-CN'
            : locale.value === 'zh-TW'
                ? 'zh-Hant-TW'
                : locale.value
        return a.localeCompare(b, currentLocale, {numeric: true, sensitivity: 'base'})
    }

    return {
        formatDateTime,
        formatTime,
        formatNumber,
        compareText
    }
}
