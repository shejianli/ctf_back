<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>CTF平台管理</a-breadcrumb-item>
      <a-breadcrumb-item>公告管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row style="margin: 16px 0">
      <a-col flex="100px">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <IconPlus />
          </template>
          发布公告
        </a-button>
      </a-col>
      <a-col flex="auto" />
      <a-col flex="200px">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索公告标题"
          @search="handleSearch"
        />
      </a-col>
    </a-row>

    <a-layout-content>
      <a-table :data="announcements" :loading="loading" :pagination="pagination">
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="标题" data-index="title" :width="200" />
          <a-table-column title="类型" data-index="type" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.type)">
                {{ record.type }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === '已发布' ? 'green' : 'orange'">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="发布人" data-index="author" :width="120" />
          <a-table-column title="发布时间" data-index="publishTime" :width="150" />
          <a-table-column title="操作" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" @click="editAnnouncement(record)">编辑</a-button>
                <a-button size="small" @click="viewAnnouncement(record)">查看</a-button>
                <a-popconfirm
                  content="确定要删除这个公告吗？"
                  @ok="deleteAnnouncement(record.id)"
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

const announcements = reactive([
  {
    id: 1,
    title: '2024年CTF春季赛即将开始',
    type: '比赛通知',
    status: '已发布',
    author: 'admin',
    publishTime: '2024-03-10 09:00:00'
  },
  {
    id: 2,
    title: '系统维护通知',
    type: '系统通知',
    status: '已发布',
    author: 'admin',
    publishTime: '2024-03-08 14:30:00'
  },
  {
    id: 3,
    title: '新题目上线通知',
    type: '题目通知',
    status: '草稿',
    author: 'admin',
    publishTime: '2024-03-12 16:45:00'
  }
])

const getTypeColor = (type) => {
  const colors = {
    '比赛通知': 'red',
    '系统通知': 'blue',
    '题目通知': 'green'
  }
  return colors[type] || 'default'
}

const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
}

const editAnnouncement = (announcement) => {
  console.log('编辑公告:', announcement)
}

const viewAnnouncement = (announcement) => {
  console.log('查看公告:', announcement)
}

const deleteAnnouncement = (id) => {
  console.log('删除公告:', id)
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