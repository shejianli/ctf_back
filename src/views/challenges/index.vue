<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>CTF平台管理</a-breadcrumb-item>
      <a-breadcrumb-item>赛题管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row style="margin: 16px 0">
      <a-col flex="100px">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <IconPlus />
          </template>
          添加赛题
        </a-button>
      </a-col>
      <a-col flex="auto" />
      <a-col flex="200px">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索赛题名称"
          @search="handleSearch"
        />
      </a-col>
    </a-row>

    <a-layout-content>
      <a-table :data="challenges" :loading="loading" :pagination="pagination">
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="题目名称" data-index="name" :width="200" />
          <a-table-column title="分类" data-index="category" :width="120" />
          <a-table-column title="难度" data-index="difficulty" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getDifficultyColor(record.difficulty)">
                {{ record.difficulty }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="分值" data-index="score" :width="80" />
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === '启用' ? 'green' : 'red'">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="解决人数" data-index="solvedCount" :width="100" />
          <a-table-column title="创建时间" data-index="createTime" :width="150" />
          <a-table-column title="操作" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" @click="editChallenge(record)">编辑</a-button>
                <a-button size="small" @click="viewChallenge(record)">查看</a-button>
                <a-popconfirm
                  content="确定要删除这个赛题吗？"
                  @ok="deleteChallenge(record.id)"
                >
                  <a-button size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-layout-content>

    <!-- 添加/编辑赛题模态框 -->
    <a-modal
      v-model:visible="showAddModal"
      :title="editingChallenge ? '编辑赛题' : '添加赛题'"
      @ok="handleSaveChallenge"
      @cancel="handleCancelEdit"
    >
      <a-form :model="challengeForm" layout="vertical">
        <a-form-item label="题目名称" field="name">
          <a-input v-model="challengeForm.name" placeholder="请输入题目名称" />
        </a-form-item>
        <a-form-item label="题目分类" field="category">
          <a-select v-model="challengeForm.category" placeholder="请选择分类">
            <a-option value="Web">Web</a-option>
            <a-option value="Pwn">Pwn</a-option>
            <a-option value="Reverse">Reverse</a-option>
            <a-option value="Crypto">Crypto</a-option>
            <a-option value="Misc">Misc</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="难度等级" field="difficulty">
          <a-select v-model="challengeForm.difficulty" placeholder="请选择难度">
            <a-option value="简单">简单</a-option>
            <a-option value="中等">中等</a-option>
            <a-option value="困难">困难</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分值" field="score">
          <a-input-number v-model="challengeForm.score" :min="1" :max="1000" />
        </a-form-item>
        <a-form-item label="题目描述" field="description">
          <a-textarea v-model="challengeForm.description" :rows="4" placeholder="请输入题目描述" />
        </a-form-item>
        <a-form-item label="Flag" field="flag">
          <a-input v-model="challengeForm.flag" placeholder="请输入Flag" />
        </a-form-item>
        <a-form-item label="状态" field="status">
          <a-switch v-model="challengeForm.status" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看赛题详情模态框 -->
    <a-modal
      v-model:visible="showViewModal"
      title="赛题详情"
      :footer="false"
      width="800px"
    >
      <a-descriptions :data="viewData" layout="vertical" bordered />
      
      <div style="margin-top: 16px;">
        <h4>题目描述</h4>
        <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; min-height: 80px;">
          {{ viewingChallenge?.description || '暂无描述' }}
        </div>
      </div>
      
      <div style="margin-top: 16px;">
        <h4>Flag</h4>
        <a-input
          :value="viewingChallenge?.flag"
          readonly
          style="font-family: monospace; background: #f5f5f5;"
        />
      </div>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const searchKeyword = ref('')
const showAddModal = ref(false)
const showViewModal = ref(false)
const editingChallenge = ref(null)
const viewingChallenge = ref(null)
const viewData = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 3, // 初始化为当前数据长度
  showTotal: true,
  showJumper: true
})

const challenges = reactive([
  {
    id: 1,
    name: 'SQL注入基础',
    category: 'Web',
    difficulty: '简单',
    score: 100,
    status: '启用',
    solvedCount: 45,
    createTime: '2024-03-01 10:00:00',
    description: '这是一个基础的SQL注入题目',
    flag: 'flag{test123}'
  },
  {
    id: 2,
    name: '栈溢出练习',
    category: 'Pwn',
    difficulty: '中等',
    score: 200,
    status: '启用',
    solvedCount: 23,
    createTime: '2024-03-02 14:30:00',
    description: '练习栈溢出漏洞利用',
    flag: 'flag{pwn_test}'
  },
  {
    id: 3,
    name: 'RSA加密',
    category: 'Crypto',
    difficulty: '困难',
    score: 300,
    status: '启用',
    solvedCount: 12,
    createTime: '2024-03-03 09:15:00',
    description: 'RSA加密算法练习',
    flag: 'flag{crypto_test}'
  }
])

const challengeForm = reactive({
  name: '',
  category: '',
  difficulty: '',
  score: 100,
  description: '',
  flag: '',
  status: true
})

const getDifficultyColor = (difficulty) => {
  const colors = {
    '简单': 'green',
    '中等': 'orange',
    '困难': 'red'
  }
  return colors[difficulty] || 'blue'
}

const handleSearch = () => {
  // 实现搜索逻辑
  console.log('搜索关键词:', searchKeyword.value)
}

const editChallenge = (challenge) => {
  editingChallenge.value = challenge
  Object.assign(challengeForm, challenge)
  challengeForm.status = challenge.status === '启用'
  showAddModal.value = true
}

const viewChallenge = (challenge) => {
  viewingChallenge.value = challenge
  viewData.value = [
    { label: 'ID', value: challenge.id },
    { label: '题目名称', value: challenge.name },
    { label: '题目分类', value: challenge.category },
    { label: '难度等级', value: challenge.difficulty },
    { label: '分值', value: `${challenge.score} 分` },
    { label: '状态', value: challenge.status },
    { label: '解决人数', value: `${challenge.solvedCount} 人` },
    { label: '创建时间', value: challenge.createTime }
  ]
  showViewModal.value = true
}

const deleteChallenge = (id) => {
  try {
    const index = challenges.findIndex(c => c.id === id)
    if (index !== -1) {
      challenges.splice(index, 1)
      pagination.total = challenges.length
      Message.success('赛题删除成功')
    } else {
      Message.error('赛题不存在')
    }
  } catch (error) {
    Message.error('删除失败，请重试')
    console.error('删除赛题时出错:', error)
  }
}

const handleSaveChallenge = () => {
  // 表单验证
  if (!challengeForm.name || !challengeForm.category || !challengeForm.difficulty || !challengeForm.flag) {
    Message.error('请填写所有必填字段')
    return
  }

  try {
    if (editingChallenge.value) {
      // 编辑模式：更新现有赛题
      const index = challenges.findIndex(c => c.id === editingChallenge.value.id)
      if (index !== -1) {
        challenges[index] = {
          ...challenges[index],
          name: challengeForm.name,
          category: challengeForm.category,
          difficulty: challengeForm.difficulty,
          score: challengeForm.score,
          description: challengeForm.description,
          flag: challengeForm.flag,
          status: challengeForm.status ? '启用' : '禁用'
        }
        Message.success('赛题更新成功')
      }
    } else {
      // 添加模式：创建新赛题
      const newChallenge = {
        id: Math.max(...challenges.map(c => c.id)) + 1,
        name: challengeForm.name,
        category: challengeForm.category,
        difficulty: challengeForm.difficulty,
        score: challengeForm.score,
        description: challengeForm.description,
        flag: challengeForm.flag,
        status: challengeForm.status ? '启用' : '禁用',
        solvedCount: 0,
        createTime: new Date().toLocaleString('zh-CN')
      }
      challenges.push(newChallenge)
      Message.success('赛题添加成功')
    }

    // 更新分页总数
    pagination.total = challenges.length

    // 关闭模态框并重置表单
    showAddModal.value = false
    handleCancelEdit()
  } catch (error) {
    Message.error('保存失败，请重试')
    console.error('保存赛题时出错:', error)
  }
}

const handleCancelEdit = () => {
  editingChallenge.value = null
  Object.assign(challengeForm, {
    name: '',
    category: '',
    difficulty: '',
    score: 100,
    description: '',
    flag: '',
    status: true
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