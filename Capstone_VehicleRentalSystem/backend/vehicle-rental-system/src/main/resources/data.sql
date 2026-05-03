-- Admin User
INSERT INTO users (
    user_id, name, email, password, phone_number, address, driving_license_number, created_at, updated_at
)
SELECT '880e8400-e29b-41d4-a716-446655440001', 'System Admin', 'admin@rapidrental.com', '$2a$12$VbdqdZ/12EpTz9/rfRnkLuSJCXFtbnxrHLDP9FKhZK1M72ZZg2Ele',
    '9999999999', 'India HQ', 'ADMIN0001', NOW(), NOW()
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

-- Customer User
INSERT INTO users (
    user_id, name, email, password, phone_number, address, driving_license_number, created_at, updated_at)
SELECT
    '880e8400-e29b-41d4-a716-446655440002',
    'Customer',
    'customer@gmail.com',
    '$2a$12$o44.J/W74o6Tyyn.XUmwoO98.EURh4IZJ9fglTxWR22jrHpEtv.NS',
    '8888888888',
    'Indore, MP',
    'DL12341241241',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'customer@gmail.com'
);

-- Assign CUSTOMER role
INSERT INTO user_role (user_user_id, role)
SELECT u.user_id, 'CUSTOMER'
FROM users u
WHERE u.email ='880e8400-e29b-41d4-a716-446655440002'
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

--vehicles(car)
INSERT INTO vehicles (id, model, brand, type, registration_number, status, daily_rental_rate, profile_url, location_id, created_at, updated_at, version)
VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Baleno', 'Maruti Suzuki', 'CAR', 'MP09AA1111', 'AVAILABLE', 1700, './assets/car.png', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440002', 'Fortuner', 'Toyota', 'CAR', 'MH12BB2222', 'AVAILABLE', 5500, './assets/car.png', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440003', 'XUV700', 'Mahindra', 'CAR', 'MH01CC3333', 'MAINTENANCE', 4000, './assets/car.png', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440004', 'Alto', 'Maruti Suzuki', 'CAR', 'MP04DD4444', 'AVAILABLE', 900, './assets/car.png', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440005', 'Alto', 'Maruti Suzuki', 'CAR', 'WB20EE5555', 'AVAILABLE', 950, './assets/car.png', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440006', 'Nexon EV', 'Tata', 'CAR', 'MH12EV6666', 'AVAILABLE', 3200, './assets/car.png', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440007', 'BMW X5', 'BMW', 'CAR', 'DL01JJ2020', 'AVAILABLE', 9000, './assets/car.png', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440008', 'BMW 3 Series', 'BMW', 'CAR', 'DL01KK3030', 'AVAILABLE', 7000, './assets/car.png', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440009', 'HF Deluxe', 'Hero', 'BIKE', 'MP09LL4040', 'AVAILABLE', 250, './assets/bike.jpg', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440010', 'i10 Nios', 'Hyundai', 'CAR', 'MH12MM5050', 'AVAILABLE', 1600, './assets/car.png', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440011', 'Harrier', 'Tata', 'CAR', 'MP04NN6060', 'MAINTENANCE', 3800, './assets/car.png', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW(), 0),

--vehicles(bike)
('770e8400-e29b-41d4-a716-446655440012', 'Apache RTR 160', 'TVS', 'BIKE', 'MP09FF7777', 'AVAILABLE', 500, './assets/bike.jpg', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440013', 'Dominar 400', 'Bajaj', 'BIKE', 'MH12GG8888', 'AVAILABLE', 1200, './assets/bike.jpg', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440014', 'Bullet 350', 'Royal Enfield', 'BIKE', 'MH01HH9999', 'MAINTENANCE', 1000, './assets/bike.jpg', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), 0),
('770e8400-e29b-41d4-a716-446655440015', 'Activa 6G', 'Honda', 'BIKE', 'MP04II1010', 'AVAILABLE', 300, './assets/bike.jpg', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW(), 0);
