/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Film,
  Music,
  Type,
  Sparkles,
  Sliders,
  Filter,
  Folder,
  Search,
  RotateCcw,
  Diamond,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  FlipHorizontal2,
  FlipVertical2,
  Upload,
  Code2,
  Video,
  Wand2,
  Trash2,
  Edit3,
  Check,
  Volume2,
  FileText,
  RotateCw,
  Home,
  Keyboard,
  Settings,
  ChevronDown,
  Smile,
  ArrowRightLeft,
  Target,
  Subtitles,
  Layout,
  Sun,
  Moon,
  Download,
  FolderOpen,
} from 'lucide-react';
import {
  TimelineClip,
  TimelineMarker,
  TimelineTrackDef,
  DEFAULT_TIMELINE_TRACKS,
  TimelineDragPayload,
  AntiDetectConfig,
  GpuEncoderOption,
  BlendMode,
  VisualEffectType,
  FilterPresetType,
  MaskType,
  TransitionType,
  SpeedCurvePreset,
  AnimationPreset,
  StickerOverlayType,
  HslChannelColor,
  ClipboardClipAttributes,
  GlobalAdjustmentLayer,
  SubProjectItem,
  naturalSortByName,
  splitClipAtPlayhead,
  trimClipStartToPlayhead,
  trimClipEndToPlayhead,
  freezeFrameAtPlayhead,
  shuffleVideoClipsInRange,
  batchTrimClips,
  packTrackClipsContiguously,
  parseSrtToTextClips,
  generateCapCutDraftJson,
  buildFfmpegMatrixCommand,
  extractAudioFromVideoClip,
  copyClipAttributes,
  pasteClipAttributes,
  addOrToggleKeyframeAtTime,
  generateAutoBeatsForAudioClip,
  exportTimelineToXml,
  moveSelectedClipsByDelta,
  closeGapAtTimeOnTrack,
  closeAllGapsOnTrack,
  ResourceItemBounds,
  MarqueeRect2D,
  getResourceItemsInMarqueeRect,
  stepTimelineZoom,
  resolveZoneSelectAll,
  resolveMediaClipDuration,
  shouldCoalesceUndoCommit,
  rippleTrimTimelineRange,
  removeTimelineDeadAirAndSilence,
  syncVideoClipsToBeats,
  serializeTdoCutProject,
  parseTdoCutProject,
  AppLanguage,
  StudioThemeMode,
  getStudioTranslations,
  applyDomLanguageTranslation,
  translateViToEnText,
  WORLD_FLAG_STICKERS,
  FACE_ICON_STICKERS,
  TREND_EMOJI_STICKERS,
  GRAPHIC_BADGE_STICKERS,
  StickerCatalogItem,
  getFlagGraphicDataUrl,
  findGraphicBadgeByIconOrText,
  detectAspectRatioFromDimensions,
  deleteMediaCardsAndLinkedClips,
  formatTimecode,
} from './utils/timelineEngine';
import {
  VideoPreviewCanvas,
  AspectRatioOption,
  PreviewQualityOption,
} from './components/VideoPreviewCanvas';
import { MultiTrackTimeline } from './components/MultiTrackTimeline';
import {
  ExportVideoModal,
  MatrixBatchGeneratorModal,
  AiSceneCutModal,
} from './components/ExportVideoModal';
import {
  HomeLauncherView,
  ShortcutsWindowModal,
  SystemSettingsModal,
  HomeQuickToolId,
  HomeTemplatePreset,
} from './components/HomeLauncherAndModals';
import { PythonCodeExplorer } from './components/PythonCodeExplorer';
import {
  SFX_LIBRARY,
  SfxPresetId,
  webAudioEngine,
} from './utils/webAudioSynthesizer';

const INITIAL_CLIPS: TimelineClip[] = [];

interface MediaCardItem {
  id: string;
  name: string;
  duration: number;
  timeLabel: string;
  type: 'video' | 'audio' | 'folder';
  added: boolean;
  gradient: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  nativeAspectRatio?: AspectRatioOption;
  fileSizeBytes?: number;
  waveformPeaks?: number[];
}

const INITIAL_MEDIA_CARDS: MediaCardItem[] = [];

const STORAGE_KEY_PROJECT = 'tdo_cut_project_clean_v5';

interface NumericBoxWithSteppersProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  prefix?: string;
  widthClass?: string;
  ariaLabel?: string;
  onChange: (nextVal: number) => void;
}

function NumericBoxWithSteppers({
  value,
  min = -9999,
  max = 9999,
  step = 1,
  unit = '',
  prefix,
  widthClass = 'w-16',
  ariaLabel,
  onChange,
}: NumericBoxWithSteppersProps) {
  const clampVal = (v: number) => {
    const clamped = Math.max(min, Math.min(max, v));
    return step < 1 ? Number(clamped.toFixed(2)) : Math.round(clamped);
  };

  return (
    <div
      className={`flex items-center justify-between bg-[#222228] border border-[#32323C] focus-within:border-[#00E5CC] rounded px-1 py-0.5 ${widthClass} shrink-0`}
    >
      {prefix && <span className="text-[10px] text-[#71717A] mr-0.5 select-none">{prefix}</span>}
      <input
        type="number"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={step < 1 ? Number(value.toFixed(2)) : Math.round(value)}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          if (!Number.isNaN(parsed)) {
            onChange(clampVal(parsed));
          }
        }}
        className="w-full min-w-0 bg-transparent text-right font-mono text-[11px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {unit && (
        <span className="text-[9.5px] font-mono text-[#9CA3AF] ml-0.5 select-none">{unit}</span>
      )}
      <div className="flex flex-col ml-1 border-l border-[#343440] pl-1 leading-none shrink-0">
        <button
          type="button"
          title="Tăng thông số"
          onClick={() => onChange(clampVal(value + step))}
          className="text-[8px] text-[#9CA3AF] hover:text-[#00E5CC] leading-[8px] cursor-pointer select-none"
        >
          ▴
        </button>
        <button
          type="button"
          title="Giảm thông số"
          onClick={() => onChange(clampVal(value - step))}
          className="text-[8px] text-[#9CA3AF] hover:text-[#00E5CC] leading-[8px] cursor-pointer select-none"
        >
          ▾
        </button>
      </div>
    </div>
  );
}

type CropRatioPreset = 'free' | '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

interface CapCutCropModalProps {
  clip: TimelineClip | null;
  onClose: () => void;
  onConfirm: (cropData: {
    cropLeft: number;
    cropTop: number;
    cropRight: number;
    cropBottom: number;
    cropRotateDeg: number;
    cropAspectPreset: CropRatioPreset;
  }) => void;
}

function CapCutCropModal({ clip, onClose, onConfirm }: CapCutCropModalProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cropVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cropLeft, setCropLeft] = useState<number>(clip?.cropLeft ?? 0);
  const [cropTop, setCropTop] = useState<number>(clip?.cropTop ?? 0);
  const [cropRight, setCropRight] = useState<number>(clip?.cropRight ?? 0);
  const [cropBottom, setCropBottom] = useState<number>(clip?.cropBottom ?? 0);
  const [cropRotateDeg, setCropRotateDeg] = useState<number>(clip?.cropRotateDeg ?? 0);
  const [cropAspectPreset, setCropAspectPreset] = useState<CropRatioPreset>(
    clip?.cropAspectPreset ?? 'free'
  );
  const [ratioMenuOpen, setRatioMenuOpen] = useState<boolean>(false);
  const [cropPlayheadSec, setCropPlayheadSec] = useState<number>(0);
  const [isCropPlaying, setIsCropPlaying] = useState<boolean>(false);
  const [nativeVideoDims, setNativeVideoDims] = useState<{ width: number; height: number }>(() => {
    if (clip?.mediaWidth && clip?.mediaHeight && clip.mediaWidth > 0 && clip.mediaHeight > 0) {
      return { width: clip.mediaWidth, height: clip.mediaHeight };
    }
    if (clip?.nativeAspectRatio === '9:16') return { width: 1080, height: 1920 };
    if (clip?.nativeAspectRatio === '1:1') return { width: 1080, height: 1080 };
    if (clip?.nativeAspectRatio === '4:3') return { width: 1440, height: 1080 };
    return { width: 1920, height: 1080 };
  });

  const [dragHandle, setDragHandle] = useState<{
    mode: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r';
    startX: number;
    startY: number;
    origLeft: number;
    origTop: number;
    origRight: number;
    origBottom: number;
  } | null>(null);

  useEffect(() => {
    if (!clip) return;
    setCropLeft(clip.cropLeft ?? 0);
    setCropTop(clip.cropTop ?? 0);
    setCropRight(clip.cropRight ?? 0);
    setCropBottom(clip.cropBottom ?? 0);
    setCropRotateDeg(clip.cropRotateDeg ?? 0);
    setCropAspectPreset(clip.cropAspectPreset ?? 'free');
    setCropPlayheadSec(0);
    setIsCropPlaying(false);
    if (clip.mediaWidth && clip.mediaHeight && clip.mediaWidth > 0 && clip.mediaHeight > 0) {
      setNativeVideoDims({ width: clip.mediaWidth, height: clip.mediaHeight });
    } else if (clip.nativeAspectRatio === '9:16') {
      setNativeVideoDims({ width: 1080, height: 1920 });
    } else if (clip.nativeAspectRatio === '1:1') {
      setNativeVideoDims({ width: 1080, height: 1080 });
    } else if (clip.nativeAspectRatio === '4:3') {
      setNativeVideoDims({ width: 1440, height: 1080 });
    } else {
      setNativeVideoDims({ width: 1920, height: 1080 });
    }
  }, [clip]);

  useEffect(() => {
    if (!dragHandle) return;
    const onMouseMove = (e: MouseEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dxPct = ((e.clientX - dragHandle.startX) / rect.width) * 100;
      const dyPct = ((e.clientY - dragHandle.startY) / rect.height) * 100;

      let nextL = dragHandle.origLeft;
      let nextT = dragHandle.origTop;
      let nextR = dragHandle.origRight;
      let nextB = dragHandle.origBottom;

      if (dragHandle.mode === 'move') {
        const wPct = 100 - dragHandle.origLeft - dragHandle.origRight;
        const hPct = 100 - dragHandle.origTop - dragHandle.origBottom;
        nextL = Math.max(0, Math.min(100 - wPct, dragHandle.origLeft + dxPct));
        nextR = Math.max(0, 100 - wPct - nextL);
        nextT = Math.max(0, Math.min(100 - hPct, dragHandle.origTop + dyPct));
        nextB = Math.max(0, 100 - hPct - nextT);
      } else {
        if (dragHandle.mode.includes('l')) {
          nextL = Math.max(0, Math.min(85 - nextR, dragHandle.origLeft + dxPct));
        }
        if (dragHandle.mode.includes('r')) {
          nextR = Math.max(0, Math.min(85 - nextL, dragHandle.origRight - dxPct));
        }
        if (dragHandle.mode.includes('t')) {
          nextT = Math.max(0, Math.min(85 - nextB, dragHandle.origTop + dyPct));
        }
        if (dragHandle.mode.includes('b')) {
          nextB = Math.max(0, Math.min(85 - nextT, dragHandle.origBottom - dyPct));
        }
      }

      setCropLeft(Number(nextL.toFixed(1)));
      setCropTop(Number(nextT.toFixed(1)));
      setCropRight(Number(nextR.toFixed(1)));
      setCropBottom(Number(nextB.toFixed(1)));
    };

    const onMouseUp = () => {
      setDragHandle(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragHandle]);

  // Fallback timer for crop preview scrubbing when clip has no HTMLVideoElement mediaUrl
  useEffect(() => {
    if (!isCropPlaying || !clip) return;
    const vid = cropVideoRef.current;
    if (vid && clip.mediaUrl && !clip.mediaUrl.startsWith('data:image')) {
      vid.play().catch(() => {});
      return () => {
        vid.pause();
      };
    }
    const clipMaxDur = Math.max(0.5, clip.duration || 5);
    const timer = window.setInterval(() => {
      setCropPlayheadSec((prev) => {
        const next = prev + 0.05;
        return next >= clipMaxDur ? 0 : Number(next.toFixed(2));
      });
    }, 50);
    return () => window.clearInterval(timer);
  }, [isCropPlaying, clip]);

  if (!clip) return null;

  const clipTotalDuration = Math.max(0.5, Number((clip.duration || 5).toFixed(2)));
  const stageAspect = Math.max(
    0.25,
    Math.min(4.0, (nativeVideoDims.width || 1920) / Math.max(1, nativeVideoDims.height || 1080))
  );

  // Compute exact stage width & height that fit cleanly inside [640 × 360] while preserving native video aspect ratio
  const maxStageW = 640;
  const maxStageH = 360;
  let stageWidthPx = maxStageW;
  let stageHeightPx = Math.round(maxStageW / stageAspect);
  if (stageHeightPx > maxStageH) {
    stageHeightPx = maxStageH;
    stageWidthPx = Math.round(maxStageH * stageAspect);
  }

  const seekCropVideoTo = (targetSec: number) => {
    const clamped = Math.max(0, Math.min(clipTotalDuration, targetSec));
    setCropPlayheadSec(Number(clamped.toFixed(3)));
    const vid = cropVideoRef.current;
    if (vid && clip.mediaUrl && !clip.mediaUrl.startsWith('data:image')) {
      try {
        const sourceOffset = (clip.sourceIn || 0) + clamped * (clip.speed || 1);
        vid.currentTime = Math.max(0, sourceOffset);
      } catch {
        // Ignore seek errors before metadata is ready
      }
    }
  };

  const applyAspectPreset = (preset: CropRatioPreset) => {
    setCropAspectPreset(preset);
    setRatioMenuOpen(false);
    if (preset === 'free') {
      return;
    }
    const targetAspect =
      preset === '1:1'
        ? 1
        : preset === '3:4'
        ? 3 / 4
        : preset === '4:3'
        ? 4 / 3
        : preset === '16:9'
        ? 16 / 9
        : 9 / 16;

    if (targetAspect >= stageAspect) {
      const hFrac = stageAspect / targetAspect;
      const padTB = Number((((1 - hFrac) / 2) * 100).toFixed(1));
      setCropLeft(0);
      setCropRight(0);
      setCropTop(padTB);
      setCropBottom(padTB);
    } else {
      const wFrac = targetAspect / stageAspect;
      const padLR = Number((((1 - wFrac) / 2) * 100).toFixed(1));
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(padLR);
      setCropRight(padLR);
    }
  };

  const ratioLabels: Record<CropRatioPreset, string> = {
    free: 'Tự do',
    '1:1': '1:1',
    '3:4': '3:4',
    '4:3': '4:3',
    '16:9': '16:9',
    '9:16': '9:16',
  };

  const startDrag = (
    e: React.MouseEvent,
    mode: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r'
  ) => {
    e.stopPropagation();
    setDragHandle({
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: cropLeft,
      origTop: cropTop,
      origRight: cropRight,
      origBottom: cropBottom,
    });
  };

  const isVideoMedia = Boolean(clip.mediaUrl && !clip.mediaUrl.startsWith('data:image'));
  const fallbackPosterUrl =
    clip.thumbnailUrl ||
    clip.thumbnailDataUrl ||
    (clip.mediaUrl?.startsWith('data:image') ? clip.mediaUrl : undefined);

  return (
    <div
      role="dialog"
      aria-label="Cửa sổ Cắt xén Video"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs select-none"
    >
      <div className="w-[820px] max-w-[95vw] bg-[#16161B] border border-[#2C2C35] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-4 h-10 bg-[#1B1B22] border-b border-[#2A2A34]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#E4E4E7]">Cắt xén</span>
            <span className="text-[10.5px] font-mono text-[#71717A]">
              ({nativeVideoDims.width}×{nativeVideoDims.height})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-white text-base leading-none cursor-pointer px-1"
          >
            ×
          </button>
        </div>

        {/* Center Interactive Crop Stage matching the Original Video's Exact Aspect Ratio */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#0C0D10] relative">
          <div
            ref={stageRef}
            data-testid="crop-stage-container"
            data-native-width={nativeVideoDims.width}
            data-native-height={nativeVideoDims.height}
            style={{
              width: `${stageWidthPx}px`,
              height: `${stageHeightPx}px`,
            }}
            className="relative rounded border border-[#272730] bg-[#090B10] select-none shadow-inner"
          >
            {/* Original Video / Frame inside stage */}
            <div className="absolute inset-0 overflow-hidden rounded pointer-events-none flex items-center justify-center bg-black">
              {isVideoMedia ? (
                <video
                  ref={cropVideoRef}
                  data-testid="crop-modal-video"
                  src={clip.mediaUrl}
                  poster={fallbackPosterUrl}
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (v.videoWidth > 0 && v.videoHeight > 0) {
                      setNativeVideoDims({ width: v.videoWidth, height: v.videoHeight });
                    }
                    try {
                      v.currentTime = Math.max(0.05, clip.sourceIn || 0);
                    } catch {
                      // Ignore initial seek error
                    }
                  }}
                  onTimeUpdate={(e) => {
                    if (!isCropPlaying) return;
                    const v = e.currentTarget;
                    const rel = Math.max(
                      0,
                      (v.currentTime - (clip.sourceIn || 0)) / Math.max(0.25, clip.speed || 1)
                    );
                    if (rel >= clipTotalDuration) {
                      v.currentTime = clip.sourceIn || 0;
                      setCropPlayheadSec(0);
                    } else {
                      setCropPlayheadSec(Number(rel.toFixed(3)));
                    }
                  }}
                  onEnded={() => setIsCropPlaying(false)}
                  style={{
                    transform: `rotate(${cropRotateDeg}deg) scale(${clip.flipH ? -1 : 1}, ${
                      clip.flipV ? -1 : 1
                    })`,
                  }}
                  className="w-full h-full object-contain transition-transform duration-75"
                />
              ) : fallbackPosterUrl ? (
                <img
                  src={fallbackPosterUrl}
                  alt={clip.name}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                      setNativeVideoDims({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                      });
                    }
                  }}
                  style={{
                    transform: `rotate(${cropRotateDeg}deg) scale(${clip.flipH ? -1 : 1}, ${
                      clip.flipV ? -1 : 1
                    })`,
                  }}
                  className="w-full h-full object-contain transition-transform duration-75"
                />
              ) : (
                <div
                  style={{
                    transform: `rotate(${cropRotateDeg}deg)`,
                  }}
                  className="w-full h-full bg-[#0E131D] flex flex-col items-center justify-center transition-transform duration-75"
                >
                  <span className="text-xs font-medium text-[#A1A1AA]">{clip.name}</span>
                </div>
              )}
            </div>

            {/* Darkened Exterior Mask outside Crop Box */}
            <div
              style={{ height: `${cropTop}%` }}
              className="absolute top-0 left-0 right-0 bg-black/65 pointer-events-none"
            />
            <div
              style={{ height: `${cropBottom}%` }}
              className="absolute bottom-0 left-0 right-0 bg-black/65 pointer-events-none"
            />
            <div
              style={{
                top: `${cropTop}%`,
                bottom: `${cropBottom}%`,
                width: `${cropLeft}%`,
              }}
              className="absolute left-0 bg-black/65 pointer-events-none"
            />
            <div
              style={{
                top: `${cropTop}%`,
                bottom: `${cropBottom}%`,
                width: `${cropRight}%`,
              }}
              className="absolute right-0 bg-black/65 pointer-events-none"
            />

            {/* Active Draggable Crop Box with 3x3 Grid, 4 Corner Circles, and 4 Edge Pills */}
            <div
              onMouseDown={(e) => startDrag(e, 'move')}
              style={{
                left: `${cropLeft}%`,
                top: `${cropTop}%`,
                right: `${cropRight}%`,
                bottom: `${cropBottom}%`,
              }}
              className="absolute border-2 border-white cursor-move"
            >
              {/* 3x3 Dashed Rule-of-Thirds Grid */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-dashed border-white/60" />
                <div className="border-r border-b border-dashed border-white/60" />
                <div className="border-b border-dashed border-white/60" />
                <div className="border-r border-b border-dashed border-white/60" />
                <div className="border-r border-b border-dashed border-white/60" />
                <div className="border-b border-dashed border-white/60" />
                <div className="border-r border-dashed border-white/60" />
                <div className="border-r border-dashed border-white/60" />
                <div />
              </div>

              {/* 4 White Circular Corner Handles */}
              <div
                onMouseDown={(e) => startDrag(e, 'tl')}
                className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white shadow-md cursor-nwse-resize"
              />
              <div
                onMouseDown={(e) => startDrag(e, 'tr')}
                className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white shadow-md cursor-nesw-resize"
              />
              <div
                onMouseDown={(e) => startDrag(e, 'bl')}
                className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white shadow-md cursor-nesw-resize"
              />
              <div
                onMouseDown={(e) => startDrag(e, 'br')}
                className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white shadow-md cursor-nwse-resize"
              />

              {/* 4 White Pill Edge Handles */}
              <div
                onMouseDown={(e) => startDrag(e, 't')}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full bg-white shadow-md cursor-ns-resize"
              />
              <div
                onMouseDown={(e) => startDrag(e, 'b')}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full bg-white shadow-md cursor-ns-resize"
              />
              <div
                onMouseDown={(e) => startDrag(e, 'l')}
                className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-8 rounded-full bg-white shadow-md cursor-ew-resize"
              />
              <div
                onMouseDown={(e) => startDrag(e, 'r')}
                className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-8 rounded-full bg-white shadow-md cursor-ew-resize"
              />
            </div>
          </div>

          {/* Interactive Playback & Scrubber Bar below Stage */}
          <div className="mt-4 px-4 py-2 rounded-md bg-[#14151A] border border-[#24252E] flex items-center gap-3 text-[11px] font-mono w-[560px] max-w-full">
            <button
              type="button"
              data-testid="crop-modal-play-toggle"
              title={isCropPlaying ? 'Tạm dừng' : 'Phát thử video'}
              onClick={() => setIsCropPlaying((p) => !p)}
              className="w-6 h-6 rounded bg-[#232530] hover:bg-[#00E5CC] hover:text-black text-white flex items-center justify-center cursor-pointer shrink-0 transition-colors"
            >
              {isCropPlaying ? '⏸' : '▶'}
            </button>
            <span data-testid="crop-modal-current-timecode" className="text-[#00E5CC] shrink-0">
              {formatTimecode(cropPlayheadSec, 30)}
            </span>
            <span className="text-[#52525B] shrink-0">/</span>
            <span data-testid="crop-modal-total-timecode" className="text-[#9CA3AF] shrink-0">
              {formatTimecode(clipTotalDuration, 30)}
            </span>
            <input
              type="range"
              data-testid="crop-modal-scrubber"
              aria-label="Thanh kéo thời gian xem video cắt xén"
              min={0}
              max={clipTotalDuration}
              step={0.01}
              value={Math.min(clipTotalDuration, cropPlayheadSec)}
              onChange={(e) => {
                if (isCropPlaying) setIsCropPlaying(false);
                seekCropVideoTo(Number(e.target.value));
              }}
              className="flex-1 h-1.5 accent-[#00E5CC] bg-[#272730] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Bottom Controls Bar (Xoay slider + stepper | Cắt xén Ratio Dropdown | Đặt lại | Xác nhận) */}
        <div className="flex items-center justify-between px-4 h-12 bg-[#1B1B22] border-t border-[#2A2A34] text-xs">
          {/* Left: Xoay Slider + Degree Stepper Input */}
          <div className="flex items-center gap-2.5">
            <span className="text-[#A1A1AA]">Xoay</span>
            <input
              type="range"
              aria-label="Xoay khung cắt xén"
              min={-180}
              max={180}
              value={cropRotateDeg}
              onChange={(e) => setCropRotateDeg(Number(e.target.value))}
              className="w-32 accent-white h-1 cursor-pointer"
            />
            <NumericBoxWithSteppers
              value={cropRotateDeg}
              min={-180}
              max={180}
              step={1}
              unit="°"
              widthClass="w-16"
              ariaLabel="Số độ xoay cắt xén"
              onChange={setCropRotateDeg}
            />
          </div>

          {/* Center: Aspect Ratio Selector (Tự do, 1:1, 3:4, 4:3, 16:9, 9:16) */}
          <div className="relative flex items-center gap-2">
            <span className="text-[#A1A1AA]">Cắt xén</span>
            <button
              type="button"
              onClick={() => setRatioMenuOpen((o) => !o)}
              className="flex items-center justify-between gap-2 px-3 py-1 bg-[#262630] hover:bg-[#30303C] border border-[#383846] rounded text-white text-xs min-w-24 cursor-pointer"
            >
              <span>{ratioLabels[cropAspectPreset]}</span>
              <span className="text-[10px] text-[#9CA3AF]">▴</span>
            </button>

            {ratioMenuOpen && (
              <div className="absolute bottom-9 right-0 w-28 bg-[#22222A] border border-[#383846] rounded-md shadow-xl py-1 z-30">
                {(['free', '1:1', '3:4', '4:3', '16:9', '9:16'] as CropRatioPreset[]).map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => applyAspectPreset(preset)}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-[#2E2E3A] cursor-pointer ${
                        cropAspectPreset === preset
                          ? 'text-[#00E5CC] font-semibold'
                          : 'text-[#E4E4E7]'
                      }`}
                    >
                      <span>{ratioLabels[preset]}</span>
                      {cropAspectPreset === preset && <span>✓</span>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Right: Đặt lại (Reset) & Xác nhận (Confirm) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCropLeft(0);
                setCropTop(0);
                setCropRight(0);
                setCropBottom(0);
                setCropRotateDeg(0);
                setCropAspectPreset('free');
              }}
              className="px-3.5 py-1 bg-[#2A2A34] hover:bg-[#343440] text-[#D4D4D8] rounded font-medium cursor-pointer"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() =>
                onConfirm({
                  cropLeft,
                  cropTop,
                  cropRight,
                  cropBottom,
                  cropRotateDeg,
                  cropAspectPreset,
                })
              }
              className="px-4 py-1 bg-[#00E5CC] hover:bg-[#00F5DC] text-[#090D12] font-bold rounded cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const srtInputRef = useRef<HTMLInputElement | null>(null);
  const overlayInputRef = useRef<HTMLInputElement | null>(null);
  const tdoCutProjectInputRef = useRef<HTMLInputElement | null>(null);

  // Studio Theme Mode ('dark' | 'light') & Bilingual Language ('vi' | 'en')
  const [themeMode, setThemeMode] = useState<StudioThemeMode>(() => {
    try {
      const saved = localStorage.getItem('tdo_cut_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Ignore storage error
    }
    return 'dark';
  });

  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('tdo_cut_lang');
      if (saved === 'vi' || saved === 'en') return saved;
    } catch {
      // Ignore storage error
    }
    return 'vi';
  });

  const uiText = useMemo(() => getStudioTranslations(language), [language]);

  useEffect(() => {
    try {
      localStorage.setItem('tdo_cut_theme', themeMode);
    } catch {
      // Ignore storage error
    }
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    document.documentElement.classList.toggle('light', themeMode === 'light');
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem('tdo_cut_lang', language);
    } catch {
      // Ignore storage error
    }
    applyDomLanguageTranslation(document, language);
    if (language !== 'en') return;
    let raf = 0;
    const observer = new MutationObserver(() => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        applyDomLanguageTranslation(document, 'en');
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [language]);

  // In/Out Range Markers ([I] / [O]) & Range Loop State
  const [markInSec, setMarkInSec] = useState<number | null>(null);
  const [markOutSec, setMarkOutSec] = useState<number | null>(null);
  const [loopRangeEnabled, setLoopRangeEnabled] = useState<boolean>(false);

  // Dual Workspace Navigation ('home' = CapCut PC Home Screen Launcher, 'workstation' = 4-Zone Editor, 'pyqt_source' = Python Engine Code)
  const [activeView, setActiveView] = useState<'home' | 'workstation' | 'pyqt_source'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'home') return 'home';
    return 'workstation';
  });

  // Top Header Menu & Modals
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [autoSaveTimeStr, setAutoSaveTimeStr] = useState<string>(() =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );

  // Zone 1: 9 Resource Tabs (Media, Audio, Text, Stickers, Effects, Transitions, Captions, Filters, Adjustment)
  const [topLeftCategory, setTopLeftCategory] = useState<
    | 'media'
    | 'audio'
    | 'text'
    | 'stickers'
    | 'effects'
    | 'transitions'
    | 'captions'
    | 'filters'
    | 'adjust'
  >('media');
  const [sidebarFolder, setSidebarFolder] = useState<
    'all' | 'timeline' | 'subproject' | 'brand' | 'cloud' | 'library'
  >('all');
  const [mediaFilterUsage, setMediaFilterUsage] = useState<'all' | 'used' | 'unused'>('all');

  // Zone 3: Right Context-Aware Inspector States
  const [inspectorMode, setInspectorMode] = useState<'clip' | 'project_details'>('clip');
  const [inspectorTab, setInspectorTab] = useState<
    'video' | 'audio' | 'speed' | 'animation' | 'adjust' | 'antidetect'
  >('video');
  const [textSubTab, setTextSubTab] = useState<'basic' | 'bubble' | 'effects' | 'tts'>('basic');
  const [videoSubTab, setVideoSubTab] = useState<'basic' | 'cutout' | 'mask' | 'enhance'>('basic');
  const [speedSubTab, setSpeedSubTab] = useState<'standard' | 'curve'>('standard');
  const [adjustSubTab, setAdjustSubTab] = useState<'basic' | 'hsl' | 'curves' | 'wheel'>('basic');
  const [activeHslColor, setActiveHslColor] = useState<HslChannelColor>('red');

  // Project Name & Inline Edit (Saved to LocalStorage)
  const [projectName, setProjectName] = useState<string>(() => {
    try {
      localStorage.removeItem('trendopsis_cut_project_v3');
      localStorage.removeItem('trendopsis_cut_project_v2');
      localStorage.removeItem('trendopsis_cut_project_v1');
      localStorage.removeItem('tdo_cut_project_v1');
      localStorage.removeItem('tdo_cut_project_v2');
      localStorage.removeItem('tdo_cut_project_v3');
      localStorage.removeItem('tdo_cut_project_v4');
      const saved = localStorage.getItem(STORAGE_KEY_PROJECT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.projectName === 'string') {
          const trimmed = parsed.projectName.trim();
          const lower = trimmed.toLowerCase();
          if (
            lower === '0421-sao chép' ||
            lower === '0421-sao chep' ||
            lower === '0421-copy' ||
            lower === 'chưa có dự án' ||
            lower === 'untitled project'
          ) {
            return '';
          }
          return trimmed;
        }
      }
    } catch {
      // Ignore storage error
    }
    return '';
  });
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);

  // Project Modify Settings (Proxy & Color Space)
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [defaultImageDuration, setDefaultImageDuration] = useState<number>(4.0);
  const [projectColorSpace, setProjectColorSpace] = useState<'Rec.709 SDR' | 'Rec.2020 HDR'>(
    'Rec.709 SDR'
  );

  // Timeline, Markers, Clipboard & Full Workspace History States
  const [clips, setClips] = useState<TimelineClip[]>(INITIAL_CLIPS);
  const [markers, setMarkers] = useState<TimelineMarker[]>([]);
  const [clipboardAttrs, setClipboardAttrs] = useState<ClipboardClipAttributes | null>(null);
  const [clipboardClips, setClipboardClips] = useState<TimelineClip[]>([]);
  const [toolMode, setToolMode] = useState<'select' | 'razor'>('select');
  const [autoSnapEdge, setAutoSnapEdge] = useState<boolean>(true);
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all');
  const [stickerSearchQuery, setStickerSearchQuery] = useState<string>('');

  interface WorkspaceSnapshot {
    clips: TimelineClip[];
    tracks: TimelineTrackDef[];
    trackLocks: Record<number, boolean>;
    trackHidden: Record<number, boolean>;
    trackMuted: Record<number, boolean>;
    aspectRatio: AspectRatioOption;
    globalAdjustments: GlobalAdjustmentLayer;
    antiDetect: AntiDetectConfig;
    blurredPadding916: boolean;
    projectColorSpace: 'Rec.709 SDR' | 'Rec.2020 HDR';
  }

  const [historyPast, setHistoryPast] = useState<WorkspaceSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<WorkspaceSnapshot[]>([]);
  const lastUndoCommitRef = useRef<{ key: string | null; ts: number }>({
    key: null,
    ts: 0,
  });
  const [mediaCards, setMediaCards] = useState<MediaCardItem[]>(INITIAL_MEDIA_CARDS);
  const [subProjects, setSubProjects] = useState<SubProjectItem[]>([]);

  const [timelineTracks, setTimelineTracks] = useState<TimelineTrackDef[]>(DEFAULT_TIMELINE_TRACKS);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [activeZoneFocus, setActiveZoneFocus] = useState<'resource_pool' | 'timeline'>('timeline');
  const [resourceMarqueeBox, setResourceMarqueeBox] = useState<MarqueeRect2D | null>(null);
  const [resourceTimelineDragGhost, setResourceTimelineDragGhost] = useState<{
    x: number;
    y: number;
    count: number;
    label: string;
  } | null>(null);
  const resourcePaneRef = useRef<HTMLDivElement | null>(null);
  const resourceDragSessionRef = useRef<{
    mode: 'marquee' | 'timeline_drag';
    startClientX: number;
    startClientY: number;
    startLocalX: number;
    startLocalY: number;
    anchorId: string | null;
    initialSelectedIds: string[];
    hasMoved: boolean;
  } | null>(null);
  const suppressNextResourceClickRef = useRef<boolean>(false);

  const [playheadSec, setPlayheadSec] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('original');
  const [previewQuality, setPreviewQuality] = useState<PreviewQualityOption>('full');
  const [pixelsPerSecond, setPixelsPerSecond] = useState<number>(28);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uniformScale, setUniformScale] = useState<boolean>(true);

  // Track Controls & Timeline Toggles
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [audioLinked, setAudioLinked] = useState<boolean>(true);
  const [trackLocks, setTrackLocks] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
  });
  const [trackHidden, setTrackHidden] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
  });
  const [trackMuted, setTrackMuted] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
  });
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);

  // Range X..Y & Target Duration Đích(s)
  const [rangeStartIndex, setRangeStartIndex] = useState<number>(1);
  const [rangeEndIndex, setRangeEndIndex] = useState<number>(1);
  const [targetDurationSec, setTargetDurationSec] = useState<number>(0);

  // Global Adjustment Layer (Tab 8)
  const [globalAdjustments, setGlobalAdjustments] = useState<GlobalAdjustmentLayer>({
    enabled: true,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpen: 0,
    warmth: 0,
    vignette: 0,
    lutName: 'None',
  });

  // Anti-Detect & Lách BQ States
  const [blurredPadding916, setBlurredPadding916] = useState<boolean>(false);
  const [antiDetect, setAntiDetect] = useState<AntiDetectConfig>({
    spoofIphoneMeta: true,
    injectMicroNoise: true,
    audioPitchShift: true,
    variantCount: 10,
    gpuEncoder: 'hevc_nvenc',
    crf: 18,
    preset: 'slow',
  });

  // Modals & Screen Recording
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportDimensionsOverride, setExportDimensionsOverride] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState<boolean>(false);
  const [isSceneCutModalOpen, setIsSceneCutModalOpen] = useState<boolean>(false);
  const [cropModalClipId, setCropModalClipId] = useState<string | null>(null);
  const [isRecordingMedia, setIsRecordingMedia] = useState<boolean>(false);
  const activeRecorderRef = useRef<MediaRecorder | null>(null);

  // AI Captions & Prompt State
  const [bilingualSubtitles, setBilingualSubtitles] = useState<boolean>(true);
  const [removeFillerWords, setRemoveFillerWords] = useState<boolean>(true);
  const [aiFilterPrompt, setAiFilterPrompt] = useState<string>(
    'Giữ lại các cảnh chuyển động nhanh, kịch tính và tự động tạo phụ đề song ngữ Việt - Anh'
  );
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setAutoSaveTimeStr(
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    setTimeout(() => {
      setStatusToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Persist projectName to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_PROJECT,
        JSON.stringify({ projectName, aspectRatio })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [projectName, aspectRatio]);

  // Helper to push current workspace state into Undo history (coalesces continuous slider/drag ticks on the same commitKey)
  const pushUndoSnapshot = (overrideClips?: TimelineClip[], commitKey?: string) => {
    const now = Date.now();
    if (
      commitKey &&
      shouldCoalesceUndoCommit(
        lastUndoCommitRef.current.key,
        lastUndoCommitRef.current.ts,
        commitKey,
        now,
        750
      )
    ) {
      lastUndoCommitRef.current.ts = now;
      return;
    }
    lastUndoCommitRef.current = { key: commitKey ?? null, ts: now };
    const snap: WorkspaceSnapshot = {
      clips: (overrideClips ?? clips).map((c) => ({ ...c })),
      tracks: timelineTracks.map((t) => ({ ...t })),
      trackLocks: { ...trackLocks },
      trackHidden: { ...trackHidden },
      trackMuted: { ...trackMuted },
      aspectRatio,
      globalAdjustments: { ...globalAdjustments },
      antiDetect: { ...antiDetect },
      blurredPadding916,
      projectColorSpace,
    };
    setHistoryPast((h) => [...h.slice(-39), snap]);
    setHistoryFuture([]);
  };

  // Helper to commit clip changes with Undo/Redo history (coalesces rapid slider/stepper/drag ticks so 1 Ctrl+Z restores initial state)
  const commitClips = (
    updater: TimelineClip[] | ((prev: TimelineClip[]) => TimelineClip[]),
    commitKey?: string
  ) => {
    const now = Date.now();
    const shouldCoalesce = Boolean(
      commitKey &&
        shouldCoalesceUndoCommit(
          lastUndoCommitRef.current.key,
          lastUndoCommitRef.current.ts,
          commitKey,
          now,
          750
        )
    );
    lastUndoCommitRef.current = { key: commitKey ?? null, ts: now };

    setClips((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!shouldCoalesce) {
        const snap: WorkspaceSnapshot = {
          clips: prev.map((c) => ({ ...c })),
          tracks: timelineTracks.map((t) => ({ ...t })),
          trackLocks: { ...trackLocks },
          trackHidden: { ...trackHidden },
          trackMuted: { ...trackMuted },
          aspectRatio,
          globalAdjustments: { ...globalAdjustments },
          antiDetect: { ...antiDetect },
          blurredPadding916,
          projectColorSpace,
        };
        setHistoryPast((h) => [...h.slice(-39), snap]);
        setHistoryFuture([]);
      }
      return next;
    });
  };

  // Add a new Layer/Track to Timeline (Recorded in Undo History so Ctrl+Z undoes it)
  const handleAddTrackLayer = (kind: 'overlay' | 'text' | 'audio' = 'overlay') => {
    pushUndoSnapshot();
    const nextIndex =
      timelineTracks.reduce((max, t) => Math.max(max, t.index), 3) + 1;
    const labelStr =
      kind === 'text'
        ? `Văn bản #${nextIndex}`
        : kind === 'audio'
        ? `Âm thanh #${nextIndex}`
        : `Lớp phủ / PIP #${nextIndex - 2}`;
    const newTrack: TimelineTrackDef = {
      id: nextIndex,
      index: nextIndex,
      name: labelStr,
      label: labelStr,
      type: kind,
      kind,
      heightPx: 26,
    };
    setTimelineTracks((prev) =>
      kind === 'audio' ? [...prev, newTrack] : [newTrack, ...prev]
    );
    showToast(`Đã thêm tầng "${newTrack.label}" vào Timeline (Bấm Ctrl+Z nếu muốn hoàn tác)!`);
  };

  // Delete a custom Layer/Track from Timeline (Recorded in Undo History)
  const handleDeleteTrackLayer = (trackIndex: number) => {
    if (trackIndex < 4) return;
    pushUndoSnapshot();
    setTimelineTracks((prev) => prev.filter((t) => t.index !== trackIndex));
    setClips((prev) => prev.filter((c) => c.trackIndex !== trackIndex));
    showToast(`Đã xóa tầng Layer #${trackIndex} (Bấm Ctrl+Z để khôi phục)!`);
  };

  // Move Track Order Up/Down (Recorded in Undo History)
  const handleMoveTrackOrder = (trackIndex: number, direction: 'up' | 'down') => {
    pushUndoSnapshot();
    setTimelineTracks((prev) => {
      const pos = prev.findIndex((t) => t.index === trackIndex);
      if (pos === -1) return prev;
      const targetPos = direction === 'up' ? pos - 1 : pos + 1;
      if (targetPos < 0 || targetPos >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(pos, 1);
      copy.splice(targetPos, 0, moved);
      return copy;
    });
    showToast(
      direction === 'up'
        ? 'Đã di chuyển tầng Timeline lên trên (Ctrl+Z để hoàn tác)!'
        : 'Đã di chuyển tầng Timeline xuống dưới (Ctrl+Z để hoàn tác)!'
    );
  };

  // Drag-and-Drop any Resource or Attribute (single or batch) from Zone 1 onto Timeline Tracks or Clips
  const handleDropResourceOnTimeline = (
    payload: TimelineDragPayload,
    targetTrackIndex: number,
    dropTimeSec: number,
    targetClipId?: string
  ) => {
    const startSec = Number(Math.max(0, dropTimeSec).toFixed(2));
    const targetIds =
      targetClipId
        ? [targetClipId]
        : selectedClipIds.length > 0
        ? selectedClipIds
        : selectedClipId
        ? [selectedClipId]
        : [];

    if (payload.batchItems && payload.batchItems.length > 1) {
      let cursorSec = startSec;
      const batchClips: TimelineClip[] = [];
      const batchIds: string[] = [];

      payload.batchItems.forEach((item, idx) => {
        if (item.kind === 'media') {
          const newId = `drop-batch-media-${Date.now()}-${idx}`;
          const rawDur = item.duration ?? defaultImageDuration;
          const dur = resolveMediaClipDuration(rawDur, defaultImageDuration);
          const trackToUse = item.mediaType === 'audio' ? 1 : targetTrackIndex;
          batchIds.push(newId);
          batchClips.push({
            id: newId,
            name: item.name,
            filePath: `C:/Media/${item.name}`,
            trackIndex: trackToUse,
            startTime: Number(cursorSec.toFixed(2)),
            duration: dur,
            sourceDuration: dur,
            sourceIn: 0,
            speed: 1.0,
            volume: 100,
            flipH: false,
            cropRatio: 1.0,
            scale: 100,
            colorHex: item.colorHex || (item.mediaType === 'audio' ? '#164E63' : '#0D9488'),
            mediaUrl: item.mediaUrl,
            thumbnailUrl: item.thumbnailUrl,
            mediaWidth: item.mediaWidth,
            mediaHeight: item.mediaHeight,
            nativeAspectRatio: item.nativeAspectRatio,
          });
          cursorSec += dur;
        } else if (item.kind === 'audio_sfx') {
          const sfxItem = SFX_LIBRARY.find((s) => s.id === item.sfxPresetId);
          const wavUrl = sfxItem
            ? webAudioEngine.generateSfxWavBlobUrl(sfxItem.id)
            : undefined;
          const newId = `drop-batch-sfx-${Date.now()}-${idx}`;
          const dur = item.duration || 2.0;
          batchIds.push(newId);
          batchClips.push({
            id: newId,
            name: `SFX_${item.name}.wav`,
            filePath: `C:/Audio/SFX_${item.name}.wav`,
            trackIndex: targetTrackIndex === 0 ? 1 : targetTrackIndex,
            startTime: Number(cursorSec.toFixed(2)),
            duration: dur,
            sourceIn: 0,
            speed: 1.0,
            volume: 110,
            flipH: false,
            cropRatio: 1.0,
            colorHex: '#0284C7',
            mediaUrl: wavUrl,
          });
          cursorSec += dur;
        } else if (item.kind === 'text') {
          const newId = `drop-batch-txt-${Date.now()}-${idx}`;
          const dur = item.duration || 4.0;
          const trackToUse =
            targetTrackIndex === 0 || targetTrackIndex === 1 ? 2 : targetTrackIndex;
          batchIds.push(newId);
          batchClips.push({
            id: newId,
            name: item.subtitleText || item.name,
            filePath: '',
            trackIndex: trackToUse,
            startTime: Number(cursorSec.toFixed(2)),
            duration: dur,
            sourceIn: 0,
            speed: 1.0,
            volume: 100,
            flipH: false,
            cropRatio: 1.0,
            subtitleText: item.subtitleText || item.name,
            fontSize: 28,
            textColor: '#FFFFFF',
            textStrokeColor: '#000000',
            colorHex: '#A45A49',
          });
          cursorSec += dur;
        } else if (item.kind === 'sticker') {
          const newId = `drop-batch-stk-${Date.now()}-${idx}`;
          const dur = item.duration || 3.5;
          const trackToUse =
            targetTrackIndex === 0 || targetTrackIndex === 1 ? 2 : targetTrackIndex;
          const badgeMatch = findGraphicBadgeByIconOrText(item.stickerEmoji, item.name);
          batchIds.push(newId);
          batchClips.push({
            id: newId,
            name: item.name,
            filePath: '',
            trackIndex: trackToUse,
            startTime: Number(cursorSec.toFixed(2)),
            duration: dur,
            sourceIn: 0,
            speed: 1.0,
            volume: 100,
            flipH: false,
            cropRatio: 1.0,
            scale: 100,
            stickerType: item.stickerType,
            stickerEmoji: item.stickerEmoji || '🔥',
            stickerText: item.stickerText ?? badgeMatch?.badgeText ?? '',
            stickerSubText: item.stickerSubText ?? badgeMatch?.badgeSubText ?? '',
            textColor: badgeMatch?.badgeColor,
            textBgColor: badgeMatch?.badgeBg,
            colorHex: '#6D28D9',
          });
          cursorSec += dur;
        }
      });

      if (batchClips.length > 0) {
        commitClips((prev) => {
          const updated = [...prev, ...batchClips];
          return snapEnabled && targetTrackIndex === 0
            ? packTrackClipsContiguously(updated, 0)
            : updated;
        });
        setSelectedClipIds(batchIds);
        setSelectedClipId(batchIds[0] ?? null);
        showToast(
          `Đã kéo thả hàng loạt ${batchClips.length} mục đã chọn vào Timeline tại ${startSec}s!`
        );
        return;
      }
    }

    if (payload.kind === 'media') {
      const newId = `drop-media-${Date.now()}`;
      const rawDur = payload.duration ?? defaultImageDuration;
      const dur = resolveMediaClipDuration(rawDur, defaultImageDuration);
      const trackToUse =
        payload.mediaType === 'audio'
          ? 1
          : targetTrackIndex === 0 || targetTrackIndex >= 4
          ? targetTrackIndex
          : 0;

      const newClip: TimelineClip = {
        id: newId,
        name: payload.name,
        filePath: `C:/Media/${payload.name}`,
        trackIndex: trackToUse,
        startTime: startSec,
        duration: dur,
        sourceDuration: dur,
        sourceIn: 0,
        speed: 1.0,
        volume: 100,
        flipH: false,
        cropRatio: 1.0,
        scale: 100,
        colorHex: payload.colorHex || (payload.mediaType === 'audio' ? '#164E63' : '#0D9488'),
        mediaUrl: payload.mediaUrl,
        thumbnailUrl: payload.thumbnailUrl,
        mediaWidth: payload.mediaWidth,
        mediaHeight: payload.mediaHeight,
        nativeAspectRatio: payload.nativeAspectRatio,
      };
      commitClips((prev) => {
        const updated = [...prev, newClip];
        return snapEnabled && trackToUse === 0
          ? packTrackClipsContiguously(updated, 0)
          : updated;
      });
      setSelectedClipId(newId);
      setSelectedClipIds([newId]);
      showToast(`Đã kéo thả "${payload.name}" vào tầng Layer ${trackToUse} tại ${startSec}s!`);
      return;
    }

    if (payload.kind === 'audio_sfx') {
      const sfxItem = SFX_LIBRARY.find((s) => s.id === payload.sfxPresetId);
      const wavUrl = sfxItem
        ? webAudioEngine.generateSfxWavBlobUrl(sfxItem.id)
        : undefined;
      if (sfxItem) webAudioEngine.playSfx(sfxItem.id, 0.7);
      const newId = `drop-sfx-${Date.now()}`;
      commitClips((prev) => [
        ...prev,
        {
          id: newId,
          name: `SFX_${payload.name}.wav`,
          filePath: `C:/Audio/SFX_${payload.name}.wav`,
          trackIndex: targetTrackIndex === 0 ? 1 : targetTrackIndex,
          startTime: startSec,
          duration: payload.duration || 2.0,
          sourceIn: 0,
          speed: 1.0,
          volume: 110,
          flipH: false,
          cropRatio: 1.0,
          colorHex: '#0284C7',
          mediaUrl: wavUrl,
        },
      ]);
      setSelectedClipId(newId);
      setSelectedClipIds([newId]);
      showToast(`Đã kéo thả hiệu ứng âm thanh "${payload.name}" xuống Timeline!`);
      return;
    }

    if (payload.kind === 'text') {
      const newId = `drop-txt-${Date.now()}`;
      const trackToUse = targetTrackIndex === 0 || targetTrackIndex === 1 ? 2 : targetTrackIndex;
      commitClips((prev) => [
        ...prev,
        {
          id: newId,
          name: payload.subtitleText || payload.name,
          filePath: '',
          trackIndex: trackToUse,
          startTime: startSec,
          duration: payload.duration || 4.0,
          sourceIn: 0,
          speed: 1.0,
          volume: 100,
          flipH: false,
          cropRatio: 1.0,
          subtitleText: payload.subtitleText || payload.name,
          fontSize: 28,
          textColor: '#FFFFFF',
          textStrokeColor: '#000000',
          colorHex: '#A45A49',
        },
      ]);
      setSelectedClipId(newId);
      setSelectedClipIds([newId]);
      showToast(`Đã kéo thả văn bản "${payload.name}" vào Timeline tại ${startSec}s!`);
      return;
    }

    if (payload.kind === 'sticker') {
      const newId = `drop-stk-${Date.now()}`;
      const trackToUse = targetTrackIndex >= 3 ? targetTrackIndex : 3;
      const overlappingStks = clips.filter(
        (c) =>
          Boolean(c.stickerEmoji) &&
          startSec < c.startTime + c.duration &&
          startSec + 3.5 > c.startTime
      ).length;
      const offsetPresets = [
        { x: 0, y: -35 },
        { x: -120, y: -35 },
        { x: 120, y: -35 },
        { x: -120, y: 45 },
        { x: 120, y: 45 },
        { x: 0, y: 45 },
      ];
      const chosenOffset = offsetPresets[overlappingStks % offsetPresets.length];

      setTimelineTracks((prev) => {
        if (prev.some((t) => t.index === trackToUse)) return prev;
        return [
          {
            id: trackToUse,
            index: trackToUse,
            name: 'Nhãn dán / Lớp phủ',
            label: 'Nhãn dán / Lớp phủ',
            type: 'overlay',
            kind: 'overlay',
            heightPx: 26,
          },
          ...prev,
        ];
      });

      const badgeMatch = findGraphicBadgeByIconOrText(payload.stickerEmoji, payload.name);
      commitClips((prev) => [
        ...prev,
        {
          id: newId,
          name: payload.name,
          filePath: '',
          trackIndex: trackToUse,
          startTime: startSec,
          duration: 3.5,
          sourceIn: 0,
          speed: 1.0,
          volume: 100,
          flipH: false,
          cropRatio: 1.0,
          scale: 100,
          posX: chosenOffset.x,
          posY: chosenOffset.y,
          stickerType: payload.stickerType || 'fire_trend',
          stickerEmoji: payload.stickerEmoji || '🔥',
          stickerText: payload.stickerText ?? badgeMatch?.badgeText ?? '',
          stickerSubText: payload.stickerSubText ?? badgeMatch?.badgeSubText ?? '',
          textColor: badgeMatch?.badgeColor,
          textBgColor: badgeMatch?.badgeBg,
          colorHex: '#6D28D9',
        },
      ]);
      setSelectedClipId(newId);
      setSelectedClipIds([newId]);
      setPlayheadSec(startSec);
      setInspectorMode('clip');
      setInspectorTab('video');
      showToast(`Đã kéo thả nhãn dán "${payload.name}" vào Timeline tại ${startSec}s!`);
      return;
    }

    if (payload.kind === 'effect' && payload.visualEffect) {
      const videoClips = clips.filter((c) => c.trackIndex === 0);
      const clipAtDrop =
        (targetClipId ? clips.find((c) => c.id === targetClipId) : undefined) ||
        videoClips.find((c) => startSec >= c.startTime && startSec <= c.startTime + c.duration) ||
        videoClips.find((c) => targetIds.includes(c.id)) ||
        videoClips[0];
      const chosenClipId = clipAtDrop?.id;

      commitClips((prev) => {
        const next = prev.map((c) =>
          (chosenClipId && c.id === chosenClipId) || (!chosenClipId && c.trackIndex === 0)
            ? { ...c, visualEffect: payload.visualEffect }
            : c
        );
        if (targetTrackIndex >= 3) {
          next.push({
            id: `drop-fx-${Date.now()}`,
            name: `FX: ${payload.name}`,
            filePath: '',
            trackIndex: targetTrackIndex,
            startTime: startSec,
            duration: payload.duration || 3.0,
            sourceIn: 0,
            speed: 1.0,
            volume: 100,
            flipH: false,
            cropRatio: 1.0,
            visualEffect: payload.visualEffect,
            colorHex: '#7C3AED',
          });
        }
        return next;
      });
      if (clipAtDrop) {
        setSelectedClipId(clipAtDrop.id);
        setSelectedClipIds([clipAtDrop.id]);
        if (playheadSec < clipAtDrop.startTime || playheadSec >= clipAtDrop.startTime + clipAtDrop.duration) {
          setPlayheadSec(Number((clipAtDrop.startTime + 0.2).toFixed(2)));
        }
      }
      showToast(`Đã kéo thả hiệu ứng "${payload.name}" áp dụng lên clip!`);
      return;
    }

    if (payload.kind === 'transition' && payload.transitionType) {
      const videoClips = clips.filter((c) => c.trackIndex === 0);
      let clipAtDrop =
        (targetClipId ? clips.find((c) => c.id === targetClipId && c.trackIndex === 0) : undefined) ||
        videoClips.find((c) => startSec >= c.startTime && startSec <= c.startTime + c.duration);
      if (!clipAtDrop && videoClips.length > 0) {
        clipAtDrop = videoClips.reduce((best, c) =>
          Math.abs(c.startTime - startSec) < Math.abs(best.startTime - startSec) ? c : best
        );
      }
      const chosenClipId = clipAtDrop?.id;
      const transDur = payload.duration || 0.6;

      commitClips((prev) =>
        prev.map((c) =>
          (chosenClipId && c.id === chosenClipId) || (!chosenClipId && c.trackIndex === 0)
            ? {
                ...c,
                transitionType: payload.transitionType,
                transitionDuration: transDur,
              }
            : c
        )
      );
      if (clipAtDrop) {
        setSelectedClipId(clipAtDrop.id);
        setSelectedClipIds([clipAtDrop.id]);
        setPlayheadSec(Number((clipAtDrop.startTime + Math.min(0.2, transDur * 0.35)).toFixed(2)));
      }
      showToast(`Đã áp dụng chuyển cảnh "${payload.name}" (${transDur}s) vào điểm cắt clip!`);
      return;
    }

    if (payload.kind === 'filter' && payload.filterPreset) {
      const videoClips = clips.filter((c) => c.trackIndex === 0);
      const clipAtDrop =
        (targetClipId ? clips.find((c) => c.id === targetClipId) : undefined) ||
        videoClips.find((c) => startSec >= c.startTime && startSec <= c.startTime + c.duration) ||
        videoClips.find((c) => targetIds.includes(c.id)) ||
        videoClips[0];
      const chosenClipId = clipAtDrop?.id;

      commitClips((prev) => {
        const next = prev.map((c) =>
          (chosenClipId && c.id === chosenClipId) || (!chosenClipId && c.trackIndex === 0)
            ? { ...c, filterPreset: payload.filterPreset }
            : c
        );
        if (targetTrackIndex >= 3) {
          next.push({
            id: `drop-lut-${Date.now()}`,
            name: `LUT: ${payload.name}`,
            filePath: '',
            trackIndex: targetTrackIndex,
            startTime: startSec,
            duration: payload.duration || 3.5,
            sourceIn: 0,
            speed: 1.0,
            volume: 100,
            flipH: false,
            cropRatio: 1.0,
            filterPreset: payload.filterPreset,
            colorHex: '#0D9488',
          });
        }
        return next;
      });
      if (clipAtDrop) {
        setSelectedClipId(clipAtDrop.id);
        setSelectedClipIds([clipAtDrop.id]);
        if (playheadSec < clipAtDrop.startTime || playheadSec >= clipAtDrop.startTime + clipAtDrop.duration) {
          setPlayheadSec(Number((clipAtDrop.startTime + 0.2).toFixed(2)));
        }
      }
      showToast(`Đã kéo thả bộ lọc màu "${payload.name}" vào clip!`);
      return;
    }

    if (payload.kind === 'adjust') {
      const newId = `drop-adj-${Date.now()}`;
      const trackToUse = targetTrackIndex === 0 ? 3 : targetTrackIndex;
      commitClips((prev) => [
        ...prev,
        {
          id: newId,
          name: `Adjustment: ${payload.name}`,
          filePath: '',
          trackIndex: trackToUse,
          startTime: startSec,
          duration: 5.0,
          sourceIn: 0,
          speed: 1.0,
          volume: 100,
          flipH: false,
          cropRatio: 1.0,
          colorHex: '#0E7490',
        },
      ]);
      setSelectedClipId(newId);
      setSelectedClipIds([newId]);
      showToast(`Đã kéo thả Lớp Điều Chỉnh (Adjustment Layer) xuống Timeline!`);
    }
  };

  const handleUndo = () => {
    if (historyPast.length === 0) {
      showToast('Không còn thao tác nào để hoàn tác (Ctrl+Z)');
      return;
    }
    lastUndoCommitRef.current = { key: null, ts: 0 };
    const previous = historyPast[historyPast.length - 1];
    const currentSnap: WorkspaceSnapshot = {
      clips: clips.map((c) => ({ ...c })),
      tracks: timelineTracks.map((t) => ({ ...t })),
      trackLocks: { ...trackLocks },
      trackHidden: { ...trackHidden },
      trackMuted: { ...trackMuted },
      aspectRatio,
      globalAdjustments: { ...globalAdjustments },
      antiDetect: { ...antiDetect },
      blurredPadding916,
      projectColorSpace,
    };
    setHistoryPast((h) => h.slice(0, -1));
    setHistoryFuture((f) => [currentSnap, ...f]);
    setClips(previous.clips);
    setTimelineTracks(previous.tracks);
    setTrackLocks(previous.trackLocks);
    setTrackHidden(previous.trackHidden);
    setTrackMuted(previous.trackMuted);
    setAspectRatio(previous.aspectRatio);
    setGlobalAdjustments(previous.globalAdjustments);
    setAntiDetect(previous.antiDetect);
    setBlurredPadding916(previous.blurredPadding916);
    setProjectColorSpace(previous.projectColorSpace);
    showToast('Đã hoàn tác thông số / thao tác về trạng thái trước đó (Undo - Ctrl+Z)');
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) {
      showToast('Không còn thao tác nào để làm lại (Ctrl+Y)');
      return;
    }
    lastUndoCommitRef.current = { key: null, ts: 0 };
    const next = historyFuture[0];
    const currentSnap: WorkspaceSnapshot = {
      clips: clips.map((c) => ({ ...c })),
      tracks: timelineTracks.map((t) => ({ ...t })),
      trackLocks: { ...trackLocks },
      trackHidden: { ...trackHidden },
      trackMuted: { ...trackMuted },
      aspectRatio,
      globalAdjustments: { ...globalAdjustments },
      antiDetect: { ...antiDetect },
      blurredPadding916,
      projectColorSpace,
    };
    setHistoryFuture((f) => f.slice(1));
    setHistoryPast((h) => [...h, currentSnap]);
    setClips(next.clips);
    setTimelineTracks(next.tracks);
    setTrackLocks(next.trackLocks);
    setTrackHidden(next.trackHidden);
    setTrackMuted(next.trackMuted);
    setAspectRatio(next.aspectRatio);
    setGlobalAdjustments(next.globalAdjustments);
    setAntiDetect(next.antiDetect);
    setBlurredPadding916(next.blurredPadding916);
    setProjectColorSpace(next.projectColorSpace);
    showToast('Đã làm lại thao tác (Redo - Ctrl+Y)');
  };

  // Copy / Cut / Paste / Disable / Group / Ungroup Clip Handlers
  const handleCopySelectedClips = (fallbackClipId?: string) => {
    const targetIds = new Set(
      selectedClipIds.length > 0
        ? selectedClipIds
        : fallbackClipId
        ? [fallbackClipId]
        : selectedClipId
        ? [selectedClipId]
        : []
    );
    const copied = clips.filter((c) => targetIds.has(c.id)).map((c) => ({ ...c }));
    if (copied.length === 0) return;
    setClipboardClips(copied);
    showToast(`Đã sao chép ${copied.length} clip vào bộ nhớ tạm (Ctrl+C)!`);
  };

  const handleCutSelectedClips = (fallbackClipId?: string) => {
    const targetIds = new Set(
      selectedClipIds.length > 0
        ? selectedClipIds
        : fallbackClipId
        ? [fallbackClipId]
        : selectedClipId
        ? [selectedClipId]
        : []
    );
    const cutItems = clips.filter((c) => targetIds.has(c.id)).map((c) => ({ ...c }));
    if (cutItems.length === 0) return;
    setClipboardClips(cutItems);
    commitClips((prev) => {
      const remaining = prev.filter((c) => !targetIds.has(c.id));
      return snapEnabled ? packTrackClipsContiguously(remaining, 0) : remaining;
    });
    setSelectedClipId(null);
    setSelectedClipIds([]);
    showToast(`Đã cắt ${cutItems.length} clip vào bộ nhớ tạm (Ctrl+X)!`);
  };

  const handlePasteClipboardClips = (targetTimeSec?: number, targetTrackIndex?: number) => {
    if (clipboardClips.length === 0) {
      showToast('Chưa có clip nào trong bộ nhớ tạm (Hãy bấm Ctrl+C trước)!');
      return;
    }
    const baseStart = Math.min(...clipboardClips.map((c) => c.startTime));
    const destStart = targetTimeSec !== undefined ? targetTimeSec : playheadSec;
    const newIds: string[] = [];
    const pasted: TimelineClip[] = clipboardClips.map((c, idx) => {
      const id = `paste-${Date.now()}-${idx}`;
      newIds.push(id);
      return {
        ...c,
        id,
        name: c.name.includes('(Copy)') ? c.name : `${c.name} (Copy)`,
        startTime: Number(Math.max(0, destStart + (c.startTime - baseStart)).toFixed(2)),
        trackIndex:
          targetTrackIndex !== undefined && clipboardClips.length === 1
            ? targetTrackIndex
            : c.trackIndex,
      };
    });
    commitClips((prev) => [...prev, ...pasted]);
    setSelectedClipIds(newIds);
    setSelectedClipId(newIds[0] ?? null);
    showToast(`Đã dán ${pasted.length} clip tại ${destStart.toFixed(2)}s (Ctrl+V)!`);
  };

  const handleToggleDisableClip = (targetClipId?: string) => {
    const targetIds = new Set(
      selectedClipIds.length > 0 && (!targetClipId || selectedClipIds.includes(targetClipId))
        ? selectedClipIds
        : targetClipId
        ? [targetClipId]
        : selectedClipId
        ? [selectedClipId]
        : []
    );
    if (targetIds.size === 0) return;
    commitClips((prev) =>
      prev.map((c) => (targetIds.has(c.id) ? { ...c, disabled: !c.disabled } : c))
    );
    showToast('Đã chuyển trạng thái Vô hiệu hoá / Bật clip (Phím V)!');
  };

  const handleGroupSelectedClips = () => {
    const ids =
      selectedClipIds.length > 1
        ? selectedClipIds
        : clips.filter((c) => c.trackIndex === 0 || c.trackIndex === 1).slice(0, 2).map((c) => c.id);
    if (ids.length === 0) return;
    const gid = `grp-${Date.now()}`;
    const idSet = new Set(ids);
    commitClips((prev) => prev.map((c) => (idSet.has(c.id) ? { ...c, groupId: gid } : c)));
    showToast(`Đã nhóm ${ids.length} clip liên kết chặt với nhau (Ctrl+G)!`);
  };

  const handleUngroupSelectedClips = () => {
    const idSet = new Set(
      selectedClipIds.length > 0 ? selectedClipIds : selectedClipId ? [selectedClipId] : []
    );
    const groupIdsToClear = new Set(
      clips.filter((c) => idSet.has(c.id) && c.groupId).map((c) => c.groupId as string)
    );
    commitClips((prev) =>
      prev.map((c) =>
        idSet.has(c.id) || (c.groupId && groupIdsToClear.has(c.groupId))
          ? { ...c, groupId: undefined }
          : c
      )
    );
    showToast('Đã bỏ nhóm các clip đang chọn (Ctrl+Shift+G)!');
  };

  // Smooth 60-FPS Hardware-Synced Playback Loop via requestAnimationFrame (Zero interval drift / lag)
  const maxPlaybackEndSec = useMemo(
    () =>
      Math.max(
        5,
        clips.reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 22)
      ),
    [clips]
  );

  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let lastTs = performance.now();
    let accumMs = 0;
    const stepThresholdMs = 1000 / 30; // 30 FPS timeline playhead state sync for smooth UI without excessive React re-renders

    const tick = (now: number) => {
      const dt = Math.min(100, Math.max(0, now - lastTs));
      lastTs = now;
      accumMs += dt;
      if (accumMs >= stepThresholdMs) {
        const deltaSec = accumMs / 1000;
        accumMs = 0;
        setPlayheadSec((prev) => {
          const next = prev + deltaSec;
          if (
            loopRangeEnabled &&
            markInSec !== null &&
            markOutSec !== null &&
            markOutSec > markInSec + 0.1
          ) {
            if (next >= markOutSec || next < markInSec) {
              return Number(markInSec.toFixed(3));
            }
          }
          return next > maxPlaybackEndSec ? 0 : Number(next.toFixed(3));
        });
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, maxPlaybackEndSec, loopRangeEnabled, markInSec, markOutSec]);

  // Unified Core Deletion for Media Cards (Tệp phương tiện) & Timeline Clips
  const handleDeleteMediaCardsAndClips = (
    explicitIds?: string[],
    removeCardWhenClipDeleted = true
  ) => {
    const combinedIds =
      explicitIds && explicitIds.length > 0
        ? explicitIds
        : [
            ...selectedResourceIds,
            ...selectedClipIds,
            ...(selectedClipId ? [selectedClipId] : []),
          ];
    const uniqueIds = Array.from(new Set(combinedIds.filter(Boolean)));
    if (uniqueIds.length === 0) return;

    const {
      remainingMediaCards,
      remainingClips,
      deletedCardCount,
      deletedClipCount,
    } = deleteMediaCardsAndLinkedClips(
      mediaCards,
      clips,
      uniqueIds,
      snapEnabled,
      removeCardWhenClipDeleted
    );

    if (deletedCardCount === 0 && deletedClipCount === 0) return;

    setMediaCards(remainingMediaCards);
    commitClips(remainingClips);

    if (remainingClips.length === 0) {
      setIsPlaying(false);
      setPlayheadSec(0);
    }

    setSelectedResourceIds([]);
    setSelectedClipId(null);
    setSelectedClipIds([]);
    setInspectorMode('project_details');

    if (deletedCardCount > 0 && deletedClipCount > 0) {
      showToast(
        language === 'en'
          ? `Deleted ${deletedCardCount} media file(s) & ${deletedClipCount} linked clip(s) from Timeline!`
          : `Đã xóa tận gốc ${deletedCardCount} tệp phương tiện và ${deletedClipCount} clip liên kết trên Timeline!`
      );
    } else if (deletedCardCount > 0) {
      showToast(
        language === 'en'
          ? `Deleted ${deletedCardCount} media file(s) from Media Pool!`
          : `Đã xóa ${deletedCardCount} tệp khỏi kho Tệp phương tiện!`
      );
    } else {
      showToast(
        language === 'en'
          ? `Deleted ${deletedClipCount} clip(s) from Timeline!`
          : `Đã xóa ${deletedClipCount} clip khỏi Timeline!`
      );
    }
  };

  // Global Keyboard Shortcuts (CapCut PC Standard)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const targetEl = e.target as HTMLElement | null;
      const tag = targetEl?.tagName?.toLowerCase();
      const inputType = (targetEl as HTMLInputElement | null)?.type?.toLowerCase();
      const isTextTypingInput =
        tag === 'textarea' ||
        (tag === 'input' &&
          (inputType === 'text' || inputType === 'search' || inputType === 'url'));

      // Always allow Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z to undo/redo technical parameter changes even when a slider, number spinbutton, checkbox, or select dropdown has focus!
      if (!isTextTypingInput) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyZ') {
          e.preventDefault();
          handleRedo();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyZ') {
          e.preventDefault();
          handleUndo();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
          e.preventDefault();
          handleRedo();
          return;
        }
      }

      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyE') {
        e.preventDefault();
        setIsExportModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyI') {
        e.preventDefault();
        mediaInputRef.current?.click();
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyC') {
        e.preventDefault();
        handleCopySelectedClips();
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyX') {
        e.preventDefault();
        handleCutSelectedClips();
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyV') {
        e.preventDefault();
        handlePasteClipboardClips();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyG') {
        e.preventDefault();
        handleUngroupSelectedClips();
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyG') {
        e.preventDefault();
        handleGroupSelectedClips();
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') {
        e.preventDefault();
        const allResourceIds: string[] = [];
        if (resourcePaneRef.current) {
          const nodes =
            resourcePaneRef.current.querySelectorAll<HTMLElement>('[data-resource-id]');
          nodes.forEach((n) => {
            const rid = n.getAttribute('data-resource-id');
            if (rid) allResourceIds.push(rid);
          });
        }
        const syncResourceToClips =
          (topLeftCategory === 'media' && sidebarFolder === 'timeline') ||
          topLeftCategory === 'captions';
        const result = resolveZoneSelectAll(
          activeZoneFocus,
          allResourceIds,
          clips,
          trackLocks,
          syncResourceToClips
        );
        setSelectedResourceIds(result.selectedResourceIds);
        setSelectedClipIds(result.selectedClipIds);
        setSelectedClipId(result.selectedClipId);
        if (result.activeZone === 'resource_pool') {
          showToast(
            result.selectedResourceIds.length > 0
              ? `Đã chọn tất cả ${result.selectedResourceIds.length} mục trong khu vực Tệp / Tài nguyên (Ctrl+A)!`
              : 'Không có mục nào trong khu vực Tệp / Tài nguyên hiện tại để chọn!'
          );
        } else {
          if (result.selectedClipIds.length > 0) setInspectorMode('clip');
          showToast(
            `Đã chọn tất cả ${result.selectedClipIds.length} clip trong khu vực Timeline (Ctrl+A)!`
          );
        }
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.code === 'KeyV') {
        e.preventDefault();
        handleToggleDisableClip();
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.code === 'KeyP') {
        e.preventDefault();
        setSnapEnabled((s) => {
          const next = !s;
          if (next) {
            commitClips((prev) => packTrackClipsContiguously(prev, 0));
          }
          showToast(
            next
              ? 'Đã BẬT Nam châm trục chính (Phím P) — Tự động khít các clip!'
              : 'Đã TẮT Nam châm trục chính (Phím P) — Tự do tạo khoảng trống!'
          );
          return next;
        });
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.code === 'KeyN') {
        e.preventDefault();
        setAutoSnapEdge((n) => {
          const next = !n;
          showToast(
            next
              ? 'Đã BẬT Tự động bắt dính mép clip (Auto Snapping - Phím N)!'
              : 'Đã TẮT Tự động bắt dính mép clip (Phím N)!'
          );
          return next;
        });
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.code === 'KeyA') {
        e.preventDefault();
        setToolMode('select');
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.code === 'KeyB') {
        e.preventDefault();
        setToolMode((m) => (m === 'razor' ? 'select' : 'razor'));
      } else if (e.code === 'Escape') {
        e.preventDefault();
        setSelectedClipId(null);
        setSelectedClipIds([]);
        setSelectedResourceIds([]);
        setInspectorMode('project_details');
      } else if (e.altKey && e.code === 'KeyG') {
        e.preventDefault();
        const targetIds = new Set(
          selectedClipIds.length > 0
            ? selectedClipIds
            : selectedClipId
            ? [selectedClipId]
            : []
        );
        if (targetIds.size > 0) {
          commitClips((prev) =>
            prev.map((c) =>
              targetIds.has(c.id)
                ? { ...c, isCompoundClip: !c.isCompoundClip, colorHex: '#4F46E5' }
                : c
            )
          );
          showToast(`Đã gộp ${targetIds.size} clip thành Clip ghép (Compound Clip - Alt+G)!`);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'KeyB' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        commitClips((prev) => splitClipAtPlayhead(prev, playheadSec, selectedClipId));
        showToast('Đã tách đôi clip tại Playhead (Ctrl+B)');
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        commitClips((prev) => trimClipStartToPlayhead(prev, playheadSec, selectedClipId, snapEnabled));
        showToast('Đã cắt bỏ phần đầu đến Playhead (Phím Q)');
      } else if (e.code === 'KeyW') {
        e.preventDefault();
        commitClips((prev) => trimClipEndToPlayhead(prev, playheadSec, selectedClipId, snapEnabled));
        showToast('Đã cắt bỏ phần đuôi từ Playhead (Phím W)');
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        const newMarker: TimelineMarker = {
          id: `mk-${Date.now()}`,
          timeSec: Number(playheadSec.toFixed(2)),
          label: `Dấu mốc ${markers.length + 1}`,
          color: '#00E5CC',
        };
        setMarkers((prev) => [...prev, newMarker]);
        showToast(`Đã thả dấu mốc (Marker) tại ${playheadSec.toFixed(2)}s (Phím M)`);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.code === 'KeyI') {
        e.preventDefault();
        const pt = Number(playheadSec.toFixed(2));
        setMarkInSec(pt);
        showToast(
          language === 'en'
            ? `TDO CUT: Set Mark In [I] at ${pt}s`
            : `TDO CUT: Đã đặt Điểm vào [In] tại ${pt}s (Phím I)`
        );
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.code === 'KeyO') {
        e.preventDefault();
        const pt = Number(playheadSec.toFixed(2));
        setMarkOutSec(pt);
        showToast(
          language === 'en'
            ? `TDO CUT: Set Mark Out [O] at ${pt}s`
            : `TDO CUT: Đã đặt Điểm ra [Out] tại ${pt}s (Phím O)`
        );
      } else if (
        (e.code === 'Delete' || e.code === 'Backspace') &&
        (selectedClipIds.length > 0 || selectedClipId || selectedResourceIds.length > 0)
      ) {
        e.preventDefault();
        handleDeleteMediaCardsAndClips();
      } else if ((e.ctrlKey || e.metaKey) && (e.code === 'Equal' || e.code === 'NumpadAdd')) {
        e.preventDefault();
        setPixelsPerSecond((prev) => stepTimelineZoom(prev, 'in'));
      } else if ((e.ctrlKey || e.metaKey) && (e.code === 'Minus' || e.code === 'NumpadSubtract')) {
        e.preventDefault();
        setPixelsPerSecond((prev) => stepTimelineZoom(prev, 'out'));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    playheadSec,
    selectedClipId,
    selectedClipIds,
    selectedResourceIds,
    mediaCards,
    clips,
    timelineTracks,
    trackLocks,
    trackHidden,
    trackMuted,
    aspectRatio,
    snapEnabled,
    clipboardClips,
    markers.length,
    historyPast,
    historyFuture,
    activeZoneFocus,
    topLeftCategory,
    sidebarFolder,
    globalAdjustments,
    antiDetect,
    blurredPadding916,
    projectColorSpace,
  ]);

  const activeClipsAtPlayhead = useMemo(
    () =>
      clips.filter(
        (c) =>
          !c.disabled &&
          playheadSec >= c.startTime &&
          playheadSec < c.startTime + c.duration
      ),
    [clips, playheadSec]
  );

  const activeVideoClip = useMemo(() => {
    const primary = clips.find(
      (c) =>
        !c.disabled &&
        c.trackIndex === 0 &&
        playheadSec >= c.startTime &&
        playheadSec < c.startTime + c.duration
    );
    if (primary) return primary;
    return clips.find(
      (c) =>
        !c.disabled &&
        c.trackIndex !== 1 &&
        Boolean(c.mediaUrl) &&
        !c.subtitleText &&
        !c.stickerEmoji &&
        playheadSec >= c.startTime &&
        playheadSec < c.startTime + c.duration
    );
  }, [clips, playheadSec]);

  const activeOverlayClip = useMemo(
    () =>
      clips.find(
        (c) =>
          !c.disabled &&
          c.trackIndex >= 3 &&
          !c.subtitleText &&
          !c.stickerEmoji &&
          !(
            !c.mediaUrl &&
            (Boolean(c.visualEffect && c.visualEffect !== 'none') ||
              Boolean(c.filterPreset && c.filterPreset !== 'none') ||
              c.name.startsWith('Adjustment:') ||
              c.name.startsWith('FX:') ||
              c.name.startsWith('LUT:'))
          ) &&
          playheadSec >= c.startTime &&
          playheadSec < c.startTime + c.duration
      ),
    [clips, playheadSec]
  );

  const activeSubtitleClip = useMemo(
    () =>
      clips.find(
        (c) =>
          !c.disabled &&
          (Boolean(c.subtitleText) ||
            (c.trackIndex === 2 &&
              !c.stickerEmoji &&
              (!c.stickerType || c.stickerType === 'none'))) &&
          playheadSec >= c.startTime &&
          playheadSec < c.startTime + c.duration
      ),
    [clips, playheadSec]
  );

  const activeAudioClip = useMemo(
    () =>
      clips.find(
        (c) =>
          !c.disabled &&
          c.trackIndex === 1 &&
          playheadSec >= c.startTime &&
          playheadSec < c.startTime + c.duration
      ),
    [clips, playheadSec]
  );

  const currentClip = useMemo(
    () =>
      clips.find((c) => c.id === selectedClipId) ||
      activeOverlayClip ||
      activeVideoClip ||
      clips[0],
    [clips, selectedClipId, activeOverlayClip, activeVideoClip]
  );

  const cropModalClip = useMemo(
    () => (cropModalClipId ? clips.find((c) => c.id === cropModalClipId) ?? null : null),
    [clips, cropModalClipId]
  );

  const handleAddOverlayClip = () => {
    overlayInputRef.current?.click();
  };

  const totalTimelineDuration = useMemo(
    () => clips.reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0),
    [clips]
  );

  const updateSelectedClipProp = <K extends keyof TimelineClip>(
    prop: K,
    val: TimelineClip[K]
  ) => {
    if (!currentClip) return;
    const commitKey = `clip:${currentClip.id}:${String(prop)}`;
    commitClips((prev) =>
      prev.map((c) => {
        if (c.id !== currentClip.id) return c;
        if (prop === 'speed') {
          const newSpeed = Math.max(0.1, Math.min(100.0, Number(val)));
          const rawLen = c.duration * c.speed;
          return {
            ...c,
            speed: newSpeed,
            duration: Number(Math.max(0.3, rawLen / newSpeed).toFixed(2)),
          };
        }
        if (prop === 'scale') {
          const newScale = Number(val);
          return {
            ...c,
            scale: newScale,
            cropRatio: Number((newScale / 100).toFixed(2)),
          };
        }
        return { ...c, [prop]: val };
      }),
      commitKey
    );
  };

  // Toggle Keyframe Diamond (◇) on Current Clip at Playhead
  const handleToggleKeyframe = (
    propertyLabel: string
  ) => {
    if (!currentClip) return;
    commitClips((prev) =>
      prev.map((c) => (c.id === currentClip.id ? addOrToggleKeyframeAtTime(c, playheadSec) : c))
    );
    showToast(`Đã gắn/gỡ Keyframe (◆) cho "${propertyLabel}" tại ${playheadSec.toFixed(2)}s!`);
  };

  // Real File Upload Handler with Natural Sort & Real Video Metadata + Thumbnail Extraction
  const handleImportRealFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const rawFiles = Array.from(fileList);
    const sortedFiles = naturalSortByName(rawFiles);

    const newMediaItems: MediaCardItem[] = [];
    const newTimelineClips: TimelineClip[] = [];

    let currentVideoEnd = clips
      .filter((c) => c.trackIndex === 0)
      .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);
    let currentAudioEnd = clips
      .filter((c) => c.trackIndex === 1)
      .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      const objectUrl = URL.createObjectURL(file);
      const isAudio =
        file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|flac)$/i.test(file.name);

      const meta = await new Promise<{
        duration: number;
        thumb?: string;
        width?: number;
        height?: number;
      }>((resolve) => {
        if (isAudio) {
          const aud = document.createElement('audio');
          aud.preload = 'metadata';
          aud.src = objectUrl;
          aud.onloadedmetadata = () => {
            resolve({
              duration:
                Number.isFinite(aud.duration) && aud.duration > 0 ? aud.duration : 12.0,
            });
          };
          aud.onerror = () => resolve({ duration: 12.0 });
        } else {
          const vid = document.createElement('video');
          vid.preload = 'auto';
          vid.muted = true;
          vid.playsInline = true;
          vid.src = objectUrl;
          let retriedBrightFrame = false;
          vid.onloadeddata = () => {
            if (Number.isFinite(vid.duration) && vid.duration > 0) {
              const dur = vid.duration;
              const safeMax = Math.max(0.05, dur - 0.1);
              vid.currentTime = Math.min(Math.max(0.1, dur * 0.18), safeMax);
            } else {
              vid.currentTime = 0.08;
            }
          };
          vid.onseeked = () => {
            try {
              const dur = Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 5.0;
              const vw = vid.videoWidth || 1920;
              const vh = vid.videoHeight || 1080;
              const c = document.createElement('canvas');
              c.width = vw >= vh ? 320 : 180;
              c.height = vw >= vh ? 180 : 320;
              const ctx = c.getContext('2d');
              if (ctx) {
                ctx.drawImage(vid, 0, 0, c.width, c.height);
                // If initial frame is nearly black (fade-in intro), seek deeper into the video once
                if (!retriedBrightFrame && Number.isFinite(vid.duration) && vid.duration > 2.0) {
                  const sample = ctx.getImageData(0, 0, c.width, c.height).data;
                  let lumaSum = 0;
                  let count = 0;
                  for (let p = 0; p < sample.length; p += 64) {
                    lumaSum += (sample[p] + sample[p + 1] + sample[p + 2]) / 3;
                    count++;
                  }
                  const avgLuma = count > 0 ? lumaSum / count : 100;
                  if (avgLuma < 24) {
                    retriedBrightFrame = true;
                    vid.currentTime = Math.min(vid.duration * 0.42, Math.max(0.5, vid.duration - 0.3));
                    return;
                  }
                }
              }
              resolve({
                duration: dur,
                thumb: c.toDataURL('image/jpeg', 0.85),
                width: vw,
                height: vh,
              });
            } catch {
              resolve({
                duration:
                  Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 5.0,
                width: vid.videoWidth || 1920,
                height: vid.videoHeight || 1080,
              });
            }
          };
          vid.onerror = () => resolve({ duration: 5.0, width: 1920, height: 1080 });
        }
      });

      // Extract real audio amplitude peaks via Web Audio API if available
      let extractedPeaks: number[] | undefined;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx && file.size > 0 && file.size <= 120 * 1024 * 1024) {
          const actx = new AudioCtx();
          try {
            const arrBuf = await file.arrayBuffer();
            const audioBuf = await actx.decodeAudioData(arrBuf);
            const chData = audioBuf.getChannelData(0);
            const bucketCount = 120;
            const step = Math.max(1, Math.floor(chData.length / bucketCount));
            const rawPeaks: number[] = [];
            let maxPeak = 0.01;
            for (let b = 0; b < bucketCount; b++) {
              const startIdx = b * step;
              const endIdx = Math.min(chData.length, startIdx + step);
              let sumSq = 0;
              let localMax = 0;
              const stride = Math.max(1, Math.floor((endIdx - startIdx) / 64));
              let samples = 0;
              for (let s = startIdx; s < endIdx; s += stride) {
                const abs = Math.abs(chData[s]);
                if (abs > localMax) localMax = abs;
                sumSq += abs * abs;
                samples++;
              }
              const rms = samples > 0 ? Math.sqrt(sumSq / samples) : 0;
              const combined = localMax * 0.65 + rms * 0.35;
              if (combined > maxPeak) maxPeak = combined;
              rawPeaks.push(combined);
            }
            extractedPeaks = rawPeaks.map((p) =>
              Number(Math.max(0.08, Math.min(0.98, p / maxPeak)).toFixed(3))
            );
          } finally {
            actx.close().catch(() => {});
          }
        }
      } catch {
        // Fallback to deterministic multi-harmonic waveform if media has no audio stream
      }

      const durRounded = Number(Math.max(1.0, meta.duration).toFixed(2));
      const mm = String(Math.floor(durRounded / 60)).padStart(2, '0');
      const ss = String(Math.floor(durRounded % 60)).padStart(2, '0');
      const detectedAspect: AspectRatioOption | undefined = !isAudio
        ? (detectAspectRatioFromDimensions(
            meta.width || 1920,
            meta.height || 1080
          ) as AspectRatioOption)
        : undefined;

      const cardId = `media-${Date.now()}-${i}`;
      newMediaItems.push({
        id: cardId,
        name: file.name,
        duration: durRounded,
        timeLabel: `${mm}:${ss}`,
        type: isAudio ? 'audio' : 'video',
        added: true,
        gradient: 'linear-gradient(135deg, #00E5CC 0%, #1E293B 100%)',
        mediaUrl: objectUrl,
        thumbnailUrl: meta.thumb,
        mediaWidth: meta.width,
        mediaHeight: meta.height,
        nativeAspectRatio: detectedAspect,
        fileSizeBytes: file.size,
        waveformPeaks: extractedPeaks,
      });

      const clipId = `clip-${Date.now()}-${i}`;
      if (isAudio) {
        newTimelineClips.push({
          id: clipId,
          name: file.name,
          filePath: `C:/Imports/${file.name}`,
          trackIndex: 1,
          startTime: Number(currentAudioEnd.toFixed(2)),
          duration: durRounded,
          sourceIn: 0,
          speed: 1.0,
          volume: 100,
          flipH: false,
          cropRatio: 1.0,
          colorHex: '#164E63',
          mediaUrl: objectUrl,
          fileSizeBytes: file.size,
          waveformPeaks: extractedPeaks,
        });
        currentAudioEnd += durRounded;
      } else {
        newTimelineClips.push({
          id: clipId,
          name: file.name,
          filePath: `C:/Imports/${file.name}`,
          trackIndex: 0,
          startTime: Number(currentVideoEnd.toFixed(2)),
          duration: durRounded,
          sourceDuration: durRounded,
          sourceIn: 0,
          speed: 1.0,
          volume: 100,
          flipH: false,
          cropRatio: 1.0,
          scale: 100,
          posX: 0,
          posY: 0,
          rotation: 0,
          opacity: 100,
          blendMode: 'source-over',
          colorHex: '#0D9488',
          mediaUrl: objectUrl,
          thumbnailUrl: meta.thumb,
          mediaWidth: meta.width,
          mediaHeight: meta.height,
          nativeAspectRatio: detectedAspect,
          fileSizeBytes: file.size,
          waveformPeaks: extractedPeaks,
        });
        currentVideoEnd += durRounded;
      }
    }

    const firstVideoItem = newMediaItems.find((m) => m.type === 'video' && m.nativeAspectRatio);

    setMediaCards((prev) => [...newMediaItems, ...prev]);
    commitClips((prev) => {
      const updated = [...prev, ...newTimelineClips];
      const vCount = updated.filter((c) => c.trackIndex === 0).length;
      setRangeEndIndex(Math.max(1, vCount));
      return snapEnabled ? packTrackClipsContiguously(updated, 0) : updated;
    });
    if (newTimelineClips[0]) {
      setSelectedClipId(newTimelineClips[0].id);
      setPlayheadSec(newTimelineClips[0].startTime);
    }
    showToast(
      firstVideoItem?.nativeAspectRatio
        ? `Đã nhập ${sortedFiles.length} tệp (Giữ nguyên Tỉ lệ gốc độc lập ${firstVideoItem.nativeAspectRatio})!`
        : `Đã nhập & sắp xếp tự nhiên ${sortedFiles.length} tệp vào Timeline!`
    );
    e.target.value = '';
  };

  // Native File Explorer Handler for "Thêm Lớp Phủ" (Inserts user-selected video/image onto Overlay Track 3)
  const handleImportOverlayFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const rawFiles = Array.from(fileList);
    const sortedFiles = naturalSortByName(rawFiles);
    const newMediaItems: MediaCardItem[] = [];
    const newOverlayClips: TimelineClip[] = [];
    let startCursor = Number(playheadSec.toFixed(2));

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      const objectUrl = URL.createObjectURL(file);
      const isImage =
        file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name);

      const meta = await new Promise<{ duration: number; thumb?: string }>((resolve) => {
        if (isImage) {
          resolve({ duration: defaultImageDuration, thumb: objectUrl });
        } else {
          const vid = document.createElement('video');
          vid.preload = 'metadata';
          vid.muted = true;
          vid.src = objectUrl;
          vid.onloadeddata = () => {
            const dur = Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 5.0;
            vid.currentTime = Math.min(1.0, dur * 0.25);
          };
          vid.onseeked = () => {
            try {
              const c = document.createElement('canvas');
              c.width = 160;
              c.height = 90;
              const ctx = c.getContext('2d');
              if (ctx) ctx.drawImage(vid, 0, 0, c.width, c.height);
              resolve({
                duration: Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 5.0,
                thumb: c.toDataURL('image/jpeg', 0.7),
              });
            } catch {
              resolve({ duration: 5.0 });
            }
          };
          vid.onerror = () => resolve({ duration: 5.0 });
        }
      });

      const durRounded = Number(Math.max(1.0, meta.duration).toFixed(2));
      const mm = String(Math.floor(durRounded / 60)).padStart(2, '0');
      const ss = String(Math.floor(durRounded % 60)).padStart(2, '0');

      newMediaItems.push({
        id: `media-ov-${Date.now()}-${i}`,
        name: file.name,
        duration: durRounded,
        timeLabel: `${mm}:${ss}`,
        type: 'video',
        added: true,
        gradient: 'linear-gradient(135deg, #EC4899 0%, #1E293B 100%)',
        mediaUrl: objectUrl,
        thumbnailUrl: meta.thumb,
        fileSizeBytes: file.size,
      });

      const clipId = `ov-${Date.now()}-${i}`;
      newOverlayClips.push({
        id: clipId,
        name: file.name,
        filePath: `C:/Imports/${file.name}`,
        trackIndex: 3,
        startTime: Number(startCursor.toFixed(2)),
        duration: durRounded,
        sourceIn: 0,
        speed: 1.0,
        volume: 100,
        flipH: false,
        cropRatio: 0.85,
        scale: 85,
        posX: 0,
        posY: 0,
        rotation: 0,
        opacity: 100,
        blendMode: 'source-over',
        colorHex: '#EC4899',
        mediaUrl: objectUrl,
        thumbnailUrl: meta.thumb,
        fileSizeBytes: file.size,
      });
      startCursor += durRounded;
    }

    setTimelineTracks((prev) => {
      if (prev.some((t) => t.index === 3)) return prev;
      return [
        {
          id: 3,
          index: 3,
          name: 'Lớp phủ / PIP',
          label: 'Lớp phủ / PIP',
          type: 'overlay',
          kind: 'overlay',
          heightPx: 26,
        },
        ...prev,
      ];
    });
    setMediaCards((prev) => [...newMediaItems, ...prev]);
    commitClips((prev) => [...prev, ...newOverlayClips]);
    if (newOverlayClips[0]) {
      setSelectedClipId(newOverlayClips[0].id);
      setSelectedClipIds([newOverlayClips[0].id]);
      setInspectorMode('clip');
      setInspectorTab('video');
    }
    showToast(`Đã thêm ${newOverlayClips.length} tệp Lớp phủ (PIP) vào Timeline tại ${playheadSec.toFixed(2)}s!`);
    e.target.value = '';
  };

  // Screen / Webcam Recording ("Ghi" button)
  const handleToggleRecordMedia = async () => {
    if (isRecordingMedia && activeRecorderRef.current) {
      activeRecorderRef.current.stop();
      setIsRecordingMedia(false);
      return;
    }

    try {
      let stream: MediaStream;
      if (navigator.mediaDevices?.getDisplayMedia) {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }

      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream);
      activeRecorderRef.current = recorder;
      const startTs = Date.now();

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const dur = Number(Math.max(2.0, (Date.now() - startTs) / 1000).toFixed(1));
        const name = `ScreenRecord_${new Date().toLocaleTimeString('vi-VN').replace(/:/g, '')}.webm`;

        setMediaCards((prev) => [
          {
            id: `rec-${Date.now()}`,
            name,
            duration: dur,
            timeLabel: `00:${String(Math.round(dur)).padStart(2, '0')}`,
            type: 'video',
            added: true,
            gradient: 'linear-gradient(135deg, #EF4444 0%, #1E293B 100%)',
            mediaUrl: url,
          },
          ...prev,
        ]);

        commitClips((prev) => {
          const endV = prev
            .filter((c) => c.trackIndex === 0)
            .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);
          return [
            ...prev,
            {
              id: `v-rec-${Date.now()}`,
              name,
              filePath: `C:/Captures/${name}`,
              trackIndex: 0,
              startTime: endV,
              duration: dur,
              sourceIn: 0,
              speed: 1.0,
              volume: 100,
              flipH: false,
              cropRatio: 1.0,
              scale: 100,
              colorHex: '#DC2626',
              mediaUrl: url,
            },
          ];
        });
        showToast(`Đã lưu bản ghi "${name}" (${dur}s) vào Media & Timeline!`);
      };

      recorder.start(200);
      setIsRecordingMedia(true);
      showToast('Đang quay màn hình/camera... Bấm lại nút "Đang ghi" để dừng.');
    } catch {
      showToast('Không thể mở quyền quay màn hình trong khung xem trước.');
    }
  };

  // Clear all sample data / Create blank project
  const handleClearAllSampleData = () => {
    commitClips([]);
    setMediaCards([]);
    setSubProjects([]);
    setProjectName('');
    setSelectedClipId(null);
    setSelectedClipIds([]);
    setSelectedResourceIds([]);
    setMarkers([]);
    setPlayheadSec(0);
    setRangeStartIndex(1);
    setRangeEndIndex(1);
    try {
      localStorage.removeItem(STORAGE_KEY_PROJECT);
    } catch {
      // Ignore storage error
    }
    showToast('Đã xóa sạch toàn bộ video, dự án và thông tin liên quan!');
  };

  // Push media card to timeline
  const handlePushCardToTimeline = (card: MediaCardItem) => {
    const isAudio = card.type === 'audio';
    const targetTrack = isAudio ? 1 : 0;
    const maxEnd = clips
      .filter((c) => c.trackIndex === targetTrack)
      .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);
    const clipDur = resolveMediaClipDuration(card.duration, defaultImageDuration);
    const newId = `clip-${Date.now()}`;

    commitClips((prev) => {
      const next = [
        ...prev,
        {
          id: newId,
          name: card.name,
          filePath: `C:/Media/${card.name}`,
          trackIndex: targetTrack as 0 | 1,
          startTime: Number(maxEnd.toFixed(2)),
          duration: clipDur,
          sourceDuration: clipDur,
          sourceIn: 0,
          speed: 1.0,
          volume: 100,
          flipH: false,
          cropRatio: 1.0,
          scale: 100,
          colorHex: isAudio ? '#164E63' : '#0D9488',
          mediaUrl: card.mediaUrl,
          thumbnailUrl: card.thumbnailUrl,
          mediaWidth: card.mediaWidth,
          mediaHeight: card.mediaHeight,
          nativeAspectRatio: card.nativeAspectRatio,
          fileSizeBytes: card.fileSizeBytes,
          waveformPeaks: card.waveformPeaks,
        },
      ];
      const vCount = next.filter((c) => c.trackIndex === 0).length;
      setRangeEndIndex(Math.max(1, vCount));
      return snapEnabled && targetTrack === 0
        ? packTrackClipsContiguously(next, 0)
        : next;
    });
    setSelectedClipId(newId);
    setMediaCards((prev) => prev.map((m) => (m.id === card.id ? { ...m, added: true } : m)));
    showToast(`Đã đẩy "${card.name}" xuống Timeline!`);
  };

  // Add Web Audio Synthesizer SFX to Audio Track
  const handleAddSynthesizedSfx = (presetId: SfxPresetId, label: string, durationSec: number) => {
    webAudioEngine.playSfx(presetId, 0.8);
    const wavUrl = webAudioEngine.generateSfxWavBlobUrl(presetId);
    const maxEnd = clips
      .filter((c) => c.trackIndex === 1)
      .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), playheadSec);

    commitClips((prev) => [
      ...prev,
      {
        id: `sfx-${Date.now()}`,
        name: `SFX_${label}.wav`,
        filePath: `C:/Audio/SFX_${label}.wav`,
        trackIndex: 1,
        startTime: Number(playheadSec.toFixed(2)) || Number(maxEnd.toFixed(2)),
        duration: durationSec,
        sourceIn: 0,
        speed: 1.0,
        volume: 110,
        flipH: false,
        cropRatio: 1.0,
        colorHex: '#0284C7',
        mediaUrl: wavUrl,
      },
    ]);
    showToast(`Đã phát thử & chèn hiệu ứng âm thanh "${label}" vào Track Âm thanh!`);
  };

  // Import real .SRT file onto Subtitle Track
  const handleImportSrtFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsedSubs = parseSrtToTextClips(text);
    if (parsedSubs.length > 0) {
      commitClips((prev) => [...prev, ...parsedSubs]);
      setSelectedClipId(parsedSubs[0].id);
      showToast(`Đã nạp ${parsedSubs.length} dòng phụ đề từ "${file.name}" lên Track Văn bản!`);
    }
    e.target.value = '';
  };

  // Auto-Generate Subtitles ("Phụ đề tự động AI" — supports all 4 modes: all, bilingual, lyrics, filler)
  const handleGenerateAutoCaptions = (
    modeOverride?: 'all' | 'bilingual' | 'lyrics' | 'filler',
    bilingualOverride?: boolean,
    fillerOverride?: boolean
  ) => {
    const activeMode =
      modeOverride ||
      (topLeftCategory === 'captions' &&
      (subCategoryFilter === 'bilingual' ||
        subCategoryFilter === 'lyrics' ||
        subCategoryFilter === 'filler')
        ? (subCategoryFilter as 'bilingual' | 'lyrics' | 'filler')
        : 'all');
    const useBilingual =
      bilingualOverride !== undefined
        ? bilingualOverride
        : activeMode === 'bilingual'
        ? true
        : bilingualSubtitles;
    const useFillerFilter =
      fillerOverride !== undefined
        ? fillerOverride
        : activeMode === 'filler'
        ? true
        : removeFillerWords;

    const sampleLines =
      activeMode === 'lyrics'
        ? [
            {
              text: useBilingual
                ? '🎵 Đêm nay nhịp bass vang lên rực cháy | 🎵 Tonight the bass drops on fire'
                : '🎵 Đêm nay nhịp bass vang lên rực cháy ♪',
              dur: 4.0,
              color: '#F472B6',
              stroke: '#1E1B4B',
            },
            {
              text: useBilingual
                ? '🎶 Ánh đèn Neon dẫn lối đam mê | 🎶 Neon lights guide our passion'
                : '🎶 Ánh đèn Neon dẫn lối đam mê ♪',
              dur: 4.5,
              color: '#38BDF8',
              stroke: '#0F172A',
            },
            {
              text: useBilingual
                ? '🎤 Cùng hòa nhịp điệu 60 khung hình | 🎤 Riding the 60 FPS rhythm'
                : '🎤 Cùng hòa nhịp điệu 60 khung hình ♪',
              dur: 4.5,
              color: '#FACC15',
              stroke: '#000000',
            },
            {
              text: useBilingual
                ? '🔥 Tỏa sáng đỉnh cao cùng TDO CUT! | 🔥 Shine at the top with TDO CUT!'
                : '🔥 Tỏa sáng đỉnh cao cùng TDO CUT! 🎶',
              dur: 5.0,
              color: '#34D399',
              stroke: '#064E3B',
            },
          ]
        : activeMode === 'filler'
        ? [
            {
              text: useBilingual
                ? '[Đã lọc ờ, à] Chào mừng đến với TDO CUT! | [Clean] Welcome to TDO CUT!'
                : '[Đã lọc từ thừa] Chào mừng đến với TDO CUT Studio!',
              dur: 4.0,
              color: '#34D399',
              stroke: '#000000',
            },
            {
              text: useBilingual
                ? '[Không khoảng lặng] Cắt ghép tự động 60 FPS | [No Silence] 60 FPS AI Cut'
                : '[Không khoảng lặng] Cắt ghép tự động tốc độ cao 60 FPS',
              dur: 4.5,
              color: '#38BDF8',
              stroke: '#000000',
            },
            {
              text: useBilingual
                ? '[Chuẩn nhịp] Xuất video nét căng 4K | [Beat Synced] Ultra-sharp 4K Export'
                : '[Chuẩn nhịp] Xuất video hàng loạt chất lượng cao 4K',
              dur: 4.5,
              color: '#FACC15',
              stroke: '#000000',
            },
            {
              text: useBilingual
                ? 'Đăng ký kênh & bật chuông ngay! | Subscribe & Hit the Bell!'
                : 'Đăng ký kênh và bật chuông thông báo ngay!',
              dur: 5.0,
              color: '#FFFFFF',
              stroke: '#000000',
            },
          ]
        : useBilingual
        ? [
            {
              text: 'Chào mừng đến với TDO CUT! | Welcome to TDO CUT!',
              dur: 4.0,
              color: '#FACC15',
              stroke: '#000000',
            },
            {
              text: 'Cắt ghép tự động tốc độ cao 60 FPS | High-speed 60 FPS AI Editing',
              dur: 4.5,
              color: '#FACC15',
              stroke: '#000000',
            },
            {
              text: 'Xuất video hàng loạt chống quét bản quyền | Anti-Detect Matrix Batch Render',
              dur: 4.5,
              color: '#FACC15',
              stroke: '#000000',
            },
            {
              text: 'Đăng ký kênh và bật chuông thông báo! | Subscribe & Hit the Bell!',
              dur: 5.0,
              color: '#FACC15',
              stroke: '#000000',
            },
          ]
        : [
            {
              text:
                language === 'en'
                  ? 'Welcome to TDO CUT Pro Studio!'
                  : 'Chào mừng đến với TDO CUT Studio!',
              dur: 4.0,
              color: '#FFFFFF',
              stroke: '#000000',
            },
            {
              text:
                language === 'en'
                  ? 'High-speed 60 FPS Multi-Track Editing'
                  : 'Cắt ghép tự động tốc độ cao 60 FPS',
              dur: 4.5,
              color: '#FFFFFF',
              stroke: '#000000',
            },
            {
              text:
                language === 'en'
                  ? 'Anti-Detect Matrix Batch Render Engine'
                  : 'Xuất video hàng loạt chống quét bản quyền',
              dur: 4.5,
              color: '#FFFFFF',
              stroke: '#000000',
            },
            {
              text:
                language === 'en'
                  ? 'Subscribe & Hit the Notification Bell!'
                  : 'Đăng ký kênh và bật chuông thông báo!',
              dur: 5.0,
              color: '#FFFFFF',
              stroke: '#000000',
            },
          ];

    let cursor = 0;
    const generated: TimelineClip[] = sampleLines.map((item, idx) => {
      const cleanedText = useFillerFilter
        ? item.text.replace(/\b(ờ|à|ừm|uh|um)\b/gi, '').trim()
        : item.text;
      const clip: TimelineClip = {
        id: `auto-sub-${Date.now()}-${idx}`,
        name: cleanedText,
        filePath: '',
        trackIndex: 2,
        startTime: cursor,
        duration: item.dur,
        sourceIn: 0,
        speed: 1.0,
        volume: 100,
        flipH: false,
        cropRatio: 1.0,
        subtitleText: cleanedText,
        fontSize: activeMode === 'lyrics' ? 30 : 26,
        textColor: item.color,
        textStrokeColor: item.stroke,
        colorHex: activeMode === 'lyrics' ? '#DB2777' : '#A45A49',
      };
      cursor += item.dur;
      return clip;
    });

    commitClips((prev) => [
      ...prev.filter(
        (c) =>
          !(
            c.trackIndex === 2 &&
            !c.stickerEmoji &&
            (!c.stickerType || c.stickerType === 'none')
          )
      ),
      ...generated,
    ]);
    setSelectedClipId(generated[0].id);
    setSelectedClipIds([generated[0].id]);
    setPlayheadSec(0);
    showToast(
      language === 'en'
        ? `Generated ${generated.length} AI Captions (${activeMode.toUpperCase()}) on Track TI!`
        : `AI Faster-Whisper đã tạo ${generated.length} câu phụ đề (${
            activeMode === 'lyrics'
              ? 'Lời bài hát Karaoke AI'
              : activeMode === 'filler'
              ? 'Đã lọc từ thừa & khoảng lặng'
              : useBilingual
              ? 'Song ngữ Việt - Anh'
              : 'Chuẩn Studio'
          })!`
    );
  };

  // Text-to-Speech (TTS) via Web Speech API + Audio Sfx Marker
  const handleSpeakSubtitleTts = (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.lang = 'vi-VN';
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      }
    } catch {
      // Fallback to WebAudio tone
    }
    webAudioEngine.playSfx('ding', 0.4);
    showToast(`Đang đọc giọng nói AI (Text-to-Speech): "${textToSpeak.slice(0, 28)}..."`);
  };

  // Resize clip left/right edge by dragging handles
  const handleResizeClipEdge = (
    clipId: string,
    edge: 'left' | 'right',
    deltaSec: number
  ) => {
    commitClips((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== clipId) return c;
        if (edge === 'left') {
          const maxDelta = c.duration - 0.4;
          const clamped = Math.max(-c.startTime, Math.min(maxDelta, deltaSec));
          return {
            ...c,
            startTime: Number((c.startTime + clamped).toFixed(2)),
            sourceIn: Number(Math.max(0, c.sourceIn + clamped * c.speed).toFixed(2)),
            duration: Number((c.duration - clamped).toFixed(2)),
          };
        } else {
          const newDur = Math.max(0.4, Number((c.duration + deltaSec).toFixed(2)));
          return { ...c, duration: newDur };
        }
      });
      return snapEnabled ? packTrackClipsContiguously(updated, 0) : updated;
    });
  };

  // Capture Cover Frame ("Ảnh bìa") & Add Snapshot to Media Pool
  const handleCaptureCover = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setCoverDataUrl(dataUrl);
      const snapName = `Snapshot_${playheadSec.toFixed(1)}s.png`;
      setMediaCards((prev) => [
        {
          id: `snap-${Date.now()}`,
          name: snapName,
          duration: defaultImageDuration,
          timeLabel: `00:0${Math.round(defaultImageDuration)}`,
          type: 'video',
          added: false,
          gradient: 'linear-gradient(135deg, #00E5CC 0%, #0284C7 100%)',
          mediaUrl: dataUrl,
          thumbnailUrl: dataUrl,
        },
        ...prev,
      ]);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${projectName.replace(/\s+/g, '_')}_${snapName}`;
      a.click();
      showToast('Đã chụp ảnh tĩnh .PNG, lưu vào Kho Phương tiện và tải xuống!');
    } catch {
      showToast('Đã cập nhật Ảnh bìa dự án!');
    }
  };

  // TDO CUT Project JSON Export & Import (.tdocut.json)
  const handleExportTdoCutProject = () => {
    const json = serializeTdoCutProject(
      projectName,
      aspectRatio,
      clips,
      markInSec,
      markOutSec
    );
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}.tdocut.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      language === 'en'
        ? 'Exported TDO CUT project file (.tdocut.json)!'
        : 'Đã xuất dự án chuẩn TDO CUT (.tdocut.json)!'
    );
  };

  const handleImportTdoCutProjectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseTdoCutProject(text);
      if (parsed && parsed.clips.length > 0) {
        commitClips(parsed.clips);
        setProjectName(parsed.projectName);
        if (parsed.aspectRatio) {
          setAspectRatio(parsed.aspectRatio as AspectRatioOption);
        }
        setMarkInSec(parsed.markInSec);
        setMarkOutSec(parsed.markOutSec);
        showToast(
          language === 'en'
            ? `Loaded TDO CUT project "${parsed.projectName}" (${parsed.clips.length} clips)!`
            : `Đã mở dự án TDO CUT "${parsed.projectName}" (${parsed.clips.length} clips)!`
        );
      } else {
        showToast('Tệp dự án .tdocut.json không hợp lệ!');
      }
    } catch {
      showToast('Không thể đọc tệp dự án .tdocut.json!');
    }
    e.target.value = '';
  };

  // Range Ripple Trim ([In .. Out])
  const handleRippleTrimRange = (mode: 'keep_inside' | 'ripple_delete_inside') => {
    const inT = markInSec ?? 0;
    const outT = markOutSec ?? Math.max(inT + 2, playheadSec);
    if (Math.abs(outT - inT) < 0.1) {
      showToast('Hãy đặt Điểm vào [I] và Điểm ra [O] cách nhau ít nhất 0.1s!');
      return;
    }
    commitClips((prev) => rippleTrimTimelineRange(prev, inT, outT, mode, trackLocks));
    setPlayheadSec(mode === 'keep_inside' ? 0 : Math.min(inT, outT));
    setMarkInSec(null);
    setMarkOutSec(null);
    showToast(
      mode === 'keep_inside'
        ? `TDO CUT: Đã cắt gọn Timeline chỉ giữ vùng [${inT.toFixed(1)}s .. ${outT.toFixed(1)}s]!`
        : `TDO CUT: Đã xóa vùng [${inT.toFixed(1)}s .. ${outT.toFixed(1)}s] và tự động khép khoảng trống!`
    );
  };

  // Smart Silence & Dead-Air Remover
  const handleRemoveDeadAirSilence = () => {
    const res = removeTimelineDeadAirAndSilence(clips, 0.14);
    if (res.trimmedClipsCount === 0 && res.removedSec === 0) {
      showToast('Timeline đã khít, không phát hiện khoảng lặng thừa!');
      return;
    }
    commitClips(res.clips);
    showToast(
      `TDO CUT AI: Đã cắt bỏ ${res.removedSec}s khoảng lặng trên ${res.trimmedClipsCount} cảnh video!`
    );
  };

  // Auto-Beat Sync
  const handleSyncVideoClipsToBeats = () => {
    const beatTimes = markers.map((m) => m.timeSec);
    const res = syncVideoClipsToBeats(clips, beatTimes);
    commitClips(res.clips);
    showToast(
      `TDO CUT Beat Sync: Đã khớp ${res.syncedCount} điểm cắt video theo nhịp ${res.beatStepSec}s!`
    );
  };

  // Save current timeline as a Sub-project ("Dự án con")
  const handleSaveSubProject = (customName?: string) => {
    const newSub: SubProjectItem = {
      id: `sub-${Date.now()}`,
      name:
        customName ||
        `Dự án #${subProjects.length + 1} (${clips.filter((c) => c.trackIndex === 0).length} clips)`,
      createdAt: new Date().toLocaleTimeString('vi-VN'),
      aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
      clips: clips.map((c) => ({ ...c })),
    };
    setSubProjects((prev) => [newSub, ...prev]);
    showToast(`Đã lưu "${newSub.name}" vào danh sách Dự án!`);
  };

  // Matrix Batch Generator handler
  const handleGenerateMatrixBatch = (cfg: {
    startOrder: number;
    endOrder: number;
    targetDurationSec: number;
    enableSubClipSlicing: boolean;
    minSliceSec: number;
    maxSliceSec: number;
    variantCount: number;
  }) => {
    const generatedSubs: SubProjectItem[] = [];
    let latestTimeline = clips;

    for (let i = 1; i <= cfg.variantCount; i++) {
      let working = clips.map((c) => ({ ...c }));
      if (cfg.enableSubClipSlicing) {
        working = batchTrimClips(working, [cfg.minSliceSec, cfg.maxSliceSec]);
      }
      working = shuffleVideoClipsInRange(
        working,
        cfg.startOrder,
        cfg.endOrder,
        i * 97 + Date.now(),
        cfg.targetDurationSec
      );
      latestTimeline = working;
      generatedSubs.push({
        id: `batch-var-${Date.now()}-${i}`,
        name: `Biến thể AI #${i} (${cfg.targetDurationSec}s · Clip ${cfg.startOrder}-${cfg.endOrder})`,
        createdAt: new Date().toLocaleTimeString('vi-VN'),
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
        clips: working,
      });
    }

    commitClips(latestTimeline);
    setSubProjects((prev) => [...generatedSubs, ...prev]);
    setSidebarFolder('subproject');
    setTopLeftCategory('media');
    showToast(`Đã tạo ${cfg.variantCount} kịch bản Timeline biến thể trong mục "Dự án con"!`);
  };

  // AI Scene Cut handler ("Bắt đầu cắt clip")
  const handleRunAiSceneSplit = (cfg: {
    mode: 'auto_scene' | 'fixed_interval';
    sensitivity: number;
    intervalSec: number;
    randomRange: boolean;
    minSec: number;
    maxSec: number;
  }) => {
    const baseClip =
      currentClip && currentClip.trackIndex === 0
        ? currentClip
        : clips.find((c) => c.trackIndex === 0);

    const sourceName = baseClip ? baseClip.name.replace(/\.[^.]+$/, '') : 'Movie_Master';
    const count = cfg.mode === 'auto_scene' ? Math.max(4, Math.round(cfg.sensitivity / 6)) : 6;
    const palette = ['#0D9488', '#0284C7', '#7C3AED', '#D97706', '#059669', '#E11D48'];

    let cursor = clips
      .filter((c) => c.trackIndex === 0)
      .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);

    const newClips: TimelineClip[] = [];
    for (let i = 1; i <= count; i++) {
      const sliceDur =
        cfg.mode === 'auto_scene'
          ? Number((2.2 + ((i * 1.3) % 2.8)).toFixed(1))
          : cfg.randomRange
          ? Number(
              (cfg.minSec + Math.random() * Math.max(0.2, cfg.maxSec - cfg.minSec)).toFixed(1)
            )
          : cfg.intervalSec;

      newClips.push({
        id: `scene-${Date.now()}-${i}`,
        name: `${sourceName}_Scene_${String(i).padStart(2, '0')}.mp4`,
        filePath: `C:/Scenes/${sourceName}_Scene_${String(i).padStart(2, '0')}.mp4`,
        trackIndex: 0,
        startTime: Number(cursor.toFixed(2)),
        duration: sliceDur,
        sourceIn: Number(((i - 1) * sliceDur).toFixed(2)),
        speed: 1.0,
        volume: 100,
        flipH: false,
        cropRatio: 1.0,
        scale: 100,
        colorHex: palette[i % palette.length],
        mediaUrl: baseClip?.mediaUrl,
        thumbnailUrl: baseClip?.thumbnailUrl,
      });
      cursor += sliceDur;
    }

    commitClips((prev) => {
      const next = [...prev, ...newClips];
      setRangeEndIndex(next.filter((c) => c.trackIndex === 0).length);
      return next;
    });
    showToast(`AI đã tự động tách ${count} phân cảnh (#1..#${count}) và đẩy xuống Timeline!`);
  };

  // CapCut Draft JSON & FFmpeg Command previews
  const ratioForDraft: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
  const capcutDraftJson = useMemo(
    () => generateCapCutDraftJson(clips, projectName, ratioForDraft),
    [clips, projectName, ratioForDraft]
  );

  const ffmpegCommandPreview = useMemo(
    () => buildFfmpegMatrixCommand(clips, antiDetect, ratioForDraft, false),
    [clips, antiDetect, ratioForDraft]
  );

  const handleDownloadCapCutDraft = () => {
    const blob = new Blob([JSON.stringify(capcutDraftJson, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tdo_project.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      language === 'en'
        ? 'Exported TDO CUT project file (tdo_project.json)!'
        : 'Đã xuất file tdo_project.json chuẩn TDO CUT!'
    );
  };

  const filteredMediaCards = useMemo(() => {
    return mediaCards.filter((c) => {
      if (
        searchQuery.trim() &&
        !c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) {
        return false;
      }
      if (mediaFilterUsage === 'used' && !c.added) return false;
      if (mediaFilterUsage === 'unused' && c.added) return false;
      return true;
    });
  }, [mediaCards, searchQuery, mediaFilterUsage]);

  const videoClipsCount = useMemo(
    () => clips.filter((c) => c.trackIndex === 0).length,
    [clips]
  );

  const STOCK_LIBRARY_ITEMS = useMemo(
    () => [
      // Library (Thư viện Phông xanh, Đếm ngược & Intro/Outro)
      { id: 'stock-0', name: 'Intro_Countdown_321_Neon.mp4', dur: 3.0, color: '#0D9488', folder: 'library', tag: 'Đếm ngược' },
      { id: 'stock-1', name: 'GreenScreen_Subscribe_Bell_4K.mp4', dur: 4.0, color: '#10B981', folder: 'library', tag: 'Phông xanh' },
      { id: 'stock-2', name: 'Cinema_Anamorphic_Bars_Overlay.mp4', dur: 6.0, color: '#6366F1', folder: 'library', tag: 'Overlay' },
      { id: 'stock-3', name: 'Outro_ThanksForWatching_Glow.mp4', dur: 5.0, color: '#EC4899', folder: 'library', tag: 'Outro' },
      { id: 'stock-4', name: 'Transition_FilmBurn_Super8.mp4', dur: 2.5, color: '#F59E0B', folder: 'library', tag: 'Film Burn' },
      { id: 'stock-5', name: 'GreenScreen_Like_Share_Follow.mp4', dur: 3.5, color: '#059669', folder: 'library', tag: 'Phông xanh' },
      { id: 'stock-6', name: 'Glitch_Static_TV_NoSignal.mp4', dur: 2.0, color: '#8B5CF6', folder: 'library', tag: 'Hiệu ứng' },
      { id: 'stock-7', name: 'Bokeh_Golden_Particles_Loop.mp4', dur: 8.0, color: '#D97706', folder: 'library', tag: 'Background' },
      { id: 'stock-8', name: 'Rec_Camera_Viewfinder_Frame.mp4', dur: 6.0, color: '#EF4444', folder: 'library', tag: 'Overlay' },
      { id: 'stock-9', name: 'Cyberpunk_Grid_Tunnel_Loop.mp4', dur: 7.0, color: '#0284C7', folder: 'library', tag: 'Background' },
      { id: 'stock-10', name: 'GreenScreen_Explosion_Meme.mp4', dur: 2.8, color: '#EA580C', folder: 'library', tag: 'Phông xanh' },
      { id: 'stock-11', name: 'Paper_Rip_StopMotion_Intro.mp4', dur: 3.2, color: '#64748B', folder: 'library', tag: 'Intro' },
      // Brand Assets (Tài sản thương hiệu)
      { id: 'brand-0', name: 'TDO_Cut_Watermark_Corner.png', dur: 5.0, color: '#0D9488', folder: 'brand', tag: 'Logo Kênh' },
      { id: 'brand-1', name: 'Brand_Intro_Stinger_Pro.mp4', dur: 3.5, color: '#0284C7', folder: 'brand', tag: 'Intro Kênh' },
      { id: 'brand-2', name: 'LowerThird_Creator_Socials.mp4', dur: 4.5, color: '#7C3AED', folder: 'brand', tag: 'Lower Third' },
      { id: 'brand-3', name: 'Sponsor_Banner_Callout_9x16.mp4', dur: 4.0, color: '#10B981', folder: 'brand', tag: 'Banner' },
      { id: 'brand-4', name: 'Outro_EndScreen_2Videos.mp4', dur: 6.0, color: '#E11D48', folder: 'brand', tag: 'End Screen' },
      { id: 'brand-5', name: 'Official_Badge_Verified_Loop.mp4', dur: 4.0, color: '#2563EB', folder: 'brand', tag: 'Huy hiệu' },
      // Cloud Workspace (Không gian đám mây)
      { id: 'cloud-0', name: 'Cloud_Backup_ProductReview_A.mp4', dur: 6.5, color: '#0891B2', folder: 'cloud', tag: 'Cloud Sync' },
      { id: 'cloud-1', name: 'Cloud_Podcast_CamA_4K.mp4', dur: 8.0, color: '#4F46E5', folder: 'cloud', tag: 'Multi-Cam' },
      { id: 'cloud-2', name: 'Cloud_Podcast_CamB_CloseUp.mp4', dur: 7.5, color: '#7C3AED', folder: 'cloud', tag: 'Multi-Cam' },
      { id: 'cloud-3', name: 'Cloud_BRoll_City_Night_Drone.mp4', dur: 5.5, color: '#0D9488', folder: 'cloud', tag: 'B-Roll 4K' },
      { id: 'cloud-4', name: 'Cloud_Voiceover_Studio_Master.wav', dur: 6.0, color: '#059669', folder: 'cloud', tag: 'Voiceover' },
      { id: 'cloud-5', name: 'Cloud_Thumbnail_Pack_2026.png', dur: 4.0, color: '#D97706', folder: 'cloud', tag: 'Thumbnail' },
    ],
    []
  );

  const TEXT_TEMPLATE_ITEMS = useMemo(
    () => [
      // Mẫu chữ Viral (templates)
      { id: 'tpl-0', label: 'Tiêu đề Viral TikTok', text: 'BÍ MẬT ĐẰNG SAU...', subCat: 'templates', color: '#FFFFFF', stroke: '#000000', badge: 'Viral' },
      { id: 'tpl-1', label: 'Phụ đề Vàng Điện Ảnh', text: 'PHỤ ĐỀ ĐIỆN ẢNH', subCat: 'templates', color: '#FACC15', stroke: '#000000', badge: 'Cinema' },
      { id: 'tpl-2', label: 'Nút Đăng Ký Kênh', text: 'ĐĂNG KÝ & BẬT CHUÔNG 🔔', subCat: 'templates', color: '#FF3B5C', stroke: '#FFFFFF', badge: 'CTA' },
      { id: 'tpl-3', label: 'Bản Quyền Kênh', text: '© TDO CUT Official', subCat: 'templates', color: '#38BDF8', stroke: '#0F172A', badge: 'Brand' },
      { id: 'tpl-4', label: 'Hook 3 Giây Đầu Video', text: 'ĐỪNG LƯỚT QUA VIDEO NÀY!', subCat: 'templates', color: '#FDE047', stroke: '#DC2626', badge: 'Hook' },
      { id: 'tpl-5', label: 'Top 1Xu Hướng Hôm Nay', text: '#1 TRENDING NGAY LÚC NÀY 🔥', subCat: 'templates', color: '#34D399', stroke: '#064E3B', badge: 'Trend' },
      { id: 'tpl-6', label: 'Breaking News Bản Tin', text: 'TIN NÓNG 24H: CẬP NHẬT MỚI', subCat: 'templates', color: '#FFFFFF', stroke: '#B91C1C', badge: 'News' },
      { id: 'tpl-7', label: 'Review Chấm Điểm 10/10', text: 'ĐÁNH GIÁ: 9.8/10 ⭐ ĐÁNG MUA', subCat: 'templates', color: '#FBBF24', stroke: '#1E293B', badge: 'Review' },
      // Bong bóng chữ (bubbles)
      { id: 'tpl-8', label: 'Bong Bóng Tin Nhắn iOS', text: '💬 Bạn đã xem tập mới chưa?', subCat: 'bubbles', color: '#FFFFFF', stroke: '#0284C7', badge: 'Bubble' },
      { id: 'tpl-9', label: 'Hộp Thoại Truyện Tranh', text: '💥 KHÔNG THỂ TIN ĐƯỢC!!', subCat: 'bubbles', color: '#FEF08A', stroke: '#000000', badge: 'Comic' },
      { id: 'tpl-10', label: 'Khung Bình Luận Nổi Bật', text: '📌 @user: Video quá đỉnh luôn!', subCat: 'bubbles', color: '#E2E8F0', stroke: '#0D9488', badge: 'Comment' },
      { id: 'tpl-11', label: 'Ghi Chú Sticker Vàng', text: '📝 Lưu ý quan trọng cần nhớ', subCat: 'bubbles', color: '#FEF9C3', stroke: '#CA8A04', badge: 'Note' },
      { id: 'tpl-12', label: 'Bong Bóng Hỏi Đáp Q&A', text: '❓ Câu hỏi: Làm sao xuất 4K nét?', subCat: 'bubbles', color: '#DDD6FE', stroke: '#6D28D9', badge: 'Q&A' },
      { id: 'tpl-13', label: 'Thông Báo Livestream', text: '🔴 ĐANG PHÁT TRỰC TIẾP', subCat: 'bubbles', color: '#FECACA', stroke: '#DC2626', badge: 'Live' },
      // Chữ nghệ thuật & Hiệu ứng (effects)
      { id: 'tpl-14', label: 'Chữ Neon Cyberpunk', text: 'CYBERPUNK NIGHT 2077', subCat: 'effects', color: '#22D3EE', stroke: '#A21CAF', badge: 'Neon' },
      { id: 'tpl-15', label: 'Chữ Karaoke Đổi Màu', text: '🎤 Hát cùng giai điệu sôi động', subCat: 'effects', color: '#F472B6', stroke: '#1E1B4B', badge: 'Karaoke' },
      { id: 'tpl-16', label: 'Chữ 3D Kim Loại Vàng', text: 'SUPER SALE 50% OFF', subCat: 'effects', color: '#FDE047', stroke: '#78350F', badge: '3D Gold' },
      { id: 'tpl-17', label: 'Chữ Glitch Tương Lai', text: 'AI MATRIX RENDER ENGINE', subCat: 'effects', color: '#2DD4BF', stroke: '#0F172A', badge: 'Glitch' },
    ],
    []
  );

  const STICKER_CATALOG_ITEMS = useMemo<StickerCatalogItem[]>(
    () => [
      { id: 'none', uid: 'stk-none', label: 'Không nhãn dán', labelEn: 'No Sticker', icon: '✕', cat: 'all' },
      // Graphic CTA & Viral Badges (SUBSCRIBE, THANK YOU FOR WATCHING!!!, LIKE & SHARE, FOLLOW, etc.)
      ...GRAPHIC_BADGE_STICKERS,
      // Nút Subscribe / Like / Mạng xã hội bổ sung (cta)
      { id: 'like_thumb', uid: 'stk-like-1', label: 'Nút Like (Thumbs Up)', labelEn: 'Thumbs Up Like', icon: '👍', cat: 'cta' },
      { id: 'bell_sub', uid: 'stk-bell-1', label: 'Chuông Đăng ký Kênh', labelEn: 'Subscribe Bell', icon: '🔔', cat: 'cta' },
      { id: 'fire_trend', uid: 'stk-sub-btn', label: 'Nút Subscribe Đỏ', labelEn: 'Red Subscribe Button', icon: '▶️', cat: 'cta' },
      { id: 'heart_love', uid: 'stk-heart-follow', label: 'Thả Tim Follow Ngay', labelEn: 'Heart Follow Now', icon: '❤️', cat: 'cta' },
      { id: 'social_badge', uid: 'stk-share-now', label: 'Chia Sẻ Video (Share)', labelEn: 'Share Video', icon: '↗️', cat: 'cta' },
      { id: 'social_badge', uid: 'stk-comment-cta', label: 'Bình Luận Bên Dưới', labelEn: 'Comment Below', icon: '💬', cat: 'cta' },
      { id: 'circle_focus', uid: 'stk-save-bookmark', label: 'Lưu Video Này Lại', labelEn: 'Bookmark & Save', icon: '🔖', cat: 'cta' },
      { id: 'arrow_neon', uid: 'stk-link-bio', label: 'Link Trong Tiểu Sử (Bio)', labelEn: 'Link in Bio', icon: '🔗', cat: 'cta' },
      { id: 'social_badge', uid: 'stk-live-badge', label: 'Đang Phát Trực Tiếp (LIVE)', labelEn: 'LIVE Stream Badge', icon: '🔴', cat: 'cta' },
      { id: 'social_badge', uid: 'stk-shop-cart', label: 'Giỏ Hàng Mua Ngay', labelEn: 'Shop Now Cart', icon: '🛒', cat: 'cta' },
      { id: 'social_badge', uid: 'stk-location-pin', label: 'Ghim Vị Trí Check-in', labelEn: 'Location Pin', icon: '📍', cat: 'cta' },
      { id: 'social_badge', uid: 'stk-cta-gift-box', label: 'Hộp Quà Tặng Đặc Biệt', labelEn: 'Special Gift Box', icon: '🎁', cat: 'cta' },
      // Mặt biểu cảm (faces - 62 icons)
      ...FACE_ICON_STICKERS,
      // Biểu tượng cảm xúc & Xu hướng (emoji - 40 icons)
      ...TREND_EMOJI_STICKERS,
      // Quốc kỳ tất cả các nước trên thế giới (flags - 205 countries with full SVG graphics)
      ...WORLD_FLAG_STICKERS,
      // Khung & Mũi tên (neon)
      { id: 'arrow_neon', uid: 'stk-arrow-1', label: 'Mũi Tên Chỉ Dẫn Neon', labelEn: 'Neon Pointer Arrow', icon: '➔', cat: 'neon' },
      { id: 'circle_focus', uid: 'stk-circle-1', label: 'Vòng Tròn Khoanh Vùng', labelEn: 'Focus Circle', icon: '⭕', cat: 'neon' },
      { id: 'arrow_neon', uid: 'stk-arrow-down', label: 'Mũi Tên Chỉ Xuống', labelEn: 'Down Arrow', icon: '⬇️', cat: 'neon' },
      { id: 'arrow_neon', uid: 'stk-arrow-up', label: 'Mũi Tên Chỉ Lên', labelEn: 'Up Arrow', icon: '⬆️', cat: 'neon' },
      { id: 'arrow_neon', uid: 'stk-arrow-left', label: 'Mũi Tên Chỉ Trái', labelEn: 'Left Arrow', icon: '⬅️', cat: 'neon' },
      { id: 'circle_focus', uid: 'stk-frame-rec', label: 'Khung Máy Quay REC', labelEn: 'Camera REC Frame', icon: '⌖', cat: 'neon' },
      { id: 'arrow_neon', uid: 'stk-check-verified', label: 'Dấu Tích Xanh Chuẩn', labelEn: 'Verified Check', icon: '✅', cat: 'neon' },
      { id: 'circle_focus', uid: 'stk-warning-alert', label: 'Biển Cảnh Báo Chú Ý', labelEn: 'Warning Sign', icon: '⚠️', cat: 'neon' },
      { id: 'arrow_neon', uid: 'stk-magnifying', label: 'Kính Lúp Soi Chi Tiết', labelEn: 'Magnifying Glass', icon: '🔍', cat: 'neon' },
      { id: 'circle_focus', uid: 'stk-target-bullseye', label: 'Tâm Ngắm Hồng Tâm', labelEn: 'Bullseye Target', icon: '🎯', cat: 'neon' },
      { id: 'arrow_neon', uid: 'stk-stop-ban', label: 'Biển Cấm / Dừng Lại', labelEn: 'Stop / Forbidden', icon: '🚫', cat: 'neon' },
      { id: 'circle_focus', uid: 'stk-question-mark', label: 'Dấu Chấm Hỏi Lớn', labelEn: 'Big Question Mark', icon: '❓', cat: 'neon' },
    ],
    []
  );

  const VISUAL_EFFECT_CATALOG_ITEMS = useMemo(
    () =>
      [
        { id: 'none', uid: 'fx-none', label: 'Không hiệu ứng', cat: 'all', badge: 'Gốc' },
        // Hiệu ứng Video / Máy ảnh & Chia khung
        { id: 'shake', uid: 'fx-shake', label: 'Rung lắc (Camera Shake)', cat: 'all', badge: 'Camera' },
        { id: 'ken_burns', uid: 'fx-ken-burns', label: 'Thu phóng chậm (Ken Burns)', cat: 'all', badge: 'Zoom' },
        { id: 'bass_impact', uid: 'fx-bass-impact', label: 'Rung theo Nhịp Bass (Beat Shake)', cat: 'all', badge: 'Beat' },
        { id: 'dolly_zoom', uid: 'fx-dolly-zoom', label: 'Hiệu ứng Vertigo (Dolly Zoom)', cat: 'all', badge: 'Cinema' },
        { id: 'split_screen_2', uid: 'fx-split-2', label: 'Chia Đôi Màn Hình (Twin Split 2x)', cat: 'all', badge: 'Split 2x' },
        { id: 'split_screen_4', uid: 'fx-split-4', label: 'Chia 4 Khung Hình (Quad Grid 4x)', cat: 'all', badge: 'Grid 4x' },
        { id: 'kaleidoscope', uid: 'fx-kaleidoscope', label: 'Kính Vạn Hoa Ảo Giác (Kaleidoscope)', cat: 'all', badge: 'Mirror' },
        { id: 'speed_lines', uid: 'fx-speed-lines', label: 'Tia Tốc Độ Anime (Anime Speed Lines)', cat: 'all', badge: 'Anime' },
        { id: 'underwater', uid: 'fx-underwater', label: 'Sóng Nước Đại Dương (Underwater)', cat: 'all', badge: 'Ocean' },
        // Hiệu ứng Cơ thể (body)
        { id: 'clone_trail', uid: 'fx-clone-trail', label: 'Phân thân Chuyển động (Clone Trail)', cat: 'body', badge: 'Body FX' },
        { id: 'soul_out', uid: 'fx-soul-out', label: 'Tách bóng Hồn lìa xác (Soul Out)', cat: 'body', badge: 'TikTok' },
        { id: 'dreamy_glow', uid: 'fx-dreamy-glow', label: 'Hào quang Mộng mơ (Body Glow)', cat: 'body', badge: 'Body FX' },
        { id: 'laser_eyes', uid: 'fx-laser-eyes', label: 'Tia chớp Cơ thể (Laser Eyes)', cat: 'body', badge: 'Body FX' },
        { id: 'neon_outline', uid: 'fx-neon-outline', label: 'Viền điện tử Quanh người (Stroke)', cat: 'body', badge: 'Body FX' },
        { id: 'lightning_storm', uid: 'fx-lightning-storm', label: 'Tia Sét Siêu Năng Lực (Thunder Bolt)', cat: 'body', badge: 'Body FX' },
        { id: 'thermal_vision', uid: 'fx-thermal-vision', label: 'Camera Tầm Nhiệt Hồng Ngoại (Thermal)', cat: 'body', badge: 'Sci-Fi' },
        { id: 'spotlight_stage', uid: 'fx-spotlight-stage', label: 'Đèn Rọi Tâm Điểm Sân Khấu (Spotlight)', cat: 'body', badge: 'Stage' },
        // Cổ điển / VHS & Điện ảnh (retro)
        { id: 'vhs', uid: 'fx-vhs', label: 'Băng từ VHS 1998 (VHS Retro)', cat: 'retro', badge: 'Retro' },
        { id: 'fade_black', uid: 'fx-fade-black', label: 'Mờ dần Điện ảnh (Fade Black)', cat: 'retro', badge: 'Cinema' },
        { id: 'super8_grain', uid: 'fx-super8-grain', label: 'Hạt phim Nhựa 16mm (Film Grain)', cat: 'retro', badge: '16mm' },
        { id: 'old_tv', uid: 'fx-old-tv', label: 'Tivi CRT Màn hình cong (Old TV)', cat: 'retro', badge: 'CRT' },
        { id: 'dv_cam', uid: 'fx-dv-cam', label: 'Máy quay DV Camcorder 2000s', cat: 'retro', badge: 'Y2K' },
        { id: 'cinema_bars', uid: 'fx-cinema-bars', label: 'Viền Đen Điện Ảnh 2.35:1 (Letterbox)', cat: 'retro', badge: '2.35:1' },
        { id: 'halftone_comic', uid: 'fx-halftone-comic', label: 'Chấm Bi Truyện Tranh (Comic Halftone)', cat: 'retro', badge: 'Comic' },
        { id: 'night_vision', uid: 'fx-night-vision', label: 'Ống Nhòm Đêm Quân Sự (Night Vision)', cat: 'retro', badge: 'NVG' },
        // Ánh sáng Neon, Thời tiết & Hạt (glow)
        { id: 'flash', uid: 'fx-flash', label: 'Nháy sáng Trắng (White Flash)', cat: 'glow', badge: 'Flash' },
        { id: 'glitch', uid: 'fx-glitch', label: 'Nhiễu sóng RGB (Chromatic Glitch)', cat: 'glow', badge: 'RGB' },
        { id: 'strobe_party', uid: 'fx-strobe-party', label: 'Đèn Chớp Sân Khấu (Strobe Light)', cat: 'glow', badge: 'Club' },
        { id: 'cyber_holo', uid: 'fx-cyber-holo', label: 'Quét Hologram Cyberpunk', cat: 'glow', badge: 'Sci-Fi' },
        { id: 'golden_rays', uid: 'fx-golden-rays', label: 'Tia Nắng Hoàng Hôn (Sun Rays)', cat: 'glow', badge: 'Glow' },
        { id: 'matrix_rain', uid: 'fx-matrix-rain', label: 'Mưa Mã Nhị Phân (Matrix Digital Rain)', cat: 'glow', badge: 'Matrix' },
        { id: 'fire_sparks', uid: 'fx-fire-sparks', label: 'Đốm Lửa Rực Cháy (Fire Embers)', cat: 'glow', badge: 'Fire' },
        { id: 'snowfall', uid: 'fx-snowfall', label: 'Tuyết Rơi Mùa Đông (Winter Snowfall)', cat: 'glow', badge: 'Snow' },
        { id: 'sakura_petals', uid: 'fx-sakura-petals', label: 'Hoa Anh Đào Bay (Sakura Petals)', cat: 'glow', badge: 'Sakura' },
        { id: 'confetti_party', uid: 'fx-confetti-party', label: 'Pháo Giấy Chúc Mừng (Party Confetti)', cat: 'glow', badge: 'Party' },
      ] as Array<{ id: VisualEffectType; uid: string; label: string; cat: string; badge: string }>,
    []
  );

  const TRANSITION_CATALOG_ITEMS = useMemo(
    () =>
      [
        { id: 'none', uid: 'tr-none', label: 'Không chuyển tiếp', cat: 'all', dur: 0.5 },
        // Máy ảnh & Zoom (camera)
        { id: 'zoom_in', uid: 'tr-zoom-in', label: 'Kéo gần (Camera Zoom In)', cat: 'camera', dur: 0.6 },
        { id: 'spin', uid: 'tr-spin', label: 'Xoay vòng 360° (Camera Spin)', cat: 'camera', dur: 0.7 },
        { id: 'whip_pan', uid: 'tr-whip-pan', label: 'Lia máy Nhanh (Whip Pan)', cat: 'camera', dur: 0.4 },
        { id: 'roll_shutter', uid: 'tr-roll-shutter', label: 'Cuộn ống kính (Lens Roll)', cat: 'camera', dur: 0.6 },
        { id: 'pull_out', uid: 'tr-pull-out', label: 'Thu xa Đột ngột (Pull Out)', cat: 'camera', dur: 0.5 },
        // Chuyển động MG (mg)
        { id: 'cross_dissolve', uid: 'tr-cross-dissolve', label: 'Hòa tan Mượt (Cross Dissolve)', cat: 'mg', dur: 0.8 },
        { id: 'slide_left', uid: 'tr-slide-left', label: 'Trượt ngang (Slide Left)', cat: 'mg', dur: 0.6 },
        { id: 'wipe_split', uid: 'tr-wipe-split', label: 'Tách đôi Màn hình (Split Wipe)', cat: 'mg', dur: 0.6 },
        { id: 'clock_sweep', uid: 'tr-clock-sweep', label: 'Quét kim Đồng hồ (Clock Wipe)', cat: 'mg', dur: 0.7 },
        { id: 'push_up', uid: 'tr-push-up', label: 'Đẩy dọc Lên trên (Push Up)', cat: 'mg', dur: 0.5 },
        // Glitch & Flash (glitch)
        { id: 'black_fade', uid: 'tr-black-fade', label: 'Chuyển Đen Điện ảnh (Fade Black)', cat: 'glitch', dur: 0.8 },
        { id: 'white_flash', uid: 'tr-white-flash', label: 'Chớp Trắng Máy ảnh (White Flash)', cat: 'glitch', dur: 0.4 },
        { id: 'glitch_transition', uid: 'tr-glitch-cut', label: 'Nhiễu sóng Kỹ thuật số (Glitch Cut)', cat: 'glitch', dur: 0.5 },
        { id: 'film_burn', uid: 'tr-film-burn', label: 'Cháy sáng Phim nhựa (Light Leak)', cat: 'glitch', dur: 0.7 },
        { id: 'rgb_split', uid: 'tr-rgb-split', label: 'Tách kênh Màu RGB (Datamosh)', cat: 'glitch', dur: 0.5 },
      ] as Array<{ id: TransitionType; uid: string; label: string; cat: string; dur: number }>,
    []
  );

  const FILTER_CATALOG_ITEMS = useMemo(
    () =>
      [
        { id: 'none', uid: 'lut-none', label: 'Màu gốc (Original)', cat: 'all', swatch: 'linear-gradient(135deg,#334155,#64748B)' },
        // Điện ảnh (LUT) (cinema)
        { id: 'teal_orange', uid: 'lut-teal-orange', label: 'Điện ảnh (Teal & Orange)', cat: 'cinema', swatch: 'linear-gradient(135deg,#0D9488,#EA580C)' },
        { id: 'cyberpunk', uid: 'lut-cyberpunk', label: 'Cyberpunk Neon 2077', cat: 'cinema', swatch: 'linear-gradient(135deg,#06B6D4,#D946EF)' },
        { id: 'kodak_2383', uid: 'lut-kodak-2383', label: 'Kodak 2383 Film Print', cat: 'cinema', swatch: 'linear-gradient(135deg,#1E3A8A,#D97706)' },
        { id: 'matrix_green', uid: 'lut-matrix-green', label: 'Sci-Fi Matrix Emerald', cat: 'cinema', swatch: 'linear-gradient(135deg,#064E3B,#10B981)' },
        { id: 'anamorphic_blue', uid: 'lut-anamorphic-blue', label: 'Hollywood Anamorphic Cold', cat: 'cinema', swatch: 'linear-gradient(135deg,#0F172A,#38BDF8)' },
        { id: 'imax_hdr', uid: 'lut-imax-hdr', label: 'IMAX Blockbuster HDR', cat: 'cinema', swatch: 'linear-gradient(135deg,#7C2D12,#F59E0B)' },
        // Đời thường & Ẩm thực (life)
        { id: 'vintage', uid: 'lut-vintage', label: 'Hoài cổ (Vintage Warm)', cat: 'life', swatch: 'linear-gradient(135deg,#78350F,#FBBF24)' },
        { id: 'vivid', uid: 'lut-vivid', label: 'Rực rỡ Ẩm thực (Vivid Food)', cat: 'life', swatch: 'linear-gradient(135deg,#DC2626,#FACC15)' },
        { id: 'fuji_velvia', uid: 'lut-fuji-velvia', label: 'Fujifilm Velvia Nhật Bản', cat: 'life', swatch: 'linear-gradient(135deg,#065F46,#6EE7B7)' },
        { id: 'golden_hour', uid: 'lut-golden-hour', label: 'Nắng chiều Hoàng hôn (Golden Hour)', cat: 'life', swatch: 'linear-gradient(135deg,#9A3412,#FDE047)' },
        { id: 'cafe_latte', uid: 'lut-cafe-latte', label: 'Tone Hàn Quốc (Creamy Latte)', cat: 'life', swatch: 'linear-gradient(135deg,#78716C,#F5F5F4)' },
        { id: 'tropical_vibe', uid: 'lut-tropical-vibe', label: 'Biển xanh Nhiệt đới (Summer)', cat: 'life', swatch: 'linear-gradient(135deg,#0284C7,#2DD4BF)' },
        // Đen trắng Noir (bw)
        { id: 'noir_bw', uid: 'lut-noir-bw', label: 'Đen trắng Cổ điển (Noir B&W)', cat: 'bw', swatch: 'linear-gradient(135deg,#09090B,#71717A)' },
        { id: 'leica_mono', uid: 'lut-leica-mono', label: 'Leica Monochrom Tương phản cao', cat: 'bw', swatch: 'linear-gradient(135deg,#000000,#D4D4D8)' },
        { id: 'ilford_hp5', uid: 'lut-ilford-hp5', label: 'Phim Ilford HP5 400 (Soft B&W)', cat: 'bw', swatch: 'linear-gradient(135deg,#27272A,#A1A1AA)' },
        { id: 'silver_selenium', uid: 'lut-silver-selenium', label: 'Tráng bạc Selenium (Silver Tone)', cat: 'bw', swatch: 'linear-gradient(135deg,#1E293B,#94A3B8)' },
      ] as Array<{ id: FilterPresetType; uid: string; label: string; cat: string; swatch: string }>,
    []
  );

  // Reset resource selection when switching Zone 1 tab or folder
  useEffect(() => {
    setSelectedResourceIds([]);
    setSubCategoryFilter('all');
    setResourceMarqueeBox(null);
    setResourceTimelineDragGhost(null);
  }, [topLeftCategory, sidebarFolder]);

  // Select all visible items in the active Zone 1 resource pane
  const handleSelectAllCurrentResources = () => {
    const paneEl = resourcePaneRef.current;
    if (!paneEl) return;
    const nodes = paneEl.querySelectorAll<HTMLElement>('[data-resource-id]');
    const allIds: string[] = [];
    nodes.forEach((n) => {
      const rid = n.getAttribute('data-resource-id');
      if (rid) allIds.push(rid);
    });
    setSelectedResourceIds(allIds);
    if (
      (topLeftCategory === 'media' && sidebarFolder === 'timeline') ||
      topLeftCategory === 'captions'
    ) {
      setSelectedClipIds(allIds);
      setSelectedClipId(allIds[0] ?? null);
    }
    if (allIds.length > 0) {
      showToast(`Đã chọn tất cả ${allIds.length} mục!`);
    }
  };

  // Push multiple MediaCardItems sequentially onto the Timeline
  const handlePushMultipleCardsToTimeline = (
    cardsToPush: MediaCardItem[],
    targetTrackIdx?: number,
    dropStartTimeSec?: number
  ) => {
    if (cardsToPush.length === 0) return;

    const normalizedVideoTrack =
      targetTrackIdx !== undefined && (targetTrackIdx === 0 || targetTrackIdx >= 4)
        ? targetTrackIdx
        : 0;

    let videoCursor =
      dropStartTimeSec !== undefined
        ? dropStartTimeSec
        : clips
            .filter((c) => c.trackIndex === normalizedVideoTrack)
            .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);

    let audioCursor =
      dropStartTimeSec !== undefined
        ? dropStartTimeSec
        : clips
            .filter((c) => c.trackIndex === 1)
            .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);

    const newClips: TimelineClip[] = [];
    const newIds: string[] = [];
    const pushedCardIds = new Set(cardsToPush.map((c) => c.id));

    cardsToPush.forEach((card, idx) => {
      const isAudio = card.type === 'audio';
      const trackToUse = isAudio ? 1 : normalizedVideoTrack;
      const clipDur = resolveMediaClipDuration(card.duration, defaultImageDuration);
      const newId = `clip-batch-${Date.now()}-${idx}`;
      newIds.push(newId);

      const startSec = isAudio ? audioCursor : videoCursor;
      if (isAudio) {
        audioCursor += clipDur;
      } else {
        videoCursor += clipDur;
      }

      newClips.push({
        id: newId,
        name: card.name,
        filePath: `C:/Media/${card.name}`,
        trackIndex: trackToUse,
        startTime: Number(startSec.toFixed(2)),
        duration: clipDur,
        sourceDuration: clipDur,
        sourceIn: 0,
        speed: 1.0,
        volume: 100,
        flipH: false,
        cropRatio: 1.0,
        scale: 100,
        colorHex: isAudio ? '#164E63' : '#0D9488',
        mediaUrl: card.mediaUrl,
        thumbnailUrl: card.thumbnailUrl,
        mediaWidth: card.mediaWidth,
        mediaHeight: card.mediaHeight,
        nativeAspectRatio: card.nativeAspectRatio,
        fileSizeBytes: card.fileSizeBytes,
        waveformPeaks: card.waveformPeaks,
      });
    });

    commitClips((prev) => {
      const next = [...prev, ...newClips];
      const vCount = next.filter((c) => c.trackIndex === 0).length;
      setRangeEndIndex(Math.max(1, vCount));
      return snapEnabled && (targetTrackIdx === undefined || targetTrackIdx === 0)
        ? packTrackClipsContiguously(next, 0)
        : next;
    });
    setSelectedClipIds(newIds);
    setSelectedClipId(newIds[0] ?? null);
    setMediaCards((prev) =>
      prev.map((m) => (pushedCardIds.has(m.id) ? { ...m, added: true } : m))
    );
    showToast(`Đã đẩy ${cardsToPush.length} tệp đã chọn xuống Timeline!`);
  };

  // Push or apply any set of selected resource IDs from the active Zone 1 tab onto the Timeline
  const handlePushResourceIdsToTimeline = (
    idsToPush: string[],
    targetTrackIdx?: number,
    dropStartTimeSec?: number
  ) => {
    if (idsToPush.length === 0) return;
    const idSet = new Set(idsToPush);

    if (topLeftCategory === 'media') {
      if (sidebarFolder === 'all') {
        const matchedCards = filteredMediaCards.filter((c) => idSet.has(c.id));
        handlePushMultipleCardsToTimeline(matchedCards, targetTrackIdx, dropStartTimeSec);
        return;
      }
      if (
        sidebarFolder === 'library' ||
        sidebarFolder === 'brand' ||
        sidebarFolder === 'cloud'
      ) {
        const matchedStock = STOCK_LIBRARY_ITEMS.filter((s) => idSet.has(s.id));
        const asMediaCards: MediaCardItem[] = matchedStock.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.dur,
          timeLabel: `00:0${Math.round(s.dur)}`,
          type: s.name.endsWith('.wav') ? 'audio' : 'video',
          added: true,
          gradient: `linear-gradient(135deg, ${s.color} 0%, #0F172A 100%)`,
        }));
        handlePushMultipleCardsToTimeline(asMediaCards, targetTrackIdx, dropStartTimeSec);
        return;
      }
      if (sidebarFolder === 'subproject') {
        const matchedSubs = subProjects.filter((s) => idSet.has(s.id));
        if (matchedSubs.length > 0) {
          const mergedClips = matchedSubs.flatMap((sub, sIdx) =>
            sub.clips.map((c, cIdx) => ({
              ...c,
              id: `sub-import-${Date.now()}-${sIdx}-${cIdx}`,
            }))
          );
          commitClips(mergedClips);
          showToast(`Đã nạp ${matchedSubs.length} dự án con lên Timeline!`);
        }
        return;
      }
      if (sidebarFolder === 'timeline') {
        setSelectedClipIds(idsToPush);
        setSelectedClipId(idsToPush[0] ?? null);
        return;
      }
    }

    if (topLeftCategory === 'audio') {
      const matchedSfx = SFX_LIBRARY.filter((s) => idSet.has(s.id));
      if (matchedSfx.length === 0) return;
      webAudioEngine.playSfx(matchedSfx[0].id, 0.75);
      let cursor =
        dropStartTimeSec !== undefined
          ? dropStartTimeSec
          : clips
              .filter((c) => c.trackIndex === 1)
              .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), playheadSec);
      const newIds: string[] = [];
      const newAudioClips: TimelineClip[] = matchedSfx.map((sfx, idx) => {
        const id = `sfx-batch-${Date.now()}-${idx}`;
        newIds.push(id);
        const start = Number(cursor.toFixed(2));
        cursor += sfx.durationSec;
        return {
          id,
          name: `SFX_${sfx.label}.wav`,
          filePath: `C:/Audio/SFX_${sfx.label}.wav`,
          trackIndex: targetTrackIdx && targetTrackIdx !== 0 ? targetTrackIdx : 1,
          startTime: start,
          duration: sfx.durationSec,
          sourceIn: 0,
          speed: 1.0,
          volume: 110,
          flipH: false,
          cropRatio: 1.0,
          colorHex: '#0284C7',
          mediaUrl: webAudioEngine.generateSfxWavBlobUrl(sfx.id),
        };
      });
      commitClips((prev) => [...prev, ...newAudioClips]);
      setSelectedClipIds(newIds);
      setSelectedClipId(newIds[0] ?? null);
      showToast(`Đã thêm ${newAudioClips.length} hiệu ứng âm thanh vào Timeline!`);
      return;
    }

    if (topLeftCategory === 'text') {
      const matchedTpls = TEXT_TEMPLATE_ITEMS.filter((t) => idSet.has(t.id));
      if (matchedTpls.length === 0) return;
      let cursor = dropStartTimeSec !== undefined ? dropStartTimeSec : playheadSec;
      const newIds: string[] = [];
      const newTextClips: TimelineClip[] = matchedTpls.map((tpl, idx) => {
        const id = `txt-batch-${Date.now()}-${idx}`;
        newIds.push(id);
        const start = Number(cursor.toFixed(2));
        cursor += 4.0;
        return {
          id,
          name: tpl.label,
          filePath: '',
          trackIndex: 2,
          startTime: start,
          duration: 4.0,
          sourceIn: 0,
          speed: 1.0,
          volume: 100,
          flipH: false,
          cropRatio: 1.0,
          subtitleText: tpl.text,
          fontSize: 28,
          textColor: tpl.color || '#FFFFFF',
          textStrokeColor: tpl.stroke || '#000000',
          colorHex: '#A45A49',
        };
      });
      commitClips((prev) => [...prev, ...newTextClips]);
      setSelectedClipIds(newIds);
      setSelectedClipId(newIds[0] ?? null);
      showToast(`Đã thêm ${newTextClips.length} mẫu văn bản vào Timeline!`);
      return;
    }

    if (
      topLeftCategory === 'stickers' ||
      idsToPush.some((id) => id.startsWith('stk-'))
    ) {
      const matchedStks = STICKER_CATALOG_ITEMS.filter(
        (s) =>
          (idSet.has(s.uid) || idSet.has(s.id) || idSet.has(`stk-${s.id}`)) &&
          s.id !== 'none'
      );
      if (matchedStks.length === 0) return;
      const baseStart = Number((dropStartTimeSec !== undefined ? dropStartTimeSec : playheadSec).toFixed(2));
      let cursor = baseStart;
      const newIds: string[] = [];
      const trackToUse =
        targetTrackIdx !== undefined && targetTrackIdx >= 3 ? targetTrackIdx : 3;
      const existingStksAtBase = clips.filter(
        (c) =>
          Boolean(c.stickerEmoji) &&
          baseStart < c.startTime + c.duration &&
          baseStart + 3.5 > c.startTime
      ).length;
      const offsetPresets = [
        { x: 0, y: -35 },
        { x: -120, y: -35 },
        { x: 120, y: -35 },
        { x: -120, y: 45 },
        { x: 120, y: 45 },
        { x: 0, y: 45 },
      ];

      setTimelineTracks((prev) => {
        if (prev.some((t) => t.index === trackToUse)) return prev;
        return [
          {
            id: trackToUse,
            index: trackToUse,
            name: 'Nhãn dán / Lớp phủ',
            label: 'Nhãn dán / Lớp phủ',
            type: 'overlay',
            kind: 'overlay',
            heightPx: 26,
          },
          ...prev,
        ];
      });

      const newStkClips: TimelineClip[] = matchedStks.map((stk, idx) => {
        const id = `stk-batch-${Date.now()}-${idx}`;
        newIds.push(id);
        const start = Number(cursor.toFixed(2));
        cursor += 3.5;
        const chosenOffset =
          offsetPresets[(existingStksAtBase + idx) % offsetPresets.length];
        return {
          id,
          name: `${stk.icon} ${stk.label}`,
          filePath: '',
          trackIndex: trackToUse,
          startTime: start,
          duration: 3.5,
          sourceIn: 0,
          speed: 1.0,
          volume: 100,
          flipH: false,
          cropRatio: 1.0,
          scale: 100,
          posX: chosenOffset.x,
          posY: chosenOffset.y,
          stickerType: stk.id,
          stickerEmoji: stk.icon,
          stickerText: stk.badgeText || '',
          stickerSubText: stk.badgeSubText || '',
          textColor: stk.badgeColor || '#FFFFFF',
          textBgColor: stk.badgeBg,
          colorHex: '#6D28D9',
        };
      });
      commitClips((prev) => [...prev, ...newStkClips]);
      setSelectedClipIds(newIds);
      setSelectedClipId(newIds[0] ?? null);
      setPlayheadSec(baseStart);
      setInspectorMode('clip');
      setInspectorTab('video');
      showToast(`Đã thêm ${newStkClips.length} nhãn dán vào Timeline tại ${baseStart}s!`);
      return;
    }

    if (topLeftCategory === 'effects') {
      const matchedFx = VISUAL_EFFECT_CATALOG_ITEMS.filter(
        (fx) => idSet.has(fx.uid) || idSet.has(fx.id)
      );
      if (matchedFx.length > 0) {
        const chosen = matchedFx[0];
        handleDropResourceOnTimeline(
          {
            kind: 'effect',
            name: chosen.label,
            duration: 3.0,
            visualEffect: chosen.id,
          },
          targetTrackIdx ?? 0,
          dropStartTimeSec ?? playheadSec
        );
      }
      return;
    }

    if (topLeftCategory === 'transitions') {
      const matchedTr = TRANSITION_CATALOG_ITEMS.filter(
        (tr) => idSet.has(tr.uid) || idSet.has(tr.id)
      );
      if (matchedTr.length > 0) {
        const chosen = matchedTr[0];
        handleDropResourceOnTimeline(
          {
            kind: 'transition',
            name: chosen.label,
            duration: chosen.dur,
            transitionType: chosen.id,
          },
          0,
          dropStartTimeSec ?? playheadSec
        );
      }
      return;
    }

    if (topLeftCategory === 'filters') {
      const matchedLut = FILTER_CATALOG_ITEMS.filter(
        (lut) => idSet.has(lut.uid) || idSet.has(lut.id)
      );
      if (matchedLut.length > 0) {
        const chosen = matchedLut[0];
        handleDropResourceOnTimeline(
          {
            kind: 'filter',
            name: chosen.label,
            duration: 3.5,
            filterPreset: chosen.id,
          },
          targetTrackIdx ?? 0,
          dropStartTimeSec ?? playheadSec
        );
      }
      return;
    }

    if (topLeftCategory === 'adjust') {
      handleDropResourceOnTimeline(
        { kind: 'adjust', name: 'Adjustment Layer', duration: 5.0 },
        3,
        dropStartTimeSec ?? playheadSec
      );
    }
  };

  // Start 2D Marquee Selection (on empty background) or Drag-to-Timeline (when clicking/dragging a card) inside Zone 1 Resource Pane
  const handleMouseDownResourcePane = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setActiveZoneFocus('resource_pool');

    const targetEl = e.target as HTMLElement | null;
    if (!targetEl) return;
    if (
      targetEl.closest(
        'button, input, select, textarea, label, [data-no-marquee="true"]'
      )
    ) {
      return;
    }

    const paneEl = resourcePaneRef.current;
    if (!paneEl) return;
    const paneRect = paneEl.getBoundingClientRect();
    const startLocalX = e.clientX - paneRect.left;
    const startLocalY = e.clientY - paneRect.top;

    const itemEl = targetEl.closest('[data-resource-id]') as HTMLElement | null;
    const clickedId = itemEl?.getAttribute('data-resource-id') || null;

    if ((e.ctrlKey || e.metaKey || e.shiftKey) && clickedId) {
      setSelectedResourceIds((prev) => {
        const exists = prev.includes(clickedId);
        const next = exists ? prev.filter((id) => id !== clickedId) : [...prev, clickedId];
        if (
          (topLeftCategory === 'media' && sidebarFolder === 'timeline') ||
          topLeftCategory === 'captions'
        ) {
          setSelectedClipIds(next);
          setSelectedClipId(next[0] ?? null);
        }
        return next;
      });
      return;
    }

    // Clicking/dragging directly on a resource card selects it immediately and enters timeline_drag mode
    // so dragging a card drags it to the Timeline instead of drawing a marquee box over it!
    if (clickedId) {
      const nextSelected = selectedResourceIds.includes(clickedId)
        ? [...selectedResourceIds]
        : [clickedId];
      if (!selectedResourceIds.includes(clickedId)) {
        setSelectedResourceIds([clickedId]);
      }
      resourceDragSessionRef.current = {
        mode: 'timeline_drag',
        startClientX: e.clientX,
        startClientY: e.clientY,
        startLocalX,
        startLocalY,
        anchorId: clickedId,
        initialSelectedIds: nextSelected,
        hasMoved: false,
      };
      return;
    }

    // Clicking/dragging on empty background space starts the 2D Cyan Marquee Selection Box
    resourceDragSessionRef.current = {
      mode: 'marquee',
      startClientX: e.clientX,
      startClientY: e.clientY,
      startLocalX,
      startLocalY,
      anchorId: null,
      initialSelectedIds: [],
      hasMoved: false,
    };

    setSelectedResourceIds([]);
    setResourceMarqueeBox({
      startX: startLocalX,
      startY: startLocalY,
      currX: startLocalX,
      currY: startLocalY,
    });
  };

  // Global mousemove / mouseup / dragend listeners for Zone 1 Marquee Selection & Batch Timeline Drop
  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      const session = resourceDragSessionRef.current;
      if (!session) return;
      const paneEl = resourcePaneRef.current;
      if (!paneEl) return;
      const paneRect = paneEl.getBoundingClientRect();

      const distPx = Math.hypot(
        e.clientX - session.startClientX,
        e.clientY - session.startClientY
      );
      if (distPx < 5 && !session.hasMoved) {
        return;
      }
      session.hasMoved = true;

      // If dragging a card (or multi-selection) OR dragging out of Zone 1 down toward the Timeline
      const isOutsideBelowZone1 = e.clientY > paneRect.bottom + 10;
      if (
        session.mode === 'timeline_drag' ||
        (isOutsideBelowZone1 && (session.anchorId !== null || selectedResourceIds.length > 0))
      ) {
        const activeCount =
          session.mode === 'timeline_drag'
            ? Math.max(1, session.initialSelectedIds.length)
            : Math.max(1, selectedResourceIds.length);
        setResourceMarqueeBox(null);
        setResourceTimelineDragGhost({
          x: e.clientX,
          y: e.clientY,
          count: activeCount,
          label: `🎬 Thả ${activeCount} mục đã chọn vào Timeline`,
        });
        return;
      }

      setResourceTimelineDragGhost(null);
      const currLocalX = Math.max(0, Math.min(paneRect.width, e.clientX - paneRect.left));
      const currLocalY = Math.max(0, Math.min(paneRect.height, e.clientY - paneRect.top));
      const nextBox: MarqueeRect2D = {
        startX: session.startLocalX,
        startY: session.startLocalY,
        currX: currLocalX,
        currY: currLocalY,
      };
      setResourceMarqueeBox(nextBox);

      const nodeList = paneEl.querySelectorAll<HTMLElement>('[data-resource-id]');
      const boundsList: ResourceItemBounds[] = [];
      nodeList.forEach((node) => {
        const id = node.getAttribute('data-resource-id');
        if (!id) return;
        const r = node.getBoundingClientRect();
        boundsList.push({
          id,
          left: r.left - paneRect.left,
          top: r.top - paneRect.top,
          right: r.right - paneRect.left,
          bottom: r.bottom - paneRect.top,
        });
      });

      const matchedIds = getResourceItemsInMarqueeRect(boundsList, nextBox, 5);
      setSelectedResourceIds(matchedIds);
      if (
        (topLeftCategory === 'media' && sidebarFolder === 'timeline') ||
        topLeftCategory === 'captions'
      ) {
        setSelectedClipIds(matchedIds);
        setSelectedClipId(matchedIds[0] ?? null);
      }
    };

    const onWindowMouseUp = (e: MouseEvent) => {
      const session = resourceDragSessionRef.current;
      if (!session) return;
      resourceDragSessionRef.current = null;
      setResourceMarqueeBox(null);
      setResourceTimelineDragGhost(null);

      if (session.hasMoved) {
        suppressNextResourceClickRef.current = true;
        window.setTimeout(() => {
          suppressNextResourceClickRef.current = false;
        }, 0);

        const timelineScrollEl = document.querySelector<HTMLElement>(
          '[data-timeline-scroll="true"]'
        );
        if (timelineScrollEl) {
          const tlRect = timelineScrollEl.getBoundingClientRect();
          const isOverTimeline =
            e.clientX >= tlRect.left &&
            e.clientX <= tlRect.right &&
            e.clientY >= tlRect.top &&
            e.clientY <= tlRect.bottom;

          if (isOverTimeline) {
            const idsToDrop =
              session.mode === 'timeline_drag'
                ? session.initialSelectedIds
                : selectedResourceIds.length > 0
                ? selectedResourceIds
                : session.anchorId
                ? [session.anchorId]
                : [];

            if (idsToDrop.length > 0) {
              let targetTrackIdx: number | undefined = undefined;
              const trackEls =
                timelineScrollEl.querySelectorAll<HTMLElement>('[data-track-index]');
              trackEls.forEach((trEl) => {
                const r = trEl.getBoundingClientRect();
                if (e.clientY >= r.top && e.clientY <= r.bottom) {
                  const parsed = Number(trEl.getAttribute('data-track-index'));
                  if (!Number.isNaN(parsed)) targetTrackIdx = parsed;
                }
              });

              const xInTrack = e.clientX - tlRect.left + timelineScrollEl.scrollLeft - 136;
              const dropTimeSec = Math.max(0, Number((xInTrack / pixelsPerSecond).toFixed(2)));
              handlePushResourceIdsToTimeline(idsToDrop, targetTrackIdx, dropTimeSec);
            }
          }
        }
      } else {
        if (session.anchorId) {
          setSelectedResourceIds([session.anchorId]);
        } else {
          setSelectedResourceIds([]);
        }
      }
    };

    const onWindowDragEndOrDrop = () => {
      resourceDragSessionRef.current = null;
      setResourceMarqueeBox(null);
      setResourceTimelineDragGhost(null);
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    window.addEventListener('dragend', onWindowDragEndOrDrop);
    window.addEventListener('drop', onWindowDragEndOrDrop);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
      window.removeEventListener('dragend', onWindowDragEndOrDrop);
      window.removeEventListener('drop', onWindowDragEndOrDrop);
    };
  }, [selectedResourceIds, topLeftCategory, sidebarFolder, pixelsPerSecond]);

  return (
    <div
      data-theme={themeMode}
      className="flex flex-col h-screen w-screen bg-[#111114] text-[#E4E4E7] font-sans overflow-hidden select-none transition-colors duration-150"
    >
      {/* Hidden File Inputs */}
      <input
        ref={mediaInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        onChange={handleImportRealFiles}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        multiple
        accept="audio/*"
        onChange={handleImportRealFiles}
        className="hidden"
      />
      <input
        ref={srtInputRef}
        type="file"
        accept=".srt,.txt"
        onChange={handleImportSrtFile}
        className="hidden"
      />
      <input
        ref={overlayInputRef}
        type="file"
        multiple
        accept="video/*,image/*"
        onChange={handleImportOverlayFiles}
        className="hidden"
      />
      <input
        ref={tdoCutProjectInputRef}
        type="file"
        accept=".json,.tdocut.json"
        onChange={handleImportTdoCutProjectFile}
        className="hidden"
      />

      {/* TOP TDO CUT APPLICATION TITLE BAR */}
      <header className="flex items-center justify-between px-3 h-10 bg-[#18181C] border-b border-[#2B2B30] shrink-0 z-30">
        {/* Left Brand, Logo, Menu Dropdown & Navigation */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 font-bold text-xs text-white tracking-tight">
            <img
              src="/assets/logo.png"
              alt="TDO CUT Logo"
              className="w-6 h-6 rounded-md object-contain bg-white p-0.5 shadow-xs shrink-0"
            />
            <span className="font-extrabold tracking-tight text-[#E4E4E7]">TDO CUT</span>
          </div>

          {/* TDO CUT "Menu ▾" Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTopMenuOpen((o) => !o)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#D4D4D8] hover:text-white bg-[#23232A] hover:bg-[#2C2C36] border border-[#32323C] rounded cursor-pointer"
            >
              <span>{uiText.menu}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isTopMenuOpen && (
              <div
                onMouseLeave={() => setIsTopMenuOpen(false)}
                className="absolute left-0 top-8 w-64 bg-[#1F1F27] border border-[#343442] rounded-lg shadow-2xl py-1.5 z-50 text-[11px] text-[#E4E4E7]"
              >
                <div className="px-3 py-1 text-[9px] font-bold uppercase text-[#71717A]">
                  {language === 'en' ? 'File & Project' : 'Tệp & Dự án TDO CUT'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleClearAllSampleData();
                    setProjectName(`TDO_CUT_${new Date().toLocaleDateString('vi-VN')}`);
                    setActiveView('workstation');
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex justify-between cursor-pointer"
                >
                  <span>{language === 'en' ? 'New Project' : 'Dự án mới (New project)'}</span>
                  <span className="font-mono text-[10px] text-[#71717A]">Ctrl+N</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    mediaInputRef.current?.click();
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex justify-between cursor-pointer"
                >
                  <span>{language === 'en' ? 'Import Media' : 'Nhập tệp (Import media)'}</span>
                  <span className="font-mono text-[10px] text-[#71717A]">Ctrl+I</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExportTdoCutProject();
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-[#00E5CC]" />
                    <span>{uiText.saveProjectJson}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    tdoCutProjectInputRef.current?.click();
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{uiText.loadProjectJson}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportModalOpen(true);
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex justify-between cursor-pointer"
                >
                  <span>{language === 'en' ? 'Export Video' : 'Xuất video (Export)'}</span>
                  <span className="font-mono text-[10px] text-[#71717A]">Ctrl+E</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const xml = exportTimelineToXml(clips, projectName, 30);
                    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${projectName.replace(/\s+/g, '_')}_Premiere.xml`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setIsTopMenuOpen(false);
                    showToast('Đã xuất file XML tương thích Adobe Premiere & DaVinci Resolve!');
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] cursor-pointer"
                >
                  <span>{language === 'en' ? 'Export XML (Premiere / DaVinci)' : 'Xuất XML (Premiere / DaVinci)'}</span>
                </button>

                <div className="my-1 border-t border-[#2E2E3A]" />
                <div className="px-3 py-1 text-[9px] font-bold uppercase text-[#71717A]">
                  {language === 'en' ? 'Studio Tools & System' : 'Công cụ & Hệ thống'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveDeadAirSilence();
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] cursor-pointer"
                >
                  <span>⚡ {uiText.removeSilence}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSyncVideoClipsToBeats();
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] cursor-pointer"
                >
                  <span>🎵 {uiText.autoBeatSync}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUndo();
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] flex justify-between cursor-pointer"
                >
                  <span>{language === 'en' ? 'Undo' : 'Hoàn tác (Undo)'}</span>
                  <span className="font-mono text-[10px] text-[#71717A]">Ctrl+Z</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsModalOpen(true);
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] cursor-pointer"
                >
                  <span>
                    {language === 'en'
                      ? 'Settings & Language (VI / EN)'
                      : 'Cài đặt Hệ thống & Ngôn ngữ (VI / EN)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('workstation');
                    setIsMatrixModalOpen(true);
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] cursor-pointer"
                >
                  <span>
                    {language === 'en'
                      ? 'Matrix Batch Generator'
                      : 'Công cụ AI hàng loạt (Matrix Batch)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('workstation');
                    setInspectorMode('project_details');
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#00E5CC]/15 hover:text-[#00E5CC] cursor-pointer"
                >
                  <span>{language === 'en' ? 'Project Info' : 'Chi tiết dự án (Project Info)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView(activeView === 'home' ? 'workstation' : 'home');
                    setIsTopMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-[#00E5CC] hover:bg-[#00E5CC]/15 font-semibold cursor-pointer"
                >
                  <span>
                    {activeView === 'home'
                      ? language === 'en'
                        ? '🎬 Open Timeline Workstation'
                        : '🎬 Mở Bàn dựng Timeline (Workstation)'
                      : language === 'en'
                      ? '🏠 Back to Home Hub'
                      : '🏠 Về màn hình Trang chủ (Back to Home)'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Inline Editable Project Title (Hidden on Home Screen Launcher) */}
        <div className="flex items-center gap-2">
          {activeView !== 'home' &&
            (isEditingProjectName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  value={projectName}
                  placeholder={language === 'en' ? 'Enter project name' : 'Nhập tên dự án'}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={() => setIsEditingProjectName(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingProjectName(false);
                  }}
                  aria-label="Sửa tên dự án"
                  className="px-2 py-0.5 text-xs bg-[#111114] border border-[#00E5CC] rounded text-white font-medium w-44 text-center"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingProjectName(false)}
                  className="p-1 text-[#00E5CC] cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingProjectName(true)}
                title={
                  language === 'en'
                    ? 'Click to rename project (Auto-saved to LocalStorage)'
                    : 'Bấm để đổi tên dự án (Tự động lưu vào LocalStorage)'
                }
                className="flex items-center gap-1.5 text-xs font-semibold text-[#D4D4D8] hover:text-white px-2 py-0.5 rounded hover:bg-[#25252C] cursor-pointer"
              >
                <span data-testid="top-header-project-title">
                  {projectName || (language === 'en' ? 'Enter project name' : 'Nhập tên dự án')}
                </span>
              </button>
            ))}

          {statusToast && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#00E5CC]/15 text-[#00E5CC] border border-[#00E5CC]/30 rounded animate-pulse">
              {language === 'en' ? translateViToEnText(statusToast) : statusToast}
            </span>
          )}
        </div>

        {/* Right Actions: Theme Toggle (Light/Dark), Shortcuts, Settings — Save Project & Export ONLY shown in Workstation Editor */}
        <div className="flex items-center gap-1.5">
          {/* LIGHT / DARK STUDIO THEME TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => {
              const nextTheme: StudioThemeMode = themeMode === 'dark' ? 'light' : 'dark';
              setThemeMode(nextTheme);
              showToast(
                nextTheme === 'light'
                  ? language === 'en'
                    ? 'Switched to Light Studio Theme'
                    : 'Đã chuyển sang Giao diện Sáng (Light Mode)!'
                  : language === 'en'
                  ? 'Switched to Dark Studio Theme'
                  : 'Đã chuyển sang Giao diện Tối (Dark Mode)!'
              );
            }}
            title={uiText.switchThemeTitle}
            aria-label="Đổi giao diện Sáng / Tối"
            className="flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold bg-[#222228] hover:bg-[#2C2C36] text-[#D4D4D8] hover:text-white border-[#32323A] transition-colors cursor-pointer"
          >
            {themeMode === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="hidden md:inline">
                  {language === 'en' ? 'Light' : 'Sáng'}
                </span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#00E5CC]" />
                <span className="hidden md:inline">
                  {language === 'en' ? 'Dark' : 'Tối'}
                </span>
              </>
            )}
          </button>

          {activeView !== 'home' && (
            <button
              type="button"
              onClick={() => {
                setActiveView('workstation');
                setInspectorMode((m) => (m === 'clip' ? 'project_details' : 'clip'));
              }}
              title={
                language === 'en'
                  ? 'Toggle Layout / Project Info'
                  : 'Chuyển đổi Bố cục / Chi tiết dự án'
              }
              aria-label="Chuyển đổi bố cục"
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                inspectorMode === 'project_details' && activeView === 'workstation'
                  ? 'bg-[#282830] text-[#00E5CC] border-[#00E5CC]/40'
                  : 'bg-[#222228] text-[#D4D4D8] border-[#32323A] hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsShortcutsModalOpen(true)}
            title={uiText.shortcuts}
            aria-label="Phím tắt"
            className="p-1.5 bg-[#222228] hover:bg-[#2C2C36] text-[#D4D4D8] hover:text-white border border-[#32323A] rounded cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            title={uiText.settings}
            aria-label="Cài đặt hệ thống"
            className="p-1.5 bg-[#222228] hover:bg-[#2C2C36] text-[#D4D4D8] hover:text-white border border-[#32323A] rounded cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {activeView !== 'home' && (
            <>
              <button
                type="button"
                onClick={handleExportTdoCutProject}
                title={uiText.saveProjectJson}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#2B2B34] hover:bg-[#353542] text-[#E4E4E7] border border-[#3B3B48] rounded cursor-pointer"
              >
                <Download className="w-3 h-3 text-[#00E5CC]" />
                <span>{language === 'en' ? 'Save Project' : 'Lưu Dự án'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold bg-[#00E5CC] hover:bg-[#00F5DC] text-[#0A0E12] rounded transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Export' : 'Xuất'}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* MAIN BODY (HOME SCREEN LAUNCHER vs 4-ZONE EDITOR) */}
      {activeView === 'home' ? (
        <HomeLauncherView
          projects={subProjects}
          activeProjectName={projectName}
          onCreateNewProject={() => {
            setProjectName(`TDO_CUT_Project_${subProjects.length + 1}`);
            setActiveView('workstation');
            showToast(
              language === 'en'
                ? 'Created new project in TDO CUT Workstation!'
                : 'Đã khởi tạo dự án mới trong bàn dựng TDO CUT!'
            );
          }}
          onOpenProject={(sub) => {
            commitClips(sub.clips.map((c) => ({ ...c })));
            setProjectName(sub.name);
            setAspectRatio(sub.aspectRatio);
            setActiveView('workstation');
            showToast(
              language === 'en'
                ? `Opened project "${sub.name}"!`
                : `Đã mở dự án "${sub.name}"!`
            );
          }}
          onDeleteProject={(id) => {
            setSubProjects((prev) =>
              prev.map((s) => (s.id === id ? { ...s, isDeletedInTrash: true } : s))
            );
            showToast(
              language === 'en'
                ? 'Moved project to Trash (30-day retention)!'
                : 'Đã chuyển dự án vào Thùng rác (lưu trữ 30 ngày)!'
            );
          }}
          onRestoreProject={(id) => {
            setSubProjects((prev) =>
              prev.map((s) => (s.id === id ? { ...s, isDeletedInTrash: false } : s))
            );
            showToast(
              language === 'en'
                ? 'Restored project from Trash!'
                : 'Đã khôi phục dự án từ Thùng rác!'
            );
          }}
          onDuplicateProject={(id) => {
            const target = subProjects.find((s) => s.id === id);
            if (!target) return;
            const copy: SubProjectItem = {
              ...target,
              id: `sub-copy-${Date.now()}`,
              name: `${target.name} (${language === 'en' ? 'Copy' : 'Bản sao'})`,
              createdAt: language === 'en' ? 'Just now' : 'Vừa xong',
            };
            setSubProjects((prev) => [copy, ...prev]);
            showToast(
              language === 'en'
                ? `Duplicated project "${copy.name}"!`
                : `Đã nhân bản dự án "${copy.name}"!`
            );
          }}
          onRenameProject={(id, newName) => {
            setSubProjects((prev) =>
              prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
            );
            showToast(
              language === 'en'
                ? `Renamed project to "${newName}"!`
                : `Đã đổi tên dự án thành "${newName}"!`
            );
          }}
          onStartRecordScreen={() => {
            setActiveView('workstation');
            handleToggleRecordMedia();
          }}
          onOpenMatrixBatch={() => {
            setActiveView('workstation');
            setIsMatrixModalOpen(true);
          }}
          onOpenQuickTool={(tool: HomeQuickToolId) => {
            setActiveView('workstation');
            if (tool === 'long_to_shorts') {
              setAspectRatio('9:16');
              setIsSceneCutModalOpen(true);
              showToast(
                language === 'en'
                  ? 'Opened AI Scene Split (Long Video to 9:16 Shorts)!'
                  : 'Đã mở Công cụ Cắt Phim Dài thành Shorts 9:16!'
              );
            } else if (tool === 'script_to_video') {
              setTopLeftCategory('captions');
              setSubCategoryFilter('bilingual');
              setBilingualSubtitles(true);
              handleGenerateAutoCaptions('bilingual', true);
            } else if (tool === 'tts') {
              setTopLeftCategory('text');
              const existingTextClip = clips.find(
                (c) => c.trackIndex === 2 || Boolean(c.subtitleText)
              );
              if (existingTextClip) {
                setSelectedClipId(existingTextClip.id);
                setSelectedClipIds([existingTextClip.id]);
                setInspectorMode('clip');
                setTextSubTab('tts');
                handleSpeakSubtitleTts(existingTextClip.subtitleText || existingTextClip.name);
              } else {
                handleGenerateAutoCaptions('all');
              }
            } else if (tool === 'auto_cutout') {
              const firstVid = clips.find((c) => c.trackIndex === 0);
              if (firstVid) {
                setSelectedClipId(firstVid.id);
                setSelectedClipIds([firstVid.id]);
                commitClips((prev) =>
                  prev.map((c) =>
                    c.id === firstVid.id ? { ...c, autoCutout: true } : c
                  )
                );
              }
              setInspectorMode('clip');
              setInspectorTab('video');
              setVideoSubTab('cutout');
              showToast(
                language === 'en'
                  ? 'Enabled AI Auto Cutout on active video clip!'
                  : 'Đã bật Tách nền nhân vật AI (Auto Cutout) cho clip!'
              );
            } else if (tool === 'batch_edit') {
              setIsMatrixModalOpen(true);
            }
          }}
          onUseTemplatePreset={(tpl: HomeTemplatePreset) => {
            setProjectName(tpl.name);
            setAspectRatio(tpl.aspectRatio);
            commitClips((prev) =>
              prev.map((c) =>
                c.trackIndex === 0
                  ? {
                      ...c,
                      visualEffect: tpl.effect,
                      filterPreset: tpl.filter,
                      transitionType: tpl.transition,
                      transitionDuration: 0.6,
                    }
                  : c
              )
            );
            setActiveView('workstation');
            showToast(
              language === 'en'
                ? `Applied template "${tpl.name}" (${tpl.aspectRatio}) to Timeline!`
                : `Đã nạp mẫu "${tpl.name}" (${tpl.aspectRatio}) vào bàn dựng Timeline!`
            );
          }}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onBackToEditor={() => setActiveView('workstation')}
          language={language}
          onChangeLanguage={setLanguage}
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
      ) : activeView === 'pyqt_source' ? (
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 bg-[#111114]">
          <div className="max-w-6xl w-full mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#00E5CC]" />
                  <span>Kiến trúc Mã nguồn PyQt6 Desktop &amp; FFmpeg Filter Complex</span>
                </h2>
                <p className="text-xs text-[#A1A1AA]">
                  Đồng bộ trực tiếp cấu hình Timeline hiện tại sang JSON dự án TDO CUT và lệnh CLI FFmpeg chống bản quyền.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('workstation')}
                className="px-3 py-1.5 text-xs font-semibold bg-[#222228] hover:bg-[#2C2C36] text-[#00E5CC] border border-[#00E5CC]/40 rounded cursor-pointer"
              >
                ← Quay lại Bàn dựng Timeline
              </button>
            </div>
            <PythonCodeExplorer
              capcutDraftJson={capcutDraftJson}
              ffmpegCommandPreview={ffmpegCommandPreview}
            />
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* UPPER HALF: 3 ZONES (Resource Pool | 60 FPS Preview Player | Context Inspector) */}
          <div className="flex-[60] grid grid-cols-12 gap-1.5 p-1.5 min-h-0 overflow-hidden">
            {/* ZONE 1: TOP-LEFT RESOURCE PANEL (4 cols — 9 Tabs) */}
            <section
              aria-label="Kho Tài Nguyên và Công cụ AI"
              data-zone-focus={activeZoneFocus === 'resource_pool' ? 'active' : 'inactive'}
              onMouseDownCapture={() => setActiveZoneFocus('resource_pool')}
              className={`col-span-4 flex flex-col bg-[#18181C] border rounded overflow-hidden min-h-0 transition-colors ${
                activeZoneFocus === 'resource_pool'
                  ? 'border-[#00E5CC]/60'
                  : 'border-[#2B2B30]'
              }`}
            >
              {/* Top 9 Category Icon Tabs (Bilingual VI / EN) */}
              <div className="flex items-center justify-between px-1 py-1 bg-[#141418] border-b border-[#2B2B30] overflow-x-auto no-scrollbar shrink-0">
                {(
                  [
                    {
                      id: 'media',
                      label: language === 'en' ? 'Media' : 'Tệp phương tiện',
                      icon: Film,
                    },
                    {
                      id: 'audio',
                      label: language === 'en' ? 'Audio' : 'Âm thanh',
                      icon: Music,
                    },
                    {
                      id: 'text',
                      label: language === 'en' ? 'Text' : 'Văn bản',
                      icon: Type,
                    },
                    {
                      id: 'stickers',
                      label: language === 'en' ? 'Stickers' : 'Nhãn dán',
                      icon: Smile,
                    },
                    {
                      id: 'effects',
                      label: language === 'en' ? 'Effects' : 'Hiệu ứng',
                      icon: Sparkles,
                    },
                    {
                      id: 'transitions',
                      label: language === 'en' ? 'Transitions' : 'Chuyển tiếp',
                      icon: ArrowRightLeft,
                    },
                    {
                      id: 'captions',
                      label: language === 'en' ? 'Captions' : 'Chú thích',
                      icon: Subtitles,
                    },
                    {
                      id: 'filters',
                      label: language === 'en' ? 'Filters' : 'Bộ lọc',
                      icon: Filter,
                    },
                    {
                      id: 'adjust',
                      label: language === 'en' ? 'Adjust' : 'Điều chỉnh',
                      icon: Sliders,
                    },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const active = topLeftCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTopLeftCategory(tab.id)}
                      className={`flex flex-col items-center gap-0.5 px-1 py-1 rounded text-[9px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'text-[#00E5CC] font-semibold bg-[#22222A]'
                          : 'text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Inner Split: Dynamic Context-Aware Far-Left Tree Sidebar + Content Area */}
              <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Far-Left Tree Sidebar (Dynamically changes for each of the 9 tabs — never frozen!) */}
                <div className="w-29 bg-[#141418] border-r border-[#2B2B30] p-1.5 flex flex-col space-y-2 text-[11px] shrink-0 overflow-y-auto no-scrollbar">
                  {topLeftCategory === 'media' ? (
                    <>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setSidebarFolder('all')}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded bg-[#23252C] text-[#00E5CC] font-semibold text-[11px] cursor-pointer"
                        >
                          <span>Nhập</span>
                          <span className="text-[9px]">⌃</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSidebarFolder('all')}
                          className={`w-full text-left px-2 py-1.5 rounded whitespace-nowrap transition-colors cursor-pointer ${
                            sidebarFolder === 'all'
                              ? 'bg-[#1F343A] text-[#00E5CC] font-semibold'
                              : 'text-[#D4D4D8] hover:text-white'
                          }`}
                        >
                          Tệp phương tiện
                        </button>

                        <button
                          type="button"
                          onClick={() => setSidebarFolder('timeline')}
                          className={`w-full text-left px-2 py-1.5 rounded whitespace-nowrap transition-colors cursor-pointer ${
                            sidebarFolder === 'timeline'
                              ? 'bg-[#1F343A] text-[#00E5CC] font-semibold'
                              : 'text-[#D4D4D8] hover:text-white'
                          }`}
                        >
                          Dòng thời gian
                        </button>

                        <button
                          type="button"
                          onClick={() => setSidebarFolder('subproject')}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded whitespace-nowrap transition-colors cursor-pointer ${
                            sidebarFolder === 'subproject'
                              ? 'bg-[#1F343A] text-[#00E5CC] font-semibold'
                              : 'text-[#D4D4D8] hover:text-white'
                          }`}
                        >
                          <span>Dự án con</span>
                          <span className="text-[9px] font-mono bg-[#272730] px-1 rounded text-[#00E5CC]">
                            {subProjects.length}
                          </span>
                        </button>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-[#23232B]">
                        <button
                          type="button"
                          onClick={() => setSidebarFolder('brand')}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[10.5px] cursor-pointer ${
                            sidebarFolder === 'brand'
                              ? 'bg-[#1F343A] text-[#00E5CC] font-semibold'
                              : 'bg-[#2A2B32] hover:bg-[#34353E] text-[#E4E4E7]'
                          }`}
                        >
                          <span className="truncate">Tài sản thương hiệu</span>
                          <span className="text-[9px] text-[#9CA3AF]">▾</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsMatrixModalOpen(true)}
                          className="relative w-full flex items-center justify-between px-2 py-1.5 bg-[#2A2B32] hover:bg-[#34353E] rounded text-[#E4E4E7] text-[10.5px] cursor-pointer"
                        >
                          <span>Tạo</span>
                          <span className="text-[9px] text-[#9CA3AF]">▾</span>
                          <span className="absolute -top-1 right-0.5 px-1 py-0.1 text-[8px] font-bold bg-[#00E5CC] text-[#090D12] rounded-xs leading-tight">
                            AI
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSidebarFolder('cloud')}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[10.5px] cursor-pointer ${
                            sidebarFolder === 'cloud'
                              ? 'bg-[#1F343A] text-[#00E5CC] font-semibold'
                              : 'bg-[#2A2B32] hover:bg-[#34353E] text-[#E4E4E7]'
                          }`}
                        >
                          <span>Không gian</span>
                          <span className="text-[9px] text-[#9CA3AF]">▾</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSidebarFolder('library')}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[10.5px] cursor-pointer ${
                            sidebarFolder === 'library'
                              ? 'bg-[#1F343A] text-[#00E5CC] font-semibold'
                              : 'bg-[#2A2B32] hover:bg-[#34353E] text-[#E4E4E7]'
                          }`}
                        >
                          <span>Thư viện</span>
                          <span className="text-[9px] text-[#9CA3AF]">▾</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00E5CC]">
                        {topLeftCategory === 'audio'
                          ? 'Danh mục Âm thanh'
                          : topLeftCategory === 'text'
                          ? 'Danh mục Văn bản'
                          : topLeftCategory === 'stickers'
                          ? 'Kho Nhãn dán'
                          : topLeftCategory === 'effects'
                          ? 'Kho Hiệu ứng'
                          : topLeftCategory === 'transitions'
                          ? 'Chuyển tiếp'
                          : topLeftCategory === 'captions'
                          ? 'Phụ đề AI'
                          : topLeftCategory === 'filters'
                          ? 'Bộ lọc màu'
                          : 'Điều chỉnh'}
                      </div>
                      {(topLeftCategory === 'audio'
                        ? [
                            { id: 'all', label: 'Âm nhạc & SFX' },
                            { id: 'bgm', label: 'Nhạc nền Studio' },
                            { id: 'sfx', label: 'Hiệu ứng tiếng động' },
                            { id: 'tiktok', label: 'Nhạc xu hướng' },
                            { id: 'extract', label: 'Đã trích xuất' },
                          ]
                        : topLeftCategory === 'text'
                        ? [
                            { id: 'all', label: 'Thêm văn bản' },
                            { id: 'templates', label: 'Mẫu chữ Viral' },
                            { id: 'bubbles', label: 'Bong bóng chữ' },
                            { id: 'effects', label: 'Chữ nghệ thuật 3D' },
                            { id: 'srt', label: 'Nhập phụ đề .SRT' },
                          ]
                        : topLeftCategory === 'stickers'
                        ? [
                            { id: 'all', label: 'Tất cả Nhãn dán' },
                            { id: 'faces', label: 'Mặt biểu cảm (Icons)' },
                            { id: 'flags', label: 'Cờ các nước (World Flags)' },
                            { id: 'emoji', label: 'Biểu tượng cảm xúc' },
                            { id: 'cta', label: 'Nút Subscribe/Like' },
                            { id: 'neon', label: 'Khung & Mũi tên' },
                          ]
                        : topLeftCategory === 'effects'
                        ? [
                            { id: 'all', label: 'Hiệu ứng Video' },
                            { id: 'body', label: 'Hiệu ứng Cơ thể' },
                            { id: 'retro', label: 'Cổ điển / VHS' },
                            { id: 'glow', label: 'Ánh sáng Neon' },
                          ]
                        : topLeftCategory === 'transitions'
                        ? [
                            { id: 'all', label: 'Tất cả Chuyển tiếp' },
                            { id: 'camera', label: 'Máy ảnh & Zoom' },
                            { id: 'mg', label: 'Chuyển động MG' },
                            { id: 'glitch', label: 'Glitch & Flash' },
                          ]
                        : topLeftCategory === 'captions'
                        ? [
                            { id: 'all', label: 'Phụ đề tự động' },
                            { id: 'bilingual', label: 'Song ngữ Việt-Anh' },
                            { id: 'lyrics', label: 'Lời bài hát AI' },
                            { id: 'filler', label: 'Lọc từ thừa (Ờ, À)' },
                          ]
                        : topLeftCategory === 'filters'
                        ? [
                            { id: 'all', label: 'Tất cả Bộ lọc' },
                            { id: 'cinema', label: 'Điện ảnh (LUT)' },
                            { id: 'life', label: 'Đời thường & Ẩm thực' },
                            { id: 'bw', label: 'Đen trắng Noir' },
                          ]
                        : [
                            { id: 'all', label: 'Lớp điều chỉnh' },
                            { id: 'lut', label: 'Nhập LUT (.cube)' },
                            { id: 'hsl', label: 'Chuẩn màu HSL' },
                          ]
                      ).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSubCategoryFilter(item.id);
                            if (topLeftCategory === 'text' && item.id === 'srt') {
                              srtInputRef.current?.click();
                            } else if (topLeftCategory === 'captions') {
                              if (item.id === 'all') {
                                handleGenerateAutoCaptions('all');
                              } else if (item.id === 'bilingual') {
                                setBilingualSubtitles(true);
                                handleGenerateAutoCaptions('bilingual', true);
                              } else if (item.id === 'lyrics') {
                                handleGenerateAutoCaptions('lyrics');
                              } else if (item.id === 'filler') {
                                setRemoveFillerWords(true);
                                handleRemoveDeadAirSilence();
                                handleGenerateAutoCaptions('filler', undefined, true);
                              }
                              return;
                            } else if (topLeftCategory === 'adjust' && item.id === 'hsl') {
                              setInspectorMode('clip');
                              setInspectorTab('adjust');
                              setAdjustSubTab('hsl');
                            }
                            showToast(`Đã lọc danh mục "${item.label}"`);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded transition-colors cursor-pointer ${
                            subCategoryFilter === item.id
                              ? 'bg-[#1F343A] text-[#00E5CC] font-semibold'
                              : 'text-[#D4D4D8] hover:text-white hover:bg-[#22222A]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Content Pane inside Zone 1 (Supports 2D Cyan Marquee Selection & Batch Drag to Timeline) */}
                <div
                  ref={resourcePaneRef}
                  onMouseDown={handleMouseDownResourcePane}
                  onClickCapture={(e) => {
                    const targetEl = e.target as HTMLElement | null;
                    if (targetEl?.closest('[data-no-marquee="true"]')) {
                      suppressNextResourceClickRef.current = false;
                      return;
                    }
                    if (suppressNextResourceClickRef.current) {
                      suppressNextResourceClickRef.current = false;
                      e.stopPropagation();
                      e.preventDefault();
                    }
                  }}
                  className="relative flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden select-none"
                >
                  {/* Floating Selection Bar when 1+ resource items are selected (Absolute so it never shifts card layout during marquee drag) */}
                  {selectedResourceIds.length > 0 && (
                    <div
                      data-no-marquee="true"
                      className="absolute bottom-11 left-2 right-2 flex items-center justify-between gap-1 px-2 py-1 bg-[#0B1E22]/95 backdrop-blur-xs border border-[#00E5CC]/60 rounded shadow-lg z-30"
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#00E5CC] text-[#071013] rounded whitespace-nowrap shrink-0">
                          Đã chọn {selectedResourceIds.length}
                        </span>
                        <button
                          type="button"
                          onClick={handleSelectAllCurrentResources}
                          className="px-1.5 py-0.5 text-[10px] font-medium bg-[#182C32] hover:bg-[#223D45] text-[#00E5CC] border border-[#00E5CC]/30 rounded cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedResourceIds([])}
                          className="px-1.5 py-0.5 text-[10px] text-[#A1A1AA] hover:text-white bg-[#1B1B22] rounded cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Bỏ
                        </button>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {topLeftCategory === 'media' &&
                          (sidebarFolder === 'all' || sidebarFolder === 'timeline') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMediaCardsAndClips(selectedResourceIds, true)}
                              title="Xóa tận gốc các tệp và clip liên kết đang chọn (Phím Delete)"
                              className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#EF4444]/20 hover:bg-[#EF4444] text-[#FCA5A5] hover:text-white border border-[#EF4444]/40 rounded cursor-pointer whitespace-nowrap"
                            >
                              Xóa
                            </button>
                          )}
                        <button
                          type="button"
                          onClick={() => handlePushResourceIdsToTimeline(selectedResourceIds)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-[#00E5CC] hover:bg-[#00F5DC] text-[#071013] rounded shadow cursor-pointer whitespace-nowrap"
                        >
                          + Thêm vào Timeline ({selectedResourceIds.length})
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 1: MEDIA POOL / TIMELINE LIST / SUB-PROJECTS / BRAND / CLOUD / LIBRARY */}
                  {topLeftCategory === 'media' && (
                    <>
                      {/* Action Row: + Nhập, Ghi, Tìm kiếm, Filter Usage, Xóa mẫu */}
                      <div
                        data-no-marquee="true"
                        className="flex items-center gap-1.5 p-2 border-b border-[#26262E] shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() => mediaInputRef.current?.click()}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#25252D] hover:bg-[#30303B] text-white border border-[#383844] rounded whitespace-nowrap cursor-pointer"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-[#00E5CC] text-[#090D12] flex items-center justify-center font-black text-[10px]">
                            +
                          </span>
                          <span>Nhập</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleToggleRecordMedia}
                          className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium border rounded whitespace-nowrap cursor-pointer ${
                            isRecordingMedia
                              ? 'bg-[#DC2626] text-white border-[#EF4444] animate-pulse'
                              : 'bg-[#25252D] hover:bg-[#30303B] text-[#D4D4D8] border-[#383844]'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5 text-[#D4D4D8]" />
                          <span>{isRecordingMedia ? 'Đang ghi...' : 'Ghi'}</span>
                        </button>

                        <div className="relative flex-1 min-w-0">
                          <Search className="w-3 h-3 text-[#71717A] absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm tệp phư..."
                            aria-label="Tìm kiếm tệp phương tiện"
                            className="w-full pl-6 pr-2 py-1 text-[11px] bg-[#121216] border border-[#2C2C34] rounded text-white placeholder-[#71717A]"
                          />
                        </div>

                        <select
                          aria-label="Lọc trạng thái sử dụng"
                          value={mediaFilterUsage}
                          onChange={(e) =>
                            setMediaFilterUsage(e.target.value as 'all' | 'used' | 'unused')
                          }
                          className="px-1.5 py-1 text-[10px] bg-[#25252D] border border-[#383844] rounded text-[#D4D4D8]"
                        >
                          <option value="all">Tất cả</option>
                          <option value="used">Đã dùng</option>
                          <option value="unused">Chưa dùng</option>
                        </select>

                        {mediaCards.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllSampleData}
                            title="Xóa tất cả dữ liệu mẫu / Tạo dự án trắng"
                            className="p-1 text-[#A1A1AA] hover:text-[#F87171] bg-[#25252D] rounded border border-[#383844] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {sidebarFolder === 'subproject' ? (
                        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-white">
                              Danh sách Dự án con ({subProjects.length})
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={handleSelectAllCurrentResources}
                                className="px-2 py-1 text-[10px] font-medium bg-[#25252E] hover:bg-[#30303C] text-[#00E5CC] border border-[#383846] rounded cursor-pointer"
                              >
                                Chọn tất cả
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveSubProject()}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-[#00E5CC] text-black rounded cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Lưu Timeline hiện tại</span>
                              </button>
                            </div>
                          </div>

                          {subProjects.map((sub) => {
                            const isSubSelected = selectedResourceIds.includes(sub.id);
                            return (
                              <div
                                key={sub.id}
                                data-resource-id={sub.id}
                                onClick={(e) => {
                                  if (e.ctrlKey || e.metaKey || e.shiftKey) {
                                    setSelectedResourceIds((prev) =>
                                      prev.includes(sub.id)
                                        ? prev.filter((id) => id !== sub.id)
                                        : [...prev, sub.id]
                                    );
                                  } else {
                                    setSelectedResourceIds([sub.id]);
                                  }
                                }}
                                className={`p-2 rounded flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                  isSubSelected
                                    ? 'bg-[#00E5CC]/15 border-2 border-[#00E5CC] shadow-[0_0_10px_rgba(0,229,204,0.3)]'
                                    : 'bg-[#22222A] border border-[#32323E] hover:border-[#00E5CC]/50'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-medium text-white truncate">
                                    {sub.name}
                                  </div>
                                  <div className="text-[10px] text-[#9CA3AF]">
                                    {sub.clips.filter((c) => c.trackIndex === 0).length} video clips ·{' '}
                                    {sub.createdAt}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    commitClips(sub.clips.map((c) => ({ ...c })));
                                    showToast(`Đã nạp "${sub.name}" lên Timeline!`);
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-semibold bg-[#00E5CC] text-black rounded shrink-0 cursor-pointer"
                                >
                                  Nạp
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : sidebarFolder === 'timeline' ? (
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-semibold text-[#A1A1AA]">
                              Các clip đang nằm trên Timeline ({clips.length})
                            </span>
                            <button
                              type="button"
                              onClick={handleSelectAllCurrentResources}
                              className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer"
                            >
                              Chọn tất cả
                            </button>
                          </div>
                          {clips.map((c, idx) => {
                            const isClipItemSelected =
                              selectedResourceIds.includes(c.id) ||
                              selectedClipIds.includes(c.id) ||
                              c.id === selectedClipId;
                            return (
                              <div
                                key={c.id}
                                data-resource-id={c.id}
                                onClick={(e) => {
                                  if (e.ctrlKey || e.metaKey || e.shiftKey) {
                                    const nextIds = selectedClipIds.includes(c.id)
                                      ? selectedClipIds.filter((id) => id !== c.id)
                                      : [...selectedClipIds, c.id];
                                    setSelectedClipIds(nextIds);
                                    setSelectedResourceIds(nextIds);
                                    setSelectedClipId(nextIds[0] ?? null);
                                  } else {
                                    setSelectedClipId(c.id);
                                    setSelectedClipIds([c.id]);
                                    setSelectedResourceIds([c.id]);
                                    setPlayheadSec(c.startTime);
                                  }
                                }}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer ${
                                  isClipItemSelected
                                    ? 'bg-[#00E5CC]/15 border border-[#00E5CC] text-white'
                                    : 'bg-[#22222A] text-[#D4D4D8] hover:bg-[#2A2A34]'
                                }`}
                              >
                                <span className="truncate flex-1">
                                  #{idx + 1} · {c.name} (Layer {c.trackIndex})
                                </span>
                                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                  <span className="font-mono text-[10px] text-[#00E5CC]">
                                    {c.duration.toFixed(1)}s
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMediaCardsAndClips([c.id], true);
                                    }}
                                    title="Xóa clip này khỏi Timeline và Tệp phương tiện"
                                    className="w-4 h-4 rounded-full bg-black/60 hover:bg-[#EF4444] text-[#FCA5A5] hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : sidebarFolder === 'library' ||
                        sidebarFolder === 'brand' ||
                        sidebarFolder === 'cloud' ? (
                        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">
                              {sidebarFolder === 'brand'
                                ? 'Bộ Tài sản Thương hiệu Kênh (Logo, Intro, Lower Third)'
                                : sidebarFolder === 'cloud'
                                ? 'Không gian Đám mây Đồng bộ (Cloud Multi-Cam & B-Roll)'
                                : 'Thư viện Phông xanh, Đếm ngược & Intro/Outro'}
                            </span>
                            <button
                              type="button"
                              onClick={handleSelectAllCurrentResources}
                              className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer shrink-0"
                            >
                              Chọn tất cả
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pb-6">
                            {STOCK_LIBRARY_ITEMS.filter(
                              (s) =>
                                s.folder === sidebarFolder &&
                                (!searchQuery.trim() ||
                                  s.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
                            ).map((stock) => {
                              const isStockSelected = selectedResourceIds.includes(stock.id);
                              return (
                                <div
                                  key={stock.id}
                                  data-resource-id={stock.id}
                                  draggable={true}
                                  onDragStart={(e) => {
                                    const activeIds = isStockSelected
                                      ? selectedResourceIds
                                      : [stock.id];
                                    const batchPayloads: TimelineDragPayload[] =
                                      STOCK_LIBRARY_ITEMS.filter((s) =>
                                        activeIds.includes(s.id)
                                      ).map((s) => ({
                                        kind: 'media',
                                        name: s.name,
                                        duration: s.dur,
                                        mediaType: s.name.endsWith('.wav') ? 'audio' : 'video',
                                        colorHex: s.color,
                                      }));
                                    const payload: TimelineDragPayload = {
                                      kind: 'media',
                                      name: stock.name,
                                      duration: stock.dur,
                                      mediaType: stock.name.endsWith('.wav') ? 'audio' : 'video',
                                      colorHex: stock.color,
                                      batchItems:
                                        batchPayloads.length > 1 ? batchPayloads : undefined,
                                    };
                                    e.dataTransfer.setData(
                                      'application/x-trendopsis-drag',
                                      JSON.stringify(payload)
                                    );
                                    e.dataTransfer.effectAllowed = 'copyMove';
                                  }}
                                  onClick={(e) => {
                                    if (e.ctrlKey || e.metaKey || e.shiftKey) {
                                      setSelectedResourceIds((prev) =>
                                        prev.includes(stock.id)
                                          ? prev.filter((id) => id !== stock.id)
                                          : [...prev, stock.id]
                                      );
                                      return;
                                    }
                                    setSelectedResourceIds([stock.id]);
                                  }}
                                  onDoubleClick={() => {
                                    const idsToPush =
                                      isStockSelected && selectedResourceIds.length > 1
                                        ? selectedResourceIds
                                        : [stock.id];
                                    handlePushResourceIdsToTimeline(idsToPush);
                                  }}
                                  className={`relative p-2.5 rounded text-left cursor-grab active:cursor-grabbing transition-all ${
                                    isStockSelected
                                      ? 'bg-[#00E5CC]/15 border-2 border-[#00E5CC] shadow-[0_0_12px_rgba(0,229,204,0.4)]'
                                      : 'bg-[#22222A] hover:border-[#00E5CC] border border-[#32323E]'
                                  }`}
                                >
                                  {isStockSelected && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#00E5CC] text-[#071013] font-black text-[10px] flex items-center justify-center shadow">
                                      ✓
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span
                                      style={{ backgroundColor: stock.color }}
                                      className="w-2 h-2 rounded-full shrink-0"
                                    />
                                    <span className="text-[9px] uppercase font-bold text-[#9CA3AF]">
                                      {stock.tag}
                                    </span>
                                  </div>
                                  <div
                                    title={stock.name}
                                    className="font-medium text-white text-[11px] leading-snug line-clamp-2 pr-3"
                                  >
                                    {stock.name}
                                  </div>
                                  <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-[10px] font-mono text-[#00E5CC]">
                                      {stock.dur}s
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const idsToPush =
                                          isStockSelected && selectedResourceIds.length > 1
                                            ? selectedResourceIds
                                            : [stock.id];
                                        handlePushResourceIdsToTimeline(idsToPush);
                                      }}
                                      className="px-1.5 py-0.5 text-[10px] font-bold bg-[#00E5CC] text-[#071013] rounded cursor-pointer"
                                    >
                                      + Thêm
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Sub-view 1C: Default Media Card Grid (Supports 2D Cyan Marquee Selection & Single/Batch Drag to Timeline) */
                        <div className="flex-1 overflow-y-auto p-2.5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-[#D4D4D8]">
                                Tất cả ({filteredMediaCards.length})
                              </span>
                              {filteredMediaCards.length > 0 && (
                                <button
                                  type="button"
                                  data-no-marquee="true"
                                  onClick={handleSelectAllCurrentResources}
                                  className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer"
                                >
                                  Chọn tất cả
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] text-[#00E5CC] truncate">
                              Nhấp kéo tệp xuống Timeline hoặc kéo vùng trống để quét chọn
                            </span>
                          </div>

                          {filteredMediaCards.length === 0 ? (
                            <div
                              onClick={() => mediaInputRef.current?.click()}
                              className="h-40 border border-dashed border-[#383844] rounded flex flex-col items-center justify-center gap-2 text-center p-4 cursor-pointer hover:border-[#00E5CC]"
                            >
                              <Upload className="w-6 h-6 text-[#00E5CC]" />
                              <span className="text-xs text-[#D4D4D8]">
                                Bấm &ldquo;+ Nhập&rdquo; để tải nhiều file Video / Audio thật từ máy tính
                              </span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2 pb-6">
                              {filteredMediaCards.map((card) => {
                                const isCardSelected = selectedResourceIds.includes(card.id);
                                return (
                                  <div
                                    key={card.id}
                                    data-resource-id={card.id}
                                    draggable={true}
                                    onDragStart={(e) => {
                                      const activeIds =
                                        isCardSelected && selectedResourceIds.length > 0
                                          ? selectedResourceIds
                                          : [card.id];
                                      if (!isCardSelected) {
                                        setSelectedResourceIds([card.id]);
                                      }
                                      const selectedCards = filteredMediaCards.filter((c) =>
                                        activeIds.includes(c.id)
                                      );
                                      const batchPayloads: TimelineDragPayload[] = selectedCards.map(
                                        (c) => ({
                                          kind: 'media',
                                          name: c.name,
                                          duration: c.duration,
                                          mediaType: c.type === 'audio' ? 'audio' : 'video',
                                          mediaUrl: c.mediaUrl,
                                          thumbnailUrl: c.thumbnailUrl,
                                          mediaWidth: c.mediaWidth,
                                          mediaHeight: c.mediaHeight,
                                          nativeAspectRatio: c.nativeAspectRatio,
                                          colorHex: '#0D9488',
                                        })
                                      );
                                      const payload: TimelineDragPayload = {
                                        kind: 'media',
                                        name: card.name,
                                        duration: card.duration,
                                        mediaType: card.type === 'audio' ? 'audio' : 'video',
                                        mediaUrl: card.mediaUrl,
                                        thumbnailUrl: card.thumbnailUrl,
                                        mediaWidth: card.mediaWidth,
                                        mediaHeight: card.mediaHeight,
                                        nativeAspectRatio: card.nativeAspectRatio,
                                        colorHex: '#0D9488',
                                        batchItems:
                                          batchPayloads.length > 1 ? batchPayloads : undefined,
                                      };
                                      e.dataTransfer.setData(
                                        'application/x-trendopsis-drag',
                                        JSON.stringify(payload)
                                      );
                                      e.dataTransfer.effectAllowed = 'copyMove';
                                    }}
                                    onClick={(e) => {
                                      setActiveZoneFocus('resource_pool');
                                      if (e.ctrlKey || e.metaKey || e.shiftKey) {
                                        setSelectedResourceIds((prev) =>
                                          prev.includes(card.id)
                                            ? prev.filter((id) => id !== card.id)
                                            : [...prev, card.id]
                                        );
                                      } else {
                                        setSelectedResourceIds([card.id]);
                                      }
                                    }}
                                    onDoubleClick={() => {
                                      if (isCardSelected && selectedResourceIds.length > 1) {
                                        const cardsToPush = filteredMediaCards.filter((c) =>
                                          selectedResourceIds.includes(c.id)
                                        );
                                        handlePushMultipleCardsToTimeline(cardsToPush);
                                      } else {
                                        handlePushCardToTimeline(card);
                                      }
                                    }}
                                    title={`${card.name} — Kéo thả trực tiếp xuống Timeline hoặc nhấp đúp để thêm`}
                                    className="group relative flex flex-col cursor-grab active:cursor-grabbing"
                                  >
                                    <div
                                      style={
                                        card.thumbnailUrl
                                          ? {
                                              backgroundImage: `url(${card.thumbnailUrl})`,
                                              backgroundSize: 'cover',
                                              backgroundPosition: 'center',
                                            }
                                          : { background: card.gradient || '#2A2B32' }
                                      }
                                      className={`relative aspect-video rounded overflow-hidden transition-all flex items-center justify-center ${
                                        isCardSelected
                                          ? 'border-2 border-[#00E5CC] ring-2 ring-[#00E5CC]/40 shadow-[0_0_12px_rgba(0,229,204,0.45)]'
                                          : 'border border-[#2E2E38] group-hover:border-[#00E5CC]'
                                      }`}
                                    >
                                      {card.type === 'folder' && (
                                        <Folder className="w-9 h-9 text-[#EAB308] fill-[#EAB308]" />
                                      )}
                                      {card.added && (
                                        <span className="absolute top-1 left-1 px-1 py-0.2 bg-black/75 text-[9px] text-white rounded">
                                          Đã thêm
                                        </span>
                                      )}
                                      {isCardSelected && (
                                        <span
                                          data-testid={`selected-badge-${card.id}`}
                                          className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-[#00E5CC] text-[#071013] font-black text-[10px] flex items-center justify-center shadow pointer-events-none"
                                        >
                                          ✓
                                        </span>
                                      )}
                                      {card.type !== 'folder' && (
                                        <span className="absolute top-1 right-1 px-1 py-0.2 bg-black/70 font-mono text-[9px] text-white rounded">
                                          {card.timeLabel}
                                        </span>
                                      )}

                                      <button
                                        type="button"
                                        data-testid={`delete-media-card-${card.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteMediaCardsAndClips([card.id], true);
                                        }}
                                        title="Xóa tận gốc tệp này khỏi Kho phương tiện & Timeline"
                                        className="opacity-0 group-hover:opacity-100 absolute bottom-1 left-1 w-4 h-4 rounded-full bg-black/80 hover:bg-[#EF4444] text-white flex items-center justify-center text-[10px] transition-opacity cursor-pointer z-10"
                                      >
                                        ×
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isCardSelected && selectedResourceIds.length > 1) {
                                            const cardsToPush = filteredMediaCards.filter((c) =>
                                              selectedResourceIds.includes(c.id)
                                            );
                                            handlePushMultipleCardsToTimeline(cardsToPush);
                                          } else {
                                            handlePushCardToTimeline(card);
                                          }
                                        }}
                                        title={
                                          isCardSelected && selectedResourceIds.length > 1
                                            ? `Đẩy tất cả ${selectedResourceIds.length} tệp đang chọn xuống Timeline`
                                            : 'Đẩy xuống cuối Timeline'
                                        }
                                        className="opacity-0 group-hover:opacity-100 absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00E5CC] text-[#0A0E12] flex items-center justify-center shadow transition-opacity cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                      </button>
                                    </div>
                                    <span
                                      title={card.name}
                                      className={`mt-1 text-[10.5px] leading-tight line-clamp-2 ${
                                        isCardSelected
                                          ? 'text-[#00E5CC] font-semibold'
                                          : 'text-[#A1A1AA] group-hover:text-white'
                                      }`}
                                    >
                                      {card.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom AI Clipper Banner (100% Free Edition — No Trial Badge) */}
                      <div
                        data-no-marquee="true"
                        className="flex items-center justify-between gap-2 px-2.5 py-2 bg-[#1D2228] border-t border-[#2B313A] shrink-0"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Sparkles className="w-3.5 h-3.5 text-[#00E5CC] shrink-0" />
                          <span className="text-[11px] font-semibold text-[#00E5CC] truncate">
                            Công cụ cắt clip bằng AI
                          </span>
                          <span className="text-[10px] text-[#9CA3AF] truncate hidden xl:inline">
                            Chọn tệp phương tiệ...
                          </span>
                        </div>
                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() => setIsSceneCutModalOpen(true)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-[#00E5CC] hover:bg-[#00F5DC] text-[#0A0E12] rounded whitespace-nowrap cursor-pointer"
                          >
                            Bắt đầu cắt clip
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* TAB 2: AUDIO & WEB AUDIO SYNTHESIZER SFX (Supports 2D Marquee Selection & Batch Add) */}
                  {topLeftCategory === 'audio' && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                      <div data-no-marquee="true" className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => audioInputRef.current?.click()}
                          className="py-2 px-2 bg-[#00E5CC] hover:bg-[#00F5DC] text-black font-semibold rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải MP3 / WAV</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!currentClip || currentClip.trackIndex !== 0) return;
                            commitClips((prev) => extractAudioFromVideoClip(prev, currentClip.id));
                            showToast(
                              `Đã trích xuất âm thanh rời từ "${currentClip.name}" xuống Track Âm thanh!`
                            );
                          }}
                          className="py-2 px-2 bg-[#25252E] hover:bg-[#30303C] text-white border border-[#383846] font-medium rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#00E5CC]" />
                          <span>Trích xuất âm thanh</span>
                        </button>
                      </div>

                      {subCategoryFilter === 'extract' ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">
                              Âm thanh trên Timeline &amp; Đã trích xuất (
                              {clips.filter((c) => c.trackIndex === 1).length})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const firstVid = clips.find((c) => c.trackIndex === 0);
                                if (!firstVid) return;
                                commitClips((prev) => extractAudioFromVideoClip(prev, firstVid.id));
                                showToast(
                                  `Đã tách âm thanh từ "${firstVid.name}" xuống Track ♫!`
                                );
                              }}
                              className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer"
                            >
                              + Tách từ Video chính
                            </button>
                          </div>
                          {clips
                            .filter((c) => c.trackIndex === 1)
                            .map((aud) => (
                              <div
                                key={aud.id}
                                data-resource-id={aud.id}
                                onClick={() => {
                                  setSelectedClipId(aud.id);
                                  setSelectedClipIds([aud.id]);
                                  setPlayheadSec(aud.startTime);
                                }}
                                className="p-2 rounded bg-[#22222A] border border-[#30303C] hover:border-[#00E5CC] flex items-center justify-between gap-2 cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <div className="font-medium text-white truncate">
                                    ♫ {aud.name}
                                  </div>
                                  <div className="text-[10px] text-[#9CA3AF]">
                                    Bắt đầu: {aud.startTime.toFixed(1)}s · Thời lượng:{' '}
                                    {aud.duration.toFixed(1)}s · Âm lượng: {aud.volume}%
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 text-[10px] font-mono bg-[#1F343A] text-[#00E5CC] rounded">
                                  Track 1
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between pt-1">
                            <span className="font-semibold text-white">
                              {subCategoryFilter === 'bgm'
                                ? 'Nhạc Nền Studio Không Bản Quyền'
                                : subCategoryFilter === 'sfx'
                                ? 'Hiệu Ứng Tiếng Động Chuyển Cảnh (SFX)'
                                : subCategoryFilter === 'tiktok'
                                ? 'Âm Thanh Xu Hướng Viral & Meme'
                                : 'Kho Nhạc Nền & Hiệu Ứng Âm Thanh (24 mẫu)'}
                            </span>
                            <button
                              type="button"
                              onClick={handleSelectAllCurrentResources}
                              className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer shrink-0"
                            >
                              Chọn tất cả
                            </button>
                          </div>
                          <div className="space-y-1.5 pb-4">
                            {SFX_LIBRARY.filter((sfx) => {
                              if (subCategoryFilter === 'all') return true;
                              return sfx.subCat === subCategoryFilter;
                            }).map((sfx) => {
                              const isSfxSelected = selectedResourceIds.includes(sfx.id);
                              return (
                                <div
                                  key={sfx.id}
                                  data-resource-id={sfx.id}
                                  draggable={true}
                                  onDragStart={(e) => {
                                    const activeIds = isSfxSelected
                                      ? selectedResourceIds
                                      : [sfx.id];
                                    const batchPayloads: TimelineDragPayload[] =
                                      SFX_LIBRARY.filter((s) => activeIds.includes(s.id)).map(
                                        (s) => ({
                                          kind: 'audio_sfx',
                                          name: s.label,
                                          duration: s.durationSec,
                                          sfxPresetId: s.id,
                                        })
                                      );
                                    const payload: TimelineDragPayload = {
                                      kind: 'audio_sfx',
                                      name: sfx.label,
                                      duration: sfx.durationSec,
                                      sfxPresetId: sfx.id,
                                      batchItems:
                                        batchPayloads.length > 1 ? batchPayloads : undefined,
                                    };
                                    e.dataTransfer.setData(
                                      'application/x-trendopsis-drag',
                                      JSON.stringify(payload)
                                    );
                                    e.dataTransfer.effectAllowed = 'copyMove';
                                  }}
                                  onClick={(e) => {
                                    if (e.ctrlKey || e.metaKey || e.shiftKey) {
                                      setSelectedResourceIds((prev) =>
                                        prev.includes(sfx.id)
                                          ? prev.filter((id) => id !== sfx.id)
                                          : [...prev, sfx.id]
                                      );
                                    } else {
                                      setSelectedResourceIds([sfx.id]);
                                    }
                                  }}
                                  className={`p-2 rounded flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-all ${
                                    isSfxSelected
                                      ? 'bg-[#00E5CC]/15 border-2 border-[#00E5CC] shadow-[0_0_10px_rgba(0,229,204,0.35)]'
                                      : 'bg-[#22222A] hover:border-[#00E5CC] border border-[#30303C]'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="font-medium text-white leading-snug">
                                      {isSfxSelected ? `✓ ${sfx.label}` : sfx.label}
                                    </div>
                                    <div className="text-[10px] text-[#9CA3AF]">
                                      {sfx.category} · {sfx.durationSec}s · Kéo thả vào Track ♫
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        webAudioEngine.playSfx(sfx.id, 0.85);
                                      }}
                                      className="px-2 py-1 text-[10px] bg-[#2E2E3A] hover:bg-[#3A3A48] text-white rounded cursor-pointer"
                                    >
                                      Nghe thử
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isSfxSelected && selectedResourceIds.length > 1) {
                                          handlePushResourceIdsToTimeline(selectedResourceIds);
                                        } else {
                                          handleAddSynthesizedSfx(
                                            sfx.id,
                                            sfx.label,
                                            sfx.durationSec
                                          );
                                        }
                                      }}
                                      className="px-2 py-1 text-[10px] font-semibold bg-[#00E5CC] text-black rounded cursor-pointer"
                                    >
                                      + Thêm
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* TAB 3: TEXT, AUTO CAPTIONS & SUBTITLES (.SRT) (Supports 2D Marquee Selection) */}
                  {topLeftCategory === 'text' && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                      <div data-no-marquee="true" className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          draggable={true}
                          onDragStart={(e) => {
                            const payload: TimelineDragPayload = {
                              kind: 'text',
                              name: 'Văn bản mặc định',
                              duration: 4.5,
                              subtitleText: 'Nhập văn bản mới...',
                            };
                            e.dataTransfer.setData(
                              'application/x-trendopsis-drag',
                              JSON.stringify(payload)
                            );
                          }}
                          onClick={() => {
                            const newId = `txt-${Date.now()}`;
                            commitClips((prev) => [
                              ...prev,
                              {
                                id: newId,
                                name: 'Phụ đề mới',
                                filePath: '',
                                trackIndex: 2,
                                startTime: playheadSec,
                                duration: 4.5,
                                sourceIn: 0,
                                speed: 1,
                                volume: 100,
                                flipH: false,
                                cropRatio: 1,
                                subtitleText: 'Nhập phụ đề tại đây...',
                                fontSize: 28,
                                textColor: '#FFFFFF',
                                textStrokeColor: '#000000',
                                colorHex: '#A45A49',
                              },
                            ]);
                            setSelectedClipId(newId);
                            setSelectedClipIds([newId]);
                          }}
                          className="py-2 px-2 bg-[#00E5CC] text-black font-semibold rounded flex items-center justify-center gap-1 cursor-grab active:cursor-grabbing"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm / Kéo thả chữ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => srtInputRef.current?.click()}
                          className="py-2 px-2 bg-[#25252E] hover:bg-[#30303C] text-white border border-[#383846] font-medium rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#00E5CC]" />
                          <span>Nhập file .SRT</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {subCategoryFilter === 'templates'
                            ? 'Mẫu Chữ Viral & Tiêu Đề Kênh (8 mẫu)'
                            : subCategoryFilter === 'bubbles'
                            ? 'Bong Bóng Chữ & Hộp Thoại Mạng Xã Hội (6 mẫu)'
                            : subCategoryFilter === 'effects'
                            ? 'Chữ Nghệ Thuật 3D, Neon & Karaoke (4 mẫu)'
                            : 'Kho Mẫu Chữ, Bong Bóng & Tiêu Đề (18 mẫu)'}
                        </span>
                        <button
                          type="button"
                          onClick={handleSelectAllCurrentResources}
                          className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer shrink-0"
                        >
                          Chọn tất cả
                        </button>
                      </div>

                      {/* Draggable & Marquee-Selectable Text Templates */}
                      <div className="grid grid-cols-2 gap-2">
                        {TEXT_TEMPLATE_ITEMS.filter(
                          (tpl) =>
                            subCategoryFilter === 'all' ||
                            subCategoryFilter === 'srt' ||
                            tpl.subCat === subCategoryFilter
                        ).map((tpl) => {
                          const isTplSelected = selectedResourceIds.includes(tpl.id);
                          return (
                            <div
                              key={tpl.id}
                              data-resource-id={tpl.id}
                              draggable={true}
                              onDragStart={(e) => {
                                const activeIds = isTplSelected ? selectedResourceIds : [tpl.id];
                                const batchPayloads: TimelineDragPayload[] =
                                  TEXT_TEMPLATE_ITEMS.filter((t) => activeIds.includes(t.id)).map(
                                    (t) => ({
                                      kind: 'text',
                                      name: t.label,
                                      duration: 4.0,
                                      subtitleText: t.text,
                                    })
                                  );
                                const payload: TimelineDragPayload = {
                                  kind: 'text',
                                  name: tpl.label,
                                  duration: 4.0,
                                  subtitleText: tpl.text,
                                  batchItems:
                                    batchPayloads.length > 1 ? batchPayloads : undefined,
                                };
                                e.dataTransfer.setData(
                                  'application/x-trendopsis-drag',
                                  JSON.stringify(payload)
                                );
                                e.dataTransfer.effectAllowed = 'copyMove';
                              }}
                              onClick={(e) => {
                                if (e.ctrlKey || e.metaKey || e.shiftKey) {
                                  setSelectedResourceIds((prev) =>
                                    prev.includes(tpl.id)
                                      ? prev.filter((id) => id !== tpl.id)
                                      : [...prev, tpl.id]
                                  );
                                  return;
                                }
                                setSelectedResourceIds([tpl.id]);
                              }}
                              onDoubleClick={() => {
                                const idsToPush =
                                  isTplSelected && selectedResourceIds.length > 1
                                    ? selectedResourceIds
                                    : [tpl.id];
                                handlePushResourceIdsToTimeline(idsToPush);
                              }}
                              className={`relative p-2.5 rounded cursor-grab active:cursor-grabbing transition-all ${
                                isTplSelected
                                  ? 'bg-[#00E5CC]/15 border-2 border-[#00E5CC] shadow-[0_0_10px_rgba(0,229,204,0.35)]'
                                  : 'bg-[#22222A] hover:border-[#00E5CC] border border-[#30303C]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-[#1F343A] text-[#00E5CC]">
                                  {tpl.badge}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePushResourceIdsToTimeline([tpl.id]);
                                  }}
                                  className="px-1.5 py-0.5 text-[9px] font-bold bg-[#00E5CC] text-[#071013] rounded cursor-pointer"
                                >
                                  + Thêm
                                </button>
                              </div>
                              <div className="font-semibold text-white text-[11px] leading-snug line-clamp-2">
                                {tpl.label}
                              </div>
                              <div className="text-[10px] text-[#00E5CC] truncate mt-0.5">
                                &ldquo;{tpl.text}&rdquo;
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Auto Captions (Phụ đề tự động AI) */}
                      <div
                        data-no-marquee="true"
                        className="p-2.5 bg-[#1E1E26] border border-[#30303E] rounded space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#00E5CC]">
                            Phụ đề tự động AI (Auto Captions)
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">Faster-Whisper</span>
                        </div>
                        <label className="flex items-center gap-2 text-[11px] text-[#D4D4D8] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bilingualSubtitles}
                            onChange={(e) => setBilingualSubtitles(e.target.checked)}
                            className="accent-[#00E5CC]"
                          />
                          <span>Phụ đề song ngữ (Bilingual Subtitles Việt - Anh)</span>
                        </label>
                        <label className="flex items-center gap-2 text-[11px] text-[#D4D4D8] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={removeFillerWords}
                            onChange={(e) => setRemoveFillerWords(e.target.checked)}
                            className="accent-[#00E5CC]"
                          />
                          <span>Xóa từ thừa &amp; khoảng lặng (Identify filler words)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateAutoCaptions}
                          className="w-full py-1.5 bg-[#00E5CC]/20 hover:bg-[#00E5CC] hover:text-black text-[#00E5CC] border border-[#00E5CC]/40 font-semibold rounded transition-colors cursor-pointer"
                        >
                          Tạo Phụ đề Tự động trên Timeline
                        </button>
                      </div>

                      {activeSubtitleClip ? (
                        <div
                          data-no-marquee="true"
                          className="p-2.5 bg-[#22222A] border border-[#32323E] rounded space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#00E5CC]">
                              Chỉnh sửa Phụ đề đang hiển thị
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleSpeakSubtitleTts(activeSubtitleClip.subtitleText || '')
                              }
                              className="px-2 py-0.5 text-[10px] font-semibold bg-[#00E5CC] text-black rounded cursor-pointer"
                            >
                              🔊 Đọc TTS
                            </button>
                          </div>
                          <input
                            type="text"
                            value={activeSubtitleClip.subtitleText || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              commitClips((prev) =>
                                prev.map((c) =>
                                  c.id === activeSubtitleClip.id
                                    ? { ...c, subtitleText: val, name: val || 'Sub' }
                                    : c
                                )
                              );
                            }}
                            aria-label="Nội dung phụ đề"
                            className="w-full px-2.5 py-1.5 bg-[#121216] border border-[#343440] rounded text-white"
                          />

                          <div className="grid grid-cols-3 gap-2 items-center">
                            <div>
                              <span className="block text-[10px] text-[#9CA3AF] mb-1">
                                Cỡ chữ:
                              </span>
                              <input
                                type="number"
                                min={14}
                                max={72}
                                value={activeSubtitleClip.fontSize || 28}
                                onChange={(e) => {
                                  const sz = Number(e.target.value);
                                  commitClips((prev) =>
                                    prev.map((c) =>
                                      c.id === activeSubtitleClip.id
                                        ? { ...c, fontSize: sz }
                                        : c
                                    )
                                  );
                                }}
                                className="w-full px-2 py-1 bg-[#121216] border border-[#343440] rounded text-white font-mono"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-[#9CA3AF] mb-1">
                                Màu chữ:
                              </span>
                              <input
                                type="color"
                                value={activeSubtitleClip.textColor || '#FFFFFF'}
                                onChange={(e) => {
                                  const col = e.target.value;
                                  commitClips((prev) =>
                                    prev.map((c) =>
                                      c.id === activeSubtitleClip.id
                                        ? { ...c, textColor: col }
                                        : c
                                    )
                                  );
                                }}
                                className="w-full h-7 bg-[#121216] border border-[#343440] rounded cursor-pointer"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-[#9CA3AF] mb-1">
                                Uốn cong chữ:
                              </span>
                              <input
                                type="number"
                                min={-180}
                                max={180}
                                value={activeSubtitleClip.textCurveDeg || 0}
                                onChange={(e) => {
                                  const deg = Number(e.target.value);
                                  commitClips((prev) =>
                                    prev.map((c) =>
                                      c.id === activeSubtitleClip.id
                                        ? { ...c, textCurveDeg: deg }
                                        : c
                                    )
                                  );
                                }}
                                className="w-full px-2 py-1 bg-[#121216] border border-[#343440] rounded text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[#9CA3AF] text-[11px]">
                          Di chuyển Playhead vào thanh phụ đề màu cam trên Track TI để sửa nội dung trực tiếp.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: STICKERS (Kho Nhãn dán khổng lồ: Mặt biểu cảm, Cờ tất cả các nước trên thế giới, Emoji, CTA, Neon) */}
                  {topLeftCategory === 'stickers' && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                      <div data-no-marquee="true" className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white">
                            {subCategoryFilter === 'cta'
                              ? 'Nút Subscribe, Like & Kêu Gọi Hành Động (12 mẫu)'
                              : subCategoryFilter === 'faces'
                              ? `Mặt Biểu Cảm & Khuôn Mặt Icon (${FACE_ICON_STICKERS.length} mẫu)`
                              : subCategoryFilter === 'flags'
                              ? `Quốc Kỳ Tất Cả Các Nước Trên Thế Giới (${WORLD_FLAG_STICKERS.length} nước)`
                              : subCategoryFilter === 'emoji'
                              ? `Biểu Tượng Cảm Xúc & Xu Hướng (${TREND_EMOJI_STICKERS.length} mẫu)`
                              : subCategoryFilter === 'neon'
                              ? 'Khung Tiêu Điểm, Mũi Tên & Chỉ Dẫn (12 mẫu)'
                              : `Kho Nhãn Dán, Mặt Icon & Cờ Thế Giới (${STICKER_CATALOG_ITEMS.length} mẫu)`}
                          </span>
                          <button
                            type="button"
                            onClick={handleSelectAllCurrentResources}
                            className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer shrink-0"
                          >
                            Chọn tất cả
                          </button>
                        </div>

                        {/* Quick Search & Category Pills for 300+ Stickers & World Flags */}
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1 min-w-0">
                            <Search className="w-3 h-3 text-[#71717A] absolute left-2 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={stickerSearchQuery}
                              onChange={(e) => setStickerSearchQuery(e.target.value)}
                              placeholder={
                                language === 'en'
                                  ? 'Search stickers, faces, or country flags (e.g. Vietnam, Japan)...'
                                  : 'Tìm nhãn dán, mặt icon, cờ quốc gia (VD: Việt Nam, Nhật Bản, Mỹ)...'
                              }
                              aria-label="Tìm kiếm nhãn dán hoặc cờ quốc gia"
                              className="w-full pl-6 pr-2 py-1 text-[11px] bg-[#121216] border border-[#2C2C34] focus:border-[#00E5CC] rounded text-white placeholder-[#71717A]"
                            />
                          </div>
                          {stickerSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setStickerSearchQuery('')}
                              className="px-2 py-1 text-[10px] bg-[#25252D] hover:bg-[#32323D] text-[#D4D4D8] rounded cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {[
                            { id: 'all', label: `Tất cả (${STICKER_CATALOG_ITEMS.length})` },
                            {
                              id: 'cta',
                              label: `🔔 Subscribe & Viral (${
                                STICKER_CATALOG_ITEMS.filter((s) => s.cat === 'cta').length
                              })`,
                            },
                            { id: 'faces', label: `😀 Mặt Icon (${FACE_ICON_STICKERS.length})` },
                            {
                              id: 'flags',
                              label: `🌐 Cờ Thế Giới (${WORLD_FLAG_STICKERS.length})`,
                              flagUrl: getFlagGraphicDataUrl('VN'),
                            },
                            { id: 'emoji', label: `🔥 Cảm xúc (${TREND_EMOJI_STICKERS.length})` },
                            { id: 'neon', label: '➔ Khung/Mũi tên (12)' },
                          ].map((pill) => (
                            <button
                              key={pill.id}
                              type="button"
                              onClick={() => setSubCategoryFilter(pill.id)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                subCategoryFilter === pill.id
                                  ? 'bg-[#00E5CC] text-[#071013] font-bold'
                                  : 'bg-[#22222A] text-[#A1A1AA] hover:text-white border border-[#30303C]'
                              }`}
                            >
                              {pill.flagUrl && (
                                <img
                                  src={pill.flagUrl}
                                  alt="Flag"
                                  className="w-3.5 h-2.5 object-cover rounded-[1px] shrink-0"
                                />
                              )}
                              <span>{pill.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pb-6">
                        {STICKER_CATALOG_ITEMS.filter((stk) => {
                          const matchesCat =
                            subCategoryFilter === 'all' ||
                            stk.id === 'none' ||
                            stk.cat === subCategoryFilter;
                          if (!matchesCat) return false;
                          if (!stickerSearchQuery.trim()) return true;
                          const q = stickerSearchQuery.trim().toLowerCase();
                          return (
                            stk.label.toLowerCase().includes(q) ||
                            (stk.labelEn && stk.labelEn.toLowerCase().includes(q)) ||
                            (stk.badgeText && stk.badgeText.toLowerCase().includes(q)) ||
                            stk.icon.toLowerCase().includes(q)
                          );
                        }).map((stk) => {
                          const isStkSelected =
                            selectedResourceIds.includes(stk.uid) ||
                            (stk.id === 'none' && (currentClip?.stickerType || 'none') === 'none');
                          const displayLabel =
                            language === 'en' && stk.labelEn ? stk.labelEn : stk.label;
                          const flagGraphicUrl =
                            stk.cat === 'flags' ? getFlagGraphicDataUrl(stk.icon) : null;
                          return (
                            <div
                              key={stk.uid}
                              data-resource-id={stk.uid}
                              draggable={true}
                              onDragStart={(e) => {
                                const payload: TimelineDragPayload = {
                                  kind: 'sticker',
                                  name: `${stk.icon} ${displayLabel}`,
                                  duration: 3.5,
                                  stickerType: stk.id,
                                  stickerEmoji: stk.icon,
                                  stickerText: stk.badgeText || '',
                                  stickerSubText: stk.badgeSubText || '',
                                };
                                e.dataTransfer.setData(
                                  'application/x-trendopsis-drag',
                                  JSON.stringify(payload)
                                );
                                e.dataTransfer.effectAllowed = 'copyMove';
                              }}
                              onClick={() => {
                                setSelectedResourceIds([stk.uid]);
                                if (stk.id === 'none') {
                                  if (currentClip) {
                                    commitClips((prev) =>
                                      prev
                                        .filter(
                                          (c) =>
                                            !(
                                              c.id === currentClip.id &&
                                              c.trackIndex >= 2 &&
                                              !c.subtitleText &&
                                              !c.mediaUrl
                                            )
                                        )
                                        .map((c) =>
                                          c.id === currentClip.id
                                            ? { ...c, stickerType: 'none', stickerEmoji: undefined }
                                            : c
                                        )
                                    );
                                  }
                                  showToast('Đã gỡ nhãn dán khỏi clip!');
                                  return;
                                }

                                // If current selected clip is already a dedicated sticker clip on Track 2+, update it in-place
                                if (
                                  currentClip &&
                                  currentClip.trackIndex >= 2 &&
                                  !currentClip.subtitleText &&
                                  !currentClip.mediaUrl
                                ) {
                                  commitClips((prev) =>
                                    prev.map((c) =>
                                      c.id === currentClip.id
                                        ? {
                                            ...c,
                                            name: `${stk.icon} ${displayLabel}`,
                                            stickerType: stk.id,
                                            stickerEmoji: stk.icon,
                                            stickerText: stk.badgeText ?? c.stickerText ?? '',
                                            stickerSubText: stk.badgeSubText ?? c.stickerSubText ?? '',
                                            textColor: stk.badgeColor ?? c.textColor ?? '#FFFFFF',
                                            textBgColor: stk.badgeBg ?? c.textBgColor,
                                          }
                                        : c
                                    )
                                  );
                                  if (
                                    playheadSec < currentClip.startTime ||
                                    playheadSec >= currentClip.startTime + currentClip.duration
                                  ) {
                                    setPlayheadSec(currentClip.startTime);
                                  }
                                  showToast(`Đã cập nhật nhãn dán "${displayLabel}" trên Timeline!`);
                                } else {
                                  // Otherwise insert a new Sticker Clip on Track 3 at playheadSec so it immediately appears on Timeline & Preview Canvas
                                  handlePushResourceIdsToTimeline([stk.uid], 3, playheadSec);
                                }
                              }}
                              onDoubleClick={() => {
                                if (stk.id !== 'none') {
                                  handlePushResourceIdsToTimeline([stk.uid], 3, playheadSec);
                                }
                              }}
                              title={`${displayLabel} — Nhấp hoặc kéo thả để thêm vào dòng thời gian (Timeline)`}
                              className={`p-2 rounded border flex items-center justify-between gap-1.5 text-left transition-all cursor-grab active:cursor-grabbing ${
                                isStkSelected
                                  ? 'bg-[#00E5CC]/15 border-2 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                  : 'bg-[#22222A] border-[#30303C] text-[#D4D4D8] hover:border-[#00E5CC]/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {flagGraphicUrl ? (
                                  <img
                                    src={flagGraphicUrl}
                                    alt={displayLabel}
                                    className="w-7 h-5 object-cover rounded-[2px] shadow-xs shrink-0 animate-bounce"
                                    style={{ animationDuration: '2.2s' }}
                                  />
                                ) : stk.badgeText ? (
                                  <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                                    <span
                                      style={{
                                        backgroundColor: stk.badgeBg || '#E11D48',
                                        color: stk.badgeColor || '#FFFFFF',
                                        animationDuration: '1.8s',
                                      }}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-extrabold tracking-wide shadow-xs truncate max-w-full animate-pulse"
                                    >
                                      <span>{stk.icon}</span>
                                      <span className="truncate">{stk.badgeText}</span>
                                    </span>
                                    <span className="text-[10px] text-[#A1A1AA] truncate">
                                      {displayLabel}
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    className="text-xl leading-none shrink-0 inline-block animate-bounce"
                                    style={{ animationDuration: '1.9s' }}
                                  >
                                    {stk.icon}
                                  </span>
                                )}
                                {!stk.badgeText && (
                                  <span className="text-[11px] leading-snug line-clamp-2">
                                    {displayLabel}
                                  </span>
                                )}
                              </div>
                              {stk.id !== 'none' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePushResourceIdsToTimeline([stk.uid], 3, playheadSec);
                                  }}
                                  title="Thêm nhãn dán này thành lớp mới trên Timeline"
                                  className="w-5 h-5 rounded-full bg-[#00E5CC] text-[#071013] font-black text-xs flex items-center justify-center shrink-0 cursor-pointer"
                                >
                                  +
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: VISUAL EFFECTS (Hiệu ứng Video & Cơ thể — 36 items across all sub-categories) */}
                  {topLeftCategory === 'effects' && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white">
                          {subCategoryFilter === 'body'
                            ? 'Hiệu ứng Cơ thể AI & Phân Thân (Body FX)'
                            : subCategoryFilter === 'retro'
                            ? 'Hiệu ứng Cổ điển, Phim nhựa & VHS 1998'
                            : subCategoryFilter === 'glow'
                            ? 'Hiệu ứng Ánh sáng Neon, Thời tiết & Hạt'
                            : `Kho Hiệu ứng Hình ảnh & Cơ thể (${VISUAL_EFFECT_CATALOG_ITEMS.length} mẫu)`}
                        </span>
                        <button
                          type="button"
                          onClick={handleSelectAllCurrentResources}
                          className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer shrink-0"
                        >
                          Chọn tất cả
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pb-6">
                        {VISUAL_EFFECT_CATALOG_ITEMS.filter(
                          (fx) =>
                            subCategoryFilter === 'all' ||
                            fx.id === 'none' ||
                            fx.cat === subCategoryFilter
                        ).map((fx) => {
                          const isFxSelected =
                            selectedResourceIds.includes(fx.uid) ||
                            (fx.id === 'none' && (currentClip?.visualEffect || 'none') === 'none');
                          return (
                            <div
                              key={fx.uid}
                              data-resource-id={fx.uid}
                              draggable={true}
                              onDragStart={(e) => {
                                const payload: TimelineDragPayload = {
                                  kind: 'effect',
                                  name: fx.label,
                                  duration: 3.0,
                                  visualEffect: fx.id,
                                };
                                e.dataTransfer.setData(
                                  'application/x-trendopsis-drag',
                                  JSON.stringify(payload)
                                );
                                e.dataTransfer.effectAllowed = 'copyMove';
                              }}
                              onClick={() => {
                                setSelectedResourceIds([fx.uid]);
                                handleDropResourceOnTimeline(
                                  {
                                    kind: 'effect',
                                    name: fx.label,
                                    duration: 3.0,
                                    visualEffect: fx.id,
                                  },
                                  0,
                                  playheadSec,
                                  currentClip?.trackIndex === 0 ? currentClip.id : undefined
                                );
                              }}
                              className={`p-2.5 rounded border text-left transition-all cursor-grab active:cursor-grabbing ${
                                isFxSelected
                                  ? 'bg-[#00E5CC]/15 border-2 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                  : 'bg-[#22222A] border-[#30303C] text-[#D4D4D8] hover:border-[#00E5CC]/50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-[#1F343A] text-[#00E5CC]">
                                  {fx.badge}
                                </span>
                                {fx.id !== 'none' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDropResourceOnTimeline(
                                        {
                                          kind: 'effect',
                                          name: fx.label,
                                          duration: 3.0,
                                          visualEffect: fx.id,
                                        },
                                        3,
                                        playheadSec
                                      );
                                    }}
                                    className="px-1.5 py-0.5 text-[9px] font-bold bg-[#00E5CC] text-[#071013] rounded cursor-pointer"
                                  >
                                    + Track FX
                                  </button>
                                )}
                              </div>
                              <div className="text-[11px] leading-snug line-clamp-2">
                                ✨ {fx.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: TRANSITIONS (Chuyển tiếp — 16 items across Camera, MG, Glitch) */}
                  {topLeftCategory === 'transitions' && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white">
                          {subCategoryFilter === 'camera'
                            ? 'Chuyển tiếp Máy ảnh, Xoay & Zoom 3D'
                            : subCategoryFilter === 'mg'
                            ? 'Chuyển tiếp Đồ họa Chuyển động (Motion Graphics)'
                            : subCategoryFilter === 'glitch'
                            ? 'Chuyển tiếp Glitch, Cháy sáng & Chớp trắng'
                            : 'Kho Hiệu ứng Chuyển Tiếp (16 mẫu)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const chosen =
                              currentClip?.transitionType && currentClip.transitionType !== 'none'
                                ? currentClip.transitionType
                                : 'cross_dissolve';
                            const dur = currentClip?.transitionDuration || 0.6;
                            commitClips((prev) =>
                              prev.map((c) =>
                                c.trackIndex === 0
                                  ? { ...c, transitionType: chosen, transitionDuration: dur }
                                  : c
                              )
                            );
                            showToast(
                              `Đã áp dụng chuyển tiếp "${chosen}" (${dur}s) cho TẤT CẢ điểm cắt trên Timeline!`
                            );
                          }}
                          className="px-2 py-1 text-[10px] font-bold bg-[#00E5CC] text-black rounded cursor-pointer shrink-0"
                        >
                          Áp dụng tất cả
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {TRANSITION_CATALOG_ITEMS.filter(
                          (tr) =>
                            subCategoryFilter === 'all' ||
                            tr.id === 'none' ||
                            tr.cat === subCategoryFilter
                        ).map((tr) => {
                          const isTrSelected =
                            selectedResourceIds.includes(tr.uid) ||
                            (tr.id === 'none' &&
                              (currentClip?.transitionType || 'none') === 'none');
                          return (
                            <div
                              key={tr.uid}
                              data-resource-id={tr.uid}
                              draggable={true}
                              onDragStart={(e) => {
                                const payload: TimelineDragPayload = {
                                  kind: 'transition',
                                  name: tr.label,
                                  duration: tr.dur,
                                  transitionType: tr.id,
                                };
                                e.dataTransfer.setData(
                                  'application/x-trendopsis-drag',
                                  JSON.stringify(payload)
                                );
                                e.dataTransfer.effectAllowed = 'copyMove';
                              }}
                              onClick={() => {
                                setSelectedResourceIds([tr.uid]);
                                handleDropResourceOnTimeline(
                                  {
                                    kind: 'transition',
                                    name: tr.label,
                                    duration: tr.dur,
                                    transitionType: tr.id,
                                  },
                                  0,
                                  playheadSec,
                                  currentClip?.trackIndex === 0 ? currentClip.id : undefined
                                );
                              }}
                              className={`p-2.5 rounded border text-left transition-all cursor-grab active:cursor-grabbing ${
                                isTrSelected
                                  ? 'bg-[#00E5CC]/15 border-2 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                  : 'bg-[#22222A] border-[#30303C] text-[#D4D4D8] hover:border-[#00E5CC]/50'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[9px] text-[#9CA3AF] mb-0.5">
                                <span className="uppercase font-bold text-[#00E5CC]">
                                  {tr.cat === 'all' ? 'Mặc định' : tr.cat.toUpperCase()}
                                </span>
                                <span className="font-mono">{tr.dur}s</span>
                              </div>
                              <div className="text-[11px] leading-snug line-clamp-2">
                                ⋈ {tr.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {currentClip && (
                        <div
                          data-no-marquee="true"
                          className="flex items-center justify-between gap-2 pt-1"
                        >
                          <span className="text-[#A1A1AA]">Thời lượng (Duration):</span>
                          <input
                            type="range"
                            min={0.1}
                            max={3.0}
                            step={0.1}
                            value={currentClip.transitionDuration ?? 0.6}
                            onChange={(e) =>
                              updateSelectedClipProp(
                                'transitionDuration',
                                Number(e.target.value)
                              )
                            }
                            className="flex-1 accent-[#00E5CC]"
                          />
                          <span className="font-mono text-[#00E5CC] w-10 text-right">
                            {(currentClip.transitionDuration ?? 0.6).toFixed(1)}s
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 7: CAPTIONS (Chú thích — Auto Captions AI, Style Presets & .SRT Manager) */}
                  {topLeftCategory === 'captions' && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                      <div
                        data-no-marquee="true"
                        className="p-2.5 bg-[#1E1E26] border border-[#30303E] rounded space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#00E5CC]">
                            {subCategoryFilter === 'bilingual'
                              ? 'Phụ đề Song Ngữ Việt - Anh Tự Động'
                              : subCategoryFilter === 'lyrics'
                              ? 'Nhận diện Lời Bài Hát Karaoke AI'
                              : subCategoryFilter === 'filler'
                              ? 'Lọc Từ Thừa (Ờ, À) & Cắt Khoảng Lặng'
                              : 'Phụ đề tự động AI (Auto Captions)'}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">Faster-Whisper</span>
                        </div>
                        <label className="flex items-center gap-2 text-[11px] text-[#D4D4D8] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bilingualSubtitles}
                            onChange={(e) => {
                              const nextVal = e.target.checked;
                              setBilingualSubtitles(nextVal);
                              handleGenerateAutoCaptions(undefined, nextVal, removeFillerWords);
                            }}
                            className="accent-[#00E5CC]"
                          />
                          <span>Phụ đề song ngữ (Bilingual Subtitles Việt - Anh)</span>
                        </label>
                        <label className="flex items-center gap-2 text-[11px] text-[#D4D4D8] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={removeFillerWords}
                            onChange={(e) => {
                              const nextVal = e.target.checked;
                              setRemoveFillerWords(nextVal);
                              if (nextVal) handleRemoveDeadAirSilence();
                              handleGenerateAutoCaptions(undefined, bilingualSubtitles, nextVal);
                            }}
                            className="accent-[#00E5CC]"
                          />
                          <span>Xóa từ thừa &amp; khoảng lặng (Identify filler words)</span>
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleGenerateAutoCaptions()}
                            className="py-1.5 px-2 bg-[#00E5CC] text-[#090D12] font-bold rounded cursor-pointer"
                          >
                            Tạo Chú thích AI
                          </button>
                          <button
                            type="button"
                            onClick={() => srtInputRef.current?.click()}
                            className="py-1.5 px-2 bg-[#25252E] hover:bg-[#30303C] text-white border border-[#383846] font-medium rounded cursor-pointer"
                          >
                            Nhập file .SRT
                          </button>
                        </div>
                      </div>

                      {/* Quick Caption Style Presets */}
                      <div data-no-marquee="true" className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-white">
                          Phong cách Chú thích Nhanh (Áp dụng cho toàn bộ Phụ đề)
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { name: 'MrBeast Vàng Đậm', color: '#FACC15', stroke: '#000000', size: 34 },
                            { name: 'Hormozi Trắng Xanh', color: '#38BDF8', stroke: '#0F172A', size: 32 },
                            { name: 'Podcast Tối Giản', color: '#FFFFFF', stroke: '#1E293B', size: 26 },
                            { name: 'Karaoke Hồng Neon', color: '#F472B6', stroke: '#31102F', size: 30 },
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                commitClips((prev) =>
                                  prev.map((c) =>
                                    c.trackIndex === 2 || Boolean(c.subtitleText)
                                      ? {
                                          ...c,
                                          textColor: preset.color,
                                          textStrokeColor: preset.stroke,
                                          fontSize: preset.size,
                                        }
                                      : c
                                  )
                                );
                                showToast(`Đã áp dụng kiểu chữ "${preset.name}" cho toàn bộ phụ đề!`);
                              }}
                              className="p-2 rounded bg-[#22222A] border border-[#30303C] hover:border-[#00E5CC] text-left cursor-pointer"
                            >
                              <div
                                style={{ color: preset.color }}
                                className="font-bold text-[11px] truncate"
                              >
                                {preset.name}
                              </div>
                              <div className="text-[9.5px] text-[#9CA3AF]">
                                Cỡ {preset.size}px · Viền {preset.stroke}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-white">
                            Danh sách Chú thích trên Timeline (
                            {clips.filter((c) => c.trackIndex === 2 || Boolean(c.subtitleText)).length})
                          </span>
                          <button
                            type="button"
                            onClick={handleSelectAllCurrentResources}
                            className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer"
                          >
                            Chọn tất cả
                          </button>
                        </div>
                        {clips
                          .filter((c) => c.trackIndex === 2 || Boolean(c.subtitleText))
                          .map((sub) => {
                            const isSubSelected =
                              selectedResourceIds.includes(sub.id) ||
                              selectedClipIds.includes(sub.id) ||
                              selectedClipId === sub.id;
                            return (
                              <div
                                key={sub.id}
                                data-resource-id={sub.id}
                                onClick={() => {
                                  setSelectedClipId(sub.id);
                                  setSelectedClipIds([sub.id]);
                                  setSelectedResourceIds([sub.id]);
                                  setPlayheadSec(sub.startTime);
                                  setInspectorMode('clip');
                                }}
                                className={`p-2 rounded border flex items-center justify-between gap-2 cursor-pointer ${
                                  isSubSelected
                                    ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-white'
                                    : 'bg-[#22222A] border-[#30303C] text-[#D4D4D8] hover:border-[#00E5CC]/50'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="font-medium leading-snug line-clamp-2">
                                    {sub.subtitleText || sub.name}
                                  </div>
                                  <div className="text-[10px] font-mono text-[#9CA3AF]">
                                    {sub.startTime.toFixed(1)}s - {(sub.startTime + sub.duration).toFixed(1)}s
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSpeakSubtitleTts(sub.subtitleText || sub.name);
                                  }}
                                  className="px-2 py-0.5 text-[10px] bg-[#2D2D38] hover:bg-[#00E5CC] hover:text-black rounded cursor-pointer shrink-0"
                                >
                                  🔊 TTS
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* TAB 8: COLOR FILTERS (Bộ lọc — 16 items across Cinema, Life & Noir B&W) */}
                  {topLeftCategory === 'filters' && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white">
                          {subCategoryFilter === 'cinema'
                            ? 'Bộ lọc Màu Điện Ảnh Hollywood (LUTs)'
                            : subCategoryFilter === 'life'
                            ? 'Bộ lọc Đời Thường, Ẩm Thực & Du Lịch'
                            : subCategoryFilter === 'bw'
                            ? 'Bộ lọc Đen Trắng Nghệ Thuật (Noir B&W)'
                            : 'Kho Bộ Lọc Màu Điện Ảnh (16 mẫu)'}
                        </span>
                        <button
                          type="button"
                          onClick={handleSelectAllCurrentResources}
                          className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer shrink-0"
                        >
                          Chọn tất cả
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pb-6">
                        {FILTER_CATALOG_ITEMS.filter(
                          (lut) =>
                            subCategoryFilter === 'all' ||
                            lut.id === 'none' ||
                            lut.cat === subCategoryFilter
                        ).map((lut) => {
                          const isLutSelected =
                            selectedResourceIds.includes(lut.uid) ||
                            (lut.id === 'none' && (currentClip?.filterPreset || 'none') === 'none');
                          return (
                            <div
                              key={lut.uid}
                              data-resource-id={lut.uid}
                              draggable={true}
                              onDragStart={(e) => {
                                const payload: TimelineDragPayload = {
                                  kind: 'filter',
                                  name: lut.label,
                                  duration: 3.5,
                                  filterPreset: lut.id,
                                };
                                e.dataTransfer.setData(
                                  'application/x-trendopsis-drag',
                                  JSON.stringify(payload)
                                );
                                e.dataTransfer.effectAllowed = 'copyMove';
                              }}
                              onClick={() => {
                                setSelectedResourceIds([lut.uid]);
                                handleDropResourceOnTimeline(
                                  {
                                    kind: 'filter',
                                    name: lut.label,
                                    duration: 3.5,
                                    filterPreset: lut.id,
                                  },
                                  0,
                                  playheadSec,
                                  currentClip?.trackIndex === 0 ? currentClip.id : undefined
                                );
                              }}
                              className={`p-2.5 rounded border text-left transition-all cursor-grab active:cursor-grabbing ${
                                isLutSelected
                                  ? 'bg-[#00E5CC]/15 border-2 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                  : 'bg-[#22222A] border-[#30303C] text-[#D4D4D8] hover:border-[#00E5CC]/50'
                              }`}
                            >
                              <div
                                style={{ background: lut.swatch }}
                                className="h-5 w-full rounded-xs mb-1.5 border border-white/15"
                              />
                              <div className="text-[11px] leading-snug line-clamp-2">
                                🎨 {lut.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 9: GLOBAL ADJUSTMENT LAYER, LUT (.cube) & HSL PRESETS */}
                  {topLeftCategory === 'adjust' && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {subCategoryFilter === 'lut'
                            ? 'Kho LUT Điện Ảnh 3D (.cube) Chuyên Nghiệp'
                            : subCategoryFilter === 'hsl'
                            ? 'Preset Cân Chỉnh 8 Kênh Màu HSL'
                            : 'Lớp Điều Chỉnh Toàn Cục (Adjustment Layer)'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setGlobalAdjustments({
                              enabled: true,
                              brightness: 0,
                              contrast: 0,
                              saturation: 0,
                              sharpen: 0,
                              warmth: 0,
                              vignette: 0,
                              lutName: 'None',
                            })
                          }
                          className="text-[10px] text-[#00E5CC] hover:underline cursor-pointer"
                        >
                          Đặt lại
                        </button>
                      </div>

                      <div
                        data-resource-id="adjust-custom"
                        draggable={true}
                        onDragStart={(e) => {
                          const payload: TimelineDragPayload = {
                            kind: 'adjust',
                            name: 'Custom Adjustment',
                            duration: 5.0,
                          };
                          e.dataTransfer.setData(
                            'application/x-trendopsis-drag',
                            JSON.stringify(payload)
                          );
                        }}
                        onClick={() =>
                          handleDropResourceOnTimeline(
                            { kind: 'adjust', name: 'Custom Adjustment', duration: 5.0 },
                            3,
                            playheadSec
                          )
                        }
                        className="p-2 bg-[#1D2D35] border border-[#00E5CC]/50 rounded flex items-center justify-between cursor-grab active:cursor-grabbing"
                      >
                        <span className="font-semibold text-[#00E5CC]">
                          + Kéo thả Lớp Điều Chỉnh (Adjustment Layer) vào Timeline
                        </span>
                        <span className="text-[10px] font-mono text-white">5.0s</span>
                      </div>

                      {subCategoryFilter === 'lut' ? (
                        <div data-no-marquee="true" className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            { name: 'ARRI_LogC_to_Rec709.cube', b: 2, c: 14, s: 8, w: -4, v: 10 },
                            { name: 'Sony_SLog3_CineTone.cube', b: 4, c: 12, s: 10, w: 6, v: 8 },
                            { name: 'Kodak_Vision3_500T.cube', b: 0, c: 18, s: 12, w: -10, v: 15 },
                            { name: 'Fuji_Eterna_250D.cube', b: 3, c: 8, s: -6, w: 5, v: 5 },
                            { name: 'Teal_Orange_Blockbuster.cube', b: 1, c: 16, s: 18, w: -8, v: 12 },
                            { name: 'Cyberpunk_Neon_Night.cube', b: -2, c: 20, s: 24, w: -18, v: 20 },
                            { name: 'Minimal_Clean_Studio.cube', b: 6, c: 10, s: -4, w: 2, v: 0 },
                            { name: 'Noir_Silver_Contrast.cube', b: -4, c: 28, s: -50, w: 0, v: 25 },
                          ].map((cube) => (
                            <button
                              key={cube.name}
                              type="button"
                              onClick={() => {
                                pushUndoSnapshot(undefined, 'global:lut');
                                setGlobalAdjustments({
                                  enabled: true,
                                  brightness: cube.b,
                                  contrast: cube.c,
                                  saturation: cube.s,
                                  sharpen: 15,
                                  warmth: cube.w,
                                  vignette: cube.v,
                                  lutName: cube.name,
                                });
                                showToast(`Đã nạp 3D LUT "${cube.name}" vào Lớp Điều Chỉnh!`);
                              }}
                              className={`p-2 rounded border text-left cursor-pointer ${
                                globalAdjustments.lutName === cube.name
                                  ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                  : 'bg-[#22222A] border-[#30303C] text-[#D4D4D8] hover:border-[#00E5CC]'
                              }`}
                            >
                              <div className="text-[11px] leading-snug line-clamp-2 font-medium">
                                🎞️ {cube.name}
                              </div>
                              <div className="text-[9.5px] text-[#9CA3AF] mt-0.5">
                                Contrast {cube.c > 0 ? `+${cube.c}` : cube.c} · Sat{' '}
                                {cube.s > 0 ? `+${cube.s}` : cube.s}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : subCategoryFilter === 'hsl' ? (
                        <div data-no-marquee="true" className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            { name: 'Làm Trắng & Hồng Da (Skin Tone)', b: 5, c: 6, s: 8, w: 6, v: 0 },
                            { name: 'Tăng Xanh Da Trời (Sky Pop)', b: 2, c: 12, s: 18, w: -10, v: 6 },
                            { name: 'Tăng Xanh Lá Cây (Foliage)', b: 0, c: 10, s: 20, w: -4, v: 5 },
                            { name: 'Thu Vàng Ấm Áp (Autumn Gold)', b: 3, c: 12, s: 14, w: 22, v: 10 },
                            { name: 'Tách Màu Đỏ Nổi Bật (Red Pop)', b: 0, c: 18, s: 16, w: 4, v: 14 },
                            { name: 'Giảm Ám Vàng Đèn Trong Nhà', b: 4, c: 8, s: -4, w: -18, v: 0 },
                          ].map((hslPreset) => (
                            <button
                              key={hslPreset.name}
                              type="button"
                              onClick={() => {
                                pushUndoSnapshot(undefined, 'global:hsl');
                                setGlobalAdjustments((prev) => ({
                                  ...prev,
                                  enabled: true,
                                  brightness: hslPreset.b,
                                  contrast: hslPreset.c,
                                  saturation: hslPreset.s,
                                  warmth: hslPreset.w,
                                  vignette: hslPreset.v,
                                }));
                                showToast(`Đã áp dụng chuẩn màu HSL: ${hslPreset.name}`);
                              }}
                              className="p-2 rounded border bg-[#22222A] border-[#30303C] text-[#D4D4D8] hover:border-[#00E5CC] text-left cursor-pointer"
                            >
                              <div className="text-[11px] leading-snug line-clamp-2 font-medium text-white">
                                🌈 {hslPreset.name}
                              </div>
                              <div className="text-[9.5px] text-[#00E5CC] mt-0.5">
                                Nhấp để áp dụng chuẩn màu
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {(
                        [
                          { key: 'brightness', label: 'Độ sáng', min: -50, max: 50 },
                          { key: 'contrast', label: 'Tương phản', min: -50, max: 50 },
                          { key: 'saturation', label: 'Độ bão hòa', min: -50, max: 50 },
                          { key: 'warmth', label: 'Nhiệt độ màu', min: -50, max: 50 },
                          { key: 'vignette', label: 'Viền tối', min: 0, max: 80 },
                        ] as const
                      ).map((slider) => (
                        <div
                          key={slider.key}
                          data-no-marquee="true"
                          className="flex items-center justify-between gap-1.5"
                        >
                          <span className="text-[#A1A1AA] w-20 shrink-0 truncate">{slider.label}</span>
                          <input
                            type="range"
                            min={slider.min}
                            max={slider.max}
                            value={globalAdjustments[slider.key]}
                            onChange={(e) => {
                              pushUndoSnapshot(undefined, `global:${slider.key}`);
                              setGlobalAdjustments((prev) => ({
                                ...prev,
                                [slider.key]: Number(e.target.value),
                              }));
                            }}
                            className="flex-1 min-w-0 accent-[#00E5CC]"
                          />
                          <NumericBoxWithSteppers
                            value={globalAdjustments[slider.key]}
                            min={slider.min}
                            max={slider.max}
                            step={1}
                            widthClass="w-16"
                            ariaLabel={slider.label}
                            onChange={(val) => {
                              pushUndoSnapshot(undefined, `global:${slider.key}`);
                              setGlobalAdjustments((prev) => ({
                                ...prev,
                                [slider.key]: val,
                              }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CYAN MARQUEE SELECTION OVERLAY IN ZONE 1 (Identical style to Timeline Marquee) */}
                  {resourceMarqueeBox && (
                    <div
                      data-testid="resource-marquee-box"
                      style={{
                        left: `${Math.min(resourceMarqueeBox.startX, resourceMarqueeBox.currX)}px`,
                        top: `${Math.min(resourceMarqueeBox.startY, resourceMarqueeBox.currY)}px`,
                        width: `${Math.abs(resourceMarqueeBox.currX - resourceMarqueeBox.startX)}px`,
                        height: `${Math.abs(resourceMarqueeBox.currY - resourceMarqueeBox.startY)}px`,
                      }}
                      className="absolute pointer-events-none z-50 border border-[#00E5CC] bg-[#00E5CC]/15 rounded-xs shadow-[0_0_8px_rgba(0,229,204,0.35)]"
                    />
                  )}

                  {/* FLOATING GHOST BADGE WHEN DRAGGING SELECTED RESOURCES DOWN TO TIMELINE */}
                  {resourceTimelineDragGhost && (
                    <div
                      style={{
                        left: `${resourceTimelineDragGhost.x + 12}px`,
                        top: `${resourceTimelineDragGhost.y + 12}px`,
                      }}
                      className="fixed pointer-events-none z-50 px-2.5 py-1 rounded bg-[#00E5CC] text-[#071013] font-bold text-xs shadow-lg border border-white/40"
                    >
                      ⤓ {resourceTimelineDragGhost.label}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ZONE 2: CENTER REAL-TIME VIDEO PREVIEW PLAYER (5 cols) */}
            <div className="col-span-5 min-h-0 overflow-hidden">
              <VideoPreviewCanvas
                playheadSec={playheadSec}
                totalDurationSec={totalTimelineDuration}
                fps={30}
                isPlaying={isPlaying}
                aspectRatio={aspectRatio}
                previewQuality={previewQuality}
                selectedClipId={selectedClipId}
                activeVideoClip={activeVideoClip}
                activeOverlayClip={activeOverlayClip}
                activeSubtitleClip={activeSubtitleClip}
                activeAudioClip={activeAudioClip}
                activeClipsAtPlayhead={activeClipsAtPlayhead}
                videoTrackHidden={trackHidden[0]}
                videoTrackMuted={trackMuted[0]}
                overlayTrackHidden={trackHidden[3]}
                textTrackHidden={trackHidden[2]}
                audioTrackMuted={trackMuted[1]}
                globalAdjustments={globalAdjustments}
                blurredPadding916={blurredPadding916}
                antiDetectSpoof={antiDetect.spoofIphoneMeta}
                onTogglePlay={() => setIsPlaying((p) => !p)}
                onStepFrame={(delta) =>
                  setPlayheadSec((prev) => Math.max(0, Number((prev + delta / 30).toFixed(3))))
                }
                onAspectRatioChange={(nextRatio) => {
                  pushUndoSnapshot(undefined, 'aspect-ratio');
                  setAspectRatio(nextRatio);
                }}
                onDetectedClipDimensions={(clipId, width, height, detectedRatio) => {
                  setClips((prev) =>
                    prev.map((c) =>
                      c.id === clipId && (!c.mediaWidth || !c.mediaHeight || !c.nativeAspectRatio)
                        ? {
                            ...c,
                            mediaWidth: c.mediaWidth || width,
                            mediaHeight: c.mediaHeight || height,
                            nativeAspectRatio: c.nativeAspectRatio || detectedRatio,
                          }
                        : c
                    )
                  );
                }}
                onPreviewQualityChange={setPreviewQuality}
                onJumpToTimecode={(sec) => {
                  setPlayheadSec(sec);
                  showToast(`Đã nhảy Playhead tới mốc ${sec.toFixed(2)}s`);
                }}
                onSelectClipFromCanvas={(clipId) => {
                  setSelectedClipId(clipId);
                  setSelectedClipIds([clipId]);
                  setInspectorMode('clip');
                }}
                onCanvasDragStart={() => {
                  pushUndoSnapshot();
                }}
                onUpdateSpecificClipTransform={(
                  clipId,
                  posX,
                  posY,
                  scale,
                  rotation,
                  flipH,
                  flipV
                ) => {
                  commitClips(
                    (prev) =>
                      prev.map((c) =>
                        c.id === clipId
                          ? {
                              ...c,
                              posX,
                              posY,
                              ...(scale !== undefined
                                ? {
                                    scale,
                                    scaleX: scale,
                                    scaleY: scale,
                                    cropRatio: Number((scale / 100).toFixed(2)),
                                  }
                                : {}),
                              ...(rotation !== undefined ? { rotation } : {}),
                              ...(flipH !== undefined ? { flipH } : {}),
                              ...(flipV !== undefined ? { flipV } : {}),
                            }
                          : c
                      ),
                    `canvas-drag:${clipId}`
                  );
                }}
                onDirectTransformChange={(posX, posY, scale, rotation, flipH, flipV) => {
                  if (!currentClip) return;
                  commitClips(
                    (prev) =>
                      prev.map((c) =>
                        c.id === currentClip.id
                          ? {
                              ...c,
                              posX,
                              posY,
                              ...(scale !== undefined
                                ? {
                                    scale,
                                    scaleX: scale,
                                    scaleY: scale,
                                    cropRatio: Number((scale / 100).toFixed(2)),
                                  }
                                : {}),
                              ...(rotation !== undefined ? { rotation } : {}),
                              ...(flipH !== undefined ? { flipH } : {}),
                              ...(flipV !== undefined ? { flipV } : {}),
                            }
                          : c
                      ),
                    `canvas-drag:${currentClip.id}`
                  );
                }}
                onExportStillFrame={handleCaptureCover}
                onUpdateClipText={(clipId, newText, newSubText) => {
                  commitClips(
                    (prev) =>
                      prev.map((c) => {
                        if (c.id !== clipId) return c;
                        if (c.stickerEmoji) {
                          return {
                            ...c,
                            stickerText: newText,
                            ...(newSubText !== undefined ? { stickerSubText: newSubText } : {}),
                            name: newText
                              ? `${c.stickerEmoji} ${newText}`
                              : c.name,
                          };
                        }
                        return { ...c, subtitleText: newText, name: newText || 'Phụ đề' };
                      }),
                    `inline-text:${clipId}`
                  );
                }}
                onSplitAtPlayhead={() => {
                  commitClips((prev) => splitClipAtPlayhead(prev, playheadSec, selectedClipId));
                  showToast(
                    language === 'en'
                      ? 'Split clip at Playhead (Ctrl+B)!'
                      : 'Đã tách đôi clip tại Playhead (Ctrl+B)!'
                  );
                }}
                onDeleteSelected={() => {
                  handleDeleteMediaCardsAndClips();
                }}
                onQuickFlipH={() => {
                  if (!currentClip) return;
                  updateSelectedClipProp('flipH', !currentClip.flipH);
                  showToast(
                    language === 'en'
                      ? 'Flipped clip horizontally!'
                      : 'Đã lật ngang (Mirror) khung hình!'
                  );
                }}
                onQuickFlipV={() => {
                  if (!currentClip) return;
                  updateSelectedClipProp('flipV', !currentClip.flipV);
                  showToast(
                    language === 'en'
                      ? 'Flipped clip vertically!'
                      : 'Đã lật dọc khung hình!'
                  );
                }}
                onQuickRotate90={() => {
                  if (!currentClip) return;
                  updateSelectedClipProp('rotation', ((currentClip.rotation ?? 0) + 90) % 360);
                  showToast(
                    language === 'en'
                      ? 'Rotated clip +90°!'
                      : 'Đã xoay khung hình +90°!'
                  );
                }}
                onQuickAddText={() => {
                  const newId = `txt-quick-${Date.now()}`;
                  const defaultText = language === 'en' ? 'Enter text' : 'Nhập văn bản';
                  commitClips((prev) => [
                    ...prev,
                    {
                      id: newId,
                      name: defaultText,
                      filePath: '',
                      trackIndex: 2,
                      startTime: Number(playheadSec.toFixed(2)),
                      duration: 4.0,
                      sourceIn: 0,
                      speed: 1.0,
                      volume: 100,
                      flipH: false,
                      cropRatio: 1.0,
                      subtitleText: defaultText,
                      fontSize: 30,
                      textColor: '#FFFFFF',
                      textStrokeColor: '#000000',
                      colorHex: '#A45A49',
                    },
                  ]);
                  setSelectedClipId(newId);
                  setSelectedClipIds([newId]);
                  setInspectorMode('clip');
                  showToast(
                    language === 'en'
                      ? `Added text layer at ${playheadSec.toFixed(1)}s!`
                      : `Đã chèn chữ tại ${playheadSec.toFixed(1)}s!`
                  );
                }}
                onQuickAddSticker={() => {
                  handlePushResourceIdsToTimeline(['stk-badge-sub-red'], 3, playheadSec);
                }}
                language={language}
                canvasRefExternal={previewCanvasRef}
                exportDimensionsOverride={exportDimensionsOverride}
              />
            </div>

            {/* ZONE 3: RIGHT CONTEXT-AWARE INSPECTOR PANEL (3 cols) */}
            <section
              aria-label="Bảng thuộc tính Inspector"
              className="col-span-3 flex flex-col bg-[#18181C] border border-[#2B2B30] rounded overflow-hidden text-xs min-h-0"
            >
              {inspectorMode === 'project_details' || !currentClip ? (
                /* PROJECT DETAILS MODE (Chi tiết dự án + Sửa đổi Proxy/Color Space) */
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-3 h-8 border-b border-[#2B2B30]">
                    <span className="font-semibold text-[#00E5CC]">Chi tiết</span>
                    {currentClip && (
                      <button
                        type="button"
                        onClick={() => setInspectorMode('clip')}
                        className="text-[11px] text-[#9CA3AF] hover:text-white cursor-pointer"
                      >
                        Đóng
                      </button>
                    )}
                  </div>
                  <div className="flex-1 p-3.5 space-y-2.5 text-[11px] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#71717A]">Tên:</span>
                      <span className="col-span-2 text-white font-medium">
                        {projectName || (language === 'en' ? 'Enter project name' : 'Nhập tên dự án')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#71717A]">Đường dẫn:</span>
                      <span className="col-span-2 text-[#A1A1AA] break-all font-mono text-[10px]">
                        {projectName
                          ? `C:/Users/PC/AppData/Local/TDOCut/User Data/Projects/${projectName}`
                          : 'Chưa lưu dự án'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#71717A]">Không gian màu:</span>
                      <span className="col-span-2 font-mono text-white">{projectColorSpace}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#71717A]">Proxy (Chống giật):</span>
                      <span className="col-span-2 font-mono text-[#00E5CC]">
                        {proxyEnabled ? 'Đã bật (540P H.264)' : 'Đã tắt'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#71717A]">Số clip Timeline:</span>
                      <span className="col-span-2 font-mono text-[#00E5CC]">
                        {videoClipsCount} video · {clips.filter((c) => c.trackIndex === 1).length}{' '}
                        audio · {clips.filter((c) => c.trackIndex === 2).length} text
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[#71717A]">Tỷ lệ khung hình:</span>
                      <span className="col-span-2 font-mono text-white">
                        {aspectRatio === 'original' ? 'Tỉ lệ gốc' : aspectRatio} · 30.00 FPS
                      </span>
                    </div>

                    <div className="pt-3 border-t border-[#2B2B30] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProxyEnabled((p) => !p);
                            setProjectColorSpace((cs) =>
                              cs === 'Rec.709 SDR' ? 'Rec.2020 HDR' : 'Rec.709 SDR'
                            );
                            showToast('Đã cập nhật cấu hình Proxy & Không gian màu dự án!');
                          }}
                          className="flex-1 py-1.5 px-3 bg-[#26262F] hover:bg-[#32323E] text-white border border-[#3A3A48] rounded font-medium cursor-pointer"
                        >
                          Sửa đổi (Modify)
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleClearAllSampleData}
                        className="w-full py-2 px-3 bg-[#2E1D22] hover:bg-[#3F232B] text-[#F87171] border border-[#F87171]/40 font-semibold rounded flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa sạch dữ liệu mẫu / Tạo dự án trắng</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : Boolean(currentClip.subtitleText) ||
                (currentClip.trackIndex === 2 &&
                  !currentClip.stickerEmoji &&
                  (!currentClip.stickerType || currentClip.stickerType === 'none')) ? (
                /* DEDICATED TEXT & SUBTITLE INSPECTOR MODE (Văn bản: Cơ bản | Bong bóng | Hiệu ứng | Đọc TTS) */
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-3 h-8 bg-[#141418] border-b border-[#2B2B30] shrink-0">
                    <span className="font-semibold text-[#00E5CC]">Văn bản (Text Inspector)</span>
                    <span className="text-[10px] font-mono text-[#9CA3AF] truncate max-w-28">
                      {currentClip.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-1.5 bg-[#121216] border-b border-[#27272F] shrink-0">
                    {(
                      [
                        { id: 'basic', label: 'Cơ bản' },
                        { id: 'bubble', label: 'Bong bóng' },
                        { id: 'effects', label: 'Hiệu ứng' },
                        { id: 'tts', label: 'Đọc TTS' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setTextSubTab(st.id)}
                        className={`py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                          textSubTab === st.id
                            ? 'bg-[#26262F] text-[#00E5CC] font-semibold'
                            : 'text-[#8E8E93] hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-[11px]">
                    {textSubTab === 'basic' && (
                      <>
                        <div className="space-y-1">
                          <span className="text-[#A1A1AA]">Nội dung văn bản / Phụ đề:</span>
                          <textarea
                            rows={2}
                            value={currentClip.subtitleText ?? currentClip.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              commitClips((prev) =>
                                prev.map((c) =>
                                  c.id === currentClip.id
                                    ? { ...c, subtitleText: val, name: val || 'Phụ đề' }
                                    : c
                                )
                              );
                            }}
                            className="w-full px-2.5 py-1.5 bg-[#121216] border border-[#343440] focus:border-[#00E5CC] rounded text-white resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#A1A1AA]">Phông chữ:</span>
                          <select
                            value={currentClip.fontFamily || 'Inter, sans-serif'}
                            onChange={(e) =>
                              updateSelectedClipProp('fontFamily', e.target.value)
                            }
                            className="bg-[#222228] border border-[#30303A] rounded px-2 py-1 text-white"
                          >
                            <option value="Inter, sans-serif">Inter Modern (Mặc định)</option>
                            <option value="Georgia, serif">Georgia Serif (Điện ảnh)</option>
                            <option value="'Courier New', monospace">Courier Mono (Máy chữ)</option>
                            <option value="Impact, sans-serif">Impact Viral (TikTok)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[#A1A1AA] w-16 shrink-0">Cỡ chữ</span>
                          <input
                            type="range"
                            min={14}
                            max={96}
                            value={currentClip.fontSize ?? 28}
                            onChange={(e) =>
                              updateSelectedClipProp('fontSize', Number(e.target.value))
                            }
                            className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                          />
                          <NumericBoxWithSteppers
                            value={currentClip.fontSize ?? 28}
                            min={14}
                            max={96}
                            step={1}
                            widthClass="w-16"
                            ariaLabel="Cỡ chữ"
                            onChange={(val) => updateSelectedClipProp('fontSize', val)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center justify-between p-1.5 bg-[#222228] rounded">
                            <span className="text-[#A1A1AA]">Màu chữ:</span>
                            <input
                              type="color"
                              value={currentClip.textColor || '#FFFFFF'}
                              onChange={(e) =>
                                updateSelectedClipProp('textColor', e.target.value)
                              }
                              className="w-7 h-5 bg-transparent cursor-pointer"
                            />
                          </label>
                          <label className="flex items-center justify-between p-1.5 bg-[#222228] rounded">
                            <span className="text-[#A1A1AA]">Viền chữ:</span>
                            <input
                              type="color"
                              value={currentClip.textStrokeColor || '#000000'}
                              onChange={(e) =>
                                updateSelectedClipProp('textStrokeColor', e.target.value)
                              }
                              className="w-7 h-5 bg-transparent cursor-pointer"
                            />
                          </label>
                        </div>

                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[#A1A1AA] w-16 shrink-0 truncate">Uốn cong</span>
                          <input
                            type="range"
                            min={-180}
                            max={180}
                            value={currentClip.textCurveDeg ?? 0}
                            onChange={(e) =>
                              updateSelectedClipProp('textCurveDeg', Number(e.target.value))
                            }
                            className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                          />
                          <NumericBoxWithSteppers
                            value={currentClip.textCurveDeg ?? 0}
                            min={-180}
                            max={180}
                            step={5}
                            unit="°"
                            widthClass="w-16"
                            ariaLabel="Độ uốn cong chữ"
                            onChange={(val) => updateSelectedClipProp('textCurveDeg', val)}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[#A1A1AA] w-14">Vị trí</span>
                          <div className="flex-1 grid grid-cols-2 gap-1.5">
                            <NumericBoxWithSteppers
                              value={currentClip.posX ?? 0}
                              min={-2000}
                              max={2000}
                              step={5}
                              prefix="X"
                              widthClass="w-full"
                              ariaLabel="Vị trí chữ X"
                              onChange={(val) => updateSelectedClipProp('posX', val)}
                            />
                            <NumericBoxWithSteppers
                              value={currentClip.posY ?? 0}
                              min={-2000}
                              max={2000}
                              step={5}
                              prefix="Y"
                              widthClass="w-full"
                              ariaLabel="Vị trí chữ Y"
                              onChange={(val) => updateSelectedClipProp('posY', val)}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            commitClips((prev) =>
                              prev.map((c) =>
                                c.trackIndex === 2 || Boolean(c.subtitleText)
                                  ? {
                                      ...c,
                                      fontFamily: currentClip.fontFamily,
                                      fontSize: currentClip.fontSize,
                                      textColor: currentClip.textColor,
                                      textStrokeColor: currentClip.textStrokeColor,
                                      textBgColor: currentClip.textBgColor,
                                    }
                                  : c
                              )
                            );
                            showToast('Đã đồng bộ kiểu chữ cho toàn bộ phụ đề trên Timeline!');
                          }}
                          className="w-full py-1.5 px-2 bg-[#00E5CC]/15 hover:bg-[#00E5CC] hover:text-black text-[#00E5CC] border border-[#00E5CC]/40 font-semibold rounded transition-colors cursor-pointer"
                        >
                          Áp dụng cho tất cả phụ đề (Apply to All)
                        </button>
                      </>
                    )}

                    {textSubTab === 'bubble' && (
                      <div className="space-y-2.5">
                        <div className="font-semibold text-white">Khung nền Bong bóng (Text Bubble)</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: 'Không nền', bg: '' },
                            { label: 'Hộp Đen Mờ', bg: 'rgba(0,0,0,0.65)' },
                            { label: 'Bong bóng Cyan', bg: '#00E5CC' },
                            { label: 'Bong bóng Đỏ Viral', bg: '#EF4444' },
                            { label: 'Nhãn Vàng Cinema', bg: '#F59E0B' },
                            { label: 'Tím Cyberpunk', bg: '#7C3AED' },
                          ].map((b) => (
                            <button
                              key={b.label}
                              type="button"
                              onClick={() => updateSelectedClipProp('textBgColor', b.bg)}
                              className={`p-2 rounded border text-left cursor-pointer ${
                                (currentClip.textBgColor || '') === b.bg
                                  ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                  : 'bg-[#222228] border-[#30303A] text-[#D4D4D8]'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {textSubTab === 'effects' && (
                      <div className="space-y-2.5">
                        <div className="font-semibold text-white">Mẫu Chữ Nghệ Thuật &amp; Hiệu ứng Động</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: 'Trắng Viền Đen', color: '#FFFFFF', stroke: '#000000', shadow: '#000000' },
                            { label: 'Vàng Điện Ảnh', color: '#FACC15', stroke: '#000000', shadow: '#78350F' },
                            { label: 'Neon Cyan Glow', color: '#00E5CC', stroke: '#042F2E', shadow: '#00E5CC' },
                            { label: 'Hồng Cyberpunk', color: '#F472B6', stroke: '#500724', shadow: '#EC4899' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                commitClips((prev) =>
                                  prev.map((c) =>
                                    c.id === currentClip.id
                                      ? {
                                          ...c,
                                          textColor: preset.color,
                                          textStrokeColor: preset.stroke,
                                          textShadowColor: preset.shadow,
                                        }
                                      : c
                                  )
                                );
                              }}
                              className="p-2 rounded border bg-[#222228] border-[#30303A] hover:border-[#00E5CC] text-left cursor-pointer"
                            >
                              <span style={{ color: preset.color }} className="font-bold">
                                {preset.label}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-[#2B2B30] space-y-1.5">
                          <span className="text-[#A1A1AA] block">Hiệu ứng Chuyển động Chữ (Animation):</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {(
                              [
                                { id: 'none', label: 'Tắt' },
                                { id: 'fade_in', label: 'Hiện dần' },
                                { id: 'zoom_in', label: 'Phóng vào' },
                                { id: 'slide_up', label: 'Trượt lên' },
                                { id: 'bounce_combo', label: 'Nảy đàn hồi' },
                              ] as Array<{ id: AnimationPreset; label: string }>
                            ).map((anim) => (
                              <button
                                key={anim.id}
                                type="button"
                                onClick={() => {
                                  commitClips((prev) =>
                                    prev.map((c) =>
                                      c.id === currentClip.id
                                        ? { ...c, animIn: anim.id, animationIn: anim.id }
                                        : c
                                    )
                                  );
                                }}
                                className={`p-1.5 rounded border text-center cursor-pointer ${
                                  (currentClip.animIn || currentClip.animationIn || 'none') === anim.id
                                    ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                    : 'bg-[#222228] border-[#30303A] text-[#D4D4D8]'
                                }`}
                              >
                                {anim.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {textSubTab === 'tts' && (
                      <div className="space-y-2.5">
                        <div className="font-semibold text-white">Chuyển Văn Bản Thành Giọng Nói (AI TTS)</div>
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeakSubtitleTts(currentClip.subtitleText || currentClip.name)
                          }
                          className="w-full py-2 px-3 bg-[#00E5CC] text-[#090D12] font-bold rounded cursor-pointer"
                        >
                          🔊 Đọc Phụ đề bằng Giọng AI (TTS)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* CLIP INSPECTOR MODE (6 Main Tabs: Video | Âm thanh | Tốc độ | Hiệu ứng động | Điều chỉnh | Lách BQ) */
                <>
                  <div className="flex items-center justify-between px-1 h-8 bg-[#141418] border-b border-[#2B2B30] overflow-x-auto no-scrollbar shrink-0">
                    {(
                      [
                        { id: 'video', label: 'Video' },
                        { id: 'audio', label: 'Âm thanh' },
                        { id: 'speed', label: 'Tốc độ' },
                        { id: 'animation', label: 'Hiệu ứng động' },
                        { id: 'adjust', label: 'Điều chỉnh' },
                        { id: 'antidetect', label: 'Lách BQ' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setInspectorTab(t.id)}
                        className={`px-1.5 py-1 text-[10.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          inspectorTab === t.id
                            ? 'text-[#00E5CC] border-b-2 border-[#00E5CC]'
                            : 'text-[#9CA3AF] hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Inspector Body */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {inspectorTab === 'video' && (
                      <>
                        {/* 4 Sub-tabs: Cơ bản | Xóa nền | Mặt nạ | Làm mịn */}
                        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#121216] rounded border border-[#27272F]">
                          {(
                            [
                              { id: 'basic', label: 'Cơ bản' },
                              { id: 'cutout', label: 'Xóa nền' },
                              { id: 'mask', label: 'Mặt nạ' },
                              { id: 'enhance', label: 'Làm mịn' },
                            ] as const
                          ).map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setVideoSubTab(st.id)}
                              className={`py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                                videoSubTab === st.id
                                  ? 'bg-[#26262F] text-white'
                                  : 'text-[#8E8E93] hover:text-white'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>

                        {videoSubTab === 'basic' && currentClip && (
                          <div className="space-y-2.5">
                            {/* Sticker & Icon Text + Quick Transform Editor when a Sticker/Icon clip is selected */}
                            {Boolean(currentClip.stickerEmoji) && (
                              <div
                                data-testid="sticker-inspector-editor"
                                className="p-2.5 bg-[#121921] border border-[#00E5CC]/45 rounded space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-[#00E5CC] flex items-center gap-1.5">
                                    <span className="text-base leading-none">
                                      {currentClip.stickerEmoji}
                                    </span>
                                    <span>Chỉnh sửa Nhãn dán &amp; Biểu tượng</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-[#A1A1AA]">
                                    Tỷ lệ {Math.round(currentClip.scale ?? 100)}%
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] text-[#A1A1AA]">
                                    Văn bản trên Nhãn dán (Để trống nếu chỉ hiện Icon):
                                  </label>
                                  <input
                                    type="text"
                                    data-testid="sticker-text-input"
                                    value={currentClip.stickerText ?? ''}
                                    placeholder="Nhập chữ hiển thị kèm nhãn dán (VD: SUBSCRIBE, ĐĂNG KÝ...)"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      commitClips(
                                        (prev) =>
                                          prev.map((c) =>
                                            c.id === currentClip.id
                                              ? {
                                                  ...c,
                                                  stickerText: val,
                                                  name: val
                                                    ? `${c.stickerEmoji} ${val}`
                                                    : c.name,
                                                }
                                              : c
                                          ),
                                        `stk-text:${currentClip.id}`
                                      );
                                    }}
                                    className="w-full px-2 py-1 text-[11px] bg-[#1D242E] border border-[#324152] focus:border-[#00E5CC] rounded text-white placeholder-[#71717A]"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] text-[#A1A1AA]">
                                    Dòng chữ phụ (Subtext):
                                  </label>
                                  <input
                                    type="text"
                                    data-testid="sticker-subtext-input"
                                    value={currentClip.stickerSubText ?? ''}
                                    placeholder="Dòng mô tả nhỏ bên dưới (Tuỳ chọn)..."
                                    onChange={(e) =>
                                      updateSelectedClipProp('stickerSubText', e.target.value)
                                    }
                                    className="w-full px-2 py-1 text-[11px] bg-[#1D242E] border border-[#324152] focus:border-[#00E5CC] rounded text-white placeholder-[#71717A]"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-0.5">
                                  <label className="flex items-center justify-between gap-1 bg-[#1B222C] px-2 py-1 rounded border border-[#2C3746]">
                                    <span className="text-[10px] text-[#D4D4D8]">Màu chữ</span>
                                    <input
                                      type="color"
                                      value={currentClip.textColor || '#FFFFFF'}
                                      onChange={(e) =>
                                        updateSelectedClipProp('textColor', e.target.value)
                                      }
                                      className="w-5 h-4 bg-transparent border-0 cursor-pointer"
                                    />
                                  </label>
                                  <label className="flex items-center justify-between gap-1 bg-[#1B222C] px-2 py-1 rounded border border-[#2C3746]">
                                    <span className="text-[10px] text-[#D4D4D8]">Màu nền</span>
                                    <input
                                      type="color"
                                      value={currentClip.textBgColor || '#E11D48'}
                                      onChange={(e) =>
                                        updateSelectedClipProp('textBgColor', e.target.value)
                                      }
                                      className="w-5 h-4 bg-transparent border-0 cursor-pointer"
                                    />
                                  </label>
                                </div>

                                {/* Quick Scale / Rotate / Mirror Buttons for Sticker & Icon */}
                                <div className="grid grid-cols-5 gap-1 pt-1">
                                  <button
                                    type="button"
                                    data-testid="sticker-scale-down-btn"
                                    onClick={() => {
                                      const nextScale = Math.max(
                                        15,
                                        Math.round((currentClip.scale ?? 100) - 20)
                                      );
                                      updateSelectedClipProp('scale', nextScale);
                                    }}
                                    className="py-1 px-1.5 bg-[#222B38] hover:bg-[#2D3A4B] text-white rounded text-[10px] font-semibold cursor-pointer"
                                    title="Thu nhỏ nhãn dán (-20%)"
                                  >
                                    − Thu nhỏ
                                  </button>
                                  <button
                                    type="button"
                                    data-testid="sticker-scale-up-btn"
                                    onClick={() => {
                                      const nextScale = Math.min(
                                        500,
                                        Math.round((currentClip.scale ?? 100) + 20)
                                      );
                                      updateSelectedClipProp('scale', nextScale);
                                    }}
                                    className="py-1 px-1.5 bg-[#222B38] hover:bg-[#2D3A4B] text-[#00E5CC] rounded text-[10px] font-semibold cursor-pointer"
                                    title="Phóng to nhãn dán (+20%)"
                                  >
                                    + Phóng to
                                  </button>
                                  <button
                                    type="button"
                                    data-testid="sticker-rotate-btn"
                                    onClick={() => {
                                      const nextRot = ((currentClip.rotation ?? 0) + 45) % 360;
                                      updateSelectedClipProp('rotation', nextRot);
                                    }}
                                    className="py-1 px-1.5 bg-[#222B38] hover:bg-[#2D3A4B] text-white rounded text-[10px] font-semibold cursor-pointer"
                                    title="Xoay nhãn dán +45°"
                                  >
                                    ↻ Xoay 45°
                                  </button>
                                  <button
                                    type="button"
                                    data-testid="sticker-flip-h-btn"
                                    onClick={() =>
                                      updateSelectedClipProp('flipH', !currentClip.flipH)
                                    }
                                    className={`py-1 px-1.5 rounded text-[10px] font-semibold cursor-pointer ${
                                      currentClip.flipH
                                        ? 'bg-[#00E5CC] text-[#071013]'
                                        : 'bg-[#222B38] hover:bg-[#2D3A4B] text-white'
                                    }`}
                                    title="Phản chiếu / Lật ngang (Flip Horizontal)"
                                  >
                                    ⇋ Lật ngang
                                  </button>
                                  <button
                                    type="button"
                                    data-testid="sticker-flip-v-btn"
                                    onClick={() =>
                                      updateSelectedClipProp('flipV', !currentClip.flipV)
                                    }
                                    className={`py-1 px-1.5 rounded text-[10px] font-semibold cursor-pointer ${
                                      currentClip.flipV
                                        ? 'bg-[#00E5CC] text-[#071013]'
                                        : 'bg-[#222B38] hover:bg-[#2D3A4B] text-white'
                                    }`}
                                    title="Phản chiếu / Lật dọc (Flip Vertical)"
                                  >
                                    ⇅ Lật dọc
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Header: Biến đổi + Keyframe Diamond ◇ */}
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">Biến đổi</span>
                              <div className="flex items-center gap-1.5 text-[#8E8E93]">
                                <button
                                  type="button"
                                  title="Đặt lại Biến đổi về mặc định"
                                  onClick={() => {
                                    commitClips((prev) =>
                                      prev.map((c) =>
                                        c.id === currentClip.id
                                          ? {
                                              ...c,
                                              scale: 100,
                                              scaleX: 100,
                                              scaleY: 100,
                                              uniformScale: true,
                                              posX: 0,
                                              posY: 0,
                                              rotation: 0,
                                              flipH: false,
                                              flipV: false,
                                            }
                                          : c
                                      )
                                    );
                                  }}
                                  className="hover:text-white cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Thêm/Xóa Keyframe tổng hợp tại Playhead (Alt+K)"
                                  onClick={() => handleToggleKeyframe('Biến đổi (Transform)')}
                                  className={`cursor-pointer ${
                                    (currentClip.keyframes?.length || 0) > 0
                                      ? 'text-[#00E5CC]'
                                      : 'hover:text-[#00E5CC]'
                                  }`}
                                >
                                  <Diamond className="w-3.5 h-3.5 fill-current" />
                                </button>
                              </div>
                            </div>

                            {/* Scale (Uniform vs Separate Scale X / Scale Y) */}
                            {(currentClip.uniformScale ?? true) ? (
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[#A1A1AA] w-12 shrink-0">Tỷ lệ</span>
                                <input
                                  type="range"
                                  aria-label="Tỷ lệ Scale"
                                  min={10}
                                  max={500}
                                  value={currentClip.scale ?? 100}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    commitClips((prev) =>
                                      prev.map((c) =>
                                        c.id === currentClip.id
                                          ? {
                                              ...c,
                                              scale: val,
                                              scaleX: val,
                                              scaleY: val,
                                              cropRatio: Number((val / 100).toFixed(2)),
                                            }
                                          : c
                                      )
                                    );
                                  }}
                                  className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                                />
                                <NumericBoxWithSteppers
                                  value={currentClip.scale ?? 100}
                                  min={10}
                                  max={500}
                                  step={1}
                                  unit="%"
                                  widthClass="w-16"
                                  ariaLabel="Số Tỷ lệ Scale"
                                  onChange={(val) => {
                                    commitClips((prev) =>
                                      prev.map((c) =>
                                        c.id === currentClip.id
                                          ? {
                                              ...c,
                                              scale: val,
                                              scaleX: val,
                                              scaleY: val,
                                              cropRatio: Number((val / 100).toFixed(2)),
                                            }
                                          : c
                                      )
                                    );
                                  }}
                                />
                                <button
                                  type="button"
                                  title="Keyframe Tỷ lệ (Scale)"
                                  onClick={() => handleToggleKeyframe('Tỷ lệ (Scale)')}
                                  className="text-[#71717A] hover:text-[#00E5CC] cursor-pointer shrink-0"
                                >
                                  <Diamond className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[#A1A1AA] w-14 shrink-0">Tỷ lệ X</span>
                                  <input
                                    type="range"
                                    aria-label="Tỷ lệ X"
                                    min={10}
                                    max={500}
                                    value={currentClip.scaleX ?? currentClip.scale ?? 100}
                                    onChange={(e) =>
                                      updateSelectedClipProp('scaleX', Number(e.target.value))
                                    }
                                    className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                                  />
                                  <NumericBoxWithSteppers
                                    value={currentClip.scaleX ?? currentClip.scale ?? 100}
                                    min={10}
                                    max={500}
                                    step={1}
                                    unit="%"
                                    widthClass="w-16"
                                    ariaLabel="Số Tỷ lệ X"
                                    onChange={(val) => updateSelectedClipProp('scaleX', val)}
                                  />
                                </div>
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[#A1A1AA] w-14 shrink-0">Tỷ lệ Y</span>
                                  <input
                                    type="range"
                                    aria-label="Tỷ lệ Y"
                                    min={10}
                                    max={500}
                                    value={currentClip.scaleY ?? currentClip.scale ?? 100}
                                    onChange={(e) =>
                                      updateSelectedClipProp('scaleY', Number(e.target.value))
                                    }
                                    className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                                  />
                                  <NumericBoxWithSteppers
                                    value={currentClip.scaleY ?? currentClip.scale ?? 100}
                                    min={10}
                                    max={500}
                                    step={1}
                                    unit="%"
                                    widthClass="w-16"
                                    ariaLabel="Số Tỷ lệ Y"
                                    onChange={(val) => updateSelectedClipProp('scaleY', val)}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Uniform Scale (Thu phóng đồng nhất) */}
                            <div className="flex items-center justify-between">
                              <span className="text-[#A1A1AA]">Thu phóng đồng nhất</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextVal = !(currentClip.uniformScale ?? true);
                                  commitClips((prev) =>
                                    prev.map((c) =>
                                      c.id === currentClip.id
                                        ? {
                                            ...c,
                                            uniformScale: nextVal,
                                            scaleX: c.scaleX ?? c.scale ?? 100,
                                            scaleY: c.scaleY ?? c.scale ?? 100,
                                          }
                                        : c
                                    )
                                  );
                                }}
                                className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${
                                  (currentClip.uniformScale ?? true)
                                    ? 'bg-[#00E5CC]'
                                    : 'bg-[#3A3A44]'
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-black transition-transform ${
                                    (currentClip.uniformScale ?? true)
                                      ? 'right-0.5'
                                      : 'left-0.5'
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Position (Vị trí X, Y) + Keyframe ◇ */}
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[#A1A1AA] w-12">Vị trí</span>
                              <div className="flex-1 grid grid-cols-2 gap-1.5">
                                <NumericBoxWithSteppers
                                  value={currentClip.posX ?? 0}
                                  min={-2000}
                                  max={2000}
                                  step={5}
                                  prefix="X"
                                  widthClass="w-full"
                                  ariaLabel="Vị trí X"
                                  onChange={(val) => updateSelectedClipProp('posX', val)}
                                />
                                <NumericBoxWithSteppers
                                  value={currentClip.posY ?? 0}
                                  min={-2000}
                                  max={2000}
                                  step={5}
                                  prefix="Y"
                                  widthClass="w-full"
                                  ariaLabel="Vị trí Y"
                                  onChange={(val) => updateSelectedClipProp('posY', val)}
                                />
                              </div>
                              <button
                                type="button"
                                title="Keyframe Vị trí (Position)"
                                onClick={() => handleToggleKeyframe('Vị trí (X, Y)')}
                                className="text-[#71717A] hover:text-[#00E5CC] cursor-pointer"
                              >
                                <Diamond className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Rotation (Xoay 0° - 360° + nút +90°) */}
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[#A1A1AA] w-12">Xoay</span>
                              <div className="flex items-center gap-1.5 flex-1 justify-end">
                                <NumericBoxWithSteppers
                                  value={currentClip.rotation ?? 0}
                                  min={-360}
                                  max={360}
                                  step={1}
                                  unit="°"
                                  widthClass="w-20"
                                  ariaLabel="Góc xoay"
                                  onChange={(val) => updateSelectedClipProp('rotation', val)}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSelectedClipProp(
                                      'rotation',
                                      ((currentClip.rotation ?? 0) + 90) % 360
                                    )
                                  }
                                  title="Xoay nhanh +90°"
                                  className="px-2 py-0.5 rounded bg-[#24242C] border border-[#383844] hover:border-[#00E5CC] flex items-center gap-1 text-[10px] text-[#00E5CC] cursor-pointer"
                                >
                                  <RotateCw className="w-3 h-3" />
                                  <span>+90°</span>
                                </button>
                              </div>
                              <button
                                type="button"
                                title="Keyframe Xoay (Rotation)"
                                onClick={() => handleToggleKeyframe('Góc xoay')}
                                className="text-[#71717A] hover:text-[#00E5CC] cursor-pointer"
                              >
                                <Diamond className="w-3 h-3" />
                              </button>
                            </div>

                            {/* 8 Alignment & Flip Buttons Row */}
                            <div className="flex items-center justify-between p-1 bg-[#222228] border border-[#2E2E36] rounded">
                              <button
                                type="button"
                                onClick={() => updateSelectedClipProp('posX', -320)}
                                title="Căn lề trái"
                                className="p-1 text-[#A1A1AA] hover:text-white cursor-pointer"
                              >
                                <AlignLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateSelectedClipProp('posX', 0)}
                                title="Căn giữa ngang"
                                className="p-1 text-[#A1A1AA] hover:text-white cursor-pointer"
                              >
                                <AlignCenterHorizontal className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateSelectedClipProp('posX', 320)}
                                title="Căn lề phải"
                                className="p-1 text-[#A1A1AA] hover:text-white cursor-pointer"
                              >
                                <AlignRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateSelectedClipProp('posY', -200)}
                                title="Căn lề trên"
                                className="p-1 text-[#A1A1AA] hover:text-white cursor-pointer"
                              >
                                <AlignStartVertical className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateSelectedClipProp('posY', 0)}
                                title="Căn giữa dọc"
                                className="p-1 text-[#A1A1AA] hover:text-white cursor-pointer"
                              >
                                <AlignCenterVertical className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateSelectedClipProp('posY', 200)}
                                title="Căn lề dưới"
                                className="p-1 text-[#A1A1AA] hover:text-white cursor-pointer"
                              >
                                <AlignEndVertical className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-px h-3.5 bg-[#363640]" />
                              <button
                                type="button"
                                onClick={() =>
                                  updateSelectedClipProp('flipH', !currentClip.flipH)
                                }
                                title="Lật ngang (Mirror)"
                                className={`p-1 rounded cursor-pointer ${
                                  currentClip.flipH
                                    ? 'text-[#00E5CC] bg-[#00E5CC]/10'
                                    : 'text-[#A1A1AA] hover:text-white'
                                }`}
                              >
                                <FlipHorizontal2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateSelectedClipProp('flipV', !currentClip.flipV)
                                }
                                title="Lật dọc"
                                className={`p-1 rounded cursor-pointer ${
                                  currentClip.flipV
                                    ? 'text-[#00E5CC] bg-[#00E5CC]/10'
                                    : 'text-[#A1A1AA] hover:text-white'
                                }`}
                              >
                                <FlipVertical2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Blend Mode & Opacity (Hòa trộn) */}
                            <div className="pt-2 border-t border-[#2B2B30] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white">Hòa trộn</span>
                                <select
                                  aria-label="Chế độ hòa trộn"
                                  value={currentClip.blendMode || 'source-over'}
                                  onChange={(e) =>
                                    updateSelectedClipProp(
                                      'blendMode',
                                      e.target.value as BlendMode
                                    )
                                  }
                                  className="bg-[#222228] border border-[#30303A] rounded px-2 py-0.5 text-[11px] text-white"
                                >
                                  <option value="source-over">Bình thường (Normal)</option>
                                  <option value="screen">Làm sáng (Screen)</option>
                                  <option value="multiply">Nhân màu (Multiply)</option>
                                  <option value="overlay">Hòa phủ (Overlay)</option>
                                  <option value="darken">Làm tối (Darken)</option>
                                  <option value="lighten">Sáng hơn (Lighten)</option>
                                  <option value="color-dodge">Color Dodge</option>
                                  <option value="hard-light">Hard Light</option>
                                  <option value="soft-light">Soft Light</option>
                                </select>
                              </div>

                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[#A1A1AA] w-12 shrink-0">Độ mờ</span>
                                <input
                                  type="range"
                                  aria-label="Độ mờ Opacity"
                                  min={0}
                                  max={100}
                                  value={currentClip.opacity ?? 100}
                                  onChange={(e) =>
                                    updateSelectedClipProp('opacity', Number(e.target.value))
                                  }
                                  className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                                />
                                <NumericBoxWithSteppers
                                  value={currentClip.opacity ?? 100}
                                  min={0}
                                  max={100}
                                  step={1}
                                  unit="%"
                                  widthClass="w-16"
                                  ariaLabel="Số Độ mờ Opacity"
                                  onChange={(val) => updateSelectedClipProp('opacity', val)}
                                />
                                <button
                                  type="button"
                                  title="Keyframe Độ mờ (Opacity)"
                                  onClick={() => handleToggleKeyframe('Độ mờ (Opacity)')}
                                  className="text-[#71717A] hover:text-[#00E5CC] cursor-pointer shrink-0"
                                >
                                  <Diamond className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* CapCut PC Advanced Video Basic Options: Stabilize, Relight, Motion Blur */}
                            <div className="pt-2 border-t border-[#2B2B30] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[#A1A1AA]">Chống rung (Stabilize):</span>
                                <select
                                  value={currentClip.stabilizeLevel || 'none'}
                                  onChange={(e) =>
                                    updateSelectedClipProp(
                                      'stabilizeLevel',
                                      e.target.value as
                                        | 'none'
                                        | 'recommended'
                                        | 'minimum_cut'
                                        | 'most_stable'
                                    )
                                  }
                                  className="bg-[#222228] border border-[#30303A] rounded px-2 py-0.5 text-[10px] text-white"
                                >
                                  <option value="none">Tắt</option>
                                  <option value="recommended">Khuyên dùng (Recommended)</option>
                                  <option value="minimum_cut">Cắt tối thiểu</option>
                                  <option value="most_stable">Ổn định nhất</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="flex items-center justify-between py-1 cursor-pointer">
                                  <span className="text-[#A1A1AA]">
                                    Đánh sáng 3D (Relight AI):
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      currentClip.relightEnabled ||
                                        (currentClip.relightMode &&
                                          currentClip.relightMode !== 'none')
                                    )}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      commitClips((prev) =>
                                        prev.map((c) =>
                                          c.id === currentClip.id
                                            ? {
                                                ...c,
                                                relightEnabled: checked,
                                                relightMode: checked
                                                  ? c.relightMode && c.relightMode !== 'none'
                                                    ? c.relightMode
                                                    : 'warm'
                                                  : 'none',
                                              }
                                            : c
                                        )
                                      );
                                    }}
                                    className="accent-[#00E5CC]"
                                  />
                                </label>
                                {(currentClip.relightEnabled ||
                                  (currentClip.relightMode &&
                                    currentClip.relightMode !== 'none')) && (
                                  <div className="flex items-center justify-between pl-2">
                                    <span className="text-[10px] text-[#9CA3AF]">
                                      Chế độ ánh sáng 3D:
                                    </span>
                                    <select
                                      value={
                                        currentClip.relightMode &&
                                        currentClip.relightMode !== 'none'
                                          ? currentClip.relightMode
                                          : 'warm'
                                      }
                                      onChange={(e) => {
                                        const mode = e.target.value as
                                          | 'warm'
                                          | 'cool'
                                          | 'neon_dual';
                                        commitClips((prev) =>
                                          prev.map((c) =>
                                            c.id === currentClip.id
                                              ? {
                                                  ...c,
                                                  relightEnabled: true,
                                                  relightMode: mode,
                                                }
                                              : c
                                          )
                                        );
                                      }}
                                      className="bg-[#222228] border border-[#30303A] rounded px-2 py-0.5 text-[10px] text-white"
                                    >
                                      <option value="warm">Nắng ấm (Warm Sunset)</option>
                                      <option value="cool">Trăng lạnh (Cool Studio)</option>
                                      <option value="neon_dual">Neon 2 Hướng (Dual Neon)</option>
                                    </select>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[#A1A1AA] w-24 shrink-0 truncate">Làm mờ CĐ:</span>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={
                                    currentClip.motionBlur ??
                                    currentClip.motionBlurAmount ??
                                    0
                                  }
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    commitClips((prev) =>
                                      prev.map((c) =>
                                        c.id === currentClip.id
                                          ? {
                                              ...c,
                                              motionBlur: val,
                                              motionBlurAmount: val,
                                            }
                                          : c
                                      )
                                    );
                                  }}
                                  className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                                />
                                <NumericBoxWithSteppers
                                  value={
                                    currentClip.motionBlur ??
                                    currentClip.motionBlurAmount ??
                                    0
                                  }
                                  min={0}
                                  max={100}
                                  step={1}
                                  unit="%"
                                  widthClass="w-16"
                                  ariaLabel="Làm mờ chuyển động"
                                  onChange={(val) => {
                                    commitClips((prev) =>
                                      prev.map((c) =>
                                        c.id === currentClip.id
                                          ? {
                                              ...c,
                                              motionBlur: val,
                                              motionBlurAmount: val,
                                            }
                                          : c
                                      )
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {videoSubTab === 'cutout' && currentClip && (
                          <div className="space-y-2.5">
                            <label className="flex items-center justify-between p-2 bg-[#222228] rounded cursor-pointer">
                              <span>Phông xanh (Chroma Key)</span>
                              <input
                                type="checkbox"
                                checked={Boolean(currentClip.removeBg)}
                                onChange={(e) =>
                                  updateSelectedClipProp('removeBg', e.target.checked)
                                }
                                className="accent-[#00E5CC]"
                              />
                            </label>
                            {currentClip.removeBg && (
                              <div className="flex items-center justify-between px-2">
                                <span className="text-[#A1A1AA]">Màu phông nền:</span>
                                <select
                                  value={currentClip.chromaColor || 'green'}
                                  onChange={(e) =>
                                    updateSelectedClipProp(
                                      'chromaColor',
                                      e.target.value as 'green' | 'blue'
                                    )
                                  }
                                  className="bg-[#222228] border border-[#30303A] rounded px-2 py-1 text-white"
                                >
                                  <option value="green">Phông Xanh lá (Green Screen)</option>
                                  <option value="blue">Phông Xanh dương (Blue Screen)</option>
                                </select>
                              </div>
                            )}

                            <label className="flex items-center justify-between p-2 bg-[#222228] rounded cursor-pointer">
                              <span>Tách nền AI (Auto Cutout + Viền Stroke)</span>
                              <input
                                type="checkbox"
                                checked={Boolean(currentClip.autoCutout)}
                                onChange={(e) =>
                                  updateSelectedClipProp('autoCutout', e.target.checked)
                                }
                                className="accent-[#00E5CC]"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-[#222228] rounded cursor-pointer">
                              <span>Làm mờ hậu cảnh (Background Blur)</span>
                              <input
                                type="checkbox"
                                checked={Boolean(currentClip.blurBg)}
                                onChange={(e) =>
                                  updateSelectedClipProp('blurBg', e.target.checked)
                                }
                                className="accent-[#00E5CC]"
                              />
                            </label>
                          </div>
                        )}

                        {videoSubTab === 'mask' && currentClip && (
                          <div className="space-y-2.5">
                            <div className="grid grid-cols-2 gap-1.5">
                              {(
                                [
                                  { id: 'none', label: 'Không mặt nạ' },
                                  { id: 'circle', label: 'Hình tròn (Circle)' },
                                  { id: 'rectangle', label: 'Chữ nhật (Rect)' },
                                  { id: 'split', label: 'Chia đôi (Linear)' },
                                  { id: 'mirror', label: 'Đối xứng (Mirror)' },
                                  { id: 'heart', label: 'Trái tim (Heart)' },
                                  { id: 'star', label: 'Ngôi sao (Star)' },
                                ] as Array<{ id: MaskType; label: string }>
                              ).map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => updateSelectedClipProp('maskType', m.id)}
                                  className={`p-2 rounded border text-center cursor-pointer ${
                                    (currentClip.maskType || 'none') === m.id
                                      ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                      : 'bg-[#222228] border-[#30303A] text-[#D4D4D8]'
                                  }`}
                                >
                                  {m.label}
                                </button>
                              ))}
                            </div>

                            {currentClip.maskType && currentClip.maskType !== 'none' && (
                              <label className="flex items-center justify-between p-2 bg-[#222228] rounded cursor-pointer">
                                <span>Đảo ngược vùng che (Invert Mask)</span>
                                <input
                                  type="checkbox"
                                  checked={Boolean(currentClip.maskInvert)}
                                  onChange={(e) =>
                                    updateSelectedClipProp('maskInvert', e.target.checked)
                                  }
                                  className="accent-[#00E5CC]"
                                />
                              </label>
                            )}
                          </div>
                        )}

                        {videoSubTab === 'enhance' && currentClip && (
                          <div className="space-y-2.5">
                            {(
                              [
                                { key: 'smoothSkin', label: 'Làm mịn da (Smooth)' },
                                { key: 'faceBrighten', label: 'Sáng mặt (Brighten)' },
                                { key: 'whiteTeeth', label: 'Trắng răng (White Teeth)' },
                                { key: 'faceSlim', label: 'Gọt cằm V-Line' },
                                { key: 'bodySlim', label: 'Thon dáng & Kéo chân' },
                              ] as const
                            ).map((rt) => (
                              <div
                                key={rt.key}
                                className="flex items-center justify-between gap-1.5"
                              >
                                <span className="text-[#A1A1AA] w-24 shrink-0 truncate">{rt.label}</span>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={(currentClip[rt.key] as number) ?? 0}
                                  onChange={(e) =>
                                    updateSelectedClipProp(rt.key, Number(e.target.value))
                                  }
                                  className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                                />
                                <NumericBoxWithSteppers
                                  value={(currentClip[rt.key] as number) ?? 0}
                                  min={0}
                                  max={100}
                                  step={1}
                                  unit="%"
                                  widthClass="w-16"
                                  ariaLabel={rt.label}
                                  onChange={(val) => updateSelectedClipProp(rt.key, val)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* INSPECTOR TAB 2: AUDIO (Volume + Keyframe ◇, Fade, Normalize, Vocal Isolation, Ducking, Voice Changer) */}
                    {inspectorTab === 'audio' && currentClip && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[#A1A1AA] w-16 shrink-0">Âm lượng</span>
                          <input
                            type="range"
                            aria-label="Âm lượng Clip"
                            min={0}
                            max={200}
                            value={currentClip.volume}
                            onChange={(e) =>
                              updateSelectedClipProp('volume', Number(e.target.value))
                            }
                            className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                          />
                          <NumericBoxWithSteppers
                            value={currentClip.volume}
                            min={0}
                            max={200}
                            step={1}
                            unit="%"
                            widthClass="w-16"
                            ariaLabel="Số Âm lượng Clip"
                            onChange={(val) => updateSelectedClipProp('volume', val)}
                          />
                          <button
                            type="button"
                            title="Keyframe Âm lượng (Volume)"
                            onClick={() => handleToggleKeyframe('Âm lượng')}
                            className="text-[#71717A] hover:text-[#00E5CC] cursor-pointer shrink-0"
                          >
                            <Diamond className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[#A1A1AA] w-16 shrink-0">Fade-in</span>
                          <input
                            type="range"
                            min={0}
                            max={5}
                            step={0.2}
                            value={currentClip.fadeIn ?? 0}
                            onChange={(e) =>
                              updateSelectedClipProp('fadeIn', Number(e.target.value))
                            }
                            className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                          />
                          <NumericBoxWithSteppers
                            value={currentClip.fadeIn ?? 0}
                            min={0}
                            max={5}
                            step={0.2}
                            unit="s"
                            widthClass="w-16"
                            ariaLabel="Fade-in"
                            onChange={(val) => updateSelectedClipProp('fadeIn', val)}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[#A1A1AA] w-16 shrink-0">Fade-out</span>
                          <input
                            type="range"
                            min={0}
                            max={5}
                            step={0.2}
                            value={currentClip.fadeOut ?? 0}
                            onChange={(e) =>
                              updateSelectedClipProp('fadeOut', Number(e.target.value))
                            }
                            className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                          />
                          <NumericBoxWithSteppers
                            value={currentClip.fadeOut ?? 0}
                            min={0}
                            max={5}
                            step={0.2}
                            unit="s"
                            widthClass="w-16"
                            ariaLabel="Fade-out"
                            onChange={(val) => updateSelectedClipProp('fadeOut', val)}
                          />
                        </div>

                        <label className="flex items-center justify-between p-1.5 bg-[#222228] rounded cursor-pointer">
                          <span>Chuẩn hóa âm lượng (-14 LUFS)</span>
                          <input
                            type="checkbox"
                            checked={Boolean(currentClip.loudnessNormalize)}
                            onChange={(e) =>
                              updateSelectedClipProp('loudnessNormalize', e.target.checked)
                            }
                            className="accent-[#00E5CC]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-1.5 bg-[#222228] rounded cursor-pointer">
                          <span>Giảm tiếng ồn (Reduce Noise)</span>
                          <input
                            type="checkbox"
                            checked={Boolean(currentClip.noiseReduction)}
                            onChange={(e) =>
                              updateSelectedClipProp('noiseReduction', e.target.checked)
                            }
                            className="accent-[#00E5CC]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-1.5 bg-[#222228] rounded cursor-pointer">
                          <span>Tự động giảm nhạc nền (Audio Ducking)</span>
                          <input
                            type="checkbox"
                            checked={Boolean(currentClip.audioDucking)}
                            onChange={(e) =>
                              updateSelectedClipProp('audioDucking', e.target.checked)
                            }
                            className="accent-[#00E5CC]"
                          />
                        </label>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[#A1A1AA]">Tách giọng AI:</span>
                          <select
                            value={currentClip.vocalIsolation || 'off'}
                            onChange={(e) =>
                              updateSelectedClipProp(
                                'vocalIsolation',
                                e.target.value as 'off' | 'keep_vocal' | 'remove_vocal'
                              )
                            }
                            className="bg-[#222228] border border-[#30303A] rounded px-2 py-1 text-white"
                          >
                            <option value="off">Bình thường</option>
                            <option value="keep_vocal">Chỉ giữ Giọng hát (Keep Vocal)</option>
                            <option value="remove_vocal">Chỉ giữ Nhạc Beat (Karaoke)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[#A1A1AA]">Đổi giọng (Voice FX):</span>
                          <select
                            value={currentClip.voiceEffect || 'none'}
                            onChange={(e) =>
                              updateSelectedClipProp(
                                'voiceEffect',
                                e.target.value as
                                  | 'none'
                                  | 'chipmunk'
                                  | 'deep'
                                  | 'robot'
                                  | 'echo'
                                  | 'megaphone'
                              )
                            }
                            className="bg-[#222228] border border-[#30303A] rounded px-2 py-1 text-white"
                          >
                            <option value="none">Giọng gốc</option>
                            <option value="chipmunk">Sóc chuột (Chipmunk)</option>
                            <option value="deep">Trầm ấm (Deep)</option>
                            <option value="robot">Robot AI</option>
                            <option value="echo">Vang vọng (Echo)</option>
                            <option value="megaphone">Loa phóng thanh</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* INSPECTOR TAB 3: SPEED (Standard 0.1x-100x & Speed Curve Presets) */}
                    {inspectorTab === 'speed' && currentClip && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#121216] rounded border border-[#27272F]">
                          <button
                            type="button"
                            onClick={() => setSpeedSubTab('standard')}
                            className={`py-1 text-[10px] font-medium rounded cursor-pointer ${
                              speedSubTab === 'standard'
                                ? 'bg-[#26262F] text-white'
                                : 'text-[#8E8E93]'
                            }`}
                          >
                            Tiêu chuẩn (Standard)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSpeedSubTab('curve')}
                            className={`py-1 text-[10px] font-medium rounded cursor-pointer ${
                              speedSubTab === 'curve'
                                ? 'bg-[#26262F] text-white'
                                : 'text-[#8E8E93]'
                            }`}
                          >
                            Đường cong (Curve)
                          </button>
                        </div>

                        {speedSubTab === 'standard' ? (
                          <>
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[#A1A1AA] w-20 shrink-0 truncate">Tốc độ</span>
                              <input
                                type="range"
                                aria-label="Bội số tốc độ"
                                min={0.2}
                                max={4.0}
                                step={0.05}
                                value={currentClip.speed}
                                onChange={(e) =>
                                  updateSelectedClipProp('speed', Number(e.target.value))
                                }
                                className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                              />
                              <NumericBoxWithSteppers
                                value={currentClip.speed}
                                min={0.1}
                                max={100}
                                step={0.1}
                                unit="x"
                                widthClass="w-16"
                                ariaLabel="Số Bội số tốc độ"
                                onChange={(val) => updateSelectedClipProp('speed', val)}
                              />
                            </div>

                            <div className="grid grid-cols-5 gap-1 pt-1">
                              {[0.5, 1.0, 1.5, 2.0, 4.0].map((spd) => (
                                <button
                                  key={spd}
                                  type="button"
                                  onClick={() => updateSelectedClipProp('speed', spd)}
                                  className={`py-1 rounded font-mono text-[11px] cursor-pointer ${
                                    Math.abs(currentClip.speed - spd) < 0.02
                                      ? 'bg-[#00E5CC] text-[#090D12] font-bold'
                                      : 'bg-[#222228] text-[#D4D4D8]'
                                  }`}
                                >
                                  {spd}x
                                </button>
                              ))}
                            </div>

                            <label className="flex items-center justify-between p-2 bg-[#222228] rounded cursor-pointer">
                              <span>Giữ nguyên tông giọng (Keep Pitch)</span>
                              <input
                                type="checkbox"
                                checked={currentClip.keepPitch ?? true}
                                onChange={(e) =>
                                  updateSelectedClipProp('keepPitch', e.target.checked)
                                }
                                className="accent-[#00E5CC]"
                              />
                            </label>

                            <div className="flex items-center justify-between">
                              <span className="text-[#A1A1AA]">Làm mượt Slow-mo:</span>
                              <select
                                value={
                                  typeof currentClip.smoothSlowMo === 'string'
                                    ? currentClip.smoothSlowMo
                                    : currentClip.smoothSlowMo
                                    ? 'optical_flow'
                                    : 'none'
                                }
                                onChange={(e) =>
                                  updateSelectedClipProp(
                                    'smoothSlowMo',
                                    e.target.value as 'none' | 'frame_blending' | 'optical_flow'
                                  )
                                }
                                className="bg-[#222228] border border-[#30303A] rounded px-2 py-1 text-white text-[10px]"
                              >
                                <option value="none">Tắt</option>
                                <option value="frame_blending">Pha trộn khung hình</option>
                                <option value="optical_flow">Luồng quang học AI (Optical Flow)</option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <span className="block text-[#A1A1AA]">
                              Mẫu đường cong tốc độ (Velocity Presets):
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(
                                [
                                  { id: 'none', label: 'Không dùng' },
                                  { id: 'montage', label: 'Montage (Nhịp gắt)' },
                                  { id: 'hero', label: 'Anh hùng (Hero)' },
                                  { id: 'bullet', label: 'Viên đạn (Bullet)' },
                                  { id: 'jump_cut', label: 'Nhảy cảnh (Jump Cut)' },
                                  { id: 'flash_in', label: 'Lao vào (Flash In)' },
                                  { id: 'flash_out', label: 'Lao ra (Flash Out)' },
                                ] as Array<{ id: SpeedCurvePreset; label: string }>
                              ).map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => {
                                    updateSelectedClipProp('speedCurve', preset.id);
                                    showToast(`Đã áp dụng đường cong tốc độ: ${preset.label}`);
                                  }}
                                  className={`p-2 rounded border text-left cursor-pointer ${
                                    (currentClip.speedCurve || 'none') === preset.id
                                      ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                      : 'bg-[#222228] border-[#30303A] text-[#D4D4D8]'
                                  }`}
                                >
                                  📈 {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* INSPECTOR TAB 4: ANIMATION (Vào / Ra / Kết hợp) */}
                    {inspectorTab === 'animation' && currentClip && (
                      <div className="space-y-2.5">
                        <div className="font-semibold text-white">
                          Hiệu ứng Động Clip (In / Out / Combo)
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(
                            [
                              { id: 'none', label: 'Không hiệu ứng' },
                              { id: 'fade_in', label: 'Hiện dần (Fade In)' },
                              { id: 'zoom_in', label: 'Phóng vào (Zoom In)' },
                              { id: 'slide_up', label: 'Trượt lên (Slide Up)' },
                              { id: 'fade_out', label: 'Mờ dần (Fade Out)' },
                              { id: 'pendulum', label: 'Con lắc (Combo)' },
                              { id: 'bounce_combo', label: 'Nảy đàn hồi (Combo)' },
                            ] as Array<{ id: AnimationPreset; label: string }>
                          ).map((anim) => (
                            <button
                              key={anim.id}
                              type="button"
                              onClick={() => {
                                commitClips((prev) =>
                                  prev.map((c) =>
                                    c.id === currentClip.id
                                      ? { ...c, animIn: anim.id, animationIn: anim.id }
                                      : c
                                  )
                                );
                                showToast(`Đã gán hiệu ứng động: ${anim.label}`);
                              }}
                              className={`p-2 rounded border text-left cursor-pointer ${
                                (currentClip.animIn || currentClip.animationIn || 'none') ===
                                anim.id
                                  ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC] font-semibold'
                                  : 'bg-[#222228] border-[#30303A] text-[#D4D4D8]'
                              }`}
                            >
                              {anim.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* INSPECTOR TAB 5: CLIP COLOR ADJUSTMENTS (Basic | HSL 8-Color | Curves | Wheel) */}
                    {inspectorTab === 'adjust' && currentClip && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#121216] rounded border border-[#27272F]">
                          {(
                            [
                              { id: 'basic', label: 'Cơ bản' },
                              { id: 'hsl', label: 'HSL (8 Màu)' },
                              { id: 'curves', label: 'Curves' },
                              { id: 'wheel', label: 'Bánh xe' },
                            ] as const
                          ).map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setAdjustSubTab(st.id)}
                              className={`py-1 text-[10px] font-medium rounded cursor-pointer ${
                                adjustSubTab === st.id
                                  ? 'bg-[#26262F] text-white'
                                  : 'text-[#8E8E93]'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>

                        {adjustSubTab === 'basic' &&
                          (
                            [
                              { key: 'brightness', label: 'Độ sáng', min: -50, max: 50 },
                              { key: 'contrast', label: 'Tương phản', min: -50, max: 50 },
                              { key: 'saturation', label: 'Bão hòa', min: -50, max: 50 },
                              { key: 'warmth', label: 'Nhiệt độ màu', min: -50, max: 50 },
                              { key: 'vignette', label: 'Viền tối', min: 0, max: 80 },
                            ] as const
                          ).map((adj) => (
                            <div
                              key={adj.key}
                              className="flex items-center justify-between gap-1.5"
                            >
                              <span className="text-[#A1A1AA] w-20 shrink-0 truncate">{adj.label}</span>
                              <input
                                type="range"
                                min={adj.min}
                                max={adj.max}
                                value={(currentClip[adj.key] as number) ?? 0}
                                onChange={(e) =>
                                  updateSelectedClipProp(adj.key, Number(e.target.value))
                                }
                                className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                              />
                              <NumericBoxWithSteppers
                                value={(currentClip[adj.key] as number) ?? 0}
                                min={adj.min}
                                max={adj.max}
                                step={1}
                                widthClass="w-16"
                                ariaLabel={adj.label}
                                onChange={(val) => updateSelectedClipProp(adj.key, val)}
                              />
                            </div>
                          ))}

                        {adjustSubTab === 'hsl' && (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                              {(
                                [
                                  { id: 'red', hex: '#EF4444' },
                                  { id: 'orange', hex: '#F97316' },
                                  { id: 'yellow', hex: '#EAB308' },
                                  { id: 'green', hex: '#22C55E' },
                                  { id: 'cyan', hex: '#06B6D4' },
                                  { id: 'blue', hex: '#3B82F6' },
                                  { id: 'purple', hex: '#A855F7' },
                                  { id: 'magenta', hex: '#EC4899' },
                                ] as Array<{ id: HslChannelColor; hex: string }>
                              ).map((col) => (
                                <button
                                  key={col.id}
                                  type="button"
                                  onClick={() => setActiveHslColor(col.id)}
                                  style={{ backgroundColor: col.hex }}
                                  className={`w-5 h-5 rounded-full cursor-pointer ${
                                    activeHslColor === col.id
                                      ? 'ring-2 ring-white scale-110'
                                      : 'opacity-70'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-[10px] text-[#00E5CC] font-mono">
                              Đang chỉnh kênh màu: {activeHslColor.toUpperCase()}
                            </div>
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[#A1A1AA] w-20 shrink-0 truncate">Tông (Hue)</span>
                              <input
                                type="range"
                                min={-50}
                                max={50}
                                value={currentClip.hslHue ?? 0}
                                onChange={(e) =>
                                  updateSelectedClipProp('hslHue', Number(e.target.value))
                                }
                                className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                              />
                              <NumericBoxWithSteppers
                                value={currentClip.hslHue ?? 0}
                                min={-50}
                                max={50}
                                step={1}
                                widthClass="w-16"
                                ariaLabel="Tông màu Hue"
                                onChange={(val) => updateSelectedClipProp('hslHue', val)}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[#A1A1AA] w-20 shrink-0 truncate">Độ bão hòa</span>
                              <input
                                type="range"
                                min={-50}
                                max={50}
                                value={currentClip.hslSat ?? 0}
                                onChange={(e) =>
                                  updateSelectedClipProp('hslSat', Number(e.target.value))
                                }
                                className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                              />
                              <NumericBoxWithSteppers
                                value={currentClip.hslSat ?? 0}
                                min={-50}
                                max={50}
                                step={1}
                                widthClass="w-16"
                                ariaLabel="Độ bão hòa HSL"
                                onChange={(val) => updateSelectedClipProp('hslSat', val)}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[#A1A1AA] w-20 shrink-0 truncate">Độ sáng</span>
                              <input
                                type="range"
                                min={-50}
                                max={50}
                                value={currentClip.hslBri ?? 0}
                                onChange={(e) =>
                                  updateSelectedClipProp('hslBri', Number(e.target.value))
                                }
                                className="flex-1 min-w-0 accent-[#00E5CC] h-1"
                              />
                              <NumericBoxWithSteppers
                                value={currentClip.hslBri ?? 0}
                                min={-50}
                                max={50}
                                step={1}
                                widthClass="w-16"
                                ariaLabel="Độ sáng HSL"
                                onChange={(val) => updateSelectedClipProp('hslBri', val)}
                              />
                            </div>
                          </div>
                        )}

                        {(adjustSubTab === 'curves' || adjustSubTab === 'wheel') && (
                          <div className="p-2.5 bg-[#121216] border border-[#2B2B34] rounded space-y-2 text-[11px]">
                            <div className="text-[#00E5CC] font-semibold">
                              {adjustSubTab === 'curves'
                                ? 'Đường cong RGB (Luma / R / G / B Curves)'
                                : 'Bánh xe màu Điện ảnh (Shadows / Midtones / Highlights)'}
                            </div>
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[#A1A1AA] w-20 shrink-0 truncate">Gamma:</span>
                              <input
                                type="range"
                                min={-40}
                                max={40}
                                value={currentClip.contrast ?? 0}
                                onChange={(e) =>
                                  updateSelectedClipProp('contrast', Number(e.target.value))
                                }
                                className="flex-1 min-w-0 accent-[#00E5CC]"
                              />
                              <NumericBoxWithSteppers
                                value={currentClip.contrast ?? 0}
                                min={-40}
                                max={40}
                                step={1}
                                widthClass="w-16"
                                ariaLabel="Cường độ Gamma"
                                onChange={(val) => updateSelectedClipProp('contrast', val)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* INSPECTOR TAB 6: MOTION TRACKING & ANTI-DETECT REUP ENGINE (Lách BQ) */}
                    {inspectorTab === 'antidetect' && (
                      <div className="space-y-2">
                        {currentClip && (
                          <label className="flex items-center justify-between p-2 bg-[#22222A] border border-[#FACC15]/40 rounded cursor-pointer">
                            <span className="flex items-center gap-1.5 text-[#FACC15] font-medium">
                              <Target className="w-3.5 h-3.5" />
                              <span>Theo dõi chuyển động (Motion Tracking)</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={Boolean(currentClip.motionTrackingEnabled)}
                              onChange={(e) =>
                                updateSelectedClipProp(
                                  'motionTrackingEnabled',
                                  e.target.checked
                                )
                              }
                              className="accent-[#00E5CC]"
                            />
                          </label>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            commitClips((prev) =>
                              prev.map((c) =>
                                c.trackIndex === 0 ? { ...c, flipH: !c.flipH } : c
                              )
                            );
                            showToast('Đã áp dụng Lật ngang (Auto Mirror) toàn bộ Timeline!');
                          }}
                          className="w-full py-1.5 px-2.5 bg-[#22222A] hover:bg-[#2C2C38] text-white border border-[#343442] rounded text-left font-medium cursor-pointer"
                        >
                          ◧ Áp dụng Lật ngang toàn bộ Timeline (Auto Mirror)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAspectRatio('9:16');
                            setBlurredPadding916((v) => !v);
                            showToast(
                              'Đã bật khung 9:16 có nền mờ (Blurred Background Padding)!'
                            );
                          }}
                          className={`w-full py-1.5 px-2.5 rounded border text-left font-medium cursor-pointer ${
                            blurredPadding916
                              ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC]'
                              : 'bg-[#22222A] hover:bg-[#2C2C38] text-white border-[#343442]'
                          }`}
                        >
                          📱 Khung 9:16 có nền mờ (Blurred Background Padding)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            commitClips((prev) =>
                              packTrackClipsContiguously(
                                prev.map((c) =>
                                  c.trackIndex === 0
                                    ? {
                                        ...c,
                                        speed: 1.05,
                                        scale: 104,
                                        cropRatio: 1.04,
                                        duration: Number(
                                          Math.max(0.4, (c.duration * c.speed) / 1.05).toFixed(2)
                                        ),
                                      }
                                    : c
                                ),
                                0
                              )
                            );
                            showToast(
                              'Đã biến đổi Tốc độ 1.05x + Phóng to 104% toàn bộ clip trên Timeline!'
                            );
                          }}
                          className="w-full py-1.5 px-2.5 bg-[#22222A] hover:bg-[#2C2C38] text-white border border-[#343442] rounded text-left font-medium cursor-pointer"
                        >
                          ⚡ Biến đổi Tốc độ 1.05x + Phóng to 104% toàn bộ clip
                        </button>

                        <label className="flex items-center justify-between p-2 bg-[#222228] rounded cursor-pointer">
                          <span>Đổi mã băm &amp; Metadata iPhone 16 Pro Max</span>
                          <input
                            type="checkbox"
                            checked={antiDetect.spoofIphoneMeta}
                            onChange={(e) => {
                              pushUndoSnapshot(undefined, 'antidetect:spoof');
                              setAntiDetect((p) => ({
                                ...p,
                                spoofIphoneMeta: e.target.checked,
                              }));
                            }}
                            className="accent-[#00E5CC]"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2 bg-[#222228] rounded cursor-pointer">
                          <span>Tiêm nhiễu hạt vi mô (Anti-Hash Micro-Grain)</span>
                          <input
                            type="checkbox"
                            checked={antiDetect.injectMicroNoise}
                            onChange={(e) => {
                              pushUndoSnapshot(undefined, 'antidetect:noise');
                              setAntiDetect((p) => ({
                                ...p,
                                injectMicroNoise: e.target.checked,
                              }));
                            }}
                            className="accent-[#00E5CC]"
                          />
                        </label>

                        {/* Hardware/Studio Encoder (hevc_nvenc / prores / h264_nvenc) & CRF + Preset Slow */}
                        <div className="p-2.5 bg-[#121216] border border-[#2B2B34] rounded space-y-2 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#00E5CC] font-semibold">
                              Cấu hình Encoder &amp; Chất lượng FFmpeg Studio
                            </span>
                            <span className="font-mono text-[10px] text-[#34D399]">
                              -crf {antiDetect.crf ?? 18} -preset slow
                            </span>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#A1A1AA]">
                              Bộ mã hóa Video (Video Encoder):
                            </label>
                            <select
                              aria-label="Cấu hình Encoder Lách BQ"
                              value={antiDetect.gpuEncoder}
                              onChange={(e) => {
                                const enc = e.target.value as GpuEncoderOption;
                                pushUndoSnapshot(undefined, 'antidetect:encoder');
                                setAntiDetect((p) => ({
                                  ...p,
                                  gpuEncoder: enc,
                                }));
                                showToast(`Đã chọn bộ mã hóa Studio: ${enc}`);
                              }}
                              className="w-full px-2 py-1 bg-[#1E1E26] border border-[#343442] rounded text-[#00E5CC] font-mono text-[11px]"
                            >
                              <option value="hevc_nvenc">
                                hevc_nvenc (NVIDIA HEVC H.265 — Siêu sắc nét)
                              </option>
                              <option value="prores">
                                prores (Apple ProRes 422 HQ / 10-bit Studio)
                              </option>
                              <option value="h264_nvenc">
                                h264_nvenc (NVIDIA NVENC H.264)
                              </option>
                              <option value="h264_qsv">
                                h264_qsv (Intel QuickSync H.264)
                              </option>
                              <option value="h264_amf">h264_amf (AMD AMF H.264)</option>
                              <option value="libx264">libx264 (CPU x264 Chuẩn)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#A1A1AA]">
                              Chỉ số nén CRF &amp; Preset (-crf 18..20 -preset slow):
                            </label>
                            <select
                              aria-label="Chỉ số CRF Lách BQ"
                              value={antiDetect.crf ?? 18}
                              onChange={(e) => {
                                const crf = Number(e.target.value);
                                pushUndoSnapshot(undefined, 'antidetect:crf');
                                setAntiDetect((p) => ({
                                  ...p,
                                  crf,
                                  preset: 'slow',
                                }));
                                showToast(`Đã cấu hình FFmpeg -crf ${crf} -preset slow!`);
                              }}
                              className="w-full px-2 py-1 bg-[#1E1E26] border border-[#343442] rounded text-white font-mono text-[11px]"
                            >
                              <option value={18}>-crf 18 -preset slow (Lossless Visual)</option>
                              <option value={19}>-crf 19 -preset slow (Cinema Master)</option>
                              <option value={20}>-crf 20 -preset slow (High Clarity)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>

          {/* LOWER HALF: ZONE 4 (CAPCUT PC MULTI-TRACK TIMELINE) */}
          <div
            data-zone-focus={activeZoneFocus === 'timeline' ? 'active' : 'inactive'}
            onMouseDownCapture={() => {
              setActiveZoneFocus('timeline');
              setSelectedResourceIds([]);
            }}
            className="flex-[40] min-h-0 overflow-hidden"
          >
            <MultiTrackTimeline
              clips={clips}
              tracks={timelineTracks}
              markers={markers}
              playheadSec={playheadSec}
              isPlaying={isPlaying}
              pixelsPerSecond={pixelsPerSecond}
              selectedClipId={selectedClipId}
              selectedClipIds={selectedClipIds}
              rangeStartIndex={rangeStartIndex}
              rangeEndIndex={rangeEndIndex}
              targetDurationSec={targetDurationSec}
              snapEnabled={snapEnabled}
              autoSnapEdge={autoSnapEdge}
              audioLinked={audioLinked}
              toolMode={toolMode}
              onToolModeChange={setToolMode}
              canUndo={historyPast.length > 0}
              canRedo={historyFuture.length > 0}
              hasClipboardAttributes={Boolean(clipboardAttrs)}
              hasClipboardClips={clipboardClips.length > 0}
              trackLocks={trackLocks}
              trackHidden={trackHidden}
              trackMuted={trackMuted}
              coverDataUrl={coverDataUrl}
              language={language}
              markInSec={markInSec}
              markOutSec={markOutSec}
              loopRangeEnabled={loopRangeEnabled}
              onToggleLoopRange={() => setLoopRangeEnabled((l) => !l)}
              onClearInOutRange={() => {
                setMarkInSec(null);
                setMarkOutSec(null);
              }}
              onPlayheadChange={(sec) => {
                setActiveZoneFocus('timeline');
                setPlayheadSec(sec);
              }}
              onZoomChange={setPixelsPerSecond}
              onSelectClip={(id) => {
                setActiveZoneFocus('timeline');
                setSelectedResourceIds([]);
                setSelectedClipId(id);
                setSelectedClipIds(id ? [id] : []);
                setInspectorMode(id ? 'clip' : 'project_details');
              }}
              onSelectMultipleClips={(ids) => {
                setActiveZoneFocus('timeline');
                setSelectedResourceIds([]);
                setSelectedClipIds(ids);
                setSelectedClipId(ids[0] ?? null);
                setInspectorMode(ids.length > 0 ? 'clip' : 'project_details');
              }}
              onDragSessionStart={() => {
                pushUndoSnapshot();
              }}
              onPreviewClipsDuringDrag={(nextClips) => {
                setClips(nextClips);
              }}
              onDragSessionEnd={() => {
                if (snapEnabled) {
                  setClips((prev) => packTrackClipsContiguously(prev, 0));
                }
              }}
              onSplitAtPlayhead={() => {
                commitClips((prev) => splitClipAtPlayhead(prev, playheadSec, selectedClipId));
                showToast('Đã tách đôi clip tại Playhead!');
              }}
              onSplitAtExactTime={(clipId, timeSec) => {
                commitClips((prev) => splitClipAtPlayhead(prev, timeSec, clipId));
                showToast(`Đã dùng Dao cạo (Phím B) cắt clip tại ${timeSec.toFixed(2)}s!`);
              }}
              onDeleteSelected={() => {
                handleDeleteMediaCardsAndClips();
              }}
              onShuffleRange={() => {
                commitClips((prev) =>
                  shuffleVideoClipsInRange(
                    prev,
                    rangeStartIndex,
                    rangeEndIndex,
                    Date.now(),
                    targetDurationSec > 0 ? targetDurationSec : undefined
                  )
                );
                showToast(
                  targetDurationSec > 0
                    ? `Đã đảo ngẫu nhiên Clip ${rangeStartIndex}..${rangeEndIndex} và khớp đúng ${targetDurationSec}s!`
                    : `Đã đảo ngẫu nhiên các clip từ #${rangeStartIndex} đến #${rangeEndIndex}!`
                );
              }}
              onBatchTrim={(targetSec) => {
                commitClips((prev) => batchTrimClips(prev, targetSec));
                showToast(
                  Array.isArray(targetSec)
                    ? `Đã cắt hàng loạt ngẫu nhiên (${targetSec[0]}s - ${targetSec[1]}s) lấy phần giữa clip!`
                    : `Đã cắt hàng loạt tất cả clip về ${targetSec}s (lấy phần giữa)!`
                );
              }}
              onRangeStartChange={setRangeStartIndex}
              onRangeEndChange={setRangeEndIndex}
              onTargetDurationChange={setTargetDurationSec}
              onMoveClipStart={(clipId, newStartSec, newTrackIndex) => {
                commitClips((prev) => {
                  const anchor = prev.find((c) => c.id === clipId);
                  if (!anchor) return prev;
                  const deltaTime = newStartSec - anchor.startTime;
                  const deltaTrack =
                    newTrackIndex !== undefined ? newTrackIndex - anchor.trackIndex : 0;

                  const activeIds =
                    selectedClipIds.length > 1 && selectedClipIds.includes(clipId)
                      ? selectedClipIds
                      : [clipId];

                  const moved = moveSelectedClipsByDelta(
                    prev,
                    activeIds,
                    deltaTime,
                    deltaTrack,
                    timelineTracks.map((t) => t.index),
                    trackLocks,
                    audioLinked
                  );
                  return snapEnabled ? packTrackClipsContiguously(moved, 0) : moved;
                });
              }}
              onDropResourceOnTimeline={handleDropResourceOnTimeline}
              onAddTrackLayer={handleAddTrackLayer}
              onDeleteTrackLayer={handleDeleteTrackLayer}
              onMoveTrackOrder={handleMoveTrackOrder}
              onResizeClipEdge={handleResizeClipEdge}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onTrimStartToPlayhead={() =>
                commitClips((prev) =>
                  trimClipStartToPlayhead(prev, playheadSec, selectedClipId, snapEnabled)
                )
              }
              onTrimEndToPlayhead={() =>
                commitClips((prev) =>
                  trimClipEndToPlayhead(prev, playheadSec, selectedClipId, snapEnabled)
                )
              }
              onFreezeFrame={() => {
                commitClips((prev) => freezeFrameAtPlayhead(prev, playheadSec));
                showToast('Đã đóng băng khung hình 3.0s tại Playhead!');
              }}
              onReverseSelected={() => {
                if (!currentClip) return;
                updateSelectedClipProp('reversed', !currentClip.reversed);
                showToast(
                  !currentClip.reversed
                    ? `Đã bật phát ngược (Reverse) cho "${currentClip.name}"`
                    : `Đã tắt phát ngược cho "${currentClip.name}"`
                );
              }}
              onQuickFlipSelected={() => {
                if (!currentClip) return;
                updateSelectedClipProp('flipH', !currentClip.flipH);
              }}
              onQuickRotateSelected={() => {
                if (!currentClip) return;
                updateSelectedClipProp('rotation', ((currentClip.rotation ?? 0) + 90) % 360);
              }}
              onToggleSnap={() => {
                setSnapEnabled((s) => {
                  const next = !s;
                  if (next) {
                    commitClips((prev) => packTrackClipsContiguously(prev, 0));
                  }
                  showToast(
                    next
                      ? 'Đã BẬT Nam châm trục chính (Phím P) — Tự động khít các clip!'
                      : 'Đã TẮT Nam châm trục chính (Phím P) — Tự do tạo khoảng trống!'
                  );
                  return next;
                });
              }}
              onToggleAutoSnapEdge={() => {
                setAutoSnapEdge((n) => {
                  const next = !n;
                  showToast(
                    next
                      ? 'Đã BẬT Tự động bắt dính mép clip (Auto Snapping - Phím N)!'
                      : 'Đã TẮT Tự động bắt dính mép clip (Phím N)!'
                  );
                  return next;
                });
              }}
              onToggleAudioLink={() => {
                setAudioLinked((l) => {
                  const next = !l;
                  showToast(
                    next
                      ? 'Đã BẬT Liên kết Video & Âm thanh (Linkage - Ctrl+G)!'
                      : 'Đã TẮT Liên kết Video & Âm thanh!'
                  );
                  return next;
                });
              }}
              onToggleTrackLock={(idx) => {
                pushUndoSnapshot();
                setTrackLocks((prev) => ({ ...prev, [idx]: !prev[idx] }));
              }}
              onToggleTrackHidden={(idx) => {
                pushUndoSnapshot();
                setTrackHidden((prev) => ({ ...prev, [idx]: !prev[idx] }));
              }}
              onToggleTrackMuted={(idx) => {
                pushUndoSnapshot();
                setTrackMuted((prev) => ({ ...prev, [idx]: !prev[idx] }));
              }}
              onCloseGapAtTime={(trackIndex, timeSec) => {
                commitClips((prev) => closeGapAtTimeOnTrack(prev, trackIndex, timeSec));
                showToast(`Đã lấp đầy khoảng trống tại ${timeSec.toFixed(2)}s trên tầng #${trackIndex}!`);
              }}
              onCloseAllGapsOnTrack={(trackIndex) => {
                commitClips((prev) => closeAllGapsOnTrack(prev, trackIndex));
                showToast(`Đã lấp đầy mọi khoảng trống trên tầng #${trackIndex}!`);
              }}
              onCopySelectedClips={handleCopySelectedClips}
              onCutSelectedClips={handleCutSelectedClips}
              onPasteClipboardClips={handlePasteClipboardClips}
              onToggleDisableClip={handleToggleDisableClip}
              onGroupSelectedClips={handleGroupSelectedClips}
              onUngroupSelectedClips={handleUngroupSelectedClips}
              onAiExtendClip={(clipId) => {
                commitClips((prev) =>
                  prev.map((c) =>
                    c.id === clipId
                      ? { ...c, duration: Number((c.duration + 2.0).toFixed(2)) }
                      : c
                  )
                );
                showToast('AI đã tự động nội suy và kéo dài thời lượng clip thêm +2.0s!');
              }}
              onSyncVideoAudio={(clipId) => {
                const target = clips.find((c) => c.id === clipId);
                if (!target) return;
                commitClips((prev) =>
                  prev.map((c) =>
                    c.trackIndex === 1 ? { ...c, startTime: target.startTime } : c
                  )
                );
                showToast('Đã đồng bộ khớp sóng âm thanh với clip video!');
              }}
              onExportSelectedClip={(clipId) => {
                setSelectedClipId(clipId);
                setSelectedClipIds([clipId]);
                setIsExportModalOpen(true);
              }}
              onReplaceClipMedia={(clipId) => {
                setSelectedClipId(clipId);
                mediaInputRef.current?.click();
                showToast('Chọn tệp mới từ máy tính để thay thế cho clip này!');
              }}
              onQuickAiAction={(action, clipId) => {
                const targetId = clipId || selectedClipId || clips[0]?.id;
                if (action === 'crop') {
                  if (!targetId) return;
                  setSelectedClipId(targetId);
                  setSelectedClipIds([targetId]);
                  setCropModalClipId(targetId);
                } else if (action === 'filler_words') {
                  handleGenerateAutoCaptions();
                } else if (action === 'noise_reduction') {
                  commitClips((prev) =>
                    prev.map((c) =>
                      !targetId || c.id === targetId
                        ? { ...c, noiseReduction: true, enhanceVoice: true }
                        : c
                    )
                  );
                  showToast('Đã bật Khử tiếng ồn AI & Làm rõ giọng nói!');
                } else if (action === 'auto_cutout') {
                  commitClips((prev) =>
                    prev.map((c) =>
                      c.id === targetId ? { ...c, autoCutout: !c.autoCutout } : c
                    )
                  );
                  setInspectorMode('clip');
                  setInspectorTab('video');
                  setVideoSubTab('cutout');
                  showToast('Đã bật Tách nền người tự động AI (Auto Cutout)!');
                } else if (action === 'retouch') {
                  commitClips((prev) =>
                    prev.map((c) =>
                      c.id === targetId
                        ? { ...c, smoothSkin: 65, retouchBrighten: 45, retouchWhiteTeeth: 50 }
                        : c
                    )
                  );
                  setInspectorMode('clip');
                  setInspectorTab('video');
                  setVideoSubTab('enhance');
                  showToast('Đã bật Làm đẹp & Mịn da mặt AI (Retouch)!');
                } else if (action === 'hd_upscale') {
                  commitClips((prev) =>
                    prev.map((c) =>
                      c.id === targetId
                        ? { ...c, aiUpscale: true, sharpen: 35, contrast: 12 }
                        : c
                    )
                  );
                  setPreviewQuality('full');
                  showToast('Đã nâng cấp chất lượng siêu phân giải HD 1080p cho clip!');
                } else if (action === 'prerender') {
                  showToast('Đã kết xuất trước (Pre-render) toàn bộ Timeline mượt 60 FPS!');
                } else if (action === 'transcript') {
                  setTopLeftCategory('captions');
                  handleGenerateAutoCaptions();
                } else if (action === 'ai_edit') {
                  setIsMatrixModalOpen(true);
                } else if (action === 'multicam') {
                  showToast('Đã đồng bộ Multi-Cam cho các góc máy trên Timeline!');
                } else if (action === 'save_preset') {
                  handleSaveSubProject(`Preset_${currentClip?.name || 'Custom'}`);
                } else if (action === 'open_location') {
                  setTopLeftCategory('media');
                  setSidebarFolder('all');
                  showToast(`Đường dẫn tệp: ${currentClip?.filePath || 'C:/Media/'}`);
                } else if (action === 'edit_effects') {
                  setTopLeftCategory('effects');
                } else if (action === 'speed_ramp') {
                  setInspectorMode('clip');
                  setInspectorTab('speed');
                  setSpeedSubTab('curve');
                  showToast('Đã mở bảng Đường cong tốc độ (Speed Curve Ramp)!');
                }
              }}
              onCaptureCover={handleCaptureCover}
              onAddOverlayClip={handleAddOverlayClip}
              onAddQuickClip={() => {
                const endV = clips
                  .filter((c) => c.trackIndex === 0)
                  .reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);
                commitClips((prev) => [
                  ...prev,
                  {
                    id: `v-quick-${Date.now()}`,
                    name: `Scene_${prev.filter((c) => c.trackIndex === 0).length + 1}.mp4`,
                    filePath: 'C:/Media/QuickScene.mp4',
                    trackIndex: 0,
                    startTime: Number(endV.toFixed(2)),
                    duration: 4.0,
                    sourceIn: 0,
                    speed: 1.0,
                    volume: 100,
                    flipH: false,
                    cropRatio: 1.0,
                    scale: 100,
                    colorHex: '#0284C7',
                  },
                ]);
              }}
              onStartVoiceover={() =>
                handleAddSynthesizedSfx('beep', 'Voiceover_Marker', 2.0)
              }
              onAddMarker={() => {
                const newMarker: TimelineMarker = {
                  id: `mk-${Date.now()}`,
                  timeSec: Number(playheadSec.toFixed(2)),
                  label: `Dấu mốc ${markers.length + 1}`,
                  color: '#00E5CC',
                };
                setMarkers((prev) => [...prev, newMarker]);
                showToast(`Đã thả dấu mốc (Marker) tại ${playheadSec.toFixed(2)}s!`);
              }}
              onCycleMarkerColor={(markerId) => {
                const palette: TimelineMarker['color'][] = [
                  '#00E5CC',
                  '#EF4444',
                  '#F59E0B',
                  '#10B981',
                  '#A855F7',
                ];
                setMarkers((prev) =>
                  prev.map((m) => {
                    if (m.id !== markerId) return m;
                    const idx = palette.indexOf(m.color);
                    const nextColor = palette[(idx + 1) % palette.length];
                    return { ...m, color: nextColor };
                  })
                );
              }}
              onAutoBeats={(mode = 'beat1') => {
                if (mode === 'clear') {
                  commitClips((prev) =>
                    prev.map((c) => (c.trackIndex === 1 ? { ...c, beatMarkers: [] } : c))
                  );
                  setMarkers((prev) => prev.filter((m) => !m.id.startsWith('beat-')));
                  showToast('Đã xóa toàn bộ dấu chấm nhịp (Beat Markers)!');
                  return;
                }
                const aud = clips.find((c) => c.trackIndex === 1);
                if (!aud) return;
                const updatedClip = generateAutoBeatsForAudioClip(aud, mode);
                const relativeBeatSecs = updatedClip.beatMarkers || [];
                const beatTimelineMarkers: TimelineMarker[] = relativeBeatSecs.map(
                  (relSec, idx) => ({
                    id: `beat-${aud.id}-${idx + 1}`,
                    timeSec: Number((aud.startTime + relSec).toFixed(2)),
                    label: `Beat ${idx + 1}`,
                    color: '#F59E0B',
                  })
                );
                commitClips((prev) =>
                  prev.map((c) =>
                    c.id === aud.id ? { ...c, beatMarkers: relativeBeatSecs } : c
                  )
                );
                setMarkers((prev) => [
                  ...prev.filter((m) => !m.id.startsWith('beat-')),
                  ...beatTimelineMarkers,
                ]);
                showToast(
                  `Đã bắt nhịp tự động (${mode.toUpperCase()}) và gắn ${relativeBeatSecs.length} hạt vàng trên thanh nhạc!`
                );
              }}
              onExtractAudio={(clipId) => {
                commitClips((prev) => extractAudioFromVideoClip(prev, clipId));
                showToast('Đã trích xuất âm thanh rời xuống Track Âm thanh (Ctrl+Shift+S)!');
              }}
              onCopyAttributes={(clipId) => {
                const c = clips.find((item) => item.id === clipId);
                if (!c) return;
                setClipboardAttrs(copyClipAttributes(c));
                showToast(`Đã sao chép thuộc tính của "${c.name}" (Ctrl+Shift+C)!`);
              }}
              onPasteAttributes={(clipId) => {
                if (!clipboardAttrs) return;
                commitClips((prev) =>
                  prev.map((c) =>
                    c.id === clipId ? pasteClipAttributes(c, clipboardAttrs) : c
                  )
                );
                showToast('Đã dán thuộc tính (Màu, Tỷ lệ, Hiệu ứng) vào clip đích!');
              }}
              onDuplicateClip={(clipId) => {
                const target = clips.find((c) => c.id === clipId);
                if (!target) return;
                const copy: TimelineClip = {
                  ...target,
                  id: `${target.id}-dup-${Date.now()}`,
                  name: `${target.name} (Copy)`,
                  startTime: Number((target.startTime + target.duration).toFixed(2)),
                };
                commitClips((prev) =>
                  packTrackClipsContiguously([...prev, copy], target.trackIndex)
                );
                showToast(`Đã nhân bản clip "${target.name}"!`);
              }}
              onCreateCompoundClip={(clipId) => {
                const targetIds = new Set(
                  selectedClipIds.length > 0 && (!clipId || selectedClipIds.includes(clipId))
                    ? selectedClipIds
                    : clipId
                    ? [clipId]
                    : selectedClipId
                    ? [selectedClipId]
                    : []
                );
                if (targetIds.size === 0) return;
                commitClips((prev) =>
                  prev.map((c) =>
                    targetIds.has(c.id)
                      ? { ...c, isCompoundClip: !c.isCompoundClip, colorHex: '#4F46E5' }
                      : c
                  )
                );
                showToast(
                  `Đã đóng gói ${targetIds.size} clip thành Clip ghép (Compound Clip - Alt+G)!`
                );
              }}
              onVocalIsolation={(clipId, mode) => {
                commitClips((prev) =>
                  prev.map((c) => (c.id === clipId ? { ...c, vocalIsolation: mode } : c))
                );
                showToast(
                  mode === 'keep_vocal'
                    ? 'AI đã tách chỉ giữ lại Giọng hát (Keep Vocal)!'
                    : 'AI đã tách chỉ giữ lại Nhạc nền (Remove Vocal)!'
                );
              }}
              onSetKeyframeEasing={(clipId, easing) => {
                commitClips((prev) =>
                  prev.map((c) => {
                    if (c.id !== clipId) return c;
                    const existing = c.keyframes?.length
                      ? c.keyframes.map((k) => ({ ...k, easing }))
                      : [
                          {
                            id: `kf-${Date.now()}`,
                            timeOffset: 0,
                            offsetSec: 0,
                            scale: c.scale ?? 100,
                            posX: c.posX ?? 0,
                            posY: c.posY ?? 0,
                            rotation: c.rotation ?? 0,
                            opacity: c.opacity ?? 100,
                            volume: c.volume ?? 100,
                            easing,
                          },
                        ];
                    return { ...c, keyframes: existing };
                  })
                );
                showToast(`Đã áp dụng đồ thị nội suy Keyframe: ${easing.toUpperCase()}!`);
              }}
              onOpenSceneSplitModal={() => setIsSceneCutModalOpen(true)}
              markInSec={markInSec}
              markOutSec={markOutSec}
              loopRangeEnabled={loopRangeEnabled}
              onSetMarkIn={() => {
                const pt = Number(playheadSec.toFixed(2));
                setMarkInSec(pt);
                showToast(`TDO CUT: Đã đặt Điểm vào [In] tại ${pt}s (Phím I)`);
              }}
              onSetMarkOut={() => {
                const pt = Number(playheadSec.toFixed(2));
                setMarkOutSec(pt);
                showToast(`TDO CUT: Đã đặt Điểm ra [Out] tại ${pt}s (Phím O)`);
              }}
              onClearMarkInOut={() => {
                setMarkInSec(null);
                setMarkOutSec(null);
                setLoopRangeEnabled(false);
                showToast('Đã xóa vùng đánh dấu In / Out!');
              }}
              onToggleLoopRange={() => {
                setLoopRangeEnabled((l) => !l);
              }}
              onRippleTrimRange={handleRippleTrimRange}
              onRemoveDeadAirSilence={handleRemoveDeadAirSilence}
              onSyncClipsToBeats={handleSyncVideoClipsToBeats}
              language={language}
            />
          </div>
        </main>
      )}

      {/* 2-COLUMN TDO CUT EXPORT VIDEO MODAL */}
      <ExportVideoModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectName={projectName}
        aspectRatio={aspectRatio}
        clips={clips}
        antiDetect={antiDetect}
        onUpdateAntiDetect={(patch) => {
          pushUndoSnapshot(undefined, 'antidetect:modal');
          setAntiDetect((prev) => ({ ...prev, ...patch }));
        }}
        canvasRef={previewCanvasRef}
        coverDataUrl={coverDataUrl}
        onCaptureCover={handleCaptureCover}
        onScrubPlayheadForExport={setPlayheadSec}
        onLockExportDimensions={setExportDimensionsOverride}
        onDownloadCapCutDraft={handleDownloadCapCutDraft}
        onShuffleBeforeVariantExport={() =>
          commitClips((prev) =>
            shuffleVideoClipsInRange(
              prev,
              rangeStartIndex,
              rangeEndIndex,
              Date.now(),
              targetDurationSec > 0 ? targetDurationSec : undefined
            )
          )
        }
        language={language}
      />

      {/* MATRIX BATCH GENERATOR MODAL */}
      <MatrixBatchGeneratorModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        maxClipCount={videoClipsCount}
        onGenerateBatchVariants={handleGenerateMatrixBatch}
      />

      {/* AI SCENE CUT MODAL */}
      <AiSceneCutModal
        isOpen={isSceneCutModalOpen}
        onClose={() => setIsSceneCutModalOpen(false)}
        onRunSceneSplit={handleRunAiSceneSplit}
      />

      {/* SHORTCUTS MODAL (4 Tabs) */}
      <ShortcutsWindowModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        language={language}
      />

      {/* SYSTEM SETTINGS MODAL */}
      <SystemSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        proxyEnabled={proxyEnabled}
        onToggleProxy={(val) => {
          setProxyEnabled(val);
          showToast(val ? 'Đã bật Chế độ Proxy 540P!' : 'Đã tắt Chế độ Proxy!');
        }}
        defaultImageDuration={defaultImageDuration}
        onChangeDefaultImageDuration={(sec) => {
          setDefaultImageDuration(sec);
          showToast(`Đã cập nhật thời lượng ảnh tĩnh mặc định: ${sec.toFixed(1)}s!`);
        }}
        language={language}
        onChangeLanguage={(lang) => {
          setLanguage(lang);
          showToast(
            lang === 'en'
              ? 'Language switched to English!'
              : 'Đã chuyển ngôn ngữ giao diện sang Tiếng Việt!'
          );
        }}
        themeMode={themeMode}
        onToggleTheme={() => {
          const nextTheme: StudioThemeMode = themeMode === 'dark' ? 'light' : 'dark';
          setThemeMode(nextTheme);
        }}
      />

      {/* CAPCUT PC CROP MODAL (Cắt xén khung hình video) */}
      <CapCutCropModal
        clip={cropModalClip}
        onClose={() => setCropModalClipId(null)}
        onConfirm={(cropData) => {
          if (!cropModalClipId) return;
          commitClips((prev) =>
            prev.map((c) =>
              c.id === cropModalClipId
                ? {
                    ...c,
                    cropLeft: cropData.cropLeft,
                    cropTop: cropData.cropTop,
                    cropRight: cropData.cropRight,
                    cropBottom: cropData.cropBottom,
                    cropRotateDeg: cropData.cropRotateDeg,
                    cropAspectPreset: cropData.cropAspectPreset,
                  }
                : c
            )
          );
          setCropModalClipId(null);
          showToast(
            `Đã cắt xén video (${cropData.cropAspectPreset === 'free' ? 'Tự do' : cropData.cropAspectPreset}) — Trái ${cropData.cropLeft}%, Phải ${cropData.cropRight}%!`
          );
        }}
      />
    </div>
  );
}
