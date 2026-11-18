import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
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

  if (!profile || profile.role !== 'employee') {
    redirect('/auth/login')
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'var(--font-sans, system-ui)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundImage: 'linear-gradient(135deg, #C2847A, #d4a96a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 20c0-2.21-2.24-4-5-4s-5 1.79-5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#1a1a1a', margin: 0 }}>بوابة الموظفة</p>
            <p style={{ fontSize: 11, color: '#9a7e78', margin: 0 }}>
              {(profile.tenants as { tenant_profiles?: { name_ar?: string }[] } | null)?.tenant_profiles?.[0]?.name_ar || 'الصالون'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{profile.name_ar || 'موظفة'}</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>موظفة</p>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: '#fdf4f3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#C2847A" fillOpacity="0.3" stroke="#C2847A" strokeWidth="1.5"/>
              <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="#C2847A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </header>
      <main style={{ padding: 24, maxWidth: 768, margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
