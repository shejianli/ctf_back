<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>系统管理</a-breadcrumb-item>
      <a-breadcrumb-item>系统日志</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row style="margin: 16px 0">
      <a-col flex="auto" />
      <a-col flex="200px">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索日志内容"
          @search="handleSearch"
        />
      </a-col>
    </a-row>

    <a-layout-content>
      <a-table :data="logs" :loading="loading" :pagination="pagination">
        <template #columns>
          <a-table-column title="时间" data-index="timestamp" :width="150" />
          <a-table-column title="级别" data-index="level" :width="80">
            <template #cell="{ record }">
              <a-tag :color="getLevelColor(record.level)">
                {{ record.level }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="模块" data-index="module" :width="120" />
          <a-table-column title="用户" data-index="user" :width="120" />
          <a-table-column title="IP地址" data-index="ip" :width="120" />
          <a-table-column title="操作" data-index="action" :width="150" />
          <a-table-column title="详情" data-index="details" />
        </template>
      </a-table>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'

const loading = ref(false)
const searchKeyword = ref('')

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showJumper: true
})

const logs = reactive([
  {
    timestamp: '2024-03-15 10:30:00',
    level: 'INFO',
    module: '用户管理',
    user: 'admin',
    ip: '192.168.1.100',
    action: '用户登录',
    details: '用户admin成功登录系统'
  },
  {
    timestamp: '2024-03-15 10:25:00',
    level: 'WARN',
    module: '赛题管理',
    user: 'admin',
    ip: '192.168.1.100',
    action: '修改赛题',
    details: '修改赛题"SQL注入基础"的Flag'
  },
  {
    timestamp: '2024-03-15 10:20:00',
    level: 'ERROR',
    module: '容器管理',
    user: 'system',
    ip: '127.0.0.1',
    action: '容器启动失败',
    details: '容器ctf-web-challenge启动失败：端口冲突'
  }
])

const getLevelColor = (level) => {
  const colors = {
    'INFO': 'green',
    'WARN': 'orange',
    'ERROR': 'red',
    'DEBUG': 'blue'
  }
  return colors[level] || 'default'
}

const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
}
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