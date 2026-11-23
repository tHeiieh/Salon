import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'

export async function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl
  if (pathname === '/demo-payment') return NextResponse.next()

  // Create supabase client for auth
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Determine tenant slug from subdomain
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  let tenantSlug: string | null = null

  if (!isLocalhost) {
    const cleanHost = host.split(':')[0]
    const cleanBase = BASE_DOMAIN.split(':')[0]
    if (cleanHost !== cleanBase && cleanHost !== `www.${cleanBase}`) {
      if (cleanHost.endsWith(`.${cleanBase}`)) {
        tenantSlug = cleanHost.replace(`.${cleanBase}`, '')
      }
    }
  } else {
    // Dev: use ?tenant= query param or x-tenant header
    tenantSlug = request.nextUrl.searchParams.get('tenant') ||
                  request.headers.get('x-tenant-slug')
  }

  // Inject tenant slug into headers for use in layouts/pages
  if (tenantSlug) {
    supabaseResponse.headers.set('x-tenant-slug', tenantSlug)
  }

  // Protect admin routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  if (pathname.startsWith('/portal')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
