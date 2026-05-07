import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router/router.js";


const request = axios.create({
  baseURL: "/api",
  timeout: 5000,
})


request.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem("token");
    if (token && !config.url?.includes('/user/login') && !config.url?.includes('/api/user/login')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    if (code == 200) {
      return data;
    }
    const isLoginPage = response.config.url?.includes('/user/login') || response.config.url?.includes('/api/user/login');
    const msg = message || '请求失败';
    if (!isLoginPage && (msg.includes('登录') || msg.includes('token') || msg.includes('Token') || msg.includes('认证'))) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      router.push("/auth/login");
    }
    ElMessage.error(msg);
    return Promise.reject(msg);
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default request;