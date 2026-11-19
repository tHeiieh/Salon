import { Shield } from 'lucide-react'

export default function AuditPage() {
  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={20} style={{ color: '#C2847A' }} /> سجل التدقيق
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>سجل الأنشطة والإجراءات الإدارية</p>
      </div>
      <div style={{
        backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
        padding: '48px 20px', textAlign: 'center', color: '#aaa',
      }}>
        <Shield size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>سجل التدقيق</p>
        <p style={{ margin: '8px 0 0', fontSize: 13, maxWidth: 400, marginRight: 'auto', marginLeft: 'auto' }}>
          لتفعيل سجل التدقيق، أضف جدول <code style={{ backgroundColor: '#f4f4f5', padding: '2px 6px', borderRadius: 4 }}>admin_audit_logs</code> في Supabase
          وسيتم تسجيل جميع إجراءات المشرفين تلقائياً.
        </p>
      </div>
    </div>
  )
}
