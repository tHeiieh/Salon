import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, addMinutes } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'SAR', locale = 'ar-SA') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date, formatStr = 'PPP', locale: 'ar' | 'en' = 'ar') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: locale === 'ar' ? ar : enUS })
}

export function formatTime(time: string, locale: 'ar' | 'en' = 'ar') {
  const [hours, minutes] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Riyadh',
  }).format(d)
}

export function calculateVAT(amount: number, vatRate = 0.15) {
  return Math.round(amount * vatRate * 100) / 100
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const start = new Date()
  start.setHours(h, m, 0, 0)
  const end = addMinutes(start, durationMinutes)
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
}

export function getLocaleText(obj: { [key: string]: string }, locale: 'ar' | 'en', arKey: string, enKey: string): string {
  return locale === 'ar' ? (obj[arKey] || obj[enKey] || '') : (obj[enKey] || obj[arKey] || '')
}

export function formatPhoneSA(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('966')) return '+' + cleaned
  if (cleaned.startsWith('0')) return '+966' + cleaned.slice(1)
  return '+966' + cleaned
}

export function validateSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return /^(966|0)?5[0-9]{8}$/.test(cleaned)
}

export function generateTimeSlots(startTime: string, endTime: string, intervalMinutes = 30): string[] {
  const slots: string[] = []
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)

  const start = new Date()
  start.setHours(sh, sm, 0, 0)
  const end = new Date()
  end.setHours(eh, em, 0, 0)

  let current = new Date(start)
  while (current < end) {
    slots.push(`${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`)
    current = addMinutes(current, intervalMinutes)
  }
  return slots
}

export function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).getDay()
}

export const SAUDI_CITIES = [
  { id: 'riyadh', name_ar: 'الرياض', name_en: 'Riyadh' },
  { id: 'jeddah', name_ar: 'جدة', name_en: 'Jeddah' },
  { id: 'makkah', name_ar: 'مكة المكرمة', name_en: 'Makkah' },
  { id: 'madinah', name_ar: 'المدينة المنورة', name_en: 'Madinah' },
  { id: 'dammam', name_ar: 'الدمام', name_en: 'Dammam' },
  { id: 'khobar', name_ar: 'الخبر', name_en: 'Al Khobar' },
  { id: 'taif', name_ar: 'الطائف', name_en: 'Taif' },
  { id: 'abha', name_ar: 'أبها', name_en: 'Abha' },
  { id: 'tabuk', name_ar: 'تبوك', name_en: 'Tabuk' },
  { id: 'buraydah', name_ar: 'بريدة', name_en: 'Buraydah' },
]

export const VAT_RATE = 0.15

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  on_the_way: 'bg-purple-100 text-purple-800',
  arrived: 'bg-pink-100 text-pink-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
  no_show: 'bg-red-100 text-red-800',
  payment_pending: 'bg-yellow-100 text-yellow-800',
}

export const APPOINTMENT_STATUS_AR: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  assigned: 'تم التعيين',
  on_the_way: 'في الطريق',
  arrived: 'وصلت',
  in_progress: 'جارٍ التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  rejected: 'مرفوض',
  no_show: 'لم يحضر',
  payment_pending: 'في انتظار الدفع',
}
