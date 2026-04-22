import { PRODUCT_IMAGES_BUCKET } from '@/lib/productImageUrl';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

function isAppAdmin(appMetadata: unknown): boolean {
  if (typeof appMetadata !== 'object' || appMetadata === null) return false;
  return (appMetadata as Record<string, unknown>).admin === true;
}

const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !isAppAdmin(user.app_metadata)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Missing or empty file' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(id, bytes, {
      upsert: true,
      contentType: file.type || 'application/octet-stream',
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: product, error: dbError } = await supabaseAdmin
    .from('products')
    .update({ image_url: id })
    .eq('id', id)
    .select()
    .single();

  if (dbError) {
    const status = dbError.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: dbError.message }, { status });
  }

  return NextResponse.json({ image_url: id, product });
}
