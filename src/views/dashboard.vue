<template>
  <div class="dashboard-container">
    <el-row :gutter="16" class="stat-cards">
      <el-col :xs="12" :sm="6" v-for="card in cards" :key="card.title">
        <el-card shadow="hover" class="stat-card">
          <div class="card-content">
            <div class="avatar" :class="card.avatarClass">
              <img :src="card.icon" />
            </div>
            <div class="info">
              <div class="title">{{ card.title }}</div>
              <div class="value">{{ card.value }}</div>
              <div class="subtitle-title">{{ card.subtitle }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-header">情绪趋势分析</div>
          <div ref="emotionChartRef" class="chart-content"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-header">咨询会话统计</div>
          <div class="consultation-stats">
            <div class="stat-item">
              <div class="stat-label">总会话数</div>
              <div class="stat-value">{{ consultSummary.totalSessions }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">平均时长</div>
              <div class="stat-value">{{ consultSummary.avgDuration }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">活跃用户</div>
              <div class="stat-value">{{ consultSummary.activeUsers }}</div>
            </div>
          </div>
          <div ref="consultChartRef" class="chart-content"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="chart-card chart-card-full">
      <div class="chart-header">用户活跃度趋势</div>
      <div ref="userActivityChartRef" class="chart-content"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDataAnalyticsOverview } from '../api/admin'
import usersImg from '@/assets/images/users.png'
import likeImg from '@/assets/images/like.png'
import commentsImg from '@/assets/images/comments.png'
import smileImg from '@/assets/images/smile.png'

const overview = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalDiaries: 0,
  todayNewDiaries: 0,
  totalSessions: 0,
  todayNewSessions: 0,
  avgMoodScore: 0,
})

const cards = computed(() => [
  {
    title: '总用户数',
    value: overview.value.totalUsers,
    subtitle: `活跃用户：${overview.value.activeUsers}`,
    icon: usersImg,
    avatarClass: 'users',
  },
  {
    title: '情绪日志',
    value: overview.value.totalDiaries,
    subtitle: `今日新增：${overview.value.todayNewDiaries}`,
    icon: likeImg,
    avatarClass: 'like',
  },
  {
    title: '咨询会话',
    value: overview.value.totalSessions,
    subtitle: `今日新增：${overview.value.todayNewSessions}`,
    icon: commentsImg,
    avatarClass: 'comments',
  },
  {
    title: '平均情绪',
    value: `${overview.value.avgMoodScore}/10`,
    subtitle: '情绪健康指数',
    icon: smileImg,
    avatarClass: 'smile',
  },
])

const consultSummary = ref({
  totalSessions: 0,
  avgDuration: '0分钟',
  activeUsers: 0,
})

const emotionChartRef = ref(null)
const consultChartRef = ref(null)
const userActivityChartRef = ref(null)
let emotionChart = null
let consultChart = null
let userActivityChart = null

function buildEmotionOption(dates, moodScores, recordCounts) {
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: {
      data: ['平均情绪评分', '记录数量'],
      top: 0,
      textStyle: { color: '#7f8c8d', fontSize: 13 },
    },
    grid: { left: 50, right: 50, top: 50, bottom: 30 },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#95a5a6',
        fontSize: 11,
        interval: Math.floor(dates.length / 6),
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#f0f0f0', type: 'dashed' },
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '情绪评分',
        min: 0,
        max: 7,
        interval: 1,
        nameTextStyle: { color: '#95a5a6', fontSize: 11 },
        axisLabel: { color: '#95a5a6', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      },
      {
        type: 'value',
        name: '记录数量',
        min: 0,
        nameTextStyle: { color: '#95a5a6', fontSize: 11 },
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '平均情绪评分',
        type: 'line',
        data: moodScores,
        yAxisIndex: 0,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#fac858', width: 2 },
        itemStyle: { color: '#fac858', borderColor: '#fff', borderWidth: 1 },
      },
      {
        name: '记录数量',
        type: 'line',
        data: recordCounts,
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#ee6666', width: 2 },
        itemStyle: { color: '#ee6666', borderColor: '#fff', borderWidth: 1 },
      },
    ],
  }
}

function buildConsultOption(dates, sessionCounts, userCounts) {
  return {
    title: {
      text: '咨询活动统计',
      left: 'center',
      top: 0,
      textStyle: { color: '#2c3e50', fontSize: 14, fontWeight: 600 },
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['会话数量', '参与用户数'],
      bottom: 0,
      textStyle: { color: '#7f8c8d', fontSize: 12 },
    },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#95a5a6',
        fontSize: 10,
        interval: Math.floor(dates.length / 5),
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#95a5a6', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
    },
    series: [
      {
        name: '会话数量',
        type: 'bar',
        data: sessionCounts,
        barWidth: '40%',
        itemStyle: { color: '#5470c6', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '参与用户数',
        type: 'bar',
        data: userCounts,
        barWidth: '40%',
        itemStyle: { color: '#fac858', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }
}

function buildUserActivityOption(dates, activeUsers, newUsers, diaryUsers, consultUsers) {
  const seriesConfig = [
    { name: '活跃用户', data: activeUsers, color: '#6A5ACD' },
    { name: '新增用户', data: newUsers, color: '#FFD700' },
    { name: '日记用户', data: diaryUsers, color: '#20B2AA' },
    { name: '咨询用户', data: consultUsers, color: '#FF7F50' },
  ]
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: {
      data: seriesConfig.map((s) => s.name),
      top: 0,
      textStyle: { color: '#7f8c8d', fontSize: 13 },
    },
    grid: { left: 50, right: 30, top: 50, bottom: 30 },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#95a5a6',
        fontSize: 10,
        interval: Math.floor(dates.length / 6),
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#f0f0f0', type: 'dashed' },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#95a5a6', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
    },
    series: seriesConfig.map((s) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: s.color, width: 2 },
      itemStyle: { color: s.color, borderColor: '#fff', borderWidth: 1 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: s.color + '40' },
        { offset: 1, color: s.color + '08' },
      ])},
    })),
  }
}

function initCharts(res) {
  const dates = res.emotionTrend.map((i) => i.date)
  const moodScores = res.emotionTrend.map((i) => i.avgMoodScore)
  const recordCounts = res.emotionTrend.map((i) => i.recordCount)

  if (emotionChartRef.value) {
    emotionChart = echarts.init(emotionChartRef.value)
    emotionChart.setOption(buildEmotionOption(dates, moodScores, recordCounts))
  }

  if (consultChartRef.value && res.consultationStats) {
    consultChart = echarts.init(consultChartRef.value)
    const cs = res.consultationStats
    const cd = cs.dailyTrend || []
    consultChart.setOption(buildConsultOption(
      cd.map((i) => i.date),
      cd.map((i) => i.sessionCount),
      cd.map((i) => i.userCount),
    ))
    consultSummary.value = {
      totalSessions: cs.totalSessions,
      avgDuration: `${cs.avgDurationMinutes}分钟`,
      activeUsers: cd.length ? cd[cd.length - 1].userCount : 0,
    }
  }

  if (userActivityChartRef.value && res.userActivity) {
    userActivityChart = echarts.init(userActivityChartRef.value)
    const ua = res.userActivity
    userActivityChart.setOption(buildUserActivityOption(
      ua.map((i) => i.date),
      ua.map((i) => i.activeUsers),
      ua.map((i) => i.newUsers),
      ua.map((i) => i.diaryUsers),
      ua.map((i) => i.consultationUsers),
    ))
  }
}

function onResize() {
  emotionChart?.resize()
  consultChart?.resize()
  userActivityChart?.resize()
}

onMounted(async () => {
  try {
    const res = await getDataAnalyticsOverview()
    if (res && res.systemOverview) {
      overview.value = res.systemOverview
    }
    if (res && res.emotionTrend) {
      await nextTick()
      initCharts(res)
      window.addEventListener('resize', onResize)
    }
  } catch {}
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  emotionChart?.dispose()
  consultChart?.dispose()
  userActivityChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stat-cards {
    margin-bottom: 24px;
  }

  .stat-card {
    margin-bottom: 20px;
  }

  .card-content {
    display: flex;
    align-items: center;
    .avatar {
      margin-right: 12px;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      &.users {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      &.like {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
      &.comments {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
      &.smile {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
      img {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }
    }
    .info {
      .title {
        font-size: 14px;
        color: #7f8c8d;
        margin-bottom: 4px;
      }
      .value {
        font-size: 24px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 4px;
      }
      .subtitle-title {
        font-size: 12px;
        color: #95a5a6;
      }
    }
  }

  .chart-row {
    margin-bottom: 24px;
  }

  .chart-card {
    margin-bottom: 20px;
    height: 100%;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chart-header {
      font-size: 15px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
    }
  }

  .chart-content {
    padding: 12px;
    flex: 1;
    min-height: 200px;
    position: relative;

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  }

  .consultation-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;

    .stat-item {
      text-align: center;

      .stat-label {
        font-size: 12px;
        color: #7f8c8d;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
      }
    }
  }

  .chart-card-full {
    margin-bottom: 0;
    height: auto;

    .chart-content {
      height: 260px;
      flex: none;
    }
  }
}
</style>
