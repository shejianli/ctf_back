<template>
  <div class="awd-defenses">
    <a-card title="防御状态" :bordered="false">
      <!-- 统计卡片 -->
      <a-row :gutter="16" style="margin-bottom: 20px;">
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="总队伍数"
              :value="statistics.totalTeams"
              :value-style="{ color: '#3f8600' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="在线队伍"
              :value="statistics.onlineTeams"
              :value-style="{ color: '#1890ff' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="被攻击次数"
              :value="statistics.attackedCount"
              :value-style="{ color: '#cf1322' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="成功防御"
              :value="statistics.defendedCount"
              :value-style="{ color: '#52c41a' }"
            />
          </a-card>
        </a-col>
      </a-row>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model="searchForm.team"
              placeholder="队伍名称"
              allow-clear
            />
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.status"
              placeholder="防御状态"
              allow-clear
            >
              <a-option value="online">在线</a-option>
              <a-option value="offline">离线</a-option>
              <a-option value="attacked">被攻击</a-option>
              <a-option value="defended">已防御</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.service"
              placeholder="服务状态"
              allow-clear
            >
              <a-option value="normal">正常</a-option>
              <a-option value="down">宕机</a-option>
              <a-option value="restarting">重启中</a-option>
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
        <a-button type="primary" @click="handleRefresh">
          <template #icon>
            <IconRefresh />
          </template>
          刷新状态
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchRestart">
          批量重启
        </a-button>
        <a-button style="margin-left: 8px" @click="handleExport">
          导出报告
        </a-button>
      </div>

      <!-- 防御状态列表 -->
      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        row-key="id"
      >
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template #serviceStatus="{ record }">
          <a-tag :color="getServiceStatusColor(record.serviceStatus)">
            {{ getServiceStatusText(record.serviceStatus) }}
          </a-tag>
        </template>

        <template #health="{ record }">
          <a-progress
            :percent="record.health"
            :color="getHealthColor(record.health)"
            size="small"
          />
        </template>

        <template #lastAttack="{ record }">
          <div>
            <div>{{ record.lastAttackTime || '无' }}</div>
            <div v-if="record.lastAttackType" style="font-size: 12px; color: #666;">
              {{ getAttackTypeText(record.lastAttackType) }}
            </div>
          </div>
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button size="small" @click="handleView(record)">
              查看详情
            </a-button>
            <a-button size="small" @click="handleRestart(record)">
              重启服务
            </a-button>
            <a-button size="small" @click="handleLogs(record)">
              查看日志
            </a-button>
            <a-button size="small" @click="handleConfig(record)">
              配置
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:visible="detailModalVisible"
      title="防御详情"
      width="800px"
      :footer="false"
    >
      <a-tabs>
        <a-tab-pane key="overview" title="概览">
          <a-descriptions :data="detailData" layout="vertical" bordered />
        </a-tab-pane>
        <a-tab-pane key="services" title="服务状态">
          <a-table
            :columns="serviceColumns"
            :data="selectedTeam.services"
            :pagination="false"
            size="small"
          />
        </a-tab-pane>
        <a-tab-pane key="attacks" title="攻击历史">
          <a-table
            :columns="attackColumns"
            :data="selectedTeam.attacks"
            :pagination="false"
            size="small"
          />
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- 日志弹窗 -->
    <a-modal
      v-model:visible="logModalVisible"
      title="服务日志"
      width="900px"
      :footer="false"
    >
      <a-tabs>
        <a-tab-pane key="system" title="系统日志">
          <div class="log-content">
            <pre>{{ selectedLogs.system }}</pre>
          </div>
        </a-tab-pane>
        <a-tab-pane key="application" title="应用日志">
          <div class="log-content">
            <pre>{{ selectedLogs.application }}</pre>
          </div>
        </a-tab-pane>
        <a-tab-pane key="security" title="安全日志">
          <div class="log-content">
            <pre>{{ selectedLogs.security }}</pre>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon'
import useLoading from '@/hooks/loading'

const { loading, setLoading } = useLoading()

// 统计数据
const statistics = reactive({
  totalTeams: 20,
  onlineTeams: 18,
  attackedCount: 45,
  defendedCount: 38
})

// 搜索表单
const searchForm = reactive({
  team: '',
  status: '',
  service: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    team: 'Team Alpha',
    status: 'online',
    serviceStatus: 'normal',
    health: 95,
    lastAttackTime: '2024-01-15 14:30:25',
    lastAttackType: 'sql-injection',
    attackCount: 3,
    defendCount: 2,
    services: [
      { name: 'Web服务', status: 'running', port: 8080 },
      { name: '数据库', status: 'running', port: 3306 },
      { name: 'SSH服务', status: 'running', port: 22 }
    ],
    attacks: [
      { time: '14:30:25', type: 'sql-injection', result: 'blocked' },
      { time: '14:25:10', type: 'xss', result: 'blocked' },
      { time: '14:20:45', type: 'file-upload', result: 'success' }
    ]
  },
  {
    id: 2,
    team: 'Team Beta',
    status: 'online',
    serviceStatus: 'normal',
    health: 88,
    lastAttackTime: '2024-01-15 14:25:10',
    lastAttackType: 'xss',
    attackCount: 2,
    defendCount: 1,
    services: [
      { name: 'Web服务', status: 'running', port: 8081 },
      { name: '数据库', status: 'running', port: 3307 },
      { name: 'SSH服务', status: 'running', port: 2222 }
    ],
    attacks: [
      { time: '14:25:10', type: 'xss', result: 'blocked' },
      { time: '14:20:45', type: 'buffer-overflow', result: 'success' }
    ]
  },
  {
    id: 3,
    team: 'Team Gamma',
    status: 'attacked',
    serviceStatus: 'down',
    health: 45,
    lastAttackTime: '2024-01-15 14:20:45',
    lastAttackType: 'buffer-overflow',
    attackCount: 1,
    defendCount: 0,
    services: [
      { name: 'Web服务', status: 'stopped', port: 8082 },
      { name: '数据库', status: 'running', port: 3308 },
      { name: 'SSH服务', status: 'running', port: 2223 }
    ],
    attacks: [
      { time: '14:20:45', type: 'buffer-overflow', result: 'success' }
    ]
  }
])

// 表格列配置
const columns = [
  {
    title: '队伍名称',
    dataIndex: 'team',
    key: 'team'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    slotName: 'status'
  },
  {
    title: '服务状态',
    dataIndex: 'serviceStatus',
    key: 'serviceStatus',
    slotName: 'serviceStatus'
  },
  {
    title: '健康度',
    dataIndex: 'health',
    key: 'health',
    slotName: 'health'
  },
  {
    title: '最近攻击',
    dataIndex: 'lastAttack',
    key: 'lastAttack',
    slotName: 'lastAttack'
  },
  {
    title: '攻击次数',
    dataIndex: 'attackCount',
    key: 'attackCount'
  },
  {
    title: '防御次数',
    dataIndex: 'defendCount',
    key: 'defendCount'
  },
  {
    title: '操作',
    key: 'actions',
    slotName: 'actions',
    width: 280
  }
]

// 服务状态列
const serviceColumns = [
  { title: '服务名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '端口', dataIndex: 'port', key: 'port' }
]

// 攻击历史列
const attackColumns = [
  { title: '时间', dataIndex: 'time', key: 'time' },
  { title: '攻击类型', dataIndex: 'type', key: 'type' },
  { title: '结果', dataIndex: 'result', key: 'result' }
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

// 弹窗相关
const detailModalVisible = ref(false)
const logModalVisible = ref(false)
const selectedTeam = ref({})
const selectedLogs = reactive({
  system: '',
  application: '',
  security: ''
})
const detailData = ref([])

// 状态颜色映射
const getStatusColor = (status) => {
  const colors = {
    online: 'green',
    offline: 'gray',
    attacked: 'red',
    defended: 'blue'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    online: '在线',
    offline: '离线',
    attacked: '被攻击',
    defended: '已防御'
  }
  return texts[status] || '未知'
}

const getServiceStatusColor = (status) => {
  const colors = {
    normal: 'green',
    down: 'red',
    restarting: 'orange'
  }
  return colors[status] || 'gray'
}

const getServiceStatusText = (status) => {
  const texts = {
    normal: '正常',
    down: '宕机',
    restarting: '重启中'
  }
  return texts[status] || '未知'
}

const getHealthColor = (health) => {
  if (health >= 80) return '#52c41a'
  if (health >= 60) return '#faad14'
  return '#f5222d'
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
  selectedTeam.value = record
  detailData.value = [
    { label: '队伍名称', value: record.team },
    { label: '状态', value: getStatusText(record.status) },
    { label: '服务状态', value: getServiceStatusText(record.serviceStatus) },
    { label: '健康度', value: `${record.health}%` },
    { label: '攻击次数', value: record.attackCount },
    { label: '防御次数', value: record.defendCount },
    { label: '最近攻击', value: record.lastAttackTime || '无' },
    { label: '攻击类型', value: record.lastAttackType ? getAttackTypeText(record.lastAttackType) : '无' }
  ]
  detailModalVisible.value = true
}

// 重启服务
const handleRestart = async (record) => {
  try {
    setLoading(true)
    // 这里应该调用API
    await new Promise(resolve => setTimeout(resolve, 1000))
    record.serviceStatus = 'restarting'
    Message.success('重启服务成功')
  } catch (error) {
    Message.error('重启服务失败')
  } finally {
    setLoading(false)
  }
}

// 查看日志
const handleLogs = (record) => {
  selectedLogs.system = `系统日志 - ${record.team}\n[INFO] 系统启动正常\n[INFO] 内存使用率: 65%\n[INFO] CPU使用率: 45%`
  selectedLogs.application = `应用日志 - ${record.team}\n[INFO] Web服务运行正常\n[INFO] 数据库连接正常\n[WARN] 检测到异常访问`
  selectedLogs.security = `安全日志 - ${record.team}\n[WARN] 检测到SQL注入攻击\n[INFO] 攻击已被WAF拦截\n[INFO] 记录攻击IP: 192.168.1.100`
  logModalVisible.value = true
}

// 配置
const handleConfig = (record) => {
  Message.info(`配置队伍: ${record.team}`)
}

// 刷新状态
const handleRefresh = () => {
  Message.info('刷新防御状态数据')
}

// 批量重启
const handleBatchRestart = () => {
  Message.info('批量重启服务')
}

// 导出报告
const handleExport = () => {
  Message.info('导出防御状态报告')
}

onMounted(() => {
  // 初始化数据
  pagination.total = tableData.value.length
})
</script>

<style scoped>
.awd-defenses {
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