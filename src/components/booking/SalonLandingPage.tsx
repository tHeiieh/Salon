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

  const p = tenant.primary_color
  const a = tenant.accent_color
  const totalServices = allServices.length
  const minPrice = allServices.length > 0 ? Math.min(...allServices.map(s => s.price)) : 0

  return (
    <div className="min-h-screen bg-[#FAF8F5]" dir="rtl">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ height: 'max(70vh, 480px)' }}>
        {tenant.cover_url ? (
          <Image
            src={tenant.cover_url}
            alt={tenant.name_ar}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(145deg, ${p}ee 0%, ${p}99 40%, ${a}cc 100%)`,
            }}
          />
        )}
        {/* gradient overlay */}
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0 }} />

        {/* floating nav bar */}
        <div
          className={`transition-all duration-300 ${scrolled ? 'glass shadow-sm' : ''}`}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}
        >
          <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
            {tenant.logo_url && (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/60 shadow-sm">
                <Image src={tenant.logo_url} alt={tenant.name_ar} width={32} height={32} className="object-cover" />
              </div>
            )}
            <div className="flex items-center gap-3 mr-auto">
              {tenant.phone && (
                <a
                  href={`tel:${tenant.phone}`}
                  className="glass rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {tenant.phone}
                </a>
              )}
              {tenant.whatsapp && (
                <a
                  href={`https://wa.me/${tenant.whatsapp?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-3 h-3" width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
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
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} className="p-6 pb-10">
          <div className="max-w-2xl mx-auto">
            {/* logo + name */}
            <div className="flex items-end gap-4 mb-4">
              {tenant.logo_url && (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/80 shadow-xl bg-white flex-shrink-0">
                  <Image src={tenant.logo_url} alt={tenant.name_ar} width={80} height={80} className="object-cover" />
                </div>
              )}
              <div>
                <h1 className="text-white text-3xl font-black drop-shadow-sm leading-tight">{tenant.name_ar}</h1>
                {tenant.name_en && (
                  <p className="text-white/60 text-sm font-medium mt-0.5">{tenant.name_en}</p>
                )}
              </div>
            </div>

            {/* description */}
            {tenant.description_ar && (
              <p className="text-white/85 text-sm leading-relaxed mb-5 max-w-sm">{tenant.description_ar}</p>
            )}

            {/* quick stats row */}
            <div className="flex items-center gap-4 mb-6">
              <div className="glass-dark rounded-xl px-3 py-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-white text-xs font-semibold">{totalServices} خدمة</span>
              </div>
              {minPrice > 0 && (
                <div className="glass-dark rounded-xl px-3 py-2 flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-white text-xs font-semibold">تبدأ من {formatCurrency(minPrice)}</span>
                </div>
              )}
              <div className="glass-dark rounded-xl px-3 py-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-green-300" />
                <span className="text-white text-xs font-semibold">خدمة منزلية</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBookingOpen(true)}
                className="fab flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-base"
                style={{ backgroundColor: p }}
              >
                <Sparkles className="w-5 h-5" />
                احجزي الآن
              </button>
              <button
                onClick={scrollToServices}
                className="glass rounded-2xl px-4 py-3.5 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-white/20 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                الخدمات
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST BADGES ── */}
      <div className="bg-white border-b border-border/40">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-around">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold">دفع آمن</span>
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" style={{ color: p }} />
            <span className="text-xs font-semibold">حجز فوري</span>
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-semibold">متخصصات معتمدات</span>
          </div>
          {tenant.cancellation_hours > 0 && (
            <>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold">إلغاء مجاني</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── SERVICES SECTION ── */}
      <div ref={servicesRef} className="max-w-2xl mx-auto px-4 pt-8 pb-28">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-foreground">خدماتنا</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{totalServices} خدمة متوفرة</p>
          </div>
        </div>

        {/* Category filter tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 custom-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`category-tab flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                activeCategory === 'all'
                  ? 'active text-white border-transparent'
                  : 'bg-white text-muted-foreground border-border hover:border-primary/40'
              }`}
              style={activeCategory === 'all' ? { backgroundColor: p, borderColor: p } : undefined}
            >
              الكل ({totalServices})
            </button>
            {categories.map(cat => {
              const count = (cat.services || []).filter(s => s.is_active).length
              if (count === 0) return null
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`category-tab flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'active text-white border-transparent'
                      : 'bg-white text-muted-foreground border-border hover:border-primary/40'
                  }`}
                  style={activeCategory === cat.id ? { backgroundColor: p, borderColor: p } : undefined}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name_ar}
                  <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                    activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}>{count}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Services grid */}
        <div className="space-y-3 fade-in" key={activeCategory}>
          {displayedServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              primaryColor={p}
              accentColor={a}
              onBook={handleBookService}
            />
          ))}
          {displayedServices.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد خدمات في هذه الفئة</p>
            </div>
          )}
        </div>

        {/* Team section */}
        {employees.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-foreground">فريق العمل</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{employees.length} متخصصة</p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {employees.map(emp => (
                <EmployeeCard key={emp.id} employee={emp} primaryColor={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM CTA ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 glass border-t border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <button
            onClick={() => setBookingOpen(true)}
            className="fab w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-base"
            style={{ backgroundColor: p }}
          >
            <Sparkles className="w-5 h-5" />
            احجزي موعدك الآن
            <ChevronLeft className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Service Card — horizontal layout with image
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
      className="service-card bg-white rounded-2xl overflow-hidden shadow-sm"
      style={{ border: '1px solid hsl(36 15% 88% / 0.6)', display: 'flex', cursor: 'pointer' }}
      onClick={() => onBook(service)}
    >
      {/* Image or color block */}
      {service.image_url ? (
        <div className="relative flex-shrink-0" style={{ width: 112 }}>
          <Image
            src={service.image_url}
            alt={service.name_ar}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: 88,
            background: `linear-gradient(145deg, ${primaryColor}22, ${accentColor}33)`,
            fontSize: '1.75rem',
          }}
        >
          ✨
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-foreground text-base leading-snug">{service.name_ar}</h3>
          {service.description_ar && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{service.description_ar}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {service.duration_minutes} دقيقة
            </span>
            {service.home_visit_surcharge > 0 && (
              <span className="text-xs text-muted-foreground">
                + {formatCurrency(service.home_visit_surcharge)} زيارة
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-black" style={{ color: primaryColor }}>
              {formatCurrency(service.price)}
            </span>
          </div>
          <button
            className="rounded-xl px-4 py-2 text-white text-sm font-bold flex items-center gap-1 shadow-sm"
            style={{ backgroundColor: primaryColor }}
            onClick={e => { e.stopPropagation(); onBook(service) }}
          >
            احجزي
            <ChevronLeft className="w-3.5 h-3.5" />
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
    <div className="flex-shrink-0 w-32 text-center">
      <div
        className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 shadow-sm"
        style={{ borderColor: `${primaryColor}40` }}
      >
        {employee.photo_url ? (
          <Image
            src={employee.photo_url}
            alt={employee.name_ar}
            width={80}
            height={80}
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl"
            style={{ background: `linear-gradient(145deg, ${primaryColor}22, ${primaryColor}44)` }}
          >
            👩
          </div>
        )}
      </div>
      <p className="text-sm font-bold mt-2.5 text-foreground">{employee.name_ar}</p>
      {employee.specializations && employee.specializations.length > 0 && (
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
          {employee.specializations.slice(0, 2).join(' · ')}
        </p>
      )}
    </div>
  )
}
