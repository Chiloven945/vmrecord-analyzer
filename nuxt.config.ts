import {appLocales} from './i18n/locales.config'

export default defineNuxtConfig({
    compatibilityDate: '2026-04-05',
    devtools: {enabled: true},
    modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/i18n'],
    css: ['~/assets/css/main.css'],
    ui: {
        fonts: false
    },
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'zh-CN',
        lazy: true,
        langDir: 'locales',
        locales: appLocales,
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'vmrecord_locale',
            alwaysRedirect: false,
            fallbackLocale: 'zh-CN'
        },
        vueI18n: './i18n/i18n.config.ts'
    },
    components: [
        {
            path: '~/components',
            pathPrefix: false
        }
    ],
    app: {
        head: {
            title: 'vmrecord-analyzer',
            meta: [
                {name: 'viewport', content: 'width=device-width, initial-scale=1'},
                {name: 'description', content: 'Analyze vMessageRecord CSV exports with Nuxt UI 4.'}
            ]
        }
    },
    typescript: {
        strict: true,
        typeCheck: false
    }
})
