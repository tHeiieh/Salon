'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SAUDI_CITIES } from '@/lib/utils'
import type { TenantProfile, CustomerAddress, BookingState, CoverageArea } from '@/types'

interface Props {
  tenant: TenantProfile
  state: BookingState
  updateState: (u: Partial<BookingState>) => void
  onNext: () => void
  primaryColor: string
}

export function Step2Address({ tenant, state, updateState, onNext, primaryColor }: Props) {
  const [mode, setMode] = useState<'select' | 'new'>('new')
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [street, setStreet] = useState('')
  const [building, setBuilding] = useState('')
  const [instructions, setInstructions] = useState('')
  const [checking, setChecking] = useState(false)
  const [coverageError, setCoverageError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch coverage areas for this tenant
    fetch(`/api/tenants/${state.tenantId}/coverage`)
      .then(r => r.json())
      .then(d => setCoverageAreas(d.areas || []))
      .catch(() => {})
  }, [state.tenantId])

  const availableCities = [...new Set(coverageAreas.map(a => a.city_name_ar))]

  const availableDistricts = coverageAreas
    .filter(a => a.city_name_ar === selectedCity)
    .map(a => a.district_name_ar)

  async function handleContinue() {
    if (!selectedCity || !selectedDistrict) return

    setChecking(true)
    setCoverageError(null)

    const area = coverageAreas.find(
      a => a.city_name_ar === selectedCity && a.district_name_ar === selectedDistrict
    )

    if (!area) {
      setCoverageError('عذراً، هذه المنطقة غير متاحة حالياً للخدمة المنزلية')
      setChecking(false)
      return
    }

    const cityEn = SAUDI_CITIES.find(c => c.name_ar === selectedCity)?.name_en || selectedCity

    updateState({
      newAddress: {
        label: 'المنزل',
        city_ar: selectedCity,
        city_en: cityEn,
        district_ar: selectedDistrict,
        district_en: area.district_name_en,
        street,
        building,
        instructions,
      },
      coverageArea: area,
    })
    setChecking(false)
    onNext()
  }

  const canContinue = selectedCity && selectedDistrict

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h2 className="text-2xl font-bold text-foreground">عنوان الخدمة</h2>
        <p className="text-muted-foreground text-sm mt-1">أين تريدين أن تصلك الخدمة؟</p>
      </div>

      <div className="space-y-4">
        {/* City */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">المدينة</label>
          <div className="relative">
            <select
              value={selectedCity}
              onChange={e => { setSelectedCity(e.target.value); setSelectedDistrict('') }}
              className="w-full h-11 rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
            >
              <option value="">اختاري المدينة</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* District */}
        {selectedCity && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">الحي</label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
              >
                <option value="">اختاري الحي</option>
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}

        {/* Street and Building */}
        {selectedDistrict && (
          <>
            <Input
              label="اسم الشارع (اختياري)"
              value={street}
              onChange={e => setStreet(e.target.value)}
              placeholder="مثال: شارع الملك فهد"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="رقم المبنى"
                value={building}
                onChange={e => setBuilding(e.target.value)}
                placeholder="٢٣"
              />
            </div>
            <Input
              label="تعليمات إضافية (اختياري)"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="مثال: بالقرب من المسجد، الطابق الثاني..."
            />
          </>
        )}

        {/* Coverage Error */}
        {coverageError && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
            {coverageError}
          </div>
        )}

        {/* Coverage area fee preview */}
        {selectedDistrict && coverageAreas.find(a => a.city_name_ar === selectedCity && a.district_name_ar === selectedDistrict) && (() => {
          const area = coverageAreas.find(a => a.city_name_ar === selectedCity && a.district_name_ar === selectedDistrict)!
          return area.travel_fee > 0 ? (
            <div
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}30` }}
            >
              <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
              <p className="text-sm text-foreground">
                رسوم زيارة منزلية: <strong>{area.travel_fee} ريال</strong>
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
              <MapPin className="w-5 h-5 flex-shrink-0 text-green-600" />
              <p className="text-sm text-green-700">زيارة مجانية لهذه المنطقة ✓</p>
            </div>
          )
        })()}
      </div>

      <Button
        className="w-full rounded-xl h-12 text-base"
        style={{ backgroundColor: primaryColor }}
        disabled={!canContinue || checking}
        loading={checking}
        onClick={handleContinue}
      >
        تأكيد العنوان والمتابعة
      </Button>
    </div>
  )
}
