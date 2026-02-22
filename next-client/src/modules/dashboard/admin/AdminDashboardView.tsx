"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getUploadUrl } from "@/lib/api/client";
import { Template, ServiceOrder, User } from "@/types";
import { RefundManagement } from "./components/RefundManagement";
import { ReviewModeration } from "./components/ReviewModeration";
import { CouponManagement } from "./components/CouponManagement";
import { DashboardOverview } from "./components/DashboardOverview";
import { UserManagement } from "./components/UserManagement";
import { TicketManagement } from "./components/TicketManagement";
import { ReportManagement } from "./components/ReportManagement";
import { WithdrawalManagement } from "./components/WithdrawalManagement";
import { ShotManagement } from "./components/ShotManagement";
import { Button, Badge, Modal } from "@/design-system";
import {
  DashboardSidebar,
  type NavItem,
} from "@/components/layout/DashboardSidebar";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  UserPlus,
  AlertCircle,
  Shield,
  MessageSquare,
  LayoutDashboard,
  FileText,
  ClipboardList,
  BookOpen,
  LayoutGrid,
  RefreshCcw,
  Star,
  Percent,
  Users,
  Ticket,
  Flag,
  Wallet,
  Image,
} from "lucide-react";

type View =
  | "overview"
  | "operations"
  | "users"
  | "templates"
  | "services"
  | "disputes"
  | "refunds"
  | "reviews"
  | "coupons"
  | "tickets"
  | "reports"
  | "withdrawals"
  | "shots";

export const AdminDashboardView = () => {
  const [activeView, setActiveView] = useState<View>("overview");

  // Template moderation state
  const [pendingTemplates, setPendingTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTemplateId, setRejectTemplateId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Service orders state
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [creators, setCreators] = useState<User[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Reassign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState<string | null>(null);
  const [assignCreatorId, setAssignCreatorId] = useState("");
  const [assignPrice, setAssignPrice] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Dispute resolve modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveOrderId, setResolveOrderId] = useState<string | null>(null);
  const [resolveResolution, setResolveResolution] = useState("");
  const [resolveOutcome, setResolveOutcome] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchPendingTemplates();
    fetchServiceOrders();
    fetchCreators();
  }, []);

  // ---- Template moderation ----
  const fetchPendingTemplates = async () => {
    try {
      const { data } = await api.get("/admin/templates/pending");
      setPendingTemplates(data.data);
    } catch (error) {
      console.error("Failed to fetch pending templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (templateId: string) => {
    try {
      await api.post(`/admin/templates/${templateId}/approve`);
      setPendingTemplates((prev) => prev.filter((t) => t._id !== templateId));
    } catch (error) {
      console.error("Failed to approve template:", error);
    }
  };

  const openRejectModal = (templateId: string) => {
    setRejectTemplateId(templateId);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectTemplateId || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      await api.post(`/admin/templates/${rejectTemplateId}/reject`, {
        reason: rejectReason.trim(),
      });
      setPendingTemplates((prev) =>
        prev.filter((t) => t._id !== rejectTemplateId),
      );
      setRejectModalOpen(false);
    } catch (error) {
      console.error("Failed to reject template:", error);
    } finally {
      setRejecting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ---- Service order management ----
  const fetchServiceOrders = async () => {
    setServicesLoading(true);
    try {
      const { data } = await api.get("/services/admin/orders");
      setServiceOrders(data.data || []);
    } catch (error) {
      console.error("Failed to fetch service orders:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const { data } = await api.get("/services/admin/creators");
      setCreators(data.data || []);
    } catch (error) {
      console.error("Failed to fetch creators:", error);
    }
  };

  const openAssignModal = (orderId: string) => {
    setAssignOrderId(orderId);
    setAssignCreatorId("");
    setAssignPrice("");
    setAssignModalOpen(true);
  };

  const handleReassign = async () => {
    if (!assignOrderId || !assignCreatorId) return;
    setAssigning(true);
    try {
      const { data } = await api.patch(
        `/services/admin/orders/${assignOrderId}/reassign`,
        {
          assignedCreatorId: assignCreatorId,
          price: assignPrice ? Number(assignPrice) : null,
        },
      );
      setServiceOrders((prev) =>
        prev.map((o) => (o._id === assignOrderId ? data.data : o)),
      );
      setAssignModalOpen(false);
    } catch (error) {
      console.error("Failed to reassign order:", error);
    } finally {
      setAssigning(false);
    }
  };

  const openResolveModal = (orderId: string) => {
    setResolveOrderId(orderId);
    setResolveResolution("");
    setResolveOutcome("");
    setResolveModalOpen(true);
  };

  const handleResolveDispute = async () => {
    if (!resolveOrderId || !resolveResolution.trim() || !resolveOutcome) return;
    setResolving(true);
    try {
      const { data } = await api.patch(
        `/services/admin/orders/${resolveOrderId}/resolve-dispute`,
        {
          resolution: resolveResolution.trim(),
          outcome: resolveOutcome,
        },
      );
      setServiceOrders((prev) =>
        prev.map((o) => (o._id === resolveOrderId ? data.data : o)),
      );
      setResolveModalOpen(false);
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
    } finally {
      setResolving(false);
    }
  };

  const statusColor = (status: string) => {
    const map: Record<
      string,
      "warning" | "success" | "error" | "neutral" | "info"
    > = {
      requested: "warning",
      accepted: "info",
      in_progress: "info",
      delivered: "success",
      completed: "success",
      rejected: "error",
      cancelled: "neutral",
      revision_requested: "warning",
      disputed: "error",
    };
    return map[status] || "neutral";
  };

  const unassignedCount = serviceOrders.filter(
    (o) => o.isGenericRequest && !o.assignedCreatorId,
  ).length;
  const disputeCount = serviceOrders.filter(
    (o) => o.status === "disputed",
  ).length;
  const totalOrderRevenue = serviceOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.platformFee, 0);

  const filteredOrders =
    orderStatusFilter === "all"
      ? serviceOrders
      : serviceOrders.filter((o) => o.status === orderStatusFilter);

  const orderFilterTabs = [
    { key: "all", label: "All", count: serviceOrders.length },
    {
      key: "requested",
      label: "Requested",
      count: serviceOrders.filter((o) => o.status === "requested").length,
    },
    {
      key: "in_progress",
      label: "In Progress",
      count: serviceOrders.filter((o) => o.status === "in_progress").length,
    },
    {
      key: "delivered",
      label: "Delivered",
      count: serviceOrders.filter((o) => o.status === "delivered").length,
    },
    {
      key: "completed",
      label: "Completed",
      count: serviceOrders.filter((o) => o.status === "completed").length,
    },
  ];

  const navItems: NavItem[] = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      onClick: () => setActiveView("overview"),
      section: "main",
    },
    {
      label: "Operations",
      icon: ClipboardList,
      onClick: () => setActiveView("operations"),
      badge: pendingTemplates.length + unassignedCount + disputeCount,
      section: "main",
    },
    {
      label: "Users",
      icon: Users,
      onClick: () => setActiveView("users"),
      section: "main",
    },
    {
      label: "Template Approvals",
      icon: FileText,
      onClick: () => setActiveView("templates"),
      badge: pendingTemplates.length,
      section: "Moderation",
    },
    {
      label: "Service Orders",
      icon: ClipboardList,
      onClick: () => setActiveView("services"),
      badge: unassignedCount,
      section: "Moderation",
    },
    {
      label: "Disputes",
      icon: Shield,
      onClick: () => setActiveView("disputes"),
      badge: disputeCount,
      section: "Moderation",
    },
    {
      label: "Refunds",
      icon: RefreshCcw,
      onClick: () => setActiveView("refunds"),
      section: "Moderation",
    },
    {
      label: "Reviews",
      icon: Star,
      onClick: () => setActiveView("reviews"),
      section: "Moderation",
    },
    {
      label: "Coupons",
      icon: Percent,
      onClick: () => setActiveView("coupons"),
      section: "Moderation",
    },
    {
      label: "Tickets",
      icon: Ticket,
      onClick: () => setActiveView("tickets"),
      section: "Moderation",
    },
    {
      label: "Reports",
      icon: Flag,
      onClick: () => setActiveView("reports"),
      section: "Moderation",
    },
    {
      label: "Withdrawals",
      icon: Wallet,
      onClick: () => setActiveView("withdrawals"),
      section: "Moderation",
    },
    {
      label: "Template Manager",
      icon: LayoutGrid,
      path: "/dashboard/admin/templates",
      section: "Content",
    },
    {
      label: "Creator Manager",
      icon: UserPlus,
      path: "/dashboard/admin/creators",
      section: "Content",
    },
    {
      label: "Blog Management",
      icon: BookOpen,
      path: "/dashboard/admin/blog",
      section: "Content",
    },
    {
      label: "UI Shots",
      icon: Image,
      onClick: () => setActiveView("shots"),
      section: "Content",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      path: "/dashboard/messages",
      section: "Support",
    },
  ];

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
      title="Admin Panel"
      subtitle="Manage marketplace"
      navItems={navItems}
      headerActions={
        <Link href="/dashboard/creator/upload-template">
          <Button size="sm" leftIcon={<Plus size={16} />}>
            Upload Flowbites Template
          </Button>
        </Link>
      }
    >
      {/* ============ OVERVIEW (Dashboard Stats) ============ */}
      {activeView === "overview" && <DashboardOverview />}

      {/* ============ OPERATIONS ============ */}
      {activeView === "operations" && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="bg-white border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-warning/50 transition-colors"
              onClick={() => setActiveView("templates")}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Pending Templates
                </span>
                <div className="w-9 h-9 bg-warning-light rounded-lg flex items-center justify-center">
                  <FileText size={18} className="text-warning" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {pendingTemplates.length}
              </div>
              <p className="text-xs text-neutral-400 mt-1">Awaiting review</p>
            </div>

            <div
              className="bg-white border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-error/50 transition-colors"
              onClick={() => setActiveView("services")}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Unassigned Orders
                </span>
                <div className="w-9 h-9 bg-error-light rounded-lg flex items-center justify-center">
                  <UserPlus size={18} className="text-error" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {unassignedCount}
              </div>
              <p className="text-xs text-neutral-400 mt-1">Need assignment</p>
            </div>

            <div
              className="bg-white border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-error/50 transition-colors"
              onClick={() => setActiveView("disputes")}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Open Disputes
                </span>
                <div className="w-9 h-9 bg-error-light rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-error" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {disputeCount}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Require resolution
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-500">
                  Platform Revenue
                </span>
                <div className="w-9 h-9 bg-success-light rounded-lg flex items-center justify-center">
                  <ClipboardList size={18} className="text-success" />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                ${totalOrderRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-neutral-400 mt-1">From service fees</p>
            </div>
          </div>

          {/* Pending Templates Quick View */}
          {pendingTemplates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Pending Templates
                  <span className="ml-2 text-sm font-normal text-neutral-400">
                    ({pendingTemplates.length})
                  </span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView("templates")}
                  className="!text-sm !text-primary-600 hover:!text-primary-700 !font-medium !px-0 !h-auto"
                >
                  Review all
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {pendingTemplates.slice(0, 3).map((template) => (
                  <div
                    key={template._id}
                    className="bg-white border border-warning/30 rounded-xl overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={getUploadUrl(`images/${template.thumbnail}`)}
                        alt={template.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-neutral-900 truncate">
                        {template.title}
                      </h4>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        By {template.creatorProfileId?.displayName || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge size="sm" variant="neutral">
                          {template.platform}
                        </Badge>
                        <span className="text-sm font-semibold">
                          ${template.price}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1"
                          leftIcon={<CheckCircle size={14} />}
                          onClick={() => handleApprove(template._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          className="flex-1"
                          leftIcon={<XCircle size={14} />}
                          onClick={() => openRejectModal(template._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unassigned Orders Quick View */}
          {unassignedCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Unassigned Custom Requests
                  <span className="ml-2 text-sm font-normal text-neutral-400">
                    ({unassignedCount})
                  </span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView("services")}
                  className="!text-sm !text-primary-600 hover:!text-primary-700 !font-medium !px-0 !h-auto"
                >
                  View all orders
                </Button>
              </div>
              <div className="bg-white border border-warning/30 rounded-xl overflow-hidden">
                {serviceOrders
                  .filter((o) => o.isGenericRequest && !o.assignedCreatorId)
                  .slice(0, 5)
                  .map((order, idx) => {
                    const buyer =
                      typeof order.buyerId === "object" ? order.buyerId : null;
                    return (
                      <div
                        key={order._id}
                        className={`flex items-center justify-between p-4 ${idx > 0 ? "border-t border-neutral-100" : ""}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {order.packageName}
                            </p>
                            <Badge size="sm" variant="warning">
                              Custom
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {buyer?.name || "Buyer"} &middot;{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          leftIcon={<UserPlus size={14} />}
                          onClick={() => openAssignModal(order._id)}
                        >
                          Assign
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Disputes Quick View */}
          {disputeCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Open Disputes
                  <span className="ml-2 text-sm font-normal text-neutral-400">
                    ({disputeCount})
                  </span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView("disputes")}
                  className="!text-sm !text-primary-600 hover:!text-primary-700 !font-medium !px-0 !h-auto"
                >
                  View all
                </Button>
              </div>
              <div className="bg-white border border-error/30 rounded-xl overflow-hidden">
                {serviceOrders
                  .filter((o) => o.status === "disputed")
                  .slice(0, 3)
                  .map((order, idx) => {
                    const buyer =
                      typeof order.buyerId === "object" ? order.buyerId : null;
                    return (
                      <div
                        key={order._id}
                        className={`flex items-center justify-between p-4 ${idx > 0 ? "border-t border-neutral-100" : ""}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {order.packageName}
                            </p>
                            <Badge size="sm" variant="error">
                              Disputed
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {buyer?.name || "Buyer"} &middot;{" "}
                            {order.dispute?.reason?.slice(0, 60) || "No reason"}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => openResolveModal(order._id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ TEMPLATE APPROVALS ============ */}
      {activeView === "templates" && (
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-neutral-900">
            Template Approvals
            {pendingTemplates.length > 0 && (
              <span className="ml-2 text-sm font-normal text-neutral-400">
                ({pendingTemplates.length} pending)
              </span>
            )}
          </h2>

          {pendingTemplates.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <CheckCircle size={48} className="text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                All caught up!
              </h3>
              <p className="text-sm text-neutral-500">
                No templates pending approval
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTemplates.map((template) => {
                const isExpanded = expandedId === template._id;
                return (
                  <div
                    key={template._id}
                    className="bg-white border border-neutral-200 rounded-xl overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex gap-5">
                        <img
                          src={getUploadUrl(`images/${template.thumbnail}`)}
                          alt={template.title}
                          className="w-56 h-36 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
                                {template.title}
                              </h3>
                              <p className="text-sm text-neutral-500">
                                By{" "}
                                {template.creatorProfileId?.displayName ||
                                  "Unknown"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="neutral" size="sm">
                                {template.platform}
                              </Badge>
                              <Badge size="sm">
                                {template.category?.name || "Uncategorized"}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mb-4 text-sm text-neutral-500">
                            <span className="font-semibold text-neutral-900">
                              ${template.price}
                            </span>
                            <span>
                              Submitted{" "}
                              {new Date(
                                template.createdAt,
                              ).toLocaleDateString()}
                            </span>
                            {template.licenseType && (
                              <span className="capitalize">
                                {template.licenseType} license
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              leftIcon={<CheckCircle size={14} />}
                              onClick={() => handleApprove(template._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              leftIcon={<XCircle size={14} />}
                              onClick={() => openRejectModal(template._id)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              rightIcon={
                                isExpanded ? (
                                  <ChevronUp size={14} />
                                ) : (
                                  <ChevronDown size={14} />
                                )
                              }
                              onClick={() => toggleExpand(template._id)}
                            >
                              {isExpanded ? "Less" : "Details"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-neutral-200 bg-neutral-50 p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                              Full Description
                            </h4>
                            <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                              {template.description}
                            </p>
                          </div>
                          <div className="space-y-4">
                            {template.demoUrl && (
                              <div>
                                <h4 className="text-xs font-semibold text-neutral-400 uppercase mb-1">
                                  Demo URL
                                </h4>
                                <a
                                  href={template.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:underline flex items-center gap-1 text-sm"
                                >
                                  {template.demoUrl} <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-semibold text-neutral-400 uppercase mb-1">
                                Tags
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {template.tags && template.tags.length > 0 ? (
                                  template.tags.map((tag, i) => (
                                    <Badge key={i} size="sm" variant="neutral">
                                      {typeof tag === "object" ? tag.name : tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-neutral-500">
                                    No tags
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {template.gallery && template.gallery.length > 0 && (
                          <div className="mt-5">
                            <h4 className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                              Gallery
                            </h4>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                              {template.gallery.map((img, i) => (
                                <img
                                  key={i}
                                  src={getUploadUrl(`images/${img}`)}
                                  alt={`Gallery ${i + 1}`}
                                  className="w-36 h-24 object-cover rounded-lg border border-neutral-200 flex-shrink-0"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============ SERVICE ORDERS ============ */}
      {activeView === "services" && (
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-neutral-900">
            Service Orders
          </h2>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
            {orderFilterTabs.map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => setOrderStatusFilter(tab.key)}
                className={`!px-3 !py-1.5 !text-sm !font-medium !rounded-md !h-auto ${
                  orderStatusFilter === tab.key
                    ? "!bg-white !text-neutral-900 !shadow-sm"
                    : "!text-neutral-500 hover:!text-neutral-700 !bg-transparent"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1.5 text-xs text-neutral-400">
                    {tab.count}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {servicesLoading ? (
            <div className="text-center py-12 text-neutral-500">
              Loading service orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
              <ClipboardList
                size={48}
                className="text-neutral-300 mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                No orders found
              </h3>
              <p className="text-sm text-neutral-500">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isGeneric = order.isGenericRequest;
                const isUnassigned = isGeneric && !order.assignedCreatorId;
                const assignedTo = order.assignedCreatorId;
                const templateInfo =
                  order.templateId && typeof order.templateId === "object"
                    ? order.templateId
                    : null;
                const buyer =
                  typeof order.buyerId === "object" ? order.buyerId : null;

                return (
                  <div
                    key={order._id}
                    className={`bg-white border rounded-xl p-4 transition-colors ${
                      isUnassigned
                        ? "border-warning/40"
                        : order.status === "disputed"
                          ? "border-error/40"
                          : "border-neutral-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={statusColor(order.status)} size="sm">
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                          {isGeneric && (
                            <Badge variant="warning" size="sm">
                              Custom Request
                            </Badge>
                          )}
                          <span className="text-xs font-mono text-neutral-400">
                            {order.orderNumber}
                          </span>
                        </div>

                        <h4 className="font-semibold text-neutral-900 mb-1">
                          {order.packageName}
                        </h4>

                        {templateInfo && (
                          <Link
                            href={`/templates/${templateInfo.slug}`}
                            className="text-xs text-primary-600 hover:underline inline-block mb-1"
                          >
                            Template: {templateInfo.title}
                          </Link>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                          <span>
                            Buyer:{" "}
                            <strong className="text-neutral-700">
                              {buyer?.name || "Unknown"}
                            </strong>
                          </span>
                          {order.price > 0 ? (
                            <span>
                              Price:{" "}
                              <strong className="text-neutral-700">
                                ${order.price}
                              </strong>
                            </span>
                          ) : isGeneric ? (
                            <span className="text-warning font-medium">
                              Price: TBD
                            </span>
                          ) : null}
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {assignedTo && typeof assignedTo === "object" && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-success">
                            <CheckCircle size={12} />
                            Assigned to: <strong>{assignedTo.name}</strong>
                          </div>
                        )}

                        <p className="text-xs text-neutral-500 mt-1.5 line-clamp-1">
                          {order.requirements}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        {order.status === "disputed" && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openResolveModal(order._id)}
                          >
                            Resolve
                          </Button>
                        )}
                        {isUnassigned && (
                          <Button
                            size="sm"
                            leftIcon={<UserPlus size={14} />}
                            onClick={() => openAssignModal(order._id)}
                          >
                            Assign
                          </Button>
                        )}
                        {!isUnassigned && order.status !== "disputed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<UserPlus size={14} />}
                            onClick={() => openAssignModal(order._id)}
                          >
                            Reassign
                          </Button>
                        )}
                        <Link href={`/service-orders/${order._id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<MessageSquare size={14} />}
                            className="w-full"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============ DISPUTES ============ */}
      {activeView === "disputes" && (
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-neutral-900">
            Disputes
            {disputeCount > 0 && (
              <span className="ml-2 text-sm font-normal text-neutral-400">
                ({disputeCount} open)
              </span>
            )}
          </h2>

          {(() => {
            const disputed = serviceOrders.filter(
              (o) => o.status === "disputed",
            );
            return disputed.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
                <Shield size={48} className="text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-700 mb-1">
                  No disputes
                </h3>
                <p className="text-sm text-neutral-500">
                  No open disputes at this time
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {disputed.map((order) => {
                  const buyer =
                    typeof order.buyerId === "object" ? order.buyerId : null;
                  const dispute = order.dispute;
                  return (
                    <div
                      key={order._id}
                      className="bg-white border border-error/30 rounded-xl overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="error" size="sm">
                                Disputed
                              </Badge>
                              <span className="text-xs font-mono text-neutral-400">
                                {order.orderNumber}
                              </span>
                            </div>
                            <h4 className="font-semibold text-neutral-900 mb-1">
                              {order.packageName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500 mb-3">
                              <span>
                                Buyer:{" "}
                                <strong className="text-neutral-700">
                                  {buyer?.name || "Unknown"}
                                </strong>
                              </span>
                              <span>
                                Price:{" "}
                                <strong className="text-neutral-700">
                                  ${order.price}
                                </strong>
                              </span>
                              <span>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {dispute && (
                              <div className="bg-error/5 border border-error/15 rounded-lg p-3">
                                <p className="text-sm font-medium text-neutral-800 mb-1">
                                  Dispute Reason:
                                </p>
                                <p className="text-sm text-neutral-700">
                                  {dispute.reason}
                                </p>
                                <p className="text-xs text-neutral-500 mt-1.5">
                                  Opened{" "}
                                  {new Date(
                                    dispute.openedAt,
                                  ).toLocaleDateString()}{" "}
                                  by{" "}
                                  {typeof dispute.openedBy === "object"
                                    ? dispute.openedBy.name
                                    : "buyer"}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => openResolveModal(order._id)}
                            >
                              Resolve
                            </Button>
                            <Link href={`/service-orders/${order._id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={<MessageSquare size={14} />}
                                className="w-full"
                              >
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ============ REFUNDS ============ */}
      {activeView === "refunds" && <RefundManagement />}

      {/* ============ REVIEWS ============ */}
      {activeView === "reviews" && <ReviewModeration />}

      {/* ============ COUPONS ============ */}
      {activeView === "coupons" && <CouponManagement />}

      {/* ============ USERS ============ */}
      {activeView === "users" && <UserManagement />}

      {/* ============ TICKETS ============ */}
      {activeView === "tickets" && <TicketManagement />}

      {/* ============ REPORTS ============ */}
      {activeView === "reports" && <ReportManagement />}

      {/* ============ WITHDRAWALS ============ */}
      {activeView === "withdrawals" && <WithdrawalManagement />}

      {/* ============ SHOTS ============ */}
      {activeView === "shots" && <ShotManagement />}

      {/* ============ MODALS ============ */}

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Template"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              isLoading={rejecting}
              disabled={!rejectReason.trim()}
            >
              Reject Template
            </Button>
          </div>
        }
      >
        <div>
          <p className="text-sm text-neutral-600 mb-4">
            Please provide a reason for rejection. This will be visible to the
            creator.
          </p>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Rejection Reason *
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            placeholder="e.g. Template does not meet quality standards, missing demo URL..."
          />
        </div>
      </Modal>

      {/* Assign / Reassign Creator Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Creator"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReassign}
              isLoading={assigning}
              disabled={!assignCreatorId}
            >
              Assign & Accept
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle
              size={16}
              className="text-primary-600 mt-0.5 shrink-0"
            />
            <p className="text-sm text-primary-800">
              Assigning a creator will move the order to &quot;accepted&quot;
              status.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Select Creator *
            </label>
            <select
              value={assignCreatorId}
              onChange={(e) => setAssignCreatorId(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
            >
              <option value="">Choose a creator...</option>
              {creators.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email}){" "}
                  {c.role === "admin" ? "- Flowbites Team" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Set Price (optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                $
              </span>
              <input
                type="number"
                value={assignPrice}
                onChange={(e) => setAssignPrice(e.target.value)}
                placeholder="Leave blank to keep current"
                min="0"
                step="1"
                className="w-full pl-8 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              30% platform fee applies. Creator receives 70%.
            </p>
          </div>
        </div>
      </Modal>

      {/* Resolve Dispute Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Dispute"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolveDispute}
              isLoading={resolving}
              disabled={!resolveResolution.trim() || !resolveOutcome}
            >
              Resolve Dispute
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Outcome *
            </label>
            <select
              value={resolveOutcome}
              onChange={(e) => setResolveOutcome(e.target.value)}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
            >
              <option value="">Select outcome...</option>
              <option value="refund">
                Full Refund to Buyer (cancel order)
              </option>
              <option value="release_payment">
                Release Payment to Creator (complete order)
              </option>
              <option value="partial_refund">
                Partial Refund (complete order + refund difference)
              </option>
              <option value="redo">Redo Work (send back to creator)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Resolution Details *
            </label>
            <textarea
              value={resolveResolution}
              onChange={(e) => setResolveResolution(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
              placeholder="Explain the resolution decision. Both buyer and creator will see this."
            />
          </div>
        </div>
      </Modal>
    </DashboardSidebar>
  );
};
