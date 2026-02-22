"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { TemplateCard } from "@/modules/templates/components/TemplateCard";
import type { Template } from "@/types";
import { Loader2 } from "lucide-react";

interface RelatedTemplatesProps {
  currentTemplateId: string;
  categoryId?: string;
  platform?: string;
  limit?: number;
}

export function RelatedTemplates({
  currentTemplateId,
  categoryId,
  platform,
  limit = 4,
}: RelatedTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const params: Record<string, string> = {
          limit: String(limit + 1), // +1 in case current template is in results
          exclude: currentTemplateId,
        };

        if (categoryId) {
          params.category = categoryId;
        } else if (platform) {
          params.platform = platform;
        }

        const { data } = await api.get("/templates", { params });

        // Filter out current template and limit results
        const filtered = data.data.templates
          .filter((t: Template) => t._id !== currentTemplateId)
          .slice(0, limit);

        setTemplates(filtered);
      } catch {
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [currentTemplateId, categoryId, platform, limit]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 size={24} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-neutral-200">
      <div className="max-w-8xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            You might also like
          </h2>
          <Link
            href="/templates"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <TemplateCard key={template._id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}
