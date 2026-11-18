import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  // Public read: exclude customer PII (name/phone/full address) for unauthenticated callers
  const selectFields = isAuthenticated
    ? `*, customer:customers(name, phone), employee:employees(name_ar, name_en, photo_url), address:customer_addresses(*), services:appointment_services(*)`
    : `id, booking_number, scheduled_date, scheduled_start, scheduled_end, status, payment_status, final_price, tenant_id, employee:employees(name_ar, name_en, photo_url), services:appointment_services(*)`

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(selectFields)
    .eq('id', id)
    .single()

  if (error || !appointment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ appointment })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify the appointment belongs to this user's tenant (prevents cross-tenant updates)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const { data: profile } = await admin
    .from('user_profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status, employeeId, notes } = body

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (employeeId) updates.employee_id = employeeId
  if (notes !== undefined) updates.notes = notes

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)  // enforce tenant isolation
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (status) {
    await supabase.from('appointment_status_history').insert({
      appointment_id: id,
      tenant_id: data.tenant_id,
      new_status: status,
      changed_by: user.id,
    })
  }

  return NextResponse.json({ appointment: data })
}
