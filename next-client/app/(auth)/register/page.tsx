import type { Metadata } from 'next';
import { RegisterForm } from '@/modules/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
