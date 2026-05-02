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
      config.headers['token'] = `Bearer ${token}`;
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
    // 对响应数据做点什么
    if (code == 200) {
      console.log("请求成功");
      return data;
    } else {
      if (code === -1) {
        if (!response.config.url?.includes("/user/login") && !response.config.url?.includes("/api/user/login")) {
          ElMessage.error("登录状态已过期，请重新登录");

          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          router.push("/login");
        }
      } else {
        ElMessage.error(message || "请求失败");
        return Promise.reject('请求失败');
      }
    }

  },
  (error) => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);


export default request;