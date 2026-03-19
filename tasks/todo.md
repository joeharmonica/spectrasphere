# SpectraSphere Task List & Plan

## Setup
- [x] Initialize project (Vite/React/TypeScript)
- [x] Install plotting and parsing dependencies (plotly.js, papaparse, tailwind)

## Core Features (Phase 1 MVP)
- [x] **UI Layout**: Basic application skeleton with Sidebar (Library) and Main Area (Plot).
- [x] **Library**: Simple list view of imported spectra.
- [x] **File Import**: Basic file menu import (`<input type="file">`).
- [x] **Parsing**: 
  - [x] Simple XY parser.
  - [x] Multi-XY parser.
- [x] **Visualization**: Core Overlap View with interactive zooming/panning via Plotly.
- [x] **Export**: Basic export of selected spectra to standardized CSV.

## Phase 2: Enhanced Mapping & 3D Visualization
- [/] **Mapping Dialog**: Pop-up dialog to cross-check and edit column mapping before final import.
- [ ] **3D Plot Capability**: Implement or ensure support for 3D spectral visualization (e.g., Wavelength vs. Intensity vs. Time/Sample).
- [ ] **Refine UI Aesthetics**: Polish look and feel according to premium design standards.

## Review & Desktop App Preparation
- [ ] Verify core features work as expected against PRD Phase 1.
- [ ] Check code against PRINCIPLES.md (elegant, simple).
- [ ] (Optional) Wrap into Electron/Tauri for desktop deployment.

## Review Notes
(To be filled after implementation)
