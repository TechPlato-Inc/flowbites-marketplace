"use client";

import { useState } from "react";
import { Button, Input, Modal } from "@/design-system";
import { Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

export function SecuritySettings() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Deactivation modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword) {
      showToast("Current password is required", "error");
      return;
    }
    if (!passwordForm.newPassword) {
      showToast("New password is required", "error");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast("New password must be at least 8 characters", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setChangingPassword(true);
    try {
      await api.post("/settings/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      showToast("Password changed successfully", "success");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      showToast(
        err?.response?.data?.error || "Failed to change password",
        "error",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatePassword) {
      showToast("Please enter your password to confirm", "error");
      return;
    }

    setDeactivating(true);
    try {
      await api.post("/settings/deactivate", {
        password: deactivatePassword,
      });

      showToast("Account deactivated. Redirecting...", "success");
      // Redirect to home after short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err: any) {
      showToast(
        err?.response?.data?.error || "Failed to deactivate account",
        "error",
      );
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password Section */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Change Password
        </h3>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.current ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Enter your current password"
                leftIcon={<Lock size={16} />}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords.current ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Enter new password (min 8 characters)"
                leftIcon={<Lock size={16} />}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm your new password"
                leftIcon={<Lock size={16} />}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords.confirm ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Change Password Button */}
          <Button
            onClick={handleChangePassword}
            isLoading={changingPassword}
            disabled={
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-neutral-200 pt-8">
        <h3 className="text-lg font-semibold text-error mb-4">Danger Zone</h3>

        <div className="bg-error-light border border-error/20 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-error" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-neutral-900">
                Deactivate Account
              </h4>
              <p className="text-sm text-neutral-600 mt-1">
                Once you deactivate your account, you will lose access to all
                your data, including templates, services, and purchase history.
                This action cannot be undone.
              </p>
              <Button
                variant="danger"
                size="sm"
                className="mt-3"
                leftIcon={<AlertTriangle size={14} />}
                onClick={() => setShowDeactivateModal(true)}
              >
                Deactivate Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => {
          if (!deactivating) {
            setShowDeactivateModal(false);
            setDeactivatePassword("");
          }
        }}
        title="Deactivate Account"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeactivateModal(false);
                setDeactivatePassword("");
              }}
              disabled={deactivating}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeactivate}
              isLoading={deactivating}
              disabled={!deactivatePassword}
            >
              Deactivate Account
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-error-light border border-error/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-error shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-900">
                Warning: This action is irreversible
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                Deactivating your account will permanently remove access to all
                your data.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Enter your password to confirm
            </label>
            <Input
              type="password"
              value={deactivatePassword}
              onChange={(e) => setDeactivatePassword(e.target.value)}
              placeholder="Your current password"
              leftIcon={<Lock size={16} />}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
