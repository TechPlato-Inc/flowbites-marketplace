import type { Metadata } from 'next';
import { ServiceCreateForm } from '@/modules/services/components/ServiceCreateForm';

export const metadata: Metadata = {
  title: 'Create Service',
  robots: { index: false, follow: false },
};

export default function CreateServicePage() {
  return <ServiceCreateForm />;
}
