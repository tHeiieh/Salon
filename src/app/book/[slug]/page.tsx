import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { SalonLandingPage } from '@/components/booking/SalonLandingPage'
import type { Service, ServiceCategory, Employee } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const supabase = await createClient()

  // Fetch services with categories
  const { data: categories } = await supabase
    .from('service_categories')
    .select(`
      *,
      services (*)
    `)
    .eq('tenant_id', tenant.tenant_id)
    .eq('is_active', true)
    .order('sort_order')

  // Fetch active employees
  const { data: employees } = await supabase
    .from('employees')
    .select(`
      id, name_ar, name_en, photo_url, bio_ar, bio_en, specializations,
      employee_services (service_id)
    `)
    .eq('tenant_id', tenant.tenant_id)
    .eq('is_active', true)

  return (
    <SalonLandingPage
      tenant={tenant}
      categories={(categories as ServiceCategory[]) || []}
      employees={(employees as unknown as Employee[]) || []}
    />
  )
}
