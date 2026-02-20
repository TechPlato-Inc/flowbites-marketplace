import type { Metadata } from 'next';
import { UIShortsContent } from '@/modules/ui-shorts/components/UIShortsContent';

export const metadata: Metadata = {
  title: 'UI Shorts',
  description: 'Discover beautiful UI design shots from talented creators on Flowbites Marketplace.',
  alternates: {
    canonical: '/ui-shorts',
  },
};

export default function UIShortsPage() {
  return <UIShortsContent />;
}
