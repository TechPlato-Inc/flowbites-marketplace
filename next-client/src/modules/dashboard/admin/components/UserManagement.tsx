"use client";

import { useEffect, useState } from "react";
import { Button, Badge, Modal } from "@/design-system";
import {
  Users,
  Search,
  UserX,
  UserCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Ban,
  Unlock,
  MoreVertical,
  Filter,
} from "lucide-react";
import { api, getUploadUrl } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";
import { UserDetailModal } from "./UserDetailModal";

interface AdminUserInfo {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "creator" | "admin";
  avatar?: string;
  isActive: boolean;
  isBanned: boolean;
  bannedAt?: string;
  bannedBy?: string;
  createdAt: string;
}

interface AdminUserStats {
  total: number;
  byRole: Record<string, number>;
  banned: number;
  recentSignups: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Selected user for modal
  const [selectedUser, setSelectedUser] = useState<AdminUserInfo | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchUsers(1);
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/users/stats");
      setStats(data.data);
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    }
  };

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter)
        params.set("isActive", statusFilter === "active" ? "true" : "false");

      const { data } = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.data.users || []);
      setPagination(data.data.pagination);
    } catch (err) {
      setError("Failed to load users");
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.post(`/admin/users/${userId}/ban`);
      showToast("User banned successfully", "success");
      fetchUsers(pagination.page);
      fetchStats();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to ban user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.post(`/admin/users/${userId}/unban`);
      showToast("User unbanned successfully", "success");
      fetchUsers(pagination.page);
      fetchStats();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to unban user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      showToast(`Role updated to ${newRole}`, "success");
      fetchUsers(pagination.page);
      fetchStats();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to change role", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const openUserDetail = (user: AdminUserInfo) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "creator":
        return "success";
      default:
        return "neutral";
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-primary-500 animate-spin" />
          <span className="text-neutral-500 text-sm">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={40} className="text-error mx-auto mb-3" />
        <p className="text-neutral-600 mb-4">{error}</p>
        <Button onClick={() => fetchUsers(1)}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500">Total Users</span>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {stats.total.toLocaleString()}
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500">Creators</span>
              <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {(stats.byRole.creator || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500">Banned</span>
              <div className="w-8 h-8 bg-error-light rounded-lg flex items-center justify-center">
                <UserX size={16} className="text-error" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {stats.banned.toLocaleString()}
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500">New This Week</span>
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <UserCheck size={16} className="text-primary-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {stats.recentSignups.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchUsers(1)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                fetchUsers(1);
              }}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Roles</option>
              <option value="buyer">Buyer</option>
              <option value="creator">Creator</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                fetchUsers(1);
              }}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
            <Button size="sm" onClick={() => fetchUsers(1)}>
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                  Joined
                </th>
                <th className="text-right text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user._id}
                  className={idx > 0 ? "border-t border-neutral-100" : ""}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openUserDetail(user)}
                      className="flex items-center gap-3 hover:bg-neutral-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={getUploadUrl(`avatars/${user.avatar}`)}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users size={16} className="text-neutral-400" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-neutral-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      disabled={actionLoading === user._id}
                      className="text-sm border border-neutral-200 rounded-lg px-2 py-1 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="creator">Creator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <Badge variant="error" size="sm">
                        <Ban size={10} className="mr-1" />
                        Banned
                      </Badge>
                    ) : user.isActive ? (
                      <Badge variant="success" size="sm">
                        <UserCheck size={10} className="mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-600">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {user.isBanned ? (
                        <button
                          onClick={() => handleUnbanUser(user._id)}
                          disabled={actionLoading === user._id}
                          className="p-2 text-success hover:bg-success-light rounded-lg transition-colors"
                          title="Unban user"
                        >
                          <Unlock size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanUser(user._id)}
                          disabled={actionLoading === user._id}
                          className="p-2 text-error hover:bg-error-light rounded-lg transition-colors"
                          title="Ban user"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => openUserDetail(user)}
                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-neutral-200">
            <span className="text-sm text-neutral-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<ChevronLeft size={14} />}
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                Prev
              </Button>
              <span className="text-sm text-neutral-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                size="sm"
                variant="outline"
                rightIcon={<ChevronRight size={14} />}
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
        }}
        onBan={() => selectedUser && handleBanUser(selectedUser._id)}
        onUnban={() => selectedUser && handleUnbanUser(selectedUser._id)}
        onRoleChange={(role) =>
          selectedUser && handleRoleChange(selectedUser._id, role)
        }
        actionLoading={actionLoading === selectedUser?._id}
      />
    </div>
  );
}
