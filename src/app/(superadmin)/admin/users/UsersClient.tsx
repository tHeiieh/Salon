'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Mail, UserPlus, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { inviteAdmin, removeAdmin } from './actions'

type Admin = { id: string; email: string; role: string; confirmed: boolean; created_at: string }

const inp: React.CSSProperties = {
  width: '100%', height: 40, border: '1.5px solid #e5e5e5', borderRadius: 9,
  padding: '0 12px', fontSize: 13, backgroundColor: '#fff', outline: 'none',
}

export function UsersClient({ admins: initial, currentUserId }: { admins: Admin[]; currentUserId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showInvite, setShowInvite] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [deleteModal, setDeleteModal] = useState<Admin | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function doInvite() {
    if (!form.email || !form.password) return
    setError(null); setSuccess(null)
    startTransition(async () => {
      try {
        await inviteAdmin(form.email, form.password)
        setForm({ email: '', password: '' })
        setShowInvite(false)
        setSuccess(`تم إنشاء حساب ${form.email} بنجاح`)
        router.refresh()
      } catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  async function doRemove() {
    if (!deleteModal) return
    setError(null)
    startTransition(async () => {
      try {
        await removeAdmin(deleteModal.id, currentUserId)
        setDeleteModal(null)
        router.refresh()
      } catch (e) { setError(e instanceof Error ? e.message : 'حدث خطأ') }
    })
  }

  return (
    <div dir="rtl">
      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#888' }}>{initial.length} مشرف</span>
        <button onClick={() => { setShowInvite(true); setError(null); setSuccess(null) }} style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 16px', borderRadius: 10,
          border: 'none', cursor: 'pointer', backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)',
          color: '#fff', fontWeight: 700, fontSize: 13,
        }}>
          <UserPlus size={15} /> إضافة مشرف
        </button>
      </div>

      {error && <div style={{ marginBottom: 12, padding: '10px 16px', borderRadius: 8, backgroundColor: '#fee2e2', color: '#dc2626', fontSize: 13 }}>{error}</div>}
      {success && <div style={{ marginBottom: 12, padding: '10px 16px', borderRadius: 8, backgroundColor: '#dcfce7', color: '#16a34a', fontSize: 13 }}>{success}</div>}

      {/* Admins list */}
      <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        {!initial.length ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#aaa' }}>لا يوجد مشرفون</div>
        ) : initial.map(admin => (
          <div key={admin.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f9f9f9' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, backgroundImage: 'linear-gradient(135deg,#C2847A,#D4A96A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>{admin.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#aaa', marginTop: 2 }}>
                <Mail size={11} />
                {admin.confirmed
                  ? <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3 }}><CheckCircle size={11} /> مؤكد</span>
                  : <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 3 }}><XCircle size={11} /> غير مؤكد</span>
                }
                <span style={{ margin: '0 4px' }}>·</span>
                <span>انضم {new Date(admin.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20, backgroundColor: '#fdf2f0', color: '#C2847A', flexShrink: 0 }}>
              مشرف عام
            </span>
            {admin.id !== currentUserId && (
              <button onClick={() => setDeleteModal(admin)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 32, padding: '0 10px', borderRadius: 8, border: 'none', backgroundColor: '#fee2e2', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#dc2626', flexShrink: 0 }}>
                <Trash2 size={12} /> إزالة
              </button>
            )}
            {admin.id === currentUserId && (
              <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>(أنت)</span>
            )}
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowInvite(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }} dir="rtl">
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px' }}>إضافة مشرف جديد</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>البريد الإلكتروني</label>
              <input style={inp} type="email" placeholder="admin@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>كلمة المرور المؤقتة</label>
              <input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={doInvite} disabled={isPending || !form.email || !form.password} style={{
                flex: 1, height: 42, borderRadius: 10, border: 'none', cursor: 'pointer',
                backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)', color: '#fff', fontWeight: 700, fontSize: 14,
                opacity: (!form.email || !form.password) ? 0.6 : 1,
              }}>
                {isPending ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
              </button>
              <button onClick={() => setShowInvite(false)} style={{ width: 80, height: 42, borderRadius: 10, border: '1.5px solid #e5e5e5', backgroundColor: '#fff', fontSize: 13, color: '#666', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setDeleteModal(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 360 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 10px', textAlign: 'center' }}>إزالة المشرف</h3>
            <p style={{ fontSize: 13, color: '#555', margin: '0 0 6px', textAlign: 'center' }}>
              هل تريد إزالة صلاحيات المشرف عن
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 20px', textAlign: 'center' }}>{deleteModal.email}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={doRemove} disabled={isPending} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', cursor: 'pointer', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {isPending ? 'جارٍ...' : 'إزالة الصلاحيات'}
              </button>
              <button onClick={() => setDeleteModal(null)} style={{ width: 80, height: 42, borderRadius: 10, border: '1.5px solid #e5e5e5', backgroundColor: '#fff', fontSize: 13, color: '#666', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
