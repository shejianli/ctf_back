<template>
  <div class="vuln-monitoring">
    <a-card title="漏洞靶场监控" :bordered="false">
      <!-- 实时状态概览 -->
      <div class="status-overview">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card class="status-card">
              <div class="status-content">
                <div class="status-icon running">
                  <IconPlayCircle />
                </div>
                <div class="status-info">
                  <div class="status-number">{{ status.running }}</div>
                  <div class="status-label">运行中</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="status-card">
              <div class="status-content">
                <div class="status-icon stopped">
                  <IconPauseCircle />
                </div>
                <div class="status-info">
                  <div class="status-number">{{ status.stopped }}</div>
                  <div class="status-label">已停止</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="status-card">
              <div class="status-content">
                <div class="status-icon error">
                  <IconExclamationCircle />
                </div>
                <div class="status-info">
                  <div class="status-number">{{ status.error }}</div>
                  <div class="status-label">错误</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="status-card">
              <div class="status-content">
                <div class="status-icon warning">
                  <IconWarning />
                </div>
                <div class="status-info">
                  <div class="status-number">{{ status.warning }}</div>
                  <div class="status-label">警告</div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 监控选项卡 -->
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="realtime" title="实时监控">
          <div class="monitoring-content">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-card title="系统资源监控" size="small">
                  <div class="resource-monitoring">
                    <div class="resource-item">
                      <div class="resource-label">CPU使用率</div>
                      <a-progress 
                        :percent="systemResources.cpu" 
                        :color="getResourceColor(systemResources.cpu)"
                        :show-text="false"
                      />
                      <div class="resource-value">{{ systemResources.cpu }}%</div>
                    </div>
                    <div class="resource-item">
                      <div class="resource-label">内存使用率</div>
                      <a-progress 
                        :percent="systemResources.memory" 
                        :color="getResourceColor(systemResources.memory)"
                        :show-text="false"
                      />
                      <div class="resource-value">{{ systemResources.memory }}%</div>
                    </div>
                    <div class="resource-item">
                      <div class="resource-label">磁盘使用率</div>
                      <a-progress 
                        :percent="systemResources.disk" 
                        :color="getResourceColor(systemResources.disk)"
                        :show-text="false"
                      />
                      <div class="resource-value">{{ systemResources.disk }}%</div>
                    </div>
                    <div class="resource-item">
                      <div class="resource-label">网络流量</div>
                      <div class="network-stats">
                        <div class="network-item">
                          <span class="network-label">入站:</span>
                          <span class="network-value">{{ systemResources.network.in }} MB/s</span>
                        </div>
                        <div class="network-item">
                          <span class="network-label">出站:</span>
                          <span class="network-value">{{ systemResources.network.out }} MB/s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="活跃连接" size="small">
                  <div class="active-connections">
                    <div class="connection-item" v-for="conn in activeConnections" :key="conn.id">
                      <div class="connection-info">
                        <div class="connection-target">{{ conn.target }}</div>
                        <div class="connection-details">
                          <span>{{ conn.ip }}:{{ conn.port }}</span>
                          <span class="connection-time">{{ conn.duration }}</span>
                        </div>
                      </div>
                      <div class="connection-status">
                        <a-tag :color="getConnectionColor(conn.status)">
                          {{ getConnectionText(conn.status) }}
                        </a-tag>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="24">
                <a-card title="实时日志" size="small">
                  <div class="log-container">
                    <div class="log-header">
                      <a-space>
                        <a-button size="small" @click="handleClearLogs">
                          清空日志
                        </a-button>
                        <a-button size="small" @click="handleExportLogs">
                          导出日志
                        </a-button>
                        <a-switch v-model="autoScroll" size="small">
                          <template #checked>自动滚动</template>
                          <template #unchecked>手动滚动</template>
                        </a-switch>
                      </a-space>
                    </div>
                    <div class="log-content" ref="logContent">
                      <div 
                        v-for="log in realtimeLogs" 
                        :key="log.id" 
                        class="log-entry"
                        :class="getLogLevelClass(log.level)"
                      >
                        <span class="log-time">{{ log.time }}</span>
                        <span class="log-level">{{ log.level }}</span>
                        <span class="log-message">{{ log.message }}</span>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>

        <a-tab-pane key="alerts" title="告警管理">
          <div class="monitoring-content">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-card title="告警配置" size="small">
                  <a-form layout="vertical">
                    <a-row :gutter="16">
                      <a-col :span="8">
                        <a-form-item label="CPU告警阈值">
                          <a-input-number 
                            v-model="alertConfig.cpuThreshold" 
                            :min="50" 
                            :max="100"
                            placeholder="CPU阈值"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item label="内存告警阈值">
                          <a-input-number 
                            v-model="alertConfig.memoryThreshold" 
                            :min="50" 
                            :max="100"
                            placeholder="内存阈值"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item label="磁盘告警阈值">
                          <a-input-number 
                            v-model="alertConfig.diskThreshold" 
                            :min="50" 
                            :max="100"
                            placeholder="磁盘阈值"
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>
                    
                    <a-form-item label="告警通知">
                      <a-checkbox-group v-model="alertConfig.notifications">
                        <a-checkbox value="email">邮件通知</a-checkbox>
                        <a-checkbox value="sms">短信通知</a-checkbox>
                        <a-checkbox value="webhook">Webhook通知</a-checkbox>
                        <a-checkbox value="slack">Slack通知</a-checkbox>
                      </a-checkbox-group>
                    </a-form-item>

                    <a-form-item>
                      <a-space>
                        <a-button type="primary" @click="handleSaveAlertConfig">
                          保存配置
                        </a-button>
                        <a-button @click="handleTestAlert">
                          测试告警
                        </a-button>
                      </a-space>
                    </a-form-item>
                  </a-form>
                </a-card>
              </a-col>
            </a-row>

            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="24">
                <a-card title="告警历史" size="small">
                  <a-table
                    :columns="alertHistoryColumns"
                    :data="alertHistory"
                    :pagination="false"
                    size="small"
                  >
                    <template #level="{ record }">
                      <a-tag :color="getAlertLevelColor(record.level)">
                        {{ getAlertLevelText(record.level) }}
                      </a-tag>
                    </template>
                    <template #status="{ record }">
                      <a-tag :color="getAlertStatusColor(record.status)">
                        {{ getAlertStatusText(record.status) }}
                      </a-tag>
                    </template>
                    <template #actions="{ record }">
                      <a-space>
                        <a-button size="small" @click="handleViewAlert(record)">
                          查看
                        </a-button>
                        <a-button size="small" @click="handleAcknowledgeAlert(record)">
                          确认
                        </a-button>
                        <a-button size="small" status="danger" @click="handleDeleteAlert(record)">
                          删除
                        </a-button>
                      </a-space>
                    </template>
                  </a-table>
                </a-card>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>

        <a-tab-pane key="performance" title="性能分析">
          <div class="monitoring-content">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-card title="响应时间统计" size="small">
                  <div class="performance-stats">
                    <div class="performance-item">
                      <div class="performance-label">平均响应时间</div>
                      <div class="performance-value">{{ performanceStats.avgResponse }}ms</div>
                    </div>
                    <div class="performance-item">
                      <div class="performance-label">最大响应时间</div>
                      <div class="performance-value">{{ performanceStats.maxResponse }}ms</div>
                    </div>
                    <div class="performance-item">
                      <div class="performance-label">最小响应时间</div>
                      <div class="performance-value">{{ performanceStats.minResponse }}ms</div>
                    </div>
                    <div class="performance-item">
                      <div class="performance-label">请求成功率</div>
                      <div class="performance-value">{{ performanceStats.successRate }}%</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="吞吐量统计" size="small">
                  <div class="throughput-stats">
                    <div class="throughput-item">
                      <div class="throughput-label">每秒请求数</div>
                      <div class="throughput-value">{{ throughputStats.rps }}/s</div>
                    </div>
                    <div class="throughput-item">
                      <div class="throughput-label">并发连接数</div>
                      <div class="throughput-value">{{ throughputStats.connections }}</div>
                    </div>
                    <div class="throughput-item">
                      <div class="throughput-label">数据传输量</div>
                      <div class="throughput-value">{{ throughputStats.dataTransfer }} MB</div>
                    </div>
                    <div class="throughput-item">
                      <div class="throughput-label">错误率</div>
                      <div class="throughput-value">{{ throughputStats.errorRate }}%</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="24">
                <a-card title="性能趋势图" size="small">
                  <div class="performance-chart">
                    <div class="chart-container">
                      <div class="chart-item" v-for="point in performanceTrend" :key="point.time">
                        <div class="chart-time">{{ point.time }}</div>
                        <div class="chart-bar">
                          <div 
                            class="chart-fill" 
                            :style="{ height: point.response / 1000 + 'px', backgroundColor: getPerformanceColor(point.response) }"
                          ></div>
                        </div>
                        <div class="chart-value">{{ point.response }}ms</div>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>

        <a-tab-pane key="security" title="安全监控">
          <div class="monitoring-content">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-card title="攻击检测" size="small">
                  <div class="attack-detection">
                    <div class="detection-item" v-for="attack in detectedAttacks" :key="attack.id">
                      <div class="detection-info">
                        <div class="detection-type">{{ attack.type }}</div>
                        <div class="detection-details">
                          <span>{{ attack.source }}</span>
                          <span class="detection-time">{{ attack.time }}</span>
                        </div>
                      </div>
                      <div class="detection-status">
                        <a-tag :color="getAttackSeverityColor(attack.severity)">
                          {{ getAttackSeverityText(attack.severity) }}
                        </a-tag>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="安全事件" size="small">
                  <div class="security-events">
                    <div class="event-item" v-for="event in securityEvents" :key="event.id">
                      <div class="event-info">
                        <div class="event-type">{{ event.type }}</div>
                        <div class="event-description">{{ event.description }}</div>
                        <div class="event-time">{{ event.time }}</div>
                      </div>
                      <div class="event-action">
                        <a-button size="small" @click="handleInvestigateEvent(event)">
                          调查
                        </a-button>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="24">
                <a-card title="安全统计" size="small">
                  <a-row :gutter="16">
                    <a-col :span="6">
                      <a-statistic title="今日攻击次数" :value="securityStats.todayAttacks" />
                    </a-col>
                    <a-col :span="6">
                      <a-statistic title="阻止攻击次数" :value="securityStats.blockedAttacks" />
                    </a-col>
                    <a-col :span="6">
                      <a-statistic title="可疑IP数量" :value="securityStats.suspiciousIPs" />
                    </a-col>
                    <a-col :span="6">
                      <a-statistic title="安全评分" :value="securityStats.securityScore" suffix="/100" />
                    </a-col>
                  </a-row>
                </a-card>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlayCircle, IconPauseCircle, IconExclamationCircle, IconWarning } from '@arco-design/web-vue/es/icon'

const activeTab = ref('realtime')
const autoScroll = ref(true)
const logContent = ref(null)

// 状态统计
const status = reactive({
  running: 8,
  stopped: 3,
  error: 1,
  warning: 2
})

// 系统资源
const systemResources = reactive({
  cpu: 45,
  memory: 68,
  disk: 72,
  network: {
    in: 2.5,
    out: 1.8
  }
})

// 活跃连接
const activeConnections = ref([
  {
    id: 1,
    target: 'DVWA',
    ip: '192.168.1.100',
    port: 8080,
    status: 'active',
    duration: '2小时15分'
  },
  {
    id: 2,
    target: 'Vulhub',
    ip: '192.168.1.101',
    port: 8081,
    status: 'active',
    duration: '1小时30分'
  },
  {
    id: 3,
    target: 'Pwnable.kr',
    ip: '192.168.1.102',
    port: 2222,
    status: 'warning',
    duration: '45分钟'
  }
])

// 实时日志
const realtimeLogs = ref([
  {
    id: 1,
    time: '14:30:25',
    level: 'INFO',
    message: '用户登录成功: admin@192.168.1.100'
  },
  {
    id: 2,
    time: '14:30:20',
    level: 'WARN',
    message: '检测到SQL注入尝试: 192.168.1.101'
  },
  {
    id: 3,
    time: '14:30:15',
    level: 'ERROR',
    message: '靶机DVWA连接超时'
  },
  {
    id: 4,
    time: '14:30:10',
    level: 'INFO',
    message: '新用户注册: test@192.168.1.103'
  }
])

// 告警配置
const alertConfig = reactive({
  cpuThreshold: 80,
  memoryThreshold: 85,
  diskThreshold: 90,
  notifications: ['email', 'webhook']
})

// 告警历史
const alertHistory = ref([
  {
    id: 1,
    level: 'high',
    message: 'CPU使用率超过阈值',
    target: 'DVWA',
    time: '2024-01-15 14:25:00',
    status: 'active'
  },
  {
    id: 2,
    level: 'medium',
    message: '内存使用率过高',
    target: 'Vulhub',
    time: '2024-01-15 14:20:00',
    status: 'acknowledged'
  },
  {
    id: 3,
    level: 'low',
    message: '磁盘空间不足',
    target: 'Pwnable.kr',
    time: '2024-01-15 14:15:00',
    status: 'resolved'
  }
])

const alertHistoryColumns = [
  { title: '告警级别', dataIndex: 'level', key: 'level', slotName: 'level' },
  { title: '告警信息', dataIndex: 'message', key: 'message' },
  { title: '目标靶机', dataIndex: 'target', key: 'target' },
  { title: '告警时间', dataIndex: 'time', key: 'time' },
  { title: '状态', dataIndex: 'status', key: 'status', slotName: 'status' },
  { title: '操作', key: 'actions', slotName: 'actions', width: 200 }
]

// 性能统计
const performanceStats = reactive({
  avgResponse: 245,
  maxResponse: 1200,
  minResponse: 85,
  successRate: 98.5
})

const throughputStats = reactive({
  rps: 156,
  connections: 45,
  dataTransfer: 2.8,
  errorRate: 1.5
})

// 性能趋势
const performanceTrend = ref([
  { time: '14:25', response: 200 },
  { time: '14:26', response: 180 },
  { time: '14:27', response: 220 },
  { time: '14:28', response: 300 },
  { time: '14:29', response: 250 },
  { time: '14:30', response: 280 }
])

// 检测到的攻击
const detectedAttacks = ref([
  {
    id: 1,
    type: 'SQL注入',
    source: '192.168.1.100',
    time: '14:30:25',
    severity: 'high'
  },
  {
    id: 2,
    type: 'XSS攻击',
    source: '192.168.1.101',
    time: '14:28:15',
    severity: 'medium'
  },
  {
    id: 3,
    type: '暴力破解',
    source: '192.168.1.102',
    time: '14:25:45',
    severity: 'high'
  }
])

// 安全事件
const securityEvents = ref([
  {
    id: 1,
    type: '异常登录',
    description: '检测到来自异常IP的登录尝试',
    time: '14:30:25'
  },
  {
    id: 2,
    type: '文件上传',
    description: '检测到可疑文件上传',
    time: '14:28:15'
  },
  {
    id: 3,
    type: '权限提升',
    description: '检测到权限提升尝试',
    time: '14:25:45'
  }
])

// 安全统计
const securityStats = reactive({
  todayAttacks: 23,
  blockedAttacks: 20,
  suspiciousIPs: 5,
  securityScore: 85
})

// 颜色映射函数
const getResourceColor = (percent) => {
  if (percent < 60) return '#52c41a'
  if (percent < 80) return '#faad14'
  return '#f5222d'
}

const getConnectionColor = (status) => {
  const colors = {
    active: 'green',
    warning: 'orange',
    error: 'red'
  }
  return colors[status] || 'gray'
}

const getConnectionText = (status) => {
  const texts = {
    active: '活跃',
    warning: '警告',
    error: '错误'
  }
  return texts[status] || '未知'
}

const getLogLevelClass = (level) => {
  const classes = {
    INFO: 'log-info',
    WARN: 'log-warn',
    ERROR: 'log-error',
    DEBUG: 'log-debug'
  }
  return classes[level] || 'log-info'
}

const getAlertLevelColor = (level) => {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'red'
  }
  return colors[level] || 'gray'
}

const getAlertLevelText = (level) => {
  const texts = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return texts[level] || '未知'
}

const getAlertStatusColor = (status) => {
  const colors = {
    active: 'red',
    acknowledged: 'orange',
    resolved: 'green'
  }
  return colors[status] || 'gray'
}

const getAlertStatusText = (status) => {
  const texts = {
    active: '活跃',
    acknowledged: '已确认',
    resolved: '已解决'
  }
  return texts[status] || '未知'
}

const getPerformanceColor = (response) => {
  if (response < 200) return '#52c41a'
  if (response < 500) return '#faad14'
  return '#f5222d'
}

const getAttackSeverityColor = (severity) => {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red'
  }
  return colors[severity] || 'gray'
}

const getAttackSeverityText = (severity) => {
  const texts = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return texts[severity] || '未知'
}

// 事件处理函数
const handleClearLogs = () => {
  realtimeLogs.value = []
  Message.success('日志已清空')
}

const handleExportLogs = () => {
  Message.info('导出日志功能')
}

const handleSaveAlertConfig = async () => {
  try {
    Message.loading('保存配置中...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('配置保存成功')
  } catch (error) {
    Message.error('配置保存失败')
  }
}

const handleTestAlert = () => {
  Message.info('测试告警功能')
}

const handleViewAlert = (record) => {
  Message.info(`查看告警: ${record.message}`)
}

const handleAcknowledgeAlert = (record) => {
  record.status = 'acknowledged'
  Message.success('告警已确认')
}

const handleDeleteAlert = (record) => {
  const index = alertHistory.value.findIndex(item => item.id === record.id)
  if (index > -1) {
    alertHistory.value.splice(index, 1)
  }
  Message.success('告警已删除')
}

const handleInvestigateEvent = (event) => {
  Message.info(`调查事件: ${event.type}`)
}

// 模拟实时数据更新
let updateTimer = null

const updateSystemResources = () => {
  systemResources.cpu = Math.floor(Math.random() * 30) + 40
  systemResources.memory = Math.floor(Math.random() * 20) + 60
  systemResources.disk = Math.floor(Math.random() * 10) + 70
  systemResources.network.in = (Math.random() * 2 + 1).toFixed(1)
  systemResources.network.out = (Math.random() * 1.5 + 0.5).toFixed(1)
}

const addNewLog = () => {
  const levels = ['INFO', 'WARN', 'ERROR']
  const messages = [
    '用户访问靶机',
    '检测到攻击尝试',
    '系统资源告警',
    '新用户注册',
    '靶机状态变化'
  ]
  
  const newLog = {
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)]
  }
  
  realtimeLogs.value.unshift(newLog)
  
  // 保持日志数量在合理范围内
  if (realtimeLogs.value.length > 100) {
    realtimeLogs.value = realtimeLogs.value.slice(0, 100)
  }
}

onMounted(() => {
  // 启动实时数据更新
  updateTimer = setInterval(() => {
    updateSystemResources()
    addNewLog()
  }, 5000)
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style scoped>
.vuln-monitoring {
  padding: 20px;
}

.status-overview {
  margin-bottom: 20px;
}

.status-card {
  text-align: center;
}

.status-content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.status-icon {
  font-size: 24px;
  margin-right: 12px;
}

.status-icon.running {
  color: #52c41a;
}

.status-icon.stopped {
  color: #faad14;
}

.status-icon.error {
  color: #f5222d;
}

.status-icon.warning {
  color: #faad14;
}

.status-info {
  flex: 1;
}

.status-number {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.status-label {
  margin-top: 4px;
  color: #666;
  font-size: 12px;
}

.monitoring-content {
  padding: 16px 0;
}

.resource-monitoring {
  padding: 16px;
}

.resource-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.resource-label {
  width: 100px;
  font-size: 12px;
}

.resource-value {
  width: 60px;
  text-align: right;
  font-size: 12px;
  color: #666;
}

.network-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.network-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.network-label {
  color: #666;
}

.network-value {
  font-weight: bold;
}

.active-connections {
  padding: 16px;
}

.connection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.connection-item:last-child {
  border-bottom: none;
}

.connection-info {
  flex: 1;
}

.connection-target {
  font-weight: bold;
  margin-bottom: 4px;
}

.connection-details {
  font-size: 12px;
  color: #666;
}

.connection-time {
  margin-left: 8px;
}

.log-container {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.log-header {
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.log-content {
  height: 300px;
  overflow-y: auto;
  padding: 8px 12px;
  background: #000;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.log-entry {
  margin-bottom: 4px;
  padding: 2px 0;
}

.log-time {
  color: #888;
  margin-right: 8px;
}

.log-level {
  margin-right: 8px;
  font-weight: bold;
}

.log-info .log-level {
  color: #52c41a;
}

.log-warn .log-level {
  color: #faad14;
}

.log-error .log-level {
  color: #f5222d;
}

.log-debug .log-level {
  color: #1890ff;
}

.performance-stats,
.throughput-stats {
  padding: 16px;
}

.performance-item,
.throughput-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.performance-label,
.throughput-label {
  font-size: 12px;
  color: #666;
}

.performance-value,
.throughput-value {
  font-weight: bold;
  color: #1890ff;
}

.performance-chart {
  padding: 16px;
}

.chart-container {
  display: flex;
  align-items: end;
  height: 200px;
  gap: 8px;
}

.chart-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-time {
  font-size: 10px;
  color: #666;
  margin-bottom: 4px;
}

.chart-bar {
  width: 20px;
  height: 150px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.chart-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  min-height: 2px;
  transition: height 0.3s ease;
}

.chart-value {
  font-size: 10px;
  color: #666;
  margin-top: 4px;
}

.attack-detection,
.security-events {
  padding: 16px;
}

.detection-item,
.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detection-item:last-child,
.event-item:last-child {
  border-bottom: none;
}

.detection-info,
.event-info {
  flex: 1;
}

.detection-type,
.event-type {
  font-weight: bold;
  margin-bottom: 4px;
}

.detection-details,
.event-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.detection-time,
.event-time {
  font-size: 10px;
  color: #999;
}
</style> 