<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>CTF平台管理</a-breadcrumb-item>
      <a-breadcrumb-item>队伍管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row style="margin: 16px 0">
      <a-col flex="100px">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <IconPlus />
          </template>
          创建队伍
        </a-button>
      </a-col>
      <a-col flex="auto" />
      <a-col flex="200px">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索队伍名称"
          @search="handleSearch"
        />
      </a-col>
    </a-row>

    <a-layout-content>
      <a-table :data="teams" :loading="loading" :pagination="pagination">
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="队伍名称" data-index="name" :width="150" />
          <a-table-column title="队长" data-index="leader" :width="120" />
          <a-table-column title="成员数量" data-index="memberCount" :width="100" />
          <a-table-column title="积分" data-index="score" :width="80" />
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === '活跃' ? 'green' : 'red'">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="150" />
          <a-table-column title="操作" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" @click="editTeam(record)">编辑</a-button>
                <a-button size="small" @click="manageMembers(record)">成员</a-button>
                <a-popconfirm
                  content="确定要删除这个队伍吗？"
                  @ok="deleteTeam(record.id)"
                >
                  <a-button size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const loading = ref(false)
const searchKeyword = ref('')
const showAddModal = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true
})

const teams = reactive([
  {
    id: 1,
    name: '安全研究小组',
    leader: 'user001',
    memberCount: 5,
    score: 2500,
    status: '活跃',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 2,
    name: '漏洞猎人',
    leader: 'user002',
    memberCount: 3,
    score: 1800,
    status: '活跃',
    createTime: '2024-02-15 14:30:00'
  }
])

const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
}

const editTeam = (team) => {
  console.log('编辑队伍:', team)
}

const manageMembers = (team) => {
  console.log('管理成员:', team)
}

const deleteTeam = (id) => {
  console.log('删除队伍:', id)
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