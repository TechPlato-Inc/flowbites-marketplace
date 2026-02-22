"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, getUploadUrl } from "@/lib/api/client";
import { Button, Badge, Card } from "@/design-system";
import {
  Search,
  AlertCircle,
  FileText,
  Wrench,
  Users,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  templates: {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    price: number;
    platform: string;
    creatorId: {
      _id: string;
      displayName: string;
    };
  }[];
  services: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    creatorId: {
      _id: string;
      displayName: string;
    };
  }[];
  creators: {
    _id: string;
    displayName: string;
    username: string;
    avatar?: string;
    stats: {
      templateCount: number;
    };
  }[];
}

const platformLabels: Record<string, string> = {
  webflow: "Webflow",
  framer: "Framer",
  wix: "Wix",
};

function formatPrice(price: number): string {
  return price === 0 ? "Free" : `$${price}`;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(
          `/search?q=${encodeURIComponent(query)}`,
        );
        setResults(data.data);
      } catch (err) {
        setError("Failed to load search results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (!query) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Search size={48} className="text-neutral-300 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">
            Search
          </h1>
          <p className="text-neutral-500">
            Enter a search term to find templates, services, and creators
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-neutral-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const hasResults =
    results &&
    (results.templates.length > 0 ||
      results.services.length > 0 ||
      results.creators.length > 0);

  if (!hasResults) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Search size={48} className="text-neutral-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            No results found
          </h1>
          <p className="text-neutral-500">
            We couldn&apos;t find anything matching &quot;{query}&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">
          Search Results for &quot;{query}&quot;
        </h1>
        <p className="text-neutral-500">
          Found{" "}
          {(results?.templates.length || 0) +
            (results?.services.length || 0) +
            (results?.creators.length || 0)}{" "}
          results
        </p>
      </div>

      {/* Templates */}
      {results && results.templates.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <FileText size={20} />
              Templates
              <Badge variant="neutral" size="sm">
                {results.templates.length}
              </Badge>
            </h2>
            <Link href={`/templates?q=${encodeURIComponent(query)}`}>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
              >
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.templates.slice(0, 4).map((template) => (
              <Link key={template._id} href={`/templates/${template.slug}`}>
                <Card hover className="!rounded-xl">
                  <Card.Image
                    src={getUploadUrl(`images/${template.thumbnail}`)}
                    alt={template.title}
                    badge={
                      <Badge variant="neutral" size="sm">
                        {platformLabels[template.platform] || template.platform}
                      </Badge>
                    }
                  />
                  <Card.Content>
                    <Card.Title>{template.title}</Card.Title>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-neutral-500">
                        {template.creatorId.displayName}
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {formatPrice(template.price)}
                      </span>
                    </div>
                  </Card.Content>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      {results && results.services.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Wrench size={20} />
              Services
              <Badge variant="neutral" size="sm">
                {results.services.length}
              </Badge>
            </h2>
            <Link href={`/services?q=${encodeURIComponent(query)}`}>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
              >
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.services.slice(0, 3).map((service) => (
              <Link key={service._id} href={`/services/${service.slug}`}>
                <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {service.name}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-3">
                    {service.creatorId.displayName}
                  </p>
                  <span className="font-semibold text-neutral-900">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Creators */}
      {results && results.creators.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Users size={20} />
              Creators
              <Badge variant="neutral" size="sm">
                {results.creators.length}
              </Badge>
            </h2>
            <Link href={`/creators?q=${encodeURIComponent(query)}`}>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
              >
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.creators.slice(0, 3).map((creator) => (
              <Link key={creator._id} href={`/creators/${creator.username}`}>
                <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                    {creator.avatar ? (
                      <img
                        src={creator.avatar}
                        alt={creator.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      creator.displayName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {creator.displayName}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      @{creator.username}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {creator.stats?.templateCount || 0} templates
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}
