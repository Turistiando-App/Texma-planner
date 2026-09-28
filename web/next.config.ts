import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    /* fotos de productos desde el Storage de Supabase */
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
};

export default config;
