import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SalonsClient } from './SalonsClient'
import { Building2 } from 'lucide-react'

export default async function SalonsPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const [{ data: salons }, { data: plans }] = await Promise.all([
    admin.from('tenants')
      .select(`
        id, slug, status, created_at,
        profile:tenant_profiles(name_ar, email, phone),
        subscription:tenant_subscriptions(status, current_period_end, amount_paid, billing_cycle, plan:subscription_plans(name_ar))
      `)
      .order('created_at', { ascending: false }),
    admin.from('subscription_plans')
      .select('id, name_ar, price_monthly, price_yearly')
      .eq('is_active', true)
      .order('price_monthly'),
  ])

  const normalize = (s: { profile: unknown; subscription: unknown; [k: string]: unknown }) => ({
    ...s,
    profile: Array.isArray(s.profile) ? s.profile[0] ?? null : s.profile,
    subscription: Array.isArray(s.subscription) ? s.subscription : [],
  })

  return (
    <div dir="rtl">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={20} style={{ color: '#C2847A' }} /> الصالونات
          </h1>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
            إجمالي {salons?.length || 0} صالون
          </p>
        </div>
      </div>

      <SalonsClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        salons={(salons || []).map(normalize) as any}
        plans={plans || []}
      />
    </div>
  )
}
