"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { Button, Badge, Modal } from "@/design-system";
import {
  DashboardSidebar,
  type NavItem,
} from "@/components/layout/DashboardSidebar";
import {
  LayoutDashboard,
  FileText,
  Users,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  Star,
  StarOff,
  ArrowLeft,
  Save,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Tag,
} from "lucide-react";

// Types
interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: { _id: string; name: string; avatar?: string } | string;
  authorName: string;
  authorRole: string;
  coverImage?: string;
  status: "draft" | "published" | "archived";
  publishedAt?: string;
  readTime: string;
  metaTitle?: string;
  metaDescription?: string;
  stats: { views: number; likes: number; shares: number };
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Writer {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  postCount: number;
  totalViews: number;
  lastPost?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type View = "overview" | "posts" | "create" | "edit" | "writers";

const CATEGORIES = [
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

export function BlogManagementView() {
  const [activeView, setActiveView] = useState<View>("overview");

  // Posts state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [postsLoading, setPostsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Writers state
  const [writers, setWriters] = useState<Writer[]>([]);
  const [writersLoading, setWritersLoading] = useState(false);

  // Edit/Create state
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Web Design",
    tags: "",
    status: "draft" as "draft" | "published" | "archived",
    metaTitle: "",
    metaDescription: "",
    isFeatured: false,
    authorName: "",
    authorRole: "Contributor",
  });
  const [saving, setSaving] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Overview stats
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalWriters: 0,
    featuredPosts: 0,
  });

  // Fetch posts
  const fetchPosts = useCallback(
    async (page = 1) => {
      setPostsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "20");
        if (statusFilter) params.set("status", statusFilter);
        if (searchQuery) params.set("search", searchQuery);

        const { data } = await api.get(`/blog/admin/all?${params.toString()}`);
        setPosts(data.data.posts);
        setPagination(data.data.pagination);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setPostsLoading(false);
      }
    },
    [statusFilter, searchQuery],
  );

  // Fetch writers (aggregate from posts)
  const fetchWriters = async () => {
    setWritersLoading(true);
    try {
      // Get all posts to aggregate writer data
      const { data } = await api.get("/blog/admin/all?limit=1000");
      const allPosts: BlogPost[] = data.data.posts;

      const writerMap = new Map<string, Writer>();
      allPosts.forEach((post) => {
        const authorId =
          typeof post.author === "object" ? post.author._id : post.author;
        const authorName =
          typeof post.author === "object" ? post.author.name : post.authorName;
        const authorEmail =
          typeof post.author === "object"
            ? (post.author as any).email || ""
            : "";
        const authorAvatar =
          typeof post.author === "object" ? post.author.avatar : undefined;

        if (writerMap.has(authorId)) {
          const existing = writerMap.get(authorId)!;
          existing.postCount++;
          existing.totalViews += post.stats?.views || 0;
          if (
            !existing.lastPost ||
            new Date(post.createdAt) > new Date(existing.lastPost)
          ) {
            existing.lastPost = post.createdAt;
          }
        } else {
          writerMap.set(authorId, {
            _id: authorId,
            name: authorName,
            email: authorEmail,
            avatar: authorAvatar,
            role: post.authorRole || "Contributor",
            postCount: 1,
            totalViews: post.stats?.views || 0,
            lastPost: post.createdAt,
          });
        }
      });

      setWriters(
        Array.from(writerMap.values()).sort(
          (a, b) => b.postCount - a.postCount,
        ),
      );
    } catch (error) {
      console.error("Failed to fetch writers:", error);
    } finally {
      setWritersLoading(false);
    }
  };

  // Compute stats
  const computeStats = useCallback(async () => {
    try {
      const { data } = await api.get("/blog/admin/all?limit=1000");
      const allPosts: BlogPost[] = data.data.posts;
      const authorIds = new Set(
        allPosts.map((p) =>
          typeof p.author === "object" ? p.author._id : p.author,
        ),
      );

      setStats({
        totalPosts: allPosts.length,
        publishedPosts: allPosts.filter((p) => p.status === "published").length,
        draftPosts: allPosts.filter((p) => p.status === "draft").length,
        totalViews: allPosts.reduce((sum, p) => sum + (p.stats?.views || 0), 0),
        totalWriters: authorIds.size,
        featuredPosts: allPosts.filter((p) => p.isFeatured).length,
      });
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    computeStats();
  }, [fetchPosts, computeStats]);

  useEffect(() => {
    if (activeView === "writers") fetchWriters();
  }, [activeView]);

  // Auto-generate slug
  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title" && !editingPost) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  // Create post
  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("slug", formData.slug);
      payload.append("excerpt", formData.excerpt);
      payload.append("content", formData.content);
      payload.append("category", formData.category);
      payload.append("status", formData.status);
      payload.append("authorName", formData.authorName);
      payload.append("authorRole", formData.authorRole);
      if (formData.metaTitle) payload.append("metaTitle", formData.metaTitle);
      if (formData.metaDescription)
        payload.append("metaDescription", formData.metaDescription);
      payload.append("isFeatured", String(formData.isFeatured));

      formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((tag) => {
          payload.append("tags[]", tag);
        });

      if (coverImageFile) {
        payload.append("coverImage", coverImageFile);
      }

      if (formData.status === "published") {
        payload.append("publishedAt", new Date().toISOString());
      }

      await api.post("/blog", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      resetForm();
      setActiveView("posts");
      fetchPosts();
      computeStats();
    } catch (error) {
      console.error("Failed to create blog post:", error);
    } finally {
      setSaving(false);
    }
  };

  // Update post
  const handleUpdate = async () => {
    if (!editingPost) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        isFeatured: formData.isFeatured,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      await api.patch(`/blog/${editingPost._id}`, payload);

      resetForm();
      setActiveView("posts");
      fetchPosts();
      computeStats();
    } catch (error) {
      console.error("Failed to update blog post:", error);
    } finally {
      setSaving(false);
    }
  };

  // Delete post
  const handleDelete = async () => {
    if (!deletePostId) return;
    setDeleting(true);
    try {
      await api.delete(`/blog/${deletePostId}`);
      setPosts((prev) => prev.filter((p) => p._id !== deletePostId));
      setDeleteModalOpen(false);
      computeStats();
    } catch (error) {
      console.error("Failed to delete blog post:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Toggle featured
  const toggleFeatured = async (post: BlogPost) => {
    try {
      await api.patch(`/blog/${post._id}`, { isFeatured: !post.isFeatured });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id ? { ...p, isFeatured: !p.isFeatured } : p,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  // Start editing
  const startEdit = async (postId: string) => {
    try {
      const { data } = await api.get(`/blog/admin/${postId}`);
      const post: BlogPost = data.data;
      setEditingPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags.join(", "),
        status: post.status,
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        isFeatured: post.isFeatured,
        authorName: post.authorName,
        authorRole: post.authorRole || "Contributor",
      });
      setActiveView("edit");
    } catch (error) {
      console.error("Failed to fetch post for editing:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "Web Design",
      tags: "",
      status: "draft",
      metaTitle: "",
      metaDescription: "",
      isFeatured: false,
      authorName: "",
      authorRole: "Contributor",
    });
    setCoverImageFile(null);
    setEditingPost(null);
  };

  const startCreate = () => {
    resetForm();
    setActiveView("create");
  };

  const statusBadgeVariant = (status: string) => {
    const map: Record<string, "success" | "warning" | "neutral"> = {
      published: "success",
      draft: "warning",
      archived: "neutral",
    };
    return map[status] || "neutral";
  };

  const navItems: NavItem[] = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      onClick: () => setActiveView("overview"),
      section: "main",
    },
    {
      label: "All Posts",
      icon: FileText,
      onClick: () => setActiveView("posts"),
      badge: stats.totalPosts,
      section: "Blog",
    },
    {
      label: "Writers",
      icon: Users,
      onClick: () => setActiveView("writers"),
      badge: stats.totalWriters,
      section: "Blog",
    },
  ];

  return (
    <DashboardSidebar
      title="Blog Management"
      subtitle="Manage posts & writers"
      navItems={navItems}
      headerActions={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<ArrowLeft size={16} />}
            >
              Admin Panel
            </Button>
          </Link>
          <Button size="sm" leftIcon={<Plus size={16} />} onClick={startCreate}>
            New Post
          </Button>
        </div>
      }
    >
      {/* ============ OVERVIEW ============ */}
      {activeView === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              className="bg-white border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-primary-200 transition-colors"
              onClick={() => setActiveView("posts")}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Total Posts
                </span>
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                  <FileText size={18} className="text-primary-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.totalPosts}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                <span className="text-success font-medium">
                  {stats.publishedPosts} published
                </span>
                <span className="text-warning font-medium">
                  {stats.draftPosts} drafts
                </span>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Total Views
                </span>
                <div className="w-9 h-9 bg-success-light rounded-lg flex items-center justify-center">
                  <TrendingUp size={18} className="text-success" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-400 mt-1">Across all posts</p>
            </div>

            <div
              className="bg-white border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-primary-200 transition-colors"
              onClick={() => setActiveView("writers")}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Writers
                </span>
                <div className="w-9 h-9 bg-info-light rounded-lg flex items-center justify-center">
                  <Users size={18} className="text-info" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.totalWriters}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {stats.featuredPosts} featured posts
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="ghost"
                onClick={startCreate}
                className="!flex !items-center !gap-3 !p-4 !bg-white !border !border-neutral-200 !rounded-xl !hover:border-primary-200 !hover:bg-primary-50/30 !transition-colors !text-left !h-auto !justify-start !font-normal"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Plus size={20} className="text-primary-500" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Create Post</p>
                  <p className="text-xs text-neutral-500">
                    Write a new blog post
                  </p>
                </div>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter("draft");
                  setActiveView("posts");
                }}
                className="!flex !items-center !gap-3 !p-4 !bg-white !border !border-neutral-200 !rounded-xl !hover:border-warning/50 !hover:bg-warning/5 !transition-colors !text-left !h-auto !justify-start !font-normal"
              >
                <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                  <Edit3 size={20} className="text-warning" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Review Drafts</p>
                  <p className="text-xs text-neutral-500">
                    {stats.draftPosts} posts awaiting review
                  </p>
                </div>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveView("writers")}
                className="!flex !items-center !gap-3 !p-4 !bg-white !border !border-neutral-200 !rounded-xl !hover:border-info/50 !hover:bg-info/5 !transition-colors !text-left !h-auto !justify-start !font-normal"
              >
                <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-info" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Manage Writers</p>
                  <p className="text-xs text-neutral-500">
                    {stats.totalWriters} active writers
                  </p>
                </div>
              </Button>
            </div>
          </div>

          {/* Recent posts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Recent Posts
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView("posts")}
                className="!text-sm !text-primary-600 !hover:text-primary-700 !font-medium"
              >
                View all
              </Button>
            </div>
            {posts.slice(0, 5).map((post, idx) => (
              <div
                key={post._id}
                className={`flex items-center justify-between py-3 ${idx > 0 ? "border-t border-neutral-100" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-medium text-neutral-900 truncate">
                      {post.title}
                    </h4>
                    <Badge size="sm" variant={statusBadgeVariant(post.status)}>
                      {post.status}
                    </Badge>
                    {post.isFeatured && (
                      <Star size={12} className="text-warning fill-warning" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    {post.authorName} &middot; {post.category} &middot;{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <span className="text-xs text-neutral-400 mr-2">
                    <Eye size={12} className="inline mr-0.5" />
                    {post.stats?.views || 0}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(post._id)}
                  >
                    <Edit3 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ ALL POSTS ============ */}
      {activeView === "posts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-neutral-900">
              All Blog Posts
            </h2>
            <Button
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={startCreate}
            >
              New Post
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPosts(1)}
                placeholder="Search posts..."
                className="w-full pl-9 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
              />
            </div>
            <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
              {[
                { key: "", label: "All" },
                { key: "published", label: "Published" },
                { key: "draft", label: "Draft" },
                { key: "archived", label: "Archived" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusFilter(tab.key);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    statusFilter === tab.key
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Table */}
          {postsLoading ? (
            <div className="text-center py-12 text-neutral-500">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <FileText size={48} className="text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                No blog posts
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                Create your first post to get started
              </p>
              <Button
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={startCreate}
              >
                Create First Post
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <div className="col-span-5">Title</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Category</div>
                  <div className="col-span-1">Views</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Table Rows */}
                {posts.map((post, idx) => (
                  <div
                    key={post._id}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center ${
                      idx > 0 ? "border-t border-neutral-100" : ""
                    } hover:bg-neutral-50/50 transition-colors`}
                  >
                    {/* Title */}
                    <div className="md:col-span-5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-neutral-900 truncate">
                          {post.title}
                        </h4>
                        {post.isFeatured && (
                          <Star
                            size={12}
                            className="text-warning fill-warning shrink-0"
                          />
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        /blog/{post.slug}
                      </p>
                    </div>

                    {/* Author */}
                    <div className="md:col-span-2 min-w-0">
                      <p className="text-sm text-neutral-700 truncate">
                        {post.authorName}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {post.authorRole}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-1">
                      <Badge
                        size="sm"
                        variant={statusBadgeVariant(post.status)}
                      >
                        {post.status}
                      </Badge>
                    </div>

                    {/* Category */}
                    <div className="md:col-span-1">
                      <span className="text-xs text-neutral-600">
                        {post.category}
                      </span>
                    </div>

                    {/* Views */}
                    <div className="md:col-span-1">
                      <span className="text-sm text-neutral-700">
                        {(post.stats?.views || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleFeatured(post)}
                        className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        title={
                          post.isFeatured ? "Remove featured" : "Make featured"
                        }
                      >
                        {post.isFeatured ? (
                          <Star
                            size={15}
                            className="text-warning fill-warning"
                          />
                        ) : (
                          <StarOff size={15} className="text-neutral-400" />
                        )}
                      </button>
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="View post"
                      >
                        <Eye size={15} className="text-neutral-400" />
                      </Link>
                      <button
                        onClick={() => startEdit(post._id)}
                        className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Edit post"
                      >
                        <Edit3 size={15} className="text-neutral-500" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletePostId(post._id);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-error/10 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 size={15} className="text-error/70" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}{" "}
                    of {pagination.total}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchPosts(pagination.page - 1)}
                      leftIcon={<ChevronLeft size={14} />}
                    >
                      Prev
                    </Button>
                    <span className="px-3 py-1.5 text-sm text-neutral-600">
                      {pagination.page} / {pagination.pages}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => fetchPosts(pagination.page + 1)}
                      rightIcon={<ChevronRight size={14} />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ============ CREATE / EDIT POST ============ */}
      {(activeView === "create" || activeView === "edit") && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setActiveView("posts");
              }}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-neutral-500" />
            </button>
            <div>
              <h2 className="text-xl font-display font-bold text-neutral-900">
                {activeView === "create" ? "Create New Post" : "Edit Post"}
              </h2>
              <p className="text-sm text-neutral-500">
                {activeView === "create"
                  ? "Write and publish a new blog post"
                  : `Editing: ${editingPost?.title}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Title */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="Enter post title..."
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-400 whitespace-nowrap">
                      /blog/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleFormChange("slug", e.target.value)}
                      placeholder="post-url-slug"
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Excerpt *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      handleFormChange("excerpt", e.target.value)
                    }
                    placeholder="Brief summary shown in listing cards..."
                    rows={2}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none text-sm"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    {formData.excerpt.length}/500
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Content * (HTML supported)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleFormChange("content", e.target.value)}
                  placeholder="Write your blog post content here... HTML tags are supported (e.g., <h2>, <p>, <ul>, <li>, <strong>)"
                  rows={16}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-y text-sm font-mono"
                />
              </div>

              {/* SEO */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <BarChart3 size={16} className="text-neutral-400" />
                    SEO Settings
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.metaTitle && formData.title) {
                        handleFormChange(
                          "metaTitle",
                          `${formData.title} — Flowbites`.slice(0, 70),
                        );
                      }
                      if (!formData.metaDescription && formData.excerpt) {
                        handleFormChange(
                          "metaDescription",
                          formData.excerpt.slice(0, 160),
                        );
                      }
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Auto-fill from content
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      handleFormChange("metaTitle", e.target.value)
                    }
                    placeholder="Custom meta title (defaults to post title)"
                    maxLength={70}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    {formData.metaTitle.length}/70
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleFormChange("metaDescription", e.target.value)
                    }
                    placeholder="Custom meta description for search engines"
                    rows={2}
                    maxLength={160}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none text-sm"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    {formData.metaDescription.length}/160
                  </p>
                </div>
                {/* SEO Preview */}
                <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50">
                  <p className="text-xs text-neutral-400 mb-2 font-semibold uppercase">
                    Search Preview
                  </p>
                  <p className="text-[#1a0dab] text-sm font-medium truncate">
                    {formData.metaTitle || formData.title || "Post Title"} —
                    Flowbites
                  </p>
                  <p className="text-[#006621] text-xs truncate mt-0.5">
                    flowbites.com/blog/{formData.slug || "post-slug"}
                  </p>
                  <p className="text-neutral-600 text-xs mt-1 line-clamp-2">
                    {formData.metaDescription ||
                      formData.excerpt ||
                      "Post description will appear here..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Publish Settings */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Publish
                </h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      handleFormChange("isFeatured", e.target.checked)
                    }
                    className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">
                    Featured post
                  </span>
                </label>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    leftIcon={<Save size={16} />}
                    onClick={
                      activeView === "create" ? handleCreate : handleUpdate
                    }
                    isLoading={saving}
                    disabled={
                      !formData.title || !formData.excerpt || !formData.content
                    }
                  >
                    {activeView === "create" ? "Create" : "Save"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      resetForm();
                      setActiveView("posts");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              {/* Category & Tags */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                  <Tag size={16} className="text-neutral-400" />
                  Category & Tags
                </h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleFormChange("category", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleFormChange("tags", e.target.value)}
                    placeholder="webflow, saas, template (comma-separated)"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </div>

              {/* Author Info */}
              {activeView === "create" && (
                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <Users size={16} className="text-neutral-400" />
                    Author
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) =>
                        handleFormChange("authorName", e.target.value)
                      }
                      placeholder="Author display name"
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Author Role
                    </label>
                    <input
                      type="text"
                      value={formData.authorRole}
                      onChange={(e) =>
                        handleFormChange("authorRole", e.target.value)
                      }
                      placeholder="e.g., Senior Writer, Contributor"
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Cover Image */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Cover Image
                </h3>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                  {coverImageFile ? (
                    <div>
                      <p className="text-sm text-neutral-700 font-medium">
                        {coverImageFile.name}
                      </p>
                      <button
                        onClick={() => setCoverImageFile(null)}
                        className="text-xs text-error mt-1 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-500 mb-2">
                        Upload cover image
                      </p>
                      <label className="cursor-pointer">
                        <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                          Choose file
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0])
                              setCoverImageFile(e.target.files[0]);
                          }}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ WRITERS ============ */}
      {activeView === "writers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-neutral-900">
              Writers
              <span className="ml-2 text-sm font-normal text-neutral-400">
                ({writers.length})
              </span>
            </h2>
          </div>

          {writersLoading ? (
            <div className="text-center py-12 text-neutral-500">
              Loading writers...
            </div>
          ) : writers.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <Users size={48} className="text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                No writers found
              </h3>
              <p className="text-sm text-neutral-500">
                Writers will appear here after they create blog posts
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {writers.map((writer) => (
                <div
                  key={writer._id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-primary-200 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-primary-600">
                        {writer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-900 truncate">
                        {writer.name}
                      </h4>
                      <p className="text-sm text-neutral-500">{writer.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-neutral-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-neutral-900">
                        {writer.postCount}
                      </div>
                      <div className="text-xs text-neutral-400">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-neutral-900">
                        {writer.totalViews.toLocaleString()}
                      </div>
                      <div className="text-xs text-neutral-400">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-neutral-700">
                        {writer.lastPost
                          ? new Date(writer.lastPost).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )
                          : "N/A"}
                      </div>
                      <div className="text-xs text-neutral-400">Last Post</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ DELETE MODAL ============ */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Blog Post"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete Post
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          Are you sure you want to delete this blog post? This action cannot be
          undone.
        </p>
      </Modal>
    </DashboardSidebar>
  );
}
