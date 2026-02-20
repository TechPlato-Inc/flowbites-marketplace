import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="p-4">
        <Link href="/" className="inline-block">
          <img src="/logo.png" alt="Flowbites" className="h-8 w-auto" />
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        {children}
      </div>
    </div>
  );
}
