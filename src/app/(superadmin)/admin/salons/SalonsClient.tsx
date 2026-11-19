'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, ExternalLink, Power, PowerOff, CreditCard, Calendar, Pencil, Trash2 } from 'lucide-react'
import { activateSalon, suspendSalon, assignPlan, extendTrial, updateSalonProfile, deleteSalon } from './actions'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

type Plan = { id: string; name_ar: string; price_monthly: number; price_yearly: number }
type Salon = {
  id: string; slug: string; status: string; created_at: string
  profile: { name_ar?: string; email?: string; phone?: string } | null
  subscription: Array<{
    status: string; current_period_end: string; billing_cycle: string
    plan: { name_ar: string; price_monthly: number; price_yearly: number } | null
  }> | null
}

const STATUS_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'active', label: 'نشط' },
  { key: 'trial', label: 'تجريبي' },
  { key: 'suspended', label: 'موقوف' },
  { key: 'pending', label: 'قيد المراجعة' },
]
const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: '#dcfce7', color: '#16a34a', label: 'نشط' },
  trial: { bg: '#fef9c3', color: '#a16207', label: 'تجريبي' },
  suspended: { bg: '#fee2e2', color: '#dc2626', label: 'موقوف' },
  pending: { bg: '#e0f2fe', color: '#0369a1', label: 'قيد المراجعة' },
  cancelled: { bg: '#f4f4f5', color: '#71717a', label: 'ملغي' },
}

const inp: React.CSSProperties = {
  width: '100%', height: 38, border: '1.5px solid #e5e5e5', borderRadius: 9,
  padding: '0 12px', fontSize: 13, backgroundColor: '#fff', outline: 'none',
}
const btn = (variant: 'primary' | 'danger' | 'ghost' | 'outline'): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  height: 32, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
  cursor: 'pointer', border: 'none', transition: 'opacity 0.15s',
  ...(variant === 'primary' ? { backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)', color: '#fff' } :
     variant === 'danger' ? { backgroundColor: '#fee2e2', color: '#dc2626' } :
     variant === 'ghost' ? { backgroundColor: '#f4f4f5', color: '#555' } :
     { backgroundColor: '#fff', border: '1.5px solid #e5e5e5', color: '#555' }),
})

export function SalonsClient({ salons: initial, plans }: { salons: Salon[]; plans: Plan[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [assignModal, setAssignModal] = useState<Salon | null>(null)
  const [assignPlanId, setAssignPlanId] = useState('')
  const [assignCycle, setAssignCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [confirmAction, setConfirmAction] = useState<{ type: 'activate' | 'suspend'; salon: Salon } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [trialModal, setTrialModal] = useState<Salon | null>(null)
  const [trialDays, setTrialDays] = useState('30')
  const [editModal, setEditModal] = useState<Salon | null>(null)
  const [editForm, setEditForm] = useState({ name_ar: '', email: '', phone: '', city: '' })
  const [deleteModal, setDeleteModal] = useState<Salon | null>(null)

  const filtered = useMemo(() => {
    return initial.filter(s => {
      const p = s.profile
      const name = p?.name_ar || s.slug
      const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || s.slug.includes(search.toLowerCase())
      const matchTab = tab === 'all' || s.status === tab
      return matchSearch && matchTab
    })
  }, [initial, search, tab])

  async function doAction(type: 'activate' | 'suspend', id: string) {
    setError(null)
    startTransition(async () => {
      try {
        if (type === 'activate') await activateSalon(id)
        else await suspendSalon(id)
        setConfirmAction(null)
        router.refresh()
      } catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  async function doAssign() {
    if (!assignModal || !assignPlanId) return
    setError(null)
    startTransition(async () => {
      try {
        await assignPlan(assignModal.id, assignPlanId, assignCycle)
        setAssignModal(null)
        router.refresh()
      } catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  async function doEdit() {
    if (!editModal) return
    setError(null)
    startTransition(async () => {
      try {
        await updateSalonProfile(editModal.id, editForm)
        setEditModal(null)
        router.refresh()
      } catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  async function doDelete() {
    if (!deleteModal) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteSalon(deleteModal.id)
        setDeleteModal(null)
        router.refresh()
      } catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  async function doExtendTrial() {
    if (!trialModal) return
    setError(null)
    startTransition(async () => {
      try {
        await extendTrial(trialModal.id, Number(trialDays) || 30)
        setTrialModal(null)
        router.refresh()
      } catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  return (
    <div dir="rtl">
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
          <input
            style={{ ...inp, paddingRight: 32 }}
            placeholder="البحث باسم الصالون أو الرابط..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            height: 32, padding: '0 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: 'none', transition: 'all 0.15s',
            backgroundColor: tab === t.key ? '#C2847A' : '#f0f0f0',
            color: tab === t.key ? '#fff' : '#555',
          }}>
            {t.label}
            {t.key !== 'all' && (
              <span style={{ marginRight: 5, fontSize: 11, opacity: 0.8 }}>
                ({initial.filter(s => s.status === t.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto',
          padding: '10px 20px', backgroundColor: '#fafafa',
          borderBottom: '1px solid #f0f0f0', gap: 12,
        }}>
          {['الصالون', 'الحالة', 'الاشتراك', 'تاريخ التسجيل', 'إجراءات'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {!filtered.length ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#aaa' }}>
            <Building2 size={36} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: 13 }}>لا توجد نتائج</p>
          </div>
        ) : filtered.map(salon => {
          const p = salon.profile
          const sub = salon.subscription?.[0]
          const sc = STATUS_BADGE[salon.status] || STATUS_BADGE.cancelled
          return (
            <div key={salon.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto',
              padding: '14px 20px', borderBottom: '1px solid #f9f9f9',
              alignItems: 'center', gap: 12,
            }}>
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  backgroundImage: 'linear-gradient(135deg,rgba(194,132,122,0.2),rgba(176,100,112,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={16} style={{ color: '#C2847A' }} />
                </div>
                <div>
                  <Link href={`/admin/salons/${salon.id}`} style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}>
                    {p?.name_ar || salon.slug}
                  </Link>
                  <p style={{ fontSize: 11, color: '#aaa', margin: 0 }} dir="ltr">{salon.slug}</p>
                </div>
              </div>

              {/* Status */}
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                backgroundColor: sc.bg, color: sc.color,
              }}>
                {sc.label}
              </span>

              {/* Subscription */}
              <div>
                {sub ? (
                  <>
                    <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>{sub.plan?.name_ar || '-'}</p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>
                      {formatCurrency(sub.billing_cycle === 'monthly' ? sub.plan?.price_monthly ?? 0 : sub.plan?.price_yearly ?? 0)} · {sub.billing_cycle === 'monthly' ? 'شهري' : 'سنوي'}
                    </p>
                  </>
                ) : <span style={{ fontSize: 12, color: '#aaa' }}>لا يوجد</span>}
              </div>

              {/* Date */}
              <span style={{ fontSize: 12, color: '#888' }}>
                {new Date(salon.created_at).toLocaleDateString('ar-SA')}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                <Link href={`/book/${salon.slug}`} target="_blank">
                  <button style={btn('ghost')} title="فتح الصالون"><ExternalLink size={12} /></button>
                </Link>
                <button style={btn('outline')} onClick={() => {
                  setEditModal(salon)
                  setEditForm({ name_ar: p?.name_ar || '', email: p?.email || '', phone: p?.phone || '', city: (p as {city?:string})?.city || '' })
                }} title="تعديل">
                  <Pencil size={12} />
                </button>
                <button style={btn('outline')} onClick={() => { setAssignModal(salon); setAssignPlanId(plans[0]?.id || ''); setAssignCycle('monthly') }} title="تعيين خطة">
                  <CreditCard size={12} />
                </button>
                <button style={btn('outline')} onClick={() => { setTrialModal(salon); setTrialDays('30') }} title="تمديد التجربة">
                  <Calendar size={12} />
                </button>
                {salon.status === 'active' ? (
                  <button style={btn('danger')} onClick={() => setConfirmAction({ type: 'suspend', salon })} title="إيقاف">
                    <PowerOff size={12} />
                  </button>
                ) : (
                  <button style={{ ...btn('ghost'), color: '#16a34a' }} onClick={() => setConfirmAction({ type: 'activate', salon })} title="تفعيل">
                    <Power size={12} />
                  </button>
                )}
                <button style={{ ...btn('danger'), color: '#dc2626' }} onClick={() => setDeleteModal(salon)} title="حذف">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: 8, backgroundColor: '#fee2e2', color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Assign Plan Modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setAssignModal(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>تعيين خطة اشتراك</h3>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px' }}>
              {assignModal.profile?.name_ar || assignModal.slug}
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>الخطة</label>
              <select
                style={{ ...inp, height: 40 }}
                value={assignPlanId}
                onChange={e => setAssignPlanId(e.target.value)}
              >
                {plans.map(pl => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name_ar} — {formatCurrency(pl.price_monthly)}/شهر
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>دورة الفوترة</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['monthly', 'yearly'] as const).map(c => (
                  <button key={c} onClick={() => setAssignCycle(c)} style={{
                    flex: 1, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: '1.5px solid', transition: 'all 0.15s',
                    borderColor: assignCycle === c ? '#C2847A' : '#e5e5e5',
                    backgroundColor: assignCycle === c ? '#fdf2f0' : '#fff',
                    color: assignCycle === c ? '#C2847A' : '#555',
                  }}>
                    {c === 'monthly' ? 'شهري' : 'سنوي'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={doAssign} disabled={isPending} style={{
                flex: 1, height: 42, borderRadius: 10, border: 'none', cursor: 'pointer',
                backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)', color: '#fff', fontWeight: 700, fontSize: 14,
              }}>
                {isPending ? 'جارٍ التعيين...' : 'تعيين الخطة'}
              </button>
              <button onClick={() => setAssignModal(null)} style={{
                width: 80, height: 42, borderRadius: 10, border: '1.5px solid #e5e5e5',
                backgroundColor: '#fff', fontSize: 13, color: '#666', cursor: 'pointer',
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Trial Modal */}
      {trialModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setTrialModal(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>تمديد الفترة التجريبية</h3>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px' }}>
              {trialModal.profile?.name_ar || trialModal.slug}
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>عدد الأيام</label>
              <input style={inp} type="number" min="1" max="365" value={trialDays} onChange={e => setTrialDays(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={doExtendTrial} disabled={isPending} style={{
                flex: 1, height: 42, borderRadius: 10, border: 'none', cursor: 'pointer',
                backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)', color: '#fff', fontWeight: 700, fontSize: 14,
              }}>
                {isPending ? 'جارٍ التمديد...' : 'تمديد'}
              </button>
              <button onClick={() => setTrialModal(null)} style={{
                width: 80, height: 42, borderRadius: 10, border: '1.5px solid #e5e5e5',
                backgroundColor: '#fff', fontSize: 13, color: '#666', cursor: 'pointer',
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editModal && (
        <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target===e.currentTarget && setEditModal(null)}>
          <div style={{ backgroundColor:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:440 }} dir="rtl">
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 20px' }}>تعديل بيانات الصالون</h3>
            {[
              { key:'name_ar', label:'اسم الصالون', type:'text' },
              { key:'email',   label:'البريد الإلكتروني', type:'email' },
              { key:'phone',   label:'رقم الجوال', type:'tel' },
              { key:'city',    label:'المدينة', type:'text' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>{f.label}</label>
                <input
                  style={inp} type={f.type}
                  value={editForm[f.key as keyof typeof editForm]}
                  onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={doEdit} disabled={isPending} style={{
                flex:1, height:42, borderRadius:10, border:'none', cursor:'pointer',
                backgroundImage:'linear-gradient(135deg,#C2847A,#b06470)', color:'#fff', fontWeight:700, fontSize:14,
              }}>
                {isPending ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
              </button>
              <button onClick={() => setEditModal(null)} style={{
                width:80, height:42, borderRadius:10, border:'1.5px solid #e5e5e5',
                backgroundColor:'#fff', fontSize:13, color:'#666', cursor:'pointer',
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModal && (
        <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target===e.currentTarget && setDeleteModal(null)}>
          <div style={{ backgroundColor:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:360 }}>
            <div style={{ width:48, height:48, borderRadius:14, backgroundColor:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Trash2 size={22} style={{ color:'#dc2626' }} />
            </div>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 10px', textAlign:'center' }}>حذف الصالون</h3>
            <p style={{ fontSize:13, color:'#555', margin:'0 0 6px', textAlign:'center' }}>
              هل أنت متأكد من حذف <strong>{deleteModal.profile?.name_ar || deleteModal.slug}</strong>؟
            </p>
            <p style={{ fontSize:12, color:'#dc2626', margin:'0 0 24px', textAlign:'center' }}>
              سيتم حذف الاشتراك والمدفوعات المرتبطة به نهائياً.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={doDelete} disabled={isPending} style={{
                flex:1, height:42, borderRadius:10, border:'none', cursor:'pointer',
                backgroundColor:'#dc2626', color:'#fff', fontWeight:700, fontSize:14,
              }}>
                {isPending ? 'جارٍ الحذف...' : 'حذف نهائياً'}
              </button>
              <button onClick={() => setDeleteModal(null)} style={{
                width:80, height:42, borderRadius:10, border:'1.5px solid #e5e5e5',
                backgroundColor:'#fff', fontSize:13, color:'#666', cursor:'pointer',
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setConfirmAction(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 360 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>
              {confirmAction.type === 'activate' ? 'تفعيل الصالون' : 'إيقاف الصالون'}
            </h3>
            <p style={{ fontSize: 13, color: '#555', margin: '0 0 20px' }}>
              هل أنت متأكد من {confirmAction.type === 'activate' ? 'تفعيل' : 'إيقاف'}{' '}
              <strong>{confirmAction.salon.profile?.name_ar || confirmAction.salon.slug}</strong>؟
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => doAction(confirmAction.type, confirmAction.salon.id)}
                disabled={isPending}
                style={{
                  flex: 1, height: 42, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  backgroundColor: confirmAction.type === 'activate' ? '#16a34a' : '#dc2626', color: '#fff',
                }}
              >
                {isPending ? 'جارٍ...' : confirmAction.type === 'activate' ? 'تفعيل' : 'إيقاف'}
              </button>
              <button onClick={() => setConfirmAction(null)} style={{
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
