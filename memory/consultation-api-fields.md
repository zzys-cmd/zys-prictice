---
name: consultation-api-fields
description: 心理聊天API的请求参数和响应字段（已通过真实请求验证）
metadata:
  type: reference
---

## 获取会话列表 GET `/psychological-chat/sessions`

Query: `pageNum` (string, 必需), `pageSize` (string, 必需)

响应（axios拦截器解包后 = data.data）:
- `records` — 数组，每项: `id`, `userId`, `userNickname`, `sessionTitle`, `startedAt`, `lastMessageContent`, `lastMessageTime`, `durationMinutes`, `messageCount`
- `total`, `size`, `current`, `pages`

## 创建会话 POST `/psychological-chat/session/start`

请求: `initialMessage` (string), `sessionTitle` (string)

响应（拦截器解包后 = data.data）:
- `sessionId` (string, "session_14348")
- `status` (string, "ACTIVE")
- `initialMessage`, `startTime`, `expiryTime`, `messageCount`, `userHash`

**注意：不返回 reply/aiMessage，AI回复必须通过 /stream 获取**

## 流式对话 POST `/psychological-chat/stream`

Header: `Authorization: Bearer <token>`, `Accept: text/event-stream`, `Content-Type: application/json`
Body: `sessionId` (string), `userMessage` (string)

SSE 事件格式:
- `event:message` → `data:{"code":"200","data":{"type":"normal","content":"文本token"}}`
  - 内容在 JSON.parse(event.data).data.content
- `event:error` → `data:{"code":"-1","msg":"错误信息"}`
- `event:done` → `data:{}`

## 删除会话 DELETE `/psychological-chat/sessions/{sessionId}`

Path: `sessionId` (string, 必需)

## 获取会话消息 GET `/psychological-chat/sessions/{sessionId}/messages`

响应（拦截器解包后 = data.data 数组），每项:
- `id`, `sessionId`, `senderType` (1=用户, 2=AI助手), `senderTypeDesc`, `content`, `createdAt`, `contentLength`, `contentPreview`, `aiModel`
