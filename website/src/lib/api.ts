const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Article {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {};
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { headers, ...options });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[${res.status}] ${err} — ${options?.method || "GET"} ${url}`);
  }
  return res.json();
}

export function listArticles(published?: boolean): Promise<{ articles: Article[] }> {
  const params = published ? "?published=true" : "";
  return request(`/admin/articles${params}`);
}

export function getArticle(slug: string): Promise<Article> {
  if (!slug || !slug.trim()) throw new Error("invalid slug");
  return request(`/admin/articles/${encodeURIComponent(slug)}`);
}

export function createArticle(data: {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  published?: boolean;
}): Promise<{ status: string; slug: string }> {
  return request("/admin/articles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateArticle(
  slug: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    tags?: string[];
    published?: boolean;
  }
): Promise<{ status: string }> {
  if (!slug || !slug.trim()) throw new Error("invalid slug");
  return request(`/admin/articles/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteArticle(slug: string): Promise<{ status: string }> {
  if (!slug || !slug.trim()) {
    throw new Error("invalid slug");
  }
  return request(`/admin/articles/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

// ── Knowledge API ──

export interface KnowledgeFile {
  name: string;
  size: number;
  modified: number;
}

export function listKnowledgeFiles(): Promise<{ files: KnowledgeFile[] }> {
  return request("/admin/knowledge");
}

export async function uploadKnowledgeFile(file: File): Promise<{ status: string; filename: string }> {
  const form = new FormData();
  form.append("file", file);
  const url = `${API_BASE}/admin/knowledge/upload`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[${res.status}] ${err}`);
  }
  return res.json();
}

export function deleteKnowledgeFile(filename: string): Promise<{ status: string }> {
  return request(`/admin/knowledge/${encodeURIComponent(filename)}`, { method: "DELETE" });
}

// ── Project API ──

export interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  github_url: string;
  demo_url: string;
  created_at: string;
  updated_at: string;
}

export function listProjects(): Promise<{ projects: Project[] }> {
  return request("/admin/projects");
}

export function getProject(slug: string): Promise<Project> {
  return request(`/admin/projects/${slug}`);
}

export function createProject(data: {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  github_url?: string;
  demo_url?: string;
}): Promise<{ status: string; slug: string }> {
  return request("/admin/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProject(
  slug: string,
  data: {
    title?: string;
    description?: string;
    tags?: string[];
    github_url?: string;
    demo_url?: string;
  }
): Promise<{ status: string }> {
  return request(`/admin/projects/${slug}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteProject(slug: string): Promise<{ status: string }> {
  return request(`/admin/projects/${slug}`, { method: "DELETE" });
}
