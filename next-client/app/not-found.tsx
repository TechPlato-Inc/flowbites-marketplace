import Link from 'next/link';
import { Button } from '@/design-system';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-bold text-neutral-200 mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-4">
          Page not found
        </h1>
        <p className="text-neutral-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
