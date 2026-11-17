import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(name, phone),
      employee:employees(name_ar, name_en, photo_url),
      address:customer_addresses(*),
      services:appointment_services(*)
    `)
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

  const { status, employeeId, notes } = body

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (employeeId) updates.employee_id = employeeId
  if (notes !== undefined) updates.notes = notes

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
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
