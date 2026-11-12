-- ============================================================================
-- TDO-CUT Studio — PostgreSQL Database Schema
-- High-Performance Persistent Storage for Projects, Timelines & Metadata
-- ============================================================================

-- Create table for storing video editing projects
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  aspect_ratio VARCHAR(32) NOT NULL DEFAULT '16:9',
  duration_sec NUMERIC(10, 3) NOT NULL DEFAULT 0,
  clips JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  is_deleted_in_trash BOOLEAN NOT NULL DEFAULT FALSE,
  version INT NOT NULL DEFAULT 1
);

-- Optimize project lookups by last modified date (Home launcher sorting)
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects (updated_at DESC);

-- Optimize active projects vs trash filtering
CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects (is_deleted_in_trash);

-- High-performance GIN index for JSONB clip queries (searching audio tracks, visual effects, text subtitles)
CREATE INDEX IF NOT EXISTS idx_projects_clips_gin ON projects USING gin (clips);

-- Optional table for persistent Studio system settings and preferences
CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(128) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
