import {useStorage} from '@vueuse/core'
import {defineStore} from 'pinia'
import {parseTransferFlow} from '~/utils/recordPresentation'
import type {NormalizedRecord, PlayerProfile, ServerProfile} from '~/types/record'

function addCount(map: Record<string, number>, key: string) {
    if (!key) return
    map[key] = (map[key] || 0) + 1
}

function addHour(map: Record<number, number>, hour: number) {
    map[hour] = (map[hour] || 0) + 1
}

function normalizeIdentity(value: string) {
    return value.trim().toLowerCase()
}

function makePlayerProfileKey(name: string, uuid: string) {
    const normalizedUuid = normalizeIdentity(uuid)
    if (normalizedUuid) return `uuid:${normalizedUuid}`

    const normalizedName = normalizeIdentity(name)
    return normalizedName ? `name:${normalizedName}` : ''
}

function isChronological(list: readonly NormalizedRecord[]) {
    for (let index = 1; index < list.length; index += 1) {
        const previous = list[index - 1]
        const current = list[index]
        if (previous && current && previous.timeMs > current.timeMs) return false
    }
    return true
}

function compareRecordsByTime(a: NormalizedRecord, b: NormalizedRecord) {
    return a.timeMs - b.timeMs || a.id.localeCompare(b.id)
}

function addNameAlias(profile: PlayerProfile, name: string) {
    const cleanName = name.trim()
    if (!cleanName) return

    if (!profile.names.some((item) => normalizeIdentity(item) === normalizeIdentity(cleanName))) {
        profile.names.push(cleanName)
    }
}

export const useRecordsStore = defineStore('records', () => {
    const session = import.meta.client ? window.sessionStorage : undefined

    const records = useStorage<NormalizedRecord[]>('vmrecord-analyzer-records', [], session)
    const sourceFileName = useStorage('vmrecord-analyzer-source-file', '', session)
    const importedAt = useStorage<number | null>('vmrecord-analyzer-imported-at', null, session)

    const chronologicalRecords = computed(() => {
        const currentRecords = records.value
        return isChronological(currentRecords)
            ? currentRecords
            : [...currentRecords].sort(compareRecordsByTime)
    })

    const playerProfiles = computed<Record<string, PlayerProfile>>(() => {
        const map: Record<string, PlayerProfile> = {}
        const sessionStartMap: Record<string, number> = {}

        for (const record of chronologicalRecords.value) {
            const touchPlayer = (name: string, uuid: string, prefix = '', suffix = '') => {
                const key = makePlayerProfileKey(name, uuid)
                if (!key) return null

                const cleanName = name.trim()
                const cleanUuid = uuid.trim()

                if (!map[key]) {
                    map[key] = {
                        profileKey: key,
                        name: cleanName || cleanUuid || 'Unknown',
                        names: cleanName ? [cleanName] : [],
                        uuid: cleanUuid,
                        firstSeen: record.timeMs,
                        lastSeen: record.timeMs,
                        totalRecords: 0,
                        publicMessages: 0,
                        privateMessagesSent: 0,
                        privateMessagesReceived: 0,
                        joins: 0,
                        leaves: 0,
                        transfers: 0,
                        playTimeMs: 0,
                        playSessions: 0,
                        servers: {},
                        contacts: {},
                        activeHours: {},
                        prefixes: [],
                        suffixes: []
                    }
                }

                const profile = map[key]
                addNameAlias(profile, cleanName)
                if (cleanName) profile.name = cleanName
                if (cleanUuid && !profile.uuid) profile.uuid = cleanUuid
                profile.firstSeen = Math.min(profile.firstSeen ?? record.timeMs, record.timeMs)
                profile.lastSeen = Math.max(profile.lastSeen ?? record.timeMs, record.timeMs)
                profile.totalRecords += 1
                addCount(profile.servers, record.server)
                addHour(profile.activeHours, record.hour)
                if (prefix && !profile.prefixes.includes(prefix)) profile.prefixes.push(prefix)
                if (suffix && !profile.suffixes.includes(suffix)) profile.suffixes.push(suffix)
                return profile
            }

            const sender = touchPlayer(record.senderName, record.senderUuid, record.senderPrefix, record.senderSuffix)
            const receiver = touchPlayer(record.receiverName, record.receiverUuid, record.receiverPrefix, record.receiverSuffix)

            if (sender) {
                if (record.isPublicChat) sender.publicMessages += 1
                if (record.type === 'JOIN') sender.joins += 1
                if (record.type === 'LEAVE') sender.leaves += 1
                if (record.type === 'TRANSFER') sender.transfers += 1
                if (record.type === 'JOIN') {
                    sessionStartMap[sender.profileKey] = record.timeMs
                }
                if (record.type === 'LEAVE') {
                    const sessionStart = sessionStartMap[sender.profileKey]
                    if (sessionStart !== undefined && record.timeMs >= sessionStart) {
                        sender.playTimeMs += record.timeMs - sessionStart
                        sender.playSessions += 1
                    }
                    delete sessionStartMap[sender.profileKey]
                }
                if (record.isPrivate) sender.privateMessagesSent += 1
            }

            if (receiver && record.isPrivate) {
                receiver.privateMessagesReceived += 1
            }

            if (record.isPrivate && sender && receiver && sender.profileKey !== receiver.profileKey) {
                addCount(sender.contacts, receiver.name)
                addCount(receiver.contacts, sender.name)
            }
        }

        return map
    })

    const playerProfileAliases = computed<Record<string, string>>(() => {
        const aliases: Record<string, string> = {}

        for (const [key, profile] of Object.entries(playerProfiles.value)) {
            aliases[key] = key

            const normalizedUuid = normalizeIdentity(profile.uuid)
            if (normalizedUuid) {
                aliases[`uuid:${normalizedUuid}`] = key
                aliases[normalizedUuid] = key
            }

            for (const name of profile.names.length ? profile.names : [profile.name]) {
                const normalizedName = normalizeIdentity(name)
                if (!normalizedName) continue

                aliases[`name:${normalizedName}`] ||= key
                aliases[normalizedName] ||= key
            }
        }

        return aliases
    })

    function resolvePlayerProfileKey(identifier: string) {
        const normalizedIdentifier = normalizeIdentity(identifier)
        if (!normalizedIdentifier) return ''

        return playerProfileAliases.value[normalizedIdentifier]
            || playerProfileAliases.value[`uuid:${normalizedIdentifier}`]
            || playerProfileAliases.value[`name:${normalizedIdentifier}`]
            || ''
    }

    const players = computed(() =>
        Object.values(playerProfiles.value).sort((a, b) => b.totalRecords - a.totalRecords)
    )

    const serverProfiles = computed<Record<string, ServerProfile>>(() => {
        const map: Record<string, ServerProfile> = {}

        const touchServer = (name: string, timeMs: number) => {
            const clean = name.trim()
            if (!clean) return null
            const key = clean.toLowerCase()

            if (!map[key]) {
                map[key] = {
                    name: clean,
                    firstSeen: timeMs,
                    lastSeen: timeMs,
                    totalRecords: 0,
                    publicMessages: 0,
                    privateMessages: 0,
                    joins: 0,
                    leaves: 0,
                    transfersIn: 0,
                    transfersOut: 0,
                    players: {},
                    typeCounts: {}
                }
            }

            const profile = map[key]
            profile.firstSeen = Math.min(profile.firstSeen ?? timeMs, timeMs)
            profile.lastSeen = Math.max(profile.lastSeen ?? timeMs, timeMs)
            return profile
        }

        for (const record of records.value) {
            const currentServer = touchServer(record.server, record.timeMs)
            if (currentServer) {
                currentServer.totalRecords += 1
                addCount(currentServer.typeCounts, record.type)

                if (record.senderName) addCount(currentServer.players, record.senderName)
                if (record.receiverName) addCount(currentServer.players, record.receiverName)

                if (record.isPublicChat) currentServer.publicMessages += 1
                if (record.isPrivate) currentServer.privateMessages += 1
                if (record.type === 'JOIN') currentServer.joins += 1
                if (record.type === 'LEAVE') currentServer.leaves += 1
            }

            if (record.type === 'TRANSFER') {
                const flow = parseTransferFlow(record)
                const targetServer = touchServer(flow.to, record.timeMs)
                if (targetServer) targetServer.transfersIn += 1

                const sourceServer = touchServer(flow.from, record.timeMs)
                if (sourceServer) {
                    sourceServer.transfersOut += 1
                    if (record.senderName) addCount(sourceServer.players, record.senderName)
                }
            }
        }

        return map
    })

    const servers = computed(() =>
        Object.values(serverProfiles.value).sort((a, b) => b.totalRecords - a.totalRecords || a.name.localeCompare(b.name))
    )

    const conversationMap = computed<Record<string, NormalizedRecord[]>>(() => {
        const map: Record<string, NormalizedRecord[]> = {}
        for (const record of records.value) {
            const key = record.conversationKey
            if (!key) continue

            const list = map[key] ?? (map[key] = [])
            list.push(record)
        }
        return map
    })

    const stats = computed(() => {
        const serverCounts: Record<string, number> = {}
        const typeCounts: Record<string, number> = {}
        const activePlayers = new Set<string>()

        for (const r of records.value) {
            if (r.server) addCount(serverCounts, r.server)
            addCount(typeCounts, r.type)
            if (r.senderName || r.senderUuid) activePlayers.add(makePlayerProfileKey(r.senderName, r.senderUuid))
            if (r.receiverName || r.receiverUuid) activePlayers.add(makePlayerProfileKey(r.receiverName, r.receiverUuid))
        }

        return {
            total: records.value.length,
            chat: typeCounts.CHAT || 0,
            privateMessage: typeCounts.PRIVATE_MESSAGE || 0,
            join: typeCounts.JOIN || 0,
            leave: typeCounts.LEAVE || 0,
            transfer: typeCounts.TRANSFER || 0,
            activePlayers: activePlayers.size,
            serverCounts,
            typeCounts
        }
    })

    const topConversations = computed(() => {
        return Object.entries(conversationMap.value)
            .map(([key, list]) => ({
                key,
                label: list[0] ? `${list[0].senderName} ↔ ${list[0].receiverName}` : key.replace('::', ' ↔ '),
                count: list.length,
                latest: list[list.length - 1]?.timeMs ?? 0
            }))
            .sort((a, b) => b.count - a.count || b.latest - a.latest)
    })

    function setRecords(next: NormalizedRecord[], fileName = '') {
        records.value = next
        sourceFileName.value = fileName
        importedAt.value = Date.now()
    }

    function clearRecords() {
        records.value = []
        sourceFileName.value = ''
        importedAt.value = null
    }

    return {
        records,
        sourceFileName,
        importedAt,
        stats,
        players,
        playerProfiles,
        playerProfileAliases,
        resolvePlayerProfileKey,
        servers,
        serverProfiles,
        conversationMap,
        topConversations,
        setRecords,
        clearRecords
    }
})
