import { getAuthContext } from '@/lib/server/getAuthContext'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { CancelAppointmentButton } from '@/components/dashboard/CancelAppointmentButton'
import { CalendarClient } from './CalendarClient'

const STATUS_FILTERS = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'انتظار' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'in_progress', label: 'جارٍ' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
]

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'انتظار', bg: '#fffbeb', color: '#d97706' },
  confirmed: { label: 'مؤكد', bg: '#eff6ff', color: '#2563eb' },
  assigned: { label: 'تعيين', bg: '#f5f3ff', color: '#7c3aed' },
  in_progress: { label: 'جارٍ', bg: '#fff7ed', color: '#ea580c' },
  completed: { label: 'مكتمل', bg: '#f0fdf4', color: '#16a34a' },
  cancelled: { label: 'ملغي', bg: '#fef2f2', color: '#dc2626' },
}

const p = '#C2847A'

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string; view?: string }>
}) {
  const params = await searchParams
  const { tenantId, admin } = await getAuthContext()
  const view = params.view === 'calendar' ? 'calendar' : 'list'

  let query = admin
    .from('appointments')
    .select(`
      id, booking_number, scheduled_date, scheduled_start, scheduled_end, status, final_price, payment_method,
      customer:customers(name, phone),
      employee:employees(id, name_ar),
      address:customer_addresses(district_ar, city_ar),
      services:appointment_services(service_name_ar)
    `)
    .eq('tenant_id', tenantId)
    .order('scheduled_date', { ascending: false })
    .order('scheduled_start', { ascending: true })
    .limit(200)

  if (params.status) query = query.eq('status', params.status)
  if (params.date) query = query.eq('scheduled_date', params.date)

  const { data: appointments } = await query

  const { data: employees } = await admin
    .from('employees')
    .select('id, name_ar')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('name_ar')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 20, height: 1, background: p }} />
            <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>APPOINTMENTS</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>المواعيد</h1>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 2, padding: 3, backgroundColor: 'rgba(26,15,10,0.05)', borderRadius: 999 }}>
          <Link
            href="/dashboard/appointments?view=list"
            style={{
              padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              textDecoration: 'none', fontFamily: 'inherit',
              backgroundColor: view === 'list' ? '#fff' : 'transparent',
              color: view === 'list' ? '#1a0f0a' : '#a89080',
              boxShadow: view === 'list' ? '0 1px 3px rgba(26,15,10,0.1)' : 'none',
            }}
          >
            قائمة
          </Link>
          <Link
            href="/dashboard/appointments?view=calendar"
            style={{
              padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              textDecoration: 'none', fontFamily: 'inherit',
              backgroundColor: view === 'calendar' ? '#fff' : 'transparent',
              color: view === 'calendar' ? '#1a0f0a' : '#a89080',
              boxShadow: view === 'calendar' ? '0 1px 3px rgba(26,15,10,0.1)' : 'none',
            }}
          >
            تقويم
          </Link>
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarClient
          appointments={(appointments || []) as Parameters<typeof CalendarClient>[0]['appointments']}
          employees={(employees || []) as Parameters<typeof CalendarClient>[0]['employees']}
        />
      ) : (
        <>
          {/* Status filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => {
              const isActive = (params.status || '') === f.value
              return (
                <Link
                  key={f.value}
                  href={f.value ? `/dashboard/appointments?status=${f.value}` : '/dashboard/appointments'}
                  style={{
                    padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                    textDecoration: 'none', transition: 'all 0.15s',
                    backgroundColor: isActive ? p : '#fff',
                    color: isActive ? '#fff' : '#666',
                    border: `1px solid ${isActive ? p : '#e5e5e5'}`,
                  }}
                >
                  {f.label}
                </Link>
              )
            })}
          </div>

          {/* Appointments List */}
          <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid rgba(26,15,10,0.08)', overflow: 'hidden' }}>
            {!appointments?.length ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: '#aaa' }}>
                <Calendar size={40} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
                <p style={{ margin: 0 }}>لا توجد مواعيد</p>
              </div>
            ) : (
              <div>
                {(appointments as Array<{
                  id: string
                  booking_number: string
                  scheduled_date: string
                  scheduled_start: string
                  status: string
                  final_price: number
                  payment_method: string
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  customer: any
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  employee: any
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  address: any
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  services: Array<any>
                }>).map(appt => {
                  const cfg = STATUS_CONFIG[appt.status] || { label: appt.status, bg: '#f5f5f5', color: '#666' }
                  return (
                    <Link
                      key={appt.id}
                      href={`/dashboard/appointments/${appt.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '14px 20px', textDecoration: 'none',
                        borderBottom: '1px solid rgba(26,15,10,0.04)',
                      }}
                    >
                      <div style={{ minWidth: 72 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: 0 }}>
                          {appt.scheduled_date.slice(5).replace('-', '/')}
                        </p>
                        <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0 0' }}>
                          {appt.scheduled_start.slice(0, 5)}
                        </p>
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
                          {appt.customer?.name}
                        </p>
                        <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {appt.services?.map((s: { service_name_ar: string }) => s.service_name_ar).join(' • ')}
                        </p>
                        <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0 0' }}>
                          {appt.address?.district_ar ? `📍 ${appt.address.district_ar}` : ''}
                          {appt.employee?.name_ar ? ` • ${appt.employee.name_ar}` : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                          fontSize: 11, fontWeight: 600,
                          backgroundColor: cfg.bg, color: cfg.color,
                        }}>
                          {cfg.label}
                        </span>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                          {formatCurrency(appt.final_price)}
                        </p>
                        {['pending', 'confirmed', 'assigned'].includes(appt.status) && (
                          <CancelAppointmentButton appointmentId={appt.id} />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
