# void · personal space

科技感个人网站 + AI Agent 知识库。

## 架构

```
F:\text\personalTest
├── website/          Next.js 14 前端（Vercel 部署）
├── agent/            Python FastAPI Agent 服务（Railway/Fly.io 部署）
└── README.md
```

### 前端 — website/

```
src/
├── app/
│   ├── layout.tsx      全局布局（导航栏）
│   ├── page.tsx        首页（3D粒子背景 + 打字动画）
│   ├── globals.css     设计系统（暗色科技风主题）
│   ├── blog/           博客（待开发）
│   ├── projects/       作品集（待开发）
│   └── agent/          终端 Agent 界面（待开发）
├── components/
│   ├── Navbar.tsx      导航栏
│   ├── Scene3D.tsx     3D 粒子连接动画（Canvas 2D）
│   └── TypingEffect.tsx 打字机循环动画
└── content/            MDX 文章
```

- **框架**: Next.js 16 + TypeScript + App Router
- **样式**: Tailwind CSS 4 + 自定义科技风主题色
- **动效**: 原生动画（无额外动画库依赖）
- **启动**: `npm run dev` → `localhost:3000`

### 后端 — agent/

```
├── main.py            FastAPI 入口 / API 路由
├── agent.py           Agent 编排（LLM 对话 + 上下文管理）
├── config.py          配置（DeepSeek + 路径）
├── rag/
│   └── engine.py      RAG 引擎（本地向量检索）
├── memory/
│   └── store.py       SQLite 会话 / 记忆管理
├── knowledge/          知识库原始文件（放你的笔记）
├── tools/              工具扩展（待开发）
├── models/             Embedding 模型缓存（自动下载）
└── .env               API 密钥配置
```

**API 端点**:

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/chat` | 普通对话 |
| POST | `/chat/stream` | SSE 流式对话 |
| GET | `/history/{session_id}` | 获取历史 |
| POST | `/ingest` | 导入知识库文件 |
| GET | `/health` | 健康检查 |

- **框架**: FastAPI + LangChain
- **LLM**: DeepSeek API（deepseek-chat）
- **向量库**: Chroma（本地持久化）
- **Embedding**: BAAI/bge-small-zh-v1.5（本地，自动下载到 models/）
- **持久化**: SQLite（对话历史 + 记忆）
- **启动**: `uvicorn main:app --reload --port 8000`

## 快速启动

### 1. Python Agent 服务

```bash
cd agent
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key
conda run -n personalProject uvicorn main:app --reload --port 8000
```

首次启动会自动下载 embedding 模型（~80MB）并初始化 SQLite。

### 2. 导入知识库

把你的 `.md` / `.txt` 笔记放到 `agent/knowledge/`，然后：

```bash
curl -X POST http://localhost:8000/ingest
```

### 3. 前端

```bash
cd website
npm run dev
```

打开 `http://localhost:3000`

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 16 + TypeScript + Tailwind CSS |
| 后端 | Python FastAPI + LangChain |
| LLM | DeepSeek API (deepseek-chat) |
| 向量库 | Chroma + bge-small-zh-v1.5 |
| 持久化 | SQLite |
| 部署 | Vercel (前端) + Railway/Fly.io (后端) |

## 开发路线

- [x] Phase 1.1: Next.js 项目初始化
- [x] Phase 1.2: 科技感设计系统
- [x] Phase 1.3: 首页（3D + 打字动画）
- [x] Phase 1.4: Python Agent 服务（RAG + SQLite + DeepSeek）
- [ ] Phase 2: 博客系统（MDX）
- [ ] Phase 3: 终端 Agent UI + 前后端对接
- [ ] Phase 4: 作品集页面
