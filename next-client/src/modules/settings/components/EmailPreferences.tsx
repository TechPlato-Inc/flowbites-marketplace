"use client";

import { useEffect, useState, useCallback } from "react";
import { Mail, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import { showToast } from "@/design-system/Toast";
import { Button } from "@/design-system";

interface EmailPreferencesData {
  orderConfirmation: boolean;
  reviewNotification: boolean;
  followerNotification: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}

const defaultPreferences: EmailPreferencesData = {
  orderConfirmation: true,
  reviewNotification: true,
  followerNotification: true,
  marketingEmails: false,
  weeklyDigest: true,
};

interface PreferenceItemProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  saving?: boolean;
}

function PreferenceItem({
  title,
  description,
  checked,
  onChange,
  saving,
}: PreferenceItemProps) {
  return (
    <div className="flex items-start justify-between p-4 bg-neutral-50 rounded-xl">
      <div className="flex-1 pr-4">
        <h4 className="font-medium text-neutral-900">{title}</h4>
        <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
          disabled={saving}
        />
        <div
          className={`
          w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 
          rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
          after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
          after:transition-all peer-checked:bg-primary-500
          ${saving ? "opacity-50" : ""}
        `}
        />
        {saving && (
          <Loader2
            size={14}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-spin"
          />
        )}
      </label>
    </div>
  );
}

export function EmailPreferences() {
  const [preferences, setPreferences] =
    useState<EmailPreferencesData>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/settings/email-preferences");
      setPreferences({ ...defaultPreferences, ...data.data });
    } catch (err) {
      setError("Failed to load email preferences");
    } finally {
      setLoading(false);
    }
  };

  // Debounced save function
  const savePreference = useCallback(
    async (key: keyof EmailPreferencesData, value: boolean) => {
      setSavingId(key);
      try {
        const newPreferences = { ...preferences, [key]: value };
        await api.patch("/settings/email-preferences", newPreferences);
        setPreferences(newPreferences);
        showToast("Preference saved", "success");
      } catch (err: any) {
        showToast(
          err?.response?.data?.error || "Failed to save preference",
          "error",
        );
        // Revert on error
        setPreferences((prev) => ({ ...prev }));
      } finally {
        setSavingId(null);
      }
    },
    [preferences],
  );

  const handleToggle =
    (key: keyof EmailPreferencesData) => (checked: boolean) => {
      // Optimistically update
      setPreferences((prev) => ({ ...prev, [key]: checked }));
      // Debounce the save
      const timeoutId = setTimeout(() => {
        savePreference(key, checked);
      }, 500);
      return () => clearTimeout(timeoutId);
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 rounded-xl p-8 text-center">
        <AlertCircle size={40} className="text-error mx-auto mb-3" />
        <p className="text-neutral-600 mb-4">{error}</p>
        <Button onClick={fetchPreferences}>Retry</Button>
      </div>
    );
  }

  const preferenceItems: {
    key: keyof EmailPreferencesData;
    title: string;
    description: string;
  }[] = [
    {
      key: "orderConfirmation",
      title: "Order Confirmations",
      description: "Receive email notifications when you make a purchase",
    },
    {
      key: "reviewNotification",
      title: "Review Notifications",
      description: "Get notified when someone leaves a review on your template",
    },
    {
      key: "followerNotification",
      title: "New Follower Notifications",
      description: "Receive an email when someone follows you",
    },
    {
      key: "weeklyDigest",
      title: "Weekly Digest",
      description: "Get a weekly summary of your account activity and stats",
    },
    {
      key: "marketingEmails",
      title: "Marketing Emails",
      description:
        "Receive updates about new features, promotions, and marketplace news",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <Mail size={20} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-neutral-900">
            Manage Your Email Preferences
          </h4>
          <p className="text-sm text-neutral-600 mt-0.5">
            Choose which emails you want to receive. Changes are saved
            automatically.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {preferenceItems.map((item) => (
          <PreferenceItem
            key={item.key}
            title={item.title}
            description={item.description}
            checked={preferences[item.key]}
            onChange={handleToggle(item.key)}
            saving={savingId === item.key}
          />
        ))}
      </div>
    </div>
  );
}
