import type { Spectrum } from './types'

export function exportToCSV(spectra: Spectrum[]) {
    if (spectra.length === 0) return

    // Find the longest dataset to determine the number of rows
    let maxLen = 0
    spectra.forEach(s => {
        if (s.data.length > maxLen) maxLen = s.data.length
    })

    let csvContent = 'data:text/csv;charset=utf-8,'

    // Headers
    const headers = spectra.flatMap(s => [`${s.sampleName} (X)`, `${s.sampleName} (Y)`])
    csvContent += headers.join(',') + '\n'

    // Data rows
    for (let i = 0; i < maxLen; i++) {
        const row = spectra.map(s => {
            const point = s.data[i]
            if (point) {
                return `${point.x},${point.y}`
            }
            return ',' // Empty for shorter datasets
        })
        csvContent += row.join(',') + '\n'
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `SpectraSphere_Export_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
