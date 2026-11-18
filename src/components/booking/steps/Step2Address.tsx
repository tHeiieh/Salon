'use client'

import { useState, useEffect } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { SAUDI_CITIES } from '@/lib/utils'
import type { TenantProfile, BookingState, CoverageArea } from '@/types'

interface Props {
  tenant: TenantProfile
  state: BookingState
  updateState: (u: Partial<BookingState>) => void
  onNext: () => void
  primaryColor: string
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, borderRadius: 12, border: '1px solid #e5e7eb',
  padding: '0 16px', fontSize: 14, backgroundColor: '#fff',
  outline: 'none', boxSizing: 'border-box', color: '#1a1a1a',
  appearance: 'none' as const,
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6,
}

export function Step2Address({ tenant, state, updateState, onNext, primaryColor }: Props) {
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [street, setStreet] = useState('')
  const [building, setBuilding] = useState('')
  const [instructions, setInstructions] = useState('')
  const [checking, setChecking] = useState(false)
  const [coverageError, setCoverageError] = useState<string | null>(null)

  useEffect(() => {
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
        district_en: area.district_name_en || '',
        street,
        building,
        instructions,
      },
      coverageArea: area,
    })
    setChecking(false)
    onNext()
  }

  const selectedArea = coverageAreas.find(a => a.city_name_ar === selectedCity && a.district_name_ar === selectedDistrict)
  const canContinue = selectedCity && selectedDistrict

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>عنوان الخدمة</h2>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>أين تريدين أن تصلك الخدمة؟</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* City */}
        <div>
          <label style={labelStyle}>المدينة</label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCity}
              onChange={e => { setSelectedCity(e.target.value); setSelectedDistrict('') }}
              style={inputStyle}
            >
              <option value="">اختاري المدينة</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* District */}
        {selectedCity && (
          <div>
            <label style={labelStyle}>الحي</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                style={inputStyle}
              >
                <option value="">اختاري الحي</option>
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
            </div>
          </div>
        )}

        {/* Street and Building */}
        {selectedDistrict && (
          <>
            <div>
              <label style={labelStyle}>اسم الشارع (اختياري)</label>
              <input
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder="مثال: شارع الملك فهد"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>رقم المبنى</label>
              <input
                value={building}
                onChange={e => setBuilding(e.target.value)}
                placeholder="٢٣"
                style={{ ...inputStyle, maxWidth: 160 }}
              />
            </div>
            <div>
              <label style={labelStyle}>تعليمات إضافية (اختياري)</label>
              <input
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="مثال: بالقرب من المسجد، الطابق الثاني..."
                style={inputStyle}
              />
            </div>
          </>
        )}

        {/* Coverage Error */}
        {coverageError && (
          <div style={{ padding: 16, backgroundColor: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
            {coverageError}
          </div>
        )}

        {/* Travel fee preview */}
        {selectedArea && (
          selectedArea.travel_fee > 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 12,
              borderRadius: 12, border: `1px solid ${primaryColor}30`,
              backgroundColor: `${primaryColor}08`,
            }}>
              <MapPin size={18} style={{ flexShrink: 0, color: primaryColor }} />
              <p style={{ fontSize: 13, color: '#1a1a1a', margin: 0 }}>
                رسوم زيارة منزلية: <strong>{selectedArea.travel_fee} ريال</strong>
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 12,
              borderRadius: 12, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4',
            }}>
              <MapPin size={18} style={{ flexShrink: 0, color: '#16a34a' }} />
              <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>زيارة مجانية لهذه المنطقة ✓</p>
            </div>
          )
        )}
      </div>

      <button
        onClick={handleContinue}
        disabled={!canContinue || checking}
        style={{
          width: '100%', height: 48, borderRadius: 12, border: 'none',
          backgroundColor: !canContinue || checking ? '#d1d5db' : primaryColor,
          color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: !canContinue || checking ? 'not-allowed' : 'pointer',
        }}
      >
        {checking ? 'جاري التحقق...' : 'تأكيد العنوان والمتابعة'}
      </button>
    </div>
  )
}
