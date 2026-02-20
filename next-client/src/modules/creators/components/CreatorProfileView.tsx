'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getUploadUrl } from '@/lib/api/client';
import type { CreatorProfile, Template, UIShot, ServicePackage } from '@/types';
import { Button, Badge } from '@/design-system';
import {
  ShoppingBag,
  Eye,
  Heart,
  Star,
  Award,
  CheckCircle,
  Globe,
  Bookmark,
  ArrowRight,
  Package,
  Clock,
  RefreshCw,
  Layers,
  Palette,
  Grid3X3,
} from 'lucide-react';

type TabType = 'templates' | 'shots' | 'services';

interface CreatorData {
  profile: CreatorProfile;
  templates: Template[];
  shots: UIShot[];
  services: ServicePackage[];
}

export const CreatorProfileView = ({ data }: { data: CreatorData }) => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  const { profile, templates, shots, services } = data;
  const user =
    typeof profile.userId === 'string' ? null : profile.userId;

  const tabCounts = {
    templates: templates.length,
    shots: shots.length,
    services: services.length,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ===== COVER / HEADER ===== */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-48 md:h-56 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
        </div>

        {/* Profile info overlay */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="relative -mt-16 md:-mt-20 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar */}
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-4xl md:text-5xl font-display font-bold ring-4 ring-white shadow-lg">
                {profile.displayName?.charAt(0).toUpperCase() || '?'}
              </div>

              {/* Name + meta */}
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-900">
                    {profile.displayName}
                  </h1>
                  {profile.isVerified && (
                    <CheckCircle
                      size={20}
                      className="text-primary-500 fill-primary-100"
                    />
                  )}
                  {profile.isFeatured && (
                    <Badge variant="warning" size="sm">
                      <Award size={10} className="mr-0.5" /> Featured
                    </Badge>
                  )}
                </div>
                <p className="text-neutral-500 text-sm">
                  @{profile.username}
                  {user?.createdAt && (
                    <span className="ml-2 text-neutral-400">
                      · Joined{' '}
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </p>
              </div>

              {/* Social / Website links */}
              <div className="flex items-center gap-2">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:text-primary-500 hover:border-primary-300 transition-colors"
                    title="Website"
                  >
                    <Globe size={16} />
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:text-sky-500 hover:border-sky-300 transition-colors"
                    title="Twitter"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {profile.dribbble && (
                  <a
                    href={`https://dribbble.com/${profile.dribbble}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:text-pink-500 hover:border-pink-300 transition-colors"
                    title="Dribbble"
                  >
                    <Palette size={16} />
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                    title="GitHub"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 text-neutral-600 text-sm leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-5">
              <StatItem
                icon={<ShoppingBag size={14} />}
                value={profile.stats.totalSales}
                label="Sales"
              />
              <StatItem
                icon={<Layers size={14} />}
                value={templates.length}
                label="Templates"
              />
              <StatItem
                icon={<Grid3X3 size={14} />}
                value={shots.length}
                label="Shots"
              />
              {profile.stats.averageRating > 0 && (
                <StatItem
                  icon={<Star size={14} className="text-amber-500" />}
                  value={profile.stats.averageRating.toFixed(1)}
                  label={`(${profile.stats.totalReviews} reviews)`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== TAB BAR ===== */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-1">
            {(['templates', 'shots', 'services'] as TabType[]).map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => setActiveTab(tab)}
                className={`!px-4 !py-3.5 !text-sm !font-medium !border-b-2 !transition-colors !capitalize !rounded-none ${
                  activeTab === tab
                    ? '!border-primary-500 !text-primary-600'
                    : '!border-transparent !text-neutral-500 hover:!text-neutral-700'
                }`}
              >
                {tab}
                <Badge
                  size="sm"
                  variant={activeTab === tab ? 'info' : 'neutral'}
                  className={`!ml-1.5 !text-xs ${
                    activeTab === tab
                      ? '!bg-primary-50 !text-primary-600'
                      : '!bg-neutral-100 !text-neutral-400'
                  }`}
                >
                  {tabCounts[tab]}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {activeTab === 'templates' && (
          <TemplatesTab templates={templates} />
        )}
        {activeTab === 'shots' && <ShotsTab shots={shots} />}
        {activeTab === 'services' && (
          <ServicesTab services={services} />
        )}
      </div>
    </div>
  );
};

/* ===== STAT ITEM ===== */
const StatItem = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) => (
  <div className="flex items-center gap-1.5 text-sm">
    <span className="text-neutral-400">{icon}</span>
    <span className="font-semibold text-neutral-900">{value}</span>
    <span className="text-neutral-400">{label}</span>
  </div>
);

/* ===== TEMPLATES TAB ===== */
const TemplatesTab = ({ templates }: { templates: Template[] }) => {
  if (templates.length === 0) {
    return (
      <EmptyState
        icon={<Layers size={40} />}
        title="No templates yet"
        description="This creator hasn't published any templates."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Link
          key={template._id}
          href={`/templates/${template.slug || template._id}`}
          className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-300"
        >
          {/* Thumbnail */}
          <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getUploadUrl(`images/${template.thumbnail}`)}
              alt={template.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <Badge variant="info" size="sm">
                  {template.platform}
                </Badge>
                <span className="text-white text-xs flex items-center gap-1">
                  <Eye size={12} /> Live Preview
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold text-neutral-900 text-sm mb-1 truncate group-hover:text-primary-600 transition-colors">
              {template.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 capitalize">
                {typeof template.category === 'string'
                  ? template.category
                  : template.category?.name}
              </span>
              <span className="font-bold text-neutral-900 text-sm">
                ${template.price}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-neutral-100">
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <ShoppingBag size={11} /> {template.stats.purchases}
              </span>
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Eye size={11} /> {template.stats.views}
              </span>
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Heart size={11} /> {template.stats.likes}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

/* ===== SHOTS TAB ===== */
const ShotsTab = ({ shots }: { shots: UIShot[] }) => {
  if (shots.length === 0) {
    return (
      <EmptyState
        icon={<Grid3X3 size={40} />}
        title="No shots yet"
        description="This creator hasn't uploaded any UI shots."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {shots.map((shot) => (
        <Link
          key={shot._id}
          href="/ui-shorts"
          className="group"
        >
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 ring-1 ring-black/5 transition-all duration-300 group-hover:ring-black/10 group-hover:shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getUploadUrl(`shots/${shot.image}`)}
              alt={shot.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-sm truncate">
                  {shot.title}
                </h3>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 px-0.5">
            <span className="flex items-center gap-1 text-xs text-neutral-400">
              <Heart size={11} className={shot.stats.likes > 0 ? 'text-red-400' : ''} />
              {shot.stats.likes}
            </span>
            <span className="flex items-center gap-1 text-xs text-neutral-400">
              <Eye size={11} /> {shot.stats.views}
            </span>
            <span className="flex items-center gap-1 text-xs text-neutral-400">
              <Bookmark size={11} /> {shot.stats.saves}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

/* ===== SERVICES TAB ===== */
const ServicesTab = ({ services }: { services: ServicePackage[] }) => {
  if (services.length === 0) {
    return (
      <EmptyState
        icon={<Package size={40} />}
        title="No services offered"
        description="This creator hasn't listed any services yet."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {services.map((pkg) => (
        <Link
          key={pkg._id}
          href={`/services/${pkg.slug || pkg._id}`}
          className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-300"
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-3">
                <h3 className="font-semibold text-neutral-900 text-base mb-1 group-hover:text-primary-600 transition-colors">
                  {pkg.name}
                </h3>
                <p className="text-neutral-500 text-sm line-clamp-2">
                  {pkg.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-neutral-900">
                  ${pkg.price}
                </p>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 mb-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-neutral-400" />
                {pkg.deliveryDays} day delivery
              </span>
              <span className="flex items-center gap-1.5">
                <RefreshCw size={14} className="text-neutral-400" />
                {pkg.revisions} revisions
              </span>
            </div>

            {/* Features */}
            <div className="space-y-1.5 mb-4">
              {pkg.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle size={13} className="text-green-500 shrink-0" />
                  {f}
                </div>
              ))}
              {pkg.features.length > 4 && (
                <p className="text-xs text-neutral-400 pl-5">
                  +{pkg.features.length - 4} more features
                </p>
              )}
            </div>

            {/* Linked template */}
            {pkg.templateId && typeof pkg.templateId !== 'string' && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getUploadUrl(`images/${(pkg.templateId as Template).thumbnail}`)}
                  alt=""
                  className="w-12 h-9 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-400">Based on template</p>
                  <p className="text-sm font-medium text-neutral-700 truncate">
                    {(pkg.templateId as Template).title}
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
              {pkg.stats && (
                <span className="text-xs text-neutral-400">
                  {pkg.stats.completed} completed orders
                </span>
              )}
              <span className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                View Details <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

/* ===== EMPTY STATE ===== */
const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="text-center py-16">
    <div className="text-neutral-300 mb-4 flex justify-center">{icon}</div>
    <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
    <p className="text-neutral-500 text-sm">{description}</p>
  </div>
);
