/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pool, PoolConfig } from 'pg';

export interface DbProjectRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  aspectRatio: string;
  durationSec: number;
  clips: any[];
  thumbnailUrl?: string;
  isDeletedInTrash?: boolean;
  version: number;
}

export interface PostgresStatus {
  connected: boolean;
  engine: 'postgresql';
  host: string;
  database: string;
  poolSize: number;
  message: string;
  error?: string;
}

let pool: Pool | null = null;
let isConnected = false;
let lastError: string | null = null;

/**
 * Configure and initialize PostgreSQL Connection Pool
 */
export function getPostgresPool(): Pool {
  if (pool) return pool;

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.PG_CONNECTION_STRING ||
    'postgresql://postgres:postgres@localhost:5432/tdocut_db';

  const config: PoolConfig = {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };

  // Enable SSL if connecting to remote cloud databases (Neon, Supabase, Render, AWS RDS)
  if (process.env.PGSSL === 'true' || connectionString.includes('sslmode=require')) {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(config);

  pool.on('error', (err) => {
    isConnected = false;
    lastError = err.message;
    console.warn('[PostgreSQL Pool Warning]:', err.message);
  });

  return pool;
}

/**
 * Initialize PostgreSQL Schema on Server Startup
 */
export async function initPostgresDatabase(): Promise<boolean> {
  const p = getPostgresPool();
  try {
    const client = await p.connect();
    try {
      await client.query(`
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
        CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects (updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects (is_deleted_in_trash);
        CREATE TABLE IF NOT EXISTS app_settings (
          key VARCHAR(128) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      isConnected = true;
      lastError = null;
      console.log('✅ [PostgreSQL] Connected and initialized "projects" table successfully!');
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    isConnected = false;
    lastError = err.message;
    console.warn(
      '⚠️ [PostgreSQL Notice]: Could not connect to PostgreSQL database (' +
        err.message +
        '). The server will operate with fallback local project storage until PostgreSQL is available.'
    );
    return false;
  }
}

/**
 * Check Current PostgreSQL Connection Health
 */
export async function getPostgresStatus(): Promise<PostgresStatus> {
  const p = getPostgresPool();
  const connStr = process.env.DATABASE_URL || 'postgresql://localhost:5432/tdocut_db';
  let host = 'localhost';
  let dbName = 'tdocut_db';

  try {
    const url = new URL(connStr.replace('postgresql://', 'http://'));
    host = url.hostname;
    dbName = url.pathname.replace(/^\//, '') || 'tdocut_db';
  } catch {
    // Ignore URL parse error
  }

  try {
    const client = await p.connect();
    client.release();
    isConnected = true;
    lastError = null;
    return {
      connected: true,
      engine: 'postgresql',
      host,
      database: dbName,
      poolSize: p.totalCount,
      message: 'PostgreSQL database connected and operational.',
    };
  } catch (err: any) {
    isConnected = false;
    lastError = err.message;
    return {
      connected: false,
      engine: 'postgresql',
      host,
      database: dbName,
      poolSize: 0,
      message: 'PostgreSQL database disconnected: ' + err.message,
      error: err.message,
    };
  }
}

/**
 * Retrieve All Projects from PostgreSQL
 */
export async function getAllProjectsFromDb(): Promise<DbProjectRecord[]> {
  const p = getPostgresPool();
  const res = await p.query(`
    SELECT
      id,
      name,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      aspect_ratio AS "aspectRatio",
      duration_sec::float AS "durationSec",
      clips,
      thumbnail_url AS "thumbnailUrl",
      is_deleted_in_trash AS "isDeletedInTrash",
      version
    FROM projects
    ORDER BY updated_at DESC;
  `);

  return res.rows.map((r) => ({
    ...r,
    createdAt: new Date(r.createdAt).toISOString(),
    updatedAt: new Date(r.updatedAt).toISOString(),
    clips: typeof r.clips === 'string' ? JSON.parse(r.clips) : r.clips || [],
  }));
}

/**
 * Retrieve Single Project by ID from PostgreSQL
 */
export async function getProjectByIdFromDb(id: string): Promise<DbProjectRecord | null> {
  const p = getPostgresPool();
  const res = await p.query(
    `
    SELECT
      id,
      name,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      aspect_ratio AS "aspectRatio",
      duration_sec::float AS "durationSec",
      clips,
      thumbnail_url AS "thumbnailUrl",
      is_deleted_in_trash AS "isDeletedInTrash",
      version
    FROM projects
    WHERE id = $1;
  `,
    [id]
  );

  if (res.rows.length === 0) return null;
  const r = res.rows[0];
  return {
    ...r,
    createdAt: new Date(r.createdAt).toISOString(),
    updatedAt: new Date(r.updatedAt).toISOString(),
    clips: typeof r.clips === 'string' ? JSON.parse(r.clips) : r.clips || [],
  };
}

/**
 * Save or Update (Upsert) Project in PostgreSQL
 */
export async function upsertProjectToDb(proj: DbProjectRecord): Promise<void> {
  const p = getPostgresPool();
  const clipsJson = JSON.stringify(proj.clips || []);
  const now = new Date().toISOString();

  await p.query(
    `
    INSERT INTO projects (
      id,
      name,
      created_at,
      updated_at,
      aspect_ratio,
      duration_sec,
      clips,
      thumbnail_url,
      is_deleted_in_trash,
      version
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = EXCLUDED.updated_at,
      aspect_ratio = EXCLUDED.aspect_ratio,
      duration_sec = EXCLUDED.duration_sec,
      clips = EXCLUDED.clips,
      thumbnail_url = EXCLUDED.thumbnail_url,
      is_deleted_in_trash = EXCLUDED.is_deleted_in_trash,
      version = EXCLUDED.version;
  `,
    [
      proj.id,
      proj.name,
      proj.createdAt || now,
      now,
      proj.aspectRatio || '16:9',
      proj.durationSec || 0,
      clipsJson,
      proj.thumbnailUrl || null,
      Boolean(proj.isDeletedInTrash),
      proj.version || 1,
    ]
  );
}

/**
 * Permanently Delete Project from PostgreSQL
 */
export async function deleteProjectFromDb(id: string): Promise<void> {
  const p = getPostgresPool();
  await p.query('DELETE FROM projects WHERE id = $1', [id]);
}

/**
 * Move to Trash or Restore Project in PostgreSQL
 */
export async function setProjectTrashStatusInDb(id: string, isDeleted: boolean): Promise<void> {
  const p = getPostgresPool();
  await p.query(
    'UPDATE projects SET is_deleted_in_trash = $2, updated_at = NOW() WHERE id = $1',
    [id, isDeleted]
  );
}

/**
 * Duplicate Existing Project in PostgreSQL
 */
export async function duplicateProjectInDb(
  id: string,
  newId: string,
  copyLabel: string = 'Bản sao'
): Promise<DbProjectRecord | null> {
  const p = getPostgresPool();
  const source = await getProjectByIdFromDb(id);
  if (!source) return null;

  const duplicatedName = `${source.name} (${copyLabel})`;
  const now = new Date().toISOString();
  const duplicatedClips = source.clips.map((c: any) => ({
    ...c,
    id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  }));

  const newRecord: DbProjectRecord = {
    ...source,
    id: newId,
    name: duplicatedName,
    createdAt: now,
    updatedAt: now,
    clips: duplicatedClips,
    isDeletedInTrash: false,
  };

  await upsertProjectToDb(newRecord);
  return newRecord;
}
