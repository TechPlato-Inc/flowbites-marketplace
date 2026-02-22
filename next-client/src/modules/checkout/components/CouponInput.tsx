"use client";

import { useState } from "react";
import { Button, Input } from "@/design-system";
import { Tag, X, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

interface CouponValidation {
  valid: boolean;
  discount: number;
  finalAmount: number;
  coupon: {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  };
}

interface CouponInputProps {
  orderAmount: number;
  itemType: "templates" | "services";
  onApply: (coupon: CouponValidation) => void;
  onRemove: () => void;
}

export function CouponInput({
  orderAmount,
  itemType,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(
    null,
  );
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/coupons/validate", {
        code: code.trim(),
        orderAmount,
        itemType,
      });

      if (data.data.valid) {
        setAppliedCoupon(data.data);
        onApply(data.data);
        showToast(
          `Coupon applied! You saved $${data.data.discount.toFixed(2)}`,
          "success",
        );
      } else {
        setError("Invalid coupon code");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    setCode("");
    setError("");
    onRemove();
    showToast("Coupon removed", "success");
  };

  if (appliedCoupon) {
    return (
      <div className="bg-success-light border border-success/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
              <Check size={20} className="text-success" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">
                Coupon Applied:{" "}
                <span className="uppercase">{appliedCoupon.coupon.code}</span>
              </p>
              <p className="text-sm text-neutral-600">
                You save ${appliedCoupon.discount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Remove coupon"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-success/20">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Original price:</span>
            <span className="text-neutral-900 line-through">
              ${orderAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-neutral-600">Discount:</span>
            <span className="text-success font-medium">
              -${appliedCoupon.discount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t border-success/20">
            <span className="text-neutral-900">Final amount:</span>
            <span className="text-success">
              ${appliedCoupon.finalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={18} className="text-primary-500" />
        <h4 className="font-medium text-neutral-900">Have a coupon?</h4>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter coupon code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApply();
              }
            }}
            error={error}
            className="uppercase"
          />
        </div>
        <Button
          onClick={handleApply}
          isLoading={loading}
          disabled={!code.trim()}
        >
          Apply
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-error text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
