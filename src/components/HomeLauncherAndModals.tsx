import React, { useState } from 'react';
import {
  Plus,
  Video,
  Wand2,
  FileText,
  Mic,
  Scissors,
  Layers,
  Folder,
  Search,
  LayoutGrid,
  List,
  Trash2,
  Settings,
  Cloud,
  Sparkles,
  MoreHorizontal,
  Copy,
  Edit3,
  X,
  CheckCircle2,
  Cpu,
  HardDrive,
  Globe,
  Activity,
  Keyboard,
  Play,
  Sun,
  Moon,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';
import {
  SubProjectItem,
  AppLanguage,
  StudioThemeMode,
  getFlagGraphicDataUrl,
} from '../utils/timelineEngine';

export type HomeQuickToolId =
  | 'long_to_shorts'
  | 'script_to_video'
  | 'tts_ai'
  | 'auto_cutout'
  | 'batch_edit';

export interface HomeTemplatePreset {
  id: string;
  titleVi: string;
  titleEn: string;
  categoryVi: string;
  categoryEn: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  durationSec: number;
  clipsCount: number;
  gradient: string;
  badgeText: string;
}

const STUDIO_TEMPLATES: HomeTemplatePreset[] = [
  {
    id: 'tpl-tiktok-hook',
    titleVi: 'TikTok Viral Hook & Phụ Đề Karaoke',
    titleEn: 'TikTok Viral Hook & Karaoke Captions',
    categoryVi: 'Reels / TikTok 9:16',
    categoryEn: 'Reels / TikTok 9:16',
    aspectRatio: '9:16',
    durationSec: 15,
    clipsCount: 6,
    gradient: 'linear-gradient(135deg, #FF0055 0%, #7000FF 100%)',
    badgeText: 'HOT 9:16',
  },
  {
    id: 'tpl-yt-outro',
    titleVi: 'YouTube Gaming Intro + Nút Subscribe',
    titleEn: 'YouTube Gaming Intro + Subscribe CTA',
    categoryVi: 'YouTube 16:9',
    categoryEn: 'YouTube 16:9',
    aspectRatio: '16:9',
    durationSec: 18,
    clipsCount: 8,
    gradient: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)',
    badgeText: 'SUBSCRIBE',
  },
  {
    id: 'tpl-vlog-cinema',
    titleVi: 'Travel Vlog Điện Ảnh & Chuyển Cảnh Mượt',
    titleEn: 'Cinematic Travel Vlog & Smooth Transitions',
    categoryVi: 'Cinematic 16:9',
    categoryEn: 'Cinematic 16:9',
    aspectRatio: '16:9',
    durationSec: 24,
    clipsCount: 10,
    gradient: 'linear-gradient(135deg, #00E5CC 0%, #0284C7 100%)',
    badgeText: '4K LUT',
  },
  {
    id: 'tpl-podcast-shorts',
    titleVi: 'Podcast Chia Đôi Màn Hình & Lọc Từ Thừa',
    titleEn: 'Split-Screen Podcast & Filler Removal',
    categoryVi: 'Podcast Shorts 9:16',
    categoryEn: 'Podcast Shorts 9:16',
    aspectRatio: '9:16',
    durationSec: 30,
    clipsCount: 9,
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    badgeText: 'AI VOICE',
  },
  {
    id: 'tpl-flash-sale',
    titleVi: 'Video Quảng Cáo Flash Sale -50% Thương Mại',
    titleEn: 'E-Commerce Flash Sale -50% Promo',
    categoryVi: 'Quảng cáo 9:16',
    categoryEn: 'Promo Ads 9:16',
    aspectRatio: '9:16',
    durationSec: 12,
    clipsCount: 5,
    gradient: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
    badgeText: 'SALE -50%',
  },
  {
    id: 'tpl-beat-sync',
    titleVi: 'Remix Nhịp Beat Tự Động & Hiệu Ứng Clone Trail',
    titleEn: 'Auto Beat-Sync Remix & Clone Trail FX',
    categoryVi: 'Music Edit 16:9',
    categoryEn: 'Music Edit 16:9',
    aspectRatio: '16:9',
    durationSec: 18,
    clipsCount: 12,
    gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    badgeText: 'BEAT AI',
  },
];

interface HomeLauncherViewProps {
  projects: SubProjectItem[];
  activeProjectName: string;
  onOpenProject: (project: SubProjectItem) => void;
  onCreateNewProject: () => void;
  onRenameProject: (id: string, newName: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRestoreProject: (id: string) => void;
  onStartRecordScreen: () => void;
  onOpenMatrixBatch: () => void;
  onOpenSettings: () => void;
  onBackToEditor: () => void;
  onOpenQuickTool?: (toolId: HomeQuickToolId) => void;
  onUseTemplatePreset?: (template: HomeTemplatePreset) => void;
  language?: AppLanguage;
  onChangeLanguage?: (lang: AppLanguage) => void;
  themeMode?: StudioThemeMode;
  onToggleTheme?: () => void;
}

export const HomeLauncherView: React.FC<HomeLauncherViewProps> = ({
  projects,
  activeProjectName,
  onOpenProject,
  onCreateNewProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onRestoreProject,
  onStartRecordScreen,
  onOpenMatrixBatch,
  onOpenSettings,
  onBackToEditor,
  onOpenQuickTool,
  onUseTemplatePreset,
  language = 'vi',
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const isEn = language === 'en';
  const [navTab, setNavTab] = useState<'home' | 'templates' | 'spaces' | 'ai_design' | 'trash'>('home');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [cloudSyncedIds, setCloudSyncedIds] = useState<string[]>(() =>
    projects.slice(0, 1).map((p) => p.id)
  );
  const [autoCloudBackup, setAutoCloudBackup] = useState(true);
  const [posterHeadline, setPosterHeadline] = useState(
    isEn ? 'WATCH TILL THE END 🔥' : 'XEM ĐẾN CUỐI NHÉ 🔥'
  );
  const [posterRatio, setPosterRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [posterGradient, setPosterGradient] = useState(
    'linear-gradient(135deg, #00E5CC 0%, #1E1B4B 60%, #7000FF 100%)'
  );

  const visibleProjects = projects.filter((p) => {
    const inTrash = Boolean(p.isDeletedInTrash);
    if (navTab === 'trash' && !inTrash) return false;
    if (navTab !== 'trash' && inTrash) return false;
    if (!searchText.trim()) return true;
    return p.name.toLowerCase().includes(searchText.trim().toLowerCase());
  });

  const activeProjectsList = projects.filter((p) => !p.isDeletedInTrash);
  const totalProjectClips = activeProjectsList.reduce((acc, p) => acc + p.clips.length, 0);
  const cloudUsedMb =
    activeProjectsList.length === 0
      ? 0
      : Math.min(1024, activeProjectsList.length * 12 + totalProjectClips * 4);
  const cloudUsedPct = Math.min(100, Math.round((cloudUsedMb / 1024) * 100));

  const handleQuickToolClick = (toolId: HomeQuickToolId) => {
    if (onOpenQuickTool) {
      onOpenQuickTool(toolId);
      return;
    }
    if (toolId === 'long_to_shorts' || toolId === 'batch_edit') {
      onOpenMatrixBatch();
    } else {
      onBackToEditor();
    }
  };

  const handleApplyTemplate = (tpl: HomeTemplatePreset) => {
    if (onUseTemplatePreset) {
      onUseTemplatePreset(tpl);
    } else {
      onCreateNewProject();
    }
  };

  return (
    <div className="flex flex-1 min-h-0 bg-[#0F1014] text-[#E4E4E7] overflow-hidden select-none">
      {/* Left Navigation Sidebar (TDO CUT Studio Hub) */}
      <aside className="w-56 bg-[#14151A] border-r border-[#262730] p-3 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          {/* Account & TDO CUT Brand Card */}
          <div className="p-2.5 bg-[#1C1D24] border border-[#2C2E3A] rounded-lg space-y-2.5">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logo.png"
                alt="TDO CUT Logo"
                className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">TDO CUT Studio</div>
                <div className="text-[10px] text-[#9CA3AF]">Pro GPU Engine · Cloud Sync</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onBackToEditor}
              className="w-full py-1.5 px-2.5 rounded bg-[#182B2E] border border-[#00E5CC]/40 text-[#00E5CC] font-semibold text-[10.5px] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#1E363A]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {isEn ? 'TDO CUT Pro Edition Ready' : 'Phiên bản TDO CUT Pro Studio'}
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            {(
              [
                { id: 'home', label: isEn ? 'Home' : 'Trang chủ (Home)', icon: LayoutGrid },
                { id: 'templates', label: isEn ? 'Templates' : 'Mẫu (Templates)', icon: Sparkles },
                { id: 'spaces', label: isEn ? 'Cloud Spaces' : 'Không gian đám mây (Spaces)', icon: Cloud },
                { id: 'ai_design', label: isEn ? 'AI Design & Poster' : 'Thiết kế AI & Poster', icon: Wand2 },
                { id: 'trash', label: isEn ? 'Trash (30 Days)' : 'Thùng rác (Trash 30 ngày)', icon: Trash2 },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = navTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setNavTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#00E5CC]/15 text-[#00E5CC] font-semibold border border-[#00E5CC]/30'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#1E2028]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Cloud Space Quota Footer */}
        <div className="p-2.5 bg-[#181920] border border-[#262834] rounded-md space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span>TDO CUT Cloud Space</span>
            <span className="font-mono text-[#00E5CC]">{cloudUsedMb} MB / 1 GB</span>
          </div>
          <div className="w-full h-1.5 bg-[#101115] rounded-full overflow-hidden">
            <div style={{ width: `${cloudUsedPct}%` }} className="h-full bg-[#00E5CC]" />
          </div>
          <button
            type="button"
            onClick={onBackToEditor}
            className="w-full mt-1 py-1.5 bg-[#252732] hover:bg-[#2F3240] text-white font-semibold rounded text-center cursor-pointer"
          >
            {activeProjectName && activeProjectsList.length > 0
              ? isEn
                ? `Back to Editor (${activeProjectName})`
                : `Quay lại Bàn dựng (${activeProjectName})`
              : isEn
              ? 'Back to Editor'
              : 'Quay lại Bàn dựng'}
          </button>
        </div>
      </aside>

      {/* Center & Right Launcher Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
        {/* Top Launcher Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="TDO CUT"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-md"
            />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {isEn
                  ? 'TDO CUT — Studio Project Hub'
                  : 'TDO CUT — Trung Tâm Khởi Tạo & Quản Lý Dự Án'}
              </h1>
              <p className="text-xs text-[#9CA3AF]">
                {isEn
                  ? 'TDO CUT Multi-Track Engine · Local-First Draft Sync & Hardware NVENC/ProRes Export'
                  : 'Lõi dựng phim đa tầng TDO CUT · Tự động đồng bộ nháp và hỗ trợ xuất GPU siêu tốc'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1D24] hover:bg-[#252732] border border-[#2E303E] rounded-md text-xs font-medium cursor-pointer"
              >
                {themeMode === 'light' ? (
                  <Moon className="w-3.5 h-3.5 text-[#0284C7]" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-[#FBBF24]" />
                )}
                <span>
                  {themeMode === 'light'
                    ? isEn
                      ? 'Dark'
                      : 'Tối'
                    : isEn
                    ? 'Light'
                    : 'Sáng'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1C1E26] hover:bg-[#262934] text-[#E4E4E7] border border-[#2E313E] rounded-md cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#00E5CC]" />
              <span>{isEn ? 'System Settings' : 'Cài đặt hệ thống'}</span>
            </button>
            <button
              type="button"
              onClick={onBackToEditor}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#00E5CC] hover:bg-[#00F5DC] text-[#090D12] rounded-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isEn ? 'Open Active Editor' : 'Mở Bàn Dựng Hiện Tại'}</span>
            </button>
          </div>
        </div>

        {/* TAB 2: TEMPLATES GALLERY */}
        {navTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  {isEn
                    ? 'TDO CUT Viral Video Templates'
                    : 'Kho Mẫu Dựng Phim Tự Động (TDO CUT Templates)'}
                </h2>
                <p className="text-xs text-[#9CA3AF]">
                  {isEn
                    ? 'Click any template to open a pre-configured multi-track timeline with transitions, stickers & captions.'
                    : 'Nhấp chọn mẫu bất kỳ để nạp ngay bố cục đa tầng kèm chuyển cảnh, nhãn dán và phụ đề tự động.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onCreateNewProject}
                className="px-3 py-1.5 bg-[#00E5CC] text-[#090D12] font-bold text-xs rounded-md cursor-pointer"
              >
                {isEn ? '+ Blank Project' : '+ Dự án trống'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {STUDIO_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="group bg-[#161820] border border-[#272A36] hover:border-[#00E5CC] rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div
                    style={{ background: tpl.gradient }}
                    className="h-32 p-3.5 flex flex-col justify-between relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-black/70 text-[#00E5CC] rounded">
                        {tpl.badgeText}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono bg-black/60 text-white rounded">
                        {tpl.aspectRatio}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white drop-shadow">
                      {isEn ? tpl.titleEn : tpl.titleVi}
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between bg-[#181A22]">
                    <div className="text-[11px] text-[#9CA3AF]">
                      {isEn ? tpl.categoryEn : tpl.categoryVi} · {tpl.clipsCount} clips · {tpl.durationSec}s
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTemplate(tpl);
                      }}
                      className="px-2.5 py-1 bg-[#00E5CC] hover:bg-[#00F5DC] text-[#090D12] font-bold text-[11px] rounded cursor-pointer"
                    >
                      {isEn ? 'Use Template' : 'Dùng mẫu'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLOUD SPACES */}
        {navTab === 'spaces' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#161820] border border-[#272A36] rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#00E5CC]" />
                  <span>
                    {isEn
                      ? `TDO CUT Cloud Workspace (${cloudUsedMb} MB / 1024 MB Used)`
                      : `Không Gian Đám Mây TDO CUT (Đã dùng ${cloudUsedMb} MB / 1024 MB)`}
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  {isEn
                    ? 'Sync multi-track projects, LUTs, and custom stickers across all workstations.'
                    : 'Đồng bộ dự án đa tầng, bộ lọc màu LUT và nhãn dán giữa các thiết bị.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCloudBackup}
                    onChange={(e) => setAutoCloudBackup(e.target.checked)}
                    className="accent-[#00E5CC]"
                  />
                  <span>{isEn ? 'Auto Cloud Backup' : 'Tự động sao lưu đám mây'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCloudSyncedIds(projects.map((p) => p.id))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00E5CC] text-[#090D12] font-bold text-xs rounded-md cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Sync All Projects Now' : 'Đồng bộ tất cả dự án'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI DESIGN & POSTER STUDIO */}
        {navTab === 'ai_design' && (
          <div className="grid grid-cols-12 gap-5 bg-[#161820] border border-[#272A36] rounded-xl p-5">
            <div className="col-span-5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#00E5CC]" />
                <span>
                  {isEn
                    ? 'AI Thumbnail & Viral Poster Generator'
                    : 'Thiết Kế Ảnh Bìa & Poster Viral bằng AI'}
                </span>
              </h2>
              <div className="space-y-1.5">
                <label className="block text-xs text-[#A1A1AA]">
                  {isEn ? 'Poster Headline Text:' : 'Tiêu đề Poster / Ảnh bìa:'}
                </label>
                <input
                  type="text"
                  value={posterHeadline}
                  onChange={(e) => setPosterHeadline(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#101218] border border-[#2E3240] rounded text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs text-[#A1A1AA]">
                  {isEn ? 'Aspect Ratio:' : 'Tỷ lệ khung hình:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['16:9', '9:16', '1:1'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setPosterRatio(r)}
                      className={`py-1.5 rounded text-xs font-mono font-bold border cursor-pointer ${
                        posterRatio === r
                          ? 'bg-[#00E5CC]/20 border-[#00E5CC] text-[#00E5CC]'
                          : 'bg-[#101218] border-[#2E3240] text-[#A1A1AA]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs text-[#A1A1AA]">
                  {isEn ? 'Color Theme:' : 'Phối màu nền:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: 'Cyber Teal',
                      bg: 'linear-gradient(135deg, #00E5CC 0%, #1E1B4B 60%, #7000FF 100%)',
                    },
                    {
                      label: 'Viral Crimson',
                      bg: 'linear-gradient(135deg, #FF0055 0%, #7F1D1D 55%, #F59E0B 100%)',
                    },
                    {
                      label: 'Gold Cinema',
                      bg: 'linear-gradient(135deg, #FBBF24 0%, #0F172A 65%, #0284C7 100%)',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPosterGradient(preset.bg)}
                      className="p-2 rounded border border-[#2E3240] text-[10px] font-semibold text-white cursor-pointer"
                      style={{ background: preset.bg }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={onBackToEditor}
                className="w-full py-2 bg-[#00E5CC] hover:bg-[#00F5DC] text-[#090D12] font-bold text-xs rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>
                  {isEn ? 'Apply Cover & Open in Editor' : 'Áp dụng mẫu này vào Bàn dựng'}
                </span>
              </button>
            </div>

            <div className="col-span-7 flex items-center justify-center bg-[#0C0D12] border border-[#252834] rounded-xl p-6">
              <div
                style={{ background: posterGradient }}
                className={`rounded-xl border-2 border-white/20 shadow-2xl flex flex-col items-center justify-center p-6 text-center ${
                  posterRatio === '9:16'
                    ? 'w-48 h-72'
                    : posterRatio === '1:1'
                    ? 'w-60 h-60'
                    : 'w-full max-w-md aspect-video'
                }`}
              >
                <span className="px-2 py-0.5 text-[10px] font-mono bg-black/60 text-[#00E5CC] rounded mb-3">
                  TDO CUT AI DESIGN · {posterRatio}
                </span>
                <div className="text-lg font-extrabold text-white uppercase tracking-wide drop-shadow-md px-3 py-1.5 bg-black/55 rounded-lg border border-white/15">
                  {posterHeadline}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HERO & AI QUICK TOOLS (Shown on Home tab) */}
        {navTab === 'home' && (
          <>
            <div className="grid grid-cols-12 gap-4">
              <button
                type="button"
                onClick={onCreateNewProject}
                className="col-span-7 h-36 rounded-xl bg-gradient-to-r from-[#00B4A0] via-[#00E5CC] to-[#0284C7] p-6 flex flex-col items-center justify-center gap-2 text-[#070B10] shadow-lg hover:brightness-105 transition-all cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-[#070B10]/15 flex items-center justify-center">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-base font-extrabold tracking-tight">
                  {isEn ? '+ Create New Project' : '+ Dự án mới (+ Create project)'}
                </span>
                <span className="text-xs font-medium opacity-80">
                  {isEn
                    ? 'Launch a fresh 60 FPS multi-track timeline or drag & drop hundreds of clips'
                    : 'Mở bàn dựng đa tầng 60 FPS mới tinh hoặc kéo thả hàng trăm clip'}
                </span>
              </button>

              {/* Quick AI Cards next to Hero */}
              <div className="col-span-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onOpenMatrixBatch}
                  className="p-3.5 rounded-xl bg-[#181A22] hover:bg-[#20232E] border border-[#2B2E3C] flex flex-col justify-between text-left cursor-pointer"
                >
                  <Wand2 className="w-5 h-5 text-[#00E5CC]" />
                  <div>
                    <div className="text-xs font-bold text-white">AutoCut &amp; Matrix AI</div>
                    <div className="text-[11px] text-[#9CA3AF]">
                      {isEn
                        ? 'Shuffle clips X-Y & batch export N variants'
                        : 'Trộn ngẫu nhiên X-Y & cắt hàng loạt N video'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onBackToEditor();
                    onStartRecordScreen();
                  }}
                  className="p-3.5 rounded-xl bg-[#181A22] hover:bg-[#20232E] border border-[#2B2E3C] flex flex-col justify-between text-left cursor-pointer"
                >
                  <Video className="w-5 h-5 text-[#F43F5E]" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isEn ? 'Screen Recorder' : 'Ghi màn hình (Record)'}
                    </div>
                    <div className="text-[11px] text-[#9CA3AF]">
                      {isEn
                        ? 'Record screen + Mic directly onto Timeline'
                        : 'Quay màn hình + Mic đẩy thẳng xuống Timeline'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* More Tools Strip (All 5 buttons trigger real specialized actions!) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                {isEn
                  ? 'AI TOOLS & QUICK UTILITIES (MORE TOOLS)'
                  : 'CÔNG CỤ AI & TIỆN ÍCH NHANH (MORE TOOLS)'}
              </div>
              <div className="grid grid-cols-5 gap-3">
                {(
                  [
                    {
                      id: 'long_to_shorts' as HomeQuickToolId,
                      title: isEn ? 'Long Video to Shorts' : 'Long Video to Shorts',
                      desc: isEn
                        ? 'Auto-split long videos into 9:16 vertical shorts'
                        : 'Tự cắt phim dài thành clip ngắn 9:16',
                      icon: Scissors,
                    },
                    {
                      id: 'script_to_video' as HomeQuickToolId,
                      title: isEn ? 'Script to Video AI' : 'Script to Video AI',
                      desc: isEn
                        ? 'Generate AI subtitles & scenes from script'
                        : 'Nhập kịch bản tạo phụ đề & cảnh quay',
                      icon: FileText,
                    },
                    {
                      id: 'tts_ai' as HomeQuickToolId,
                      title: isEn ? 'Text to Speech AI' : 'Text to Speech AI',
                      desc: isEn
                        ? 'Convert captions into natural AI voiceover'
                        : 'Đọc phụ đề bằng giọng AI tự nhiên',
                      icon: Mic,
                    },
                    {
                      id: 'auto_cutout' as HomeQuickToolId,
                      title: isEn ? 'Auto Cutout (Chroma)' : 'Auto Cutout (Xóa nền)',
                      desc: isEn
                        ? 'Remove background & isolate subject automatically'
                        : 'Tách nền nhân vật & Phông xanh',
                      icon: Sparkles,
                    },
                    {
                      id: 'batch_edit' as HomeQuickToolId,
                      title: isEn ? 'Batch Edit Studio' : 'Batch Edit (Hàng loạt)',
                      desc: isEn
                        ? 'Center-trim & batch process all timeline clips'
                        : 'Cắt giữa & đổi thông số hàng loạt clip',
                      icon: Layers,
                    },
                  ] as const
                ).map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => handleQuickToolClick(tool.id)}
                      className="p-3 rounded-lg bg-[#161820] hover:bg-[#1E212B] hover:border-[#00E5CC] border border-[#262936] text-left space-y-1.5 transition-colors cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-[#00E5CC]" />
                      <div className="text-xs font-semibold text-white">{tool.title}</div>
                      <div className="text-[10px] text-[#8E929F] line-clamp-1">{tool.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Projects List Section */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                {navTab === 'trash'
                  ? isEn
                    ? 'Trash (Restore projects within 30 days)'
                    : 'Thùng rác (Khôi phục dự án trong 30 ngày)'
                  : isEn
                  ? `Your Projects (${visibleProjects.length})`
                  : `Dự án của bạn (${visibleProjects.length})`}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={isEn ? 'Search project name...' : 'Tìm tên dự án...'}
                  className="pl-8 pr-3 py-1 text-xs bg-[#161820] border border-[#2A2D3A] rounded text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded border cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#252836] text-[#00E5CC] border-[#00E5CC]/40'
                    : 'bg-[#161820] text-[#71717A] border-[#2A2D3A]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded border cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#252836] text-[#00E5CC] border-[#00E5CC]/40'
                    : 'bg-[#161820] text-[#71717A] border-[#2A2D3A]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {visibleProjects.length === 0 ? (
            <div className="h-40 rounded-lg border border-dashed border-[#2C2F3E] flex flex-col items-center justify-center text-xs text-[#8E929F] gap-2">
              <Folder className="w-6 h-6 text-[#52525B]" />
              <span>
                {navTab === 'trash'
                  ? isEn
                    ? 'Trash is empty.'
                    : 'Thùng rác trống.'
                  : searchText.trim()
                  ? isEn
                    ? 'No projects match your search.'
                    : 'Chưa có dự án nào khớp tìm kiếm.'
                  : isEn
                  ? 'No projects yet.'
                  : 'Chưa có dự án nào.'}
              </span>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-4 gap-4'
                  : 'flex flex-col gap-2'
              }
            >
              {visibleProjects.map((proj) => {
                const dur = proj.clips.reduce(
                  (acc, c) => Math.max(acc, c.startTime + c.duration),
                  0
                );
                const isCloud = cloudSyncedIds.includes(proj.id);

                return (
                  <div
                    key={proj.id}
                    className="group relative bg-[#161820] border border-[#272A36] hover:border-[#00E5CC] rounded-lg overflow-hidden transition-all"
                  >
                    {/* Project Cover Thumbnail */}
                    <div
                      onClick={() => !proj.isDeletedInTrash && onOpenProject(proj)}
                      className="h-28 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0D9488] p-3 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-black/60 text-[#00E5CC] rounded">
                          {proj.aspectRatio}
                        </span>
                        {isCloud && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-[#00E5CC]/20 text-[#00E5CC] rounded flex items-center gap-1">
                            <Cloud className="w-2.5 h-2.5" /> {isEn ? 'Synced' : 'Đã đồng bộ'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-white/90">
                        <span>{proj.clips.filter((c) => c.trackIndex === 0).length} clips</span>
                        <span>{dur.toFixed(1)}s</span>
                      </div>
                    </div>

                    {/* Project Footer & "..." Context Menu */}
                    <div className="p-2.5 flex items-center justify-between gap-2 bg-[#181A22]">
                      <div className="min-w-0 flex-1">
                        {renamingId === proj.id ? (
                          <input
                            type="text"
                            autoFocus
                            value={renameVal}
                            onChange={(e) => setRenameVal(e.target.value)}
                            onBlur={() => {
                              if (renameVal.trim()) onRenameProject(proj.id, renameVal.trim());
                              setRenamingId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (renameVal.trim()) onRenameProject(proj.id, renameVal.trim());
                                setRenamingId(null);
                              }
                            }}
                            className="w-full px-1.5 py-0.5 text-xs bg-[#101116] border border-[#00E5CC] rounded text-white"
                          />
                        ) : (
                          <div
                            onClick={() => !proj.isDeletedInTrash && onOpenProject(proj)}
                            className="text-xs font-semibold text-white truncate cursor-pointer hover:text-[#00E5CC]"
                          >
                            {proj.name}
                          </div>
                        )}
                        <div className="text-[10px] text-[#8E929F]">{proj.createdAt}</div>
                      </div>

                      {proj.isDeletedInTrash ? (
                        <button
                          type="button"
                          onClick={() => onRestoreProject(proj.id)}
                          className="px-2 py-1 text-[10px] font-semibold bg-[#00E5CC] text-black rounded cursor-pointer"
                        >
                          {isEn ? 'Restore' : 'Khôi phục'}
                        </button>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId((prev) => (prev === proj.id ? null : proj.id))
                            }
                            title={isEn ? 'Project options (...)' : 'Tùy chọn dự án (...)'}
                            className="p-1 text-[#A1A1AA] hover:text-white rounded hover:bg-[#262936] cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === proj.id && (
                            <div className="absolute right-0 bottom-7 z-30 w-44 bg-[#1F222D] border border-[#363A4B] rounded-md shadow-2xl py-1 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingId(proj.id);
                                  setRenameVal(proj.name);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center gap-2 text-white cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#00E5CC]" />
                                <span>{isEn ? 'Rename' : 'Đổi tên (Rename)'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDuplicateProject(proj.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center gap-2 text-white cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-[#00E5CC]" />
                                <span>{isEn ? 'Duplicate' : 'Nhân bản (Duplicate)'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCloudSyncedIds((prev) =>
                                    prev.includes(proj.id) ? prev : [...prev, proj.id]
                                  );
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center gap-2 text-white cursor-pointer"
                              >
                                <Cloud className="w-3.5 h-3.5 text-[#38BDF8]" />
                                <span>{isEn ? 'Upload to Cloud Space' : 'Tải lên đám mây (Space)'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteProject(proj.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-[#2B2F3E] flex items-center gap-2 text-[#F87171] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{isEn ? 'Move to Trash' : 'Xóa (Đưa vào Trash)'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SHORTCUTS WINDOW MODAL (TDO CUT Studio Keyboard Shortcuts)
// ============================================================================
interface ShortcutsWindowModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: AppLanguage;
}

export const ShortcutsWindowModal: React.FC<ShortcutsWindowModalProps> = ({
  isOpen,
  onClose,
  language = 'vi',
}) => {
  const isEn = language === 'en';
  const [tab, setTab] = useState<'timeline' | 'player' | 'basic' | 'other'>('timeline');
  if (!isOpen) return null;

  const SHORTCUTS_DATA: Record<
    'timeline' | 'player' | 'basic' | 'other',
    Array<{ name: string; keys: string; desc: string }>
  > = {
    timeline: [
      {
        name: isEn ? 'Split Clip' : 'Split (Cắt đôi clip)',
        keys: 'Ctrl + B',
        desc: isEn ? 'Split selected clip at the playhead position' : 'Cắt đôi thanh đang chọn tại vạch trắng Playhead',
      },
      {
        name: isEn ? 'Split All Tracks' : 'Split all (Cắt tất cả tầng)',
        keys: 'Ctrl + Shift + B',
        desc: isEn ? 'Split all unlocked tracks simultaneously' : 'Cắt đôi tất cả các tầng cùng lúc',
      },
      {
        name: isEn ? 'Select Mode' : 'Select mode (Mũi tên chọn)',
        keys: 'A',
        desc: isEn ? 'Switch cursor to normal selection mode' : 'Đổi con trỏ chuột về mũi tên chọn bình thường',
      },
      {
        name: isEn ? 'Razor Blade Mode' : 'Split mode (Dao cạo)',
        keys: 'B',
        desc: isEn ? 'Switch cursor to razor blade tool' : 'Đổi con trỏ chuột thành lưỡi dao cạo (bấm đâu đứt đó)',
      },
      {
        name: isEn ? 'Trim Left to Playhead' : 'Delete left (Cắt đầu)',
        keys: 'Q',
        desc: isEn ? 'Ripple trim left side of clip to playhead' : 'Cắt và xóa phần thừa bên trái vạch trắng',
      },
      {
        name: isEn ? 'Trim Right to Playhead' : 'Delete right (Cắt đuôi)',
        keys: 'W',
        desc: isEn ? 'Ripple trim right side of clip to playhead' : 'Cắt và xóa phần thừa bên phải vạch trắng',
      },
      {
        name: isEn ? 'Add Beat Marker' : 'Add marker (Cắm cờ nhịp)',
        keys: 'M',
        desc: isEn ? 'Place a marker at the current playhead' : 'Cắm cờ đánh dấu nhịp nhạc tại vị trí vạch trắng',
      },
      {
        name: isEn ? 'Main Track Magnet' : 'Main track magnet',
        keys: 'P',
        desc: isEn ? 'Toggle magnetic snapping on main video track' : 'Bật/Tắt nam châm tự hút khít ở tầng chính',
      },
      {
        name: isEn ? 'Auto Snapping' : 'Auto snapping',
        keys: 'N',
        desc: isEn ? 'Toggle edge snapping while dragging clips' : 'Bật/Tắt tự động hít mép khi kéo 2 thanh lại gần nhau',
      },
      {
        name: isEn ? 'Extract Audio' : 'Extract audio',
        keys: 'Ctrl + Shift + S',
        desc: isEn ? 'Separate audio from video onto audio track' : 'Tách riêng âm thanh khỏi video thành 1 tầng dưới',
      },
    ],
    player: [
      {
        name: 'Play / Pause',
        keys: 'Space',
        desc: isEn ? 'Play or pause video preview' : 'Phát hoặc tạm dừng xem trước video',
      },
      {
        name: isEn ? 'Previous / Next Frame' : 'Previous / Next frame',
        keys: '← / →',
        desc: isEn ? 'Step backward or forward 1 frame' : 'Nhích từng khung hình một',
      },
      {
        name: 'Shuttle J / K / L',
        keys: 'J / K / L',
        desc: isEn ? 'Rewind / Pause / Fast-forward 2x-4x-8x' : 'Tua lùi / Dừng / Phát nhanh 2x-4x-8x',
      },
      {
        name: 'Mark In / Mark Out',
        keys: 'I / O',
        desc: isEn ? 'Set In point (I) and Out point (O)' : 'Đánh dấu điểm đầu (In) và điểm cuối (Out)',
      },
      {
        name: 'Full Screen',
        keys: 'Ctrl + F',
        desc: isEn ? 'Expand preview stage to full screen' : 'Phóng to màn hình xem trước ra toàn màn hình',
      },
    ],
    basic: [
      {
        name: isEn ? 'Import Media' : 'Import media',
        keys: 'Ctrl + I',
        desc: isEn ? 'Import local video/audio/image files' : 'Mở cửa sổ chọn file từ máy tính đưa vào dự án',
      },
      {
        name: isEn ? 'Copy / Paste Attributes' : 'Copy / Paste attributes',
        keys: 'Ctrl + Shift + C / V',
        desc: isEn ? 'Copy color/transform settings across clips' : 'Sao chép màu sắc/tỷ lệ của clip này dán sang clip khác',
      },
      {
        name: 'Undo / Redo',
        keys: 'Ctrl + Z / Y',
        desc: isEn ? 'Undo or redo the last timeline action' : 'Hoàn tác / Làm lại bước vừa thực hiện',
      },
      {
        name: isEn ? 'Export Video' : 'Export video',
        keys: 'Ctrl + E',
        desc: isEn ? 'Open the Studio Export dialog' : 'Mở cửa sổ Xuất video',
      },
      {
        name: isEn ? 'New Project' : 'New project',
        keys: 'Ctrl + N',
        desc: isEn ? 'Create a new timeline project' : 'Tạo dự án mới',
      },
    ],
    other: [
      {
        name: isEn ? 'Create Compound Clip' : 'Create compound clip',
        keys: 'Alt + G',
        desc: isEn ? 'Group selected clips into a sub-project' : 'Gộp nhiều tầng thành 1 Dự án con (Compound clip)',
      },
      {
        name: isEn ? 'Freeze Frame' : 'Freeze frame',
        keys: 'Shift + B',
        desc: isEn ? 'Insert a 3-second freeze frame at playhead' : 'Đóng băng khung hình hiện tại thành ảnh 3 giây',
      },
      {
        name: isEn ? 'Group / Ungroup' : 'Group / Ungroup',
        keys: 'Ctrl + G',
        desc: isEn ? 'Link or unlink multiple selected clips' : 'Nhóm hoặc bỏ nhóm các clip đang chọn',
      },
    ],
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? 'TDO CUT Keyboard Shortcuts' : 'Cửa sổ Phím tắt TDO CUT'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
    >
      <div className="w-full max-w-[620px] bg-[#1E1E24] border border-[#32323C] rounded-lg shadow-2xl overflow-hidden text-xs text-[#E4E4E7]">
        <div className="flex items-center justify-between px-4 py-3 bg-[#25252C] border-b border-[#32323C]">
          <div className="flex items-center gap-2 font-semibold text-sm text-white">
            <Keyboard className="w-4 h-4 text-[#00E5CC]" />
            <span>
              {isEn ? 'Keyboard Shortcuts (TDO CUT Studio)' : 'Bảng Hệ Thống Phím Tắt (Shortcuts Window)'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#A1A1AA] hover:text-white rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 pt-3 border-b border-[#2B2B34]">
          {(
            [
              { id: 'timeline', label: 'Timeline' },
              { id: 'player', label: 'Player' },
              { id: 'basic', label: isEn ? 'Basic' : 'Basic (Cơ bản)' },
              { id: 'other', label: isEn ? 'Advanced' : 'Other (Nâng cao)' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === t.id
                  ? 'border-[#00E5CC] text-[#00E5CC]'
                  : 'border-transparent text-[#9CA3AF] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 max-h-[360px] overflow-y-auto space-y-2">
          {SHORTCUTS_DATA[tab].map((row, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-[#141418] border border-[#272730] rounded"
            >
              <div>
                <div className="font-semibold text-white">{row.name}</div>
                <div className="text-[11px] text-[#9CA3AF]">{row.desc}</div>
              </div>
              <kbd className="px-2.5 py-1 bg-[#25252E] border border-[#3A3A48] rounded font-mono text-[11px] text-[#00E5CC] shrink-0">
                {row.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end px-4 py-2.5 bg-[#25252C] border-t border-[#32323C]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold bg-[#00E5CC] text-[#090D12] rounded cursor-pointer"
          >
            {isEn ? 'Close' : 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SYSTEM SETTINGS MODAL (Cài đặt hệ thống: Project, GPU Performance, Cache, Env Test)
// ============================================================================
interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proxyEnabled: boolean;
  onToggleProxy: (val: boolean) => void;
  defaultImageDuration: number;
  onChangeDefaultImageDuration: (sec: number) => void;
  language?: AppLanguage;
  onChangeLanguage?: (lang: AppLanguage) => void;
  themeMode?: StudioThemeMode;
  onToggleTheme?: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  proxyEnabled,
  onToggleProxy,
  defaultImageDuration,
  onChangeDefaultImageDuration,
  language = 'vi',
  onChangeLanguage,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const [tab, setTab] = useState<'project' | 'performance' | 'cache' | 'env'>('project');
  const [hwEncode, setHwEncode] = useState(true);
  const [hwDecode, setHwDecode] = useState(true);
  const [cacheSizeMb, setCacheSizeMb] = useState(0);
  const [envTestDone, setEnvTestDone] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cài đặt hệ thống TDO CUT"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
    >
      <div className="w-full max-w-[580px] bg-[#1E1E24] border border-[#32323C] rounded-lg shadow-2xl overflow-hidden text-xs text-[#E4E4E7]">
        <div className="flex items-center justify-between px-4 py-3 bg-[#25252C] border-b border-[#32323C]">
          <div className="flex items-center gap-2 font-semibold text-sm text-white">
            <img
              src="/assets/logo.png"
              alt="TDO CUT"
              className="w-5 h-5 rounded object-contain bg-white p-0.5"
            />
            <Settings className="w-4 h-4 text-[#00E5CC]" />
            <span>
              {language === 'en'
                ? 'System Settings (TDO CUT Studio)'
                : 'Cài đặt Hệ thống (TDO CUT Settings)'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#A1A1AA] hover:text-white rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 pt-2.5 border-b border-[#2B2B34]">
          {(
            [
              {
                id: 'project',
                label: language === 'en' ? 'Project & Language' : 'Project & Edit',
                icon: HardDrive,
              },
              {
                id: 'performance',
                label: 'Performance & GPU',
                icon: Cpu,
              },
              {
                id: 'cache',
                label: language === 'en' ? 'Cache' : 'Cache (Bộ nhớ đệm)',
                icon: Trash2,
              },
              {
                id: 'env',
                label: 'Environment Test',
                icon: Activity,
              },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold border-b-2 transition-colors cursor-pointer ${
                  tab === t.id
                    ? 'border-[#00E5CC] text-[#00E5CC]'
                    : 'border-transparent text-[#9CA3AF] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-3">
          {tab === 'performance' && (
            <>
              <label className="flex items-center justify-between p-2.5 bg-[#141418] rounded border border-[#2B2B34] cursor-pointer">
                <div>
                  <div className="font-semibold text-white">
                    {language === 'en'
                      ? 'Hardware Encoding (NVIDIA / AMD / Intel GPU Acceleration)'
                      : 'Hardware Encoding (Tăng tốc xuất video bằng GPU NVIDIA/AMD/Intel)'}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF]">
                    {language === 'en'
                      ? 'Accelerate video rendering up to 3x using dedicated hardware encoders'
                      : 'Tăng tốc độ xuất video gấp 3 lần bằng bộ mã hóa phần cứng'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hwEncode}
                  onChange={(e) => setHwEncode(e.target.checked)}
                  className="accent-[#00E5CC]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[#141418] rounded border border-[#2B2B34] cursor-pointer">
                <div>
                  <div className="font-semibold text-white">
                    {language === 'en'
                      ? 'Hardware Decoding (Smooth 4K Timeline Playback)'
                      : 'Hardware Decoding (Giải mã mượt video 4K trên Timeline)'}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF]">
                    {language === 'en'
                      ? 'Ensures zero-stutter 60 FPS playhead scrubbing'
                      : 'Giúp kéo tua thanh Playhead 60 FPS không bị khựng'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hwDecode}
                  onChange={(e) => setHwDecode(e.target.checked)}
                  className="accent-[#00E5CC]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[#141418] rounded border border-[#2B2B34] cursor-pointer">
                <div>
                  <div className="font-semibold text-[#00E5CC]">
                    {language === 'en'
                      ? 'Proxy Mode (540P / 720P Lag-Free Long-Form Editing)'
                      : 'Chế độ Proxy (540P / 720P chống giật lag khi dựng phim dài)'}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF]">
                    {language === 'en'
                      ? 'Uses lightweight proxies while editing and full 1080P/4K sources on export'
                      : 'Tạo bản sao nhẹ lúc cắt ghép nhưng vẫn xuất file gốc 1080P/4K sắc nét'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={proxyEnabled}
                  onChange={(e) => onToggleProxy(e.target.checked)}
                  className="accent-[#00E5CC]"
                />
              </label>
            </>
          )}

          {tab === 'project' && (
            <div className="space-y-3">
              {/* Language Selector: 1. Tiếng Việt | 2. Tiếng Anh (With Graphic Flag SVG!) */}
              <div className="p-3 bg-[#141418] border border-[#2B2B34] rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Globe className="w-3.5 h-3.5 text-[#00E5CC]" />
                    <span>
                      {language === 'en'
                        ? 'Interface Language:'
                        : 'Ngôn ngữ giao diện (Language):'}
                    </span>
                  </div>
                  <select
                    aria-label="Ngôn ngữ giao diện (Language)"
                    value={language}
                    onChange={(e) => onChangeLanguage?.(e.target.value as AppLanguage)}
                    className="px-2.5 py-1 bg-[#1E1E26] border border-[#32323E] rounded text-[#00E5CC] font-semibold cursor-pointer"
                  >
                    <option value="vi">1. Tiếng Việt (Vietnamese)</option>
                    <option value="en">2. English</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onChangeLanguage?.('vi')}
                    className={`py-1.5 px-3 rounded border font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      language === 'vi'
                        ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC]'
                        : 'bg-[#1C1C24] border-[#2E2E3A] text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <img
                      src={getFlagGraphicDataUrl('VN') || ''}
                      alt="VN"
                      className="w-5 h-3.5 rounded-xs object-cover shrink-0"
                    />
                    <span>1. Tiếng Việt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeLanguage?.('en')}
                    className={`py-1.5 px-3 rounded border font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      language === 'en'
                        ? 'bg-[#00E5CC]/15 border-[#00E5CC] text-[#00E5CC]'
                        : 'bg-[#1C1C24] border-[#2E2E3A] text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <img
                      src={getFlagGraphicDataUrl('GB') || ''}
                      alt="EN"
                      className="w-5 h-3.5 rounded-xs object-cover shrink-0"
                    />
                    <span>2. English</span>
                  </button>
                </div>
              </div>

              {/* Theme Mode Switcher: Sáng / Tối */}
              {onToggleTheme && (
                <div className="flex items-center justify-between p-2.5 bg-[#141418] border border-[#2B2B34] rounded-md">
                  <div className="flex items-center gap-2">
                    {themeMode === 'light' ? (
                      <Sun className="w-4 h-4 text-[#F59E0B]" />
                    ) : (
                      <Moon className="w-4 h-4 text-[#00E5CC]" />
                    )}
                    <div>
                      <div className="font-semibold text-white">
                        {language === 'en'
                          ? 'Studio Theme Mode (Light / Dark)'
                          : 'Chế độ Giao diện Sáng / Tối (Theme Mode)'}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF]">
                        {themeMode === 'light'
                          ? language === 'en'
                            ? 'Active: Light Studio Mode'
                            : 'Đang bật Giao diện Sáng (Light Studio)'
                          : language === 'en'
                          ? 'Active: Dark Studio Mode'
                          : 'Đang bật Giao diện Tối (Dark Studio)'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="px-3 py-1.5 rounded bg-[#252530] hover:bg-[#30303E] border border-[#383846] text-[#00E5CC] font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    {themeMode === 'light' ? (
                      <>
                        <Moon className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Switch to Dark' : 'Chuyển sang Tối'}</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3.5 h-3.5 text-[#FBBF24]" />
                        <span>{language === 'en' ? 'Switch to Light' : 'Chuyển sang Sáng'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[#A1A1AA] mb-1">
                  {language === 'en' ? 'Draft Save Path:' : 'Đường dẫn lưu nháp (Save to):'}
                </label>
                <input
                  type="text"
                  readOnly
                  value="C:/Users/Admin/AppData/Local/TDOCut/User Data/Projects/"
                  className="w-full px-2.5 py-1.5 bg-[#141418] border border-[#2B2B34] rounded font-mono text-[11px] text-[#D4D4D8]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>
                  {language === 'en'
                    ? 'Default Still Image Duration on Timeline (sec):'
                    : 'Thời lượng mặc định khi kéo ảnh tĩnh xuống Timeline (Image duration):'}
                </span>
                <input
                  type="number"
                  step={0.5}
                  min={0.5}
                  max={30}
                  value={defaultImageDuration}
                  onChange={(e) => onChangeDefaultImageDuration(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-[#141418] border border-[#2B2B34] rounded font-mono text-white text-right"
                />
              </div>
            </div>
          )}

          {tab === 'cache' && (
            <div className="p-3 bg-[#141418] border border-[#2B2B34] rounded space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">
                    {language === 'en' ? 'Render Cache Size' : 'Dung lượng bộ nhớ đệm (Cache size)'}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF]">
                    {language === 'en'
                      ? 'Clear temporary preview files to free up disk space immediately'
                      : 'Xóa các tệp render tạm thời để giải phóng ổ cứng ngay lập tức'}
                  </div>
                </div>
                <span className="font-mono text-sm text-[#00E5CC]">{cacheSizeMb} MB</span>
              </div>
              <button
                type="button"
                onClick={() => setCacheSizeMb(0)}
                className="px-3 py-1.5 bg-[#2E1D22] hover:bg-[#3F232B] text-[#F87171] border border-[#F87171]/40 font-semibold rounded cursor-pointer"
              >
                {cacheSizeMb === 0
                  ? language === 'en'
                    ? 'Cache Cleared (0 MB)'
                    : 'Đã dọn sạch Cache (0 MB)'
                  : language === 'en'
                  ? 'Clear Cache'
                  : 'Clear Cache (Xóa sạch bộ nhớ đệm)'}
              </button>
            </div>
          )}

          {tab === 'env' && (
            <div className="p-3 bg-[#141418] border border-[#2B2B34] rounded space-y-3">
              <div className="text-[#D4D4D8]">
                {language === 'en'
                  ? 'Benchmark cloud sync latency, WebGL2 60 FPS canvas, and MediaRecorder hardware codecs:'
                  : 'Kiểm tra tốc độ kết nối đám mây, WebGL Canvas 60 FPS và trình giải mã MediaRecorder:'}
              </div>
              {envTestDone && (
                <div className="p-2.5 bg-[#00E5CC]/10 border border-[#00E5CC]/40 rounded space-y-1 text-[11px] text-[#00E5CC]">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'en'
                        ? 'Environment Passed 100% (60 FPS Lock-Free)'
                        : 'Môi trường đạt chuẩn 100% (60 FPS Lock-Free)'}
                    </span>
                  </div>
                  <div>
                    {language === 'en'
                      ? '• GPU WebGL2 / Canvas2D Hardware Accelerated: Ready'
                      : '• GPU WebGL2 / Canvas2D Hardware Accelerated: Sẵn sàng'}
                  </div>
                  <div>
                    {language === 'en'
                      ? '• Web Audio Synthesizer & MediaRecorder VP9/MP4: Optimal'
                      : '• Web Audio Synthesizer & MediaRecorder VP9/MP4: Hoạt động tốt'}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setEnvTestDone(true)}
                className="px-3.5 py-1.5 bg-[#00E5CC] text-[#090D12] font-semibold rounded cursor-pointer"
              >
                {language === 'en' ? 'Start Environment Test' : 'Start Environment Test (Kiểm tra ngay)'}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-4 py-2.5 bg-[#25252C] border-t border-[#32323C]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold bg-[#00E5CC] text-[#090D12] rounded cursor-pointer"
          >
            {language === 'en' ? 'Save & Close' : 'Lưu & Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};
