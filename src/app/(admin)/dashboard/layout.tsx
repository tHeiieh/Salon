import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: profile } = await admin
    .from('user_profiles')
    .select('*, tenants(*, tenant_profiles(*))')
    .eq('id', user.id)
    .single()

  if (!profile || !['salon_owner', 'salon_staff'].includes(profile.role)) {
    redirect('/auth/login')
  }

  return (
    <div
      dir="rtl"
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
        fontFamily: 'var(--font-sans, system-ui)',
      }}
    >
      <DashboardSidebar userProfile={profile} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <DashboardHeader userProfile={profile} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
