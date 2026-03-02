export interface User {
  _id: string;
  email: string;
  name: string;
  role: "buyer" | "creator" | "admin" | "super_admin";
  avatar?: string;
  createdAt: string;
}

export interface UserSettings {
  name: string;
  bio?: string;
  avatar?: string;
}

export interface EmailPreferences {
  orderConfirmation: boolean;
  reviewNotification: boolean;
  followerNotification: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}

export interface NotificationPreferences {
  orders: boolean;
  templates: boolean;
  reviews: boolean;
  services: boolean;
  social: boolean;
  financial: boolean;
  support: boolean;
  account: boolean;
  system: boolean;
}
