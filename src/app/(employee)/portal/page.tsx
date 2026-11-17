import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate, formatTime, APPOINTMENT_STATUS_AR, APPOINTMENT_STATUS_COLORS } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { AppointmentStatusUpdater } from '@/components/portal/AppointmentStatusUpdater'

export default async function EmployeePortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, employees!inner(*)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  const employee = Array.isArray(profile.employees) ? profile.employees[0] : profile.employees
  if (!employee) redirect('/auth/login')

  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: appointments } = await supabase
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

  return (
    <div className="min-h-screen bg-background p-4 space-y-6" dir="rtl">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-l from-primary to-accent rounded-2xl p-5 text-white">
          <p className="text-white/80 text-sm">مرحباً</p>
          <h1 className="text-xl font-bold">{employee.name_ar}</h1>
          <p className="text-white/80 text-sm mt-1">
            {format(new Date(), 'PPP', { locale: ar })}
          </p>
        </div>

        {/* Today's count */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {appointments?.filter((a: { scheduled_date: string }) => a.scheduled_date === today).length || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">مواعيد اليوم</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">
                {appointments?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">المواعيد القادمة</p>
            </CardContent>
          </Card>
        </div>

        {/* Appointments */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">المواعيد القادمة</h2>
          {!appointments?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد مواعيد قادمة</p>
            </div>
          ) : (
            appointments.map((appt: {
              id: string
              booking_number: string
              scheduled_date: string
              scheduled_start: string
              scheduled_end: string
              status: string
              final_price: number
              payment_method: string
              customer: { name: string; phone: string } | null
              address: { district_ar: string; city_ar: string; street?: string; building?: string; instructions?: string } | null
              services: Array<{ service_name_ar: string; duration_minutes: number }>
            }) => (
              <Card key={appt.id} className="border-border/50">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{appt.customer?.name}</p>
                      <p className="text-xs text-muted-foreground">{appt.booking_number}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${APPOINTMENT_STATUS_COLORS[appt.status]}`}>
                      {APPOINTMENT_STATUS_AR[appt.status]}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(appt.scheduled_date, 'PPP')} - {appt.scheduled_start.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {appt.address?.district_ar}، {appt.address?.city_ar}
                        {appt.address?.street && ` - ${appt.address.street}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {appt.services?.map((s: { service_name_ar: string }, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{s.service_name_ar}</Badge>
                      ))}
                    </div>
                  </div>

                  {appt.address?.instructions && (
                    <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800">
                      📝 {appt.address.instructions}
                    </div>
                  )}

                  {/* Phone */}
                  {appt.customer?.phone && (
                    <a
                      href={`tel:${appt.customer.phone}`}
                      className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm"
                    >
                      📞 {appt.customer.phone}
                    </a>
                  )}

                  <AppointmentStatusUpdater
                    appointmentId={appt.id}
                    currentStatus={appt.status}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
