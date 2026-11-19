import { createClient as createAdminClient } from '@supabase/supabase-js'
import { PlansClient } from './PlansClient'
import { FileText } from 'lucide-react'

export default async function PlansPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: plans } = await admin
    .from('subscription_plans')
    .select('*')
    .order('price_monthly')

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={20} style={{ color: '#C2847A' }} /> خطط الاشتراك
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إنشاء وتعديل خطط اشتراك المنصة</p>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <PlansClient plans={(plans || []) as any} />
    </div>
  )
}
