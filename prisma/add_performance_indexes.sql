-- Performance Indexes Migration
-- Run this manually on the production database
-- These indexes dramatically speed up the most expensive queries

-- 1. Compound index for "latest ticker per stock" queries (the main CPU killer)
-- Used by: /api/ticker, /api/ticker/stream, /api/search
CREATE INDEX CONCURRENTLY IF NOT EXISTS "ticker_stocks_id_ts_desc_idx" 
ON "ticker" ("stocks_id", "ts" DESC);

-- 2. GIN index for array containment queries on stock_symbols
-- Used by: /api/stocks/[symbol]/news (WHERE stock_symbols @> ARRAY['BBCA'])
CREATE INDEX CONCURRENTLY IF NOT EXISTS "market_news_stock_symbols_idx" 
ON "market_news" USING GIN ("stock_symbols");

-- 3. Date index for broker summary date filtering
-- Used by: /api/brokers
CREATE INDEX CONCURRENTLY IF NOT EXISTS "broker_summary_date_value_idx" 
ON "broker_summary" ("date", "value" DESC);

-- 4. Date index for corporate calendar upcoming events
-- Used by: /api/calendar
CREATE INDEX CONCURRENTLY IF NOT EXISTS "corporate_calendar_date_idx" 
ON "corporate_calendar" ("date" ASC);

-- Verify indexes were created:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
