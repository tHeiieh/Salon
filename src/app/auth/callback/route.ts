import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login?error=no_user', process.env.NEXT_PUBLIC_APP_URL!))
  }

  // Use plain admin client (not SSR) so service role key isn't overridden by session cookies
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const { data: profile } = await admin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL(`/auth/login?error=no_profile&uid=${user.id}`, process.env.NEXT_PUBLIC_APP_URL!))
  }

  if (profile.role === 'superadmin') {
    return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_APP_URL!))
  }
  if (profile.role === 'employee') {
    return NextResponse.redirect(new URL('/portal', process.env.NEXT_PUBLIC_APP_URL!))
  }
  return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL!))
}
