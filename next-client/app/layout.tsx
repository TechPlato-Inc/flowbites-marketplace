import type { Metadata } from 'next';
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/components/layout/AuthProvider';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Flowbites — Premium Template Marketplace',
    template: '%s — Flowbites',
  },
  description: 'The modern marketplace where designers sell premium Webflow, Framer, and Wix templates and grow their creative business.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flowbites.com'),
  openGraph: {
    type: 'website',
    siteName: 'Flowbites',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased text-neutral-900 bg-white" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
