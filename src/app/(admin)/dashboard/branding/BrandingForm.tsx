'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Palette, Save, CheckCircle } from 'lucide-react'

const COLOR_PRESETS = [
  { name: 'وردي ذهبي (افتراضي)', primary: '#b06b7a', secondary: '#c9a84c', accent: '#d4a853' },
  { name: 'أرجواني فاخر', primary: '#7c3aed', secondary: '#a855f7', accent: '#c084fc' },
  { name: 'ذهبي كلاسيك', primary: '#b45309', secondary: '#d97706', accent: '#f59e0b' },
  { name: 'وردي ناعم', primary: '#db2777', secondary: '#ec4899', accent: '#f472b6' },
  { name: 'تيفاني بلو', primary: '#0d9488', secondary: '#14b8a6', accent: '#2dd4bf' },
  { name: 'أسود أنيق', primary: '#1f2937', secondary: '#374151', accent: '#6b7280' },
]

interface Props {
  tenantId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any
}

export function BrandingForm({ tenantId, initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    salon_name: initialData?.salon_name || '',
    tagline_ar: initialData?.tagline_ar || '',
    primary_color: initialData?.primary_color || '#b06b7a',
    secondary_color: initialData?.secondary_color || '#c9a84c',
    accent_color: initialData?.accent_color || '#d4a853',
    whatsapp_number: initialData?.whatsapp_number || '',
    instagram_handle: initialData?.instagram_handle || '',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function save() {
    setLoading(true)
    setSaved(false)
    await supabase.from('tenant_profiles').update({
      salon_name: form.salon_name,
      tagline_ar: form.tagline_ar,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      accent_color: form.accent_color,
      whatsapp_number: form.whatsapp_number,
      instagram_handle: form.instagram_handle,
    }).eq('tenant_id', tenantId)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '1px solid #e5e5e5', fontSize: 14, color: '#1a1a1a',
    backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>الهوية البصرية</h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0 0' }}>تخصيص ألوان وبيانات الصالون</p>
      </div>

      {/* Salon Info */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 16 }}>بيانات الصالون</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'salon_name', label: 'اسم الصالون', placeholder: 'صالون لوكس', dir: 'rtl' as const },
            { key: 'tagline_ar', label: 'الشعار (Tagline)', placeholder: 'جمالك، لحظتك', dir: 'rtl' as const },
            { key: 'whatsapp_number', label: 'رقم واتساب', placeholder: '966501234567', dir: 'ltr' as const },
            { key: 'instagram_handle', label: 'حساب انستغرام', placeholder: '@luxesalon', dir: 'ltr' as const },
          ].map(({ key, label, placeholder, dir }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#333', display: 'block', marginBottom: 6 }}>
                {label}
              </label>
              <input
                style={inputStyle}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                dir={dir}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Palette size={16} />
          الألوان
        </h2>

        {/* Presets */}
        <p style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 10 }}>باقات الألوان الجاهزة</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => setForm(f => ({
                ...f,
                primary_color: preset.primary,
                secondary_color: preset.secondary,
                accent_color: preset.accent,
              }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 10,
                border: '1px solid #e5e5e5', backgroundColor: '#fafafa',
                cursor: 'pointer', textAlign: 'right',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {[preset.primary, preset.secondary, preset.accent].map(c => (
                  <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: c }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#333' }}>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom color pickers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { key: 'primary_color', label: 'اللون الرئيسي' },
            { key: 'secondary_color', label: 'اللون الثانوي' },
            { key: 'accent_color', label: 'لون التمييز' },
          ].map(({ key, label }) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                type="color"
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #e5e5e5', cursor: 'pointer', padding: 2 }}
              />
              <p style={{ fontSize: 11, color: '#888', marginTop: 4, fontFamily: 'monospace' }}>
                {form[key as keyof typeof form]}
              </p>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div style={{ padding: 16, borderRadius: 10, backgroundColor: `${form.primary_color}18` }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: '#333' }}>معاينة الألوان</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '8px 16px', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: form.primary_color }}>
              احجزي الآن
            </button>
            <button style={{ padding: '8px 16px', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: form.secondary_color }}>
              التفاصيل
            </button>
            <span style={{ padding: '8px 12px', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, backgroundColor: form.accent_color }}>
              جديد
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={save}
        disabled={loading}
        style={{
          width: '100%', height: 44, borderRadius: 12, border: 'none',
          backgroundColor: saved ? '#16a34a' : form.primary_color,
          color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background-color 0.3s',
        }}
      >
        {saved ? (
          <><CheckCircle size={18} /> تم الحفظ</>
        ) : loading ? (
          'جارٍ الحفظ...'
        ) : (
          <><Save size={18} /> حفظ التغييرات</>
        )}
      </button>
    </div>
  )
}
