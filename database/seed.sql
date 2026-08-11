-- Mini ERP + CRM Operations Portal
-- Seed Data - Batch 1: Test Users
-- Password for all users: Password123
-- Hashes generated with bcryptjs (10 rounds)

USE mini_erp_crm;

INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2a$10$PckalYu1f77XzqdvBQIxp.9EfbmXUwY5aeNsVCh1OSEvFmIODTBs2', 'Admin'),
('Sales User', 'sales@example.com', '$2a$10$PckalYu1f77XzqdvBQIxp.9EfbmXUwY5aeNsVCh1OSEvFmIODTBs2', 'Sales'),
('Warehouse User', 'warehouse@example.com', '$2a$10$PckalYu1f77XzqdvBQIxp.9EfbmXUwY5aeNsVCh1OSEvFmIODTBs2', 'Warehouse'),
('Accounts User', 'accounts@example.com', '$2a$10$PckalYu1f77XzqdvBQIxp.9EfbmXUwY5aeNsVCh1OSEvFmIODTBs2', 'Accounts');
