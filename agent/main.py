from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from memory.store import init_db, get_or_create_session, get_history, create_article, update_article, delete_article, get_article, list_articles
from config import settings
from agent import Agent

agent = Agent()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    agent.rag.ingest()
    yield


app = FastAPI(title="Personal Agent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    response: str


@app.post("/chat")
async def chat(req: ChatRequest):
    session_id = get_or_create_session(req.session_id)
    full = ""
    async for chunk in agent.chat(session_id, req.message):
        full += chunk
    return ChatResponse(session_id=session_id, response=full)


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    session_id = get_or_create_session(req.session_id)

    async def event_gen():
        async for chunk in agent.chat(session_id, req.message):
            yield {"event": "chunk", "data": chunk}
        yield {"event": "done", "data": session_id}
    return EventSourceResponse(event_gen())


@app.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    return {"messages": get_history(session_id)}


@app.post("/ingest")
async def ingest(file_path: str | None = None):
    try:
        agent.rag.ingest(file_path)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Article Admin API ──


class ArticleCreate(BaseModel):
    slug: str
    title: str
    content: str = ""
    excerpt: str = ""
    tags: list[str] = []
    published: bool = False


class ArticleUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    excerpt: str | None = None
    tags: list[str] | None = None
    published: bool | None = None


@app.get("/admin/articles")
async def get_articles(published: bool = False):
    return {"articles": list_articles(published_only=published)}


@app.get("/admin/articles/{slug}")
async def get_article_by_slug(slug: str):
    article = get_article(slug)
    if not article:
        raise HTTPException(status_code=404, detail="article not found")
    return article


@app.post("/admin/articles")
async def create_article_endpoint(req: ArticleCreate):
    if not req.slug or not req.slug.strip():
        raise HTTPException(status_code=400, detail="slug cannot be empty")
    if not req.title or not req.title.strip():
        raise HTTPException(status_code=400, detail="title cannot be empty")
    existing = get_article(req.slug)
    if existing:
        raise HTTPException(status_code=409, detail="slug already exists")
    create_article(
        slug=req.slug,
        title=req.title,
        content=req.content,
        excerpt=req.excerpt,
        tags=req.tags,
        published=req.published,
    )
    return {"status": "ok", "slug": req.slug}


@app.put("/admin/articles/{slug}")
async def update_article_endpoint(slug: str, req: ArticleUpdate):
    existing = get_article(slug)
    if not existing:
        raise HTTPException(status_code=404, detail="article not found")
    update_article(
        slug=slug,
        title=req.title,
        content=req.content,
        excerpt=req.excerpt,
        tags=req.tags,
        published=req.published,
    )
    return {"status": "ok"}


@app.delete("/admin/articles/{slug}")
async def delete_article_endpoint(slug: str):
    existing = get_article(slug)
    if not existing:
        raise HTTPException(status_code=404, detail="article not found")
    delete_article(slug)
    return {"status": "ok"}


# ── Knowledge Admin API ──


@app.get("/admin/knowledge")
async def list_knowledge():
    path = Path(settings.knowledge_dir)
    if not path.exists():
        return {"files": []}
    files = []
    for f in sorted(path.iterdir()):
        if f.is_file():
            files.append({
                "name": f.name,
                "size": f.stat().st_size,
                "modified": f.stat().st_mtime,
            })
    return {"files": files}


@app.post("/admin/knowledge/upload")
async def upload_knowledge(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="no filename")
    path = Path(settings.knowledge_dir) / file.filename
    content = await file.read()
    path.write_bytes(content)
    agent.rag.ingest_file(content.decode("utf-8", errors="replace"), file.filename)
    return {"status": "ok", "filename": file.filename}


@app.delete("/admin/knowledge/{filename}")
async def delete_knowledge(filename: str):
    path = Path(settings.knowledge_dir) / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="file not found")
    path.unlink()
    agent.rag.reindex()
    return {"status": "ok"}


@app.get("/health")
async def health():
    return {"status": "ok"}
