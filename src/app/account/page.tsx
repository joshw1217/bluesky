import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/logoutButton';
import Navbar from '@/components/navbar';


export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Eventually you will query Supabase for orders here.
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <div className="mx-auto w-full min-h-0 flex-1 p-6 text-white bg-[url('/background.jpg')] bg-cover bg-center">
        <h1 className="text-3xl font-bold mb-4">My Account</h1>
        <p>Welcome, {user.email}</p>
        <LogoutButton />
        {/* Show order history + settings here */}
      </div>
    </div>
  );
}

