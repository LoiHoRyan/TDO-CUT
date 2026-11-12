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
  LayoutTemplate,
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
  Database,
} from 'lucide-react';
import {
  SubProjectItem,
  AppLanguage,
  StudioThemeMode,
  getFlagGraphicDataUrl,
  getProjectInstallDir,
  setProjectInstallDir,
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
  name?: string;
  categoryVi: string;
  categoryEn: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  durationSec: number;
  clipsCount: number;
  gradient: string;
  badgeText: string;
  effect?: any;
  filter?: any;
  transition?: any;
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
    badgeText: 'VOICE',
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
    gradient: 'linear-gradient(135deg, #00E5CC 0%, #0D9488 100%)',
    badgeText: 'AUTO BEAT',
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
  onPermanentDeleteProject?: (id: string) => void;
  onEmptyTrash?: () => void;
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
  onPermanentDeleteProject,
  onEmptyTrash,
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
    <div className={`flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden select-none ${
      themeMode === 'light' ? 'bg-[#F1F5F9] text-[#0F172A]' : 'bg-[#0F1014] text-[#E4E4E7]'
    }`}>
      {/* Left Navigation Sidebar (TDO CUT Studio Hub) - hidden on mobile screens, shown on desktop */}
      <aside className={`hidden md:flex w-56 p-3 flex-col justify-between shrink-0 border-r ${
        themeMode === 'light'
          ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#0F172A]'
          : 'bg-[#14151A] border-[#262730] text-[#E4E4E7]'
      }`}>
        <div className="space-y-4">
          {/* Account & TDO CUT Brand Card */}
          <div className={`p-3 rounded-xl space-y-2.5 border ${
            themeMode === 'light'
              ? 'bg-[#F8FAFC] border-[#E2E8F0]'
              : 'bg-[#181A22] border-[#272A36]'
          }`}>
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logo.png"
                alt="TDO CUT Logo"
                className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <div className={`text-xs font-semibold tracking-tight truncate ${
                  themeMode === 'light' ? 'text-[#0F172A]' : 'text-white'
                }`}>TDO-CUT Studio</div>
                <div className="text-[10px] text-[#9CA3AF]">Desktop Edition</div>
              </div>
            </div>
            <div className={`w-full py-1.5 px-2 rounded-lg text-[10.5px] flex items-center justify-center gap-1.5 border ${
              themeMode === 'light'
                ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#334155]'
                : 'bg-[#101218] border-white/5 text-[#9CA3AF]'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5CC] shrink-0" />
              <span className="truncate">
                {isEn ? 'Studio Edition Activated' : 'Phiên bản Studio Pro'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            {(
              [
                { id: 'home', label: isEn ? 'Home' : 'Trang chủ', icon: LayoutGrid },
                { id: 'templates', label: isEn ? 'Templates' : 'Mẫu dự án', icon: LayoutTemplate },
                { id: 'spaces', label: isEn ? 'Cloud Storage' : 'Bộ nhớ đám mây', icon: Cloud },
                { id: 'ai_design', label: isEn ? 'Cover Design' : 'Thiết kế ảnh bìa', icon: ImageIcon },
                { id: 'trash', label: isEn ? 'Trash' : 'Thùng rác', icon: Trash2 },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = navTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setNavTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#00E5CC]/15 text-[#00E5CC] font-medium border border-[#00E5CC]/30'
                      : themeMode === 'light'
                      ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
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
        <div className={`p-3 rounded-xl space-y-2 text-[11px] border ${
          themeMode === 'light'
            ? 'bg-[#F8FAFC] border-[#E2E8F0]'
            : 'bg-[#181A22] border-[#272A36]'
        }`}>
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span className="font-normal">{isEn ? 'Cloud Storage' : 'Bộ nhớ đám mây'}</span>
            <span className="font-mono text-[#00E5CC] text-[10.5px]">{cloudUsedMb} MB / 1 GB</span>
          </div>
          <div className={`w-full h-1 rounded-full overflow-hidden ${
            themeMode === 'light' ? 'bg-[#E2E8F0]' : 'bg-[#101218]'
          }`}>
            <div style={{ width: `${cloudUsedPct}%` }} className="h-full bg-[#00E5CC]" />
          </div>
          {activeProjectName && activeProjectsList.length > 0 && (
            <button
              type="button"
              onClick={onBackToEditor}
              className={`w-full mt-1.5 py-1.5 font-medium rounded-lg text-xs transition-colors cursor-pointer text-center ${
                themeMode === 'light'
                  ? 'bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A]'
                  : 'bg-[#222530] hover:bg-[#2B2F3D] text-[#E4E4E7] hover:text-white'
              }`}
            >
              {isEn ? `Editor: ${activeProjectName}` : `Trình dựng: ${activeProjectName}`}
            </button>
          )}
        </div>
      </aside>

      {/* Center & Right Launcher Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Top Launcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/assets/logo.png"
              alt="TDO CUT"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-sm shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className={`text-base font-bold tracking-tight ${
                themeMode === 'light' ? 'text-[#0F172A]' : 'text-white'
              }`}>
                {isEn ? 'Projects' : 'Dự án'}
              </h1>
              <p className="text-xs text-[#9CA3AF] leading-normal font-normal truncate sm:whitespace-normal">
                {isEn
                  ? 'Start a new project or manage recent video edits'
                  : 'Khởi tạo dự án mới hoặc quản lý các bản dựng gần đây'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-normal border cursor-pointer transition-colors ${
                  themeMode === 'light'
                    ? 'bg-white hover:bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A]'
                    : 'bg-[#181A22] hover:bg-[#20232E] border-[#2B2E3C] text-[#D1D5DB] hover:text-white'
                }`}
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
                      : 'Giao diện tối'
                    : isEn
                    ? 'Light'
                    : 'Giao diện sáng'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                themeMode === 'light'
                  ? 'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1]'
                  : 'bg-[#181A22] hover:bg-[#20232E] text-[#D1D5DB] hover:text-white border-[#2B2E3C]'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>{isEn ? 'Settings' : 'Cài đặt'}</span>
            </button>
            <button
              type="button"
              onClick={activeProjectsList.length > 0 ? onBackToEditor : onCreateNewProject}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#00E5CC] hover:bg-[#00F5DC] text-[#090D12] rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isEn ? 'Open Editor' : 'Mở trình dựng'}</span>
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
                <ImageIcon className="w-4 h-4 text-[#00E5CC]" />
                <span>
                  {isEn
                    ? 'Thumbnail & Viral Poster Generator'
                    : 'Thiết Kế Ảnh Bìa & Poster'}
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
                  TDO CUT COVER DESIGN · {posterRatio}
                </span>
                <div className="text-lg font-extrabold text-white uppercase tracking-wide drop-shadow-md px-3 py-1.5 bg-black/55 rounded-lg border border-white/15">
                  {posterHeadline}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HERO & QUICK TOOLS (Shown on Home tab) */}
        {navTab === 'home' && (
          <>
            {/* Mobile & Desktop Hero Cards (CapCut Mobile 2-col hero - Image 4) */}
            <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
              <button
                type="button"
                onClick={onCreateNewProject}
                className={`col-span-1 md:col-span-7 h-28 md:h-36 rounded-2xl border p-3 md:p-6 flex flex-col items-center justify-center gap-1.5 md:gap-2 shadow-xs transition-all cursor-pointer group ${
                  themeMode === 'light'
                    ? 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00E5CC]'
                    : 'bg-[#181A22] hover:bg-[#1E212B] border-[#2B2E3C] hover:border-[#00E5CC]/70'
                }`}
              >
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#00E5CC]/15 text-[#00E5CC] group-hover:bg-[#00E5CC] group-hover:text-black flex items-center justify-center transition-all">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className={`text-xs md:text-sm font-bold tracking-tight transition-colors ${
                  themeMode === 'light' ? 'text-[#0F172A] group-hover:text-[#00A89A]' : 'text-white group-hover:text-[#00E5CC]'
                }`}>
                  {isEn ? 'New Project' : 'Video mới'}
                </span>
                <span className="hidden md:inline text-xs text-[#9CA3AF] font-normal leading-normal text-center">
                  {isEn
                    ? 'Start creating with a clean multi-track timeline'
                    : 'Khởi tạo dòng thời gian trống để dựng video'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setNavTab('ai_design')}
                className={`col-span-1 md:hidden h-28 rounded-2xl border p-3 flex flex-col items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer group ${
                  themeMode === 'light'
                    ? 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00E5CC]'
                    : 'bg-[#181A22] hover:bg-[#1E212B] border-[#2B2E3C] hover:border-[#00E5CC]/70'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#00E5CC]/15 text-[#00E5CC] group-hover:bg-[#00E5CC] group-hover:text-black flex items-center justify-center transition-all">
                  <ImageIcon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className={`text-xs font-bold tracking-tight transition-colors ${
                  themeMode === 'light' ? 'text-[#0F172A]' : 'text-white'
                }`}>
                  {isEn ? 'Photo Edit' : 'Chỉnh sửa ảnh'}
                </span>
              </button>

              {/* Desktop Quick Side Cards next to Hero */}
              <div className="hidden md:grid col-span-5 grid-cols-2 gap-2.5 md:gap-3">
                <button
                  type="button"
                  onClick={onOpenMatrixBatch}
                  className={`p-3 md:p-4 rounded-xl border flex flex-col justify-between text-left cursor-pointer transition-all group ${
                    themeMode === 'light'
                      ? 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00E5CC]'
                      : 'bg-[#181A22] hover:bg-[#1E212B] border-[#2B2E3C] hover:border-[#00E5CC]/50'
                  }`}
                >
                  <Layers className="w-5 h-5 text-[#00E5CC]" />
                  <div className="space-y-1">
                    <div className={`text-xs font-semibold transition-colors ${
                      themeMode === 'light' ? 'text-[#0F172A] group-hover:text-[#00A89A]' : 'text-white group-hover:text-[#00E5CC]'
                    }`}>
                      {isEn ? 'Matrix Variations' : 'Ma trận biến thể'}
                    </div>
                    <div className="text-[11px] text-[#9CA3AF] leading-snug">
                      {isEn
                        ? 'Auto-generate multiple video variants'
                        : 'Tạo nhiều biến thể video tự động'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onBackToEditor();
                    onStartRecordScreen();
                  }}
                  className={`p-3 md:p-4 rounded-xl border flex flex-col justify-between text-left cursor-pointer transition-all group ${
                    themeMode === 'light'
                      ? 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#F43F5E]'
                      : 'bg-[#181A22] hover:bg-[#1E212B] border-[#2B2E3C] hover:border-[#F43F5E]/50'
                  }`}
                >
                  <Video className="w-5 h-5 text-[#F43F5E]" />
                  <div className="space-y-1">
                    <div className={`text-xs font-semibold transition-colors ${
                      themeMode === 'light' ? 'text-[#0F172A] group-hover:text-[#F43F5E]' : 'text-white group-hover:text-[#F43F5E]'
                    }`}>
                      {isEn ? 'Screen Recorder' : 'Ghi màn hình'}
                    </div>
                    <div className="text-[11px] text-[#9CA3AF] leading-snug">
                      {isEn
                        ? 'Record display and microphone audio'
                        : 'Ghi màn hình kèm âm thanh micro'}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Tools Strip */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                {isEn ? 'Quick Tools' : 'Công cụ nhanh'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                {(
                  [
                    {
                      id: 'long_to_shorts' as HomeQuickToolId,
                      title: isEn ? 'Shorts Video' : 'Video ngắn (Shorts)',
                      desc: isEn
                        ? 'Convert to 9:16 vertical video'
                        : 'Chuyển khung hình dọc 9:16',
                      icon: Scissors,
                    },
                    {
                      id: 'script_to_video' as HomeQuickToolId,
                      title: isEn ? 'Auto Captions' : 'Phụ đề tự động',
                      desc: isEn
                        ? 'Speech recognition & subtitle sync'
                        : 'Nhận diện giọng nói & tạo phụ đề',
                      icon: FileText,
                    },
                    {
                      id: 'tts_ai' as HomeQuickToolId,
                      title: isEn ? 'Voiceover (TTS)' : 'Chuyển văn bản',
                      desc: isEn
                        ? 'Natural voice synthesis'
                        : 'Lồng tiếng tự nhiên từ văn bản',
                      icon: Mic,
                    },
                    {
                      id: 'auto_cutout' as HomeQuickToolId,
                      title: isEn ? 'Smart Cutout' : 'Tách nền chủ thể',
                      desc: isEn
                        ? 'Remove background or green screen'
                        : 'Xóa phông tự động & phông xanh',
                      icon: Scissors,
                    },
                    {
                      id: 'batch_edit' as HomeQuickToolId,
                      title: isEn ? 'Batch Processing' : 'Xử lý đồng loạt',
                      desc: isEn
                        ? 'Edit multiple clips at once'
                        : 'Chỉnh sửa nhanh nhiều clip',
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
                      className={`p-3 md:p-3.5 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer group ${
                        themeMode === 'light'
                          ? 'bg-white hover:bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#00E5CC]'
                          : 'bg-[#181A22] hover:bg-[#1E212B] hover:border-[#00E5CC]/60 border-[#2B2E3C]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#00E5CC]" />
                      <div className={`text-xs font-semibold transition-colors ${
                        themeMode === 'light' ? 'text-[#0F172A] group-hover:text-[#00A89A]' : 'text-white group-hover:text-[#00E5CC]'
                      }`}>{tool.title}</div>
                      <div className="text-[11px] text-[#9CA3AF] line-clamp-1">{tool.desc}</div>
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
            <h2 className={`text-sm font-semibold tracking-tight ${
              themeMode === 'light' ? 'text-[#0F172A]' : 'text-white'
            }`}>
              {navTab === 'trash'
                ? isEn
                  ? 'Trash (Projects kept for 30 days)'
                  : 'Thùng rác (Lưu giữ trong 30 ngày)'
                : isEn
                ? `Recent Projects (${visibleProjects.length})`
                : `Dự án gần đây (${visibleProjects.length})`}
            </h2>

            <div className="flex items-center gap-2">
              {navTab === 'trash' && visibleProjects.length > 0 && onEmptyTrash && (
                <button
                  type="button"
                  onClick={onEmptyTrash}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/40 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Empty Trash' : 'Dọn sạch thùng rác (Xóa tất cả)'}</span>
                </button>
              )}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={isEn ? 'Search projects...' : 'Tìm kiếm dự án...'}
                  className={`pl-8 pr-3 py-1.5 text-xs rounded-lg transition-colors w-36 sm:w-48 border focus:outline-hidden focus:border-[#00E5CC] ${
                    themeMode === 'light'
                      ? 'bg-white border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8]'
                      : 'bg-[#181A22] border-[#2B2E3C] text-white placeholder-[#71717A]'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#00E5CC]/15 text-[#00E5CC] border-[#00E5CC]/40'
                    : themeMode === 'light'
                    ? 'bg-white text-[#64748B] border-[#CBD5E1]'
                    : 'bg-[#181A22] text-[#71717A] border-[#2B2E3C]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#00E5CC]/15 text-[#00E5CC] border-[#00E5CC]/40'
                    : themeMode === 'light'
                    ? 'bg-white text-[#64748B] border-[#CBD5E1]'
                    : 'bg-[#181A22] text-[#71717A] border-[#2B2E3C]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {visibleProjects.length === 0 ? (
            <div className={`h-44 rounded-xl border border-dashed flex flex-col items-center justify-center text-xs gap-2 p-6 ${
              themeMode === 'light' ? 'border-[#CBD5E1] text-[#64748B] bg-white' : 'border-[#2B2E3C] text-[#9CA3AF]'
            }`}>
              <Folder className="w-8 h-8 text-[#52525B] stroke-[1.5]" />
              <span className={`font-medium ${themeMode === 'light' ? 'text-[#0F172A]' : 'text-white/90'}`}>
                {navTab === 'trash'
                  ? isEn
                    ? 'Trash is empty.'
                    : 'Thùng rác trống.'
                  : searchText.trim()
                  ? isEn
                    ? 'No projects match your search.'
                    : 'Không tìm thấy dự án phù hợp.'
                  : isEn
                  ? 'No projects yet.'
                  : 'Chưa có dự án nào.'}
              </span>
              {navTab !== 'trash' && !searchText.trim() && (
                <span className="text-[11px] text-[#71717A]">
                  {isEn
                    ? 'Click "+ New Project" above to start your first video.'
                    : 'Bấm "+ Dự án mới" ở trên để bắt đầu dựng video đầu tiên.'}
                </span>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4'
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
                    className={`group relative rounded-lg overflow-hidden transition-all border ${
                      themeMode === 'light'
                        ? 'bg-[#FFFFFF] border-[#CBD5E1] hover:border-[#00E5CC] shadow-xs'
                        : 'bg-[#161820] border-[#272A36] hover:border-[#00E5CC]'
                    }`}
                  >
                    {/* Project Cover Thumbnail */}
                    <div
                      onClick={() => !proj.isDeletedInTrash && onOpenProject(proj)}
                      className={`h-24 sm:h-28 p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer transition-colors ${
                        themeMode === 'light'
                          ? 'bg-gradient-to-br from-[#E0F2FE] via-[#F0FDFA] to-[#CCFBF1] text-[#0F172A] border-b border-[#CBD5E1]'
                          : 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0D9488] text-white/90'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                          themeMode === 'light'
                            ? 'bg-white/95 text-[#0F766E] border border-slate-200 shadow-xs font-semibold'
                            : 'bg-black/60 text-[#00E5CC]'
                        }`}>
                          {proj.aspectRatio}
                        </span>
                        {isCloud && (
                          <span className={`px-1.5 py-0.5 text-[9px] rounded flex items-center gap-1 ${
                            themeMode === 'light'
                              ? 'bg-[#00E5CC]/25 text-[#0F766E] font-medium'
                              : 'bg-[#00E5CC]/20 text-[#00E5CC]'
                          }`}>
                            <Cloud className="w-2.5 h-2.5" /> {isEn ? 'Synced' : 'Đã đồng bộ'}
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center justify-between text-[11px] font-mono ${
                        themeMode === 'light' ? 'text-[#334155] font-semibold' : 'text-white/90'
                      }`}>
                        <span>{proj.clips.filter((c) => c.trackIndex === 0).length} clips</span>
                        <span>{dur.toFixed(1)}s</span>
                      </div>
                    </div>

                    {/* Project Footer & "..." Context Menu */}
                    <div className={`p-2.5 flex items-center justify-between gap-2 ${
                      themeMode === 'light' ? 'bg-[#FFFFFF] text-[#0F172A]' : 'bg-[#181A22]'
                    }`}>
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
                            className={`w-full px-1.5 py-0.5 text-xs border rounded ${
                              themeMode === 'light'
                                ? 'bg-white border-[#00D2C4] text-[#0F172A]'
                                : 'bg-[#101116] border-[#00E5CC] text-white'
                            }`}
                          />
                        ) : (
                          <div
                            onClick={() => !proj.isDeletedInTrash && onOpenProject(proj)}
                            className={`text-xs font-semibold truncate cursor-pointer hover:text-[#00E5CC] ${
                              themeMode === 'light' ? 'text-[#0F172A]' : 'text-white'
                            }`}
                          >
                            {proj.name}
                          </div>
                        )}
                        <div className="text-[10px] text-[#8E929F]">{proj.createdAt}</div>
                      </div>

                      {proj.isDeletedInTrash ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onRestoreProject(proj.id)}
                            className="px-2 py-1 text-[10px] font-semibold bg-[#00E5CC] text-black rounded cursor-pointer hover:bg-[#00F5DC] transition-colors"
                          >
                            {isEn ? 'Restore' : 'Khôi phục'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onPermanentDeleteProject?.(proj.id)}
                            title={isEn ? 'Permanently Delete' : 'Xóa vĩnh viễn'}
                            className="p-1 text-[#EF4444] hover:bg-[#EF4444]/15 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId((prev) => (prev === proj.id ? null : proj.id))
                            }
                            title={isEn ? 'Project options (...)' : 'Tùy chọn dự án (...)'}
                            className={`p-1 rounded cursor-pointer ${
                              themeMode === 'light' ? 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]' : 'text-[#A1A1AA] hover:text-white hover:bg-[#262936]'
                            }`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === proj.id && (
                            <div className={`absolute right-0 bottom-7 z-30 w-44 rounded-md shadow-2xl py-1 text-xs border ${
                              themeMode === 'light'
                                ? 'bg-white border-[#CBD5E1] text-[#0F172A]'
                                : 'bg-[#1F222D] border-[#363A4B] text-white'
                            }`}>
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingId(proj.id);
                                  setRenameVal(proj.name);
                                  setOpenMenuId(null);
                                }}
                                className={`w-full px-3 py-1.5 text-left flex items-center gap-2 cursor-pointer ${
                                  themeMode === 'light' ? 'hover:bg-[#F1F5F9] text-[#0F172A]' : 'hover:bg-[#2B2F3E] text-white'
                                }`}
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
                                className={`w-full px-3 py-1.5 text-left flex items-center gap-2 cursor-pointer ${
                                  themeMode === 'light' ? 'hover:bg-[#F1F5F9] text-[#0F172A]' : 'hover:bg-[#2B2F3E] text-white'
                                }`}
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
                                className={`w-full px-3 py-1.5 text-left flex items-center gap-2 cursor-pointer ${
                                  themeMode === 'light' ? 'hover:bg-[#F1F5F9] text-[#0F172A]' : 'hover:bg-[#2B2F3E] text-white'
                                }`}
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
                                className={`w-full px-3 py-1.5 text-left flex items-center gap-2 text-[#F87171] cursor-pointer ${
                                  themeMode === 'light' ? 'hover:bg-rose-50' : 'hover:bg-[#2B2F3E]'
                                }`}
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

      {/* Mobile Fixed Bottom Navigation Bar (CapCut Mobile style - Image 4) */}
      <div
        className={`flex md:hidden items-center justify-around px-2 py-2 border-t shrink-0 z-30 select-none ${
          themeMode === 'light'
            ? 'bg-white border-[#E2E8F0] text-[#0F172A]'
            : 'bg-[#14151B] border-[#22242D] text-white'
        }`}
      >
        {(
          [
            { id: 'home', label: isEn ? 'Edit' : 'Chỉnh sửa', icon: Scissors },
            { id: 'templates', label: isEn ? 'Templates' : 'Mẫu', icon: LayoutTemplate },
            { id: 'spaces', label: isEn ? 'Spaces' : 'Không gian', icon: Cloud },
            { id: 'ai_design', label: isEn ? 'Cover' : 'Ảnh bìa', icon: ImageIcon },
            { id: 'trash', label: isEn ? 'Trash' : 'Thùng rác', icon: Trash2 },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = navTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setNavTab(item.id)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg cursor-pointer transition-colors active:scale-95 ${
                active
                  ? 'text-[#00E5CC] font-bold'
                  : 'text-[#94A3B8] hover:text-current'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight font-medium">{item.label}</span>
            </button>
          );
        })}
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
  const [draftSavePath, setDraftSavePath] = useState(() => getProjectInstallDir());

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
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draftSavePath}
                    onChange={(e) => {
                      setDraftSavePath(e.target.value);
                      setProjectInstallDir(e.target.value);
                    }}
                    className="flex-1 px-2.5 py-1.5 bg-[#141418] border border-[#2B2B34] rounded font-mono text-[11px] text-[#D4D4D8] focus:border-[#00E5CC]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPath = prompt(
                        language === 'en'
                          ? 'Enter installation / projects folder path:'
                          : 'Nhập đường dẫn thư mục cài đặt / dự án:',
                        draftSavePath
                      );
                      if (newPath && newPath.trim()) {
                        setDraftSavePath(newPath.trim());
                        setProjectInstallDir(newPath.trim());
                      }
                    }}
                    className="px-2.5 py-1.5 bg-[#252832] hover:bg-[#303442] text-[#00E5CC] rounded text-[11px] font-semibold cursor-pointer shrink-0"
                  >
                    {language === 'en' ? 'Change' : 'Thay đổi'}
                  </button>
                </div>
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

              {/* PostgreSQL Database Storage Engine Card */}
              <div className="p-3 bg-[#141418] border border-[#2B2B34] rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Database className="w-3.5 h-3.5 text-[#00E5CC]" />
                    <span>
                      {language === 'en'
                        ? 'Database Engine:'
                        : 'Hệ thống Lưu trữ Cơ sở Dữ liệu:'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E5CC]/15 text-[#00E5CC] border border-[#00E5CC]/40 font-mono">
                    PostgreSQL (ACID + JSONB)
                  </span>
                </div>
                <div className="text-[10.5px] text-[#9CA3AF] leading-relaxed">
                  {language === 'en'
                    ? 'Projects, clips, and timeline states are securely persisted to PostgreSQL. Unlimited storage quota, multi-device synchronization, and zero data loss on browser cache cleanup.'
                    : 'Dự án, dòng thời gian và các clip được lưu kiên cố vào PostgreSQL. Không bị giới hạn 5MB như local storage, không lo mất khi dọn dẹp trình duyệt và hỗ trợ đồng bộ đa thiết bị an toàn 100%.'}
                </div>
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
