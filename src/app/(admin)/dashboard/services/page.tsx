import { getAuthContext } from '@/lib/server/getAuthContext'
import { formatCurrency } from '@/lib/utils'
import { Clock } from 'lucide-react'
import Image from 'next/image'

export default async function ServicesPage() {
  const { tenantId, admin } = await getAuthContext()

  const { data: categories } = await admin
    .from('service_categories')
    .select(`*, services(*)`)
    .eq('tenant_id', tenantId)
    .order('sort_order')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>الخدمات</h1>
      </div>

      {!categories?.length ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✂️</div>
          <p style={{ margin: 0, fontSize: 14 }}>لا توجد خدمات بعد</p>
        </div>
      ) : (
        categories.map(cat => (
          <div
            key={cat.id}
            style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}
          >
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                {cat.icon && <span style={{ marginLeft: 6 }}>{cat.icon}</span>}
                {cat.name_ar}
              </h2>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12,
                backgroundColor: '#f5f5f5', color: '#666',
              }}>
                {cat.services?.length || 0} خدمة
              </span>
            </div>
            <div>
              {(cat.services || []).map((service: {
                id: string
                name_ar: string
                price: number
                duration_minutes: number
                is_active: boolean
                image_url?: string
                home_visit_surcharge: number
              }) => (
                <div
                  key={service.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 20px', borderBottom: '1px solid #f9f9f9',
                  }}
                >
                  {service.image_url && (
                    <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                      <Image src={service.image_url} alt={service.name_ar} fill style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{service.name_ar}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#C2847A' }}>
                        {formatCurrency(service.price)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }}>
                        <Clock size={12} />
                        {service.duration_minutes} دقيقة
                      </span>
                      {service.home_visit_surcharge > 0 && (
                        <span style={{ fontSize: 12, color: '#888' }}>
                          +{formatCurrency(service.home_visit_surcharge)} زيارة
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    backgroundColor: service.is_active ? '#f0fdf4' : '#f5f5f5',
                    color: service.is_active ? '#16a34a' : '#999',
                  }}>
                    {service.is_active ? 'نشط' : 'مخفي'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
