// Real-time & Export AI Background Removal (Auto Cutout) using @mediapipe/tasks-vision (Selfie Segmenter)
// Runs 100% free in the browser (PC & Mobile) with zero API keys.

let segmenterPromise: Promise<any> | null = null;
let segmenterFailed = false;

const maskCanvasCache = new Map<string, HTMLCanvasElement>();
let tempSegCanvas: HTMLCanvasElement | null = null;
let tempMaskCanvas: HTMLCanvasElement | null = null;

async function getSegmenter(): Promise<any> {
  if (segmenterFailed) return null;
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      try {
        const vision = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
        const { FilesetResolver, ImageSegmenter } = vision;
        const fileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        return await ImageSegmenter.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      } catch {
        try {
          const vision = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
          const { FilesetResolver, ImageSegmenter } = vision;
          const fileset = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
          );
          return await ImageSegmenter.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
              delegate: 'CPU',
            },
            runningMode: 'IMAGE',
            outputCategoryMask: false,
            outputConfidenceMasks: true,
          });
        } catch {
          segmenterFailed = true;
          return null;
        }
      }
    })();
  }
  return segmenterPromise;
}

export function warmUpBackgroundSegmenter(): void {
  void getSegmenter();
}

function applyMaskToOffscreen(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  confidence: Float32Array,
  maskW: number,
  maskH: number
): HTMLCanvasElement | null {
  if (typeof document === 'undefined' || srcW <= 0 || srcH <= 0) return null;
  if (!tempMaskCanvas) tempMaskCanvas = document.createElement('canvas');
  tempMaskCanvas.width = maskW;
  tempMaskCanvas.height = maskH;
  const mCtx = tempMaskCanvas.getContext('2d');
  if (!mCtx) return null;

  const imgData = mCtx.createImageData(maskW, maskH);
  const d = imgData.data;
  for (let i = 0; i < confidence.length; i++) {
    const c = confidence[i];
    // Smooth alpha feathering around threshold 0.45 -> 0.65
    const alpha = c <= 0.35 ? 0 : c >= 0.65 ? 255 : Math.round(((c - 0.35) / 0.3) * 255);
    const p = i * 4;
    d[p] = 255;
    d[p + 1] = 255;
    d[p + 2] = 255;
    d[p + 3] = alpha;
  }
  mCtx.putImageData(imgData, 0, 0);

  if (!tempSegCanvas) tempSegCanvas = document.createElement('canvas');
  tempSegCanvas.width = srcW;
  tempSegCanvas.height = srcH;
  const sCtx = tempSegCanvas.getContext('2d');
  if (!sCtx) return null;

  sCtx.clearRect(0, 0, srcW, srcH);
  sCtx.globalCompositeOperation = 'source-over';
  sCtx.drawImage(source, 0, 0, srcW, srcH);
  sCtx.globalCompositeOperation = 'destination-in';
  sCtx.imageSmoothingEnabled = true;
  sCtx.drawImage(tempMaskCanvas, 0, 0, srcW, srcH);
  sCtx.globalCompositeOperation = 'source-over';

  return tempSegCanvas;
}

/**
 * Synchronous cached cutout for real-time 60fps Canvas preview.
 * Triggers background segmentation if model is ready; returns masked canvas or null.
 */
export function getCutoutFrameSync(
  clipId: string,
  timeBucket: number,
  source: HTMLVideoElement | HTMLImageElement | ImageBitmap,
  srcW: number,
  srcH: number
): HTMLCanvasElement | null {
  if (srcW <= 0 || srcH <= 0) return null;
  const cacheKey = `${clipId}:${timeBucket}`;
  const cached = maskCanvasCache.get(cacheKey);
  if (cached) return cached;

  // Trigger segmenter warmup and run if already loaded
  void getSegmenter().then((segmenter) => {
    if (!segmenter) return;
    try {
      const res = segmenter.segment(source);
      const mask = res?.confidenceMasks?.[0];
      if (!mask) return;
      const floatData = mask.getAsFloat32Array();
      const masked = applyMaskToOffscreen(source, srcW, srcH, floatData, mask.width, mask.height);
      mask.close?.();
      res.close?.();
      if (masked) {
        const snap = document.createElement('canvas');
        snap.width = srcW;
        snap.height = srcH;
        snap.getContext('2d')?.drawImage(masked, 0, 0);
        // Keep cache bounded to 12 entries to save mobile RAM
        if (maskCanvasCache.size > 12) {
          const firstKey = maskCanvasCache.keys().next().value;
          if (firstKey) maskCanvasCache.delete(firstKey);
        }
        maskCanvasCache.set(cacheKey, snap);
      }
    } catch {
      // Ignore transient frame errors
    }
  });

  // Return most recent cached frame for this clip if available so preview never flickers
  for (const [k, v] of Array.from(maskCanvasCache.entries()).reverse()) {
    if (k.startsWith(`${clipId}:`)) return v;
  }
  return null;
}

/**
 * Awaitable cutout for offline frame-by-frame WebCodecs MP4 export.
 */
export async function getCutoutFrameAsync(
  source: CanvasImageSource,
  srcW: number,
  srcH: number
): Promise<HTMLCanvasElement | null> {
  if (srcW <= 0 || srcH <= 0) return null;
  const segmenter = await getSegmenter();
  if (!segmenter) return null;
  try {
    // Draw VideoFrame/ImageBitmap onto a temp canvas if needed for MediaPipe segment()
    const inputCanvas = document.createElement('canvas');
    inputCanvas.width = Math.min(640, srcW);
    inputCanvas.height = Math.max(2, Math.round((Math.min(640, srcW) / srcW) * srcH));
    inputCanvas.getContext('2d')?.drawImage(source, 0, 0, inputCanvas.width, inputCanvas.height);

    const res = segmenter.segment(inputCanvas);
    const mask = res?.confidenceMasks?.[0];
    if (!mask) return null;
    const floatData = mask.getAsFloat32Array();
    const masked = applyMaskToOffscreen(source, srcW, srcH, floatData, mask.width, mask.height);
    mask.close?.();
    res.close?.();
    return masked;
  } catch {
    return null;
  }
}
