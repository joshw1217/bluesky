import AdminProductsPageClient from '@/app/admin/products/admin-products-page-client';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { notFound, redirect } from 'next/navigation';

function isAppAdmin(appMetadata: Record<string, unknown> | undefined): boolean {
  return appMetadata?.admin === true;
}

export default async function AdminProductsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/');
  }

  if (!isAppAdmin(user.app_metadata as Record<string, unknown> | undefined)) {
    notFound();
  }

  return <AdminProductsPageClient />;
}
