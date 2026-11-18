import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

const UpdateSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'cancelled']),
})

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  confirmed:   ['in_progress', 'cancelled'],
  assigned:    ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status: newStatus } = UpdateSchema.parse(body)

    // Auth: must be a logged-in employee
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    if (!profile?.tenant_id || !['employee', 'salon_owner', 'salon_staff'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch appointment to check current status and ownership
    const { data: appointment } = await admin
      .from('appointments')
      .select('id, status, employee_id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // If employee role, can only update their own appointments
    if (profile.role === 'employee') {
      const { data: employee } = await admin
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .eq('tenant_id', profile.tenant_id)
        .single()

      if (!employee || appointment.employee_id !== employee.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Validate transition
    const allowed = ALLOWED_TRANSITIONS[appointment.status] || []
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${appointment.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Update appointment
    const { error: updateErr } = await admin
      .from('appointments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateErr) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    // Record status history
    await admin.from('appointment_status_history').insert({
      appointment_id: id,
      tenant_id: profile.tenant_id,
      new_status: newStatus,
      changed_by: user.id,
      note: `Status updated by employee`,
    })

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
