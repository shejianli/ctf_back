<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>CTF平台管理</a-breadcrumb-item>
      <a-breadcrumb-item>用户管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row style="margin: 16px 0">
      <a-col flex="100px">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <IconPlus />
          </template>
          添加用户
        </a-button>
      </a-col>
      <a-col flex="auto" />
      <a-col flex="200px">
        <a-input-search
          v-model="searchKeyword"
          placeholder="搜索用户名或邮箱"
          @search="handleSearch"
        />
      </a-col>
    </a-row>

    <a-layout-content>
      <a-table :data="users" :loading="loading" :pagination="pagination">
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="用户名" data-index="username" :width="120" />
          <a-table-column title="邮箱" data-index="email" :width="200" />
          <a-table-column title="角色" data-index="role" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getRoleColor(record.role)">
                {{ record.role }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === '启用' ? 'green' : 'red'">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="积分" data-index="score" :width="80" />
          <a-table-column title="注册时间" data-index="registerTime" :width="150" />
          <a-table-column title="最后登录" data-index="lastLogin" :width="150" />
          <a-table-column title="操作" :width="250">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" @click="editUser(record)">编辑</a-button>
                <a-button size="small" @click="resetPassword(record.id)">重置密码</a-button>
                <a-button size="small" @click="viewUserDetail(record)">详情</a-button>
                <a-popconfirm
                  content="确定要删除这个用户吗？"
                  @ok="deleteUser(record.id)"
                >
                  <a-button size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-layout-content>

    <!-- 添加/编辑用户模态框 -->
    <a-modal
      v-model:visible="showAddModal"
      :title="editingUser ? '编辑用户' : '添加用户'"
      @ok="handleSaveUser"
      @cancel="handleCancelEdit"
    >
      <a-form :model="userForm" layout="vertical">
        <a-form-item label="用户名" field="username">
          <a-input v-model="userForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="邮箱" field="email">
          <a-input v-model="userForm.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="角色" field="role">
          <a-select v-model="userForm.role" placeholder="请选择角色">
            <a-option value="admin">管理员</a-option>
            <a-option value="user">普通用户</a-option>
            <a-option value="guest">访客</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" field="status">
          <a-switch v-model="userForm.status" />
        </a-form-item>
        <a-form-item label="密码" field="password" v-if="!editingUser">
          <a-input-password v-model="userForm.password" placeholder="请输入密码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 用户详情模态框 -->
    <a-modal
      v-model:visible="showDetailModal"
      title="用户详情"
      :footer="false"
      width="800px"
    >
      <a-descriptions :data="detailData" layout="vertical" bordered />
      
      <div style="margin-top: 20px;">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-statistic title="总积分" :value="viewingUser?.score || 0" suffix="分" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="账户状态" :value="viewingUser?.status" />
          </a-col>
        </a-row>
      </div>

      <div style="margin-top: 20px;">
        <h4>最近活动</h4>
        <a-timeline>
          <a-timeline-item>
            <template #dot>
              <icon-check-circle style="color: green;" />
            </template>
            最后登录：{{ viewingUser?.lastLogin }}
          </a-timeline-item>
          <a-timeline-item>
            <template #dot>
              <icon-user style="color: blue;" />
            </template>
            注册时间：{{ viewingUser?.registerTime }}
          </a-timeline-item>
        </a-timeline>
      </div>
    </a-modal>

    <!-- 重置密码模态框 -->
    <a-modal
      v-model:visible="showResetPasswordModal"
      title="重置密码"
      @ok="handleResetPassword"
      @cancel="handleCancelResetPassword"
    >
      <a-alert 
        type="warning" 
        message="重置密码后，用户需要使用新密码登录" 
        style="margin-bottom: 16px;"
      />
      
      <a-form :model="resetPasswordForm" layout="vertical">
        <a-form-item label="新密码" field="newPassword">
          <a-input-password 
            v-model="resetPasswordForm.newPassword" 
            placeholder="请输入新密码"
            :min-length="6"
          />
        </a-form-item>
        <a-form-item label="确认密码" field="confirmPassword">
          <a-input-password 
            v-model="resetPasswordForm.confirmPassword" 
            placeholder="请再次输入新密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { IconPlus, IconCheckCircle, IconUser } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'

const loading = ref(false)
const searchKeyword = ref('')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const showResetPasswordModal = ref(false)
const editingUser = ref(null)
const viewingUser = ref(null)
const detailData = ref([])
const resetPasswordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 4, // 初始化为当前用户数量
  showTotal: true,
  showJumper: true
})

const users = reactive([
  {
    id: 1,
    username: 'admin',
    email: 'admin@ctf.com',
    role: 'admin',
    status: '启用',
    score: 1000,
    registerTime: '2024-01-01 00:00:00',
    lastLogin: '2024-03-15 10:30:00'
  },
  {
    id: 2,
    username: 'user001',
    email: 'user001@example.com',
    role: 'user',
    status: '启用',
    score: 850,
    registerTime: '2024-02-15 14:20:00',
    lastLogin: '2024-03-14 16:45:00'
  },
  {
    id: 3,
    username: 'user002',
    email: 'user002@example.com',
    role: 'user',
    status: '禁用',
    score: 650,
    registerTime: '2024-02-20 09:15:00',
    lastLogin: '2024-03-10 11:30:00'
  },
  {
    id: 4,
    username: 'guest001',
    email: 'guest001@example.com',
    role: 'guest',
    status: '启用',
    score: 200,
    registerTime: '2024-03-01 12:00:00',
    lastLogin: '2024-03-15 08:20:00'
  }
])

const userForm = reactive({
  username: '',
  email: '',
  role: '',
  status: true,
  password: ''
})

const getRoleColor = (role) => {
  const colors = {
    'admin': 'red',
    'user': 'blue',
    'guest': 'green'
  }
  return colors[role] || 'default'
}

const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
}

const editUser = (user) => {
  editingUser.value = user
  Object.assign(userForm, user)
  userForm.status = user.status === '启用'
  showAddModal.value = true
}

const resetPassword = (id) => {
  const user = users.find(u => u.id === id)
  if (user) {
    viewingUser.value = user
    resetPasswordForm.newPassword = ''
    resetPasswordForm.confirmPassword = ''
    showResetPasswordModal.value = true
  }
}

const handleResetPassword = () => {
  // 验证密码
  if (!resetPasswordForm.newPassword) {
    Message.error('请输入新密码')
    return
  }

  if (resetPasswordForm.newPassword.length < 6) {
    Message.error('密码长度不能少于6位')
    return
  }

  if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
    Message.error('两次输入的密码不一致')
    return
  }

  try {
    // 这里应该调用API重置密码
    // 模拟重置密码逻辑
    Message.success(`用户 ${viewingUser.value.username} 密码重置成功`)
    showResetPasswordModal.value = false
    handleCancelResetPassword()
  } catch (error) {
    Message.error('密码重置失败，请重试')
    console.error('重置密码时出错:', error)
  }
}

const handleCancelResetPassword = () => {
  resetPasswordForm.newPassword = ''
  resetPasswordForm.confirmPassword = ''
  viewingUser.value = null
}

const viewUserDetail = (user) => {
  viewingUser.value = user
  detailData.value = [
    { label: 'ID', value: user.id },
    { label: '用户名', value: user.username },
    { label: '邮箱地址', value: user.email },
    { label: '用户角色', value: getRoleDisplayName(user.role) },
    { label: '账户状态', value: user.status },
    { label: '注册时间', value: user.registerTime },
    { label: '最后登录', value: user.lastLogin }
  ]
  showDetailModal.value = true
}

// 获取角色显示名称
const getRoleDisplayName = (role) => {
  const roleNames = {
    'admin': '管理员',
    'user': '普通用户',
    'guest': '访客'
  }
  return roleNames[role] || role
}

const deleteUser = (id) => {
  try {
    const index = users.findIndex(u => u.id === id)
    if (index !== -1) {
      const deletedUser = users[index]
      users.splice(index, 1)
      pagination.total = users.length
      Message.success(`用户 ${deletedUser.username} 删除成功`)
    } else {
      Message.error('用户不存在')
    }
  } catch (error) {
    Message.error('删除失败，请重试')
    console.error('删除用户时出错:', error)
  }
}

const handleSaveUser = () => {
  // 表单验证
  if (!userForm.username || !userForm.email || !userForm.role) {
    Message.error('请填写所有必填字段')
    return
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userForm.email)) {
    Message.error('请输入正确的邮箱格式')
    return
  }

  // 新增用户时验证密码
  if (!editingUser.value && !userForm.password) {
    Message.error('请输入密码')
    return
  }

  if (!editingUser.value && userForm.password.length < 6) {
    Message.error('密码长度不能少于6位')
    return
  }

  try {
    if (editingUser.value) {
      // 编辑模式：更新现有用户
      const index = users.findIndex(u => u.id === editingUser.value.id)
      if (index !== -1) {
        users[index] = {
          ...users[index],
          username: userForm.username,
          email: userForm.email,
          role: userForm.role,
          status: userForm.status ? '启用' : '禁用'
        }
        Message.success('用户信息更新成功')
      }
    } else {
      // 检查用户名和邮箱是否已存在
      const existingUser = users.find(u => u.username === userForm.username || u.email === userForm.email)
      if (existingUser) {
        Message.error('用户名或邮箱已存在')
        return
      }

      // 添加模式：创建新用户
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        username: userForm.username,
        email: userForm.email,
        role: userForm.role,
        status: userForm.status ? '启用' : '禁用',
        score: 0,
        registerTime: new Date().toLocaleString('zh-CN'),
        lastLogin: '-'
      }
      users.push(newUser)
      Message.success('用户添加成功')
    }

    // 更新分页总数
    pagination.total = users.length

    // 关闭模态框并重置表单
    showAddModal.value = false
    handleCancelEdit()
  } catch (error) {
    Message.error('保存失败，请重试')
    console.error('保存用户时出错:', error)
  }
}

const handleCancelEdit = () => {
  editingUser.value = null
  Object.assign(userForm, {
    username: '',
    email: '',
    role: '',
    status: true,
    password: ''
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