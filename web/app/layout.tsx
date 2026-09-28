import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, JetBrains_Mono, Manrope } from 'next/font/google';
import './globals.css';
import FondoCostura from '@/components/FondoCostura';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import JsonLd from '@/components/JsonLd';
import { StockEnVivoProvider } from '@/components/StockEnVivo';
import { SITIO } from '@/lib/sitio';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['600', '700'], style: ['italic'], variable: '--font-cormorant', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: { default: 'TEXMA · Mercería online y app para modistas', template: '%s · TEXMA' },
  description: 'Hilos, botones, cierres y elásticos con stock real, y TEXMA, la app que ordena medidas, entregas, stock y plata de tu taller de costura.',
  openGraph: { type: 'website', locale: 'es_AR', siteName: 'TEXMA' },
  alternates: { canonical: '/' },
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = { themeColor: '#F3EEE5', colorScheme: 'only light' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${cormorant.variable} ${manrope.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'TEXMA',
          url: SITIO.url,
          email: SITIO.mail,
          contactPoint: SITIO.whatsapp.map(w => ({ '@type': 'ContactPoint', telephone: `+${w.numero}`, contactType: 'sales', areaServed: 'AR', availableLanguage: 'es' })),
        }} />
        <FondoCostura />
        <Header />
        <StockEnVivoProvider>
          <main>{children}</main>
        </StockEnVivoProvider>
        <Footer />
      </body>
    </html>
  );
}
