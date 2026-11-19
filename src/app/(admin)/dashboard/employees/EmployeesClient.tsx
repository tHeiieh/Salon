'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Plus, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Modal, inputStyle, labelStyle, FormActions } from '@/components/dashboard/Modal'
import { addEmployee, updateEmployee, deleteEmployee } from './actions'

const DAYS_AR = ['ح', 'ن', 'ث', 'ع', 'خ', 'ج', 'س']
const DAYS_FULL = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

type Employee = {
  id: string
  name_ar: string
  name_en: string
  photo_url?: string
  phone?: string
  is_active: boolean
  specializations?: string[]
  travel_buffer_minutes: number
  schedules: Array<{ day_of_week: number; is_working: boolean; start_time: string; end_time: string }>
  services: Array<{ service: { name_ar: string }[] }>
}

type FormState = { name_ar: string; name_en: string; phone: string; is_active: boolean }
const emptyForm: FormState = { name_ar: '', name_en: '', phone: '', is_active: true }

export function EmployeesClient({ employees: initial }: { employees: Employee[] }) {
  const router = useRouter()
  const [employees, setEmployees] = useState(initial)
  const [modal, setModal] = useState<'add' | Employee | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null)

  function openAdd() { setForm(emptyForm); setError(null); setModal('add') }
  function openEdit(emp: Employee) {
    setForm({ name_ar: emp.name_ar, name_en: emp.name_en || '', phone: emp.phone || '', is_active: emp.is_active })
    setError(null)
    setModal(emp)
  }
  function closeModal() { setModal(null) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name_ar.trim()) { setError('الاسم مطلوب'); return }
    setError(null)
    startTransition(async () => {
      try {
        if (modal === 'add') {
          await addEmployee(form)
        } else if (modal && typeof modal === 'object') {
          await updateEmployee(modal.id, form)
        }
        closeModal()
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'حدث خطأ')
      }
    })
  }

  function handleDelete(emp: Employee) { setConfirmDelete(emp) }

  function confirmDeleteAction() {
    if (!confirmDelete) return
    startTransition(async () => {
      try {
        await deleteEmployee(confirmDelete.id)
        setConfirmDelete(null)
        router.refresh()
      } catch (err: unknown) {
        setConfirmDelete(null)
        alert(err instanceof Error ? err.message : 'تعذر الحذف')
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>الموظفات</h1>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 16px', height: 40, borderRadius: 10, border: 'none',
            backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> إضافة موظفة
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {!employees.length ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0', color: '#aaa' }}>
            <p style={{ margin: 0, fontSize: 14 }}>لا توجد موظفات بعد</p>
          </div>
        ) : (
          employees.map(emp => (
            <div
              key={emp.id}
              style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
                  position: 'relative', backgroundColor: 'rgba(194,132,122,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {emp.photo_url ? (
                    <Image src={emp.photo_url} alt={emp.name_ar} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#C2847A' }}>
                      {emp.name_ar.charAt(0)}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{emp.name_ar}</h3>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0,
                      backgroundColor: emp.is_active ? '#f0fdf4' : '#f5f5f5',
                      color: emp.is_active ? '#16a34a' : '#999',
                    }}>
                      {emp.is_active ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </div>
                  {emp.phone && (
                    <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }} dir="ltr">
                      <Phone size={11} /> {emp.phone}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                    {DAYS_AR.map((day, i) => {
                      const sch = emp.schedules?.find(s => s.day_of_week === i)
                      return (
                        <div key={i} title={DAYS_FULL[i]} style={{
                          width: 26, height: 26, borderRadius: 7,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600,
                          backgroundColor: sch?.is_working ? 'rgba(194,132,122,0.15)' : '#f5f5f5',
                          color: sch?.is_working ? '#C2847A' : '#ccc',
                        }}>
                          {day}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, borderTop: '1px solid #f5f5f5', paddingTop: 12 }}>
                <button
                  onClick={() => openEdit(emp)}
                  style={{
                    flex: 1, height: 34, borderRadius: 8, border: '1.5px solid #e5e5e5',
                    backgroundColor: '#fff', color: '#555', fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <Pencil size={13} /> تعديل
                </button>
                <button
                  onClick={() => handleDelete(emp)}
                  style={{
                    width: 34, height: 34, borderRadius: 8, border: '1.5px solid #fee2e2',
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
        <Modal
          title={modal === 'add' ? 'إضافة موظفة' : 'تعديل موظفة'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>الاسم بالعربية *</label>
              <input
                style={inputStyle}
                value={form.name_ar}
                onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                placeholder="مثال: نورا العتيبي"
                autoFocus
              />
            </div>
            <div>
              <label style={labelStyle}>الاسم بالإنجليزية</label>
              <input
                style={inputStyle}
                value={form.name_en}
                onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                placeholder="e.g. Nora Al-Otaibi"
                dir="ltr"
              />
            </div>
            <div>
              <label style={labelStyle}>رقم الجوال</label>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>نشطة</label>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                style={{
                  width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  backgroundColor: form.is_active ? '#C2847A' : '#e5e5e5',
                  position: 'relative', transition: 'background-color 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3,
                  right: form.is_active ? 3 : 'auto',
                  left: form.is_active ? 'auto' : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: '#fff', transition: 'all 0.2s',
                }} />
              </button>
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
            هل أنت متأكدة من حذف <strong>{confirmDelete.name_ar}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
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
