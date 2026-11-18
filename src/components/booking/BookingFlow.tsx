'use client'

import { useState, useCallback } from 'react'
import { ArrowRight, X, Check } from 'lucide-react'
import { Step1Services } from './steps/Step1Services'
import { Step2Address } from './steps/Step2Address'
import { Step3DateTime } from './steps/Step3DateTime'
import { Step4Payment } from './steps/Step4Payment'
import { Step5Confirmation } from './steps/Step5Confirmation'
import type { TenantProfile, ServiceCategory, Employee, BookingState } from '@/types'

interface Props {
  tenant: TenantProfile
  initialServices: BookingState['selectedServices']
  allCategories: ServiceCategory[]
  employees: Employee[]
  onClose: () => void
}

const STEPS = [
  { id: 1, label: 'الخدمة' },
  { id: 2, label: 'العنوان' },
  { id: 3, label: 'الموعد' },
  { id: 4, label: 'الدفع' },
  { id: 5, label: 'تأكيد' },
]

export function BookingFlow({ tenant, initialServices, allCategories, employees, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [bookingState, setBookingState] = useState<BookingState>({
    tenantId: tenant.tenant_id,
    selectedServices: initialServices,
  })
  const [bookingId, setBookingId] = useState<string | null>(null)

  const updateState = useCallback((updates: Partial<BookingState>) => {
    setBookingState(prev => ({ ...prev, ...updates }))
  }, [])

  const goNext = useCallback(() => setStep(s => Math.min(s + 1, 5)), [])
  const goBack = useCallback(() => {
    if (step === 1) onClose()
    else setStep(s => s - 1)
  }, [step, onClose])

  const p = tenant.primary_color || '#C2847A'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAF8F5' }} dir="rtl">

      {/* HEADER */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#fff', boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '16px 16px 12px' }}>

          {/* top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button
              onClick={goBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 500, color: '#6b7280',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 8px', borderRadius: 10,
              }}
            >
              <ArrowRight size={16} />
              {step === 1 ? 'العودة' : 'السابق'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, margin: 0 }}>{tenant.name_ar}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{STEPS[step - 1].label}</p>
            </div>

            <button
              onClick={onClose}
              aria-label="إغلاق"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6b7280', padding: 8, borderRadius: 10,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Step progress */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {/* bubble + label */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, border: '2px solid',
                      transition: 'all 0.2s',
                      ...(step > s.id
                        ? { backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#fff' }
                        : step === s.id
                        ? { backgroundColor: p, borderColor: p, color: '#fff', transform: 'scale(1.1)' }
                        : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#9ca3af' }),
                    }}
                  >
                    {step > s.id ? <Check size={14} /> : s.id}
                  </div>
                  <span style={{
                    fontSize: 10, marginTop: 4, fontWeight: 600,
                    color: step === s.id ? '#1a1a1a' : '#9ca3af',
                  }}>
                    {s.label}
                  </span>
                </div>

                {/* connector */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, margin: '0 4px 16px', height: 2,
                    backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0, right: 0, borderRadius: 2,
                      backgroundColor: step > s.id ? '#22c55e' : p,
                      width: step > s.id ? '100%' : '0%',
                      transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP CONTENT */}
      <div className="page-enter" style={{ flex: 1, maxWidth: 672, margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        {step === 1 && (
          <Step1Services
            categories={allCategories}
            state={bookingState}
            updateState={updateState}
            onNext={goNext}
            primaryColor={p}
          />
        )}
        {step === 2 && (
          <Step2Address
            tenant={tenant}
            state={bookingState}
            updateState={updateState}
            onNext={goNext}
            primaryColor={p}
          />
        )}
        {step === 3 && (
          <Step3DateTime
            tenant={tenant}
            state={bookingState}
            updateState={updateState}
            onNext={goNext}
            employees={employees}
            primaryColor={p}
          />
        )}
        {step === 4 && (
          <Step4Payment
            tenant={tenant}
            state={bookingState}
            updateState={updateState}
            onNext={(id) => { setBookingId(id); goNext() }}
            primaryColor={p}
          />
        )}
        {step === 5 && bookingId && (
          <Step5Confirmation
            bookingId={bookingId}
            tenant={tenant}
            state={bookingState}
            primaryColor={p}
            onNewBooking={() => {
              setStep(1)
              setBookingState({ tenantId: tenant.tenant_id, selectedServices: [] })
            }}
          />
        )}
      </div>
    </div>
  )
}
