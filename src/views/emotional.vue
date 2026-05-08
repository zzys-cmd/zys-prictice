<template>
  <div>
    <pagehead title="情绪日志" />

    <el-form ref="formRef" :model="formData">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="用户ID" prop="userId">
            <el-input
              v-model="formData.userId"
              placeholder="请输入用户ID"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="情绪评分" prop="scoreRange">
            <el-select
              v-model="formData.scoreRange"
              placeholder="选择评分范围"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="低分（1-3）" value="low" />
              <el-option label="中分（4-6）" value="mid" />
              <el-option label="高分（7-10）" value="high" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-row>
    </el-form>

    <el-table :data="tableData" style="width: 100%; margin-top: 20px">
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
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import pagehead from '@/components/pagehead.vue'
import { getEmotionDiaryPage } from '@/api/admin.js'
import { onMounted, reactive, ref } from 'vue'

const formRef = ref(null)
const formData = reactive({
  userId: '',
  scoreRange: '',
})

const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const scoreRangeMap = {
  '': { min: undefined, max: undefined },
  low: { min: 1, max: 3 },
  mid: { min: 4, max: 6 },
  high: { min: 7, max: 10 },
}

const fetchData = () => {
  const range = scoreRangeMap[formData.scoreRange] ?? scoreRangeMap['']
  getEmotionDiaryPage({
    current: currentPage.value,
    size: pageSize.value,
    userId: formData.userId || undefined,
    minMoodScore: range.min,
    maxMoodScore: range.max,
  }).then(res => {
    tableData.value = res.records ?? []
    total.value = res.total ?? 0
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
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
  // TODO: 待实现
}

const handleDelete = (row) => {
  // TODO: 待实现
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.stars {
  white-space: nowrap;
}

.star {
  color: #c0c4cc;
  font-size: 16px;
}

.star.filled {
  color: #f7ba2a;
}

.life-indicators {
  font-size: 13px;
}
</style>
