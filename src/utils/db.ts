import Dexie, { type Table } from 'dexie';
import type { Spectrum } from './types';

export interface UserSetting {
    key: string;
    value: any;
}

export interface Bookmark {
    id?: number;
    wavelength: number;
    label?: string;
}

export class SpectraDatabase extends Dexie {
    spectra!: Table<Spectrum, string>;
    settings!: Table<UserSetting, string>;
    bookmarks!: Table<Bookmark, number>;

    constructor() {
        super('SpectraSphereDB');
        this.version(1).stores({
            spectra: 'id, filename, isCalibration',
            settings: 'key',
            bookmarks: '++id, wavelength'
        });
    }
}

export const db = new SpectraDatabase();
