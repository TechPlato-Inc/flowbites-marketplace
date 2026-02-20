'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/design-system';
import { CheckCircle, ArrowRight, ExternalLink, Info } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'template';
  const isDemo = searchParams.get('demo') === 'true';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-3">
          Payment Successful!
        </h1>

        <p className="text-neutral-600 mb-6">
          {type === 'service'
            ? 'Your service order has been placed. The creator will be notified and you can track progress in your dashboard.'
            : 'Your purchase is complete. You can now access your templates from your dashboard — clone, remix, or download depending on the platform.'}
        </p>

        {isDemo && (
          <div className="flex items-start gap-3 text-left bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Demo Mode</p>
              <p>This purchase was processed in demo mode — no real payment was charged. To enable real Stripe payments, configure your <code className="bg-amber-100 px-1 rounded">STRIPE_SECRET_KEY</code> in the server .env file.</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {type === 'template' ? (
            <Link href="/dashboard/buyer">
              <Button size="lg" className="w-full" leftIcon={<ExternalLink size={20} />}>
                Go to My Templates
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/buyer">
              <Button size="lg" className="w-full" rightIcon={<ArrowRight size={20} />}>
                View My Orders
              </Button>
            </Link>
          )}

          <Link href="/templates">
            <Button size="lg" variant="outline" className="w-full">
              Continue Browsing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
