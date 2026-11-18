import type { CSSProperties } from 'react';
import type { TransitionType, VisualEffectType, FilterPresetType } from './timelineEngine';

/**
 * Crisp inline SVG illustration of New York City on a bright blue-sky morning.
 * Used as the unified reference thumbnail across Effects, Transitions, and Filters
 * on both PC and Mobile so users immediately see each visual effect in action.
 */
const NY_MORNING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="48%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.78" cy="0.22" r="0.35">
      <stop offset="0%" stop-color="#FEF08A" stop-opacity="1"/>
      <stop offset="35%" stop-color="#FDE047" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0369A1"/>
      <stop offset="100%" stop-color="#0EA5E9"/>
    </linearGradient>
    <linearGradient id="bldg1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="50%" stop-color="#64748B"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="bldg2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="50%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
  </defs>
  <!-- Bright Morning Blue Sky -->
  <rect width="240" height="240" fill="url(#sky)"/>
  <rect width="240" height="240" fill="url(#sun)"/>
  <!-- Morning Sun -->
  <circle cx="187" cy="52" r="17" fill="#FEF9C3"/>
  <!-- Soft Morning Clouds -->
  <g fill="#FFFFFF" opacity="0.88">
    <ellipse cx="52" cy="44" rx="26" ry="9"/>
    <ellipse cx="66" cy="40" rx="18" ry="11"/>
    <ellipse cx="38" cy="45" rx="14" ry="8"/>
    <ellipse cx="136" cy="64" rx="22" ry="7"/>
    <ellipse cx="148" cy="60" rx="14" ry="8"/>
  </g>
  <!-- Distant Skyline Silhouette -->
  <g fill="#64748B" opacity="0.55">
    <rect x="8" y="118" width="18" height="62"/>
    <rect x="30" y="106" width="22" height="74"/>
    <rect x="58" y="122" width="16" height="58"/>
    <rect x="148" y="110" width="20" height="70"/>
    <rect x="174" y="100" width="24" height="80"/>
    <rect x="204" y="116" width="26" height="64"/>
  </g>
  <!-- Main Manhattan Skyscrapers -->
  <!-- Left Tower -->
  <rect x="14" y="126" width="24" height="58" fill="url(#bldg1)"/>
  <rect x="42" y="102" width="22" height="82" fill="url(#bldg2)"/>
  <!-- One WTC-style Glass Spire -->
  <polygon points="74,184 78,66 86,66 90,184" fill="#38BDF8" opacity="0.9"/>
  <polygon points="78,66 82,66 82,184 74,184" fill="#0284C7" opacity="0.85"/>
  <rect x="81" y="42" width="2" height="24" fill="#E2E8F0"/>
  <!-- Mid-town Blocks -->
  <rect x="94" y="118" width="20" height="66" fill="url(#bldg1)"/>
  <!-- Empire State Building -->
  <rect x="120" y="104" width="22" height="80" fill="url(#bldg2)"/>
  <rect x="124" y="84" width="14" height="20" fill="#94A3B8"/>
  <rect x="127" y="70" width="8" height="14" fill="#CBD5E1"/>
  <rect x="130" y="46" width="2" height="24" fill="#F8FAFC"/>
  <!-- Chrysler-style Tower -->
  <rect x="150" y="96" width="18" height="88" fill="url(#bldg1)"/>
  <polygon points="151,96 159,74 167,96" fill="#CBD5E1"/>
  <rect x="158" y="64" width="2" height="12" fill="#F8FAFC"/>
  <!-- Right Glass Towers -->
  <rect x="174" y="112" width="26" height="72" fill="#1E3A8A"/>
  <rect x="174" y="112" width="13" height="72" fill="#3B82F6" opacity="0.65"/>
  <rect x="205" y="124" width="25" height="60" fill="url(#bldg2)"/>
  <!-- Lit Windows Grid -->
  <g fill="#E0F2FE" opacity="0.72">
    <rect x="46" y="108" width="3" height="4"/><rect x="52" y="108" width="3" height="4"/><rect x="58" y="108" width="3" height="4"/>
    <rect x="46" y="116" width="3" height="4"/><rect x="52" y="116" width="3" height="4"/><rect x="58" y="116" width="3" height="4"/>
    <rect x="124" y="110" width="3" height="4"/><rect x="130" y="110" width="3" height="4"/><rect x="136" y="110" width="3" height="4"/>
    <rect x="124" y="120" width="3" height="4"/><rect x="130" y="120" width="3" height="4"/><rect x="136" y="120" width="3" height="4"/>
    <rect x="180" y="120" width="4" height="5"/><rect x="188" y="120" width="4" height="5"/>
    <rect x="180" y="130" width="4" height="5"/><rect x="188" y="130" width="4" height="5"/>
  </g>
  <!-- Hudson River & Morning Reflection -->
  <rect x="0" y="184" width="240" height="36" fill="url(#river)"/>
  <g fill="#BAE6FD" opacity="0.5">
    <rect x="76" y="190" width="14" height="2" rx="1"/>
    <rect x="122" y="195" width="20" height="2" rx="1"/>
    <rect x="176" y="192" width="18" height="2" rx="1"/>
    <rect x="40" y="202" width="24" height="2" rx="1"/>
    <rect x="150" y="206" width="22" height="2" rx="1"/>
  </g>
  <!-- Central Park / Waterfront Trees -->
  <path d="M0,220 Q20,206 42,216 Q65,204 92,217 Q122,205 150,218 Q182,204 212,215 Q228,208 240,216 L240,240 L0,240 Z" fill="#15803D"/>
  <path d="M0,226 Q35,216 74,226 Q116,214 162,226 Q200,216 240,225 L240,240 L0,240 Z" fill="#166534"/>
</svg>`;

export const NEW_YORK_MORNING_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(NY_MORNING_SVG)}`;

export interface VisualEffectCatalogEntry {
  id: VisualEffectType | string;
  uid: string;
  label: string;
  cat: 'all' | 'body' | 'retro' | 'glow';
  badge: string;
  swatch: string;
}

export const VISUAL_EFFECT_CATALOG: VisualEffectCatalogEntry[] = [
  { id: 'none', uid: 'fx-none', label: 'Không hiệu ứng', cat: 'all', badge: 'Gốc', swatch: 'linear-gradient(135deg, #181920 0%, #252834 100%)' },
  // Video & Camera FX
  { id: 'split_screen_4', uid: 'fx-split-4', label: 'Bức tường ghép 4', cat: 'all', badge: '4-Grid', swatch: 'linear-gradient(135deg, #1E1B4B 0%, #3B82F6 40%, #EC4899 100%)' },
  { id: 'split_screen_2', uid: 'fx-split-2', label: 'Chia đôi màn hình', cat: 'all', badge: 'Split', swatch: 'linear-gradient(135deg, #172554 0%, #1D4ED8 50%, #3B82F6 100%)' },
  { id: 'glitch', uid: 'fx-glitch', label: 'Quét nhiễu Glitch', cat: 'all', badge: 'Glitch', swatch: 'linear-gradient(135deg, #0F172A 0%, #06B6D4 50%, #3B82F6 100%)' },
  { id: 'rgb_split', uid: 'fx-rgb-split', label: 'Tách màu RGB', cat: 'all', badge: 'RGB', swatch: 'linear-gradient(135deg, #881337 0%, #4338CA 50%, #06B6D4 100%)' },
  { id: 'shake', uid: 'fx-shake', label: 'Rung lắc máy ảnh', cat: 'all', badge: 'Shake', swatch: 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #475569 100%)' },
  { id: 'zoom_pulse', uid: 'fx-zoom-pulse', label: 'Zoom nhịp Beat', cat: 'all', badge: 'Zoom', swatch: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 50%, #38BDF8 100%)' },
  { id: 'dolly_zoom', uid: 'fx-dolly-zoom', label: 'Thu phóng méo mó', cat: 'all', badge: 'Warp', swatch: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 50%, #94A3B8 100%)' },
  { id: 'ken_burns', uid: 'fx-ken-burns', label: 'Đứng hình Zoom chậm', cat: 'all', badge: 'KenBurns', swatch: 'linear-gradient(135deg, #334155 0%, #475569 50%, #64748B 100%)' },
  { id: 'bass_impact', uid: 'fx-bass-impact', label: 'Rung nhịp Bass', cat: 'all', badge: 'Bass', swatch: 'linear-gradient(135deg, #4C0519 0%, #9F1239 50%, #E11D48 100%)' },
  { id: 'kaleidoscope', uid: 'fx-kaleidoscope', label: 'Kính vạn hoa', cat: 'all', badge: 'Mirror', swatch: 'linear-gradient(135deg, #4A044E 0%, #86198F 50%, #D946EF 100%)' },
  { id: 'mirror_flip', uid: 'fx-mirror-flip', label: 'Lật gương đối xứng', cat: 'all', badge: 'Flip', swatch: 'linear-gradient(135deg, #0F172A 0%, #0EA5E9 100%)' },
  { id: 'speed_lines', uid: 'fx-speed-lines', label: 'Tia tốc độ Anime', cat: 'all', badge: 'Anime', swatch: 'linear-gradient(135deg, #451A03 0%, #92400E 50%, #F59E0B 100%)' },
  { id: 'blur_dream', uid: 'fx-blur-dream', label: 'Mờ ảo mộng', cat: 'all', badge: 'Blur', swatch: 'linear-gradient(135deg, #312E81 0%, #6366F1 100%)' },
  { id: 'underwater', uid: 'fx-underwater', label: 'Sóng đại dương', cat: 'all', badge: 'Ocean', swatch: 'linear-gradient(135deg, #083344 0%, #0E7490 50%, #06B6D4 100%)' },
  { id: 'cyber_holo', uid: 'fx-cyber-holo', label: 'Khối 3D Holo', cat: 'all', badge: '3D Holo', swatch: 'linear-gradient(135deg, #020617 0%, #1E293B 50%, #0F172A 100%)' },
  { id: 'matrix_rain', uid: 'fx-matrix-rain', label: 'Mã trận Matrix', cat: 'all', badge: 'Matrix', swatch: 'linear-gradient(135deg, #022C22 0%, #065F46 40%, #10B981 100%)' },
  { id: 'pixelate_8bit', uid: 'fx-pixelate', label: 'Điểm ảnh 8-Bit', cat: 'all', badge: '8-Bit', swatch: 'linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)' },
  // Body & Sci-Fi FX
  { id: 'clone_trail', uid: 'fx-clone-trail', label: 'Phân thân chuyển động', cat: 'body', badge: 'Clone', swatch: 'linear-gradient(135deg, #2E1065 0%, #581C87 50%, #9333EA 100%)' },
  { id: 'soul_out', uid: 'fx-soul-out', label: 'Tách bóng xuất hồn', cat: 'body', badge: 'Soul', swatch: 'linear-gradient(135deg, #111827 0%, #374151 50%, #6B7280 100%)' },
  { id: 'dreamy_glow', uid: 'fx-dreamy-glow', label: 'Hào quang lấp lánh', cat: 'body', badge: 'Glow', swatch: 'linear-gradient(135deg, #831843 0%, #BE185D 50%, #F472B6 100%)' },
  { id: 'neon_outline', uid: 'fx-neon-outline', label: 'Viền điện tử Neon', cat: 'body', badge: 'Neon', swatch: 'linear-gradient(135deg, #042F2E 0%, #0D9488 50%, #2DD4BF 100%)' },
  { id: 'lightning_storm', uid: 'fx-lightning-storm', label: 'Tia sét siêu nhiên', cat: 'body', badge: 'Storm', swatch: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #818CF8 100%)' },
  { id: 'thermal_vision', uid: 'fx-thermal-vision', label: 'Camera tầm nhiệt', cat: 'body', badge: 'Thermal', swatch: 'linear-gradient(135deg, #450A0A 0%, #DC2626 40%, #FBBF24 80%)' },
  { id: 'spotlight_stage', uid: 'fx-spotlight-stage', label: 'Đèn rọi sân khấu', cat: 'body', badge: 'Stage', swatch: 'linear-gradient(135deg, #18181B 0%, #27272A 50%, #A1A1AA 100%)' },
  { id: 'laser_eyes', uid: 'fx-laser-eyes', label: 'Kinh dị Đỏ Xanh', cat: 'body', badge: 'Horror', swatch: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 40%, #EF4444 90%)' },
  // Retro & Cinema FX
  { id: 'vhs', uid: 'fx-vhs', label: 'Băng VHS Hoài cổ', cat: 'retro', badge: 'VHS', swatch: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #60A5FA 100%)' },
  { id: 'fade_black', uid: 'fx-fade-black', label: 'Mờ dần điện ảnh', cat: 'retro', badge: 'Cinema', swatch: 'linear-gradient(135deg, #000000 0%, #18181B 100%)' },
  { id: 'super8_grain', uid: 'fx-super8-grain', label: 'Hạt phim 16mm', cat: 'retro', badge: '16mm', swatch: 'linear-gradient(135deg, #292524 0%, #57534E 50%, #A8A29E 100%)' },
  { id: 'old_tv', uid: 'fx-old-tv', label: 'Tivi CRT cong', cat: 'retro', badge: 'CRT', swatch: 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #64748B 100%)' },
  { id: 'dv_cam', uid: 'fx-dv-cam', label: 'Máy quay DV 2000s', cat: 'retro', badge: 'Y2K', swatch: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #3B82F6 100%)' },
  { id: 'cinema_bars', uid: 'fx-cinema-bars', label: 'Viền đen 2.35:1', cat: 'retro', badge: '2.35:1', swatch: 'linear-gradient(180deg, #000 20%, #1E293B 20%, #1E293B 80%, #000 80%)' },
  { id: 'halftone_comic', uid: 'fx-halftone-comic', label: 'Chấm bi truyện tranh', cat: 'retro', badge: 'Comic', swatch: 'linear-gradient(135deg, #701A75 0%, #A21CAF 50%, #F472B6 100%)' },
  { id: 'night_vision', uid: 'fx-night-vision', label: 'Ống nhòm đêm NVG', cat: 'retro', badge: 'NVG', swatch: 'linear-gradient(135deg, #052E16 0%, #14532D 50%, #22C55E 100%)' },
  { id: 'sketch_pencil', uid: 'fx-sketch-pencil', label: 'Tranh Phác Thảo Bút Chì', cat: 'retro', badge: 'Sketch', swatch: 'linear-gradient(135deg, #D4D4D8 0%, #52525B 100%)' },
  // Light, Glow & Weather FX
  { id: 'flash', uid: 'fx-flash', label: 'Nháy chớp trắng', cat: 'glow', badge: 'Flash', swatch: 'linear-gradient(135deg, #E2E8F0 0%, #FFFFFF 50%, #CBD5E1 100%)' },
  { id: 'neon_glow', uid: 'fx-neon-glow', label: 'Phát sáng Neon', cat: 'glow', badge: 'Neon', swatch: 'linear-gradient(135deg, #0891B2 0%, #EC4899 100%)' },
  { id: 'strobe_party', uid: 'fx-strobe-party', label: 'Đèn chớp vũ trường', cat: 'glow', badge: 'Club', swatch: 'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 50%, #EC4899 100%)' },
  { id: 'golden_rays', uid: 'fx-golden-rays', label: 'Tia nắng hoàng hôn', cat: 'glow', badge: 'Sun', swatch: 'linear-gradient(135deg, #78350F 0%, #D97706 50%, #F59E0B 100%)' },
  { id: 'prism_rainbow', uid: 'fx-prism-rainbow', label: 'Lăng kính cầu vồng', cat: 'glow', badge: 'Prism', swatch: 'linear-gradient(135deg, #EC4899 0%, #FACC15 50%, #06B6D4 100%)' },
  { id: 'fire_sparks', uid: 'fx-fire-sparks', label: 'Đốm lửa rực cháy', cat: 'glow', badge: 'Fire', swatch: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 50%, #F97316 100%)' },
  { id: 'snowfall', uid: 'fx-snowfall', label: 'Tuyết rơi mùa đông', cat: 'glow', badge: 'Snow', swatch: 'linear-gradient(135deg, #1E293B 0%, #38BDF8 50%, #E0F2FE 100%)' },
  { id: 'sakura_petals', uid: 'fx-sakura-petals', label: 'Hoa anh đào bay', cat: 'glow', badge: 'Sakura', swatch: 'linear-gradient(135deg, #831843 0%, #DB2777 50%, #F472B6 100%)' },
  { id: 'confetti_party', uid: 'fx-confetti-party', label: 'Pháo giấy sinh nhật', cat: 'glow', badge: 'Party', swatch: 'linear-gradient(135deg, #854D0E 0%, #F59E0B 40%, #EC4899 80%)' },
];

export interface TransitionCatalogEntry {
  id: TransitionType | string;
  uid: string;
  label: string;
  cat: 'all' | 'camera' | 'mg' | 'glitch';
  dur: number;
  icon: string;
  swatch: string;
}

export const TRANSITION_CATALOG: TransitionCatalogEntry[] = [
  { id: 'none', uid: 'tr-none', label: 'Không chuyển tiếp', cat: 'all', dur: 0.5, icon: '⊘', swatch: 'linear-gradient(135deg, #181920 0%, #252834 100%)' },
  // Camera & Zoom
  { id: 'zoom_in', uid: 'tr-zoom-in', label: 'Kéo gần (Zoom In)', cat: 'camera', dur: 0.6, icon: '🔍', swatch: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)' },
  { id: 'pull_out', uid: 'tr-pull-out', label: 'Thu xa (Pull Out)', cat: 'camera', dur: 0.5, icon: '🔎', swatch: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #60A5FA 100%)' },
  { id: 'spin', uid: 'tr-spin', label: 'Xoay vòng 360°', cat: 'camera', dur: 0.7, icon: '🔄', swatch: 'linear-gradient(135deg, #311042 0%, #7E22CE 50%, #C084FC 100%)' },
  { id: 'whip_pan', uid: 'tr-whip-pan', label: 'Lia máy (Whip Pan)', cat: 'camera', dur: 0.4, icon: '💨', swatch: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 50%, #38BDF8 100%)' },
  { id: 'roll_shutter', uid: 'tr-roll-shutter', label: 'Cuộn ống kính', cat: 'camera', dur: 0.6, icon: '🌀', swatch: 'linear-gradient(135deg, #134E4A 0%, #0D9488 50%, #2DD4BF 100%)' },
  { id: 'radial_blur', uid: 'tr-radial-blur', label: 'Xoáy mờ tốc độ', cat: 'camera', dur: 0.5, icon: '💫', swatch: 'linear-gradient(135deg, #1E3A8A 0%, #0EA5E9 100%)' },
  { id: 'heartbeat_zoom', uid: 'tr-heartbeat-zoom', label: 'Nhịp đập Zoom', cat: 'camera', dur: 0.6, icon: '💓', swatch: 'linear-gradient(135deg, #881337 0%, #F43F5E 100%)' },
  { id: 'cube_3d', uid: 'tr-cube-3d', label: 'Xoay khối lập phương 3D', cat: 'camera', dur: 0.7, icon: '🧊', swatch: 'linear-gradient(135deg, #0F172A 0%, #38BDF8 100%)' },
  // Motion Graphics (MG)
  { id: 'cross_dissolve', uid: 'tr-cross-dissolve', label: 'Hòa tan (Dissolve)', cat: 'mg', dur: 0.8, icon: '⋈', swatch: 'linear-gradient(135deg, #14532D 0%, #16A34A 50%, #4ADE80 100%)' },
  { id: 'slide_left', uid: 'tr-slide-left', label: 'Trượt sang trái', cat: 'mg', dur: 0.6, icon: '◀', swatch: 'linear-gradient(135deg, #701A75 0%, #C026D3 50%, #F472B6 100%)' },
  { id: 'slide_right', uid: 'tr-slide-right', label: 'Trượt sang phải', cat: 'mg', dur: 0.6, icon: '▶', swatch: 'linear-gradient(135deg, #581C87 0%, #A855F7 100%)' },
  { id: 'push_up', uid: 'tr-push-up', label: 'Đẩy lên (Push Up)', cat: 'mg', dur: 0.5, icon: '▲', swatch: 'linear-gradient(135deg, #1E293B 0%, #2563EB 50%, #38BDF8 100%)' },
  { id: 'wipe_split', uid: 'tr-wipe-split', label: 'Tách đôi (Split)', cat: 'mg', dur: 0.6, icon: '◫', swatch: 'linear-gradient(135deg, #831843 0%, #DB2777 50%, #F43F5E 100%)' },
  { id: 'clock_sweep', uid: 'tr-clock-sweep', label: 'Quét kim đồng hồ', cat: 'mg', dur: 0.7, icon: '⏱', swatch: 'linear-gradient(135deg, #78350F 0%, #D97706 50%, #FBBF24 100%)' },
  { id: 'iris_circle', uid: 'tr-iris-circle', label: 'Vòng tròn mở rộng', cat: 'mg', dur: 0.6, icon: '⭕', swatch: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)' },
  { id: 'blinds_venetian', uid: 'tr-blinds', label: 'Cửa chớp ngang', cat: 'mg', dur: 0.6, icon: '☰', swatch: 'linear-gradient(135deg, #1E293B 0%, #64748B 100%)' },
  { id: 'page_curl', uid: 'tr-page-curl', label: 'Lật trang sách', cat: 'mg', dur: 0.7, icon: '📄', swatch: 'linear-gradient(135deg, #334155 0%, #94A3B8 100%)' },
  // Glitch, Light & Film
  { id: 'black_fade', uid: 'tr-black-fade', label: 'Chuyển đen (Fade Black)', cat: 'glitch', dur: 0.8, icon: '⬛', swatch: 'linear-gradient(135deg, #09090B 0%, #18181B 50%, #27272A 100%)' },
  { id: 'white_flash', uid: 'tr-white-flash', label: 'Chớp trắng (Flash)', cat: 'glitch', dur: 0.4, icon: '⚡', swatch: 'linear-gradient(135deg, #52525B 0%, #A1A1AA 50%, #E4E4E7 100%)' },
  { id: 'glitch_transition', uid: 'tr-glitch-cut', label: 'Nhiễu sóng (Glitch)', cat: 'glitch', dur: 0.5, icon: '📡', swatch: 'linear-gradient(135deg, #0F172A 0%, #06B6D4 50%, #EC4899 100%)' },
  { id: 'rgb_split', uid: 'tr-rgb-split', label: 'Tách kênh RGB', cat: 'glitch', dur: 0.5, icon: '📺', swatch: 'linear-gradient(135deg, #881337 0%, #4338CA 50%, #06B6D4 100%)' },
  { id: 'film_burn', uid: 'tr-film-burn', label: 'Cháy sáng phim', cat: 'glitch', dur: 0.7, icon: '🔥', swatch: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 50%, #FDE047 100%)' },
  { id: 'light_leak', uid: 'tr-light-leak', label: 'Lóe sáng lăng kính', cat: 'glitch', dur: 0.6, icon: '✨', swatch: 'linear-gradient(135deg, #9D174D 0%, #F59E0B 100%)' },
  { id: 'shatter_glass', uid: 'tr-shatter-glass', label: 'Vỡ kính chuyển cảnh', cat: 'glitch', dur: 0.6, icon: '💎', swatch: 'linear-gradient(135deg, #0F172A 0%, #38BDF8 100%)' },
];

export interface FilterCatalogEntry {
  id: FilterPresetType | string;
  uid: string;
  label: string;
  cat: 'all' | 'cinema' | 'life' | 'retro';
  swatch: string;
  cssFilter: string;
}

export const FILTER_CATALOG: FilterCatalogEntry[] = [
  { id: 'none', uid: 'lut-none', label: 'Màu gốc (Original)', cat: 'all', swatch: 'linear-gradient(135deg,#334155,#64748B)', cssFilter: 'none' },
  // Cinema LUT
  { id: 'teal_orange', uid: 'lut-teal-orange', label: 'Điện ảnh (Teal & Orange)', cat: 'cinema', swatch: 'linear-gradient(135deg,#0D9488,#EA580C)', cssFilter: 'contrast(1.2) saturate(1.35) sepia(0.18) hue-rotate(-10deg)' },
  { id: 'cinematic', uid: 'lut-cinematic', label: 'Cinema Hollywood', cat: 'cinema', swatch: 'linear-gradient(135deg,#0F766E,#1E293B)', cssFilter: 'contrast(1.22) saturate(1.1) brightness(0.95)' },
  { id: 'cyberpunk', uid: 'lut-cyberpunk', label: 'Cyberpunk Neon 2077', cat: 'cinema', swatch: 'linear-gradient(135deg,#06B6D4,#D946EF)', cssFilter: 'contrast(1.35) saturate(1.9) hue-rotate(285deg)' },
  { id: 'kodak_2383', uid: 'lut-kodak-2383', label: 'Kodak 2383 Film Print', cat: 'cinema', swatch: 'linear-gradient(135deg,#1E3A8A,#D97706)', cssFilter: 'contrast(1.25) saturate(1.15) sepia(0.15)' },
  { id: 'matrix_green', uid: 'lut-matrix-green', label: 'Sci-Fi Matrix Emerald', cat: 'cinema', swatch: 'linear-gradient(135deg,#064E3B,#10B981)', cssFilter: 'contrast(1.3) saturate(1.4) hue-rotate(95deg)' },
  { id: 'anamorphic_blue', uid: 'lut-anamorphic-blue', label: 'Anamorphic Lạnh', cat: 'cinema', swatch: 'linear-gradient(135deg,#0F172A,#38BDF8)', cssFilter: 'contrast(1.2) saturate(1.15) hue-rotate(15deg) brightness(0.95)' },
  { id: 'imax_hdr', uid: 'lut-imax-hdr', label: 'IMAX Blockbuster HDR', cat: 'cinema', swatch: 'linear-gradient(135deg,#7C2D12,#F59E0B)', cssFilter: 'contrast(1.35) saturate(1.45) brightness(1.05)' },
  // Life & Food
  { id: 'vivid', uid: 'lut-vivid', label: 'Rực rỡ (Vivid)', cat: 'life', swatch: 'linear-gradient(135deg,#DC2626,#FACC15)', cssFilter: 'contrast(1.18) saturate(1.7) brightness(1.06)' },
  { id: 'vibrant', uid: 'lut-vibrant', label: 'Sống động Mạng Xã Hội', cat: 'life', swatch: 'linear-gradient(135deg,#BE185D,#38BDF8)', cssFilter: 'contrast(1.15) saturate(1.55) brightness(1.05)' },
  { id: 'fuji_velvia', uid: 'lut-fuji-velvia', label: 'Fujifilm Velvia Nhật Bản', cat: 'life', swatch: 'linear-gradient(135deg,#065F46,#6EE7B7)', cssFilter: 'contrast(1.15) saturate(1.4) hue-rotate(-6deg)' },
  { id: 'golden_hour', uid: 'lut-golden-hour', label: 'Nắng chiều Hoàng hôn', cat: 'life', swatch: 'linear-gradient(135deg,#9A3412,#FDE047)', cssFilter: 'sepia(0.35) saturate(1.45) brightness(1.05) hue-rotate(-14deg)' },
  { id: 'cafe_latte', uid: 'lut-cafe-latte', label: 'Tone Hàn Quốc (Latte)', cat: 'life', swatch: 'linear-gradient(135deg,#78716C,#F5F5F4)', cssFilter: 'brightness(1.08) contrast(0.92) saturate(0.85) sepia(0.15)' },
  { id: 'tropical_vibe', uid: 'lut-tropical-vibe', label: 'Biển xanh Nhiệt đới', cat: 'life', swatch: 'linear-gradient(135deg,#0284C7,#2DD4BF)', cssFilter: 'saturate(1.5) brightness(1.06) hue-rotate(-8deg)' },
  { id: 'warm', uid: 'lut-warm', label: 'Ấm áp (Warm)', cat: 'life', swatch: 'linear-gradient(135deg,#C2410C,#FBBF24)', cssFilter: 'sepia(0.28) saturate(1.3) brightness(1.04)' },
  { id: 'cool', uid: 'lut-cool', label: 'Mát lạnh (Cool)', cat: 'life', swatch: 'linear-gradient(135deg,#1D4ED8,#38BDF8)', cssFilter: 'saturate(1.1) hue-rotate(14deg) brightness(1.02)' },
  // Retro & B&W
  { id: 'vintage', uid: 'lut-vintage', label: 'Hoài cổ (Vintage)', cat: 'retro', swatch: 'linear-gradient(135deg,#78350F,#FBBF24)', cssFilter: 'sepia(0.55) contrast(1.1) brightness(0.95)' },
  { id: 'bw', uid: 'lut-bw', label: 'Đen trắng (B&W Noir)', cat: 'retro', swatch: 'linear-gradient(135deg,#18181B,#71717A)', cssFilter: 'grayscale(1) contrast(1.35)' },
  { id: 'polaroid_90s', uid: 'lut-polaroid', label: 'Ảnh Polaroid 90s', cat: 'retro', swatch: 'linear-gradient(135deg,#7C2D12,#A8A29E)', cssFilter: 'sepia(0.32) contrast(0.95) brightness(1.08) saturate(0.9)' },
  { id: 'tokyo_night', uid: 'lut-tokyo-night', label: 'Đêm Tokyo Tím Xanh', cat: 'retro', swatch: 'linear-gradient(135deg,#312E81,#EC4899)', cssFilter: 'contrast(1.28) saturate(1.5) hue-rotate(220deg) brightness(0.9)' },
];

export interface VisualPreviewSpec {
  imgStyle: CSSProperties;
  overlayStyle?: CSSProperties;
  splitLayout?: '2x2' | '1x2' | 'diagonal' | 'crt' | 'cinema_bars' | 'blinds' | 'iris' | 'wipe';
  badgeIcon?: string;
}

export function getVisualEffectPreview(id: string): VisualPreviewSpec {
  switch (id) {
    case 'none':
      return { imgStyle: {} };
    case 'split_screen_4':
      return { imgStyle: {}, splitLayout: '2x2' };
    case 'split_screen_2':
      return { imgStyle: {}, splitLayout: '1x2' };
    case 'glitch':
      return {
        imgStyle: { filter: 'contrast(1.35) saturate(1.5)', transform: 'translateX(-2px) skewX(-3deg)' },
        overlayStyle: {
          background:
            'repeating-linear-gradient(0deg, rgba(6,182,212,0.28) 0px, rgba(6,182,212,0.28) 2px, transparent 2px, transparent 6px, rgba(236,72,153,0.24) 6px, rgba(236,72,153,0.24) 8px)',
        },
      };
    case 'rgb_split':
      return {
        imgStyle: { filter: 'contrast(1.25) saturate(1.6)', transform: 'scale(1.04)' },
        overlayStyle: {
          background: 'linear-gradient(90deg, rgba(239,68,68,0.32) 0%, transparent 45%, rgba(6,182,212,0.35) 100%)',
          mixBlendMode: 'screen',
        },
      };
    case 'shake':
      return {
        imgStyle: { transform: 'scale(1.1) rotate(-3deg) translate(2px, -2px)', filter: 'blur(0.6px) contrast(1.1)' },
      };
    case 'zoom_pulse':
    case 'dolly_zoom':
    case 'ken_burns':
      return {
        imgStyle: { transform: 'scale(1.28)', filter: 'contrast(1.12) saturate(1.2)' },
        overlayStyle: {
          background: 'radial-gradient(circle, transparent 42%, rgba(0,202,224,0.28) 100%)',
        },
      };
    case 'bass_impact':
      return {
        imgStyle: { transform: 'scale(1.16)', filter: 'contrast(1.3) saturate(1.4)' },
        overlayStyle: {
          background: 'radial-gradient(circle, transparent 35%, rgba(225,29,72,0.45) 100%)',
        },
      };
    case 'kaleidoscope':
      return {
        imgStyle: { filter: 'saturate(1.6) hue-rotate(45deg)', transform: 'scale(1.15) rotate(12deg)' },
        splitLayout: 'diagonal',
      };
    case 'mirror_flip':
      return {
        imgStyle: { transform: 'scaleX(-1)' },
        splitLayout: '1x2',
      };
    case 'speed_lines':
      return {
        imgStyle: { transform: 'scale(1.15)', filter: 'contrast(1.25) saturate(1.3)' },
        overlayStyle: {
          background:
            'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.45) 0deg 3deg, transparent 3deg 15deg)',
        },
      };
    case 'blur_dream':
      return {
        imgStyle: { filter: 'blur(2px) brightness(1.12) saturate(1.25)' },
      };
    case 'underwater':
      return {
        imgStyle: { filter: 'hue-rotate(15deg) saturate(1.35) brightness(0.95)', transform: 'scale(1.05) skewY(2deg)' },
        overlayStyle: {
          background: 'linear-gradient(180deg, rgba(6,182,212,0.18) 0%, rgba(14,116,144,0.45) 100%)',
        },
      };
    case 'cyber_holo':
      return {
        imgStyle: { filter: 'hue-rotate(185deg) saturate(1.8) contrast(1.25)' },
        overlayStyle: {
          background: 'repeating-linear-gradient(0deg, rgba(0,202,224,0.22) 0 1px, transparent 1px 4px)',
        },
      };
    case 'matrix_rain':
      return {
        imgStyle: { filter: 'hue-rotate(85deg) saturate(1.8) contrast(1.35) brightness(0.85)' },
        overlayStyle: {
          background: 'repeating-linear-gradient(90deg, rgba(16,185,129,0.28) 0 2px, transparent 2px 9px)',
        },
      };
    case 'pixelate_8bit':
      return {
        imgStyle: { filter: 'contrast(1.4) saturate(1.5)' },
        overlayStyle: {
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.18) 1px, transparent 1px)',
          backgroundSize: '6px 6px',
        },
      };
    case 'clone_trail':
    case 'soul_out':
      return {
        imgStyle: { filter: 'contrast(1.15) saturate(1.2)', transform: 'translateX(-4px)' },
        overlayStyle: {
          background: 'linear-gradient(90deg, rgba(168,85,247,0.35) 0%, transparent 65%)',
        },
      };
    case 'dreamy_glow':
    case 'neon_glow':
    case 'neon_outline':
      return {
        imgStyle: { filter: 'brightness(1.18) saturate(1.7) contrast(1.25)' },
        overlayStyle: {
          background: 'radial-gradient(circle at 50% 40%, rgba(244,114,182,0.35), rgba(0,202,224,0.25))',
          mixBlendMode: 'screen',
        },
      };
    case 'lightning_storm':
      return {
        imgStyle: { filter: 'brightness(1.25) contrast(1.45) hue-rotate(20deg)' },
        overlayStyle: {
          background: 'linear-gradient(125deg, transparent 42%, rgba(255,255,255,0.85) 48%, rgba(129,140,248,0.6) 52%, transparent 58%)',
        },
      };
    case 'thermal_vision':
      return {
        imgStyle: { filter: 'hue-rotate(195deg) saturate(3.2) contrast(1.55)' },
      };
    case 'spotlight_stage':
      return {
        imgStyle: { filter: 'contrast(1.2) brightness(0.95)' },
        overlayStyle: {
          background: 'radial-gradient(circle at 50% 45%, transparent 28%, rgba(0,0,0,0.78) 78%)',
        },
      };
    case 'laser_eyes':
      return {
        imgStyle: { filter: 'contrast(1.45) saturate(1.6)' },
        overlayStyle: {
          background: 'radial-gradient(circle, rgba(239,68,68,0.45) 0%, rgba(30,58,138,0.45) 100%)',
        },
      };
    case 'vhs':
    case 'dv_cam':
      return {
        imgStyle: { filter: 'sepia(0.22) contrast(1.15) saturate(1.25) blur(0.4px)' },
        overlayStyle: {
          background:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 4px)',
        },
      };
    case 'fade_black':
      return {
        imgStyle: { filter: 'brightness(0.75) contrast(1.15)' },
        overlayStyle: {
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.82) 100%)',
        },
      };
    case 'super8_grain':
      return {
        imgStyle: { filter: 'sepia(0.38) contrast(1.2) saturate(0.9)' },
      };
    case 'old_tv':
      return {
        imgStyle: { filter: 'saturate(0.8) contrast(1.2)' },
        splitLayout: 'crt',
      };
    case 'cinema_bars':
      return {
        imgStyle: { filter: 'contrast(1.15) saturate(1.1)' },
        splitLayout: 'cinema_bars',
      };
    case 'halftone_comic':
      return {
        imgStyle: { filter: 'contrast(1.6) saturate(1.8)' },
        overlayStyle: {
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.35) 1.2px, transparent 1.2px)',
          backgroundSize: '5px 5px',
        },
      };
    case 'night_vision':
      return {
        imgStyle: { filter: 'grayscale(1) sepia(1) hue-rotate(70deg) saturate(3) contrast(1.3)' },
        overlayStyle: {
          background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.65) 100%)',
        },
      };
    case 'sketch_pencil':
      return {
        imgStyle: { filter: 'grayscale(1) contrast(2.2) brightness(1.35)' },
      };
    case 'flash':
    case 'strobe_party':
      return {
        imgStyle: { filter: 'brightness(1.45) contrast(1.15)' },
        overlayStyle: {
          background: 'radial-gradient(circle, rgba(255,255,255,0.72) 0%, transparent 72%)',
        },
      };
    case 'golden_rays':
      return {
        imgStyle: { filter: 'sepia(0.3) saturate(1.45) brightness(1.1)' },
        overlayStyle: {
          background: 'radial-gradient(circle at 80% 20%, rgba(251,191,36,0.65), transparent 65%)',
        },
      };
    case 'prism_rainbow':
      return {
        imgStyle: { filter: 'saturate(1.5)' },
        overlayStyle: {
          background: 'linear-gradient(125deg, rgba(236,72,153,0.35), rgba(250,204,21,0.3), rgba(6,182,212,0.35))',
          mixBlendMode: 'screen',
        },
      };
    case 'fire_sparks':
      return {
        imgStyle: { filter: 'sepia(0.35) saturate(1.6) contrast(1.2)' },
        overlayStyle: {
          backgroundImage:
            'radial-gradient(circle, #FDE047 1.5px, transparent 1.5px), radial-gradient(circle, #FB923C 2px, transparent 2px)',
          backgroundSize: '18px 18px, 26px 26px',
          backgroundPosition: '2px 4px, 11px 13px',
        },
      };
    case 'snowfall':
      return {
        imgStyle: { filter: 'brightness(1.08) saturate(0.85) hue-rotate(8deg)' },
        overlayStyle: {
          backgroundImage:
            'radial-gradient(circle, #FFFFFF 1.6px, transparent 1.6px), radial-gradient(circle, #E0F2FE 1.1px, transparent 1.1px)',
          backgroundSize: '16px 16px, 23px 23px',
          backgroundPosition: '0 0, 9px 11px',
        },
      };
    case 'sakura_petals':
      return {
        imgStyle: { filter: 'saturate(1.25) brightness(1.06)' },
        overlayStyle: {
          backgroundImage:
            'radial-gradient(ellipse 3px 2px, #F9A8D4 80%, transparent 85%), radial-gradient(ellipse 2.5px 1.8px, #F472B6 80%, transparent 85%)',
          backgroundSize: '19px 19px, 27px 27px',
          backgroundPosition: '3px 5px, 12px 14px',
        },
      };
    case 'confetti_party':
      return {
        imgStyle: { filter: 'saturate(1.35) brightness(1.05)' },
        overlayStyle: {
          backgroundImage:
            'radial-gradient(circle, #FACC15 1.8px, transparent 1.8px), radial-gradient(circle, #EC4899 1.8px, transparent 1.8px), radial-gradient(circle, #38BDF8 1.8px, transparent 1.8px)',
          backgroundSize: '18px 18px, 22px 22px, 26px 26px',
          backgroundPosition: '2px 3px, 10px 12px, 6px 16px',
        },
      };
    default:
      return { imgStyle: { filter: 'contrast(1.15) saturate(1.25)' } };
  }
}

export function getTransitionPreview(id: string): VisualPreviewSpec {
  switch (id) {
    case 'none':
      return { imgStyle: {} };
    case 'zoom_in':
    case 'heartbeat_zoom':
      return {
        imgStyle: { transform: 'scale(1.32)', filter: 'contrast(1.1)' },
        overlayStyle: {
          background: 'radial-gradient(circle, transparent 40%, rgba(0,202,224,0.35) 100%)',
        },
      };
    case 'pull_out':
      return {
        imgStyle: { transform: 'scale(0.76)', borderRadius: '6px' },
        overlayStyle: { boxShadow: 'inset 0 0 0 6px rgba(0,0,0,0.65)' },
      };
    case 'spin':
    case 'radial_blur':
      return {
        imgStyle: { transform: 'rotate(18deg) scale(1.22)', filter: 'blur(0.7px)' },
      };
    case 'whip_pan':
      return {
        imgStyle: { transform: 'scaleX(1.25) translateX(-4px)', filter: 'blur(1.6px) saturate(1.2)' },
      };
    case 'roll_shutter':
    case 'cube_3d':
      return {
        imgStyle: { transform: 'perspective(140px) rotateY(22deg) scale(1.05)' },
      };
    case 'cross_dissolve':
      return {
        imgStyle: { opacity: 0.72, filter: 'saturate(1.25)' },
        overlayStyle: {
          background: 'linear-gradient(135deg, rgba(245,158,11,0.38), rgba(56,189,248,0.28))',
        },
      };
    case 'slide_left':
      return {
        imgStyle: { transform: 'translateX(-16%)' },
        splitLayout: 'wipe',
      };
    case 'slide_right':
      return {
        imgStyle: { transform: 'translateX(16%)' },
        splitLayout: 'wipe',
      };
    case 'push_up':
      return {
        imgStyle: { transform: 'translateY(-16%)' },
        overlayStyle: {
          background: 'linear-gradient(180deg, transparent 58%, rgba(15,23,42,0.85) 60%)',
        },
      };
    case 'wipe_split':
      return {
        imgStyle: {},
        splitLayout: '1x2',
      };
    case 'clock_sweep':
      return {
        imgStyle: {},
        overlayStyle: {
          background: 'conic-gradient(from 0deg, transparent 0deg 210deg, rgba(15,23,42,0.75) 210deg 360deg)',
        },
      };
    case 'iris_circle':
      return {
        imgStyle: {},
        splitLayout: 'iris',
      };
    case 'blinds_venetian':
      return {
        imgStyle: {},
        splitLayout: 'blinds',
      };
    case 'page_curl':
      return {
        imgStyle: {},
        overlayStyle: {
          background: 'linear-gradient(315deg, rgba(255,255,255,0.88) 0% 18%, rgba(15,23,42,0.45) 18% 24%, transparent 24%)',
        },
      };
    case 'black_fade':
      return {
        imgStyle: { filter: 'brightness(0.65)' },
        overlayStyle: {
          background: 'linear-gradient(90deg, transparent 25%, rgba(0,0,0,0.92) 85%)',
        },
      };
    case 'white_flash':
      return {
        imgStyle: { filter: 'brightness(1.45)' },
        overlayStyle: {
          background: 'radial-gradient(circle, rgba(255,255,255,0.88) 0%, transparent 72%)',
        },
      };
    case 'glitch_transition':
    case 'rgb_split':
      return {
        imgStyle: { filter: 'contrast(1.35) saturate(1.6)', transform: 'skewX(-5deg)' },
        overlayStyle: {
          background: 'linear-gradient(90deg, rgba(239,68,68,0.35), transparent 50%, rgba(6,182,212,0.4))',
        },
      };
    case 'film_burn':
    case 'light_leak':
      return {
        imgStyle: { filter: 'sepia(0.35) saturate(1.5)' },
        overlayStyle: {
          background: 'linear-gradient(135deg, rgba(249,115,22,0.78) 0%, rgba(253,224,71,0.45) 45%, transparent 75%)',
        },
      };
    case 'shatter_glass':
      return {
        imgStyle: { filter: 'contrast(1.25)' },
        splitLayout: 'diagonal',
      };
    default:
      return { imgStyle: {} };
  }
}

export function getFilterPreview(id: string): VisualPreviewSpec {
  const found = FILTER_CATALOG.find((f) => f.id === id);
  return {
    imgStyle: { filter: found?.cssFilter && found.cssFilter !== 'none' ? found.cssFilter : undefined },
  };
}
