import { useState } from 'react'
import type { Spectrum } from './utils/types'
import { FileImporter } from './components/FileImporter'
import { SpectraLibrary } from './components/SpectraLibrary'
import { SpectraPlot } from './components/SpectraPlot'
import { Header } from './components/Header'
import { ErrorBoundary } from './components/ErrorBoundary'
import { parseFile } from './utils/parsers'
import type { ParsedFileData } from './utils/parsers'
import { ImportMappingDialog } from './components/ImportMappingDialog'

function App() {
  const [spectra, setSpectra] = useState<Spectrum[]>([])
  const [pendingFiles, setPendingFiles] = useState<ParsedFileData[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<'overlap' | 'stacked'>('overlap')
  const [viewType, setViewType] = useState<'2d' | '3d'>('2d')

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

  const confirmImport = (newSpectra: Spectrum[]) => {
    setSpectra((prev) => [...prev, ...newSpectra])
    setPendingFiles((prev) => prev.slice(1)) // Process one file at a time or clear all?
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

  const handleToggleVisibility = (id: string) => {
    setSpectra((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    )
  }

  const handleDelete = (id: string) => {
    setSpectra((prev) => prev.filter((s) => s.id !== id))
  }

  const handleUpdate = (id: string, updates: Partial<Spectrum>) => {
    setSpectra((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
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
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
          <FileImporter onImport={handleImportedFiles} />
          <SpectraLibrary
            spectra={spectra}
            onToggle={handleToggleVisibility}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>

        {/* Main Plot Area */}
        <div className="flex-1 bg-slate-50 relative p-4 flex flex-col min-w-0">
          <ErrorBoundary>
            <SpectraPlot spectra={spectra} viewMode={viewMode} viewType={viewType} />
          </ErrorBoundary>
        </div>
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
