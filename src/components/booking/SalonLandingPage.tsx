'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Phone, Sparkles, Star, Clock, MapPin, ChevronDown, ChevronLeft, Shield, Award, Camera } from 'lucide-react'
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
  const galleryRef = useRef<HTMLDivElement>(null)

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
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0804' }} dir="rtl">

      {/* ── VIDEO HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '100svh', minHeight: 600 }}>

        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src="/media/bg-motion.mp4" type="video/mp4" />
        </video>

        {/* Multi-layer overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,8,4,0.3) 0%, rgba(10,8,4,0.1) 40%, rgba(10,8,4,0.7) 80%, rgba(10,8,4,0.95) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 30% 50%, ${p}22 0%, transparent 60%)`,
        }} />

        {/* ── FLOATING NAV ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          transition: 'all 0.3s ease',
          background: scrolled ? 'rgba(10,8,4,0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto', padding: '0 24px',
            height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {tenant.logo_url ? (
                <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Image src={tenant.logo_url} alt={tenant.name_ar} width={36} height={36} style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${p}, ${a})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={16} color="white" />
                </div>
              )}
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{tenant.name_ar}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 999, padding: '7px 14px',
                  fontSize: 12, fontWeight: 600, color: '#fff', textDecoration: 'none',
                  transition: 'background 0.2s',
                }}>
                  <Phone size={12} />
                  {tenant.phone}
                </a>
              )}
              <button
                onClick={scrollToServices}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                  padding: '7px 10px',
                }}
              >
                الخدمات
              </button>
            </div>
          </div>
        </div>

        {/* ── HERO CONTENT ── */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 24px 56px',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>

            {/* Category tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `linear-gradient(135deg, ${p}33, ${a}22)`,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${p}44`,
              borderRadius: 999, padding: '5px 14px', marginBottom: 20,
            }}>
              <Sparkles size={12} style={{ color: a }} />
              <span style={{ color: a, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
                صالون تجميل فاخر
              </span>
            </div>

            {/* Main heading */}
            <h1 style={{
              color: '#fff', fontSize: 'clamp(36px, 7vw, 72px)',
              fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}>
              {tenant.name_ar}
            </h1>

            {tenant.description_ar && (
              <p style={{
                color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 1.7,
                maxWidth: 480, marginBottom: 32,
              }}>
                {tenant.description_ar}
              </p>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
              {[
                { icon: <Sparkles size={14} />, text: `${totalServices} خدمة`, color: '#fde047' },
                ...(minPrice > 0 ? [{ icon: <Star size={14} />, text: `تبدأ من ${formatCurrency(minPrice)}`, color: a }] : []),
                { icon: <MapPin size={14} />, text: 'خدمة منزلية', color: '#86efac' },
                ...(employees.length > 0 ? [{ icon: <Award size={14} />, text: `${employees.length} متخصصة`, color: '#c4b5fd' }] : []),
              ].map((stat, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14, padding: '8px 16px',
                }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{stat.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setBookingOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: `linear-gradient(135deg, ${p} 0%, ${a} 100%)`,
                  border: 'none', borderRadius: 20, padding: '15px 32px',
                  color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                  fontFamily: 'inherit', boxShadow: `0 8px 32px ${p}44`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${p}66` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px ${p}44` }}
              >
                <Sparkles size={18} />
                احجزي الآن
              </button>
              <button
                onClick={scrollToServices}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20, padding: '15px 24px',
                  color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <ChevronDown size={16} />
                استكشفي الخدمات
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          opacity: scrolled ? 0 : 0.6, transition: 'opacity 0.3s',
        }}>
          <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, transparent, #fff)', borderRadius: 1 }} />
        </div>
      </div>

      {/* ── PHOTO GALLERY STRIP ── */}
      <div style={{ background: '#0a0804', padding: '0 0 2px' }}>
        <div
          ref={galleryRef}
          style={{
            display: 'flex', gap: 3,
            overflowX: 'auto', scrollbarWidth: 'none',
            height: 240,
          }}
          className="gallery-strip"
        >
          {GALLERY_PHOTOS.map((photo, i) => (
            <div
              key={i}
              style={{
                position: 'relative', flexShrink: 0,
                width: photo.span === 2 ? 320 : 160,
                height: 240, overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="320px"
                style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => { const img = e.currentTarget; img.style.transform = 'scale(1.05)' }}
                onMouseLeave={e => { const img = e.currentTarget; img.style.transform = 'scale(1)' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                opacity: 0, transition: 'opacity 0.3s',
              }} />
              <div style={{
                position: 'absolute', bottom: 8, right: 10,
                color: 'rgba(255,255,255,0)', fontSize: 11, fontWeight: 600,
                transition: 'color 0.3s',
              }}>
                {photo.alt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div style={{
        background: 'linear-gradient(90deg, #1a1008 0%, #150e06 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 32, flexWrap: 'wrap',
        }}>
          {[
            { icon: <Shield size={15} style={{ color: '#22c55e' }} />, text: 'دفع آمن 100%' },
            { icon: <Clock size={15} style={{ color: p }} />, text: 'حجز فوري' },
            { icon: <Award size={15} style={{ color: '#fbbf24' }} />, text: 'متخصصات معتمدات' },
            { icon: <Star size={15} style={{ color: '#c4b5fd' }} />, text: 'خدمة منزلية مريحة' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.icon}
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES SECTION ── */}
      <div ref={servicesRef} style={{
        background: 'linear-gradient(180deg, #0a0804 0%, #110d07 100%)',
        padding: '64px 0 160px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

          {/* Section header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginBottom: 12,
            }}>
              <div style={{ width: 32, height: 1, background: `linear-gradient(to left, ${p}, transparent)` }} />
              <span style={{ color: p, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                SERVICES
              </span>
              <div style={{ width: 32, height: 1, background: `linear-gradient(to right, ${p}, transparent)` }} />
            </div>
            <h2 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
              خدماتنا الفاخرة
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 10 }}>
              {totalServices} خدمة متوفرة — اختاري ما يناسبك
            </p>
          </div>

          {/* Category filters */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 32 }} className="custom-scrollbar">
              {[{ id: 'all', name_ar: `الكل (${totalServices})`, icon: null }, ...categories.filter(c => (c.services || []).filter(s => s.is_active).length > 0)].map(cat => {
                const isAll = cat.id === 'all'
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      flexShrink: 0, padding: '9px 20px', borderRadius: 999,
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                      cursor: 'pointer',
                      background: isActive
                        ? `linear-gradient(135deg, ${p}, ${a})`
                        : 'rgba(255,255,255,0.06)',
                      border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {!isAll && 'icon' in cat && cat.icon && <span>{cat.icon}</span>}
                    {'name_ar' in cat ? cat.name_ar : ''}
                    {!isAll && (
                      <span style={{
                        fontSize: 10, background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                        padding: '1px 6px', borderRadius: 999,
                      }}>
                        {(cat as ServiceCategory).services?.filter(s => s.is_active).length || 0}
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
            gap: 16,
          }}>
            {displayedServices.map(service => (
              <ServiceCard key={service.id} service={service} primaryColor={p} accentColor={a} onBook={handleBookService} />
            ))}
            {displayedServices.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0' }}>
                <Sparkles size={40} style={{ margin: '0 auto 12px', color: p, opacity: 0.3 }} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>لا توجد خدمات في هذه الفئة</p>
              </div>
            )}
          </div>

          {/* Team section */}
          {employees.length > 0 && (
            <div style={{ marginTop: 72 }}>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 1, background: `linear-gradient(to left, ${a}, transparent)` }} />
                  <span style={{ color: a, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    TEAM
                  </span>
                  <div style={{ width: 32, height: 1, background: `linear-gradient(to right, ${a}, transparent)` }} />
                </div>
                <h2 style={{ color: '#fff', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, margin: 0 }}>
                  فريقنا المتخصص
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12 }} className="custom-scrollbar">
                {employees.map(emp => (
                  <EmployeeCard key={emp.id} employee={emp} primaryColor={p} accentColor={a} />
                ))}
              </div>
            </div>
          )}

          {/* Gallery teaser */}
          <div style={{ marginTop: 72, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '12px 24px',
              color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 500,
            }}>
              <Camera size={15} style={{ color: p }} />
              شاهدي أعمالنا في معرض الصور أعلاه
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,8,4,0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '12px 16px' }}>
          <button
            onClick={() => setBookingOpen(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '16px 0', borderRadius: 20,
              background: `linear-gradient(135deg, ${p} 0%, ${a} 100%)`,
              border: 'none', cursor: 'pointer',
              color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
              boxShadow: `0 4px 20px ${p}44`,
            }}
          >
            <Sparkles size={18} />
            احجزي موعدك الآن
            <ChevronLeft size={16} style={{ opacity: 0.7 }} />
          </button>
        </div>
      </div>

      <style>{`
        .gallery-strip::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeUp 0.4s ease both; }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────
   Service Card — glass-morphism on dark
   ───────────────────────────────────────── */
function ServiceCard({
  service,
  primaryColor,
  accentColor,
  onBook,
}: {
  service: Service
  primaryColor: string
  accentColor: string
  onBook: (s: Service) => void
}) {
  return (
    <div
      onClick={() => onBook(service)}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, overflow: 'hidden',
        display: 'flex', cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.08)'
        el.style.borderColor = `${primaryColor}44`
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.05)'
        el.style.borderColor = 'rgba(255,255,255,0.1)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Image or gradient side */}
      {service.image_url ? (
        <div style={{ position: 'relative', flexShrink: 0, width: 120 }}>
          <Image src={service.image_url} alt={service.name_ar} fill style={{ objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.3))' }} />
        </div>
      ) : (
        <div style={{
          flexShrink: 0, width: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(145deg, ${primaryColor}22, ${accentColor}33)`,
          fontSize: 32,
        }}>
          ✨
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <h3 style={{ fontWeight: 700, color: '#fff', fontSize: 15, lineHeight: 1.3, margin: '0 0 6px' }}>
            {service.name_ar}
          </h3>
          {service.description_ar && (
            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', lineHeight: 1.6,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {service.description_ar}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              <Clock size={11} />
              {service.duration_minutes} دقيقة
            </span>
            {service.home_visit_surcharge > 0 && (
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                + {formatCurrency(service.home_visit_surcharge)} زيارة
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: primaryColor }}>
            {formatCurrency(service.price)}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onBook(service) }}
            style={{
              borderRadius: 14, padding: '9px 18px', border: 'none',
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            احجزي
            <ChevronLeft size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Employee Card
   ───────────────────────────────────────── */
function EmployeeCard({ employee, primaryColor, accentColor }: { employee: Employee; primaryColor: string; accentColor: string }) {
  return (
    <div style={{ flexShrink: 0, width: 140, textAlign: 'center' }}>
      <div style={{
        width: 90, height: 90, borderRadius: '50%', overflow: 'hidden',
        margin: '0 auto', position: 'relative',
        border: '2px solid transparent',
        background: `linear-gradient(#1a1008, #1a1008) padding-box, linear-gradient(135deg, ${primaryColor}, ${accentColor}) border-box`,
        boxShadow: `0 4px 20px ${primaryColor}30`,
      }}>
        {employee.photo_url ? (
          <Image src={employee.photo_url} alt={employee.name_ar} width={90} height={90} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(145deg, ${primaryColor}22, ${primaryColor}44)`,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill={primaryColor} fillOpacity="0.5" />
              <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, marginTop: 12, color: '#fff' }}>{employee.name_ar}</p>
      {employee.specializations && employee.specializations.length > 0 && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', lineHeight: 1.5 }}>
          {employee.specializations.slice(0, 2).join(' · ')}
        </p>
      )}
    </div>
  )
}
