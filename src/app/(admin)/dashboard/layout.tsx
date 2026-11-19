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
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single()

  if (!profile || !['salon_owner', 'salon_staff'].includes(profile.role)) {
    redirect('/auth/login')
  }

  // Fetch tenant profile separately to avoid one-to-one join coercion issues
  const { data: tenantProfiles } = await admin
    .from('tenant_profiles')
    .select('name_ar, logo_url')
    .eq('tenant_id', profile.tenant_id)
    .limit(1)

  const profileWithTenantProfile = {
    ...profile,
    tenants: profile.tenants
      ? { ...profile.tenants, tenant_profiles: tenantProfiles || [] }
      : null,
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
      <DashboardSidebar userProfile={profileWithTenantProfile} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <DashboardHeader userProfile={profileWithTenantProfile} />
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
