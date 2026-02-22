"use client";

import { useState, useEffect } from "react";
import { Button } from "@/design-system";
import { UserPlus, UserCheck } from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

interface FollowButtonProps {
  creatorId: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost";
}

export function FollowButton({
  creatorId,
  showCount = true,
  size = "md",
  variant = "primary",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchFollowStatus();
  }, [creatorId]);

  const fetchFollowStatus = async () => {
    try {
      const [checkRes, countRes] = await Promise.all([
        api.get(`/followers/check/${creatorId}`),
        api.get(`/followers/count/${creatorId}`),
      ]);
      setIsFollowing(checkRes.data.data.following);
      setFollowerCount(countRes.data.data.count);
    } catch (error) {
      console.error("Failed to fetch follow status:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggle = async () => {
    if (loading) return;

    // Optimistic update
    const previousState = isFollowing;
    const newState = !previousState;
    setIsFollowing(newState);
    setFollowerCount((prev) => (newState ? prev + 1 : prev - 1));
    setLoading(true);

    try {
      if (newState) {
        await api.post(`/followers/${creatorId}`);
        showToast("You are now following this creator", "success");
      } else {
        await api.delete(`/followers/${creatorId}`);
        showToast("Unfollowed successfully", "success");
      }
    } catch (error) {
      // Revert on failure
      setIsFollowing(previousState);
      setFollowerCount((prev) => (previousState ? prev + 1 : prev - 1));
      showToast("Failed to update follow status", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="h-9 w-24 bg-neutral-100 rounded-lg animate-pulse" />;
  }

  const buttonVariant = isFollowing ? "outline" : variant;
  const buttonIcon = isFollowing ? (
    <UserCheck size={size === "sm" ? 14 : 16} />
  ) : (
    <UserPlus size={size === "sm" ? 14 : 16} />
  );

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleToggle}
        isLoading={loading}
        variant={buttonVariant}
        size={size}
        leftIcon={buttonIcon}
        aria-label={isFollowing ? "Unfollow creator" : "Follow creator"}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>

      {showCount && (
        <span className="text-sm text-neutral-500">
          {followerCount.toLocaleString()} follower
          {followerCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
