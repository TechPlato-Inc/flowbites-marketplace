import type { Metadata } from 'next';
import { BlogManagementView } from '@/modules/dashboard/admin/BlogManagementView';

export const metadata: Metadata = {
  title: 'Blog Management',
  robots: { index: false, follow: false },
};

export default function BlogManagementPage() {
  return <BlogManagementView />;
}
