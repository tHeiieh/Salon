'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Users, Calendar, RefreshCw, XCircle, Pencil } from 'lucide-react'
import { cancelSubscription, changeSubscriptionPlan, reactivateSubscription } from './actions'
import { formatCurrency } from '@/lib/utils'

type Plan = { id: string; name_ar: string; price_monthly: number; price_yearly: number }
type Sub = {
  id: string; status: string; billing_cycle: string
  current_period_end: string; created_at: string
  tenant: { slug: string; name?: string } | null
  plan: { name_ar: string; name_en?: string; price_monthly?: number; price_yearly?: number } | null
  tenant_id?: string
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  active:    { bg: '#dcfce7', color: '#16a34a', label: 'نشط' },
  trial:     { bg: '#fef9c3', color: '#a16207', label: 'تجريبي' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'ملغي' },
  expired:   { bg: '#f4f4f5', color: '#71717a', label: 'منتهي' },
}

const inp: React.CSSProperties = {
  width: '100%', height: 38, border: '1.5px solid #e5e5e5', borderRadius: 9,
  padding: '0 12px', fontSize: 13, backgroundColor: '#fff', outline: 'none',
}

export function SubsClient({ subs: initial, plans, stats }: {
  subs: Sub[]
  plans: Plan[]
  stats: { active: number; trial: number; mrr: number }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [changeModal, setChangeModal] = useState<Sub | null>(null)
  const [changePlanId, setChangePlanId] = useState('')
  const [changeCycle, setChangeCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [confirmCancel, setConfirmCancel] = useState<Sub | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => initial.filter(s => {
    const name = s.tenant?.name || s.tenant?.slug || ''
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  }), [initial, search, statusFilter])

  async function doCancel(id: string) {
    setError(null)
    startTransition(async () => {
      try { await cancelSubscription(id); setConfirmCancel(null); router.refresh() }
      catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  async function doReactivate(id: string) {
    setError(null)
    startTransition(async () => {
      try { await reactivateSubscription(id); router.refresh() }
      catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  async function doChange() {
    if (!changeModal || !changePlanId) return
    setError(null)
    startTransition(async () => {
      try { await changeSubscriptionPlan(changeModal.id, changePlanId, changeCycle); setChangeModal(null); router.refresh() }
      catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  return (
    <div dir="rtl">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'اشتراكات نشطة',  value: stats.active,                  icon: Users,     color: '#16a34a', bg: '#dcfce7' },
          { label: 'فترة تجريبية',    value: stats.trial,                   icon: Calendar,  color: '#d97706', bg: '#fef3c7' },
          { label: 'MRR الشهري',      value: formatCurrency(stats.mrr),     icon: TrendingUp,color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'ARR السنوي',      value: formatCurrency(stats.mrr*12),  icon: TrendingUp,color: '#C2847A', bg: '#fdf2f0' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={17} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 0', color: '#1a1a1a' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={14} style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
          <input style={{ ...inp, paddingRight: 32 }} placeholder="البحث باسم الصالون..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all','الكل'],['active','نشط'],['trial','تجريبي'],['cancelled','ملغي']].map(([k,l]) => (
            <button key={k} onClick={() => setStatusFilter(k)} style={{
              height: 38, padding: '0 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              backgroundColor: statusFilter===k ? '#C2847A' : '#f0f0f0', color: statusFilter===k ? '#fff' : '#555',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', padding: '10px 20px', backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0', gap: 10 }}>
          {['الصالون','الحالة','الخطة','المبلغ','ينتهي','إجراءات'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>{h}</span>
          ))}
        </div>
        {filtered.map(sub => {
          const sb = STATUS_BADGE[sub.status] || STATUS_BADGE.expired
          return (
            <div key={sub.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', padding: '12px 20px', borderBottom: '1px solid #f9f9f9', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{sub.tenant?.name || sub.tenant?.slug || '—'}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, display: 'inline-block', backgroundColor: sb.bg, color: sb.color }}>{sb.label}</span>
              <span style={{ fontSize: 12, color: '#555' }}>{sub.plan?.name_ar || '—'}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{formatCurrency(sub.billing_cycle === 'monthly' ? sub.plan?.price_monthly ?? 0 : sub.plan?.price_yearly ?? 0)}</span>
              <span style={{ fontSize: 11, color: sub.status==='active' && new Date(sub.current_period_end) < new Date(Date.now()+7*864e5) ? '#dc2626' : '#888' }}>
                {new Date(sub.current_period_end).toLocaleDateString('ar-SA')}
              </span>
              <div style={{ display: 'flex', gap: 5 }}>
                {sub.status !== 'cancelled' && (
                  <button onClick={() => { setChangeModal(sub); setChangePlanId(plans[0]?.id||''); setChangeCycle(sub.billing_cycle as 'monthly'|'yearly') }}
                    style={{ display:'inline-flex', alignItems:'center', gap:4, height:30, padding:'0 10px', borderRadius:7, border:'1.5px solid #e5e5e5', backgroundColor:'#fff', fontSize:11, fontWeight:600, cursor:'pointer', color:'#555' }}>
                    <Pencil size={11} /> تغيير
                  </button>
                )}
                {sub.status === 'active' && (
                  <button onClick={() => setConfirmCancel(sub)}
                    style={{ display:'inline-flex', alignItems:'center', gap:4, height:30, padding:'0 10px', borderRadius:7, border:'none', backgroundColor:'#fee2e2', fontSize:11, fontWeight:600, cursor:'pointer', color:'#dc2626' }}>
                    <XCircle size={11} /> إلغاء
                  </button>
                )}
                {(sub.status === 'cancelled' || sub.status === 'expired') && (
                  <button onClick={() => doReactivate(sub.id)} disabled={isPending}
                    style={{ display:'inline-flex', alignItems:'center', gap:4, height:30, padding:'0 10px', borderRadius:7, border:'none', backgroundColor:'#dcfce7', fontSize:11, fontWeight:600, cursor:'pointer', color:'#16a34a' }}>
                    <RefreshCw size={11} /> إعادة
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {!filtered.length && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#aaa', fontSize: 13 }}>لا توجد اشتراكات</div>
        )}
      </div>

      {error && <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: 8, backgroundColor: '#fee2e2', color: '#dc2626', fontSize: 13 }}>{error}</div>}

      {/* Change Plan Modal */}
      {changeModal && (
        <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target===e.currentTarget && setChangeModal(null)}>
          <div style={{ backgroundColor:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:420 }} dir="rtl">
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 6px' }}>تغيير خطة الاشتراك</h3>
            <p style={{ fontSize:13, color:'#888', margin:'0 0 20px' }}>{changeModal.tenant?.name || changeModal.tenant?.slug}</p>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>الخطة</label>
              <select style={{ ...inp, height:40 }} value={changePlanId} onChange={e => setChangePlanId(e.target.value)}>
                {plans.map(pl => <option key={pl.id} value={pl.id}>{pl.name_ar} — {formatCurrency(pl.price_monthly)}/شهر</option>)}
              </select>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#555', display:'block', marginBottom:5 }}>دورة الفوترة</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['monthly','yearly'] as const).map(c => (
                  <button key={c} onClick={() => setChangeCycle(c)} style={{
                    flex:1, height:36, borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:'1.5px solid',
                    borderColor: changeCycle===c ? '#C2847A' : '#e5e5e5',
                    backgroundColor: changeCycle===c ? '#fdf2f0' : '#fff',
                    color: changeCycle===c ? '#C2847A' : '#555',
                  }}>{c==='monthly'?'شهري':'سنوي'}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={doChange} disabled={isPending} style={{ flex:1, height:42, borderRadius:10, border:'none', cursor:'pointer', backgroundImage:'linear-gradient(135deg,#C2847A,#b06470)', color:'#fff', fontWeight:700, fontSize:14 }}>
                {isPending ? 'جارٍ...' : 'تطبيق التغيير'}
              </button>
              <button onClick={() => setChangeModal(null)} style={{ width:80, height:42, borderRadius:10, border:'1.5px solid #e5e5e5', backgroundColor:'#fff', fontSize:13, color:'#666', cursor:'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm */}
      {confirmCancel && (
        <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target===e.currentTarget && setConfirmCancel(null)}>
          <div style={{ backgroundColor:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:360 }}>
            <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 10px', textAlign:'center' }}>إلغاء الاشتراك</h3>
            <p style={{ fontSize:13, color:'#555', margin:'0 0 24px', textAlign:'center' }}>
              هل تريد إلغاء اشتراك <strong>{confirmCancel.tenant?.name || confirmCancel.tenant?.slug}</strong>؟
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => doCancel(confirmCancel.id)} disabled={isPending} style={{ flex:1, height:42, borderRadius:10, border:'none', cursor:'pointer', backgroundColor:'#dc2626', color:'#fff', fontWeight:700, fontSize:14 }}>
                {isPending ? 'جارٍ...' : 'إلغاء الاشتراك'}
              </button>
              <button onClick={() => setConfirmCancel(null)} style={{ width:80, height:42, borderRadius:10, border:'1.5px solid #e5e5e5', backgroundColor:'#fff', fontSize:13, color:'#666', cursor:'pointer' }}>رجوع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
