import {type MaybeRefOrGetter, toValue} from 'vue'
import {useRecordsStore} from '~/stores/records'
import type {NormalizedRecord, PlayerProfile} from '~/types/record'

function normalizeIdentity(value: string) {
    return value.trim().toLowerCase()
}

function recordMatchesProfile(record: NormalizedRecord, profile: PlayerProfile) {
    const profileUuid = normalizeIdentity(profile.uuid)

    if (profileUuid) {
        return normalizeIdentity(record.senderUuid) === profileUuid
            || normalizeIdentity(record.receiverUuid) === profileUuid
    }

    const names = new Set(profile.names.map(normalizeIdentity))
    return names.has(normalizeIdentity(record.senderName))
        || names.has(normalizeIdentity(record.receiverName))
}

export function usePlayerProfile(playerName: MaybeRefOrGetter<string>) {
    const store = useRecordsStore()
    const player = computed(() => toValue(playerName))
    const key = computed(() => store.resolvePlayerProfileKey(player.value))

    const profile = computed(() => key.value ? store.playerProfiles[key.value] : undefined)
    const records = computed(() => {
        const currentProfile = profile.value
        if (!currentProfile) return []

        return store.records.filter((record) => recordMatchesProfile(record, currentProfile))
    })

    const privateContacts = computed(() => {
        const contacts = profile.value?.contacts ?? {}
        return Object.entries(contacts).sort((a, b) => b[1] - a[1]).slice(0, 20)
    })

    return {profile, records, privateContacts}
}
