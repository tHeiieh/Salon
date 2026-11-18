'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, KeyRound, Calendar, MapPin, CheckCircle, Clock, XCircle, LogOut, Sparkles } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

type Step = 'email' | 'code' | 'portal'

interface Appointment {
  id: string
  booking_number: string
  scheduled_date: string
  scheduled_start: string
  status: string
  final_price: number
  tenant_id: string
  appointment_services: { service_name_ar: string }[]
  customer_addresses: { district_ar: string; city_ar: string }[]
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:         { label: 'قيد الانتظار',    color: '#d97706', bg: '#fffbeb', icon: <Clock size={14} /> },
  confirmed:       { label: 'مؤكد',           color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle size={14} /> },
  in_progress:     { label: 'جارٍ',           color: '#2563eb', bg: '#eff6ff', icon: <Clock size={14} /> },
  completed:       { label: 'مكتمل',          color: '#059669', bg: '#ecfdf5', icon: <CheckCircle size={14} /> },
  cancelled:       { label: 'ملغى',           color: '#dc2626', bg: '#fef2f2', icon: <XCircle size={14} /> },
  payment_pending: { label: 'بانتظار الدفع',   color: '#7c3aed', bg: '#f5f3ff', icon: <Clock size={14} /> },
}

export default function AccountClient() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppts, setLoadingAppts] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // Check if already signed in
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setStep('portal')
        loadAppointments(data.user.email!)
      }
    })
  }, [])

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setError('تعذر إرسال رمز التحقق، تحقق من البريد الإلكتروني')
      setLoading(false)
      return
    }
    setStep('code')
    setLoading(false)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    if (error || !data.user) {
      setError('رمز التحقق غير صحيح أو منتهي الصلاحية')
      setLoading(false)
      return
    }
    setStep('portal')
    loadAppointments(email)
    setLoading(false)
  }

  async function loadAppointments(userEmail: string) {
    setLoadingAppts(true)
    const { data } = await supabase
      .from('appointments')
      .select(`
        id, booking_number, scheduled_date, scheduled_start, status, final_price, tenant_id,
        appointment_services(service_name_ar),
        customer_addresses(district_ar, city_ar)
      `)
      .order('scheduled_date', { ascending: false })
      .limit(20)
    setAppointments((data as unknown as Appointment[]) || [])
    setLoadingAppts(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setStep('email')
    setEmail('')
    setCode('')
    setAppointments([])
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 52, borderRadius: 14, padding: '0 16px', fontSize: 14,
    color: '#1a0f0d', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>

      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundImage: 'linear-gradient(135deg, #C2847A, #d4a96a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} style={{ color: 'white' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#1a1a1a', margin: 0 }}>صالوني</p>
            <p style={{ fontSize: 11, color: '#9a7e78', margin: 0 }}>حجوزاتي</p>
          </div>
        </div>
        {step === 'portal' && (
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            <LogOut size={14} />
            خروج
          </button>
        )}
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px' }}>

        {/* ── EMAIL STEP ── */}
        {step === 'email' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundImage: 'linear-gradient(135deg, #C2847A15, #d4a96a15)', border: '2px solid #C2847A30', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>💅</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>تسجيل الدخول</h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>أدخلي بريدك الإلكتروني لعرض حجوزاتك</p>
            </div>
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 14, backgroundColor: '#f0f9ff', borderRadius: 12, border: '1px solid #bae6fd', display: 'flex', gap: 10, alignItems: 'center' }}>
                <Mail size={16} style={{ color: '#0284c7', flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#0369a1', margin: 0 }}>سيصلك رمز تحقق مكون من 6 أرقام</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>البريد الإلكتروني</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="example@email.com" required dir="ltr"
                  style={{ ...inputStyle, border: `1.5px solid ${focused === 'email' ? '#C2847A' : '#e5e7eb'}`, backgroundColor: focused === 'email' ? '#fff9f8' : 'white', boxShadow: focused === 'email' ? '0 0 0 3px rgba(194,132,122,0.12)' : 'none' }}
                />
              </div>
              {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} style={{
                width: '100%', height: 50, borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                backgroundImage: 'linear-gradient(135deg, #C2847A, #d4a96a)', color: 'white',
                fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              }}>
                {loading ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
              </button>
            </form>
          </div>
        )}

        {/* ── CODE STEP ── */}
        {step === 'code' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#fdf4f3', border: '2px solid #C2847A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <KeyRound size={28} style={{ color: '#C2847A' }} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>أدخلي رمز التحقق</h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>تم إرسال الرمز إلى <strong>{email}</strong></p>
            </div>
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" required dir="ltr" inputMode="numeric" maxLength={6}
                onFocus={() => setFocused('code')} onBlur={() => setFocused(null)}
                style={{
                  ...inputStyle, letterSpacing: 10, fontSize: 28, fontWeight: 800, textAlign: 'center',
                  border: `1.5px solid ${focused === 'code' ? '#C2847A' : '#e5e7eb'}`,
                  backgroundColor: 'white', boxShadow: focused === 'code' ? '0 0 0 3px rgba(194,132,122,0.12)' : 'none',
                }}
              />
              {error && <p style={{ fontSize: 13, color: '#dc2626', textAlign: 'center', margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading || code.length < 6} style={{
                width: '100%', height: 50, borderRadius: 14, border: 'none',
                cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
                backgroundImage: code.length < 6 ? 'none' : 'linear-gradient(135deg, #C2847A, #d4a96a)',
                backgroundColor: code.length < 6 ? '#d1d5db' : 'transparent',
                color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              }}>
                {loading ? 'جارٍ التحقق...' : 'تأكيد الرمز والدخول'}
              </button>
              <button type="button" onClick={() => { setStep('email'); setCode(''); setError(null) }}
                style={{ background: 'none', border: 'none', color: '#C2847A', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
                تغيير البريد الإلكتروني
              </button>
            </form>
          </div>
        )}

        {/* ── PORTAL STEP ── */}
        {step === 'portal' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>حجوزاتي</h2>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{email}</p>
            </div>

            {loadingAppts ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 16 }} />)}
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>لا توجد حجوزات بعد</p>
                <p style={{ fontSize: 13, margin: 0 }}>حجوزاتك ستظهر هنا</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {appointments.map(appt => {
                  const st = STATUS_MAP[appt.status] || { label: appt.status, color: '#6b7280', bg: '#f5f5f5', icon: null }
                  return (
                    <div key={appt.id} style={{ backgroundColor: 'white', borderRadius: 16, border: '1px solid #f0f0f0', padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', margin: 0 }}>
                            {appt.appointment_services.map(s => s.service_name_ar).join(' • ')}
                          </p>
                          <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0', fontFamily: 'monospace' }}>{appt.booking_number}</p>
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, backgroundColor: st.bg, color: st.color, fontSize: 11, fontWeight: 600 }}>
                          {st.icon} {st.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                          <Calendar size={13} />
                          <span>{formatDate(appt.scheduled_date, 'PPP')} - {appt.scheduled_start?.substring(0, 5)}</span>
                        </div>
                        {appt.customer_addresses?.[0] && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                            <MapPin size={13} />
                            <span>{appt.customer_addresses[0].district_ar}، {appt.customer_addresses[0].city_ar}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ borderTop: '1px solid #f5f5f5', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>الإجمالي</span>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#C2847A' }}>{formatCurrency(appt.final_price)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
