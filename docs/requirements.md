# 需求分析

## 项目定位

个人科技感网站 + AI Agent 知识库。用于展示自己、写博客、管理知识库，并通过终端风格的 AI Agent 与访客交互。

## 核心功能

| 模块 | 功能 | 状态 |
|---|---|---|
| **首页** | 3D 粒子背景、打字动画、个人介绍、最新文章 | ✅ |
| **博客** | MDX 驱动 + API 双源展示，Markdown 编辑器 | ✅ |
| **项目展示** | 卡片网格，从 API 读取数据，支持标签筛选 | ✅ |
| **AI Agent** | 全屏终端界面、SSE 流式对话、RAG 知识库检索 | ✅ |
| **知识库** | 上传/管理文档，自动 ingest 到向量库 | ✅ |
| **后台管理** | 文章/项目/知识库 CRUD，终端风格 UI | ✅ |
| **主题切换** | 深色/浅色双主题 | ❌ 已移除，保留纯暗色 |
| **全局终端** | Ctrl+` 唤起终端覆盖层 | ✅ |

## 技术栈

- 前端：Next.js 16 + TypeScript + Tailwind CSS 4
- 后端：Python FastAPI + LangChain
- LLM：DeepSeek API
- 向量库：Chroma + bge-small-zh-v1.5
- 持久化：SQLite

## 用户角色

- **站长**（我）：管理内容、上传知识库、与 Agent 对话
- **访客**：浏览博客/项目、与 Agent 对话

## 数据流

```
访客 → 浏览器 → Next.js (SSR/SSG)
                     ↓ API
              Python FastAPI
              ├── Chat (DeepSeek + RAG)
              ├── Articles CRUD
              ├── Projects CRUD
              └── Knowledge / Ingest
```
