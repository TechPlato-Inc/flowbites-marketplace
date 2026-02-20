'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api, getUploadUrl } from '@/lib/api/client';
import { Button, Badge, Modal } from '@/design-system';
import type { Template, Category } from '@/types';
import {
  LayoutDashboard, FileText, Star, Tag, ArrowLeft, Search,
  Trash2, Edit3, Eye, CheckCircle2, XCircle, Download,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  BarChart3, TrendingUp, DollarSign, Package, Globe,
  Filter, X, StarOff, AlertTriangle, ExternalLink, CheckCircle, ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ================================================================
   Types
   ================================================================ */
interface TemplateFilters {
  search: string;
  status: string;
  platform: string;
  category: string;
  featured: string;
  priceMin: string;
  priceMax: string;
  sort: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface TemplateStats {
  byStatus: Record<string, number>;
  byPlatform: { _id: string; count: number; revenue: number }[];
  totals: { totalRevenue: number; totalPurchases: number; totalViews: number };
  topTemplates: Template[];
  recentActivity: { _id: string; title: string; status: string; createdAt: string; creatorProfileId?: { displayName: string } }[];
  featuredCount: number;
  approvalRate: number;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  badge?: number;
  section: string;
}

type View = 'overview' | 'templates' | 'detail' | 'edit' | 'categories' | 'featured';

const DEFAULT_FILTERS: TemplateFilters = {
  search: '', status: '', platform: '', category: '',
  featured: '', priceMin: '', priceMax: '', sort: 'newest',
};

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const PLATFORM_PILLS = [
  { label: 'All', value: '' },
  { label: 'Webflow', value: 'webflow' },
  { label: 'Framer', value: 'framer' },
  { label: 'Wix', value: 'wix' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Views', value: 'most_views' },
  { label: 'Most Purchases', value: 'most_purchases' },
  { label: 'Price High', value: 'price_high' },
  { label: 'Price Low', value: 'price_low' },
  { label: 'Most Revenue', value: 'most_revenue' },
];

/* ================================================================
   Helpers
   ================================================================ */
const statusBadgeVariant = (s: string) => {
  switch (s) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    case 'draft': return 'neutral';
    default: return 'info';
  }
};

const platformLabel = (p: string) => {
  switch (p) {
    case 'webflow': return 'Webflow';
    case 'framer': return 'Framer';
    case 'wix': return 'Wix Studio';
    default: return p;
  }
};

const formatDate = (d: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (n: number) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

/* ================================================================
   Component
   ================================================================ */
export const TemplateManager = () => {
  const [activeView, setActiveView] = useState<View>('overview');

  // Templates list
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [filters, setFilters] = useState<TemplateFilters>({ ...DEFAULT_FILTERS });
  const [showFilters, setShowFilters] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Detail / edit
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '', color: '#6366f1', isActive: true });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);

  // Analytics
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [bulkRejectModalOpen, setBulkRejectModalOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // Feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };
  const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 5000); };

  /* ====== Data fetching ====== */
  const fetchTemplates = useCallback(async (page = 1) => {
    setTemplatesLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.platform) params.set('platform', filters.platform);
      if (filters.category) params.set('category', filters.category);
      if (filters.featured) params.set('featured', filters.featured);
      if (filters.priceMin) params.set('priceMin', filters.priceMin);
      if (filters.priceMax) params.set('priceMax', filters.priceMax);
      if (filters.sort) params.set('sort', filters.sort);

      const { data } = await api.get(`/admin/templates?${params.toString()}`);
      setTemplates(data.data.templates);
      setPagination(data.data.pagination);
    } catch {
      showError('Failed to load templates');
    } finally {
      setTemplatesLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get('/admin/templates/stats');
      setStats(data.data);
    } catch {
      showError('Failed to load analytics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data || []);
    } catch {
      showError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchTemplateDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/admin/templates/${id}`);
      setSelectedTemplate(data.data);
    } catch {
      showError('Failed to load template details');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); fetchCategories(); }, [fetchStats, fetchCategories]);
  useEffect(() => { fetchTemplates(1); }, [fetchTemplates]);

  /* ====== Actions ====== */
  const handleApprove = async (id: string) => {
    try {
      await api.post(`/admin/templates/${id}/approve`);
      showSuccess('Template approved');
      fetchTemplates(pagination.page);
      fetchStats();
    } catch {
      showError('Failed to approve template');
    }
  };

  const handleReject = async () => {
    if (!rejectTargetId) return;
    try {
      await api.post(`/admin/templates/${rejectTargetId}/reject`, { reason: rejectReason });
      showSuccess('Template rejected');
      setRejectModalOpen(false);
      setRejectReason('');
      setRejectTargetId(null);
      fetchTemplates(pagination.page);
      fetchStats();
    } catch {
      showError('Failed to reject template');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/templates/${deleteTargetId}`);
      showSuccess('Template deleted');
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      if (activeView === 'detail' || activeView === 'edit') setActiveView('templates');
      fetchTemplates(pagination.page);
      fetchStats();
    } catch {
      showError('Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return;
    if (action === 'reject') { setBulkRejectModalOpen(true); return; }

    setBulkProcessing(true);
    try {
      const { data } = await api.post('/admin/templates/bulk', {
        action,
        templateIds: Array.from(selectedIds),
      });
      showSuccess(`Bulk ${action}: ${data.data.success} succeeded, ${data.data.failed} failed`);
      setSelectedIds(new Set());
      fetchTemplates(pagination.page);
      fetchStats();
    } catch {
      showError(`Bulk ${action} failed`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    setBulkProcessing(true);
    try {
      const { data } = await api.post('/admin/templates/bulk', {
        action: 'reject',
        templateIds: Array.from(selectedIds),
        reason: bulkRejectReason,
      });
      showSuccess(`Bulk reject: ${data.data.success} succeeded, ${data.data.failed} failed`);
      setSelectedIds(new Set());
      setBulkRejectModalOpen(false);
      setBulkRejectReason('');
      fetchTemplates(pagination.page);
      fetchStats();
    } catch {
      showError('Bulk reject failed');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/templates/${id}`, { isFeatured: !current });
      showSuccess(current ? 'Removed from featured' : 'Added to featured');
      fetchTemplates(pagination.page);
      fetchStats();
    } catch {
      showError('Failed to update featured status');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      await api.patch(`/admin/templates/${selectedTemplate._id}`, editForm);
      showSuccess('Template updated');
      setActiveView('detail');
      fetchTemplateDetail(selectedTemplate._id);
      fetchTemplates(pagination.page);
    } catch {
      showError('Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const response = await api.get(`/admin/templates/export?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `templates-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showSuccess('Export downloaded');
    } catch {
      showError('Failed to export templates');
    }
  };

  // Category actions
  const handleSaveCategory = async () => {
    setCategorySaving(true);
    try {
      if (editingCategory) {
        await api.patch(`/admin/categories/${editingCategory._id}`, categoryForm);
        showSuccess('Category updated');
      } else {
        await api.post('/categories', categoryForm);
        showSuccess('Category created');
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', icon: '', color: '#6366f1', isActive: true });
      fetchCategories();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save category';
      showError(msg);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    try {
      await api.delete(`/admin/categories/${deleteCategoryId}`);
      showSuccess('Category deleted');
      setDeleteCategoryModalOpen(false);
      setDeleteCategoryId(null);
      fetchCategories();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete category';
      showError(msg);
    }
  };

  const handleReorderCategory = async (id: string, direction: 'up' | 'down') => {
    const idx = categories.findIndex(c => c._id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const reordered = [...categories];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    setCategories(reordered);

    try {
      await api.post('/admin/categories/reorder', {
        categories: reordered.map((c, i) => ({ id: c._id, order: i })),
      });
    } catch {
      showError('Failed to reorder categories');
      fetchCategories();
    }
  };

  // Navigation helpers
  const openDetail = (id: string) => {
    fetchTemplateDetail(id);
    setActiveView('detail');
  };

  const openEdit = (t: Template) => {
    setSelectedTemplate(t);
    setEditForm({
      price: t.price,
      description: t.description,
      category: typeof t.category === 'object' ? t.category._id : t.category,
      isFeatured: t.isFeatured,
      licenseType: t.licenseType || 'personal',
      metaDescription: t.metaDescription || '',
    });
    setActiveView('edit');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === templates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(templates.map(t => t._id)));
    }
  };

  const hasActiveFilters = filters.status || filters.platform || filters.category || filters.featured || filters.priceMin || filters.priceMax || filters.search;

  /* ====== Nav items ====== */
  const totalTemplates = stats ? Object.values(stats.byStatus).reduce((a, b) => a + b, 0) : 0;

  const navItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, onClick: () => setActiveView('overview'), section: 'main' },
    { label: 'All Templates', icon: FileText, onClick: () => { setActiveView('templates'); setSelectedIds(new Set()); }, badge: stats?.byStatus?.pending || 0, section: 'Templates' },
    { label: 'Featured', icon: Star, onClick: () => { setFilters({ ...DEFAULT_FILTERS, featured: 'true' }); setActiveView('templates'); }, badge: stats?.featuredCount || 0, section: 'Templates' },
    { label: 'Categories', icon: Tag, onClick: () => { setActiveView('categories'); fetchCategories(); }, section: 'Management' },
    { label: 'Back to Admin', icon: ArrowLeft, href: '/dashboard/admin', section: 'Navigation' },
  ];

  /* ====== Feedback bar ====== */
  const FeedbackBar = () => (
    <>
      {successMsg && (
        <div className="bg-success-light border border-success/30 text-success-dark rounded-lg px-4 py-3 text-sm mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-error-light border border-error/30 text-error-dark rounded-lg px-4 py-3 text-sm mb-4 flex items-center gap-2">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}
    </>
  );

  /* ================================================================
     OVERVIEW VIEW
     ================================================================ */
  const renderOverview = () => {
    if (statsLoading) {
      return <div className="text-center py-12 text-neutral-500">Loading analytics...</div>;
    }
    if (!stats) return null;

    const statCards = [
      { label: 'Total Templates', value: totalTemplates, icon: Package, color: 'text-primary-500 bg-primary-50' },
      { label: 'Pending Review', value: stats.byStatus.pending || 0, icon: AlertTriangle, color: 'text-warning bg-warning-light' },
      { label: 'Approved', value: stats.byStatus.approved || 0, icon: CheckCircle2, color: 'text-success bg-success-light' },
      { label: 'Rejected', value: stats.byStatus.rejected || 0, icon: XCircle, color: 'text-error bg-error-light' },
      { label: 'Total Revenue', value: formatCurrency(stats.totals.totalRevenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Approval Rate', value: `${stats.approvalRate}%`, icon: TrendingUp, color: 'text-primary-500 bg-primary-50' },
    ];

    return (
      <>
        <FeedbackBar />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map(s => (
            <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon size={16} />
              </div>
              <div className="text-2xl font-bold text-neutral-900">{s.value}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Platform Breakdown */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Globe size={16} className="text-neutral-400" />
              Platform Breakdown
            </h3>
            <div className="space-y-3">
              {stats.byPlatform.length === 0 && (
                <p className="text-sm text-neutral-400">No approved templates yet</p>
              )}
              {stats.byPlatform.map(p => (
                <div key={p._id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="info" size="sm">{platformLabel(p._id)}</Badge>
                    <span className="text-sm text-neutral-600">{p.count} templates</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">{formatCurrency(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Templates */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-neutral-400" />
              Top Templates by Purchases
            </h3>
            <div className="space-y-2">
              {stats.topTemplates.length === 0 && (
                <p className="text-sm text-neutral-400">No purchase data yet</p>
              )}
              {stats.topTemplates.slice(0, 5).map((t, i) => (
                <button
                  key={t._id}
                  onClick={() => openDetail(t._id)}
                  className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-neutral-50 transition-colors text-left"
                >
                  <span className="text-xs font-bold text-neutral-300 w-5">{i + 1}</span>
                  {t.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getUploadUrl(`images/${t.thumbnail}`)} alt="" className="w-8 h-8 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">{t.title}</div>
                    <div className="text-xs text-neutral-400">{t.stats.purchases} purchases</div>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">{formatCurrency(t.stats.revenue)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<AlertTriangle size={14} />}
            onClick={() => { setFilters({ ...DEFAULT_FILTERS, status: 'pending' }); setActiveView('templates'); }}
          >
            Review Pending ({stats.byStatus.pending || 0})
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={handleExport}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Tag size={14} />} onClick={() => { setActiveView('categories'); fetchCategories(); }}>
            Manage Categories
          </Button>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div className="mt-6 bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold text-neutral-900 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {stats.recentActivity.map(a => (
                <div key={a._id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                  <Badge variant={statusBadgeVariant(a.status)} size="sm">{a.status}</Badge>
                  <span className="text-sm text-neutral-700 flex-1 truncate">{a.title}</span>
                  <span className="text-xs text-neutral-400">{formatDate(a.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  /* ================================================================
     TEMPLATES LIST VIEW
     ================================================================ */
  const renderTemplatesList = () => (
    <>
      <FeedbackBar />

      {/* Search + Filter Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Filter size={14} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {hasActiveFilters ? '(active)' : ''}
            </Button>
            <select
              value={filters.sort}
              onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="mt-3 flex flex-wrap gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilters(f => ({ ...f, status: tab.value }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filters.status === tab.value
                  ? 'bg-white shadow-sm text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
              {stats && tab.value && stats.byStatus[tab.value] !== undefined && (
                <span className="ml-1 text-neutral-400">({stats.byStatus[tab.value]})</span>
              )}
            </button>
          ))}
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Platform</label>
              <div className="flex gap-1">
                {PLATFORM_PILLS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setFilters(f => ({ ...f, platform: p.value }))}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      filters.platform === p.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Price Range</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Featured</label>
              <select
                value={filters.featured}
                onChange={e => setFilters(f => ({ ...f, featured: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All</option>
                <option value="true">Featured Only</option>
                <option value="false">Not Featured</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ ...DEFAULT_FILTERS })}
                className="col-span-full flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium"
              >
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-primary-700">{selectedIds.size} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => handleBulkAction('approve')} isLoading={bulkProcessing}>
              Approve
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleBulkAction('reject')} isLoading={bulkProcessing}>
              Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('feature')} isLoading={bulkProcessing} leftIcon={<Star size={12} />}>
              Feature
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('unfeature')} isLoading={bulkProcessing} leftIcon={<StarOff size={12} />}>
              Unfeature
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleBulkAction('delete')} isLoading={bulkProcessing} leftIcon={<Trash2 size={12} />}>
              Delete
            </Button>
          </div>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-primary-500 hover:text-primary-600 ml-auto">
            Clear selection
          </button>
        </div>
      )}

      {/* Template Rows */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-neutral-100 bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={templates.length > 0 && selectedIds.size === templates.length}
              onChange={toggleSelectAll}
              className="rounded border-neutral-300"
            />
          </div>
          <div className="col-span-3">Template</div>
          <div className="col-span-2 hidden md:block">Creator</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 hidden sm:block">Platform</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1 hidden lg:block">Views</div>
          <div className="col-span-2">Actions</div>
        </div>

        {templatesLoading ? (
          <div className="text-center py-12 text-neutral-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={32} className="mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500 text-sm">No templates found</p>
            {hasActiveFilters && (
              <button onClick={() => setFilters({ ...DEFAULT_FILTERS })} className="text-primary-500 text-sm mt-2 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          templates.map(t => (
            <div
              key={t._id}
              className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors items-center"
            >
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.has(t._id)}
                  onChange={() => toggleSelect(t._id)}
                  className="rounded border-neutral-300"
                />
              </div>
              <div className="col-span-3 flex items-center gap-3 min-w-0">
                {t.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getUploadUrl(`images/${t.thumbnail}`)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 shrink-0" />
                )}
                <div className="min-w-0">
                  <button onClick={() => openDetail(t._id)} className="text-sm font-medium text-neutral-900 truncate block hover:text-primary-500 text-left">
                    {t.title}
                  </button>
                  <span className="text-xs text-neutral-400 truncate block">{t.slug}</span>
                </div>
              </div>
              <div className="col-span-2 hidden md:block">
                {typeof t.creatorProfileId === 'object' && t.creatorProfileId ? (
                  <Link href="/dashboard/admin/creators" className="group flex items-center gap-1.5 min-w-0">
                    <span className="text-sm text-neutral-600 truncate group-hover:text-primary-600 transition-colors">
                      {t.creatorProfileId.displayName}
                    </span>
                    {t.creatorProfileId.isVerified && (
                      <CheckCircle size={12} className="text-success shrink-0" />
                    )}
                  </Link>
                ) : (
                  <span className="text-sm text-neutral-400">—</span>
                )}
              </div>
              <div className="col-span-1">
                <Badge variant={statusBadgeVariant(t.status)} size="sm">{t.status}</Badge>
              </div>
              <div className="col-span-1 hidden sm:block">
                <span className="text-xs text-neutral-500">{platformLabel(t.platform)}</span>
              </div>
              <div className="col-span-1">
                <span className="text-sm font-medium text-neutral-900">${t.price}</span>
              </div>
              <div className="col-span-1 hidden lg:block">
                <span className="text-xs text-neutral-500">{t.stats?.views || 0}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                <button onClick={() => openDetail(t._id)} className="p-1.5 hover:bg-neutral-100 rounded-lg" title="View">
                  <Eye size={14} className="text-neutral-400" />
                </button>
                <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-neutral-100 rounded-lg" title="Edit">
                  <Edit3 size={14} className="text-neutral-400" />
                </button>
                <button onClick={() => handleToggleFeatured(t._id, t.isFeatured)} className="p-1.5 hover:bg-neutral-100 rounded-lg" title={t.isFeatured ? 'Unfeature' : 'Feature'}>
                  {t.isFeatured ? <Star size={14} className="text-amber-400 fill-amber-400" /> : <StarOff size={14} className="text-neutral-400" />}
                </button>
                {t.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(t._id)} className="p-1.5 hover:bg-success-light rounded-lg" title="Approve">
                      <CheckCircle2 size={14} className="text-success" />
                    </button>
                    <button onClick={() => { setRejectTargetId(t._id); setRejectModalOpen(true); }} className="p-1.5 hover:bg-error-light rounded-lg" title="Reject">
                      <XCircle size={14} className="text-error" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setDeleteTargetId(t._id); setDeleteModalOpen(true); }}
                  className="p-1.5 hover:bg-error-light rounded-lg"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-neutral-400 hover:text-error" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-neutral-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft size={14} />}
              onClick={() => fetchTemplates(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Prev
            </Button>
            <span className="text-sm text-neutral-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              onClick={() => fetchTemplates(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );

  /* ================================================================
     TEMPLATE DETAIL VIEW
     ================================================================ */
  const renderDetail = () => {
    if (detailLoading) {
      return <div className="text-center py-12 text-neutral-500">Loading template...</div>;
    }
    if (!selectedTemplate) return null;

    const t = selectedTemplate;

    return (
      <>
        <FeedbackBar />

        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setActiveView('templates')}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft size={16} /> Back to templates
          </button>
          <div className="flex gap-2">
            {t.status === 'pending' && (
              <>
                <Button variant="primary" size="sm" leftIcon={<CheckCircle2 size={14} />} onClick={() => handleApprove(t._id)}>
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<XCircle size={14} />}
                  onClick={() => { setRejectTargetId(t._id); setRejectModalOpen(true); }}
                >
                  Reject
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" leftIcon={<Edit3 size={14} />} onClick={() => openEdit(t)}>
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => { setDeleteTargetId(t._id); setDeleteModalOpen(true); }}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thumbnail */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              {t.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getUploadUrl(`images/${t.thumbnail}`)} alt={t.title} className="w-full aspect-video object-cover" />
              ) : (
                <div className="w-full aspect-video bg-neutral-100 flex items-center justify-center text-neutral-400">
                  No thumbnail
                </div>
              )}
            </div>

            {/* Gallery */}
            {(t.gallery?.length ?? 0) > 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <h3 className="font-semibold text-neutral-900 mb-3">Gallery ({t.gallery.length})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {t.gallery.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={getUploadUrl(`images/${img}`)} alt="" className="rounded-lg aspect-video object-cover" />
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h3 className="font-semibold text-neutral-900 mb-3">Description</h3>
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{t.description}</p>
            </div>

            {/* Rejection Reason */}
            {t.status === 'rejected' && t.rejectionReason && (
              <div className="bg-error-light border border-error/20 rounded-xl p-5">
                <h3 className="font-semibold text-error-dark mb-2">Rejection Reason</h3>
                <p className="text-sm text-error-dark">{t.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status & Meta */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Status</span>
                <Badge variant={statusBadgeVariant(t.status)}>{t.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Platform</span>
                <span className="text-sm font-medium">{platformLabel(t.platform)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Price</span>
                <span className="text-sm font-bold text-neutral-900">${t.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Category</span>
                <span className="text-sm">{typeof t.category === 'object' ? t.category.name : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">License</span>
                <span className="text-sm capitalize">{t.licenseType || 'personal'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Featured</span>
                <button onClick={() => handleToggleFeatured(t._id, t.isFeatured)}>
                  {t.isFeatured ? <Star size={16} className="text-amber-400 fill-amber-400" /> : <StarOff size={16} className="text-neutral-300" />}
                </button>
              </div>
              {t.demoUrl && (
                <a href={t.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600">
                  <ExternalLink size={14} /> View Demo
                </a>
              )}
              <div className="text-xs text-neutral-400">Created {formatDate(t.createdAt)}</div>
            </div>

            {/* Stats */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Analytics</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Views', value: t.stats?.views || 0 },
                  { label: 'Purchases', value: t.stats?.purchases || 0 },
                  { label: 'Revenue', value: formatCurrency(t.stats?.revenue || 0) },
                  { label: 'Likes', value: t.stats?.likes || 0 },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-lg font-bold text-neutral-900">{s.value}</div>
                    <div className="text-xs text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator */}
            {typeof t.creatorProfileId === 'object' && t.creatorProfileId && (
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Creator</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                    {t.creatorProfileId.displayName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-neutral-900">{t.creatorProfileId.displayName}</span>
                      {t.creatorProfileId.isVerified && (
                        <ShieldCheck size={14} className="text-success" />
                      )}
                    </div>
                    <div className="text-xs text-neutral-400">@{t.creatorProfileId.username}</div>
                  </div>
                </div>
                {/* Creator Stats */}
                {t.creatorProfileId.stats && (
                  <div className="flex gap-4 mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                    <span><strong className="text-neutral-700">{t.creatorProfileId.stats.templateCount}</strong> templates</span>
                    <span><strong className="text-neutral-700">${(t.creatorProfileId.stats.totalRevenue || 0).toFixed(0)}</strong> revenue</span>
                    <span><strong className="text-neutral-700">{t.creatorProfileId.stats.totalSales || 0}</strong> sales</span>
                  </div>
                )}
                {/* Onboarding status */}
                {t.creatorProfileId.onboarding && (
                  <div className="mt-2">
                    <Badge
                      size="sm"
                      variant={
                        t.creatorProfileId.onboarding.status === 'approved' ? 'success' :
                        t.creatorProfileId.onboarding.status === 'submitted' ? 'warning' :
                        t.creatorProfileId.onboarding.status === 'rejected' ? 'error' : 'neutral'
                      }
                    >
                      {t.creatorProfileId.onboarding.status?.replace(/_/g, ' ') || 'unknown'}
                    </Badge>
                  </div>
                )}
                <Link
                  href="/dashboard/admin/creators"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline"
                >
                  <Eye size={12} /> View in Creator Manager
                </Link>
              </div>
            )}

            {/* Tags */}
            {t.tags && t.tags.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {t.tags.map(tag => (
                    <span key={typeof tag === 'object' ? tag._id : tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                      {typeof tag === 'object' ? tag.name : tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  /* ================================================================
     TEMPLATE EDIT VIEW
     ================================================================ */
  const renderEdit = () => {
    if (!selectedTemplate) return null;

    return (
      <>
        <FeedbackBar />

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => { setActiveView('detail'); fetchTemplateDetail(selectedTemplate._id); }}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft size={16} /> Back to details
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setActiveView('detail'); fetchTemplateDetail(selectedTemplate._id); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit} isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </div>

        <div className="max-w-2xl">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">
            Edit: {selectedTemplate.title}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Price ($)</label>
              <input
                type="number"
                value={String(editForm.price || '')}
                onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Description</label>
              <textarea
                value={String(editForm.description || '')}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={6}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Category</label>
              <select
                value={String(editForm.category || '')}
                onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">License Type</label>
              <select
                value={String(editForm.licenseType || 'personal')}
                onChange={e => setEditForm(f => ({ ...f, licenseType: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="personal">Personal</option>
                <option value="commercial">Commercial</option>
                <option value="extended">Extended</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Meta Description (SEO)</label>
              <textarea
                value={String(editForm.metaDescription || '')}
                onChange={e => setEditForm(f => ({ ...f, metaDescription: e.target.value }))}
                rows={2}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editForm.isFeatured}
                  onChange={e => setEditForm(f => ({ ...f, isFeatured: e.target.checked }))}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-700">Featured template</span>
              </label>
            </div>
          </div>
        </div>
      </>
    );
  };

  /* ================================================================
     CATEGORIES VIEW
     ================================================================ */
  const renderCategories = () => (
    <>
      <FeedbackBar />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Categories</h2>
          <p className="text-sm text-neutral-500">{categories.length} categories</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ name: '', description: '', icon: '', color: '#6366f1', isActive: true });
            setCategoryModalOpen(true);
          }}
        >
          Create Category
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-neutral-100 bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <div className="col-span-1">Order</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Slug</div>
          <div className="col-span-1">Color</div>
          <div className="col-span-1">Templates</div>
          <div className="col-span-1">Active</div>
          <div className="col-span-3">Actions</div>
        </div>

        {categoriesLoading ? (
          <div className="text-center py-12 text-neutral-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag size={32} className="mx-auto text-neutral-300 mb-3" />
            <p className="text-neutral-500 text-sm">No categories yet</p>
          </div>
        ) : (
          categories.map((c, i) => (
            <div key={c._id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 items-center">
              <div className="col-span-1 flex gap-1">
                <button
                  onClick={() => handleReorderCategory(c._id, 'up')}
                  disabled={i === 0}
                  className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30"
                >
                  <ChevronUp size={14} className="text-neutral-400" />
                </button>
                <button
                  onClick={() => handleReorderCategory(c._id, 'down')}
                  disabled={i === categories.length - 1}
                  className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30"
                >
                  <ChevronDown size={14} className="text-neutral-400" />
                </button>
              </div>
              <div className="col-span-3 text-sm font-medium text-neutral-900">{c.name}</div>
              <div className="col-span-2 text-xs text-neutral-400">{c.slug}</div>
              <div className="col-span-1">
                {c.color && <div className="w-5 h-5 rounded" style={{ backgroundColor: c.color }} />}
              </div>
              <div className="col-span-1 text-sm text-neutral-600">{c.templateCount || 0}</div>
              <div className="col-span-1">
                <Badge variant={c.isActive !== false ? 'success' : 'neutral'} size="sm">
                  {c.isActive !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="col-span-3 flex gap-1">
                <button
                  onClick={() => {
                    setEditingCategory(c);
                    setCategoryForm({
                      name: c.name,
                      description: c.description || '',
                      icon: c.icon || '',
                      color: c.color || '#6366f1',
                      isActive: c.isActive !== false,
                    });
                    setCategoryModalOpen(true);
                  }}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg"
                  title="Edit"
                >
                  <Edit3 size={14} className="text-neutral-400" />
                </button>
                <button
                  onClick={() => { setDeleteCategoryId(c._id); setDeleteCategoryModalOpen(true); }}
                  className="p-1.5 hover:bg-error-light rounded-lg"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-neutral-400 hover:text-error" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  /* ================================================================
     MODALS
     ================================================================ */
  const renderModals = () => (
    <>
      {/* Delete Template Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTargetId(null); }}
        title="Delete Template"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setDeleteModalOpen(false); setDeleteTargetId(null); }}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} isLoading={deleting}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          Are you sure you want to permanently delete this template? This action cannot be undone.
        </p>
      </Modal>

      {/* Reject Template Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => { setRejectModalOpen(false); setRejectTargetId(null); setRejectReason(''); }}
        title="Reject Template"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setRejectModalOpen(false); setRejectTargetId(null); setRejectReason(''); }}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject
            </Button>
          </div>
        }
      >
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Reason for rejection</label>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Explain why this template is being rejected..."
            rows={3}
            className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
          />
        </div>
      </Modal>

      {/* Bulk Reject Modal */}
      <Modal
        isOpen={bulkRejectModalOpen}
        onClose={() => { setBulkRejectModalOpen(false); setBulkRejectReason(''); }}
        title={`Reject ${selectedIds.size} Templates`}
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setBulkRejectModalOpen(false); setBulkRejectReason(''); }}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleBulkReject} isLoading={bulkProcessing} disabled={!bulkRejectReason.trim()}>
              Reject All
            </Button>
          </div>
        }
      >
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Reason for rejection (applied to all)</label>
          <textarea
            value={bulkRejectReason}
            onChange={e => setBulkRejectReason(e.target.value)}
            placeholder="Reason..."
            rows={3}
            className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
          />
        </div>
      </Modal>

      {/* Category Create/Edit Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => { setCategoryModalOpen(false); setEditingCategory(null); }}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setCategoryModalOpen(false); setEditingCategory(null); }}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveCategory} isLoading={categorySaving} disabled={!categoryForm.name.trim()}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Name *</label>
            <input
              value={categoryForm.name}
              onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="e.g. SaaS Templates"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Description</label>
            <textarea
              value={categoryForm.description}
              onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Icon</label>
              <input
                value={categoryForm.icon}
                onChange={e => setCategoryForm(f => ({ ...f, icon: e.target.value }))}
                className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="e.g. layout"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={e => setCategoryForm(f => ({ ...f, color: e.target.value }))}
                  className="w-10 h-10 rounded border border-neutral-200 cursor-pointer"
                />
                <span className="text-xs text-neutral-400">{categoryForm.color}</span>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={categoryForm.isActive}
              onChange={e => setCategoryForm(f => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-700">Active</span>
          </label>
        </div>
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        isOpen={deleteCategoryModalOpen}
        onClose={() => { setDeleteCategoryModalOpen(false); setDeleteCategoryId(null); }}
        title="Delete Category"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setDeleteCategoryModalOpen(false); setDeleteCategoryId(null); }}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          Are you sure? Categories with templates assigned to them cannot be deleted.
        </p>
      </Modal>
    </>
  );

  /* ================================================================
     Sidebar navigation groups
     ================================================================ */
  const sections = Array.from(new Set(navItems.map(n => n.section)));

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Template Manager</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage all marketplace templates</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={handleExport}>
          Export
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sub-navigation sidebar */}
        <aside className="w-52 shrink-0 hidden lg:block">
          <nav className="sticky top-4 space-y-6">
            {sections.map(section => (
              <div key={section}>
                {section !== 'main' && (
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-3">
                    {section}
                  </div>
                )}
                <div className="space-y-0.5">
                  {navItems
                    .filter(n => n.section === section)
                    .map(item => {
                      if (item.href) {
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      }

                      const isActive =
                        (item.label === 'Overview' && activeView === 'overview') ||
                        (item.label === 'All Templates' && (activeView === 'templates' || activeView === 'detail' || activeView === 'edit')) ||
                        (item.label === 'Featured' && activeView === 'featured') ||
                        (item.label === 'Categories' && activeView === 'categories');

                      return (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <item.icon size={16} />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="text-[10px] font-bold bg-primary-100 text-primary-600 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeView === 'overview' && renderOverview()}
          {(activeView === 'templates' || activeView === 'featured') && renderTemplatesList()}
          {activeView === 'detail' && renderDetail()}
          {activeView === 'edit' && renderEdit()}
          {activeView === 'categories' && renderCategories()}
        </div>
      </div>

      {renderModals()}
    </div>
  );
};
