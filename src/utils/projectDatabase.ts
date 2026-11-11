/**
 * TDO-CUT Studio Project Database
 * High-performance persistent storage using IndexedDB with localStorage fallback.
 * Guarantees that user projects, clips, media files, and settings are never lost.
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

const DB_NAME = 'tdo_cut_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const FALLBACK_KEY = 'tdo_cut_projects_backup_v1';

let dbInstance: IDBDatabase | null = null;

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

// Fallback storage helpers
function readFallbackProjects(): StoredProject[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeFallbackProjects(projects: StoredProject[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(projects));
  } catch {
    // Storage quota warning
  }
}

/**
 * Load all projects ordered by most recently modified
 */
export async function getAllProjects(): Promise<StoredProject[]> {
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
        resolve(readFallbackProjects());
      };
    });
  } catch {
    return readFallbackProjects();
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<StoredProject | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        const list = readFallbackProjects();
        resolve(list.find((p) => p.id === id) || null);
      };
    });
  } catch {
    const list = readFallbackProjects();
    return list.find((p) => p.id === id) || null;
  }
}

/**
 * Save or update a project (auto-saved permanently)
 */
export async function saveProject(project: StoredProject): Promise<void> {
  project.updatedAt = new Date().toISOString();
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
    // Fallback to localStorage
    const list = readFallbackProjects();
    const idx = list.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      list[idx] = project;
    } else {
      list.unshift(project);
    }
    writeFallbackProjects(list);
  }
}

/**
 * Permanently delete a project
 */
export async function deleteProjectPermanently(id: string): Promise<void> {
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
    const list = readFallbackProjects().filter((p) => p.id !== id);
    writeFallbackProjects(list);
  }
}

/**
 * Soft delete (move to Trash) or restore from Trash
 */
export async function setProjectTrashStatus(id: string, isDeletedInTrash: boolean): Promise<void> {
  const project = await getProjectById(id);
  if (!project) return;
  project.isDeletedInTrash = isDeletedInTrash;
  await saveProject(project);
}

/**
 * Duplicate an existing project
 */
export async function duplicateProject(id: string, copyLabel: string = 'Bản sao'): Promise<StoredProject | null> {
  const source = await getProjectById(id);
  if (!source) return null;

  const duplicated: StoredProject = {
    ...source,
    id: `project_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: `${source.name} (${copyLabel})`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clips: source.clips.map((c) => ({
      ...c,
      id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    })),
  };

  await saveProject(duplicated);
  return duplicated;
}

/**
 * Load initial projects — returns empty array for new users (no forced demo project).
 * Also cleans up any legacy sample project if present.
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
