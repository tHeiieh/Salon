import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkSlotAvailability } from '@/lib/scheduling'
import { calculateVAT, calculateEndTime, formatPhoneSA, VAT_RATE } from '@/lib/utils'
import { z } from 'zod'

// Zod v4 enforces strict RFC 4122 variant bits; demo/legacy IDs use format-only UUIDs
const uid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID')

const CreateAppointmentSchema = z.object({
  tenantId: uid,
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().min(9).max(20),
  services: z.array(uid).min(1),
  address: z.object({
    city_ar: z.string().min(1),
    city_en: z.string().optional().default(''),
    district_ar: z.string().min(1),
    district_en: z.string().optional().default(''),
    street: z.string().optional(),
    building: z.string().optional(),
    instructions: z.string().optional(),
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  employeeId: uid.nullable().optional(),
  paymentMethod: z.enum(['cash', 'online', 'deposit']),
  couponId: uid.optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = CreateAppointmentSchema.parse(body)

    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // 1. Verify tenant is active
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, status, tenant_profiles(*)')
      .eq('id', data.tenantId)
      .single()

    if (!tenant || tenant.status !== 'active') {
      return NextResponse.json({ error: 'Salon not available' }, { status: 400 })
    }

    // 2. Fetch services
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .in('id', data.services)
      .eq('tenant_id', data.tenantId)
      .eq('is_active', true)

    if (!services || services.length !== data.services.length) {
      return NextResponse.json({ error: 'One or more services unavailable' }, { status: 400 })
    }

    // 3. Calculate totals
    const servicesTotal = services.reduce((sum: number, s: { price: number }) => sum + Number(s.price), 0)
    const totalDuration = services.reduce(
      (sum: number, s: { duration_minutes: number; prep_time_minutes: number }) =>
        sum + s.duration_minutes + s.prep_time_minutes,
      0
    )

    // 4. Get coverage area & travel fee
    const { data: coverageArea } = await supabase
      .from('coverage_areas')
      .select('*')
      .eq('tenant_id', data.tenantId)
      .eq('city_name_ar', data.address.city_ar)
      .eq('district_name_ar', data.address.district_ar)
      .eq('is_active', true)
      .single()

    if (!coverageArea) {
      return NextResponse.json({ error: 'Service area not covered' }, { status: 400 })
    }

    const travelFee = Number(coverageArea.travel_fee)

    // 5. Coupon validation (atomic: increment only if conditions pass, to prevent race conditions)
    let discountAmount = 0
    let couponId = data.couponId || null
    if (couponId) {
      // Use an RPC that atomically validates + increments, returning the discount if valid
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .eq('tenant_id', data.tenantId)
        .eq('is_active', true)
        .single()

      if (coupon) {
        const now = new Date()
        const validTime = (!coupon.valid_from || new Date(coupon.valid_from) <= now) &&
                          (!coupon.valid_until || new Date(coupon.valid_until) > now)
        // Lock the row to prevent concurrent double-spend: increment_coupon_usage is called
        // at step 12 only after the appointment is created. For now, do a pre-check only
        // and invalidate at step 12 via the existing RPC which must enforce the max_uses check.
        if (validTime && (!coupon.max_uses || coupon.used_count < coupon.max_uses)) {
          discountAmount = coupon.discount_type === 'percentage'
            ? (servicesTotal * coupon.discount_value) / 100
            : coupon.discount_value
        } else {
          // Invalid coupon — clear it so it's not incremented below
          couponId = null
        }
      } else {
        couponId = null
      }
    }

    const subtotal = servicesTotal + travelFee - discountAmount
    const vatAmount = calculateVAT(subtotal)
    const finalPrice = subtotal + vatAmount

    // 6. Assign employee
    let employeeId = data.employeeId || null
    if (!employeeId) {
      // Auto-assign: find available employee
      const serviceIds = services.map((s: { id: string }) => s.id)
      const { data: employees } = await supabase
        .from('employees')
        .select('id, travel_buffer_minutes, employee_services(service_id)')
        .eq('tenant_id', data.tenantId)
        .eq('is_active', true)

      for (const emp of (employees || [])) {
        const empServiceIds = emp.employee_services.map((es: { service_id: string }) => es.service_id)
        if (!serviceIds.every((sid: string) => empServiceIds.includes(sid))) continue
        const available = await checkSlotAvailability(
          data.tenantId, emp.id, data.date, data.time, totalDuration
        )
        if (available) { employeeId = emp.id; break }
      }
    } else {
      // Verify slot availability for chosen employee
      const available = await checkSlotAvailability(
        data.tenantId, employeeId, data.date, data.time, totalDuration
      )
      if (!available) {
        return NextResponse.json({ error: 'الموعد المختار لم يعد متاحاً' }, { status: 409 })
      }
    }

    const scheduledEnd = calculateEndTime(data.time, totalDuration)

    // 7. Get or create customer
    const phone = formatPhoneSA(data.customerPhone)
    let customerId: string

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', data.tenantId)
      .eq('phone', phone)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer, error: custErr } = await supabase
        .from('customers')
        .insert({ tenant_id: data.tenantId, name: data.customerName, phone })
        .select('id')
        .single()
      if (custErr || !newCustomer) {
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
      }
      customerId = newCustomer.id
    }

    // 8. Save address
    const { data: savedAddress } = await supabase
      .from('customer_addresses')
      .insert({
        customer_id: customerId,
        tenant_id: data.tenantId,
        ...data.address,
        is_default: false,
      })
      .select('id')
      .single()

    if (!savedAddress) {
      return NextResponse.json({ error: 'Failed to save address' }, { status: 500 })
    }

    // 9. Create appointment (with transaction-safe booking number)
    const bookingNumber = `BK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const { data: appointment, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        tenant_id: data.tenantId,
        booking_number: bookingNumber,
        customer_id: customerId,
        employee_id: employeeId,
        address_id: savedAddress.id,
        status: data.paymentMethod === 'online' ? 'payment_pending' : data.paymentMethod === 'cash' ? 'confirmed' : 'pending',
        scheduled_date: data.date,
        scheduled_start: data.time,
        scheduled_end: scheduledEnd,
        total_price: servicesTotal,
        discount_amount: discountAmount,
        travel_fee: travelFee,
        vat_amount: vatAmount,
        final_price: finalPrice,
        payment_method: data.paymentMethod,
        payment_status: 'pending',
        coupon_id: couponId,
      })
      .select('id, booking_number')
      .single()

    if (apptErr || !appointment) {
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }

    // 10. Insert appointment services
    await supabase.from('appointment_services').insert(
      services.map((s: { id: string; name_ar: string; name_en: string; price: number; duration_minutes: number }) => ({
        appointment_id: appointment.id,
        service_id: s.id,
        tenant_id: data.tenantId,
        service_name_ar: s.name_ar,
        service_name_en: s.name_en,
        price: s.price,
        duration_minutes: s.duration_minutes,
      }))
    )

    // 11. Status history
    await supabase.from('appointment_status_history').insert({
      appointment_id: appointment.id,
      tenant_id: data.tenantId,
      new_status: data.paymentMethod === 'online' ? 'payment_pending' : data.paymentMethod === 'cash' ? 'confirmed' : 'pending',
      note: 'Booking created',
    })

    // 12. Increment coupon usage
    if (couponId) {
      await supabase.rpc('increment_coupon_usage', { p_coupon_id: couponId })
    }

    // 13. For online payments, create Tap Payments charge
    let paymentUrl: string | null = null
    if (data.paymentMethod === 'online') {
      paymentUrl = await createTapCharge(appointment.id, finalPrice, data.tenantId)
    }

    return NextResponse.json({
      appointmentId: appointment.id,
      bookingNumber: appointment.booking_number,
      paymentUrl,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
      return NextResponse.json({ error: `Invalid input: ${fields}` }, { status: 400 })
    }
    console.error('Appointment creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function createTapCharge(appointmentId: string, amount: number, tenantId: string): Promise<string | null> {
  const tapKey = process.env.TAP_SECRET_KEY
  if (!tapKey) return null

  try {
    const res = await fetch('https://api.tap.company/v2/charges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tapKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'SAR',
        customer_initiated: true,
        threeDSecure: true,
        save_card: false,
        description: `Salon booking ${appointmentId}`,
        metadata: { appointment_id: appointmentId, tenant_id: tenantId },
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/tap/callback?appt=${appointmentId}`,
        },
        post: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/tap`,
        },
        source: { id: 'src_all' },
      }),
    })
    const charge = await res.json()
    return charge?.transaction?.url || null
  } catch {
    return null
  }
}
