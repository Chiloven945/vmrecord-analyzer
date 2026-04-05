import Papa from 'papaparse'
import type {RawCsvRow} from '~/types/record'

export const CSV_FIELD_OPTIONS = [
    'type',
    'timestamp',
    'server',
    'sender_name',
    'receiver_name',
    'message',
    'sender_uuid',
    'sender_prefix',
    'sender_suffix',
    'receiver_uuid',
    'receiver_prefix',
    'receiver_suffix',
    'command'
] as const

export const REQUIRED_CSV_FIELDS = ['type', 'timestamp'] as const

export type CsvFieldName = (typeof CSV_FIELD_OPTIONS)[number]
export type CsvHeaderMapping = Partial<Record<CsvFieldName, number>>

export interface CsvInspection {
    guessedHasHeader: boolean
    detectedHeaders: string[]
    previewRows: string[][]
    totalRows: number
}

function parseArrayRows(text: string): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        Papa.parse<string[]>(text, {
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                const fatal = results.errors.find((e) => e.code !== 'UndetectableDelimiter')
                if (fatal) {
                    reject(new Error(`${fatal.message} (row ${fatal.row ?? 'unknown'})`))
                    return
                }

                const rows = (results.data as unknown as string[][]).map((row) =>
                    Array.isArray(row) ? row.map((cell) => (cell ?? '').toString()) : []
                )

                resolve(rows)
            },
            error: reject
        })
    })
}

function normalizeHeaderName(value: string) {
    return value.trim().toLowerCase()
}

function guessHasHeader(firstRow: string[]) {
    const normalized = firstRow.map(normalizeHeaderName)
    const knownHeaders = new Set<string>(CSV_FIELD_OPTIONS)
    const matched = normalized.filter((value) => knownHeaders.has(value))
    const requiredMatched = REQUIRED_CSV_FIELDS.filter((value) => normalized.includes(value))

    return requiredMatched.length === REQUIRED_CSV_FIELDS.length || matched.length >= 3
}

export async function inspectCsvText(text: string): Promise<CsvInspection> {
    const rows = await parseArrayRows(text)
    const firstRow = rows[0] ?? []
    const guessedHasHeader = guessHasHeader(firstRow)

    return {
        guessedHasHeader,
        detectedHeaders: guessedHasHeader ? firstRow.map((cell) => cell.trim()) : [],
        previewRows: guessedHasHeader ? rows.slice(1, 6) : rows.slice(0, 5),
        totalRows: guessedHasHeader ? Math.max(rows.length - 1, 0) : rows.length
    }
}

export function buildRowsFromMapping(rows: string[][], mapping: CsvHeaderMapping): RawCsvRow[] {
    return rows.map((row) => {
        const out: RawCsvRow = {}

        for (const [field, index] of Object.entries(mapping) as [CsvFieldName, number][]) {
            if (typeof index !== 'number' || index < 0) continue
            out[field] = row[index] ?? ''
        }

        return out
    })
}

export async function parseCsvText(text: string, mapping?: CsvHeaderMapping): Promise<RawCsvRow[]> {
    if (mapping) {
        const rows = await parseArrayRows(text)
        return buildRowsFromMapping(rows, mapping)
    }

    return new Promise((resolve, reject) => {
        Papa.parse<RawCsvRow>(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                const fatal = results.errors.find((e) => e.code !== 'UndetectableDelimiter')
                if (fatal) {
                    reject(new Error(`${fatal.message} (row ${fatal.row ?? 'unknown'})`))
                    return
                }
                resolve(results.data)
            },
            error: reject
        })
    })
}
