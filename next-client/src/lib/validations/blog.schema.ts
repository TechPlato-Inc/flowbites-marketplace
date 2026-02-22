import { z } from "zod";

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title too long"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(500, "Excerpt too long"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).max(10, "Maximum 10 tags").optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const updateBlogSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(50).optional(),
  excerpt: z.string().min(10).max(500).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
