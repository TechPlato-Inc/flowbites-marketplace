import type { Metadata } from 'next';
import { BuyerDashboardView } from '@/modules/dashboard/buyer/BuyerDashboardView';

export const metadata: Metadata = {
  title: 'My Dashboard',
  robots: { index: false, follow: false },
};

export default function BuyerDashboardPage() {
  return <BuyerDashboardView />;
}
