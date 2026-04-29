import sqlite3
import json
from pathlib import Path
from datetime import datetime

DB_PATH = Path("./data/memory.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        );

        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (session_id) REFERENCES sessions(id)
        );

        CREATE TABLE IF NOT EXISTS articles (
            slug TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '',
            excerpt TEXT NOT NULL DEFAULT '',
            tags TEXT NOT NULL DEFAULT '[]',
            published INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()


def create_session() -> str:
    import uuid
    session_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute("INSERT INTO sessions (id) VALUES (?)", (session_id,))
    conn.commit()
    conn.close()
    return session_id


def get_or_create_session(session_id: str | None = None) -> str:
    if session_id:
        conn = get_connection()
        row = conn.execute("SELECT id FROM sessions WHERE id = ?", (session_id,)).fetchone()
        conn.close()
        if row:
            return session_id
    return create_session()


def save_message(session_id: str, role: str, content: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
        (session_id, role, content),
    )
    conn.execute(
        "UPDATE sessions SET updated_at = datetime('now') WHERE id = ?",
        (session_id,),
    )
    conn.commit()
    conn.close()


def get_history(session_id: str, limit: int = 50) -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?",
        (session_id, limit),
    ).fetchall()
    conn.close()
    return [{"role": r["role"], "content": r["content"]} for r in reversed(rows)]


def save_memory(session_id: str, key: str, value: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO memories (session_id, key, value) VALUES (?, ?, ?)",
        (session_id, key, value),
    )
    conn.commit()
    conn.close()


def get_memories(session_id: str) -> dict[str, str]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT key, value FROM memories WHERE session_id = ?", (session_id,)
    ).fetchall()
    conn.close()
    return {r["key"]: r["value"] for r in rows}


# ── Article CRUD ──

def create_article(slug: str, title: str, content: str = "", excerpt: str = "", tags: list[str] | None = None, published: bool = False):
    conn = get_connection()
    conn.execute(
        """INSERT INTO articles (slug, title, content, excerpt, tags, published)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (slug, title, content, excerpt, json.dumps(tags or []), 1 if published else 0),
    )
    conn.commit()
    conn.close()


def update_article(slug: str, title: str | None = None, content: str | None = None, excerpt: str | None = None, tags: list[str] | None = None, published: bool | None = None):
    conn = get_connection()
    fields = []
    vals = []
    if title is not None:
        fields.append("title = ?"); vals.append(title)
    if content is not None:
        fields.append("content = ?"); vals.append(content)
    if excerpt is not None:
        fields.append("excerpt = ?"); vals.append(excerpt)
    if tags is not None:
        fields.append("tags = ?"); vals.append(json.dumps(tags))
    if published is not None:
        fields.append("published = ?"); vals.append(1 if published else 0)
    if not fields:
        conn.close(); return
    fields.append("updated_at = datetime('now')")
    vals.append(slug)
    conn.execute(f"UPDATE articles SET {', '.join(fields)} WHERE slug = ?", vals)
    conn.commit()
    conn.close()


def delete_article(slug: str):
    conn = get_connection()
    conn.execute("DELETE FROM articles WHERE slug = ?", (slug,))
    conn.commit()
    conn.close()


def get_article(slug: str) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT * FROM articles WHERE slug = ?", (slug,)).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["tags"] = json.loads(d["tags"])
    d["published"] = bool(d["published"])
    return d


def list_articles(published_only: bool = False) -> list[dict]:
    conn = get_connection()
    query = "SELECT slug, title, excerpt, tags, published, created_at, updated_at FROM articles"
    params: list = []
    if published_only:
        query += " WHERE published = 1"
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["tags"] = json.loads(d["tags"])
        d["published"] = bool(d["published"])
        result.append(d)
    return result
