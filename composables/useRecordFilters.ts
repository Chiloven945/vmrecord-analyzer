import dayjs from 'dayjs'
import type {NormalizedRecord, RecordFilterState} from '~/types/record'

function compareText(a: string, b: string) {
    return a.localeCompare(b, 'zh-Hans-CN', {numeric: true, sensitivity: 'base'})
}

export function useRecordFilters(source: Ref<NormalizedRecord[]>) {
    const filters = reactive<RecordFilterState>({
        q: '',
        types: [],
        servers: [],
        players: [],
        start: undefined,
        end: undefined,
        sort: 'time-desc'
    })

    const filtered = computed(() => {
        const q = filters.q.trim().toLowerCase()
        const startMs = filters.start ? dayjs(filters.start).startOf('day').valueOf() : undefined
        const endMs = filters.end ? dayjs(filters.end).endOf('day').valueOf() : undefined

        const rows = source.value.filter((r) => {
            if (filters.types.length && !filters.types.includes(r.type)) return false
            if (filters.servers.length && !filters.servers.includes(r.server)) return false

            if (filters.players.length) {
                const names = [r.senderName, r.receiverName].map((v) => v.toLowerCase())
                if (!filters.players.some((p) => names.includes(p.toLowerCase()))) return false
            }

            if (startMs && r.timeMs < startMs) return false
            if (endMs && r.timeMs > endMs) return false

            if (q) {
                const haystack = [
                    r.type,
                    r.server,
                    r.senderName,
                    r.receiverName,
                    r.message,
                    r.command,
                    r.transferSource,
                    r.transferTarget
                ].join(' ').toLowerCase()

                if (!haystack.includes(q)) return false
            }

            return true
        })

        return [...rows].sort((a, b) => {
            switch (filters.sort) {
                case 'time-asc':
                    return a.timeMs - b.timeMs || compareText(a.senderName, b.senderName)
                case 'player-asc': {
                    const byPlayer = compareText(a.senderName || a.primaryPlayer, b.senderName || b.primaryPlayer)
                    return byPlayer || (b.timeMs - a.timeMs)
                }
                case 'player-desc': {
                    const byPlayer = compareText(b.senderName || b.primaryPlayer, a.senderName || a.primaryPlayer)
                    return byPlayer || (b.timeMs - a.timeMs)
                }
                case 'server-asc': {
                    const byServer = compareText(a.server, b.server)
                    return byServer || (b.timeMs - a.timeMs)
                }
                case 'server-desc': {
                    const byServer = compareText(b.server, a.server)
                    return byServer || (b.timeMs - a.timeMs)
                }
                case 'time-desc':
                default:
                    return b.timeMs - a.timeMs || compareText(a.senderName, b.senderName)
            }
        })
    })

    function reset() {
        filters.q = ''
        filters.types = []
        filters.servers = []
        filters.players = []
        filters.start = undefined
        filters.end = undefined
        filters.sort = 'time-desc'
    }

    return {filters, filtered, reset}
}
