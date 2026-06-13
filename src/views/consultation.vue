<template>
  <div class="consultation-container">
    <!-- ========== 左侧边栏 ========== -->
    <aside class="sidebar">
      <!-- AI 助手信息卡片 -->
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <img src="../assets/images/机器人.png" alt="AI助手" class="robot-avatar" />
        </div>
        <h3 class="assistant-name">宁渡AI助手</h3>
        <div class="online-status">
          <span class="status-dot"></span>
          在线服务中
        </div>
      </div>

      <!-- 情绪花园 -->
      <div class="emotion-garden">
        <div class="garden-header">
          <div class="garden-title">
            <span>🌻</span>
            <span>情绪花园</span>
          </div>
          <span class="garden-date">{{ today }}</span>
        </div>

        <!-- 情绪仪表盘 -->
        <div class="emotion-info" :style="emotionCircleStyle">
          <span class="emotion-name">{{ emotionData.emotionName }}</span>
          <span class="emotion-score">{{ emotionData.emotionScore }}</span>
        </div>

        <div class="warm-tips">
          <!-- 情绪状态文案 -->
          <div class="emotion-status-text">
            <span class="status-label">今天感觉</span>
            <span class="status-emotion" :style="sentimentStyle">{{ emotionData.sentimentText }}</span>
          </div>

          <!-- 情绪强度 -->
          <div class="emotion-intensity">
            <div class="intensity-dots">
              <span v-for="i in 3" :key="i" class="dot" :class="{ active: i <= emotionData.emotionIntensity }"></span>
            </div>
            <span class="intensity-text">{{ emotionData.intensityText }}</span>
          </div>

          <!-- 温暖建议 -->
          <div class="warm-suggestion">
            <span class="suggestion-icon">❤️</span>
            <div class="suggestion-content">
              <div class="suggestion-title">给你的小建议</div>
              <div class="suggestion-text">{{ emotionData.suggestDescription }}</div>
            </div>
          </div>

          <!-- 疗愈行动 -->
          <div class="healing-actions" v-if="emotionData.healingActions.length > 0">
            <div class="actions-title">
              <span>✨</span>
              <span>今日疗愈行动</span>
            </div>
            <div class="actions-list">
              <div v-for="(action, index) in emotionData.healingActions" :key="index" class="action-item">
                <span class="action-icon">{{ action.icon || '🌸' }}</span>
                <span class="action-text">{{ action.text || action }}</span>
              </div>
            </div>
          </div>

          <!-- 风险提示（isNegative为真且riskLevel>1时显示） -->
          <div v-if="emotionData.isNegative && emotionData.riskLevel > 1" class="risk-notice">
            <span class="notice-icon">⚠️</span>
            <div class="notice-content">
              <div class="notice-title">温馨提示</div>
              <div class="notice-text">{{ emotionData.riskDescription }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 会话历史 -->
      <div class="session-history">
        <div class="section-title">
          <span>会话历史</span>
          <span class="new-session-btn" title="新建会话" @click="handleNewSession">+</span>
        </div>
        <div class="session-list">
          <p v-if="sessionList.length === 0" class="no-sessions-text">暂无会话记录</p>
          <div v-for="session in sessionList" :key="session.id" class="session-item"
            :class="{ active: session.id === currentSessionId }" @click="handleSwitchSession(session)">
            <div class="session-info">
              <div class="session-sender">{{ session.sender }}</div>
              <div class="session-time">{{ formatDateTime(session.createTime) }}</div>
              <div class="session-time secondary">{{ formatDateTime2(session.createTime) }}</div>
              <div class="session-preview">{{ session.lastMessage }}</div>
              <div class="session-meta">
                <span class="meta-comments">
                  <span class="meta-icon">💬</span>
                  {{ session.messageCount }}
                </span>
                <span v-if="session.duration" class="meta-duration">
                  <span class="meta-icon">⏱️</span>
                  {{ formatDuration(session.duration) }}
                </span>
              </div>
            </div>
            <div class="session-actions">
              <button class="btn-delete-session" title="删除会话" @click.stop="handleDeleteSession(session)">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ========== 右侧聊天主区域 ========== -->
    <main class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <img src="../assets/images/机器人.png" alt="助手头像" />
          </div>
          <div class="chat-info">
            <h2>宁渡AI助手</h2>
            <p>您的贴心AI心理健康助手</p>
          </div>
        </div>
        <div class="header-right">
          <button class="btn-new-chat" title="新建对话" @click="handleNewSession">+</button>
        </div>
      </div>

      <!-- 聊天消息区 -->
      <div class="chat-messages" ref="messagesContainer">
        <!-- 欢迎消息（无会话时） -->
        <div v-if="messages.length === 0" class="message-item ai-message">
          <div class="message-avatar">
            <img src="../assets/images/机器人.png" alt="AI" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>您好！我是小暖，您的AI心理健康助手。很高兴陪伴您，为您提供温暖的心理支持。请告诉我，今天您感觉怎么样？有什么想要分享的吗？</p>
            </div>
            <div class="message-time">刚刚</div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-for="msg in messages" :key="msg.id" class="message-item"
          :class="msg.role === 'ai' ? 'ai-message' : 'user-message'">
          <div class="message-avatar">
            <img v-if="msg.role === 'ai'" src="../assets/images/机器人.png" alt="AI" />
            <img v-else src="../assets/images/users.png" alt="用户" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <MarkdownRenderer v-if="msg.role === 'ai'" :content="msg.content" :is-ai-message="true" />
              <p v-else>{{ msg.content }}</p>
            </div>
            <div class="message-time">{{ msg.time }}</div>
          </div>
        </div>

        <!-- 加载中（等会话创建） -->
        <div v-if="loading && !streaming" class="message-item ai-message">
          <div class="message-avatar">
            <img src="../assets/images/机器人.png" alt="AI" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input v-model="inputText" type="textarea" :rows="2" placeholder="请输入您想要分享的内容..." resize="none"
            maxlength="500" @keydown.enter.exact.prevent="handleSend" />
          <div class="input-footer">
            <span>按Enter发送，Shift+Enter换行</span>
            <span>{{ inputText.length }}/500</span>
          </div>
        </div>
        <el-button class="send-btn" :loading="loading" @click="handleSend">
          <el-icon size="22">
            <Promotion />
          </el-icon>
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed, onMounted } from 'vue'
import { Promotion } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { startSession, getConsultationList, deleteSession, getSessionMessages, getSessionEmotion } from '@/api/admin.js'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const inputText = ref('')
const loading = ref(false)
const streaming = ref(false)
const currentSessionId = ref(null)
const messagesContainer = ref(null)
// 消息列表
const messages = ref([])

// 情绪分析数据
const emotionData = reactive({
  emotionName: '中性',
  emotionScore: 50,
  feelingDescription: '很不错',
  sentimentText: '很不错',
  emotionIntensity: 1,
  intensityText: '一般',
  suggestDescription: '情绪状态平稳，继续保持良好的心态，适当进行一些户外活动会让心情更好哦。',
  healingActions: [],
  riskDescription: '',
  isNegative: false,
  riskLevel: 0
})

// 本地会话列表（用于左侧展示）
const sessionList = reactive([])

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// 情绪仪表盘背景色（根据分数）
const emotionCircleStyle = computed(() => {
  const score = emotionData.emotionScore
  if (score >= 70) return { background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)' }
  if (score >= 40) return { background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)' }
  return { background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)' }
})

// 今天感觉标签样式
const sentimentStyle = computed(() => {
  if (emotionData.isNegative) return { background: '#fee2e2', color: '#dc2626' }
  return { background: '#fef3c7', color: '#d4840f' }
})

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 获取会话列表
const fetchSessions = async () => {
  try {
    const res = await getConsultationList({ pageNum: '1', pageSize: '50' })
    const list = res.records || res.list || []
    sessionList.length = 0
    list.forEach(item => {
      sessionList.push({
        id: item.id,
        title: item.sessionTitle || '新会话',
        sender: item.sessionTitle || 'zysAI助手',
        lastMessage: item.lastMessageContent || '',
        messageCount: item.messageCount || 0,
        duration: item.durationMinutes || 0,
        createTime: item.startedAt || item.lastMessageTime || '',
        lastMessageTime: item.lastMessageTime || '',
        userId: item.userId,
        userNickname: item.userNickname || ''
      })
    })
  } catch (e) {
    // 静默失败，不影响使用
  }
}

// 获取会话情绪分析数据
const fetchEmotionData = async (sessionId) => {
  if (!sessionId) return
  // 确保 sessionId 以 'session_' 开头
  const normalizedId = String(sessionId).startsWith('session_') ? String(sessionId) : 'session_' + sessionId
  try {
    const res = await getSessionEmotion(normalizedId)
    if (res) {
      emotionData.emotionName = res.emotionName || res.name || '中性'
      emotionData.emotionScore = res.emotionScore ?? res.score ?? 50
      emotionData.feelingDescription = res.feelingDescription || res.sentimentText || '很不错'
      emotionData.sentimentText = res.sentimentText || res.feelingDescription || '很不错'
      emotionData.emotionIntensity = res.emotionIntensity ?? res.intensity ?? 1
      emotionData.intensityText = res.intensityText || '一般'
      emotionData.suggestDescription = res.suggestDescription || res.suggestion || '情绪状态平稳，继续保持良好的心态。'
      emotionData.healingActions = res.healingActions || res.actions || []
      emotionData.riskDescription = res.riskDescription || ''
      emotionData.isNegative = res.isNegative === true || res.isNegative === 1
      emotionData.riskLevel = res.riskLevel ?? 0
    }
  } catch (e) {
    // 静默失败，使用默认值
  }
}

// 格式化时长（分钟）
const formatDuration = (minutes) => {
  if (!minutes) return null
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
  }
  return `${minutes}分钟`
}

// 格式化日期时间（斜杠格式）
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 格式化日期时间（横线格式）
const formatDateTime2 = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}
// 新建会话
const handleNewSession = () => {
  currentSessionId.value = null
  messages.value = []
  inputText.value = ''
}

// 发送消息
const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text || loading.value || streaming.value) return

  // 添加用户消息
  const userMsg = {
    id: Date.now(),
    role: 'user',
    content: text,
    time: formatTime(new Date())
  }
  messages.value.push(userMsg)
  inputText.value = ''
  scrollToBottom()

  loading.value = true
  streaming.value = true

  // 创建 AI 消息占位
  const aiMsgId = Date.now() + 1
  const aiMsg = reactive({
    id: aiMsgId,
    role: 'ai',
    content: '',
    time: formatTime(new Date())
  })
  messages.value.push(aiMsg)
  scrollToBottom()

  const token = localStorage.getItem('token')

  try {
    // 首次发送 → 先创建会话拿到 sessionId
    if (!currentSessionId.value) {
      const sessionTitle = text.length > 20 ? text.slice(0, 20) + '...' : text
      const res = await startSession({
        initialMessage: text,
        sessionTitle: sessionTitle
      })
      currentSessionId.value = res.sessionId || res.id
      fetchSessions()
    }

    // 流式请求（首条走 /stream 获取 AI 回复）
    await fetchEventSource('/api/psychological-chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        sessionId: String(currentSessionId.value),
        userMessage: text
      }),
      onopen: async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
      },
      onmessage: (event) => {
        // event:error → 异常, event:done → 结束, event:message → token
        if (event.event === 'error') {
          let errMsg = '对话服务异常'
          try {
            const d = JSON.parse(event.data)
            errMsg = d.msg || d.message || errMsg
          } catch { }
          throw new Error(errMsg)
        }
        if (event.event === 'done') {
          return
        }
        if (event.data) {
          // data 格式: {"code":"200","data":{"type":"normal","content":"文本片段"}}
          try {
            const d = JSON.parse(event.data)
            const token = d.data?.content || d.content || ''
            aiMsg.content += token
          } catch {
            aiMsg.content += event.data
          }
          scrollToBottom()
        }
      },
      onerror: (err) => {
        throw err
      }
    })

    // 流结束，如果为空则给默认回复
    if (!aiMsg.content) {
      aiMsg.content = '收到您的消息，我会认真倾听。'
    }
    // 刷新情绪分析数据
    if (currentSessionId.value) {
      fetchEmotionData(currentSessionId.value)
    }
  } catch (e) {
    // 移除空的 AI 消息
    const idx = messages.value.findIndex(m => m.id === aiMsgId)
    if (idx !== -1) {
      messages.value.splice(idx, 1)
    }
    ElMessage.error('发送失败，请稍后重试')
  } finally {
    loading.value = false
    streaming.value = false
  }
}

// 切换会话
const handleSwitchSession = async (session) => {
  currentSessionId.value = session.id
  messages.value = []
  loading.value = true
  try {
    const list = await getSessionMessages(session.id)
    messages.value = list.map(msg => ({
      id: msg.id,
      role: msg.senderType === 1 ? 'user' : 'ai',
      content: msg.content,
      time: formatTime(new Date(msg.createdAt))
    }))
    fetchEmotionData(session.id)
    scrollToBottom()
  } catch (e) {
    ElMessage.error('加载消息失败')
  } finally {
    loading.value = false
  }
}

// 删除会话
const handleDeleteSession = async (session) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除会话"${session.title}"吗？删除后不可恢复。`,
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await deleteSession(session.id)
    // 如果删除的是当前会话，重置
    if (currentSessionId.value === session.id) {
      handleNewSession()
    }
    // 刷新列表
    await fetchSessions()
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

onMounted(() => {
  fetchSessions()
})

const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
</script>

<style lang="scss" scoped>
// ===== 动画 =====
@keyframes breathing {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {

  0%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }

  50% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

// ===== 容器 =====
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;
}

// ===== 左侧边栏 =====
.sidebar {
  width: 320px;
  flex-shrink: 0;
}

// ===== AI助手信息卡 =====
.ai-assistant-info {
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(251, 146, 60, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  .breathing-circle {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    animation: breathing 4s ease-in-out infinite;
    box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
    position: relative;

    .robot-avatar {
      width: 36px;
      height: 36px;
    }
  }

  .assistant-name {
    font-size: 16px;
    font-weight: 700;
    background: linear-gradient(135deg, #fb923c, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
    background-clip: text;
    margin: 0 0 12px;
  }

  .online-status {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #059669;
    font-size: 12px;
    font-weight: 600;

    .status-dot {
      width: 8px;
      height: 8px;
      background: #059669;
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 2s infinite;
      box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
    }
  }
}

// ===== 情绪花园 =====
.emotion-garden {
  background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  min-height: 300px;

  .garden-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    position: relative;
    z-index: 2;

    .garden-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #8b4513;
    }

    .garden-date {
      font-size: 12px;
      color: #999;
    }
  }

  .emotion-info {
    margin: 0 auto 16px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.8);
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
    color: #fff;

    .emotion-name {
      font-size: 15px;
      font-weight: 600;
      line-height: 1;
      margin-bottom: 2px;
    }

    .emotion-score {
      font-size: 14px;
      font-weight: 700;
      opacity: 0.9;
    }
  }

  .warm-tips {
    text-align: center;

    .emotion-status-text {
      margin-bottom: 12px;

      .status-label {
        font-size: 14px;
        color: #8b7355;
        margin-right: 8px;
      }

      .status-emotion {
        font-size: 16px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 16px;
        display: inline-block;
      }
    }

    .emotion-intensity {
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .intensity-dots {
        display: flex;
        gap: 4px;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e0e0e0;
          transition: all 0.3s ease;

          &.active {
            background: linear-gradient(135deg, #ff9a9e, #fecfef);
            transform: scale(1.2);
            box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
          }
        }
      }

      .intensity-text {
        font-size: 12px;
        color: #8b7355;
        font-weight: 500;
      }
    }

    .warm-suggestion {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
      border-radius: 16px;
      padding: 12px;
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

      .suggestion-icon {
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .suggestion-content {
        text-align: left;
        flex: 1;

        .suggestion-title {
          font-size: 14px;
          font-weight: 600;
          color: #8b7355;
          margin-bottom: 6px;
        }

        .suggestion-text {
          font-size: 13px;
          color: #6b5b47;
          line-height: 1.5;
        }
      }
    }

    .healing-actions {
      margin-bottom: 16px;

      .actions-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #8b7355;
        margin-bottom: 16px;
      }

      .actions-list {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .action-item {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          text-align: left;

          .action-icon {
            font-size: 14px;
            color: #ffd700;
            flex-shrink: 0;
          }

          .action-text {
            font-size: 12px;
            color: #6b5b47;
            line-height: 1.4;
            flex: 1;
          }
        }
      }
    }

    .risk-notice {
      background: linear-gradient(135deg, #fff9e6, #ffeaa7);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      border: 1px solid rgba(255, 234, 167, 0.6);
      box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);

      .notice-icon {
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .notice-content {
        flex: 1;

        .notice-title {
          font-size: 14px;
          font-weight: 600;
          color: #d4840f;
          margin-bottom: 6px;
        }

        .notice-text {
          font-size: 13px;
          color: #b8740c;
          line-height: 1.5;
        }
      }
    }
  }
}

// ===== 会话历史 =====
.session-history {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  min-height: 250px;
  display: flex;
  flex-direction: column;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .new-session-btn {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: linear-gradient(135deg, #fb923c, #f59e0b);
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: none;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(251, 146, 60, 0.3);
      }
    }
  }

  .session-list {
    overflow-y: auto;
    max-height: 200px;
    scrollbar-width: thin;
    scrollbar-color: rgba(64, 150, 255, 0.3) transparent;

    .session-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        background: #f8f9ff;
        border-color: #e6f0ff;
      }

      &.active {
        background: #e6f0ff;
        border-color: #4096ff;
      }

      .session-info {
        flex: 1;
        min-width: 0;

        .session-sender {
          font-weight: 500;
          font-size: 14px;
          color: #333;
          margin-bottom: 2px;
        }

        .session-time {
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;

          &.secondary {
            font-size: 11px;
            color: #94a3b8;
          }
        }

        .session-preview {
          font-size: 12px;
          color: #475569;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .session-meta {
          display: flex;
          align-items: center;
          gap: 14px;

          .meta-comments,
          .meta-duration {
            font-size: 12px;
            color: #94a3b8;
            display: flex;
            align-items: center;
            gap: 4px;

            .meta-icon {
              font-size: 13px;
            }
          }
        }
      }

      .session-actions {
        position: absolute;
        top: 12px;
        right: 12px;

        .btn-delete-session {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          opacity: 0.6;
          transition: all 0.2s;

          &:hover {
            opacity: 1;
            background: rgba(239, 68, 68, 0.1);
          }
        }
      }
    }

    .no-sessions-text {
      text-align: center;
      font-size: 14px;
      color: #999;
    }
  }
}

// ===== 聊天主区域 =====
.chat-main {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(251, 146, 60, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

// ===== 聊天头部 =====
.chat-header {
  background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;

    .chat-avatar {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 1;

      img {
        width: 30px;
        height: 30px;
      }
    }

    .chat-info {
      h2 {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 4px;
      }

      p {
        font-size: 14px;
        margin: 0;
        opacity: 0.9;
      }
    }
  }

  .header-right {
    .btn-new-chat {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      border: none;
      color: #fff;
      font-size: 22px;
      font-weight: 300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.4);
        transform: rotate(90deg);
      }
    }
  }
}

// ===== 聊天消息区 =====
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
  min-height: 0;
  max-height: calc(100vh - 200px);
  scrollbar-width: thin;
  scrollbar-color: rgba(251, 146, 60, 0.3) transparent;

  .message-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
      flex-shrink: 0;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &.ai-message .message-avatar {
      background: linear-gradient(135deg, #fb923c, #f59e0b);
      box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
    }

    &.user-message .message-avatar {
      background: linear-gradient(135deg, #6b7280, #4b5563);
      box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
    }

    .message-content {
      max-width: 70%;

      .message-bubble {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
        border-radius: 16px;
        padding: 12px 16px;
        position: relative;
        animation: fadeInUp 0.4s ease-out;
        border: 1px solid rgba(251, 146, 60, 0.1);
        box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);

        p {
          margin: 0;
          font-size: 14px;
          color: #333;
          line-height: 1.6;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;

          .typing-dot {
            width: 8px;
            height: 8px;
            background: #ccc;
            border-radius: 50%;
            animation: typing 1.5s ease-in-out infinite;

            &:nth-child(2) {
              animation-delay: 0.2s;
            }

            &:nth-child(3) {
              animation-delay: 0.4s;
            }
          }
        }
      }

      .message-time {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }
}

// ===== 输入区域 =====
.chat-input {
  border-top: 1px solid rgba(251, 146, 60, 0.1);
  padding: 20px 24px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
  backdrop-filter: blur(10px);
  flex-shrink: 0;

  .input-container {
    flex: 1;
  }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #78716c;
    font-weight: 500;
    margin-top: 4px;
  }

  .send-btn {
    height: 60px;
    width: 60px;
    border-radius: 16px;
    background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
    border: none !important;
    box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 24px rgba(251, 146, 60, 0.35);
    }

    :deep(.el-icon) {
      color: #fff;
    }
  }
}
</style>
