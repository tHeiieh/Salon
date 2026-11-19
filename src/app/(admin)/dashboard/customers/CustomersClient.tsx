'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Calendar, ShoppingBag, Plus, Pencil, Trash2, Users } from 'lucide-react'
import { Modal, inputStyle, labelStyle, FormActions } from '@/components/dashboard/Modal'
import { formatDate } from '@/lib/utils'
import { addCustomer, updateCustomer, deleteCustomer } from './actions'

type Customer = {
  id: string
  name: string
  phone: string
  email: string | null
  created_at: string
  notes?: string | null
  appointments: { count: number }[]
}

type FormState = { name: string; phone: string; email: string; notes: string }
const emptyForm: FormState = { name: '', phone: '', email: '', notes: '' }

export function CustomersClient({ customers: initial, total }: { customers: Customer[]; total: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modal, setModal] = useState<'add' | Customer | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null)

  function openAdd() { setForm(emptyForm); setError(null); setModal('add') }
  function openEdit(c: Customer) {
    setForm({ name: c.name, phone: c.phone, email: c.email || '', notes: c.notes || '' })
    setError(null); setModal(c)
  }
  function closeModal() { setModal(null) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('الاسم مطلوب'); return }
    if (!form.phone.trim()) { setError('رقم الجوال مطلوب'); return }
    setError(null)
    startTransition(async () => {
      try {
        if (modal === 'add') await addCustomer(form)
        else if (modal && typeof modal === 'object') await updateCustomer(modal.id, form)
        closeModal(); router.refresh()
      } catch (err: unknown) { setError(err instanceof Error ? err.message : 'حدث خطأ') }
    })
  }

  function confirmDeleteAction() {
    if (!confirmDelete) return
    startTransition(async () => {
      try {
        await deleteCustomer(confirmDelete.id)
        setConfirmDelete(null); router.refresh()
      } catch (err: unknown) {
        setConfirmDelete(null)
        alert(err instanceof Error ? err.message : 'تعذر الحذف')
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>العملاء</h1>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إجمالي {total} عميلة</p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 16px', height: 40, borderRadius: 10, border: 'none',
            backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> إضافة عميلة
        </button>
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
            <p style={{ fontSize: 22, fontWeight: 700, color: '#7c3aed', margin: '2px 0 0' }}>{total}</p>
          </div>
        </div>
      </div>

      {/* Customer list */}
      <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>قائمة العملاء</h2>
        </div>
        {!initial.length ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <Users size={36} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
            <p style={{ margin: 0 }}>لا توجد عملاء بعد</p>
          </div>
        ) : (
          initial.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '12px 20px', borderBottom: '1px solid #f9f9f9',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                backgroundColor: 'rgba(194,132,122,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#C2847A' }}>{c.name.charAt(0)}</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{c.name}</p>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }} dir="ltr">
                  <Phone size={11} /> {c.phone}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', justifyContent: 'flex-end' }}>
                  <ShoppingBag size={11} />
                  <span>{c.appointments?.[0]?.count || 0} حجوزات</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#aaa', justifyContent: 'flex-end', marginTop: 2 }}>
                  <Calendar size={10} />
                  <span>{formatDate(c.created_at)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(c)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e5e5e5',
                    backgroundColor: '#fff', color: '#555', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setConfirmDelete(c)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1.5px solid #fee2e2',
                    backgroundColor: '#fff', color: '#ef4444', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal !== null && (
        <Modal title={modal === 'add' ? 'إضافة عميلة' : 'تعديل بيانات العميلة'} onClose={closeModal}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>الاسم *</label>
              <input style={inputStyle} value={form.name} autoFocus
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="مثال: سارة الغامدي" />
            </div>
            <div>
              <label style={labelStyle}>رقم الجوال *</label>
              <input style={inputStyle} value={form.phone} dir="ltr"
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="05xxxxxxxx" />
            </div>
            <div>
              <label style={labelStyle}>البريد الإلكتروني</label>
              <input style={inputStyle} type="email" value={form.email} dir="ltr"
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="example@email.com" />
            </div>
            <div>
              <label style={labelStyle}>ملاحظات</label>
              <textarea
                style={{ ...inputStyle, height: 80, padding: '10px 12px', resize: 'vertical' }}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
            <FormActions onCancel={closeModal} loading={isPending} submitLabel={modal === 'add' ? 'إضافة' : 'حفظ'} />
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <Modal title="تأكيد الحذف" onClose={() => setConfirmDelete(null)} maxWidth={380}>
          <p style={{ fontSize: 14, color: '#444', margin: '0 0 20px' }}>
            هل أنت متأكدة من حذف <strong>{confirmDelete.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={confirmDeleteAction}
              disabled={isPending}
              style={{
                flex: 1, height: 44, borderRadius: 10, border: 'none',
                backgroundColor: '#ef4444', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {isPending ? 'جارٍ الحذف...' : 'حذف'}
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              style={{
                width: 90, height: 44, borderRadius: 10,
                border: '1.5px solid #e5e5e5', backgroundColor: '#fff',
                fontSize: 14, color: '#666', cursor: 'pointer',
              }}
            >
              إلغاء
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
