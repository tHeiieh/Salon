import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdateSchema = z.object({
  name_ar: z.string().min(2).optional(),
  name_en: z.string().optional(),
  phone: z.string().optional(),
  bio_ar: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  travel_buffer_minutes: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  service_ids: z.array(z.string().uuid()).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!['salon_owner', 'superadmin'].includes(profile?.role || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { service_ids, ...employeeData } = parsed.data

  const { data, error } = await supabase
    .from('employees')
    .update(employeeData)
    .eq('id', id)
    .eq('tenant_id', profile!.tenant_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update service assignments if provided
  if (service_ids !== undefined) {
    await supabase.from('employee_services').delete().eq('employee_id', id)
    if (service_ids.length > 0) {
      await supabase.from('employee_services').insert(
        service_ids.map(sid => ({ employee_id: id, service_id: sid, tenant_id: profile!.tenant_id }))
      )
    }
  }

  return NextResponse.json({ employee: data })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!['salon_owner', 'superadmin'].includes(profile?.role || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('employees')
    .update({ is_active: false })
    .eq('id', id)
    .eq('tenant_id', profile!.tenant_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
