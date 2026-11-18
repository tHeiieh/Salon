import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { EmployeeAppointmentCard } from '@/components/portal/EmployeeAppointmentCard'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:         { label: 'انتظار',   bg: '#fffbeb', color: '#d97706' },
  confirmed:       { label: 'مؤكد',     bg: '#eff6ff', color: '#2563eb' },
  assigned:        { label: 'معيّن',    bg: '#f5f3ff', color: '#7c3aed' },
  in_progress:     { label: 'جارٍ',     bg: '#fff7ed', color: '#ea580c' },
  completed:       { label: 'مكتمل',   bg: '#f0fdf4', color: '#16a34a' },
  cancelled:       { label: 'ملغي',    bg: '#fef2f2', color: '#dc2626' },
  payment_pending: { label: 'بانتظار الدفع', bg: '#fefce8', color: '#ca8a04' },
}

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Get user's profile + linked employee record
  const { data: profile } = await admin
    .from('user_profiles')
    .select('tenant_id, name_ar')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null

  const { data: employee } = await admin
    .from('employees')
    .select('id, name_ar')
    .eq('user_id', user.id)
    .eq('tenant_id', profile.tenant_id)
    .single()

  // Fetch upcoming + recent appointments for this employee
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data: appointments } = employee ? await admin
    .from('appointments')
    .select(`
      id, booking_number, status, scheduled_date, scheduled_start, scheduled_end,
      payment_method, final_price,
      customers(name, phone),
      appointment_services(service_name_ar, price)
    `)
    .eq('tenant_id', profile.tenant_id)
    .eq('employee_id', employee.id)
    .gte('scheduled_date', thirtyDaysAgo)
    .not('status', 'in', '("cancelled","payment_pending")')
    .order('scheduled_date', { ascending: true })
    .order('scheduled_start', { ascending: true })
  : { data: [] }

  const upcoming = (appointments || []).filter(a => a.scheduled_date >= today)
  const past     = (appointments || []).filter(a => a.scheduled_date < today)

  const todayAppts = upcoming.filter(a => a.scheduled_date === today)
  const futureAppts = upcoming.filter(a => a.scheduled_date > today)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #C2847A 0%, #b06470 50%, #d4a96a 100%)',
        borderRadius: 20, padding: 24, color: 'white',
      }}>
        <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 4px' }}>أهلاً بك،</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 16px' }}>{employee?.name_ar || profile.name_ar || 'موظفة'}</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{todayAppts.length}</p>
            <p style={{ fontSize: 11, opacity: 0.8, margin: 0 }}>موعد اليوم</p>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{futureAppts.length}</p>
            <p style={{ fontSize: 11, opacity: 0.8, margin: 0 }}>مواعيد قادمة</p>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{past.length}</p>
            <p style={{ fontSize: 11, opacity: 0.8, margin: 0 }}>مكتملة (30 يوم)</p>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      {todayAppts.length > 0 && (
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>مواعيد اليوم</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {todayAppts.map(appt => (
              <EmployeeAppointmentCard
                key={appt.id}
                appointment={appt as AppointmentRow}
                statusConfig={STATUS_CONFIG}
                highlight
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {futureAppts.length > 0 && (
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>المواعيد القادمة</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {futureAppts.map(appt => (
              <EmployeeAppointmentCard
                key={appt.id}
                appointment={appt as AppointmentRow}
                statusConfig={STATUS_CONFIG}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>المواعيد السابقة (30 يوم)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {past.map(appt => (
              <EmployeeAppointmentCard
                key={appt.id}
                appointment={appt as AppointmentRow}
                statusConfig={STATUS_CONFIG}
              />
            ))}
          </div>
        </section>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }}>
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p style={{ fontSize: 14, margin: 0 }}>لا توجد مواعيد حالياً</p>
        </div>
      )}
    </div>
  )
}

export type AppointmentRow = {
  id: string
  booking_number: string
  status: string
  scheduled_date: string
  scheduled_start: string
  scheduled_end: string
  payment_method: string
  final_price: number
  customers: { name: string; phone: string }[] | { name: string; phone: string } | null
  appointment_services: { service_name_ar: string; price: number }[]
}
