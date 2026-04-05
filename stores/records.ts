import {useStorage} from '@vueuse/core'
import {defineStore} from 'pinia'
import type {NormalizedRecord, PlayerProfile} from '~/types/record'

function addCount(map: Record<string, number>, key: string) {
    if (!key) return
    map[key] = (map[key] || 0) + 1
}

function addHour(map: Record<number, number>, hour: number) {
    map[hour] = (map[hour] || 0) + 1
}

export const useRecordsStore = defineStore('records', () => {
    const records = useStorage<NormalizedRecord[]>('vmrecord-analyzer-records', [])
    const sourceFileName = useStorage('vmrecord-analyzer-source-file', '')
    const importedAt = useStorage<number | null>('vmrecord-analyzer-imported-at', null)

    const playerProfiles = computed<Record<string, PlayerProfile>>(() => {
        const map: Record<string, PlayerProfile> = {}

        for (const record of records.value) {
            const touchPlayer = (name: string, uuid: string, prefix = '', suffix = '') => {
                if (!name) return null
                const key = name.toLowerCase()
                if (!map[key]) {
                    map[key] = {
                        name,
                        uuid,
                        firstSeen: record.timeMs,
                        lastSeen: record.timeMs,
                        totalRecords: 0,
                        publicMessages: 0,
                        privateMessagesSent: 0,
                        privateMessagesReceived: 0,
                        joins: 0,
                        leaves: 0,
                        transfers: 0,
                        servers: {},
                        contacts: {},
                        activeHours: {},
                        prefixes: [],
                        suffixes: []
                    }
                }

                const profile = map[key]
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
                if (record.isPrivate) sender.privateMessagesSent += 1
            }

            if (receiver && record.isPrivate) {
                receiver.privateMessagesReceived += 1
            }

            if (record.isPrivate && sender && receiver && sender.name !== receiver.name) {
                addCount(sender.contacts, receiver.name)
                addCount(receiver.contacts, sender.name)
            }
        }

        return map
    })

    const players = computed(() =>
        Object.values(playerProfiles.value).sort((a, b) => b.totalRecords - a.totalRecords)
    )

    const conversationMap = computed<Record<string, NormalizedRecord[]>>(() => {
        const map: Record<string, NormalizedRecord[]> = {}
        for (const record of records.value) {
            if (!record.conversationKey) continue
            if (!map[record.conversationKey]) map[record.conversationKey] = []
            map[record.conversationKey].push(record)
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
            if (r.senderName) activePlayers.add(r.senderName.toLowerCase())
            if (r.receiverName) activePlayers.add(r.receiverName.toLowerCase())
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
        conversationMap,
        topConversations,
        setRecords,
        clearRecords
    }
})
