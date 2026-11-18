import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/scheduling'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tenantId = searchParams.get('tenantId')
  const date = searchParams.get('date')
  const serviceIdsStr = searchParams.get('serviceIds')
  const employeeId = searchParams.get('employeeId') || undefined

  if (!tenantId || !date || !serviceIdsStr) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const serviceIds = serviceIdsStr.split(',').filter(Boolean)

  try {
    const supabase = getAdminClient()
    const { data: services, error: svcErr } = await supabase
      .from('services')
      .select('*')
      .in('id', serviceIds)
      .eq('tenant_id', tenantId)

    if (!services?.length) {
      // Debug: check if any services exist for this tenant at all
      const { data: allSvc } = await supabase.from('services').select('id,name_ar').eq('tenant_id', tenantId).limit(5)
      console.error('[availability] services not found', { serviceIds, svcErr, tenantServices: allSvc })
      return NextResponse.json({ slots: [], employees: [], _debug: { step: 'services_not_found', serviceIds, tenantServices: allSvc } })
    }

    // Debug: check employees + schedules raw
    const { data: rawEmps } = await supabase
      .from('employees')
      .select('id, name_ar, is_active, schedules:employee_schedules(*), employee_services(service_id)')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    console.log('[availability] rawEmps', JSON.stringify(rawEmps?.map(e => ({ id: e.id, name: e.name_ar, scheduleCount: e.schedules?.length, serviceCount: e.employee_services?.length }))))

    const result = await getAvailableSlots({
      tenantId,
      date,
      services,
      employeeId,
    })

    if (!result.slots.length) {
      console.warn('[availability] no slots returned', { tenantId, date, serviceIds, empCount: rawEmps?.length })
      return NextResponse.json({ ...result, _debug: { rawEmpCount: rawEmps?.length, emps: rawEmps?.map(e => ({ id: e.id, name: e.name_ar, scheduleCount: (e.schedules as unknown[])?.length, serviceCount: (e.employee_services as unknown[])?.length })) } })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Availability error:', error)
    return NextResponse.json({ slots: [], employees: [], _debug: { error: String(error) } })
  }
}
