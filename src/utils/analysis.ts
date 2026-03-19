import { Matrix } from 'ml-matrix';
import { PLS } from 'ml-pls';
import { PCA } from 'ml-pca';
import { SimpleLinearRegression, MultivariateLinearRegression } from 'ml-regression';
import SavitzkyGolay from 'ml-savitzky-golay';
import type { Spectrum } from './types';

export interface AnalysisResult {
    modelName: string;
    r2: number;
    rmse: number;
    rmsecv?: number;
    predictions: { actual: number; predicted: number }[];
    coefficients?: number[];
    wavenumbers?: number[];
    summary: string;
}

/**
 * Standard Normal Variate (SNV) Preprocessing
 */
export function snv(data: number[][]): number[][] {
    return data.map(row => {
        const mean = row.reduce((a, b) => a + b, 0) / row.length;
        const std = Math.sqrt(row.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / row.length);
        return row.map(val => (val - mean) / (std || 1));
    });
}

/**
 * Savitzky-Golay Smoothing and Derivative
 */
export function savgol(data: number[][], options: { windowSize: number; polynomial: number; derivative: number }): number[][] {
    return data.map(row => SavitzkyGolay(row, 1, options));
}

/**
 * Calculate R-squared
 */
export function calculateR2(actual: number[], predicted: number[]): number {
    const meanActual = actual.reduce((a, b) => a + b, 0) / actual.length;
    const ssRes = actual.reduce((a, b, i) => a + Math.pow(b - predicted[i], 2), 0);
    const ssTot = actual.reduce((a, b) => a + Math.pow(b - meanActual, 2), 0);
    return ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
}

/**
 * Calculate Root Mean Square Error (RMSE)
 */
export function calculateRMSE(actual: number[], predicted: number[]): number {
    const mse = actual.reduce((a, b, i) => a + Math.pow(b - predicted[i], 2), 0) / actual.length;
    return Math.sqrt(mse);
}

/**
 * Univariate Analysis
 */
export function runUnivariateAnalysis(spectra: Spectrum[], wavelength: number): AnalysisResult {
    const calibSpectra = spectra.filter(s => s.isCalibration && s.targetValue !== undefined);
    if (calibSpectra.length < 2) throw new Error("At least 2 calibration samples required.");

    const X = calibSpectra.map(s => {
        const point = s.data.reduce((prev, curr) =>
            Math.abs(curr.x - wavelength) < Math.abs(prev.x - wavelength) ? curr : prev
        );
        return point.y;
    });
    const y = calibSpectra.map(s => s.targetValue!);

    const regression = new SimpleLinearRegression(X, y);
    const predictedY = X.map(val => regression.predict(val));
    const predictions = y.map((val, i) => ({ actual: val, predicted: predictedY[i] }));

    const r2 = calculateR2(y, predictedY);
    const rmse = calculateRMSE(y, predictedY);

    return {
        modelName: `Univariate (${wavelength} nm)`,
        r2,
        rmse,
        predictions,
        summary: generateSummary(`Univariate (${wavelength} nm)`, r2, rmse)
    };
}

export interface AnalysisOptions {
    nComponents?: number;
    snv: boolean;
    derivative: boolean;
    wavelengthRanges?: { start: number; end: number }[];
    kFolds?: number;
}

/**
 * Multivariate Analysis (PLS)
 */
export function runPLSAnalysis(spectra: Spectrum[], options: AnalysisOptions): AnalysisResult {
    const calibSpectra = spectra.filter(s => s.isCalibration && s.targetValue !== undefined);
    const numComp = options.nComponents || 3;
    if (calibSpectra.length < numComp + 1) {
        throw new Error(`At least ${numComp + 1} samples required for ${numComp} components.`);
    }

    let initialX = calibSpectra.map(s => s.data.map(d => d.y));
    const y = calibSpectra.map(s => s.targetValue!);
    const wavenumbers = calibSpectra[0].data.map(d => d.x);

    // 1. Preprocessing
    let X = initialX;
    if (options.snv) X = snv(X);
    if (options.derivative) X = savgol(X, { windowSize: 15, polynomial: 2, derivative: 1 });

    // 2. Feature Selection (Wavelength Ranges)
    if (options.wavelengthRanges && options.wavelengthRanges.length > 0) {
        const ranges = options.wavelengthRanges;
        const indices = wavenumbers.map((wl, i) => ranges.some(r => wl >= r.start && wl <= r.end) ? i : -1).filter(i => i !== -1);
        X = X.map(row => indices.map(idx => row[idx]));
    }

    // 3. Main Training
    const pls = new PLS({ latentVectors: numComp }, {} as any);
    pls.train(X, y);
    const predictedY = (pls.predict(X) as Matrix).to2DArray().map((val: any) => val[0]);
    const r2 = calculateR2(y, predictedY);
    const rmse = calculateRMSE(y, predictedY);

    // 4. Cross-Validation
    let rmsecv: number | undefined;
    if (options.kFolds && options.kFolds > 1) {
        const cvPredictions = performCV(X, y, options.kFolds, 'PLS', numComp);
        rmsecv = calculateRMSE(y, cvPredictions);
    }

    return {
        modelName: `PLS (${numComp} comp${options.snv ? ', SNV' : ''}${options.derivative ? ', 1st Deriv' : ''})`,
        r2,
        rmse,
        rmsecv,
        predictions: y.map((val, i) => ({ actual: val, predicted: predictedY[i] })),
        wavenumbers,
        summary: generateDetailedSummary("PLS", r2, rmse, rmsecv)
    };
}

/**
 * Multivariate Analysis (PCR - Principal Component Regression)
 */
export function runPCRAnalysis(spectra: Spectrum[], options: AnalysisOptions): AnalysisResult {
    const calibSpectra = spectra.filter(s => s.isCalibration && s.targetValue !== undefined);
    if (calibSpectra.length < 2) throw new Error("At least 2 calibration samples required.");

    let initialX = calibSpectra.map(s => s.data.map(d => d.y));
    const y = calibSpectra.map(s => s.targetValue!);
    const wavenumbers = calibSpectra[0].data.map(d => d.x);

    // 1. Preprocessing
    let X = initialX;
    if (options.snv) X = snv(X);
    if (options.derivative) X = savgol(X, { windowSize: 15, polynomial: 2, derivative: 1 });

    // 2. Feature Selection
    if (options.wavelengthRanges && options.wavelengthRanges.length > 0) {
        const ranges = options.wavelengthRanges;
        const indices = wavenumbers.map((wl, i) => ranges.some(r => wl >= r.start && wl <= r.end) ? i : -1).filter(i => i !== -1);
        X = X.map(row => indices.map(idx => row[idx]));
    }

    const pca = new PCA(X, { center: true, scale: true });
    const nPCs = options.nComponents || Math.min(X.length - 1, 5);
    const XReduced = pca.predict(X, { nComponents: nPCs }).to2DArray();

    const mlr = new MultivariateLinearRegression(XReduced, y.map(v => [v]));
    const predictedY = (mlr.predict(XReduced) as Matrix).to2DArray().map((val: any) => val[0]);

    const r2 = calculateR2(y, predictedY);
    const rmse = calculateRMSE(y, predictedY);

    // 3. Cross-Validation
    let rmsecv: number | undefined;
    if (options.kFolds && options.kFolds > 1) {
        const cvPredictions = performCV(X, y, options.kFolds, 'PCR', nPCs);
        rmsecv = calculateRMSE(y, cvPredictions);
    }

    return {
        modelName: `PCR (${nPCs} PCs${options.snv ? ', SNV' : ''}${options.derivative ? ', 1st Deriv' : ''})`,
        r2,
        rmse,
        rmsecv,
        predictions: y.map((val, i) => ({ actual: val, predicted: predictedY[i] })),
        summary: generateDetailedSummary("PCR", r2, rmse, rmsecv)
    };
}

function performCV(X: number[][], y: number[], k: number, type: 'PLS' | 'PCR', components: number): number[] {
    const predictions: number[] = new Array(y.length);
    const indices = Array.from({ length: y.length }, (_, i) => i);

    for (let i = 0; i < k; i++) {
        const testIdx = indices.filter(idx => idx % k === i);
        const trainIdx = indices.filter(idx => idx % k !== i);

        const XTrain = trainIdx.map(idx => X[idx]);
        const yTrain = trainIdx.map(idx => y[idx]);
        const XTest = testIdx.map(idx => X[idx]);

        if (type === 'PLS') {
            const model = new PLS({ latentVectors: components }, {} as any);
            model.train(XTrain, yTrain);
            const pred = (model.predict(XTest) as Matrix).to2DArray().map((v: any) => v[0]);
            testIdx.forEach((idx, j) => predictions[idx] = pred[j]);
        } else {
            const pca = new PCA(XTrain, { center: true, scale: true });
            const XR_Train = pca.predict(XTrain, { nComponents: components }).to2DArray();
            const XR_Test = pca.predict(XTest, { nComponents: components }).to2DArray();
            const mlr = new MultivariateLinearRegression(XR_Train, yTrain.map(v => [v]));
            const pred = (mlr.predict(XR_Test) as Matrix).to2DArray().map((v: any) => v[0]);
            testIdx.forEach((idx, j) => predictions[idx] = pred[j]);
        }
    }
    return predictions;
}

function generateDetailedSummary(name: string, r2: number, rmse: number, rmsecv?: number): string {
    let text = `The ${name} model shows ${r2 > 0.9 ? "strong" : "moderate"} calibration (R²=${r2.toFixed(3)}, RMSEC=${rmse.toFixed(3)}).`;
    if (rmsecv !== undefined) {
        const bias = Math.abs(rmsecv - rmse) / rmse;
        text += ` Cross-validation RMSECv is ${rmsecv.toFixed(3)}. `;
        if (bias > 0.2) {
            text += "Warning: High discrepancy between RMSEC and RMSECv suggests potential overfitting.";
        } else {
            text += "The low discrepancy suggests a robust, well-generalized model.";
        }
    }
    return text;
}

function generateSummary(name: string, r2: number, rmse: number): string {
    const quality = r2 > 0.98 ? "excellent" : r2 > 0.9 ? "very good" : r2 > 0.7 ? "moderate" : "weak";
    return `The ${name} model shows ${quality} performance with an R² of ${r2.toFixed(4)} and an error (RMSE) of ${rmse.toFixed(4)}. ` +
        `${r2 > 0.9 ? "This model is suitable for quantitative analysis." : "Consider adding more samples or adjusting preprocessing to improve accuracy."}`;
}

export interface BenchmarkingOptions {
    plsComponents: number;
    pcrComponents: number;
    snv: boolean;
    derivative: boolean;
    wavelength?: number;
}

/**
 * Benchmark all models
 */
export function compareAllModels(spectra: Spectrum[], options: BenchmarkingOptions): AnalysisResult[] {
    const results: AnalysisResult[] = [];
    const calibSpectra = spectra.filter(s => s.isCalibration && s.targetValue !== undefined);
    if (calibSpectra.length < 2) return [];

    // Univariate
    if (options.wavelength) {
        try { results.push(runUnivariateAnalysis(calibSpectra, options.wavelength)); } catch (e) { }
    }

    // PLS
    try {
        results.push(runPLSAnalysis(calibSpectra, {
            nComponents: options.plsComponents,
            snv: options.snv,
            derivative: options.derivative
        }));
    } catch (e) { }

    // PCR
    try {
        results.push(runPCRAnalysis(calibSpectra, {
            nComponents: options.pcrComponents,
            snv: options.snv,
            derivative: options.derivative
        }));
    } catch (e) { }

    // Opposite config to benchmark robustness
    try {
        results.push(runPLSAnalysis(calibSpectra, {
            nComponents: options.plsComponents,
            snv: !options.snv,
            derivative: !options.derivative
        }));
    } catch (e) { }

    return results.sort((a, b) => b.r2 - a.r2);
}
