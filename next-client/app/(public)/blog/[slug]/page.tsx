import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ChevronLeft, Tag, User, ArrowRight } from 'lucide-react';
import { generateSEO, blogArticleSchema } from '@/lib/utils/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { blogPosts } from '@/modules/blog/data/blogPosts';
import { sanitizeHtml } from '@/lib/utils/sanitize';

/* ------------------------------------------------------------------ */
/*  Static Generation + ISR                                            */
/* ------------------------------------------------------------------ */
export const dynamicParams = false; // 404 for unknown slugs

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return generateSEO({ title: 'Article Not Found' });
  }

  return generateSEO({
    title: post.title,
    description: post.excerpt,
    canonical: `/blog/${post.slug}`,
    ogType: 'article',
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Related posts from same category
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* JSON-LD structured data */}
      <JsonLd
        data={blogArticleSchema({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          authorName: post.author,
          publishedAt: post.publishedAt,
          tags: post.tags,
        })}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <span className="inline-block text-xs font-medium bg-primary-500 text-white px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="text-neutral-600">&middot;</span>
            <span>{post.authorRole}</span>
            <span className="text-neutral-600">&middot;</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Article Body */}
        <article
          className="prose prose-neutral max-w-none
            prose-headings:text-neutral-900 prose-headings:font-semibold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-neutral-600 prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-neutral-600
            prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-neutral-900
            prose-ul:my-4 prose-ol:my-4"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-neutral-200">
          <Tag className="w-4 h-4 text-neutral-400" />
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?search=${encodeURIComponent(tag)}`}
              className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-full hover:bg-neutral-200 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Author Box */}
        <div className="mt-8 p-6 bg-neutral-50 rounded-xl flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shrink-0">
            {post.author
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">{post.author}</h3>
            <p className="text-sm text-neutral-500">{post.authorRole} at Flowbites</p>
            <p className="text-sm text-neutral-500 mt-2">
              Passionate about web design, no-code tools, and empowering creators to build beautiful
              websites.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 p-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white text-center">
          <h3 className="text-xl font-bold mb-2">Find the Perfect Template</h3>
          <p className="text-primary-100 mb-6">
            Browse thousands of premium Webflow, Framer, and Wix templates on Flowbites Marketplace.
          </p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Browse Templates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-neutral-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-neutral-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className="group block bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Flowbites"
                      className="h-8 opacity-20 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-primary-500">{rp.category}</span>
                    <h3 className="font-semibold text-neutral-900 mt-1 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                      {rp.title}
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-2">{rp.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
