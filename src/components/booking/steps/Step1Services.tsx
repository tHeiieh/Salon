'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Clock, ShoppingBag, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { ServiceCategory, Service, BookingState } from '@/types'

interface Props {
  categories: ServiceCategory[]
  state: BookingState
  updateState: (u: Partial<BookingState>) => void
  onNext: () => void
  primaryColor: string
}

export function Step1Services({ categories, state, updateState, onNext, primaryColor }: Props) {
  const [activeCat, setActiveCat] = useState<string | null>(categories[0]?.id || null)

  const selectedIds = new Set(state.selectedServices.map(s => s.id))

  function toggleService(service: Service) {
    if (selectedIds.has(service.id)) {
      updateState({ selectedServices: state.selectedServices.filter(s => s.id !== service.id) })
    } else {
      updateState({ selectedServices: [...state.selectedServices, service] })
    }
  }

  const totalPrice = state.selectedServices.reduce((sum, s) => sum + s.price, 0)
  const totalDuration = state.selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)

  const activeServices = activeCat
    ? categories.find(c => c.id === activeCat)?.services?.filter(s => s.is_active) || []
    : categories.flatMap(c => c.services?.filter(s => s.is_active) || [])

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>اختاري الخدمة</h2>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>يمكنك اختيار أكثر من خدمة</p>
      </div>

      {/* Category Tabs */}
      <div className="custom-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        <button
          onClick={() => setActiveCat(null)}
          style={{
            flexShrink: 0, padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            ...(activeCat === null
              ? { backgroundColor: primaryColor, color: '#fff' }
              : { backgroundColor: '#f5f5f5', color: '#6b7280' }),
          }}
        >
          الكل
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              ...(activeCat === cat.id
                ? { backgroundColor: primaryColor, color: '#fff' }
                : { backgroundColor: '#f5f5f5', color: '#6b7280' }),
            }}
          >
            {cat.icon && <span style={{ marginLeft: 4 }}>{cat.icon}</span>}
            {cat.name_ar}
          </button>
        ))}
      </div>

      {/* Services list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeServices.map(service => {
          const isSelected = selectedIds.has(service.id)
          return (
            <button
              key={service.id}
              onClick={() => toggleService(service)}
              style={{
                width: '100%', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 16,
                padding: 16, borderRadius: 20, border: '2px solid', cursor: 'pointer',
                transition: 'all 0.2s', background: 'none',
                ...(isSelected
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` }
                  : { borderColor: '#e5e7eb', backgroundColor: '#fff' }),
              }}
            >
              {service.image_url && (
                <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                  <Image src={service.image_url} alt={service.name_ar} fill style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', margin: 0 }}>{service.name_ar}</h3>
                {service.description_ar && (
                  <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {service.description_ar}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: primaryColor }}>
                    {formatCurrency(service.price)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                    <Clock size={11} />
                    {service.duration_minutes} د
                  </span>
                </div>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid',
                transition: 'all 0.2s',
                ...(isSelected
                  ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#fff' }
                  : { backgroundColor: 'transparent', borderColor: '#e5e7eb' }),
              }}>
                {isSelected ? <Check size={14} /> : <Plus size={14} style={{ color: '#9ca3af' }} />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom Cart */}
      {state.selectedServices.length > 0 && (
        <div style={{
          position: 'sticky', bottom: 24, backgroundColor: '#fff',
          borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: `1px solid ${primaryColor}30`,
          padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: primaryColor, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{state.selectedServices.length} خدمة</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
                {totalDuration} دقيقة • {formatCurrency(totalPrice)}
              </p>
            </div>
          </div>
          <button
            onClick={onNext}
            style={{
              backgroundColor: primaryColor, color: '#fff', border: 'none',
              borderRadius: 12, padding: '10px 24px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            التالي
          </button>
        </div>
      )}

      {state.selectedServices.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
          <p style={{ margin: 0, fontSize: 14 }}>اختاري الخدمات التي تريدينها</p>
        </div>
      )}
    </div>
  )
}
