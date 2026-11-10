import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Scissors,
  Trash2,
  Shuffle,
  Clock,
  ZoomIn,
  ZoomOut,
  Magnet,
  Undo2,
  Redo2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Plus,
  MousePointer,
  FlipHorizontal,
  RotateCw,
  Snowflake,
  ArrowLeftToLine,
  ArrowRightToLine,
  Edit3,
  Mic,
  Link2,
  Unlink2,
  Rewind,
  Flag,
  Music2,
  Copy,
  ClipboardPaste,
  Layers,
  Activity,
  ChevronUp,
  ChevronDown,
  Film,
  Crop,
  Sparkles,
  UserCheck,
  Wand2,
  Cpu,
  EyeOff as DisableIcon,
  FolderOpen,
  Sliders,
} from 'lucide-react';
import {
  TimelineClip,
  TimelineMarker,
  TimelineTrackDef,
  TimelineDragPayload,
  DEFAULT_TIMELINE_TRACKS,
  KeyframeEasingType,
  getClipsInMarqueeBox,
  moveSelectedClipsByDelta,
  computeCapCutDragInsertionPreview,
  TimelineInsertionSlot,
  findClosestTimelineSnapPoint,
  TimelineSnapTarget,
  shouldReleaseTimelinePointerCapture,
  MIN_TIMELINE_ZOOM_PPS,
  MAX_TIMELINE_ZOOM_PPS,
  clampTimelineZoom,
  stepTimelineZoom,
  stepTimelineZoomByWheelDelta,
  computeSynchronizedClipLayout,
  computeExtendedTimelineDuration,
  computeAdaptiveTimelineRuler,
  computeClipWaveformBars,
  getFlagGraphicDataUrl,
  extractFlagIsoCode,
} from '../utils/timelineEngine';

interface MultiTrackTimelineProps {
  clips: TimelineClip[];
  tracks?: TimelineTrackDef[];
  playheadSec: number;
  pixelsPerSecond: number;
  selectedClipId: string | null;
  selectedClipIds?: string[];
  rangeStartIndex: number;
  rangeEndIndex: number;
  targetDurationSec: number;
  snapEnabled: boolean;
  autoSnapEdge?: boolean;
  audioLinked: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isPlaying?: boolean;
  toolMode?: 'select' | 'razor';
  markers?: TimelineMarker[];
  hasCopiedAttributes?: boolean;
  hasClipboardAttributes?: boolean;
  trackLocks: Record<number, boolean>;
  trackHidden: Record<number, boolean>;
  trackMuted: Record<number, boolean>;
  coverDataUrl?: string | null;
  onPlayheadChange: (sec: number) => void;
  onZoomChange: (pps: number) => void;
  onSelectClip: (clipId: string | null) => void;
  onSelectMultipleClips?: (clipIds: string[]) => void;
  onToolModeChange?: (mode: 'select' | 'razor') => void;
  onSplitAtPlayhead: () => void;
  onSplitAtExactTime?: (clipId: string, timeSec: number) => void;
  onDeleteSelected: () => void;
  onShuffleRange: () => void;
  onBatchTrim: (targetSec: number | [number, number]) => void;
  onRangeStartChange: (val: number) => void;
  onRangeEndChange: (val: number) => void;
  onTargetDurationChange: (val: number) => void;
  onMoveClipStart: (clipId: string, newStartSec: number, newTrackIndex?: number) => void;
  onDragSessionStart?: () => void;
  onPreviewClipsDuringDrag?: (nextClips: TimelineClip[]) => void;
  onDragSessionEnd?: () => void;
  onResizeClipEdge?: (clipId: string, edge: 'left' | 'right', deltaSec: number) => void;
  onDropResourceOnTimeline?: (
    payload: TimelineDragPayload,
    targetTrackIndex: number,
    dropTimeSec: number,
    targetClipId?: string
  ) => void;
  onAddTrackLayer?: (type?: 'overlay' | 'text' | 'audio') => void;
  onAddOverlayClip?: () => void;
  onMoveTrackOrder?: (trackId: number, direction: 'up' | 'down') => void;
  onUndo: () => void;
  onRedo: () => void;
  onTrimStartToPlayhead: () => void;
  onTrimEndToPlayhead: () => void;
  onFreezeFrame: () => void;
  onReverseSelected: () => void;
  onQuickFlipSelected: () => void;
  onQuickRotateSelected: () => void;
  onToggleSnap: () => void;
  onToggleAutoSnapEdge?: () => void;
  onToggleAudioLink: () => void;
  onToggleTrackLock: (trackIndex: number) => void;
  onToggleTrackHidden: (trackIndex: number) => void;
  onToggleTrackMuted: (trackIndex: number) => void;
  onCaptureCover: () => void;
  onAddQuickClip: () => void;
  onStartVoiceover?: () => void;
  onAddMarker?: () => void;
  onCycleMarkerColor?: (markerId: string) => void;
  onAutoBeats?: (mode?: 'beat1' | 'beat2' | 'clear') => void;
  onExtractAudio?: (clipId: string) => void;
  onCopyAttributes?: (clipId: string) => void;
  onPasteAttributes?: (clipId: string) => void;
  onDuplicateClip?: (clipId: string) => void;
  onCreateCompoundClip?: (clipId?: string) => void;
  onVocalIsolation?: (clipId: string, mode: 'keep_vocal' | 'remove_vocal') => void;
  onSetKeyframeEasing?: (clipId: string, easing: KeyframeEasingType) => void;
  onOpenAiSceneSplit?: () => void;
  onOpenSceneSplitModal?: () => void;
  onDeleteTrackLayer?: (trackIndex: number) => void;
  onCloseGapAtTime?: (trackIndex: number, timeSec: number) => void;
  onCloseAllGapsOnTrack?: (trackIndex: number) => void;
  onCopySelectedClips?: (clipId?: string) => void;
  onCutSelectedClips?: (clipId?: string) => void;
  onPasteClipboardClips?: (targetTimeSec?: number, targetTrackIndex?: number) => void;
  hasClipboardClips?: boolean;
  onToggleDisableClip?: (clipId?: string) => void;
  onGroupSelectedClips?: () => void;
  onUngroupSelectedClips?: () => void;
  onAiExtendClip?: (clipId: string) => void;
  onSyncVideoAudio?: (clipId: string) => void;
  onExportSelectedClip?: (clipId: string) => void;
  onReplaceClipMedia?: (clipId: string) => void;
  onQuickAiAction?: (
    action:
      | 'crop'
      | 'filler_words'
      | 'noise_reduction'
      | 'auto_cutout'
      | 'retouch'
      | 'hd_upscale'
      | 'prerender'
      | 'transcript'
      | 'ai_edit'
      | 'multicam'
      | 'save_preset'
      | 'open_location'
      | 'edit_effects'
      | 'speed_ramp',
    clipId?: string
  ) => void;
  markInSec?: number | null;
  markOutSec?: number | null;
  loopRangeEnabled?: boolean;
  onSetMarkIn?: () => void;
  onSetMarkOut?: () => void;
  onClearMarkInOut?: () => void;
  onToggleLoopRange?: () => void;
  onRippleTrimRange?: (mode: 'keep_inside' | 'ripple_delete_inside') => void;
  onRemoveDeadAirSilence?: () => void;
  onSyncClipsToBeats?: () => void;
  language?: 'vi' | 'en';
}

const TRACK_HEADER_WIDTH = 136;
const RULER_HEIGHT_PX = 24;

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  clips: incomingClips,
  tracks = DEFAULT_TIMELINE_TRACKS,
  playheadSec,
  pixelsPerSecond,
  selectedClipId,
  selectedClipIds = [],
  rangeStartIndex,
  rangeEndIndex,
  targetDurationSec,
  snapEnabled,
  autoSnapEdge = true,
  audioLinked,
  canUndo,
  canRedo,
  isPlaying = false,
  toolMode = 'select',
  markers = [],
  hasCopiedAttributes = false,
  hasClipboardAttributes = false,
  trackLocks,
  trackHidden,
  trackMuted,
  coverDataUrl,
  onPlayheadChange,
  onZoomChange,
  onSelectClip,
  onSelectMultipleClips,
  onToolModeChange,
  onSplitAtPlayhead,
  onSplitAtExactTime,
  onDeleteSelected,
  onShuffleRange,
  onBatchTrim,
  onRangeStartChange,
  onRangeEndChange,
  onTargetDurationChange,
  onMoveClipStart,
  onDragSessionStart,
  onPreviewClipsDuringDrag,
  onDragSessionEnd,
  onResizeClipEdge,
  onDropResourceOnTimeline,
  onAddTrackLayer,
  onAddOverlayClip,
  onMoveTrackOrder,
  onUndo,
  onRedo,
  onTrimStartToPlayhead,
  onTrimEndToPlayhead,
  onFreezeFrame,
  onReverseSelected,
  onQuickFlipSelected,
  onQuickRotateSelected,
  onToggleSnap,
  onToggleAutoSnapEdge,
  onToggleAudioLink,
  onToggleTrackLock,
  onToggleTrackHidden,
  onToggleTrackMuted,
  onCaptureCover,
  onAddQuickClip,
  onStartVoiceover,
  onAddMarker,
  onCycleMarkerColor,
  onAutoBeats,
  onExtractAudio,
  onCopyAttributes,
  onPasteAttributes,
  onDuplicateClip,
  onCreateCompoundClip,
  onVocalIsolation,
  onSetKeyframeEasing,
  onOpenAiSceneSplit,
  onOpenSceneSplitModal,
  onDeleteTrackLayer,
  onCloseGapAtTime,
  onCloseAllGapsOnTrack,
  onCopySelectedClips,
  onCutSelectedClips,
  onPasteClipboardClips,
  hasClipboardClips = false,
  onToggleDisableClip,
  onGroupSelectedClips,
  onUngroupSelectedClips,
  onAiExtendClip,
  onSyncVideoAudio,
  onExportSelectedClip,
  onReplaceClipMedia,
  onQuickAiAction,
  markInSec = null,
  markOutSec = null,
  loopRangeEnabled = false,
  onSetMarkIn,
  onSetMarkOut,
  onClearMarkInOut,
  onToggleLoopRange,
  onRippleTrimRange,
  onRemoveDeadAirSilence,
  onSyncClipsToBeats,
  language = 'vi',
}) => {
  const timelineSectionRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const trackRowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const lastEmptyClickTsRef = useRef<number>(0);
  const lastClipClickRef = useRef<{ clipId: string; ts: number }>({
    clipId: '',
    ts: 0,
  });
  const dragSessionRef = useRef<{
    anchorClipId: string;
    startClientX: number;
    startClientY: number;
    grabOffsetSec: number;
    grabOffsetPxX: number;
    grabOffsetPxY: number;
    anchorInitialStart: number;
    anchorInitialTrack: number;
    initialClips: TimelineClip[];
    activeSelectedIds: string[];
    isDoubleClickPickup?: boolean;
    hasMovedThreshold?: boolean;
    pickupStartedAtMs?: number;
  } | null>(null);

  const [draggingPlayhead, setDraggingPlayhead] = useState(false);
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [isFloatingDragActive, setIsFloatingDragActive] = useState(false);
  const [dragCursorPos, setDragCursorPos] = useState<{
    clientX: number;
    clientY: number;
  } | null>(null);
  const [insertionSlot, setInsertionSlot] = useState<TimelineInsertionSlot | null>(null);
  const [dragPreviewClips, setDragPreviewClips] = useState<TimelineClip[] | null>(null);
  const pendingTimelineDragClipsRef = useRef<TimelineClip[] | null>(null);
  const timelineDragRafRef = useRef<number | null>(null);
  const clips = dragPreviewClips ?? incomingClips;
  const [dragOffsetSec, setDragOffsetSec] = useState(0);
  const [dragHoverTrackId, setDragHoverTrackId] = useState<number | null>(null);
  const [snapGuideTimeSec, setSnapGuideTimeSec] = useState<number | null>(null);
  const [snapGuideLabel, setSnapGuideLabel] = useState<string | null>(null);
  const [externalDropIndicator, setExternalDropIndicator] = useState<{
    trackId: number;
    timeSec: number;
  } | null>(null);

  // Marquee Selection Box state (Single click-drag OR double-click hold-drag on timeline)
  const [marqueeBox, setMarqueeBox] = useState<{
    startX: number;
    startY: number;
    currX: number;
    currY: number;
    isDoubleTapMode: boolean;
  } | null>(null);
  const marqueeBoxRef = useRef<{
    startX: number;
    startY: number;
    currX: number;
    currY: number;
    isDoubleTapMode: boolean;
  } | null>(null);

  const [resizingState, setResizingState] = useState<{
    clipId: string;
    edge: 'left' | 'right';
    initialX: number;
    origStartTime: number;
    origDuration: number;
  } | null>(null);

  const [showBatchTrimPopover, setShowBatchTrimPopover] = useState(false);
  const [showEditPilotPopover, setShowEditPilotPopover] = useState(false);
  const [minTrimSec, setMinTrimSec] = useState(2.0);
  const [maxTrimSec, setMaxTrimSec] = useState(4.0);

  // Right-click Context Menu on Clip (Image 3)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    clip: TimelineClip;
  } | null>(null);

  // Right-click Context Menu on Empty Timeline / Track Gap (Image 2)
  const [emptyContextMenu, setEmptyContextMenu] = useState<{
    x: number;
    y: number;
    trackIndex: number;
    timeSec: number;
  } | null>(null);

  const effectiveSelectedIds =
    selectedClipIds.length > 0
      ? selectedClipIds
      : selectedClipId
      ? [selectedClipId]
      : [];

  const isClipSelected = (id: string) => effectiveSelectedIds.includes(id);

  // Always keep Main Video Track (index === 0) visible as the base timeline origin track;
  // when dragging a clip above/below Track 0, dynamically expose Overlay/PIP (3) or Audio (1) track!
  const visibleTracks = useMemo(
    () =>
      tracks.filter(
        (tr) =>
          tr.index === 0 ||
          clips.some((c) => c.trackIndex === tr.index) ||
          (isFloatingDragActive &&
            dragHoverTrackId === tr.index &&
            (tr.index === 3 || tr.index === 1))
      ),
    [tracks, clips, isFloatingDragActive, dragHoverTrackId]
  );

  const timelineTotalSec = useMemo(
    () => computeExtendedTimelineDuration(clips, pixelsPerSecond, 1440),
    [clips, pixelsPerSecond]
  );
  const timelineWidthPx = TRACK_HEADER_WIDTH + timelineTotalSec * pixelsPerSecond;

  const clientXToSeconds = (clientX: number): number => {
    const container = scrollContainerRef.current;
    if (!container) return 0;
    const rect = container.getBoundingClientRect();
    const xInTrack = clientX - rect.left + container.scrollLeft - TRACK_HEADER_WIDTH;
    return Math.max(0, Number((xInTrack / pixelsPerSecond).toFixed(3)));
  };

  const getTrackIdAtClientY = (clientY: number): number | undefined => {
    const session = dragSessionRef.current;
    const mainEl = trackRowRefs.current[0];
    if (mainEl) {
      const mainRect = mainEl.getBoundingClientRect();
      // Keep clip on Track 0 while cursor is within Track 0 vertical bounds (unless lifted > 28px upward above startY)
      if (
        session &&
        session.anchorInitialTrack === 0 &&
        clientY >= mainRect.top - 4 &&
        clientY <= mainRect.bottom + 8 &&
        session.startClientY - clientY <= 28
      ) {
        return 0;
      }
      // If lifted above the Main Video Track, target Overlay / PIP track (index 3)
      if (clientY < mainRect.top - 4) {
        return 3;
      }
    }
    for (const tr of visibleTracks) {
      const el = trackRowRefs.current[tr.index];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientY >= r.top - 4 && clientY <= r.bottom + 4) {
        return tr.index;
      }
    }
    if (mainEl) {
      const mainRect = mainEl.getBoundingClientRect();
      if (clientY > mainRect.bottom + 8) {
        return 1;
      }
    }
    return 0;
  };

  // Compute covered track indices strictly using container-local Y coordinates [minLocalY, maxLocalY]
  const getCoveredTrackIdsInScrollArea = (y1Local: number, y2Local: number): number[] => {
    const container = scrollContainerRef.current;
    if (!container) return [];
    const containerRect = container.getBoundingClientRect();
    const minY = Math.min(y1Local, y2Local);
    const maxY = Math.max(y1Local, y2Local);
    const covered: number[] = [];

    for (const tr of visibleTracks) {
      const el = trackRowRefs.current[tr.index];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const rowTopLocal = r.top - containerRect.top + container.scrollTop;
      const rowBottomLocal = r.bottom - containerRect.top + container.scrollTop;
      if (rowBottomLocal >= minY && rowTopLocal <= maxY) {
        covered.push(tr.index);
      }
    }
    return covered;
  };

  // Build magnetic snap targets: ONLY 00:00, Playhead, and the rightmost edge of the very last clip at the end of the timeline (excluding Overlay tracks)
  const buildTimelineSnapTargets = (
    sourceClips: TimelineClip[],
    excludeIds: Set<string>,
    includePlayhead: boolean = true
  ): TimelineSnapTarget[] => {
    const overlayTrackSet = new Set(
      tracks
        .filter((t) => t.type === 'overlay' || t.kind === 'overlay' || t.index >= 3)
        .map((t) => t.index)
    );

    const targets: TimelineSnapTarget[] = [{ timeSec: 0, label: '' }];
    if (includePlayhead) {
      targets.push({
        timeSec: Number(playheadSec.toFixed(2)),
        label: '',
      });
    }

    let timelineLastClipRightEdge = 0;

    for (const c of sourceClips) {
      if (excludeIds.has(c.id)) continue;
      // Exclude Overlay / PIP layers from timeline end snapping
      if (overlayTrackSet.has(c.trackIndex) || c.trackIndex >= 3) continue;

      const cEnd = Number((c.startTime + c.duration).toFixed(2));
      if (cEnd > timelineLastClipRightEdge) {
        timelineLastClipRightEdge = cEnd;
      }
    }

    if (timelineLastClipRightEdge > 0) {
      targets.unshift({
        timeSec: timelineLastClipRightEdge,
        label: '',
      });
    }

    for (const m of markers) {
      targets.push({
        timeSec: Number(m.timeSec.toFixed(2)),
        label: '',
      });
    }
    return targets;
  };

  const handlePointerDownRuler = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setContextMenu(null);
    setEmptyContextMenu(null);
    if (dragSessionRef.current?.isDoubleClickPickup) {
      handlePointerUpTimeline();
      return;
    }
    setDraggingPlayhead(true);
    onPlayheadChange(clientXToSeconds(e.clientX));
  };

  // Start Marquee Selection Box when clicking and dragging on empty timeline space
  const handleMouseDownEmptyTrackArea = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (dragSessionRef.current?.isDoubleClickPickup) {
      e.stopPropagation();
      handlePointerUpTimeline();
      return;
    }
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left + container.scrollLeft;
    const clickY = e.clientY - rect.top + container.scrollTop;
    if (clickX < TRACK_HEADER_WIDTH) return;

    setContextMenu(null);
    setEmptyContextMenu(null);
    const nextBox = {
      startX: clickX,
      startY: clickY,
      currX: clickX,
      currY: clickY,
      isDoubleTapMode: false,
    };
    marqueeBoxRef.current = nextBox;
    setMarqueeBox(nextBox);
    onSelectMultipleClips?.([]);
  };

  const processClipDragAtClientCoords = (clientX: number, clientY: number) => {
    const session = dragSessionRef.current;
    if (!session) return;

    const moveDistPx = Math.hypot(
      clientX - session.startClientX,
      clientY - session.startClientY
    );
    if (!session.hasMovedThreshold && moveDistPx < 3) {
      return;
    }
    if (!session.hasMovedThreshold) {
      session.hasMovedThreshold = true;
      onDragSessionStart?.();
      setIsFloatingDragActive(true);
    }

    setDragCursorPos({ clientX, clientY });

    const hoveredTrackId = getTrackIdAtClientY(clientY) ?? session.anchorInitialTrack;
    setDragHoverTrackId(hoveredTrackId);

    const anchorOrig = session.initialClips.find((c) => c.id === session.anchorClipId);
    let tentativeStartSec = Math.max(0, clientXToSeconds(clientX) - session.grabOffsetSec);
    let snappedAt: number | null = null;

    if ((autoSnapEdge || snapEnabled) && anchorOrig && hoveredTrackId !== 0) {
      const snapThreshold = Math.min(0.55, Math.max(0.015, 16 / pixelsPerSecond));
      const selectedSet = new Set(session.activeSelectedIds);
      const candidateEdges = [
        tentativeStartSec,
        tentativeStartSec + anchorOrig.duration,
      ];
      const snapTargets = buildTimelineSnapTargets(
        session.initialClips,
        selectedSet,
        true
      );
      const snapRes = findClosestTimelineSnapPoint(
        candidateEdges,
        snapTargets,
        snapThreshold
      );
      if (snapRes.snapped && snapRes.snapTimeSec !== null) {
        tentativeStartSec = Math.max(0, tentativeStartSec + snapRes.deltaSec);
        snappedAt = snapRes.snapTimeSec;
      }
    }

    if (onPreviewClipsDuringDrag) {
      const { previewClips, slot } = computeCapCutDragInsertionPreview(
        session.initialClips,
        session.activeSelectedIds,
        hoveredTrackId,
        tentativeStartSec,
        snapEnabled,
        trackLocks
      );
      setInsertionSlot(slot);
      setSnapGuideTimeSec(
        slot && hoveredTrackId === 0 ? slot.startTime : snappedAt ?? tentativeStartSec
      );
      pendingTimelineDragClipsRef.current = previewClips;
      setDragPreviewClips(previewClips);
    } else {
      if (hoveredTrackId !== undefined && !trackLocks[hoveredTrackId]) {
        onMoveClipStart(session.anchorClipId, tentativeStartSec, hoveredTrackId);
      } else {
        onMoveClipStart(session.anchorClipId, tentativeStartSec);
      }
    }
  };

  const handlePointerMoveTimeline = (e: React.MouseEvent) => {
    if (
      (draggingPlayhead ||
        Boolean(marqueeBoxRef.current) ||
        Boolean(resizingState) ||
        Boolean(dragSessionRef.current) ||
        Boolean(draggingClipId)) &&
      shouldReleaseTimelinePointerCapture(
        e.buttons,
        Boolean(dragSessionRef.current?.isDoubleClickPickup)
      )
    ) {
      handlePointerUpTimeline();
      return;
    }

    if (draggingPlayhead) {
      let targetSec = clientXToSeconds(e.clientX);
      if (autoSnapEdge || snapEnabled) {
        const snapThreshold = Math.min(0.45, Math.max(0.015, 16 / pixelsPerSecond));
        const snapTargets = buildTimelineSnapTargets(clips, new Set(), false);
        const snapRes = findClosestTimelineSnapPoint([targetSec], snapTargets, snapThreshold);
        if (snapRes.snapped && snapRes.snapTimeSec !== null) {
          targetSec = snapRes.snapTimeSec;
          setSnapGuideTimeSec(snapRes.snapTimeSec);
          setSnapGuideLabel(null);
        } else {
          setSnapGuideTimeSec(null);
          setSnapGuideLabel(null);
        }
      }
      onPlayheadChange(targetSec);
    } else if (marqueeBoxRef.current) {
      const container = scrollContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const activeBox = marqueeBoxRef.current;
      const currX = Math.max(
        TRACK_HEADER_WIDTH,
        e.clientX - rect.left + container.scrollLeft
      );
      const currY = Math.max(RULER_HEIGHT_PX, e.clientY - rect.top + container.scrollTop);
      const updatedBox = { ...activeBox, currX, currY };
      marqueeBoxRef.current = updatedBox;
      setMarqueeBox(updatedBox);

      // Require a minimum drag distance of 6px so a tiny mouse jitter does not select clips
      const dragDistancePx = Math.hypot(
        currX - activeBox.startX,
        currY - activeBox.startY
      );
      if (dragDistancePx < 6) {
        return;
      }

      const minBoxX = Math.min(activeBox.startX, currX);
      const maxBoxX = Math.max(activeBox.startX, currX);
      const startSec = Math.max(0, (minBoxX - TRACK_HEADER_WIDTH) / pixelsPerSecond);
      const endSec = Math.max(0, (maxBoxX - TRACK_HEADER_WIDTH) / pixelsPerSecond);

      // Strictly select ONLY clips on tracks whose vertical bounds intersect the marquee rectangle
      const coveredTracks = getCoveredTrackIdsInScrollArea(activeBox.startY, currY).filter(
        (idx) => !trackLocks[idx]
      );

      if (coveredTracks.length === 0) {
        onSelectMultipleClips?.([]);
        return;
      }

      const matchedIds = getClipsInMarqueeBox(clips, startSec, endSec, coveredTracks);
      onSelectMultipleClips?.(matchedIds);
    } else if (resizingState && onResizeClipEdge) {
      const targetClip = clips.find((c) => c.id === resizingState.clipId);
      if (targetClip) {
        const rawTotalDeltaSec = (e.clientX - resizingState.initialX) / pixelsPerSecond;
        const snapThreshold = Math.min(0.55, Math.max(0.015, 18 / pixelsPerSecond));
        const snapTargets = buildTimelineSnapTargets(
          clips,
          new Set([targetClip.id]),
          true
        );
        let snappedAt: number | null = null;

        if (resizingState.edge === 'right') {
          let desiredEnd = Math.max(
            resizingState.origStartTime + 0.1,
            resizingState.origStartTime + resizingState.origDuration + rawTotalDeltaSec
          );
          if (autoSnapEdge || snapEnabled) {
            const snapRes = findClosestTimelineSnapPoint(
              [desiredEnd],
              snapTargets,
              snapThreshold
            );
            if (snapRes.snapped && snapRes.snapTimeSec !== null) {
              desiredEnd = Math.max(resizingState.origStartTime + 0.1, snapRes.snapTimeSec);
              snappedAt = snapRes.snapTimeSec;
            }
          }
          const currentEnd = targetClip.startTime + targetClip.duration;
          const stepDeltaSec = Number((desiredEnd - currentEnd).toFixed(3));
          setSnapGuideTimeSec(snappedAt);
          if (Math.abs(stepDeltaSec) >= 0.005) {
            onResizeClipEdge(resizingState.clipId, 'right', stepDeltaSec);
          }
        } else {
          const origEnd = resizingState.origStartTime + resizingState.origDuration;
          let desiredStart = Math.max(
            0,
            Math.min(origEnd - 0.1, resizingState.origStartTime + rawTotalDeltaSec)
          );
          if (autoSnapEdge || snapEnabled) {
            const snapRes = findClosestTimelineSnapPoint(
              [desiredStart],
              snapTargets,
              snapThreshold
            );
            if (snapRes.snapped && snapRes.snapTimeSec !== null) {
              desiredStart = Math.max(0, Math.min(origEnd - 0.1, snapRes.snapTimeSec));
              snappedAt = snapRes.snapTimeSec;
            }
          }
          const stepDeltaSec = Number((desiredStart - targetClip.startTime).toFixed(3));
          setSnapGuideTimeSec(snappedAt);
          if (Math.abs(stepDeltaSec) >= 0.005) {
            onResizeClipEdge(resizingState.clipId, 'left', stepDeltaSec);
          }
        }
      }
      } else if (dragSessionRef.current || draggingClipId) {
      processClipDragAtClientCoords(e.clientX, e.clientY);
    }
  };

  const handlePointerUpTimeline = () => {
    const activeSession = dragSessionRef.current;
    const hadActualDrag = Boolean(activeSession?.hasMovedThreshold || resizingState);
    if (timelineDragRafRef.current !== null) {
      window.cancelAnimationFrame(timelineDragRafRef.current);
      timelineDragRafRef.current = null;
    }
    if (hadActualDrag && pendingTimelineDragClipsRef.current && onPreviewClipsDuringDrag) {
      onPreviewClipsDuringDrag(pendingTimelineDragClipsRef.current);
    }
    pendingTimelineDragClipsRef.current = null;
    setDragPreviewClips(null);
    if (hadActualDrag) {
      onDragSessionEnd?.();
    }
    dragSessionRef.current = null;
    marqueeBoxRef.current = null;
    setDraggingPlayhead(false);
    setDraggingClipId(null);
    setIsFloatingDragActive(false);
    setDragCursorPos(null);
    setInsertionSlot(null);
    setDragHoverTrackId(null);
    setSnapGuideTimeSec(null);
    setSnapGuideLabel(null);
    setResizingState(null);
    setMarqueeBox(null);
  };

  // Global window tracking while dragging a clip or scrubbing the playhead/marquee/resize
  // so releasing the mouse anywhere outside the timeline always clears draggingPlayhead
  useEffect(() => {
    const isClipDrag = Boolean(draggingClipId || isFloatingDragActive);
    const isOtherPointerCapture = Boolean(
      draggingPlayhead || resizingState || marqueeBox
    );
    if (!isClipDrag && !isOtherPointerCapture) return;

    const onWinMouseMove = (ev: MouseEvent) => {
      if (
        shouldReleaseTimelinePointerCapture(
          ev.buttons,
          Boolean(dragSessionRef.current?.isDoubleClickPickup)
        )
      ) {
        handlePointerUpTimeline();
        return;
      }
      if (isClipDrag) {
        processClipDragAtClientCoords(ev.clientX, ev.clientY);
      }
    };
    const onWinMouseUp = () => {
      // In double-click pickup mode, initial double-click mouseup should not end the pickup session;
      // the next mousedown commits it.
      if (dragSessionRef.current?.isDoubleClickPickup) return;
      handlePointerUpTimeline();
    };
    const onWinBlur = () => {
      handlePointerUpTimeline();
    };
    const onWinKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        if (dragSessionRef.current && onPreviewClipsDuringDrag) {
          onPreviewClipsDuringDrag(dragSessionRef.current.initialClips);
        }
        pendingTimelineDragClipsRef.current = null;
        handlePointerUpTimeline();
      } else if (ev.key === 'Enter' && dragSessionRef.current?.isDoubleClickPickup) {
        handlePointerUpTimeline();
      }
    };
    window.addEventListener('mousemove', onWinMouseMove);
    window.addEventListener('mouseup', onWinMouseUp);
    window.addEventListener('blur', onWinBlur);
    window.addEventListener('keydown', onWinKeyDown);
    return () => {
      window.removeEventListener('mousemove', onWinMouseMove);
      window.removeEventListener('mouseup', onWinMouseUp);
      window.removeEventListener('blur', onWinBlur);
      window.removeEventListener('keydown', onWinKeyDown);
    };
  });

  const startClipDragOrSelect = (
    e: React.MouseEvent,
    clip: TimelineClip,
    isLocked: boolean
  ) => {
    e.stopPropagation();
    setContextMenu(null);

    // If already in double-click pickup drag mode, clicking commits the drop (unless it's the 2nd click within 250ms of starting pickup)!
    if (dragSessionRef.current?.isDoubleClickPickup) {
      const elapsedSincePickup =
        Date.now() - (dragSessionRef.current.pickupStartedAtMs ?? 0);
      if (elapsedSincePickup > 250) {
        handlePointerUpTimeline();
      }
      return;
    }

    if (toolMode === 'razor' && onSplitAtExactTime) {
      onSplitAtExactTime(clip.id, clientXToSeconds(e.clientX));
      return;
    }

    // Ctrl+Click or Shift+Click toggles clip in multi-selection
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      const exists = effectiveSelectedIds.includes(clip.id);
      const nextIds = exists
        ? effectiveSelectedIds.filter((id) => id !== clip.id)
        : [...effectiveSelectedIds, clip.id];
      onSelectMultipleClips?.(nextIds);
      return;
    }

    // Detect double-click on the clip to lift it into 2D floating drag mode immediately
    const now = Date.now();
    const isRapidSecondClick =
      e.detail >= 2 ||
      (lastClipClickRef.current.clipId === clip.id &&
        now - lastClipClickRef.current.ts < 420);
    lastClipClickRef.current = { clipId: clip.id, ts: now };

    if (isRapidSecondClick) {
      startClipDoubleClickPickup(e, clip, isLocked);
      return;
    }

    let activeIds = effectiveSelectedIds;
    if (!isClipSelected(clip.id)) {
      activeIds = [clip.id];
      onSelectMultipleClips?.([clip.id]);
    }

    if (isLocked) return;
    const targetEl = e.currentTarget as HTMLElement;
    const clipRect = targetEl.getBoundingClientRect();
    const grabOffsetSec = Math.max(
      0,
      Math.min(clip.duration * 0.85, clientXToSeconds(e.clientX) - clip.startTime)
    );
    const grabOffsetPxX = Math.max(8, Math.min(140, e.clientX - clipRect.left));
    const grabOffsetPxY = Math.max(8, Math.min(44, e.clientY - clipRect.top));

    dragSessionRef.current = {
      anchorClipId: clip.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      grabOffsetSec,
      grabOffsetPxX,
      grabOffsetPxY,
      anchorInitialStart: clip.startTime,
      anchorInitialTrack: clip.trackIndex,
      initialClips: incomingClips.map((c) => ({ ...c })),
      activeSelectedIds: activeIds,
      isDoubleClickPickup: false,
      hasMovedThreshold: false,
    };
    setDraggingClipId(clip.id);
    setDragOffsetSec(grabOffsetSec);
  };

  // Double-click on a clip to pick it up into 2D floating drag mode (move mouse freely anywhere, click to drop)
  const startClipDoubleClickPickup = (
    e: React.MouseEvent,
    clip: TimelineClip,
    isLocked: boolean
  ) => {
    e.stopPropagation();
    if (isLocked || toolMode === 'razor') return;
    if (
      dragSessionRef.current?.isDoubleClickPickup &&
      dragSessionRef.current.anchorClipId === clip.id
    ) {
      return;
    }
    setContextMenu(null);

    let activeIds = effectiveSelectedIds;
    if (!isClipSelected(clip.id)) {
      activeIds = [clip.id];
      onSelectMultipleClips?.([clip.id]);
    }

    onDragSessionStart?.();
    const targetEl = e.currentTarget as HTMLElement;
    const clipRect = targetEl.getBoundingClientRect();
    const grabOffsetSec = Math.max(
      0,
      Math.min(clip.duration * 0.85, clientXToSeconds(e.clientX) - clip.startTime)
    );
    const grabOffsetPxX = Math.max(12, Math.min(120, e.clientX - clipRect.left));
    const grabOffsetPxY = Math.max(10, Math.min(36, e.clientY - clipRect.top));
    const initialSnapshot = incomingClips.map((c) => ({ ...c }));

    dragSessionRef.current = {
      anchorClipId: clip.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      grabOffsetSec,
      grabOffsetPxX,
      grabOffsetPxY,
      anchorInitialStart: clip.startTime,
      anchorInitialTrack: clip.trackIndex,
      initialClips: initialSnapshot,
      activeSelectedIds: activeIds,
      isDoubleClickPickup: true,
      hasMovedThreshold: true,
      pickupStartedAtMs: Date.now(),
    };
    setDraggingClipId(clip.id);
    setIsFloatingDragActive(true);
    setDragCursorPos({ clientX: e.clientX, clientY: e.clientY });
    setDragHoverTrackId(clip.trackIndex);

    const { previewClips, slot } = computeCapCutDragInsertionPreview(
      initialSnapshot,
      activeIds,
      clip.trackIndex,
      clip.startTime,
      snapEnabled,
      trackLocks
    );
    setInsertionSlot(slot);
    setDragPreviewClips(previewClips);
    pendingTimelineDragClipsRef.current = previewClips;
  };

  // Touchpad 2-finger pinch (ctrlKey wheel) / vertical scroll zoom over timeline (smooth synchronous scaling)
  const applyTimelineZoomWithAnchor = (nextPps: number, focalClientX?: number) => {
    const clampedNext = clampTimelineZoom(nextPps);
    const prevPps = clampTimelineZoom(pixelsPerSecond);
    if (Math.abs(clampedNext - prevPps) < 0.01) return;

    const container = scrollContainerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      // Anchor zoom around cursor X if over track area, otherwise around playhead or viewport center
      let anchorTimeSec = playheadSec;
      let anchorOffsetInViewportPx =
        playheadSec * prevPps + TRACK_HEADER_WIDTH - container.scrollLeft;

      if (
        typeof focalClientX === 'number' &&
        focalClientX >= rect.left + TRACK_HEADER_WIDTH &&
        focalClientX <= rect.right
      ) {
        const localX = focalClientX - rect.left;
        anchorTimeSec = Math.max(
          0,
          (localX + container.scrollLeft - TRACK_HEADER_WIDTH) / prevPps
        );
        anchorOffsetInViewportPx = localX;
      } else if (
        anchorOffsetInViewportPx < TRACK_HEADER_WIDTH ||
        anchorOffsetInViewportPx > rect.width
      ) {
        anchorOffsetInViewportPx = Math.max(TRACK_HEADER_WIDTH + 60, rect.width * 0.35);
        anchorTimeSec = Math.max(
          0,
          (anchorOffsetInViewportPx + container.scrollLeft - TRACK_HEADER_WIDTH) / prevPps
        );
      }

      const nextScrollLeft = Math.max(
        0,
        Math.round(anchorTimeSec * clampedNext + TRACK_HEADER_WIDTH - anchorOffsetInViewportPx)
      );
      onZoomChange(clampedNext);
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = nextScrollLeft;
          setTimelineScrollLeft(nextScrollLeft);
        }
      });
    } else {
      onZoomChange(clampedNext);
    }
  };

  const handleWheelTimeline = (e: React.WheelEvent) => {
    const isPinch = e.ctrlKey || e.metaKey;
    if (isPinch || e.altKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const nextPps = stepTimelineZoomByWheelDelta(pixelsPerSecond, e.deltaY, isPinch);
      applyTimelineZoomWithAnchor(nextPps, e.clientX);
    }
  };

  // Prevent browser page zoom when pinching 2 fingers on touchpad over the timeline
  useEffect(() => {
    const el = timelineSectionRef.current;
    if (!el) return;
    const onNativeWheel = (ev: WheelEvent) => {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) {
        ev.preventDefault();
      }
    };
    el.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', onNativeWheel);
  }, []);

  // HTML5 Drag-and-Drop from Zone 1 Resource Pool onto Timeline Tracks
  const handleDragOverTrack = (e: React.DragEvent, trackId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const sec = clientXToSeconds(e.clientX);
    setExternalDropIndicator({ trackId, timeSec: sec });
  };

  const handleDropOnTrack = (e: React.DragEvent, trackId: number, targetClipId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExternalDropIndicator(null);
    if (trackLocks[trackId]) return;
    const raw =
      e.dataTransfer.getData('application/x-trendopsis-drag') ||
      e.dataTransfer.getData('application/json');
    if (!raw || !onDropResourceOnTimeline) return;
    try {
      const payload = JSON.parse(raw) as TimelineDragPayload;
      const dropTimeSec = clientXToSeconds(e.clientX);
      onDropResourceOnTimeline(payload, trackId, dropTimeSec, targetClipId);
    } catch {
      // Ignore malformed drag data
    }
  };

  const videoClipsSorted = useMemo(
    () =>
      clips
        .filter((c) => c.trackIndex === 0)
        .sort((a, b) => a.startTime - b.startTime),
    [clips]
  );

  const rulerConfig = useMemo(
    () =>
      computeAdaptiveTimelineRuler(
        timelineTotalSec,
        pixelsPerSecond,
        timelineScrollLeft,
        1440,
        30
      ),
    [timelineTotalSec, pixelsPerSecond, timelineScrollLeft]
  );

  const openClipContextMenu = (e: React.MouseEvent, clip: TimelineClip) => {
    e.preventDefault();
    e.stopPropagation();
    setEmptyContextMenu(null);
    if (!isClipSelected(clip.id)) {
      onSelectMultipleClips?.([clip.id]);
    }
    setContextMenu({
      x: Math.min(window.innerWidth - 270, e.clientX),
      y: Math.max(12, Math.min(window.innerHeight - 540, e.clientY)),
      clip,
    });
  };

  const openEmptyTrackContextMenu = (e: React.MouseEvent, trackIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    const resolvedTrack =
      trackIndex !== undefined ? trackIndex : getTrackIdAtClientY(e.clientY) ?? 0;
    const clickedSec = clientXToSeconds(e.clientX);
    setEmptyContextMenu({
      x: Math.min(window.innerWidth - 230, e.clientX),
      y: Math.min(window.innerHeight - 240, e.clientY),
      trackIndex: resolvedTrack,
      timeSec: clickedSec,
    });
  };

  const canPasteAttrs = hasCopiedAttributes || hasClipboardAttributes;

  return (
    <section
      ref={timelineSectionRef}
      aria-label="Multi-Track Timeline"
      onClick={() => {
        setContextMenu(null);
        setEmptyContextMenu(null);
      }}
      onMouseMove={handlePointerMoveTimeline}
      onMouseUp={() => {
        if (dragSessionRef.current?.isDoubleClickPickup) return;
        handlePointerUpTimeline();
      }}
      onWheel={handleWheelTimeline}
      className="flex flex-col h-full bg-[#131316] border-t border-[#2B2B30] select-none overflow-hidden relative"
    >
      {/* CapCut PC Middle Toolbar */}
      <div className="flex items-center justify-between gap-1.5 px-2 h-8 bg-[#18181C] border-b border-[#2B2B30] shrink-0">
        {/* Left Editing Icons */}
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={onAddQuickClip}
            title="Thêm nhanh cảnh mới vào cuối Timeline"
            className="p-1 text-[#A1A1AA] hover:text-white hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Select Mode (Phím A) vs Razor Blade Split Mode (Phím B) */}
          <button
            type="button"
            onClick={() => onToolModeChange?.('select')}
            title="Công cụ Mũi tên Chọn (Phím A)"
            className={`p-1 rounded cursor-pointer shrink-0 ${
              toolMode === 'select'
                ? 'text-[#00E5CC] bg-[#00E5CC]/15 border border-[#00E5CC]/40'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              onToolModeChange?.(toolMode === 'razor' ? 'select' : 'razor')
            }
            title="Chế độ Lưỡi dao cạo Bấm-Đâu-Đứt-Đó (Phím B)"
            className={`p-1 rounded cursor-pointer shrink-0 ${
              toolMode === 'razor'
                ? 'text-[#00E5CC] bg-[#00E5CC]/15 border border-[#00E5CC]/40'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px bg-[#2B2B30] mx-0.5 shrink-0" />

          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl+Z)"
            className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
              canUndo
                ? 'text-[#D4D4D8] hover:text-white hover:bg-[#27272E]'
                : 'text-[#52525B] cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Làm lại (Ctrl+Shift+Z)"
            className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
              canRedo
                ? 'text-[#D4D4D8] hover:text-white hover:bg-[#27272E]'
                : 'text-[#52525B] cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px bg-[#2B2B30] mx-0.5 shrink-0" />

          {/* Split (Ctrl+B) */}
          <button
            type="button"
            onClick={onSplitAtPlayhead}
            title="Tách đôi Clip tại vị trí Playhead (Ctrl+B)"
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#E4E4E7] hover:text-white bg-[#24242B] hover:bg-[#2E2E38] border border-[#32323A] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Scissors className="w-3 h-3 text-[#00E5CC]" />
            <span>Tách (B)</span>
          </button>

          {/* Delete Left (Q) */}
          <button
            type="button"
            onClick={onTrimStartToPlayhead}
            title="Xóa bên trái vạch trắng (Delete Left - Phím Q)"
            className="p-1 text-[#A1A1AA] hover:text-white hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeftToLine className="w-3.5 h-3.5" />
          </button>

          {/* Delete Right (W) */}
          <button
            type="button"
            onClick={onTrimEndToPlayhead}
            title="Xóa bên phải vạch trắng (Delete Right - Phím W)"
            className="p-1 text-[#A1A1AA] hover:text-white hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <ArrowRightToLine className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDeleteSelected}
            title="Xóa Clip hoặc Tệp đang chọn (Delete / Backspace)"
            className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
              selectedClipId || selectedClipIds.length > 0
                ? 'text-[#F87171] hover:bg-[#2E1D22]'
                : 'text-[#A1A1AA] hover:text-[#F87171] hover:bg-[#2E1D22]'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Add Marker (Phím M) */}
          <button
            type="button"
            onClick={onAddMarker}
            title="Cắm cờ đánh dấu nhịp nhạc tại vạch trắng (Add Marker - Phím M)"
            className="p-1 text-[#A1A1AA] hover:text-[#F59E0B] hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>

          {/* Freeze Frame (Shift+B) */}
          <button
            type="button"
            onClick={onFreezeFrame}
            title="Đóng băng khung hình 3 giây tại Playhead (Freeze - Shift+B)"
            className="p-1 text-[#A1A1AA] hover:text-[#00E5CC] hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <Snowflake className="w-3.5 h-3.5" />
          </button>

          {/* Reverse Clip */}
          <button
            type="button"
            onClick={onReverseSelected}
            disabled={!selectedClipId}
            title="Đảo ngược phát lùi Clip (Reverse)"
            className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
              selectedClipId
                ? 'text-[#A1A1AA] hover:text-[#00E5CC] hover:bg-[#27272E]'
                : 'text-[#52525B] cursor-not-allowed'
            }`}
          >
            <Rewind className="w-3.5 h-3.5" />
          </button>

          {/* Mirror (Flip H) */}
          <button
            type="button"
            onClick={onQuickFlipSelected}
            disabled={!selectedClipId}
            title="Phản chiếu / Lật gương Clip (Mirror)"
            className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
              selectedClipId
                ? 'text-[#A1A1AA] hover:text-white hover:bg-[#27272E]'
                : 'text-[#52525B] cursor-not-allowed'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Rotate +90 */}
          <button
            type="button"
            onClick={onQuickRotateSelected}
            disabled={!selectedClipId}
            title="Xoay +90° Clip đang chọn (Rotate)"
            className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
              selectedClipId
                ? 'text-[#A1A1AA] hover:text-white hover:bg-[#27272E]'
                : 'text-[#52525B] cursor-not-allowed'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Crop Ratio / Cắt khung (Image 4) */}
          <button
            type="button"
            onClick={() => onQuickAiAction?.('crop')}
            disabled={!selectedClipId}
            title="Cắt khung hình & Thu phóng (Crop)"
            className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
              selectedClipId
                ? 'text-[#A1A1AA] hover:text-[#00E5CC] hover:bg-[#27272E]'
                : 'text-[#52525B] cursor-not-allowed'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px bg-[#2B2B30] mx-0.5 shrink-0" />

          {/* AI Scene Split (Tách cảnh AI - Image 4) */}
          <button
            type="button"
            onClick={() => (onOpenSceneSplitModal ? onOpenSceneSplitModal() : onOpenAiSceneSplit?.())}
            title="Tách cảnh tự động AI (Split Scene - Ctrl+Shift+B)"
            className="p-1 text-[#A1A1AA] hover:text-[#00E5CC] hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <Film className="w-3.5 h-3.5" />
          </button>

          {/* Remove Filler Words AI (Xóa từ thừa AI - Image 4) */}
          <button
            type="button"
            onClick={() => onQuickAiAction?.('filler_words')}
            title="Xóa từ thừa & khoảng lặng bằng AI (Remove filler words)"
            className="p-1 text-[#A1A1AA] hover:text-[#00E5CC] hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Noise Reduction (Giảm tiếng ồn AI - Image 4) */}
          <button
            type="button"
            onClick={() => onQuickAiAction?.('noise_reduction')}
            title="Khử tiếng ồn âm thanh AI (Noise Reduction)"
            className="p-1 text-[#A1A1AA] hover:text-[#00E5CC] hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* AI Auto Cutout (Tách nền AI - Image 4) */}
          <button
            type="button"
            onClick={() => onQuickAiAction?.('auto_cutout')}
            title="Tách nền người tự động AI (Auto Cutout)"
            className="p-1 text-[#A1A1AA] hover:text-[#00E5CC] hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>

          {/* AI Retouch / Smooth Skin (Làm mịn da & mặt - Image 4) */}
          <button
            type="button"
            onClick={() => onQuickAiAction?.('retouch')}
            title="Làm đẹp & mịn da mặt tự động (Retouch)"
            className="p-1 text-[#A1A1AA] hover:text-[#00E5CC] hover:bg-[#27272E] rounded transition-colors cursor-pointer shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
          </button>

          {/* HD Upscale Badge Button (Image 4) */}
          <button
            type="button"
            onClick={() => onQuickAiAction?.('hd_upscale')}
            title="Làm nét chất lượng video siêu phân giải (HD Upscale)"
            className="px-1 py-0.5 text-[9px] font-extrabold text-[#D4D4D8] hover:text-[#00E5CC] border border-[#3F3F4A] hover:border-[#00E5CC] rounded cursor-pointer shrink-0"
          >
            HD
          </button>

          <div className="h-3.5 w-px bg-[#2B2B30] mx-0.5 shrink-0" />

          {/* Add Overlay Clip Button (CapCut PC "Thêm lớp phủ" — opens user file picker) */}
          {onAddOverlayClip && (
            <button
              type="button"
              onClick={onAddOverlayClip}
              title="Thêm Lớp Phủ (Chọn video hoặc hình ảnh từ thư mục máy tính để chèn lên tầng Lớp phủ)"
              className="px-1.5 py-0.5 rounded bg-[#00E5CC]/15 hover:bg-[#00E5CC]/25 border border-[#00E5CC]/40 text-[10px] font-semibold text-[#00E5CC] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Layers className="w-3 h-3 text-[#00E5CC]" />
              <span>{language === 'en' ? 'Overlay' : 'Lớp Phủ'}</span>
            </button>
          )}

          <div className="h-3.5 w-px bg-[#2B2B30] mx-0.5 shrink-0" />

          {/* In / Out Range Controls ([I] / [O]) & Smart Studio Actions */}
          <div className="flex items-center gap-0.5 bg-[#141419] border border-[#2B2B34] rounded px-1 py-0.5 shrink-0">
            <button
              type="button"
              onClick={onSetMarkIn}
              title={
                language === 'en'
                  ? 'Set In Point at Playhead (Shortcut: I)'
                  : 'Đặt điểm vào In tại Playhead (Phím I)'
              }
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                markInSec !== null
                  ? 'bg-[#00E5CC]/20 text-[#00E5CC] border border-[#00E5CC]/50'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              [I{markInSec !== null ? `:${markInSec.toFixed(1)}s` : ''}
            </button>
            <button
              type="button"
              onClick={onSetMarkOut}
              title={
                language === 'en'
                  ? 'Set Out Point at Playhead (Shortcut: O)'
                  : 'Đặt điểm ra Out tại Playhead (Phím O)'
              }
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                markOutSec !== null
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {markOutSec !== null ? `${markOutSec.toFixed(1)}s:` : ''}O]
            </button>

            {(markInSec !== null || markOutSec !== null) && (
              <>
                <button
                  type="button"
                  onClick={onToggleLoopRange}
                  title={
                    language === 'en'
                      ? 'Loop playback between In & Out points'
                      : 'Phát lặp liên tục trong vùng [In - Out]'
                  }
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                    loopRangeEnabled
                      ? 'bg-[#00E5CC] text-[#090D12]'
                      : 'bg-[#22222B] text-[#D4D4D8] hover:text-white'
                  }`}
                >
                  Loop
                </button>
                <button
                  type="button"
                  onClick={() => onRippleTrimRange?.('ripple_delete_inside')}
                  title={
                    language === 'en'
                      ? 'Ripple Cut: Delete [In..Out] range and close gap'
                      : 'Ripple Cut: Xóa vùng [In..Out] và tự động khép khoảng trống'
                  }
                  className="px-1.5 py-0.5 rounded bg-[#F43F5E]/20 hover:bg-[#F43F5E]/30 border border-[#F43F5E]/40 text-[#FB7185] text-[10px] font-semibold cursor-pointer"
                >
                  {language === 'en' ? 'Ripple Cut I/O' : 'Xóa vùng I/O'}
                </button>
                <button
                  type="button"
                  onClick={() => onRippleTrimRange?.('keep_inside')}
                  title={
                    language === 'en'
                      ? 'Trim timeline to keep only [In..Out] range'
                      : 'Cắt gọn Timeline: Chỉ giữ lại vùng [In..Out]'
                  }
                  className="px-1.5 py-0.5 rounded bg-[#00E5CC]/15 hover:bg-[#00E5CC]/25 border border-[#00E5CC]/40 text-[#00E5CC] text-[10px] font-semibold cursor-pointer"
                >
                  {language === 'en' ? 'Keep I/O' : 'Giữ vùng I/O'}
                </button>
                <button
                  type="button"
                  onClick={onClearMarkInOut}
                  title={language === 'en' ? 'Clear In/Out points' : 'Xóa đánh dấu In/Out'}
                  className="px-1 py-0.5 text-[10px] text-[#9CA3AF] hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </>
            )}
          </div>

          {/* Smart Silence Remover & Auto-Beat Sync */}
          {onRemoveDeadAirSilence && (
            <button
              type="button"
              onClick={onRemoveDeadAirSilence}
              title={
                language === 'en'
                  ? 'Smart Silence & Dead-Air Remover'
                  : 'Tự động cắt khoảng lặng & khép sát các cảnh'
              }
              className="px-2 py-0.5 rounded bg-[#22222C] hover:bg-[#2C2C38] border border-[#343442] text-[10px] font-semibold text-[#E4E4E7] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Activity className="w-3 h-3 text-[#00E5CC]" />
              <span>{language === 'en' ? 'Strip Silence' : 'Cắt khoảng lặng'}</span>
            </button>
          )}
          {onSyncClipsToBeats && (
            <button
              type="button"
              onClick={onSyncClipsToBeats}
              title={
                language === 'en'
                  ? 'Auto-Beat Sync: Snap video cuts to musical beat grid'
                  : 'Beat Sync: Tự động khớp điểm cắt video theo nhịp nhạc'
              }
              className="px-2 py-0.5 rounded bg-[#22222C] hover:bg-[#2C2C38] border border-[#343442] text-[10px] font-semibold text-[#F59E0B] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Music2 className="w-3 h-3 text-[#F59E0B]" />
              <span>{language === 'en' ? 'Beat Sync' : 'Khớp Beat'}</span>
            </button>
          )}
          {onCloseAllGapsOnTrack && (
            <button
              type="button"
              data-testid="concat-close-all-gaps-btn"
              onClick={() => onCloseAllGapsOnTrack(0)}
              title={
                language === 'en'
                  ? 'Concat All: Close all gaps on Main Video Track (V1)'
                  : 'Ghép khít toàn bộ (Concat All): Tự động dồn sát mọi clip trên trục Video chính (V1)'
              }
              className="px-2 py-0.5 rounded bg-[#00E5CC]/15 hover:bg-[#00E5CC]/25 border border-[#00E5CC]/45 text-[10px] font-semibold text-[#00E5CC] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>⇄ {language === 'en' ? 'Concat All' : 'Ghép khít (Concat)'}</span>
            </button>
          )}
        </div>

        {/* Right Timeline Controls (Multi-select status, Mic, Magnet P, Snap N, Link, Pre-render, dB Meter, Zoom) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {effectiveSelectedIds.length > 1 && (
            <span className="px-2 py-0.5 rounded bg-[#00E5CC]/15 border border-[#00E5CC]/40 text-[10px] font-semibold text-[#00E5CC]">
              Đã chọn {effectiveSelectedIds.length} clip
            </span>
          )}

          {onStartVoiceover && (
            <button
              type="button"
              onClick={onStartVoiceover}
              title="Record Voiceover — Thu âm lồng tiếng trực tiếp"
              className="p-1 text-[#A1A1AA] hover:text-white rounded cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleSnap}
            title="Main track magnet (Nam châm trục chính - Phím P): Tự động khít các clip trên trục chính"
            className={`px-1.5 py-0.5 rounded border text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
              snapEnabled
                ? 'text-[#00E5CC] bg-[#00E5CC]/15 border-[#00E5CC]/40'
                : 'text-[#71717A] bg-transparent border-transparent hover:text-white'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleAutoSnapEdge}
            title="Auto snapping (Tự động bắt dính mép clip - Phím N)"
            className={`px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors cursor-pointer ${
              autoSnapEdge
                ? 'text-[#00E5CC] bg-[#00E5CC]/15 border-[#00E5CC]/40'
                : 'text-[#71717A] bg-transparent border-transparent hover:text-white'
            }`}
          >
            N
          </button>
          <button
            type="button"
            onClick={onToggleAudioLink}
            title={audioLinked ? 'Linkage: Đang liên kết Video & Audio (Ctrl+G)' : 'Đã tháo liên kết'}
            className={`p-1 rounded border transition-colors cursor-pointer ${
              audioLinked
                ? 'text-[#00E5CC] bg-[#00E5CC]/15 border-[#00E5CC]/40'
                : 'text-[#71717A] bg-transparent border-transparent hover:text-white'
            }`}
          >
            {audioLinked ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onQuickAiAction?.('prerender')}
            title="Kết xuất trước đoạn Timeline mượt 60 FPS (Pre-render)"
            className="p-1 text-[#A1A1AA] hover:text-[#00E5CC] rounded cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>

          {/* Live Decibel Audio Meter (-60dB .. 0dB) */}
          <div
            title="Thước đo âm lượng Decibel (-60dB .. -6dB .. 0dB)"
            className="flex items-center gap-0.5 px-1.5 py-1 bg-[#111115] border border-[#2B2B34] rounded h-5"
          >
            <div
              style={{ height: isPlaying ? `${45 + ((Math.round(playheadSec * 27)) % 55)}%` : '22%' }}
              className="w-1 bg-gradient-to-t from-emerald-400 via-amber-400 to-rose-500 rounded-xs transition-all"
            />
            <div
              style={{ height: isPlaying ? `${35 + ((Math.round(playheadSec * 33)) % 60)}%` : '18%' }}
              className="w-1 bg-gradient-to-t from-emerald-400 via-amber-400 to-rose-500 rounded-xs transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => applyTimelineZoomWithAnchor(stepTimelineZoom(pixelsPerSecond, 'out'))}
            title="Thu nhỏ Timeline vừa phải (Ctrl + -)"
            className="p-1 text-[#A1A1AA] hover:text-white cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min={MIN_TIMELINE_ZOOM_PPS}
            max={MAX_TIMELINE_ZOOM_PPS}
            step={0.5}
            value={clampTimelineZoom(pixelsPerSecond)}
            onChange={(e) => {
              const rawTarget = Number(e.target.value);
              applyTimelineZoomWithAnchor(clampTimelineZoom(Number(rawTarget.toFixed(1))));
            }}
            title={`Kéo dài / Thu phóng Timeline đồng bộ (${Math.round(pixelsPerSecond)} px/giây — Tối đa ${MAX_TIMELINE_ZOOM_PPS} px/giây)`}
            aria-label="Thanh phóng to thu nhỏ Timeline"
            className="w-36 sm:w-44 accent-[#00E5CC] cursor-pointer"
          />
          <button
            type="button"
            onClick={() => applyTimelineZoomWithAnchor(stepTimelineZoom(pixelsPerSecond, 'in'))}
            title="Phóng to kéo dài Timeline vừa phải (Ctrl + =)"
            className="p-1 text-[#A1A1AA] hover:text-white cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Multi-Track Canvas */}
      <div
        ref={scrollContainerRef}
        data-timeline-scroll="true"
        onScroll={(e) => setTimelineScrollLeft(e.currentTarget.scrollLeft)}
        onMouseDown={handleMouseDownEmptyTrackArea}
        onContextMenu={(e) => openEmptyTrackContextMenu(e)}
        className={`relative flex-1 overflow-x-auto overflow-y-auto bg-[#131316] ${
          toolMode === 'razor' ? 'cursor-crosshair' : ''
        }`}
      >
        <div
          className="relative min-h-full pb-6"
          style={{ width: `${timelineWidthPx}px` }}
        >
          {/* Timecode Ruler + Markers (Phím M) */}
          <div
            onMouseDown={handlePointerDownRuler}
            className="sticky top-0 z-20 flex items-center h-6 bg-[#16161A] border-b border-[#232329] cursor-ew-resize"
          >
            <div
              style={{ width: `${TRACK_HEADER_WIDTH}px` }}
              onMouseDown={(e) => e.stopPropagation()}
              className="sticky left-0 z-30 flex items-center justify-between px-2.5 h-full bg-[#16161A] border-r border-[#232329] text-[10px] font-mono text-[#71717A] shrink-0"
            >
              <span>{visibleTracks.length} LAYERS</span>
              <span>{clips.length} mục</span>
            </div>

            <div
              style={{
                backgroundImage: `repeating-linear-gradient(to right, rgba(113,113,122,0.28) 0px, rgba(113,113,122,0.28) 1px, transparent 1px, transparent ${rulerConfig.minorStepPx}px)`,
                backgroundPosition: 'left bottom',
                backgroundSize: `100% 5px`,
                backgroundRepeat: 'repeat-x',
              }}
              className="relative flex-1 h-full"
            >
              {rulerConfig.ticks.map((tick) => (
                <div
                  key={tick.timeSec}
                  style={{ left: `${tick.timeSec * pixelsPerSecond}px` }}
                  className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
                >
                  <span className="pl-1 pt-0.5 text-[10px] font-mono text-[#71717A] whitespace-nowrap">
                    | {tick.label}
                  </span>
                  <div className="w-px h-2 bg-[#52525B]" />
                </div>
              ))}

              {/* Marker Pins on Ruler */}
              {markers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onPlayheadChange(m.timeSec);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onCycleMarkerColor?.(m.id);
                  }}
                  style={{ left: `${m.timeSec * pixelsPerSecond}px`, color: m.color }}
                  title={`${m.label} (${m.timeSec.toFixed(1)}s) — Nhấp đúp để đổi màu cờ`}
                  className="absolute bottom-0 -translate-x-1/2 z-30 cursor-pointer"
                >
                  <Flag className="w-3 h-3 fill-current" />
                </button>
              ))}

              {/* In / Out Range Bracket Overlay on Ruler */}
              {(markInSec !== null || markOutSec !== null) && (
                <div
                  style={{
                    left: `${Math.max(0, markInSec ?? 0) * pixelsPerSecond}px`,
                    width: `${
                      Math.max(
                        0.2,
                        (markOutSec ?? Math.max((markInSec ?? 0) + 2, playheadSec)) -
                          (markInSec ?? 0)
                      ) * pixelsPerSecond
                    }px`,
                  }}
                  className="absolute top-0 bottom-0 bg-[#00E5CC]/20 border-x-2 border-[#00E5CC] pointer-events-none z-20 flex items-center justify-between px-1"
                >
                  <span className="text-[9px] font-mono font-bold text-[#00E5CC]">IN</span>
                  <span className="text-[9px] font-mono font-bold text-[#F59E0B]">OUT</span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Multi-Layer Tracks (Only non-empty tracks stay visible; empty tracks disappear automatically) */}
          <div className="pt-2 space-y-1">
            {visibleTracks.map((track, rowPosition) => {
              const tIdx = track.index;
              const isMainVideo = tIdx === 0;
              const isOverlayTrack = tIdx === 3 || track.kind === 'overlay';
              const rowHeightPx = isMainVideo
                ? 60
                : isOverlayTrack && isFloatingDragActive
                ? 44
                : 26;
              const isLocked = Boolean(trackLocks[tIdx]);
              const isHidden = Boolean(trackHidden[tIdx]);
              const isMuted = Boolean(trackMuted[tIdx]);
              const isDropTarget =
                externalDropIndicator?.trackId === tIdx || dragHoverTrackId === tIdx;
              const trackClips = clips
                .filter((c) => c.trackIndex === tIdx)
                .sort((a, b) => a.startTime - b.startTime);

              return (
                <div
                  key={track.id}
                  ref={(el) => {
                    trackRowRefs.current[tIdx] = el;
                  }}
                  data-track-index={tIdx}
                  style={{ height: `${rowHeightPx}px` }}
                  onContextMenu={(e) => openEmptyTrackContextMenu(e, tIdx)}
                  onDragOver={(e) => handleDragOverTrack(e, tIdx)}
                  onDragLeave={() => {
                    if (externalDropIndicator?.trackId === tIdx) {
                      setExternalDropIndicator(null);
                    }
                  }}
                  onDrop={(e) => handleDropOnTrack(e, tIdx)}
                  className={`relative flex items-center transition-all duration-150 ${
                    isDropTarget
                      ? 'bg-[#00E5CC]/10 ring-1 ring-[#00E5CC]/60'
                      : isMainVideo
                      ? 'bg-[#16161B]'
                      : 'bg-[#141418]'
                  }`}
                >
                  {/* Sticky Left Track Header (Matches CapCut PC left track icons + Up/Down order + Delete Layer) */}
                  <div
                    style={{ width: `${TRACK_HEADER_WIDTH}px` }}
                    className="sticky left-0 z-20 flex items-center justify-between px-2 h-full bg-[#16161A] border-r border-[#24242C]"
                  >
                    <div className="flex items-center gap-1 text-[#71717A]">
                      {/* Track Type Badge */}
                      <span
                        title={`${track.label} (Kéo clip lên/xuống để chuyển tầng)`}
                        className="w-4 text-[10px] font-mono font-bold text-[#9CA3AF] select-none"
                      >
                        {track.kind === 'text'
                          ? 'TI'
                          : track.kind === 'audio'
                          ? '♫'
                          : '▣'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onToggleTrackLock(tIdx)}
                        title={isLocked ? `Mở khóa ${track.label}` : `Khóa ${track.label}`}
                        className="hover:text-white cursor-pointer p-0.5"
                      >
                        {isLocked ? (
                          <Lock className="w-2.5 h-2.5 text-[#00E5CC]" />
                        ) : (
                          <Unlock className="w-2.5 h-2.5" />
                        )}
                      </button>

                      {track.kind !== 'audio' && (
                        <button
                          type="button"
                          onClick={() => onToggleTrackHidden(tIdx)}
                          title={isHidden ? `Hiện ${track.label}` : `Ẩn ${track.label}`}
                          className="hover:text-white cursor-pointer p-0.5"
                        >
                          {isHidden ? (
                            <EyeOff className="w-2.5 h-2.5 text-[#F87171]" />
                          ) : (
                            <Eye className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}

                      {(track.kind === 'video' ||
                        track.kind === 'overlay' ||
                        track.kind === 'audio') && (
                        <button
                          type="button"
                          onClick={() => onToggleTrackMuted(tIdx)}
                          title={isMuted ? `Bật tiếng ${track.label}` : `Tắt tiếng ${track.label}`}
                          className="hover:text-white cursor-pointer p-0.5"
                        >
                          {isMuted ? (
                            <VolumeX className="w-2.5 h-2.5 text-[#F87171]" />
                          ) : (
                            <Volume2 className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}

                      {/* Move Track Layer Up / Down buttons + Delete Custom Layer */}
                      {onMoveTrackOrder && (
                        <div className="flex items-center gap-0.5 ml-0.5">
                          <button
                            type="button"
                            disabled={rowPosition === 0}
                            onClick={() => onMoveTrackOrder(tIdx, 'up')}
                            title="Di chuyển tầng Timeline này lên trên"
                            className="hover:text-[#00E5CC] disabled:opacity-25 cursor-pointer"
                          >
                            <ChevronUp className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            disabled={rowPosition === visibleTracks.length - 1}
                            onClick={() => onMoveTrackOrder(tIdx, 'down')}
                            title="Di chuyển tầng Timeline này xuống dưới"
                            className="hover:text-[#00E5CC] disabled:opacity-25 cursor-pointer"
                          >
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>
                          {tIdx >= 4 && onDeleteTrackLayer && (
                            <button
                              type="button"
                              onClick={() => onDeleteTrackLayer(tIdx)}
                              title={`Xóa tầng ${track.label} (Có thể Ctrl+Z hoàn tác)`}
                              className="hover:text-[#F87171] text-[#71717A] ml-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* "Ảnh bìa" button on Main Video Track */}
                    {isMainVideo && (
                      <button
                        type="button"
                        onClick={onCaptureCover}
                        title="Chụp khung hình hiện tại làm Ảnh bìa dự án & Tải về (.PNG)"
                        style={
                          coverDataUrl
                            ? {
                                backgroundImage: `url(${coverDataUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }
                            : undefined
                        }
                        className="flex flex-col items-center justify-center w-8 h-11 bg-[#25252D] hover:bg-[#2F2F3A] border border-[#383844] rounded-xs text-[8px] text-[#D4D4D8] cursor-pointer overflow-hidden shrink-0"
                      >
                        <div className="flex flex-col items-center justify-center w-full h-full bg-black/45">
                          <Edit3 className="w-2.5 h-2.5 text-[#E4E4E7]" />
                          <span className="leading-tight">Ảnh bìa</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Track Lane Body */}
                  <div className="relative flex-1 h-full">
                    {/* Show diagonal hatch when track is Locked, Hidden, or when dragging a clip over the Overlay drop zone (CapCut PC style) */}
                    {(isLocked || isHidden || (isOverlayTrack && isFloatingDragActive)) && (
                      <div
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(-45deg, rgba(255,255,255,0.065) 0px, rgba(255,255,255,0.065) 4px, rgba(0,0,0,0.16) 4px, rgba(0,0,0,0.16) 9px)',
                        }}
                        className="absolute inset-y-0.5 left-0 right-0 pointer-events-none border-y border-white/[0.05]"
                      />
                    )}

                    {/* CapCut PC Dark Gray Insertion Slot Placeholder ("chỗ vừa với đoạn như vậy") when dragging */}
                    {isFloatingDragActive &&
                      insertionSlot &&
                      insertionSlot.trackIndex === tIdx && (
                        <div
                          data-testid="timeline-insertion-slot"
                          data-slot-track={insertionSlot.trackIndex}
                          data-slot-start={insertionSlot.startTime}
                          data-slot-duration={insertionSlot.duration}
                          style={{
                            left: `${insertionSlot.startTime * pixelsPerSecond}px`,
                            width: `${Math.max(12, insertionSlot.duration * pixelsPerSecond)}px`,
                          }}
                          className="absolute top-0.5 bottom-0.5 rounded-xs bg-[#2B2C35]/90 border border-[#525568] shadow-inner pointer-events-none z-20 transition-[left,width] duration-150 ease-out"
                        />
                      )}

                    {/* Base Timeline Origin Slot when Main Video Track is empty */}
                    {isMainVideo && trackClips.length === 0 && (
                      <div
                        data-testid="base-timeline-origin-slot"
                        className="absolute inset-y-1.5 left-0 w-[440px] max-w-[90%] rounded border border-dashed border-[#00E5CC]/45 bg-[#00E5CC]/[0.05] flex items-center gap-2.5 px-3 pointer-events-none select-none"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-[#00E5CC]/20 border border-[#00E5CC]/50 font-mono text-[10px] font-bold text-[#00E5CC] shrink-0">
                          Mốc gốc 00:00
                        </span>
                        <span className="text-[11px] text-[#A1A1AA] truncate">
                          {language === 'en'
                            ? 'Base Timeline Track 01 — Drag & drop video/audio here or click "+ Import"'
                            : 'Mốc thời gian gốc (Track 01) — Kéo thả video/ảnh vào đây hoặc bấm "+ Nhập"'}
                        </span>
                      </div>
                    )}

                    {/* Render Clips on this Track (Synchronized proportional zoom without CSS left lag) */}
                    {trackClips.map((clip, orderIdx) => {
                      const { leftPx, widthPx } = computeSynchronizedClipLayout(
                        clip,
                        pixelsPerSecond
                      );
                      const isSelected = isClipSelected(clip.id);
                      const isBeingFloated =
                        isFloatingDragActive &&
                        Boolean(dragSessionRef.current?.activeSelectedIds.includes(clip.id));

                      // Compute un-stretched 3px-pitch waveform bar slice for this clip
                      const totalWaveformBars = Math.max(8, Math.ceil(widthPx / 3));
                      const useVirtualizedWaveform = totalWaveformBars > 900;
                      const wfStartIdx = useVirtualizedWaveform
                        ? Math.max(
                            0,
                            Math.floor(
                              Math.max(
                                0,
                                timelineScrollLeft - TRACK_HEADER_WIDTH - leftPx - 1200
                              ) / 3
                            )
                          )
                        : 0;
                      const wfEndIdx = useVirtualizedWaveform
                        ? Math.min(
                            totalWaveformBars,
                            Math.ceil(
                              Math.min(
                                widthPx,
                                timelineScrollLeft - TRACK_HEADER_WIDTH - leftPx + 4200
                              ) / 3
                            )
                          )
                        : totalWaveformBars;

                      // Slim Overlay / Text / Audio / Effect / Sticker Clip Rendering
                      if (!isMainVideo) {
                        const isTextOrSub =
                          track.kind === 'text' || Boolean(clip.subtitleText);
                        const isAudio = track.kind === 'audio';
                        const isFxClip =
                          Boolean(clip.visualEffect && clip.visualEffect !== 'none') &&
                          !clip.mediaUrl;
                        const isFilterClip =
                          Boolean(clip.filterPreset && clip.filterPreset !== 'none') &&
                          !clip.mediaUrl;
                        const bgClass = clip.stickerEmoji
                          ? 'bg-[#6D28D9]'
                          : isFxClip
                          ? 'bg-[#4F46E5]'
                          : isFilterClip
                          ? 'bg-[#0E7490]'
                          : isTextOrSub
                          ? 'bg-[#B06553]'
                          : isAudio
                          ? 'bg-[#145369]'
                          : 'bg-[#136F72]';

                        return (
                          <div
                            key={clip.id}
                            data-clip-item="true"
                            data-clip-id={clip.id}
                            onContextMenu={(e) => openClipContextMenu(e, clip)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => handleDropOnTrack(e, tIdx, clip.id)}
                            onMouseDown={(e) => startClipDragOrSelect(e, clip, isLocked)}
                            onDoubleClick={(e) => startClipDoubleClickPickup(e, clip, isLocked)}
                            style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                            className={`group absolute top-0.5 bottom-0.5 rounded-xs px-2 flex items-center overflow-hidden select-none ${
                              isBeingFloated ? 'opacity-0 pointer-events-none' : ''
                            } ${
                              toolMode === 'razor'
                                ? 'cursor-crosshair'
                                : 'cursor-grab active:cursor-grabbing'
                            } ${bgClass} ${isHidden || isMuted || clip.disabled ? 'opacity-35 grayscale' : ''} ${
                              isSelected
                                ? 'border-2 border-white shadow-[0_0_12px_rgba(0,229,204,0.55)] brightness-125 z-30 after:absolute after:inset-0 after:bg-white/10 after:pointer-events-none'
                                : 'border border-[#1E3A40] opacity-90 hover:brightness-110'
                            }`}
                          >
                            {/* Overlay video thumbnail strip if it's a video PIP clip */}
                            {!isTextOrSub && !isAudio && (clip.thumbnailUrl || clip.thumbnailDataUrl) && (
                              <div
                                style={{
                                  backgroundImage: `url("${clip.thumbnailUrl || clip.thumbnailDataUrl}")`,
                                  backgroundRepeat: 'repeat-x',
                                  backgroundPosition: 'left center',
                                  backgroundSize: 'auto 100%',
                                }}
                                className="absolute inset-0 opacity-65 pointer-events-none"
                              />
                            )}

                            {/* Audio Clip Dense Vertical Amplitude Waveform Bars (Fixed 3px pitch, never stretches apart) */}
                            {isAudio && (
                              <div
                                data-testid="clip-waveform-bars"
                                data-clip-volume={clip.muted || isMuted ? 0 : clip.volume ?? 100}
                                style={
                                  wfStartIdx > 0
                                    ? { paddingLeft: `${wfStartIdx * 3}px` }
                                    : undefined
                                }
                                className="absolute inset-x-1 bottom-0.5 top-3.5 flex items-end justify-start gap-[1.5px] pointer-events-none overflow-hidden z-[5]"
                              >
                                {computeClipWaveformBars(
                                  clip,
                                  totalWaveformBars,
                                  isMuted,
                                  wfStartIdx,
                                  wfEndIdx
                                ).map((amp, bIdx) => (
                                  <span
                                    key={wfStartIdx + bIdx}
                                    data-waveform-bar="true"
                                    style={{ height: `${Math.max(6, Math.round(amp * 100))}%` }}
                                    className={`w-[1.5px] shrink-0 rounded-t-[0.5px] ${
                                      clip.muted || isMuted || (clip.volume ?? 100) === 0
                                        ? 'bg-[#64748B]/45'
                                        : 'bg-[#00E5CC]/90'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}

                            {/* PIP Video Clip Mini Audio Amplitude Waveform Strip (Fixed 3px pitch) */}
                            {!isTextOrSub && !isAudio && !isFxClip && !isFilterClip && (
                              <div
                                data-testid="clip-waveform-bars"
                                data-clip-volume={clip.muted || isMuted ? 0 : clip.volume ?? 100}
                                style={
                                  wfStartIdx > 0
                                    ? { paddingLeft: `${wfStartIdx * 3 + 4}px` }
                                    : undefined
                                }
                                className="absolute inset-x-0 bottom-0 h-2.5 bg-[#062328]/85 border-t border-[#00E5CC]/30 px-1 flex items-end justify-start gap-[1.5px] pointer-events-none overflow-hidden z-[5]"
                              >
                                {computeClipWaveformBars(
                                  clip,
                                  totalWaveformBars,
                                  isMuted,
                                  wfStartIdx,
                                  wfEndIdx
                                ).map((amp, bIdx) => (
                                  <span
                                    key={wfStartIdx + bIdx}
                                    data-waveform-bar="true"
                                    style={{ height: `${Math.max(8, Math.round(amp * 100))}%` }}
                                    className="w-[1.5px] shrink-0 rounded-t-[0.5px] bg-[#00E5CC]/85"
                                  />
                                ))}
                              </div>
                            )}

                            <span
                              className={`relative z-10 text-[9.5px] truncate drop-shadow flex items-center gap-1 ${
                                isAudio ? 'self-start mt-0.5' : ''
                              } ${isSelected ? 'font-bold text-white' : 'font-medium text-white'}`}
                            >
                              {clip.disabled ? '🚫 ' : ''}
                              {clip.groupId ? '🔗 ' : ''}
                              {clip.stickerEmoji ? (
                                (() => {
                                  const isFlagClip =
                                    clip.stickerType === 'world_flag' ||
                                    Boolean(extractFlagIsoCode(clip.stickerEmoji));
                                  const flagUrl = isFlagClip
                                    ? getFlagGraphicDataUrl(clip.stickerEmoji)
                                    : null;
                                  const displayLabel =
                                    clip.stickerText ||
                                    (clip.name.startsWith(clip.stickerEmoji)
                                      ? clip.name.slice(clip.stickerEmoji.length).trim()
                                      : clip.name);
                                  return flagUrl ? (
                                    <>
                                      <img
                                        src={flagUrl}
                                        alt="Flag"
                                        className="w-4 h-3 rounded-xs object-cover shrink-0 border border-white/25"
                                      />
                                      <span className="truncate">{displayLabel}</span>
                                    </>
                                  ) : (
                                    <span className="truncate">
                                      {clip.stickerEmoji} {displayLabel}
                                    </span>
                                  );
                                })()
                              ) : isFxClip ? (
                                `✨ ${clip.name}`
                              ) : isFilterClip ? (
                                `🎨 ${clip.name}`
                              ) : isAudio ? (
                                `♪ ${clip.name}`
                              ) : (
                                clip.subtitleText || clip.name
                              )}
                            </span>

                            {/* Beat markers if audio */}
                            {isAudio &&
                              clip.beatMarkers &&
                              clip.beatMarkers.map((bSec, bIdx) => (
                                <span
                                  key={bIdx}
                                  style={{ left: `${bSec * pixelsPerSecond}px` }}
                                  title={`Beat #${bIdx + 1} (${bSec}s)`}
                                  className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#FACC15] z-10"
                                />
                              ))}

                              {/* Left & Right trim handles (White crisp bars when selected) */}
                            {!isLocked && (
                              <>
                                <div
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    onDragSessionStart?.();
                                    setResizingState({
                                      clipId: clip.id,
                                      edge: 'left',
                                      initialX: e.clientX,
                                      origStartTime: clip.startTime,
                                      origDuration: clip.duration,
                                    });
                                  }}
                                  className={`absolute left-0 top-0 bottom-0 cursor-ew-resize z-20 flex items-center justify-center ${
                                    isSelected
                                      ? 'w-2 bg-white text-black font-bold text-[8px]'
                                      : 'w-1.5 hover:bg-white/80'
                                  }`}
                                >
                                  {isSelected && '⋮'}
                                </div>
                                <div
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    onDragSessionStart?.();
                                    setResizingState({
                                      clipId: clip.id,
                                      edge: 'right',
                                      initialX: e.clientX,
                                      origStartTime: clip.startTime,
                                      origDuration: clip.duration,
                                    });
                                  }}
                                  className={`absolute right-0 top-0 bottom-0 cursor-ew-resize z-20 flex items-center justify-center ${
                                    isSelected
                                      ? 'w-2 bg-white text-black font-bold text-[8px]'
                                      : 'w-1.5 hover:bg-white/80'
                                  }`}
                                >
                                  {isSelected && '⋮'}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      }

                      // Main Video Track Clip (60px CapCut PC Teal Header + Thumbnail + Bottom Cyan Waveform + Highlighted Selection)
                      return (
                        <div
                          key={clip.id}
                          data-clip-item="true"
                          data-clip-id={clip.id}
                          onContextMenu={(e) => openClipContextMenu(e, clip)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => handleDropOnTrack(e, tIdx, clip.id)}
                          onMouseDown={(e) => startClipDragOrSelect(e, clip, isLocked)}
                          onDoubleClick={(e) => startClipDoubleClickPickup(e, clip, isLocked)}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx}px`,
                          }}
                          className={`group absolute top-0.5 bottom-0.5 rounded-xs overflow-hidden flex flex-col justify-between ${
                            isBeingFloated ? 'opacity-0 pointer-events-none' : ''
                          } ${
                            toolMode === 'razor'
                              ? 'cursor-crosshair'
                              : 'cursor-grab active:cursor-grabbing'
                          } ${isHidden || clip.disabled ? 'opacity-35 grayscale' : ''} ${
                            isSelected
                              ? 'border-2 border-white shadow-[0_0_12px_rgba(0,229,204,0.55)] brightness-125 z-30 after:absolute after:inset-0 after:bg-white/10 after:pointer-events-none'
                              : 'border border-[#1E3A40] opacity-90'
                          }`}
                        >
                          {/* Top header strip: Bright Cyan when selected, Teal #126E72 when unselected */}
                          <div
                            className={`flex items-center px-1.5 h-3.5 text-[9.5px] truncate leading-none shrink-0 ${
                              isSelected
                                ? 'bg-[#00E5CC] text-[#090D12] font-bold'
                                : 'bg-[#126E72] text-[#E2F8F5] font-medium'
                            }`}
                          >
                            <span className="truncate">
                              {clip.disabled ? '🚫 ' : ''}
                              {clip.groupId ? '🔗 ' : ''}
                              {clip.isCompoundClip ? `📦 ${clip.name}` : clip.name}
                            </span>
                          </div>

                          {/* Middle Filmstrip Thumbnail */}
                          <div
                            style={
                              clip.thumbnailUrl || clip.thumbnailDataUrl
                                ? {
                                    backgroundImage: `url("${clip.thumbnailUrl || clip.thumbnailDataUrl}")`,
                                    backgroundRepeat: 'repeat-x',
                                    backgroundPosition: 'left center',
                                    backgroundSize: 'auto 100%',
                                  }
                                : {
                                    background: `linear-gradient(135deg, ${clip.colorHex || '#0D9488'} 0%, #0E3A42 100%)`,
                                  }
                            }
                            className="relative flex-1 w-full overflow-hidden"
                          >
                            {/* Transition / Effect / Filter / Sticker badges if applied */}
                            <div className="absolute left-0.5 top-0.5 flex items-center gap-0.5 z-10 flex-wrap pointer-events-none">
                              {clip.transitionType && clip.transitionType !== 'none' && (
                                <span
                                  title={`Chuyển tiếp: ${clip.transitionType} (${clip.transitionDuration ?? 0.6}s)`}
                                  className="px-1 py-0.2 bg-[#00E5CC] text-[#071013] font-extrabold text-[8px] rounded-xs leading-tight shadow"
                                >
                                  ⋈ {clip.transitionType}
                                </span>
                              )}
                              {clip.visualEffect && clip.visualEffect !== 'none' && (
                                <span
                                  title={`Hiệu ứng: ${clip.visualEffect}`}
                                  className="px-1 py-0.2 bg-[#8B5CF6] text-white font-bold text-[8px] rounded-xs leading-tight shadow"
                                >
                                  ✨ {clip.visualEffect}
                                </span>
                              )}
                              {clip.filterPreset && clip.filterPreset !== 'none' && (
                                <span
                                  title={`Bộ lọc: ${clip.filterPreset}`}
                                  className="px-1 py-0.2 bg-[#F59E0B] text-black font-bold text-[8px] rounded-xs leading-tight shadow"
                                >
                                  🎨 {clip.filterPreset}
                                </span>
                              )}
                              {clip.stickerEmoji && (
                                <span
                                  title={`Sticker: ${clip.stickerEmoji}`}
                                  className="px-1 py-0.2 bg-[#6D28D9] text-white font-bold text-[9px] rounded-xs leading-tight shadow flex items-center gap-0.5"
                                >
                                  {(() => {
                                    const flagUrl = getFlagGraphicDataUrl(clip.stickerEmoji);
                                    return flagUrl ? (
                                      <img
                                        src={flagUrl}
                                        alt="Flag"
                                        className="w-3.5 h-2.5 rounded-xs object-cover"
                                      />
                                    ) : (
                                      clip.stickerEmoji
                                    );
                                  })()}
                                </span>
                              )}
                            </div>

                            {/* Keyframe diamonds ◇ */}
                            {clip.keyframes &&
                              clip.keyframes.map((kf) => (
                                <span
                                  key={kf.id}
                                  style={{ left: `${kf.timeOffset * pixelsPerSecond}px` }}
                                  className="absolute bottom-0.5 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#00E5CC] border border-black"
                                />
                              ))}
                          </div>

                          {/* Bottom Audio Amplitude Waveform Bar Strip (Fixed 3px pitch — never stretches apart on zoom!) */}
                          <div
                            data-testid="clip-waveform-bars"
                            data-clip-volume={clip.muted || isMuted ? 0 : clip.volume ?? 100}
                            style={
                              wfStartIdx > 0
                                ? { paddingLeft: `${wfStartIdx * 3 + 4}px` }
                                : undefined
                            }
                            className="relative h-4 bg-[#072B30] border-t border-[#188088]/55 flex items-end justify-start gap-[1.5px] px-1 pt-0.5 pb-[1px] overflow-hidden shrink-0 pointer-events-none"
                          >
                            {computeClipWaveformBars(
                              clip,
                              totalWaveformBars,
                              isMuted,
                              wfStartIdx,
                              wfEndIdx
                            ).map((amp, bIdx) => (
                              <span
                                key={wfStartIdx + bIdx}
                                data-waveform-bar="true"
                                style={{ height: `${Math.max(6, Math.round(amp * 100))}%` }}
                                className={`w-[1.5px] shrink-0 rounded-t-[0.5px] ${
                                  clip.muted || isMuted || (clip.volume ?? 100) === 0
                                    ? 'bg-[#64748B]/45'
                                    : 'bg-[#00E5CC]/90'
                                }`}
                              />
                            ))}
                            {orderIdx === 0 && (
                              <span
                                title="Audio Linked (∞)"
                                className="px-0.5 bg-[#0A1318]/90 text-[7px] text-[#00E5CC] font-mono rounded-xs leading-none ml-0.5 relative z-10 shrink-0 self-center"
                              >
                                ∞
                              </span>
                            )}
                          </div>

                          {/* Left & Right trim handles (White crisp bars when selected) */}
                          {!isLocked && (
                            <>
                              <div
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  onDragSessionStart?.();
                                  setResizingState({
                                    clipId: clip.id,
                                    edge: 'left',
                                    initialX: e.clientX,
                                    origStartTime: clip.startTime,
                                    origDuration: clip.duration,
                                  });
                                }}
                                className={`absolute left-0 top-0 bottom-0 cursor-ew-resize z-20 flex items-center justify-center ${
                                  isSelected
                                    ? 'w-2 bg-white text-black font-bold text-[9px]'
                                    : 'w-1 hover:bg-[#00E5CC]'
                                }`}
                              >
                                {isSelected && '⋮'}
                              </div>
                              <div
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  onDragSessionStart?.();
                                  setResizingState({
                                    clipId: clip.id,
                                    edge: 'right',
                                    initialX: e.clientX,
                                    origStartTime: clip.startTime,
                                    origDuration: clip.duration,
                                  });
                                }}
                                className={`absolute right-0 top-0 bottom-0 cursor-ew-resize z-20 flex items-center justify-center ${
                                  isSelected
                                    ? 'w-2 bg-white text-black font-bold text-[9px]'
                                    : 'w-1 hover:bg-[#00E5CC]'
                                }`}
                              >
                                {isSelected && '⋮'}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {/* CapCut Interactive Seam Transition Buttons (⋈) & One-Click Gap Closers on Main Video Track */}
                    {isMainVideo &&
                      !isLocked &&
                      trackClips.map((clip, orderIdx) => {
                        if (orderIdx === 0) return null;
                        const prevClip = trackClips[orderIdx - 1];
                        if (!prevClip) return null;
                        const prevEndSec = prevClip.startTime + prevClip.duration;
                        const gapSec = clip.startTime - prevEndSec;

                        // Case A: Gap between prevClip and clip -> Clickable Gap Closer Pill
                        if (gapSec > 0.12) {
                          const gapLeftPx = prevEndSec * pixelsPerSecond;
                          const gapWidthPx = Math.max(18, gapSec * pixelsPerSecond);
                          return (
                            <button
                              key={`gap-${prevClip.id}-${clip.id}`}
                              type="button"
                              data-testid="timeline-gap-closer"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCloseGapAtTime?.(tIdx, prevEndSec + 0.02);
                              }}
                              title={
                                language === 'en'
                                  ? `Gap ${gapSec.toFixed(2)}s — Click to close gap & concat clips`
                                  : `Khoảng trống ${gapSec.toFixed(2)}s — Bấm để khép sát & nối liền 2 clip`
                              }
                              style={{
                                left: `${gapLeftPx}px`,
                                width: `${gapWidthPx}px`,
                              }}
                              className="absolute top-1.5 bottom-1.5 z-25 rounded-xs border border-dashed border-[#00E5CC]/45 bg-[#00E5CC]/[0.06] hover:bg-[#00E5CC]/20 text-[#00E5CC] flex items-center justify-center text-[9px] font-mono cursor-pointer transition-colors overflow-hidden"
                            >
                              <span className="truncate px-1">⇄ {gapSec.toFixed(1)}s</span>
                            </button>
                          );
                        }

                        // Case B: Adjacent concatenated clips -> Interactive CapCut Seam Transition Button (⋈)
                        if (Math.abs(gapSec) <= 0.12) {
                          const seamLeftPx = clip.startTime * pixelsPerSecond;
                          const hasTr = Boolean(clip.transitionType && clip.transitionType !== 'none');
                          const trOrder: Array<{ id: TimelineDragPayload['transitionType']; label: string }> = [
                            { id: 'cross_dissolve', label: 'Hòa tan Mượt (Cross Dissolve)' },
                            { id: 'slide_left', label: 'Trượt ngang (Slide Left)' },
                            { id: 'push_up', label: 'Đẩy dọc Lên trên (Push Up)' },
                            { id: 'wipe_split', label: 'Tách đôi Màn hình (Split Wipe)' },
                            { id: 'zoom_in', label: 'Kéo gần (Camera Zoom In)' },
                            { id: 'black_fade', label: 'Chuyển Đen Điện ảnh (Fade Black)' },
                            { id: 'white_flash', label: 'Chớp Trắng Máy ảnh (White Flash)' },
                            { id: 'glitch_transition', label: 'Nhiễu sóng Kỹ thuật số (Glitch Cut)' },
                            { id: 'none', label: 'Không chuyển tiếp' },
                          ];
                          return (
                            <button
                              key={`seam-${prevClip.id}-${clip.id}`}
                              type="button"
                              data-testid="timeline-seam-transition-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const curIdx = trOrder.findIndex((t) => t.id === (clip.transitionType || 'none'));
                                const nextItem = trOrder[(curIdx + 1) % trOrder.length];
                                onDropResourceOnTimeline?.(
                                  {
                                    kind: 'transition',
                                    name: nextItem.label,
                                    duration: clip.transitionDuration || 0.6,
                                    transitionType: nextItem.id,
                                  },
                                  0,
                                  clip.startTime + 0.05,
                                  clip.id
                                );
                                onSelectClip(clip.id);
                                onPlayheadChange(clip.startTime);
                              }}
                              title={
                                hasTr
                                  ? `Chuyển cảnh nối clip: ${clip.transitionType} (${clip.transitionDuration ?? 0.6}s) — Bấm để đổi hiệu ứng chuyển tiếp`
                                  : 'Điểm nối (Concat Seam) — Bấm để thêm hiệu ứng Chuyển cảnh (Transition ⋈) giữa 2 clip'
                              }
                              style={{ left: `${seamLeftPx}px` }}
                              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-35 w-4 h-4 rounded-xs flex items-center justify-center text-[9px] font-extrabold shadow-md cursor-pointer transition-transform hover:scale-125 ${
                                hasTr
                                  ? 'bg-[#00E5CC] text-[#071013] border border-white shadow-[0_0_8px_rgba(0,229,204,0.8)]'
                                  : 'bg-[#181B24]/95 hover:bg-[#00E5CC] text-[#E4E4E7] hover:text-[#071013] border border-white/35'
                              }`}
                            >
                              ⋈
                            </button>
                          );
                        }
                        return null;
                      })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Thin Marquee Selection Rectangle (Click-and-Drag or Double-Click-and-Drag on empty Timeline) */}
          {marqueeBox && (
            <div
              style={{
                left: `${Math.min(marqueeBox.startX, marqueeBox.currX)}px`,
                top: `${Math.min(marqueeBox.startY, marqueeBox.currY)}px`,
                width: `${Math.max(2, Math.abs(marqueeBox.currX - marqueeBox.startX))}px`,
                height: `${Math.max(2, Math.abs(marqueeBox.currY - marqueeBox.startY))}px`,
              }}
              className="absolute z-40 pointer-events-none border border-[#00E5CC] bg-[#00E5CC]/15 rounded-xs shadow-[0_0_8px_rgba(0,229,204,0.35)]"
            />
          )}

          {/* Clean Vertical Cyan Magnetic Snap Line (No Floating Text Box) */}
          {snapGuideTimeSec !== null && (
            <div
              data-testid="floating-drag-guide-line"
              style={{
                left: `${TRACK_HEADER_WIDTH + snapGuideTimeSec * pixelsPerSecond}px`,
              }}
              className="absolute top-0 bottom-0 z-40 w-[1.5px] bg-[#00E5CC] shadow-[0_0_10px_#00E5CC] pointer-events-none"
            />
          )}

          {/* Vertical Playhead Line (Shaft is pointer-events-none so free cursor movement or clicking clips never grabs the shaft; top cap is draggable) */}
          <div
            data-playhead-line="true"
            style={{
              left: `${TRACK_HEADER_WIDTH + playheadSec * pixelsPerSecond}px`,
            }}
            className="absolute top-0 bottom-0 z-30 w-0.5 bg-white pointer-events-none"
          >
            <div
              data-playhead-cap="true"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                e.stopPropagation();
                setDraggingPlayhead(true);
              }}
              className="absolute -top-0 -left-1.5 w-3.5 h-3.5 bg-white border border-black/40 rounded-t-xs shadow pointer-events-auto cursor-ew-resize"
            />
          </div>
        </div>
      </div>

      {/* CapCut PC Floating 2D Dragged Clip Ghost (Follows cursor freely in X & Y across all tracks) */}
      {isFloatingDragActive &&
        draggingClipId &&
        dragCursorPos &&
        (() => {
          const floatedClip = clips.find((c) => c.id === draggingClipId);
          if (!floatedClip) return null;
          const rawWidthPx = Math.max(48, floatedClip.duration * pixelsPerSecond);
          const ghostWidthPx = Math.min(340, rawWidthPx);
          const isVideoStyle =
            floatedClip.trackIndex === 0 ||
            Boolean(floatedClip.mediaUrl && floatedClip.trackIndex !== 1);
          const ghostHeightPx = isVideoStyle ? 56 : 28;
          const grabX = Math.min(
            ghostWidthPx - 12,
            dragSessionRef.current?.grabOffsetPxX ?? 36
          );
          const grabY = Math.min(
            ghostHeightPx - 8,
            dragSessionRef.current?.grabOffsetPxY ?? 22
          );
          const ghostWaveformBars = computeClipWaveformBars(
            floatedClip,
            Math.max(12, Math.ceil(ghostWidthPx / 3)),
            false
          );

          return (
            <div
              data-testid="floating-dragged-clip-ghost"
              data-dragged-clip-id={floatedClip.id}
              style={{
                left: `${dragCursorPos.clientX - grabX}px`,
                top: `${dragCursorPos.clientY - grabY}px`,
                width: `${ghostWidthPx}px`,
                height: `${ghostHeightPx}px`,
              }}
              className="fixed z-50 pointer-events-none rounded-xs border-2 border-white shadow-[0_14px_34px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col justify-between bg-[#0F292E]/95"
            >
              {/* Top Teal/Cyan Header */}
              <div className="flex items-center justify-between px-1.5 h-3.5 bg-[#126E72] text-[9.5px] font-semibold text-white truncate shrink-0">
                <span className="truncate">{floatedClip.name}</span>
              </div>

              {/* Middle Filmstrip Thumbnail */}
              {isVideoStyle && (
                <div
                  style={
                    floatedClip.thumbnailUrl || floatedClip.thumbnailDataUrl
                      ? {
                          backgroundImage: `url("${
                            floatedClip.thumbnailUrl || floatedClip.thumbnailDataUrl
                          }")`,
                          backgroundRepeat: 'repeat-x',
                          backgroundPosition: 'left center',
                          backgroundSize: 'auto 100%',
                        }
                      : {
                          background: `linear-gradient(135deg, ${
                            floatedClip.colorHex || '#0D9488'
                          } 0%, #0E3A42 100%)`,
                        }
                  }
                  className="relative flex-1 w-full overflow-hidden"
                >
                  {/* CapCut PC circular fade handles on bottom-left & bottom-right of floating card */}
                  <span className="absolute left-1 bottom-1 w-2 h-2 rounded-full bg-black/75 border border-white/90" />
                  <span className="absolute right-1 bottom-1 w-2 h-2 rounded-full bg-black/75 border border-white/90" />
                </div>
              )}

              {/* Bottom Dense Cyan Waveform Strip */}
              <div className="h-3.5 bg-[#072B30] border-t border-[#188088]/60 flex items-end justify-start gap-[1.5px] px-1 pt-0.5 pb-[1px] overflow-hidden shrink-0">
                {ghostWaveformBars.map((amp, bIdx) => (
                  <span
                    key={bIdx}
                    style={{ height: `${Math.max(8, Math.round(amp * 100))}%` }}
                    className="w-[1.5px] shrink-0 rounded-t-[0.5px] bg-[#00E5CC]/90"
                  />
                ))}
              </div>
            </div>
          );
        })()}

      {/* TDO CUT Right-Click Context Menu on Empty Timeline / Track Gap */}
      {emptyContextMenu && (
        <div
          style={{ left: `${emptyContextMenu.x}px`, top: `${emptyContextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-60 bg-[#1E1F26] border border-[#343746] rounded-lg shadow-2xl py-1.5 text-xs text-[#E4E4E7]"
        >
          <button
            type="button"
            onClick={() => {
              onCloseGapAtTime?.(emptyContextMenu.trackIndex, emptyContextMenu.timeSec);
              setEmptyContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2E3B] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Close Gap' : 'Lấp đầy khoảng trống'}</span>
            <span className="text-[10px] font-mono text-[#8E929F]">Del</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCloseAllGapsOnTrack?.(emptyContextMenu.trackIndex);
              setEmptyContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2E3B] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Close All Gaps on Track' : 'Lấp đầy mọi khoảng trống'}</span>
          </button>

          <div className="my-1 border-t border-[#2D303E]" />

          {/* Select submenu items */}
          <div className="group/select relative">
            <button
              type="button"
              onClick={() => {
                const allUnlocked = clips
                  .filter((c) => !trackLocks[c.trackIndex])
                  .map((c) => c.id);
                onSelectMultipleClips?.(allUnlocked);
                setEmptyContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#2B2E3B] flex items-center justify-between cursor-pointer"
            >
              <span>{language === 'en' ? 'Select All Unlocked Clips' : 'Chọn tất cả clip'}</span>
              <span className="text-[10px] text-[#8E929F]">Ctrl+A</span>
            </button>
            <div className="px-2 pb-1 space-y-0.5 text-[11px] text-[#A1A1AA]">
              <button
                type="button"
                onClick={() => {
                  const trackIds = clips
                    .filter((c) => c.trackIndex === emptyContextMenu.trackIndex)
                    .map((c) => c.id);
                  onSelectMultipleClips?.(trackIds);
                  setEmptyContextMenu(null);
                }}
                className="w-full px-2 py-1 text-left hover:bg-[#2B2E3B] hover:text-white rounded cursor-pointer"
              >
                {language === 'en'
                  ? '• Select all on this track'
                  : '• Chọn tất cả trên tầng này'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const rightIds = clips
                    .filter((c) => c.startTime >= emptyContextMenu.timeSec)
                    .map((c) => c.id);
                  onSelectMultipleClips?.(rightIds);
                  setEmptyContextMenu(null);
                }}
                className="w-full px-2 py-1 text-left hover:bg-[#2B2E3B] hover:text-white rounded cursor-pointer"
              >
                {language === 'en'
                  ? '• Select clips to the right'
                  : '• Chọn các clip bên phải trỏ chuột'}
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={!hasClipboardClips}
            onClick={() => {
              onPasteClipboardClips?.(emptyContextMenu.timeSec, emptyContextMenu.trackIndex);
              setEmptyContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2E3B] disabled:opacity-40 flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Paste' : 'Dán'}</span>
            <span className="text-[10px] font-mono text-[#8E929F]">Ctrl+V</span>
          </button>

          <div className="my-1 border-t border-[#2D303E]" />

          <button
            type="button"
            onClick={() => {
              onPlayheadChange(emptyContextMenu.timeSec);
              onAddMarker?.();
              setEmptyContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2E3B] flex items-center justify-between cursor-pointer"
          >
            <span>
              {language === 'en' ? 'Add Marker / In-Out Point' : 'Khoảng (Đánh dấu mốc I/O)'}
            </span>
            <span className="text-[10px] text-[#8E929F]">M</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickAiAction?.('prerender');
              setEmptyContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2E3B] flex items-center justify-between cursor-pointer"
          >
            <span>
              {language === 'en' ? 'Pre-render Timeline' : 'Kết xuất (Pre-render Timeline)'}
            </span>
            <span className="text-[10px] text-[#8E929F]">▸</span>
          </button>
        </div>
      )}

      {/* TDO CUT Full Right-Click Context Menu on Clip */}
      {contextMenu && (
        <div
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-64 max-h-[84vh] overflow-y-auto bg-[#1E1F26] border border-[#363948] rounded-lg shadow-2xl py-1.5 text-xs text-[#E4E4E7]"
        >
          <button
            type="button"
            onClick={() => {
              setShowEditPilotPopover(true);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between font-medium text-[#00E5CC] cursor-pointer"
          >
            <span>{language === 'en' ? 'Functions' : 'Chức năng'}</span>
          </button>

          <div className="my-1 border-t border-[#2D303E]" />

          <button
            type="button"
            onClick={() => {
              if (onCopySelectedClips) {
                onCopySelectedClips(contextMenu.clip.id);
              }
              onDuplicateClip?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Copy & Duplicate' : 'Bản sao'}</span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Ctrl + C
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCutSelectedClips?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Cut' : 'Cắt'}</span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Ctrl + X
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCopyAttributes?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Copy Attributes' : 'Sao chép thuộc tính'}</span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Ctrl + Shift + C
            </span>
          </button>

          <button
            type="button"
            disabled={!canPasteAttrs}
            onClick={() => {
              onPasteAttributes?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] disabled:opacity-40 flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Paste Attributes' : 'Dán thuộc tính'}</span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Ctrl + Shift + V
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDeleteSelected();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2E1D22] text-[#F87171] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Delete' : 'Xóa'}</span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Backspace
            </span>
          </button>

          <div className="my-1 border-t border-[#2D303E]" />

          <button
            type="button"
            onClick={() => {
              onQuickFlipSelected();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>
              {language === 'en'
                ? 'Edit (Flip / Rotate / Mirror)'
                : 'Chỉnh sửa (Lật / Xoay / Đảo ngược)'}
            </span>
            <span className="text-[10px] text-[#8E929F]">▸</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickRotateSelected();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Rotate 90° Clockwise' : 'Xoay 90° chiều kim đồng hồ'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDuplicateClip?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Duplicate Clip' : 'Tạo video (Nhân bản nhanh)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickAiAction?.('ai_edit', contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'AI Smart Edit' : 'Chỉnh sửa bằng AI'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAiExtendClip?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'AI Extend Clip (+2.0s)' : 'Kéo dài bằng AI (+2.0s)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenSceneSplitModal) onOpenSceneSplitModal();
              else onOpenAiSceneSplit?.();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Scene Split' : 'Tách cảnh'}</span>
            <span className="text-[10px] font-mono text-[#00E5CC]">Ctrl+Shift+B</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickAiAction?.('transcript', contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>
              {language === 'en'
                ? 'Transcript (Generate AI Captions)'
                : 'Bản chép lời (Tạo phụ đề AI)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onVocalIsolation?.(contextMenu.clip.id, 'keep_vocal');
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>
              {language === 'en'
                ? 'Vocal Isolation (Keep Vocals)'
                : 'Tách giọng nói (Giữ giọng hát AI)'}
            </span>
            <span className="text-[10px] text-[#8E929F]">▸</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onExtractAudio?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Extract Audio' : 'Trích xuất âm thanh'}</span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Ctrl + Shift + S
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSyncVideoAudio?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Align Video & Audio' : 'Đồng bộ video và âm thanh'}</span>
          </button>

          <div className="my-1 border-t border-[#2D303E]" />

          <button
            type="button"
            onClick={() => {
              onCreateCompoundClip?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>
              {language === 'en'
                ? 'Create Compound Clip'
                : 'Tạo clip ghép (dự án con)'}
            </span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Alt + G
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickAiAction?.('multicam', contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>
              {language === 'en'
                ? 'Create Multi-Cam Clip'
                : 'Tạo clip quay bằng nhiều camera'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickAiAction?.('save_preset', contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Save as Preset' : 'Lưu kiểu cài sẵn'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onGroupSelectedClips?.();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Group' : 'Nhóm'}</span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Ctrl + G
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onUngroupSelectedClips?.();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Ungroup' : 'Bỏ nhóm'}</span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Ctrl + Shift + G
            </span>
          </button>

          <div className="my-1 border-t border-[#2D303E]" />

          <button
            type="button"
            onClick={() => {
              onExportSelectedClip?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Export Selected Clips' : 'Xuất các clip đã chọn'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleDisableClip?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>
              {contextMenu.clip.disabled
                ? language === 'en'
                  ? 'Enable Clip'
                  : 'Bật lại clip (Enable)'
                : language === 'en'
                ? 'Disable Clip'
                : 'Vô hiệu hoá clip'}
            </span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              V
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSplitAtPlayhead();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Split Clip' : 'Cắt đoạn video'}</span>
            <span className="text-[10px] font-mono bg-[#2A2D3A] px-1.5 py-0.5 rounded text-[#A1A1AA]">
              Ctrl + B
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onReplaceClipMedia?.(contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Replace Clip' : 'Thay thế clip'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickAiAction?.('open_location', contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Reveal in Media Pool' : 'Liên kết với phương tiện'}</span>
          </button>

          <div className="my-1 border-t border-[#2D303E]" />

          <button
            type="button"
            onClick={() => {
              onQuickAiAction?.('edit_effects', contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>{language === 'en' ? 'Edit Visual Effects' : 'Chỉnh sửa hiệu ứng'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickAiAction?.('speed_ramp', contextMenu.clip.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center justify-between cursor-pointer"
          >
            <span>
              {language === 'en'
                ? 'Show Speed Ramp Curve'
                : 'Hiển thị hiệu ứng động tốc độ thay đổi'}
            </span>
          </button>
        </div>
      )}

      {/* Floating Functions (Chức năng) Pill (Bottom-Right of Timeline — Houses Batch Shuffle, Batch Trim & Layer Manager) */}
      <div className="absolute bottom-3 right-3 z-40">
        {showEditPilotPopover && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mb-2 w-72 p-3 bg-[#1E1F28] border border-[#363948] rounded-xl shadow-2xl space-y-3 text-xs text-[#E4E4E7]"
          >
            <div className="flex items-center justify-between border-b border-[#2D303E] pb-1.5">
              <span className="font-bold text-[#00E5CC] flex items-center gap-1.5">
                <span>
                  {language === 'en'
                    ? 'Functions — Timeline Automation'
                    : 'Chức năng — Tự động hóa Timeline'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowEditPilotPopover(false)}
                className="text-[#9CA3AF] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Smart Batch Shuffle X..Y */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-white">
                {language === 'en'
                  ? '1. Shuffle Clips X..Y & Match Target Duration'
                  : '1. Đảo ngẫu nhiên Clip X..Y & Khớp thời lượng đích'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#9CA3AF]">
                  {language === 'en' ? 'From' : 'Từ'}
                </span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, videoClipsSorted.length)}
                  value={rangeStartIndex}
                  onChange={(e) => onRangeStartChange(Math.max(1, Number(e.target.value)))}
                  aria-label={language === 'en' ? 'From clip X' : 'Từ clip X'}
                  className="w-11 px-1 py-0.5 text-[11px] font-mono text-center bg-[#121215] text-white border border-[#32323A] rounded"
                />
                <span className="text-[10px] text-[#71717A]">
                  {language === 'en' ? 'to' : 'đến'}
                </span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, videoClipsSorted.length)}
                  value={rangeEndIndex}
                  onChange={(e) => onRangeEndChange(Math.max(1, Number(e.target.value)))}
                  aria-label={language === 'en' ? 'To clip Y' : 'Đến clip Y'}
                  className="w-11 px-1 py-0.5 text-[11px] font-mono text-center bg-[#121215] text-white border border-[#32323A] rounded"
                />
                <span className="text-[10px] text-[#9CA3AF] ml-1">
                  {language === 'en' ? 'Target(s):' : 'Đích(s):'}
                </span>
                <input
                  type="number"
                  min={0}
                  max={7200}
                  step={5}
                  value={targetDurationSec}
                  onChange={(e) => onTargetDurationChange(Math.max(0, Number(e.target.value)))}
                  aria-label={language === 'en' ? 'Target duration (sec)' : 'Thời lượng đích (giây)'}
                  className="w-12 px-1 py-0.5 text-[11px] font-mono text-center bg-[#121215] text-[#00E5CC] border border-[#32323A] rounded"
                />
              </div>
              <button
                type="button"
                onClick={onShuffleRange}
                className="w-full py-1.5 bg-[#00E5CC] hover:bg-[#00F5D4] text-[#090D12] font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>
                  {language === 'en'
                    ? 'Shuffle Clips on Timeline'
                    : 'Đảo ngẫu nhiên Clip trên Timeline'}
                </span>
              </button>
            </div>

            {/* Batch Trim */}
            <div className="pt-2 border-t border-[#2D303E] space-y-1.5">
              <div className="text-[11px] font-semibold text-white">
                {language === 'en'
                  ? '2. Batch Trim (Keep Middle of Clip)'
                  : '2. Cắt hàng loạt (Lấy phần giữa clip)'}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1.5, 2.0, 3.0, 5.0].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => onBatchTrim(sec)}
                    className="py-1 text-[10px] font-mono bg-[#2A2A32] hover:bg-[#00E5CC] hover:text-black text-[#E4E4E7] rounded cursor-pointer"
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number"
                  step={0.5}
                  min={0.5}
                  max={30}
                  value={minTrimSec}
                  onChange={(e) => setMinTrimSec(Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 text-[11px] font-mono bg-[#121216] text-white border border-[#32323A] rounded"
                />
                <span className="text-xs text-[#71717A]">→</span>
                <input
                  type="number"
                  step={0.5}
                  min={0.5}
                  max={60}
                  value={maxTrimSec}
                  onChange={(e) => setMaxTrimSec(Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 text-[11px] font-mono bg-[#121216] text-white border border-[#32323A] rounded"
                />
                <button
                  type="button"
                  onClick={() => onBatchTrim([minTrimSec, Math.max(minTrimSec, maxTrimSec)])}
                  className="flex-1 py-0.5 text-[10px] font-semibold bg-[#2A2B36] hover:bg-[#00E5CC] hover:text-black text-[#00E5CC] border border-[#00E5CC]/40 rounded cursor-pointer"
                >
                  {language === 'en' ? 'Random' : 'Ngẫu nhiên'}
                </button>
              </div>
            </div>

            {/* Add Layer */}
            {onAddTrackLayer && (
              <div className="pt-2 border-t border-[#2D303E] grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => onAddTrackLayer('overlay')}
                  className="py-1 text-[10px] bg-[#252630] hover:bg-[#00E5CC] hover:text-black rounded cursor-pointer"
                >
                  {language === 'en' ? '+ PIP Layer' : '+ Layer PIP'}
                </button>
                <button
                  type="button"
                  onClick={() => onAddTrackLayer('text')}
                  className="py-1 text-[10px] bg-[#252630] hover:bg-[#00E5CC] hover:text-black rounded cursor-pointer"
                >
                  {language === 'en' ? '+ Text Layer' : '+ Layer Chữ'}
                </button>
                <button
                  type="button"
                  onClick={() => onAddTrackLayer('audio')}
                  className="py-1 text-[10px] bg-[#252630] hover:bg-[#00E5CC] hover:text-black rounded cursor-pointer"
                >
                  {language === 'en' ? '+ Audio Layer' : '+ Layer Nhạc'}
                </button>
              </div>
            )}
          </div>
        )}

        <div
          data-tdoedit-pill="true"
          className="flex items-center bg-[#23252E] border border-[#383B4A] rounded-full shadow-xl overflow-hidden"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShuffleRange();
            }}
            title={
              language === 'en'
                ? 'Quickly shuffle clips on Timeline'
                : 'Đảo ngẫu nhiên nhanh các clip trên Timeline'
            }
            className="px-2.5 py-1.5 text-[#A1A1AA] hover:text-white border-r border-[#343746] cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditPilotPopover((v) => !v);
            }}
            className="px-3 py-1.5 flex items-center text-xs font-semibold text-[#E4E4E7] hover:text-[#00E5CC] cursor-pointer"
          >
            <span>{language === 'en' ? 'Functions' : 'Chức năng'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
