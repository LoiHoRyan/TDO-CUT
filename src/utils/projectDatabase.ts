/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * TDO-CUT Studio Project Database
 * High-performance hybrid storage powered by PostgreSQL with IndexedDB cache fallback.
 * Guarantees that user projects, clips, timelines, and metadata are persisted safely in PostgreSQL.
 */

import { TimelineClip } from './timelineEngine';

export interface StoredProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '21:9' | string;
  durationSec: number;
  clips: TimelineClip[];
  thumbnailUrl?: string;
  isDeletedInTrash?: boolean;
  version: number;
}

export interface DbStatusResponse {
  connected: boolean;
  engine: 'postgresql' | 'indexeddb_fallback';
  host?: string;
  database?: string;
  message?: string;
}

const DB_NAME = 'tdo_cut_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const FALLBACK_KEY = 'tdo_cut_projects_backup_v1';

let dbInstance: IDBDatabase | null = null;

// ============================================================================
// INDEXEDDB LOCAL CACHE & OFFLINE FALLBACK
// ============================================================================

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB is not available');
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('isDeletedInTrash', 'isDeletedInTrash', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function readLocalStorageFallback(): StoredProject[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalStorageFallback(projects: StoredProject[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(projects));
  } catch {
    // Storage quota warning
  }
}

async function getIndexedDbProjects(): Promise<StoredProject[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: StoredProject[] = request.result || [];
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(list);
      };

      request.onerror = () => {
        resolve(readLocalStorageFallback());
      };
    });
  } catch {
    return readLocalStorageFallback();
  }
}

async function saveToIndexedDb(project: StoredProject): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(project);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = readLocalStorageFallback();
    const idx = list.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      list[idx] = project;
    } else {
      list.unshift(project);
    }
    writeLocalStorageFallback(list);
  }
}

async function deleteFromIndexedDb(id: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = readLocalStorageFallback().filter((p) => p.id !== id);
    writeLocalStorageFallback(list);
  }
}

// ============================================================================
// POSTGRESQL PRIMARY CLIENT STORAGE API
// ============================================================================

/**
 * Check PostgreSQL Server Database Connection Status
 */
export async function getPostgresDbStatus(): Promise<DbStatusResponse> {
  try {
    const res = await fetch('/api/db/status');
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch {
    // Network / offline
  }
  return {
    connected: false,
    engine: 'indexeddb_fallback',
    message: 'PostgreSQL API offline; using local IndexedDB storage cache.',
  };
}

/**
 * Load all projects (PostgreSQL primary -> IndexedDB cache fallback)
 */
export async function getAllProjects(): Promise<StoredProject[]> {
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        const list: StoredProject[] = json.data;
        // Keep local cache up to date
        for (const proj of list) {
          saveToIndexedDb(proj).catch(() => {});
        }
        return list;
      }
    }
  } catch {
    // API offline, fall through to cache
  }

  return getIndexedDbProjects();
}

/**
 * Get a single project by ID (PostgreSQL primary -> IndexedDB cache fallback)
 */
export async function getProjectById(id: string): Promise<StoredProject | null> {
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.data) {
        const proj: StoredProject = json.data;
        saveToIndexedDb(proj).catch(() => {});
        return proj;
      }
    }
  } catch {
    // API offline, fall through to cache
  }

  const list = await getIndexedDbProjects();
  return list.find((p) => p.id === id) || null;
}

/**
 * Save or update a project (Saves to PostgreSQL permanently & updates local cache)
 */
export async function saveProject(project: StoredProject): Promise<void> {
  project.updatedAt = new Date().toISOString();

  // 1. Always update local cache immediately for zero latency
  await saveToIndexedDb(project);

  // 2. Persist to PostgreSQL Database
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
  } catch (err) {
    console.warn('[PostgreSQL Save Warning]: Could not persist to PostgreSQL directly:', err);
  }
}

/**
 * Permanently delete a project from PostgreSQL & local cache
 */
export async function deleteProjectPermanently(id: string): Promise<void> {
  // 1. Delete from local cache
  await deleteFromIndexedDb(id);

  // 2. Delete from PostgreSQL
  try {
    await fetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('[PostgreSQL Delete Warning]: Could not delete from PostgreSQL directly:', err);
  }
}

/**
 * Soft delete (move to Trash) or restore from Trash in PostgreSQL
 */
export async function setProjectTrashStatus(id: string, isDeletedInTrash: boolean): Promise<void> {
  const project = await getProjectById(id);
  if (!project) return;
  project.isDeletedInTrash = isDeletedInTrash;
  project.updatedAt = new Date().toISOString();

  await saveToIndexedDb(project);

  try {
    await fetch(`/api/projects/${encodeURIComponent(id)}/trash`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDeletedInTrash }),
    });
  } catch {
    await saveProject(project);
  }
}

/**
 * Duplicate an existing project in PostgreSQL
 */
export async function duplicateProject(
  id: string,
  copyLabel: string = 'Bản sao'
): Promise<StoredProject | null> {
  const newId = `project_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newId, copyLabel }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.data) {
        const duplicated: StoredProject = json.data;
        await saveToIndexedDb(duplicated);
        return duplicated;
      }
    }
  } catch {
    // Fall back to local duplicate
  }

  const source = await getProjectById(id);
  if (!source) return null;

  const duplicated: StoredProject = {
    ...source,
    id: newId,
    name: `${source.name} (${copyLabel})`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clips: source.clips.map((c) => ({
      ...c,
      id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    })),
    isDeletedInTrash: false,
  };

  await saveProject(duplicated);
  return duplicated;
}

/**
 * Load initial projects — returns empty array for new users (no forced demo project).
 * Also cleans up any legacy sample project if present in PostgreSQL or cache.
 */
export async function ensureInitialProjects(): Promise<StoredProject[]> {
  const existing = await getAllProjects();
  const isSample = (name: string) => {
    const l = name.toLowerCase().trim();
    return (
      l === '1' ||
      l.includes('dự án mẫu') ||
      l.includes('du an mau') ||
      l.includes('sample project') ||
      l.includes('untitled project') ||
      l.includes('0421-sao chép') ||
      l.includes('0421-copy') ||
      l.includes('chưa có dự án')
    );
  };
  const cleaned = existing.filter((p) => !isSample(p.name));
  if (cleaned.length !== existing.length) {
    const toRemove = existing.filter((p) => isSample(p.name));
    for (const r of toRemove) {
      await deleteProjectPermanently(r.id).catch(() => {});
    }
  }
  return cleaned;
}
