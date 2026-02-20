'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/design-system';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(msg || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Welcome Back</h1>
        <p className="text-neutral-600">Sign in to your Flowbites account</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="text-sm text-error bg-error-light p-3 rounded-lg">{error}</div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-600">Don&apos;t have an account? </span>
          <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
