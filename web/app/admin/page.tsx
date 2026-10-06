import type { Metadata } from 'next';
import PanelAdmin from '@/components/admin/PanelAdmin';

export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false },
};

export default function Admin() {
  return <PanelAdmin />;
}
