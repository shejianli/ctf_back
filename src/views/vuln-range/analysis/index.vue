<template>
  <div class="vuln-analysis">
    <a-card title="漏洞分析报告" :bordered="false">
      <!-- 统计概览 -->
      <div class="stats-overview">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalTargets }}</div>
                <div class="stat-label">总靶机数</div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalVulnerabilities }}</div>
                <div class="stat-label">漏洞总数</div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.activeScenarios }}</div>
                <div class="stat-label">活跃场景</div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalAttacks }}</div>
                <div class="stat-label">攻击次数</div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 分析选项卡 -->
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="overview" title="概览分析">
          <div class="analysis-content">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-card title="漏洞类型分布" size="small">
                  <div class="chart-container">
                    <div class="chart-item" v-for="item in vulnerabilityDistribution" :key="item.type">
                      <div class="chart-label">{{ item.label }}</div>
                      <a-progress 
                        :percent="item.percentage" 
                        :color="item.color"
                        :show-text="false"
                      />
                      <div class="chart-value">{{ item.count }}个</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="难度分布" size="small">
                  <div class="chart-container">
                    <div class="chart-item" v-for="item in difficultyDistribution" :key="item.level">
                      <div class="chart-label">{{ item.label }}</div>
                      <a-progress 
                        :percent="item.percentage" 
                        :color="item.color"
                        :show-text="false"
                      />
                      <div class="chart-value">{{ item.count }}个</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="24">
                <a-card title="热门靶机排行" size="small">
                  <a-table
                    :columns="popularTargetsColumns"
                    :data="popularTargets"
                    :pagination="false"
                    size="small"
                  >
                    <template #rank="{ record }">
                      <a-tag :color="getRankColor(record.rank)">
                        {{ record.rank }}
                      </a-tag>
                    </template>
                    <template #difficulty="{ record }">
                      <a-tag :color="getDifficultyColor(record.difficulty)">
                        {{ getDifficultyText(record.difficulty) }}
                      </a-tag>
                    </template>
                  </a-table>
                </a-card>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>

        <a-tab-pane key="vulnerabilities" title="漏洞分析">
          <div class="analysis-content">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-card title="漏洞详细分析" size="small">
                  <a-table
                    :columns="vulnerabilityAnalysisColumns"
                    :data="vulnerabilityAnalysis"
                    :pagination="false"
                    size="small"
                  >
                    <template #severity="{ record }">
                      <a-tag :color="getSeverityColor(record.severity)">
                        {{ getSeverityText(record.severity) }}
                      </a-tag>
                    </template>
                    <template #exploitability="{ record }">
                      <a-tag :color="getExploitabilityColor(record.exploitability)">
                        {{ getExploitabilityText(record.exploitability) }}
                      </a-tag>
                    </template>
                    <template #actions="{ record }">
                      <a-space>
                        <a-button size="small" @click="handleViewDetails(record)">
                          详情
                        </a-button>
                        <a-button size="small" @click="handleViewPoc(record)">
                          POC
                        </a-button>
                        <a-button size="small" @click="handleViewExploit(record)">
                          利用
                        </a-button>
                      </a-space>
                    </template>
                  </a-table>
                </a-card>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>

        <a-tab-pane key="attacks" title="攻击分析">
          <div class="analysis-content">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-card title="攻击趋势" size="small">
                  <div class="trend-chart">
                    <div class="trend-item" v-for="item in attackTrends" :key="item.date">
                      <div class="trend-date">{{ item.date }}</div>
                      <div class="trend-bar">
                        <div 
                          class="trend-fill" 
                          :style="{ width: item.percentage + '%', backgroundColor: item.color }"
                        ></div>
                      </div>
                      <div class="trend-value">{{ item.count }}</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card title="攻击类型分布" size="small">
                  <div class="attack-types">
                    <div class="attack-type-item" v-for="item in attackTypes" :key="item.type">
                      <div class="attack-type-label">{{ item.label }}</div>
                      <div class="attack-type-bar">
                        <div 
                          class="attack-type-fill" 
                          :style="{ width: item.percentage + '%', backgroundColor: item.color }"
                        ></div>
                      </div>
                      <div class="attack-type-value">{{ item.count }}</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="24">
                <a-card title="攻击记录" size="small">
                  <a-table
                    :columns="attackRecordsColumns"
                    :data="attackRecords"
                    :pagination="false"
                    size="small"
                  >
                    <template #type="{ record }">
                      <a-tag :color="getAttackTypeColor(record.type)">
                        {{ getAttackTypeText(record.type) }}
                      </a-tag>
                    </template>
                    <template #status="{ record }">
                      <a-tag :color="getAttackStatusColor(record.status)">
                        {{ getAttackStatusText(record.status) }}
                      </a-tag>
                    </template>
                  </a-table>
                </a-card>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>

        <a-tab-pane key="reports" title="报告生成">
          <div class="analysis-content">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-card title="生成分析报告" size="small">
                  <a-form layout="vertical">
                    <a-row :gutter="16">
                      <a-col :span="8">
                        <a-form-item label="报告类型">
                          <a-select v-model="reportForm.type" placeholder="请选择报告类型">
                            <a-option value="comprehensive">综合分析报告</a-option>
                            <a-option value="vulnerability">漏洞专项报告</a-option>
                            <a-option value="attack">攻击分析报告</a-option>
                            <a-option value="trend">趋势分析报告</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item label="时间范围">
                          <a-range-picker v-model="reportForm.dateRange" />
                        </a-form-item>
                      </a-col>
                      <a-col :span="8">
                        <a-form-item label="目标范围">
                          <a-select v-model="reportForm.targets" mode="multiple" placeholder="请选择目标">
                            <a-option value="all">全部靶机</a-option>
                            <a-option value="web">Web靶机</a-option>
                            <a-option value="pwn">Pwn靶机</a-option>
                            <a-option value="crypto">密码学靶机</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                    </a-row>
                    
                    <a-form-item label="报告内容">
                      <a-checkbox-group v-model="reportForm.content">
                        <a-checkbox value="overview">概览统计</a-checkbox>
                        <a-checkbox value="vulnerabilities">漏洞分析</a-checkbox>
                        <a-checkbox value="attacks">攻击分析</a-checkbox>
                        <a-checkbox value="trends">趋势分析</a-checkbox>
                        <a-checkbox value="recommendations">建议措施</a-checkbox>
                      </a-checkbox-group>
                    </a-form-item>

                    <a-form-item>
                      <a-space>
                        <a-button type="primary" @click="handleGenerateReport">
                          生成报告
                        </a-button>
                        <a-button @click="handlePreviewReport">
                          预览报告
                        </a-button>
                        <a-button @click="handleExportReport">
                          导出报告
                        </a-button>
                      </a-space>
                    </a-form-item>
                  </a-form>
                </a-card>
              </a-col>
            </a-row>

            <a-row :gutter="16" style="margin-top: 16px;">
              <a-col :span="24">
                <a-card title="历史报告" size="small">
                  <a-table
                    :columns="reportHistoryColumns"
                    :data="reportHistory"
                    :pagination="false"
                    size="small"
                  >
                    <template #type="{ record }">
                      <a-tag :color="getReportTypeColor(record.type)">
                        {{ getReportTypeText(record.type) }}
                      </a-tag>
                    </template>
                    <template #actions="{ record }">
                      <a-space>
                        <a-button size="small" @click="handleViewReport(record)">
                          查看
                        </a-button>
                        <a-button size="small" @click="handleDownloadReport(record)">
                          下载
                        </a-button>
                        <a-button size="small" status="danger" @click="handleDeleteReport(record)">
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
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

const activeTab = ref('overview')

// 统计数据
const stats = reactive({
  totalTargets: 15,
  totalVulnerabilities: 42,
  activeScenarios: 8,
  totalAttacks: 1256
})

// 漏洞类型分布
const vulnerabilityDistribution = ref([
  { type: 'web', label: 'Web漏洞', count: 18, percentage: 43, color: '#1890ff' },
  { type: 'pwn', label: 'Pwn漏洞', count: 12, percentage: 29, color: '#f5222d' },
  { type: 'crypto', label: '密码学', count: 8, percentage: 19, color: '#faad14' },
  { type: 'reverse', label: '逆向工程', count: 4, percentage: 9, color: '#52c41a' }
])

// 难度分布
const difficultyDistribution = ref([
  { level: 'easy', label: '简单', count: 15, percentage: 36, color: '#52c41a' },
  { level: 'medium', label: '中等', count: 18, percentage: 43, color: '#faad14' },
  { level: 'hard', label: '困难', count: 9, percentage: 21, color: '#f5222d' }
])

// 热门靶机排行
const popularTargets = ref([
  { rank: 1, name: 'DVWA', difficulty: 'easy', visits: 456, attacks: 89 },
  { rank: 2, name: 'Vulhub', difficulty: 'medium', visits: 342, attacks: 67 },
  { rank: 3, name: 'Pwnable.kr', difficulty: 'hard', visits: 234, attacks: 45 },
  { rank: 4, name: 'Metasploitable', difficulty: 'medium', visits: 198, attacks: 38 },
  { rank: 5, name: 'WebGoat', difficulty: 'easy', visits: 167, attacks: 32 }
])

const popularTargetsColumns = [
  { title: '排名', dataIndex: 'rank', key: 'rank', slotName: 'rank', width: 80 },
  { title: '靶机名称', dataIndex: 'name', key: 'name' },
  { title: '难度', dataIndex: 'difficulty', key: 'difficulty', slotName: 'difficulty' },
  { title: '访问次数', dataIndex: 'visits', key: 'visits' },
  { title: '攻击次数', dataIndex: 'attacks', key: 'attacks' }
]

// 漏洞分析
const vulnerabilityAnalysis = ref([
  {
    id: 1,
    name: 'SQL注入',
    severity: 'high',
    exploitability: 'easy',
    targets: 8,
    attacks: 156,
    successRate: 78
  },
  {
    id: 2,
    name: 'XSS跨站脚本',
    severity: 'medium',
    exploitability: 'easy',
    targets: 6,
    attacks: 134,
    successRate: 65
  },
  {
    id: 3,
    name: '缓冲区溢出',
    severity: 'high',
    exploitability: 'hard',
    targets: 4,
    attacks: 89,
    successRate: 45
  },
  {
    id: 4,
    name: '命令注入',
    severity: 'high',
    exploitability: 'medium',
    targets: 5,
    attacks: 112,
    successRate: 67
  }
])

const vulnerabilityAnalysisColumns = [
  { title: '漏洞名称', dataIndex: 'name', key: 'name' },
  { title: '严重程度', dataIndex: 'severity', key: 'severity', slotName: 'severity' },
  { title: '利用难度', dataIndex: 'exploitability', key: 'exploitability', slotName: 'exploitability' },
  { title: '影响靶机', dataIndex: 'targets', key: 'targets' },
  { title: '攻击次数', dataIndex: 'attacks', key: 'attacks' },
  { title: '成功率', dataIndex: 'successRate', key: 'successRate', render: ({ record }) => `${record.successRate}%` },
  { title: '操作', key: 'actions', slotName: 'actions', width: 200 }
]

// 攻击趋势
const attackTrends = ref([
  { date: '01-10', count: 45, percentage: 60, color: '#1890ff' },
  { date: '01-11', count: 52, percentage: 70, color: '#1890ff' },
  { date: '01-12', count: 38, percentage: 50, color: '#1890ff' },
  { date: '01-13', count: 67, percentage: 90, color: '#f5222d' },
  { date: '01-14', count: 58, percentage: 80, color: '#faad14' },
  { date: '01-15', count: 73, percentage: 100, color: '#f5222d' }
])

// 攻击类型分布
const attackTypes = ref([
  { type: 'sql', label: 'SQL注入', count: 156, percentage: 35, color: '#f5222d' },
  { type: 'xss', label: 'XSS攻击', count: 134, percentage: 30, color: '#faad14' },
  { type: 'overflow', label: '缓冲区溢出', count: 89, percentage: 20, color: '#1890ff' },
  { type: 'injection', label: '命令注入', count: 67, percentage: 15, color: '#52c41a' }
])

// 攻击记录
const attackRecords = ref([
  {
    id: 1,
    target: 'DVWA',
    type: 'sql',
    status: 'success',
    time: '2024-01-15 14:30:25',
    attacker: '192.168.1.100'
  },
  {
    id: 2,
    target: 'Vulhub',
    type: 'xss',
    status: 'success',
    time: '2024-01-15 14:28:15',
    attacker: '192.168.1.101'
  },
  {
    id: 3,
    target: 'Pwnable.kr',
    type: 'overflow',
    status: 'failed',
    time: '2024-01-15 14:25:45',
    attacker: '192.168.1.102'
  }
])

const attackRecordsColumns = [
  { title: '目标靶机', dataIndex: 'target', key: 'target' },
  { title: '攻击类型', dataIndex: 'type', key: 'type', slotName: 'type' },
  { title: '攻击状态', dataIndex: 'status', key: 'status', slotName: 'status' },
  { title: '攻击时间', dataIndex: 'time', key: 'time' },
  { title: '攻击者IP', dataIndex: 'attacker', key: 'attacker' }
]

// 报告表单
const reportForm = reactive({
  type: '',
  dateRange: [],
  targets: [],
  content: []
})

// 历史报告
const reportHistory = ref([
  {
    id: 1,
    name: '2024年1月漏洞分析报告',
    type: 'comprehensive',
    createTime: '2024-01-15 10:30:00',
    size: '2.5MB'
  },
  {
    id: 2,
    name: 'Web漏洞专项报告',
    type: 'vulnerability',
    createTime: '2024-01-14 15:20:00',
    size: '1.8MB'
  },
  {
    id: 3,
    name: '攻击趋势分析报告',
    type: 'trend',
    createTime: '2024-01-13 09:15:00',
    size: '1.2MB'
  }
])

const reportHistoryColumns = [
  { title: '报告名称', dataIndex: 'name', key: 'name' },
  { title: '报告类型', dataIndex: 'type', key: 'type', slotName: 'type' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '文件大小', dataIndex: 'size', key: 'size' },
  { title: '操作', key: 'actions', slotName: 'actions', width: 200 }
]

// 颜色映射函数
const getRankColor = (rank) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return 'default'
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

const getSeverityColor = (severity) => {
  const colors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'red'
  }
  return colors[severity] || 'gray'
}

const getSeverityText = (severity) => {
  const texts = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return texts[severity] || '未知'
}

const getExploitabilityColor = (exploitability) => {
  const colors = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  }
  return colors[exploitability] || 'gray'
}

const getExploitabilityText = (exploitability) => {
  const texts = {
    easy: '容易',
    medium: '中等',
    hard: '困难'
  }
  return texts[exploitability] || '未知'
}

const getAttackTypeColor = (type) => {
  const colors = {
    sql: 'red',
    xss: 'orange',
    overflow: 'blue',
    injection: 'green'
  }
  return colors[type] || 'gray'
}

const getAttackTypeText = (type) => {
  const texts = {
    sql: 'SQL注入',
    xss: 'XSS攻击',
    overflow: '缓冲区溢出',
    injection: '命令注入'
  }
  return texts[type] || '未知'
}

const getAttackStatusColor = (status) => {
  const colors = {
    success: 'green',
    failed: 'red',
    pending: 'orange'
  }
  return colors[status] || 'gray'
}

const getAttackStatusText = (status) => {
  const texts = {
    success: '成功',
    failed: '失败',
    pending: '进行中'
  }
  return texts[status] || '未知'
}

const getReportTypeColor = (type) => {
  const colors = {
    comprehensive: 'blue',
    vulnerability: 'red',
    attack: 'orange',
    trend: 'green'
  }
  return colors[type] || 'gray'
}

const getReportTypeText = (type) => {
  const texts = {
    comprehensive: '综合分析',
    vulnerability: '漏洞专项',
    attack: '攻击分析',
    trend: '趋势分析'
  }
  return texts[type] || '未知'
}

// 事件处理函数
const handleViewDetails = (record) => {
  Message.info(`查看漏洞详情: ${record.name}`)
}

const handleViewPoc = (record) => {
  Message.info(`查看POC: ${record.name}`)
}

const handleViewExploit = (record) => {
  Message.info(`查看利用方法: ${record.name}`)
}

const handleGenerateReport = async () => {
  try {
    Message.loading('正在生成报告...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    Message.success('报告生成成功')
  } catch (error) {
    Message.error('报告生成失败')
  }
}

const handlePreviewReport = () => {
  Message.info('预览报告功能')
}

const handleExportReport = () => {
  Message.info('导出报告功能')
}

const handleViewReport = (record) => {
  Message.info(`查看报告: ${record.name}`)
}

const handleDownloadReport = (record) => {
  Message.info(`下载报告: ${record.name}`)
}

const handleDeleteReport = (record) => {
  Message.info(`删除报告: ${record.name}`)
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.vuln-analysis {
  padding: 20px;
}

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 16px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.stat-label {
  margin-top: 8px;
  color: #666;
}

.analysis-content {
  padding: 16px 0;
}

.chart-container {
  padding: 16px;
}

.chart-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.chart-label {
  width: 100px;
  font-size: 12px;
}

.chart-value {
  width: 60px;
  text-align: right;
  font-size: 12px;
  color: #666;
}

.trend-chart {
  padding: 16px;
}

.trend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.trend-date {
  width: 60px;
  font-size: 12px;
}

.trend-bar {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  margin: 0 12px;
  overflow: hidden;
}

.trend-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.trend-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
}

.attack-types {
  padding: 16px;
}

.attack-type-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.attack-type-label {
  width: 100px;
  font-size: 12px;
}

.attack-type-bar {
  flex: 1;
  height: 16px;
  background: #f0f0f0;
  border-radius: 8px;
  margin: 0 12px;
  overflow: hidden;
}

.attack-type-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.attack-type-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
}
</style> 