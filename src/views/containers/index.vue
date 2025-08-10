<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>CTF平台管理</a-breadcrumb-item>
      <a-breadcrumb-item>镜像管理</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row style="margin: 16px 0">
      <a-col flex="100px">
        <a-button type="primary" @click="showAddModal = true">
          <template #icon>
            <IconPlus />
          </template>
          添加镜像
        </a-button>
      </a-col>
      <a-col flex="auto" />
      <a-col flex="100px">
        <a-button @click="refreshContainers">
          <template #icon>
            <IconRefresh />
          </template>
          刷新
        </a-button>
      </a-col>
    </a-row>

    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane key="running" title="运行中">
        <a-table :data="runningContainers" :loading="loading">
          <template #columns>
            <a-table-column title="容器ID" data-index="id" :width="120" />
            <a-table-column title="镜像名称" data-index="image" :width="200" />
            <a-table-column title="端口映射" data-index="ports" :width="150" />
            <a-table-column title="状态" data-index="status" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.status === 'running' ? 'green' : 'red'">
                  {{ record.status }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="创建时间" data-index="createTime" :width="150" />
            <a-table-column title="操作" :width="200">
              <template #cell="{ record }">
                <a-space>
                  <a-button size="small" @click="stopContainer(record.id)">停止</a-button>
                  <a-button size="small" @click="restartContainer(record.id)">重启</a-button>
                  <a-popconfirm
                    content="确定要删除这个容器吗？"
                    @ok="deleteContainer(record.id)"
                  >
                    <a-button size="small" status="danger">删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="images" title="镜像列表">
        <a-table :data="dockerImages" :loading="loading">
          <template #columns>
            <a-table-column title="镜像ID" data-index="id" :width="120" />
            <a-table-column title="镜像名称" data-index="name" :width="200" />
            <a-table-column title="标签" data-index="tag" :width="100" />
            <a-table-column title="大小" data-index="size" :width="100" />
            <a-table-column title="创建时间" data-index="createTime" :width="150" />
            <a-table-column title="操作" :width="200">
              <template #cell="{ record }">
                <a-space>
                  <a-button size="small" @click="runContainer(record.id)">运行</a-button>
                  <a-popconfirm
                    content="确定要删除这个镜像吗？"
                    @ok="deleteImage(record.id)"
                  >
                    <a-button size="small" status="danger">删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- 添加镜像模态框 -->
    <a-modal
      v-model:visible="showAddModal"
      title="添加镜像"
      @ok="handleAddImage"
      @cancel="handleCancelAdd"
    >
      <a-form :model="imageForm" layout="vertical">
        <a-form-item label="镜像名称" field="name">
          <a-input v-model="imageForm.name" placeholder="请输入镜像名称" />
        </a-form-item>
        <a-form-item label="镜像标签" field="tag">
          <a-input v-model="imageForm.tag" placeholder="请输入镜像标签" />
        </a-form-item>
        <a-form-item label="端口映射" field="ports">
          <a-input v-model="imageForm.ports" placeholder="例如: 8080:80" />
        </a-form-item>
        <a-form-item label="环境变量" field="env">
          <a-textarea v-model="imageForm.env" :rows="3" placeholder="每行一个环境变量，格式: KEY=VALUE" />
        </a-form-item>
        <a-form-item label="启动命令" field="command">
          <a-input v-model="imageForm.command" placeholder="容器启动命令" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'

const loading = ref(false)
const activeTab = ref('running')
const showAddModal = ref(false)

const runningContainers = reactive([
  {
    id: 'abc123def456',
    image: 'ctf-web-challenge:latest',
    ports: '8080:80',
    status: 'running',
    createTime: '2024-03-15 10:30:00'
  },
  {
    id: 'def789ghi012',
    image: 'ctf-pwn-challenge:latest',
    ports: '9999:9999',
    status: 'running',
    createTime: '2024-03-15 11:00:00'
  },
  {
    id: 'ghi345jkl678',
    image: 'ctf-crypto-challenge:latest',
    ports: '8888:8888',
    status: 'running',
    createTime: '2024-03-15 12:15:00'
  }
])

const dockerImages = reactive([
  {
    id: 'sha256:abc123',
    name: 'ctf-web-challenge',
    tag: 'latest',
    size: '256MB',
    createTime: '2024-03-10 09:00:00'
  },
  {
    id: 'sha256:def456',
    name: 'ctf-pwn-challenge',
    tag: 'latest',
    size: '512MB',
    createTime: '2024-03-11 14:30:00'
  },
  {
    id: 'sha256:ghi789',
    name: 'ctf-crypto-challenge',
    tag: 'latest',
    size: '128MB',
    createTime: '2024-03-12 16:45:00'
  }
])

const imageForm = reactive({
  name: '',
  tag: 'latest',
  ports: '',
  env: '',
  command: ''
})

const refreshContainers = () => {
  loading.value = true
  // 模拟刷新操作
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const stopContainer = (id) => {
  console.log('停止容器:', id)
}

const restartContainer = (id) => {
  console.log('重启容器:', id)
}

const deleteContainer = (id) => {
  console.log('删除容器:', id)
}

const runContainer = (imageId) => {
  console.log('运行容器:', imageId)
}

const deleteImage = (imageId) => {
  console.log('删除镜像:', imageId)
}

const handleAddImage = () => {
  console.log('添加镜像:', imageForm)
  showAddModal.value = false
  handleCancelAdd()
}

const handleCancelAdd = () => {
  Object.assign(imageForm, {
    name: '',
    tag: 'latest',
    ports: '',
    env: '',
    command: ''
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