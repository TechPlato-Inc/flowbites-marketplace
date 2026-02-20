'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api, getUploadUrl } from '@/lib/api/client';
import type { UIShot } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { Button, Badge, Input } from '@/design-system';
import {
  Heart, Bookmark, Eye, Search, X, ExternalLink,
  ChevronLeft, ChevronRight, Plus, TrendingUp, Clock, Grid3X3,
} from 'lucide-react';

// ─── ShotCard ────────────────────────────────────────────────────────────────

interface ShotCardProps {
  shot: UIShot;
  onSelect: (shot: UIShot) => void;
  onLike: (shotId: string, e?: React.MouseEvent) => void;
  onSave: (shotId: string, e?: React.MouseEvent) => void;
  isLiked: boolean;
  isSaved: boolean;
}

const ShotCard = ({ shot, onSelect, onLike, onSave, isLiked, isSaved }: ShotCardProps) => {
  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={() => onSelect(shot)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getUploadUrl(shot.image)}
          alt={shot.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => onLike(shot._id, e)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-neutral-700 hover:bg-white'
            }`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => onSave(shot._id, e)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isSaved
                ? 'bg-primary-500 text-white'
                : 'bg-white/80 text-neutral-700 hover:bg-white'
            }`}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-3 text-white text-xs">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {shot.stats.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {shot.stats.likes.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-neutral-900 truncate">
              {shot.title}
            </h3>
            <Link
              href={`/creators/${shot.creatorId._id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-neutral-500 hover:text-primary-600 transition-colors mt-0.5 block truncate"
            >
              {shot.creatorId.name}
            </Link>
          </div>
          {shot.creatorId.avatar && (
            <Link
              href={`/creators/${shot.creatorId._id}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getUploadUrl(shot.creatorId.avatar)}
                alt={shot.creatorId.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
              />
            </Link>
          )}
        </div>

        {/* Tags */}
        {shot.tags && shot.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
            {shot.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="sm" className="!text-[10px] !px-1.5 !py-0">
                {tag}
              </Badge>
            ))}
            {shot.tags.length > 3 && (
              <span className="text-[10px] text-neutral-400">+{shot.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ShotLightbox ────────────────────────────────────────────────────────────

interface ShotLightboxProps {
  shot: UIShot;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLike: (shotId: string, e?: React.MouseEvent) => void;
  onSave: (shotId: string, e?: React.MouseEvent) => void;
  isLiked: boolean;
  isSaved: boolean;
  hasPrev: boolean;
  hasNext: boolean;
}

const ShotLightbox = ({
  shot,
  onClose,
  onPrev,
  onNext,
  onLike,
  onSave,
  isLiked,
  isSaved,
  hasPrev,
  hasNext,
}: ShotLightboxProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
      >
        <X size={20} />
      </button>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Image */}
        <div className="relative flex-1 min-h-0 bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getUploadUrl(shot.image)}
            alt={shot.title}
            className="w-full h-full object-contain max-h-[60vh]"
          />
        </div>

        {/* Details */}
        <div className="p-6 border-t border-neutral-100">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">
                {shot.title}
              </h2>
              {shot.description && (
                <p className="text-sm text-neutral-600 mb-3">
                  {shot.description}
                </p>
              )}
              <div className="flex items-center gap-3">
                <Link
                  href={`/creators/${shot.creatorId._id}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {shot.creatorId.avatar && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getUploadUrl(shot.creatorId.avatar)}
                        alt={shot.creatorId.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </>
                  )}
                  <span className="text-sm font-medium text-neutral-900">
                    {shot.creatorId.name}
                  </span>
                </Link>
                <span className="text-neutral-300">|</span>
                <span className="text-xs text-neutral-500">
                  {new Date(shot.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => onLike(shot._id, e)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLiked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                {shot.stats.likes.toLocaleString()}
              </button>
              <button
                onClick={(e) => onSave(shot._id, e)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSaved
                    ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                {shot.stats.saves.toLocaleString()}
              </button>
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-neutral-500 bg-neutral-100">
                <Eye size={16} />
                {shot.stats.views.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tags */}
          {shot.tags && shot.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {shot.tags.map((tag) => (
                <Badge key={tag} size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Template link */}
          {shot.templateId && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <Link
                href={`/templates/${shot.templateId.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ExternalLink size={14} />
                View template: {shot.templateId.title}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── UIShortsContent (main) ──────────────────────────────────────────────────

export const UIShortsContent = () => {
  const { isAuthenticated } = useAuthStore();
  const [shots, setShots] = useState<UIShot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState<'popular' | 'recent'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShot, setSelectedShot] = useState<UIShot | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likedShots, setLikedShots] = useState<Set<string>>(new Set());
  const [savedShots, setSavedShots] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPage(1);
    setShots([]);
    setHasMore(true);
    fetchShots(1, true);
  }, [sort]);

  const fetchShots = async (pageNum: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await api.get('/ui-shorts', {
        params: { page: pageNum, limit: 20, sort },
      });
      const newShots = data.data.shots;
      const pagination = data.data.pagination;
      setShots((prev) => (reset ? newShots : [...prev, ...newShots]));
      setHasMore(pageNum < pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch shots:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchShots(page + 1);
    }
  };

  const handleLike = async (shotId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post(`/ui-shorts/${shotId}/like`);
      setLikedShots((prev) => {
        const next = new Set(prev);
        if (data.data.liked) next.add(shotId);
        else next.delete(shotId);
        return next;
      });
      setShots((prev) =>
        prev.map((s) =>
          s._id === shotId
            ? { ...s, stats: { ...s.stats, likes: s.stats.likes + (data.data.liked ? 1 : -1) } }
            : s
        )
      );
      if (selectedShot?._id === shotId) {
        setSelectedShot((prev) =>
          prev ? { ...prev, stats: { ...prev.stats, likes: prev.stats.likes + (data.data.liked ? 1 : -1) } } : prev
        );
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleSave = async (shotId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isAuthenticated) return;
    try {
      const { data } = await api.post(`/ui-shorts/${shotId}/save`);
      setSavedShots((prev) => {
        const next = new Set(prev);
        if (data.data.saved) next.add(shotId);
        else next.delete(shotId);
        return next;
      });
      setShots((prev) =>
        prev.map((s) =>
          s._id === shotId
            ? { ...s, stats: { ...s.stats, saves: s.stats.saves + (data.data.saved ? 1 : -1) } }
            : s
        )
      );
      if (selectedShot?._id === shotId) {
        setSelectedShot((prev) =>
          prev ? { ...prev, stats: { ...prev.stats, saves: prev.stats.saves + (data.data.saved ? 1 : -1) } } : prev
        );
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const navigateShot = useCallback(
    (direction: 'prev' | 'next') => {
      if (!selectedShot) return;
      const currentIndex = shots.findIndex((s) => s._id === selectedShot._id);
      if (direction === 'prev' && currentIndex > 0) {
        setSelectedShot(shots[currentIndex - 1]);
      } else if (direction === 'next' && currentIndex < shots.length - 1) {
        setSelectedShot(shots[currentIndex + 1]);
      }
    },
    [selectedShot, shots]
  );

  useEffect(() => {
    if (!selectedShot) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedShot(null);
      if (e.key === 'ArrowLeft') navigateShot('prev');
      if (e.key === 'ArrowRight') navigateShot('next');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedShot, navigateShot]);

  useEffect(() => {
    if (selectedShot) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedShot]);

  const filteredShots = searchQuery
    ? shots.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : shots;

  const currentIndex = selectedShot
    ? shots.findIndex((s) => s._id === selectedShot._id)
    : -1;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-neutral-900 mb-2">
                UI Shorts
              </h1>
              <p className="text-neutral-500 text-sm sm:text-base max-w-xl">
                Discover beautiful UI design shots from talented creators. Get inspired and find the
                perfect design for your next project.
              </p>
            </div>
            <Link href="/dashboard/creator/upload-shot" className="shrink-0">
              <Button leftIcon={<Plus size={18} />}>Upload Shot</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
        <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">
              <strong className="text-neutral-900">{filteredShots.length.toLocaleString()}</strong>{' '}
              shots
            </span>

            {/* Sort tabs */}
            <div className="inline-flex border border-neutral-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setSort('popular')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  sort === 'popular'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <TrendingUp size={14} />
                Popular
              </button>
              <button
                onClick={() => setSort('recent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-neutral-300 ${
                  sort === 'recent'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Clock size={14} />
                Recent
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shots..."
              leftIcon={<Search size={16} />}
              inputSize="sm"
              className="!w-full !h-9 !text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-neutral-200 rounded-xl" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredShots.length === 0 ? (
          <div className="text-center py-20 sm:py-28">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Grid3X3 size={28} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No shots found</h3>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto mb-6">
              {searchQuery
                ? 'Try adjusting your search to find what you\'re looking for.'
                : 'UI shots will appear here once creators start uploading.'}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredShots.map((shot) => (
                <ShotCard
                  key={shot._id}
                  shot={shot}
                  onSelect={setSelectedShot}
                  onLike={handleLike}
                  onSave={handleSave}
                  isLiked={likedShots.has(shot._id)}
                  isSaved={savedShots.has(shot._id)}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && !searchQuery && (
              <div className="flex justify-center mt-10">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  isLoading={loadingMore}
                >
                  Load More Shots
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedShot && (
        <ShotLightbox
          shot={selectedShot}
          onClose={() => setSelectedShot(null)}
          onPrev={() => navigateShot('prev')}
          onNext={() => navigateShot('next')}
          onLike={handleLike}
          onSave={handleSave}
          isLiked={likedShots.has(selectedShot._id)}
          isSaved={savedShots.has(selectedShot._id)}
          hasPrev={currentIndex > 0}
          hasNext={currentIndex < shots.length - 1}
        />
      )}
    </div>
  );
};
