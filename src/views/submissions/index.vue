<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>CTF平台管理</a-breadcrumb-item>
      <a-breadcrumb-item>提交记录</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row style="margin: 16px 0">
      <a-col flex="auto" />
      <a-col flex="200px">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索用户名或题目"
          @search="handleSearch"
        />
      </a-col>
    </a-row>

    <a-layout-content>
      <a-table :data="submissions" :loading="loading" :pagination="pagination">
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="用户名" data-index="username" :width="120" />
          <a-table-column title="题目名称" data-index="challengeName" :width="150" />
          <a-table-column title="提交的Flag" data-index="submittedFlag" :width="200" />
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === '正确' ? 'green' : 'red'">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="IP地址" data-index="ipAddress" :width="120" />
          <a-table-column title="提交时间" data-index="submitTime" :width="150" />
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" @click="viewDetail(record)">详情</a-button>
                <a-popconfirm
                  content="确定要删除这条记录吗？"
                  @ok="deleteSubmission(record.id)"
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

const loading = ref(false)
const searchKeyword = ref('')

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true
})

const submissions = reactive([
  {
    id: 1,
    username: 'user001',
    challengeName: 'SQL注入基础',
    submittedFlag: 'flag{test123}',
    status: '正确',
    ipAddress: '192.168.1.100',
    submitTime: '2024-03-15 10:30:00'
  },
  {
    id: 2,
    username: 'user002',
    challengeName: '栈溢出练习',
    submittedFlag: 'flag{wrong_flag}',
    status: '错误',
    ipAddress: '192.168.1.101',
    submitTime: '2024-03-15 11:15:00'
  },
  {
    id: 3,
    username: 'user003',
    challengeName: 'RSA加密',
    submittedFlag: 'flag{crypto_test}',
    status: '正确',
    ipAddress: '192.168.1.102',
    submitTime: '2024-03-15 12:45:00'
  }
])

const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
}

const viewDetail = (record) => {
  console.log('查看详情:', record)
}

const deleteSubmission = (id) => {
  console.log('删除记录:', id)
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