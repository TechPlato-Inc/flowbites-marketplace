"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api/client";
import type { Template } from "@/types";
import { Button, Input } from "@/design-system";
import { Plus, X } from "lucide-react";

type ServiceForm = {
  templateId: string;
  name: string;
  description: string;
  category:
    | "webflow-development"
    | "framer-development"
    | "wix-development"
    | "custom-design"
    | "migration"
    | "other";
  price: number;
  deliveryDays: number;
  revisions: number;
  requirements?: string;
};

const categoryLabels: Record<string, string> = {
  "webflow-development": "Webflow Development",
  "framer-development": "Framer Development",
  "wix-development": "Wix Development",
  "custom-design": "Custom Design",
  migration: "Migration",
  other: "Other",
};

export function ServiceCreateForm() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceForm>({
    defaultValues: {
      category: "custom-design",
      revisions: 2,
      deliveryDays: 7,
    },
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await api.get("/templates/my-templates");
        const approved = data.data.templates.filter(
          (t: Template) => t.status === "approved",
        );
        setTemplates(approved);
      } catch {
        // Silent — templates just won't load
      }
    };
    fetchTemplates();
  }, []);

  const addFeature = () => setFeatures((prev) => [...prev, ""]);
  const removeFeature = (index: number) =>
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  const updateFeature = (index: number, value: string) => {
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
  };

  const onSubmit = async (values: ServiceForm) => {
    setSubmitting(true);
    setError("");

    try {
      const filteredFeatures = features.filter((f) => f.trim() !== "");
      await api.post("/services/packages", {
        ...values,
        features: filteredFeatures,
      });
      router.push("/dashboard/creator");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setError(msg || "Failed to create service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-8">
        Create Service Package
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {templates.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <p className="text-neutral-600 mb-2">
            You need at least one approved template to create a service.
          </p>
          <p className="text-sm text-neutral-500">
            Upload and get a template approved first.
          </p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Linked Template <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full h-11 rounded-lg border bg-white text-neutral-900 px-4
                focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none
                ${errors.templateId ? "border-error" : "border-neutral-300"}`}
              {...register("templateId")}
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title} ({t.platform})
                </option>
              ))}
            </select>
            {errors.templateId && (
              <p className="text-sm text-error mt-1">
                {errors.templateId.message}
              </p>
            )}
          </div>

          {/* Name */}
          <Input
            label="Service Name"
            placeholder="e.g. Full Webflow Development & Customization"
            error={errors.name?.message}
            {...register("name")}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              className={`w-full rounded-lg border bg-white text-neutral-900 px-4 py-3
                focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none
                transition-colors duration-200 ${errors.description ? "border-error" : "border-neutral-300"}`}
              placeholder="Describe what you'll deliver..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-error mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Category
            </label>
            <select
              className="w-full h-11 rounded-lg border border-neutral-300 bg-white text-neutral-900 px-4
                focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              {...register("category")}
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Price, Delivery, Revisions */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              min="1"
              placeholder="199"
              error={errors.price?.message}
              {...register("price")}
            />
            <Input
              label="Delivery (days)"
              type="number"
              min="1"
              placeholder="7"
              error={errors.deliveryDays?.message}
              {...register("deliveryDays")}
            />
            <Input
              label="Revisions (0=unlimited)"
              type="number"
              min="0"
              placeholder="2"
              error={errors.revisions?.message}
              {...register("revisions")}
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Features
            </label>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 h-10 rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 text-sm
                      focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Plus size={14} /> Add feature
            </button>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Buyer Requirements (optional)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-4 py-3
                focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none
                transition-colors duration-200"
              placeholder="What do you need from the buyer to start? (e.g. brand assets, content, Figma access)"
              {...register("requirements")}
            />
          </div>

          {/* Actions */}
          <div className="pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Service Package"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
