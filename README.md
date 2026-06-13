# 宁渡 — AI 心理健康助手

> 每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心的连接温暖您的每一天。

一个基于 Vue 3 的全栈心理健康支持平台，提供 AI 智能咨询、情绪日记记录、心理健康知识库以及后台数据管理功能。

---

## 项目概览

本项目是一个前后端分离的 Web 应用，前端采用 Vue 3 + Element Plus 构建，后端 API 通过 Vite 代理转发。系统分为**用户端**和**管理后台**两套界面，通过用户角色（userType）自动路由分发。

### 用户端（普通用户）

| 模块 | 说明 |
|------|------|
| **首页** | 品牌展示页，引导用户进入 AI 咨询或情绪记录 |
| **AI 咨询** | 基于 SSE 流式响应的 AI 心理健康对话，左侧展示实时情绪分析（情绪花园）和会话历史 |
| **情绪日记** | 星级评分（1-10）、8 种情绪卡片选择、触发因素、睡眠质量、压力水平等维度的每日心情记录 |
| **知识库** | 心理健康文章浏览，支持分类筛选、推荐阅读排行榜、Markdown 渲染的文章详情页 |

### 管理后台（管理员）

| 模块 | 说明 |
|------|------|
| **数据分析** | ECharts 可视化仪表盘：情绪趋势折线图、咨询会话柱状图、用户活跃度趋势图，以及总用户数/日志数/会话数/平均情绪等统计卡片 |
| **知识文章** | 文章 CRUD 管理，WangEditor 富文本编辑器，封面图片上传，发布/草稿/下线状态切换，分类与标题搜索 |
| **咨询管理** | 查看所有用户咨询会话列表，点击详情查看完整对话记录 |
| **情绪日志** | 查看所有用户情绪日记，支持按 ID 和评分范围筛选，详情弹窗展示 AI 分析结果（情绪类型、风险等级、专业建议等） |

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建工具 | Vite 7 |
| 语言 | JavaScript / TypeScript |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4（含路由守卫） |
| HTTP 客户端 | Axios（拦截器统一处理 Token 和错误） |
| 流式通信 | `@microsoft/fetch-event-source`（SSE） |
| 图表 | ECharts 6 |
| 富文本编辑器 | WangEditor 5 |
| CSS 预处理 | Sass / SCSS |
| Markdown 渲染 | 自研 `MarkdownRenderer` 组件 |

---

## 项目结构

```
hello_vue3/
├── index.html                        # 入口 HTML
├── vite.config.ts                    # Vite 配置（代理、别名）
├── package.json
├── tsconfig.json
├── src/
│   ├── main.js                       # 应用入口，注册插件
│   ├── App.vue                       # 根组件（router-view）
│   ├── style.css                     # 全局样式重置
│   ├── config/
│   │   └── index.js                  # 静态资源配置（文件服务器地址）
│   ├── router/
│   │   └── router.js                 # 路由定义 + 导航守卫（角色判断）
│   ├── stores/
│   │   └── admin.js                  # Pinia store（侧边栏折叠状态）
│   ├── utils/
│   │   └── request.js                # Axios 实例（请求/响应拦截器）
│   ├── api/
│   │   └── admin.js                  # 全部 API 接口封装
│   ├── components/
│   │   ├── FrontendLayout.vue        # 用户端布局（导航栏 + 内容区 + 页脚）
│   │   ├── BackendLayout.vue         # 后台布局（侧边栏 + 顶栏 + 内容区）
│   │   ├── AuthLayout.vue            # 登录/注册布局（左右分栏）
│   │   ├── Sidebar.vue               # 后台侧边栏导航
│   │   ├── Navbar.vue                # 后台顶栏（面包屑 + 用户下拉菜单）
│   │   ├── pagehead.vue              # 页面标题组件
│   │   ├── TableSearch.vue           # 通用搜索表单组件
│   │   └── MarkdownRenderer.vue      # Markdown → HTML 渲染组件
│   ├── views/
│   │   ├── Home.vue                  # 用户端首页
│   │   ├── consultation.vue          # AI 咨询对话页（核心页面）
│   │   ├── emotionDiary.vue          # 情绪日记填写页
│   │   ├── frontendknowledge.vue     # 用户端知识库（列表 + 详情）
│   │   ├── Login.vue                 # 登录页
│   │   ├── Register.vue              # 注册页
│   │   ├── dashboard.vue             # 管理后台数据分析
│   │   ├── knowledge.vue             # 管理后台文章管理
│   │   ├── consultations.vue         # 管理后台咨询记录
│   │   └── emotional.vue             # 管理后台情绪日志
│   └── assets/
│       └── images/                   # 情绪图标、机器人头像等静态资源
```

---

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- npm 或 pnpm

### 安装依赖

```sh
npm install
```

### 启动开发服务器

```sh
npm run dev
```

浏览器将自动打开 `http://localhost:5173`，开发服务器配置了热更新（HMR）。

### 构建生产版本

```sh
npm run build
```

该命令会先执行 TypeScript 类型检查（`vue-tsc`），然后通过 Vite 编译打包。

### 预览生产构建

```sh
npm run preview
```

---

## API 代理

开发环境下，所有 `/api` 前缀的请求会被代理到后端服务器：

```
/api  →  http://159.75.169.224:1235
```

文件上传的基础 URL 配置在 `src/config/index.js`。

---

## 路由设计

### 用户端路由（`/`）

| 路径 | 页面 | 说明 |
|------|------|------|
| `/home` | 首页 | 品牌展示 |
| `/consultation` | AI 咨询 | 需登录 |
| `/emotion-diary` | 情绪日记 | 需登录 |
| `/knowledge-base` | 知识库 | 公开访问 |
| `/auth/login` | 登录 | - |
| `/auth/register` | 注册 | - |

### 后台路由（`/back`）

| 路径 | 页面 | 说明 |
|------|------|------|
| `/back/dashboard` | 数据分析 | 默认后台首页 |
| `/back/knowledge` | 知识文章 | CRUD 管理 |
| `/back/consultations` | 咨询管理 | 会话记录 |
| `/back/emotional` | 情绪日志 | 日记管理 |

### 导航守卫逻辑

- 未登录 → 访问后台页面 → 重定向到 `/auth/login`
- 已登录 + userType=1（普通用户） → 访问后台/登录页 → 重定向到 `/home`
- 已登录 + userType=2（管理员） → 访问用户端页面 → 重定向到 `/back/dashboard`

---

## 核心功能详解

### AI 智能咨询

1. 用户输入消息 → 首次发送时自动创建会话
2. 通过 SSE（Server-Sent Events）流式接收 AI 回复，实时逐字渲染
3. 左侧边栏展示：
   - **AI 助手信息卡**：品牌形象 + 在线状态
   - **情绪花园**：会话情绪分析结果（情绪名称、评分、强度、温暖建议、疗愈行动、风险提示）
   - **会话历史**：支持切换和删除历史会话

### 情绪日记

- **10 级星级评分**：1-10 分对应从"绝望崩溃"到"极致幸福"的描述
- **8 种情绪卡片**：开心、平静、焦虑、悲伤、兴奋、疲惫、惊讶、困惑
- **详细记录**：情绪触发因素、今日感想、睡眠质量（1-5）、压力水平（1-10）
- 提交后后端 AI 会生成情绪分析结果（管理员可在后台查看）

### 知识文章管理

- **富文本编辑**：基于 WangEditor，支持复杂排版
- **封面图上传**：支持点击上传或手动输入 URL
- **文章状态**：已发布 / 草稿 / 已下线
- **用户端展示**：分类标签筛选、推荐阅读排行榜、Markdown 详情页

---

## 开发说明

- 使用 Vue 3 Composition API 和 `<script setup>` 语法糖
- Element Plus 图标通过全局注册，可直接在模板中使用
- Axios 响应拦截器已统一处理 `code === 200` 的数据解包和 Token 过期跳转
- 路径别名 `@` 指向 `src/` 目录
- Bootstrap: `src/main.js` → 注册 Element Plus、Router、Pinia → 挂载 `#app`
