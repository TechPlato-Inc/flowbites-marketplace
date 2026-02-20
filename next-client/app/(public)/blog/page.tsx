import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { generateSEO } from '@/lib/utils/seo';
import { blogPosts } from '@/modules/blog/data/blogPosts';
import { BlogListClient } from '@/modules/blog/components/BlogListClient';

/* ------------------------------------------------------------------ */
/*  Static Generation                                                  */
/* ------------------------------------------------------------------ */
export const dynamic = 'force-static';

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */
export function generateMetadata(): Metadata {
  return generateSEO({
    title: 'Blog',
    description:
      'Read articles about web design, Webflow, Framer, and building with no-code tools on the Flowbites blog.',
    canonical: '/blog',
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function BlogPage() {
  // Sort posts by date descending (newest first)
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const featuredPost = sortedPosts[0];

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
            Learn about Webflow, Framer, Wix, web design trends, and how to build better websites
            with premium templates.
          </p>
        </div>
      </div>

      {/* Interactive list — client component */}
      <BlogListClient posts={sortedPosts} featuredPost={featuredPost} />
    </div>
  );
}
