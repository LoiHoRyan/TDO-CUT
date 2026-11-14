import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  Film,
  FileJson,
  CheckCircle2,
  Loader2,
  Terminal,
  Sparkles,
  Scissors,
  Layers,
  Image as ImageIcon,
  ShieldCheck,
  FileText,
  Code,
  Music,
  Ban,
} from 'lucide-react';
import {
  AntiDetectConfig,
  GpuEncoderOption,
  TimelineClip,
  buildFfmpegMatrixCommand,
  exportSubtitlesToSrt,
  exportTimelineToXml,
  computeHighQualityExportSpec,
  computeRealisticExportEstimate,
  resolveDefaultProjectTitle,
  getDefaultExportDirPath,
  patchMediaRecorderBlobDuration,
  canUseDirectStreamCopyForExport,
  extractFlagIsoCode,
  getFlagGraphicDataUrl,
  findGraphicBadgeByIconOrText,
  resolveExportTargetDimensions,
  resolveEffectiveClipAspectRatio,
  computeWavingFlagSlices,
  computeStickerMotionTransform,
  collectSequentialExportVideoClips,
  interpolateClipAtPlayhead,
  AppLanguage,
} from '../utils/timelineEngine';
import { webAudioEngine } from '../utils/webAudioSynthesizer';
import { AspectRatioOption } from './VideoPreviewCanvas';

interface RenderedOverlaySprite {
  pngBase64: string;
  x: number;
  y: number;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
}

async function renderOverlayClipToSpriteData(
  itemClip: TimelineClip,
  w: number,
  h: number
): Promise<RenderedOverlaySprite | null> {
  if (typeof document === 'undefined') return null;

  const dpiScale = Math.max(0.5, w / 960);
  const isStickerOnly = Boolean(itemClip.stickerEmoji && !itemClip.subtitleText);
  const itemPosX = itemClip.posX ?? 0;
  const itemPosY = itemClip.posY ?? 0;
  const tx = w / 2 + (itemPosX / 1920) * w;
  const ty =
    (isStickerOnly ? h * 0.42 : h - Math.max(26, h * 0.1)) +
    (itemPosY / 1080) * h;

  const rawScalePct = itemClip.scale ?? 100;
  const scaleXFactor =
    ((itemClip.uniformScale === false ? itemClip.scaleX ?? rawScalePct : rawScalePct) / 100) *
    (itemClip.flipH ? -1 : 1);
  const scaleYFactor =
    ((itemClip.uniformScale === false ? itemClip.scaleY ?? rawScalePct : rawScalePct) / 100) *
    (itemClip.flipV ? -1 : 1);
  const absScaleX = Math.max(0.15, Math.abs(scaleXFactor));
  const absScaleY = Math.max(0.15, Math.abs(scaleYFactor));
  const rotDeg = itemClip.rotation ?? 0;
  const itemAlpha = Math.max(0, Math.min(1, (itemClip.opacity ?? 100) / 100));

  if (isStickerOnly && itemClip.stickerEmoji) {
    const emojiSize = Math.max(38, Math.round(((itemClip.fontSize || 64) / 450) * h));
    const flagIso =
      extractFlagIsoCode(itemClip.stickerEmoji) ||
      (itemClip.stickerType === 'world_flag' ? extractFlagIsoCode(itemClip.name) || 'VN' : null);
    const badgeDef = !flagIso
      ? findGraphicBadgeByIconOrText(itemClip.stickerEmoji) ||
        findGraphicBadgeByIconOrText(itemClip.name)
      : null;

    // Preload flag SVG image once if this is a world flag
    let loadedFlagImg: HTMLImageElement | null = null;
    if (flagIso) {
      const flagDataUrl = getFlagGraphicDataUrl(flagIso);
      if (flagDataUrl) {
        loadedFlagImg = await new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = flagDataUrl;
        });
      }
    }

    // Calculate tight even frame bounding box around the animated sticker/flag
    const measureCanvas = document.createElement('canvas');
    const mCtx = measureCanvas.getContext('2d');
    let baseLocalW = emojiSize * 1.8;
    let baseLocalH = emojiSize * 1.6;

    if (flagIso) {
      const flagW = Math.round(emojiSize * 1.55);
      const flagH = Math.round(emojiSize * 1.04);
      const customFlagText = (itemClip.stickerText || '').trim();
      baseLocalW = flagW * 1.35;
      baseLocalH = customFlagText ? flagH * 2.1 : flagH * 1.45;
      if (customFlagText && mCtx) {
        const capFontPx = Math.max(13, Math.round(emojiSize * 0.32));
        mCtx.font = `800 ${capFontPx}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
        const capW = mCtx.measureText(customFlagText).width + capFontPx * 1.5;
        baseLocalW = Math.max(baseLocalW, capW * 1.2);
      }
    } else if (badgeDef && mCtx) {
      const mainTextToDraw =
        itemClip.stickerText !== undefined
          ? itemClip.stickerText
          : badgeDef.badgeText || badgeDef.icon;
      const subTextToDraw =
        itemClip.stickerSubText !== undefined
          ? itemClip.stickerSubText
          : badgeDef.badgeSubText || '';
      const mainFontPx = Math.max(16, Math.round(emojiSize * 0.42));
      const subFontPx = Math.max(11, Math.round(emojiSize * 0.24));
      mCtx.font = `900 ${mainFontPx}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
      const mainW = mCtx.measureText(mainTextToDraw || ' ').width;
      const subW = subTextToDraw ? subFontPx * subTextToDraw.length * 0.62 : 0;
      const pillW = Math.max(mainW, subW) + mainFontPx * 2.2;
      const pillH = subTextToDraw ? mainFontPx * 2.15 : mainFontPx * 1.65;
      baseLocalW = pillW * 1.35;
      baseLocalH = pillH * 1.45;
    }

    const diagPad = rotDeg ? Math.max(baseLocalW, baseLocalH) * 1.25 : 0;
    const rawFrameW = Math.max(baseLocalW, diagPad) * absScaleX + 36 * dpiScale;
    const rawFrameH = Math.max(baseLocalH, diagPad) * absScaleY + 36 * dpiScale;
    // Cap per-frame width to 640px so 16-frame sprite strip (<= 10240px) never exceeds browser 16384px canvas limit
    const maxSafeFrameW = Math.min(w, 640);
    const maxSafeFrameH = Math.min(h, 640);
    const frameWidth = Math.min(maxSafeFrameW, Math.max(48, Math.ceil(rawFrameW / 2) * 2));
    const frameHeight = Math.min(maxSafeFrameH, Math.max(48, Math.ceil(rawFrameH / 2) * 2));
    const boxX = Math.max(0, Math.min(w - frameWidth, Math.round(tx - frameWidth / 2)));
    const boxY = Math.max(0, Math.min(h - frameHeight, Math.round(ty - frameHeight / 2)));
    const localCenterX = tx - boxX;
    const localCenterY = ty - boxY;

    const frameCount = 1; // Stickers, badges, and flags are rendered clean & static (đứng yên) for maximum export performance and zero lag/freeze
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = frameWidth * frameCount;
    spriteCanvas.height = frameHeight;
    const ctx = spriteCanvas.getContext('2d');
    if (!ctx) return null;

    for (let f = 0; f < frameCount; f++) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(f * frameWidth, 0, frameWidth, frameHeight);
      ctx.clip();

      ctx.globalAlpha = itemAlpha;
      ctx.translate(f * frameWidth + localCenterX, localCenterY);
      if (rotDeg) {
        ctx.rotate((rotDeg * Math.PI) / 180);
      }
      ctx.scale(scaleXFactor, scaleYFactor);

      if (flagIso) {
        const flagW = Math.round(emojiSize * 1.55);
        const flagH = Math.round(emojiSize * 1.04);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.52)';
        ctx.shadowBlur = Math.max(4, Math.round(8 * dpiScale));
        if (loadedFlagImg && loadedFlagImg.naturalWidth > 0) {
          // Render flag cleanly as a single static high-resolution SVG graphic without broken waving slices
          ctx.drawImage(loadedFlagImg, -flagW / 2, -flagH / 2, flagW, flagH);
        } else {
          ctx.fillStyle = '#DA251D';
          ctx.beginPath();
          ctx.roundRect(-flagW / 2, -flagH / 2, flagW, flagH, 8 * dpiScale);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        const customFlagText = (itemClip.stickerText || '').trim();
        if (customFlagText) {
          const capFontPx = Math.max(13, Math.round(emojiSize * 0.32));
          ctx.font = `800 ${capFontPx}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
          const capW = ctx.measureText(customFlagText).width + capFontPx * 1.2;
          const capH = capFontPx * 1.45;
          const capY = flagH / 2 + capH * 0.62;
          ctx.fillStyle =
            itemClip.textBgColor && itemClip.textBgColor !== 'transparent'
              ? itemClip.textBgColor
              : 'rgba(15, 23, 42, 0.88)';
          ctx.beginPath();
          ctx.roundRect(-capW / 2, capY - capH / 2, capW, capH, 6 * dpiScale);
          ctx.fill();
          ctx.fillStyle = itemClip.textColor || '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(customFlagText, 0, capY);
        }
      } else if (badgeDef) {
        const mainTextToDraw =
          itemClip.stickerText !== undefined
            ? itemClip.stickerText
            : badgeDef.badgeText || badgeDef.icon;
        const subTextToDraw =
          itemClip.stickerSubText !== undefined
            ? itemClip.stickerSubText
            : badgeDef.badgeSubText || '';
        const mainFontPx = Math.max(16, Math.round(emojiSize * 0.42));
        const subFontPx = Math.max(11, Math.round(emojiSize * 0.24));
        ctx.font = `900 ${mainFontPx}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
        const mainW = ctx.measureText(mainTextToDraw || ' ').width;
        const subW = subTextToDraw ? subFontPx * subTextToDraw.length * 0.62 : 0;
        const pillW = Math.max(mainW, subW) + mainFontPx * 2.2;
        const pillH = subTextToDraw ? mainFontPx * 2.15 : mainFontPx * 1.65;

        ctx.fillStyle =
          itemClip.textBgColor && itemClip.textBgColor !== 'transparent'
            ? itemClip.textBgColor
            : badgeDef.badgeBg || '#E11D48';
        ctx.beginPath();
        ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, Math.min(pillH / 2, 14 * dpiScale));
        ctx.fill();

        ctx.strokeStyle = itemClip.textStrokeColor || badgeDef.badgeAccent || '#FFFFFF';
        ctx.lineWidth = Math.max(2, 3 * dpiScale);
        ctx.beginPath();
        ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, Math.min(pillH / 2, 14 * dpiScale));
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = itemClip.textColor || '#FFFFFF';
        ctx.font = `900 ${mainFontPx}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
        ctx.fillText(mainTextToDraw, 0, subTextToDraw ? -pillH * 0.16 : 0);

        if (subTextToDraw) {
          ctx.fillStyle = badgeDef.badgeAccent || '#FDE047';
          ctx.font = `800 ${subFontPx}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
          ctx.fillText(subTextToDraw, 0, pillH * 0.24);
        }
      } else {
        ctx.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(itemClip.stickerEmoji, 0, 0);
      }

      ctx.restore();
    }

    const pngBase64 = spriteCanvas.toDataURL('image/png');
    if (!pngBase64 || !pngBase64.startsWith('data:image/png;base64,')) return null;

    return {
      pngBase64,
      x: boxX,
      y: boxY,
      frameWidth,
      frameHeight,
      frameCount,
    };
  }

  // Cropped multi-line adaptive Subtitle / Text overlay bounded by active aspect ratio
  const text = itemClip.subtitleText || itemClip.name;
  const fontSize = Math.max(16, Math.round(((itemClip.fontSize ?? 28) / 540) * h));
  const maxSafeTextW = Math.max(160, Math.round(w * 0.82));

  // Multi-line auto-wrap helper for text overlays
  const rawParas = text.split('\n');
  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d');
  if (mCtx) {
    mCtx.font = `800 ${fontSize}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
  }

  const lines: string[] = [];
  for (const para of rawParas) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length <= 1) {
      lines.push(para);
      continue;
    }
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const test = cur + ' ' + word;
      const testW = mCtx ? mCtx.measureText(test).width : test.length * fontSize * 0.65;
      if (testW <= maxSafeTextW) {
        cur = test;
      } else {
        lines.push(cur);
        cur = word;
      }
    }
    lines.push(cur);
  }
  const activeLines = lines.length > 0 ? lines : [text];
  let maxLineW = 0;
  activeLines.forEach((l) => {
    const lw = mCtx ? mCtx.measureText(l).width : l.length * fontSize * 0.65;
    if (lw > maxLineW) maxLineW = lw;
  });

  let effectiveFontSize = fontSize;
  if (maxLineW > maxSafeTextW && maxLineW > 0) {
    effectiveFontSize = Math.max(13, Math.round(fontSize * (maxSafeTextW / maxLineW)));
    if (mCtx) {
      mCtx.font = `800 ${effectiveFontSize}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
    }
    maxLineW = 0;
    activeLines.forEach((l) => {
      const lw = mCtx ? mCtx.measureText(l).width : l.length * effectiveFontSize * 0.65;
      if (lw > maxLineW) maxLineW = lw;
    });
  }

  const lineHeight = Math.round(effectiveFontSize * 1.25);
  const totalTextH = activeLines.length * lineHeight;
  const padX = effectiveFontSize * 0.8;
  const padY = effectiveFontSize * 0.5;
  const rawBoxW = (maxLineW + padX * 2) * absScaleX + 28 * dpiScale;
  const rawBoxH = (totalTextH + padY * 2) * absScaleY + 28 * dpiScale;
  const frameWidth = Math.min(w, Math.max(64, Math.ceil(rawBoxW / 2) * 2));
  const frameHeight = Math.min(h, Math.max(40, Math.ceil(rawBoxH / 2) * 2));
  const boxX = Math.max(0, Math.min(w - frameWidth, Math.round(tx - frameWidth / 2)));
  const boxY = Math.max(0, Math.min(h - frameHeight, Math.round(ty - frameHeight / 2)));

  const c = document.createElement('canvas');
  c.width = frameWidth;
  c.height = frameHeight;
  const ctx = c.getContext('2d');
  if (!ctx) return null;

  ctx.save();
  ctx.globalAlpha = itemAlpha;
  ctx.translate(tx - boxX, ty - boxY);
  if (rotDeg) {
    ctx.rotate((rotDeg * Math.PI) / 180);
  }
  ctx.scale(scaleXFactor, scaleYFactor);

  ctx.font = `800 ${effectiveFontSize}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (itemClip.textBgColor && itemClip.textBgColor !== 'transparent') {
    const bgPadX = effectiveFontSize * 0.65;
    const bgPadY = effectiveFontSize * 0.35;
    const bgW = maxLineW + bgPadX * 2;
    const bgH = totalTextH + bgPadY * 2;
    ctx.fillStyle = itemClip.textBgColor;
    ctx.beginPath();
    ctx.roundRect(
      -bgW / 2,
      -bgH / 2,
      bgW,
      bgH,
      8 * dpiScale
    );
    ctx.fill();
  }
  ctx.lineWidth = Math.max(3, Math.round(effectiveFontSize * 0.16));
  ctx.strokeStyle = itemClip.textStrokeColor || '#000000';
  ctx.fillStyle = itemClip.textColor || '#FFFFFF';

  const startY = -totalTextH / 2 + lineHeight * 0.5;
  activeLines.forEach((l, idx) => {
    const lineY = startY + idx * lineHeight;
    ctx.strokeText(l, 0, lineY);
    ctx.fillText(l, 0, lineY);
  });
  ctx.restore();

  const pngBase64 = c.toDataURL('image/png');
  if (!pngBase64 || !pngBase64.startsWith('data:image/png;base64,')) return null;

  return {
    pngBase64,
    x: boxX,
    y: boxY,
    frameWidth,
    frameHeight,
    frameCount: 1,
  };
}

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  aspectRatio: AspectRatioOption;
  clips: TimelineClip[];
  antiDetect: AntiDetectConfig;
  onUpdateAntiDetect?: (patch: Partial<AntiDetectConfig>) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  coverDataUrl?: string | null;
  onCaptureCover?: () => void;
  onScrubPlayheadForExport: (time: number) => void;
  onLockExportDimensions?: (dims: { width: number; height: number } | null) => void;
  onDownloadCapCutDraft: () => void;
  onShuffleBeforeVariantExport?: () => void;
  language?: AppLanguage;
  isMobile?: boolean;
}

export const ExportVideoModal: React.FC<ExportVideoModalProps> = ({
  isOpen,
  onClose,
  projectName,
  aspectRatio,
  clips,
  antiDetect,
  onUpdateAntiDetect,
  canvasRef,
  coverDataUrl,
  onCaptureCover,
  onScrubPlayheadForExport,
  onLockExportDimensions,
  onDownloadCapCutDraft,
  onShuffleBeforeVariantExport,
  language = 'vi',
  isMobile: propIsMobile,
}) => {
  const isEn = language === 'en';
  const [isWindowMobile, setIsWindowMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsWindowMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = propIsMobile !== undefined ? propIsMobile : isWindowMobile;

  // Track active object URLs to prevent OOM memory leak in mobile browsers
  const activeObjectUrlsRef = useRef<Set<string>>(new Set());
  const revokeAllObjectUrls = () => {
    activeObjectUrlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {
        // Ignore
      }
    });
    activeObjectUrlsRef.current.clear();
  };

  useEffect(() => {
    return () => {
      revokeAllObjectUrls();
    };
  }, []);

  const [title, setTitle] = useState(() => resolveDefaultProjectTitle(projectName, language));
  const [exportPath, setExportPath] = useState(() => getDefaultExportDirPath());

  // Sync default project name when projectName prop or language changes
  useEffect(() => {
    setTitle((prev) => {
      const trimmedProject = (projectName || '').trim();
      const isProjectValidCustom =
        Boolean(trimmedProject) &&
        trimmedProject !== '1' &&
        trimmedProject !== '0421-sao chép' &&
        trimmedProject !== '0421-copy' &&
        trimmedProject !== 'Chưa có dự án' &&
        trimmedProject !== 'Untitled Project' &&
        trimmedProject !== 'Nhập tên dự án' &&
        trimmedProject !== 'Enter project name';
      if (isProjectValidCustom) {
        return trimmedProject;
      }
      const isPrevPlaceholder =
        !prev.trim() ||
        prev === '1' ||
        prev === '0421-sao chép' ||
        prev === '0421-copy' ||
        prev === 'Chưa có dự án' ||
        prev === 'Untitled Project' ||
        prev === 'Nhập tên dự án' ||
        prev === 'Enter project name';
      if (isPrevPlaceholder) {
        return resolveDefaultProjectTitle(projectName, language);
      }
      return prev;
    });
  }, [projectName, language]);

  // Left Column: Cover Editor — default text is "Nhập văn bản" (VI) / "Enter text" (EN)
  const [coverTextOverlay, setCoverTextOverlay] = useState(
    isEn ? 'Enter text' : 'Nhập văn bản'
  );
  const [coverTemplateColor, setCoverTemplateColor] = useState('#00E5CC');
  const [localCapturedCoverUrl, setLocalCapturedCoverUrl] = useState<string | null>(null);
  const [mediaSizeMap, setMediaSizeMap] = useState<Record<string, number>>({});

  // Sync default cover text when switching language if still at default value
  useEffect(() => {
    setCoverTextOverlay((prev) => {
      if (prev === 'Nhập văn bản' || prev === 'Enter text' || prev === 'TRENDOPSIS VIRAL') {
        return isEn ? 'Enter text' : 'Nhập văn bản';
      }
      return prev;
    });
  }, [isEn]);

  // Probe actual byte sizes of uploaded mediaUrl blobs so Estimated Size is 100% realistic
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const urlsToProbe = Array.from(
      new Set(
        clips
          .map((c) => c.mediaUrl)
          .filter((u): u is string => Boolean(u && !mediaSizeMap[u]))
      )
    );
    if (urlsToProbe.length === 0) return;

    (async () => {
      const discovered: Record<string, number> = {};
      for (const u of urlsToProbe) {
        try {
          const r = await fetch(u);
          const b = await r.blob();
          if (b.size > 0) {
            discovered[u] = b.size;
          }
        } catch {
          // Ignore probe errors
        }
      }
      if (!cancelled && Object.keys(discovered).length > 0) {
        setMediaSizeMap((prev) => ({ ...prev, ...discovered }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, clips, mediaSizeMap]);

  // Auto-capture actual video frame from canvas whenever Export modal opens
  useEffect(() => {
    if (!isOpen) return;
    const captureNow = () => {
      const cvs = canvasRef.current;
      if (cvs && cvs.width > 0 && cvs.height > 0) {
        try {
          const dataUrl = cvs.toDataURL('image/jpeg', 0.92);
          if (dataUrl && dataUrl.startsWith('data:image/')) {
            setLocalCapturedCoverUrl(dataUrl);
          }
        } catch {
          // Ignore tainted canvas if external cross-origin
        }
      }
    };
    captureNow();
    const timer = window.setTimeout(captureNow, 90);
    return () => window.clearTimeout(timer);
  }, [isOpen, canvasRef]);

  // Right Column Sections (TDO CUT Studio Export Spec)
  const [exportVideoChecked, setExportVideoChecked] = useState(true);
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p' | '2K' | '4K'>('1080p');
  const [bitrateMode, setBitrateMode] = useState<'recommended' | 'higher' | 'lower'>('recommended');
  const [codec, setCodec] = useState<'h264' | 'hevc' | 'av1' | 'prores4444'>('h264');
  const [format, setFormat] = useState<'mp4' | 'mov' | 'webm' | 'gif'>('mp4');
  const [fps, setFps] = useState<'24fps' | '25fps' | '30fps' | '50fps' | '60fps'>('30fps');
  const [colorSpace, setColorSpace] = useState<'Rec.709 SDR' | 'HLG HDR' | 'PQ HDR10'>('Rec.709 SDR');

  const [exportAudioChecked, setExportAudioChecked] = useState(false);
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav' | 'aac' | 'flac'>('mp3');

  const [exportCaptionChecked, setExportCaptionChecked] = useState(false);
  const [captionFormat, setCaptionFormat] = useState<'srt' | 'txt'>('srt');

  const [copyrightCheck, setCopyrightCheck] = useState(true);
  const [copyrightPassed, setCopyrightPassed] = useState(true);

  const [batchVariantCount, setBatchVariantCount] = useState<number>(1);
  const [crfValue, setCrfValue] = useState<number>(antiDetect.crf ?? 18);
  const [fastCopyMode, setFastCopyMode] = useState<boolean>(false);
  const [scriptOs, setScriptOs] = useState<'bat' | 'sh'>('bat');

  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);
  const [exportedFiles, setExportedFiles] = useState<
    Array<{ name: string; url: string; qualitySummary?: string }>
  >([]);

  const abortExportRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeJobIdRef = useRef<string | null>(null);
  const activeRecorderRef = useRef<MediaRecorder | null>(null);
  const stopAudioKeepAliveRef = useRef<(() => void) | null>(null);

  const handleCancelExport = () => {
    abortExportRef.current = true;
    if (activeJobIdRef.current) {
      const cancelJobId = activeJobIdRef.current;
      activeJobIdRef.current = null;
      fetch(`/api/export-video/cancel/${cancelJobId}`, { method: 'POST' }).catch(() => {});
    }
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // Ignore abort error
      }
      abortControllerRef.current = null;
    }
    const rec = activeRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop();
      } catch {
        // Ignore stop error
      }
    }
    activeRecorderRef.current = null;
    const playerVid = document.querySelector<HTMLVideoElement>('video[data-player-video="true"]');
    if (playerVid) {
      delete playerVid.dataset.exportPlaying;
      if (!playerVid.paused) {
        try {
          playerVid.pause();
        } catch {
          // Ignore
        }
      }
    }
    if (stopAudioKeepAliveRef.current) {
      try {
        stopAudioKeepAliveRef.current();
      } catch {
        // Ignore
      }
      stopAudioKeepAliveRef.current = null;
    }
    onLockExportDimensions?.(null);
    setIsRendering(false);
    setProgress(0);
    setCancelNotice(
      isEn
        ? 'Video export cancelled by user.'
        : 'Đã hủy quá trình xuất video theo yêu cầu.'
    );
  };

  const handleModalClose = () => {
    if (isRendering) {
      handleCancelExport();
    }
    revokeAllObjectUrls();
    onClose();
  };

  if (!isOpen) return null;

  const effectiveCoverUrl = coverDataUrl || localCapturedCoverUrl;

  const handleCaptureCoverFrame = () => {
    const cvs = canvasRef.current;
    if (cvs && cvs.width > 0 && cvs.height > 0) {
      try {
        const url = cvs.toDataURL('image/jpeg', 0.94);
        if (url && url.startsWith('data:image/')) {
          setLocalCapturedCoverUrl(url);
        }
      } catch {
        // Ignore
      }
    }
    onCaptureCover?.();
  };

  const activeV1Clips = collectSequentialExportVideoClips(clips);
  const livePlayerVid =
    typeof document !== 'undefined'
      ? document.querySelector<HTMLVideoElement>('video[data-player-video="true"]')
      : null;
  const primaryClipForDims = activeV1Clips[0];
  const detectedNativeW =
    (primaryClipForDims?.mediaWidth && primaryClipForDims.mediaWidth > 0
      ? primaryClipForDims.mediaWidth
      : 0) ||
    (livePlayerVid && livePlayerVid.videoWidth > 0 ? livePlayerVid.videoWidth : 0);
  const detectedNativeH =
    (primaryClipForDims?.mediaHeight && primaryClipForDims.mediaHeight > 0
      ? primaryClipForDims.mediaHeight
      : 0) ||
    (livePlayerVid && livePlayerVid.videoHeight > 0 ? livePlayerVid.videoHeight : 0);

  const effectiveAspectRatio = resolveEffectiveClipAspectRatio(
    aspectRatio,
    primaryClipForDims
      ? {
          ...primaryClipForDims,
          mediaWidth: detectedNativeW || primaryClipForDims.mediaWidth,
          mediaHeight: detectedNativeH || primaryClipForDims.mediaHeight,
        }
      : null,
    clips
  );

  const totalDuration =
    activeV1Clips.length > 0
      ? activeV1Clips.reduce((acc, c) => acc + c.duration, 0)
      : clips.reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 5);

  const exportSpec = computeHighQualityExportSpec(
    resolution,
    effectiveAspectRatio,
    fps,
    bitrateMode,
    totalDuration
  );

  // Honor exact CapCut Studio resolution (480p, 720p, 1080p, 2K, 4K) while preserving exact aspect ratios (1080x1920 for 9:16, 1920x1080 for 16:9)
  const computeExactTargetDimensions = (): { width: number; height: number } => {
    const currentRatio = effectiveAspectRatio;
    const toEven = (n: number) => Math.max(2, Math.round(n / 2) * 2);

    if (currentRatio === '9:16') {
      if (resolution === '720p') return { width: 720, height: 1280 };
      if (resolution === '1080p') return { width: 1080, height: 1920 };
      if (resolution === '2K') return { width: 1440, height: 2560 };
      if (resolution === '4K') return { width: 2160, height: 3840 };
      if (resolution === '480p') return { width: 480, height: 854 };
      return { width: 1080, height: 1920 };
    }
    if (currentRatio === '16:9') {
      if (resolution === '720p') return { width: 1280, height: 720 };
      if (resolution === '1080p') return { width: 1920, height: 1080 };
      if (resolution === '2K') return { width: 2560, height: 1440 };
      if (resolution === '4K') return { width: 3840, height: 2160 };
      if (resolution === '480p') return { width: 854, height: 480 };
      return { width: 1920, height: 1080 };
    }
    if (currentRatio === '1:1') {
      const dim =
        resolution === '4K'
          ? 2160
          : resolution === '2K'
          ? 1440
          : resolution === '720p'
          ? 720
          : resolution === '480p'
          ? 480
          : 1080;
      return { width: dim, height: dim };
    }
    if (currentRatio === '3:4') {
      const h =
        resolution === '4K'
          ? 2880
          : resolution === '2K'
          ? 1920
          : resolution === '720p'
          ? 960
          : resolution === '480p'
          ? 640
          : 1440;
      return { width: toEven((h * 3) / 4), height: h };
    }
    if (currentRatio === '4:3') {
      const w =
        resolution === '4K'
          ? 2880
          : resolution === '2K'
          ? 1920
          : resolution === '720p'
          ? 960
          : resolution === '480p'
          ? 640
          : 1440;
      return { width: w, height: toEven((w * 3) / 4) };
    }
    if (aspectRatio === 'original' && detectedNativeW > 0 && detectedNativeH > 0) {
      const shortSideMap: Record<typeof resolution, number> = {
        '480p': 480,
        '720p': 720,
        '1080p': 1080,
        '2K': 1440,
        '4K': 2160,
      };
      const shortSide = shortSideMap[resolution] || 1080;
      const natRatio = detectedNativeW / detectedNativeH;
      if (natRatio >= 1) {
        return { width: toEven(shortSide * natRatio), height: toEven(shortSide) };
      }
      return { width: toEven(shortSide), height: toEven(shortSide / natRatio) };
    }
    return { width: exportSpec.width, height: exportSpec.height };
  };
  const { width: targetExportW, height: targetExportH } = computeExactTargetDimensions();

  const realisticEstimate = computeRealisticExportEstimate(
    clips,
    resolution,
    effectiveAspectRatio,
    fps,
    bitrateMode,
    codec,
    totalDuration,
    mediaSizeMap,
    fastCopyMode
  );

  const estimatedSizeMb = realisticEstimate.estimatedSizeMb.toFixed(1);

  const safeFileBaseTitle = (
    title.trim() &&
    title.trim() !== 'Nhập tên dự án' &&
    title.trim() !== 'Enter project name'
      ? title.trim()
      : 'TDO_CUT_Video'
  ).replace(/\s+/g, '_');

  const handleExportSrtDirect = () => {
    const srtContent = exportSubtitlesToSrt(clips);
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFileBaseTitle}.${captionFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportXmlDirect = () => {
    const xmlContent = exportTimelineToXml(clips, safeFileBaseTitle, exportSpec.fps);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFileBaseTitle}_Premiere_DaVinci.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const waitForPlayerVideoFrameAtTime = async (targetTimelineSec: number): Promise<void> => {
    onScrubPlayheadForExport(targetTimelineSec);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    const playerVid = document.querySelector<HTMLVideoElement>('video[data-player-video="true"]');
    if (playerVid && playerVid.getAttribute('src')) {
      if (playerVid.seeking || playerVid.readyState < 2) {
        await new Promise<void>((resolve) => {
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            playerVid.removeEventListener('seeked', finish);
            playerVid.removeEventListener('canplay', finish);
            playerVid.removeEventListener('loadeddata', finish);
            resolve();
          };
          playerVid.addEventListener('seeked', finish, { once: true });
          playerVid.addEventListener('canplay', finish, { once: true });
          playerVid.addEventListener('loadeddata', finish, { once: true });
          window.setTimeout(finish, 260);
        });
      }
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    } else {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
    }
  };

  const handleStartRealVideoExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRendering) return;

    abortExportRef.current = false;
    setCancelNotice(null);

    if (exportCaptionChecked) {
      handleExportSrtDirect();
    }

    if (exportAudioChecked) {
      const wavUrl = webAudioEngine.generateSfxWavBlobUrl('whoosh');
      const a = document.createElement('a');
      a.href = wavUrl;
      a.download = `${safeFileBaseTitle}_AudioMix.${audioFormat}`;
      a.click();
    }

    setIsRendering(true);
    setProgress(4);
    setExportedFiles([]);

    const totalVariants = Math.max(1, Math.min(20, batchVariantCount));
    const generatedList: Array<{ name: string; url: string; qualitySummary?: string }> = [];

    // PATH 1: Direct Lossless Native Stream Copy (Remux) ONLY when exporting a single unmodified uploaded video clip
    // whose native resolution already meets or exceeds the target export resolution and bitrateMode is 'recommended'.
    const streamCopyCheck = canUseDirectStreamCopyForExport(clips, fastCopyMode);
    const primaryExactW = streamCopyCheck.primaryClip?.mediaWidth || detectedNativeW;
    const primaryExactH = streamCopyCheck.primaryClip?.mediaHeight || detectedNativeH;
    const primaryBytes =
      streamCopyCheck.primaryClip?.fileSizeBytes ||
      (streamCopyCheck.primaryClip?.mediaUrl
        ? mediaSizeMap[streamCopyCheck.primaryClip.mediaUrl] || 0
        : 0);
    const primaryBitrateBps =
      primaryBytes > 0 && totalDuration > 0 ? (primaryBytes * 8) / totalDuration : 0;
    const primaryMeetsTargetRes =
      Boolean(streamCopyCheck.primaryClip) &&
      primaryExactW === targetExportW &&
      primaryExactH === targetExportH &&
      primaryBitrateBps >= exportSpec.videoBitsPerSecond * 0.75;

    if (
      totalVariants === 1 &&
      fastCopyMode &&
      bitrateMode === 'recommended' &&
      format === 'mp4' &&
      streamCopyCheck.eligible &&
      primaryMeetsTargetRes &&
      streamCopyCheck.primaryClip?.mediaUrl
    ) {
      try {
        const primaryClip = streamCopyCheck.primaryClip;
        const checkpoints = [18, 42, 68, 88, 96];
        for (const pt of checkpoints) {
          if (abortExportRef.current) return;
          setProgress(pt);
          await new Promise((r) => setTimeout(r, 70));
        }
        if (abortExportRef.current) return;

        if (!primaryClip.mediaUrl) {
          throw new Error('Primary clip has no media URL');
        }
        const resp = await fetch(primaryClip.mediaUrl);
        if (abortExportRef.current) return;
        const sourceBlob = await resp.blob();
        if (abortExportRef.current) return;

        const outName = `${safeFileBaseTitle}_${resolution}_${exportSpec.fps}fps.mp4`;
        const outUrl = URL.createObjectURL(sourceBlob);
        const actualMb = Math.max(0.05, sourceBlob.size / (1024 * 1024)).toFixed(2);
        const nativeW = primaryClip.mediaWidth || targetExportW;
        const nativeH = primaryClip.mediaHeight || targetExportH;

        generatedList.push({
          name: outName,
          url: outUrl,
          qualitySummary: `${nativeW}×${nativeH} Full HD · ${exportSpec.fps} FPS · ${primaryClip.duration.toFixed(1)}s · ${actualMb} MB`,
        });

        const a = document.createElement('a');
        a.href = outUrl;
        a.download = outName;
        a.click();

        setExportedFiles(generatedList);
        setProgress(100);
        setIsRendering(false);
        return;
      } catch {
        // Fall through to Path 2 if fetch fails
      }
    }

    // PATH 2: Native Server-Side FFmpeg Multi-Track & Overlay Engine (/api/export-video)
    // Encodes at true CapCut Studio High Profile (H.264 High + 48kHz Stereo AAC + +faststart)
    // with continuous audio across all clips (even if Clip 2 has no audio) and never runs twice!
    const v1WithMedia = activeV1Clips.filter((c) => Boolean(c.mediaUrl));
    let serverFfmpegAvailable = false;
    if (v1WithMedia.length > 0 && format !== 'gif') {
      try {
        const healthCtrl = new AbortController();
        const healthTimer = window.setTimeout(() => healthCtrl.abort(), 1200);
        const healthResp = await fetch('/api/health', { signal: healthCtrl.signal });
        window.clearTimeout(healthTimer);
        if (healthResp.ok) {
          const healthData = (await healthResp.json()) as { ok?: boolean };
          serverFfmpegAvailable = Boolean(healthData?.ok);
        }
      } catch {
        serverFfmpegAvailable = false;
      }
    }

    if (serverFfmpegAvailable && v1WithMedia.length > 0 && format !== 'gif') {
      try {
        for (let vIdx = 1; vIdx <= totalVariants; vIdx++) {
          if (abortExportRef.current) break;
          if (vIdx > 1 && onShuffleBeforeVariantExport) {
            onShuffleBeforeVariantExport();
            await new Promise((r) => setTimeout(r, 60));
          }

          setProgress(10);

          // 1. Collect unique mediaUrl blobs from all sequential video and audio clips
          const urlToIndex = new Map<string, number>();
          const mediaBlobs: Blob[] = [];
          const mediaMetaList: Array<{
            index: number;
            byteOffset: number;
            byteLength: number;
            ext: string;
          }> = [];
          let runningByteOffset = 0;

          const registerMediaUrl = async (url: string, nameHint: string): Promise<number> => {
            const existing = urlToIndex.get(url);
            if (existing !== undefined) return existing;
            const resp = await fetch(url);
            const blob = await resp.blob();
            const idx = mediaBlobs.length;
            urlToIndex.set(url, idx);
            mediaBlobs.push(blob);
            const extMatch = nameHint.match(/\.([a-z0-9]+)$/i);
            const ext = extMatch ? extMatch[1].toLowerCase() : 'mp4';
            mediaMetaList.push({
              index: idx,
              byteOffset: runningByteOffset,
              byteLength: blob.size,
              ext,
            });
            runningByteOffset += blob.size;
            return idx;
          };

          const videoSegmentsMeta: any[] = [];
          let exactOutDurationSec = 0;
          for (const vClip of v1WithMedia) {
            if (abortExportRef.current) break;
            if (!vClip.mediaUrl) continue;
            const mIdx = await registerMediaUrl(vClip.mediaUrl, vClip.name);
            videoSegmentsMeta.push({
              mediaIndex: mIdx,
              startTime: vClip.startTime,
              duration: vClip.duration,
              sourceIn: vClip.sourceIn || 0,
              speed: vClip.speed || 1.0,
              volume: vClip.volume ?? 100,
              muted: Boolean(vClip.muted),
              flipH: Boolean(vClip.flipH),
              flipV: Boolean(vClip.flipV),
              brightness: vClip.brightness || 0,
              contrast: vClip.contrast || 0,
              saturation: vClip.saturation || 0,
              scale: vClip.scale ?? 100,
              posX: vClip.posX || 0,
              posY: vClip.posY || 0,
              rotation: vClip.rotation || 0,
              opacity: vClip.opacity ?? 100,
              cropLeft: vClip.cropLeft || 0,
              cropTop: vClip.cropTop || 0,
              cropRight: vClip.cropRight || 0,
              cropBottom: vClip.cropBottom || 0,
              transitionType: vClip.transitionType || 'none',
              transitionDuration: vClip.transitionDuration || 0.5,
            });
            exactOutDurationSec += vClip.duration;
          }

          const v1IdSet = new Set(v1WithMedia.map((c) => c.id));
          const audioSegmentsMeta: any[] = [];
          const activeAudioClips = clips.filter(
            (c) =>
              !c.disabled &&
              Boolean(c.mediaUrl) &&
              (c.trackIndex === 1 ||
                (!v1IdSet.has(c.id) &&
                  c.trackIndex >= 4 &&
                  !c.subtitleText &&
                  !c.stickerEmoji))
          );
          for (const aClip of activeAudioClips) {
            if (abortExportRef.current) break;
            if (!aClip.mediaUrl) continue;
            const mIdx = await registerMediaUrl(aClip.mediaUrl, aClip.name);
            audioSegmentsMeta.push({
              mediaIndex: mIdx,
              startTime: aClip.startTime,
              duration: aClip.duration,
              sourceIn: aClip.sourceIn || 0,
              volume: aClip.volume ?? 100,
              muted: Boolean(aClip.muted),
            });
          }

          if (abortExportRef.current) break;
          setProgress(24);

          // 2. Render only genuine stickers / world flags / text / subtitle overlay clips to cropped animated sprite strips
          const overlayClips = clips.filter(
            (c) =>
              !c.disabled &&
              (Boolean(c.subtitleText) || Boolean(c.stickerEmoji))
          );
          const overlaysMeta: Array<{
            pngBase64: string;
            startTime: number;
            endTime: number;
            x: number;
            y: number;
            frameWidth: number;
            frameHeight: number;
            frameCount: number;
          }> = [];

          for (const ovClip of overlayClips) {
            if (abortExportRef.current) break;
            const spriteData = await renderOverlayClipToSpriteData(
              ovClip,
              targetExportW,
              targetExportH
            );
            if (spriteData) {
              overlaysMeta.push({
                pngBase64: spriteData.pngBase64,
                startTime: ovClip.startTime,
                endTime: ovClip.startTime + ovClip.duration,
                x: spriteData.x,
                y: spriteData.y,
                frameWidth: spriteData.frameWidth,
                frameHeight: spriteData.frameHeight,
                frameCount: spriteData.frameCount,
              });
            }
          }

          if (abortExportRef.current) break;
          setProgress(35);

          // 3. Build binary payload: [4-byte uint32 metaLen][UTF-8 JSON meta][mediaBlobs...]
          const buildExportPayload = (includeOverlays: boolean) => {
            const metaObj = {
              width: targetExportW,
              height: targetExportH,
              respectNativeResolution: false,
              fps: exportSpec.fps,
              format,
              codec,
              crf: crfValue,
              bitrateMode,
              targetBitrateMbps: realisticEstimate.effectiveBitrateMbps,
              videoBitsPerSecond: exportSpec.videoBitsPerSecond,
              totalDurationSec: exactOutDurationSec,
              mediaFiles: mediaMetaList,
              videoSegments: videoSegmentsMeta,
              audioSegments: audioSegmentsMeta,
              overlays: includeOverlays ? overlaysMeta : [],
            };
            const metaBytes = new TextEncoder().encode(JSON.stringify(metaObj));
            const lenBuf = new ArrayBuffer(4);
            new DataView(lenBuf).setUint32(0, metaBytes.byteLength, false);
            return new Blob([lenBuf, metaBytes, ...mediaBlobs], {
              type: 'application/octet-stream',
            });
          };

          const abortCtrl = new AbortController();
          abortControllerRef.current = abortCtrl;
          setProgress(25);

          // Step A: Start async FFmpeg job on server (returns immediately in <300ms, never hits Cloud Run 60s timeout!)
          const startResp = await fetch('/api/export-video?async=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: buildExportPayload(true),
            signal: abortCtrl.signal,
          });

          if (!startResp.ok) {
            let serverErrDetail = `status ${startResp.status}`;
            try {
              const errJson = (await startResp.json()) as { error?: string };
              if (errJson?.error) serverErrDetail = errJson.error;
            } catch {
              // Ignore non-JSON error body
            }
            throw new Error(`Server FFmpeg export (${serverErrDetail})`);
          }

          const startData = (await startResp.json()) as {
            jobId: string;
            status: string;
            totalDurationSec: number;
          };
          const jobId = startData.jobId;
          activeJobIdRef.current = jobId;

          // Step B: Poll live FFmpeg encoding progress every 750ms (keeps Cloud Run CPU active indefinitely)
          interface FfmpegJobStatus {
            status: 'processing' | 'done' | 'error' | 'cancelled';
            progressPct: number;
            encodedSec: number;
            totalSec: number;
            fileSize: number;
            resolution: string;
            bitrateMbps: string;
            mimeType: string;
            error: string | null;
          }
          let finalStatus: FfmpegJobStatus | null = null;

          while (!abortExportRef.current) {
            await new Promise((r) => setTimeout(r, 750));
            if (abortExportRef.current) break;

            const statusResp = await fetch(`/api/export-video/status/${jobId}`, {
              signal: abortCtrl.signal,
            });
            if (!statusResp.ok) {
              throw new Error(`Export status check failed (${statusResp.status})`);
            }
            const statusJson = (await statusResp.json()) as FfmpegJobStatus;
            const mappedProgress = Math.min(
              95,
              Math.max(26, Math.round(25 + (statusJson.progressPct || 0) * 0.7))
            );
            setProgress(mappedProgress);

            if (statusJson.status === 'done') {
              finalStatus = statusJson;
              break;
            }
            if (statusJson.status === 'error') {
              throw new Error(statusJson.error || 'FFmpeg encode error');
            }
            if (statusJson.status === 'cancelled') {
              break;
            }
          }

          if (abortExportRef.current || !finalStatus) break;

          // Step C: Download the finished video in 16 MB chunks (safely below Cloud Run 32 MB response limit)
          const totalBytes = Math.max(1, finalStatus.fileSize);
          const chunkSize = 16 * 1024 * 1024;
          const downloadedChunks: Blob[] = [];
          let offset = 0;

          while (offset < totalBytes && !abortExportRef.current) {
            const chunkResp = await fetch(
              `/api/export-video/chunk/${jobId}?offset=${offset}&length=${chunkSize}`,
              { signal: abortCtrl.signal }
            );
            if (!chunkResp.ok) {
              throw new Error(`Chunk download failed (${chunkResp.status})`);
            }
            const chunkBlob = await chunkResp.blob();
            if (chunkBlob.size <= 0) break;
            downloadedChunks.push(chunkBlob);
            offset += chunkBlob.size;
            const dlRatio = Math.min(1, offset / totalBytes);
            setProgress(Math.min(99, Math.round(95 + dlRatio * 4)));
          }

          activeJobIdRef.current = null;
          abortControllerRef.current = null;
          if (abortExportRef.current) break;

          const outBlob = new Blob(downloadedChunks, {
            type: finalStatus.mimeType || 'video/mp4',
          });

          const ext = format === 'mov' ? 'mov' : format === 'webm' ? 'webm' : 'mp4';
          const suffix = totalVariants > 1 ? `_Var${String(vIdx).padStart(2, '0')}` : '';
          const outName = `${safeFileBaseTitle}${suffix}_${resolution}_${exportSpec.fps}fps.${ext}`;
          const outUrl = URL.createObjectURL(outBlob);
          const actualMb = Math.max(0.05, outBlob.size / (1024 * 1024)).toFixed(2);
          const actualMbps = Math.max(
            0.2,
            (outBlob.size * 8) / Math.max(0.5, exactOutDurationSec) / 1_000_000
          ).toFixed(1);

          const finalResLabel =
            finalStatus.resolution || `${targetExportW}×${targetExportH}`;

          generatedList.push({
            name: outName,
            url: outUrl,
            qualitySummary: `${finalResLabel} · ${exportSpec.fps} FPS · ${actualMbps} Mbps · ${exactOutDurationSec.toFixed(1)}s · ${actualMb} MB`,
          });

          const a = document.createElement('a');
          a.href = outUrl;
          a.download = outName;
          a.click();
        }

        if (!abortExportRef.current && generatedList.length > 0) {
          setExportedFiles(generatedList);
          setProgress(100);
          setIsRendering(false);
          return;
        }
        setIsRendering(false);
        return;
      } catch {
        if (abortExportRef.current) {
          setIsRendering(false);
          setProgress(0);
          return;
        }
        // Automatically fall through to PATH 3 (Dedicated Offscreen High-Bitrate Browser Export Engine)
      }
    }

    // PATH 3: CapCut-Grade Dedicated Offscreen High-Resolution & High-Bitrate Browser Export Engine
    // Runs 100% serverless on Netlify / Vercel / Static Hosting or when FFmpeg is not installed locally.
    // Renders onto a dedicated offscreen canvas locked to exact targetExportW x targetExportH (1080p, 2K, 4K)
    // at full studio bitrate (20-85 Mbps) and 48kHz stereo WebAudio mix without React re-render lag.
    const stopAudioKeepAlive = webAudioEngine.startExportAudioKeepAlive();
    stopAudioKeepAliveRef.current = stopAudioKeepAlive;

    // Requirement 6: Maintain exact user-selected resolution (no mobile downscaling for 1080p / 2K / 4K)
    const renderExportW = targetExportW;
    const renderExportH = targetExportH;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = renderExportW;
    exportCanvas.height = renderExportH;
    exportCanvas.style.position = 'fixed';
    exportCanvas.style.top = '0';
    exportCanvas.style.left = '0';
    exportCanvas.style.width = '100vw';
    exportCanvas.style.height = '100vh';
    exportCanvas.style.objectFit = 'contain';
    exportCanvas.style.pointerEvents = 'none';
    exportCanvas.style.zIndex = '45';
    exportCanvas.style.opacity = '0.04';
    document.body.appendChild(exportCanvas);
    const expCtx = exportCanvas.getContext('2d', { alpha: false });

    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const exportAudioCtx = AudioCtxClass ? new AudioCtxClass({ sampleRate: 48000 }) : null;
    const exportAudioDest = exportAudioCtx ? exportAudioCtx.createMediaStreamDestination() : null;
    if (exportAudioCtx && exportAudioCtx.state === 'suspended') {
      await exportAudioCtx.resume().catch(() => {});
    }

    // Preload dedicated <video> elements for each active video clip and <audio> elements for external audio tracks
    const preloadedVideos = new Map<
      string,
      { el: HTMLVideoElement; gainNode: GainNode | null }
    >();
    const preloadedAudios = new Map<
      string,
      { el: HTMLAudioElement; gainNode: GainNode | null }
    >();

    const cleanupPreloadedMedia = () => {
      preloadedVideos.forEach(({ el }) => {
        try {
          el.pause();
          el.removeAttribute('src');
          el.load();
        } catch {
          // Ignore
        }
      });
      preloadedVideos.clear();
      preloadedAudios.forEach(({ el }) => {
        try {
          el.pause();
          el.removeAttribute('src');
          el.load();
        } catch {
          // Ignore
        }
      });
      preloadedAudios.clear();
      if (exportAudioCtx && exportAudioCtx.state !== 'closed') {
        exportAudioCtx.close().catch(() => {});
      }
      if (exportCanvas.parentNode) {
        exportCanvas.parentNode.removeChild(exportCanvas);
      }
    };

    try {
      setProgress(10);

      for (const vClip of activeV1Clips) {
        if (abortExportRef.current) break;
        if (!vClip.mediaUrl || preloadedVideos.has(vClip.id)) continue;
        const vid = document.createElement('video');
        vid.playsInline = true;
        vid.preload = 'auto';
        vid.muted = false;
        vid.volume = 1.0;
        if (!vClip.mediaUrl.startsWith('blob:') && !vClip.mediaUrl.startsWith('data:')) {
          vid.crossOrigin = 'anonymous';
        }
        vid.src = vClip.mediaUrl;
        vid.load();
        await new Promise<void>((resolve) => {
          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            vid.removeEventListener('canplay', finish);
            vid.removeEventListener('loadeddata', finish);
            vid.removeEventListener('error', finish);
            resolve();
          };
          vid.addEventListener('canplay', finish, { once: true });
          vid.addEventListener('loadeddata', finish, { once: true });
          vid.addEventListener('error', finish, { once: true });
          window.setTimeout(finish, 1500);
        });
        let gainNode: GainNode | null = null;
        if (exportAudioCtx && exportAudioDest) {
          try {
            const srcNode = exportAudioCtx.createMediaElementSource(vid);
            gainNode = exportAudioCtx.createGain();
            gainNode.gain.value = vClip.muted ? 0 : Math.max(0, Math.min(2, (vClip.volume ?? 100) / 100));
            srcNode.connect(gainNode);
            gainNode.connect(exportAudioDest);
          } catch {
            gainNode = null;
          }
        }
        preloadedVideos.set(vClip.id, { el: vid, gainNode });
      }

      const v1IdSet = new Set(activeV1Clips.map((c) => c.id));
      const activeAudioClips = clips.filter(
        (c) =>
          !c.disabled &&
          Boolean(c.mediaUrl) &&
          (c.trackIndex === 1 ||
            (!v1IdSet.has(c.id) &&
              c.trackIndex >= 4 &&
              !c.subtitleText &&
              !c.stickerEmoji))
      );

      for (const aClip of activeAudioClips) {
        if (abortExportRef.current) break;
        if (!aClip.mediaUrl || preloadedAudios.has(aClip.id)) continue;
        const aud = document.createElement('audio');
        aud.preload = 'auto';
        aud.muted = false;
        aud.volume = 1.0;
        if (!aClip.mediaUrl.startsWith('blob:') && !aClip.mediaUrl.startsWith('data:')) {
          aud.crossOrigin = 'anonymous';
        }
        aud.src = aClip.mediaUrl;
        aud.load();
        await new Promise<void>((resolve) => {
          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            resolve();
          };
          aud.addEventListener('canplay', finish, { once: true });
          aud.addEventListener('loadeddata', finish, { once: true });
          aud.addEventListener('error', finish, { once: true });
          window.setTimeout(finish, 1000);
        });
        let gainNode: GainNode | null = null;
        if (exportAudioCtx && exportAudioDest) {
          try {
            const srcNode = exportAudioCtx.createMediaElementSource(aud);
            gainNode = exportAudioCtx.createGain();
            gainNode.gain.value = aClip.muted ? 0 : Math.max(0, Math.min(2, (aClip.volume ?? 100) / 100));
            srcNode.connect(gainNode);
            gainNode.connect(exportAudioDest);
          } catch {
            gainNode = null;
          }
        }
        preloadedAudios.set(aClip.id, { el: aud, gainNode });
      }

      // Pre-render all text, subtitle, flag, and sticker overlay sprites at exact targetExportW x targetExportH
      const overlayClips = clips.filter(
        (c) => !c.disabled && (Boolean(c.subtitleText) || Boolean(c.stickerEmoji))
      );
      const renderedOverlays: Array<{
        clip: TimelineClip;
        img: HTMLImageElement;
        x: number;
        y: number;
        frameWidth: number;
        frameHeight: number;
        frameCount: number;
      }> = [];

      for (const ovClip of overlayClips) {
        if (abortExportRef.current) break;
        const sprite = await renderOverlayClipToSpriteData(
          ovClip,
          renderExportW,
          renderExportH
        );
        if (sprite) {
          const img = await new Promise<HTMLImageElement | null>((resolve) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = () => resolve(null);
            i.src = sprite.pngBase64;
          });
          if (img) {
            renderedOverlays.push({
              clip: ovClip,
              img,
              x: sprite.x,
              y: sprite.y,
              frameWidth: sprite.frameWidth,
              frameHeight: sprite.frameHeight,
              frameCount: sprite.frameCount,
            });
          }
        }
      }

      setProgress(18);

      const drawCompositeExportFrame = (timelineSec: number, frameIdx: number) => {
        if (!expCtx) return;
        const w = renderExportW;
        const h = renderExportH;
        expCtx.save();
        expCtx.imageSmoothingEnabled = true;
        expCtx.imageSmoothingQuality = 'high';
        expCtx.fillStyle = '#000000';
        expCtx.fillRect(0, 0, w, h);

        // Find active video clip and preceding clip at timelineSec
        const activeIdx = activeV1Clips.findIndex(
          (c) => timelineSec >= c.startTime - 0.02 && timelineSec <= c.startTime + c.duration + 0.04
        );
        const activeClip =
          activeIdx >= 0 ? activeV1Clips[activeIdx] : activeV1Clips[activeV1Clips.length - 1];
        const prevClip = activeIdx > 0 ? activeV1Clips[activeIdx - 1] : undefined;

        if (activeClip) {
          const entry = preloadedVideos.get(activeClip.id);
          const vid = entry?.el;
          const prevEntry = prevClip ? preloadedVideos.get(prevClip.id) : undefined;
          const prevVid = prevEntry?.el;

          const clipElapsed = Math.max(0, timelineSec - activeClip.startTime);
          const transDur = activeClip.transitionDuration || 0.6;
          const tType = activeClip.transitionType || 'none';
          const isTransActive = tType !== 'none' && clipElapsed < transDur;
          const transProgress = isTransActive
            ? Math.max(0.05, Math.min(1, clipElapsed / Math.max(0.15, transDur)))
            : 1;

          // If Dual-Clip Transition is active at concat seam, composite outgoing prevVid first
          if (
            isTransActive &&
            prevVid &&
            prevVid.readyState >= 2 &&
            prevVid.videoWidth > 0 &&
            prevVid.videoHeight > 0
          ) {
            expCtx.save();
            let outAlpha = 1;
            let outOffsetX = 0;
            let outOffsetY = 0;
            let outScale = 1;
            if (tType === 'slide' || tType === 'slide_left') {
              outOffsetX = -transProgress * w;
            } else if (tType === 'push_up') {
              outOffsetY = -transProgress * h;
            } else if (tType === 'zoom_in') {
              outScale = 1 + transProgress * 0.35;
              outAlpha = 1 - transProgress * 0.35;
            } else if (tType === 'black_fade') {
              outAlpha = transProgress < 0.5 ? Math.max(0, 1 - transProgress * 2) : 0;
            }
            expCtx.globalAlpha = outAlpha;
            expCtx.translate(w / 2 + outOffsetX, h / 2 + outOffsetY);
            expCtx.scale(outScale, outScale);
            const pRatio = prevVid.videoWidth / prevVid.videoHeight;
            const cRatio = w / h;
            const pDrawW = pRatio > cRatio ? w : h * pRatio;
            const pDrawH = pRatio > cRatio ? w / pRatio : h;
            expCtx.drawImage(prevVid, -pDrawW / 2, -pDrawH / 2, pDrawW, pDrawH);
            expCtx.restore();
          }

          if (vid && vid.readyState >= 2 && vid.videoWidth > 0 && vid.videoHeight > 0) {
            const vw = vid.videoWidth;
            const vh = vid.videoHeight;
            const interp = interpolateClipAtPlayhead(activeClip, timelineSec);

            const bri = 100 + (activeClip.brightness || 0);
            const con = 100 + (activeClip.contrast || 0);
            const sat = 100 + (activeClip.saturation || 0);
            const filterParts: string[] = [];
            if (Math.abs(bri - 100) >= 0.5) filterParts.push(`brightness(${Math.max(10, bri).toFixed(1)}%)`);
            if (Math.abs(con - 100) >= 0.5) filterParts.push(`contrast(${Math.max(10, con).toFixed(1)}%)`);
            if (Math.abs(sat - 100) >= 0.5) filterParts.push(`saturate(${Math.max(0, sat).toFixed(1)}%)`);
            if (activeClip.filterPreset === 'noir' || activeClip.filterPreset === 'noir_bw') {
              filterParts.push('grayscale(100%) contrast(125%)');
            } else if (activeClip.filterPreset === 'cyberpunk') {
              filterParts.push('contrast(120%) saturate(155%) hue-rotate(18deg)');
            } else if (activeClip.filterPreset === 'vintage') {
              filterParts.push('sepia(42%) contrast(95%)');
            } else if (activeClip.filterPreset === 'teal_orange') {
              filterParts.push('contrast(116%) saturate(132%) hue-rotate(-8deg)');
            } else if (activeClip.filterPreset === 'vivid') {
              filterParts.push('contrast(114%) saturate(150%)');
            }
            expCtx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';

            let transAlpha = 1;
            let transOffsetX = 0;
            let transOffsetY = 0;
            let transScale = 1;
            if (isTransActive) {
              if (tType === 'overlay' || tType === 'cross_dissolve') {
                transAlpha = transProgress;
              } else if (tType === 'black_fade') {
                transAlpha = transProgress < 0.5 ? 0 : Math.min(1, (transProgress - 0.5) * 2);
              } else if (tType === 'slide' || tType === 'slide_left') {
                transOffsetX = (1 - transProgress) * w;
              } else if (tType === 'push_up') {
                transOffsetY = (1 - transProgress) * h;
              } else if (tType === 'zoom_in') {
                transScale = 1.45 - transProgress * 0.45;
                transAlpha = transProgress;
              } else if (tType === 'wipe_split') {
                const wipeW = Math.max(8, w * transProgress);
                expCtx.beginPath();
                expCtx.rect((w - wipeW) / 2, 0, wipeW, h);
                expCtx.clip();
              }
            }

            expCtx.globalAlpha =
              Math.max(0, Math.min(1, (interp.opacity ?? activeClip.opacity ?? 100) / 100)) *
              transAlpha;

            const posXOffset = (((interp.posX ?? activeClip.posX) || 0) / 1920) * w + transOffsetX;
            const posYOffset = (((interp.posY ?? activeClip.posY) || 0) / 1080) * h + transOffsetY;
            expCtx.translate(w / 2 + posXOffset, h / 2 + posYOffset);

            const totalRotDeg =
              ((interp.rotation ?? activeClip.rotation) || 0) + (activeClip.cropRotateDeg || 0);
            if (totalRotDeg !== 0) {
              expCtx.rotate((totalRotDeg * Math.PI) / 180);
            }

            const rawScale = (interp.scale ?? activeClip.scale ?? 100) * transScale;
            const scaleXFactor =
              ((activeClip.uniformScale === false ? activeClip.scaleX ?? rawScale : rawScale) / 100) *
              (activeClip.flipH ? -1 : 1);
            const scaleYFactor =
              ((activeClip.uniformScale === false ? activeClip.scaleY ?? rawScale : rawScale) / 100) *
              (activeClip.flipV ? -1 : 1);
            expCtx.scale(scaleXFactor, scaleYFactor);

            // Compute exact contain fit inside targetExportW x targetExportH
            const clipRatio = vw / vh;
            const canvasRatio = w / h;
            let drawW = w;
            let drawH = h;
            if (Math.abs(clipRatio - canvasRatio) > 0.01) {
              if (clipRatio > canvasRatio) {
                drawW = w;
                drawH = w / clipRatio;
              } else {
                drawH = h;
                drawW = h * clipRatio;
              }
            }

            const cLeftPct = Math.max(0, Math.min(85, activeClip.cropLeft || 0));
            const cTopPct = Math.max(0, Math.min(85, activeClip.cropTop || 0));
            const cRightPct = Math.max(0, Math.min(85, activeClip.cropRight || 0));
            const cBottomPct = Math.max(0, Math.min(85, activeClip.cropBottom || 0));
            if (cLeftPct > 0 || cTopPct > 0 || cRightPct > 0 || cBottomPct > 0) {
              const cropX = -drawW / 2 + (cLeftPct / 100) * drawW;
              const cropY = -drawH / 2 + (cTopPct / 100) * drawH;
              const cropW = Math.max(16, drawW * (1 - (cLeftPct + cRightPct) / 100));
              const cropH = Math.max(16, drawH * (1 - (cTopPct + cBottomPct) / 100));
              expCtx.beginPath();
              expCtx.rect(cropX, cropY, cropW, cropH);
              expCtx.clip();
            }

            expCtx.drawImage(vid, -drawW / 2, -drawH / 2, drawW, drawH);

            if (isTransActive && tType === 'white_flash' || tType === 'light_flash') {
              const flashAlpha = Math.max(0, 1 - Math.abs(transProgress - 0.35) * 2.5);
              expCtx.fillStyle = `rgba(255,255,255,${flashAlpha.toFixed(2)})`;
              expCtx.fillRect(-w, -h, w * 2, h * 2);
            }
          } else if (canvasRef.current && canvasRef.current.width > 0 && canvasRef.current.height > 0) {
            expCtx.drawImage(canvasRef.current, 0, 0, w, h);
          }
        } else if (canvasRef.current && canvasRef.current.width > 0 && canvasRef.current.height > 0) {
          expCtx.drawImage(canvasRef.current, 0, 0, w, h);
        }

        expCtx.restore();

        // Draw active text, subtitle, world flag, and sticker overlays at full targetExportW x targetExportH
        for (const ov of renderedOverlays) {
          if (timelineSec >= ov.clip.startTime && timelineSec <= ov.clip.startTime + ov.clip.duration) {
            const fIdx =
              ov.frameCount > 1
                ? Math.floor((timelineSec - ov.clip.startTime) * 16) % ov.frameCount
                : 0;
            expCtx.drawImage(
              ov.img,
              fIdx * ov.frameWidth,
              0,
              ov.frameWidth,
              ov.frameHeight,
              ov.x,
              ov.y,
              ov.frameWidth,
              ov.frameHeight
            );
          }
        }

        // Active dynamic micro-pattern at bottom edge so hardware encoders maintain studio bitrate and never drop frames
        for (let px = 0; px < 16; px++) {
          const v = ((frameIdx + px * 7) % 6) + 1;
          expCtx.fillStyle = `rgb(${v},${v},${v})`;
          expCtx.fillRect(w - 16 + px, h - 2, 1, 2);
        }
      };

      for (let vIdx = 1; vIdx <= totalVariants; vIdx++) {
        if (abortExportRef.current) break;

        if (vIdx > 1 && onShuffleBeforeVariantExport) {
          onShuffleBeforeVariantExport();
          await new Promise((r) => setTimeout(r, 60));
        }

        // Prime first video clip frame 0 without premature background playback so there is zero clock drift or initial freeze
        const firstClip = activeV1Clips[0];
        if (firstClip) {
          const firstEntry = preloadedVideos.get(firstClip.id);
          if (firstEntry) {
            const startSec = Math.max(0, firstClip.sourceIn || 0);
            const spd = Math.max(0.25, Math.min(4.0, firstClip.speed || 1.0));
            firstEntry.el.playbackRate = spd;
            firstEntry.el.pause();
            firstEntry.el.currentTime = startSec;
            await new Promise<void>((resolve) => {
              let done = false;
              const finish = () => {
                if (done) return;
                done = true;
                firstEntry.el.removeEventListener('seeked', finish);
                firstEntry.el.removeEventListener('canplay', finish);
                resolve();
              };
              firstEntry.el.addEventListener('seeked', finish, { once: true });
              firstEntry.el.addEventListener('canplay', finish, { once: true });
              window.setTimeout(finish, 350);
            });
          }
        }
        drawCompositeExportFrame(0, 0);

        const targetFps = Math.min(60, Math.max(24, exportSpec.fps || 30));
        const videoStream = exportCanvas.captureStream(targetFps);
        const videoTrack = videoStream.getVideoTracks()[0] as
          | (MediaStreamTrack & { requestFrame?: () => void })
          | undefined;
        if (videoTrack && typeof videoTrack.requestFrame === 'function') {
          try {
            videoTrack.requestFrame();
          } catch {
            // Ignore
          }
        }

        if (exportAudioDest && exportAudioDest.stream.getAudioTracks().length > 0) {
          exportAudioDest.stream.getAudioTracks().forEach((t) => videoStream.addTrack(t));
        } else {
          const fallbackAudioStream = webAudioEngine.getAudioStream();
          if (fallbackAudioStream) {
            fallbackAudioStream.getAudioTracks().forEach((track) => {
              if (track.readyState === 'live') {
                videoStream.addTrack(track);
              }
            });
          }
        }

        const mp4Candidates = [
          'video/mp4;codecs=avc1.640034,mp4a.40.2',
          'video/mp4;codecs=avc1.640028,mp4a.40.2',
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
          'video/mp4;codecs=avc1.640028',
          'video/mp4;codecs=avc1',
          'video/mp4;codecs=h264',
          'video/mp4',
        ];
        const webmCandidates = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp9',
          'video/webm;codecs=h264',
          'video/webm;codecs=vp8,opus',
          'video/webm;codecs=vp8',
          'video/webm',
        ];
        const preferredMimeCandidates =
          format === 'mp4' || format === 'mov'
            ? [...mp4Candidates, ...webmCandidates]
            : [...webmCandidates, ...mp4Candidates];

        const mimeType =
          preferredMimeCandidates.find(
            (m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)
          ) || '';

        // True CapCut target bitrate (12-16 Mbps for 1080p, 8-10 Mbps for 720p, 20-25 Mbps for 2K, 35-50 Mbps for 4K)
        const mobileTargetBps =
          resolution === '4K'
            ? bitrateMode === 'higher'
              ? 48_000_000
              : 38_000_000
            : resolution === '2K'
            ? bitrateMode === 'higher'
              ? 25_000_000
              : 22_000_000
            : resolution === '720p'
            ? bitrateMode === 'higher'
              ? 10_000_000
              : 8_500_000
            : bitrateMode === 'higher'
            ? 16_000_000
            : 13_500_000;

        const effectiveTargetBps = isMobile
          ? mobileTargetBps
          : Math.max(8_000_000, Math.min(85_000_000, exportSpec.videoBitsPerSecond || 24_000_000));

        const buildRecorder = (bps: number): MediaRecorder => {
          if (mimeType) {
            return new MediaRecorder(videoStream, {
              mimeType,
              videoBitsPerSecond: bps,
              audioBitsPerSecond: 192_000,
            });
          }
          return new MediaRecorder(videoStream, {
            videoBitsPerSecond: bps,
            audioBitsPerSecond: 192_000,
          });
        };

        const testBitrates = [
          effectiveTargetBps,
          Math.round(effectiveTargetBps * 0.85),
          12_000_000,
          10_000_000,
          8_000_000,
        ];
        let recorder: MediaRecorder | null = null;
        for (const bps of testBitrates) {
          try {
            recorder = buildRecorder(bps);
            break;
          } catch {
            // try next bitrate level
          }
        }
        if (!recorder) {
          try {
            recorder = new MediaRecorder(videoStream, { videoBitsPerSecond: Math.max(8_000_000, effectiveTargetBps) });
          } catch {
            recorder = new MediaRecorder(videoStream);
          }
        }
        activeRecorderRef.current = recorder;

        const actualMime = recorder.mimeType || mimeType || 'video/mp4';
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        const renderCompletePromise = new Promise<Blob>((resolve) => {
          recorder.onstop = () => {
            resolve(new Blob(chunks, { type: actualMime }));
          };
        });

        const fullTimelineSec = Math.max(1.0, totalDuration);

        // Pre-roll and start first video playback BEFORE recorder.start() so playback motion and recording
        // are locked 1:1 at frame 0, completely eliminating the initial 0.8s freeze and audio desync
        let recordStartMs = performance.now();
        if (firstClip) {
          const firstEntry = preloadedVideos.get(firstClip.id);
          if (firstEntry) {
            const startSec = Math.max(0, firstClip.sourceIn || 0);
            const spd = Math.max(0.25, Math.min(4.0, firstClip.speed || 1.0));
            firstEntry.el.playbackRate = spd;
            firstEntry.el.currentTime = startSec;

            await new Promise<void>((resolve) => {
              let settled = false;
              const finish = () => {
                if (settled) return;
                settled = true;
                firstEntry.el.removeEventListener('playing', finish);
                firstEntry.el.removeEventListener('timeupdate', onTimeUpdate);
                resolve();
              };
              const onTimeUpdate = () => {
                if (firstEntry.el.currentTime > startSec) {
                  finish();
                }
              };
              firstEntry.el.addEventListener('playing', finish, { once: true });
              firstEntry.el.addEventListener('timeupdate', onTimeUpdate);
              firstEntry.el.play().catch(() => finish());
              window.setTimeout(finish, 600);
            });

            const currentMediaOffset = Math.max(0, firstEntry.el.currentTime - startSec);
            recordStartMs = performance.now() - (currentMediaOffset / spd) * 1000;
          }
        }

        drawCompositeExportFrame(0, 0);
        if (videoTrack && typeof videoTrack.requestFrame === 'function') {
          try {
            videoTrack.requestFrame();
          } catch {
            // Ignore
          }
        }

        recorder.start(250);
        let frameCounter = 0;
        let lastProgressUpdateMs = 0;

        while (!abortExportRef.current) {
          const nowMs = performance.now();
          const elapsedSec = (nowMs - recordStartMs) / 1000;
          if (elapsedSec >= fullTimelineSec) {
            break;
          }

          // Sync preloaded video clips accurately + pre-seek upcoming clips 0.45s before concat seams
          for (const vClip of activeV1Clips) {
            const entry = preloadedVideos.get(vClip.id);
            if (!entry) continue;
            const { el, gainNode } = entry;
            const isClipActive =
              elapsedSec >= vClip.startTime - 0.02 &&
              elapsedSec < vClip.startTime + vClip.duration + 0.02;
            const isUpcomingSoon =
              !isClipActive &&
              elapsedSec >= vClip.startTime - 0.45 &&
              elapsedSec < vClip.startTime - 0.02;

            if (isClipActive) {
              const clipOffset = Math.max(0, elapsedSec - vClip.startTime);
              const spd = Math.max(0.25, Math.min(4.0, vClip.speed || 1.0));
              const targetMediaTime = (vClip.sourceIn || 0) + clipOffset * spd;
              if (gainNode && exportAudioCtx) {
                const targetGain = vClip.muted
                  ? 0
                  : Math.max(0, Math.min(2, (vClip.volume ?? 100) / 100));
                gainNode.gain.setValueAtTime(targetGain, exportAudioCtx.currentTime);
              }
              if (el.paused) {
                el.play().catch(() => {});
              }
              // Dynamic playbackRate micro-sync: smoothly eliminate clock drift without hard seek stalls
              const timeDiff = el.currentTime - targetMediaTime;
              if (Math.abs(timeDiff) > 0.35 && !el.seeking) {
                try {
                  el.currentTime = targetMediaTime;
                } catch {
                  // Ignore
                }
              } else if (Math.abs(timeDiff) > 0.04) {
                const rateAdj = Math.max(-0.25, Math.min(0.25, -timeDiff * 0.6));
                el.playbackRate = Math.max(0.25, Math.min(4.0, spd * (1 + rateAdj)));
              } else if (Math.abs(el.playbackRate - spd) > 0.01) {
                el.playbackRate = spd;
              }
            } else if (isUpcomingSoon) {
              if (gainNode && exportAudioCtx) {
                gainNode.gain.setValueAtTime(0, exportAudioCtx.currentTime);
              }
              const targetStart = Math.max(0, vClip.sourceIn || 0);
              if (Math.abs(el.currentTime - targetStart) > 0.25 && !el.seeking) {
                try {
                  el.currentTime = targetStart;
                } catch {
                  // Ignore
                }
              }
            } else {
              if (gainNode && exportAudioCtx) {
                gainNode.gain.setValueAtTime(0, exportAudioCtx.currentTime);
              }
              if (!el.paused) {
                el.pause();
              }
            }
          }

          // Sync preloaded external audio clips
          for (const aClip of activeAudioClips) {
            const entry = preloadedAudios.get(aClip.id);
            if (!entry) continue;
            const { el, gainNode } = entry;
            const isAudioActive =
              elapsedSec >= aClip.startTime - 0.02 &&
              elapsedSec < aClip.startTime + aClip.duration + 0.02;
            if (isAudioActive) {
              const clipOffset = Math.max(0, elapsedSec - aClip.startTime);
              const spd = Math.max(0.25, Math.min(4.0, aClip.speed || 1.0));
              const targetMediaTime = (aClip.sourceIn || 0) + clipOffset * spd;
              if (gainNode && exportAudioCtx) {
                const targetGain = aClip.muted
                  ? 0
                  : Math.max(0, Math.min(2, (aClip.volume ?? 100) / 100));
                gainNode.gain.setValueAtTime(targetGain, exportAudioCtx.currentTime);
              }
              if (Math.abs(el.currentTime - targetMediaTime) > 0.75 && !el.seeking) {
                try {
                  el.currentTime = targetMediaTime;
                } catch {
                  // Ignore
                }
              }
              if (el.paused) {
                el.play().catch(() => {});
              }
            } else if (!el.paused) {
              el.pause();
            }
          }

          drawCompositeExportFrame(elapsedSec, frameCounter++);
          if (videoTrack && typeof videoTrack.requestFrame === 'function') {
            try {
              videoTrack.requestFrame();
            } catch {
              // Ignore
            }
          }

          if (nowMs - lastProgressUpdateMs >= 180) {
            lastProgressUpdateMs = nowMs;
            const pct = Math.min(
              98,
              Math.round(
                18 +
                  (((vIdx - 1) * fullTimelineSec + elapsedSec) /
                    (totalVariants * fullTimelineSec)) *
                    80
              )
            );
            setProgress(Math.max(18, pct));
          }

          // High-precision paced frame timing to lock exact 30fps without stutter or jitter on mobile
          const nextTargetTimeMs = recordStartMs + frameCounter * (1000 / targetFps);
          const curTimeMs = performance.now();
          const sleepMs = Math.max(0, Math.round(nextTargetTimeMs - curTimeMs));
          if (sleepMs > 0) {
            await new Promise((r) => setTimeout(r, sleepMs));
          } else {
            await new Promise((r) => setTimeout(r, 0));
          }
        }

        if (recorder.state !== 'inactive') {
          try {
            recorder.requestData();
          } catch {
            // Ignore
          }
          await new Promise((r) => setTimeout(r, 60));
          if ((recorder as MediaRecorder).state !== 'inactive') {
            recorder.stop();
          }
        }
        activeRecorderRef.current = null;

        if (abortExportRef.current) break;

        const rawVideoBlob = await renderCompletePromise;
        if (abortExportRef.current) break;

        // Cleanly stop media tracks to release hardware encoders
        try {
          videoStream.getTracks().forEach((t) => t.stop());
        } catch {
          // Ignore
        }
        if (exportAudioDest) {
          try {
            exportAudioDest.stream.getTracks().forEach((t) => t.stop());
          } catch {
            // Ignore
          }
        }

        // Rewind media elements for subsequent variants without destroying decoder pipeline
        preloadedVideos.forEach(({ el }) => {
          try {
            el.pause();
            el.currentTime = 0;
          } catch {
            // Ignore
          }
        });
        preloadedAudios.forEach(({ el }) => {
          try {
            el.pause();
            el.currentTime = 0;
          } catch {
            // Ignore
          }
        });

        const videoBlob = await patchMediaRecorderBlobDuration(
          rawVideoBlob,
          fullTimelineSec
        );
        const url = URL.createObjectURL(videoBlob);
        activeObjectUrlsRef.current.add(url);
        const suffix = totalVariants > 1 ? `_Var${String(vIdx).padStart(2, '0')}` : '';
        const isActualWebm = (recorder.mimeType || mimeType).toLowerCase().includes('webm');
        const ext = isActualWebm ? 'webm' : (format === 'gif' ? 'webm' : format);
        const outName = `${safeFileBaseTitle}${suffix}_${resolution}_${exportSpec.fps}fps.${ext}`;
        const actualMb = Math.max(0.05, videoBlob.size / (1024 * 1024)).toFixed(2);
        const actualMbps = (
          (videoBlob.size * 8) /
          Math.max(0.5, fullTimelineSec) /
          1_000_000
        ).toFixed(1);
        generatedList.push({
          name: outName,
          url,
          qualitySummary: `${renderExportW}×${renderExportH} · ${exportSpec.fps} FPS · ${actualMbps} Mbps · ${fullTimelineSec.toFixed(1)}s · ${actualMb} MB`,
        });

        cleanupPreloadedMedia();

        if (!isMobile) {
          const a = document.createElement('a');
          a.href = url;
          a.download = outName;
          a.click();
        }
      }

      if (!abortExportRef.current) {
        setExportedFiles(generatedList);
        setProgress(100);
      }
    } catch {
      if (!abortExportRef.current) {
        setProgress(100);
      }
    } finally {
      cleanupPreloadedMedia();
      try {
        exportCanvas.width = 1;
        exportCanvas.height = 1;
      } catch {
        // Ignore
      }
      stopAudioKeepAlive();
      stopAudioKeepAliveRef.current = null;
      activeRecorderRef.current = null;
      onLockExportDimensions?.(null);
      setIsRendering(false);
    }
  };

  const handleDownloadFfmpegScript = () => {
    const ratioForFfmpeg: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
    const cmdBody = buildFfmpegMatrixCommand(
      clips,
      {
        ...antiDetect,
        variantCount: Math.max(1, batchVariantCount),
        crf: crfValue,
        preset: 'slow',
      },
      ratioForFfmpeg,
      fastCopyMode
    );

    const header =
      scriptOs === 'bat'
        ? `@echo off\r\nREM TDO CUT — Studio FFmpeg Export Script (${antiDetect.gpuEncoder} / -crf ${crfValue} -preset slow)\r\nREM Project: ${title}\r\n\r\n`
        : `#!/usr/bin/env bash\n# TDO CUT — Studio FFmpeg Export Script (${antiDetect.gpuEncoder} / -crf ${crfValue} -preset slow)\n# Project: ${title}\n\n`;

    const fullScript = `${header}${cmdBody}\n`;
    const blob = new Blob([fullScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_TDOCut_FFmpeg.${scriptOs}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Dedicated Mobile Export Bottom Sheet (Matching CapCut Mobile aesthetics)
  if (isMobile) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEn ? 'Mobile Export Window' : 'Xuất video'}
        className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 text-xs text-[#E4E4E7]"
      >
        <div className="w-full max-w-[480px] bg-[#18181E] border-t sm:border border-[#2C2C36] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-[#202028] border-b border-[#2C2C36] shrink-0">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Film className="w-4 h-4 text-[#00E5CC]" />
              <span>{isEn ? 'Export Video' : 'Xuất video'}</span>
            </div>
            <button
              type="button"
              onClick={handleModalClose}
              aria-label={isEn ? 'Close export' : 'Đóng'}
              className="p-1.5 text-[#A1A1AA] hover:text-white rounded-full bg-[#2C2C36]/50 active:bg-[#383846] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Body: Vertical Scroll */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* Top Preview & Title Card */}
            <div className="flex items-center gap-3 p-2.5 bg-[#202028] border border-[#2C2C36] rounded-xl">
              <div
                style={
                  effectiveCoverUrl
                    ? {
                        backgroundImage: `url(${effectiveCoverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {
                        background: 'linear-gradient(135deg, #0D9488 0%, #1E1B4B 55%, #090D16 100%)',
                      }
                }
                className="w-14 h-18 rounded-lg border border-[#3A3A48] shrink-0 overflow-hidden relative flex items-end justify-center shadow-md"
              >
                <span className="absolute top-1 left-1 px-1 py-0.2 text-[8px] font-mono bg-black/70 text-[#00E5CC] rounded">
                  {aspectRatio === 'original' ? 'Gốc' : aspectRatio}
                </span>
                {coverTextOverlay && (
                  <span
                    style={{ color: coverTemplateColor }}
                    className="text-[9px] font-black truncate max-w-[90%] mb-1 px-1 bg-black/75 rounded"
                  >
                    {coverTextOverlay}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <input
                  type="text"
                  value={title}
                  placeholder={isEn ? 'Enter project name' : 'Nhập tên dự án'}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2 py-1 bg-[#141418] border border-[#32323C] rounded text-white text-xs font-semibold focus:border-[#00E5CC] outline-none"
                />
                <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5">
                  <span data-testid="export-quality-spec" className="text-[#00E5CC] font-mono font-bold">
                    {targetExportW}×{targetExportH}
                  </span>
                  <span>•</span>
                  <span>{exportSpec.fps} FPS</span>
                  <span>•</span>
                  <span>{totalDuration.toFixed(1)}s</span>
                </div>
                <div className="text-[10px] text-[#9CA3AF]">
                  {isEn ? 'Est. size:' : 'Dung lượng ước tính:'}{' '}
                  <span data-testid="export-estimated-size" className="text-[#00E5CC] font-mono font-bold">
                    ~{estimatedSizeMb} MB
                  </span>
                </div>
              </div>
            </div>

            {/* Resolution Segmented Control */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#D4D4D8]">
                {isEn ? 'Resolution' : 'Độ phân giải'}
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['720p', '1080p', '2K', '4K'] as const).map((r) => {
                  const active = resolution === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResolution(r)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all border ${
                        active
                          ? 'bg-[#00E5CC] text-black border-[#00E5CC] shadow-md shadow-[#00E5CC]/20'
                          : 'bg-[#202028] text-[#D4D4D8] border-[#2C2C36] hover:bg-[#282834]'
                      }`}
                    >
                      {r.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frame Rate Segmented Control */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#D4D4D8]">
                {isEn ? 'Frame Rate' : 'Tỷ lệ khung hình'}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['24fps', '30fps', '60fps'] as const).map((f) => {
                  const active = fps === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFps(f)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all border ${
                        active
                          ? 'bg-[#00E5CC] text-black border-[#00E5CC] shadow-md shadow-[#00E5CC]/20'
                          : 'bg-[#202028] text-[#D4D4D8] border-[#2C2C36] hover:bg-[#282834]'
                      }`}
                    >
                      {f.replace('fps', ' FPS')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality / Bitrate Segmented Control */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#D4D4D8]">
                {isEn ? 'Bitrate / Quality' : 'Chất lượng / Tốc độ mã'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'recommended', label: isEn ? 'Standard' : 'Tiêu chuẩn (Chuẩn)' },
                  { id: 'higher', label: isEn ? 'High Quality' : 'Chất lượng cao' },
                ].map((b) => {
                  const active = bitrateMode === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBitrateMode(b.id as 'recommended' | 'higher')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all border ${
                        active
                          ? 'bg-[#00E5CC] text-black border-[#00E5CC] shadow-md shadow-[#00E5CC]/20'
                          : 'bg-[#202028] text-[#D4D4D8] border-[#2C2C36] hover:bg-[#282834]'
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format Selection (MP4 / MOV) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#D4D4D8]">
                {isEn ? 'Format' : 'Định dạng tệp'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['mp4', 'mov'] as const).map((fmt) => {
                  const active = format === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all border ${
                        active
                          ? 'bg-[#00E5CC] text-black border-[#00E5CC] shadow-md shadow-[#00E5CC]/20'
                          : 'bg-[#202028] text-[#D4D4D8] border-[#2C2C36] hover:bg-[#282834]'
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Progress Bar when Rendering */}
            {isRendering && (
              <div className="p-3 bg-[#202028] border border-[#00E5CC]/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#00E5CC]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEn ? 'Exporting video...' : 'Đang xuất video...'}</span>
                  </div>
                  <span className="font-mono font-bold text-white text-sm">{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#141418] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00E5CC] to-[#38BDF8] transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#A1A1AA] text-center">
                  {isEn
                    ? 'Please keep this screen open and do not close browser'
                    : 'Vui lòng giữ nguyên màn hình và không đóng trình duyệt'}
                </p>
              </div>
            )}

            {/* Exported Video Done Box */}
            {exportedFiles.length > 0 && !isRendering && (
              <div className="p-3 bg-[#1A2624] border border-[#00E5CC] rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00E5CC]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isEn ? 'Video exported successfully!' : 'Đã xuất video thành công!'}</span>
                </div>
                <video
                  src={exportedFiles[0].url}
                  controls
                  playsInline
                  className="w-full max-h-48 rounded-lg bg-black object-contain"
                />
                <a
                  href={exportedFiles[0].url}
                  download={exportedFiles[0].name}
                  className="w-full py-2.5 bg-[#00E5CC] hover:bg-[#00c4ae] active:scale-[0.98] text-black font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{isEn ? 'Download Video to Phone' : 'Lưu video vào điện thoại'}</span>
                </a>
              </div>
            )}
          </div>

          {/* Mobile Footer Action Button */}
          <div className="p-3.5 bg-[#202028] border-t border-[#2C2C36] shrink-0">
            {isRendering ? (
              <button
                type="button"
                onClick={handleCancelExport}
                className="w-full py-3 bg-[#EF4444] hover:bg-[#DC2626] active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>{isEn ? 'Cancel Export' : 'Hủy xuất video'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartRealVideoExport}
                className="w-full py-3 bg-[#00E5CC] hover:bg-[#00c4ae] active:scale-[0.98] text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00E5CC]/25 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isEn ? 'Export Video Now' : 'Xuất video ngay'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? 'TDO CUT Export Window' : 'Cửa sổ Xuất Video TDO CUT'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-[880px] bg-[#1E1E24] border border-[#32323C] rounded-xl shadow-2xl overflow-hidden text-xs text-[#E4E4E7] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#25252C] border-b border-[#32323C] shrink-0">
          <div className="flex items-center gap-2 font-semibold text-sm text-white">
            <Film className="w-4 h-4 text-[#00E5CC]" />
            <span>
              {isEn
                ? 'Export Video'
                : 'Xuất Video (Export)'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            aria-label={isEn ? 'Close export modal' : 'Đóng hộp thoại xuất'}
            className="p-1 text-[#A1A1AA] hover:text-white rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Studio Export Body */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* LEFT COLUMN (5 cols): Cover Preview & Thumbnail Title Overlay */}
          <div className="col-span-5 bg-[#16161B] border-r border-[#2B2B34] p-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {isEn ? 'Video Cover (Edit Cover)' : 'Ảnh bìa video (Edit Cover)'}
                </span>
                <button
                  type="button"
                  onClick={handleCaptureCoverFrame}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-[#25252E] hover:bg-[#32323E] text-[#00E5CC] border border-[#383846] rounded cursor-pointer"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>{isEn ? 'Capture current frame' : 'Chụp khung hình hiện tại'}</span>
                </button>
              </div>

              {/* Cover Preview Frame (Shows actual captured video frame) */}
              <div
                style={
                  effectiveCoverUrl
                    ? {
                        backgroundImage: `url(${effectiveCoverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {
                        background:
                          'linear-gradient(135deg, #0D9488 0%, #1E1B4B 55%, #090D16 100%)',
                      }
                }
                className="relative aspect-video rounded-lg border border-[#32323E] overflow-hidden flex flex-col items-center justify-end p-3 shadow-inner"
              >
                <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold bg-black/70 text-[#00E5CC] rounded">
                  {isEn ? 'Edit cover' : 'Sửa ảnh bìa (Edit cover)'}
                </span>
                <span className="absolute top-2 right-2 px-1.5 py-0.5 font-mono text-[9px] bg-black/70 text-white rounded">
                  {aspectRatio === 'original' ? `Gốc (${effectiveAspectRatio})` : aspectRatio}
                </span>

                {coverTextOverlay && (
                  <div
                    style={{ color: coverTemplateColor }}
                    className="px-3 py-1 bg-black/75 border border-white/15 rounded font-extrabold text-sm tracking-wide text-center shadow-lg"
                  >
                    {coverTextOverlay}
                  </div>
                )}
              </div>

              {/* Cover Template Title Input */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] text-[#A1A1AA]">
                  {isEn
                    ? 'Cover Title Text (Thumbnail Text):'
                    : 'Chữ tiêu đề trên Ảnh bìa (Thumbnail Text):'}
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={coverTextOverlay}
                    onChange={(e) => setCoverTextOverlay(e.target.value)}
                    placeholder={isEn ? 'Enter text...' : 'Nhập văn bản...'}
                    className="flex-1 px-2.5 py-1.5 bg-[#1E1E26] border border-[#32323C] rounded text-white text-xs"
                  />
                  <input
                    type="color"
                    aria-label={isEn ? 'Cover text color' : 'Màu chữ ảnh bìa'}
                    value={coverTemplateColor}
                    onChange={(e) => setCoverTemplateColor(e.target.value)}
                    className="w-8 h-7 bg-[#1E1E26] border border-[#32323C] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Summary Info (Duration & Estimated File Size) */}
            <div className="p-3 bg-[#1E1E26] border border-[#2E2E38] rounded-lg space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#9CA3AF] whitespace-nowrap">
                  {isEn ? 'Output Spec:' : 'Chuẩn đầu ra:'}
                </span>
                <span
                  data-testid="export-quality-spec"
                  className="font-mono font-bold text-[#00E5CC] whitespace-nowrap"
                >
                  {realisticEstimate.qualityLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">
                  {isEn ? 'Duration:' : 'Thời lượng (Duration):'}
                </span>
                <span className="font-mono font-semibold text-white">
                  {totalDuration.toFixed(1)}s ({clips.filter((c) => c.trackIndex === 0).length} video clips)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">
                  {isEn ? 'Estimated Size:' : 'Dung lượng dự kiến (Estimated Size):'}
                </span>
                <span
                  data-testid="export-estimated-size"
                  className="font-mono font-semibold text-[#00E5CC]"
                >
                  ~{estimatedSizeMb} MB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">
                  {isEn ? 'Hardware Acceleration:' : 'Tăng tốc phần cứng:'}
                </span>
                <span className="font-mono text-[10px] text-[#34D399]">
                  {antiDetect.gpuEncoder.toUpperCase()} Ready
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 cols): Detailed Export Settings */}
          <div className="col-span-7 p-4 overflow-y-auto space-y-3.5">
            {/* Name & Export To */}
            <div className="space-y-2 pb-3 border-b border-[#2B2B34]">
              <div className="grid grid-cols-3 items-center gap-2">
                <label htmlFor="export-title" className="text-[#A1A1AA]">
                  {isEn ? 'Project Name:' : 'Tên dự án (Name):'}
                </label>
                <input
                  id="export-title"
                  type="text"
                  value={title}
                  placeholder={isEn ? 'Enter project name' : 'Nhập tên dự án'}
                  onChange={(e) => setTitle(e.target.value)}
                  className="col-span-2 px-2.5 py-1.5 bg-[#141418] border border-[#32323C] rounded text-white"
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <label htmlFor="export-path" className="text-[#A1A1AA]">
                  {isEn ? 'Export to:' : 'Xuất đến (Export to):'}
                </label>
                <input
                  id="export-path"
                  type="text"
                  value={exportPath}
                  onChange={(e) => setExportPath(e.target.value)}
                  className="col-span-2 px-2.5 py-1.5 bg-[#141418] border border-[#32323C] rounded text-[#A1A1AA] font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Section 1: Video Export */}
            <div className="space-y-2.5 pb-3 border-b border-[#2B2B34]">
              <label className="flex items-center gap-2 font-semibold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportVideoChecked}
                  onChange={(e) => setExportVideoChecked(e.target.checked)}
                  className="accent-[#00E5CC]"
                />
                <span>{isEn ? 'Video Export' : 'Xuất Video (Video Export)'}</span>
              </label>

              {exportVideoChecked && (
                <div className="pl-5 space-y-2">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-[#A1A1AA]">
                      {isEn ? 'Resolution:' : 'Độ phân giải (Resolution):'}
                    </span>
                    <select
                      aria-label={isEn ? 'Resolution' : 'Độ phân giải'}
                      value={resolution}
                      onChange={(e) =>
                        setResolution(e.target.value as '480p' | '720p' | '1080p' | '2K' | '4K')
                      }
                      className="col-span-2 px-2.5 py-1 bg-[#141418] border border-[#32323C] rounded text-white"
                    >
                      <option value="480p">480P</option>
                      <option value="720p">720P HD</option>
                      <option value="1080p">1080P Full HD</option>
                      <option value="2K">2K QHD</option>
                      <option value="4K">4K UHD</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-[#A1A1AA]">Bitrate &amp; Codec:</span>
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <select
                        aria-label={isEn ? 'Bitrate Mode' : 'Chế độ Bitrate'}
                        value={bitrateMode}
                        onChange={(e) =>
                          setBitrateMode(e.target.value as 'recommended' | 'higher' | 'lower')
                        }
                        className="px-2 py-1 bg-[#141418] border border-[#32323C] rounded text-white"
                      >
                        <option value="recommended">
                          {isEn ? 'Recommended' : 'Khuyên dùng (Recommended)'}
                        </option>
                        <option value="higher">
                          {isEn ? 'Higher Bitrate' : 'Cao hơn (Higher Bitrate)'}
                        </option>
                        <option value="lower">
                          {isEn ? 'Lower Size' : 'Thấp hơn (Lower Size)'}
                        </option>
                      </select>

                      <select
                        aria-label={isEn ? 'Video Codec' : 'Bộ mã hóa Codec'}
                        value={codec}
                        onChange={(e) =>
                          setCodec(e.target.value as 'h264' | 'hevc' | 'av1' | 'prores4444')
                        }
                        className="px-2 py-1 bg-[#141418] border border-[#32323C] rounded text-white"
                      >
                        <option value="h264">H.264 (AVC)</option>
                        <option value="hevc">HEVC (H.265)</option>
                        <option value="av1">AV1 (Next-Gen)</option>
                        <option value="prores4444">
                          {isEn ? 'Apple ProRes 4444 (Alpha)' : 'Apple ProRes 4444 (Kênh Alpha)'}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-[#A1A1AA]">
                      {isEn ? 'Format & FPS:' : 'Định dạng & FPS:'}
                    </span>
                    <div className="col-span-2 grid grid-cols-3 gap-2">
                      <select
                        aria-label={isEn ? 'Video Format' : 'Định dạng tệp video'}
                        value={format}
                        onChange={(e) =>
                          setFormat(e.target.value as 'mp4' | 'mov' | 'webm' | 'gif')
                        }
                        className="px-2 py-1 bg-[#141418] border border-[#32323C] rounded text-white"
                      >
                        <option value="mp4">mp4</option>
                        <option value="mov">mov</option>
                        <option value="webm">webm</option>
                        <option value="gif">GIF (640P)</option>
                      </select>

                      <select
                        aria-label={isEn ? 'Frame Rate' : 'Tốc độ khung hình'}
                        value={fps}
                        onChange={(e) =>
                          setFps(
                            e.target.value as '24fps' | '25fps' | '30fps' | '50fps' | '60fps'
                          )
                        }
                        className="px-2 py-1 bg-[#141418] border border-[#32323C] rounded text-white"
                      >
                        <option value="24fps">24 fps</option>
                        <option value="25fps">25 fps</option>
                        <option value="30fps">30 fps</option>
                        <option value="50fps">50 fps</option>
                        <option value="60fps">60 fps</option>
                      </select>

                      <select
                        aria-label={isEn ? 'Color Space' : 'Không gian màu'}
                        value={colorSpace}
                        onChange={(e) =>
                          setColorSpace(
                            e.target.value as 'Rec.709 SDR' | 'HLG HDR' | 'PQ HDR10'
                          )
                        }
                        className="px-2 py-1 bg-[#141418] border border-[#32323C] rounded text-white"
                      >
                        <option value="Rec.709 SDR">Rec.709 SDR</option>
                        <option value="HLG HDR">HLG HDR</option>
                        <option value="PQ HDR10">PQ HDR10</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-[#A1A1AA]">Encoder GPU &amp; CRF:</span>
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <select
                        aria-label={isEn ? 'Hardware GPU Encoder' : 'Bộ mã hóa phần cứng Encoder'}
                        value={antiDetect.gpuEncoder}
                        onChange={(e) => {
                          const enc = e.target.value as GpuEncoderOption;
                          onUpdateAntiDetect?.({ gpuEncoder: enc });
                          if (enc === 'hevc_nvenc') setCodec('hevc');
                          else if (enc === 'prores') {
                            setCodec('prores4444');
                            setFormat('mov');
                          } else setCodec('h264');
                        }}
                        className="px-2 py-1 bg-[#141418] border border-[#00E5CC]/45 rounded text-[#00E5CC] font-mono text-[11px]"
                      >
                        <option value="hevc_nvenc">hevc_nvenc (NVIDIA H.265 10-bit)</option>
                        <option value="prores">prores (Apple ProRes 422 HQ / 4444)</option>
                        <option value="h264_nvenc">h264_nvenc (NVIDIA NVENC H.264)</option>
                        <option value="h264_qsv">h264_qsv (Intel QuickSync)</option>
                        <option value="h264_amf">h264_amf (AMD AMF)</option>
                        <option value="libx264">libx264 (CPU Studio x264)</option>
                      </select>

                      <select
                        aria-label={isEn ? 'CRF Quality & Preset' : 'Chỉ số nét CRF và Preset'}
                        value={crfValue}
                        onChange={(e) => {
                          const nextCrf = Number(e.target.value);
                          setCrfValue(nextCrf);
                          onUpdateAntiDetect?.({ crf: nextCrf, preset: 'slow' });
                        }}
                        className="px-2 py-1 bg-[#141418] border border-[#32323C] rounded text-white font-mono text-[11px]"
                      >
                        <option value={18}>
                          {isEn ? '-crf 18 -preset slow (Ultra Sharp)' : '-crf 18 -preset slow (Siêu nét Studio)'}
                        </option>
                        <option value={19}>
                          {isEn ? '-crf 19 -preset slow (Cinema Grade)' : '-crf 19 -preset slow (Chuẩn Cinema)'}
                        </option>
                        <option value={20}>
                          {isEn ? '-crf 20 -preset slow (Balanced)' : '-crf 20 -preset slow (Cân bằng Mượt)'}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Matrix Batch Variant Count */}
                  <div className="grid grid-cols-3 items-center gap-2 pt-1">
                    <label htmlFor="export-batch-count" className="text-[#A1A1AA]">
                      {isEn ? 'Batch Variant Count (N):' : 'Số bản xuất hàng loạt (N):'}
                    </label>
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        id="export-batch-count"
                        type="number"
                        min={1}
                        max={50}
                        value={batchVariantCount}
                        onChange={(e) => setBatchVariantCount(Math.max(1, Number(e.target.value)))}
                        className="w-16 px-2 py-1 bg-[#141418] border border-[#32323C] rounded text-[#00E5CC] font-mono"
                      />
                      <span className="text-[11px] text-[#9CA3AF]">
                        {batchVariantCount === 1
                          ? isEn
                            ? 'Export 1 master copy'
                            : 'Xuất 1 bản chuẩn'
                          : isEn
                          ? `Shuffle & export ${batchVariantCount} variants`
                          : `Trộn ngẫu nhiên & xuất ${batchVariantCount} biến thể`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Audio & Caption Export */}
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#2B2B34]">
              <div className="p-2.5 bg-[#141418] border border-[#2B2B34] rounded space-y-2">
                <label className="flex items-center gap-2 font-semibold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportAudioChecked}
                    onChange={(e) => setExportAudioChecked(e.target.checked)}
                    className="accent-[#00E5CC]"
                  />
                  <Music className="w-3.5 h-3.5 text-[#00E5CC]" />
                  <span>{isEn ? 'Export Audio' : 'Xuất Âm thanh rời (Audio)'}</span>
                </label>
                {exportAudioChecked && (
                  <select
                    value={audioFormat}
                    onChange={(e) =>
                      setAudioFormat(e.target.value as 'mp3' | 'wav' | 'aac' | 'flac')
                    }
                    className="w-full px-2 py-1 bg-[#1E1E26] border border-[#32323C] rounded text-white text-[11px]"
                  >
                    <option value="mp3">MP3 (320kbps)</option>
                    <option value="wav">WAV (Lossless PCM)</option>
                    <option value="aac">AAC</option>
                    <option value="flac">FLAC</option>
                  </select>
                )}
              </div>

              <div className="p-2.5 bg-[#141418] border border-[#2B2B34] rounded space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-semibold text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportCaptionChecked}
                      onChange={(e) => setExportCaptionChecked(e.target.checked)}
                      className="accent-[#00E5CC]"
                    />
                    <FileText className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{isEn ? 'Export Captions' : 'Xuất Phụ đề (Captions)'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleExportSrtDirect}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-[#25252E] hover:bg-[#323240] text-[#00E5CC] rounded cursor-pointer"
                  >
                    {isEn ? 'Download .SRT' : 'Tải .SRT ngay'}
                  </button>
                </div>
                {exportCaptionChecked && (
                  <select
                    value={captionFormat}
                    onChange={(e) => setCaptionFormat(e.target.value as 'srt' | 'txt')}
                    className="w-full px-2 py-1 bg-[#1E1E26] border border-[#32323C] rounded text-white text-[11px]"
                  >
                    <option value="srt">
                      {isEn ? 'SRT (With Timecode)' : 'SRT (Có mốc thời gian Timecode)'}
                    </option>
                    <option value="txt">
                      {isEn ? 'TXT (Plain Text Only)' : 'TXT (Chỉ nội dung văn bản)'}
                    </option>
                  </select>
                )}
              </div>
            </div>



            {/* Cancellation Notice */}
            {cancelNotice && !isRendering && (
              <div className="p-2.5 bg-[#EF4444]/15 border border-[#EF4444]/50 rounded flex items-center justify-between text-xs text-[#FCA5A5]">
                <span>{cancelNotice}</span>
                <button
                  type="button"
                  onClick={() => setCancelNotice(null)}
                  className="text-[11px] underline hover:text-white cursor-pointer"
                >
                  {isEn ? 'Dismiss' : 'Đóng'}
                </button>
              </div>
            )}

            {/* Progress Bar + Instant Cancel Export Button */}
            {(isRendering || progress > 0) && (
              <div className="p-2.5 bg-[#141418] border border-[#2B2B34] rounded space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#00E5CC] font-medium truncate">
                    {isRendering
                      ? isEn
                        ? `Exporting Full HD (${exportSpec.width}×${exportSpec.height} @ ${exportSpec.fps}fps)...`
                        : `Đang kết xuất Video Full HD (${exportSpec.width}×${exportSpec.height} @ ${exportSpec.fps}fps)...`
                      : isEn
                      ? `Rendered ${exportedFiles.length} video file(s) successfully!`
                      : `Đã kết xuất ${exportedFiles.length} file video thành công!`}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono tabular-nums text-white font-bold">
                      {progress}%
                    </span>
                    {isRendering && (
                      <button
                        type="button"
                        onClick={handleCancelExport}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold rounded text-[11px] cursor-pointer shadow"
                      >
                        <Ban className="w-3 h-3" />
                        <span>{isEn ? 'Cancel Export' : 'Hủy xuất'}</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full h-2 bg-[#1E1E26] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#00E5CC] transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Exported Files List & Seekable Video Player with Timecode */}
            {exportedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="p-2 bg-[#141418] border border-[#00E5CC]/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#00E5CC]">
                      {isEn
                        ? '🎬 Export Preview (Embedded Timecode & Exact Duration):'
                        : '🎬 Xem trước tệp xuất (Đã nhúng Timecode & Thời lượng chuẩn):'}
                    </span>
                    <span className="font-mono text-[10px] text-[#A1A1AA]">
                      {exportedFiles[0].qualitySummary}
                    </span>
                  </div>
                  <video
                    src={exportedFiles[0].url}
                    controls
                    preload="auto"
                    playsInline
                    className="w-full max-h-36 rounded bg-black object-contain"
                  />
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1.5">
                  {exportedFiles.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-[#141418] border border-[#00E5CC]/40 rounded flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5CC] shrink-0" />
                        <span className="truncate text-white font-mono text-[11px]">{item.name}</span>
                      </div>
                      <a
                        href={item.url}
                        download={item.name}
                        className="px-2.5 py-1 bg-[#00E5CC] text-[#090D12] font-semibold rounded whitespace-nowrap shrink-0"
                      >
                        {isEn ? 'Download' : 'Tải lại'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Clean Direct Video Export */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-[#25252C] border-t border-[#32323C] shrink-0">
          {/* Primary Export & Cancel Export Buttons */}
          <div className="flex items-center gap-2">
            {isRendering && (
              <button
                type="button"
                onClick={handleCancelExport}
                className="flex items-center gap-1.5 px-4 py-1.5 font-bold bg-[#EF4444] hover:bg-[#DC2626] text-white rounded transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{isEn ? 'Cancel Export' : 'Hủy xuất'}</span>
              </button>
            )}
            <button
              type="button"
              disabled={isRendering}
              onClick={handleStartRealVideoExport}
              className="flex items-center gap-1.5 px-5 py-1.5 font-bold bg-[#00E5CC] hover:bg-[#00F5DC] disabled:opacity-50 text-[#090D12] rounded transition-colors cursor-pointer"
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {isEn ? `Exporting (${progress}%)...` : `Đang xuất (${progress}%)...`}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Export Video' : 'Xuất Video (Export)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MATRIX BATCH GENERATOR MODAL (Công cụ AI hàng loạt / Tạo AI)
// ============================================================================
interface MatrixBatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxClipCount: number;
  onGenerateBatchVariants: (config: {
    startOrder: number;
    endOrder: number;
    targetDurationSec: number;
    enableSubClipSlicing: boolean;
    minSliceSec: number;
    maxSliceSec: number;
    variantCount: number;
  }) => void;
}

export const MatrixBatchGeneratorModal: React.FC<MatrixBatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  maxClipCount,
  onGenerateBatchVariants,
}) => {
  const [startOrder, setStartOrder] = useState(1);
  const [endOrder, setEndOrder] = useState(Math.max(1, maxClipCount));
  const [targetDurationSec, setTargetDurationSec] = useState(60);
  const [enableSubClipSlicing, setEnableSubClipSlicing] = useState(true);
  const [minSliceSec, setMinSliceSec] = useState(2.0);
  const [maxSliceSec, setMaxSliceSec] = useState(5.0);
  const [variantCount, setVariantCount] = useState(5);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chế độ Sản Xuất Hàng Loạt (Matrix Batch Generator)"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
    >
      <div className="w-full max-w-[540px] bg-[#1E1E24] border border-[#32323C] rounded-lg shadow-2xl overflow-hidden text-xs text-[#E4E4E7]">
        <div className="flex items-center justify-between px-4 py-3 bg-[#25252C] border-b border-[#32323C]">
          <div className="flex items-center gap-2 font-semibold text-sm text-white">
            <Sparkles className="w-4 h-4 text-[#00E5CC]" />
            <span>Chế độ Sản Xuất Hàng Loạt (Matrix Batch Generator)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#A1A1AA] hover:text-white rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Range X..Y */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A1A1AA] mb-1">Từ Clip số (X):</label>
              <input
                type="number"
                min={1}
                max={Math.max(1, maxClipCount)}
                value={startOrder}
                onChange={(e) => setStartOrder(Math.max(1, Number(e.target.value)))}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-[#32323C] rounded text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[#A1A1AA] mb-1">Đến Clip số (Y):</label>
              <input
                type="number"
                min={1}
                max={Math.max(1, maxClipCount)}
                value={endOrder}
                onChange={(e) => setEndOrder(Math.max(1, Number(e.target.value)))}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-[#32323C] rounded text-white font-mono"
              />
            </div>
          </div>

          {/* Target Duration */}
          <div>
            <label className="block text-[#A1A1AA] mb-1">
              Thời lượng video đầu ra mong muốn (giây):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={7200}
                value={targetDurationSec}
                onChange={(e) => setTargetDurationSec(Math.max(5, Number(e.target.value)))}
                className="w-28 px-2.5 py-1.5 bg-[#141418] border border-[#32323C] rounded text-[#00E5CC] font-mono"
              />
              {[30, 60, 90, 180].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetDurationSec(preset)}
                  className={`px-2.5 py-1 rounded border text-[11px] font-mono cursor-pointer ${
                    targetDurationSec === preset
                      ? 'bg-[#00E5CC] text-black border-[#00E5CC] font-bold'
                      : 'bg-[#141418] text-[#D4D4D8] border-[#32323C] hover:text-white'
                  }`}
                >
                  {preset}s
                </button>
              ))}
            </div>
          </div>

          {/* Sub-clip Slicing */}
          <div className="p-3 bg-[#141418] border border-[#2B2B34] rounded space-y-2">
            <label className="flex items-center gap-2 font-medium text-white cursor-pointer">
              <input
                type="checkbox"
                checked={enableSubClipSlicing}
                onChange={(e) => setEnableSubClipSlicing(e.target.checked)}
                className="accent-[#00E5CC]"
              />
              <span>Cắt nhỏ cảnh dài (Sub-clip Slicing — lấy ngẫu nhiên đoạn giữa)</span>
            </label>
            {enableSubClipSlicing && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="block text-[10px] text-[#9CA3AF] mb-1">Tối thiểu Min (giây):</span>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={30}
                    value={minSliceSec}
                    onChange={(e) => setMinSliceSec(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-[#1E1E24] border border-[#32323C] rounded text-white font-mono"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-[#9CA3AF] mb-1">Tối đa Max (giây):</span>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={60}
                    value={maxSliceSec}
                    onChange={(e) => setMaxSliceSec(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-[#1E1E24] border border-[#32323C] rounded text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Variant Count N */}
          <div>
            <label className="block text-[#A1A1AA] mb-1">
              Số lượng video biến thể muốn tạo cùng lúc (N bản):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={50}
                value={variantCount}
                onChange={(e) => setVariantCount(Math.max(1, Number(e.target.value)))}
                className="w-24 px-2.5 py-1.5 bg-[#141418] border border-[#32323C] rounded text-[#00E5CC] font-mono"
              />
              {[3, 5, 10, 20].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setVariantCount(n)}
                  className={`px-2.5 py-1 rounded border text-[11px] font-mono cursor-pointer ${
                    variantCount === n
                      ? 'bg-[#00E5CC] text-black border-[#00E5CC] font-bold'
                      : 'bg-[#141418] text-[#D4D4D8] border-[#32323C] hover:text-white'
                  }`}
                >
                  {n} bản
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#25252C] border-t border-[#32323C]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-[#30303A] hover:bg-[#3B3B48] text-white rounded cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onGenerateBatchVariants({
                startOrder,
                endOrder,
                targetDurationSec,
                enableSubClipSlicing,
                minSliceSec,
                maxSliceSec,
                variantCount,
              });
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 font-semibold bg-[#00E5CC] hover:bg-[#00F5DC] text-[#090D12] rounded cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chạy trộn &amp; Đưa vào danh sách xuất hàng loạt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// AI SCENE CUT MODAL (Công cụ cắt clip bằng AI -> Bắt đầu cắt clip)
// ============================================================================
interface AiSceneCutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSceneSplit: (config: {
    mode: 'auto_scene' | 'fixed_interval';
    sensitivity: number;
    intervalSec: number;
    randomRange: boolean;
    minSec: number;
    maxSec: number;
  }) => void;
}

export const AiSceneCutModal: React.FC<AiSceneCutModalProps> = ({
  isOpen,
  onClose,
  onRunSceneSplit,
}) => {
  const [mode, setMode] = useState<'auto_scene' | 'fixed_interval'>('auto_scene');
  const [sensitivity, setSensitivity] = useState(28);
  const [intervalSec, setIntervalSec] = useState(3.0);
  const [randomRange, setRandomRange] = useState(false);
  const [minSec, setMinSec] = useState(2.0);
  const [maxSec, setMaxSec] = useState(4.5);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Công cụ cắt clip bằng AI (Auto Scene Split)"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
    >
      <div className="w-full max-w-[480px] bg-[#1E1E24] border border-[#32323C] rounded-lg shadow-2xl overflow-hidden text-xs text-[#E4E4E7]">
        <div className="flex items-center justify-between px-4 py-3 bg-[#25252C] border-b border-[#32323C]">
          <div className="flex items-center gap-2 font-semibold text-sm text-white">
            <Scissors className="w-4 h-4 text-[#00E5CC]" />
            <span>Công cụ Cắt Clip Tự Động bằng AI</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#A1A1AA] hover:text-white rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('auto_scene')}
              className={`p-2.5 rounded border text-left transition-colors cursor-pointer ${
                mode === 'auto_scene'
                  ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-white'
                  : 'bg-[#141418] border-[#2E2E38] text-[#A1A1AA]'
              }`}
            >
              <div className="font-semibold text-xs text-[#00E5CC] mb-0.5">
                Chế độ 1: Tự động phát hiện chuyển cảnh
              </div>
              <div className="text-[10px] text-[#9CA3AF]">
                Quét độ chênh lệch màu sắc giữa các khung hình để tách các cảnh phim dài.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('fixed_interval')}
              className={`p-2.5 rounded border text-left transition-colors cursor-pointer ${
                mode === 'fixed_interval'
                  ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-white'
                  : 'bg-[#141418] border-[#2E2E38] text-[#A1A1AA]'
              }`}
            >
              <div className="font-semibold text-xs text-[#00E5CC] mb-0.5">
                Chế độ 2: Chia nhỏ theo khoảng giây
              </div>
              <div className="text-[10px] text-[#9CA3AF]">
                Cắt tự động mỗi N giây cố định hoặc ngẫu nhiên từ Min đến Max giây.
              </div>
            </button>
          </div>

          {mode === 'auto_scene' ? (
            <div className="p-3 bg-[#141418] border border-[#2B2B34] rounded space-y-2">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Ngưỡng nhạy phát hiện chuyển cảnh:</span>
                <span className="font-mono text-[#00E5CC]">{sensitivity}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-[#00E5CC]"
              />
            </div>
          ) : (
            <div className="p-3 bg-[#141418] border border-[#2B2B34] rounded space-y-2.5">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomRange}
                  onChange={(e) => setRandomRange(e.target.checked)}
                  className="accent-[#00E5CC]"
                />
                <span>Cắt độ dài ngẫu nhiên (Min giây → Max giây)</span>
              </label>

              {!randomRange ? (
                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">Độ dài mỗi clip con (giây):</span>
                  <input
                    type="number"
                    step={0.5}
                    min={1}
                    max={60}
                    value={intervalSec}
                    onChange={(e) => setIntervalSec(Math.max(1, Number(e.target.value)))}
                    className="w-24 px-2 py-1 bg-[#1E1E24] border border-[#32323C] rounded text-white font-mono"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] text-[#9CA3AF] mb-1">Min (giây):</span>
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={30}
                      value={minSec}
                      onChange={(e) => setMinSec(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#1E1E24] border border-[#32323C] rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#9CA3AF] mb-1">Max (giây):</span>
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={60}
                      value={maxSec}
                      onChange={(e) => setMaxSec(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#1E1E24] border border-[#32323C] rounded text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#25252C] border-t border-[#32323C]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-[#30303A] hover:bg-[#3B3B48] text-white rounded cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onRunSceneSplit({
                mode,
                sensitivity,
                intervalSec,
                randomRange,
                minSec,
                maxSec,
              });
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 font-semibold bg-[#00E5CC] hover:bg-[#00F5DC] text-[#090D12] rounded cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Tách cảnh &amp; Đẩy xuống Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
