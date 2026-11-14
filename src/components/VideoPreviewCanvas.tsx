import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Menu,
  RectangleHorizontal,
  Camera,
  Activity,
  Grid,
  ZoomIn,
} from 'lucide-react';
import {
  TimelineClip,
  GlobalAdjustmentLayer,
  formatTimecode,
  parseTimecodeInput,
  interpolateClipAtPlayhead,
  computeObjectFitContainRect,
  snapPreviewScaleToFrame,
  extractFlagIsoCode,
  getFlagGraphicDataUrl,
  findGraphicBadgeByIconOrText,
  detectAspectRatioFromDimensions,
  resolveEffectiveClipAspectRatio,
  computeWavingFlagSlices,
  computeStickerMotionTransform,
} from '../utils/timelineEngine';

const flagCanvasImageCache: Record<string, HTMLImageElement> = {};
function getOrCreateFlagCanvasImage(
  isoOrEmoji: string,
  onLoadCallback?: () => void
): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  const iso = (extractFlagIsoCode(isoOrEmoji) || isoOrEmoji || 'VN').toUpperCase().slice(0, 2);
  if (flagCanvasImageCache[iso]) {
    return flagCanvasImageCache[iso];
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  if (onLoadCallback) {
    img.onload = onLoadCallback;
  }
  img.src = getFlagGraphicDataUrl(iso);
  flagCanvasImageCache[iso] = img;
  return img;
}

export type AspectRatioOption =
  | 'original'
  | '16:9'
  | '9:16'
  | '1:1'
  | '4:3'
  | '3:4'
  | '21:9'
  | '2.35:1'
  | '1.85:1'
  | '2:1'
  | '5.8"';
export type PreviewQualityOption = 'full' | 'half' | 'quarter';

export const ASPECT_RATIO_PRESETS: Array<{
  id: AspectRatioOption;
  label: string;
  badge: string;
}> = [
  { id: 'original', label: 'Tỉ lệ gốc', badge: 'Gốc' },
  { id: '16:9', label: '16:9 (YouTube / Màn hình ngang)', badge: 'HD' },
  { id: '9:16', label: '9:16 (TikTok / Shorts / Reels)', badge: 'Viral' },
  { id: '1:1', label: '1:1 (Vuông Instagram / FB)', badge: 'Square' },
  { id: '4:3', label: '4:3 (TV Cổ điển / IMAX)', badge: 'Classic' },
  { id: '3:4', label: '3:4 (Chân dung Xiaohongshu)', badge: 'Portrait' },
  { id: '21:9', label: '21:9 (Điện ảnh UltraWide)', badge: 'Cinema' },
  { id: '2.35:1', label: '2.35:1 (Anamorphic Widescreen)', badge: 'Scope' },
  { id: '1.85:1', label: '1.85:1 (Phim chiếu rạp Hollywood)', badge: 'Flat' },
  { id: '2:1', label: '2:1 (Netflix Univisium)', badge: 'Stream' },
  { id: '5.8"', label: '5.8" (Toàn màn hình iPhone)', badge: 'Mobile' },
];

interface VideoPreviewCanvasProps {
  isMobile?: boolean;
  hideTopBar?: boolean;
  hideBottomControls?: boolean;
  playheadSec: number;
  totalDurationSec: number;
  fps: number;
  isPlaying: boolean;
  aspectRatio: AspectRatioOption;
  previewQuality?: PreviewQualityOption;
  selectedClipId?: string | null;
  selectedClip?: TimelineClip | null;
  activeVideoClip?: TimelineClip;
  prevVideoClip?: TimelineClip;
  nextVideoClip?: TimelineClip;
  activeSubtitleClip?: TimelineClip;
  activeAudioClip?: TimelineClip;
  activeOverlayClip?: TimelineClip;
  activeClipsAtPlayhead?: TimelineClip[];
  allClips?: TimelineClip[];
  videoTrackHidden?: boolean;
  videoTrackMuted?: boolean;
  textTrackHidden?: boolean;
  overlayTrackHidden?: boolean;
  audioTrackMuted?: boolean;
  globalAdjustments?: GlobalAdjustmentLayer;
  blurredPadding916?: boolean;
  antiDetectSpoof?: boolean;
  onTogglePlay: () => void;
  onStepFrame: (deltaFrames: number) => void;
  onSeekPlayhead?: (sec: number) => void;
  onJumpToTimecode?: (sec: number) => void;
  onAspectRatioChange: (ratio: AspectRatioOption) => void;
  onDetectedClipDimensions?: (
    clipId: string,
    width: number,
    height: number,
    detectedRatio: AspectRatioOption
  ) => void;
  onPreviewQualityChange?: (quality: PreviewQualityOption) => void;
  onSelectClipFromCanvas?: (clipId: string) => void;
  onUpdateClipPosition?: (posX: number, posY: number) => void;
  onDirectTransformChange?: (
    posX: number,
    posY: number,
    scale?: number,
    rotation?: number,
    flipH?: boolean,
    flipV?: boolean
  ) => void;
  onUpdateSpecificClipTransform?: (
    clipId: string,
    posX: number,
    posY: number,
    scale?: number,
    rotation?: number,
    flipH?: boolean,
    flipV?: boolean
  ) => void;
  onCanvasDragStart?: () => void;
  onExportStillFrame?: () => void;
  onUpdateClipText?: (clipId: string, newText: string, newSubText?: string) => void;
  onSplitAtPlayhead?: () => void;
  onDeleteSelected?: () => void;
  onQuickFlipH?: () => void;
  onQuickFlipV?: () => void;
  onQuickRotate90?: () => void;
  onQuickAddText?: () => void;
  onQuickAddSticker?: (badgeIcon?: string, label?: string) => void;
  onOpenTextEditor?: (clipId: string) => void;
  language?: 'vi' | 'en';
  canvasRefExternal?: React.RefObject<HTMLCanvasElement | null>;
  exportDimensionsOverride?: { width: number; height: number } | null;
}

const FILTER_PRESET_CSS: Record<string, string> = {
  none: '',
  teal_orange: 'contrast(118%) saturate(135%) hue-rotate(-8deg)',
  cyberpunk: 'contrast(125%) saturate(165%) hue-rotate(22deg)',
  kodak_2383: 'contrast(128%) saturate(122%) sepia(14%) brightness(98%)',
  matrix_green: 'contrast(124%) saturate(130%) hue-rotate(55deg) brightness(96%)',
  anamorphic_blue: 'contrast(120%) saturate(118%) hue-rotate(-24deg) brightness(102%)',
  imax_hdr: 'contrast(132%) saturate(148%) brightness(104%)',
  noir: 'grayscale(100%) contrast(135%) brightness(95%)',
  noir_bw: 'grayscale(100%) contrast(135%) brightness(95%)',
  leica_mono: 'grayscale(100%) contrast(160%) brightness(92%)',
  ilford_hp5: 'grayscale(100%) contrast(112%) brightness(104%) sepia(8%)',
  silver_selenium: 'grayscale(90%) contrast(128%) hue-rotate(185deg) brightness(98%)',
  vintage: 'sepia(45%) contrast(92%) brightness(104%) saturate(85%)',
  vivid: 'contrast(115%) saturate(155%) brightness(105%)',
  food_warm: 'saturate(145%) contrast(108%) sepia(18%)',
  fuji_velvia: 'contrast(122%) saturate(168%) hue-rotate(6deg)',
  golden_hour: 'sepia(32%) saturate(150%) contrast(110%) brightness(105%)',
  cafe_latte: 'sepia(28%) saturate(78%) contrast(96%) brightness(106%)',
  tropical_vibe: 'saturate(158%) contrast(112%) hue-rotate(-14deg) brightness(104%)',
};

export const VideoPreviewCanvas: React.FC<VideoPreviewCanvasProps> = ({
  isMobile = false,
  hideTopBar = false,
  hideBottomControls = false,
  playheadSec,
  totalDurationSec,
  fps,
  isPlaying,
  aspectRatio,
  previewQuality = 'full',
  selectedClipId,
  selectedClip,
  activeVideoClip,
  prevVideoClip,
  nextVideoClip,
  activeSubtitleClip,
  activeAudioClip,
  activeOverlayClip,
  activeClipsAtPlayhead = [],
  allClips = [],
  videoTrackHidden = false,
  videoTrackMuted = false,
  textTrackHidden = false,
  overlayTrackHidden = false,
  audioTrackMuted = false,
  globalAdjustments,
  blurredPadding916 = false,
  onTogglePlay,
  onStepFrame,
  onSeekPlayhead,
  onJumpToTimecode,
  onAspectRatioChange,
  onDetectedClipDimensions,
  onPreviewQualityChange,
  onSelectClipFromCanvas,
  onUpdateClipPosition,
  onDirectTransformChange,
  onUpdateSpecificClipTransform,
  onCanvasDragStart,
  onExportStillFrame,
  onUpdateClipText,
  onSplitAtPlayhead,
  onDeleteSelected,
  onQuickFlipH,
  onQuickFlipV,
  onQuickRotate90,
  onQuickAddText,
  onQuickAddSticker,
  onOpenTextEditor,
  language = 'vi',
  canvasRefExternal,
  exportDimensionsOverride = null,
}) => {
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = canvasRefExternal || internalCanvasRef;
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const nextVideoElRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoElRef = useRef<HTMLVideoElement | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const [canvasContextMenu, setCanvasContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [flagTick, setFlagTick] = useState(0);
  const [stickerAnimSec, setStickerAnimSec] = useState(0);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasFrameRef = useRef<HTMLDivElement | null>(null);
  const subtitleBoundsRef = useRef<{
    clipId: string;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const canvasItemsBoundsRef = useRef<
    Array<{
      clipId: string;
      x: number;
      y: number;
      w: number;
      h: number;
      origPosX: number;
      origPosY: number;
      origScale: number;
    }>
  >([]);
  const overlayBoundsRef = useRef<{
    clipId: string;
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const [stageSize, setStageSize] = useState<{ w: number; h: number }>({ w: 640, h: 360 });
  const [loadedUrl, setLoadedUrl] = useState<string>('');
  const [loadedNextUrl, setLoadedNextUrl] = useState<string>('');
  const [loadedPipUrl, setLoadedPipUrl] = useState<string>('');
  const [loadedAudioUrl, setLoadedAudioUrl] = useState<string>('');
  const outgoingClipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outgoingClipIdRef = useRef<string>('');
  const currentClipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentClipIdRef = useRef<string>('');
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showPlayerMenu, setShowPlayerMenu] = useState(false);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  // CapCut PC Player Overlays & Zoom
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [showScopes, setShowScopes] = useState(false);
  const [playerZoom, setPlayerZoom] = useState<'fit' | '50' | '100' | '200' | '300' | '400' | '500'>('fit');
  const [showCanvasBoundingBox, setShowCanvasBoundingBox] = useState(false);
  const [draggingCanvasObj, setDraggingCanvasObj] = useState<{
    clipId: string;
    mode: 'move' | 'resize' | 'rotate';
    handle?: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
    startX: number;
    startY: number;
    origPosX: number;
    origPosY: number;
    origScale: number;
    origRotation?: number;
  } | null>(null);
  const [liveDragTransform, setLiveDragTransform] = useState<{
    clipId: string;
    posX: number;
    posY: number;
    scale: number;
    rotation?: number;
  } | null>(null);
  const pendingDragTransformRef = useRef<{
    clipId: string;
    posX: number;
    posY: number;
    scale: number;
    rotation?: number;
  } | null>(null);
  const lastAutoDetectedUrlRef = useRef<string>('');
  const dragRafIdRef = useRef<number | null>(null);
  const bgCacheCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgCacheKeyRef = useRef<string>('');
  const lastValidVideoFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastValidVideoUrlRef = useRef<string>('');
  const mediaThumbImageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const [videoFrameReadyTick, setVideoFrameReadyTick] = useState(0);
  const [showCenterCrosshair, setShowCenterCrosshair] = useState<{ x: boolean; y: boolean }>({
    x: false,
    y: false,
  });
  const [isSnappedToFrame, setIsSnappedToFrame] = useState(false);
  const snapFlashTimerRef = useRef<number | null>(null);

  const getOrLoadMediaImage = (url?: string): HTMLImageElement | null => {
    if (!url) return null;
    const cached = mediaThumbImageCacheRef.current[url];
    if (cached) {
      return cached.complete && cached.naturalWidth > 0 ? cached : null;
    }
    const img = new Image();
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      setVideoFrameReadyTick((t) => t + 1);
    };
    img.src = url;
    mediaThumbImageCacheRef.current[url] = img;
    return img.complete && img.naturalWidth > 0 ? img : null;
  };

  const triggerSnapFrameFeedback = (active: boolean) => {
    setIsSnappedToFrame(active);
    if (snapFlashTimerRef.current) {
      window.clearTimeout(snapFlashTimerRef.current);
      snapFlashTimerRef.current = null;
    }
    if (active) {
      snapFlashTimerRef.current = window.setTimeout(() => {
        setIsSnappedToFrame(false);
      }, 1500);
    }
  };

  // Hide the canvas scale/resize bounding box when no clip is selected
  useEffect(() => {
    if (!selectedClipId) {
      setShowCanvasBoundingBox(false);
      setIsSnappedToFrame(false);
    }
  }, [selectedClipId]);

  // Close canvas bounding box & handles when clicking/tapping outside the canvas stage (e.g. timeline, toolbar, inspector)
  useEffect(() => {
    if (!showCanvasBoundingBox) return;
    const handleOutsidePointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (stageRef.current && target && !stageRef.current.contains(target)) {
        setShowCanvasBoundingBox(false);
      }
    };
    window.addEventListener('mousedown', handleOutsidePointer, true);
    window.addEventListener('touchstart', handleOutsidePointer, true);
    return () => {
      window.removeEventListener('mousedown', handleOutsidePointer, true);
      window.removeEventListener('touchstart', handleOutsidePointer, true);
    };
  }, [showCanvasBoundingBox]);

  // Timecode Inline Input State (Page 44)
  const [isEditingTimecode, setIsEditingTimecode] = useState(false);
  const [timecodeInputVal, setTimecodeInputVal] = useState('');

  // Observe stage container size to lock exact aspect ratio without stretching on maximize/fullscreen
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 20 && rect.height > 20) {
        setStageSize((prev) =>
          Math.abs(prev.w - rect.width) > 0.5 || Math.abs(prev.h - rect.height) > 0.5
            ? { w: rect.width, h: rect.height }
            : prev
        );
      }
    };
    updateSize();
    const rafId = requestAnimationFrame(updateSize);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.width > 20 && entry.contentRect.height > 20) {
        const { width, height } = entry.contentRect;
        setStageSize((prev) =>
          Math.abs(prev.w - width) > 0.5 || Math.abs(prev.h - height) > 0.5
            ? { w: width, h: height }
            : prev
        );
      } else {
        updateSize();
      }
    });
    observer.observe(el);
    const handleFsOrResize = () => {
      updateSize();
      requestAnimationFrame(updateSize);
    };
    window.addEventListener('resize', handleFsOrResize);
    document.addEventListener('fullscreenchange', handleFsOrResize);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', handleFsOrResize);
      document.removeEventListener('fullscreenchange', handleFsOrResize);
    };
  }, []);

  // Snapshot outgoing clip frame whenever activeVideoClip.id changes across a concat seam
  useEffect(() => {
    const newId = activeVideoClip?.id || '';
    if (newId && currentClipIdRef.current && currentClipIdRef.current !== newId) {
      const srcCanvas = lastValidVideoFrameCanvasRef.current;
      if (srcCanvas && srcCanvas.width > 0 && srcCanvas.height > 0) {
        if (!outgoingClipCanvasRef.current) {
          outgoingClipCanvasRef.current = document.createElement('canvas');
        }
        const outC = outgoingClipCanvasRef.current;
        outC.width = srcCanvas.width;
        outC.height = srcCanvas.height;
        const oCtx = outC.getContext('2d');
        if (oCtx) {
          oCtx.drawImage(srcCanvas, 0, 0);
          outgoingClipIdRef.current = currentClipIdRef.current;
        }
      }
    }
    if (newId) {
      currentClipIdRef.current = newId;
    }
  }, [activeVideoClip?.id]);

  // Sync offscreen <video> element with real uploaded video blob URL
  useEffect(() => {
    const vid = videoElRef.current;
    if (!vid) return;
    const isImageClip =
      Boolean(activeVideoClip?.mediaUrl?.startsWith('data:image')) ||
      /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(activeVideoClip?.name || '');
    const url = isImageClip ? '' : activeVideoClip?.mediaUrl || '';
    if (url !== loadedUrl) {
      setLoadedUrl(url);
      if (url) {
        if (url.startsWith('blob:') || url.startsWith('data:')) {
          vid.removeAttribute('crossorigin');
        } else {
          vid.crossOrigin = 'anonymous';
        }
        vid.preload = 'auto';
        vid.src = url;
        vid.load();
      } else {
        vid.pause();
        vid.removeAttribute('src');
        vid.load();
      }
    }
  }, [activeVideoClip?.mediaUrl, activeVideoClip?.name, loadedUrl]);

  // Pre-buffer upcoming nextVideoClip on Track 0 for zero-latency concat cuts
  useEffect(() => {
    const nextVid = nextVideoElRef.current;
    if (!nextVid) return;
    const isImageClip =
      Boolean(nextVideoClip?.mediaUrl?.startsWith('data:image')) ||
      /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(nextVideoClip?.name || '');
    const nextUrl = isImageClip ? '' : nextVideoClip?.mediaUrl || '';
    if (nextUrl !== loadedNextUrl) {
      setLoadedNextUrl(nextUrl);
      if (nextUrl) {
        if (nextUrl.startsWith('blob:') || nextUrl.startsWith('data:')) {
          nextVid.removeAttribute('crossorigin');
        } else {
          nextVid.crossOrigin = 'anonymous';
        }
        nextVid.preload = 'auto';
        nextVid.muted = true;
        nextVid.src = nextUrl;
        nextVid.load();
      } else {
        nextVid.pause();
        nextVid.removeAttribute('src');
        nextVid.load();
      }
    }
    if (nextUrl && nextVideoClip && nextVid.readyState >= 1) {
      const targetIn = Math.max(0, nextVideoClip.sourceIn || 0);
      if (Math.abs(nextVid.currentTime - targetIn) > 0.08) {
        try {
          nextVid.currentTime = targetIn;
        } catch {
          // Ignore seek before metadata ready
        }
      }
    }
  }, [nextVideoClip, loadedNextUrl]);

  // Sync dedicated <video> element for PIP Overlay Track (trackIndex >= 3)
  useEffect(() => {
    const pipVid = pipVideoElRef.current;
    if (!pipVid) return;
    const isImageOverlay =
      Boolean(activeOverlayClip?.mediaUrl?.startsWith('data:image')) ||
      /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(activeOverlayClip?.name || '');
    const pipUrl = isImageOverlay ? '' : activeOverlayClip?.mediaUrl || '';
    if (pipUrl !== loadedPipUrl) {
      setLoadedPipUrl(pipUrl);
      if (pipUrl) {
        if (pipUrl.startsWith('blob:') || pipUrl.startsWith('data:')) {
          pipVid.removeAttribute('crossorigin');
        } else {
          pipVid.crossOrigin = 'anonymous';
        }
        pipVid.preload = 'auto';
        pipVid.src = pipUrl;
        pipVid.load();
      } else {
        pipVid.pause();
        pipVid.removeAttribute('src');
        pipVid.load();
      }
    }
    if (!pipUrl || !activeOverlayClip || overlayTrackHidden || activeOverlayClip.disabled) {
      if (!pipVid.paused) pipVid.pause();
      return;
    }
    const pipElapsed = Math.max(0, playheadSec - activeOverlayClip.startTime);
    const pipSpd = Math.max(0.25, Math.min(4.0, activeOverlayClip.speed || 1));
    const pipTargetTime = (activeOverlayClip.sourceIn || 0) + pipElapsed * pipSpd;
    if (Math.abs(pipVid.playbackRate - pipSpd) > 0.01) {
      pipVid.playbackRate = pipSpd;
    }
    const pipVol = Math.max(0, Math.min(1, (activeOverlayClip.volume ?? 100) / 100));
    pipVid.muted = Boolean(videoTrackMuted || activeOverlayClip.muted || pipVol <= 0.001);
    pipVid.volume = pipVol;
    const pipTol = isPlaying ? 0.3 : 0.08;
    if (Math.abs(pipVid.currentTime - pipTargetTime) > pipTol) {
      try {
        pipVid.currentTime = pipTargetTime;
      } catch {
        // Ignore seek error
      }
    }
    if (isPlaying && pipVid.paused) {
      pipVid.play().catch(() => {});
    } else if (!isPlaying && !pipVid.paused) {
      pipVid.pause();
    }
  }, [playheadSec, isPlaying, activeOverlayClip, overlayTrackHidden, videoTrackMuted, loadedPipUrl]);

  // Preload and cache active video clip thumbnail immediately to eliminate any black flicker
  useEffect(() => {
    if (activeVideoClip?.thumbnailUrl) {
      getOrLoadMediaImage(activeVideoClip.thumbnailUrl);
    }
  }, [activeVideoClip?.thumbnailUrl]);

  // Continuous 60-FPS video frame repaint while playing a real video clip
  useEffect(() => {
    if ((!isPlaying && !exportDimensionsOverride) || !activeVideoClip?.mediaUrl) return;
    let rafId = 0;
    const loop = () => {
      setVideoFrameReadyTick((t) => (t + 1) % 1000000);
      rafId = window.requestAnimationFrame(loop);
    };
    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, exportDimensionsOverride, activeVideoClip?.mediaUrl]);

  // Sync hidden <video> time, speed, and audio volume
  useEffect(() => {
    const vid = videoElRef.current;
    if (!vid || !activeVideoClip?.mediaUrl) return;

    const clipElapsed = Math.max(0, playheadSec - activeVideoClip.startTime);
    const rawOffset = activeVideoClip.reversed
      ? Math.max(
          0,
          activeVideoClip.sourceIn +
            (activeVideoClip.duration - clipElapsed) * activeVideoClip.speed
        )
      : activeVideoClip.sourceIn + clipElapsed * activeVideoClip.speed;

    const rate = Math.max(0.2, Math.min(4.0, activeVideoClip.speed || 1));
    if (Math.abs(vid.playbackRate - rate) > 0.01) {
      vid.playbackRate = rate;
    }

    const interpolated = interpolateClipAtPlayhead(activeVideoClip, playheadSec);
    let vol = (interpolated.volume ?? 100) / 100;
    if (
      activeVideoClip.fadeIn &&
      activeVideoClip.fadeIn > 0 &&
      clipElapsed < activeVideoClip.fadeIn
    ) {
      vol *= clipElapsed / activeVideoClip.fadeIn;
    }
    const remaining = activeVideoClip.duration - clipElapsed;
    if (
      activeVideoClip.fadeOut &&
      activeVideoClip.fadeOut > 0 &&
      remaining < activeVideoClip.fadeOut
    ) {
      vol *= Math.max(0, remaining / activeVideoClip.fadeOut);
    }
    if (activeVideoClip.vocalIsolation === 'remove_vocal') {
      vol *= 0.35;
    }
    vid.muted = Boolean(videoTrackMuted || activeVideoClip.muted || vol <= 0.001);
    vid.volume = Math.max(0, Math.min(1, vol));

    const targetOffset =
      Number.isFinite(vid.duration) && vid.duration > 0
        ? Math.max(0, Math.min(rawOffset, Math.max(0, vid.duration - 0.04)))
        : Math.max(0, rawOffset);

    const isExportPlaying = vid.dataset.exportPlaying === 'true';
    if (isPlaying || isExportPlaying) {
      // During active playback, never force seek if deviation is within smooth drift tolerance (< 0.5s).
      // Hard seeking on mobile hardware video decoders causes keyframe jumps and severe seek loops ("giật sang giây cũ").
      if (Math.abs(vid.currentTime - targetOffset) > 2.0) {
        try {
          vid.currentTime = Math.max(0.001, targetOffset);
        } catch {
          // Ignore seek before metadata ready
        }
      }
    } else {
      // When paused or scrubbing timeline, perform precise seek
      if (Math.abs(vid.currentTime - targetOffset) > 0.04) {
        try {
          vid.currentTime = Math.max(0.001, targetOffset);
        } catch {
          // Ignore seek before metadata ready
        }
      }
    }

    if ((isPlaying || isExportPlaying) && vid.paused && !activeVideoClip.reversed) {
      const p = vid.play();
      if (p !== undefined) {
        p.catch((err: any) => {
          if (err && err.name === 'NotAllowedError') {
            vid.muted = true;
            vid.play().catch(() => {});
          }
        });
      }
    } else if ((!isPlaying && !isExportPlaying || activeVideoClip.reversed) && !vid.paused) {
      vid.pause();
    }
  }, [playheadSec, isPlaying, activeVideoClip, videoTrackMuted]);

  // Ambient animation loop removed: stickers and flags are clean and static for maximum performance

  // Sync hidden <audio> element for Audio Track (trackIndex === 1) + Audio Ducking
  useEffect(() => {
    const aud = audioElRef.current;
    if (!aud) return;
    const url = activeAudioClip?.mediaUrl || '';
    if (url !== loadedAudioUrl) {
      setLoadedAudioUrl(url);
      if (url) {
        aud.src = url;
        aud.load();
      } else {
        aud.removeAttribute('src');
      }
    }
    if (!url || !activeAudioClip) {
      if (!aud.paused) aud.pause();
      return;
    }
    const elapsed = Math.max(0, playheadSec - activeAudioClip.startTime);
    const targetTime = activeAudioClip.sourceIn + elapsed * (activeAudioClip.speed || 1);
    aud.muted = Boolean(audioTrackMuted || activeAudioClip.muted);
    let vol = (activeAudioClip.volume ?? 100) / 100;
    // Audio Ducking: lower music by -15dB when subtitle/speech is active
    if (activeAudioClip.audioDucking && activeSubtitleClip) {
      vol *= 0.25;
    }
    aud.volume = Math.max(0, Math.min(1, vol));
    if (Math.abs(aud.currentTime - targetTime) > 0.22) {
      try {
        aud.currentTime = targetTime;
      } catch {
        // Ignore seek error
      }
    }
    if (isPlaying && aud.paused) {
      aud.play().catch(() => {});
    } else if (!isPlaying && !aud.paused) {
      aud.pause();
    }
  }, [playheadSec, isPlaying, activeAudioClip, activeSubtitleClip, audioTrackMuted, loadedAudioUrl]);

  const primaryTrack0Clip =
    (allClips || []).find(
      (c) =>
        c.trackIndex === 0 &&
        !c.disabled &&
        ((c.mediaWidth && c.mediaHeight) || (c.nativeAspectRatio && c.nativeAspectRatio !== 'original') || Boolean(c.mediaUrl))
    ) ||
    activeClipsAtPlayhead.find(
      (c) =>
        c.trackIndex === 0 &&
        !c.disabled &&
        ((c.mediaWidth && c.mediaHeight) || (c.nativeAspectRatio && c.nativeAspectRatio !== 'original'))
    ) ||
    activeVideoClip;

  const effectiveAspectRatio = resolveEffectiveClipAspectRatio(
    aspectRatio,
    primaryTrack0Clip,
    activeClipsAtPlayhead
  );

  const getAspectNumericRatio = (): number => {
    switch (effectiveAspectRatio) {
      case '9:16':
        return 9 / 16;
      case '1:1':
        return 1;
      case '4:3':
        return 4 / 3;
      case '3:4':
        return 3 / 4;
      case '21:9':
        return 21 / 9;
      case '2.35:1':
        return 2.35;
      case '1.85:1':
        return 1.85;
      case '2:1':
        return 2;
      case '5.8"':
        return 9 / 19.5;
      case '16:9':
      default:
        return 16 / 9;
    }
  };

  const getCanvasDimensions = () => {
    if (
      exportDimensionsOverride &&
      exportDimensionsOverride.width >= 320 &&
      exportDimensionsOverride.height >= 240
    ) {
      return {
        width: exportDimensionsOverride.width,
        height: exportDimensionsOverride.height,
      };
    }
    const scaleMult = previewQuality === 'full' ? 1.0 : previewQuality === 'half' ? 0.65 : 0.45;
    const ratioAnchorClip = primaryTrack0Clip || activeVideoClip;
    if (
      aspectRatio === 'original' &&
      ratioAnchorClip &&
      typeof ratioAnchorClip.mediaWidth === 'number' &&
      ratioAnchorClip.mediaWidth > 0 &&
      typeof ratioAnchorClip.mediaHeight === 'number' &&
      ratioAnchorClip.mediaHeight > 0
    ) {
      const natRatio = ratioAnchorClip.mediaWidth / ratioAnchorClip.mediaHeight;
      const toEven = (n: number) => Math.max(2, Math.round(n / 2) * 2);
      const baseShort = 1080 * scaleMult;
      if (natRatio >= 1) {
        return { width: toEven(baseShort * natRatio), height: toEven(baseShort) };
      } else {
        return { width: toEven(baseShort), height: toEven(baseShort / natRatio) };
      }
    }
    switch (effectiveAspectRatio) {
      case '9:16':
        return { width: Math.round(1080 * scaleMult), height: Math.round(1920 * scaleMult) };
      case '1:1':
        return { width: Math.round(1080 * scaleMult), height: Math.round(1080 * scaleMult) };
      case '4:3':
        return { width: Math.round(1440 * scaleMult), height: Math.round(1080 * scaleMult) };
      case '3:4':
        return { width: Math.round(1080 * scaleMult), height: Math.round(1440 * scaleMult) };
      case '21:9':
        return { width: Math.round(2520 * scaleMult), height: Math.round(1080 * scaleMult) };
      case '2.35:1':
        return { width: Math.round(2538 * scaleMult), height: Math.round(1080 * scaleMult) };
      case '1.85:1':
        return { width: Math.round(1998 * scaleMult), height: Math.round(1080 * scaleMult) };
      case '2:1':
        return { width: Math.round(2160 * scaleMult), height: Math.round(1080 * scaleMult) };
      case '5.8"':
        return { width: Math.round(1080 * scaleMult), height: Math.round(2340 * scaleMult) };
      case '16:9':
      default:
        return { width: Math.round(1920 * scaleMult), height: Math.round(1080 * scaleMult) };
    }
  };

  const { width: canvasW, height: canvasH } = getCanvasDimensions();
  const availW = Math.max(120, stageSize.w - (isMobile || hideTopBar ? 0 : 16));
  const availH = Math.max(90, stageSize.h - (isMobile || hideTopBar ? 0 : 16));
  const containedStageRect = computeObjectFitContainRect(availW, availH, canvasW, canvasH);
  const useWideStageFill = false;
  const fittedBoxW = Math.max(64, containedStageRect.width);
  const fittedBoxH = Math.max(36, containedStageRect.height);

  // Render real-time frame onto <canvas> at full native / export pixel density
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const dpiScale = Math.max(0.5, Math.max(w, h) / 1920);
    const isHighResExport = Boolean(exportDimensionsOverride);

    const isDraggingOverlayOrText = Boolean(
      liveDragTransform &&
        activeVideoClip &&
        liveDragTransform.clipId !== activeVideoClip.id
    );
    // Discover any Effect or Filter clips on overlay tracks (Track 3+) active at playhead
    const overlayEffectClip = !overlayTrackHidden
      ? activeClipsAtPlayhead.find(
          (c) =>
            c.trackIndex >= 3 &&
            !c.disabled &&
            c.visualEffect &&
            c.visualEffect !== 'none'
        )
      : undefined;
    const overlayFilterClip = !overlayTrackHidden
      ? activeClipsAtPlayhead.find(
          (c) =>
            c.trackIndex >= 3 &&
            !c.disabled &&
            c.filterPreset &&
            c.filterPreset !== 'none'
        )
      : undefined;

    const effectiveVisualEffect =
      overlayEffectClip?.visualEffect ||
      (activeVideoClip?.visualEffect && activeVideoClip.visualEffect !== 'none'
        ? activeVideoClip.visualEffect
        : 'none');
    const effectiveFilterPreset =
      overlayFilterClip?.filterPreset ||
      (activeVideoClip?.filterPreset && activeVideoClip.filterPreset !== 'none'
        ? activeVideoClip.filterPreset
        : 'none');

    const currentBgKey = `${w}x${h}:${playheadSec.toFixed(3)}:${activeVideoClip?.id || 'none'}:${
      activeVideoClip?.posX || 0
    }:${activeVideoClip?.posY || 0}:${activeVideoClip?.scale ?? 100}:${
      activeVideoClip?.rotation || 0
    }:${activeVideoClip?.cropLeft || 0}:${activeVideoClip?.cropTop || 0}:${
      activeVideoClip?.cropRight || 0
    }:${activeVideoClip?.cropBottom || 0}:${activeVideoClip?.cropRotateDeg || 0}:${
      activeVideoClip?.flipH ? 1 : 0
    }:${activeVideoClip?.flipV ? 1 : 0}:${activeVideoClip?.brightness || 0}:${
      activeVideoClip?.contrast || 0
    }:${activeVideoClip?.saturation || 0}:${effectiveFilterPreset}:${effectiveVisualEffect}:${
      activeVideoClip?.transitionType || 'none'
    }:${videoTrackHidden ? 1 : 0}`;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = isDraggingOverlayOrText || isMobile ? 'low' : 'high';

    if (
      isDraggingOverlayOrText &&
      bgCacheCanvasRef.current &&
      bgCacheKeyRef.current === currentBgKey &&
      bgCacheCanvasRef.current.width === w &&
      bgCacheCanvasRef.current.height === h
    ) {
      ctx.drawImage(bgCacheCanvasRef.current, 0, 0);
    } else {
      ctx.fillStyle = '#07080B';
      ctx.fillRect(0, 0, w, h);

      if (activeVideoClip && !videoTrackHidden && !activeVideoClip.disabled) {
      const clipElapsed = Math.max(0, playheadSec - activeVideoClip.startTime);
      const interpolated = interpolateClipAtPlayhead(activeVideoClip, playheadSec);

      const gBri = globalAdjustments?.enabled ? globalAdjustments.brightness : 0;
      const gCon = globalAdjustments?.enabled ? globalAdjustments.contrast : 0;
      const gSat = globalAdjustments?.enabled ? globalAdjustments.saturation : 0;
      const gWarmth = globalAdjustments?.enabled ? globalAdjustments.warmth : 0;
      const gSharpen = globalAdjustments?.enabled ? globalAdjustments.sharpen : 0;

      const totalSharpen =
        (activeVideoClip.sharpen || 0) +
        gSharpen +
        (activeVideoClip.aiUpscale ? 30 : 0) +
        0;

      const sharpenContrastBoost = Math.min(22, totalSharpen * 0.18);
      const sharpenSatBoost = Math.min(12, totalSharpen * 0.08);

      const bri =
        100 +
        (activeVideoClip.brightness || 0) +
        (activeVideoClip.retouchBrighten || 0) * 0.25 +
        (activeVideoClip.hslBri || 0) * 0.4 +
        gBri;
      const con = 100 + (activeVideoClip.contrast || 0) + gCon + sharpenContrastBoost;
      const sat =
        100 +
        (activeVideoClip.saturation || 0) +
        (activeVideoClip.hslSat || 0) * 0.5 +
        gSat +
        sharpenSatBoost;
      const warmth = (activeVideoClip.warmth || 0) + gWarmth;
      const hslHue = activeVideoClip.hslHue || 0;
      const motionBlurVal = activeVideoClip.motionBlur ?? activeVideoClip.motionBlurAmount ?? 0;
      const presetCss = FILTER_PRESET_CSS[effectiveFilterPreset] || '';
      const blurFilter = activeVideoClip.blurBg
        ? 'blur(3px)'
        : effectiveVisualEffect === 'mosaic_blur'
        ? 'blur(6px)'
        : motionBlurVal > 0
        ? `blur(${(motionBlurVal * 0.04).toFixed(1)}px)`
        : '';

      const sepiaWarmth =
        warmth > 0
          ? `sepia(${Math.min(60, warmth)}%)`
          : warmth < 0
          ? `hue-rotate(${warmth * 0.8}deg)`
          : '';
      const hueFilter = hslHue !== 0 ? `hue-rotate(${hslHue}deg)` : '';

      const combinedFilter = [
        Math.abs(bri - 100) >= 0.5 ? `brightness(${Math.max(10, bri).toFixed(1)}%)` : '',
        Math.abs(con - 100) >= 0.5 ? `contrast(${Math.max(10, con).toFixed(1)}%)` : '',
        Math.abs(sat - 100) >= 0.5 ? `saturate(${Math.max(0, sat).toFixed(1)}%)` : '',
        sepiaWarmth,
        hueFilter,
        presetCss,
        blurFilter,
      ]
        .filter(Boolean)
        .join(' ');

      const vid = videoElRef.current;
      const nextVid = nextVideoElRef.current;
      const isMainV1ImageClip =
        Boolean(activeVideoClip.mediaUrl?.startsWith('data:image')) ||
        /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(activeVideoClip.name || '');

      const hasRealVideoFrame = Boolean(
        !isMainV1ImageClip && activeVideoClip.mediaUrl && vid && vid.readyState >= 2 && vid.videoWidth > 0
      );
      const hasPrebufferedNextFrame = Boolean(
        !hasRealVideoFrame &&
          !isMainV1ImageClip &&
          activeVideoClip.mediaUrl &&
          nextVid &&
          loadedNextUrl === activeVideoClip.mediaUrl &&
          nextVid.readyState >= 2 &&
          nextVid.videoWidth > 0
      );

      const activeVidSource = hasRealVideoFrame
        ? vid
        : hasPrebufferedNextFrame
        ? nextVid
        : null;

      if (activeVidSource && activeVidSource.readyState >= 2 && activeVideoClip.mediaUrl) {
        try {
          const vw = Math.max(1, activeVidSource.videoWidth);
          const vh = Math.max(1, activeVidSource.videoHeight);
          if (!lastValidVideoFrameCanvasRef.current) {
            lastValidVideoFrameCanvasRef.current = document.createElement('canvas');
          }
          const cacheCanvas = lastValidVideoFrameCanvasRef.current;
          if (cacheCanvas.width !== vw || cacheCanvas.height !== vh) {
            cacheCanvas.width = vw;
            cacheCanvas.height = vh;
          }
          const cCtx = cacheCanvas.getContext('2d');
          if (cCtx) {
            cCtx.drawImage(activeVidSource, 0, 0, vw, vh);
            lastValidVideoUrlRef.current = activeVideoClip.mediaUrl;
          }
        } catch {
          // Ignore frame cache errors
        }
      }

      const cachedVideoFrame =
        !activeVidSource &&
        activeVideoClip.mediaUrl &&
        lastValidVideoFrameCanvasRef.current &&
        lastValidVideoFrameCanvasRef.current.width > 0
          ? lastValidVideoFrameCanvasRef.current
          : null;

      const fallbackThumbImg = getOrLoadMediaImage(
        activeVideoClip.thumbnailUrl ||
          activeVideoClip.thumbnailDataUrl ||
          (isMainV1ImageClip ? activeVideoClip.mediaUrl : undefined)
      );

      const drawableMediaSource: CanvasImageSource | null =
        activeVidSource && activeVidSource.readyState >= 2
          ? activeVidSource
          : fallbackThumbImg
          ? fallbackThumbImg
          : cachedVideoFrame
          ? cachedVideoFrame
          : activeVidSource && activeVidSource.readyState >= 1
          ? activeVidSource
          : null;

      const drawableMediaWidth =
        activeVidSource
          ? activeVidSource.videoWidth || w
          : fallbackThumbImg
          ? fallbackThumbImg.naturalWidth || w
          : cachedVideoFrame
          ? cachedVideoFrame.width
          : activeVideoClip.mediaWidth || w;

      const drawableMediaHeight =
        activeVidSource
          ? activeVidSource.videoHeight || h
          : fallbackThumbImg
          ? fallbackThumbImg.naturalHeight || h
          : cachedVideoFrame
          ? cachedVideoFrame.height
          : activeVideoClip.mediaHeight || h;

      // Render blurred backdrop ONLY when explicitly enabled by the user (blurredPadding916 or clip.blurBg)
      if (blurredPadding916 || activeVideoClip.blurBg) {
        ctx.save();
        ctx.filter = `${combinedFilter} blur(${Math.round(14 * dpiScale)}px) brightness(65%)`.trim();
        if (drawableMediaSource) {
          ctx.drawImage(drawableMediaSource, -w * 0.08, -h * 0.08, w * 1.16, h * 1.16);
        } else {
          const bgGrad = ctx.createLinearGradient(0, 0, w, h);
          bgGrad.addColorStop(0, '#090D16');
          bgGrad.addColorStop(0.55, activeVideoClip.colorHex || '#0D9488');
          bgGrad.addColorStop(1, '#111827');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.restore();
      }

      if (combinedFilter) {
        ctx.filter = combinedFilter;
      }

      // Transition & Animation In/Out/Combo alpha, offset, scale & rotation
      let transAlpha = 1;
      let transOffsetX = 0;
      let transOffsetY = 0;
      let transScale = 1;
      let animRotationDeg = 0;
      let dualClipTransProgress = 1;
      const transDur = activeVideoClip.transitionDuration || 0.6;
      const tType = activeVideoClip.transitionType || 'none';
      const isDualClipTransActive = tType !== 'none' && clipElapsed < transDur;

      // Resolve outgoing clip frame source (either cached canvas from previous clip or prevVideoClip thumbnail)
      const outgoingSource: CanvasImageSource | null =
        isDualClipTransActive
          ? outgoingClipCanvasRef.current && outgoingClipCanvasRef.current.width > 0
            ? outgoingClipCanvasRef.current
            : prevVideoClip
            ? getOrLoadMediaImage(
                prevVideoClip.thumbnailUrl ||
                  prevVideoClip.thumbnailDataUrl ||
                  (prevVideoClip.mediaUrl?.startsWith('data:image')
                    ? prevVideoClip.mediaUrl
                    : undefined)
              )
            : null
          : null;

      if (isDualClipTransActive) {
        // Ensure at clipElapsed === 0 we show the peak transition effect (p = 0.18..1.0) so static preview at cut start clearly shows the transition
        const p = Math.max(0.18, Math.min(1, (clipElapsed + 0.06) / Math.max(0.15, transDur)));
        dualClipTransProgress = p;

        // Draw Outgoing Clip underneath / alongside Incoming Clip for authentic CapCut Dual-Clip Transitions
        if (outgoingSource) {
          ctx.save();
          let outAlpha = 1;
          let outOffsetX = 0;
          let outOffsetY = 0;
          let outScale = 1;
          if (tType === 'overlay' || tType === 'cross_dissolve') {
            outAlpha = 1;
          } else if (tType === 'slide' || tType === 'slide_left' || tType === 'whip_pan') {
            outOffsetX = -p * w;
          } else if (tType === 'push_up') {
            outOffsetY = -p * h;
          } else if (tType === 'camera' || tType === 'zoom_in') {
            outScale = 1 + p * 0.35;
            outAlpha = 1 - p * 0.35;
          } else if (tType === 'pull_out') {
            outScale = Math.max(0.5, 1 - p * 0.35);
            outAlpha = 1 - p * 0.35;
          } else if (tType === 'black_fade') {
            outAlpha = p < 0.5 ? Math.max(0, 1 - p * 2) : 0;
          }
          ctx.globalAlpha = outAlpha;
          ctx.translate(w / 2 + outOffsetX, h / 2 + outOffsetY);
          ctx.scale(outScale, outScale);
          ctx.drawImage(outgoingSource, -w / 2, -h / 2, w, h);
          ctx.restore();
        }

        if (tType === 'overlay' || tType === 'cross_dissolve') {
          transAlpha = p;
        } else if (tType === 'black_fade') {
          transAlpha = p < 0.5 ? 0 : Math.min(1, (p - 0.5) * 2);
        } else if (tType === 'white_flash' || tType === 'light_flash') {
          transAlpha = p;
        } else if (tType === 'slide' || tType === 'slide_left') {
          transOffsetX = (1 - p) * w * (outgoingSource ? 1.0 : 0.55);
        } else if (tType === 'push_up') {
          transOffsetY = (1 - p) * h * (outgoingSource ? 1.0 : 0.55);
        } else if (tType === 'whip_pan') {
          transOffsetX = (1 - p) * w * 0.85;
          transScale = 1.08;
        } else if (tType === 'camera' || tType === 'zoom_in') {
          transScale = 1.48 - p * 0.48;
          if (outgoingSource) transAlpha = p;
        } else if (tType === 'pull_out') {
          transScale = 0.58 + p * 0.42;
          if (outgoingSource) transAlpha = p;
        } else if (tType === 'spin') {
          animRotationDeg += (1 - p) * 145;
          transScale = 0.55 + p * 0.45;
          if (outgoingSource) transAlpha = p;
        } else if (tType === 'roll_shutter') {
          animRotationDeg += (1 - p) * -75;
          transOffsetY = (1 - p) * h * 0.22;
        } else if (
          tType === 'glitch' ||
          
          tType === 'glitch_transition' ||
          tType === 'rgb_split'
        ) {
          transOffsetX = Math.sin((playheadSec + 0.15) * 95) * (w * 0.05) * (1 - p);
          if (outgoingSource) transAlpha = Math.min(1, 0.35 + p * 0.65);
        }
      }

      const activeAnim =
        activeVideoClip.animIn ||
        activeVideoClip.animationIn ||
        activeVideoClip.animationOut ||
        activeVideoClip.animationCombo ||
        'none';
      const clipRemaining = Math.max(0, activeVideoClip.duration - clipElapsed);

      if (activeAnim === 'fade_in' && clipElapsed < 0.7) {
        transAlpha *= clipElapsed / 0.7;
      } else if (activeAnim === 'zoom_in' && clipElapsed < 0.7) {
        transScale *= 0.62 + (clipElapsed / 0.7) * 0.38;
      } else if (activeAnim === 'slide_up' && clipElapsed < 0.7) {
        transOffsetY += (1 - clipElapsed / 0.7) * (h * 0.35);
      } else if (activeAnim === 'fade_out' && clipRemaining < 0.8) {
        transAlpha *= Math.max(0, clipRemaining / 0.8);
      } else if (activeAnim === 'pendulum') {
        animRotationDeg += Math.sin(playheadSec * 6.5) * 9;
      } else if (activeAnim === 'bounce_combo') {
        const bounce = Math.abs(Math.sin(playheadSec * 8.5));
        transScale *= 1 + bounce * 0.14;
        transOffsetY -= bounce * (h * 0.06);
      }

      ctx.globalAlpha =
        Math.max(0, Math.min(1, (interpolated.opacity ?? 100) / 100)) * transAlpha;
      const rawBlend = activeVideoClip.blendMode || 'normal';
      ctx.globalCompositeOperation = (
        rawBlend === 'normal' ? 'source-over' : rawBlend
      ) as GlobalCompositeOperation;

      let fxOffsetX = transOffsetX;
      let fxOffsetY = transOffsetY;
      let fxScaleMult = transScale;
      if (
        effectiveVisualEffect === 'shake' ||
        activeVideoClip.animationCombo === 'handheld_shake'
      ) {
        fxOffsetX += Math.sin((playheadSec + 0.2) * 42) * (w * 0.022);
        fxOffsetY += Math.cos((playheadSec + 0.2) * 37) * (h * 0.022);
      } else if (effectiveVisualEffect === 'bass_impact') {
        const pulse = Math.abs(Math.sin((playheadSec + 0.25) * 14));
        fxScaleMult *= 1 + pulse * 0.16;
      } else if (effectiveVisualEffect === 'ken_burns') {
        const progress = Math.min(
          1,
          (clipElapsed + 0.4) / Math.max(0.5, activeVideoClip.duration)
        );
        fxScaleMult *= 1 + progress * 0.24;
      } else if (effectiveVisualEffect === 'dolly_zoom') {
        fxScaleMult *= 1.18 - Math.sin((playheadSec + 0.3) * 3.5) * 0.12;
      }

      // Apply Wipe Split transition clipping if transitionType === 'wipe_split'
      if (isDualClipTransActive && tType === 'wipe_split') {
        const wipeW = Math.max(8, w * dualClipTransProgress);
        ctx.beginPath();
        ctx.rect((w - wipeW) / 2, 0, wipeW, h);
        ctx.clip();
      }

      // Apply Mask clipping (including Filmstrip, Star, Heart, Circle, Rectangle, Split + Invert)
      const maskType = activeVideoClip.maskType || 'none';
      if (maskType !== 'none' && maskType !== 'mirror') {
        ctx.beginPath();
        if (activeVideoClip.maskInvert) {
          ctx.rect(0, 0, w, h);
        }
        if (maskType === 'circle') {
          ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.38, 0, Math.PI * 2);
        } else if (maskType === 'rectangle') {
          ctx.roundRect(w * 0.14, h * 0.14, w * 0.72, h * 0.72, 14 * dpiScale);
        } else if (maskType === 'split') {
          ctx.rect(0, 0, w * 0.5, h);
        } else if (maskType === 'filmstrip') {
          ctx.rect(0, h * 0.18, w, h * 0.64);
        } else if (maskType === 'star' || maskType === 'heart') {
          ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.35, 0, Math.PI * 2);
        }
        ctx.clip(activeVideoClip.maskInvert ? 'evenodd' : 'nonzero');
      }

      const vDrag =
        liveDragTransform && liveDragTransform.clipId === activeVideoClip.id
          ? liveDragTransform
          : null;
      const effVideoPosX = vDrag ? vDrag.posX : interpolated.posX || 0;
      const effVideoPosY = vDrag ? vDrag.posY : interpolated.posY || 0;
      const effVideoScale = vDrag ? vDrag.scale : interpolated.scale;

      const posXOffset = (effVideoPosX / 1920) * w + fxOffsetX;
      const posYOffset = (effVideoPosY / 1080) * h + fxOffsetY;
      ctx.translate(w / 2 + posXOffset, h / 2 + posYOffset);

      const totalRotDeg =
        (interpolated.rotation || 0) + (activeVideoClip.cropRotateDeg || 0) + animRotationDeg;
      if (totalRotDeg !== 0) {
        ctx.rotate((totalRotDeg * Math.PI) / 180);
      }

      const scaleXFactor =
        ((activeVideoClip.uniformScale === false
          ? activeVideoClip.scaleX ?? effVideoScale
          : effVideoScale) /
          100) *
        fxScaleMult;
      const scaleYFactor =
        ((activeVideoClip.uniformScale === false
          ? activeVideoClip.scaleY ?? effVideoScale
          : effVideoScale) /
          100) *
        fxScaleMult;
      const flipX =
        (activeVideoClip.flipH ? -1 : 1) * (maskType === 'mirror' ? -1 : 1);
      const flipY = activeVideoClip.flipV ? -1 : 1;
      ctx.scale(scaleXFactor * flipX, scaleYFactor * flipY);

      // Apply Real CapCut PC Spatial Cropping (cropLeft, cropTop, cropRight, cropBottom in %)
      // relative to the actual drawn video frame bounds (drawW × drawH)
      const cLeftPct = Math.max(0, Math.min(85, activeVideoClip.cropLeft || 0));
      const cTopPct = Math.max(0, Math.min(85, activeVideoClip.cropTop || 0));
      const cRightPct = Math.max(0, Math.min(85, activeVideoClip.cropRight || 0));
      const cBottomPct = Math.max(0, Math.min(85, activeVideoClip.cropBottom || 0));

      const vw = Math.max(1, drawableMediaWidth);
      const vh = Math.max(1, drawableMediaHeight);
      const containedMedia = computeObjectFitContainRect(w, h, vw, vh);
      const drawW = containedMedia.width;
      const drawH = containedMedia.height;

      if (cLeftPct > 0 || cTopPct > 0 || cRightPct > 0 || cBottomPct > 0) {
        const cropX = -drawW / 2 + (cLeftPct / 100) * drawW;
        const cropY = -drawH / 2 + (cTopPct / 100) * drawH;
        const cropW = Math.max(16, drawW * (1 - (cLeftPct + cRightPct) / 100));
        const cropH = Math.max(16, drawH * (1 - (cTopPct + cBottomPct) / 100));
        ctx.beginPath();
        ctx.rect(cropX, cropY, cropW, cropH);
        ctx.clip();
      }

      if (fallbackThumbImg) {
        ctx.drawImage(fallbackThumbImg, -drawW / 2, -drawH / 2, drawW, drawH);
      }
      if (drawableMediaSource && drawableMediaSource !== fallbackThumbImg) {
        ctx.drawImage(drawableMediaSource, -drawW / 2, -drawH / 2, drawW, drawH);
      }
      if (drawableMediaSource || fallbackThumbImg) {

        // High-frequency crispness pass when Sharpen / AI Upscale / High-Res Export is active
        const crispSource = drawableMediaSource || fallbackThumbImg;
        if (totalSharpen > 10 && crispSource) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = Math.min(0.22, totalSharpen / 260);
          ctx.filter = 'contrast(145%) saturate(108%)';
          ctx.drawImage(crispSource, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        }

        if (activeVideoClip.removeBg) {
          try {
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;
            const isBlue = activeVideoClip.chromaColor === 'blue';
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              if (!isBlue && g > 105 && g > r * 1.25 && g > b * 1.25) {
                data[i + 3] = 20;
              } else if (isBlue && b > 105 && b > r * 1.25 && b > g * 1.25) {
                data[i + 3] = 20;
              }
            }
            ctx.putImageData(imgData, 0, 0);
          } catch {
            // Ignore cross-origin pixel access
          }
        }
      } else {
        // Clean Cinematic Studio Frame when a clip is still initializing or has no media URL (NEVER draw bar charts!)
        const skyGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        skyGrad.addColorStop(0, '#0B0F17');
        skyGrad.addColorStop(0.5, '#111827');
        skyGrad.addColorStop(1, '#090D14');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(-w / 2, -h / 2, w, h);

        const containedScene = computeObjectFitContainRect(w, h, 1920, 1080);
        const sceneW = containedScene.width;
        const sceneH = containedScene.height;

        const glow = ctx.createRadialGradient(
          0,
          0,
          sceneW * 0.04,
          0,
          0,
          Math.max(w, h) * 0.52
        );
        glow.addColorStop(0, 'rgba(0, 229, 204, 0.14)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(-w / 2, -h / 2, w, h);

        if (!activeVideoClip.mediaUrl) {
          const titleFontPx = Math.max(14, Math.round(24 * dpiScale));
          const metaFontPx = Math.max(10, Math.round(14 * dpiScale));
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#E4E4E7';
          ctx.font = `700 ${titleFontPx}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillText(activeVideoClip.name, 0, -sceneH * 0.03);

          ctx.fillStyle = '#00E5CC';
          ctx.font = `600 ${metaFontPx}px "JetBrains Mono", monospace`;
          ctx.fillText(
            `${w}×${h} · ${formatTimecode(playheadSec, fps)}`,
            0,
            sceneH * 0.04
          );
        }

        if (activeVideoClip.autoCutout) {
          ctx.strokeStyle = activeVideoClip.cutoutStrokeColor || '#00E5CC';
          ctx.lineWidth = Math.max(2, 3 * dpiScale);
          ctx.setLineDash([6 * dpiScale, 4 * dpiScale]);
          ctx.strokeRect(-sceneW * 0.35, -sceneH * 0.35, sceneW * 0.7, sceneH * 0.7);
          ctx.setLineDash([]);
        }
      }

      ctx.restore();

      // 3D Relight Studio Lighting Overlay (Synced with relightEnabled & relightMode)
      const effectiveRelight =
        activeVideoClip.relightMode && activeVideoClip.relightMode !== 'none'
          ? activeVideoClip.relightMode
          : activeVideoClip.relightEnabled
          ? 'warm'
          : 'none';
      if (effectiveRelight !== 'none') {
        const relightGrad = ctx.createRadialGradient(
          w * 0.3,
          h * 0.35,
          10 * dpiScale,
          w * 0.5,
          h * 0.5,
          w * 0.65
        );
        if (effectiveRelight === 'warm') {
          relightGrad.addColorStop(0, 'rgba(251, 146, 60, 0.34)');
          relightGrad.addColorStop(1, 'rgba(0,0,0,0)');
        } else if (effectiveRelight === 'cool') {
          relightGrad.addColorStop(0, 'rgba(56, 189, 248, 0.34)');
          relightGrad.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          relightGrad.addColorStop(0, 'rgba(236, 72, 153, 0.34)');
          relightGrad.addColorStop(0.5, 'rgba(0, 229, 204, 0.24)');
          relightGrad.addColorStop(1, 'rgba(0,0,0,0)');
        }
        ctx.fillStyle = relightGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Transition Overlays (all 16 transition types) + Visual Effects (all 20 effect types)
      const transDurOverlay = activeVideoClip.transitionDuration || 0.6;
      const activeTransType = activeVideoClip.transitionType || 'none';
      const inTransitionWindow =
        activeTransType !== 'none' && clipElapsed < transDurOverlay;
      const transProgress = inTransitionWindow
        ? Math.max(0.18, Math.min(1, (clipElapsed + 0.06) / Math.max(0.15, transDurOverlay)))
        : 1;

      if (inTransitionWindow) {
        const rem = 1 - transProgress;
        if (activeTransType === 'black_fade') {
          ctx.fillStyle = `rgba(0, 0, 0, ${(rem * 0.92).toFixed(2)})`;
          ctx.fillRect(0, 0, w, h);
        } else if (activeTransType === 'white_flash' || activeTransType === 'light_flash') {
          ctx.fillStyle = `rgba(255, 255, 255, ${(rem * 0.88).toFixed(2)})`;
          ctx.fillRect(0, 0, w, h);
        } else if (activeTransType === 'film_burn') {
          const burnGrad = ctx.createLinearGradient(0, 0, w, h);
          burnGrad.addColorStop(0, `rgba(239, 68, 68, ${(rem * 0.82).toFixed(2)})`);
          burnGrad.addColorStop(0.5, `rgba(249, 115, 22, ${(rem * 0.72).toFixed(2)})`);
          burnGrad.addColorStop(1, `rgba(250, 204, 21, ${(rem * 0.45).toFixed(2)})`);
          ctx.fillStyle = burnGrad;
          ctx.fillRect(0, 0, w, h);
        } else if (activeTransType === 'wipe_split') {
          const wipeW = w * 0.5 * rem;
          ctx.fillStyle = 'rgba(7, 16, 22, 0.88)';
          ctx.fillRect(0, 0, wipeW, h);
          ctx.fillRect(w - wipeW, 0, wipeW, h);
          ctx.strokeStyle = '#00E5CC';
          ctx.lineWidth = Math.max(2, 3 * dpiScale);
          ctx.beginPath();
          ctx.moveTo(wipeW, 0);
          ctx.lineTo(wipeW, h);
          ctx.moveTo(w - wipeW, 0);
          ctx.lineTo(w - wipeW, h);
          ctx.stroke();
        } else if (activeTransType === 'clock_sweep') {
          ctx.save();
          ctx.fillStyle = `rgba(9, 14, 24, ${(rem * 0.78).toFixed(2)})`;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.arc(
            w / 2,
            h / 2,
            Math.hypot(w, h),
            -Math.PI / 2 + transProgress * Math.PI * 2,
            Math.PI * 1.5
          );
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (activeTransType === 'whip_pan') {
          ctx.fillStyle = `rgba(0, 229, 204, ${(rem * 0.35).toFixed(2)})`;
          for (let i = 0; i < 6; i++) {
            ctx.fillRect(0, (h / 6) * i + 8 * dpiScale, w * rem, 6 * dpiScale);
          }
        } else if (
          activeTransType === 'glitch' ||
          activeTransType === 'glitch_transition' ||
          activeTransType === 'rgb_split'
        ) {
          ctx.fillStyle = `rgba(255, 0, 85, ${(rem * 0.32).toFixed(2)})`;
          ctx.fillRect(0, h * 0.2, w, h * 0.18);
          ctx.fillStyle = `rgba(0, 229, 204, ${(rem * 0.32).toFixed(2)})`;
          ctx.fillRect(0, h * 0.58, w, h * 0.18);
        }
      }

      // Render Visual Effects Overlays (all 20 distinct VisualEffectType modes)
      if (effectiveVisualEffect === 'flash') {
        const flashAlpha = 0.22 + Math.abs(Math.sin((playheadSec + 0.15) * 20)) * 0.45;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha.toFixed(2)})`;
        ctx.fillRect(0, 0, w, h);
      } else if (effectiveVisualEffect === 'strobe_party') {
        const strobeIdx = Math.floor((playheadSec + 0.2) * 12) % 3;
        ctx.fillStyle =
          strobeIdx === 0
            ? 'rgba(0, 229, 204, 0.26)'
            : strobeIdx === 1
            ? 'rgba(236, 72, 153, 0.26)'
            : 'rgba(250, 204, 21, 0.24)';
        ctx.fillRect(0, 0, w, h);
      } else if (effectiveVisualEffect === 'vhs' || effectiveVisualEffect === 'glitch') {
        ctx.fillStyle = 'rgba(0, 229, 204, 0.14)';
        const stepY = Math.max(4, Math.round(5 * dpiScale));
        for (let y = 0; y < h; y += stepY) {
          ctx.fillRect(0, y, w, Math.max(1, 1.5 * dpiScale));
        }
        ctx.fillStyle = 'rgba(236, 72, 153, 0.16)';
        ctx.fillRect(
          0,
          h * 0.3 + (((playheadSec + 0.3) * 120 * dpiScale) % (h * 0.45)),
          w,
          12 * dpiScale
        );
        if (effectiveVisualEffect === 'vhs') {
          ctx.fillStyle = '#FACC15';
          ctx.font = `700 ${Math.max(12, Math.round(20 * dpiScale))}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'left';
          ctx.fillText('PLAY ▶ VHS 1998', 28 * dpiScale, 42 * dpiScale);
        }
      } else if (effectiveVisualEffect === 'super8_grain') {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.16)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        const holeH = Math.max(12, Math.round(22 * dpiScale));
        const holeW = Math.max(8, Math.round(14 * dpiScale));
        for (let y = 16 * dpiScale; y < h; y += holeH * 2.2) {
          ctx.fillRect(10 * dpiScale, y, holeW, holeH);
          ctx.fillRect(w - 10 * dpiScale - holeW, y, holeW, holeH);
        }
      } else if (effectiveVisualEffect === 'old_tv') {
        ctx.strokeStyle = '#27272A';
        ctx.lineWidth = Math.max(8, Math.round(18 * dpiScale));
        ctx.strokeRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
        for (let y = 0; y < h; y += Math.max(3, Math.round(4 * dpiScale))) {
          ctx.fillRect(0, y, w, 1.2 * dpiScale);
        }
      } else if (effectiveVisualEffect === 'dv_cam') {
        const m = 26 * dpiScale;
        const len = 32 * dpiScale;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(2, 2.5 * dpiScale);
        ctx.beginPath();
        ctx.moveTo(m, m + len);
        ctx.lineTo(m, m);
        ctx.lineTo(m + len, m);
        ctx.moveTo(w - m - len, m);
        ctx.lineTo(w - m, m);
        ctx.lineTo(w - m, m + len);
        ctx.moveTo(m, h - m - len);
        ctx.lineTo(m, h - m);
        ctx.lineTo(m + len, h - m);
        ctx.moveTo(w - m - len, h - m);
        ctx.lineTo(w - m, h - m);
        ctx.lineTo(w - m, h - m - len);
        ctx.stroke();
        ctx.fillStyle = '#EF4444';
        ctx.font = `700 ${Math.max(12, Math.round(18 * dpiScale))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('● REC [DV CAM]', m + 12 * dpiScale, m + 22 * dpiScale);
      } else if (effectiveVisualEffect === 'fade_black') {
        const fadeProgress = Math.min(1, clipElapsed / 1.2);
        const alpha = Math.max(0.32, 1 - fadeProgress);
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(2)})`;
        ctx.fillRect(0, 0, w, h);
      } else if (effectiveVisualEffect === 'dreamy_glow') {
        const aura = ctx.createRadialGradient(w / 2, h / 2, w * 0.05, w / 2, h / 2, w * 0.55);
        aura.addColorStop(0, 'rgba(244, 114, 182, 0.38)');
        aura.addColorStop(0.5, 'rgba(168, 85, 247, 0.22)');
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, w, h);
      } else if (effectiveVisualEffect === 'golden_rays') {
        const sun = ctx.createRadialGradient(w * 0.15, h * 0.12, 10, w * 0.25, h * 0.25, w * 0.85);
        sun.addColorStop(0, 'rgba(253, 224, 71, 0.52)');
        sun.addColorStop(0.45, 'rgba(249, 115, 22, 0.25)');
        sun.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sun;
        ctx.fillRect(0, 0, w, h);
      } else if (effectiveVisualEffect === 'cyber_holo') {
        ctx.strokeStyle = 'rgba(0, 229, 204, 0.35)';
        ctx.lineWidth = Math.max(1, 1.5 * dpiScale);
        const gridStep = Math.max(24, Math.round(48 * dpiScale));
        for (let x = 0; x < w; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        const scanY = ((playheadSec * 180 + 80) % h);
        ctx.fillStyle = 'rgba(0, 229, 204, 0.28)';
        ctx.fillRect(0, scanY, w, 8 * dpiScale);
      } else if (effectiveVisualEffect === 'clone_trail') {
        // Real Multi-Clone Ghost Trail of the actual video frame!
        ctx.save();
        const trailOffsets = [
          { dx: -w * 0.085, dy: -h * 0.015, scale: 1.03, alpha: 0.34, tint: 'rgba(0, 229, 204, 0.22)' },
          { dx: w * 0.085, dy: h * 0.015, scale: 1.03, alpha: 0.34, tint: 'rgba(236, 72, 153, 0.22)' },
          { dx: -w * 0.15, dy: 0, scale: 1.06, alpha: 0.20, tint: 'rgba(168, 85, 247, 0.18)' },
          { dx: w * 0.15, dy: 0, scale: 1.06, alpha: 0.20, tint: 'rgba(250, 204, 21, 0.18)' },
        ];
        const phase = Math.sin(playheadSec * 5.5) * 0.4 + 0.85;
        ctx.globalCompositeOperation = 'screen';
        for (const tr of trailOffsets) {
          ctx.save();
          ctx.globalAlpha = tr.alpha;
          const ox = tr.dx * phase;
          const oy = tr.dy * phase;
          const tw = w * tr.scale;
          const th = h * tr.scale;
          ctx.drawImage(canvas, (w - tw) / 2 + ox, (h - th) / 2 + oy, tw, th);
          ctx.fillStyle = tr.tint;
          ctx.fillRect(0, 0, w, h);
          ctx.restore();
        }
        ctx.restore();
      } else if (effectiveVisualEffect === 'soul_out') {
        // Real Astral Soul Out projection expanding from the video frame
        ctx.save();
        const soulPhase = (playheadSec * 1.35) % 1;
        const scale1 = 1.06 + soulPhase * 0.38;
        const scale2 = 1.02 + ((soulPhase + 0.5) % 1) * 0.32;
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = Math.max(0.12, (1 - soulPhase) * 0.52);
        ctx.drawImage(canvas, (w - w * scale1) / 2, (h - h * scale1) / 2, w * scale1, h * scale1);
        ctx.globalAlpha = Math.max(0.1, (1 - ((soulPhase + 0.5) % 1)) * 0.36);
        ctx.drawImage(canvas, (w - w * scale2) / 2, (h - h * scale2) / 2, w * scale2, h * scale2);
        ctx.restore();
      } else if (effectiveVisualEffect === 'laser_eyes') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const eyeLX = w * 0.43;
        const eyeRX = w * 0.57;
        const eyeY = h * 0.36 + Math.sin(playheadSec * 8) * (h * 0.015);
        for (const ex of [eyeLX, eyeRX]) {
          const glow = ctx.createRadialGradient(ex, eyeY, 2, ex, eyeY, w * 0.16);
          glow.addColorStop(0, '#FFFFFF');
          glow.addColorStop(0.2, '#EF4444');
          glow.addColorStop(0.55, 'rgba(239, 68, 68, 0.45)');
          glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, w, h);
          // Laser beam rays
          ctx.strokeStyle = '#FCA5A5';
          ctx.lineWidth = Math.max(3, 6 * dpiScale);
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 18 * dpiScale;
          ctx.beginPath();
          ctx.moveTo(ex, eyeY);
          ctx.lineTo(ex < w / 2 ? 0 : w, eyeY + h * 0.42);
          ctx.stroke();
          // Horizontal flare
          ctx.lineWidth = Math.max(2, 3.5 * dpiScale);
          ctx.beginPath();
          ctx.moveTo(ex - w * 0.14, eyeY);
          ctx.lineTo(ex + w * 0.14, eyeY);
          ctx.stroke();
        }
        ctx.restore();
      } else if (
        effectiveVisualEffect === 'laser_body' ||
        effectiveVisualEffect === 'neon_aura' ||
        effectiveVisualEffect === 'neon_outline' ||
        effectiveVisualEffect === 'bass_impact' ||
        effectiveVisualEffect === 'dolly_zoom'
      ) {
        ctx.save();
        const primaryCol =
          effectiveVisualEffect === 'neon_outline'
            ? '#A855F7'
            : effectiveVisualEffect === 'neon_aura'
            ? '#EC4899'
            : '#00E5CC';
        ctx.strokeStyle = primaryCol;
        ctx.shadowColor = primaryCol;
        ctx.shadowBlur = 16 * dpiScale;
        ctx.lineWidth = Math.max(2.5, 4.5 * dpiScale);
        const pad = Math.min(w, h) * 0.06;
        ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);
        // Dynamic neon energy rings
        for (let rIdx = 0; rIdx < 3; rIdx++) {
          const rad =
            Math.min(w, h) * (0.18 + ((playheadSec * 0.45 + rIdx * 0.33) % 1) * 0.28);
          ctx.globalAlpha = 0.65 - rIdx * 0.15;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, rad, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (effectiveVisualEffect === 'matrix_rain') {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 20, 8, 0.28)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#10B981';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 8 * dpiScale;
        const colW = Math.max(14, Math.round(22 * dpiScale));
        ctx.font = `700 ${Math.max(11, Math.round(15 * dpiScale))}px monospace`;
        const chars = '01TDOCUT98765XYZ#$%*+';
        const cols = Math.floor(w / colW);
        for (let c = 0; c < cols; c++) {
          const headY = ((playheadSec * (140 + (c % 5) * 45) + c * 97) % (h + 120)) - 60;
          for (let k = 0; k < 7; k++) {
            const cy = headY - k * colW;
            if (cy > 0 && cy < h) {
              ctx.globalAlpha = k === 0 ? 0.95 : Math.max(0.15, 0.8 - k * 0.11);
              ctx.fillStyle = k === 0 ? '#A7F3D0' : '#10B981';
              const ch = chars[(c * 7 + k + Math.floor(playheadSec * 12)) % chars.length];
              ctx.fillText(ch, c * colW + 4, cy);
            }
          }
        }
        ctx.restore();
      } else if (effectiveVisualEffect === 'fire_sparks') {
        ctx.save();
        const fireGrad = ctx.createLinearGradient(0, h, 0, h * 0.35);
        fireGrad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
        fireGrad.addColorStop(0.45, 'rgba(249, 115, 22, 0.28)');
        fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fireGrad;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 36; i++) {
          const px = ((i * 73 + Math.sin(playheadSec * 3 + i) * 35) % w + w) % w;
          const py = h - (((playheadSec * (120 + (i % 4) * 40) + i * 47) % h));
          const r = Math.max(2, ((i % 4) + 1.5) * dpiScale);
          ctx.fillStyle = i % 2 === 0 ? '#FDE047' : '#F97316';
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (effectiveVisualEffect === 'snowfall' || effectiveVisualEffect === 'sakura_petals') {
        ctx.save();
        const isSakura = effectiveVisualEffect === 'sakura_petals';
        for (let i = 0; i < 42; i++) {
          const px = ((i * 67 + Math.sin(playheadSec * 2 + i) * 40 + playheadSec * 25) % w + w) % w;
          const py = ((playheadSec * (85 + (i % 5) * 22) + i * 53) % h);
          const r = Math.max(2.5, ((i % 4) + 2) * dpiScale);
          ctx.fillStyle = isSakura
            ? i % 2 === 0
              ? 'rgba(244, 114, 182, 0.88)'
              : 'rgba(251, 207, 232, 0.92)'
            : 'rgba(255, 255, 255, 0.88)';
          ctx.beginPath();
          if (isSakura) {
            ctx.ellipse(px, py, r * 1.4, r * 0.8, (playheadSec * 2 + i) % Math.PI, 0, Math.PI * 2);
          } else {
            ctx.arc(px, py, r, 0, Math.PI * 2);
          }
          ctx.fill();
        }
        ctx.restore();
      } else if (effectiveVisualEffect === 'lightning_storm') {
        ctx.save();
        const flashAmt = Math.pow(Math.max(0, Math.sin(playheadSec * 14)), 6);
        if (flashAmt > 0.1) {
          ctx.fillStyle = `rgba(186, 230, 253, ${(flashAmt * 0.42).toFixed(2)})`;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.strokeStyle = '#E0F2FE';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 18 * dpiScale;
        ctx.lineWidth = Math.max(2.5, 4 * dpiScale);
        for (let b = 0; b < 2; b++) {
          let bx = w * (0.3 + b * 0.4) + Math.sin(playheadSec * 19 + b) * (w * 0.08);
          let by = 0;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          for (let seg = 1; seg <= 8; seg++) {
            bx += Math.sin(playheadSec * 37 + seg * 13 + b * 7) * (w * 0.045);
            by = (h / 8) * seg;
            ctx.lineTo(bx, by);
          }
          ctx.stroke();
        }
        ctx.restore();
      } else if (effectiveVisualEffect === 'cinema_bars') {
        const barH = Math.round(h * 0.13);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, barH);
        ctx.fillRect(0, h - barH, w, barH);
      } else if (effectiveVisualEffect === 'halftone_comic') {
        ctx.save();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
        const step = Math.max(10, Math.round(16 * dpiScale));
        for (let y = step / 2; y < h; y += step) {
          for (let x = step / 2; x < w; x += step) {
            if ((x + y) % (step * 2) === 0) {
              ctx.beginPath();
              ctx.arc(x, y, 2.2 * dpiScale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(6, 10 * dpiScale);
        ctx.strokeRect(0, 0, w, h);
        ctx.restore();
      } else if (effectiveVisualEffect === 'thermal_vision') {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        const thGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.05, w / 2, h / 2, w * 0.65);
        thGrad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
        thGrad.addColorStop(0.35, 'rgba(239, 68, 68, 0.65)');
        thGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.65)');
        thGrad.addColorStop(1, 'rgba(30, 58, 138, 0.75)');
        ctx.fillStyle = thGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      } else if (effectiveVisualEffect === 'night_vision') {
        ctx.save();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
        ctx.fillRect(0, 0, w, h);
        const nvVig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.58);
        nvVig.addColorStop(0, 'rgba(0,0,0,0)');
        nvVig.addColorStop(1, 'rgba(0,0,0,0.78)');
        ctx.fillStyle = nvVig;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
        ctx.lineWidth = Math.max(1, 1.5 * dpiScale);
        ctx.strokeRect(w * 0.12, h * 0.12, w * 0.76, h * 0.76);
        ctx.restore();
      } else if (effectiveVisualEffect === 'underwater') {
        ctx.save();
        ctx.fillStyle = 'rgba(2, 132, 199, 0.26)';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.lineWidth = Math.max(1.5, 2.5 * dpiScale);
        for (let wy = h * 0.15; wy < h; wy += h * 0.2) {
          ctx.beginPath();
          for (let wx = 0; wx <= w; wx += 24) {
            const yWave = wy + Math.sin(wx * 0.03 + playheadSec * 4) * 10 * dpiScale;
            if (wx === 0) ctx.moveTo(wx, yWave);
            else ctx.lineTo(wx, yWave);
          }
          ctx.stroke();
        }
        ctx.restore();
      } else if (effectiveVisualEffect === 'split_screen_2') {
        ctx.save();
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, w / 2, h);
        ctx.drawImage(canvas, 0, 0, w, h, w / 2, 0, w / 2, h);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(2, 3 * dpiScale);
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
        ctx.restore();
      } else if (effectiveVisualEffect === 'split_screen_4') {
        ctx.save();
        const hw = w / 2;
        const hh = h / 2;
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, hw, hh);
        ctx.drawImage(canvas, 0, 0, w, h, hw, 0, hw, hh);
        ctx.drawImage(canvas, 0, 0, w, h, 0, hh, hw, hh);
        ctx.drawImage(canvas, 0, 0, w, h, hw, hh, hw, hh);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(2, 3 * dpiScale);
        ctx.beginPath();
        ctx.moveTo(hw, 0);
        ctx.lineTo(hw, h);
        ctx.moveTo(0, hh);
        ctx.lineTo(w, hh);
        ctx.stroke();
        ctx.restore();
      } else if (effectiveVisualEffect === 'kaleidoscope') {
        ctx.save();
        const hw = w / 2;
        const hh = h / 2;
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, hw, hh);
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, hw, hh);
        ctx.restore();
        ctx.save();
        ctx.translate(0, h);
        ctx.scale(1, -1);
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, hw, hh);
        ctx.restore();
        ctx.save();
        ctx.translate(w, h);
        ctx.scale(-1, -1);
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, hw, hh);
        ctx.restore();
        ctx.restore();
      } else if (effectiveVisualEffect === 'speed_lines') {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = Math.max(1.5, 2.5 * dpiScale);
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.hypot(cx, cy);
        const innerR = Math.min(w, h) * 0.28;
        for (let a = 0; a < 36; a++) {
          const angle = (a * Math.PI * 2) / 36 + ((playheadSec * 3) % 0.2);
          const rStart = innerR + ((a * 17 + Math.floor(playheadSec * 24)) % 5) * 14 * dpiScale;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * rStart, cy + Math.sin(angle) * rStart);
          ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
          ctx.stroke();
        }
        ctx.restore();
      } else if (effectiveVisualEffect === 'confetti_party') {
        ctx.save();
        const colors = ['#EF4444', '#FACC15', '#10B981', '#38BDF8', '#A855F7', '#EC4899'];
        for (let i = 0; i < 45; i++) {
          const px = ((i * 59 + Math.sin(playheadSec * 3 + i) * 35) % w + w) % w;
          const py = ((playheadSec * (110 + (i % 5) * 28) + i * 41) % h);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(playheadSec * 4 + i);
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillRect(-5 * dpiScale, -2.5 * dpiScale, 10 * dpiScale, 5 * dpiScale);
          ctx.restore();
        }
        ctx.restore();
      } else if (effectiveVisualEffect === 'spotlight_stage') {
        ctx.save();
        const spotX = w * (0.5 + Math.sin(playheadSec * 2.2) * 0.22);
        const spotY = h * 0.48;
        const spot = ctx.createRadialGradient(spotX, spotY, w * 0.06, spotX, spotY, w * 0.45);
        spot.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        spot.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
        spot.addColorStop(1, 'rgba(0, 0, 0, 0.82)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Vignette overlay (supports dark vignette > 0 and white halo vignette < 0)
      const totalVignette =
        (activeVideoClip.vignette || 0) +
        (globalAdjustments?.enabled ? globalAdjustments.vignette : 0);
      if (Math.abs(totalVignette) > 0.001) {
        const rad = ctx.createRadialGradient(
          w / 2,
          h / 2,
          w * 0.25,
          w / 2,
          h / 2,
          w * 0.65
        );
        const color = totalVignette > 0 ? '0,0,0' : '255,255,255';
        const alpha = Math.min(0.92, Math.abs(totalVignette) / 100);
        rad.addColorStop(0, `rgba(${color},0)`);
        rad.addColorStop(1, `rgba(${color},${alpha})`);
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, w, h);
      }

      // Motion Tracking Yellow Target Box (Page 27)
      if (activeVideoClip.motionTrackingActive) {
        const tx = w / 2 + (activeVideoClip.trackingTargetX || 0) * dpiScale;
        const ty = h / 2 + (activeVideoClip.trackingTargetY || 0) * dpiScale;
        const boxHalf = 48 * dpiScale;
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = Math.max(1.5, 2 * dpiScale);
        ctx.strokeRect(tx - boxHalf, ty - boxHalf, boxHalf * 2, boxHalf * 2);
        ctx.beginPath();
        ctx.arc(tx, ty, 6 * dpiScale, 0, Math.PI * 2);
        ctx.fillStyle = '#FACC15';
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#090B10';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#52525B';
      ctx.font = `500 ${Math.max(12, Math.round(16 * dpiScale))}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(
        language === 'en'
          ? 'TDO CUT — Import media or drag items onto the Timeline'
          : 'TDO CUT — Nhập video hoặc bấm + trên thẻ Media để đưa xuống Timeline',
        w / 2,
        h / 2
      );
      }

      // Save rendered video background into offscreen cache so dragging Text/PIP is instantaneous
      if (!isHighResExport && typeof document !== 'undefined') {
        if (!bgCacheCanvasRef.current) {
          bgCacheCanvasRef.current = document.createElement('canvas');
        }
        const cacheC = bgCacheCanvasRef.current;
        if (cacheC.width !== w || cacheC.height !== h) {
          cacheC.width = w;
          cacheC.height = h;
        }
        const cacheCtx = cacheC.getContext('2d', { alpha: false });
        if (cacheCtx) {
          cacheCtx.drawImage(canvas, 0, 0);
          bgCacheKeyRef.current = currentBgKey;
        }
      }
    }

    // Render PIP Overlay Clip (Track 3+) if present (skip pure Effect/Filter/Adjustment layers)
    overlayBoundsRef.current = null;
    const isRealPipOverlay =
      activeOverlayClip &&
      !overlayTrackHidden &&
      !activeOverlayClip.disabled &&
      activeOverlayClip.id !== activeVideoClip?.id &&
      !activeOverlayClip.stickerEmoji &&
      !activeOverlayClip.subtitleText &&
      !(
        !activeOverlayClip.mediaUrl &&
        ((activeOverlayClip.visualEffect && activeOverlayClip.visualEffect !== 'none') ||
          (activeOverlayClip.filterPreset && activeOverlayClip.filterPreset !== 'none') ||
          activeOverlayClip.name.startsWith('Adjustment:'))
      );

    if (isRealPipOverlay && activeOverlayClip) {
      ctx.save();
      const ovDrag =
        liveDragTransform && liveDragTransform.clipId === activeOverlayClip.id
          ? liveDragTransform
          : null;
      const ovScale = ((ovDrag ? ovDrag.scale : activeOverlayClip.scale) ?? 48) / 100;
      const scaledFactor = ovScale <= 1 ? ovScale * 0.55 : 0.55 + (ovScale - 1) * 1.1125;
      const ovW = w * Math.min(5.0, Math.max(0.08, scaledFactor));
      const ovH = h * Math.min(5.0, Math.max(0.08, scaledFactor));
      const ovPosX = ovDrag ? ovDrag.posX : activeOverlayClip.posX ?? 380;
      const ovPosY = ovDrag ? ovDrag.posY : activeOverlayClip.posY ?? -220;
      const ovCenterX = w / 2 + (ovPosX / 1920) * w;
      const ovCenterY = h / 2 + (ovPosY / 1080) * h;

      overlayBoundsRef.current = {
        clipId: activeOverlayClip.id,
        x: (ovCenterX - ovW / 2) / w,
        y: (ovCenterY - ovH / 2) / h,
        w: ovW / w,
        h: ovH / h,
      };

      ctx.globalAlpha = Math.max(0, Math.min(1, (activeOverlayClip.opacity ?? 100) / 100));
      ctx.translate(ovCenterX, ovCenterY);
      if (activeOverlayClip.rotation) {
        ctx.rotate((activeOverlayClip.rotation * Math.PI) / 180);
      }

      // Spatial crop on PIP overlay if set
      const oL = activeOverlayClip.cropLeft || 0;
      const oT = activeOverlayClip.cropTop || 0;
      const oR = activeOverlayClip.cropRight || 0;
      const oB = activeOverlayClip.cropBottom || 0;
      ctx.beginPath();
      ctx.roundRect(
        -ovW / 2 + (oL / 100) * ovW,
        -ovH / 2 + (oT / 100) * ovH,
        Math.max(12, ovW * (1 - (oL + oR) / 100)),
        Math.max(12, ovH * (1 - (oT + oB) / 100)),
        6 * dpiScale
      );
      ctx.clip();

      const pipVid = pipVideoElRef.current;
      const hasPipVideoFrame = Boolean(
        pipVid &&
          loadedPipUrl &&
          loadedPipUrl === activeOverlayClip.mediaUrl &&
          pipVid.readyState >= 2 &&
          pipVid.videoWidth > 0
      );
      const pipImg = !hasPipVideoFrame
        ? getOrLoadMediaImage(
            activeOverlayClip.thumbnailUrl ||
              activeOverlayClip.thumbnailDataUrl ||
              (activeOverlayClip.mediaUrl?.startsWith('data:image') ||
              activeOverlayClip.mediaUrl?.startsWith('blob:')
                ? activeOverlayClip.mediaUrl
                : undefined)
          )
        : null;

      if (hasPipVideoFrame && pipVid) {
        ctx.drawImage(pipVid, -ovW / 2, -ovH / 2, ovW, ovH);
      } else if (pipImg) {
        ctx.drawImage(pipImg, -ovW / 2, -ovH / 2, ovW, ovH);
      } else {
        const ovGrad = ctx.createLinearGradient(-ovW / 2, -ovH / 2, ovW / 2, ovH / 2);
        ovGrad.addColorStop(0, '#0f172a');
        ovGrad.addColorStop(0.55, activeOverlayClip.colorHex || '#EC4899');
        ovGrad.addColorStop(1, '#311042');
        ctx.fillStyle = ovGrad;
        ctx.fillRect(-ovW / 2, -ovH / 2, ovW, ovH);

        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.font = `700 ${Math.max(10, Math.round(ovH * 0.13))}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`▣ PIP: ${activeOverlayClip.name}`, 0, 4 * dpiScale);
      }

      ctx.strokeStyle =
        showCanvasBoundingBox && selectedClipId === activeOverlayClip.id && !isHighResExport
          ? '#00E5CC'
          : 'rgba(255,255,255,0.85)';
      ctx.lineWidth = (showCanvasBoundingBox && selectedClipId === activeOverlayClip.id && !isHighResExport ? 3 : 1.8) * dpiScale;
      ctx.strokeRect(-ovW / 2, -ovH / 2, ovW, ovH);
      ctx.restore();
    }

    // Render ALL Active Subtitles, Text Clips, and Stickers at Playhead (plus any sticker attached directly to activeVideoClip)
    subtitleBoundsRef.current = null;
    canvasItemsBoundsRef.current = [];

    if (!textTrackHidden) {
      const textAndStickerClipsToDraw: TimelineClip[] = [];
      const seenIds = new Set<string>();

      // 1. All active text/sticker clips from activeClipsAtPlayhead
      activeClipsAtPlayhead.forEach((c) => {
        if (c.disabled) return;
        if (c.trackIndex === 2 || Boolean(c.subtitleText) || Boolean(c.stickerEmoji)) {
          // If it's a Track 0 video clip that also has a stickerEmoji attached directly, we'll handle its sticker next
          if (c.trackIndex === 0 && !c.subtitleText) return;
          seenIds.add(c.id);
          textAndStickerClipsToDraw.push(c);
        }
      });

      // 2. Fallback if activeSubtitleClip was passed separately
      if (
        activeSubtitleClip &&
        !activeSubtitleClip.disabled &&
        !seenIds.has(activeSubtitleClip.id)
      ) {
        seenIds.add(activeSubtitleClip.id);
        textAndStickerClipsToDraw.push(activeSubtitleClip);
      }

      // 3. Also if activeVideoClip has a stickerEmoji attached directly to it (and stickerType !== 'none')
      if (
        activeVideoClip &&
        !activeVideoClip.disabled &&
        activeVideoClip.stickerEmoji &&
        activeVideoClip.stickerType &&
        activeVideoClip.stickerType !== 'none'
      ) {
        textAndStickerClipsToDraw.push({
          ...activeVideoClip,
          id: activeVideoClip.id,
          posX: activeVideoClip.posX || 0,
          posY: activeVideoClip.posY || 0,
          scale: activeVideoClip.scale ?? 100,
        });
      }

      let stickerCounter = 0;
      textAndStickerClipsToDraw.forEach((itemClip) => {
        ctx.save();
        const interpolatedItem = interpolateClipAtPlayhead(itemClip, playheadSec);
        const itemDrag =
          liveDragTransform && liveDragTransform.clipId === itemClip.id
            ? liveDragTransform
            : null;
        const itemPosX = itemDrag
          ? itemDrag.posX
          : interpolatedItem.posX ?? itemClip.posX ?? 0;
        const itemPosY = itemDrag
          ? itemDrag.posY
          : interpolatedItem.posY ?? itemClip.posY ?? 0;
        const isStickerOnly = Boolean(itemClip.stickerEmoji && !itemClip.subtitleText);
        // Slightly offset multiple unpositioned stickers so they don't stack 100% on top of each other if posX/posY are 0
        const autoOffsetIdx = isStickerOnly ? stickerCounter++ : 0;
        const autoOffsetX =
          isStickerOnly && itemPosX === 0 && autoOffsetIdx > 0
            ? ((autoOffsetIdx % 3) - 1) * 95 * dpiScale
            : 0;
        const autoOffsetY =
          isStickerOnly && itemPosY === 0 && autoOffsetIdx > 0
            ? Math.floor(autoOffsetIdx / 3) * 75 * dpiScale
            : 0;

        const tx = w / 2 + (itemPosX / 1920) * w + autoOffsetX;
        const ty =
          (isStickerOnly ? h * 0.42 : h - Math.max(26, h * 0.1)) +
          (itemPosY / 1080) * h +
          autoOffsetY;
        const rawScalePct =
          (itemDrag ? itemDrag.scale : interpolatedItem.scale ?? itemClip.scale) ?? 100;
        const textScale = Math.max(0.1, rawScalePct / 100);
        const scaleXFactor =
          ((itemClip.uniformScale === false
            ? itemClip.scaleX ?? rawScalePct
            : rawScalePct) /
            100) *
          (itemClip.flipH ? -1 : 1);
        const scaleYFactor =
          ((itemClip.uniformScale === false
            ? itemClip.scaleY ?? rawScalePct
            : rawScalePct) /
            100) *
          (itemClip.flipV ? -1 : 1);
        const rotDeg =
          itemDrag && itemDrag.rotation !== undefined
            ? itemDrag.rotation
            : interpolatedItem.rotation ?? itemClip.rotation ?? 0;
        const itemAlpha = Math.max(
          0,
          Math.min(1, (interpolatedItem.opacity ?? itemClip.opacity ?? 100) / 100)
        );

        ctx.globalAlpha = itemAlpha;
        if (itemClip.blendMode && itemClip.blendMode !== 'normal') {
          ctx.globalCompositeOperation = itemClip.blendMode as GlobalCompositeOperation;
        }

        ctx.translate(tx, ty);
        if (rotDeg) {
          ctx.rotate((rotDeg * Math.PI) / 180);
        }
        ctx.scale(scaleXFactor, scaleYFactor);

        if (isStickerOnly && itemClip.stickerEmoji) {
          const emojiSize = Math.max(
            38,
            Math.round(((itemClip.fontSize || 64) / 450) * h)
          );

          // 1. Check if this sticker is a Country Flag (render real waving graphic flag image, NEVER 2-letter text, NO white border!)
          const flagIso =
            extractFlagIsoCode(itemClip.stickerEmoji) ||
            (itemClip.stickerType === 'world_flag'
              ? extractFlagIsoCode(itemClip.name) || 'VN'
              : null);
          const badgeDef =
            !flagIso
              ? findGraphicBadgeByIconOrText(itemClip.stickerEmoji) ||
                findGraphicBadgeByIconOrText(itemClip.name)
              : null;

          // Stickers, badges, and country flags are rendered clean & static (đứng yên) for zero stutter/lag
          let hitBoxW = emojiSize * 1.5;
          let hitBoxH = emojiSize * 1.5;

          if (flagIso) {
            const flagW = Math.round(emojiSize * 1.55);
            const flagH = Math.round(emojiSize * 1.04);
            hitBoxW = flagW * 1.15;
            hitBoxH = flagH * 1.15;
            const flagImg = getOrCreateFlagCanvasImage(flagIso, () =>
              setFlagTick((t) => t + 1)
            );
            ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
            ctx.shadowBlur = Math.max(4, Math.round(8 * dpiScale));
            if (flagImg && flagImg.complete && flagImg.naturalWidth > 0) {
              // Clean static SVG graphic without broken waving slices
              ctx.drawImage(flagImg, -flagW / 2, -flagH / 2, flagW, flagH);
            } else {
              ctx.fillStyle = '#DA251D';
              ctx.beginPath();
              ctx.roundRect(-flagW / 2, -flagH / 2, flagW, flagH, 8 * dpiScale);
              ctx.fill();
              ctx.fillStyle = '#FFFF00';
              ctx.beginPath();
              ctx.arc(0, 0, flagH * 0.24, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.shadowBlur = 0;

            // Optional custom text caption below flag sticker when user edits stickerText
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
              hitBoxW = Math.max(hitBoxW, capW * 1.08);
              hitBoxH = flagH + capH * 1.4;
            }
          } else if (badgeDef) {
            // 2. Render Rich Graphic CTA / YouTube / Social Banner Badge with editable stickerText & stickerSubText
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
            hitBoxW = pillW * 1.08;
            hitBoxH = pillH * 1.12;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
            ctx.shadowBlur = Math.max(8, Math.round(14 * dpiScale));
            ctx.fillStyle =
              itemClip.textBgColor && itemClip.textBgColor !== 'transparent'
                ? itemClip.textBgColor
                : badgeDef.badgeBg || '#E11D48';
            ctx.beginPath();
            ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, Math.min(pillH / 2, 14 * dpiScale));
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = itemClip.textStrokeColor || badgeDef.badgeAccent || '#FFFFFF';
            ctx.lineWidth = Math.max(2, 3 * dpiScale);
            ctx.beginPath();
            ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, Math.min(pillH / 2, 14 * dpiScale));
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = itemClip.textColor || '#FFFFFF';
            ctx.font = `900 ${mainFontPx}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
            ctx.fillText(
              mainTextToDraw,
              0,
              subTextToDraw ? -pillH * 0.16 : 0
            );

            if (subTextToDraw) {
              ctx.fillStyle = badgeDef.badgeAccent || '#FDE047';
              ctx.font = `800 ${subFontPx}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
              ctx.fillText(subTextToDraw, 0, pillH * 0.24);
            }
          } else {
            // 3. Standard Emoji / Face Icon / Symbol Sticker (+ optional editable stickerText badge)
            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = Math.max(6, Math.round(12 * dpiScale));
            ctx.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(itemClip.stickerEmoji, 0, 0);

            const customEmojiText = (itemClip.stickerText || '').trim();
            if (customEmojiText) {
              ctx.shadowBlur = 0;
              const capFontPx = Math.max(14, Math.round(emojiSize * 0.34));
              ctx.font = `800 ${capFontPx}px "${itemClip.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
              const capW = ctx.measureText(customEmojiText).width + capFontPx * 1.25;
              const capH = capFontPx * 1.5;
              const capY = emojiSize * 0.64;
              ctx.fillStyle =
                itemClip.textBgColor && itemClip.textBgColor !== 'transparent'
                  ? itemClip.textBgColor
                  : 'rgba(15, 23, 42, 0.9)';
              ctx.beginPath();
              ctx.roundRect(-capW / 2, capY - capH / 2, capW, capH, 7 * dpiScale);
              ctx.fill();
              ctx.strokeStyle = itemClip.textStrokeColor || '#00E5CC';
              ctx.lineWidth = Math.max(1.5, 2 * dpiScale);
              ctx.stroke();
              ctx.fillStyle = itemClip.textColor || '#FFFFFF';
              ctx.fillText(customEmojiText, 0, capY);
              hitBoxW = Math.max(hitBoxW, capW * 1.08);
              hitBoxH = emojiSize * 1.5 + capH;
            }
          }

          if (showCanvasBoundingBox && selectedClipId === itemClip.id && !isHighResExport) {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#00E5CC';
            ctx.lineWidth = Math.max(2, 2.5 * dpiScale);
            ctx.strokeRect(-hitBoxW / 2, -hitBoxH / 2, hitBoxW, hitBoxH);
            const corners = [
              [-hitBoxW / 2, -hitBoxH / 2],
              [hitBoxW / 2, -hitBoxH / 2],
              [-hitBoxW / 2, hitBoxH / 2],
              [hitBoxW / 2, hitBoxH / 2],
            ];
            ctx.fillStyle = '#FFFFFF';
            for (const [cx, cy] of corners) {
              ctx.beginPath();
              ctx.arc(cx, cy, 5 * dpiScale, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
            // Top Rotation Handle Stem
            ctx.beginPath();
            ctx.moveTo(0, -hitBoxH / 2);
            ctx.lineTo(0, -hitBoxH / 2 - 14 * dpiScale);
            ctx.stroke();
            ctx.fillStyle = '#00E5CC';
            ctx.beginPath();
            ctx.arc(0, -hitBoxH / 2 - 14 * dpiScale, 5.5 * dpiScale, 0, Math.PI * 2);
            ctx.fill();
          }

          const boxW = hitBoxW * textScale;
          const boxH = hitBoxH * textScale;
          const boundEntry = {
            clipId: itemClip.id,
            x: (tx - boxW / 2) / w,
            y: (ty - boxH / 2) / h,
            w: boxW / w,
            h: boxH / h,
            origPosX: itemClip.posX || 0,
            origPosY: itemClip.posY || 0,
            origScale: itemClip.scale ?? 100,
          };
          canvasItemsBoundsRef.current.push(boundEntry);
          subtitleBoundsRef.current = boundEntry;
        } else {
          const fontSize = Math.max(
            14,
            Math.round(((itemClip.fontSize || 28) / 450) * h)
          );
          const weight = itemClip.textBold === false ? '600' : '800';
          const style = itemClip.textItalic ? 'italic' : 'normal';
          ctx.font = `${style} ${weight} ${fontSize}px "${
            itemClip.fontFamily || 'Plus Jakarta Sans'
          }", sans-serif`;
          ctx.textAlign = 'center';
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          const textStr = itemClip.subtitleText || itemClip.stickerText || itemClip.name;
          const maxSafeTextW = Math.max(120, w * 0.82);

          // Multi-line auto-wrap bounded by viewport safe zone
          const rawParas = textStr.split('\n');
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
              if (ctx.measureText(test).width <= maxSafeTextW) {
                cur = test;
              } else {
                lines.push(cur);
                cur = word;
              }
            }
            lines.push(cur);
          }
          const activeLines = lines.length > 0 ? lines : [textStr];
          let maxLineW = Math.max(...activeLines.map((l) => ctx.measureText(l).width));

          // Auto-scale font size down if text exceeds viewport width
          let activeFontSize = fontSize;
          if (maxLineW > maxSafeTextW && maxLineW > 0) {
            const scaleDown = maxSafeTextW / maxLineW;
            activeFontSize = Math.max(12, Math.round(activeFontSize * scaleDown));
            ctx.font = `${style} ${weight} ${activeFontSize}px "${
              itemClip.fontFamily || 'Plus Jakarta Sans'
            }", sans-serif`;
            maxLineW = Math.max(...activeLines.map((l) => ctx.measureText(l).width));
          }

          const lineHeight = Math.round(activeFontSize * 1.25);
          const totalTextH = activeLines.length * lineHeight;
          const padX = Math.round(14 * dpiScale);
          const padY = Math.round(8 * dpiScale);
          const boxW = maxLineW + padX * 2;
          const boxH = totalTextH + padY * 2;

          if (
            itemClip.textBgColor &&
            itemClip.textBgColor !== 'transparent'
          ) {
            ctx.fillStyle = itemClip.textBgColor;
            ctx.beginPath();
            ctx.roundRect(
              -boxW / 2,
              -boxH / 2,
              boxW,
              boxH,
              6 * dpiScale
            );
            ctx.fill();
          }

          if (itemClip.textShadow !== false) {
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = Math.max(4, Math.round(7 * dpiScale));
            ctx.shadowOffsetY = Math.max(1.5, Math.round(2.5 * dpiScale));
          }

          const strokeW =
            itemClip.textStrokeWidth !== undefined
              ? itemClip.textStrokeWidth === 0
                ? 0
                : Math.max(0.5, itemClip.textStrokeWidth * dpiScale)
              : Math.max(2.5, Math.round(activeFontSize * 0.16));
          const hasStroke = strokeW > 0 && itemClip.textStrokeColor !== 'transparent';
          ctx.lineWidth = strokeW;
          ctx.strokeStyle = itemClip.textStrokeColor || 'rgba(0,0,0,0.95)';
          ctx.fillStyle = itemClip.textColor || '#FFFFFF';

          const curveDeg = itemClip.textCurveDeg || 0;
          if (Math.abs(curveDeg) >= 3 && textStr.length > 1 && activeLines.length === 1) {
            const chars = Array.from(textStr);
            const totalAngleRad = (curveDeg * Math.PI) / 180;
            const radius = Math.max(activeFontSize * 2, maxLineW / Math.max(0.25, Math.abs(totalAngleRad)));
            const dir = curveDeg >= 0 ? 1 : -1;
            ctx.save();
            ctx.translate(0, dir * radius * 0.35);
            chars.forEach((ch, idx) => {
              const frac = chars.length > 1 ? idx / (chars.length - 1) - 0.5 : 0;
              const angle = frac * totalAngleRad * 0.55;
              ctx.save();
              ctx.rotate(angle);
              ctx.translate(0, -dir * radius * 0.35);
              if (hasStroke) ctx.strokeText(ch, 0, 0);
              ctx.fillText(ch, 0, 0);
              ctx.restore();
            });
            ctx.restore();
          } else {
            const startY = -boxH / 2 + padY + activeFontSize * 0.85;
            activeLines.forEach((l, idx) => {
              const lineY = startY + idx * lineHeight;
              if (hasStroke) ctx.strokeText(l, 0, lineY);
              ctx.fillText(l, 0, lineY);
            });
          }

          if (showCanvasBoundingBox && selectedClipId === itemClip.id && !isHighResExport) {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#00E5CC';
            ctx.lineWidth = 2 * dpiScale;
            ctx.strokeRect(
              -boxW / 2,
              -boxH / 2,
              boxW,
              boxH
            );
            const corners = [
              [-boxW / 2, -boxH / 2],
              [boxW / 2, -boxH / 2],
              [-boxW / 2, boxH / 2],
              [boxW / 2, boxH / 2],
            ];
            ctx.fillStyle = '#FFFFFF';
            for (const [cx, cy] of corners) {
              ctx.beginPath();
              ctx.arc(cx, cy, 4.5 * dpiScale, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
          }

          const totalBoxW = (boxW + 8 * dpiScale) * textScale;
          const totalBoxH = (boxH + 8 * dpiScale) * textScale;
          const boundEntry = {
            clipId: itemClip.id,
            x: (tx - totalBoxW / 2) / w,
            y: (ty - totalBoxH / 2) / h,
            w: totalBoxW / w,
            h: totalBoxH / h,
            origPosX: itemClip.posX || 0,
            origPosY: itemClip.posY || 0,
            origScale: itemClip.scale ?? 100,
          };
          canvasItemsBoundsRef.current.push(boundEntry);
          subtitleBoundsRef.current = boundEntry;
        }
        ctx.restore();
      });
    }

    // Center Cyan Alignment Crosshair Guides when dragging near center (Page 21)
    if (showCenterCrosshair.x && !isHighResExport) {
      ctx.strokeStyle = '#00E5CC';
      ctx.lineWidth = 1.5 * dpiScale;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
    }
    if (showCenterCrosshair.y && !isHighResExport) {
      ctx.strokeStyle = '#00E5CC';
      ctx.lineWidth = 1.5 * dpiScale;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    }
  }, [
    playheadSec,
    selectedClipId,
    activeVideoClip,
    activeSubtitleClip,
    activeOverlayClip,
    activeClipsAtPlayhead,
    aspectRatio,
    previewQuality,
    videoTrackHidden,
    textTrackHidden,
    overlayTrackHidden,
    globalAdjustments,
    blurredPadding916,
    showCenterCrosshair,
    showCanvasBoundingBox,
    liveDragTransform,
    canvasW,
    canvasH,
    exportDimensionsOverride,
    fps,
    isPlaying,
    videoFrameReadyTick,
    flagTick,
    stickerAnimSec,
  ]);

  const handleFullscreen = () => {
    const el = previewContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };

  const applyClipTransform = (
    targetClipId: string | undefined,
    nextPosX: number,
    nextPosY: number,
    nextScale?: number,
    nextRotation?: number,
    nextFlipH?: boolean,
    nextFlipV?: boolean
  ) => {
    if (targetClipId && onUpdateSpecificClipTransform) {
      onUpdateSpecificClipTransform(
        targetClipId,
        nextPosX,
        nextPosY,
        nextScale,
        nextRotation,
        nextFlipH,
        nextFlipV
      );
    } else if (onDirectTransformChange) {
      onDirectTransformChange(nextPosX, nextPosY, nextScale);
    } else if (onUpdateClipPosition) {
      onUpdateClipPosition(nextPosX, nextPosY);
    }
  };

  const scheduleDragTransformUpdate = (
    clipId: string,
    posX: number,
    posY: number,
    scale: number,
    rotation?: number
  ) => {
    const payload = { clipId, posX, posY, scale, rotation };
    pendingDragTransformRef.current = payload;
    if (dragRafIdRef.current === null) {
      dragRafIdRef.current = window.requestAnimationFrame(() => {
        dragRafIdRef.current = null;
        const latest = pendingDragTransformRef.current;
        if (latest) {
          setLiveDragTransform(latest);
        }
      });
    }
  };

  const seekPlayheadTo = (sec: number) => {
    if (onSeekPlayhead) onSeekPlayhead(sec);
    else if (onJumpToTimecode) onJumpToTimecode(sec);
  };

  const getActiveSelectedCanvasClip = (): TimelineClip | undefined => {
    if (selectedClip && (!selectedClipId || selectedClip.id === selectedClipId)) {
      return selectedClip;
    }
    if (selectedClipId && activeClipsAtPlayhead && activeClipsAtPlayhead.length > 0) {
      const fromActive = activeClipsAtPlayhead.find((c) => c.id === selectedClipId);
      if (fromActive) return fromActive;
    }
    if (selectedClipId && activeSubtitleClip?.id === selectedClipId) return activeSubtitleClip;
    if (selectedClipId && activeOverlayClip?.id === selectedClipId) return activeOverlayClip;
    return selectedClip || activeVideoClip || activeSubtitleClip || activeOverlayClip;
  };

  // Mobile Touch Gestures on Canvas: Pinch-to-zoom & pan video, 1-finger drag reposition, tap to play
  const canvasTouchStateRef = useRef<{
    isPinch: boolean;
    initialPinchDist: number;
    initialScale: number;
    initialPosX: number;
    initialPosY: number;
    initialCenterX: number;
    initialCenterY: number;
    targetClipId?: string;
    targetClipRotation?: number;
    startX: number;
    startY: number;
    startTime: number;
    hasMoved: boolean;
  }>({
    isPinch: false,
    initialPinchDist: 0,
    initialScale: 100,
    initialPosX: 0,
    initialPosY: 0,
    initialCenterX: 0,
    initialCenterY: 0,
    startX: 0,
    startY: 0,
    startTime: 0,
    hasMoved: false,
  });

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const target = getActiveSelectedCanvasClip();
    if (e.touches.length === 2) {
      // 2 fingers: Pinch to zoom video scale + pan
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const cx = (t0.clientX + t1.clientX) / 2;
      const cy = (t0.clientY + t1.clientY) / 2;
      canvasTouchStateRef.current = {
        isPinch: true,
        initialPinchDist: Math.max(10, dist),
        initialScale: target?.scale ?? 100,
        initialPosX: target?.posX ?? 0,
        initialPosY: target?.posY ?? 0,
        initialCenterX: cx,
        initialCenterY: cy,
        targetClipId: target?.id,
        targetClipRotation: target?.rotation ?? 0,
        startX: cx,
        startY: cy,
        startTime: Date.now(),
        hasMoved: false,
      };
      if (target) {
        onSelectClipFromCanvas?.(target.id);
        setShowCanvasBoundingBox(true);
      }
    } else if (e.touches.length === 1) {
      // 1 finger: Check if user touched any Text/Sticker item on canvas first
      const t0 = e.touches[0];
      const canvas = canvasRef.current;
      let matchedItem = false;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const nx = (t0.clientX - rect.left) / Math.max(1, rect.width);
        const ny = (t0.clientY - rect.top) / Math.max(1, rect.height);

        for (let i = canvasItemsBoundsRef.current.length - 1; i >= 0; i--) {
          const b = canvasItemsBoundsRef.current[i];
          const cornerList: Array<{
            handle: 'nw' | 'ne' | 'sw' | 'se';
            cx: number;
            cy: number;
          }> = [
            { handle: 'nw', cx: b.x, cy: b.y },
            { handle: 'ne', cx: b.x + b.w, cy: b.y },
            { handle: 'sw', cx: b.x, cy: b.y + b.h },
            { handle: 'se', cx: b.x + b.w, cy: b.y + b.h },
          ];
          let hitCorner: 'nw' | 'ne' | 'sw' | 'se' | null = null;
          for (const corner of cornerList) {
            if (Math.hypot(nx - corner.cx, ny - corner.cy) <= 0.055) {
              hitCorner = corner.handle;
              break;
            }
          }
          const matchedClip = activeClipsAtPlayhead.find((c) => c.id === b.clipId);
          if (hitCorner) {
            onCanvasDragStart?.();
            onSelectClipFromCanvas?.(b.clipId);
            setShowCanvasBoundingBox(true);
            setLiveDragTransform({
              clipId: b.clipId,
              posX: b.origPosX,
              posY: b.origPosY,
              scale: b.origScale,
              rotation: matchedClip?.rotation,
            });
            setDraggingCanvasObj({
              clipId: b.clipId,
              mode: 'resize',
              handle: hitCorner,
              startX: t0.clientX,
              startY: t0.clientY,
              origPosX: b.origPosX,
              origPosY: b.origPosY,
              origScale: b.origScale,
              origRotation: matchedClip?.rotation,
            });
            matchedItem = true;
            break;
          }

          if (
            nx >= b.x - 0.04 &&
            nx <= b.x + b.w + 0.04 &&
            ny >= b.y - 0.04 &&
            ny <= b.y + b.h + 0.04
          ) {
            onCanvasDragStart?.();
            onSelectClipFromCanvas?.(b.clipId);
            setShowCanvasBoundingBox(true);
            // Requirement 1: Directly open bottom text editor drawer instead of floating black overlay
            if (matchedClip && (matchedClip.subtitleText || matchedClip.stickerEmoji || matchedClip.trackIndex === 2)) {
              onOpenTextEditor?.(matchedClip.id);
            }
            setLiveDragTransform({
              clipId: b.clipId,
              posX: b.origPosX,
              posY: b.origPosY,
              scale: b.origScale,
              rotation: matchedClip?.rotation,
            });
            setDraggingCanvasObj({
              clipId: b.clipId,
              mode: 'move',
              startX: t0.clientX,
              startY: t0.clientY,
              origPosX: b.origPosX,
              origPosY: b.origPosY,
              origScale: b.origScale,
              origRotation: matchedClip?.rotation,
            });
            matchedItem = true;
            break;
          }
        }
      }

      if (!matchedItem) {
        if (selectedClipId) {
          onSelectClipFromCanvas?.('');
          setShowCanvasBoundingBox(false);
        }
        canvasTouchStateRef.current = {
          isPinch: false,
          initialPinchDist: 0,
          initialScale: target?.scale ?? 100,
          initialPosX: target?.posX ?? 0,
          initialPosY: target?.posY ?? 0,
          initialCenterX: t0.clientX,
          initialCenterY: t0.clientY,
          targetClipId: target?.id,
          targetClipRotation: target?.rotation ?? 0,
          startX: t0.clientX,
          startY: t0.clientY,
          startTime: Date.now(),
          hasMoved: false,
        };
      }
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const st = canvasTouchStateRef.current;
    if (e.touches.length === 2 && st.isPinch && st.targetClipId) {
      if (e.cancelable) e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const cx = (t0.clientX + t1.clientX) / 2;
      const cy = (t0.clientY + t1.clientY) / 2;

      const scaleRatio = dist / Math.max(10, st.initialPinchDist);
      const newScale = Math.round(Math.max(15, Math.min(500, st.initialScale * scaleRatio)));

      const dx = cx - st.initialCenterX;
      const dy = cy - st.initialCenterY;
      const scaleRatioX = canvasW / Math.max(120, fittedBoxW);
      const scaleRatioY = canvasH / Math.max(90, fittedBoxH);
      const nextX = Math.round(st.initialPosX + dx * scaleRatioX);
      const nextY = Math.round(st.initialPosY + dy * scaleRatioY);

      st.hasMoved = true;
      scheduleDragTransformUpdate(st.targetClipId, nextX, nextY, newScale, st.targetClipRotation);
    } else if (e.touches.length === 1 && !st.isPinch && st.targetClipId) {
      const t0 = e.touches[0];
      const dx = t0.clientX - st.startX;
      const dy = t0.clientY - st.startY;
      if (Math.hypot(dx, dy) > 8) {
        if (e.cancelable) e.preventDefault();
        st.hasMoved = true;
        const scaleRatioX = canvasW / Math.max(120, fittedBoxW);
        const scaleRatioY = canvasH / Math.max(90, fittedBoxH);
        const nextX = Math.round(st.initialPosX + dx * scaleRatioX);
        const nextY = Math.round(st.initialPosY + dy * scaleRatioY);
        scheduleDragTransformUpdate(st.targetClipId, nextX, nextY, st.initialScale, st.targetClipRotation);
      }
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const st = canvasTouchStateRef.current;
    if (st.hasMoved && st.targetClipId) {
      const finalDrag = pendingDragTransformRef.current;
      if (finalDrag) {
        applyClipTransform(
          finalDrag.clipId,
          finalDrag.posX,
          finalDrag.posY,
          finalDrag.scale,
          finalDrag.rotation
        );
      }
    } else if (!st.hasMoved && Date.now() - st.startTime < 350) {
      // Tap without moving -> select/focus clip on canvas and show bounding box
      if (e.cancelable) e.preventDefault();
      setShowCanvasBoundingBox(true);
      const target = getActiveSelectedCanvasClip();
      if (target) {
        onSelectClipFromCanvas?.(target.id);
      }
    }
    canvasTouchStateRef.current.isPinch = false;
    canvasTouchStateRef.current.hasMoved = false;
  };

  // Direct Canvas Mouse Dragging: Hit-test Text/Subtitle, Sticker, Overlay PIP, or Main Video to select, move, resize, or rotate
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height);

      // 1. Check if user clicked on any visible Sticker or Text/Subtitle overlay on canvas (top-most first)
      for (let i = canvasItemsBoundsRef.current.length - 1; i >= 0; i--) {
        const b = canvasItemsBoundsRef.current[i];
        // Check top rotation handle above item box
        const rotHandleX = b.x + b.w / 2;
        const rotHandleY = b.y - 0.032;
        const matchedClip = activeClipsAtPlayhead.find((c) => c.id === b.clipId);
        if (Math.hypot(nx - rotHandleX, ny - rotHandleY) <= 0.038) {
          onCanvasDragStart?.();
          onSelectClipFromCanvas?.(b.clipId);
          setShowCanvasBoundingBox(true);
          const origRot = matchedClip?.rotation ?? 0;
          setLiveDragTransform({
            clipId: b.clipId,
            posX: b.origPosX,
            posY: b.origPosY,
            scale: b.origScale,
            rotation: origRot,
          });
          setDraggingCanvasObj({
            clipId: b.clipId,
            mode: 'rotate',
            startX: e.clientX,
            startY: e.clientY,
            origPosX: b.origPosX,
            origPosY: b.origPosY,
            origScale: b.origScale,
            origRotation: origRot,
          });
          return;
        }

        // Check 4 corner resize handles of item box
        const cornerList: Array<{
          handle: 'nw' | 'ne' | 'sw' | 'se';
          cx: number;
          cy: number;
        }> = [
          { handle: 'nw', cx: b.x, cy: b.y },
          { handle: 'ne', cx: b.x + b.w, cy: b.y },
          { handle: 'sw', cx: b.x, cy: b.y + b.h },
          { handle: 'se', cx: b.x + b.w, cy: b.y + b.h },
        ];
        for (const corner of cornerList) {
          if (Math.hypot(nx - corner.cx, ny - corner.cy) <= 0.036) {
            onCanvasDragStart?.();
            onSelectClipFromCanvas?.(b.clipId);
            setShowCanvasBoundingBox(true);
            setLiveDragTransform({
              clipId: b.clipId,
              posX: b.origPosX,
              posY: b.origPosY,
              scale: b.origScale,
              rotation: matchedClip?.rotation,
            });
            setDraggingCanvasObj({
              clipId: b.clipId,
              mode: 'resize',
              handle: corner.handle,
              startX: e.clientX,
              startY: e.clientY,
              origPosX: b.origPosX,
              origPosY: b.origPosY,
              origScale: b.origScale,
              origRotation: matchedClip?.rotation,
            });
            return;
          }
        }

        if (
          nx >= b.x - 0.03 &&
          nx <= b.x + b.w + 0.03 &&
          ny >= b.y - 0.03 &&
          ny <= b.y + b.h + 0.03
        ) {
          onCanvasDragStart?.();
          onSelectClipFromCanvas?.(b.clipId);
          setShowCanvasBoundingBox(true);
          if (matchedClip && (matchedClip.subtitleText || matchedClip.stickerEmoji || matchedClip.trackIndex === 2)) {
            onOpenTextEditor?.(b.clipId);
          }
          setLiveDragTransform({
            clipId: b.clipId,
            posX: b.origPosX,
            posY: b.origPosY,
            scale: b.origScale,
            rotation: matchedClip?.rotation,
          });
          setDraggingCanvasObj({
            clipId: b.clipId,
            mode: 'move',
            startX: e.clientX,
            startY: e.clientY,
            origPosX: b.origPosX,
            origPosY: b.origPosY,
            origScale: b.origScale,
            origRotation: matchedClip?.rotation,
          });
          return;
        }
      }

      // 2. Check if user clicked on a visible PIP Overlay clip on canvas
      const ovBox = overlayBoundsRef.current;
      if (
        ovBox &&
        activeOverlayClip &&
        nx >= ovBox.x - 0.02 &&
        nx <= ovBox.x + ovBox.w + 0.02 &&
        ny >= ovBox.y - 0.02 &&
        ny <= ovBox.y + ovBox.h + 0.02
      ) {
        onCanvasDragStart?.();
        onSelectClipFromCanvas?.(activeOverlayClip.id);
        setShowCanvasBoundingBox(true);
        const origPosX = activeOverlayClip.posX ?? 380;
        const origPosY = activeOverlayClip.posY ?? -220;
        const origScale = activeOverlayClip.scale ?? 48;
        setLiveDragTransform({
          clipId: activeOverlayClip.id,
          posX: origPosX,
          posY: origPosY,
          scale: origScale,
          rotation: activeOverlayClip.rotation,
        });
        setDraggingCanvasObj({
          clipId: activeOverlayClip.id,
          mode: 'move',
          startX: e.clientX,
          startY: e.clientY,
          origPosX,
          origPosY,
          origScale,
          origRotation: activeOverlayClip.rotation,
        });
        return;
      }
    }

    if (selectedClipId) {
      onSelectClipFromCanvas?.('');
      setShowCanvasBoundingBox(false);
      return;
    }

    setShowCanvasBoundingBox(true);
    const targetClip = getActiveSelectedCanvasClip();
    if (!targetClip) return;
    onCanvasDragStart?.();
    onSelectClipFromCanvas?.(targetClip.id);
    const origPosX = targetClip.posX || 0;
    const origPosY = targetClip.posY || 0;
    const origScale = targetClip.scale ?? 100;
    setLiveDragTransform({
      clipId: targetClip.id,
      posX: origPosX,
      posY: origPosY,
      scale: origScale,
      rotation: targetClip.rotation,
    });
    setDraggingCanvasObj({
      clipId: targetClip.id,
      mode: 'move',
      startX: e.clientX,
      startY: e.clientY,
      origPosX,
      origPosY,
      origScale,
      origRotation: targetClip.rotation,
    });
  };

  const handleStartResizeHandle = (
    e: React.MouseEvent | React.TouchEvent,
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
  ) => {
    e.stopPropagation();
    if ('cancelable' in e && e.cancelable) e.preventDefault();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const targetClip = getActiveSelectedCanvasClip();
    if (!targetClip) return;
    onCanvasDragStart?.();
    const origPosX = targetClip.posX || 0;
    const origPosY = targetClip.posY || 0;
    const origScale = targetClip.scale ?? 100;
    setLiveDragTransform({
      clipId: targetClip.id,
      posX: origPosX,
      posY: origPosY,
      scale: origScale,
      rotation: targetClip.rotation,
    });
    setDraggingCanvasObj({
      clipId: targetClip.id,
      mode: 'resize',
      handle,
      startX: clientX,
      startY: clientY,
      origPosX,
      origPosY,
      origScale,
      origRotation: targetClip.rotation,
    });
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingCanvasObj) return;
    const dx = e.clientX - draggingCanvasObj.startX;
    const dy = e.clientY - draggingCanvasObj.startY;

    if (draggingCanvasObj.mode === 'rotate') {
      const nextRot = Math.max(
        -360,
        Math.min(360, Math.round((draggingCanvasObj.origRotation || 0) + dx * 0.85))
      );
      scheduleDragTransformUpdate(
        draggingCanvasObj.clipId,
        draggingCanvasObj.origPosX,
        draggingCanvasObj.origPosY,
        draggingCanvasObj.origScale,
        nextRot
      );
      return;
    }

    if (draggingCanvasObj.mode === 'resize') {
      const h = draggingCanvasObj.handle || 'se';
      let delta = 0;
      if (h === 'se' || h === 'e' || h === 's') {
        delta = dx + dy;
      } else if (h === 'nw' || h === 'w' || h === 'n') {
        delta = -(dx + dy);
      } else if (h === 'ne') {
        delta = dx - dy;
      } else if (h === 'sw') {
        delta = -dx + dy;
      }
      const baseDim = Math.max(80, Math.min(fittedBoxW, fittedBoxH));
      const deltaScale = (delta / baseDim) * 360;
      const rawNextScale = Math.max(
        10,
        Math.min(500, Math.round(draggingCanvasObj.origScale + deltaScale))
      );
      const snapped = snapPreviewScaleToFrame(
        rawNextScale,
        draggingCanvasObj.origPosX,
        draggingCanvasObj.origPosY,
        7,
        24
      );
      setIsSnappedToFrame(snapped.snappedScale);
      setShowCenterCrosshair({
        x: snapped.snappedScale || snapped.snappedPosX,
        y: snapped.snappedScale || snapped.snappedPosY,
      });
      scheduleDragTransformUpdate(
        draggingCanvasObj.clipId,
        snapped.posX,
        snapped.posY,
        snapped.scale,
        draggingCanvasObj.origRotation
      );
      return;
    }

    const scaleRatioX = 1920 / Math.max(120, fittedBoxW);
    const scaleRatioY = 1080 / Math.max(90, fittedBoxH);
    let nextX = Math.round(draggingCanvasObj.origPosX + dx * scaleRatioX);
    let nextY = Math.round(draggingCanvasObj.origPosY + dy * scaleRatioY);

    const snapX = Math.abs(nextX) < 18;
    const snapY = Math.abs(nextY) < 18;
    if (snapX) nextX = 0;
    if (snapY) nextY = 0;
    const curScale = draggingCanvasObj.origScale;
    setIsSnappedToFrame(curScale === 100 && snapX && snapY);
    setShowCenterCrosshair({ x: snapX, y: snapY });
    scheduleDragTransformUpdate(
      draggingCanvasObj.clipId,
      nextX,
      nextY,
      curScale,
      draggingCanvasObj.origRotation
    );
  };

  const handleCanvasMouseUp = () => {
    if (dragRafIdRef.current !== null) {
      window.cancelAnimationFrame(dragRafIdRef.current);
      dragRafIdRef.current = null;
    }
    if (pendingDragTransformRef.current) {
      const finalDrag = pendingDragTransformRef.current;
      pendingDragTransformRef.current = null;
      applyClipTransform(
        finalDrag.clipId,
        finalDrag.posX,
        finalDrag.posY,
        finalDrag.scale,
        finalDrag.rotation
      );
    }
    setDraggingCanvasObj(null);
    setLiveDragTransform(null);
    setShowCenterCrosshair({ x: false, y: false });
    if (isSnappedToFrame) {
      triggerSnapFrameFeedback(true);
    }
  };

  useEffect(() => {
    if (!draggingCanvasObj) return;
    const onWindowMouseMove = (e: MouseEvent) => {
      handleStageMouseMove(e as unknown as React.MouseEvent<HTMLDivElement>);
    };
    const onWindowMouseUp = () => {
      handleCanvasMouseUp();
    };
    const onWindowTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      if (e.cancelable) e.preventDefault();
      const t = e.touches[0];
      handleStageMouseMove({
        clientX: t.clientX,
        clientY: t.clientY,
      } as unknown as React.MouseEvent<HTMLDivElement>);
    };
    const onWindowTouchEnd = () => {
      handleCanvasMouseUp();
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    window.addEventListener('touchmove', onWindowTouchMove, { passive: false });
    window.addEventListener('touchend', onWindowTouchEnd);
    window.addEventListener('touchcancel', onWindowTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
      window.removeEventListener('touchmove', onWindowTouchMove);
      window.removeEventListener('touchend', onWindowTouchEnd);
      window.removeEventListener('touchcancel', onWindowTouchEnd);
    };
  }, [draggingCanvasObj]);

  // Non-passive wheel event listener on canvas stage for smooth zoom with magnetic 100% snap
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    const handleNativeWheel = (e: WheelEvent) => {
      const targetClip = getActiveSelectedCanvasClip();
      if (!targetClip) return;
      e.preventDefault();
      const curScale = targetClip.scale ?? 100;
      const step = e.deltaY < 0 ? 5 : -5;
      const rawNextScale = Math.max(10, Math.min(500, curScale + step));
      const snapped = snapPreviewScaleToFrame(
        rawNextScale,
        targetClip.posX || 0,
        targetClip.posY || 0,
        8,
        24
      );
      setShowCanvasBoundingBox(true);
      triggerSnapFrameFeedback(snapped.snappedScale);
      applyClipTransform(
        targetClip.id,
        snapped.posX,
        snapped.posY,
        snapped.scale,
        targetClip.rotation
      );
    };
    stageEl.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      stageEl.removeEventListener('wheel', handleNativeWheel);
    };
  }, [selectedClipId, selectedClip, activeVideoClip]);

  // Mouse wheel directly on Canvas zooms/resizes the active clip smoothly with magnetic 100% auto-snap
  const handleCanvasWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const targetClip = getActiveSelectedCanvasClip();
    if (!targetClip) return;
    e.preventDefault();
    const curScale = targetClip.scale ?? 100;
    const step = e.deltaY < 0 ? 5 : -5;
    const rawNextScale = Math.max(10, Math.min(500, curScale + step));
    const snapped = snapPreviewScaleToFrame(
      rawNextScale,
      targetClip.posX || 0,
      targetClip.posY || 0,
      8,
      24
    );
    setShowCanvasBoundingBox(true);
    triggerSnapFrameFeedback(snapped.snappedScale);
    applyClipTransform(
      targetClip.id,
      snapped.posX,
      snapped.posY,
      snapped.scale,
      targetClip.rotation
    );
  };

  const qualityLabel =
    previewQuality === 'full' ? 'Đầy đủ' : previewQuality === 'half' ? '1/2' : '1/4';

  const activeCanvasTarget = getActiveSelectedCanvasClip();

  return (
    <section
      ref={previewContainerRef}
      aria-label="Màn hình Xem Trước (Player)"
      className={`flex flex-col w-full h-full overflow-hidden select-none ${
        isMobile || hideTopBar
          ? 'bg-black border-0 rounded-none'
          : 'bg-[#18181C] border border-[#2B2B30] rounded'
      }`}
    >
      <audio
        ref={audioElRef}
        data-player-audio="true"
        className="hidden"
        preload="auto"
      />

      {/* Top Player Header Bar + ≡ Hamburger Menu (Desktop only, hidden on mobile for edge-to-edge canvas) */}
      {!hideTopBar && !isMobile && (
        <div className="flex items-center justify-between px-3 h-7 border-b border-[#2B2B30] shrink-0 relative">
          <span className="text-[11px] font-medium text-[#D4D4D8] truncate">
            Trình phát-Dòng thời gian 01
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5CC]" />
            <button
              type="button"
              onClick={() => setShowPlayerMenu((v) => !v)}
              title="Menu Màn hình Player (≡)"
              className="p-1 text-[#8E8E93] hover:text-white rounded cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CapCut PC Player ≡ Dropdown Menu */}
          {showPlayerMenu && (
            <div className="absolute top-7 right-2 z-40 w-60 bg-[#1F212A] border border-[#363948] rounded-md shadow-2xl py-1 text-xs text-[#E4E4E7]">
              <button
                type="button"
                onClick={() => {
                  onExportStillFrame?.();
                  setShowPlayerMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#2B2E3B] flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#00E5CC]" />
                <span>Export still frame (Chụp ảnh tĩnh .PNG)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowScopes((s) => !s);
                  setShowPlayerMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#2B2E3B] flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#00E5CC]" />
                  <span>Show scopes (Biểu đồ sóng màu)</span>
                </span>
                {showScopes && <span className="text-[#00E5CC] font-bold">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSafeArea((s) => !s);
                  setShowPlayerMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#2B2E3B] flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Grid className="w-3.5 h-3.5 text-[#00E5CC]" />
                  <span>Show safe area (Khung TikTok &amp; Lưới)</span>
                </span>
                {showSafeArea && <span className="text-[#00E5CC] font-bold">✓</span>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Canvas Stage with Direct Mouse Drag, Wheel Resize, and Right-Click Context Menu */}
      <div
        ref={stageRef}
        onMouseDown={(e) => {
          if (e.button !== 2) setCanvasContextMenu(null);
          if (e.target === e.currentTarget) setShowCanvasBoundingBox(false);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = stageRef.current?.getBoundingClientRect();
          const relX = rect ? Math.min(rect.width - 210, Math.max(8, e.clientX - rect.left)) : 24;
          const relY = rect ? Math.min(rect.height - 260, Math.max(8, e.clientY - rect.top)) : 24;
          setCanvasContextMenu({ x: relX, y: relY });
        }}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleCanvasMouseUp}
        data-keep-dark="true"
        className={`relative flex-1 w-full h-full overflow-hidden min-h-0 min-w-0 group ${
          isMobile || hideTopBar ? 'bg-black' : 'bg-[#0D0E12]'
        }`}
      >
        {/* Right-Click Context Menu on Video Canvas */}
        {canvasContextMenu && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{ left: `${canvasContextMenu.x}px`, top: `${canvasContextMenu.y}px` }}
            className="absolute z-50 w-56 bg-[#1C1D24]/95 backdrop-blur-md border border-[#383A48] rounded-md shadow-2xl py-1 text-[11px] text-[#E4E4E7]"
          >
            <button
              type="button"
              onClick={() => {
                onTogglePlay();
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{isPlaying ? (language === 'en' ? '⏸ Pause Video' : '⏸ Tạm dừng phát') : (language === 'en' ? '▶ Play Video' : '▶ Phát Video')}</span>
              <span className="text-[9px] text-[#71717A] font-mono">Space</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSplitAtPlayhead?.();
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '✂ Split Clip at Playhead' : '✂ Tách đôi Clip tại Playhead'}</span>
              <span className="text-[9px] text-[#71717A] font-mono">Ctrl+B</span>
            </button>
            <div className="my-1 border-t border-[#2E303C]" />
            <button
              type="button"
              onClick={() => {
                onQuickFlipH?.();
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '⇋ Flip Horizontal (Mirror)' : '⇋ Lật ngang (Mirror)'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onQuickFlipV?.();
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '⇅ Flip Vertical' : '⇅ Lật dọc khung hình'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onQuickRotate90?.();
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '↻ Rotate +90°' : '↻ Xoay góc +90°'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const target = getActiveSelectedCanvasClip();
                if (target) applyClipTransform(target.id, 0, 0, 100);
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '⊡ Fit to Frame (Reset 100%)' : '⊡ Vừa khít khung hình (100%)'}</span>
            </button>
            <div className="my-1 border-t border-[#2E303C]" />
            <button
              type="button"
              onClick={() => {
                onQuickAddText?.();
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '＋ Add Text Overlay Here' : '＋ Thêm chữ tại Playhead'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onQuickAddSticker?.('▶️ SUBSCRIBE', 'SUBSCRIBE');
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '🔔 Add SUBSCRIBE Sticker' : '🔔 Dán nhãn SUBSCRIBE Đỏ'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onExportStillFrame?.();
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '📷 Capture Still Frame (.PNG)' : '📷 Chụp ảnh khung hình (.PNG)'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSafeArea((s) => !s);
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '⊞ Toggle Safe Zone & Grid' : '⊞ Bật/Tắt Khung an toàn & Lưới'}</span>
            </button>
            <div className="my-1 border-t border-[#2E303C]" />
            <button
              type="button"
              onClick={() => {
                onDeleteSelected?.();
                setCanvasContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/15 flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? '🗑 Delete Selected Clip' : '🗑 Xóa Clip đang chọn'}</span>
              <span className="text-[9px] font-mono">Del</span>
            </button>
          </div>
        )}
        {/* Video Scopes Overlay */}
        {showScopes && (
          <div className="absolute top-3 left-3 z-20 w-44 p-2 bg-black/85 border border-[#323646] rounded text-[10px] space-y-1 pointer-events-none">
            <div className="flex items-center justify-between text-[#00E5CC] font-semibold">
              <span>RGB Parade &amp; Luma</span>
              <span>IRE 0-100</span>
            </div>
            <div className="flex items-end gap-0.5 h-12">
              {Array.from({ length: 24 }).map((_, i) => {
                const hPct = 20 + ((Math.round(playheadSec * 15) + i * 19) % 75);
                const color =
                  i < 8 ? 'bg-red-500/80' : i < 16 ? 'bg-emerald-400/80' : 'bg-sky-400/80';
                return (
                  <div
                    key={i}
                    style={{ height: `${hPct}%` }}
                    className={`flex-1 ${color} rounded-t-xs`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Absolute inset container decouples fittedBoxW/H from stageRef's flex layout so resizing/restoring never stretches or locks */}
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowCanvasBoundingBox(false);
          }}
          className={`absolute flex items-center justify-center overflow-visible ${
            isMobile || hideTopBar ? 'inset-0' : 'inset-2'
          }`}
        >
          <div
            ref={canvasFrameRef}
            style={{
              width: `${fittedBoxW}px`,
              height: `${fittedBoxH}px`,
              aspectRatio: useWideStageFill ? undefined : `${canvasW} / ${canvasH}`,
              transform:
                playerZoom === '500'
                  ? 'scale(5)'
                  : playerZoom === '400'
                  ? 'scale(4)'
                  : playerZoom === '300'
                  ? 'scale(3)'
                  : playerZoom === '200'
                  ? 'scale(2)'
                  : playerZoom === '100'
                  ? 'scale(1)'
                  : playerZoom === '50'
                  ? 'scale(0.5)'
                  : 'scale(1)',
            }}
            className={`relative flex items-center justify-center transition-transform ${
              isMobile || hideTopBar
                ? 'border-0 rounded-none shadow-none'
                : 'shadow-lg rounded-md border border-[#27272D]'
            }`}
          >
            {/* Real Hardware Video Element - mounted in active viewport so GPU decodes at native rate without blackout */}
            <video
              ref={videoElRef}
              data-player-video="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 0,
              }}
              playsInline={true}
              preload="auto"
              muted={Boolean(videoTrackMuted || activeVideoClip?.muted)}
              onLoadedMetadata={(e) => {
                const vid = e.currentTarget;
                if (activeVideoClip) {
                  const clipElapsed = Math.max(0, playheadSec - activeVideoClip.startTime);
                  const rawOffset = (activeVideoClip.sourceIn || 0) + clipElapsed * (activeVideoClip.speed || 1);
                  const targetOffset =
                    Number.isFinite(vid.duration) && vid.duration > 0
                      ? Math.max(0, Math.min(rawOffset, Math.max(0, vid.duration - 0.04)))
                      : Math.max(0, rawOffset);
                  try {
                    vid.currentTime = Math.max(0.001, targetOffset);
                  } catch {
                    // Ignore initial seek error
                  }
                  if (isPlaying && !activeVideoClip.reversed && vid.paused) {
                    const p = vid.play();
                    if (p !== undefined) {
                      p.catch(() => {
                        vid.muted = true;
                        vid.play().catch(() => {});
                      });
                    }
                  }
                }
                if (
                  vid.videoWidth > 0 &&
                  vid.videoHeight > 0 &&
                  activeVideoClip?.mediaUrl &&
                  lastAutoDetectedUrlRef.current !== activeVideoClip.mediaUrl
                ) {
                  lastAutoDetectedUrlRef.current = activeVideoClip.mediaUrl;
                  const detected = detectAspectRatioFromDimensions(
                    vid.videoWidth,
                    vid.videoHeight
                  ) as AspectRatioOption;
                  onDetectedClipDimensions?.(
                    activeVideoClip.id,
                    vid.videoWidth,
                    vid.videoHeight,
                    detected
                  );
                }
                setVideoFrameReadyTick((t) => t + 1);
              }}
              onLoadedData={() => setVideoFrameReadyTick((t) => t + 1)}
              onCanPlay={() => setVideoFrameReadyTick((t) => t + 1)}
              onCanPlayThrough={() => setVideoFrameReadyTick((t) => t + 1)}
              onSeeked={() => setVideoFrameReadyTick((t) => t + 1)}
              onTimeUpdate={() => setVideoFrameReadyTick((t) => t + 1)}
              onPlaying={() => setVideoFrameReadyTick((t) => t + 1)}
            />

            {/* Pre-buffer Next Video Element for gapless concat */}
            <video
              ref={nextVideoElRef}
              data-player-next-video="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                opacity: 0,
                zIndex: 0,
              }}
              playsInline={true}
              muted
              preload="auto"
              onLoadedMetadata={(e) => {
                if (nextVideoClip) {
                  try {
                    e.currentTarget.currentTime = Math.max(0.001, nextVideoClip.sourceIn || 0);
                  } catch {
                    // Ignore seek error
                  }
                }
                setVideoFrameReadyTick((t) => t + 1);
              }}
              onLoadedData={() => setVideoFrameReadyTick((t) => t + 1)}
              onCanPlay={() => setVideoFrameReadyTick((t) => t + 1)}
              onSeeked={() => setVideoFrameReadyTick((t) => t + 1)}
              onTimeUpdate={() => setVideoFrameReadyTick((t) => t + 1)}
            />

            {/* Dedicated PIP Overlay Video Element */}
            <video
              ref={pipVideoElRef}
              data-player-pip-video="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                opacity: 0,
                zIndex: 0,
              }}
              playsInline={true}
              preload="auto"
              onLoadedData={() => setVideoFrameReadyTick((t) => t + 1)}
              onSeeked={() => setVideoFrameReadyTick((t) => t + 1)}
              onTimeUpdate={() => setVideoFrameReadyTick((t) => t + 1)}
            />

            <canvas
              ref={canvasRef}
              width={canvasW}
              height={canvasH}
              onMouseDown={handleCanvasMouseDown}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              onTouchCancel={handleCanvasTouchEnd}
              onDoubleClick={() => {
                const target = getActiveSelectedCanvasClip();
                if (target && (target.subtitleText || target.stickerEmoji || target.trackIndex === 2)) {
                  onSelectClipFromCanvas?.(target.id);
                  onOpenTextEditor?.(target.id);
                }
              }}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                aspectRatio: useWideStageFill ? undefined : `${canvasW} / ${canvasH}`,
                objectFit: useWideStageFill ? 'fill' : 'contain',
                touchAction: 'none',
              }}
              className="w-full h-full block cursor-move select-none"
            />

          {/* Cyan Magnetic Snap Selection Frame & Corner + Edge Resize Handles */}
          {showCanvasBoundingBox && selectedClipId && activeCanvasTarget && (() => {
            const isTextOrSticker = Boolean(activeCanvasTarget.subtitleText || activeCanvasTarget.trackIndex === 2 || activeCanvasTarget.stickerEmoji);
            const bBoxScale = (liveDragTransform?.clipId === activeCanvasTarget.id ? liveDragTransform.scale : activeCanvasTarget.scale) ?? 100;
            const bBoxPosX = (liveDragTransform?.clipId === activeCanvasTarget.id ? liveDragTransform.posX : activeCanvasTarget.posX) || 0;
            const bBoxPosY = (liveDragTransform?.clipId === activeCanvasTarget.id ? liveDragTransform.posY : activeCanvasTarget.posY) || 0;
            const bBoxRot = (liveDragTransform?.clipId === activeCanvasTarget.id ? liveDragTransform.rotation : activeCanvasTarget.rotation) || 0;

            const bound = isTextOrSticker
              ? canvasItemsBoundsRef.current.find((b) => b.clipId === activeCanvasTarget.id)
              : null;

            if (isTextOrSticker && bound) {
              const bLeft = `${Math.max(0, Math.min(1, bound.x)) * 100}%`;
              const bTop = `${Math.max(0, Math.min(1, bound.y)) * 100}%`;
              const bWidth = `${Math.max(0.04, Math.min(1, bound.w)) * 100}%`;
              const bHeight = `${Math.max(0.03, Math.min(1, bound.h)) * 100}%`;

              return (
                <div
                  style={{
                    position: 'absolute',
                    left: bLeft,
                    top: bTop,
                    width: bWidth,
                    height: bHeight,
                    pointerEvents: 'none',
                    transform: bBoxRot ? `rotate(${bBoxRot}deg)` : undefined,
                    transformOrigin: 'center center',
                  }}
                  className="border-2 border-[#00E5CC] rounded-md shadow-[0_0_12px_rgba(0,229,204,0.4)] z-20"
                >
                  {/* 4 Corner Round Handles for Text (Requirement 1: 8px-10px slim circles like CapCut) */}
                  <div
                    onMouseDown={(e) => handleStartResizeHandle(e, 'nw')}
                    onTouchStart={(e) => handleStartResizeHandle(e, 'nw')}
                    title="Kéo góc để thu phóng văn bản"
                    className="pointer-events-auto absolute -top-1.25 -left-1.25 w-2.5 h-2.5 rounded-full bg-white border border-[#00E5CC] shadow-sm cursor-nwse-resize hover:scale-125 active:scale-125 transition-transform touch-none after:absolute after:-inset-2.5 after:content-['']"
                  />
                  <div
                    onMouseDown={(e) => handleStartResizeHandle(e, 'ne')}
                    onTouchStart={(e) => handleStartResizeHandle(e, 'ne')}
                    title="Kéo góc để thu phóng văn bản"
                    className="pointer-events-auto absolute -top-1.25 -right-1.25 w-2.5 h-2.5 rounded-full bg-white border border-[#00E5CC] shadow-sm cursor-nesw-resize hover:scale-125 active:scale-125 transition-transform touch-none after:absolute after:-inset-2.5 after:content-['']"
                  />
                  <div
                    onMouseDown={(e) => handleStartResizeHandle(e, 'sw')}
                    onTouchStart={(e) => handleStartResizeHandle(e, 'sw')}
                    title="Kéo góc để thu phóng văn bản"
                    className="pointer-events-auto absolute -bottom-1.25 -left-1.25 w-2.5 h-2.5 rounded-full bg-white border border-[#00E5CC] shadow-sm cursor-nesw-resize hover:scale-125 active:scale-125 transition-transform touch-none after:absolute after:-inset-2.5 after:content-['']"
                  />
                  <div
                    onMouseDown={(e) => handleStartResizeHandle(e, 'se')}
                    onTouchStart={(e) => handleStartResizeHandle(e, 'se')}
                    title="Kéo góc để thu phóng văn bản"
                    className="pointer-events-auto absolute -bottom-1.25 -right-1.25 w-2.5 h-2.5 rounded-full bg-white border border-[#00E5CC] shadow-sm cursor-nwse-resize hover:scale-125 active:scale-125 transition-transform touch-none after:absolute after:-inset-2.5 after:content-['']"
                  />
                </div>
              );
            }

            const transX = bBoxPosX * (fittedBoxW / 1920);
            const transY = bBoxPosY * (fittedBoxH / 1080);
            const scaleFactor = bBoxScale / 100;

            return (
              <div
                style={{
                  transform: `translate(${transX}px, ${transY}px) scale(${scaleFactor}) rotate(${bBoxRot}deg)`,
                  transformOrigin: 'center center',
                }}
                className={`absolute inset-0 pointer-events-none transition-all ${
                  isSnappedToFrame
                    ? 'border-2 border-[#00E5CC] shadow-[inset_0_0_18px_rgba(0,229,204,0.45),0_0_16px_rgba(0,229,204,0.65)]'
                    : 'border-2 border-[#00E5CC] shadow-[0_0_12px_rgba(0,229,204,0.35)]'
                }`}
              >
                {/* 4 Corner Round Handles */}
                <div
                  onMouseDown={(e) => handleStartResizeHandle(e, 'nw')}
                  onTouchStart={(e) => handleStartResizeHandle(e, 'nw')}
                  title="Kéo góc để thu phóng video"
                  className="pointer-events-auto absolute -top-2 -left-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#00E5CC] shadow-md cursor-nwse-resize hover:scale-125 transition-transform touch-none"
                />
                <div
                  onMouseDown={(e) => handleStartResizeHandle(e, 'ne')}
                  onTouchStart={(e) => handleStartResizeHandle(e, 'ne')}
                  title="Kéo góc để thu phóng video"
                  className="pointer-events-auto absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#00E5CC] shadow-md cursor-nesw-resize hover:scale-125 transition-transform touch-none"
                />
                <div
                  onMouseDown={(e) => handleStartResizeHandle(e, 'sw')}
                  onTouchStart={(e) => handleStartResizeHandle(e, 'sw')}
                  title="Kéo góc để thu phóng video"
                  className="pointer-events-auto absolute -bottom-2 -left-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#00E5CC] shadow-md cursor-nesw-resize hover:scale-125 transition-transform touch-none"
                />
                <div
                  onMouseDown={(e) => handleStartResizeHandle(e, 'se')}
                  onTouchStart={(e) => handleStartResizeHandle(e, 'se')}
                  title="Kéo góc để thu phóng video"
                  className="pointer-events-auto absolute -bottom-2 -right-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#00E5CC] shadow-md cursor-nwse-resize hover:scale-125 transition-transform touch-none"
                />

                {/* 4 Edge Anchor Handles */}
                <div
                  onMouseDown={(e) => handleStartResizeHandle(e, 'n')}
                  onTouchStart={(e) => handleStartResizeHandle(e, 'n')}
                  title="Kéo cạnh trên để thu phóng video"
                  className="pointer-events-auto absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white border border-[#00E5CC] shadow-sm cursor-ns-resize hover:scale-125 transition-transform touch-none"
                />
                <div
                  onMouseDown={(e) => handleStartResizeHandle(e, 's')}
                  onTouchStart={(e) => handleStartResizeHandle(e, 's')}
                  title="Kéo cạnh dưới để thu phóng video"
                  className="pointer-events-auto absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white border border-[#00E5CC] shadow-sm cursor-ns-resize hover:scale-125 transition-transform touch-none"
                />
                <div
                  onMouseDown={(e) => handleStartResizeHandle(e, 'w')}
                  onTouchStart={(e) => handleStartResizeHandle(e, 'w')}
                  title="Kéo cạnh trái để thu phóng video"
                  className="pointer-events-auto absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-6 rounded-full bg-white border border-[#00E5CC] shadow-sm cursor-ew-resize hover:scale-125 transition-transform touch-none"
                />
                <div
                  onMouseDown={(e) => handleStartResizeHandle(e, 'e')}
                  onTouchStart={(e) => handleStartResizeHandle(e, 'e')}
                  title="Kéo cạnh phải để thu phóng video"
                  className="pointer-events-auto absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-6 rounded-full bg-white border border-[#00E5CC] shadow-sm cursor-ew-resize hover:scale-125 transition-transform touch-none"
                />
              </div>
            );
          })()}

          {/* Safe Area & Rule-of-Thirds Grid Overlay */}
          {showSafeArea && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} className="border border-white/15" />
                ))}
              </div>
              <div className="absolute inset-x-6 bottom-8 h-12 border border-dashed border-[#00E5CC]/60 rounded flex items-center justify-center text-[9px] text-[#00E5CC] bg-black/30">
                Vùng an toàn Phụ đề TikTok / Reels / Shorts
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Bottom Transport & Timecode Bar */}
      {!hideBottomControls && (
        <div className="flex items-center justify-between px-3 h-10 bg-[#15161A] border-t border-[#24262C] shrink-0 relative select-none">
        {/* Left: Double-click Editable Timecode */}
        <div className="flex items-center gap-1.5 font-mono text-xs tracking-tight whitespace-nowrap">
          {isEditingTimecode ? (
            <input
              type="text"
              autoFocus
              value={timecodeInputVal}
              onChange={(e) => setTimecodeInputVal(e.target.value)}
              placeholder="HH:MM:SS:FF"
              onBlur={() => {
                const parsed = parseTimecodeInput(timecodeInputVal, fps);
                if (parsed !== null) seekPlayheadTo(parsed);
                setIsEditingTimecode(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const parsed = parseTimecodeInput(timecodeInputVal, fps);
                  if (parsed !== null) seekPlayheadTo(parsed);
                  setIsEditingTimecode(false);
                }
              }}
              className="w-24 px-1.5 py-0.5 text-xs font-mono bg-[#121317] border border-[#00E5CC] rounded text-[#00E5CC]"
            />
          ) : (
            <span
              onDoubleClick={() => {
                setTimecodeInputVal(formatTimecode(playheadSec, fps));
                setIsEditingTimecode(true);
              }}
              title="Nhấp đúp để gõ số giây / Timecode nhảy đến vị trí bất kỳ"
              className="text-[#00E5CC] font-semibold cursor-pointer hover:underline"
            >
              {formatTimecode(playheadSec, fps)}
            </span>
          )}
          <span className="text-[#4B5563]">/</span>
          <span className="text-[#9CA3AF]">
            {formatTimecode(totalDurationSec, fps)}
          </span>
        </div>

        {/* Center: Precision Transport Controls (Step Back, Play/Pause, Step Forward) */}
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onStepFrame(-1)}
            title="Lùi 1 khung hình (Phím Trái / J)"
            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#252830] rounded transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? 'Tạm dừng (Space / K)' : 'Phát (Space / K)'}
            className={`p-2 rounded-full transition-all cursor-pointer shadow-xs ${
              isPlaying
                ? 'bg-[#00E5CC] text-black hover:bg-[#00F5DC]'
                : 'bg-[#22242B] text-white hover:bg-[#2A2D36] hover:text-[#00E5CC] border border-[#323642]'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onStepFrame(1)}
            title="Tiến 1 khung hình (Phím Phải / L)"
            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#252830] rounded transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Player Zoom (Fit/100%/200%), Preview Quality, Expanded 10-Format Aspect Ratio & Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Player Zoom Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowZoomMenu((v) => !v);
                setShowQualityMenu(false);
                setShowRatioMenu(false);
              }}
              title="Phóng to màn hình xem trước (Fit / 50% - 500%)"
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#D1D5DB] hover:text-white bg-[#1C1D22] border border-[#2A2C34] hover:border-[#383C48] rounded cursor-pointer transition-all"
            >
              <ZoomIn className="w-3 h-3 text-[#00E5CC]" />
              <span>{playerZoom === 'fit' ? 'Fit' : `${playerZoom}%`}</span>
            </button>
            {showZoomMenu && (
              <div className="absolute bottom-8 right-0 z-30 bg-[#181920] border border-[#2D303B] rounded-lg shadow-xl py-1 min-w-[100px]">
                {(['fit', '50', '100', '200', '300', '400', '500'] as const).map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => {
                      setPlayerZoom(z);
                      setShowZoomMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#222530] cursor-pointer ${
                      playerZoom === z ? 'text-[#00E5CC] font-semibold' : 'text-[#D1D5DB]'
                    }`}
                  >
                    {z === 'fit' ? 'Fit (Vừa khung)' : `${z}%`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview Quality Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowQualityMenu((v) => !v);
                setShowRatioMenu(false);
                setShowZoomMenu(false);
              }}
              title="Chất lượng xem trước"
              className="px-1.5 py-0.5 text-[10px] font-medium text-[#D4D4D8] hover:text-white bg-[#242429] border border-[#383840] rounded whitespace-nowrap cursor-pointer"
            >
              {qualityLabel}
            </button>
            {showQualityMenu && (
              <div className="absolute bottom-7 right-0 z-30 bg-[#1F1F26] border border-[#383842] rounded shadow-xl py-1 min-w-[100px]">
                {(
                  [
                    { id: 'full', label: 'Đầy đủ (High)' },
                    { id: 'half', label: '1/2 (Mượt)' },
                    { id: 'quarter', label: '1/4 (Performance)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onPreviewQualityChange?.(opt.id);
                      setShowQualityMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 text-[11px] hover:bg-[#2C2C35] cursor-pointer ${
                      previewQuality === opt.id
                        ? 'text-[#00E5CC] font-semibold'
                        : 'text-[#D4D4D8]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Expanded 11-Format Cinema & Social Aspect Ratio Selector (Defaults to 'Tỉ lệ' -> 'Tỉ lệ gốc') */}
          <div className="relative">
            <button
              type="button"
              data-testid="canvas-aspect-ratio-btn"
              onClick={() => {
                setShowRatioMenu((v) => !v);
                setShowQualityMenu(false);
                setShowZoomMenu(false);
              }}
              title="Tỉ lệ khung hình (Mặc định: Tỉ lệ gốc độc lập từng video)"
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#D4D4D8] hover:text-white bg-[#242429] border border-[#383840] rounded cursor-pointer whitespace-nowrap"
            >
              <RectangleHorizontal className="w-3 h-3 text-[#00E5CC]" />
              <span>
                {aspectRatio === 'original'
                  ? language === 'en'
                    ? 'Ratio'
                    : 'Tỉ lệ'
                  : aspectRatio}
              </span>
            </button>
            {showRatioMenu && (
              <div
                data-testid="canvas-aspect-ratio-menu"
                className="absolute bottom-7 right-0 z-40 bg-[#1F1F26] border border-[#383842] rounded-md shadow-2xl py-1 min-w-[240px] max-h-64 overflow-y-auto"
              >
                <div className="px-2.5 py-1 text-[9px] font-bold uppercase text-[#71717A] border-b border-[#2C2C35]">
                  Tỉ lệ khung hình (Aspect Ratio)
                </div>
                {ASPECT_RATIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    data-testid={`ratio-option-${preset.id}`}
                    onClick={() => {
                      onAspectRatioChange(preset.id);
                      setShowRatioMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] hover:bg-[#2C2C35] cursor-pointer ${
                      aspectRatio === preset.id
                        ? 'text-[#00E5CC] font-semibold bg-[#00E5CC]/10'
                        : 'text-[#D4D4D8]'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#2B2B36] text-[#A1A1AA]">
                      {preset.badge}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleFullscreen}
            title="Phóng to toàn màn hình (Ctrl+F)"
            className="p-1 text-[#A1A1AA] hover:text-white rounded cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      )}
    </section>
  );
};
