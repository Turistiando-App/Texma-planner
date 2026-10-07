import type { Metadata } from 'next';
import Acceso from '@/components/Acceso';

export const metadata: Metadata = {
  title: 'Acceso a TEXMA Planner',
  description: 'Entrá a TEXMA Planner con tu cuenta de Google.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
};

export default function Login() {
  return <Acceso />;
}
