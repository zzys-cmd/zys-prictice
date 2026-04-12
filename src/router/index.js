
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
    children: []
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: backroutes
})

export default router