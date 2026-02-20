'use client';

import { useEffect } from 'react';
import { Button } from '@/design-system';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-display font-bold text-neutral-900 mb-4">
          Something went wrong
        </h2>
        <p className="text-neutral-600 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}
