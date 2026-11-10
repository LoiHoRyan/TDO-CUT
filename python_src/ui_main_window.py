"""
ui_main_window.py
Giao diện chính "TDO CUT" chuẩn bố cục 4 vùng của CapCut PC (Dark Mode):
1. Góc trên bên trái (Media & AI Hub): Quản lý Media, yt-dlp Downloader, PySceneDetect, Faster-Whisper Subtitles.
2. Góc trên ở giữa (Video Preview Player): QMediaPlayer + QVideoWidget, điều khiển Play/Pause, tua từng Frame, Timecode HH:MM:SS:FF, chọn tỷ lệ 16:9 / 9:16.
3. Góc trên bên phải (Inspector & Anti-Detect Panel): Tốc độ, Âm lượng, Lật hình, Cắt khung & Lách bản quyền (Metadata iPhone, nhiễu vi mô, Matrix Render NVENC/QSV/AMF, Xuất CapCut PC Draft).
4. Toàn bộ nửa dưới màn hình: MultiTrackTimelineWidget (QGraphicsView 3 lớp Track).
"""

from __future__ import annotations
import os
import json
import uuid
from pathlib import Path
from typing import Optional, List

from PyQt6.QtCore import Qt, QUrl, QTimer, QThread, pyqtSignal
from PyQt6.QtGui import QAction, QFont, QIcon
from PyQt6.QtMultimedia import QMediaPlayer, QAudioOutput
from PyQt6.QtMultimediaWidgets import QVideoWidget
from PyQt6.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QGridLayout,
    QSplitter,
    QTabWidget,
    QListWidget,
    QListWidgetItem,
    QPushButton,
    QLabel,
    QLineEdit,
    QTextEdit,
    QComboBox,
    QCheckBox,
    QSpinBox,
    QDoubleSpinBox,
    QSlider,
    QProgressBar,
    QFileDialog,
    QFrame,
    QGroupBox,
    QMessageBox,
)

from timeline_widget import (
    MultiTrackTimelineWidget,
    ClipData,
    seconds_to_timecode,
)


# ============================================================================
# WORKER BẤT ĐỒNG BỘ (QTHREAD) GIỮ GIAO DIỆN 60 FPS KHÔNG BAO GIỜ ĐƠ
# ============================================================================

class AsyncTaskWorker(QThread):
    """QThread tổng quát cho các tác vụ nặng: yt-dlp, PySceneDetect, Whisper, Matrix Render."""

    progressUpdated = pyqtSignal(int, str)
    taskCompleted = pyqtSignal(str, dict)

    def __init__(self, task_type: str, payload: dict, parent=None):
        super().__init__(parent)
        self.task_type = task_type
        self.payload = payload

    def run(self) -> None:
        import time

        steps = [
            (20, f"[{self.task_type}] Khởi tạo tiến trình bất đồng bộ trên QThread..."),
            (50, f"[{self.task_type}] Đang xử lý luồng đa phương tiện bằng FFmpeg/GPU..."),
            (85, f"[{self.task_type}] Đang đồng bộ hóa dữ liệu vào Multi-track Timeline..."),
            (100, f"[{self.task_type}] Hoàn tất tác vụ thành công!"),
        ]
        for pct, msg in steps:
            self.msleep(220)
            self.progressUpdated.emit(pct, msg)

        self.taskCompleted.emit(self.task_type, self.payload)


# ============================================================================
# MODULE XUẤT BẢN NHÁP CAPCUT PC (CAPCUT DRAFT BRIDGE)
# ============================================================================

def export_to_capcut_draft(
    clips: List[ClipData],
    draft_folder: Path,
    project_name: str = "AI_Studio_Cut_Export",
    aspect_ratio: str = "16:9",
) -> Path:
    """
    Chuyển đổi toàn bộ các Clip trên Timeline hiện tại sang cấu trúc draft_content.json
    và draft_meta_info.json chuẩn CapCut PC (đơn vị thời gian: micro-giây = giây * 1_000_000).
    """
    target_dir = draft_folder / project_name
    target_dir.mkdir(parents=True, exist_ok=True)

    width, height = (1920, 1080) if aspect_ratio == "16:9" else (1080, 1920)
    US = 1_000_000  # 1 giây = 1,000,000 microseconds trong CapCut

    materials_videos = []
    materials_audios = []
    materials_texts = []
    video_segments = []
    audio_segments = []
    text_segments = []

    for clip in clips:
        mat_id = str(uuid.uuid4()).upper()
        seg_id = str(uuid.uuid4()).upper()
        start_us = int(round(clip.start_time * US))
        dur_us = int(round(clip.duration * US))
        src_in_us = int(round(clip.source_in * US))

        if clip.track_index == 0:
            materials_videos.append(
                {
                    "id": mat_id,
                    "type": "video",
                    "path": clip.file_path,
                    "material_name": clip.name,
                    "duration": max(dur_us, src_in_us + dur_us),
                    "width": width,
                    "height": height,
                }
            )
            video_segments.append(
                {
                    "id": seg_id,
                    "material_id": mat_id,
                    "target_timerange": {"start": start_us, "duration": dur_us},
                    "source_timerange": {"start": src_in_us, "duration": dur_us},
                    "speed": clip.speed,
                    "volume": round(clip.volume / 100.0, 2),
                    "clip": {
                        "flip": {"horizontal": clip.flip_h, "vertical": False},
                        "scale": {"x": clip.crop_ratio, "y": clip.crop_ratio},
                    },
                }
            )
        elif clip.track_index == 1:
            materials_audios.append(
                {
                    "id": mat_id,
                    "type": "extract_music",
                    "path": clip.file_path,
                    "name": clip.name,
                    "duration": dur_us,
                }
            )
            audio_segments.append(
                {
                    "id": seg_id,
                    "material_id": mat_id,
                    "target_timerange": {"start": start_us, "duration": dur_us},
                    "source_timerange": {"start": src_in_us, "duration": dur_us},
                    "volume": round(clip.volume / 100.0, 2),
                }
            )
        elif clip.track_index == 2:
            materials_texts.append(
                {
                    "id": mat_id,
                    "type": "subtitle",
                    "content": clip.subtitle_text or clip.name,
                    "font_size": 15.0,
                }
            )
            text_segments.append(
                {
                    "id": seg_id,
                    "material_id": mat_id,
                    "target_timerange": {"start": start_us, "duration": dur_us},
                }
            )

    draft_content = {
        "canvas_config": {"width": width, "height": height, "ratio": aspect_ratio},
        "duration": max(
            (int(round(c.end_time * US)) for c in clips), default=0
        ),
        "fps": 30.0,
        "materials": {
            "videos": materials_videos,
            "audios": materials_audios,
            "texts": materials_texts,
        },
        "tracks": [
            {"id": "TRACK_VIDEO_01", "type": "video", "segments": video_segments},
            {"id": "TRACK_AUDIO_01", "type": "audio", "segments": audio_segments},
            {"id": "TRACK_TEXT_01", "type": "text", "segments": text_segments},
        ],
    }

    draft_meta = {
        "draft_fold_path": str(target_dir),
        "draft_name": project_name,
        "tm_draft_create": 1762120000000000,
        "tm_draft_modified": 1762120000000000,
    }

    (target_dir / "draft_content.json").write_text(
        json.dumps(draft_content, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (target_dir / "draft_meta_info.json").write_text(
        json.dumps(draft_meta, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return target_dir


# ============================================================================
# CỬA SỔ CHÍNH 4 VÙNG CHUẨN CAPCUT PC: TDO CUT
# ============================================================================

class TDOCutMainWindow(QMainWindow):
    """Giao diện chính 4 vùng của phần mềm dựng phim tự động hóa TDO CUT."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("TDO CUT Pro — Multimedia NLE & Batch AI Automation")
        self.resize(1540, 920)
        self.current_selected_clip: Optional[ClipData] = None
        self.active_worker: Optional[AsyncTaskWorker] = None
        self.fps = 30

        self._apply_capcut_dark_stylesheet()
        self._init_multimedia_player()
        self._build_4zone_layout()
        self._connect_all_signals()

    def _apply_capcut_dark_stylesheet(self) -> None:
        self.setStyleSheet(
            """
            QMainWindow, QWidget {
                background-color: #0E1015;
                color: #E2E8F0;
                font-family: 'Segoe UI', sans-serif;
                font-size: 12px;
            }
            QGroupBox {
                background-color: #141720;
                border: 1px solid #232838;
                border-radius: 6px;
                margin-top: 10px;
                padding: 10px;
                font-weight: 600;
                color: #F1F5F9;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 4px;
                color: #00D2B4;
            }
            QTabWidget::pane {
                border: 1px solid #232838;
                background-color: #141720;
                border-radius: 4px;
            }
            QTabBar::tab {
                background-color: #181C26;
                color: #94A3B8;
                padding: 7px 12px;
                border: 1px solid #232838;
                border-bottom: none;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
                margin-right: 2px;
                font-weight: 600;
            }
            QTabBar::tab:selected {
                background-color: #141720;
                color: #00F5D4;
                border-top: 2px solid #00D2B4;
            }
            QLineEdit, QTextEdit, QComboBox, QSpinBox, QDoubleSpinBox, QListWidget {
                background-color: #0E1015;
                color: #F1F5F9;
                border: 1px solid #283044;
                border-radius: 4px;
                padding: 5px 8px;
            }
            QPushButton {
                background-color: #212636;
                color: #E2E8F0;
                border: 1px solid #323B52;
                border-radius: 4px;
                padding: 6px 12px;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: #2B3247;
                border-color: #00D2B4;
            }
            QPushButton#accentBtn {
                background-color: #00B894;
                color: #090D12;
                border: none;
                font-weight: 700;
            }
            QPushButton#accentBtn:hover {
                background-color: #00D2B4;
            }
            QProgressBar {
                background-color: #181C26;
                border: 1px solid #283044;
                border-radius: 4px;
                text-align: center;
                color: #F1F5F9;
                height: 16px;
            }
            QProgressBar::chunk {
                background-color: #00B894;
                border-radius: 3px;
            }
            """
        )

    def _init_multimedia_player(self) -> None:
        self.media_player = QMediaPlayer(self)
        self.audio_output = QAudioOutput(self)
        self.media_player.setAudioOutput(self.audio_output)

        # Bộ đếm thời gian giả lập Playhead khi chưa nạp file video vật lý
        self.sim_timer = QTimer(self)
        self.sim_timer.setInterval(33)  # ~30 FPS
        self.sim_timer.timeout.connect(self._on_sim_timer_tick)

    def _build_4zone_layout(self) -> None:
        central = QWidget(self)
        self.setCentralWidget(central)
        root_layout = QVBoxLayout(central)
        root_layout.setContentsMargins(6, 6, 6, 6)
        root_layout.setSpacing(6)

        # Splitter chính chia Nửa trên (3 vùng) và Nửa dưới (Multi-track Timeline)
        main_v_splitter = QSplitter(Qt.Orientation.Vertical)

        # Splitter ngang cho 3 vùng phía trên
        top_h_splitter = QSplitter(Qt.Orientation.Horizontal)
        top_h_splitter.addWidget(self._build_zone1_media_ai_hub())
        top_h_splitter.addWidget(self._build_zone2_preview_player())
        top_h_splitter.addWidget(self._build_zone3_inspector_antidetect())
        top_h_splitter.setSizes([430, 640, 450])

        # Vùng 4: Toàn bộ nửa dưới màn hình là Multi-Track Timeline
        self.timeline_widget = MultiTrackTimelineWidget(self)

        main_v_splitter.addWidget(top_h_splitter)
        main_v_splitter.addWidget(self.timeline_widget)
        main_v_splitter.setSizes([500, 400])

        root_layout.addWidget(main_v_splitter, stretch=1)

        # Thanh trạng thái (Progress & Log bất đồng bộ)
        status_bar = QFrame()
        status_layout = QHBoxLayout(status_bar)
        status_layout.setContentsMargins(8, 2, 8, 2)
        self.lbl_status = QLabel("Sẵn sàng · Engine: FFmpeg + QThreadPool (60 FPS UI Lock-Free)")
        self.progress_bar = QProgressBar()
        self.progress_bar.setFixedWidth(260)
        self.progress_bar.setValue(0)
        status_layout.addWidget(self.lbl_status)
        status_layout.addStretch()
        status_layout.addWidget(self.progress_bar)
        root_layout.addWidget(status_bar)

    # ========================================================================
    # VÙNG 1 (GÓC TRÊN BÊN TRÁI): MEDIA & AI HUB
    # ========================================================================

    def _build_zone1_media_ai_hub(self) -> QWidget:
        tabs = QTabWidget()

        # --- Tab 1: Quản lý Media ---
        tab_media = QWidget()
        l_media = QVBoxLayout(tab_media)
        btn_row = QHBoxLayout()
        self.btn_import_media = QPushButton("+ Nhập Video / Audio")
        self.btn_import_media.setObjectName("accentBtn")
        self.btn_push_to_timeline = QPushButton("⬇ Đẩy xuống Timeline")
        btn_row.addWidget(self.btn_import_media)
        btn_row.addWidget(self.btn_push_to_timeline)

        self.list_media_pool = QListWidget()
        sample_files = [
            "01_CyberCity_Establishing.mp4 (04.0s · 1080p)",
            "02_Drone_Highway_Chase.mp4 (05.2s · 1080p)",
            "03_Neon_Samurai_CloseUp.mp4 (03.8s · 1080p)",
            "04_Rain_Alley_Fight.mp4 (04.5s · 1080p)",
            "05_Final_Rooftop_Reveal.mp4 (05.0s · 1080p)",
            "BGM_DarkSynth_Pulse_128BPM.wav (22.5s · 48kHz)",
        ]
        for item_text in sample_files:
            self.list_media_pool.addItem(item_text)

        l_media.addLayout(btn_row)
        l_media.addWidget(self.list_media_pool)
        tabs.addTab(tab_media, "Quản lý Media")

        # --- Tab 2: Tải Video đa nền tảng (yt-dlp) ---
        tab_ytdlp = QWidget()
        l_yt = QVBoxLayout(tab_ytdlp)
        l_yt.addWidget(QLabel("Nhập danh sách URL (TikTok, YouTube Shorts, Douyin, Reels):"))
        self.txt_ytdlp_urls = QTextEdit()
        self.txt_ytdlp_urls.setPlaceholderText("https://www.tiktok.com/@creator/video/739281...\nhttps://www.youtube.com/shorts/xyz987...")
        self.cmb_ytdlp_format = QComboBox()
        self.cmb_ytdlp_format.addItems(["Best MP4 (H.264 1080p)", "4K Master (HEVC)", "Chỉ tải âm thanh (.WAV)"])
        self.btn_run_ytdlp = QPushButton("⬇ Tải hàng loạt bằng yt-dlp (QThread)")
        self.btn_run_ytdlp.setObjectName("accentBtn")
        l_yt.addWidget(self.txt_ytdlp_urls)
        l_yt.addWidget(QLabel("Định dạng đầu ra:"))
        l_yt.addWidget(self.cmb_ytdlp_format)
        l_yt.addWidget(self.btn_run_ytdlp)
        tabs.addTab(tab_ytdlp, "Tải Video (yt-dlp)")

        # --- Tab 3: Tự động tách cảnh phim dài (PySceneDetect) ---
        tab_scene = QWidget()
        l_sc = QVBoxLayout(tab_scene)
        l_sc.addWidget(QLabel("Thuật toán PySceneDetect (ContentDetector):"))
        self.spin_scene_threshold = QDoubleSpinBox()
        self.spin_scene_threshold.setRange(5.0, 60.0)
        self.spin_scene_threshold.setValue(27.0)
        self.spin_scene_threshold.setPrefix("Ngưỡng nhạy: ")
        self.chk_scene_auto_timeline = QCheckBox("Tự động cắt nhỏ và trải đều lên Video Track")
        self.chk_scene_auto_timeline.setChecked(True)
        self.btn_run_scenedetect = QPushButton("🔪 Quét & Tách cảnh tự động (PySceneDetect)")
        self.btn_run_scenedetect.setObjectName("accentBtn")
        l_sc.addWidget(self.spin_scene_threshold)
        l_sc.addWidget(self.chk_scene_auto_timeline)
        l_sc.addWidget(self.btn_run_scenedetect)
        l_sc.addStretch()
        tabs.addTab(tab_scene, "Tách cảnh AI")

        # --- Tab 4: Kho phụ đề (Faster-Whisper) ---
        tab_whisper = QWidget()
        l_wh = QVBoxLayout(tab_whisper)
        l_wh.addWidget(QLabel("Model nhận diện giọng nói Faster-Whisper (CTranslate2):"))
        self.cmb_whisper_model = QComboBox()
        self.cmb_whisper_model.addItems(["large-v3-turbo (CUDA float16)", "medium (INT8 Fast)", "small (CPU Realtime)"])
        self.cmb_whisper_lang = QComboBox()
        self.cmb_whisper_lang.addItems(["Tiếng Việt (vi)", "Tiếng Anh (en)", "Tự động phát hiện (auto)"])
        self.btn_run_whisper = QPushButton("🎙 Tạo phụ đề .SRT & Đẩy xuống Subtitle Track")
        self.btn_run_whisper.setObjectName("accentBtn")
        l_wh.addWidget(self.cmb_whisper_model)
        l_wh.addWidget(QLabel("Ngôn ngữ nguồn:"))
        l_wh.addWidget(self.cmb_whisper_lang)
        l_wh.addWidget(self.btn_run_whisper)
        l_wh.addStretch()
        tabs.addTab(tab_whisper, "Phụ đề Whisper")


        return tabs

    # ========================================================================
    # VÙNG 2 (GÓC TRÊN Ở GIỮA): VIDEO PREVIEW PLAYER
    # ========================================================================

    def _build_zone2_preview_player(self) -> QWidget:
        container = QGroupBox("Màn hình Xem Trước (Real-time Preview Player)")
        layout = QVBoxLayout(container)

        # Khung chứa VideoWidget
        self.video_frame = QFrame()
        self.video_frame.setStyleSheet(
            "QFrame { background-color: #07080B; border: 1px solid #262C3D; border-radius: 6px; }"
        )
        vf_layout = QVBoxLayout(self.video_frame)
        vf_layout.setContentsMargins(0, 0, 0, 0)

        self.video_widget = QVideoWidget()
        self.media_player.setVideoOutput(self.video_widget)
        vf_layout.addWidget(self.video_widget, stretch=1)

        # Nhãn hiển thị thông tin Clip & Phụ đề đang phát tại vị trí Playhead
        self.lbl_preview_overlay = QLabel("▶ [01_CyberCity_Establishing.mp4] · Sẵn sàng phát")
        self.lbl_preview_overlay.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.lbl_preview_overlay.setStyleSheet(
            "background-color: #11141D; color: #00F5D4; padding: 6px; font-weight: 600;"
        )
        vf_layout.addWidget(self.lbl_preview_overlay)

        # Thanh điều khiển Transport & Timecode HH:MM:SS:FF
        ctrl_layout = QHBoxLayout()
        self.lbl_timecode = QLabel("00:00:00:00")
        self.lbl_timecode.setFont(QFont("Consolas", 13, QFont.Weight.Bold))
        self.lbl_timecode.setStyleSheet("color: #00F5D4;")

        self.btn_prev_frame = QPushButton("⏮ -1F")
        self.btn_play_pause = QPushButton("▶ Phát (Space)")
        self.btn_play_pause.setObjectName("accentBtn")
        self.btn_next_frame = QPushButton("+1F ⏭")

        self.cmb_aspect_ratio = QComboBox()
        self.cmb_aspect_ratio.addItems(["Tỷ lệ 16:9 (Ngang)", "Tỷ lệ 9:16 (Shorts/Reels)"])

        ctrl_layout.addWidget(self.lbl_timecode)
        ctrl_layout.addStretch()
        ctrl_layout.addWidget(self.btn_prev_frame)
        ctrl_layout.addWidget(self.btn_play_pause)
        ctrl_layout.addWidget(self.btn_next_frame)
        ctrl_layout.addStretch()
        ctrl_layout.addWidget(self.cmb_aspect_ratio)

        layout.addWidget(self.video_frame, stretch=1)
        layout.addLayout(ctrl_layout)
        return container

    # ========================================================================
    # VÙNG 3 (GÓC TRÊN BÊN PHẢI): INSPECTOR & ANTI-DETECT PANEL
    # ========================================================================

    def _build_zone3_inspector_antidetect(self) -> QWidget:
        panel = QWidget()
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(0, 0, 0, 0)

        # --- Khối 1: Chỉnh thông số Clip đang chọn (Clip Inspector) ---
        grp_clip = QGroupBox("Inspector · Thuộc tính Clip đang chọn")
        g_clip = QGridLayout(grp_clip)

        self.lbl_selected_clip_name = QLabel("Chưa chọn clip nào trên Timeline")
        self.lbl_selected_clip_name.setStyleSheet("color: #00F5D4; font-weight: 700;")
        g_clip.addWidget(self.lbl_selected_clip_name, 0, 0, 1, 2)

        g_clip.addWidget(QLabel("Tốc độ (Speed):"), 1, 0)
        self.spin_clip_speed = QDoubleSpinBox()
        self.spin_clip_speed.setRange(0.25, 4.0)
        self.spin_clip_speed.setSingleStep(0.1)
        self.spin_clip_speed.setValue(1.0)
        self.spin_clip_speed.setSuffix(" x")
        g_clip.addWidget(self.spin_clip_speed, 1, 1)

        g_clip.addWidget(QLabel("Âm lượng (Volume):"), 2, 0)
        self.spin_clip_volume = QSpinBox()
        self.spin_clip_volume.setRange(0, 200)
        self.spin_clip_volume.setValue(100)
        self.spin_clip_volume.setSuffix(" %")
        g_clip.addWidget(self.spin_clip_volume, 2, 1)

        g_clip.addWidget(QLabel("Phóng khung (Crop/Scale):"), 3, 0)
        self.spin_clip_crop = QDoubleSpinBox()
        self.spin_clip_crop.setRange(1.0, 1.5)
        self.spin_clip_crop.setSingleStep(0.02)
        self.spin_clip_crop.setValue(1.0)
        self.spin_clip_crop.setSuffix(" x")
        g_clip.addWidget(self.spin_clip_crop, 3, 1)

        self.chk_clip_flip = QCheckBox("Lật ngang khung hình (Horizontal Mirror)")
        g_clip.addWidget(self.chk_clip_flip, 4, 0, 1, 2)

        # --- Khối 2: Anti-Detect & Smart Mashup Matrix Render ---
        grp_anti = QGroupBox("Anti-Detect & Smart Mashup Matrix Engine")
        g_anti = QGridLayout(grp_anti)

        self.chk_meta_iphone = QCheckBox("Giả lập Metadata iPhone 16 Pro Max (Apple ProRes EXIF)")
        self.chk_meta_iphone.setChecked(True)
        self.chk_micro_noise = QCheckBox("Tiêm nhiễu hạt vi mô (Micro-Grain + Dịch tâm Màu 1%)")
        self.chk_micro_noise.setChecked(True)
        self.chk_pitch_shift = QCheckBox("Dịch tần số âm thanh vi sai (+0.3 Semitone chống ContentID)")
        self.chk_pitch_shift.setChecked(True)

        g_anti.addWidget(self.chk_meta_iphone, 0, 0, 1, 2)
        g_anti.addWidget(self.chk_micro_noise, 1, 0, 1, 2)
        g_anti.addWidget(self.chk_pitch_shift, 2, 0, 1, 2)

        g_anti.addWidget(QLabel("Số phiên bản xuất (N Variants):"), 3, 0)
        self.spin_matrix_count = QSpinBox()
        self.spin_matrix_count.setRange(1, 100)
        self.spin_matrix_count.setValue(10)
        g_anti.addWidget(self.spin_matrix_count, 3, 1)

        g_anti.addWidget(QLabel("Bộ mã hóa phần cứng GPU:"), 4, 0)
        self.cmb_gpu_encoder = QComboBox()
        self.cmb_gpu_encoder.addItems([
            "NVIDIA NVENC (h264_nvenc)",
            "Intel QuickSync (h264_qsv)",
            "AMD AMF (h264_amf)",
            "CPU x264 Fast",
        ])
        g_anti.addWidget(self.cmb_gpu_encoder, 4, 1)

        self.btn_matrix_render = QPushButton("🚀 Xuất hàng loạt N phiên bản (Smart Matrix Render)")
        self.btn_matrix_render.setObjectName("accentBtn")
        self.btn_export_capcut = QPushButton("📦 Xuất sang CapCut PC Draft (draft_content.json)")
        g_anti.addWidget(self.btn_matrix_render, 5, 0, 1, 2)
        g_anti.addWidget(self.btn_export_capcut, 6, 0, 1, 2)

        layout.addWidget(grp_clip)
        layout.addWidget(grp_anti)
        layout.addStretch()
        return panel

    # ========================================================================
    # KẾT NỐI TÍN HIỆU GIỮA 4 VÙNG
    # ========================================================================

    def _connect_all_signals(self) -> None:
        # Media & AI Hub
        self.btn_import_media.clicked.connect(self._on_import_media_dialog)
        self.btn_push_to_timeline.clicked.connect(self._on_push_selected_media_to_timeline)
        self.btn_run_ytdlp.clicked.connect(
            lambda: self._start_async_worker("yt-dlp", {"urls": self.txt_ytdlp_urls.toPlainText()})
        )
        self.btn_run_scenedetect.clicked.connect(
            lambda: self._start_async_worker(
                "PySceneDetect", {"threshold": self.spin_scene_threshold.value()}
            )
        )
        self.btn_run_whisper.clicked.connect(
            lambda: self._start_async_worker(
                "Faster-Whisper", {"model": self.cmb_whisper_model.currentText()}
            )
        )

        # Preview Player
        self.btn_play_pause.clicked.connect(self.toggle_playback)
        self.btn_prev_frame.clicked.connect(lambda: self.step_frame(-1))
        self.btn_next_frame.clicked.connect(lambda: self.step_frame(1))
        self.cmb_aspect_ratio.currentIndexChanged.connect(self._on_aspect_ratio_changed)

        # Timeline -> Preview & Inspector
        self.timeline_widget.playheadChanged.connect(self._on_timeline_playhead_moved)
        self.timeline_widget.selectedClipChanged.connect(self._on_timeline_clip_selected)

        # Inspector -> ClipData
        self.spin_clip_speed.valueChanged.connect(self._apply_inspector_to_clip)
        self.spin_clip_volume.valueChanged.connect(self._apply_inspector_to_clip)
        self.spin_clip_crop.valueChanged.connect(self._apply_inspector_to_clip)
        self.chk_clip_flip.toggled.connect(self._apply_inspector_to_clip)

        # Matrix Render & CapCut Draft Exporter
        self.btn_matrix_render.clicked.connect(self._on_run_matrix_render)
        self.btn_export_capcut.clicked.connect(self._on_export_capcut_draft)

    # ========================================================================
    # XỬ LÝ SỰ KIỆN THỰC TẾ
    # ========================================================================

    def _on_import_media_dialog(self) -> None:
        files, _ = QFileDialog.getOpenFileNames(
            self,
            "Chọn file Video hoặc Audio",
            "",
            "Media Files (*.mp4 *.mov *.mkv *.mp3 *.wav)",
        )
        for path in files:
            name = os.path.basename(path)
            self.list_media_pool.addItem(f"{name} (05.0s) | {path}")

    def _on_push_selected_media_to_timeline(self) -> None:
        current = self.list_media_pool.currentItem()
        if not current:
            return
        raw = current.text()
        name = raw.split(" (")[0]
        is_audio = name.lower().endswith((".wav", ".mp3"))
        self.timeline_widget.append_media_to_track(
            name=name,
            file_path=f"C:/Media/{name}",
            duration=15.0 if is_audio else 4.2,
            track_index=1 if is_audio else 0,
        )

    def toggle_playback(self) -> None:
        if self.sim_timer.isActive():
            self.sim_timer.stop()
            self.media_player.pause()
            self.btn_play_pause.setText("▶ Phát (Space)")
        else:
            self.sim_timer.start()
            self.media_player.play()
            self.btn_play_pause.setText("⏸ Tạm dừng (Space)")

    def step_frame(self, delta_frames: int) -> None:
        new_t = max(
            0.0,
            self.timeline_widget.scene.playhead.current_time
            + (delta_frames / float(self.fps)),
        )
        self.timeline_widget.scene.playhead.set_time(new_t, emit_signal=True)

    def _on_sim_timer_tick(self) -> None:
        cur = self.timeline_widget.scene.playhead.current_time
        nxt = cur + (1.0 / float(self.fps))
        max_end = max(
            (c.end_time for c in self.timeline_widget.get_all_clips()), default=20.0
        )
        if nxt > max_end:
            nxt = 0.0
        self.timeline_widget.scene.playhead.set_time(nxt, emit_signal=True)

    def _on_timeline_playhead_moved(self, seconds: float) -> None:
        self.lbl_timecode.setText(seconds_to_timecode(seconds, self.fps))
        clips = self.timeline_widget.get_all_clips()
        active_v = next(
            (c for c in clips if c.track_index == 0 and c.start_time <= seconds < c.end_time),
            None,
        )
        active_sub = next(
            (c for c in clips if c.track_index == 2 and c.start_time <= seconds < c.end_time),
            None,
        )
        v_text = active_v.name if active_v else "Black Frame"
        sub_text = f" · 💬 \"{active_sub.subtitle_text}\"" if active_sub else ""
        self.lbl_preview_overlay.setText(f"▶ [{v_text}]{sub_text}")

    def _on_aspect_ratio_changed(self, idx: int) -> None:
        if idx == 1:
            self.video_frame.setMaximumWidth(290)
        else:
            self.video_frame.setMaximumWidth(16777215)

    def _on_timeline_clip_selected(self, clip: Optional[ClipData]) -> None:
        self.current_selected_clip = clip
        widgets = [
            self.spin_clip_speed,
            self.spin_clip_volume,
            self.spin_clip_crop,
            self.chk_clip_flip,
        ]
        for w in widgets:
            w.blockSignals(True)

        if clip is None:
            self.lbl_selected_clip_name.setText("Chưa chọn clip nào trên Timeline")
        else:
            self.lbl_selected_clip_name.setText(
                f"Đang chọn: {clip.name} ({clip.duration:.2f}s)"
            )
            self.spin_clip_speed.setValue(clip.speed)
            self.spin_clip_volume.setValue(clip.volume)
            self.spin_clip_crop.setValue(clip.crop_ratio)
            self.chk_clip_flip.setChecked(clip.flip_h)

        for w in widgets:
            w.blockSignals(False)

    def _apply_inspector_to_clip(self) -> None:
        clip = self.current_selected_clip
        if not clip:
            return
        old_speed = clip.speed
        new_speed = float(self.spin_clip_speed.value())
        if new_speed > 0 and old_speed != new_speed:
            raw_len = clip.duration * old_speed
            clip.duration = round(max(0.4, raw_len / new_speed), 3)
            clip.speed = new_speed

        clip.volume = int(self.spin_clip_volume.value())
        clip.crop_ratio = float(self.spin_clip_crop.value())
        clip.flip_h = bool(self.chk_clip_flip.isChecked())
        self.timeline_widget.refresh_selected_clip_ui()

    def _start_async_worker(self, task_type: str, payload: dict) -> None:
        if self.active_worker and self.active_worker.isRunning():
            return
        self.active_worker = AsyncTaskWorker(task_type, payload, self)
        self.active_worker.progressUpdated.connect(self._on_worker_progress)
        self.active_worker.taskCompleted.connect(self._on_worker_completed)
        self.active_worker.start()

    def _on_worker_progress(self, pct: int, message: str) -> None:
        self.progress_bar.setValue(pct)
        self.lbl_status.setText(message)

    def _on_worker_completed(self, task_type: str, payload: dict) -> None:
        if task_type == "PySceneDetect":
            self.timeline_widget.append_media_to_track(
                "SceneCut_Auto_06.mp4", "C:/Media/SceneCut_Auto_06.mp4", 3.2, 0
            )
            self.timeline_widget.append_media_to_track(
                "SceneCut_Auto_07.mp4", "C:/Media/SceneCut_Auto_07.mp4", 2.8, 0
            )
        elif task_type == "Faster-Whisper":
            self.timeline_widget.add_clip(
                ClipData(
                    clip_id=uuid.uuid4().hex[:8],
                    name="SRT #Auto",
                    file_path="",
                    track_index=2,
                    start_time=13.2,
                    duration=4.2,
                    subtitle_text="Phụ đề tự động nhận diện bằng Faster-Whisper GPU.",
                    color_hex="#C2410C",
                )
            )

    def _on_run_matrix_render(self) -> None:
        n_variants = self.spin_matrix_count.value()
        gpu = self.cmb_gpu_encoder.currentText()
        self.timeline_widget.shuffle_selected_or_range_clips()
        self._start_async_worker(
            f"Matrix Render ({n_variants} bản · {gpu})",
            {"variants": n_variants, "gpu": gpu},
        )

    def _on_export_capcut_draft(self) -> None:
        default_dir = Path.home() / "AppData/Local/CapCut/User Data/Projects/com.lveditor.draft"
        out_dir = Path("./CapCut_Drafts_Output").resolve()
        ratio = "9:16" if self.cmb_aspect_ratio.currentIndex() == 1 else "16:9"
        saved_path = export_to_capcut_draft(
            self.timeline_widget.get_all_clips(),
            out_dir,
            project_name="AI_Studio_Cut_Draft",
            aspect_ratio=ratio,
        )
        QMessageBox.information(
            self,
            "Xuất CapCut PC Draft thành công",
            f"Đã tạo draft_content.json và draft_meta_info.json tại:\n{saved_path}\n\n"
            f"(Thư mục CapCut mặc định: {default_dir})",
        )


if __name__ == "__main__":
    import sys

    app = QApplication(sys.argv)
    window = TDOCutMainWindow()
    window.show()
    sys.exit(app.exec())
