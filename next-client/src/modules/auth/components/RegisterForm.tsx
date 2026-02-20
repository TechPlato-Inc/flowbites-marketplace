'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/design-system';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer' as 'buyer' | 'creator',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData.email, formData.password, formData.name, formData.role);
      if (formData.role === 'creator') {
        router.push('/dashboard/creator/onboarding');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Create Account</h1>
        <p className="text-neutral-600">Join Flowbites Marketplace</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            helperText="Minimum 6 characters"
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                className={`!p-3 sm:!p-4 !border-2 !rounded-lg !text-center !transition-colors !h-auto ${
                  formData.role === 'buyer'
                    ? '!border-primary-500 !bg-primary-50'
                    : '!border-neutral-200 hover:!border-neutral-300'
                }`}
              >
                <div className="font-semibold text-sm sm:text-base">Buy Templates</div>
                <div className="text-xs sm:text-sm text-neutral-600">Browse & purchase</div>
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setFormData({ ...formData, role: 'creator' })}
                className={`!p-3 sm:!p-4 !border-2 !rounded-lg !text-center !transition-colors !h-auto ${
                  formData.role === 'creator'
                    ? '!border-primary-500 !bg-primary-50'
                    : '!border-neutral-200 hover:!border-neutral-300'
                }`}
              >
                <div className="font-semibold text-sm sm:text-base">Sell Templates</div>
                <div className="text-xs sm:text-sm text-neutral-600">Earn from your work</div>
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-error bg-error-light p-3 rounded-lg">{error}</div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-600">Already have an account? </span>
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
