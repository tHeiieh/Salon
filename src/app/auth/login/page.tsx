'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Sparkles, ArrowLeft, Mail, KeyRound } from 'lucide-react'

type AuthMode = 'password' | 'otp'
type OtpStep = 'email' | 'code'

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('password')
  // --- password state ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // --- otp state ---
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState<OtpStep>('email')
  // --- shared ---
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const router = useRouter()

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
      return
    }
    if (data.user) window.location.href = '/auth/callback'
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: otpEmail,
      options: { shouldCreateUser: false },
    })
    if (otpError) {
      setError(otpError.message === 'Signups not allowed for otp'
        ? 'هذا البريد الإلكتروني غير مسجل في النظام'
        : 'تعذر إرسال رمز التحقق، تحقق من البريد الإلكتروني')
      setLoading(false)
      return
    }
    setOtpStep('code')
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: otpEmail,
      token: otpCode,
      type: 'email',
    })
    if (verifyError) {
      setError('رمز التحقق غير صحيح أو منتهي الصلاحية')
      setLoading(false)
      return
    }
    if (data.user) window.location.href = '/auth/callback'
  }

  const inputBase: React.CSSProperties = {
    width: '100%', height: 52, borderRadius: 14,
    padding: '0 16px', fontSize: 14, color: '#1a0f0d',
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>

      {/* ── LEFT decorative panel ── */}
      <div className="login-deco" style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        flex: 1, padding: 48, position: 'relative', overflow: 'hidden',
        backgroundImage: 'linear-gradient(145deg, #C2847A 0%, #b06b7a 40%, #d4a96a 100%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%', border: '1px solid white',
              width: `${(i + 1) * 160}px`, height: `${(i + 1) * 160}px`,
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            }} />
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>صالوني</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Saloni Platform</p>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 44 }}>💅</span>
          </div>
          <h2 style={{ color: 'white', fontSize: 32, fontWeight: 900, lineHeight: 1.3, marginBottom: 16 }}>
            منصة إدارة<br />الصالونات الذكية
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.8, maxWidth: 320 }}>
            أدر صالونك بكفاءة عالية، تتبع الحجوزات، راقب الأداء، وقدم تجربة استثنائية لعميلاتك.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
            {['حجز ذكي', 'تقارير فورية', 'إشعارات واتساب', 'دفع إلكتروني'].map(f => (
              <span key={f} style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 999 }}>{f}</span>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16, padding: '16px 20px' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.7, fontStyle: 'italic' }}>
              "منذ استخدمت صالوني، تضاعفت حجوزاتنا وأصبحت إدارة الفريق أسهل بكثير."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👩</div>
              <div>
                <p style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>نورة العتيبي</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>صاحبة صالون لمسة</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT login panel ── */}
      <div className="login-panel" style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px', backgroundColor: 'white', overflowY: 'auto' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundImage: 'linear-gradient(135deg, #C2847A, #d4a96a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: 20, height: 20, color: 'white' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#2d1f1a' }}>صالوني</p>
            <p style={{ fontSize: 11, color: '#9a7e78' }}>منصة إدارة الصالونات</p>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#fdf4f3', border: '1px solid #f0dbd8', borderRadius: 999, padding: '5px 14px', marginBottom: 14 }}>
            <span style={{ fontSize: 13 }}>✨</span>
            <span style={{ fontSize: 12, color: '#C2847A', fontWeight: 700 }}>لوحة تحكم المالكة</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a0f0d', lineHeight: 1.3, marginBottom: 8 }}>أهلاً بعودتك 👋</h1>
          <p style={{ fontSize: 14, color: '#9a7e78', lineHeight: 1.6 }}>سجّلي دخولك للوصول إلى لوحة تحكم صالونك</p>
        </div>

        {/* Auth mode tabs */}
        <div style={{ display: 'flex', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4, marginBottom: 28, gap: 4 }}>
          {([['password', 'كلمة المرور'], ['otp', 'رمز OTP']] as const).map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(null) }}
              style={{
                flex: 1, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                ...(mode === m
                  ? { backgroundColor: 'white', color: '#C2847A', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
                  : { backgroundColor: 'transparent', color: '#6b7280' }),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── PASSWORD FORM ── */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#3d2820', marginBottom: 8 }}>البريد الإلكتروني</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="example@email.com" required dir="ltr"
                style={{ ...inputBase, border: `1.5px solid ${focused === 'email' ? '#C2847A' : '#e8dbd8'}`, backgroundColor: focused === 'email' ? '#fff9f8' : '#fafafa', boxShadow: focused === 'email' ? '0 0 0 3px rgba(194,132,122,0.15)' : 'none' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#3d2820' }}>كلمة المرور</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="••••••••" required
                  style={{ ...inputBase, border: `1.5px solid ${focused === 'password' ? '#C2847A' : '#e8dbd8'}`, backgroundColor: focused === 'password' ? '#fff9f8' : '#fafafa', padding: '0 48px 0 48px', letterSpacing: showPassword ? 0 : 2, boxShadow: focused === 'password' ? '0 0 0 3px rgba(194,132,122,0.15)' : 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#c4a89e', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
            {error && <ErrorBox message={error} />}
            <SubmitButton loading={loading} label="تسجيل الدخول" />
          </form>
        )}

        {/* ── OTP FORM ── */}
        {mode === 'otp' && (
          <div>
            {otpStep === 'email' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ padding: 16, backgroundColor: '#f0f9ff', borderRadius: 12, border: '1px solid #bae6fd', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Mail size={18} style={{ color: '#0284c7', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: '#0369a1', margin: 0 }}>
                    سيتم إرسال رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#3d2820', marginBottom: 8 }}>البريد الإلكتروني</label>
                  <input type="email" value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                    onFocus={() => setFocused('otpEmail')} onBlur={() => setFocused(null)}
                    placeholder="example@email.com" required dir="ltr"
                    style={{ ...inputBase, border: `1.5px solid ${focused === 'otpEmail' ? '#C2847A' : '#e8dbd8'}`, backgroundColor: focused === 'otpEmail' ? '#fff9f8' : '#fafafa', boxShadow: focused === 'otpEmail' ? '0 0 0 3px rgba(194,132,122,0.15)' : 'none' }}
                  />
                </div>
                {error && <ErrorBox message={error} />}
                <SubmitButton loading={loading} label="إرسال رمز التحقق" icon={<Mail size={18} />} />
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#fdf4f3', border: '2px solid #C2847A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <KeyRound size={24} style={{ color: '#C2847A' }} />
                  </div>
                  <p style={{ fontSize: 14, color: '#1a0f0d', fontWeight: 700 }}>تم إرسال رمز التحقق</p>
                  <p style={{ fontSize: 13, color: '#9a7e78' }}>تحققي من بريدك: <strong>{otpEmail}</strong></p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#3d2820', marginBottom: 8 }}>رمز التحقق (6 أرقام)</label>
                  <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000" required dir="ltr" inputMode="numeric" maxLength={6}
                    style={{ ...inputBase, letterSpacing: 8, fontSize: 24, fontWeight: 700, textAlign: 'center', border: `1.5px solid ${focused === 'otp' ? '#C2847A' : '#e8dbd8'}`, backgroundColor: '#fafafa', boxShadow: focused === 'otp' ? '0 0 0 3px rgba(194,132,122,0.15)' : 'none' }}
                    onFocus={() => setFocused('otp')} onBlur={() => setFocused(null)}
                  />
                </div>
                {error && <ErrorBox message={error} />}
                <SubmitButton loading={loading} label="تحقق والدخول" />
                <button type="button" onClick={() => { setOtpStep('email'); setOtpCode(''); setError(null) }}
                  style={{ background: 'none', border: 'none', color: '#C2847A', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>
                  إعادة إرسال الرمز
                </button>
              </form>
            )}
          </div>
        )}

        {/* Demo credentials (password mode only) */}
        {mode === 'password' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: '#f0e8e6' }} />
              <span style={{ fontSize: 12, color: '#c4a89e', fontWeight: 600 }}>أو</span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#f0e8e6' }} />
            </div>
            <div style={{ backgroundImage: 'linear-gradient(135deg, #fdf8f7, #fdf4f0)', border: '1px solid #f0dbd8', borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>🔑</span>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#3d2820' }}>بيانات الدخول التجريبية</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'البريد الإلكتروني', value: 'owner@luxe.sa', action: () => setEmail('owner@luxe.sa') },
                  { label: 'كلمة المرور', value: 'Luxe1234!', action: () => setPassword('Luxe1234!') },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, padding: '8px 12px', border: '1px solid #f0dbd8' }}>
                    <span style={{ fontSize: 11, color: '#9a7e78', fontWeight: 600 }}>{item.label}</span>
                    <button type="button" onClick={item.action} style={{ fontSize: 12, color: '#C2847A', fontWeight: 700, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}>
                      {item.value}
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#c4a89e', marginTop: 10, textAlign: 'center' }}>انقري على البيانات لملئها تلقائياً</p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-deco { display: none !important; }
          .login-panel { max-width: 100% !important; padding: 32px 20px !important; }
        }
      `}</style>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', backgroundColor: '#fff2f2', border: '1px solid #fecaca', borderRadius: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p style={{ fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>{message}</p>
    </div>
  )
}

function SubmitButton({ loading, label, icon }: { loading: boolean; label: string; icon?: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', height: 54, borderRadius: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      backgroundImage: loading ? 'linear-gradient(135deg, #d4a89e, #d4a89e)' : 'linear-gradient(135deg, #C2847A 0%, #b06470 50%, #C2847A 100%)',
      color: 'white', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: loading ? 'none' : '0 8px 24px -4px rgba(194,132,122,0.5)', transition: 'all 0.3s',
    }}>
      {loading ? (
        <svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ) : icon}
      {loading ? 'جارٍ التحقق...' : label}
      {!loading && !icon && <ArrowLeft style={{ width: 18, height: 18 }} />}
    </button>
  )
}
