<template>
  <div class="frontend-layout">
    <!-- 顶部导航栏 -->
    <header class="navbar-wrapper">
      <div class="navbar-inner">
        <div class="brand-section">
          <img src="../assets/images/机器人.png" alt="logo" class="robot-logo" />
          <span class="brand-name">心理健康AI助手</span>
        </div>
        <nav class="nav-section">
          <router-link to="/home" class="nav-link">首页</router-link>
          <router-link v-if="!isLoggedIn" to="/knowledge-base" class="nav-link">知识库</router-link>
          <router-link v-if="isLoggedIn" to="/consultation" class="nav-link">AI咨询</router-link>
          <router-link v-if="isLoggedIn" to="/emotion-diary" class="nav-link">情绪日记</router-link>
          <router-link v-if="isLoggedIn" to="/knowledge-base" class="nav-link">知识库</router-link>
          <template v-if="!isLoggedIn">
            <router-link to="/auth/login" class="nav-link">登录</router-link>
            <router-link to="/auth/register" class="btn-register">注册</router-link>
          </template>
          <a v-else href="#" class="nav-link" @click.prevent="handleLogout">退出登录</a>
        </nav>
      </div>
    </header>

    <!-- 中部内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 底部页脚 -->
    <footer class="footer-container">
      <div class="footer-bottom">
        <p>&copy; 2026 心理健康AI助手. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

const token = localStorage.getItem('token')
const userInfo = localStorage.getItem('userInfo')
const isLoggedIn = ref(!!(token && userInfo))

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    isLoggedIn.value = false
    router.push('/home')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.frontend-layout {
  background-color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

// ===== 顶部导航 =====
.navbar-wrapper {
  width: 100%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  max-width: 1200px;
  height: 64px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .brand-section {
    display: flex;
    align-items: center;

    .robot-logo {
      width: 36px;
      height: 36px;
    }

    .brand-name {
      margin-left: 10px;
      font-size: 22px;
      font-weight: 700;
      color: #1f2937;
    }
  }

  .nav-section {
    display: flex;
    align-items: center;
    gap: 36px;

    .nav-link {
      color: #4b5563;
      font-size: 15px;
      text-decoration: none;

      &:hover {
        color: #4A90E2;
      }
    }

    .btn-register {
      font-size: 14px;
      color: #fff;
      background: #4A90E2;
      text-decoration: none;
      padding: 8px 24px;
      border-radius: 6px;

      &:hover {
        background: #357abd;
      }
    }
  }
}

// ===== 中部内容区 =====
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// ===== 底部页脚 =====
.footer-container {
  background: #1f2937;
  color: white;
  padding: 15px 0;
  margin-top: auto;

  .footer-bottom {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 10px;
    text-align: center;

    p {
      font-size: 13px;
      color: #9ca3af;
    }
  }
}

// ===== 响应式 =====
@media (max-width: 768px) {
  .navbar-inner {
    padding: 0 16px;
  }

  .nav-section {
    gap: 20px;
  }
}
</style>
