'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Save, CheckCircle, Settings, Clock, Percent } from 'lucide-react'

const SAUDI_CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام',
  'الخبر', 'الطائف', 'تبوك', 'بريدة', 'أبها',
]

interface Props {
  tenantId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any
}

export function SettingsForm({ tenantId, initialData }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    city: initialData?.city || 'الرياض',
    vat_number: initialData?.vat_number || '',
    booking_advance_hours: initialData?.booking_advance_hours || 2,
    booking_window_days: initialData?.booking_window_days || 14,
    deposit_percentage: initialData?.deposit_percentage || 0,
    cancellation_hours: initialData?.cancellation_hours || 24,
    working_start: initialData?.working_hours_start || '09:00',
    working_end: initialData?.working_hours_end || '21:00',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function save() {
    setLoading(true)
    setSaved(false)
    await supabase.from('tenant_profiles').update({
      city: form.city,
      vat_number: form.vat_number || null,
      booking_advance_hours: form.booking_advance_hours,
      booking_window_days: form.booking_window_days,
      deposit_percentage: form.deposit_percentage,
      cancellation_hours: form.cancellation_hours,
      working_hours_start: form.working_start,
      working_hours_end: form.working_end,
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
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>الإعدادات</h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0 0' }}>إعدادات الحجز والتشغيل</p>
      </div>

      {/* General */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={16} />
          إعدادات عامة
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#333', display: 'block', marginBottom: 6 }}>المدينة</label>
            <select
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              style={inputStyle}
            >
              {SAUDI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#333', display: 'block', marginBottom: 6 }}>
              الرقم الضريبي (اختياري)
            </label>
            <input
              style={{ ...inputStyle }}
              value={form.vat_number}
              onChange={e => setForm(f => ({ ...f, vat_number: e.target.value }))}
              placeholder="300000000000003"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Booking */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} />
          إعدادات الحجز
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#333', display: 'block', marginBottom: 6 }}>الحد الأدنى للحجز (ساعة)</label>
              <input type="number" style={inputStyle} value={form.booking_advance_hours}
                onChange={e => setForm(f => ({ ...f, booking_advance_hours: Number(e.target.value) }))} min={1} max={72} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#333', display: 'block', marginBottom: 6 }}>نافذة الحجز (يوم)</label>
              <input type="number" style={inputStyle} value={form.booking_window_days}
                onChange={e => setForm(f => ({ ...f, booking_window_days: Number(e.target.value) }))} min={7} max={60} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#333', display: 'block', marginBottom: 6 }}>مهلة الإلغاء (ساعة)</label>
            <input type="number" style={inputStyle} value={form.cancellation_hours}
              onChange={e => setForm(f => ({ ...f, cancellation_hours: Number(e.target.value) }))} min={1} max={72} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#333', display: 'block', marginBottom: 6 }}>بداية العمل</label>
              <input type="time" style={inputStyle} value={form.working_start}
                onChange={e => setForm(f => ({ ...f, working_start: e.target.value }))} dir="ltr" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#333', display: 'block', marginBottom: 6 }}>نهاية العمل</label>
              <input type="time" style={inputStyle} value={form.working_end}
                onChange={e => setForm(f => ({ ...f, working_end: e.target.value }))} dir="ltr" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Percent size={16} />
          إعدادات الدفع
        </h2>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#333', display: 'block', marginBottom: 6 }}>
            نسبة العربون % (0 = معطّل)
          </label>
          <input type="number" style={inputStyle} value={form.deposit_percentage}
            onChange={e => setForm(f => ({ ...f, deposit_percentage: Number(e.target.value) }))} min={0} max={100} />
          <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>
            إذا كانت النسبة أكبر من صفر، ستظهر خيار &quot;عربون مسبق&quot; عند الحجز
          </p>
        </div>
      </div>

      <button
        onClick={save}
        disabled={loading}
        style={{
          width: '100%', height: 44, borderRadius: 12, border: 'none',
          backgroundColor: saved ? '#16a34a' : '#C2847A',
          color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
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
          <><Save size={18} /> حفظ الإعدادات</>
        )}
      </button>
    </div>
  )
}
