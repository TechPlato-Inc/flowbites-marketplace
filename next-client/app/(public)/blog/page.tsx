import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { generateSEO } from "@/lib/utils/seo";
import { getBlogPosts } from "@/modules/blog/services/blog.service.server";
import { BlogListClient } from "@/modules/blog/components/BlogListClient";

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */
export function generateMetadata(): Metadata {
  return generateSEO({
    title: "Blog",
    description:
      "Read articles about web design, Webflow, Framer, and building with no-code tools on the Flowbites blog.",
    canonical: "/blog",
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>>["posts"] = [];

  try {
    const data = await getBlogPosts({ limit: "100", sort: "newest" });
    posts = data.posts;
  } catch {
    // API unavailable — show empty state
  }

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-neutral-400 mb-4">
            <BookOpen className="w-4 h-4" />
            Flowbites Blog
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Insights, tutorials, and trends for
            <br />
            web designers and creators
          </h1>
          <p className="text-neutral-400 max-w-xl">
            Learn about Webflow, Framer, Wix, web design trends, and how to
            build better websites with premium templates.
          </p>
        </div>
      </div>

      {/* Interactive list — client component */}
      <BlogListClient posts={posts} featuredPost={featuredPost} />
    </div>
  );
}
