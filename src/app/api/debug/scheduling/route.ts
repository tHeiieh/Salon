import { NextRequest, NextResponse } from 'next/server'
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
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 })

  const supabase = getAdminClient()

  const [empRes, schedRes, svcRes, empSvcRes, catRes] = await Promise.all([
    supabase.from('employees').select('id, name_ar, is_active').eq('tenant_id', tenantId),
    supabase.from('employee_schedules').select('employee_id, day_of_week, is_working, start_time, end_time').eq('tenant_id', tenantId).order('employee_id').order('day_of_week'),
    supabase.from('services').select('id, name_ar, category_id, is_active').eq('tenant_id', tenantId),
    supabase.from('employee_services').select('employee_id, service_id').eq('tenant_id', tenantId),
    supabase.from('service_categories').select('id, name_ar').eq('tenant_id', tenantId),
  ])

  return NextResponse.json({
    employees: empRes.data,
    employee_schedules: schedRes.data,
    services: svcRes.data,
    employee_services: empSvcRes.data,
    service_categories: catRes.data,
    errors: {
      employees: empRes.error?.message,
      schedules: schedRes.error?.message,
      services: svcRes.error?.message,
      employee_services: empSvcRes.error?.message,
      categories: catRes.error?.message,
    },
  })
}
