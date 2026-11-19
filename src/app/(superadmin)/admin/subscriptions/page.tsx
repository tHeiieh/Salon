import { createClient as createAdminClient } from '@supabase/supabase-js'
import { CreditCard } from 'lucide-react'
import { SubsClient } from './SubsClient'

export default async function SubscriptionsPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const [{ data: subs }, { data: plans }] = await Promise.all([
    admin.from('tenant_subscriptions')
      .select(`
        id, status, billing_cycle, current_period_end, amount_paid, created_at, tenant_id,
        tenant:tenants(slug, tenant_profiles(name_ar)),
        plan:subscription_plans(name_ar, name_en)
      `)
      .order('created_at', { ascending: false })
      .limit(100),
    admin.from('subscription_plans')
      .select('id, name_ar, price_monthly, price_yearly')
      .eq('is_active', true)
      .order('price_monthly'),
  ])

  // normalize tenant join
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalized = (subs || []).map((s: any) => {
    const tenant = Array.isArray(s.tenant) ? s.tenant[0] : s.tenant
    const profile = tenant ? (Array.isArray(tenant.tenant_profiles) ? tenant.tenant_profiles[0] : tenant.tenant_profiles) : null
    return { ...s, tenant: tenant ? { slug: tenant.slug, name: profile?.name_ar } : null }
  })

  const active = normalized.filter(s => s.status === 'active').length
  const trial  = normalized.filter(s => s.status === 'trial').length
  const mrr    = normalized
    .filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
    .reduce((sum: number, s: { amount_paid: number }) => sum + Number(s.amount_paid), 0)
  + normalized
    .filter(s => s.status === 'active' && s.billing_cycle === 'yearly')
    .reduce((sum: number, s: { amount_paid: number }) => sum + Number(s.amount_paid) / 12, 0)

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={20} style={{ color: '#C2847A' }} /> الاشتراكات
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إدارة اشتراكات الصالونات</p>
      </div>
      <SubsClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subs={normalized as any}
        plans={plans || []}
        stats={{ active, trial, mrr }}
      />
    </div>
  )
}
