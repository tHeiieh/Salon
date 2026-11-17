'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, Check, Clock, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="space-y-6 page-enter">
      <div>
        <h2 className="text-2xl font-bold text-foreground">اختاري الخدمة</h2>
        <p className="text-muted-foreground text-sm mt-1">يمكنك اختيار أكثر من خدمة</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setActiveCat(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCat === null
              ? 'text-white shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          style={activeCat === null ? { backgroundColor: primaryColor } : undefined}
        >
          الكل
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCat === cat.id
                ? 'text-white shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            style={activeCat === cat.id ? { backgroundColor: primaryColor } : undefined}
          >
            {cat.icon && <span className="ml-1">{cat.icon}</span>}
            {cat.name_ar}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-3">
        {activeServices.map(service => {
          const isSelected = selectedIds.has(service.id)
          return (
            <button
              key={service.id}
              onClick={() => toggleService(service)}
              className={`
                w-full text-right flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200
                ${isSelected
                  ? 'shadow-md scale-[1.01]'
                  : 'border-border/50 bg-white hover:border-primary/30 hover:shadow-sm'
                }
              `}
              style={isSelected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : undefined}
            >
              {service.image_url && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={service.image_url} alt={service.name_ar} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{service.name_ar}</h3>
                {service.description_ar && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{service.description_ar}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-bold text-sm" style={{ color: primaryColor }}>
                    {formatCurrency(service.price)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {service.duration_minutes} د
                  </span>
                </div>
              </div>
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
                  ${isSelected ? 'text-white' : 'border-border bg-transparent'}
                `}
                style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
              >
                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom Cart */}
      {state.selectedServices.length > 0 && (
        <div
          className="sticky bottom-6 bg-white rounded-2xl shadow-xl border p-4 flex items-center justify-between gap-4"
          style={{ borderColor: `${primaryColor}30` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{state.selectedServices.length} خدمة</p>
              <p className="text-xs text-muted-foreground">
                {totalDuration} دقيقة • {formatCurrency(totalPrice)}
              </p>
            </div>
          </div>
          <Button
            onClick={onNext}
            style={{ backgroundColor: primaryColor }}
            className="rounded-xl px-6"
          >
            التالي
          </Button>
        </div>
      )}

      {state.selectedServices.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-3">✨</div>
          <p>اختاري الخدمات التي تريدينها</p>
        </div>
      )}
    </div>
  )
}
