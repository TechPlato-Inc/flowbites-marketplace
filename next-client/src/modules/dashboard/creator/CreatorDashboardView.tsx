"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUploadUrl } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";
import { Template, ServicePackage, ServiceOrder } from "@/types";
import { Button, Badge, Card, Input } from "@/design-system";
import {
  DashboardSidebar,
  type NavItem,
} from "@/components/layout/DashboardSidebar";
import { AnalyticsView } from "./components/AnalyticsView";
import { PublishVersionModal } from "./components/PublishVersionModal";
import { EarningsDashboard } from "./components/EarningsDashboard";
import { TransactionHistory } from "./components/TransactionHistory";
import { WithdrawalPanel } from "./components/WithdrawalPanel";
import { COMBINED_STATUS_BADGE } from "@/lib/constants";
import {
  Plus,
  DollarSign,
  Package,
  Eye,
  MessageSquare,
  Send,
  LayoutDashboard,
  FileText,
  Wrench,
  ClipboardList,
  TrendingUp,
  Search,
  Shield,
  ArrowRight,
  Edit2,
  X,
  History,
  CreditCard,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  GitBranch,
  Wallet,
  Ticket,
} from "lucide-react";

type View =
  | "overview"
  | "templates"
  | "services"
  | "orders"
  | "analytics"
  | "earnings";
type TemplateFilter = "all" | "approved" | "pending" | "draft" | "rejected";

interface ChangeLogEntry {
  editedAt: string;
  editedBy: string;
  changes: { field: string; oldValue: any; newValue: any }[];
  reason: string;
}

export const CreatorDashboardView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [activeView, setActiveView] = useState<View>("overview");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal states
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    salePrice: null as number | null,
    editReason: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Onboarding/verification state
  const [onboardingStatus, setOnboardingStatus] = useState<string>("pending");

  // Stripe Connect states
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    status: "not_connected" | "pending" | "active" | "demo_mode";
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  }>({ connected: false, status: "not_connected" });
  const [stripeLoading, setStripeLoading] = useState(true);
  const [stripeConnecting, setStripeConnecting] = useState(false);

  // Role guard: redirect buyers to their own dashboard
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "buyer") router.replace("/dashboard/buyer");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchTemplates();
    fetchStripeStatus();
    fetchOnboardingStatus();
  }, []);

  useEffect(() => {
    if (activeView === "services" && services.length === 0) fetchServices();
    if (
      (activeView === "orders" || activeView === "overview") &&
      serviceOrders.length === 0
    )
      fetchServiceOrders();
  }, [activeView]);

  // Handle Stripe Connect return/refresh URL parameters
  useEffect(() => {
    const stripeConnected = searchParams.get("stripe_connected");
    const stripeRefresh = searchParams.get("stripe_refresh");
    const stripeDemo = searchParams.get("stripe_demo");

    if (stripeConnected || stripeRefresh || stripeDemo) {
      // Refresh Stripe status after returning from onboarding
      fetchStripeStatus();
      // Clean up URL params
      router.replace("/dashboard/creator", { scroll: false });
    }
  }, [searchParams]);

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get("/templates/my-templates");
      const userTemplates = data.data?.templates ?? [];
      setTemplates(userTemplates);

      const revenue = userTemplates.reduce(
        (sum: number, t: Template) =>
          sum + (t.stats?.purchases ?? 0) * (t.price ?? 0),
        0,
      );
      const sales = userTemplates.reduce(
        (sum: number, t: Template) => sum + (t.stats?.purchases ?? 0),
        0,
      );
      const views = userTemplates.reduce(
        (sum: number, t: Template) => sum + (t.stats?.views ?? 0),
        0,
      );
      setStats({ totalRevenue: revenue, totalSales: sales, totalViews: views });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await api.get("/services/packages/mine");
      setServices(data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const fetchServiceOrders = async () => {
    try {
      const { data } = await api.get("/services/orders/my-orders");
      setServiceOrders(data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch service orders:", error);
    }
  };

  const fetchStripeStatus = async () => {
    try {
      const { data } = await api.get("/creators/connect/status");
      setStripeStatus(data.data);
    } catch (error) {
      console.error("Failed to fetch Stripe status:", error);
    } finally {
      setStripeLoading(false);
    }
  };

  const fetchOnboardingStatus = async () => {
    try {
      const { data } = await api.get("/creators/onboarding/status");
      setOnboardingStatus(data.data?.status || "pending");
    } catch (error) {
      console.error("Failed to fetch onboarding status:", error);
    }
  };

  const handleConnectStripe = async () => {
    setStripeConnecting(true);
    try {
      const { data } = await api.post("/creators/connect/onboard");
      // In demo mode, the server returns demoMode: true with a redirect URL
      if (data.data.demoMode) {
        setStripeStatus({ connected: true, status: "demo_mode" });
        setStripeConnecting(false);
        return;
      }
      if (data.data.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      console.error("Failed to start Stripe onboarding:", error);
      alert("Failed to connect Stripe. Please try again.");
      setStripeConnecting(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      const { data } = await api.get("/creators/connect/dashboard");
      if (data.data.url && data.data.url !== "#") {
        window.open(data.data.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to open Stripe dashboard:", error);
    }
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setEditForm({
      title: template.title,
      description: template.description,
      price: template.price,
      salePrice: template.salePrice || null,
      editReason: "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTemplate(null);
    setShowChangeLog(false);
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;

    setEditLoading(true);
    try {
      const { data } = await api.patch(`/templates/${editingTemplate._id}`, {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        salePrice: editForm.salePrice,
        editReason: editForm.editReason || "Template updated by creator",
      });

      // Update local state
      setTemplates(
        templates.map((t) => (t._id === editingTemplate._id ? data.data : t)),
      );
      closeEditModal();
    } catch (error) {
      console.error("Failed to update template:", error);
      alert("Failed to update template. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const activeOrderCount = serviceOrders.filter((o) =>
    ["requested", "accepted", "in_progress", "revision_requested"].includes(
      o.status,
    ),
  ).length;

  const navItems: NavItem[] = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      onClick: () => setActiveView("overview"),
      isActive: activeView === "overview",
      section: "main",
    },
    {
      label: "Templates",
      icon: FileText,
      onClick: () => setActiveView("templates"),
      isActive: activeView === "templates",
      section: "Manage",
    },
    {
      label: "Services",
      icon: Wrench,
      onClick: () => setActiveView("services"),
      isActive: activeView === "services",
      section: "Manage",
    },
    {
      label: "Orders",
      icon: ClipboardList,
      onClick: () => setActiveView("orders"),
      isActive: activeView === "orders",
      badge: activeOrderCount,
      section: "Manage",
    },
    {
      label: "Earnings",
      icon: Wallet,
      onClick: () => setActiveView("earnings"),
      isActive: activeView === "earnings",
      section: "Insights",
    },
    {
      label: "Analytics",
      icon: TrendingUp,
      onClick: () => setActiveView("analytics"),
      isActive: activeView === "analytics",
      section: "Insights",
    },
    {
      label: "Support Tickets",
      icon: Ticket,
      path: "/dashboard/tickets",
      section: "Support",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      path: "/dashboard/messages",
      section: "Support",
    },
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesFilter =
      templateFilter === "all" || t.status === templateFilter;
    const matchesSearch =
      !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const templateFilterTabs: {
    key: TemplateFilter;
    label: string;
    count: number;
  }[] = [
    { key: "all", label: "All", count: templates.length },
    {
      key: "approved",
      label: "Approved",
      count: templates.filter((t) => t.status === "approved").length,
    },
    {
      key: "pending",
      label: "Pending",
      count: templates.filter((t) => t.status === "pending").length,
    },
    {
      key: "draft",
      label: "Draft",
      count: templates.filter((t) => t.status === "draft").length,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: templates.filter((t) => t.status === "rejected").length,
    },
  ];

  const statusBadge = (status: string) => {
    return COMBINED_STATUS_BADGE[status] || "neutral";
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
      {activeView === "overview" && (
        <div className="space-y-8">
          {/* Verification Banner — only show when not approved */}
          {onboardingStatus === "approved" ? (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm">
                  Creator verified
                </h3>
                <p className="text-xs text-neutral-500">
                  Your identity has been verified. You can sell templates and
                  receive payouts.
                </p>
              </div>
            </div>
          ) : onboardingStatus === "submitted" ? (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm">
                  Verification under review
                </h3>
                <p className="text-xs text-neutral-500">
                  Your documents are being reviewed. This usually takes 1-2
                  business days.
                </p>
              </div>
            </div>
          ) : onboardingStatus === "rejected" ? (
            <Link
              href="/dashboard/creator/onboarding"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">
                    Verification rejected
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Please review the feedback and resubmit your verification.
                  </p>
                </div>
              </div>
              <ArrowRight
                size={18}
                className="text-red-600 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          ) : (
            <Link
              href="/dashboard/creator/onboarding"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Shield size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">
                    Complete your creator verification
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Verify your identity to unlock selling and payouts on
                    Flowbites
                  </p>
                </div>
              </div>
              <ArrowRight
                size={18}
                className="text-amber-600 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          )}

          {/* Stripe Connect Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CreditCard size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">
                    Stripe Payouts
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Receive payments for your sales
                  </p>
                </div>
              </div>
              {!stripeLoading && (
                <Badge
                  size="sm"
                  variant={
                    stripeStatus.status === "active"
                      ? "success"
                      : stripeStatus.status === "pending"
                        ? "warning"
                        : stripeStatus.status === "demo_mode"
                          ? "info"
                          : "neutral"
                  }
                >
                  {stripeStatus.status === "active"
                    ? "Connected"
                    : stripeStatus.status === "pending"
                      ? "Pending"
                      : stripeStatus.status === "demo_mode"
                        ? "Demo Mode"
                        : "Not Connected"}
                </Badge>
              )}
            </div>

            {stripeLoading ? (
              <div className="flex items-center gap-2 text-neutral-400 text-sm py-2">
                <Loader2 size={16} className="animate-spin" />
                Checking connection status...
              </div>
            ) : stripeStatus.status === "active" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle size={16} />
                  Your Stripe account is connected and ready to receive payouts.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ExternalLink size={14} />}
                    onClick={handleOpenStripeDashboard}
                  >
                    View Stripe Dashboard
                  </Button>
                </div>
              </div>
            ) : stripeStatus.status === "pending" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertCircle size={16} />
                  Your Stripe account setup is incomplete. Please finish
                  onboarding to receive payouts.
                </div>
                <Button
                  size="sm"
                  leftIcon={<CreditCard size={14} />}
                  onClick={handleConnectStripe}
                  isLoading={stripeConnecting}
                >
                  Complete Stripe Setup
                </Button>
              </div>
            ) : stripeStatus.status === "demo_mode" ? (
              <div className="flex items-center gap-2 text-sm text-sky-700 bg-sky-50 px-3 py-2 rounded-lg">
                <AlertCircle size={16} />
                Demo mode — Stripe payouts are simulated. Configure live Stripe
                keys to enable real payouts.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-neutral-600">
                  Connect your Stripe account to start receiving payouts when
                  customers purchase your templates and services.
                </p>
                <Button
                  size="sm"
                  leftIcon={<CreditCard size={14} />}
                  onClick={handleConnectStripe}
                  isLoading={stripeConnecting}
                >
                  Connect Stripe Account
                </Button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Total Revenue
                </span>
                <div className="w-9 h-9 bg-success-light rounded-lg flex items-center justify-center">
                  <DollarSign size={18} className="text-success" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                From template sales
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Total Sales
                </span>
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Package size={18} className="text-primary-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.totalSales}
              </div>
              <p className="text-xs text-neutral-400 mt-1">Templates sold</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Total Views
                </span>
                <div className="w-9 h-9 bg-info-light rounded-lg flex items-center justify-center">
                  <Eye size={18} className="text-info" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {stats.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Template page views
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Active Orders
                </span>
                <div className="w-9 h-9 bg-warning-light rounded-lg flex items-center justify-center">
                  <ClipboardList size={18} className="text-warning" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {activeOrderCount}
              </div>
              <p className="text-xs text-neutral-400 mt-1">In progress</p>
            </div>
          </div>

          {/* Recent Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Recent Templates
              </h3>
              <button
                onClick={() => setActiveView("templates")}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </button>
            </div>
            {templates.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
                <FileText size={48} className="text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                  No templates yet
                </h3>
                <p className="text-sm text-neutral-500 mb-6">
                  Start by uploading your first template
                </p>
                <Link href="/dashboard/creator/upload-template">
                  <Button size="sm" leftIcon={<Plus size={16} />}>
                    Upload Template
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {templates.slice(0, 6).map((template) => (
                  <Card
                    key={template._id}
                    hover={false}
                    className="!rounded-xl"
                  >
                    <Card.Image
                      src={getUploadUrl(`images/${template.thumbnail}`)}
                      alt={template.title}
                      badge={
                        <Badge variant={statusBadge(template.status)} size="sm">
                          {template.status}
                        </Badge>
                      }
                    />
                    <Card.Content className="!p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-neutral-900 truncate">
                            {template.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge size="sm" variant="neutral">
                              {template.platform}
                            </Badge>
                            <span className="text-sm font-semibold text-neutral-900">
                              ${template.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {template.stats.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package size={12} /> {template.stats.purchases} sales
                        </span>
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
                <h3 className="text-lg font-semibold text-neutral-900">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveView("orders")}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                {serviceOrders.slice(0, 5).map((order, idx) => {
                  const buyer =
                    typeof order.buyerId === "object" ? order.buyerId : null;
                  return (
                    <Link
                      key={order._id}
                      href={`/service-orders/${order._id}`}
                      className={`flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors ${
                        idx > 0 ? "border-t border-neutral-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                          <Wrench size={18} className="text-neutral-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {order.packageName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {buyer?.name || "Buyer"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge size="sm" variant={statusBadge(order.status)}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-sm font-semibold text-neutral-900">
                          ${order.price}
                        </span>
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
      {activeView === "templates" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-display font-bold text-neutral-900">
              My Templates
            </h2>
            <Link href="/dashboard/creator/upload-template">
              <Button size="sm" leftIcon={<Plus size={16} />}>
                Upload Template
              </Button>
            </Link>
          </div>

          {/* Filter Tabs + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
              {templateFilterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTemplateFilter(tab.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    templateFilter === tab.key
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1.5 text-xs text-neutral-400">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
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
              <FileText size={48} className="text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                {templates.length === 0
                  ? "No templates yet"
                  : "No results found"}
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                {templates.length === 0
                  ? "You haven't uploaded any templates yet"
                  : "Try adjusting your filters"}
              </p>
              {templates.length === 0 && (
                <Link href="/dashboard/creator/upload-template">
                  <Button leftIcon={<Plus size={16} />}>
                    Upload Your First Template
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template._id}
                  hover={false}
                  className="!rounded-xl group"
                >
                  <div className="relative">
                    <Card.Image
                      src={getUploadUrl(`images/${template.thumbnail}`)}
                      alt={template.title}
                      badge={
                        <Badge variant={statusBadge(template.status)} size="sm">
                          {template.status}
                        </Badge>
                      }
                    />
                    {template.status === "draft" && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          leftIcon={<Send size={14} />}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await api.post(
                                `/templates/${template._id}/submit`,
                              );
                              fetchTemplates();
                            } catch (err) {
                              console.error("Failed to submit:", err);
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
                        <h4 className="font-semibold text-neutral-900 truncate">
                          {template.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge size="sm" variant="neutral">
                            {template.platform}
                          </Badge>
                          {template.salePrice ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-red-600">
                                ${template.salePrice}
                              </span>
                              <span className="text-xs text-neutral-400 line-through">
                                ${template.price}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-neutral-900">
                              ${template.price}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(template);
                        }}
                        className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Edit template"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {template.stats.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package size={12} /> {template.stats.purchases}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} /> $
                          {template.stats.purchases * template.price}
                        </span>
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
      {activeView === "services" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-display font-bold text-neutral-900">
              My Services
            </h2>
            <Link href="/dashboard/creator/create-service">
              <Button size="sm" leftIcon={<Plus size={16} />}>
                Create Service
              </Button>
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <Wrench size={48} className="text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                No services yet
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                Create your first service package
              </p>
              <Link href="/dashboard/creator/create-service">
                <Button leftIcon={<Plus size={16} />}>
                  Create Your First Service
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {services.map((pkg) => (
                <div
                  key={pkg._id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-neutral-900 truncate">
                        {pkg.name}
                      </h4>
                      <Badge size="sm" variant="neutral" className="mt-1">
                        {pkg.category.replace(/-/g, " ")}
                      </Badge>
                    </div>
                    <Badge
                      size="sm"
                      variant={pkg.isActive ? "success" : "neutral"}
                    >
                      {pkg.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
                    {pkg.description}
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-100 text-center">
                    <div>
                      <p className="text-lg font-bold text-neutral-900">
                        ${pkg.price}
                      </p>
                      <p className="text-xs text-neutral-400">Price</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-neutral-900">
                        {pkg.deliveryDays}d
                      </p>
                      <p className="text-xs text-neutral-400">Delivery</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-neutral-900">
                        {pkg.stats.completed}
                      </p>
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
      {activeView === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-neutral-900">
              Service Orders
            </h2>
          </div>

          {serviceOrders.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <ClipboardList
                size={48}
                className="text-neutral-300 mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                No orders yet
              </h3>
              <p className="text-sm text-neutral-500">
                Service orders will appear here
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              {serviceOrders.map((order, idx) => {
                const buyer =
                  typeof order.buyerId === "object" ? order.buyerId : null;
                return (
                  <Link
                    key={order._id}
                    href={`/service-orders/${order._id}`}
                    className={`flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors ${
                      idx > 0 ? "border-t border-neutral-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                        <Wrench size={18} className="text-neutral-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {order.packageName}
                          </p>
                          {order.isGenericRequest && (
                            <Badge size="sm" variant="warning">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-neutral-500">
                            {buyer?.name || "Buyer"}
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            {order.orderNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-semibold text-neutral-900 hidden sm:block">
                        ${order.price}
                      </span>
                      <Badge size="sm" variant={statusBadge(order.status)}>
                        {order.status.replace(/_/g, " ")}
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

      {/* ============ ANALYTICS ============ */}
      {activeView === "analytics" && <AnalyticsView templates={templates} />}

      {/* ============ EARNINGS ============ */}
      {activeView === "earnings" && (
        <div className="space-y-8">
          <WithdrawalPanel />
          <EarningsDashboard />
          <TransactionHistory />
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditModal && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">
                Edit Template
              </h2>
              <div className="flex items-center gap-2">
                {editingTemplate.status === "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<GitBranch size={14} />}
                    onClick={() => setShowVersionModal(true)}
                  >
                    Publish Version
                  </Button>
                )}
                {editingTemplate.changeLog &&
                  editingTemplate.changeLog.length > 0 && (
                    <button
                      onClick={() => setShowChangeLog(!showChangeLog)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <History size={16} />
                      Change Log ({editingTemplate.changeLog.length})
                    </button>
                  )}
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-neutral-500" />
                </button>
              </div>
            </div>

            {/* Change Log Panel */}
            {showChangeLog && editingTemplate.changeLog && (
              <div className="border-b border-neutral-200 bg-neutral-50 p-4">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  Change History
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {editingTemplate.changeLog.map((entry: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-neutral-200"
                    >
                      <p className="text-xs text-neutral-500 mb-1">
                        {new Date(entry.editedAt).toLocaleString()} ·{" "}
                        {entry.reason}
                      </p>
                      <div className="space-y-1">
                        {(entry.changes ?? []).map(
                          (change: any, cidx: number) => (
                            <p key={cidx} className="text-sm text-neutral-700">
                              <span className="font-medium">
                                {change.field}:
                              </span>{" "}
                              <span className="text-red-500 line-through">
                                {String(change.oldValue)}
                              </span>{" "}
                              <span className="text-green-600">
                                → {String(change.newValue)}
                              </span>
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Title
                </label>
                <Input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Template title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Template description"
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Regular Price ($)
                  </label>
                  <Input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Sale Price ($)
                  </label>
                  <Input
                    type="number"
                    value={editForm.salePrice || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        salePrice: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Optional"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Leave empty for no sale
                  </p>
                </div>
              </div>

              {/* Edit Reason */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Edit Reason{" "}
                  <span className="text-neutral-400">(Optional)</span>
                </label>
                <Input
                  value={editForm.editReason}
                  onChange={(e) =>
                    setEditForm({ ...editForm, editReason: e.target.value })
                  }
                  placeholder="Why are you making these changes?"
                />
              </div>

              {/* Note about demo URL */}
              {editingTemplate.status === "approved" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Live preview/demo URL cannot be
                    edited after approval. Contact support if you need to update
                    it.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-200">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} isLoading={editLoading}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Version Modal */}
      <PublishVersionModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        templateId={editingTemplate?._id || ""}
        templateTitle={editingTemplate?.title || ""}
        currentVersion="1.0.0"
        onSuccess={() => {
          setShowVersionModal(false);
          closeEditModal();
        }}
      />
    </DashboardSidebar>
  );
};
