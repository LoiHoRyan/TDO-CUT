import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode2,
  FolderTree,
  FileJson,
  PackageCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ARCHITECTURE_DIAGRAM, PYTHON_MODULES } from '../data/pythonSourceCode';

interface PythonCodeExplorerProps {
  capcutDraftJson: Record<string, unknown>;
  ffmpegCommandPreview: string;
}

const REQUIREMENTS_TXT = `# requirements.txt — TrendOpsis Cut Hybrid Stack (C++ Core Engine + TS/C# UI + Python AI Pipeline)
# 1. C++ Core Engine: libavcodec / libavformat / CUDA NVENC / Direct3D11 / Metal / ONNX Runtime C++
# 2. Hybrid Desktop UI: TypeScript + React + C#/.NET (Windows) / Objective-C & Swift (macOS)
# 3. Python AI Deep Learning & Automation Dependencies:
PyQt6>=6.7.0
PyQt6-Qt6>=6.7.0
yt-dlp>=2025.1.15
scenedetect[opencv]>=0.6.4
faster-whisper>=1.1.0
onnxruntime-gpu>=1.19.0
numpy>=1.26.4
opencv-python>=4.10.0.84
`;

export const PythonCodeExplorer: React.FC<PythonCodeExplorerProps> = ({
  capcutDraftJson,
  ffmpegCommandPreview,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'cpp_core_engine'
    | 'cs_hybrid_bridge'
    | 'ffmpeg_engine'
    | 'ui_main_window'
    | 'timeline_widget'
    | 'requirements'
    | 'architecture'
    | 'capcut_json'
  >('cpp_core_engine');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedAll, setDownloadedAll] = useState(false);

  const getActiveContent = (): { filename: string; content: string } => {
    if (activeTab === 'requirements') {
      return {
        filename: 'requirements.txt',
        content: REQUIREMENTS_TXT,
      };
    }
    if (activeTab === 'architecture') {
      return {
        filename: 'TDO_CUT_Hybrid_Architecture.txt',
        content: `${ARCHITECTURE_DIAGRAM}\n\n# Lệnh FFmpeg Smart Matrix Render mẫu:\n${ffmpegCommandPreview}`,
      };
    }
    if (activeTab === 'capcut_json') {
      return {
        filename: 'tdo_project.json',
        content: JSON.stringify(capcutDraftJson, null, 2),
      };
    }
    const found = PYTHON_MODULES.find((m) => m.id === activeTab) || PYTHON_MODULES[0];
    return {
      filename: found.id === 'ui_main_window' ? 'main_pyqt6.py' : found.filename,
      content: found.code,
    };
  };

  const { filename, content } = getActiveContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopiedId(activeTab);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const triggerDownload = (fname: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingle = () => {
    triggerDownload(filename, content);
  };

  const handleDownloadAllBundle = () => {
    const bundleFiles: Array<{ name: string; body: string }> = [
      { name: 'requirements.txt', body: REQUIREMENTS_TXT },
      ...PYTHON_MODULES.map((m) => ({
        name: m.id === 'ui_main_window' ? 'main_pyqt6.py' : m.filename,
        body: m.code,
      })),
    ];
    bundleFiles.forEach((f, idx) => {
      setTimeout(() => {
        triggerDownload(f.name, f.body);
      }, idx * 180);
    });
    setDownloadedAll(true);
    setTimeout(() => setDownloadedAll(false), 2500);
  };

  return (
    <section
      aria-label="Kiến trúc Hybrid TDO CUT (C++ Core, TS/C# UI, Python AI)"
      className="flex flex-col flex-1 bg-[#18181C] border border-[#2B2B30] rounded overflow-hidden"
    >
      {/* 3-Tier TDO CUT Hybrid Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-3 bg-[#141418] border-b border-[#2B2B30] text-xs">
        <div
          onClick={() => setActiveTab('cpp_core_engine')}
          className={`p-2.5 rounded border cursor-pointer transition-colors ${
            activeTab === 'cpp_core_engine'
              ? 'bg-[#00E5CC]/10 border-[#00E5CC] text-white'
              : 'bg-[#1D1D24] border-[#2E2E38] text-[#D4D4D8] hover:border-[#00E5CC]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[#00E5CC] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>1. C++ (Core Engine Hiệu năng)</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00E5CC]/20 text-[#00E5CC]">
              GPU / CPU Native
            </span>
          </div>
          <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
            Xử lý render video, effects, filters, giải mã/mã hóa phần cứng (NVENC/AMF/QSV) và suy luận AI thời gian thực 60 FPS không giật lag.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('cs_hybrid_bridge')}
          className={`p-2.5 rounded border cursor-pointer transition-colors ${
            activeTab === 'cs_hybrid_bridge'
              ? 'bg-[#00E5CC]/10 border-[#00E5CC] text-white'
              : 'bg-[#1D1D24] border-[#2E2E38] text-[#D4D4D8] hover:border-[#00E5CC]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sky-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>2. JS/TS &amp; C# / Swift (Giao diện UI)</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
              Web-Native + OS
            </span>
          </div>
          <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
            Kết hợp TypeScript/HTML/CSS với C#/.NET (Windows) hoặc Objective-C/Swift (macOS) để dựng nút bấm, thanh Multi-Track Timeline và menu mượt mà.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('ffmpeg_engine')}
          className={`p-2.5 rounded border cursor-pointer transition-colors ${
            activeTab === 'ffmpeg_engine' || activeTab === 'ui_main_window'
              ? 'bg-[#00E5CC]/10 border-[#00E5CC] text-white'
              : 'bg-[#1D1D24] border-[#2E2E38] text-[#D4D4D8] hover:border-[#00E5CC]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. Python (Trí tuệ nhân tạo - AI)</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              Deep Learning
            </span>
          </div>
          <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
            Huấn luyện &amp; vận hành các mô hình Deep Learning: Tự động tạo phụ đề (Auto Captions), Tách nền AI (Auto Cutout), Đọc văn bản (TTS) &amp; FFmpeg.
          </p>
        </div>
      </div>

      {/* Header Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#1F1F24] border-b border-[#2B2B30]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('cpp_core_engine')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'cpp_core_engine'
                ? 'bg-[#00E5CC] text-[#0B0E11]'
                : 'bg-[#28282E] text-[#D4D4D8] hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>tdocut_core_engine.cpp (C++)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cs_hybrid_bridge')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'cs_hybrid_bridge'
                ? 'bg-[#00E5CC] text-[#0B0E11]'
                : 'bg-[#28282E] text-[#D4D4D8] hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>hybrid_ui_bridge.cs (C#/TS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ffmpeg_engine')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ffmpeg_engine'
                ? 'bg-[#00E5CC] text-[#0B0E11]'
                : 'bg-[#28282E] text-[#D4D4D8] hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>ffmpeg_engine.py (Python AI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ui_main_window')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ui_main_window'
                ? 'bg-[#00E5CC] text-[#0B0E11]'
                : 'bg-[#28282E] text-[#D4D4D8] hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>main_pyqt6.py</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline_widget')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'timeline_widget'
                ? 'bg-[#00E5CC] text-[#0B0E11]'
                : 'bg-[#28282E] text-[#D4D4D8] hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>timeline_widget.py</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-[#00E5CC] text-[#0B0E11]'
                : 'bg-[#28282E] text-[#D4D4D8] hover:text-white'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Sơ đồ Kiến trúc Hybrid</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('capcut_json')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'capcut_json'
                ? 'bg-[#00E5CC] text-[#0B0E11]'
                : 'bg-[#28282E] text-[#D4D4D8] hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>tdo_project.json</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requirements')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'requirements'
                ? 'bg-[#00E5CC] text-[#0B0E11]'
                : 'bg-[#28282E] text-[#D4D4D8] hover:text-white'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>requirements.txt</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#202636] hover:bg-[#2B3347] text-[#F1F5F9] border border-[#323C54] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copiedId === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00D2B4]" />
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#25252B] hover:bg-[#32323A] text-white border border-[#383842] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải {filename}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAllBundle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#00E5CC] hover:bg-[#00F5D4] text-[#090D14] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadedAll ? 'Đã tải trọn bộ mã nguồn!' : 'Tải trọn bộ Source Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Viewport */}
      <div className="flex-1 overflow-auto p-4 bg-[#0B0D13]">
        <pre className="text-xs font-mono leading-relaxed text-[#E2E8F0] select-all">
          <code>{content}</code>
        </pre>
      </div>
    </section>
  );
};

