'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Phone, Sparkles, ChevronLeft, Clock } from 'lucide-react'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { formatCurrency } from '@/lib/utils'
import type { TenantProfile, ServiceCategory, Employee, Service } from '@/types'

interface Props {
  tenant: TenantProfile
  categories: ServiceCategory[]
  employees: Employee[]
}

const COLLECTION_ITEMS = [
  { src: '/media/salon-1.jpg', label: 'العناية بالشعر', year: '٢٠٢٤', tall: true },
  { src: '/media/salon-2.jpg', label: 'مكياج احترافي', year: '٢٠٢٤', tall: false },
  { src: '/media/salon-3.jpg', label: 'تجفيف الشعر', year: '٢٠٢٥', tall: false },
  { src: '/media/salon-4.jpg', label: 'العناية بالبشرة', year: '٢٠٢٥', tall: true },
  { src: '/media/salon-5.jpg', label: 'تمليس الشعر', year: '٢٠٢٤', tall: false },
]

const SCROLL_SERVICES_CATEGORIES = ['الكل', 'شعر', 'مكياج', 'مانيكير', 'بشرة']

export function SalonLandingPage({ tenant, categories, employees }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [scrolled, setScrolled] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const allServices = categories.flatMap(c => (c.services || []).filter(s => s.is_active))
  const displayedServices = activeCategory === 'all'
    ? allServices
    : (categories.find(c => c.id === activeCategory)?.services || []).filter(s => s.is_active)

  function handleBookService(service: Service) {
    setSelectedServices([service])
    setBookingOpen(true)
  }

  function scrollToServices() {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (bookingOpen) {
    return (
      <BookingFlow
        tenant={tenant}
        initialServices={selectedServices}
        allCategories={categories}
        employees={employees}
        onClose={() => setBookingOpen(false)}
      />
    )
  }

  const p = tenant.primary_color || '#C2847A'
  const a = tenant.accent_color || '#D4A96A'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#faf8f5' }} dir="rtl">

      {/* ── FLOATING NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(250,248,245,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(194,132,122,0.12)' : 'none',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 24px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {tenant.logo_url ? (
              <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden' }}>
                <Image src={tenant.logo_url} alt={tenant.name_ar} width={36} height={36} style={{ objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `linear-gradient(135deg, ${p}, ${a})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={14} color="white" />
              </div>
            )}
            <span className="groovy-font" style={{
              fontWeight: 700, fontSize: 15, letterSpacing: '0.02em',
              color: scrolled ? '#1a0f0a' : '#fff',
              transition: 'color 0.3s',
              textShadow: scrolled ? 'none' : '0 1px 8px rgba(0,0,0,0.3)',
            }}>
              {tenant.name_ar}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={scrollToServices}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8,
                color: scrolled ? '#6b5c50' : 'rgba(255,255,255,0.85)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              SERVICES
            </button>
            {tenant.phone && (
              <a href={`tel:${tenant.phone}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: scrolled ? p : 'rgba(255,255,255,0.15)',
                backdropFilter: !scrolled ? 'blur(12px)' : 'none',
                border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.3)',
                borderRadius: 999, padding: '7px 16px',
                fontSize: 12, fontWeight: 700, color: '#fff', textDecoration: 'none',
              }}>
                <Phone size={12} />
                {tenant.phone}
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* ── VIDEO HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '100svh', minHeight: 600 }}>
        <video autoPlay loop muted playsInline style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        }}>
          <source src="/media/bg-motion.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(250,248,245,0.5) 80%, rgba(250,248,245,1) 100%)',
        }} />

        {/* LARGE overlay word — Personal style */}
        <div style={{
          position: 'absolute', bottom: 80, left: 0, right: 0,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span className="groovy-font hero-word" style={{
            fontSize: 'clamp(80px, 18vw, 220px)',
            fontWeight: 900,
            color: 'transparent',
            WebkitTextStroke: '2px rgba(255,255,255,0.7)',
            lineHeight: 0.85,
            letterSpacing: '-0.03em',
            userSelect: 'none',
          }}>
            جمال
          </span>
        </div>

        {/* Hero content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 32px 100px',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 24, height: 1, background: p }} />
              <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>BEAUTY SALON</span>
            </div>
            <h1 className="groovy-font" style={{
              color: '#1a0f0a',
              fontSize: 'clamp(40px, 8vw, 96px)',
              fontWeight: 900, lineHeight: 0.9,
              margin: '0 0 20px', letterSpacing: '-0.02em',
            }}>
              {tenant.name_ar}
            </h1>
            {tenant.description_ar && (
              <p style={{ fontSize: 14, lineHeight: 1.75, color: '#5a4a3f', maxWidth: 380, marginBottom: 28 }}>
                {tenant.description_ar}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setBookingOpen(true)}
                className="btn-primary"
                style={{ background: p, border: 'none', borderRadius: 999, padding: '14px 36px', cursor: 'pointer', fontFamily: 'inherit', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.03em' }}
              >
                احجزي الآن
              </button>
              <button
                onClick={scrollToServices}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(250,248,245,0.6)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(194,132,122,0.3)', borderRadius: 999,
                  padding: '14px 24px', color: '#3d2b22', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em',
                }}
              >
                EXPLORE
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── EDITORIAL TEXT BLOCK ── */}
      <div style={{ background: '#fff', padding: '72px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: 60, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 180, marginBottom: 20 }}>
              <div style={{ width: 60, height: 1, background: 'rgba(26,15,10,0.15)' }} />
              <span style={{ fontSize: 10, color: '#a89080', fontWeight: 700, letterSpacing: '0.12em' }}>It's never too late to look good</span>
            </div>
            <h2 className="groovy-font" style={{
              fontSize: 'clamp(48px, 8vw, 100px)',
              fontWeight: 900, lineHeight: 0.85,
              color: p, margin: '0 0 -12px',
              letterSpacing: '-0.03em',
            }}>
              BE
            </h2>
          </div>
          <div style={{ flex: 1, minWidth: 260, paddingTop: 32 }}>
            <h2 style={{
              fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900,
              color: '#1a0f0a', lineHeight: 1.2, margin: 0,
              letterSpacing: '-0.02em',
            }}>
              كوني جزءاً من ثورة الجمال واحصلي على تجربة مميزة{' '}
              <span style={{ color: p }}>بأسلوبك الخاص</span>{' '}
              <span style={{ color: p }}>بشكل لا مثيل له</span>
            </h2>
          </div>
        </div>
      </div>

      {/* ── COLLECTION GRID (Personal style masonry) ── */}
      <div style={{ background: '#fff', padding: '0 0 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

          {/* Row 1: alternating height mosaic */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, alignItems: 'end' }}>
            {/* Col 1: tall */}
            <div style={{ position: 'relative', height: 420, borderRadius: 4, overflow: 'hidden' }}>
              <Image src="/media/salon-1.jpg" alt="خدمات الصالون" fill style={{ objectFit: 'cover' }} sizes="25vw" />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)', padding: 20 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>٢٠٢٤</span>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: '4px 0 0' }}>العناية بالشعر</p>
              </div>
            </div>

            {/* Col 2: two stacked short */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ position: 'relative', height: 200, borderRadius: 4, overflow: 'hidden' }}>
                <Image src="/media/salon-2.jpg" alt="مكياج" fill style={{ objectFit: 'cover' }} sizes="25vw" />
                <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 700, background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '3px 10px' }}>مكياج</span>
                </div>
              </div>
              <div style={{ position: 'relative', height: 210, borderRadius: 4, overflow: 'hidden' }}>
                <Image src="/media/salon-3.jpg" alt="شعر" fill style={{ objectFit: 'cover' }} sizes="25vw" />
                <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 700, background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '3px 10px' }}>شعر</span>
                </div>
              </div>
            </div>

            {/* Col 3: tall, shifted up */}
            <div style={{ position: 'relative', height: 380, borderRadius: 4, overflow: 'hidden', marginBottom: 40 }}>
              <Image src="/media/salon-4.jpg" alt="العناية بالبشرة" fill style={{ objectFit: 'cover' }} sizes="25vw" />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)', padding: 20 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>٢٠٢٥</span>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: '4px 0 0' }}>العناية بالبشرة</p>
              </div>
            </div>

            {/* Col 4: two stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ position: 'relative', height: 220, borderRadius: 4, overflow: 'hidden' }}>
                <Image src="/media/salon-5.jpg" alt="سبا" fill style={{ objectFit: 'cover' }} sizes="25vw" />
                <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 700, background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '3px 10px' }}>سبا</span>
                </div>
              </div>
              <div style={{ position: 'relative', height: 190, borderRadius: 4, overflow: 'hidden' }}>
                <Image src="/media/salon-6.jpg" alt="أظافر" fill style={{ objectFit: 'cover' }} sizes="25vw" />
                <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 700, background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '3px 10px' }}>أظافر</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BEST SERVICES (dark horizontal scroll — Personal "Best Sellers" style) ── */}
      <div ref={servicesRef} style={{ background: '#1a0f0a', padding: '0 0 60px' }}>

        {/* Header strip */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 32px',
          display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto',
        }} className="no-scrollbar">
          <span className="groovy-font" style={{
            fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 900, color: '#fff',
            letterSpacing: '-0.01em', flexShrink: 0, marginLeft: 32,
          }}>
            أفضل خدماتنا
          </span>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 20px', flexShrink: 0 }} />
          {[{ id: 'all', name_ar: 'الكل' }, ...categories.filter(c => (c.services || []).filter(s => s.is_active).length > 0)].map(cat => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  flexShrink: 0, padding: '6px 20px', borderRadius: 999,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginLeft: 8,
                  background: isActive ? p : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                }}
              >
                {'name_ar' in cat ? cat.name_ar : ''}
              </button>
            )
          })}
        </div>

        {/* Service cards — 2-row grid scroll */}
        <div style={{ overflowX: 'auto', padding: '24px 32px 0' }} className="no-scrollbar">
          <div style={{
            display: 'grid',
            gridTemplateRows: 'repeat(2, auto)',
            gridAutoFlow: 'column',
            gridAutoColumns: '240px',
            gap: '10px 10px',
            width: 'max-content',
          }}>
            {(displayedServices.length > 0 ? displayedServices : allServices).map(service => (
              <div
                key={service.id}
                onClick={() => handleBookService(service)}
                style={{
                  width: 240, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              >
                {/* Image */}
                <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                  {service.image_url ? (
                    <Image src={service.image_url} alt={service.name_ar} fill style={{ objectFit: 'cover' }} sizes="240px" />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: `linear-gradient(145deg, ${p}25, ${a}22)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 36,
                    }}>✨</div>
                  )}
                </div>
                {/* Content */}
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ color: '#fff', fontWeight: 800, fontSize: 13, margin: '0 0 4px', lineHeight: 1.3 }}>{service.name_ar}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: p }}>{formatCurrency(service.price)}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                      <Clock size={9} style={{ display: 'inline', verticalAlign: 'middle' }} /> {service.duration_minutes}د
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book CTA inside dark section */}
        <div style={{ padding: '32px 32px 0', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setBookingOpen(true)}
            style={{
              background: p, border: 'none', borderRadius: 999,
              padding: '14px 48px', cursor: 'pointer', fontFamily: 'inherit',
              color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.05em',
            }}
          >
            احجزي موعدك الآن
          </button>
        </div>
      </div>

      {/* ── TEAM (light section) ── */}
      {employees.length > 0 && (
        <div style={{ background: '#faf8f5', padding: '72px 32px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 20, height: 1, background: a }} />
              <span style={{ color: a, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>OUR TEAM</span>
            </div>
            <h2 className="groovy-font" style={{
              color: '#1a0f0a', margin: '0 0 36px',
              fontSize: 'clamp(28px, 5vw, 56px)',
              fontWeight: 900, letterSpacing: '-0.02em',
            }}>
              فريقنا المتخصص
            </h2>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }} className="no-scrollbar">
              {employees.map(emp => (
                <div key={emp.id} style={{ flexShrink: 0, width: 140, textAlign: 'center' }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: 4, overflow: 'hidden',
                    margin: '0 auto', position: 'relative',
                    border: `2px solid ${p}25`,
                  }}>
                    {emp.photo_url ? (
                      <Image src={emp.photo_url} alt={emp.name_ar} width={100} height={100} style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `linear-gradient(145deg, ${p}18, ${a}28)`,
                      }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="4" fill={p} fillOpacity="0.4" />
                          <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke={p} strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 800, marginTop: 12, color: '#1a0f0a' }}>{emp.name_ar}</p>
                  {emp.specializations && emp.specializations.length > 0 && (
                    <p style={{ fontSize: 10, color: '#a89080', margin: '4px 0 0', lineHeight: 1.5, fontWeight: 600 }}>
                      {emp.specializations.slice(0, 2).join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY BOTTOM CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(250,248,245,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(194,132,122,0.12)',
      }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '12px 16px' }}>
          <button
            onClick={() => setBookingOpen(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '15px 0', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: '#1a0f0a', color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'inherit',
              letterSpacing: '0.03em',
            }}
          >
            احجزي موعدك الآن
            <ChevronLeft size={15} style={{ opacity: 0.6 }} />
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&display=swap');
        .groovy-font { font-family: 'Unbounded', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .btn-primary { transition: transform 0.2s, box-shadow 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); }
        .hero-word {
          text-shadow: none;
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  )
}
