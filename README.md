# quiet-space

科技感个人网站 + AI Agent 知识库。

## 架构

```
F:\text\personalTest
├── website/          Next.js 16 前端（Vercel 部署）
├── agent/            Python FastAPI Agent 服务（Railway/Fly.io 部署）
├── docs/             需求分析 & 错误记录
└── README.md
```

## 功能一览

| 页面 | 说明 |
|---|---|
| `/` | 首页 — 3D 粒子背景 + 打字效果 + 个人介绍 |
| `/blog` | 博客 — MDX + API 双源文章列表 |
| `/projects` | 项目展示 — 卡片网格，从 API 读取 |
| `/agent` | AI Agent 终端 — 全屏终端 + 流式对话 + RAG 知识库 |
| `/admin` | 后台管理 — 文章/项目/知识库 CRUD |
| `Ctrl+`` | 全局终端快捷覆盖层 |

## 快速启动

```bash
# 1. 后端
cd agent
cp .env.example .env  # 填入你的 DeepSeek API Key
conda run -n personalProject uvicorn main:app --reload --port 8000

# 2. 前端
cd website
npm run dev

# 3. 浏览器打开 http://localhost:3000
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 16 + TypeScript + Tailwind CSS 4 |
| 后端 | Python FastAPI + LangChain |
| LLM | DeepSeek API (deepseek-chat) |
| 向量库 | Chroma + bge-small-zh-v1.5 |
| 持久化 | SQLite |
| 部署 | Vercel (前端) + Railway/Fly.io (后端) |

## 配置文件

- `agent/.env` — DeepSeek API Key 等配置（不提交）
- `website/src/lib/api.ts` — 前端 API 地址（默认 `localhost:8000`）

## Docs

- [需求分析](docs/requirements.md)
- [错误分析与解决方案](docs/errors.md)

## License

MIT
