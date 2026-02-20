import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCreatorById } from '@/modules/creators/services/creators.service.server';
import { CreatorProfileView } from '@/modules/creators/components/CreatorProfileView';

interface CreatorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const data = await getCreatorById(id);
    return {
      title: data.profile.displayName,
      description: (data.profile.bio || '').slice(0, 160),
      alternates: {
        canonical: `/creators/${id}`,
      },
    };
  } catch {
    return { title: 'Creator Not Found' };
  }
}

export default async function CreatorProfilePage({ params }: CreatorPageProps) {
  const { id } = await params;

  let data;
  try {
    data = await getCreatorById(id);
  } catch {
    notFound();
  }

  return <CreatorProfileView data={data} />;
}
