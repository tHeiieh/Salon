import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDayOfWeek } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Employee, EmployeeSchedule, TimeSlot, Service } from '@/types'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export interface AvailabilityQuery {
  tenantId: string
  date: string
  services: Service[]
  employeeId?: string
  coverageAreaId?: string
}

export interface AvailabilityResult {
  slots: TimeSlot[]
  employees: Employee[]
}

// Total duration including prep time for all selected services
function totalDuration(services: Service[]): number {
  return services.reduce((sum, s) => sum + s.duration_minutes + s.prep_time_minutes, 0)
}

// Check if a time range overlaps with existing appointments
async function getEmployeeBookedSlots(
  supabase: SupabaseClient,
  employeeId: string,
  date: string,
  travelBuffer: number
): Promise<Array<{ start: string; end: string }>> {
  const { data } = await supabase
    .from('appointments')
    .select('scheduled_start, scheduled_end')
    .eq('employee_id', employeeId)
    .eq('scheduled_date', date)
    .not('status', 'in', '("cancelled","rejected","no_show")')

  if (!data) return []
  return data.map(a => ({
    start: subtractMinutes(a.scheduled_start, travelBuffer),
    end: addMinutesToTime(a.scheduled_end, travelBuffer),
  }))
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function addMinutesToTime(time: string, mins: number): string {
  return minutesToTime(timeToMinutes(time) + mins)
}

function subtractMinutes(time: string, mins: number): string {
  return minutesToTime(Math.max(0, timeToMinutes(time) - mins))
}

function slotConflicts(
  slotStart: string,
  slotEnd: string,
  bookedSlots: Array<{ start: string; end: string }>
): boolean {
  const start = timeToMinutes(slotStart)
  const end = timeToMinutes(slotEnd)
  return bookedSlots.some(b => {
    const bs = timeToMinutes(b.start)
    const be = timeToMinutes(b.end)
    return start < be && end > bs
  })
}

export async function getAvailableSlots(query: AvailabilityQuery): Promise<AvailabilityResult> {
  const supabase = getAdminClient()
  const duration = totalDuration(query.services)
  const dayOfWeek = getDayOfWeek(query.date)

  // Get active employees for this tenant who can deliver all requested services
  let employeesQuery = supabase
    .from('employees')
    .select(`
      *,
      schedules:employee_schedules(*),
      employee_services(service_id)
    `)
    .eq('tenant_id', query.tenantId)
    .eq('is_active', true)

  if (query.employeeId) {
    employeesQuery = employeesQuery.eq('id', query.employeeId)
  }

  const { data: employees } = await employeesQuery

  if (!employees?.length) return { slots: [], employees: [] }

  // Filter employees who can do all requested services
  const serviceIds = query.services.map(s => s.id)
  const qualifiedEmployees = employees.filter(emp => {
    const empServiceIds = (emp.employee_services || []).map((es: { service_id: string }) => es.service_id)
    return serviceIds.every(sid => empServiceIds.includes(sid))
  })

  // Check time off
  const { data: timeOff } = await supabase
    .from('employee_time_off')
    .select('employee_id')
    .eq('tenant_id', query.tenantId)
    .lte('start_date', query.date)
    .gte('end_date', query.date)

  const offEmployeeIds = new Set((timeOff || []).map((t: { employee_id: string }) => t.employee_id))
  const workingEmployees = qualifiedEmployees.filter(emp => !offEmployeeIds.has(emp.id))

  if (!workingEmployees.length) return { slots: [], employees: [] }

  // Build slot map across all working employees
  const allSlotMap = new Map<string, { available: boolean; employeeId: string }>()

  for (const emp of workingEmployees) {
    const schedule = (emp.schedules || []).find(
      (s: EmployeeSchedule) => s.day_of_week === dayOfWeek && s.is_working
    )
    if (!schedule) continue

    const bookedSlots = await getEmployeeBookedSlots(
      supabase,
      emp.id,
      query.date,
      emp.travel_buffer_minutes || 30
    )

    // Generate 30-min interval slots within working hours
    let slotTime = schedule.start_time.substring(0, 5)
    const endTime = schedule.end_time.substring(0, 5)

    while (timeToMinutes(slotTime) + duration <= timeToMinutes(endTime)) {
      const slotEnd = addMinutesToTime(slotTime, duration)
      if (!slotConflicts(slotTime, slotEnd, bookedSlots)) {
        if (!allSlotMap.has(slotTime)) {
          allSlotMap.set(slotTime, { available: true, employeeId: emp.id })
        }
      }
      slotTime = addMinutesToTime(slotTime, 30)
    }
  }

  const slots: TimeSlot[] = Array.from(allSlotMap.entries())
    .sort(([a], [b]) => timeToMinutes(a) - timeToMinutes(b))
    .map(([time, info]) => ({
      time,
      available: info.available,
      employeeId: info.employeeId,
    }))

  return {
    slots,
    employees: workingEmployees.map(e => ({
      ...e,
      schedules: e.schedules,
    })),
  }
}

export async function checkSlotAvailability(
  tenantId: string,
  employeeId: string,
  date: string,
  startTime: string,
  durationMinutes: number
): Promise<boolean> {
  const supabase = getAdminClient()
  const endTime = addMinutesToTime(startTime, durationMinutes)

  const { data: emp } = await supabase
    .from('employees')
    .select('travel_buffer_minutes')
    .eq('id', employeeId)
    .eq('tenant_id', tenantId)
    .single()

  const buffer = emp?.travel_buffer_minutes || 30
  const bookedSlots = await getEmployeeBookedSlots(supabase, employeeId, date, buffer)
  return !slotConflicts(startTime, endTime, bookedSlots)
}
