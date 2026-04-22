<template>
  <el-aside :width="isCollapse ? '64px' : '264px'">

    <el-menu :collapse="isCollapse" :collapse-transition="false" default-active="2" class="el-menu-vertical-demo">
      <div class="brand">
        <el-image style="width: 50px;height: 50px;margin-right: 10px;" :src="iconUrL" alt="logo" />
        <div v-show="!isCollapse" class="info-card">
          <h1 class="brand-title">心理健康助手</h1>
          <p class="brand-subtitle">管理后台</p>
        </div>
      </div>
      <el-menu-item @click="handleMenuClick" v-for="item in router.options.routes[0].children" :key="item.path" ,
        :index="item.path">
        <el-icon>
          <!-- 这里的item.meta.icon是字符串，不能直接当组件使用，所以需要用: is来动态绑定组件（动态组件） -->
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta.title }}</span>
      </el-menu-item>

    </el-menu>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from '../stores/admin'
import { useRouter } from 'vue-router'
const router = useRouter()
const iconUrL = new URL('../assets/images/机器人.png', import.meta.url).href
console.log(router, 'router')

const handleMenuClick = (key) => {
  router.push(`${router.options.routes[0].path}/${key.index}`)
}

const isCollapse = computed(() => {
  return useAdminStore().isCollapse
})
</script>
<style scoped lang="scss">
.el-menu-vertical-demo {
  height: 100%;

  .brand {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background-color: #fff;
    margin-bottom: 1px solid #e5e7eb;

    .info-card {
      .brand-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #1f2937;
      }
    }

    .brand-subtitle {
      font-size: 14px;
      color: #6b7280;
    }
  }
}
</style>