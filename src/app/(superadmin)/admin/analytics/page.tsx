import { createClient as createAdminClient } from '@supabase/supabase-js'
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function AnalyticsPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const monthlyData = await Promise.all(
    months.map(async (m, idx) => {
      const start = m.toISOString()
      const end = idx < 5
        ? months[idx + 1].toISOString()
        : new Date(m.getFullYear(), m.getMonth() + 1, 1).toISOString()

      const [{ count: newSalons }, { data: payments }] = await Promise.all([
        admin.from('tenants').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lt('created_at', end),
        admin.from('platform_payments').select('amount')
          .eq('status', 'paid').gte('created_at', start).lt('created_at', end),
      ])

      const revenue = (payments || []).reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0)
      return {
        label: m.toLocaleDateString('ar-SA', { month: 'short', year: '2-digit' }),
        newSalons: newSalons || 0,
        revenue,
      }
    })
  )

  const [
    { count: activeSubs },
    { count: trialSubs },
    { count: cancelledSubs },
  ] = await Promise.all([
    admin.from('tenant_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('tenant_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trial'),
    admin.from('tenant_subscriptions').select('id', { count: 'exact', head: true }).in('status', ['cancelled', 'expired']),
  ])

  const totalSubs = (activeSubs || 0) + (trialSubs || 0) + (cancelledSubs || 0) || 1
  const conversionRate = totalSubs > 0 ? Math.round(((activeSubs || 0) / totalSubs) * 100) : 0
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1)
  const maxSalons = Math.max(...monthlyData.map(m => m.newSalons), 1)

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={20} style={{ color: '#C2847A' }} /> التقارير والتحليلات
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إحصائيات الأداء والنمو على مستوى المنصة</p>
      </div>

      {/* Conversion metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'الاشتراكات النشطة', value: activeSubs || 0, icon: TrendingUp, color: '#16a34a', bg: '#dcfce7' },
          { label: 'في الفترة التجريبية', value: trialSubs || 0, icon: Users, color: '#d97706', bg: '#fef3c7' },
          { label: 'الملغية / المنتهية', value: cancelledSubs || 0, icon: Calendar, color: '#dc2626', bg: '#fee2e2' },
          { label: 'معدل التحويل (Trial→Paid)', value: `${conversionRate}%`, icon: BarChart3, color: '#7c3aed', bg: '#f5f3ff' },
        ].map((s, i) => (
          <div key={i} style={{
            backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
            padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={17} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 0', color: '#1a1a1a' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>الإيرادات الشهرية (آخر 6 أشهر)</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-end', gap: 10, height: 180 }}>
            {monthlyData.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#888', textAlign: 'center', lineHeight: 1.2 }}>
                  {formatCurrency(m.revenue)}
                </span>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  backgroundColor: '#C2847A',
                  height: `${Math.max((m.revenue / maxRevenue) * 100, 4)}px`,
                  opacity: 0.8 + (i / months.length) * 0.2,
                  minHeight: 4,
                }} />
                <span style={{ fontSize: 10, color: '#aaa', textAlign: 'center' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>صالونات جديدة (آخر 6 أشهر)</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-end', gap: 10, height: 180 }}>
            {monthlyData.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#888' }}>{m.newSalons}</span>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  backgroundColor: '#3b82f6',
                  height: `${Math.max((m.newSalons / maxSalons) * 100, 4)}px`,
                  opacity: 0.6 + (i / months.length) * 0.4,
                  minHeight: 4,
                }} />
                <span style={{ fontSize: 10, color: '#aaa', textAlign: 'center' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
