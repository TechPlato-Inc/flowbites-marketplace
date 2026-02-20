import type { Metadata } from 'next';
import { CreatorOnboardingFlow } from '@/modules/creators/components/CreatorOnboardingFlow';

export const metadata: Metadata = {
  title: 'Creator Verification',
  robots: { index: false, follow: false },
};

export default function CreatorOnboardingPage() {
  return <CreatorOnboardingFlow />;
}
