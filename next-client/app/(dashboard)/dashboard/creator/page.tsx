import type { Metadata } from 'next';
import { CreatorDashboardView } from '@/modules/dashboard/creator/CreatorDashboardView';

export const metadata: Metadata = {
  title: 'Creator Studio',
  robots: { index: false, follow: false },
};

export default function CreatorDashboardPage() {
  return <CreatorDashboardView />;
}
