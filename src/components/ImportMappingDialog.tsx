import { X, Check, Table, Info } from 'lucide-react'
import type { Spectrum } from '../utils/types'
import type { ParsedFileData } from '../utils/parsers'
import { useState } from 'react'
import { getNextColor } from '../utils/colors'

interface Props {
    fileData: ParsedFileData;
    onConfirm: (spectra: Spectrum[]) => void;
    onCancel: () => void;
}

interface ColumnMapping {
    name: string;
    xIndex: number;
    yIndex: number;
    enabled: boolean;
}

export function ImportMappingDialog({ fileData, onConfirm, onCancel }: Props) {
    const [mappings, setMappings] = useState<ColumnMapping[]>(() => {
        if (fileData.suggestedMapping?.length) {
            return fileData.suggestedMapping.map((m, i) => ({
                name: fileData.headers[m.yIndex] || `Series ${i + 1}`,
                xIndex: m.xIndex,
                yIndex: m.yIndex,
                enabled: true
            }))
        }
        return [{
            name: fileData.filename.replace('.csv', ''),
            xIndex: 0,
            yIndex: 1,
            enabled: true
        }]
    })

    const handleAddMapping = () => {
        setMappings(prev => [...prev, {
            name: `Series ${prev.length + 1}`,
            xIndex: 0,
            yIndex: 1,
            enabled: true
        }])
    }

    const handleRemoveMapping = (index: number) => {
        setMappings(prev => prev.filter((_, i) => i !== index))
    }

    const updateMapping = (index: number, updates: Partial<ColumnMapping>) => {
        setMappings(prev => prev.map((m, i) => i === index ? { ...m, ...updates } : m))
    }

    const handleConfirm = () => {
        const spectra: Spectrum[] = mappings
            .filter(m => m.enabled)
            .map(m => {
                const dataPoints = fileData.rows
                    .map(row => ({
                        x: parseFloat(row[m.xIndex]),
                        y: parseFloat(row[m.yIndex])
                    }))
                    .filter(p => !isNaN(p.x) && !isNaN(p.y))

                return {
                    id: Math.random().toString(36).substring(7),
                    filename: fileData.filename,
                    sampleName: m.name,
                    data: dataPoints,
                    visible: true,
                    color: getNextColor()
                }
            })
            .filter(s => s.data.length > 0)

        onConfirm(spectra)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Data Mapping</h2>
                        <p className="text-sm text-slate-500">Map columns to Wavelength and Intensity for <b>{fileData.filename}</b></p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Mapping Controls */}
                    <div className="w-1/3 border-r border-slate-100 overflow-y-auto p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Info size={16} className="text-indigo-500" />
                                Column Mapping
                            </h3>
                            <button
                                onClick={handleAddMapping}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                + Add Series
                            </button>
                        </div>

                        <div className="space-y-4">
                            {mappings.map((m, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                                    {mappings.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveMapping(idx)}
                                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Series Name</label>
                                        <input
                                            type="text"
                                            value={m.name}
                                            onChange={(e) => updateMapping(idx, { name: e.target.value })}
                                            className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Wavelength (X)</label>
                                            <select
                                                value={m.xIndex}
                                                onChange={(e) => updateMapping(idx, { xIndex: parseInt(e.target.value) })}
                                                className="w-full text-xs bg-white border border-slate-200 rounded-md px-1 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                {fileData.headers.map((h, i) => (
                                                    <option key={i} value={i}>{h || `Col ${i + 1}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Intensity (Y)</label>
                                            <select
                                                value={m.yIndex}
                                                onChange={(e) => updateMapping(idx, { yIndex: parseInt(e.target.value) })}
                                                className="w-full text-xs bg-white border border-slate-200 rounded-md px-1 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                {fileData.headers.map((h, i) => (
                                                    <option key={i} value={i}>{h || `Col ${i + 1}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Data Preview */}
                    <div className="flex-1 bg-slate-50/30 overflow-hidden flex flex-col">
                        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center gap-2">
                            <Table size={16} className="text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Preview (First 10 rows)</h3>
                        </div>
                        <div className="flex-1 overflow-auto p-6">
                            <table className="w-full text-xs border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr>
                                        {fileData.headers.map((h, i) => (
                                            <th key={i} className="px-3 py-2 text-left font-bold text-slate-600 border-b border-slate-200 whitespace-nowrap">
                                                {h || `Col ${i + 1}`}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fileData.rows.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-100/50 transition-colors">
                                            {row.map((cell, j) => (
                                                <td key={j} className="px-3 py-2 text-slate-500 border-b border-slate-100 whitespace-nowrap font-mono tabular-nums">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Check size={18} />
                        Import {mappings.filter(m => m.enabled).length} Series
                    </button>
                </div>
            </div>
        </div>
    )
}
