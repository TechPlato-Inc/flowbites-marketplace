'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getUploadUrl } from '@/lib/api/client';
import { DashboardSidebar, type NavItem } from '@/components/layout/DashboardSidebar';
import { Button, Badge, Card } from '@/design-system';
import { COMBINED_STATUS_BADGE } from '@/lib/constants';
import type { Order, License, ServiceOrder, Template } from '@/types';
import {
  Package, FileText, MessageSquare, Wrench, LayoutDashboard,
  ShoppingBag, Key, Search, ExternalLink, Copy, Palette, FileDown,
} from 'lucide-react';

type View = 'overview' | 'templates' | 'orders' | 'services';

const getDeliveryLabel = (template: Template) => {
  const platform = template.platform;
  const deliveryType = template.deliveryType;
  if (platform === 'webflow' || deliveryType === 'clone_link') return 'Clone to Webflow';
  if (platform === 'framer' || deliveryType === 'remix_link') return 'Remix in Framer';
  if (platform === 'wix') return template.templateFile ? 'Download Files' : 'Request Files';
  return 'Access Template';
};

const getDeliveryIcon = (template: Template) => {
  if (template.platform === 'webflow') return <Copy size={14} />;
  if (template.platform === 'framer') return <Palette size={14} />;
  return <FileDown size={14} />;
};

const getAccessLabel = (template: Template) => {
  if (template.platform === 'webflow') return 'clones';
  if (template.platform === 'framer') return 'remixes';
  return 'accesses';
};

export function BuyerDashboardView() {
  const [activeView, setActiveView] = useState<View>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, licensesRes, serviceOrdersRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/downloads/licenses/my-licenses'),
          api.get('/services/orders/my-orders'),
        ]);
        setOrders(ordersRes.data.data);
        setLicenses(licensesRes.data.data);
        setServiceOrders(serviceOrdersRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAccess = async (license: License) => {
    const template = license.templateId;
    const platform = template.platform;
    const deliveryUrl = template.deliveryUrl;

    if ((platform === 'webflow' || platform === 'framer') && deliveryUrl) {
      try { await api.post('/downloads/token', { templateId: template._id }); } catch {}
      window.open(deliveryUrl, '_blank');
      return;
    }

    try {
      const { data } = await api.post('/downloads/token', { templateId: template._id });
      window.location.href = data.data.downloadUrl;
    } catch (error) {
      console.error('Access failed:', error);
      alert('Failed to access template. Please try again.');
    }
  };

  const activeServiceOrders = serviceOrders.filter(
    o => ['requested', 'accepted', 'in_progress', 'revision_requested', 'delivered'].includes(o.status)
  ).length;

  const totalSpent = orders.reduce((sum, o) => sum + (o.status === 'paid' ? o.total : 0), 0);

  const navItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, onClick: () => setActiveView('overview'), section: 'main' },
    { label: 'My Templates', icon: FileText, onClick: () => setActiveView('templates'), section: 'Library' },
    { label: 'Purchase History', icon: ShoppingBag, onClick: () => setActiveView('orders'), section: 'Library' },
    { label: 'Service Orders', icon: Wrench, onClick: () => setActiveView('services'), badge: activeServiceOrders, section: 'Services' },
  ];

  const statusBadge = (status: string) => COMBINED_STATUS_BADGE[status] || 'neutral';

  const filteredLicenses = licenses.filter(l =>
    !searchQuery || l.templateId.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      title="My Dashboard"
      subtitle="Your templates & orders"
      navItems={navItems}
      headerActions={
        <Link href="/templates">
          <Button size="sm" variant="outline" leftIcon={<ExternalLink size={14} />}>
            Browse Templates
          </Button>
        </Link>
      }
    >
      {/* Overview */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">Templates</span>
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                  <FileText size={18} className="text-primary-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{licenses.length}</div>
              <p className="text-xs text-neutral-400 mt-1">Licensed templates</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">Accesses</span>
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                  <ExternalLink size={18} className="text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {licenses.reduce((sum, l) => sum + l.downloadCount, 0)}
              </div>
              <p className="text-xs text-neutral-400 mt-1">Total accesses</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">Purchases</span>
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={18} className="text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{orders.length}</div>
              <p className="text-xs text-neutral-400 mt-1">${totalSpent} total spent</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">Active Services</span>
                <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Wrench size={18} className="text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{activeServiceOrders}</div>
              <p className="text-xs text-neutral-400 mt-1">In progress</p>
            </div>
          </div>

          {/* Recent Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">My Templates</h3>
              {licenses.length > 0 && (
                <button onClick={() => setActiveView('templates')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all
                </button>
              )}
            </div>
            {licenses.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
                <Package size={40} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-600 mb-4">You haven&apos;t purchased any templates yet</p>
                <Link href="/templates"><Button size="sm">Browse Templates</Button></Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {licenses.slice(0, 6).map((license) => (
                  <Card key={license._id} hover={false} className="!rounded-xl">
                    <Card.Image
                      src={getUploadUrl(`images/${license.templateId.thumbnail}`)}
                      alt={license.templateId.title}
                      badge={
                        <Badge variant="success" size="sm">
                          {license.templateId.platform === 'webflow' ? 'Webflow' :
                           license.templateId.platform === 'framer' ? 'Framer' : 'Wix'}
                        </Badge>
                      }
                    />
                    <Card.Content className="!p-4">
                      <h4 className="font-semibold text-neutral-900 truncate mb-2">{license.templateId.title}</h4>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Key size={12} />
                          <span className="font-mono">{license.licenseKey.slice(0, 12)}...</span>
                        </div>
                        <span className="text-xs text-neutral-500">
                          {license.downloadCount}/{license.maxDownloads} {getAccessLabel(license.templateId)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        leftIcon={getDeliveryIcon(license.templateId)}
                        onClick={() => handleAccess(license)}
                        disabled={license.downloadCount >= license.maxDownloads}
                      >
                        {getDeliveryLabel(license.templateId)}
                      </Button>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Service Orders */}
          {serviceOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Service Orders</h3>
                <button onClick={() => setActiveView('services')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</button>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {serviceOrders.slice(0, 5).map((order, idx) => {
                  const creator = typeof order.creatorId === 'object' ? order.creatorId : null;
                  return (
                    <Link
                      key={order._id}
                      href={`/service-orders/${order._id}`}
                      className={`flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors ${idx > 0 ? 'border-t border-neutral-100' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                          <Wrench size={18} className="text-neutral-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{order.packageName}</p>
                          <p className="text-xs text-neutral-500">{creator?.name || 'Creator'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge size="sm" variant={statusBadge(order.status)}>{order.status.replace(/_/g, ' ')}</Badge>
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

      {/* My Templates */}
      {activeView === 'templates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-display font-bold text-neutral-900">My Templates</h2>
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

          {filteredLicenses.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <Package size={40} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 mb-4">
                {licenses.length === 0 ? "You haven't purchased any templates yet" : 'No templates match your search'}
              </p>
              {licenses.length === 0 && (
                <Link href="/templates"><Button>Browse Templates</Button></Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredLicenses.map((license) => (
                <Card key={license._id} hover={false} className="!rounded-xl">
                  <Card.Image
                    src={getUploadUrl(`images/${license.templateId.thumbnail}`)}
                    alt={license.templateId.title}
                    badge={
                      <Badge variant="success" size="sm">
                        {license.templateId.platform === 'webflow' ? 'Webflow' :
                         license.templateId.platform === 'framer' ? 'Framer' : 'Wix'}
                      </Badge>
                    }
                  />
                  <Card.Content className="!p-4">
                    <h4 className="font-semibold text-neutral-900 truncate mb-1">{license.templateId.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                      <Key size={12} />
                      <span className="font-mono">{license.licenseKey.slice(0, 16)}...</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-neutral-600">
                        {getAccessLabel(license.templateId)}: {license.downloadCount}/{license.maxDownloads}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(license.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-3">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((license.downloadCount / license.maxDownloads) * 100, 100)}%` }}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      leftIcon={getDeliveryIcon(license.templateId)}
                      onClick={() => handleAccess(license)}
                      disabled={license.downloadCount >= license.maxDownloads}
                    >
                      {license.downloadCount >= license.maxDownloads ? 'Limit Reached' : getDeliveryLabel(license.templateId)}
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Purchase History */}
      {activeView === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-neutral-900">Purchase History</h2>
          {orders.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <ShoppingBag size={40} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 mb-4">No purchases yet</p>
              <Link href="/templates"><Button size="sm">Browse Templates</Button></Link>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              {orders.map((order, idx) => (
                <div key={order._id} className={`p-4 ${idx > 0 ? 'border-t border-neutral-100' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                        <ShoppingBag size={18} className="text-neutral-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-neutral-500 font-mono">{order.orderNumber}</span>
                          <span className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge size="sm" variant={statusBadge(order.status)}>{order.status}</Badge>
                      <span className="text-sm font-semibold text-neutral-900">${order.total}</span>
                    </div>
                  </div>
                  {order.items.length > 0 && (
                    <div className="mt-2 ml-[52px]">
                      <div className="flex flex-wrap gap-1.5">
                        {order.items.map((item, i) => (
                          <span key={i} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{item.title}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service Orders */}
      {activeView === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-neutral-900">Service Orders</h2>
            <Link href="/services"><Button size="sm" variant="outline">Browse Services</Button></Link>
          </div>
          {serviceOrders.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <Wrench size={40} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 mb-4">No service orders yet</p>
              <Link href="/services"><Button size="sm" variant="outline">Browse Services</Button></Link>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              {serviceOrders.map((order, idx) => {
                const creator = typeof order.creatorId === 'object' ? order.creatorId : null;
                return (
                  <Link
                    key={order._id}
                    href={`/service-orders/${order._id}`}
                    className={`flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors ${idx > 0 ? 'border-t border-neutral-100' : ''}`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                        <Wrench size={18} className="text-neutral-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-900 truncate">{order.packageName}</p>
                          {order.isGenericRequest && <Badge size="sm" variant="warning">Custom</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-neutral-500">{creator?.name || 'Creator'}</span>
                          <span className="text-xs text-neutral-400 font-mono">{order.orderNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-semibold text-neutral-900 hidden sm:block">${order.price}</span>
                      <Badge size="sm" variant={statusBadge(order.status)}>{order.status.replace(/_/g, ' ')}</Badge>
                      {order.dueDate && (
                        <span className="text-xs text-neutral-500 hidden md:block">Due {new Date(order.dueDate).toLocaleDateString()}</span>
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
}
