import {parseCsvText} from '~/utils/csv'
import {normalizeRows} from '~/utils/normalize'

export function useCsvImport() {
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function importFile(file: File) {
        loading.value = true
        error.value = null
        try {
            const text = await file.text()
            const rawRows = await parseCsvText(text)
            return normalizeRows(rawRows)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'CSV 解析失败'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {loading, error, importFile}
}
