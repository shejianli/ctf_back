<template>
  <div class="vuln-environments">
    <a-card title="环境管理" :bordered="false">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model="searchForm.name"
              placeholder="环境名称"
              allow-clear
            />
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.status"
              placeholder="运行状态"
              allow-clear
            >
              <a-option value="running">运行中</a-option>
              <a-option value="stopped">已停止</a-option>
              <a-option value="building">构建中</a-option>
              <a-option value="error">错误</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.type"
              placeholder="环境类型"
              allow-clear
            >
              <a-option value="web">Web环境</a-option>
              <a-option value="pwn">Pwn环境</a-option>
              <a-option value="crypto">密码学环境</a-option>
              <a-option value="reverse">逆向环境</a-option>
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
          创建环境
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchStart">
          批量启动
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchStop">
          批量停止
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchDelete">
          批量删除
        </a-button>
        <a-button style="margin-left: 8px" @click="handleRefresh">
          <template #icon>
            <IconRefresh />
          </template>
          刷新状态
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBackup">
          <template #icon>
            <IconDownload />
          </template>
          备份环境
        </a-button>
      </div>

      <!-- 环境列表 -->
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

        <template #type="{ record }">
          <a-tag :color="getTypeColor(record.type)">
            {{ getTypeText(record.type) }}
          </a-tag>
        </template>

        <template #resources="{ record }">
          <div>
            <div>CPU: {{ record.cpu }}%</div>
            <div>内存: {{ record.memory }}MB</div>
            <div>磁盘: {{ record.disk }}GB</div>
          </div>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button 
              size="small" 
              :type="record.status === 'running' ? 'danger' : 'primary'"
              @click="handleToggleStatus(record)"
            >
              {{ record.status === 'running' ? '停止' : '启动' }}
            </a-button>
            <a-button size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-button size="small" @click="handleLogs(record)">
              日志
            </a-button>
            <a-popconfirm
              content="确定要删除这个环境吗？"
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

    <!-- 添加/编辑环境弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      width="700px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" label="环境名称">
              <a-input v-model="formData.name" placeholder="请输入环境名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="type" label="环境类型">
              <a-select v-model="formData.type" placeholder="请选择环境类型">
                <a-option value="web">Web环境</a-option>
                <a-option value="pwn">Pwn环境</a-option>
                <a-option value="crypto">密码学环境</a-option>
                <a-option value="reverse">逆向环境</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="描述">
          <a-textarea v-model="formData.description" placeholder="请输入描述" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="cpu" label="CPU限制">
              <a-input-number 
                v-model="formData.cpu" 
                :min="1" 
                :max="100"
                placeholder="CPU百分比"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="memory" label="内存限制(MB)">
              <a-input-number 
                v-model="formData.memory" 
                :min="128" 
                :max="8192"
                placeholder="内存大小"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="disk" label="磁盘限制(GB)">
              <a-input-number 
                v-model="formData.disk" 
                :min="1" 
                :max="100"
                placeholder="磁盘大小"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="dockerfile" label="Dockerfile">
          <a-textarea 
            v-model="formData.dockerfile" 
            placeholder="请输入Dockerfile内容"
            :rows="8"
          />
        </a-form-item>

        <a-form-item field="ports" label="端口映射">
          <a-input v-model="formData.ports" placeholder="例如: 8080:80,3306:3306" />
        </a-form-item>

        <a-form-item field="envVars" label="环境变量">
          <a-textarea 
            v-model="formData.envVars" 
            placeholder="KEY1=VALUE1&#10;KEY2=VALUE2"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 日志查看弹窗 -->
    <a-modal
      v-model:visible="logModalVisible"
      title="环境日志"
      width="800px"
      :footer="false"
    >
      <a-tabs>
        <a-tab-pane key="build" title="构建日志">
          <div class="log-content">
            <pre>{{ selectedLogs.build }}</pre>
          </div>
        </a-tab-pane>
        <a-tab-pane key="runtime" title="运行日志">
          <div class="log-content">
            <pre>{{ selectedLogs.runtime }}</pre>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconRefresh, IconDownload } from '@arco-design/web-vue/es/icon'
import useLoading from '@/hooks/loading'

const { loading, setLoading } = useLoading()

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  type: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: 'DVWA环境',
    description: 'Damn Vulnerable Web Application 漏洞环境',
    type: 'web',
    status: 'running',
    cpu: 25,
    memory: 512,
    disk: 5,
    ports: '8080:80',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: 'Vulhub环境',
    description: 'Vulhub漏洞环境集合',
    type: 'web',
    status: 'stopped',
    cpu: 30,
    memory: 1024,
    disk: 10,
    ports: '8081:80',
    createTime: '2024-01-14 15:20:00',
    updateTime: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    name: 'Pwn环境',
    description: 'Pwn漏洞练习环境',
    type: 'pwn',
    status: 'building',
    cpu: 50,
    memory: 2048,
    disk: 20,
    ports: '2222:22',
    createTime: '2024-01-13 09:15:00',
    updateTime: '2024-01-13 09:15:00'
  }
])

// 表格列配置
const columns = [
  {
    title: '环境名称',
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
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    slotName: 'type'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slotName: 'status'
  },
  {
    title: '资源使用',
    dataIndex: 'resources',
    key: 'resources',
    slotName: 'resources'
  },
  {
    title: '端口映射',
    dataIndex: 'ports',
    key: 'ports'
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
    width: 250
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
const modalTitle = ref('创建环境')
const formRef = ref()
const formData = reactive({
  name: '',
  description: '',
  type: '',
  cpu: 25,
  memory: 512,
  disk: 5,
  ports: '',
  dockerfile: '',
  envVars: ''
})

const formRules = {
  name: [{ required: true, message: '请输入环境名称' }],
  type: [{ required: true, message: '请选择环境类型' }],
  dockerfile: [{ required: true, message: '请输入Dockerfile内容' }]
}

// 日志弹窗
const logModalVisible = ref(false)
const selectedLogs = reactive({
  build: '',
  runtime: ''
})

// 状态颜色映射
const getStatusColor = (status) => {
  const colors = {
    running: 'green',
    stopped: 'orange',
    building: 'blue',
    error: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    running: '运行中',
    stopped: '已停止',
    building: '构建中',
    error: '错误'
  }
  return texts[status] || '未知'
}

const getTypeColor = (type) => {
  const colors = {
    web: 'blue',
    pwn: 'red',
    crypto: 'purple',
    reverse: 'orange'
  }
  return colors[type] || 'gray'
}

const getTypeText = (type) => {
  const texts = {
    web: 'Web环境',
    pwn: 'Pwn环境',
    crypto: '密码学环境',
    reverse: '逆向环境'
  }
  return texts[type] || '未知'
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

// 添加环境
const handleAdd = () => {
  modalTitle.value = '创建环境'
  modalVisible.value = true
  // 重置表单
  Object.keys(formData).forEach(key => {
    if (key === 'cpu') formData[key] = 25
    else if (key === 'memory') formData[key] = 512
    else if (key === 'disk') formData[key] = 5
    else formData[key] = ''
  })
}

// 编辑环境
const handleEdit = (record) => {
  modalTitle.value = '编辑环境'
  modalVisible.value = true
  // 填充表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = record[key] || ''
  })
}

// 查看环境
const handleView = (record) => {
  Message.info(`查看环境: ${record.name}`)
}

// 查看日志
const handleLogs = (record) => {
  selectedLogs.build = `构建日志 - ${record.name}\n[INFO] 开始构建镜像...\n[INFO] 下载基础镜像...\n[INFO] 复制文件...\n[INFO] 构建完成`
  selectedLogs.runtime = `运行日志 - ${record.name}\n[INFO] 容器启动成功\n[INFO] 服务运行正常\n[INFO] 端口 8080 已开放`
  logModalVisible.value = true
}

// 切换状态
const handleToggleStatus = async (record) => {
  const action = record.status === 'running' ? '停止' : '启动'
  try {
    setLoading(true)
    // 这里应该调用API
    await new Promise(resolve => setTimeout(resolve, 1000))
    record.status = record.status === 'running' ? 'stopped' : 'running'
    Message.success(`${action}成功`)
  } catch (error) {
    Message.error(`${action}失败`)
  } finally {
    setLoading(false)
  }
}

// 删除环境
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
const handleBatchStart = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要启动的环境')
    return
  }
  Message.info(`批量启动 ${selectedRowKeys.value.length} 个环境`)
}

const handleBatchStop = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要停止的环境')
    return
  }
  Message.info(`批量停止 ${selectedRowKeys.value.length} 个环境`)
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的环境')
    return
  }
  Message.info(`批量删除 ${selectedRowKeys.value.length} 个环境`)
}

const handleRefresh = async () => {
  try {
    setLoading(true)
    // 这里应该调用API刷新状态
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('状态刷新成功')
  } catch (error) {
    Message.error('状态刷新失败')
  } finally {
    setLoading(false)
  }
}

const handleBackup = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要备份的环境')
    return
  }
  Message.info(`备份 ${selectedRowKeys.value.length} 个环境`)
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

onMounted(() => {
  // 初始化数据
  pagination.total = tableData.value.length
})
</script>

<style scoped>
.vuln-environments {
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

.log-content {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.log-content pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}
</style> 