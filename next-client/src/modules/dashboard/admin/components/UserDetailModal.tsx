"use client";

import { Modal, Button, Badge } from "@/design-system";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Ban,
  Unlock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getUploadUrl } from "@/lib/api/client";

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

interface UserDetailModalProps {
  user: AdminUserInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onBan: () => void;
  onUnban: () => void;
  onRoleChange: (role: string) => void;
  actionLoading: boolean;
}

export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onBan,
  onUnban,
  onRoleChange,
  actionLoading,
}: UserDetailModalProps) {
  if (!user) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="md">
      <div className="space-y-6">
        {/* User Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center">
            {user.avatar ? (
              <img
                src={getUploadUrl(`avatars/${user.avatar}`)}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={28} className="text-neutral-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {user.name}
            </h3>
            <p className="text-sm text-neutral-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  user.role === "admin"
                    ? "error"
                    : user.role === "creator"
                      ? "success"
                      : "neutral"
                }
                size="sm"
              >
                {user.role}
              </Badge>
              {user.isBanned ? (
                <Badge variant="error" size="sm">
                  <Ban size={10} className="mr-1" />
                  Banned
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-neutral-400" />
            <div>
              <p className="text-sm text-neutral-500">Email</p>
              <p className="text-sm font-medium text-neutral-900">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-neutral-400" />
            <div>
              <p className="text-sm text-neutral-500">Joined</p>
              <p className="text-sm font-medium text-neutral-900">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
          {user.isBanned && user.bannedAt && (
            <div className="flex items-center gap-3">
              <Ban size={16} className="text-error" />
              <div>
                <p className="text-sm text-neutral-500">Banned On</p>
                <p className="text-sm font-medium text-error">
                  {formatDate(user.bannedAt)}
                </p>
                {user.bannedBy && (
                  <p className="text-xs text-neutral-400">by {user.bannedBy}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Change Role
          </label>
          <div className="flex gap-2">
            {(["buyer", "creator", "admin"] as const).map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                disabled={actionLoading || user.role === role}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  user.role === role
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                } ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 pt-4">
          {user.isBanned ? (
            <div className="bg-success-light border border-success/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Unlock size={20} className="text-success shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">Unban User</h4>
                  <p className="text-sm text-neutral-600 mt-1">
                    This user is currently banned. Unbanning will restore their
                    access to the platform.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={onUnban}
                    isLoading={actionLoading}
                    leftIcon={<Unlock size={14} />}
                  >
                    Unban User
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-error-light border border-error/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">Ban User</h4>
                  <p className="text-sm text-neutral-600 mt-1">
                    Banning will prevent this user from accessing the platform.
                    This action can be reversed.
                  </p>
                  <Button
                    size="sm"
                    variant="danger"
                    className="mt-3"
                    onClick={onBan}
                    isLoading={actionLoading}
                    leftIcon={<Ban size={14} />}
                  >
                    Ban User
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
