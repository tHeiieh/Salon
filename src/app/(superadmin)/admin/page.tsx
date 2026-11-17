import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, TrendingUp, CreditCard, Activity, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalTenants },
    { count: activeTenants },
    { count: trialTenants },
    { data: recentTenants },
    { data: recentPayments },
  ] = await Promise.all([
    supabase.from('tenants').select('id', { count: 'exact', head: true }),
    supabase.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'trial'),
    supabase.from('tenants').select('id, slug, status, created_at, tenant_profiles(name_ar)')
      .order('created_at', { ascending: false }).limit(10),
    supabase.from('platform_payments').select('amount, status, created_at, tenants(slug, tenant_profiles(name_ar))')
      .order('created_at', { ascending: false }).limit(10),
  ])

  const stats = [
    { label: 'إجمالي الصالونات', value: totalTenants || 0, icon: Building2, color: 'text-blue-600' },
    { label: 'الصالونات النشطة', value: activeTenants || 0, icon: Activity, color: 'text-green-600' },
    { label: 'فترة تجريبية', value: trialTenants || 0, icon: AlertCircle, color: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم الرئيسية</h1>
        <p className="text-muted-foreground text-sm mt-1">إدارة منصة الصالونات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${stat.color.replace('text-', '')}/10`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Salons */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">أحدث الصالونات</CardTitle>
              <Link href="/admin/salons" className="text-xs text-primary hover:underline">عرض الكل</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentTenants?.map((tenant: {
                id: string
                slug: string
                status: string
                created_at: string
                tenant_profiles: { name_ar?: string } | Array<{ name_ar?: string }> | null
              }) => {
                const profile = Array.isArray(tenant.tenant_profiles) ? tenant.tenant_profiles[0] : tenant.tenant_profiles
                return (
                  <div key={tenant.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{profile?.name_ar || tenant.slug}</p>
                      <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                    </div>
                    <Badge variant={
                      tenant.status === 'active' ? 'success' :
                      tenant.status === 'trial' ? 'warning' : 'secondary'
                    }>
                      {tenant.status === 'active' ? 'نشط' : tenant.status === 'trial' ? 'تجريبي' : tenant.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">المدفوعات الأخيرة</CardTitle>
              <Link href="/admin/billing" className="text-xs text-primary hover:underline">عرض الكل</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentPayments?.map((payment: {
                id?: string
                amount: number
                status: string
                created_at: string
              }, i: number) => (
                <div key={i} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <Badge variant={payment.status === 'paid' ? 'success' : 'warning'}>
                    {payment.status === 'paid' ? 'مدفوع' : 'معلق'}
                  </Badge>
                </div>
              ))}
              {!recentPayments?.length && (
                <div className="text-center py-8 text-muted-foreground text-sm">لا توجد مدفوعات بعد</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
