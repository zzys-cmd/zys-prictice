<template>
  <div class="emotionDiary-container">
    <!-- ========== 头部区域 ========== -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">❤️</div>
        <div>
          <h1 class="header-title">情绪日记</h1>
        </div>
      </div>
    </div>

    <!-- ========== 内容区域 ========== -->
    <div class="content">
      <!-- 今日情绪评分 -->
      <div class="diary-card">
        <h2 class="title">今日情绪评分</h2>
        <div class="section">
          <p>您今天的整体情绪状态如何？(1-10分)</p>
          <div class="star-rating-row">
            <div class="stars">
              <span
                v-for="i in 10"
                :key="i"
                class="star"
                :class="{ active: i <= form.moodScore }"
                @click="selectMoodScore(i)"
              >★</span>
            </div>
            <span v-if="form.moodScore" class="emotion-label">{{ currentEmotionLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 主要情绪 -->
      <div class="diary-card">
        <h2 class="title">主要情绪</h2>
        <div class="section">
          <p>请选择您今天的主要情绪类型</p>
          <div class="emotion-grid">
            <div
              v-for="emotion in mainEmotions"
              :key="emotion.name"
              class="emotion-card"
              :class="{ selected: form.dominantEmotion === emotion.name }"
              @click="selectDominantEmotion(emotion.name)"
            >
              <div class="emotion-img-wrapper">
                <img :src="emotion.img" :alt="emotion.name" class="emotion-img" />
              </div>
              <div class="emotion-name">{{ emotion.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细信息表单 -->
      <div class="diary-card">
        <h2 class="title">详细记录</h2>
        <div class="detail-form">
          <!-- 情绪触发因素 -->
          <div class="form-group">
            <label class="form-label">情绪触发因素</label>
            <el-input
              v-model="form.emotionTriggers"
              type="textarea"
              :rows="3"
              placeholder="今天什么事情影响了您的情绪？"
              maxlength="1000"
              show-word-limit
            />
          </div>

          <!-- 今日感想 -->
          <div class="form-group">
            <label class="form-label">今日感想</label>
            <el-input
              v-model="form.diaryContent"
              type="textarea"
              :rows="5"
              placeholder="写下您今天的想法、感受或发生的有趣事情..."
              maxlength="2000"
              show-word-limit
            />
          </div>

          <!-- 睡眠质量 + 压力水平（并排下拉） -->
          <div class="life-indicators">
            <div class="indicator-group">
              <label class="form-label">睡眠质量</label>
              <el-select v-model="form.sleepQuality" placeholder="请选择" class="indicator-select">
                <el-option
                  v-for="item in sleepQualityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="indicator-group">
              <label class="form-label">压力水平</label>
              <el-select v-model="form.stressLevel" placeholder="请选择" class="indicator-select">
                <el-option
                  v-for="item in stressLevelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button class="btn-reset" @click="handleReset">重置</el-button>
            <el-button type="primary" :loading="submitting" @click="handleSubmit" class="btn-submit">提交记录</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { saveEmotionDiary } from '@/api/admin.js'

// 今日日期
const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const submitting = ref(false)

// 情绪评分状态（1-10 分对应 10 种情绪）
const emotionStatus = ['绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然', '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福']

// 当前选中分数对应的情绪标签
const currentEmotionLabel = computed(() => {
  if (!form.moodScore) return ''
  return emotionStatus[form.moodScore - 1]
})

// 主要情绪选项
const mainEmotions = [
  { name: '开心', img: new URL('../assets/images/开心.png', import.meta.url).href },
  { name: '平静', img: new URL('../assets/images/平静.png', import.meta.url).href },
  { name: '焦虑', img: new URL('../assets/images/焦虑.png', import.meta.url).href },
  { name: '悲伤', img: new URL('../assets/images/悲伤.png', import.meta.url).href },
  { name: '兴奋', img: new URL('../assets/images/兴奋.png', import.meta.url).href },
  { name: '疲惫', img: new URL('../assets/images/疲惫.png', import.meta.url).href },
  { name: '惊讶', img: new URL('../assets/images/惊讶.png', import.meta.url).href },
  { name: '困惑', img: new URL('../assets/images/困惑.png', import.meta.url).href }
]

// 表单数据
const form = reactive({
  diaryDate: today.value,
  moodScore: null,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  sleepQuality: null,
  stressLevel: null
})

// 睡眠质量选项
const sleepQualityOptions = [
  { value: 1, label: '很差' },
  { value: 2, label: '较差' },
  { value: 3, label: '一般' },
  { value: 4, label: '良好' },
  { value: 5, label: '优秀' }
]

// 压力水平选项
const stressLevelOptions = [
  { value: 1, label: '1 - 极低' },
  { value: 2, label: '2 - 很低' },
  { value: 3, label: '3 - 较低' },
  { value: 4, label: '4 - 中等偏低' },
  { value: 5, label: '5 - 中等' },
  { value: 6, label: '6 - 中等偏高' },
  { value: 7, label: '7 - 较高' },
  { value: 8, label: '8 - 很高' },
  { value: 9, label: '9 - 极高' },
  { value: 10, label: '10 - 难以承受' }
]

// 选择情绪评分
const selectMoodScore = (score) => {
  form.moodScore = score
}

// 选择主要情绪
const selectDominantEmotion = (name) => {
  form.dominantEmotion = name
}

// 提交表单
const handleSubmit = async () => {
  if (!form.moodScore) {
    ElMessage.warning('请选择今日情绪评分')
    return
  }
  if (!form.dominantEmotion) {
    ElMessage.warning('请选择主要情绪')
    return
  }
  if (!form.emotionTriggers.trim()) {
    ElMessage.warning('请填写情绪触发因素')
    return
  }
  if (!form.diaryContent.trim()) {
    ElMessage.warning('请填写今日感想')
    return
  }
  if (!form.sleepQuality) {
    ElMessage.warning('请选择睡眠质量')
    return
  }
  if (!form.stressLevel) {
    ElMessage.warning('请选择压力水平')
    return
  }

  submitting.value = true
  try {
    await saveEmotionDiary({
      diaryDate: form.diaryDate,
      moodScore: form.moodScore,
      dominantEmotion: form.dominantEmotion,
      emotionTriggers: form.emotionTriggers,
      diaryContent: form.diaryContent,
      sleepQuality: form.sleepQuality,
      stressLevel: form.stressLevel
    })
    ElMessage.success('情绪日记保存成功！')
  } catch (e) {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.moodScore = null
  form.dominantEmotion = ''
  form.emotionTriggers = ''
  form.diaryContent = ''
  form.sleepQuality = null
  form.stressLevel = null
}

onMounted(() => {
  form.diaryDate = today.value
})
</script>

<style lang="scss" scoped>
.emotionDiary-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
}

// ===== 头部区域 =====
.header-section {
  background: linear-gradient(135deg, #8BC34A 0%, #FFC107 100%);
  color: white;
  padding: 36px 60px;
  display: flex;
  align-items: center;

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon {
      font-size: 32px;
    }

    .header-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }
  }
}

// ===== 内容区域 =====
.content {
  margin: 0 auto;
  width: 980px;
  padding: 20px;
}

// ===== 日记卡片 =====
.diary-card {
  margin-bottom: 20px;
  background: white;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  .title {
    margin-bottom: 16px;
    font-size: 22px;
    font-weight: 600;
    color: #374151;
  }

  .section {
    margin-bottom: 20px;

    p {
      font-size: 15px;
      color: #6B7280;
      margin-bottom: 15px;
    }
  }
}

// ===== 星级评分（1-10） =====
.star-rating-row {
  display: flex;
  align-items: center;
  gap: 16px;

  .stars {
    display: flex;
    gap: 4px;

    .star {
      font-size: 32px;
      color: #d1d5db;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;

      &:hover {
        color: #fbbf24;
        transform: scale(1.15);
      }

      &.active {
        color: #f59e0b;
      }
    }
  }

  .emotion-label {
    font-size: 16px;
    color: #6b7280;
    font-weight: 500;
    padding: 4px 14px;
    background: #f3f4f6;
    border-radius: 20px;
  }
}

// ===== 主要情绪卡片网格（emoji） =====
.emotion-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  .emotion-card {
    padding: 20px 10px;
    border: 2px solid #E5E7EB;
    border-radius: 15px;
    text-align: center;
    cursor: pointer;
    background: #F9FAFB;
    transition: all 0.3s ease;

    &:hover {
      border-color: #a5d6a7;
      background: #f1f8e9;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 195, 74, 0.15);
    }

    &.selected {
      border-color: #8BC34A;
      background: #F1F8E9;
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(139, 195, 74, 0.25);
    }

    .emotion-img-wrapper {
      width: 48px;
      height: 48px;
      margin: 0 auto 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .emotion-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .emotion-name {
      font-size: 16px;
      color: #374151;
      font-weight: 500;
    }
  }
}

// ===== 详细信息表单 =====
.detail-form {
  .form-group {
    margin-bottom: 24px;

    .form-label {
      display: block;
      margin: 10px 0;
      font-size: 15px;
      font-weight: 600;
      color: #374151;
    }
  }

  .life-indicators {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;

    .indicator-group {
      flex: 1;

      .form-label {
        display: block;
        margin: 10px 0;
        font-size: 15px;
        font-weight: 600;
        color: #374151;
      }

      .indicator-select {
        width: 100%;
      }
    }
  }

  .action-buttons {
    margin-top: 40px;
    display: flex;
    gap: 16px;

    .btn-reset {
      padding: 12px 32px;
      font-size: 15px;
      border-radius: 6px;
      background: #fff;
      border: 1px solid #dcdfe6;
      color: #606266;

      &:hover {
        color: #409EFF;
        border-color: #c6e2ff;
        background: #ecf5ff;
      }
    }

    .btn-submit {
      padding: 12px 32px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 6px;
      background: #409EFF !important;
      border: none !important;

      &:hover {
        background: #66b1ff !important;
      }
    }
  }
}

// ===== 响应式适配 =====
@media (max-width: 1024px) {
  .header-section {
    padding: 28px 24px;
  }

  .content {
    width: 100%;
    padding: 16px;
  }

  .emotion-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .life-indicators {
    flex-direction: column;
  }
}
</style>
