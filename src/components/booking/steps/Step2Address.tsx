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

const field: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 4,
}

export function Step2Address({ tenant, state, updateState, onNext, primaryColor }: Props) {
  const p = primaryColor
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
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 16, height: 1, background: p }} />
          <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>STEP 2</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>عنوان الخدمة</h2>
        <p style={{ color: '#a89080', fontSize: 12, marginTop: 4, fontWeight: 600 }}>أين تريدين أن تصلك الخدمة؟</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* City */}
        <div style={field}>
          <label>المدينة</label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCity}
              onChange={e => { setSelectedCity(e.target.value); setSelectedDistrict('') }}
              style={{ width: '100%', boxSizing: 'border-box' as const }}
            >
              <option value="">اختاري المدينة</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a89080', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* District */}
        {selectedCity && (
          <div style={field}>
            <label>الحي</label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' as const }}
              >
                <option value="">اختاري الحي</option>
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a89080', pointerEvents: 'none' }} />
            </div>
          </div>
        )}

        {/* Street and Building */}
        {selectedDistrict && (
          <>
            <div style={field}>
              <label>اسم الشارع (اختياري)</label>
              <input
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder="مثال: شارع الملك فهد"
              />
            </div>
            <div style={field}>
              <label>رقم المبنى</label>
              <input
                value={building}
                onChange={e => setBuilding(e.target.value)}
                placeholder="٢٣"
                style={{ maxWidth: 160 }}
              />
            </div>
            <div style={field}>
              <label>تعليمات إضافية (اختياري)</label>
              <input
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="مثال: بالقرب من المسجد، الطابق الثاني..."
              />
            </div>
          </>
        )}

        {/* Coverage Error */}
        {coverageError && (
          <div style={{ padding: 14, backgroundColor: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
            {coverageError}
          </div>
        )}

        {/* Travel fee preview */}
        {selectedArea && (
          selectedArea.travel_fee > 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderRadius: 8, border: `1px solid ${p}30`, backgroundColor: `${p}08`,
            }}>
              <MapPin size={16} style={{ flexShrink: 0, color: p }} />
              <p style={{ fontSize: 13, color: '#1a0f0a', margin: 0, fontWeight: 600 }}>
                رسوم زيارة منزلية: <strong>{selectedArea.travel_fee} ريال</strong>
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderRadius: 8, border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4',
            }}>
              <MapPin size={16} style={{ flexShrink: 0, color: '#16a34a' }} />
              <p style={{ fontSize: 13, color: '#15803d', margin: 0, fontWeight: 600 }}>زيارة مجانية لهذه المنطقة ✓</p>
            </div>
          )
        )}
      </div>

      <button
        onClick={handleContinue}
        disabled={!canContinue || checking}
        style={{
          width: '100%', height: 50, borderRadius: 999, border: 'none',
          backgroundColor: !canContinue || checking ? 'rgba(26,15,10,0.1)' : '#1a0f0a',
          color: !canContinue || checking ? '#a89080' : '#fff',
          fontSize: 14, fontWeight: 800,
          cursor: !canContinue || checking ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.02em',
        }}
      >
        {checking ? 'جاري التحقق...' : 'تأكيد العنوان والمتابعة'}
      </button>
    </div>
  )
}
