'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, CheckCircle, Package, ToggleLeft, ToggleRight } from 'lucide-react'
import { addPlan, updatePlan, deletePlan, togglePlanActive, type PlanData } from './actions'
import { formatCurrency } from '@/lib/utils'

type Plan = {
  id: string; name_ar: string; name_en: string
  description_ar?: string; description_en?: string
  price_monthly: number; price_yearly: number
  max_employees: number; max_services: number; max_branches: number
  features: string[]
  is_active: boolean; is_featured: boolean
  allow_custom_domain: boolean; allow_advanced_reports: boolean
  allow_promotions: boolean; allow_multi_branch: boolean
}

const emptyForm = (): PlanData => ({
  name_ar: '', name_en: '', description_ar: '', description_en: '',
  price_monthly: 0, price_yearly: 0,
  max_employees: 5, max_services: 20, max_branches: 1,
  features: [],
  is_active: true, is_featured: false,
  allow_custom_domain: false, allow_advanced_reports: false,
  allow_promotions: false, allow_multi_branch: false,
})

const inp: React.CSSProperties = {
  width: '100%', height: 40, border: '1.5px solid #e5e5e5', borderRadius: 9,
  padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }
const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
      <button type="button" onClick={() => onChange(!checked)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: checked ? '#C2847A' : '#ccc' }}>
        {checked ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
      </button>
      {label}
    </label>
  )
}

export function PlansClient({ plans: initial }: { plans: Plan[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modal, setModal] = useState<'add' | Plan | null>(null)
  const [form, setForm] = useState<PlanData>(emptyForm())
  const [featuresText, setFeaturesText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Plan | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openAdd() {
    const f = emptyForm()
    setForm(f); setFeaturesText(''); setError(null); setModal('add')
  }
  function openEdit(p: Plan) {
    setForm({ ...p })
    setFeaturesText((p.features || []).join('\n'))
    setError(null); setModal(p)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name_ar.trim()) { setError('الاسم بالعربية مطلوب'); return }
    const data: PlanData = { ...form, features: featuresText.split('\n').map(s => s.trim()).filter(Boolean) }
    setError(null)
    startTransition(async () => {
      try {
        if (modal === 'add') await addPlan(data)
        else if (modal && typeof modal === 'object') await updatePlan(modal.id, data)
        setModal(null); router.refresh()
      } catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  function handleDelete() {
    if (!confirmDelete) return
    startTransition(async () => {
      try {
        await deletePlan(confirmDelete.id)
        setConfirmDelete(null); router.refresh()
      } catch (e) {
        setConfirmDelete(null)
        alert(e instanceof Error ? e.message : 'تعذر الحذف')
      }
    })
  }

  function handleToggle(id: string, is_active: boolean) {
    startTransition(async () => {
      try {
        await togglePlanActive(id, !is_active)
        router.refresh()
      } catch (e) { alert(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  const f = (k: keyof PlanData) => ({
    value: form[k] as string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.type === 'number' ? Number(e.target.value) : e.target.value
      setForm(prev => ({ ...prev, [k]: v }))
    },
  })

  return (
    <div dir="rtl">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 16px', borderRadius: 10,
          border: 'none', backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)', color: '#fff',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> إضافة خطة جديدة
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {initial.map(plan => (
          <div key={plan.id} style={{
            backgroundColor: '#fff', borderRadius: 16, border: `2px solid ${plan.is_featured ? '#C2847A' : '#f0f0f0'}`,
            overflow: 'hidden', position: 'relative',
          }}>
            {plan.is_featured && (
              <div style={{
                position: 'absolute', top: 12, left: 12,
                backgroundColor: '#C2847A', color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              }}>الأكثر شيوعاً</div>
            )}
            <div style={{ padding: '20px 20px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{plan.name_ar}</h3>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  backgroundColor: plan.is_active ? '#dcfce7' : '#f4f4f5',
                  color: plan.is_active ? '#16a34a' : '#71717a',
                }}>
                  {plan.is_active ? 'نشط' : 'معطّل'}
                </span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#C2847A' }}>{formatCurrency(plan.price_monthly)}</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>/شهر</span>
                <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>
                  أو {formatCurrency(plan.price_yearly)}/سنة
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555' }}>
                  <Package size={12} style={{ color: '#C2847A' }} />
                  <span>حتى {plan.max_employees} موظفة</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555' }}>
                  <Package size={12} style={{ color: '#C2847A' }} />
                  <span>حتى {plan.max_services} خدمة · {plan.max_branches} فروع</span>
                </div>
                {(plan.features || []).slice(0, 3).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555' }}>
                    <CheckCircle size={12} style={{ color: '#16a34a' }} />
                    <span>{f}</span>
                  </div>
                ))}
                {(plan.features || []).length > 3 && (
                  <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>+{plan.features.length - 3} ميزة أخرى</p>
                )}
              </div>
            </div>
            <div style={{
              display: 'flex', gap: 8, padding: '12px 20px',
              borderTop: '1px solid #f5f5f5', backgroundColor: '#fafafa',
            }}>
              <button onClick={() => openEdit(plan)} style={{
                flex: 1, height: 32, borderRadius: 8, border: '1.5px solid #e5e5e5', backgroundColor: '#fff',
                fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                <Pencil size={12} /> تعديل
              </button>
              <button onClick={() => handleToggle(plan.id, plan.is_active)} disabled={isPending} style={{
                flex: 1, height: 32, borderRadius: 8, border: '1.5px solid #e5e5e5', backgroundColor: '#fff',
                fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer',
              }}>
                {plan.is_active ? 'تعطيل' : 'تفعيل'}
              </button>
              <button onClick={() => setConfirmDelete(plan)} style={{
                width: 32, height: 32, borderRadius: 8, border: '1.5px solid #fee2e2', backgroundColor: '#fff',
                color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px' }}>
              {modal === 'add' ? 'إضافة خطة جديدة' : 'تعديل الخطة'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={row2}>
                <div>
                  <label style={lbl}>الاسم بالعربية *</label>
                  <input style={inp} {...f('name_ar')} autoFocus placeholder="مثال: المحترف" />
                </div>
                <div>
                  <label style={lbl}>الاسم بالإنجليزية</label>
                  <input style={inp} {...f('name_en')} placeholder="e.g. Professional" dir="ltr" />
                </div>
              </div>
              <div style={row2}>
                <div>
                  <label style={lbl}>السعر الشهري (ريال)</label>
                  <input style={inp} type="number" min="0" step="1" {...f('price_monthly')} />
                </div>
                <div>
                  <label style={lbl}>السعر السنوي (ريال)</label>
                  <input style={inp} type="number" min="0" step="1" {...f('price_yearly')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>حد الموظفات</label>
                  <input style={inp} type="number" min="1" {...f('max_employees')} />
                </div>
                <div>
                  <label style={lbl}>حد الخدمات</label>
                  <input style={inp} type="number" min="1" {...f('max_services')} />
                </div>
                <div>
                  <label style={lbl}>حد الفروع</label>
                  <input style={inp} type="number" min="1" {...f('max_branches')} />
                </div>
              </div>
              <div>
                <label style={lbl}>المميزات (سطر لكل ميزة)</label>
                <textarea
                  style={{ ...inp, height: 80, padding: '8px 12px', resize: 'vertical' }}
                  value={featuresText}
                  onChange={e => setFeaturesText(e.target.value)}
                  placeholder="مثال:&#10;رابط حجز مخصص&#10;دعم أولوي&#10;تقارير متقدمة"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Toggle checked={form.is_active} onChange={v => setForm(p => ({ ...p, is_active: v }))} label="الخطة نشطة" />
                <Toggle checked={form.is_featured} onChange={v => setForm(p => ({ ...p, is_featured: v }))} label="الأكثر شيوعاً" />
                <Toggle checked={form.allow_custom_domain} onChange={v => setForm(p => ({ ...p, allow_custom_domain: v }))} label="نطاق مخصص" />
                <Toggle checked={form.allow_advanced_reports} onChange={v => setForm(p => ({ ...p, allow_advanced_reports: v }))} label="تقارير متقدمة" />
                <Toggle checked={form.allow_promotions} onChange={v => setForm(p => ({ ...p, allow_promotions: v }))} label="كودات الخصم" />
                <Toggle checked={form.allow_multi_branch} onChange={v => setForm(p => ({ ...p, allow_multi_branch: v }))} label="متعدد الفروع" />
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" disabled={isPending} style={{
                  flex: 1, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
                  backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)', color: '#fff', fontWeight: 700, fontSize: 14,
                }}>
                  {isPending ? 'جارٍ الحفظ...' : modal === 'add' ? 'إضافة الخطة' : 'حفظ التغييرات'}
                </button>
                <button type="button" onClick={() => setModal(null)} style={{
                  width: 90, height: 44, borderRadius: 10, border: '1.5px solid #e5e5e5',
                  backgroundColor: '#fff', fontSize: 13, color: '#666', cursor: 'pointer',
                }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 360 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>تأكيد الحذف</h3>
            <p style={{ fontSize: 13, color: '#555', margin: '0 0 20px' }}>
              هل أنت متأكد من حذف خطة <strong>{confirmDelete.name_ar}</strong>؟
              لا يمكن حذفها إذا كانت هناك اشتراكات نشطة عليها.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDelete} disabled={isPending} style={{
                flex: 1, height: 42, borderRadius: 10, border: 'none',
                backgroundColor: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer',
              }}>
                {isPending ? 'جارٍ الحذف...' : 'حذف'}
              </button>
              <button onClick={() => setConfirmDelete(null)} style={{
                width: 80, height: 42, borderRadius: 10, border: '1.5px solid #e5e5e5',
                backgroundColor: '#fff', fontSize: 13, color: '#666', cursor: 'pointer',
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
