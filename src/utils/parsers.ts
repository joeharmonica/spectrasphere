import * as Papa from 'papaparse'



export interface ParsedFileData {
    filename: string;
    headers: string[];
    rows: any[][];
    suggestedMapping?: {
        xIndex: number;
        yIndex: number;
    }[];
    metadata?: Record<string, string>;
}

export async function parseFile(file: File): Promise<ParsedFileData | null> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            skipEmptyLines: 'greedy',
            complete: (results) => {
                try {
                    const data = results.data as string[][]
                    const parsedData = processRawCSVData(data, file.name)
                    resolve(parsedData)
                } catch (e) {
                    console.error("Parse error:", e)
                    resolve(null)
                }
            },
            error: (error) => {
                console.error("Papa Parse error:", error)
                reject(error)
            }
        })
    })
}

function processRawCSVData(data: string[][], filename: string): ParsedFileData {
    let startRow = 0;
    let headers: string[] = [];
    const metadata: Record<string, string> = {};

    // Try to find the first row that looks like numeric data or column headers
    for (let i = 0; i < data.length; i++) {
        const row = data[i].map(c => c?.trim() || '')
        const hasNumbers = row.some(c => !isNaN(parseFloat(c)) && c !== '')
        const looksLikeHeader = row.some(c =>
            /wavelength|nm|intensity|abs|energy|count|spectrum/i.test(c)
        )

        if (hasNumbers || looksLikeHeader) {
            startRow = i;
            // If this row has numbers, the headers might be the row before
            if (hasNumbers && !looksLikeHeader && i > 0) {
                headers = data[i - 1].map(c => c?.trim() || '')
                startRow = i;
            } else {
                headers = data[i].map(c => c?.trim() || '')
                startRow = i + 1;
            }
            break;
        }

        // Collect metadata from lines before data starts
        if (row.length >= 2 && row[0] && row[1]) {
            metadata[row[0].replace(':', '')] = row[1];
        }
    }

    const rows = data.slice(startRow).filter(row => row.some(c => c !== ''))

    // Auto-detect mappings
    const suggestedMapping: { xIndex: number, yIndex: number }[] = []

    // Check for "spectrum" JSON column first (R1F format)
    const spectrumColIdx = headers.findIndex(h => /spectrum/i.test(h))
    if (spectrumColIdx !== -1) {
        // This is a special case donde wavelength and intensity are inside a JSON string
        // We might want to flag this or handle it in the UI
    } else {
        // Standard XY detection
        let xIdx = headers.findIndex(h => /wavelength|nm|w\.l\.|x/i.test(h))
        let yIdx = headers.findIndex(h => /intensity|abs|a\.u\.|y/i.test(h))

        if (xIdx !== -1 && yIdx !== -1) {
            suggestedMapping.push({ xIndex: xIdx, yIndex: yIdx })
        } else if (headers.length >= 2) {
            // Default to first two columns
            suggestedMapping.push({ xIndex: 0, yIndex: 1 })
        }
    }

    return {
        filename,
        headers,
        rows,
        suggestedMapping,
        metadata
    };
}
