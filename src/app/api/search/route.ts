import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('q')
  const safeSearch = search?.replace(/[^\w\s-]/gi, '').trim();

  

  const supabase = await createSupabaseServerClient()
  
  const orFilter = [
    `name.ilike.%${safeSearch}%`,
    `tags.ilike.%${safeSearch}%`,
    `id.eq.${safeSearch}`
  ].join(',');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(orFilter);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data })
}
