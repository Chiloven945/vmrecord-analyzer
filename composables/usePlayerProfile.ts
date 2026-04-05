import {type MaybeRefOrGetter, toValue} from 'vue'
import {useRecordsStore} from '~/stores/records'

export function usePlayerProfile(playerName: MaybeRefOrGetter<string>) {
    const store = useRecordsStore()
    const player = computed(() => toValue(playerName))
    const key = computed(() => player.value.toLowerCase())

    const profile = computed(() => store.playerProfiles[key.value])
    const records = computed(() =>
        store.records.filter(
            (r) =>
                r.senderName.toLowerCase() === key.value ||
                r.receiverName.toLowerCase() === key.value
        )
    )

    const privateContacts = computed(() => {
        const contacts = profile.value?.contacts ?? {}
        return Object.entries(contacts).sort((a, b) => b[1] - a[1]).slice(0, 20)
    })

    return {profile, records, privateContacts}
}
