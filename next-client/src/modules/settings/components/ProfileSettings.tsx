"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Input } from "@/design-system";
import { User, Camera, Loader2 } from "lucide-react";
import { api, getUploadUrl } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";

interface UserProfile {
  name: string;
  bio?: string;
  avatar?: string;
}

interface ProfileSettingsProps {
  initialProfile?: UserProfile;
  onUpdate?: (profile: UserProfile) => void;
}

export function ProfileSettings({
  initialProfile,
  onUpdate,
}: ProfileSettingsProps) {
  const [formData, setFormData] = useState<UserProfile>({
    name: initialProfile?.name || "",
    bio: initialProfile?.bio || "",
    avatar: initialProfile?.avatar || "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    }
  }, [initialProfile]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.patch("/settings/profile", {
        name: formData.name.trim(),
        bio: formData.bio?.trim() || undefined,
        avatar: formData.avatar,
      });

      showToast("Profile updated successfully", "success");
      onUpdate?.(data.data);
    } catch (err: any) {
      showToast(
        err?.response?.data?.error || "Failed to update profile",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await api.post("/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData((prev) => ({ ...prev, avatar: data.data.avatar }));
      showToast("Avatar updated", "success");
    } catch (err: any) {
      showToast(
        err?.response?.data?.error || "Failed to upload avatar",
        "error",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={handleAvatarClick}
            disabled={uploadingAvatar}
            className="w-20 h-20 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center border-2 border-dashed border-neutral-300 hover:border-primary-400 transition-colors relative group"
          >
            {formData.avatar ? (
              <img
                src={getUploadUrl(`avatars/${formData.avatar}`)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={32} className="text-neutral-400" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
          </button>
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-full">
              <Loader2 size={24} className="text-primary-500 animate-spin" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div>
          <p className="font-medium text-neutral-900">Profile Photo</p>
          <p className="text-sm text-neutral-500">
            Click to upload a new avatar
          </p>
          <p className="text-xs text-neutral-400">JPG, PNG or GIF. Max 5MB.</p>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Full Name <span className="text-error">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Your name"
          leftIcon={<User size={16} />}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Bio <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          value={formData.bio || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, bio: e.target.value }))
          }
          placeholder="Tell us a bit about yourself..."
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none text-sm"
        />
        <p className="text-xs text-neutral-400 mt-1 text-right">
          {(formData.bio || "").length}/500 characters
        </p>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-neutral-200">
        <Button
          onClick={handleSubmit}
          isLoading={loading}
          disabled={!formData.name.trim()}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
