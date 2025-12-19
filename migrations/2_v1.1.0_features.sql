-- Migration: 2_v1.1.0_features.sql
-- Description: Tables for Feedback, Analytics, and Error Reporting

-- 1. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'bug', 'feature', 'general'
  message TEXT NOT NULL,
  rating INTEGER, -- 1-5
  contact_email TEXT,
  user_agent TEXT,
  app_version TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'new' -- 'new', 'reviewed', 'implemented', 'closed'
);

-- 2. Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  category TEXT, -- 'navigation', 'action', 'performance', 'system'
  properties TEXT, -- JSON string containing details
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for analytics reporting
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);

-- 3. Client Errors Table (Local Error Logging)
CREATE TABLE IF NOT EXISTS client_errors (
  id TEXT PRIMARY KEY,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  component_stack TEXT,
  severity TEXT DEFAULT 'error', -- 'fatal', 'error', 'warning'
  user_context TEXT, -- JSON snapshot of relevant state
  app_version TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_to_remote BOOLEAN DEFAULT 0
);
