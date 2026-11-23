'use client'

import { useState } from 'react'
import { ArrowLeft, Check, Clock, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { ServiceCategory, Service, BookingState } from '@/types'
import { ServicePhoto } from '../ServicePhoto'
import styles from '../service-gallery.module.css'

interface Props {
  categories: ServiceCategory[]
  state: BookingState
  updateState: (u: Partial<BookingState>) => void
  onNext: () => void
  primaryColor: string
}

export function Step1Services({ categories, state, updateState, onNext, primaryColor }: Props) {
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const selectedIds = new Set(state.selectedServices.map(service => service.id))
  const totalPrice = state.selectedServices.reduce((sum, service) => sum + Number(service.price), 0)
  const totalDuration = state.selectedServices.reduce((sum, service) => sum + service.duration_minutes, 0)

  const availableCategories = categories.filter(category => category.services?.some(service => service.is_active))
  const activeServices = availableCategories
    .filter(category => activeCat === null || category.id === activeCat)
    .flatMap(category => (category.services ?? [])
      .filter(service => service.is_active)
      .map(service => ({ service, category })))

  function toggleService(service: Service) {
    updateState({
      selectedServices: selectedIds.has(service.id)
        ? state.selectedServices.filter(selected => selected.id !== service.id)
        : [...state.selectedServices, service],
    })
  }

  return (
    <div className={styles.bookingServices}>
      <div>
        <div className={styles.stepLabel} style={{ color: primaryColor }}>STEP 1</div>
        <h2>اختاري الخدمات</h2>
        <p className={styles.stepHint}>يمكنك اختيار أكثر من خدمة</p>
      </div>

      {availableCategories.length > 0 && (
        <div className={styles.bookingFilters} role="group" aria-label="فئات الخدمات">
          {[{ id: null, name_ar: 'الكل' }, ...availableCategories].map(category => (
            <button key={category.id ?? 'all'} type="button" aria-pressed={activeCat === category.id} onClick={() => setActiveCat(category.id)}>
              {category.name_ar}
            </button>
          ))}
        </div>
      )}

      <div className={styles.bookingList}>
        {activeServices.length === 0 ? (
          <p className={styles.bookingEmpty}>لا توجد خدمات متاحة للحجز حاليًا.</p>
        ) : activeServices.map(({ service, category }) => {
          const isSelected = selectedIds.has(service.id)
          return (
            <button
              key={service.id}
              type="button"
              className={styles.bookingRow}
              onClick={() => toggleService(service)}
              aria-pressed={isSelected}
            >
              <span className={styles.thumbnail}>
                <ServicePhoto service={service} category={category} sizes="104px" />
              </span>
              <span className={styles.bookingDescription}>
                <strong>{service.name_ar || service.name_en}</strong>
                {service.description_ar && <span className={styles.serviceDescription}>{service.description_ar}</span>}
                <span className={styles.bookingMeta}>
                  <bdi>{formatCurrency(service.price)}</bdi>
                  <span><Clock size={12} aria-hidden="true" /> {service.duration_minutes} دقيقة</span>
                </span>
              </span>
              <span className={styles.selectionMark} aria-hidden="true">
                {isSelected ? <Check size={16} /> : <Plus size={16} />}
              </span>
            </button>
          )
        })}
      </div>

      {state.selectedServices.length > 0 && (
        <div className={styles.bookingSummary}>
          <div>
            <span className={styles.stepHint}>{state.selectedServices.length} خدمة · {totalDuration} دقيقة</span>
            <strong><bdi>{formatCurrency(totalPrice)}</bdi></strong>
          </div>
          <button type="button" onClick={onNext}>التالي <ArrowLeft size={16} aria-hidden="true" /></button>
        </div>
      )}
    </div>
  )
}
