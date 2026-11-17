import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Plus, ExternalLink, Settings } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default async function SalonsPage() {
  const supabase = await createClient()

  const { data: salons } = await supabase
    .from('tenants')
    .select(`
      *,
      profile:tenant_profiles(*),
      subscription:tenant_subscriptions(*, plan:subscription_plans(name_ar))
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">الصالونات</h1>
        <Button size="sm" className="rounded-xl">
          <Plus className="w-4 h-4" />
          إضافة صالون جديد
        </Button>
      </div>

      <div className="grid gap-4">
        {salons?.map((salon: {
          id: string
          slug: string
          status: string
          created_at: string
          profile: { name_ar?: string; email?: string; phone?: string } | Array<{ name_ar?: string; email?: string; phone?: string }> | null
          subscription: Array<{ status: string; current_period_end: string; plan: { name_ar: string } | null }> | null
        }) => {
          const profile = Array.isArray(salon.profile) ? salon.profile[0] : salon.profile
          const sub = salon.subscription?.[0]
          return (
            <Card key={salon.id} className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{profile?.name_ar || salon.slug}</h3>
                      <p className="text-sm text-muted-foreground">{salon.slug}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {profile?.phone && (
                          <span className="text-xs text-muted-foreground">{profile.phone}</span>
                        )}
                        {profile?.email && (
                          <span className="text-xs text-muted-foreground">{profile.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      salon.status === 'active' ? 'success' :
                      salon.status === 'trial' ? 'warning' :
                      salon.status === 'suspended' ? 'destructive' : 'secondary'
                    }>
                      {salon.status === 'active' ? 'نشط' :
                       salon.status === 'trial' ? 'تجريبي' :
                       salon.status === 'suspended' ? 'موقوف' : salon.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {sub && (
                      <>
                        <span>خطة: <strong>{sub.plan?.name_ar}</strong></span>
                        <span>تنتهي: {format(new Date(sub.current_period_end), 'PP', { locale: ar })}</span>
                      </>
                    )}
                    <span>منذ: {format(new Date(salon.created_at), 'PP', { locale: ar })}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/book/${salon.slug}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!salons?.length && (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>لا توجد صالونات بعد</p>
          <Button size="sm" className="mt-4">
            <Plus className="w-4 h-4" />
            إضافة أول صالون
          </Button>
        </div>
      )}
    </div>
  )
}
