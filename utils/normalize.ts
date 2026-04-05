import dayjs from 'dayjs'
import type {NormalizedRecord, RawCsvRow} from '~/types/record'

function safe(v?: string) {
    return (v ?? '').trim()
}

function makeConversationKey(a: string, b: string) {
    const names = [a.trim().toLowerCase(), b.trim().toLowerCase()].sort()
    return names[0] && names[1] ? `${names[0]}::${names[1]}` : null
}

function parseTransferMessage(message: string, fallbackServer: string) {
    const match = message.match(/^\s*(.*?)\s*->\s*(.*?)\s*$/)
    if (match) {
        return {
            transferSource: match[1] || undefined,
            transferTarget: match[2] || fallbackServer || undefined
        }
    }

    return {
        transferSource: undefined,
        transferTarget: fallbackServer || undefined
    }
}

export function normalizeRow(row: RawCsvRow, index: number): NormalizedRecord {
    const timestamp = safe(row.timestamp)
    const parsed = dayjs(timestamp, 'YYYY-MM-DD HH:mm:ss')
    const timeMs = parsed.isValid() ? parsed.valueOf() : Date.now() + index
    const type = safe(row.type).toUpperCase()
    const senderName = safe(row.sender_name)
    const receiverName = safe(row.receiver_name)
    const message = row.message ?? ''
    const server = safe(row.server)

    const isPrivate = type === 'PRIVATE_MESSAGE'
    const isPublicChat = type === 'CHAT'
    const isJoinLeave = type === 'JOIN' || type === 'LEAVE'
    const isTransfer = type === 'TRANSFER'
    const conversationKey = isPrivate && senderName && receiverName
        ? makeConversationKey(senderName, receiverName)
        : null

    const transfer = isTransfer ? parseTransferMessage(message, server) : {
        transferSource: undefined,
        transferTarget: undefined
    }

    return {
        id: `${timestamp}-${type}-${senderName || 'unknown'}-${receiverName || 'none'}-${index}`,
        type,
        timestamp,
        timeMs,
        date: dayjs(timeMs).format('YYYY-MM-DD'),
        hour: dayjs(timeMs).hour(),
        minuteBucket: dayjs(timeMs).format('YYYY-MM-DD HH:mm'),
        server,
        senderName,
        senderUuid: safe(row.sender_uuid),
        senderPrefix: row.sender_prefix ?? '',
        senderSuffix: row.sender_suffix ?? '',
        receiverName,
        receiverUuid: safe(row.receiver_uuid),
        receiverPrefix: row.receiver_prefix ?? '',
        receiverSuffix: row.receiver_suffix ?? '',
        message,
        command: safe(row.command),
        isPrivate,
        isPublicChat,
        isJoinLeave,
        isTransfer,
        primaryPlayer: senderName || receiverName,
        secondaryPlayer: receiverName,
        participants: [senderName, receiverName].filter(Boolean),
        conversationKey,
        transferSource: transfer.transferSource,
        transferTarget: transfer.transferTarget
    }
}

export function normalizeRows(rows: RawCsvRow[]) {
    return rows.map(normalizeRow).sort((a, b) => a.timeMs - b.timeMs)
}
