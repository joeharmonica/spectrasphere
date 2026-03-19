import { Activity, Layers, LayoutGrid } from 'lucide-react'

interface Props {
    viewMode: 'overlap' | 'stacked';
    onViewModeChange: (mode: 'overlap' | 'stacked') => void;
    viewType: '2d' | '3d';
    onViewTypeChange: (type: '2d' | '3d') => void;
}

export function Header({ viewMode, onViewModeChange, viewType, onViewTypeChange }: Props) {
    return (
        <header className="h-14 border-b border-slate-200 bg-white flex items-center px-6 shadow-sm z-20 shrink-0">
            <div className="flex items-center gap-2 text-indigo-600">
                <Activity size={24} strokeWidth={2.5} />
                <h1 className="text-xl font-bold tracking-tight text-slate-900">SpectraSphere</h1>
            </div>

            <div className="flex-1 flex justify-center">
                <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                    <button
                        onClick={() => onViewModeChange('overlap')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'overlap'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Layers size={16} />
                        Overlap View
                    </button>
                    <button
                        onClick={() => onViewModeChange('stacked')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'stacked'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <LayoutGrid size={16} />
                        Stacked View
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner mr-2">
                    <button
                        onClick={() => onViewTypeChange('2d')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${viewType === '2d' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        2D
                    </button>
                    <button
                        onClick={() => onViewTypeChange('3d')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${viewType === '3d' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        3D
                    </button>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                    Phase 2 Refinement
                </span>
            </div>
        </header>
    )
}
