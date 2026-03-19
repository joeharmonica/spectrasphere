import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { Upload, FilePlus } from 'lucide-react'

interface Props {
    onImport: (files: FileList | File[]) => void;
}

export function FileImporter({ onImport }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return
        onImport(files)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Import Data</h2>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
            >
                <Upload size={18} />
                Import Spectra
            </button>
            <input
                type="file"
                multiple
                accept=".csv,.txt"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <div className="mt-3 text-xs text-slate-400 text-center flex items-center justify-center gap-1.5 border border-dashed border-slate-300 rounded-lg p-3 bg-white">
                <FilePlus size={16} />
                <span>Drag files anywhere to import</span>
            </div>
        </div>
    )
}
