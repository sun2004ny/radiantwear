-- =============================================================================
--  RADIANT WEARS — Central Database Management File
--  Database:   PostgreSQL (hosted on Neon)
--  File:       database.sql
--
--  This is the single source of truth for all database structures.
--  Add new tables, indexes, constraints, migrations, and seed data here
--  as the project grows. Do not create separate SQL files unless there is
--  a strong technical requirement to do so.
--
--  Sections:
--    1. Extensions
--    2. Functions & Triggers
--    3. Tables (currently live)
--    4. Indexes
--    5. Seed Data
--    6. Future Tables (placeholder — add here when decided)
-- =============================================================================


-- =============================================================================
--  1. EXTENSIONS
-- =============================================================================

-- pgcrypto is available on Neon and useful for future UUID generation.
-- Uncomment if UUIDs are adopted as primary keys later.
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
--  2. FUNCTIONS & TRIGGERS
-- =============================================================================

-- Automatically keeps `updated_at` in sync on any UPDATE.
-- Applied to every table that has an `updated_at` column.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
--  3. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
--  3.1 users
--      Central authentication table shared by ALL user roles.
--      role = 'admin'    → admin panel access
--      role = 'customer' → storefront login (future)
--      Extend roles via the CHECK constraint below when new roles are needed.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL        PRIMARY KEY,
  name          TEXT          NOT NULL,
  email         TEXT          UNIQUE NOT NULL,
  password_hash TEXT          NOT NULL,           -- bcrypt hash, never plain text
  role          TEXT          NOT NULL DEFAULT 'customer'
                                CHECK (role IN ('admin', 'customer')),
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger: keep updated_at current
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_updated_at'
  ) THEN
    CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- -----------------------------------------------------------------------------
--  3.2 orders
--      Stores checkout orders submitted from the storefront.
--      JSONB columns hold flexible nested data (customer info, cart items,
--      shipping, payment method, and price totals).
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
  id                 SERIAL        PRIMARY KEY,
  order_id           TEXT          UNIQUE NOT NULL,  -- e.g. RW-123456
  customer           JSONB,                          -- name, email, address
  items              JSONB         NOT NULL,         -- array of cart line items
  shipping           JSONB,                          -- method, address
  payment            JSONB,                          -- method (card / wallet)
  totals             JSONB,                          -- subtotal, discount, total
  status             TEXT          DEFAULT 'CONFIRMED',
  estimated_delivery TEXT          DEFAULT '2-4 Business Days',
  created_at         TIMESTAMPTZ   DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
--  3.3 newsletter_subscribers
--      Stores emails collected from the storefront newsletter signup.
--      Duplicate emails are silently ignored (ON CONFLICT DO NOTHING).
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         SERIAL       PRIMARY KEY,
  email      TEXT         UNIQUE NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
--  3.4 products
--      Central apparel catalog for the Radiant Wardrobe storefront.
--      Manageable via Admin Panel -> Products.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
  id              SERIAL        PRIMARY KEY,
  product_id      TEXT          UNIQUE NOT NULL,   -- e.g. rw-01, rw-1727718923
  name            TEXT          NOT NULL,
  category        TEXT          NOT NULL,          -- outerwear, hoodies, tees, bottoms, knitwear, accessories, etc.
  product_type    TEXT,                            -- Jacket, Hoodie, T-Shirt, Trouser, etc.
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  original_price  NUMERIC(10,2),                   -- compare-at / MSRP
  discount_info   TEXT,                            -- e.g. 15% OFF
  badge           TEXT,                            -- New Season, Hot, Exclusive, Bestseller, Limited Drop, etc.
  tag             TEXT,                            -- Essential, Bestseller, New Drop, etc.
  stock           INTEGER       NOT NULL DEFAULT 10,
  status          TEXT          NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'draft', 'in_stock', 'out_of_stock')),
  sizes           JSONB         NOT NULL DEFAULT '[]'::jsonb,
  colors          JSONB         NOT NULL DEFAULT '[]'::jsonb,
  features        JSONB         NOT NULL DEFAULT '[]'::jsonb,
  care            TEXT,
  image           TEXT          NOT NULL,
  secondary_image TEXT,
  rating          NUMERIC(3,1)  DEFAULT 5.0,
  reviews_count   INTEGER       DEFAULT 0,
  featured        BOOLEAN       DEFAULT true,
  display_order   INTEGER       DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger: keep updated_at current
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'products_set_updated_at'
  ) THEN
    CREATE TRIGGER products_set_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;


-- =============================================================================
--  4. INDEXES
--  Add indexes here as query patterns become clear.
--  Format: CREATE INDEX IF NOT EXISTS idx_<table>_<column> ON <table>(<column>);
-- =============================================================================

-- Users — fast lookup by email (used on every login)
CREATE INDEX IF NOT EXISTS idx_users_email  ON users  (email);
CREATE INDEX IF NOT EXISTS idx_users_role   ON users  (role);

-- Orders — fast lookup by order_id and sort by date
CREATE INDEX IF NOT EXISTS idx_orders_order_id   ON orders (order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Products — lookup by product_id, category, status, and sort by date
CREATE INDEX IF NOT EXISTS idx_products_product_id ON products (product_id);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_status     ON products (status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- Newsletter — already unique, no extra index needed.


-- =============================================================================
--  5. SEED DATA
--  One-time bootstrap records. Use INSERT ... ON CONFLICT DO NOTHING so this
--  block is safe to re-run.
--
--  NOTE: The admin password below is a placeholder bcrypt hash.
--        The real hash is generated at server startup by initAdmin() in db.js
--        using the ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD env vars.
--        Do NOT hard-code real passwords here.
-- =============================================================================

-- Initial admin account (hash generated by server — do not store plain text)
-- INSERT INTO users (name, email, password_hash, role)
-- VALUES ('Radiant Admin', 'sunny260604@gmail.com', '<bcrypt_hash_here>', 'admin')
-- ON CONFLICT (email) DO NOTHING;


-- =============================================================================
--  6. FUTURE TABLES
--  Sections below are intentionally empty.
--  Add table definitions here as the database design is finalised.
--  Suggested future areas (do not create until requirements are confirmed):
--
--    - customer_profiles   (extended user info: avatar, preferences)
--    - addresses           (shipping / billing addresses per user)
--    - products            (if catalog moves from static JS to DB)
--    - categories          (product taxonomy)
--    - cart_items          (persistent cart per logged-in customer)
--    - order_items         (normalised order lines, if orders JSONB is split)
--    - payments            (payment transaction records)
--    - promo_codes         (if promo logic moves from static JS to DB)
--    - reviews             (product reviews per customer)
-- =============================================================================
