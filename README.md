# TDO CUT — Phần mềm dựng phim đa phương tiện & PyQt6 Engine

Ứng dụng dựng phim đa tầng chuẩn bố cục 4 vùng (Home Launcher, 9 Tab Tài nguyên, Keyframes, Speed Curve, HSL, Multi-Track Timeline) kết hợp kiến trúc Hybrid C++ / PyQt6 / FFmpeg CLI.

## Tính năng chính

- **Multi-Track Timeline**: Hỗ trợ cắt ghép đa lớp (Video, Audio, Text, Sticker, Hiệu ứng), kéo thả mượt mà, tự động bắt dính (Auto-Snapping) và Ripple Edit.
- **Bộ công cụ chỉnh sửa chuyên sâu**: Keyframe Animation, Speed Curve, bảng màu HSL, Lật hình, Cắt khung (Crop) và tách nền thông minh.
- **Xuất Video & Đồng bộ Dự án**: Hỗ trợ xuất video trực tiếp qua FFmpeg backend (`server.ts`) và xuất cấu trúc thư mục dự án tương thích CapCut PC (`draft_content.json` & `draft_meta_info.json`).
- **Mã nguồn PyQt6 & C++ Core**: Tích hợp trình xem mã nguồn kiến trúc Desktop (`python_src/`).

## Cài đặt và Chạy dự án

**Yêu cầu hệ thống:** Node.js (v18+) và FFmpeg (nếu sử dụng tính năng render video từ server).

1. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```

2. Chạy môi trường phát triển (Development):
   ```bash
   npm run dev
   ```

3. Đóng gói bản dựng (Production Build):
   ```bash
   npm run build
   ```
