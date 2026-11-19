import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Find customer by user's email
    const { data: customer } = await admin
      .from('customers')
      .select('id, tenant_id')
      .eq('email', user.email!)
      .limit(1)
      .single()

    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

    // Find the appointment and verify ownership
    const { data: appointment } = await admin
      .from('appointments')
      .select('id, status, scheduled_date, tenant_id')
      .eq('id', id)
      .eq('customer_id', customer.id)
      .single()

    if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

    const cancellableStatuses = ['pending', 'confirmed', 'payment_pending']
    if (!cancellableStatuses.includes(appointment.status)) {
      return NextResponse.json({ error: 'Cannot cancel this appointment' }, { status: 400 })
    }

    // Check cancellation_hours policy
    const { data: profile } = await admin
      .from('tenant_profiles')
      .select('cancellation_hours')
      .eq('tenant_id', appointment.tenant_id)
      .limit(1)
      .single()

    if (profile?.cancellation_hours) {
      // Parse scheduled date + time to check if within allowed window
      const { data: apptFull } = await admin
        .from('appointments')
        .select('scheduled_date, scheduled_start')
        .eq('id', id)
        .single()

      if (apptFull) {
        const scheduledAt = new Date(`${apptFull.scheduled_date}T${apptFull.scheduled_start}`)
        const hoursUntil = (scheduledAt.getTime() - Date.now()) / 3600000
        if (hoursUntil < profile.cancellation_hours) {
          return NextResponse.json(
            { error: `لا يمكن الإلغاء خلال ${profile.cancellation_hours} ساعة من الموعد` },
            { status: 400 }
          )
        }
      }
    }

    // Cancel the appointment
    const { error: updateErr } = await admin
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (updateErr) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    await admin.from('appointment_status_history').insert({
      appointment_id: id,
      tenant_id: appointment.tenant_id,
      new_status: 'cancelled',
      note: 'Cancelled by customer',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
