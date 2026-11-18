// Web Audio API Synthesizer for real-time SFX/BGM preview, WAV Blob generation, and MediaRecorder audio stream

export type SfxPresetType = string;
export type SfxPresetId = SfxPresetType;

export interface SfxLibraryItem {
  id: SfxPresetType;
  label: string;
  category: string;
  subCat: 'bgm' | 'sfx' | 'tiktok' | 'meme' | 'youtube';
  durationSec: number;
}

export const SFX_LIBRARY: SfxLibraryItem[] = [
  // YOUTUBE, TIKTOK, IG, FB & UI SFX (15 items)
  { id: 'youtube_subscribe_bell', label: 'Chuông Đăng Ký YouTube (Sub & Bell)', category: 'YouTube / Social', subCat: 'youtube', durationSec: 1.2 },
  { id: 'youtube_like_pop', label: 'Thả Tim / Like Pop (TikTok / IG / FB)', category: 'TikTok / IG / FB', subCat: 'youtube', durationSec: 0.55 },
  { id: 'notification_ig', label: 'Thông Báo Tin Nhắn (IG / Messenger)', category: 'Social Ping', subCat: 'youtube', durationSec: 0.85 },
  { id: 'ding', label: 'Chuông Tinh! (Crystal Ding)', category: 'UI / Pop', subCat: 'sfx', durationSec: 1.0 },
  { id: 'beep', label: 'Tiếng Bíp Kiểm Duyệt (Censor Beep)', category: 'Broadcast', subCat: 'sfx', durationSec: 0.7 },
  { id: 'pop_bubble', label: 'Bong Bóng Nổ (Pop Bubble)', category: 'UI / Pop', subCat: 'sfx', durationSec: 0.5 },
  { id: 'mouse_click', label: 'Click Chuột Gaming (Double Click)', category: 'UI / Tech', subCat: 'sfx', durationSec: 0.45 },
  { id: 'camera_shutter', label: 'Chụp Ảnh Máy Cơ (Camera Shutter)', category: 'Vlog SFX', subCat: 'sfx', durationSec: 0.65 },
  { id: 'keyboard_type', label: 'Gõ Bàn Phím Cơ (Mechanical Typing)', category: 'Tech SFX', subCat: 'sfx', durationSec: 1.5 },
  { id: 'whoosh', label: 'Whoosh Chuyển Cảnh Nhanh', category: 'Transition SFX', subCat: 'sfx', durationSec: 1.0 },
  { id: 'swish_fast', label: 'Vút Gió Nhanh (Fast Swish)', category: 'Transition SFX', subCat: 'sfx', durationSec: 0.65 },
  { id: 'sword_slash', label: 'Chém Kiếm Kim Loại (Sword Slash)', category: 'Action SFX', subCat: 'sfx', durationSec: 0.9 },
  { id: 'glitch_cyber', label: 'Nhiễu Sóng Điện Tử (Cyber Glitch)', category: 'Sci-Fi SFX', subCat: 'sfx', durationSec: 1.0 },
  { id: 'victory_chime', label: 'Chiến Thắng / Level Up (Game Chime)', category: 'Gaming SFX', subCat: 'youtube', durationSec: 1.5 },
  { id: 'timer_tick', label: 'Đồng Hồ Đếm Ngược (Tick-Tock)', category: 'Game Show', subCat: 'sfx', durationSec: 1.6 },

  // MEME, TIẾNG CƯỜI & PHẢN ỨNG (14 items)
  { id: 'bassdrop', label: 'Vine Boom / Bass Drop Cực Mạnh', category: 'Meme / TikTok', subCat: 'meme', durationSec: 1.6 },
  { id: 'meme_laugh_chuckle', label: 'Tiếng Cười Khúc Khích (Meme Chuckle)', category: 'Tiếng Cười / Meme', subCat: 'meme', durationSec: 1.4 },
  { id: 'meme_laugh_crowd', label: 'Tiếng Cười Vỡ Òa (Sitcom Laugh)', category: 'Tiếng Cười / Show', subCat: 'meme', durationSec: 2.0 },
  { id: 'meme_bruh', label: 'Bruh! Trầm Lắng Hài Hước', category: 'Meme Voice FX', subCat: 'meme', durationSec: 0.9 },
  { id: 'meme_bonk', label: 'Bonk! Gõ Đầu Hài Hước', category: 'Meme / Comedy', subCat: 'meme', durationSec: 0.65 },
  { id: 'meme_rimshot', label: 'Ba-Dum-Tss! (Trống Hài Kịch)', category: 'Meme / Comedy', subCat: 'meme', durationSec: 1.2 },
  { id: 'meme_sad_trombone', label: 'Thất Bại (Sad Trombone Wah-Wah)', category: 'Meme / Fail', subCat: 'meme', durationSec: 2.0 },
  { id: 'meme_crickets', label: 'Dế Kêu Im Lặng (Awkward Crickets)', category: 'Meme / Comedy', subCat: 'meme', durationSec: 1.8 },
  { id: 'wrong_buzzer', label: 'Sai Rồi! (Game Show Buzzer)', category: 'Game Show / Meme', subCat: 'meme', durationSec: 0.95 },
  { id: 'funny_boing', label: 'Lò Xo Boing Hài Hước', category: 'Meme / Comedy', subCat: 'meme', durationSec: 1.0 },
  { id: 'horn_air', label: 'Kèn Cổ Vũ MLG (Air Horn)', category: 'Hype / Meme', subCat: 'tiktok', durationSec: 1.4 },
  { id: 'record_scratch', label: 'Chà Đĩa Đứng Hình (Record Scratch)', category: 'Comedy Cut', subCat: 'tiktok', durationSec: 0.9 },
  { id: 'cash_register', label: 'Tiền Về Tài Khoản (Cha-Ching!)', category: 'Viral / Sales', subCat: 'tiktok', durationSec: 1.2 },
  { id: 'crowd_cheer', label: 'Tiếng Vỗ Tay Reo Hò (Applause)', category: 'Show / Viral', subCat: 'tiktok', durationSec: 2.2 },

  // SOUND HOOK & CAO TRÀO MỞ ĐẦU VIDEO (6 items)
  { id: 'suspense_riser', label: 'Cao Trào Hook (Cinematic Riser)', category: 'Sound Hook', subCat: 'tiktok', durationSec: 2.5 },
  { id: 'hook_sub_impact', label: 'Cú Đập Mở Đầu Hook (Sub Impact)', category: 'Sound Hook', subCat: 'tiktok', durationSec: 1.5 },
  { id: 'hook_reverse_cymbal', label: 'Chũm Chọe Ngược (Reverse Cymbal)', category: 'Sound Hook', subCat: 'tiktok', durationSec: 1.8 },
  { id: 'hook_heartbeat', label: 'Nhịp Tim Hồi Hộp (Heartbeat)', category: 'Sound Hook', subCat: 'tiktok', durationSec: 1.8 },
  { id: 'hook_siren', label: 'Cảnh Báo Khẩn Cấp (Alert Siren)', category: 'Sound Hook', subCat: 'tiktok', durationSec: 1.5 },
  { id: 'dramatic_dun', label: 'Đứng Tim! (Dun-Dun-Dun!)', category: 'Sound Hook', subCat: 'meme', durationSec: 1.6 },

  // BGM — NHẠC NỀN STUDIO (10 bài khác biệt hoàn toàn về giai điệu & nhịp)
  { id: 'bgm_lofi', label: 'BGM Lo-Fi Chill Quán Cà Phê', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 8.0 },
  { id: 'bgm_phonk', label: 'BGM Drift Phonk Bass Căng (TikTok)', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 6.5 },
  { id: 'bgm_cinematic', label: 'BGM Điện Ảnh Hùng Tráng (Epic Trailer)', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 9.0 },
  { id: 'bgm_upbeat', label: 'BGM Vlog Du Lịch Tươi Sáng', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 7.5 },
  { id: 'bgm_cyber', label: 'BGM Cyberpunk Synthwave 2077', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 8.0 },
  { id: 'bgm_corporate', label: 'BGM Công Nghệ & Review Sản Phẩm', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 7.0 },
  { id: 'bgm_piano', label: 'BGM Piano Cảm Xúc Sâu Lắng', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 8.5 },
  { id: 'bgm_trap', label: 'BGM Trap Beat Năng Động (Shorts/Reels)', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 7.0 },
  { id: 'bgm_acoustic', label: 'BGM Acoustic Guitar Nhẹ Nhàng (Vlog)', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 8.0 },
  { id: 'bgm_podcast', label: 'BGM Podcast Trò Chuyện Ấm Áp', category: 'Nhạc nền BGM', subCat: 'bgm', durationSec: 8.0 },
];

// Deterministic pseudo-random noise helper so every synthesis is reproducible and crisp
function fastNoise(idx: number): number {
  const x = Math.sin(idx * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function synthesizeSamples(type: SfxPresetType, sampleRate: number, duration: number): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const out = new Float32Array(numSamples);

  // Pre-track phase accumulators for smooth FM / pitch sweeps
  let phase1 = 0;
  let phase2 = 0;
  let lpState = 0;
  let bpState = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = t / duration;
    let s = 0;

    if (type === 'beep') {
      const env = t < 0.01 ? t / 0.01 : t > duration - 0.04 ? Math.max(0, (duration - t) / 0.04) : 1;
      s = Math.sin(2 * Math.PI * 1000 * t) * 0.65 * env;
    } else if (type === 'ding') {
      const env = Math.exp(-t * 4.5);
      s = (Math.sin(2 * Math.PI * 1318.5 * t) * 0.7 + Math.sin(2 * Math.PI * 2637 * t) * 0.25) * env;
    } else if (type === 'youtube_subscribe_bell') {
      if (t < 0.14) {
        const e = Math.exp(-t * 25);
        s = fastNoise(i) * 0.25 * e + Math.sin(2 * Math.PI * 520 * t) * 0.4 * e;
      } else {
        const dt = t - 0.14;
        const f = dt < 0.18 ? 1567.98 : 2093.0;
        const e = Math.exp(-(dt % 0.18) * 6);
        s = (Math.sin(2 * Math.PI * f * dt) * 0.65 + Math.sin(2 * Math.PI * f * 2 * dt) * 0.2) * e;
      }
    } else if (type === 'youtube_like_pop') {
      const freq = 360 + 780 * Math.min(1, t / 0.14);
      phase1 += (2 * Math.PI * freq) / sampleRate;
      const e = Math.exp(-t * 14);
      s = Math.sin(phase1) * 0.75 * e;
    } else if (type === 'notification_ig') {
      const n1 = t < 0.14 ? Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 12) : 0;
      const n2 = t >= 0.11 ? Math.sin(2 * Math.PI * 1318.5 * (t - 0.11)) * Math.exp(-(t - 0.11) * 8) : 0;
      s = (n1 + n2) * 0.6;
    } else if (type === 'cash_register') {
      const drawer = t < 0.12 ? fastNoise(i) * Math.exp(-t * 20) * 0.35 : 0;
      const b1 = t >= 0.12 ? Math.sin(2 * Math.PI * 1975.5 * (t - 0.12)) * Math.exp(-(t - 0.12) * 7) * 0.55 : 0;
      const b2 = t >= 0.22 ? Math.sin(2 * Math.PI * 2637.0 * (t - 0.22)) * Math.exp(-(t - 0.22) * 5) * 0.55 : 0;
      s = drawer + b1 + b2;
    } else if (type === 'victory_chime') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const idx = Math.min(3, Math.floor(t / 0.14));
      const dt = t - idx * 0.14;
      const freq = notes[idx];
      const e = idx === 3 ? Math.exp(-dt * 3) : Math.exp(-dt * 9);
      s = (Math.sin(2 * Math.PI * freq * dt) * 0.6 + Math.sin(2 * Math.PI * freq * 1.5 * dt) * 0.2) * e;
    } else if (type === 'pop_bubble') {
      const freq = 260 + 920 * Math.pow(Math.min(1, t / 0.12), 1.5);
      phase1 += (2 * Math.PI * freq) / sampleRate;
      s = Math.sin(phase1) * Math.exp(-t * 16) * 0.75;
    } else if (type === 'mouse_click') {
      const click1 = t < 0.03 ? fastNoise(i) * Math.exp(-t * 140) * 0.7 + Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 120) * 0.5 : 0;
      const click2 = t >= 0.12 && t < 0.16 ? fastNoise(i) * Math.exp(-(t - 0.12) * 140) * 0.7 + Math.sin(2 * Math.PI * 2100 * (t - 0.12)) * Math.exp(-(t - 0.12) * 120) * 0.5 : 0;
      s = click1 + click2;
    } else if (type === 'camera_shutter') {
      const s1 = t < 0.05 ? fastNoise(i) * Math.exp(-t * 60) * 0.75 : 0;
      const s2 = t >= 0.08 && t < 0.16 ? fastNoise(i) * Math.exp(-(t - 0.08) * 45) * 0.65 + Math.sin(2 * Math.PI * 900 * (t - 0.08)) * Math.exp(-(t - 0.08) * 60) * 0.3 : 0;
      s = s1 + s2;
    } else if (type === 'keyboard_type') {
      const slot = Math.floor(t / 0.11);
      const dt = t - slot * 0.11;
      if (dt < 0.03 && slot < 12) {
        const pitch = 1100 + ((slot * 211) % 700);
        s = (fastNoise(i) * 0.55 + Math.sin(2 * Math.PI * pitch * dt) * 0.45) * Math.exp(-dt * 110);
      }
    } else if (type === 'timer_tick') {
      const beat = Math.floor(t / 0.4);
      const dt = t - beat * 0.4;
      if (dt < 0.06) {
        const pitch = beat % 2 === 0 ? 1400 : 1050;
        s = Math.sin(2 * Math.PI * pitch * dt) * Math.exp(-dt * 70) * 0.65;
      }
    } else if (type === 'bassdrop') {
      const freq = 135 * Math.exp(-t * 4.5) + 32;
      phase1 += (2 * Math.PI * freq) / sampleRate;
      const dist = Math.tanh(Math.sin(phase1) * 2.2);
      s = dist * Math.exp(-t * 1.9) * 0.85;
    } else if (type === 'meme_laugh_chuckle') {
      // Rhythmic "ha-ha-ha-ha" formant bursts descending slightly
      const pulse = Math.floor(t / 0.17);
      const dt = t - pulse * 0.17;
      if (pulse < 6 && dt < 0.12) {
        const f0 = 260 - pulse * 14 - dt * 120;
        const mod = Math.sin(2 * Math.PI * f0 * dt) + 0.5 * Math.sin(2 * Math.PI * f0 * 2.1 * dt);
        const env = Math.sin((Math.PI * dt) / 0.12);
        s = mod * env * 0.42;
      }
    } else if (type === 'meme_laugh_crowd') {
      // Dense chorus laughter bursts
      const burst = Math.sin(2 * Math.PI * 5.2 * t) > -0.2 ? 1 : 0.25;
      const noise = fastNoise(i) * 0.45;
      lpState = lpState * 0.82 + noise * 0.18;
      const formant = Math.sin(2 * Math.PI * (340 + 40 * Math.sin(2 * Math.PI * 6 * t)) * t) * 0.3;
      s = (lpState * 2.1 + formant) * burst * Math.sin(Math.PI * progress) * 0.7;
    } else if (type === 'meme_bruh') {
      const freq = 145 - 55 * Math.min(1, t / 0.6);
      phase1 += (2 * Math.PI * freq) / sampleRate;
      const saw = ((phase1 / (2 * Math.PI)) % 1) * 2 - 1;
      lpState = lpState * 0.88 + saw * 0.12;
      const env = t < 0.04 ? t / 0.04 : Math.exp(-t * 2.8);
      s = lpState * 1.6 * env;
    } else if (type === 'meme_bonk') {
      const freq = 520 * Math.exp(-t * 12) + 180;
      phase1 += (2 * Math.PI * freq) / sampleRate;
      const env = Math.exp(-t * 11);
      s = (Math.sin(phase1) * 0.75 + Math.sin(phase1 * 2.4) * 0.25) * env;
    } else if (type === 'meme_rimshot') {
      if (t < 0.16) {
        s = (fastNoise(i) * 0.5 + Math.sin(2 * Math.PI * 190 * t) * 0.5) * Math.exp(-t * 24);
      } else if (t >= 0.18 && t < 0.34) {
        const dt = t - 0.18;
        s = (fastNoise(i) * 0.55 + Math.sin(2 * Math.PI * 220 * dt) * 0.45) * Math.exp(-dt * 24);
      } else if (t >= 0.36) {
        const dt = t - 0.36;
        s = fastNoise(i) * Math.exp(-dt * 3.8) * 0.6;
      }
    } else if (type === 'meme_sad_trombone') {
      const freqs = [233.08, 220.0, 207.65, 196.0];
      const idx = t < 0.4 ? 0 : t < 0.8 ? 1 : t < 1.2 ? 2 : 3;
      const segStart = idx * 0.4;
      const dt = t - segStart;
      const vibrato = idx === 3 ? Math.sin(2 * Math.PI * 5.5 * dt) * 8 - dt * 28 : 0;
      const freq = freqs[idx] + vibrato;
      phase1 += (2 * Math.PI * freq) / sampleRate;
      const brass = Math.sin(phase1) * 0.6 + Math.sin(phase1 * 2) * 0.3 + Math.sin(phase1 * 3) * 0.15;
      const env = idx === 3 ? Math.exp(-dt * 1.8) : Math.sin(Math.min(1, dt / 0.36) * Math.PI);
      s = brass * env * 0.55;
    } else if (type === 'meme_crickets') {
      const cycle = t % 0.6;
      if (cycle < 0.24) {
        const chirp = (cycle % 0.06) < 0.035 ? 1 : 0;
        s = Math.sin(2 * Math.PI * 4200 * t) * chirp * 0.35;
      }
    } else if (type === 'wrong_buzzer') {
      const saw1 = ((t * 110) % 1) * 2 - 1;
      const saw2 = ((t * 116) % 1) * 2 - 1;
      const env = t < 0.02 ? t / 0.02 : Math.exp(-t * 2.5);
      s = (saw1 + saw2) * 0.35 * env;
    } else if (type === 'funny_boing') {
      const freq = 280 + 180 * Math.sin(2 * Math.PI * 7.5 * t) * Math.exp(-t * 2.2);
      phase1 += (2 * Math.PI * freq) / sampleRate;
      s = Math.sin(phase1) * Math.exp(-t * 2.8) * 0.7;
    } else if (type === 'horn_air') {
      const pulse = t < 0.2 ? 1 : t < 0.28 ? 0.1 : t < 0.48 ? 1 : t < 0.56 ? 0.1 : 1;
      const s1 = ((t * 440) % 1) * 2 - 1;
      const s2 = ((t * 554.37) % 1) * 2 - 1;
      const s3 = ((t * 443) % 1) * 2 - 1;
      s = (s1 + s2 + s3) * 0.24 * pulse * Math.exp(-t * 1.2);
    } else if (type === 'record_scratch') {
      const scrub = Math.sin(2 * Math.PI * 9 * t) * 420 + 620;
      phase1 += (2 * Math.PI * Math.max(80, scrub)) / sampleRate;
      s = (Math.sin(phase1) * 0.6 + fastNoise(i) * 0.25) * Math.exp(-t * 2.2);
    } else if (type === 'crowd_cheer') {
      const n = fastNoise(i);
      bpState = bpState * 0.78 + n * 0.22;
      const clap = Math.sin(2 * Math.PI * 14 * t) > 0.3 ? 1.3 : 0.7;
      s = bpState * 2.0 * clap * Math.sin(Math.PI * progress) * 0.65;
    } else if (type === 'dramatic_dun') {
      const idx = t < 0.35 ? 0 : t < 0.7 ? 1 : 2;
      const dt = t - idx * 0.35;
      const freqs = [110, 103.83, 98.0];
      const f = freqs[idx];
      const saw = ((dt * f) % 1) * 2 - 1;
      const env = idx === 2 ? Math.exp(-dt * 2.2) : Math.exp(-dt * 6);
      s = (saw * 0.45 + Math.sin(2 * Math.PI * f * dt) * 0.45) * env;
    } else if (type === 'sword_slash') {
      const ring = Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 9) * 0.35;
      const slash = fastNoise(i) * Math.exp(-t * 14) * 0.65;
      s = ring + slash;
    } else if (type === 'glitch_cyber') {
      const step = Math.floor(t * 24);
      const freq = 180 + ((step * 373) % 1400);
      const sq = Math.sin(2 * Math.PI * freq * t) >= 0 ? 0.5 : -0.5;
      s = (sq * 0.6 + fastNoise(i) * 0.3) * (1 - progress * 0.7);
    } else if (type === 'suspense_riser') {
      const freq = 110 + 950 * Math.pow(progress, 2);
      phase1 += (2 * Math.PI * freq) / sampleRate;
      s = (Math.sin(phase1) * 0.5 + fastNoise(i) * 0.3 * progress) * Math.min(1, progress * 1.4);
    } else if (type === 'hook_sub_impact') {
      const freq = 180 * Math.exp(-t * 9) + 36;
      phase1 += (2 * Math.PI * freq) / sampleRate;
      const boom = Math.sin(phase1) * Math.exp(-t * 2.3) * 0.85;
      const crack = t < 0.08 ? fastNoise(i) * Math.exp(-t * 35) * 0.5 : 0;
      s = boom + crack;
    } else if (type === 'hook_reverse_cymbal') {
      const swell = Math.pow(progress, 2.6);
      const shimmer = fastNoise(i) * 0.6 + Math.sin(2 * Math.PI * 3200 * t) * 0.15;
      s = shimmer * swell * (t > duration - 0.12 ? Math.exp(-(t - (duration - 0.12)) * 20) : 1);
    } else if (type === 'hook_heartbeat') {
      const cyc = t % 0.85;
      const lub = cyc < 0.14 ? Math.sin(2 * Math.PI * 58 * cyc) * Math.exp(-cyc * 22) : 0;
      const dub = cyc >= 0.2 && cyc < 0.36 ? Math.sin(2 * Math.PI * 48 * (cyc - 0.2)) * Math.exp(-(cyc - 0.2) * 20) : 0;
      s = (lub + dub) * 0.9;
    } else if (type === 'hook_siren') {
      const freq = 620 + 280 * Math.sin(2 * Math.PI * 2.5 * t);
      phase1 += (2 * Math.PI * freq) / sampleRate;
      s = Math.sin(phase1) * 0.55 * (1 - progress * 0.3);
    } else if (type === 'swish_fast' || type === 'whoosh') {
      const peak = type === 'swish_fast' ? 0.25 : 0.45;
      const env = Math.exp(-Math.pow((progress - peak) * 3.4, 2));
      const n = fastNoise(i);
      lpState = lpState * 0.72 + n * 0.28;
      s = lpState * 1.9 * env;
    } else if (type.startsWith('bgm_')) {
      // Distinct multi-layered studio BGM loops!
      const beatLen =
        type === 'bgm_phonk' || type === 'bgm_trap'
          ? 0.42
          : type === 'bgm_cyber' || type === 'bgm_upbeat'
          ? 0.48
          : 0.6;
      const beatIdx = Math.floor(t / beatLen);
      const dt = t - beatIdx * beatLen;
      const chordIdx = Math.floor(beatIdx / 2) % 4;

      const chordRoots =
        type === 'bgm_phonk'
          ? [130.81, 155.56, 116.54, 130.81]
          : type === 'bgm_cinematic'
          ? [110.0, 87.31, 98.0, 110.0]
          : type === 'bgm_piano' || type === 'bgm_acoustic'
          ? [261.63, 220.0, 174.61, 196.0]
          : type === 'bgm_cyber'
          ? [146.83, 174.61, 196.0, 220.0]
          : [220.0, 174.61, 261.63, 196.0];

      const root = chordRoots[chordIdx];
      const kick =
        (type === 'bgm_phonk' || type === 'bgm_trap' || type === 'bgm_cyber' || type === 'bgm_upbeat') &&
        dt < 0.14
          ? Math.sin(2 * Math.PI * (110 * Math.exp(-dt * 24) + 38) * dt) * Math.exp(-dt * 16) * 0.55
          : 0;
      const hat =
        (type === 'bgm_trap' || type === 'bgm_phonk') && (dt % (beatLen / 2)) < 0.03
          ? fastNoise(i) * 0.16
          : 0;
      const pad =
        (Math.sin(2 * Math.PI * root * t) +
          0.6 * Math.sin(2 * Math.PI * root * 1.5 * t) +
          0.4 * Math.sin(2 * Math.PI * root * 1.25 * t)) *
        0.16;
      const arpFreq = root * (beatIdx % 2 === 0 ? 2 : 3);
      const arp = Math.sin(2 * Math.PI * arpFreq * t) * Math.exp(-dt * 5.5) * 0.24;

      const fade = t < 0.15 ? t / 0.15 : t > duration - 0.35 ? Math.max(0, (duration - t) / 0.35) : 1;
      s = (kick + hat + pad + arp) * fade;
    } else {
      const env = Math.sin(Math.PI * progress);
      s = fastNoise(i) * 0.45 * env;
    }

    out[i] = Math.max(-0.98, Math.min(0.98, s));
  }

  return out;
}

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
      const item = SFX_LIBRARY.find((s) => s.id === type);
      const previewDur = item ? Math.min(3.0, Math.max(0.45, item.durationSec)) : 1.0;
      const sampleRate = 22050;
      const samples = synthesizeSamples(type, sampleRate, previewDur);

      const audioBuf = ctx.createBuffer(1, samples.length, sampleRate);
      audioBuf.getChannelData(0).set(samples);

      const src = ctx.createBufferSource();
      src.buffer = audioBuf;

      const gain = ctx.createGain();
      const normalized =
        volumeRatioOrPercent > 2 ? volumeRatioOrPercent / 100 : volumeRatioOrPercent;
      gain.gain.setValueAtTime(Math.max(0, Math.min(2, normalized)) * 0.75, ctx.currentTime);

      src.connect(gain);
      gain.connect(ctx.destination);
      if (this.dest) {
        gain.connect(this.dest);
      }
      src.start(ctx.currentTime);
    } catch {
      // Ignore audio errors if blocked by autoplay policy
    }
  }

  public generateSfxWavBlobUrl(type: SfxPresetType): string {
    const sampleRate = 22050;
    const item = SFX_LIBRARY.find((s) => s.id === type);
    const duration = item ? Math.min(8.5, Math.max(0.45, item.durationSec)) : 1.0;
    const samples = synthesizeSamples(type, sampleRate, duration);
    const numSamples = samples.length;
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
      view.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, samples[i] * 32767)), true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }
}

export const webAudioEngine = new WebAudioEngine();
