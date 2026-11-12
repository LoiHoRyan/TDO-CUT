import express from 'express';
import http from 'node:http';
import { createServer as createViteServer } from 'vite';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';

import {
  initPostgresDatabase,
  getPostgresStatus,
  getAllProjectsFromDb,
  getProjectByIdFromDb,
  upsertProjectToDb,
  deleteProjectFromDb,
  setProjectTrashStatusInDb,
  duplicateProjectInDb,
} from './src/server/db';

interface MediaFileMeta {
  index: number;
  byteOffset: number;
  byteLength: number;
  ext: string;
}

interface VideoSegmentMeta {
  mediaIndex: number;
  startTime: number;
  duration: number;
  sourceIn: number;
  speed: number;
  volume: number;
  muted: boolean;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  scale?: number;
  posX?: number;
  posY?: number;
  rotation?: number;
  opacity?: number;
  cropLeft?: number;
  cropTop?: number;
  cropRight?: number;
  cropBottom?: number;
  transitionType?: string;
  transitionDuration?: number;
}

interface AudioSegmentMeta {
  mediaIndex: number;
  startTime: number;
  duration: number;
  sourceIn: number;
  volume: number;
  muted: boolean;
}

interface OverlayPngMeta {
  pngBase64: string;
  startTime: number;
  endTime: number;
  x?: number;
  y?: number;
  frameWidth?: number;
  frameHeight?: number;
  frameCount?: number;
}

interface ExportRequestPayload {
  width: number;
  height: number;
  respectNativeResolution?: boolean;
  fps: number;
  format: 'mp4' | 'mov' | 'webm' | 'gif';
  codec: 'h264' | 'hevc' | 'av1' | 'prores4444';
  bitrateMode?: 'recommended' | 'higher' | 'lower';
  targetBitrateMbps?: number;
  videoBitsPerSecond?: number;
  crf: number;
  totalDurationSec: number;
  mediaFiles: MediaFileMeta[];
  videoSegments: VideoSegmentMeta[];
  audioSegments: AudioSegmentMeta[];
  overlays: OverlayPngMeta[];
}

interface ProbedMediaInfo {
  hasAudio: boolean;
  width: number;
  height: number;
  duration: number;
  pixFmt: string;
  colorSpace: string;
  colorTransfer: string;
  colorPrimaries: string;
  colorRange: string;
}

async function probeMediaStreamInfo(filePath: string): Promise<ProbedMediaInfo> {
  return new Promise<ProbedMediaInfo>((resolve) => {
    const proc = spawn('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration:stream=codec_type,width,height,channels,sample_rate,duration,pix_fmt,color_space,color_transfer,color_primaries,color_range',
      '-of',
      'json',
      filePath,
    ]);
    let out = '';
    proc.stdout.on('data', (chunk: Buffer) => {
      out += chunk.toString();
    });
    proc.on('close', () => {
      try {
        const parsed = JSON.parse(out) as {
          format?: { duration?: string | number };
          streams?: Array<{
            codec_type?: string;
            width?: number;
            height?: number;
            channels?: number;
            sample_rate?: string | number;
            duration?: string | number;
            pix_fmt?: string;
            color_space?: string;
            color_transfer?: string;
            color_primaries?: string;
            color_range?: string;
          }>;
        };
        const streams = parsed.streams || [];
        const aStream = streams.find(
          (s) =>
            s.codec_type === 'audio' &&
            (s.channels === undefined || Number(s.channels) > 0) &&
            (s.sample_rate === undefined || Number(s.sample_rate) > 0)
        );
        const vStream = streams.find(
          (s) => s.codec_type === 'video' && (s.width || 0) > 0 && (s.height || 0) > 0
        );
        const fmtDur = Number(parsed.format?.duration || vStream?.duration || 0);
        resolve({
          hasAudio: Boolean(aStream),
          width: vStream?.width || 0,
          height: vStream?.height || 0,
          duration: Number.isFinite(fmtDur) && fmtDur > 0 ? fmtDur : 0,
          pixFmt: vStream?.pix_fmt || 'yuv420p',
          colorSpace: vStream?.color_space || '',
          colorTransfer: vStream?.color_transfer || '',
          colorPrimaries: vStream?.color_primaries || '',
          colorRange: vStream?.color_range || '',
        });
      } catch {
        resolve({
          hasAudio: false,
          width: 0,
          height: 0,
          duration: 0,
          pixFmt: 'yuv420p',
          colorSpace: '',
          colorTransfer: '',
          colorPrimaries: '',
          colorRange: '',
        });
      }
    });
    proc.on('error', () => {
      resolve({
        hasAudio: false,
        width: 0,
        height: 0,
        duration: 0,
        pixFmt: 'yuv420p',
        colorSpace: '',
        colorTransfer: '',
        colorPrimaries: '',
        colorRange: '',
      });
    });
  });
}

function readPngDimensions(buf: Buffer): { width: number; height: number } | null {
  if (
    buf.length >= 24 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (width > 0 && height > 0) {
      return { width, height };
    }
  }
  return null;
}

function buildAtempoChain(speed: number): string {
  const clamped = Math.max(0.25, Math.min(4.0, speed || 1.0));
  if (Math.abs(clamped - 1.0) < 0.01) return '';
  const filters: string[] = [];
  let rem = clamped;
  while (rem > 2.0) {
    filters.push('atempo=2.0');
    rem /= 2.0;
  }
  while (rem < 0.5) {
    filters.push('atempo=0.5');
    rem /= 0.5;
  }
  filters.push(`atempo=${rem.toFixed(4)}`);
  return filters.join(',');
}

async function cleanupFiles(files: string[]): Promise<void> {
  for (const f of files) {
    try {
      await fs.unlink(f);
    } catch {
      // Ignore cleanup errors
    }
  }
}

interface ExportJobState {
  jobId: string;
  status: 'processing' | 'done' | 'error' | 'cancelled';
  progressPct: number;
  encodedSec: number;
  totalSec: number;
  outPath: string;
  inputTempFiles: string[];
  allTempFiles: string[];
  fileSize: number;
  resolution: string;
  bitrateMbps: string;
  mimeType: string;
  error: string | null;
  activeProc: ReturnType<typeof spawn> | null;
  aborted: boolean;
  createdAt: number;
}

const exportJobs = new Map<string, ExportJobState>();

function parseFfmpegTimeSec(stderrChunk: string): number | null {
  const matches = Array.from(stderrChunk.matchAll(/time=\s*(\d+):(\d+):(\d+(?:\.\d+)?)/g));
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  const hh = Number(last[1] || 0);
  const mm = Number(last[2] || 0);
  const ss = Number(last[3] || 0);
  const total = hh * 3600 + mm * 60 + ss;
  return Number.isFinite(total) && total >= 0 ? total : null;
}

function tryFreePort(port: number): boolean {
  let freed = false;
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        stdio: ['pipe', 'pipe', 'ignore'],
      }).toString();
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const localAddr = parts[1] || '';
        const state = parts[3];
        const pid = parts[parts.length - 1];
        const portRegex = new RegExp(`:${port}$`);
        if (
          portRegex.test(localAddr) &&
          state === 'LISTENING' &&
          pid &&
          pid !== String(process.pid) &&
          pid !== '0'
        ) {
          console.log(`[Server] Freeing port ${port} by terminating stale process PID ${pid}...`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            freed = true;
          } catch {
            // Process may already have terminated
          }
        }
      }
    } else {
      try {
        const pids = execSync(`lsof -ti:${port}`, { stdio: ['pipe', 'pipe', 'ignore'] })
          .toString()
          .trim();
        if (pids) {
          for (const pid of pids.split('\n')) {
            if (pid && pid !== String(process.pid)) {
              execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
              freed = true;
            }
          }
        }
      } catch {
        // Port not in use
      }
    }
  } catch {
    // Port not in use or netstat returned non-zero
  }
  if (freed) {
    try {
      if (process.platform === 'win32') {
        execSync('ping 127.0.0.1 -n 1 -w 250 >nul', { stdio: 'ignore' });
      } else {
        execSync('sleep 0.25', { stdio: 'ignore' });
      }
    } catch {
      // Ignore sleep error
    }
  }
  return freed;
}

function startListening(
  server: http.Server,
  initialPort: number,
  host = '0.0.0.0',
  maxRetries = 10
): Promise<number> {
  return new Promise((resolve, reject) => {
    let port = initialPort;
    let retries = 0;
    let retriedCurrentPort = false;

    const onListening = () => {
      server.removeListener('error', onError);
      resolve(port);
    };

    const onError = (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Server] Port ${port} is already in use.`);
        if (!retriedCurrentPort) {
          retriedCurrentPort = true;
          console.log(`[Server] Attempting to free port ${port} and retry...`);
          const wasKilled = tryFreePort(port);
          if (wasKilled) {
            setTimeout(() => {
              server.listen(port, host);
            }, 250);
            return;
          }
        }
        if (retries < maxRetries) {
          retries++;
          port++;
          retriedCurrentPort = false;
          console.log(`[Server] Falling back to port ${port}...`);
          tryFreePort(port);
          server.listen(port, host);
        } else {
          server.removeListener('listening', onListening);
          reject(err);
        }
      } else {
        server.removeListener('listening', onListening);
        reject(err);
      }
    };

    server.on('error', onError);
    server.on('listening', onListening);

    tryFreePort(port);
    tryFreePort(24678);
    server.listen(port, host);
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const httpServer = http.createServer(app);

  // JSON Body Parser for PostgreSQL Project payloads & metadata
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize PostgreSQL connection and schema on startup
  initPostgresDatabase().catch((err) => {
    console.warn('[PostgreSQL Startup Init]:', err.message);
  });

  // Periodic cleanup for stale export jobs older than 30 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [id, job] of exportJobs.entries()) {
      if (now - job.createdAt > 30 * 60 * 1000) {
        if (job.activeProc && !job.activeProc.killed) {
          try {
            job.activeProc.kill('SIGKILL');
          } catch {
            // Ignore
          }
        }
        cleanupFiles(job.allTempFiles).catch(() => {});
        exportJobs.delete(id);
      }
    }
  }, 5 * 60 * 1000);

  // ========================================================================
  // POSTGRESQL DATABASE API ENDPOINTS
  // ========================================================================

  // Database Connection Health & Info
  app.get('/api/db/status', async (_req: express.Request, res: express.Response) => {
    try {
      const status = await getPostgresStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ connected: false, error: err.message, engine: 'postgresql' });
    }
  });

  // GET All Projects from PostgreSQL
  app.get('/api/projects', async (_req: express.Request, res: express.Response) => {
    try {
      const projects = await getAllProjectsFromDb();
      res.json({ ok: true, data: projects, engine: 'postgresql' });
    } catch (err: any) {
      res.status(503).json({ ok: false, error: err.message, engine: 'fallback' });
    }
  });

  // GET Single Project by ID
  app.get('/api/projects/:id', async (req: express.Request, res: express.Response) => {
    try {
      const project = await getProjectByIdFromDb(req.params.id);
      if (!project) {
        return res.status(404).json({ ok: false, error: 'Project not found' });
      }
      res.json({ ok: true, data: project, engine: 'postgresql' });
    } catch (err: any) {
      res.status(503).json({ ok: false, error: err.message });
    }
  });

  // POST Save / Upsert Project in PostgreSQL
  app.post('/api/projects', async (req: express.Request, res: express.Response) => {
    try {
      const project = req.body;
      if (!project || !project.id || !project.name) {
        return res.status(400).json({ ok: false, error: 'Invalid project payload' });
      }
      await upsertProjectToDb(project);
      res.json({ ok: true, message: 'Project saved to PostgreSQL successfully', engine: 'postgresql' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // DELETE Project permanently from PostgreSQL
  app.delete('/api/projects/:id', async (req: express.Request, res: express.Response) => {
    try {
      await deleteProjectFromDb(req.params.id);
      res.json({ ok: true, message: 'Project deleted permanently from PostgreSQL' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // PUT Move Project to / from Trash in PostgreSQL
  app.put('/api/projects/:id/trash', async (req: express.Request, res: express.Response) => {
    try {
      const { isDeletedInTrash } = req.body;
      await setProjectTrashStatusInDb(req.params.id, Boolean(isDeletedInTrash));
      res.json({ ok: true, message: 'Project trash status updated in PostgreSQL' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // POST Duplicate Project in PostgreSQL
  app.post('/api/projects/:id/duplicate', async (req: express.Request, res: express.Response) => {
    try {
      const newId = req.body?.newId || `project_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const copyLabel = req.body?.copyLabel || 'Bản sao';
      const duplicated = await duplicateProjectInDb(req.params.id, newId, copyLabel);
      if (!duplicated) {
        return res.status(404).json({ ok: false, error: 'Source project not found' });
      }
      res.json({ ok: true, data: duplicated, engine: 'postgresql' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  let ffmpegAvailableCache: boolean | null = null;
  app.get('/api/app-info', (_req: express.Request, res: express.Response) => {
    const cwd = process.cwd().replace(/\\/g, '/');
    res.json({
      appName: 'TDO CUT',
      version: '1.0.0',
      workspaceDir: cwd,
      projectsDir: `${cwd}/projects`,
      exportsDir: `${cwd}/exports`,
    });
  });

  app.get('/api/health', async (_req: express.Request, res: express.Response) => {
    if (ffmpegAvailableCache !== null) {
      res.json({ ok: ffmpegAvailableCache, engine: 'ffmpeg' });
      return;
    }
    const available = await new Promise<boolean>((resolve) => {
      try {
        const proc = spawn('ffmpeg', ['-version']);
        proc.on('close', (code) => resolve(code === 0));
        proc.on('error', () => resolve(false));
      } catch {
        resolve(false);
      }
    });
    ffmpegAvailableCache = available;
    res.json({ ok: available, engine: 'ffmpeg' });
  });

  app.get('/api/export-video/status/:jobId', (req: express.Request, res: express.Response) => {
    const job = exportJobs.get(String(req.params.jobId || ''));
    if (!job) {
      res.status(404).json({ error: 'Export job not found' });
      return;
    }
    res.json({
      jobId: job.jobId,
      status: job.status,
      progressPct: job.progressPct,
      encodedSec: job.encodedSec,
      totalSec: job.totalSec,
      fileSize: job.fileSize,
      resolution: job.resolution,
      bitrateMbps: job.bitrateMbps,
      mimeType: job.mimeType,
      error: job.error,
    });
  });

  app.post('/api/export-video/cancel/:jobId', async (req: express.Request, res: express.Response) => {
    const jobId = String(req.params.jobId || '');
    const job = exportJobs.get(jobId);
    if (job) {
      job.aborted = true;
      job.status = 'cancelled';
      if (job.activeProc && !job.activeProc.killed) {
        try {
          job.activeProc.kill('SIGKILL');
        } catch {
          // Ignore
        }
      }
      await cleanupFiles(job.allTempFiles);
      exportJobs.delete(jobId);
    }
    res.json({ ok: true });
  });

  app.get('/api/export-video/chunk/:jobId', async (req: express.Request, res: express.Response) => {
    const jobId = String(req.params.jobId || '');
    const job = exportJobs.get(jobId);
    if (!job || job.status !== 'done' || job.fileSize <= 0) {
      res.status(404).json({ error: 'Export output not ready' });
      return;
    }
    const offset = Math.max(0, Math.floor(Number(req.query.offset || 0)));
    const maxChunk = 16 * 1024 * 1024; // 16 MB max per chunk (safely below Cloud Run 32 MB limit)
    const reqLen = Math.max(1, Math.min(maxChunk, Math.floor(Number(req.query.length || maxChunk))));
    if (offset >= job.fileSize) {
      res.status(416).json({ error: 'Offset out of range' });
      return;
    }
    const endByte = Math.min(job.fileSize - 1, offset + reqLen - 1);
    const sliceLen = endByte - offset + 1;
    const isFinalChunk = endByte >= job.fileSize - 1;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', String(sliceLen));
    res.setHeader('X-Chunk-Start', String(offset));
    res.setHeader('X-Chunk-End', String(endByte));
    res.setHeader('X-Total-Size', String(job.fileSize));

    await new Promise<void>((resolve, reject) => {
      const readStream = createReadStream(job.outPath, { start: offset, end: endByte });
      readStream.on('error', reject);
      res.on('finish', resolve);
      res.on('close', resolve);
      readStream.pipe(res);
    }).catch(() => {});

    if (isFinalChunk) {
      await cleanupFiles(job.allTempFiles);
      exportJobs.delete(jobId);
    }
  });

  app.post(
    '/api/export-video',
    express.raw({ type: 'application/octet-stream', limit: '1500mb' }),
    async (req: express.Request, res: express.Response) => {
      const bodyBuf = req.body as Buffer;
      if (!Buffer.isBuffer(bodyBuf) || bodyBuf.length < 8) {
        res.status(400).json({ error: 'Invalid binary export payload' });
        return;
      }

      const isAsyncMode = req.query.async === '1';
      const jobId = crypto.randomBytes(6).toString('hex');
      const tmpDir = os.tmpdir();
      const inputTempFiles: string[] = [];
      const allTempFiles: string[] = [];

      const jobState: ExportJobState = {
        jobId,
        status: 'processing',
        progressPct: 5,
        encodedSec: 0,
        totalSec: 1,
        outPath: '',
        inputTempFiles,
        allTempFiles,
        fileSize: 0,
        resolution: '1080×1920',
        bitrateMbps: '8.5',
        mimeType: 'video/mp4',
        error: null,
        activeProc: null,
        aborted: false,
        createdAt: Date.now(),
      };

      const onClientAbort = () => {
        if (isAsyncMode) return;
        jobState.aborted = true;
        if (jobState.activeProc && !jobState.activeProc.killed) {
          try {
            jobState.activeProc.kill('SIGKILL');
          } catch {
            // Ignore
          }
        }
      };
      req.on('aborted', onClientAbort);
      res.on('close', () => {
        if (!isAsyncMode && !res.writableEnded) {
          onClientAbort();
        }
      });

      try {
        const metaLen = bodyBuf.readUInt32BE(0);
        if (4 + metaLen > bodyBuf.length) {
          res.status(400).json({ error: 'Corrupted metadata header length' });
          return;
        }
        const metaJsonStr = bodyBuf.subarray(4, 4 + metaLen).toString('utf8');
        const meta = JSON.parse(metaJsonStr) as ExportRequestPayload;
        const binaryStartOffset = 4 + metaLen;

        const reqW = Math.max(2, Math.round((meta.width || 1920) / 2) * 2);
        const reqH = Math.max(2, Math.round((meta.height || 1080) / 2) * 2);
        const safeFps = Math.max(24, Math.min(60, Math.round(meta.fps || 30)));
        const outExt =
          meta.format === 'mov'
            ? 'mov'
            : meta.format === 'webm'
            ? 'webm'
            : 'mp4';

        // 1. Write uploaded media blobs to disk and probe audio + native resolution + duration
        const mediaPaths: string[] = [];
        const mediaInfoList: ProbedMediaInfo[] = [];

        for (let i = 0; i < meta.mediaFiles.length; i++) {
          const mf = meta.mediaFiles[i];
          const cleanExt = (mf.ext || 'mp4').replace(/[^a-z0-9]/gi, '') || 'mp4';
          const filePath = path.join(tmpDir, `tdocut_${jobId}_in_${i}.${cleanExt}`);
          const start = binaryStartOffset + mf.byteOffset;
          const end = Math.min(bodyBuf.length, start + mf.byteLength);
          await fs.writeFile(filePath, bodyBuf.subarray(start, end));
          inputTempFiles.push(filePath);
          allTempFiles.push(filePath);
          mediaPaths.push(filePath);
          const info = await probeMediaStreamInfo(filePath);
          mediaInfoList.push(info);
        }

        // Release raw upload buffer from Node.js heap immediately after writing temp files
        (req as unknown as { body: unknown }).body = null;

        const vSegs = meta.videoSegments || [];
        if (vSegs.length === 0) {
          res.status(400).json({ error: 'No video segments provided' });
          await cleanupFiles(allTempFiles);
          return;
        }

        let safeW = reqW;
        let safeH = reqH;
        const primaryProbed = mediaInfoList[vSegs[0].mediaIndex];
        if (
          meta.respectNativeResolution === true &&
          primaryProbed &&
          primaryProbed.width >= reqW &&
          primaryProbed.height >= reqH
        ) {
          const pRatio = primaryProbed.width / primaryProbed.height;
          const reqRatio = reqW / reqH;
          if (Math.abs(pRatio - reqRatio) < 0.25) {
            safeW = Math.max(2, Math.round(primaryProbed.width / 2) * 2);
            safeH = Math.max(2, Math.round(primaryProbed.height / 2) * 2);
          }
        }
        const scaleRatioX = safeW / reqW;
        const scaleRatioY = safeH / reqH;

        // 2. Write and validate overlay sprite PNGs on disk
        const overlayPaths: Array<{
          path: string;
          startTime: number;
          endTime: number;
          x: number;
          y: number;
          frameWidth: number;
          frameHeight: number;
          frameCount: number;
        }> = [];
        for (let k = 0; k < (meta.overlays || []).length; k++) {
          const ov = meta.overlays[k];
          if (!ov.pngBase64 || ov.pngBase64.length < 100) continue;
          const rawB64 = ov.pngBase64.replace(/^data:image\/\w+;base64,/, '');
          const pngBuf = Buffer.from(rawB64, 'base64');
          const pngDims = readPngDimensions(pngBuf);
          if (!pngDims) continue;

          const ovPath = path.join(tmpDir, `tdocut_${jobId}_ov_${k}.png`);
          await fs.writeFile(ovPath, pngBuf);
          inputTempFiles.push(ovPath);
          allTempFiles.push(ovPath);

          const rawFc = Math.max(1, Math.round(Number(ov.frameCount || 1)));
          const actualFw =
            rawFc > 1
              ? Math.max(2, Math.floor(pngDims.width / rawFc / 2) * 2)
              : pngDims.width;
          const actualFh = pngDims.height;

          overlayPaths.push({
            path: ovPath,
            startTime: Math.max(0, Number(ov.startTime || 0)),
            endTime: Math.max(0.1, Number(ov.endTime || meta.totalDurationSec)),
            x: Math.max(0, Math.min(safeW - 2, Math.round(Number(ov.x || 0) * scaleRatioX))),
            y: Math.max(0, Math.min(safeH - 2, Math.round(Number(ov.y || 0) * scaleRatioY))),
            frameWidth: actualFw,
            frameHeight: actualFh,
            frameCount: rawFc,
          });
        }

        if (jobState.aborted) {
          await cleanupFiles(allTempFiles);
          return;
        }

        const outPath = path.join(tmpDir, `tdocut_${jobId}_out.${outExt}`);
        allTempFiles.push(outPath);

        const totalTargetDur = Math.max(
          0.5,
          vSegs.reduce((acc, s) => acc + Math.max(0.1, s.duration || 0), 0)
        );
        const mimeType =
          outExt === 'webm'
            ? 'video/webm'
            : outExt === 'mov'
            ? 'video/quicktime'
            : 'video/mp4';

        jobState.outPath = outPath;
        jobState.totalSec = totalTargetDur;
        jobState.resolution = `${safeW}×${safeH}`;
        jobState.mimeType = mimeType;

        // Compute CapCut-grade Studio HD target bitrate & VBV ceiling (in kbps)
        const pixelCount = safeW * safeH;
        const baseKbps =
          pixelCount >= 3840 * 2000
            ? 55000
            : pixelCount >= 2500 * 1400
            ? 34000
            : pixelCount >= 1900 * 1000
            ? 20000
            : pixelCount >= 1200 * 700
            ? 12000
            : 6000;
        const modeMult =
          meta.bitrateMode === 'higher'
            ? 1.45
            : meta.bitrateMode === 'lower'
            ? 0.72
            : 1.0;
        const fpsMult = safeFps >= 50 ? 1.25 : 1.0;
        const studioFloorKbps = Math.round(baseKbps * modeMult * fpsMult);
        const requestedKbps = meta.videoBitsPerSecond
          ? Math.round(meta.videoBitsPerSecond / 1000)
          : meta.targetBitrateMbps
          ? Math.round(meta.targetBitrateMbps * 1000)
          : studioFloorKbps;
        const targetKbps = Math.max(
          5000,
          Math.min(85000, Math.max(requestedKbps, studioFloorKbps))
        );
        const minRateKbps = Math.round(targetKbps * 0.75);
        const bufSizeKbps = Math.round(targetKbps * 2.0);
        const effectiveCrf =
          meta.bitrateMode === 'higher'
            ? 15
            : meta.bitrateMode === 'lower'
            ? 20
            : Math.max(15, Math.min(18, Number(meta.crf || 17)));
        const maxDim = Math.max(safeW, safeH);

        // Check whether any input video actually requires 10-bit HLG/PQ HDR -> SDR conversion
        const hasAnyHdrSegment = vSegs.some((seg) => {
          const p = mediaInfoList[seg.mediaIndex];
          return (
            p &&
            (p.colorTransfer === 'arib-std-b67' || p.colorTransfer === 'smpte2084')
          );
        });

        const buildFfmpegCommandArgs = (
          includeOverlays: boolean,
          enableHdrToneMap: boolean
        ): string[] => {
          const ffArgs: string[] = ['-y', '-threads', '0'];
          let nextInputIdx = 0;

          // Add each video segment as an input with safe clamped seek
          const vSegInputIndices: number[] = [];
          vSegs.forEach((seg) => {
            const mIdx = seg.mediaIndex;
            const probed = mediaInfoList[mIdx];
            const spd = Math.max(0.25, Math.min(4.0, seg.speed || 1.0));
            let srcIn = Math.max(0, Number((seg.sourceIn || 0).toFixed(3)));
            if (probed && probed.duration > 0.25 && srcIn >= probed.duration - 0.1) {
              srcIn = Math.max(0, Number((probed.duration - 0.2).toFixed(3)));
            }
            const outDur = Math.max(0.1, Number((seg.duration || 1.0).toFixed(3)));
            const srcDur = Number((outDur * spd + 0.25).toFixed(3));
            ffArgs.push(
              '-ss',
              String(srcIn),
              '-t',
              String(srcDur),
              '-i',
              mediaPaths[mIdx]
            );
            vSegInputIndices.push(nextInputIdx++);
          });

          // Add each overlay sprite / PNG as a loop-buffered input matching output framerate (decoded ONCE in memory)
          const ovInputIndices: number[] = [];
          const activeOverlays = includeOverlays ? overlayPaths : [];
          activeOverlays.forEach((ov) => {
            ffArgs.push('-framerate', String(safeFps), '-loop', '1', '-i', ov.path);
            ovInputIndices.push(nextInputIdx++);
          });

          // Add any external Track 1 / PIP audio segments as fast-seeked inputs
          const validAudioSegs = (meta.audioSegments || []).filter(
            (a) => !a.muted && (a.volume ?? 100) > 0 && mediaInfoList[a.mediaIndex]?.hasAudio
          );
          const extAudioInputIndices: number[] = [];
          validAudioSegs.forEach((aseg) => {
            const mIdx = aseg.mediaIndex;
            const probed = mediaInfoList[mIdx];
            let srcIn = Math.max(0, Number((aseg.sourceIn || 0).toFixed(3)));
            if (probed && probed.duration > 0.25 && srcIn >= probed.duration - 0.1) {
              srcIn = Math.max(0, Number((probed.duration - 0.2).toFixed(3)));
            }
            const dur = Math.max(0.1, Number((aseg.duration || 1.0).toFixed(3)));
            ffArgs.push('-ss', String(srcIn), '-t', String(dur), '-i', mediaPaths[mIdx]);
            extAudioInputIndices.push(nextInputIdx++);
          });

          const filterParts: string[] = [];
          const concatPairs: string[] = [];

          vSegs.forEach((seg, idx) => {
            const inIdx = vSegInputIndices[idx];
            const mIdx = seg.mediaIndex;
            const probed = mediaInfoList[mIdx];
            const spd = Math.max(0.25, Math.min(4.0, seg.speed || 1.0));
            const outDur = Math.max(0.1, Number((seg.duration || 1.0).toFixed(3)));

            const vChain: string[] = [
              `setpts=(PTS-STARTPTS)/${spd.toFixed(4)}`,
              `fps=${safeFps}`,
            ];

            // Optional spatial crop if user cropped this clip
            const cL = Math.max(0, Math.min(45, Number(seg.cropLeft || 0)));
            const cR = Math.max(0, Math.min(45, Number(seg.cropRight || 0)));
            const cT = Math.max(0, Math.min(45, Number(seg.cropTop || 0)));
            const cB = Math.max(0, Math.min(45, Number(seg.cropBottom || 0)));
            if (cL > 0.5 || cR > 0.5 || cT > 0.5 || cB > 0.5) {
              const keepW = Math.max(0.1, (100 - cL - cR) / 100).toFixed(4);
              const keepH = Math.max(0.1, (100 - cT - cB) / 100).toFixed(4);
              const offX = (cL / 100).toFixed(4);
              const offY = (cT / 100).toFixed(4);
              vChain.push(
                `crop=trunc(iw*${keepW}/2)*2:trunc(ih*${keepH}/2)*2:trunc(iw*${offX}):trunc(ih*${offY})`
              );
            }

            // Detect 10-bit HLG / PQ HDR smartphone footage (e.g. iPhone Dolby Vision / HLG)
            const isHdrInput =
              enableHdrToneMap &&
              probed &&
              (probed.colorTransfer === 'arib-std-b67' ||
                probed.colorTransfer === 'smpte2084');

            const userScale = Math.max(0.1, Math.min(5.0, (seg.scale ?? 100) / 100));
            const userPosX = Math.round((seg.posX || 0) * scaleRatioX);
            const userPosY = Math.round((seg.posY || 0) * scaleRatioY);

            if (isHdrInput) {
              const tin =
                probed.colorTransfer === 'smpte2084' ? 'smpte2084' : 'arib-std-b67';
              const min =
                probed.colorSpace === 'bt2020c' ? 'bt2020c' : 'bt2020nc';
              const rin = probed.colorRange === 'pc' ? 'pc' : 'tv';
              vChain.push(
                `zscale=tin=${tin}:pin=bt2020:min=${min}:rin=${rin}:t=bt709:p=bt709:m=bt709:r=tv`,
                `scale='trunc(min(${safeW},iw*${userScale.toFixed(3)})/2)*2':'trunc(min(${safeH},ih*${userScale.toFixed(3)})/2)*2':force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos+accurate_rnd+full_chroma_int`,
                `pad=${safeW}:${safeH}:'(ow-iw)/2+${userPosX}':'(oh-ih)/2+${userPosY}':black`,
                `unsharp=5:5:0.6:5:5:0.0`,
                `setsar=1`,
                `format=yuv420p`
              );
            } else {
              // High-clarity Lanczos scaling with user scale + offset + studio unsharp mask
              if (Math.abs(userScale - 1.0) > 0.01) {
                vChain.push(
                  `scale=${safeW}:${safeH}:force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos+accurate_rnd+full_chroma_int`,
                  `scale='trunc(iw*${userScale.toFixed(3)}/2)*2':'trunc(ih*${userScale.toFixed(3)}/2)*2':flags=lanczos+accurate_rnd`,
                  `pad=${safeW}:${safeH}:'(ow-iw)/2+${userPosX}':'(oh-ih)/2+${userPosY}':black`
                );
              } else {
                vChain.push(
                  `scale=${safeW}:${safeH}:force_original_aspect_ratio=decrease:force_divisible_by=2:flags=lanczos+accurate_rnd+full_chroma_int`,
                  `pad=${safeW}:${safeH}:'(ow-iw)/2+${userPosX}':'(oh-ih)/2+${userPosY}':black`
                );
              }
              vChain.push(
                `unsharp=5:5:0.6:5:5:0.0`,
                `setsar=1`,
                `format=yuv420p`
              );
            }

            if (seg.flipH) vChain.push('hflip');
            if (seg.flipV) vChain.push('vflip');
            if (seg.rotation && Math.abs(seg.rotation) > 0.1) {
              const rad = ((seg.rotation * Math.PI) / 180).toFixed(4);
              vChain.push(`rotate=${rad}:fillcolor=black`);
            }
            const bri = Number(((seg.brightness || 0) / 100).toFixed(2));
            const con = Number((1 + (seg.contrast || 0) / 100).toFixed(2));
            const sat = Number((1 + (seg.saturation || 0) / 100).toFixed(2));
            if (bri !== 0 || con !== 1 || sat !== 1) {
              vChain.push(`eq=brightness=${bri}:contrast=${con}:saturation=${sat}`);
            }
            if (seg.transitionType && seg.transitionType !== 'none') {
              const tDur = Math.max(0.15, Math.min(outDur * 0.5, Number(seg.transitionDuration || 0.5)));
              vChain.push(`fade=t=in:st=0:d=${tDur.toFixed(2)}`);
            }
            vChain.push(
              `tpad=stop_mode=clone:stop_duration=0.5`,
              `trim=0:${outDur.toFixed(3)}`,
              `setpts=PTS-STARTPTS`
            );

            filterParts.push(`[${inIdx}:v]${vChain.join(',')}[vseg${idx}]`);

            // Bulletproof 48kHz stereo audio chain for segment idx
            const hasAud = Boolean(probed?.hasAudio);
            const vol = seg.muted ? 0 : Math.max(0, Math.min(2.0, (seg.volume ?? 100) / 100));

            if (hasAud && vol > 0.001) {
              filterParts.push(
                `anullsrc=r=48000:cl=stereo,atrim=0:${outDur.toFixed(
                  3
                )},asetpts=PTS-STARTPTS,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[asil${idx}]`
              );
              const aChain: string[] = [
                `aresample=48000:async=1:first_pts=0`,
                `asetpts=PTS-STARTPTS`,
              ];
              const atempo = buildAtempoChain(spd);
              if (atempo) aChain.push(atempo);
              if (Math.abs(vol - 1.0) > 0.01) {
                aChain.push(`volume=${vol.toFixed(2)}`);
              }
              aChain.push(
                'aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo',
                `atrim=0:${outDur.toFixed(3)}`,
                'asetpts=PTS-STARTPTS'
              );
              filterParts.push(`[${inIdx}:a]${aChain.join(',')}[araw${idx}]`);
              filterParts.push(
                `[asil${idx}][araw${idx}]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[aseg${idx}]`
              );
            } else {
              filterParts.push(
                `anullsrc=r=48000:cl=stereo,atrim=0:${outDur.toFixed(
                  3
                )},asetpts=PTS-STARTPTS,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[aseg${idx}]`
              );
            }

            concatPairs.push(`[vseg${idx}][aseg${idx}]`);
          });

          if (vSegs.length === 1) {
            filterParts.push(`[vseg0]null[vcat]`);
            filterParts.push(`[aseg0]anull[acat]`);
          } else {
            filterParts.push(
              `${concatPairs.join('')}concat=n=${vSegs.length}:v=1:a=1[vcat][acat]`
            );
          }

          // Convert overlay PNGs ONCE to yuva420p and loop in-memory so the main video NEVER undergoes yuv420p->rgba->yuv420p color range distortion!
          let currentVLabel = '[vcat]';
          activeOverlays.forEach((ov, k) => {
            const inputIdx = ovInputIndices[k];
            const nextVLabel = `[vov${k}]`;
            const sTime = ov.startTime.toFixed(3);
            const eTime = ov.endTime.toFixed(3);
            const needScale = Math.abs(scaleRatioX - 1) > 0.02 || Math.abs(scaleRatioY - 1) > 0.02;
            const targetFw = Math.max(2, Math.round((ov.frameWidth * scaleRatioX) / 2) * 2);
            const targetFh = Math.max(2, Math.round((ov.frameHeight * scaleRatioY) / 2) * 2);

            if (ov.frameCount > 1) {
              const animLbl = `[ov_anim_${k}]`;
              const scaleStep = needScale ? `,scale=${targetFw}:${targetFh}:flags=lanczos+accurate_rnd+full_chroma_int` : '';
              filterParts.push(
                `[${inputIdx}:v]format=yuva420p,loop=loop=-1:size=1:start=0,fps=16,crop=${ov.frameWidth}:${ov.frameHeight}:'${ov.frameWidth}*mod(n,${ov.frameCount})':0${scaleStep},trim=0:${eTime},setpts=PTS-STARTPTS${animLbl}`
              );
              filterParts.push(
                `${currentVLabel}${animLbl}overlay=x=${ov.x}:y=${ov.y}:format=yuv420:eof_action=pass:enable='between(t,${sTime},${eTime})'${nextVLabel}`
              );
            } else {
              const scLbl = `[ov_sc_${k}]`;
              const scaleStep = needScale ? `,scale=${targetFw}:${targetFh}:flags=lanczos+accurate_rnd+full_chroma_int` : '';
              filterParts.push(
                `[${inputIdx}:v]format=yuva420p,setpts=PTS-STARTPTS${scaleStep}${scLbl}`
              );
              filterParts.push(
                `${currentVLabel}${scLbl}overlay=x=${ov.x}:y=${ov.y}:format=yuv420:eof_action=pass:enable='between(t,${sTime},${eTime})'${nextVLabel}`
              );
            }
            currentVLabel = nextVLabel;
          });

          const finalVLabel = '[vfinal]';
          filterParts.push(`${currentVLabel}format=yuv420p${finalVLabel}`);

          // Mix any external Track 1 / PIP audio clips if present
          let currentALabel = '[acat]';
          if (validAudioSegs.length > 0) {
            const mixInputs: string[] = [currentALabel];
            validAudioSegs.forEach((aseg, aIdx) => {
              const inIdx = extAudioInputIndices[aIdx];
              const delayMs = Math.max(0, Math.round((aseg.startTime || 0) * 1000));
              const vol = Math.max(0, Math.min(2.0, (aseg.volume ?? 100) / 100));
              const lbl = `[exta${aIdx}]`;
              filterParts.push(
                `[${inIdx}:a]aresample=48000:async=1:first_pts=0,asetpts=PTS-STARTPTS,volume=${vol.toFixed(
                  2
                )},adelay=${delayMs}|${delayMs},aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo${lbl}`
              );
              mixInputs.push(lbl);
            });
            filterParts.push(
              `${mixInputs.join('')}amix=inputs=${
                mixInputs.length
              }:duration=first:dropout_transition=0:normalize=0,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[amixed]`
            );
            currentALabel = '[amixed]';
          }

          ffArgs.push(
            '-filter_complex',
            filterParts.join(';'),
            '-map',
            finalVLabel,
            '-map',
            currentALabel,
            '-r',
            String(safeFps),
            '-vsync',
            'cfr'
          );

          if (outExt === 'webm') {
            ffArgs.push(
              '-c:v',
              'libvpx-vp9',
              '-deadline',
              'realtime',
              '-cpu-used',
              '5',
              '-b:v',
              `${targetKbps}k`,
              '-minrate',
              `${minRateKbps}k`,
              '-maxrate',
              `${targetKbps}k`,
              '-bufsize',
              `${bufSizeKbps}k`,
              '-c:a',
              'libopus',
              '-b:a',
              '192k',
              '-ar',
              '48000',
              '-ac',
              '2'
            );
          } else {
            // Studio Master High-Profile H.264 + CABAC + In-Loop Deblocking + 8x8DCT + AQ-Mode 2 + AAC-LC 48kHz Stereo 320k
            ffArgs.push(
              '-c:v',
              'libx264',
              '-preset',
              'medium',
              '-profile:v',
              'high',
              '-level:v',
              maxDim > 1920 ? '5.2' : '4.2',
              '-crf',
              String(effectiveCrf),
              '-maxrate',
              `${Math.round(targetKbps * 1.35)}k`,
              '-bufsize',
              `${bufSizeKbps}k`,
              '-x264-params',
              'cabac=1:deblock=1,0,0:8x8dct=1:aq-mode=2:aq-strength=1.0',
              '-g',
              String(safeFps * 2),
              '-keyint_min',
              String(safeFps),
              '-pix_fmt',
              'yuv420p',
              '-color_primaries',
              'bt709',
              '-color_trc',
              'bt709',
              '-colorspace',
              'bt709',
              '-video_track_timescale',
              '90000',
              '-c:a',
              'aac',
              '-b:a',
              '320k',
              '-ar',
              '48000',
              '-ac',
              '2',
              '-movflags',
              '+faststart'
            );
          }

          if (totalTargetDur > 0) {
            ffArgs.push('-t', totalTargetDur.toFixed(3));
          }

          ffArgs.push(outPath);
          return ffArgs;
        };

        const runFfmpeg = (args: string[]) =>
          new Promise<void>((resolve, reject) => {
            const proc = spawn('ffmpeg', args);
            jobState.activeProc = proc;
            let stderrLog = '';
            proc.stderr.on('data', (chunk: Buffer) => {
              const text = chunk.toString();
              stderrLog = (stderrLog + text).slice(-2000);
              const tSec = parseFfmpegTimeSec(text);
              if (tSec !== null && totalTargetDur > 0) {
                jobState.encodedSec = Number(Math.min(totalTargetDur, tSec).toFixed(2));
                const ratio = Math.min(1, tSec / totalTargetDur);
                jobState.progressPct = Math.min(99, Math.max(8, Math.round(8 + ratio * 90)));
              }
            });
            proc.on('close', (code) => {
              jobState.activeProc = null;
              if (jobState.aborted) {
                reject(new Error('Export cancelled by client'));
                return;
              }
              if (code === 0) {
                resolve();
              } else {
                reject(new Error(`FFmpeg exited with code ${code}: ${stderrLog.slice(-500)}`));
              }
            });
            proc.on('error', (err) => {
              jobState.activeProc = null;
              reject(err);
            });
          });

        const executePipeline = async () => {
          try {
            if (hasAnyHdrSegment) {
              try {
                await runFfmpeg(buildFfmpegCommandArgs(true, true));
              } catch (hdrErr) {
                if (jobState.aborted) throw hdrErr;
                await runFfmpeg(buildFfmpegCommandArgs(true, false));
              }
            } else {
              await runFfmpeg(buildFfmpegCommandArgs(true, false));
            }
          } catch (mainErr) {
            if (jobState.aborted) throw mainErr;
            if (overlayPaths.length > 0) {
              await runFfmpeg(buildFfmpegCommandArgs(false, false));
            } else {
              throw mainErr;
            }
          }

          // Immediately delete uploaded input files from /tmp to free container RAM
          await cleanupFiles(inputTempFiles);

          const stat = await fs.stat(outPath);
          const actualMbps = (
            (stat.size * 8) /
            Math.max(0.5, totalTargetDur) /
            1_000_000
          ).toFixed(1);

          jobState.fileSize = stat.size;
          jobState.bitrateMbps = actualMbps;
          jobState.encodedSec = totalTargetDur;
          jobState.progressPct = 100;
          jobState.status = 'done';
        };

        if (isAsyncMode) {
          exportJobs.set(jobId, jobState);
          executePipeline().catch(async (err) => {
            jobState.status = 'error';
            jobState.error = err instanceof Error ? err.message : 'FFmpeg export failed';
            await cleanupFiles(allTempFiles);
          });
          res.status(200).json({
            jobId,
            status: 'processing',
            totalDurationSec: totalTargetDur,
          });
          return;
        }

        await executePipeline();

        if (jobState.aborted) {
          await cleanupFiles(allTempFiles);
          return;
        }

        res.setHeader('Content-Type', jobState.mimeType);
        res.setHeader('Content-Length', String(jobState.fileSize));
        res.setHeader('X-Export-Duration', totalTargetDur.toFixed(2));
        res.setHeader('X-Export-Resolution', jobState.resolution);
        res.setHeader('X-Export-Bitrate-Mbps', jobState.bitrateMbps);

        await new Promise<void>((resolve, reject) => {
          const readStream = createReadStream(outPath);
          readStream.on('error', reject);
          res.on('finish', resolve);
          res.on('close', resolve);
          readStream.pipe(res);
        });
        await cleanupFiles(allTempFiles);
      } catch (err) {
        if (!isAsyncMode) {
          await cleanupFiles(allTempFiles);
        }
        if (!jobState.aborted && !res.headersSent) {
          res.status(500).json({
            error: err instanceof Error ? err.message : 'FFmpeg export failed',
          });
        }
      }
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const actualPort = await startListening(httpServer, PORT, '0.0.0.0');
  console.log(`TDO CUT Server running on http://localhost:${actualPort}`);
}

startServer();
