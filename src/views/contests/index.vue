<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>CTF平台管理</a-breadcrumb-item>
      <a-breadcrumb-item>比赛管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row style="margin: 16px 0">
      <a-col flex="100px">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <IconPlus />
          </template>
          创建比赛
        </a-button>
      </a-col>
      <a-col flex="auto" />
      <a-col flex="200px">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索比赛名称"
          @search="handleSearch"
        />
      </a-col>
    </a-row>

    <a-layout-content>
      <a-table :data="contests" :loading="loading" :pagination="pagination">
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="比赛名称" data-index="name" :width="200" />
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="开始时间" data-index="startTime" :width="150" />
          <a-table-column title="结束时间" data-index="endTime" :width="150" />
          <a-table-column title="参赛人数" data-index="participants" :width="100" />
          <a-table-column title="题目数量" data-index="challengeCount" :width="100" />
          <a-table-column title="创建时间" data-index="createTime" :width="150" />
          <a-table-column title="操作" :width="250">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" @click="editContest(record)">编辑</a-button>
                <a-button size="small" @click="viewContest(record)">查看</a-button>
                <a-button size="small" @click="manageParticipants(record)">参赛者</a-button>
                <a-button size="small" @click="viewRanking(record)">排行榜</a-button>
                <a-button size="small" type="primary" @click="openContestScreen(record)">比赛大屏</a-button>
                <a-popconfirm
                  content="确定要删除这个比赛吗？"
                  @ok="deleteContest(record.id)"
                >
                  <a-button size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-layout-content>

    <!-- 添加/编辑比赛模态框 -->
    <a-modal
      v-model:visible="showAddModal"
      :title="editingContest ? '编辑比赛' : '创建比赛'"
      @ok="handleSaveContest"
      @cancel="handleCancelEdit"
    >
      <a-form :model="contestForm" layout="vertical">
        <a-form-item label="比赛名称" field="name">
          <a-input v-model="contestForm.name" placeholder="请输入比赛名称" />
        </a-form-item>
        <a-form-item label="比赛描述" field="description">
          <a-textarea v-model="contestForm.description" :rows="3" placeholder="请输入比赛描述" />
        </a-form-item>
        <a-form-item label="开始时间" field="startTime">
          <a-date-picker
            v-model="contestForm.startTime"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择开始时间"
          />
        </a-form-item>
        <a-form-item label="结束时间" field="endTime">
          <a-date-picker
            v-model="contestForm.endTime"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择结束时间"
          />
        </a-form-item>
        <a-form-item label="比赛类型" field="type">
          <a-select v-model="contestForm.type" placeholder="请选择比赛类型">
            <a-option value="individual">个人赛</a-option>
            <a-option value="team">团队赛</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" field="status">
          <a-select v-model="contestForm.status" placeholder="请选择状态">
            <a-option value="draft">草稿</a-option>
            <a-option value="upcoming">即将开始</a-option>
            <a-option value="running">进行中</a-option>
            <a-option value="finished">已结束</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IconPlus } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const loading = ref(false)
const searchKeyword = ref('')
const showAddModal = ref(false)
const editingContest = ref(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true
})

const contests = reactive([
  {
    id: 1,
    name: '2024年CTF春季赛',
    status: 'running',
    startTime: '2024-03-15 09:00:00',
    endTime: '2024-03-15 18:00:00',
    participants: 156,
    challengeCount: 20,
    createTime: '2024-03-01 10:00:00',
    description: '春季CTF比赛，包含Web、Pwn、Crypto等题目',
    type: 'individual'
  },
  {
    id: 2,
    name: 'Web安全挑战赛',
    status: 'finished',
    startTime: '2024-03-10 14:00:00',
    endTime: '2024-03-10 17:00:00',
    participants: 89,
    challengeCount: 15,
    createTime: '2024-03-05 09:30:00',
    description: '专注于Web安全的CTF比赛',
    type: 'individual'
  },
  {
    id: 3,
    name: 'Pwn入门训练营',
    status: 'upcoming',
    startTime: '2024-03-20 10:00:00',
    endTime: '2024-03-20 16:00:00',
    participants: 45,
    challengeCount: 10,
    createTime: '2024-03-12 15:20:00',
    description: 'Pwn漏洞利用入门训练',
    type: 'team'
  }
])

const contestForm = reactive({
  name: '',
  description: '',
  startTime: null,
  endTime: null,
  type: '',
  status: ''
})

const getStatusColor = (status) => {
  const colors = {
    'draft': 'default',
    'upcoming': 'blue',
    'running': 'green',
    'finished': 'red'
  }
  return colors[status] || 'default'
}

const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
}

const editContest = (contest) => {
  editingContest.value = contest
  Object.assign(contestForm, contest)
  showAddModal.value = true
}

const viewContest = (contest) => {
  console.log('查看比赛:', contest)
}

const manageParticipants = (contest) => {
  console.log('管理参赛者:', contest)
}

const viewRanking = (contest) => {
  console.log('查看排行榜:', contest)
}

const deleteContest = (id) => {
  console.log('删除比赛:', id)
}

const openContestScreen = (contest) => {
  // 在新窗口打开比赛大屏
  window.open('/contest-screen', '_blank')
}

const handleSaveContest = () => {
  console.log('保存比赛:', contestForm)
  showAddModal.value = false
  handleCancelEdit()
}

const handleCancelEdit = () => {
  editingContest.value = null
  Object.assign(contestForm, {
    name: '',
    description: '',
    startTime: null,
    endTime: null,
    type: '',
    status: ''
  })
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