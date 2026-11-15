import { TimelineClip } from './timelineEngine';

export interface TranscribedSubtitleSegment {
  text: string;
  startTime: number;
  duration: number;
}

export interface WhisperTranscribeOptions {
  language?: 'auto' | 'vi' | 'en';
  isMobile?: boolean;
  onProgress?: (pct: number, message: string) => void;
}

let cachedPipelinePromise: Promise<any> | null = null;
let cachedModelId: string | null = null;

/**
 * Extracts and mixes all unmuted timeline video/audio clips into a 16kHz mono Float32Array
 * using OfflineAudioContext so it can be fed directly into Whisper WebGPU/WASM.
 */
export async function extractTimelineAudio16kHzMono(
  clips: TimelineClip[],
  onProgress?: (pct: number, message: string) => void
): Promise<{ audio: Float32Array; startTimeOffset: number; durationSec: number }> {
  const activeAudioClips = clips.filter(
    (c) =>
      !c.disabled &&
      !c.muted &&
      (c.volume ?? 100) > 0 &&
      Boolean(c.mediaUrl) &&
      (c.trackIndex === 0 || c.trackIndex === 1 || c.trackIndex === 3 || c.trackIndex >= 4) &&
      !c.subtitleText &&
      !c.stickerEmoji
  );

  if (activeAudioClips.length === 0) {
    throw new Error('Không tìm thấy clip có âm thanh trên Timeline.');
  }

  const minStart = Math.min(...activeAudioClips.map((c) => c.startTime));
  const maxEnd = Math.max(...activeAudioClips.map((c) => c.startTime + c.duration));
  const spanSec = Math.max(0.5, maxEnd - minStart);
  const sampleRate = 16000;
  const totalSamples = Math.max(sampleRate, Math.ceil(spanSec * sampleRate));

  const OfflineCtx =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;

  if (!OfflineCtx) {
    throw new Error('Trình duyệt không hỗ trợ OfflineAudioContext.');
  }

  onProgress?.(10, 'Đang tách âm thanh 16kHz từ video...');

  const offlineCtx = new OfflineCtx(1, totalSamples, sampleRate);
  const decodedCache = new Map<string, AudioBuffer | null>();
  let scheduledCount = 0;

  for (let i = 0; i < activeAudioClips.length; i++) {
    const clip = activeAudioClips[i];
    if (!clip.mediaUrl) continue;

    let decoded = decodedCache.get(clip.mediaUrl);
    if (decoded === undefined) {
      try {
        const resp = await fetch(clip.mediaUrl);
        const ab = await resp.arrayBuffer();
        decoded = await offlineCtx.decodeAudioData(ab);
      } catch {
        decoded = null;
      }
      decodedCache.set(clip.mediaUrl, decoded);
    }

    if (!decoded) continue;

    const src = offlineCtx.createBufferSource();
    src.buffer = decoded;
    const spd = Math.max(0.25, Math.min(4.0, clip.speed || 1.0));
    src.playbackRate.value = spd;

    const gain = offlineCtx.createGain();
    gain.gain.value = Math.max(0, Math.min(2, (clip.volume ?? 100) / 100));
    src.connect(gain);
    gain.connect(offlineCtx.destination);

    const relStart = Math.max(0, clip.startTime - minStart);
    const sourceIn = Math.max(0, clip.sourceIn || 0);
    const playDur = Math.max(0.05, Math.min(clip.duration * spd, decoded.duration - sourceIn));

    try {
      src.start(relStart, sourceIn, playDur);
      scheduledCount++;
    } catch {
      // Ignore out-of-range sourceIn
    }
  }

  if (scheduledCount === 0) {
    throw new Error('Video không có luồng âm thanh hợp lệ để nhận diện.');
  }

  const rendered = await offlineCtx.startRendering();
  const channelData = rendered.getChannelData(0);

  // Check if audio is completely silent
  let peak = 0;
  for (let i = 0; i < channelData.length; i += 64) {
    const v = Math.abs(channelData[i]);
    if (v > peak) peak = v;
  }
  if (peak < 0.0005) {
    throw new Error('Âm thanh quá nhỏ hoặc bị tắt tiếng, không thể nhận diện giọng nói.');
  }

  return {
    audio: channelData,
    startTimeOffset: minStart,
    durationSec: spanSec,
  };
}

/**
 * Loads Whisper ONNX model via @huggingface/transformers (WebGPU with WASM fallback)
 * and transcribes 16kHz mono audio into timestamped subtitle segments.
 */
export async function transcribeAudioWithWhisper(
  audio16k: Float32Array,
  startTimeOffset: number,
  options: WhisperTranscribeOptions = {}
): Promise<TranscribedSubtitleSegment[]> {
  const { language = 'auto', isMobile = false, onProgress } = options;

  onProgress?.(22, 'Đang nạp thư viện Whisper AI...');
  const { pipeline, env } = await import('@huggingface/transformers');
  env.allowLocalModels = false;

  const targetModelId = isMobile ? 'onnx-community/whisper-tiny' : 'onnx-community/whisper-base';

  if (!cachedPipelinePromise || cachedModelId !== targetModelId) {
    cachedModelId = targetModelId;
    const hasWebGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;

    const loadPipeline = async () => {
      const progressCallback = (info: any) => {
        if (info?.status === 'progress' && typeof info.progress === 'number') {
          const pct = Math.min(72, Math.max(25, Math.round(25 + info.progress * 0.45)));
          onProgress?.(pct, `Đang tải mô hình Whisper (${Math.round(info.progress)}%)...`);
        }
      };

      if (hasWebGpu) {
        try {
          return await pipeline('automatic-speech-recognition', targetModelId, {
            device: 'webgpu',
            dtype: {
              encoder_model: 'fp32',
              decoder_model_merged: 'q4',
            },
            progress_callback: progressCallback,
          });
        } catch {
          // Fall back to WASM if WebGPU fails on this device
        }
      }

      return await pipeline('automatic-speech-recognition', targetModelId, {
        device: 'wasm',
        dtype: 'q8',
        progress_callback: progressCallback,
      });
    };

    cachedPipelinePromise = loadPipeline().catch((err) => {
      cachedPipelinePromise = null;
      cachedModelId = null;
      throw err;
    });
  }

  const transcriber = await cachedPipelinePromise;
  onProgress?.(78, 'Đang nhận diện giọng nói trong video...');

  const whisperLang =
    language === 'vi' ? 'vietnamese' : language === 'en' ? 'english' : undefined;

  const result = await transcriber(audio16k, {
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
    task: 'transcribe',
    ...(whisperLang ? { language: whisperLang } : {}),
  });

  onProgress?.(95, 'Đang đồng bộ phụ đề lên Timeline...');

  const rawChunks: Array<{ text?: string; timestamp?: [number | null, number | null] }> =
    Array.isArray(result?.chunks)
      ? result.chunks
      : result?.text
      ? [{ text: String(result.text), timestamp: [0, audio16k.length / 16000] }]
      : [];

  const segments: TranscribedSubtitleSegment[] = [];
  const totalDur = audio16k.length / 16000;

  for (const ch of rawChunks) {
    const clean = (ch.text || '')
      .replace(/\[BLANK_AUDIO\]/gi, '')
      .replace(/\[Music\]/gi, '')
      .replace(/\(âm thanh trống\)/gi, '')
      .trim();
    if (!clean) continue;

    const tsStart = typeof ch.timestamp?.[0] === 'number' ? ch.timestamp[0] : 0;
    const tsEnd =
      typeof ch.timestamp?.[1] === 'number'
        ? ch.timestamp[1]
        : Math.min(totalDur, tsStart + Math.max(1.5, clean.split(/\s+/).length * 0.45));

    const dur = Math.max(0.6, tsEnd - tsStart);
    segments.push({
      text: clean,
      startTime: Number((startTimeOffset + tsStart).toFixed(2)),
      duration: Number(dur.toFixed(2)),
    });
  }

  return segments;
}
