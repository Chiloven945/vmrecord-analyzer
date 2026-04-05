import dayjs from 'dayjs'
import type {NormalizedRecord, RawCsvRow} from '~/types/record'

function safe(v?: string) {
    return (v ?? '').trim()
}

function makeConversationKey(a: string, b: string) {
    const names = [a.trim().toLowerCase(), b.trim().toLowerCase()].sort()
    return names[0] && names[1] ? `${names[0]}::${names[1]}` : null
}

export function normalizeRow(row: RawCsvRow, index: number): NormalizedRecord {
    const timestamp = safe(row.timestamp)
    const parsed = dayjs(timestamp, 'YYYY-MM-DD HH:mm:ss')
    const timeMs = parsed.isValid() ? parsed.valueOf() : Date.now() + index
    const type = safe(row.type).toUpperCase()
    const senderName = safe(row.sender_name)
    const receiverName = safe(row.receiver_name)
    const message = row.message ?? ''

    const isPrivate = type === 'PRIVATE_MESSAGE'
    const isPublicChat = type === 'CHAT'
    const isJoinLeave = type === 'JOIN' || type === 'LEAVE'
    const isTransfer = type === 'TRANSFER'
    const conversationKey = isPrivate && senderName && receiverName
        ? makeConversationKey(senderName, receiverName)
        : null

    return {
        id: `${timestamp}-${type}-${senderName || 'unknown'}-${receiverName || 'none'}-${index}`,
        type,
        timestamp,
        timeMs,
        date: dayjs(timeMs).format('YYYY-MM-DD'),
        hour: dayjs(timeMs).hour(),
        minuteBucket: dayjs(timeMs).format('YYYY-MM-DD HH:mm'),
        server: safe(row.server),
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
        conversationKey
    }
}

export function normalizeRows(rows: RawCsvRow[]) {
    return rows.map(normalizeRow).sort((a, b) => a.timeMs - b.timeMs)
}
