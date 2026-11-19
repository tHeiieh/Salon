import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: appointments, error } = await admin
    .from('appointments')
    .select('id, tenant_id')
    .eq('status', 'pending')
    .lt('created_at', cutoff)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!appointments?.length) {
    return NextResponse.json({ confirmed: 0 })
  }

  const ids = appointments.map(a => a.id)

  const { error: updateError } = await admin
    .from('appointments')
    .update({ status: 'confirmed' })
    .in('id', ids)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const historyRows = appointments.map(a => ({
    appointment_id: a.id,
    tenant_id: a.tenant_id,
    old_status: 'pending',
    new_status: 'confirmed',
    note: 'تأكيد تلقائي بعد 24 ساعة',
  }))

  await admin.from('appointment_status_history').insert(historyRows)

  return NextResponse.json({ confirmed: appointments.length })
}
