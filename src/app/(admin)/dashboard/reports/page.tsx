import { getAuthContext } from '@/lib/server/getAuthContext'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, Banknote, Star } from 'lucide-react'
import { format, startOfMonth, subMonths, endOfMonth } from 'date-fns'
import { ar } from 'date-fns/locale'

export default async function ReportsPage() {
  const { tenantId, admin } = await getAuthContext()
  const now = new Date()

  const months = [0, 1, 2].map(i => {
    const d = subMonths(now, i)
    return {
      label: format(d, 'MMMM yyyy', { locale: ar }),
      start: format(startOfMonth(d), 'yyyy-MM-dd'),
      end: format(endOfMonth(d), 'yyyy-MM-dd'),
    }
  })

  const monthlyData = await Promise.all(
    months.map(async m => {
      const [{ data: appts }, { data: payments }] = await Promise.all([
        admin.from('appointments').select('id, final_price, status')
          .eq('tenant_id', tenantId).gte('scheduled_date', m.start).lte('scheduled_date', m.end),
        admin.from('payments').select('amount')
          .eq('tenant_id', tenantId).eq('status', 'paid')
          .gte('created_at', `${m.start}T00:00:00`).lte('created_at', `${m.end}T23:59:59`),
      ])
      const revenue = (payments || []).reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0)
      const completed = (appts || []).filter((a: { status: string }) => a.status === 'completed').length
      const cancelled = (appts || []).filter((a: { status: string }) => a.status === 'cancelled').length
      return { ...m, total: appts?.length || 0, completed, cancelled, revenue }
    })
  )

  const { data: topServicesRaw } = await admin
    .from('appointment_services')
    .select('service_name_ar, service_id')
    .eq('tenant_id', tenantId)
    .limit(200)

  const serviceCounts: Record<string, { name: string; count: number }> = {}
  for (const s of (topServicesRaw || [])) {
    const key = s.service_id as string
    if (!serviceCounts[key]) serviceCounts[key] = { name: s.service_name_ar as string, count: 0 }
    serviceCounts[key].count++
  }
  const topServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count).slice(0, 5)

  const { data: pmSplit } = await admin
    .from('payments').select('payment_method, amount')
    .eq('tenant_id', tenantId).eq('status', 'paid')

  const pmTotals: Record<string, number> = {}
  for (const p of (pmSplit || [])) {
    const m = p.payment_method as string
    pmTotals[m] = (pmTotals[m] || 0) + Number(p.amount)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>التقارير</h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0 0' }}>ملخص الأداء والإيرادات</p>
      </div>

      {/* Monthly Summary */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>ملخص الأشهر الأخيرة</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {monthlyData.map((m, i) => (
            <div key={i} style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{m.label}</h3>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#C2847A' }}>{formatCurrency(m.revenue)}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#f9f9f9', borderRadius: 10 }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{m.total}</p>
                  <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0 0' }}>إجمالي الحجوزات</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#f0fdf4', borderRadius: 10 }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#16a34a', margin: 0 }}>{m.completed}</p>
                  <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0 0' }}>مكتملة</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: '#fef2f2', borderRadius: 10 }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#dc2626', margin: 0 }}>{m.cancelled}</p>
                  <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0 0' }}>ملغاة</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {/* Top Services */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={18} style={{ color: '#f59e0b' }} />
            أكثر الخدمات طلباً
          </h3>
          {topServices.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>لا توجد بيانات بعد</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topServices.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    backgroundColor: 'rgba(194,132,122,0.1)', color: '#C2847A',
                    fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </p>
                    <div style={{ marginTop: 4, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', backgroundColor: '#C2847A', borderRadius: 3, width: `${(s.count / topServices[0].count) * 100}%` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', flexShrink: 0 }}>{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={18} style={{ color: '#3b82f6' }} />
            طرق الدفع
          </h3>
          {Object.entries(pmTotals).length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>لا توجد بيانات بعد</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(pmTotals).map(([method, amount]) => (
                <div key={method} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', backgroundColor: '#f9f9f9', borderRadius: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {method === 'online'
                      ? <CreditCard size={16} style={{ color: '#2563eb' }} />
                      : <Banknote size={16} style={{ color: '#059669' }} />}
                    <span style={{ fontSize: 13, color: '#1a1a1a' }}>
                      {method === 'online' ? 'بطاقة / مدى' : method === 'cash' ? 'نقداً' : 'عربون'}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
