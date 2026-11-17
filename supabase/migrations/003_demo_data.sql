-- Demo Data for Platform Testing
-- Run this AFTER 001_initial_schema.sql and 002_seed_plans.sql

-- Demo tenant
INSERT INTO tenants (id, slug, status) VALUES
('11111111-1111-1111-1111-111111111111', 'luxe', 'active')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tenant_profiles (
  tenant_id, name_ar, name_en, description_ar, description_en,
  primary_color, secondary_color, accent_color,
  phone, whatsapp,
  default_locale, cancellation_hours, deposit_percentage,
  booking_url_slug
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'لوكس بيوتي', 'Luxe Beauty',
  'خبرة فاخرة في خدمات التجميل المنزلية بأعلى معايير الجودة',
  'Premium home beauty services with the highest quality standards',
  '#C2847A', '#F5F0EB', '#D4A96A',
  '0501234567', '966501234567',
  'ar', 24, 20,
  'luxe'
) ON CONFLICT (tenant_id) DO NOTHING;

-- Service categories
INSERT INTO service_categories (id, tenant_id, name_ar, name_en, icon, sort_order) VALUES
('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'العناية بالشعر', 'Hair Care', '💇', 1),
('bbbbbbbb-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'المكياج', 'Makeup', '💄', 2),
('cccccccc-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'الأظافر', 'Nails', '💅', 3),
('dddddddd-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'العروس', 'Bridal', '👰', 4)
ON CONFLICT (id) DO NOTHING;

-- Services
INSERT INTO services (tenant_id, category_id, name_ar, name_en, description_ar, price, duration_minutes, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'تصفيف الشعر', 'Hair Styling', 'تصفيف احترافي مع مجفف وفردة', 150, 60, true),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'صبغة الشعر', 'Hair Color', 'صبغة عالمية مع علاج', 300, 120, true),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', 'قص الشعر', 'Haircut', 'قص احترافي مع تشكيل', 100, 45, true),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-1111-1111-1111-111111111111', 'مكياج كامل', 'Full Makeup', 'مكياج احترافي لجميع المناسبات', 200, 90, true),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-1111-1111-1111-111111111111', 'مكياج خفيف', 'Natural Makeup', 'مكياج طبيعي وخفيف', 120, 60, true),
('11111111-1111-1111-1111-111111111111', 'cccccccc-1111-1111-1111-111111111111', 'مانيكير وباديكير', 'Mani & Pedi', 'عناية كاملة بالأظافر', 180, 90, true),
('11111111-1111-1111-1111-111111111111', 'cccccccc-1111-1111-1111-111111111111', 'جل الأظافر', 'Gel Nails', 'طلاء جل يدوم أسبوعين', 220, 75, true),
('11111111-1111-1111-1111-111111111111', 'dddddddd-1111-1111-1111-111111111111', 'مكياج العروس', 'Bridal Makeup', 'مكياج عروس كامل مع تجميل', 800, 180, true),
('11111111-1111-1111-1111-111111111111', 'dddddddd-1111-1111-1111-111111111111', 'تصفيف شعر العروس', 'Bridal Hair', 'تصفيف شعر عروس مع إكسسوارات', 600, 150, true);

-- Coverage areas (Riyadh districts)
INSERT INTO coverage_areas (tenant_id, city_name_ar, city_name_en, district_name_ar, district_name_en, travel_fee, travel_buffer_minutes) VALUES
('11111111-1111-1111-1111-111111111111', 'الرياض', 'Riyadh', 'العليا', 'Al Olaya', 0, 20),
('11111111-1111-1111-1111-111111111111', 'الرياض', 'Riyadh', 'النخيل', 'Al Nakhil', 0, 20),
('11111111-1111-1111-1111-111111111111', 'الرياض', 'Riyadh', 'الملقا', 'Al Malqa', 25, 30),
('11111111-1111-1111-1111-111111111111', 'الرياض', 'Riyadh', 'حطين', 'Hittin', 25, 30),
('11111111-1111-1111-1111-111111111111', 'الرياض', 'Riyadh', 'الروضة', 'Al Rawdah', 30, 35),
('11111111-1111-1111-1111-111111111111', 'الرياض', 'Riyadh', 'الورود', 'Al Wurud', 30, 35),
('11111111-1111-1111-1111-111111111111', 'الرياض', 'Riyadh', 'الربوة', 'Al Rabwah', 40, 45),
('11111111-1111-1111-1111-111111111111', 'الرياض', 'Riyadh', 'المحمدية', 'Al Muhammadiyah', 40, 45);

-- Employees
INSERT INTO employees (id, tenant_id, name_ar, name_en, specializations, travel_buffer_minutes, is_active) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'نورة السعيد', 'Nora Al-Saeed', ARRAY['تصفيف الشعر', 'الصبغة', 'العرائس'], 30, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'سارة الأحمد', 'Sara Al-Ahmad', ARRAY['المكياج', 'العرائس'], 30, true),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'لينا محمد', 'Lina Mohammed', ARRAY['الأظافر', 'الحناء'], 30, true)
ON CONFLICT (id) DO NOTHING;

-- Employee schedules (Sun-Thu 9am-9pm, Fri-Sat off)
INSERT INTO employee_schedules (employee_id, tenant_id, day_of_week, start_time, end_time, is_working)
SELECT
  emp_id::uuid,
  '11111111-1111-1111-1111-111111111111',
  dow,
  '09:00',
  '21:00',
  dow NOT IN (5, 6)
FROM
  (VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'),
    ('22222222-2222-2222-2222-222222222222')
  ) AS e(emp_id)
  CROSS JOIN generate_series(0, 6) AS g(dow)
ON CONFLICT DO NOTHING;

-- Assign services to employees
-- Nora: hair + bridal
INSERT INTO employee_services (employee_id, service_id, tenant_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', id, tenant_id
FROM services
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND category_id IN ('aaaaaaaa-1111-1111-1111-111111111111', 'dddddddd-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Sara: makeup + bridal
INSERT INTO employee_services (employee_id, service_id, tenant_id)
SELECT 'ffffffff-ffff-ffff-ffff-ffffffffffff', id, tenant_id
FROM services
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND category_id IN ('bbbbbbbb-1111-1111-1111-111111111111', 'dddddddd-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Lina: nails
INSERT INTO employee_services (employee_id, service_id, tenant_id)
SELECT '22222222-2222-2222-2222-222222222222', id, tenant_id
FROM services
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
  AND category_id = 'cccccccc-1111-1111-1111-111111111111'
ON CONFLICT DO NOTHING;

-- Demo coupon
INSERT INTO coupons (tenant_id, code, discount_type, discount_value, min_order_amount, max_uses, is_active)
VALUES ('11111111-1111-1111-1111-111111111111', 'LUXE20', 'percentage', 20, 100, 100, true)
ON CONFLICT DO NOTHING;

-- Demo subscription (using Professional plan)
INSERT INTO tenant_subscriptions (
  tenant_id, plan_id, status, billing_cycle,
  current_period_start, current_period_end
)
SELECT
  '11111111-1111-1111-1111-111111111111',
  id,
  'active',
  'monthly',
  NOW(),
  NOW() + INTERVAL '30 days'
FROM subscription_plans
WHERE name_en = 'Professional'
LIMIT 1
ON CONFLICT DO NOTHING;

COMMENT ON TABLE tenants IS 'Demo tenant "luxe" available at /book/luxe';
