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
import { onMounted, ref } from 'vue';
import { getConsultationList } from '@/api/admin.js';

const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

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

const handleDetail = () => {

}
</script>