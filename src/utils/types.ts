export interface DataPoint {
    x: number;
    y: number;
}

export interface Spectrum {
    id: string;
    filename: string;
    sampleName: string;
    label?: string;
    data: DataPoint[];
    visible: boolean;
    color: string;
    targetValue?: number;
    isCalibration?: boolean;
    metadata?: Record<string, any>;
}
