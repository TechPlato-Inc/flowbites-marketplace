import type { Metadata } from 'next';
import { CreatorManager } from '@/modules/creators/components/CreatorManager';

export const metadata: Metadata = {
  title: 'Creator Manager',
  robots: { index: false, follow: false },
};

export default function CreatorManagerPage() {
  return <CreatorManager />;
}
