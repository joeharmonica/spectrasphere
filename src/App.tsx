import { useState, useCallback, useEffect } from 'react'
import type { Spectrum } from './utils/types'
import { FileImporter } from './components/FileImporter'
import { SpectraLibrary } from './components/SpectraLibrary'
import { SpectraPlot } from './components/SpectraPlot'
import { Header } from './components/Header'
import { ErrorBoundary } from './components/ErrorBoundary'
import { parseFile } from './utils/parsers'
import type { ParsedFileData } from './utils/parsers'
import { ImportMappingDialog } from './components/ImportMappingDialog'
import { AnalysisSidebar } from './components/AnalysisSidebar'
import type { AnalysisResult } from './utils/analysis'
import { Trophy, FileText, BarChart3, TrendingUp, ScatterChart, GripVertical, Download } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './utils/db'
import { generateFullHTMLReport, downloadReport } from './utils/reportExport'

function App() {
  const spectra = useLiveQuery(() => db.spectra.toArray(), []) || []
  const [pendingFiles, setPendingFiles] = useState<ParsedFileData[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<'overlap' | 'stacked'>('overlap')
  const [viewType, setViewType] = useState<'2d' | '3d'>('2d')
  const [activeTab, setActiveTab] = useState<'plot' | 'report'>('plot')
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [offset, setOffset] = useState(25)
  const [showPeakLabels, setShowPeakLabels] = useState(false)

  const bookmarks = useLiveQuery(() => db.bookmarks.toArray()) || []

  // Resizable state
  const [leftWidth, setLeftWidth] = useState(320)
  const [rightWidth, setRightWidth] = useState(360)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)

  // Load preferences
  useEffect(() => {
    const loadPrefs = async () => {
      const left = await db.settings.get('sidebar_left_width')
      const right = await db.settings.get('sidebar_right_width')
      if (left) setLeftWidth(left.value)
      if (right) setRightWidth(right.value)
    }
    loadPrefs()
  }, [])

  const handleImportedFiles = async (files: FileList | File[]) => {
    const parsedFiles: ParsedFileData[] = []
    for (let i = 0; i < files.length; i++) {
      const result = await parseFile(files[i])
      if (result) parsedFiles.push(result)
    }
    if (parsedFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...parsedFiles])
    }
  }

  const confirmImport = async (newSpectra: Spectrum[]) => {
    await db.spectra.bulkAdd(newSpectra)
    setPendingFiles((prev) => prev.slice(1))
  }

  const cancelImport = () => {
    setPendingFiles((prev) => prev.slice(1))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await handleImportedFiles(files)
    }
  }

  const handleToggleVisibility = async (id: string) => {
    const s = await db.spectra.get(id);
    if (s) {
      db.spectra.update(id, { visible: !s.visible });
    }
  }

  const handleDelete = (id: string) => {
    db.spectra.delete(id)
  }

  const handleUpdate = (id: string, updates: Partial<Spectrum>) => {
    db.spectra.update(id, updates)
  }

  const startResizingLeft = (e: React.MouseEvent) => {
    setIsResizingLeft(true)
    e.preventDefault()
  }

  const startResizingRight = (e: React.MouseEvent) => {
    setIsResizingRight(true)
    e.preventDefault()
  }

  const stopResizing = useCallback(async () => {
    if (isResizingLeft) {
      await db.settings.put({ key: 'sidebar_left_width', value: leftWidth })
    }
    if (isResizingRight) {
      await db.settings.put({ key: 'sidebar_right_width', value: rightWidth })
    }
    setIsResizingLeft(false)
    setIsResizingRight(false)
  }, [isResizingLeft, isResizingRight, leftWidth, rightWidth])

  const resize = useCallback((e: MouseEvent) => {
    if (isResizingLeft) {
      const newWidth = Math.max(200, Math.min(600, e.clientX))
      setLeftWidth(newWidth)
    }
    if (isResizingRight) {
      const newWidth = Math.max(260, Math.min(600, window.innerWidth - e.clientX))
      setRightWidth(newWidth)
    }
  }, [isResizingLeft, isResizingRight])

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
    }
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizingLeft, isResizingRight, resize, stopResizing])
  const handleAddBookmark = async (wavelength: number) => {
    const roundedWavelength = Math.round(wavelength * 10) / 10
    const exists = await db.bookmarks.where('wavelength').equals(roundedWavelength).first()
    if (!exists) {
      await db.bookmarks.add({ wavelength: roundedWavelength })
    }
  }

  const handleDeleteBookmark = async (id: number) => {
    await db.bookmarks.delete(id)
  }

  return (
    <div
      className="flex flex-col w-full h-screen bg-slate-50 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-indigo-600/10 backdrop-blur-[2px] border-4 border-dashed border-indigo-500 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xl font-bold text-slate-800">Drop files to import</p>
            <p className="text-slate-500">Simple XY or Multi-XY CSV files</p>
          </div>
        </div>
      )}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        viewType={viewType}
        onViewTypeChange={setViewType}
        offset={offset}
        onOffsetChange={setOffset}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0 relative"
          style={{ width: leftWidth }}
        >
          <FileImporter onImport={handleImportedFiles} />
          <SpectraLibrary
            spectra={spectra}
            onToggle={handleToggleVisibility}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            bookmarks={bookmarks}
            onDeleteBookmark={handleDeleteBookmark}
          />
        </div>

        {/* Resizer Left */}
        <div
          className={`w-1 bg-slate-100 hover:bg-indigo-200 transition-colors flex items-center justify-center relative group cursor-col-resize z-20 ${isResizingLeft ? 'bg-indigo-500' : ''}`}
          onMouseDown={startResizingLeft}
        >
          <div className={`absolute left-1/2 -translate-x-1/2 p-0.5 rounded bg-white border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${isResizingLeft ? 'opacity-100 bg-indigo-50' : ''}`}>
            <GripVertical size={12} className="text-slate-400" />
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 bg-slate-50 relative flex flex-col min-w-0">
          <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('plot')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'plot' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <TrendingUp size={14} className={activeTab === 'plot' ? 'text-indigo-600' : 'text-slate-400'} />
                Visualization
              </button>
              <button
                onClick={() => setActiveTab('report')}
                disabled={analysisResults.length === 0}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'report' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'}`}
              >
                <BarChart3 size={14} className={activeTab === 'report' ? 'text-indigo-600' : 'text-slate-400'} />
                Analysis Report
                {analysisResults.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1" />}
              </button>
            </div>

            {activeTab === 'report' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:bg-slate-50 transition-colors"
                >
                  <FileText size={12} className="text-slate-400" />
                  Print
                </button>
                <button
                  onClick={() => {
                    const html = generateFullHTMLReport(analysisResults);
                    downloadReport(html);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                  <Download size={12} />
                  Download Report
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'plot' ? (
              <ErrorBoundary>
                <SpectraPlot
                  spectra={spectra}
                  viewMode={viewMode}
                  viewType={viewType}
                  offset={offset}
                  bookmarks={bookmarks}
                  onAddBookmark={handleAddBookmark}
                  showPeakLabels={showPeakLabels}
                  onTogglePeakLabels={() => setShowPeakLabels(!showPeakLabels)}
                />
              </ErrorBoundary>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Report Header */}
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Calibration Benchmarking Report</h1>
                    <p className="text-sm text-slate-500 mt-1">Comparing {analysisResults.length} analytical models for spectral prediction</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Trophy size={24} />
                  </div>
                </div>

                {/* Scoreboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResults.slice(0, 3).map((res, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${i === 0 ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100' : 'bg-white text-slate-900 border-slate-200 shadow-sm'}`}>
                      <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-widest opacity-80">
                        <span>Rank {i + 1}</span>
                        {i === 0 && <span>Best Model</span>}
                      </div>
                      <p className={`text-sm font-black truncate ${i === 0 ? 'text-white' : 'text-slate-900'}`}>{res.modelName}</p>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-tighter opacity-70 mb-1`}>coefficient (R²)</p>
                          <p className={`text-2xl font-black tabular-nums scale-[0.9] origin-left`}>{res.r2.toFixed(4)}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-tighter opacity-70`}>Error (C)</p>
                            <p className={`text-sm font-black tabular-nums`}>{res.rmse.toFixed(3)}</p>
                          </div>
                          {res.rmsecv !== undefined && (
                            <div>
                              <p className={`text-[9px] font-bold uppercase tracking-tighter opacity-60 text-indigo-200`}>Error (CV)</p>
                              <p className={`text-[11px] font-bold tabular-nums`}>{res.rmsecv.toFixed(3)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Analysis & Charts */}
                {analysisResults.map((res, idx) => (
                  <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {idx + 1}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">{res.modelName}</h2>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {res.predictions.length} Samples Analyzed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-sm text-slate-700 leading-relaxed relative">
                          <div className="absolute -top-3 left-4 px-2 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            AI Summary
                          </div>
                          {res.summary}
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <ScatterChart size={14} className="text-indigo-500" />
                            Parity Data Points
                          </h3>
                          <div className="max-h-48 overflow-auto border border-slate-100 rounded-xl">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead className="bg-slate-50 text-slate-400 uppercase tracking-tight text-[10px]">
                                <tr>
                                  <th className="px-3 py-2 font-bold">Actual Value</th>
                                  <th className="px-3 py-2 font-bold">Predicted Value</th>
                                  <th className="px-3 py-2 font-bold">Deviation</th>
                                </tr>
                              </thead>
                              <tbody className="tabular-nums">
                                {res.predictions.map((p, i) => (
                                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-3 py-2 font-semibold text-slate-900">{p.actual.toFixed(2)}</td>
                                    <td className="px-3 py-2 font-semibold text-indigo-600">{p.predicted.toFixed(2)}</td>
                                    <td className="px-3 py-2 font-medium text-slate-400">{Math.abs(p.actual - p.predicted).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Small Parity Plot placeholder or if I can render a small one efficiently */}
                      <div className="aspect-square bg-slate-50 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 gap-2">
                        <BarChart3 size={32} opacity={0.3} />
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Parity Visualization</p>
                        <p className="text-[10px] text-center px-6 leading-tight">Visualizing calibration curve and residuals for {res.modelName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resizer Right */}
        <div
          className={`w-1 bg-slate-100 hover:bg-indigo-200 transition-colors flex items-center justify-center relative group cursor-col-resize z-20 ${isResizingRight ? 'bg-indigo-500' : ''}`}
          onMouseDown={startResizingRight}
        >
          <div className={`absolute left-1/2 -translate-x-1/2 p-0.5 rounded bg-white border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${isResizingRight ? 'opacity-100 bg-indigo-50' : ''}`}>
            <GripVertical size={12} className="text-slate-400" />
          </div>
        </div>

        {/* Right Sidebar - Analysis Settings */}
        <AnalysisSidebar
          spectra={spectra}
          onAnalysisComplete={(results: AnalysisResult[]) => {
            setAnalysisResults(results)
            setActiveTab('report')
          }}
          width={rightWidth}
        />
      </div>

      {pendingFiles.length > 0 && (
        <ImportMappingDialog
          fileData={pendingFiles[0]}
          onConfirm={confirmImport}
          onCancel={cancelImport}
        />
      )}
    </div>
  )
}

export default App
