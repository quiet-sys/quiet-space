import fs from "fs";
import path from "path";
import matter from "gray-matter";

const blogDir = path.join(process.cwd(), "src", "content", "blog");
const API_URL = process.env.API_URL || "http://localhost:8000";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
}

async function fetchAPIPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/admin/articles?published=true`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map((a: any) => ({
      slug: a.slug,
      title: a.title,
      date: a.created_at?.slice(0, 10) || "",
      tags: a.tags || [],
      excerpt: a.excerpt || "",
      content: "",
    }));
  } catch {
    return [];
  }
}

async function fetchAPIPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/admin/articles/${slug}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const a = await res.json();
    return {
      slug: a.slug,
      title: a.title,
      date: a.created_at?.slice(0, 10) || "",
      tags: a.tags || [],
      excerpt: a.excerpt || "",
      content: a.content || "",
    };
  } catch {
    return null;
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const local: BlogPost[] = (() => {
    if (!fs.existsSync(blogDir)) return [];
    return fs
      .readdirSync(blogDir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => {
        const slug = f.replace(/\.mdx$/, "");
        const raw = fs.readFileSync(path.join(blogDir, f), "utf-8");
        const { data, content } = matter(raw);
        return {
          slug,
          title: data.title || slug,
          date: data.date || "",
          tags: data.tags || [],
          excerpt: data.excerpt || content.slice(0, 160).replace(/#|\n/g, " ").trim(),
          content,
        };
      });
  })();

  const api = await fetchAPIPosts();

  const seen = new Set(local.map((p) => p.slug));
  const merged = [...local, ...api.filter((p) => !seen.has(p.slug))];
  merged.sort((a, b) => (a.date < b.date ? 1 : -1));
  return merged;
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(blogDir, `${slug}.mdx`);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: data.title || slug,
      date: data.date || "",
      tags: data.tags || [],
      excerpt: data.excerpt || "",
      content,
    };
  }

  return fetchAPIPost(slug);
}
