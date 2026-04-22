import type { NextConfig } from 'next';

function supabaseStorageRemotePattern():
  | { protocol: 'https'; hostname: string; pathname: string }
  | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return undefined;
    return {
      protocol: 'https',
      hostname: u.hostname,
      pathname: '/storage/v1/object/public/**',
    };
  } catch {
    return undefined;
  }
}

const storagePattern = supabaseStorageRemotePattern();

const nextConfig: NextConfig = {
  images: storagePattern
    ? {
        remotePatterns: [storagePattern],
      }
    : undefined,
};

export default nextConfig;
