<template>
  <div class="container">
    <div class="title">
      <div class="back-home">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回首页</span>
      </div>
      <div class="title-text">
        <h2>登录您的账户</h2>
        <p>请输入您的登录信息</p>
      </div>
    </div>
    <div class="form-container">
      <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-position="top">
        <el-form-item label="用户名或邮箱" prop="username">
          <el-input v-model="formData.username" size="large" placeholder="请输入用户名或邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" size="large" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button class="btn" type="primary" size="large" @click="submitForm(ruleFormRef)">登录</el-button>
        <p>还没有账户？<router-link to="/register">去注册</router-link></p>
      </div>
    </div>
  </div>

</template>

<script setup lang="js">
import { Back } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref } from 'vue'
import { getAdminList } from '../api/admin'
import { useRouter } from 'vue-router'
const router = useRouter()
const formData = ref({
  username: '',
  password: ''
})
const submitForm = async (formEL) => {
  if (!formEL) return
  try {
    await formEL.validate()
    const res = await getAdminList(formData.value)
    if (!res?.token) {
      ElMessage.error('登录失败: 返回数据缺少 token')
      return
    }
    localStorage.setItem('token', res.token)
    localStorage.setItem('userInfo', JSON.stringify(res.userInfo))
    ElMessage.success('登录成功')
    if (res.userInfo.userType === 2) {
      router.push('/back/dashboard')
    } else {
      router.push('/')
    }
  } catch (error) {
    ElMessage.error(typeof error === 'string' ? error : '登录失败，请检查用户名和密码')
  }


}
const ruleFormRef = ref()

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}
</script>
<style lang="scss" scoped>
.container {
  width: 384px;

  .title {
    .back-home {
      margin-bottom: 60px;
    }

    .title-text {
      text-align: center;

      h2 {
        font-size: 36px;
        margin-bottom: 10px;
      }

      p {
        font-size: 18px;
        color: #6b7280;
      }
    }
  }

  .form-container {
    .footer {
      margin-top: 30px;
      text-align: center;

      .btn {
        width: 100%;
        margin-bottom: 20px;
      }

      .footer {
        padding: 30px;
        text-align: center;
      }
    }
  }
}
</style>
