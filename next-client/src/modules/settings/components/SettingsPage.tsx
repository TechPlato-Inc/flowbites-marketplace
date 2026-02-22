"use client";

import { useState, useEffect } from "react";
import { User, Lock, Mail } from "lucide-react";
import { ProfileSettings } from "./ProfileSettings";
import { SecuritySettings } from "./SecuritySettings";
import { EmailPreferences } from "./EmailPreferences";
import { api } from "@/lib/api/client";

type TabType = "profile" | "security" | "email";

interface UserProfile {
  name: string;
  bio?: string;
  avatar?: string;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setProfile({
        name: data.data.name,
        bio: data.data.bio,
        avatar: data.data.avatar,
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "profile" as TabType,
      label: "Profile",
      icon: User,
      description: "Update your personal information",
    },
    {
      id: "security" as TabType,
      label: "Security",
      icon: Lock,
      description: "Change password and account settings",
    },
    {
      id: "email" as TabType,
      label: "Email Preferences",
      icon: Mail,
      description: "Manage notification settings",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          Settings
        </h1>
        <p className="text-neutral-500 mt-1">
          Manage your account preferences and security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isActive
                    ? "bg-primary-50 border border-primary-200 text-primary-700"
                    : "hover:bg-neutral-50 border border-transparent text-neutral-600"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-primary-500" : "text-neutral-400"}
                />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            {/* Tab Header */}
            <div className="mb-6 pb-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                {tabs.find((t) => t.id === activeTab)?.description}
              </p>
            </div>

            {/* Tab Content */}
            {activeTab === "profile" && (
              <ProfileSettings
                initialProfile={profile}
                onUpdate={(updated) => setProfile(updated)}
              />
            )}
            {activeTab === "security" && <SecuritySettings />}
            {activeTab === "email" && <EmailPreferences />}
          </div>
        </div>
      </div>
    </div>
  );
}
