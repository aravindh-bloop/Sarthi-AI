import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

export interface SettingsState {
    profile: {
        name: string;
        state: string;
        district: string;
        preferredCrops: string[];
        farmSize: 'small' | 'marginal' | 'medium' | 'large';
    };
    language: {
        appLanguage: string;
        textSize: 'small' | 'medium' | 'large';
        voiceAssistant: boolean;
        voiceLanguage: string;
        readAlerts: boolean;
    };
    alerts: {
        weather: boolean;
        cropHealth: boolean;
        schemes: boolean;
        tasks: boolean;
    };
    planning: {
        mode: 'conservative' | 'balanced' | 'aggressive';
        budgetStrictness: 'strict' | 'flexible';
        irrigation: 'water-saving' | 'yield';
    };
    data: {
        lowBandwidth: boolean;
        offlineMode: boolean;
        syncFreq: 'daily' | 'weekly';
    };
}

export const DEFAULT_SETTINGS: SettingsState = {
    profile: {
        name: '',
        state: '',
        district: '',
        preferredCrops: [],
        farmSize: 'small'
    },
    language: {
        appLanguage: 'en', // Default to English
        textSize: 'medium',
        voiceAssistant: false,
        voiceLanguage: 'en',
        readAlerts: false
    },
    alerts: {
        weather: true,
        cropHealth: true,
        schemes: true,
        tasks: true
    },
    planning: {
        mode: 'balanced',
        budgetStrictness: 'flexible',
        irrigation: 'yield'
    },
    data: {
        lowBandwidth: false,
        offlineMode: false,
        syncFreq: 'daily'
    }
};

interface SettingsContextType {
    settings: SettingsState;
    updateSettings: (newSettings: Partial<SettingsState> | ((prev: SettingsState) => SettingsState)) => void;
    saveSettings: () => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const { i18n } = useTranslation();
    const [settings, setSettings] = useState<SettingsState>(() => ({
        ...DEFAULT_SETTINGS,
        language: {
            ...DEFAULT_SETTINGS.language,
            appLanguage: i18n.language || 'en'
        }
    }));
    const [loading, setLoading] = useState(true);

    // Load settings when user changes
    useEffect(() => {
        const fetchSettings = async () => {
            if (!currentUser) {
                setSettings(DEFAULT_SETTINGS);
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().settings) {
                    const dbSettings = docSnap.data().settings;
                    setSettings(() => ({
                        ...DEFAULT_SETTINGS,
                        ...dbSettings,
                        profile: { ...DEFAULT_SETTINGS.profile, ...dbSettings.profile },
                        language: { ...DEFAULT_SETTINGS.language, ...dbSettings.language },
                        alerts: { ...DEFAULT_SETTINGS.alerts, ...dbSettings.alerts },
                        planning: { ...DEFAULT_SETTINGS.planning, ...dbSettings.planning },
                        data: { ...DEFAULT_SETTINGS.data, ...dbSettings.data },
                    }));
                } else {
                    // Initialize with profile name from auth if available
                    setSettings(() => ({
                        ...DEFAULT_SETTINGS,
                        profile: { ...DEFAULT_SETTINGS.profile, name: currentUser.displayName || '' }
                    }));
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [currentUser]);

    // Side Effects

    // 1. Language Change
    useEffect(() => {
        if (settings.language.appLanguage && i18n.language !== settings.language.appLanguage) {
            i18n.changeLanguage(settings.language.appLanguage);
        }
    }, [settings.language.appLanguage, i18n]);

    // 2. Text Size (Example of affecting app - simpler to do via class on body)
    useEffect(() => {
        document.body.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
        document.body.classList.add(`text-size-${settings.language.textSize}`);

        // You would need CSS for this, but for now just setting the class.
    }, [settings.language.textSize]);

    // Helper to update settings state in memory
    const updateSettings = (newSettings: Partial<SettingsState> | ((prev: SettingsState) => SettingsState)) => {
        setSettings(prev => {
            if (typeof newSettings === 'function') {
                return { ...prev, ...newSettings(prev) };
            }
            return { ...prev, ...newSettings };
        });
    };

    // Helper to save to Firestore
    const saveSettings = async () => {
        if (!currentUser) return;
        try {
            const docRef = doc(db, 'users', currentUser.uid);
            await setDoc(docRef, { settings }, { merge: true });
        } catch (error) {
            console.error("Error saving settings:", error);
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};
