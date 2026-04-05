export default defineNuxtConfig({
    compatibilityDate: '2026-04-05',
    devtools: {enabled: true},
    modules: ['@nuxt/ui', '@pinia/nuxt'],
    css: ['~/assets/css/main.css'],
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
