import { getAuthContext } from '@/lib/server/getAuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, Banknote, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { format, startOfMonth } from 'date-fns'

export default async function PaymentsPage() {
  const { tenantId, admin } = await getAuthContext()
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const [{ data: payments }, { data: monthPayments }] = await Promise.all([
    admin
      .from('payments')
      .select(`
        id, amount, payment_method, status, tap_charge_id, created_at,
        appointment:appointments(booking_number, customer:customers(name))
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50),
    admin
      .from('payments')
      .select('amount, payment_method, status')
      .eq('tenant_id', tenantId)
      .gte('created_at', `${monthStart}T00:00:00`)
      .eq('status', 'paid'),
  ])

  const monthRevenue = (monthPayments || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0)
  const onlineRevenue = (monthPayments || []).filter((p: { payment_method: string }) => p.payment_method === 'online').reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0)
  const cashRevenue = (monthPayments || []).filter((p: { payment_method: string }) => p.payment_method === 'cash').reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0)

  const stats = [
    { label: 'إيراد الشهر', value: formatCurrency(monthRevenue), icon: TrendingUp, color: '#C2847A', bg: '#fdf4f3' },
    { label: 'بطاقة / مدى', value: formatCurrency(onlineRevenue), icon: CreditCard, color: '#2563eb', bg: '#eff6ff' },
    { label: 'نقداً', value: formatCurrency(cashRevenue), icon: Banknote, color: '#059669', bg: '#ecfdf5' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>المدفوعات</h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0 0' }}>إيرادات وسجل المدفوعات</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0',
              padding: 20, display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{stat.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: stat.color, margin: '2px 0 0 0' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payments List */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>سجل المدفوعات</h2>
        </div>
        {!payments?.length ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <CreditCard size={36} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
            <p style={{ margin: 0 }}>لا توجد مدفوعات بعد</p>
          </div>
        ) : (
          <div>
            {payments.map((payment: {
              id: string
              amount: number
              payment_method: string
              status: string
              tap_charge_id: string | null
              created_at: string
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              appointment: any
            }) => {
              const isPaid = payment.status === 'paid'
              const isFailed = payment.status === 'failed'
              const iconColor = isPaid ? '#16a34a' : isFailed ? '#dc2626' : '#d97706'
              const iconBg = isPaid ? '#f0fdf4' : isFailed ? '#fef2f2' : '#fffbeb'
              return (
                <div
                  key={payment.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 20px', borderBottom: '1px solid #f9f9f9',
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isPaid ? <CheckCircle size={20} style={{ color: iconColor }} /> :
                     isFailed ? <XCircle size={20} style={{ color: iconColor }} /> :
                     <Clock size={20} style={{ color: iconColor }} />}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
                      {payment.appointment?.customer?.name || 'عميل'}
                    </p>
                    <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0 0' }}>
                      {payment.appointment?.booking_number} •{' '}
                      {payment.payment_method === 'online' ? 'بطاقة' : payment.payment_method === 'cash' ? 'نقداً' : 'عربون'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                      {formatCurrency(payment.amount)}
                    </p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0 0' }}>
                      {formatDate(payment.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
