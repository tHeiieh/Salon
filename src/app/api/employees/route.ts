import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const EmployeeSchema = z.object({
  name_ar: z.string().min(2),
  name_en: z.string().optional(),
  phone: z.string().optional(),
  bio_ar: z.string().optional(),
  specializations: z.array(z.string()).default([]),
  travel_buffer_minutes: z.number().int().min(0).default(30),
  is_active: z.boolean().default(true),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      employee_schedules (*),
      employee_services (service_id)
    `)
    .eq('tenant_id', profile!.tenant_id)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ employees: data })
}

export async function POST(req: Request) {
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
  const parsed = EmployeeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('employees')
    .insert({ ...parsed.data, tenant_id: profile!.tenant_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ employee: data }, { status: 201 })
}
