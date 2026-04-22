<script setup lang="ts">
import Navbar from './Navbar.vue';
import Sidebar from './Sidebar.vue';

</script>

<template>
  <div class="backend-layout">
    <el-container class="main-container">
      <Sidebar />
      <el-container class="main-navbar" direction="vertical">
        <Navbar />

        <el-main class="main-content">
          <router-view class="content-container"></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<style lang="scss">
.backend-layout {
  height: 100vh;

  .el-header {
    height: 74px !important;
  }

  .main-container {
    height: 100%;

    .content-container {
      padding: 20px;
      background-color: #fff;
      min-height: calc(100% - 74px);
    }

  }
}
</style>