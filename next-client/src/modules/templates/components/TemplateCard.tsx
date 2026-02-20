'use client';

import Link from 'next/link';
import { Badge } from '@/design-system';
import { getUploadUrl } from '@/lib/api/client';
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants';
import type { Template } from '@/types';
import { Eye, ShoppingCart } from 'lucide-react';

const IMG_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMTc1IDEyNUgyMjVWMTc1SDE3NVYxMjVaIiBzdHJva2U9IiNEMUQxRDEiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const platform = template.platform as keyof typeof PLATFORM_COLORS;
  const platformColor = PLATFORM_COLORS[platform] || 'bg-neutral-700';
  const platformLabel = PLATFORM_LABELS[platform] || template.platform.toUpperCase();
  const creatorName = template.creatorProfileId?.displayName || 'Creator';
  const creatorLink = template.creatorProfileId?.username
    ? `/creators/${template.creatorProfileId.username}`
    : template.creatorProfileId?._id
      ? `/creators/${template.creatorProfileId._id}`
      : '#';

  return (
    <div className="group">
      {/* Image container */}
      <Link href={`/templates/${template.slug}`} className="block relative rounded-xl overflow-hidden bg-neutral-100">
        <div className="aspect-[4/3]">
          <img
            src={getUploadUrl(`images/${template.thumbnail}`)}
            alt={template.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK; }}
          />
        </div>

        {/* Platform badge */}
        <div className="absolute bottom-3 right-3">
          <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider text-white shadow-lg ${platformColor}`}>
            {platformLabel}
          </span>
        </div>

        {/* Featured badge */}
        {template.isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge variant="info" size="sm">Featured</Badge>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          {template.demoUrl && (
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(template.demoUrl, '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-neutral-900 rounded-lg text-sm font-semibold hover:bg-neutral-100 transition-colors cursor-pointer shadow-lg"
            >
              <Eye size={15} />
              Preview
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors shadow-lg">
            <ShoppingCart size={15} />
            Details
          </span>
        </div>
      </Link>

      {/* Info below */}
      <div className="pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/templates/${template.slug}`}>
              <h3 className="font-semibold text-sm text-neutral-900 truncate hover:text-primary-600 transition-colors">
                {template.title}
              </h3>
            </Link>
            <p className="text-xs text-neutral-500 mt-0.5">
              By{' '}
              <Link
                href={creatorLink}
                className="hover:text-primary-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {creatorName}
              </Link>
            </p>
          </div>
          <span className={`shrink-0 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            template.price === 0
              ? 'bg-green-100 text-green-700'
              : 'bg-neutral-100 text-neutral-800'
          }`}>
            {template.price === 0 ? 'Free' : `$${template.price}`}
          </span>
        </div>
      </div>
    </div>
  );
}
