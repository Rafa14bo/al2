/*
# Alisson Lanches - Tables & Structure

Creates all tables for the ordering platform with RLS enabled.
Policies will be added in a separate migration.

Tables: profiles, categories, products, addon_groups, product_addons,
product_addon_group_links, delivery_zones, coupons, store_settings,
business_hours, payment_settings, orders, order_items, order_item_addons, addresses
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  is_example boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ADDON GROUPS
CREATE TABLE IF NOT EXISTS addon_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_required boolean NOT NULL DEFAULT false,
  min_quantity int NOT NULL DEFAULT 0,
  max_quantity int NOT NULL DEFAULT 10,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE addon_groups ENABLE ROW LEVEL SECURITY;

-- PRODUCT ADDONS
CREATE TABLE IF NOT EXISTS product_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_group_id uuid NOT NULL REFERENCES addon_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;

-- PRODUCT ADDON GROUP LINKS
CREATE TABLE IF NOT EXISTS product_addon_group_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  addon_group_id uuid NOT NULL REFERENCES addon_groups(id) ON DELETE CASCADE,
  UNIQUE(product_id, addon_group_id)
);
ALTER TABLE product_addon_group_links ENABLE ROW LEVEL SECURITY;

-- DELIVERY ZONES
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  min_order numeric(10,2) NOT NULL DEFAULT 0,
  estimated_time text NOT NULL DEFAULT '30-45 min',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  min_order numeric(10,2) NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  usage_limit int,
  usage_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- STORE SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'Alisson Lanches',
  logo_url text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '(17) 98146-7315',
  whatsapp text NOT NULL DEFAULT '5517981467315',
  address_street text NOT NULL DEFAULT 'Rua 3 de Outubro, 62',
  address_neighborhood text NOT NULL DEFAULT 'Derby Clube',
  address_city text NOT NULL DEFAULT 'Barretos',
  address_state text NOT NULL DEFAULT 'SP',
  address_zip text NOT NULL DEFAULT '14787-187',
  maps_url text NOT NULL DEFAULT 'https://maps.app.goo.gl/FPZJGGSdgLcUPGEAA',
  description text NOT NULL DEFAULT 'Desde 2015 levando sabor para Barretos.',
  rating numeric(2,1) NOT NULL DEFAULT 4.7,
  review_count int NOT NULL DEFAULT 206,
  is_temporarily_closed boolean NOT NULL DEFAULT false,
  primary_color text NOT NULL DEFAULT '#F40A0B',
  secondary_color text NOT NULL DEFAULT '#FEEF20',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- BUSINESS HOURS
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open boolean NOT NULL DEFAULT true,
  open_time time NOT NULL DEFAULT '18:00',
  close_time time NOT NULL DEFAULT '23:59',
  UNIQUE(day_of_week)
);
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- PAYMENT SETTINGS
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pix_enabled boolean NOT NULL DEFAULT false,
  pix_key text NOT NULL DEFAULT '',
  pix_key_type text NOT NULL DEFAULT 'cpf' CHECK (pix_key_type IN ('cpf', 'email', 'phone', 'random')),
  pix_receiver_name text NOT NULL DEFAULT '',
  pix_instructions text NOT NULL DEFAULT '',
  pix_qr_code_url text NOT NULL DEFAULT '',
  card_enabled boolean NOT NULL DEFAULT false,
  card_credit boolean NOT NULL DEFAULT false,
  card_debit boolean NOT NULL DEFAULT false,
  card_instructions text NOT NULL DEFAULT '',
  cash_enabled boolean NOT NULL DEFAULT true,
  cash_change_available boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number int NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  delivery_type text NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text,
  address_reference text,
  delivery_zone_id uuid REFERENCES delivery_zones(id) ON DELETE SET NULL,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL CHECK (payment_method IN ('pix', 'card', 'cash')),
  payment_card_type text,
  cash_change_for numeric(10,2),
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'NOVO' CHECK (status IN ('NOVO','CONFIRMADO','EM_PREPARACAO','PRONTO','SAINDO_PARA_ENTREGA','ENTREGUE','CANCELADO')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric(10,2) NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ORDER ITEM ADDONS
CREATE TABLE IF NOT EXISTS order_item_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  addon_name text NOT NULL,
  addon_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_item_addons ENABLE ROW LEVEL SECURITY;

-- ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Casa',
  street text NOT NULL,
  number text NOT NULL,
  complement text,
  neighborhood text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  reference text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_addons_group ON product_addons(addon_group_id);
CREATE INDEX IF NOT EXISTS idx_business_hours_day ON business_hours(day_of_week);

-- SEQUENCE FOR ORDER NUMBERS
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- FUNCTION TO GET NEXT ORDER NUMBER
CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS int
LANGUAGE sql
AS $$
  SELECT nextval('order_number_seq');
$$;
