export type Locale = 'ar' | 'en'
export type Currency = 'SAR'
export type TimeZone = 'Asia/Riyadh'

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'pending' | 'cancelled'
export type UserRole = 'superadmin' | 'salon_owner' | 'salon_staff' | 'employee' | 'customer'

export type AppointmentStatus =
  | 'pending' | 'confirmed' | 'assigned' | 'on_the_way'
  | 'arrived' | 'in_progress' | 'completed'
  | 'cancelled' | 'rejected' | 'no_show' | 'payment_pending'

export type PaymentMethod = 'cash' | 'online' | 'deposit'
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'failed'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired'
export type BillingCycle = 'monthly' | 'yearly'

export interface Tenant {
  id: string
  slug: string
  status: TenantStatus
  created_at: string
  updated_at: string
}

export interface TenantProfile {
  id: string
  tenant_id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  logo_url?: string
  cover_url?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  phone?: string
  whatsapp?: string
  email?: string
  instagram?: string
  twitter?: string
  snapchat?: string
  tiktok?: string
  custom_domain?: string
  booking_url_slug?: string
  supported_cities: string[]
  default_locale: Locale
  timezone: TimeZone
  currency: Currency
  vat_number?: string
  cr_number?: string
  cancellation_hours: number
  deposit_percentage: number
}

export interface Employee {
  id: string
  tenant_id: string
  user_id?: string
  name_ar: string
  name_en: string
  photo_url?: string
  phone?: string
  specializations?: string[]
  bio_ar?: string
  bio_en?: string
  is_active: boolean
  travel_buffer_minutes: number
  services?: Service[]
  schedules?: EmployeeSchedule[]
}

export interface EmployeeSchedule {
  id: string
  employee_id: string
  tenant_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
}

export interface ServiceCategory {
  id: string
  tenant_id: string
  name_ar: string
  name_en: string
  icon?: string
  sort_order: number
  is_active: boolean
  services?: Service[]
}

export interface Service {
  id: string
  tenant_id: string
  category_id?: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  price: number
  home_visit_surcharge: number
  duration_minutes: number
  prep_time_minutes: number
  image_url?: string
  is_active: boolean
  is_home_service: boolean
  sort_order: number
  category?: ServiceCategory
}

export interface Customer {
  id: string
  tenant_id: string
  user_id?: string
  name: string
  phone: string
  phone_verified: boolean
  email?: string
  locale: Locale
  marketing_consent: boolean
  created_at: string
  addresses?: CustomerAddress[]
}

export interface CustomerAddress {
  id: string
  customer_id: string
  tenant_id: string
  label?: string
  city_ar: string
  city_en: string
  district_ar: string
  district_en: string
  street?: string
  building?: string
  floor?: string
  apartment?: string
  instructions?: string
  lat?: number
  lng?: number
  is_default: boolean
}

export interface CoverageArea {
  id: string
  tenant_id: string
  city_name_ar: string
  city_name_en: string
  district_name_ar: string
  district_name_en: string
  travel_fee: number
  travel_buffer_minutes: number
  is_active: boolean
}

export interface Appointment {
  id: string
  tenant_id: string
  booking_number: string
  customer_id: string
  employee_id?: string
  address_id: string
  status: AppointmentStatus
  scheduled_date: string
  scheduled_start: string
  scheduled_end: string
  total_price: number
  discount_amount: number
  travel_fee: number
  vat_amount: number
  final_price: number
  payment_method?: PaymentMethod
  payment_status: PaymentStatus
  deposit_amount: number
  notes?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
  customer?: Customer
  employee?: Employee
  address?: CustomerAddress
  services?: AppointmentService[]
}

export interface AppointmentService {
  id: string
  appointment_id: string
  service_id: string
  tenant_id: string
  service_name_ar: string
  service_name_en: string
  price: number
  duration_minutes: number
}

export interface Payment {
  id: string
  tenant_id: string
  appointment_id?: string
  amount: number
  currency: Currency
  payment_method: string
  status: PaymentStatus
  tap_charge_id?: string
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  price_monthly: number
  price_yearly: number
  max_employees: number
  max_services: number
  max_branches: number
  features: string[]
  allow_custom_domain: boolean
  allow_advanced_reports: boolean
  allow_promotions: boolean
  allow_multi_branch: boolean
  is_active: boolean
}

export interface TenantSubscription {
  id: string
  tenant_id: string
  plan_id: string
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  current_period_start: string
  current_period_end: string
  trial_end?: string
  plan?: SubscriptionPlan
}

export interface Coupon {
  id: string
  tenant_id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_uses?: number
  used_count: number
  valid_from?: string
  valid_until?: string
  is_active: boolean
}

export interface Review {
  id: string
  tenant_id: string
  appointment_id: string
  customer_id: string
  employee_id?: string
  rating: number
  comment?: string
  is_visible: boolean
  created_at: string
}

// Booking flow state
export interface BookingState {
  tenantId: string
  selectedServices: Service[]
  selectedPackage?: { id: string; name_ar: string; name_en: string; price: number }
  address?: CustomerAddress
  newAddress?: Omit<CustomerAddress, 'id' | 'customer_id' | 'tenant_id' | 'is_default'>
  coverageArea?: CoverageArea
  selectedDate?: string
  selectedTime?: string
  selectedEmployee?: Employee | 'any'
  paymentMethod?: PaymentMethod
  couponCode?: string
  appliedCoupon?: Coupon
  customer?: Customer
  notes?: string
}

export interface TimeSlot {
  time: string
  available: boolean
  employeeId?: string
}

export interface DashboardStats {
  todayAppointments: number
  pendingAppointments: number
  completedToday: number
  todayRevenue: number
  onlineRevenue: number
  cashRevenue: number
  availableEmployees: number
  cancellationsToday: number
}
