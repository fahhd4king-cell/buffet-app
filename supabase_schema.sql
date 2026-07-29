-- ========================================================
-- BAFEET FADI - SUPABASE DATABASE SCHEMA & REALTIME SETUP
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. App Users Table (Customer Accounts)
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_office TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_reference TEXT,
  payment_gateway TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  notes TEXT,
  chat_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'موظف بوفيه',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Default Admin Staff if not exists
INSERT INTO staff (id, name, username, password, role, status)
VALUES ('staff-admin', 'مدير النظام الافتراضي', 'admin', 'admin123', 'مشرف البوفيه', 'active')
ON CONFLICT (username) DO NOTHING;

-- 4. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  image TEXT,
  is_available BOOLEAN DEFAULT true,
  customization_group_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Option Groups Table
CREATE TABLE IF NOT EXISTS option_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  selection_type TEXT NOT NULL DEFAULT 'single',
  is_required BOOLEAN DEFAULT false,
  max_selections NUMERIC DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Buffet Status Table
CREATE TABLE IF NOT EXISTS buffet_status (
  id TEXT PRIMARY KEY DEFAULT 'main',
  is_open BOOLEAN DEFAULT true,
  closure_reason TEXT DEFAULT '',
  reopen_time TEXT DEFAULT '',
  auto_schedule_enabled BOOLEAN DEFAULT false,
  working_hours JSONB DEFAULT '{"openHour": "06:00", "closeHour": "23:59"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Default Buffet Status row if not exists
INSERT INTO buffet_status (id, is_open, closure_reason, reopen_time, auto_schedule_enabled)
VALUES ('main', true, '', '', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Enable Supabase Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE app_users;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE option_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE buffet_status;

-- 8. Enable Row Level Security (RLS) & Public Access Policies for Web Client
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE buffet_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read app_users" ON app_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert app_users" ON app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update app_users" ON app_users FOR UPDATE USING (true);

-- Allow public / anon reading & writing for full client access
CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);

CREATE POLICY "Allow public read staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Allow public insert staff" ON staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update staff" ON staff FOR UPDATE USING (true);
CREATE POLICY "Allow public delete staff" ON staff FOR DELETE USING (true);

CREATE POLICY "Allow public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert menu_items" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update menu_items" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete menu_items" ON menu_items FOR DELETE USING (true);

CREATE POLICY "Allow public read option_groups" ON option_groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert option_groups" ON option_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update option_groups" ON option_groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete option_groups" ON option_groups FOR DELETE USING (true);

CREATE POLICY "Allow public read buffet_status" ON buffet_status FOR SELECT USING (true);
CREATE POLICY "Allow public update buffet_status" ON buffet_status FOR UPDATE USING (true);
CREATE POLICY "Allow public insert buffet_status" ON buffet_status FOR INSERT WITH CHECK (true);
