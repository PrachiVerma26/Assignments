-- Admin User
INSERT INTO users (
    user_id, name, email, password, phone_number, address, driving_license_number, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    'System Admin',
    'admin@rapidrental.com',
    '$2a$12$VbdqdZ/12EpTz9/rfRnkLuSJCXFtbnxrHLDP9FKhZK1M72ZZg2Ele',
    '9999999999',
    'India HQ',
    'ADMIN0001',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@rapidrental.com'
);

-- Assign ADMIN role
INSERT INTO user_role (user_user_id, role)
SELECT u.user_id, 'ADMIN'
FROM users u
WHERE u.email = 'admin@rapidrental.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_role ur
    WHERE ur.user_user_id = u.user_id AND ur.role = 'ADMIN'
);

-----------------------------------------------------

-- Customer User
INSERT INTO users (
    user_id, name, email, password, phone_number, address, driving_license_number, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'test user',
    'test@gmail.com',
    '$2a$12$o44.J/W74o6Tyyn.XUmwoO98.EURh4IZJ9fglTxWR22jrHpEtv.NS',
    '8888888888',
    'Indore, MP',
    'DL12341241241',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'test@gmail.com'
);

-- Assign CUSTOMER role
INSERT INTO user_role (user_user_id, role)
SELECT u.user_id, 'CUSTOMER'
FROM users u
WHERE u.email = 'test@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_role ur
    WHERE ur.user_user_id = u.user_id AND ur.role = 'CUSTOMER'
);

-- locations
INSERT INTO locations (id, address, state, city, pincode)
SELECT '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Vijay Nagar', 'Madhya Pradesh', 'Indore', '452010'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO locations (id, address, state, city, pincode)
SELECT '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Hinjewadi Phase 1', 'Maharashtra', 'Pune', '411057'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO locations (id, address, state, city, pincode)
SELECT '550e8400-e29b-41d4-a716-446655440003'::uuid, 'Andheri East', 'Maharashtra', 'Mumbai', '400069'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE id = '550e8400-e29b-41d4-a716-446655440003');

INSERT INTO locations (id, address, state, city, pincode)
SELECT '550e8400-e29b-41d4-a716-446655440004'::uuid, 'MP Nagar', 'Madhya Pradesh', 'Bhopal', '462011'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE id = '550e8400-e29b-41d4-a716-446655440004');

INSERT INTO locations (id, address, state, city, pincode)
SELECT '550e8400-e29b-41d4-a716-446655440005'::uuid, 'Salt Lake Sector V', 'West Bengal', 'Kolkata', '700091'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE id = '550e8400-e29b-41d4-a716-446655440005');

-- vehicles(cars)
INSERT INTO vehicles (id, model, brand, type, status, daily_rental_rate, profile_url, location_id, created_at, updated_at, version)
SELECT '660e8400-e29b-41d4-a716-446655440001', 'Swift', 'Maruti Suzuki', 'CAR', 'AVAILABLE', 1800.00, 'assets/home_car.png', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = '660e8400-e29b-41d4-a716-446655440001');

INSERT INTO vehicles(id, model, brand, type, status, daily_rental_rate, profile_url, location_id, created_at, updated_at, version)
SELECT '660e8400-e29b-41d4-a716-446655440002', 'i20', 'Hyundai', 'CAR', 'AVAILABLE', 2000.00, 'assets/home_car.png', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = '660e8400-e29b-41d4-a716-446655440002');

INSERT INTO vehicles (id, model, brand, type, status, daily_rental_rate, profile_url, location_id, created_at, updated_at, version)
SELECT '660e8400-e29b-41d4-a716-446655440003', 'City', 'Honda', 'CAR', 'AVAILABLE', 3000.00, 'assets/home_car.png', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = '660e8400-e29b-41d4-a716-446655440003');

INSERT INTO vehicles (id, model, brand, type, status, daily_rental_rate, profile_url, location_id, created_at, updated_at, version)
SELECT '660e8400-e29b-41d4-a716-446655440004', 'Creta', 'Hyundai', 'CAR', 'MAINTENANCE', 3500.00, 'assets/home_car.png', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = '660e8400-e29b-41d4-a716-446655440004');

-- vehicles(bikes)
INSERT INTO vehicles (id, model, brand, type, status, daily_rental_rate, profile_url, location_id, created_at, updated_at, version)
SELECT '660e8400-e29b-41d4-a716-446655440005', 'Splendor Plus', 'Hero', 'BIKE', 'AVAILABLE', 400.00, 'assets/bike.jpg', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = '660e8400-e29b-41d4-a716-446655440005');

INSERT INTO vehicles (id, model, brand, type, status, daily_rental_rate, profile_url, location_id, created_at, updated_at, version)
SELECT '660e8400-e29b-41d4-a716-446655440006', 'Pulsar 150', 'Bajaj', 'BIKE', 'AVAILABLE', 600.00, 'assets/bike.jpg', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = '660e8400-e29b-41d4-a716-446655440006');

INSERT INTO vehicles(id, model, brand, type, status, daily_rental_rate, profile_url, location_id, created_at, updated_at, version)
SELECT '660e8400-e29b-41d4-a716-446655440007', 'Classic 350', 'Royal Enfield', 'BIKE', 'AVAILABLE', 900.00, 'assets/signup_bike.png', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = '660e8400-e29b-41d4-a716-446655440007');

INSERT INTO vehicles (id, model, brand, type, status, daily_rental_rate, profile_url, location_id, created_at, updated_at, version)
SELECT '660e8400-e29b-41d4-a716-446655440008', 'Duke 250', 'KTM', 'BIKE', 'AVAILABLE', 1200.00, 'assets/signup_bike.png', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = '660e8400-e29b-41d4-a716-446655440008');