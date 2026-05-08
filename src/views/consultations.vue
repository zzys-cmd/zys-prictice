<template>
  <div>
    <pagehead title="咨询记录" />
    <el-table :data="tableData" style="width: 100%">
      <el-table-column label="会话ID" width="200">
        <template #default="scope">
          <el-avatar>
            {{ scope.row.userNickname }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="情绪日志">
        <template #default="scope">
          <div class="session-title">{{ scope.row.sessionTitle }}</div>
          <div class="session-preview">{{ scope.row.lastMessageContent }}</div>
        </template>
      </el-table-column>
      <el-table-column label="消息数" prop="messageCount" width="100" />
      <el-table-column label="时间" prop="startedAt" width="100" />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next" @current-change="onPageChange"
        @size-change="onSizeChange" />
    </div>

    <!-- 会话详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="咨询会话详情" width="600px" @close="handleCloseDialog">
      <div v-if="sessionDetail" class="session-info">
        <div class="info-row">
          <span class="info-label">用户：</span>
          <span>{{ sessionDetail.userNickname }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">开始时间：</span>
          <span>{{ sessionDetail.startedAt }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">消息数：</span>
          <span>{{ sessionDetail.messageCount }}</span>
        </div>
      </div>

      <el-divider />

      <div class="message-title">对话记录</div>
      <div class="message-list">
        <div v-for="(msg, index) in messageList" :key="msg.id ?? index"
          :class="['message-item', msg.senderType === 1 ? 'user' : 'assistant']">
          <div class="message-header">
            <div class="message-role">{{ msg.senderType === 1 ? '用户' : 'AI助手' }}</div>
            <div class="message-time">{{ msg.createdAt }}</div>
          </div>
          <div class="message-content">{{ msg.content }}</div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import pagehead from '@/components/pagehead.vue'
import { onMounted, ref } from 'vue';
import { getConsultationList, getSessionMessages } from '@/api/admin.js';

const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 弹窗相关
const dialogVisible = ref(false);
const sessionDetail = ref(null);
const messageList = ref([]);

const fetchData = () => {
  getConsultationList({
    currentPage: currentPage.value,
    size: pageSize.value,
  }).then(res => {
    tableData.value = res.records ?? [];
    total.value = res.total ?? 0;
  });
}

const onPageChange = (page) => {
  currentPage.value = page;
  fetchData();
}

const onSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchData();
}

onMounted(() => {
  fetchData();
});

const handleDetail = (row) => {
  sessionDetail.value = row;
  getSessionMessages(row.id).then(res => {
    // request 响应拦截器已返回 data 内容，避免再读取 res.data
    messageList.value = res.records ?? res.messages ?? res.data ?? res ?? [];
  });
  dialogVisible.value = true;
}

const handleCloseDialog = () => {
  dialogVisible.value = false;
}
</script>

<style scoped>
.session-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
  gap: 10px;
}

.info-label {
  font-weight: bold;
  min-width: 80px;
}

.message-title {
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 14px;
}

.message-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  padding: 14px;
  border-radius: 12px;
  max-width: 80%;
  word-break: break-word;
  background-color: #f5f5f5;
  align-self: flex-start;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-item.user {
  align-self: flex-start;
  background-color: #e8f5ff;
}

.message-item.assistant {
  align-self: flex-end;
  background-color: #f4f7f9;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.message-role {
  font-weight: 600;
  font-size: 12px;
  color: #4a4a4a;
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.dialog-footer {
  text-align: right;
}
</style>