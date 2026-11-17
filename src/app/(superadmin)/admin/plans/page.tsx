import { createServiceRoleClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Package } from 'lucide-react'

export default async function PlansPage() {
  const supabase = await createServiceRoleClient()
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price_monthly')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">خطط الاشتراك</h1>
        <p className="text-muted-foreground text-sm mt-1">إدارة خطط وأسعار الاشتراك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(plans || []).map((plan: {
          id: string
          name_ar: string
          name_en: string
          price_monthly: number
          price_yearly: number
          max_employees: number
          max_bookings_per_month: number
          features: string[]
          is_active: boolean
          is_featured: boolean
        }) => (
          <Card key={plan.id} className={`border-2 ${plan.is_featured ? 'border-primary' : 'border-border/50'} relative`}>
            {plan.is_featured && (
              <div className="absolute -top-3 right-1/2 translate-x-1/2">
                <Badge className="bg-primary text-white px-3">الأكثر شيوعاً</Badge>
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name_ar}</CardTitle>
                <Badge variant={plan.is_active ? 'success' : 'secondary'}>
                  {plan.is_active ? 'نشط' : 'معطّل'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(plan.price_monthly)}
                  <span className="text-sm font-normal text-muted-foreground">/شهر</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  أو {formatCurrency(plan.price_yearly)}/سنة (وفّري شهرين)
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <Package className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>حتى <strong>{plan.max_employees}</strong> موظفة</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Package className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>حتى <strong>{plan.max_bookings_per_month}</strong> حجز/شهر</span>
                </div>
                {(plan.features || []).map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
