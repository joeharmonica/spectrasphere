import React, { useState, useMemo } from 'react'
import { Beaker, Play, BarChart3, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react'
import type { Spectrum } from '../utils/types'
import {
    runUnivariateAnalysis,
    runPLSAnalysis,
    runPCRAnalysis,
    compareAllModels,
    type AnalysisResult
} from '../utils/analysis'

interface Props {
    spectra: Spectrum[]
    onAnalysisComplete: (results: AnalysisResult[]) => void
    width?: number
}

export const AnalysisSidebar: React.FC<Props> = ({ spectra, onAnalysisComplete, width = 360 }) => {
    const [wavelength, setWavelength] = useState(1000)
    const [nComponents, setNComponents] = useState(3)
    const [applySNV, setApplySNV] = useState(true)
    const [applyDeriv, setApplyDeriv] = useState(true)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [kFolds, setKFolds] = useState(5)
    const [ranges, setRanges] = useState<{ start: number; end: number }[]>([])
    const [rangeInput, setRangeInput] = useState({ start: '', end: '' })
    const [error, setError] = useState<string | null>(null)

    const calibrationSpectra = useMemo(() =>
        spectra.filter(s => s.isCalibration && s.targetValue !== undefined),
        [spectra]
    )

    const calibCount = calibrationSpectra.length

    const handleRunAnalysis = async (type: 'univariate' | 'pls' | 'pcr' | 'all') => {
        setIsAnalyzing(true)
        setError(null)
        try {
            let res: AnalysisResult[] = []
            const options = {
                nComponents,
                snv: applySNV,
                derivative: applyDeriv,
                kFolds,
                wavelengthRanges: ranges
            }

            switch (type) {
                case 'univariate':
                    res = [await runUnivariateAnalysis(calibrationSpectra, wavelength)]
                    break
                case 'pls':
                    res = [await runPLSAnalysis(calibrationSpectra, options)]
                    break
                case 'pcr':
                    res = [await runPCRAnalysis(calibrationSpectra, options)]
                    break
                case 'all':
                    res = await compareAllModels(calibrationSpectra, {
                        plsComponents: nComponents,
                        pcrComponents: nComponents,
                        snv: applySNV,
                        derivative: applyDeriv,
                        wavelength
                    })
                    break
            }
            onAnalysisComplete(res)
        } catch (err: any) {
            setError(err.message || 'Analysis failed')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div
            className="bg-white border-l border-slate-200 flex flex-col shadow-sm z-10 overflow-hidden shrink-0"
            style={{ width }}
        >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Beaker size={14} className="text-indigo-500" />
                    Calibration & Analysis
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className={`p-3 rounded-xl border ${calibCount >= 2 ? 'border-emerald-100 bg-emerald-50/20' : 'border-amber-100 bg-amber-50/20'} transition-colors`}>
                    <div className="flex items-center gap-2 mb-1">
                        {calibCount >= 2 ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-amber-500" />}
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${calibCount >= 2 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {calibCount} Calibration Samples
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                        {calibCount < 2 ? 'Mark at least 2 spectra as calibration in library.' : 'Spectral patterns identified.'}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wavelength (Univariate)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={wavelength}
                                onChange={(e) => setWavelength(parseFloat(e.target.value))}
                                className="flex-1 text-xs font-semibold bg-slate-100 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/10"
                            />
                            <span className="text-[10px] font-bold text-slate-300">nm</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latent Variables</label>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{nComponents}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max={Math.max(1, calibCount - 1)}
                            value={nComponents}
                            onChange={(e) => setNComponents(parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                    </div>

                    <div className="space-y-2 py-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={applySNV}
                                    onChange={(e) => setApplySNV(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">Standard Normal Variate</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={applyDeriv}
                                onChange={(e) => setApplyDeriv(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">1st Derivative Filter</span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wavelength Windows</label>
                        <div className="space-y-2">
                            {ranges.map((r, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-600">{r.start} - {r.end} nm</span>
                                    <button
                                        onClick={() => setRanges(ranges.filter((_, idx) => idx !== i))}
                                        className="text-rose-500 hover:text-rose-700 text-[10px] items-center flex font-bold"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    placeholder="Start"
                                    type="number"
                                    value={rangeInput.start}
                                    onChange={(e) => setRangeInput({ ...rangeInput, start: e.target.value })}
                                    className="text-[10px] font-bold bg-slate-100 border-none rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-200"
                                />
                                <input
                                    placeholder="End"
                                    type="number"
                                    value={rangeInput.end}
                                    onChange={(e) => setRangeInput({ ...rangeInput, end: e.target.value })}
                                    className="text-[10px] font-bold bg-slate-100 border-none rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-200"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (rangeInput.start && rangeInput.end) {
                                        setRanges([...ranges, { start: parseFloat(rangeInput.start), end: parseFloat(rangeInput.end) }])
                                        setRangeInput({ start: '', end: '' })
                                    }
                                }}
                                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                                + Add View Window
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">K-Fold Validation</label>
                        <select
                            value={kFolds}
                            onChange={(e) => setKFolds(parseInt(e.target.value))}
                            className="w-full text-xs font-semibold bg-slate-100 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/10"
                        >
                            <option value={0}>No CV (Calibration Only)</option>
                            <option value={3}>3-Fold CV</option>
                            <option value={5}>5-Fold CV (Default)</option>
                            <option value={10}>10-Fold CV (Rigorous)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => handleRunAnalysis('univariate')}
                        disabled={calibCount < 2 || isAnalyzing}
                        className="flex flex-col items-center justify-center p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 transition-all active:scale-95 disabled:opacity-40"
                    >
                        <BarChart3 size={14} className="mb-1 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Linear</span>
                    </button>
                    <button
                        onClick={() => handleRunAnalysis('pls')}
                        disabled={calibCount < 2 || isAnalyzing}
                        className="flex flex-col items-center justify-center p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 transition-all active:scale-95 disabled:opacity-40"
                    >
                        <div className="mb-1 text-[10px] font-black text-slate-400">PLS</div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Regression</span>
                    </button>

                    <button
                        onClick={() => handleRunAnalysis('all')}
                        disabled={calibCount < 2 || isAnalyzing}
                        className="col-span-2 flex items-center justify-center gap-3 p-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-40"
                    >
                        {isAnalyzing ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Play size={14} fill="currentColor" />
                        )}
                        Run AI Benchmark
                    </button>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex gap-2 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight leading-normal">{error}</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-indigo-600 text-white rounded-t-3xl mt-auto">
                <div className="flex items-start gap-3">
                    <HelpCircle size={16} className="shrink-0 mt-0.5 opacity-60" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest">Training Data</p>
                        <p className="text-[11px] font-medium leading-relaxed opacity-90">
                            Only visible spectra with target values are used for calibration.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
