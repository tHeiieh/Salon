'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Phone, Sparkles, Star, Clock, MapPin, ChevronDown, ChevronLeft, Shield, Award } from 'lucide-react'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { formatCurrency } from '@/lib/utils'
import type { TenantProfile, ServiceCategory, Employee, Service } from '@/types'

interface Props {
  tenant: TenantProfile
  categories: ServiceCategory[]
  employees: Employee[]
}

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
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5' }} dir="rtl">

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 'max(70vh, 480px)' }}>
        {tenant.cover_url ? (
          <Image src={tenant.cover_url} alt={tenant.name_ar} fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(145deg, ${p}ee 0%, ${p}99 40%, ${a}cc 100%)`,
          }} />
        )}
        {/* gradient overlay */}
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0 }} />

        {/* floating nav bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          ...(scrolled ? { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.4)' } : {})
        }}>
          <div style={{ maxWidth: 672, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {tenant.logo_url && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.6)', flexShrink: 0 }}>
                <Image src={tenant.logo_url} alt={tenant.name_ar} width={32} height={32} style={{ objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
              {tenant.phone && (
                <a
                  href={`tel:${tenant.phone}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: 999, padding: '5px 12px',
                    fontSize: 12, fontWeight: 600, color: '#fff', textDecoration: 'none',
                  }}
                >
                  <Phone size={12} />
                  {tenant.phone}
                </a>
              )}
              {tenant.whatsapp && (
                <a
                  href={`https://wa.me/${tenant.whatsapp?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: 999, padding: '5px 12px',
                    fontSize: 12, fontWeight: 600, color: '#fff', textDecoration: 'none',
                  }}
                >
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.526 5.845L0 24l6.355-1.504A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.001-1.368l-.359-.214-3.72.879.894-3.643-.234-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                  </svg>
                  واتساب
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 40px' }}>
          <div style={{ maxWidth: 672, margin: '0 auto' }}>
            {/* logo + name */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
              {tenant.logo_url && (
                <div style={{
                  width: 80, height: 80, borderRadius: 20, overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  backgroundColor: '#fff', flexShrink: 0,
                }}>
                  <Image src={tenant.logo_url} alt={tenant.name_ar} width={80} height={80} style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div>
                <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{tenant.name_ar}</h1>
                {tenant.name_en && (
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500, margin: '4px 0 0' }}>{tenant.name_en}</p>
                )}
              </div>
            </div>

            {/* description */}
            {tenant.description_ar && (
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6, marginBottom: 20, maxWidth: 380 }}>
                {tenant.description_ar}
              </p>
            )}

            {/* quick stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '7px 12px' }}>
                <Sparkles size={14} color="#fde047" />
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{totalServices} خدمة</span>
              </div>
              {minPrice > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '7px 12px' }}>
                  <Star size={14} color="#fde047" />
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>تبدأ من {formatCurrency(minPrice)}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '7px 12px' }}>
                <MapPin size={14} color="#86efac" />
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>خدمة منزلية</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setBookingOpen(true)}
                className="fab"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 0', borderRadius: 18,
                  backgroundColor: p, border: 'none', cursor: 'pointer',
                  color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
                }}
              >
                <Sparkles size={18} />
                احجزي الآن
              </button>
              <button
                onClick={scrollToServices}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: 18, padding: '14px 16px',
                  color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <ChevronDown size={16} />
                الخدمات
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST BADGES ── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
            <Shield size={15} color="#22c55e" />
            <span style={{ fontSize: 11, fontWeight: 600 }}>دفع آمن</span>
          </div>
          <div style={{ width: 1, height: 20, backgroundColor: '#e5e5e5' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
            <Clock size={15} style={{ color: p }} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>حجز فوري</span>
          </div>
          <div style={{ width: 1, height: 20, backgroundColor: '#e5e5e5' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
            <Award size={15} color="#f59e0b" />
            <span style={{ fontSize: 11, fontWeight: 600 }}>متخصصات معتمدات</span>
          </div>
          {tenant.cancellation_hours > 0 && (
            <>
              <div style={{ width: 1, height: 20, backgroundColor: '#e5e5e5' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666' }}>
                <Star size={15} color="#3b82f6" />
                <span style={{ fontSize: 11, fontWeight: 600 }}>إلغاء مجاني</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── SERVICES SECTION ── */}
      <div ref={servicesRef} style={{ maxWidth: 672, margin: '0 auto', padding: '32px 16px 120px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>خدماتنا</h2>
            <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>{totalServices} خدمة متوفرة</p>
          </div>
        </div>

        {/* Category filter tabs */}
        {categories.length > 1 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 24 }} className="custom-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className="category-tab"
              style={{
                flexShrink: 0, padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: `2px solid ${activeCategory === 'all' ? p : '#e5e5e5'}`,
                backgroundColor: activeCategory === 'all' ? p : '#fff',
                color: activeCategory === 'all' ? '#fff' : '#666',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              الكل ({totalServices})
            </button>
            {categories.map(cat => {
              const count = (cat.services || []).filter(s => s.is_active).length
              if (count === 0) return null
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="category-tab"
                  style={{
                    flexShrink: 0, padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                    border: `2px solid ${isActive ? p : '#e5e5e5'}`,
                    backgroundColor: isActive ? p : '#fff',
                    color: isActive ? '#fff' : '#666',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name_ar}
                  <span style={{
                    fontSize: 11, borderRadius: 999, padding: '1px 6px', fontWeight: 700,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f0f0f0',
                    color: isActive ? '#fff' : '#888',
                  }}>{count}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Services list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="fade-in" key={activeCategory}>
          {displayedServices.map(service => (
            <ServiceCard key={service.id} service={service} primaryColor={p} accentColor={a} onBook={handleBookService} />
          ))}
          {displayedServices.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#aaa' }}>
              <Sparkles size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontSize: 13, margin: 0 }}>لا توجد خدمات في هذه الفئة</p>
            </div>
          )}
        </div>

        {/* Team section */}
        {employees.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>فريق العمل</h2>
                <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>{employees.length} متخصصة</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }} className="custom-scrollbar">
              {employees.map(emp => (
                <EmployeeCard key={emp.id} employee={emp} primaryColor={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '12px 16px' }}>
          <button
            onClick={() => setBookingOpen(true)}
            className="fab"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '16px 0', borderRadius: 18,
              backgroundColor: p, border: 'none', cursor: 'pointer',
              color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
            }}
          >
            <Sparkles size={18} />
            احجزي موعدك الآن
            <ChevronLeft size={16} style={{ opacity: 0.7 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Service Card
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
      className="service-card"
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        border: '1px solid rgba(229,225,220,0.6)',
        display: 'flex',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
      onClick={() => onBook(service)}
    >
      {/* Image or color block */}
      {service.image_url ? (
        <div style={{ position: 'relative', flexShrink: 0, width: 112 }}>
          <Image src={service.image_url} alt={service.name_ar} fill style={{ objectFit: 'cover' }} />
        </div>
      ) : (
        <div
          style={{
            flexShrink: 0, width: 88,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundImage: `linear-gradient(145deg, ${primaryColor}22, ${accentColor}33)`,
            fontSize: 28,
          }}
        >
          ✨
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <h3 style={{ fontWeight: 700, color: '#1a1a1a', fontSize: 15, lineHeight: 1.3, margin: '0 0 4px' }}>{service.name_ar}</h3>
          {service.description_ar && (
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {service.description_ar}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
              <Clock size={11} />
              {service.duration_minutes} دقيقة
            </span>
            {service.home_visit_surcharge > 0 && (
              <span style={{ fontSize: 11, color: '#888' }}>
                + {formatCurrency(service.home_visit_surcharge)} زيارة
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: primaryColor }}>
            {formatCurrency(service.price)}
          </span>
          <button
            style={{
              borderRadius: 12, padding: '8px 16px', border: 'none',
              backgroundColor: primaryColor, color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
            onClick={e => { e.stopPropagation(); onBook(service) }}
          >
            احجزي
            <ChevronLeft size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Employee Card
   ───────────────────────────────────────── */
function EmployeeCard({ employee, primaryColor }: { employee: Employee; primaryColor: string }) {
  return (
    <div style={{ flexShrink: 0, width: 128, textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto',
        border: `2px solid ${primaryColor}40`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        {employee.photo_url ? (
          <Image src={employee.photo_url} alt={employee.name_ar} width={80} height={80} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundImage: `linear-gradient(145deg, ${primaryColor}22, ${primaryColor}44)`,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" fill={primaryColor} fillOpacity="0.4" stroke={primaryColor} strokeWidth="1.5"/>
              <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, marginTop: 10, color: '#1a1a1a' }}>{employee.name_ar}</p>
      {employee.specializations && employee.specializations.length > 0 && (
        <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0', lineHeight: 1.4 }}>
          {employee.specializations.slice(0, 2).join(' · ')}
        </p>
      )}
    </div>
  )
}
