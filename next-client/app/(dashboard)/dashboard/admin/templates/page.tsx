import type { Metadata } from 'next';
import { TemplateManager } from '@/modules/templates/components/TemplateManager';

export const metadata: Metadata = {
  title: 'Template Manager',
  robots: { index: false, follow: false },
};

export default function TemplateManagerPage() {
  return <TemplateManager />;
}
