import { useLayoutEffect, useRef } from 'react'
import * as Plotly from 'plotly.js-dist'
import type { Spectrum } from '../utils/types'
import { Download, Share2 } from 'lucide-react'

interface Props {
    spectra: Spectrum[]
    viewMode: 'overlap' | 'stacked'
    viewType: '2d' | '3d'
}

export function SpectraPlot({ spectra, viewMode, viewType }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const visibleSpectra = spectra.filter(s => s.visible)

    useLayoutEffect(() => {
        if (!containerRef.current || visibleSpectra.length === 0) return

        let cumulativeOffset = 0
        const plotData = visibleSpectra.map((s, idx) => {
            const yRaw = s.data.map(d => d.y)
            const xData = s.data.map(d => d.x)

            if (viewType === '3d') {
                return {
                    x: xData,
                    y: s.data.map(() => idx),
                    z: yRaw,
                    type: 'scatter3d' as const,
                    mode: 'lines' as const,
                    name: s.sampleName || s.filename,
                    line: { color: s.color, width: 4 },
                    hoverinfo: 'x+y+z+name' as any
                }
            }

            let yData = yRaw
            if (viewMode === 'stacked') {
                yData = yRaw.map(y => y + cumulativeOffset)
                const minY = Math.min(...yRaw)
                const maxY = Math.max(...yRaw)
                const height = maxY - minY
                cumulativeOffset += height * 1.1
            }

            return {
                x: xData,
                y: yData,
                type: 'scatter' as const,
                mode: 'lines' as const,
                name: s.sampleName || s.filename,
                line: { color: s.color, width: 2 },
                hoverinfo: (viewMode === 'stacked' ? 'x+name' : 'all') as any
            }
        })

        const layout: any = {
            autosize: true,
            margin: { t: 40, r: 40, b: 60, l: 60 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            hovermode: 'closest',
            showlegend: true,
            legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' }
        }

        if (viewType === '3d') {
            layout.scene = {
                xaxis: { title: 'Wavelength' },
                yaxis: { title: 'Sample Index' },
                zaxis: { title: 'Intensity' },
                camera: { eye: { x: 1.5, y: 1.5, z: 1.5 } }
            }
        } else {
            layout.xaxis = {
                title: { text: 'Wavelength' },
                gridcolor: '#f1f5f9',
                zerolinecolor: '#cbd5e1',
                showline: true,
                linecolor: '#94a3b8',
                mirror: true
            }
            layout.yaxis = {
                title: { text: 'Intensity' },
                gridcolor: '#f1f5f9',
                zerolinecolor: '#cbd5e1',
                showline: true,
                linecolor: '#94a3b8',
                mirror: true
            }
        }

        Plotly.newPlot(containerRef.current, plotData, layout, {
            responsive: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d', 'toImage']
        })

        const handleResize = () => {
            if (containerRef.current) {
                Plotly.Plots.resize(containerRef.current)
            }
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            if (containerRef.current) {
                Plotly.purge(containerRef.current)
            }
        }
    }, [visibleSpectra, viewMode, viewType])

    const handleDownload = async () => {
        if (!Plotly || !containerRef.current) return
        await Plotly.downloadImage(containerRef.current, {
            format: 'png',
            width: 1200,
            height: 800,
            filename: `spectrasphere_export_${new Date().getTime()}`
        })
    }

    return (
        <div className="w-full h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-slate-800">
                        {viewType === '3d' ? '3D View' : (viewMode === 'overlap' ? 'Overlap View' : 'Stacked View')}
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Live Plot
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm mr-2">
                        {visibleSpectra.length} spectra shown
                    </div>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md border border-slate-200 text-xs font-semibold shadow-sm transition-all active:scale-95"
                    >
                        <Download size={14} className="text-indigo-600" />
                        Export Image
                    </button>
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md border border-slate-200 text-xs font-semibold shadow-sm transition-all opacity-50 cursor-not-allowed"
                        disabled
                    >
                        <Share2 size={14} className="text-slate-400" />
                        Share
                    </button>
                </div>
            </div>
            <div className="flex-1 relative w-full h-full">
                <div ref={containerRef} className="w-full h-full" />
                {visibleSpectra.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 border-dashed">
                                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 font-medium">No data to display</p>
                            <p className="text-sm text-slate-400 mt-1">Import some spectra first</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
