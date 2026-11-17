import { createClient } from '@/lib/supabase/server'
import type { TenantProfile } from '@/types'

let tenantCache = new Map<string, { data: TenantProfile; ts: number }>()
const CACHE_TTL = 60_000 // 1 minute

export async function getTenantBySlug(slug: string): Promise<TenantProfile | null> {
  const cached = tenantCache.get(slug)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tenants')
    .select(`
      id,
      slug,
      status,
      tenant_profiles (*)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error || !data?.tenant_profiles) return null

  const profile = Array.isArray(data.tenant_profiles)
    ? data.tenant_profiles[0]
    : data.tenant_profiles

  tenantCache.set(slug, { data: profile as TenantProfile, ts: Date.now() })
  return profile as TenantProfile
}

export async function getTenantById(tenantId: string): Promise<TenantProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error) return null
  return data as TenantProfile
}

export function getTenantSlugFromHost(host: string, baseDomain: string): string | null {
  // e.g. "luxe.mysalon.sa" -> "luxe" if baseDomain is "mysalon.sa"
  if (host === baseDomain || host === `www.${baseDomain}`) return null
  if (host.endsWith(`.${baseDomain}`)) {
    return host.replace(`.${baseDomain}`, '')
  }
  return null
}
