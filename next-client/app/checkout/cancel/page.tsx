'use client';

import Link from 'next/link';
import { Button } from '@/design-system';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={32} className="text-red-600" />
        </div>

        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-3">
          Payment Cancelled
        </h1>

        <p className="text-neutral-600 mb-8">
          Your payment was cancelled and you have not been charged. You can try again whenever you&apos;re ready.
        </p>

        <div className="space-y-3">
          <Link href="/templates">
            <Button size="lg" className="w-full" leftIcon={<ArrowLeft size={20} />}>
              Back to Templates
            </Button>
          </Link>

          <Link href="/services">
            <Button size="lg" variant="outline" className="w-full">
              Browse Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
