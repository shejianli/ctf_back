<template>
  <div class="awd-targets">
    <a-card title="靶机配置" :bordered="false">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model="searchForm.name"
              placeholder="靶机名称"
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
              <a-option value="error">错误</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.type"
              placeholder="靶机类型"
              allow-clear
            >
              <a-option value="web">Web靶机</a-option>
              <a-option value="pwn">Pwn靶机</a-option>
              <a-option value="crypto">密码学靶机</a-option>
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
          添加靶机
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
      </div>

      <!-- 靶机列表 -->
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

        <template #vulnerabilities="{ record }">
          <a-space>
            <a-tag v-for="vuln in record.vulnerabilities" :key="vuln" size="small">
              {{ vuln }}
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
              :type="record.status === 'running' ? 'danger' : 'primary'"
              @click="handleToggleStatus(record)"
            >
              {{ record.status === 'running' ? '停止' : '启动' }}
            </a-button>
            <a-button size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-button size="small" @click="handleConfig(record)">
              配置
            </a-button>
            <a-popconfirm
              content="确定要删除这个靶机吗？"
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

    <!-- 添加/编辑靶机弹窗 -->
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
            <a-form-item field="name" label="靶机名称">
              <a-input v-model="formData.name" placeholder="请输入靶机名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="type" label="靶机类型">
              <a-select v-model="formData.type" placeholder="请选择靶机类型">
                <a-option value="web">Web靶机</a-option>
                <a-option value="pwn">Pwn靶机</a-option>
                <a-option value="crypto">密码学靶机</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="描述">
          <a-textarea v-model="formData.description" placeholder="请输入描述" />
        </a-form-item>

        <a-form-item field="image" label="Docker镜像">
          <a-input v-model="formData.image" placeholder="请输入Docker镜像名称" />
        </a-form-item>

        <a-form-item field="ports" label="端口映射">
          <a-input v-model="formData.ports" placeholder="例如: 8080:80,3306:3306" />
        </a-form-item>

        <a-form-item field="vulnerabilities" label="漏洞类型">
          <a-select
            v-model="formData.vulnerabilities"
            mode="multiple"
            placeholder="请选择漏洞类型"
          >
            <a-option value="sql-injection">SQL注入</a-option>
            <a-option value="xss">XSS</a-option>
            <a-option value="file-upload">文件上传</a-option>
            <a-option value="rce">远程代码执行</a-option>
            <a-option value="buffer-overflow">缓冲区溢出</a-option>
            <a-option value="format-string">格式化字符串</a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="flags" label="Flag配置">
          <a-textarea 
            v-model="formData.flags" 
            placeholder="请输入Flag配置，每行一个"
            :rows="4"
          />
        </a-form-item>

        <a-form-item field="checkScript" label="检查脚本">
          <a-textarea 
            v-model="formData.checkScript" 
            placeholder="请输入检查脚本"
            :rows="6"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
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
    name: 'Web靶机1',
    description: 'Web安全靶机，包含SQL注入和XSS漏洞',
    type: 'web',
    status: 'running',
    image: 'awd/web-target1',
    ports: '8080:80',
    vulnerabilities: ['sql-injection', 'xss'],
    flags: 'flag{web1_flag_1}\nflag{web1_flag_2}',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: 'Pwn靶机1',
    description: 'Pwn靶机，包含缓冲区溢出漏洞',
    type: 'pwn',
    status: 'running',
    image: 'awd/pwn-target1',
    ports: '2222:22',
    vulnerabilities: ['buffer-overflow'],
    flags: 'flag{pwn1_flag_1}',
    createTime: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    name: 'Web靶机2',
    description: 'Web安全靶机，包含文件上传漏洞',
    type: 'web',
    status: 'stopped',
    image: 'awd/web-target2',
    ports: '8081:80',
    vulnerabilities: ['file-upload', 'rce'],
    flags: 'flag{web2_flag_1}\nflag{web2_flag_2}',
    createTime: '2024-01-13 09:15:00'
  }
])

// 表格列配置
const columns = [
  {
    title: '靶机名称',
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
    title: '镜像',
    dataIndex: 'image',
    key: 'image'
  },
  {
    title: '端口映射',
    dataIndex: 'ports',
    key: 'ports'
  },
  {
    title: '漏洞类型',
    dataIndex: 'vulnerabilities',
    key: 'vulnerabilities',
    slotName: 'vulnerabilities'
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
const modalTitle = ref('添加靶机')
const formRef = ref()
const formData = reactive({
  name: '',
  description: '',
  type: '',
  image: '',
  ports: '',
  vulnerabilities: [],
  flags: '',
  checkScript: ''
})

const formRules = {
  name: [{ required: true, message: '请输入靶机名称' }],
  type: [{ required: true, message: '请选择靶机类型' }],
  image: [{ required: true, message: '请输入Docker镜像' }],
  vulnerabilities: [{ required: true, message: '请选择漏洞类型' }]
}

// 状态颜色映射
const getStatusColor = (status) => {
  const colors = {
    running: 'green',
    stopped: 'orange',
    error: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    running: '运行中',
    stopped: '已停止',
    error: '错误'
  }
  return texts[status] || '未知'
}

const getTypeColor = (type) => {
  const colors = {
    web: 'blue',
    pwn: 'red',
    crypto: 'purple'
  }
  return colors[type] || 'gray'
}

const getTypeText = (type) => {
  const texts = {
    web: 'Web靶机',
    pwn: 'Pwn靶机',
    crypto: '密码学靶机'
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

// 添加靶机
const handleAdd = () => {
  modalTitle.value = '添加靶机'
  modalVisible.value = true
  // 重置表单
  Object.keys(formData).forEach(key => {
    if (key === 'vulnerabilities') formData[key] = []
    else formData[key] = ''
  })
}

// 编辑靶机
const handleEdit = (record) => {
  modalTitle.value = '编辑靶机'
  modalVisible.value = true
  // 填充表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = record[key] || ''
  })
}

// 查看靶机
const handleView = (record) => {
  Message.info(`查看靶机: ${record.name}`)
}

// 配置靶机
const handleConfig = (record) => {
  Message.info(`配置靶机: ${record.name}`)
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

// 删除靶机
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
    Message.warning('请选择要启动的靶机')
    return
  }
  Message.info(`批量启动 ${selectedRowKeys.value.length} 个靶机`)
}

const handleBatchStop = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要停止的靶机')
    return
  }
  Message.info(`批量停止 ${selectedRowKeys.value.length} 个靶机`)
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的靶机')
    return
  }
  Message.info(`批量删除 ${selectedRowKeys.value.length} 个靶机`)
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
.awd-targets {
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