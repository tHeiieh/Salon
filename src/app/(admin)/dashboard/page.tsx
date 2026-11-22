import { getAuthContext } from '@/lib/server/getAuthContext'
import { formatCurrency } from '@/lib/utils'
import { Calendar, Users, TrendingUp, CheckCircle, AlertCircle, CreditCard, Star } from 'lucide-react'
import { format, subDays, startOfMonth } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { GoalGauge } from '@/components/dashboard/GoalGauge'

export default async function DashboardPage() {
  const { tenantId, admin } = await getAuthContext()
  const today = format(new Date(), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const thirtyDaysAgo = format(subDays(new Date(), 29), 'yyyy-MM-dd')

  const [
    { data: todayAppts },
    { data: pendingAppts },
    { data: completedAppts },
    { data: employees },
    { data: monthAppts },
    { data: last30Appts },
    { data: topServices },
    { data: topEmployees },
  ] = await Promise.all([
    admin.from('appointments')
      .select('id, status, final_price, booking_number, scheduled_start, customer:customers(name), services:appointment_services(service_name_ar)')
      .eq('tenant_id', tenantId).eq('scheduled_date', today)
      .not('status', 'in', '("cancelled","rejected")').order('scheduled_start'),
    admin.from('appointments').select('id').eq('tenant_id', tenantId).eq('status', 'pending'),
    admin.from('appointments').select('final_price, payment_method')
      .eq('tenant_id', tenantId).eq('scheduled_date', today).eq('status', 'completed'),
    admin.from('employees').select('id').eq('tenant_id', tenantId).eq('is_active', true),
    admin.from('appointments').select('final_price')
      .eq('tenant_id', tenantId).eq('status', 'completed')
      .gte('scheduled_date', monthStart),
    admin.from('appointments').select('scheduled_date, final_price')
      .eq('tenant_id', tenantId).eq('status', 'completed')
      .gte('scheduled_date', thirtyDaysAgo)
      .order('scheduled_date'),
    admin.from('appointment_services')
      .select('service_name_ar, appointment:appointments!inner(tenant_id, status)')
      .eq('appointment.tenant_id', tenantId)
      .eq('appointment.status', 'completed')
      .limit(500),
    admin.from('appointments')
      .select('final_price, employee:employees(name_ar)')
      .eq('tenant_id', tenantId).eq('status', 'completed')
      .gte('scheduled_date', monthStart)
      .not('employee_id', 'is', null)
      .limit(500),
  ])

  const todayRevenue = (completedAppts || []).reduce((sum: number, a: { final_price: number }) => sum + Number(a.final_price), 0)
  const cashRevenue = (completedAppts || []).filter((a: { payment_method: string }) => a.payment_method === 'cash').reduce((sum: number, a: { final_price: number }) => sum + Number(a.final_price), 0)
  const monthRevenue = (monthAppts || []).reduce((sum: number, a: { final_price: number }) => sum + Number(a.final_price), 0)
  const monthGoal = 50000

  // Build chart data: last 30 days
  const revenueByDay: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
    revenueByDay[d] = 0
  }
  for (const a of (last30Appts || [])) {
    const d = a.scheduled_date as string
    if (d in revenueByDay) revenueByDay[d] += Number(a.final_price)
  }
  const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
    date,
    label: format(new Date(date), 'd MMM', { locale: ar }),
    revenue,
  }))

  // Top services
  const svcCount: Record<string, number> = {}
  for (const s of (topServices || [])) {
    const name = s.service_name_ar as string
    svcCount[name] = (svcCount[name] || 0) + 1
  }
  const topSvcList = Object.entries(svcCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const totalSvc = topSvcList.reduce((sum, [, c]) => sum + c, 0)

  // Top employees
  const empRevenue: Record<string, number> = {}
  const empCount: Record<string, number> = {}
  for (const a of (topEmployees || [])) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const name = (a.employee as any)?.name_ar || 'غير محدد'
    empRevenue[name] = (empRevenue[name] || 0) + Number(a.final_price)
    empCount[name] = (empCount[name] || 0) + 1
  }
  const topEmpList = Object.entries(empRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const stats = [
    { label: 'مواعيد اليوم', value: todayAppts?.length || 0, icon: Calendar, color: '#2563eb', bg: '#eff6ff' },
    { label: 'بانتظار التأكيد', value: pendingAppts?.length || 0, icon: AlertCircle, color: '#d97706', bg: '#fffbeb' },
    { label: 'مكتملة اليوم', value: completedAppts?.length || 0, icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'إيراد اليوم', value: formatCurrency(todayRevenue), icon: TrendingUp, color: '#C2847A', bg: '#fdf4f3' },
    { label: 'الموظفات النشطات', value: employees?.length || 0, icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'نقداً', value: formatCurrency(cashRevenue), icon: CreditCard, color: '#059669', bg: '#ecfdf5' },
  ]

  const p = '#C2847A'
  const DONUT_COLORS = ['#C2847A', '#D4A96A', '#a87060', '#e8b88a', '#8c6050']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 20, height: 1, background: p }} />
          <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>DASHBOARD</span>
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
              <p style={{ fontSize: 22, fontWeight: 900, color: '#1a0f0a', margin: '6px 0 0 0', letterSpacing: '-0.02em' }}>
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

      {/* Revenue Chart + Goal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16, alignItems: 'stretch' }}>
        {/* Chart */}
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 16, height: 1, background: p }} />
                <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em' }}>REVENUE</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a0f0a' }}>الإيرادات — آخر 30 يوم</p>
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#1a0f0a', letterSpacing: '-0.02em' }}>
              {formatCurrency(monthRevenue)}
            </span>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Goal Gauge */}
        <div style={{
          backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4,
          padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 16, height: 1, background: p }} />
            <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em' }}>GOAL</span>
          </div>
          <GoalGauge current={monthRevenue} goal={monthGoal} />
        </div>
      </div>

      {/* Top Services + Top Employees */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Services */}
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(26,15,10,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 16, height: 1, background: p }} />
              <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em' }}>TOP SERVICES</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a0f0a' }}>أكثر الخدمات طلباً</p>
          </div>
          {topSvcList.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#a89080', fontSize: 13 }}>لا توجد بيانات</div>
          ) : (
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topSvcList.map(([name, count], i) => {
                const pctWidth = totalSvc > 0 ? Math.round((count / totalSvc) * 100) : 0
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1a0f0a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <span style={{ fontSize: 11, color: '#a89080', fontWeight: 700, marginRight: 8 }}>{count} · {pctWidth}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(26,15,10,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pctWidth}%`, height: '100%', background: DONUT_COLORS[i % DONUT_COLORS.length], borderRadius: 2, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Employees */}
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(26,15,10,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 16, height: 1, background: p }} />
              <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em' }}>TOP PROVIDERS</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a0f0a' }}>أفضل الموظفات هذا الشهر</p>
          </div>
          {topEmpList.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#a89080', fontSize: 13 }}>لا توجد بيانات</div>
          ) : (
            <div>
              {topEmpList.map(([name, revenue], i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  borderBottom: i < topEmpList.length - 1 ? '1px solid rgba(26,15,10,0.05)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                    background: `linear-gradient(135deg, ${DONUT_COLORS[i % DONUT_COLORS.length]} 0%, #D4A96A 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 800,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a0f0a' }}>{name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#a89080', fontWeight: 600 }}>
                      {empCount[name]} حجز
                    </p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#C2847A' }}>
                    {formatCurrency(revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today's Appointments */}
      <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(26,15,10,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 16, height: 1, background: p }} />
              <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em' }}>TODAY</span>
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1a0f0a', margin: 0, letterSpacing: '-0.01em' }}>مواعيد اليوم</h2>
          </div>
          <Link href="/dashboard/appointments" style={{ fontSize: 13, color: '#C2847A', textDecoration: 'none', fontWeight: 600 }}>
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
                    {appt.services?.map((s: { service_name_ar: string }) => s.service_name_ar).join(' · ')}
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

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { href: '/dashboard/appointments', label: 'المواعيد', icon: Calendar, color: '#2563eb', bg: '#eff6ff' },
          { href: '/dashboard/cashier', label: 'الكاشير', icon: CreditCard, color: '#16a34a', bg: '#f0fdf4' },
          { href: '/dashboard/expenses', label: 'المصروفات', icon: TrendingUp, color: '#d97706', bg: '#fffbeb' },
          { href: '/dashboard/stock', label: 'المخزون', icon: Star, color: '#7c3aed', bg: '#f5f3ff' },
        ].map(({ href, label, icon: Icon, color, bg }) => (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '16px 12px', backgroundColor: '#fff',
            border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, textDecoration: 'none',
            transition: 'border-color 0.15s',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1a0f0a' }}>{label}</span>
          </Link>
        ))}
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
