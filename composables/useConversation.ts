import {type MaybeRefOrGetter, toValue} from 'vue'
import {useRecordsStore} from '~/stores/records'

export function useConversation(pair: MaybeRefOrGetter<string>) {
    const store = useRecordsStore()
    const key = computed(() => toValue(pair))

    const records = computed(() => store.conversationMap[key.value] ?? [])
    const participants = computed(() => key.value.split('::'))
    const summary = computed(() => ({
        total: records.value.length,
        first: records.value[0]?.timeMs,
        last: records.value[records.value.length - 1]?.timeMs
    }))

    return {records, participants, summary}
}
