'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Check, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Step1Services } from './steps/Step1Services'
import { Step2Address } from './steps/Step2Address'
import { Step3DateTime } from './steps/Step3DateTime'
import { Step4Payment } from './steps/Step4Payment'
import { Step5Confirmation } from './steps/Step5Confirmation'
import type { BookingState, Employee, ServiceCategory, TenantProfile } from '@/types'
import styles from './booking.module.css'

interface Props {
  tenant: TenantProfile
  initialServices: BookingState['selectedServices']
  allCategories: ServiceCategory[]
  employees: Employee[]
  onClose: () => void
}

const STEPS = ['الخدمات', 'العنوان', 'الموعد', 'الدفع', 'التأكيد']

export function BookingFlow({ tenant, initialServices, allCategories, employees, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [bookingState, setBookingState] = useState<BookingState>({
    tenantId: tenant.tenant_id,
    selectedServices: initialServices,
  })
  const [bookingId, setBookingId] = useState<string | null>(null)
  const progressRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    progressRef.current?.focus({ preventScroll: true })
  }, [step])

  const updateState = useCallback((updates: Partial<BookingState>) => {
    setBookingState(previous => ({ ...previous, ...updates }))
  }, [])
  const goNext = () => setStep(current => Math.min(current + 1, STEPS.length))
  const goBack = () => {
    if (step === 1 || step === STEPS.length) onClose()
    else setStep(current => current - 1)
  }
  const primaryColor = tenant.primary_color || '#C2847A'
  const servicesTotal = bookingState.selectedServices.reduce((sum, service) => sum + Number(service.price), 0)
  const stepProps = { state: bookingState, updateState, primaryColor }

  return (
    <div className={styles.booking} dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&display=swap');
        .editorial-booking input, .editorial-booking select, .editorial-booking textarea {
          background: #faf8f5 !important;
          border: 1px solid rgba(26,15,10,0.12) !important;
          color: #1a0f0a !important;
          border-radius: 10px !important;
          padding: 11px 14px !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }
        .editorial-booking input::placeholder, .editorial-booking textarea::placeholder { color: #806657 !important; }
        .editorial-booking label { color: #806657 !important; font-size: 11px !important; font-weight: 700 !important; letter-spacing: 0.03em !important; }
      `}</style>
      <header className={styles.header}>
        <button type="button" className={styles.control} onClick={goBack}>
          <ArrowRight size={16} aria-hidden="true" />
          {step === 1 || step === STEPS.length ? 'الصالون' : 'رجوع'}
        </button>
        <strong>{tenant.name_ar || tenant.name_en}</strong>
        <button type="button" className={styles.close} onClick={onClose} aria-label="إغلاق الحجز">
          <X size={19} />
        </button>
      </header>

      <div className={styles.layout}>
        <main className={styles.main}>
          <ol ref={progressRef} tabIndex={-1} className={styles.progress} aria-label="خطوات الحجز">
            {STEPS.map((label, index) => (
              <li key={label} aria-current={step === index + 1 ? 'step' : undefined} data-complete={step > index + 1}>
                <span className={styles.number}>{step > index + 1 ? <Check size={14} /> : index + 1}</span>
                {label}
              </li>
            ))}
          </ol>

          <div key={step} className={`${styles.content} editorial-booking`}>
            {step === 1 && <Step1Services {...stepProps} categories={allCategories} onNext={goNext} />}
            {step === 2 && <Step2Address {...stepProps} tenant={tenant} onNext={goNext} />}
            {step === 3 && <Step3DateTime {...stepProps} tenant={tenant} employees={employees} onNext={goNext} />}
            {step === 4 && (
              <Step4Payment {...stepProps} tenant={tenant} onNext={id => {
                setBookingId(id)
                goNext()
              }} />
            )}
            {step === 5 && bookingId && (
              <Step5Confirmation
                bookingId={bookingId}
                tenant={tenant}
                state={bookingState}
                primaryColor={primaryColor}
                onNewBooking={() => {
                  setBookingId(null)
                  setStep(1)
                  setBookingState({ tenantId: tenant.tenant_id, selectedServices: [] })
                }}
              />
            )}
          </div>
        </main>

        <aside className={styles.aside}>
          <div className={styles.poster}>
            <Image src="/media/salon-cover.avif" alt="" fill sizes="(min-width: 1280px) 440px, 34vw" priority />
            <div className={styles.posterText}>
              <span>خدمات الصالون في منزلك</span>
              <strong aria-hidden="true">جمال</strong>
            </div>
          </div>
          {bookingState.selectedServices.length > 0 && (
            <div className={styles.selection}>
              <h2>الخدمات المختارة</h2>
              <ul>
                {bookingState.selectedServices.map(service => (
                  <li key={service.id}>
                    <span>{service.name_ar}</span>
                    <bdi>{formatCurrency(service.price)}</bdi>
                  </li>
                ))}
              </ul>
              <div className={styles.subtotal}><span>مجموع الخدمات</span><bdi>{formatCurrency(servicesTotal)}</bdi></div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
