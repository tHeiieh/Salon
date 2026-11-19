import { createClient as createAdminClient } from '@supabase/supabase-js'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import {
  Building2, Activity, AlertCircle, TrendingUp,
  CreditCard, Calendar, Users, DollarSign, Clock, CheckCircle,
} from 'lucide-react'

function StatCard({
  label, value, icon: Icon, color, bg, href,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  bg: string
  href?: string
}) {
  const content = (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 14,
      border: '1px solid #f0f0f0',
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'box-shadow 0.15s',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, color: '#888', margin: 0, lineHeight: 1.3 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '2px 0 0', lineHeight: 1.2 }}>{value}</p>
      </div>
    </div>
  )
  return href ? (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{content}</Link>
  ) : <div>{content}</div>
}

function SectionCard({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 14,
      border: '1px solid #f0f0f0',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid #f5f5f5',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{title}</h3>
        {href && (
          <Link href={href} style={{ fontSize: 12, color: '#C2847A', textDecoration: 'none' }}>عرض الكل</Link>
        )}
      </div>
      {children}
    </div>
  )
}

const statusLabel: Record<string, string> = {
  active: 'نشط', trial: 'تجريبي', suspended: 'موقوف',
  pending: 'قيد المراجعة', cancelled: 'ملغي', expired: 'منتهي',
}
const statusColor: Record<string, { bg: string; color: string }> = {
  active: { bg: '#dcfce7', color: '#16a34a' },
  trial: { bg: '#fef9c3', color: '#a16207' },
  suspended: { bg: '#fee2e2', color: '#dc2626' },
  pending: { bg: '#e0f2fe', color: '#0369a1' },
  cancelled: { bg: '#f4f4f5', color: '#71717a' },
  expired: { bg: '#fce7f3', color: '#be185d' },
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { count: totalTenants },
    { count: activeTenants },
    { count: trialTenants },
    { count: suspendedTenants },
    { count: newThisMonth },
    { data: activeMonthlySubs },
    { data: activeYearlySubs },
    { data: recentTenants },
    { data: recentPayments },
    { data: expiringSoon },
  ] = await Promise.all([
    admin.from('tenants').select('id', { count: 'exact', head: true }),
    admin.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'trial'),
    admin.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
    admin.from('tenants').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
    admin.from('tenant_subscriptions').select('amount_paid').eq('status', 'active').eq('billing_cycle', 'monthly'),
    admin.from('tenant_subscriptions').select('amount_paid').eq('status', 'active').eq('billing_cycle', 'yearly'),
    admin.from('tenants')
      .select('id, slug, status, created_at, tenant_profiles(name_ar)')
      .order('created_at', { ascending: false }).limit(8),
    admin.from('platform_payments')
      .select('amount, status, created_at, tenants(slug, tenant_profiles(name_ar))')
      .order('created_at', { ascending: false }).limit(8),
    admin.from('tenant_subscriptions')
      .select('id, current_period_end, tenant:tenants(slug, tenant_profiles(name_ar))')
      .eq('status', 'active')
      .lt('current_period_end', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .gte('current_period_end', new Date().toISOString())
      .order('current_period_end')
      .limit(5),
  ])

  const mrr = (activeMonthlySubs || []).reduce((s: number, x: { amount_paid: number }) => s + Number(x.amount_paid), 0)
  const yearlyMonthly = (activeYearlySubs || []).reduce((s: number, x: { amount_paid: number }) => s + Number(x.amount_paid), 0) / 12
  const totalMrr = mrr + yearlyMonthly
  const arr = totalMrr * 12

  const stats = [
    { label: 'إجمالي الصالونات', value: totalTenants || 0, icon: Building2, color: '#3b82f6', bg: '#eff6ff', href: '/admin/salons' },
    { label: 'الصالونات النشطة', value: activeTenants || 0, icon: Activity, color: '#16a34a', bg: '#dcfce7', href: '/admin/salons' },
    { label: 'فترة تجريبية', value: trialTenants || 0, icon: AlertCircle, color: '#d97706', bg: '#fef3c7', href: '/admin/salons' },
    { label: 'موقوفة', value: suspendedTenants || 0, icon: Clock, color: '#dc2626', bg: '#fee2e2', href: '/admin/salons' },
    { label: 'جديدة هذا الشهر', value: newThisMonth || 0, icon: Calendar, color: '#7c3aed', bg: '#f5f3ff', href: '/admin/salons' },
    { label: 'MRR الإيراد الشهري', value: formatCurrency(totalMrr), icon: DollarSign, color: '#C2847A', bg: '#fdf2f0', href: '/admin/billing' },
    { label: 'ARR الإيراد السنوي', value: formatCurrency(arr), icon: TrendingUp, color: '#059669', bg: '#ecfdf5', href: '/admin/billing' },
    { label: 'اشتراكات نشطة', value: (activeMonthlySubs?.length || 0) + (activeYearlySubs?.length || 0), icon: CreditCard, color: '#0ea5e9', bg: '#f0f9ff', href: '/admin/subscriptions' },
  ]

  return (
    <div dir="rtl" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>لوحة التحكم الرئيسية</h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>مرحباً، هذه نظرة عامة على أداء المنصة</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>
      <style>{`@media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:600px){.kpi-grid{grid-template-columns:1fr!important}}`}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Recent Salons */}
        <SectionCard title="أحدث الصالونات" href="/admin/salons">
          {!recentTenants?.length ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>لا توجد صالونات بعد</div>
          ) : (recentTenants || []).map((t: {
            id: string; slug: string; status: string; created_at: string
            tenant_profiles: { name_ar?: string } | Array<{ name_ar?: string }> | null
          }) => {
            const p = Array.isArray(t.tenant_profiles) ? t.tenant_profiles[0] : t.tenant_profiles
            const sc = statusColor[t.status] || statusColor.cancelled
            return (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 20px', borderBottom: '1px solid #f9f9f9',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{p?.name_ar || t.slug}</p>
                  <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }} dir="ltr">{t.slug}</p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  backgroundColor: sc.bg, color: sc.color,
                }}>
                  {statusLabel[t.status] || t.status}
                </span>
              </div>
            )
          })}
        </SectionCard>

        {/* Recent Payments */}
        <SectionCard title="المدفوعات الأخيرة" href="/admin/billing">
          {!recentPayments?.length ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>لا توجد مدفوعات بعد</div>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) : (recentPayments || []).map((p: any, i: number) => {
            const sc = p.status === 'paid' ? { bg: '#dcfce7', color: '#16a34a' } : { bg: '#fef9c3', color: '#a16207' }
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 20px', borderBottom: '1px solid #f9f9f9',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{formatCurrency(p.amount)}</p>
                  <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>
                    {new Date(p.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  backgroundColor: sc.bg, color: sc.color,
                }}>
                  {p.status === 'paid' ? 'مدفوع' : 'معلق'}
                </span>
              </div>
            )
          })}
        </SectionCard>
      </div>

      {/* Expiring Soon */}
      {(expiringSoon?.length || 0) > 0 && (
        <SectionCard title="اشتراكات تنتهي قريباً (خلال 7 أيام)" href="/admin/subscriptions">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 0 }}>
            {(expiringSoon || []).map((s: {
              id: string; current_period_end: string
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tenant: any
            }) => {
              const tp = Array.isArray(s.tenant?.tenant_profiles) ? s.tenant?.tenant_profiles[0] : s.tenant?.tenant_profiles
              const daysLeft = Math.ceil((new Date(s.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 20px', borderBottom: '1px solid #f9f9f9',
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{tp?.name_ar || s.tenant?.slug}</p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>
                      ينتهي: {new Date(s.current_period_end).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    backgroundColor: daysLeft <= 2 ? '#fee2e2' : '#fef9c3',
                    color: daysLeft <= 2 ? '#dc2626' : '#a16207',
                  }}>
                    {daysLeft} يوم
                  </span>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
