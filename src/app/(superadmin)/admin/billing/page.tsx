import { createClient as createAdminClient } from '@supabase/supabase-js'
import { formatCurrency } from '@/lib/utils'
import { Receipt, TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react'

function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: string | number; icon: React.ElementType; color: string; bg: string
}) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
      padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '2px 0 0' }}>{value}</p>
      </div>
    </div>
  )
}

export default async function BillingPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { data: allPayments },
    { data: monthPayments },
    { data: activeMonthlySubs },
    { data: activeYearlySubs },
    { data: recentPayments },
  ] = await Promise.all([
    admin.from('platform_payments').select('amount, status'),
    admin.from('platform_payments').select('amount, status').gte('created_at', startOfMonth.toISOString()),
    admin.from('tenant_subscriptions').select('amount_paid').eq('status', 'active').eq('billing_cycle', 'monthly'),
    admin.from('tenant_subscriptions').select('amount_paid').eq('status', 'active').eq('billing_cycle', 'yearly'),
    admin.from('platform_payments')
      .select('id, amount, status, created_at, tenants(slug, tenant_profiles(name_ar))')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const totalRevenue = (allPayments || []).filter((p: { status: string }) => p.status === 'paid').reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0)
  const monthRevenue = (monthPayments || []).filter((p: { status: string }) => p.status === 'paid').reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0)
  const pendingRevenue = (allPayments || []).filter((p: { status: string }) => p.status !== 'paid').reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0)
  const mrr = (activeMonthlySubs || []).reduce((s: number, x: { amount_paid: number }) => s + Number(x.amount_paid), 0)
    + (activeYearlySubs || []).reduce((s: number, x: { amount_paid: number }) => s + Number(x.amount_paid), 0) / 12
  const arr = mrr * 12

  const stats = [
    { label: 'إجمالي الإيرادات المحصّلة', value: formatCurrency(totalRevenue), icon: DollarSign, color: '#16a34a', bg: '#dcfce7' },
    { label: 'إيرادات هذا الشهر', value: formatCurrency(monthRevenue), icon: Receipt, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'MRR (الإيراد الشهري المتكرر)', value: formatCurrency(mrr), icon: TrendingUp, color: '#C2847A', bg: '#fdf2f0' },
    { label: 'ARR (الإيراد السنوي المتكرر)', value: formatCurrency(arr), icon: TrendingUp, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'مدفوعات معلقة', value: formatCurrency(pendingRevenue), icon: AlertCircle, color: '#d97706', bg: '#fef3c7' },
  ]

  const paymentStatusConfig: Record<string, { bg: string; color: string; label: string; icon: React.ElementType }> = {
    paid: { bg: '#dcfce7', color: '#16a34a', label: 'مدفوع', icon: CheckCircle },
    pending: { bg: '#fef9c3', color: '#a16207', label: 'معلق', icon: Clock },
    failed: { bg: '#fee2e2', color: '#dc2626', label: 'فشل', icon: AlertCircle },
  }

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Receipt size={20} style={{ color: '#C2847A' }} /> المدفوعات والفواتير
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إيرادات منصة الاشتراكات SaaS</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Payments Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>سجل المدفوعات</h3>
          <span style={{ fontSize: 12, color: '#aaa' }}>آخر 50 معاملة</span>
        </div>

        {/* Table Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          padding: '10px 20px', backgroundColor: '#fafafa',
          borderBottom: '1px solid #f0f0f0',
        }}>
          {['الصالون', 'المبلغ', 'الحالة', 'التاريخ'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>{h}</span>
          ))}
        </div>

        {!recentPayments?.length ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#aaa' }}>
            <Receipt size={36} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: 13 }}>لا توجد مدفوعات بعد</p>
          </div>
        ) : (recentPayments || []).map((p: {
          id?: string; amount: number; status: string; created_at: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tenants: any
        }, i: number) => {
          const sc = paymentStatusConfig[p.status] || paymentStatusConfig.pending
          const tenantProfile = Array.isArray(p.tenants?.tenant_profiles) ? p.tenants.tenant_profiles[0] : p.tenants?.tenant_profiles
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
              padding: '12px 20px', borderBottom: '1px solid #f9f9f9', alignItems: 'center',
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
                  {tenantProfile?.name_ar || p.tenants?.slug || '-'}
                </p>
                <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }} dir="ltr">{p.tenants?.slug || ''}</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{formatCurrency(p.amount)}</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                backgroundColor: sc.bg, color: sc.color,
              }}>
                <sc.icon size={10} /> {sc.label}
              </span>
              <span style={{ fontSize: 12, color: '#888' }}>
                {new Date(p.created_at).toLocaleDateString('ar-SA')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
