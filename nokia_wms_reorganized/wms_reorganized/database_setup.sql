-- Create Database
CREATE DATABASE IF NOT EXISTS WMS_Nokia_Final;
USE WMS_Nokia_Final;

-- Create Project List Table
CREATE TABLE IF NOT EXISTS project_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    store VARCHAR(255),
    dc_out_slug VARCHAR(255),
    stn_slug VARCHAR(255),
    dc_in_slug VARCHAR(255),
    inward_slug VARCHAR(255),
    doa_slug VARCHAR(255),
    project_type VARCHAR(255) NOT NULL,
    project_invoice_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data (optional)
INSERT INTO project_list (project_name, company_name, store, dc_out_slug, stn_slug, dc_in_slug, inward_slug, doa_slug, project_type, project_invoice_type) VALUES
('Project A', 'Nokia-Haryana', 'Store 1', 'DCOUT-001', 'STN-001', 'DCIN-001', 'IUT-001', 'DOA-001', 'Telecom', 'Indian'),
('Project B', 'Other', 'Store 2', 'DCOUT-002', 'STN-002', 'DCIN-002', 'IUT-002', 'DOA-002', 'Warehouse', 'Western');

-- Create Category Table
CREATE TABLE IF NOT EXISTS category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Categories
INSERT INTO category (category_name) VALUES
('Accessory'),
('ATTENUATOR'),
('CAT 6 CABLE'),
('Computer Server'),
('Console Cable'),
('DAC CABLE'),
('DCDB'),
('DUAL BAND ONT'),
('FAN Units For Chassis'),
('Grouting Rod'),
('Installation Kit'),
('Inventory Cable'),
('Jumper'),
('LUGS'),
('MCB'),
('MPO Cable'),
('MPO Jumper'),
('ONT'),
('PATCH CORD'),
('Power cable'),
('Power Cord'),
('Power Supply Module'),
('RACK'),
('SD CARDS'),
('SDH CARDS/SFP/Chassis'),
('Tool Kit'),
('Velcro');

-- Create Goods Master Table
CREATE TABLE IF NOT EXISTS goods_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    description VARCHAR(255),
    part_code VARCHAR(255),
    weight DECIMAL(10, 2),
    volume DECIMAL(10, 2),
    length DECIMAL(10, 2),
    breadth DECIMAL(10, 2),
    height DECIMAL(10, 2),
    hsn_code VARCHAR(50),
    uom VARCHAR(50),
    uom_other VARCHAR(100),
    gst_percent DECIMAL(5, 2),
    gst_other VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(id)
);

-- Insert Dummy Data for Goods Master
INSERT INTO goods_master (category_id, description, part_code, weight, volume, length, breadth, height, hsn_code, uom, gst_percent, status) VALUES
(1, 'Network Router', 'NET-001', 2.5, 0.15, 30.0, 20.0, 10.0, '8517', 'PCS', 18.00, 'Active'),
(2, 'Fiber Attenuator 5dB', 'ATT-005', 0.1, 0.01, 10.0, 5.0, 3.0, '8544', 'PCS', 18.00, 'Active'),
(3, 'CAT 6 Cable 100m', 'CAT6-100', 5.0, 0.05, 10000.0, 2.0, 1.0, '8544', 'meter', 18.00, 'Active'),
(4, 'Server Rack 42U', 'RACK-42', 150.0, 2.5, 200.0, 60.0, 120.0, '8471', 'number', 28.00, 'Active'),
(5, 'Console Cable 3m', 'CON-003', 0.5, 0.02, 300.0, 1.0, 1.0, '8544', 'PCS', 18.00, 'Active');

-- Create Cost Center List Table
CREATE TABLE IF NOT EXISTS cost_center_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NULL,
    store_name VARCHAR(255),
    customer_id INT NULL,
    customer_name VARCHAR(255),
    cost_center_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    details TEXT,
    print_detail_1 VARCHAR(255),
    print_detail_2 VARCHAR(255),
    print_detail_3 VARCHAR(255),
    print_detail_4 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Site List Table
CREATE TABLE IF NOT EXISTS site_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    district VARCHAR(255),
    city_town VARCHAR(255),
    pincode VARCHAR(20),
    contact_person VARCHAR(255),
    contact_no VARCHAR(50),
    location VARCHAR(255),
    address TEXT,
    address_2 TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
