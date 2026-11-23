'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Phone, Sparkles, ChevronLeft, Clock } from 'lucide-react'
import { ServicePhoto } from './ServicePhoto'
import styles from './service-gallery.module.css'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { formatCurrency } from '@/lib/utils'
import type { TenantProfile, ServiceCategory, Employee, Service } from '@/types'

interface Props {
  tenant: TenantProfile
  displayWord: string
  categories: ServiceCategory[]
  employees: Employee[]
}

const COLLECTION_ITEMS = [
  { src: '/media/salon-1.jpg', label: 'مكياج العيون', tall: true },
  { src: '/media/salon-2.jpg', label: 'تمليس الشعر' },
  { src: '/media/salon-4.jpg', label: 'غسل الشعر والعناية به', tall: true },
  { src: '/media/salon-5.jpg', label: 'داخل الصالون' },
  { src: '/media/salon-3.jpg', label: 'تجفيف الشعر' },
  { src: '/media/services/gel-nails.webp', label: 'جل الأظافر' },
]

export function SalonLandingPage({ tenant, displayWord, categories, employees }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [scrolled, setScrolled] = useState(false)
  const servicesRef = useRef<HTMLElement>(null)
  const restoreBookingTrigger = useRef<{ triggerId: string | undefined; scroll: number } | null>(null)

  useEffect(() => {
    if (bookingOpen || !restoreBookingTrigger.current) return
    const { triggerId, scroll } = restoreBookingTrigger.current
    restoreBookingTrigger.current = null
    window.scrollTo(0, scroll)
    if (triggerId) document.getElementById(triggerId)?.focus({ preventScroll: true })
  }, [bookingOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const availableCategories = categories.filter(category => category.services?.some(service => service.is_active))
  const displayedServices = availableCategories
    .filter(category => activeCategory === 'all' || activeCategory === category.id)
    .flatMap(category => (category.services ?? [])
      .filter(service => service.is_active)
      .map(service => ({ service, category })))

  function openBooking(services: Service[], trigger: HTMLButtonElement) {
    restoreBookingTrigger.current = { triggerId: trigger.id, scroll: window.scrollY }
    setSelectedServices(services)
    setBookingOpen(true)
  }

  function scrollToServices() {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (bookingOpen) {
    return (
      <BookingFlow
        tenant={tenant}
        displayWord={displayWord}
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
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 80, left: 0, right: 0,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span className="groovy-font hero-word" dir="auto" style={{
            fontSize: 'clamp(68px, 18vw, 220px)',
            fontWeight: 900,
            color: 'transparent',
            WebkitTextStroke: '2px rgba(255,255,255,0.7)',
            lineHeight: 0.85,
            letterSpacing: '-0.03em',
            userSelect: 'none',
          }}>
            {displayWord}
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
                id="book-hero"
                onClick={event => openBooking([], event.currentTarget)}
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
      <div style={{ background: '#fff' }}>
        <div className={styles.galleryIntro}>
          <span aria-hidden="true" className="groovy-font" style={{ color: p }}>BE</span>
          <h2>جمالك <span style={{ color: p }}>بأسلوبك الخاص</span></h2>
        </div>
      </div>

      <div style={{ background: '#fff' }}>
        <div className={styles.gallery}>
          {COLLECTION_ITEMS.map(({ src, label, tall }) => (
            <figure key={src} className={tall ? styles.tall : undefined}>
              <Image src={src} alt="" fill className={styles.photo} sizes="(max-width: 680px) 50vw, (max-width: 1280px) 25vw, 305px" />
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <section ref={servicesRef} className={styles.catalog} aria-labelledby="salon-services-heading">
        <div className={styles.catalogInner}>
          <div className={styles.catalogHeader}>
            <h2 id="salon-services-heading">أفضل خدماتنا</h2>
            <div className={styles.filters} role="group" aria-label="فئات الخدمات">
              {[{ id: 'all', name_ar: 'الكل' }, ...availableCategories].map(category => (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name_ar}
                </button>
              ))}
            </div>
          </div>
          {displayedServices.length > 0 ? (
            <>
              <div className={styles.cards}>
                {displayedServices.map(({ service, category }) => (
                  <button
                    key={service.id}
                    id={`book-service-${service.id}`}
                    type="button"
                    className={styles.card}
                    onClick={event => openBooking([service], event.currentTarget)}
                  >
                    <span className={styles.cardImage}>
                      <ServicePhoto service={service} category={category} sizes="(max-width: 680px) 50vw, (max-width: 1280px) 33vw, 400px" />
                      <span className={styles.cardName}>{service.name_ar || service.name_en}</span>
                    </span>
                    <span className={styles.cardDetails}>
                      <span className={styles.cardMeta}>
                        <bdi className={styles.price}>{formatCurrency(service.price)}</bdi>
                        <span className={styles.duration}><Clock size={13} aria-hidden="true" /> {service.duration_minutes} دقيقة</span>
                      </span>
                      <span className={styles.cardArrow}><ChevronLeft size={17} aria-hidden="true" /></span>
                    </span>
                  </button>
                ))}
              </div>
              <button id="book-catalog" type="button" className={styles.book} onClick={event => openBooking([], event.currentTarget)}>احجزي موعدك الآن</button>
            </>
          ) : (
            <p className={styles.empty}>لا توجد خدمات متاحة للحجز حاليًا.</p>
          )}
        </div>
      </section>

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
