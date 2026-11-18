'use client'

import { useState } from 'react'
import { CreditCard, Banknote, Wallet, AlertCircle } from 'lucide-react'
import { formatCurrency, calculateVAT } from '@/lib/utils'
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
    icon: <CreditCard size={18} />,
    description: 'ماستركارد، فيزا، مدى، آبل باي',
  },
  {
    id: 'cash' as PaymentMethod,
    label: 'نقداً عند الاستلام',
    icon: <Banknote size={18} />,
    description: 'ادفعي عند وصول المتخصصة',
  },
]

const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, borderRadius: 12, border: '1px solid #e5e7eb',
  padding: '0 16px', fontSize: 14, backgroundColor: '#fff', outline: 'none',
  boxSizing: 'border-box', color: '#1a1a1a',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6,
}

export function Step4Payment({ tenant, state, updateState, onNext, primaryColor }: Props) {
  const PAYMENT_METHODS = [
    ...BASE_PAYMENT_METHODS,
    ...(tenant.deposit_percentage > 0 ? [{
      id: 'deposit' as PaymentMethod,
      label: 'عربون مسبق',
      icon: <Wallet size={18} />,
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
          time: state.selectedTime?.substring(0, 5),
          employeeId: state.selectedEmployee !== 'any' && typeof state.selectedEmployee === 'object'
            ? state.selectedEmployee.id
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
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>ملخص الطلب والدفع</h2>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>خطوة أخيرة وسيصلك موعدك</p>
      </div>

      {/* Customer Info */}
      <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', padding: 20 }}>
        <h3 style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', margin: '0 0 16px' }}>بياناتك</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>الاسم الكامل</label>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="اسمك الكريم"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>رقم الجوال</label>
            <input
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              type="tel"
              dir="ltr"
              style={{ ...inputStyle, borderColor: phoneError ? '#fca5a5' : '#e5e7eb' }}
            />
            {phoneError && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{phoneError}</p>}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', padding: 20 }}>
        <h3 style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', margin: '0 0 16px' }}>ملخص الخدمات</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {state.selectedServices.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: '#1a1a1a' }}>{s.name_ar}</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(s.price)}</span>
            </div>
          ))}
          {travelFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#6b7280', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
              <span>رسوم الزيارة المنزلية</span>
              <span>{formatCurrency(travelFee)}</span>
            </div>
          )}
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#16a34a' }}>
              <span>خصم الكوبون</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#6b7280', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
            <span>ضريبة القيمة المضافة (15%)</span>
            <span>{formatCurrency(vat)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 17, fontWeight: 700, borderTop: '2px solid #f0f0f0', paddingTop: 12, color: primaryColor }}>
            <span>الإجمالي</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Coupon */}
      {!couponApplied && (
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <input
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="كود الخصم"
              style={{ ...inputStyle, borderColor: couponError ? '#fca5a5' : '#e5e7eb' }}
            />
            {couponError && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{couponError}</p>}
          </div>
          <button
            onClick={applyCoupon}
            style={{
              flexShrink: 0, padding: '0 16px', borderRadius: 12, border: '1px solid #e5e7eb',
              backgroundColor: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#374151',
            }}
          >
            تطبيق
          </button>
        </div>
      )}

      {/* Payment Methods */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', margin: 0 }}>طريقة الدفع</h3>
        {PAYMENT_METHODS.map(method => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 16,
              padding: 16, borderRadius: 20, border: '2px solid', cursor: 'pointer',
              textAlign: 'right', background: 'none', transition: 'all 0.15s',
              ...(selectedMethod === method.id
                ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` }
                : { borderColor: '#e5e7eb', backgroundColor: '#fff' }),
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...(selectedMethod === method.id
                ? { backgroundColor: primaryColor, color: '#fff' }
                : { backgroundColor: '#f5f5f5', color: '#6b7280' }),
            }}>
              {method.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: 14, color: '#1a1a1a', margin: 0 }}>{method.label}</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{method.description}</p>
            </div>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', border: '2px solid', flexShrink: 0,
              ...(selectedMethod === method.id
                ? { borderColor: primaryColor, backgroundColor: primaryColor }
                : { borderColor: '#e5e7eb', backgroundColor: 'transparent' }),
            }} />
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: 16, backgroundColor: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={!customerName.trim() || loading}
        style={{
          width: '100%', height: 48, borderRadius: 12, border: 'none',
          backgroundColor: !customerName.trim() || loading ? '#d1d5db' : primaryColor,
          color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: !customerName.trim() || loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'جاري الحجز...' : selectedMethod === 'online' ? `ادفعي ${formatCurrency(total)}` : 'تأكيد الحجز'}
      </button>

      <p style={{ fontSize: 11, textAlign: 'center', color: '#9ca3af' }}>
        بالضغط أنتِ توافقين على شروط الحجز وسياسة الإلغاء
      </p>
    </div>
  )
}
