# SpectraSphere Professional

> **High-Fidelity Spectral Data Exploration & Analytical Benchmarking**

SpectraSphere Professional is a state-of-the-art web application designed for spectroscopic research. It provides researchers with powerful tools for multi-dimensional spectral visualization, advanced chemometric modeling, and automated research reporting.

## 🌟 Key Features

### 1. Advanced Spectral Visualization
- **Stacked & Overlap Modes**: Toggle between comparative overlapping and clean vertical stacking with adjustable offsets.
- **Dynamic Peak Analysis**: Automated peak detection with on-plot labels and persistent chemical marker bookmarking.
- **Interactive 2D/3D Plotting**: High-performance rendering of complex datasets with zero latency.
- **Micro-interactions**: Hover-sync between spectra library and plot indicators.

### 2. Scientific Chemometrics
- **Multivariate Modeling**: Full-scale implementation of **Partial Least Squares (PLS)** and **Principal Component Regression (PCR)**.
- **Validation Suite**: Integrated **k-Fold Cross-Validation** (None, 3, 5, 10) with **RMSECV** calculation to ensure model robustness.
- **Feature Selection**: Define precise wavelength windows to filter noise and target specific molecular absorption bands.
- **Pre-processing**: Built-in SNV (Standard Normal Variate) and Savitzky-Golay (1st Derivative) smoothing.

### 3. Local-First Architecture
- **Persistent Data**: Powered by **IndexedDB (Dexie.js)**. Your spectra, calibration targets, and analysis results stay in your browser—no cloud required.
- **Metadata Management**: Detailed instrument metadata and sample tracking (Model, Lot, Operator).

### 4. Professional Reporting
- **Benchmarking Scoreboard**: Instantly compare multiple analytical models by R² and RMSEC/CV scores.
- **Portable Exports**: Download standalone, visually rich **HTML Research Reports** containing AI-driven performance summaries and parity data.

## 🚀 Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Charting**: Plotly.js (Optimized for Large Data)
- **Database**: Dexie.js (IndexedDB)
- **Math/ML**: `ml-pls`, `ml-pca`, `ml-regression`, `ml-matrix`
- **Styling**: TailwindCSS & Custom Glassmorphic CSS
- **Icons**: Lucide React

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📜 Principles
Adheres to the `PRINCIPLES.MD` core directives:
- **Elegance**: Premium visual aesthetics and motion design.
- **Simplicity**: Complex scientific tools hidden behind intuitive UI.
- **Efficiency**: Zero-lag manipulation of thousands of data points.

---
Developed with ❤️ for the Spectroscopic Community.
