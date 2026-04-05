export type RecordType =
    | 'CHAT'
    | 'PRIVATE_MESSAGE'
    | 'JOIN'
    | 'LEAVE'
    | 'TRANSFER'
    | string

export type KnownCsvField =
    | 'type'
    | 'timestamp'
    | 'server'
    | 'sender_name'
    | 'receiver_name'
    | 'message'
    | 'sender_uuid'
    | 'sender_prefix'
    | 'sender_suffix'
    | 'receiver_uuid'
    | 'receiver_prefix'
    | 'receiver_suffix'
    | 'command'

export type RecordSortMode =
    | 'time-desc'
    | 'time-asc'
    | 'player-asc'
    | 'player-desc'
    | 'server-asc'
    | 'server-desc'

export interface RawCsvRow {
    type?: string
    timestamp?: string
    server?: string
    sender_name?: string
    receiver_name?: string
    message?: string
    sender_uuid?: string
    sender_prefix?: string
    sender_suffix?: string
    receiver_uuid?: string
    receiver_prefix?: string
    receiver_suffix?: string
    command?: string

    [key: string]: string | undefined
}

export interface NormalizedRecord {
    id: string
    type: RecordType
    timestamp: string
    timeMs: number
    date: string
    hour: number
    minuteBucket: string
    server: string
    senderName: string
    senderUuid: string
    senderPrefix: string
    senderSuffix: string
    receiverName: string
    receiverUuid: string
    receiverPrefix: string
    receiverSuffix: string
    message: string
    command: string
    isPrivate: boolean
    isPublicChat: boolean
    isJoinLeave: boolean
    isTransfer: boolean
    primaryPlayer: string
    secondaryPlayer: string
    participants: string[]
    conversationKey: string | null
    transferSource?: string
    transferTarget?: string
}

export interface PlayerProfile {
    name: string
    uuid: string
    firstSeen?: number
    lastSeen?: number
    totalRecords: number
    publicMessages: number
    privateMessagesSent: number
    privateMessagesReceived: number
    joins: number
    leaves: number
    transfers: number
    servers: Record<string, number>
    contacts: Record<string, number>
    activeHours: Record<number, number>
    prefixes: string[]
    suffixes: string[]
}

export interface RecordFilterState {
    q: string
    types: string[]
    servers: string[]
    players: string[]
    start?: string
    end?: string
    sort: RecordSortMode
}
