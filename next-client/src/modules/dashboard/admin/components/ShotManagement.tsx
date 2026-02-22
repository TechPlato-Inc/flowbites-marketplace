"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Button, Badge, Modal } from "@/design-system";
import { getUploadUrl } from "@/lib/api/client";
import {
  Search,
  AlertCircle,
  Image,
  Eye,
  EyeOff,
  Trash2,
  Heart,
  Bookmark,
} from "lucide-react";

interface UIShot {
  _id: string;
  title: string;
  description?: string;
  image: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  templateId?: {
    _id: string;
    title: string;
    slug: string;
  };
  likes: number;
  saves: number;
  isPublished: boolean;
  createdAt: string;
}

interface ShotStats {
  total: number;
  published: number;
  unpublished: number;
}

export function ShotManagement() {
  const [shots, setShots] = useState<UIShot[]>([]);
  const [stats, setStats] = useState<ShotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState<UIShot | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchShots = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNum.toString());
      params.append("limit", "20");
      if (filter !== "all") {
        params.append("published", filter === "published" ? "true" : "false");
      }

      const { data } = await api.get(
        `/ui-shots/admin/all?${params.toString()}`,
      );
      if (pageNum === 1) {
        setShots(data.data.shots);
      } else {
        setShots((prev) => [...prev, ...data.data.shots]);
      }
      setHasMore(data.data.pagination?.hasMore || false);
      setError(null);
    } catch (err) {
      setError("Failed to load shots");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from current data for now
      const total = shots.length;
      const published = shots.filter((s) => s.isPublished).length;
      setStats({
        total,
        published,
        unpublished: total - published,
      });
    } catch (err) {
      console.error("Failed to load stats");
    }
  };

  useEffect(() => {
    fetchShots(1);
  }, [filter]);

  useEffect(() => {
    fetchStats();
  }, [shots]);

  const handleTogglePublished = async (shotId: string) => {
    try {
      await api.patch(`/ui-shots/admin/${shotId}/toggle-published`);
      fetchShots(1);
    } catch (err) {
      setError("Failed to toggle published status");
    }
  };

  const handleDelete = async () => {
    if (!selectedShot || !deleteReason.trim()) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/ui-shots/admin/${selectedShot._id}`, {
        data: { reason: deleteReason.trim() },
      });
      fetchShots(1);
      setDeleteModalOpen(false);
      setSelectedShot(null);
      setDeleteReason("");
    } catch (err) {
      setError("Failed to delete shot");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (shot: UIShot) => {
    setSelectedShot(shot);
    setDeleteReason("");
    setDeleteModalOpen(true);
  };

  const filteredShots = shots.filter(
    (shot) =>
      shot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shot.creatorId.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && shots.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          Failed to load shots
        </h3>
        <p className="text-sm text-neutral-500 mb-4">{error}</p>
        <Button onClick={() => fetchShots(1)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Total Shots</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Published</p>
            <p className="text-2xl font-bold text-success">{stats.published}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Unpublished</p>
            <p className="text-2xl font-bold text-neutral-700">
              {stats.unpublished}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search shots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === "all"
                ? "bg-primary-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === "published"
                ? "bg-primary-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter("unpublished")}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === "unpublished"
                ? "bg-primary-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Unpublished
          </button>
        </div>
      </div>

      {/* Shots Grid */}
      {filteredShots.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Image size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            No shots found
          </h3>
          <p className="text-sm text-neutral-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredShots.map((shot) => (
            <div
              key={shot._id}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] bg-neutral-100">
                <img
                  src={getUploadUrl(`images/${shot.image}`)}
                  alt={shot.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={shot.isPublished ? "success" : "neutral"}
                    size="sm"
                  >
                    {shot.isPublished ? "Published" : "Unpublished"}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-neutral-900 line-clamp-1 mb-1">
                  {shot.title}
                </h3>
                <p className="text-sm text-neutral-500 mb-3">
                  {shot.creatorId.name}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Heart size={14} />
                    {shot.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark size={14} />
                    {shot.saves}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    leftIcon={
                      shot.isPublished ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )
                    }
                    onClick={() => handleTogglePublished(shot._id)}
                  >
                    {shot.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => openDeleteModal(shot)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => fetchShots(page + 1)}
            isLoading={loading}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteModalOpen(false);
            setSelectedShot(null);
            setDeleteReason("");
          }
        }}
        title="Delete UI Shot"
        size="md"
      >
        <div className="space-y-4">
          {selectedShot && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="font-medium text-neutral-900">
                {selectedShot.title}
              </p>
              <p className="text-sm text-neutral-500">
                by {selectedShot.creatorId.name}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Reason for deletion <span className="text-error">*</span>
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Explain why this shot is being deleted..."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedShot(null);
                setDeleteReason("");
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteLoading}
              disabled={!deleteReason.trim()}
            >
              Delete Shot
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
