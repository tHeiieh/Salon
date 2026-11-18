import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('hashstring') || ''

  // Verify webhook signature — reject if secret is not configured to prevent payment forgery
  const webhookSecret = process.env.TAP_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('TAP_WEBHOOK_SECRET not configured — rejecting webhook')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')
  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = await createServiceRoleClient()
  const chargeId = event.id as string
  const status = event.status as string
  const metadata = event.metadata as Record<string, string>
  const appointmentId = metadata?.appointment_id

  if (!appointmentId) {
    return NextResponse.json({ received: true })
  }

  if (status === 'CAPTURED') {
    // Update payment record
    await supabase
      .from('payments')
      .upsert({
        tenant_id: metadata.tenant_id,
        appointment_id: appointmentId,
        amount: (event.amount as number),
        currency: event.currency as string,
        payment_method: 'online',
        status: 'paid',
        tap_charge_id: chargeId,
        idempotency_key: chargeId,
      }, { onConflict: 'idempotency_key' })

    // Update appointment status
    await supabase
      .from('appointments')
      .update({ status: 'confirmed', payment_status: 'paid' })
      .eq('id', appointmentId)

    await supabase.from('appointment_status_history').insert({
      appointment_id: appointmentId,
      new_status: 'confirmed',
      note: `Payment captured: ${chargeId}`,
    })
  } else if (status === 'FAILED' || status === 'CANCELLED') {
    await supabase
      .from('appointments')
      .update({ payment_status: 'failed' })
      .eq('id', appointmentId)
  }

  return NextResponse.json({ received: true })
}
