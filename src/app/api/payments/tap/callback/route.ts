import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const appointmentId = searchParams.get('appt')
  const tapId = searchParams.get('tap_id')

  if (!appointmentId || !tapId) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Verify charge status server-side (never trust redirect params alone)
  const tapKey = process.env.TAP_SECRET_KEY
  if (tapKey) {
    try {
      const res = await fetch(`https://api.tap.company/v2/charges/${tapId}`, {
        headers: { 'Authorization': `Bearer ${tapKey}` },
      })
      const charge = await res.json()

      if (charge.status === 'CAPTURED') {
        const supabase = await createServiceRoleClient()
        await supabase
          .from('appointments')
          .update({ status: 'confirmed', payment_status: 'paid' })
          .eq('id', appointmentId)

        await supabase.from('payments').upsert({
          appointment_id: appointmentId,
          amount: charge.amount,
          currency: charge.currency,
          payment_method: 'online',
          status: 'paid',
          tap_charge_id: tapId,
          idempotency_key: tapId,
        }, { onConflict: 'idempotency_key' })
      }
    } catch (e) {
      console.error('Tap callback verification failed:', e)
    }
  }

  // Redirect to confirmation page
  return NextResponse.redirect(new URL(`/booking/confirmation/${appointmentId}`, req.url))
}
