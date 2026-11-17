'use client'

import { useState } from 'react'
import { CreditCard, Banknote, Wallet, Tag, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, calculateVAT, VAT_RATE } from '@/lib/utils'
import type { TenantProfile, BookingState, PaymentMethod } from '@/types'

interface Props {
  tenant: TenantProfile
  state: BookingState
  updateState: (u: Partial<BookingState>) => void
  onNext: (bookingId: string) => void
  primaryColor: string
}

const BASE_PAYMENT_METHODS = [
  {
    id: 'online' as PaymentMethod,
    label: 'بطاقة بنكية / مدى',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'ماستركارد، فيزا، مدى، آبل باي',
  },
  {
    id: 'cash' as PaymentMethod,
    label: 'نقداً عند الاستلام',
    icon: <Banknote className="w-5 h-5" />,
    description: 'ادفعي عند وصول المتخصصة',
  },
]

export function Step4Payment({ tenant, state, updateState, onNext, primaryColor }: Props) {
  const PAYMENT_METHODS = [
    ...BASE_PAYMENT_METHODS,
    ...(tenant.deposit_percentage > 0 ? [{
      id: 'deposit' as PaymentMethod,
      label: 'عربون مسبق',
      icon: <Wallet className="w-5 h-5" />,
      description: `ادفعي ${tenant.deposit_percentage}% الآن والباقي عند الخدمة`,
    }] : []),
  ]

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('online')
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponApplied, setCouponApplied] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Price calculations
  const servicesTotal = state.selectedServices.reduce((sum, s) => sum + s.price, 0)
  const travelFee = state.coverageArea?.travel_fee || 0
  const discount = state.appliedCoupon
    ? state.appliedCoupon.discount_type === 'percentage'
      ? (servicesTotal * state.appliedCoupon.discount_value) / 100
      : state.appliedCoupon.discount_value
    : 0
  const subtotal = servicesTotal + travelFee - discount
  const vat = calculateVAT(subtotal)
  const total = subtotal + vat

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponError(null)
    try {
      const res = await fetch(`/api/tenants/${state.tenantId}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, amount: servicesTotal }),
      })
      const data = await res.json()
      if (!res.ok || !data.coupon) {
        setCouponError(data.error || 'كود الخصم غير صالح')
        return
      }
      updateState({ couponCode, appliedCoupon: data.coupon })
      setCouponApplied(true)
    } catch {
      setCouponError('حدث خطأ، حاولي مرة أخرى')
    }
  }

  async function handleBooking() {
    if (!customerName.trim()) return
    const phone = customerPhone.replace(/\D/g, '')
    if (!phone || phone.length < 9) {
      setPhoneError('أدخلي رقم جوال صحيح')
      return
    }
    setPhoneError(null)
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: state.tenantId,
          customerName,
          customerPhone,
          services: state.selectedServices.map(s => s.id),
          address: state.newAddress || state.address,
          date: state.selectedDate,
          time: state.selectedTime,
          employeeId: state.selectedEmployee !== 'any' && typeof state.selectedEmployee === 'object'
            ? state.selectedEmployee.id
            : state.selectedEmployee === 'any'
            ? null
            : null,
          paymentMethod: selectedMethod,
          couponId: state.appliedCoupon?.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الحجز')

      if (selectedMethod === 'online' && data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        onNext(data.appointmentId)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h2 className="text-2xl font-bold text-foreground">ملخص الطلب والدفع</h2>
        <p className="text-muted-foreground text-sm mt-1">خطوة أخيرة وسيصلك موعدك</p>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-2xl border border-border/50 p-5 space-y-4">
        <h3 className="font-semibold text-foreground">بياناتك</h3>
        <Input
          label="الاسم الكامل"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          placeholder="اسمك الكريم"
          required
        />
        <Input
          label="رقم الجوال"
          value={customerPhone}
          onChange={e => setCustomerPhone(e.target.value)}
          placeholder="05xxxxxxxx"
          type="tel"
          error={phoneError || undefined}
          dir="ltr"
        />
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-border/50 p-5 space-y-3">
        <h3 className="font-semibold text-foreground">ملخص الخدمات</h3>
        {state.selectedServices.map(s => (
          <div key={s.id} className="flex justify-between items-center text-sm">
            <span className="text-foreground">{s.name_ar}</span>
            <span className="font-medium">{formatCurrency(s.price)}</span>
          </div>
        ))}
        {travelFee > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-3">
            <span>رسوم الزيارة المنزلية</span>
            <span>{formatCurrency(travelFee)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between items-center text-sm text-green-600">
            <span>خصم الكوبون</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-3">
          <span>ضريبة القيمة المضافة (15%)</span>
          <span>{formatCurrency(vat)}</span>
        </div>
        <div
          className="flex justify-between items-center font-bold text-lg border-t-2 pt-3"
          style={{ color: primaryColor }}
        >
          <span>الإجمالي</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Coupon */}
      {!couponApplied && (
        <div className="flex gap-2">
          <Input
            value={couponCode}
            onChange={e => setCouponCode(e.target.value.toUpperCase())}
            placeholder="كود الخصم"
            startIcon={<Tag className="w-4 h-4" />}
            error={couponError || undefined}
          />
          <Button variant="outline" onClick={applyCoupon} className="flex-shrink-0">
            تطبيق
          </Button>
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">طريقة الدفع</h3>
        {PAYMENT_METHODS.map(method => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right`}
            style={selectedMethod === method.id
              ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` }
              : { borderColor: 'hsl(var(--border))', backgroundColor: 'white' }
            }
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={selectedMethod === method.id
                ? { backgroundColor: primaryColor, color: 'white' }
                : { backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
              }
            >
              {method.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{method.label}</p>
              <p className="text-xs text-muted-foreground">{method.description}</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 transition-all`}
              style={selectedMethod === method.id
                ? { borderColor: primaryColor, backgroundColor: primaryColor }
                : { borderColor: 'hsl(var(--border))' }
              }
            />
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        className="w-full rounded-xl h-12 text-base"
        style={{ backgroundColor: primaryColor }}
        disabled={!customerName.trim() || loading}
        loading={loading}
        onClick={handleBooking}
      >
        {selectedMethod === 'online' ? `ادفعي ${formatCurrency(total)}` : 'تأكيد الحجز'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        بالضغط أنتِ توافقين على شروط الحجز وسياسة الإلغاء
      </p>
    </div>
  )
}
