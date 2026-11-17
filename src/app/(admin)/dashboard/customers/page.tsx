import { getAuthContext } from '@/lib/server/getAuthContext'
import { formatDate } from '@/lib/utils'
import { Users, Phone, Calendar, ShoppingBag } from 'lucide-react'

export default async function CustomersPage() {
  const { tenantId, admin } = await getAuthContext()

  const [{ data: customers }, { count: totalCount }] = await Promise.all([
    admin
      .from('customers')
      .select(`id, name, phone, email, created_at, appointments(count)`)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(100),
    admin
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>العملاء</h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0 0' }}>
          إجمالي {totalCount || 0} عميلة
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{
          backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0',
          padding: 20, display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>إجمالي العملاء</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#7c3aed', margin: '2px 0 0 0' }}>{totalCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>قائمة العملاء</h2>
        </div>
        {!customers?.length ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <Users size={36} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
            <p style={{ margin: 0 }}>لا توجد عملاء بعد</p>
          </div>
        ) : (
          <div>
            {customers.map((customer: {
              id: string
              name: string
              phone: string
              email: string | null
              created_at: string
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              appointments: any
            }) => (
              <div
                key={customer.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 20px', borderBottom: '1px solid #f9f9f9',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: 'rgba(194,132,122,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#C2847A' }}>
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{customer.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }} dir="ltr">
                      <Phone size={11} />
                      {customer.phone}
                    </span>
                    {customer.email && (
                      <span style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {customer.email}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', justifyContent: 'flex-end' }}>
                    <ShoppingBag size={11} />
                    <span>{(customer.appointments as { count: number }[])?.[0]?.count || 0} حجوزات</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#aaa', justifyContent: 'flex-end', marginTop: 2 }}>
                    <Calendar size={10} />
                    <span>{formatDate(customer.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
