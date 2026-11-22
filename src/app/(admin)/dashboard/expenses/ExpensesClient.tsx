'use client'

import { useState } from 'react'
import { Plus, X, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Expense {
  id: string
  reference_number: string
  expense_type: string
  amount_before_tax: number
  tax_amount: number
  total_amount: number
  due_date: string
  status: string
  payment_status: string
  payment_method: string
  notes: string
  created_at: string
}

interface Props {
  expenses: Expense[]
  tableExists: boolean
  tenantId: string
}

const SQL_SETUP = `CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  reference_number TEXT,
  expense_type TEXT,
  amount_before_tax NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'submitted',
  payment_status TEXT DEFAULT 'unpaid',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`

const p = '#C2847A'
const TYPES = ['إيجار', 'رواتب', 'مشتريات', 'تسويق', 'صيانة', 'مرافق', 'ضرائب', 'أخرى']

export function ExpensesClient({ expenses: initial, tableExists, tenantId }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [showSetup, setShowSetup] = useState(!tableExists)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    expense_type: '', amount_before_tax: '', tax_amount: '0',
    due_date: '', payment_method: 'cash', notes: '',
  })

  async function handleSubmit() {
    if (!form.expense_type || !form.amount_before_tax) return
    setLoading(true)
    try {
      const supabase = createClient()
      const amount = parseFloat(form.amount_before_tax) || 0
      const tax = parseFloat(form.tax_amount) || 0
      const ref = `EXP-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase.from('expenses').insert({
        tenant_id: tenantId,
        reference_number: ref,
        expense_type: form.expense_type,
        amount_before_tax: amount,
        tax_amount: tax,
        total_amount: amount + tax,
        due_date: form.due_date || null,
        status: 'submitted',
        payment_status: 'paid',
        payment_method: form.payment_method,
        notes: form.notes,
      }).select().single()

      if (!error && data) {
        setExpenses(prev => [data as Expense, ...prev])
        setShowForm(false)
        setForm({ expense_type: '', amount_before_tax: '', tax_amount: '0', due_date: '', payment_method: 'cash', notes: '' })
      }
    } finally {
      setLoading(false)
    }
  }

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.total_amount), 0)

  if (showSetup) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 20, height: 1, background: p }} />
            <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>EXPENSES</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>المصروفات</h1>
        </div>
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <FileText size={40} style={{ margin: '0 auto 12px', color: p, opacity: 0.4 }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a0f0a', margin: '0 0 8px' }}>إعداد جدول المصروفات</h2>
            <p style={{ color: '#a89080', fontSize: 13, margin: 0 }}>لاستخدام هذه الصفحة، قم بتشغيل هذا الـ SQL في Supabase Dashboard</p>
          </div>
          <pre style={{
            background: '#1a0f0a', color: '#faf8f5', borderRadius: 8,
            padding: 20, fontSize: 12, overflowX: 'auto', lineHeight: 1.6,
            fontFamily: 'monospace', marginBottom: 16,
          }}>
            {SQL_SETUP}
          </pre>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => { navigator.clipboard.writeText(SQL_SETUP); }}
              style={{ padding: '10px 24px', borderRadius: 999, border: 'none', backgroundColor: p, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 8 }}
            >
              نسخ SQL
            </button>
            <button
              onClick={() => setShowSetup(false)}
              style={{ padding: '10px 24px', borderRadius: 999, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#fff', color: '#1a0f0a', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
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
            <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>EXPENSES</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>المصروفات</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            borderRadius: 999, border: 'none', backgroundColor: '#1a0f0a', color: '#fff',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plus size={14} />
          مصروف جديد
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        {[
          { label: 'إجمالي المصروفات', value: `${totalExpenses.toFixed(2)} ر.س` },
          { label: 'عدد السجلات', value: expenses.length },
          { label: 'هذا الشهر', value: `${expenses.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).reduce((s, e) => s + Number(e.total_amount), 0).toFixed(2)} ر.س` },
        ].map((s, i) => (
          <div key={i} style={{
            backgroundColor: '#fff', padding: 20,
            borderLeft: i < 2 ? '1px solid rgba(26,15,10,0.06)' : 'none',
          }}>
            <p style={{ fontSize: 11, color: '#a89080', margin: 0, fontWeight: 700 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#1a0f0a', margin: '6px 0 0', letterSpacing: '-0.02em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(26,15,10,0.3)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 8, padding: 28, width: 440,
            border: '1px solid rgba(26,15,10,0.08)', boxShadow: '0 20px 60px rgba(26,15,10,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a0f0a' }}>مصروف جديد</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a89080' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'نوع المصروف', key: 'expense_type', type: 'select' as const },
                { label: 'المبلغ (قبل الضريبة)', key: 'amount_before_tax', type: 'number' as const },
                { label: 'مبلغ الضريبة', key: 'tax_amount', type: 'number' as const },
                { label: 'تاريخ الاستحقاق', key: 'due_date', type: 'date' as const },
                { label: 'ملاحظات', key: 'notes', type: 'text' as const },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#a89080', display: 'block', marginBottom: 4 }}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={form.expense_type}
                      onChange={e => setForm(f => ({ ...f, expense_type: e.target.value }))}
                      style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#faf8f5', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                    >
                      <option value="">اختر النوع</option>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#faf8f5', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    />
                  )}
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

      {/* Table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#a89080' }}>
            <FileText size={36} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: 13 }}>لا توجد مصروفات مسجلة</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,15,10,0.06)' }}>
                {['المرجع', 'النوع', 'المبلغ', 'الضريبة', 'الإجمالي', 'تاريخ الاستحقاق', 'الحالة', 'ملاحظات'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#a89080', letterSpacing: '0.03em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, i) => (
                <tr key={exp.id} style={{ borderBottom: i < expenses.length - 1 ? '1px solid rgba(26,15,10,0.04)' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: p, fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{exp.reference_number}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a0f0a' }}>{exp.expense_type}</td>
                  <td style={{ padding: '12px 16px', color: '#6b5040' }}>{Number(exp.amount_before_tax).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', color: '#6b5040' }}>{Number(exp.tax_amount).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1a0f0a' }}>{Number(exp.total_amount).toFixed(2)} ر.س</td>
                  <td style={{ padding: '12px 16px', color: '#6b5040' }}>{exp.due_date || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                      {exp.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#a89080', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
