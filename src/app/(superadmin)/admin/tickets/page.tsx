import { ClipboardList } from 'lucide-react'

export default function TicketsPage() {
  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClipboardList size={20} style={{ color: '#C2847A' }} /> تذاكر الدعم
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إدارة طلبات الدعم الفني من الصالونات</p>
      </div>
      <div style={{
        backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
        padding: '48px 20px', textAlign: 'center', color: '#aaa',
      }}>
        <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>نظام تذاكر الدعم</p>
        <p style={{ margin: '8px 0 0', fontSize: 13, maxWidth: 400, marginRight: 'auto', marginLeft: 'auto', lineHeight: 1.6 }}>
          يمكن توصيل هذا القسم بمزود خارجي مثل Intercom أو Crisp،
          أو إنشاء جدول <code style={{ backgroundColor: '#f4f4f5', padding: '2px 6px', borderRadius: 4 }}>support_tickets</code> في Supabase
          لنظام دعم داخلي.
        </p>
      </div>
    </div>
  )
}
