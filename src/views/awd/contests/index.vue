<template>
  <div class="awd-contests">
    <a-card title="AWD比赛管理" :bordered="false">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model="searchForm.name"
              placeholder="比赛名称"
              allow-clear
            />
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.status"
              placeholder="比赛状态"
              allow-clear
            >
              <a-option value="upcoming">即将开始</a-option>
              <a-option value="running">进行中</a-option>
              <a-option value="finished">已结束</a-option>
              <a-option value="cancelled">已取消</a-option>
            </a-select>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.type"
              placeholder="比赛类型"
              allow-clear
            >
              <a-option value="practice">练习赛</a-option>
              <a-option value="competition">正式赛</a-option>
              <a-option value="training">训练赛</a-option>
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
          创建比赛
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchStart">
          批量开始
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchStop">
          批量结束
        </a-button>
        <a-button style="margin-left: 8px" @click="handleBatchDelete">
          批量删除
        </a-button>
      </div>

      <!-- 比赛列表 -->
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

        <template #duration="{ record }">
          <div>
            <div>开始: {{ record.startTime }}</div>
            <div>结束: {{ record.endTime }}</div>
            <div>时长: {{ record.duration }}小时</div>
          </div>
        </template>

        <template #participants="{ record }">
          <div>
            <div>队伍: {{ record.teams }}/{{ record.maxTeams }}</div>
            <div>选手: {{ record.players }}/{{ record.maxPlayers }}</div>
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
              {{ record.status === 'running' ? '结束' : '开始' }}
            </a-button>
            <a-button size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-button size="small" @click="handleScoreboard(record)">
              排行榜
            </a-button>
            <a-button size="small" @click="handleConfig(record)">
              配置
            </a-button>
            <a-popconfirm
              content="确定要删除这个比赛吗？"
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

    <!-- 添加/编辑比赛弹窗 -->
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
            <a-form-item field="name" label="比赛名称">
              <a-input v-model="formData.name" placeholder="请输入比赛名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="type" label="比赛类型">
              <a-select v-model="formData.type" placeholder="请选择比赛类型">
                <a-option value="practice">练习赛</a-option>
                <a-option value="competition">正式赛</a-option>
                <a-option value="training">训练赛</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item field="description" label="比赛描述">
          <a-textarea v-model="formData.description" placeholder="请输入比赛描述" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="startTime" label="开始时间">
              <a-date-picker
                v-model="formData.startTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择开始时间"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="endTime" label="结束时间">
              <a-date-picker
                v-model="formData.endTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择结束时间"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="duration" label="比赛时长(小时)">
              <a-input-number 
                v-model="formData.duration" 
                :min="1" 
                :max="72"
                placeholder="比赛时长"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="maxTeams" label="最大队伍数">
              <a-input-number 
                v-model="formData.maxTeams" 
                :min="1" 
                :max="100"
                placeholder="最大队伍数"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="maxPlayers" label="最大选手数">
              <a-input-number 
                v-model="formData.maxPlayers" 
                :min="1" 
                :max="500"
                placeholder="最大选手数"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="maxPlayersPerTeam" label="每队最大人数">
              <a-input-number 
                v-model="formData.maxPlayersPerTeam" 
                :min="1" 
                :max="10"
                placeholder="每队最大人数"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="targets" label="靶机配置">
          <a-select
            v-model="formData.targets"
            mode="multiple"
            placeholder="请选择靶机"
          >
            <a-option value="web1">Web靶机1</a-option>
            <a-option value="web2">Web靶机2</a-option>
            <a-option value="pwn1">Pwn靶机1</a-option>
            <a-option value="pwn2">Pwn靶机2</a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="rules" label="比赛规则">
          <a-textarea 
            v-model="formData.rules" 
            placeholder="请输入比赛规则"
            :rows="6"
          />
        </a-form-item>

        <a-form-item field="scoring" label="评分规则">
          <a-textarea 
            v-model="formData.scoring" 
            placeholder="请输入评分规则"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 排行榜弹窗 -->
    <a-modal
      v-model:visible="scoreboardModalVisible"
      title="比赛排行榜"
      width="1000px"
      :footer="false"
    >
      <a-table
        :columns="scoreboardColumns"
        :data="scoreboardData"
        :pagination="false"
        size="small"
      >
        <template #rank="{ record }">
          <a-tag :color="getRankColor(record.rank)">
            {{ record.rank }}
          </a-tag>
        </template>
      </a-table>
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
    name: 'Web安全攻防练习赛',
    description: 'Web安全攻防练习比赛，包含多种Web漏洞',
    type: 'practice',
    status: 'running',
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    duration: 8,
    teams: 12,
    maxTeams: 20,
    players: 36,
    maxPlayers: 60,
    maxPlayersPerTeam: 3,
    targets: ['web1', 'web2'],
    createTime: '2024-01-14 15:20:00'
  },
  {
    id: 2,
    name: '综合攻防训练赛',
    description: '综合攻防训练比赛，包含Web、Pwn等多种题型',
    type: 'training',
    status: 'upcoming',
    startTime: '2024-01-20 09:00:00',
    endTime: '2024-01-20 17:00:00',
    duration: 8,
    teams: 8,
    maxTeams: 15,
    players: 24,
    maxPlayers: 45,
    maxPlayersPerTeam: 3,
    targets: ['web1', 'pwn1'],
    createTime: '2024-01-13 10:30:00'
  },
  {
    id: 3,
    name: 'AWD正式比赛',
    description: 'AWD攻防正式比赛',
    type: 'competition',
    status: 'finished',
    startTime: '2024-01-10 14:00:00',
    endTime: '2024-01-10 22:00:00',
    duration: 8,
    teams: 20,
    maxTeams: 20,
    players: 60,
    maxPlayers: 60,
    maxPlayersPerTeam: 3,
    targets: ['web1', 'web2', 'pwn1', 'pwn2'],
    createTime: '2024-01-09 16:45:00'
  }
])

// 表格列配置
const columns = [
  {
    title: '比赛名称',
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
    title: '时间安排',
    dataIndex: 'duration',
    key: 'duration',
    slotName: 'duration'
  },
  {
    title: '参与情况',
    dataIndex: 'participants',
    key: 'participants',
    slotName: 'participants'
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
const modalTitle = ref('创建比赛')
const formRef = ref()
const formData = reactive({
  name: '',
  description: '',
  type: '',
  startTime: null,
  endTime: null,
  duration: 8,
  maxTeams: 20,
  maxPlayers: 60,
  maxPlayersPerTeam: 3,
  targets: [],
  rules: '',
  scoring: ''
})

const formRules = {
  name: [{ required: true, message: '请输入比赛名称' }],
  type: [{ required: true, message: '请选择比赛类型' }],
  startTime: [{ required: true, message: '请选择开始时间' }],
  endTime: [{ required: true, message: '请选择结束时间' }],
  targets: [{ required: true, message: '请选择靶机配置' }]
}

// 排行榜弹窗
const scoreboardModalVisible = ref(false)
const scoreboardData = ref([
  { rank: 1, team: 'Team Alpha', score: 850, flags: 12, attacks: 8, defenses: 4 },
  { rank: 2, team: 'Team Beta', score: 720, flags: 10, attacks: 6, defenses: 4 },
  { rank: 3, team: 'Team Gamma', score: 680, flags: 9, attacks: 7, defenses: 2 },
  { rank: 4, team: 'Team Delta', score: 550, flags: 7, attacks: 5, defenses: 2 },
  { rank: 5, team: 'Team Epsilon', score: 480, flags: 6, attacks: 4, defenses: 2 }
])

const scoreboardColumns = [
  {
    title: '排名',
    dataIndex: 'rank',
    key: 'rank',
    slotName: 'rank',
    width: 80
  },
  {
    title: '队伍名称',
    dataIndex: 'team',
    key: 'team'
  },
  {
    title: '总分',
    dataIndex: 'score',
    key: 'score'
  },
  {
    title: '获得Flag数',
    dataIndex: 'flags',
    key: 'flags'
  },
  {
    title: '攻击次数',
    dataIndex: 'attacks',
    key: 'attacks'
  },
  {
    title: '防御次数',
    dataIndex: 'defenses',
    key: 'defenses'
  }
]

// 状态颜色映射
const getStatusColor = (status) => {
  const colors = {
    upcoming: 'blue',
    running: 'green',
    finished: 'gray',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    upcoming: '即将开始',
    running: '进行中',
    finished: '已结束',
    cancelled: '已取消'
  }
  return texts[status] || '未知'
}

const getTypeColor = (type) => {
  const colors = {
    practice: 'green',
    competition: 'red',
    training: 'blue'
  }
  return colors[type] || 'gray'
}

const getTypeText = (type) => {
  const texts = {
    practice: '练习赛',
    competition: '正式赛',
    training: '训练赛'
  }
  return texts[type] || '未知'
}

const getRankColor = (rank) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return 'default'
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

// 添加比赛
const handleAdd = () => {
  modalTitle.value = '创建比赛'
  modalVisible.value = true
  // 重置表单
  Object.keys(formData).forEach(key => {
    if (key === 'duration') formData[key] = 8
    else if (key === 'maxTeams') formData[key] = 20
    else if (key === 'maxPlayers') formData[key] = 60
    else if (key === 'maxPlayersPerTeam') formData[key] = 3
    else if (key === 'targets') formData[key] = []
    else formData[key] = ''
  })
}

// 编辑比赛
const handleEdit = (record) => {
  modalTitle.value = '编辑比赛'
  modalVisible.value = true
  // 填充表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = record[key] || ''
  })
}

// 查看比赛
const handleView = (record) => {
  Message.info(`查看比赛: ${record.name}`)
}

// 查看排行榜
const handleScoreboard = (record) => {
  scoreboardModalVisible.value = true
}

// 配置比赛
const handleConfig = (record) => {
  Message.info(`配置比赛: ${record.name}`)
}

// 切换状态
const handleToggleStatus = async (record) => {
  const action = record.status === 'running' ? '结束' : '开始'
  try {
    setLoading(true)
    // 这里应该调用API
    await new Promise(resolve => setTimeout(resolve, 1000))
    record.status = record.status === 'running' ? 'finished' : 'running'
    Message.success(`${action}成功`)
  } catch (error) {
    Message.error(`${action}失败`)
  } finally {
    setLoading(false)
  }
}

// 删除比赛
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
    Message.warning('请选择要开始的比赛')
    return
  }
  Message.info(`批量开始 ${selectedRowKeys.value.length} 个比赛`)
}

const handleBatchStop = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要结束的比赛')
    return
  }
  Message.info(`批量结束 ${selectedRowKeys.value.length} 个比赛`)
}

const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请选择要删除的比赛')
    return
  }
  Message.info(`批量删除 ${selectedRowKeys.value.length} 个比赛`)
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
.awd-contests {
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