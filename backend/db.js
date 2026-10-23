import fs from 'fs';
import pkg from 'pg';
import bcrypt from 'bcrypt';
import { PRODUCTS } from './data/products.js';

// Auto-load .env in local development if present
if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
  try {
    process.loadEnvFile?.('.env');
  } catch (err) {
    // ignore
  }
}

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ---------------------------------------------------------------------------
// Schema migration — idempotent, safe to run on every server start
// ---------------------------------------------------------------------------
export async function initDB() {
  // 1. Users table — shared by all roles (admin, customer, …)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'customer'
                      CHECK (role IN ('admin', 'customer')),
      is_active     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Keep updated_at in sync automatically
  await pool.query(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'users_set_updated_at'
      ) THEN
        CREATE TRIGGER users_set_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      END IF;
    END $$;
  `);

  // 2. Orders table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id                 SERIAL PRIMARY KEY,
      order_id           TEXT UNIQUE NOT NULL,
      customer           JSONB,
      items              JSONB NOT NULL,
      shipping           JSONB,
      payment            JSONB,
      totals             JSONB,
      status             TEXT DEFAULT 'CONFIRMED',
      created_at         TIMESTAMPTZ DEFAULT NOW(),
      estimated_delivery TEXT DEFAULT '2-4 Business Days'
    );
  `);

  // 3. Newsletter subscribers
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id         SERIAL PRIMARY KEY,
      email      TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 4. Products table — fashion apparel catalog
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id              SERIAL PRIMARY KEY,
      product_id      TEXT UNIQUE NOT NULL,
      name            TEXT NOT NULL,
      category        TEXT NOT NULL,
      product_type    TEXT,
      description     TEXT,
      price           NUMERIC(10, 2) NOT NULL,
      original_price  NUMERIC(10, 2),
      discount_info   TEXT,
      badge           TEXT,
      tag             TEXT,
      stock           INTEGER NOT NULL DEFAULT 10,
      status          TEXT NOT NULL DEFAULT 'active',
      sizes           JSONB NOT NULL DEFAULT '[]'::jsonb,
      colors          JSONB NOT NULL DEFAULT '[]'::jsonb,
      features        JSONB NOT NULL DEFAULT '[]'::jsonb,
      care            TEXT,
      image           TEXT NOT NULL,
      secondary_image TEXT,
      rating          NUMERIC(3, 1) DEFAULT 5.0,
      reviews_count   INTEGER DEFAULT 0,
      featured        BOOLEAN DEFAULT true,
      display_order   INTEGER DEFAULT 0,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Products updated_at trigger
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'products_set_updated_at'
      ) THEN
        CREATE TRIGGER products_set_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      END IF;
    END $$;
  `);

  // Products migration: add is_deleted column if not exists
  await pool.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
    CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON products (is_deleted);
  `);

  // Products indexes
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_product_id ON products (product_id);
    CREATE INDEX IF NOT EXISTS idx_products_category   ON products (category);
    CREATE INDEX IF NOT EXISTS idx_products_status     ON products (status);
    CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);
  `);

  console.log('[DB] Tables ready.');

  // Seed the initial admin account (runs once; skipped if email already exists)
  await initAdmin();

  // Seed default products catalog if products table is empty
  await seedProductsIfEmpty();
}

// ---------------------------------------------------------------------------
// Seed initial admin from env vars — never stores plain-text password
// ---------------------------------------------------------------------------
async function initAdmin() {
  const email    = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.warn('[DB] ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD not set — skipping admin seed.');
    return;
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    console.log('[DB] Admin account already exists — skipping seed.');
    return;
  }

  const SALT_ROUNDS = 12;
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    ['Radiant Admin', email.toLowerCase(), hash]
  );

  console.log(`[DB] Admin account seeded for ${email}`);
}

// ---------------------------------------------------------------------------
// Seed default catalog products into PostgreSQL if products table is empty
// ---------------------------------------------------------------------------
async function seedProductsIfEmpty() {
  try {
    const countRes = await pool.query('SELECT COUNT(*) AS count FROM products');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('[DB] Products table is empty. Seeding initial catalog from products.js...');
      for (let i = 0; i < PRODUCTS.length; i++) {
        const p = PRODUCTS[i];
        await pool.query(
          `INSERT INTO products (
            product_id, name, category, product_type, description,
            price, original_price, discount_info, badge, tag,
            stock, status, sizes, colors, features, care,
            image, secondary_image, rating, reviews_count, featured, display_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (product_id) DO NOTHING`,
          [
            p.id,
            p.name,
            p.category,
            p.productType || '',
            p.description || '',
            p.price,
            p.originalPrice || null,
            p.discountInfo || '',
            p.badge || '',
            p.tag || (p.badge || 'Radiant'),
            p.stock || 10,
            'active',
            JSON.stringify(p.sizes || ['S', 'M', 'L', 'XL']),
            JSON.stringify(p.colors || []),
            JSON.stringify(p.features || []),
            p.care || '',
            p.image,
            p.secondaryImage || '',
            p.rating || 5.0,
            p.reviewsCount || 0,
            p.featured !== undefined ? p.featured : true,
            i
          ]
        );
      }
      console.log('[DB] Initial catalog seeded into PostgreSQL successfully.');
    }
  } catch (err) {
    console.warn('[DB Products Seed Error]', err.message);
  }
}

export default pool;
