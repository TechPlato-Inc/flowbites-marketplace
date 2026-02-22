import { serverFetch } from "@/lib/api/server";
import type { BlogPost } from "./blog.service";

interface BlogListResponse {
  posts: BlogPost[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export async function getBlogPosts(
  params?: Record<string, string>,
): Promise<BlogListResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return serverFetch<BlogListResponse>(`/blog${query}`, {
    revalidate: 300,
    tags: ["blog"],
  });
}

export async function getBlogBySlug(slug: string): Promise<BlogPost> {
  const data = await serverFetch<{ post: BlogPost; related: BlogPost[] }>(
    `/blog/${slug}`,
    {
      revalidate: 600,
      tags: [`blog-${slug}`],
    },
  );
  return data.post;
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  return serverFetch<BlogPost[]>("/blog/featured", {
    revalidate: 300,
    tags: ["blog-featured"],
  });
}

export async function getBlogCategories(): Promise<
  { name: string; count: number }[]
> {
  return serverFetch<{ name: string; count: number }[]>("/blog/categories", {
    revalidate: 3600,
    tags: ["blog-categories"],
  });
}
