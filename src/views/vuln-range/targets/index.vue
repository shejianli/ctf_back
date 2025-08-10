<template>
  <div class="vuln-targets">
    <a-card title="靶机管理" :bordered="false">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.total }}</div>
                <div class="stat-label">总靶机数</div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number running">{{ stats.running }}</div>
                <div class="stat-label">运行中</div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number stopped">{{ stats.stopped }}</div>
                <div class="stat-label">已停止</div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number error">{{ stats.error }}</div>
                <div class="stat-label">错误状态</div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

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
              v-model="searchForm.difficulty"
              placeholder="难度等级"
              allow-clear
            >
              <a-option value="easy">简单</a-option>
              <a-option value="medium">中等</a-option>
              <a-option value="hard">困难</a-option>
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
        <a-button style="margin-left: 8px" @click="handleRefresh">
          <template #icon>
            <IconRefresh />
          </template>
          刷新状态
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

        <template #difficulty="{ record }">
          <a-tag :color="getDifficultyColor(record.difficulty)">
            {{ getDifficultyText(record.difficulty) }}
          </a-tag>
        </template>

        <template #vulnerabilities="{ record }">
          <a-space>
            <a-tag v-for="vuln in record.vulnerabilities" :key="vuln" size="small">
              {{ vuln }}
            </a-tag>
          </a-space>
        </template>

        <template #resources="{ record }">
          <div class="resource-info">
            <div>CPU: {{ record.cpuUsage }}%</div>
            <div>内存: {{ record.memoryUsage }}MB</div>
            <div>磁盘: {{ record.diskUsage }}%</div>
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
            <a-button size="small" @click="handleVulnDetails(record)">
              漏洞详情
            </a-button>
            <a-button size="small" @click="handleFlags(record)">
              标志管理
            </a-button>
            <a-button size="small" @click="handleMonitor(record)">
              监控
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
            <a-form-item field="difficulty" label="难度等级">
              <a-select v-model="formData.difficulty" placeholder="请选择难度">
                <a-option value="easy">简单</a-option>
                <a-option value="medium">中等</a-option>
                <a-option value="hard">困难</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="描述">
          <a-textarea v-model="formData.description" placeholder="请输入描述" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="image" label="镜像名称">
              <a-input v-model="formData.image" placeholder="请输入Docker镜像名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="category" label="漏洞类型">
              <a-select v-model="formData.category" placeholder="请选择漏洞类型">
                <a-option value="web">Web漏洞</a-option>
                <a-option value="pwn">Pwn漏洞</a-option>
                <a-option value="crypto">密码学</a-option>
                <a-option value="reverse">逆向工程</a-option>
                <a-option value="misc">杂项</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="ports" label="端口映射">
          <a-input v-model="formData.ports" placeholder="例如: 8080:80,3306:3306" />
        </a-form-item>

        <a-form-item field="vulnerabilities" label="漏洞列表">
          <a-select
            v-model="formData.vulnerabilities"
            mode="multiple"
            placeholder="请选择漏洞类型"
          >
            <a-option value="sql-injection">SQL注入</a-option>
            <a-option value="xss">XSS跨站脚本</a-option>
            <a-option value="csrf">CSRF跨站请求伪造</a-option>
            <a-option value="file-upload">文件上传</a-option>
            <a-option value="command-injection">命令注入</a-option>
            <a-option value="buffer-overflow">缓冲区溢出</a-option>
            <a-option value="format-string">格式化字符串</a-option>
            <a-option value="uaf">UAF漏洞</a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="tags" label="标签">
          <a-input v-model="formData.tags" placeholder="请输入标签，用逗号分隔" />
        </a-form-item>

        <a-form-item field="config" label="配置参数">
          <a-textarea 
            v-model="formData.config" 
            placeholder="请输入JSON格式的配置参数"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 漏洞详情弹窗 -->
    <a-modal
      v-model:visible="vulnModalVisible"
      title="漏洞详情"
      width="800px"
      :footer="false"
    >
      <div v-if="selectedTarget">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="靶机名称">{{ selectedTarget.name }}</a-descriptions-item>
          <a-descriptions-item label="漏洞类型">{{ selectedTarget.category }}</a-descriptions-item>
          <a-descriptions-item label="难度等级">{{ getDifficultyText(selectedTarget.difficulty) }}</a-descriptions-item>
          <a-descriptions-item label="运行状态">{{ getStatusText(selectedTarget.status) }}</a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-tabs>
          <a-tab-pane key="vulnerabilities" title="漏洞列表">
            <a-list>
              <a-list-item v-for="vuln in selectedTarget.vulnerabilities" :key="vuln">
                <a-list-item-meta>
                  <template #title>
                    <a-tag :color="getVulnColor(vuln)">{{ vuln }}</a-tag>
                  </template>
                  <template #description>
                    <div>{{ getVulnDescription(vuln) }}</div>
                    <div style="margin-top: 8px;">
                      <a-space>
                        <a-button size="small" @click="handleTestVuln(vuln)">
                          测试漏洞
                        </a-button>
                        <a-button size="small" @click="handleViewPoc(vuln)">
                          查看POC
                        </a-button>
                      </a-space>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </a-tab-pane>

          <a-tab-pane key="exploit" title="利用方法">
            <a-alert
              message="漏洞利用说明"
              description="以下是该靶机中各种漏洞的利用方法和技巧"
              type="info"
              style="margin-bottom: 16px"
            />
            <a-collapse>
              <a-collapse-item 
                v-for="vuln in selectedTarget.vulnerabilities" 
                :key="vuln"
                :header="vuln"
              >
                <div v-html="getExploitGuide(vuln)"></div>
              </a-collapse-item>
            </a-collapse>
          </a-tab-pane>

          <a-tab-pane key="defense" title="防御建议">
            <a-alert
              message="防御建议"
              description="针对该靶机中的漏洞，以下是一些防御建议"
              type="warning"
              style="margin-bottom: 16px"
            />
            <a-list>
              <a-list-item v-for="vuln in selectedTarget.vulnerabilities" :key="vuln">
                <a-list-item-meta>
                  <template #title>{{ vuln }} 防御建议</template>
                  <template #description>
                    <div v-html="getDefenseGuide(vuln)"></div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>

    <!-- 标志管理弹窗 -->
    <a-modal
      v-model:visible="flagsModalVisible"
      title="标志管理"
      width="600px"
      @ok="handleFlagsOk"
      @cancel="handleFlagsCancel"
    >
      <div v-if="selectedTarget">
        <a-alert
          message="标志管理"
          description="管理该靶机的标志和检查脚本"
          type="info"
          style="margin-bottom: 16px"
        />
        
        <a-form layout="vertical">
          <a-form-item label="标志列表">
            <a-textarea 
              v-model="flagsData.flags" 
              placeholder="每行一个标志"
              :rows="6"
            />
          </a-form-item>
          
          <a-form-item label="检查脚本">
            <a-textarea 
              v-model="flagsData.checkScript" 
              placeholder="请输入检查脚本"
              :rows="8"
            />
          </a-form-item>
          
          <a-form-item label="标志格式">
            <a-radio-group v-model="flagsData.flagFormat">
              <a-radio value="plain">明文</a-radio>
              <a-radio value="md5">MD5</a-radio>
              <a-radio value="sha1">SHA1</a-radio>
              <a-radio value="sha256">SHA256</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 监控弹窗 -->
    <a-modal
      v-model:visible="monitorModalVisible"
      title="靶机监控"
      width="1000px"
      :footer="false"
    >
      <div v-if="selectedTarget">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-card title="资源使用情况" size="small">
              <div class="monitor-charts">
                <div class="chart-item">
                  <div class="chart-title">CPU使用率</div>
                  <a-progress 
                    :percent="selectedTarget.cpuUsage" 
                    :color="getProgressColor(selectedTarget.cpuUsage)"
                  />
                </div>
                <div class="chart-item">
                  <div class="chart-title">内存使用率</div>
                  <a-progress 
                    :percent="selectedTarget.memoryUsage / 1024 * 10" 
                    :color="getProgressColor(selectedTarget.memoryUsage / 1024 * 10)"
                  />
                </div>
                <div class="chart-item">
                  <div class="chart-title">磁盘使用率</div>
                  <a-progress 
                    :percent="selectedTarget.diskUsage" 
                    :color="getProgressColor(selectedTarget.diskUsage)"
                  />
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card title="访问统计" size="small">
              <a-statistic title="今日访问" :value="selectedTarget.todayVisits" />
              <a-statistic title="总访问次数" :value="selectedTarget.totalVisits" />
              <a-statistic title="成功攻击" :value="selectedTarget.successfulAttacks" />
            </a-card>
          </a-col>
        </a-row>

        <a-divider />

        <a-card title="实时日志" size="small">
          <div class="log-container">
            <pre>{{ selectedTarget.realtimeLogs }}</pre>
          </div>
        </a-card>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import useLoading from '@/hooks/loading'

const { loading, setLoading } = useLoading()

// 统计数据
const stats = reactive({
  total: 0,
  running: 0,
  stopped: 0,
  error: 0
})

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  difficulty: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: 'DVWA',
    description: 'Damn Vulnerable Web Application - Web漏洞靶机',
    image: 'vulnerables/web-dvwa',
    status: 'running',
    difficulty: 'easy',
    category: 'web',
    ports: '8080:80',
    tags: 'web,sql注入,xss',
    vulnerabilities: ['sql-injection', 'xss', 'file-upload'],
    cpuUsage: 25,
    memoryUsage: 512,
    diskUsage: 45,
    todayVisits: 156,
    totalVisits: 2847,
    successfulAttacks: 23,
    realtimeLogs: '[2024-01-15 14:30:15] User login attempt\n[2024-01-15 14:30:20] SQL injection detected\n[2024-01-15 14:30:25] XSS payload executed',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: 'Vulhub',
    description: 'Vulhub漏洞环境集合',
    image: 'vulhub/vulhub',
    status: 'stopped',
    difficulty: 'medium',
    category: 'web',
    ports: '8081:80',
    tags: 'web,漏洞环境',
    vulnerabilities: ['csrf', 'command-injection'],
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 30,
    todayVisits: 0,
    totalVisits: 1245,
    successfulAttacks: 8,
    realtimeLogs: 'Container stopped',
    createTime: '2024-01-14 15:20:00',
    updateTime: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    name: 'Pwnable.kr',
    description: 'Pwnable.kr靶机环境',
    image: 'pwnable/pwnable',
    status: 'running',
    difficulty: 'hard',
    category: 'pwn',
    ports: '2222:22',
    tags: 'pwn,缓冲区溢出',
    vulnerabilities: ['buffer-overflow', 'format-string', 'uaf'],
    cpuUsage: 65,
    memoryUsage: 1024,
    diskUsage: 78,
    todayVisits: 89,
    totalVisits: 1567,
    successfulAttacks: 5,
    realtimeLogs: '[2024-01-15 14:29:45] Buffer overflow attempt\n[2024-01-15 14:29:50] Format string vulnerability triggered\n[2024-01-15 14:29:55] UAF exploit detected',
    createTime: '2024-01-13 09:15:00',
    updateTime: '2024-01-13 09:15:00'
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
    title: '漏洞类型',
    dataIndex: 'vulnerabilities',
    key: 'vulnerabilities',
    slotName: 'vulnerabilities'
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
    width: 320
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
  image: '',
  ports: '',
  difficulty: '',
  category: '',
  vulnerabilities: [],
  tags: '',
  config: ''
})

const formRules = {
  name: [{ required: true, message: '请输入靶机名称' }],
  image: [{ required: true, message: '请输入镜像名称' }],
  difficulty: [{ required: true, message: '请选择难度等级' }],
  category: [{ required: true, message: '请选择漏洞类型' }]
}

// 漏洞详情弹窗
const vulnModalVisible = ref(false)
const selectedTarget = ref(null)

// 标志管理弹窗
const flagsModalVisible = ref(false)
const flagsData = reactive({
  flags: '',
  checkScript: '',
  flagFormat: 'plain'
})

// 监控弹窗
const monitorModalVisible = ref(false)

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

const getVulnColor = (vuln) => {
  const colors = {
    'sql-injection': 'red',
    'xss': 'orange',
    'csrf': 'purple',
    'file-upload': 'blue',
    'command-injection': 'red',
    'buffer-overflow': 'red',
    'format-string': 'orange',
    'uaf': 'red'
  }
  return colors[vuln] || 'gray'
}

const getVulnDescription = (vuln) => {
  const descriptions = {
    'sql-injection': 'SQL注入漏洞，允许攻击者执行恶意SQL语句',
    'xss': '跨站脚本攻击，允许攻击者注入恶意脚本',
    'csrf': '跨站请求伪造，允许攻击者执行未授权的操作',
    'file-upload': '文件上传漏洞，允许攻击者上传恶意文件',
    'command-injection': '命令注入漏洞，允许攻击者执行系统命令',
    'buffer-overflow': '缓冲区溢出漏洞，可能导致程序崩溃或执行恶意代码',
    'format-string': '格式化字符串漏洞，可能导致信息泄露或程序崩溃',
    'uaf': 'Use After Free漏洞，可能导致程序崩溃或执行恶意代码'
  }
  return descriptions[vuln] || '未知漏洞类型'
}

const getExploitGuide = (vuln) => {
  const guides = {
    'sql-injection': `
      <h4>SQL注入利用方法：</h4>
      <ol>
        <li>使用单引号闭合字符串</li>
        <li>使用UNION查询获取数据</li>
        <li>使用布尔盲注获取信息</li>
        <li>使用时间盲注获取信息</li>
      </ol>
    `,
    'xss': `
      <h4>XSS利用方法：</h4>
      <ol>
        <li>反射型XSS：在URL参数中注入脚本</li>
        <li>存储型XSS：在数据库中存储恶意脚本</li>
        <li>DOM型XSS：通过修改DOM结构执行脚本</li>
      </ol>
    `,
    'buffer-overflow': `
      <h4>缓冲区溢出利用方法：</h4>
      <ol>
        <li>确定缓冲区大小</li>
        <li>构造溢出payload</li>
        <li>覆盖返回地址</li>
        <li>执行shellcode</li>
      </ol>
    `
  }
  return guides[vuln] || '<p>暂无利用指南</p>'
}

const getDefenseGuide = (vuln) => {
  const defenses = {
    'sql-injection': `
      <ul>
        <li>使用参数化查询</li>
        <li>输入验证和过滤</li>
        <li>最小权限原则</li>
        <li>使用ORM框架</li>
      </ul>
    `,
    'xss': `
      <ul>
        <li>输出编码</li>
        <li>内容安全策略(CSP)</li>
        <li>输入验证</li>
        <li>使用安全的框架</li>
      </ul>
    `,
    'buffer-overflow': `
      <ul>
        <li>使用安全的编程语言</li>
        <li>启用栈保护</li>
        <li>地址空间布局随机化(ASLR)</li>
        <li>输入验证</li>
      </ul>
    `
  }
  return defenses[vuln] || '<p>暂无防御建议</p>'
}

const getProgressColor = (percent) => {
  if (percent < 50) return '#52c41a'
  if (percent < 80) return '#faad14'
  return '#f5222d'
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

// 漏洞详情
const handleVulnDetails = (record) => {
  selectedTarget.value = record
  vulnModalVisible.value = true
}

// 标志管理
const handleFlags = (record) => {
  selectedTarget.value = record
  flagsData.flags = 'flag{test_flag_1}\nflag{test_flag_2}\nflag{test_flag_3}'
  flagsData.checkScript = `#!/bin/bash
# 检查脚本示例
if [ -f "/var/www/html/flag.txt" ]; then
    echo "Flag found"
    exit 0
else
    echo "Flag not found"
    exit 1
fi`
  flagsData.flagFormat = 'plain'
  flagsModalVisible.value = true
}

// 监控
const handleMonitor = (record) => {
  selectedTarget.value = record
  monitorModalVisible.value = true
}

// 测试漏洞
const handleTestVuln = (vuln) => {
  Message.info(`测试漏洞: ${vuln}`)
}

// 查看POC
const handleViewPoc = (vuln) => {
  Message.info(`查看POC: ${vuln}`)
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

const handleFlagsOk = async () => {
  try {
    setLoading(true)
    // 这里应该调用API保存标志
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('标志保存成功')
    flagsModalVisible.value = false
  } catch (error) {
    Message.error('标志保存失败')
  } finally {
    setLoading(false)
  }
}

const handleFlagsCancel = () => {
  flagsModalVisible.value = false
}

onMounted(() => {
  // 初始化数据
  pagination.total = tableData.value.length
  
  // 计算统计数据
  stats.total = tableData.value.length
  stats.running = tableData.value.filter(item => item.status === 'running').length
  stats.stopped = tableData.value.filter(item => item.status === 'stopped').length
  stats.error = tableData.value.filter(item => item.status === 'error').length
})
</script>

<style scoped>
.vuln-targets {
  padding: 20px;
}

.stats-cards {
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

.stat-number.running {
  color: #52c41a;
}

.stat-number.stopped {
  color: #faad14;
}

.stat-number.error {
  color: #f5222d;
}

.stat-label {
  margin-top: 8px;
  color: #666;
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

.resource-info {
  font-size: 12px;
  line-height: 1.4;
}

.monitor-charts {
  padding: 16px;
}

.chart-item {
  margin-bottom: 16px;
}

.chart-title {
  margin-bottom: 8px;
  font-weight: bold;
}

.log-container {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.log-container pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}
</style> 