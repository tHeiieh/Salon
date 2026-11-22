'use client'

import { useState, useCallback } from 'react'
import { ArrowRight, X, Check, Sparkles } from 'lucide-react'
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
  { id: 1, label: 'الخدمة', emoji: '✨' },
  { id: 2, label: 'العنوان', emoji: '📍' },
  { id: 3, label: 'الموعد', emoji: '📅' },
  { id: 4, label: 'الدفع', emoji: '💳' },
  { id: 5, label: 'تأكيد', emoji: '✅' },
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
  const a = tenant.accent_color || '#D4A96A'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#faf8f5',
    }} dir="rtl">

      {/* ── HEADER ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,248,245,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(194,132,122,0.15)',
      }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '14px 16px' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button
              onClick={goBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 700, color: '#6b5040',
                background: 'rgba(26,15,10,0.05)',
                border: '1px solid rgba(26,15,10,0.1)',
                borderRadius: 999, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,15,10,0.09)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(26,15,10,0.05)' }}
            >
              <ArrowRight size={14} />
              {step === 1 ? 'العودة' : 'السابق'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 2 }}>
                <Sparkles size={12} style={{ color: p }} />
                <p style={{ fontSize: 11, color: '#a89080', fontWeight: 600, margin: 0 }}>
                  {tenant.name_ar}
                </p>
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#1a0f0a', margin: 0 }}>
                {STEPS[step - 1].emoji} {STEPS[step - 1].label}
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(26,15,10,0.05)',
                border: '1px solid rgba(26,15,10,0.1)',
                borderRadius: 999, padding: '7px', cursor: 'pointer',
                color: '#8c7060',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(26,15,10,0.05)' }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Step progress */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {STEPS.map((s, i) => {
              const done = step > s.id
              const active = step === s.id
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800,
                      transition: 'all 0.25s ease',
                      ...(done ? {
                        background: '#1a0f0a',
                        border: 'none', color: '#fff',
                      } : active ? {
                        background: p,
                        border: 'none', color: '#fff',
                        boxShadow: `0 2px 16px ${p}44`,
                        transform: 'scale(1.1)',
                      } : {
                        background: 'transparent',
                        border: '1.5px solid rgba(26,15,10,0.15)',
                        color: 'rgba(26,15,10,0.3)',
                      }),
                    }}>
                      {done ? <Check size={14} /> : s.id}
                    </div>
                    <span style={{
                      fontSize: 10, marginTop: 5, fontWeight: 700,
                      color: active ? '#1a0f0a' : 'rgba(26,15,10,0.35)',
                    }}>
                      {s.label}
                    </span>
                  </div>

                  {i < STEPS.length - 1 && (
                    <div style={{
                      flex: 1, margin: '0 4px 16px', height: 1.5,
                      background: 'rgba(26,15,10,0.1)',
                      borderRadius: 2, overflow: 'hidden', position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: done ? '#1a0f0a' : p,
                        width: done ? '100%' : '0%',
                        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                        borderRadius: 2,
                      }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── STEP CONTENT ── */}
      <div style={{
        flex: 1, maxWidth: 672, margin: '0 auto', width: '100%',
        padding: '28px 16px 40px',
      }}>
        {/* White card wrapper */}
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(26,15,10,0.08)',
          borderRadius: 4, padding: '24px',
          minHeight: 300,
        }}>
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

      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .page-enter { animation: fadeUp 0.3s ease both; }
        input, select, textarea {
          background: rgba(255,255,255,0.07) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: #fff !important;
          border-radius: 14px !important;
          padding: 12px 16px !important;
        }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3) !important; }
        input:focus, textarea:focus {
          outline: none !important;
          border-color: rgba(194,132,122,0.5) !important;
          background: rgba(255,255,255,0.09) !important;
        }
        label { color: rgba(255,255,255,0.65) !important; }
      `}</style>
    </div>
  )
}
