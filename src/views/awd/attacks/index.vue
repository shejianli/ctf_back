<template>
  <div class="awd-attacks">
    <a-card title="攻击记录" :bordered="false">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model="searchForm.attacker"
              placeholder="攻击队伍"
              allow-clear
            />
          </a-col>
          <a-col :span="6">
            <a-input
              v-model="searchForm.target"
              placeholder="目标队伍"
              allow-clear
            />
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.status"
              placeholder="攻击状态"
              allow-clear
            >
              <a-option value="success">成功</a-option>
              <a-option value="failed">失败</a-option>
              <a-option value="blocked">被拦截</a-option>
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
        <a-button type="primary" @click="handleExport">
          <template #icon>
            <IconDownload />
          </template>
          导出记录
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchDelete">
          批量删除
        </a-button>
        <a-button style="margin-left: 8px" @click="handleRefresh">
          刷新数据
        </a-button>
      </div>

      <!-- 攻击记录列表 -->
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

        <template #attackType="{ record }">
          <a-tag :color="getAttackTypeColor(record.attackType)">
            {{ getAttackTypeText(record.attackType) }}
          </a-tag>
        </template>

        <template #score="{ record }">
          <span :style="{ color: record.score > 0 ? 'green' : 'red' }">
            {{ record.score > 0 ? '+' : '' }}{{ record.score }}
          </span>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="handleView(record)">
              查看详情
            </a-button>
            <a-button size="small" @click="handleReplay(record)">
              重放攻击
            </a-button>
            <a-popconfirm
              content="确定要删除这条记录吗？"
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

    <!-- 攻击详情弹窗 -->
    <a-modal
      v-model:visible="detailModalVisible"
      title="攻击详情"
      width="800px"
      :footer="false"
    >
      <a-descriptions :data="detailData" layout="vertical" bordered />

      <div style="margin-top: 16px;">
        <h4>攻击载荷</h4>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">{{ selectedAttack.payload }}</pre>
      </div>

      <div style="margin-top: 16px;">
        <h4>响应数据</h4>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">{{ selectedAttack.response }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconDownload } from '@arco-design/web-vue/es/icon'
import useLoading from '@/hooks/loading'

const { loading, setLoading } = useLoading()

// 搜索表单
const searchForm = reactive({
  attacker: '',
  target: '',
  status: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    attacker: 'Team Alpha',
    target: 'Team Beta',
    attackType: 'sql-injection',
    status: 'success',
    score: 50,
    timestamp: '2024-01-15 14:30:25',
    payload: "'; DROP TABLE users; --",
    response: 'Flag: flag{web1_flag_1}',
    targetHost: '192.168.1.10:8080',
    duration: 1200
  },
  {
    id: 2,
    attacker: 'Team Gamma',
    target: 'Team Delta',
    attackType: 'xss',
    status: 'failed',
    score: -10,
    timestamp: '2024-01-15 14:25:10',
    payload: '',
    response: 'Attack blocked by WAF',
    targetHost: '192.168.1.11:8080',
    duration: 800
  },
  {
    id: 3,
    attacker: 'Team Beta',
    target: 'Team Alpha',
    attackType: 'buffer-overflow',
    status: 'success',
    score: 100,
    timestamp: '2024-01-15 14:20:45',
    payload: 'A' * 1024 + '\x90\x90\x90...',
    response: 'Flag: flag{pwn1_flag_1}',
    targetHost: '192.168.1.12:2222',
    duration: 2500
  },
  {
    id: 4,
    attacker: 'Team Delta',
    target: 'Team Gamma',
    attackType: 'file-upload',
    status: 'blocked',
    score: 0,
    timestamp: '2024-01-15 14:15:30',
    payload: 'shell.php',
    response: 'File upload blocked',
    targetHost: '192.168.1.13:8080',
    duration: 500
  }
])

// 表格列配置
const columns = [
  {
    title: '攻击队伍',
    dataIndex: 'attacker',
    key: 'attacker'
  },
  {
    title: '目标队伍',
    dataIndex: 'target',
    key: 'target'
  },
  {
    title: '攻击类型',
    dataIndex: 'attackType',
    key: 'attackType',
    slotName: 'attackType'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slotName: 'status'
  },
  {
    title: '得分',
    dataIndex: 'score',
    key: 'score',
    slotName: 'score'
  },
  {
    title: '目标主机',
    dataIndex: 'targetHost',
    key: 'targetHost'
  },
  {
    title: '攻击时间',
    dataIndex: 'timestamp',
    key: 'timestamp'
  },
  {
    title: '持续时间(ms)',
    dataIndex: 'duration',
    key: 'duration'
  },
  {
    title: '操作',
    key: 'actions',
    slotName: 'actions',
    width: 200
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

// 详情弹窗
const detailModalVisible = ref(false)
const selectedAttack = ref({})
const detailData = ref([])

// 状态颜色映射
const getStatusColor = (status) => {
  const colors = {
    success: 'green',
    failed: 'red',
    blocked: 'orange'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    success: '成功',
    failed: '失败',
    blocked: '被拦截'
  }
  return texts[status] || '未知'
}

const getAttackTypeColor = (type) => {
  const colors = {
    'sql-injection': 'red',
    'xss': 'orange',
    'file-upload': 'purple',
    'buffer-overflow': 'blue',
    'rce': 'darkred'
  }
  return colors[type] || 'gray'
}

const getAttackTypeText = (type) => {
  const texts = {
    'sql-injection': 'SQL注入',
    'xss': 'XSS',
    'file-upload': '文件上传',
    'buffer-overflow': '缓冲区溢出',
    'rce': '远程代码执行'
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

// 查看详情
const handleView = (record) => {
  selectedAttack.value = record
  detailData.value = [
    { label: '攻击队伍', value: record.attacker },
    { label: '目标队伍', value: record.target },
    { label: '攻击类型', value: getAttackTypeText(record.attackType) },
    { label: '攻击状态', value: getStatusText(record.status) },
    { label: '得分', value: record.score },
    { label: '目标主机', value: record.targetHost },
    { label: '攻击时间', value: record.timestamp },
    { label: '持续时间', value: `${record.duration}ms` }
  ]
  detailModalVisible.value = true
}

// 重放攻击
const handleReplay = (record) => {
  Message.info(`重放攻击: ${record.attacker} -> ${record.target}`)
}

// 删除记录
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

// 导出记录
const handleExport = () => {
  Message.info('导出攻击记录')
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的记录')
    return
  }
  Message.info(`批量删除 ${selectedRowKeys.value.length} 条记录`)
}

// 刷新数据
const handleRefresh = () => {
  Message.info('刷新攻击记录数据')
}

onMounted(() => {
  // 初始化数据
  pagination.total = tableData.value.length
})
// 修复语法错误
</script>

<style scoped>
.awd-attacks {
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
