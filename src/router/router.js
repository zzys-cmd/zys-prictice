
import { createRouter, createWebHistory } from 'vue-router'

const backroutes = [
  // {
  //   path: '/',
  //   redirect: '/back'
  // },
  {
    path: '/back',
    redirect: '/back/dashboard',
    component: () => import('../components/BackendLayout.vue'),
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
const frontendRoutes = [
  {
    path: '/',
    component: () => import('../components/FrontendLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        component: () => import('../views/Home.vue')
      },
      {
        path: 'consultation',
        component: () => import('../views/consultation.vue')
      },
      {
        path: 'emotion-diary',
        component: () => import('../views/emotionDiary.vue')
      },
      {
        path: 'knowledge-base',
        component: () => import('../views/frontendknowledge.vue')
      }
    ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes: [...backroutes, ...frontendRoutes]
})


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (token) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo.userType == 2) {
      if (to.path.startsWith('/back')) {
        next()
      } else {
        next('/back/dashboard')
      }
    } else if (userInfo.userType == 1) {
      if (to.path.startsWith('/back') || to.path.startsWith('/auth')) {
        next('/home')
      } else {
        next()
      }
    }
  } else {
    if (to.path.startsWith('/back')) {
      next('/auth/login')
    } else {
      next()
    }
  }
}
)

export default router