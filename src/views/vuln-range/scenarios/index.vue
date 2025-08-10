<template>
  <div class="vuln-scenarios">
    <a-card title="场景管理" :bordered="false">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model="searchForm.name"
              placeholder="场景名称"
              allow-clear
            />
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.status"
              placeholder="状态"
              allow-clear
            >
              <a-option value="active">活跃</a-option>
              <a-option value="inactive">非活跃</a-option>
              <a-option value="draft">草稿</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.category"
              placeholder="场景分类"
              allow-clear
            >
              <a-option value="web">Web漏洞</a-option>
              <a-option value="network">网络漏洞</a-option>
              <a-option value="system">系统漏洞</a-option>
              <a-option value="application">应用漏洞</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <IconSearch />
              </template>
              搜索
            </a-button>
            <a-button style="margin-left: 8px" @click="handleReset">
              重置
            </a-button>
          </a-col>
        </a-row>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <a-button type="primary" @click="handleAdd">
          <template #icon>
            <IconPlus />
          </template>
          创建场景
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchActivate">
          批量激活
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchDeactivate">
          批量停用
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchDelete">
          批量删除
        </a-button>
        <a-button style="margin-left: 8px" @click="handleImport">
          <template #icon>
            <IconUpload />
          </template>
          导入场景
        </a-button>
        <a-button style="margin-left: 8px" @click="handleExport">
          <template #icon>
            <IconDownload />
          </template>
          导出场景
        </a-button>
      </div>

      <!-- 场景列表 -->
      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        row-key="id"
        :row-selection="rowSelection"
      >
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template #category="{ record }">
          <a-tag :color="getCategoryColor(record.category)">
            {{ getCategoryText(record.category) }}
          </a-tag>
        </template>

        <template #difficulty="{ record }">
          <a-tag :color="getDifficultyColor(record.difficulty)">
            {{ getDifficultyText(record.difficulty) }}
          </a-tag>
        </template>

        <template #targets="{ record }">
          <a-space>
            <a-tag v-for="target in record.targets" :key="target" size="small">
              {{ target }}
            </a-tag>
          </a-space>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button 
              size="small" 
              :type="record.status === 'active' ? 'danger' : 'primary'"
              @click="handleToggleStatus(record)"
            >
              {{ record.status === 'active' ? '停用' : '激活' }}
            </a-button>
            <a-button size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-button size="small" @click="handleDeploy(record)">
              部署
            </a-button>
            <a-popconfirm
              content="确定要删除这个场景吗？"
              @ok="handleDelete(record)"
            >
              <a-button size="small" status="danger">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑场景弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      width="800px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="场景名称">
              <a-input v-model="formData.name" placeholder="请输入场景名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="category" label="场景分类">
              <a-select v-model="formData.category" placeholder="请选择场景分类">
                <a-option value="web">Web漏洞</a-option>
                <a-option value="network">网络漏洞</a-option>
                <a-option value="system">系统漏洞</a-option>
                <a-option value="application">应用漏洞</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="场景描述">
          <a-textarea v-model="formData.description" placeholder="请输入场景描述" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="difficulty" label="难度等级">
              <a-select v-model="formData.difficulty" placeholder="请选择难度">
                <a-option value="easy">简单</a-option>
                <a-option value="medium">中等</a-option>
                <a-option value="hard">困难</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="estimatedTime" label="预估时间(分钟)">
              <a-input-number 
                v-model="formData.estimatedTime" 
                :min="5" 
                :max="480"
                placeholder="预估时间"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="maxParticipants" label="最大参与人数">
              <a-input-number 
                v-model="formData.maxParticipants" 
                :min="1" 
                :max="100"
                placeholder="最大人数"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="targets" label="目标靶机">
          <a-select
            v-model="formData.targets"
            mode="multiple"
            placeholder="请选择目标靶机"
          >
            <a-option value="dvwa">DVWA</a-option>
            <a-option value="vulhub">Vulhub</a-option>
            <a-option value="pwnable">Pwnable.kr</a-option>
            <a-option value="metasploitable">Metasploitable</a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="scenario" label="场景配置">
          <a-textarea 
            v-model="formData.scenario" 
            placeholder="请输入场景配置JSON"
            :rows="8"
          />
        </a-form-item>

        <a-form-item field="tags" label="标签">
          <a-input v-model="formData.tags" placeholder="请输入标签，用逗号分隔" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 部署场景弹窗 -->
    <a-modal
      v-model:visible="deployModalVisible"
      title="部署场景"
      @ok="handleDeployOk"
      @cancel="handleDeployCancel"
      width="600px"
    >
      <a-form
        ref="deployFormRef"
        :model="deployForm"
        layout="vertical"
      >
        <a-form-item field="deployName" label="部署名称">
          <a-input v-model="deployForm.deployName" placeholder="请输入部署名称" />
        </a-form-item>
        
        <a-form-item field="participants" label="参与人数">
          <a-input-number 
            v-model="deployForm.participants" 
            :min="1" 
            :max="selectedScenario.maxParticipants || 100"
            placeholder="参与人数"
          />
        </a-form-item>

        <a-form-item field="duration" label="持续时间(小时)">
          <a-input-number 
            v-model="deployForm.duration" 
            :min="1" 
            :max="24"
            placeholder="持续时间"
          />
        </a-form-item>

        <a-form-item field="description" label="部署描述">
          <a-textarea v-model="deployForm.description" placeholder="请输入部署描述" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconUpload, IconDownload } from '@arco-design/web-vue/es/icon'
import useLoading from '@/hooks/loading'

const { loading, setLoading } = useLoading()

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  category: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: 'Web安全入门',
    description: 'Web安全基础知识练习场景，包含SQL注入、XSS等常见漏洞',
    category: 'web',
    status: 'active',
    difficulty: 'easy',
    estimatedTime: 60,
    maxParticipants: 20,
    targets: ['dvwa', 'vulhub'],
    tags: 'web,sql注入,xss',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '网络渗透测试',
    description: '网络渗透测试综合场景，包含端口扫描、服务识别、漏洞利用',
    category: 'network',
    status: 'active',
    difficulty: 'medium',
    estimatedTime: 120,
    maxParticipants: 15,
    targets: ['metasploitable'],
    tags: 'network,渗透测试',
    createTime: '2024-01-14 15:20:00',
    updateTime: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    name: '缓冲区溢出练习',
    description: 'Pwn缓冲区溢出漏洞练习场景',
    category: 'application',
    status: 'inactive',
    difficulty: 'hard',
    estimatedTime: 180,
    maxParticipants: 10,
    targets: ['pwnable'],
    tags: 'pwn,缓冲区溢出',
    createTime: '2024-01-13 09:15:00',
    updateTime: '2024-01-13 09:15:00'
  }
])

// 表格列配置
const columns = [
  {
    title: '场景名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    slotName: 'category'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slotName: 'status'
  },
  {
    title: '难度',
    dataIndex: 'difficulty',
    key: 'difficulty',
    slotName: 'difficulty'
  },
  {
    title: '预估时间',
    dataIndex: 'estimatedTime',
    key: 'estimatedTime',
    render: ({ record }) => `${record.estimatedTime}分钟`
  },
  {
    title: '目标靶机',
    dataIndex: 'targets',
    key: 'targets',
    slotName: 'targets'
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '操作',
    key: 'actions',
    slotName: 'actions',
    width: 280
  }
]

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
})

// 选择配置
const selectedRowKeys = ref([])
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  selectedRowKeys: selectedRowKeys.value,
  onChange: (selectedRowKeys, selectedRows) => {
    selectedRowKeys.value = selectedRowKeys
  }
}

// 弹窗相关
const modalVisible = ref(false)
const modalTitle = ref('创建场景')
const formRef = ref()
const formData = reactive({
  name: '',
  description: '',
  category: '',
  difficulty: '',
  estimatedTime: 60,
  maxParticipants: 20,
  targets: [],
  scenario: '',
  tags: ''
})

const formRules = {
  name: [{ required: true, message: '请输入场景名称' }],
  category: [{ required: true, message: '请选择场景分类' }],
  difficulty: [{ required: true, message: '请选择难度等级' }],
  targets: [{ required: true, message: '请选择目标靶机' }]
}

// 部署弹窗
const deployModalVisible = ref(false)
const deployFormRef = ref()
const selectedScenario = ref({})
const deployForm = reactive({
  deployName: '',
  participants: 1,
  duration: 2,
  description: ''
})

// 状态颜色映射
const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    inactive: 'orange',
    draft: 'gray'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    active: '活跃',
    inactive: '非活跃',
    draft: '草稿'
  }
  return texts[status] || '未知'
}

const getCategoryColor = (category) => {
  const colors = {
    web: 'blue',
    network: 'green',
    system: 'red',
    application: 'purple'
  }
  return colors[category] || 'gray'
}

const getCategoryText = (category) => {
  const texts = {
    web: 'Web漏洞',
    network: '网络漏洞',
    system: '系统漏洞',
    application: '应用漏洞'
  }
  return texts[category] || '未知'
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  }
  return colors[difficulty] || 'gray'
}

const getDifficultyText = (difficulty) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty] || '未知'
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  // 这里应该调用API进行搜索
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

// 分页
const onPageChange = (current) => {
  pagination.current = current
  // 重新加载数据
}

const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  // 重新加载数据
}

// 添加场景
const handleAdd = () => {
  modalTitle.value = '创建场景'
  modalVisible.value = true
  // 重置表单
  Object.keys(formData).forEach(key => {
    if (key === 'estimatedTime') formData[key] = 60
    else if (key === 'maxParticipants') formData[key] = 20
    else if (key === 'targets') formData[key] = []
    else formData[key] = ''
  })
}

// 编辑场景
const handleEdit = (record) => {
  modalTitle.value = '编辑场景'
  modalVisible.value = true
  // 填充表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = record[key] || ''
  })
}

// 查看场景
const handleView = (record) => {
  Message.info(`查看场景: ${record.name}`)
}

// 部署场景
const handleDeploy = (record) => {
  selectedScenario.value = record
  deployForm.deployName = `${record.name}_部署_${new Date().getTime()}`
  deployForm.participants = 1
  deployForm.duration = 2
  deployForm.description = `部署场景: ${record.name}`
  deployModalVisible.value = true
}

// 切换状态
const handleToggleStatus = async (record) => {
  const action = record.status === 'active' ? '停用' : '激活'
  try {
    setLoading(true)
    // 这里应该调用API
    await new Promise(resolve => setTimeout(resolve, 1000))
    record.status = record.status === 'active' ? 'inactive' : 'active'
    Message.success(`${action}成功`)
  } catch (error) {
    Message.error(`${action}失败`)
  } finally {
    setLoading(false)
  }
}

// 删除场景
const handleDelete = async (record) => {
  try {
    setLoading(true)
    // 这里应该调用API
    await new Promise(resolve => setTimeout(resolve, 1000))
    const index = tableData.value.findIndex(item => item.id === record.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    Message.success('删除成功')
  } catch (error) {
    Message.error('删除失败')
  } finally {
    setLoading(false)
  }
}

// 批量操作
const handleBatchActivate = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要激活的场景')
    return
  }
  Message.info(`批量激活 ${selectedRowKeys.value.length} 个场景`)
}

const handleBatchDeactivate = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要停用的场景')
    return
  }
  Message.info(`批量停用 ${selectedRowKeys.value.length} 个场景`)
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的场景')
    return
  }
  Message.info(`批量删除 ${selectedRowKeys.value.length} 个场景`)
}

const handleImport = () => {
  Message.info('导入场景功能')
}

const handleExport = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要导出的场景')
    return
  }
  Message.info(`导出 ${selectedRowKeys.value.length} 个场景`)
}

// 弹窗确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    setLoading(true)
    // 这里应该调用API
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('保存成功')
    modalVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    setLoading(false)
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
}

// 部署确认
const handleDeployOk = async () => {
  try {
    setLoading(true)
    // 这里应该调用API
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('部署成功')
    deployModalVisible.value = false
  } catch (error) {
    Message.error('部署失败')
  } finally {
    setLoading(false)
  }
}

const handleDeployCancel = () => {
  deployModalVisible.value = false
}

onMounted(() => {
  // 初始化数据
  pagination.total = tableData.value.length
})
</script>

<style scoped>
.vuln-scenarios {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.action-bar {
  margin-bottom: 16px;
}
</style> 