import type {CsvHeaderMapping, CsvInspection} from '~/utils/csv.client'
import {inspectCsvText, parseCsvText} from '~/utils/csv.client'
import {normalizeRows} from '~/utils/normalize'

export interface PreparedCsvImport {
    file: File
    text: string
    inspection: CsvInspection
}

export function useCsvImport() {
    const {t} = useI18n()
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function prepareFile(file: File): Promise<PreparedCsvImport> {
        loading.value = true
        error.value = null

        try {
            const text = await file.text()
            const inspection = await inspectCsvText(text)
            return {file, text, inspection}
        } catch (err) {
            error.value = err instanceof Error ? err.message : t('upload.parseFailed')
            throw err
        } finally {
            loading.value = false
        }
    }

    async function importPrepared(prepared: PreparedCsvImport, mapping?: CsvHeaderMapping) {
        loading.value = true
        error.value = null

        try {
            const rawRows = await parseCsvText(prepared.text, mapping)
            return normalizeRows(rawRows)
        } catch (err) {
            error.value = err instanceof Error ? err.message : t('upload.parseFailed')
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        prepareFile,
        importPrepared
    }
}
