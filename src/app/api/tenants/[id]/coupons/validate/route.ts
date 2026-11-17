import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { code, amount } = await req.json()

  const supabase = await createClient()

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('tenant_id', id)
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!coupon) return NextResponse.json({ error: 'كود الخصم غير صالح' }, { status: 404 })

  const now = new Date()
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return NextResponse.json({ error: 'كود الخصم لم يبدأ بعد' }, { status: 400 })
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return NextResponse.json({ error: 'كود الخصم منتهي الصلاحية' }, { status: 400 })
  }
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'تم استنفاد هذا الكود' }, { status: 400 })
  }
  if (amount < coupon.min_order_amount) {
    return NextResponse.json({
      error: `الحد الأدنى للطلب ${coupon.min_order_amount} ريال`
    }, { status: 400 })
  }

  return NextResponse.json({ coupon })
}
