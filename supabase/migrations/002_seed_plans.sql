-- Seed subscription plans
INSERT INTO subscription_plans (name_ar, name_en, description_ar, description_en, price_monthly, price_yearly, max_employees, max_services, max_branches, features, allow_custom_domain, allow_advanced_reports, allow_promotions, allow_multi_branch, sort_order) VALUES
(
  'المبتدئة', 'Starter',
  'مناسبة للصالونات الصغيرة', 'Perfect for small salons',
  199.00, 1990.00, 3, 20, 1,
  '["حجز إلكتروني","تقويم المواعيد","إدارة الخدمات","إدارة الموظفين","صفحة حجز مخصصة","تقارير أساسية"]',
  FALSE, FALSE, FALSE, FALSE, 1
),
(
  'الاحترافية', 'Professional',
  'للصالونات المتنامية', 'For growing salons',
  399.00, 3990.00, 10, 100, 1,
  '["كل مزايا المبتدئة","تقارير متقدمة","دومين مخصص","كوبونات وعروض","تذكيرات تلقائية","تحليلات متقدمة"]',
  TRUE, TRUE, TRUE, FALSE, 2
),
(
  'الأعمال', 'Business',
  'للمراكز الكبيرة', 'For large beauty centers',
  799.00, 7990.00, 50, 500, 5,
  '["كل مزايا الاحترافية","فروع متعددة","أولوية الدعم","تكاملات متقدمة","تقارير مخصصة","API access"]',
  TRUE, TRUE, TRUE, TRUE, 3
);
