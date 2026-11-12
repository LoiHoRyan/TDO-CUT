/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  Play,
  Pause,
  Undo2,
  Redo2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Scissors,
  Music,
  Type,
  Smile,
  Film,
  Sparkles,
  ArrowRightLeft,
  Square,
  Sliders,
  Filter,
  Check,
  ChevronLeft,
  Trash2,
  Crop,
  FlipHorizontal2,
  Wand2,
  Search,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  Gauge,
  Layers,
  FolderOpen,
  Volume1,
  Subtitles,
  Split,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  TimelineClip,
  TimelineTrackDef,
  TimelineDragPayload,
  TransitionPresetType,
  TransitionType,
  FilterPresetType,
  VisualEffectType,
  StudioThemeMode,
  AppLanguage,
  formatTimecode,
  WORLD_FLAG_STICKERS,
  FACE_ICON_STICKERS,
  TREND_EMOJI_STICKERS,
  GRAPHIC_BADGE_STICKERS,
  StickerCatalogItem,
  getFlagGraphicDataUrl,
  extractFlagIsoCode,
  findGraphicBadgeByIconOrText,
} from '../utils/timelineEngine';
import {
  SFX_LIBRARY,
  SfxLibraryItem,
  webAudioEngine,
} from '../utils/webAudioSynthesizer';
import {
  AspectRatioOption,
  PreviewQualityOption,
} from './VideoPreviewCanvas';

export interface MobileWorkstationProps {
  clips: TimelineClip[];
  timelineTracks: TimelineTrackDef[];
  playheadSec: number;
  totalTimelineDuration: number;
  isPlaying: boolean;
  aspectRatio: AspectRatioOption;
  previewQuality: PreviewQualityOption;
  selectedClipId: string | null;
  selectedClipIds: string[];
  currentClip?: TimelineClip;
  historyPastLength: number;
  historyFutureLength: number;
  trackHidden: Record<number, boolean>;
  trackMuted: Record<number, boolean>;
  coverDataUrl?: string;
  themeMode: StudioThemeMode;
  language: AppLanguage;
  projectName: string;
  onPlayheadChange: (sec: number) => void;
  onTogglePlay: () => void;
  onStepFrame: (delta: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSplitClip: () => void;
  onTrimStartToPlayhead?: () => void;
  onTrimEndToPlayhead?: () => void;
  onDeleteSelected: () => void;
  onSelectClip: (id: string | null) => void;
  onUpdateClipProp: (key: string, value: any, targetClipId?: string) => void;
  onFlipHorizontal: () => void;
  onSetAspectRatio: (ratio: AspectRatioOption) => void;
  onSetPreviewQuality: (q: PreviewQualityOption) => void;
  onToggleTheme: () => void;
  onExitToHome: () => void;
  onOpenExport: () => void;
  onAddMedia: (targetType?: 'video' | 'image' | 'audio' | 'all') => void;
  onDropResource: (
    payload: TimelineDragPayload,
    trackIdx: number,
    dropTimeSec: number,
    targetClipId?: string
  ) => void;
  onApplyTransitionToAll: (type: TransitionType, dur: number) => void;
  onOpenCropModal: () => void;
  onToggleTrackMute: (trackIdx: number) => void;
  onCaptureCover?: () => void;
  renderPlayer: () => React.ReactNode;
}

export type MobileDrawerType =
  | 'edit'
  | 'audio'
  | 'text'
  | 'stickers'
  | 'overlay'
  | 'effects'
  | 'transitions'
  | 'ratio'
  | 'filters'
  | 'adjust'
  | 'speed'
  | 'volume'
  | 'animation'
  | null;

// Transition Catalog Definitions with Category & Color Swatches
const MOBILE_TRANSITION_ITEMS: Array<{
  id: TransitionPresetType;
  label: string;
  category: 'hottrend' | 'overlay' | 'camera' | 'fade' | 'basic';
  dur: number;
  icon: string;
  swatch: string;
}> = [
  { id: 'none', label: 'Không chuyển tiếp', category: 'basic', dur: 0.5, icon: '⊘', swatch: 'linear-gradient(135deg, #181920 0%, #252834 100%)' },
  // Hottrend
  { id: 'zoom_in', label: 'Bóng bóng mờ (Zoom In)', category: 'hottrend', dur: 0.6, icon: '🔍', swatch: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)' },
  { id: 'white_flash', label: 'Chớp sáng (White Flash)', category: 'hottrend', dur: 0.4, icon: '⚡', swatch: 'linear-gradient(135deg, #FEF08A 0%, #F59E0B 50%, #EF4444 100%)' },
  { id: 'glitch', label: 'Nhiễu hạt (Glitch FX)', category: 'hottrend', dur: 0.5, icon: '👾', swatch: 'linear-gradient(135deg, #052E16 0%, #16A34A 50%, #4ADE80 100%)' },
  { id: 'spin', label: 'Xoay tròn 360°', category: 'hottrend', dur: 0.7, icon: '🔄', swatch: 'linear-gradient(135deg, #311042 0%, #7E22CE 50%, #C084FC 100%)' },
  { id: 'whip_pan', label: 'Lia máy (Whip Pan)', category: 'hottrend', dur: 0.4, icon: '💨', swatch: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 50%, #38BDF8 100%)' },
  // Lớp phủ (Overlay)
  { id: 'cross_dissolve', label: 'Hòa tan chéo (Cross)', category: 'overlay', dur: 0.8, icon: '🌫️', swatch: 'linear-gradient(135deg, #0F172A 0%, #334155 50%, #64748B 100%)' },
  { id: 'black_fade', label: 'Mờ đen (Dip to Black)', category: 'overlay', dur: 0.7, icon: '⬛', swatch: 'linear-gradient(135deg, #000000 0%, #18181B 100%)' },
  { id: 'overlay', label: 'Chồng lớp (Overlay Blend)', category: 'overlay', dur: 0.6, icon: '🔲', swatch: 'linear-gradient(135deg, #1E293B 0%, #0EA5E9 100%)' },
  { id: 'wipe_split', label: 'Quét tách đôi', category: 'overlay', dur: 0.5, icon: '↔️', swatch: 'linear-gradient(135deg, #701A75 0%, #D946EF 100%)' },
  { id: 'clock_sweep', label: 'Kim đồng hồ quay', category: 'overlay', dur: 0.8, icon: '⏱️', swatch: 'linear-gradient(135deg, #831843 0%, #F43F5E 100%)' },
  // Chuyển động camera
  { id: 'pull_out', label: 'Thu xa (Pull Out)', category: 'camera', dur: 0.6, icon: '🔎', swatch: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #60A5FA 100%)' },
  { id: 'roll_shutter', label: 'Cuộn trập (Roll)', category: 'camera', dur: 0.6, icon: '🌀', swatch: 'linear-gradient(135deg, #134E4A 0%, #0D9488 50%, #2DD4BF 100%)' },
  { id: 'push_up', label: 'Đẩy lên trên', category: 'camera', dur: 0.5, icon: '⬆️', swatch: 'linear-gradient(135deg, #431407 0%, #EA580C 100%)' },
  { id: 'slide_left', label: 'Trượt sang trái', category: 'camera', dur: 0.5, icon: '⬅️', swatch: 'linear-gradient(135deg, #3B0764 0%, #9333EA 100%)' },
  // Mờ dần & Cháy sáng
  { id: 'blur', label: 'Mờ ảo quang sai', category: 'fade', dur: 0.6, icon: '🔮', swatch: 'linear-gradient(135deg, #172554 0%, #2563EB 100%)' },
  { id: 'film_burn', label: 'Cháy sáng phim nhựa', category: 'fade', dur: 0.5, icon: '🎞️', swatch: 'linear-gradient(135deg, #7C2D12 0%, #F97316 50%, #FDE047 100%)' },
  { id: 'rgb_split', label: 'Tách sắc 3D RGB', category: 'fade', dur: 0.5, icon: '🕶️', swatch: 'linear-gradient(135deg, #1E1B4B 0%, #EC4899 50%, #06B6D4 100%)' },
];

export const MobileWorkstation: React.FC<MobileWorkstationProps> = ({
  clips,
  timelineTracks,
  playheadSec,
  totalTimelineDuration,
  isPlaying,
  aspectRatio,
  previewQuality,
  selectedClipId,
  selectedClipIds,
  currentClip,
  historyPastLength,
  historyFutureLength,
  trackHidden,
  trackMuted,
  coverDataUrl,
  themeMode,
  language,
  projectName,
  onPlayheadChange,
  onTogglePlay,
  onStepFrame,
  onUndo,
  onRedo,
  onSplitClip,
  onTrimStartToPlayhead,
  onTrimEndToPlayhead,
  onDeleteSelected,
  onSelectClip,
  onUpdateClipProp,
  onFlipHorizontal,
  onSetAspectRatio,
  onSetPreviewQuality,
  onToggleTheme,
  onExitToHome,
  onOpenExport,
  onAddMedia,
  onDropResource,
  onApplyTransitionToAll,
  onOpenCropModal,
  onToggleTrackMute,
  onCaptureCover,
  renderPlayer,
}) => {
  const isEn = language === 'en';
  const isLight = themeMode === 'light';

  // Active bottom drawer state
  const [activeDrawer, setActiveDrawer] = useState<MobileDrawerType>(null);

  // Transition Target Clip ID (the clip that receives the transition at its start seam)
  const [targetTransitionClipId, setTargetTransitionClipId] = useState<string | null>(null);
  const [transitionCategory, setTransitionCategory] = useState<'all' | 'hottrend' | 'overlay' | 'camera' | 'fade' | 'basic'>('hottrend');
  const [transitionDuration, setTransitionDuration] = useState<number>(0.6);

  // Resolution Menu Dropdown
  const [exportRes, setExportRes] = useState<'720p' | '1080p' | '2k' | '4k'>('1080p');
  const [isResolutionMenuOpen, setIsResolutionMenuOpen] = useState(false);

  // Sticker Drawer Category & Search
  const [stickerCategory, setStickerCategory] = useState<'all' | 'cta' | 'faces' | 'flags' | 'emoji' | 'neon'>('all');
  const [stickerSearch, setStickerSearch] = useState('');

  // Audio Drawer Category & Search & Active Playing SFX
  const [audioCategory, setAudioCategory] = useState<'all' | 'tiktok' | 'bgm' | 'sfx'>('all');
  const [audioSearch, setAudioSearch] = useState('');
  const [activePlayingAudioId, setActivePlayingAudioId] = useState<string | null>(null);

  // Touch Timeline Drag Ref
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingTimeline = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const dragStartPlayhead = useRef(0);
  const hasDragged = useRef(false);

  // Main video clips (Track 0) sorted chronologically
  const videoClips = useMemo(
    () => clips.filter((c) => c.trackIndex === 0).sort((a, b) => a.startTime - b.startTime),
    [clips]
  );

  // Audio clips (Track 1)
  const audioClips = useMemo(
    () => clips.filter((c) => c.trackIndex === 1).sort((a, b) => a.startTime - b.startTime),
    [clips]
  );

  // Text clips (Track 2)
  const textClips = useMemo(
    () => clips.filter((c) => c.trackIndex === 2 || Boolean(c.subtitleText)).sort((a, b) => a.startTime - b.startTime),
    [clips]
  );

  // Sticker clips (Track 3)
  const stickerClips = useMemo(
    () => clips.filter((c) => c.trackIndex === 3 || Boolean(c.stickerEmoji)).sort((a, b) => a.startTime - b.startTime),
    [clips]
  );

  // Modal to choose media from phone / Google library
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);

  // Full Screen Canvas Mode (hides timeline for edge-to-edge full canvas preview)
  const [isFullCanvasMode, setIsFullCanvasMode] = useState(false);

  // Dynamic Pixels per second for mobile timeline scale (pinch-to-zoom support)
  const [pxPerSec, setPxPerSec] = useState<number>(45);
  const isPinchingTimeline = useRef(false);
  const wasPinchingTimeline = useRef(false);
  const timelinePinchStartDist = useRef(0);
  const timelinePinchStartPx = useRef(45);

  // Measure timeline tracks container width to center 00:00:00:00 under the stationary playhead
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 390
  );
  const halfWidth = Math.max(120, Math.round(containerWidth / 2));

  // Target clip for adjustments (selected clip or clip under playhead or first video clip)
  const activeAdjustmentClip = useMemo(() => {
    if (selectedClipId) {
      const found = clips.find((c) => c.id === selectedClipId);
      if (found) return found;
    }
    return (
      videoClips.find(
        (c) => playheadSec >= c.startTime && playheadSec <= c.startTime + c.duration
      ) ||
      videoClips[0] ||
      currentClip
    );
  }, [clips, selectedClipId, videoClips, playheadSec, currentClip]);

  useEffect(() => {
    const el = timelineScrollRef.current;
    if (!el) return;
    const updateW = () => {
      if (el.clientWidth > 0) setContainerWidth(el.clientWidth);
    };
    updateW();
    const ro = new ResizeObserver(updateW);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Ensure timeline starts at 00:00:00:00 upon initial open
  const initialPlayheadResetRef = useRef(false);
  useEffect(() => {
    if (!initialPlayheadResetRef.current) {
      initialPlayheadResetRef.current = true;
      if (playheadSec < 0 || playheadSec > 0.05) {
        onPlayheadChange(0);
        if (timelineScrollRef.current) timelineScrollRef.current.scrollLeft = 0;
      }
    }
  }, []);

  // Selected Transition Clip
  const transitionClip = useMemo(
    () => (targetTransitionClipId ? clips.find((c) => c.id === targetTransitionClipId) : null),
    [clips, targetTransitionClipId]
  );

  // Keep transitionDuration in sync with target clip
  useEffect(() => {
    if (transitionClip?.transitionDuration) {
      setTransitionDuration(transitionClip.transitionDuration);
    }
  }, [transitionClip]);

  // Play toggle with direct hardware video unlock to satisfy browser user gesture policy
  const handlePlayToggle = () => {
    const vids = document.querySelectorAll<HTMLVideoElement>('video[data-player-video="true"]');
    vids.forEach((v) => {
      if (!isPlaying) {
        const p = v.play();
        if (p !== undefined) {
          p.catch(() => {
            v.muted = true;
            v.play().catch(() => {});
          });
        }
      } else {
        v.pause();
      }
    });
    onTogglePlay();
  };

  // Synchronize playhead when timeline is scrolled (swiped, dragged, momentum flicked, or wheeled)
  const handleScroll = () => {
    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false;
      return;
    }
    const el = timelineScrollRef.current;
    if (!el) return;
    if (isPlaying) {
      onTogglePlay();
    }
    const currentScroll = el.scrollLeft;
    const targetSec = Math.max(0, Math.min(totalTimelineDuration, currentScroll / pxPerSec));
    const roundedSec = Number(targetSec.toFixed(2));
    if (Math.abs(roundedSec - playheadSec) >= 0.02) {
      onPlayheadChange(roundedSec);
    }
  };

  // Handle Touch Scrubbing & 2-finger Pinch-to-zoom on Timeline
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isDraggingTimeline.current = false;
      isPinchingTimeline.current = true;
      wasPinchingTimeline.current = true;
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      timelinePinchStartDist.current = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      timelinePinchStartPx.current = pxPerSec;
      dragStartPlayhead.current = playheadSec;
      return;
    }
    if (isPlaying) {
      onTogglePlay();
    }
    isDraggingTimeline.current = true;
    hasDragged.current = false;
    dragStartX.current = e.touches[0].clientX;
    dragStartScrollLeft.current = timelineScrollRef.current?.scrollLeft || 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPinchingTimeline.current && e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const ratio = dist / Math.max(10, timelinePinchStartDist.current);
      const nextPx = Math.round(Math.max(12, Math.min(220, timelinePinchStartPx.current * ratio)));
      setPxPerSec(nextPx);
      if (timelineScrollRef.current) {
        isProgrammaticScrollRef.current = true;
        timelineScrollRef.current.scrollLeft = Math.round(dragStartPlayhead.current * nextPx);
      }
      return;
    }
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStartX.current;
      if (Math.abs(dx) > 3) {
        hasDragged.current = true;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      isPinchingTimeline.current = false;
    }
    if (e.touches.length === 0) {
      isDraggingTimeline.current = false;
      if (wasPinchingTimeline.current) {
        wasPinchingTimeline.current = false;
      }
      hasDragged.current = false;
    }
  };

  // Mobile Touch & Mouse Drag Trimming on Selected Clip Edge (Hard capped by source duration)
  const touchTrimRef = useRef<{
    clipId: string;
    startX: number;
    origDuration: number;
    sourceDuration?: number;
    sourceIn?: number;
    speed?: number;
    hasMoved: boolean;
  } | null>(null);

  const touchLeftTrimRef = useRef<{
    clipId: string;
    startX: number;
    origStartTime: number;
    origDuration: number;
    sourceIn: number;
    sourceDuration?: number;
    speed: number;
    hasMoved: boolean;
  } | null>(null);

  const handleRightHandleTouchStart = (clip: TimelineClip, e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingTimeline.current = false;
    touchTrimRef.current = {
      clipId: clip.id,
      startX: e.touches[0].clientX,
      origDuration: clip.duration,
      sourceDuration: clip.sourceDuration,
      sourceIn: clip.sourceIn || 0,
      speed: clip.speed || 1.0,
      hasMoved: false,
    };
  };

  const handleRightHandleTouchMove = (e: React.TouchEvent) => {
    if (!touchTrimRef.current) return;
    e.stopPropagation();
    const touch = e.touches[0];
    const dx = touch.clientX - touchTrimRef.current.startX;
    if (Math.abs(dx) > 3) {
      touchTrimRef.current.hasMoved = true;
    }
    const deltaSec = dx / pxPerSec;
    const speed = touchTrimRef.current.speed && touchTrimRef.current.speed > 0 ? touchTrimRef.current.speed : 1.0;
    const effectiveSourceDur =
      touchTrimRef.current.sourceDuration && touchTrimRef.current.sourceDuration > 0
        ? touchTrimRef.current.sourceDuration
        : touchTrimRef.current.origDuration;
    const maxAllowedDur = Math.max(0.4, (effectiveSourceDur - (touchTrimRef.current.sourceIn || 0)) / speed);

    const desiredDur = touchTrimRef.current.origDuration + deltaSec;
    const clampedDur = Number(Math.max(0.4, Math.min(maxAllowedDur, desiredDur)).toFixed(2));
    onUpdateClipProp('duration', clampedDur, touchTrimRef.current.clipId);
  };

  const handleRightHandleTouchEnd = (e: React.TouchEvent) => {
    if (!touchTrimRef.current) return;
    e.stopPropagation();
    touchTrimRef.current = null;
  };

  const handleRightHandleMouseDown = (clip: TimelineClip, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingTimeline.current = false;
    const startX = e.clientX;
    const origDuration = clip.duration;
    const speed = clip.speed && clip.speed > 0 ? clip.speed : 1.0;
    const effectiveSourceDur =
      clip.sourceDuration && clip.sourceDuration > 0
        ? clip.sourceDuration
        : origDuration;
    const maxAllowedDur = Math.max(0.4, (effectiveSourceDur - (clip.sourceIn || 0)) / speed);

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const deltaSec = dx / pxPerSec;
      const desiredDur = origDuration + deltaSec;
      const clampedDur = Number(Math.max(0.4, Math.min(maxAllowedDur, desiredDur)).toFixed(2));
      onUpdateClipProp('duration', clampedDur, clip.id);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleLeftHandleTouchStart = (clip: TimelineClip, e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingTimeline.current = false;
    touchLeftTrimRef.current = {
      clipId: clip.id,
      startX: e.touches[0].clientX,
      origStartTime: clip.startTime,
      origDuration: clip.duration,
      sourceIn: clip.sourceIn || 0,
      sourceDuration: clip.sourceDuration,
      speed: clip.speed || 1.0,
      hasMoved: false,
    };
  };

  const handleLeftHandleTouchMove = (e: React.TouchEvent) => {
    if (!touchLeftTrimRef.current) return;
    e.stopPropagation();
    const dx = e.touches[0].clientX - touchLeftTrimRef.current.startX;
    if (Math.abs(dx) > 3) touchLeftTrimRef.current.hasMoved = true;
    const deltaSec = dx / pxPerSec;
    const speed = touchLeftTrimRef.current.speed;
    const maxDelta = touchLeftTrimRef.current.origDuration - 0.4;
    const minDelta = touchLeftTrimRef.current.sourceDuration ? -touchLeftTrimRef.current.sourceIn / speed : -Infinity;
    const clampedDelta = Math.max(-touchLeftTrimRef.current.origStartTime, minDelta, Math.min(maxDelta, deltaSec));
    const newStart = Number((touchLeftTrimRef.current.origStartTime + clampedDelta).toFixed(2));
    const newDur = Number((touchLeftTrimRef.current.origDuration - clampedDelta).toFixed(2));
    const newSourceIn = Number(Math.max(0, touchLeftTrimRef.current.sourceIn + clampedDelta * speed).toFixed(2));
    onUpdateClipProp('startTime', newStart, touchLeftTrimRef.current.clipId);
    onUpdateClipProp('duration', newDur, touchLeftTrimRef.current.clipId);
    onUpdateClipProp('sourceIn', newSourceIn, touchLeftTrimRef.current.clipId);
  };

  const handleLeftHandleTouchEnd = (e: React.TouchEvent) => {
    if (!touchLeftTrimRef.current) return;
    e.stopPropagation();
    const hadMoved = touchLeftTrimRef.current.hasMoved;
    touchLeftTrimRef.current = null;
    if (!hadMoved) {
      onTrimStartToPlayhead?.();
    }
  };

  // Mouse dragging on desktop with window listeners so mouse release is never lost
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (isPlaying) {
      onTogglePlay();
    }
    isDraggingTimeline.current = true;
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    dragStartScrollLeft.current = timelineScrollRef.current?.scrollLeft || 0;

    const handleWindowMouseMove = (moveEv: MouseEvent) => {
      if (!isDraggingTimeline.current) return;
      const dx = moveEv.clientX - dragStartX.current;
      if (Math.abs(dx) > 3) {
        hasDragged.current = true;
      }
      if (hasDragged.current && timelineScrollRef.current) {
        timelineScrollRef.current.scrollLeft = dragStartScrollLeft.current - dx;
      }
    };

    const handleWindowMouseUp = () => {
      isDraggingTimeline.current = false;
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  // Keep timeline scroll position strictly aligned with fixed center playhead
  useEffect(() => {
    const el = timelineScrollRef.current;
    if (!el) return;
    if (isDraggingTimeline.current || isPinchingTimeline.current) return;
    const targetScroll = Math.round(playheadSec * pxPerSec);
    if (Math.abs(el.scrollLeft - targetScroll) >= 1) {
      isProgrammaticScrollRef.current = true;
      el.scrollLeft = targetScroll;
    }
  }, [playheadSec, pxPerSec]);

  // Click on a Transition Seam button '|' between clip i and clip i+1
  const handleOpenTransitionSeam = (clipId: string, seamTime: number) => {
    setTargetTransitionClipId(clipId);
    onPlayheadChange(Number(seamTime.toFixed(2)));
    setActiveDrawer('transitions');
  };

  // Apply Transition to Current Target Clip
  const handleSelectTransition = (type: TransitionPresetType) => {
    if (!targetTransitionClipId) {
      // Default to the first clip or current clip
      const target = currentClip || videoClips[1] || videoClips[0];
      if (target) {
        setTargetTransitionClipId(target.id);
        onUpdateClipProp('transitionType', type);
        onUpdateClipProp('transitionDuration', transitionDuration);
      }
      return;
    }
    const target = clips.find((c) => c.id === targetTransitionClipId);
    if (target) {
      onSelectClip(target.id);
      onUpdateClipProp('transitionType', type);
      onUpdateClipProp('transitionDuration', transitionDuration);
    }
  };

  // Sticker Catalog Items
  const allStickers = useMemo<StickerCatalogItem[]>(() => {
    return [
      ...GRAPHIC_BADGE_STICKERS,
      { id: 'like_thumb', uid: 'stk-like-1', label: 'Nút Like', labelEn: 'Thumbs Up', icon: '👍', cat: 'cta' },
      { id: 'bell_sub', uid: 'stk-bell-1', label: 'Chuông Đăng ký', labelEn: 'Subscribe Bell', icon: '🔔', cat: 'cta' },
      { id: 'fire_trend', uid: 'stk-sub-btn', label: 'Nút Subscribe Đỏ', labelEn: 'Red Subscribe Button', icon: '▶️', cat: 'cta' },
      { id: 'heart_love', uid: 'stk-heart-follow', label: 'Thả Tim Follow', labelEn: 'Heart Follow', icon: '❤️', cat: 'cta' },
      { id: 'social_badge', uid: 'stk-share-now', label: 'Chia Sẻ Video', labelEn: 'Share Video', icon: '↗️', cat: 'cta' },
      ...FACE_ICON_STICKERS,
      ...TREND_EMOJI_STICKERS,
      ...WORLD_FLAG_STICKERS,
    ];
  }, []);

  const filteredStickers = useMemo(() => {
    return allStickers.filter((stk) => {
      const matchCat =
        stickerCategory === 'all' ||
        stk.cat === stickerCategory ||
        (stickerCategory === 'neon' && stk.cat === 'neon');
      if (!matchCat) return false;
      if (!stickerSearch.trim()) return true;
      const q = stickerSearch.trim().toLowerCase();
      return (
        stk.label.toLowerCase().includes(q) ||
        (stk.labelEn && stk.labelEn.toLowerCase().includes(q))
      );
    });
  }, [allStickers, stickerCategory, stickerSearch]);

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col overflow-hidden select-none touch-none ${
        isLight ? 'bg-[#F8FAFC] text-[#0F172A]' : 'bg-[#0E0F13] text-[#EDEDF0]'
      }`}
    >
      {/* FULL CANVAS MODE OVERLAY (User requested 100% canvas without timeline) */}
      {isFullCanvasMode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col select-none touch-none animate-in fade-in duration-200">
          {/* Floating Top Header in Fullscreen */}
          <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={() => setIsFullCanvasMode(false)}
              title="Thu nhỏ về bàn dựng"
              aria-label="Thu nhỏ về bàn dựng"
              className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 active:scale-95 shadow-lg cursor-pointer hover:bg-black/80"
            >
              <Minimize2 className="w-4 h-4 text-[#00E5CC]" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/80 border border-white/10 text-[10px] font-mono">
                <span>{aspectRatio === 'original' ? (currentClip?.nativeAspectRatio || videoClips[0]?.nativeAspectRatio || 'Gốc') : aspectRatio}</span>
                <span className="text-[#00E5CC] font-bold">{exportRes.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Edge-to-edge full screen video preview */}
          <div className="flex-1 w-full h-full flex items-center justify-center p-0">
            {renderPlayer()}
          </div>

          {/* Floating Bottom Bar in Fullscreen */}
          <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/15 shadow-2xl">
              <button
                type="button"
                onClick={() => onPlayheadChange(0)}
                className="font-mono text-xs text-white font-semibold cursor-pointer active:scale-95"
                title="Bấm để về 00:00:00:00"
              >
                {formatTimecode(playheadSec)} / {formatTimecode(totalTimelineDuration)}
              </button>
              <button
                type="button"
                onClick={handlePlayToggle}
                aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                className="w-9 h-9 rounded-full bg-[#00E5CC] text-[#071013] flex items-center justify-center active:scale-90 shadow-md transition-transform cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsFullCanvasMode(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 cursor-pointer active:scale-90"
                title="Thu nhỏ về bàn dựng"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP MOBILE HEADER BAR (CapCut Mobile style) */}
      <header
        className={`flex items-center justify-between px-3 h-11 shrink-0 border-b z-30 ${
          isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#14151B] border-[#22242D]'
        }`}
      >
        {/* Left: Close 'X' Button -> return to Home Launcher */}
        <button
          type="button"
          onClick={onExitToHome}
          aria-label="Đóng bàn dựng về Trang chủ"
          className={`p-2 rounded-full cursor-pointer transition-colors active:scale-90 ${
            isLight ? 'hover:bg-gray-100 text-[#0F172A]' : 'hover:bg-white/10 text-white'
          }`}
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Right side group: [Theme Sun/Moon] [1080P ▾] [Xuất / Export] */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Sun / Moon */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Đổi giao diện Sáng / Tối"
            className={`p-1.5 rounded-full cursor-pointer transition-colors ${
              isLight ? 'bg-gray-100 hover:bg-gray-200 text-[#0F172A]' : 'bg-[#22242F] text-amber-400'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4 text-sky-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Resolution Dropdown (1080P ▾) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsResolutionMenuOpen((p) => !p)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border active:scale-95 transition-all ${
                isLight
                  ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A]'
                  : 'bg-[#22242F] border-[#313543] text-white'
              }`}
            >
              <span className="font-mono">
                {exportRes.toUpperCase()}
              </span>
              <ChevronDown className="w-3 h-3 text-[#00E5CC]" />
            </button>

            {/* Resolution Dropdown Popover */}
            {isResolutionMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                  onClick={() => setIsResolutionMenuOpen(false)}
                />
                <div
                  className={`absolute right-0 top-10 w-48 p-2 rounded-xl shadow-2xl z-50 text-xs border ${
                    isLight
                      ? 'bg-white border-[#CBD5E1] text-[#0F172A]'
                      : 'bg-[#1B1D26] border-[#313543] text-white'
                  }`}
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-[#A1A1AA] uppercase">
                    {isEn ? 'Export Quality' : 'Độ phân giải xuất'}
                  </div>
                  {(
                    [
                      { id: '720p', label: '720P (HD 720)' },
                      { id: '1080p', label: '1080P (Full HD Khuyên dùng)' },
                      { id: '2k', label: '2K (QHD 1440)' },
                      { id: '4k', label: '4K (Ultra HD 2160)' },
                    ] as const
                  ).map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setExportRes(q.id);
                        setIsResolutionMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left cursor-pointer transition-colors ${
                        exportRes === q.id
                          ? 'bg-[#00E5CC]/20 text-[#00E5CC] font-bold'
                          : isLight
                          ? 'hover:bg-gray-100 text-[#0F172A]'
                          : 'hover:bg-white/5 text-white'
                      }`}
                    >
                      <span>{q.label}</span>
                      {exportRes === q.id && <Check className="w-3.5 h-3.5 text-[#00E5CC]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5CC] hover:bg-[#00F5DC] active:bg-[#00D2C4] text-[#071013] font-bold text-xs shadow-sm cursor-pointer active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isEn ? 'Export' : 'Xuất'}</span>
          </button>
        </div>
      </header>

      {/* 2. REAL-TIME PLAYER CANVAS AREA (Edge-to-edge, full screen mobile canvas) */}
      <div
        className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden bg-black w-full"
        onClick={videoClips.length > 0 ? handlePlayToggle : undefined}
      >
        <div className="w-full h-full flex items-center justify-center p-0">
          {videoClips.length === 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowAddMediaModal(true);
              }}
              className="flex flex-col items-center justify-center gap-3 text-center p-6 cursor-pointer max-w-xs"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#00E5CC]/15 border border-[#00E5CC]/40 flex items-center justify-center text-[#00E5CC] shadow-lg">
                <Film className="w-8 h-8" />
              </div>
              <div className="text-white font-bold text-sm">Chưa có video nào trong dự án</div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMediaModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E5CC] text-[#071013] font-bold text-xs active:scale-95 cursor-pointer shadow-md hover:bg-[#00F5DC] transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Chọn video từ điện thoại / máy tính</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {!isFullCanvasMode && renderPlayer()}
            </div>
          )}
        </div>
      </div>

      {/* 3. MOBILE TRANSPORT CONTROL ROW (CapCut Mobile style) */}
      <div
        className={`relative flex items-center justify-between px-3 py-1.5 shrink-0 border-t border-b select-none ${
          isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#14151B] border-[#22242D]'
        }`}
      >
        {/* Left: Fullscreen preview button & Current Timecode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullCanvasMode(true)}
            aria-label="Toàn màn hình canvas"
            title="Toàn màn hình canvas"
            className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 border cursor-pointer transition-all ${
              isLight
                ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-[#0F172A]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
            }`}
          >
            <Maximize2 className="w-4 h-4 text-[#00E5CC]" />
          </button>
          <button
            type="button"
            onClick={() => {
              onPlayheadChange(0);
              if (timelineScrollRef.current) timelineScrollRef.current.scrollLeft = 0;
            }}
            title="Bấm để về 00:00"
            className="font-mono text-xs font-semibold cursor-pointer active:scale-95 transition-colors"
          >
            <span className={isLight ? 'text-[#0F172A]' : 'text-white/90'}>
              {formatTimecode(playheadSec).slice(3, 8)}
            </span>
            <span className="text-[#64748B] text-[10px] ml-1">
              / {formatTimecode(totalTimelineDuration).slice(3, 8)}
            </span>
          </button>
        </div>

        {/* Center: Play / Pause Button - locked directly above stationary center playhead */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={handlePlayToggle}
            aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-md active:scale-90 transition-transform bg-[#00E5CC] text-[#071013] hover:bg-[#00F5DC]"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Right: Undo, Redo Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={historyPastLength === 0}
            aria-label="Hoàn tác"
            className={`p-1.5 rounded-md cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isLight ? 'hover:bg-gray-100 text-[#0F172A]' : 'hover:bg-white/10 text-white'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={historyFutureLength === 0}
            aria-label="Làm lại"
            className={`p-1.5 rounded-md cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none ${
              isLight ? 'hover:bg-gray-100 text-[#0F172A]' : 'hover:bg-white/10 text-white'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. TOUCH-OPTIMIZED MOBILE TIMELINE (CapCut Mobile style with Stationary Center Playhead) */}
      <div
        className={`relative h-[172px] shrink-0 border-b flex flex-col overflow-hidden select-none ${
          isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#101116] border-[#22242D]'
        }`}
      >
        {/* Stationary White Center Playhead Indicator (Vertically aligned directly below Play button) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
          <div className="w-3 h-3 bg-white rotate-45 -mt-1 shadow-md border border-black/30" />
          <div className="w-[2px] flex-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]" />
        </div>

        {/* Touch-Scrollable Horizontal Timeline Strip */}
        <div
          ref={timelineScrollRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const factor = e.deltaY < 0 ? 1.15 : 0.87;
              const nextPx = Math.round(Math.max(12, Math.min(220, pxPerSec * factor)));
              setPxPerSec(nextPx);
              if (timelineScrollRef.current) {
                isProgrammaticScrollRef.current = true;
                timelineScrollRef.current.scrollLeft = Math.round(playheadSec * nextPx);
              }
            }
          }}
          className="w-full h-full overflow-x-auto scrollbar-none relative py-1 flex flex-col justify-start touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
        >
          {/* Scrollable Tracks Content Strip */}
          <div
            style={{
              width: `${Math.max(
                halfWidth + (totalTimelineDuration + 2) * pxPerSec + halfWidth,
                containerWidth + 100
              )}px`,
              minWidth: '100%',
            }}
            className="relative space-y-1.5 select-none flex flex-col"
          >
            {/* ROW 0: TIMELINE RULER STRIP (00:00 starts at halfWidth) */}
            <div className="h-4 relative border-b border-white/10 select-none">
              {(() => {
                const maxSec = Math.ceil(totalTimelineDuration) + 12;
                return Array.from({ length: maxSec + 1 }).map((_, sec) => {
                  const leftPos = halfWidth + sec * pxPerSec;
                  const isMajor = pxPerSec >= 50 ? true : pxPerSec >= 24 ? sec % 2 === 0 : sec % 5 === 0;
                  return (
                    <div
                      key={sec}
                      style={{ left: `${leftPos}px` }}
                      className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
                    >
                      <div className={`w-[1px] ${isMajor ? 'h-2 bg-white/40' : 'h-1 bg-white/20'}`} />
                      {isMajor && (
                        <span className="text-[7.5px] font-mono text-[#94A3B8] -ml-3 mt-0.5 leading-none">
                          {formatTimecode(sec).slice(3, 8)}
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* ROW 1: TRACK 0 (VIDEO TRACK) & LEFT RUNWAY (MUTE CLIP + COVER ON 1 ROW) */}
            <div className="h-12 relative flex items-center">
              {/* Left runway before 00:00: Mute Clip and Cover arranged on 1 row! */}
              <div
                style={{ width: `${halfWidth}px` }}
                className="absolute left-0 top-0 bottom-0 flex items-center justify-end pr-2 gap-2 z-20 pointer-events-auto"
              >
                {/* 1. Mute Clip Button (Vertical tile matching CapCut Mobile) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTrackMute(0);
                  }}
                  title={trackMuted[0] ? 'Bật tiếng video' : 'Tắt tiếng clip'}
                  className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl border text-center cursor-pointer active:scale-95 transition-all shadow-xs ${
                    trackMuted[0]
                      ? 'border-rose-500/60 bg-rose-500/20 text-rose-400'
                      : isLight
                      ? 'border-gray-200 bg-white/90 hover:bg-white text-gray-700'
                      : 'border-white/10 bg-[#191A23] hover:bg-[#222430] text-[#94A3B8] hover:text-[#00E5CC]'
                  }`}
                >
                  {trackMuted[0] ? (
                    <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#00E5CC] shrink-0" />
                  )}
                  <span className="text-[7.5px] font-semibold mt-0.5 leading-none whitespace-nowrap">
                    {trackMuted[0] ? (isEn ? 'Muted' : 'Đã tắt') : (isEn ? 'Mute' : 'Tắt tiếng')}
                  </span>
                </button>

                {/* 2. Cover (Ảnh bìa) Button (Vertical tile matching CapCut Mobile) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCaptureCover?.();
                  }}
                  title="Chụp khung hình hiện tại làm Ảnh bìa dự án"
                  className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl border text-center cursor-pointer active:scale-95 transition-all shadow-xs ${
                    isLight
                      ? 'border-gray-200 bg-white/90 hover:bg-white text-gray-700'
                      : 'border-white/10 bg-[#191A23] hover:bg-[#222430] text-[#94A3B8] hover:text-[#00E5CC]'
                  }`}
                >
                  <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center bg-black/50 shrink-0 border border-white/15 relative">
                    {coverDataUrl ? (
                      <img src={coverDataUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-3 h-3 text-[#00E5CC]" />
                    )}
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-70 hover:opacity-100">
                      <Wand2 className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <span className="text-[7.5px] font-semibold mt-0.5 leading-none whitespace-nowrap">
                    {isEn ? 'Cover' : 'Ảnh bìa'}
                  </span>
                </button>
              </div>

              {/* Video Clips starting at halfWidth (00:00) */}
              {videoClips.length === 0 ? (
                <div
                  style={{ left: `${halfWidth}px` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddMediaModal(true);
                  }}
                  className="absolute h-11 rounded-xl border-2 border-dashed border-[#00E5CC]/60 bg-[#00E5CC]/10 flex items-center justify-center gap-2 text-xs font-bold text-[#00E5CC] cursor-pointer hover:bg-[#00E5CC]/20 active:scale-98 transition-all px-4"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Thêm video / tệp đầu tiên</span>
                </div>
              ) : (
                <>
                  {videoClips.map((clip, idx) => {
                    const clipLeft = halfWidth + clip.startTime * pxPerSec;
                    const clipWidth = Math.max(36, clip.duration * pxPerSec);
                    const isSelected = selectedClipId === clip.id;
                    const nextClip = videoClips[idx + 1];

                    return (
                      <React.Fragment key={clip.id}>
                        {/* Video Clip Card */}
                        <div
                          style={{
                            left: `${clipLeft}px`,
                            width: `${clipWidth}px`,
                            ...(clip.thumbnailUrl
                              ? {
                                  backgroundImage: `url(${clip.thumbnailUrl})`,
                                  backgroundRepeat: 'repeat-x',
                                  backgroundSize: 'auto 100%',
                                }
                              : {}),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClip(clip.id);
                          }}
                          className={`absolute h-11 rounded-lg overflow-hidden border flex items-center px-1.5 transition-all cursor-pointer shadow-xs ${
                            isSelected
                              ? 'border-2 border-white ring-2 ring-white/60 bg-[#00E5CC]/25 z-10'
                              : isLight
                              ? 'bg-[#E2E8F0] border-[#CBD5E1] text-[#0F172A]'
                              : 'bg-[#1A1C24] border-[#2E313D] text-white'
                          }`}
                        >
                          {/* Left Trim Handle when selected */}
                          {isSelected && (
                            <div
                              onTouchStart={(e) => handleLeftHandleTouchStart(clip, e)}
                              onTouchMove={handleLeftHandleTouchMove}
                              onTouchEnd={handleLeftHandleTouchEnd}
                              onTouchCancel={handleLeftHandleTouchEnd}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              title="Kéo đầu clip để cắt ngắn video"
                              className="absolute left-0 inset-y-0 w-4 bg-white text-black flex items-center justify-center cursor-ew-resize z-20 shadow-md rounded-l-md touch-none select-none"
                            >
                              <div className="flex gap-0.5 pointer-events-none">
                                <div className="w-[1px] h-3 bg-black/80" />
                                <div className="w-[1px] h-3 bg-black/80" />
                              </div>
                            </div>
                          )}

                          {/* Duration Badge & Title */}
                          <div className="min-w-0 flex-1 z-10 pointer-events-none flex items-center justify-between pl-3 pr-3">
                            <span className="text-[8px] font-mono font-bold bg-black/70 backdrop-blur-xs text-[#00E5CC] px-1 py-0.5 rounded shadow-xs">
                              {clip.duration.toFixed(1)}s
                            </span>
                            <span className="text-[9.5px] font-bold truncate text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] max-w-[65%]">
                              {clip.name}
                            </span>
                          </div>

                          {/* Right Trim Handle when selected (Supports Touch Drag Trim) */}
                          {isSelected && (
                            <div
                              onTouchStart={(e) => handleRightHandleTouchStart(clip, e)}
                              onTouchMove={handleRightHandleTouchMove}
                              onTouchEnd={handleRightHandleTouchEnd}
                              onTouchCancel={handleRightHandleTouchEnd}
                              onMouseDown={(e) => handleRightHandleMouseDown(clip, e)}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              title="Chạm ngón tay kéo mép phải để thu ngắn video cắt bỏ đoạn thừa"
                              className="absolute right-0 inset-y-0 w-4 bg-white text-black flex items-center justify-center cursor-ew-resize z-20 shadow-md rounded-r-md touch-none select-none active:bg-[#00E5CC]"
                            >
                              <div className="flex gap-0.5 pointer-events-none">
                                <div className="w-[1px] h-3 bg-black/80" />
                                <div className="w-[1px] h-3 bg-black/80" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Transition Seam Button '|' */}
                        {nextClip && (
                          <div
                            style={{
                              left: `${halfWidth + (clip.startTime + clip.duration) * pxPerSec - 11}px`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTransitionSeam(nextClip.id, clip.startTime + clip.duration);
                            }}
                            title="Thêm hiệu ứng chuyển tiếp tại điểm cắt này"
                            className="absolute z-20 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-white text-black shadow-md border border-gray-300 flex items-center justify-center cursor-pointer active:scale-90 hover:bg-[#00E5CC] hover:text-black transition-all"
                          >
                            {nextClip.transitionType && nextClip.transitionType !== 'none' ? (
                              <ArrowRightLeft className="w-3 h-3 text-[#00D2C4]" />
                            ) : (
                              <span className="font-bold text-xs leading-none">|</span>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* '+' Add Media Button at end of Track 0 */}
                  <button
                    type="button"
                    style={{
                      left: `${halfWidth + totalTimelineDuration * pxPerSec + 12}px`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddMediaModal(true);
                    }}
                    title="Thêm video / ảnh vào dòng thời gian"
                    className="absolute z-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold shadow-md active:scale-95 hover:bg-[#00E5CC] transition-all cursor-pointer"
                  >
                    <Plus className="w-5 h-5 stroke-[2.8]" />
                  </button>
                </>
              )}
            </div>

            {/* ROW 2: TRACK 1 (AUDIO TRACK) */}
            <div className="h-9 relative flex items-center">
              {/* Left runway before 00:00: Audio Icon button */}
              <div
                style={{ width: `${halfWidth}px` }}
                className="absolute left-0 top-0 bottom-0 flex items-center justify-end pr-2 z-20 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDrawer('audio');
                  }}
                  title="Mở thư viện âm thanh"
                  className="w-7 h-7 rounded-lg border border-[#0284C7]/40 bg-[#0284C7]/15 flex items-center justify-center text-[#38BDF8] hover:bg-[#0284C7]/30 cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  <Music className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Audio Track Content starting at halfWidth (00:00) */}
              {audioClips.length > 0 ? (
                audioClips.map((clip) => {
                  const clipLeft = halfWidth + clip.startTime * pxPerSec;
                  const clipWidth = Math.max(30, clip.duration * pxPerSec);
                  return (
                    <div
                      key={clip.id}
                      style={{
                        left: `${clipLeft}px`,
                        width: `${clipWidth}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClip(clip.id);
                      }}
                      className="absolute h-7 rounded-md bg-[#0284C7]/30 border border-[#0284C7] px-2 flex items-center gap-1.5 text-[9px] font-semibold text-[#38BDF8] truncate cursor-pointer shadow-xs"
                    >
                      <Music className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{clip.name}</span>
                    </div>
                  );
                })
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDrawer('audio');
                  }}
                  style={{
                    left: `${halfWidth}px`,
                    width: `${Math.max(160, totalTimelineDuration * pxPerSec)}px`,
                  }}
                  className="absolute h-7 px-3 rounded-md border border-dashed border-[#38BDF8]/60 text-[#38BDF8] bg-[#0284C7]/10 hover:bg-[#0284C7]/20 flex items-center gap-1.5 text-[9.5px] font-bold cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                  <span>{isEn ? 'Add audio' : 'Thêm âm thanh'}</span>
                </button>
              )}
            </div>

            {/* ROW 3: TRACK 2 (TEXT TRACK) */}
            <div className="h-7 relative flex items-center">
              {/* Left runway before 00:00: Text Icon button */}
              <div
                style={{ width: `${halfWidth}px` }}
                className="absolute left-0 top-0 bottom-0 flex items-center justify-end pr-2 z-20 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDrawer('text');
                  }}
                  title="Mở thư viện văn bản"
                  className="w-7 h-7 rounded-lg border border-[#F97316]/40 bg-[#F97316]/15 flex items-center justify-center text-[#FB923C] hover:bg-[#F97316]/30 cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  <Type className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Track Content starting at halfWidth (00:00) */}
              {textClips.length > 0 ? (
                textClips.map((clip) => {
                  const clipLeft = halfWidth + clip.startTime * pxPerSec;
                  const clipWidth = Math.max(28, clip.duration * pxPerSec);
                  const isSelected = selectedClipId === clip.id;
                  return (
                    <div
                      key={clip.id}
                      style={{
                        left: `${clipLeft}px`,
                        width: `${clipWidth}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClip(clip.id);
                      }}
                      className={`absolute h-5 rounded-full border px-2 flex items-center gap-1 text-[8.5px] font-bold truncate cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#F97316] text-white border-white ring-2 ring-[#F97316]/50'
                          : 'bg-[#C2410C]/25 text-[#FB923C] border-[#F97316]'
                      }`}
                    >
                      <Type className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{clip.subtitleText || clip.name}</span>
                    </div>
                  );
                })
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDrawer('text');
                  }}
                  style={{
                    left: `${halfWidth}px`,
                    width: `${Math.max(160, totalTimelineDuration * pxPerSec)}px`,
                  }}
                  className="absolute h-5 px-3 rounded-full border border-dashed border-[#F97316]/60 text-[#FB923C] bg-[#EA580C]/10 hover:bg-[#EA580C]/20 flex items-center gap-1.5 text-[8.5px] font-bold cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3 text-[#FB923C] shrink-0" />
                  <span>{isEn ? 'Add text' : 'Thêm văn bản'}</span>
                </button>
              )}
            </div>

            {/* ROW 4: TRACK 3 (STICKER TRACK - if any exist) */}
            {stickerClips.length > 0 && (
              <div className="h-6 relative flex items-center">
                {stickerClips.map((clip) => {
                  const clipLeft = halfWidth + clip.startTime * pxPerSec;
                  const clipWidth = Math.max(28, clip.duration * pxPerSec);
                  const isSelected = selectedClipId === clip.id;
                  return (
                    <div
                      key={clip.id}
                      style={{
                        left: `${clipLeft}px`,
                        width: `${clipWidth}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClip(clip.id);
                      }}
                      className={`absolute h-5 rounded-full border px-2 flex items-center gap-1 text-[8.5px] font-bold truncate cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#A855F7] text-white border-white ring-2 ring-[#A855F7]/50'
                          : 'bg-[#7E22CE]/25 text-[#C084FC] border-[#A855F7]'
                      }`}
                    >
                      <Smile className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{clip.stickerEmoji || clip.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. MOBILE BOTTOM NAVIGATION DOCK (CapCut Mobile style) */}
      <nav
        aria-label="Thanh công cụ chỉnh sửa điện thoại"
        className={`shrink-0 border-t flex items-center justify-start overflow-x-auto no-scrollbar px-1.5 py-1.5 z-30 select-none ${
          isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#14151C] border-[#22242E]'
        }`}
      >
        {selectedClipId && currentClip ? (
          /* SUB-ACTION DOCK WHEN CLIP IS SELECTED (CapCut Clean Icons) */
          <div className="flex items-center gap-1 min-w-full">
            {/* Back Button '‹' to Deselect Clip */}
            <button
              type="button"
              onClick={() => onSelectClip(null)}
              className={`flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] active:scale-90 transition-transform cursor-pointer ${
                isLight ? 'text-[#0F172A] hover:text-[#00A89A]' : 'text-white hover:text-[#00E5CC]'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center mb-0.5">
                <ChevronLeft className="w-4 h-4 text-[#00E5CC]" />
              </div>
              <span className="text-[9.5px] font-semibold text-[#00E5CC] whitespace-nowrap">Quay lại</span>
            </button>

            {/* Split (Tách) */}
            <button
              type="button"
              onClick={onSplitClip}
              className="flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-0.5 text-[#00E5CC]">
                <Split className="w-4 h-4" />
              </div>
              <span className="text-[9.5px] font-medium text-current whitespace-nowrap">Tách</span>
            </button>

            {/* Ripple Trim Left (Xóa trái) */}
            <button
              type="button"
              onClick={onTrimStartToPlayhead}
              className="flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-0.5 text-amber-400 font-mono font-bold text-[10px]">
                ][←
              </div>
              <span className="text-[9.5px] font-medium text-current whitespace-nowrap">Xóa trái</span>
            </button>

            {/* Ripple Trim Right (Xóa phải) */}
            <button
              type="button"
              onClick={onTrimEndToPlayhead}
              className="flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-0.5 text-amber-400 font-mono font-bold text-[10px]">
                →][
              </div>
              <span className="text-[9.5px] font-medium text-current whitespace-nowrap">Xóa phải</span>
            </button>

            {/* Delete (Xóa) */}
            <button
              type="button"
              onClick={onDeleteSelected}
              className="flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] text-rose-500 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-0.5">
                <Trash2 className="w-4 h-4 text-rose-500" />
              </div>
              <span className="text-[9.5px] font-medium whitespace-nowrap">Xóa</span>
            </button>

            {/* Speed (Tốc độ) */}
            <button
              type="button"
              onClick={() => setActiveDrawer('speed')}
              className="flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-0.5 text-[#00E5CC]">
                <Gauge className="w-4 h-4" />
              </div>
              <span className="text-[9.5px] font-medium text-current whitespace-nowrap">Tốc độ</span>
            </button>

            {/* Volume (Âm lượng) */}
            <button
              type="button"
              onClick={() => setActiveDrawer('volume')}
              className="flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-0.5 text-[#00E5CC]">
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-[9.5px] font-medium text-current whitespace-nowrap">Âm lượng</span>
            </button>

            {/* Auto Cutout (Xóa nền) */}
            <button
              type="button"
              onClick={() => {
                onUpdateClipProp('autoCutout', !currentClip.autoCutout);
              }}
              className={`flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] cursor-pointer active:scale-95 transition-transform ${
                currentClip.autoCutout ? 'text-[#00E5CC]' : ''
              }`}
            >
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center mb-0.5 ${
                currentClip.autoCutout ? 'bg-[#00E5CC]/20 border-[#00E5CC]' : 'bg-white/5 border-white/10'
              }`}>
                <Wand2 className="w-4 h-4" />
              </div>
              <span className="text-[9.5px] font-medium whitespace-nowrap">Xóa nền</span>
            </button>

            {/* Crop (Cắt cúp) */}
            <button
              type="button"
              onClick={onOpenCropModal}
              className="flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-0.5 text-[#00E5CC]">
                <Crop className="w-4 h-4" />
              </div>
              <span className="text-[9.5px] font-medium whitespace-nowrap">Cắt cúp</span>
            </button>

            {/* Flip Horizontal (Lật) */}
            <button
              type="button"
              onClick={onFlipHorizontal}
              className="flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-0.5 text-[#00E5CC]">
                <FlipHorizontal2 className="w-4 h-4" />
              </div>
              <span className="text-[9.5px] font-medium whitespace-nowrap">Lật</span>
            </button>

            {/* Filters (Bộ lọc cho clip) */}
            <button
              type="button"
              onClick={() => setActiveDrawer('filters')}
              className="flex flex-col items-center justify-center px-2.5 py-1 min-w-[50px] cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-0.5 text-[#00E5CC]">
                <Filter className="w-4 h-4" />
              </div>
              <span className="text-[9.5px] font-medium whitespace-nowrap">Bộ lọc</span>
            </button>
          </div>
        ) : (
          /* ROOT DOCK WHEN NO CLIP IS SELECTED (CapCut Mobile style) */
          <div className="flex items-center gap-1.5 min-w-full">
            {(
              [
                { id: 'add_media', label: isEn ? 'Add' : 'Thêm tệp', icon: Plus },
                { id: 'edit', label: isEn ? 'Edit' : 'Chỉnh sửa', icon: Scissors },
                { id: 'audio', label: isEn ? 'Audio' : 'Âm thanh', icon: Music },
                { id: 'text', label: isEn ? 'Text' : 'Văn bản', icon: Type },
                { id: 'stickers', label: isEn ? 'Stickers' : 'Nhãn dán', icon: Smile },
                { id: 'overlay', label: isEn ? 'Overlay' : 'Lớp phủ', icon: Film },
                { id: 'effects', label: isEn ? 'Effects' : 'Hiệu ứng', icon: Sparkles },
                { id: 'transitions', label: isEn ? 'Transitions' : 'Chuyển tiếp', icon: ArrowRightLeft },
                { id: 'ratio', label: isEn ? 'Ratio' : 'Tỷ lệ', icon: Square },
                { id: 'filters', label: isEn ? 'Filters' : 'Bộ lọc', icon: Filter },
                { id: 'adjust', label: isEn ? 'Adjust' : 'Điều chỉnh', icon: Sliders },
              ] as const
            ).map((tool) => {
              const Icon = tool.icon;
              const isActive = activeDrawer === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    if (tool.id === 'add_media') {
                      setShowAddMediaModal(true);
                      return;
                    }
                    if (tool.id === 'edit') {
                      const target = videoClips.find(
                        (c) => playheadSec >= c.startTime && playheadSec <= c.startTime + c.duration
                      ) || videoClips[0];
                      if (target) {
                        onSelectClip(target.id);
                      }
                      return;
                    }
                    if (tool.id === 'overlay') {
                      setShowAddMediaModal(true);
                      return;
                    }
                    setActiveDrawer((prev) => (prev === tool.id ? null : tool.id));
                  }}
                  className={`flex flex-col items-center justify-center py-1 px-3 min-w-[58px] rounded-lg cursor-pointer transition-all active:scale-95 ${
                    isActive
                      ? 'text-[#00E5CC] bg-[#00E5CC]/15 font-bold'
                      : isLight
                      ? 'text-[#475569] hover:text-[#0F172A]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[9.5px] leading-tight font-medium whitespace-nowrap">
                    {tool.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* 6. MODAL: MEDIA PICKER ACTION SHEET (Phone / Google Photos Library) */}
      {showAddMediaModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowAddMediaModal(false)}
          />
          <div
            className={`relative z-10 w-full p-4 rounded-t-3xl border-t shadow-2xl flex flex-col gap-3 animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#181922] border-[#2E3142] text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <span className="font-bold text-sm">Thêm phương tiện từ thiết bị</span>
              <button
                type="button"
                onClick={() => setShowAddMediaModal(false)}
                className="p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onAddMedia('video');
                  setShowAddMediaModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-[#00E5CC]/15 border border-[#00E5CC]/40 hover:bg-[#00E5CC]/25 flex items-center gap-3 active:scale-98 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00E5CC] text-[#071013] flex items-center justify-center font-bold shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-[#00E5CC]">🎬 Thư viện Video</div>
                  <div className="text-[10px] text-[#94A3B8] truncate">Mở video từ Thư viện điện thoại / Google Photos</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAddMedia('image');
                  setShowAddMediaModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 flex items-center gap-3 active:scale-98 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-purple-400">🖼️ Thư viện Ảnh</div>
                  <div className="text-[10px] text-[#94A3B8] truncate">Mở hình ảnh từ Thư viện điện thoại</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAddMedia('audio');
                  setShowAddMediaModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 flex items-center gap-3 active:scale-98 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-sky-400">🎵 Tệp Âm thanh</div>
                  <div className="text-[10px] text-[#94A3B8] truncate">Mở file nhạc, MP3, WAV từ thiết bị</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAddMedia('all');
                  setShowAddMediaModal(false);
                }}
                className={`w-full p-3 rounded-2xl border flex items-center gap-3 active:scale-98 transition-all cursor-pointer text-left ${
                  isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs">📁 Tất cả tệp đa phương tiện</div>
                  <div className="text-[10px] text-[#94A3B8] truncate">Chọn bất kỳ tệp video, ảnh, âm thanh nào</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SLIDING BOTTOM SHEETS / DRAWERS */}

      {/* DRAWER 1: TRANSITION BOTTOM DRAWER (CapCut Mobile style - Image 3 right) */}
      {activeDrawer === 'transitions' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveDrawer(null)}
          />
          <div
            className={`relative z-10 w-full h-[62vh] max-h-[85vh] rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#161720] border-[#2C2E3C] text-white'
            }`}
          >
            {/* Top Category Tabs (Hottrend, Lớp phủ, Chuyển động camera, Mờ dần, Cơ bản - Image 3 right) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 pt-3 pb-2 border-b border-inherit shrink-0">
              {(
                [
                  { id: 'hottrend', label: 'Hottrend' },
                  { id: 'overlay', label: 'Lớp phủ' },
                  { id: 'camera', label: 'Chuyển động camera' },
                  { id: 'fade', label: 'Mờ dần & Glitch' },
                  { id: 'basic', label: 'Cơ bản' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTransitionCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    transitionCategory === cat.id
                      ? 'bg-[#00E5CC] text-[#071013]'
                      : isLight
                      ? 'bg-gray-100 text-[#475569]'
                      : 'bg-white/10 text-[#94A3B8]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid of Transition Cards */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-2.5">
              {MOBILE_TRANSITION_ITEMS.filter(
                (tr) => transitionCategory === 'all' || tr.category === transitionCategory || tr.id === 'none'
              ).map((tr) => {
                const isSelected = (transitionClip?.transitionType || 'none') === tr.id;
                return (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => handleSelectTransition(tr.id)}
                    className={`flex flex-col items-center text-center group cursor-pointer active:scale-95 transition-transform`}
                  >
                    <div
                      style={{ background: tr.swatch }}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg shadow-sm border-2 transition-all ${
                        isSelected
                          ? 'border-[#00E5CC] ring-4 ring-[#00E5CC]/40 scale-105'
                          : 'border-transparent'
                      }`}
                    >
                      <span>{tr.icon}</span>
                    </div>
                    <span className="text-[9.5px] mt-1 font-medium truncate w-full leading-tight text-inherit">
                      {tr.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Duration Slider: 0.1s ————●———— 3.5s (Image 3 right) */}
            <div className="px-5 py-2.5 border-t border-inherit shrink-0 flex items-center gap-3">
              <span className="text-[10px] font-mono text-[#94A3B8]">0.1s</span>
              <input
                type="range"
                min={0.1}
                max={3.5}
                step={0.1}
                value={transitionDuration}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTransitionDuration(val);
                  if (targetTransitionClipId) {
                    onUpdateClipProp('transitionDuration', val);
                  }
                }}
                className="flex-1 accent-[#00E5CC] h-1.5 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#94A3B8]">3.5s</span>
              <span className="font-mono text-xs text-[#00E5CC] font-bold w-10 text-right">
                {transitionDuration.toFixed(1)}s
              </span>
            </div>

            {/* Bottom Action Row: 'Tất cả' on left, 'Hiệu ứng chuyển tiếp' center, '✓' right (Image 3 right) */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-inherit shrink-0">
              <button
                type="button"
                onClick={() => {
                  const type = transitionClip?.transitionType || 'zoom_in';
                  onApplyTransitionToAll(type, transitionDuration);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#00E5CC] bg-[#00E5CC]/15 active:scale-95 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tất cả</span>
              </button>

              <div className="font-bold text-xs tracking-tight">
                Hiệu ứng chuyển tiếp
              </div>

              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="w-8 h-8 rounded-full bg-[#00E5CC] text-black flex items-center justify-center font-bold active:scale-95 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 2: STICKER BOTTOM SHEET (CapCut Mobile style - Image 6) */}
      {activeDrawer === 'stickers' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveDrawer(null)}
          />
          <div
            className={`relative z-10 w-full h-[65vh] max-h-[85vh] rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#161720] border-[#2C2E3C] text-white'
            }`}
          >
            {/* Header with Search Bar (Image 6) */}
            <div className="p-3 border-b border-inherit shrink-0 flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isLight ? 'bg-[#F1F5F9] border-[#CBD5E1]' : 'bg-[#1F212C] border-[#313544]'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhãn dán..."
                  value={stickerSearch}
                  onChange={(e) => setStickerSearch(e.target.value)}
                  className="bg-transparent border-none outline-hidden text-xs flex-1 text-inherit placeholder:text-[#94A3B8]"
                />
                {stickerSearch && (
                  <button type="button" onClick={() => setStickerSearch('')}>
                    <X className="w-3.5 h-3.5 text-[#94A3B8]" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="p-1.5 rounded-full hover:bg-black/10 text-inherit cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Pills (Biểu cảm, Cờ thế giới, CTA Like/Subscribe, Khung neon) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2 border-b border-inherit shrink-0">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'cta', label: '🔔 CTA / Subscribe' },
                  { id: 'faces', label: '😀 Biểu cảm' },
                  { id: 'flags', label: '🌐 Cờ thế giới' },
                  { id: 'emoji', label: '🔥 Xu hướng' },
                  { id: 'neon', label: '✨ Neon' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStickerCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    stickerCategory === cat.id
                      ? 'bg-[#00E5CC] text-[#071013]'
                      : isLight
                      ? 'bg-gray-100 text-[#475569]'
                      : 'bg-white/10 text-[#94A3B8]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 4-Column Rounded Square Sticker Cards (Image 6) */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-2">
              {filteredStickers.map((stk) => {
                const flagCode = stk.cat === 'flags' ? extractFlagIsoCode(stk.icon) : null;
                const flagUrl = flagCode ? getFlagGraphicDataUrl(flagCode) : null;
                const emojiMatch = stk.icon.match(/[\p{Emoji}\u200d]+/u);
                const emojiPart = emojiMatch ? emojiMatch[0] : '✨';
                const badgeText =
                  stk.badgeText ||
                  (stk.cat === 'cta' ? stk.icon.replace(/[\p{Emoji}\u200d]+/u, '').trim() : '');

                return (
                  <button
                    key={stk.uid}
                    type="button"
                    onClick={() => {
                      onDropResource(
                        {
                          kind: 'sticker',
                          name: stk.label,
                          duration: 3.5,
                          stickerEmoji: stk.icon,
                          stickerType: stk.id,
                        },
                        3,
                        playheadSec
                      );
                      setActiveDrawer(null);
                    }}
                    className={`aspect-square rounded-2xl border p-1.5 flex flex-col items-center justify-center text-center cursor-pointer active:scale-90 transition-transform shadow-xs ${
                      isLight
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#00E5CC]'
                        : 'bg-[#1E202B] border-[#2E3140] hover:border-[#00E5CC]'
                    }`}
                  >
                    {flagUrl ? (
                      <img src={flagUrl} alt={stk.label} className="w-8 h-8 rounded object-cover shadow-xs" />
                    ) : badgeText ? (
                      <div className="flex flex-col items-center justify-center gap-0.5 max-w-full">
                        <span className="text-lg leading-none">{emojiPart}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-tight uppercase truncate max-w-[64px] leading-tight shadow-xs"
                          style={{
                            backgroundColor: stk.badgeBg || '#EF4444',
                            color: '#FFFFFF',
                          }}
                        >
                          {badgeText}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl leading-none">{stk.icon}</span>
                    )}
                    <span className="text-[9px] font-medium truncate w-full mt-1 leading-tight text-inherit">
                      {stk.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 3: AUDIO & SOUND EFFECTS BOTTOM SHEET (Image 1 right) */}
      {activeDrawer === 'audio' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveDrawer(null)}
          />
          <div
            className={`relative z-10 w-full h-[65vh] max-h-[85vh] rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#161720] border-[#2C2E3C] text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-inherit shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Music className="w-4 h-4 text-[#00E5CC]" />
                <span>{isEn ? 'Add Sound' : 'Thêm âm thanh'}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-full text-inherit hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Device / Google Drive Audio Picker Button */}
            <div className="p-3 pb-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onAddMedia('audio');
                  setActiveDrawer(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#00E5CC] text-white font-bold text-xs shadow-md active:scale-98 transition-transform cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>{isEn ? '📁 Pick Audio from Device / Google Drive' : '📁 Chọn tệp âm thanh từ thiết bị / Google Drive'}</span>
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2 border-b border-inherit shrink-0">
              {(
                [
                  { id: 'all', label: 'Tất cả' },
                  { id: 'device', label: '📱 Bộ nhớ máy' },
                  { id: 'tiktok', label: '🔥 Viral TikTok' },
                  { id: 'bgm', label: '🎵 Nhạc nền BGM' },
                  { id: 'sfx', label: '⚡ Hiệu ứng SFX' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (cat.id === 'device') {
                      onAddMedia('audio');
                      setActiveDrawer(null);
                    } else {
                      setAudioCategory(cat.id);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    audioCategory === cat.id
                      ? 'bg-[#00E5CC] text-[#071013]'
                      : isLight
                      ? 'bg-gray-100 text-[#475569]'
                      : 'bg-white/10 text-[#94A3B8]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Audio Items List (Image 1 right) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {SFX_LIBRARY.filter(
                (s) => audioCategory === 'all' || s.subCat === audioCategory
              ).map((sfx) => {
                const isPlayingThis = activePlayingAudioId === sfx.id;
                return (
                  <div
                    key={sfx.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border shadow-xs transition-colors ${
                      isLight
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#00E5CC]'
                        : 'bg-[#1E202B] border-[#2E3140] hover:border-[#00E5CC]'
                    }`}
                  >
                    {/* Play Preview Button */}
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (isPlayingThis) {
                            setActivePlayingAudioId(null);
                          } else {
                            setActivePlayingAudioId(sfx.id);
                            webAudioEngine.playSfx(sfx.id, 0.7);
                            setTimeout(() => setActivePlayingAudioId(null), sfx.durationSec * 1000);
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-[#00E5CC] text-black flex items-center justify-center shrink-0 active:scale-90 transition-transform cursor-pointer"
                      >
                        {isPlayingThis ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{sfx.label}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">
                          {sfx.category} · {sfx.durationSec.toFixed(1)}s
                        </div>
                      </div>
                    </div>

                    {/* Use Audio Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onDropResource(
                          {
                            kind: 'audio_sfx',
                            name: sfx.label,
                            duration: sfx.durationSec,
                            sfxPresetId: sfx.id,
                          },
                          1,
                          playheadSec
                        );
                        setActiveDrawer(null);
                      }}
                      className="px-3 py-1 rounded-full bg-[#00E5CC] text-black font-bold text-xs active:scale-95 transition-transform cursor-pointer"
                    >
                      Sử dụng
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 4: TEXT & SUBTITLES BOTTOM SHEET (Image 5) */}
      {activeDrawer === 'text' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveDrawer(null)}
          />
          <div
            className={`relative z-10 w-full h-[55vh] max-h-[85vh] rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#161720] border-[#2C2E3C] text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-inherit shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Type className="w-4 h-4 text-[#00E5CC]" />
                <span>{isEn ? 'Add Text & Subtitles' : 'Thêm văn bản & Phụ đề'}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="p-1 rounded-full text-inherit hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Add Standard Text Box */}
              <button
                type="button"
                onClick={() => {
                  onDropResource(
                    {
                      kind: 'text',
                      name: 'Văn bản mẫu',
                      subtitleText: 'Nhập chữ của bạn ở đây',
                      duration: 4.0,
                    },
                    2,
                    playheadSec
                  );
                  setActiveDrawer(null);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#00E5CC] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-transform cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isEn ? 'Add Standard Text' : 'A+ Thêm chữ mặc định'}</span>
              </button>

              {/* Text Templates Grid */}
              <div className="pt-2">
                <div className="text-xs font-bold text-[#94A3B8] mb-2 uppercase">
                  {isEn ? 'Viral Text Templates' : 'Mẫu chữ xu hướng'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { title: '🔥 TikTok Viral Hook', bg: 'linear-gradient(135deg, #FF0055 0%, #7000FF 100%)', text: 'XEM ĐẾN CUỐI NHÉ 🔥' },
                      { title: '⚡ Cyberpunk Neon', bg: 'linear-gradient(135deg, #00E5CC 0%, #0284C7 100%)', text: 'NEON CYBERPUNK 2077' },
                      { title: '🎬 Điện ảnh Cinema', bg: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)', text: 'CINEMATIC TRAILER' },
                      { title: '📰 Tin tức Breaking', bg: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', text: 'BREAKING NEWS 24/7' },
                    ] as const
                  ).map((tpl) => (
                    <button
                      key={tpl.title}
                      type="button"
                      onClick={() => {
                        onDropResource(
                          {
                            kind: 'text',
                            name: tpl.title,
                            subtitleText: tpl.text,
                            duration: 4.0,
                          },
                          2,
                          playheadSec
                        );
                        setActiveDrawer(null);
                      }}
                      style={{ background: tpl.bg }}
                      className="p-3 rounded-xl text-white font-bold text-xs text-center shadow-md active:scale-95 transition-transform cursor-pointer"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 5: ASPECT RATIO DRAWER */}
      {activeDrawer === 'ratio' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveDrawer(null)}
          />
          <div
            className={`relative z-10 w-full p-4 rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#161720] border-[#2C2E3C] text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <span className="font-bold text-sm">Chọn Tỷ lệ khung hình</span>
              <button type="button" onClick={() => setActiveDrawer(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-3 max-h-[50vh] overflow-y-auto">
              {(
                [
                  { id: 'original', label: 'Gốc', sub: 'Tự động' },
                  { id: '9:16', label: '9:16', sub: 'TikTok/Reels' },
                  { id: '16:9', label: '16:9', sub: 'YouTube' },
                  { id: '1:1', label: '1:1', sub: 'Instagram' },
                  { id: '4:3', label: '4:3', sub: 'Cổ điển' },
                  { id: '3:4', label: '3:4', sub: 'Chân dung' },
                  { id: '21:9', label: '21:9', sub: 'Điện ảnh' },
                  { id: '2.35:1', label: '2.35:1', sub: 'Scope' },
                  { id: '1.85:1', label: '1.85:1', sub: 'Phim rạp' },
                  { id: '2:1', label: '2:1', sub: 'Netflix' },
                  { id: '5.8"', label: '5.8"', sub: 'Tràn viền' },
                ] as const
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onSetAspectRatio(r.id);
                    setActiveDrawer(null);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform ${
                    aspectRatio === r.id
                      ? 'border-[#00E5CC] bg-[#00E5CC]/15 text-[#00E5CC] font-bold'
                      : isLight
                      ? 'bg-gray-100 border-gray-200 text-[#0F172A]'
                      : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <span className="font-mono text-xs">{r.label}</span>
                  <span className="text-[9px] text-[#94A3B8]">{r.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 6: SPEED ADJUSTMENT DRAWER */}
      {activeDrawer === 'speed' && currentClip && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveDrawer(null)}
          />
          <div
            className={`relative z-10 w-full p-4 rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#161720] border-[#2C2E3C] text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <span className="font-bold text-sm">Chỉnh Tốc độ Clip</span>
              <button type="button" onClick={() => setActiveDrawer(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Tốc độ hiện tại:</span>
                <span className="font-mono text-sm font-bold text-[#00E5CC]">
                  {(currentClip.speed || 1.0).toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={10.0}
                step={0.1}
                value={currentClip.speed || 1.0}
                onChange={(e) => onUpdateClipProp('speed', Number(e.target.value))}
                className="w-full accent-[#00E5CC] h-2 cursor-pointer"
              />
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {[0.2, 0.5, 1.0, 1.5, 2.0, 5.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onUpdateClipProp('speed', s)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                      currentClip.speed === s
                        ? 'bg-[#00E5CC] text-black border-[#00E5CC]'
                        : isLight
                        ? 'bg-gray-100 text-[#0F172A]'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 7: VOLUME ADJUSTMENT DRAWER */}
      {activeDrawer === 'volume' && currentClip && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveDrawer(null)}
          />
          <div
            className={`relative z-10 w-full p-4 rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#161720] border-[#2C2E3C] text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <span className="font-bold text-sm">Chỉnh Âm lượng Clip</span>
              <button type="button" onClick={() => setActiveDrawer(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Âm lượng:</span>
                <span className="font-mono text-sm font-bold text-[#00E5CC]">
                  {currentClip.volume ?? 100}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={currentClip.volume ?? 100}
                onChange={(e) => onUpdateClipProp('volume', Number(e.target.value))}
                className="w-full accent-[#00E5CC] h-2 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onUpdateClipProp('volume', 0)}
                  className="flex-1 py-2 rounded-xl bg-rose-500/15 text-rose-500 font-bold text-xs"
                >
                  Tắt tiếng (0%)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateClipProp('volume', 100)}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                    isLight ? 'bg-slate-100 text-[#0F172A] hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Mặc định (100%)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateClipProp('volume', 200)}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                    isLight ? 'bg-[#00E5CC]/25 text-[#0F766E]' : 'bg-[#00E5CC]/20 text-[#00E5CC]'
                  }`}
                >
                  Tăng cực đại (200%)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 8: FILTERS DRAWER */}
      {activeDrawer === 'filters' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveDrawer(null)}
          />
          <div
            className={`relative z-10 w-full p-4 rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#161720] border-[#2C2E3C] text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <span className="font-bold text-sm">Kho Bộ lọc màu (LUT)</span>
              <button type="button" onClick={() => setActiveDrawer(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2.5 pt-4">
              {(
                [
                  { id: 'none', label: 'Gốc (None)', bg: '#334155' },
                  { id: 'cinematic', label: 'Điện ảnh (Cinema)', bg: '#0F766E' },
                  { id: 'vintage', label: 'Cổ điển (Vintage)', bg: '#B45309' },
                  { id: 'cyberpunk', label: 'Cyberpunk', bg: '#7E22CE' },
                  { id: 'bw', label: 'Đen trắng (B&W)', bg: '#18181B' },
                  { id: 'warm', label: 'Ấm áp (Warm)', bg: '#C2410C' },
                  { id: 'cool', label: 'Lạnh (Cool)', bg: '#1D4ED8' },
                  { id: 'vibrant', label: 'Sống động', bg: '#BE185D' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    onUpdateClipProp('filterPreset', f.id);
                    setActiveDrawer(null);
                  }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                >
                  <div
                    style={{ backgroundColor: f.bg }}
                    className="w-full aspect-square rounded-xl shadow-sm border border-white/10"
                  />
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 9: ADJUSTMENTS DRAWER */}
      {activeDrawer === 'adjust' && (activeAdjustmentClip || videoClips.length > 0) && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setActiveDrawer(null)}
          />
          <div
            className={`relative z-10 w-full p-4 rounded-t-3xl border-t shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${
              isLight ? 'bg-white border-[#CBD5E1] text-[#0F172A]' : 'bg-[#161720] border-[#2C2E3C] text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <span className="font-bold text-sm">Điều chỉnh ánh sáng & Màu sắc</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = activeAdjustmentClip;
                    if (target) {
                      if (!selectedClipId) onSelectClip(target.id);
                      [
                        'brightness',
                        'contrast',
                        'saturation',
                        'warmth',
                        'tint',
                        'highlight',
                        'shadow',
                        'sharpen',
                        'vignette',
                        'hslHue',
                        'hslSat',
                        'hslBri',
                      ].forEach((k) => onUpdateClipProp(k, 0, target.id));
                    }
                  }}
                  className="text-xs text-[#00E5CC] hover:underline font-medium cursor-pointer"
                >
                  Đặt lại về 0
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="p-1 rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="py-3 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {[
                { key: 'brightness', label: 'Độ sáng (Brightness)', min: -100, max: 100 },
                { key: 'contrast', label: 'Độ tương phản (Contrast)', min: -100, max: 100 },
                { key: 'saturation', label: 'Độ bão hòa màu (Saturation)', min: -100, max: 100 },
                { key: 'warmth', label: 'Nhiệt độ màu (Warmth / Temp)', min: -100, max: 100 },
                { key: 'tint', label: 'Sắc thái màu (Tint)', min: -100, max: 100 },
                { key: 'highlight', label: 'Vùng sáng (Highlights)', min: -100, max: 100 },
                { key: 'shadow', label: 'Vùng tối (Shadows)', min: -100, max: 100 },
                { key: 'sharpen', label: 'Độ sắc nét (Sharpen)', min: -100, max: 100 },
                { key: 'vignette', label: 'Viền tối góc (Vignette)', min: -100, max: 100 },
                { key: 'hslHue', label: 'Tông màu HSL (Hue)', min: -100, max: 100 },
                { key: 'hslSat', label: 'Độ bão hòa HSL (Sat)', min: -100, max: 100 },
                { key: 'hslBri', label: 'Độ sáng HSL (Lightness)', min: -100, max: 100 },
              ].map((adj) => {
                const currentVal = (activeAdjustmentClip?.[adj.key as keyof TimelineClip] as number) ?? 0;
                return (
                  <div key={adj.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">{adj.label}</span>
                      <span className="font-mono text-[#00E5CC] font-bold">
                        {currentVal}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={adj.min}
                      max={adj.max}
                      value={currentVal}
                      onChange={(e) => {
                        const targetId = activeAdjustmentClip?.id;
                        if (targetId && !selectedClipId) {
                          onSelectClip(targetId);
                        }
                        onUpdateClipProp(adj.key, Number(e.target.value), targetId);
                      }}
                      className="w-full accent-[#00E5CC] h-1.5 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
