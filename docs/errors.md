# 错误分析与解决方案记录

## 1. SSE 流式解析失败 — `\r\n` vs `\n`

**现象**：Postman 能收到 SSE 流，但浏览器前端无响应。`console.log` 显示有 `[API] raw chunk` 但解析不出 `[API] event`。

**根因**：`sse-starlette` 发送的 SSE 使用 `\r\n`（CRLF）换行，前端 `split("\n\n")` 不匹配。

**修复**：`agent-api.ts` 中 `\n\n` → `\r\n\r\n`，`\n` → `\r\n`（`src/lib/agent-api.ts`）。

---

## 2. 删除文章 405 Method Not Allowed

**现象**：点击删除按钮报 `{"detail":"Method Not Allowed"}`。

**根因**：数据库中有 slug 为空的脏数据（测试时创建），导致前端请求 `DELETE /admin/articles/`（空路径），FastAPI 307 重定向后变成 `DELETE /admin/articles`（无 path param），路由不存在。

**修复**：
- 前端 `api.ts`：`deleteArticle` 加 `if (!slug) throw`
- 后端 `main.py`：`POST /admin/articles` 校验 slug 非空
- 前端 `new/page.tsx`：slug 为空时兜底 `post-{timestamp}`

---

## 3. API Key 认证失败 — Authentication Fails (governor)

**现象**：后端报 `openai.AuthenticationError`。

**根因**：`const.py` 字段名为 `api_key`，`.env` 写 `API_KEY`，但 `ChatOpenAI`（底层 OpenAI SDK）默认只认 `OPENAI_API_KEY` 环境变量。

**修复**：统一改用 `OPENAI_*` 变量名：
- `.env`：`API_KEY` → `OPENAI_API_KEY`，`BASE_URL` → `OPENAI_BASE_URL`
- `config.py`：字段名改为 `openai_api_key` / `openai_base_url` / `openai_model`

---

## 4. 首页 Canvas 粒子导航后消失

**现象**：从其他页返回首页，3D 粒子效果消失。

**根因**：Next.js App Router 的客户端导航机制导致 `Scene3D` 组件的 `useEffect([])` 不重新触发。

**修复**：将 `useEffect` 依赖从 `[]` 改为 `[pathname]`，路由变化时重建 Canvas。

---

## 5. 构建超时 — API 不可用

**现象**：`npm run build` 在生成博客静态页面时超时（>60s）。

**根因**：`getAllPosts()` 调用 Python API 超时（后端未启动），`fetch` 默认无超时。

**修复**：添加 `AbortSignal.timeout(1500)`，1.5 秒超时快速失败，回退到本地 MDX。

---

## 6. 知识库管理员页面 Failed to fetch

**现象**：打开 `/admin/knowledge` 白屏，控制台 `Failed to fetch`。

**根因**：后端未启动或路由配置错误。

**修复**：
- `main.py` 加 `from config import settings`
- 前端加后端状态指示灯 + 离线提示

---

## 7. 启动错误 — coroutine is not an async iterator

**现象**：后端启动时报 `TypeError: 'coroutine' object is not an async iterator`。

**根因**：`lifespan` 函数加了 `agent.rag.ingest()` 但删掉了 `yield`，`@asynccontextmanager` 需要 async generator。

**修复**：加回 `yield`。
