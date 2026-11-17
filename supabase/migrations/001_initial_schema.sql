-- ============================================================
-- Salon SaaS Platform - Initial Database Schema
-- Multi-tenant, RLS-enforced, Saudi Arabia ready
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TENANTS (Salons)
-- ============================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL, -- subdomain: slug.platform.com
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','trial','pending','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  logo_url TEXT,
  cover_url TEXT,
  primary_color TEXT DEFAULT '#C2847A',
  secondary_color TEXT DEFAULT '#F5F0EB',
  accent_color TEXT DEFAULT '#D4A96A',
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  twitter TEXT,
  snapchat TEXT,
  tiktok TEXT,
  custom_domain TEXT,
  booking_url_slug TEXT UNIQUE,
  supported_cities JSONB DEFAULT '[]',
  default_locale TEXT DEFAULT 'ar' CHECK (default_locale IN ('ar','en')),
  timezone TEXT DEFAULT 'Asia/Riyadh',
  currency TEXT DEFAULT 'SAR',
  vat_number TEXT,
  cr_number TEXT, -- Commercial Registration
  home_service_permit TEXT,
  cancellation_hours INT DEFAULT 24, -- hours before appointment to cancel free
  deposit_percentage INT DEFAULT 0, -- 0 = no deposit required
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTION PLANS
-- ============================================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  max_employees INT DEFAULT 3,
  max_services INT DEFAULT 20,
  max_branches INT DEFAULT 1,
  features JSONB DEFAULT '[]',
  allow_custom_domain BOOLEAN DEFAULT FALSE,
  allow_advanced_reports BOOLEAN DEFAULT FALSE,
  allow_promotions BOOLEAN DEFAULT FALSE,
  allow_multi_branch BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing','active','past_due','cancelled','expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  tap_subscription_id TEXT, -- payment provider reference
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS & ROLES
-- ============================================================
-- Supabase auth.users is the auth table; this extends it
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id), -- NULL for super admins
  role TEXT NOT NULL CHECK (role IN ('superadmin','salon_owner','salon_staff','employee','customer')),
  name_ar TEXT,
  name_en TEXT,
  phone TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'ar',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMPLOYEES / BEAUTICIANS
-- ============================================================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES user_profiles(id),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  photo_url TEXT,
  phone TEXT,
  specializations TEXT[],
  bio_ar TEXT,
  bio_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  travel_buffer_minutes INT DEFAULT 30,
  permit_number TEXT,
  nationality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employee_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN DEFAULT TRUE,
  UNIQUE (employee_id, day_of_week)
);

CREATE TABLE employee_time_off (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICE CATEGORIES & SERVICES
-- ============================================================
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category_id UUID REFERENCES service_categories(id),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price DECIMAL(10,2) NOT NULL,
  home_visit_surcharge DECIMAL(10,2) DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 60,
  prep_time_minutes INT DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_home_service BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- which employees can deliver which services
CREATE TABLE employee_services (
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  PRIMARY KEY (employee_id, service_id)
);

-- Service packages (bundles)
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE package_services (
  package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, service_id)
);

-- ============================================================
-- COVERAGE AREAS
-- ============================================================
CREATE TABLE coverage_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  city_name_ar TEXT NOT NULL,
  city_name_en TEXT NOT NULL,
  district_name_ar TEXT NOT NULL,
  district_name_en TEXT NOT NULL,
  travel_fee DECIMAL(10,2) DEFAULT 0,
  travel_buffer_minutes INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES user_profiles(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  email TEXT,
  locale TEXT DEFAULT 'ar',
  marketing_consent BOOLEAN DEFAULT FALSE,
  data_deletion_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, phone)
);

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  label TEXT, -- 'home', 'work', etc.
  city_ar TEXT NOT NULL,
  city_en TEXT NOT NULL,
  district_ar TEXT NOT NULL,
  district_en TEXT NOT NULL,
  street TEXT,
  building TEXT,
  floor TEXT,
  apartment TEXT,
  instructions TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  booking_number TEXT NOT NULL, -- human-readable: SAL-20241117-0001
  customer_id UUID NOT NULL REFERENCES customers(id),
  employee_id UUID REFERENCES employees(id),
  address_id UUID NOT NULL REFERENCES customer_addresses(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','confirmed','assigned','on_the_way','arrived',
    'in_progress','completed','cancelled','rejected','no_show','payment_pending'
  )),
  scheduled_date DATE NOT NULL,
  scheduled_start TIME NOT NULL,
  scheduled_end TIME NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  travel_fee DECIMAL(10,2) DEFAULT 0,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash','online','deposit')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','partial','refunded','failed')),
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  coupon_id UUID,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by TEXT, -- 'customer', 'salon', 'system'
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for booking number uniqueness per tenant
CREATE UNIQUE INDEX idx_appointments_booking_number ON appointments(tenant_id, booking_number);

CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  service_name_ar TEXT NOT NULL,
  service_name_en TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INT NOT NULL
);

-- Appointment status history
CREATE TABLE appointment_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES user_profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  appointment_id UUID REFERENCES appointments(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded','cancelled')),
  tap_charge_id TEXT, -- Tap Payments charge ID
  tap_payment_reference TEXT,
  metadata JSONB DEFAULT '{}',
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processed','failed')),
  tap_refund_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SaaS platform subscription payments (separate from appointment payments)
CREATE TABLE platform_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  subscription_id UUID NOT NULL REFERENCES tenant_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'pending',
  tap_charge_id TEXT,
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS & PROMOTIONS
-- ============================================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  employee_id UUID REFERENCES employees(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES user_profiles(id),
  type TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  body_ar TEXT,
  body_en TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOKING SEQUENCE (for human-readable booking numbers)
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS booking_number_seq;

CREATE OR REPLACE FUNCTION generate_booking_number(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_seq BIGINT;
  v_date TEXT;
BEGIN
  v_date := TO_CHAR(NOW() AT TIME ZONE 'Asia/Riyadh', 'YYYYMMDD');
  v_seq := nextval('booking_number_seq');
  RETURN 'BK-' || v_date || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get calling user's tenant_id
CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is calling user a superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'superadmin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Tenant-scoped policies (apply to most tables)
-- Salon staff/owner can read/write their own tenant's data
-- Superadmin can read all

CREATE POLICY "tenant_isolation" ON tenant_profiles
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON employees
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON employee_schedules
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON employee_time_off
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON service_categories
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON services
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON employee_services
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON coverage_areas
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON customers
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON customer_addresses
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON appointments
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON appointment_services
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON appointment_status_history
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON payments
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON refunds
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON coupons
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON reviews
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

CREATE POLICY "tenant_isolation" ON notifications
  USING (is_superadmin() OR tenant_id = auth_tenant_id() OR user_id = auth.uid());

CREATE POLICY "tenant_isolation" ON audit_logs
  USING (is_superadmin() OR tenant_id = auth_tenant_id());

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, scheduled_date);
CREATE INDEX idx_appointments_employee ON appointments(employee_id, scheduled_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(tenant_id, status);
CREATE INDEX idx_customers_phone ON customers(tenant_id, phone);
CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_services_tenant ON services(tenant_id, is_active);
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tenant_profiles_updated BEFORE UPDATE ON tenant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PUBLIC READ POLICIES (for booking page, no auth required)
-- ============================================================
CREATE POLICY "public_read_active_tenants" ON tenants
  FOR SELECT USING (status = 'active');

CREATE POLICY "public_read_tenant_profiles" ON tenant_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tenants WHERE id = tenant_profiles.tenant_id AND status = 'active')
  );

CREATE POLICY "public_read_active_services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_service_categories" ON service_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_active_employees" ON employees
  FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_coverage_areas" ON coverage_areas
  FOR SELECT USING (true);
