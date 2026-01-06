export type UserRole = 'farmer' | 'expert' | 'admin';

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: UserRole;
    language: 'en' | 'hi' | 'te' | 'ta'; // English, Hindi, Telugu, Tamil etc.
}

export interface FarmProfile {
    id: string;
    userId: string;
    name: string;
    location: {
        district: string;
        state: string;
        coordinates?: { lat: number; lng: number };
    };
    season: 'kharif' | 'rabi' | 'zaid';
    crops: string[];
    budget: number;
    areaSize: number; // in acres
    areaUnit: 'acre' | 'hectare';
}

export interface Task {
    id: string;
    farmId: string;
    type: 'sowing' | 'irrigation' | 'fertilization' | 'weeding' | 'harvest' | 'scouting';
    title: string;
    description: string;
    date: string; // ISO String
    status: 'pending' | 'completed' | 'skipped';
    isRiskAdjusted?: boolean;
    originalDate?: string;
}

export interface WeatherAlert {
    id: string;
    type: 'heatwave' | 'heavy_rain' | 'frost' | 'pest_risk';
    severity: 'low' | 'medium' | 'high';
    dateRange: { start: string; end: string };
    message: string;
    suggestedAction: string;
}
