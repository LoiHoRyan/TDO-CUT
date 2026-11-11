<img width="1254" height="1254" alt="logo" src="https://github.com/user-attachments/assets/5aed6702-6218-402e-8bd9-b22f4cc6c730" />

# TDO CUT — Multimedia Video Editing Software

A multi-layered video editing application featuring a 4-zone layout (Home Launcher, 9 Resource Tabs, Keyframes, Speed ​​Curves, HSL, and a Multi-Track Timeline), built on a hybrid architecture combining C++, PyQt6, and FFmpeg CLI.

## Key Features

- **Multi-Track Timeline**: Supports multi-layer editing (Video, Audio, Text, Stickers, Effects) with intuitive drag-and-drop, auto-snapping, and ripple editing.
- **Advanced Editing Toolkit**: Includes keyframe animation, speed curves, HSL color grading, image flipping, cropping, and background removal.
- **Video Export & Project Synchronization**: Supports direct video rendering via an FFmpeg backend (`server.ts`) and exports project directory structures compatible with CapCut PC (`draft_content.json` & `draft_meta_info.json`).
- **PyQt6 & C++ Core**: Features a desktop-based architecture (source code available in `python_src/`).

## Installation and Project Setup

**System Requirements:** Node.js (v18+) and FFmpeg (required for server-side video rendering).

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development environment:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
