import { getAuthContext } from '@/lib/server/getAuthContext'
import { formatCurrency } from '@/lib/utils'
import { Calendar, Users, TrendingUp, CheckCircle, AlertCircle, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

export default async function DashboardPage() {
  const { tenantId, admin } = await getAuthContext()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [
    { data: todayAppts },
    { data: pendingAppts },
    { data: completedAppts },
    { data: employees },
  ] = await Promise.all([
    admin.from('appointments')
      .select('id, status, final_price, booking_number, scheduled_start, customer:customers(name), services:appointment_services(service_name_ar)')
      .eq('tenant_id', tenantId).eq('scheduled_date', today)
      .not('status', 'in', '("cancelled","rejected")').order('scheduled_start'),
    admin.from('appointments').select('id').eq('tenant_id', tenantId).eq('status', 'pending'),
    admin.from('appointments').select('final_price, payment_method')
      .eq('tenant_id', tenantId).eq('scheduled_date', today).eq('status', 'completed'),
    admin.from('employees').select('id').eq('tenant_id', tenantId).eq('is_active', true),
  ])

  const todayRevenue = (completedAppts || []).reduce((sum: number, a: { final_price: number }) => sum + Number(a.final_price), 0)
  const cashRevenue = (completedAppts || []).filter((a: { payment_method: string }) => a.payment_method === 'cash').reduce((sum: number, a: { final_price: number }) => sum + Number(a.final_price), 0)

  const stats = [
    { label: 'مواعيد اليوم', value: todayAppts?.length || 0, icon: Calendar, color: '#2563eb', bg: '#eff6ff' },
    { label: 'بانتظار التأكيد', value: pendingAppts?.length || 0, icon: AlertCircle, color: '#d97706', bg: '#fffbeb' },
    { label: 'مكتملة اليوم', value: completedAppts?.length || 0, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'إيراد اليوم', value: formatCurrency(todayRevenue), icon: TrendingUp, color: '#C2847A', bg: '#fdf4f3' },
    { label: 'الموظفات النشطات', value: employees?.length || 0, icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'نقداً', value: formatCurrency(cashRevenue), icon: CreditCard, color: '#059669', bg: '#ecfdf5' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 20, height: 1, background: '#C2847A' }} />
          <span style={{ color: '#C2847A', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>DASHBOARD</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>لوحة التحكم</h1>
        <p style={{ fontSize: 12, color: '#a89080', marginTop: 4, margin: 0, fontWeight: 600 }}>
          {format(new Date(), 'PPP', { locale: ar })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#fff', padding: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderLeft: i % 3 !== 2 ? '1px solid rgba(26,15,10,0.06)' : 'none',
              borderBottom: i < 3 ? '1px solid rgba(26,15,10,0.06)' : 'none',
            }}
          >
            <div>
              <p style={{ fontSize: 11, color: '#a89080', margin: 0, fontWeight: 700, letterSpacing: '0.03em' }}>{stat.label}</p>
              <p style={{ fontSize: 24, fontWeight: 900, color: '#1a0f0a', margin: '6px 0 0 0', letterSpacing: '-0.02em' }}>
                {stat.value}
              </p>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 999, flexShrink: 0,
              backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(26,15,10,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1a0f0a', margin: 0, letterSpacing: '-0.01em' }}>مواعيد اليوم</h2>
          <Link href="/dashboard/appointments" style={{ fontSize: 13, color: '#C2847A', textDecoration: 'none' }}>
            عرض الكل
          </Link>
        </div>
        {!todayAppts?.length ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Calendar size={32} style={{ margin: '0 auto 8px', color: '#C2847A', opacity: 0.3 }} />
            <p style={{ margin: 0, color: '#a89080', fontSize: 13, fontWeight: 600 }}>لا توجد مواعيد اليوم</p>
          </div>
        ) : (
          <div>
            {todayAppts.map((appt: {
              id: string
              booking_number: string
              scheduled_start: string
              status: string
              final_price: number
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              customer: any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              services: Array<any>
            }) => (
              <Link
                key={appt.id}
                href={`/dashboard/appointments/${appt.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px', textDecoration: 'none',
                  borderBottom: '1px solid rgba(26,15,10,0.05)',
                }}
              >
                <div style={{ minWidth: 48, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#C2847A', margin: 0 }}>
                    {appt.scheduled_start.slice(0, 5)}
                  </p>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
                    {appt.customer?.name || 'عميل'}
                  </p>
                  <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appt.services?.map((s: { service_name_ar: string }) => s.service_name_ar).join(' • ')}
                  </p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <StatusBadge status={appt.status} />
                  <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0 0', textAlign: 'right' }}>
                    {formatCurrency(appt.final_price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'انتظار', bg: '#fffbeb', color: '#d97706' },
  confirmed: { label: 'مؤكد', bg: '#eff6ff', color: '#2563eb' },
  assigned: { label: 'تعيين', bg: '#f5f3ff', color: '#7c3aed' },
  in_progress: { label: 'جارٍ', bg: '#fff7ed', color: '#ea580c' },
  completed: { label: 'مكتمل', bg: '#f0fdf4', color: '#16a34a' },
  cancelled: { label: 'ملغي', bg: '#fef2f2', color: '#dc2626' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f5f5f5', color: '#666' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      backgroundColor: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  )
}
