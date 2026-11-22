'use client'

import { useState, useMemo } from 'react'
import { Search, X, Plus, Minus, ShoppingCart, CreditCard, Banknote, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Service {
  id: string
  name_ar: string
  name_en?: string
  price: number
  duration_minutes?: number
  category_ar?: string
}

interface Employee {
  id: string
  name_ar: string
}

interface CartItem {
  service: Service
  qty: number
}

interface Props {
  services: Service[]
  employees: Employee[]
  tenantId: string
}

const p = '#C2847A'

export function CashierClient({ services, employees, tenantId }: Props) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set<string>()
    services.forEach(s => { if (s.category_ar) cats.add(s.category_ar) })
    return ['all', ...Array.from(cats)]
  }, [services])

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchSearch = !search || s.name_ar.includes(search) || (s.name_en || '').toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategory === 'all' || s.category_ar === activeCategory
      return matchSearch && matchCat
    })
  }, [services, search, activeCategory])

  const total = cart.reduce((sum, item) => sum + item.service.price * item.qty, 0)

  function addToCart(service: Service) {
    setCart(prev => {
      const existing = prev.find(i => i.service.id === service.id)
      if (existing) return prev.map(i => i.service.id === service.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { service, qty: 1 }]
    })
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => {
      const updated = prev.map(i => i.service.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      return updated.filter(i => i.qty > 0)
    })
  }

  async function checkout() {
    if (!cart.length) return
    setLoading(true)
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toTimeString().slice(0, 5)

      const { data: appt, error } = await supabase
        .from('appointments')
        .insert({
          tenant_id: tenantId,
          scheduled_date: today,
          scheduled_start: now,
          status: 'completed',
          final_price: total,
          payment_method: paymentMethod,
          employee_id: selectedEmployee || null,
          source: 'cashier',
        })
        .select('id')
        .single()

      if (error || !appt) throw error

      await supabase.from('appointment_services').insert(
        cart.flatMap(item =>
          Array.from({ length: item.qty }, () => ({
            appointment_id: appt.id,
            service_id: item.service.id,
            service_name_ar: item.service.name_ar,
            price: item.service.price,
          }))
        )
      )

      setSuccess(true)
      setCart([])
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 0, overflow: 'hidden' }}>
      {/* Left: Services */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingLeft: 16 }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 20, height: 1, background: p }} />
            <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>POS</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>الكاشير</h1>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#a89080' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن خدمة..."
            style={{
              width: '100%', padding: '10px 36px 10px 12px', borderRadius: 8,
              border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#fff',
              fontSize: 13, color: '#1a0f0a', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 12, flexShrink: 0 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                backgroundColor: activeCategory === cat ? p : '#fff',
                color: activeCategory === cat ? '#fff' : '#6b5040',
                outline: activeCategory === cat ? 'none' : '1px solid rgba(26,15,10,0.1)',
              }}
            >
              {cat === 'all' ? 'الكل' : cat}
            </button>
          ))}
        </div>

        {/* Service Grid */}
        <div style={{
          flex: 1, overflowY: 'auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, alignContent: 'start',
        }}>
          {filtered.map(service => {
            const inCart = cart.find(i => i.service.id === service.id)
            return (
              <button
                key={service.id}
                onClick={() => addToCart(service)}
                style={{
                  padding: '14px 12px', borderRadius: 8, border: `1.5px solid ${inCart ? p : 'rgba(26,15,10,0.08)'}`,
                  backgroundColor: inCart ? 'rgba(194,132,122,0.06)' : '#fff',
                  cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a0f0a', marginBottom: 4 }}>{service.name_ar}</p>
                {service.category_ar && (
                  <p style={{ margin: 0, fontSize: 10, color: '#a89080', fontWeight: 600, marginBottom: 6 }}>{service.category_ar}</p>
                )}
                <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: p }}>{service.price} ر.س</p>
                {service.duration_minutes && (
                  <p style={{ margin: '4px 0 0', fontSize: 10, color: '#c8b0a0' }}>{service.duration_minutes} دقيقة</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: Cart */}
      <div style={{
        width: 320, flexShrink: 0,
        backgroundColor: '#fff', borderRight: '1px solid rgba(26,15,10,0.08)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        marginRight: 16,
      }}>
        {/* Cart Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(26,15,10,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={16} style={{ color: p }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1a0f0a' }}>الطلب</span>
            {cart.length > 0 && (
              <span style={{
                marginRight: 'auto', fontSize: 11, fontWeight: 700,
                backgroundColor: p, color: '#fff', borderRadius: 20, padding: '1px 8px',
              }}>
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 40, color: '#a89080' }}>
              <ShoppingCart size={32} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
              <p style={{ margin: 0, fontSize: 13 }}>لا توجد خدمات مضافة</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cart.map(item => (
                <div key={item.service.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 0', borderBottom: '1px solid rgba(26,15,10,0.05)',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1a0f0a' }}>{item.service.name_ar}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#a89080' }}>{item.service.price} ر.س × {item.qty}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => updateQty(item.service.id, -1)}
                      style={{ width: 24, height: 24, borderRadius: 999, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#faf8f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={10} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.service.id, 1)}
                      style={{ width: 24, height: 24, borderRadius: 999, border: 'none', backgroundColor: p, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={10} color="#fff" />
                    </button>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a0f0a', minWidth: 52, textAlign: 'left' }}>
                    {(item.service.price * item.qty).toFixed(0)} ر.س
                  </span>
                  <button onClick={() => updateQty(item.service.id, -item.qty)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(26,15,10,0.08)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Employee */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#a89080', display: 'block', marginBottom: 4 }}>الموظفة</label>
            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 8,
                border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#faf8f5',
                fontSize: 13, color: '#1a0f0a', fontFamily: 'inherit', outline: 'none',
              }}
            >
              <option value="">بدون تعيين</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name_ar}</option>)}
            </select>
          </div>

          {/* Payment method */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#a89080', display: 'block', marginBottom: 6 }}>طريقة الدفع</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {(['cash', 'card'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${paymentMethod === method ? p : 'rgba(26,15,10,0.1)'}`,
                    backgroundColor: paymentMethod === method ? 'rgba(194,132,122,0.08)' : '#fff',
                    color: paymentMethod === method ? p : '#6b5040',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit',
                  }}
                >
                  {method === 'cash' ? <Banknote size={14} /> : <CreditCard size={14} />}
                  {method === 'cash' ? 'نقد' : 'بطاقة'}
                </button>
              ))}
            </div>
          </div>

          {/* Total + checkout */}
          <div style={{ borderTop: '1px solid rgba(26,15,10,0.08)', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#6b5040' }}>الإجمالي</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#1a0f0a', letterSpacing: '-0.02em' }}>{total.toFixed(0)} ر.س</span>
            </div>
            {success ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', backgroundColor: '#f0fdf4', borderRadius: 8 }}>
                <CheckCircle size={18} style={{ color: '#16a34a' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>تم الحفظ بنجاح</span>
              </div>
            ) : (
              <button
                onClick={checkout}
                disabled={cart.length === 0 || loading}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 999, border: 'none',
                  backgroundColor: cart.length > 0 ? '#1a0f0a' : 'rgba(26,15,10,0.15)',
                  color: cart.length > 0 ? '#fff' : '#a89080',
                  fontSize: 14, fontWeight: 800, cursor: cart.length > 0 ? 'pointer' : 'default',
                  fontFamily: 'inherit', letterSpacing: '-0.01em',
                }}
              >
                {loading ? 'جارٍ الحفظ...' : `إتمام الدفع · ${total.toFixed(0)} ر.س`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
