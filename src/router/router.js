
import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '../components/BackendLayout.vue'

const backroutes = [
  // {
  //   path: '/',
  //   redirect: '/back'
  // },
  {
    path: '/back',
    component: BackendLayout,
    children: [
      {
        path: 'dashboard',
        //name: 'Dashboard',
        component: () => import('../views/dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart'
        }

      },
      {
        path: 'knowledge',
        //name: 'Knowledge',
        component: () => import('../views/knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare'
        }
      },
      {
        path: 'consultations',
        //name: 'Consultations',
        component: () => import('../views/consultations.vue'),
        meta: {
          title: '咨询管理',
          icon: 'Message'
        }
      },
      {
        path: 'emotional',
        //name: 'Consultations',
        component: () => import('../views/emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'User'
        }
      }]
  },
  {
    path: '/auth',
    component: () => import('../components/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        //name: 'Login',
        component: () => import('../views/Login.vue'),
        mata: {
          title: '登录',
        }
      },
      {
        path: 'register',
        //name: 'Register',
        component: () => import('../views/Register.vue'),
        mata: {
          title: '注册',
        }
      }
    ]
  }


]




const router = createRouter({
  history: createWebHistory(),
  routes: backroutes
})

export default router