'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<'email' | 'password' | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
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

    if (data.user) {
      // Full navigation so session cookies are flushed before the server reads them
      window.location.href = '/auth/callback'
    }
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
      }}
    >
      {/* ── LEFT PANEL: decorative ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(145deg, #C2847A 0%, #b06b7a 40%, #d4a96a 100%)',
        }}
      >
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07 }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                borderRadius: '50%',
                border: '1px solid white',
                width: `${(i + 1) * 160}px`,
                height: `${(i + 1) * 160}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Sparkles style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>صالوني</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500 }}>Saloni Platform</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          {/* Big decorative icon */}
          <div
            style={{
              width: 96, height: 96, borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 44 }}>💅</span>
          </div>

          <h2 style={{ color: 'white', fontSize: 32, fontWeight: 900, lineHeight: 1.3, marginBottom: 16 }}>
            منصة إدارة<br />الصالونات الذكية
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.8, maxWidth: 320 }}>
            أدر صالونك بكفاءة عالية، تتبع الحجوزات، راقب الأداء، وقدم تجربة استثنائية لعميلاتك.
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
            {['حجز ذكي', 'تقارير فورية', 'إشعارات واتساب', 'دفع إلكتروني'].map(f => (
              <span
                key={f}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: 999,
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 16,
              padding: '16px 20px',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.7, fontStyle: 'italic' }}>
              "منذ استخدمت صالوني، تضاعفت حجوزاتنا وأصبحت إدارة الفريق أسهل بكثير."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                👩
              </div>
              <div>
                <p style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>نورة العتيبي</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>صاحبة صالون لمسة</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: login form ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 40px',
          backgroundColor: 'white',
          position: 'relative',
        }}
      >
        {/* Top brand mark (small screens: shown; on large the left panel covers it) */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundImage: 'linear-gradient(135deg, #C2847A, #d4a96a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Sparkles style={{ width: 20, height: 20, color: 'white' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#2d1f1a' }}>صالوني</p>
            <p style={{ fontSize: 11, color: '#9a7e78' }}>منصة إدارة الصالونات</p>
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#fdf4f3',
              border: '1px solid #f0dbd8',
              borderRadius: 999,
              padding: '5px 14px',
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 13 }}>✨</span>
            <span style={{ fontSize: 12, color: '#C2847A', fontWeight: 700 }}>لوحة تحكم المالكة</span>
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#1a0f0d',
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            أهلاً بعودتك 👋
          </h1>
          <p style={{ fontSize: 14, color: '#9a7e78', lineHeight: 1.6 }}>
            سجّلي دخولك للوصول إلى لوحة تحكم صالونك
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: '#3d2820',
                marginBottom: 8,
              }}
            >
              البريد الإلكتروني
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="example@email.com"
                required
                dir="ltr"
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 14,
                  border: `1.5px solid ${focused === 'email' ? '#C2847A' : error ? '#ef4444' : '#e8dbd8'}`,
                  backgroundColor: focused === 'email' ? '#fff9f8' : '#fafafa',
                  padding: '0 16px',
                  fontSize: 14,
                  color: '#1a0f0d',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: focused === 'email' ? '0 0 0 3px rgba(194,132,122,0.15)' : 'none',
                }}
              />
              {/* mail icon */}
              <div
                style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: focused === 'email' ? '#C2847A' : '#c4a89e',
                  transition: 'color 0.2s',
                  pointerEvents: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Password field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label
                htmlFor="password"
                style={{ fontSize: 13, fontWeight: 700, color: '#3d2820' }}
              >
                كلمة المرور
              </label>
              <button
                type="button"
                style={{
                  fontSize: 12,
                  color: '#C2847A',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                نسيتِ كلمة المرور؟
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 14,
                  border: `1.5px solid ${focused === 'password' ? '#C2847A' : error ? '#ef4444' : '#e8dbd8'}`,
                  backgroundColor: focused === 'password' ? '#fff9f8' : '#fafafa',
                  padding: '0 48px 0 48px',
                  fontSize: 15,
                  color: '#1a0f0d',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: focused === 'password' ? '0 0 0 3px rgba(194,132,122,0.15)' : 'none',
                  letterSpacing: showPassword ? 0 : 2,
                }}
              />
              {/* lock icon */}
              <div
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  color: focused === 'password' ? '#C2847A' : '#c4a89e',
                  transition: 'color 0.2s',
                  pointerEvents: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              {/* show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#c4a89e',
                  backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C2847A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#c4a89e')}
              >
                {showPassword
                  ? <EyeOff style={{ width: 16, height: 16 }} />
                  : <Eye style={{ width: 16, height: 16 }} />
                }
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                backgroundColor: '#fff2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 16,
              backgroundImage: loading
                ? 'linear-gradient(135deg, #d4a89e 0%, #d4a89e 100%)'
                : 'linear-gradient(135deg, #C2847A 0%, #b06470 50%, #C2847A 100%)',
              color: 'white',
              fontSize: 15,
              fontWeight: 800,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.3s',
              boxShadow: loading ? 'none' : '0 8px 24px -4px rgba(194,132,122,0.5)',
              marginTop: 4,
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 12px 28px -4px rgba(194,132,122,0.6)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 24px -4px rgba(194,132,122,0.5)'
            }}
          >
            {loading ? (
              <>
                <svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                جارٍ تسجيل الدخول...
              </>
            ) : (
              <>
                تسجيل الدخول
                <ArrowLeft style={{ width: 18, height: 18 }} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '28px 0',
          }}
        >
          <div style={{ flex: 1, height: 1, backgroundColor: '#f0e8e6' }} />
          <span style={{ fontSize: 12, color: '#c4a89e', fontWeight: 600 }}>أو</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#f0e8e6' }} />
        </div>

        {/* Demo credentials hint */}
        <div
          style={{
            backgroundImage: 'linear-gradient(135deg, #fdf8f7, #fdf4f0)',
            border: '1px solid #f0dbd8',
            borderRadius: 16,
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🔑</span>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#3d2820' }}>بيانات الدخول التجريبية</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'white', borderRadius: 10, padding: '8px 12px',
                border: '1px solid #f0dbd8',
              }}
            >
              <span style={{ fontSize: 11, color: '#9a7e78', fontWeight: 600 }}>البريد الإلكتروني</span>
              <button
                type="button"
                onClick={() => setEmail('owner@luxe.sa')}
                style={{
                  fontSize: 12, color: '#C2847A', fontWeight: 700,
                  backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                owner@luxe.sa
              </button>
            </div>
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'white', borderRadius: 10, padding: '8px 12px',
                border: '1px solid #f0dbd8',
              }}
            >
              <span style={{ fontSize: 11, color: '#9a7e78', fontWeight: 600 }}>كلمة المرور</span>
              <button
                type="button"
                onClick={() => setPassword('Luxe1234!')}
                style={{
                  fontSize: 12, color: '#C2847A', fontWeight: 700,
                  backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                Luxe1234!
              </button>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#c4a89e', marginTop: 10, textAlign: 'center' }}>
            انقري على البيانات لملئها تلقائياً
          </p>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#c4a89e',
            marginTop: 32,
            lineHeight: 1.7,
          }}
        >
          بتسجيل الدخول، أنتِ توافقين على{' '}
          <span style={{ color: '#C2847A', fontWeight: 600, cursor: 'pointer' }}>شروط الاستخدام</span>
          {' '}و{' '}
          <span style={{ color: '#C2847A', fontWeight: 600, cursor: 'pointer' }}>سياسة الخصوصية</span>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
