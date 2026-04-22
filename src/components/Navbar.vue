<template>
  <el-header class="el-header">
    <div class="navbar">
      <div class="flex-center">
        <el-button @click="handleCollapse">
          <el-icon>
            <Expand />
          </el-icon>
        </el-button>
        <p class="page-title">导航栏</p>
      </div>
      <div class="flex-center">
        <el-dropdown @command="handleCommand">

          <div class="flex-center">
            <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <p class="user-name">admin</p>
            <el-icon>
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>




        </el-dropdown>

      </div>
    </div>
  </el-header>
</template>


<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { useAdminStore } from '../stores/admin'
const handleCommand = (command) => {
  console.log(command)
}

const handleCollapse = () => {
  const adminStore = useAdminStore()
  adminStore.toggleCollapse()
} 
</script>
<style lang="scss" scoped>
.el-header {
  width: 100%;
}

.navbar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e5e7eb;

  .flex-center {

    display: flex;
    align-items: center;
    justify-content: center;

    .page-title {
      margin-left: 20px;
      font-size: 26px;
      font-weight: bold;
      color: #1f2937;
    }

    .user-name {
      margin: 0 5px;
      font-weight: bold;
    }
  }
}
</style>
