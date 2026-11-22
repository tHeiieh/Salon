'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Clock, ArrowLeft } from 'lucide-react'
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
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const p = primaryColor

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
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 16, height: 1, background: p }} />
          <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>STEP 1</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>اختاري الخدمة</h2>
        <p style={{ color: '#a89080', fontSize: 12, marginTop: 4, fontWeight: 600 }}>يمكنك اختيار أكثر من خدمة</p>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="custom-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            onClick={() => setActiveCat(null)}
            style={{
              flexShrink: 0, padding: '7px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              backgroundColor: activeCat === null ? '#1a0f0a' : 'transparent',
              color: activeCat === null ? '#fff' : '#6b5040',
              outline: activeCat === null ? 'none' : '1px solid rgba(26,15,10,0.15)',
            }}
          >
            الكل
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              style={{
                flexShrink: 0, padding: '7px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                backgroundColor: activeCat === cat.id ? '#1a0f0a' : 'transparent',
                color: activeCat === cat.id ? '#fff' : '#6b5040',
                outline: activeCat === cat.id ? 'none' : '1px solid rgba(26,15,10,0.15)',
              }}
            >
              {cat.icon && <span style={{ marginLeft: 4 }}>{cat.icon}</span>}
              {cat.name_ar}
            </button>
          ))}
        </div>
      )}

      {/* Services list — editorial row style */}
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        {activeServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#a89080' }}>
            <p style={{ margin: 0, fontSize: 13 }}>لا توجد خدمات في هذه الفئة</p>
          </div>
        ) : activeServices.map((service, i) => {
          const isSelected = selectedIds.has(service.id)
          return (
            <button
              key={service.id}
              onClick={() => toggleService(service)}
              style={{
                width: '100%', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                borderBottom: i < activeServices.length - 1 ? '1px solid rgba(26,15,10,0.06)' : 'none',
                backgroundColor: isSelected ? `${p}08` : '#fff',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#faf8f5' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#fff' }}
            >
              {/* Image or gradient tile */}
              {service.image_url ? (
                <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                  <Image src={service.image_url} alt={service.name_ar} fill style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{
                  flexShrink: 0, width: 56, height: 56, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(145deg, ${p}18, ${p}30)`,
                  fontSize: 22,
                }}>
                  ✨
                </div>
              )}

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 800, fontSize: 14, color: '#1a0f0a', margin: '0 0 3px', lineHeight: 1.3 }}>
                  {service.name_ar}
                </h3>
                {service.description_ar && (
                  <p style={{ fontSize: 11, color: '#a89080', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {service.description_ar}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#1a0f0a' }}>
                    {formatCurrency(service.price)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#a89080', fontWeight: 600 }}>
                    <Clock size={10} />
                    {service.duration_minutes} د
                  </span>
                </div>
              </div>

              {/* Selection indicator */}
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
                backgroundColor: isSelected ? '#1a0f0a' : 'transparent',
                border: isSelected ? 'none' : '1.5px solid rgba(26,15,10,0.2)',
              }}>
                {isSelected
                  ? <Check size={13} color="#fff" />
                  : <span style={{ fontSize: 16, color: 'rgba(26,15,10,0.2)', lineHeight: 1 }}>+</span>
                }
              </div>
            </button>
          )
        })}
      </div>

      {/* Sticky bottom summary */}
      {state.selectedServices.length > 0 && (
        <div style={{
          position: 'sticky', bottom: 0,
          backgroundColor: '#fff',
          border: '1px solid rgba(26,15,10,0.1)',
          borderRadius: 4,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          boxShadow: '0 -4px 24px rgba(26,15,10,0.08)',
        }}>
          <div>
            <p style={{ fontSize: 11, color: '#a89080', fontWeight: 700, margin: 0, letterSpacing: '0.03em' }}>
              {state.selectedServices.length} خدمة · {totalDuration} دقيقة
            </p>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#1a0f0a', margin: '2px 0 0', letterSpacing: '-0.02em' }}>
              {formatCurrency(totalPrice)}
            </p>
          </div>
          <button
            onClick={onNext}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: '#1a0f0a', color: '#fff', border: 'none',
              borderRadius: 999, padding: '12px 24px', fontSize: 13, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em',
            }}
          >
            التالي
            <ArrowLeft size={14} />
          </button>
        </div>
      )}

      {state.selectedServices.length === 0 && (
        <p style={{ textAlign: 'center', color: '#a89080', fontSize: 12, fontWeight: 600, margin: 0 }}>
          اختاري خدمة أو أكثر للمتابعة
        </p>
      )}
    </div>
  )
}
