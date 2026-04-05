import type {NormalizedRecord} from '~/types/record'

export function getRecordBadgeColor(type: string) {
    switch (type) {
        case 'CHAT':
            return 'info'
        case 'PRIVATE_MESSAGE':
            return 'secondary'
        case 'JOIN':
            return 'success'
        case 'LEAVE':
            return 'error'
        case 'TRANSFER':
            return 'warning'
        default:
            return 'neutral'
    }
}

export function parseTransferFlow(record: Pick<NormalizedRecord, 'message' | 'transferSource' | 'transferTarget' | 'server'>) {
    if (record.transferSource || record.transferTarget) {
        return {
            from: record.transferSource || 'Unknown',
            to: record.transferTarget || record.server || 'Unknown'
        }
    }

    const match = record.message.match(/^\s*(.*?)\s*->\s*(.*?)\s*$/)
    if (match) {
        return {
            from: match[1] || 'Unknown',
            to: match[2] || 'Unknown'
        }
    }

    return {
        from: 'Unknown',
        to: record.server || 'Unknown'
    }
}

export function resolvePlayerServerAt(records: NormalizedRecord[], playerName: string, timeMs: number) {
    const target = playerName.trim().toLowerCase()
    if (!target) return 'Unknown'

    for (let index = records.length - 1; index >= 0; index -= 1) {
        const record = records[index]
        if (record.timeMs > timeMs) continue
        if (!record.server) continue
        if (record.senderName.trim().toLowerCase() !== target) continue

        if (record.type === 'TRANSFER') {
            return record.transferTarget || record.server || 'Unknown'
        }

        if (record.type === 'LEAVE') {
            return record.server || 'Unknown'
        }

        return record.server || 'Unknown'
    }

    return 'Unknown'
}

export function getPrivateMessageServers(records: NormalizedRecord[], record: NormalizedRecord) {
    return {
        senderServer: record.server || resolvePlayerServerAt(records, record.senderName, record.timeMs),
        receiverServer: resolvePlayerServerAt(records, record.receiverName, record.timeMs)
    }
}

export function getRecordSummaryText(record: NormalizedRecord) {
    switch (record.type) {
        case 'JOIN':
            return `${record.senderName || 'Unknown'} 加入 ${record.server || 'Unknown'}`
        case 'LEAVE':
            return `${record.senderName || 'Unknown'} 离开 ${record.server || 'Unknown'}`
        case 'TRANSFER': {
            const flow = parseTransferFlow(record)
            return `${record.senderName || 'Unknown'} ${flow.from} -> ${flow.to}`
        }
        case 'PRIVATE_MESSAGE':
            return `${record.senderName || 'Unknown'} -> ${record.receiverName || 'Unknown'}`
        case 'CHAT':
        default:
            return `${record.senderName || 'Unknown'} @ ${record.server || 'Unknown'}`
    }
}
