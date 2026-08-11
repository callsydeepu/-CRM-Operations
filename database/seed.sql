-- Mini ERP + CRM Operations Portal
-- Seed Data - Batch 1 & 2: Users, Customers, Products
-- Password for all users: Password123
-- Hashes generated with bcryptjs (10 rounds)

USE mini_erp_crm;

-- Seed Users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2a$10$PckalYu1f77XzqdvBQIxp.9EfbmXUwY5aeNsVCh1OSEvFmIODTBs2', 'Admin'),
('Sales User', 'sales@example.com', '$2a$10$PckalYu1f77XzqdvBQIxp.9EfbmXUwY5aeNsVCh1OSEvFmIODTBs2', 'Sales'),
('Warehouse User', 'warehouse@example.com', '$2a$10$PckalYu1f77XzqdvBQIxp.9EfbmXUwY5aeNsVCh1OSEvFmIODTBs2', 'Warehouse'),
('Accounts User', 'accounts@example.com', '$2a$10$PckalYu1f77XzqdvBQIxp.9EfbmXUwY5aeNsVCh1OSEvFmIODTBs2', 'Accounts')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Customers
INSERT INTO customers (customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes) VALUES
('Acme Corp', '9876543210', 'contact@acme.com', 'Acme Industries LLC', '27AABCU9603R1ZN', 'Wholesale', '123 Industrial Area, Phase 2, Mumbai, MH', 'Active', '2026-08-20', 'Preferred wholesale buyer with 30-day payment term.'),
('Globex UI', '9876543211', 'info@globex.com', 'Globex Corporation', '29AABCU9603R1ZM', 'Distributor', '45 Commercial Complex, Bengaluru, KA', 'Lead', '2026-08-25', 'Interested in becoming state-wide distributor.'),
('Soylent Corp', '9876543212', 'sales@soylent.com', 'Soylent Foods Ltd', '07AABCU9603R1ZL', 'Retail', '78 Market Street, New Delhi, DL', 'Inactive', '2026-08-15', 'Follow up regarding catalog refresh.');

-- Seed Products
INSERT INTO products (product_name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location) VALUES
('Widget A - Blue', 'SKU-WID-001', 'Widgets', 25.00, 2, 50, 'Rack A-12'),
('Gear Assembly X', 'SKU-GEAR-002', 'Machinery', 120.00, 5, 100, 'Rack B-04'),
('Connector Pin 4mm', 'SKU-PIN-003', 'Hardware', 2.50, 12, 500, 'Bin C-01'),
('Steel Bracket M', 'SKU-BRK-004', 'Hardware', 15.00, 18, 200, 'Rack B-09'),
('Industrial Valve 2-inch', 'SKU-VLV-005', 'Plumbing', 85.00, 150, 20, 'Rack D-03'),
('Hydraulic Seal Kit', 'SKU-SEAL-006', 'Plumbing', 45.00, 220, 30, 'Bin C-15');
