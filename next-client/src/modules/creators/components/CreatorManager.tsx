"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { Button, Badge, Modal } from "@/design-system";
import {
  LayoutDashboard,
  Users,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Globe,
  Phone,
  MapPin,
  CreditCard,
  ExternalLink,
  ArrowLeft,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  Star,
} from "lucide-react";

/* ================================================================
   Types
   ================================================================ */

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  onClick: () => void;
  section: string;
  badge?: number;
}

interface OnboardingData {
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected";
  completedSteps: string[];
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  fullName?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  govIdType?: "passport" | "national_id" | "drivers_license";
  govIdFront?: string;
  govIdBack?: string;
  govIdNumber?: string;
  selfieWithId?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankSwiftCode?: string;
  bankCountry?: string;
  referenceCreatorUsername?: string;
  referenceNote?: string;
  referenceVerified?: boolean;
}

interface CreatorData {
  _id: string;
  userId:
    | { _id: string; name: string; email: string; createdAt: string }
    | string;
  displayName: string;
  username: string;
  bio?: string;
  website?: string;
  twitter?: string;
  dribbble?: string;
  github?: string;
  portfolio?: string;
  coverImage?: string;
  isVerified: boolean;
  isFeatured: boolean;
  onboarding: OnboardingData;
  stats: {
    totalSales: number;
    totalRevenue: number;
    templateCount: number;
    averageRating: number;
    totalReviews: number;
    followers: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type View = "overview" | "creators" | "detail";

/* ================================================================
   Component
   ================================================================ */

export const CreatorManager = () => {
  const [activeView, setActiveView] = useState<View>("overview");

  // Creators state
  const [creators, setCreators] = useState<CreatorData[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail view
  const [selectedCreator, setSelectedCreator] = useState<CreatorData | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);

  // Approve / Reject modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectCreatorId, setRejectCreatorId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);

  // Pending count for badge
  const [pendingCount, setPendingCount] = useState(0);

  // Feedback message
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /* --- Fetch --- */

  const fetchCreators = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (statusFilter) params.set("status", statusFilter);
        if (searchQuery) params.set("search", searchQuery);

        const { data } = await api.get(`/admin/creators?${params}`);
        setCreators(data.data.creators);
        setPagination(data.data.pagination);
      } catch (err) {
        console.error("Failed to fetch creators:", err);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, searchQuery],
  );

  const fetchPendingCount = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/creators/pending");
      setPendingCount(data.data.length);
    } catch {
      // Silently ignore
    }
  }, []);

  useEffect(() => {
    fetchCreators();
    fetchPendingCount();
  }, [fetchCreators, fetchPendingCount]);

  /* --- Detail --- */

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setActiveView("detail");
    try {
      const { data } = await api.get(`/admin/creators/${id}`);
      setSelectedCreator(data.data);
    } catch (err) {
      console.error("Failed to fetch creator detail:", err);
      showFeedback("error", "Failed to load creator details");
      setActiveView("creators");
    } finally {
      setDetailLoading(false);
    }
  };

  /* --- Actions --- */

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await api.post(`/admin/creators/${id}/approve`);
      showFeedback("success", "Creator approved successfully");
      // Refresh
      if (activeView === "detail" && selectedCreator?._id === id) {
        const { data } = await api.get(`/admin/creators/${id}`);
        setSelectedCreator(data.data);
      }
      fetchCreators(pagination.page);
      fetchPendingCount();
    } catch (err) {
      console.error("Failed to approve creator:", err);
      showFeedback("error", "Failed to approve creator");
    } finally {
      setApproving(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectCreatorId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectCreatorId || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      await api.post(`/admin/creators/${rejectCreatorId}/reject`, {
        reason: rejectReason.trim(),
      });
      showFeedback("success", "Creator application rejected");
      setRejectModalOpen(false);
      if (activeView === "detail" && selectedCreator?._id === rejectCreatorId) {
        const { data } = await api.get(`/admin/creators/${rejectCreatorId}`);
        setSelectedCreator(data.data);
      }
      fetchCreators(pagination.page);
      fetchPendingCount();
    } catch (err) {
      console.error("Failed to reject creator:", err);
      showFeedback("error", "Failed to reject creator");
    } finally {
      setRejecting(false);
    }
  };

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  /* --- Helpers --- */

  const statusBadge = (status: string) => {
    const map: Record<
      string,
      "warning" | "success" | "error" | "neutral" | "info"
    > = {
      pending: "neutral",
      in_progress: "info",
      submitted: "warning",
      approved: "success",
      rejected: "error",
    };
    return map[status] || "neutral";
  };

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  const getUserField = (
    creator: CreatorData,
    field: "name" | "email" | "createdAt",
  ) => {
    if (typeof creator.userId === "object" && creator.userId)
      return creator.userId[field];
    return "";
  };

  const govIdLabel = (type?: string) => {
    if (type === "passport") return "Passport";
    if (type === "national_id") return "National ID";
    if (type === "drivers_license") return "Driver's License";
    return "N/A";
  };

  /* --- Status filter tabs --- */

  const statusTabs = [
    { key: "", label: "All" },
    { key: "submitted", label: "Submitted" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "in_progress", label: "In Progress" },
    { key: "pending", label: "Pending" },
  ];

  /* --- Nav --- */

  const navItems: NavItem[] = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      onClick: () => setActiveView("overview"),
      section: "main",
    },
    {
      label: "All Creators",
      icon: Users,
      onClick: () => {
        setActiveView("creators");
        setStatusFilter("");
      },
      section: "main",
    },
    {
      label: "Pending Review",
      icon: Shield,
      onClick: () => {
        setActiveView("creators");
        setStatusFilter("submitted");
      },
      badge: pendingCount,
      section: "Review",
    },
  ];

  /* --- Sidebar navigation groups --- */

  const sections = Array.from(new Set(navItems.map((n) => n.section)));

  /* ================================================================
     RENDER -- Overview
     ================================================================ */

  const renderOverview = () => {
    const approved = creators.filter(
      (c) => c.onboarding.status === "approved",
    ).length;
    const submitted = creators.filter(
      (c) => c.onboarding.status === "submitted",
    ).length;
    const rejected = creators.filter(
      (c) => c.onboarding.status === "rejected",
    ).length;
    const verified = creators.filter((c) => c.isVerified).length;

    return (
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500">
                Total Creators
              </span>
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-primary-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {pagination.total}
            </div>
          </div>

          <div
            className="bg-white border border-neutral-200 rounded-xl p-5 cursor-pointer hover:border-warning/50 transition-colors"
            onClick={() => {
              setActiveView("creators");
              setStatusFilter("submitted");
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500">
                Pending Review
              </span>
              <div className="w-9 h-9 bg-warning-light rounded-lg flex items-center justify-center">
                <Shield size={18} className="text-warning" />
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {pendingCount || submitted}
            </div>
            <p className="text-xs text-neutral-400 mt-1">Awaiting approval</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500">
                Verified Creators
              </span>
              <div className="w-9 h-9 bg-success-light rounded-lg flex items-center justify-center">
                <UserCheck size={18} className="text-success" />
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {verified || approved}
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500">
                Rejected
              </span>
              <div className="w-9 h-9 bg-error-light rounded-lg flex items-center justify-center">
                <UserX size={18} className="text-error" />
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {rejected}
            </div>
          </div>
        </div>

        {/* Recent Pending */}
        {creators.filter((c) => c.onboarding.status === "submitted").length >
          0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Pending Applications
                <span className="ml-2 text-sm font-normal text-neutral-400">
                  (
                  {
                    creators.filter((c) => c.onboarding.status === "submitted")
                      .length
                  }
                  )
                </span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveView("creators");
                  setStatusFilter("submitted");
                }}
                className="!text-sm !text-primary-600 hover:!text-primary-700 !font-medium !px-0 !h-auto"
              >
                Review all
              </Button>
            </div>
            <div className="bg-white border border-warning/30 rounded-xl overflow-hidden">
              {creators
                .filter((c) => c.onboarding.status === "submitted")
                .slice(0, 5)
                .map((creator, idx) => (
                  <div
                    key={creator._id}
                    className={`flex items-center justify-between p-4 ${idx > 0 ? "border-t border-neutral-100" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-neutral-900">
                          {creator.displayName}
                        </p>
                        <span className="text-xs text-neutral-400">
                          @{creator.username}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {getUserField(creator, "email")} &middot; Submitted{" "}
                        {formatDate(creator.onboarding.submittedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Eye size={14} />}
                        onClick={() => openDetail(creator._id)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<CheckCircle size={14} />}
                        onClick={() => handleApprove(creator._id)}
                        isLoading={approving === creator._id}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<XCircle size={14} />}
                        onClick={() => openRejectModal(creator._id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent approved */}
        {creators.filter((c) => c.onboarding.status === "approved").length >
          0 && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Recently Approved
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {creators
                .filter((c) => c.onboarding.status === "approved")
                .slice(0, 6)
                .map((creator) => (
                  <div
                    key={creator._id}
                    className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-primary-200 transition-colors cursor-pointer"
                    onClick={() => openDetail(creator._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                        {creator.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-neutral-900 truncate">
                            {creator.displayName}
                          </p>
                          {creator.isVerified && (
                            <CheckCircle
                              size={14}
                              className="text-success shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">
                          @{creator.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
                      <span>{creator.stats.templateCount} templates</span>
                      <span>
                        ${creator.stats.totalRevenue.toFixed(0)} revenue
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ================================================================
     RENDER -- Creators List
     ================================================================ */

  const renderCreatorsList = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-neutral-900">
        Creators
        {pagination.total > 0 && (
          <span className="ml-2 text-sm font-normal text-neutral-400">
            ({pagination.total})
          </span>
        )}
      </h2>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg w-fit overflow-x-auto">
        {statusTabs.map((tab) => (
          <Button
            key={tab.key}
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter(tab.key)}
            className={`!px-3 !py-1.5 !text-sm !font-medium !rounded-md !h-auto whitespace-nowrap ${
              statusFilter === tab.key
                ? "!bg-white !text-neutral-900 !shadow-sm"
                : "!text-neutral-500 hover:!text-neutral-700 !bg-transparent"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      ) : creators.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Users size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No creators found
          </h3>
          <p className="text-sm text-neutral-500">Try adjusting your search</p>
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <div className="col-span-3">Creator</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-center">Templates</div>
            <div className="col-span-1 text-center">Revenue</div>
            <div className="col-span-1">Joined</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="space-y-2">
            {creators.map((creator) => {
              const onboarding = creator.onboarding;
              return (
                <div
                  key={creator._id}
                  className="bg-white border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Creator */}
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                        {creator.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-neutral-900 truncate">
                            {creator.displayName}
                          </p>
                          {creator.isVerified && (
                            <CheckCircle
                              size={12}
                              className="text-success shrink-0"
                            />
                          )}
                          {creator.isFeatured && (
                            <Star
                              size={12}
                              className="text-warning shrink-0 fill-warning"
                            />
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 truncate">
                          @{creator.username}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-2 text-sm text-neutral-600 truncate">
                      {getUserField(creator, "email") || "—"}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <Badge variant={statusBadge(onboarding.status)} size="sm">
                        {onboarding.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {/* Templates */}
                    <div className="col-span-1 text-center text-sm text-neutral-700 font-medium">
                      {creator.stats.templateCount}
                    </div>

                    {/* Revenue */}
                    <div className="col-span-1 text-center text-sm text-neutral-700 font-medium">
                      ${creator.stats.totalRevenue.toFixed(0)}
                    </div>

                    {/* Joined */}
                    <div className="col-span-1 text-xs text-neutral-500">
                      {formatDate(creator.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Eye size={14} />}
                        onClick={() => openDetail(creator._id)}
                      >
                        View
                      </Button>
                      {onboarding.status === "submitted" && (
                        <>
                          <Button
                            size="sm"
                            leftIcon={<CheckCircle size={14} />}
                            onClick={() => handleApprove(creator._id)}
                            isLoading={approving === creator._id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            leftIcon={<XCircle size={14} />}
                            onClick={() => openRejectModal(creator._id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-neutral-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
                creators)
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ChevronLeft size={14} />}
                  disabled={pagination.page <= 1}
                  onClick={() => fetchCreators(pagination.page - 1)}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  rightIcon={<ChevronRight size={14} />}
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchCreators(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  /* ================================================================
     RENDER -- Creator Detail
     ================================================================ */

  const renderDetail = () => {
    if (detailLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary-500" />
        </div>
      );
    }

    if (!selectedCreator) return null;

    const c = selectedCreator;
    const ob = c.onboarding;

    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setActiveView("creators")}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to creators
        </button>

        {/* Header card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-2xl shrink-0">
                {c.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-neutral-900">
                    {c.displayName}
                  </h2>
                  {c.isVerified && (
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                  )}
                  {c.isFeatured && (
                    <Badge variant="warning" size="sm">
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-neutral-500 mb-1">@{c.username}</p>
                <p className="text-sm text-neutral-600">
                  {getUserField(c, "name")} &middot; {getUserField(c, "email")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {ob.status === "submitted" && (
                <>
                  <Button
                    leftIcon={<CheckCircle size={16} />}
                    onClick={() => handleApprove(c._id)}
                    isLoading={approving === c._id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    leftIcon={<XCircle size={16} />}
                    onClick={() => openRejectModal(c._id)}
                  >
                    Reject
                  </Button>
                </>
              )}
              {ob.status === "approved" && (
                <Badge variant="success" size="sm">
                  Approved
                </Badge>
              )}
              {ob.status === "rejected" && (
                <Badge variant="error" size="sm">
                  Rejected
                </Badge>
              )}
            </div>
          </div>

          {/* Bio */}
          {c.bio && (
            <p className="text-sm text-neutral-600 mt-4 max-w-2xl">{c.bio}</p>
          )}

          {/* Social links */}
          <div className="flex flex-wrap gap-3 mt-4">
            {c.website && (
              <a
                href={c.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <Globe size={12} /> Website
              </a>
            )}
            {c.twitter && (
              <a
                href={`https://twitter.com/${c.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <ExternalLink size={12} /> Twitter
              </a>
            )}
            {c.dribbble && (
              <a
                href={`https://dribbble.com/${c.dribbble}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <ExternalLink size={12} /> Dribbble
              </a>
            )}
            {c.github && (
              <a
                href={`https://github.com/${c.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <ExternalLink size={12} /> GitHub
              </a>
            )}
            {c.portfolio && (
              <a
                href={c.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
              >
                <ExternalLink size={12} /> Portfolio
              </a>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-neutral-100">
            <div>
              <p className="text-xs text-neutral-400 uppercase font-semibold">
                Templates
              </p>
              <p className="text-lg font-bold text-neutral-900">
                {c.stats.templateCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase font-semibold">
                Revenue
              </p>
              <p className="text-lg font-bold text-neutral-900">
                ${c.stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase font-semibold">
                Sales
              </p>
              <p className="text-lg font-bold text-neutral-900">
                {c.stats.totalSales}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase font-semibold">
                Rating
              </p>
              <p className="text-lg font-bold text-neutral-900">
                {c.stats.averageRating > 0
                  ? c.stats.averageRating.toFixed(1)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase font-semibold">
                Followers
              </p>
              <p className="text-lg font-bold text-neutral-900">
                {c.stats.followers}
              </p>
            </div>
          </div>
        </div>

        {/* Onboarding Status */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Onboarding Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                Application Status
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadge(ob.status)} size="sm">
                  {ob.status.replace(/_/g, " ")}
                </Badge>
                {ob.submittedAt && (
                  <span className="text-xs text-neutral-500">
                    Submitted {formatDate(ob.submittedAt)}
                  </span>
                )}
                {ob.reviewedAt && (
                  <span className="text-xs text-neutral-500">
                    Reviewed {formatDate(ob.reviewedAt)}
                  </span>
                )}
              </div>
              {ob.rejectionReason && (
                <div className="mt-2 bg-error/5 border border-error/15 rounded-lg p-3">
                  <p className="text-sm text-error font-medium">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-neutral-700 mt-1">
                    {ob.rejectionReason}
                  </p>
                </div>
              )}
              <div className="mt-3">
                <p className="text-xs text-neutral-400 mb-1">Completed Steps</p>
                <div className="flex flex-wrap gap-1">
                  {ob.completedSteps.length > 0 ? (
                    ob.completedSteps.map((step) => (
                      <Badge key={step} variant="neutral" size="sm">
                        {step}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-500">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                Personal Info
              </h4>
              <div className="space-y-2 text-sm">
                {ob.fullName && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Users size={14} className="text-neutral-400 shrink-0" />
                    {ob.fullName}
                  </div>
                )}
                {ob.phone && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Phone size={14} className="text-neutral-400 shrink-0" />
                    {ob.phone}
                  </div>
                )}
                {(ob.city || ob.country) && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <MapPin size={14} className="text-neutral-400 shrink-0" />
                    {[ob.city, ob.country].filter(Boolean).join(", ")}
                  </div>
                )}
                {ob.address && (
                  <p className="text-neutral-600 text-xs pl-6">{ob.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Government ID */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase mb-3">
              Government ID Verification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">ID Type</p>
                <p className="text-sm font-medium text-neutral-800">
                  {govIdLabel(ob.govIdType)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">ID Number</p>
                <p className="text-sm font-medium text-neutral-800">
                  {ob.govIdNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Selfie w/ ID</p>
                <p className="text-sm font-medium text-neutral-800">
                  {ob.selfieWithId ? "Provided" : "Not provided"}
                </p>
              </div>
            </div>
            {(ob.govIdFront || ob.govIdBack) && (
              <div className="flex gap-4 mt-3">
                {ob.govIdFront && (
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">ID Front</p>
                    <div className="w-40 h-28 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center text-xs text-neutral-500">
                      ID Document
                    </div>
                  </div>
                )}
                {ob.govIdBack && (
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">ID Back</p>
                    <div className="w-40 h-28 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center text-xs text-neutral-500">
                      ID Document
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bank Details */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase mb-3 flex items-center gap-1.5">
              <CreditCard size={14} /> Bank Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Bank Name</p>
                <p className="font-medium text-neutral-800">
                  {ob.bankName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Account Name</p>
                <p className="font-medium text-neutral-800">
                  {ob.bankAccountName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">
                  Account Number
                </p>
                <p className="font-medium text-neutral-800">
                  {ob.bankAccountNumber
                    ? `****${ob.bankAccountNumber.slice(-4)}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">
                  Routing Number
                </p>
                <p className="font-medium text-neutral-800">
                  {ob.bankRoutingNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">SWIFT Code</p>
                <p className="font-medium text-neutral-800">
                  {ob.bankSwiftCode || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Bank Country</p>
                <p className="font-medium text-neutral-800">
                  {ob.bankCountry || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Reference */}
          {ob.referenceCreatorUsername && (
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                Creator Reference
              </h4>
              <div className="text-sm text-neutral-700">
                <p>
                  Referenced by: <strong>@{ob.referenceCreatorUsername}</strong>
                </p>
                {ob.referenceNote && (
                  <p className="mt-1 text-neutral-600">{ob.referenceNote}</p>
                )}
                <p className="mt-1">
                  Verified:{" "}
                  {ob.referenceVerified ? (
                    <Badge variant="success" size="sm">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      No
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Timeline
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
              <span className="text-neutral-700">Account created</span>
              <span className="text-neutral-400">
                {formatDate(getUserField(c, "createdAt") as string)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
              <span className="text-neutral-700">Creator profile created</span>
              <span className="text-neutral-400">
                {formatDate(c.createdAt)}
              </span>
            </div>
            {ob.submittedAt && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-warning rounded-full shrink-0" />
                <span className="text-neutral-700">Application submitted</span>
                <span className="text-neutral-400">
                  {formatDate(ob.submittedAt)}
                </span>
              </div>
            )}
            {ob.reviewedAt && (
              <div className="flex items-center gap-3 text-sm">
                <div
                  className={`w-2 h-2 ${ob.status === "approved" ? "bg-success" : "bg-error"} rounded-full shrink-0`}
                />
                <span className="text-neutral-700">
                  {ob.status === "approved" ? "Approved" : "Rejected"}
                </span>
                <span className="text-neutral-400">
                  {formatDate(ob.reviewedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ================================================================
     MAIN RENDER
     ================================================================ */

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">
            Creator Manager
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage creator applications
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sub-navigation sidebar */}
        <aside className="w-52 shrink-0 hidden lg:block">
          <nav className="sticky top-4 space-y-6">
            {sections.map((section) => (
              <div key={section}>
                {section !== "main" && (
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-3">
                    {section}
                  </div>
                )}
                <div className="space-y-0.5">
                  {navItems
                    .filter((n) => n.section === section)
                    .map((item) => {
                      const isActive =
                        (item.label === "Overview" &&
                          activeView === "overview") ||
                        (item.label === "All Creators" &&
                          activeView === "creators" &&
                          statusFilter === "") ||
                        (item.label === "Pending Review" &&
                          activeView === "creators" &&
                          statusFilter === "submitted");

                      return (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-primary-50 text-primary-600 font-medium"
                              : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
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
          {/* Feedback */}
          {feedback && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-error/10 text-error border border-error/20"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {feedback.message}
            </div>
          )}

          {activeView === "overview" && renderOverview()}
          {activeView === "creators" && renderCreatorsList()}
          {activeView === "detail" && renderDetail()}
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Creator Application"
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
              Reject Application
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
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
            placeholder="e.g. Incomplete ID verification, missing bank details..."
          />
        </div>
      </Modal>
    </div>
  );
};
