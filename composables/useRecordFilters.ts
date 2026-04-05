import dayjs from 'dayjs'
import type {NormalizedRecord, RecordFilterState} from '~/types/record'

export function useRecordFilters(source: Ref<NormalizedRecord[]>) {
    const filters = reactive<RecordFilterState>({
        q: '',
        types: [],
        servers: [],
        players: [],
        start: undefined,
        end: undefined,
        onlyPrivate: false,
        onlyPublic: false
    })

    const filtered = computed(() => {
        const q = filters.q.trim().toLowerCase()
        const startMs = filters.start ? dayjs(filters.start).startOf('day').valueOf() : undefined
        const endMs = filters.end ? dayjs(filters.end).endOf('day').valueOf() : undefined

        return source.value.filter((r) => {
            if (filters.types.length && !filters.types.includes(r.type)) return false
            if (filters.servers.length && !filters.servers.includes(r.server)) return false
            if (filters.players.length) {
                const names = [r.senderName, r.receiverName].map((v) => v.toLowerCase())
                if (!filters.players.some((p) => names.includes(p.toLowerCase()))) return false
            }
            if (startMs && r.timeMs < startMs) return false
            if (endMs && r.timeMs > endMs) return false
            if (filters.onlyPrivate && !r.isPrivate) return false
            if (filters.onlyPublic && !r.isPublicChat) return false
            if (q) {
                const haystack = [
                    r.type,
                    r.server,
                    r.senderName,
                    r.receiverName,
                    r.message,
                    r.command,
                    r.senderUuid,
                    r.receiverUuid
                ].join(' ').toLowerCase()

                if (!haystack.includes(q)) return false
            }
            return true
        })
    })

    function reset() {
        filters.q = ''
        filters.types = []
        filters.servers = []
        filters.players = []
        filters.start = undefined
        filters.end = undefined
        filters.onlyPrivate = false
        filters.onlyPublic = false
    }

    return {filters, filtered, reset}
}
