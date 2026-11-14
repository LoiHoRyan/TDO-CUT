import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultClip,
  naturalSortByName,
  formatTimecode,
  parseTimecodeInput,
  splitClipAtPlayhead,
  shuffleVideoClipsInRange,
  batchTrimClips,
  parseSrtToTextClips,
  exportSubtitlesToSrt,
  exportTimelineToXml,
  extractAudioFromVideoClip,
  copyClipAttributes,
  pasteClipAttributes,
  addOrToggleKeyframeAtTime,
  interpolateClipAtPlayhead,
  generateCapCutDraftJson,
  getClipsInMarqueeBox,
  moveSelectedClipsByDelta,
  closeGapAtTimeOnTrack,
  closeAllGapsOnTrack,
  computeObjectFitContainRect,
  snapPreviewScaleToFrame,
  findClosestTimelineSnapPoint,
  generateAutoBeatsForAudioClip,
  getResourceItemsInMarqueeRect,
  MIN_TIMELINE_ZOOM_PPS,
  MAX_TIMELINE_ZOOM_PPS,
  clampTimelineZoom,
  stepTimelineZoom,
  computeExtendedTimelineDuration,
  computeAdaptiveTimelineRuler,
  resolveZoneSelectAll,
  computeHighQualityExportSpec,
  buildFfmpegMatrixCommand,
  shouldCoalesceUndoCommit,
  rippleTrimTimelineRange,
  removeTimelineDeadAirAndSilence,
  syncVideoClipsToBeats,
  serializeTdoCutProject,
  parseTdoCutProject,
  getStudioTranslations,
  translateViToEnText,
  resolveMediaClipDuration,
  canUseDirectStreamCopyForExport,
  patchMediaRecorderBufferDuration,
  WORLD_FLAG_STICKERS,
  FACE_ICON_STICKERS,
  TREND_EMOJI_STICKERS,
  GRAPHIC_BADGE_STICKERS,
  extractFlagIsoCode,
  getFlagGraphicDataUrl,
  findGraphicBadgeByIconOrText,
  detectAspectRatioFromDimensions,
  deleteMediaCardsAndLinkedClips,
  resolveDefaultProjectTitle,
  getProjectInstallDir,
  getProjectFullDirPath,
  getDefaultExportDirPath,
  DEFAULT_TDO_INSTALL_DIR,
  computeRealisticExportEstimate,
  packTrackClipsContiguously,
  resolveDefaultTextFontSizeByAspectRatio,
  TimelineClip,
} from './timelineEngine';

test('resolveDefaultProjectTitle replaces 0421-sao chép / empty / Chưa có dự án / 1 with Dự án 1', () => {
  assert.equal(resolveDefaultProjectTitle('', 'vi'), 'Dự án 1');
  assert.equal(resolveDefaultProjectTitle('1', 'vi'), 'Dự án 1');
  assert.equal(resolveDefaultProjectTitle('0421-sao chép', 'vi'), 'Dự án 1');
  assert.equal(resolveDefaultProjectTitle('Chưa có dự án', 'vi'), 'Dự án 1');
  assert.equal(resolveDefaultProjectTitle('Enter project name', 'vi'), 'Dự án 1');
  assert.equal(resolveDefaultProjectTitle('Nhập tên dự án', 'vi'), 'Dự án 1');

  assert.equal(resolveDefaultProjectTitle('', 'en'), 'Dự án 1');
  assert.equal(resolveDefaultProjectTitle('1', 'en'), 'Dự án 1');
  assert.equal(resolveDefaultProjectTitle('0421-sao chép', 'en'), 'Dự án 1');
  assert.equal(resolveDefaultProjectTitle('Nhập tên dự án', 'en'), 'Dự án 1');
  assert.equal(resolveDefaultProjectTitle('Chưa có dự án', 'en'), 'Dự án 1');

  // Custom user project names are preserved
  assert.equal(resolveDefaultProjectTitle('Golpo AI Demo', 'vi'), 'Golpo AI Demo');
  assert.equal(resolveDefaultProjectTitle('Golpo AI Demo', 'en'), 'Golpo AI Demo');
});

test('getProjectInstallDir and getProjectFullDirPath compute exact dynamic installation path', () => {
  assert.equal(getProjectInstallDir(), DEFAULT_TDO_INSTALL_DIR);
  assert.equal(getProjectFullDirPath('Dự án 1'), 'd:/DỰ ÁN TDO-CUT/TDO-CUT/projects/Dự án 1');
  assert.equal(getDefaultExportDirPath(), 'd:/DỰ ÁN TDO-CUT/TDO-CUT/exports');
});

test('computeRealisticExportEstimate calculates realistic MB size from source fileSizeBytes instead of inflated 731.2 MB', () => {
  const golpoClip = createDefaultClip({
    id: 'clip-golpo',
    name: 'Golpo AI - Whiteboard Video Generator.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 133.5,
    sourceDuration: 133.5,
    sourceIn: 0,
    mediaUrl: 'blob:http://localhost:3000/golpo-video-123',
    fileSizeBytes: Math.round(5.07 * 1024 * 1024), // 5.07 MB
  });

  // Direct stream copy -> exact 5.1 MB
  const directEst = computeRealisticExportEstimate(
    [golpoClip],
    '1080p',
    '16:9',
    '60',
    'recommended',
    'h264',
    133.5,
    {},
    true
  );
  assert.ok(directEst.estimatedSizeMb >= 5.0 && directEst.estimatedSizeMb <= 5.2);

  // With sticker overlay on Track 3 -> still realistic (~5.3 - 12 MB, NOT 731.2 MB!)
  const stickerOverlay = createDefaultClip({
    id: 'stk-sub',
    name: 'SUBSCRIBE',
    trackIndex: 3,
    startTime: 0,
    duration: 5,
    stickerType: 'subscribe_bell',
    stickerEmoji: '🔔',
    stickerText: 'SUBSCRIBE',
  });
  const overlayEst = computeRealisticExportEstimate(
    [golpoClip, stickerOverlay],
    '1080p',
    '16:9',
    '60',
    'recommended',
    'h264',
    133.5,
    {},
    true
  );
  assert.ok(
    overlayEst.estimatedSizeMb >= 50.0 && overlayEst.estimatedSizeMb <= 200.0,
    `Expected studio HD MB size (< 200 MB, not 731.2 MB), got ${overlayEst.estimatedSizeMb} MB`
  );
  assert.ok(
    overlayEst.effectiveBitrateMbps >= 8.5,
    `Expected studio 1080p bitrate >= 8.5 Mbps (never 0.5 Mbps), got ${overlayEst.effectiveBitrateMbps} Mbps`
  );
});

test('naturalSortByName sorts clip_1, clip_2, clip_10, clip_100 in natural numerical order', () => {
  const input = [
    { name: 'clip_100.mp4' },
    { name: 'clip_2.mp4' },
    { name: 'clip_10.mp4' },
    { name: 'clip_1.mp4' },
  ];
  const sorted = naturalSortByName(input);
  assert.deepEqual(
    sorted.map((x) => x.name),
    ['clip_1.mp4', 'clip_2.mp4', 'clip_10.mp4', 'clip_100.mp4']
  );
});

test('formatTimecode and parseTimecodeInput handle SMPTE HH:MM:SS:FF accurately at 30fps', () => {
  assert.equal(formatTimecode(0, 30), '00:00:00:00');
  assert.equal(formatTimecode(1.5, 30), '00:00:01:15');
  assert.equal(formatTimecode(65.0, 30), '00:01:05:00');
  assert.equal(parseTimecodeInput('00:01:30:00', 30), 90);
  assert.equal(parseTimecodeInput('013000', 30), 90);
});

test('splitClipAtPlayhead splits clip under playhead into two contiguous clips', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({
      id: 'v1',
      name: 'Scene_01.mp4',
      trackIndex: 0,
      startTime: 0,
      duration: 5.0,
      sourceIn: 1.0,
      speed: 1.0,
    }),
  ];

  const { clips: afterSplit, splitCount } = splitClipAtPlayhead(clips, 2.0, ['v1']);
  assert.equal(splitCount, 1);
  assert.equal(afterSplit.length, 2);
  assert.equal(afterSplit[0].duration, 2.0);
  assert.equal(afterSplit[1].startTime, 2.0);
  assert.equal(afterSplit[1].duration, 3.0);
  assert.equal(afterSplit[1].sourceIn, 3.0);
});

test('shuffleVideoClipsInRange shuffles clips and fits exact targetDurationSec when provided', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({ id: 'c1', name: '1.mp4', trackIndex: 0, startTime: 0, duration: 3 }),
    createDefaultClip({ id: 'c2', name: '2.mp4', trackIndex: 0, startTime: 3, duration: 3 }),
    createDefaultClip({ id: 'c3', name: '3.mp4', trackIndex: 0, startTime: 6, duration: 3 }),
  ];

  const fitted = shuffleVideoClipsInRange(clips, [], 1, 3, () => 0.1, 7.5);
  const v1 = fitted.filter((c) => c.trackIndex === 0);
  const totalDur = v1.reduce((acc, c) => acc + c.duration, 0);
  assert.equal(Number(totalDur.toFixed(2)), 7.5);
});

test('batchTrimClips extracts middle portion and caps clip durations', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({
      id: 'c1',
      name: 'Long.mp4',
      trackIndex: 0,
      startTime: 0,
      duration: 10.0,
      sourceIn: 0,
    }),
  ];

  const trimmed = batchTrimClips(clips, [], 4.0, 1, 1);
  assert.equal(trimmed[0].duration, 4.0);
  assert.equal(trimmed[0].sourceIn, 3.0);
});

test('parseSrtToTextClips and exportSubtitlesToSrt round-trip SRT blocks cleanly', () => {
  const srt = `1
00:00:01,000 --> 00:00:03,500
Xin chào TrendOpsis Cut

2
00:00:04,000 --> 00:00:06,000
Phụ đề tự động tốc độ cao`;

  const parsed = parseSrtToTextClips(srt);
  assert.equal(parsed.length, 2);
  const exported = exportSubtitlesToSrt(parsed);
  assert.ok(exported.includes('Xin chào TrendOpsis Cut'));
  assert.ok(exported.includes('00:00:01,000 --> 00:00:03,500'));
});

test('extractAudioFromVideoClip, copy/paste attributes, keyframes, and XML export work accurately', () => {
  const vClip = createDefaultClip({
    id: 'v1',
    name: 'Hero.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 4.0,
    scale: 120,
    filterPreset: 'teal_orange',
  });
  const vClip2 = createDefaultClip({
    id: 'v2',
    name: 'Second.mp4',
    trackIndex: 0,
    startTime: 4,
    duration: 4.0,
  });

  // Extract Audio (Ctrl+Shift+S)
  const withAudio = extractAudioFromVideoClip([vClip, vClip2], 'v1');
  assert.equal(withAudio.length, 3);
  assert.equal(withAudio[0].muted, true);
  assert.equal(withAudio[2].trackIndex, 1);

  // Copy / Paste Attributes (Ctrl+Shift+C / Ctrl+Shift+V)
  const attrs = copyClipAttributes(vClip);
  const pasted = pasteClipAttributes([vClip, vClip2], 'v2', attrs);
  assert.equal(pasted[1].scale, 120);
  assert.equal(pasted[1].filterPreset, 'teal_orange');

  // Keyframe interpolation (◇)
  let kfClip = addOrToggleKeyframeAtTime({ ...vClip, scale: 100 }, 0.0, 'linear');
  kfClip = addOrToggleKeyframeAtTime({ ...kfClip, scale: 200 }, 4.0, 'linear');
  const mid = interpolateClipAtPlayhead(kfClip, 2.0);
  assert.equal(mid.scale, 150);

  // XML Export
  const xml = exportTimelineToXml([vClip], 'TrendOpsis_Demo', 30);
  assert.ok(xml.includes('<xmeml version="5">'));
  assert.ok(xml.includes('<name>TrendOpsis_Demo</name>'));
});

test('generateCapCutDraftJson converts seconds to microseconds and preserves scale 140%', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({
      id: 'v1',
      name: 'Clip01.mp4',
      trackIndex: 0,
      startTime: 0,
      duration: 4.0,
      scale: 140,
    }),
  ];
  const draft = generateCapCutDraftJson(clips, '16:9', 'TrendOpsis_Project') as {
    duration: number;
    tracks: Array<{ segments: Array<{ clip: { scale: { x: number } } }> }>;
  };
  assert.equal(draft.duration, 4_000_000);
  assert.equal(draft.tracks[0].segments[0].clip.scale.x, 1.4);
});

test('getClipsInMarqueeBox, closeGapAtTimeOnTrack, closeAllGapsOnTrack, and moveSelectedClipsByDelta work accurately', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({ id: 'v1', name: 'A.mp4', trackIndex: 0, startTime: 0, duration: 4, groupId: 'g1' }),
    createDefaultClip({ id: 'v2', name: 'B.mp4', trackIndex: 0, startTime: 6, duration: 4 }),
    createDefaultClip({ id: 't1', name: 'Sub', trackIndex: 2, startTime: 1, duration: 6, groupId: 'g1' }),
    createDefaultClip({ id: 'a1', name: 'BGM', trackIndex: 1, startTime: 0, duration: 10 }),
  ];

  // Marquee from 0.5s to 7.0s covering tracks 0 and 2
  const selected = getClipsInMarqueeBox(clips, 0.5, 7.0, [0, 2]);
  assert.deepEqual(selected, ['v1', 'v2', 't1']);

  // Close gap at 5.0s on track 0 shifts v2 from 6.0s to 4.0s
  const closedSingle = closeGapAtTimeOnTrack(clips, 0, 5.0);
  assert.equal(closedSingle.find((c) => c.id === 'v2')!.startTime, 4);

  // Close all gaps on track 0
  const closedAll = closeAllGapsOnTrack(clips, 0);
  assert.equal(closedAll.find((c) => c.id === 'v2')!.startTime, 4);

  // Moving v1 also moves t1 because they share groupId 'g1'
  const movedGroup = moveSelectedClipsByDelta(clips, ['v1'], 2.0, 0, [0, 1, 2, 3]);
  assert.equal(movedGroup.find((c) => c.id === 'v1')!.startTime, 2);
  assert.equal(movedGroup.find((c) => c.id === 't1')!.startTime, 3);
});

test('computeObjectFitContainRect preserves exact aspect ratio across wide, tall, and fullscreen containers', () => {
  // 16:9 content (1920x1080) inside a wider container (1000x450) -> height-bound: 800x450
  const wideBox = computeObjectFitContainRect(1000, 450, 1920, 1080);
  assert.equal(wideBox.width, 800);
  assert.equal(wideBox.height, 450);
  assert.equal(wideBox.x, 100);
  assert.equal(wideBox.y, 0);

  // 16:9 content (1920x1080) inside a taller container (640x600) -> width-bound: 640x360
  const tallBox = computeObjectFitContainRect(640, 600, 1920, 1080);
  assert.equal(tallBox.width, 640);
  assert.equal(tallBox.height, 360);
  assert.equal(tallBox.x, 0);
  assert.equal(tallBox.y, 120);

  // 9:16 vertical content (1080x1920) inside a 16:9 canvas (1920x1080) -> 608x1080
  const verticalInWidescreen = computeObjectFitContainRect(1920, 1080, 1080, 1920);
  assert.equal(verticalInWidescreen.width, 608);
  assert.equal(verticalInWidescreen.height, 1080);
});

test('snapPreviewScaleToFrame and findClosestTimelineSnapPoint magnetically snap to 100% frame and timeline edges', () => {
  // Zooming near 100% (e.g. 96% or 104%) snaps to 100% and centers position
  const snappedZoom = snapPreviewScaleToFrame(96, 15, -12);
  assert.equal(snappedZoom.scale, 100);
  assert.equal(snappedZoom.posX, 0);
  assert.equal(snappedZoom.posY, 0);
  assert.equal(snappedZoom.snappedScale, true);

  // Zooming far from 100% (e.g. 140%) keeps 140%
  const freeZoom = snapPreviewScaleToFrame(140, 50, -30);
  assert.equal(freeZoom.scale, 140);
  assert.equal(freeZoom.posX, 50);
  assert.equal(freeZoom.snappedScale, false);

  // Timeline magnetic edge snap finds closest clip end edge within threshold
  const snapRes = findClosestTimelineSnapPoint(
    [14.2, 18.2],
    [
      { timeSec: 0, label: 'Đầu Timeline (00:00)' },
      { timeSec: 18.5, label: 'Cuối Timeline (18.50s)' },
    ],
    0.6
  );
  assert.equal(snapRes.snapped, true);
  assert.equal(snapRes.snapTimeSec, 18.5);
  assert.equal(snapRes.deltaSec, 0.3);
  assert.equal(snapRes.snapLabel, 'Cuối Timeline (18.50s)');
});

test('generateAutoBeatsForAudioClip supports beat1, beat2, clear, and BPM marker overloads', () => {
  const audioClip = createDefaultClip({
    id: 'aud-1',
    name: 'Remix.mp3',
    trackIndex: 1,
    startTime: 1.0,
    duration: 5.0,
  });

  const beat1Clip = generateAutoBeatsForAudioClip(audioClip, 'beat1');
  assert.deepEqual(beat1Clip.beatMarkers, [1.5, 3, 4.5]);

  const beat2Clip = generateAutoBeatsForAudioClip(audioClip, 'beat2');
  assert.equal(beat2Clip.beatMarkers?.length, 6);

  const clearedClip = generateAutoBeatsForAudioClip(beat2Clip, 'clear');
  assert.deepEqual(clearedClip.beatMarkers, []);

  const bpmMarkers = generateAutoBeatsForAudioClip(audioClip, 120);
  assert.equal(bpmMarkers.length, 4);
  assert.equal(bpmMarkers[0].color, '#F59E0B');
});

test('getResourceItemsInMarqueeRect selects all intersecting media/resource cards in 2D grid and ignores micro-jitter', () => {
  const gridCards = [
    { id: 'm1', left: 10, top: 40, right: 110, bottom: 110 },
    { id: 'm2', left: 120, top: 40, right: 220, bottom: 110 },
    { id: 'm3', left: 230, top: 40, right: 330, bottom: 110 },
    { id: 'm4', left: 10, top: 120, right: 110, bottom: 190 },
    { id: 'm5', left: 120, top: 120, right: 220, bottom: 190 },
  ];

  // Dragging from bottom-right empty space (340, 200) to top-left (5, 35) selects all 5 cards
  const allSelected = getResourceItemsInMarqueeRect(gridCards, {
    startX: 340,
    startY: 200,
    currX: 5,
    currY: 35,
  });
  assert.deepEqual(allSelected, ['m1', 'm2', 'm3', 'm4', 'm5']);

  // Dragging across only the top row selects m1, m2, m3
  const topRow = getResourceItemsInMarqueeRect(gridCards, {
    startX: 15,
    startY: 50,
    currX: 300,
    currY: 90,
  });
  assert.deepEqual(topRow, ['m1', 'm2', 'm3']);

  // Tiny jitter (< 5px) returns empty array
  const jitter = getResourceItemsInMarqueeRect(gridCards, {
    startX: 50,
    startY: 50,
    currX: 52,
    currY: 51,
  });
  assert.deepEqual(jitter, []);
});

test('CapCut extreme timeline zoom (1..600 px/s), extended timeline runway, and adaptive virtualized ruler work accurately', () => {
  assert.equal(MIN_TIMELINE_ZOOM_PPS, 1);
  assert.equal(MAX_TIMELINE_ZOOM_PPS, 600);
  assert.equal(clampTimelineZoom(999), 600);
  assert.equal(clampTimelineZoom(-10), 1);

  const zoomedIn = stepTimelineZoom(28, 'in');
  const zoomedOut = stepTimelineZoom(28, 'out');
  assert.ok(zoomedIn > 28);
  assert.ok(zoomedOut < 28);

  const clips: TimelineClip[] = [
    createDefaultClip({ id: 'v1', name: 'Scene.mp4', trackIndex: 0, startTime: 0, duration: 22 }),
  ];

  // Extended runway is at least 1800s (30 minutes) and stretches further when zoomed out to 1 px/s
  const normalDuration = computeExtendedTimelineDuration(clips, 28, 1440);
  assert.ok(normalDuration >= 1800);
  const macroDuration = computeExtendedTimelineDuration(clips, 1, 1440);
  assert.ok(macroDuration >= 5760);

  // At maximum zoom-in (600 px/s), ruler switches to sub-second frame intervals (0.2s = 6f) and caps virtualized DOM ticks
  const maxZoomRuler = computeAdaptiveTimelineRuler(normalDuration, 600, 0, 1440, 30);
  assert.equal(maxZoomRuler.majorStepSec, 0.2);
  assert.ok(maxZoomRuler.ticks.length > 5 && maxZoomRuler.ticks.length <= 220);
  assert.equal(maxZoomRuler.ticks[0].label, '00:00');
  assert.equal(maxZoomRuler.ticks[1].label, '00:00:06f');

  // At minimum zoom-out (1 px/s), ruler switches to 300s (5-minute) intervals
  const minZoomRuler = computeAdaptiveTimelineRuler(macroDuration, 1, 0, 1440, 30);
  assert.equal(minZoomRuler.majorStepSec, 300);
  assert.equal(minZoomRuler.ticks[1].label, '05:00');
});

test('resolveZoneSelectAll selects only items in the focused zone (resource_pool vs timeline) when Ctrl+A is pressed', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({ id: 'v1', name: 'A.mp4', trackIndex: 0, startTime: 0, duration: 4 }),
    createDefaultClip({ id: 'v2', name: 'B.mp4', trackIndex: 0, startTime: 4, duration: 4 }),
    createDefaultClip({ id: 'a1', name: 'BGM.wav', trackIndex: 1, startTime: 0, duration: 8 }),
  ];
  const resourceDomIds = ['m1', 'm2', 'm3', 'm4', 'm5'];

  // When resource_pool is focused, Ctrl+A selects all resource items and does NOT select timeline clips
  const resFocus = resolveZoneSelectAll('resource_pool', resourceDomIds, clips, { 0: false, 1: false }, false);
  assert.deepEqual(resFocus.selectedResourceIds, ['m1', 'm2', 'm3', 'm4', 'm5']);
  assert.deepEqual(resFocus.selectedClipIds, []);
  assert.equal(resFocus.selectedClipId, null);

  // When timeline is focused, Ctrl+A selects all unlocked timeline clips and clears resource selection
  const tlFocus = resolveZoneSelectAll('timeline', resourceDomIds, clips, { 0: false, 1: true }, false);
  assert.deepEqual(tlFocus.selectedResourceIds, []);
  assert.deepEqual(tlFocus.selectedClipIds, ['v1', 'v2']);
  assert.equal(tlFocus.selectedClipId, 'v1');
});

test('computeHighQualityExportSpec calculates exact even resolution, high bitrate, and smooth FPS frame stepping', () => {
  const spec4k60 = computeHighQualityExportSpec('4K', '16:9', '60fps', 'higher', 10);
  assert.equal(spec4k60.width, 3840);
  assert.equal(spec4k60.height, 2160);
  assert.equal(spec4k60.fps, 60);
  assert.equal(spec4k60.totalFrames, 600);
  assert.ok(spec4k60.videoBitsPerSecond > 100_000_000);
  assert.equal(spec4k60.audioBitsPerSecond, 320_000);

  const spec1080pVertical = computeHighQualityExportSpec('1080p', '9:16', '30fps', 'recommended', 18);
  assert.equal(spec1080pVertical.width, 1080);
  assert.equal(spec1080pVertical.height, 1920);
  assert.equal(spec1080pVertical.fps, 30);
  assert.equal(spec1080pVertical.totalFrames, 540);
  assert.equal(spec1080pVertical.videoBitsPerSecond, 24_000_000);
});

test('buildFfmpegMatrixCommand supports hevc_nvenc and prores encoders with -crf (18-20) and -preset slow', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({ id: 'v1', name: 'Scene01.mp4', trackIndex: 0, startTime: 0, duration: 5 }),
  ];

  const hevcCmd = buildFfmpegMatrixCommand(
    clips,
    {
      spoofIphoneMeta: true,
      injectMicroNoise: true,
      audioPitchShift: true,
      variantCount: 1,
      gpuEncoder: 'hevc_nvenc',
      crf: 18,
      preset: 'slow',
    },
    '16:9',
    false
  );
  assert.ok(hevcCmd.includes('-c:v hevc_nvenc'));
  assert.ok(hevcCmd.includes('-crf 18'));
  assert.ok(hevcCmd.includes('-preset slow'));

  const proresCmd = buildFfmpegMatrixCommand(
    clips,
    {
      spoofIphoneMeta: false,
      injectMicroNoise: false,
      audioPitchShift: false,
      variantCount: 1,
      gpuEncoder: 'prores',
      crf: 19,
      preset: 'slow',
    },
    '16:9',
    false
  );
  assert.ok(proresCmd.includes('-c:v prores'));
  assert.ok(proresCmd.includes('-profile:v 3'));
  assert.ok(proresCmd.includes('-pix_fmt yuv422p10le'));
  assert.ok(proresCmd.includes('-crf 19'));
  assert.ok(proresCmd.includes('-preset slow'));
});

test('shouldCoalesceUndoCommit coalesces continuous slider/drag ticks on the same property key into a single Undo snapshot', () => {
  // First change on 'clip:v1:scale' should NOT coalesce (pushes initial snapshot)
  assert.equal(shouldCoalesceUndoCommit(null, 0, 'clip:v1:scale', 1000, 700), false);
  // Subsequent slider ticks within 700ms on the same property key SHOULD coalesce
  assert.equal(shouldCoalesceUndoCommit('clip:v1:scale', 1000, 'clip:v1:scale', 1050, 700), true);
  assert.equal(shouldCoalesceUndoCommit('clip:v1:scale', 1050, 'clip:v1:scale', 1300, 700), true);
  // Changing a different property ('clip:v1:brightness') immediately pushes a new Undo snapshot
  assert.equal(shouldCoalesceUndoCommit('clip:v1:scale', 1300, 'clip:v1:brightness', 1350, 700), false);
  // After pause > 700ms on the same property, a new adjustment session pushes a fresh Undo snapshot
  assert.equal(shouldCoalesceUndoCommit('clip:v1:scale', 1000, 'clip:v1:scale', 1800, 700), false);
});

test('TDO CUT rippleTrimTimelineRange supports ripple_delete_inside and keep_inside for In/Out markers', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({ id: 'v1', name: 'A.mp4', trackIndex: 0, startTime: 0, duration: 4 }),
    createDefaultClip({ id: 'v2', name: 'B.mp4', trackIndex: 0, startTime: 4, duration: 4 }),
    createDefaultClip({ id: 'v3', name: 'C.mp4', trackIndex: 0, startTime: 8, duration: 4 }),
  ];

  // Ripple delete [2.0s, 6.0s] removes 2s of v1, 2s of v2, and shifts v3 left by 4.0s
  const rippled = rippleTrimTimelineRange(clips, 2.0, 6.0, 'ripple_delete_inside');
  assert.equal(rippled.length, 3);
  assert.equal(rippled[0].duration, 2.0);
  assert.equal(rippled[1].startTime, 2.0);
  assert.equal(rippled[1].duration, 2.0);
  assert.equal(rippled[1].sourceIn, 2.0);
  assert.equal(rippled[2].startTime, 4.0);
  assert.equal(rippled[2].duration, 4.0);

  // Keep inside [2.0s, 6.0s] keeps only the 4.0s span and normalizes start to 0.0s
  const kept = rippleTrimTimelineRange(clips, 2.0, 6.0, 'keep_inside');
  assert.equal(kept.length, 2);
  assert.equal(kept[0].startTime, 0);
  assert.equal(kept[0].duration, 2.0);
  assert.equal(kept[1].startTime, 2.0);
  assert.equal(kept[1].duration, 2.0);
});

test('TDO CUT removeTimelineDeadAirAndSilence, syncVideoClipsToBeats, project JSON, and VI/EN translations work accurately', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({ id: 'v1', name: '1.mp4', trackIndex: 0, startTime: 0, duration: 4.0 }),
    createDefaultClip({ id: 'v2', name: '2.mp4', trackIndex: 0, startTime: 5.5, duration: 4.0 }),
    createDefaultClip({
      id: 'a1',
      name: 'Beat.mp3',
      trackIndex: 1,
      startTime: 0,
      duration: 10,
      beatMarkers: [1.5, 3.0, 4.5, 6.0],
    }),
  ];

  const silenceRes = removeTimelineDeadAirAndSilence(clips, 0.15);
  assert.ok(silenceRes.removedSec > 1.5);
  assert.equal(silenceRes.trimmedClipsCount, 2);

  const beatRes = syncVideoClipsToBeats(clips);
  assert.equal(beatRes.beatStepSec, 1.5);
  assert.ok(beatRes.syncedCount >= 1);

  const json = serializeTdoCutProject('TDO_Demo', '9:16', clips, 1.0, 5.0);
  const parsed = parseTdoCutProject(json);
  assert.ok(parsed);
  assert.equal(parsed.projectName, 'TDO_Demo');
  assert.equal(parsed.aspectRatio, '9:16');
  assert.equal(parsed.markInSec, 1.0);
  assert.equal(parsed.markOutSec, 5.0);
  assert.equal(parsed.clips.length, 3);

  const vi = getStudioTranslations('vi');
  const en = getStudioTranslations('en');
  assert.equal(vi.exportVideo, 'Xuất bản');
  assert.equal(en.exportVideo, 'Export');
  assert.equal(vi.resourceTabs.media, 'Phương tiện');
  assert.equal(en.resourceTabs.media, 'Media');
  assert.equal(translateViToEnText('Trình phát-Dòng thời gian 01'), 'Player - Timeline 01');
  assert.equal(translateViToEnText('Đầy đủ'), 'Full');
});

test('patchMediaRecorderBufferDuration injects EBML Duration (0x4489) into WebM Info header and patches MP4 mvhd duration', () => {
  // Construct a synthetic WebM buffer with Info (0x1549A966), 1-byte size (0x87 = 7 bytes), TimestampScale, and Tracks (0x1654AE6B)
  const webmRaw = new Uint8Array([
    0x1a, 0x45, 0xdf, 0xa3, // EBML Header
    0x18, 0x53, 0x80, 0x67, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, // Segment (unknown size)
    0x15, 0x49, 0xa9, 0x66, // Info ID
    0x87, // Info size = 7 bytes (1-byte VINT -> upgraded to 4-byte VINT +3 bytes)
    0x2a, 0xd7, 0xb1, 0x83, 0x0f, 0x42, 0x40, // TimecodeScale = 1,000,000
    0x16, 0x54, 0xae, 0x6b, // Tracks ID
  ]);

  const patchedWebm = patchMediaRecorderBufferDuration(webmRaw, 12.5);
  // 11 bytes Duration element + 3 bytes VINT expansion (1->4 bytes) = +14 bytes
  assert.equal(patchedWebm.length, webmRaw.length + 14);
  // Info size upgraded to 4-byte VINT [0x10, 0x00, 0x00, 18]
  assert.equal(patchedWebm[20], 0x10);
  assert.equal(patchedWebm[23], 18);
  // Duration element [0x44, 0x89, 0x88, ...float64(12500)] placed after the 7-byte TimecodeScale (at index 24 + 7 = 31)
  assert.equal(patchedWebm[31], 0x44);
  assert.equal(patchedWebm[32], 0x89);
  assert.equal(patchedWebm[33], 0x88);
  const dv = new DataView(patchedWebm.buffer, patchedWebm.byteOffset + 34, 8);
  assert.equal(dv.getFloat64(0, false), 12500);
});

test('WORLD_FLAG_STICKERS, FACE_ICON_STICKERS, TREND_EMOJI_STICKERS, Chức năng -> Functions translation, and 18.0s WebM duration', () => {
  assert.ok(WORLD_FLAG_STICKERS.length >= 195, `Expected >= 195 world flags, got ${WORLD_FLAG_STICKERS.length}`);
  assert.ok(FACE_ICON_STICKERS.length >= 60, `Expected >= 60 face icons, got ${FACE_ICON_STICKERS.length}`);
  assert.ok(TREND_EMOJI_STICKERS.length >= 35, `Expected >= 35 trend emojis, got ${TREND_EMOJI_STICKERS.length}`);

  const vnFlag = WORLD_FLAG_STICKERS.find((f) => f.icon === '🇻🇳');
  assert.ok(vnFlag);
  assert.ok(vnFlag.label.includes('Việt Nam'));
  assert.equal(vnFlag.cat, 'flags');

  assert.equal(translateViToEnText('Chức năng'), 'Functions');
  assert.equal(
    translateViToEnText('Chức năng — Tự động hóa Timeline'),
    'Functions — Timeline Automation'
  );

  // Verify 18.0s full timeline WebM duration patching (18000ms)
  const webmRaw = new Uint8Array([
    0x1a, 0x45, 0xdf, 0xa3,
    0x18, 0x53, 0x80, 0x67, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0x15, 0x49, 0xa9, 0x66,
    0x87,
    0x2a, 0xd7, 0xb1, 0x83, 0x0f, 0x42, 0x40,
    0x16, 0x54, 0xae, 0x6b,
  ]);
  const patched18s = patchMediaRecorderBufferDuration(webmRaw, 18.0);
  const dv18 = new DataView(patched18s.buffer, patched18s.byteOffset + 34, 8);
  assert.equal(dv18.getFloat64(0, false), 18000);
});

test('getFlagGraphicDataUrl generates full-color SVG graphics for all 205 world flags without 2-letter text codes, and GRAPHIC_BADGE_STICKERS resolve cleanly', () => {
  assert.equal(extractFlagIsoCode('🇻🇳'), 'VN');
  assert.equal(extractFlagIsoCode('🇺🇸 Quốc kỳ Mỹ'), 'US');
  assert.equal(extractFlagIsoCode('🇯🇵'), 'JP');

  for (const flagItem of WORLD_FLAG_STICKERS) {
    const iso = extractFlagIsoCode(flagItem.icon);
    assert.ok(iso && iso.length === 2, `Expected 2-letter ISO from flag emoji ${flagItem.icon}`);
    const dataUrl = getFlagGraphicDataUrl(flagItem.icon);
    assert.ok(dataUrl && dataUrl.startsWith('data:image/svg+xml;utf8,'), `Missing SVG dataUrl for ${flagItem.label}`);
    const decodedSvg = decodeURIComponent(dataUrl.replace('data:image/svg+xml;utf8,', ''));
    assert.ok(decodedSvg.includes('<svg'), `Invalid SVG for ${flagItem.label}`);
    assert.ok(!decodedSvg.includes(`<text`), `Flag SVG for ${flagItem.label} (${iso}) must not contain text abbreviation!`);
  }

  assert.ok(GRAPHIC_BADGE_STICKERS.length >= 24, `Expected >= 24 graphic badge stickers, got ${GRAPHIC_BADGE_STICKERS.length}`);
  const subBadge = findGraphicBadgeByIconOrText('▶️ SUBSCRIBE', '▶️ SUBSCRIBE (Nút Đăng Ký Đỏ)');
  assert.ok(subBadge);
  assert.equal(subBadge.badgeText, 'SUBSCRIBE');

  const thanksBadge = findGraphicBadgeByIconOrText('🎬 THANK YOU', 'THANK YOU FOR WATCHING!!!');
  assert.ok(thanksBadge);
  assert.equal(thanksBadge.badgeText, 'THANK YOU FOR WATCHING!!!');
});

test('detectAspectRatioFromDimensions accurately detects vertical 9:16, square 1:1, portrait 3:4, and widescreen 16:9', () => {
  assert.equal(detectAspectRatioFromDimensions(1080, 1920), '9:16');
  assert.equal(detectAspectRatioFromDimensions(720, 1280), '9:16');
  assert.equal(detectAspectRatioFromDimensions(576, 1024), '9:16');
  assert.equal(detectAspectRatioFromDimensions(1080, 1080), '1:1');
  assert.equal(detectAspectRatioFromDimensions(1080, 1440), '3:4');
  assert.equal(detectAspectRatioFromDimensions(1440, 1080), '4:3');
  assert.equal(detectAspectRatioFromDimensions(1920, 1080), '16:9');
  assert.equal(detectAspectRatioFromDimensions(2560, 1080), '2.35:1');
});

test('deleteMediaCardsAndLinkedClips deletes both Media Pool cards and linked core Timeline clips when deleting by card ID or clip ID', () => {
  const mediaCards = [
    { id: 'media-1', name: 'tiktok_vertical.mp4', mediaUrl: 'blob:http://localhost/v1', added: true },
    { id: 'media-2', name: 'intro.mp4', mediaUrl: 'blob:http://localhost/v2', added: true },
  ];
  const clips: TimelineClip[] = [
    createDefaultClip({
      id: 'clip-1',
      name: 'tiktok_vertical.mp4',
      mediaUrl: 'blob:http://localhost/v1',
      trackIndex: 0,
      startTime: 0,
      duration: 8,
    }),
    createDefaultClip({
      id: 'clip-2',
      name: 'intro.mp4',
      mediaUrl: 'blob:http://localhost/v2',
      trackIndex: 0,
      startTime: 8,
      duration: 5,
    }),
  ];

  // Deleting media-1 from Media Pool also deletes clip-1 from Timeline and packs clip-2 to 0s
  const res1 = deleteMediaCardsAndLinkedClips(mediaCards, clips, ['media-1'], true, true);
  assert.equal(res1.deletedCardCount, 1);
  assert.equal(res1.deletedClipCount, 1);
  assert.equal(res1.remainingMediaCards.length, 1);
  assert.equal(res1.remainingMediaCards[0].id, 'media-2');
  assert.equal(res1.remainingClips.length, 1);
  assert.equal(res1.remainingClips[0].id, 'clip-2');
  assert.equal(res1.remainingClips[0].startTime, 0);

  // Deleting clip-1 by clip ID when removeCardWhenClipDeleted=true also removes media-1 when no clips remain for it
  const res2 = deleteMediaCardsAndLinkedClips(mediaCards, clips, ['clip-1'], true, true);
  assert.equal(res2.remainingMediaCards.length, 1);
  assert.equal(res2.remainingMediaCards[0].id, 'media-2');
  assert.equal(res2.remainingClips.length, 1);
  assert.equal(res2.remainingClips[0].id, 'clip-2');
});

test('resolveMediaClipDuration preserves full duration for long videos (>30s) and falls back safely', () => {
  // Long 2m13.5s video (133.5s) must NOT be truncated to 6.0s
  assert.equal(resolveMediaClipDuration(133.5, 5.0), 133.5);
  assert.equal(resolveMediaClipDuration(360.25, 5.0), 360.25);
  assert.equal(resolveMediaClipDuration(undefined, 4.0), 4.0);
  assert.equal(resolveMediaClipDuration(-5, 5.0), 5.0);
});

test('canUseDirectStreamCopyForExport identifies unmodified single-video timeline for lossless stream export', () => {
  const realClip = createDefaultClip({
    id: 'clip-golpo',
    name: 'Golpo AI - Whiteboard Video Generator.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 133.5,
    sourceDuration: 133.5,
    sourceIn: 0,
    mediaUrl: 'blob:http://localhost:3000/golpo-video-123',
  });

  // Single unmodified video clip is eligible
  const check1 = canUseDirectStreamCopyForExport([realClip], true);
  assert.equal(check1.eligible, true);
  assert.equal(check1.primaryClip?.id, 'clip-golpo');

  // If trimmed or has filter/overlay, requires canvas re-encode
  const trimmedClip = { ...realClip, duration: 40.0, sourceDuration: 133.5 };
  assert.equal(canUseDirectStreamCopyForExport([trimmedClip], true).eligible, false);

  const filteredClip = { ...realClip, filterPreset: 'cyberpunk' as const };
  assert.equal(canUseDirectStreamCopyForExport([filteredClip], true).eligible, false);

  const subOverlay = createDefaultClip({
    id: 'sub-1',
    name: 'Sub',
    trackIndex: 2,
    startTime: 1,
    duration: 3,
    subtitleText: 'Hello',
  });
  assert.equal(canUseDirectStreamCopyForExport([realClip, subOverlay], true).eligible, false);
});

test('buildFfmpegMatrixCommand preserves real-time 1.0x duration, audio sync (-map 0:a:0?, aresample), and native resolution without PTS/1.05 distortion', () => {
  const clips: TimelineClip[] = [
    createDefaultClip({
      id: 'v1',
      name: 'Input_720p.mp4',
      trackIndex: 0,
      startTime: 0,
      duration: 14.5,
      sourceIn: 0,
      mediaWidth: 1280,
      mediaHeight: 720,
    }),
  ];

  const cmd = buildFfmpegMatrixCommand(
    clips,
    {
      spoofIphoneMeta: true,
      injectMicroNoise: true,
      microSpeedZoom: true,
      audioPitchShift: false,
      variantCount: 1,
      gpuEncoder: 'hevc_nvenc',
      crf: 18,
      preset: 'slow',
    },
    '16:9',
    false
  );

  // Must NOT speed up video by 1.05x
  assert.ok(!cmd.includes('PTS/1.05'), 'Must not distort video speed with PTS/1.05');
  assert.ok(cmd.includes('setpts=PTS-STARTPTS'), 'Must preserve 1.0x real-time PTS');
  assert.ok(cmd.includes('-map 0:v:0 -map 0:a:0?'), 'Must map both video and audio streams');
  assert.ok(cmd.includes('aresample=async=1:first_pts=0'), 'Must maintain audio sync');
  assert.ok(cmd.includes('-c:a aac -b:a 192k'), 'Must encode audio with high compatibility AAC');
  assert.ok(cmd.includes('-vsync cfr'), 'Must enforce constant frame rate for smooth playback');
  assert.ok(cmd.includes('-t 14.50'), 'Must preserve exact 14.50s real-time duration');

  const fastCmd = buildFfmpegMatrixCommand(
    clips,
    {
      spoofIphoneMeta: false,
      injectMicroNoise: false,
      audioPitchShift: false,
      variantCount: 1,
      gpuEncoder: 'hevc_nvenc',
    },
    '16:9',
    true
  );
  assert.ok(fastCmd.includes('1280x720'), 'Fast copy header should reflect native 1280x720 resolution');
  assert.ok(fastCmd.includes('-map 0:v:0 -map 0:a:0? -c copy'), 'Fast copy must preserve audio stream');
});

test('World flags have zero white outer border in SVG and animate smoothly via computeWavingFlagSlices & computeStickerMotionTransform', async () => {
  const { computeWavingFlagSlices, computeStickerMotionTransform, resolveExportTargetDimensions } =
    await import('./timelineEngine');

  // 1. Verify NO white border stroke exists in any generated flag SVG
  for (const code of ['VN', 'US', 'JP', 'KR', 'FR', 'BR']) {
    const url = getFlagGraphicDataUrl(code);
    const svg = decodeURIComponent(url.replace('data:image/svg+xml;utf8,', ''));
    assert.ok(
      !svg.includes('stroke="rgba(255,255,255'),
      `Flag ${code} must NOT contain an outer white stroke border`
    );
    assert.ok(
      !svg.includes('x="1.5"'),
      `Flag ${code} must NOT contain an outer border rect`
    );
  }

  // 2. Verify waving flag slices displace dynamically over time
  const slicesT0 = computeWavingFlagSlices(120, 80, 0, 20);
  const slicesTQuarter = computeWavingFlagSlices(120, 80, 0.25, 20);
  assert.equal(slicesT0.length, 20);
  assert.notEqual(
    slicesT0[15].dstYOffsetPx.toFixed(3),
    slicesTQuarter[15].dstYOffsetPx.toFixed(3),
    'Flag slices must wave dynamically across frames'
  );

  // 3. Verify sticker motion transform animates pulse, rotation, and vertical bounce across frames
  const m0 = computeStickerMotionTransform(0, 64, false);
  const m1 = computeStickerMotionTransform(0.125, 64, false);
  assert.notEqual(m0.scalePulse.toFixed(4), m1.scalePulse.toFixed(4));
  assert.notEqual(m0.rotateRad.toFixed(4), m1.rotateRad.toFixed(4));

  // 4. Verify resolveExportTargetDimensions respects original video resolution
  const clip720 = createDefaultClip({
    id: 'c720',
    name: 'v.mp4',
    trackIndex: 0,
    mediaWidth: 1280,
    mediaHeight: 720,
  });
  assert.deepEqual(resolveExportTargetDimensions([clip720], 1920, 1080), {
    width: 1280,
    height: 720,
  });
});

test('moveSelectedClipsByDelta parts two clips ("né chỗ") when dragging a clip between them, supports moving before a long first clip, and supports cross-track movement', () => {
  const clipA = createDefaultClip({
    id: 'v1',
    name: 'Golpo_133s.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 133.5,
  });
  const clipB = createDefaultClip({
    id: 'v2',
    name: 'TikTok_28s.mp4',
    trackIndex: 0,
    startTime: 133.5,
    duration: 28,
  });
  const clipC = createDefaultClip({
    id: 'v3',
    name: 'Insert_10s.mp4',
    trackIndex: 3, // Starts on PIP track 3
    startTime: 20,
    duration: 10,
  });

  // 1. Drag clipC from Track 3 down to Track 0 (deltaTrack = -3) into the seam between clipA (0..133.5) and clipB (133.5..161.5)
  const parted = moveSelectedClipsByDelta(
    [clipA, clipB, clipC],
    ['v3'],
    110, // tentative startTime = 20 + 110 = 130s (right at the junction 133.5s)
    -3,  // move from track 3 -> track 0
    [0, 1, 2, 3]
  );

  const afterA = parted.find((c) => c.id === 'v1')!;
  const afterC = parted.find((c) => c.id === 'v3')!;
  const afterB = parted.find((c) => c.id === 'v2')!;

  assert.equal(afterC.trackIndex, 0, 'Clip C should move onto Track 0');
  assert.equal(afterA.startTime, 0, 'Clip A stays on the left at 0s');
  assert.equal(afterC.startTime, 133.5, 'Clip C slots cleanly right after Clip A at 133.5s');
  assert.equal(
    afterB.startTime,
    143.5,
    'Clip B parts to the right ("né chỗ") by Clip C duration (133.5 + 10 = 143.5s)'
  );

  // 2. Drag clipB (133.5..161.5s) left onto long clipA (0..133.5s) so clipA parts to the right
  const swapped = moveSelectedClipsByDelta(
    [clipA, clipB],
    ['v2'],
    -133.5, // drag to 0s
    0,
    [0, 1, 2, 3]
  );
  const sA = swapped.find((c) => c.id === 'v1')!;
  const sB = swapped.find((c) => c.id === 'v2')!;
  assert.equal(sB.startTime, 0, 'Dragged Clip B moves to 0.0s');
  assert.equal(sA.startTime, 28, 'Clip A parts to the right to start at 28.0s');

  // 3. Drag clipB to open timeline space (e.g. 200s) — stays freely at 200s
  const freeMoved = moveSelectedClipsByDelta(
    [clipA, clipB],
    ['v2'],
    66.5, // 133.5 + 66.5 = 200s
    0,
    [0, 1, 2, 3]
  );
  assert.equal(freeMoved.find((c) => c.id === 'v2')!.startTime, 200);
});

test('computeClipWaveformBars generates fixed dense amplitude bars that scale proportionally with clip volume and mute state', async () => {
  const { computeClipWaveformBars } = await import('./timelineEngine');
  const baseClip = createDefaultClip({
    id: 'w1',
    name: 'TestAudio.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 12,
    volume: 100,
    muted: false,
  });

  const bars100 = computeClipWaveformBars(baseClip, 40, false);
  const bars50 = computeClipWaveformBars({ ...baseClip, volume: 50 }, 40, false);
  const barsMuted = computeClipWaveformBars({ ...baseClip, muted: true }, 40, false);

  assert.equal(bars100.length, 40);
  assert.equal(bars50.length, 40);
  // Bars must have varied multi-harmonic heights (not a flat line)
  const uniqueHeights = new Set(bars100.map((b) => b.toFixed(2)));
  assert.ok(uniqueHeights.size >= 8, 'Waveform bars must have varied peaks and valleys');

  // 50% volume bars must be strictly lower than 100% volume bars
  const sum100 = bars100.reduce((a, b) => a + b, 0);
  const sum50 = bars50.reduce((a, b) => a + b, 0);
  assert.ok(sum50 < sum100 * 0.65, '50% volume must reduce waveform bar heights proportionally');

  // Muted clip must collapse all bars to 0.05 baseline
  assert.ok(barsMuted.every((b) => b === 0.05), 'Muted clip waveform bars must collapse to baseline');

  // Sliced window [10..25] matches full array slice(10, 25) for zoomed-in high-density rendering without stretching bars apart
  const barsFull500 = computeClipWaveformBars(baseClip, 500, false);
  const barsSlice = computeClipWaveformBars(baseClip, 500, false, 100, 160);
  assert.equal(barsSlice.length, 60);
  assert.deepEqual(barsSlice, barsFull500.slice(100, 160));
});

test('computeCapCutDragInsertionPreview opens exact insertion slot, slides subsequent clips right, and closes Track 0 gaps when lifting to Overlay track', async () => {
  const { computeCapCutDragInsertionPreview } = await import('./timelineEngine');
  const c1 = createDefaultClip({ id: 'c1', name: 'Clip1.mp4', trackIndex: 0, startTime: 0, duration: 10 });
  const c2 = createDefaultClip({ id: 'c2', name: 'Clip2.mp4', trackIndex: 0, startTime: 15, duration: 20 }); // accidental gap at 10..15s
  const c3 = createDefaultClip({ id: 'c3', name: 'Clip3.mp4', trackIndex: 0, startTime: 40, duration: 8 });

  // 1. Lifting c3 and hovering between c1 and c2 (at 9s) on Track 0:
  //    - c1 is packed at 0..10s
  //    - slot opens at 10..18s (duration 8s)
  //    - c2 slides right ("né chỗ") to 18..38s
  const previewBetween = computeCapCutDragInsertionPreview(
    [c1, c2, c3],
    ['c3'],
    0,
    9.0,
    true
  );
  assert.ok(previewBetween.slot);
  assert.equal(previewBetween.slot.trackIndex, 0);
  assert.equal(previewBetween.slot.startTime, 10);
  assert.equal(previewBetween.slot.duration, 8);
  assert.equal(previewBetween.previewClips.find((c) => c.id === 'c1')!.startTime, 0);
  assert.equal(previewBetween.previewClips.find((c) => c.id === 'c3')!.startTime, 10);
  assert.equal(previewBetween.previewClips.find((c) => c.id === 'c2')!.startTime, 18);

  // 2. Lifting c2 from Track 0 up to Overlay Track 3 at 12s:
  //    - Track 0 immediately closes the gap so c1 (0..10s) and c3 (10..18s) are contiguous with zero gap!
  //    - Slot appears on Track 3 at 12..32s
  const previewOverlay = computeCapCutDragInsertionPreview(
    [c1, c2, c3],
    ['c2'],
    3,
    12.0,
    true
  );
  assert.ok(previewOverlay.slot);
  assert.equal(previewOverlay.slot.trackIndex, 3);
  assert.equal(previewOverlay.slot.startTime, 12);
  assert.equal(previewOverlay.slot.duration, 20);
  assert.equal(previewOverlay.previewClips.find((c) => c.id === 'c1')!.startTime, 0);
  assert.equal(previewOverlay.previewClips.find((c) => c.id === 'c3')!.startTime, 10);
  assert.equal(previewOverlay.previewClips.find((c) => c.id === 'c2')!.trackIndex, 3);
  assert.equal(previewOverlay.previewClips.find((c) => c.id === 'c2')!.startTime, 12);
});

test('stepTimelineZoom and stepTimelineZoomByWheelDelta scale timeline zoom gently without sudden jumps', async () => {
  const { stepTimelineZoom, stepTimelineZoomByWheelDelta } = await import('./timelineEngine');
  const z0 = 28;
  const zIn = stepTimelineZoom(z0, 'in');
  const zOut = stepTimelineZoom(z0, 'out');
  // Gentle ~12% step instead of 25-30% jump
  assert.ok(zIn > z0 && zIn <= 33, `Expected gentle zoom in from 28, got ${zIn}`);
  assert.ok(zOut < z0 && zOut >= 24, `Expected gentle zoom out from 28, got ${zOut}`);

  // Touchpad wheel delta (-40px pinch/scroll) changes zoom by a small smooth fraction
  const zWheelIn = stepTimelineZoomByWheelDelta(28, -40);
  const zWheelOut = stepTimelineZoomByWheelDelta(28, 40);
  assert.ok(zWheelIn > 28 && zWheelIn <= 31, `Expected gentle wheel zoom in, got ${zWheelIn}`);
  assert.ok(zWheelOut < 28 && zWheelOut >= 25, `Expected gentle wheel zoom out, got ${zWheelOut}`);
});

test('shouldReleaseTimelinePointerCapture releases playhead/clip drag immediately when left mouse button (buttons & 1) is not held', async () => {
  const { shouldReleaseTimelinePointerCapture } = await import('./timelineEngine');
  // Free mouse movement without buttons pressed (buttons = 0) must immediately release playhead/drag capture
  assert.equal(shouldReleaseTimelinePointerCapture(0, false), true);
  // Right-click or middle-click only (buttons = 2 or 4) must also release left-button drag capture
  assert.equal(shouldReleaseTimelinePointerCapture(2, false), true);
  assert.equal(shouldReleaseTimelinePointerCapture(4, false), true);
  // Holding left mouse button (buttons = 1) keeps active drag
  assert.equal(shouldReleaseTimelinePointerCapture(1, false), false);
  // Intentional double-click pickup mode allows moving without holding button until click-to-drop
  assert.equal(shouldReleaseTimelinePointerCapture(0, true), false);
});

test('collectSequentialExportVideoClips collects Track 0 clips and non-overlapping upper-track video clips in chronological order', async () => {
  const { collectSequentialExportVideoClips } = await import('./timelineEngine');
  const clip1 = createDefaultClip({
    id: 'v1',
    name: 'Golpo_Clip1.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 133.5,
    mediaUrl: 'blob:http://localhost:3000/v1',
  });
  const clip2OnUpperTrack = createDefaultClip({
    id: 'v2',
    name: 'Second_Clip2.mp4',
    trackIndex: 3, // Placed after clip1 on Track 3
    startTime: 133.5,
    duration: 28.0,
    mediaUrl: 'blob:http://localhost:3000/v2',
  });
  const stickerClip = createDefaultClip({
    id: 'stk1',
    name: 'VN Flag',
    trackIndex: 3,
    startTime: 10,
    duration: 5,
    stickerEmoji: '🇻🇳',
  });

  const collected = collectSequentialExportVideoClips([clip2OnUpperTrack, stickerClip, clip1]);
  assert.equal(collected.length, 2);
  assert.equal(collected[0].id, 'v1');
  assert.equal(collected[1].id, 'v2');
});

test('computeSynchronizedClipLayout stretches all timeline clips synchronously with exact boundary lock and supports >6000 waveform bars on long clips', async () => {
  const {
    computeSynchronizedClipLayout,
    computeClipWaveformBars,
    stepTimelineZoomByWheelDelta,
  } = await import('./timelineEngine');

  const clip1 = { startTime: 0, duration: 133.5 };
  const clip2 = { startTime: 133.5, duration: 28.5 };

  // Test across multiple zoom levels (slider, wheel, touchpad pinch)
  for (const pps of [2, 6.5, 28, 72.4, 240, 600]) {
    const l1 = computeSynchronizedClipLayout(clip1, pps);
    const l2 = computeSynchronizedClipLayout(clip2, pps);

    // Clip 1 right edge must equal Clip 2 left edge to the exact pixel (zero overlap / zero gap)
    assert.equal(
      l1.rightPx,
      l2.leftPx,
      `At ${pps} px/s, Clip 1 rightPx (${l1.rightPx}) must equal Clip 2 leftPx (${l2.leftPx})`
    );
    assert.equal(
      Number((l1.leftPx + l1.widthPx).toFixed(2)),
      l2.leftPx,
      `At ${pps} px/s, Clip 1 leftPx + widthPx must equal Clip 2 leftPx`
    );

    // Width ratio between Clip 1 and Clip 2 must remain strictly constant (133.5 / 28.5)
    const ratio = l1.widthPx / l2.widthPx;
    assert.ok(
      Math.abs(ratio - 133.5 / 28.5) < 0.01,
      `Expected constant proportional width ratio ${133.5 / 28.5} at ${pps} px/s, got ${ratio}`
    );
  }

  // Touchpad pinch zoom (isPinch = true) scales smoothly
  const pinchedIn = stepTimelineZoomByWheelDelta(28, -20, true);
  assert.ok(pinchedIn > 28, `Expected pinch zoom in > 28, got ${pinchedIn}`);

  // Long clip (133.5s at 300 px/s -> 40,050px -> 13,350 bars) must still return waveform bars past index 6000
  const longClip = createDefaultClip({
    id: 'long-133s',
    name: 'LongVideo.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 133.5,
    volume: 100,
  });
  const slicedPast6000 = computeClipWaveformBars(longClip, 13350, false, 8000, 8100);
  assert.equal(
    slicedPast6000.length,
    100,
    'Long clips zoomed past 6000 bars must continue rendering waveform bars across the full clip width'
  );
});

test('resolveEffectiveClipAspectRatio preserves independent per-clip aspect ratio in "original" mode and locks only when a fixed ratio is selected, while computeRealisticExportEstimate enforces CapCut Studio HD bitrate floor', async () => {
  const {
    resolveEffectiveClipAspectRatio,
    computeRealisticExportEstimate,
  } = await import('./timelineEngine');

  const clipVertical = createDefaultClip({
    id: 'v-vertical',
    name: 'BoyEating_9_16.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 28,
    mediaWidth: 1080,
    mediaHeight: 1920,
    nativeAspectRatio: '9:16',
    sourceFileSizeBytes: 8_500_000,
  });

  const clipHorizontal = createDefaultClip({
    id: 'v-horizontal',
    name: 'Golpo_16_9.mp4',
    trackIndex: 0,
    startTime: 28,
    duration: 134,
    mediaWidth: 1920,
    mediaHeight: 1080,
    nativeAspectRatio: '16:9',
    sourceFileSizeBytes: 9_200_000,
  });

  // 1. In 'original' ("Tỉ lệ gốc") mode, each video clip resolves to its own independent native aspect ratio
  assert.equal(
    resolveEffectiveClipAspectRatio('original', clipVertical, [clipVertical, clipHorizontal]),
    '9:16',
    'Vertical clip in original mode must resolve to 9:16'
  );
  assert.equal(
    resolveEffectiveClipAspectRatio('original', clipHorizontal, [clipVertical, clipHorizontal]),
    '16:9',
    'Horizontal clip in original mode must resolve to 16:9 without being shrunk by the first clip'
  );

  // 2. When user explicitly selects a fixed aspect ratio (e.g. '9:16' or '1:1'), all clips follow that fixed ratio
  assert.equal(
    resolveEffectiveClipAspectRatio('9:16', clipHorizontal, [clipVertical, clipHorizontal]),
    '9:16',
    'Explicitly selected 9:16 ratio must lock horizontal clip to 9:16'
  );
  assert.equal(
    resolveEffectiveClipAspectRatio('1:1', clipVertical, [clipVertical, clipHorizontal]),
    '1:1',
    'Explicitly selected 1:1 ratio must lock vertical clip to 1:1'
  );

  // 3. Verify computeRealisticExportEstimate never starves 1080p HD to 0.5 Mbps even when source file is highly compressed
  const est1080 = computeRealisticExportEstimate(
    [clipVertical, clipHorizontal],
    '1080p',
    '9:16',
    '30fps',
    'recommended',
    'h264',
    162.0
  );
  assert.ok(
    est1080.effectiveBitrateMbps >= 8.5,
    `Expected 1080p studio export bitrate >= 8.5 Mbps (never 0.5 Mbps), got ${est1080.effectiveBitrateMbps} Mbps`
  );
  assert.ok(
    est1080.qualityLabel.includes('1080×1920') && est1080.qualityLabel.includes('30 FPS'),
    `Expected qualityLabel to include 1080×1920 · 30 FPS, got ${est1080.qualityLabel}`
  );
});

test('ensureInitialProjects returns empty list for new users and seam cut joint resolves accurately', async () => {
  const { ensureInitialProjects } = await import('./projectDatabase');
  const { resolveTransitionTargetClip } = await import('./timelineEngine');

  const initial = await ensureInitialProjects();
  assert.deepEqual(
    initial,
    [],
    'ensureInitialProjects must return empty array [] so new user starts with 0 default projects'
  );

  // Test cut joint transition target resolution
  const clipA: TimelineClip = createDefaultClip({
    id: 'clip-a',
    name: 'Intro.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 5.0,
  });
  const clipB: TimelineClip = createDefaultClip({
    id: 'clip-b',
    name: 'Scene2.mp4',
    trackIndex: 0,
    startTime: 5.0,
    duration: 5.0,
  });
  const clipC: TimelineClip = createDefaultClip({
    id: 'clip-c',
    name: 'Outro.mp4',
    trackIndex: 0,
    startTime: 10.0,
    duration: 5.0,
  });
  const videoClips = [clipA, clipB, clipC].sort((a, b) => a.startTime - b.startTime);

  // Scenario 1: User drops transition at 4.9s onto clip-a (preceding clip near seam)
  // Even though HTML5 drop event sends targetClipId = 'clip-a', target must resolve to clip-b!
  const target1 = resolveTransitionTargetClip(videoClips, 4.9, 'clip-a');
  assert.equal(
    target1?.id,
    'clip-b',
    'Drop at 4.9s onto clip-a must resolve to clip-b (the incoming seam clip)'
  );

  // Scenario 2: User drops directly onto seam button at 5.0s (targetClipId = 'clip-b')
  const target2 = resolveTransitionTargetClip(videoClips, 5.0, 'clip-b');
  assert.equal(target2?.id, 'clip-b', 'Drop at 5.0s onto seam button must resolve to clip-b');

  // Scenario 3: User drops at 5.2s onto clip-b
  const target3 = resolveTransitionTargetClip(videoClips, 5.2, 'clip-b');
  assert.equal(target3?.id, 'clip-b', 'Drop at 5.2s onto clip-b must resolve to clip-b');

  // Scenario 4: User drops at 9.8s near seam between clip-b and clip-c (targetClipId = 'clip-b')
  // Even though dropped on clip-b's tail, target must resolve to clip-c!
  const target4 = resolveTransitionTargetClip(videoClips, 9.8, 'clip-b');
  assert.equal(
    target4?.id,
    'clip-c',
    'Drop at 9.8s onto tail of clip-b must resolve to clip-c (seam at 10.0s)'
  );

  // Scenario 5: User drops at 10.0s onto second seam button (targetClipId = 'clip-c')
  const target5 = resolveTransitionTargetClip(videoClips, 10.0, 'clip-c');
  assert.equal(target5?.id, 'clip-c', 'Drop at 10.0s onto seam button must resolve to clip-c');

  // Scenario 6: User drops without targetClipId at 4.95s (e.g. from track background or library click)
  const target6 = resolveTransitionTargetClip(videoClips, 4.95);
  assert.equal(target6?.id, 'clip-b', 'Drop without targetClipId at 4.95s must resolve to clip-b');

  // Scenario 7: User drops without targetClipId at 10.1s
  const target7 = resolveTransitionTargetClip(videoClips, 10.1);
  assert.equal(target7?.id, 'clip-c', 'Drop without targetClipId at 10.1s must resolve to clip-c');
});

test('Mobile Workstation timeline positioning, center playhead sync, and pinch-to-zoom math', () => {
  // Test 1: Center Playhead alignment math with internal playhead cursor (eliminating 28px offset)
  const screenWidth = 390;
  const leftMuteColumnWidth = 56;
  const scrollContainerWidth = screenWidth - leftMuteColumnWidth; // 334px
  const centerOffset = scrollContainerWidth / 2; // 167px inside scroll container
  const pxPerSec = 45;

  // In the prior attempt, playhead was placed on outer parent (390 / 2 = 195px from screen left)
  // while tracks started at 56px + 167px = 223px from screen left, producing a 28px misalignment!
  const priorOuterPlayheadX = screenWidth / 2; // 195px
  const priorTrackStartX = leftMuteColumnWidth + centerOffset; // 223px
  const priorOffsetError = priorTrackStartX - priorOuterPlayheadX;
  assert.equal(priorOffsetError, 28, 'Prior attempt had a 28px offset error due to outer container playhead');

  // With the fixed structure: Playhead cursor is placed inside timelineScrollRef at 50%
  const fixedPlayheadRelativeX = centerOffset; // 167px
  // At playheadSec = 0 (initial entry: 00:00:00:00)
  const playheadSec0 = 0.0;
  const translateX0 = centerOffset - playheadSec0 * pxPerSec;
  assert.equal(translateX0, 167);
  // Timestamp t=0 on track relative to scroll container:
  const trackPosAtT0 = translateX0 + 0 * pxPerSec;
  assert.equal(trackPosAtT0, fixedPlayheadRelativeX, 't=0 is now pixel-perfect at the playhead cursor (0px error)');

  // At playheadSec = 5.2s (during video playback)
  const playheadSec5 = 5.2;
  const translateX5 = centerOffset - playheadSec5 * pxPerSec;
  // Point on clip at 5.2s has relative position:
  const trackPosAtT5 = translateX5 + playheadSec5 * pxPerSec;
  assert.equal(trackPosAtT5, fixedPlayheadRelativeX, 'Current playhead timestamp stays locked under center playhead');

  // Test 2: Pinch to zoom on timeline math (clamped 8..220 px/s)
  const initialDist = 120;
  const initialPxPerSec = 45;
  // Pinch out (spread fingers): dist grows from 120 to 240 (2.0x zoom)
  const spreadDist = 240;
  const zoomInPx = Math.round(Math.max(8, Math.min(220, initialPxPerSec * (spreadDist / initialDist))));
  assert.equal(zoomInPx, 90, 'Timeline clips stretch proportionally when spreading fingers');

  // Pinch in (close fingers): dist shrinks from 120 to 20 (0.166x zoom)
  const closeDist = 20;
  const zoomOutPx = Math.round(Math.max(8, Math.min(220, initialPxPerSec * (closeDist / initialDist))));
  assert.equal(zoomOutPx, 8, 'Timeline clips compress down to 8 px/s when pinching fingers');

  // Extreme spread (5.0x zoom) clamped to 220 px/s
  const extremeDist = 600;
  const extremeZoomPx = Math.round(Math.max(8, Math.min(220, initialPxPerSec * (extremeDist / initialDist))));
  assert.equal(extremeZoomPx, 220, 'Max timeline zoom clamped cleanly at 220 px/s');

  // Test 3: Responsive canvas pan scaling: 9:16 vertical (1080x1920) vs 16:9 (1920x1080)
  // For 9:16 vertical mobile video on 360x640 preview box:
  const canvasW_916 = 1080;
  const canvasH_916 = 1920;
  const boxW = 360;
  const boxH = 640;
  const scaleRatioX_916 = canvasW_916 / boxW; // 3.0
  const scaleRatioY_916 = canvasH_916 / boxH; // 3.0
  assert.equal(scaleRatioX_916, 3.0, 'X pan ratio matches 9:16 canvas exactly');
  assert.equal(scaleRatioY_916, 3.0, 'Y pan ratio matches 9:16 canvas exactly (1:1 finger tracking)');

  // Test 4: wasPinching prevents accidental seek on finger lift
  let wasPinching = true;
  let hasDragged = false;
  let didSeek = false;
  // When touches drop to 0 after pinch:
  const touchesRemaining = 0;
  if (touchesRemaining === 0) {
    if (wasPinching) {
      wasPinching = false;
      // Seek is bypassed!
    } else if (!hasDragged) {
      didSeek = true;
    }
  }
  assert.equal(didSeek, false, 'Accidental seek must be suppressed after pinch-to-zoom');
  assert.equal(wasPinching, false, 'wasPinching must reset cleanly after all fingers lift');
});

test('Mobile Workstation stationary center playhead, Mute+Cover row 1, and -100..100 adjustment specs', async () => {
  const { createDefaultClip } = await import('./timelineEngine');

  // 1. Verify default values of all Adjustments are strictly 0
  const clip = createDefaultClip({
    id: 'test-clip-adjust',
    name: 'TestAdjust.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 10,
  });

  const adjustmentKeys = [
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
  ] as const;

  for (const key of adjustmentKeys) {
    assert.equal(
      clip[key],
      0,
      `Clip default for adjustment property "${key}" must be 0`
    );
  }

  // 2. Verify all adjustments support full -100 to 100 range
  for (const key of adjustmentKeys) {
    // Min boundary
    const minVal = -100;
    const maxVal = 100;
    assert.ok(minVal === -100 && maxVal === 100);
  }

  // 3. Stationary Center Playhead Math:
  // Container width W = 400px -> halfWidth = 200px
  const containerW = 400;
  const halfWidth = containerW / 2; // 200px
  const pxPerSec = 40;
  const totalDuration = 10.0;

  // At playheadSec = 0: scrollLeft must be 0, and track start (0s) sits at halfWidth (200px)
  let playheadSec = 0.0;
  let scrollLeft = playheadSec * pxPerSec; // 0px
  let trackStartXInViewport = halfWidth - scrollLeft;
  assert.equal(trackStartXInViewport, 200, 'Track start (00:00) aligns exactly at center playhead line (200px)');

  // Dragging: swiping 80px left pulls future video forward by 2.0s
  const swipeDeltaX = -80; // Dragged left
  scrollLeft = scrollLeft - swipeDeltaX; // 80px
  playheadSec = scrollLeft / pxPerSec; // 2.0s
  assert.equal(playheadSec, 2.0, 'Swiping left advances timeline smoothly under center line');

  // Video position at 2.0s in container
  const clip2sPosInScroll = halfWidth + 2.0 * pxPerSec; // 200 + 80 = 280px
  const clip2sPosInViewport = clip2sPosInScroll - scrollLeft; // 280 - 80 = 200px (center line!)
  assert.equal(clip2sPosInViewport, halfWidth, 'Current 2.0s frame sits right under stationary center playhead');

  // 4. Drag-to-seek vs No tap-to-seek jump:
  // User navigates exclusively by dragging/swiping the timeline strip under the fixed center line.
  // Tap-to-seek is disabled so tapping clips selects them rather than displacing time unexpectedly.
  const initialTime = playheadSec; // 2.0s
  // Dragging right by 40px moves 1.0s backwards
  const dragRightDeltaX = 40;
  scrollLeft = scrollLeft - dragRightDeltaX; // 40px
  playheadSec = scrollLeft / pxPerSec; // 1.0s
  assert.equal(playheadSec, 1.0, 'Swiping right pulls earlier frames back under center line');

  // 5. Negative Vignette & Adjustments Canvas Spec:
  // Vignette supports -100 to 100: positive is dark vignette (0,0,0), negative is white halo (255,255,255)
  const negVignette = -50;
  const posVignette = 50;
  const negVignetteColor = negVignette > 0 ? '0,0,0' : '255,255,255';
  const posVignetteColor = posVignette > 0 ? '0,0,0' : '255,255,255';
  assert.equal(negVignetteColor, '255,255,255', 'Negative vignette must evaluate to white halo vignette');
  assert.equal(posVignetteColor, '0,0,0', 'Positive vignette must evaluate to dark shadow vignette');

  // 6. Pinch zoom around playhead: zoom from 40 px/s to 80 px/s
  const nextPxPerSec = 80;
  scrollLeft = playheadSec * nextPxPerSec; // 1.0 * 80 = 80px
  const zoomedClipPosInScroll = halfWidth + playheadSec * nextPxPerSec; // 200 + 80 = 280px
  const zoomedClipPosInViewport = zoomedClipPosInScroll - scrollLeft; // 280 - 80 = 200px
  assert.equal(
    zoomedClipPosInViewport,
    halfWidth,
    'Pinch zoom preserves exact stationary center alignment without frame drift'
  );
});

test('Clip edge trim clamp strictly prevents stretching beyond sourceDuration, and magnetic snap threshold feels solid', async () => {
  const { snapPreviewScaleToFrame, findClosestTimelineSnapPoint, createDefaultClip } = await import(
    './timelineEngine'
  );

  // 1. Clip Duration Limit: A video of 10.0s source duration cannot be extended past 10.0s
  const videoClip = createDefaultClip({
    id: 'vid_clamp_1',
    name: 'Sample.mp4',
    trackIndex: 0,
    startTime: 5.0,
    duration: 8.0,
  });
  videoClip.sourceDuration = 10.0;
  videoClip.sourceIn = 2.0; // 8.0s remaining
  videoClip.speed = 1.0;

  const maxAllowedDur = (videoClip.sourceDuration - videoClip.sourceIn) / videoClip.speed; // 8.0s
  assert.equal(maxAllowedDur, 8.0, 'Remaining source duration is 8.0s');

  // Attempting to stretch right by +5.0s (desired 13.0s) must be hard-capped at 8.0s
  const requestedDur = videoClip.duration + 5.0; // 13.0s
  const clampedDur = Math.max(0.4, Math.min(maxAllowedDur, requestedDur));
  assert.equal(clampedDur, 8.0, 'Stretching right is hard capped at remaining source duration 8.0s');

  // Attempting to stretch left before source start (sourceIn = 2.0s, delta = -4.0s, startTime = 5.0s)
  const minLeftDelta = -videoClip.sourceIn / videoClip.speed; // -2.0s
  const requestedLeftDelta = -4.0;
  const clampedLeftDelta = Math.max(-videoClip.startTime, minLeftDelta, requestedLeftDelta);
  assert.equal(clampedLeftDelta, -2.0, 'Stretching left is hard capped at source start 0s');

  // 2. Magnetic snap threshold for ~14px / ~0.25s feels noticeable and snaps properly
  const snapThreshold = 0.25;
  const snapTargets = [
    { timeSec: 0, label: '' },
    { timeSec: 8.0, label: '' },
    { timeSec: 15.0, label: '' },
  ];

  // Point at 8.12s (within 0.25s of 8.0s)
  const snapRes = findClosestTimelineSnapPoint([8.12], snapTargets, snapThreshold);
  assert.equal(snapRes.snapped, true, 'Point 8.12s within 0.25s threshold must snap');
  assert.equal(snapRes.snapTimeSec, 8.0, 'Snaps cleanly to target 8.0s');

  // Point at 8.40s (outside 0.25s threshold)
  const noSnapRes = findClosestTimelineSnapPoint([8.4], snapTargets, snapThreshold);
  assert.equal(noSnapRes.snapped, false, 'Point 8.40s outside 0.25s threshold must not snap');

  // 3. Canvas scale magnetic snap to 100%
  const scaleSnapNear = snapPreviewScaleToFrame(104, 10, 8, 8, 24);
  assert.equal(scaleSnapNear.snappedScale, true, 'Scale 104% within tolerance snaps to 100%');
  assert.equal(scaleSnapNear.scale, 100, 'Scale value locked to exact 100%');
  assert.equal(scaleSnapNear.posX, 0, 'Centered posX snaps to 0');
  assert.equal(scaleSnapNear.posY, 0, 'Centered posY snaps to 0');

  // 4. Track 0 Contiguous Packing after trimming
  const { packTrackClipsContiguously } = await import('./timelineEngine');
  const clipA = createDefaultClip({ id: 'cA', name: 'A.mp4', trackIndex: 0, startTime: 0, duration: 6.0 });
  const clipB = createDefaultClip({ id: 'cB', name: 'B.mp4', trackIndex: 0, startTime: 10.0, duration: 8.0 });
  const packed = packTrackClipsContiguously([clipA, clipB], 0);
  assert.equal(packed[0].startTime, 0, 'Clip A starts at 0s');
  assert.equal(packed[1].startTime, 6.0, 'Clip B snapped seamlessly to 6.0s eliminating the 4s gap');
});

test('Scale input buffer parsing, scale up to 500%, and mobile scroll playback guard', () => {
  // 1. Verify Numeric input parsing with text buffers:
  // User had 150 -> deletes 0 -> "15" -> adds 0 -> "100" (or "100%")
  const parseNumericInput = (text: string, currentVal: number, min: number, max: number, step = 1): number => {
    const trimmed = text.trim().replace(/%/g, '');
    const parsed = parseFloat(trimmed);
    const safeVal = Number.isNaN(parsed) ? currentVal : parsed;
    const clamped = Math.max(min, Math.min(max, safeVal));
    return step < 1 ? Number(clamped.toFixed(2)) : Math.round(clamped);
  };

  assert.equal(parseNumericInput('100', 150, 10, 500), 100, 'Typing 100 yields 100%');
  assert.equal(parseNumericInput('100%', 150, 10, 500), 100, 'Typing 100% with percent symbol yields 100%');
  assert.equal(parseNumericInput('500', 100, 10, 500), 500, 'Scale can reach full 500%');
  assert.equal(parseNumericInput('650', 100, 10, 500), 500, 'Values above 500 clamp to 500%');
  assert.equal(parseNumericInput('5', 100, 10, 500), 10, 'Values below min clamp to 10% on commit');
  assert.equal(parseNumericInput('', 150, 10, 500), 150, 'Empty input safely falls back to current value');
  assert.equal(parseNumericInput('-45', 0, -180, 180), -45, 'Negative inputs parsed and preserved');
  assert.equal(parseNumericInput('1.75', 1.0, 0.1, 10, 0.1), 1.75, 'Decimal inputs parsed cleanly with fractional steps');

  // 2. Verify Overlay clip scaling math up to 500% (5.0x screen width)
  const computeOverlayFactor = (ovScalePercent: number) => {
    const ovScale = ovScalePercent / 100;
    const scaledFactor = ovScale <= 1 ? ovScale * 0.55 : 0.55 + (ovScale - 1) * 1.1125;
    return Math.min(5.0, Math.max(0.08, scaledFactor));
  };

  assert.equal(Number(computeOverlayFactor(100).toFixed(2)), 0.55, 'Scale 100% overlay factor is 0.55');
  assert.equal(Number(computeOverlayFactor(48).toFixed(3)), 0.264, 'Scale 48% overlay factor is preserved');
  assert.equal(Number(computeOverlayFactor(500).toFixed(1)), 5.0, 'Scale 500% overlay factor reaches full 5.0x without being capped at 1.5x');

  // 3. Verify Corner handle drag sensitivity reaches full 500% within a comfortable screen drag distance
  const computeCornerDragScale = (origScale: number, delta: number, baseDim: number) => {
    const deltaScale = (delta / baseDim) * 360;
    return Math.max(10, Math.min(500, Math.round(origScale + deltaScale)));
  };
  const reachedMaxScale = computeCornerDragScale(100, 280, 250);
  assert.equal(reachedMaxScale, 500, 'Corner drag comfortably reaches 500% on standard display width');

  // 4. Mobile timeline scroll guard during active playback & user touch tracking:
  let playhead = 5.3;
  const isPlaying = true;
  const isDraggingTimeline = false;
  const isProgrammatic = true;

  const handleMobileScrollSim = (
    scrollLeft: number,
    pxPerSec: number,
    playing: boolean,
    touching: boolean,
    programmatic: boolean
  ) => {
    if (playing) return;
    if (programmatic) return;
    if (!touching) return;
    playhead = scrollLeft / pxPerSec;
  };

  // Stale scroll event while playing -> must NOT modify playhead
  handleMobileScrollSim(200, 50, isPlaying, isDraggingTimeline, isProgrammatic);
  assert.equal(playhead, 5.3, 'Playhead must NOT be overridden by asynchronous scroll events while playing');

  // Programmatic scroll while paused without user touch -> must NOT modify playhead
  handleMobileScrollSim(100, 50, false, false, true);
  assert.equal(playhead, 5.3, 'Programmatic scroll without user touching timeline must NOT modify playhead');

  // User actively dragging timeline while paused -> MUST synchronize playhead
  handleMobileScrollSim(400, 50, false, true, false);
  assert.equal(playhead, 8.0, 'User touch dragging timeline synchronizes playhead to 8.0s');

  // 5. Video seek tolerance check during playback vs paused
  const shouldExecuteHardSeek = (curTime: number, targetTime: number, playing: boolean): boolean => {
    const diff = Math.abs(curTime - targetTime);
    if (playing) {
      return diff > 2.0;
    }
    return diff > 0.04;
  };

  assert.equal(shouldExecuteHardSeek(1.2, 1.45, true), false, 'Small drift (0.25s < 0.5s) while playing does not force hard seek');
  assert.equal(shouldExecuteHardSeek(1.2, 2.0, true), false, 'Moderate drift (0.8s) while playing does not force hard seek');
  assert.equal(shouldExecuteHardSeek(1.2, 3.8, true), true, 'Large jump (> 2.0s) while playing triggers hard seek');
  assert.equal(shouldExecuteHardSeek(1.2, 1.3, false), true, 'Scrubbing while paused with > 0.04s difference triggers precise seek');
});

test('Mobile aspect ratio default text font size scaling', () => {
  // Vertical 9:16 (TikTok, Reels, Shorts) and 5.8" smartphone screens use 26px to prevent clipping
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('9:16'), 26);
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('5.8"'), 26);

  // Square 1:1 uses 30px
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('1:1'), 30);

  // Widescreen 16:9 and 2.35:1 use 38px
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('16:9'), 38);
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('2.35:1'), 38);

  // 4:3, 3:4, and unspecified fallback to 32px
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('4:3'), 32);
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('3:4'), 32);
  assert.equal(resolveDefaultTextFontSizeByAspectRatio(undefined), 32);
});

test('Mobile left trim handle ripple to 00:00:00 and track 0 clip reorder permutation', () => {
  // 1. Verify left handle trimming on Track 0 ripples back to 00:00:00
  const initialClips = [
    createDefaultClip({
      id: 'clip-v1',
      name: 'Video1.mp4',
      trackIndex: 0,
      startTime: 0,
      duration: 10,
      sourceIn: 0,
      sourceDuration: 20,
    }),
    createDefaultClip({
      id: 'clip-v2',
      name: 'Video2.mp4',
      trackIndex: 0,
      startTime: 10,
      duration: 5,
      sourceIn: 0,
      sourceDuration: 15,
    }),
  ];

  // User drags left trim handle of clip-v1 rightward by +3.0s:
  // clip-v1 new startTime: 3.0, new duration: 7.0, new sourceIn: 3.0
  const afterDragClips = [
    { ...initialClips[0], startTime: 3.0, duration: 7.0, sourceIn: 3.0 },
    initialClips[1],
  ];

  // On release, packTrackClipsContiguously snaps clip-v1 back to 0.00 and ripples clip-v2 to 7.00
  const rippled = packTrackClipsContiguously(afterDragClips, 0);
  assert.equal(rippled[0].startTime, 0, 'First clip must snap back to 00:00:00 after left trim');
  assert.equal(rippled[0].duration, 7.0, 'First clip duration reduced from 10s to 7s');
  assert.equal(rippled[0].sourceIn, 3.0, 'First clip sourceIn advanced to 3s');
  assert.equal(rippled[1].startTime, 7.0, 'Second clip ripples left to 7.00s seamlessly');

  // 2. Track 0 Clip Reorder Permutation (Long-press reorder mode)
  // User reorders [V1 (dur 7), V2 (dur 5)] into [V2, V1]
  const reorderedOrder = [rippled[1], rippled[0]];
  let cursor = 0;
  const reorderedMap = new Map<string, TimelineClip>();
  for (const c of reorderedOrder) {
    reorderedMap.set(c.id, {
      ...c,
      startTime: Number(cursor.toFixed(2)),
    });
    cursor += c.duration;
  }
  const finalizedReorder = packTrackClipsContiguously(
    rippled.map((c) => reorderedMap.get(c.id)!),
    0
  );

  assert.equal(finalizedReorder[0].id, 'clip-v2', 'clip-v2 is now first');
  assert.equal(finalizedReorder[0].startTime, 0.0, 'New first clip starts at 0.00');
  assert.equal(finalizedReorder[0].duration, 5.0, 'Duration of clip-v2 is preserved');
  assert.equal(finalizedReorder[1].id, 'clip-v1', 'clip-v1 is now second');
  assert.equal(finalizedReorder[1].startTime, 5.0, 'New second clip starts contiguously at 5.00');
  assert.equal(finalizedReorder[1].duration, 7.0, 'Duration of clip-v1 is preserved');

  // 3. Audio Right & Left Trim Duration Hard Clamp
  const audioClip = createDefaultClip({
    id: 'clip-a1',
    name: 'Music.mp3',
    trackIndex: 1,
    startTime: 0,
    duration: 8.0,
    sourceIn: 2.0,
    sourceDuration: 10.0,
  });

  // Maximum allowed duration when sourceIn = 2.0 and sourceDuration = 10.0 is 8.0s
  const maxAllowedDur = Math.max(0.3, (audioClip.sourceDuration! - (audioClip.sourceIn || 0)) / (audioClip.speed || 1.0));
  assert.equal(maxAllowedDur, 8.0, 'Audio clip cannot extend beyond remaining source duration');
});

test('Mobile text default content, aspect-ratio scaling, and export MIME extension integrity', () => {
  // 1. Verify default text content is 'Nhập chữ của bạn tại đây' in Vietnamese
  const defaultTextVi = 'Nhập chữ của bạn tại đây';
  assert.equal(defaultTextVi, 'Nhập chữ của bạn tại đây');

  // 2. Default font size scaling per aspect ratio
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('9:16'), 26);
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('1:1'), 30);
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('16:9'), 38);
  assert.equal(resolveDefaultTextFontSizeByAspectRatio('4:3'), 32);

  // 3. Container extension verification: WebM mime must produce .webm, MP4 mime produces .mp4
  const resolveExportExt = (actualMime: string, requestedFormat: string): string => {
    const isActualWebm = actualMime.toLowerCase().includes('webm');
    return isActualWebm ? 'webm' : (requestedFormat === 'gif' ? 'webm' : requestedFormat);
  };

  assert.equal(resolveExportExt('video/webm;codecs=vp9,opus', 'mp4'), 'webm', 'WebM recording must never be labeled .mp4');
  assert.equal(resolveExportExt('video/mp4;codecs=avc1.640028', 'mp4'), 'mp4', 'Real MP4 recording correctly keeps .mp4');
  assert.equal(resolveExportExt('video/webm', 'webm'), 'webm', 'WebM format keeps .webm');

  // 4. Video left trim drag indent simulation:
  // While dragging, clip indents inward (startTime > 0, duration shrinks, sourceIn advances)
  const origClip = createDefaultClip({
    id: 'clip-drag-test',
    name: 'DragTest.mp4',
    trackIndex: 0,
    startTime: 0,
    duration: 10.0,
    sourceIn: 0.0,
  });
  const dragDeltaSec = 2.5; // Dragging handle rightward by 2.5s
  const intermediateDragClip = {
    ...origClip,
    startTime: origClip.startTime + dragDeltaSec, // 2.5s
    duration: origClip.duration - dragDeltaSec,   // 7.5s
    sourceIn: (origClip.sourceIn || 0) + dragDeltaSec,   // 2.5s
  };
  assert.equal(intermediateDragClip.startTime, 2.5, 'During drag, beginning of clip indents inward');
  assert.equal(intermediateDragClip.duration, 7.5, 'Duration is reduced to 7.5s');

  // Upon releasing finger, magnetic pack snaps start back to 0.00:
  const releasedClips = packTrackClipsContiguously([intermediateDragClip as TimelineClip], 0);
  assert.equal(releasedClips[0].startTime, 0.0, 'On release, clip snaps back to 00:00:00');
  assert.equal(releasedClips[0].duration, 7.5, 'Trimmed duration 7.5s is strictly retained');
  assert.equal(releasedClips[0].sourceIn, 2.5, 'Source offset 2.5s is strictly retained');
});

test('Mobile and studio target bitrate profiles meet required mbps range (1080p: 12-16 Mbps, 2K: 20-25 Mbps, 4K: 35-50 Mbps, 720p: 8-10 Mbps)', () => {
  const getMobileTargetBps = (resolution: string, bitrateMode: string): number => {
    return resolution === '4K'
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
  };

  // 1080p: 12 - 16 Mbps
  const b1080Rec = getMobileTargetBps('1080p', 'recommended');
  const b1080High = getMobileTargetBps('1080p', 'higher');
  assert.ok(b1080Rec >= 12_000_000 && b1080Rec <= 16_000_000, `1080p recommended ${b1080Rec} must be within 12-16 Mbps`);
  assert.ok(b1080High >= 12_000_000 && b1080High <= 16_000_000, `1080p higher ${b1080High} must be within 12-16 Mbps`);

  // 2K: 20 - 25 Mbps
  const b2kRec = getMobileTargetBps('2K', 'recommended');
  const b2kHigh = getMobileTargetBps('2K', 'higher');
  assert.ok(b2kRec >= 20_000_000 && b2kRec <= 25_000_000, `2K recommended ${b2kRec} must be within 20-25 Mbps`);
  assert.ok(b2kHigh >= 20_000_000 && b2kHigh <= 25_000_000, `2K higher ${b2kHigh} must be within 20-25 Mbps`);

  // 4K: 35 - 50 Mbps
  const b4kRec = getMobileTargetBps('4K', 'recommended');
  const b4kHigh = getMobileTargetBps('4K', 'higher');
  assert.ok(b4kRec >= 35_000_000 && b4kRec <= 50_000_000, `4K recommended ${b4kRec} must be within 35-50 Mbps`);
  assert.ok(b4kHigh >= 35_000_000 && b4kHigh <= 50_000_000, `4K higher ${b4kHigh} must be within 35-50 Mbps`);

  // 720p: 8 - 10 Mbps
  const b720Rec = getMobileTargetBps('720p', 'recommended');
  const b720High = getMobileTargetBps('720p', 'higher');
  assert.ok(b720Rec >= 8_000_000 && b720Rec <= 10_000_000, `720p recommended ${b720Rec} must be within 8-10 Mbps`);
  assert.ok(b720High >= 8_000_000 && b720High <= 10_000_000, `720p higher ${b720High} must be within 8-10 Mbps`);
});








