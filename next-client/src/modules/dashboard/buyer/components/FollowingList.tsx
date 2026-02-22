"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/design-system";
import { Users, ExternalLink, UserMinus, FileText } from "lucide-react";
import { api, getUploadUrl } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

interface FollowingItem {
  _id: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
    templateCount?: number;
    displayName?: string;
  };
  createdAt: string;
}

export function FollowingList() {
  const [following, setFollowing] = useState<FollowingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/followers/following");
      setFollowing(data.data.following || []);
    } catch (err) {
      setError("Failed to load following list");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (creatorId: string) => {
    setUnfollowingId(creatorId);
    try {
      await api.delete(`/followers/${creatorId}`);
      setFollowing((prev) =>
        prev.filter((item) => item.creatorId._id !== creatorId),
      );
      showToast("Unfollowed successfully", "success");
    } catch (err) {
      showToast("Failed to unfollow", "error");
    } finally {
      setUnfollowingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-neutral-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <Users size={40} className="text-error mx-auto mb-3" />
        <p className="text-neutral-600 mb-4">{error}</p>
        <Button onClick={fetchFollowing}>Retry</Button>
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
        <Users size={48} className="text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">
          You&apos;re not following any creators yet
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          Follow creators to see their latest templates in your feed
        </p>
        <Link href="/creators">
          <Button leftIcon={<ExternalLink size={16} />}>Browse Creators</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-neutral-900">
          Following
          <span className="ml-2 text-sm font-normal text-neutral-400">
            ({following.length})
          </span>
        </h2>
        <Link href="/creators">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ExternalLink size={14} />}
          >
            Discover More
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {following.map((item) => {
          const creator = item.creatorId;
          const displayName = creator.displayName || creator.name;
          const templateCount = creator.templateCount || 0;

          return (
            <div
              key={item._id}
              className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <Link href={`/creators/${creator._id}`}>
                  <div className="w-14 h-14 rounded-full bg-neutral-100 overflow-hidden flex-shrink-0">
                    {creator.avatar ? (
                      <img
                        src={getUploadUrl(`avatars/${creator.avatar}`)}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Users size={24} />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/creators/${creator._id}`}>
                    <h3 className="font-semibold text-neutral-900 hover:text-primary-600 transition-colors truncate">
                      {displayName}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {templateCount} template{templateCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Following since{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href={`/creators/${creator._id}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<UserMinus size={14} />}
                    onClick={() => handleUnfollow(creator._id)}
                    isLoading={unfollowingId === creator._id}
                  >
                    Unfollow
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
