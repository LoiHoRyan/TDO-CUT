"""
timeline_widget.py
Hệ thống Multi-Track Timeline dựng phim chuyên nghiệp sử dụng PyQt6 (QGraphicsView / QGraphicsScene).
Hỗ trợ:
- 3 lớp Track: Video Track (V1), Audio/BGM Track (A1), Subtitle Track (S1).
- Kéo thả thanh kim chỉ thời gian (Playhead) mượt mà ở 60 FPS.
- Phóng to / thu nhỏ tỷ lệ thời gian (Zoom Timeline bằng Ctrl + Lăn chuột hoặc Slider).
- Cắt đôi clip tại vị trí Playhead (Split - Phím B).
- Xóa clip đang chọn (Phím Delete / Backspace).
- Đảo ngẫu nhiên các clip đang bôi đen hoặc nằm trong khoảng chỉ số từ X đến Y (Smart Shuffle).
- Cắt ngắn hàng loạt (Batch Trim) các clip đang chọn.
"""

from __future__ import annotations
import uuid
import random
from dataclasses import dataclass, field
from typing import List, Optional, Dict

from PyQt6.QtCore import Qt, QRectF, QPointF, pyqtSignal, QLineF
from PyQt6.QtGui import (
    QPainter,
    QColor,
    QPen,
    QBrush,
    QFont,
    QPolygonF,
    QLinearGradient,
    QKeyEvent,
    QWheelEvent,
    QMouseEvent,
)
from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QPushButton,
    QLabel,
    QSlider,
    QSpinBox,
    QDoubleSpinBox,
    QGraphicsView,
    QGraphicsScene,
    QGraphicsRectItem,
    QGraphicsItem,
    QGraphicsObject,
    QStyleOptionGraphicsItem,
    QFrame,
    QMessageBox,
)


# ============================================================================
# DATA MODEL CHO CLIP TRÊN TIMELINE
# ============================================================================

@dataclass
class ClipData:
    clip_id: str
    name: str
    file_path: str
    track_index: int          # 0: Video Track, 1: Audio Track, 2: Subtitle Track
    start_time: float         # Thời điểm bắt đầu trên Timeline (giây)
    duration: float           # Thời lượng hiển thị trên Timeline (giây)
    source_in: float = 0.0    # Điểm cắt đầu trong file gốc (giây)
    speed: float = 1.0        # Tốc độ phát (0.25x -> 4.0x)
    volume: int = 100         # Âm lượng (0 -> 200%)
    flip_h: bool = False      # Lật ngang chống bản quyền
    crop_ratio: float = 1.0   # Hệ số zoom/crop (1.0 -> 1.5)
    subtitle_text: str = ""   # Nội dung phụ đề nếu ở Track 2
    color_hex: str = "#1B7A6E"

    @property
    def end_time(self) -> float:
        return self.start_time + self.duration

    def clone_with(self, **kwargs) -> "ClipData":
        data = {
            "clip_id": uuid.uuid4().hex[:8],
            "name": self.name,
            "file_path": self.file_path,
            "track_index": self.track_index,
            "start_time": self.start_time,
            "duration": self.duration,
            "source_in": self.source_in,
            "speed": self.speed,
            "volume": self.volume,
            "flip_h": self.flip_h,
            "crop_ratio": self.crop_ratio,
            "subtitle_text": self.subtitle_text,
            "color_hex": self.color_hex,
        }
        data.update(kwargs)
        return ClipData(**data)


# ============================================================================
# HẰNG SỐ GIAO DIỆN TIMELINE (CHUẨN CAPCUT PC DARK MODE)
# ============================================================================

HEADER_WIDTH = 145          # Độ rộng cột tên Track bên trái
RULER_HEIGHT = 32           # Chiều cao thước đo thời gian
TRACK_HEIGHT = 58           # Chiều cao mỗi Track
TRACK_GAP = 8               # Khoảng cách giữa các Track
TRACK_NAMES = [
    ("V1 · Video Track", "#00B894"),
    ("A1 · Audio / BGM", "#0984E3"),
    ("S1 · Subtitles (.SRT)", "#E17055"),
]


def seconds_to_timecode(seconds: float, fps: int = 30) -> str:
    """Chuyển đổi số giây sang định dạng chuẩn SMPTE HH:MM:SS:FF."""
    seconds = max(0.0, seconds)
    total_frames = int(round(seconds * fps))
    ff = total_frames % fps
    total_seconds = total_frames // fps
    ss = total_seconds % 60
    mm = (total_seconds // 60) % 60
    hh = total_seconds // 3600
    return f"{hh:02d}:{mm:02d}:{ss:02d}:{ff:02d}"


# ============================================================================
# GRAPHICS ITEM: KHỐI CLIP TRÊN TIMELINE
# ============================================================================

class TimelineClipItem(QGraphicsRectItem):
    """
    Khối Clip vẽ trên QGraphicsScene.
    Cho phép chọn nhiều clip (RubberBand / Ctrl+Click), kéo thả ngang trên cùng Track,
    và tự động cập nhật start_time khi người dùng thả chuột.
    """

    def __init__(
        self,
        clip_data: ClipData,
        pixels_per_second: float,
        scene_ref: "TimelineGraphicsScene",
    ):
        super().__init__()
        self.clip_data = clip_data
        self.pps = pixels_per_second
        self.scene_ref = scene_ref

        self.setFlags(
            QGraphicsItem.GraphicsItemFlag.ItemIsSelectable
            | QGraphicsItem.GraphicsItemFlag.ItemIsMovable
            | QGraphicsItem.GraphicsItemFlag.ItemSendsGeometryChanges
        )
        self.setAcceptHoverEvents(True)
        self._is_hovered = False
        self.sync_geometry_from_data()

    def track_y(self) -> float:
        return RULER_HEIGHT + 8 + self.clip_data.track_index * (TRACK_HEIGHT + TRACK_GAP)

    def sync_geometry_from_data(self) -> None:
        """Cập nhật vị trí X, Y và độ rộng dựa trên start_time, duration và tỷ lệ zoom."""
        x = HEADER_WIDTH + self.clip_data.start_time * self.pps
        y = self.track_y()
        w = max(12.0, self.clip_data.duration * self.pps)
        self.setPos(x, y)
        self.setRect(0, 0, w, TRACK_HEIGHT)
        self.update()

    def itemChange(self, change: QGraphicsItem.GraphicsItemChange, value):
        """Khóa trục Y của Track và không cho kéo clip lùi qua mốc 00:00:00:00."""
        if change == QGraphicsItem.GraphicsItemChange.ItemPositionChange and self.scene():
            new_pos: QPointF = value
            clamped_x = max(float(HEADER_WIDTH), new_pos.x())
            fixed_y = self.track_y()
            new_start = (clamped_x - HEADER_WIDTH) / self.pps
            self.clip_data.start_time = round(new_start, 3)
            return QPointF(clamped_x, fixed_y)

        if change == QGraphicsItem.GraphicsItemChange.ItemSelectedHasChanged:
            self.scene_ref.clipSelectionChanged.emit()

        return super().itemChange(change, value)

    def mouseReleaseEvent(self, event):
        super().mouseReleaseEvent(event)
        self.scene_ref.clipsModified.emit()

    def hoverEnterEvent(self, event):
        self._is_hovered = True
        self.update()
        super().hoverEnterEvent(event)

    def hoverLeaveEvent(self, event):
        self._is_hovered = False
        self.update()
        super().hoverLeaveEvent(event)

    def paint(
        self,
        painter: QPainter,
        option: QStyleOptionGraphicsItem,
        widget: Optional[QWidget] = None,
    ) -> None:
        rect = self.rect()
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)

        base_color = QColor(self.clip_data.color_hex)
        if self._is_hovered:
            base_color = base_color.lighter(112)

        grad = QLinearGradient(rect.topLeft(), rect.bottomLeft())
        grad.setColorAt(0.0, base_color.lighter(115))
        grad.setColorAt(1.0, base_color.darker(125))

        painter.setBrush(QBrush(grad))

        if self.isSelected():
            pen = QPen(QColor("#00F5D4"), 2.2)
        else:
            pen = QPen(QColor("#2D3548"), 1.0)
        painter.setPen(pen)
        painter.drawRoundedRect(rect.adjusted(1, 1, -1, -1), 5.0, 5.0)

        # Thanh tiêu đề trên cùng của mỗi Clip
        header_rect = QRectF(rect.left() + 1, rect.top() + 1, rect.width() - 2, 18)
        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(QColor(0, 0, 0, 85))
        painter.drawRoundedRect(header_rect, 4.0, 4.0)

        # Vẽ tên clip & thông số tốc độ / lật hình
        painter.setPen(QColor("#F1F5F9"))
        font = QFont("Segoe UI", 8, QFont.Weight.DemiBold)
        painter.setFont(font)

        badge_suffix = ""
        if self.clip_data.speed != 1.0:
            badge_suffix += f" [{self.clip_data.speed:.1f}x]"
        if self.clip_data.flip_h:
            badge_suffix += " [Flip]"

        title_text = f"{self.clip_data.name}{badge_suffix}"
        text_rect = rect.adjusted(7, 3, -6, -4)
        painter.drawText(
            text_rect,
            Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignLeft,
            painter.fontMetrics().elidedText(
                title_text, Qt.TextElideMode.ElideRight, int(text_rect.width())
            ),
        )

        # Vẽ thời lượng hoặc nội dung phụ đề bên dưới
        sub_font = QFont("Consolas", 8)
        painter.setFont(sub_font)
        painter.setPen(QColor("#CBD5E1"))
        meta_line = (
            self.clip_data.subtitle_text
            if self.clip_data.track_index == 2 and self.clip_data.subtitle_text
            else f"{self.clip_data.duration:.2f}s | In: {self.clip_data.source_in:.1f}s"
        )
        painter.drawText(
            rect.adjusted(7, 22, -6, -5),
            Qt.AlignmentFlag.AlignBottom | Qt.AlignmentFlag.AlignLeft,
            painter.fontMetrics().elidedText(
                meta_line, Qt.TextElideMode.ElideRight, int(text_rect.width())
            ),
        )

        # Nếu là Audio Track, vẽ thêm đường sóng âm minh họa
        if self.clip_data.track_index == 1 and rect.width() > 30:
            wave_pen = QPen(QColor(255, 255, 255, 70), 1.0)
            painter.setPen(wave_pen)
            mid_y = rect.top() + rect.height() * 0.65
            step = 6
            for x_offset in range(8, int(rect.width()) - 8, step):
                amp = 4 + ((x_offset * 17) % 10)
                painter.drawLine(
                    QLineF(x_offset, mid_y - amp / 2, x_offset, mid_y + amp / 2)
                )


# ============================================================================
# GRAPHICS OBJECT: KIM CHỈ THỜI GIAN (PLAYHEAD)
# ============================================================================

class TimelinePlayheadItem(QGraphicsObject):
    """Thanh kim chỉ thời gian màu đỏ/cyan có đầu tam giác, kéo mượt trên Timeline."""

    positionMoved = pyqtSignal(float)  # Phát ra số giây hiện tại

    def __init__(self, total_height: float, pixels_per_second: float):
        super().__init__()
        self.total_height = total_height
        self.pps = pixels_per_second
        self.current_time = 0.0
        self.setZValue(1000)  # Luôn nổi trên mọi Clip
        self.setAcceptedMouseButtons(Qt.MouseButton.LeftButton)
        self.setCursor(Qt.CursorShape.SizeHorCursor)
        self.sync_pos()

    def boundingRect(self) -> QRectF:
        return QRectF(-9, 0, 18, self.total_height)

    def sync_pos(self) -> None:
        x = HEADER_WIDTH + self.current_time * self.pps
        self.setPos(x, 0)

    def set_time(self, seconds: float, emit_signal: bool = False) -> None:
        self.current_time = max(0.0, seconds)
        self.sync_pos()
        if emit_signal:
            self.positionMoved.emit(self.current_time)

    def paint(
        self,
        painter: QPainter,
        option: QStyleOptionGraphicsItem,
        widget: Optional[QWidget] = None,
    ) -> None:
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)
        playhead_color = QColor("#FF4757")

        # Đầu kim hình ngũ giác chuẩn CapCut
        head_poly = QPolygonF(
            [
                QPointF(-7, 2),
                QPointF(7, 2),
                QPointF(7, 13),
                QPointF(0, 21),
                QPointF(-7, 13),
            ]
        )
        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(QBrush(playhead_color))
        painter.drawPolygon(head_poly)

        # Đường kẻ dọc xuyên suốt các Track
        pen = QPen(playhead_color, 1.8)
        painter.setPen(pen)
        painter.drawLine(QLineF(0, 20, 0, self.total_height))

    def mousePressEvent(self, event):
        event.accept()

    def mouseMoveEvent(self, event):
        scene_x = self.mapToScene(event.pos()).x()
        clamped_x = max(float(HEADER_WIDTH), scene_x)
        new_time = (clamped_x - HEADER_WIDTH) / self.pps
        self.set_time(round(new_time, 3), emit_signal=True)
        event.accept()


# ============================================================================
# GRAPHICS SCENE & VIEW: BÀN DỰNG ĐA LỚP (MULTI-TRACK SCENE)
# ============================================================================

class TimelineGraphicsScene(QGraphicsScene):
    """Quản lý nền Track, Thước đo thời gian (Ruler), các ClipItem và Playhead."""

    playheadTimeChanged = pyqtSignal(float)
    clipSelectionChanged = pyqtSignal()
    clipsModified = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self.pps = 45.0  # Pixels per second mặc định
        self.total_duration = 120.0  # Độ dài vùng dựng tối thiểu (giây)

        total_h = RULER_HEIGHT + 24 + len(TRACK_NAMES) * (TRACK_HEIGHT + TRACK_GAP)
        self.playhead = TimelinePlayheadItem(total_h, self.pps)
        self.playhead.positionMoved.connect(self.playheadTimeChanged.emit)
        self.addItem(self.playhead)
        self.update_scene_rect()

    def update_scene_rect(self) -> None:
        total_w = HEADER_WIDTH + max(self.total_duration, 60.0) * self.pps + 300
        total_h = RULER_HEIGHT + 24 + len(TRACK_NAMES) * (TRACK_HEIGHT + TRACK_GAP)
        self.setSceneRect(0, 0, total_w, total_h)
        self.playhead.total_height = total_h

    def drawBackground(self, painter: QPainter, rect: QRectF) -> None:
        """Vẽ nền tối CapCut, thước đo thời gian (Ruler) và khung 3 Track."""
        painter.fillRect(rect, QColor("#111319"))

        scene_rect = self.sceneRect()
        # 1. Vẽ nền thước đo (Ruler)
        ruler_rect = QRectF(0, 0, scene_rect.width(), RULER_HEIGHT)
        painter.fillRect(ruler_rect, QColor("#181B24"))

        # 2. Vẽ các vạch chia giây trên thước đo
        font = QFont("Consolas", 8)
        painter.setFont(font)

        step_sec = 1 if self.pps >= 35 else (2 if self.pps >= 18 else 5)
        max_sec = int((scene_rect.width() - HEADER_WIDTH) / self.pps) + 1

        for sec in range(0, max_sec, step_sec):
            x = HEADER_WIDTH + sec * self.pps
            if x < rect.left() - 50 or x > rect.right() + 50:
                continue
            painter.setPen(QPen(QColor("#475569"), 1.0))
            painter.drawLine(QLineF(x, RULER_HEIGHT - 10, x, RULER_HEIGHT))

            painter.setPen(QColor("#94A3B8"))
            mm = (sec // 60) % 60
            ss = sec % 60
            painter.drawText(QPointF(x + 4, RULER_HEIGHT - 12), f"{mm:02d}:{ss:02d}")

            # Vạch phụ nửa giây
            if self.pps >= 30:
                sub_x = x + (step_sec * self.pps) / 2.0
                painter.setPen(QPen(QColor("#2D3548"), 1.0))
                painter.drawLine(QLineF(sub_x, RULER_HEIGHT - 5, sub_x, RULER_HEIGHT))

        # 3. Vẽ dải nền cho 3 lớp Track và ô Header tên Track bên trái
        for idx, (track_label, accent_hex) in enumerate(TRACK_NAMES):
            y = RULER_HEIGHT + 8 + idx * (TRACK_HEIGHT + TRACK_GAP)

            # Làn Track chứa Clip
            lane_rect = QRectF(
                HEADER_WIDTH, y, scene_rect.width() - HEADER_WIDTH, TRACK_HEIGHT
            )
            painter.fillRect(lane_rect, QColor("#171A23"))
            painter.setPen(QPen(QColor("#222736"), 1.0))
            painter.drawRect(lane_rect)

            # Cột Header tên Track bên trái
            header_box = QRectF(0, y, HEADER_WIDTH - 2, TRACK_HEIGHT)
            painter.fillRect(header_box, QColor("#1D2230"))

            # Vạch màu nhận diện loại Track
            painter.fillRect(QRectF(0, y, 4, TRACK_HEIGHT), QColor(accent_hex))

            painter.setPen(QColor("#E2E8F0"))
            painter.setFont(QFont("Segoe UI", 9, QFont.Weight.DemiBold))
            painter.drawText(
                header_box.adjusted(12, 0, -6, 0),
                Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignLeft,
                track_label,
            )

        # Góc trên bên trái của Ruler
        corner_rect = QRectF(0, 0, HEADER_WIDTH - 2, RULER_HEIGHT)
        painter.fillRect(corner_rect, QColor("#181B24"))
        painter.setPen(QColor("#64748B"))
        painter.setFont(QFont("Consolas", 8, QFont.Weight.Bold))
        painter.drawText(
            corner_rect.adjusted(10, 0, -4, 0),
            Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignLeft,
            "TRACKS / TIMECODE",
        )


class TimelineGraphicsView(QGraphicsView):
    """Khung nhìn QGraphicsView hỗ trợ click trên Ruler để nhảy Playhead và phím tắt."""

    splitShortcutPressed = pyqtSignal()
    deleteShortcutPressed = pyqtSignal()

    def __init__(self, scene: TimelineGraphicsScene, parent=None):
        super().__init__(scene, parent)
        self.timeline_scene = scene
        self.setRenderHints(
            QPainter.RenderHint.Antialiasing | QPainter.RenderHint.TextAntialiasing
        )
        self.setDragMode(QGraphicsView.DragMode.RubberBandDrag)
        self.setViewportUpdateMode(
            QGraphicsView.ViewportUpdateMode.FullViewportUpdate
        )
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOn)
        self.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setStyleSheet(
            "QGraphicsView { border: 1px solid #232838; background: #111319; }"
        )

    def mousePressEvent(self, event: QMouseEvent) -> None:
        scene_pt = self.mapToScene(event.pos())
        # Nếu người dùng click vào vùng Ruler phía trên, nhảy Playhead tới vị trí đó ngay lập tức
        if scene_pt.y() <= RULER_HEIGHT and scene_pt.x() >= HEADER_WIDTH:
            new_time = (scene_pt.x() - HEADER_WIDTH) / self.timeline_scene.pps
            self.timeline_scene.playhead.set_time(round(new_time, 3), emit_signal=True)
            event.accept()
            return
        super().mousePressEvent(event)

    def wheelEvent(self, event: QWheelEvent) -> None:
        """Giữ Ctrl + Lăn chuột để Zoom Timeline."""
        if event.modifiers() & Qt.KeyboardModifier.ControlModifier:
            delta = event.angleDelta().y()
            factor = 1.15 if delta > 0 else 0.87
            new_pps = max(10.0, min(160.0, self.timeline_scene.pps * factor))
            if hasattr(self.parent(), "set_zoom_pps"):
                self.parent().set_zoom_pps(new_pps)
            event.accept()
            return
        super().wheelEvent(event)

    def keyPressEvent(self, event: QKeyEvent) -> None:
        if event.key() == Qt.Key.Key_B:
            self.splitShortcutPressed.emit()
            event.accept()
            return
        if event.key() in (Qt.Key.Key_Delete, Qt.Key.Key_Backspace):
            self.deleteShortcutPressed.emit()
            event.accept()
            return
        super().keyPressEvent(event)


# ============================================================================
# WIDGET TỔNG HỢP: MULTI-TRACK TIMELINE (NỬA DƯỚI MÀN HÌNH)
# ============================================================================

class MultiTrackTimelineWidget(QWidget):
    """
    Widget Timeline hoàn chỉnh tích hợp thanh công cụ dựng phim (Split, Delete,
    Random Shuffle khoảng chọn, Batch Trim, Zoom) và QGraphicsView đa lớp.
    """

    playheadChanged = pyqtSignal(float)               # Thời gian Playhead hiện tại (giây)
    selectedClipChanged = pyqtSignal(object)          # Phát ra ClipData đang chọn (hoặc None)
    timelineClipsUpdated = pyqtSignal(list)           # Phát ra danh sách toàn bộ ClipData

    def __init__(self, parent=None):
        super().__init__(parent)
        self.clip_items: List[TimelineClipItem] = []

        self._build_ui()
        self._connect_signals()
        self.load_demo_project()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)

        # --- THANH CÔNG CỤ TIMELINE (TOOLBAR) ---
        toolbar = QFrame()
        toolbar.setStyleSheet(
            """
            QFrame {
                background-color: #171A24;
                border-top: 1px solid #262C3D;
                border-bottom: 1px solid #262C3D;
            }
            QPushButton {
                background-color: #222736;
                color: #E2E8F0;
                border: 1px solid #333C52;
                border-radius: 4px;
                padding: 4px 10px;
                font-size: 12px;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: #2D3548;
                border-color: #00D2B4;
            }
            QPushButton#primaryAction {
                background-color: #00B894;
                color: #0B0F14;
                border: none;
            }
            QPushButton#primaryAction:hover {
                background-color: #00D2B4;
            }
            QLabel {
                color: #94A3B8;
                font-size: 12px;
            }
            QSpinBox, QDoubleSpinBox {
                background-color: #111319;
                color: #F1F5F9;
                border: 1px solid #333C52;
                border-radius: 4px;
                padding: 2px 6px;
            }
            """
        )
        tb_layout = QHBoxLayout(toolbar)
        tb_layout.setContentsMargins(10, 6, 10, 6)
        tb_layout.setSpacing(8)

        self.btn_split = QPushButton("✂ Cắt đôi (Split - B)")
        self.btn_delete = QPushButton("🗑 Xóa (Delete)")
        self.btn_select_all_v1 = QPushButton("☑ Chọn toàn bộ V1")

        # Cụm điều khiển Đảo ngẫu nhiên trong khoảng X -> Y
        lbl_range = QLabel("Khoảng clip X→Y:")
        self.spin_from_idx = QSpinBox()
        self.spin_from_idx.setRange(1, 999)
        self.spin_from_idx.setValue(1)
        self.spin_from_idx.setPrefix("#")

        self.spin_to_idx = QSpinBox()
        self.spin_to_idx.setRange(1, 999)
        self.spin_to_idx.setValue(5)
        self.spin_to_idx.setPrefix("#")

        self.btn_shuffle = QPushButton("🔀 Đảo ngẫu nhiên các clip trong khoảng chọn")
        self.btn_shuffle.setObjectName("primaryAction")

        # Cụm Cắt ngắn hàng loạt (Batch Trim)
        lbl_trim = QLabel("Giới hạn mỗi clip:")
        self.spin_batch_trim = QDoubleSpinBox()
        self.spin_batch_trim.setRange(0.5, 60.0)
        self.spin_batch_trim.setSingleStep(0.5)
        self.spin_batch_trim.setValue(3.0)
        self.spin_batch_trim.setSuffix(" s")
        self.btn_batch_trim = QPushButton("⚡ Cắt ngắn hàng loạt")

        # Cụm Zoom Timeline bên phải
        lbl_zoom = QLabel("Zoom:")
        self.slider_zoom = QSlider(Qt.Orientation.Horizontal)
        self.slider_zoom.setRange(12, 140)
        self.slider_zoom.setValue(45)
        self.slider_zoom.setFixedWidth(120)

        tb_layout.addWidget(self.btn_split)
        tb_layout.addWidget(self.btn_delete)
        tb_layout.addWidget(self.btn_select_all_v1)
        tb_layout.addSpacing(10)
        tb_layout.addWidget(lbl_range)
        tb_layout.addWidget(self.spin_from_idx)
        tb_layout.addWidget(self.spin_to_idx)
        tb_layout.addWidget(self.btn_shuffle)
        tb_layout.addSpacing(10)
        tb_layout.addWidget(lbl_trim)
        tb_layout.addWidget(self.spin_batch_trim)
        tb_layout.addWidget(self.btn_batch_trim)
        tb_layout.addStretch()
        tb_layout.addWidget(lbl_zoom)
        tb_layout.addWidget(self.slider_zoom)

        # --- KHUNG ĐỒ HỌA TIMELINE (QGRAPHICSVIEW) ---
        self.scene = TimelineGraphicsScene(self)
        self.view = TimelineGraphicsView(self.scene, self)

        layout.addWidget(toolbar)
        layout.addWidget(self.view, stretch=1)

    def _connect_signals(self) -> None:
        self.btn_split.clicked.connect(self.split_clip_at_playhead)
        self.btn_delete.clicked.connect(self.delete_selected_clips)
        self.btn_select_all_v1.clicked.connect(self.select_all_video_clips)
        self.btn_shuffle.clicked.connect(self.shuffle_selected_or_range_clips)
        self.btn_batch_trim.clicked.connect(self.batch_trim_selected_clips)
        self.slider_zoom.valueChanged.connect(self.set_zoom_pps)

        self.view.splitShortcutPressed.connect(self.split_clip_at_playhead)
        self.view.deleteShortcutPressed.connect(self.delete_selected_clips)

        self.scene.playheadTimeChanged.connect(self.playheadChanged.emit)
        self.scene.clipSelectionChanged.connect(self._on_scene_selection_changed)
        self.scene.clipsModified.connect(self._emit_all_clips)

    # ========================================================================
    # CÁC NGHIỆP VỤ TIMELINE CỐT LÕI
    # ========================================================================

    def load_demo_project(self) -> None:
        """Nạp sẵn các Clip mẫu trên 3 Track để kiểm thử ngay lập tức."""
        self.clear_all_clips()
        demo_clips = [
            ClipData("c1", "01_CyberCity_Establishing.mp4", "C:/Media/01_CyberCity_Establishing.mp4", 0, 0.0, 4.0, 0.0, 1.0, 100, False, 1.0, "", "#0F766E"),
            ClipData("c2", "02_Drone_Highway_Chase.mp4", "C:/Media/02_Drone_Highway_Chase.mp4", 0, 4.0, 5.2, 1.5, 1.0, 100, False, 1.0, "", "#0D9488"),
            ClipData("c3", "03_Neon_Samurai_CloseUp.mp4", "C:/Media/03_Neon_Samurai_CloseUp.mp4", 0, 9.2, 3.8, 0.0, 1.0, 100, False, 1.0, "", "#0F766E"),
            ClipData("c4", "04_Rain_Alley_Fight.mp4", "C:/Media/04_Rain_Alley_Fight.mp4", 0, 13.0, 4.5, 2.0, 1.0, 100, False, 1.0, "", "#0D9488"),
            ClipData("c5", "05_Final_Rooftop_Reveal.mp4", "C:/Media/05_Final_Rooftop_Reveal.mp4", 0, 17.5, 5.0, 0.0, 1.0, 100, False, 1.0, "", "#0F766E"),
            # Audio Track (Track 1)
            ClipData("a1", "BGM_DarkSynth_Pulse_128BPM.wav", "C:/Audio/BGM_DarkSynth_Pulse_128BPM.wav", 1, 0.0, 22.5, 0.0, 1.0, 85, False, 1.0, "", "#1D4ED8"),
            # Subtitle Track (Track 2)
            ClipData("s1", "SRT #01", "", 2, 0.4, 3.4, 0.0, 1.0, 100, False, 1.0, "Trong thế giới hậu kỳ số hóa năm 2089...", "#C2410C"),
            ClipData("s2", "SRT #02", "", 2, 4.2, 4.8, 0.0, 1.0, 100, False, 1.0, "Mỗi khung hình đều được tái cấu trúc bằng AI.", "#C2410C"),
            ClipData("s3", "SRT #03", "", 2, 9.4, 3.4, 0.0, 1.0, 100, False, 1.0, "Không một thuật toán bản quyền nào nhận diện được.", "#C2410C"),
        ]
        for clip in demo_clips:
            self.add_clip(clip, emit_update=False)
        self.spin_to_idx.setValue(5)
        self._emit_all_clips()

    def clear_all_clips(self) -> None:
        for item in list(self.clip_items):
            self.scene.removeItem(item)
        self.clip_items.clear()

    def add_clip(self, clip_data: ClipData, emit_update: bool = True) -> TimelineClipItem:
        item = TimelineClipItem(clip_data, self.scene.pps, self.scene)
        self.scene.addItem(item)
        self.clip_items.append(item)
        self.total_duration_recalc()
        if emit_update:
            self._emit_all_clips()
        return item

    def append_media_to_track(self, name: str, file_path: str, duration: float, track_index: int = 0) -> None:
        """Thêm một file Media mới vào cuối Track được chỉ định."""
        track_clips = [it.clip_data for it in self.clip_items if it.clip_data.track_index == track_index]
        next_start = max((c.end_time for c in track_clips), default=0.0)
        palette = {0: "#0D9488", 1: "#1D4ED8", 2: "#C2410C"}
        new_clip = ClipData(
            clip_id=uuid.uuid4().hex[:8],
            name=name,
            file_path=file_path,
            track_index=track_index,
            start_time=round(next_start, 3),
            duration=round(duration, 3),
            color_hex=palette.get(track_index, "#0D9488"),
        )
        self.add_clip(new_clip)

    def total_duration_recalc(self) -> None:
        max_end = max((it.clip_data.end_time for it in self.clip_items), default=60.0)
        self.scene.total_duration = max(60.0, max_end + 15.0)
        self.scene.update_scene_rect()

    def set_zoom_pps(self, new_pps: float) -> None:
        """Cập nhật mức phóng to / thu nhỏ (Pixels Per Second) cho toàn bộ Timeline."""
        self.scene.pps = float(new_pps)
        if self.slider_zoom.value() != int(new_pps):
            self.slider_zoom.blockSignals(True)
            self.slider_zoom.setValue(int(new_pps))
            self.slider_zoom.blockSignals(False)

        for item in self.clip_items:
            item.pps = self.scene.pps
            item.sync_geometry_from_data()

        self.scene.playhead.pps = self.scene.pps
        self.scene.playhead.sync_pos()
        self.scene.update_scene_rect()
        self.scene.update()

    def split_clip_at_playhead(self) -> None:
        """
        Cắt đôi (Split - Phím B) các clip đang chọn (hoặc clip ở Track V1) tại đúng vị trí Playhead.
        """
        t = self.scene.playhead.current_time
        selected_items = [it for it in self.clip_items if it.isSelected()]
        candidates = selected_items if selected_items else self.clip_items

        targets = [
            it for it in candidates
            if (it.clip_data.start_time + 0.08) < t < (it.clip_data.end_time - 0.08)
        ]
        if not targets:
            return

        for item in targets:
            orig = item.clip_data
            left_dur = round(t - orig.start_time, 3)
            right_dur = round(orig.end_time - t, 3)

            # Cập nhật nửa bên trái
            orig.duration = left_dur
            item.sync_geometry_from_data()

            # Tạo nửa bên phải
            right_clip = orig.clone_with(
                name=f"{orig.name} (Part 2)",
                start_time=round(t, 3),
                duration=right_dur,
                source_in=round(orig.source_in + left_dur * orig.speed, 3),
            )
            self.add_clip(right_clip, emit_update=False)

        self._emit_all_clips()

    def delete_selected_clips(self) -> None:
        """Xóa các clip đang chọn và tự động dồn khít (Ripple) trên Video Track."""
        selected = [it for it in self.clip_items if it.isSelected()]
        if not selected:
            return
        for item in selected:
            self.scene.removeItem(item)
            self.clip_items.remove(item)

        self._ripple_pack_track(0)
        self.selectedClipChanged.emit(None)
        self._emit_all_clips()

    def select_all_video_clips(self) -> None:
        for item in self.clip_items:
            item.setSelected(item.clip_data.track_index == 0)
        self._on_scene_selection_changed()

    def shuffle_selected_or_range_clips(self) -> None:
        """
        Đảo lộn xộn ngẫu nhiên (Random Shuffle) các clip đang bôi đen trên Video Track,
        hoặc nếu không bôi đen thì lấy theo khoảng chỉ số từ X đến Y trên thanh công cụ.
        Tự động xếp khít lại vị trí start_time trên Timeline sau khi đảo.
        """
        v1_items = sorted(
            [it for it in self.clip_items if it.clip_data.track_index == 0],
            key=lambda it: it.clip_data.start_time,
        )
        if len(v1_items) < 2:
            return

        selected_v1 = [it for it in v1_items if it.isSelected()]
        if len(selected_v1) >= 2:
            target_items = selected_v1
        else:
            start_idx = max(0, self.spin_from_idx.value() - 1)
            end_idx = min(len(v1_items), self.spin_to_idx.value())
            target_items = v1_items[start_idx:end_idx]

        if len(target_items) < 2:
            return

        # Lưu mốc thời gian bắt đầu của nhóm được đảo
        anchor_start = target_items[0].clip_data.start_time

        # Đảo thứ tự ngẫu nhiên (đảm bảo khác thứ tự cũ nếu có >= 2 phần tử)
        original_ids = [it.clip_data.clip_id for it in target_items]
        shuffled_items = list(target_items)
        for _ in range(6):
            random.shuffle(shuffled_items)
            if [it.clip_data.clip_id for it in shuffled_items] != original_ids:
                break

        # Gán lại thứ tự vào danh sách tổng của Track V1 và cộng dồn thời gian khít nhau
        target_set = set(target_items)
        reordered_v1: List[TimelineClipItem] = []
        shuffled_iter = iter(shuffled_items)
        for it in v1_items:
            if it in target_set:
                reordered_v1.append(next(shuffled_iter))
            else:
                reordered_v1.append(it)

        cursor = 0.0 if v1_items[0] in target_set else v1_items[0].clip_data.start_time
        for it in reordered_v1:
            it.clip_data.start_time = round(cursor, 3)
            cursor += it.clip_data.duration
            it.sync_geometry_from_data()

        self.scene.update()
        self._emit_all_clips()

    def batch_trim_selected_clips(self) -> None:
        """Cắt ngắn hàng loạt các clip trên Video Track theo thời lượng tối đa chỉ định."""
        max_dur = float(self.spin_batch_trim.value())
        v1_items = sorted(
            [it for it in self.clip_items if it.clip_data.track_index == 0],
            key=lambda it: it.clip_data.start_time,
        )
        selected_v1 = [it for it in v1_items if it.isSelected()]
        targets = selected_v1 if selected_v1 else v1_items

        for it in targets:
            if it.clip_data.duration > max_dur:
                it.clip_data.duration = round(max_dur, 3)

        self._ripple_pack_track(0)
        self._emit_all_clips()

    def _ripple_pack_track(self, track_index: int) -> None:
        """Dồn khít toàn bộ các clip trên Track về sát nhau tính từ 0.0s."""
        items = sorted(
            [it for it in self.clip_items if it.clip_data.track_index == track_index],
            key=lambda it: it.clip_data.start_time,
        )
        cursor = 0.0
        for it in items:
            it.clip_data.start_time = round(cursor, 3)
            cursor += it.clip_data.duration
            it.sync_geometry_from_data()
        self.total_duration_recalc()
        self.scene.update()

    def _on_scene_selection_changed(self) -> None:
        selected = [it.clip_data for it in self.clip_items if it.isSelected()]
        self.selectedClipChanged.emit(selected[0] if selected else None)

    def _emit_all_clips(self) -> None:
        all_data = [it.clip_data for it in self.clip_items]
        self.timelineClipsUpdated.emit(all_data)

    def get_all_clips(self) -> List[ClipData]:
        return [it.clip_data for it in self.clip_items]

    def refresh_selected_clip_ui(self) -> None:
        """Gọi từ Inspector sau khi thay đổi thông số (Speed, Volume, Flip) của Clip."""
        self._ripple_pack_track(0)
        for it in self.clip_items:
            it.sync_geometry_from_data()
        self.scene.update()
        self._emit_all_clips()
