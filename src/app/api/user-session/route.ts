import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient()

  const { data, error} = await supabase.auth.getUser()
  const isAdmin = data.user?.user_metadata.admin

  if(data.user === null) return NextResponse.json({ success: true, user: null })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return NextResponse.json({ success: true, user: data })
}

