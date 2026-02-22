"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/design-system";
import { getUploadUrl } from "@/lib/api/client";
import { api } from "@/lib/api/client";
import { CouponInput } from "@/modules/checkout/components/CouponInput";
import { Trash2, ArrowLeft, Lock, Check, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    discount: number;
    finalAmount: number;
    coupon: { code: string };
  } | null>(null);

  const subtotal = getTotalPrice();
  const discount = appliedCoupon?.discount || 0;
  const totalPrice = appliedCoupon?.finalAmount || subtotal;

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      // Create checkout session for all items
      const checkoutItems = items.map((item) => ({
        templateId: item.templateId,
        price: item.salePrice ?? item.price,
      }));

      const payload: any = {
        items: checkoutItems,
      };

      // Include coupon if applied
      if (appliedCoupon) {
        payload.couponCode = appliedCoupon.coupon.code;
      }

      const { data } = await api.post("/checkout/template", payload);

      // Redirect to Stripe checkout or success page (demo mode)
      if (data.data.demoMode) {
        clearCart();
        router.push("/checkout/success?type=template&demo=true");
      } else if (data.data.sessionUrl) {
        window.location.href = data.data.sessionUrl;
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Checkout failed. Please try again.",
      );
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-neutral-600 mb-6">
            Add some amazing templates to your cart and start building your next
            project.
          </p>
          <Link href="/templates">
            <Button size="lg">Browse Templates</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/templates">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
            >
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Order Summary ({items.length} items)
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.templateId}
                    className="flex gap-4 p-4 bg-neutral-50 rounded-lg"
                  >
                    <img
                      src={getUploadUrl(`images/${item.thumbnail}`)}
                      alt={item.title}
                      className="w-24 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <Link
                        href={`/templates/${item.slug}`}
                        className="font-medium text-neutral-900 hover:text-primary-600"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-neutral-500 capitalize">
                        {item.platform} Template • {item.licenseType} License
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-lg">
                          $
                          {item.salePrice !== null &&
                          item.salePrice !== undefined
                            ? item.salePrice
                            : item.price}
                        </span>
                        <button
                          onClick={() => removeItem(item.templateId)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Lock size={16} />
              <span>
                Secure checkout powered by Stripe. Your payment information is
                encrypted.
              </span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1 space-y-4">
            {/* Coupon Input */}
            <CouponInput
              orderAmount={subtotal}
              itemType="templates"
              onApply={(coupon) => setAppliedCoupon(coupon)}
              onRemove={() => setAppliedCoupon(null)}
            />

            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Payment Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Taxes</span>
                  <span>Calculated at payment</span>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
                rightIcon={
                  loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Lock size={18} />
                  )
                }
              >
                {loading ? "Processing..." : `Pay $${totalPrice.toFixed(2)}`}
              </Button>

              <p className="text-xs text-neutral-500 text-center mt-4">
                By completing this purchase, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-primary-600 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/licenses"
                  className="text-primary-600 hover:underline"
                >
                  License Agreement
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
