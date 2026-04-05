<script setup lang="ts">
import dayjs from 'dayjs'
import {usePlayerProfile} from '~/composables/usePlayerProfile'

const route = useRoute()
const player = computed(() => String(route.params.player))
const {profile, records, privateContacts} = usePlayerProfile(player)
const tab = ref<'all' | 'chat' | 'pm-sent' | 'pm-received' | 'movement'>('all')

const displayed = computed(() => {
  return records.value.filter((record) => {
    switch (tab.value) {
      case 'chat':
        return record.isPublicChat
      case 'pm-sent':
        return record.isPrivate && record.senderName.toLowerCase() === player.value.toLowerCase()
      case 'pm-received':
        return record.isPrivate && record.receiverName.toLowerCase() === player.value.toLowerCase()
      case 'movement':
        return record.type === 'JOIN' || record.type === 'LEAVE' || record.type === 'TRANSFER'
      default:
        return true
    }
  })
})

const topServers = computed(() =>
    Object.entries(profile.value?.servers || {}).map(([label, value]) => ({
      label,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 8)
)

const hourly = computed(() => {
  const hours = profile.value?.activeHours || {}
  return Array.from({length: 24}, (_, hour) => ({
    label: `${String(hour).padStart(2, '0')}:00`,
    value: hours[hour] || 0
  }))
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton to="/players" color="neutral" variant="ghost" icon="i-lucide-arrow-left">返回玩家列表</UButton>
    </div>

    <UAlert v-if="!profile" color="warning" variant="subtle" title="未找到玩家"
            description="这个玩家名没有出现在当前导入的记录里。"/>

    <template v-else>
      <div class="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div class="space-y-6">
          <UCard>
            <div class="flex items-start justify-between gap-4">
              <div>
                <h1 class="text-2xl font-semibold text-highlighted">{{ profile.name }}</h1>
                <p class="mt-2 break-all text-xs text-muted">{{ profile.uuid || 'No UUID' }}</p>
              </div>
              <UBadge color="primary" variant="subtle">{{ profile.totalRecords }} records</UBadge>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">公聊</div>
                <div class="mt-1 font-semibold text-highlighted">{{ profile.publicMessages }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">私聊发送</div>
                <div class="mt-1 font-semibold text-highlighted">{{ profile.privateMessagesSent }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">私聊接收</div>
                <div class="mt-1 font-semibold text-highlighted">{{ profile.privateMessagesReceived }}</div>
              </div>
              <div class="rounded-xl bg-elevated p-3">
                <div class="text-muted">转服</div>
                <div class="mt-1 font-semibold text-highlighted">{{ profile.transfers }}</div>
              </div>
            </div>

            <div class="mt-5 space-y-2 text-sm text-toned">
              <p>首次出现：{{ profile.firstSeen ? dayjs(profile.firstSeen).format('YYYY-MM-DD HH:mm:ss') : '-' }}</p>
              <p>最后出现：{{ profile.lastSeen ? dayjs(profile.lastSeen).format('YYYY-MM-DD HH:mm:ss') : '-' }}</p>
            </div>

            <div v-if="profile.prefixes.length || profile.suffixes.length" class="mt-5 space-y-3 text-sm">
              <div v-if="profile.prefixes.length">
                <p class="mb-2 text-muted">历史前缀</p>
                <div class="flex flex-wrap gap-2">
                  <UBadge v-for="prefix in profile.prefixes" :key="prefix" color="neutral" variant="subtle">{{
                      prefix
                    }}
                  </UBadge>
                </div>
              </div>
              <div v-if="profile.suffixes.length">
                <p class="mb-2 text-muted">历史后缀</p>
                <div class="flex flex-wrap gap-2">
                  <UBadge v-for="suffix in profile.suffixes" :key="suffix" color="neutral" variant="subtle">{{
                      suffix
                    }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>

          <SectionCard title="常驻服务器">
            <DistributionBars :items="topServers" empty-text="暂无服务器数据"/>
          </SectionCard>

          <SectionCard title="活跃时间分布">
            <DistributionBars :items="hourly" empty-text="暂无活跃时间数据"/>
          </SectionCard>

          <SectionCard title="常联系玩家">
            <div v-if="privateContacts.length" class="space-y-2">
              <NuxtLink
                  v-for="[name, count] in privateContacts"
                  :key="name"
                  :to="`/conversations/${encodeURIComponent([profile.name.toLowerCase(), name.toLowerCase()].sort().join('::'))}`"
                  class="flex items-center justify-between rounded-xl border border-default bg-elevated px-3 py-2.5 text-sm hover:ring-1 hover:ring-primary/15"
              >
                <span class="text-highlighted">{{ name }}</span>
                <UBadge color="secondary" variant="subtle">{{ count }}</UBadge>
              </NuxtLink>
            </div>
            <div v-else class="py-4 text-sm text-muted">暂无私聊联系人</div>
          </SectionCard>
        </div>

        <div class="space-y-6">
          <SectionCard title="记录时间线" :description="`共 ${displayed.length} 条`">
            <template #actions>
              <div class="flex flex-wrap gap-2">
                <UButton color="neutral" :variant="tab === 'all' ? 'solid' : 'outline'" size="sm" @click="tab = 'all'">
                  全部
                </UButton>
                <UButton color="neutral" :variant="tab === 'chat' ? 'solid' : 'outline'" size="sm"
                         @click="tab = 'chat'">公聊
                </UButton>
                <UButton color="neutral" :variant="tab === 'pm-sent' ? 'solid' : 'outline'" size="sm"
                         @click="tab = 'pm-sent'">私聊发送
                </UButton>
                <UButton color="neutral" :variant="tab === 'pm-received' ? 'solid' : 'outline'" size="sm"
                         @click="tab = 'pm-received'">私聊接收
                </UButton>
                <UButton color="neutral" :variant="tab === 'movement' ? 'solid' : 'outline'" size="sm"
                         @click="tab = 'movement'">进出服/转服
                </UButton>
              </div>
            </template>

            <div class="space-y-3">
              <RecordRow v-for="record in displayed" :key="record.id" :record="record"/>
            </div>
          </SectionCard>
        </div>
      </div>
    </template>
  </div>
</template>
