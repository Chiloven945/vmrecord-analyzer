import Papa from 'papaparse'
import type {RawCsvRow} from '~/types/record'

export function parseCsvText(text: string): Promise<RawCsvRow[]> {
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
