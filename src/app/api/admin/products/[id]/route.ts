import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

function isAppAdmin(appMetadata: unknown): boolean {
  if (typeof appMetadata !== 'object' || appMetadata === null) return false;
  return (appMetadata as Record<string, unknown>).admin === true;
}

type PatchBody = {
  name?: unknown;
  price?: unknown;
  manufacturer_id?: unknown;
  upc?: unknown;
  image_url?: unknown;
  description?: unknown;
};

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !isAppAdmin(user.app_metadata)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const rawPrice = body.price;
  const priceNum =
    typeof rawPrice === 'number'
      ? rawPrice
      : typeof rawPrice === 'string'
        ? parseFloat(rawPrice)
        : NaN;
  if (!Number.isFinite(priceNum)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  let upc: number | null = null;
  if (body.upc !== undefined && body.upc !== null && body.upc !== '') {
    const n = typeof body.upc === 'number' ? body.upc : Number(String(body.upc).trim());
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: 'Invalid UPC' }, { status: 400 });
    }
    upc = n;
  }

  const manufacturer_id =
    body.manufacturer_id == null || body.manufacturer_id === ''
      ? null
      : String(body.manufacturer_id);

  const image_url =
    body.image_url == null || body.image_url === ''
      ? null
      : String(body.image_url).trim();

  const description =
    body.description == null || body.description === ''
      ? null
      : String(body.description);

  // Use service role after session admin check: RLS `is_admin()` often does not see JWT
  // `app_metadata` the same way `getUser()` does, which led to 0 updated rows and
  // PostgREST "Cannot coerce the result to a single JSON object" on `.single()`.
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({
      name: body.name.trim(),
      price: priceNum,
      manufacturer_id,
      upc,
      image_url,
      description,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ product: data });
}
