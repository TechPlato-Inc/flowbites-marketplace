'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api/client';
import { Button, Input } from '@/design-system';
import { User, Lock, Save, Check } from 'lucide-react';

type Tab = 'profile' | 'security';

export default function SettingsPage() {
  const { user, fetchUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      await api.patch('/auth/profile', { name, bio });
      await fetchUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-8">Settings</h1>

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-8">
        <div className="flex gap-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className={`!rounded-none !pb-3 !border-b-2 !font-medium !text-sm !transition-colors ${
                  activeTab === tab.key
                    ? '!border-primary-500 !text-primary-600'
                    : '!border-transparent !text-neutral-500 hover:!text-neutral-700'
                }`}
                leftIcon={<Icon size={16} />}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Profile Information</h2>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />

            <Input
              label="Display Name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your display name"
              required
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors resize-none"
              />
              <p className="text-xs text-neutral-400 mt-1">{bio.length}/500 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Account Role</label>
              <div className="inline-block px-3 py-1.5 bg-primary-50 text-primary-600 text-sm font-medium rounded-lg capitalize">
                {user?.role}
              </div>
            </div>

            {profileError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{profileError}</div>
            )}

            {profileSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <Check size={16} />
                Profile updated successfully
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" isLoading={profileLoading} leftIcon={<Save size={16} />}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Change Password</h2>

          <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              helperText="Minimum 6 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />

            {passwordError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{passwordError}</div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <Check size={16} />
                Password changed successfully
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" isLoading={passwordLoading} leftIcon={<Lock size={16} />}>
                Change Password
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
