'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Plus, Pencil, Trash2, FolderPlus } from 'lucide-react'
import { Modal, inputStyle, labelStyle, FormActions } from '@/components/dashboard/Modal'
import { formatCurrency } from '@/lib/utils'
import {
  addCategory, updateCategory, deleteCategory,
  addService, updateService, deleteService,
} from './actions'

type Category = {
  id: string
  name_ar: string
  name_en: string
  icon?: string
  is_active: boolean
  services: Service[]
}

type Service = {
  id: string
  name_ar: string
  name_en: string
  price: number
  duration_minutes: number
  is_active: boolean
  home_visit_surcharge: number
  image_url?: string
}

type CatForm = { name_ar: string; name_en: string; icon: string }
type SvcForm = {
  category_id: string; name_ar: string; name_en: string
  price: string; duration_minutes: string; home_visit_surcharge: string; is_active: boolean
}

const emptyCatForm: CatForm = { name_ar: '', name_en: '', icon: '' }
const emptySvcForm = (categoryId = ''): SvcForm => ({
  category_id: categoryId, name_ar: '', name_en: '',
  price: '', duration_minutes: '60', home_visit_surcharge: '0', is_active: true,
})

export function ServicesClient({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [catModal, setCatModal] = useState<'add' | Category | null>(null)
  const [svcModal, setSvcModal] = useState<'add' | Service | null>(null)
  const [catForm, setCatForm] = useState<CatForm>(emptyCatForm)
  const [svcForm, setSvcForm] = useState<SvcForm>(emptySvcForm())
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'cat' | 'svc'; id: string; name: string } | null>(null)

  // ── Category modal handlers ──
  function openAddCat() { setCatForm(emptyCatForm); setError(null); setCatModal('add') }
  function openEditCat(cat: Category) {
    setCatForm({ name_ar: cat.name_ar, name_en: cat.name_en || '', icon: cat.icon || '' })
    setError(null); setCatModal(cat)
  }
  function closeCatModal() { setCatModal(null) }

  function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!catForm.name_ar.trim()) { setError('اسم التصنيف مطلوب'); return }
    setError(null)
    startTransition(async () => {
      try {
        if (catModal === 'add') await addCategory(catForm)
        else if (catModal && typeof catModal === 'object') await updateCategory(catModal.id, catForm)
        closeCatModal(); router.refresh()
      } catch (err: unknown) { setError(err instanceof Error ? err.message : 'حدث خطأ') }
    })
  }

  // ── Service modal handlers ──
  function openAddSvc(categoryId = '') { setSvcForm(emptySvcForm(categoryId)); setError(null); setSvcModal('add') }
  function openEditSvc(svc: Service, categoryId = '') {
    setSvcForm({
      category_id: categoryId,
      name_ar: svc.name_ar, name_en: svc.name_en || '',
      price: String(svc.price), duration_minutes: String(svc.duration_minutes),
      home_visit_surcharge: String(svc.home_visit_surcharge || 0),
      is_active: svc.is_active,
    })
    setError(null); setSvcModal(svc)
  }
  function closeSvcModal() { setSvcModal(null) }

  function handleSvcSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!svcForm.name_ar.trim()) { setError('اسم الخدمة مطلوب'); return }
    if (!svcForm.price || isNaN(Number(svcForm.price))) { setError('السعر مطلوب'); return }
    setError(null)
    const payload = {
      category_id: svcForm.category_id,
      name_ar: svcForm.name_ar,
      name_en: svcForm.name_en,
      price: Number(svcForm.price),
      duration_minutes: Number(svcForm.duration_minutes) || 60,
      home_visit_surcharge: Number(svcForm.home_visit_surcharge) || 0,
      is_active: svcForm.is_active,
    }
    startTransition(async () => {
      try {
        if (svcModal === 'add') await addService(payload)
        else if (svcModal && typeof svcModal === 'object') await updateService(svcModal.id, payload)
        closeSvcModal(); router.refresh()
      } catch (err: unknown) { setError(err instanceof Error ? err.message : 'حدث خطأ') }
    })
  }

  // ── Delete handler ──
  function confirmDeleteAction() {
    if (!confirmDelete) return
    startTransition(async () => {
      try {
        if (confirmDelete.type === 'cat') await deleteCategory(confirmDelete.id)
        else await deleteService(confirmDelete.id)
        setConfirmDelete(null); router.refresh()
      } catch (err: unknown) {
        setConfirmDelete(null)
        alert(err instanceof Error ? err.message : 'تعذر الحذف')
      }
    })
  }

  const allCategories = initial // used for category select in service form

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>الخدمات</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={openAddCat}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 14px', height: 40, borderRadius: 10,
              border: '1.5px solid #e5e5e5', backgroundColor: '#fff',
              color: '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <FolderPlus size={15} /> تصنيف جديد
          </button>
          <button
            onClick={() => openAddSvc()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 16px', height: 40, borderRadius: 10, border: 'none',
              backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> إضافة خدمة
          </button>
        </div>
      </div>

      {!initial.length ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✂️</div>
          <p style={{ margin: 0, fontSize: 14 }}>لا توجد خدمات بعد</p>
        </div>
      ) : (
        initial.map(cat => (
          <div key={cat.id} style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid #f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                {cat.icon && <span style={{ marginLeft: 6 }}>{cat.icon}</span>}
                {cat.name_ar}
                <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400, marginRight: 8 }}>
                  {cat.services?.length || 0} خدمة
                </span>
              </h2>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => openAddSvc(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '0 10px', height: 32, borderRadius: 8,
                    border: '1.5px solid #e5e5e5', backgroundColor: '#fff',
                    color: '#555', fontSize: 12, cursor: 'pointer',
                  }}
                >
                  <Plus size={12} /> خدمة
                </button>
                <button
                  onClick={() => openEditCat(cat)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e5e5e5',
                    backgroundColor: '#fff', color: '#555', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setConfirmDelete({ type: 'cat', id: cat.id, name: cat.name_ar })}
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

            {(cat.services || []).length === 0 ? (
              <p style={{ padding: '16px 20px', fontSize: 13, color: '#aaa', margin: 0 }}>لا توجد خدمات في هذا التصنيف</p>
            ) : (
              (cat.services || []).map(svc => (
                <div key={svc.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '12px 20px', borderBottom: '1px solid #f9f9f9',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{svc.name_ar}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#C2847A' }}>{formatCurrency(svc.price)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888' }}>
                        <Clock size={11} /> {svc.duration_minutes} دقيقة
                      </span>
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    backgroundColor: svc.is_active ? '#f0fdf4' : '#f5f5f5',
                    color: svc.is_active ? '#16a34a' : '#999', flexShrink: 0,
                  }}>
                    {svc.is_active ? 'نشط' : 'مخفي'}
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => openEditSvc(svc, cat.id)}
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e5e5e5',
                        backgroundColor: '#fff', color: '#555', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ type: 'svc', id: svc.id, name: svc.name_ar })}
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
        ))
      )}

      {/* Category Modal */}
      {catModal !== null && (
        <Modal title={catModal === 'add' ? 'تصنيف جديد' : 'تعديل تصنيف'} onClose={closeCatModal}>
          <form onSubmit={handleCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>الاسم بالعربية *</label>
              <input style={inputStyle} value={catForm.name_ar} autoFocus
                onChange={e => setCatForm(f => ({ ...f, name_ar: e.target.value }))}
                placeholder="مثال: العناية بالبشرة" />
            </div>
            <div>
              <label style={labelStyle}>الاسم بالإنجليزية</label>
              <input style={inputStyle} value={catForm.name_en} dir="ltr"
                onChange={e => setCatForm(f => ({ ...f, name_en: e.target.value }))}
                placeholder="e.g. Skin Care" />
            </div>
            <div>
              <label style={labelStyle}>أيقونة (إيموجي)</label>
              <input style={inputStyle} value={catForm.icon}
                onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="مثال: 💅 أو ✂️" />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
            <FormActions onCancel={closeCatModal} loading={isPending} submitLabel={catModal === 'add' ? 'إضافة' : 'حفظ'} />
          </form>
        </Modal>
      )}

      {/* Service Modal */}
      {svcModal !== null && (
        <Modal title={svcModal === 'add' ? 'إضافة خدمة' : 'تعديل خدمة'} onClose={closeSvcModal}>
          <form onSubmit={handleSvcSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>التصنيف</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={svcForm.category_id}
                onChange={e => setSvcForm(f => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">بدون تصنيف</option>
                {allCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name_ar}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>اسم الخدمة بالعربية *</label>
              <input style={inputStyle} value={svcForm.name_ar} autoFocus
                onChange={e => setSvcForm(f => ({ ...f, name_ar: e.target.value }))}
                placeholder="مثال: مانيكير كلاسيك" />
            </div>
            <div>
              <label style={labelStyle}>اسم الخدمة بالإنجليزية</label>
              <input style={inputStyle} value={svcForm.name_en} dir="ltr"
                onChange={e => setSvcForm(f => ({ ...f, name_en: e.target.value }))}
                placeholder="e.g. Classic Manicure" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>السعر (ريال) *</label>
                <input style={inputStyle} type="number" min="0" step="0.5"
                  value={svcForm.price} dir="ltr"
                  onChange={e => setSvcForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="150" />
              </div>
              <div>
                <label style={labelStyle}>المدة (دقيقة)</label>
                <input style={inputStyle} type="number" min="5" step="5"
                  value={svcForm.duration_minutes} dir="ltr"
                  onChange={e => setSvcForm(f => ({ ...f, duration_minutes: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>رسوم الزيارة المنزلية (ريال)</label>
              <input style={inputStyle} type="number" min="0" step="0.5"
                value={svcForm.home_visit_surcharge} dir="ltr"
                onChange={e => setSvcForm(f => ({ ...f, home_visit_surcharge: e.target.value }))}
                placeholder="0" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>نشط ومتاح للحجز</label>
              <button
                type="button"
                onClick={() => setSvcForm(f => ({ ...f, is_active: !f.is_active }))}
                style={{
                  width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  backgroundColor: svcForm.is_active ? '#C2847A' : '#e5e5e5',
                  position: 'relative', transition: 'background-color 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3,
                  right: svcForm.is_active ? 3 : 'auto',
                  left: svcForm.is_active ? 'auto' : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: '#fff', transition: 'all 0.2s',
                }} />
              </button>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
            <FormActions onCancel={closeSvcModal} loading={isPending} submitLabel={svcModal === 'add' ? 'إضافة' : 'حفظ'} />
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <Modal title="تأكيد الحذف" onClose={() => setConfirmDelete(null)} maxWidth={380}>
          <p style={{ fontSize: 14, color: '#444', margin: '0 0 20px' }}>
            هل أنت متأكدة من حذف <strong>{confirmDelete.name}</strong>؟
            {confirmDelete.type === 'cat' && ' سيتم حذف جميع الخدمات في هذا التصنيف.'}
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
