'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUploadUrl } from '@/lib/api/client';
import type { ServicePackage } from '@/types';
import { Button, Badge, Input } from '@/design-system';
import { Search, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { fetchServicePackages } from '@/modules/services/services/services.service';

const SERVICE_CATEGORIES = [
  { key: '', label: 'All Services' },
  { key: 'webflow-development', label: 'Webflow Development' },
  { key: 'framer-development', label: 'Framer Development' },
  { key: 'wix-development', label: 'Wix Development' },
  { key: 'custom-design', label: 'Custom Design' },
  { key: 'migration', label: 'Migration' },
  { key: 'other', label: 'Other' },
];

interface ServiceListingContentProps {
  initialPackages: ServicePackage[];
}

export function ServiceListingContent({ initialPackages }: ServiceListingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<ServicePackage[]>(initialPackages);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const activeCategory = searchParams.get('category') || '';
  const activeQuery = searchParams.get('q') || '';

  useEffect(() => {
    // Skip initial load since we have SSR data
    if (!searchParams.toString()) return;

    const loadPackages = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const params: Record<string, string> = {};
        if (activeCategory) params.category = activeCategory;
        if (activeQuery) params.q = activeQuery;
        const data = await fetchServicePackages(params);
        setPackages(data.packages);
      } catch {
        setFetchError('Failed to load services. Please try again.');
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    loadPackages();
  }, [searchParams, activeCategory, activeQuery]);

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set('category', category);
    else params.delete('category');
    router.push(`/services?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('q', value);
    else params.delete('q');
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
          Services
        </h1>
        <p className="text-lg text-neutral-600 mb-6">
          Hire creators to customize templates and build your perfect website
        </p>

        {/* Search */}
        <div className="max-w-2xl">
          <Input
            type="text"
            placeholder="Search services..."
            inputSize="lg"
            leftIcon={<Search size={20} />}
            defaultValue={activeQuery}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch((e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-8">
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryFilter(cat.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {fetchError && !loading && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-error" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Something went wrong</h3>
          <p className="text-neutral-500 text-sm mb-6">{fetchError}</p>
          <Button variant="outline" onClick={() => router.refresh()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="aspect-[16/10] bg-neutral-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                <div className="h-3 bg-neutral-200 rounded w-2/3 animate-pulse" />
                <div className="flex justify-between">
                  <div className="h-5 bg-neutral-200 rounded w-16 animate-pulse" />
                  <div className="h-5 bg-neutral-200 rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !fetchError && packages.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No services found</h3>
          <p className="text-neutral-500 text-sm max-w-sm mx-auto mb-6">
            {activeQuery || activeCategory
              ? 'Try adjusting your search or filters.'
              : 'Services will appear here when creators offer customization packages.'}
          </p>
          {(activeQuery || activeCategory) && (
            <Button variant="outline" onClick={() => router.push('/services')}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Services Grid */}
      {!loading && !fetchError && packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <Link key={pkg._id} href={`/services/${pkg.slug}`}>
              <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-200">
                {/* Thumbnail or placeholder */}
                <div className="aspect-[16/10] bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                  {(pkg.templateId && typeof pkg.templateId === 'object' && pkg.templateId.thumbnail) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getUploadUrl(`images/${pkg.templateId.thumbnail}`)} alt={pkg.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-4xl">
                      {pkg.category === 'webflow-development' ? '\uD83C\uDF0A' :
                       pkg.category === 'framer-development' ? '\u25B2' :
                       pkg.category === 'wix-development' ? '\uD83D\uDFE6' :
                       pkg.category === 'migration' ? '\uD83D\uDD04' :
                       pkg.category === 'custom-design' ? '\uD83C\uDFA8' : '\u26A1'}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">{pkg.name}</h3>
                  <p className="text-sm text-neutral-500 mb-3">
                    By {typeof pkg.creatorId === 'object' ? pkg.creatorId.name : 'Creator'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {pkg.deliveryDays} day{pkg.deliveryDays > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle size={14} />
                      {pkg.stats.completed} completed
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-neutral-900">
                      From ${pkg.price}
                    </span>
                    <Badge size="sm" variant="neutral">
                      {pkg.category.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
