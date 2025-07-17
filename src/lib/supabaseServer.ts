import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabase() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
          return (await cookieStore).getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll: async (newCookies) => {
          newCookies.forEach( async(cookie) => {
            (await cookieStore).set(cookie.name, cookie.value, {
              path: '/',
              // Add secure, httpOnly, etc. if needed
            });
          });
        },
      },
    }
  );
}
