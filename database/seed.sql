-- Mini ERP + CRM Database Seed Script
-- Only creates default authentication users. Inserts ZERO dummy/sample business data.

USE mini_erp_crm;

-- Seed Default Authentication Accounts (password: Password123!)
-- Hash generated using bcrypt (10 rounds)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('System Administrator', 'admin@example.com', '$2a$10$7R4dI66G4yV2q8I6fXvY6u.5t4hWvJqJgQcM9B8p5p9n5j7c6w6C2', 'Admin'),
('Sales Representative', 'sales@example.com', '$2a$10$7R4dI66G4yV2q8I6fXvY6u.5t4hWvJqJgQcM9B8p5p9n5j7c6w6C2', 'Sales'),
('Warehouse Manager', 'warehouse@example.com', '$2a$10$7R4dI66G4yV2q8I6fXvY6u.5t4hWvJqJgQcM9B8p5p9n5j7c6w6C2', 'Warehouse'),
('Accounts Auditor', 'accounts@example.com', '$2a$10$7R4dI66G4yV2q8I6fXvY6u.5t4hWvJqJgQcM9B8p5p9n5j7c6w6C2', 'Accounts');

-- NOTE: No sample customers, products, stock movements, or sales challans are seeded.
-- Business data starts completely empty and is populated through user actions.
