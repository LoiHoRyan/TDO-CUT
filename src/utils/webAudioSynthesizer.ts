// Web Audio API Synthesizer for real-time SFX/BGM preview, WAV Blob generation, and MediaRecorder audio stream

export type SfxPresetType = string;
export type SfxPresetId = SfxPresetType;

export interface SfxLibraryItem {
  id: SfxPresetType;
  label: string;
  category: string;
  subCat: 'bgm' | 'sfx' | 'tiktok';
  durationSec: number;
}

export const SFX_LIBRARY: SfxLibraryItem[] = [
  // SFX — Hiệu ứng tiếng động (10 items)
  { id: 'whoosh', label: 'Whoosh Chuyển Cảnh Nhanh', category: 'Transition SFX', subCat: 'sfx', durationSec: 1.2 },
  { id: 'ding', label: 'Chuông Thông Báo (Crystal Ding)', category: 'UI / Pop', subCat: 'sfx', durationSec: 1.0 },
  { id: 'beep', label: 'Tiếng Bíp Kiểm Duyệt (Censor Beep)', category: 'Broadcast', subCat: 'sfx', durationSec: 0.8 },
  { id: 'pop_bubble', label: 'Bong Bóng Nổ (Pop Bubble)', category: 'UI / Pop', subCat: 'sfx', durationSec: 0.6 },
  { id: 'mouse_click', label: 'Click Chuột Gaming (Double Click)', category: 'UI / Tech', subCat: 'sfx', durationSec: 0.5 },
  { id: 'camera_shutter', label: 'Chụp Ảnh Máy Cơ (Camera Shutter)', category: 'Vlog SFX', subCat: 'sfx', durationSec: 0.7 },
  { id: 'keyboard_type', label: 'Gõ Bàn Phím Cơ (Mechanical Typing)', category: 'Tech SFX', subCat: 'sfx', durationSec: 1.5 },
  { id: 'glitch_cyber', label: 'Nhiễu Sóng Điện Tử (Cyber Glitch)', category: 'Sci-Fi SFX', subCat: 'sfx', durationSec: 1.1 },
  { id: 'sword_slash', label: 'Vung Kiếm Chém Gió (Sword Whoosh)', category: 'Action SFX', subCat: 'sfx', durationSec: 0.9 },
  { id: 'victory_chime', label: 'Âm Thanh Chiến Thắng (Level Up)', category: 'Gaming SFX', subCat: 'sfx', durationSec: 1.6 },

  // TIKTOK VIRAL — Nhạc & Hiệu ứng xu hướng (7 items)
  { id: 'bassdrop', label: 'Bass Drop Kịch Tính (Vine Boom)', category: 'Viral TikTok', subCat: 'tiktok', durationSec: 1.8 },
  { id: 'funny_boing', label: 'Lò Xo Hài Hước (Cartoon Boing)', category: 'Meme / Comedy', subCat: 'tiktok', durationSec: 1.1 },
  { id: 'cash_register', label: 'Tiền Về Tài Khoản (Cha-Ching!)', category: 'Viral / Sales', subCat: 'tiktok', durationSec: 1.3 },
  { id: 'suspense_riser', label: 'Cao Trào Hồi Hộp (Cinematic Riser)', category: 'Viral Hook', subCat: 'tiktok', durationSec: 2.8 },
  { id: 'horn_air', label: 'Kèn Cổ Vũ Sôi Động (Air Horn)', category: 'Hype / Meme', subCat: 'tiktok', durationSec: 1.5 },
  { id: 'record_scratch', label: 'Đứng Hình Chà Đĩa (Record Scratch)', category: 'Comedy Cut', subCat: 'tiktok', durationSec: 1.0 },
  { id: 'crowd_cheer', label: 'Tiếng Vỗ Tay Reo Hò (Applause)', category: 'Show / Viral', subCat: 'tiktok', durationSec: 2.5 },

  // BGM — Nhạc nền Studio (7 items)
  { id: 'bgm_lofi', label: 'BGM Lo-Fi Chill Quán Cà Phê', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 8.0 },
  { id: 'bgm_phonk', label: 'BGM Drift Phonk Bass Căng (TikTok)', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 6.5 },
  { id: 'bgm_cinematic', label: 'BGM Điện Ảnh Hùng Tráng (Epic Trailer)', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 9.0 },
  { id: 'bgm_upbeat', label: 'BGM Vlog Du Lịch Tươi Sáng', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 7.5 },
  { id: 'bgm_cyber', label: 'BGM Cyberpunk Synthwave 2077', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 8.0 },
  { id: 'bgm_corporate', label: 'BGM Công Nghệ & Review Sản Phẩm', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 7.0 },
  { id: 'bgm_piano', label: 'BGM Piano Cảm Xúc Sâu Lắng', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 8.5 },
];

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private dest: MediaStreamAudioDestinationNode | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAudioStream(): MediaStream | null {
    try {
      const ctx = this.ensureContext();
      if (!this.dest) {
        this.dest = ctx.createMediaStreamDestination();
      }
      return this.dest.stream;
    } catch {
      return null;
    }
  }

  /**
   * Starts a continuous near-silent keep-alive audio clock into the MediaStreamAudioDestinationNode
   * so that browser MediaRecorder (when muxing video + audio tracks) never stalls waiting for audio
   * frames and never outputs a 0 KB file when no SFX is actively playing.
   */
  public startExportAudioKeepAlive(): () => void {
    try {
      const ctx = this.ensureContext();
      if (!this.dest) {
        this.dest = ctx.createMediaStreamDestination();
      }
      const osc = ctx.createOscillator();
      const silentGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      silentGain.gain.setValueAtTime(0.00001, ctx.currentTime);
      osc.connect(silentGain);
      silentGain.connect(this.dest);
      osc.start();
      return () => {
        try {
          osc.stop();
          osc.disconnect();
          silentGain.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      };
    } catch {
      return () => {};
    }
  }

  public playSfx(type: SfxPresetType, volumeRatioOrPercent: number = 1): void {
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      const normalized =
        volumeRatioOrPercent > 2 ? volumeRatioOrPercent / 100 : volumeRatioOrPercent;
      const vol = Math.max(0, Math.min(2, normalized)) * 0.35;
      gain.connect(ctx.destination);
      if (this.dest) {
        gain.connect(this.dest);
      }

      if (type === 'beep') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'ding' || type === 'cash_register' || type === 'victory_chime') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        const f1 = type === 'cash_register' ? 1567.98 : type === 'victory_chime' ? 880 : 1318.5;
        const f2 = type === 'cash_register' ? 2093.0 : type === 'victory_chime' ? 1318.5 : 1760;
        osc.frequency.setValueAtTime(f1, now);
        osc.frequency.setValueAtTime(f2, now + 0.09);
        if (type === 'victory_chime') {
          osc.frequency.setValueAtTime(1760, now + 0.2);
        }
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.75);
      } else if (type === 'pop_bubble' || type === 'mouse_click' || type === 'camera_shutter') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(type === 'pop_bubble' ? 320 : 800, now);
        osc.frequency.exponentialRampToValueAtTime(type === 'pop_bubble' ? 980 : 180, now + 0.12);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'funny_boing') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(520, now + 0.18);
        osc.frequency.linearRampToValueAtTime(260, now + 0.35);
        osc.frequency.linearRampToValueAtTime(480, now + 0.55);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'bassdrop' || type === 'horn_air') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(type === 'horn_air' ? 440 : 160, now);
        osc.frequency.exponentialRampToValueAtTime(type === 'horn_air' ? 392 : 32, now + 0.85);
        gain.gain.setValueAtTime(vol * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.9);
      } else if (type.startsWith('bgm_')) {
        // Play a pleasant 4-chord studio preview arpeggio
        const notes =
          type === 'bgm_phonk' || type === 'bgm_cyber'
            ? [146.83, 174.61, 220.0, 261.63]
            : type === 'bgm_piano'
            ? [261.63, 329.63, 392.0, 523.25]
            : [220.0, 277.18, 329.63, 440.0];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = type === 'bgm_phonk' ? 'sawtooth' : 'triangle';
          const t0 = now + idx * 0.18;
          osc.frequency.setValueAtTime(freq, t0);
          noteGain.gain.setValueAtTime(vol * 0.75, t0);
          noteGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
          osc.connect(noteGain);
          noteGain.connect(gain);
          osc.start(t0);
          osc.stop(t0 + 0.45);
        });
      } else {
        const bufferSize = Math.floor(ctx.sampleRate * 0.5);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(220, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.22);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.48);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        noise.start(now);
        noise.stop(now + 0.5);
      }
    } catch {
      // Ignore audio errors if blocked by autoplay policy
    }
  }

  // Generates a real playable WAV Blob URL so SFX & BGM clips on the Audio Track play real audio
  public generateSfxWavBlobUrl(type: SfxPresetType): string {
    const sampleRate = 22050;
    const item = SFX_LIBRARY.find((s) => s.id === type);
    const duration = item ? Math.min(4.0, Math.max(0.6, item.durationSec)) : 1.0;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeStr = (offset: number, s: string) => {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(offset + i, s.charCodeAt(i));
      }
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const env = Math.max(0, 1 - t / duration);
      let sample = 0;
      if (type === 'beep') {
        sample = Math.sin(2 * Math.PI * 1000 * t) * env * 0.45;
      } else if (type === 'ding' || type === 'cash_register' || type === 'victory_chime') {
        const freq = t < 0.08 ? 1318.5 : 1760;
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.45;
      } else if (type === 'bassdrop' || type === 'horn_air') {
        const freq = 150 * Math.pow(0.22, t / duration);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.6;
      } else if (type.startsWith('bgm_')) {
        const chordFreqs = [220, 277.18, 329.63, 440];
        const noteIdx = Math.floor((t * 2.5) % chordFreqs.length);
        const f = chordFreqs[noteIdx];
        const beatEnv = 1 - ((t * 2.5) % 1) * 0.65;
        sample =
          (Math.sin(2 * Math.PI * f * t) * 0.3 +
            Math.sin(2 * Math.PI * (f * 0.5) * t) * 0.2) *
          beatEnv;
      } else {
        const sweep = Math.sin(2 * Math.PI * (180 + 900 * Math.sin((Math.PI * t) / duration)) * t);
        sample =
          ((Math.random() * 2 - 1) * 0.4 + sweep * 0.3) * Math.sin((Math.PI * t) / duration);
      }
      const pcm = Math.max(-1, Math.min(1, sample));
      view.setInt16(44 + i * 2, pcm < 0 ? pcm * 0x8000 : pcm * 0x7fff, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }
}

export const webAudioEngine = new WebAudioEngine();
