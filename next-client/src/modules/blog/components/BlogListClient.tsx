"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/modules/blog/services/blog.service";

const CATEGORIES = [
  "All",
  "Web Design",
  "Webflow",
  "Framer",
  "Wix",
  "No-Code",
  "Business",
  "Tutorials",
  "Trends",
  "SEO",
  "Freelancing",
];

const POSTS_PER_PAGE = 12;

interface BlogListClientProps {
  posts: BlogPost[];
  featuredPost: BlogPost;
}

export function BlogListClient({ posts, featuredPost }: BlogListClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (activeCategory !== "All") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return filtered;
  }, [posts, activeCategory, searchQuery]);

  const paginatedPosts = filteredPosts.slice(0, page * POSTS_PER_PAGE);

  return (
    <>
      {/* Featured Post */}
      {featuredPost && activeCategory === "All" && !searchQuery && (
        <div className="max-w-6xl mx-auto px-4 -mt-8">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="block bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-8 md:p-12 flex items-center justify-center">
                <div className="text-center">
                  <span className="inline-block bg-primary-500 text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                    Featured
                  </span>
                  <img
                    src="/logo.png"
                    alt="Flowbites"
                    className="h-16 mx-auto opacity-50"
                  />
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="text-xs font-medium text-primary-500 mb-2">
                  {featuredPost.category}
                </span>
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                  {featuredPost.title}
                </h2>
                <p className="text-neutral-500 mb-4 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-neutral-400">
                  <span>{featuredPost.authorName}</span>
                  <span
                    className="flex items-center gap-1"
                    suppressHydrationWarning
                  >
                    <Calendar className="w-3 h-3" />
                    {new Date(
                      featuredPost.publishedAt || featuredPost.createdAt,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {featuredPost.readTime}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Filter Bar */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  activeCategory === cat
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-neutral-500 mb-6">
          {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
          {activeCategory !== "All" && ` in ${activeCategory}`}
        </p>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPosts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group block border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* Thumbnail */}
              <div className="aspect-[16/9] bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center relative overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Flowbites"
                  className="h-10 opacity-20 group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 text-xs font-medium bg-white/90 backdrop-blur-sm text-neutral-700 px-2.5 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{post.authorName}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center gap-1"
                      suppressHydrationWarning
                    >
                      <Calendar className="w-3 h-3" />
                      {new Date(
                        post.publishedAt || post.createdAt,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        {paginatedPosts.length < filteredPosts.length && (
          <div className="text-center mt-10">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
            >
              Load More Articles
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-neutral-400 mt-2">
              Showing {paginatedPosts.length} of {filteredPosts.length} articles
            </p>
          </div>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-semibold text-neutral-900 mb-2">
              No articles found
            </h3>
            <p className="text-sm text-neutral-500">
              Try adjusting your search or filter to find what you are looking
              for.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
