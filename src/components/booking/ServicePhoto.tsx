'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Service, ServiceCategory } from '@/types'
import styles from './service-gallery.module.css'

const PHOTO_RULES = [
  [/مكياج.*عروس|bridal make.?up|wedding make.?up/i, 'bridal-makeup'],
  [/(شعر.*عروس|عروس.*شعر)|bridal (hair|updo)|wedding (hair|updo)/i, 'bridal-hair'],
  [/صبغ|تلوين الشعر|هايلايت|hair colo[u]?r|highlights|balayage/i, 'hair-color'],
  [/قص.*شعر|hair\s?cut|hair trim/i, 'haircut'],
  [/تصفيف|تسريح|استشوار|فرد الشعر|تمليس|hair styl|blow\s?dry|straightening/i, 'hairstyling'],
  [/مكياج.*(خفيف|طبيعي|ناعم)|natural make.?up|light make.?up|soft make.?up/i, 'natural-makeup'],
  [/مكياج|make.?up/i, 'full-makeup'],
  [/جل.*[أا]ظافر|[أا]ظافر.*جل|gel (nail|polish|manicure)/i, 'gel-nails'],
  [/مانيكير|مناكير|باديكير|بدكير|manicure|pedicure/i, 'manicure-pedicure'],
] as const

function fallbackPhoto(service: Service, category?: Pick<ServiceCategory, 'name_ar' | 'name_en'>) {
  const names = [service.name_ar, service.name_en].filter(Boolean).join(' ')
  const specific = PHOTO_RULES.find(([pattern]) => pattern.test(names))
  if (specific) return `/media/services/${specific[1]}.webp`

  const categoryName = [category?.name_ar, category?.name_en].filter(Boolean).join(' ')
  const description = `${names} ${categoryName}`
  if (/عروس|bridal|wedding/i.test(description)) return '/media/services/bridal-hair.webp'
  if (/[أا]ظافر|nails/i.test(description)) return '/media/services/gel-nails.webp'
  if (/شعر|hair/i.test(description)) return '/media/salon-4.jpg'
  if (/مكياج|make.?up/i.test(description)) return '/media/salon-1.jpg'
  if (/سبا|spa/i.test(description)) return '/media/salon-6.jpg'
  return '/media/salon-5.jpg'
}

export function ServicePhoto({
  service, category, sizes,
}: {
  service: Service
  category?: Pick<ServiceCategory, 'name_ar' | 'name_en'>
  sizes: string
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const customSource = service.image_url?.trim()
  const validCustomSource = customSource && /^(\/[^/]|https:\/\/)/i.test(customSource) ? customSource : undefined
  const source = validCustomSource && validCustomSource !== failedSource
    ? validCustomSource
    : fallbackPhoto(service, category)

  return (
    <Image
      className={styles.photo}
      src={source}
      alt=""
      fill
      sizes={sizes}
      unoptimized={source.startsWith('https://')}
      onError={() => { if (source === validCustomSource) setFailedSource(source) }}
    />
  )
}
