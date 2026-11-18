import { getAuthContext } from '@/lib/server/getAuthContext'
import { Phone } from 'lucide-react'
import Image from 'next/image'

const DAYS_AR = ['ح', 'ن', 'ث', 'ع', 'خ', 'ج', 'س']
const DAYS_FULL = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export default async function EmployeesPage() {
  const { tenantId, admin } = await getAuthContext()

  const { data: employees } = await admin
    .from('employees')
    .select(`
      id, name_ar, photo_url, phone, is_active, specializations, travel_buffer_minutes,
      schedules:employee_schedules(day_of_week, is_working, start_time, end_time),
      services:employee_services(service:services(name_ar))
    `)
    .eq('tenant_id', tenantId)
    .order('name_ar')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>الموظفات</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {!employees?.length ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0', color: '#aaa' }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" fill="#C2847A" fillOpacity="0.3" stroke="#C2847A" strokeWidth="1.5"/>
                <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="#C2847A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 14 }}>لا توجد موظفات بعد</p>
          </div>
        ) : (
          employees.map((emp: {
            id: string
            name_ar: string
            photo_url?: string
            phone?: string
            is_active: boolean
            specializations?: string[]
            travel_buffer_minutes: number
            schedules: Array<{ day_of_week: number; is_working: boolean; start_time: string; end_time: string }>
            services: Array<{ service: { name_ar: string }[] }>
          }) => (
            <div
              key={emp.id}
              style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, overflow: 'hidden',
                  flexShrink: 0, position: 'relative',
                  backgroundImage: 'linear-gradient(135deg, rgba(194,132,122,0.1) 0%, rgba(212,169,106,0.1) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {emp.photo_url ? (
                    <Image src={emp.photo_url} alt={emp.name_ar} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" fill="#C2847A" fillOpacity="0.3" stroke="#C2847A" strokeWidth="1.5"/>
                      <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="#C2847A" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{emp.name_ar}</h3>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0,
                      backgroundColor: emp.is_active ? '#f0fdf4' : '#f5f5f5',
                      color: emp.is_active ? '#16a34a' : '#999',
                    }}>
                      {emp.is_active ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </div>
                  {emp.phone && (
                    <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }} dir="ltr">
                      <Phone size={11} />
                      {emp.phone}
                    </p>
                  )}
                  {emp.specializations?.length ? (
                    <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0 0' }}>
                      {emp.specializations.join(' • ')}
                    </p>
                  ) : null}

                  {/* Working days */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                    {DAYS_AR.map((day, i) => {
                      const schedule = emp.schedules?.find(s => s.day_of_week === i)
                      return (
                        <div
                          key={i}
                          title={DAYS_FULL[i]}
                          style={{
                            width: 28, height: 28, borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 600,
                            backgroundColor: schedule?.is_working ? 'rgba(194,132,122,0.15)' : '#f5f5f5',
                            color: schedule?.is_working ? '#C2847A' : '#ccc',
                          }}
                        >
                          {day}
                        </div>
                      )
                    })}
                  </div>

                  {/* Services */}
                  {emp.services?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                      {emp.services.slice(0, 3).map((es, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '2px 8px', borderRadius: 20, fontSize: 11,
                            border: '1px solid #e5e5e5', color: '#666', backgroundColor: '#fafafa',
                          }}
                        >
                          {es.service?.[0]?.name_ar}
                        </span>
                      ))}
                      {emp.services.length > 3 && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 20, fontSize: 11,
                          border: '1px solid #e5e5e5', color: '#888', backgroundColor: '#fafafa',
                        }}>
                          +{emp.services.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
