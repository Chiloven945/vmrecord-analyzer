export default defineI18nConfig(() => ({
    locale: 'zh-CN',
    fallbackLocale: 'en-US',
    missingWarn: false,
    fallbackWarn: false,
    datetimeFormats: {
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
        },
        'el-GR': {
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
    },
    numberFormats: {
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
        },
        'el-GR': {
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
}))
