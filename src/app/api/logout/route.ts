import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/login' || 'https://bluesky-eight-snowy.vercel.app/login'
  const response = NextResponse.redirect(new URL('/', baseUrl))

  // Remove the auth cookie(s)
  response.cookies.set('sb-hkrznhrseusgbcmjggjq-auth-token', '', {
    path: '/',
    expires: new Date(0),
  })

  return response
}