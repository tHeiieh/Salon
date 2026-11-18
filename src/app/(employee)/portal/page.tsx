import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Calendar, MapPin, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { AppointmentStatusUpdater } from '@/components/portal/AppointmentStatusUpdater'

export default async function EmployeePortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: profile } = await admin
    .from('user_profiles')
    .select('*, employees!inner(*)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  const employee = Array.isArray(profile.employees) ? profile.employees[0] : profile.employees
  if (!employee) redirect('/auth/login')

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAr = format(new Date(), 'PPP', { locale: ar })

  const { data: appointments } = await admin
    .from('appointments')
    .select(`
      *,
      customer:customers(name, phone),
      address:customer_addresses(*),
      services:appointment_services(service_name_ar, duration_minutes)
    `)
    .eq('employee_id', employee.id)
    .gte('scheduled_date', today)
    .not('status', 'in', '("cancelled","rejected","completed")')
    .order('scheduled_date')
    .order('scheduled_start')
    .limit(20)

  const todayCount = appointments?.filter((a: { scheduled_date: string }) => a.scheduled_date === today).length || 0
  const totalCount = appointments?.length || 0

  const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
    pending:    { label: 'قيد الانتظار',    bg: '#fef9c3', color: '#a16207' },
    confirmed:  { label: 'مؤكد',           bg: '#dbeafe', color: '#1d4ed8' },
    on_the_way: { label: 'في الطريق',       bg: '#fce7f3', color: '#be185d' },
    in_progress:{ label: 'جارٍ',            bg: '#d1fae5', color: '#065f46' },
    done:       { label: 'منتهي',           bg: '#f0fdf4', color: '#16a34a' },
    completed:  { label: 'مكتمل',          bg: '#f0fdf4', color: '#16a34a' },
    cancelled:  { label: 'ملغي',            bg: '#fee2e2', color: '#dc2626' },
    rejected:   { label: 'مرفوض',          bg: '#fee2e2', color: '#dc2626' },
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#faf8f5', paddingBottom: 32 }} dir="rtl">
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{
          backgroundImage: 'linear-gradient(135deg, #C2847A 0%, #D4A96A 100%)',
          borderRadius: '0 0 24px 24px',
          padding: '28px 20px 24px',
          marginBottom: 20,
          marginLeft: -16,
          marginRight: -16,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: '0 0 4px' }}>مرحباً</p>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>{employee.name_ar}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0 }}>{todayAr}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 16, padding: '16px 12px',
            border: '1px solid #f0f0f0', textAlign: 'center',
          }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#C2847A', margin: 0 }}>{todayCount}</p>
            <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>مواعيد اليوم</p>
          </div>
          <div style={{
            backgroundColor: '#fff', borderRadius: 16, padding: '16px 12px',
            border: '1px solid #f0f0f0', textAlign: 'center',
          }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#D4A96A', margin: 0 }}>{totalCount}</p>
            <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>المواعيد القادمة</p>
          </div>
        </div>

        {/* Appointments */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>المواعيد القادمة</h2>

        {!appointments?.length ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <Calendar size={48} style={{ marginBottom: 12, opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: 14 }}>لا توجد مواعيد قادمة</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(appointments as Array<{
              id: string
              booking_number: string
              scheduled_date: string
              scheduled_start: string
              scheduled_end: string
              status: string
              final_price: number
              customer: { name: string; phone: string } | null
              address: { district_ar: string; city_ar: string; street?: string; instructions?: string } | null
              services: Array<{ service_name_ar: string; duration_minutes: number }>
            }>).map(appt => {
              const sc = STATUS_CONFIG[appt.status] || { label: appt.status, bg: '#f5f5f5', color: '#666' }
              const isToday = appt.scheduled_date === today
              return (
                <div key={appt.id} style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  border: `1px solid ${isToday ? 'rgba(194,132,122,0.3)' : '#f0f0f0'}`,
                  padding: 16,
                  boxShadow: isToday ? '0 2px 12px rgba(194,132,122,0.1)' : 'none',
                }}>
                  {/* Row 1: name + status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', margin: 0 }}>{appt.customer?.name}</p>
                      <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>{appt.booking_number}</p>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      backgroundColor: sc.bg, color: sc.color,
                    }}>
                      {sc.label}
                    </span>
                  </div>

                  {/* Row 2: date + address */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' }}>
                      <Calendar size={13} />
                      <span>
                        {isToday ? 'اليوم' : format(new Date(appt.scheduled_date), 'PPP', { locale: ar })}
                        {' — '}
                        {appt.scheduled_start.slice(0, 5)}
                      </span>
                    </div>
                    {appt.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' }}>
                        <MapPin size={13} />
                        <span>{appt.address.district_ar}، {appt.address.city_ar}{appt.address.street ? ` - ${appt.address.street}` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  {appt.services?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                      {appt.services.map((s, i) => (
                        <span key={i} style={{
                          padding: '2px 8px', borderRadius: 20, fontSize: 11,
                          border: '1px solid #e5e5e5', color: '#666', backgroundColor: '#fafafa',
                        }}>
                          {s.service_name_ar}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Instructions */}
                  {appt.address?.instructions && (
                    <div style={{
                      padding: '8px 12px', backgroundColor: '#fffbeb', borderRadius: 10,
                      fontSize: 12, color: '#92400e', marginBottom: 12,
                    }}>
                      📝 {appt.address.instructions}
                    </div>
                  )}

                  {/* Phone */}
                  {appt.customer?.phone && (
                    <a
                      href={`tel:${appt.customer.phone}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        width: '100%', padding: '10px 0',
                        borderRadius: 12, border: '1px solid #bbf7d0',
                        backgroundColor: '#f0fdf4', color: '#16a34a',
                        fontSize: 13, textDecoration: 'none', marginBottom: 12,
                      }}
                    >
                      <Phone size={14} />
                      {appt.customer.phone}
                    </a>
                  )}

                  <AppointmentStatusUpdater
                    appointmentId={appt.id}
                    currentStatus={appt.status}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
