import type { Metadata } from 'next';
import { ServiceOrderChat } from '@/modules/services/components/ServiceOrderChat';

export const metadata: Metadata = {
  title: 'Service Order',
  robots: { index: false, follow: false },
};

interface ServiceOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function ServiceOrderPage({ params }: ServiceOrderPageProps) {
  const { id } = await params;
  return <ServiceOrderChat orderId={id} />;
}
