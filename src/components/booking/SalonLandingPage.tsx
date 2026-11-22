'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Phone, Sparkles, Star, Clock, MapPin, ChevronLeft, Shield, Award } from 'lucide-react'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { formatCurrency } from '@/lib/utils'
import type { TenantProfile, ServiceCategory, Employee, Service } from '@/types'

interface Props {
  tenant: TenantProfile
  categories: ServiceCategory[]
  employees: Employee[]
}

const GALLERY_PHOTOS = [
  { src: '/media/salon-1.jpg', alt: 'عناية بالحاجب', span: 2 },
  { src: '/media/salon-2.jpg', alt: 'تمليس الشعر', span: 1 },
  { src: '/media/salon-3.jpg', alt: 'تجفيف الشعر', span: 1 },
  { src: '/media/salon-4.jpg', alt: 'غسيل الشعر', span: 2 },
  { src: '/media/salon-5.jpg', alt: 'استقبال الصالون', span: 1 },
  { src: '/media/salon-6.jpg', alt: 'إعداد السبا', span: 1 },
  { src: '/media/salon-7.jpg', alt: 'أدوات التجميل', span: 1 },
  { src: '/media/salon-8.jpg', alt: 'ركن الاستقبال', span: 2 },
  { src: '/media/salon-9.jpg', alt: 'جهاز التجعيل', span: 1 },
  { src: '/media/salon-10.jpg', alt: 'مستلزمات المكياج', span: 1 },
  { src: '/media/salon-11.jpg', alt: 'مكياج ذهبي وردي', span: 2 },
]

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
  const totalServices = allServices.length
  const minPrice = allServices.length > 0 ? Math.min(...allServices.map(s => s.price)) : 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#faf8f5' }} dir="rtl">

      {/* ── FLOATING NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(250,248,245,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(194,132,122,0.15)' : 'none',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
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
            <span style={{
              fontWeight: 800, fontSize: 15,
              color: scrolled ? '#1a0f0a' : '#fff',
              transition: 'color 0.3s',
              textShadow: scrolled ? 'none' : '0 1px 8px rgba(0,0,0,0.3)',
            }}>
              {tenant.name_ar}
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={scrollToServices}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 600, padding: '7px 12px', borderRadius: 8,
                color: scrolled ? '#6b5c50' : 'rgba(255,255,255,0.85)',
                transition: 'color 0.3s',
              }}
            >
              الخدمات
            </button>
            {tenant.phone && (
              <a href={`tel:${tenant.phone}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: scrolled ? p : 'rgba(255,255,255,0.15)',
                backdropFilter: !scrolled ? 'blur(12px)' : 'none',
                border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.3)',
                borderRadius: 999, padding: '7px 16px',
                fontSize: 12, fontWeight: 700, color: '#fff', textDecoration: 'none',
                transition: 'all 0.3s',
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
        {/* Video */}
        <video autoPlay loop muted playsInline style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        }}>
          <source src="/media/bg-motion.mp4" type="video/mp4" />
        </video>

        {/* Light editorial overlay — cream gradient at bottom so content reads on cream bg below */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 45%, rgba(250,248,245,0.6) 80%, rgba(250,248,245,1) 100%)',
        }} />

        {/* Hero content — anchored to bottom, editorial layout */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 32px 72px',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>

            {/* Category tag — editorial style */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginBottom: 16,
            }}>
              <div style={{ width: 28, height: 1, background: p }} />
              <span style={{ color: p, fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                BEAUTY SALON
              </span>
            </div>

            {/* LARGE editorial salon name */}
            <h1 style={{
              color: '#1a0f0a',
              fontSize: 'clamp(52px, 10vw, 120px)',
              fontWeight: 900, lineHeight: 0.9,
              margin: '0 0 20px',
              letterSpacing: '-0.03em',
            }}>
              {tenant.name_ar}
            </h1>

            {tenant.description_ar && (
              <p style={{
                fontSize: 15, lineHeight: 1.75,
                color: '#5a4a3f',
                maxWidth: 400, marginBottom: 32,
              }}>
                {tenant.description_ar}
              </p>
            )}

            {/* Stats row — light editorial pills */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
              {[
                { text: `${totalServices} خدمة` },
                ...(minPrice > 0 ? [{ text: `من ${formatCurrency(minPrice)}` }] : []),
                { text: 'خدمة منزلية' },
                ...(employees.length > 0 ? [{ text: `${employees.length} متخصصة` }] : []),
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(250,248,245,0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(194,132,122,0.25)',
                  borderRadius: 999, padding: '6px 16px',
                  fontSize: 12, fontWeight: 700, color: '#3d2b22',
                }}>
                  {stat.text}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setBookingOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: p, border: 'none', borderRadius: 999,
                  padding: '14px 36px', cursor: 'pointer', fontFamily: 'inherit',
                  color: '#fff', fontWeight: 800, fontSize: 15,
                  letterSpacing: '0.02em',
                  boxShadow: `0 8px 32px ${p}55`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 14px 40px ${p}70` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px ${p}55` }}
              >
                احجزي الآن
              </button>
              <button
                onClick={scrollToServices}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(250,248,245,0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(194,132,122,0.3)',
                  borderRadius: 999, padding: '14px 28px',
                  color: '#3d2b22', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                EXPLORE
                <ChevronLeft size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PHOTO GALLERY ── */}
      <div style={{ background: '#faf8f5', borderTop: '1px solid rgba(194,132,122,0.1)' }}>

        {/* Section label */}
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '40px 32px 20px',
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 24, height: 1, background: p }} />
            <span style={{ color: p, fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              GALLERY
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#a89080', fontWeight: 600 }}>
            {GALLERY_PHOTOS.length} صورة
          </span>
        </div>

        {/* Photo strip */}
        <div style={{
          display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none',
          height: 260, padding: '0 32px 0',
        }} className="gallery-strip">
          {GALLERY_PHOTOS.map((photo, i) => (
            <div key={i} style={{
              position: 'relative', flexShrink: 0,
              width: photo.span === 2 ? 340 : 170, height: 260,
              overflow: 'hidden', borderRadius: 4,
            }}>
              <Image
                src={photo.src} alt={photo.alt} fill sizes="340px"
                style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
              />
            </div>
          ))}
        </div>

        <div style={{ height: 40 }} />
      </div>

      {/* ── TRUST STRIP ── */}
      <div style={{
        background: '#1a0f0a',
        padding: '14px 32px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 40, flexWrap: 'wrap',
        }}>
          {[
            { icon: <Shield size={14} style={{ color: '#86efac' }} />, text: 'دفع آمن 100%' },
            { icon: <Clock size={14} style={{ color: a }} />, text: 'حجز فوري' },
            { icon: <Award size={14} style={{ color: a }} />, text: 'متخصصات معتمدات' },
            { icon: <Star size={14} style={{ color: '#fde68a' }} />, text: 'خدمة منزلية مريحة' },
            { icon: <MapPin size={14} style={{ color: p }} />, text: 'نصلك أينما كنت' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.icon}
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES SECTION ── */}
      <div ref={servicesRef} style={{ background: '#faf8f5', padding: '72px 0 160px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>

          {/* Section header — editorial */}
          <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 24, height: 1, background: p }} />
                <span style={{ color: p, fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  BEST SERVICES
                </span>
              </div>
              <h2 style={{
                color: '#1a0f0a', margin: 0,
                fontSize: 'clamp(32px, 5vw, 60px)',
                fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1,
              }}>
                خدماتنا المميزة
              </h2>
              <p style={{ color: '#8c7060', fontSize: 14, marginTop: 10, fontWeight: 500 }}>
                {totalServices} خدمة — اختاري ما يناسبك
              </p>
            </div>

            <button
              onClick={() => setBookingOpen(true)}
              style={{
                background: 'none',
                border: `1.5px solid ${p}`,
                borderRadius: 999, padding: '10px 24px',
                fontSize: 13, fontWeight: 800, color: p,
                cursor: 'pointer', fontFamily: 'inherit',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              احجزي الآن
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* Category filters — editorial pills */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 24, marginBottom: 32 }} className="gallery-strip">
              {[
                { id: 'all', name_ar: `الكل` },
                ...categories.filter(c => (c.services || []).filter(s => s.is_active).length > 0),
              ].map(cat => {
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      flexShrink: 0, padding: '9px 22px',
                      borderRadius: 999, fontFamily: 'inherit',
                      fontSize: 12, fontWeight: 800,
                      cursor: 'pointer', letterSpacing: '0.03em',
                      transition: 'all 0.2s',
                      background: isActive ? '#1a0f0a' : 'transparent',
                      border: isActive ? '1.5px solid #1a0f0a' : '1.5px solid rgba(26,15,10,0.2)',
                      color: isActive ? '#fff' : '#6b5040',
                    }}
                  >
                    {'name_ar' in cat ? cat.name_ar : ''}
                    {cat.id !== 'all' && (
                      <span style={{ marginRight: 6, opacity: 0.5, fontSize: 10 }}>
                        ({(cat as ServiceCategory).services?.filter(s => s.is_active).length || 0})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Services grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))',
            gap: 1,
            border: '1px solid rgba(26,15,10,0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            {displayedServices.map(service => (
              <ServiceCard key={service.id} service={service} primaryColor={p} accentColor={a} onBook={handleBookService} />
            ))}
            {displayedServices.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0' }}>
                <p style={{ color: '#a89080', fontSize: 14 }}>لا توجد خدمات في هذه الفئة</p>
              </div>
            )}
          </div>

          {/* Team section */}
          {employees.length > 0 && (
            <div style={{ marginTop: 80 }}>
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 1, background: a }} />
                  <span style={{ color: a, fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    OUR TEAM
                  </span>
                </div>
                <h2 style={{
                  color: '#1a0f0a', margin: 0,
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 900, letterSpacing: '-0.02em',
                }}>
                  فريقنا المتخصص
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 12 }} className="gallery-strip">
                {employees.map(emp => (
                  <EmployeeCard key={emp.id} employee={emp} primaryColor={p} accentColor={a} />
                ))}
              </div>
            </div>
          )}

          {/* Newsletter-style booking CTA */}
          <div style={{
            marginTop: 80,
            background: '#1a0f0a',
            borderRadius: 4, padding: '56px 48px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 32,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 20, height: 1, background: p }} />
                <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>
                  BOOK NOW
                </span>
              </div>
              <h3 style={{
                color: '#fff', margin: 0,
                fontSize: 'clamp(24px, 4vw, 40px)',
                fontWeight: 900, letterSpacing: '-0.02em',
              }}>
                احجزي موعدك اليوم
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 8, fontWeight: 500 }}>
                خبرة راقية في راحة منزلك
              </p>
            </div>
            <button
              onClick={() => setBookingOpen(true)}
              style={{
                background: p, border: 'none', borderRadius: 999,
                padding: '16px 48px', cursor: 'pointer', fontFamily: 'inherit',
                color: '#fff', fontWeight: 800, fontSize: 15,
                letterSpacing: '0.05em',
                transition: 'transform 0.2s, opacity 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              احجزي الآن
            </button>
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(250,248,245,0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(194,132,122,0.15)',
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
            احجزي موعتك الآن
            <ChevronLeft size={15} style={{ opacity: 0.6 }} />
          </button>
        </div>
      </div>

      <style>{`
        .gallery-strip::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────
   Service Card — editorial light theme
   ───────────────────────────────────────── */
function ServiceCard({
  service, primaryColor, accentColor, onBook,
}: {
  service: Service; primaryColor: string; accentColor: string; onBook: (s: Service) => void
}) {
  return (
    <div
      onClick={() => onBook(service)}
      style={{
        background: '#fff', cursor: 'pointer',
        display: 'flex', borderBottom: '1px solid rgba(26,15,10,0.06)',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#fdf5f0' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
    >
      {/* Image side */}
      {service.image_url ? (
        <div style={{ position: 'relative', flexShrink: 0, width: 120, minHeight: 100, overflow: 'hidden' }}>
          <Image src={service.image_url} alt={service.name_ar} fill style={{ objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{
          flexShrink: 0, width: 100, minHeight: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(145deg, ${primaryColor}18, ${accentColor}22)`,
          fontSize: 28,
        }}>
          ✨
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <h3 style={{ fontWeight: 800, color: '#1a0f0a', fontSize: 15, lineHeight: 1.3, margin: '0 0 6px' }}>
            {service.name_ar}
          </h3>
          {service.description_ar && (
            <p style={{
              fontSize: 12, color: '#8c7060', margin: '0 0 10px', lineHeight: 1.6,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {service.description_ar}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#a89080', fontWeight: 600 }}>
              <Clock size={11} />
              {service.duration_minutes} دقيقة
            </span>
            {service.home_visit_surcharge > 0 && (
              <span style={{ fontSize: 11, color: '#a89080', fontWeight: 600 }}>
                + {formatCurrency(service.home_visit_surcharge)} زيارة
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#1a0f0a' }}>
            {formatCurrency(service.price)}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onBook(service) }}
            style={{
              borderRadius: 999, padding: '8px 20px', border: `1.5px solid ${primaryColor}`,
              background: 'transparent', color: primaryColor,
              fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.03em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = primaryColor; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = primaryColor }}
          >
            احجزي
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Employee Card — editorial light theme
   ───────────────────────────────────────── */
function EmployeeCard({ employee, primaryColor, accentColor }: { employee: Employee; primaryColor: string; accentColor: string }) {
  return (
    <div style={{ flexShrink: 0, width: 148, textAlign: 'center' }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
        margin: '0 auto', position: 'relative',
        border: `2px solid ${primaryColor}30`,
      }}>
        {employee.photo_url ? (
          <Image src={employee.photo_url} alt={employee.name_ar} width={100} height={100} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(145deg, ${primaryColor}18, ${accentColor}28)`,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill={primaryColor} fillOpacity="0.4" />
              <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
      <p style={{ fontSize: 14, fontWeight: 800, marginTop: 14, color: '#1a0f0a' }}>{employee.name_ar}</p>
      {employee.specializations && employee.specializations.length > 0 && (
        <p style={{ fontSize: 11, color: '#a89080', margin: '4px 0 0', lineHeight: 1.5, fontWeight: 600 }}>
          {employee.specializations.slice(0, 2).join(' · ')}
        </p>
      )}
    </div>
  )
}
