import fs from 'fs';

// Auto-load .env in local development if present
if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
  try {
    process.loadEnvFile?.('.env');
  } catch (err) {
    // ignore
  }
}

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool, { initDB } from './db.js';
import { verifyToken, requireRole } from './middleware/auth.js';
import { uploadProductImage, rollbackProductImage } from './services/cloudinary.js';
import {
  CATEGORIES,
  CURRENCIES,
  PROMO_CODES,
  LOOKBOOK_ITEMS,
  TESTIMONIALS,
  PRESS_LOGOS
} from './data/products.js';

const app = express();
const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

// Middleware — supports base64 image uploads during final product submission
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --------------------------------------------------------------------------
// Helper: Map PostgreSQL row to Storefront Product format
// --------------------------------------------------------------------------
export function formatProductRow(row) {
  if (!row) return null;
  return {
    id: row.product_id,
    dbId: row.id,
    name: row.name,
    category: row.category,
    productType: row.product_type || '',
    description: row.description || '',
    price: parseFloat(row.price),
    originalPrice: row.original_price != null ? parseFloat(row.original_price) : null,
    discountInfo: row.discount_info || '',
    badge: row.badge || '',
    tag: row.tag || (row.badge || 'Radiant'),
    stock: parseInt(row.stock, 10) || 0,
    status: row.status || 'active',
    sizes: Array.isArray(row.sizes) ? row.sizes : (typeof row.sizes === 'string' ? JSON.parse(row.sizes) : []),
    colors: Array.isArray(row.colors) ? row.colors : (typeof row.colors === 'string' ? JSON.parse(row.colors) : []),
    features: Array.isArray(row.features) ? row.features : (typeof row.features === 'string' ? JSON.parse(row.features) : []),
    care: row.care || '',
    image: row.image,
    secondaryImage: row.secondary_image || '',
    rating: parseFloat(row.rating != null ? row.rating : 5.0),
    reviewsCount: parseInt(row.reviews_count, 10) || 0,
    featured: Boolean(row.featured),
    displayOrder: parseInt(row.display_order, 10) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// --------------------------------------------------------------------------
// API Routes
// --------------------------------------------------------------------------

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'RADIANT WEARS',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 2. Get Products (Database-driven with Category, Search, Price, and Sort filters)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, maxPrice, sort } = req.query;

    let queryText = 'SELECT * FROM products WHERE status NOT IN ($1, $2) AND COALESCE(is_deleted, false) = FALSE';
    const params = ['draft', 'deleted'];

    // Category filter
    if (category && category !== 'all') {
      params.push(category.toLowerCase());
      queryText += ` AND LOWER(category) = $${params.length}`;
    }

    // Search filter
    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const searchIdx = params.length;
      queryText += ` AND (
        LOWER(name) LIKE $${searchIdx} OR
        LOWER(COALESCE(description, '')) LIKE $${searchIdx} OR
        LOWER(COALESCE(product_type, '')) LIKE $${searchIdx} OR
        LOWER(COALESCE(tag, '')) LIKE $${searchIdx} OR
        LOWER(category) LIKE $${searchIdx}
      )`;
    }

    // Max price filter
    if (maxPrice) {
      const priceNum = parseFloat(maxPrice);
      if (!isNaN(priceNum)) {
        params.push(priceNum);
        queryText += ` AND price <= $${params.length}`;
      }
    }

    // Sorting
    if (sort === 'price-low') {
      queryText += ' ORDER BY price ASC, display_order ASC, created_at DESC';
    } else if (sort === 'price-high') {
      queryText += ' ORDER BY price DESC, display_order ASC, created_at DESC';
    } else if (sort === 'rating') {
      queryText += ' ORDER BY rating DESC, display_order ASC, created_at DESC';
    } else if (sort === 'reviews') {
      queryText += ' ORDER BY reviews_count DESC, display_order ASC, created_at DESC';
    } else {
      queryText += ' ORDER BY display_order ASC, created_at DESC';
    }

    const { rows } = await pool.query(queryText, params);
    const products = rows.map(formatProductRow);

    res.json({
      count: products.length,
      products
    });
  } catch (err) {
    console.error('[Database Products Error]', err);
    res.status(500).json({ error: 'Failed to load products from database.' });
  }
});

// 3. Get Single Product (Database-driven)
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const isNumeric = /^\d+$/.test(id);
    let result;
    if (isNumeric) {
      result = await pool.query('SELECT * FROM products WHERE product_id = $1 OR id = $2 LIMIT 1', [id, parseInt(id, 10)]);
    } else {
      result = await pool.query('SELECT * FROM products WHERE product_id = $1 LIMIT 1', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(formatProductRow(result.rows[0]));
  } catch (err) {
    console.error('[Single Product Error]', err);
    res.status(500).json({ error: 'Failed to retrieve product.' });
  }
});

// 4. Categories & Currencies
app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES);
});

app.get('/api/currencies', (req, res) => {
  res.json(CURRENCIES);
});

// 5. Lookbook & Reviews
app.get('/api/lookbook', (req, res) => {
  res.json(LOOKBOOK_ITEMS);
});

app.get('/api/reviews', (req, res) => {
  res.json({
    testimonials: TESTIMONIALS,
    press: PRESS_LOGOS
  });
});

// 6. Validate Promo Code
app.post('/api/promo/validate', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Promo code is required.' });
  }

  const cleanCode = code.trim().toUpperCase();
  const promo = PROMO_CODES[cleanCode];

  if (promo) {
    return res.json({
      valid: true,
      code: cleanCode,
      ...promo
    });
  } else {
    return res.status(404).json({
      valid: false,
      message: 'Invalid promo code.'
    });
  }
});

// 7. Checkout / Order Creation
app.post('/api/checkout', async (req, res) => {
  const { customer, items, shipping, payment, totals } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  const orderId = `RW-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder = {
    orderId,
    customer: customer || {},
    items,
    shipping: shipping || { method: 'Express Insured Delivery' },
    payment: { method: payment?.method || 'card' },
    totals: totals || {},
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    estimatedDelivery: '2-4 Business Days'
  };

  await pool.query(
    `INSERT INTO orders (order_id, customer, items, shipping, payment, totals, status, estimated_delivery)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      newOrder.orderId,
      JSON.stringify(newOrder.customer),
      JSON.stringify(newOrder.items),
      JSON.stringify(newOrder.shipping),
      JSON.stringify(newOrder.payment),
      JSON.stringify(newOrder.totals),
      newOrder.status,
      newOrder.estimatedDelivery
    ]
  );

  console.log(`[Order Confirmed] Order ID: ${orderId} | Items: ${items.length}`);

  res.status(201).json({
    success: true,
    message: 'Order created and authorized successfully.',
    order: newOrder
  });
});

// 8. Newsletter Subscription
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const clean = email.trim().toLowerCase();
  await pool.query(
    `INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
    [clean]
  );

  res.status(200).json({
    success: true,
    message: 'Welcome to the Radiant VIP Atelier!',
    vipCode: 'VIPGOLD',
    discountPercent: 25
  });
});

// 9. Admin Stats & Orders (protected — admin JWT required)
app.get('/api/admin/stats', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [ordersCount, subscribersCount, revenueResult, productsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM orders'),
      pool.query('SELECT COUNT(*) AS count FROM newsletter_subscribers'),
      pool.query(`SELECT COALESCE(SUM((totals->>'total')::numeric), 0) AS total FROM orders WHERE status = 'CONFIRMED'`),
      pool.query('SELECT COUNT(*) AS count FROM products'),
    ]);

    res.json({
      totalOrders:        parseInt(ordersCount.rows[0].count),
      totalSubscribers:   parseInt(subscribersCount.rows[0].count),
      totalProducts:      parseInt(productsCount.rows[0].count),
      estimatedRevenue:   parseFloat(revenueResult.rows[0].total).toFixed(2),
    });
  } catch (err) {
    console.error('[Admin Stats Error]', err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

app.get('/api/admin/orders', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const result = await pool.query(
      'SELECT order_id, customer, items, totals, status, created_at FROM orders ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    console.error('[Admin Orders Error]', err);
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// 9.1 Admin Get All Products (Includes drafts & inventory details)
app.get('/api/admin/products', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE COALESCE(is_deleted, false) = FALSE AND status != $1 ORDER BY created_at DESC',
      ['deleted']
    );
    res.json({
      count: result.rows.length,
      products: result.rows.map(formatProductRow)
    });
  } catch (err) {
    console.error('[Admin Get Products Error]', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
});

// 9.1b Admin Get Deleted Products
app.get('/api/admin/products/deleted', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE is_deleted = TRUE OR status = $1 ORDER BY updated_at DESC',
      ['deleted']
    );
    res.json({
      count: result.rows.length,
      products: result.rows.map(formatProductRow)
    });
  } catch (err) {
    console.error('[Admin Get Deleted Products Error]', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve deleted products.' });
  }
});

// 9.2 Admin Create Product (With Cloudinary upload & Neon DB persistence)
app.post('/api/admin/products', verifyToken, requireRole('admin'), async (req, res) => {
  const {
    name,
    category,
    productType,
    description,
    price,
    originalPrice,
    discountInfo,
    badge,
    tag,
    stock,
    status,
    sizes,
    colors,
    features,
    care,
    image,
    secondaryImage,
    displayOrder
  } = req.body;

  // 1. Validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Product name is required.' });
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({ success: false, message: 'Product category is required.' });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ success: false, message: 'A valid positive price is required.' });
  }

  if (!image || typeof image !== 'string' || !image.trim()) {
    return res.status(400).json({ success: false, message: 'A product image is required.' });
  }

  const parsedOriginalPrice = originalPrice !== undefined && originalPrice !== null && originalPrice !== '' 
    ? parseFloat(originalPrice) 
    : null;
  const parsedStock = stock !== undefined && stock !== null && stock !== '' ? parseInt(stock, 10) : 10;
  const parsedDisplayOrder = displayOrder ? parseInt(displayOrder, 10) : 0;
  const safeStatus = ['active', 'draft', 'in_stock', 'out_of_stock'].includes(status) ? status : 'active';

  // Parse arrays
  let safeSizes = sizes;
  if (typeof safeSizes === 'string') {
    try { safeSizes = JSON.parse(safeSizes); } catch { safeSizes = safeSizes.split(',').map(s => s.trim()).filter(Boolean); }
  }
  if (!Array.isArray(safeSizes) || safeSizes.length === 0) {
    safeSizes = ['S', 'M', 'L', 'XL'];
  }

  let safeColors = colors;
  if (typeof safeColors === 'string') {
    try { safeColors = JSON.parse(safeColors); } catch { safeColors = []; }
  }
  if (!Array.isArray(safeColors)) {
    safeColors = [];
  }

  let safeFeatures = features;
  if (typeof safeFeatures === 'string') {
    try { safeFeatures = JSON.parse(safeFeatures); } catch { safeFeatures = safeFeatures.split('\n').map(f => f.trim()).filter(Boolean); }
  }
  if (!Array.isArray(safeFeatures)) {
    safeFeatures = [];
  }

  // 2. Process image through Cloudinary service (ONLY ON FINAL SUBMIT ACTION)
  let uploadedImageInfo = null;
  let secondaryImageInfo = null;

  try {
    uploadedImageInfo = await uploadProductImage(image, { folder: 'radiantwears/products' });
    if (secondaryImage && typeof secondaryImage === 'string' && secondaryImage.trim()) {
      secondaryImageInfo = await uploadProductImage(secondaryImage, { folder: 'radiantwears/products' });
    }
  } catch (imgErr) {
    console.error('[Image Processing Error]', imgErr);
    return res.status(400).json({
      success: false,
      message: `Image upload failed: ${imgErr.message || 'Unable to process image'}`
    });
  }

  // 3. Generate unique product identifier
  const cleanSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 16);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const productId = `rw-${cleanSlug}-${Date.now().toString().slice(-4)}${randomSuffix}`;

  // 4. Save into Neon DB
  try {
    const insertQuery = `
      INSERT INTO products (
        product_id, name, category, product_type, description,
        price, original_price, discount_info, badge, tag,
        stock, status, sizes, colors, features, care,
        image, secondary_image, display_order
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16,
        $17, $18, $19
      )
      RETURNING *
    `;

    const values = [
      productId,
      name.trim(),
      category.trim().toLowerCase(),
      productType?.trim() || '',
      description?.trim() || '',
      parsedPrice,
      parsedOriginalPrice,
      discountInfo?.trim() || '',
      badge?.trim() || '',
      tag?.trim() || (badge?.trim() || 'New Season'),
      parsedStock,
      safeStatus,
      JSON.stringify(safeSizes),
      JSON.stringify(safeColors),
      JSON.stringify(safeFeatures),
      care?.trim() || '',
      uploadedImageInfo.url,
      secondaryImageInfo ? secondaryImageInfo.url : (secondaryImage?.trim() || null),
      parsedDisplayOrder
    ];

    const result = await pool.query(insertQuery, values);
    const createdProduct = formatProductRow(result.rows[0]);

    console.log(`[Product Created] ID: ${productId} | Name: "${name}" | Category: ${category}`);

    return res.status(201).json({
      success: true,
      message: 'Product created and saved to database successfully.',
      product: createdProduct
    });
  } catch (dbErr) {
    console.error('[DB Insert Error]', dbErr);

    // Rollback uploaded Cloudinary images to prevent orphaned assets
    if (uploadedImageInfo?.publicId) {
      await rollbackProductImage(uploadedImageInfo.publicId);
    }
    if (secondaryImageInfo?.publicId) {
      await rollbackProductImage(secondaryImageInfo.publicId);
    }

    return res.status(500).json({
      success: false,
      message: `Database error while saving product: ${dbErr.message || 'Unknown database error'}`
    });
  }
});

// 9.3 Admin Delete Product (Soft delete to Deleted Products, or permanent)
app.delete('/api/admin/products/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';

    let result;
    if (permanent) {
      result = await pool.query(
        'DELETE FROM products WHERE product_id = $1 OR id::text = $1 RETURNING *',
        [id]
      );
    } else {
      result = await pool.query(
        `UPDATE products SET
          is_deleted = TRUE,
          status = 'deleted',
          updated_at = NOW()
        WHERE product_id = $1 OR id::text = $1
        RETURNING *`,
        [id]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    console.log(`[Product ${permanent ? 'Permanently Deleted' : 'Soft Deleted'}] ID: ${id}`);
    res.json({
      success: true,
      message: `Product "${result.rows[0].name}" has been ${permanent ? 'permanently removed' : 'moved to Deleted Products'}.`,
      product: formatProductRow(result.rows[0])
    });
  } catch (err) {
    console.error('[Admin Delete Product Error]', err);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// 9.5 Admin Repost Deleted Product
app.post('/api/admin/products/:id/repost', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE products SET
        is_deleted = FALSE,
        status = 'active',
        updated_at = NOW()
      WHERE product_id = $1 OR id::text = $1
      RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    console.log(`[Product Reposted] ID: ${id}`);
    res.json({
      success: true,
      message: `Product "${result.rows[0].name}" has been reposted to the catalog.`,
      product: formatProductRow(result.rows[0])
    });
  } catch (err) {
    console.error('[Admin Repost Product Error]', err);
    res.status(500).json({ success: false, message: 'Failed to repost product.' });
  }
});

// 9.4 Admin Update Product
app.put('/api/admin/products/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      productType,
      description,
      price,
      originalPrice,
      discountInfo,
      badge,
      tag,
      stock,
      status,
      sizes,
      colors,
      features,
      care,
      image,
      secondaryImage,
      displayOrder
    } = req.body;

    const existingRes = await pool.query(
      'SELECT * FROM products WHERE product_id = $1 OR id::text = $1',
      [id]
    );

    if (existingRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const existing = existingRes.rows[0];

    let finalImageUrl = existing.image;
    if (image && image.startsWith('data:')) {
      try {
        const uploaded = await uploadProductImage(image, { folder: 'radiantwears/products' });
        finalImageUrl = uploaded.url;
      } catch (e) {
        console.error('[Update Image Error]', e);
      }
    } else if (image) {
      finalImageUrl = image;
    }

    let finalSecondaryImageUrl = existing.secondary_image;
    if (secondaryImage && secondaryImage.startsWith('data:')) {
      try {
        const uploadedSec = await uploadProductImage(secondaryImage, { folder: 'radiantwears/products' });
        finalSecondaryImageUrl = uploadedSec.url;
      } catch (e) {
        console.error('[Update Secondary Image Error]', e);
      }
    } else if (secondaryImage !== undefined) {
      finalSecondaryImageUrl = secondaryImage || null;
    }

    const updateQuery = `
      UPDATE products SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        product_type = COALESCE($3, product_type),
        description = COALESCE($4, description),
        price = COALESCE($5, price),
        original_price = $6,
        discount_info = COALESCE($7, discount_info),
        badge = COALESCE($8, badge),
        tag = COALESCE($9, tag),
        stock = COALESCE($10, stock),
        status = COALESCE($11, status),
        sizes = COALESCE($12, sizes),
        colors = COALESCE($13, colors),
        features = COALESCE($14, features),
        care = COALESCE($15, care),
        image = COALESCE($16, image),
        secondary_image = $17,
        display_order = COALESCE($18, display_order),
        updated_at = NOW()
      WHERE product_id = $19 OR id::text = $19
      RETURNING *
    `;

    const values = [
      name ? name.trim() : null,
      category ? category.trim().toLowerCase() : null,
      productType ? productType.trim() : null,
      description !== undefined ? description.trim() : null,
      price ? parseFloat(price) : null,
      originalPrice ? parseFloat(originalPrice) : null,
      discountInfo !== undefined ? discountInfo.trim() : null,
      badge !== undefined ? badge.trim() : null,
      tag !== undefined ? tag.trim() : null,
      stock !== undefined ? parseInt(stock, 10) : null,
      status || null,
      sizes ? JSON.stringify(sizes) : null,
      colors ? JSON.stringify(colors) : null,
      features ? JSON.stringify(features) : null,
      care !== undefined ? care.trim() : null,
      finalImageUrl,
      finalSecondaryImageUrl,
      displayOrder !== undefined ? parseInt(displayOrder, 10) : null,
      id
    ];

    const result = await pool.query(updateQuery, values);
    const updatedProduct = formatProductRow(result.rows[0]);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct
    });
  } catch (err) {
    console.error('[Admin Update Product Error]', err);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// --------------------------------------------------------------------------
// Customer Authentication Routes
// --------------------------------------------------------------------------

// 10. Register new customer account
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if email already registered
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const insertRes = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'customer')
       RETURNING id, name, email, role, created_at`,
      [cleanName, cleanEmail, password_hash]
    );

    const user = insertRes.rows[0];
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({ success: false, message: 'Registration failed due to a server error.' });
  }
});

// 11. Customer / User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, is_active, created_at FROM users WHERE email = $1',
      [cleanEmail]
    );

    const user = result.rows[0];
    const dummyHash = '$2b$12$invalidsaltxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const hashToCompare = user ? user.password_hash : dummyHash;
    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordMatch || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ success: false, message: 'Login failed due to a server error.' });
  }
});

// 12. Current User Profile & Orders
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const userRes = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes.rows[0];

    // Query recent orders made with this user's email
    const ordersRes = await pool.query(
      `SELECT order_id, items, totals, status, created_at, estimated_delivery
       FROM orders
       WHERE customer->>'email' = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [user.email]
    );

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      },
      orders: ordersRes.rows
    });
  } catch (err) {
    console.error('[Auth Me Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile data.' });
  }
});

// 13. Admin Login — DB-backed, bcrypt verified, JWT issued
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  // 1. Look up user by email
  const result = await pool.query(
    'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email.trim().toLowerCase()]
  );

  const user = result.rows[0];

  // 2. Use a constant-time compare even on "not found" to prevent timing attacks
  const dummyHash = '$2b$12$invalidsaltxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  const hashToCompare = user ? user.password_hash : dummyHash;
  const passwordMatch = await bcrypt.compare(password, hashToCompare);

  // 3. Fail if user not found, password wrong, account inactive, or not admin
  if (!user || !passwordMatch || !user.is_active || user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // 4. Issue JWT — payload never contains password_hash
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });

  return res.json({
    success: true,
    token,
    admin: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// Start Server with error handling
const startServer = async (port) => {
  await initDB();

  const server = app.listen(port, () => {
    console.log(`=============================================`);
    console.log(`  ✦ RADIANT WEARS ATELIER BACKEND API ✦`);
    console.log(`  Server running on http://localhost:${port}`);
    console.log(`  Health check at http://localhost:${port}/api/health`);
    console.log(`=============================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[WARNING] Port ${port} is currently in use.`);
      const nextPort = Number(port) + 1;
      console.log(`Retrying on fallback port http://localhost:${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);

