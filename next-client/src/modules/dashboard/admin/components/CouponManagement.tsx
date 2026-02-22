"use client";

import { useEffect, useState } from "react";
import { Button, Badge, Modal, Input } from "@/design-system";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  AlertCircle,
  Percent,
  DollarSign,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";
import type { Coupon } from "@/types";

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    perUserLimit: "1",
    applicableTo: "all" as "all" | "templates" | "services",
    startsAt: "",
    expiresAt: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/coupons/admin");
      setCoupons(data.data.coupons || []);
    } catch (err) {
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      perUserLimit: "1",
      applicableTo: "all",
      startsAt: "",
      expiresAt: "",
      isActive: true,
    });
    setEditingCoupon(null);
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        minOrderAmount: coupon.minOrderAmount?.toString() || "",
        maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
        usageLimit: coupon.usageLimit?.toString() || "",
        perUserLimit: coupon.perUserLimit.toString(),
        applicableTo: coupon.applicableTo,
        startsAt: coupon.startsAt
          ? new Date(coupon.startsAt).toISOString().slice(0, 16)
          : "",
        expiresAt: coupon.expiresAt
          ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
          : "",
        isActive: coupon.isActive,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount
          ? parseFloat(formData.minOrderAmount)
          : undefined,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : undefined,
        usageLimit: formData.usageLimit
          ? parseInt(formData.usageLimit)
          : undefined,
        perUserLimit: parseInt(formData.perUserLimit) || 1,
        applicableTo: formData.applicableTo,
        startsAt: formData.startsAt || undefined,
        expiresAt: formData.expiresAt || undefined,
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        await api.patch(`/coupons/admin/${editingCoupon._id}`, payload);
        showToast("Coupon updated successfully", "success");
      } else {
        await api.post("/coupons/admin", payload);
        showToast("Coupon created successfully", "success");
      }

      setIsModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to save coupon", "error");
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await api.delete(`/coupons/admin/${couponId}`);
      showToast("Coupon deleted successfully", "success");
      fetchCoupons();
    } catch (err) {
      showToast("Failed to delete coupon", "error");
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await api.patch(`/coupons/admin/${coupon._id}`, {
        isActive: !coupon.isActive,
      });
      showToast(
        `Coupon ${coupon.isActive ? "deactivated" : "activated"}`,
        "success",
      );
      fetchCoupons();
    } catch (err) {
      showToast("Failed to update coupon", "error");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Code copied to clipboard", "success");
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}%`;
    }
    return `$${coupon.discountValue.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse"
          >
            <div className="h-6 bg-neutral-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={40} className="text-error mx-auto mb-3" />
        <p className="text-neutral-600 mb-4">{error}</p>
        <Button onClick={fetchCoupons}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-neutral-900">
          Coupon Management
        </h2>
        <Button onClick={() => handleOpenModal()} leftIcon={<Plus size={16} />}>
          Create Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      {coupons.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Percent size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No coupons yet
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            Create your first coupon to offer discounts
          </p>
          <Button
            onClick={() => handleOpenModal()}
            leftIcon={<Plus size={16} />}
          >
            Create Coupon
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                    Code
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                    Discount
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                    Usage
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                    Expires
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-500 uppercase px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon, idx) => (
                  <tr
                    key={coupon._id}
                    className={idx > 0 ? "border-t border-neutral-100" : ""}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {coupon.discountType === "percentage" ? (
                          <Percent size={14} className="text-primary-500" />
                        ) : (
                          <DollarSign size={14} className="text-primary-500" />
                        )}
                        <span className="font-medium">
                          {formatDiscount(coupon)}
                        </span>
                        <span className="text-xs text-neutral-500">
                          ({coupon.applicableTo})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">
                        {coupon.usageCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          coupon.isActive
                            ? "bg-success-light text-success"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${coupon.isActive ? "bg-success" : "bg-neutral-400"}`}
                        />
                        {coupon.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                        <Calendar size={14} />
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString()
                          : "No expiry"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(coupon)}
                          className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 text-neutral-400 hover:text-error hover:bg-error-light rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCoupon ? "Edit Coupon" : "Create Coupon"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Coupon Code *"
              placeholder="e.g., SUMMER20"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Discount Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, discountType: "percentage" })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                    formData.discountType === "percentage"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <Percent size={16} />
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, discountType: "fixed" })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                    formData.discountType === "fixed"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <DollarSign size={16} />
                  Fixed Amount
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`Discount Value ${formData.discountType === "percentage" ? "(%)" : "($)"}`}
              type="number"
              placeholder={
                formData.discountType === "percentage" ? "20" : "10.00"
              }
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: e.target.value })
              }
            />
            <Input
              label="Minimum Order Amount ($)"
              type="number"
              placeholder="0.00"
              value={formData.minOrderAmount}
              onChange={(e) =>
                setFormData({ ...formData, minOrderAmount: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Usage Limit (total)"
              type="number"
              placeholder="Unlimited"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: e.target.value })
              }
            />
            <Input
              label="Per User Limit"
              type="number"
              placeholder="1"
              value={formData.perUserLimit}
              onChange={(e) =>
                setFormData({ ...formData, perUserLimit: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Applies To
              </label>
              <select
                value={formData.applicableTo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    applicableTo: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                <option value="all">All Items</option>
                <option value="templates">Templates Only</option>
                <option value="services">Services Only</option>
              </select>
            </div>
          </div>

          {formData.discountType === "percentage" && (
            <Input
              label="Maximum Discount Amount ($)"
              type="number"
              placeholder="Optional - caps the discount"
              value={formData.maxDiscountAmount}
              onChange={(e) =>
                setFormData({ ...formData, maxDiscountAmount: e.target.value })
              }
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) =>
                  setFormData({ ...formData, startsAt: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Expiry Date
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-neutral-700">
              Coupon is active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.code || !formData.discountValue}
              className="flex-1"
            >
              {editingCoupon ? "Update" : "Create"} Coupon
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
