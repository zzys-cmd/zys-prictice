<script setup lang="ts"></script>

<template>
  <main class="page">
    <el-card class="card">
      <template #header>
        <span>Element Plus 已接入</span>
      </template>
      <div class="content">
        <el-button type="primary">Primary Button</el-button>
        <el-button>Default Button</el-button>
      </div>
    </el-card>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f5f7fa;
}

.card {
  width: min(100%, 480px);
}

.content {
  display: flex;
  gap: 12px;
}
</style>
