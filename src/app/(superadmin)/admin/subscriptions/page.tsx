import { createServiceRoleClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, TrendingUp, Users, Calendar } from 'lucide-react'

export default async function SubscriptionsPage() {
  const supabase = await createServiceRoleClient()

  const [{ data: subs }, { data: plans }] = await Promise.all([
    supabase
      .from('tenant_subscriptions')
      .select(`
        id, status, billing_cycle, current_period_start, current_period_end, amount_paid, created_at,
        tenant:tenants(slug, name),
        plan:subscription_plans(name_ar, name_en, price_monthly, price_yearly)
      `)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly'),
  ])

  const active = (subs || []).filter((s: { status: string }) => s.status === 'active').length
  const trial = (subs || []).filter((s: { status: string }) => s.status === 'trial').length
  const totalMrr = (subs || [])
    .filter((s: { status: string; billing_cycle: string; amount_paid: number }) => s.status === 'active' && s.billing_cycle === 'monthly')
    .reduce((sum: number, s: { amount_paid: number }) => sum + Number(s.amount_paid), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الاشتراكات</h1>
        <p className="text-muted-foreground text-sm mt-1">إدارة اشتراكات الصالونات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'اشتراكات نشطة', value: active, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'فترة تجريبية', value: trial, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'MRR (شهري)', value: formatCurrency(totalMrr), icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5' },
        ].map((s, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(plans || []).map((plan: {
          id: string
          name_ar: string
          name_en: string
          price_monthly: number
          price_yearly: number
          max_employees: number
          max_bookings_per_month: number
        }) => (
          <Card key={plan.id} className="border-border/50">
            <CardContent className="p-5">
              <p className="font-bold text-foreground">{plan.name_ar}</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(plan.price_monthly)}<span className="text-sm font-normal text-muted-foreground">/شهر</span></p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>حتى {plan.max_employees} موظفة</p>
                <p>حتى {plan.max_bookings_per_month} حجز/شهر</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriptions list */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">قائمة الاشتراكات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {(subs || []).map((sub: {
              id: string
              status: string
              billing_cycle: string
              current_period_end: string
              amount_paid: number
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tenant: any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              plan: any
            }) => (
              <div key={sub.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{sub.tenant?.name || sub.tenant?.slug}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub.plan?.name_ar} • {sub.billing_cycle === 'monthly' ? 'شهري' : 'سنوي'}
                  </p>
                </div>
                <div className="text-left space-y-1">
                  <div className="flex justify-end">
                    <Badge variant={
                      sub.status === 'active' ? 'success' :
                      sub.status === 'trial' ? 'warning' :
                      sub.status === 'cancelled' ? 'destructive' : 'secondary'
                    }>
                      {sub.status === 'active' ? 'نشط' : sub.status === 'trial' ? 'تجريبي' : sub.status === 'cancelled' ? 'ملغي' : sub.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ينتهي {formatDate(sub.current_period_end)}
                  </p>
                </div>
                <p className="font-bold text-foreground w-24 text-left">{formatCurrency(sub.amount_paid)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
