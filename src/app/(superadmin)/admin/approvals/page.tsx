import { createClient as createAdminClient } from '@supabase/supabase-js'
import { CheckSquare, Building2, Eye } from 'lucide-react'
import Link from 'next/link'

export default async function ApprovalsPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: pendingSalons } = await admin
    .from('tenants')
    .select('id, slug, status, created_at, tenant_profiles(name_ar, email, phone, cr_number)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckSquare size={20} style={{ color: '#C2847A' }} /> طلبات الموافقة
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
          صالونات قيد المراجعة ({pendingSalons?.length || 0})
        </p>
      </div>

      {!pendingSalons?.length ? (
        <div style={{
          backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
          padding: '48px 20px', textAlign: 'center', color: '#aaa',
        }}>
          <CheckSquare size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>لا توجد طلبات معلقة</p>
          <p style={{ margin: '4px 0 0', fontSize: 12 }}>ستظهر هنا الصالونات التي تنتظر مراجعتك</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingSalons.map((salon: {
            id: string; slug: string; status: string; created_at: string
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tenant_profiles: any
          }) => {
            const p = Array.isArray(salon.tenant_profiles) ? salon.tenant_profiles[0] : salon.tenant_profiles
            return (
              <div key={salon.id} style={{
                backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Building2 size={20} style={{ color: '#0369a1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>{p?.name_ar || salon.slug}</p>
                  <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>
                    {p?.email || salon.slug} · طلب في {new Date(salon.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <Link href={`/admin/salons/${salon.id}`}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px',
                    borderRadius: 9, border: '1.5px solid #e5e5e5', backgroundColor: '#fff',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#555',
                  }}>
                    <Eye size={13} /> مراجعة
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
