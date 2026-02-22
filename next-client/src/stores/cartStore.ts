import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Template } from "@/types";

export interface CartItem {
  templateId: string;
  title: string;
  price: number;
  salePrice?: number | null;
  thumbnail: string;
  platform: string;
  creatorName: string;
  slug: string;
  licenseType: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (template: Template, licenseType?: string) => void;
  removeItem: (templateId: string) => void;
  clearCart: () => void;
  updateLicense: (templateId: string, licenseType: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getDiscountAmount: () => number;
  isInCart: (templateId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (template: Template, licenseType = "personal") => {
        const currentItems = get().items;
        const exists = currentItems.find(
          (item) => item.templateId === template._id,
        );

        if (exists) return;

        const newItem: CartItem = {
          templateId: template._id,
          title: template.title,
          price: template.price,
          salePrice: template.salePrice,
          thumbnail: template.thumbnail,
          platform: template.platform,
          creatorName: template.creatorProfileId?.displayName || "Flowbites",
          slug: template.slug,
          licenseType,
        };

        set({ items: [...currentItems, newItem] });
      },

      removeItem: (templateId: string) => {
        set({
          items: get().items.filter((item) => item.templateId !== templateId),
        });
      },

      clearCart: () => set({ items: [] }),

      updateLicense: (templateId: string, licenseType: string) => {
        set({
          items: get().items.map((item) =>
            item.templateId === templateId ? { ...item, licenseType } : item,
          ),
        });
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price =
            item.salePrice !== null && item.salePrice !== undefined
              ? item.salePrice
              : item.price;
          return total + price;
        }, 0);
      },

      getTotalItems: () => get().items.length,

      getDiscountAmount: () => {
        return get().items.reduce((discount, item) => {
          if (
            item.salePrice !== null &&
            item.salePrice !== undefined &&
            item.salePrice < item.price
          ) {
            return discount + (item.price - item.salePrice);
          }
          return discount;
        }, 0);
      },

      isInCart: (templateId: string) => {
        return get().items.some((item) => item.templateId === templateId);
      },
    }),
    {
      name: "flowbites-cart",
    },
  ),
);
