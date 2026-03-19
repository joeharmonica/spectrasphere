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

## Phase 3: Calibration & Multivariate Analysis (MVP)
- [x] **Calibration Context**: Add a way to assign target values (e.g., concentration) to spectra in the library.
- [x] **Analysis Sidebar/Tab**: Create a dedicated area for model configuration and execution.
- [x] **Univariate Analysis**: Implement peak-based calibration (Height/Area vs. Target).
- [x] **Multivariate Analysis**: 
  - [x] Preprocessing (SNV, Savitzky-Golay Derivatives).
  - [x] Models: PLS, PCR (Principal Component Regression).
- [x] **Unified Reporting**:
  - [x] Summary statement explaining the results in plain English.
  - [x] Comparison table of all selected models (R², RMSE).
- [x] **User Options**: Add "Run All Models" option for automatic benchmarking.

## Phase 4: Foundational Resilience (Learnings from SpectraView)
- [x] **Data Persistence**: Implement **Dexie (IndexedDB)** to save spectra, labels, and settings across sessions.
- [x] **Pro Workspace**: Add **resizable split-pane handles** between sidebars and the chart area.
- [x] **Instrument Metadata**: Expand parsers to store and display instrument headers (Ex-Wl, Slit width, etc.).

## Phase 5: Advanced Scientific Features
- [x] **Visualization Variety**: Implement **Stacked View** (with vertical offset slider), **Peak Labels**, and **Peak Bookmarking**.
- [x] **Advanced Modelling**: Add **Cross-Validation (k-fold)** and **Range-based Feature Selection** to analysis tools.
- [x] **Portable Reports**: Create a "Download HTML Report" feature for standalone research documentation.

## Review & Desktop App Preparation
- [ ] Verify core features work as expected against PRD Phase 1.
- [ ] Check code against PRINCIPLES.md (elegant, simple).
- [ ] (Optional) Wrap into Electron/Tauri for desktop deployment.

## Review Notes
- [2026-03-19] Implemented Multivariate Analysis core (PLS, PCR, SNV, SG-Deriv) and the Benchmark Scoreboard.
- [2026-03-19] Added comparative summary generation for AI reports.
- [2026-03-19] Performed competitive analysis of SpectraView and drafted a 3-phase upgrade plan.
