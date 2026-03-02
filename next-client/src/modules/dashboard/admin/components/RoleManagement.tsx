"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Button, Badge, Modal, Input } from "@/design-system";
import { showToast } from "@/design-system/Toast";
import { Shield, Plus, Edit2, Trash2, AlertCircle, Lock } from "lucide-react";
import { getErrorMessage } from "@/lib/utils/getErrorMessage";

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: string;
}

interface PermissionCategory {
  label: string;
  permissions: Record<string, string>;
}

type PermissionRegistry = Record<string, PermissionCategory>;

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permRegistry, setPermRegistry] = useState<PermissionRegistry>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formName, setFormName] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPermissions, setFormPermissions] = useState<Set<string>>(
    new Set(),
  );
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        api.get("/rbac/roles"),
        api.get("/rbac/permissions"),
      ]);
      setRoles(rolesRes.data.data || []);
      setPermRegistry(permsRes.data.data || {});
      setError(null);
    } catch {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormName("");
    setFormDisplayName("");
    setFormDescription("");
    setFormPermissions(new Set());
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDisplayName(role.displayName);
    setFormDescription(role.description);
    setFormPermissions(new Set(role.permissions));
    setModalOpen(true);
  };

  const togglePermission = (perm: string) => {
    setFormPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) {
        next.delete(perm);
      } else {
        next.add(perm);
      }
      return next;
    });
  };

  const toggleCategory = (categoryPerms: Record<string, string>) => {
    const keys = Object.keys(categoryPerms);
    const allSelected = keys.every((k) => formPermissions.has(k));
    setFormPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        keys.forEach((k) => next.delete(k));
      } else {
        keys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!formDisplayName.trim()) {
      showToast("Display name is required", "error");
      return;
    }
    if (!editingRole && !formName.trim()) {
      showToast("Role name is required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formName.trim().toLowerCase().replace(/\s+/g, "_"),
        displayName: formDisplayName.trim(),
        description: formDescription.trim(),
        permissions: Array.from(formPermissions),
      };

      if (editingRole) {
        const { data } = await api.patch(
          `/rbac/roles/${editingRole._id}`,
          payload,
        );
        setRoles((prev) =>
          prev.map((r) => (r._id === editingRole._id ? data.data : r)),
        );
        showToast("Role updated successfully", "success");
      } else {
        const { data } = await api.post("/rbac/roles", payload);
        setRoles((prev) => [...prev, data.data]);
        showToast("Role created successfully", "success");
      }

      setModalOpen(false);
    } catch (err: unknown) {
      showToast(getErrorMessage(err, "Failed to save role"), "error");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (role: Role) => {
    setDeletingRole(role);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    setDeleting(true);
    try {
      await api.delete(`/rbac/roles/${deletingRole._id}`);
      setRoles((prev) => prev.filter((r) => r._id !== deletingRole._id));
      setDeleteModalOpen(false);
      setDeletingRole(null);
      showToast("Role deleted", "success");
    } catch (err: unknown) {
      showToast(getErrorMessage(err, "Failed to delete role"), "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          Failed to load roles
        </h3>
        <p className="text-sm text-neutral-500 mb-4">{error}</p>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Roles & Permissions
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Manage access control roles and their permissions.
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>
          New Role
        </Button>
      </div>

      {/* Role cards */}
      {roles.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Shield size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No roles found
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            Create your first custom role to get started.
          </p>
          <Button onClick={openCreateModal}>Create Role</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div
              key={role._id}
              className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-primary-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                    {role.isBuiltIn ? (
                      <Lock size={16} className="text-primary-600" />
                    ) : (
                      <Shield size={16} className="text-primary-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      {role.displayName}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      {role.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {role.isBuiltIn && (
                    <Badge variant="info" size="sm">
                      Built-in
                    </Badge>
                  )}
                  {!role.isActive && (
                    <Badge variant="neutral" size="sm">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              {role.description && (
                <p className="text-sm text-neutral-500 mb-3">
                  {role.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  {role.permissions.includes("*")
                    ? "All permissions"
                    : `${role.permissions.length} permission${role.permissions.length !== 1 ? "s" : ""}`}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Edit2 size={14} />}
                    onClick={() => openEditModal(role)}
                  >
                    Edit
                  </Button>
                  {!role.isBuiltIn && (
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => openDeleteModal(role)}
                      className="text-error hover:text-error hover:bg-error-light"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false);
        }}
        title={
          editingRole
            ? `Edit Role: ${editingRole.displayName}`
            : "Create New Role"
        }
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editingRole && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Role Name <span className="text-error">*</span>
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. moderator"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Lowercase, no spaces (underscores allowed)
                </p>
              </div>
            )}
            <div className={editingRole ? "sm:col-span-2" : ""}>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Display Name <span className="text-error">*</span>
              </label>
              <Input
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
                placeholder="e.g. Content Moderator"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="What can this role do?"
              rows={2}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-neutral-700">
                Permissions{" "}
                <span className="text-neutral-400 font-normal">
                  ({formPermissions.size} selected)
                </span>
              </label>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {Object.entries(permRegistry).map(([catKey, category]) => {
                const catPerms = category.permissions;
                const selectedCount = Object.keys(catPerms).filter((k) =>
                  formPermissions.has(k),
                ).length;
                const allSelected =
                  selectedCount === Object.keys(catPerms).length;

                return (
                  <div
                    key={catKey}
                    className="border border-neutral-200 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(catPerms)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-neutral-700">
                        {category.label}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {selectedCount}/{Object.keys(catPerms).length}
                        {allSelected && (
                          <span className="ml-2 text-success font-medium">
                            All
                          </span>
                        )}
                      </span>
                    </button>
                    <div className="px-4 py-3 grid grid-cols-1 gap-2">
                      {Object.entries(catPerms).map(([perm, desc]) => (
                        <label
                          key={perm}
                          className="flex items-start gap-2.5 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={formPermissions.has(perm)}
                            onChange={() => togglePermission(perm)}
                            className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <p className="text-xs font-mono text-neutral-600 group-hover:text-neutral-900 transition-colors">
                              {perm}
                            </p>
                            <p className="text-xs text-neutral-400">{desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingRole ? "Save Changes" : "Create Role"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setDeletingRole(null);
          }
        }}
        title="Delete Role"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete{" "}
            <strong>{deletingRole?.displayName}</strong>? This action cannot be
            undone. Users assigned this role will lose their permissions.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeletingRole(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
