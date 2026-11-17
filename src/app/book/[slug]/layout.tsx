import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import type { TenantProfile } from '@/types'
import type { Metadata } from 'next'

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)
  if (!tenant) return {}
  return {
    title: `${tenant.name_ar} | حجز موعد`,
    description: tenant.description_ar || `احجزي موعدك مع ${tenant.name_ar}`,
    themeColor: tenant.primary_color,
  }
}

function TenantStyleInject({ profile }: { profile: TenantProfile }) {
  const style = `
    :root {
      --brand-primary: ${profile.primary_color};
      --brand-secondary: ${profile.secondary_color};
      --brand-accent: ${profile.accent_color};
    }
  `
  return <style dangerouslySetInnerHTML={{ __html: style }} />
}

export default async function BookingLayout({ children, params }: Props) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)

  if (!tenant) notFound()

  return (
    <>
      <TenantStyleInject profile={tenant} />
      <div
        className="min-h-screen"
        style={{
          '--primary': tenant.primary_color,
          backgroundColor: `${tenant.secondary_color}20`,
        } as React.CSSProperties}
        dir="rtl"
        lang="ar"
      >
        {children}
      </div>
    </>
  )
}
