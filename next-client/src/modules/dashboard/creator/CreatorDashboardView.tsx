'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getUploadUrl } from '@/lib/api/client';
import { Template, ServicePackage, ServiceOrder } from '@/types';
import { Button, Badge, Card } from '@/design-system';
import { DashboardSidebar, type NavItem } from '@/components/layout/DashboardSidebar';
import { COMBINED_STATUS_BADGE } from '@/lib/constants';
import {
  Plus, DollarSign, Package, Eye, MessageSquare, Send, LayoutDashboard,
  FileText, Wrench, ClipboardList, TrendingUp, Search, Shield, ArrowRight,
} from 'lucide-react';

type View = 'overview' | 'templates' | 'services' | 'orders';
type TemplateFilter = 'all' | 'approved' | 'pending' | 'draft' | 'rejected';

export const CreatorDashboardView = () => {
  const [activeView, setActiveView] = useState<View>('overview');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (activeView === 'services' && services.length === 0) fetchServices();
    if ((activeView === 'orders' || activeView === 'overview') && serviceOrders.length === 0) fetchServiceOrders();
  }, [activeView]);

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/templates/my-templates');
      const userTemplates = data.data.templates;
      setTemplates(userTemplates);

      const revenue = userTemplates.reduce((sum: number, t: Template) => sum + (t.stats.purchases * t.price), 0);
      const sales = userTemplates.reduce((sum: number, t: Template) => sum + t.stats.purchases, 0);
      const views = userTemplates.reduce((sum: number, t: Template) => sum + t.stats.views, 0);
      setStats({ totalRevenue: revenue, totalSales: sales, totalViews: views });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services/packages/mine');
      setServices(data.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchServiceOrders = async () => {
    try {
      const { data } = await api.get('/services/orders/my-orders');
      setServiceOrders(data.data);
    } catch (error) {
      console.error('Failed to fetch service orders:', error);
    }
  };

  const activeOrderCount = serviceOrders.filter(
    o => ['requested', 'accepted', 'in_progress', 'revision_requested'].includes(o.status)
  ).length;

  const navItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, onClick: () => setActiveView('overview'), section: 'main' },
    { label: 'Templates', icon: FileText, onClick: () => setActiveView('templates'), section: 'Manage' },
    { label: 'Services', icon: Wrench, onClick: () => setActiveView('services'), section: 'Manage' },
    { label: 'Orders', icon: ClipboardList, onClick: () => setActiveView('orders'), badge: activeOrderCount, section: 'Manage' },
    { label: 'Analytics', icon: TrendingUp, section: 'Insights' },
  ];

  const filteredTemplates = templates.filter(t => {
    const matchesFilter = templateFilter === 'all' || t.status === templateFilter;
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const templateFilterTabs: { key: TemplateFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: templates.length },
    { key: 'approved', label: 'Approved', count: templates.filter(t => t.status === 'approved').length },
    { key: 'pending', label: 'Pending', count: templates.filter(t => t.status === 'pending').length },
    { key: 'draft', label: 'Draft', count: templates.filter(t => t.status === 'draft').length },
    { key: 'rejected', label: 'Rejected', count: templates.filter(t => t.status === 'rejected').length },
  ];

  const statusBadge = (status: string) => {
    return COMBINED_STATUS_BADGE[status] || 'neutral';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-neutral-500 text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardSidebar
      title="Creator Studio"
      subtitle="Manage your templates & services"
      navItems={navItems}
      headerActions={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/creator/upload-template">
            <Button size="sm" leftIcon={<Plus size={16} />}>
              Upload Template
            </Button>
          </Link>
          <Link href="/dashboard/creator/create-service">
            <Button size="sm" variant="outline" leftIcon={<Plus size={16} />}>
              Create Service
            </Button>
          </Link>
        </div>
      }
    >
      {/* ============ OVERVIEW ============ */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* Verification Banner */}
          <Link
            href="/dashboard/creator/onboarding"
            className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Shield size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm">Complete your creator verification</h3>
                <p className="text-xs text-neutral-500">Verify your identity to unlock selling and payouts on Flowbites</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">Total Revenue</span>
                <div className="w-9 h-9 bg-success-light rounded-lg flex items-center justify-center">
                  <DollarSign size={18} className="text-success" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-neutral-400 mt-1">From template sales</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">Total Sales</span>
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Package size={18} className="text-primary-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{stats.totalSales}</div>
              <p className="text-xs text-neutral-400 mt-1">Templates sold</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">Total Views</span>
                <div className="w-9 h-9 bg-info-light rounded-lg flex items-center justify-center">
                  <Eye size={18} className="text-info" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-neutral-400 mt-1">Template page views</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">Active Orders</span>
                <div className="w-9 h-9 bg-warning-light rounded-lg flex items-center justify-center">
                  <ClipboardList size={18} className="text-warning" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{activeOrderCount}</div>
              <p className="text-xs text-neutral-400 mt-1">In progress</p>
            </div>
          </div>

          {/* Recent Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Templates</h3>
              <button
                onClick={() => setActiveView('templates')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </button>
            </div>
            {templates.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
                <FileText size={40} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-600 mb-4">No templates yet. Start by uploading your first template.</p>
                <Link href="/dashboard/creator/upload-template">
                  <Button size="sm" leftIcon={<Plus size={16} />}>Upload Template</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {templates.slice(0, 6).map((template) => (
                  <Card key={template._id} hover={false} className="!rounded-xl">
                    <Card.Image
                      src={getUploadUrl(`images/${template.thumbnail}`)}
                      alt={template.title}
                      badge={<Badge variant={statusBadge(template.status)} size="sm">{template.status}</Badge>}
                    />
                    <Card.Content className="!p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-neutral-900 truncate">{template.title}</h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge size="sm" variant="neutral">{template.platform}</Badge>
                            <span className="text-sm font-semibold text-neutral-900">${template.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                        <span className="flex items-center gap-1"><Eye size={12} /> {template.stats.views}</span>
                        <span className="flex items-center gap-1"><Package size={12} /> {template.stats.purchases} sales</span>
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          {serviceOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Recent Orders</h3>
                <button
                  onClick={() => setActiveView('orders')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {serviceOrders.slice(0, 5).map((order, idx) => {
                  const buyer = typeof order.buyerId === 'object' ? order.buyerId : null;
                  return (
                    <Link
                      key={order._id}
                      href={`/service-orders/${order._id}`}
                      className={`flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors ${
                        idx > 0 ? 'border-t border-neutral-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                          <Wrench size={18} className="text-neutral-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{order.packageName}</p>
                          <p className="text-xs text-neutral-500">{buyer?.name || 'Buyer'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge size="sm" variant={statusBadge(order.status)}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm font-semibold text-neutral-900">${order.price}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ TEMPLATES ============ */}
      {activeView === 'templates' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-display font-bold text-neutral-900">My Templates</h2>
            <Link href="/dashboard/creator/upload-template">
              <Button size="sm" leftIcon={<Plus size={16} />}>Upload Template</Button>
            </Link>
          </div>

          {/* Filter Tabs + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
              {templateFilterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setTemplateFilter(tab.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    templateFilter === tab.key
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1.5 text-xs text-neutral-400">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none w-full sm:w-64"
              />
            </div>
          </div>

          {/* Template Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <FileText size={40} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 mb-4">
                {templates.length === 0
                  ? "You haven't uploaded any templates yet"
                  : 'No templates match your filters'
                }
              </p>
              {templates.length === 0 && (
                <Link href="/dashboard/creator/upload-template">
                  <Button leftIcon={<Plus size={16} />}>Upload Your First Template</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template._id} hover={false} className="!rounded-xl group">
                  <div className="relative">
                    <Card.Image
                      src={getUploadUrl(`images/${template.thumbnail}`)}
                      alt={template.title}
                      badge={<Badge variant={statusBadge(template.status)} size="sm">{template.status}</Badge>}
                    />
                    {template.status === 'draft' && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          leftIcon={<Send size={14} />}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await api.post(`/templates/${template._id}/submit`);
                              fetchTemplates();
                            } catch (err) {
                              console.error('Failed to submit:', err);
                            }
                          }}
                        >
                          Submit for Review
                        </Button>
                      </div>
                    )}
                  </div>
                  <Card.Content className="!p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-neutral-900 truncate">{template.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge size="sm" variant="neutral">{template.platform}</Badge>
                          <span className="text-sm font-semibold text-neutral-900">${template.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Eye size={12} /> {template.stats.views}</span>
                        <span className="flex items-center gap-1"><Package size={12} /> {template.stats.purchases}</span>
                        <span className="flex items-center gap-1"><DollarSign size={12} /> ${template.stats.purchases * template.price}</span>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ SERVICES ============ */}
      {activeView === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-display font-bold text-neutral-900">My Services</h2>
            <Link href="/dashboard/creator/create-service">
              <Button size="sm" leftIcon={<Plus size={16} />}>Create Service</Button>
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <Wrench size={40} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 mb-4">You haven't created any service packages yet</p>
              <Link href="/dashboard/creator/create-service">
                <Button leftIcon={<Plus size={16} />}>Create Your First Service</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {services.map((pkg) => (
                <div key={pkg._id} className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-neutral-900 truncate">{pkg.name}</h4>
                      <Badge size="sm" variant="neutral" className="mt-1">{pkg.category.replace(/-/g, ' ')}</Badge>
                    </div>
                    <Badge size="sm" variant={pkg.isActive ? 'success' : 'neutral'}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-4">{pkg.description}</p>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-100 text-center">
                    <div>
                      <p className="text-lg font-bold text-neutral-900">${pkg.price}</p>
                      <p className="text-xs text-neutral-400">Price</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-neutral-900">{pkg.deliveryDays}d</p>
                      <p className="text-xs text-neutral-400">Delivery</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-neutral-900">{pkg.stats.completed}</p>
                      <p className="text-xs text-neutral-400">Completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ ORDERS ============ */}
      {activeView === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-neutral-900">Service Orders</h2>
          </div>

          {serviceOrders.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <ClipboardList size={40} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600">No service orders yet</p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              {serviceOrders.map((order, idx) => {
                const buyer = typeof order.buyerId === 'object' ? order.buyerId : null;
                return (
                  <Link
                    key={order._id}
                    href={`/service-orders/${order._id}`}
                    className={`flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors ${
                      idx > 0 ? 'border-t border-neutral-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                        <Wrench size={18} className="text-neutral-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-900 truncate">{order.packageName}</p>
                          {order.isGenericRequest && (
                            <Badge size="sm" variant="warning">Custom</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-neutral-500">{buyer?.name || 'Buyer'}</span>
                          <span className="text-xs text-neutral-400 font-mono">{order.orderNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-semibold text-neutral-900 hidden sm:block">${order.price}</span>
                      <Badge size="sm" variant={statusBadge(order.status)}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                      {order.dueDate && (
                        <span className="text-xs text-neutral-500 hidden md:block">
                          Due {new Date(order.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <MessageSquare size={16} className="text-neutral-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardSidebar>
  );
};
