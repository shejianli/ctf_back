<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>CTF平台管理</a-breadcrumb-item>
      <a-breadcrumb-item>仪表盘</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row :gutter="16" style="margin: 16px 0">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="总赛题数"
            :value="statistics.totalChallenges"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <IconFile />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="活跃用户"
            :value="statistics.activeUsers"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <IconUser />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="运行容器"
            :value="statistics.runningContainers"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <IconDocker />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="今日提交"
            :value="statistics.todaySubmissions"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <IconSend />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="最近比赛">
          <a-list :data="recentContests" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="系统状态">
          <a-descriptions :data="systemStatus" layout="vertical" />
        </a-card>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script setup>
import { reactive } from 'vue'
import { IconFile, IconUser, IconDocker, IconSend } from '@arco-design/web-vue/es/icon'

const statistics = reactive({
  totalChallenges: 156,
  activeUsers: 234,
  runningContainers: 45,
  todaySubmissions: 89
})

const recentContests = reactive([
  { title: '2024年CTF春季赛', status: '进行中', time: '2024-03-15' },
  { title: 'Web安全挑战赛', status: '已结束', time: '2024-03-10' },
  { title: 'Pwn入门训练营', status: '即将开始', time: '2024-03-20' }
])

const systemStatus = reactive([
  { label: 'CPU使用率', value: '45%' },
  { label: '内存使用率', value: '67%' },
  { label: '磁盘使用率', value: '23%' },
  { label: '网络状态', value: '正常' }
])
</script>

<style scoped>
.layout-demo {
  padding: 16px;
}

.layout-demo :deep(.arco-layout-content) {
  background: var(--color-bg-3);
  padding: 16px;
  margin-bottom: 16px;
}
</style> 