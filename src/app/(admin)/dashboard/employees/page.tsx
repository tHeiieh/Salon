import { getAuthContext } from '@/lib/server/getAuthContext'
import { EmployeesClient } from './EmployeesClient'

export default async function EmployeesPage() {
  const { tenantId, admin } = await getAuthContext()

  const { data: employees } = await admin
    .from('employees')
    .select(`
      id, name_ar, name_en, photo_url, phone, is_active, specializations, travel_buffer_minutes,
      schedules:employee_schedules(day_of_week, is_working, start_time, end_time),
      services:employee_services(service:services(name_ar))
    `)
    .eq('tenant_id', tenantId)
    .order('name_ar')

  return <EmployeesClient employees={(employees ?? []) as Parameters<typeof EmployeesClient>[0]['employees']} />
}
