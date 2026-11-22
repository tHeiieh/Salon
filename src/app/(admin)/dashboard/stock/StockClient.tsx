'use client'

import { useState } from 'react'
import { Plus, X, Package, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StockItem {
  id: string
  name: string
  category?: string
  quantity: number
  unit: string
  value: number
  alert_threshold?: number
  is_active: boolean
}

interface Props {
  items: StockItem[]
  tableExists: boolean
  tenantId: string
}

const SQL_SETUP = `CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'piece',
  value NUMERIC DEFAULT 0,
  alert_threshold NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`

const p = '#C2847A'

export function StockClient({ items: initial, tableExists, tenantId }: Props) {
  const [items, setItems] = useState<StockItem[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [showSetup, setShowSetup] = useState(!tableExists)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', quantity: '', unit: 'قطعة', value: '', alert_threshold: '' })

  async function handleSubmit() {
    if (!form.name) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('stock_items').insert({
        tenant_id: tenantId,
        name: form.name,
        category: form.category || null,
        quantity: parseFloat(form.quantity) || 0,
        unit: form.unit,
        value: parseFloat(form.value) || 0,
        alert_threshold: form.alert_threshold ? parseFloat(form.alert_threshold) : null,
        is_active: true,
      }).select().single()

      if (!error && data) {
        setItems(prev => [...prev, data as StockItem].sort((a, b) => a.name.localeCompare(b.name)))
        setShowForm(false)
        setForm({ name: '', category: '', quantity: '', unit: 'قطعة', value: '', alert_threshold: '' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateQty(id: string, delta: number) {
    const item = items.find(i => i.id === id)
    if (!item) return
    const newQty = Math.max(0, item.quantity + delta)
    const supabase = createClient()
    await supabase.from('stock_items').update({ quantity: newQty }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i))
  }

  const totalValue = items.reduce((s, i) => s + Number(i.value) * Number(i.quantity), 0)
  const lowStock = items.filter(i => i.alert_threshold && Number(i.quantity) <= Number(i.alert_threshold))
  const outOfStock = items.filter(i => Number(i.quantity) === 0)

  if (showSetup) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 20, height: 1, background: p }} />
            <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>STOCK</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>المخزون</h1>
        </div>
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Package size={40} style={{ margin: '0 auto 12px', color: p, opacity: 0.4 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a0f0a', margin: '0 0 8px' }}>إعداد جدول المخزون</h2>
            <p style={{ color: '#a89080', fontSize: 13, margin: 0 }}>لاستخدام هذه الصفحة، قم بتشغيل هذا الـ SQL في Supabase Dashboard</p>
          </div>
          <pre style={{ background: '#1a0f0a', color: '#faf8f5', borderRadius: 8, padding: 20, fontSize: 12, overflowX: 'auto', lineHeight: 1.6, fontFamily: 'monospace', marginBottom: 16 }}>
            {SQL_SETUP}
          </pre>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button onClick={() => navigator.clipboard.writeText(SQL_SETUP)} style={{ padding: '10px 24px', borderRadius: 999, border: 'none', backgroundColor: p, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              نسخ SQL
            </button>
            <button onClick={() => setShowSetup(false)} style={{ padding: '10px 24px', borderRadius: 999, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#fff', color: '#1a0f0a', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              لقد قمت بتشغيله
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 20, height: 1, background: p }} />
            <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>STOCK</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>المخزون</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 999, border: 'none', backgroundColor: '#1a0f0a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Plus size={14} /> منتج جديد
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        {[
          { label: 'قيمة المخزون', value: `${totalValue.toFixed(2)} ر.س`, color: '#1a0f0a' },
          { label: 'ينفد قريباً', value: lowStock.length, color: '#d97706' },
          { label: 'نفد من المخزون', value: outOfStock.length, color: '#dc2626' },
          { label: 'إجمالي الأصناف', value: items.length, color: '#1a0f0a' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#fff', padding: 20, borderLeft: i < 3 ? '1px solid rgba(26,15,10,0.06)' : 'none' }}>
            <p style={{ fontSize: 11, color: '#a89080', margin: 0, fontWeight: 700 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: s.color, margin: '6px 0 0', letterSpacing: '-0.02em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,15,10,0.3)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 28, width: 440, border: '1px solid rgba(26,15,10,0.08)', boxShadow: '0 20px 60px rgba(26,15,10,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a0f0a' }}>منتج جديد</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a89080' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'اسم المنتج *', key: 'name', type: 'text' },
                { label: 'الفئة', key: 'category', type: 'text' },
                { label: 'الكمية', key: 'quantity', type: 'number' },
                { label: 'الوحدة', key: 'unit', type: 'text' },
                { label: 'سعر الوحدة (ر.س)', key: 'value', type: 'number' },
                { label: 'تنبيه عند الوصول إلى', key: 'alert_threshold', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#a89080', display: 'block', marginBottom: 4 }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#faf8f5', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '11px 0', borderRadius: 999, border: 'none', backgroundColor: '#1a0f0a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {loading ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 999, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#fff', color: '#1a0f0a', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Grid */}
      {items.length === 0 ? (
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, padding: '48px 0', textAlign: 'center', color: '#a89080' }}>
          <Package size={36} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
          <p style={{ margin: 0, fontSize: 13 }}>لا توجد منتجات في المخزون</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {items.map(item => {
            const isLow = item.alert_threshold && Number(item.quantity) <= Number(item.alert_threshold)
            const isOut = Number(item.quantity) === 0
            return (
              <div key={item.id} style={{
                backgroundColor: '#fff', border: `1px solid ${isOut ? '#fecaca' : isLow ? '#fde68a' : 'rgba(26,15,10,0.08)'}`,
                borderRadius: 4, padding: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a0f0a' }}>{item.name}</p>
                    {item.category && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#a89080' }}>{item.category}</p>}
                  </div>
                  {(isLow || isOut) && <AlertTriangle size={14} style={{ color: isOut ? '#dc2626' : '#d97706', flexShrink: 0 }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 999, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#faf8f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>−</button>
                    <span style={{ fontSize: 16, fontWeight: 900, color: isOut ? '#dc2626' : '#1a0f0a', minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: 26, height: 26, borderRadius: 999, border: 'none', backgroundColor: p, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>+</button>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: 10, color: '#a89080' }}>{item.unit}</p>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#6b5040' }}>{Number(item.value).toFixed(0)} ر.س</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
