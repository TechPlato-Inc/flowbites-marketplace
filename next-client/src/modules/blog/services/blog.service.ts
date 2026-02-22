import { api } from "@/lib/api/client";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: { _id: string; name: string; avatar?: string };
  authorName: string;
  authorRole: string;
  readTime: string;
  coverImage?: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  stats: { views: number; likes: number; shares: number };
  publishedAt?: string;
  createdAt: string;
}

interface BlogListResponse {
  posts: BlogPost[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export async function getBlogPosts(
  params?: Record<string, string>,
): Promise<BlogListResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/blog${query}`);
  return data.data;
}

export async function getBlogBySlug(
  slug: string,
): Promise<{ post: BlogPost; related: BlogPost[] }> {
  const { data } = await api.get(`/blog/${slug}`);
  return data.data;
}

export async function getBlogCategories(): Promise<
  { name: string; count: number }[]
> {
  const { data } = await api.get("/blog/categories");
  return data.data;
}

export async function getBlogTags(): Promise<
  { name: string; count: number }[]
> {
  const { data } = await api.get("/blog/tags");
  return data.data;
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const { data } = await api.get("/blog/featured");
  return data.data;
}

export async function createBlogPost(formData: FormData): Promise<BlogPost> {
  const { data } = await api.post("/blog", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function updateBlogPost(
  id: string,
  payload: Partial<BlogPost>,
): Promise<BlogPost> {
  const { data } = await api.patch(`/blog/${id}`, payload);
  return data.data;
}

export async function deleteBlogPost(id: string): Promise<void> {
  await api.delete(`/blog/${id}`);
}

export async function adminGetAllPosts(
  params?: Record<string, string>,
): Promise<BlogListResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const { data } = await api.get(`/blog/admin/all${query}`);
  return data.data;
}

export async function adminGetPostById(id: string): Promise<BlogPost> {
  const { data } = await api.get(`/blog/admin/${id}`);
  return data.data;
}
