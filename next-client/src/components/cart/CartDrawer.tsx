"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/design-system";
import { getUploadUrl } from "@/lib/api/client";
import { X, ShoppingCart, Trash2, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, getTotalPrice, getTotalItems, clearCart } =
    useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart size={22} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">
              Shopping Cart ({totalItems})
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-neutral-500" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart size={48} className="text-neutral-300 mb-4" />
                <p className="text-neutral-500 mb-2">Your cart is empty</p>
                <p className="text-sm text-neutral-400 mb-4">
                  Discover amazing templates for your next project
                </p>
                <Link href="/templates" onClick={() => setIsOpen(false)}>
                  <Button>Browse Templates</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.templateId}
                    className="flex gap-3 p-3 bg-neutral-50 rounded-lg"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/templates/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-200"
                    >
                      <img
                        src={getUploadUrl(`images/${item.thumbnail}`)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/templates/${item.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <h3 className="font-medium text-sm text-neutral-900 truncate hover:text-primary-600">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-neutral-500 mb-1">
                        by {item.creatorName}
                      </p>
                      <p className="text-xs text-neutral-400 capitalize mb-2">
                        {item.platform} • {item.licenseType} license
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">
                          $
                          {item.salePrice !== null &&
                          item.salePrice !== undefined
                            ? item.salePrice
                            : item.price}
                        </span>
                        <button
                          onClick={() => removeItem(item.templateId)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-neutral-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-xl font-bold text-neutral-900">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Taxes calculated at checkout
              </p>
              <Link href="/checkout" onClick={() => setIsOpen(false)}>
                <Button
                  className="w-full"
                  size="lg"
                  rightIcon={<ArrowRight size={18} />}
                >
                  Checkout
                </Button>
              </Link>
              <button
                onClick={clearCart}
                className="w-full text-center text-sm text-neutral-500 hover:text-red-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
