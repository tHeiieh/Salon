import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/scheduling'
import { createClient } from '@/lib/supabase/server'

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
    const supabase = await createClient()
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .in('id', serviceIds)
      .eq('tenant_id', tenantId)

    if (!services?.length) {
      return NextResponse.json({ slots: [], employees: [] })
    }

    const result = await getAvailableSlots({
      tenantId,
      date,
      services,
      employeeId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Availability error:', error)
    return NextResponse.json({ slots: [], employees: [] })
  }
}
