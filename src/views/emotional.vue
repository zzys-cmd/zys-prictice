<template>
  <div>
    <pagehead title="情绪日志" />

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="情绪日志详情" width="70%">
      <div class="dialog-section">
        <div class="section-title">用户信息</div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="用户名">{{ detailData.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ detailData.nickname }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailData.userId }}</el-descriptions-item>
          <el-descriptions-item label="记录日期">{{ detailData.diaryDate }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="dialog-section">
        <div class="section-title">情绪状态</div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="情绪评分" :span="2">
            <span class="stars detail-stars">
              <span v-for="n in 10" :key="n" :class="n <= detailData.moodScore ? 'star filled' : 'star'">★</span>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="主要情绪">
            <el-tag size="small" type="info">{{ detailData.dominantEmotion || '-' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="压力水平">{{ detailData.stressLevel }}/5</el-descriptions-item>
          <el-descriptions-item label="睡眠质量">{{ detailData.sleepQuality }}/5</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="dialog-section">
        <div class="section-title">日记内容</div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="情绪触发因素" :span="4">{{ detailData.emotionTriggers || '无' }}</el-descriptions-item>
          <el-descriptions-item label="日记内容" :span="4">
            <div class="detail-text">{{ detailData.diaryContent || '-' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="dialog-section">
        <div class="section-title">AI情绪分析结果</div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="主要情绪">{{ detailData.aiMainEmotion || '中性' }}</el-descriptions-item>
          <el-descriptions-item label="情绪强度">
            <el-progress :percentage="detailData.emotionStrength || 0" status="active" />
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">{{ detailData.riskLevel || 0 }}</el-descriptions-item>
          <el-descriptions-item label="情绪性质">
            <el-tag
              :type="detailData.emotionType === '正面情绪' ? 'success' : detailData.emotionType === '负面情绪' ? 'danger' : 'info'"
              size="small">
              {{ detailData.emotionType || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="专业建议" :span="4">{{ detailData.professionalAdvice || '暂无建议'
            }}</el-descriptions-item>
          <el-descriptions-item label="风险提示" :span="4">{{ detailData.riskTips || '无风险' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <el-form ref="formRef" :model="formData">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="ID" prop="id">
            <el-input v-model="formData.id" placeholder="请输入日记ID" clearable />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="情绪评分" prop="scoreRange">
            <el-select v-model="formData.scoreRange" placeholder="选择评分范围" clearable>
              <el-option label="全部" value="" />
              <el-option label="低分（1-3）" value="low" />
              <el-option label="中分（4-6）" value="mid" />
              <el-option label="高分（7-10）" value="high" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-button type="primary" @click="handleSearch" :loading="loading">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-row>
    </el-form>

    <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="会话ID" width="200">
        <template #default="{ row }">
          <el-avatar>
            {{ row.nickname }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="diaryDate" label="记录日期" width="120" />
      <el-table-column label="情绪评分" width="240">
        <template #default="{ row }">
          <span class="stars">
            <span v-for="n in 10" :key="n" :class="n <= row.moodScore ? 'star filled' : 'star'">★</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="生活指标" width="160">
        <template #default="{ row }">
          <div class="life-indicators">
            <span>睡眠 {{ row.sleepQuality }} / 压力 {{ row.stressLevel }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="emotionTriggers" label="情绪触发因素" min-width="160" show-overflow-tooltip />
      <el-table-column prop="diaryContentPreview" label="日记内容" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="display: flex; justify-content: flex-end; margin-top: 20px">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next" @current-change="onPageChange"
        @size-change="onSizeChange" />
    </div>
  </div>
</template>

<script setup>
import pagehead from '@/components/pagehead.vue'
import { getEmotionDiaryPage, deleteEmotionDiary } from '@/api/admin.js'
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const formRef = ref(null)
const formData = reactive({
  id: '',
  scoreRange: '',
})

const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 详情弹窗相关
const detailDialogVisible = ref(false)
const detailData = reactive({
  userId: '',
  username: '',
  nickname: '',
  diaryDate: '',
  moodScore: 0,
  sleepQuality: 0,
  stressLevel: 0,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  aiMainEmotion: '',
  emotionStrength: 0,
  riskLevel: 0,
  emotionType: '',
  professionalAdvice: '',
  riskTips: '',
})

const scoreRangeMap = {
  '': { min: undefined, max: undefined },
  low: { min: 1, max: 3 },
  mid: { min: 4, max: 6 },
  high: { min: 7, max: 10 },
}

const fetchData = () => {
  loading.value = true
  const range = scoreRangeMap[formData.scoreRange] ?? scoreRangeMap['']
  const searchId = formData.id || undefined

  getEmotionDiaryPage({
    current: currentPage.value,
    size: pageSize.value,
    id: searchId,
    minMoodScore: range.min,
    maxMoodScore: range.max,
  }).then(res => {
    let records = res.records ?? []
    // 后端暂不支持id筛选，前端做过滤
    if (searchId) {
      records = records.filter(r => String(r.id) === String(searchId))
    }
    tableData.value = records
    total.value = searchId ? records.length : (res.total ?? 0)
  }).finally(() => {
    loading.value = false
  })
}

const loading = ref(false)

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  formData.id = ''
  formData.scoreRange = ''
  formRef.value?.resetFields()
  handleSearch()
}

const onPageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const onSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchData()
}

const handleDetail = (row) => {
  // 将行数据映射到详情数据对象
  Object.assign(detailData, {
    userId: row.userId,
    username: row.username,
    nickname: row.nickname,
    diaryDate: row.diaryDate,
    moodScore: row.moodScore || 0,
    sleepQuality: row.sleepQuality || 0,
    stressLevel: row.stressLevel || 0,
    dominantEmotion: row.dominantEmotion || '-',
    emotionTriggers: row.emotionTriggers || '无',
    diaryContent: row.diaryContent || '-',
    aiMainEmotion: row.aiMainEmotion || '中性',
    emotionStrength: row.emotionStrength || 0,
    riskLevel: row.riskLevel || 0,
    emotionType: row.emotionType || '中性',
    professionalAdvice: row.professionalAdvice || '暂无建议',
    riskTips: row.riskTips || '无风险',
  })
  detailDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户"${row.username || row.userId}"的日记记录吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteEmotionDiary(row.id).then(() => {
      ElMessage.success('删除成功')
      fetchData()
    })
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.stars {
  white-space: nowrap;
}

.detail-stars {
  display: inline-flex;
  align-items: center;
}

.star {
  color: #c0c4cc;
  font-size: 16px;
  margin-right: 2px;
}

.star.filled {
  color: #f7ba2a;
}

.life-indicators {
  font-size: 13px;
}

.dialog-section {
  margin-bottom: 18px;
}

.section-title {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  margin-bottom: 12px;
}

.detail-text {
  max-height: 140px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: #606266;
  line-height: 1.7;
}
</style>
