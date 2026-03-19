import type { AnalysisResult } from './analysis';

export function generateFullHTMLReport(results: AnalysisResult[]): string {
    const timestamp = new Date().toLocaleString();

    const modelsHtml = results.map((res, i) => `
    <div class="card ${i === 0 ? 'highlight' : ''}">
      <div class="header">
        <span class="rank">#${i + i}</span>
        <h2>${res.modelName}</h2>
      </div>
      
      <div class="metrics">
        <div class="metric">
          <label>R-squared (R²)</label>
          <value>${res.r2.toFixed(4)}</value>
        </div>
        <div class="metric">
          <label>RMSEC</label>
          <value>${res.rmse.toFixed(4)}</value>
        </div>
        ${res.rmsecv ? `
        <div class="metric">
          <label>RMSECV</label>
          <value>${res.rmsecv.toFixed(4)}</value>
        </div>
        ` : ''}
      </div>

      <div class="summary-box">
        <h4>AI Summary</h4>
        <p>${res.summary}</p>
      </div>

      <table class="parity-table">
        <thead>
          <tr>
            <th>Actual</th>
            <th>Predicted</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          ${res.predictions.map(p => `
            <tr>
              <td>${p.actual.toFixed(2)}</td>
              <td>${p.predicted.toFixed(2)}</td>
              <td>${Math.abs(p.actual - p.predicted).toFixed(3)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SpectraSphere Research Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-dark: #3730a3;
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-200: #e2e8f0;
            --slate-500: #64748b;
            --slate-700: #334155;
            --slate-900: #0f172a;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--slate-50);
            color: var(--slate-900);
            margin: 0;
            padding: 40px 20px;
            line-height: 1.5;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        .main-header {
            margin-bottom: 40px;
            border-bottom: 2px solid var(--slate-200);
            padding-bottom: 20px;
        }

        .main-header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.025em;
        }

        .timestamp {
            font-size: 14px;
            color: var(--slate-500);
            font-weight: 600;
        }

        .card {
            background: white;
            border: 1px solid var(--slate-200);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .card.highlight {
            border-color: var(--primary);
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.1);
        }

        .header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
        }

        .rank {
            background: var(--slate-100);
            color: var(--primary);
            padding: 5px 12px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 14px;
        }

        h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
        }

        .metrics {
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
        }

        .metric label {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 800;
            color: var(--slate-500);
            letter-spacing: 0.05em;
            margin-bottom: 5px;
        }

        .metric value {
            font-size: 24px;
            font-weight: 800;
            color: var(--primary);
            font-variant-numeric: tabular-nums;
        }

        .summary-box {
            background: var(--slate-50);
            border-left: 4px solid var(--primary);
            padding: 20px;
            border-radius: 0 12px 12px 0;
            margin-bottom: 30px;
        }

        .summary-box h4 {
            margin: 0 0 10px 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--primary);
        }

        .summary-box p {
            margin: 0;
            font-size: 14px;
            color: var(--slate-700);
            font-style: italic;
        }

        .parity-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        .parity-table th {
            text-align: left;
            padding: 12px;
            background: var(--slate-50);
            border-bottom: 2px solid var(--slate-200);
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.025em;
            color: var(--slate-500);
        }

        .parity-table td {
            padding: 12px;
            border-bottom: 1px solid var(--slate-100);
            font-weight: 600;
        }

        .footer {
            text-align: center;
            margin-top: 60px;
            font-size: 12px;
            color: var(--slate-500);
            font-weight: 600;
        }

        @media print {
            body { padding: 0; background: white; }
            .card { break-inside: avoid; box-shadow: none; border-color: #eee; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="main-header">
            <p class="timestamp">SpectraSphere Research Export • Generated ${timestamp}</p>
            <h1>Analytical Benchmarking Report</h1>
        </div>
        
        ${modelsHtml}

        <div class="footer">
            Generated by SpectraSphere Professional • High-Resolution Spectral Analysis Suite
        </div>
    </div>
</body>
</html>
  `;
}

export function downloadReport(html: string) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SpectraSphere_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
