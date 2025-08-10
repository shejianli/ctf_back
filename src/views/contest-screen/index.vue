<template>
  <div class="contest-screen">
    <!-- 粒子动画背景 -->
    <Particles
      id="tsparticles"
      :options="particlesOptions"
      style="position:fixed;z-index:0;left:0;top:0;width:100vw;height:100vh;pointer-events:none;"/>
    <!-- 顶部 -->
    <div class="header">
      <img src="@/assets/icon.svg" class="logo" />
      <div class="title-group">
        <h1 class="main-title">{{ contestTitle }}</h1>
        <div class="subtitle">CTF Capture The Flag | 赛事大屏</div>
      </div>
      <div class="countdown">
        <span class="countdown-label">距离结束</span>
        <Vue3FlipCountdown
          :endDate="endDate"
          titlePosition="top"
          mainColor="#00eaff"
          secondFlipColor="#222"
          :labels="['天','时','分','秒']"
        />
      </div>
    </div>
    <!-- 主体 -->
    <div class="main-content">
      <!-- 排行榜 -->
      <a-card class="rank-card" title="实时排行榜">
        <a-table
          :data="rankList"
          :columns="rankColumns"
          :pagination="false"
          row-class-name="rank-row"
        >
          <template #bodyCell="{ column, record }">
            <span v-if="column.dataIndex === 'rank'" :class="['rank-badge', 'rank-' + record.rank]">
              {{ record.rank }}
            </span>
            <span v-else>{{ record[column.dataIndex] }}</span>
          </template>
        </a-table>
      </a-card>
      <!-- 公告与动态 -->
      <div class="right-panel">
        <a-card class="notice-card" title="公告">
          <div class="notice-marquee">
            <marquee scrollamount="6" direction="up" height="100">
              <div v-for="notice in notices" :key="notice.id" class="notice-item">
                {{ notice.content }}
              </div>
            </marquee>
          </div>
        </a-card>
        <a-card class="progress-card" title="赛题动态">
          <div class="progress-circle">
            <a-progress
              type="circle"
              :percent="progressPercent"
              :width="120"
              strokeColor="#00eaff"
              trailColor="#222"
            />
            <div class="progress-label">
              <div>已解题数</div>
              <div class="progress-num">{{ solvedCount }}/{{ totalChallenges }}</div>
            </div>
          </div>
        </a-card>
      </div>
    </div>
    <!-- 底部 -->
    <div class="footer">
      <span>Powered by Arco Design &amp; Vue3 | 2024</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Particles from 'vue3-particles'
import Vue3FlipCountdown from 'vue3-flip-countdown'
// import axios from 'axios' // 如需对接后端可解开

const contestTitle = ref('CTF 巅峰对决')
const endDate = ref('2024-12-31 23:59:59') // 结束时间
const rankList = ref([
  { rank: 1, team: 'TeamA', score: 1200, solves: 10, lastSubmit: '12:01:23' },
  { rank: 2, team: 'TeamB', score: 1100, solves: 9, lastSubmit: '12:02:10' },
  { rank: 3, team: 'TeamC', score: 900, solves: 8, lastSubmit: '12:05:10' },
])
const rankColumns = [
  { title: '排名', dataIndex: 'rank' },
  { title: '队伍', dataIndex: 'team' },
  { title: '分数', dataIndex: 'score' },
  { title: '解题数', dataIndex: 'solves' },
  { title: '最后提交', dataIndex: 'lastSubmit' }
]
const notices = ref([
  { id: 1, content: '请遵守比赛规则！' },
  { id: 2, content: '题目已全部开放。' },
  { id: 3, content: '如遇问题请联系工作人员。' }
])
const solvedCount = ref(23)
const totalChallenges = ref(30)
const progressPercent = ref(Math.round((solvedCount.value / totalChallenges.value) * 100))

const particlesOptions = {
  background: { color: '#101522' },
  particles: {
    color: { value: '#00eaff' },
    links: { enable: true, color: '#00eaff' },
    move: { enable: true, speed: 1 },
    number: { value: 60 },
    size: { value: 3 }
  }
}

onMounted(() => {
  // 实时数据刷新示例（需对接后端接口）
  // setInterval(async () => {
  //   const { data } = await axios.get('/api/contest/rank')
  //   rankList.value = data.rankList
  //   // 其他数据同理
  // }, 5000)
})
</script>

<style scoped>
.contest-screen {
  position: relative;
  background: linear-gradient(135deg, #0f2027 0%, #2c5364 100%);
  min-height: 100vh;
  color: #fff;
  padding: 32px 24px 16px 24px;
  overflow: hidden;
}
.header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}
.logo {
  height: 60px;
  margin-right: 24px;
  filter: drop-shadow(0 0 8px #00eaff);
}
.title-group {
  flex: 1;
}
.main-title {
  font-size: 2.8em;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: #00eaff;
  text-shadow: 0 0 16px #00eaff88, 0 2px 8px #000;
}
.subtitle {
  font-size: 1.2em;
  color: #fff;
  opacity: 0.7;
  margin-top: 4px;
}
.countdown {
  font-size: 2em;
  color: #ffd700;
  text-align: right;
  font-family: 'Consolas', monospace;
  text-shadow: 0 0 8px #ffd70088;
}
.countdown-label {
  font-size: 0.7em;
  margin-right: 8px;
  color: #fff;
  opacity: 0.7;
}
.countdown-time {
  font-size: 1.5em;
  font-weight: bold;
  letter-spacing: 0.1em;
}
.main-content {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 32px;
}
.rank-card {
  flex: 2;
  background: rgba(0,34,64,0.7);
  border-radius: 16px;
  box-shadow: 0 4px 32px #00eaff33;
}
.rank-row {
  font-size: 1.2em;
}
.rank-badge {
  display: inline-block;
  min-width: 2.2em;
  text-align: center;
  font-weight: bold;
  border-radius: 8px;
  background: #222;
  color: #00eaff;
  box-shadow: 0 0 8px #00eaff88;
}
.rank-1 { background: #ffd700; color: #222; }
.rank-2 { background: #c0c0c0; color: #222; }
.rank-3 { background: #cd7f32; color: #222; }
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.notice-card, .progress-card {
  background: rgba(0,34,64,0.7);
  border-radius: 16px;
  box-shadow: 0 4px 32px #00eaff22;
}
.notice-marquee {
  color: #ffd700;
  font-size: 1.1em;
  font-weight: bold;
  padding: 8px 0;
}
.notice-item {
  margin-bottom: 12px;
}
.progress-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
}
.progress-label {
  margin-top: 12px;
  text-align: center;
  color: #00eaff;
  font-size: 1.1em;
}
.progress-num {
  font-size: 1.6em;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 8px #ffd70088;
}
.footer {
  position: absolute;
  left: 0; right: 0; bottom: 8px;
  text-align: center;
  color: #00eaff;
  opacity: 0.7;
  font-size: 1.1em;
  z-index: 2;
  letter-spacing: 0.1em;
}
</style>