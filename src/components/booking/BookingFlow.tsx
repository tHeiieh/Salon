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
  { id: 1, label: 'الخدمة', icon: '✦' },
  { id: 2, label: 'العنوان', icon: '📍' },
  { id: 3, label: 'الموعد', icon: '🗓' },
  { id: 4, label: 'الدفع', icon: '💳' },
  { id: 5, label: 'تأكيد', icon: '✓' },
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

  const p = tenant.primary_color

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]" dir="rtl">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-50 bg-white shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">

          {/* top row */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl px-2 py-1 hover:bg-muted/50"
            >
              <ArrowRight className="w-4 h-4" />
              {step === 1 ? 'العودة' : 'السابق'}
            </button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium">{tenant.name_ar}</p>
              <p className="text-sm font-black text-foreground">{STEPS[step - 1].label}</p>
            </div>

            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-muted/50"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step progress */}
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                {/* step bubble */}
                <div className="flex flex-col items-center">
                  <div
                    className={`step-circle w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                      step > s.id
                        ? 'bg-green-500 border-green-500 text-white'
                        : step === s.id
                          ? 'border-transparent text-white shadow-md scale-110'
                          : 'bg-white border-border text-muted-foreground'
                    }`}
                    style={step === s.id ? { backgroundColor: p, borderColor: p } : undefined}
                  >
                    {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-semibold transition-colors ${
                      step === s.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {/* connector line */}
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-1 mb-4 relative h-0.5 bg-border overflow-hidden rounded-full">
                    <div
                      className="step-line absolute inset-y-0 right-0 rounded-full"
                      style={{
                        width: step > s.id ? '100%' : '0%',
                        backgroundColor: step > s.id ? '#22c55e' : p,
                        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STEP CONTENT ── */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 page-enter">
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
