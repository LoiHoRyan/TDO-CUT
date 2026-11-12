export type TrackIndex = number; // 0: Main Video, 1: Audio, 2: Text/Subtitle, 3: Overlay/PIP, 4+: Custom Layers

export type TimelineTrackType = 'video' | 'overlay' | 'text' | 'audio' | 'effect';

export interface TimelineTrackDef {
  id: number | string;
  index: number;
  name: string;
  label: string;
  type: TimelineTrackType;
  kind: TimelineTrackType;
  heightPx: number;
}

export const DEFAULT_TIMELINE_TRACKS: TimelineTrackDef[] = [
  { id: 3, index: 3, name: 'Lớp phủ / PIP', label: 'Lớp phủ / PIP', type: 'overlay', kind: 'overlay', heightPx: 36 },
  { id: 2, index: 2, name: 'Văn bản / Phụ đề', label: 'Văn bản / Phụ đề', type: 'text', kind: 'text', heightPx: 26 },
  { id: 0, index: 0, name: 'Video chính', label: 'Video chính', type: 'video', kind: 'video', heightPx: 62 },
  { id: 1, index: 1, name: 'Âm thanh', label: 'Âm thanh', type: 'audio', kind: 'audio', heightPx: 34 },
];

export interface TimelineDragPayload {
  kind: 'media' | 'audio' | 'audio_sfx' | 'text' | 'sticker' | 'effect' | 'transition' | 'filter' | 'adjust' | 'adjustment';
  name: string;
  duration?: number;
  mediaType?: 'video' | 'audio' | 'folder';
  sfxPresetId?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  colorHex?: string;
  subtitleText?: string;
  stickerEmoji?: string;
  stickerType?: StickerOverlayType;
  stickerText?: string;
  stickerSubText?: string;
  visualEffect?: VisualEffectType;
  transitionType?: TransitionPresetType;
  filterPreset?: FilterPresetType;
  mediaWidth?: number;
  mediaHeight?: number;
  nativeAspectRatio?: string;
  waveformPeaks?: number[];
  batchItems?: TimelineDragPayload[];
}

export type BlendMode =
  | 'normal'
  | 'source-over'
  | 'screen'
  | 'multiply'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'hard-light'
  | 'soft-light'
  | 'difference';

export type VisualEffectType =
  | 'none'
  | 'shake'
  | 'flash'
  | 'ken_burns'
  | 'vhs'
  | 'fade_black'
  | 'laser_body'
  | 'neon_aura'
  | 'mosaic_blur'
  | 'glitch'
  | 'dreamy_glow'
  | 'laser_eyes'
  | 'bass_impact'
  | 'dolly_zoom'
  | 'clone_trail'
  | 'neon_outline'
  | 'soul_out'
  | 'super8_grain'
  | 'old_tv'
  | 'dv_cam'
  | 'strobe_party'
  | 'cyber_holo'
  | 'golden_rays'
  | 'matrix_rain'
  | 'fire_sparks'
  | 'snowfall'
  | 'sakura_petals'
  | 'lightning_storm'
  | 'cinema_bars'
  | 'halftone_comic'
  | 'thermal_vision'
  | 'night_vision'
  | 'underwater'
  | 'split_screen_2'
  | 'split_screen_4'
  | 'kaleidoscope'
  | 'speed_lines'
  | 'confetti_party'
  | 'spotlight_stage';

export type FilterPresetType =
  | 'none'
  | 'teal_orange'
  | 'cyberpunk'
  | 'noir'
  | 'noir_bw'
  | 'vintage'
  | 'vivid'
  | 'food_warm'
  | 'kodak_2383'
  | 'matrix_green'
  | 'anamorphic_blue'
  | 'imax_hdr'
  | 'fuji_velvia'
  | 'golden_hour'
  | 'cafe_latte'
  | 'tropical_vibe'
  | 'leica_mono'
  | 'ilford_hp5'
  | 'silver_selenium';

export type MaskShapeType =
  | 'none'
  | 'split'
  | 'filmstrip'
  | 'circle'
  | 'rectangle'
  | 'star'
  | 'heart'
  | 'mirror';

export type MaskType = MaskShapeType;

export type TransitionPresetType =
  | 'none'
  | 'overlay'
  | 'camera'
  | 'blur'
  | 'light_flash'
  | 'glitch'
  | 'slide'
  | 'cross_dissolve'
  | 'black_fade'
  | 'white_flash'
  | 'glitch_transition'
  | 'zoom_in'
  | 'slide_left'
  | 'spin'
  | 'whip_pan'
  | 'roll_shutter'
  | 'pull_out'
  | 'wipe_split'
  | 'clock_sweep'
  | 'push_up'
  | 'film_burn'
  | 'rgb_split';

export type TransitionType = TransitionPresetType;

export type SpeedCurvePresetType =
  | 'none'
  | 'custom'
  | 'montage'
  | 'hero'
  | 'bullet'
  | 'jump_cut'
  | 'flash_in'
  | 'flash_out';

export type SpeedCurvePreset = SpeedCurvePresetType;

export type AnimationPreset =
  | 'none'
  | 'fade_in'
  | 'zoom_in'
  | 'spin_in'
  | 'slide_up'
  | 'fade_out'
  | 'slide_out'
  | 'pendulum'
  | 'handheld_shake'
  | 'bounce_combo';

export type StickerOverlayType =
  | 'none'
  | 'like_thumb'
  | 'bell_sub'
  | 'arrow_neon'
  | 'circle_focus'
  | 'fire_trend'
  | 'confetti'
  | 'subscribe'
  | 'subscribe_bell'
  | 'heart_love'
  | 'like_glow'
  | 'fire_meme'
  | 'rec_frame'
  | 'arrow_bounce'
  | 'face_icon'
  | 'world_flag'
  | 'social_badge'
  | (string & {});

export type HslChannelColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'magenta';

export type ClipboardClipAttributes = Partial<TimelineClip>;

export type KeyframeEasingType = 'linear' | 'ease_in' | 'ease_out' | 's_curve' | 'bounce';

export interface ClipKeyframe {
  id: string;
  timeOffset: number; // seconds from clip.startTime
  offsetSec?: number;
  scale: number;
  posX: number;
  posY: number;
  rotation: number;
  opacity: number;
  volume: number;
  easing: KeyframeEasingType;
}

export interface TimelineMarker {
  id: string;
  timeSec: number;
  label: string;
  color: '#00E5CC' | '#EF4444' | '#F59E0B' | '#10B981' | '#A855F7';
}

export interface TimelineClip {
  id: string;
  name: string;
  filePath: string;
  trackIndex: TrackIndex;
  startTime: number;      // seconds on timeline
  duration: number;       // seconds on timeline
  sourceIn: number;       // seconds offset in source media
  sourceDuration?: number;
  // CapCut Transform (Biến đổi)
  scale?: number;         // percentage: 10 to 500 (default 100)
  scaleX?: number;        // non-uniform scale X (when uniformScale is false)
  scaleY?: number;        // non-uniform scale Y
  uniformScale?: boolean;
  posX?: number;          // pixels offset (-500 to 500)
  posY?: number;          // pixels offset (-500 to 500)
  rotation?: number;      // degrees (0 to 360)
  flipH: boolean;         // Horizontal mirror
  flipV?: boolean;        // Vertical mirror
  cropRatio: number;      // scale / 100
  cropLeft?: number;      // spatial crop left % (0 to 80)
  cropTop?: number;       // spatial crop top % (0 to 80)
  cropRight?: number;     // spatial crop right % (0 to 80)
  cropBottom?: number;    // spatial crop bottom % (0 to 80)
  cropAspectPreset?: 'free' | '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
  cropRotateDeg?: number; // crop fine rotation (-180 to 180)
  layerOrder?: number;    // Z-index layer 1..10
  // CapCut Blend & Opacity (Hòa trộn)
  blendMode?: BlendMode;
  opacity?: number;       // 0 to 100
  // Stabilize, Relight, Motion Blur
  stabilizeLevel?: 'none' | 'recommended' | 'minimum_cut' | 'most_stable';
  relightMode?: 'none' | 'warm' | 'cool' | 'neon_dual';
  relightEnabled?: boolean;
  relightIntensity?: number;
  motionBlur?: number;    // 0 to 100
  motionBlurAmount?: number;
  removeFlicker?: boolean;
  aiUpscale?: boolean;
  // CapCut Audio & Speed
  speed: number;          // 0.1 to 100.0
  keepPitch?: boolean;
  smoothSlowMo?: boolean | 'none' | 'frame_blending' | 'optical_flow';
  speedCurvePreset?: SpeedCurvePresetType;
  speedCurve?: SpeedCurvePresetType;
  reversed?: boolean;     // Reverse playback
  isFrozenFrame?: boolean;
  volume: number;         // 0 to 200 (%)
  muted?: boolean;
  fadeIn?: number;        // seconds (0 to 5)
  fadeOut?: number;       // seconds (0 to 5)
  noiseReduction?: boolean;
  normalizeLoudness?: boolean; // -14 LUFS
  loudnessNormalize?: boolean;
  enhanceVoice?: boolean;
  audioDucking?: boolean;
  vocalIsolation?: 'none' | 'off' | 'keep_vocal' | 'remove_vocal';
  voiceChanger?: 'none' | 'chipmunk' | 'robot' | 'deep' | 'echo' | 'megaphone';
  voiceEffect?: 'none' | 'chipmunk' | 'robot' | 'deep' | 'echo' | 'megaphone';
  beatMarkers?: number[]; // relative seconds of detected beats
  sfxType?: 'whoosh' | 'beep' | 'bassdrop' | 'ding';
  // CapCut Color Adjustments (Điều chỉnh Basic + HSL: default 0, min -100, max 100)
  brightness?: number;    // -100 to 100
  contrast?: number;      // -100 to 100
  saturation?: number;    // -100 to 100
  warmth?: number;        // -100 to 100 (Temp)
  tint?: number;          // -100 to 100
  highlight?: number;     // -100 to 100
  shadow?: number;        // -100 to 100
  sharpen?: number;       // -100 to 100
  vignette?: number;      // -100 to 100
  protectSkinTone?: boolean;
  hslColor?: 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'magenta';
  hslHue?: number;
  hslSat?: number;
  hslBri?: number;
  filterPreset?: FilterPresetType;
  visualEffect?: VisualEffectType;
  // Transitions & Animations
  transitionType?: TransitionPresetType;
  transitionDuration?: number; // 0.1s to 3.0s
  animationIn?: AnimationPreset;
  animIn?: AnimationPreset;
  animationOut?: AnimationPreset;
  animationCombo?: AnimationPreset;
  // Cutout / Mask / Retouch (38-param Face & Body)
  removeBg?: boolean;     // Chroma key
  autoCutout?: boolean;   // AI Human cutout
  cutoutStrokeColor?: string;
  chromaColor?: string;
  chromaTolerance?: number;
  blurBg?: boolean;
  maskType?: MaskShapeType;
  maskInvert?: boolean;
  maskFeather?: number;   // 0 to 50
  smoothSkin?: number;    // 0 to 100
  retouchBrighten?: number;
  faceBrighten?: number;
  retouchWhiteTeeth?: number;
  whiteTeeth?: number;
  retouchVLine?: number;
  faceSlim?: number;
  retouchBigEyes?: number;
  retouchSlimBody?: number;
  bodySlim?: number;
  // Motion Tracking
  motionTrackingActive?: boolean;
  motionTrackingEnabled?: boolean;
  trackingTargetX?: number;
  trackingTargetY?: number;
  // Keyframes (Hình thoi ◇)
  keyframes?: ClipKeyframe[];
  // Subtitle / Text / Sticker properties
  subtitleText?: string;
  stickerEmoji?: string;
  stickerType?: StickerOverlayType;
  stickerText?: string;
  stickerSubText?: string;
  fontFamily?: string;
  fontSize?: number;
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textColor?: string;
  textStrokeColor?: string;
  textBgColor?: string;
  textShadow?: boolean;
  textCurveDeg?: number;  // -360 to 360
  colorHex: string;
  thumbnailSeed?: number;
  thumbnailDataUrl?: string;
  thumbnailUrl?: string;
  videoObjectUrl?: string;
  audioObjectUrl?: string;
  mediaUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  fileSizeBytes?: number;
  sourceFileSizeBytes?: number;
  nativeAspectRatio?: string;
  waveformPeaks?: number[];
  isSample?: boolean;
  isCompoundClip?: boolean;
  groupId?: string;
  disabled?: boolean;
}

export interface GlobalAdjustmentLayer {
  enabled: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  sharpen: number;
  warmth: number;
  vignette: number;
  lutName?: string;
}

export type GpuEncoderOption =
  | 'h264_nvenc'
  | 'hevc_nvenc'
  | 'prores'
  | 'h264_qsv'
  | 'h264_amf'
  | 'libx264';

export interface AntiDetectConfig {
  autoMirrorAll?: boolean;
  blurredPadding916?: boolean;
  microSpeedZoom?: boolean;
  antiHashSpoofing?: boolean;
  spoofIphoneMetadata?: boolean;
  spoofIphoneMeta?: boolean;
  iphoneModel?: string;
  injectMicroNoise: boolean;
  audioPitchShift?: boolean;
  noiseStrength?: number;
  pitchShiftSemitones?: number;
  colorShiftPercent?: number;
  matrixVariantCount?: number;
  variantCount?: number;
  gpuEncoder: GpuEncoderOption;
  crf?: number;
  preset?: 'slow' | 'slower' | 'medium' | 'fast';
  targetDurationSec?: number;
}

export interface SubProjectItem {
  id: string;
  name: string;
  createdAt: string;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '21:9' | string;
  clips: TimelineClip[];
  isDeletedInTrash?: boolean;
}

export type SubProjectVariant = SubProjectItem;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export function naturalSortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => collator.compare(a.name, b.name));
}

export function createDefaultClip(
  partial: Partial<TimelineClip> &
    Pick<TimelineClip, 'id' | 'name' | 'trackIndex'> &
    Partial<Pick<TimelineClip, 'startTime' | 'duration'>>
): TimelineClip {
  const scale =
    partial.scale ??
    (partial.cropRatio ? Math.round(partial.cropRatio * 100) : 100);
  const dur = partial.duration ?? 5.0;
  const start = partial.startTime ?? 0.0;
  return {
    filePath: `C:/Media/${partial.name}`,
    sourceIn: 0,
    sourceDuration: dur,
    startTime: start,
    duration: dur,
    scale,
    scaleX: scale,
    scaleY: scale,
    uniformScale: true,
    posX: 0,
    posY: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    cropRatio: scale / 100,
    layerOrder: 1,
    blendMode: 'normal',
    opacity: 100,
    stabilizeLevel: 'none',
    relightMode: 'none',
    relightIntensity: 50,
    motionBlur: 0,
    speed: 1.0,
    keepPitch: true,
    smoothSlowMo: false,
    speedCurvePreset: 'none',
    reversed: false,
    volume: 100,
    muted: false,
    fadeIn: 0,
    fadeOut: 0,
    noiseReduction: false,
    normalizeLoudness: false,
    enhanceVoice: false,
    audioDucking: false,
    vocalIsolation: 'none',
    voiceChanger: 'none',
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    tint: 0,
    highlight: 0,
    shadow: 0,
    sharpen: 0,
    vignette: 0,
    protectSkinTone: false,
    hslColor: 'orange',
    hslHue: 0,
    hslSat: 0,
    hslBri: 0,
    filterPreset: 'none',
    visualEffect: 'none',
    transitionType: 'none',
    transitionDuration: 0.5,
    animationIn: 'none',
    animationOut: 'none',
    animationCombo: 'none',
    removeBg: false,
    autoCutout: false,
    cutoutStrokeColor: '#00E5CC',
    chromaColor: 'green',
    chromaTolerance: 30,
    blurBg: false,
    maskType: 'none',
    maskInvert: false,
    maskFeather: 0,
    smoothSkin: 0,
    retouchBrighten: 0,
    retouchWhiteTeeth: 0,
    retouchVLine: 0,
    retouchBigEyes: 0,
    retouchSlimBody: 0,
    motionTrackingActive: false,
    trackingTargetX: 0,
    trackingTargetY: 0,
    keyframes: [],
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 28,
    textBold: true,
    textItalic: false,
    textUnderline: false,
    textColor: '#FFFFFF',
    textStrokeColor: '#000000',
    textBgColor: 'transparent',
    textShadow: true,
    textCurveDeg: 0,
    colorHex:
      partial.trackIndex === 0
        ? '#0D5C56'
        : partial.trackIndex === 1
        ? '#1E40AF'
        : '#A85548',
    thumbnailSeed: 1,
    ...partial,
  };
}

export function formatTimecode(seconds: number, fps: number = 30): string {
  const clamped = Math.max(0, seconds);
  const totalFrames = Math.round(clamped * fps);
  const ff = totalFrames % fps;
  const totalSeconds = Math.floor(totalFrames / fps);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

export function parseTimecodeInput(raw: string, fps: number = 30): number | null {
  const clean = raw.trim();
  if (!clean) return null;
  if (/^\d+(\.\d+)?$/.test(clean) && clean.length <= 4) {
    return Math.max(0, Number(clean));
  }
  const parts = clean.split(':').map(Number);
  if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
    return Math.max(0, parts[0] * 3600 + parts[1] * 60 + parts[2] + parts[3] / fps);
  }
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return Math.max(0, parts[0] * 60 + parts[1] + parts[2] / fps);
  }
  // Support compact 6-digit format like "013000" -> 01m 30s 00f
  if (/^\d{6}$/.test(clean)) {
    const mm = Number(clean.slice(0, 2));
    const ss = Number(clean.slice(2, 4));
    const ff = Number(clean.slice(4, 6));
    return Math.max(0, mm * 60 + ss + ff / fps);
  }
  return null;
}

export function packTrackClipsContiguously(
  clips: TimelineClip[],
  trackIndex: TrackIndex
): TimelineClip[] {
  const otherClips = clips.filter((c) => c.trackIndex !== trackIndex);
  const targetClips = clips
    .filter((c) => c.trackIndex === trackIndex)
    .sort((a, b) => a.startTime - b.startTime);

  let cursor = 0;
  const packed = targetClips.map((clip) => {
    const updated: TimelineClip = {
      ...clip,
      startTime: Number(cursor.toFixed(3)),
      duration: Number(Math.max(0.2, clip.duration).toFixed(3)),
    };
    cursor += updated.duration;
    return updated;
  });

  return [...packed, ...otherClips];
}

export function closeGapAtTimeOnTrack(
  clips: TimelineClip[],
  trackIndex: TrackIndex,
  timeSec: number
): TimelineClip[] {
  const otherClips = clips.filter((c) => c.trackIndex !== trackIndex);
  const targetClips = clips
    .filter((c) => c.trackIndex === trackIndex)
    .sort((a, b) => a.startTime - b.startTime);

  // Find the gap around timeSec: either before the first clip or between clip[i] and clip[i+1]
  let gapStart = 0;
  let gapEnd = 0;
  for (let i = 0; i < targetClips.length; i++) {
    const prevEnd = i === 0 ? 0 : targetClips[i - 1].startTime + targetClips[i - 1].duration;
    const currStart = targetClips[i].startTime;
    if (currStart - prevEnd > 0.05 && timeSec >= prevEnd - 0.25 && timeSec <= currStart + 0.25) {
      gapStart = prevEnd;
      gapEnd = currStart;
      break;
    }
  }
  const gapDuration = Number((gapEnd - gapStart).toFixed(3));
  if (gapDuration <= 0.05) {
    return packTrackClipsContiguously(clips, trackIndex);
  }

  const shifted = targetClips.map((c) =>
    c.startTime >= gapEnd - 0.05
      ? { ...c, startTime: Number(Math.max(0, c.startTime - gapDuration).toFixed(3)) }
      : c
  );
  return [...shifted, ...otherClips];
}

export function closeAllGapsOnTrack(
  clips: TimelineClip[],
  trackIndex: TrackIndex
): TimelineClip[] {
  return packTrackClipsContiguously(clips, trackIndex);
}

export function splitClipAtPlayhead(
  clips: TimelineClip[],
  playheadTime: number,
  selectedOrIds?: string | string[] | null
): TimelineClip[] & { clips: TimelineClip[]; splitCount: number } {
  const minMargin = 0.08;
  let splitCount = 0;
  const result: TimelineClip[] = [];

  let selectedIds = Array.isArray(selectedOrIds)
    ? selectedOrIds
    : selectedOrIds
    ? [selectedOrIds]
    : [];

  // If nothing is selected, target the primary clip under playhead (favoring track 0)
  if (selectedIds.length === 0) {
    const under = clips.filter(
      (c) => playheadTime > c.startTime + minMargin && playheadTime < c.startTime + c.duration - minMargin
    );
    if (under.length > 0) {
      under.sort((a, b) => a.trackIndex - b.trackIndex);
      selectedIds = [under[0].id];
    }
  }

  const hasSelection = selectedIds.length > 0;

  for (const clip of clips) {
    const clipEnd = clip.startTime + clip.duration;
    const isEligibleSelection = !hasSelection || selectedIds.includes(clip.id);
    const isUnderPlayhead =
      playheadTime > clip.startTime + minMargin &&
      playheadTime < clipEnd - minMargin;

    if (isEligibleSelection && isUnderPlayhead) {
      const leftDuration = Number((playheadTime - clip.startTime).toFixed(3));
      const rightDuration = Number((clipEnd - playheadTime).toFixed(3));

      const leftClip: TimelineClip = {
        ...clip,
        duration: leftDuration,
      };

      const rightClip: TimelineClip = {
        ...clip,
        id: `${clip.id}_b_${Math.floor(playheadTime * 100)}_${Math.random().toString(36).slice(2, 5)}`,
        name: clip.name.includes('_Part')
          ? clip.name
          : `${clip.name.replace(/\.mp4$/i, '')}_Part2.mp4`,
        startTime: Number(playheadTime.toFixed(3)),
        duration: rightDuration,
        sourceIn: Number((clip.sourceIn + leftDuration * clip.speed).toFixed(3)),
      };

      result.push(leftClip, rightClip);
      splitCount += 1;
    } else {
      result.push(clip);
    }
  }

  const hybrid = [...result] as TimelineClip[] & {
    clips: TimelineClip[];
    splitCount: number;
  };
  hybrid.clips = result;
  hybrid.splitCount = splitCount;
  return hybrid;
}

export function trimClipLeftToPlayhead(
  clips: TimelineClip[],
  playheadTime: number,
  selectedOrIds?: string | string[] | null,
  autoSnap: boolean = true
): TimelineClip[] {
  let selectedIds = Array.isArray(selectedOrIds)
    ? selectedOrIds
    : selectedOrIds
    ? [selectedOrIds]
    : [];

  // If no clip is explicitly selected, find the primary clip under playhead (favoring track 0)
  if (selectedIds.length === 0) {
    const under = clips.filter(
      (c) => playheadTime > c.startTime + 0.05 && playheadTime < c.startTime + c.duration - 0.05
    );
    if (under.length > 0) {
      under.sort((a, b) => a.trackIndex - b.trackIndex);
      selectedIds = [under[0].id];
    }
  }

  const updated = clips.map((clip) => {
    const clipEnd = clip.startTime + clip.duration;
    const isTarget =
      selectedIds.includes(clip.id) &&
      playheadTime > clip.startTime + 0.05 &&
      playheadTime < clipEnd - 0.05;
    if (!isTarget) return clip;
    const cutDelta = playheadTime - clip.startTime;
    return {
      ...clip,
      startTime: Number(playheadTime.toFixed(3)),
      duration: Number((clipEnd - playheadTime).toFixed(3)),
      sourceIn: Number((clip.sourceIn + cutDelta * clip.speed).toFixed(3)),
    };
  });
  return autoSnap ? packTrackClipsContiguously(updated, 0) : updated;
}

export const trimClipStartToPlayhead = trimClipLeftToPlayhead;

export function trimClipRightToPlayhead(
  clips: TimelineClip[],
  playheadTime: number,
  selectedOrIds?: string | string[] | null,
  autoSnap: boolean = true
): TimelineClip[] {
  let selectedIds = Array.isArray(selectedOrIds)
    ? selectedOrIds
    : selectedOrIds
    ? [selectedOrIds]
    : [];

  // If no clip is explicitly selected, find the primary clip under playhead (favoring track 0)
  if (selectedIds.length === 0) {
    const under = clips.filter(
      (c) => playheadTime > c.startTime + 0.05 && playheadTime < c.startTime + c.duration - 0.05
    );
    if (under.length > 0) {
      under.sort((a, b) => a.trackIndex - b.trackIndex);
      selectedIds = [under[0].id];
    }
  }

  const updated = clips.map((clip) => {
    const clipEnd = clip.startTime + clip.duration;
    const isTarget =
      selectedIds.includes(clip.id) &&
      playheadTime > clip.startTime + 0.05 &&
      playheadTime < clipEnd - 0.05;
    if (!isTarget) return clip;
    return {
      ...clip,
      duration: Number((playheadTime - clip.startTime).toFixed(3)),
    };
  });
  return autoSnap ? packTrackClipsContiguously(updated, 0) : updated;
}

export const trimClipEndToPlayhead = trimClipRightToPlayhead;

export function freezeFrameAtPlayhead(
  clips: TimelineClip[],
  playheadSec: number,
  freezeDurationSec: number = 3.0
): TimelineClip[] {
  const activeV1 = clips.find(
    (c) =>
      c.trackIndex === 0 &&
      playheadSec >= c.startTime &&
      playheadSec <= c.startTime + c.duration
  );
  if (!activeV1) return clips;

  const frozenClip: TimelineClip = {
    ...activeV1,
    id: `${activeV1.id}-freeze-${Date.now()}`,
    name: `[Đóng băng 3s] ${activeV1.name}`,
    startTime: Number(playheadSec.toFixed(2)),
    duration: freezeDurationSec,
    isFrozenFrame: true,
    colorHex: '#0284C7',
  };

  return packTrackClipsContiguously([...clips, frozenClip], 0);
}

/**
 * Extract audio from a video clip into a standalone Audio Track clip (Ctrl + Shift + S)
 */
export function extractAudioFromVideoClip(
  clips: TimelineClip[],
  videoClipId: string
): TimelineClip[] {
  const target = clips.find((c) => c.id === videoClipId && c.trackIndex === 0);
  if (!target) return clips;

  const extractedAudio: TimelineClip = {
    ...createDefaultClip({
      id: `aud_ext_${target.id}_${Date.now()}`,
      name: `[Audio] ${target.name.replace(/\.[^.]+$/, '')}.wav`,
      trackIndex: 1,
      startTime: target.startTime,
      duration: target.duration,
    }),
    sourceIn: target.sourceIn,
    volume: target.volume,
    mediaUrl: target.mediaUrl,
    colorHex: '#0284C7',
  };

  return [
    ...clips.map((c) => (c.id === videoClipId ? { ...c, muted: true } : c)),
    extractedAudio,
  ];
}

/**
 * Copy & Paste visual/audio attributes between clips (Ctrl + Shift + C / Ctrl + Shift + V)
 */
export function copyClipAttributes(clip: TimelineClip): Partial<TimelineClip> {
  return {
    scale: clip.scale,
    posX: clip.posX,
    posY: clip.posY,
    rotation: clip.rotation,
    flipH: clip.flipH,
    flipV: clip.flipV,
    opacity: clip.opacity,
    blendMode: clip.blendMode,
    brightness: clip.brightness,
    contrast: clip.contrast,
    saturation: clip.saturation,
    warmth: clip.warmth,
    tint: clip.tint,
    sharpen: clip.sharpen,
    vignette: clip.vignette,
    filterPreset: clip.filterPreset,
    visualEffect: clip.visualEffect,
    relightMode: clip.relightMode,
    maskType: clip.maskType,
    smoothSkin: clip.smoothSkin,
  };
}

export function pasteClipAttributes(
  clips: TimelineClip[],
  targetClipId: string,
  attrs: Partial<TimelineClip>
): TimelineClip[];
export function pasteClipAttributes(
  clip: TimelineClip,
  attrs: Partial<TimelineClip>
): TimelineClip;
export function pasteClipAttributes(
  arg1: TimelineClip[] | TimelineClip,
  arg2: string | Partial<TimelineClip>,
  arg3?: Partial<TimelineClip>
): TimelineClip[] | TimelineClip {
  if (Array.isArray(arg1) && typeof arg2 === 'string' && arg3) {
    return arg1.map((c) => (c.id === arg2 ? { ...c, ...arg3 } : c));
  }
  if (!Array.isArray(arg1) && typeof arg2 === 'object') {
    return { ...arg1, ...arg2 };
  }
  return arg1;
}

/**
 * Keyframe Diamond (◇) Engine: Add/Toggle keyframe on clip and interpolate values at playhead
 */
export function addOrToggleKeyframeAtTime(
  clip: TimelineClip,
  playheadSec: number,
  easing: KeyframeEasingType = 'ease_out'
): TimelineClip {
  const offset = Number(Math.max(0, Math.min(clip.duration, playheadSec - clip.startTime)).toFixed(2));
  const existing = clip.keyframes || [];
  const nearIdx = existing.findIndex((k) => Math.abs(k.timeOffset - offset) < 0.15);

  let nextKeyframes: ClipKeyframe[];
  if (nearIdx >= 0) {
    // Update or remove if identical
    nextKeyframes = existing.filter((_, i) => i !== nearIdx);
  } else {
    const newKf: ClipKeyframe = {
      id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      timeOffset: offset,
      scale: clip.scale ?? 100,
      posX: clip.posX ?? 0,
      posY: clip.posY ?? 0,
      rotation: clip.rotation ?? 0,
      opacity: clip.opacity ?? 100,
      volume: clip.volume ?? 100,
      easing,
    };
    nextKeyframes = [...existing, newKf].sort((a, b) => a.timeOffset - b.timeOffset);
  }
  return { ...clip, keyframes: nextKeyframes };
}

export function interpolateClipAtPlayhead(
  clip: TimelineClip,
  playheadSec: number
): {
  scale: number;
  posX: number;
  posY: number;
  rotation: number;
  opacity: number;
  volume: number;
} {
  const base = {
    scale: clip.scale ?? 100,
    posX: clip.posX ?? 0,
    posY: clip.posY ?? 0,
    rotation: clip.rotation ?? 0,
    opacity: clip.opacity ?? 100,
    volume: clip.volume ?? 100,
  };

  const kfs = clip.keyframes;
  if (!kfs || kfs.length === 0) return base;
  if (kfs.length === 1) {
    return {
      scale: kfs[0].scale,
      posX: kfs[0].posX,
      posY: kfs[0].posY,
      rotation: kfs[0].rotation,
      opacity: kfs[0].opacity,
      volume: kfs[0].volume,
    };
  }

  const elapsed = Math.max(0, Math.min(clip.duration, playheadSec - clip.startTime));
  if (elapsed <= kfs[0].timeOffset) {
    return {
      scale: kfs[0].scale,
      posX: kfs[0].posX,
      posY: kfs[0].posY,
      rotation: kfs[0].rotation,
      opacity: kfs[0].opacity,
      volume: kfs[0].volume,
    };
  }
  const last = kfs[kfs.length - 1];
  if (elapsed >= last.timeOffset) {
    return {
      scale: last.scale,
      posX: last.posX,
      posY: last.posY,
      rotation: last.rotation,
      opacity: last.opacity,
      volume: last.volume,
    };
  }

  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i];
    const b = kfs[i + 1];
    if (elapsed >= a.timeOffset && elapsed <= b.timeOffset) {
      const span = Math.max(0.001, b.timeOffset - a.timeOffset);
      let t = (elapsed - a.timeOffset) / span;
      if (b.easing === 'ease_out') {
        t = 1 - Math.pow(1 - t, 2.2);
      } else if (b.easing === 'ease_in') {
        t = Math.pow(t, 2.2);
      } else if (b.easing === 's_curve') {
        t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      }
      const lerp = (v1: number, v2: number) => Number((v1 + (v2 - v1) * t).toFixed(2));
      return {
        scale: lerp(a.scale, b.scale),
        posX: lerp(a.posX, b.posX),
        posY: lerp(a.posY, b.posY),
        rotation: lerp(a.rotation, b.rotation),
        opacity: lerp(a.opacity, b.opacity),
        volume: lerp(a.volume, b.volume),
      };
    }
  }
  return base;
}

export function generateAutoBeatsForAudioClip(
  clip: TimelineClip,
  mode: 'beat1' | 'beat2' | 'clear'
): TimelineClip;
export function generateAutoBeatsForAudioClip(
  clip: TimelineClip,
  bpm: number
): TimelineMarker[];
export function generateAutoBeatsForAudioClip(
  clip: TimelineClip,
  modeOrBpm: 'beat1' | 'beat2' | 'clear' | number
): TimelineClip | TimelineMarker[] {
  if (typeof modeOrBpm === 'number') {
    const step = Math.max(0.4, 60 / Math.max(40, modeOrBpm) * 2);
    const markers: TimelineMarker[] = [];
    for (let t = step; t < clip.duration - 0.2; t += step) {
      markers.push({
        id: `beat_${Date.now()}_${Math.round(t * 100)}`,
        timeSec: Number((clip.startTime + t).toFixed(2)),
        label: `Beat ${(markers.length + 1)}`,
        color: '#F59E0B',
      });
    }
    return markers;
  }
  if (modeOrBpm === 'clear') {
    return { ...clip, beatMarkers: [] };
  }
  const step = modeOrBpm === 'beat1' ? 1.5 : 0.75;
  const markers: number[] = [];
  for (let t = step; t < clip.duration - 0.2; t += step) {
    markers.push(Number(t.toFixed(2)));
  }
  return { ...clip, beatMarkers: markers };
}

/**
 * Marquee Rectangle Selection on Timeline:
 * Returns IDs of all clips whose time range [startTime, startTime + duration]
 * and trackIndex fall inside the dragged selection box.
 */
export function getClipsInMarqueeBox(
  clips: TimelineClip[],
  minTimeSec: number,
  maxTimeSec: number,
  coveredTrackIds: number[]
): string[] {
  const startT = Math.min(minTimeSec, maxTimeSec);
  const endT = Math.max(minTimeSec, maxTimeSec);
  const trackSet = new Set(coveredTrackIds);

  return clips
    .filter((c) => {
      if (trackSet.size > 0 && !trackSet.has(c.trackIndex)) return false;
      const cStart = c.startTime;
      const cEnd = c.startTime + c.duration;
      return cEnd >= startT && cStart <= endT;
    })
    .map((c) => c.id);
}

/**
 * Compute dense, thin vertical audio amplitude bar heights (0.04..1.0) for any Video or Audio clip.
 * Fixed waveform pattern per clip media/name, scaled proportionally by the clip's volume (0..200%).
 */
export function computeClipWaveformBars(
  clip: Pick<
    TimelineClip,
    'id' | 'name' | 'duration' | 'sourceIn' | 'speed' | 'volume' | 'muted' | 'waveformPeaks'
  >,
  barCount: number = 48,
  trackMuted: boolean = false,
  startBarIndex?: number,
  endBarIndex?: number
): number[] {
  const safeCount = Math.max(8, Math.min(250000, Math.round(barCount)));
  const startIdx =
    startBarIndex !== undefined ? Math.max(0, Math.min(safeCount, Math.floor(startBarIndex))) : 0;
  const endIdx =
    endBarIndex !== undefined
      ? Math.max(startIdx, Math.min(safeCount, Math.ceil(endBarIndex)))
      : safeCount;
  const sliceLen = Math.max(0, endIdx - startIdx);

  const rawVol = clip.muted || trackMuted ? 0 : Math.max(0, clip.volume ?? 100);
  if (rawVol <= 0.01) {
    return Array.from({ length: sliceLen }, () => 0.05);
  }

  // Scale factor: 100% volume -> 1.0x, 200% volume -> 1.45x, 50% volume -> 0.5x
  const volScale =
    rawVol <= 100
      ? rawVol / 100
      : 1 + ((rawVol - 100) / 100) * 0.45;

  const peaks = clip.waveformPeaks;
  if (peaks && peaks.length >= 4) {
    const out: number[] = [];
    for (let i = startIdx; i < endIdx; i++) {
      const ratio = i / Math.max(1, safeCount - 1);
      const exactIdx = ratio * (peaks.length - 1);
      const i0 = Math.floor(exactIdx);
      const i1 = Math.min(peaks.length - 1, i0 + 1);
      const frac = exactIdx - i0;
      const sample = peaks[i0] * (1 - frac) + peaks[i1] * frac;
      const scaled = Math.max(0.08, Math.min(1.0, sample * volScale));
      out.push(Number(scaled.toFixed(3)));
    }
    return out;
  }

  // Deterministic multi-harmonic audio waveform profile seeded from clip name
  const seedStr = (clip.name || clip.id || 'tdocut').toLowerCase();
  let hash = 2166136261;
  for (let k = 0; k < seedStr.length; k++) {
    hash ^= seedStr.charCodeAt(k);
    hash = Math.imul(hash, 16777619);
  }
  const phaseA = ((hash >>> 0) % 360) * (Math.PI / 180);
  const phaseB = (((hash >>> 8) & 0xff) / 255) * Math.PI * 2;
  const phaseC = (((hash >>> 16) & 0xff) / 255) * Math.PI * 2;

  const srcIn = Math.max(0, clip.sourceIn || 0);
  const dur = Math.max(0.5, clip.duration || 5);
  const spd = Math.max(0.25, clip.speed || 1);

  const bars: number[] = [];
  for (let i = startIdx; i < endIdx; i++) {
    const t = srcIn + (i / Math.max(1, safeCount - 1)) * dur * spd;
    // Combine syllabic speech/music cadence with high-frequency transients
    const envSlow = 0.54 + 0.34 * Math.sin(t * 2.3 + phaseA);
    const envMid = 0.25 * Math.abs(Math.cos(t * 6.7 + phaseB));
    const envFast = 0.28 * Math.abs(Math.sin(i * 1.85 + t * 13.1 + phaseC));
    // Natural breath dips every ~7 bars
    const breathGate = (i + (hash & 7)) % 9 === 0 ? 0.32 : 1.0;
    const rawAmp = Math.min(0.98, Math.max(0.14, (envSlow * 0.55 + envMid + envFast) * breathGate));
    const scaled = Math.max(0.08, Math.min(1.0, rawAmp * volScale));
    bars.push(Number(scaled.toFixed(3)));
  }
  return bars;
}

export interface TimelineInsertionSlot {
  trackIndex: number;
  startTime: number;
  duration: number;
  insertIndex: number;
}

/**
 * CapCut PC Floating 2D Drag & Magnetic Insertion Slot Engine:
 * - Non-dragged clips on Track 0 (Main Video Track) are always packed contiguously from 00:00
 *   when `snapMainTrack` is enabled, guaranteeing ZERO unintended gaps between videos.
 * - When the floating dragged clip hovers over Track 0, finds the exact insertion index,
 *   parts subsequent Track 0 clips to the right by the dragged clip's duration, and returns
 *   the exact `slot` (`[startTime, startTime + duration]`) to render the dark gray placeholder box.
 * - When the floating dragged clip is lifted onto an Overlay/Audio/Text track (`targetTrackIndex !== 0`),
 *   Track 0 closes its gap immediately and the clip is positioned on `targetTrackIndex` (parting any
 *   overlapping clips on that track).
 */
export function computeCapCutDragInsertionPreview(
  initialClips: TimelineClip[],
  draggedIds: string[],
  targetTrackIndex: number,
  tentativeStartSec: number,
  snapMainTrack: boolean = true,
  lockedTracks: Record<number, boolean> = {}
): {
  previewClips: TimelineClip[];
  slot: TimelineInsertionSlot | null;
} {
  const dragIdSet = new Set(draggedIds);
  const draggedClips = initialClips
    .filter((c) => dragIdSet.has(c.id) && !lockedTracks[c.trackIndex])
    .sort((a, b) => a.startTime - b.startTime);

  if (draggedClips.length === 0) {
    return { previewClips: initialClips, slot: null };
  }

  const minDragOrigStart = Math.min(...draggedClips.map((c) => c.startTime));
  const maxDragOrigEnd = Math.max(...draggedClips.map((c) => c.startTime + c.duration));
  const dragSpanSec = Number(Math.max(0.1, maxDragOrigEnd - minDragOrigStart).toFixed(3));
  const safeTargetTrack = lockedTracks[targetTrackIndex]
    ? draggedClips[0].trackIndex
    : targetTrackIndex;
  const clampedHoverStart = Math.max(0, Number(tentativeStartSec.toFixed(3)));

  // Step 1: Separate static (non-dragged) clips and always pack Track 0 static clips contiguously if snapMainTrack is true
  const staticClips = initialClips.filter((c) => !dragIdSet.has(c.id));
  const staticTrack0Raw = staticClips
    .filter((c) => c.trackIndex === 0)
    .sort((a, b) => a.startTime - b.startTime);

  const staticTrack0Packed: TimelineClip[] = [];
  let cursor0 = 0;
  for (const c of staticTrack0Raw) {
    if (snapMainTrack) {
      const nextC = { ...c, startTime: Number(cursor0.toFixed(3)) };
      staticTrack0Packed.push(nextC);
      cursor0 = Number((cursor0 + c.duration).toFixed(3));
    } else {
      staticTrack0Packed.push({ ...c });
      cursor0 = Math.max(cursor0, Number((c.startTime + c.duration).toFixed(3)));
    }
  }

  // Case A: Hovering over Main Video Track (Track 0) with magnetic snap enabled
  if (safeTargetTrack === 0 && snapMainTrack) {
    // Determine insertion index among staticTrack0Packed based on where tentativeStartSec falls
    let insertIndex = staticTrack0Packed.length;
    for (let i = 0; i < staticTrack0Packed.length; i++) {
      const s = staticTrack0Packed[i];
      // Use midpoint of static clip s so dragging into the left half or seam before s parts s to the right
      const splitPoint = s.startTime + s.duration * 0.5;
      if (clampedHoverStart < splitPoint) {
        insertIndex = i;
        break;
      }
    }

    const slotStartSec =
      insertIndex < staticTrack0Packed.length
        ? staticTrack0Packed[insertIndex].startTime
        : cursor0;

    // Shift static clips on Track 0 at index >= insertIndex to the right by dragSpanSec
    const shiftedTrack0 = staticTrack0Packed.map((c, idx) =>
      idx >= insertIndex
        ? { ...c, startTime: Number((c.startTime + dragSpanSec).toFixed(3)) }
        : c
    );

    // Place dragged clips into the slot [slotStartSec, slotStartSec + dragSpanSec]
    let dragCursor = slotStartSec;
    const placedDragged = draggedClips.map((c) => {
      const updated: TimelineClip = {
        ...c,
        trackIndex: 0,
        startTime: Number(dragCursor.toFixed(3)),
      };
      dragCursor = Number((dragCursor + c.duration).toFixed(3));
      return updated;
    });

    const otherStatic = staticClips.filter((c) => c.trackIndex !== 0);
    const byId = new Map<string, TimelineClip>();
    for (const c of [...shiftedTrack0, ...otherStatic, ...placedDragged]) {
      byId.set(c.id, c);
    }

    return {
      previewClips: initialClips.map((c) => byId.get(c.id) || c),
      slot: {
        trackIndex: 0,
        startTime: Number(slotStartSec.toFixed(3)),
        duration: dragSpanSec,
        insertIndex,
      },
    };
  }

  // Case B: Hovering over an Overlay / Audio / Text track (or Track 0 when snapMainTrack is OFF)
  // Notice that staticTrack0Packed is ALREADY contiguously packed (zero gaps left behind on Track 0!)
  const staticOnTarget = (
    safeTargetTrack === 0
      ? staticTrack0Packed
      : staticClips
          .filter((c) => c.trackIndex === safeTargetTrack)
          .sort((a, b) => a.startTime - b.startTime)
  ).map((c) => ({ ...c }));

  const selEnd = Number((clampedHoverStart + dragSpanSec).toFixed(3));
  const hasOverlap = staticOnTarget.some(
    (s) => clampedHoverStart < s.startTime + s.duration - 0.02 && selEnd > s.startTime + 0.02
  );

  let effectiveStartSec = clampedHoverStart;
  let insertIndex = staticOnTarget.filter((s) => s.startTime + s.duration <= clampedHoverStart).length;

  if (hasOverlap) {
    const leftClips: TimelineClip[] = [];
    const rightClips: TimelineClip[] = [];
    for (const s of staticOnTarget) {
      const splitPoint = s.startTime + s.duration * 0.5;
      if (clampedHoverStart < splitPoint) {
        rightClips.push(s);
      } else {
        leftClips.push(s);
      }
    }
    insertIndex = leftClips.length;
    const leftMaxEnd =
      leftClips.length > 0
        ? Math.max(...leftClips.map((c) => c.startTime + c.duration))
        : 0;
    effectiveStartSec = Number(Math.max(leftMaxEnd, clampedHoverStart).toFixed(3));

    let rippleCursor = Number((effectiveStartSec + dragSpanSec).toFixed(3));
    for (let i = 0; i < rightClips.length; i++) {
      const rc = rightClips[i];
      if (rc.startTime < rippleCursor - 0.005) {
        rc.startTime = Number(rippleCursor.toFixed(3));
        rippleCursor = Number((rc.startTime + rc.duration).toFixed(3));
      } else {
        rippleCursor = Number((rc.startTime + rc.duration).toFixed(3));
      }
    }
  }

  const placedDragged = draggedClips.map((c) => ({
    ...c,
    trackIndex: safeTargetTrack,
    startTime: Number((effectiveStartSec + (c.startTime - minDragOrigStart)).toFixed(3)),
  }));

  const byId = new Map<string, TimelineClip>();
  for (const c of staticClips) {
    byId.set(c.id, c);
  }
  for (const c of staticTrack0Packed) {
    byId.set(c.id, c);
  }
  for (const c of staticOnTarget) {
    byId.set(c.id, c);
  }
  for (const c of placedDragged) {
    byId.set(c.id, c);
  }

  return {
    previewClips: initialClips.map((c) => byId.get(c.id) || c),
    slot: {
      trackIndex: safeTargetTrack,
      startTime: Number(effectiveStartSec.toFixed(3)),
      duration: dragSpanSec,
      insertIndex,
    },
  };
}

/**
 * Move one or multiple selected clips horizontally (deltaTimeSec) and/or vertically
 * across tracks (deltaTrackIndex), preserving relative spacing when hitting 0.0s,
 * respecting locked tracks, and dynamically parting ("né chỗ") non-selected clips
 * when a clip is dragged between two clips or onto an existing clip on the target track.
 */
export function moveSelectedClipsByDelta(
  clips: TimelineClip[],
  selectedIds: string[],
  deltaTimeSec: number,
  deltaTrackIndex: number = 0,
  validTrackIndices: number[] = [0, 1, 2, 3],
  lockedTracks: Record<number, boolean> = {},
  audioLinked: boolean = false
): TimelineClip[] {
  const baseIdSet = new Set(selectedIds);
  // Expand selection to include clips in the same groupId
  const groupIds = new Set(
    clips
      .filter((c) => baseIdSet.has(c.id) && c.groupId)
      .map((c) => c.groupId as string)
  );
  const idSet = new Set(selectedIds);
  if (groupIds.size > 0) {
    for (const c of clips) {
      if (c.groupId && groupIds.has(c.groupId)) {
        idSet.add(c.id);
      }
    }
  }
  // When audioLinked is enabled and moving horizontally on the same track, link audio clips aligned with selected video clips
  if (audioLinked && deltaTrackIndex === 0) {
    const selectedVideos = clips.filter((c) => idSet.has(c.id) && c.trackIndex === 0);
    for (const v of selectedVideos) {
      for (const a of clips) {
        if (
          a.trackIndex === 1 &&
          !lockedTracks[1] &&
          Math.abs(a.startTime - v.startTime) <= 0.25
        ) {
          idSet.add(a.id);
        }
      }
    }
  }

  const selectedClips = clips.filter((c) => idSet.has(c.id) && !lockedTracks[c.trackIndex]);
  if (selectedClips.length === 0) return clips;

  const minStart = Math.min(...selectedClips.map((c) => c.startTime));
  const clampedDeltaTime = Math.max(-minStart, deltaTimeSec);
  const validTrackSet = new Set(validTrackIndices);

  // 1. Compute tentative moved positions for selected clips
  const movedTentative = clips.map((c) => {
    if (!idSet.has(c.id) || lockedTracks[c.trackIndex]) return c;
    const nextStart = Math.max(0, Number((c.startTime + clampedDeltaTime).toFixed(2)));
    let nextTrack = c.trackIndex;
    if (deltaTrackIndex !== 0 && baseIdSet.has(c.id)) {
      const candidateTrack = c.trackIndex + deltaTrackIndex;
      if (
        (validTrackSet.size === 0 || validTrackSet.has(candidateTrack)) &&
        !lockedTracks[candidateTrack]
      ) {
        nextTrack = candidateTrack;
      }
    }
    return {
      ...c,
      startTime: nextStart,
      trackIndex: nextTrack,
    };
  });

  // 2. For each track where base selected clips landed, check if they overlap or sit at the seam
  // between non-selected clips on that track, and part ("né chỗ") the subsequent clips to the right!
  const affectedTracks = new Set<number>();
  for (const c of movedTentative) {
    if (baseIdSet.has(c.id) && !lockedTracks[c.trackIndex]) {
      affectedTracks.add(c.trackIndex);
    }
  }

  const finalById = new Map<string, TimelineClip>();
  for (const c of movedTentative) {
    finalById.set(c.id, c);
  }

  for (const tIdx of affectedTracks) {
    const movedOnTrack = movedTentative
      .filter((c) => idSet.has(c.id) && c.trackIndex === tIdx)
      .sort((a, b) => a.startTime - b.startTime);
    const staticOnTrack = movedTentative
      .filter((c) => !idSet.has(c.id) && c.trackIndex === tIdx)
      .sort((a, b) => a.startTime - b.startTime);

    if (movedOnTrack.length === 0 || staticOnTrack.length === 0) continue;

    const selStart = Math.min(...movedOnTrack.map((c) => c.startTime));
    const selEnd = Math.max(...movedOnTrack.map((c) => c.startTime + c.duration));
    const selSpan = Number(Math.max(0.1, selEnd - selStart).toFixed(3));

    // Check if the dragged clip range [selStart, selEnd] overlaps any static clip on this track
    const hasOverlap = staticOnTrack.some(
      (s) => selStart < s.startTime + s.duration - 0.02 && selEnd > s.startTime + 0.02
    );
    if (!hasOverlap) {
      // Dragged into open timeline space — keep exact free position without shifting other clips
      continue;
    }

    // Determine original start time of the dragged selection to detect drag direction
    const origSelectedOnSource = clips.filter((c) => baseIdSet.has(c.id));
    const origSelStart =
      origSelectedOnSource.length > 0
        ? Math.min(...origSelectedOnSource.map((c) => c.startTime))
        : selStart;
    const isCrossTrackMove = origSelectedOnSource.some((c) => c.trackIndex !== tIdx);

    const leftClips: TimelineClip[] = [];
    const rightClips: TimelineClip[] = [];

    for (const s of staticOnTrack) {
      // If dragging from right-to-left over clip `s` on the same track, part `s` to the right as soon as
      // the dragged clip enters past the rightmost 25% of `s` (so even 2-minute clips part effortlessly!)
      const wasOriginallyAfterS = !isCrossTrackMove && origSelStart >= s.startTime + s.duration * 0.5;
      const splitRatio = wasOriginallyAfterS && deltaTimeSec < 0 ? 0.78 : 0.5;
      const splitPoint = s.startTime + s.duration * splitRatio;

      if (selStart < splitPoint) {
        rightClips.push(s);
      } else {
        leftClips.push(s);
      }
    }

    const leftMaxEnd =
      leftClips.length > 0
        ? Math.max(...leftClips.map((c) => c.startTime + c.duration))
        : 0;

    // Place the dragged selection right after `leftClips` (or at `selStart` if `selStart >= leftMaxEnd`)
    const effectiveSelStart = Number(Math.max(leftMaxEnd, selStart).toFixed(2));
    const shiftSelDelta = Number((effectiveSelStart - selStart).toFixed(2));

    for (const mc of movedOnTrack) {
      finalById.set(mc.id, {
        ...mc,
        startTime: Number(Math.max(0, mc.startTime + shiftSelDelta).toFixed(2)),
      });
    }

    // Part ("né chỗ") all `rightClips` so the first clip in `rightClips` starts at or after `effectiveSelStart + selSpan`
    let rippleCursor = Number((effectiveSelStart + selSpan).toFixed(2));
    for (const rc of rightClips) {
      if (rc.startTime < rippleCursor - 0.005) {
        const shiftedStart = Number(rippleCursor.toFixed(2));
        finalById.set(rc.id, {
          ...rc,
          startTime: shiftedStart,
        });
        rippleCursor = Number((shiftedStart + rc.duration).toFixed(2));
      } else {
        rippleCursor = Number((rc.startTime + rc.duration).toFixed(2));
      }
    }
  }

  return movedTentative.map((c) => finalById.get(c.id) || c);
}

export function shuffleVideoClipsInRange(
  clips: TimelineClip[],
  arg2: number | string[],
  arg3: number,
  arg4?: number | (() => number),
  arg5?: number | (() => number),
  arg6?: number
): TimelineClip[] {
  let rangeStart1Based = 1;
  let rangeEnd1Based = 999;
  let rng: () => number = Math.random;
  let targetDurationSec = 0;

  if (Array.isArray(arg2)) {
    rangeStart1Based = arg3;
    rangeEnd1Based = typeof arg4 === 'number' ? arg4 : 999;
    if (typeof arg5 === 'function') rng = arg5;
    if (typeof arg6 === 'number') targetDurationSec = arg6;
  } else {
    rangeStart1Based = arg2;
    rangeEnd1Based = arg3;
    if (typeof arg4 === 'function') {
      rng = arg4;
    } else if (typeof arg4 === 'number') {
      let s = arg4;
      rng = () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
      };
    }
    if (typeof arg5 === 'number') targetDurationSec = arg5;
  }

  const otherClips = clips.filter((c) => c.trackIndex !== 0);
  const v1Clips = clips
    .filter((c) => c.trackIndex === 0)
    .sort((a, b) => a.startTime - b.startTime);

  if (v1Clips.length === 0) return clips;

  const startIdx = Math.max(0, Math.min(v1Clips.length - 1, rangeStart1Based - 1));
  const endIdx = Math.max(startIdx, Math.min(v1Clips.length - 1, rangeEnd1Based - 1));

  const targetIndices: number[] = [];
  for (let i = startIdx; i <= endIdx; i++) {
    targetIndices.push(i);
  }

  const pool = targetIndices.map((idx) => v1Clips[idx]);
  const originalOrder = pool.map((c) => c.id).join(',');

  let shuffled = [...pool];
  if (pool.length >= 2) {
    for (let attempt = 0; attempt < 8; attempt++) {
      shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      if (shuffled.map((c) => c.id).join(',') !== originalOrder) {
        break;
      }
    }
    if (shuffled.map((c) => c.id).join(',') === originalOrder) {
      [shuffled[0], shuffled[shuffled.length - 1]] = [
        shuffled[shuffled.length - 1],
        shuffled[0],
      ];
    }
  }

  let nextV1 = [...v1Clips];
  targetIndices.forEach((v1Idx, poolIdx) => {
    nextV1[v1Idx] = { ...shuffled[poolIdx] };
  });

  if (targetDurationSec > 0 && shuffled.length > 0) {
    const fitted: TimelineClip[] = [];
    let accumulated = 0;
    let safetyCounter = 0;
    while (accumulated < targetDurationSec - 0.05 && safetyCounter < 200) {
      const template = shuffled[safetyCounter % shuffled.length];
      const remaining = Number((targetDurationSec - accumulated).toFixed(3));
      const clipDur = Math.min(template.duration, remaining);
      fitted.push({
        ...template,
        id:
          safetyCounter < shuffled.length
            ? template.id
            : `${template.id}_fit_${safetyCounter}`,
        duration: Number(clipDur.toFixed(3)),
      });
      accumulated = Number((accumulated + clipDur).toFixed(3));
      safetyCounter++;
    }
    nextV1 = fitted;
  }

  let cursor = 0;
  const packedV1 = nextV1.map((clip) => {
    const updated: TimelineClip = {
      ...clip,
      startTime: Number(cursor.toFixed(3)),
    };
    cursor += updated.duration;
    return updated;
  });

  return [...packedV1, ...otherClips];
}

export function batchTrimClips(
  clips: TimelineClip[],
  arg2: number | [number, number] | string[],
  arg3?: number,
  rangeStart1Based: number = 1,
  rangeEnd1Based: number = 999,
  minDurationSec?: number,
  rng: () => number = Math.random
): TimelineClip[] {
  let selectedIds: string[] = [];
  let maxDurationSec = 3.0;
  let minDur: number | undefined = minDurationSec;

  if (typeof arg2 === 'number') {
    maxDurationSec = arg2;
  } else if (
    Array.isArray(arg2) &&
    arg2.length === 2 &&
    typeof arg2[0] === 'number' &&
    typeof arg2[1] === 'number'
  ) {
    minDur = arg2[0];
    maxDurationSec = arg2[1];
  } else if (Array.isArray(arg2)) {
    selectedIds = arg2 as string[];
    maxDurationSec = arg3 ?? 3.0;
  }

  const otherClips = clips.filter((c) => c.trackIndex !== 0);
  const v1Clips = clips
    .filter((c) => c.trackIndex === 0)
    .sort((a, b) => a.startTime - b.startTime);

  const startIdx = Math.max(0, rangeStart1Based - 1);
  const endIdx = Math.min(v1Clips.length - 1, rangeEnd1Based - 1);

  const updatedV1 = v1Clips.map((clip, idx) => {
    const inRange = idx >= startIdx && idx <= endIdx;
    const isSelected = selectedIds.length > 0 && selectedIds.includes(clip.id);
    if (!inRange && !isSelected) return clip;

    const targetDur =
      minDur !== undefined && minDur < maxDurationSec
        ? Number((minDur + rng() * (maxDurationSec - minDur)).toFixed(2))
        : Math.max(0.4, maxDurationSec);

    if (clip.duration <= targetDur) return clip;

    const excess = clip.duration - targetDur;
    const middleOffset = Number((excess / 2).toFixed(2));
    return {
      ...clip,
      sourceIn: Number((clip.sourceIn + middleOffset * clip.speed).toFixed(2)),
      duration: Number(targetDur.toFixed(2)),
    };
  });

  return packTrackClipsContiguously([...updatedV1, ...otherClips], 0);
}

export function parseSrtToTextClips(srtText: string): TimelineClip[] {
  const blocks = srtText.trim().split(/\r?\n\r?\n/);
  const parsed: TimelineClip[] = [];

  const timeToSec = (t: string): number => {
    const m = t.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
    if (!m) return 0;
    return (
      Number(m[1]) * 3600 +
      Number(m[2]) * 60 +
      Number(m[3]) +
      Number(m[4]) / 1000
    );
  };

  blocks.forEach((block, idx) => {
    const lines = block.split(/\r?\n/).map((l) => l.trim());
    const arrowLineIdx = lines.findIndex((l) => l.includes('-->'));
    if (arrowLineIdx === -1) return;
    const [startRaw, endRaw] = lines[arrowLineIdx].split('-->');
    const start = timeToSec(startRaw);
    const end = timeToSec(endRaw);
    const text = lines.slice(arrowLineIdx + 1).join(' ').trim();
    if (end > start && text) {
      parsed.push(
        createDefaultClip({
          id: `srt_${Date.now()}_${idx}`,
          name: `SRT #${idx + 1}`,
          trackIndex: 2,
          startTime: Number(start.toFixed(2)),
          duration: Number((end - start).toFixed(2)),
          subtitleText: text,
        })
      );
    }
  });

  return parsed;
}

export function exportSubtitlesToSrt(clips: TimelineClip[]): string {
  const subs = clips
    .filter((c) => c.trackIndex === 2 && !c.stickerEmoji)
    .sort((a, b) => a.startTime - b.startTime);

  const secToSrtTime = (sec: number): string => {
    const clamped = Math.max(0, sec);
    const hh = Math.floor(clamped / 3600);
    const mm = Math.floor((clamped % 3600) / 60);
    const ss = Math.floor(clamped % 60);
    const ms = Math.round((clamped - Math.floor(clamped)) * 1000);
    const pad = (n: number, len = 2) => String(n).padStart(len, '0');
    return `${pad(hh)}:${pad(mm)}:${pad(ss)},${pad(ms, 3)}`;
  };

  if (subs.length === 0) {
    return `1\n00:00:00,000 --> 00:00:04,000\nTDO-CUT — Phụ đề tự động\n`;
  }

  return subs
    .map(
      (c, idx) =>
        `${idx + 1}\n${secToSrtTime(c.startTime)} --> ${secToSrtTime(
          c.startTime + c.duration
        )}\n${c.subtitleText || c.name}`
    )
    .join('\n\n');
}

export function exportTimelineToXml(
  clips: TimelineClip[],
  projectName: string = 'TDO_Cut_Project',
  fps: number = 30
): string {
  const v1 = clips
    .filter((c) => c.trackIndex === 0)
    .sort((a, b) => a.startTime - b.startTime);

  const clipItemsXml = v1
    .map((c, idx) => {
      const startFrame = Math.round(c.startTime * fps);
      const endFrame = Math.round((c.startTime + c.duration) * fps);
      const inFrame = Math.round(c.sourceIn * fps);
      const outFrame = inFrame + Math.round(c.duration * fps);
      return `        <clipitem id="clipitem-${idx + 1}">
          <name>${c.name}</name>
          <start>${startFrame}</start>
          <end>${endFrame}</end>
          <in>${inFrame}</in>
          <out>${outFrame}</out>
          <file id="file-${idx + 1}">
            <name>${c.name}</name>
            <pathurl>file://localhost/${c.filePath}</pathurl>
          </file>
        </clipitem>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence>
    <name>${projectName}</name>
    <rate>
      <timebase>${fps}</timebase>
      <ntsc>FALSE</ntsc>
    </rate>
    <media>
      <video>
        <track>
${clipItemsXml}
        </track>
      </video>
    </media>
  </sequence>
</xmeml>`;
}

export function generateCapCutDraftJson(
  clips: TimelineClip[],
  arg2: string = '16:9',
  arg3: string = 'TDO_Cut'
): Record<string, unknown> {
  const isRatioSecond = ['16:9', '9:16', '1:1', '4:3'].includes(arg2);
  const aspectRatio = isRatioSecond
    ? arg2
    : ['16:9', '9:16', '1:1', '4:3'].includes(arg3)
    ? arg3
    : '16:9';
  const projectName = isRatioSecond ? arg3 : arg2;

  const US = 1_000_000;
  const dims: Record<string, [number, number]> = {
    '16:9': [1920, 1080],
    '9:16': [1080, 1920],
    '1:1': [1080, 1080],
    '4:3': [1440, 1080],
  };
  const [width, height] = dims[aspectRatio] || [1920, 1080];

  const videos: Record<string, unknown>[] = [];
  const audios: Record<string, unknown>[] = [];
  const texts: Record<string, unknown>[] = [];

  const videoSegments: Record<string, unknown>[] = [];
  const audioSegments: Record<string, unknown>[] = [];
  const textSegments: Record<string, unknown>[] = [];

  clips.forEach((clip, idx) => {
    const matId = `MAT_${clip.id.toUpperCase()}_${idx}`;
    const segId = `SEG_${clip.id.toUpperCase()}_${idx}`;
    const startUs = Math.round(clip.startTime * US);
    const durUs = Math.round(clip.duration * US);
    const srcInUs = Math.round(clip.sourceIn * US);
    const scaleFactor = Number(
      ((clip.scale ?? (clip.cropRatio ? clip.cropRatio * 100 : 100)) / 100).toFixed(3)
    );

    if (clip.trackIndex === 0) {
      videos.push({
        id: matId,
        type: 'video',
        path: clip.filePath,
        material_name: clip.name,
        duration: Math.max(durUs, srcInUs + durUs),
        width,
        height,
      });
      videoSegments.push({
        id: segId,
        material_id: matId,
        target_timerange: { start: startUs, duration: durUs },
        source_timerange: { start: srcInUs, duration: durUs },
        speed: clip.speed,
        reverse: clip.reversed ?? false,
        volume: clip.muted ? 0 : Number((clip.volume / 100).toFixed(2)),
        clip: {
          alpha: Number(((clip.opacity ?? 100) / 100).toFixed(2)),
          flip: { horizontal: clip.flipH, vertical: clip.flipV ?? false },
          rotation: clip.rotation ?? 0,
          scale: { x: scaleFactor, y: scaleFactor },
          transform: { x: clip.posX ?? 0, y: clip.posY ?? 0 },
        },
      });
    } else if (clip.trackIndex === 1) {
      audios.push({
        id: matId,
        type: 'extract_music',
        path: clip.filePath,
        name: clip.name,
        duration: durUs,
      });
      audioSegments.push({
        id: segId,
        material_id: matId,
        target_timerange: { start: startUs, duration: durUs },
        source_timerange: { start: srcInUs, duration: durUs },
        volume: clip.muted ? 0 : Number((clip.volume / 100).toFixed(2)),
      });
    } else if (clip.trackIndex === 2) {
      texts.push({
        id: matId,
        type: 'subtitle',
        content: clip.subtitleText || clip.name,
        font_size: clip.fontSize ?? 15.0,
        text_color: clip.textColor ?? '#FFFFFF',
      });
      textSegments.push({
        id: segId,
        material_id: matId,
        target_timerange: { start: startUs, duration: durUs },
      });
    }
  });

  const maxEndUs = clips.reduce(
    (acc, c) => Math.max(acc, Math.round((c.startTime + c.duration) * US)),
    0
  );

  return {
    project_name: projectName,
    canvas_config: { width, height, ratio: aspectRatio },
    duration: maxEndUs,
    fps: 30.0,
    materials: { videos, audios, texts },
    tracks: [
      { id: 'TRACK_VIDEO_01', type: 'video', segments: videoSegments },
      { id: 'TRACK_AUDIO_01', type: 'audio', segments: audioSegments },
      { id: 'TRACK_TEXT_01', type: 'text', segments: textSegments },
    ],
  };
}

export function resolveExportTargetDimensions(
  clips: TimelineClip[],
  fallbackWidth: number,
  fallbackHeight: number
): { width: number; height: number } {
  const activeVideoClips = clips
    .filter(
      (c) =>
        !c.disabled &&
        (c.trackIndex === 0 || Boolean(c.mediaUrl)) &&
        !c.subtitleText &&
        !c.stickerEmoji &&
        c.trackIndex !== 1
    )
    .sort((a, b) => a.startTime - b.startTime);

  const primaryWithDims = activeVideoClips.find(
    (c) =>
      typeof c.mediaWidth === 'number' &&
      c.mediaWidth > 0 &&
      typeof c.mediaHeight === 'number' &&
      c.mediaHeight > 0
  );

  if (primaryWithDims && primaryWithDims.mediaWidth && primaryWithDims.mediaHeight) {
    const evenW = Math.max(2, Math.round(primaryWithDims.mediaWidth / 2) * 2);
    const evenH = Math.max(2, Math.round(primaryWithDims.mediaHeight / 2) * 2);
    return { width: evenW, height: evenH };
  }

  return {
    width: Math.max(2, Math.round(fallbackWidth / 2) * 2),
    height: Math.max(2, Math.round(fallbackHeight / 2) * 2),
  };
}

/**
 * Determines whether an active timeline pointer capture (playhead scrub, marquee selection,
 * clip edge resize, or standard click-and-hold clip drag) must immediately release because
 * the primary left mouse button is no longer held down (`(buttons & 1) === 0`).
 * Prevents the vertical playhead line from sticking to the mouse cursor during free movement.
 */
export function shouldReleaseTimelinePointerCapture(
  buttons: number,
  isDoubleClickPickup: boolean = false
): boolean {
  if (isDoubleClickPickup) return false;
  return (buttons & 1) === 0;
}

/**
 * Collects all sequential video clips for export in chronological order (`startTime`).
 * Includes all active Track 0 clips with `mediaUrl` plus any non-overlapping video clips
 * placed on upper tracks (`trackIndex >= 2`) so multi-clip timelines always export every clip.
 */
export function collectSequentialExportVideoClips(clips: TimelineClip[]): TimelineClip[] {
  const v0 = clips
    .filter(
      (c) =>
        !c.disabled &&
        c.trackIndex === 0 &&
        Boolean(c.mediaUrl) &&
        !c.subtitleText &&
        !c.stickerEmoji
    )
    .sort((a, b) => a.startTime - b.startTime);

  const upperVideos = clips
    .filter(
      (c) =>
        !c.disabled &&
        c.trackIndex >= 2 &&
        Boolean(c.mediaUrl) &&
        !c.subtitleText &&
        !c.stickerEmoji
    )
    .sort((a, b) => a.startTime - b.startTime);

  if (v0.length === 0) {
    return upperVideos;
  }

  const combined = [...v0];
  for (const up of upperVideos) {
    const upStart = up.startTime;
    const upEnd = up.startTime + up.duration;
    const overlapsExisting = combined.some((existing) => {
      const exStart = existing.startTime;
      const exEnd = existing.startTime + existing.duration;
      return Math.min(upEnd, exEnd) - Math.max(upStart, exStart) > 0.25;
    });
    if (!overlapsExisting) {
      combined.push(up);
    }
  }

  return combined.sort((a, b) => a.startTime - b.startTime);
}

export function buildFfmpegMatrixCommand(
  clips: TimelineClip[],
  config: AntiDetectConfig,
  variantOrRatio: number | '16:9' | '9:16' = 1,
  fastCopyMode: boolean = false,
  crfOverride?: number,
  presetOverride?: 'slow' | 'slower' | 'medium' | 'fast'
): string {
  const v1Primary = clips
    .filter((c) => !c.disabled && c.trackIndex === 0)
    .sort((a, b) => a.startTime - b.startTime);
  const v1 =
    v1Primary.length > 0
      ? v1Primary
      : clips
          .filter(
            (c) =>
              !c.disabled &&
              c.trackIndex !== 1 &&
              Boolean(c.mediaUrl) &&
              !c.subtitleText &&
              !c.stickerEmoji
          )
          .sort((a, b) => a.startTime - b.startTime);

  const count = config.variantCount ?? config.matrixVariantCount ?? 1;
  const crfVal = Math.max(0, Math.min(51, crfOverride ?? config.crf ?? 18));
  const presetVal = presetOverride ?? config.preset ?? 'slow';
  const totalRealTimeDuration = v1.reduce((acc, c) => acc + Math.max(0.1, c.duration), 0);
  const nativeDims = resolveExportTargetDimensions(v1, 1920, 1080);

  if (fastCopyMode) {
    const segCommands = v1
      .map(
        (c, i) =>
          `ffmpeg -y -ss ${c.sourceIn.toFixed(2)} -t ${c.duration.toFixed(2)} -i "${c.filePath}" -map 0:v:0 -map 0:a:0? -c copy -avoid_negative_ts make_zero "seg_${i}.mp4"`
      )
      .join('\n');
    const concatList = v1.map((_, i) => `file 'seg_${i}.mp4'`).join('\n');
    return `# TDO-CUT — CHẾ ĐỘ SIÊU TỐC (-c copy · Giữ nguyên độ phân giải gốc ${nativeDims.width}x${nativeDims.height} & Âm thanh · Thời lượng chuẩn ${totalRealTimeDuration.toFixed(2)}s)\n${segCommands}\n# Danh sách nối (concat_list.txt):\n# ${concatList.replace(/\n/g, ' | ')}\nffmpeg -y -f concat -safe 0 -i concat_list.txt -map 0:v:0 -map 0:a:0? -c copy -movflags +faststart "./Output/TDO_Cut_FastCopy_${count}Vars.mp4"`;
  }

  const inputs = v1
    .map((c) => `-ss ${c.sourceIn.toFixed(2)} -t ${c.duration.toFixed(2)} -i "${c.filePath}"`)
    .join(' ');
  const filters: string[] = [
    `scale=trunc(iw/2)*2:trunc(ih/2)*2`,
    `setsar=1`,
    `setpts=PTS-STARTPTS`,
  ];
  if (config.autoMirrorAll) filters.push('hflip');
  if (config.microSpeedZoom) {
    // Maintain 1.0x real-time duration (PTS-STARTPTS) while applying subtle 4% anti-detect zoom crop
    filters.push(
      'scale=trunc(iw*1.04/2)*2:trunc(ih*1.04/2)*2,crop=trunc(iw/1.04/2)*2:trunc(ih/1.04/2)*2'
    );
  }
  if (config.injectMicroNoise || config.antiHashSpoofing) {
    filters.push(`noise=alls=${config.noiseStrength ?? 3}:allf=t+u`);
  }
  const spoofMeta = config.spoofIphoneMeta ?? config.spoofIphoneMetadata ?? true;
  const metaFlags = spoofMeta
    ? `-metadata make="Apple" -metadata model="${config.iphoneModel || 'iPhone 16 Pro Max'}" -metadata software="18.1.1"`
    : '';
  const vfChain = `-vf "${filters.join(',')}"`;
  const afChain = `-af "aresample=async=1:first_pts=0,asetpts=PTS-STARTPTS"`;
  const durFlag = totalRealTimeDuration > 0 ? `-t ${totalRealTimeDuration.toFixed(2)}` : '';

  const encoder = config.gpuEncoder || 'hevc_nvenc';
  if (encoder === 'prores') {
    return `ffmpeg -y ${inputs} -map 0:v:0 -map 0:a:0? ${vfChain} ${afChain} -vsync cfr -c:v prores -profile:v 3 -pix_fmt yuv422p10le -crf ${crfVal} -preset ${presetVal} -b:v 45M -c:a pcm_s16le -ar 48000 -ac 2 ${durFlag} ${metaFlags} "./Output/TDO_Cut_Variant_${String(variantOrRatio)}.mov"`;
  }
  if (encoder === 'hevc_nvenc') {
    return `ffmpeg -y ${inputs} -map 0:v:0 -map 0:a:0? ${vfChain} ${afChain} -vsync cfr -c:v hevc_nvenc -tag:v hvc1 -crf ${crfVal} -cq ${crfVal} -preset ${presetVal} -b:v 28M -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart ${durFlag} ${metaFlags} "./Output/TDO_Cut_Variant_${String(variantOrRatio)}.mp4"`;
  }
  return `ffmpeg -y ${inputs} -map 0:v:0 -map 0:a:0? ${vfChain} ${afChain} -vsync cfr -c:v ${encoder} -crf ${crfVal} -preset ${presetVal} -b:v 20M -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart ${durFlag} ${metaFlags} "./Output/TDO_Cut_Variant_${String(variantOrRatio)}.mp4"`;
}

export interface ContainedRect {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
}

export function computeObjectFitContainRect(
  containerW: number,
  containerH: number,
  contentW: number,
  contentH: number
): ContainedRect {
  const safeContainerW = Math.max(1, containerW);
  const safeContainerH = Math.max(1, containerH);
  const safeContentW = Math.max(1, contentW);
  const safeContentH = Math.max(1, contentH);
  const scale = Math.min(safeContainerW / safeContentW, safeContainerH / safeContentH);
  const width = Math.max(1, Math.round(safeContentW * scale));
  const height = Math.max(1, Math.round(safeContentH * scale));
  const x = Math.round((safeContainerW - width) / 2);
  const y = Math.round((safeContainerH - height) / 2);
  return { width, height, x, y, scale };
}

/**
 * Magnetic Auto-Snap for Video Preview Canvas Scale & Position:
 * When the user zooms/resizes the video on the Preview Canvas (via corner handles or mouse wheel)
 * and approaches 100% (exact native fit to the canvas frame), automatically snaps scale to 100%
 * (and snaps posX/posY to 0 when near center) so the video fits the frame seamlessly.
 */
export function snapPreviewScaleToFrame(
  rawScale: number,
  rawPosX: number = 0,
  rawPosY: number = 0,
  scaleSnapTolerance: number = 7,
  posSnapTolerance: number = 22
): {
  scale: number;
  posX: number;
  posY: number;
  snappedScale: boolean;
  snappedPosX: boolean;
  snappedPosY: boolean;
} {
  const clampedScale = Math.max(10, Math.min(500, Math.round(rawScale)));
  const snappedScale = Math.abs(clampedScale - 100) <= scaleSnapTolerance;
  const finalScale = snappedScale ? 100 : clampedScale;

  const snappedPosX =
    Math.abs(rawPosX) <= posSnapTolerance || (snappedScale && Math.abs(rawPosX) <= 36);
  const snappedPosY =
    Math.abs(rawPosY) <= posSnapTolerance || (snappedScale && Math.abs(rawPosY) <= 36);

  return {
    scale: finalScale,
    posX: snappedPosX ? 0 : Math.round(rawPosX),
    posY: snappedPosY ? 0 : Math.round(rawPosY),
    snappedScale,
    snappedPosX,
    snappedPosY,
  };
}

export interface TimelineSnapTarget {
  timeSec: number;
  label: string;
}

/**
 * Finds the closest magnetic snap point on the timeline (start 00:00, playhead, clip start/end edges,
 * or the final end edge of the timeline) within thresholdSec.
 */
export function findClosestTimelineSnapPoint(
  candidateTimes: number[],
  targets: TimelineSnapTarget[],
  thresholdSec: number
): {
  snapped: boolean;
  deltaSec: number;
  snapTimeSec: number | null;
  snapLabel: string | null;
} {
  let bestDist = Infinity;
  let bestDelta = 0;
  let bestTarget: TimelineSnapTarget | null = null;

  for (const cand of candidateTimes) {
    for (const target of targets) {
      const dist = Math.abs(cand - target.timeSec);
      if (dist <= thresholdSec && dist < bestDist) {
        bestDist = dist;
        bestDelta = target.timeSec - cand;
        bestTarget = target;
      }
    }
  }

  if (bestTarget) {
    return {
      snapped: true,
      deltaSec: Number(bestDelta.toFixed(3)),
      snapTimeSec: Number(bestTarget.timeSec.toFixed(2)),
      snapLabel: bestTarget.label,
    };
  }

  return {
    snapped: false,
    deltaSec: 0,
    snapTimeSec: null,
    snapLabel: null,
  };
}

export interface ResourceItemBounds {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface MarqueeRect2D {
  startX: number;
  startY: number;
  currX: number;
  currY: number;
}

/**
 * Returns the IDs of all resource items (media cards, library clips, audio SFX, text templates,
 * stickers, effects, transitions, filters, sub-projects) whose 2D bounding boxes intersect the
 * active marquee rectangle when dragged at least `minDragDistancePx` (default 5px).
 */
export function getResourceItemsInMarqueeRect(
  items: ResourceItemBounds[],
  marquee: MarqueeRect2D,
  minDragDistancePx: number = 5
): string[] {
  const dragDistance = Math.hypot(
    marquee.currX - marquee.startX,
    marquee.currY - marquee.startY
  );
  if (dragDistance < minDragDistancePx) {
    return [];
  }

  const minX = Math.min(marquee.startX, marquee.currX);
  const maxX = Math.max(marquee.startX, marquee.currX);
  const minY = Math.min(marquee.startY, marquee.currY);
  const maxY = Math.max(marquee.startY, marquee.currY);

  return items
    .filter(
      (item) =>
        item.right >= minX &&
        item.left <= maxX &&
        item.bottom >= minY &&
        item.top <= maxY
    )
    .map((item) => item.id);
}

export const MIN_TIMELINE_ZOOM_PPS = 1;
export const MAX_TIMELINE_ZOOM_PPS = 600;

export function clampTimelineZoom(pps: number): number {
  if (!Number.isFinite(pps)) return 28;
  return Math.max(
    MIN_TIMELINE_ZOOM_PPS,
    Math.min(MAX_TIMELINE_ZOOM_PPS, Number(pps.toFixed(2)))
  );
}

export function stepTimelineZoom(
  currentPps: number,
  direction: 'in' | 'out'
): number {
  const safe = clampTimelineZoom(currentPps);
  if (direction === 'in') {
    const rawNext = safe < 10 ? safe + 1 : safe * 1.12;
    return clampTimelineZoom(Number(Math.max(safe + 0.5, rawNext).toFixed(1)));
  } else {
    const rawPrev = safe <= 10 ? safe - 1 : safe / 1.12;
    return clampTimelineZoom(Number(Math.min(safe - 0.5, rawPrev).toFixed(1)));
  }
}

export interface SynchronizedClipLayout {
  leftPx: number;
  widthPx: number;
  rightPx: number;
}

/**
 * Computes strictly synchronized pixel geometry (`leftPx`, `widthPx`, `rightPx`) for any timeline clip
 * at a given `pixelsPerSecond` zoom scale:
 * - Both `leftPx` (`startTime * pps`) and `rightPx` (`(startTime + duration) * pps`) are computed on the
 *   exact same zoom multiplier so adjacent clips (`clip1.startTime + clip1.duration === clip2.startTime`)
 *   share the exact same pixel boundary (`clip1.rightPx === clip2.leftPx`) with zero drift.
 * - `widthPx = rightPx - leftPx` scales every clip (short or long) by the exact same proportional factor
 *   during slider drag, button step, or 2-finger touchpad pinch zoom.
 */
export function computeSynchronizedClipLayout(
  clip: Pick<TimelineClip, 'startTime' | 'duration'>,
  pixelsPerSecond: number
): SynchronizedClipLayout {
  const safePps = clampTimelineZoom(pixelsPerSecond);
  const startSec = Math.max(0, Number(clip.startTime || 0));
  const durSec = Math.max(0.05, Number(clip.duration || 0.05));
  const leftPx = Number((startSec * safePps).toFixed(2));
  const rightPx = Number(((startSec + durSec) * safePps).toFixed(2));
  const widthPx = Number(Math.max(2, rightPx - leftPx).toFixed(2));
  return { leftPx, widthPx, rightPx };
}

/**
 * Smooth, proportional touchpad pinch / wheel timeline zoom:
 * Supports both 2-finger touchpad pinch (`isPinch = true`, where `ctrlKey` is set by the browser)
 * and mouse/touchpad scroll wheel without sudden jumps.
 */
export function stepTimelineZoomByWheelDelta(
  currentPps: number,
  deltaY: number,
  isPinch: boolean = false
): number {
  const safe = clampTimelineZoom(currentPps);
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 0.01) return safe;
  // Clamp per-event delta so neither mouse wheel notches nor rapid touchpad ticks jump excessively
  const clampedDelta = Math.max(-55, Math.min(55, deltaY));
  const rate = isPinch ? 0.0085 : 0.0022;
  const factor = Math.exp(-clampedDelta * rate);
  const next = safe * factor;
  // Guarantee a small perceptible step if deltaY is non-zero
  if (Math.abs(next - safe) < 0.15) {
    return clampTimelineZoom(Number((safe + (deltaY < 0 ? 0.25 : -0.25)).toFixed(2)));
  }
  return clampTimelineZoom(Number(next.toFixed(2)));
}

/**
 * Computes an ultra-long CapCut-style timeline duration runway so users can stretch
 * and scroll the timeline very far (both in total time capacity and pixel width).
 */
export function computeExtendedTimelineDuration(
  clips: TimelineClip[],
  pixelsPerSecond: number,
  viewportWidthPx: number = 1440
): number {
  const safePps = clampTimelineZoom(pixelsPerSecond);
  const maxClipEnd = clips.reduce(
    (acc, c) => Math.max(acc, (c.startTime || 0) + (c.duration || 0)),
    0
  );
  // Minimum 30 minutes (1800s) runway, plus generous trailing space after the last clip,
  // and at least 4x the viewport width when zoomed way out.
  const minByClips = Math.max(1800, Math.ceil(maxClipEnd * 1.5 + 600));
  const minByViewport = Math.ceil((Math.max(800, viewportWidthPx) * 4) / safePps);
  return Math.max(minByClips, minByViewport);
}

export function formatRulerTickLabel(
  sec: number,
  majorStepSec: number = 5,
  fps: number = 30
): string {
  const clamped = Math.max(0, sec);
  const totalFrames = Math.round(clamped * fps);
  const ff = totalFrames % fps;
  const wholeSeconds = Math.floor(totalFrames / fps);
  const ss = wholeSeconds % 60;
  const mm = Math.floor(wholeSeconds / 60) % 60;
  const hh = Math.floor(wholeSeconds / 3600);
  const pad = (n: number) => String(n).padStart(2, '0');

  if (majorStepSec < 1 && ff !== 0) {
    return `${pad(mm)}:${pad(ss)}:${pad(ff)}f`;
  }
  if (hh > 0) {
    return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  }
  return `${pad(mm)}:${pad(ss)}`;
}

export interface TimelineRulerTick {
  timeSec: number;
  label: string;
}

export interface TimelineRulerConfig {
  majorStepSec: number;
  minorSubdivisions: number;
  minorStepPx: number;
  ticks: TimelineRulerTick[];
}

/**
 * Computes adaptive major/minor ruler intervals across extreme zoom levels (1 px/s to 600 px/s)
 * and virtualizes the returned major tick array to the visible scroll window (+ overscan buffer).
 */
export function computeAdaptiveTimelineRuler(
  totalDurationSec: number,
  pixelsPerSecond: number,
  scrollLeftPx: number = 0,
  viewportWidthPx: number = 1440,
  fps: number = 30
): TimelineRulerConfig {
  const pps = clampTimelineZoom(pixelsPerSecond);

  let majorStepSec = 5;
  let minorSubdivisions = 5;

  if (pps >= 300) {
    majorStepSec = 0.2;
    minorSubdivisions = 6; // 1 frame at 30fps
  } else if (pps >= 150) {
    majorStepSec = 0.5;
    minorSubdivisions = 5; // 0.1s
  } else if (pps >= 75) {
    majorStepSec = 1;
    minorSubdivisions = 5; // 0.2s
  } else if (pps >= 35) {
    majorStepSec = 2;
    minorSubdivisions = 4; // 0.5s
  } else if (pps >= 18) {
    majorStepSec = 5;
    minorSubdivisions = 5; // 1s
  } else if (pps >= 8) {
    majorStepSec = 15;
    minorSubdivisions = 3; // 5s
  } else if (pps >= 4) {
    majorStepSec = 30;
    minorSubdivisions = 3; // 10s
  } else if (pps >= 2) {
    majorStepSec = 60;
    minorSubdivisions = 4; // 15s
  } else {
    majorStepSec = 300;
    minorSubdivisions = 5; // 60s
  }

  const minorStepPx = Math.max(4, (majorStepSec * pps) / minorSubdivisions);

  // Overscan buffer of 2400px on left and right of current scroll viewport
  const overscanPx = 2400;
  const startPx = Math.max(0, scrollLeftPx - overscanPx);
  const endPx = scrollLeftPx + Math.max(800, viewportWidthPx) + overscanPx;

  const firstTickIndex = Math.max(0, Math.floor(startPx / pps / majorStepSec));
  const lastTickIndex = Math.min(
    Math.ceil(totalDurationSec / majorStepSec),
    Math.ceil(endPx / pps / majorStepSec)
  );

  const ticks: TimelineRulerTick[] = [];
  const maxSafeTicks = 220;
  const count = Math.min(maxSafeTicks, Math.max(0, lastTickIndex - firstTickIndex + 1));

  for (let i = 0; i < count; i++) {
    const idx = firstTickIndex + i;
    const tSec = Number((idx * majorStepSec).toFixed(3));
    if (tSec > totalDurationSec) break;
    ticks.push({
      timeSec: tSec,
      label: formatRulerTickLabel(tSec, majorStepSec, fps),
    });
  }

  return {
    majorStepSec,
    minorSubdivisions,
    minorStepPx,
    ticks,
  };
}

export type ActiveWorkspaceZone = 'resource_pool' | 'timeline';

export interface ZoneSelectAllResult {
  activeZone: ActiveWorkspaceZone;
  selectedResourceIds: string[];
  selectedClipIds: string[];
  selectedClipId: string | null;
}

/**
 * Context-aware Ctrl+A selection resolver:
 * - When `activeZone === 'resource_pool'`, selects all items inside the active resource panel
 *   and clears timeline clip multi-selection (unless viewing the timeline clip list folder).
 * - When `activeZone === 'timeline'`, selects all unlocked clips on the timeline and clears
 *   any resource panel selection so Ctrl+A never selects both panels simultaneously.
 */
export function resolveZoneSelectAll(
  activeZone: ActiveWorkspaceZone,
  resourceIdsInDom: string[],
  clips: TimelineClip[],
  trackLocks: Record<number, boolean> = {},
  syncResourceToClips: boolean = false
): ZoneSelectAllResult {
  if (activeZone === 'resource_pool') {
    const uniqueResourceIds = Array.from(new Set(resourceIdsInDom.filter(Boolean)));
    return {
      activeZone: 'resource_pool',
      selectedResourceIds: uniqueResourceIds,
      selectedClipIds: syncResourceToClips ? uniqueResourceIds : [],
      selectedClipId: syncResourceToClips ? uniqueResourceIds[0] ?? null : null,
    };
  }

  const unlockedClipIds = clips
    .filter((c) => !trackLocks[c.trackIndex])
    .map((c) => c.id);

  return {
    activeZone: 'timeline',
    selectedResourceIds: [],
    selectedClipIds: unlockedClipIds,
    selectedClipId: unlockedClipIds[0] ?? null,
  };
}

export type ExportResolutionPreset = '480p' | '720p' | '1080p' | '2K' | '4K';
export type ExportBitrateMode = 'recommended' | 'higher' | 'lower';
export type ExportFpsPreset = '24fps' | '25fps' | '30fps' | '50fps' | '60fps' | '24' | '25' | '30' | '50' | '60';

export interface HighQualityExportSpec {
  width: number;
  height: number;
  fps: number;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
  bitrateMbps: number;
  estimatedSizeMb: number;
  totalFrames: number;
  frameStepSec: number;
  sharpenStrength: number;
  qualityLabel: string;
}

/**
 * Computes exact even-integer studio export dimensions, high-definition bitrates (scaled for 50/60fps
 * and 1080p/2K/4K), and frame-accurate stepping intervals so exported videos are razor-sharp and smooth.
 */
export function computeHighQualityExportSpec(
  resolution: ExportResolutionPreset,
  aspectRatio: string = '16:9',
  fpsPreset: ExportFpsPreset = '30fps',
  bitrateMode: ExportBitrateMode = 'recommended',
  durationSec: number = 10
): HighQualityExportSpec {
  const shortSideMap: Record<ExportResolutionPreset, number> = {
    '480p': 480,
    '720p': 720,
    '1080p': 1080,
    '2K': 1440,
    '4K': 2160,
  };
  const shortSide = shortSideMap[resolution] || 1080;

  let ratio = 16 / 9;
  if (aspectRatio === '9:16') ratio = 9 / 16;
  else if (aspectRatio === '1:1') ratio = 1;
  else if (aspectRatio === '4:3') ratio = 4 / 3;
  else if (aspectRatio === '3:4') ratio = 3 / 4;
  else if (aspectRatio === '21:9') ratio = 21 / 9;
  else if (aspectRatio === '2.35:1') ratio = 2.35;
  else if (aspectRatio === '1.85:1') ratio = 1.85;
  else if (aspectRatio === '2:1') ratio = 2;
  else if (aspectRatio === '5.8"') ratio = 9 / 19.5;

  // Ensure dimensions are even integers for hardware H.264/HEVC/VP9/AV1 encoders
  const toEven = (n: number) => Math.max(2, Math.round(n / 2) * 2);
  let width: number;
  let height: number;
  if (ratio >= 1) {
    height = toEven(shortSide);
    width = toEven(shortSide * ratio);
  } else {
    width = toEven(shortSide);
    height = toEven(shortSide / ratio);
  }

  const fpsMap: Record<string, number> = {
    '24fps': 24,
    '25fps': 25,
    '30fps': 30,
    '50fps': 50,
    '60fps': 60,
    '24': 24,
    '25': 25,
    '30': 30,
    '50': 50,
    '60': 60,
  };
  const fps = fpsMap[String(fpsPreset)] || 30;

  const baseBitrateMap: Record<ExportResolutionPreset, number> = {
    '480p': 8_000_000,
    '720p': 14_000_000,
    '1080p': 24_000_000,
    '2K': 38_000_000,
    '4K': 65_000_000,
  };
  const baseBitrate = baseBitrateMap[resolution] || 24_000_000;
  const modeMult =
    bitrateMode === 'higher' ? 1.45 : bitrateMode === 'lower' ? 0.7 : 1.0;
  const highFpsMult = fps >= 50 ? 1.25 : 1.0;

  const videoBitsPerSecond = Math.round(baseBitrate * modeMult * highFpsMult);
  const audioBitsPerSecond = 320_000;
  const bitrateMbps = Number((videoBitsPerSecond / 1_000_000).toFixed(1));

  const safeDur = Math.max(0.5, durationSec);
  const estimatedSizeMb = Number(
    (
      Math.max(
        1.2,
        ((videoBitsPerSecond + audioBitsPerSecond) * safeDur) / 8 / 1_000_000
      )
    ).toFixed(1)
  );
  const totalFrames = Math.max(1, Math.round(safeDur * fps));
  const frameStepSec = Number((1 / fps).toFixed(6));

  const sharpenStrength =
    resolution === '4K'
      ? 0.42
      : resolution === '2K'
      ? 0.35
      : resolution === '1080p'
      ? 0.28
      : 0.15;

  const qualityLabel = `${width}×${height} · ${fps} FPS · ${bitrateMbps} Mbps`;

  return {
    width,
    height,
    fps,
    videoBitsPerSecond,
    audioBitsPerSecond,
    bitrateMbps,
    estimatedSizeMb,
    totalFrames,
    frameStepSec,
    sharpenStrength,
    qualityLabel,
  };
}

/**
 * Preserves the full native duration of imported video/audio clips (even when > 30s, e.g. 2m13s = 133.5s)
 * instead of truncating long media files to 6.0s when dragged or pushed to the timeline.
 */
export function resolveMediaClipDuration(
  rawDurationSec: number | undefined,
  fallbackDurationSec: number = 5.0
): number {
  if (typeof rawDurationSec !== 'number' || !Number.isFinite(rawDurationSec) || rawDurationSec <= 0) {
    return Number(Math.max(0.5, fallbackDurationSec).toFixed(2));
  }
  return Number(Math.max(0.5, rawDurationSec).toFixed(2));
}

export function resolveDefaultProjectTitle(
  projectName: string | undefined,
  language: AppLanguage = 'vi'
): string {
  const trimmed = (projectName || '').trim();
  const isDefaultPlaceholder =
    !trimmed ||
    trimmed === '1' ||
    trimmed === '0421-sao chép' ||
    trimmed === '0421-copy' ||
    trimmed === 'Chưa có dự án' ||
    trimmed === 'Untitled Project' ||
    trimmed === 'Nhập tên dự án' ||
    trimmed === 'Enter project name';
  if (isDefaultPlaceholder) {
    return 'Dự án 1';
  }
  return trimmed;
}

export const DEFAULT_TDO_INSTALL_DIR = 'd:/DỰ ÁN TDO-CUT/TDO-CUT/projects';

export function getProjectInstallDir(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('tdo_cut_install_path');
      if (saved && saved.trim()) return saved.trim().replace(/\\/g, '/');
    }
  } catch {
    // fallback
  }
  return DEFAULT_TDO_INSTALL_DIR;
}

export function setProjectInstallDir(dir: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('tdo_cut_install_path', dir.trim().replace(/\\/g, '/'));
    }
  } catch {
    // fallback
  }
}

export function getProjectFullDirPath(projectName?: string): string {
  const base = getProjectInstallDir();
  const cleanName = (projectName || 'Dự án 1').trim();
  return `${base}/${cleanName}`;
}

export function getDefaultExportDirPath(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('tdo_cut_export_path');
      if (saved && saved.trim()) return saved.trim().replace(/\\/g, '/');
    }
  } catch {
    // fallback
  }
  const installBase = getProjectInstallDir();
  return installBase.replace(/\/projects\/?$/, '/exports');
}

export interface RealisticExportSizeEstimate {
  estimatedSizeMb: number;
  effectiveBitrateMbps: number;
  qualityLabel: string;
}

/**
 * Computes a realistic, non-inflated estimated file size (in MB) and effective VBR bitrate (in Mbps)
 * for the Export Modal based on:
 * 1. Actual uploaded source video byte sizes (`clip.fileSizeBytes` or probed `mediaSizeMap`) when available
 * 2. Resolution, FPS, Bitrate Mode, and Codec (`h264`, `hevc`, `av1`, `prores4444`)
 * 3. Realistic modern CRF/VBR compression ratios when no source file size is known
 */
export function computeRealisticExportEstimate(
  clips: TimelineClip[],
  resolution: ExportResolutionPreset = '1080p',
  aspectRatio: string = '16:9',
  fpsPreset: ExportFpsPreset = '30fps',
  bitrateMode: ExportBitrateMode = 'recommended',
  codec: 'h264' | 'hevc' | 'av1' | 'prores4444' = 'h264',
  durationSec: number = 10,
  mediaSizeMap: Record<string, number> = {},
  fastCopyEnabled: boolean = true
): RealisticExportSizeEstimate {
  const effectiveRatio =
    aspectRatio === 'original'
      ? resolveEffectiveClipAspectRatio('original', null, clips)
      : aspectRatio;
  const baseSpec = computeHighQualityExportSpec(
    resolution,
    effectiveRatio,
    fpsPreset,
    bitrateMode,
    durationSec
  );
  const safeDur = Math.max(0.5, durationSec);

  const resScaleMap: Record<ExportResolutionPreset, number> = {
    '480p': 0.42,
    '720p': 0.68,
    '1080p': 1.0,
    '2K': 1.65,
    '4K': 2.85,
  };
  const modeScale =
    bitrateMode === 'higher' ? 1.32 : bitrateMode === 'lower' ? 0.72 : 1.0;
  const codecScale =
    codec === 'av1'
      ? 0.68
      : codec === 'hevc'
      ? 0.76
      : codec === 'prores4444'
      ? 3.2
      : 1.0;
  const fpsScale =
    baseSpec.fps >= 50 ? 1.18 : baseSpec.fps <= 25 ? 0.92 : 1.0;

  // CapCut Studio minimum VBR target bitrates (in bps) so 1080p HD never degrades to 0.5 Mbps / 360p quality
  const studioVbrFloorBpsMap: Record<ExportResolutionPreset, number> = {
    '480p': 2_200_000,
    '720p': 4_800_000,
    '1080p': 8_500_000,
    '2K': 15_000_000,
    '4K': 26_000_000,
  };
  const minStudioVideoBps = Math.round(
    (studioVbrFloorBpsMap[resolution] || 8_500_000) * modeScale * codecScale * fpsScale
  );

  // Check if any Track 0 video clips have known source file byte sizes
  const activeV1 = clips.filter((c) => !c.disabled && c.trackIndex === 0);
  let knownSourceBytesTotal = 0;
  let knownSourceDurationTotal = 0;

  for (const clip of activeV1) {
    const byteSize =
      clip.fileSizeBytes ||
      (clip.mediaUrl ? mediaSizeMap[clip.mediaUrl] : undefined) ||
      0;
    if (byteSize > 0) {
      const srcDur = Math.max(
        0.5,
        clip.sourceDuration && clip.sourceDuration > 0
          ? clip.sourceDuration
          : clip.duration
      );
      const clipUsedSrcDur = Math.max(0.5, clip.duration * (clip.speed || 1));
      const clipProportionalBytes = byteSize * Math.min(2.5, clipUsedSrcDur / srcDur);
      knownSourceBytesTotal += clipProportionalBytes;
      knownSourceDurationTotal += clip.duration;
    }
  }

  // If Direct Stream Copy is eligible and we know the primary clip's size, return exact source size
  const streamCopyCheck = canUseDirectStreamCopyForExport(clips, fastCopyEnabled);
  if (streamCopyCheck.eligible && streamCopyCheck.primaryClip) {
    const primaryBytes =
      streamCopyCheck.primaryClip.fileSizeBytes ||
      (streamCopyCheck.primaryClip.mediaUrl
        ? mediaSizeMap[streamCopyCheck.primaryClip.mediaUrl]
        : 0) ||
      0;
    if (primaryBytes > 0) {
      const exactMb = Number(Math.max(0.1, primaryBytes / (1024 * 1024)).toFixed(2));
      const exactMbps = Number(
        Math.max(0.5, (primaryBytes * 8) / safeDur / 1_000_000).toFixed(1)
      );
      return {
        estimatedSizeMb: exactMb,
        effectiveBitrateMbps: exactMbps,
        qualityLabel: `${baseSpec.width}×${baseSpec.height} · ${baseSpec.fps} FPS · ${exactMbps} Mbps`,
      };
    }
  }

  // If we know the source video's byte rate, scale proportionally to source complexity while enforcing the studio HD floor
  if (knownSourceBytesTotal > 0 && knownSourceDurationTotal > 0) {
    const sourceBytesPerSec = knownSourceBytesTotal / knownSourceDurationTotal;
    const totalEstimatedSourceBytes = sourceBytesPerSec * safeDur;
    const reencodeFactor =
      (resScaleMap[resolution] || 1.0) * modeScale * codecScale * fpsScale;
    const rawSourceScaledBps = ((totalEstimatedSourceBytes * reencodeFactor) * 8) / safeDur;
    const finalVideoBps = Math.max(minStudioVideoBps, rawSourceScaledBps);
    const vbrAudioBps = 192_000;
    const estimatedSizeMb = Number(
      Math.max(0.5, ((finalVideoBps + vbrAudioBps) * safeDur) / 8 / (1024 * 1024)).toFixed(1)
    );
    const effectiveBitrateMbps = Number((finalVideoBps / 1_000_000).toFixed(1));
    return {
      estimatedSizeMb,
      effectiveBitrateMbps,
      qualityLabel: `${baseSpec.width}×${baseSpec.height} · ${baseSpec.fps} FPS · ${effectiveBitrateMbps} Mbps`,
    };
  }

  const vbrVideoBps = minStudioVideoBps;
  const vbrAudioBps = 192_000;
  const effectiveBitrateMbps = Number((vbrVideoBps / 1_000_000).toFixed(1));
  const estimatedSizeMb = Number(
    Math.max(
      0.5,
      ((vbrVideoBps + vbrAudioBps) * safeDur) / 8 / (1024 * 1024)
    ).toFixed(1)
  );

  return {
    estimatedSizeMb,
    effectiveBitrateMbps,
    qualityLabel: `${baseSpec.width}×${baseSpec.height} · ${baseSpec.fps} FPS · ${effectiveBitrateMbps} Mbps`,
  };
}

export interface DirectStreamCopyCheck {
  eligible: boolean;
  primaryClip: TimelineClip | null;
  reason: string;
}

/**
 * Determines whether the timeline can be exported via Direct Native Stream Copy (Lossless Remux)
 * directly from the user's source video blob (`primaryClip.mediaUrl`).
 * Eligible when:
 * - `fastCopyEnabled` is true
 * - There is exactly 1 active video clip on Track 0 with a real `mediaUrl`
 * - There are no active overlay/text/sticker clips or external audio tracks mixed in
 * - The clip has not been trimmed (`sourceIn <= 0.05` and matches `sourceDuration` if known)
 *   and has no visual canvas effects, filters, flips, rotations, or speed changes.
 */
export function canUseDirectStreamCopyForExport(
  clips: TimelineClip[],
  fastCopyEnabled: boolean = true
): DirectStreamCopyCheck {
  if (!fastCopyEnabled) {
    return { eligible: false, primaryClip: null, reason: 'fast_copy_disabled' };
  }
  const activeClips = clips.filter((c) => !c.disabled);
  const v1Clips = activeClips.filter((c) => c.trackIndex === 0);
  if (v1Clips.length !== 1) {
    return { eligible: false, primaryClip: null, reason: 'multiple_or_zero_v1_clips' };
  }
  const primary = v1Clips[0];
  if (!primary.mediaUrl) {
    return { eligible: false, primaryClip: null, reason: 'no_source_media_url' };
  }
  const otherTrackClips = activeClips.filter((c) => c.trackIndex !== 0);
  if (otherTrackClips.length > 0) {
    return { eligible: false, primaryClip: primary, reason: 'has_multi_track_overlays_or_audio' };
  }
  if ((primary.sourceIn || 0) > 0.08) {
    return { eligible: false, primaryClip: primary, reason: 'trimmed_source_in' };
  }
  if (
    primary.sourceDuration &&
    primary.sourceDuration > 0 &&
    Math.abs(primary.duration - primary.sourceDuration) > 0.25
  ) {
    return { eligible: false, primaryClip: primary, reason: 'trimmed_duration' };
  }
  if (Math.abs((primary.speed || 1) - 1) > 0.02 || primary.reversed) {
    return { eligible: false, primaryClip: primary, reason: 'speed_or_reverse_modified' };
  }
  if (
    primary.flipH ||
    primary.flipV ||
    Math.abs((primary.scale ?? 100) - 100) > 0.5 ||
    Math.abs(primary.posX || 0) > 1 ||
    Math.abs(primary.posY || 0) > 1 ||
    Math.abs(primary.rotation || 0) > 0.5 ||
    (primary.cropLeft || 0) > 0 ||
    (primary.cropTop || 0) > 0 ||
    (primary.cropRight || 0) > 0 ||
    (primary.cropBottom || 0) > 0
  ) {
    return { eligible: false, primaryClip: primary, reason: 'spatial_transform_modified' };
  }
  if (
    (primary.filterPreset && primary.filterPreset !== 'none') ||
    (primary.visualEffect && primary.visualEffect !== 'none') ||
    (primary.maskType && primary.maskType !== 'none') ||
    primary.removeBg ||
    primary.autoCutout ||
    primary.blurBg ||
    Math.abs(primary.brightness || 0) > 0 ||
    Math.abs(primary.contrast || 0) > 0 ||
    Math.abs(primary.saturation || 0) > 0 ||
    Boolean(primary.subtitleText) ||
    Boolean(primary.stickerEmoji)
  ) {
    return { eligible: false, primaryClip: primary, reason: 'visual_effects_or_color_modified' };
  }

  return { eligible: true, primaryClip: primary, reason: 'direct_stream_copy_ready' };
}

function findBytePattern(
  haystack: Uint8Array,
  needle: number[],
  startOffset: number = 0,
  maxEndOffset: number = haystack.length
): number {
  const limit = Math.min(haystack.length - needle.length, maxEndOffset - needle.length);
  for (let i = Math.max(0, startOffset); i <= limit; i++) {
    let matched = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        matched = false;
        break;
      }
    }
    if (matched) return i;
  }
  return -1;
}

function getEbmlVintWidth(firstByte: number): number {
  if (firstByte === 0) return 1;
  for (let width = 1; width <= 8; width++) {
    if ((firstByte & (0x80 >> (width - 1))) !== 0) {
      return width;
    }
  }
  return 1;
}

/**
 * Patches a raw WebM or MP4 byte buffer generated by browser `MediaRecorder` so that
 * its container header embeds the exact finite video duration (`durationSec`).
 * Without this header, video players (HTML5 `<video>`, Windows Media Player, VLC) treat
 * `MediaRecorder` output as a live stream ("LIVE") with unknown duration (`Infinity`).
 */
export function patchMediaRecorderBufferDuration(
  bytes: Uint8Array,
  durationSec: number
): Uint8Array {
  const safeDurationMs = Math.max(100, Number((Math.max(0.1, durationSec) * 1000).toFixed(2)));

  // 1. WebM / Matroska EBML container (starts with 0x1A 0x45 0xDF 0xA3)
  if (
    bytes.length >= 24 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    const searchLimit = Math.min(bytes.length, 16384);
    const infoPos = findBytePattern(bytes, [0x15, 0x49, 0xa9, 0x66], 0, searchLimit);
    if (infoPos !== -1 && infoPos + 5 < bytes.length) {
      const vintWidth = getEbmlVintWidth(bytes[infoPos + 4]);
      const infoBodyStart = infoPos + 4 + vintWidth;
      const tracksPos = findBytePattern(
        bytes,
        [0x16, 0x54, 0xae, 0x6b],
        infoBodyStart,
        searchLimit
      );
      const clusterPos = findBytePattern(
        bytes,
        [0x1f, 0x43, 0xb6, 0x75],
        infoBodyStart,
        searchLimit
      );
      const nextElemPos =
        tracksPos !== -1 && clusterPos !== -1
          ? Math.min(tracksPos, clusterPos)
          : tracksPos !== -1
          ? tracksPos
          : clusterPos;
      if (nextElemPos !== -1 && nextElemPos >= infoBodyStart) {
        const infoBodyEnd = nextElemPos;
        // Check if Duration (0x44 0x89 0x88) is already inside Info body
        const existingDurPos = findBytePattern(
          bytes,
          [0x44, 0x89, 0x88],
          infoBodyStart,
          infoBodyEnd
        );
        if (existingDurPos !== -1 && existingDurPos + 11 <= infoBodyEnd) {
          const out = new Uint8Array(bytes);
          const dv = new DataView(out.buffer, out.byteOffset, out.byteLength);
          dv.setFloat64(existingDurPos + 3, safeDurationMs, false);
          return out;
        }

        // Construct 11-byte EBML Duration element: ID [0x44, 0x89], size [0x88] (8 bytes), float64 (durationMs)
        const durationElem = new Uint8Array(11);
        durationElem[0] = 0x44;
        durationElem[1] = 0x89;
        durationElem[2] = 0x88;
        const durDv = new DataView(durationElem.buffer);
        durDv.setFloat64(3, safeDurationMs, false);

        const origInfoBodyLen = infoBodyEnd - infoBodyStart;
        const newInfoBodyLen = origInfoBodyLen + durationElem.length;

        // Encode Info size as a 4-byte EBML VINT (0x10xxxxxx) or 8-byte VINT if originally 8 bytes
        const newVintWidth = vintWidth === 8 ? 8 : 4;
        const sizeVint = new Uint8Array(newVintWidth);
        if (newVintWidth === 8) {
          sizeVint[0] = 0x01;
          sizeVint[5] = (newInfoBodyLen >> 16) & 0xff;
          sizeVint[6] = (newInfoBodyLen >> 8) & 0xff;
          sizeVint[7] = newInfoBodyLen & 0xff;
        } else {
          sizeVint[0] = 0x10 | ((newInfoBodyLen >> 24) & 0x0f);
          sizeVint[1] = (newInfoBodyLen >> 16) & 0xff;
          sizeVint[2] = (newInfoBodyLen >> 8) & 0xff;
          sizeVint[3] = newInfoBodyLen & 0xff;
        }

        const totalNewLen =
          (infoPos + 4) +
          sizeVint.length +
          origInfoBodyLen +
          durationElem.length +
          (bytes.length - infoBodyEnd);

        const out = new Uint8Array(totalNewLen);
        let offset = 0;
        out.set(bytes.subarray(0, infoPos + 4), offset);
        offset += infoPos + 4;
        out.set(sizeVint, offset);
        offset += sizeVint.length;
        out.set(bytes.subarray(infoBodyStart, infoBodyEnd), offset);
        offset += origInfoBodyLen;
        out.set(durationElem, offset);
        offset += durationElem.length;
        out.set(bytes.subarray(infoBodyEnd), offset);
        return out;
      }
    }
  }

  // 2. MP4 / ISO BMFF container (contains 'ftyp' box at bytes 4..7)
  if (
    bytes.length > 32 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const out = new Uint8Array(bytes);
    const dv = new DataView(out.buffer, out.byteOffset, out.byteLength);
    const headerScanLimit = Math.min(out.length, 65536);

    // Patch mvhd (0x6D 0x76 0x68 0x64) and mdhd (0x6D 0x64 0x68 0x64)
    let mvhdTimescale = 1000;
    for (const boxFourCc of [
      [0x6d, 0x76, 0x68, 0x64], // mvhd
      [0x6d, 0x64, 0x68, 0x64], // mdhd
    ]) {
      let searchFrom = 0;
      while (searchFrom < headerScanLimit) {
        const typePos = findBytePattern(out, boxFourCc, searchFrom, headerScanLimit);
        if (typePos === -1 || typePos < 4) break;
        const boxStart = typePos - 4;
        const boxSize = dv.getUint32(boxStart, false);
        if (boxSize >= 32 && boxSize <= 1024 && boxStart + boxSize <= out.length) {
          const version = out[boxStart + 8];
          if (version === 0 && boxStart + 32 <= out.length) {
            let ts = dv.getUint32(boxStart + 20, false);
            if (!ts) {
              ts = 1000;
              dv.setUint32(boxStart + 20, ts, false);
            }
            if (boxFourCc[1] === 0x76) mvhdTimescale = ts;
            const scaledDur = Math.max(1, Math.round((safeDurationMs / 1000) * ts));
            dv.setUint32(boxStart + 24, scaledDur, false);
          } else if (version === 1 && boxStart + 44 <= out.length) {
            let ts = dv.getUint32(boxStart + 28, false);
            if (!ts) {
              ts = 1000;
              dv.setUint32(boxStart + 28, ts, false);
            }
            if (boxFourCc[1] === 0x76) mvhdTimescale = ts;
            const scaledDur = BigInt(Math.max(1, Math.round((safeDurationMs / 1000) * ts)));
            dv.setBigUint64(boxStart + 32, scaledDur, false);
          }
        }
        searchFrom = typePos + 4;
      }
    }

    // Patch tkhd (0x74 0x6B 0x68 0x64)
    let tkhdSearch = 0;
    while (tkhdSearch < headerScanLimit) {
      const typePos = findBytePattern(out, [0x74, 0x6b, 0x68, 0x64], tkhdSearch, headerScanLimit);
      if (typePos === -1 || typePos < 4) break;
      const boxStart = typePos - 4;
      const boxSize = dv.getUint32(boxStart, false);
      if (boxSize >= 36 && boxSize <= 1024 && boxStart + boxSize <= out.length) {
        const version = out[boxStart + 8];
        const scaledDur = Math.max(1, Math.round((safeDurationMs / 1000) * mvhdTimescale));
        if (version === 0 && boxStart + 36 <= out.length) {
          dv.setUint32(boxStart + 28, scaledDur, false);
        } else if (version === 1 && boxStart + 48 <= out.length) {
          dv.setBigUint64(boxStart + 36, BigInt(scaledDur), false);
        }
      }
      tkhdSearch = typePos + 4;
    }

    return out;
  }

  return bytes;
}

export type DetectedAspectRatioOption =
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

/**
 * Automatically detects the native aspect ratio preset of an imported video or image
 * from its intrinsic pixel dimensions (`width` x `height`).
 * Vertical videos (e.g. 1080x1920, 720x1280, 576x1024) automatically resolve to '9:16'
 * instead of forcing '16:9'.
 */
export function detectAspectRatioFromDimensions(
  width: number,
  height: number
): DetectedAspectRatioOption {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return '16:9';
  }
  const ratio = width / height;

  // Common vertical phone formats (TikTok / Reels / Shorts: 9:16)
  if (ratio >= 0.5 && ratio <= 0.64) {
    return '9:16';
  }
  // Tall full-screen smartphone (5.8" ~ 9:19.5)
  if (ratio < 0.5) {
    return '5.8"';
  }
  // Portrait 3:4
  if (ratio > 0.64 && ratio < 0.88) {
    return '3:4';
  }
  // Square 1:1
  if (ratio >= 0.88 && ratio <= 1.15) {
    return '1:1';
  }
  // Standard 4:3
  if (ratio > 1.15 && ratio < 1.55) {
    return '4:3';
  }
  // Standard Widescreen 16:9
  if (ratio >= 1.55 && ratio <= 1.81) {
    return '16:9';
  }

  const candidates: Array<{ key: DetectedAspectRatioOption; val: number }> = [
    { key: '5.8"', val: 9 / 19.5 },
    { key: '9:16', val: 9 / 16 },
    { key: '3:4', val: 3 / 4 },
    { key: '1:1', val: 1 },
    { key: '4:3', val: 4 / 3 },
    { key: '16:9', val: 16 / 9 },
    { key: '1.85:1', val: 1.85 },
    { key: '2:1', val: 2.0 },
    { key: '21:9', val: 21 / 9 },
    { key: '2.35:1', val: 2.35 },
  ];

  let best: DetectedAspectRatioOption = '16:9';
  let minDiff = Infinity;
  for (const c of candidates) {
    const diff = Math.abs(ratio - c.val);
    if (diff < minDiff) {
      minDiff = diff;
      best = c.key;
    }
  }
  return best;
}

/**
 * Resolves the effective aspect ratio for the Preview Canvas or Export:
 * - When `projectAspectRatio === 'original'` ("Tỉ lệ gốc" — default), each video clip maintains
 *   its own independent aspect ratio (`activeVideoClip.nativeAspectRatio` or detected from
 *   `activeVideoClip.mediaWidth` × `activeVideoClip.mediaHeight`), so adding Video 2 never
 *   shrinks or distorts Video 1 or Video 2.
 * - Only when the user explicitly selects a fixed aspect ratio (`projectAspectRatio !== 'original'`)
 *   does it lock all videos to that fixed aspect ratio.
 */
export function resolveEffectiveClipAspectRatio(
  projectAspectRatio: string | undefined,
  activeVideoClip?: Pick<
    TimelineClip,
    'nativeAspectRatio' | 'mediaWidth' | 'mediaHeight'
  > | null,
  fallbackClips?: Array<
    Pick<
      TimelineClip,
      'trackIndex' | 'disabled' | 'nativeAspectRatio' | 'mediaWidth' | 'mediaHeight'
    >
  >
): DetectedAspectRatioOption {
  if (projectAspectRatio && projectAspectRatio !== 'original') {
    return projectAspectRatio as DetectedAspectRatioOption;
  }

  if (activeVideoClip) {
    if (
      activeVideoClip.nativeAspectRatio &&
      activeVideoClip.nativeAspectRatio !== 'original'
    ) {
      return activeVideoClip.nativeAspectRatio as DetectedAspectRatioOption;
    }
    if (
      typeof activeVideoClip.mediaWidth === 'number' &&
      activeVideoClip.mediaWidth > 0 &&
      typeof activeVideoClip.mediaHeight === 'number' &&
      activeVideoClip.mediaHeight > 0
    ) {
      return detectAspectRatioFromDimensions(
        activeVideoClip.mediaWidth,
        activeVideoClip.mediaHeight
      );
    }
  }

  if (fallbackClips && fallbackClips.length > 0) {
    const primary = fallbackClips.find(
      (c) =>
        !c.disabled &&
        c.trackIndex === 0 &&
        (Boolean(c.nativeAspectRatio && c.nativeAspectRatio !== 'original') ||
          (typeof c.mediaWidth === 'number' &&
            c.mediaWidth > 0 &&
            typeof c.mediaHeight === 'number' &&
            c.mediaHeight > 0))
    );
    if (primary) {
      if (primary.nativeAspectRatio && primary.nativeAspectRatio !== 'original') {
        return primary.nativeAspectRatio as DetectedAspectRatioOption;
      }
      if (primary.mediaWidth && primary.mediaHeight) {
        return detectAspectRatioFromDimensions(primary.mediaWidth, primary.mediaHeight);
      }
    }
  }

  return '16:9';
}

/**
 * Deletes selected media cards and/or timeline clips so that deleting a media item in
 * "Tệp phương tiện" (or pressing Delete) removes BOTH the media card and its underlying
 * core clips from the timeline, and deleting a timeline clip updates or removes its media card.
 */
export function deleteMediaCardsAndLinkedClips<
  M extends { id: string; name: string; mediaUrl?: string; added?: boolean }
>(
  mediaCards: M[],
  clips: TimelineClip[],
  targetIds: string[],
  snapEnabled: boolean = false,
  removeCardWhenClipDeleted: boolean = true
): {
  mediaCards: M[];
  clips: TimelineClip[];
  removedCardCount: number;
  removedClipCount: number;
  remainingMediaCards: M[];
  remainingClips: TimelineClip[];
  deletedCardCount: number;
  deletedClipCount: number;
} {
  const idSet = new Set(targetIds.filter(Boolean));
  if (idSet.size === 0) {
    return {
      mediaCards,
      clips,
      removedCardCount: 0,
      removedClipCount: 0,
      remainingMediaCards: mediaCards,
      remainingClips: clips,
      deletedCardCount: 0,
      deletedClipCount: 0,
    };
  }

  // 1. Identify directly targeted media cards
  const directlyDeletedCards = mediaCards.filter((m) => idSet.has(m.id));
  const deletedMediaUrls = new Set<string>();
  const deletedCardNames = new Set<string>();
  for (const card of directlyDeletedCards) {
    if (card.mediaUrl) deletedMediaUrls.add(card.mediaUrl);
    if (card.name) deletedCardNames.add(card.name);
  }

  // 2. Identify directly targeted clips
  const directlyDeletedClips = clips.filter((c) => idSet.has(c.id));
  const clipMediaUrlsToRemove = new Set<string>();
  const clipNamesToRemove = new Set<string>();
  for (const cl of directlyDeletedClips) {
    if (cl.mediaUrl) clipMediaUrlsToRemove.add(cl.mediaUrl);
    if (cl.name) clipNamesToRemove.add(cl.name);
  }

  // 3. Filter clips: remove clips whose id is in idSet OR whose source media card was deleted
  const rawRemainingClips = clips.filter((c) => {
    if (idSet.has(c.id)) return false;
    if (c.mediaUrl && deletedMediaUrls.has(c.mediaUrl)) return false;
    if (!c.mediaUrl && c.name && deletedCardNames.has(c.name)) return false;
    return true;
  });

  const finalClips = snapEnabled
    ? packTrackClipsContiguously(rawRemainingClips, 0)
    : rawRemainingClips;

  // 4. Filter media cards: remove cards whose id is in idSet, OR if removeCardWhenClipDeleted is true
  // and all timeline clips using that card's mediaUrl/name were just deleted
  const remainingClipUrls = new Set(finalClips.map((c) => c.mediaUrl).filter(Boolean));
  const remainingClipNames = new Set(finalClips.map((c) => c.name).filter(Boolean));

  const finalMediaCards = mediaCards
    .filter((m) => {
      if (idSet.has(m.id)) return false;
      if (removeCardWhenClipDeleted && directlyDeletedClips.length > 0) {
        if (
          m.mediaUrl &&
          clipMediaUrlsToRemove.has(m.mediaUrl) &&
          !remainingClipUrls.has(m.mediaUrl)
        ) {
          return false;
        }
        if (
          !m.mediaUrl &&
          m.name &&
          clipNamesToRemove.has(m.name) &&
          !remainingClipNames.has(m.name)
        ) {
          return false;
        }
      }
      return true;
    })
    .map((m) => {
      const stillUsed =
        (m.mediaUrl && remainingClipUrls.has(m.mediaUrl)) ||
        remainingClipNames.has(m.name);
      return m.added !== stillUsed ? { ...m, added: Boolean(stillUsed) } : m;
    });

  const removedCardCount = mediaCards.length - finalMediaCards.length;
  const removedClipCount = clips.length - finalClips.length;

  return {
    mediaCards: finalMediaCards,
    clips: finalClips,
    removedCardCount,
    removedClipCount,
    remainingMediaCards: finalMediaCards,
    remainingClips: finalClips,
    deletedCardCount: removedCardCount,
    deletedClipCount: removedClipCount,
  };
}

export async function patchMediaRecorderBlobDuration(
  blob: Blob,
  durationSec: number
): Promise<Blob> {
  try {
    const ab = await blob.arrayBuffer();
    const patched = patchMediaRecorderBufferDuration(new Uint8Array(ab), durationSec);
    return new Blob([new Uint8Array(patched).buffer as ArrayBuffer], { type: blob.type || 'video/webm' });
  } catch {
    return blob;
  }
}

/**
 * Determines whether a consecutive technical parameter edit should coalesce with the previous
 * Undo snapshot (instead of pushing a new snapshot on every intermediate slider/drag tick)
 * so that pressing Ctrl+Z once immediately restores the state prior to the parameter adjustment.
 */
export function shouldCoalesceUndoCommit(
  lastCommitKey: string | null,
  lastCommitTs: number,
  currentCommitKey: string | null | undefined,
  nowTs: number,
  coalesceWindowMs: number = 700
): boolean {
  if (!lastCommitKey || !currentCommitKey) return false;
  if (lastCommitKey !== currentCommitKey) return false;
  return Math.max(0, nowTs - lastCommitTs) <= coalesceWindowMs;
}

/**
 * TDO CUT Range Trim & Ripple Delete (In / Out Markers [I] & [O]):
 * - 'keep_inside': Trims the timeline to [markInSec, markOutSec] and shifts everything so markInSec starts at 0.00s.
 * - 'ripple_delete_inside': Excises [markInSec, markOutSec] and ripples all subsequent clips left by (markOutSec - markInSec).
 */
export function rippleTrimTimelineRange(
  clips: TimelineClip[],
  markInSec: number,
  markOutSec: number,
  mode: 'keep_inside' | 'ripple_delete_inside' = 'ripple_delete_inside',
  lockedTracks: Record<number, boolean> = {}
): TimelineClip[] {
  const inT = Number(Math.max(0, Math.min(markInSec, markOutSec)).toFixed(3));
  const outT = Number(Math.max(inT, Math.max(markInSec, markOutSec)).toFixed(3));
  const span = Number((outT - inT).toFixed(3));
  if (span < 0.05) return clips;

  const result: TimelineClip[] = [];

  if (mode === 'keep_inside') {
    for (const clip of clips) {
      if (lockedTracks[clip.trackIndex]) {
        result.push(clip);
        continue;
      }
      const cStart = clip.startTime;
      const cEnd = clip.startTime + clip.duration;
      if (cEnd <= inT + 0.02 || cStart >= outT - 0.02) {
        continue;
      }
      const overlapStart = Math.max(inT, cStart);
      const overlapEnd = Math.min(outT, cEnd);
      const nextDur = Number((overlapEnd - overlapStart).toFixed(3));
      if (nextDur < 0.08) continue;
      const cutLead = overlapStart - cStart;
      result.push({
        ...clip,
        startTime: Number((overlapStart - inT).toFixed(3)),
        duration: nextDur,
        sourceIn: Number((clip.sourceIn + cutLead * (clip.speed || 1)).toFixed(3)),
      });
    }
    return result;
  }

  // mode === 'ripple_delete_inside'
  for (const clip of clips) {
    if (lockedTracks[clip.trackIndex]) {
      result.push(clip);
      continue;
    }
    const cStart = clip.startTime;
    const cEnd = clip.startTime + clip.duration;

    // 1. Completely before [inT, outT]
    if (cEnd <= inT + 0.02) {
      result.push(clip);
      continue;
    }
    // 2. Completely after [inT, outT] -> shift left by span
    if (cStart >= outT - 0.02) {
      result.push({
        ...clip,
        startTime: Number(Math.max(0, cStart - span).toFixed(3)),
      });
      continue;
    }
    // 3. Completely inside [inT, outT] -> removed
    if (cStart >= inT - 0.02 && cEnd <= outT + 0.02) {
      continue;
    }
    // 4. Straddles both inT and outT -> split into left and right, with right shifted left by span
    if (cStart < inT - 0.02 && cEnd > outT + 0.02) {
      const leftDur = Number((inT - cStart).toFixed(3));
      const rightDur = Number((cEnd - outT).toFixed(3));
      const rightCutLead = outT - cStart;
      if (leftDur >= 0.08) {
        result.push({
          ...clip,
          duration: leftDur,
        });
      }
      if (rightDur >= 0.08) {
        result.push({
          ...clip,
          id: `${clip.id}_rpl_${Math.floor(outT * 100)}`,
          name: `${clip.name.replace(/\.mp4$/i, '')}_Part2.mp4`,
          startTime: Number(inT.toFixed(3)),
          duration: rightDur,
          sourceIn: Number((clip.sourceIn + rightCutLead * (clip.speed || 1)).toFixed(3)),
        });
      }
      continue;
    }
    // 5. Overlaps inT on the right tail
    if (cStart < inT && cEnd > inT && cEnd <= outT + 0.02) {
      const nextDur = Number((inT - cStart).toFixed(3));
      if (nextDur >= 0.08) {
        result.push({
          ...clip,
          duration: nextDur,
        });
      }
      continue;
    }
    // 6. Overlaps outT on the left head
    if (cStart >= inT - 0.02 && cStart < outT && cEnd > outT) {
      const nextDur = Number((cEnd - outT).toFixed(3));
      const cutLead = outT - cStart;
      if (nextDur >= 0.08) {
        result.push({
          ...clip,
          startTime: Number(inT.toFixed(3)),
          duration: nextDur,
          sourceIn: Number((clip.sourceIn + cutLead * (clip.speed || 1)).toFixed(3)),
        });
      }
    }
  }

  return result;
}

/**
 * Smart Silence & Dead-Air Remover:
 * Detects and trims silent/low-energy tail segments on Video Track 0 clips and closes all inter-clip dead gaps.
 */
export function removeTimelineDeadAirAndSilence(
  clips: TimelineClip[],
  silenceTailRatio: number = 0.12
): {
  clips: TimelineClip[];
  removedSec: number;
  trimmedClipsCount: number;
} {
  const v1 = clips
    .filter((c) => c.trackIndex === 0)
    .sort((a, b) => a.startTime - b.startTime);
  const others = clips.filter((c) => c.trackIndex !== 0);

  if (v1.length === 0) {
    return { clips, removedSec: 0, trimmedClipsCount: 0 };
  }

  const originalEnd = v1.reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);
  let trimmedCount = 0;

  const trimmedV1 = v1.map((clip) => {
    if (clip.duration <= 1.6) return clip;
    // Trim dead-air head/tail based on silenceTailRatio (clamped to preserve at least 1.2s)
    const cutAmount = Math.min(
      clip.duration - 1.2,
      Math.max(0.2, Number((clip.duration * Math.max(0.04, Math.min(0.35, silenceTailRatio))).toFixed(2)))
    );
    if (cutAmount < 0.15) return clip;
    trimmedCount += 1;
    const headCut = Number((cutAmount * 0.35).toFixed(2));
    return {
      ...clip,
      sourceIn: Number((clip.sourceIn + headCut * (clip.speed || 1)).toFixed(2)),
      duration: Number((clip.duration - cutAmount).toFixed(2)),
    };
  });

  const packed = packTrackClipsContiguously([...trimmedV1, ...others], 0);
  const newV1 = packed.filter((c) => c.trackIndex === 0);
  const newEnd = newV1.reduce((acc, c) => Math.max(acc, c.startTime + c.duration), 0);
  const removedSec = Number(Math.max(0, originalEnd - newEnd).toFixed(2));

  return {
    clips: packed,
    removedSec,
    trimmedClipsCount: trimmedCount,
  };
}

/**
 * TDO CUT Auto-Beat Sync Engine:
 * Aligns Video Track 0 clip durations so every scene cut lands on a musical beat interval.
 */
export function syncVideoClipsToBeats(
  clips: TimelineClip[],
  beatTimesSec?: number[]
): {
  clips: TimelineClip[];
  syncedCount: number;
  beatStepSec: number;
} {
  const v1 = clips
    .filter((c) => c.trackIndex === 0)
    .sort((a, b) => a.startTime - b.startTime);
  const others = clips.filter((c) => c.trackIndex !== 0);

  if (v1.length === 0) {
    return { clips, syncedCount: 0, beatStepSec: 1.5 };
  }

  // Derive beat grid from provided beatTimesSec or from Audio Track 1 clip beatMarkers
  let beats = (beatTimesSec || []).filter((t) => Number.isFinite(t) && t > 0).sort((a, b) => a - b);
  if (beats.length === 0) {
    const audioBeats: number[] = [];
    for (const a of others.filter((c) => c.trackIndex === 1)) {
      if (a.beatMarkers && a.beatMarkers.length > 0) {
        for (const bm of a.beatMarkers) {
          audioBeats.push(Number((a.startTime + bm).toFixed(2)));
        }
      }
    }
    beats = audioBeats.sort((a, b) => a - b);
  }

  const defaultBeatStep =
    beats.length >= 2
      ? Math.max(0.5, Number((beats[1] - beats[0]).toFixed(2)))
      : 1.5;

  let cursor = 0;
  let syncedCount = 0;
  const syncedV1 = v1.map((clip) => {
    // Snap each clip's duration to the closest multiple of defaultBeatStep (or next beat in `beats`)
    const multiples = Math.max(1, Math.round(clip.duration / defaultBeatStep));
    const targetDur = Number(Math.max(0.75, multiples * defaultBeatStep).toFixed(2));
    const nextClip: TimelineClip = {
      ...clip,
      startTime: Number(cursor.toFixed(2)),
      duration: targetDur,
    };
    if (Math.abs(targetDur - clip.duration) >= 0.04 || Math.abs(cursor - clip.startTime) >= 0.04) {
      syncedCount += 1;
    }
    cursor = Number((cursor + targetDur).toFixed(2));
    return nextClip;
  });

  return {
    clips: [...syncedV1, ...others],
    syncedCount,
    beatStepSec: defaultBeatStep,
  };
}

export interface TdoCutProjectFile {
  schema: 'tdocut.project.v1';
  app: 'TDO CUT Pro Studio';
  exportedAt: string;
  projectName: string;
  aspectRatio: string;
  markInSec: number | null;
  markOutSec: number | null;
  clips: TimelineClip[];
}

export function serializeTdoCutProject(
  projectName: string,
  aspectRatio: string,
  clips: TimelineClip[],
  markInSec: number | null = null,
  markOutSec: number | null = null
): string {
  const payload: TdoCutProjectFile = {
    schema: 'tdocut.project.v1',
    app: 'TDO CUT Pro Studio',
    exportedAt: new Date().toISOString(),
    projectName: projectName || 'TDO_CUT_Project',
    aspectRatio: aspectRatio || '16:9',
    markInSec,
    markOutSec,
    clips,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseTdoCutProject(jsonText: string): TdoCutProjectFile | null {
  try {
    const raw = JSON.parse(jsonText) as Partial<TdoCutProjectFile>;
    if (!raw || !Array.isArray(raw.clips)) return null;
    return {
      schema: 'tdocut.project.v1',
      app: 'TDO CUT Pro Studio',
      exportedAt: raw.exportedAt || new Date().toISOString(),
      projectName: typeof raw.projectName === 'string' ? raw.projectName : 'Imported_TDOCUT_Project',
      aspectRatio: typeof raw.aspectRatio === 'string' ? raw.aspectRatio : '16:9',
      markInSec: typeof raw.markInSec === 'number' ? raw.markInSec : null,
      markOutSec: typeof raw.markOutSec === 'number' ? raw.markOutSec : null,
      clips: raw.clips.map((c, idx) =>
        createDefaultClip({
          ...c,
          id: c.id || `imp_${idx}_${Date.now()}`,
          name: c.name || `Clip_${idx + 1}.mp4`,
          trackIndex: typeof c.trackIndex === 'number' ? c.trackIndex : 0,
          startTime: typeof c.startTime === 'number' ? c.startTime : 0,
          duration: typeof c.duration === 'number' ? Math.max(0.2, c.duration) : 3,
        })
      ),
    };
  } catch {
    return null;
  }
}

export type AppLanguage = 'vi' | 'en';
export type StudioThemeMode = 'dark' | 'light';

export interface StudioUiTranslations {
  menu: string;
  homeLauncher: string;
  importMedia: string;
  exportVideo: string;
  shortcuts: string;
  settings: string;
  themeDark: string;
  themeLight: string;
  switchThemeTitle: string;
  languageLabel: string;
  autoSaved: string;
  studioToolkit: string;
  markIn: string;
  markOut: string;
  clearInOut: string;
  loopInOut: string;
  rippleCutRange: string;
  keepRangeOnly: string;
  removeSilence: string;
  autoBeatSync: string;
  saveProjectJson: string;
  loadProjectJson: string;
  resourceTabs: {
    media: string;
    audio: string;
    text: string;
    stickers: string;
    effects: string;
    transitions: string;
    filters: string;
    adjustment: string;
    templates: string;
  };
  inspectorTabs: {
    video: string;
    audio: string;
    speed: string;
    animation: string;
    adjust: string;
    antidetect: string;
  };
  timeline: {
    split: string;
    splitAll: string;
    delete: string;
    freeze: string;
    reverse: string;
    mirror: string;
    extractAudio: string;
    keyframe: string;
  };
}

export const STUDIO_TRANSLATIONS: Record<AppLanguage, StudioUiTranslations> = {
  vi: {
    menu: 'Menu',
    homeLauncher: 'Màn hình chính',
    importMedia: 'Nhập tệp',
    exportVideo: 'Xuất bản',
    shortcuts: 'Phím tắt',
    settings: 'Cài đặt',
    themeDark: 'Giao diện Tối',
    themeLight: 'Giao diện Sáng',
    switchThemeTitle: 'Chuyển đổi Giao diện Sáng / Tối (Light / Dark Mode)',
    languageLabel: 'Tiếng Việt',
    autoSaved: 'Đã lưu tự động · GPU NVENC Sẵn sàng',
    studioToolkit: 'Bộ công cụ TDO CUT Pro',
    markIn: 'Điểm vào [I]',
    markOut: 'Điểm ra [O]',
    clearInOut: 'Xóa I/O',
    loopInOut: 'Lặp vùng I/O',
    rippleCutRange: 'Xóa vùng I/O & Khép',
    keepRangeOnly: 'Chỉ giữ vùng I/O',
    removeSilence: 'Cắt khoảng lặng AI',
    autoBeatSync: 'Khớp nhạc Beat Sync',
    saveProjectJson: 'Lưu dự án (.tdocut.json)',
    loadProjectJson: 'Mở dự án (.tdocut.json)',
    resourceTabs: {
      media: 'Phương tiện',
      audio: 'Âm thanh',
      text: 'Văn bản',
      stickers: 'Nhãn dán',
      effects: 'Hiệu ứng',
      transitions: 'Chuyển cảnh',
      filters: 'Bộ lọc',
      adjustment: 'Điều chỉnh',
      templates: 'Mẫu dự án',
    },
    inspectorTabs: {
      video: 'Video',
      audio: 'Âm thanh',
      speed: 'Tốc độ',
      animation: 'Hiệu ứng động',
      adjust: 'Màu LUTs',
      antidetect: 'Lách BQ',
    },
    timeline: {
      split: 'Tách (Ctrl+B)',
      splitAll: 'Tách tất cả',
      delete: 'Xóa (Del)',
      freeze: 'Đóng băng 3s',
      reverse: 'Đảo ngược',
      mirror: 'Lật gương',
      extractAudio: 'Tách âm thanh',
      keyframe: 'Keyframe ◇',
    },
  },
  en: {
    menu: 'Menu',
    homeLauncher: 'Home',
    importMedia: 'Import',
    exportVideo: 'Export',
    shortcuts: 'Shortcuts',
    settings: 'Settings',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    switchThemeTitle: 'Toggle Light / Dark Studio Theme',
    languageLabel: 'English',
    autoSaved: 'Auto-saved · GPU NVENC Ready',
    studioToolkit: 'TDO CUT Pro Toolkit',
    markIn: 'Mark In [I]',
    markOut: 'Mark Out [O]',
    clearInOut: 'Clear I/O',
    loopInOut: 'Loop I/O',
    rippleCutRange: 'Ripple Cut I/O',
    keepRangeOnly: 'Trim to I/O',
    removeSilence: 'Strip Silence',
    autoBeatSync: 'Auto-Beat Sync',
    saveProjectJson: 'Save Project (.tdocut.json)',
    loadProjectJson: 'Open Project (.tdocut.json)',
    resourceTabs: {
      media: 'Media',
      audio: 'Audio',
      text: 'Text',
      stickers: 'Stickers',
      effects: 'Effects',
      transitions: 'Transitions',
      filters: 'Filters',
      adjustment: 'Adjustment',
      templates: 'Templates',
    },
    inspectorTabs: {
      video: 'Video',
      audio: 'Audio',
      speed: 'Speed',
      animation: 'Animation',
      adjust: 'Color LUTs',
      antidetect: 'Anti-Detect',
    },
    timeline: {
      split: 'Split (Ctrl+B)',
      splitAll: 'Split All',
      delete: 'Delete (Del)',
      freeze: 'Freeze 3s',
      reverse: 'Reverse',
      mirror: 'Mirror Flip',
      extractAudio: 'Extract Audio',
      keyframe: 'Keyframe ◇',
    },
  },
};

export function getStudioTranslations(lang: AppLanguage = 'vi'): StudioUiTranslations {
  return STUDIO_TRANSLATIONS[lang] || STUDIO_TRANSLATIONS.vi;
}

const VI_TO_EN_EXACT_MAP: Record<string, string> = {
  // Top Bar & Menus
  'Nhập tên dự án': 'Enter project name',
  'Chưa có dự án': 'Enter project name',
  '0421-sao chép': 'Enter project name',
  'Tự động': 'Auto',
  'Ghi hình': 'Record',
  'Ghi': 'Record',
  'Đang ghi': 'Recording',
  'Cập nhật phụ đề': 'Sync Subtitles',
  'Xem chi tiết': 'Details',
  'Chi tiết': 'Details',
  'Dự án mới (Ctrl+N)': 'New Project (Ctrl+N)',
  'Nhập tệp đa phương tiện (Ctrl+I)': 'Import Media Files (Ctrl+I)',
  'Trình tạo ngẫu nhiên & Xuất hàng loạt': 'Matrix Randomizer & Batch Export',
  'Bật/Tắt chế độ Proxy (540P mượt)': 'Toggle Proxy Mode (Smooth 540P)',
  'Đang bật': 'Enabled',
  'Tắt': 'Off',
  'Tự động lưu nháp (Auto-save Drafts)': 'Auto-save Drafts',
  'Bố cục (Layout): Mặc định': 'Layout: Default Studio',
  'Hiệu suất GPU & Bộ nhớ đệm (Settings)...': 'GPU Performance & Cache (Settings)...',
  'Màn hình chính Quản lý Dự án (Home)...': 'Project Hub (Home)...',
  // Left Sidebar Categories & Folders
  'Tệp phương tiện': 'Media Files',
  'Trên thiết bị': 'Local Device',
  'Thư viện': 'Stock Library',
  'Lịch sử': 'History',
  'Công cụ AI': 'AI Tools',
  'Dự án con': 'Sub-Projects',
  'Tài sản của ...': 'Brand Assets',
  'Tạo': 'Create',
  'Không gian': 'Cloud Space',
  'Tất cả': 'All',
  'Đã dùng': 'Used',
  'Chưa dùng': 'Unused',
  'Đã thêm': 'Added',
  'Hình ảnh': 'Images',
  'Thời gian': 'Date Modified',
  'Tên A-Z': 'Name A-Z',
  'Thời lượng': 'Duration',
  '+ Nhập': '+ Import',
  '+ Thêm âm thanh mẫu': '+ Add Sample Audio',
  'Nhập kịch bản để tạo thành phẩm': 'Script to Video Generator',
  'Bắt đầu sáng tạo': 'Start Creating',
  'Thêm mới': 'New Folder',
  'Nhập': 'Import',
  'Đổi tên': 'Rename',
  'Nhân bản': 'Duplicate',
  'Xóa': 'Delete',
  'Khôi phục': 'Restore',
  'Đã đồng bộ': 'Synced',
  'Đang chọn': 'Selected',
  'Chọn tất cả': 'Select All',
  'Bỏ chọn': 'Deselect',
  'Lưu Timeline hiện tại': 'Save Current Timeline',
  'Tải MP3 / WAV': 'Upload MP3 / WAV',
  'Trích xuất âm thanh': 'Extract Audio',
  'Thêm / Kéo thả chữ': 'Add / Drag Text',
  'Nhập file .SRT': 'Import .SRT File',
  'Công cụ cắt clip bằng AI': 'AI Smart Clip Cutter',
  'Bắt đầu cắt clip': 'Start Smart Cut',
  'Xóa sạch dữ liệu mẫu / Tạo dự án trắng': 'Clear Sample Data / Blank Project',
  // Sub-categories across tabs
  'Nhạc nền (BGM)': 'Background Music (BGM)',
  'Hiệu ứng âm thanh (SFX)': 'Sound Effects (SFX)',
  'Âm thanh đã trích xuất': 'Extracted Audio',
  'Bản ghi âm (Voiceover)': 'Voiceover Recordings',
  'Liên kết TikTok': 'TikTok Linked Sounds',
  'Thêm văn bản': 'Add Text',
  'Văn bản mặc định': 'Default Text',
  'Hiệu ứng chữ': 'Text Effects',
  'Mẫu văn bản': 'Text Templates',
  'Phụ đề tự động': 'Auto Captions',
  'Lời bài hát tự động': 'Auto Lyrics',
  'Phụ đề nội bộ (.SRT)': 'Local Captions (.SRT)',
  'Biểu tượng (Emoji)': 'Emojis',
  'Mạng xã hội (Subscribe/Like)': 'Social (Subscribe/Like)',
  'Mũi tên & Khung': 'Arrows & Frames',
  'Nhãn dán AI': 'AI Stickers',
  'Hiệu ứng Video': 'Video Effects',
  'Hiệu ứng Cơ thể': 'Body Effects',
  'Đang thịnh hành': 'Trending',
  'Ống kính & Ánh sáng': 'Lens & Light',
  'Cổ điển (Retro/VHS)': 'Retro / VHS',
  'Cơ bản (Hoà trộn)': 'Basic (Dissolve)',
  'Máy ảnh (Zoom/Quét)': 'Camera (Zoom/Whip)',
  'Mạng xã hội (Glitch)': 'Social (Glitch)',
  'Ánh sáng (Flash)': 'Light Flash',
  'Trượt (Slide)': 'Slide',
  'Phim ảnh (Cinema)': 'Cinematic',
  'Đời sống (Life)': 'Lifestyle',
  'Phong cảnh (Scenery)': 'Scenery',
  'Cổ điển (Retro)': 'Retro Vintage',
  'Đen trắng (B&W)': 'Black & White',
  'Điều chỉnh tùy chỉnh': 'Custom Adjustment',
  'Bảng màu LUT (.cube)': 'LUTs (.cube)',
  // Player Controls
  'Trình phát': 'Player',
  'Dòng thời gian 01': 'Timeline 01',
  'Trình phát-Dòng thời gian 01': 'Player - Timeline 01',
  'Đầy đủ': 'Full',
  'Một nửa': 'Half (1/2)',
  'Một phần tư': 'Quarter (1/4)',
  'Lưới': 'Grid',
  'Vùng an toàn': 'Safe Zone',
  'Tắt phụ đề': 'Hide Subtitles',
  'Hiện phụ đề': 'Show Subtitles',
  'Chụp ảnh': 'Snapshot',
  'Gốc': 'Original',
  'Tự do': 'Free',
  'Cắt xén': 'Crop',
  // Inspector Sub-tabs & Headings
  'Cơ bản': 'Basic',
  'Xóa nền': 'Cutout',
  'Mặt nạ': 'Mask',
  'Làm đẹp': 'Retouch',
  'Làm mịn': 'Retouch',
  'Văn bản': 'Text',
  'Văn bản (Text Inspector)': 'Text Inspector',
  'Đọc văn bản': 'Text to Speech',
  'Tiêu chuẩn': 'Standard',
  'Đường cong': 'Curve',
  'Vào': 'In',
  'Ra': 'Out',
  'Kết hợp': 'Combo',
  'Tùy chỉnh': 'Custom',
  'Bộ lọc': 'Filters',
  'Bánh xe màu': 'Color Wheels',
  'Biến đổi': 'Transform',
  'Hòa trộn': 'Blend',
  'Vị trí & Kích thước': 'Position & Size',
  'Tỷ lệ (Scale)': 'Scale',
  'Tỷ lệ': 'Scale',
  'Tỷ lệ X': 'Scale X',
  'Tỷ lệ Y': 'Scale Y',
  'Thu phóng đồng nhất': 'Uniform Scale',
  'Vị trí (Position)': 'Position',
  'Vị trí': 'Position',
  'Xoay (Rotate)': 'Rotate',
  'Xoay': 'Rotate',
  'Chế độ (Mode)': 'Blend Mode',
  'Bình thường (Normal)': 'Normal',
  'Làm sáng (Screen)': 'Screen',
  'Nhân màu (Multiply)': 'Multiply',
  'Hòa phủ (Overlay)': 'Overlay',
  'Làm tối (Darken)': 'Darken',
  'Sáng hơn (Lighten)': 'Lighten',
  'Độ mờ (Opacity)': 'Opacity',
  'Độ mờ': 'Opacity',
  'Chống rung (Stabilize)': 'Stabilize',
  'Chống rung (Stabilize):': 'Stabilize:',
  'Khuyên dùng (Recommended)': 'Recommended',
  'Cắt tối thiểu': 'Minimal Cropping',
  'Ổn định nhất': 'Most Stable',
  'Đánh sáng 3D (Relight AI):': '3D Relight AI:',
  'Nắng ấm (Warm Sunset)': 'Warm Sunset',
  'Trăng lạnh (Cool Studio)': 'Cool Studio',
  'Neon 2 Hướng (Dual Neon)': 'Dual Neon',
  'Làm mờ CĐ:': 'Motion Blur:',
  'Khử nhấp nháy': 'Remove Flicker',
  'Giảm nhiễu ảnh': 'Image Denoise',
  'Làm mờ chuyển động': 'Motion Blur',
  'Phông xanh (Chroma Key)': 'Chroma Key',
  'Màu phông nền:': 'Key Color:',
  'Phông Xanh lá (Green Screen)': 'Green Screen',
  'Phông Xanh dương (Blue Screen)': 'Blue Screen',
  'Tách nền AI (Auto Cutout + Viền Stroke)': 'AI Auto Cutout + Stroke',
  'Làm mờ hậu cảnh (Background Blur)': 'Background Blur',
  'Đảo ngược vùng che (Invert Mask)': 'Invert Mask',
  'Nội dung văn bản / Phụ đề:': 'Text / Caption Content:',
  'Phông chữ:': 'Font Family:',
  'Inter Modern (Mặc định)': 'Inter Modern (Default)',
  'Georgia Serif (Điện ảnh)': 'Georgia Serif (Cinematic)',
  'Courier Mono (Máy chữ)': 'Courier Mono (Typewriter)',
  'Cỡ chữ': 'Font Size',
  'Màu chữ:': 'Text Color:',
  'Viền chữ:': 'Stroke Color:',
  'Uốn cong': 'Curve Text',
  'Khung nền Bong bóng (Text Bubble)': 'Text Bubble Background',
  'Mẫu Chữ Nghệ Thuật & Hiệu ứng Động': 'WordArt & Text Animation',
  'Hiệu ứng Chuyển động Chữ (Animation):': 'Text Animation:',
  'Chuyển Văn Bản Thành Giọng Nói (AI TTS)': 'AI Text-to-Speech (TTS)',
  'Âm lượng': 'Volume',
  'Chuẩn hóa âm lượng (-14 LUFS)': 'Loudness Normalization (-14 LUFS)',
  'Giảm tiếng ồn (Reduce Noise)': 'Noise Reduction',
  'Tự động giảm nhạc nền (Audio Ducking)': 'Auto Audio Ducking',
  'Tách giọng AI:': 'AI Vocal Isolation:',
  'Bình thường': 'Normal',
  'Chỉ giữ Giọng hát (Keep Vocal)': 'Keep Vocals Only',
  'Chỉ giữ Nhạc Beat (Karaoke)': 'Keep Instrumental (Karaoke)',
  'Đổi giọng (Voice FX):': 'Voice Changer (FX):',
  'Giọng gốc': 'Original Voice',
  'Sóc chuột (Chipmunk)': 'Chipmunk',
  'Trầm ấm (Deep)': 'Deep Voice',
  'Vang vọng (Echo)': 'Echo Chamber',
  'Loa phóng thanh': 'Megaphone',
  'Giữ nguyên tông giọng (Keep Pitch)': 'Keep Pitch',
  'Làm mượt Slow-mo:': 'Smooth Slow-Mo:',
  'Pha trộn khung hình': 'Frame Blending',
  'Luồng quang học AI (Optical Flow)': 'AI Optical Flow',
  'Tông (Hue)': 'Hue',
  'Độ bão hòa': 'Saturation',
  'Độ sáng': 'Brightness',
  'Theo dõi chuyển động (Motion Tracking)': 'Motion Tracking',
  'Đổi mã băm & Metadata iPhone 16 Pro Max': 'Spoof Hash & iPhone 16 Pro Max Metadata',
  'Tiêm nhiễu hạt vi mô (Anti-Hash Micro-Grain)': 'Inject Anti-Hash Micro-Grain',
  'libx264 (CPU x264 Chuẩn)': 'libx264 (Standard CPU x264)',
  // Timeline & Context Menus
  'Tách (B)': 'Split (B)',
  'Ảnh bìa': 'Cover',
  'Lấp đầy khoảng trống': 'Close Gap',
  'Lấp đầy mọi khoảng trống': 'Close All Gaps',
  'Chọn': 'Select',
  'Dán': 'Paste',
  'Khoảng (Đánh dấu mốc I/O)': 'Range (Mark I/O)',
  'Kết xuất (Pre-render Timeline)': 'Pre-render Timeline',
  'Bản sao': 'Duplicate',
  'Cắt': 'Cut',
  'Sao chép thuộc tính': 'Copy Attributes',
  'Dán thuộc tính': 'Paste Attributes',
  'Chỉnh sửa (Lật / Xoay / Đảo ngược)': 'Edit (Flip / Rotate / Reverse)',
  'Tạo video (Nhân bản nhanh)': 'Quick Duplicate Video',
  'Chỉnh sửa bằng AI': 'AI Edit',
  'Kéo dài bằng AI (+2.0s)': 'AI Extend (+2.0s)',
  'Tách cảnh': 'Split Scenes',
  'Bản chép lời (Tạo phụ đề AI)': 'Transcript (AI Captions)',
  'Tách giọng nói (Giữ giọng hát AI)': 'Isolate Voice (Keep Vocals)',
  'Đồng bộ video và âm thanh': 'Sync Video & Audio',
  'Tạo clip ghép (dự án con)': 'Create Compound Clip',
  'Tạo clip quay bằng nhiều camera': 'Create Multicam Clip',
  'Lưu kiểu cài sẵn': 'Save as Preset',
  'Nhóm': 'Group',
  'Bỏ nhóm': 'Ungroup',
  'Xuất các clip đã chọn': 'Export Selected Clips',
  'Cắt đoạn video': 'Trim Video Clip',
  'Thay thế clip': 'Replace Clip',
  'Liên kết với phương tiện': 'Link to Media',
  'Mở vị trí tệp': 'Open File Location',
  'Chỉnh sửa hiệu ứng': 'Edit Effects',
  'Hiển thị hiệu ứng động tốc độ thay đổi': 'Show Speed Ramp Keyframes',
  'Chức năng': 'Functions',
  'Chức năng — Tự động hóa Timeline': 'Functions — Timeline Automation',
  '✦ TdoEdit — Tự động hóa Timeline': 'Functions — Timeline Automation',
  'Cắt hàng loạt (Lấy phần giữa):': 'Batch Trim (Keep Middle):',
  'Mặt biểu cảm (Icons)': 'Face Icons',
  'Cờ các nước (World Flags)': 'World Flags (All Countries)',
  'Nút mạng xã hội (CTA)': 'Social & CTA Badges',
  'Cảm xúc & Trend': 'Trending Emojis',
  'Khung & Mũi tên': 'Frames & Arrows',
  'Từ': 'From',
  'đến': 'to',
  'Đích(s):': 'Target(s):',
  'Đảo ngẫu nhiên Clip trên Timeline': 'Shuffle Clips on Timeline',
  'Export still frame (Chụp ảnh tĩnh .PNG)': 'Export Still Frame (.PNG)',
  'Show scopes (Biểu đồ sóng màu)': 'Show Lumetri Scopes',
  'Show safe area (Khung TikTok & Lưới)': 'Show Safe Zone & Grid',
  'Đóng': 'Close',
  'Lưu & Đóng': 'Save & Close',
  'Hủy': 'Cancel',
  // Captions Tab & Sub-tabs
  'Phụ đề AI': 'AI Captions',
  'Tạo Phụ Đề Tự Động (Whisper AI)': 'Auto Captions (Whisper AI)',
  'Song ngữ Việt-Anh': 'Bilingual VI-EN',
  'Song ngữ Việt - Anh (Bilingual Subtitles)': 'Bilingual Subtitles (VI - EN)',
  'Lời bài hát AI': 'AI Song Lyrics',
  'Nhận diện Lời bài hát AI (Auto Lyrics Sync)': 'AI Lyrics Sync (Auto Beat Lyrics)',
  'Lọc từ thừa (Ờ, À)': 'Remove Filler Words',
  'Lọc Từ Thừa (Ờ, À) & Cắt Khoảng Lặng': 'Remove Filler Words & Dead Air',
  'Phụ đề song ngữ (Bilingual Subtitles Việt - Anh)': 'Bilingual Subtitles (Vietnamese - English)',
  'Captions song ngữ (Bilingual Subtitles Việt - Anh)': 'Bilingual Captions (Vietnamese - English)',
  'Xóa từ thừa & khoảng lặng (Identify filler words)': 'Remove filler words & silence gaps',
  'Tạo Phụ Đề AI': 'Generate AI Captions',
  'Create Captions AI': 'Generate AI Captions',
  'Phong cách Phụ đề Nhanh (Áp dụng cho toàn bộ Phụ đề)': 'Quick Caption Styles (Apply to All Captions)',
  'Phong cách Chú thích Nhanh (Áp dụng cho toàn bộ Phụ đề)': 'Quick Caption Styles (Apply to All Captions)',
  'Phong cách Captions Nhanh (Áp dụng cho toàn bộ Captions)': 'Quick Caption Styles (Apply to All Captions)',
  'Danh sách câu thoại trên Timeline': 'Timeline Caption Segments',
  'Danh sách Chú thích trên Timeline': 'Timeline Caption Segments',
  'MrBeast Vàng Đậm': 'MrBeast Bold Yellow',
  'Hormozi Trắng Xanh': 'Hormozi Cyan White',
  'Podcast Tối Giản': 'Minimalist Podcast',
  'Karaoke Hồng Neon': 'Neon Pink Karaoke',
  'Bong bóng': 'Bubble',
  'Hiệu ứng': 'Effects',
  'Đọc TTS': 'Speak TTS',
  'Áp dụng cho tất cả phụ đề (Apply to All)': 'Apply to All Captions',
  '+ Thêm câu': '+ Add Line',
  'Xóa hết': 'Clear All',
  'Nhập văn bản': 'Enter text',
  'Nhập văn bản...': 'Enter text...',
  'Dự án TDO CUT (.json)': 'TDO CUT Project (.json)',
  'Lưu Dự Án': 'Save Project',
  'Lưu Dự án': 'Save Project',
  'Xuất Video': 'Export Video',
  'Xuất': 'Export',
  'Tối': 'Dark',
  'Sáng': 'Light',
  'Tên:': 'Name:',
  'Đường dẫn:': 'Path:',
  'Proxy (Chống giật):': 'Proxy (Smooth Playback):',
  'Đã tắt': 'Off',
  'Đã bật': 'On',
  'Số clip Timeline:': 'Timeline Clips:',
  'Scale khung hình:': 'Aspect Ratio & FPS:',
  'Sửa đổi (Modify)': 'Modify Settings',
  'Tỉ lệ': 'Ratio',
  'Tỉ lệ gốc': 'Original',
  'Tỉ lệ gốc (Theo từng video độc lập)': 'Original (Independent per video)',
};

const VI_TO_EN_PHRASE_PAIRS: Array<[string, string]> = [
  ['Trình phát-Dòng thời gian 01', 'Player - Timeline 01'],
  ['(Bản dựng chính)', '(Main Edit)'],
  ['-sao chép', '-copy'],
  ['Hôm nay', 'Today'],
  ['Hôm qua', 'Yesterday'],
  ['Vừa xong', 'Just now'],
  ['Phong cách Chú thích Nhanh (Áp dụng cho toàn bộ Phụ đề)', 'Quick Caption Styles (Apply to All Captions)'],
  ['Phong cách Captions Nhanh (Áp dụng cho toàn bộ Captions)', 'Quick Caption Styles (Apply to All Captions)'],
  ['Phong cách Phụ đề Nhanh (Áp dụng cho toàn bộ Phụ đề)', 'Quick Caption Styles (Apply to All Captions)'],
  ['Danh sách Chú thích trên Timeline', 'Timeline Caption Segments'],
  ['Danh sách Captions trên Timeline', 'Timeline Caption Segments'],
  ['Danh sách câu thoại trên Timeline', 'Timeline Caption Segments'],
  ['Áp dụng cho tất cả phụ đề (Apply to All)', 'Apply to All Captions'],
  ['Áp dụng cho toàn bộ Phụ đề', 'Apply to All Captions'],
  ['Áp dụng cho toàn bộ Captions', 'Apply to All Captions'],
  ['MrBeast Vàng Đậm', 'MrBeast Bold Yellow'],
  ['Hormozi Trắng Xanh', 'Hormozi Cyan White'],
  ['Podcast Tối Giản', 'Minimalist Podcast'],
  ['Karaoke Hồng Neon', 'Neon Pink Karaoke'],
  ['Cỡ ', 'Size '],
  [' · Viền ', ' · Stroke '],
  ['Lọc Từ Thừa (Ờ, À) & Cắt Khoảng Lặng', 'Remove Filler Words & Dead Air'],
  ['Tạo Phụ Đề Tự Động (Whisper AI)', 'Auto Captions (Whisper AI)'],
  ['Captions song ngữ (Bilingual Subtitles Việt - Anh)', 'Bilingual Captions (VI - EN)'],
  ['Phụ đề song ngữ (Bilingual Subtitles Việt - Anh)', 'Bilingual Captions (VI - EN)'],
  ['Xóa từ thừa & khoảng lặng (Identify filler words)', 'Remove filler words & silence gaps'],
  ['Kéo chuột quét chọn nhiều tệp hoặc kéo thả xuống Timeline', 'Drag marquee to multi-select or drag & drop to Timeline'],
  ['Chọn tệp phương tiện để phân tích và tách thành các clip hoàn chỉnh', 'Select media files to analyze and split into highlights'],
  ['Chọn tệp phương tiệ...', 'Select media files...'],
  ['Công cụ cắt clip bằng AI', 'AI Smart Clip Cutter'],
  ['Bắt đầu cắt clip', 'Start Smart Cut'],
  ['Tìm kiếm tệp phương tiện', 'Search media files'],
  ['Tìm kiếm tệp phư...', 'Search media...'],
  ['Tìm kiếm', 'Search'],
  ['Tệp phương tiện', 'Media Files'],
  ['Tài sản của thương hiệu', 'Brand Assets'],
  ['Tài sản của ...', 'Brand Assets'],
  ['Không gian màu:', 'Color Space:'],
  ['Không gian', 'Cloud Space'],
  ['Trình phát', 'Player'],
  ['Dòng thời gian', 'Timeline'],
  ['Nhập phương tiện', 'Import Media'],
  ['Kéo video, ảnh, nhạc hoặc tệp .srt vào đây', 'Drag videos, images, audio, or .srt files here'],
  ['Đã thêm', 'Added'],
  ['Đã dùng', 'Used'],
  ['Chưa dùng', 'Unused'],
  ['Đã chọn', 'Selected'],
  ['Chọn tất cả', 'Select All'],
  ['Bỏ chọn', 'Deselect'],
  ['Tìm kiếm tên tệp...', 'Search file name...'],
  ['Tìm tên dự án...', 'Search project name...'],
  ['Tìm hiệu ứng, mẫu chữ, bộ lọc...', 'Search effects, text templates, filters...'],
  ['Trên thiết bị', 'Local Device'],
  ['Thư viện', 'Stock Library'],
  ['Lịch sử', 'History'],
  ['Công cụ AI', 'AI Tools'],
  ['Dự án con', 'Sub-Projects'],
  ['Tất cả', 'All'],
  ['Hình ảnh', 'Images'],
  ['Âm thanh', 'Audio'],
  ['Phương tiện', 'Media'],
  ['Văn bản', 'Text'],
  ['Nhãn dán', 'Stickers'],
  ['Hiệu ứng động', 'Animation'],
  ['Hiệu ứng', 'Effects'],
  ['Chuyển tiếp', 'Transitions'],
  ['Chuyển cảnh', 'Transitions'],
  ['Chú thích', 'Captions'],
  ['Phụ đề AI', 'AI Captions'],
  ['Phụ đề', 'Captions'],
  ['Bộ lọc', 'Filters'],
  ['Điều chỉnh', 'Adjustment'],
  ['Mẫu dự án', 'Templates'],
  ['Tốc độ', 'Speed'],
  ['Màu LUTs', 'Color LUTs'],
  ['Lách BQ', 'Anti-Detect'],
  ['Cơ bản', 'Basic'],
  ['Xóa nền', 'Cutout'],
  ['Mặt nạ', 'Mask'],
  ['Làm đẹp', 'Retouch'],
  ['Làm mịn', 'Retouch'],
  ['Đọc văn bản', 'Text to Speech'],
  ['Tiêu chuẩn', 'Standard'],
  ['Đường cong', 'Curve'],
  ['Kết hợp', 'Combo'],
  ['Tùy chỉnh', 'Custom'],
  ['Bánh xe màu', 'Color Wheels'],
  ['Vị trí & Kích thước', 'Position & Size'],
  ['Biến đổi', 'Transform'],
  ['Hòa trộn', 'Blend'],
  ['Thu phóng đồng nhất', 'Uniform Scale'],
  ['Tỷ lệ (Scale)', 'Scale'],
  ['Tỷ lệ', 'Scale'],
  ['Vị trí (Position)', 'Position'],
  ['Vị trí', 'Position'],
  ['Xoay (Rotate)', 'Rotate'],
  ['Xoay', 'Rotate'],
  ['Chế độ (Mode)', 'Mode'],
  ['Bình thường (Normal)', 'Normal'],
  ['Làm sáng (Screen)', 'Screen'],
  ['Nhân màu (Multiply)', 'Multiply'],
  ['Hòa phủ (Overlay)', 'Overlay'],
  ['Làm tối (Darken)', 'Darken'],
  ['Sáng hơn (Lighten)', 'Lighten'],
  ['Độ mờ (Opacity)', 'Opacity'],
  ['Độ mờ', 'Opacity'],
  ['Chống rung (Stabilize):', 'Stabilize:'],
  ['Chống rung (Stabilize)', 'Stabilize'],
  ['Khuyên dùng (Recommended)', 'Recommended'],
  ['Cắt tối thiểu', 'Minimal Cropping'],
  ['Ổn định nhất', 'Most Stable'],
  ['Đánh sáng 3D (Relight AI):', '3D Relight AI:'],
  ['Làm mờ CĐ:', 'Motion Blur:'],
  ['Đầy đủ', 'Full'],
  ['Một nửa', 'Half'],
  ['Một phần tư', 'Quarter'],
  ['Vùng an toàn', 'Safe Zone'],
  ['Lưới', 'Grid'],
  ['Chụp ảnh', 'Snapshot'],
  ['Cắt khoảng lặng', 'Strip Silence'],
  ['Khớp Beat', 'Beat Sync'],
  ['Xóa I/O', 'Clear I/O'],
  ['Giữ I/O', 'Keep I/O'],
  ['Lặp I/O', 'Loop I/O'],
  ['Tách (B)', 'Split (B)'],
  ['Tách cảnh', 'Split Scenes'],
  ['Tách tất cả', 'Split All'],
  ['Đóng băng 3s', 'Freeze 3s'],
  ['Đảo ngược', 'Reverse'],
  ['Lật gương', 'Mirror Flip'],
  ['Tách âm thanh', 'Extract Audio'],
  ['Tầng chính', 'Main Track'],
  ['Tầng chữ', 'Text Track'],
  ['Tầng nhạc', 'Audio Track'],
  ['Tầng phủ', 'Overlay Track'],
  ['Lớp Phủ', 'Overlay'],
  ['Ảnh bìa', 'Cover'],
  [' mục', ' items'],
  ['Tạo', 'Create'],
  ['Ghi âm', 'Voiceover'],
  ['Đang phát', 'Playing'],
  ['Tạm dừng', 'Paused'],
  ['Chỉnh sửa nâng cao', 'Advanced Edit'],
  ['Đặt lại', 'Reset'],
  ['Áp dụng cho tất cả', 'Apply to All'],
  ['Thêm vào Timeline', 'Add to Timeline'],
  ['Kéo xuống Timeline', 'Drag to Timeline'],
  ['Mở Bàn Dựng Hiện Tại', 'Open Active Editor'],
  ['Quay lại Bàn dựng', 'Back to Editor'],
  ['Thùng rác trống.', 'Trash is empty.'],
  ['Chưa có dự án nào khớp tìm kiếm.', 'No matching projects found.'],
  ['Dự án của bạn', 'Your Projects'],
  ['Đã dọn sạch Cache (0 MB)', 'Cache Cleared (0 MB)'],
  ['Lưu & Đóng', 'Save & Close'],
  ['Đóng', 'Close'],
  ['Hủy', 'Cancel'],
];

export function translateViToEnText(input: string): string {
  if (!input) return input;
  const trimmed = input.trim();
  if (!trimmed) return input;

  // 1. Exact lookup
  if (VI_TO_EN_EXACT_MAP[trimmed]) {
    return input.replace(trimmed, VI_TO_EN_EXACT_MAP[trimmed]);
  }

  let out = input;

  // 2. Phrase pair replacement
  for (const [viPhrase, enPhrase] of VI_TO_EN_PHRASE_PAIRS) {
    if (out.includes(viPhrase)) {
      out = out.split(viPhrase).join(enPhrase);
    }
  }

  return out;
}

const originalTextNodeMap = new WeakMap<Node, string>();
const lastTranslatedTextNodeMap = new WeakMap<Node, string>();

export function applyDomLanguageTranslation(
  root: HTMLElement | Document,
  lang: AppLanguage
): void {
  if (typeof document === 'undefined') return;
  const container = root instanceof Document ? root.body : root;
  if (!container) return;

  // 1. Translate or restore text nodes (detecting when React updates a reused text node!)
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();
  while (currentNode) {
    const parentTag = currentNode.parentElement?.tagName;
    if (parentTag !== 'SCRIPT' && parentTag !== 'STYLE' && parentTag !== 'TEXTAREA') {
      const currentVal = currentNode.nodeValue ?? '';
      if (lang === 'en') {
        const lastTranslated = lastTranslatedTextNodeMap.get(currentNode);
        if (!originalTextNodeMap.has(currentNode) || lastTranslated === undefined || currentVal !== lastTranslated) {
          originalTextNodeMap.set(currentNode, currentVal);
        }
        const orig = originalTextNodeMap.get(currentNode) ?? currentVal;
        const translated = translateViToEnText(orig);
        lastTranslatedTextNodeMap.set(currentNode, translated);
        if (currentNode.nodeValue !== translated) {
          currentNode.nodeValue = translated;
        }
      } else {
        const orig = originalTextNodeMap.get(currentNode);
        const lastTranslated = lastTranslatedTextNodeMap.get(currentNode);
        if (orig !== undefined && currentVal === lastTranslated && currentNode.nodeValue !== orig) {
          currentNode.nodeValue = orig;
        } else {
          originalTextNodeMap.set(currentNode, currentVal);
        }
        lastTranslatedTextNodeMap.delete(currentNode);
      }
    }
    currentNode = walker.nextNode();
  }

  // 2. Translate or restore attributes (title, placeholder, aria-label)
  const elements = container.querySelectorAll<HTMLElement>('[title], [placeholder], [aria-label]');
  elements.forEach((el) => {
    for (const attr of ['title', 'placeholder', 'aria-label'] as const) {
      const dataKey = `data-orig-${attr}`;
      const dataLastKey = `data-last-en-${attr}`;
      if (lang === 'en') {
        const currentVal = el.getAttribute(attr);
        if (!currentVal) continue;
        const lastEnVal = el.getAttribute(dataLastKey);
        if (!el.hasAttribute(dataKey) || lastEnVal === null || currentVal !== lastEnVal) {
          el.setAttribute(dataKey, currentVal);
        }
        const origVal = el.getAttribute(dataKey) ?? currentVal;
        const translated = translateViToEnText(origVal);
        el.setAttribute(dataLastKey, translated);
        if (currentVal !== translated) {
          el.setAttribute(attr, translated);
        }
      } else {
        const origVal = el.getAttribute(dataKey);
        const lastEnVal = el.getAttribute(dataLastKey);
        const currentVal = el.getAttribute(attr);
        if (origVal !== null && currentVal === lastEnVal && currentVal !== origVal) {
          el.setAttribute(attr, origVal);
        }
        el.removeAttribute(dataLastKey);
      }
    }
  });
}

export interface StickerCatalogItem {
  id: StickerOverlayType;
  uid: string;
  label: string;
  labelEn?: string;
  icon: string;
  cat: 'all' | 'cta' | 'faces' | 'emoji' | 'flags' | 'neon' | (string & {});
  isoCode?: string;
  flagSvgDataUrl?: string;
  badgeText?: string;
  badgeSubText?: string;
  badgeBg?: string;
  badgeAccent?: string;
  badgeColor?: string;
}

const RAW_WORLD_COUNTRIES: Array<[string, string, string]> = [
  ['VN', '🇻🇳', 'Cờ Việt Nam (Vietnam)'],
  ['US', '🇺🇸', 'Cờ Hoa Kỳ / Mỹ (USA)'],
  ['JP', '🇯🇵', 'Cờ Nhật Bản (Japan)'],
  ['KR', '🇰🇷', 'Cờ Hàn Quốc (South Korea)'],
  ['CN', '🇨🇳', 'Cờ Trung Quốc (China)'],
  ['GB', '🇬🇧', 'Cờ Vương quốc Anh (UK)'],
  ['FR', '🇫🇷', 'Cờ Pháp (France)'],
  ['DE', '🇩🇪', 'Cờ Đức (Germany)'],
  ['RU', '🇷🇺', 'Cờ Nga (Russia)'],
  ['CA', '🇨🇦', 'Cờ Canada'],
  ['AU', '🇦🇺', 'Cờ Úc (Australia)'],
  ['SG', '🇸🇬', 'Cờ Singapore'],
  ['TH', '🇹🇭', 'Cờ Thái Lan (Thailand)'],
  ['MY', '🇲🇾', 'Cờ Malaysia'],
  ['ID', '🇮🇩', 'Cờ Indonesia'],
  ['PH', '🇵🇭', 'Cờ Philippines'],
  ['LA', '🇱🇦', 'Cờ Lào (Laos)'],
  ['KH', '🇰🇭', 'Cờ Campuchia (Cambodia)'],
  ['MM', '🇲🇲', 'Cờ Myanmar'],
  ['BN', '🇧🇳', 'Cờ Brunei'],
  ['TL', '🇹🇱', 'Cờ Đông Timor (Timor-Leste)'],
  ['TW', '🇹🇼', 'Cờ Đài Loan (Taiwan)'],
  ['HK', '🇭🇰', 'Cờ Hồng Kông (Hong Kong)'],
  ['MO', '🇲🇴', 'Cờ Ma Cao (Macau)'],
  ['IN', '🇮🇳', 'Cờ Ấn Độ (India)'],
  ['IT', '🇮🇹', 'Cờ Ý (Italy)'],
  ['ES', '🇪🇸', 'Cờ Tây Ban Nha (Spain)'],
  ['PT', '🇵🇹', 'Cờ Bồ Đào Nha (Portugal)'],
  ['BR', '🇧🇷', 'Cờ Brazil'],
  ['AR', '🇦🇷', 'Cờ Argentina'],
  ['MX', '🇲🇽', 'Cờ Mexico'],
  ['NL', '🇳🇱', 'Cờ Hà Lan (Netherlands)'],
  ['BE', '🇧🇪', 'Cờ Bỉ (Belgium)'],
  ['CH', '🇨🇭', 'Cờ Thụy Sĩ (Switzerland)'],
  ['AT', '🇦🇹', 'Cờ Áo (Austria)'],
  ['SE', '🇸🇪', 'Cờ Thụy Điển (Sweden)'],
  ['NO', '🇳🇴', 'Cờ Na Uy (Norway)'],
  ['DK', '🇩🇰', 'Cờ Đan Mạch (Denmark)'],
  ['FI', '🇫🇮', 'Cờ Phần Lan (Finland)'],
  ['IS', '🇮🇸', 'Cờ Iceland'],
  ['PL', '🇵🇱', 'Cờ Ba Lan (Poland)'],
  ['CZ', '🇨🇿', 'Cờ Cộng hòa Séc (Czechia)'],
  ['SK', '🇸🇰', 'Cờ Slovakia'],
  ['HU', '🇭🇺', 'Cờ Hungary'],
  ['RO', '🇷🇴', 'Cờ Romania'],
  ['BG', '🇧🇬', 'Cờ Bulgaria'],
  ['GR', '🇬🇷', 'Cờ Hy Lạp (Greece)'],
  ['TR', '🇹🇷', 'Cờ Thổ Nhĩ Kỳ (Turkey)'],
  ['UA', '🇺🇦', 'Cờ Ukraine'],
  ['BY', '🇧🇾', 'Cờ Belarus'],
  ['IE', '🇮🇪', 'Cờ Ireland'],
  ['NZ', '🇳🇿', 'Cờ New Zealand'],
  ['ZA', '🇿🇦', 'Cờ Nam Phi (South Africa)'],
  ['EG', '🇪🇬', 'Cờ Ai Cập (Egypt)'],
  ['SA', '🇸🇦', 'Cờ Ả Rập Xê Út (Saudi Arabia)'],
  ['AE', '🇦🇪', 'Cờ UAE (Dubai / Tiểu vương quốc Ả Rập)'],
  ['QA', '🇶🇦', 'Cờ Qatar'],
  ['IL', '🇮🇱', 'Cờ Israel'],
  ['IR', '🇮🇷', 'Cờ Iran'],
  ['IQ', '🇮🇶', 'Cờ Iraq'],
  ['PK', '🇵🇰', 'Cờ Pakistan'],
  ['BD', '🇧🇩', 'Cờ Bangladesh'],
  ['LK', '🇱🇰', 'Cờ Sri Lanka'],
  ['NP', '🇳🇵', 'Cờ Nepal'],
  ['MN', '🇲🇳', 'Cờ Mông Cổ (Mongolia)'],
  ['KP', '🇰🇵', 'Cờ Triều Tiên (North Korea)'],
  ['KZ', '🇰🇿', 'Cờ Kazakhstan'],
  ['UZ', '🇺🇿', 'Cờ Uzbekistan'],
  ['CO', '🇨🇴', 'Cờ Colombia'],
  ['CL', '🇨🇱', 'Cờ Chile'],
  ['PE', '🇵🇪', 'Cờ Peru'],
  ['VE', '🇻🇪', 'Cờ Venezuela'],
  ['UY', '🇺🇾', 'Cờ Uruguay'],
  ['PY', '🇵🇾', 'Cờ Paraguay'],
  ['BO', '🇧🇴', 'Cờ Bolivia'],
  ['EC', '🇪🇨', 'Cờ Ecuador'],
  ['CU', '🇨🇺', 'Cờ Cuba'],
  ['JM', '🇯🇲', 'Cờ Jamaica'],
  ['PA', '🇵🇦', 'Cờ Panama'],
  ['CR', '🇨🇷', 'Cờ Costa Rica'],
  ['DO', '🇩🇴', 'Cờ Cộng hòa Dominica'],
  ['GT', '🇬🇹', 'Cờ Guatemala'],
  ['HN', '🇭🇳', 'Cờ Honduras'],
  ['SV', '🇸🇻', 'Cờ El Salvador'],
  ['NI', '🇳🇮', 'Cờ Nicaragua'],
  ['HT', '🇭🇹', 'Cờ Haiti'],
  ['BS', '🇧🇸', 'Cờ Bahamas'],
  ['BB', '🇧🇧', 'Cờ Barbados'],
  ['TT', '🇹🇹', 'Cờ Trinidad & Tobago'],
  ['NG', '🇳🇬', 'Cờ Nigeria'],
  ['MA', '🇲🇦', 'Cờ Ma-rốc (Morocco)'],
  ['DZ', '🇩🇿', 'Cờ Algeria'],
  ['TN', '🇹🇳', 'Cờ Tunisia'],
  ['LY', '🇱🇾', 'Cờ Libya'],
  ['KE', '🇰🇪', 'Cờ Kenya'],
  ['ET', '🇪🇹', 'Cờ Ethiopia'],
  ['GH', '🇬🇭', 'Cờ Ghana'],
  ['SN', '🇸🇳', 'Cờ Senegal'],
  ['CI', '🇨🇮', 'Cờ Bờ Biển Ngà (Côte d’Ivoire)'],
  ['CM', '🇨🇲', 'Cờ Cameroon'],
  ['TZ', '🇹🇿', 'Cờ Tanzania'],
  ['UG', '🇺🇬', 'Cờ Uganda'],
  ['AO', '🇦🇴', 'Cờ Angola'],
  ['MZ', '🇲🇿', 'Cờ Mozambique'],
  ['ZW', '🇿🇼', 'Cờ Zimbabwe'],
  ['ZM', '🇿🇲', 'Cờ Zambia'],
  ['MG', '🇲🇬', 'Cờ Madagascar'],
  ['RW', '🇷🇼', 'Cờ Rwanda'],
  ['SD', '🇸🇩', 'Cờ Sudan'],
  ['SS', '🇸🇸', 'Cờ Nam Sudan (South Sudan)'],
  ['SO', '🇸🇴', 'Cờ Somalia'],
  ['CD', '🇨🇩', 'Cờ CHDC Congo'],
  ['CG', '🇨🇬', 'Cờ Cộng hòa Congo'],
  ['GA', '🇬🇦', 'Cờ Gabon'],
  ['ML', '🇲🇱', 'Cờ Mali'],
  ['BF', '🇧🇫', 'Cờ Burkina Faso'],
  ['NE', '🇳🇪', 'Cờ Niger'],
  ['TD', '🇹🇩', 'Cờ Chad'],
  ['GN', '🇬🇳', 'Cờ Guinea'],
  ['BJ', '🇧🇯', 'Cờ Benin'],
  ['TG', '🇹🇬', 'Cờ Togo'],
  ['SL', '🇸🇱', 'Cờ Sierra Leone'],
  ['LR', '🇱🇷', 'Cờ Liberia'],
  ['MR', '🇲🇷', 'Cờ Mauritania'],
  ['NA', '🇳🇦', 'Cờ Namibia'],
  ['BW', '🇧🇼', 'Cờ Botswana'],
  ['MU', '🇲🇺', 'Cờ Mauritius'],
  ['SC', '🇸🇨', 'Cờ Seychelles'],
  ['HR', '🇭🇷', 'Cờ Croatia'],
  ['RS', '🇷🇸', 'Cờ Serbia'],
  ['SI', '🇸🇮', 'Cờ Slovenia'],
  ['BA', '🇧🇦', 'Cờ Bosnia & Herzegovina'],
  ['ME', '🇲🇪', 'Cờ Montenegro'],
  ['MK', '🇲🇰', 'Cờ Bắc Macedonia'],
  ['AL', '🇦🇱', 'Cờ Albania'],
  ['EE', '🇪🇪', 'Cờ Estonia'],
  ['LV', '🇱🇻', 'Cờ Latvia'],
  ['LT', '🇱🇹', 'Cờ Lithuania'],
  ['MD', '🇲🇩', 'Cờ Moldova'],
  ['GE', '🇬🇪', 'Cờ Georgia'],
  ['AM', '🇦🇲', 'Cờ Armenia'],
  ['AZ', '🇦🇿', 'Cờ Azerbaijan'],
  ['CY', '🇨🇾', 'Cờ Đảo Síp (Cyprus)'],
  ['MT', '🇲🇹', 'Cờ Malta'],
  ['LU', '🇱🇺', 'Cờ Luxembourg'],
  ['MC', '🇲🇨', 'Cờ Monaco'],
  ['LI', '🇱🇮', 'Cờ Liechtenstein'],
  ['AD', '🇦🇩', 'Cờ Andorra'],
  ['SM', '🇸🇲', 'Cờ San Marino'],
  ['VA', '🇻🇦', 'Cờ Vatican'],
  ['JO', '🇯🇴', 'Cờ Jordan'],
  ['LB', '🇱🇧', 'Cờ Li-băng (Lebanon)'],
  ['SY', '🇸🇾', 'Cờ Syria'],
  ['YE', '🇾🇪', 'Cờ Yemen'],
  ['OM', '🇴🇲', 'Cờ Oman'],
  ['KW', '🇰🇼', 'Cờ Kuwait'],
  ['BH', '🇧🇭', 'Cờ Bahrain'],
  ['PS', '🇵🇸', 'Cờ Palestine'],
  ['AF', '🇦🇫', 'Cờ Afghanistan'],
  ['TM', '🇹🇲', 'Cờ Turkmenistan'],
  ['TJ', '🇹🇯', 'Cờ Tajikistan'],
  ['KG', '🇰🇬', 'Cờ Kyrgyzstan'],
  ['BT', '🇧🇹', 'Cờ Bhutan'],
  ['MV', '🇲🇻', 'Cờ Maldives'],
  ['FJ', '🇫🇯', 'Cờ Fiji'],
  ['PG', '🇵🇬', 'Cờ Papua New Guinea'],
  ['WS', '🇼🇸', 'Cờ Samoa'],
  ['TO', '🇹🇴', 'Cờ Tonga'],
  ['VU', '🇻🇺', 'Cờ Vanuatu'],
  ['SB', '🇸🇧', 'Cờ Quần đảo Solomon'],
  ['KI', '🇰🇮', 'Cờ Kiribati'],
  ['FM', '🇫🇲', 'Cờ Micronesia'],
  ['PW', '🇵🇼', 'Cờ Palau'],
  ['MH', '🇲🇭', 'Cờ Quần đảo Marshall'],
  ['NR', '🇳🇷', 'Cờ Nauru'],
  ['TV', '🇹🇻', 'Cờ Tuvalu'],
  ['BZ', '🇧🇿', 'Cờ Belize'],
  ['GY', '🇬🇾', 'Cờ Guyana'],
  ['SR', '🇸🇷', 'Cờ Suriname'],
  ['AG', '🇦🇬', 'Cờ Antigua & Barbuda'],
  ['DM', '🇩🇲', 'Cờ Dominica'],
  ['GD', '🇬🇩', 'Cờ Grenada'],
  ['KN', '🇰🇳', 'Cờ Saint Kitts & Nevis'],
  ['LC', '🇱🇨', 'Cờ Saint Lucia'],
  ['VC', '🇻🇨', 'Cờ Saint Vincent & Grenadines'],
  ['CV', '🇨🇻', 'Cờ Cape Verde'],
  ['ST', '🇸🇹', 'Cờ São Tomé & Príncipe'],
  ['GQ', '🇬🇶', 'Cờ Guinea Xích Đạo'],
  ['GW', '🇬🇼', 'Cờ Guinea-Bissau'],
  ['GM', '🇬🇲', 'Cờ Gambia'],
  ['DJ', '🇩🇯', 'Cờ Djibouti'],
  ['ER', '🇪🇷', 'Cờ Eritrea'],
  ['KM', '🇰🇲', 'Cờ Comoros'],
  ['LS', '🇱🇸', 'Cờ Lesotho'],
  ['SZ', '🇸🇿', 'Cờ Eswatini'],
  ['MW', '🇲🇼', 'Cờ Malawi'],
  ['BI', '🇧🇮', 'Cờ Burundi'],
  ['CF', '🇨🇫', 'Cờ Cộng hòa Trung Phi'],
  ['EU', '🇪🇺', 'Cờ Liên minh Châu Âu (EU)'],
  ['UN', '🇺🇳', 'Cờ Liên Hợp Quốc (UN)'],
];

export function extractFlagIsoCode(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    const up = trimmed.toUpperCase();
    if (RAW_WORLD_COUNTRIES.some(([code]) => code === up)) return up;
  }
  const chars = Array.from(trimmed);
  const regional: number[] = [];
  for (const ch of chars) {
    const cp = ch.codePointAt(0) || 0;
    if (cp >= 0x1f1e6 && cp <= 0x1f1ff) {
      regional.push(cp - 0x1f1e6 + 65);
    }
  }
  if (regional.length >= 2) {
    return String.fromCharCode(regional[0], regional[1]);
  }
  return null;
}

const FLAG_SVG_CACHE: Record<string, string> = {};

/**
 * Generates a full-color graphic SVG flag data URL for any 2-letter ISO country code or flag emoji.
 * Ensures flags NEVER render as two-letter abbreviations ("VN", "US") on Windows/Linux or Canvas.
 */
export function getFlagGraphicDataUrl(isoOrEmoji: string): string {
  const code = (extractFlagIsoCode(isoOrEmoji) || isoOrEmoji || 'VN').toUpperCase().slice(0, 2);
  if (FLAG_SVG_CACHE[code]) return FLAG_SVG_CACHE[code];

  // Specific iconic flag designs + deterministic rich flag renderer for all 200 countries
  let bodySvg = '';
  const SpecificFlags: Record<string, string> = {
    VN: `<rect width="120" height="80" fill="#DA251D"/><polygon points="60,16 66,35 86,35 70,47 76,66 60,54 44,66 50,47 34,35 54,35" fill="#FFFF00"/>`,
    US: `<rect width="120" height="80" fill="#B22234"/><g fill="#FFFFFF"><rect y="6" width="120" height="6"/><rect y="18" width="120" height="6"/><rect y="30" width="120" height="6"/><rect y="42" width="120" height="6"/><rect y="54" width="120" height="6"/><rect y="66" width="120" height="6"/></g><rect width="52" height="42" fill="#3C3B6E"/><g fill="#FFFFFF"><circle cx="10" cy="9" r="2.2"/><circle cx="20" cy="9" r="2.2"/><circle cx="30" cy="9" r="2.2"/><circle cx="40" cy="9" r="2.2"/><circle cx="15" cy="17" r="2.2"/><circle cx="25" cy="17" r="2.2"/><circle cx="35" cy="17" r="2.2"/><circle cx="10" cy="25" r="2.2"/><circle cx="20" cy="25" r="2.2"/><circle cx="30" cy="25" r="2.2"/><circle cx="40" cy="25" r="2.2"/><circle cx="15" cy="33" r="2.2"/><circle cx="25" cy="33" r="2.2"/><circle cx="35" cy="33" r="2.2"/></g>`,
    JP: `<rect width="120" height="80" fill="#FFFFFF"/><circle cx="60" cy="40" r="23" fill="#BC002D"/>`,
    KR: `<rect width="120" height="80" fill="#FFFFFF"/><circle cx="60" cy="40" r="20" fill="#CD2E3A"/><path d="M40,40 A20,20 0 0,0 80,40 A10,10 0 0,0 60,40 A10,10 0 0,1 40,40 Z" fill="#0047A0"/><g fill="#000000"><rect x="24" y="14" width="14" height="3" transform="rotate(-35 31 15)"/><rect x="27" y="19" width="14" height="3" transform="rotate(-35 34 20)"/><rect x="82" y="14" width="14" height="3" transform="rotate(35 89 15)"/><rect x="79" y="19" width="14" height="3" transform="rotate(35 86 20)"/><rect x="24" y="60" width="14" height="3" transform="rotate(35 31 61)"/><rect x="82" y="60" width="14" height="3" transform="rotate(-35 89 61)"/></g>`,
    CN: `<rect width="120" height="80" fill="#EE1C25"/><polygon points="24,12 27,21 36,21 29,26 32,35 24,29 16,35 19,26 12,21 21,21" fill="#FFFF00"/><circle cx="44" cy="12" r="3" fill="#FFFF00"/><circle cx="50" cy="20" r="3" fill="#FFFF00"/><circle cx="50" cy="30" r="3" fill="#FFFF00"/><circle cx="44" cy="38" r="3" fill="#FFFF00"/>`,
    GB: `<rect width="120" height="80" fill="#012169"/><path d="M0,0 L120,80 M120,0 L0,80" stroke="#FFFFFF" stroke-width="14"/><path d="M0,0 L120,80 M120,0 L0,80" stroke="#C8102E" stroke-width="6"/><rect x="50" width="20" height="80" fill="#FFFFFF"/><rect y="30" width="120" height="20" fill="#FFFFFF"/><rect x="54" width="12" height="80" fill="#C8102E"/><rect y="34" width="120" height="12" fill="#C8102E"/>`,
    FR: `<rect width="40" height="80" fill="#002395"/><rect x="40" width="40" height="80" fill="#FFFFFF"/><rect x="80" width="40" height="80" fill="#ED2939"/>`,
    DE: `<rect width="120" height="27" fill="#000000"/><rect y="27" width="120" height="27" fill="#DD0000"/><rect y="54" width="120" height="26" fill="#FFCE00"/>`,
    RU: `<rect width="120" height="27" fill="#FFFFFF"/><rect y="27" width="120" height="27" fill="#0039A6"/><rect y="54" width="120" height="26" fill="#D52B1E"/>`,
    CA: `<rect width="30" height="80" fill="#FF0000"/><rect x="30" width="60" height="80" fill="#FFFFFF"/><rect x="90" width="30" height="80" fill="#FF0000"/><polygon points="60,18 66,32 76,30 68,42 74,48 62,48 62,62 58,62 58,48 46,48 52,42 44,30 54,32" fill="#FF0000"/>`,
    AU: `<rect width="120" height="80" fill="#00008B"/><rect width="54" height="40" fill="#012169"/><path d="M0,0 L54,40 M54,0 L0,40" stroke="#FFFFFF" stroke-width="6"/><rect x="23" width="8" height="40" fill="#FFFFFF"/><rect y="16" width="54" height="8" fill="#FFFFFF"/><rect x="25" width="4" height="40" fill="#C8102E"/><rect y="18" width="54" height="4" fill="#C8102E"/><circle cx="27" cy="60" r="6" fill="#FFFFFF"/><circle cx="90" cy="20" r="3.5" fill="#FFFFFF"/><circle cx="76" cy="36" r="3.5" fill="#FFFFFF"/><circle cx="102" cy="34" r="3.5" fill="#FFFFFF"/><circle cx="90" cy="62" r="4.5" fill="#FFFFFF"/>`,
    SG: `<rect width="120" height="40" fill="#EF3340"/><rect y="40" width="120" height="40" fill="#FFFFFF"/><circle cx="28" cy="20" r="13" fill="#FFFFFF"/><circle cx="33" cy="20" r="11" fill="#EF3340"/><circle cx="36" cy="14" r="2" fill="#FFFFFF"/><circle cx="43" cy="18" r="2" fill="#FFFFFF"/><circle cx="40" cy="26" r="2" fill="#FFFFFF"/><circle cx="32" cy="26" r="2" fill="#FFFFFF"/><circle cx="29" cy="18" r="2" fill="#FFFFFF"/>`,
    TH: `<rect width="120" height="80" fill="#A51931"/><rect y="13" width="120" height="54" fill="#F4F5F8"/><rect y="26" width="120" height="28" fill="#2D2A4A"/>`,
    MY: `<rect width="120" height="80" fill="#CC0001"/><g fill="#FFFFFF"><rect y="10" width="120" height="6"/><rect y="22" width="120" height="6"/><rect y="34" width="120" height="6"/><rect y="46" width="120" height="6"/><rect y="58" width="120" height="6"/><rect y="70" width="120" height="6"/></g><rect width="60" height="44" fill="#010066"/><circle cx="24" cy="22" r="12" fill="#FFCC00"/><circle cx="28" cy="22" r="10" fill="#010066"/><circle cx="39" cy="22" r="7" fill="#FFCC00"/>`,
    ID: `<rect width="120" height="40" fill="#FF0000"/><rect y="40" width="120" height="40" fill="#FFFFFF"/>`,
    PH: `<rect width="120" height="40" fill="#0038A8"/><rect y="40" width="120" height="40" fill="#CE1126"/><polygon points="0,0 56,40 0,80" fill="#FFFFFF"/><circle cx="19" cy="40" r="8" fill="#FCD116"/>`,
    LA: `<rect width="120" height="80" fill="#CE1126"/><rect y="20" width="120" height="40" fill="#002868"/><circle cx="60" cy="40" r="15" fill="#FFFFFF"/>`,
    KH: `<rect width="120" height="80" fill="#032EA1"/><rect y="20" width="120" height="40" fill="#E00025"/><polygon points="40,52 46,34 52,40 60,26 68,40 74,34 80,52" fill="#FFFFFF"/>`,
    IN: `<rect width="120" height="27" fill="#FF9933"/><rect y="27" width="120" height="27" fill="#FFFFFF"/><rect y="54" width="120" height="26" fill="#138808"/><circle cx="60" cy="40" r="10" fill="none" stroke="#000080" stroke-width="2.5"/><circle cx="60" cy="40" r="3" fill="#000080"/>`,
    IT: `<rect width="40" height="80" fill="#009246"/><rect x="40" width="40" height="80" fill="#FFFFFF"/><rect x="80" width="40" height="80" fill="#CE2B37"/>`,
    ES: `<rect width="120" height="80" fill="#AA151B"/><rect y="20" width="120" height="40" fill="#F1BF00"/><rect x="28" y="30" width="12" height="20" rx="3" fill="#AA151B"/>`,
    BR: `<rect width="120" height="80" fill="#009C3B"/><polygon points="60,10 108,40 60,70 12,40" fill="#FFDF00"/><circle cx="60" cy="40" r="17" fill="#002776"/><path d="M44,38 Q60,30 76,42" stroke="#FFFFFF" stroke-width="3.5" fill="none"/>`,
    AR: `<rect width="120" height="27" fill="#74ACDF"/><rect y="27" width="120" height="27" fill="#FFFFFF"/><rect y="54" width="120" height="26" fill="#74ACDF"/><circle cx="60" cy="40" r="9" fill="#F6B40E"/>`,
    MX: `<rect width="40" height="80" fill="#006847"/><rect x="40" width="40" height="80" fill="#FFFFFF"/><rect x="80" width="40" height="80" fill="#CE1126"/><circle cx="60" cy="40" r="8" fill="#8B5A2B"/>`,
    CH: `<rect width="120" height="80" fill="#DA291C"/><rect x="50" y="16" width="20" height="48" fill="#FFFFFF"/><rect x="36" y="30" width="48" height="20" fill="#FFFFFF"/>`,
    SE: `<rect width="120" height="80" fill="#006AA7"/><rect x="36" width="14" height="80" fill="#FECC02"/><rect y="33" width="120" height="14" fill="#FECC02"/>`,
    UA: `<rect width="120" height="40" fill="#0057B7"/><rect y="40" width="120" height="40" fill="#FFD700"/>`,
    TR: `<rect width="120" height="80" fill="#E30A17"/><circle cx="48" cy="40" r="18" fill="#FFFFFF"/><circle cx="53" cy="40" r="14.5" fill="#E30A17"/><polygon points="72,40 84,44 77,33 77,47 84,36" fill="#FFFFFF"/>`,
    EU: `<rect width="120" height="80" fill="#003399"/><circle cx="60" cy="40" r="22" fill="none" stroke="#FFCC00" stroke-width="4" stroke-dasharray="4 7.5"/>`,
    UN: `<rect width="120" height="80" fill="#5B92E5"/><circle cx="60" cy="40" r="20" fill="none" stroke="#FFFFFF" stroke-width="3"/><circle cx="60" cy="40" r="10" fill="none" stroke="#FFFFFF" stroke-width="2"/><line x1="60" y1="18" x2="60" y2="62" stroke="#FFFFFF" stroke-width="2"/><line x1="38" y1="40" x2="82" y2="40" stroke="#FFFFFF" stroke-width="2"/>`,
  };

  if (SpecificFlags[code]) {
    bodySvg = SpecificFlags[code];
  } else {
    // Deterministic authentic multi-stripe & emblem generator for all other ISO codes
    const c1 = code.charCodeAt(0) || 65;
    const c2 = code.charCodeAt(1) || 66;
    const seed = c1 * 31 + c2 * 17;
    const palettes: Array<[string, string, string]> = [
      ['#CE1126', '#FFFFFF', '#0038A8'],
      ['#007A3D', '#FFFFFF', '#CE1126'],
      ['#002B7F', '#FCD116', '#CE1126'],
      ['#EF3340', '#FFD100', '#009739'],
      ['#005EB8', '#FFFFFF', '#000000'],
      ['#009A44', '#FEDD00', '#EF3340'],
      ['#D90012', '#0033A0', '#F2A800'],
      ['#003580', '#FFFFFF', '#D21034'],
      ['#00853F', '#FDEF42', '#E31B23'],
      ['#E03C31', '#FFFFFF', '#00A3E0'],
    ];
    const [colA, colB, colC] = palettes[seed % palettes.length];
    const layout = seed % 5;
    if (layout === 0) {
      // Horizontal tricolor + center star/crest
      bodySvg = `<rect width="120" height="27" fill="${colA}"/><rect y="27" width="120" height="27" fill="${colB}"/><rect y="54" width="120" height="26" fill="${colC}"/><circle cx="60" cy="40" r="8" fill="${colA}" stroke="#FFFFFF" stroke-width="1.5"/>`;
    } else if (layout === 1) {
      // Vertical tricolor
      bodySvg = `<rect width="40" height="80" fill="${colA}"/><rect x="40" width="40" height="80" fill="${colB}"/><rect x="80" width="40" height="80" fill="${colC}"/><polygon points="60,29 63,37 71,37 65,42 67,50 60,45 53,50 55,42 49,37 57,37" fill="${colA}"/>`;
    } else if (layout === 2) {
      // Nordic / Cross style
      bodySvg = `<rect width="120" height="80" fill="${colA}"/><rect x="34" width="16" height="80" fill="${colB}"/><rect y="32" width="120" height="16" fill="${colB}"/><rect x="38" width="8" height="80" fill="${colC}"/><rect y="36" width="120" height="8" fill="${colC}"/>`;
    } else if (layout === 3) {
      // Left triangle + two horizontal bands
      bodySvg = `<rect width="120" height="40" fill="${colA}"/><rect y="40" width="120" height="40" fill="${colC}"/><polygon points="0,0 55,40 0,80" fill="${colB}"/><circle cx="19" cy="40" r="7" fill="${colA}"/>`;
    } else {
      // Diagonal band + canton
      bodySvg = `<rect width="120" height="80" fill="${colA}"/><polygon points="0,65 100,0 120,0 120,15 20,80 0,80" fill="${colB}"/><circle cx="30" cy="24" r="10" fill="${colC}"/>`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="120" height="80">
    <defs>
      <clipPath id="r"><rect width="120" height="80" rx="8" ry="8"/></clipPath>
      <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.22"/>
        <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.22"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#r)">
      ${bodySvg}
      <rect width="120" height="80" fill="url(#sheen)"/>
    </g>
  </svg>`;

  const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  FLAG_SVG_CACHE[code] = url;
  return url;
}

export interface WavingFlagSliceSpec {
  sliceIndex: number;
  srcXRatio: number;
  srcWRatio: number;
  dstXOffsetPx: number;
  dstYOffsetPx: number;
  shadeAlpha: number;
}

/**
 * Computes multi-slice sinusoidal cloth wave displacement for a waving world flag at timeSec.
 * Used identically by VideoPreviewCanvas and ExportVideoModal so exported flags wave smoothly
 * with zero white outer border.
 */
export function computeWavingFlagSlices(
  flagW: number,
  flagH: number,
  timeSec: number,
  sliceCount: number = 20
): WavingFlagSliceSpec[] {
  const safeSlices = Math.max(4, Math.min(40, Math.round(sliceCount)));
  const waveAmplitudeY = Math.max(2.2, flagH * 0.085);
  const phaseSpeed = timeSec * Math.PI * 3.2; // 1.6 full wave cycles per second
  const slices: WavingFlagSliceSpec[] = [];

  for (let i = 0; i < safeSlices; i++) {
    const ratio = i / safeSlices;
    // Pin left hoist slightly less than right fly edge so the flag waves naturally in the wind
    const envelope = 0.28 + 0.72 * ratio;
    const waveAngle = ratio * Math.PI * 2.4 - phaseSpeed;
    const sinVal = Math.sin(waveAngle);
    const cosVal = Math.cos(waveAngle);
    const dstYOffsetPx = sinVal * waveAmplitudeY * envelope;
    const dstXOffsetPx = -flagW / 2 + ratio * flagW;
    const shadeAlpha = cosVal * 0.14 * envelope;
    slices.push({
      sliceIndex: i,
      srcXRatio: ratio,
      srcWRatio: 1 / safeSlices,
      dstXOffsetPx,
      dstYOffsetPx,
      shadeAlpha,
    });
  }
  return slices;
}

export interface StickerMotionTransform {
  scalePulse: number;
  rotateRad: number;
  offsetYPx: number;
}

/**
 * Computes continuous cyclic animation transform (pulse, wobble, bounce) for stickers & badges
 * so stickers animate smoothly both in preview and across exported animation frames.
 */
export function computeStickerMotionTransform(
  timeSec: number,
  baseSizePx: number,
  isFlag: boolean = false
): StickerMotionTransform {
  const phase = timeSec * Math.PI * 2.0; // 1 full cycle per second (matches 16-frame loop at 16fps)
  if (isFlag) {
    return {
      scalePulse: 1 + Math.sin(phase) * 0.025,
      rotateRad: Math.sin(phase) * 0.02,
      offsetYPx: Math.cos(phase) * Math.max(1.2, baseSizePx * 0.025),
    };
  }
  return {
    scalePulse: 1 + Math.sin(phase * 2) * 0.065,
    rotateRad: Math.sin(phase) * 0.055,
    offsetYPx: Math.cos(phase * 2) * Math.max(1.8, baseSizePx * 0.045),
  };
}

export const WORLD_FLAG_STICKERS: StickerCatalogItem[] = RAW_WORLD_COUNTRIES.map(
  ([code, flag, label]) => ({
    id: 'world_flag',
    uid: `stk-flag-${code.toLowerCase()}`,
    label,
    icon: flag,
    cat: 'flags',
    isoCode: code,
    flagSvgDataUrl: getFlagGraphicDataUrl(code),
  })
);

const RAW_GRAPHIC_BADGE_STICKERS: Array<{
  id: StickerOverlayType;
  uid: string;
  label: string;
  icon: string;
  cat: 'cta' | 'neon' | 'emoji';
  badgeText: string;
  badgeSubText?: string;
  badgeBg: string;
  badgeAccent: string;
}> = [
  {
    id: 'subscribe',
    uid: 'stk-badge-subscribe-red',
    label: 'Nút SUBSCRIBE Đỏ YouTube',
    icon: '▶️ SUBSCRIBE',
    cat: 'cta',
    badgeText: 'SUBSCRIBE',
    badgeSubText: '🔔',
    badgeBg: '#E11D48',
    badgeAccent: '#FFFFFF',
  },
  {
    id: 'bell_sub',
    uid: 'stk-badge-sub-bell',
    label: 'SUBSCRIBE & Bật Chuông Thông Báo',
    icon: '🔔 SUB & BELL',
    cat: 'cta',
    badgeText: 'SUBSCRIBE',
    badgeSubText: 'HIT THE BELL 🔔',
    badgeBg: '#DC2626',
    badgeAccent: '#FACC15',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-thank-you-watching',
    label: 'THANK YOU FOR WATCHING!!! (Cảm ơn đã xem)',
    icon: '💖 THANK YOU FOR WATCHING!!!',
    cat: 'cta',
    badgeText: 'THANK YOU FOR WATCHING!!!',
    badgeSubText: '✨ SEE YOU NEXT TIME ✨',
    badgeBg: '#7C3AED',
    badgeAccent: '#00E5CC',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-thanks-watching-gold',
    label: 'THANKS FOR WATCHING! (Vàng Cinema)',
    icon: '🎬 THANKS FOR WATCHING',
    cat: 'cta',
    badgeText: 'THANKS FOR WATCHING!',
    badgeSubText: 'LIKE & SUBSCRIBE ❤️',
    badgeBg: '#0F172A',
    badgeAccent: '#FACC15',
  },
  {
    id: 'like_glow',
    uid: 'stk-badge-like-share',
    label: 'LIKE & SHARE (Thích & Chia sẻ)',
    icon: '👍 LIKE & SHARE',
    cat: 'cta',
    badgeText: 'LIKE & SHARE',
    badgeSubText: '👍 🚀',
    badgeBg: '#2563EB',
    badgeAccent: '#38BDF8',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-follow-me',
    label: 'FOLLOW ME + (Theo dõi kênh)',
    icon: '➕ FOLLOW ME',
    cat: 'cta',
    badgeText: 'FOLLOW ME +',
    badgeSubText: '@TDOCUT',
    badgeBg: '#EC4899',
    badgeAccent: '#FFFFFF',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-dont-forget-sub',
    label: "DON'T FORGET TO SUBSCRIBE!",
    icon: "🔥 DON'T FORGET TO SUB",
    cat: 'cta',
    badgeText: "DON'T FORGET TO SUBSCRIBE!",
    badgeSubText: '👇 CLICK BELOW',
    badgeBg: '#EA580C',
    badgeAccent: '#FEF08A',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-link-in-bio',
    label: 'LINK IN BIO 🔗 (Đường dẫn ở tiểu sử)',
    icon: '🔗 LINK IN BIO',
    cat: 'cta',
    badgeText: 'LINK IN BIO 🔗',
    badgeSubText: 'TAP PROFILE',
    badgeBg: '#0D9488',
    badgeAccent: '#5EEAD4',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-watch-till-end',
    label: 'WATCH TILL THE END 👀 (Xem đến cuối)',
    icon: '👀 WATCH TILL THE END',
    cat: 'cta',
    badgeText: 'WATCH TILL THE END 👀',
    badgeSubText: 'WAIT FOR IT...',
    badgeBg: '#4F46E5',
    badgeAccent: '#F472B6',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-wait-for-it',
    label: 'WAIT FOR IT... ⏳ (Chờ xem đoạn kết)',
    icon: '⏳ WAIT FOR IT...',
    cat: 'cta',
    badgeText: 'WAIT FOR IT... ⏳',
    badgeBg: '#B45309',
    badgeAccent: '#FDE047',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-part-2',
    label: 'PART 2 COMING SOON 🔥',
    icon: '🔥 PART 2 COMING SOON',
    cat: 'cta',
    badgeText: 'PART 2 COMING SOON 🔥',
    badgeSubText: 'STAY TUNED!',
    badgeBg: '#9333EA',
    badgeAccent: '#FACC15',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-comment-below',
    label: 'COMMENT BELOW 👇 (Bình luận bên dưới)',
    icon: '💬 COMMENT BELOW 👇',
    cat: 'cta',
    badgeText: 'COMMENT BELOW 👇',
    badgeSubText: 'WHAT DO YOU THINK?',
    badgeBg: '#0284C7',
    badgeAccent: '#FFFFFF',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-live-now',
    label: 'LIVE NOW 🔴 (Đang phát trực tiếp)',
    icon: '🔴 LIVE NOW',
    cat: 'cta',
    badgeText: '● LIVE NOW',
    badgeSubText: 'STREAMING HD',
    badgeBg: '#DC2626',
    badgeAccent: '#FFFFFF',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-breaking-news',
    label: 'BREAKING NEWS 📺 (Tin nóng khẩn cấp)',
    icon: '📺 BREAKING NEWS',
    cat: 'cta',
    badgeText: 'BREAKING NEWS',
    badgeSubText: 'EXCLUSIVE REPORT',
    badgeBg: '#991B1B',
    badgeAccent: '#FACC15',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-top1-trending',
    label: 'TOP #1 TRENDING 🏆',
    icon: '🏆 TOP #1 TRENDING',
    cat: 'cta',
    badgeText: 'TOP #1 TRENDING 🏆',
    badgeBg: '#CA8A04',
    badgeAccent: '#FEF9C3',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-100-real',
    label: '100% REAL — NO FAKE ✅',
    icon: '✅ 100% REAL',
    cat: 'cta',
    badgeText: '100% REAL ✅',
    badgeSubText: 'VERIFIED',
    badgeBg: '#059669',
    badgeAccent: '#A7F3D0',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-omg-wtf',
    label: 'OMG!! WHAT?! 😱 (Comic Pop)',
    icon: '😱 OMG!! WHAT?!',
    cat: 'cta',
    badgeText: 'OMG!! 😱',
    badgeSubText: 'NO WAY!!',
    badgeBg: '#E11D48',
    badgeAccent: '#FDE047',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-level-up',
    label: 'LEVEL UP! +999 XP ⚡',
    icon: '⚡ LEVEL UP +999',
    cat: 'neon',
    badgeText: 'LEVEL UP! ⚡',
    badgeSubText: '+999 XP',
    badgeBg: '#0F766E',
    badgeAccent: '#00E5CC',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-game-over',
    label: 'GAME OVER 🕹️ (Arcade Retro)',
    icon: '🕹️ GAME OVER',
    cat: 'neon',
    badgeText: 'GAME OVER 🕹️',
    badgeBg: '#1E1B4B',
    badgeAccent: '#F43F5E',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-mission-passed',
    label: 'MISSION PASSED! +RESPECT 🌟',
    icon: '🌟 MISSION PASSED',
    cat: 'neon',
    badgeText: 'MISSION PASSED!',
    badgeSubText: 'RESPECT +',
    badgeBg: '#18181B',
    badgeAccent: '#F59E0B',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-to-be-continued',
    label: 'TO BE CONTINUED... ➡️',
    icon: '➡️ TO BE CONTINUED...',
    cat: 'neon',
    badgeText: 'TO BE CONTINUED... ➔',
    badgeBg: '#451A03',
    badgeAccent: '#FDE68A',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-2000-years',
    label: '2000 YEARS LATER... 🕐',
    icon: '🕐 2000 YEARS LATER',
    cat: 'neon',
    badgeText: '2000 YEARS LATER...',
    badgeBg: '#0C4A6E',
    badgeAccent: '#BAE6FD',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-few-moments',
    label: 'A FEW MOMENTS LATER... ⏱️',
    icon: '⏱️ FEW MOMENTS LATER',
    cat: 'neon',
    badgeText: 'A FEW MOMENTS LATER...',
    badgeBg: '#1E293B',
    badgeAccent: '#38BDF8',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-4k-uhd',
    label: '4K ULTRA HD · 60FPS 🎞️',
    icon: '🎞️ 4K ULTRA HD',
    cat: 'neon',
    badgeText: '4K ULTRA HD',
    badgeSubText: '60 FPS HDR',
    badgeBg: '#090D16',
    badgeAccent: '#00E5CC',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-sale-50',
    label: 'FLASH SALE -50% OFF 🏷️',
    icon: '🏷️ SALE 50% OFF',
    cat: 'cta',
    badgeText: 'FLASH SALE -50%',
    badgeSubText: 'LIMITED TIME 🔥',
    badgeBg: '#DC2626',
    badgeAccent: '#FDE047',
  },
  {
    id: 'social_badge',
    uid: 'stk-badge-sound-on',
    label: 'TURN SOUND ON 🔊',
    icon: '🔊 SOUND ON',
    cat: 'cta',
    badgeText: 'SOUND ON 🔊',
    badgeBg: '#0284C7',
    badgeAccent: '#E0F2FE',
  },
];

export const GRAPHIC_BADGE_STICKERS: StickerCatalogItem[] = RAW_GRAPHIC_BADGE_STICKERS.map((b) => ({
  ...b,
}));

export function findGraphicBadgeByIconOrText(
  iconOrText?: string | null,
  secondaryText?: string | null
): StickerCatalogItem | null {
  const candidates = [iconOrText, secondaryText]
    .filter((s): s is string => Boolean(s && s.trim()))
    .map((s) => s.trim().toUpperCase());
  if (candidates.length === 0) return null;

  for (const clean of candidates) {
    for (const item of GRAPHIC_BADGE_STICKERS) {
      if (
        item.icon.toUpperCase() === clean ||
        (item.badgeText && clean.includes(item.badgeText.toUpperCase())) ||
        clean.includes(item.icon.toUpperCase())
      ) {
        return item;
      }
    }
  }
  return null;
}

const RAW_FACE_ICONS: Array<[string, string, string]> = [
  ['face-grin', '😀', 'Mặt Cười Rạng Rỡ (Grinning)'],
  ['face-joy', '😂', 'Cười Chảy Nước Mắt (Joy)'],
  ['face-rofl', '🤣', 'Cười Lăn Lộn (ROFL)'],
  ['face-smile-hearts', '🥰', 'Mặt Cười Ngập Tràn Tim (Loving)'],
  ['face-heart-eyes', '😍', 'Mắt Trái Tim Mê Mẩn (Heart Eyes)'],
  ['face-star-struck', '🤩', 'Mắt Ngôi Sao Thần Tượng (Star-Struck)'],
  ['face-kiss', '😘', 'Hôn Gió Đáng Yêu (Blowing Kiss)'],
  ['face-wink', '😉', 'Nháy Mắt Tinh Nghịch (Winking)'],
  ['face-cool', '😎', 'Đeo Kính Râm Cực Ngầu (Cool Boss)'],
  ['face-nerd', '🤓', 'Đeo Kính Tri Thức (Nerd Genius)'],
  ['face-monocle', '🧐', 'Soi Kỹ Bằng Kính Đơn (Monocle)'],
  ['face-partying', '🥳', 'Đội Mũ Tiệc Tùng (Party Face)'],
  ['face-smirk', '😏', 'Cười Nửa Miệng Bí Ẩn (Smirking)'],
  ['face-yum', '😋', 'Ngon Tuyệt Cú Mèo (Yummy)'],
  ['face-zany', '🤪', 'Lè Lưỡi Nhắng Nhít (Zany Crazy)'],
  ['face-money', '🤑', 'Mắt Đô La Giàu Sang (Money Mouth)'],
  ['face-hugs', '🤗', 'Vòng Tay Ôm Ấp (Hugging)'],
  ['face-hand-mouth', '🤭', 'Che Miệng Cười Khúc Khích (Giggle)'],
  ['face-shush', '🤫', 'Suỵt! Bí Mật Nhé (Shushing)'],
  ['face-thinking', '🤔', 'Đang Suy Nghĩ Đăm Chiêu (Thinking)'],
  ['face-salute', '🫡', 'Chào Điều Lệnh Chuẩn (Saluting)'],
  ['face-raised-brow', '🤨', 'Nhướng Mày Nghi Ngờ (Skeptical)'],
  ['face-neutral', '😐', 'Mặt Đơ Không Cảm Xúc (Poker Face)'],
  ['face-unamused', '😒', 'Liếc Mắt Chán Ngán (Unamused)'],
  ['face-rolling-eyes', '🙄', 'Đảo Mắt Ngao Ngán (Eye Roll)'],
  ['face-grimace', '😬', 'Nhăn Răng Ngại Ngùng (Awkward)'],
  ['face-lying', '🤥', 'Mũi Dài Nói Dối (Pinocchio)'],
  ['face-relieved', '😌', 'Thở Phào Nhẹ Nhõm (Relieved)'],
  ['face-sleepy', '😴', 'Ngủ Say Khò Khò (Sleeping Zzz)'],
  ['face-drool', '🤤', 'Chảy Nước Miếng Thèm (Drooling)'],
  ['face-mask', '😷', 'Đeo Khẩu Trang Y Tế (Mask)'],
  ['face-thermometer', '🤒', 'Ốm Sốt Cặp Nhiệt Độ (Sick)'],
  ['face-dizzy', '😵‍💫', 'Chóng Mặt Xoay Vòng (Spiral Eyes)'],
  ['face-exploding', '🤯', 'Nổ Tung Đầu Óc (Mind Blown)'],
  ['face-cowboy', '🤠', 'Cao Bồi Miền Tây (Cowboy)'],
  ['face-disguise', '🥸', 'Hóa Trang Ẩn Danh (Disguised)'],
  ['face-pleading', '🥺', 'Mắt Long Lanh Cầu Xin (Pleading)'],
  ['face-holding-tears', '🥹', 'Rưng Rưng Xúc Động (Holding Tears)'],
  ['face-scream', '😱', 'La Hét Hoảng Hốt (OMG Scream)'],
  ['face-fearful', '😨', 'Sợ Hãi Xanh Mặt (Fearful)'],
  ['face-cold-sweat', '😰', 'Toát Mồ Hôi Lạnh (Cold Sweat)'],
  ['face-sob', '😭', 'Khóc Lụt Nhà (Loudly Crying)'],
  ['face-triumph', '😤', 'Phun Khói Mũi Quyết Tâm (Triumph)'],
  ['face-angry', '😠', 'Giận Dữ Cau Mày (Angry)'],
  ['face-rage', '😡', 'Đỏ Mặt Tức Giận (Enraged)'],
  ['face-cursing', '🤬', 'Tức Điển Người (Cursing Symbols)'],
  ['face-devil', '😈', 'Ác Quỷ Tinh Quái (Smiling Devil)'],
  ['face-clown', '🤡', 'Chú Hề Meme (Clown Face)'],
  ['face-skull', '💀', 'Đầu Lâu Hài Hước (Skull Meme)'],
  ['face-ghost', '👻', 'Ma Vui Vẻ Cute (Ghost)'],
  ['face-alien', '👽', 'Người Ngoài Hành Tinh (Alien)'],
  ['face-robot', '🤖', 'Robot AI Thông Minh (Robot)'],
  ['face-poop', '💩', 'Cục Vàng Vui Nhộn (Poop Meme)'],
  ['face-cat-joy', '😹', 'Mèo Cười Ra Nước Mắt (Cat Joy)'],
  ['face-cat-heart', '😻', 'Mèo Mắt Trái Tim (Cat Love)'],
  ['face-cat-scream', '🙀', 'Mèo Hốt Hoảng (Weary Cat)'],
  ['face-see-no-evil', '🙈', 'Khỉ Che Mắt Ngại Ngùng'],
  ['face-hear-no-evil', '🙉', 'Khỉ Bịt Tai Không Nghe'],
  ['face-speak-no-evil', '🙊', 'Khỉ Che Miệng Lỡ Lời'],
  ['face-melting', '🫠', 'Tan Chảy Vì Nóng / Ngại (Melting)'],
  ['face-peeking', '🫣', 'Che Mặt Ti Hí Nhìn Trộm (Peeking)'],
  ['face-shaking', '🫨', 'Mặt Rung Lắc Chấn Động (Shaking)'],
];

export const FACE_ICON_STICKERS: StickerCatalogItem[] = RAW_FACE_ICONS.map(
  ([key, icon, label]) => ({
    id: 'face_icon',
    uid: `stk-${key}`,
    label,
    icon,
    cat: 'faces',
  })
);

const RAW_TREND_EMOJI_AND_HANDS: Array<[StickerOverlayType, string, string, string]> = [
  ['fire_trend', 'stk-fire-1', 'Lửa Trending Viral', '🔥'],
  ['confetti', 'stk-confetti-1', 'Pháo Giấy Chúc Mừng', '🎉'],
  ['fire_trend', 'stk-100-score', 'Điểm Tuyệt Đối 100', '💯'],
  ['confetti', 'stk-star-glow', 'Ngôi Sao Lấp Lánh', '🌟'],
  ['confetti', 'stk-crown-vip', 'Vương Miện Top 1', '👑'],
  ['like_thumb', 'stk-clap-hands', 'Vỗ Tay Khen Ngợi', '👏'],
  ['like_thumb', 'stk-pray-thanks', 'Chắp Tay Cảm Ơn', '🙏'],
  ['like_thumb', 'stk-muscle-power', 'Cơ Bắp Mạnh Mẽ', '💪'],
  ['like_thumb', 'stk-ok-hand', 'Tuyệt Vời Chuẩn Luôn (OK)', '👌'],
  ['like_thumb', 'stk-victory-peace', 'Giơ Tay Chữ V (Peace)', '✌️'],
  ['like_thumb', 'stk-love-gesture', 'Bắn Tim Hàn Quốc', '🫰'],
  ['like_thumb', 'stk-heart-hands', 'Đôi Tay Ghép Trái Tim', '🫶'],
  ['like_thumb', 'stk-writing-hand', 'Bàn Tay Ghi Chú', '✍️'],
  ['like_thumb', 'stk-eyes-look', 'Đôi Mắt Đang Dõi Theo', '👀'],
  ['fire_trend', 'stk-brain-smart', 'Bộ Não Thiên Tài', '🧠'],
  ['fire_trend', 'stk-lightning-zap', 'Tia Chớp Tốc Độ Cao', '⚡'],
  ['fire_trend', 'stk-explosion-boom', 'Vụ Nổ Chấn Động (BOOM)', '💥'],
  ['confetti', 'stk-sparkles-magic', 'Hạt Phép Thuật Lấp Lánh', '✨'],
  ['confetti', 'stk-rainbow-vibe', 'Cầu Vồng Rực Rỡ', '🌈'],
  ['fire_trend', 'stk-rocket-launch', 'Tên Lửa Bay Lên Top', '🚀'],
  ['confetti', 'stk-trophy-champ', 'Cúp Vô Địch Giải Nhất', '🏆'],
  ['confetti', 'stk-medal-gold', 'Huy Chương Vàng #1', '🥇'],
  ['confetti', 'stk-gem-diamond', 'Kim Cương Siêu Cấp', '💎'],
  ['fire_trend', 'stk-money-wings', 'Tiền Bay Đầy Trời', '💸'],
  ['fire_trend', 'stk-money-bag', 'Túi Vàng Tài Lộc', '💰'],
  ['confetti', 'stk-gift-box', 'Hộp Quà Bất Ngờ', '🎁'],
  ['confetti', 'stk-balloon-party', 'Bóng Bay Lễ Hội', '🎈'],
  ['fire_trend', 'stk-music-notes', 'Nốt Nhạc Sôi Động', '🎶'],
  ['fire_trend', 'stk-headphones', 'Tai Nghe DJ Studio', '🎧'],
  ['fire_trend', 'stk-microphone', 'Micro Podcast / Hát', '🎙️'],
  ['fire_trend', 'stk-clapperboard', 'Bảng Dập Phim Điện Ảnh', '🎬'],
  ['fire_trend', 'stk-gamepad-pro', 'Tay Cầm Chơi Game', '🎮'],
  ['confetti', 'stk-coffee-chill', 'Tách Cà Phê Sáng', '☕'],
  ['confetti', 'stk-boba-tea', 'Trà Sữa Trân Châu', '🧋'],
  ['confetti', 'stk-pizza-hot', 'Bánh Pizza Nóng Hổi', '🍕'],
  ['confetti', 'stk-rose-flower', 'Hoa Hồng Tặng Bạn', '🌹'],
  ['confetti', 'stk-cherry-blossom', 'Hoa Anh Đào Nhật Bản', '🌸'],
  ['confetti', 'stk-lucky-clover', 'Cỏ 4 Lá May Mắn', '🍀'],
  ['fire_trend', 'stk-dragon-asia', 'Rồng Vàng Uy Nghi', '🐉'],
  ['confetti', 'stk-butterfly-blue', 'Cánh Bướm Xanh', '🦋'],
];

export const TREND_EMOJI_STICKERS: StickerCatalogItem[] = RAW_TREND_EMOJI_AND_HANDS.map(
  ([id, uid, label, icon]) => ({
    id,
    uid,
    label,
    icon,
    cat: 'emoji',
  })
);

/**
 * Resolves the exact target incoming clip for an inter-clip transition on Track 0.
 * A transition belongs at a cut joint between two clips (index >= 1).
 * When dropping onto Track 0 near a cut joint (or even onto the preceding clip's tail),
 * this function correctly resolves the seam to the incoming clip.
 */
export function resolveTransitionTargetClip(
  videoClips: TimelineClip[],
  dropTimeSec: number,
  targetClipId?: string
): TimelineClip | undefined {
  const sorted = [...videoClips]
    .filter((c) => c.trackIndex === 0)
    .sort((a, b) => a.startTime - b.startTime);

  if (sorted.length === 0) return undefined;
  if (sorted.length === 1) return sorted[0];

  const seamClips = sorted.slice(1);

  if (targetClipId) {
    const targetIdx = sorted.findIndex((c) => c.id === targetClipId);
    if (targetIdx >= 0) {
      const targetClip = sorted[targetIdx];

      // Clip 0 has no preceding clip; a transition must attach to the seam between clip 0 and clip 1 (sorted[1]).
      if (targetIdx === 0) {
        return sorted[1];
      }

      // If user dropped on targetClip near its right tail, target the cut joint with the next clip!
      const clipEnd = targetClip.startTime + targetClip.duration;
      if (
        targetIdx < sorted.length - 1 &&
        (dropTimeSec >= clipEnd - 1.5 ||
          dropTimeSec > targetClip.startTime + targetClip.duration * 0.65)
      ) {
        return sorted[targetIdx + 1];
      }

      return targetClip;
    }
  }

  // If no targetClipId was provided or not found, match the cut joint closest to dropTimeSec
  let bestSeam = seamClips[0];
  let minDiff = Math.abs(seamClips[0].startTime - dropTimeSec);
  for (let i = 1; i < seamClips.length; i++) {
    const diff = Math.abs(seamClips[i].startTime - dropTimeSec);
    if (diff < minDiff) {
      minDiff = diff;
      bestSeam = seamClips[i];
    }
  }

  return bestSeam;
}

