import { api } from "@/lib/api/client";
import type { UserSettings, EmailPreferences } from "@/types";

export async function updateProfile(payload: {
  name?: string;
  bio?: string;
}): Promise<UserSettings> {
  const { data } = await api.patch("/settings/profile", payload);
  return data.data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const { data } = await api.post("/settings/change-password", payload);
  return data.data;
}

export async function updateAvatar(file: File): Promise<{ avatar: string }> {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.patch("/settings/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function getEmailPreferences(): Promise<EmailPreferences> {
  const { data } = await api.get("/settings/email-preferences");
  return data.data;
}

export async function updateEmailPreferences(
  prefs: Partial<EmailPreferences>,
): Promise<EmailPreferences> {
  const { data } = await api.patch("/settings/email-preferences", prefs);
  return data.data;
}

export async function deactivateAccount(): Promise<{ message: string }> {
  const { data } = await api.post("/settings/deactivate");
  return data.data;
}
