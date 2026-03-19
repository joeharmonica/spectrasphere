# 📈 Competitive Analysis: SpectraSphere vs. SpectraView

This document provides a detailed comparison between **SpectraSphere** and **SpectraView**, identifying feature gaps, architectural differences, and opportunities for cross-pollination to enhance the spectral analysis experience.

## 🏁 Executive Summary

While **SpectraSphere** excels in AI-driven interaction and a modern, high-gloss aesthetic, **SpectraView** offers a more mature suite of specialized spectral features (Dexie persistence, resizable panels, and advanced calibration strategies). Integrating SpectraView’s data handling and visualization variety will bridge the gap to a professional-grade research platform.

---

## 🔍 Feature Comparison Matrix

| Feature Category | SpectraSphere (Current) | SpectraView (Strengths) | Learning/Opportunity |
| :--- | :--- | :--- | :--- |
| **Data Import** | Manual column mapping for CSV. | **Auto-detect** for Cary/Shimadzu. | Implement instrument-specific header parsers. |
| **Persistence** | State is lost on refresh. | **Dexie/IndexedDB** auto-save. | **Critical:** Add IndexedDB for spectra & settings. |
| **Workspace UI** | Fixed-width sidebars. | **Resizable Side Panels** (Split-pane). | Add drag-handles for library/analysis width. |
| **View Modes** | 2D Overlap, 3D Plot. | **Stacked View** (Offset) + **EEM Heatmap**. | Implement Stacked view with offset slider. |
| **Model Types** | Univariate, PLS, PCR. | PLS, PCR, **Ridge, Lasso, MLR**. | Add Regularized regression (Ridge/Lasso). |
| **Modelling Strategy** | Full spectrum / Single point. | **Concatenated Ranges**, **Peak Heights**. | Allow selecting specific windows for modelling. |
| **Peak Analysis** | Basic detection list. | **Chart Markers** & Filter by Prominence. | Add "Bookmark" icons to pin peaks on the chart. |
| **Exporting** | Image Export. | **HTML Reports**, Processed CSV. | Generate standalone HTML analysis summaries. |

---

## 🏗️ Architectural Deep-Dive

### 1. The Persistence Pipeline
**SpectraView** uses a robust `useReducer` + `Dexie` synchronization. Every action (loading data, renaming, changing a color) is mirrored in IndexedDB. 
- **Learning for SpectraSphere:** We should migrate from pure `useState` to a persistent store. This transforms the app from a "session tool" to a "data library."

### 2. Non-Destructive Processing
Both apps use a non-destructive approach, but SpectraView applies a strictly ordered pipeline: 
`Crop → Smooth → Baseline → Normalise`
- **Learning for SpectraSphere:** Standardizing this order prevents artifacts (e.g., smoothing after normalization can distort the unit area).

### 3. Responsive Desktop Layout
SpectraView implements a professional "IDE-style" layout where users can expand the chart area by collapsing or resizing sidebars.
- **Learning for SpectraSphere:** Implement [startPanelDrag](file:///Users/joepong/SpectraView/src/App.tsx#24-44) logic to allow custom sidebar width on large displays.

---

## 🚀 Implementation Roadmap for SpectraSphere

### Phase 1: Foundation (The "Pro" Workspace)
- [ ] **IndexedDB Integration**: Save all imported files and analysis configurations locally.
- [ ] **Resizable Split-Pane**: Add a vertical resize handle to the Library and Analysis sidebars.
- [ ] **Metadata Viewer**: Expandable panel to show instrument-specific headers (Slit width, Excitation wavelength).

### Phase 2: Advanced Visuals
- [ ] **Stacked View**: Offset spectra vertically to compare shapes without overlapping.
- [ ] **Peak Markers**: Click a peak in the list to draw a labelled vertical line on the active plot.

### Phase 3: Scientific Modelling
- [ ] **Cross-Validation**: Implement k-fold CV to provide a more honest assessment of model error (RMSE_CV).
- [ ] **Range-based Features**: Allow users to click-and-drag on the chart to "Add Range" to the calibration input vector.
- [ ] **HTML Report Export**: Package metrics, parity plots, and AI summaries into a portable [.html](file:///Users/joepong/SpectraView/index.html) file.

---

## 🎨 Aesthetic & User Experience
**SpectraSphere** clearly wins on modern "visual wow" (Glassmorphism, vibrance). **SpectraView** is more utilitarian. 
**The Goal:** Keep the stunning glassmorphism of SpectraSphere but inject the high-utility features of SpectraView.

> [!TIP]
> **Priority #1:** Data Persistence. Users expect their work to be there when they return. Adding Dexie is the most significant "Power User" upgrade we can perform.
