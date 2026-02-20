import type { Metadata } from 'next';
import { TemplateUploadForm } from '@/modules/templates/components/TemplateUploadForm';

export const metadata: Metadata = {
  title: 'Submit Template',
  robots: { index: false, follow: false },
};

export default function UploadTemplatePage() {
  return <TemplateUploadForm />;
}
