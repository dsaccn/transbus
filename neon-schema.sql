-- ==========================================================
-- Neon PostgreSQL Database Schema for Transit Station System
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_am VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'agent')),
    agent_code VARCHAR(50) NOT NULL,
    station_id VARCHAR(50) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    plate_number VARCHAR(50) NOT NULL,
    plate_number_am VARCHAR(50),
    side_number VARCHAR(50),
    model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 22,
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(30) NOT NULL,
    driver_license_no VARCHAR(50),
    status VARCHAR(30) DEFAULT 'ready' CHECK (status IN ('ready', 'boarding', 'in_transit', 'maintenance', 'completed')),
    assigned_route_id VARCHAR(50),
    current_trip_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROUTES TABLE
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(50) PRIMARY KEY,
    route_code VARCHAR(50) NOT NULL,
    origin_station_id VARCHAR(50) NOT NULL,
    destination_station_id VARCHAR(50) NOT NULL,
    origin_name_en VARCHAR(100) NOT NULL,
    origin_name_am VARCHAR(100) NOT NULL,
    destination_name_en VARCHAR(100) NOT NULL,
    destination_name_am VARCHAR(100) NOT NULL,
    distance_km NUMERIC(8,2) NOT NULL,
    estimated_duration_hours NUMERIC(4,2) NOT NULL,
    base_fare NUMERIC(10,2) NOT NULL,
    via_towns_en TEXT[] DEFAULT '{}',
    via_towns_am TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRIPS TABLE
CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(50) PRIMARY KEY,
    trip_code VARCHAR(50) NOT NULL,
    route_id VARCHAR(50) REFERENCES routes(id) ON DELETE SET NULL,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_name VARCHAR(100),
    departure_date VARCHAR(20) NOT NULL,
    departure_time VARCHAR(10) NOT NULL,
    gate_number VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled')),
    price_per_seat NUMERIC(10,2) NOT NULL,
    booked_seats_count INTEGER DEFAULT 0,
    total_seats_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    trip_id VARCHAR(50) REFERENCES trips(id) ON DELETE CASCADE,
    route_id VARCHAR(50) REFERENCES routes(id) ON DELETE SET NULL,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE SET NULL,
    vehicle_plate_number VARCHAR(50),
    vehicle_side_number VARCHAR(50),
    vehicle_model VARCHAR(100),
    seat_number INTEGER NOT NULL,
    passenger_name VARCHAR(100),
    passenger_phone VARCHAR(30),
    passenger_gender VARCHAR(10) CHECK (passenger_gender IN ('male', 'female', 'other')),
    passenger_id_number VARCHAR(50),
    fare_amount NUMERIC(10,2) NOT NULL,
    service_fee NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    agent_code VARCHAR(50) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    agent_name_am VARCHAR(100) NOT NULL,
    issue_date VARCHAR(20) NOT NULL,
    issue_time VARCHAR(20) NOT NULL,
    departure_date VARCHAR(20) NOT NULL,
    departure_time VARCHAR(20) NOT NULL,
    origin_city_en VARCHAR(100) NOT NULL,
    origin_city_am VARCHAR(100) NOT NULL,
    destination_city_en VARCHAR(100) NOT NULL,
    destination_city_am VARCHAR(100) NOT NULL,
    gate_number VARCHAR(30) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'boarded', 'cancelled', 'refunded')),
    boarded_at VARCHAR(50),
    baggage_weight_kg NUMERIC(6,2),
    qr_code_data_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_trip_id ON tickets(trip_id);
CREATE INDEX IF NOT EXISTS idx_tickets_agent_id ON tickets(agent_id);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(departure_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
