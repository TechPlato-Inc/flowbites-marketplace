import type { Metadata } from 'next';
import { AdminDashboardView } from '@/modules/dashboard/admin/AdminDashboardView';

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <AdminDashboardView />;
}
