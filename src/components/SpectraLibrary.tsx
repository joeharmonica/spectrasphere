import { Eye, EyeOff, Trash2, FileText, Download, Search, LayoutGrid, SortAsc, Tag, Info } from 'lucide-react'
import type { Spectrum } from '../utils/types'
import { exportToCSV } from '../utils/exporter'
import { useState, useMemo } from 'react'

import type { Bookmark } from '../utils/db'

interface Props {
    spectra: Spectrum[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<Spectrum>) => void;
    bookmarks: Bookmark[];
    onDeleteBookmark: (id: number) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'points-asc' | 'points-desc' | 'color'

export function SpectraLibrary({ spectra, onToggle, onDelete, onUpdate, bookmarks, onDeleteBookmark }: Props) {
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('name-asc')
    const [expandedMetadataId, setExpandedMetadataId] = useState<string | null>(null)

    const filteredAndSortedSpectra = useMemo(() => {
        let result = [...spectra].filter(s =>
            s.sampleName.toLowerCase().includes(search.toLowerCase()) ||
            s.filename.toLowerCase().includes(search.toLowerCase()) ||
            s.label?.toLowerCase().includes(search.toLowerCase())
        )

        result.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc': return a.sampleName.localeCompare(b.sampleName)
                case 'name-desc': return b.sampleName.localeCompare(a.sampleName)
                case 'points-asc': return a.data.length - b.data.length
                case 'points-desc': return b.data.length - a.data.length
                case 'color': return a.color.localeCompare(b.color)
                default: return 0
            }
        })

        return result
    }, [spectra, search, sortBy])

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <LayoutGrid size={14} className="text-indigo-500" />
                        Library ({spectra.length})
                    </h2>
                    <button
                        onClick={() => exportToCSV(spectra.filter(s => s.visible))}
                        disabled={spectra.length === 0}
                        className="text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <Download size={12} />
                        Export
                    </button>
                </div>

                <div className="relative group">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search spectra, labels..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-3 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <SortAsc size={12} className="text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="bg-transparent text-[10px] font-bold text-slate-500 uppercase tracking-wider outline-none cursor-pointer hover:text-indigo-600"
                        >
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                            <option value="points-desc">Most Points</option>
                            <option value="points-asc">Fewest Points</option>
                            <option value="color">Color</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {spectra.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
                        <FileText size={32} />
                        <p className="text-sm font-medium">No spectra imported</p>
                    </div>
                ) : filteredAndSortedSpectra.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
                        <Search size={24} />
                        <p className="text-xs font-medium">No matches found</p>
                    </div>
                ) : (
                    <ul className="space-y-2.5">
                        {filteredAndSortedSpectra.map(s => (
                            <li key={s.id} className="group flex flex-col p-3 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <button
                                        onClick={() => onToggle(s.id)}
                                        className={`p-1.5 rounded-lg transition-colors ${s.visible ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}
                                    >
                                        {s.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate" title={s.sampleName}>{s.sampleName}</p>
                                        <p className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-tight">{s.filename}</p>
                                    </div>

                                    <button
                                        onClick={() => setExpandedMetadataId(expandedMetadataId === s.id ? null : s.id)}
                                        className={`p-1.5 rounded-lg transition-colors ${s.metadata && Object.keys(s.metadata).length > 0 ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-50'}`}
                                        disabled={!s.metadata || Object.keys(s.metadata).length === 0}
                                        title={s.metadata && Object.keys(s.metadata).length > 0 ? 'View Instrument Metadata' : 'No Metadata Available'}
                                    >
                                        <Info size={16} />
                                    </button>

                                    <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] border-2 border-white box-content" style={{ backgroundColor: s.color }} />

                                    <button
                                        onClick={() => onDelete(s.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {expandedMetadataId === s.id && s.metadata && (
                                    <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-1 overflow-hidden">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                                            <Info size={10} className="text-indigo-400" />
                                            Instrument Metadata
                                        </p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-medium text-slate-600">
                                            {Object.entries(s.metadata).map(([key, val]) => (
                                                <div key={key} className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="text-slate-400 font-bold uppercase tracking-tight truncate shrink-0">{key}</span>
                                                    <span className="text-slate-900 truncate" title={String(val)}>{String(val)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 pl-10 mt-1">
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={s.isCalibration || false}
                                                onChange={(e) => onUpdate?.(s.id, { isCalibration: e.target.checked })}
                                                className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Calibration</span>
                                        </label>

                                        {s.isCalibration && (
                                            <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">Target</span>
                                                <input
                                                    type="number"
                                                    value={s.targetValue ?? ''}
                                                    onChange={(e) => onUpdate?.(s.id, { targetValue: parseFloat(e.target.value) })}
                                                    placeholder="Value"
                                                    className="w-12 text-[10px] font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-indigo-700 placeholder:text-indigo-300 tabular-nums"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative group/label">
                                            <Tag size={10} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input
                                                type="text"
                                                placeholder="Add label..."
                                                value={s.label || ''}
                                                onChange={(e) => onUpdate?.(s.id, { label: e.target.value })}
                                                className="w-full text-[10px] pl-4 font-medium text-slate-500 bg-transparent border-none outline-none focus:text-indigo-600 placeholder:text-slate-300"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 tabular-nums">
                                            {s.data.length} pts
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {bookmarks.length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                        <Tag size={10} className="text-indigo-400" />
                        Peak Bookmarks
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {bookmarks.map(bm => (
                            <div key={bm.id} className="group flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 transition-all">
                                <span className="text-[10px] font-bold text-indigo-600 tabular-nums">{bm.wavelength} nm</span>
                                <button
                                    onClick={() => bm.id && onDeleteBookmark(bm.id)}
                                    className="p-0.5 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
