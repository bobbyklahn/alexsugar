import { sql } from '@vercel/postgres';

// Database initialization - run this once to set up tables
export async function initializeDatabase() {
  try {
    // Create price_history table
    await sql`
      CREATE TABLE IF NOT EXISTS price_history (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        price DECIMAL(10, 4) NOT NULL,
        open DECIMAL(10, 4),
        high DECIMAL(10, 4),
        low DECIMAL(10, 4),
        close DECIMAL(10, 4),
        volume BIGINT,
        source VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_price_timestamp
      ON price_history(timestamp DESC)
    `;

    // Create news_articles table
    await sql`
      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        original_language VARCHAR(10),
        content TEXT,
        translated_content TEXT,
        source VARCHAR(100),
        source_url TEXT,
        category VARCHAR(50),
        published_at TIMESTAMP,
        image_url TEXT,
        is_translated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_news_published
      ON news_articles(published_at DESC)
    `;

    // Create price_alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS price_alerts (
        id SERIAL PRIMARY KEY,
        alert_type VARCHAR(50),
        threshold DECIMAL(10, 4),
        is_active BOOLEAN DEFAULT TRUE,
        last_triggered TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create push_subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Price history operations
export async function savePriceData(data: {
  timestamp: Date;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  source: string;
}) {
  return sql`
    INSERT INTO price_history (timestamp, price, open, high, low, close, volume, source)
    VALUES (${data.timestamp.toISOString()}, ${data.price}, ${data.open || null},
            ${data.high || null}, ${data.low || null}, ${data.close || null},
            ${data.volume || null}, ${data.source})
    RETURNING *
  `;
}

export async function getPriceHistory(startDate: Date, endDate: Date) {
  return sql`
    SELECT * FROM price_history
    WHERE timestamp >= ${startDate.toISOString()}
      AND timestamp <= ${endDate.toISOString()}
    ORDER BY timestamp ASC
  `;
}

// Alert operations
export async function createAlert(alertType: string, threshold: number) {
  return sql`
    INSERT INTO price_alerts (alert_type, threshold)
    VALUES (${alertType}, ${threshold})
    RETURNING *
  `;
}

export async function getActiveAlerts() {
  return sql`
    SELECT * FROM price_alerts
    WHERE is_active = TRUE
    ORDER BY created_at DESC
  `;
}

export async function getAllAlerts() {
  return sql`
    SELECT * FROM price_alerts
    ORDER BY created_at DESC
  `;
}

export async function updateAlert(
  id: number,
  data: { isActive?: boolean; lastTriggered?: Date }
) {
  if (data.lastTriggered) {
    return sql`
      UPDATE price_alerts
      SET is_active = ${data.isActive ?? true},
          last_triggered = ${data.lastTriggered.toISOString()}
      WHERE id = ${id}
      RETURNING *
    `;
  }
  return sql`
    UPDATE price_alerts
    SET is_active = ${data.isActive ?? true}
    WHERE id = ${id}
    RETURNING *
  `;
}

export async function deleteAlert(id: number) {
  return sql`
    DELETE FROM price_alerts
    WHERE id = ${id}
    RETURNING *
  `;
}

// News operations
export async function saveNewsArticle(article: {
  title: string;
  originalLanguage: string;
  content?: string;
  source: string;
  sourceUrl: string;
  category: string;
  publishedAt: Date;
  imageUrl?: string;
}) {
  return sql`
    INSERT INTO news_articles (title, original_language, content, source, source_url, category, published_at, image_url)
    VALUES (${article.title}, ${article.originalLanguage}, ${article.content || null},
            ${article.source}, ${article.sourceUrl}, ${article.category},
            ${article.publishedAt.toISOString()}, ${article.imageUrl || null})
    ON CONFLICT DO NOTHING
    RETURNING *
  `;
}

export async function getNewsArticles(
  category: string = 'all',
  limit: number = 20,
  offset: number = 0
) {
  if (category === 'all') {
    return sql`
      SELECT * FROM news_articles
      ORDER BY published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  return sql`
    SELECT * FROM news_articles
    WHERE category = ${category}
    ORDER BY published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
}

export async function updateArticleTranslation(id: number, translatedContent: string) {
  return sql`
    UPDATE news_articles
    SET translated_content = ${translatedContent},
        is_translated = TRUE
    WHERE id = ${id}
    RETURNING *
  `;
}

export async function getArticleById(id: number) {
  return sql`
    SELECT * FROM news_articles
    WHERE id = ${id}
  `;
}

// Push subscription operations
export async function savePushSubscription(
  endpoint: string,
  p256dh: string,
  auth: string
) {
  return sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth)
    VALUES (${endpoint}, ${p256dh}, ${auth})
    ON CONFLICT (endpoint) DO UPDATE
    SET p256dh = ${p256dh}, auth = ${auth}
    RETURNING *
  `;
}

export async function getPushSubscriptions() {
  return sql`
    SELECT * FROM push_subscriptions
  `;
}

export async function deletePushSubscription(endpoint: string) {
  return sql`
    DELETE FROM push_subscriptions
    WHERE endpoint = ${endpoint}
    RETURNING *
  `;
}
