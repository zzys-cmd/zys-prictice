---
name: always-verify-api-first
description: 对接接口时必须先用curl调接口看真实返回再写代码
metadata:
  type: feedback
---

规则：任何新接口对接，必须先用 curl/PowerShell 调接口拿到真实返回数据，确认字段名、数据类型、嵌套结构之后再写前端代码。

**Why:** 之前对接会话列表接口时，凭猜测写了字段名（lastMessage、sessionId、duration等），实际返回完全不同（lastMessageContent、id、durationMinutes），导致列表渲染空白。

**How to apply:** 每次接到新接口，第一步是 `curl -s <url> | python3 -m json.tool` 或 PowerShell `Invoke-RestMethod` 看真实JSON，记录下来再做映射。
