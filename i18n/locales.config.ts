export interface AppLocaleDefinition {
    code: string
    language: string
    file: string
    name: string
}

export const appLocales: AppLocaleDefinition[] = [
    {
        code: 'el-GR',
        language: 'el-GR',
        file: 'el-GR.json',
        name: 'Ελληνικά (Ελλάδα)'
    },
    {
        code: 'en-US',
        language: 'en-US',
        file: 'en-US.json',
        name: 'English (US)'
    },
    {
        code: 'ja-JP',
        language: 'ja-JP',
        file: 'ja-JP.json',
        name: '日本語（日本）'
    },
    {
        code: 'zh-CN',
        language: 'zh-CN',
        file: 'zh-CN.json',
        name: '简体中文（中国大陆）'
    },
    {
        code: 'zh-TW',
        language: 'zh-TW',
        file: 'zh-TW.json',
        name: '繁體中文（台灣）'
    }
]
