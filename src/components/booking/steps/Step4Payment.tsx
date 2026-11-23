'use client'

import { useState } from 'react'
import { CreditCard, Banknote, Wallet, AlertCircle, Check } from 'lucide-react'
import { formatCurrency, calculateVAT } from '@/lib/utils'
import type { TenantProfile, BookingState, PaymentMethod } from '@/types'
import { DemoCheckout } from '../DemoCheckout'

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

export function Step4Payment({ tenant, state, updateState, onNext, primaryColor }: Props) {
  const p = primaryColor
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
  const [showDemo, setShowDemo] = useState(false)

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

  const sectionStyle: React.CSSProperties = {
    backgroundColor: '#faf8f5',
    borderRadius: 4,
    border: '1px solid rgba(26,15,10,0.08)',
    padding: 18,
  }

  if (showDemo) {
    return <DemoCheckout amount={total} onBack={() => setShowDemo(false)} />
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 16, height: 1, background: p }} />
          <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>STEP 4</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>ملخص الطلب والدفع</h2>
        <p style={{ color: '#a89080', fontSize: 12, marginTop: 4, fontWeight: 600 }}>خطوة أخيرة وسيصلك موعدك</p>
      </div>

      {/* Customer Info */}
      <div style={sectionStyle}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#a89080', margin: '0 0 12px', letterSpacing: '0.03em' }}>بياناتك</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label>الاسم الكامل</label>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="اسمك الكريم"
              style={{ width: '100%', boxSizing: 'border-box' as const, marginTop: 4 }}
            />
          </div>
          <div>
            <label>رقم الجوال</label>
            <input
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              type="tel"
              dir="ltr"
              style={{
                width: '100%', boxSizing: 'border-box' as const, marginTop: 4,
                borderColor: phoneError ? '#fca5a5' : undefined,
              }}
            />
            {phoneError && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{phoneError}</p>}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div style={sectionStyle}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#a89080', margin: '0 0 12px', letterSpacing: '0.03em' }}>ملخص الخدمات</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.selectedServices.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span style={{ color: '#1a0f0a', fontWeight: 600 }}>{s.name_ar}</span>
              <span style={{ fontWeight: 700, color: '#6b5040' }}>{formatCurrency(s.price)}</span>
            </div>
          ))}
          {travelFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#a89080', borderTop: '1px solid rgba(26,15,10,0.06)', paddingTop: 10 }}>
              <span>رسوم الزيارة المنزلية</span>
              <span>{formatCurrency(travelFee)}</span>
            </div>
          )}
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16a34a' }}>
              <span>خصم الكوبون</span>
              <span>−{formatCurrency(discount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#a89080', borderTop: '1px solid rgba(26,15,10,0.06)', paddingTop: 10 }}>
            <span>ضريبة القيمة المضافة (15%)</span>
            <span>{formatCurrency(vat)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(26,15,10,0.1)', paddingTop: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#6b5040' }}>الإجمالي</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#1a0f0a', letterSpacing: '-0.02em' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Coupon */}
      {!couponApplied ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <input
              value={couponCode}
              onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="كود الخصم"
              style={{ width: '100%', boxSizing: 'border-box' as const }}
            />
            {couponError && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{couponError}</p>}
          </div>
          <button
            onClick={applyCoupon}
            style={{
              flexShrink: 0, padding: '0 16px', borderRadius: 999,
              border: '1px solid rgba(26,15,10,0.12)', backgroundColor: '#fff',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#1a0f0a', fontFamily: 'inherit',
            }}
          >
            تطبيق
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
          <Check size={14} style={{ color: '#16a34a' }} />
          <span style={{ fontSize: 13, color: '#15803d', fontWeight: 700 }}>تم تطبيق كود الخصم</span>
        </div>
      )}

      {/* Payment Methods */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#a89080', margin: '0 0 10px', letterSpacing: '0.03em' }}>طريقة الدفع</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PAYMENT_METHODS.map(method => {
            const isActive = selectedMethod === method.id
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
                  textAlign: 'right', fontFamily: 'inherit',
                  backgroundColor: isActive ? '#1a0f0a' : '#faf8f5',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(26,15,10,0.06)',
                  color: isActive ? '#fff' : '#6b5040',
                }}>
                  {method.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: isActive ? '#fff' : '#1a0f0a', margin: 0 }}>{method.label}</p>
                  <p style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.5)' : '#a89080', margin: 0 }}>{method.description}</p>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', border: '2px solid', flexShrink: 0,
                  backgroundColor: isActive ? p : 'transparent',
                  borderColor: isActive ? p : 'rgba(26,15,10,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isActive && <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#fff' }} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: 14, backgroundColor: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        onClick={handleBooking}
        disabled={!customerName.trim() || loading}
        style={{
          width: '100%', height: 50, borderRadius: 999, border: 'none',
          backgroundColor: !customerName.trim() || loading ? 'rgba(26,15,10,0.1)' : '#1a0f0a',
          color: !customerName.trim() || loading ? '#a89080' : '#fff',
          fontSize: 14, fontWeight: 800,
          cursor: !customerName.trim() || loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.02em',
        }}
      >
        {loading ? 'جاري الحجز...' : selectedMethod === 'online' ? `ادفعي ${formatCurrency(total)}` : 'تأكيد الحجز'}
      </button>

      <button
        type="button"
        onClick={() => setShowDemo(true)}
        disabled={loading}
        style={{ alignSelf: 'center', padding: '8px 18px', border: '1px solid #decbc1', borderRadius: 999, fontWeight: 700, color: '#77453e', cursor: 'pointer' }}
      >
        تجربة الدفع مجانًا
      </button>

      <p style={{ fontSize: 11, textAlign: 'center', color: '#a89080', margin: 0, fontWeight: 600 }}>
        بالضغط أنتِ توافقين على شروط الحجز وسياسة الإلغاء
      </p>
    </div>
  )
}
